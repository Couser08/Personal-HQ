import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconLayoutDashboard, IconBolt, IconSparkles } from '@tabler/icons-react';

const APP_VERSION = '0.8.1';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconSparkles className="w-5 h-5" />,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.1)',
    title: 'Modernised Reflections',
    desc: 'Interactive 3D metal rings, translucent text fields, and scale-animated squircle emoji mood buttons.',
  },
  {
    icon: <IconBolt className="w-5 h-5" />,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    title: 'Syntax Highlighter',
    desc: 'Prism syntax highlighting integrated into Notes editor & Study Tracker with light/dark themes.',
  },
  {
    icon: <IconLayoutDashboard className="w-5 h-5" />,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    title: 'Visual Enhancements',
    desc: 'Dynamic countdown template previews, resized custom selects, and smooth stats sparklines.',
  },
];

const WHATS_NEW = [
  'Prism syntax highlighted code blocks in Notes',
  'Syntax highlighting for Study Tracker snippets',
  'Interactive metallic binder rings with slot shadows',
  'Translucent textarea fields on warm paper journal pages',
  'Modern scale-animated squircle emoji mood selector',
  'Dynamic template previewing in Countdown Settings',
  'Wider Settings Countdown Template select element',
  'Fixed Code Vault snippet auto-selection on load',
  'Smoother Notes sparklines with safety padding margins',
  'Fixed App Onboarding and Journal empty state layouts',
];

/* ── Crisp, Theme-Aware Vector Rocket SVG ──────────────────────────────── */
const RocketSVG = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rocket-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#f1f5f9" />
      </linearGradient>
      <linearGradient id="rocket-flame" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="40%" stopColor="#f97316" />
        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="rocket-accent" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#f43f5e" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
      <radialGradient id="smoke-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Flame & Smoke Glow */}
    <circle cx="60" cy="85" r="30" fill="url(#smoke-glow)" />
    <path d="M52 75 C52 75 60 100 60 100 C60 100 68 75 68 75 Z" fill="url(#rocket-flame)" opacity="0.9" />
    <path d="M55 75 C55 75 60 90 60 90 C60 90 65 75 65 75 Z" fill="#ffca28" />

    {/* Booster Cup */}
    <path d="M52 70 H68 L66 75 H54 Z" fill="#475569" />

    {/* Side Fins */}
    <path d="M38 58 C32 66 32 76 32 76 C32 76 45 74 48 68 Z" fill="url(#rocket-accent)" />
    <path d="M82 58 C88 66 88 76 88 76 C88 76 75 74 72 68 Z" fill="url(#rocket-accent)" />

    {/* Main Body */}
    <path d="M60 20 C76 40 76 65 70 72 H50 C44 65 44 40 60 20 Z" fill="url(#rocket-body)" />

    {/* Nose Cone */}
    <path d="M60 20 C65 29 69 38 70 42 H50 C51 38 55 29 60 20 Z" fill="url(#rocket-accent)" />

    {/* Center Tail Fin */}
    <path d="M58 64 H62 V72 H58 Z" fill="#be123c" />

    {/* Circular Window */}
    <circle cx="60" cy="52" r="9" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
    <circle cx="60" cy="52" r="7" fill="#38bdf8" />
    <circle cx="58" cy="50" r="2.5" fill="#ffffff" opacity="0.8" />
    
    {/* Sparkles */}
    <circle cx="34" cy="30" r="2" fill="#f43f5e" opacity="0.6" />
    <circle cx="86" cy="40" r="1.5" fill="#f43f5e" opacity="0.5" />
    <circle cx="40" cy="88" r="2.5" fill="#f43f5e" opacity="0.4" />
  </svg>
);

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
          <RocketSVG className="w-9 h-9" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-text-primary">Update Shipped</h3>
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </div>
          <p className="text-xs text-text-secondary mt-0.5">v{APP_VERSION} is now live.</p>
          <p className="text-xs text-text-muted">Enjoy new features &amp; updates.</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 items-center">
        <button
          onClick={onDismiss}
          className="px-3 py-2 text-xs font-semibold text-text-secondary border border-border rounded-xl hover:bg-surface-hover transition-colors shrink-0"
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="flex-1 py-2 px-1 text-xs font-bold text-white bg-primary hover:bg-primary-muted rounded-xl transition-colors truncate text-center"
          title="Experience Latest Update"
        >
          Experience Latest Update
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
          className="bg-[#0c0c14] border border-white/10 rounded-3xl shadow-high w-full max-w-4xl pointer-events-auto overflow-hidden relative flex flex-col md:flex-row text-white"
        >
          {/* Close button in top-right */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 rounded-xl text-zinc-500 hover:bg-white/5 hover:text-white transition-colors z-10 cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>

          {/* Left panel: app icon & version summary */}
          <div className="md:w-72 shrink-0 bg-[#0e0e16] border-r border-white/5 flex flex-col justify-between p-8 min-h-[520px]">
            {/* Top part: App icon in squircle glow container */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 mt-4 bg-gradient-to-b from-[#1e1e30] to-[#12121a] border border-white/10 rounded-[28px] flex items-center justify-center shadow-[0_15px_45px_rgba(0,0,0,0.5),_inset_0_2px_4px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-60" />
                <RocketSVG className="w-16 h-16 drop-shadow-[0_4px_12px_rgba(168,85,247,0.3)] transform group-hover:scale-105 transition-transform duration-300" />
              </div>
            </div>

            {/* Middle part: version details */}
            <div className="my-auto py-6">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#a855f7] block">
                Release
              </span>
              <h2 className="text-3xl font-black text-white mt-1.5">
                Version {APP_VERSION}
              </h2>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                We've successfully deployed new updates to your Personal HQ. Explore what's new.
              </p>
            </div>

            {/* Bottom part: capsule badge */}
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-zinc-500 select-none uppercase tracking-wide">
                What's New <span className="text-[#a855f7] font-semibold">&gt;</span>
              </span>
            </div>
          </div>

          {/* Center panel: Highlights list & Quote box */}
          <div className="flex-1 p-8 flex flex-col justify-between bg-[#0c0c14] min-h-[520px]">
            {/* Highlights Header */}
            <div>
              <h3 className="text-base font-bold text-white mb-6">Highlights</h3>
              
              {/* Highlight Cards */}
              <div className="flex flex-col gap-6">
                {FEATURES.map(f => (
                  <div key={f.title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                      style={{ background: f.bg, color: f.color }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{f.title}</p>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote block at the bottom */}
            <div className="bg-[#12121e] border border-white/5 rounded-2xl p-4 flex gap-2.5 mt-8 select-none">
              <span className="text-2xl text-[#a855f7] font-serif leading-none">“</span>
              <p className="text-xs text-zinc-400 italic leading-relaxed flex-1">
                Small details, big impact. A smoother, smarter Personal HQ.
              </p>
              <span className="text-2xl text-[#a855f7] font-serif leading-none self-end">”</span>
            </div>
          </div>

          {/* Right panel: What's New bullet list & actions */}
          <div className="md:w-[280px] shrink-0 bg-[#08080e] border-l border-white/5 p-8 flex flex-col justify-between min-h-[520px]">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <IconSparkles className="w-4 h-4 text-[#a855f7]" />
                <h3 className="font-bold text-sm text-white">What's New</h3>
              </div>

              {/* Bullet list */}
              <ul className="flex flex-col gap-3.5 overflow-y-auto max-h-[300px] pr-2">
                {WHATS_NEW.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] mt-1.5 shrink-0 shadow-[0_0_8px_#a855f7]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/5">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-zinc-400 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                Later
              </button>
              <button
                onClick={onClose}
                className="flex-grow py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-full transition-all shadow-[0_4px_20px_rgba(124,58,237,0.3)] text-center cursor-pointer"
              >
                Explore Update
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
