import { useState, useRef, useEffect, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconChevronDown, IconCheck } from '@tabler/icons-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  /** Extra className on the root wrapper (controls width, e.g. "w-full" or "w-48") */
  className?: string;
}

/**
 * Custom animated dropdown – uses a React portal so the panel is never clipped
 * by overflow:hidden ancestors (modals, scroll containers, flex parents, etc.).
 *
 * Keyboard accessible: ↑↓ navigate, Enter/Space select, Escape close.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  className = 'w-full',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef   = useRef<HTMLUListElement>(null);
  const id = useId();

  const selected = options.find(o => o.value === value);

  /** Compute where the panel should sit (fixed-positioned, below trigger). */
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelH = Math.min(options.length * 42 + 12, 260);
    const placeAbove = spaceBelow < panelH + 8 && r.top > panelH;

    setPanelStyle({
      position: 'fixed',
      left:   r.left,
      width:  r.width,
      zIndex: 9999,
      ...(placeAbove
        ? { bottom: window.innerHeight - r.top + 4 }
        : { top:    r.bottom + 4 }),
    });
  }, [options.length]);

  /** Open / close */
  const openPanel = () => {
    computePosition();
    const idx = options.findIndex(o => o.value === value);
    setHighlighted(idx >= 0 ? idx : 0);
    setOpen(true);
  };

  const closePanel = () => setOpen(false);

  /** Close on outside click – checks both trigger and panel refs */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      ) return;
      closePanel();
    };
    // Use capture so we catch it before any stopPropagation in the tree
    document.addEventListener('mousedown', handler, true);
    window.addEventListener('scroll', closePanel, true);
    window.addEventListener('resize', () => { computePosition(); }, true);
    return () => {
      document.removeEventListener('mousedown', handler, true);
      window.removeEventListener('scroll', closePanel, true);
      window.removeEventListener('resize', computePosition, true);
    };
  }, [open, computePosition]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault(); openPanel();
      }
      return;
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlighted >= 0) { onChange(options[highlighted].value); closePanel(); }
    }
    else if (e.key === 'Escape') { closePanel(); triggerRef.current?.focus(); }
  };

  const handleSelect = (opt: SelectOption) => {
    onChange(opt.value);
    closePanel();
    triggerRef.current?.focus();
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-2 text-xs font-semibold uppercase tracking-wider text-text-secondary"
        >
          {label}
        </label>
      )}

      {/* ── Trigger ── */}
      <button
        id={id}
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => (open ? closePanel() : openPanel())}
        onKeyDown={handleKeyDown}
        className={[
          'flex items-center justify-between gap-3 w-full px-4 py-2.5 rounded-xl',
          'text-sm font-medium text-left cursor-pointer select-none',
          'border transition-all duration-150 focus:outline-none',
          open
            ? 'border-primary ring-2 ring-primary/20 bg-surface-alt text-text-primary'
            : 'border-border-alt bg-surface-alt text-text-primary hover:border-border hover:bg-surface-hover',
        ].join(' ')}
      >
        <span className={!selected ? 'text-text-muted' : ''}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 400 }}
          className="shrink-0 text-text-muted"
          aria-hidden
        >
          <IconChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      {/* ── Panel via portal so it's never clipped ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.ul
              ref={panelRef}
              id={`${id}-listbox`}
              role="listbox"
              initial={{ opacity: 0, scaleY: 0.92, y: -4 }}
              animate={{ opacity: 1, scaleY: 1,    y: 0  }}
              exit={{   opacity: 0, scaleY: 0.92, y: -4  }}
              transition={{ type: 'spring', damping: 24, stiffness: 380 }}
              style={{
                ...panelStyle,
                transformOrigin: 'top center',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-border)',
                borderRadius: 16,
                padding: '6px 0',
                maxHeight: 260,
                overflowY: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.14)',
                listStyle: 'none',
                margin: 0,
              }}
            >
              {options.map((opt, idx) => {
                const isSel  = opt.value === value;
                const isHigh = idx === highlighted;
                return (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={isSel}
                    onMouseDown={e => e.preventDefault()} // keep focus on trigger
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlighted(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '9px 16px',
                      fontSize: 14,
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontWeight: isSel ? 600 : 400,
                      color: isSel
                        ? 'var(--primary)'
                        : isHigh
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      background: isHigh
                        ? 'var(--bg-surface-hover)'
                        : 'transparent',
                      transition: 'background 60ms ease, color 60ms ease',
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSel && <IconCheck style={{ width: 14, height: 14, flexShrink: 0, color: 'var(--primary)' }} />}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
