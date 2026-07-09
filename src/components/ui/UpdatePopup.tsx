import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconX, 
  IconSparkles, 
  IconFlame,
  IconClock,
  IconPalette,
  IconNotebook
} from '@tabler/icons-react';

const APP_VERSION = '1.3.3';
const STORAGE_KEY = 'phq_last_seen_version';

const FEATURES = [
  {
    icon: <IconFlame className="w-5 h-5 stroke-[2]" />,
    color: '#FF9500', // Apple Orange
    bg: 'rgba(255, 149, 0, 0.08)',
    title: 'Diverse Wavy Overlays & Minimal Mode',
    desc: 'Distinct completion animations for Pomodoro (breathing), Todo (confetti burst), and Habits (rising flames). Added a lightweight Minimal Wave mode that bypasses particle rendering to support lower-spec devices.',
  },
  {
    icon: <IconClock className="w-5 h-5 stroke-[2]" />,
    color: '#007AFF', // Apple Blue
    bg: 'rgba(0, 122, 255, 0.08)',
    title: 'Inline Subtask Creator & Verification',
    desc: 'Quickly create subtasks directly from your list. Pressing Enter now verifies and captures selected date/project metadata from the preview bar instantly instead of creating default tasks.',
  },
  {
    icon: <IconPalette className="w-5 h-5 stroke-[2]" />,
    color: '#FF2D55', // Apple Pink
    bg: 'rgba(255, 45, 85, 0.08)',
    title: 'Secure Admin Assets Management',
    desc: 'Admins can now securely upload, preview, and reset multiple preintegrated image assets (Dashboard illustration and Media log mascot chibi) live via the control panel.',
  },
  {
    icon: <IconNotebook className="w-5 h-5 stroke-[2]" />,
    color: '#34C759', // Apple Green
    bg: 'rgba(52, 199, 89, 0.08)',
    title: 'Markdown PDF Export & Numbered Lists',
    desc: 'Download styled notes as vector-text PDF documents directly from the preview pane. Trigger numbered lists via slash commands instantly.',
  },
];

const HIGHLIGHTS = [
  'Added styled PDF document download option to Markdown Module preview pane',
  'Integrated Numbered List option to editor slash (/) command actions menu',
  'Redesigned Dashboard Hub layout into a clean, modern, and high-contrast SaaS-style workspace',
  'Created uploader interfaces for multiple global illustrations inside the Admin control panel',
  'Moved Media Log mascot into a separate column next to notes to avoid obstructing typing input',
  'Added collapsible whiteboard sidebar state with a floating toggle button on drawing canvas',
  'Created live metadata preview uploader and verification on Enter keypress in Checklist'
];

interface UpdatePopupProps {
  onExpand: () => void;
  onDismiss: () => void;
}

function MiniCard({ onExpand, onDismiss }: UpdatePopupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.94 }}
      transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
      className="bg-white/90 dark:bg-stone-900/90 border border-stone-200/50 dark:border-stone-800/60 rounded-[24px] p-5 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.25)] w-full max-w-[340px] pointer-events-auto backdrop-blur-2xl flex flex-col gap-4 relative overflow-hidden antialiased text-left"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute flex items-center justify-center transition-all duration-200 rounded-full cursor-pointer top-4 right-4 w-7 h-7 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active:scale-90"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-3.5 w-full mt-1">
        <div className="w-11 h-11 rounded-[16px] bg-gradient-to-b from-[#FF2D55] to-[#5856D6] flex items-center justify-center shadow-md shrink-0">
          <IconSparkles className="w-5 h-5 text-white stroke-[2]" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="font-bold text-[14px] text-stone-900 dark:text-stone-50 tracking-tight leading-none">Version {APP_VERSION}</h3>
          <p className="text-[12px] text-stone-500 dark:text-stone-400 font-medium mt-1.5 truncate">Major system updates are ready.</p>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 mt-1">
        <button
          onClick={onDismiss}
          className="h-9 text-[12px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all active:scale-[0.97] cursor-pointer"
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="h-9 text-[12px] font-bold text-white dark:text-stone-950 bg-stone-950 dark:bg-stone-50 hover:opacity-90 rounded-xl transition-all active:scale-[0.97] text-center cursor-pointer"
        >
          See Details
        </button>
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
        className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[10000]"
      />

      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
          className="bg-white/95 dark:bg-stone-900/95 border border-stone-200/50 dark:border-stone-800/60 rounded-[28px] p-6 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] w-full max-w-[440px] pointer-events-auto text-left backdrop-blur-2xl flex flex-col max-h-[85vh] relative overflow-hidden antialiased"
        >
          {/* Top Decorative Amber Glow Bloom like Journal Component */}
          <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-16 bg-amber-500/10 blur-3xl" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute z-20 flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-full cursor-pointer top-4 right-4 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active:scale-90 border-stone-200/20 dark:border-stone-700/30"
          >
            <IconX size={15} className="stroke-[2.5]" />
          </button>

          {/* Pure Fluid Scrollable Flex Engine - No layout break points */}
          <div className="z-10 flex-1 w-full pr-1 mt-2 space-y-5 overflow-y-auto scrollbar-none">
            
            {/* Header Content */}
            <div className="flex flex-col items-start w-full gap-3">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-[#FF2D55] to-[#5856D6] flex items-center justify-center shadow-md">
                <IconSparkles className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                  Personal HQ Release {APP_VERSION}
                </h2>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed font-medium mt-2">
                  A premium feature update bringing habits schema database backing, native Pomodoro alerts, drawing whiteboards polish, and responsive outliners.
                </p>
              </div>
            </div>

            {/* Dynamic Features List Loop Container */}
            <div className="flex flex-col items-stretch w-full space-y-3">
              {FEATURES.map(f => (
                <div 
                  key={f.title} 
                  className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/30 border border-stone-200/40 dark:border-stone-800/40 w-full"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black/[0.02] dark:border-white/[0.02]"
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div className="pt-0.5 flex-1 min-w-0">
                    <p className="font-bold text-[13px] text-stone-900 dark:text-stone-50 mb-0.5 truncate">{f.title}</p>
                    <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-normal font-medium">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Changelog Summary View Card */}
            <div className="w-full p-4 border bg-stone-50/50 dark:bg-stone-800/20 border-stone-200/40 dark:border-stone-800/40 rounded-2xl">
              <h3 className="font-extrabold text-[9px] mb-2.5 uppercase tracking-widest text-stone-400 dark:text-stone-500">Changelog Summary</h3>
              <ul className="w-full space-y-2">
                {HIGHLIGHTS.map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-[12px] text-stone-500 dark:text-stone-400 font-medium w-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF] mt-1.5 shrink-0" />
                    <span className="flex-1 leading-normal">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Footer Trigger Block */}
          <div className="z-10 w-full pt-3 mt-4 border-t border-stone-100 dark:border-stone-800/40">
            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 rounded-2xl text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all duration-200 shadow-md cursor-pointer text-center"
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
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none w-full max-w-[340px] px-4 sm:px-0">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="flex justify-end w-full pointer-events-auto">
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