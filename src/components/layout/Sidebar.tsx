import {
  IconNotes, IconLink, IconTrendingUp, IconBook,
  IconCalculator, IconDeviceGamepad2, IconHourglassEmpty,
  IconCode, IconSettings, IconDownload, IconUpload,
  IconLogout, IconSun, IconMoon, IconUser, IconCrown, IconRocket
} from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import { exportData, importData } from '../../utils/exportImport';
import { useToastStore } from '../../store/useToastStore';
import { useRef } from 'react';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'notes',      label: 'Notes',          icon: IconNotes },
  { id: 'links',      label: 'Link Vault',     icon: IconLink },
  { id: 'stocks',     label: 'Stock Journal',  icon: IconTrendingUp },
  { id: 'study',      label: 'Study Tracker',  icon: IconBook },
  { id: 'calculator', label: 'Interest Calc',  icon: IconCalculator },
  { id: 'media',      label: 'Media Log',      icon: IconDeviceGamepad2 },
  { id: 'countdown',  label: 'Countdown',      icon: IconHourglassEmpty },
  { id: 'snippets',   label: 'Snippets Vault', icon: IconCode },
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

// ─── Desktop / Tablet Sidebar ─────────────────────────────────────────────────

export const Sidebar = () => {
  const { activeModule, setActiveModule, theme, setTheme, showConfirm } = useAppStore();
  const { user, signOut } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    showConfirm('Sign Out', 'Are you sure you want to sign out?', async () => {
      await signOut();
    });
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

  const userEmail = user?.email ?? 'User';
  // Use first part of email for name, capitalized
  const userName = userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1);
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <aside
      className="sidebar-desktop"
      style={{
        width: 250, height: '100dvh', flexShrink: 0,
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-border)',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>P</span>
        </div>
        <span className="sidebar-header-text" style={{
          fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '-0.3px', whiteSpace: 'nowrap',
        }}>
          Personal HQ
          <span style={{ color: '#f43f5e', marginLeft: 4 }}>●</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="sidebar-scroll" style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activeModule === id;
          return (
            <motion.button
              key={id} id={`tour-${id}`} onClick={() => setActiveModule(id)}
              whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(active)}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span className="sidebar-label" style={{ whiteSpace: 'nowrap' }}>{label}</span>
            </motion.button>
          );
        })}

        <div style={{ height: 1, background: 'var(--border-border)', margin: '12px 4px' }} />

        {/* Settings & Profile */}
        <motion.button id="tour-settings" onClick={() => setActiveModule('settings')} whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(activeModule === 'settings')}>
          <IconSettings size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label">Settings</span>
        </motion.button>
        
        <motion.button id="tour-profile" onClick={() => setActiveModule('profile')} whileTap={{ scale: 0.97 }} style={NAV_ITEM_STYLE(activeModule === 'profile')}>
          <IconUser size={18} style={{ flexShrink: 0 }} />
          <span className="sidebar-label">Profile</span>
        </motion.button>

      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border-border)', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* User profile row */}
        <div className="sidebar-user-row" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            background: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {userInitial}
          </div>
          <div className="sidebar-label" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </span>
          </div>
          <div className="sidebar-label" style={{ marginLeft: 'auto' }}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
              style={{
                padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-secondary)', display: 'flex',
              }}>
              {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
          </div>
        </div>

        {/* Action links */}
        <button onClick={() => { exportData(); addToast('Success', 'Data exported successfully!', 'success'); }}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, border:'none',
            background:'transparent', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', width:'100%', textAlign:'left' }}>
          <IconDownload size={16} /> <span className="sidebar-label">Export Data</span>
        </button>

        <button onClick={() => fileInputRef.current?.click()}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, border:'none',
            background:'transparent', color:'var(--text-secondary)', fontSize:13, fontWeight:500, cursor:'pointer', width:'100%', textAlign:'left' }}>
          <IconUpload size={16} /> <span className="sidebar-label">Import Data</span>
        </button>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="application/json" onChange={handleFileChange} />

        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, border:'none',
            background:'transparent', color:'#f43f5e', fontSize:13, fontWeight:600, cursor:'pointer', width:'100%', textAlign:'left' }}>
          <IconLogout size={16} /> <span className="sidebar-label">Logout</span>
        </button>
      </div>
    </aside>
  );
};

// ─── Mobile Bottom Navigation ─────────────────────────────────────────────────

const BOTTOM_NAV = NAV_ITEMS.slice(0, 4);

export const MobileBottomNav = () => {
  const { activeModule, setActiveModule } = useAppStore();

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border-border)',
        display: 'none', // overridden by CSS media query
        alignItems: 'center', justifyContent: 'space-around',
        padding: '8px 4px env(safe-area-inset-bottom, 8px)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }}
    >
      {BOTTOM_NAV.map(({ id, label, icon: Icon }) => {
        const active = activeModule === id;
        return (
          <motion.button key={id} onClick={() => setActiveModule(id)} whileTap={{ scale: 0.9 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent',
              cursor: 'pointer', color: active ? '#f43f5e' : 'var(--text-muted)', position: 'relative', minWidth: 48,
            }}>
            <Icon size={22} style={{ position: 'relative', zIndex: 1 }} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>
              {label.split(' ')[0]}
            </span>
          </motion.button>
        );
      })}
      {/* Profile/More Button for Mobile */}
      <motion.button onClick={() => setActiveModule('profile')} whileTap={{ scale: 0.9 }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          padding: '6px 8px', borderRadius: 10, border: 'none', background: 'transparent',
          cursor: 'pointer', color: activeModule === 'profile' ? '#f43f5e' : 'var(--text-muted)', minWidth: 48,
        }}>
        <IconUser size={22} />
        <span style={{ fontSize: 10, fontWeight: 500 }}>Profile</span>
      </motion.button>
    </nav>
  );
};
