import { type JournalEntry } from '../../store/types';

export type EntryMood = JournalEntry['mood'];
export type EntryPageStyle = JournalEntry['pageStyle'];
export type EntryStylePreset = JournalEntry['stylePreset'];

export const STYLE_PRESETS: Array<{
  id: EntryStylePreset;
  label: string;
  caption: string;
  accent: string;
  glow: string;
  surface: string;
  paperBg: string;
}> = [
  {
    id: 'calm',
    label: 'Calm',
    caption: 'Soft neutral paper',
    accent: '#fb7185',
    glow: 'rgba(251, 113, 133, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 247, 248, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#fffbfb',
  },
  {
    id: 'warm',
    label: 'Warm',
    caption: 'Amber note card',
    accent: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.16)',
    surface: 'linear-gradient(135deg, rgba(255, 250, 242, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#fffdf8',
  },
  {
    id: 'evergreen',
    label: 'Evergreen',
    caption: 'Quiet editorial green',
    accent: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.16)',
    surface: 'linear-gradient(135deg, rgba(244, 250, 245, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#f8fdf9',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    caption: 'Cool glass paper',
    accent: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.16)',
    surface: 'linear-gradient(135deg, rgba(243, 248, 255, 0.95), rgba(255, 255, 255, 0.98))',
    paperBg: '#f6fafe',
  },
];

export const MOOD_OPTIONS: Array<{ value: EntryMood; label: string }> = [
  { value: 'great', label: 'Great' },
  { value: 'good', label: 'Good' },
  { value: 'meh', label: 'Meh' },
  { value: 'bad', label: 'Bad' },
  { value: 'terrible', label: 'Terrible' },
];

export const PAGE_STYLE_OPTIONS: Array<{ value: EntryPageStyle; label: string }> = [
  { value: 'default', label: 'Default' },
  { value: 'lines', label: 'Lines' },
  { value: 'dotted', label: 'Dotted' },
  { value: 'grid', label: 'Grid' },
  { value: 'cornell', label: 'Cornell' },
];

export const buildBlankEntry = (title = 'New Journal Entry'): JournalEntry => ({
  id: crypto.randomUUID(),
  title,
  content: '',
  date: new Date().toISOString(),
  mood: 'good',
  tags: [],
  images: [],
  pinned: false,
  reflection: { whatWentWell: '', whatCanBeBetter: '' },
  focusList: [],
  attachments: [],
  pageStyle: 'default',
  location: '',
  reminder: '',
  stylePreset: 'calm',
});

export const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const wordCount = (value: string) => {
  const cleaned = stripHtml(value);
  return cleaned ? cleaned.split(' ').length : 0;
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const isDirty = (entry: JournalEntry | null, state: Record<string, unknown>) => {
  if (!entry) return false;
  return (
    entry.title !== state.title ||
    entry.content !== state.content ||
    entry.mood !== state.mood ||
    JSON.stringify(entry.tags) !== JSON.stringify(state.tags) ||
    entry.pageStyle !== state.pageStyle ||
    entry.location !== state.location ||
    entry.reminder !== state.reminder ||
    entry.stylePreset !== state.stylePreset ||
    JSON.stringify(entry.focusList) !== JSON.stringify(state.focusList)
  );
};

export const exportJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};
