import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';

const STATUS_OPTIONS = {
  ANIME: ['WATCHING', 'COMPLETED', 'DROPPED', 'PLANNING'],
  GAME: ['PLAYING', 'FINISHED', 'DROPPED', 'WISHLIST']
};

export function MediaEntryModal() {
  const {
    mediaEntryModal, closeMediaEntryModal,
    addMediaLog, updateMediaLog
  } = useAppStore();

  const { isOpen, editingLog, activeTab } = mediaEntryModal;

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState(0);
  const [episodes, setEpisodes] = useState('');
  const [notes, setNotes] = useState('');

  // Sync form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingLog) {
        setTitle(editingLog.title);
        setStatus(editingLog.status);
        setRating(editingLog.rating || 0);
        setEpisodes(editingLog.episodes?.toString() || '');
        setNotes(editingLog.notes);
      } else {
        setTitle('');
        setStatus(activeTab === 'ANIME' ? 'WATCHING' : 'PLAYING');
        setRating(0);
        setEpisodes('');
        setNotes('');
      }
    }
  }, [isOpen, editingLog, activeTab]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingLog) {
      updateMediaLog(editingLog.id, {
        title,
        status: status as any,
        rating: rating > 0 ? rating : null,
        episodes: activeTab === 'ANIME' ? (parseInt(episodes) || 0) : undefined,
        notes
      });
    } else {
      addMediaLog({
        id: crypto.randomUUID(),
        type: activeTab,
        title,
        status: status as any,
        rating: rating > 0 ? rating : null,
        episodes: activeTab === 'ANIME' ? (parseInt(episodes) || 0) : undefined,
        notes,
        addedAt: new Date().toISOString()
      });
    }
    closeMediaEntryModal();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="media-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={closeMediaEntryModal}
        >
          <motion.div
            key="media-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-border)',
              borderRadius: '28px',
              padding: '32px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
                {editingLog ? 'Edit Entry' : `Add ${activeTab === 'ANIME' ? 'Anime' : 'Game'}`}
              </h3>
              <button
                onClick={closeMediaEntryModal}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--bg-surface-alt)', border: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Title</label>
              <input
                type="text"
                autoFocus
                placeholder={`e.g. ${activeTab === 'ANIME' ? 'Attack on Titan' : 'Elden Ring'}`}
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-border)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            </div>

            {/* Status + Episodes */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface-alt)',
                    border: '1px solid var(--border-border)',
                    borderRadius: '14px',
                    padding: '12px 16px',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {STATUS_OPTIONS[activeTab].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {activeTab === 'ANIME' && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Episodes</label>
                  <input
                    type="number"
                    placeholder="24"
                    value={episodes}
                    onChange={e => setEpisodes(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-border)',
                      borderRadius: '14px',
                      padding: '12px 16px',
                      fontSize: '15px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rating */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>Rating</label>
                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>{rating > 0 ? `${rating}/10` : 'Unrated'}</span>
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-alt)', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-border)' }}>
                {[1,2,3,4,5,6,7,8,9,10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    style={{
                      flex: 1, height: '32px', borderRadius: '10px', border: 'none',
                      cursor: 'pointer', fontWeight: 900, fontSize: '12px',
                      background: rating >= val ? '#f59e0b' : 'transparent',
                      color: rating >= val ? '#000' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Review Notes</label>
              <textarea
                placeholder="Thoughts, review, tags..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-border)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px', borderTop: '1px solid var(--border-border)' }}>
              <button
                onClick={closeMediaEntryModal}
                style={{
                  padding: '10px 20px', borderRadius: '999px', border: 'none',
                  background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                style={{
                  padding: '10px 20px', borderRadius: '999px', border: 'none',
                  background: title.trim() ? '#007AFF' : 'var(--bg-surface-alt)',
                  color: title.trim() ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '14px', cursor: title.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  transition: 'all 0.2s ease',
                }}
              >
                <IconCheck size={16} />
                Save Entry
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
