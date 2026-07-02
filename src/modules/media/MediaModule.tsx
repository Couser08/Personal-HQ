import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconMovie, IconDeviceGamepad2, 
  IconStarFilled, IconEdit
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';

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

export default function MediaModule() {
  const { mediaLogs, deleteMediaLog, showConfirm, openMediaEntryModal } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'ANIME' | 'GAME'>('ANIME');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const handleTabChange = (tab: 'ANIME' | 'GAME') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setFilterStatus(null);
    }
  };

  const filteredLogs = useMemo(() => {
    let filtered = mediaLogs.filter(m => m.type === activeTab);
    if (filterStatus) {
      filtered = filtered.filter(m => m.status === filterStatus);
    }
    return filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
  }, [mediaLogs, activeTab, filterStatus]);

  const stats = useMemo(() => {
    const anime = mediaLogs.filter(m => m.type === 'ANIME');
    const games = mediaLogs.filter(m => m.type === 'GAME');
    return {
      anime: {
        total:     anime.length,
        completed: anime.filter(a => a.status === 'COMPLETED').length,
        watching:  anime.filter(a => a.status === 'WATCHING').length,
        dropped:   anime.filter(a => a.status === 'DROPPED').length,
      },
      games: {
        total:    games.length,
        finished: games.filter(g => g.status === 'FINISHED').length,
        playing:  games.filter(g => g.status === 'PLAYING').length,
        wishlist: games.filter(g => g.status === 'WISHLIST').length,
      }
    };
  }, [mediaLogs]);

  // Brand accent per tab
  const accent = activeTab === 'ANIME' ? '#007AFF' : '#a855f7';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex flex-col max-w-6xl mx-auto w-full pb-16"
    >
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-end mb-8 pt-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-1">Personal HQ</p>
          <h2 className="text-4xl font-black tracking-tight text-text-primary leading-none">Media Log</h2>
          <p className="text-[15px] text-text-secondary font-medium mt-2">Your personal catalogue for anime & games.</p>
        </div>
        <button
          onClick={() => openMediaEntryModal(activeTab)}
          style={{ background: accent, boxShadow: `0 4px 16px ${accent}44` }}
          className="flex gap-2 items-center px-6 py-3 text-white rounded-full font-bold text-[14px] active:scale-95 transition-all w-max shrink-0 hover:opacity-90"
        >
          <IconPlus className="w-5 h-5" /> New Entry
        </button>
      </div>

      {/* ── iOS Segmented Control ── */}
      <div className="flex justify-center mb-10">
        <div className="bg-surface-alt/80 p-1.5 rounded-[20px] shadow-sm flex relative w-full max-w-[300px] border border-border">
          {(['ANIME', 'GAME'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2.5 font-bold text-[13px] flex items-center justify-center gap-2 rounded-[14px] transition-all ${
                activeTab === tab ? 'bg-surface shadow-sm text-text-primary' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab === 'ANIME' ? <IconMovie className="w-4 h-4" /> : <IconDeviceGamepad2 className="w-4 h-4" />}
              <span>{tab === 'ANIME' ? 'Anime' : 'Games'}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          className="flex flex-col gap-8"
        >
          {/* ── Stats Grid ── */}
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

          {/* ── Filter pills ── */}
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

          {/* ── Content ── */}
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface rounded-[32px] border border-border">
              <div className="w-20 h-20 rounded-[24px] flex items-center justify-center text-text-muted mb-6 border border-border" style={{ background: 'var(--bg-surface-alt)' }}>
                {activeTab === 'ANIME' ? <IconMovie className="w-9 h-9" /> : <IconDeviceGamepad2 className="w-9 h-9" />}
              </div>
              <h3 className="font-bold text-xl text-text-primary mb-2">No entries yet</h3>
              <p className="text-[15px] text-text-muted mb-8 text-center max-w-xs">
                Start tracking your {activeTab === 'ANIME' ? 'anime' : 'games'}, add ratings and reviews.
              </p>
              <button
                onClick={() => openMediaEntryModal(activeTab)}
                style={{ background: `${accent}18`, color: accent }}
                className="px-6 py-3 rounded-full font-bold text-[14px] transition-colors hover:opacity-80"
              >
                Add your first {activeTab === 'ANIME' ? 'anime' : 'game'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {filteredLogs.map(log => {
                  const statusStyle = getStatusStyle(log.status);
                  const ratingColor = log.rating ? getRatingGradientColor(log.rating) : null;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={log.id}
                      className="bg-surface border border-border rounded-[24px] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col gap-3"
                    >
                      {/* Title row */}
                      <div className="flex justify-between items-start gap-3">
                        <h3 className="font-bold text-[16px] text-text-primary leading-snug tracking-tight line-clamp-2 flex-1">
                          {log.title}
                        </h3>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openMediaEntryModal(activeTab, log)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary bg-surface-alt hover:bg-surface-hover transition-colors"
                          >
                            <IconEdit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => showConfirm('Delete Entry', 'Delete this media log?', () => deleteMediaLog(log.id))}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface-alt hover:bg-rose-500/10 transition-colors"
                          >
                            <IconTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Status + season/episodes */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider"
                          style={{ background: statusStyle.bg, color: statusStyle.color }}
                        >
                          {log.status}
                        </span>
                        {log.type === 'ANIME' && (log as any).season && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-surface-alt text-text-muted tracking-wider">
                            S{(log as any).season}
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

                      {/* Notes */}
                      {log.notes ? (
                        <p className="text-[13px] text-text-secondary leading-relaxed line-clamp-2 italic border-t border-border/50 pt-3 mt-auto">
                          "{log.notes}"
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
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      className="rounded-[20px] p-5 border border-border flex flex-col justify-between h-[110px] shadow-sm"
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
      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
        active ? 'shadow-sm' : 'border-border bg-surface text-text-secondary hover:bg-surface-alt'
      }`}
    >
      {label}
    </button>
  );
}
