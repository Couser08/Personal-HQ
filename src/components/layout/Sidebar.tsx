import {
  IconBook2, IconLayout, IconNotebook,
  IconDeviceGamepad2, IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconClockPlay,
  IconWallet, IconChecklist, IconSitemap, IconDots,
  IconChevronLeft, IconChevronRight, IconLayoutGrid, IconFolder, IconPencil,
  IconFileText, IconFlame, IconShieldLock, IconBulb, IconBook,
  IconArrowRight, IconTag, IconChartBar, IconBrush, IconX, IconPlus,
  IconWriting, IconListCheck, IconTrendingUp, IconTool
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { exportData, importData } from '../../utils/exportImport';
import { useToastStore } from '../../store/useToastStore';
import { useRef, useState } from 'react';
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
    desc: 'Tasks, projects, habits and tags.',
    items: [
      { id: 'todo',      label: 'To-Do List',    icon: IconChecklist, desc: 'Tasks with subtasks & sync' },
      { id: 'projects',  label: 'Projects',      icon: IconFolder,    desc: 'Project boards & milestones' },
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
      { id: 'budget',    label: 'Expense & Income', icon: IconWallet,    desc: 'Budget & spending' },
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

const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);

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

// ── Category landing page ──────────────────────────────────────────────────────
function CategoryPage({
  group,
  activeModule,
  onNavigate,
  onClose,
}: {
  group: typeof NAV_GROUPS[0];
  activeModule: string;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 12px', borderBottom: '1px solid var(--border-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>{group.emoji}</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>{group.label}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{group.desc}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Back to navigation"
          style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'var(--bg-surface-hover, rgba(255,255,255,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
        >
          <IconX size={14} />
        </button>
      </div>

      {/* Module cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {group.items.map(item => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onNavigate(item.id); onClose(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 14, border: `1px solid ${active ? group.color + '40' : 'var(--border-border)'}`,
                background: active ? group.color + '12' : 'var(--bg-surface-alt, rgba(255,255,255,0.03))',
                textAlign: 'left', width: '100%', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: group.color + '18', border: `1px solid ${group.color}28`, flexShrink: 0 }}>
                <Icon size={17} style={{ color: group.color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: active ? group.color : 'var(--text-primary)', lineHeight: 1.2 }}>{item.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.desc}</p>
              </div>
              <IconArrowRight size={13} style={{ color: active ? group.color : 'var(--text-muted)', flexShrink: 0 }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
export const Sidebar = () => {
  const { activeModule, setActiveModule, theme, setTheme, showConfirm } = useAppStore(useShallow(state => ({
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
    theme: state.theme,
    setTheme: state.setTheme,
    showConfirm: state.showConfirm,
  })));
  const { user, signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(() =>
    localStorage.getItem('sidebar_collapsed') === 'true'
  );
  const [activeCategoryPage, setActiveCategoryPage] = useState<string | null>(null);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
    if (next) setActiveCategoryPage(null);
  };

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => { await signOut(); });
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

  const openGroup = NAV_GROUPS.find(g => g.id === activeCategoryPage);
  const sidebarWidth = isCollapsed ? 72 : activeCategoryPage ? 300 : 250;

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

      {/* ── Category landing page overlay ── */}
      <AnimatePresence>
        {openGroup && !isCollapsed && (
          <motion.div
            key={openGroup.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.16 }}
            style={{
              position: 'absolute', top: 64, left: 0, right: 0, bottom: 0,
              background: 'var(--bg-surface)', zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            <CategoryPage
              group={openGroup}
              activeModule={activeModule}
              onNavigate={setActiveModule}
              onClose={() => setActiveCategoryPage(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Nav ── */}
      <nav
        style={{ flex: 1, padding: isCollapsed ? '10px 10px' : '10px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}
      >
        {/* Home – always pinned */}
        <motion.button
          id="tour-dashboard"
          whileTap={{ scale: 0.97 }}
          onClick={() => { setActiveModule('dashboard'); setActiveCategoryPage(null); }}
          title={isCollapsed ? 'Home' : undefined}
          style={{ ...navItemStyle(activeModule === 'dashboard' && !activeCategoryPage), justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          {activeModule === 'dashboard' && !activeCategoryPage && (
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
            Sections
          </p>
        )}
        {isCollapsed && <div style={{ height: 8 }} />}

        {/* Category group rows */}
        {NAV_GROUPS.map(group => {
          const groupActive = group.items.some(i => i.id === activeModule);
          const isOpen = activeCategoryPage === group.id;

          if (isCollapsed) {
            // Collapsed: show one category icon per group, clicking expands + opens category
            const CatIcon = group.icon;
            const groupActive = group.items.some(i => i.id === activeModule);
            return (
              <motion.button
                key={group.id}
                whileTap={{ scale: 0.93 }}
                title={group.label}
                onClick={() => {
                  setIsCollapsed(false);
                  localStorage.setItem('sidebar_collapsed', 'false');
                  setActiveCategoryPage(group.id);
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
            <button
              key={group.id}
              onClick={() => setActiveCategoryPage(isOpen ? null : group.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isOpen ? 'var(--bg-surface-hover, rgba(255,255,255,0.06))' : 'transparent',
                color: isOpen ? 'var(--text-primary)' : groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isOpen || groupActive ? 600 : 500, fontSize: 13,
                textAlign: 'left', width: '100%', transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{group.emoji}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{group.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>{group.items.length}</span>
              <IconChevronRight
                size={12}
                style={{ color: 'var(--text-muted)', flexShrink: 0, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
              />
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border-border)', margin: isCollapsed ? '8px auto' : '8px 4px', width: isCollapsed ? 36 : 'auto' }} />

        {/* Settings / Profile / Admin */}
        {[
          { id: 'settings', label: 'Settings', icon: IconSettings },
          { id: 'profile',  label: 'Profile',  icon: IconUser },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: IconShieldLock }] : []),
        ].map(({ id, label, icon: Icon }) => {
          const active = activeModule === id && !activeCategoryPage;
          return (
            <motion.button
              key={id}
              id={`tour-${id}`}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setActiveModule(id); setActiveCategoryPage(null); }}
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

        {/* Collapsed: NO individual item list — categories above are enough */}
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

        {/* Export / Import / Logout */}
        {[
          { label: 'Export', icon: IconDownload, color: 'var(--text-secondary)', fw: 500,
            onClick: () => { const ok = exportData(); addToast(ok ? 'Success' : 'Export Failed', ok ? 'Data exported!' : 'Sign in first.', ok ? 'success' : 'error'); } },
          { label: 'Import', icon: IconUpload, color: 'var(--text-secondary)', fw: 500,
            onClick: () => fileInputRef.current?.click() },
          { label: 'Logout', icon: IconLogout, color: '#f43f5e', fw: 600,
            onClick: handleLogout },
        ].map(({ label, icon: Icon, color, fw, onClick }) => (
          <button
            key={label}
            onClick={onClick}
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
            }}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
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
    { id: 'todo',      label: 'To-Do',   icon: IconChecklist },
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
