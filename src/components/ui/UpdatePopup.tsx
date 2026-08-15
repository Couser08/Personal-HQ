/**
 * UpdatePopup — Lightweight "new release" dot-badge notification.
 *
 * Replaces the old popup/sheet. Shows a minimal pill once per version
 * that navigates the user to the dedicated Changelog page on click.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconRocket } from '@tabler/icons-react';
import { useAppStore } from '../../store/useAppStore';

const VERSION     = '4.1.0';
const STORAGE_KEY = 'phq_whatsnew_v410_seen';

export function UpdatePopup() {
  const [visible, setVisible] = useState(false);
  const setActiveModule = useAppStore(s => s.setActiveModule);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const open = () => {
    dismiss();
    setActiveModule('changelog' as never);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 10,  scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-2xl bg-surface border border-border shadow-float text-text-primary backdrop-blur-xl"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary/10 text-primary border border-primary/20"
            >
              <IconRocket size={14} strokeWidth={1.8} />
            </div>

            {/* Text */}
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold text-text-primary">v{VERSION} — What's New</span>
              <span className="text-[10px] mt-0.5 text-text-secondary">
                Calendar · Habits redesign · Changelog
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={open}
              className="ml-1 px-3 h-7 text-[11px] font-bold bg-primary text-text-on-accent rounded-xl cursor-pointer transition-all active:scale-[0.94] hover:opacity-90 shadow-sm"
            >
              View
            </button>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer text-text-muted hover:text-text-primary hover:bg-surface-alt transition-colors"
            >
              <IconX size={12} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}