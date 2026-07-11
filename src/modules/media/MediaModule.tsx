import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconPlus, IconMovie, IconDeviceGamepad2 
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { supabase } from '../../lib/supabase';
import { MediaGrid } from './MediaGrid';
import { MediaDetailView } from './MediaDetailView';
import AnimeReviewCenter from './AnimeReviewCenter';
import AnimeRankingsView from './AnimeRankingsView';

export default function MediaModule() {
  const { theme, mediaLogs, deleteMediaLog, showConfirm, openMediaEntryModal, updateMediaLog, settings, updateSettings } = useAppStore(useShallow(state => ({
    theme: state.theme,
    mediaLogs: state.mediaLogs,
    deleteMediaLog: state.deleteMediaLog,
    showConfirm: state.showConfirm,
    openMediaEntryModal: state.openMediaEntryModal,
    updateMediaLog: state.updateMediaLog,
    settings: state.settings,
    updateSettings: state.updateSettings,
  })));
  
  const [activeTab, setActiveTab] = useState<'ANIME' | 'GAME'>('ANIME');
  const [viewMode, setViewMode] = useState<'dashboard' | 'grid' | 'rankings'>('dashboard');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  
  // Dedicated anime detailed page tracking
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [chibiMascotUrl, setChibiMascotUrl] = useState('');

  const loadMascot = () => {
    const publicUrl = supabase.storage.from('avatars').getPublicUrl('global/media_chibi_mascot.png').data.publicUrl;
    setChibiMascotUrl(`${publicUrl}?t=${Date.now()}`);
  };

  useEffect(() => {
    loadMascot();
    const handleUpdate = () => {
      loadMascot();
    };
    window.addEventListener('media-mascot-updated', handleUpdate);
    return () => {
      window.removeEventListener('media-mascot-updated', handleUpdate);
    };
  }, []);

  const handleTabChange = (tab: 'ANIME' | 'GAME') => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      setFilterStatus(null);
      setSelectedAnimeId(null);
      // Default Anime to dashboard, Game to grid
      setViewMode(tab === 'ANIME' ? 'dashboard' : 'grid');
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
  const accent = activeTab === 'ANIME' ? '#e11d48' : '#a855f7'; // Rose accent for Anime center matching design

  // Find selected anime
  const selectedAnime = useMemo(() => {
    if (!selectedAnimeId) return null;
    return mediaLogs.find(m => m.id === selectedAnimeId && m.type === 'ANIME') || null;
  }, [mediaLogs, selectedAnimeId]);

  if (selectedAnime) {
    return (
      <MediaDetailView
        selectedAnime={selectedAnime}
        setSelectedAnimeId={setSelectedAnimeId}
        theme={theme}
        settings={settings}
        updateSettings={updateSettings}
        updateMediaLog={updateMediaLog}
        chibiMascotUrl={chibiMascotUrl}
        setChibiMascotUrl={setChibiMascotUrl}
        openMediaEntryModal={openMediaEntryModal}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="flex flex-col w-full max-w-6xl pb-16 mx-auto select-none"
    >
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 pt-4 mb-8 md:flex-row md:items-end text-left">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-1">Personal HQ</p>
          <h2 className="text-4xl font-black leading-none tracking-tight text-text-primary">Media Log</h2>
          <p className="text-[15px] text-text-secondary font-medium mt-2">Your personal catalogue for anime & games.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-2 sm:mt-0">
          
          {/* Dashboard / Library / Rankings View Switcher for Anime */}
          {activeTab === 'ANIME' && (
            <div className="flex bg-stone-100 dark:bg-zinc-900/60 p-1.5 rounded-2xl border border-border/40 shadow-sm text-xs font-bold gap-1 shrink-0 self-start md:self-auto">
              <button 
                onClick={() => setViewMode('dashboard')} 
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  viewMode === 'dashboard' 
                    ? 'bg-surface text-rose-500 shadow-sm border border-border/30 font-black' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-surface text-rose-500 shadow-sm border border-border/30 font-black' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Library List
              </button>
              <button 
                onClick={() => setViewMode('rankings')} 
                className={`px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  viewMode === 'rankings' 
                    ? 'bg-surface text-rose-500 shadow-sm border border-border/30 font-black' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Leaderboard
              </button>
            </div>
          )}

          <button
            onClick={() => openMediaEntryModal(activeTab)}
            style={{ background: accent, boxShadow: `0 4px 16px ${accent}44` }}
            className="flex gap-2 items-center px-6 py-3 text-white rounded-full font-bold text-[14px] active:scale-95 transition-all w-max shrink-0 hover:opacity-90 cursor-pointer"
          >
            <IconPlus className="w-5 h-5" /> New Entry
          </button>
        </div>
      </div>

      {/* ── iOS Segmented Control ── */}
      <div className="flex justify-center mb-10">
        <div className="bg-surface-alt/80 p-1.5 rounded-[20px] shadow-sm flex relative w-full max-w-[300px] border border-border">
          {(['ANIME', 'GAME'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2.5 font-bold text-[13px] flex items-center justify-center gap-2 rounded-[14px] transition-all cursor-pointer ${
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
          key={`${activeTab}-${viewMode}`}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          className="flex flex-col gap-8"
        >
          {activeTab === 'ANIME' && viewMode === 'dashboard' ? (
            <AnimeReviewCenter 
              onViewAllWatching={() => {
                setFilterStatus('WATCHING');
                setViewMode('grid');
              }}
              onViewAllReviews={() => {
                setFilterStatus('COMPLETED');
                setViewMode('grid');
              }}
              onViewAllLibrary={() => {
                setFilterStatus(null);
                setViewMode('grid');
              }}
              onViewRankings={() => {
                setViewMode('rankings');
              }}
            />
          ) : activeTab === 'ANIME' && viewMode === 'rankings' ? (
            <AnimeRankingsView 
              onBackToDashboard={() => setViewMode('dashboard')}
            />
          ) : (
            <MediaGrid
              activeTab={activeTab}
              filteredLogs={filteredLogs}
              stats={stats}
              accent={accent}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              setSelectedAnimeId={setSelectedAnimeId}
              openMediaEntryModal={openMediaEntryModal}
              deleteMediaLog={deleteMediaLog}
              showConfirm={showConfirm}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
