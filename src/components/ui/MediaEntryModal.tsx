import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX, IconCheck } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { CustomSelect } from './CustomSelect';

const STATUS_OPTIONS = {
  ANIME: [
    { value: 'WATCHING',  label: 'Watching'  },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DROPPED',   label: 'Dropped'   },
    { value: 'PLANNING',  label: 'Planning'  },
  ],
  GAME: [
    { value: 'PLAYING',   label: 'Playing'   },
    { value: 'FINISHED',  label: 'Finished'  },
    { value: 'DROPPED',   label: 'Dropped'   },
    { value: 'WISHLIST',  label: 'Wishlist'  },
  ],
};

/** Returns color for each rating tier */
function getRatingColor(val: number, active: boolean): { bg: string; text: string } {
  if (!active) return { bg: 'transparent', text: 'var(--text-secondary)' };
  if (val <= 3)  return { bg: 'linear-gradient(135deg,#ef4444,#f97316)', text: '#fff' };  // Red → Orange
  if (val <= 6)  return { bg: 'linear-gradient(135deg,#f59e0b,#eab308)', text: '#000' };  // Amber → Yellow
  return           { bg: 'linear-gradient(135deg,#22c55e,#10b981)', text: '#fff' };        // Green → Emerald
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--bg-surface-alt)',
  border: '1px solid var(--border-border)',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '15px',
  color: 'var(--text-primary)',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s ease',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-secondary)',
  display: 'block',
  marginBottom: '8px',
};

export function MediaEntryModal() {
  const {
    mediaEntryModal, closeMediaEntryModal,
    addMediaLog, updateMediaLog,
  } = useAppStore();

  const { isOpen, editingLog, activeTab } = mediaEntryModal;

  const [title,    setTitle]    = useState('');
  const [status,   setStatus]   = useState('');
  const [rating,   setRating]   = useState(0);
  const [episodes, setEpisodes] = useState('');
  const [season,   setSeason]   = useState('');
  const [notes,    setNotes]    = useState('');

  // Sync form state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (editingLog) {
        setTitle(editingLog.title);
        setStatus(editingLog.status);
        setRating(editingLog.rating || 0);
        setEpisodes(editingLog.episodes?.toString() || '');
        setSeason((editingLog as any).season?.toString() || '');
        setNotes(editingLog.notes);
      } else {
        setTitle('');
        setStatus(activeTab === 'ANIME' ? 'WATCHING' : 'PLAYING');
        setRating(0);
        setEpisodes('');
        setSeason('');
        setNotes('');
      }
    }
  }, [isOpen, editingLog, activeTab]);

  const handleSave = () => {
    if (!title.trim()) return;

    const payload = {
      title,
      status: status as any,
      rating: rating > 0 ? rating : null,
      episodes: activeTab === 'ANIME' ? (parseInt(episodes) || undefined) : undefined,
      season:   activeTab === 'ANIME' ? (parseInt(season)   || undefined) : undefined,
      notes,
    };

    if (editingLog) {
      updateMediaLog(editingLog.id, payload);
    } else {
      addMediaLog({
        id: crypto.randomUUID(),
        type: activeTab,
        addedAt: new Date().toISOString(),
        ...payload,
        notes: payload.notes,
      });
    }
    closeMediaEntryModal();
  };

  const accentColor = activeTab === 'ANIME' ? '#007AFF' : '#a855f7';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="media-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={closeMediaEntryModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            key="media-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.96, y: 18  }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '460px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-border)',
              borderRadius: '32px',
              padding: '32px',
              boxShadow: '0 32px 96px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, margin: 0 }}>
                  {activeTab === 'ANIME' ? 'Anime' : 'Game'} Entry
                </p>
                <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0, lineHeight: 1.15 }}>
                  {editingLog ? 'Edit Entry' : 'Add New'}
                </h3>
              </div>
              <button
                onClick={closeMediaEntryModal}
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-border)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', flexShrink: 0,
                }}
              >
                <IconX size={18} />
              </button>
            </div>

            {/* ── Title ── */}
            <div>
              <label style={labelStyle}>Title</label>
              <input
                type="text"
                autoFocus
                placeholder={activeTab === 'ANIME' ? 'e.g. Attack on Titan' : 'e.g. Elden Ring'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* ── Status (CustomSelect) ── */}
            <CustomSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS[activeTab]}
              className="w-full"
            />

            {/* ── Episodes + Season (Anime only) ── */}
            {activeTab === 'ANIME' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Episodes</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="24"
                    value={episodes}
                    onChange={e => setEpisodes(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Season</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* ── Rating ── */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Rating</label>
                <span style={{
                  fontSize: '13px', fontWeight: 800,
                  color: rating > 0 ? (rating <= 3 ? '#ef4444' : rating <= 6 ? '#f59e0b' : '#22c55e') : 'var(--text-muted)',
                  transition: 'color 0.2s ease',
                }}>
                  {rating > 0 ? `${rating} / 10` : 'Unrated'}
                </span>
              </div>
              <div style={{
                display: 'flex', gap: '5px',
                background: 'var(--bg-surface-alt)',
                padding: '7px',
                borderRadius: '18px',
                border: '1px solid var(--border-border)',
              }}>
                {[1,2,3,4,5,6,7,8,9,10].map(val => {
                  const active = rating >= val;
                  const colors = getRatingColor(val, active);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(rating === val && val === 1 ? 0 : val)}
                      style={{
                        flex: 1, height: '34px',
                        borderRadius: '10px', border: 'none',
                        cursor: 'pointer',
                        fontWeight: 900, fontSize: '12px',
                        background: colors.bg,
                        color: colors.text,
                        transition: 'all 0.15s ease',
                        transform: active ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: active ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '0 4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#ef4444' }}>Poor</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#f59e0b' }}>Mixed</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#22c55e' }}>Great</span>
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label style={labelStyle}>Review Notes</label>
              <textarea
                placeholder="Your thoughts, impressions, or review..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'none' }}
              />
            </div>

            {/* ── Actions ── */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--border-border)',
            }}>
              <button
                onClick={closeMediaEntryModal}
                style={{
                  padding: '11px 22px', borderRadius: '999px', border: '1px solid var(--border-border)',
                  background: 'var(--bg-surface-alt)', color: 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s ease',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                style={{
                  padding: '11px 22px', borderRadius: '999px', border: 'none',
                  background: title.trim() ? accentColor : 'var(--bg-surface-alt)',
                  color: title.trim() ? '#fff' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '14px',
                  cursor: title.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '7px',
                  transition: 'all 0.2s ease', fontFamily: 'inherit',
                  boxShadow: title.trim() ? `0 4px 16px ${accentColor}50` : 'none',
                }}
              >
                <IconCheck size={16} />
                {editingLog ? 'Update' : 'Save Entry'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
