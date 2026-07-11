import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconX, 
  IconSparkles, 
  IconTerminal,
  IconMovie,
  IconFlame,
  IconLayout,
  IconBrush,
  IconDatabase,
  IconSettings
} from '@tabler/icons-react';

const APP_VERSION = '1.4.0';
const STORAGE_KEY = 'phq_last_seen_version';

interface FeatureItem {
  icon: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  desc: string;
}

const TAB_CONTENT: Record<'features' | 'uiux' | 'improvements', { desc: string; list: FeatureItem[] }> = {
  features: {
    desc: 'New full-featured modules designed to expand your productivity workflows.',
    list: [
      {
        icon: <IconTerminal className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF9500', // Apple Orange
        bg: 'rgba(255, 149, 0, 0.08)',
        title: 'Today I Learned (TIL) Logger',
        desc: 'Log and catalog daily micro-journal tips, technical logs, and code snippets with quick tags, smart filters, and full text search.',
      },
      {
        icon: <IconMovie className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#007AFF', // Apple Blue
        bg: 'rgba(0, 122, 255, 0.08)',
        title: 'Anime Rankings & Reviews',
        desc: 'Organize your anime lists with scores, detailed personal notes, custom ratings, and watch logs directly inside the Media Logger.',
      },
    ]
  },
  uiux: {
    desc: 'Visual upgrades and layout updates focusing on beautiful, responsive aesthetics.',
    list: [
      {
        icon: <IconFlame className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF2D55', // Apple Pink
        bg: 'rgba(255, 45, 85, 0.08)',
        title: 'Canvas Ripple Celebrations',
        desc: 'Vibrant, concentric ripple canvas waves, star bursts, and gradient flows that trigger when completing Pomodoro sessions or habits.',
      },
      {
        icon: <IconLayout className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#AF52DE', // Apple Violet
        bg: 'rgba(175, 82, 222, 0.08)',
        title: 'Mascot Layout Adjustments',
        desc: 'Mascot preview logs moved to side columns in the Media section, ensuring typing fields remain completely unobstructed.',
      },
      {
        icon: <IconBrush className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF3B30', // Apple Red
        bg: 'rgba(255, 59, 48, 0.08)',
        title: 'Whiteboard Side Collapser',
        desc: 'Easily collapse drawing canvas tool panels using a smooth floating chevron toggle, giving you maximum space to draw.',
      },
    ]
  },
  improvements: {
    desc: 'Behind-the-scenes updates to keep your database fast, secure, and fully synced.',
    list: [
      {
        icon: <IconDatabase className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#34C759', // Apple Green
        bg: 'rgba(52, 199, 89, 0.08)',
        title: 'Database Deletion Syncing',
        desc: 'Integrated transacted sync handlers and SQL schema migrations to track and sync deleted checklist items across the cloud.',
      },
      {
        icon: <IconSettings className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#8E8E93', // Apple Gray
        bg: 'rgba(142, 142, 147, 0.08)',
        title: 'Illustration Banner Managers',
        desc: 'Safely upload, reset, and live-update fallback greeting illustrations directly inside the Admin control workstation.',
      },
    ]
  }
};

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
          <p className="text-[12px] text-stone-500 dark:text-stone-400 font-medium mt-1.5 truncate">Features and design updates are ready.</p>
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
  const [activeTab, setActiveTab] = useState<'features' | 'uiux' | 'improvements'>('features');
  const currentTab = TAB_CONTENT[activeTab];

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
          {/* Decorative Glow */}
          <div className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-16 bg-amber-500/10 blur-3xl" />

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute z-20 flex items-center justify-center w-8 h-8 transition-all duration-200 border rounded-full cursor-pointer top-4 right-4 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 active:scale-90 border-stone-200/20 dark:border-stone-700/30"
          >
            <IconX size={15} className="stroke-[2.5]" />
          </button>

          {/* Scrollable Container */}
          <div className="z-10 flex-1 w-full pr-1 mt-2 space-y-5 overflow-y-auto scrollbar-none flex flex-col">
            
            {/* Header Content */}
            <div className="flex flex-col items-start w-full gap-3 shrink-0">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-b from-[#FF2D55] to-[#5856D6] flex items-center justify-center shadow-md">
                <IconSparkles className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <div>
                <h2 className="text-[18px] font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                  Personal HQ Release {APP_VERSION}
                </h2>
                <p className="text-[12.5px] text-stone-500 dark:text-stone-400 leading-normal font-medium mt-1">
                  Explore category-wise updates using the segmented tabs below.
                </p>
              </div>
            </div>

            {/* Segmented Tab Switch */}
            <div className="flex bg-stone-100 dark:bg-stone-800/60 p-1 rounded-2xl border border-stone-200/30 dark:border-stone-850/40 w-full shrink-0">
              <button 
                onClick={() => setActiveTab('features')} 
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'features' 
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-sm' 
                    : 'text-stone-500 dark:text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                Features
              </button>
              <button 
                onClick={() => setActiveTab('uiux')} 
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'uiux' 
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-sm' 
                    : 'text-stone-500 dark:text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                UI/UX
              </button>
              <button 
                onClick={() => setActiveTab('improvements')} 
                className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'improvements' 
                    ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-50 shadow-sm' 
                    : 'text-stone-500 dark:text-stone-450 hover:text-stone-700 dark:hover:text-stone-200'
                }`}
              >
                Improvements
              </button>
            </div>

            {/* Tab Description */}
            <p className="text-[11.5px] text-stone-400 dark:text-stone-500 italic leading-relaxed font-medium shrink-0">
              {currentTab.desc}
            </p>

            {/* Dynamic Tab Features List */}
            <div className="flex-1 flex flex-col items-stretch space-y-3">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  {currentTab.list.map(f => (
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
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Action Footer Trigger Block */}
          <div className="z-10 w-full pt-3 mt-4 border-t border-stone-100 dark:border-stone-800/40 shrink-0">
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