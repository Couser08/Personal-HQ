import { useState, useEffect } from 'react';

export const EMOJIS = [
  '🎯', '📅', '🎓', '💼', '✈️', '🎮', '📝', '🏆', '💰', '🔥',
  '⏰', '🎉', '📚', '💻', '🏋️', '🎬', '🚀', '❤️', '🌙', '⭐',
];

export const COLORS = ['rose', 'amber', 'blue', 'green', 'purple'] as const;

export const ACCENT: Record<
  string,
  { bg: string; text: string; ring: string; border: string; solidBg: string }
> = {
  rose: {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    ring: 'ring-rose-500',
    border: 'border-rose-500',
    solidBg: 'bg-rose-500',
  },
  amber: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    ring: 'ring-amber-500',
    border: 'border-amber-500',
    solidBg: 'bg-amber-500',
  },
  blue: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    ring: 'ring-blue-500',
    border: 'border-blue-500',
    solidBg: 'bg-blue-500',
  },
  green: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    ring: 'ring-green-500',
    border: 'border-green-500',
    solidBg: 'bg-green-500',
  },
  purple: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    ring: 'ring-purple-500',
    border: 'border-purple-500',
    solidBg: 'bg-purple-500',
  },
};

export const COLOR_HEX: Record<string, string> = {
  rose: '#f43f5e',
  amber: '#f59e0b',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
};

export function getTimeLeft(dateStr: string) {
  const total = Date.parse(dateStr) - Date.now();
  if (total <= 0) return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  return {
    isPast: false,
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

export function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function useCountdown(targetDate: string) {
  const [t, setT] = useState(() => getTimeLeft(targetDate));
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return t;
}
