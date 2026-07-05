import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconX, 
  IconSparkles, 
  IconBrush, 
  IconTerminal, 
  IconCommand, 
  IconPdf 
} from '@tabler/icons-react';

const APP_VERSION = '1.0.0';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconBrush className="w-5 h-5 stroke-[2]" />,
    color: '#FF2D55', // Apple Pink/Red
    bg: 'rgba(255, 45, 85, 0.08)',
    title: 'Drawing Canvas Workspace',
    desc: 'Express ideas visually with our premium full-featured digital whiteboard. Draw diagrams, save/load sketches, use custom pen styles, and color matching.',
  },
  {
    icon: <IconTerminal className="w-5 h-5 stroke-[2]" />,
    color: '#5856D6', // Apple Purple
    bg: 'rgba(88, 86, 214, 0.08)',
    title: 'Coder Hub & Sprint Manager',
    desc: 'Manage sprints, DSA questions, TIL learning logs, resource bookmarks, and development goals with a dedicated tracking dashboard.',
  },
  {
    icon: <IconCommand className="w-5 h-5 stroke-[2]" />,
    color: '#007AFF', // Apple Blue
    bg: 'rgba(0, 122, 255, 0.08)',
    title: 'Universal Command Palette',
    desc: 'Access any tool instantly. Press Cmd/Ctrl + K to search files, open modules, trigger Pomodoro sessions, or create mindmaps globally.',
  },
  {
    icon: <IconPdf className="w-5 h-5 stroke-[2]" />,
    color: '#AF52DE', // Apple Violet
    bg: 'rgba(175, 82, 222, 0.08)',
    title: 'Premium PDF Document Reader',
    desc: 'Attach PDF document guidelines or papers directly to mindmap nodes and view them inside the app with a dark-mode modal reader.',
  },
];

const HIGHLIGHTS = [
  'Full release 1.0.0 featuring a robust Drawing Whiteboard module',
  'Integrated Coder Hub to streamline software development workflows',
  'Global Command Palette command finder (Cmd/Ctrl + K)',
  'Apple-style document viewer modal for PDF node attachments',
  'Zen Fullscreen mode, node search, and child auto-grouping on mindmap imports',
  'Modern flat Todo card designs with compact HSL outlines'
];

interface UpdatePopupProps {
  onExpand: () => void;
  onDismiss: () => void;
}

function MiniCard({ onExpand, onDismiss }: UpdatePopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.93, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 30, scale: 0.93, filter: 'blur(5px)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 290 }}
      className="bg-white dark:bg-[#1c1c1e] border border-stone-200/50 dark:border-white/[0.06] shadow-[0_24px_64px_rgba(0,0,0,0.22)] rounded-[24px] p-5 w-[330px] relative overflow-hidden antialiased"
    >
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#007AFF]/8 rounded-full blur-2xl pointer-events-none" />

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-4.5 right-4.5 p-1 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex flex-col gap-4.5 w-full">
        <div className="flex items-center gap-4 w-full">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF2D55] to-[#5856D6] flex items-center justify-center shadow-[0_6px_16px_rgba(255,45,85,0.25)] shrink-0">
            <IconSparkles className="w-5 h-5 text-white stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-[14px] text-text-primary tracking-tight leading-tight">Version {APP_VERSION}</h3>
            <p className="text-[11px] text-text-secondary font-semibold mt-0.5">The major upgrade is here.</p>
          </div>
        </div>

        <div className="flex gap-2 items-center w-full">
          <button
            onClick={onDismiss}
            className="h-8.5 px-4 text-[11px] font-bold text-text-secondary bg-surface-alt hover:bg-surface-hover dark:bg-white/5 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={onExpand}
            className="flex-1 h-8.5 px-4 text-[11px] font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full shadow-sm transition-colors text-center cursor-pointer"
          >
            See Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FullModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200]"
      />

      <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          className="bg-white dark:bg-[#1c1c1e] border border-stone-200/50 dark:border-white/[0.06] rounded-[28px] shadow-[0_32px_80px_rgba(0,0,0,0.35)] w-full max-w-xl pointer-events-auto relative overflow-hidden flex flex-col text-text-primary max-h-[90vh] antialiased"
        >
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#007AFF]/5 rounded-full blur-3xl pointer-events-none" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 rounded-full text-text-muted hover:bg-black/5 dark:hover:bg-white/10 transition-colors z-10 cursor-pointer"
          >
            <IconX className="w-4 h-4" />
          </button>

          <div className="p-6 md:p-8 overflow-y-auto flex-1 scrollbar-none w-full flex flex-col items-center">
            <div className="mb-6 text-center flex flex-col items-center w-full">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF2D55] to-[#5856D6] shadow-[0_8px_24px_rgba(255,45,85,0.25)] mb-4">
                <IconSparkles className="w-7 h-7 text-white stroke-[2]" />
              </div>
              <h2 className="text-[22px] sm:text-[24px] font-black tracking-tight text-text-primary leading-tight mb-2">
                Personal HQ {APP_VERSION}
              </h2>
              <p className="text-[12px] text-text-secondary leading-relaxed w-full max-w-[420px] font-medium">
                Our biggest upgrade yet. We've added robust workspaces, designerWhiteboards, and developer command suites for a premium, unified experience.
              </p>
            </div>

            {/* Features Row Stack */}
            <div className="space-y-3.5 mb-6.5 w-full block">
              {FEATURES.map(f => (
                <div 
                  key={f.title} 
                  className="flex items-start gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-white/[0.02] border border-border/40 dark:border-white/[0.03] transition-colors w-full"
                >
                  <div
                    className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border border-black/[0.02] dark:border-white/[0.02]"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div className="pt-0.5 flex-1 min-w-0">
                    <p className="font-extrabold text-[13.5px] text-text-primary mb-0.5 truncate">{f.title}</p>
                    <p className="text-[12px] text-text-secondary leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Changelog list */}
            <div className="bg-stone-50/50 dark:bg-white/[0.01] border border-border/40 dark:border-white/[0.03] rounded-2xl p-4.5 mb-7 w-full">
              <h3 className="font-black text-[9px] mb-3 uppercase tracking-widest text-text-muted">Changelog Summary</h3>
              <ul className="space-y-2.5 w-full">
                {HIGHLIGHTS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[11.5px] text-text-secondary font-semibold w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                    <span className="leading-relaxed flex-1">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="py-2.5 px-8 text-xs font-bold text-white bg-[#007AFF] hover:bg-[#0066CC] rounded-full transition-colors w-full cursor-pointer shadow-sm text-center"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

export function UpdatePopup() {
  const [step, setStep] = useState<'hidden' | 'mini' | 'full'>('hidden');

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== APP_VERSION) {
      const timer = setTimeout(() => setStep('mini'), 1500);
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