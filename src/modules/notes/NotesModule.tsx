import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconPlus, IconSearch, IconPin, IconTrash,
  IconLayoutGrid, IconLayoutList, IconAdjustmentsHorizontal,
  IconChevronDown
} from '@tabler/icons-react';
import { useAppStore, type Note } from '../../store/useAppStore';
import { Badge } from '../../components/ui/Badge';
import { TagInput } from '../../components/ui/TagInput';
import { RichTextEditor } from '../../components/ui/RichTextEditor';

function stripHtml(html: string): string {
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  // Remove edit headers so they don't show "Edit Code javascript" in previews
  const headers = div.querySelectorAll('.note-code-header');
  headers.forEach(h => h.remove());
  return div.textContent ?? div.innerText ?? '';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function wordCount(text: string) {
  const normalized = text.trim();
  return normalized ? normalized.split(/\s+/).length : 0;
}

export default function NotesModule() {
  const { notes, addNote, updateNote, deleteNote, showConfirm } = useAppStore();

  // Search, sorting, filters
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent');

  // Edit / view pane state
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  // Layout preference
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  // Mobile navigation pane toggle: 'list' or 'edit'
  const [mobilePane, setMobilePane] = useState<'list' | 'edit'>('list');

  // Auto-save notification state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Keep track of active note reference
  const activeNote = useMemo(() => notes.find(n => n.id === activeNoteId) || null, [notes, activeNoteId]);

  // Handle note selection
  const selectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setAutoSaveStatus('idle');
    setMobilePane('edit');
  };

  // Start a new note draft
  const startNewNote = () => {
    const newId = crypto.randomUUID();
    const newNoteObj: Note = {
      id: newId,
      title: 'Untitled Note',
      content: '',
      tags: [],
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    // Save draft immediately to store
    addNote(newNoteObj);
    setActiveNoteId(newId);
    setTitle('Untitled Note');
    setContent('');
    setTags([]);
    setAutoSaveStatus('idle');
    setMobilePane('edit');
  };

  // Debounced auto-save timer
  const autoSaveTimer = useRef<any>(null);
  useEffect(() => {
    if (!activeNoteId) return;

    // Check if there are actual edits compared to stored note
    const currentStored = notes.find(n => n.id === activeNoteId);
    if (!currentStored) return;

    if (currentStored.title === title && currentStored.content === content && JSON.stringify(currentStored.tags) === JSON.stringify(tags)) {
      return;
    }

    setAutoSaveStatus('saving');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      updateNote(activeNoteId, {
        title,
        content,
        tags,
        updatedAt: new Date().toISOString()
      });
      setAutoSaveStatus('saved');
    }, 1200);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, tags, activeNoteId, updateNote, notes]);

  // Aggregate stats
  const pinnedCount = useMemo(() => notes.filter((n) => n.pinned).length, [notes]);
  const recentCount = useMemo(() => notes.filter((n) => Date.now() - new Date(n.updatedAt).getTime() < 1000 * 60 * 60 * 24).length, [notes]);

  const allTags = useMemo(() => {
    const uniqueTags = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => uniqueTags.add(tag)));
    return Array.from(uniqueTags);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (search) {
      const query = search.toLowerCase();
      filtered = filtered.filter((note) =>
        note.title.toLowerCase().includes(query) || stripHtml(note.content).toLowerCase().includes(query)
      );
    }

    if (selectedTag) filtered = filtered.filter((note) => note.tags.includes(selectedTag));

    return filtered.sort((a, b) => {
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      // Pinned notes bubble to top, then sorted by updatedAt
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search, selectedTag, sortBy]);

  const plainText = stripHtml(content);
  const words = wordCount(plainText);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex flex-col gap-6"
    >
      {/* Redesigned Header: Mockup Style */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Quick Notes <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          </h1>
          <p className="text-text-secondary text-sm">A cleaner notebook for ideas, references, and fast code snippets.</p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3 w-full xl:w-max">
          <div className="relative flex-1 xl:w-72">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 pr-12 w-full"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-border-alt rounded text-[10px] text-text-muted font-mono select-none">
              ⌘K
            </span>
          </div>

          <div className="flex border border-border rounded-xl bg-surface p-0.5 overflow-hidden shrink-0">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'grid' ? 'bg-surface-alt text-text-primary' : 'text-text-secondary'}`}
              title="Grid View"
            >
              <IconLayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setLayoutMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${layoutMode === 'list' ? 'bg-surface-alt text-text-primary' : 'text-text-secondary'}`}
              title="List View"
            >
              <IconLayoutList className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={startNewNote}
            className="btn btn-primary btn-md flex items-center gap-2 shrink-0 ml-auto xl:ml-0"
          >
            <IconPlus className="w-4 h-4" /> New Note
          </button>
        </div>
      </div>

      {/* Redesigned Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border p-5 rounded-2xl">
          <p className="text-xs uppercase tracking-wider text-text-muted font-bold">Total Notes</p>
          <p className="text-3xl font-extrabold text-text-primary mt-2">{notes.length}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl">
          <p className="text-xs uppercase tracking-wider text-text-muted font-bold">Pinned</p>
          <p className="text-3xl font-extrabold text-text-primary mt-2 text-primary">{pinnedCount}</p>
        </div>
        <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-between overflow-hidden relative min-h-[92px]">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted font-bold">Edited Today</p>
            <p className="text-3xl font-extrabold text-text-primary mt-2">{recentCount}</p>
          </div>
          {/* Custom pink line sparkline in the corner */}
          <div className="absolute right-0 bottom-0 left-0 h-9 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="pink-spark-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,25 Q15,10 30,22 T60,5 T90,20 L100,10 L100,30 L0,30 Z" fill="url(#pink-spark-grad)" />
              <path d="M0,25 Q15,10 30,22 T60,5 T90,20 L100,10" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Redesigned 2-Column Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start min-h-[500px]">
        {/* Left pane: Library search + Recent Notes list */}
        <div className={`lg:col-span-4 flex flex-col gap-6 w-full ${mobilePane === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
          {/* Workspace Filter box */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Workspace</p>
              <h2 className="text-base font-bold mt-1 text-text-primary">Search across your note library</h2>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search tags or notes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              <button
                onClick={() => setSortBy(s => s === 'recent' ? 'alphabetical' : 'recent')}
                className="px-3 border border-border bg-surface-alt hover:bg-surface-hover rounded-xl text-text-secondary transition-colors"
                title="Sort Notes"
              >
                <IconAdjustmentsHorizontal className="w-4 h-4" />
              </button>
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-alt">
                <Badge
                  variant={selectedTag === null ? 'primary' : 'default'}
                  onClick={() => setSelectedTag(null)}
                  className="cursor-pointer text-[10px] py-0.5 px-2.5"
                >
                  All tags
                </Badge>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTag === tag ? 'primary' : 'default'}
                    onClick={() => setSelectedTag(tag)}
                    className="cursor-pointer text-[10px] py-0.5 px-2.5"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes Library Card */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-border-alt">
              <h3 className="font-bold text-sm text-text-primary">Recent Notes</h3>
              <div className="text-xs text-text-muted font-medium capitalize">
                Sort: {sortBy}
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center text-text-secondary text-sm p-10 select-none">
                No matching notes found.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredNotes.map((note) => {
                  const isSel = note.id === activeNoteId;
                  const wordCountNum = wordCount(stripHtml(note.content));
                  return (
                    <div
                      key={note.id}
                      onClick={() => selectNote(note)}
                      className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-2 relative ${
                        isSel
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border-alt bg-surface-alt hover:bg-surface-hover hover:border-border'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[10px] text-text-muted font-semibold">
                          {timeAgo(note.updatedAt)}
                        </span>
                        {note.pinned && (
                          <span className="text-primary text-xs">
                            <IconPin className="w-3.5 h-3.5 fill-current" />
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-text-primary truncate">{note.title || 'Untitled Note'}</h4>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {stripHtml(note.content) || <span className="italic opacity-50">Empty content</span>}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-text-muted pt-2 border-t border-border-alt/50">
                        <span className="flex items-center gap-1">
                          {note.tags.length > 0 ? `🏷️ ${note.tags.slice(0,2).join(', ')}` : '📝 Note'}
                        </span>
                        <span>{wordCountNum} words</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right pane: Edit note card / Workspace Panel */}
        <div className={`lg:col-span-8 w-full ${mobilePane === 'list' ? 'hidden lg:block' : 'block'}`}>
          {activeNoteId ? (
            <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm relative">
              {/* Editor Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border-alt">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobilePane('list')}
                    className="lg:hidden btn btn-ghost btn-sm p-1 text-text-secondary"
                  >
                    ← List
                  </button>
                  <h3 className="font-bold text-base text-text-primary">Edit Note</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Pin Toggle */}
                  <button
                    onClick={() => updateNote(activeNoteId, { pinned: !activeNote?.pinned })}
                    className={`btn btn-sm btn-square ${activeNote?.pinned ? 'btn-primary' : 'btn-secondary'}`}
                    title={activeNote?.pinned ? 'Unpin note' : 'Pin note'}
                  >
                    <IconPin className="w-4 h-4" />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      showConfirm('Delete Note', 'Are you sure you want to delete this note?', () => {
                        deleteNote(activeNoteId);
                        setActiveNoteId(null);
                        setMobilePane('list');
                      });
                    }}
                    className="btn btn-danger btn-sm"
                    title="Delete Note"
                  >
                    <IconTrash className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              {/* Title & Tag input row */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Note Title</label>
                  <input
                    type="text"
                    placeholder="Enter title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-text-muted text-text-primary"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsTagsOpen(!isTagsOpen)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 mt-4"
                  >
                    🏷️ Tags <IconChevronDown className="w-3 h-3" />
                  </button>
                  <AnimatePresence>
                    {isTagsOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsTagsOpen(false)} />
                        <div className="absolute right-0 mt-2 p-4 bg-surface border border-border rounded-xl shadow-high w-64 z-20">
                          <label className="text-xs font-semibold text-text-secondary block mb-2">Edit Tags</label>
                          <TagInput tags={tags} onChange={setTags} placeholder="Add tag..." />
                        </div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Rich Text Editor */}
              <div className="flex-1 min-h-[300px]">
                <RichTextEditor value={content} onChange={setContent} placeholder="Start typing your thoughts..." />
              </div>

              {/* Footer status & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border-alt">
                <div className="flex items-center gap-2">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Saving changes...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> Auto-saved just now
                    </span>
                  )}
                  {autoSaveStatus === 'idle' && (
                    <span className="text-xs text-text-muted flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-gray-400" /> Draft edits synchronized
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-text-secondary font-medium">{words} words</span>
                  <button
                    onClick={() => setMobilePane('list')}
                    className="btn btn-secondary btn-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-full bg-surface-alt border flex items-center justify-center text-2xl mb-4">
                📝
              </div>
              <h3 className="text-lg font-bold text-text-primary">No note selected</h3>
              <p className="text-text-secondary text-sm max-w-sm mt-2 leading-relaxed">
                Choose an existing note from the library list or click the **New Note** button to start cataloging references, thoughts, or code snippets.
              </p>
              <button
                onClick={startNewNote}
                className="btn btn-primary btn-md mt-6 flex items-center gap-2"
              >
                <IconPlus className="w-4 h-4" /> Create First Note
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
