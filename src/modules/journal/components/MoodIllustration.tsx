import React from 'react';

export const MoodIllustration: React.FC<{ mood: string }> = ({ mood }) => {
  switch (mood) {
    case 'great':
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-amber-500/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M5.64 18.36l-1.42 1.42M19.78 4.22l-1.42 1.42" strokeLinecap="round" />
        </svg>
      );
    case 'good':
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707" />
          <path d="M16 14a4 4 0 01-8 0" strokeLinecap="round" />
        </svg>
      );
    case 'meh':
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-sky-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    case 'bad':
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-indigo-400/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path d="M8 20v2M12 20v2M16 20v2" strokeLinecap="round" />
        </svg>
      );
    case 'terrible':
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-stone-500/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          <path d="M13 16l-2 3h3l-2 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg className="w-12 h-12 sm:w-14 sm:h-14 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
        </svg>
      );
  }
};
