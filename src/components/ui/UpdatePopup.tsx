import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconArrowRight } from '@tabler/icons-react';

// ── Version ───────────────────────────────────────────────────────────────────
const APP_VERSION = '3.2.0';
const APP_CODENAME = 'Resilient';
const STORAGE_KEY = 'phq_last_seen_version';

// ── Changelog ─────────────────────────────────────────────────────────────────
type TabId = 'whats-new' | 'improvements' | 'fixes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'whats-new',    label: "What's New"   },
  { id: 'improvements', label: 'Improvements' },
  { id: 'fixes',        label: 'Fixes'        },
];

interface ChangeItem {
  icon: string;
  color: string;
  title: string;
  desc: string;
}

const CONTENT: Record<TabId, { headline: string; items: ChangeItem[] }> = {
  'whats-new': {
    headline: 'Local-first data loading, image optimisation, and a smarter sync layer.',
    items: [
      {
        icon: '🔌',
        color: '#f43f5e',
        title: 'Offline / Isolation Mode',
        desc: 'All modules now load from localStorage first. Supabase is only queried when you\'re fully online, eliminating blank screens on slow connections.',
      },
      {
        icon: '🖼',
        color: '#8B5CF6',
        title: 'Client-Side Image Optimiser',
        desc: 'New imageOptimizer.ts compresses uploads and converts them to WebP before sending — faster uploads, smaller storage footprint, no server-side config needed.',
      },
      {
        icon: '🔄',
        color: '#3B82F6',
        title: 'Force Sync Action',
        desc: 'New forceSync() in the store lets any module trigger a fresh pull from Supabase on demand — useful after coming back online or resolving a conflict.',
      },
      {
        icon: '⌘',
        color: '#059669',
        title: 'Quick-Add in Command Palette',
        desc: 'Press ⌘K and type "new" to instantly create a Journal entry, Todo task, Notebook, Habit log, or save a Link — without leaving your current view.',
      },
    ],
  },
  improvements: {
    headline: 'Supabase layer hardened, stores faster, UI palette wider.',
    items: [
      {
        icon: '⚡',
        color: '#F59E0B',
        title: 'Supabase REST Cache Cleared on Sync',
        desc: 'clearRestCache() is called before force-sync so stale reads never pollute fresh data. Real-time subscriptions are now opt-in per module.',
      },
      {
        icon: '📦',
        color: '#10B981',
        title: 'coreSlice — Parallel Data Loading',
        desc: 'All 18 data sources now load with Promise.allSettled in parallel. One slow table can no longer block the entire app from showing data.',
      },
      {
        icon: '🗂',
        color: '#6366F1',
        title: 'Categorised Sidebar (v3.1)',
        desc: '18 modules in 4 groups: Create & Write, Organise, Track, Tools. Click a group → landing page with module cards. Collapse → 4 smart category icons.',
      },
      {
        icon: '👤',
        color: '#EC4899',
        title: 'Profile & Admin Modules Updated',
        desc: 'Profile module shows live account stats. Admin panel updated to surface sync diagnostics and isolation-mode status for debugging.',
      },
    ],
  },
  fixes: {
    headline: 'Build stability, type safety, and command palette accuracy.',
    items: [
      {
        icon: '🛠',
        color: '#f43f5e',
        title: 'Build Errors Cleared',
        desc: 'Removed all TS6133 unused-variable errors across Sidebar, CommandPalette, and UpdatePopup. npm run build exits clean.',
      },
      {
        icon: '🎨',
        color: '#8B5CF6',
        title: 'CommandPalette Width & z-index',
        desc: 'Palette now max-w-2xl (was max-w-xl) and fixed z-index to z-50 — no longer overlaps by sidebar or modals incorrectly.',
      },
      {
        icon: '📚',
        color: '#3B82F6',
        title: 'CreateNotebookModal & NotebookEditor',
        desc: 'Cover image picker now uses the new imageOptimizer — covers are compressed to WebP automatically. Editor toolbar state hoisted.',
      },
      {
        icon: '💾',
        color: '#059669',
        title: 'Budget & Study Slices',
        desc: 'Both slices now persist to localStorage as write-through on every mutation so data survives a page refresh before Supabase confirms the write.',
      },
    ],
  },
};

// ── Stat pills ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: '🔌', label: 'Offline'  },
  { value: '⚡',  label: 'Parallel' },
  { value: 'WebP', label: 'Images'  },
];

// ── Accent gradient ────────────────────────────────────────────────────────────
const GRAD = 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #3B82F6 100%)';
const GRAD_SHADOW = '0 4px 16px rgba(244,63,94,0.28)';

// ── Mini card ─────────────────────────────────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      style={{ willChange: 'transform, opacity' }}
      className="pointer-events-auto w-full rounded-[22px] overflow-hidden antialiased text-left
        bg-white dark:bg-[#111113]
        border border-zinc-200/80 dark:border-white/[0.07]
        shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.55)]"
    >
      {/* Accent bar */}
      <div className="h-[3px] w-full shrink-0" style={{ background: GRAD }} />

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 relative">
        <div
          className="w-10 h-10 rounded-[13px] shrink-0 flex items-center justify-center text-[19px] leading-none"
          style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(244,63,94,0.18)' }}
        >
          🏠
        </div>
        <div className="flex-1 min-w-0 pr-7">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[13.5px] text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              v{APP_VERSION} — {APP_CODENAME}
            </span>
            <span
              className="px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-widest rounded-md"
              style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              New
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-snug">
            Offline mode, image optimisation & parallel data loading.
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          <IconX className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
        {STATS.map(s => (
          <div
            key={s.label}
            className="rounded-xl py-2 text-center"
            style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <p className="font-black text-[15px] leading-none">{s.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-1 text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onDismiss}
          className="flex-1 h-9 text-[11.5px] font-bold text-zinc-500 dark:text-zinc-400 rounded-xl cursor-pointer transition-all active:scale-[0.97]"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)' }}
        >
          Later
        </button>
        <button
          onClick={onExpand}
          className="flex-1 h-9 text-[11.5px] font-bold text-white rounded-xl cursor-pointer transition-all active:scale-[0.97]"
          style={{ background: GRAD, boxShadow: GRAD_SHADOW }}
        >
          See what's new →
        </button>
      </div>
    </motion.div>
  );
}

// ── Full changelog modal ───────────────────────────────────────────────────────
function ChangelogModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>('whats-new');
  const tab = CONTENT[activeTab];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-xl"
      />

      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340 }}
          style={{ willChange: 'transform, opacity' }}
          className="pointer-events-auto w-full max-w-[480px] max-h-[88vh] flex flex-col rounded-[28px] overflow-hidden antialiased
            bg-white dark:bg-[#111113]
            border border-zinc-200/80 dark:border-white/[0.07]
            shadow-[0_36px_80px_-16px_rgba(0,0,0,0.22)] dark:shadow-[0_36px_80px_-16px_rgba(0,0,0,0.7)]"
        >
          {/* Accent bar */}
          <div className="h-[3px] w-full shrink-0" style={{ background: GRAD }} />

          {/* Header */}
          <div className="flex items-start gap-4 px-6 pt-5 pb-4 shrink-0">
            <div
              className="w-12 h-12 rounded-[16px] shrink-0 flex items-center justify-center text-[24px] leading-none"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(244,63,94,0.15)' }}
            >
              🏠
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                  Personal HQ v{APP_VERSION}
                </h2>
                <span
                  className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg"
                  style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
                >
                  {APP_CODENAME}
                </span>
              </div>
              <p className="text-[12px] text-zinc-500 dark:text-zinc-400 font-medium mt-1 leading-relaxed">
                {tab.headline}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
              style={{ background: 'rgba(0,0,0,0.04)' }}
            >
              <IconX size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 gap-1 shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer
                  ${activeTab === t.id ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                style={activeTab === t.id
                  ? { background: GRAD, boxShadow: '0 2px 10px rgba(244,63,94,0.25)' }
                  : { background: 'rgba(0,0,0,0.04)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-3"
              >
                {tab.items.map(item => (
                  <div
                    key={item.title}
                    className="flex gap-3.5 p-4 rounded-2xl"
                    style={{ background: `${item.color}08`, border: `1px solid ${item.color}1a` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] leading-none shrink-0"
                      style={{ background: `${item.color}14`, border: `1px solid ${item.color}28` }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[13px] text-zinc-900 dark:text-zinc-50 leading-tight">{item.title}</p>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="flex items-center gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div className="flex-1">
              <p className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400">Release</p>
              <p className="text-[11.5px] font-bold text-zinc-600 dark:text-zinc-300 mt-0.5">
                v{APP_VERSION} · {APP_CODENAME} · July 2026
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-white rounded-2xl cursor-pointer transition-all active:scale-[0.97]"
              style={{ background: GRAD, boxShadow: GRAD_SHADOW }}
            >
              Let's go <IconArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function UpdatePopup() {
  const [step, setStep] = useState<'hidden' | 'mini' | 'full'>('hidden');

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    if (lastSeen !== APP_VERSION) {
      const t = setTimeout(() => setStep('mini'), 1800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, APP_VERSION);
    setStep('hidden');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] pointer-events-none w-full max-w-[340px]">
        <AnimatePresence>
          {step === 'mini' && (
            <div className="pointer-events-auto w-full">
              <MiniCard onExpand={() => setStep('full')} onDismiss={dismiss} />
            </div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {step === 'full' && <ChangelogModal onClose={dismiss} />}
      </AnimatePresence>
    </>
  );
}