import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  IconPlus, IconSearch, IconHeart, IconHeartFilled,
  IconBook, IconTrash, IconSparkles, IconMicrophone
} from '@tabler/icons-react';
import { useAppStore, type JournalEntry } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Badge } from '../../components/ui/Badge';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { EmptyState } from '../../components/ui/EmptyState';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Active entry state
  const [activeEntryId, setActiveEntryId] = useState<string | null>(journals[0]?.id || null);

  // Editor fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>('good');
  const [tags, setTags] = useState<string[]>([]);
  const [pageStyle, setPageStyle] = useState<JournalEntry['pageStyle']>('default');

  // Reflections and sticky note focus items (saved in active entry)
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
      setFocusItems(activeEntry.focusList || []);
    } else {
      setTitle('');
      setContent('');
      setMood('good');
      setTags([]);
      setPageStyle('default');
      setFocusItems([]);
    }
  }, [activeEntryId, activeEntry]);

  const forceSave = async () => {
    if (!activeEntryId || mode !== 'write') return;
    const currentObj = journals.find(j => j.id === activeEntryId);
    if (!currentObj) return;

    const isUnchanged =
      currentObj.title === title &&
      currentObj.content === content &&
      currentObj.mood === mood &&
      JSON.stringify(currentObj.tags) === JSON.stringify(tags) &&
      currentObj.pageStyle === pageStyle;
    
    if (isUnchanged) return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    
    setSaveStatus('saving');
    try {
      await updateJournalEntry(activeEntryId, {
        title, content, mood, tags, pageStyle
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
    }
  };

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
      setSaveStatus('saving');
      updateJournalEntry(activeEntryId, {
        title, content, mood, tags, pageStyle
      }).then(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }).catch(() => setSaveStatus('error'));
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
      focusList: [],
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
        
        {/* Left Side: Entries Library */}
        <div className={`lg:col-span-4 flex flex-col gap-6 ${mode === 'reflect' && activeEntryId ? 'hidden lg:flex' : 'flex'}`}>
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
              {/* 📖 MINIMAL APPLE-STYLE JOURNAL EDITOR */}
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col h-full min-h-[650px] relative">
                
                {/* Header: Date, Mood & Actions */}
                <div className="flex justify-between items-center px-8 py-5 border-b border-border/40 bg-surface-alt/30">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] uppercase font-bold tracking-widest text-text-muted font-mono">
                      {new Date(activeEntry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {['great', 'good', 'meh', 'bad', 'terrible'].map(m => {
                        const emojis: Record<string, string> = { great: '😄', good: '🙂', meh: '😐', bad: '🙁', terrible: '😫' };
                        const isSel = activeEntry.mood === m;
                        return (
                          <button
                            key={m}
                            onClick={() => { setMood(m as any); updateJournalEntry(activeEntry.id, { mood: m as any }); }}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all border ${isSel ? 'border-[#a855f7] bg-[#a855f7]/10 scale-110 shadow-sm' : 'border-transparent hover:bg-border'}`}
                            title={m}
                          >
                            {emojis[m]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateJournalEntry(activeEntry.id, { pinned: !activeEntry.pinned })}
                      className="btn btn-ghost btn-sm btn-square hover:bg-border transition-colors"
                      title="Pin Entry"
                    >
                      {activeEntry.pinned ? <IconHeartFilled className="w-4.5 h-4.5 text-red-500" /> : <IconHeart className="w-4.5 h-4.5" />}
                    </button>
                    <button
                      onClick={() => {
                        showConfirm('Delete Entry', 'Are you sure you want to delete this journal entry?', () => {
                          deleteJournalEntry(activeEntry.id);
                          setActiveEntryId(journals[0]?.id || null);
                        });
                      }}
                      className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <IconTrash className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                  {/* Main Editor Area */}
                  <div className="flex-1 flex flex-col border-r border-border/40">
                    {/* Title */}
                    <div className="px-8 pt-6 pb-2 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="Untitled Entry"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={forceSave}
                        className="w-full bg-transparent border-none text-3xl font-bold font-serif tracking-tight focus:outline-none placeholder:text-text-muted/50 text-text-primary"
                      />
                      {saveStatus === 'saving' && <span className="text-xs font-semibold text-amber-500 whitespace-nowrap">Saving...</span>}
                      {saveStatus === 'saved' && <span className="text-xs font-semibold text-green-500 whitespace-nowrap">Saved</span>}
                      {saveStatus === 'error' && <span className="text-xs font-semibold text-red-500 whitespace-nowrap">Error</span>}
                    </div>
                    
                    {/* Minimal Toolbar */}
                    <div className="flex items-center px-8 py-2 gap-4 border-b border-border/40 bg-surface-alt/10">
                      <div className="flex gap-1.5 items-center">
                        <button onClick={insertRandomPrompt} className="p-1.5 rounded hover:bg-surface-hover text-amber-500 transition-colors" title="Insert Prompt">
                          <IconSparkles className="w-4 h-4" />
                        </button>
                        <button onClick={toggleVoiceRecording} className={`p-1.5 rounded transition-colors ${isRecording ? 'bg-red-500/10 text-red-500 animate-pulse' : 'hover:bg-surface-hover text-text-secondary'}`} title="Record Voice">
                          <IconMicrophone className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1"></div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-muted uppercase">Page:</span>
                        {['default', 'lines', 'grid'].map(style => (
                          <button
                            key={style}
                            onClick={() => setPageStyle(style as any)}
                            className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                              pageStyle === style
                                ? 'bg-[#a855f7] text-white border-[#a855f7]'
                                : 'border-transparent hover:bg-surface-hover text-text-secondary'
                            }`}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rich Text Editor */}
                    <div 
                      className="flex-1 p-6 overflow-y-auto rich-text-journal-editor"
                      style={
                        pageStyle === 'lines'
                          ? { backgroundImage: 'linear-gradient(rgba(0,0,0,0) 95%, var(--border-border-alt) 95%)', backgroundSize: '100% 28px', lineHeight: '28px' }
                          : pageStyle === 'grid'
                          ? { backgroundImage: 'linear-gradient(var(--border-border-alt) 1px, transparent 1px), linear-gradient(90deg, var(--border-border-alt) 1px, transparent 1px)', backgroundSize: '24px 24px', lineHeight: '24px' }
                          : {}
                      }
                    >
                      <RichTextEditor
                        key={activeEntry.id}
                        value={content}
                        onChange={(html: string) => {
                          setContent(html);
                        }}
                        onBlur={forceSave}
                        placeholder="Start writing..."
                      />
                    </div>
                  </div>

                  {/* Right Side: Focus & Meta */}
                  <div className="w-72 bg-surface-alt/20 p-6 flex flex-col gap-8 overflow-y-auto">
                    {/* Today's Focus Widget */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 text-amber-500 mb-1">
                        <IconSparkles className="w-4 h-4" />
                        <h4 className="text-xs uppercase font-extrabold tracking-widest font-mono">Today's Focus</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {focusItems.map((item, idx) => (
                          <label key={idx} className="flex items-start gap-2.5 text-sm text-text-secondary cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleFocusItem(idx)}
                              className="w-4 h-4 mt-0.5 rounded accent-[#a855f7] border-border bg-surface shrink-0 cursor-pointer"
                            />
                            <span className={`leading-snug transition-all ${item.checked ? 'line-through opacity-50' : 'group-hover:text-text-primary'}`}>{item.text}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2 pt-3 border-t border-border/40">
                        <input
                          type="text"
                          placeholder="Add new focus..."
                          value={newFocusText}
                          onChange={(e) => setNewFocusText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addFocusItem()}
                          className="bg-transparent border-none focus:outline-none text-sm flex-1 text-text-primary placeholder:text-text-muted"
                        />
                        <button onClick={addFocusItem} className="text-[#a855f7] hover:text-[#9333ea] font-bold text-sm">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl flex items-center justify-center min-h-[460px]">
              <EmptyState
                icon={<IconBook className="w-9 h-9 text-text-muted" />}
                title="No journal entry selected"
                description="Click '+ New Entry' or select an entry on the left to start reflecting, tracking your mood, or documenting daily priorities!"
                action={
                  <button
                    onClick={() => handleCreateEntry('blank')}
                    className="btn btn-primary btn-md bg-[#a855f7] hover:bg-[#9333ea]"
                  >
                    Create First Entry
                  </button>
                }
              />
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
