import { type AppSettings, type JournalEntry } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  countdownTemplate: 'default',
  accentColor: 'rose',
  animationSpeed: 'normal',
  compactMode: false,
  soundEnabled: true,
  initialBankBalance: 0,
  initialCashBalance: 0,
  reduceBlur: false,
  reduceAnimations: false,
  wavyEffectEnabled: true,
  wavyEffectMode: 'premium',
  todoCompletionAnimation: 'circle-fill-confetti',
};

export const sanitizeActiveModule = (module: string) => {
  if (module === 'stocks' || module === 'notes') {
    return 'dashboard';
  }
  if (module === 'links' || module === 'calculator' || module === 'countdown') {
    return 'utilities';
  }
  return module;
};

export const loadStoredSettings = (): AppSettings => {
  const fallback = { ...DEFAULT_SETTINGS };
  try {
    const raw = localStorage.getItem('settings');
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
};

export const getStoreErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const throttleMap = new Map<string, number>();
export const shouldThrottle = (actionName: string, limit = 600) => {
  const now = Date.now();
  const last = throttleMap.get(actionName) || 0;
  if (now - last < limit) return true;
  throttleMap.set(actionName, now);
  return false;
};

export const normalizeJournalEntry = (entry: Partial<JournalEntry>): JournalEntry => ({
  id: entry.id ?? crypto.randomUUID(),
  title: entry.title ?? '',
  content: entry.content ?? '',
  date: entry.date ?? new Date().toISOString(),
  mood: entry.mood ?? 'good',
  tags: entry.tags ?? [],
  images: entry.images ?? [],
  pinned: entry.pinned ?? false,
  reflection: entry.reflection ?? { whatWentWell: '', whatCanBeBetter: '' },
  focusList: entry.focusList ?? [],
  attachments: entry.attachments ?? [],
  pageStyle: entry.pageStyle ?? 'default',
  location: entry.location ?? '',
  reminder: entry.reminder ?? '',
  stylePreset: entry.stylePreset ?? 'calm',
});
