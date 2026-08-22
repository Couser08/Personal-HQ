import React, { useRef } from 'react';
import {
  IconSun,
  IconMoon,
  IconPlus,
  IconRefresh,
  IconDownload,
  IconUpload,
  IconLogout,
} from '@tabler/icons-react';
import { exportData, importData } from '../../../utils/exportImport';
import { useToastStore } from '../../../store/useToastStore';

interface SidebarFooterProps {
  isCollapsed: boolean;
  theme: string;
  setTheme: (t: any) => void;
  userName: string;
  userEmail: string;
  isSyncing: boolean;
  handleForceSync: () => void;
  handleLogout: () => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
  isCollapsed,
  theme,
  setTheme,
  userName,
  userEmail,
  isSyncing,
  handleForceSync,
  handleLogout,
}) => {
  const addToast = useToastStore((s) => s.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importData(
        file,
        () => addToast('Success', 'Data imported successfully!', 'success'),
        (msg) => addToast('Import Failed', msg, 'error'),
      );
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div
      style={{
        borderTop: '1px solid var(--border-hairline)',
        padding: isCollapsed ? '10px 8px' : '10px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flexShrink: 0,
      }}
    >
      {/* User row */}
      {!isCollapsed && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 6px',
            marginBottom: 4,
          }}
        >
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userName}
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {userEmail}
            </p>
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
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
            )
          }
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover text-text-secondary cursor-pointer w-full transition-colors mb-2 text-left"
        >
          <IconPlus size={14} className="text-text-primary shrink-0" />
          <span className="flex-1 text-[11px] font-medium">Quick search</span>
          <kbd className="px-1.5 py-0.5 bg-surface text-[9px] font-semibold text-text-tertiary rounded border border-border-hairline">
            ⌘K
          </kbd>
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
          iconClass: isSyncing ? 'animate-spin' : '',
        },
        {
          label: 'Export',
          icon: IconDownload,
          color: 'var(--text-secondary)',
          onClick: () => {
            const ok = exportData();
            addToast(
              ok ? 'Success' : 'Export Failed',
              ok ? 'Data exported!' : 'Sign in first.',
              ok ? 'success' : 'error',
            );
          },
        },
        {
          label: 'Import',
          icon: IconUpload,
          color: 'var(--text-secondary)',
          onClick: () => fileInputRef.current?.click(),
        },
        {
          label: 'Sign Out',
          icon: IconLogout,
          color: 'var(--accent-danger)',
          onClick: handleLogout,
        },
      ].map(({ label, icon: Icon, color, onClick, disabled, iconClass }) => (
        <button
          key={label}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          title={isCollapsed ? label : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: isCollapsed ? '6px 0' : '6px 8px',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            width: isCollapsed ? 36 : '100%',
            margin: isCollapsed ? '1px auto' : undefined,
            borderRadius: 8,
            border: 'none',
            background: 'transparent',
            color,
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left' as const,
            opacity: disabled ? 0.6 : 1,
          }}
          className="hover:bg-surface-alt transition-colors"
        >
          <Icon size={15} className={iconClass} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>{label}</span>}
        </button>
      ))}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="application/json"
        onChange={handleFileChange}
      />
    </div>
  );
};
