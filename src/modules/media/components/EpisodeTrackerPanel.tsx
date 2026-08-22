import React from 'react';
import { IconDeviceTv, IconMovie, IconPlus } from '@tabler/icons-react';

interface EpisodeTrackerPanelProps {
  isSeries: boolean;
  accentColor: string;
  watchedEpisodes: number[];
  epCount: number;
  progressPercent: number;
  visibleEpisodes: number;
  setVisibleEpisodes: React.Dispatch<React.SetStateAction<number>>;
  episodeThumb: string;
  timestamps: Record<number, string>;
  saveAnimeMeta: (updates: {
    watchedEpisodes?: number[];
    timestamps?: Record<number, string>;
    episodeThumb?: string;
  }) => void;
}

export const EpisodeTrackerPanel: React.FC<EpisodeTrackerPanelProps> = ({
  isSeries,
  accentColor,
  watchedEpisodes,
  epCount,
  progressPercent,
  visibleEpisodes,
  setVisibleEpisodes,
  episodeThumb,
  timestamps,
  saveAnimeMeta,
}) => {
  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="bg-surface rounded-[24px] border border-border p-6 shadow-2xl relative overflow-hidden flex flex-col h-full text-left">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
              {isSeries ? <IconDeviceTv size={18} /> : <IconMovie size={18} />}
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-text-primary">
                Episode Progress Tracker
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">Track episodes you've watched</p>
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
              style={{ color: accentColor, background: `${accentColor}18` }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors flex items-center gap-1"
              title="Upload Square Thumbnail"
            >
              <IconPlus size={10} />
              <span>Upload Thumb</span>
            </label>
            <span className="text-sm font-black text-text-primary">
              {watchedEpisodes.length} / {epCount}
            </span>
            <span
              style={{ color: accentColor, background: `${accentColor}18` }}
              className="text-[10px] font-bold px-2 py-1 rounded-md"
            >
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
          {epCount === 0 ? (
            <p className="col-span-2 py-10 text-xs italic text-center text-text-muted">
              No episodes found. Update total episodes.
            </p>
          ) : (
            <>
              {Array.from(
                { length: Math.min(epCount, visibleEpisodes) },
                (_, i) => i + 1,
              ).map((epNum) => {
                const checked = watchedEpisodes.includes(epNum);
                return (
                  <div
                    key={epNum}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      checked
                        ? 'bg-surface-alt/70 border-primary/20 shadow-[0_4px_20px_rgba(244,63,94,0.05)]'
                        : 'bg-surface-alt/30 border-transparent hover:border-border'
                    }`}
                  >
                    <div className="flex justify-center w-6 shrink-0">
                      <span className="text-[10px] font-black text-text-muted">
                        {epNum.toString().padStart(2, '0')}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        let updated;
                        if (checked) {
                          updated = watchedEpisodes.filter((e) => e !== epNum);
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
                      className={`w-12 h-8 rounded-md object-cover shrink-0 ml-1 transition-all ${
                        !checked && 'opacity-40 grayscale'
                      }`}
                    />

                    <div className="flex flex-col flex-1 min-w-0 ml-1 text-left">
                      <span className="text-[11px] font-bold text-text-primary truncate">
                        Episode {epNum}
                      </span>
                      <span
                        style={{ color: checked ? accentColor : '' }}
                        className={`text-[8px] font-black uppercase tracking-wider ${
                          !checked && 'text-text-muted'
                        }`}
                      >
                        {checked ? 'Watched' : 'Not Watched'}
                      </span>
                    </div>

                    {checked && (
                      <div className="shrink-0">
                        <input
                          type="text"
                          placeholder="00:00"
                          value={timestamps[epNum] || ''}
                          onChange={(e) => {
                            const updatedTime = { ...timestamps, [epNum]: e.target.value };
                            saveAnimeMeta({ timestamps: updatedTime });
                          }}
                          className="w-12 bg-background border border-border rounded-md px-1 py-1 text-[9px] font-mono text-text-secondary outline-none focus:border-primary text-center"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {epCount > visibleEpisodes && (
                <button
                  type="button"
                  onClick={() => setVisibleEpisodes((prev) => prev + 25)}
                  className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-border/60 bg-surface hover:bg-surface-hover/30 hover:border-primary/40 cursor-pointer transition-all gap-1.5 text-center mt-1"
                >
                  <span className="text-xs font-black text-primary">
                    Episodes {visibleEpisodes + 1} to {epCount}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {epCount - visibleEpisodes} more episodes are collapsed. Click to show next 25.
                  </span>
                </button>
              )}
            </>
          )}
        </div>
        <div className="pt-4 mt-4 text-center border-t border-border">
          <span className="text-[10px] text-text-muted tracking-widest uppercase">
            Every episode is a step forward.
          </span>
        </div>
      </div>
    </div>
  );
};
