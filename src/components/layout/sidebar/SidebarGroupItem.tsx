import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown } from '@tabler/icons-react';
import type { NavGroup } from './sidebarNavigation';
import { SidebarFlyoutMenu } from './SidebarFlyoutMenu';

interface SidebarGroupItemProps {
  group: NavGroup;
  activeModule: string;
  setActiveModule: (id: string) => void;
  isCollapsed: boolean;
  isExpanded: boolean;
  toggleCategory: (categoryId: string) => void;
  hoveredGroupId: string | null;
  setHoveredGroupId: (id: string | null) => void;
}

export const SidebarGroupItem: React.FC<SidebarGroupItemProps> = ({
  group,
  activeModule,
  setActiveModule,
  isCollapsed,
  isExpanded,
  toggleCategory,
  hoveredGroupId,
  setHoveredGroupId,
}) => {
  const groupActive = group.items.some((i) => i.id === activeModule);

  if (isCollapsed) {
    const CatIcon = group.icon;
    const isHovered = hoveredGroupId === group.id;

    return (
      <div
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 38,
            height: 38,
            margin: '0 auto',
            borderRadius: 10,
            border: 'none',
            background: groupActive ? 'var(--bg-surface-alt)' : 'transparent',
            color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <CatIcon size={18} />
        </motion.button>

        {/* Hover Flyout Submenu */}
        <AnimatePresence>
          {isHovered && (
            <SidebarFlyoutMenu
              group={group}
              activeModule={activeModule}
              setActiveModule={setActiveModule}
              onClose={() => setHoveredGroupId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Category Header */}
      <button
        onClick={() => toggleCategory(group.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          borderRadius: 10,
          border: 'none',
          cursor: 'pointer',
          background: groupActive ? 'var(--bg-surface-alt)' : 'transparent',
          color: groupActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: 12.5,
          textAlign: 'left',
          width: '100%',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{group.emoji}</span>
        <span
          style={{
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {group.label}
        </span>
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
              {group.items.map((item) => {
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
                    <ItemIcon
                      size={15}
                      style={{
                        flexShrink: 0,
                        color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                      }}
                    />
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
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
