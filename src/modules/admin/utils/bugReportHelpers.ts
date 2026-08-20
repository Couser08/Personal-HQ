import { type BugReportCategory, type BugReportSeverity, type BugReportStatus } from '../../../store/types';

export interface RouteMeta {
  label: string;
  icon: string;
  color: string;
  categoryGroup: string;
}

export const ROUTE_METADATA: Record<string, RouteMeta> = {
  dashboard: { label: 'Dashboard', icon: '🏠', color: 'from-blue-500/20 to-indigo-500/20 text-blue-500', categoryGroup: 'Core' },
  journal: { label: 'Journal', icon: '📔', color: 'from-amber-500/20 to-orange-500/20 text-amber-500', categoryGroup: 'Productivity' },
  books: { label: 'Notebooks', icon: '📚', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500', categoryGroup: 'Productivity' },
  mindmap: { label: 'Mindmap', icon: '🗺️', color: 'from-purple-500/20 to-violet-500/20 text-purple-500', categoryGroup: 'Creativity' },
  vision: { label: 'Vision Canvas', icon: '🎯', color: 'from-rose-500/20 to-pink-500/20 text-rose-500', categoryGroup: 'Creativity' },
  markdown: { label: 'Markdown Docs', icon: '📝', color: 'from-sky-500/20 to-blue-500/20 text-sky-500', categoryGroup: 'Productivity' },
  drawing: { label: 'Whiteboard', icon: '🎨', color: 'from-fuchsia-500/20 to-pink-500/20 text-fuchsia-500', categoryGroup: 'Creativity' },
  habits: { label: 'Habit Tracker', icon: '🔥', color: 'from-red-500/20 to-orange-500/20 text-red-500', categoryGroup: 'Personal' },
  pomodoro: { label: 'Pomodoro', icon: '⏱️', color: 'from-red-500/20 to-rose-500/20 text-red-500', categoryGroup: 'Productivity' },
  exam: { label: 'Study & Exams', icon: '🎓', color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-500', categoryGroup: 'Learning' },
  finance: { label: 'Finance & Budget', icon: '💳', color: 'from-emerald-500/20 to-green-500/20 text-emerald-500', categoryGroup: 'Personal' },
  calendar: { label: 'Calendar', icon: '📅', color: 'from-blue-500/20 to-cyan-500/20 text-blue-500', categoryGroup: 'Personal' },
  links: { label: 'Link Vault', icon: '🔗', color: 'from-teal-500/20 to-cyan-500/20 text-teal-500', categoryGroup: 'Tools' },
  snippets: { label: 'Code Snippets', icon: '💻', color: 'from-violet-500/20 to-indigo-500/20 text-violet-500', categoryGroup: 'Dev Tools' },
  dsa: { label: 'DSA Sheet', icon: '⚡', color: 'from-yellow-500/20 to-amber-500/20 text-amber-500', categoryGroup: 'Learning' },
  til: { label: 'Today I Learned', icon: '💡', color: 'from-amber-500/20 to-yellow-500/20 text-amber-500', categoryGroup: 'Learning' },
  condition: { label: 'Conditions / Logic', icon: '🔀', color: 'from-slate-500/20 to-zinc-500/20 text-slate-500', categoryGroup: 'Dev Tools' },
  changelog: { label: 'Changelog', icon: '🚀', color: 'from-cyan-500/20 to-blue-500/20 text-cyan-500', categoryGroup: 'Core' },
  profile: { label: 'Profile & Auth', icon: '👤', color: 'from-rose-500/20 to-orange-500/20 text-rose-500', categoryGroup: 'Core' },
  settings: { label: 'System Settings', icon: '⚙️', color: 'from-slate-500/20 to-zinc-500/20 text-slate-400', categoryGroup: 'Core' },
  admin: { label: 'Admin Panel', icon: '🛡️', color: 'from-red-500/20 to-rose-500/20 text-rose-500', categoryGroup: 'Admin' },
};

export function getRouteMeta(route: string): RouteMeta {
  const clean = (route || 'dashboard').replace(/^\//, '').toLowerCase();
  return ROUTE_METADATA[clean] || {
    label: clean ? `/${clean}` : 'App Workspace',
    icon: '🧭',
    color: 'from-surface-alt to-surface text-text-secondary',
    categoryGroup: 'General',
  };
}

export const getRouteMetadata = getRouteMeta;

export function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export function parseUserAgent(ua?: string): { os: string; browser: string; isMobile: boolean } {
  if (!ua) return { os: 'Desktop OS', browser: 'Browser', isMobile: false };

  let os = 'Desktop OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Web Browser';
  if (/Chrome|CriOS/i.test(ua) && !/Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox|FxiOS/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(ua);

  return { os, browser, isMobile };
}

export interface SeverityStyle {
  label: string;
  pillClass: string;
  dotClass: string;
  borderClass: string;
  bgGlow: string;
  icon: string;
}

export const SEVERITY_CONFIG: Record<BugReportSeverity, SeverityStyle> = {
  Critical: {
    label: 'Critical',
    pillClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    dotClass: 'bg-rose-500 animate-pulse',
    borderClass: 'border-rose-500/40',
    bgGlow: 'from-rose-500/10 via-transparent to-transparent',
    icon: '🔥',
  },
  High: {
    label: 'High',
    pillClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    dotClass: 'bg-amber-500',
    borderClass: 'border-amber-500/30',
    bgGlow: 'from-amber-500/10 via-transparent to-transparent',
    icon: '⚠️',
  },
  Medium: {
    label: 'Medium',
    pillClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    dotClass: 'bg-blue-500',
    borderClass: 'border-blue-500/30',
    bgGlow: 'from-blue-500/10 via-transparent to-transparent',
    icon: '⚡',
  },
  Low: {
    label: 'Low',
    pillClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    borderClass: 'border-emerald-500/30',
    bgGlow: 'from-emerald-500/10 via-transparent to-transparent',
    icon: '🟢',
  },
};

export interface StatusStyle {
  label: string;
  pillClass: string;
  dotClass: string;
  badgeClass: string;
  icon: string;
}

export const STATUS_CONFIG: Record<string, StatusStyle> = {
  open: {
    label: 'Open',
    pillClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25',
    dotClass: 'bg-amber-500 animate-ping',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    icon: '🟡',
  },
  Open: {
    label: 'Open',
    pillClass: 'bg-amber-500/15 text-amber-500 border-amber-500/30 hover:bg-amber-500/25',
    dotClass: 'bg-amber-500 animate-ping',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    icon: '🟡',
  },
  in_review: {
    label: 'In Review',
    pillClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/25',
    dotClass: 'bg-blue-500 animate-pulse',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    icon: '🔵',
  },
  'In Progress': {
    label: 'In Review',
    pillClass: 'bg-blue-500/15 text-blue-500 border-blue-500/30 hover:bg-blue-500/25',
    dotClass: 'bg-blue-500 animate-pulse',
    badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    icon: '🔵',
  },
  fixed_pending_verification: {
    label: 'Fixed · Verify QA',
    pillClass: 'bg-purple-500/15 text-purple-500 border-purple-500/30 hover:bg-purple-500/25',
    dotClass: 'bg-purple-500 animate-pulse',
    badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    icon: '🟣',
  },
  verified_done: {
    label: 'Verified & Done',
    pillClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    icon: '🟢',
  },
  Resolved: {
    label: 'Verified & Done',
    pillClass: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    icon: '🟢',
  },
  Closed: {
    label: 'Closed',
    pillClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30 hover:bg-slate-500/25',
    dotClass: 'bg-slate-400',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    icon: '⚪',
  },
  reopened: {
    label: 'Reopened',
    pillClass: 'bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500/25',
    dotClass: 'bg-rose-500 animate-pulse',
    badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/30',
    icon: '🔴',
  },
};

export function getStatusStyle(status: BugReportStatus): StatusStyle {
  return STATUS_CONFIG[status] || STATUS_CONFIG.open;
}

export function getSeverityStyle(severity: BugReportSeverity): SeverityStyle {
  return SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.Medium;
}

export function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category as BugReportCategory] || '🐞';
}

export function isBugResolved(status: BugReportStatus): boolean {
  return status === 'verified_done' || status === 'fixed_pending_verification';
}

export const CATEGORY_ICONS: Record<BugReportCategory, string> = {
  'UI Glitch': '🎨',
  'Performance': '⚡',
  'Data Sync': '🔄',
  'Crash / Error': '💥',
  'Other': '📋',
};

export const LIFECYCLE_STATUSES: BugReportStatus[] = [
  'open',
  'in_review',
  'fixed_pending_verification',
  'verified_done',
  'reopened',
];
