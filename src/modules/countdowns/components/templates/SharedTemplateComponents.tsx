import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLOR_HEX, pad } from '../../utils/countdownHelpers';

export const FlipDigit = ({ value }: { value: string }) => (
  <AnimatePresence mode="popLayout">
    <motion.span
      key={value}
      initial={{ rotateX: 90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      exit={{ rotateX: -90, opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'inline-block', transformOrigin: 'center' }}
    >
      {value}
    </motion.span>
  </AnimatePresence>
);

export const ProgressRing = ({
  value,
  max,
  color,
  label,
  size = 80,
  thick = 6,
}: {
  value: number;
  max: number;
  color: string;
  label: string;
  size?: number;
  thick?: number;
}) => {
  const r = (size - thick * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thick}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLOR_HEX[color] ?? '#f43f5e'}
          strokeWidth={thick}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span
        className="text-2xl font-bold tabular-nums font-mono"
        style={{ marginTop: -size * 0.75, zIndex: 1 }}
      >
        {pad(value)}
      </span>
      <span className="text-xs text-text-muted font-medium">{label}</span>
    </div>
  );
};

export const BigProgressRing = ({
  pct,
  color,
  children,
}: {
  pct: number;
  color: string;
  children: React.ReactNode;
}) => {
  const size = 120,
    thick = 10,
    r = (size - thick * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={thick}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={COLOR_HEX[color] ?? '#f43f5e'}
          strokeWidth={thick}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
};

export const CompletedBadge = () => (
  <div className="mt-4 flex items-center gap-2 text-green-500 font-bold text-lg">
    <span>🎉</span> Completed!
  </div>
);
