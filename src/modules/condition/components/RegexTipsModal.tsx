import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconSparkles } from '@tabler/icons-react';

export function RegexTipsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl pointer-events-auto"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-[28px] p-6 shadow-2xl w-full max-w-[480px] pointer-events-auto text-left flex flex-col max-h-[85vh] relative overflow-hidden z-10"
          >
            {/* Decorative glow bloom */}
            <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-16 bg-primary/10 blur-3xl" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute z-20 flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-full cursor-pointer top-4 right-4 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active:scale-90 border-stone-200/20 dark:border-stone-700/30"
            >
              <IconX size={15} className="stroke-[2.5]" />
            </button>

            <div className="z-10 flex-1 w-full pr-1 mt-2 space-y-5 overflow-y-auto scrollbar-none">
              <div className="flex flex-col items-start w-full gap-2">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconSparkles className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary tracking-tight leading-tight">
                    Regular Expression Guide
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    Cheat sheet for building powerful condition checking rules.
                  </p>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex flex-col gap-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Common Operators</h3>
                
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                    <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">^</code>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-text-primary">Start Anchor</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Asserts that matches must start at the beginning of the text string. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">^abc</code> matches "abc" but not "xyzabc".</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                    <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">$</code>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-text-primary">End Anchor</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Asserts that matches must end at the absolute end of the text string. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">abc$</code> matches "xyzabc" but not "abcxyz".</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                    <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">[ ]</code>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-text-primary">Character Set</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Matches any single character inside the brackets. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">[abc]</code> matches "a", "b", or "c". Range <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">[0-9]</code> matches digits.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                    <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">( )</code>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-text-primary">Capture Group</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Groups multiple characters together to evaluate as a single unit or apply quantifiers. E.g., <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">(abc)+</code> matches "abc", "abcabc", etc.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-surface-alt/40 border border-border/45">
                    <code className="bg-black/10 dark:bg-black/25 px-2 py-0.5 rounded font-mono text-xs font-bold text-primary shrink-0">* , + , ?</code>
                    <div className="ml-3">
                      <p className="text-xs font-bold text-text-primary">Quantifiers</p>
                      <p className="text-[11px] text-text-secondary mt-0.5"><code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">*</code> matches 0 or more times, <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">+</code> matches 1 or more times, and <code className="font-mono bg-black/10 dark:bg-black/20 px-1 rounded">?</code> makes the preceding character optional.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-2">Why use Regex in Rules?</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">
                  Standard equals/contains checks match static strings. Regex lets you validate complex structural patterns dynamically (e.g., verifying email layouts, validating formatting, extracting numbers, or making rules match-agnostic).
                </p>
              </div>
            </div>

            <div className="z-10 w-full pt-3 mt-4 border-t border-border/40">
              <button
                onClick={onClose}
                className="w-full py-3 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-2xl text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all cursor-pointer text-center border-none"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
