import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconSearch, IconPin, IconTrash, IconEdit, IconNotes, IconSparkles, IconClock } from '@tabler/icons-react';
import { useAppStore, type Note } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { TagInput } from '../../components/ui/TagInput';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { EmptyState } from '../../components/ui/EmptyState';

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
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

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
    } else {
      setEditingNote(null);
      setTitle('');
      setContent('');
      setTags([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim() && !stripHtml(content).trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, { title, content, tags, updatedAt: new Date().toISOString() });
    } else {
      addNote({
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setIsModalOpen(false);
  };

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
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, search, selectedTag]);

  const pinnedCount = notes.filter((note) => note.pinned).length;
  const recentCount = notes.filter((note) => Date.now() - new Date(note.updatedAt).getTime() < 1000 * 60 * 60 * 24).length;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }} className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Quick Notes <span className="w-2 h-2 rounded-full bg-primary inline-block" aria-hidden="true" />
          </h1>
          <p className="text-text-secondary text-sm">A cleaner notebook for ideas, references, and fast code snippets.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary btn-md">
          <IconPlus className="w-4 h-4" /> New Note
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-surface border border-border rounded-[20px] p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Workspace</p>
              <h2 className="text-lg font-bold mt-1">Search across your note library</h2>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <IconSparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="relative w-full">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input type="search" placeholder="Search notes" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge variant={selectedTag === null ? 'primary' : 'default'} onClick={() => setSelectedTag(null)}>All notes</Badge>
              {allTags.map((tag) => (
                <Badge key={tag} variant={selectedTag === tag ? 'primary' : 'default'} onClick={() => setSelectedTag(tag)}>{tag}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-[20px] p-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Total</p>
            <p className="text-2xl font-bold mt-2">{notes.length}</p>
          </div>
          <div className="rounded-2xl bg-surface-alt border border-border-alt p-4">
            <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Pinned</p>
            <p className="text-2xl font-bold mt-2">{pinnedCount}</p>
          </div>
          <div className="col-span-2 rounded-2xl bg-surface-alt border border-border-alt p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.08em] text-text-muted">Edited Today</p>
              <p className="text-xl font-bold mt-1">{recentCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<IconNotes className="w-9 h-9 text-text-muted" />}
          title="No notes yet"
          description="Start writing your thoughts, ideas, or code references with richer formatting and real code blocks."
          action={<button onClick={() => handleOpenModal()} className="btn btn-primary btn-md">Create first note</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredNotes.map((note) => {
              const plainText = stripHtml(note.content);
              const words = wordCount(plainText);

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                  key={note.id}
                  onClick={() => handleOpenModal(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenModal(note)}
                  aria-label={`Edit note: ${note.title || 'Untitled'}`}
                  className="group bg-surface border border-border rounded-[22px] p-5 flex flex-col gap-4 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{timeAgo(note.updatedAt)}</span>
                        {note.pinned && <span className="text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-2 py-1">Pinned</span>}
                      </div>
                      <h3 className="font-bold text-base text-text-primary leading-snug line-clamp-2">{note.title || <span className="text-text-muted italic font-normal">Untitled note</span>}</h3>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); updateNote(note.id, { pinned: !note.pinned }); }} aria-label={note.pinned ? 'Unpin note' : 'Pin note'} className={`btn btn-sm btn-square ${note.pinned ? 'btn-primary' : 'btn-ghost'}`}>
                      <IconPin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div className="rounded-2xl border border-border-alt bg-surface-alt/70 p-4 min-h-[132px] flex-1">
                    <p className="text-sm text-text-secondary leading-relaxed line-clamp-5 whitespace-pre-wrap">{plainText || <span className="italic text-text-muted">Empty note</span>}</p>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
                    <span>{words} words</span>
                    <div className="flex items-center gap-2">
                      <button onClick={(e) => { e.stopPropagation(); handleOpenModal(note); }} className="btn btn-ghost btn-sm btn-square" aria-label="Edit note"><IconEdit className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); showConfirm('Delete Note', 'Delete this note permanently?', () => deleteNote(note.id)); }} className="btn btn-ghost btn-sm btn-square hover:text-rose-500" aria-label="Delete note"><IconTrash className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {note.tags.slice(0, 4).map((tag) => <Badge key={tag} className="text-[10px] py-0 px-2 rounded-md">{tag}</Badge>)}
                      {note.tags.length > 4 && <Badge className="text-[10px] py-0 px-2 rounded-md">+{note.tags.length - 4}</Badge>}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </AnimatePresence>

          {filteredNotes.length === 0 && <div className="col-span-full bg-surface border border-border rounded-2xl p-10 text-center text-text-muted">No notes matching your current search or filter.</div>}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? 'Edit Note' : 'New Note'}>
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-none text-xl font-bold focus:outline-none placeholder:text-text-muted text-text-primary" />
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your thoughts, add lists, or drop in a code snippet..." />
          <div className="flex flex-col gap-1.5 pt-3 border-t border-border">
            <label className="text-xs text-text-muted font-medium uppercase tracking-wider">Tags</label>
            <TagInput tags={tags} onChange={setTags} placeholder="Type and press Enter" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-md">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary btn-md">Save</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
