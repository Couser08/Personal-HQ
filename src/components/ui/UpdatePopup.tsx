import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconMovie, IconListCheck, IconCode } from '@tabler/icons-react';

const APP_VERSION = '0.9.1';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconMovie className="w-5 h-5" />,
    color: '#007AFF', // iOS Blue
    bg: 'rgba(0, 122, 255, 0.1)',
    title: 'Media Log Overhaul',
    desc: 'Completely redesigned Media Log with Apple-style glassmorphism, fluid micro-interactions, and flawless tab switching.',
  },
  {
    icon: <IconListCheck className="w-5 h-5" />,
    color: '#FF2D55', // iOS Pink
    bg: 'rgba(255, 45, 85, 0.1)',
    title: 'To-Do Supercharged',
    desc: 'Interactive date pickers, calendar & board views, priority filters, and a beautiful new project creation modal.',
  },
  {
    icon: <IconCode className="w-5 h-5" />,
    color: '#5856D6', // iOS Purple
    bg: 'rgba(88, 86, 214, 0.1)',
    title: 'Code Vault Syntax',
    desc: 'Robust syntax highlighting with beautiful fallback themes and custom language mappings (C++, C#, etc).',
  },
];

const WHATS_NEW = [
  'Apple-inspired minimal design language across all new popups',
  'Fluid glassmorphism effects on modals and floating UI',
  'Month navigation (back/forward) added to To-Do Date Picker',
  'Board view for To-Do list with drag-and-drop aesthetics',
  'Dedicated Trash section for deleted tasks',
  'Flawless tab switching between Anime and Games',
  'Micro-interactions and spring animations for task completion',
  'Premium custom Project Creation modal in To-Do List',
];

// ── Mini notification card (shown first) ──────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className="bg-surface/80 backdrop-blur-xl border border-border shadow-high rounded-[24px] p-4 w-[320px] relative overflow-hidden"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1.5 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <IconX className="w-4 h-4" />
      </button>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-black text-sm tracking-widest">v0.9</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-text-primary">Update Installed</h3>
            <p className="text-xs text-text-secondary truncate">Version {APP_VERSION} is here.</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-xs font-bold text-text-secondary bg-surface-alt hover:bg-surface-hover rounded-full transition-colors shrink-0"
          >
            Later
          </button>
          <button
            onClick={onExpand}
            className="flex-1 py-2 px-4 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full transition-colors text-center"
          >
            See What's New
          </button>
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
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-surface/90 backdrop-blur-2xl border border-border rounded-[32px] shadow-2xl w-full max-w-2xl pointer-events-auto relative overflow-hidden flex flex-col md:flex-row text-text-primary"
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-2 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="p-8 md:p-10 flex-1 overflow-y-auto max-h-[80vh]">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-[#007AFF] to-[#5856D6] shadow-lg mb-5">
                <span className="text-white font-black text-2xl tracking-tight">HQ</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">
                What's New in {APP_VERSION}
              </h2>
              <p className="text-sm text-text-secondary max-w-sm mx-auto">
                A massive update focusing on Apple-inspired design aesthetics, fixing bugs, and improving module workflows.
              </p>
            </div>

            <div className="space-y-6 mb-10">
              {FEATURES.map(f => (
                <div key={f.title} className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-base text-text-primary mb-1">{f.title}</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-surface-alt/50 border border-border rounded-[24px] p-6 mb-8">
              <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-text-muted">Changelog</h3>
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
              <button
                onClick={onClose}
                className="py-3 px-8 text-sm font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full transition-colors shadow-md w-full md:w-auto"
              >
                Continue
              </button>
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
