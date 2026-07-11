import { useState, useMemo, useEffect } from 'react';
import { 
  IconStar, IconStarFilled, IconPlayerPlay, IconHeart, 
  IconMovie, IconMessage, IconBolt, IconPencil, 
  IconBookmark, IconTrophy, IconCompass, IconChevronRight
} from '@tabler/icons-react';
import { useAppStore, type MediaLog } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../../lib/supabase';

interface AnimeReviewCenterProps {
  onViewAllWatching: () => void;
  onViewAllReviews: () => void;
  onViewAllLibrary: () => void;
  onViewRankings: () => void;
}

export default function AnimeReviewCenter({
  onViewAllWatching,
  onViewAllReviews,
  onViewAllLibrary,
  onViewRankings
}: AnimeReviewCenterProps) {
  const { mediaLogs, openMediaEntryModal } = useAppStore(useShallow(state => ({
    mediaLogs: state.mediaLogs,
    openMediaEntryModal: state.openMediaEntryModal,
  })));

  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerError, setBannerError] = useState(false);

  const loadBanner = () => {
    const publicUrl = supabase.storage.from('avatars').getPublicUrl('global/anime_review_banner.png').data.publicUrl;
    setBannerUrl(`${publicUrl}?t=${Date.now()}`);
    setBannerError(false);
  };

  // Load the banner illustration from Supabase avatars bucket
  useEffect(() => {
    loadBanner();
    const handleUpdate = () => {
      loadBanner();
    };
    window.addEventListener('anime-banner-updated', handleUpdate);
    return () => {
      window.removeEventListener('anime-banner-updated', handleUpdate);
    };
  }, []);

  // Filter logs for Anime
  const animeLogs = useMemo(() => {
    return mediaLogs.filter(m => m.type === 'ANIME');
  }, [mediaLogs]);

  // Stats calculations
  const stats = useMemo(() => {
    const completed = animeLogs.filter(a => a.status === 'COMPLETED').length;
    const watchlist = animeLogs.filter(a => a.status === 'PLANNING').length;
    const reviewed = animeLogs.filter(a => a.rating !== null || (a.notes && a.notes.trim() !== '')).length;
    
    return {
      watched: completed,
      reviews: reviewed,
      watchlist: watchlist
    };
  }, [animeLogs]);

  // Currently Watching Anime list (Limit to top 1 for dashboard display, or show first active)
  const currentlyWatching = useMemo(() => {
    return animeLogs.filter(a => a.status === 'WATCHING');
  }, [animeLogs]);

  // Recent Reviews (limit to top 3)
  const recentReviews = useMemo(() => {
    return animeLogs
      .filter(a => a.rating !== null)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 3);
  }, [animeLogs]);

  // Helper to parse notes meta (thumbnail, banner, progress)
  const parseAnimeMeta = (log: MediaLog) => {
    let notesText = log.notes;
    let watchedEpisodes: number[] = [];
    let bannerImage = '';
    let episodeThumb = '';
    
    try {
      if (log.notes && log.notes.trim().startsWith('{')) {
        const meta = JSON.parse(log.notes);
        notesText = meta.notesText ?? '';
        watchedEpisodes = meta.watchedEpisodes ?? [];
        bannerImage = meta.bannerImage ?? '';
        episodeThumb = meta.episodeThumb ?? '';
      }
    } catch (e) {}

    return {
      notesText,
      watchedCount: watchedEpisodes.length,
      bannerImage,
      episodeThumb
    };
  };

  // Stars renderer
  const renderStars = (rating: number) => {
    const totalStars = 5;
    // Map rating 1-10 to 1-5 scale
    const normalizedRating = Math.round(rating / 2);
    
    return (
      <div className="flex items-center gap-0.5 text-rose-500">
        {Array.from({ length: totalStars }).map((_, i) => {
          if (i < normalizedRating) {
            return <IconStarFilled key={i} className="w-3.5 h-3.5" />;
          }
          return <IconStar key={i} className="w-3.5 h-3.5 opacity-30" />;
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full gap-8 select-none text-left animate-fade-in">
      
      {/* ── Top Header Banner Card ── */}
      <div className="relative overflow-hidden rounded-[32px] border border-border/50 bg-stone-950 text-white min-h-[380px] p-8 md:p-12 flex flex-col justify-between shadow-[0_24px_50px_rgba(0,0,0,0.4)]">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Content Side */}
        <div className="z-10 flex flex-col md:max-w-[55%] gap-4 h-full justify-center">
          <div>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
              <IconStar size={16} />
            </div>
            <h1 className="text-3xl sm:text-4.5xl font-black leading-tight tracking-tight">
              Anime <span className="text-rose-500">Review Center</span>
            </h1>
            <div className="w-12 h-1.5 bg-rose-500 rounded-full mt-3" />
          </div>

          <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed mt-2">
            Track, review & rate your favorite anime and share your thoughts with the community.
          </p>

          {/* 3 Stats Blocks */}
          <div className="flex flex-wrap gap-4 mt-6">
            
            {/* Stat 1 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[130px] flex-1 sm:flex-initial">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/10 shrink-0">
                <IconPlayerPlay className="w-5 h-5 fill-rose-500/10" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black">{stats.watched}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Watched</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[130px] flex-1 sm:flex-initial">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/10 shrink-0">
                <IconStarFilled className="w-5 h-5" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black">{stats.reviews}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Reviews</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[130px] flex-1 sm:flex-initial">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/10 shrink-0">
                <IconHeart className="w-5 h-5 fill-purple-500/10" />
              </div>
              <div className="leading-tight">
                <div className="text-lg font-black">{stats.watchlist}</div>
                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Watchlist</div>
              </div>
            </div>

          </div>
        </div>

        {/* Banner Image Side (Pixel-Perfect matching uploaded layout) */}
        <div className="absolute right-0 top-0 bottom-0 w-[45%] hidden md:flex items-center justify-center overflow-hidden">
          {bannerUrl && !bannerError ? (
            <img 
              src={bannerUrl} 
              alt="Anime Review Center Banner" 
              onError={() => setBannerError(true)}
              className="w-full h-full object-cover object-center scale-[1.02] border-l border-zinc-800"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-900/40 border-l border-zinc-800 p-8 text-center text-zinc-500 select-none">
              <div className="w-14 h-14 rounded-2xl border border-zinc-800 flex items-center justify-center bg-zinc-950/40 text-rose-500/40">
                <IconMovie className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-400">Custom Banner Empty</div>
                <div className="text-[9px] text-zinc-600 mt-1 max-w-[200px]">Upload "anime_review_banner.png" in the Admin Panel to customize this dashboard view.</div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Dashboard Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Currently Watching Column */}
        <div className="col-span-12 lg:col-span-5 bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4">
              <div className="flex items-center gap-2">
                <IconMovie className="w-4.5 h-4.5 text-rose-500" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Currently Watching</span>
              </div>
              <button 
                onClick={onViewAllWatching}
                className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-0.5 hover:opacity-85 cursor-pointer"
              >
                <span>View all</span>
                <IconChevronRight className="w-3 h-3" />
              </button>
            </div>

            {currentlyWatching.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none text-text-muted">
                <IconMovie className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[11px] font-bold">No anime currently watching.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {currentlyWatching.slice(0, 1).map(log => {
                  const meta = parseAnimeMeta(log);
                  const progressPct = log.episodes && log.episodes > 0 
                    ? Math.round((meta.watchedCount / log.episodes) * 100)
                    : 0;

                  return (
                    <div key={log.id} className="flex gap-4 items-start">
                      {/* Cover Thumbnail */}
                      <div className="w-20 h-28 rounded-2xl bg-surface-alt border border-border overflow-hidden shrink-0 relative flex items-center justify-center text-zinc-500 shadow-sm">
                        {meta.episodeThumb ? (
                          <img src={meta.episodeThumb} alt={log.title} className="w-full h-full object-cover" />
                        ) : meta.bannerImage ? (
                          <img src={meta.bannerImage} alt={log.title} className="w-full h-full object-cover" />
                        ) : (
                          <IconMovie className="w-6 h-6 opacity-30" />
                        )}
                      </div>

                      {/* Info side */}
                      <div className="flex-1 flex flex-col justify-between py-1 h-28">
                        <div>
                          <h3 className="text-sm font-black text-text-primary tracking-tight leading-tight line-clamp-2">
                            {log.title}
                          </h3>
                          {log.season && (
                            <span className="inline-block px-2 py-0.5 bg-surface-alt border border-border/80 text-[9px] font-black uppercase text-text-secondary rounded-md mt-1.5">
                              Season {log.season}
                            </span>
                          )}
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                            <div className="w-full bg-border/20 h-1.5 rounded-full overflow-hidden mr-3">
                              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${progressPct}%` }} />
                            </div>
                            <span className="shrink-0 font-mono text-[11px] text-text-primary">
                              EP {meta.watchedCount} / {log.episodes || '?'}
                            </span>
                          </div>
                          
                          {/* Next Up subtext */}
                          <div className="text-[10px] text-text-secondary font-bold truncate">
                            Next Up: EP {meta.watchedCount + 1}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Recent Reviews Column */}
        <div className="col-span-12 lg:col-span-4 bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border/30 mb-4">
              <div className="flex items-center gap-2">
                <IconMessage className="w-4.5 h-4.5 text-rose-500" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">Recent Reviews</span>
              </div>
              <button 
                onClick={onViewAllReviews}
                className="text-[10px] font-black text-rose-500 uppercase tracking-wider flex items-center gap-0.5 hover:opacity-85 cursor-pointer"
              >
                <span>View all</span>
                <IconChevronRight className="w-3 h-3" />
              </button>
            </div>

            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center select-none text-text-muted">
                <IconStar className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[11px] font-bold">No reviews written yet.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentReviews.map(log => {
                  const meta = parseAnimeMeta(log);
                  
                  return (
                    <div key={log.id} className="flex items-center justify-between gap-3 py-1.5 border-b border-border/10 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Tiny cover thumbnail */}
                        <div className="w-8 h-8 rounded-lg bg-surface-alt border border-border overflow-hidden shrink-0 flex items-center justify-center text-zinc-500">
                          {meta.episodeThumb ? (
                            <img src={meta.episodeThumb} alt={log.title} className="w-full h-full object-cover" />
                          ) : (
                            <IconMovie className="w-4 h-4 opacity-30" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-text-primary truncate">{log.title}</span>
                      </div>
                      
                      {/* Stars & Rating value */}
                      <div className="flex items-center gap-3 shrink-0">
                        {renderStars(log.rating || 0)}
                        <span className="text-xs font-bold text-text-primary font-mono w-6 text-right">
                          {(log.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 3. Quick Actions Column */}
        <div className="col-span-12 lg:col-span-3 bg-surface border border-border/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-border/30 mb-4">
              <IconBolt className="w-4.5 h-4.5 text-rose-500" />
              <span className="text-xs font-black uppercase tracking-wider text-text-primary">Quick Actions</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              
              {/* Action 1: Write a Review */}
              <button
                onClick={() => openMediaEntryModal('ANIME')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-alt border border-border/60 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-rose-500/20 hover:bg-rose-500/[0.02] cursor-pointer transition-all active:scale-97 text-left"
              >
                <IconPencil className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Write a Review</span>
              </button>

              {/* Action 2: Add to Watchlist */}
              <button
                onClick={() => openMediaEntryModal('ANIME')}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-alt border border-border/60 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-rose-500/20 hover:bg-rose-500/[0.02] cursor-pointer transition-all active:scale-97 text-left"
              >
                <IconBookmark className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Add to Watchlist</span>
              </button>

              {/* Action 3: View Rankings */}
              <button
                onClick={onViewRankings}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-alt border border-border/60 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-rose-500/20 hover:bg-rose-500/[0.02] cursor-pointer transition-all active:scale-97 text-left"
              >
                <IconTrophy className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Rate & Rank List</span>
              </button>

              {/* Action 4: Discover Anime */}
              <button
                onClick={onViewAllLibrary}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-alt border border-border/60 text-xs font-bold text-text-secondary hover:text-text-primary hover:border-rose-500/20 hover:bg-rose-500/[0.02] cursor-pointer transition-all active:scale-97 text-left"
              >
                <IconCompass className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Discover Anime</span>
              </button>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
