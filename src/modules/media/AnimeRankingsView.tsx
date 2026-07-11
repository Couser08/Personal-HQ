import { useMemo } from 'react';
import { 
  IconStarFilled, IconArrowLeft, IconTrophy, 
  IconEdit, IconTrash, IconMovie 
} from '@tabler/icons-react';
import { useAppStore, type MediaLog } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';

interface AnimeRankingsViewProps {
  onBackToDashboard: () => void;
}

export default function AnimeRankingsView({ onBackToDashboard }: AnimeRankingsViewProps) {
  const { mediaLogs, deleteMediaLog, openMediaEntryModal, showConfirm } = useAppStore(useShallow(state => ({
    mediaLogs: state.mediaLogs,
    deleteMediaLog: state.deleteMediaLog,
    openMediaEntryModal: state.openMediaEntryModal,
    showConfirm: state.showConfirm,
  })));
  const { addToast } = useToastStore();

  // Filter logs for Anime and only keep those with ratings, sorted descending
  const rankedAnime = useMemo(() => {
    return mediaLogs
      .filter(m => m.type === 'ANIME' && m.rating !== null)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [mediaLogs]);

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

  // Status Badge styles
  const getStatusStyle = (status: string): { bg: string; color: string } => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-green-500/10 text-green-500 border-green-500/20', color: 'Completed' };
      case 'WATCHING':
        return { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20', color: 'Watching' };
      case 'DROPPED':
        return { bg: 'bg-red-500/10 text-red-500 border-red-500/20', color: 'Dropped' };
      case 'PLANNING':
        return { bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20', color: 'Planning' };
      default:
        return { bg: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20', color: 'Unknown' };
    }
  };

  // Render Rank Indicator
  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-300 text-black flex items-center justify-center font-black text-xs shadow-md shadow-slate-300/20">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-700/20">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-full bg-surface border border-border/80 text-text-secondary flex items-center justify-center font-bold text-xs">
        {rank}
      </span>
    );
  };

  const handleEdit = (log: MediaLog) => {
    openMediaEntryModal('ANIME', log);
  };

  const handleDelete = (id: string, title: string) => {
    showConfirm('Delete Entry', `Are you sure you want to delete "${title}"?`, () => {
      deleteMediaLog(id);
      addToast('Deleted', 'Anime entry removed.', 'success');
    });
  };

  return (
    <div className="flex flex-col w-full gap-6 text-left select-none animate-fade-in">
      
      {/* ── Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBackToDashboard}
            className="w-10 h-10 rounded-full bg-surface-alt border border-border flex items-center justify-center text-text-secondary hover:text-text-primary active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <IconArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-2">
              <IconTrophy className="w-6 h-6 text-amber-500" />
              <span>Anime Leaderboard</span>
            </h1>
            <p className="text-text-secondary text-xs mt-0.5">Your personal ranked list of anime sorted by score.</p>
          </div>
        </div>
      </div>

      {/* ── Leaderboard Table ── */}
      {rankedAnime.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-border/40 rounded-[32px] text-center p-6 shadow-sm">
          <div className="w-16 h-16 rounded-[20px] bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4 border border-amber-500/10">
            <IconTrophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-text-primary">No ranked anime</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-2 leading-relaxed">
            Give a star rating to your anime logs to show them here on your leaderboard.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border/40 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-[10px] font-black uppercase text-text-muted tracking-wider bg-surface-alt/45 select-none">
                  <th className="py-4.5 px-6 w-16 text-center">Rank</th>
                  <th className="py-4.5 px-4 w-16">Cover</th>
                  <th className="py-4.5 px-4">Title</th>
                  <th className="py-4.5 px-4 w-32 text-center">Score</th>
                  <th className="py-4.5 px-4 w-36 text-center">Status</th>
                  <th className="py-4.5 px-6 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankedAnime.map((log, index) => {
                  const meta = parseAnimeMeta(log);
                  const statusInfo = getStatusStyle(log.status);
                  const rank = index + 1;

                  return (
                    <tr 
                      key={log.id} 
                      className="border-b border-border/10 last:border-0 hover:bg-surface-hover/20 transition-colors"
                    >
                      {/* Rank Column */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex justify-center">
                          {renderRankBadge(rank)}
                        </div>
                      </td>

                      {/* Cover Column */}
                      <td className="py-4 px-4 align-middle">
                        <div className="w-10 h-14 rounded-lg bg-surface-alt border border-border overflow-hidden flex items-center justify-center text-zinc-500 shrink-0">
                          {meta.episodeThumb ? (
                            <img src={meta.episodeThumb} alt={log.title} className="w-full h-full object-cover" />
                          ) : (
                            <IconMovie className="w-5 h-5 opacity-30" />
                          )}
                        </div>
                      </td>

                      {/* Title Column */}
                      <td className="py-4 px-4 align-middle">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-text-primary tracking-tight line-clamp-1">{log.title}</span>
                          {log.season && (
                            <span className="text-[9px] font-bold text-text-muted mt-0.5">Season {log.season}</span>
                          )}
                        </div>
                      </td>

                      {/* Score Column */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold text-text-primary">
                          <IconStarFilled className="w-3.5 h-3.5 text-rose-500" />
                          <span>{(log.rating || 0).toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 align-middle text-center">
                        <div className="flex justify-center">
                          <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${statusInfo.bg}`}>
                            {statusInfo.color}
                          </span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 align-middle text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(log)}
                            className="w-7 h-7 rounded-lg border border-border/60 text-text-muted hover:text-rose-500 hover:border-rose-500/20 hover:bg-rose-500/5 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                            title="Edit Anime"
                          >
                            <IconEdit size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(log.id, log.title)}
                            className="w-7 h-7 rounded-lg border border-border/60 text-text-muted hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                            title="Delete Anime"
                          >
                            <IconTrash size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
