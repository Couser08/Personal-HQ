import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { IconX } from '@tabler/icons-react';

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
  bodyClassName = 'p-4'
}: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`bg-surface text-text-primary border border-border rounded-xl shadow-2xl w-[94vw] sm:w-full min-w-[320px] sm:min-w-[400px] ${maxWidthClassName} max-h-[90vh] overflow-y-auto pointer-events-auto flex flex-col`}
            >
              <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-surface z-10 text-text-primary">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label="Close modal"
                >
                  <IconX className="w-5 h-5" />
                </button>
              </div>
              <div className={bodyClassName}>
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
