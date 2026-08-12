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
const PRIMARY     = '#f43f5e';

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
            className="pointer-events-auto flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-2xl"
            style={{
              background: '#111111',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
              willChange: 'transform, opacity',
            }}
          >
            {/* Icon */}
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: `${PRIMARY}18`, border: `1px solid ${PRIMARY}28` }}
            >
              <IconRocket size={14} style={{ color: PRIMARY }} strokeWidth={1.8} />
            </div>

            {/* Text */}
            <div className="flex flex-col leading-none">
              <span className="text-[11px] font-bold text-white">v{VERSION} — What's New</span>
              <span className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Calendar · Habits redesign · Changelog
              </span>
            </div>

            {/* CTA */}
            <button
              onClick={open}
              className="ml-1 px-2.5 h-6 text-[10px] font-bold text-white rounded-lg cursor-pointer transition-all active:scale-[0.94]"
              style={{ background: PRIMARY }}
            >
              View
            </button>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Dismiss"
              className="w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
            >
              <IconX size={11} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}