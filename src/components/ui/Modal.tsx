import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { IconX } from '@tabler/icons-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidthClassName?: string;
  bodyClassName?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidthClassName = 'max-w-2xl',
  bodyClassName = 'p-6'
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        previousActiveElement?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      if (!modalRef.current) return;

      const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]';
      const focusableElements = modalRef.current.querySelectorAll(focusableSelector);
      const elements = Array.from(focusableElements) as HTMLElement[];
      if (elements.length === 0) return;

      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus: Focus autofocus element or first focusable element
    const autofocusEl = modalRef.current?.querySelector('[autofocus]') as HTMLElement | null;
    if (autofocusEl) {
      autofocusEl.focus();
    } else {
      const firstFocusable = modalRef.current?.querySelector(
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
      ) as HTMLElement | null;
      firstFocusable?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backer Overlay (Pure Premium Glassmorphism) */}
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ willChange: 'opacity' }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-50 transition-all duration-300 pointer-events-auto"
          />

          {/* Modal Centering Wrapper: Bottom Sheet on Mobile, Centered Card on Desktop */}
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none p-0 sm:p-6 pb-0 sm:pb-6">
            <motion.div
              ref={modalRef}
              key="modal-content"
              data-component="Modal"
              data-bug-target="modal-dialog"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 30 }}
              // Snappy spring setup
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              style={{ willChange: 'transform, opacity' }}
              className={`bg-surface text-text-primary border border-border/70 rounded-t-[28px] sm:rounded-[var(--radius-card)] rounded-b-none sm:rounded-b-[var(--radius-card)] shadow-[var(--shadow-float)] w-full ${maxWidthClassName || 'max-w-2xl'} max-h-[88dvh] overflow-hidden pointer-events-auto flex flex-col backdrop-blur-xl`}
            >
              {/* Mobile Drag Indicator Handle */}
              <div className="sm:hidden flex justify-center pt-2.5 pb-1">
                <div className="w-10 h-1 rounded-full bg-border-alt" />
              </div>

              {/* Header Grid System */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-border/50 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight text-text-primary">
                  {title}
                </h2>
                
                {/* Micro Minimal Close Pill */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-alt text-text-secondary hover:text-text-primary hover:scale-105 active:scale-95 transition-all cursor-pointer border border-border/50"
                  aria-label="Close modal"
                >
                  <IconX className="w-4 h-4" style={{ strokeWidth: 2.2 }} />
                </button>
              </div>

              {/* Dynamic Scroll Body Surface */}
              <div className={`${bodyClassName} flex-1 overflow-y-auto custom-scrollbar text-[14px] leading-relaxed font-medium text-text-secondary p-4 sm:p-6`}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};