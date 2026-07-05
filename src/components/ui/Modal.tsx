import { AnimatePresence, motion } from 'framer-motion';
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
  maxWidthClassName = 'max-w-xl',
  bodyClassName = 'p-6'
}: ModalProps) => {
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-50 transition-all duration-300 pointer-events-auto"
          />

          {/* Modal Centering Wrapper */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4 sm:p-6">
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              // Apple's custom snappy spring setup
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className={`bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] w-[94vw] sm:w-full min-w-[320px] ${maxWidthClassName} max-h-[85vh] overflow-y-auto pointer-events-auto flex flex-col backdrop-blur-xl`}
            >
              {/* Header Grid System */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 dark:border-zinc-800/50 sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
                <h2 className="text-lg font-bold tracking-[-0.3px] text-zinc-900 dark:text-zinc-50">
                  {title}
                </h2>
                
                {/* Micro Minimal Close Pill */}
                <button
                  onClick={onClose}
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-zinc-200/20"
                  aria-label="Close modal"
                >
                  <IconX className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
                </button>
              </div>

              {/* Dynamic Scroll Body Surface */}
              <div className={`${bodyClassName} flex-1 overflow-y-auto custom-scrollbar text-[14px] leading-relaxed font-medium text-zinc-600 dark:text-zinc-300`}>
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