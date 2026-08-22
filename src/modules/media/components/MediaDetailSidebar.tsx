import React from 'react';
import { IconDeviceTv, IconMovie, IconStarFilled, IconTicket } from '@tabler/icons-react';
import type { MediaLog } from '../../../store/types';

interface MediaDetailSidebarProps {
  isMovie: boolean;
  isSeries: boolean;
  accentColor: string;
  selectedAnime: MediaLog;
  watchedEpisodes: number[];
  epCount: number;
  progressPercent: number;
  episodeThumb: string;
  lastWatchedEp: string;
  lastWatchedTimestamp: string;
  notesText: string;
  chibiMascotUrl: string;
  setChibiMascotUrl: (url: string) => void;
  theme: string;
  saveAnimeMeta: (updates: {
    lastWatchedEp?: number | null;
    lastWatchedTimestamp?: string;
    notesText?: string;
  }) => void;
  saveMovieMeta: (updates: any) => void;
}

export const MediaDetailSidebar: React.FC<MediaDetailSidebarProps> = ({
  isMovie,
  isSeries,
  accentColor,
  selectedAnime,
  watchedEpisodes,
  epCount,
  progressPercent,
  episodeThumb,
  lastWatchedEp,
  lastWatchedTimestamp,
  notesText,
  chibiMascotUrl,
  setChibiMascotUrl,
  theme,
  saveAnimeMeta,
  saveMovieMeta,
}) => {
  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Resume Watch Point (Anime & Series only) */}
      {!isMovie && (
        <>
          <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden text-left">
            <h4
              style={{ color: accentColor }}
              className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              {isSeries ? <IconDeviceTv size={14} /> : <IconMovie size={14} />} Resume Watch Point
            </h4>

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                  Last Ep Watched
                </label>
                <div className="flex items-center gap-3 p-2 border bg-surface-alt rounded-xl border-border">
                  <img
                    src={episodeThumb}
                    alt="Thumb"
                    className="object-cover w-10 h-10 rounded-lg shrink-0"
                  />
                  <input
                    type="number"
                    min={1}
                    max={epCount || undefined}
                    placeholder="e.g. 5"
                    value={lastWatchedEp}
                    onChange={(e) =>
                      saveAnimeMeta({
                        lastWatchedEp: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full min-w-0 text-xs font-bold bg-transparent border-none text-text-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[8px] font-black text-text-muted uppercase tracking-widest">
                  Exact Timestamp
                </label>
                <div className="flex items-center gap-3 p-3 border bg-surface-alt rounded-xl border-border">
                  <IconStarFilled size={14} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="e.g. 15:20"
                    value={lastWatchedTimestamp}
                    onChange={(e) => saveAnimeMeta({ lastWatchedTimestamp: e.target.value })}
                    className="w-full min-w-0 text-xs font-bold bg-transparent border-none text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Circle */}
          <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden flex items-center justify-between text-left">
            <div className="relative z-10">
              <h4
                style={{ color: accentColor }}
                className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"
              >
                <IconStarFilled size={12} /> Progress
              </h4>
              <p className="text-[10px] text-text-secondary leading-relaxed mt-2 max-w-[100px]">
                {watchedEpisodes.length} of {epCount} episodes watched
              </p>
            </div>
            <div className="relative z-10 flex items-center justify-center w-16 h-16 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  style={{ color: accentColor }}
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-text-primary">
                {progressPercent}%
              </span>
            </div>
          </div>
        </>
      )}

      {/* Movie specific quick badge */}
      {isMovie && (
        <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden text-left">
          <h4
            style={{ color: accentColor }}
            className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2"
          >
            <IconTicket size={14} /> Theater Log Stub
          </h4>
          <div className="flex flex-col gap-2 p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-2xl">
            <span className="text-[9px] font-extrabold text-emerald-500 uppercase tracking-widest">
              Cinema Category
            </span>
            <span className="text-xs font-black text-text-primary">
              {selectedAnime.status === 'COMPLETED'
                ? 'Watched at Home/Theater'
                : 'Plan to Watch'}
            </span>
          </div>
        </div>
      )}

      {/* Review & Notes (Generic for all types) */}
      <div className="bg-surface rounded-[24px] border border-border p-6 relative overflow-hidden flex flex-col flex-grow min-h-[220px] text-left">
        <h4
          style={{ color: accentColor }}
          className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10"
        >
          Review &amp; Notes
        </h4>
        <textarea
          placeholder="Write your thoughts, reviews, or key takeaways..."
          value={notesText}
          onChange={(e) => {
            if (isMovie) {
              saveMovieMeta({ notesText: e.target.value });
            } else {
              saveAnimeMeta({ notesText: e.target.value });
            }
          }}
          className="w-full bg-surface-alt/40 border border-border/50 rounded-xl p-3 text-[11px] leading-relaxed text-text-primary placeholder-text-muted outline-none focus:border-primary/50 resize-none flex-grow relative z-10 overflow-y-auto custom-scrollbar pr-20 pb-12"
        />
        <img
          src={chibiMascotUrl || '/anime_chibi_mascot_1783275415079.png'}
          alt="Mascot"
          className={`absolute bottom-3 right-3 w-28 h-28 object-contain filter drop-shadow-md transition-all z-20 pointer-events-none ${
            theme === 'dark' ? 'opacity-85' : 'brightness-95 opacity-90'
          }`}
          onError={() => {
            if (
              chibiMascotUrl &&
              chibiMascotUrl !== '/anime_chibi_mascot_1783275415079.png'
            ) {
              setChibiMascotUrl('/anime_chibi_mascot_1783275415079.png');
            }
          }}
        />
      </div>
    </div>
  );
};
