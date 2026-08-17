import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX,
  IconRefresh,
  IconSun,
  IconMoon,
  IconDownload,
  IconUpload,
  IconLogout,
  IconSearch,
  IconBrain,
  IconChevronRight,
  IconListCheck,
  IconCalendar,
  IconBook2,
  IconNotebook,
  IconFileText,
  IconBulb,
  IconCode,
  IconFlame,
  IconTag,
  IconClockPlay,
  IconTarget,
  IconSitemap,
  IconPencil,
  IconDeviceGamepad2,
  IconChartBar,
  IconLayoutGrid,
  IconLink,
  IconUser,
  IconSettings,
  IconRocket,
  IconShieldLock,
  IconBug,
  IconFolders,
} from '@tabler/icons-react';
import { AppLogo } from '../ui/AppLogo';
import { useAppStore } from '../../store/useAppStore';
import { useBugReportStore } from '../../store/useBugReportStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { exportData, importData } from '../../utils/exportImport';
import { useShallow } from 'zustand/react/shallow';

interface MobileSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAi: (actionType?: string) => void;
}

const NAV_GROUPS = [
  {
    id: 'create',
    label: 'Create & Write',
    emoji: '✍️',
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
    label: 'Organise & Plan',
    emoji: '📋',
    items: [
      { id: 'todo', label: 'Daily Planner', icon: IconListCheck, desc: 'Hourly planner & tasks' },
      { id: 'calendar', label: 'Monthly Calendar', icon: IconCalendar, desc: 'Events, deadlines & schedule' },
      { id: 'habits', label: 'Habits', icon: IconFlame, desc: 'Daily habit streaks' },
      { id: 'tags', label: 'Tag Manager', icon: IconTag, desc: 'Cross-module tag system' },
    ],
  },
  {
    id: 'track',
    label: 'Track',
    emoji: '📊',
    items: [
      { id: 'pomodoro', label: 'Pomodoro', icon: IconClockPlay, desc: 'Focus timer & goals' },
      { id: 'vision', label: 'Vision Board', icon: IconTarget, desc: 'Map your aspirations' },
      { id: 'exam', label: 'AI Exam Prep', icon: IconBrain, desc: 'Generate & take AI exams' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Canvas',
    emoji: '🛠️',
    items: [
      { id: 'structure', label: 'Project Architect', icon: IconFolders, desc: 'Project structure & CLI maintainer' },
      { id: 'mindmap', label: 'Mindmap', icon: IconSitemap, desc: 'Visual mind maps' },
      { id: 'drawing', label: 'Drawing', icon: IconPencil, desc: 'Freeform whiteboard' },
      { id: 'media', label: 'Media Log', icon: IconDeviceGamepad2, desc: 'Movies, games, shows' },
      { id: 'condition', label: 'Condition Workstation', icon: IconChartBar, desc: 'Decision diagrams' },
      { id: 'utilities', label: 'Utilities', icon: IconLayoutGrid, desc: 'Calculators & tools' },
      { id: 'linksaver', label: 'Link Vault', icon: IconLink, desc: 'Save & organize links' },
    ],
  },
  {
    id: 'account',
    label: 'Account & Settings',
    emoji: '⚙️',
    items: [
      { id: 'profile', label: 'Profile', icon: IconUser, desc: 'User profile & streaks' },
      { id: 'settings', label: 'Settings', icon: IconSettings, desc: 'Gemini API key, theme & preferences' },
      { id: 'changelog', label: "What's New", icon: IconRocket, desc: 'Release notes & changelog' },
      { id: 'admin', label: 'Admin Dashboard', icon: IconShieldLock, desc: 'System management & analytics', adminOnly: true },
    ],
  },
];

export const MobileSlideDrawer: React.FC<MobileSlideDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAi,
}) => {
  const { activeModule, setActiveModule, theme, setTheme, isSyncing, forceSync } = useAppStore(
    useShallow((state) => ({
      activeModule: state.activeModule,
      setActiveModule: state.setActiveModule,
      theme: state.theme,
      setTheme: state.setTheme,
      isSyncing: state.isSyncing,
      forceSync: state.forceSync,
    }))
  );
  const { user, signOut } = useAuthStore();
  const showConfirm = useAppStore((state) => state.showConfirm);
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => {
      await signOut();
      onClose();
    });
  };

  const handleForceSync = async () => {
    if (!user?.id) {
      addToast('Sync Info', 'Sign in to sync your data to cloud.', 'info');
      return;
    }
    try {
      await forceSync(user.id);
      addToast('Synced', 'All workspaces synced with cloud.', 'success');
    } catch (err: any) {
      addToast('Sync Error', err?.message || 'Failed to sync.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(
      file,
      () => addToast('Success', 'Data imported successfully!', 'success'),
      (errMsg) => addToast('Import Failed', errMsg || 'Could not read import file.', 'error')
    );
  };

  const aiShortcuts = [
    { id: 'add_task', label: '➕ Add Plan' },
    { id: 'breakdown', label: '🎯 Break Down Goal' },
    { id: 'goal', label: '📊 Weekly Review' },
    { id: 'suggest', label: '💡 Priorities' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md md:hidden"
          />

          {/* Left Slide Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="fixed top-0 bottom-0 left-0 w-[85%] max-w-[340px] z-50 bg-surface border-r border-border shadow-2xl flex flex-col md:hidden text-text-primary overflow-hidden"
          >
            {/* Header / Profile Card */}
            <div className="p-5 border-b border-border bg-surface-alt/40 shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AppLogo className="w-10 h-10 rounded-2xl shadow-sm" />
                  <div>
                    <h2 className="font-black text-[16px] tracking-tight leading-none text-text-primary">
                      Personal HQ
                    </h2>
                    <span className="text-[11px] text-text-tertiary font-bold truncate max-w-[180px] block mt-1">
                      {user?.email || 'Offline Workspace'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-surface text-text-secondary hover:text-text-primary border border-border/50 flex items-center justify-center cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              {/* Sync Status & Theme Switcher Strip */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  <IconRefresh size={14} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                </button>

                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Nav Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5 pb-20">
              {/* ── AI Assistant Hub Banner ── */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600/15 via-indigo-600/10 to-pink-500/15 border border-purple-500/30 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-[13px]">
                    <IconBrain size={17} />
                    <span>Gemini AI Workspace</span>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onOpenAi();
                    }}
                    className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-transform cursor-pointer"
                  >
                    Ask AI
                  </button>
                </div>

                <p className="text-[11.5px] text-text-secondary font-medium leading-relaxed">
                  Break down goals, auto-generate schedules, and brainstorm ideas.
                </p>

                {/* Quick AI Shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  {aiShortcuts.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => {
                        onClose();
                        onOpenAi(sc.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-surface/90 hover:bg-surface border border-purple-500/20 text-[10.5px] font-bold text-text-primary transition-colors cursor-pointer"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Search Input ── */}
              <div className="relative">
                <IconSearch
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all workspaces & settings..."
                  className="w-full pl-9 pr-3 py-2 text-[12.5px] font-medium bg-surface-alt border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
              </div>

              {/* ── Categorized Workspaces List ── */}
              <div className="space-y-4">
                {NAV_GROUPS.map((group) => {
                  const visible = group.items.filter((i: any) => {
                    if (i.adminOnly && !isAdmin) return false;
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      i.label.toLowerCase().includes(q) ||
                      i.desc.toLowerCase().includes(q)
                    );
                  });

                  if (visible.length === 0) return null;

                  return (
                    <div key={group.id} className="space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-text-tertiary px-1 flex items-center gap-1.5">
                        <span>{group.emoji}</span>
                        <span>{group.label}</span>
                      </p>

                      <div className="space-y-1">
                        {visible.map(({ id, label, desc, icon: Icon }) => {
                          const isActive = activeModule === id;
                          return (
                            <button
                              key={id}
                              onClick={() => {
                                setActiveModule(id);
                                onClose();
                              }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-primary text-text-on-accent shadow-sm'
                                  : 'bg-surface-alt/50 hover:bg-surface text-text-secondary hover:text-text-primary border border-border-hairline'
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isActive ? 'bg-white/20 text-white' : 'text-text-primary'
                                }`}
                              >
                                <Icon size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4
                                  className={`text-[13px] font-extrabold truncate ${
                                    isActive ? 'text-white' : 'text-text-primary'
                                  }`}
                                >
                                  {label}
                                </h4>
                                <p
                                  className={`text-[10.5px] truncate ${
                                    isActive ? 'text-white/80' : 'text-text-tertiary'
                                  }`}
                                >
                                  {desc}
                                </p>
                              </div>
                              <IconChevronRight
                                size={14}
                                className={`shrink-0 ${
                                  isActive ? 'text-white/80' : 'text-text-tertiary'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Footer Data & Account Controls ── */}
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    useBugReportStore.getState().startInspection();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[12px] font-bold cursor-pointer transition-colors"
                >
                  <IconBug size={16} />
                  <span>Report Bug / Visual Feedback</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const ok = exportData();
                      addToast(ok ? 'Success' : 'Export Failed', ok ? 'Data exported!' : 'Sign in first.', ok ? 'success' : 'error');
                    }}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-surface-alt border border-border text-[11px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    <IconDownload size={14} />
                    <span>Backup</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-surface-alt border border-border text-[11px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    <IconUpload size={14} />
                    <span>Restore</span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-[11px] font-bold cursor-pointer"
                >
                  <IconLogout size={14} />
                  <span>Sign Out</span>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="application/json"
                onChange={handleFileChange}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
