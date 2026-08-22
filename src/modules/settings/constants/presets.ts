import type { AccentColor } from '../../../store/useAppStore';

export const COUNTDOWN_TEMPLATES = [
  { value: 'default', label: 'Default Cards' },
  { value: 'minimal', label: 'Minimal Text' },
  { value: 'gradient', label: 'Gradient Vibe' },
  { value: 'circle', label: 'Circular Progress' },
  { value: 'event', label: 'Event Celebration' },
  { value: 'sale', label: 'Flash Sale' },
  { value: 'dark', label: 'Dark Mode' },
  { value: 'compact', label: 'Compact Row' },
  { value: 'flip', label: 'Mechanical Flip' },
  { value: 'progress', label: 'Progress Ring' },
  { value: 'vertical', label: 'Vertical Stack' },
  { value: 'split', label: 'Split Layout' },
];

export const TOAST_POSITIONS = [
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
];

export const ACCENT_COLORS: { name: AccentColor; hex: string }[] = [
  { name: 'rose', hex: '#f43f5e' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#34c759' },
  { name: 'amber', hex: '#f59e0b' },
  { name: 'teal', hex: '#06b6d4' },
  { name: 'gray', hex: '#8e8e93' },
];

export const THEMES = [
  {
    value: 'light',
    label: 'Light Mode',
    color1: '#ffffff',
    color2: '#f2f2f7',
    accent: '#f43f5e',
    desc: 'Clean and bright aesthetic',
  },
  {
    value: 'dark',
    label: 'Dark Mode',
    color1: '#000000',
    color2: '#1c1c1e',
    accent: '#f43f5e',
    desc: 'Classic sleek dark theme',
  },
  {
    value: 'system',
    label: 'System Default',
    color1: '#f2f2f7',
    color2: '#000000',
    accent: '#8e8e93',
    desc: 'Syncs with your OS theme',
  },
  {
    value: 'cyberpunk',
    label: 'Cyberpunk Neon',
    color1: '#06060c',
    color2: '#0e0f1d',
    accent: '#ff007f',
    desc: 'Vibrant neon hot-pink tones',
  },
  {
    value: 'nordic',
    label: 'Nordic Forest',
    color1: '#1b2421',
    color2: '#222f2b',
    accent: '#a3b899',
    desc: 'Calm evergreen and moss',
  },
  {
    value: 'sakura',
    label: 'Sakura Blossom',
    color1: '#fff0f5',
    color2: '#fff9fb',
    accent: '#db7093',
    desc: 'Soft pink cherry blossoms',
  },
  {
    value: 'auraglass',
    label: 'Aura Glass',
    color1: '#0f0724',
    color2: '#160c30',
    accent: '#a78bfa',
    desc: 'Translucent indigo glass',
  },
];
