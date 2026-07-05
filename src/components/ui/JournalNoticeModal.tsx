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
          {/* Backdrop blur - Darker tint for high contrast premium pop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[10000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[10001] flex items-center justify-center p-5 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
              className="bg-white/90 dark:bg-stone-900/90 border border-stone-200/50 dark:border-stone-800/60 rounded-[28px] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] w-full max-w-[360px] pointer-events-auto text-center backdrop-blur-2xl flex flex-col items-center gap-6 relative overflow-hidden antialiased"
            >
              {/* Radial premium gradient bloom background */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header Close button - Refined alignment */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 border border-stone-200/20 dark:border-stone-700/30"
                aria-label="Close"
              >
                <IconX size={15} className="stroke-[2.5]" />
              </button>

              {/* Icon Container - Squircle geometry with realistic drop shadow */}
              <div className="w-16 h-16 rounded-[22px] bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm border border-amber-500/10 mt-3 shrink-0">
                <IconBook className="w-8 h-8 stroke-[1.75]" />
              </div>

              {/* Content Block - Fixed layouts to take full component width evenly */}
              <div className="w-full flex flex-col gap-2.5 px-1">
                <h3 className="text-[17px] font-bold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                  Journal Redesign In Progress
                </h3>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                  We are rewriting our Journal feature from the ground up to bring you a premium, Apple-style rich-text notebook. The module has been temporarily removed during this phase. 
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-extrabold uppercase tracking-widest mt-2 leading-none">
                  Thank you for your patience!
                </p>
              </div>

              {/* Primary Call-to-action Button - Fluid width fix with active micro-scaling */}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-2xl text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all duration-200 shadow-md shadow-stone-950/10 dark:shadow-stone-50/5 cursor-pointer"
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