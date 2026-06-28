import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconLayoutDashboard, IconBolt, IconShieldCheck, IconSparkles } from '@tabler/icons-react';
import rocketImg from '../../assets/rocket_update.png';

const APP_VERSION = '0.7.0';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconLayoutDashboard className="w-5 h-5" />,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.1)',
    title: 'Pomodoro Timer',
    desc: 'Professional focus timer with SVG ring, session tracking, and auto-advance.',
  },
  {
    icon: <IconBolt className="w-5 h-5" />,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'Rich Text Notes',
    desc: 'Bold, italic, highlights, bullet lists, numbered lists, headings & more.',
  },
  {
    icon: <IconShieldCheck className="w-5 h-5" />,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    title: '12 Countdown Templates',
    desc: 'All templates rebuilt — Gradient, Flip, Split, Circle, Event, Sale and more.',
  },
];

const WHATS_NEW = [
  'Pomodoro timer with Apple Watch design',
  'Rich text editor for Notes',
  'Code Snippet Vault module',
  '12 Countdown display templates',
  'Settings page rebuilt',
  'Apple HIG accessibility pass',
  'Focus rings & ARIA labels',
  'Dark / Light mode improvements',
];

// ── Mini notification card (shown first) ──────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      className="bg-surface border border-border rounded-2xl shadow-high p-4 w-[300px] relative overflow-hidden"
    >
      {/* subtle gradient top bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-pink-400 to-rose-300" />

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-3 right-3 p-1 rounded-md text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors"
      >
        <IconX className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-rose-500/20 to-pink-500/10 flex items-center justify-center">
          <img src={rocketImg} alt="Update" className="w-10 h-10 object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-text-primary">New Features Shipped</h3>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <p className="text-xs text-text-secondary mt-0.5">v{APP_VERSION} is now available.</p>
          <p className="text-xs text-text-muted">Enjoy new features &amp; improvements.</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={onDismiss}
          className="flex-1 py-2 text-xs font-semibold text-text-secondary border border-border rounded-xl hover:bg-surface-hover transition-colors"
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="flex-1 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-muted rounded-xl transition-colors"
        >
          Update Now
        </button>
      </div>
    </motion.div>
  );
}

// ── Full modal ─────────────────────────────────────────────────────────────────
function FullModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="bg-surface border border-border rounded-3xl shadow-high w-full max-w-4xl pointer-events-auto overflow-hidden relative"
        >
          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-pink-400 to-rose-300" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:bg-surface-hover hover:text-text-primary transition-colors z-10"
          >
            <IconX className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Left: illustration */}
            <div className="md:w-64 shrink-0 flex items-center justify-center p-8 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent">
              <img
                src={rocketImg}
                alt="Personal HQ Update"
                className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-lg"
              />
            </div>

            {/* Center: changelog */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 border-t md:border-t-0 md:border-l border-border">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    Version {APP_VERSION}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">New Features Shipped</h2>
                <p className="text-sm text-text-secondary mt-1">
                  We've shipped new features to your Personal HQ. Enjoy improvements and new capabilities!
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: f.bg, color: f.color }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{f.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: What's New */}
            <div className="md:w-56 shrink-0 p-6 md:p-8 bg-surface-alt border-t md:border-t-0 md:border-l border-border flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <IconSparkles className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-text-primary">What's New</h3>
              </div>
              <ul className="flex flex-col gap-2">
                {WHATS_NEW.map(item => (
                  <li key={item} className="flex items-start gap-2 text-xs text-text-secondary leading-relaxed">
                    <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex gap-2 mt-auto pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-text-secondary border border-border rounded-xl hover:bg-surface-hover transition-colors"
                >
                  Later
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-muted rounded-xl transition-colors"
                >
                  Update Now
                </button>
              </div>
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
      {/* Mini card — bottom-right */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="pointer-events-auto">
              <MiniCard onExpand={expand} onDismiss={dismiss} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Full modal */}
      <AnimatePresence>
        {step === 'full' && <FullModal onClose={dismiss} />}
      </AnimatePresence>
    </>
  );
}
