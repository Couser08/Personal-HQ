import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { IconX, IconCheck, IconStar } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
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
  SERIES: [
    { value: 'WATCHING',  label: 'Watching'  },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DROPPED',   label: 'Dropped'   },
    { value: 'PLANNING',  label: 'Planning'  },
  ],
  MOVIE: [
    { value: 'PLANNING',  label: 'Plan to Watch' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DROPPED',   label: 'Dropped' },
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
  } = useAppStore(useShallow(state => ({
    mediaEntryModal: state.mediaEntryModal,
    closeMediaEntryModal: state.closeMediaEntryModal,
    addMediaLog: state.addMediaLog,
    updateMediaLog: state.updateMediaLog,
  })));

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
        setStatus(
          activeTab === 'ANIME' || activeTab === 'SERIES' 
            ? 'WATCHING' 
            : activeTab === 'MOVIE' 
              ? 'PLANNING' 
              : 'PLAYING'
        );
        setRating(0);
        setEpisodes('');
        setSeason('');
        setNotes('');
      }
    }
  }, [isOpen, editingLog, activeTab]);

  const handleSave = () => {
    if (!title.trim()) return;

    const isAnimeOrSeries = activeTab === 'ANIME' || activeTab === 'SERIES';
    let finalNotes = notes;

    if (isAnimeOrSeries || activeTab === 'MOVIE') {
      // Preserve existing checklist/resume data when editing via modal
      let existingWatched: number[] = [];
      let existingTimestamps: Record<number, string> = {};
      let existingLastEp: number | null = null;
      let existingLastTime = '';
      let existingBanner = '';
      let existingThumb = '';

      if (editingLog) {
        try {
          if (editingLog.notes && editingLog.notes.trim().startsWith('{')) {
            const meta = JSON.parse(editingLog.notes);
            existingWatched = meta.watchedEpisodes ?? [];
            existingTimestamps = meta.timestamps ?? {};
            existingLastEp = meta.lastWatchedEp ?? null;
            existingLastTime = meta.lastWatchedTimestamp ?? '';
            existingBanner = meta.bannerImage ?? '';
            existingThumb = meta.episodeThumb ?? '';
          }
        } catch (e) {}
      }

      const meta = {
        notesText: notes,
        season: isAnimeOrSeries ? (parseInt(season) || 1) : undefined,
        watchedEpisodes: isAnimeOrSeries ? existingWatched : undefined,
        timestamps: isAnimeOrSeries ? existingTimestamps : undefined,
        lastWatchedEp: isAnimeOrSeries ? existingLastEp : undefined,
        lastWatchedTimestamp: isAnimeOrSeries ? existingLastTime : undefined,
        bannerImage: existingBanner,
        episodeThumb: isAnimeOrSeries ? existingThumb : undefined,
      };
      finalNotes = JSON.stringify(meta);
    }

    const payload = {
      title,
      status: status as any,
      rating: rating > 0 ? rating : null,
      episodes: isAnimeOrSeries ? (parseInt(episodes) || undefined) : undefined,
      season:   isAnimeOrSeries ? (parseInt(season)   || undefined) : undefined,
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

  const isAnimeOrSeries = activeTab === 'ANIME' || activeTab === 'SERIES';
  const themeColor = activeTab === 'ANIME' ? '#e11d48' : activeTab === 'SERIES' ? '#3b82f6' : activeTab === 'MOVIE' ? '#10b981' : '#a855f7';
  const labelClassName = 'text-[11px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 block';
  const inputClassName = 'w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold text-text-primary focus:outline-none focus:border-rose-500/50 transition-colors focus:ring-1 focus:ring-rose-500/20';

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          style={{ willChange: 'transform, opacity' }}
          className="w-full max-w-[420px] bg-surface rounded-[32px] border border-border shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-border/40 bg-zinc-50/50 dark:bg-zinc-900/10">
            <div>
              <h3 className="text-sm font-black text-text-primary uppercase tracking-wider">
                {editingLog ? 'Edit Log Entry' : 'Log New Item'}
              </h3>
              <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                Category: <span className="font-bold text-primary">{activeTab === 'ANIME' ? 'Anime' : activeTab === 'GAME' ? 'Game' : activeTab === 'SERIES' ? 'TV Series' : 'Movie'}</span>
              </p>
            </div>
            <button
              onClick={closeMediaEntryModal}
              className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors border-none bg-transparent cursor-pointer"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 max-h-[480px] overflow-y-auto custom-scrollbar flex flex-col gap-4 text-left">
            {/* Title Block */}
            <div>
              <label htmlFor="media-title" className={labelClassName}>Title</label>
              <input
                id="media-title"
                type="text"
                autoFocus
                placeholder={
                  activeTab === 'ANIME' 
                    ? 'e.g. Attack on Titan' 
                    : activeTab === 'SERIES' 
                      ? 'e.g. Breaking Bad' 
                      : activeTab === 'MOVIE' 
                        ? 'e.g. Inception' 
                        : 'e.g. Elden Ring'
                }
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

            {/* Meta Attributes Layer (Anime & Series) */}
            {isAnimeOrSeries && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="media-season" className={labelClassName}>Season</label>
                  <input
                    id="media-season"
                    type="number"
                    min={1}
                    placeholder="e.g. 1"
                    value={season}
                    onChange={e => setSeason(e.target.value)}
                    className={inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="media-episodes" className={labelClassName}>Total Episodes</label>
                  <input
                    id="media-episodes"
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
                      aria-label={`Rate ${val} out of 10`}
                      aria-pressed={rating === val}
                      className={`h-9 rounded-xl border-none cursor-pointer font-black text-[12px] flex items-center justify-center transition-all duration-200 ${btnClasses} focus-visible:ring-2 focus-visible:ring-primary/45`}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review Frame */}
            <div>
              <label htmlFor="media-notes" className={labelClassName}>Review Notes</label>
              <textarea
                id="media-notes"
                placeholder="Your thoughts, impressions, or review..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className={`${inputClassName} resize-none`}
              />
            </div>
          </div>

          {/* Bottom Panel Actions */}
          <div className="flex justify-end gap-2.5 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/10 border-t border-border/40">
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
      </div>
    </AnimatePresence>
  );
}