import React from 'react';
import { IconTicket } from '@tabler/icons-react';

interface MoviePresentationPanelProps {
  movieMeta: {
    duration: string;
    releaseYear: string;
    cinemaLocation: string;
    watchPartners: string;
    trailerUrl: string;
  };
  saveMovieMeta: (updates: Partial<{
    duration: string;
    releaseYear: string;
    cinemaLocation: string;
    watchPartners: string;
    trailerUrl: string;
  }>) => void;
  getYouTubeId: (url: string) => string | null;
}

export const MoviePresentationPanel: React.FC<MoviePresentationPanelProps> = ({
  movieMeta,
  saveMovieMeta,
  getYouTubeId,
}) => {
  return (
    <div className="flex flex-col gap-4 text-left">
      <div className="bg-surface rounded-[24px] border border-border p-6 shadow-2xl relative overflow-hidden flex flex-col h-full text-left">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500">
              <IconTicket size={18} />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase text-text-primary">
                Movie Presentation
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">
                Cinema check-in &amp; technical parameters
              </p>
            </div>
          </div>
        </div>

        {/* Movie info fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left mb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Duration / Runtime
            </span>
            <div className="flex items-center gap-2 p-3 bg-surface-alt rounded-2xl border border-border">
              <input
                type="text"
                placeholder="e.g. 148 mins"
                value={movieMeta.duration || ''}
                onChange={(e) => saveMovieMeta({ duration: e.target.value })}
                className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Release Year
            </span>
            <div className="flex items-center gap-2 p-3 bg-surface-alt rounded-2xl border border-border">
              <input
                type="text"
                placeholder="e.g. 2010"
                value={movieMeta.releaseYear || ''}
                onChange={(e) => saveMovieMeta({ releaseYear: e.target.value })}
                className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Cinema / Platform
            </span>
            <div className="flex items-center gap-2 p-3 bg-surface-alt rounded-2xl border border-border">
              <input
                type="text"
                placeholder="e.g. IMAX Metro / Netflix"
                value={movieMeta.cinemaLocation || ''}
                onChange={(e) => saveMovieMeta({ cinemaLocation: e.target.value })}
                className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
              Watch Companions
            </span>
            <div className="flex items-center gap-2 p-3 bg-surface-alt rounded-2xl border border-border">
              <input
                type="text"
                placeholder="e.g. Solo, Friends, Family"
                value={movieMeta.watchPartners || ''}
                onChange={(e) => saveMovieMeta({ watchPartners: e.target.value })}
                className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* YouTube trailer embed link */}
        <div className="flex flex-col gap-1.5 pt-4 border-t border-border/40 text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
            Movie Trailer YouTube Link
          </span>
          <div className="flex items-center gap-2 p-3 bg-surface-alt rounded-2xl border border-border mb-4">
            <input
              type="url"
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={movieMeta.trailerUrl || ''}
              onChange={(e) => saveMovieMeta({ trailerUrl: e.target.value })}
              className="w-full bg-transparent border-none text-xs font-bold text-text-primary focus:outline-none"
            />
          </div>
          {movieMeta.trailerUrl && getYouTubeId(movieMeta.trailerUrl) && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-border">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${getYouTubeId(movieMeta.trailerUrl)}`}
                title="Movie Trailer player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
