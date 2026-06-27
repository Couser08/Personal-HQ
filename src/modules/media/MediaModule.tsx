import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconDeviceGamepad2, IconMovie, IconStarFilled, IconStar } from '@tabler/icons-react';
import { useAppStore, type MediaLog } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

const STATUS_OPTIONS = {
  ANIME: ['WATCHING', 'COMPLETED', 'DROPPED', 'PLANNING'],
  GAME: ['PLAYING', 'FINISHED', 'DROPPED', 'WISHLIST']
};

export default function MediaModule() {
  const { mediaLogs, addMediaLog, updateMediaLog, deleteMediaLog , showConfirm} = useAppStore();
  
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
    if (!rating) return <span className="text-xs text-text-muted">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5,6,7,8,9,10].map(star => (
          star <= rating 
            ? <IconStarFilled key={star} className="w-3 h-3 text-amber-500" />
            : <IconStar key={star} className="w-3 h-3 text-[#2a2a2a]" />
        ))}
      </div>
    );
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'COMPLETED':
      case 'FINISHED': return 'success';
      case 'WATCHING':
      case 'PLAYING': return 'primary';
      case 'DROPPED': return 'danger';
      case 'PLANNING':
      case 'WISHLIST': return 'warning';
      default: return 'default';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full gap-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Media Log <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
          </h2>
          <p className="text-text-secondary text-sm">Track your anime and games</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary-muted text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          <IconPlus className="w-4 h-4" /> Add Entry
        </button>
      </div>

      <div className="flex border-b border-border">
        <button
          onClick={() => { setActiveTab('ANIME'); setFilterStatus(null); }}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'ANIME' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'}`}
        >
          <IconMovie className="w-4 h-4" /> Anime
        </button>
        <button
          onClick={() => { setActiveTab('GAME'); setFilterStatus(null); }}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'GAME' ? 'border-primary text-primary' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border'}`}
        >
          <IconDeviceGamepad2 className="w-4 h-4" /> Games
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activeTab === 'ANIME' ? (
          <>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Total Anime</p>
              <p className="text-xl font-bold">{stats.anime.total}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Watching</p>
              <p className="text-xl font-bold text-primary">{stats.anime.watching}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Completed</p>
              <p className="text-xl font-bold text-green-500">{stats.anime.completed}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Dropped</p>
              <p className="text-xl font-bold text-rose-500">{stats.anime.dropped}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Total Games</p>
              <p className="text-xl font-bold">{stats.games.total}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Playing</p>
              <p className="text-xl font-bold text-primary">{stats.games.playing}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Finished</p>
              <p className="text-xl font-bold text-green-500">{stats.games.finished}</p>
            </div>
            <div className="bg-surface border border-border p-4 rounded-xl">
              <p className="text-xs text-text-secondary mb-1">Wishlist</p>
              <p className="text-xl font-bold text-amber-500">{stats.games.wishlist}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge 
          variant={filterStatus === null ? 'primary' : 'default'} 
          onClick={() => setFilterStatus(null)}
        >
          All
        </Badge>
        {STATUS_OPTIONS[activeTab].map(s => (
          <Badge 
            key={s}
            variant={filterStatus === s ? getStatusVariant(s) as any : 'default'}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </Badge>
        ))}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-24 h-24 mb-6 rounded-full bg-surface-alt flex items-center justify-center">
            {activeTab === 'ANIME' ? <IconMovie className="w-10 h-10 text-text-muted" /> : <IconDeviceGamepad2 className="w-10 h-10 text-text-muted" />}
          </div>
          <h3 className="text-xl font-medium mb-2">No entries found</h3>
          <p className="text-text-secondary max-w-md mb-6">Track what you're watching or playing, rate them, and keep notes.</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-primary hover:underline font-medium"
          >
            Add your first {activeTab.toLowerCase()}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
          <AnimatePresence>
            {filteredLogs.map(log => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={log.id}
                className="bg-surface border border-border p-5 rounded-xl flex flex-col gap-3 group relative hover:border-border transition-colors cursor-pointer"
                onClick={() => handleOpenModal(log)}
              >
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg leading-tight truncate">{log.title}</h3>
                  <Badge variant={getStatusVariant(log.status) as any}>{log.status}</Badge>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  {renderStars(log.rating)}
                  {log.type === 'ANIME' && log.episodes !== undefined && log.episodes > 0 && (
                    <span className="text-xs text-text-muted">{log.episodes} eps</span>
                  )}
                </div>

                <p className="text-sm text-text-secondary whitespace-pre-wrap line-clamp-3 mt-2">
                  {log.notes || <span className="italic opacity-50">No notes</span>}
                </p>

                <div className="flex justify-end mt-auto pt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm('Confirm Delete', 'Delete this entry?', () => { deleteMediaLog(log.id); });
                    }}
                    className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLog ? `Edit Entry` : `Add ${activeTab === 'ANIME' ? 'Anime' : 'Game'}`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Title</label>
            <input
              type="text"
              placeholder={`e.g. ${activeTab === 'ANIME' ? 'Attack on Titan' : 'Elden Ring'}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
              >
                {STATUS_OPTIONS[activeTab].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {activeTab === 'ANIME' && (
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-sm font-medium text-text-secondary">Episodes</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary flex justify-between">
              Rating (1-10) <span>{rating > 0 ? rating : '-'}</span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-secondary">Notes</label>
            <textarea
              placeholder="Thoughts, review, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm min-h-[100px] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-muted text-white rounded-lg transition-colors"
            >
              Save Entry
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
