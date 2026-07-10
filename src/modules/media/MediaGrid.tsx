import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMovie, IconDeviceGamepad2, IconStarFilled, IconEdit, IconTrash 
} from '@tabler/icons-react';

import { type MediaLog } from '../../store/useAppStore';

interface MediaGridProps {
  activeTab: 'ANIME' | 'GAME';
  filteredLogs: MediaLog[];
  stats: {
    anime: { total: number; completed: number; watching: number; dropped: number };
    games: { total: number; finished: number; playing: number; wishlist: number };
  };
  accent: string;
  filterStatus: string | null;
  setFilterStatus: (status: string | null) => void;
  setSelectedAnimeId: (id: string | null) => void;
  openMediaEntryModal: (type: 'ANIME' | 'GAME', log?: any) => void;
  deleteMediaLog: (id: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const STATUS_OPTIONS = {
  ANIME: ['WATCHING', 'COMPLETED', 'DROPPED', 'PLANNING'],
  GAME:  ['PLAYING', 'FINISHED', 'DROPPED', 'WISHLIST'],
};

function getStatusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case 'COMPLETED': case 'FINISHED':
      return { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' };
    case 'WATCHING': case 'PLAYING':
      return { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' };
    case 'DROPPED':
      return { bg: 'rgba(244,63,94,0.12)', color: '#e11d48' };
    case 'PLANNING': case 'WISHLIST':
      return { bg: 'rgba(245,158,11,0.12)', color: '#d97706' };
    default:
      return { bg: 'var(--bg-surface-alt)', color: 'var(--text-muted)' };
  }
}

function getRatingGradientColor(rating: number): string {
  if (rating <= 3) return '#ef4444';
  if (rating <= 6) return '#f59e0b';
  return '#22c55e';
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  activeTab,
  filteredLogs,
  stats,
  accent,
  filterStatus,
  setFilterStatus,
  setSelectedAnimeId,
  openMediaEntryModal,
  deleteMediaLog,
  showConfirm,
}) => {
  return (
    <div className="flex flex-col gap-8 select-none">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {activeTab === 'ANIME' ? (
          <>
            <StatCard label="Total" value={stats.anime.total}     accent={accent} />
            <StatCard label="Watching"  value={stats.anime.watching}  accent="#3b82f6" />
            <StatCard label="Completed" value={stats.anime.completed} accent="#22c55e" />
            <StatCard label="Dropped"   value={stats.anime.dropped}   accent="#ef4444" />
          </>
        ) : (
          <>
            <StatCard label="Total"    value={stats.games.total}    accent={accent} />
            <StatCard label="Playing"  value={stats.games.playing}  accent="#3b82f6" />
            <StatCard label="Finished" value={stats.games.finished} accent="#22c55e" />
            <StatCard label="Wishlist" value={stats.games.wishlist} accent="#f59e0b" />
          </>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <FilterPill label="All" active={filterStatus === null} onClick={() => setFilterStatus(null)} accent={accent} />
        {STATUS_OPTIONS[activeTab].map(s => (
          <FilterPill
            key={s} label={s.charAt(0) + s.slice(1).toLowerCase()}
            active={filterStatus === s}
            onClick={() => setFilterStatus(s === filterStatus ? null : s)}
            accent={getStatusStyle(s).color}
          />
        ))}
      </div>

      {/* Content */}
      {filteredLogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface rounded-[32px] border border-border animate-fade-in text-center">
          <div className="w-20 h-20 rounded-[24px] flex items-center justify-center text-text-muted mb-6 border border-border bg-surface-alt/60">
            {activeTab === 'ANIME' ? <IconMovie className="w-9 h-9" /> : <IconDeviceGamepad2 className="w-9 h-9" />}
          </div>
          <h3 className="mb-2 text-xl font-bold text-text-primary">No entries yet</h3>
          <p className="text-[15px] text-text-muted mb-8 max-w-xs leading-normal">
            Start tracking your {activeTab === 'ANIME' ? 'anime' : 'games'}, add ratings and reviews.
          </p>
          <button
            onClick={() => openMediaEntryModal(activeTab)}
            style={{ background: `${accent}18`, color: accent }}
            className="px-6 py-3 rounded-full font-bold text-[14px] transition-colors hover:opacity-80 cursor-pointer"
          >
            Add your first {activeTab === 'ANIME' ? 'anime' : 'game'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 text-left md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredLogs.map(log => {
              const statusStyle = getStatusStyle(log.status);
              const ratingColor = log.rating ? getRatingGradientColor(log.rating) : null;
              
              let displayNotes = log.notes;
              let lastWatchedEp = 0;
              let lastWatchedTimestamp = '';
              let parsedSeason = (log as any).season || 0;

              if (log.type === 'ANIME' && log.notes && log.notes.trim().startsWith('{')) {
                try {
                  const meta = JSON.parse(log.notes);
                  if (meta && typeof meta === 'object') {
                    displayNotes = meta.notesText ?? '';
                    if (meta.season) parsedSeason = meta.season;
                    lastWatchedEp = meta.lastWatchedEp ?? 0;
                    lastWatchedTimestamp = meta.lastWatchedTimestamp ?? '';
                  }
                } catch (e) {}
              }

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={log.id}
                  onClick={() => {
                    if (log.type === 'ANIME') {
                      setSelectedAnimeId(log.id);
                    } else {
                      openMediaEntryModal('GAME', log);
                    }
                  }}
                  className="bg-surface border border-border rounded-[24px] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col gap-3 cursor-pointer select-none"
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-[16px] text-text-primary leading-snug tracking-tight line-clamp-2 flex-1">
                      {log.title}
                    </h3>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openMediaEntryModal(activeTab, log);
                        }}
                        className="flex items-center justify-center transition-colors rounded-full cursor-pointer w-7 h-7 text-text-muted hover:text-text-primary bg-surface-alt hover:bg-surface-hover"
                      >
                        <IconEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showConfirm('Delete Entry', 'Delete this media log?', () => deleteMediaLog(log.id));
                        }}
                        className="flex items-center justify-center transition-colors rounded-full cursor-pointer w-7 h-7 text-text-muted hover:text-rose-500 bg-surface-alt hover:bg-rose-500/10"
                      >
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Status + season/episodes */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {log.status}
                    </span>
                    {log.type === 'ANIME' && parsedSeason > 0 && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-surface-alt text-text-muted tracking-wider">
                        S{parsedSeason}
                      </span>
                    )}
                    {log.type === 'ANIME' && log.episodes && log.episodes > 0 && (
                      <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-surface-alt text-text-muted tracking-wider">
                        {log.episodes} eps
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {log.rating ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                        style={{ background: `${ratingColor}18` }}
                      >
                        <IconStarFilled className="w-3 h-3" style={{ color: ratingColor! }} />
                        <span className="text-[13px] font-black" style={{ color: ratingColor! }}>
                          {log.rating}
                          <span className="text-[11px] font-bold opacity-60">/10</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-text-muted">Unrated</span>
                  )}

                  {/* Resume Watch tracker on Card */}
                  {log.type === 'ANIME' && lastWatchedEp > 0 && (
                    <div className="mt-1 p-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10 dark:border-blue-500/20 flex items-center justify-between gap-3 text-left">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[8.5px] font-extrabold text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none">Last Watched</span>
                        <span className="text-[11.5px] font-black text-text-primary truncate">
                          Ep {lastWatchedEp} {lastWatchedTimestamp && `• ${lastWatchedTimestamp}`}
                        </span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold text-[10px] shadow-sm transition-all select-none shrink-0">
                        Resume
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {displayNotes ? (
                    <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 italic border-t border-border/50 pt-3 mt-auto">
                      "{displayNotes}"
                    </p>
                  ) : (
                    <div className="mt-auto" />
                  )}

                  {/* Date */}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-auto">
                    {new Date(log.addedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Internal Helpers
function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-[20px] p-5 border border-border flex flex-col justify-between h-[110px] shadow-sm text-left"
      style={{ background: 'var(--bg-surface)' }}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <span className="text-3xl font-black" style={{ color: accent }}>{value}</span>
    </div>
  );
}

function FilterPill({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent: string }) {
  return (
    <button
      onClick={onClick}
      style={active ? { background: `${accent}18`, color: accent, borderColor: `${accent}40` } : {}}
      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border cursor-pointer ${
        active ? 'shadow-sm' : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
      }`}
    >
      {label}
    </button>
  );
}
