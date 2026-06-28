import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconTrash, IconDeviceGamepad2, IconMovie, IconStarFilled, IconStar } from '@tabler/icons-react';
import { useAppStore, type MediaLog } from '../../store/useAppStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';

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
      className="flex flex-col gap-6 h-full"
    >
      <div className="flex flex-col gap-4 justify-between items-start md:flex-row md:items-center">
        <div>
          <h2 className="flex gap-2 items-center text-2xl font-bold">
            Media Log <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
          </h2>
          <p className="text-sm text-text-secondary">Track your anime and games</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex gap-2 items-center px-4 py-2 text-white rounded-lg transition-colors bg-primary hover:bg-primary-muted shrink-0"
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {activeTab === 'ANIME' ? (
          <>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Total Anime</p>
              <p className="text-xl font-bold">{stats.anime.total}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Watching</p>
              <p className="text-xl font-bold text-primary">{stats.anime.watching}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Completed</p>
              <p className="text-xl font-bold text-green-500">{stats.anime.completed}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Dropped</p>
              <p className="text-xl font-bold text-rose-500">{stats.anime.dropped}</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Total Games</p>
              <p className="text-xl font-bold">{stats.games.total}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Playing</p>
              <p className="text-xl font-bold text-primary">{stats.games.playing}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Finished</p>
              <p className="text-xl font-bold text-green-500">{stats.games.finished}</p>
            </div>
            <div className="p-4 rounded-xl border bg-surface border-border">
              <p className="mb-1 text-xs text-text-secondary">Wishlist</p>
              <p className="text-xl font-bold text-amber-500">{stats.games.wishlist}</p>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
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
        <EmptyState
          icon={activeTab === 'ANIME' ? <IconMovie className="w-9 h-9 text-text-muted" /> : <IconDeviceGamepad2 className="w-9 h-9 text-text-muted" />}
          title="No entries found"
          description="Track what you're watching or playing, rate them, and keep notes."
          action={
            <button
              onClick={() => handleOpenModal()}
              className="font-medium text-primary hover:underline"
            >
              Add your first {activeTab.toLowerCase()}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 auto-rows-max gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredLogs.map(log => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={log.id}
                className="flex relative flex-col gap-3 p-5 rounded-xl border transition-colors cursor-pointer bg-surface border-border group hover:border-border"
                onClick={() => handleOpenModal(log)}
              >
                <div className="flex gap-2 justify-between items-start">
                  <h3 className="text-lg font-semibold leading-tight truncate">{log.title}</h3>
                  <Badge variant={getStatusVariant(log.status) as any}>{log.status}</Badge>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  {renderStars(log.rating)}
                  {log.type === 'ANIME' && log.episodes !== undefined && log.episodes > 0 && (
                    <span className="text-xs text-text-muted">{log.episodes} eps</span>
                  )}
                </div>

                <p className="mt-2 text-sm whitespace-pre-wrap text-text-secondary line-clamp-3">
                  {log.notes || <span className="italic opacity-50">No notes</span>}
                </p>

                <div className="flex justify-end pt-2 mt-auto">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      showConfirm('Confirm Delete', 'Delete this entry?', () => { deleteMediaLog(log.id); });
                    }}
                    className="p-1 rounded opacity-0 transition-colors text-text-muted hover:text-rose-500 hover:bg-rose-500/10 group-hover:opacity-100"
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
              className="px-3 py-2 w-full text-sm rounded-lg border transition-colors bg-surface-alt border-border-alt focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col flex-1 gap-1">
              <label className="text-sm font-medium text-text-secondary">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 w-full text-sm rounded-lg border transition-colors bg-surface-alt border-border-alt focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {STATUS_OPTIONS[activeTab].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {activeTab === 'ANIME' && (
              <div className="flex flex-col flex-1 gap-1">
                <label className="text-sm font-medium text-text-secondary">Episodes</label>
                <input
                  type="number"
                  placeholder="e.g. 24"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  className="px-3 py-2 w-full text-sm rounded-lg border transition-colors bg-surface-alt border-border-alt focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="flex justify-between text-sm font-medium text-text-secondary">
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

          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-text-secondary hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-primary hover:bg-primary-muted"
            >
              Save Entry
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
