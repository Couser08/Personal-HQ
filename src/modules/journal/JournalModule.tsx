import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconArrowLeft,
  IconBell,
  IconBook2,
  IconCheck,
  IconChevronRight,
  IconDownload,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconMoodSmile,
  IconNotebook,
  IconPencil,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTag,
  IconTrash,
  IconPalette,
  IconX,
} from '@tabler/icons-react';
import type { JournalStickyNote } from '../../lib/db';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { EmptyState } from '../../components/ui/EmptyState';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { TagInput } from '../../components/ui/TagInput';

type EntryMood = JournalEntry['mood'];
type EntryPageStyle = JournalEntry['pageStyle'];
type EntryStylePreset = JournalEntry['stylePreset'];

const STYLE_PRESETS: Array<{
  id: EntryStylePreset;
  label: string;
  caption: string;
  accent: string;
  glow: string;
  surface: string;
  paperBg: string;
}> = [
  {
    id: 'calm',
    label: 'Calm',
    caption: 'Soft neutral paper',
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 247, 248, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#fffbfb',
  },
  {
    id: 'warm',
    label: 'Warm',
    caption: 'Amber note card',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 250, 242, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#fffdf8',
  },
  {
    id: 'evergreen',
    label: 'Evergreen',
    caption: 'Quiet editorial green',
    accent: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.16)',
    surface: 'linear-gradient(135deg, rgba(244, 250, 245, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#f8fdf9',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    caption: 'Cool glass paper',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.16)',
    surface: 'linear-gradient(135deg, rgba(243, 248, 255, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#f6fafe',
  },
];

const MOOD_OPTIONS: Array<{ value: EntryMood; label: string }> = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'meh', label: 'Meh' },
  { value: 'bad', label: 'Bad' },
  { value: 'terrible', label: 'Terrible' },
];

const PAGE_STYLE_OPTIONS: Array<{ value: EntryPageStyle; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'lines', label: 'Lines' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'grid', label: 'Grid' },
  { value: 'cornell', label: 'Cornell' },
];


const buildBlankEntry = (title = 'New Journal Entry'): JournalEntry => ({
  id: crypto.randomUUID(),
  title,
  content: '',
  date: new Date().toISOString(),
  mood: 'good',
  tags: [],
  images: [],
  pinned: false,
  reflection: { whatWentWell: '', whatCanBeBetter: '' },
  focusList: [],
  attachments: [],
  pageStyle: 'default',
  location: '',
  reminder: '',
  stylePreset: 'calm',
});

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const wordCount = (value: string) => {
  const cleaned = stripHtml(value);
  return cleaned ? cleaned.split(' ').length : 0;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const isDirty = (entry: JournalEntry | null, state: Record<string, unknown>) => {
  if (!entry) return false;
  return (
    entry.title !== state.title ||
    entry.content !== state.content ||
    entry.mood !== state.mood ||
    JSON.stringify(entry.tags) !== JSON.stringify(state.tags) ||
    entry.pageStyle !== state.pageStyle ||
    entry.location !== state.location ||
    entry.reminder !== state.reminder ||
    entry.stylePreset !== state.stylePreset ||
    JSON.stringify(entry.focusList) !== JSON.stringify(state.focusList)
  );
};

const exportJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function JournalModule() {
  const { journals, addJournalEntry, updateJournalEntry, deleteJournalEntry, showConfirm, setActiveModule, theme, journalStickyNotes, addJournalStickyNote, updateJournalStickyNote, deleteJournalStickyNote } = useAppStore(
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
    isSettingsOpen
      ? 'xl:grid-cols-[1fr_320px]'
      : 'xl:grid-cols-1'
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
          
          {/* Left Column: Journals List & Filters (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-grow">
                <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search journal entries..."
                  className="input-field w-full pl-10 bg-surface"
                />
              </div>
              <div className="flex bg-surface p-1 rounded-xl border border-border shrink-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'all' ? 'bg-surface-alt text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  All Entries
                </button>
                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'favorites' ? 'bg-surface-alt text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Favorites
                </button>
              </div>
            </div>

            {/* Catalog Grid */}
            {filteredEntries.length === 0 ? (
              <div className="bg-surface border border-border/70 rounded-3xl p-12 text-center shadow-sm">
                <EmptyState
                  title="No journal entries found"
                  description="Create a new journal entry or clear the search filter to get started."
                  action={
                    <button onClick={createEntry} className="btn btn-primary btn-md">
                      Create First Entry
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEntries.map((entry) => {
                  const cleanContent = (entry.content || '').replace(/<[^>]*>/g, '').trim();
                  const snippet = cleanContent ? (cleanContent.length > 90 ? cleanContent.slice(0, 90) + '...' : cleanContent) : 'Nothing written yet.';

                  return (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setActiveEntryId(entry.id);
                      }}
                      className="group relative bg-surface border border-border/70 hover:border-primary/40 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] overflow-hidden"
                    >
                      <div className="absolute w-24 h-24 rounded-full pointer-events-none -top-10 -left-10 bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
                      
                      <div className="relative z-10 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{formatDateTime(entry.date)}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-surface-alt text-text-primary border border-border/50">
                              {entry.mood}
                            </span>
                            {entry.pinned && (
                              <span className="text-rose-500 font-extrabold text-[9px] tracking-wider bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-full">PINNED</span>
                            )}
                          </div>
                        </div>
                        <h4 className="text-base font-bold text-text-primary group-hover:text-primary transition-colors leading-tight mt-1">
                          {entry.title || 'Untitled Entry'}
                        </h4>
                        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mt-1">
                          {snippet}
                        </p>
                      </div>

                      <div className="relative z-10 flex items-center justify-between border-t border-border/40 pt-4 mt-4">
                        <div className="flex flex-wrap gap-1 max-w-[70%]">
                          {entry.tags.slice(0, 2).map((t) => (
                            <span key={t} className="text-[9px] font-semibold text-text-muted bg-surface-alt px-1.5 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                          {entry.tags.length > 2 && (
                            <span className="text-[9px] font-semibold text-text-muted">
                              +{entry.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm(
                              'Delete Journal Entry',
                              `Are you sure you want to delete "${entry.title || 'Untitled Entry'}"? This action cannot be undone.`,
                              () => deleteJournalEntry(entry.id)
                            );
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete Entry"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Notes (col-span-4) */}
          <div className="lg:col-span-4 bg-surface border border-border/70 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-text-primary">Sticky Notes</span>
                  <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold">
                    {journalStickyNotes.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    addJournalStickyNote({
                      id: crypto.randomUUID(),
                      content: 'New sticky note. Double click to edit!',
                      x: 0,
                      y: 0,
                      createdAt: new Date().toISOString()
                    });
                  }}
                  className="p-1 rounded-lg text-amber-600 hover:bg-amber-500/10 cursor-pointer flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                >
                  <IconPlus className="w-3.5 h-3.5" /> Add Note
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {journalStickyNotes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-text-muted italic border border-dashed border-border/40 rounded-2xl">
                    No sticky notes yet. Add one to capture quick thoughts!
                  </div>
                ) : (
                  journalStickyNotes.map((note) => (
                    <StickyNoteCard
                      key={note.id}
                      note={note}
                      onUpdate={(content) => updateJournalStickyNote(note.id, { content })}
                      onDelete={() => deleteJournalStickyNote(note.id)}
                      isDark={resolvedTheme === 'dark'}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div></motion.div>
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
                onClick={() => setIsSettingsOpen(open => !open)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all ${isSettingsOpen ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'}`}
                title="Toggle Styles & Settings"
              >
                <IconPalette size={18} />
              </button>
            </div>
          </div>

          {activeEntry ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              {/* Immersive Paper Sheet */}
              <div
                className="flex-1 flex flex-col rounded-[32px] border border-border/65 shadow-md min-h-[450px]"
                style={{
                  background: currentStyle.surface,
                  boxShadow: `0 20px 45px -30px ${currentStyle.glow}, 0 2px 10px rgba(0,0,0,0.01)`
                }}
              >
                <div
                  className="flex-1 flex flex-col p-6 md:p-10 rounded-[32px] overflow-y-auto"
                  style={editorPaperStyle}
                >
                  {/* Paper Meta indicators */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3 mb-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
                      <span>{formatDateTime(activeEntry.date)}</span>
                      <span>•</span>
                      <span>{wordCount(content)} words</span>
                      <span>•</span>
                      <span className="text-primary font-bold">{mood.toUpperCase()}</span>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-primary/5 text-primary px-2.5 py-0.5 text-[9px] font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Title input directly on paper */}
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={forceSave}
                    placeholder="Untitled Entry"
                    className="w-full border-none bg-transparent text-3xl font-extrabold tracking-tight text-text-primary outline-none placeholder:text-text-muted/20 mb-4"
                  />

                  {/* Divider */}
                  <div className="w-full h-px bg-border/20 mb-6" />

                  {/* Content Editor inside Paper Sheet */}
                  <div className="flex-1 flex flex-col min-h-0 journal-editor-container">
                    <style>{`
                      .journal-editor-container .border-border-alt {
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                      }
                      .journal-editor-container .bg-surface-alt {
                        background: transparent !important;
                        border-bottom: 1px solid var(--border-border-alt) !important;
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                        margin-bottom: 16px !important;
                        opacity: 0.85;
                      }
                      .journal-editor-container .rich-editor {
                        min-height: 380px;
                        padding: 0 !important;
                        font-size: 15px !important;
                        line-height: 28px !important;
                        font-family: inherit !important;
                        color: var(--text-primary) !important;
                      }
                      .journal-editor-container .rich-editor p,
                      .journal-editor-container .rich-editor div {
                        line-height: 28px !important;
                        margin-bottom: 0 !important;
                      }
                    `}</style>
                    {previewMode ? (
                      <article className="max-w-none text-text-primary">
                        <div
                          className="min-h-80 text-[15px] leading-7"
                          dangerouslySetInnerHTML={{ __html: content || '<p class="text-text-muted">Nothing written yet.</p>' }}
                        />
                      </article>
                    ) : (
                      <RichTextEditor
                        key={activeEntry.id}
                        value={content}
                        onChange={(nextValue) => setContent(nextValue)}
                        onBlur={forceSave}
                        placeholder="Start writing your thoughts..."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-145 items-center justify-center rounded-[28px] border border-border/60 bg-surface p-6 shadow-sm">
              <EmptyState
                icon={<IconBook2 className="h-9 w-9 text-text-muted" />}
                title="No journal entry selected"
                description="Create a new entry to start writing, or return to the dashboard and open an existing page."
                action={
                  <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={createEntry} className="btn btn-primary btn-md">
                      Create First Entry
                    </button>
                    <button onClick={() => setActiveModule('dashboard')} className="btn btn-secondary btn-md">
                      Go Home
                    </button>
                  </div>
                }
              />
            </div>
          )}
        </section>

        {/* Right Sidebar (Settings & Styling) */}
        {isSettingsOpen && activeEntry && (
          <aside className="relative group/settings flex flex-col gap-4 rounded-[28px] border border-border/60 bg-surface/90 p-4 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.28)] backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-2rem)] transition-all duration-300">
            {/* Hover Collapse Slider Handle */}
            <div className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 opacity-0 group-hover/settings:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-5 h-10 rounded-full border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer"
                title="Collapse Settings"
              >
                <IconChevronRight size={12} />
              </button>
            </div>
            {/* Style Presets */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Choose a style</p>
                  <p className="mt-1 text-xs text-text-secondary">Match the paper and accent to your mood.</p>
                </div>
                <IconPalette size={14} className="text-text-muted" />
              </div>
              <div className="mt-4 grid gap-2.5">
                {STYLE_PRESETS.map((preset) => {
                  const selected = preset.id === stylePreset;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setStylePreset(preset.id)}
                      className={`group flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-hover'}`}
                    >
                      <span className="h-10 w-10 rounded-xl border border-border/40" style={{ background: preset.surface, boxShadow: `inset 0 0 0 1px ${preset.glow}` }} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-text-primary">{preset.label}</span>
                        <span className="block text-[10px] text-text-muted">{preset.caption}</span>
                      </span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40" style={{ backgroundColor: selected ? preset.glow : 'transparent' }}>
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.accent }} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paper Type Style (Lines, Dotted, Cornell, etc.) */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Paper Template</p>
                  <p className="mt-1 text-xs text-text-secondary">Set the background line styling.</p>
                </div>
                <IconPencil size={14} className="text-text-muted" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {PAGE_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPageStyle(option.value)}
                    className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${pageStyle === option.value ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Settings */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                <IconMoodSmile size={14} className="text-primary" />
                <span>Journal Settings</span>
              </div>

              <div className="mt-4 space-y-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Mood</label>
                  <CustomSelect
                    value={mood}
                    onChange={(value) => setMood(value as EntryMood)}
                    options={MOOD_OPTIONS}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Tags</label>
                  <TagInput tags={tags} onChange={setTags} placeholder="Add tag and press Enter" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Location</label>
                  <div className="relative">
                    <IconMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                      onBlur={forceSave}
                      placeholder="Add location"
                      className="input-field w-full pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Reminder</label>
                  <div className="relative">
                    <IconBell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input
                      value={reminder}
                      onChange={(event) => setReminder(event.target.value)}
                      onBlur={forceSave}
                      placeholder="Set reminder"
                      className="input-field w-full pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Focus Checklist */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Focus Items</p>
                  <p className="mt-1 text-xs text-text-secondary">{focusCompletion}% focus complete</p>
                </div>
                <IconCheck size={14} className="text-text-muted" />
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${focusCompletion}%` }} />
              </div>

              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                {focusItems.length > 0 ? (
                  focusItems.map((item, index) => (
                    <div
                      key={`${item.text}-${index}`}
                      className={`flex items-center justify-between gap-2 rounded-xl border p-2 text-xs transition-all ${item.checked ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border/60 bg-surface text-text-secondary'}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFocusItem(index)}
                        className="flex-1 flex items-center gap-2 text-left"
                      >
                        <span className={`h-2 w-2 rounded-full ${item.checked ? 'bg-primary' : 'bg-text-muted/40'}`} />
                        <span className={item.checked ? 'line-through opacity-70' : ''}>{item.text}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFocusItem(index)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                      >
                        <IconTrash size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-text-muted">No focus checklist items added yet.</p>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={newFocusText}
                  onChange={(event) => setNewFocusText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addFocusItem();
                    }
                  }}
                  placeholder="Add a focus item"
                  className="input-field flex-1 text-xs py-1.5 px-3 rounded-xl"
                />
                <button onClick={addFocusItem} className="btn btn-primary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl">
                  Add
                </button>
              </div>

              {focusItems.length > 0 && (
                <div className="mt-3 flex gap-2 justify-end border-t border-border/20 pt-2.5">
                  <button
                    onClick={() => setFocusItems([])}
                    className="text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors"
                  >
                    Clear Focus
                  </button>
                </div>
              )}
            </div>

            {/* Streak days */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Focus Streak</p>
                  <p className="mt-1 text-xs text-text-secondary">Keep the habit alive with daily entries.</p>
                </div>
                <IconSparkles size={14} className="text-primary" />
              </div>

              <div className="mt-4 rounded-[24px] border border-border/60 bg-surface p-3.5">
                <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{streakDays}</span>
                  <span>{streakDays} day streak</span>
                </div>
                <div className="mt-3 flex items-end gap-1.5">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[9px] font-semibold text-text-muted">{day}</span>
                      <span className={`flex h-6.5 w-6.5 items-center justify-center rounded-full border text-[10px] font-bold ${index <= (streakDays % 7) ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-muted'}`}>
                        {index < (streakDays % 7) ? <IconCheck size={10} /> : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                <IconTag size={14} className="text-primary" />
                <span>Quick Actions</span>
              </div>
              <div className="mt-4 space-y-2">
                <button onClick={saveAsTemplate} className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover">
                  <span className="text-xs font-semibold text-text-primary">Save as Template</span>
                  <IconChevronRight size={14} className="text-text-muted" />
                </button>
                <button onClick={exportEntry} className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover">
                  <span className="text-xs font-semibold text-text-primary">Export entry JSON</span>
                  <IconDownload size={14} className="text-text-muted" />
                </button>
                <button onClick={createEntry} className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover">
                  <span className="text-xs font-semibold text-text-primary">New Blank Entry</span>
                  <IconPlus size={14} className="text-text-muted" />
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sticky Note Helper Component ───────────────────────────────────────────────────

function StickyNoteCard({
  note,
  onUpdate,
  onDelete,
  isDark,
}: {
  note: JournalStickyNote;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  isDark: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.content);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== note.content.trim()) {
      onUpdate(text.trim());
    }
  };

  return (
    <motion.div
      layout
      className={`relative p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[90px] shadow-sm text-left ${
        isDark
          ? 'bg-amber-950/20 border-amber-900/30 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}
    >
      <button
        onClick={onDelete}
        className="absolute top-2.5 right-2.5 p-0.5 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-amber-800/60 hover:text-red-500 transition-colors cursor-pointer"
        title="Delete note"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 mt-1 text-xs leading-relaxed font-semibold pr-6 select-text">
        {isEditing ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className="w-full bg-transparent focus:outline-none resize-none min-h-[60px]"
          />
        ) : (
          <div
            onDoubleClick={() => setIsEditing(true)}
            className="whitespace-pre-wrap cursor-pointer"
            title="Double click to edit"
          >
            {note.content || 'Blank sticky note...'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
