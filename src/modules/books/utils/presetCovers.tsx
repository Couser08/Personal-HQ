import React from 'react';

export const PRESET_COVERS = [
  { id: 'purple-mountain', name: 'Purple Mountain', gradient: 'from-violet-600 via-indigo-700 to-indigo-950', bg: '#8B5CF6' },
  { id: 'blue-lake', name: 'Blue Lake', gradient: 'from-blue-600 via-sky-700 to-cyan-950', bg: '#3B82F6' },
  { id: 'green-forest', name: 'Green Forest', gradient: 'from-emerald-600 via-teal-700 to-stone-900', bg: '#10B981' },
  { id: 'orange-sunset', name: 'Orange Sunset', gradient: 'from-orange-500 via-rose-600 to-stone-900', bg: '#F97316' },
  { id: 'pink-rose', name: 'Pink Rose', gradient: 'from-pink-600 via-rose-500 to-amber-950', bg: '#EC4899' },
  { id: 'tuscan-leather', name: 'Tuscan Leather', gradient: 'from-amber-800 via-amber-900 to-stone-950', bg: '#8C6239' },
];

export const BookCover: React.FC<{
  presetId: string;
  title: string;
  author?: string;
  className?: string;
  showDetails?: boolean;
}> = ({ presetId, title, author, className = '', showDetails = true }) => {
  const isCustom = presetId.startsWith('data:image/') || presetId.startsWith('http');
  const preset = PRESET_COVERS.find((c) => c.id === presetId) || PRESET_COVERS[0];

  // Draw some simple geometric SVG illustrations based on the preset
  const renderIllustration = () => {
    if (isCustom) return null;
    switch (presetId) {
      case 'purple-mountain':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 150" fill="none">
            <path d="M-10 160 L40 100 L90 160 Z" fill="white" />
            <path d="M20 160 L70 85 L120 160 Z" fill="white" opacity="0.6" />
            <circle cx="50" cy="45" r="10" fill="white" opacity="0.5" />
          </svg>
        );
      case 'blue-lake':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 150" fill="none">
            <circle cx="70" cy="40" r="12" fill="white" />
            <path d="M10 130 C40 130, 60 140, 90 135 L90 160 L10 160 Z" fill="white" />
            <path d="M45 125 L52 125 L49 115 Z" fill="white" opacity="0.8" />
          </svg>
        );
      case 'green-forest':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 150" fill="none">
            <path d="M20 150 L35 110 L50 150 Z" fill="white" />
            <path d="M45 150 L55 115 L65 150 Z" fill="white" opacity="0.7" />
            <path d="M55 150 L70 100 L85 150 Z" fill="white" opacity="0.5" />
          </svg>
        );
      case 'orange-sunset':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 150" fill="none">
            <circle cx="50" cy="75" r="22" fill="white" />
            <rect x="0" y="75" width="100" height="75" fill="white" opacity="0.4" />
          </svg>
        );
      case 'tuscan-leather':
        return (
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 150" fill="none">
            <rect x="15" y="25" width="70" height="100" rx="4" stroke="white" strokeWidth="1.5" />
            <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="1.5" />
            <line x1="30" y1="75" x2="70" y2="75" stroke="white" strokeWidth="1.5" />
            <line x1="30" y1="100" x2="70" y2="100" stroke="white" strokeWidth="1.5" />
          </svg>
        );
      case 'pink-rose':
      default:
        return (
          <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 150" fill="none">
            <path d="M30 40 Q50 20 70 40 T90 80 T10 80 Z" fill="white" />
            <circle cx="50" cy="50" r="6" fill="white" opacity="0.8" />
          </svg>
        );
    }
  };

  const bgStyle: React.CSSProperties = isCustom
    ? {
        backgroundImage: `url(${presetId})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  const gradientClass = isCustom ? 'bg-zinc-800' : `bg-gradient-to-br ${preset.gradient}`;

  return (
    <div
      className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lifted ${gradientClass} select-none flex flex-col justify-between p-5 text-white ${className}`}
      style={bgStyle}
    >
      {/* Decorative Spine Hinge on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-3 bg-black/20 border-r border-white/5 z-10" />
      <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-white/10 z-10" />

      {/* Elegant ribbon bookmark hanging from top */}
      <div className="absolute left-5 top-0 w-2.5 h-12 bg-rose-500 dark:bg-rose-600 shadow-sm rounded-b-[1px] z-10 flex flex-col justify-end">
        <div className="w-full h-1 bg-black/20" />
      </div>

      {/* SVG Background Illustration */}
      {renderIllustration()}

      {/* Title & Author Overlay */}
      {showDetails ? (
        <div className="relative z-10 flex flex-col justify-between h-full pt-8 pl-1 text-left bg-gradient-to-t from-black/45 via-black/10 to-transparent -mx-5 -my-5 p-5">
          <div className="mt-8">
            <h3 className="font-extrabold text-base leading-tight tracking-tight drop-shadow-md text-white font-sans line-clamp-3">
              {title}
            </h3>
            {author && (
              <p className="text-[10px] text-white/90 font-medium mt-1.5 drop-shadow-sm truncate">
                {author}
              </p>
            )}
          </div>
          <div className="text-[8px] uppercase font-bold tracking-[0.25em] opacity-80 text-white/80 mt-auto">
            Notebook
          </div>
        </div>
      ) : (
        <div />
      )}
    </div>
  );
};
