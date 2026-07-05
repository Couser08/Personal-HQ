import { useId } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'glowing' | 'dotted' | 'double';
}

export const ProgressRing = ({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#f43f5e',
  style = 'solid'
}: ProgressRingProps) => {
  const center = size / 2;
  const radius = center - strokeWidth - 4; // Added padding for the outer accent border
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const uniqueId = useId().replace(/:/g, '');
  const maskId = `progress-mask-${uniqueId}`;

  let dashTrack = 'none';
  let linecap: 'round' | 'butt' | 'square' = 'round';
  
  const tickSpacing = circumference / 60;
  
  if (style === 'dashed') {
    dashTrack = `3 ${tickSpacing - 3}`;
    linecap = 'butt';
  }
  if (style === 'dotted') {
    dashTrack = `0 ${tickSpacing}`;
    linecap = 'round';
  }

  const useMask = style === 'dashed' || style === 'dotted';

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0 -rotate-90 select-none pointer-events-none" width={size} height={size}>
        {useMask && (
          <defs>
            <mask id={maskId}>
              <motion.circle
                stroke="white"
                fill="none"
                strokeWidth={strokeWidth + 10}
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: offset }}
                initial={{ strokeDashoffset: circumference }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                cx={center}
                cy={center}
                r={radius}
              />
            </mask>
          </defs>
        )}

        {/* ================= EXTRA APPLE DESIGN BORDERS ================= */}
        {/* 1. Ultra-thin Outer Premium Accent Border Ring */}
        <circle
          className="stroke-zinc-300/30 dark:stroke-zinc-700/30"
          fill="none"
          strokeWidth={1}
          cx={center}
          cy={center}
          r={radius + (strokeWidth / 2) + 3}
        />

        {/* 2. Inner Deep Shadow Track Border Ring */}
        <circle
          className="stroke-zinc-200/15 dark:stroke-zinc-900/40"
          fill="none"
          strokeWidth={1}
          cx={center}
          cy={center}
          r={radius - (strokeWidth / 2) - 3}
        />
        {/* =============================================================== */}

        {/* Main Base Structural Track */}
        <circle
          className="text-zinc-200/50 dark:text-zinc-800/40"
          stroke="currentColor"
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={dashTrack}
          strokeLinecap={linecap}
          cx={center}
          cy={center}
          r={radius}
        />
        
        {/* Apple Style Ambient Glow */}
        {style === 'glowing' && (
          <motion.circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            cx={center}
            cy={center}
            r={radius}
            className="blur-[8px] opacity-35 mix-blend-screen"
          />
        )}

        {/* Dynamic Progress Ring Layer */}
        {useMask ? (
          <circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap={linecap}
            strokeDasharray={dashTrack}
            mask={`url(#${maskId})`}
            cx={center}
            cy={center}
            r={radius}
          />
        ) : (
          <motion.circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap={linecap}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            cx={center}
            cy={center}
            r={radius}
          />
        )}

        {/* Double Rings Overlay */}
        {style === 'double' && (
          <motion.circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth * 0.5}
            strokeLinecap="round"
            strokeDasharray={circumference - (Math.PI * strokeWidth * 2)}
            animate={{ 
              strokeDashoffset: (circumference - (Math.PI * strokeWidth * 2)) - (progress * (circumference - (Math.PI * strokeWidth * 2))) 
            }}
            initial={{ strokeDashoffset: circumference - (Math.PI * strokeWidth * 2) }}
            transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
            cx={center}
            cy={center}
            r={radius - strokeWidth - 5}
            className="opacity-40"
          />
        )}
      </svg>
    </div>
  );
};