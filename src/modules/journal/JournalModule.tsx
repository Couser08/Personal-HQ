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
} from '@tabler/icons-react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '../../components/ui/Badge';
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
}> = [
  {
    id: 'calm',
    label: 'Calm',
    caption: 'Soft neutral paper',
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 247, 248, 0.95), rgba(255, 255, 255, 0.98))',
  },
  {
    id: 'warm',
    label: 'Warm',
    caption: 'Amber note card',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 250, 242, 0.95), rgba(255, 255, 255, 0.98))',
  },
  {
    id: 'evergreen',
    label: 'Evergreen',
    caption: 'Quiet editorial green',
    accent: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.16)',
    surface: 'linear-gradient(135deg, rgba(244, 250, 245, 0.95), rgba(255, 255, 255, 0.98))',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    caption: 'Cool glass paper',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.16)',
    surface: 'linear-gradient(135deg, rgba(243, 248, 255, 0.95), rgba(255, 255, 255, 0.98))',
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

const DEFAULT_DATE_FORMAT = { month: 'short', day: 'numeric', year: 'numeric' } as const;

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

const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, DEFAULT_DATE_FORMAT);

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
  const { journals, addJournalEntry, updateJournalEntry, deleteJournalEntry, showConfirm, setActiveModule } = useAppStore(
    useShallow((state) => ({
      journals: state.journals,
      addJournalEntry: state.addJournalEntry,
      updateJournalEntry: state.updateJournalEntry,
      deleteJournalEntry: state.deleteJournalEntry,
      showConfirm: state.showConfirm,
      setActiveModule: state.setActiveModule,
    })),
  );

  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [search, setSearch] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(journals[0]?.id ?? null);

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
    if (journals.length === 0) {
      setActiveEntryId(null);
      return;
    }

    if (!activeEntryId || !journals.some((entry) => entry.id === activeEntryId)) {
      setActiveEntryId(journals[0].id);
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

  const currentStyle = STYLE_PRESETS.find((preset) => preset.id === stylePreset) ?? STYLE_PRESETS[0];

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
          backgroundColor: '#fffdf8',
        }
      : pageStyle === 'grid'
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundColor: '#fffdf8',
        }
      : pageStyle === 'dotted'
      ? {
          backgroundImage: 'radial-gradient(circle, rgba(148, 163, 184, 0.22) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          backgroundColor: '#fffdf8',
        }
      : pageStyle === 'cornell'
      ? {
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.12) 72px, transparent 72px), linear-gradient(to bottom, rgba(148, 163, 184, 0.18) 1px, transparent 1px)',
          backgroundSize: '100% 30px, 100% 30px',
          backgroundColor: '#fffdf8',
        }
      : { backgroundColor: '#fffdf8' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex min-h-[calc(100vh-2rem)] flex-col gap-4"
    >
      <div className="grid min-h-[calc(100vh-2rem)] gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-surface/90 p-4 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-text-muted">Journal Library</p>
              <p className="mt-1 text-xs text-text-secondary">Your entries, templates, and favorites.</p>
            </div>
            <button
              onClick={createEntry}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
              title="Create new entry"
            >
              <IconPlus size={16} />
            </button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search entries"
              className="input-field w-full pl-9"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${activeTab === 'all' ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'}`}
            >
              All Entries
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${activeTab === 'favorites' ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'}`}
            >
              Favorites
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {filteredEntries.length === 0 ? (
              <div className="rounded-2xl border border-border/60 bg-surface-alt/40 p-4">
                <EmptyState
                  title="No journal entries"
                  description="Create a new journal entry or clear the search to reveal your saved pages."
                  action={
                    <button onClick={createEntry} className="btn btn-primary btn-md">
                      Create Entry
                    </button>
                  }
                />
              </div>
            ) : (
              filteredEntries.map((entry) => {
                const active = entry.id === activeEntryId;
                return (
                  <button
                    key={entry.id}
                    onClick={() => {
                      setActiveEntryId(entry.id);
                      setPreviewMode(false);
                    }}
                    className={`group w-full rounded-2xl border p-3 text-left transition-all ${active ? 'border-primary/60 bg-primary/5 shadow-sm' : 'border-border/60 bg-surface hover:bg-surface-hover'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <IconNotebook size={14} className={active ? 'text-primary' : 'text-text-muted'} />
                          <span className="truncate text-sm font-semibold text-text-primary">{entry.title || 'Untitled Entry'}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-text-muted">{formatDate(entry.date)} · {wordCount(entry.content)} words</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {entry.pinned && <IconHeartFilled size={14} className="text-red-500" />}
                        <span className="rounded-full bg-surface-alt px-2 py-1 text-[10px] font-semibold text-text-secondary">{entry.pageStyle}</span>
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-text-secondary">
                      {stripHtml(entry.content) || 'Blank page ready for thoughts.'}
                    </p>
                    {entry.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} className="bg-surface-alt text-[10px] text-text-secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface-alt/35 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Journal Stats</p>
              <IconSparkles size={14} className="text-primary" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-2xl border border-border/60 bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Entries</p>
                <p className="mt-1 text-xl font-bold text-text-primary">{journals.length}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Words</p>
                <p className="mt-1 text-xl font-bold text-text-primary">{totalWords}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-[28px] border border-border/60 bg-surface px-5 py-4 shadow-sm">
            <div className="flex min-w-0 items-start gap-3">
              <button
                onClick={() => setActiveModule('dashboard')}
                className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface-alt text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
                title="Back to dashboard"
              >
                <IconArrowLeft size={18} />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">New Journal Entry</p>
                <p className="mt-1 text-xs text-text-secondary">{activeEntry ? formatDateTime(activeEntry.date) : 'Create a new page to begin writing.'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full border border-border/60 bg-surface-alt px-3 py-2 text-xs font-semibold text-text-secondary">
                {saveStatus === 'saved' ? <IconCheck size={14} className="text-emerald-500" /> : <span className="h-2 w-2 rounded-full bg-primary" />}
                <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Auto-saved' : saveStatus === 'error' ? 'Save error' : 'Auto-save ready'}</span>
              </div>
              <button
                onClick={() => {
                  setPreviewMode((value) => !value);
                  void forceSave();
                }}
                className={`btn btn-secondary btn-md ${previewMode ? 'border-primary text-primary' : ''}`}
              >
                <IconEye size={16} />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button onClick={togglePinned} className="btn btn-ghost btn-md btn-square" title="Pin entry">
                {activeEntry?.pinned ? <IconHeartFilled size={18} className="text-red-500" /> : <IconHeart size={18} />}
              </button>
              <button onClick={deleteCurrentEntry} className="btn btn-ghost btn-md btn-square text-red-500" title="Delete entry">
                <IconTrash size={18} />
              </button>
            </div>
          </div>

          {activeEntry ? (
            <div className="flex min-h-0 flex-1 flex-col gap-4">
              <div className="rounded-[28px] border border-border/60 px-6 py-5 shadow-sm" style={{ background: currentStyle.surface, boxShadow: `0 20px 45px -30px ${currentStyle.glow}` }}>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-text-muted">
                      <span>{activeEntry.title || 'Journal Entry'}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{formatDate(activeEntry.date)}</span>
                    </div>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      onBlur={forceSave}
                      placeholder="What’s on your mind?"
                      className="mt-3 w-full border-none bg-transparent text-3xl font-bold tracking-tight text-text-primary outline-none placeholder:text-text-muted/60 sm:text-[2.35rem]"
                    />
                    <p className="mt-3 text-sm text-text-secondary">Start writing your thoughts, notes, ideas, or reflections here.</p>
                  </div>

                  <div className="flex min-w-52.5 flex-col gap-2 rounded-3xl border border-border/60 bg-surface/85 p-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                      <span>{currentStyle.label} style</span>
                      <IconPencil size={14} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: currentStyle.accent }} />
                      <span>{pageStyle} page paper</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <IconCheck size={14} className="text-emerald-500" />
                      <span>{focusCompletion}% focus complete</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-border/60 bg-surface px-4 py-3 shadow-sm">
                {PAGE_STYLE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPageStyle(option.value)}
                    className={`rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] transition-all ${pageStyle === option.value ? 'border-primary bg-primary text-white' : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'}`}
                  >
                    {option.label}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 text-xs text-text-secondary">
                  <span className="rounded-full bg-surface-alt px-3 py-2 font-semibold">{mood}</span>
                  <span className="rounded-full bg-surface-alt px-3 py-2 font-semibold">{tags.length} tags</span>
                  <span className="rounded-full bg-surface-alt px-3 py-2 font-semibold">{wordCount(content)} words</span>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="flex min-h-0 flex-col rounded-[28px] border border-border/60 bg-surface p-4 shadow-sm">
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-alt/40 px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
                      <IconBook2 size={14} />
                      <span>Writing Space</span>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => setFocusItems([])}
                        className="rounded-full border border-border px-3 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface"
                      >
                        Clear Focus
                      </button>
                      <button
                        onClick={saveAsTemplate}
                        className="rounded-full border border-border px-3 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:bg-surface"
                      >
                        Save as Template
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border/60" style={editorPaperStyle}>
                    <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                      <IconSparkles size={14} className="text-primary" />
                      <span>{previewMode ? 'Preview Mode' : 'Rich Text Editor'}</span>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-4">
                      {previewMode ? (
                        <article className="max-w-none text-text-primary">
                          <h2 className="mb-4 text-2xl font-bold tracking-tight text-text-primary">{title || 'Untitled Entry'}</h2>
                          <div
                            className="min-h-80 rounded-[24px] border border-border/60 bg-surface/80 p-5 text-[15px] leading-7"
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

                <div className="flex min-h-0 flex-col gap-4 rounded-[28px] border border-border/60 bg-surface p-4 shadow-sm">
                  <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Choose a style</p>
                        <p className="mt-1 text-xs text-text-secondary">Match the paper and accent to your mood.</p>
                      </div>
                      <IconPencil size={14} className="text-text-muted" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {STYLE_PRESETS.map((preset) => {
                        const selected = preset.id === stylePreset;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => setStylePreset(preset.id)}
                            className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-hover'}`}
                          >
                            <span className="h-12 w-12 rounded-2xl border border-border/60" style={{ background: preset.surface, boxShadow: `inset 0 0 0 1px ${preset.glow}` }} />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-text-primary">{preset.label}</span>
                              <span className="block text-[11px] text-text-muted">{preset.caption}</span>
                            </span>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60" style={{ backgroundColor: selected ? preset.glow : 'transparent' }}>
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                      <IconMoodSmile size={14} className="text-primary" />
                      <span>Journal Settings</span>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Mood</label>
                        <CustomSelect
                          value={mood}
                          onChange={(value) => setMood(value as EntryMood)}
                          options={MOOD_OPTIONS}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Tags</label>
                        <TagInput tags={tags} onChange={setTags} placeholder="Add a tag and press Enter" />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Location</label>
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

                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">Reminder</label>
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

                  <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Focus Streak</p>
                        <p className="mt-1 text-xs text-text-secondary">Keep the habit alive with short daily reflections.</p>
                      </div>
                      <IconSparkles size={14} className="text-primary" />
                    </div>

                    <div className="mt-4 rounded-[24px] border border-border/60 bg-surface p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{streakDays}</span>
                        <span>{streakDays} day streak</span>
                      </div>
                      <p className="mt-2 text-xs text-text-secondary">
                        {checkedFocusItems} of {focusItems.length || 0} focus items complete.
                      </p>
                      <div className="mt-4 flex items-end gap-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                          <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                            <span className="text-[10px] font-semibold text-text-muted">{day}</span>
                            <span className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${index <= (streakDays % 7) ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-muted'}`}>
                              {index < (streakDays % 7) ? <IconCheck size={12} /> : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
                      <IconTag size={14} className="text-primary" />
                      <span>Quick Actions</span>
                    </div>
                    <div className="mt-4 space-y-2">
                      <button onClick={saveAsTemplate} className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-hover">
                        <span className="text-sm font-semibold text-text-primary">Save as Template</span>
                        <IconChevronRight size={16} className="text-text-muted" />
                      </button>
                      <button onClick={exportEntry} className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-hover">
                        <span className="text-sm font-semibold text-text-primary">Export</span>
                        <IconDownload size={16} className="text-text-muted" />
                      </button>
                      <button onClick={createEntry} className="flex w-full items-center justify-between rounded-2xl border border-border/60 bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-hover">
                        <span className="text-sm font-semibold text-text-primary">New Entry</span>
                        <IconPlus size={16} className="text-text-muted" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                      <span>{title || 'Untitled Entry'}</span>
                      <span>{wordCount(content)} words</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/60 bg-surface px-4 py-3 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {focusItems.length > 0 ? (
                    focusItems.map((item, index) => (
                      <div
                        key={`${item.text}-${index}`}
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${item.checked ? 'border-primary bg-primary text-white' : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'}`}
                      >
                        <button type="button" onClick={() => toggleFocusItem(index)} className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${item.checked ? 'bg-white' : 'bg-primary'}`} />
                          <span>{item.text}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFocusItem(index)}
                          className="ml-1 rounded-full p-0.5 text-current/70 hover:text-current"
                        >
                          <IconTrash size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-text-muted">No focus items yet. Add one in the right rail.</span>
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
                    className="input-field flex-1"
                  />
                  <button onClick={addFocusItem} className="btn btn-primary btn-md">
                    Add
                  </button>
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
      </div>
    </motion.div>
  );
}
