import {
  IconBook2, IconLayout, IconNotebook,
  IconDeviceGamepad2, IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconClockPlay,
  IconChecklist, IconSitemap,
  IconChevronLeft, IconChevronRight, IconChevronDown, IconLayoutGrid, IconPencil,
  IconFileText, IconFlame, IconShieldLock, IconBulb,
  IconTag, IconChartBar, IconLink, IconPlus, IconCalendar,
  IconWriting, IconListCheck, IconTrendingUp, IconTool, IconRefresh, IconBrain, IconRocket, IconTarget,
  IconFolders
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
    color: 'var(--text-primary)',
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
    color: 'var(--text-primary)',
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
    color: 'var(--text-primary)',
    desc: 'Focus, study and finances.',
    items: [
      { id: 'pomodoro',  label: 'Pomodoro',         icon: IconClockPlay, desc: 'Focus timer & goals' },
      { id: 'vision',    label: 'Vision Board',     icon: IconTarget,    desc: 'Map your aspirations' },
      { id: 'exam',      label: 'AI Exam Prep',     icon: IconBrain,     desc: 'Generate & take AI exams' },
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
      { id: 'structure', label: 'Project Architect',     icon: IconFolders,        desc: 'Project structure maintainer' },
      { id: 'mindmap',   label: 'Mindmap',               icon: IconSitemap,        desc: 'Visual mind maps' },
      { id: 'drawing',   label: 'Drawing',               icon: IconPencil,         desc: 'Freeform whiteboard' },
      { id: 'media',     label: 'Media Log',             icon: IconDeviceGamepad2, desc: 'Movies, games, shows' },
      { id: 'condition', label: 'Condition Workstation', icon: IconChartBar,       desc: 'Decision diagrams' },
      { id: 'utilities', label: 'Utilities',             icon: IconLayoutGrid,     desc: 'Calculators & tools' },
      { id: 'linksaver', label: 'Link Vault',            icon: IconLink,           desc: 'Save & organize links' },
    ],
  },
];

// ── NAV item style (Minimal-Premium clean state) ────────────────────────────────
const navItemStyle = (active: boolean): React.CSSProperties => ({
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
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

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

  const sidebarWidth = isCollapsed ? 68 : 240;

  return (
    <aside
      data-component="Sidebar"
      className="sidebar-desktop select-none"
      style={{
        width: sidebarWidth,
        height: '100dvh',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-hairline)',
        transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* ── Header ── */}
      <div style={{ height: 60, display: 'flex', alignItems: 'center', padding: isCollapsed ? '0 12px' : '0 16px', gap: 10, flexShrink: 0, justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--border-hairline)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo className="w-7 h-7 shrink-0" />
          {!isCollapsed && (
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Personal HQ
            </span>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Collapse Sidebar"
            aria-expanded={true}
            data-bug-target="sidebar-toggle-btn"
            className="w-6 h-6 rounded-md hover:bg-surface-alt text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
          >
            <IconChevronLeft size={14} />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            aria-label="Expand Sidebar"
            aria-expanded={false}
            data-bug-target="sidebar-toggle-btn"
            className="w-6 h-6 rounded-md hover:bg-surface-alt text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
          >
            <IconChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Nav List ── */}
      <nav
        style={{ flex: 1, padding: isCollapsed ? '12px 8px' : '12px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}
        className="scrollbar-none"
      >
        {/* Home – always pinned */}
        <motion.button
          id="tour-dashboard"
          data-bug-target="nav-item-dashboard"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule('dashboard')}
          title={isCollapsed ? 'Home' : undefined}
          style={{ ...navItemStyle(activeModule === 'dashboard'), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <IconLayout size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Home</span>}
        </motion.button>

        {/* Category Header Label */}
        {!isCollapsed && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary px-3 pt-3 pb-1">
            Workspaces
          </p>
        )}
        {isCollapsed && <div style={{ height: 6 }} />}

        {/* Category groups */}
        {NAV_GROUPS.map(group => {
          const groupActive = group.items.some(i => i.id === activeModule);
          const isExpanded = !!expandedCategories[group.id];

          if (isCollapsed) {
            const CatIcon = group.icon;
            const isHovered = hoveredGroupId === group.id;

            return (
              <div 
                key={group.id} 
                className="relative"
                onMouseEnter={() => setHoveredGroupId(group.id)}
                onMouseLeave={() => setHoveredGroupId(null)}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  title={group.label}
                  onClick={() => {
                    const firstItem = group.items[0];
                    if (firstItem) setActiveModule(firstItem.id);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 38, height: 38, margin: '0 auto', borderRadius: 10,
                    border: 'none',
                    background: groupActive ? 'var(--bg-surface-alt)' : 'transparent',
                    color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <CatIcon size={18} />
                </motion.button>

                {/* Hover Flyout Submenu */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: 6, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 4, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        left: '100%',
                        top: 0,
                        marginLeft: 8,
                        zIndex: 999,
                        background: 'var(--bg-surface)',
                        boxShadow: 'var(--shadow-float)',
                        borderRadius: 16,
                        padding: '6px',
                        width: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border-hairline)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{group.emoji}</span> {group.label}
                        </span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)' }}>{group.items.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 }}>
                        {group.items.map(item => {
                          const ItemIcon = item.icon;
                          const isActive = activeModule === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveModule(item.id);
                                setHoveredGroupId(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 8px',
                                borderRadius: 8,
                                border: 'none',
                                background: isActive ? 'var(--bg-surface-alt)' : 'transparent',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 600 : 400,
                                fontSize: 12,
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%',
                                transition: 'all 0.12s ease',
                              }}
                            >
                              <ItemIcon size={14} style={{ flexShrink: 0 }} />
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(group.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: groupActive ? 'var(--bg-surface-alt)' : 'transparent',
                  color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 12.5,
                  textAlign: 'left', width: '100%', transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{group.emoji}</span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.label}</span>
                <IconChevronDown
                  size={13}
                  style={{
                    color: 'var(--text-tertiary)',
                    flexShrink: 0,
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </button>

              {/* Sub items */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        paddingLeft: 12,
                        margin: '2px 0 4px 12px',
                        borderLeft: '1px solid var(--border-hairline)',
                      }}
                    >
                      {group.items.map(item => {
                        const active = activeModule === item.id;
                        const ItemIcon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            data-bug-target={`nav-item-${item.id}`}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveModule(item.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 8px',
                              borderRadius: 8,
                              border: 'none',
                              cursor: 'pointer',
                              background: active ? 'var(--bg-surface-alt)' : 'transparent',
                              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontWeight: active ? 600 : 400,
                              fontSize: 12,
                              textAlign: 'left',
                              width: '100%',
                              transition: 'all 0.12s ease',
                              position: 'relative',
                            }}
                          >
                            <ItemIcon size={15} style={{ flexShrink: 0, color: active ? 'var(--text-primary)' : 'var(--text-tertiary)' }} />
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary px-3 pt-3 pb-1">
            Planning
          </p>
        )}
        {isCollapsed && <div style={{ height: 6 }} />}

        <motion.button
          id="tour-todo"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule('todo')}
          title={isCollapsed ? 'Daily Planner' : undefined}
          style={{ ...navItemStyle(activeModule === 'todo'), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <IconChecklist size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Daily Planner</span>}
        </motion.button>

        <motion.button
          id="tour-calendar"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule('calendar')}
          title={isCollapsed ? 'Monthly Calendar' : undefined}
          style={{ ...navItemStyle(activeModule === 'calendar'), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <IconCalendar size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Monthly Calendar</span>}
        </motion.button>

        {/* Account Section */}
        {!isCollapsed && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary px-3 pt-3 pb-1">
            Account
          </p>
        )}
        {isCollapsed && <div style={{ height: 6 }} />}

        {/* Settings / Profile / Admin */}
        {[
          { id: 'settings',  label: 'Settings',  icon: IconSettings },
          { id: 'profile',   label: 'Profile',   icon: IconUser },
          { id: 'changelog', label: "What's New", icon: IconRocket },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: IconShieldLock }] : []),
        ].map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button
              key={id}
              id={`tour-${id}`}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveModule(id)}
              title={isCollapsed ? label : undefined}
              style={{ ...navItemStyle(active), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div style={{ borderTop: '1px solid var(--border-hairline)', padding: isCollapsed ? '10px 8px' : '10px 10px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        {/* User row */}
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', marginBottom: 4 }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="w-7 h-7 rounded-lg hover:bg-surface-alt text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shrink-0"
            >
              {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg hover:bg-surface-alt text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors mx-auto mb-2"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        )}

        {/* Cmd+K hint */}
        {!isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover text-text-secondary cursor-pointer w-full transition-colors mb-2 text-left"
          >
            <IconPlus size={14} className="text-text-primary shrink-0" />
            <span className="flex-1 text-[11px] font-medium">Quick search</span>
            <kbd className="px-1.5 py-0.5 bg-surface text-[9px] font-semibold text-text-tertiary rounded border border-border-hairline">⌘K</kbd>
          </button>
        )}

        {/* Sync / Export / Import / Logout */}
        {[
          {
            label: isSyncing ? 'Syncing...' : 'Sync Data',
            icon: IconRefresh,
            color: 'var(--text-secondary)',
            onClick: handleForceSync,
            disabled: isSyncing,
            iconClass: isSyncing ? 'animate-spin' : ''
          },
          { label: 'Export', icon: IconDownload, color: 'var(--text-secondary)',
            onClick: () => { const ok = exportData(); addToast(ok ? 'Success' : 'Export Failed', ok ? 'Data exported!' : 'Sign in first.', ok ? 'success' : 'error'); } },
          { label: 'Import', icon: IconUpload, color: 'var(--text-secondary)',
            onClick: () => fileInputRef.current?.click() },
          { label: 'Sign Out', icon: IconLogout, color: 'var(--accent-danger)',
            onClick: handleLogout },
        ].map(({ label, icon: Icon, color, onClick, disabled, iconClass }) => (
          <button
            key={label}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={isCollapsed ? label : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: isCollapsed ? '6px 0' : '6px 8px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              width: isCollapsed ? 36 : '100%', margin: isCollapsed ? '1px auto' : undefined,
              borderRadius: 8, border: 'none', background: 'transparent',
              color, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              textAlign: 'left' as const,
              opacity: disabled ? 0.6 : 1,
            }}
            className="hover:bg-surface-alt transition-colors"
          >
            <Icon size={15} className={iconClass} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>{label}</span>}
          </button>
        ))}
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/json" onChange={handleFileChange} />
      </div>
    </aside>
  );
};
