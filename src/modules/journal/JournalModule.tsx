import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import {
  STYLE_PRESETS,
  buildBlankEntry,
  wordCount,
  isDirty,
  exportJson,
  type EntryMood,
  type EntryPageStyle,
  type EntryStylePreset,
} from './utils';
import { WRITING_PROMPTS, TEMPLATES } from './constants';
import { JournalCatalogView } from './components/JournalCatalogView';
import { JournalWorkspaceView } from './components/JournalWorkspaceView';

export default function JournalModule() {
  const {
    journals,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    fetchJournalDetail,
    showConfirm,
    theme,
    journalStickyNotes,
    addJournalStickyNote,
    updateJournalStickyNote,
    deleteJournalStickyNote,
  } = useAppStore(
    useShallow((state) => ({
      journals: state.journals,
      addJournalEntry: state.addJournalEntry,
      updateJournalEntry: state.updateJournalEntry,
      deleteJournalEntry: state.deleteJournalEntry,
      fetchJournalDetail: state.fetchJournalDetail,
      showConfirm: state.showConfirm,
      theme: state.theme,
      journalStickyNotes: state.journalStickyNotes,
      addJournalStickyNote: state.addJournalStickyNote,
      updateJournalStickyNote: state.updateJournalStickyNote,
      deleteJournalStickyNote: state.deleteJournalStickyNote,
    })),
  );

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    if (theme === 'system') {
      return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      media.addEventListener('change', listener);
      setResolvedTheme(media.matches ? 'dark' : 'light');
      return () => media.removeEventListener('change', listener);
    } else {
      setResolvedTheme(theme === 'dark' ? 'dark' : 'light');
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<EntryMood>('good');
  const [tags, setTags] = useState<string[]>([]);
  const [pageStyle, setPageStyle] = useState<EntryPageStyle>('default');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('');
  const [stylePreset, setStylePreset] = useState<EntryStylePreset>('calm');
  const [focusItems, setFocusItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [newFocusText, setNewFocusText] = useState('');

  const autoSaveTimer = useRef<number | null>(null);

  const activeEntry = useMemo(
    () => journals.find((entry) => entry.id === activeEntryId) || null,
    [journals, activeEntryId],
  );

  useEffect(() => {
    if (activeEntryId) {
      void fetchJournalDetail(activeEntryId);
    }
  }, [activeEntryId, fetchJournalDetail]);

  useEffect(() => {
    if (activeEntryId && !journals.some((entry) => entry.id === activeEntryId)) {
      setActiveEntryId(null);
    }
  }, [journals, activeEntryId]);

  const lastActiveEntryIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeEntry) {
      const isDifferentEntry = lastActiveEntryIdRef.current !== activeEntry.id;
      lastActiveEntryIdRef.current = activeEntry.id;

      if (isDifferentEntry) {
        setTitle(activeEntry.title);
        setContent(activeEntry.content);
        setMood(activeEntry.mood || 'good');
        setTags(activeEntry.tags || []);
        setPageStyle(activeEntry.pageStyle || 'blank');
        setLocation(activeEntry.location || '');
        setReminder(activeEntry.reminder || '');
        setStylePreset(activeEntry.stylePreset || 'calm');
        setFocusItems(activeEntry.focusList || []);
        setPreviewMode(false);
      }
    } else {
      lastActiveEntryIdRef.current = null;
      setTitle('');
      setContent('');
      setMood('good');
      setTags([]);
      setPageStyle('default');
      setLocation('');
      setReminder('');
      setStylePreset('calm');
      setFocusItems([]);
    }
  }, [activeEntry]);

  const currentStyle = useMemo(() => {
    const preset = STYLE_PRESETS.find((p) => p.id === stylePreset) ?? STYLE_PRESETS[0];
    if (resolvedTheme === 'dark') {
      const darkOverrides: Record<EntryStylePreset, { surface: string; paperBg: string }> = {
        calm: {
          surface: 'linear-gradient(135deg, rgba(39, 20, 24, 0.95), rgba(24, 24, 27, 0.98))',
          paperBg: '#1c1517',
        },
        warm: {
          surface: 'linear-gradient(135deg, rgba(38, 30, 18, 0.95), rgba(24, 24, 27, 0.98))',
          paperBg: '#1c1812',
        },
        evergreen: {
          surface: 'linear-gradient(135deg, rgba(18, 38, 24, 0.95), rgba(24, 24, 27, 0.98))',
          paperBg: '#111a14',
        },
        ocean: {
          surface: 'linear-gradient(135deg, rgba(18, 28, 48, 0.95), rgba(24, 24, 27, 0.98))',
          paperBg: '#121722',
        },
      };
      return {
        ...preset,
        ...darkOverrides[preset.id],
      };
    }
    return preset;
  }, [stylePreset, resolvedTheme]);

  const filteredEntries = useMemo(() => {
    return journals.filter((entry) => {
      const searchValue = search.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        [entry.title, entry.content, entry.tags.join(' ')].join(' ').toLowerCase().includes(searchValue);
      const matchesTab = activeTab === 'all' ? true : entry.pinned;
      return matchesSearch && matchesTab;
    });
  }, [journals, search, activeTab]);

  const totalWords = useMemo(
    () => journals.reduce((count, entry) => count + wordCount(entry.content), 0),
    [journals],
  );
  const streakDays = useMemo(
    () => (journals.length === 0 ? 0 : Math.min(30, journals.length + 2)),
    [journals],
  );
  const checkedFocusItems = focusItems.filter((item) => item.checked).length;
  const focusCompletion =
    focusItems.length === 0 ? 0 : Math.round((checkedFocusItems / focusItems.length) * 100);

  const forceSave = async () => {
    if (!activeEntryId || !activeEntry) return;

    const nextState = { title, content, mood, tags, pageStyle, location, reminder, stylePreset, focusList: focusItems };
    if (!isDirty(activeEntry, nextState)) return;

    if (!title.trim() && !content.trim()) return;

    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    setSaveStatus('saving');
    try {
      await updateJournalEntry(activeEntryId, nextState as Partial<JournalEntry>);
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus('idle'), 2400);
    } catch {
      setSaveStatus('error');
    }
  };

  const forceSaveAndClose = async () => {
    await forceSave();
    setActiveEntryId(null);
  };

  useEffect(() => {
    if (!activeEntryId || !activeEntry) return;

    const nextState = { title, content, mood, tags, pageStyle, location, reminder, stylePreset, focusList: focusItems };
    if (!isDirty(activeEntry, nextState)) return;

    if (!title.trim() && !content.trim()) return;

    if (autoSaveTimer.current) {
      window.clearTimeout(autoSaveTimer.current);
    }

    setSaveStatus('saving');
    autoSaveTimer.current = window.setTimeout(() => {
      updateJournalEntry(activeEntryId, nextState as Partial<JournalEntry>)
        .then(() => {
          setSaveStatus('saved');
          window.setTimeout(() => setSaveStatus('idle'), 2400);
        })
        .catch(() => setSaveStatus('error'));
    }, 800);

    return () => {
      if (autoSaveTimer.current) {
        window.clearTimeout(autoSaveTimer.current);
      }
    };
  }, [
    title,
    content,
    mood,
    tags,
    pageStyle,
    location,
    reminder,
    stylePreset,
    focusItems,
    activeEntryId,
    activeEntry,
    updateJournalEntry,
  ]);

  const [isCreatingEntry, setIsCreatingEntry] = useState(false);

  const createEntry = async () => {
    if (isCreatingEntry) return;
    setIsCreatingEntry(true);
    try {
      const baseTitle = 'New Journal Entry';
      let candidateTitle = baseTitle;
      let counter = 1;
      while (journals.some((j) => j.title.toLowerCase() === candidateTitle.toLowerCase())) {
        candidateTitle = `${baseTitle} (${counter})`;
        counter++;
      }

      const entry = {
        ...buildBlankEntry(),
        title: candidateTitle,
      };
      await addJournalEntry(entry);
      setActiveEntryId(entry.id);
      setPreviewMode(false);

      requestAnimationFrame(() => {
        const titleInput = document.getElementById('journal-entry-title-input') as HTMLInputElement | null;
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      });
    } finally {
      setIsCreatingEntry(false);
    }
  };

  const saveAsTemplate = () => {
    if (!activeEntry) return;
    const entry = {
      ...activeEntry,
      id: crypto.randomUUID(),
      title: `${activeEntry.title || 'Journal Entry'} Template`,
      date: new Date().toISOString(),
      pinned: false,
    };
    addJournalEntry(entry);
    setActiveEntryId(entry.id);
    setPreviewMode(false);
  };

  const exportEntry = () => {
    if (!activeEntry) return;
    exportJson(`${activeEntry.title || 'journal-entry'}.json`, activeEntry);
  };

  const deleteCurrentEntry = () => {
    if (!activeEntry) return;
    showConfirm('Delete Entry', 'Are you sure you want to delete this journal entry?', async () => {
      await deleteJournalEntry(activeEntry.id);
      const remaining = journals.filter((entry) => entry.id !== activeEntry.id);
      setActiveEntryId(remaining[0]?.id ?? null);
    });
  };

  const togglePinned = () => {
    if (!activeEntry) return;
    updateJournalEntry(activeEntry.id, { pinned: !activeEntry.pinned });
  };

  const addFocusItem = () => {
    const nextText = newFocusText.trim();
    if (!nextText) return;
    const next = [...focusItems, { text: nextText, checked: false }];
    setFocusItems(next);
    setNewFocusText('');
  };

  const toggleFocusItem = (index: number) => {
    const next = focusItems.map((item, itemIndex) =>
      itemIndex === index ? { ...item, checked: !item.checked } : item,
    );
    setFocusItems(next);
  };

  const removeFocusItem = (index: number) => {
    setFocusItems(focusItems.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleRandomPrompt = () => {
    const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    const entry = buildBlankEntry(prompt);
    entry.content = `<h3>Writing Prompt</h3><p><i>${prompt}</i></p><br><p>Start drafting your reflection here...</p>`;
    entry.mood = 'good';
    addJournalEntry(entry);
    setActiveEntryId(entry.id);
  };

  const handleCreateFromTemplate = (template: (typeof TEMPLATES)[0]) => {
    const entry = buildBlankEntry(template.title);
    entry.content = template.content;
    entry.stylePreset = template.preset;
    entry.mood = template.mood;
    addJournalEntry(entry);
    setActiveEntryId(entry.id);
  };

  const editorPaperStyle =
    pageStyle === 'lines'
      ? {
          backgroundImage: 'linear-gradient(to bottom, rgba(148, 163, 184, 0.20) 1px, transparent 1px)',
          backgroundSize: '100% 28px',
          backgroundColor: currentStyle.paperBg,
        }
      : pageStyle === 'grid'
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundColor: currentStyle.paperBg,
        }
      : pageStyle === 'dotted'
      ? {
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          backgroundColor: currentStyle.paperBg,
        }
      : pageStyle === 'cornell'
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.12) 72px, transparent 72px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
          backgroundSize: '100% 30px, 100% 30px',
          backgroundColor: currentStyle.paperBg,
        }
      : { backgroundColor: currentStyle.paperBg };

  const featuredEntry = useMemo(() => {
    return journals.find((j) => j.pinned) || journals[0] || null;
  }, [journals]);

  const recentLogs = useMemo(() => {
    return filteredEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [filteredEntries]);

  // 1. Catalog / Dashboard View
  if (!activeEntryId || !activeEntry) {
    return (
      <JournalCatalogView
        journals={journals}
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        featuredEntry={featuredEntry}
        recentLogs={recentLogs}
        streakDays={streakDays}
        totalWords={totalWords}
        setActiveEntryId={setActiveEntryId}
        createEntry={createEntry}
        handleRandomPrompt={handleRandomPrompt}
        handleCreateFromTemplate={handleCreateFromTemplate}
      />
    );
  }

  // 2. Immersive Editor Workspace View
  return (
    <JournalWorkspaceView
      activeEntry={activeEntry}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      saveStatus={saveStatus}
      title={title}
      setTitle={setTitle}
      content={content}
      setContent={setContent}
      mood={mood}
      setMood={setMood}
      tags={tags}
      setTags={setTags}
      location={location}
      setLocation={setLocation}
      reminder={reminder}
      setReminder={setReminder}
      stylePreset={stylePreset}
      setStylePreset={setStylePreset}
      pageStyle={pageStyle}
      setPageStyle={setPageStyle}
      focusItems={focusItems}
      setFocusItems={setFocusItems}
      newFocusText={newFocusText}
      setNewFocusText={setNewFocusText}
      addFocusItem={addFocusItem}
      toggleFocusItem={toggleFocusItem}
      removeFocusItem={removeFocusItem}
      focusCompletion={focusCompletion}
      streakDays={streakDays}
      currentStyle={currentStyle}
      editorPaperStyle={editorPaperStyle}
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
      forceSave={forceSave}
      forceSaveAndClose={forceSaveAndClose}
      togglePinned={togglePinned}
      deleteCurrentEntry={deleteCurrentEntry}
      saveAsTemplate={saveAsTemplate}
      exportEntry={exportEntry}
      createEntry={createEntry}
      journalStickyNotes={journalStickyNotes}
      addJournalStickyNote={addJournalStickyNote}
      updateJournalStickyNote={updateJournalStickyNote}
      deleteJournalStickyNote={deleteJournalStickyNote}
      resolvedTheme={resolvedTheme}
    />
  );
}
