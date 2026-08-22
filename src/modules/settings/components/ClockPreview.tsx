import React from 'react';

interface ClockPreviewProps {
  style: string;
  theme: string;
}

export const ClockPreview: React.FC<ClockPreviewProps> = ({ style, theme }) => {
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
  const cardBg =
    style === 'analog'
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100';

  return (
    <div
      className={`p-4 rounded-3xl border ${cardBg} flex items-center justify-between gap-4 w-[280px] sm:w-[320px] shadow-sm select-none transition-all`}
    >
      {/* Left Side: Text/Numbers */}
      <div className="flex-1 flex flex-col gap-2 items-start text-left">
        <span
          className={`text-[8px] font-bold uppercase tracking-wider ${
            style === 'analog' ? 'text-rose-500/70' : 'text-zinc-500 dark:text-zinc-400'
          }`}
        >
          FOCUS TIME
        </span>

        {/* Main Time Render */}
        {style === 'flip' ? (
          <div className="flex items-center gap-1">
            <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-1 text-2xl font-bold font-mono text-center shadow-md relative min-w-[36px]">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
              25
            </div>
            <span className="text-xl font-bold text-zinc-500">:</span>
            <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-1 text-2xl font-bold font-mono text-center shadow-md relative min-w-[36px]">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
              00
            </div>
          </div>
        ) : style === 'analog' ? (
          <div
            className="text-4xl font-bold font-mono text-rose-500"
            style={{ textShadow: '0 0 10px rgba(244,63,94,0.6)' }}
          >
            25:00
          </div>
        ) : style === 'minimal-ring' ? (
          <div className="text-4xl font-light tracking-tight">25:00</div>
        ) : (
          <div className="text-4xl font-bold font-mono">25:00</div>
        )}

        {/* Badges and Sub-elements */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/10"
          style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(244,63,94,0.08)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          Focus Session 1
        </span>
        <button
          className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer ${
            style === 'analog'
              ? 'bg-zinc-900 border-zinc-850 text-zinc-400'
              : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
          }`}
        >
          Stop Focus
        </button>
      </div>

      {/* Vertical Divider */}
      <div
        className={`w-px h-16 ${
          style === 'analog' ? 'bg-zinc-850' : 'bg-zinc-200 dark:bg-zinc-800'
        }`}
      />

      {/* Right Side: Circular Widget */}
      <div className="shrink-0 flex items-center justify-center relative">
        {style === 'flip' ? (
          <svg width="70" height="70" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={isDark ? '#333' : '#e4e4e7'}
              strokeWidth="3"
              strokeDasharray="0 8"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="4.5"
              strokeDasharray="0 8"
              strokeLinecap="round"
              strokeDashoffset="24"
            />
            <circle
              cx="50"
              cy="50"
              r="16"
              fill={isDark ? '#111' : '#fff'}
              stroke="#f43f5e"
              strokeWidth="1"
              className="shadow-sm"
            />
            <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
          </svg>
        ) : style === 'analog' ? (
          <svg
            width="70"
            height="70"
            viewBox="0 0 100 100"
            style={{ filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.5))' }}
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#1f1f23"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="3"
              strokeDasharray="4 4"
              strokeDashoffset="16"
            />
            <circle cx="50" cy="50" r="16" fill="#000" stroke="#f43f5e" strokeWidth="1.5" />
            <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
          </svg>
        ) : style === 'minimal-ring' ? (
          <svg width="70" height="70" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={isDark ? '#222' : '#f4f4f5'}
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="4"
              strokeDasharray="251"
              strokeDashoffset="75"
              strokeLinecap="round"
            />
            <circle cx="78" cy="22" r="4" fill="white" stroke="#f43f5e" strokeWidth="2.5" />
            <circle
              cx="50"
              cy="50"
              r="16"
              fill={isDark ? '#111' : '#fff'}
              stroke="#f43f5e"
              strokeWidth="1"
              className="shadow-sm"
            />
            <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
          </svg>
        ) : (
          <svg width="70" height="70" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={isDark ? '#333' : '#e4e4e7'}
              strokeWidth="2"
              strokeDasharray="3 4"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="3 4"
              strokeDashoffset="24"
            />
            <circle
              cx="50"
              cy="50"
              r="16"
              fill={isDark ? '#111' : '#fff'}
              stroke="#f43f5e"
              strokeWidth="1"
              className="shadow-sm"
            />
            <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
          </svg>
        )}
      </div>
    </div>
  );
};
