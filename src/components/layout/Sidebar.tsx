import {
  IconSettings,
  IconUser,
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconShieldLock,
  IconCalendar,
  IconRocket,
  IconLayout,
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AppLogo } from '../ui/AppLogo';
import { motion } from 'framer-motion';
import {
  NAV_GROUPS,
  navItemStyle,
} from './sidebar/sidebarNavigation';
import { SidebarGroupItem } from './sidebar/SidebarGroupItem';
import { SidebarFooter } from './sidebar/SidebarFooter';

export const Sidebar = () => {
  const { activeModule, setActiveModule, theme, setTheme, showConfirm, isSyncing, forceSync } =
    useAppStore(
      useShallow((state) => ({
        activeModule: state.activeModule,
        setActiveModule: state.setActiveModule,
        theme: state.theme,
        setTheme: state.setTheme,
        showConfirm: state.showConfirm,
        isSyncing: state.isSyncing,
        forceSync: state.forceSync,
      })),
    );
  const { user, signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);

  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === 'true',
  );
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);

  // Track expanded categories (default all expanded for quick access)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      initial[g.id] = true;
    });
    return initial;
  });

  // Ensure category containing active module is expanded
  useEffect(() => {
    const activeGroup = NAV_GROUPS.find((g) => g.items.some((i) => i.id === activeModule));
    if (activeGroup) {
      setExpandedCategories((prev) => ({ ...prev, [activeGroup.id]: true }));
    }
  }, [activeModule]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
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
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => {
      await signOut();
    });
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

  const isAdmin = user?.email === 'tungariyarahul08@gmail.com';
  const userEmail = user?.email ?? 'User';
  const userName =
    user?.user_metadata?.full_name ||
    (userEmail !== 'User'
      ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
      : 'User');

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
      <div
        style={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          padding: isCollapsed ? '0 12px' : '0 16px',
          gap: 10,
          flexShrink: 0,
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-hairline)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AppLogo className="w-7 h-7 shrink-0" />
          {!isCollapsed && (
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
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
        style={{
          flex: 1,
          padding: isCollapsed ? '12px 8px' : '12px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
        className="scrollbar-none"
      >
        {/* Home – always pinned */}
        <motion.button
          id="tour-dashboard"
          data-bug-target="nav-item-dashboard"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule('dashboard')}
          title={isCollapsed ? 'Home' : undefined}
          style={{
            ...navItemStyle(activeModule === 'dashboard'),
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
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
        {NAV_GROUPS.map((group) => (
          <SidebarGroupItem
            key={group.id}
            group={group}
            activeModule={activeModule}
            setActiveModule={setActiveModule}
            isCollapsed={isCollapsed}
            isExpanded={!!expandedCategories[group.id]}
            toggleCategory={toggleCategory}
            hoveredGroupId={hoveredGroupId}
            setHoveredGroupId={setHoveredGroupId}
          />
        ))}

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
          style={{
            ...navItemStyle(activeModule === 'todo'),
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
        >
          <IconChecklist size={17} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>Daily Planner</span>}
        </motion.button>

        <motion.button
          id="tour-calendar"
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveModule('calendar')}
          title={isCollapsed ? 'Monthly Calendar' : undefined}
          style={{
            ...navItemStyle(activeModule === 'calendar'),
            justifyContent: isCollapsed ? 'center' : 'flex-start',
          }}
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
          { id: 'settings', label: 'Settings', icon: IconSettings },
          { id: 'profile', label: 'Profile', icon: IconUser },
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
              style={{
                ...navItemStyle(active),
                justifyContent: isCollapsed ? 'center' : 'flex-start',
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!isCollapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </motion.button>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <SidebarFooter
        isCollapsed={isCollapsed}
        theme={theme}
        setTheme={setTheme}
        userName={userName}
        userEmail={userEmail}
        isSyncing={isSyncing}
        handleForceSync={handleForceSync}
        handleLogout={handleLogout}
      />
    </aside>
  );
};
