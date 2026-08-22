import React from 'react';
import { IconPlus, IconArrowLeft, IconStarFilled } from '@tabler/icons-react';
import type { MediaLog } from '../../../store/types';

interface MediaHeroBannerProps {
  selectedAnime: MediaLog;
  bannerImage: string;
  accentColor: string;
  settings: any;
  updateSettings: (data: any) => void;
  setSelectedAnimeId: (id: string | null) => void;
  openMediaEntryModal: (type: 'ANIME' | 'GAME' | 'SERIES' | 'MOVIE', log?: any) => void;
  saveAnimeMeta: (updates: { bannerImage?: string }) => void;
  isEditingQuote: boolean;
  setIsEditingQuote: (editing: boolean) => void;
  quoteInput: string;
  setQuoteInput: (val: string) => void;
}

export const MediaHeroBanner: React.FC<MediaHeroBannerProps> = ({
  selectedAnime,
  bannerImage,
  accentColor,
  settings,
  updateSettings,
  setSelectedAnimeId,
  openMediaEntryModal,
  saveAnimeMeta,
  isEditingQuote,
  setIsEditingQuote,
  quoteInput,
  setQuoteInput,
}) => {
  return (
    <div className="relative w-full h-[280px] md:h-[340px] shrink-0 overflow-hidden bg-surface group/banner">
      <img
        src={bannerImage}
        alt="Hero Banner"
        className="object-cover object-center w-full h-full"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src =
            'https://images.unsplash.com/photo-1574267433382-44472c72b231?w=1600&auto=format&fit=crop&q=80';
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background via-background/40 to-transparent" />

      <div className="absolute z-20 flex items-start justify-between top-6 left-6 right-6">
        <div className="absolute top-0 right-0">
          <input
            type="file"
            accept="image/*"
            id="banner-image-upload"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  saveAnimeMeta({ bannerImage: reader.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <label
            htmlFor="banner-image-upload"
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold transition-all border rounded-full shadow-lg cursor-pointer text-white border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 hover:scale-105 active:scale-95"
            title="Upload Widescreen Banner"
          >
            <IconPlus size={14} />
            <span>Upload Banner (16:9)</span>
          </label>
        </div>
        <div className="flex flex-col items-start flex-1 max-w-xl gap-4 mr-24 md:max-w-2xl text-left">
          <button
            onClick={() => setSelectedAnimeId(null)}
            className="flex items-center justify-center gap-2 px-4 py-2 transition-colors border rounded-full shadow-lg cursor-pointer border-white/10 bg-black/40 backdrop-blur-md hover:bg-black/60 text-white"
          >
            <IconArrowLeft size={16} />
            <span className="text-xs font-bold">Back to Catalogue</span>
          </button>

          <div className="w-full mt-4">
            {isEditingQuote ? (
              <input
                type="text"
                value={quoteInput}
                onChange={(e) => setQuoteInput(e.target.value)}
                onBlur={() => {
                  setIsEditingQuote(false);
                  updateSettings({ mediaQuote: quoteInput });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingQuote(false);
                    updateSettings({ mediaQuote: quoteInput });
                  } else if (e.key === 'Escape') {
                    setIsEditingQuote(false);
                  }
                }}
                className="w-full max-w-xl px-4 py-2 text-xl font-bold tracking-tight text-white transition-all border shadow-2xl bg-black/60 backdrop-blur-md border-white/20 md:text-2xl focus:outline-none rounded-2xl focus:border-rose-500"
                autoFocus
              />
            ) : (
              <p
                onDoubleClick={() => {
                  setQuoteInput(settings.mediaQuote || 'Outdo your yesterday.');
                  setIsEditingQuote(true);
                }}
                className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] cursor-pointer hover:opacity-80 transition-colors select-none max-w-xl text-left"
                title="Double-click to edit quote"
              >
                "{settings.mediaQuote || 'Outdo your yesterday.'}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Title positioned inside the banner */}
      <div className="absolute z-10 flex flex-col justify-between gap-4 bottom-6 left-6 md:left-8 right-6 md:right-8 md:flex-row md:items-end text-left">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          {selectedAnime.title}
        </h2>
        <div className="flex items-center gap-3 shrink-0">
          {selectedAnime.rating ? (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-alt border border-border shadow-xl">
              <IconStarFilled className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-text-primary">
                {selectedAnime.rating}
                <span className="text-xs font-bold text-text-muted">/10</span>
              </span>
            </div>
          ) : null}
          <button
            onClick={() => openMediaEntryModal(selectedAnime.type, selectedAnime)}
            style={{ backgroundColor: accentColor, boxShadow: `0 0 20px ${accentColor}50` }}
            className="px-5 py-2 rounded-full text-white text-xs font-bold transition-all cursor-pointer border-none"
          >
            Edit Details
          </button>
        </div>
      </div>
    </div>
  );
};
