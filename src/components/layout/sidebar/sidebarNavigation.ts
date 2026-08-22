import React from 'react';
import {
  IconBook2,
  IconNotebook,
  IconDeviceGamepad2,
  IconCode,
  IconClockPlay,
  IconSitemap,
  IconLayoutGrid,
  IconPencil,
  IconFileText,
  IconFlame,
  IconBulb,
  IconTag,
  IconChartBar,
  IconLink,
  IconWriting,
  IconListCheck,
  IconTrendingUp,
  IconTool,
  IconBrain,
  IconTarget,
  IconFolders,
} from '@tabler/icons-react';

export interface NavSubItem {
  id: string;
  label: string;
  icon: any;
  desc: string;
}

export interface NavGroup {
  id: string;
  label: string;
  emoji: string;
  icon: any;
  color: string;
  desc: string;
  items: NavSubItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'create',
    label: 'Create & Write',
    emoji: '✍️',
    icon: IconWriting,
    color: 'var(--text-primary)',
    desc: 'Journals, notes, books and markdown.',
    items: [
      { id: 'journal', label: 'Journal', icon: IconBook2, desc: 'Daily entries & reflections' },
      { id: 'books', label: 'My Library', icon: IconNotebook, desc: 'Books, notebooks & reading' },
      { id: 'markdown', label: 'Markdown Creator', icon: IconFileText, desc: 'Rich markdown editor' },
      { id: 'til', label: 'Today I Learned', icon: IconBulb, desc: 'Quick learnings log' },
      { id: 'snippets', label: 'Snippets Vault', icon: IconCode, desc: 'Save & organise code snippets' },
    ],
  },
  {
    id: 'organise',
    label: 'Organise',
    emoji: '📋',
    icon: IconListCheck,
    color: 'var(--text-primary)',
    desc: 'Projects, habits and tags.',
    items: [
      { id: 'habits', label: 'Habits', icon: IconFlame, desc: 'Daily habit streaks' },
      { id: 'tags', label: 'Tag Manager', icon: IconTag, desc: 'Cross-module tag system' },
    ],
  },
  {
    id: 'track',
    label: 'Track',
    emoji: '📊',
    icon: IconTrendingUp,
    color: 'var(--text-primary)',
    desc: 'Focus, study and finances.',
    items: [
      { id: 'pomodoro', label: 'Pomodoro', icon: IconClockPlay, desc: 'Focus timer & goals' },
      { id: 'vision', label: 'Vision Board', icon: IconTarget, desc: 'Map your aspirations' },
      { id: 'exam', label: 'AI Exam Prep', icon: IconBrain, desc: 'Generate & take AI exams' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    emoji: '🛠️',
    icon: IconTool,
    color: 'var(--text-primary)',
    desc: 'Canvas, diagrams, media and utilities.',
    items: [
      { id: 'structure', label: 'Project Architect', icon: IconFolders, desc: 'Project structure maintainer' },
      { id: 'mindmap', label: 'Mindmap', icon: IconSitemap, desc: 'Visual mind maps' },
      { id: 'drawing', label: 'Drawing', icon: IconPencil, desc: 'Freeform whiteboard' },
      { id: 'media', label: 'Media Log', icon: IconDeviceGamepad2, desc: 'Movies, games, shows' },
      { id: 'condition', label: 'Condition Workstation', icon: IconChartBar, desc: 'Decision diagrams' },
      { id: 'utilities', label: 'Utilities', icon: IconLayoutGrid, desc: 'Calculators & tools' },
      { id: 'linksaver', label: 'Link Vault', icon: IconLink, desc: 'Save & organize links' },
    ],
  },
];

export const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '8px 12px',
  borderRadius: 12,
  border: 'none',
  cursor: 'pointer',
  background: active ? 'var(--bg-surface-alt)' : 'transparent',
  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
  fontWeight: active ? 600 : 400,
  fontSize: 13,
  textAlign: 'left' as const,
  width: '100%',
  transition: 'all 0.15s ease',
  position: 'relative' as const,
});
