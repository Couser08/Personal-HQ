import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconDeviceWatch, IconSitemap, IconListCheck, IconSparkles } from '@tabler/icons-react';

const APP_VERSION = '0.9.8';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconDeviceWatch className="w-5 h-5" />,
    color: '#FF9500', // iOS Orange
    bg: 'rgba(255, 149, 0, 0.1)',
    title: 'Global Pomodoro Engine',
    desc: 'Centralized focus session tracking with streaks, customizable break intervals, automated task log binding, and dynamic Picture-in-Picture display.',
  },
  {
    icon: <IconSitemap className="w-5 h-5" />,
    color: '#007AFF', // iOS Blue
    bg: 'rgba(0, 122, 255, 0.1)',
    title: 'Interactive Mind Mapping',
    desc: 'A gorgeous canvas to brainstorm, collapse branches, customize colors, set parent-child relationships, and map your ideas structurally.',
  },
  {
    icon: <IconListCheck className="w-5 h-5" />,
    color: '#34C759', // iOS Green
    bg: 'rgba(52, 199, 89, 0.1)',
    title: 'Supercharged Todos',
    desc: 'Specify exact start/end times for items, utilize updated schema migrations, and enjoy refined sorting filters and faster rendering.',
  },
];

const WHATS_NEW = [
  'Implemented a full Pomodoro dashboard and background state sync',
  'Created a beautiful, collapsible node-based Mindmap workspace',
  'Added startTime and endTime properties to Todos with updated database schemas',
  'Integrated the custom AppLogo branding assets across modules',
  'Eliminated store selector lags by implementing Zustand useShallow',
  'Refined modal interactions and removed duplicate ConfirmDialog setups',
];

// ── Mini notification card (shown first) ──────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 260 }}
      className="bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-[24px] p-4.5 w-[330px] relative overflow-hidden"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3.5 right-3.5 p-1 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <IconX className="w-4 h-4" />
      </button>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-[0_4px_12px_rgba(0,122,255,0.25)] shrink-0">
            <IconSparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-text-primary tracking-tight">System Update</h3>
            <p className="text-xs text-text-secondary">Version {APP_VERSION} is ready.</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-xs font-bold text-text-secondary bg-surface-alt hover:bg-surface-hover rounded-full transition-colors shrink-0"
          >
            Later
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onExpand}
            className="flex-1 py-2 px-4 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full shadow-[0_2px_8px_rgba(0,122,255,0.2)] transition-colors text-center"
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
        className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xl z-40"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="bg-white/80 dark:bg-[#1c1c1e]/85 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[32px] shadow-[0_32px_80px_rgba(0,0,0,0.25)] w-full max-w-2xl pointer-events-auto relative overflow-hidden flex flex-col text-text-primary max-h-[90vh]"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 p-2 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-10 overflow-y-auto flex-1">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-[0_8px_24px_rgba(0,122,255,0.3)] mb-5">
                <IconSparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                What's New in {APP_VERSION}
              </h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto">
                A premium release introducing collapsible Mindmaps, a robust global Pomodoro engine, and overall optimization changes.
              </p>
            </div>

            <div className="space-y-6 mb-10">
              {FEATURES.map(f => (
                <motion.div 
                  key={f.title} 
                  className="flex items-start gap-4 p-4 rounded-[20px] bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div className="pt-0.5">
                    <p className="font-bold text-base text-text-primary mb-1">{f.title}</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-surface-alt/60 border border-border rounded-[24px] p-6 mb-10">
              <h3 className="font-bold text-xs mb-4 uppercase tracking-wider text-text-muted">Changelog Details</h3>
              <ul className="space-y-3">
                {WHATS_NEW.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="py-3 px-10 text-sm font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full shadow-[0_4px_16px_rgba(0,122,255,0.25)] transition-colors w-full md:w-auto"
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
      // Show mini card after 2s
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
