import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX, IconCheck, IconStar } from '@tabler/icons-react';
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

function getRatingBg(val: number, active: boolean) {
  if (!active) return 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500';
  if (val <= 3) return 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105';
  if (val <= 6) return 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105';
  return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105';
}

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



  useEffect(() => {
    if (isOpen) {
      if (editingLog) {
        setTitle(editingLog.title);
        setStatus(editingLog.status);
        setRating(editingLog.rating || 0);
        setEpisodes(editingLog.episodes?.toString() || '');
        
        let parsedNotes = editingLog.notes;
        let parsedSeason = '';
        try {
          if (editingLog.notes && editingLog.notes.trim().startsWith('{')) {
            const meta = JSON.parse(editingLog.notes);
            if (meta && typeof meta === 'object') {
              parsedNotes = meta.notesText ?? '';
              parsedSeason = meta.season?.toString() || '';
            }
          }
        } catch (e) {
          // Fallback if not JSON
        }

        setNotes(parsedNotes);
        setSeason(parsedSeason);
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

    const isAnime = activeTab === 'ANIME';
    let finalNotes = notes;

    if (isAnime) {
      // Preserve existing checklist/resume data when editing via modal
      let existingWatched: number[] = [];
      let existingTimestamps: Record<number, string> = {};
      let existingLastEp: number | null = null;
      let existingLastTime = '';

      if (editingLog) {
        try {
          if (editingLog.notes && editingLog.notes.trim().startsWith('{')) {
            const meta = JSON.parse(editingLog.notes);
            existingWatched = meta.watchedEpisodes ?? [];
            existingTimestamps = meta.timestamps ?? {};
            existingLastEp = meta.lastWatchedEp ?? null;
            existingLastTime = meta.lastWatchedTimestamp ?? '';
          }
        } catch (e) {}
      }

      const meta = {
        notesText: notes,
        season: parseInt(season) || 1,
        watchedEpisodes: existingWatched,
        timestamps: existingTimestamps,
        lastWatchedEp: existingLastEp,
        lastWatchedTimestamp: existingLastTime
      };
      finalNotes = JSON.stringify(meta);
    }

    const payload = {
      title,
      status: status as any,
      rating: rating > 0 ? rating : null,
      episodes: isAnime ? (parseInt(episodes) || undefined) : undefined,
      season:   isAnime ? (parseInt(season)   || undefined) : undefined,
      notes: finalNotes,
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

  const isAnime = activeTab === 'ANIME';
  const themeColor = isAnime ? '#007AFF' : '#A855F7';
  const accentTextClass = isAnime ? 'text-blue-500 dark:text-blue-400' : 'text-purple-500 dark:text-purple-400';
  const accentFocusClass = isAnime ? 'focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10' : 'focus:border-purple-500/60 focus:ring-4 focus:ring-purple-500/10';

  const labelClassName = "block text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2";
  const inputClassName = `w-full bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl px-4 py-3 text-[14px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none transition-all duration-200 ${accentFocusClass}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="media-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeMediaEntryModal}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-md"
        >
          <motion.div
            key="media-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-900 rounded-3xl p-6 sm:p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] dark:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] flex flex-col gap-6 custom-scrollbar"
          >
            {/* Header section */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${accentTextClass} m-0`}>
                  {isAnime ? 'Anime' : 'Game'} Tracker Workspace
                </p>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight m-0 mt-0.5">
                  {editingLog ? 'Edit Entry' : 'Add New'}
                </h3>
              </div>
              <button
                onClick={closeMediaEntryModal}
                className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer active:scale-95 transition-all"
              >
                <IconX size={14} style={{ strokeWidth: 2.5 }} />
              </button>
            </div>

            {/* Title Block */}
            <div>
              <label className={labelClassName}>Title</label>
              <input
                type="text"
                autoFocus
                placeholder={isAnime ? 'e.g. Attack on Titan' : 'e.g. Elden Ring'}
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Status Selector */}
            <CustomSelect
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS[activeTab]}
              className="w-full text-[14px]"
            />

            {/* Meta Attributes Layer (Anime only) */}
            {isAnime && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClassName}>Season</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label className={labelClassName}>Total Episodes</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 12"
                    value={episodes}
                    onChange={e => setEpisodes(e.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>
            )}

            {/* Premium Rating Matrix */}
            <div className="bg-zinc-50/40 dark:bg-zinc-900/20 border border-zinc-100 dark:border-zinc-900 p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                  <IconStar size={13} className={rating > 0 ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'} />
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 m-0">Rating Score</label>
                </div>
                <span className={`text-[13px] font-extrabold px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm ${
                  rating > 0 
                    ? (rating <= 3 ? 'text-red-500' : rating <= 6 ? 'text-amber-500' : 'text-emerald-500') 
                    : 'text-zinc-400'
                }`}>
                  {rating > 0 ? `${rating} / 10` : 'Unrated'}
                </span>
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[1,2,3,4,5,6,7,8,9,10].map(val => {
                  const active = rating >= val;
                  const btnClasses = getRatingBg(val, active);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRating(rating === val && val === 1 ? 0 : val)}
                      className={`h-9 rounded-xl border-none cursor-pointer font-black text-[12px] flex items-center justify-center transition-all duration-200 ${btnClasses}`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Frame */}
            <div>
              <label className={labelClassName}>Review Notes</label>
              <textarea
                placeholder="Your thoughts, impressions, or review..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className={`${inputClassName} resize-none`}
              />
            </div>

            {/* Bottom Panel Actions */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <button
                onClick={closeMediaEntryModal}
                className="px-5 py-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-bold text-[13.5px] cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                style={{
                  boxShadow: title.trim() ? `0 10px 25px -5px ${themeColor}40` : 'none',
                  backgroundColor: title.trim() ? themeColor : ''
                }}
                className={`px-5 py-2.5 rounded-xl border-none font-bold text-[13.5px] flex items-center gap-1.5 transition-all duration-200 ${
                  title.trim()
                    ? 'text-white cursor-pointer hover:brightness-110 active:scale-98'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                }`}
              >
                <IconCheck size={15} style={{ strokeWidth: 2.5 }} />
                {editingLog ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}