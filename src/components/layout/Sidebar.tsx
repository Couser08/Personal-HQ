import {
  IconBook, IconLayout,
  IconDeviceGamepad2, IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconClockPlay,
  IconWallet, IconChecklist, IconSitemap, IconDots,
  IconChevronLeft, IconChevronRight, IconLayoutGrid, IconFolder, IconPencil
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { exportData, importData } from '../../utils/exportImport';
import { useToastStore } from '../../store/useToastStore';
import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AppLogo } from '../ui/AppLogo';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: IconLayout },
  { id: 'projects', label: 'Projects', icon: IconFolder },
  { id: 'todo', label: 'To-Do List', icon: IconChecklist },
  { id: 'study', label: 'Study Tracker', icon: IconBook },
  { id: 'budget', label: 'Expense & Income', icon: IconWallet },
  { id: 'snippets', label: 'Snippets Vault', icon: IconCode },
  { id: 'pomodoro', label: 'Pomodoro', icon: IconClockPlay },
  { id: 'mindmap', label: 'Mindmap', icon: IconSitemap },
  { id: 'drawing', label: 'Drawing', icon: IconPencil },
  { id: 'media', label: 'Media Log', icon: IconDeviceGamepad2 },
  { id: 'utilities', label: 'Utilities', icon: IconLayoutGrid },
];

const NAV_ITEM_STYLE = (active: boolean) => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
  background: active ? 'rgba(244,63,94,0.08)' : 'transparent',
  color: active ? '#f43f5e' : 'var(--text-secondary)',
  fontWeight: active ? 700 : 500, fontSize: 13,
  textAlign: 'left' as const, width: '100%',
  transition: 'background 0.15s, color 0.15s',
  position: 'relative' as const,
});

export const Sidebar = () => {
  const { activeModule, setActiveModule, theme, setTheme, showConfirm } = useAppStore(useShallow(state => ({
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule,
    theme: state.theme,
    setTheme: state.setTheme,
    showConfirm: state.showConfirm
  })));
  const { user, signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    const nextVal = !isCollapsed;
    setIsCollapsed(nextVal);
    localStorage.setItem('sidebar_collapsed', String(nextVal));
  };

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => {
      await signOut();
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(
        file,
        () => addToast('Success', 'Data imported successfully!', 'success'),
        (msg) => addToast('Import Failed', msg, 'error')
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const userEmail = user?.email ?? 'User';
  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: isCollapsed ? 72 : 250,
        height: '100dvh',
        flexShrink: 0,
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-border)',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        display: 'flex'
      }}
    >
      <style>{`
        ${isCollapsed ? `
          .sidebar-label {
            display: none !important;
          }
          .sidebar-header-text {
            display: none !important;
          }
          .sidebar-scroll button {
            justify-content: center !important;
            padding: 9px 0 !important;
            width: 44px !important;
            height: 44px !important;
            margin: 2px auto !important;
            border-radius: 12px !important;
          }
          .sidebar-user-row {
            justify-content: center !important;
            padding: 4px 0 !important;
            margin-bottom: 8px !important;
          }
          .sidebar-user-row .sidebar-label {
            display: none !important;
          }
          .sidebar-footer-btn {
            justify-content: center !important;
            padding: 8px 0 !important;
            width: 40px !important;
            margin: 2px auto !important;
            border-radius: 8px !important;
          }
        ` : ''}
      `}</style>

      {/* Sidebar Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', padding: isCollapsed ? '0 10px' : '0 20px', gap: 12, flexShrink: 0, justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: '1px solid var(--border-border-alt)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <AppLogo className="w-8 h-8 flex-shrink-0" />
          {!isCollapsed && (
            <span className="sidebar-header-text" style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
              Personal HQ
              <span style={{ color: '#f43f5e', marginLeft: 2 }}>.</span>
            </span>
          )}
        </div>
        <button 
          onClick={toggleCollapse} 
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="w-7 h-7 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors shadow-sm hidden md:flex"
        >
          {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronLeft size={14} />}
        </button>
      </div>

      <nav className="sidebar-scroll" style={{ flex: 1, padding: isCollapsed ? '12px 0' : '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button key={id} id={'tour-' + id} onClick={() => setActiveModule(id)} whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(active)} title={isCollapsed ? label : undefined}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ whiteSpace: 'nowrap' }}>{label}</span>
            </motion.button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border-border)', margin: isCollapsed ? '8px 16px' : '12px 4px' }} />

        <motion.button id="tour-settings" onClick={() => setActiveModule('settings')} whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(activeModule === 'settings')} title={isCollapsed ? "Settings" : undefined}>
          <IconSettings size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label">Settings</span>
        </motion.button>

        <motion.button id="tour-profile" onClick={() => setActiveModule('profile')} whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(activeModule === 'profile')} title={isCollapsed ? "Profile" : undefined}>
          <IconUser size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label">Profile</span>
        </motion.button>
      </nav>

      <div style={{ borderTop: '1px solid var(--border-border)', padding: isCollapsed ? '16px 0' : '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="sidebar-user-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }} title={userName}>
            {userInitial}
          </div>
          <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
          </div>
          {!isCollapsed && (
            <div style={{ marginLeft: 'auto' }}>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle theme" className="btn btn-ghost btn-sm btn-square">
                {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
              </button>
            </div>
          )}
        </div>

        {isCollapsed && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            title="Toggle theme" 
            className="w-10 h-10 mx-auto rounded-lg border border-border bg-surface hover:bg-surface-hover text-text-secondary flex items-center justify-center cursor-pointer transition-colors shadow-sm mb-2"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        )}

        <button 
          onClick={() => {
            const exported = exportData();
            addToast(exported ? 'Success' : 'Export Failed', exported ? 'Data exported successfully!' : 'Sign in before exporting data.', exported ? 'success' : 'error');
          }} 
          className="sidebar-footer-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          title={isCollapsed ? "Export Data" : undefined}
        >
          <IconDownload size={16} style={{ flexShrink: 0 }} /> <span className="sidebar-label">Export Data</span>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="sidebar-footer-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          title={isCollapsed ? "Import Data" : undefined}
        >
          <IconUpload size={16} style={{ flexShrink: 0 }} /> <span className="sidebar-label">Import Data</span>
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/json" onChange={handleFileChange} />

        <button 
          onClick={handleLogout} 
          className="sidebar-footer-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', color: '#f43f5e', fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left' }}
          title={isCollapsed ? "Logout" : undefined}
        >
          <IconLogout size={16} style={{ flexShrink: 0 }} /> <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

const BOTTOM_NAV = NAV_ITEMS.slice(0, 4);

export const MobileBottomNav = () => {
  const { activeModule, setActiveModule } = useAppStore(useShallow(state => ({
    activeModule: state.activeModule,
    setActiveModule: state.setActiveModule
  })));
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const MORE_NAV = NAV_ITEMS.slice(4);

  return (
    <>
      {isMoreOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsMoreOpen(false)}
        />
      )}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            style={{ position: 'fixed', bottom: 70, left: 16, right: 16, zIndex: 45, background: 'var(--bg-surface)', padding: 16, borderRadius: 16, border: '1px solid var(--border-border)', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', maxHeight: '60vh', overflowY: 'auto' }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>More Features</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {MORE_NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveModule(id); setIsMoreOpen(false); }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: activeModule === id ? '#f43f5e' : 'var(--text-primary)' }}
                >
                  <div style={{ padding: 10, borderRadius: 12, background: activeModule === id ? 'rgba(244,63,94,0.1)' : 'var(--bg-surface-alt)' }}>
                    <Icon size={24} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>{label}</span>
                </button>
              ))}
              <button
                onClick={() => { setActiveModule('profile'); setIsMoreOpen(false); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: activeModule === 'profile' ? '#f43f5e' : 'var(--text-primary)' }}
              >
                <div style={{ padding: 10, borderRadius: 12, background: activeModule === 'profile' ? 'rgba(244,63,94,0.1)' : 'var(--bg-surface-alt)' }}>
                  <IconUser size={24} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>Profile</span>
              </button>
              <button
                onClick={() => { setActiveModule('settings'); setIsMoreOpen(false); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: activeModule === 'settings' ? '#f43f5e' : 'var(--text-primary)' }}
              >
                <div style={{ padding: 10, borderRadius: 12, background: activeModule === 'settings' ? 'rgba(244,63,94,0.1)' : 'var(--bg-surface-alt)' }}>
                  <IconSettings size={24} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 500, textAlign: 'center' }}>Settings</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mobile-bottom-nav" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'var(--bg-surface)', borderTop: '1px solid var(--border-border)', display: 'none', alignItems: 'center', justifyContent: 'space-around', padding: '8px 4px env(safe-area-inset-bottom, 8px)', boxShadow: '0 -4px 20px rgba(0,0,0,0.04)' }}>
        {BOTTOM_NAV.map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button key={id} onClick={() => { setActiveModule(id); setIsMoreOpen(false); }} whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: active ? '#f43f5e' : 'var(--text-muted)', position: 'relative', minWidth: 48 }}>
              <Icon size={22} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{label.split(' ')[0]}</span>
            </motion.button>
          );
        })}
        <motion.button onClick={() => setIsMoreOpen(!isMoreOpen)} whileTap={{ scale: 0.9 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer', color: isMoreOpen ? '#f43f5e' : 'var(--text-muted)', minWidth: 48 }}>
          <IconDots size={22} />
          <span style={{ fontSize: 10, fontWeight: isMoreOpen ? 700 : 500 }}>More</span>
        </motion.button>
      </nav>
    </>
  );
};
