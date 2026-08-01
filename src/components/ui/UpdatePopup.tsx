import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconX, IconArrowRight, IconCalendarEvent } from '@tabler/icons-react';

// ── Version ────────────────────────────────────────────────────────────────────
const APP_VERSION = '3.5.0';
const APP_CODENAME = 'Ultimate Edition';
const STORAGE_KEY = 'phq_last_seen_version';

// ── Changelog ──────────────────────────────────────────────────────────────────
type TabId = 'whats-new' | 'coming-soon' | 'improvements' | 'fixes';

const TABS: { id: TabId; label: string; badge?: string }[] = [
  { id: 'whats-new',    label: "What's New" },
  { id: 'coming-soon',   label: "🚀 Coming Soon", badge: 'NEW' },
  { id: 'improvements', label: 'Improvements' },
  { id: 'fixes',        label: 'Fixes' },
];

interface ChangeItem {
  icon: string;
  color: string;
  title: string;
  desc: string;
  tag?: string;
}

const CONTENT: Record<TabId, { headline: string; items: ChangeItem[] }> = {
  'whats-new': {
    headline: 'The biggest monthly update yet — full offline resilience, hybrid storage & AI studio!',
    items: [
      {
        icon: '🚀',
        color: '#f43f5e',
        title: 'Global AI Studio & Autonomous Assistant',
        desc: 'Rebuilt AI assistant with streaming token responses, code block syntax highlighting, multi-turn memory, and context-aware action triggers across all modules.',
        tag: 'Major',
      },
      {
        icon: '🔌',
        color: '#8B5CF6',
        title: 'Offline-First Hybrid Storage Engine',
        desc: 'Instant local data loading across all 18 modules with background Supabase sync. No more blank screens on slow network connections.',
        tag: 'Core',
      },
      {
        icon: '🗂️',
        color: '#3B82F6',
        title: 'Categorised Sidebar & Quick Navigation',
        desc: '18 modules grouped into 4 clear sections (Create & Write, Organise, Track, Tools) with interactive section landing cards & smart collapsed mode.',
      },
      {
        icon: '🖼️',
        color: '#059669',
        title: 'Client-Side Image Optimiser',
        desc: 'Automatic WebP image compression before upload for notebooks, cover photos & media attachments — faster load times and minimal storage usage.',
      },
    ],
  },
  'coming-soon': {
    headline: 'Arriving End of August 2026: Interactive Calendar & Dynamic Vision Board 2.0!',
    items: [
      {
        icon: '🗓️',
        color: '#EC4899',
        title: 'Phase 1: Unified Master Calendar (Aug 15 - Aug 20)',
        desc: 'Consolidate Task deadlines, Habit streaks, Pomodoro focus blocks & Study sessions into one master interactive calendar timeline with day/week/month views.',
        tag: 'Aug 15',
      },
      {
        icon: '🎨',
        color: '#8B5CF6',
        title: 'Phase 2: Vision Board & Mood Canvas (Aug 21 - Aug 26)',
        desc: 'Drag-and-drop visual vision canvas with goal cards, inspiration boards, media pins, aesthetic stickers & daily mood tracker widgets.',
        tag: 'Aug 22',
      },
      {
        icon: '🤖',
        color: '#F59E0B',
        title: 'Phase 3: AI Auto-Scheduler & Heatmaps (Aug 27 - Aug 31)',
        desc: 'AI automatically schedules your optimal deep-work sessions around your habits + yearly productivity consistency heatmaps & habit streaks!',
        tag: 'Aug 31',
      },
    ],
  },
  improvements: {
    headline: 'Supabase REST cache cleared on sync, db.ts refactored & zero-lag UI.',
    items: [
      {
        icon: '⚡',
        color: '#F59E0B',
        title: 'Parallel Data Hydration',
        desc: 'Load all 18 modules in parallel using Promise.allSettled — one slow network query will never block the rest of the application.',
      },
      {
        icon: '📦',
        color: '#10B981',
        title: 'db.ts Service Layer Refactor',
        desc: 'Uniform error handling, automatic 503 retry & column-scoped queries across all database services.',
      },
      {
        icon: '👤',
        color: '#6366F1',
        title: 'Live Account & Sync Diagnostics',
        desc: 'Expanded Profile & Admin dashboards featuring live sync health indicators and offline isolation debugging status.',
      },
    ],
  },
  fixes: {
    headline: 'Zero build warnings, mobile safe-area fixes, and keyboard accessibility.',
    items: [
      {
        icon: '🛠️',
        color: '#f43f5e',
        title: 'Clean Build Verification',
        desc: 'Removed all unused TS6133 declarations across Sidebar, CommandPalette & Modals for a 100% clean production build.',
      },
      {
        icon: '📱',
        color: '#3B82F6',
        title: 'Mobile Safe-Area Padding',
        desc: 'Resolved floating button z-index and modal overflow issues on iOS and smaller screens (<375px).',
      },
      {
        icon: '⌨️',
        color: '#059669',
        title: 'Keyboard Accessibility & Focus Trap',
        desc: 'Cmd+Enter submit, Escape dismiss, and proper tab order across all modal dialogs.',
      },
    ],
  },
};

// ── Stats ──────────────────────────────────────────────────────────────────────
const STATS = [
  { value: 'v3.5', label: 'Big Update' },
  { value: '🔌',   label: 'Offline-1st' },
  { value: '📅',   label: 'Aug Roadmap' },
];

// ── Design tokens ──────────────────────────────────────────────────────────────
const GRAD        = 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #3B82F6 100%)';
const GRAD_SHADOW = '0 4px 16px rgba(244,63,94,0.28)';
const SURFACE     = 'bg-white dark:bg-[#111113]';
const BORDER      = 'border border-zinc-200/80 dark:border-white/[0.07]';

// ── Mini card ──────────────────────────────────────────────────────────────────
function MiniCard({ onExpand, onDismiss }: { onExpand: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.93 }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      style={{ willChange: 'transform, opacity' }}
      className={`pointer-events-auto w-full rounded-[22px] overflow-hidden antialiased text-left ${SURFACE} ${BORDER} shadow-[0_20px_60px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.55)]`}
    >
      <div className="h-[3px] w-full" style={{ background: GRAD }} />

      <div className="flex items-center gap-3 px-4 pt-4 pb-3 relative">
        <div
          className="w-10 h-10 rounded-[13px] shrink-0 flex items-center justify-center text-[20px] leading-none"
          style={{ background: 'linear-gradient(135deg,rgba(244,63,94,.10),rgba(139,92,246,.10))', border: '1px solid rgba(244,63,94,.18)' }}
        >
          🚀
        </div>
        <div className="flex-1 min-w-0 pr-7">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-[13.5px] text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              v{APP_VERSION} — {APP_CODENAME}
            </span>
            <span
              className="px-1.5 py-0.5 text-[8.5px] font-black uppercase tracking-widest rounded-md"
              style={{ background: 'rgba(244,63,94,.10)', color: '#f43f5e', border: '1px solid rgba(244,63,94,.20)' }}
            >
              BIGGEST UPDATE
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-snug">
            Offline engine, AI studio &amp; Calendar/Vision Board teaser!
          </p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer transition-colors"
          style={{ background: 'rgba(0,0,0,.04)' }}
        >
          <IconX className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
        {STATS.map(s => (
          <div key={s.label} className="rounded-xl py-2 text-center" style={{ background: 'rgba(0,0,0,.03)', border: '1px solid rgba(0,0,0,.06)' }}>
            <p className="font-black text-[15px] leading-none">{s.value}</p>
            <p className="text-[9px] font-bold uppercase tracking-wider mt-1 text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <button
          onClick={onDismiss}
          className="flex-1 h-9 text-[11.5px] font-bold text-zinc-500 dark:text-zinc-400 rounded-xl cursor-pointer transition-all active:scale-[0.97]"
          style={{ background: 'rgba(0,0,0,.04)', border: '1px solid rgba(0,0,0,.06)' }}
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
          className={`pointer-events-auto w-full max-w-[500px] max-h-[90vh] flex flex-col rounded-[28px] overflow-hidden antialiased ${SURFACE} ${BORDER} shadow-[0_36px_80px_-16px_rgba(0,0,0,0.22)] dark:shadow-[0_36px_80px_-16px_rgba(0,0,0,0.7)]`}
        >
          <div className="h-[3.5px] w-full shrink-0" style={{ background: GRAD }} />

          {/* Header */}
          <div className="flex items-start gap-4 px-6 pt-5 pb-4 shrink-0">
            <div
              className="w-12 h-12 rounded-[16px] shrink-0 flex items-center justify-center text-[26px] leading-none"
              style={{ background: 'linear-gradient(135deg,rgba(244,63,94,.12),rgba(139,92,246,.12))', border: '1px solid rgba(244,63,94,.20)' }}
            >
              {activeTab === 'coming-soon' ? '📅' : '🚀'}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                  Personal HQ v{APP_VERSION}
                </h2>
                <span
                  className="px-2 py-0.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg"
                  style={{ background: 'rgba(244,63,94,.10)', color: '#f43f5e', border: '1px solid rgba(244,63,94,.20)' }}
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
              style={{ background: 'rgba(0,0,0,.04)' }}
            >
              <IconX size={14} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-6 gap-1.5 shrink-0 overflow-x-auto custom-scrollbar pb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5
                  ${activeTab === t.id ? 'text-white' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                style={activeTab === t.id
                  ? { background: GRAD, boxShadow: '0 2px 10px rgba(244,63,94,0.25)' }
                  : { background: 'rgba(0,0,0,.04)' }}
              >
                <span>{t.label}</span>
                {t.badge && activeTab !== t.id && (
                  <span className="text-[8px] px-1.5 py-0.2 rounded-full font-black bg-rose-500/20 text-rose-500 border border-rose-500/30">
                    {t.badge}
                  </span>
                )}
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
                {/* Special Banner for Coming Soon Tab */}
                {activeTab === 'coming-soon' && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-purple-500/10 to-blue-500/10 border border-rose-500/20 mb-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <IconCalendarEvent className="w-5 h-5 text-rose-500" />
                      <span className="text-[12px] font-black uppercase tracking-wider text-rose-500">Coming End of August 2026</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-zinc-900 dark:text-zinc-100">Calendar &amp; Vision Board 2.0 Roadmap</h3>
                    <p className="text-[11.5px] text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      We're bringing a unified master calendar, mood canvas, and drag-and-drop vision board directly into Personal HQ! Check out our release timeline below.
                    </p>
                  </div>
                )}

                {tab.items.map(item => (
                  <div
                    key={item.title}
                    className="flex gap-3.5 p-4 rounded-2xl relative overflow-hidden"
                    style={{ background: `${item.color}08`, border: `1px solid ${item.color}1a` }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[17px] leading-none shrink-0"
                      style={{ background: `${item.color}14`, border: `1px solid ${item.color}28` }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[13px] text-zinc-900 dark:text-zinc-50 leading-tight">{item.title}</p>
                        {item.tag && (
                          <span
                            className="px-1.5 py-0.2 text-[8px] font-black uppercase tracking-wider rounded-md ml-auto shrink-0"
                            style={{ background: `${item.color}20`, color: item.color, border: `1px solid ${item.color}35` }}
                          >
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 font-medium mt-1.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 shrink-0" style={{ borderTop: '1px solid rgba(0,0,0,.06)' }}>
            <div className="flex-1">
              <p className="text-[9.5px] font-black uppercase tracking-widest text-zinc-400">Release</p>
              <p className="text-[11.5px] font-bold text-zinc-600 dark:text-zinc-300 mt-0.5">
                v{APP_VERSION} · {APP_CODENAME} · August 2026
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-bold text-white rounded-2xl cursor-pointer transition-all active:scale-[0.97]"
              style={{ background: GRAD, boxShadow: GRAD_SHADOW }}
            >
              Explore Now <IconArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────
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