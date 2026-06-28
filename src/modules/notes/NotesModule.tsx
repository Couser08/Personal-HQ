import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconSearch, IconPin, IconEdit, IconFileDescription, IconTags, IconCalendarEvent, IconDots, IconFilter } from '@tabler/icons-react';
import { useAppStore, type Note } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';

import { TagInput } from '../../components/ui/TagInput';

export default function NotesModule() {
  const { notes, addNote, updateNote, deleteNote , showConfirm} = useAppStore();
  
  const [search, setSearch] = useState('');
  const [selectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pinned' | 'recent' | 'trash'>('all');

  // Form states
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
    if (!title.trim() && !content.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title,
        content,
        tags,
        updatedAt: new Date().toISOString()
      });
    } else {
      addNote({
        id: crypto.randomUUID(),
        title,
        content,
        tags,
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

  const allTags = useMemo(() => {
    const t = new Set<string>();
    notes.forEach(n => n.tags.forEach(tag => t.add(tag)));
    return Array.from(t);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (activeTab === 'pinned') filtered = filtered.filter(n => n.pinned);
    // Recent can just sort by date, but let's just show all for now since we sort anyway
    
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
    }
    if (selectedTag) {
      filtered = filtered.filter(n => n.tags.includes(selectedTag));
    }
    return filtered.sort((a, b) => {
      if (a.pinned === b.pinned) {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.pinned ? -1 : 1;
    });
  }, [notes, search, selectedTag, activeTab]);

  const statCardStyle = {
    background: 'var(--bg-surface)',
    borderRadius: 16, border: '1px solid var(--border-border)', padding: '16px 20px',
    display: 'flex', alignItems: 'center', gap: 16, flex: '1 1 200px'
  };

  const thisWeekNotes = notes.filter(n => {
    const diffTime = Math.abs(new Date().getTime() - new Date(n.createdAt).getTime());
    return diffTime < (7 * 24 * 60 * 60 * 1000);
  }).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-full gap-6 pb-20"
      style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}
    >
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Quick Notes <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm mt-1">Capture your thoughts and ideas</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <IconSearch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 10, border: '1px solid var(--border-border)', background: 'var(--bg-surface)', fontSize: 13, outline: 'none' }}
            />
          </div>
          <button style={{ padding: 8, borderRadius: 10, border: '1px solid var(--border-border)', background: 'var(--bg-surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconFilter size={18} className="text-text-secondary" />
          </button>
          <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#f43f5e', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <IconPlus size={16} /> New Note
          </button>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={statCardStyle}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244,63,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', flexShrink: 0 }}>
            <IconFileDescription size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Notes</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{notes.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>+{thisWeekNotes} this week</div>
          </div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', flexShrink: 0 }}>
            <IconPin size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Pinned Notes</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{notes.filter(n=>n.pinned).length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Important</div>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', flexShrink: 0 }}>
            <IconTags size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Tags</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{allTags.length}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Organized</div>
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', flexShrink: 0 }}>
            <IconCalendarEvent size={24} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>This Week</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{thisWeekNotes}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Notes added</div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'pinned', 'recent', 'trash'] as const).map(tab => {
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: isActive ? 'none' : '1px solid var(--border-border)',
                background: isActive ? '#f43f5e' : 'var(--bg-surface)', color: isActive ? '#fff' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: isActive ? 600 : 500, cursor: 'pointer', textTransform: 'capitalize', whiteSpace: 'nowrap'
              }}>
              {tab === 'all' ? 'All Notes' : tab}
            </button>
          );
        })}
      </div>

      {/* ── Grid ── */}
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-surface rounded-2xl border border-border">
          <div className="w-16 h-16 mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <IconEdit size={32} />
          </div>
          <h3 className="text-lg font-bold mb-2">No notes yet</h3>
          <p className="text-text-secondary max-w-sm mb-6 text-sm">Start writing your thoughts, ideas, or daily tasks to keep everything organized.</p>
          <button onClick={() => handleOpenModal()} className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold">
            Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-max">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                key={note.id} onClick={() => handleOpenModal(note)}
                style={{
                  background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-border)', padding: 20,
                  display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer', position: 'relative',
                  minHeight: 160
                }}
                whileHover={{ y: -2, boxShadow: '0 12px 24px rgba(0,0,0,0.04)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, lineHeight: 1.4, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {note.title || 'Untitled'}
                  </h3>
                  <button onClick={(e) => { e.stopPropagation(); updateNote(note.id, { pinned: !note.pinned }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, margin: -4, color: note.pinned ? '#f43f5e' : 'var(--border-border)' }}>
                    <IconPin size={16} fill={note.pinned ? '#f43f5e' : 'none'} />
                  </button>
                </div>
                
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1,
                  display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {note.content}
                </p>
                
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 'auto' }}>
                    {note.tags.slice(0, 2).map(t => (
                      <span key={t} style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>
                        {t}
                      </span>
                    ))}
                    {note.tags.length > 2 && <span style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600 }}>+{note.tags.length - 2}</span>}
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--border-border-alt)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(note.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2, display: 'flex' }}
                    onClick={(e) => { e.stopPropagation(); showConfirm('Confirm Delete', 'Delete this note?', () => { deleteNote(note.id); }); }}>
                    <IconDots size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNote ? 'Edit Note' : 'New Note'}>
        <div className="flex flex-col gap-4">
          <input type="text" placeholder="Note title" value={title} onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', fontSize: 20, fontWeight: 700, outline: 'none', color: 'var(--text-primary)' }}
          />
          <textarea placeholder="Write your thoughts..." value={content} onChange={(e) => setContent(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', minHeight: 200, resize: 'none', outline: 'none', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}
          />
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <label className="text-xs text-text-muted font-medium">Tags (press Enter to add)</label>
            <TagInput tags={tags} onChange={setTags} placeholder="e.g. work, ideas, personal" />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors">
              Save Note
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
