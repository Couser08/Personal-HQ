import { useState, useRef, useEffect, useId } from 'react';
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
  className?: string;
  /** Controls width of the trigger — defaults to w-full */
  triggerClassName?: string;
}

/**
 * A fully custom, animated dropdown that matches the app design system.
 * Keyboard-accessible: ArrowUp/Down, Enter, Escape.
 */
export function CustomSelect({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select…',
  triggerClassName = 'w-full',
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selected = options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset highlighted when open changes
  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      setHighlighted(idx >= 0 ? idx : 0);
    }
  }, [open]); // eslint-disable-line

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted(h => Math.min(h + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlighted >= 0) {
        onChange(options[highlighted].value);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${triggerClassName}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKey}
        className={[
          'flex items-center justify-between gap-3',
          'w-full px-4 py-2.5 rounded-xl',
          'bg-surface-alt border transition-all duration-150',
          'text-sm font-medium text-left cursor-pointer',
          'focus:outline-none',
          open
            ? 'border-primary ring-2 ring-primary/20 text-text-primary'
            : 'border-border-alt text-text-primary hover:border-border hover:bg-surface-hover',
        ].join(' ')}
      >
        <span className={selected ? 'text-text-primary' : 'text-text-muted'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 400 }}
          className="shrink-0 text-text-muted"
        >
          <IconChevronDown className="w-4 h-4" aria-hidden="true" />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label="Options"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 400 }}
            className={[
              'absolute z-50 mt-2 w-full',
              'bg-surface border border-border rounded-2xl',
              'py-1.5 overflow-hidden',
              'max-h-64 overflow-y-auto',
            ].join(' ')}
            style={{
              boxShadow: '0 8px 32px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.12)',
              // Ensure panel drops downward or above based on available space
            }}
          >
            {options.map((opt, idx) => {
              const isSelected = opt.value === value;
              const isHighlighted = idx === highlighted;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseDown={e => e.preventDefault()} // keep focus on trigger
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  onMouseEnter={() => setHighlighted(idx)}
                  className={[
                    'flex items-center justify-between gap-3',
                    'px-4 py-2.5 text-sm cursor-pointer select-none',
                    'transition-colors duration-75',
                    isHighlighted
                      ? 'bg-surface-hover text-text-primary'
                      : 'text-text-secondary',
                    isSelected ? 'font-semibold text-primary' : '',
                  ].join(' ')}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <IconCheck className="w-4 h-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
