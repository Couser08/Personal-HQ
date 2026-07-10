import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IconMovie, IconPlus, IconArrowLeft, IconStarFilled 
} from '@tabler/icons-react';

import { type MediaLog } from '../../store/useAppStore';

interface MediaDetailViewProps {
  selectedAnime: MediaLog;
  setSelectedAnimeId: (id: string | null) => void;
  theme: string;
  settings: any;
  updateSettings: (data: any) => void;
  updateMediaLog: (id: string, data: any) => void;
  chibiMascotUrl: string;
  setChibiMascotUrl: (url: string) => void;
  openMediaEntryModal: (type: 'ANIME' | 'GAME', log?: any) => void;
}

export const MediaDetailView: React.FC<MediaDetailViewProps> = ({
  selectedAnime,
  setSelectedAnimeId,
  theme,
  settings,
  updateSettings,
  updateMediaLog,
  chibiMascotUrl,
  setChibiMascotUrl,
  openMediaEntryModal,
}) => {
  const [visibleEpisodes, setVisibleEpisodes] = useState(25);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');

  useEffect(() => {
    setVisibleEpisodes(25);
  }, [selectedAnime.id]);

  let notesText = selectedAnime.notes || '';
  let season = (selectedAnime as any).season || 1;
  let watchedEpisodes: number[] = [];
  let timestamps: Record<number, string> = {};
  let lastWatchedEp = '';
  let lastWatchedTimestamp = '';
  let bannerImage = '/anime_hero_banner_1783275383433.png';
  let episodeThumb = '/anime_episode_thumb_1783275399662.png';

  try {
    if (selectedAnime.notes && selectedAnime.notes.trim().startsWith('{')) {
      const meta = JSON.parse(selectedAnime.notes);
      notesText = meta.notesText ?? '';
      season = meta.season ?? 1;
      watchedEpisodes = meta.watchedEpisodes ?? [];
      timestamps = meta.timestamps ?? {};
      lastWatchedEp = meta.lastWatchedEp?.toString() || '';
      lastWatchedTimestamp = meta.lastWatchedTimestamp ?? '';
      bannerImage = meta.bannerImage ?? '/anime_hero_banner_1783275383433.png';
      episodeThumb = meta.episodeThumb ?? '/anime_episode_thumb_1783275399662.png';
    }
  } catch (e) {}

  const saveAnimeMeta = (updates: {
    notesText?: string;
    season?: number;
    watchedEpisodes?: number[];
    timestamps?: Record<number, string>;
    lastWatchedEp?: number | null;
    lastWatchedTimestamp?: string;
    bannerImage?: string;
    episodeThumb?: string;
  }) => {
    const meta = {
      notesText: updates.notesText !== undefined ? updates.notesText : notesText,
      season: updates.season !== undefined ? updates.season : season,
      watchedEpisodes: updates.watchedEpisodes !== undefined ? updates.watchedEpisodes : watchedEpisodes,
      timestamps: updates.timestamps !== undefined ? updates.timestamps : timestamps,
      lastWatchedEp: updates.lastWatchedEp !== undefined ? updates.lastWatchedEp : (lastWatchedEp ? parseInt(lastWatchedEp) : null),
      lastWatchedTimestamp: updates.lastWatchedTimestamp !== undefined ? updates.lastWatchedTimestamp : lastWatchedTimestamp,
      bannerImage: updates.bannerImage !== undefined ? updates.bannerImage : bannerImage,
      episodeThumb: updates.episodeThumb !== undefined ? updates.episodeThumb : episodeThumb,
    };
    updateMediaLog(selectedAnime.id, {
      notes: JSON.stringify(meta)
    });
  };

  const epCount = selectedAnime.episodes || 0;
  const progressPercent = epCount > 0 ? Math.min(100, Math.round((watchedEpisodes.length / epCount) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col w-full min-h-screen pb-16 font-sans text-left bg-background select-none"
    >
      <style>{`
        .anime-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #F43F5E;
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .anime-checkbox:checked {
          background-color: #F43F5E;
          box-shadow: 0 0 10px rgba(244, 63, 94, 0.4);
        }
        .anime-checkbox:checked::after {
          content: '✓';
          color: white;
          font-weight: 900;
          font-size: 11px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      {/* Hero Banner Area */}
      <div className="relative w-full h-[280px] md:h-[340px] shrink-0 overflow-hidden bg-surface group/banner">
        <img 
          src={bannerImage} 
          alt="Hero Banner" 
          className="object-cover object-center w-full h-full"
        />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        <div className="absolute flex items-start justify-between top-6 left-6 right-6 z-20">
          <div className="absolute top-0 right-0">
            <input
              type="file"
              accept="image/*"
              id="banner-image-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    saveAnimeMeta({ bannerImage: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label
              htmlFor="banner-image-upload"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white transition-all border rounded-full shadow-lg cursor-pointer border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 hover:scale-105 active:scale-95"
              title="Upload Widescreen Banner"
            >
              <IconPlus size={14} />
              <span>Upload Banner (16:9)</span>
            </label>
          </div>
          <div className="flex flex-col items-start flex-1 max-w-xl gap-4 mr-24 md:max-w-2xl">
            <button
              onClick={() => setSelectedAnimeId(null)}
              className="flex items-center justify-center gap-2 px-4 py-2 transition-colors border rounded-full shadow-lg cursor-pointer text-rose-500 border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60"
            >
              <IconArrowLeft size={16} />
              <span className="text-xs font-bold">Back to Catalogue</span>
            </button>
            
            <div className="w-full mt-4">
              {isEditingQuote ? (
                <input
                  type="text"
                  value={quoteInput}
                  onChange={(e) => setQuoteInput(e.target.value)}
                  onBlur={() => {
                    setIsEditingQuote(false);
                    updateSettings({ mediaQuote: quoteInput });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingQuote(false);
                      updateSettings({ mediaQuote: quoteInput });
                    } else if (e.key === 'Escape') {
                      setIsEditingQuote(false);
                    }
                  }}
                  className="w-full max-w-xl px-4 py-2 text-xl font-bold tracking-tight text-white transition-all border shadow-2xl bg-black/60 backdrop-blur-md border-white/20 md:text-2xl focus:outline-none rounded-2xl focus:border-rose-500"
                  autoFocus
                />
              ) : (
                <p 
                  onDoubleClick={() => {
                    setQuoteInput(settings.mediaQuote || "Outdo your yesterday.");
                    setIsEditingQuote(true);
                  }}
                  className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] cursor-pointer hover:text-rose-400 transition-colors select-none max-w-xl"
                  title="Double-click to edit quote"
                >
                  "{settings.mediaQuote || "Outdo your yesterday."}"
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Title positioned inside the banner */}
        <div className="absolute z-10 flex flex-col justify-between gap-4 bottom-6 left-6 md:left-8 right-6 md:right-8 md:flex-row md:items-end">
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {selectedAnime.title}
          </h2>
          <div className="flex items-center gap-3 shrink-0">
            {selectedAnime.rating ? (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-alt border border-border shadow-xl">
                <IconStarFilled className="w-4 h-4 text-rose-500" />
                <span className="text-sm font-black text-text-primary">
                  {selectedAnime.rating}<span className="text-xs font-bold text-text-muted">/10</span>
                </span>
              </div>
            ) : null}
            <button
              onClick={() => openMediaEntryModal('ANIME', selectedAnime)}
              className="px-5 py-2 rounded-full bg-[#F43F5E] hover:bg-[#E11D48] text-white text-xs font-bold shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all cursor-pointer"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 pt-8 md:pt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Column: Episode Tracker */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface rounded-[24px] border border-border p-6 shadow-2xl relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500">
                  <IconMovie size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-black tracking-widest uppercase text-text-primary">Episode Progress Tracker</h3>
                  <p className="text-[10px] text-text-muted mt-0.5">Track anime episodes you've watched</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  id="episode-thumb-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        saveAnimeMeta({ episodeThumb: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="episode-thumb-upload"
                  className="text-[10px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded-md cursor-pointer transition-colors flex items-center gap-1"
                  title="Upload Square Thumbnail"
                >
                  <IconPlus size={10} />
                  <span>Upload Thumb (1:1)</span>
                </label>
                <span className="text-sm font-black text-text-primary">{watchedEpisodes.length} / {epCount}</span>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-md">{progressPercent}%</span>
              </div>
            </div>

            {/* Grid List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              {epCount === 0 ? (
                <p className="col-span-2 py-10 text-xs italic text-center text-text-muted">No episodes found. Update total episodes.</p>
              ) : (
                <>
                  {Array.from({ length: Math.min(epCount, visibleEpisodes) }, (_, i) => i + 1).map(epNum => {
                    const checked = watchedEpisodes.includes(epNum);
                    return (
                      <div
                        key={epNum}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          checked 
                            ? 'bg-surface-alt border-rose-500/30 shadow-[0_4px_20px_rgba(244,63,94,0.05)]' 
                            : 'bg-surface-alt border-transparent hover:border-border'
                        }`}
                      >
                        <div className="flex justify-center w-6 shrink-0">
                          <span className="text-[10px] font-black text-text-muted">{epNum.toString().padStart(2, '0')}</span>
                        </div>
                        
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            let updated;
                            if (checked) {
                              updated = watchedEpisodes.filter(e => e !== epNum);
                            } else {
                              updated = [...watchedEpisodes, epNum];
                            }
                            saveAnimeMeta({ watchedEpisodes: updated });
                          }}
                          className="anime-checkbox shrink-0"
                        />

                        <img 
                          src={episodeThumb} 
                          alt="Thumb" 
                          className={`w-12 h-8 rounded-md object-cover shrink-0 ml-1 transition-all ${!checked && 'opacity-40 grayscale'}`}
                        />

                        <div className="flex flex-col flex-1 min-w-0 ml-1">
                          <span className="text-[11px] font-bold text-text-primary truncate">Episode {epNum}</span>
                          <span className={`text-[8px] font-black uppercase tracking-wider ${checked ? 'text-rose-500' : 'text-text-muted'}`}>
                            {checked ? 'Watched' : 'Not Watched'}
                          </span>
                        </div>
                        
                        {checked && (
                          <div className="shrink-0">
                            <input
                              type="text"
                              placeholder="00:00"
                              value={timestamps[epNum] || ''}
                              onChange={e => {
                                const updatedTime = { ...timestamps, [epNum]: e.target.value };
                                saveAnimeMeta({ timestamps: updatedTime });
                              }}
                              className="w-12 bg-background border border-border rounded-md px-1 py-1 text-[9px] font-mono text-text-secondary outline-none focus:border-rose-500 text-center"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {epCount > visibleEpisodes && (
                    <button
                      type="button"
                      onClick={() => setVisibleEpisodes(prev => prev + 25)}
                      className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-border/60 bg-surface hover:bg-surface-hover/30 hover:border-rose-500/40 cursor-pointer transition-all gap-1.5 text-center mt-1"
                    >
                      <span className="text-xs font-black text-rose-500">Episodes {visibleEpisodes + 1} to {epCount}</span>
                      <span className="text-[10px] text-text-secondary">
                        {epCount - visibleEpisodes} more episodes are collapsed to optimize performance. Click to show next 25 episodes.
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="pt-4 mt-4 text-center border-t border-border">
              <span className="text-[10px] text-text-muted tracking-widest uppercase">Every episode is a step forward.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Widgets */}
        <div className="flex flex-col gap-4">
          {/* Resume Watch Point */}
          <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4 flex items-center gap-2">
              <IconMovie size={14} /> Resume Watch Point
            </h4>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest">Last Ep Watched</label>
                <div className="flex items-center gap-3 p-2 border bg-surface-alt rounded-xl border-border">
                  <img src={episodeThumb} alt="Thumb" className="object-cover w-10 h-10 rounded-lg shrink-0" />
                  <input
                    type="number"
                    min={1}
                    max={epCount || undefined}
                    placeholder="e.g. 5"
                    value={lastWatchedEp}
                    onChange={e => saveAnimeMeta({ lastWatchedEp: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full min-w-0 text-xs font-bold bg-transparent border-none text-text-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest">Exact Timestamp</label>
                <div className="flex items-center gap-3 p-3 border bg-surface-alt rounded-xl border-border">
                  <IconStarFilled size={14} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. 15:20"
                    value={lastWatchedTimestamp}
                    onChange={e => saveAnimeMeta({ lastWatchedTimestamp: e.target.value })}
                    className="w-full min-w-0 text-xs font-bold bg-transparent border-none text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden flex items-center justify-between">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-1 flex items-center gap-2">
                <IconStarFilled size={12} /> Progress
              </h4>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-2 max-w-[100px]">
                {watchedEpisodes.length} of {epCount} episodes watched
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-center w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-rose-500" strokeDasharray={`${progressPercent}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="absolute text-[11px] font-black text-text-primary">{progressPercent}%</span>
            </div>
          </div>

          {/* Review & Notes */}
          <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden flex flex-col flex-grow min-h-[220px]">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-3 flex items-center gap-2 relative z-10">
              Review & Notes
            </h4>
            <textarea
              placeholder="Write your thoughts, reviews, or key takeaways..."
              value={notesText}
              onChange={e => saveAnimeMeta({ notesText: e.target.value })}
              className="w-full bg-surface-alt/40 border border-border/50 rounded-xl p-3 text-[11px] leading-relaxed text-text-primary placeholder-text-muted outline-none focus:border-rose-500/50 resize-none flex-grow relative z-10 overflow-y-auto custom-scrollbar pr-20 pb-12"
            />
            <img 
              src={chibiMascotUrl || "/anime_chibi_mascot_1783275415079.png"} 
              alt="Mascot" 
              className={`absolute bottom-3 right-3 w-28 h-28 object-contain filter drop-shadow-md transition-all z-20 pointer-events-none ${theme === 'dark' ? 'opacity-85' : 'brightness-95 opacity-90'}`}
              onError={() => {
                if (chibiMascotUrl && chibiMascotUrl !== '/anime_chibi_mascot_1783275415079.png') {
                  setChibiMascotUrl('/anime_chibi_mascot_1783275415079.png');
                }
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
