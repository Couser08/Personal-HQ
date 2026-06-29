import React from 'react';

interface AppLogoProps {
  className?: string;
}

/**
 * Premium vector squircle App Logo based on user mockups:
 * Stylized white "P" glyph on a dark squircle tile, with a custom rose-red dot at the bottom left.
 */
export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-8 h-8' }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Apple-style smooth gradient tile background */}
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e1e24" />
          <stop offset="100%" stopColor="#0f0f12" />
        </linearGradient>
        {/* Soft shadow for depth */}
        <filter id="logo-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Rounded squircle tile */}
      <rect width="100" height="100" rx="28" fill="url(#logo-bg)" />

      {/* White Stylized P Glyph */}
      <g filter="url(#logo-shadow)">
        {/* Vertical stem */}
        <rect x="34" y="24" width="12" height="52" rx="6" fill="#ffffff" />
        {/* Top semi-circular loop */}
        <path
          d="M40 24H58C67.9411 24 76 32.0589 76 42C76 51.9411 67.9411 60 58 60H40"
          stroke="#ffffff"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Rose red dot at bottom-left corner */}
      <circle cx="28" cy="74" r="9.5" fill="#f43f5e" />
    </svg>
  );
};
export default AppLogo;
