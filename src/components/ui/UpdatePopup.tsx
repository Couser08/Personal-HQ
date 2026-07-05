import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDeviceWatch, IconSitemap, IconListCheck, IconSparkles } from '@tabler/icons-react';

const APP_VERSION = '0.9.9';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconDeviceWatch className="w-5 h-5 stroke-[1.75]" />,
    color: '#FF9500', // iOS Orange
    bg: 'rgba(255, 149, 0, 0.08)',
    title: 'Global Pomodoro Engine',
    desc: 'Centralized focus session tracking with streaks, customizable break intervals, automated task log binding, and dynamic Picture-in-Picture display.',
  },
  {
    icon: <IconSitemap className="w-5 h-5 stroke-[1.75]" />,
    color: '#007AFF', // iOS Blue
    bg: 'rgba(0, 122, 255, 0.08)',
    title: 'Interactive Mind Mapping',
    desc: 'A gorgeous canvas to brainstorm, collapse branches, customize outline styles, upload JSON imports, and auto-assign distinct colors hierarchically.',
  },
  {
    icon: <IconListCheck className="w-5 h-5 stroke-[1.75]" />,
    color: '#34C759', // iOS Green
    bg: 'rgba(52, 199, 89, 0.08)',
    title: 'Premium Journal & Tools',
    desc: 'An upgraded All-in-One Calc tab, modernized Study Tracker with vertical flashcards, and a simplified rich-text Apple-style Journal editor.',
  },
];

const WHATS_NEW = [
  'Bumped to Final Release v0.9.9 with extensive App Tour improvements',
  'Created a beautiful, collapsible node-based Mindmap with dynamic edge styling and JSON imports',
  'Integrated an All-in-One Standard Arithmetic Calculator alongside the Interest Calculator',
  'Redesigned the Study Tracker flashcards to feature a minimal vertical profile',
  'Upgraded the Journal to a streamlined Apple-style rich text notebook without forced splits',
  'Resolved PiP Pomodoro window white outlines and long-text vertical wrapping bugs',
];

// ── Mini notification card (shown first) ──────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 35, scale: 0.92, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 25, scale: 0.92, filter: 'blur(4px)' }}
      transition={{ type: 'spring', damping: 24, stiffness: 280, mass: 0.9 }}
      className="bg-white/80 dark:bg-[#1c1c1e]/75 backdrop-blur-2xl border border-stone-200/40 dark:border-white/[0.06] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] rounded-[26px] p-5 w-[340px] relative overflow-hidden antialiased"
    >
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-4 right-4 p-1.5 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 cursor-pointer"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col gap-5 w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-[0_6px_20px_rgba(0,122,255,0.3)] shrink-0">
            <IconSparkles className="w-5 h-5 text-white stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-text-primary tracking-tight leading-tight">System Update</h3>
            <p className="text-[12px] text-text-secondary font-medium mt-0.5">Version {APP_VERSION} is ready.</p>
          </div>
        </div>

        <div className="flex gap-2.5 items-center w-full">
          <button
            onClick={onDismiss}
            className="h-9 px-4.5 text-xs font-bold text-text-secondary bg-surface-alt hover:bg-surface-hover dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-all active:scale-95 shrink-0 cursor-pointer"
          >
            Later
          </button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExpand}
            className="flex-1 h-9 px-4 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full shadow-[0_4px_12px_rgba(0,122,255,0.2)] transition-colors text-center cursor-pointer"
          >
            See What's New
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Full modal ─────────────────────────────────────────────────────────────────
function FullModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xl z-40"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 35 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 35 }}
          transition={{ type: 'spring', damping: 30, stiffness: 240, mass: 0.95 }}
          className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-3xl border border-stone-200/50 dark:border-white/[0.06] rounded-[32px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.4)] w-full max-w-xl pointer-events-auto relative overflow-hidden flex flex-col text-text-primary max-h-[85vh] antialiased"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 z-10 cursor-pointer"
          >
            <IconX className="w-4 h-4" />
          </button>

          {/* Scroll container wrapper fixed with full child layouts */}
          <div className="p-6 md:p-9 overflow-y-auto flex-1 scrollbar-none w-full flex flex-col items-center">
            <div className="mb-8 text-center flex flex-col items-center w-full">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-[0_8px_24px_rgba(0,122,255,0.3)] mb-4">
                <IconSparkles className="w-8 h-8 text-white stroke-[2]" />
              </div>
              <h2 className="text-[24px] sm:text-[26px] font-extrabold tracking-tight text-text-primary leading-tight mb-2">
                What's New in {APP_VERSION}
              </h2>
              <p className="text-[13px] text-text-secondary leading-relaxed w-full max-w-[440px]">
                A premium release introducing collapsible Mindmaps, a robust global Pomodoro engine, a standard Calculator, and overall optimization changes.
              </p>
            </div>

            {/* Features Row Stack - Enforced broad stretching block layouts */}
            <div className="space-y-4 mb-8 w-full block">
              {FEATURES.map(f => (
                <motion.div 
                  key={f.title} 
                  className="flex items-start gap-4 p-4 rounded-[22px] bg-black/[0.03] dark:bg-white/[0.03] border border-transparent hover:border-stone-200/40 dark:hover:border-white/[0.05] hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-all duration-200 w-full"
                  whileHover={{ scale: 1.005 }}
                >
                  <div
                    className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm border border-black/[0.02] dark:border-white/[0.02]"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div className="pt-0.5 flex-1 min-w-0">
                    <p className="font-bold text-[15px] text-text-primary mb-0.5 truncate">{f.title}</p>
                    <p className="text-[13px] text-text-secondary leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Change Log Sub-card - Fixed width mapping parameters */}
            <div className="bg-surface-alt/50 dark:bg-white/[0.02] border border-border dark:border-white/[0.04] rounded-[24px] p-5 mb-8 w-full">
              <h3 className="font-bold text-[10px] mb-3.5 uppercase tracking-widest text-text-muted">Changelog Details</h3>
              <ul className="space-y-3 w-full">
                {WHATS_NEW.map(item => (
                  <li key={item} className="flex items-start gap-3 text-[13px] text-text-secondary font-medium w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0 shadow-[0_0_8px_rgba(0,122,255,0.4)]" />
                    <span className="leading-relaxed flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Button Layout Stretch Block */}
            <div className="flex justify-center w-full">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="py-3 px-10 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full shadow-[0_6px_20px_rgba(0,122,255,0.25)] transition-colors w-full md:w-auto cursor-pointer"
              >
                Continue
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main exported component ────────────────────────────────────────────────────
export function UpdatePopup() {
  const [step, setStep] = useState<'hidden' | 'mini' | 'full'>('hidden');

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== APP_VERSION) {
      const timer = setTimeout(() => setStep('mini'), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setStep('hidden');
  };

  const expand = () => setStep('full');

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="pointer-events-auto">
              <MiniCard onExpand={expand} onDismiss={dismiss} />
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {step === 'full' && <FullModal onClose={dismiss} />}
      </AnimatePresence>
    </>
  );
}