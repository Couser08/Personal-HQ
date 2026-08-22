export const SESSIONS = [
  { id: 'focus', label: 'Focus Session', minutes: 25, color: '#111111' },
  { id: 'short-break', label: 'Short Break', minutes: 5, color: '#22C55E' },
  { id: 'long-break', label: 'Long Break', minutes: 15, color: '#3B82F6' },
] as const;

export type SessionId = (typeof SESSIONS)[number]['id'];

export const PRESETS = [5, 10, 20, 25, 45, 60];

export const pad = (n: number) => String(n).padStart(2, '0');
