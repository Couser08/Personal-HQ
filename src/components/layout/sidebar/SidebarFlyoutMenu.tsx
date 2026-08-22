import React from 'react';
import { motion } from 'framer-motion';
import type { NavGroup } from './sidebarNavigation';

interface SidebarFlyoutMenuProps {
  group: NavGroup;
  activeModule: string;
  setActiveModule: (id: string) => void;
  onClose: () => void;
}

export const SidebarFlyoutMenu: React.FC<SidebarFlyoutMenuProps> = ({
  group,
  activeModule,
  setActiveModule,
  onClose,
}) => {
  return (
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
      <div
        style={{
          padding: '6px 8px',
          borderBottom: '1px solid var(--border-hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{group.emoji}</span> {group.label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)' }}>
          {group.items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 4 }}>
        {group.items.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveModule(item.id);
                onClose();
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
              <span
                style={{
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
