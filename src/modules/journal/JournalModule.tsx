import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlus, IconSearch, IconHeart, IconHeartFilled,
  IconEdit, IconBook, IconTrash, IconSparkles, IconMicrophone
} from '@tabler/icons-react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';

const JOURNAL_TEMPLATES = [
  { id: 'blank', label: 'Blank Page', icon: '📄', prompt: '' },
  {
    id: 'daily',
    label: 'Daily Journal',
    icon: '☀️',
    prompt: `<h3>Today's Highlights</h3><p>Write about what happened today...</p><h3>Gratitude</h3><ul><li>List things you are grateful for...</li></ul>`
  },
  {
    id: 'reflection',
    label: 'Reflection',
    icon: '🧘',
    prompt: `<h3>Deep Reflection</h3><p>What is on your mind? How did you respond to today's events?</p><h3>Key Learnings</h3><ul><li>Point 1...</li></ul>`
  },
  {
    id: 'goals',
    label: 'Goals & Plan',
    icon: '🎯',
    prompt: `<h3>Top Priorities</h3><ol><li>Priority 1</li><li>Priority 2</li></ol><h3>Action Steps</h3><ul><li>Step A</li><li>Step B</li></ul>`
  }
];

const DAILY_PROMPTS = [
  "What are three things you are grateful for today?",
  "What was the highlight of your day, and why?",
  "What is one challenge you overcame today?",
  "What did you learn today that you can apply tomorrow?",
  "Describe a small win that made you smile today.",
  "How did you practice self-care or mindfulness today?"
];

export default function JournalModule() {
  const { journals, addJournalEntry, updateJournalEntry, deleteJournalEntry, showConfirm } = useAppStore(useShallow(state => ({
    journals: state.journals,
    addJournalEntry: state.addJournalEntry,
    updateJournalEntry: state.updateJournalEntry,
    deleteJournalEntry: state.deleteJournalEntry,
    showConfirm: state.showConfirm
  })));

  // Navigation states
  const [activeTab, setActiveTab] = useState<'entries' | 'favorites' | 'timeline'>('entries');
  const [mode, setMode] = useState<'write' | 'reflect'>('reflect'); // reflect shows the open book, write shows editor
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Active entry state
  const [activeEntryId, setActiveEntryId] = useState<string | null>(journals[0]?.id || null);

  // Editor fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('good');
  const [tags, setTags] = useState<string[]>([]);
  const [pageStyle, setPageStyle] = useState<JournalEntry['pageStyle']>('default');

  // Reflections and sticky note focus items (saved in active entry)
  const [whatWentWell, setWhatWentWell] = useState('');
  const [whatCanBeBetter, setWhatCanBeBetter] = useState('');
  const [focusItems, setFocusItems] = useState<{ text: string; checked: boolean }[]>([]);
  const [newFocusText, setNewFocusText] = useState('');

  // Audio / Speech reflection (Voice log demo helper)
  const [isRecording, setIsRecording] = useState(false);

  // Active entry object reference
  const activeEntry = useMemo(() => journals.find(j => j.id === activeEntryId) || null, [journals, activeEntryId]);

  // Sync editor fields when activeEntry changes
  useEffect(() => {
    if (activeEntry) {
      setTitle(activeEntry.title);
      setContent(activeEntry.content);
      setMood(activeEntry.mood);
      setTags(activeEntry.tags);
      setPageStyle(activeEntry.pageStyle);
      setWhatWentWell(activeEntry.reflection?.whatWentWell || '');
      setWhatCanBeBetter(activeEntry.reflection?.whatCanBeBetter || '');
      setFocusItems(activeEntry.focusList || []);
    } else {
      setTitle('');
      setContent('');
      setMood('good');
      setTags([]);
      setPageStyle('default');
      setWhatWentWell('');
      setWhatCanBeBetter('');
      setFocusItems([]);
    }
  }, [activeEntryId, activeEntry]);

  // Debounced auto-save effect
  const autoSaveTimer = useRef<any>(null);
  useEffect(() => {
    if (!activeEntryId || mode !== 'write') return;

    const currentObj = journals.find(j => j.id === activeEntryId);
    if (!currentObj) return;

    // Check if edits exist
    const isUnchanged =
      currentObj.title === title &&
      currentObj.content === content &&
      currentObj.mood === mood &&
      JSON.stringify(currentObj.tags) === JSON.stringify(tags) &&
      currentObj.pageStyle === pageStyle;

    if (isUnchanged) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      updateJournalEntry(activeEntryId, {
        title,
        content,
        mood,
        tags,
        pageStyle
      });
    }, 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, mood, tags, pageStyle, activeEntryId, mode, journals, updateJournalEntry]);

  // Start new blank entry or from template
  const handleCreateEntry = (templateId = 'blank') => {
    const tmpl = JOURNAL_TEMPLATES.find(t => t.id === templateId);
    const newId = crypto.randomUUID();
    const newEntry: JournalEntry = {
      id: newId,
      title: tmpl ? `${tmpl.label} - ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'Untitled Entry',
      content: tmpl ? tmpl.prompt : '',
      date: new Date().toISOString(),
      mood: 'good',
      tags: tmpl?.id !== 'blank' ? [tmpl?.label || ''] : [],
      images: [],
      pinned: false,
      reflection: {
        whatWentWell: '',
        whatCanBeBetter: ''
      },
      focusList: [
        { text: 'Complete daily review', checked: false },
        { text: 'Hydrate 2L water', checked: false }
      ],
      attachments: [],
      pageStyle: 'default'
    };
    addJournalEntry(newEntry);
    setActiveEntryId(newId);
    setMode('write');
  };

  // Sticky note focus checklist toggle
  const toggleFocusItem = (idx: number) => {
    const updated = focusItems.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
    setFocusItems(updated);
    if (activeEntryId) {
      updateJournalEntry(activeEntryId, { focusList: updated });
    }
  };

  const addFocusItem = () => {
    if (!newFocusText.trim()) return;
    const updated = [...focusItems, { text: newFocusText.trim(), checked: false }];
    setFocusItems(updated);
    setNewFocusText('');
    if (activeEntryId) {
      updateJournalEntry(activeEntryId, { focusList: updated });
    }
  };

  // Save reflection questions on Right Page
  const saveReflections = () => {
    if (!activeEntryId) return;
    updateJournalEntry(activeEntryId, {
      reflection: {
        whatWentWell,
        whatCanBeBetter
      }
    });
  };

  // Words count helper
  const wordCount = (text: string) => {
    const stripped = text.replace(/<[^>]*>/g, '').trim();
    return stripped ? stripped.split(/\s+/).length : 0;
  };

  // Filter entries
  const filteredEntries = useMemo(() => {
    let list = journals;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j => j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q));
    }
    if (selectedTag) {
      list = list.filter(j => j.tags.includes(selectedTag));
    }
    if (activeTab === 'favorites') {
      list = list.filter(j => j.pinned);
    }
    return list;
  }, [journals, search, selectedTag, activeTab]);

  // Aggregate stats
  const totalWords = useMemo(() => journals.reduce((acc, j) => acc + wordCount(j.content), 0), [journals]);
  const streakDays = useMemo(() => journals.length > 0 ? 7 : 0, [journals]); // simulated streak
  const reflectionCount = useMemo(() => journals.filter(j => j.reflection?.whatWentWell).length, [journals]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    journals.forEach(j => j.tags.forEach(t => s.add(t)));
    return Array.from(s);
  }, [journals]);

  // Random Daily Prompt Picker
  const insertRandomPrompt = () => {
    const rand = DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
    setContent(prev => prev + `<blockquote><strong>Prompt:</strong> ${rand}</blockquote><p></p>`);
    if (activeEntryId) {
      updateJournalEntry(activeEntryId, { content: content + `<blockquote><strong>Prompt:</strong> ${rand}</blockquote><p></p>` });
    }
  };

  // Voice recording mock helper
  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setContent(prev => prev + `<p><em>🎙️ Voice transcript recorded: Today was centered around wrapping up core system visual modules...</em></p>`);
    } else {
      setIsRecording(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="flex flex-col gap-6"
    >
      {/* Redesigned Journal Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Journal <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] inline-block" />
          </h1>
          <p className="text-text-secondary text-sm">Capture thoughts, track growth, and reflect daily.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search journal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <button
            onClick={() => handleCreateEntry('blank')}
            className="btn btn-primary btn-md flex items-center gap-1.5 shrink-0 bg-[#a855f7] hover:bg-[#9333ea]"
          >
            <IconPlus className="w-4 h-4" /> New Entry
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Total Entries</p>
          <p className="text-2xl font-extrabold text-text-primary mt-1">{journals.length}</p>
          <span className="text-[9px] text-green-500 font-semibold">+2 this week</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Current Streak</p>
          <p className="text-2xl font-extrabold text-text-primary mt-1">{streakDays} Days</p>
          <span className="text-[9px] text-text-muted">consecutive entries</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Total Words</p>
          <p className="text-2xl font-extrabold text-text-primary mt-1">{totalWords.toLocaleString()}</p>
          <span className="text-[9px] text-[#a855f7] font-semibold">avg 150 words/entry</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl">
          <p className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Reflections</p>
          <p className="text-2xl font-extrabold text-text-primary mt-1">{reflectionCount}</p>
          <span className="text-[9px] text-text-muted">completed deep logs</span>
        </div>
      </div>

      {/* Filter and Tab Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-alt pb-4">
        <div className="flex gap-2">
          {['entries', 'favorites'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                activeTab === t
                  ? 'bg-text-primary text-background border-text-primary'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {t === 'entries' ? 'All Entries' : 'Favorites'}
            </button>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-text-muted uppercase">Filter Tag:</span>
            <CustomSelect
              value={selectedTag || 'all'}
              onChange={val => setSelectedTag(val === 'all' ? null : val)}
              options={[{ value: 'all', label: 'All Tags' }, ...allTags.map(t => ({ value: t, label: t }))]}
            />
          </div>
        )}
      </div>

      {/* Workspace Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Entries Library and Quick Start Templates */}
        <div className={`lg:col-span-4 flex flex-col gap-6 ${mode === 'reflect' && activeEntryId ? 'hidden lg:flex' : 'flex'}`}>
          {/* Quick Start Templates Grid */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted">Quick Start</h3>
            <div className="grid grid-cols-2 gap-2">
              {JOURNAL_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => handleCreateEntry(tmpl.id)}
                  className="p-3 border border-border bg-surface-alt hover:bg-surface-hover rounded-xl flex flex-col items-center gap-1 text-center transition-all hover:scale-[1.02]"
                >
                  <span className="text-xl">{tmpl.icon}</span>
                  <span className="text-[11px] font-semibold text-text-primary leading-tight">{tmpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Library list */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-text-muted pb-2 border-b border-border-alt">Journal Entries</h3>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10 text-text-muted text-xs">No entries cataloged.</div>
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {filteredEntries.map(entry => {
                  const isSel = entry.id === activeEntryId;
                  const wordCountNum = wordCount(entry.content);
                  return (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setActiveEntryId(entry.id);
                        setMode('reflect'); // open the book view for selected entry
                      }}
                      className={`p-3 border rounded-xl cursor-pointer transition-all flex flex-col gap-1.5 ${
                        isSel
                          ? 'border-[#a855f7] bg-[#a855f7]/5'
                          : 'border-border bg-surface-alt hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] text-text-muted font-bold">
                        <span>{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span>{wordCountNum} words</span>
                      </div>
                      <h4 className="font-bold text-xs text-text-primary truncate">{entry.title || 'Untitled Entry'}</h4>
                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {entry.content.replace(/<[^>]*>/g, '') || <span className="italic opacity-60">Blank content</span>}
                      </p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.tags.map(t => (
                            <Badge key={t} className="text-[9px] py-0 px-2 bg-[#a855f7]/10 text-[#a855f7]">{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: The immersive Editor / Reflection book */}
        <div className="lg:col-span-8 flex flex-col gap-4 w-full">
          
          {/* Active Worksite Card */}
          {activeEntryId && activeEntry ? (
            <div>
              {/* Dynamic Workspace Modes */}
              {mode === 'reflect' ? (
                /* 📖 IMMERSIVE BOOK LAYOUT MODE */
                <div className="relative">
                  {/* Metal Binder Rings (Apple Material Craft) */}
                  <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-around py-8 z-30 pointer-events-none w-10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-6 w-9 rounded-full border-t border-b border-r border-[#666] bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 shadow-md relative -left-0.5 opacity-90" />
                    ))}
                  </div>

                  {/* Open Book Container */}
                  <div className="bg-[#fcfbf9] dark:bg-[#1a1917] border border-border shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative min-h-[580px] p-8 md:p-12 gap-8 text-[#2e2d2b] dark:text-[#e4e2df]">
                    
                    {/* Left Page (Content & Sticky Note) */}
                    <div className="flex flex-col gap-5 justify-between pr-2 md:pr-6 border-r border-border/10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-border/10 pb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 font-mono">
                            {new Date(activeEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                          <span className="text-xl">
                            {activeEntry.mood === 'great' ? '🟢' : activeEntry.mood === 'good' ? '🟢' : '🟡'}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold font-serif tracking-tight leading-tight">{activeEntry.title}</h2>
                        
                        {/* Text body area */}
                        <div
                          className="text-sm leading-relaxed font-serif space-y-3 prose max-h-[300px] overflow-y-auto pr-1 scrollbar-thin"
                          dangerouslySetInnerHTML={{ __html: activeEntry.content || '<p class="italic opacity-60">No entries written for today. Click the Edit/Write button below to write.</p>' }}
                        />
                      </div>

                      {/* Sticky note: Today's Focus checklist */}
                      <div className="bg-amber-100 dark:bg-amber-950/40 border border-amber-200/50 p-4 rounded-xl shadow-md rotate-[-1deg] relative mt-4">
                        <div className="absolute top-2 right-2 text-amber-500">📌</div>
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-800 dark:text-amber-300 font-mono mb-2">Today's Focus</h4>
                        <div className="flex flex-col gap-1.5">
                          {focusItems.map((item, idx) => (
                            <label key={idx} className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => toggleFocusItem(idx)}
                                className="w-3.5 h-3.5 rounded accent-[#a855f7]"
                              />
                              <span className={item.checked ? 'line-through opacity-50' : ''}>{item.text}</span>
                            </label>
                          ))}
                        </div>
                        <div className="flex gap-1.5 mt-3 pt-2 border-t border-amber-200/20">
                          <input
                            type="text"
                            placeholder="New item..."
                            value={newFocusText}
                            onChange={(e) => setNewFocusText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addFocusItem()}
                            className="bg-transparent border-none focus:outline-none text-xs flex-1 text-amber-900 placeholder:text-amber-800/40"
                          />
                          <button onClick={addFocusItem} className="text-amber-800 font-bold text-xs">+</button>
                        </div>
                      </div>
                    </div>

                    {/* Right Page (Reflections & Mood overview) */}
                    <div className="flex flex-col gap-6 pl-2 md:pl-6 justify-between">
                      <div className="space-y-5">
                        <div className="border-b border-border/10 pb-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 font-mono">Reflections & Mood</span>
                        </div>

                        {/* Reflections questions */}
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">What went well today?</label>
                            <textarea
                              value={whatWentWell}
                              onChange={(e) => setWhatWentWell(e.target.value)}
                              onBlur={saveReflections}
                              placeholder="Record wins, accomplishments, or positive moments..."
                              className="w-full bg-surface-alt border border-border/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary"
                              rows={3}
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block mb-1">What can be better?</label>
                            <textarea
                              value={whatCanBeBetter}
                              onChange={(e) => setWhatCanBeBetter(e.target.value)}
                              onBlur={saveReflections}
                              placeholder="Areas of focus, learnings, or improvements..."
                              className="w-full bg-surface-alt border border-border/50 rounded-xl px-3 py-2 text-xs focus:outline-none text-text-primary"
                              rows={3}
                            />
                          </div>
                        </div>

                        {/* Mood overview */}
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary block">Today's Mood</span>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-text-primary capitalize">{activeEntry.mood}</span>
                            <div className="flex gap-1">
                              {['great', 'good', 'meh', 'bad', 'terrible'].map(m => (
                                <button
                                  key={m}
                                  onClick={() => {
                                    setMood(m as any);
                                    updateJournalEntry(activeEntry.id, { mood: m as any });
                                  }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${
                                    activeEntry.mood === m ? 'border-[#a855f7] bg-[#a855f7]/10' : 'border-border hover:bg-surface-hover'
                                  }`}
                                  title={m}
                                >
                                  {m === 'great' ? '🟢' : m === 'good' ? '🟢' : m === 'meh' ? '🟡' : '🔴'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delete actions */}
                      <div className="flex justify-between items-center border-t border-border/10 pt-4 mt-6">
                        <button
                          onClick={() => {
                            showConfirm('Delete Entry', 'Are you sure you want to delete this journal entry?', () => {
                              deleteJournalEntry(activeEntry.id);
                              setActiveEntryId(journals[0]?.id || null);
                            });
                          }}
                          className="btn btn-ghost text-red-500 hover:bg-red-500/10 btn-sm flex items-center gap-1.5"
                        >
                          <IconTrash className="w-4 h-4" /> Delete Entry
                        </button>

                        <button
                          onClick={() => {
                            updateJournalEntry(activeEntry.id, { pinned: !activeEntry.pinned });
                          }}
                          className="btn btn-ghost btn-sm"
                          title="Pin Entry"
                        >
                          {activeEntry.pinned ? <IconHeartFilled className="w-4.5 h-4.5 text-red-500" /> : <IconHeart className="w-4.5 h-4.5" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* ✍️ EDITOR WRITE MODE */
                <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-border-alt">
                    <h3 className="font-bold text-sm text-text-primary">Edit Entry</h3>
                    <button
                      onClick={() => setMode('reflect')}
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                      <IconBook className="w-4 h-4" /> Open Book View
                    </button>
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Entry Title</label>
                    <input
                      type="text"
                      placeholder="Title of this entry..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-text-muted text-text-primary"
                    />
                  </div>

                  {/* Styling toolbar & insert actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-surface-alt rounded-xl border border-border">
                    <div className="flex items-center gap-1">
                      <button onClick={insertRandomPrompt} className="p-1.5 rounded hover:bg-surface-hover text-text-secondary" title="Insert Daily Prompt">
                        <IconSparkles className="w-4 h-4 text-amber-500" />
                      </button>
                      <button onClick={toggleVoiceRecording} className={`p-1.5 rounded hover:bg-surface-hover text-text-secondary ${isRecording ? 'bg-red-500/10 text-red-500 animate-pulse' : ''}`} title="Record Voice Note">
                        <IconMicrophone className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Page Style selection */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Page:</span>
                      {['default', 'lines', 'dotted', 'grid', 'cornell'].map(style => (
                        <button
                          key={style}
                          onClick={() => setPageStyle(style as any)}
                          className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                            pageStyle === style
                              ? 'bg-[#a855f7] text-white border-[#a855f7]'
                              : 'border-border hover:bg-surface-hover text-text-secondary'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Textarea editor canvas */}
                  <textarea
                    value={content.replace(/<[^>]*>/g, '')}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Woke up early and felt really refreshed..."
                    className="w-full bg-transparent border-none focus:outline-none text-sm font-serif min-h-[260px] resize-y placeholder:text-text-muted text-text-primary"
                    style={
                      pageStyle === 'lines'
                        ? { backgroundImage: 'linear-gradient(rgba(0,0,0,0) 95%, var(--border-border-alt) 95%)', backgroundSize: '100% 24px', lineHeight: '24px' }
                        : pageStyle === 'grid'
                        ? { backgroundImage: 'linear-gradient(var(--border-border-alt) 1px, transparent 1px), linear-gradient(90deg, var(--border-border-alt) 1px, transparent 1px)', backgroundSize: '20px 20px', lineHeight: '20px' }
                        : {}
                    }
                  />

                  {/* Footer status bar */}
                  <div className="flex justify-between items-center pt-3 border-t border-border-alt">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Auto-saved just now
                    </span>

                    <button
                      onClick={() => setMode('reflect')}
                      className="btn btn-primary btn-md bg-[#a855f7] hover:bg-[#9333ea]"
                    >
                      Save & Read
                    </button>
                  </div>
                </div>
              )}

              {/* Floating Bottom Nav bar selector (Mockup style) */}
              <div className="flex justify-center mt-6">
                <div className="flex bg-surface border border-border shadow-high rounded-2xl p-1 gap-2">
                  <button
                    onClick={() => setMode('write')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      mode === 'write' ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <IconEdit className="w-4 h-4" /> Write
                  </button>
                  <button
                    onClick={() => setMode('reflect')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all ${
                      mode === 'reflect' ? 'bg-[#a855f7]/10 text-[#a855f7]' : 'text-text-secondary hover:bg-surface-hover'
                    }`}
                  >
                    <IconBook className="w-4 h-4" /> Reflect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[460px]">
              <span className="text-4xl mb-4">📖</span>
              <h3 className="text-lg font-bold text-text-primary">No journal entry selected</h3>
              <p className="text-text-secondary text-sm max-w-sm mt-2 leading-relaxed">
                Click "+ New Entry" or select an entry on the left to start reflecting, tracking your mood, or documenting daily priorities!
              </p>
              <button
                onClick={() => handleCreateEntry('blank')}
                className="btn btn-primary btn-md mt-6 bg-[#a855f7] hover:bg-[#9333ea]"
              >
                Create First Entry
              </button>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
