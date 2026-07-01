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
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const maskId = `progress-mask-${size}-${Math.random().toString(36).substr(2, 9)}`;

  // Render track based on style
  let dashTrack = 'none';
  let linecap: 'round' | 'butt' | 'square' = 'round';
  
  // 60 ticks for dashed
  const tickSpacing = circumference / 60;
  
  if (style === 'dashed') {
    dashTrack = `4 ${tickSpacing - 4}`;
    linecap = 'butt';
  }
  if (style === 'dotted') {
    dashTrack = `0 ${tickSpacing}`;
    linecap = 'round';
  }

  const useMask = style === 'dashed' || style === 'dotted';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="absolute top-0 left-0 -rotate-90" width={size} height={size}>
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
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                cx={center}
                cy={center}
                r={radius}
              />
            </mask>
          </defs>
        )}
        {/* Track */}
        <circle
          className="text-text-muted/20"
          stroke="currentColor"
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={dashTrack}
          strokeLinecap={linecap}
          cx={center}
          cy={center}
          r={radius}
        />
        
        {/* Glow effect for 'glowing' */}
        {style === 'glowing' && (
          <motion.circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            cx={center}
            cy={center}
            r={radius}
            className="blur-md opacity-50"
          />
        )}

        {/* Progress */}
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
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            cx={center}
            cy={center}
            r={radius}
          />
        )}
        {/* Double Inner Progress */}
        {style === 'double' && (
          <motion.circle
            stroke={color}
            fill="none"
            strokeWidth={strokeWidth / 2}
            strokeLinecap="round"
            strokeDasharray={circumference - (Math.PI * strokeWidth * 2)}
            animate={{ strokeDashoffset: (circumference - (Math.PI * strokeWidth * 2)) - (progress * (circumference - (Math.PI * strokeWidth * 2))) }}
            initial={{ strokeDashoffset: circumference - (Math.PI * strokeWidth * 2) }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            cx={center}
            cy={center}
            r={radius - strokeWidth - 2}
            className="opacity-70"
          />
        )}
      </svg>
    </div>
  );
};
