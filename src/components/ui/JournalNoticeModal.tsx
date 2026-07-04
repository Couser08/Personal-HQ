import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBook, IconX } from '@tabler/icons-react';

export const JournalNoticeModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if the user has already seen this update popup
    const hasSeen = localStorage.getItem('journal_notice_shown_v3');
    if (!hasSeen) {
      // Small delay on startup to make it feel premium
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('journal_notice_shown_v3', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[10000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="bg-white/80 dark:bg-stone-900/80 border border-white/20 dark:border-stone-800/40 rounded-3xl p-6 shadow-2xl w-full max-w-sm pointer-events-auto text-center backdrop-blur-xl flex flex-col items-center gap-5 relative overflow-hidden"
            >
              {/* Radial warm lighting background */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Header Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <IconX size={14} />
              </button>

              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner mt-2">
                <IconBook className="w-7 h-7" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                  Journal Redesign In Progress
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  We are rewriting our Journal feature from the ground up to bring you a premium, Apple-style rich-text notebook. The module has been temporarily removed during this phase. 
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-450 font-bold uppercase tracking-wider mt-1">
                  Thank you for your patience!
                </p>
              </div>

              {/* Button */}
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md cursor-pointer mt-1"
              >
                Understood
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
