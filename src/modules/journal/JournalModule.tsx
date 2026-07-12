import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlus,
  IconArrowLeft,
  IconBook2,
  IconSparkles,
  IconChevronRight,
  IconCheck,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconTrash,
  IconPalette,
  IconSearch,
  IconDownload,
  IconBell,
} from '@tabler/icons-react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
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

// Writing prompts list
const WRITING_PROMPTS = [
  "What did you learn about yourself today?",
  "What was the highlight of your day, and why?",
  "Write about a small win that made you smile today.",
  "What is a challenge you faced today and how did you handle it?",
  "What are three things you are grateful for right now?",
  "What is a goal you want to achieve this week?",
  "Describe today in three words.",
  "How do you feel right now? Free write about it.",
  "Who made a positive impact on your life today?"
];

// Document templates list
const TEMPLATES = [
  {
    name: 'Gratitude Diary',
    emoji: '🌸',
    title: 'Daily Gratitude',
    preset: 'calm' as const,
    mood: 'great' as const,
    content: `<h3>Gratitude Journal</h3><p>Take a moment to reflect on three things you are grateful for today:</p><ol><li><i>I am grateful for...</i></li><li><i>I am grateful for...</i></li><li><i>I am grateful for...</i></li></ol><p>What is one thing that would make today wonderful?</p><ul><li><i>Today would be wonderful if...</i></li></ul>`
  },
  {
    name: 'Daily Reflection',
    emoji: '✨',
    title: 'Daily Reflection Log',
    preset: 'warm' as const,
    mood: 'good' as const,
    content: `<h3>Daily Reflection Log</h3><p><b>1. What went well today?</b></p><ul><li></li></ul><p><b>2. What could have gone better?</b></p><ul><li></li></ul><p><b>3. What did I learn or discover today?</b></p><ul><li></li></ul>`
  },
  {
    name: 'Zen Journal',
    emoji: '🍃',
    title: 'Zen Journal Entry',
    preset: 'evergreen' as const,
    mood: 'good' as const,
    content: `<h3>Zen Journal Entry</h3><p>Clear your mind. Take a deep breath. Write whatever comes to your mind without judgment...</p>`
  },
  {
    name: 'Work Log',
    emoji: '💼',
    title: 'Work Wins & Progress',
    preset: 'ocean' as const,
    mood: 'good' as const,
    content: `<h3>Work Wins & Progress</h3><p><b>Today's Main Tasks:</b></p><ul><li></li></ul><p><b>Wins & Progress:</b></p><ul><li></li></ul><p><b>Blockers / Challenges:</b></p><ul><li></li></ul>`
  }
];

export default function JournalModule() {
  const {
    journals,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
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

  // Quick prompt generator action
  const handleRandomPrompt = () => {
    const prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
    const entry = buildBlankEntry(prompt);
    entry.content = `<h3>Writing Prompt</h3><p><i>${prompt}</i></p><br><p>Start drafting your reflection here...</p>`;
    entry.mood = 'good';
    addJournalEntry(entry);
    setActiveEntryId(entry.id);
  };

  // Create from structured templates action
  const handleCreateFromTemplate = (template: typeof TEMPLATES[0]) => {
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

  const gridColsClass = `grid min-h-[calc(100vh-2rem)] gap-4 transition-all duration-300 ${
    isSettingsOpen ? 'xl:grid-cols-[1fr_320px]' : 'xl:grid-cols-1'
  }`;

  // Find Featured entry (pinned, or most recent)
  const featuredEntry = useMemo(() => {
    return journals.find((j) => j.pinned) || journals[0] || null;
  }, [journals]);

  // Extract recent 6 entries (excluding featured if possible, or just recent list)
  const recentLogs = useMemo(() => {
    return filteredEntries
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [filteredEntries]);

  // Render SVG mood illustrations dynamically (Day Schedule visual card items style)
  const renderMoodIllustration = (entryMood: string) => {
    switch (entryMood) {
      case 'great':
        return (
          <svg className="w-16 h-16 text-amber-500/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42" strokeLinecap="round" />
          </svg>
        );
      case 'good':
        return (
          <svg className="w-16 h-16 text-amber-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
            <path d="M16 14a4 4 0 01-8 0" strokeLinecap="round" />
          </svg>
        );
      case 'meh':
        return (
          <svg className="w-16 h-16 text-sky-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        );
      case 'bad':
        return (
          <svg className="w-16 h-16 text-indigo-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path d="M8 20v2M12 20v2M16 20v2" strokeLinecap="round" />
          </svg>
        );
      case 'terrible':
        return (
          <svg className="w-16 h-16 text-stone-500/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            <path d="M13 16l-2 3h3l-2 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg className="w-16 h-16 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
          </svg>
        );
    }
  };

  if (!activeEntryId || !activeEntry) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ type: 'spring', damping: 24, stiffness: 280 }}
        className="flex min-h-[calc(100vh-2rem)] flex-col gap-6 text-left relative overflow-y-auto px-1 py-2"
      >
        {/* Ambient background light */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />

        {/* Terracotta-style Catalog Header */}
        <div className="relative max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-subtle">
                <IconBook2 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-text-primary">Journal Workspace</h1>
            </div>
            <p className="text-xs text-text-secondary mt-1 font-medium pl-0.5">
              Reflect, draft notes, and build streaks inspired by warm editorial layouts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input (Header center/right alignment) */}
            <div className="relative w-full md:w-64">
              <IconSearch className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search thoughts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-border rounded-full pl-9 pr-3.5 py-1.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-all shadow-subtle"
              />
            </div>
            
            {/* Notification Badge Bell */}
            <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer relative shadow-subtle border-none">
              <IconBell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6 items-start relative">
          
          {/* Left Column (featured + recent entries) */}
          <div className="lg:col-span-2 flex flex-col gap-6 w-full">
            
            {/* Featured Entry Section */}
            <div className="flex gap-4 items-start w-full">
              {/* Featured Entry Card */}
              <div className="flex-1 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-surface border border-rose-200/20 p-6 min-h-[220px] flex flex-col justify-between hover:shadow-lifted transition-all duration-200 group">
                {/* Wavy vector overlay */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-20 80 C40 100, 90 60, 140 90 C190 120, 220 70, 270 100 C320 130, 340 90, 380 110" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="300" cy="50" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  </svg>
                </div>

                {featuredEntry ? (
                  <>
                    <div className="relative z-10">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                        {featuredEntry.pinned ? 'Pinned Memory' : 'Latest Reflection'}
                      </span>
                      <h3 className="text-xl font-black text-text-primary tracking-tight mt-2.5 group-hover:text-primary transition-colors line-clamp-1">
                        {featuredEntry.title || 'Untitled Entry'}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-1.5 line-clamp-2 max-w-md font-medium">
                        {(featuredEntry.content || '').replace(/<[^>]*>/g, '').trim() || 'Start drafting your thoughts...'}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-border/30 pt-3 mt-4">
                      <span className="text-[10px] font-bold text-text-muted">
                        {formatDateTime(featuredEntry.date)}
                      </span>
                      <button
                        onClick={() => setActiveEntryId(featuredEntry.id)}
                        className="flex items-center gap-1 bg-primary hover:bg-primary-muted text-white text-[10px] font-bold px-3.5 py-2 rounded-full transition-all cursor-pointer shadow-subtle border-none active:scale-95"
                      >
                        <span>Open Entry</span>
                        <IconChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center py-6 text-center text-text-muted">
                    <IconBook2 className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-xs font-bold text-text-primary">No memories logged yet</p>
                    <p className="text-[10px] max-w-[200px] mt-0.5 leading-normal">
                      Click the buttons on the right to start drafting your catalog.
                    </p>
                  </div>
                )}
              </div>

              {/* Vertical Pills stack (Visual small icon pills column next to featured card) */}
              <div className="flex flex-col gap-2 shrink-0">
                {/* Plus / Add Pill */}
                <button
                  onClick={createEntry}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle border-none"
                  title="New Entry"
                >
                  <IconPlus className="w-4.5 h-4.5 text-primary" />
                </button>
                {/* Favorites Toggle Pill */}
                <button
                  onClick={() => setActiveTab(activeTab === 'all' ? 'favorites' : 'all')}
                  className={`flex items-center justify-center w-11 h-11 rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-subtle border-none ${
                    activeTab === 'favorites'
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                  title="Toggle Pinned View"
                >
                  {activeTab === 'favorites' ? <IconHeartFilled className="w-4.5 h-4.5" /> : <IconHeart className="w-4.5 h-4.5 text-rose-500" />}
                </button>
                {/* Random Prompt Pill */}
                <button
                  onClick={handleRandomPrompt}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle border-none"
                  title="Daily Reflection Prompt"
                >
                  <IconSparkles className="w-4.5 h-4.5 text-amber-500" />
                </button>
                {/* Backup Catalog Download Pill */}
                <button
                  onClick={() => exportJson('focusflow-journal-export.json', journals)}
                  className="flex items-center justify-center w-11 h-11 rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle border-none"
                  title="Export Backup Log"
                >
                  <IconDownload className="w-4.5 h-4.5 text-blue-500" />
                </button>
              </div>
            </div>

            {/* Recent Logs List ("Day Schedule" section) */}
            <div className="flex flex-col gap-3 w-full">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Recent Logs</span>
              
              <div className="flex items-center gap-4 overflow-x-auto pb-2.5 scrollbar-none scroll-smooth">
                {recentLogs.length === 0 ? (
                  <div className="w-full py-8 text-center text-xs text-text-muted border border-dashed border-border/50 rounded-2xl italic">
                    No journal entries found.
                  </div>
                ) : (
                  recentLogs.map((entry) => {
                    const clean = (entry.content || '').replace(/<[^>]*>/g, '').trim();
                    const snippet = clean ? (clean.length > 50 ? clean.slice(0, 50) + '...' : clean) : 'No description...';
                    
                    return (
                      <div
                        key={entry.id}
                        onClick={() => setActiveEntryId(entry.id)}
                        className="bg-surface-alt hover:bg-surface-hover border border-border hover:border-primary/20 rounded-[28px] p-5 shadow-subtle min-w-[210px] w-[210px] shrink-0 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lifted flex flex-col justify-between min-h-[170px]"
                      >
                        {/* Custom mood-based SVG visual illustration */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9px] font-bold text-text-muted">
                            {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="w-12 h-12 rounded-2xl bg-surface/50 border border-border flex items-center justify-center shrink-0">
                            {renderMoodIllustration(entry.mood)}
                          </div>
                        </div>

                        {/* Title & Preview details */}
                        <div className="mt-3.5">
                          <h4 className="text-xs font-bold text-text-primary truncate" title={entry.title}>
                            {entry.title || 'Untitled Entry'}
                          </h4>
                          <p className="text-[10px] text-text-secondary leading-normal line-clamp-2 mt-1 font-medium">
                            {snippet}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Right Column (profile + sticky notes + templates) */}
          <div className="lg:col-span-1 flex flex-col gap-6 w-full">
            
            {/* User Stats Card (Jack's avatar profile card) */}
            <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 border border-neutral-800 rounded-3xl p-5 shadow-lifted text-stone-100 flex items-center gap-4 group">
              {/* Profile emoji avatar */}
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shrink-0">
                👨‍💻
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white truncate">Daily Writer</h3>
                  <span className="text-[9px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                    🔥 {streakDays}d
                  </span>
                </div>
                {/* Stats list details */}
                <div className="flex gap-4 mt-2 text-[9px] font-bold text-stone-400">
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-black">{journals.length}</span>
                    <span>Logs</span>
                  </div>
                  <div className="w-[1px] bg-white/10 h-6 align-middle self-center" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-black">
                      {totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
                    </span>
                    <span>Words</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Redesigned Sticky Notes List */}
            <StickyNotes
              journalStickyNotes={journalStickyNotes}
              addJournalStickyNote={addJournalStickyNote}
              updateJournalStickyNote={updateJournalStickyNote}
              deleteJournalStickyNote={deleteJournalStickyNote}
              isDark={resolvedTheme === 'dark'}
            />

            {/* Writing Templates Slider ("Party planning" section) */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Writing Templates</span>
              
              <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
                {TEMPLATES.map((tmpl) => (
                  <div
                    key={tmpl.name}
                    onClick={() => handleCreateFromTemplate(tmpl)}
                    className="bg-surface border border-border hover:border-primary/20 rounded-2xl p-3 shadow-subtle min-w-[130px] w-[130px] shrink-0 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center text-center gap-2"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center text-lg shrink-0">
                      {tmpl.emoji}
                    </div>
                    <span className="text-[10px] font-bold text-text-primary leading-tight">
                      {tmpl.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </motion.div>
    );
  }

  // Immersive Editor Workspace View (mounted when an entry is active)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex min-h-[calc(100vh-2rem)] flex-col gap-4"
    >
      <div className={gridColsClass}>
        {/* Center column (Workspace Editor) */}
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
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-alt text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary border-none cursor-pointer"
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
              <button onClick={togglePinned} className="btn btn-ghost btn-md btn-square border-none" title="Pin entry" disabled={!activeEntry}>
                {activeEntry?.pinned ? <IconHeartFilled size={18} className="text-red-500" /> : <IconHeart size={18} />}
              </button>
              <button onClick={deleteCurrentEntry} className="btn btn-ghost btn-md btn-square text-red-500 border-none" title="Delete entry" disabled={!activeEntry}>
                <IconTrash size={18} />
              </button>

              {/* Right Settings Toggle button */}
              <button
                onClick={() => setIsSettingsOpen((open) => !open)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all cursor-pointer ${
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

        {/* Right Sidebar (Settings & Styling Options) */}
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
