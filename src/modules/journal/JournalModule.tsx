import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlus,
  IconArrowLeft,
  IconBook2,
  IconSparkles,
  IconNotebook,
  IconChevronRight,
  IconCheck,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconTrash,
  IconPalette,
} from '@tabler/icons-react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { JournalSidebar } from './components/JournalSidebar';
import { JournalEditor } from './components/JournalEditor';
import { JournalSettingsSidebar } from './components/JournalSettingsSidebar';
import { StickyNotes } from './components/StickyNotes';
import {
  STYLE_PRESETS,
  buildBlankEntry,
  wordCount,
  formatDateTime,
  isDirty,
  exportJson,
  type EntryMood,
  type EntryPageStyle,
  type EntryStylePreset,
} from './utils';

export default function JournalModule() {
  const {
    journals,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    showConfirm,
    setActiveModule,
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
      showConfirm: state.showConfirm,
      setActiveModule: state.setActiveModule,
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
    if (activeEntryId && !journals.some((entry) => entry.id === activeEntryId)) {
      setActiveEntryId(null);
    }
  }, [journals, activeEntryId]);

  useEffect(() => {
    if (activeEntry) {
      setTitle(activeEntry.title);
      setContent(activeEntry.content);
      setMood(activeEntry.mood);
      setTags(activeEntry.tags);
      setPageStyle(activeEntry.pageStyle);
      setLocation(activeEntry.location || '');
      setReminder(activeEntry.reminder || '');
      setStylePreset(activeEntry.stylePreset || 'calm');
      setFocusItems(activeEntry.focusList || []);
      setPreviewMode(false);
    } else {
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
      const matchesSearch = !searchValue || [entry.title, entry.content, entry.tags.join(' ')].join(' ').toLowerCase().includes(searchValue);
      const matchesTab = activeTab === 'all' ? true : entry.pinned;
      return matchesSearch && matchesTab;
    });
  }, [journals, search, activeTab]);

  const totalWords = useMemo(() => journals.reduce((count, entry) => count + wordCount(entry.content), 0), [journals]);
  const streakDays = useMemo(() => (journals.length === 0 ? 0 : Math.min(30, journals.length + 2)), [journals]);
  const checkedFocusItems = focusItems.filter((item) => item.checked).length;
  const focusCompletion = focusItems.length === 0 ? 0 : Math.round((checkedFocusItems / focusItems.length) * 100);

  const forceSave = async () => {
    if (!activeEntryId || !activeEntry) return;

    const nextState = { title, content, mood, tags, pageStyle, location, reminder, stylePreset, focusList: focusItems };
    if (!isDirty(activeEntry, nextState)) return;

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
    }, 1200);

    return () => {
      if (autoSaveTimer.current) {
        window.clearTimeout(autoSaveTimer.current);
      }
    };
  }, [title, content, mood, tags, pageStyle, location, reminder, stylePreset, focusItems, activeEntryId, activeEntry, updateJournalEntry]);

  const createEntry = () => {
    const entry = buildBlankEntry();
    addJournalEntry(entry);
    setActiveEntryId(entry.id);
    setPreviewMode(false);
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
    const next = focusItems.map((item, itemIndex) => (itemIndex === index ? { ...item, checked: !item.checked } : item));
    setFocusItems(next);
  };

  const removeFocusItem = (index: number) => {
    setFocusItems(focusItems.filter((_, itemIndex) => itemIndex !== index));
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

  const gridColsClass = `grid min-h-[calc(100vh-2rem)] gap-4 transition-all duration-300 ${
    isSettingsOpen ? 'xl:grid-cols-[1fr_320px]' : 'xl:grid-cols-1'
  }`;

  if (!activeEntryId || !activeEntry) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="flex min-h-[calc(100vh-2rem)] flex-col gap-6 text-left"
      >
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-text-primary">Journal Workspace</h2>
            <p className="text-xs text-text-secondary mt-1">Capture your thoughts, track daily goals, and review your reflection logs.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={createEntry} className="btn btn-primary btn-md flex items-center gap-2">
              <IconPlus size={16} />
              <span>New Journal Entry</span>
            </button>
            <button onClick={() => setActiveModule('dashboard')} className="btn btn-secondary btn-md flex items-center gap-2">
              <IconArrowLeft size={16} />
              <span>Back Home</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface rounded-3xl border border-border/70 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <IconBook2 size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-text-primary">{journals.length}</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Total Entries</p>
            </div>
          </div>
          <div className="bg-surface rounded-3xl border border-border/70 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <IconSparkles size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-text-primary">{streakDays} days</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Current Streak</p>
            </div>
          </div>
          <div className="bg-surface rounded-3xl border border-border/70 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <IconNotebook size={24} />
            </div>
            <div>
              <p className="text-2xl font-black text-text-primary">{totalWords}</p>
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">Total Words Written</p>
            </div>
          </div>
        </div>

        {/* Split grid for Journals Catalog + Sticky Notes Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <JournalSidebar
            filteredEntries={filteredEntries}
            search={search}
            setSearch={setSearch}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            createEntry={createEntry}
            setActiveEntryId={setActiveEntryId}
            deleteJournalEntry={deleteJournalEntry}
            showConfirm={showConfirm}
          />
          <StickyNotes
            journalStickyNotes={journalStickyNotes}
            addJournalStickyNote={addJournalStickyNote}
            updateJournalStickyNote={updateJournalStickyNote}
            deleteJournalStickyNote={deleteJournalStickyNote}
            isDark={resolvedTheme === 'dark'}
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex min-h-[calc(100vh-2rem)] flex-col gap-4"
    >
      <div className={gridColsClass}>
        {/* Center column (Workspace) */}
        <section className="relative group/workspace flex min-h-0 flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300">
          {/* Hover Expand Right Slider Handle */}
          {!isSettingsOpen && activeEntry && (
            <div className="absolute top-1/2 right-0 -translate-y-1/2 z-20 opacity-0 group-hover/workspace:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-5 h-10 rounded-l-full border-y border-l border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer"
                title="Expand Settings"
              >
                <IconChevronRight size={12} className="rotate-180" />
              </button>
            </div>
          )}
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-border/60 bg-surface px-5 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={forceSaveAndClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-alt text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                title="Back to Journal Catalog"
              >
                <IconArrowLeft size={18} />
              </button>

              <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Journal Workspace</p>
                <p className="text-[11px] text-text-secondary">{activeEntry ? formatDateTime(activeEntry.date) : 'No entry active'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface-alt px-3 py-1.5 text-[11px] font-semibold text-text-secondary">
                {saveStatus === 'saved' ? <IconCheck size={12} className="text-emerald-500" /> : <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Auto-save ready'}</span>
              </div>
              <button
                onClick={() => {
                  setPreviewMode((value) => !value);
                  void forceSave();
                }}
                className={`btn btn-secondary btn-md ${previewMode ? 'border-primary text-primary' : ''}`}
                disabled={!activeEntry}
              >
                <IconEye size={16} />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button onClick={togglePinned} className="btn btn-ghost btn-md btn-square" title="Pin entry" disabled={!activeEntry}>
                {activeEntry?.pinned ? <IconHeartFilled size={18} className="text-red-500" /> : <IconHeart size={18} />}
              </button>
              <button onClick={deleteCurrentEntry} className="btn btn-ghost btn-md btn-square text-red-500" title="Delete entry" disabled={!activeEntry}>
                <IconTrash size={18} />
              </button>

              {/* Right Settings Toggle button */}
              <button
                onClick={() => setIsSettingsOpen((open) => !open)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${
                  isSettingsOpen
                    ? 'border-primary/30 bg-primary/5 text-primary'
                    : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'
                }`}
                title="Toggle Styles & Settings"
              >
                <IconPalette size={18} />
              </button>
            </div>
          </div>

          {activeEntry && (
            <JournalEditor
              activeEntry={activeEntry}
              previewMode={previewMode}
              title={title}
              setTitle={setTitle}
              content={content}
              setContent={setContent}
              mood={mood}
              tags={tags}
              currentStyle={currentStyle}
              editorPaperStyle={editorPaperStyle}
              forceSave={forceSave}
            />
          )}
        </section>

        {/* Right Sidebar (Settings & Styling) */}
        {isSettingsOpen && activeEntry && (
          <JournalSettingsSidebar
            stylePreset={stylePreset}
            setStylePreset={setStylePreset}
            pageStyle={pageStyle}
            setPageStyle={setPageStyle}
            mood={mood}
            setMood={setMood}
            tags={tags}
            setTags={setTags}
            location={location}
            setLocation={setLocation}
            reminder={reminder}
            setReminder={setReminder}
            focusItems={focusItems}
            setFocusItems={setFocusItems}
            newFocusText={newFocusText}
            setNewFocusText={setNewFocusText}
            addFocusItem={addFocusItem}
            toggleFocusItem={toggleFocusItem}
            removeFocusItem={removeFocusItem}
            focusCompletion={focusCompletion}
            streakDays={streakDays}
            saveAsTemplate={saveAsTemplate}
            exportEntry={exportEntry}
            createEntry={createEntry}
            setIsSettingsOpen={setIsSettingsOpen}
            forceSave={forceSave}
          />
        )}
      </div>
    </motion.div>
  );
}
