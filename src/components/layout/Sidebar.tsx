import {
  IconBook2, IconLayout, IconNotebook,
  IconDeviceGamepad2, IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconClockPlay,
  IconChecklist, IconSitemap, IconDots,
  IconChevronLeft, IconChevronRight, IconChevronDown, IconLayoutGrid, IconPencil,
  IconFileText, IconFlame, IconShieldLock, IconBulb, IconBook,
  IconTag, IconChartBar, IconBrush, IconPlus, IconX,
  IconWriting, IconListCheck, IconTrendingUp, IconTool, IconRefresh, IconBrain
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { exportData, importData } from '../../utils/exportImport';
import { useToastStore } from '../../store/useToastStore';
import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AppLogo } from '../ui/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';

// ── Category groups ────────────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    id: 'create',
    label: 'Create & Write',
    emoji: '✍️',
    icon: IconWriting,
    color: '#8B5CF6',
    desc: 'Journals, notes, books and markdown.',
    items: [
      { id: 'journal',   label: 'Journal',          icon: IconBook2,         desc: 'Daily entries & reflections' },
      { id: 'books',     label: 'My Library',       icon: IconNotebook,      desc: 'Books, notebooks & reading' },
      { id: 'markdown',  label: 'Markdown Creator', icon: IconFileText,      desc: 'Rich markdown editor' },
      { id: 'til',       label: 'Today I Learned',  icon: IconBulb,          desc: 'Quick learnings log' },
      { id: 'snippets',  label: 'Snippets Vault',   icon: IconCode,          desc: 'Save & organise code snippets' },
    ],
  },
  {
    id: 'organise',
    label: 'Organise',
    emoji: '📋',
    icon: IconListCheck,
    color: '#059669',
    desc: 'Projects, habits and tags.',
    items: [
      { id: 'habits',    label: 'Habits',        icon: IconFlame,     desc: 'Daily habit streaks' },
      { id: 'tags',      label: 'Tag Manager',   icon: IconTag,       desc: 'Cross-module tag system' },
    ],
  },
  {
    id: 'track',
    label: 'Track',
    emoji: '📊',
    icon: IconTrendingUp,
    color: '#F59E0B',
    desc: 'Focus, study and finances.',
    items: [
      { id: 'pomodoro',  label: 'Pomodoro',         icon: IconClockPlay, desc: 'Focus timer & goals' },
      { id: 'study',     label: 'Study Tracker',    icon: IconBook,      desc: 'Session logs & streaks' },
      { id: 'exam',      label: 'AI Exam Prep',     icon: IconBrain,     desc: 'Generate & take AI exams' },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    emoji: '🛠️',
    icon: IconTool,
    color: '#3B82F6',
    desc: 'Canvas, diagrams, media and utilities.',
    items: [
      { id: 'mindmap',   label: 'Mindmap',               icon: IconSitemap,        desc: 'Visual mind maps' },
      { id: 'drawing',   label: 'Drawing',               icon: IconPencil,         desc: 'Freeform whiteboard' },
      { id: 'media',     label: 'Media Log',             icon: IconDeviceGamepad2, desc: 'Movies, games, shows' },
      { id: 'condition', label: 'Condition Workstation', icon: IconChartBar,       desc: 'Decision diagrams' },
      { id: 'utilities', label: 'Utilities',             icon: IconLayoutGrid,     desc: 'Calculators & tools' },
      { id: 'linksaver', label: 'Link Saver',            icon: IconBrush,          desc: 'Save links & clips' },
    ],
  },
];


// ── NAV item style (uses CSS vars, no broken Tailwind tokens) ──────────────────
const navItemStyle = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '9px 12px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  background: active ? 'var(--bg-surface-hover, rgba(255,255,255,0.06))' : 'transparent',
  color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
  fontWeight: active ? 700 : 500,
  fontSize: 13,
  textAlign: 'left' as const,
  width: '100%',
  transition: 'color 0.15s, background 0.15s',
  position: 'relative' as const,
  willChange: 'transform',
});

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { activeModule, setActiveModule, theme, setTheme, showConfirm, isSyncing, forceSync } = useAppStore(useShallow(state => ({
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
    theme: state.theme,
    setTheme: state.setTheme,
    showConfirm: state.showConfirm,
    isSyncing: state.isSyncing,
    forceSync: state.forceSync,
  })));
  const { user, signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  );

  // Track expanded categories (default all expanded for quick access)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach(g => {
      initial[g.id] = true;
    });
    return initial;
  });

  // Ensure category containing active module is expanded
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === activeModule));
    if (activeGroup) {
      setExpandedCategories(prev => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [activeModule]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  };

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => { await signOut(); });
  };

  const handleForceSync = async () => {
    if (!user) return;
    try {
      addToast('Syncing', 'Fetching latest data from Supabase...', 'success');
      await forceSync(user.id);
      addToast('Success', 'Data synced successfully!', 'success');
    } catch (e) {
      console.error('Sync failed:', e);
      addToast('Sync Failed', 'Could not sync data. Check connection.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(file,
        () => addToast('Success', 'Data imported successfully!', 'success'),
        (msg) => addToast('Import Failed', msg, 'error')
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';
  const userEmail = user?.email ?? 'User';
  const userName = user?.user_metadata?.full_name
    || (userEmail !== 'User' ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'User');

  const sidebarWidth = isCollapsed ? 72 : 250;

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: sidebarWidth,
        height: '100dvh',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-border)',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Header ── */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: isCollapsed ? '0 14px' : '0 16px', gap: 10, flexShrink: 0, justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--border-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              Personal HQ<span style={{ color: 'var(--color-primary)' }}>.</span>
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Collapse Sidebar"
            aria-expanded={true}
            className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shadow-sm"
          >
            <IconChevronLeft size={14} />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Expand Sidebar"
            aria-expanded={false}
            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border-border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <IconChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        style={{ flex: 1, padding: isCollapsed ? '10px 10px' : '10px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}
      >
        {/* Home – always pinned */}
        <motion.button
          id="tour-dashboard"
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModule('dashboard')}
          title={isCollapsed ? 'Home' : undefined}
          style={{ ...navItemStyle(activeModule === 'dashboard'), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          {activeModule === 'dashboard' && (
            <motion.div
              layoutId="sidebar-active-indicator"
              style={{ position: 'absolute', inset: 0, background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', borderRadius: 10, zIndex: 0, pointerEvents: 'none' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <IconLayout size={18} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
          {!isCollapsed && <span style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>Home</span>}
        </motion.button>

        {/* Section label */}
        {!isCollapsed && (
          <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)', padding: '10px 4px 4px', marginTop: 2 }}>
            Content
          </p>
        )}
        {isCollapsed && <div style={{ height: 8 }} />}

        {/* Category group rows with expandable down arrows */}
        {NAV_GROUPS.map(group => {
          const groupActive = group.items.some(i => i.id === activeModule);
          const isExpanded = !!expandedCategories[group.id];

          if (isCollapsed) {
            // Collapsed: show one category icon per group, clicking expands sidebar + opens group
            const CatIcon = group.icon;
            return (
              <motion.button
                key={group.id}
                whileTap={{ scale: 0.93 }}
                title={group.label}
                onClick={() => {
                  setIsCollapsed(false);
                  localStorage.setItem('sidebar_collapsed', 'false');
                  setExpandedCategories(prev => ({ ...prev, [group.id]: true }));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 40, margin: '0 auto', borderRadius: 10,
                  border: 'none',
                  background: groupActive
                    ? group.color + '18'
                    : 'transparent',
                  color: groupActive ? group.color : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <CatIcon size={19} />
              </motion.button>
            );
          }

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Category header with down arrow toggle */}
              <button
                onClick={() => toggleCategory(group.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: groupActive ? 'var(--bg-surface-hover, rgba(255,255,255,0.05))' : 'transparent',
                  color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13,
                  textAlign: 'left', width: '100%', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{group.emoji}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-surface-alt, rgba(255,255,255,0.04))' }}>
                  {group.items.length}
                </span>
                <IconChevronDown
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </button>

              {/* Inline expandable sub-list of pages */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        paddingLeft: 14,
                        margin: '2px 0 6px 14px',
                        borderLeft: '1.5px solid var(--border-border)',
                      }}
                    >
                      {group.items.map(item => {
                        const active = activeModule === item.id;
                        const ItemIcon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveModule(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: '7px 10px',
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              background: active ? 'var(--bg-surface-hover, rgba(255,255,255,0.08))' : 'transparent',
                              color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                              fontWeight: active ? 600 : 400,
                              fontSize: 12.5,
                              textAlign: 'left',
                              width: '100%',
                              transition: 'all 0.15s',
                              position: 'relative',
                            }}
                          >
                            {active && (
                              <motion.div
                                layoutId="sidebar-subitem-active"
                                style={{
                                  position: 'absolute',
                                  left: -15.5,
                                  width: 3,
                                  height: 16,
                                  borderRadius: 2,
                                  background: 'var(--color-primary)',
                                }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                              />
                            )}
                            <ItemIcon size={16} style={{ flexShrink: 0, color: active ? 'var(--color-primary)' : 'var(--text-muted)' }} />
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Planning Section */}
        {!isCollapsed && (
          <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)', padding: '10px 4px 4px', marginTop: 2 }}>
            Planning
          </p>
        )}
        {isCollapsed && <div style={{ height: 8 }} />}

        <motion.button
          id="tour-todo"
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveModule('todo')}
          title={isCollapsed ? 'Daily Planner' : undefined}
          style={{ ...navItemStyle(activeModule === 'todo'), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          {activeModule === 'todo' && (
            <motion.div
              layoutId="sidebar-active-indicator"
              style={{ position: 'absolute', inset: 0, background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', borderRadius: 10, zIndex: 0, pointerEvents: 'none' }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <IconChecklist size={18} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
          {!isCollapsed && <span style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>Daily Planner</span>}
        </motion.button>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-border)', margin: isCollapsed ? '8px auto' : '8px 4px', width: isCollapsed ? 36 : 'auto' }} />

        {/* Account Section */}
        {!isCollapsed && (
          <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-muted)', padding: '10px 4px 4px', marginTop: 2 }}>
            Account
          </p>
        )}
        {isCollapsed && <div style={{ height: 8 }} />}

        {/* Settings / Profile / Admin */}
        {[
          { id: 'settings', label: 'Settings', icon: IconSettings },
          { id: 'profile',  label: 'Profile',  icon: IconUser },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: IconShieldLock }] : []),
        ].map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button
              key={id}
              id={`tour-${id}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveModule(id)}
              title={isCollapsed ? label : undefined}
              style={{ ...navItemStyle(active), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  style={{ position: 'absolute', inset: 0, background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', borderRadius: 10, zIndex: 0, pointerEvents: 'none' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} style={{ flexShrink: 0, position: 'relative', zIndex: 1 }} />
              {!isCollapsed && <span style={{ position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>{label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--border-border)', padding: isCollapsed ? '12px 10px' : '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        {/* User row */}
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', marginBottom: 8 }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark/light theme"
              style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}
            >
              {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark/light theme"
            style={{ width: 40, height: 40, margin: '0 auto 6px', borderRadius: 10, border: '1px solid var(--border-border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>
        )}

        {/* Cmd+K hint */}
        {!isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', marginBottom: 4,
              borderRadius: 8, border: '1px solid var(--border-border)', background: 'var(--bg-surface-alt, rgba(255,255,255,0.02))',
              cursor: 'pointer', width: '100%', transition: 'background 0.15s',
            }}
          >
            <IconPlus size={13} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Quick-add anything</span>
            <kbd style={{ padding: '2px 5px', background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', border: '1px solid var(--border-border)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', borderRadius: 4, fontFamily: 'monospace' }}>⌘K</kbd>
          </button>
        )}

        {/* Sync / Export / Import / Logout */}
        {[
          {
            label: isSyncing ? 'Syncing...' : 'Sync Now',
            icon: IconRefresh,
            color: 'var(--text-secondary)',
            fw: 500,
            onClick: handleForceSync,
            disabled: isSyncing,
            iconClass: isSyncing ? 'animate-spin' : ''
          },
          { label: 'Export', icon: IconDownload, color: 'var(--text-secondary)', fw: 500,
            onClick: () => { const ok = exportData(); addToast(ok ? 'Success' : 'Export Failed', ok ? 'Data exported!' : 'Sign in first.', ok ? 'success' : 'error'); } },
          { label: 'Import', icon: IconUpload, color: 'var(--text-secondary)', fw: 500,
            onClick: () => fileInputRef.current?.click() },
          { label: 'Logout', icon: IconLogout, color: '#f43f5e', fw: 600,
            onClick: handleLogout },
        ].map(({ label, icon: Icon, color, fw, onClick, disabled, iconClass }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={isCollapsed ? label : undefined}
            className="sidebar-footer-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: isCollapsed ? '8px 0' : '8px 10px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              width: isCollapsed ? 40 : '100%', margin: isCollapsed ? '2px auto' : undefined,
              borderRadius: 8, border: 'none', background: 'transparent',
              color, fontSize: 13, fontWeight: fw, cursor: 'pointer',
              textAlign: 'left' as const,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Icon size={16} className={iconClass} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span className="sidebar-label">{label}</span>}
          </button>
        ))}
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/json" onChange={handleFileChange} />
      </div>
    </aside>
  );
};

// ── Mobile Bottom Nav ──────────────────────────────────────────────────────────
export const MobileBottomNav = () => {
  const { activeModule, setActiveModule } = useAppStore(useShallow(state => ({
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
  })));
  const { user } = useAuthStore();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';

  const PINNED = [
    { id: 'dashboard', label: 'Home',    icon: IconLayout },
    { id: 'journal',   label: 'Journal', icon: IconBook2 },
    { id: 'todo',      label: 'Planner', icon: IconChecklist },
    { id: 'habits',    label: 'Habits',  icon: IconFlame },
  ];

  return (
    <>
      {isMoreOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setIsMoreOpen(false)}
        />
      )}

      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{
              position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 50,
              background: 'var(--bg-surface)', padding: 16, borderRadius: 20,
              border: '1px solid var(--border-border)', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
              maxHeight: '62vh', overflowY: 'auto', willChange: 'transform, opacity',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>All Modules</p>
              <button onClick={() => setIsMoreOpen(false)} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <IconX size={14} />
              </button>
            </div>
            {NAV_GROUPS.map(group => (
              <div key={group.id} style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, color: group.color }}>
                  <span>{group.emoji}</span> {group.label}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {group.items.filter(i => i.id !== 'admin' || isAdmin).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => { setActiveModule(id); setIsMoreOpen(false); }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', color: activeModule === id ? group.color : 'var(--text-primary)' }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: activeModule === id ? group.color + '18' : 'var(--bg-surface-alt, rgba(255,255,255,0.04))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={21} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mobile-bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', borderTop: '1px solid var(--border-border)', display: 'none', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px env(safe-area-inset-bottom, 8px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
        {PINNED.map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button key={id} onClick={() => { setActiveModule(id); setIsMoreOpen(false); }} whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: active ? 'var(--color-primary)' : 'var(--text-muted)', minWidth: 48, position: 'relative' }}>
              {active && (
                <motion.div layoutId="mobile-nav-pill" style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 2, background: 'var(--color-primary)', borderRadius: 2 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <Icon size={22} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
            </motion.button>
          );
        })}
        <motion.button
          onClick={() => setIsMoreOpen(!isMoreOpen)}
          whileTap={{ scale: 0.9 }}
          aria-haspopup="true"
          aria-expanded={isMoreOpen}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: isMoreOpen ? 'var(--color-primary)' : 'var(--text-muted)', minWidth: 48 }}
        >
          <IconDots size={22} />
          <span style={{ fontSize: 10, fontWeight: isMoreOpen ? 700 : 500 }}>More</span>
        </motion.button>
      </nav>
    </>
  );
};
