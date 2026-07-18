import {
  IconBook2, IconLayout, IconNotebook,
  IconDeviceGamepad2, IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconClockPlay,
  IconWallet, IconChecklist, IconSitemap, IconDots,
  IconChevronLeft, IconChevronRight, IconLayoutGrid, IconFolder, IconPencil,
  IconFileText, IconFlame, IconShieldLock, IconBulb, IconBook,
  IconArrowRight, IconTag, IconChartBar, IconBrush, IconX, IconPlus
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
    color: '#8B5CF6',
    desc: 'Your creative workspace — journals, notes, books and markdown.',
    items: [
      { id: 'journal',   label: 'Journal',           icon: IconBook2,    desc: 'Daily entries & reflections' },
      { id: 'books',     label: 'My Library',        icon: IconNotebook, desc: 'Books, notebooks & reading' },
      { id: 'markdown',  label: 'Markdown Creator',  icon: IconFileText, desc: 'Rich markdown editor' },
      { id: 'til',       label: 'Today I Learned',   icon: IconBulb,     desc: 'Quick learnings log' },
      { id: 'snippets',  label: 'Snippets Vault',    icon: IconCode,     desc: 'Save & organise code snippets' },
    ],
  },
  {
    id: 'organise',
    label: 'Organise',
    emoji: '📋',
    color: '#059669',
    desc: 'Tasks, projects, habits and tags — everything organised.',
    items: [
      { id: 'todo',      label: 'To-Do List',     icon: IconChecklist, desc: 'Tasks with subtasks & sync' },
      { id: 'projects',  label: 'Projects',       icon: IconFolder,    desc: 'Project boards & milestones' },
      { id: 'habits',    label: 'Habits',         icon: IconFlame,     desc: 'Daily habit streaks' },
      { id: 'tags',      label: 'Tag Manager',    icon: IconTag,       desc: 'Cross-module tag system' },
    ],
  },
  {
    id: 'track',
    label: 'Track',
    emoji: '📊',
    color: '#F59E0B',
    desc: 'Focus, study and finances — measure what matters.',
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
    color: '#3B82F6',
    desc: 'Canvas, diagrams, media and power tools.',
    items: [
      { id: 'mindmap',   label: 'Mindmap',              icon: IconSitemap,       desc: 'Visual mind maps' },
      { id: 'drawing',   label: 'Drawing',              icon: IconPencil,        desc: 'Freeform whiteboard' },
      { id: 'media',     label: 'Media Log',            icon: IconDeviceGamepad2, desc: 'Movies, games, shows' },
      { id: 'condition', label: 'Condition Workstation', icon: IconChartBar,     desc: 'Decision diagrams' },
      { id: 'utilities', label: 'Utilities',            icon: IconLayoutGrid,    desc: 'Calculators & tools' },
      { id: 'linksaver', label: 'Link Saver',           icon: IconBrush,         desc: 'Save links & clips' },
    ],
  },
];

// Flat list for collapsed mode + mobile nav
const ALL_ITEMS = NAV_GROUPS.flatMap(g => g.items);
const TOP_NAV = [
  { id: 'dashboard', label: 'Home', icon: IconLayout, pinned: true },
  ...ALL_ITEMS,
];

// ── Nav item style helper ──────────────────────────────────────────────────────
const navItemCls = (active: boolean) =>
  `flex items-center gap-2.5 px-3 py-2 rounded-[10px] w-full border-none cursor-pointer text-left transition-colors text-[13px] font-medium
   ${active ? 'text-primary bg-surface-hover font-bold' : 'text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary bg-transparent'}`;

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-[26px] leading-none">{group.emoji}</span>
          <div>
            <h2 className="font-black text-[16px] text-text-primary tracking-tight leading-tight">{group.label}</h2>
            <p className="text-[11px] text-text-muted font-medium mt-0.5 leading-snug">{group.desc}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Back to navigation"
          className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer shrink-0"
        >
          <IconX size={15} />
        </button>
      </div>

      {/* Module cards */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {group.items.map(item => {
          const Icon = item.icon;
          const active = activeModule === item.id;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => { onNavigate(item.id); onClose(); }}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left w-full cursor-pointer transition-all
                ${active
                  ? 'bg-primary/8 border-primary/20 shadow-sm'
                  : 'bg-surface-alt border-border/40 hover:bg-surface-hover hover:border-border/70'
                }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${group.color}18`, border: `1px solid ${group.color}25` }}
              >
                <Icon size={18} style={{ color: group.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold leading-tight ${active ? 'text-primary' : 'text-text-primary'}`}>
                  {item.label}
                </p>
                <p className="text-[11px] text-text-muted font-medium mt-0.5 leading-snug truncate">{item.desc}</p>
              </div>
              <IconArrowRight size={14} className={active ? 'text-primary' : 'text-text-muted'} />
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

  return (
    <aside
      className="sidebar-desktop flex-shrink-0 flex flex-col overflow-hidden"
      style={{
        width: isCollapsed ? 72 : activeCategoryPage ? 300 : 250,
        height: '100dvh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-border)',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 shrink-0 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <AppLogo className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <span className="font-extrabold text-[15px] text-text-primary tracking-tight whitespace-nowrap">
              Personal HQ<span className="text-primary">.</span>
            </span>
          )}
        </div>
        <button
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-expanded={!isCollapsed}
          className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shadow-sm shrink-0"
        >
          {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </button>
      </div>

      {/* Category landing page overlay */}
      <AnimatePresence>
        {openGroup && !isCollapsed && (
          <motion.div
            key={openGroup.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
            className="absolute top-16 left-0 right-0 bottom-0 z-10 flex flex-col overflow-hidden"
            style={{ background: 'var(--bg-surface)' }}
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

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 flex flex-col gap-1" style={{ padding: isCollapsed ? '12px 10px' : '12px 10px' }}>

        {/* Home (always pinned) */}
        <motion.button
          id="tour-dashboard"
          whileTap={{ scale: 0.97 }}
          onClick={() => { setActiveModule('dashboard'); setActiveCategoryPage(null); }}
          title={isCollapsed ? 'Home' : undefined}
          className={navItemCls(activeModule === 'dashboard' && !activeCategoryPage)}
          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          {activeModule === 'dashboard' && !activeCategoryPage && (
            <motion.div
              layoutId="sidebar-pill"
              className="absolute inset-0 bg-surface-hover rounded-[10px] z-0 pointer-events-none"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <IconLayout size={18} className="shrink-0 relative z-10" />
          {!isCollapsed && <span className="relative z-10 whitespace-nowrap">Home</span>}
        </motion.button>

        {/* Divider */}
        {!isCollapsed && <p className="text-[9px] font-black uppercase tracking-[0.16em] text-text-muted px-2 pt-3 pb-1">Sections</p>}

        {/* Category group buttons */}
        {NAV_GROUPS.map(group => {
          const isActive = activeCategoryPage === group.id
            || (!activeCategoryPage && group.items.some(i => i.id === activeModule));
          const isOpen = activeCategoryPage === group.id;

          if (isCollapsed) {
            // In collapsed mode: show individual items as icon-only buttons
            return group.items.map(item => {
              const Icon = item.icon;
              const active = activeModule === item.id && !activeCategoryPage;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setActiveModule(item.id); setActiveCategoryPage(null); }}
                  title={item.label}
                  className={`flex items-center justify-center w-10 h-10 mx-auto rounded-[10px] border-none cursor-pointer transition-colors
                    ${active ? 'bg-surface-hover text-primary' : 'bg-transparent text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary'}`}
                >
                  <Icon size={18} />
                </motion.button>
              );
            });
          }

          return (
            <button
              key={group.id}
              onClick={() => setActiveCategoryPage(isOpen ? null : group.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] w-full border-none cursor-pointer text-left transition-all text-[13px]
                ${isOpen
                  ? 'bg-surface-hover font-bold text-text-primary'
                  : isActive
                    ? 'font-semibold text-text-primary bg-transparent'
                    : 'font-medium text-text-secondary bg-transparent hover:bg-surface-hover/60 hover:text-text-primary'
                }`}
            >
              <span className="text-[16px] leading-none shrink-0">{group.emoji}</span>
              <span className="flex-1 whitespace-nowrap">{group.label}</span>
              <span className="text-[10px] text-text-muted shrink-0 font-normal">{group.items.length}</span>
              <IconChevronRight
                size={12}
                className={`shrink-0 transition-transform text-text-muted ${isOpen ? 'rotate-90' : ''}`}
              />
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-border/50 mx-2 my-2" />

        {/* Settings + Profile */}
        {[
          { id: 'settings', label: 'Settings', icon: IconSettings },
          { id: 'profile',  label: 'Profile',  icon: IconUser },
          ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: IconShieldLock }] : []),
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            id={`tour-${id}`}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setActiveModule(id); setActiveCategoryPage(null); }}
            title={isCollapsed ? label : undefined}
            className={navItemCls(activeModule === id && !activeCategoryPage)}
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <Icon size={18} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 shrink-0" style={{ padding: isCollapsed ? '12px 8px' : '12px 10px' }}>
        {/* User row */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-[12px] font-bold text-text-primary truncate">{userName}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle dark/light theme"
              className="w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
            >
              {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
            </button>
          </div>
        )}

        {isCollapsed && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle dark/light theme"
            className="w-10 h-10 mx-auto rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-secondary flex items-center justify-center cursor-pointer transition-colors shadow-sm mb-2 block"
          >
            {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>
        )}

        {/* Cmd+K discovery hint */}
        {!isCollapsed && (
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
            className="flex items-center gap-2 px-2 py-1.5 mb-2 w-full rounded-lg bg-surface-alt hover:bg-surface-hover border border-border/40 cursor-pointer transition-colors"
          >
            <IconPlus size={13} className="text-primary shrink-0" />
            <span className="flex-1 text-[11px] font-semibold text-text-secondary">Quick-add anything</span>
            <kbd className="px-1.5 py-0.5 bg-surface-hover border border-border text-[9px] font-bold text-text-muted rounded font-mono">⌘K</kbd>
          </button>
        )}

        {[
          {
            label: 'Export', icon: IconDownload, color: 'var(--text-secondary)',
            onClick: () => {
              const ok = exportData();
              addToast(ok ? 'Success' : 'Export Failed', ok ? 'Data exported!' : 'Sign in first.', ok ? 'success' : 'error');
            }
          },
          {
            label: 'Import', icon: IconUpload, color: 'var(--text-secondary)',
            onClick: () => fileInputRef.current?.click(),
          },
          {
            label: 'Logout', icon: IconLogout, color: '#f43f5e',
            onClick: handleLogout,
          },
        ].map(({ label, icon: Icon, color, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            aria-label={label}
            title={isCollapsed ? label : undefined}
            className={`flex items-center gap-2.5 w-full border-none bg-transparent cursor-pointer rounded-lg hover:bg-surface-hover transition-colors
              ${isCollapsed ? 'justify-center w-10 h-10 mx-auto mb-1' : 'px-2 py-1.5 mb-0.5'}`}
            style={{ color, fontSize: 13, fontWeight: label === 'Logout' ? 600 : 500 }}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {!isCollapsed && <span>{label}</span>}
          </button>
        ))}
        <input type="file" ref={fileInputRef} className="hidden" accept="application/json" onChange={handleFileChange} />
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

  const MORE = [
    ...ALL_ITEMS.filter(i => !PINNED.find(p => p.id === i.id) && (i.id !== 'admin' || isAdmin)),
    { id: 'settings', label: 'Settings', icon: IconSettings, desc: '' },
    { id: 'profile',  label: 'Profile',  icon: IconUser, desc: '' },
  ];

  return (
    <>
      {isMoreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
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
            className="fixed bottom-[70px] left-4 right-4 z-50 rounded-2xl border border-border overflow-hidden"
            style={{ background: 'var(--bg-surface)', maxHeight: '62vh', boxShadow: '0 -8px 30px rgba(0,0,0,0.15)', willChange: 'transform, opacity' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <p className="text-[13px] font-black text-text-primary">All Modules</p>
              <button onClick={() => setIsMoreOpen(false)} className="w-7 h-7 rounded-full bg-surface-hover flex items-center justify-center text-text-muted cursor-pointer">
                <IconX size={14} />
              </button>
            </div>
            <div className="overflow-y-auto p-3" style={{ maxHeight: 'calc(62vh - 52px)' }}>
              {NAV_GROUPS.map(group => (
                <div key={group.id} className="mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.16em] px-1 mb-2 flex items-center gap-1.5" style={{ color: group.color }}>
                    <span>{group.emoji}</span> {group.label}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {group.items.filter(i => i.id !== 'admin' || isAdmin).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => { setActiveModule(id); setIsMoreOpen(false); }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-none cursor-pointer"
                        style={{ background: activeModule === id ? `${group.color}12` : 'transparent', color: activeModule === id ? group.color : 'var(--text-primary)' }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: activeModule === id ? `${group.color}18` : 'var(--bg-surface-alt)' }}>
                          <Icon size={20} />
                        </div>
                        <span className="text-[9px] font-semibold text-center leading-tight">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="mobile-bottom-nav"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', borderTop: '1px solid var(--border-border)', display: 'none', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px env(safe-area-inset-bottom, 8px)', boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' }}
      >
        {PINNED.map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button key={id} onClick={() => { setActiveModule(id); setIsMoreOpen(false); }} whileTap={{ scale: 0.9 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: active ? 'var(--color-primary)' : 'var(--text-muted)', minWidth: 48, position: 'relative' }}
            >
              {active && (
                <motion.div layoutId="mobile-nav-pill" className="absolute top-0 left-1 right-1 h-0.5 bg-primary rounded-full" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
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
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: isMoreOpen ? 'var(--color-primary)' : 'var(--text-muted)', minWidth: 48 }}
        >
          <IconDots size={22} />
          <span style={{ fontSize: 10, fontWeight: isMoreOpen ? 700 : 500 }}>More</span>
        </motion.button>
      </nav>
    </>
  );
};
