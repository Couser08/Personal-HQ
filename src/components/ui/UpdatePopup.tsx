import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX,
  IconSparkles,
  IconComponents,
  IconFolderCode,
  IconBrandReact,
  IconAtom,
  IconLayoutGrid,
  IconDatabase,
  IconBolt,
  IconCurrencyRupee,
  IconBook2,
  IconLogin
} from '@tabler/icons-react';

// ── Version ──────────────────────────────────────────────────────────────────
const APP_VERSION = '2.1.0';
const APP_CODENAME = 'Polish';
const STORAGE_KEY = 'phq_last_seen_version';

// ── Types ─────────────────────────────────────────────────────────────────────
type TabId = 'architecture' | 'features' | 'improvements';

interface ChangeItem {
  icon: React.ReactNode;
  color: string;
  bg: string;
  title: string;
  desc: string;
}

// ── Tab Data ──────────────────────────────────────────────────────────────────
const TABS: { id: TabId; label: string }[] = [
  { id: 'architecture', label: 'Architecture' },
  { id: 'features',     label: 'Features' },
  { id: 'improvements', label: 'Fixes' },
];

const TAB_CONTENT: Record<TabId, { headline: string; items: ChangeItem[] }> = {
  architecture: {
    headline: 'Budget overhauled, Journal enriched, and Login page polished — the most user-facing update yet.',
    items: [
      {
        icon: <IconCurrencyRupee className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#34C759',
        bg: 'rgba(52, 199, 89, 0.08)',
        title: 'Multi-Currency Budget Tracker',
        desc: 'Switch between INR ₹, USD $, EUR €, GBP £, and JPY ¥ from the Budget header. All balance displays and toast messages update instantly.',
      },
      {
        icon: <IconBook2 className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#AF52DE',
        bg: 'rgba(175, 82, 222, 0.08)',
        title: 'Journal Writing Prompts',
        desc: 'Stuck on what to write? Hit the prompt button to get a random thoughtful writing prompt — 9 curated prompts to spark reflection.',
      },
      {
        icon: <IconSparkles className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF9500',
        bg: 'rgba(255, 149, 0, 0.08)',
        title: 'Journal Entry Templates',
        desc: '4 built-in templates: Gratitude Diary 🌸, Daily Reflection ✨, Zen Journal 🍃, and Work Log 💼 — start writing in seconds.',
      },
      {
        icon: <IconLogin className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#007AFF',
        bg: 'rgba(0, 122, 255, 0.08)',
        title: 'Login Page Glassmorphism Redesign',
        desc: 'Auth card rebuilt with Apple-style backdrop blur, snappier spring physics, and a cleaner Tailwind-first layout.',
      },
    ],
  },
  features: {
    headline: 'Carried over from v2.0.0 — still fresh and worth exploring.',
    items: [
      {
        icon: <IconLayoutGrid className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF2D55',
        bg: 'rgba(255, 45, 85, 0.08)',
        title: 'Today I Learned (TIL) Logger',
        desc: 'A dedicated micro-journal to log daily coding insights, tag them, and full-text search across all entries.',
      },
      {
        icon: <IconSparkles className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#AF52DE',
        bg: 'rgba(175, 82, 222, 0.08)',
        title: 'Anime Rankings & Reviews',
        desc: 'Personal anime watchlist with scores, reviews, and statistics nested inside the Media Logger tab.',
      },
      {
        icon: <IconBolt className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF9500',
        bg: 'rgba(255, 149, 0, 0.08)',
        title: 'Task Focus Island',
        desc: 'A floating Dynamic Island-style HUD showing your active Pomodoro task, remaining time, and quick controls.',
      },
    ],
  },
  improvements: {
    headline: 'Under-the-hood improvements for a smoother, more reliable experience.',
    items: [
      {
        icon: <IconFolderCode className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#FF9500',
        bg: 'rgba(255, 149, 0, 0.08)',
        title: 'Budget Donut Chart',
        desc: 'New BudgetStatsDonut component gives a visual breakdown of spending by category at a glance.',
      },
      {
        icon: <IconDatabase className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#34C759',
        bg: 'rgba(52, 199, 89, 0.08)',
        title: 'Journal Sidebar Consolidated',
        desc: 'Removed the separate JournalSidebar and StickyNoteCard components — StickyNotes is now self-contained and leaner.',
      },
      {
        icon: <IconAtom className="w-4.5 h-4.5 stroke-[2]" />,
        color: '#8E8E93',
        bg: 'rgba(142, 142, 147, 0.08)',
        title: 'Store & Type Fixes',
        desc: 'budgetSlice and store types updated to support selectedCurrency state; login form inputs and register flow polished.',
      },
    ],
  },
};

// ── Stat pills shown on mini card ─────────────────────────────────────────────
const STATS = [
  { label: 'Currencies', value: '5' },
  { label: 'Templates', value: '4' },
  { label: 'Lines changed', value: '1200+' },
];

// ── Mini Notification Card ────────────────────────────────────────────────────
interface MiniCardProps { onExpand: () => void; onDismiss: () => void }

function MiniCard({ onExpand, onDismiss }: MiniCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className="bg-white/90 dark:bg-[#141414]/95 border border-stone-200/60 dark:border-stone-800/50 rounded-[24px] p-5 shadow-[0_24px_56px_-12px_rgba(0,0,0,0.28)] w-full max-w-[340px] pointer-events-auto backdrop-blur-2xl flex flex-col gap-4 relative overflow-hidden antialiased text-left"
    >
      {/* Subtle gradient orb */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#5856D6]/10 blur-2xl pointer-events-none" />

      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 transition-colors active:scale-90 cursor-pointer"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3.5 w-full">
        <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-[#5856D6] to-[#007AFF] flex items-center justify-center shadow-[0_4px_16px_rgba(88,86,214,0.3)] shrink-0">
          <IconComponents className="w-5 h-5 text-white stroke-[2]" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-[14px] text-stone-900 dark:text-stone-50 tracking-tight leading-none">v{APP_VERSION}</h3>
            <span className="px-1.5 py-0.5 bg-[#5856D6]/10 text-[#5856D6] text-[9px] font-black uppercase tracking-wider rounded-md">{APP_CODENAME}</span>
          </div>
          <p className="text-[11.5px] text-stone-500 dark:text-stone-400 font-semibold mt-1.5 leading-tight">Multi-currency budget, journal templates & login redesign.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 w-full">
        {STATS.map(s => (
          <div key={s.label} className="flex-1 bg-stone-50 dark:bg-stone-800/60 rounded-2xl py-2 px-2 text-center border border-stone-200/40 dark:border-stone-800/40">
            <p className="font-black text-[14px] text-stone-900 dark:text-stone-50 leading-none">{s.value}</p>
            <p className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 w-full">
        <button
          onClick={onDismiss}
          className="h-9 text-[12px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-all active:scale-[0.97] cursor-pointer"
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="h-9 text-[12px] font-bold text-white bg-[#5856D6] hover:bg-[#4745C0] rounded-xl transition-all active:scale-[0.97] shadow-[0_4px_12px_rgba(88,86,214,0.25)] cursor-pointer"
        >
          See What's New
        </button>
      </div>
    </motion.div>
  );
}

// ── Full Modal ────────────────────────────────────────────────────────────────
function FullModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('architecture');
  const tab = TAB_CONTENT[activeTab];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-xl z-[10000]"
      />

      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 22 }}
          transition={{ type: 'spring', damping: 28, stiffness: 330 }}
          className="bg-white/96 dark:bg-[#141414]/97 border border-stone-200/50 dark:border-stone-800/50 rounded-[28px] shadow-[0_36px_80px_-16px_rgba(0,0,0,0.4)] w-full max-w-[460px] pointer-events-auto text-left backdrop-blur-2xl flex flex-col max-h-[88vh] relative overflow-hidden antialiased"
        >
          {/* Purple glow top-left */}
          <div className="absolute -top-20 -left-20 w-52 h-52 rounded-full bg-[#5856D6]/8 blur-3xl pointer-events-none" />

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute z-20 top-4 right-4 w-8 h-8 rounded-full border border-stone-200/30 dark:border-stone-700/30 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center justify-center text-stone-500 dark:text-stone-400 transition-colors active:scale-90 cursor-pointer"
          >
            <IconX size={14} className="stroke-[2.5]" />
          </button>

          {/* Scrollable body */}
          <div className="z-10 flex-1 overflow-y-auto scrollbar-none flex flex-col gap-5 p-6">

            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-br from-[#5856D6] to-[#007AFF] flex items-center justify-center shadow-[0_6px_20px_rgba(88,86,214,0.3)] shrink-0">
                <IconComponents className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[19px] font-black text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                    Personal HQ v{APP_VERSION}
                  </h2>
                  <span className="px-2 py-0.5 bg-[#5856D6]/12 text-[#5856D6] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#5856D6]/15">
                    {APP_CODENAME}
                  </span>
                </div>
                <p className="text-[12.5px] text-stone-500 dark:text-stone-400 font-medium mt-1.5 leading-relaxed">
                  Budget gets multi-currency support, Journal gains writing prompts & templates, and Login gets a glassmorphism glow-up.
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2.5">
              {STATS.map(s => (
                <div key={s.label} className="bg-stone-50 dark:bg-stone-800/40 rounded-2xl py-3 px-3 text-center border border-stone-200/40 dark:border-stone-800/40">
                  <p className="font-black text-[18px] text-[#5856D6] leading-none">{s.value}</p>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider mt-1.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Segmented Tab Switch */}
            <div className="flex bg-stone-100 dark:bg-stone-800/60 p-1 rounded-2xl border border-stone-200/30 dark:border-stone-800/40 w-full shrink-0">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-white dark:bg-stone-800 text-[#5856D6] shadow-sm'
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab headline */}
            <p className="text-[11.5px] text-stone-400 dark:text-stone-500 italic leading-relaxed -mt-2">
              {tab.headline}
            </p>

            {/* Tab items */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.16 }}
                className="space-y-3"
              >
                {tab.items.map(item => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/30 border border-stone-200/40 dark:border-stone-800/40 w-full"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: item.bg, color: item.color }}
                    >
                      {item.icon}
                    </div>
                    <div className="pt-0.5 flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-stone-900 dark:text-stone-50 mb-0.5 truncate">{item.title}</p>
                      <p className="text-[12px] text-stone-500 dark:text-stone-400 leading-normal font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

          </div>

          {/* Footer */}
          <div className="px-6 pb-6 pt-3 border-t border-stone-100 dark:border-stone-800/40 shrink-0">
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#5856D6] hover:bg-[#4745C0] text-white rounded-2xl text-xs font-bold active:scale-[0.97] transition-all shadow-[0_4px_16px_rgba(88,86,214,0.25)] cursor-pointer text-center"
            >
              Let's Explore What's New →
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────
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

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none w-full max-w-[340px] px-4 sm:px-0">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="flex justify-end w-full pointer-events-auto">
              <MiniCard onExpand={() => setStep('full')} onDismiss={dismiss} />
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