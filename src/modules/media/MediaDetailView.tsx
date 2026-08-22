import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type MediaLog } from '../../store/useAppStore';
import { mediaService } from '../../lib/db';
import { MediaHeroBanner } from './components/MediaHeroBanner';
import { MoviePresentationPanel } from './components/MoviePresentationPanel';
import { EpisodeTrackerPanel } from './components/EpisodeTrackerPanel';
import { MediaDetailSidebar } from './components/MediaDetailSidebar';

interface MediaDetailViewProps {
  selectedAnime: MediaLog;
  setSelectedAnimeId: (id: string | null) => void;
  theme: string;
  settings: any;
  updateSettings: (data: any) => void;
  updateMediaLog: (id: string, data: any) => void;
  chibiMascotUrl: string;
  setChibiMascotUrl: (url: string) => void;
  openMediaEntryModal: (type: 'ANIME' | 'GAME' | 'SERIES' | 'MOVIE', log?: any) => void;
}

export const MediaDetailView: React.FC<MediaDetailViewProps> = ({
  selectedAnime,
  setSelectedAnimeId,
  theme,
  settings,
  updateSettings,
  updateMediaLog,
  chibiMascotUrl,
  setChibiMascotUrl,
  openMediaEntryModal,
}) => {
  const [visibleEpisodes, setVisibleEpisodes] = useState(25);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteInput, setQuoteInput] = useState('');

  useEffect(() => {
    setVisibleEpisodes(25);
    setIsEditingQuote(false);
    if (selectedAnime.id && !selectedAnime.notes) {
      void mediaService.fetchDetail(selectedAnime.id).then((detail) => {
        if (detail && detail.notes) {
          updateMediaLog(selectedAnime.id, { notes: detail.notes });
        }
      });
    }
  }, [selectedAnime.id]);

  const isAnime = selectedAnime.type === 'ANIME';
  const isSeries = selectedAnime.type === 'SERIES';
  const isMovie = selectedAnime.type === 'MOVIE';

  const accentColor = isAnime
    ? '#e11d48'
    : isSeries
    ? '#3b82f6'
    : isMovie
    ? '#10b981'
    : '#a855f7';
  const accentShadow = isAnime
    ? 'rgba(244, 63, 94, 0.4)'
    : isSeries
    ? 'rgba(59, 130, 246, 0.4)'
    : isMovie
    ? 'rgba(16, 185, 129, 0.4)'
    : 'rgba(168, 85, 247, 0.4)';

  let notesText = selectedAnime.notes || '';
  let season = (selectedAnime as any).season || 1;
  let watchedEpisodes: number[] = [];
  let timestamps: Record<number, string> = {};
  let lastWatchedEp = '';
  let lastWatchedTimestamp = '';
  let bannerImage = isAnime
    ? '/anime_hero_banner_1783275383433.png'
    : isSeries
    ? '/series_hero_banner_default.png'
    : '/movie_hero_banner_default.png';
  let episodeThumb = '/anime_episode_thumb_1783275399662.png';

  // Movie specific tags
  let movieMeta = {
    duration: '',
    releaseYear: '',
    cinemaLocation: '',
    watchPartners: '',
    trailerUrl: '',
  };

  try {
    if (selectedAnime.notes && selectedAnime.notes.trim().startsWith('{')) {
      const meta = JSON.parse(selectedAnime.notes);
      notesText = meta.notesText ?? '';
      season = meta.season ?? 1;
      watchedEpisodes = meta.watchedEpisodes ?? [];
      timestamps = meta.timestamps ?? {};
      lastWatchedEp = meta.lastWatchedEp?.toString() || '';
      lastWatchedTimestamp = meta.lastWatchedTimestamp ?? '';
      bannerImage = meta.bannerImage ?? bannerImage;
      episodeThumb = meta.episodeThumb ?? '/anime_episode_thumb_1783275399662.png';

      if (isMovie) {
        movieMeta = {
          duration: meta.duration ?? '',
          releaseYear: meta.releaseYear ?? '',
          cinemaLocation: meta.cinemaLocation ?? '',
          watchPartners: meta.watchPartners ?? '',
          trailerUrl: meta.trailerUrl ?? '',
        };
      }
    }
  } catch (e) {}

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const saveAnimeMeta = (updates: {
    notesText?: string;
    season?: number;
    watchedEpisodes?: number[];
    timestamps?: Record<number, string>;
    lastWatchedEp?: number | null;
    lastWatchedTimestamp?: string;
    bannerImage?: string;
    episodeThumb?: string;
  }) => {
    let oldMeta = {};
    try {
      if (selectedAnime.notes && selectedAnime.notes.trim().startsWith('{')) {
        oldMeta = JSON.parse(selectedAnime.notes);
      }
    } catch (e) {}

    const meta = {
      ...oldMeta,
      notesText: updates.notesText !== undefined ? updates.notesText : notesText,
      season: updates.season !== undefined ? updates.season : season,
      watchedEpisodes:
        updates.watchedEpisodes !== undefined ? updates.watchedEpisodes : watchedEpisodes,
      timestamps: updates.timestamps !== undefined ? updates.timestamps : timestamps,
      lastWatchedEp:
        updates.lastWatchedEp !== undefined
          ? updates.lastWatchedEp
          : lastWatchedEp
          ? parseInt(lastWatchedEp)
          : null,
      lastWatchedTimestamp:
        updates.lastWatchedTimestamp !== undefined
          ? updates.lastWatchedTimestamp
          : lastWatchedTimestamp,
      bannerImage: updates.bannerImage !== undefined ? updates.bannerImage : bannerImage,
      episodeThumb: updates.episodeThumb !== undefined ? updates.episodeThumb : episodeThumb,
    };
    updateMediaLog(selectedAnime.id, {
      notes: JSON.stringify(meta),
    });
  };

  const saveMovieMeta = (updates: Partial<typeof movieMeta>) => {
    let oldMeta = {};
    try {
      if (selectedAnime.notes && selectedAnime.notes.trim().startsWith('{')) {
        oldMeta = JSON.parse(selectedAnime.notes);
      }
    } catch (e) {}

    const meta = {
      ...oldMeta,
      notesText,
      ...updates,
    };
    updateMediaLog(selectedAnime.id, {
      notes: JSON.stringify(meta),
    });
  };

  const epCount = selectedAnime.episodes || 0;
  const progressPercent =
    epCount > 0 ? Math.min(100, Math.round((watchedEpisodes.length / epCount) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col w-full min-h-screen pb-16 font-sans text-left select-none bg-background animate-fade-in"
    >
      <style>{`
        .anime-checkbox {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid ${accentColor};
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }
        .anime-checkbox:checked {
          background-color: ${accentColor};
          box-shadow: 0 0 10px ${accentShadow};
        }
        .anime-checkbox:checked::after {
          content: '✓';
          color: white;
          font-weight: 900;
          font-size: 11px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      `}</style>

      {/* Hero Banner Area */}
      <MediaHeroBanner
        selectedAnime={selectedAnime}
        bannerImage={bannerImage}
        accentColor={accentColor}
        settings={settings}
        updateSettings={updateSettings}
        setSelectedAnimeId={setSelectedAnimeId}
        openMediaEntryModal={openMediaEntryModal}
        saveAnimeMeta={saveAnimeMeta}
        isEditingQuote={isEditingQuote}
        setIsEditingQuote={setIsEditingQuote}
        quoteInput={quoteInput}
        setQuoteInput={setQuoteInput}
      />

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-8 pt-8 md:pt-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        {/* Left Column: Movie specs OR Episode Tracker */}
        {isMovie ? (
          <MoviePresentationPanel
            movieMeta={movieMeta}
            saveMovieMeta={saveMovieMeta}
            getYouTubeId={getYouTubeId}
          />
        ) : (
          <EpisodeTrackerPanel
            isSeries={isSeries}
            accentColor={accentColor}
            watchedEpisodes={watchedEpisodes}
            epCount={epCount}
            progressPercent={progressPercent}
            visibleEpisodes={visibleEpisodes}
            setVisibleEpisodes={setVisibleEpisodes}
            episodeThumb={episodeThumb}
            timestamps={timestamps}
            saveAnimeMeta={saveAnimeMeta}
          />
        )}

        {/* Right Column: Widgets */}
        <MediaDetailSidebar
          isMovie={isMovie}
          isSeries={isSeries}
          accentColor={accentColor}
          selectedAnime={selectedAnime}
          watchedEpisodes={watchedEpisodes}
          epCount={epCount}
          progressPercent={progressPercent}
          episodeThumb={episodeThumb}
          lastWatchedEp={lastWatchedEp}
          lastWatchedTimestamp={lastWatchedTimestamp}
          notesText={notesText}
          chibiMascotUrl={chibiMascotUrl}
          setChibiMascotUrl={setChibiMascotUrl}
          theme={theme}
          saveAnimeMeta={saveAnimeMeta}
          saveMovieMeta={saveMovieMeta}
        />
      </div>
    </motion.div>
  );
};
