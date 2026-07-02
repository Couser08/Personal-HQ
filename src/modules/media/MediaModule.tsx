import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconTrash, IconMovie, IconDeviceGamepad2, 
  IconStarFilled, IconChevronRight, IconEdit, IconX, IconCheck
} from '@tabler/icons-react';
import { useAppStore, type MediaLog } from '../../store/useAppStore';

const STATUS_OPTIONS = {
  ANIME: ['WATCHING', 'COMPLETED', 'DROPPED', 'PLANNING'],
  GAME: ['PLAYING', 'FINISHED', 'DROPPED', 'WISHLIST']
};

export default function MediaModule() {
  const { mediaLogs, addMediaLog, updateMediaLog, deleteMediaLog, showConfirm } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'ANIME' | 'GAME'>('ANIME');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<MediaLog | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [episodes, setEpisodes] = useState<string>('');
  const [notes, setNotes] = useState('');

  const handleOpenModal = (log?: MediaLog) => {
    if (log) {
      setEditingLog(log);
      setTitle(log.title);
      setStatus(log.status);
      setRating(log.rating || 0);
      setEpisodes(log.episodes?.toString() || '');
      setNotes(log.notes);
    } else {
      setEditingLog(null);
      setTitle('');
      setStatus(activeTab === 'ANIME' ? 'WATCHING' : 'PLAYING');
      setRating(0);
      setEpisodes('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    if (editingLog) {
      updateMediaLog(editingLog.id, {
        title,
        status: status as any,
        rating: rating > 0 ? rating : null,
        episodes: activeTab === 'ANIME' ? (parseInt(episodes) || 0) : undefined,
        notes
      });
    } else {
      addMediaLog({
        id: crypto.randomUUID(),
        type: activeTab,
        title,
        status: status as any,
        rating: rating > 0 ? rating : null,
        episodes: activeTab === 'ANIME' ? (parseInt(episodes) || 0) : undefined,
        notes,
        addedAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
  };

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
        total: anime.length,
        completed: anime.filter(a => a.status === 'COMPLETED').length,
        watching: anime.filter(a => a.status === 'WATCHING').length,
        dropped: anime.filter(a => a.status === 'DROPPED').length,
      },
      games: {
        total: games.length,
        finished: games.filter(g => g.status === 'FINISHED').length,
        playing: games.filter(g => g.status === 'PLAYING').length,
        wishlist: games.filter(g => g.status === 'WISHLIST').length,
      }
    };
  }, [mediaLogs]);

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-[11px] uppercase font-bold tracking-wider text-text-muted">Unrated</span>;
    return (
      <div className="flex gap-0.5 items-center">
        <IconStarFilled className="w-3.5 h-3.5 text-amber-500" />
        <span className="text-[13px] font-bold text-text-primary ml-1">{rating}<span className="text-[11px] text-text-muted">/10</span></span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED':
      case 'FINISHED': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400';
      case 'WATCHING':
      case 'PLAYING': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400';
      case 'DROPPED': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400';
      case 'PLANNING':
      case 'WISHLIST': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400';
      default: return 'bg-gray-500/15 text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex flex-col h-full max-w-6xl mx-auto w-full relative pb-12"
    >
      {/* Apple iOS-style Header */}
      <div className="flex flex-col gap-6 sm:flex-row justify-between sm:items-end mb-8 pt-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-text-primary mb-2">Media Log</h2>
          <p className="text-[15px] text-text-secondary font-medium">Your personal catalogue for anime and games.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex gap-2 items-center px-6 py-3 bg-[#007AFF] hover:bg-[#0066CC] text-white rounded-full font-bold text-[14px] shadow-sm active:scale-95 transition-all w-max shrink-0"
        >
          <IconPlus className="w-5 h-5" /> New Entry
        </button>
      </div>

      {/* iOS Segmented Control */}
      <div className="flex justify-center mb-10">
        <div className="bg-surface-alt/80 backdrop-blur-md p-1.5 rounded-[20px] shadow-sm flex relative w-full max-w-[320px] border border-border">
          <button
            onClick={() => handleTabChange('ANIME')}
            className={`flex-1 py-2.5 font-bold text-[13px] flex items-center justify-center gap-2 rounded-[14px] transition-all relative z-10 ${
              activeTab === 'ANIME' ? 'text-text-primary shadow-sm bg-surface' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <IconMovie className="w-4 h-4" />
            <span>Anime</span>
          </button>
          <button
            onClick={() => handleTabChange('GAME')}
            className={`flex-1 py-2.5 font-bold text-[13px] flex items-center justify-center gap-2 rounded-[14px] transition-all relative z-10 ${
              activeTab === 'GAME' ? 'text-text-primary shadow-sm bg-surface' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <IconDeviceGamepad2 className="w-4 h-4" />
            <span>Games</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="flex flex-col gap-10"
        >
          {/* Apple Health style Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {activeTab === 'ANIME' ? (
              <>
                <StatCard label="Total Anime" value={stats.anime.total} />
                <StatCard label="Watching" value={stats.anime.watching} color="text-blue-500" />
                <StatCard label="Completed" value={stats.anime.completed} color="text-emerald-500" />
                <StatCard label="Dropped" value={stats.anime.dropped} color="text-rose-500" />
              </>
            ) : (
              <>
                <StatCard label="Total Games" value={stats.games.total} />
                <StatCard label="Playing" value={stats.games.playing} color="text-blue-500" />
                <StatCard label="Finished" value={stats.games.finished} color="text-emerald-500" />
                <StatCard label="Wishlist" value={stats.games.wishlist} color="text-amber-500" />
              </>
            )}
          </div>

          {/* Horizontal pill filter bar */}
          <div className="flex flex-wrap gap-2.5 items-center">
            <button 
              onClick={() => setFilterStatus(null)}
              className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                filterStatus === null 
                  ? 'bg-text-primary text-background shadow-md' 
                  : 'bg-surface hover:bg-surface-alt border border-border text-text-secondary'
              }`}
            >
              All
            </button>
            {STATUS_OPTIONS[activeTab].map(s => {
              const isSelected = filterStatus === s;
              return (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-5 py-2 rounded-full text-[13px] font-bold transition-all ${
                    isSelected 
                      ? getStatusColor(s) + ' shadow-sm'
                      : 'bg-surface hover:bg-surface-alt border border-border text-text-secondary'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()}
                </button>
              );
            })}
          </div>

          {/* Grid rendering items */}
          {filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-surface/50 backdrop-blur-sm rounded-[32px] border border-border/50">
              <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-surface-alt to-surface flex items-center justify-center text-text-muted mb-6 shadow-sm border border-border/50">
                {activeTab === 'ANIME' ? <IconMovie className="w-8 h-8" /> : <IconDeviceGamepad2 className="w-8 h-8" />}
              </div>
              <h3 className="font-bold text-xl text-text-primary mb-2">No Entries Found</h3>
              <p className="text-[15px] text-text-muted mb-8 text-center max-w-sm">Track what you're watching or playing, rate them, and keep notes.</p>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 rounded-full font-bold text-[14px] transition-colors"
              >
                Add your first {activeTab.toLowerCase()}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredLogs.map(log => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={log.id}
                    className="bg-surface/80 backdrop-blur-xl border border-border rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all group flex flex-col gap-4 min-h-[220px] relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-bold text-lg text-text-primary line-clamp-2 leading-tight tracking-tight">{log.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full shrink-0 tracking-wider ${getStatusColor(log.status)}`}>
                        {log.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-y border-surface-alt mt-2">
                      {renderStars(log.rating)}
                      {log.type === 'ANIME' && log.episodes !== undefined && log.episodes > 0 && (
                        <span className="text-[13px] font-bold text-text-muted flex items-center gap-1">
                          <IconChevronRight className="w-4 h-4" /> {log.episodes} eps
                        </span>
                      )}
                    </div>

                    <p className="text-[14px] text-text-secondary leading-relaxed line-clamp-3 m-0 flex-1 italic">
                      {log.notes ? `"${log.notes}"` : <span className="opacity-40 font-normal not-italic">No review notes recorded.</span>}
                    </p>

                    <div className="flex justify-between items-center pt-2 mt-auto relative z-10">
                      <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                        {new Date(log.addedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(log); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary bg-surface-alt hover:bg-surface-hover transition-colors"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirm('Confirm Delete', 'Are you sure you want to delete this media log?', () => { deleteMediaLog(log.id); });
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-rose-500 bg-surface-alt hover:bg-rose-500/10 transition-colors"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* iOS Style Sheet Modal — rendered via portal to escape overflow:auto clipping */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative w-[92vw] max-w-md bg-surface rounded-[32px] p-6 sm:p-8 shadow-2xl border border-border z-10 flex flex-col"
              >
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black tracking-tight text-text-primary">
                      {editingLog ? `Edit Entry` : `Add ${activeTab === 'ANIME' ? 'Anime' : 'Game'}`}
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="p-2 rounded-full bg-surface-alt text-text-muted hover:text-text-primary transition-colors"
                    >
                      <IconX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="text-[12px] font-bold text-text-secondary block mb-2">Title</label>
                      <input
                        type="text"
                        placeholder={`e.g. ${activeTab === 'ANIME' ? 'Attack on Titan' : 'Elden Ring'}`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-surface-alt border border-border rounded-[16px] px-4 py-3.5 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all text-[15px] text-text-primary placeholder:text-text-muted"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[12px] font-bold text-text-secondary block mb-2">Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full bg-surface-alt border border-border rounded-[16px] px-4 py-3.5 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all text-[15px] text-text-primary cursor-pointer"
                        >
                          {STATUS_OPTIONS[activeTab].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      {activeTab === 'ANIME' && (
                        <div className="flex-1">
                          <label className="text-[12px] font-bold text-text-secondary block mb-2">Episodes</label>
                          <input
                            type="number"
                            placeholder="e.g. 24"
                            value={episodes}
                            onChange={(e) => setEpisodes(e.target.value)}
                            className="w-full bg-surface-alt border border-border rounded-[16px] px-4 py-3.5 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all text-[15px] text-text-primary placeholder:text-text-muted"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-text-secondary block mb-3 flex justify-between">
                        Rating <span className="font-black">{rating > 0 ? `${rating}/10` : 'Unrated'}</span>
                      </label>
                      <div className="flex gap-1 justify-between bg-surface-alt p-2 rounded-[20px] border border-border">
                        {[1,2,3,4,5,6,7,8,9,10].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setRating(val)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[12px] font-black text-[13px] transition-all flex items-center justify-center ${
                              rating >= val 
                                ? 'bg-amber-400 text-black shadow-sm' 
                                : 'hover:bg-surface-hover text-text-secondary'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-text-secondary block mb-2">Review Notes</label>
                      <textarea
                        placeholder="Thoughts, review details, or tags..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-surface-alt border border-border rounded-[16px] px-4 py-3.5 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/30 transition-all text-[15px] min-h-[100px] resize-none text-text-primary placeholder:text-text-muted"
                      />
                    </div>

                    <div className="mt-2 pt-4 border-t border-border flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 rounded-full font-bold text-[14px] text-text-secondary bg-surface-alt hover:bg-surface-hover transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!title.trim()}
                        className="px-6 py-2.5 rounded-full font-bold text-[14px] text-white bg-[#007AFF] hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <IconCheck className="w-4 h-4" />
                        Save Entry
                      </button>
                    </div>
                  </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}

function StatCard({ label, value, color = "text-text-primary" }: { label: string, value: number, color?: string }) {
  return (
    <div className="bg-surface/50 backdrop-blur-md rounded-[24px] p-5 sm:p-6 border border-border/50 shadow-sm flex flex-col justify-between h-[120px]">
      <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{label}</span>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
  );
}
