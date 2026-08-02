import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX, IconArrowRight, IconChevronRight,
  IconRobot, IconWifiOff, IconLayoutSidebar, IconPhoto,
  IconCalendarMonth, IconLayoutKanban, IconBrain,
  IconBolt, IconDatabase, IconUserCircle,
  IconChecks, IconDeviceMobile, IconKeyboard,
} from '@tabler/icons-react';

// ── Config ────────────────────────────────────────────────────────────────────
const VERSION     = '3.5';
const CODENAME    = 'Ultimate Edition';
const RELEASE_KEY = 'phq_popup_v35';

// ── Content ───────────────────────────────────────────────────────────────────
type TabId = 'new' | 'roadmap' | 'perf' | 'fixes';

const TABS: { id: TabId; label: string; dot?: boolean }[] = [
  { id: 'new',     label: "What's New", dot: true },
  { id: 'roadmap', label: 'Roadmap',    dot: true },
  { id: 'perf',    label: 'Improvements' },
  { id: 'fixes',   label: 'Fixes' },
];

interface Item {
  Icon: React.ElementType;
  title: string;
  desc: string;
  accent: string;
  tag?: string;
}

type Content = Record<TabId, { headline: string; sub: string; items: Item[] }>;

const DATA: Content = {
  new: {
    headline: 'AI, offline storage & smarter navigation.',
    sub: 'The largest single release in Personal HQ history.',
    items: [
      {
        Icon: IconRobot,
        title: 'AI Studio — Full Rebuild',
        desc: 'Streaming responses, code-block highlighting, multi-turn memory, and context-aware module actions all in one rebuilt assistant.',
        accent: '#f43f5e',
        tag: 'Major',
      },
      {
        Icon: IconWifiOff,
        title: 'Offline-First Hybrid Engine',
        desc: 'All 18 modules hydrate from localStorage instantly. Supabase syncs in the background. No more blank screens on slow connections.',
        accent: '#6366F1',
      },
      {
        Icon: IconLayoutSidebar,
        title: 'Categorised Sidebar',
        desc: '18 modules reorganised into 4 clear sections. Section landing cards, smart collapsed icons, and ⌘K quick-add for everything.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconPhoto,
        title: 'Client-Side Image Optimiser',
        desc: 'Automatic WebP compression before upload across notebooks, covers, and media — smaller storage, faster loads, zero config.',
        accent: '#10B981',
      },
    ],
  },
  roadmap: {
    headline: 'Calendar & Vision Board — arriving end of August.',
    sub: 'A 3-phase rollout across the last two weeks of the month.',
    items: [
      {
        Icon: IconCalendarMonth,
        title: 'Phase 1 · Unified Master Calendar',
        desc: 'Task deadlines, habit streaks, Pomodoro focus blocks, and study sessions in one interactive day/week/month calendar.',
        accent: '#EC4899',
        tag: 'Aug 15',
      },
      {
        Icon: IconLayoutKanban,
        title: 'Phase 2 · Vision Board & Mood Canvas',
        desc: 'Drag-and-drop goal cards, inspiration boards, media pins, and daily mood tracker widgets on a freeform canvas.',
        accent: '#8B5CF6',
        tag: 'Aug 22',
      },
      {
        Icon: IconBrain,
        title: 'Phase 3 · AI Auto-Scheduler & Heatmaps',
        desc: 'The AI schedules your optimal deep-work sessions around existing habits. Yearly productivity heatmaps and streak analytics.',
        accent: '#F59E0B',
        tag: 'Aug 31',
      },
    ],
  },
  perf: {
    headline: 'Faster sync, leaner queries, smarter diagnostics.',
    sub: 'Under-the-hood work that pays off every session.',
    items: [
      {
        Icon: IconBolt,
        title: 'Parallel Data Hydration',
        desc: 'All 18 data sources load concurrently via Promise.allSettled — a slow table can no longer stall the rest of the app.',
        accent: '#F59E0B',
      },
      {
        Icon: IconDatabase,
        title: 'db.ts Service Layer Refactored',
        desc: 'Uniform error shapes, column-scoped selects on every list endpoint, and automatic retry on 503 across all services.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconUserCircle,
        title: 'Live Sync Diagnostics',
        desc: 'Profile and Admin panels now surface real-time sync health, offline isolation status, and forced-sync controls.',
        accent: '#6366F1',
      },
    ],
  },
  fixes: {
    headline: 'Zero build warnings, safe-area support, full keyboard access.',
    sub: 'Everything that should have always worked.',
    items: [
      {
        Icon: IconChecks,
        title: 'Clean Production Build',
        desc: 'All TS6133 unused-variable warnings removed. npm run build exits cleanly with zero errors or warnings.',
        accent: '#10B981',
      },
      {
        Icon: IconDeviceMobile,
        title: 'Mobile Safe-Area & z-index',
        desc: 'Floating button z-index corrected on iOS. Modal capped at calc(100vw - 2rem) so it never clips on screens below 375 px.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconKeyboard,
        title: 'Modal Keyboard Accessibility',
        desc: 'Cmd+Enter submits, Escape closes. Tab cycle order is correct, and focus returns to the trigger element on dismiss.',
        accent: '#8B5CF6',
      },
    ],
  },
};

// ── Shared tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#f43f5e';
const BG_CARD = '#111111';
const BORDER  = '1px solid rgba(255,255,255,0.06)';

// ── Mini notification strip ───────────────────────────────────────────────────
function MiniStrip({ onExpand, onDismiss }: { onExpand(): void; onDismiss(): void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.97 }}
      transition={{ type: 'spring', damping: 28, stiffness: 360 }}
      className="pointer-events-auto w-full rounded-2xl overflow-hidden antialiased"
      style={{
        background: BG_CARD,
        border: BORDER,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
        willChange: 'transform, opacity',
      }}
    >
      {/* Top accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${PRIMARY} 0%, #8B5CF6 50%, #0EA5E9 100%)` }} />

      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Icon badge */}
        <div
          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${PRIMARY}15`, border: `1px solid ${PRIMARY}25` }}
        >
          <IconRobot size={16} style={{ color: PRIMARY }} />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white leading-none">
              v{VERSION} — {CODENAME}
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}25` }}
            >
              New
            </span>
          </div>
          <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.38)' }}>
            AI studio, offline engine &amp; Aug roadmap inside
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onExpand}
            className="flex items-center gap-1 px-2.5 h-7 text-[10.5px] font-bold text-white rounded-lg cursor-pointer transition-all active:scale-[0.96]"
            style={{ background: PRIMARY }}
          >
            See more <IconChevronRight size={11} />
          </button>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
          >
            <IconX size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Change item row ───────────────────────────────────────────────────────────
function ChangeRow({ item, index }: { item: Item; index: number }) {
  const { Icon, title, desc, accent, tag } = item;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="flex gap-3 py-3.5"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
    >
      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
        style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'rgba(255,255,255,0.9)' }}>
            {title}
          </p>
          {tag && (
            <span
              className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 ml-auto"
              style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}22` }}
            >
              {tag}
            </span>
          )}
        </div>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ── Full modal ────────────────────────────────────────────────────────────────
function FullModal({ onClose }: { onClose(): void }) {
  const [tab, setTab] = useState<TabId>('new');
  const data = DATA[tab];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[10000]"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(16px)' }}
      />

      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: 'spring', damping: 30, stiffness: 380 }}
          className="pointer-events-auto w-full max-w-[460px] max-h-[88vh] flex flex-col rounded-2xl overflow-hidden antialiased"
          style={{
            background: BG_CARD,
            border: BORDER,
            boxShadow: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)',
            willChange: 'transform, opacity',
          }}
        >
          {/* Accent line */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${PRIMARY} 0%, #8B5CF6 50%, #0EA5E9 100%)`, flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-start gap-3.5 px-5 pt-5 pb-4 shrink-0">
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: `${PRIMARY}12`, border: `1px solid ${PRIMARY}22` }}
            >
              {tab === 'roadmap'
                ? <IconCalendarMonth size={17} style={{ color: PRIMARY }} />
                : <IconRobot size={17} style={{ color: PRIMARY }} />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-bold leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
                  Personal HQ v{VERSION}
                </span>
                <span
                  className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ background: `${PRIMARY}14`, color: PRIMARY, border: `1px solid ${PRIMARY}20` }}
                >
                  {CODENAME}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tab + '-h'}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="text-[11.5px] mt-1 leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {data.headline}
                </motion.p>
              </AnimatePresence>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-all mt-0.5"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
            >
              <IconX size={13} />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex shrink-0 mx-5 mb-3 rounded-xl p-0.5 gap-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex-1 relative py-1.5 text-[10.5px] font-bold rounded-[10px] cursor-pointer transition-all flex items-center justify-center gap-1"
                style={tab === t.id
                  ? { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }
                  : { color: 'rgba(255,255,255,0.32)' }
                }
              >
                {t.label}
                {t.dot && (
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{ background: tab === t.id ? PRIMARY : 'rgba(255,255,255,0.2)' }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: 'none' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {/* Roadmap special banner */}
                {tab === 'roadmap' && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 mt-1"
                    style={{ background: 'rgba(236,72,153,0.07)', border: '1px solid rgba(236,72,153,0.14)' }}
                  >
                    <IconCalendarMonth size={13} style={{ color: '#EC4899', flexShrink: 0 }} />
                    <p className="text-[10.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      3-phase release · Aug 15 → Aug 31, 2026
                    </p>
                  </div>
                )}
                {data.items.map((item, i) => (
                  <ChangeRow key={item.title} item={item} index={i} />
                ))}
                <div className="h-3" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.22)' }}>
              August 2026 · v{VERSION}.0
            </p>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold text-white rounded-xl cursor-pointer transition-all active:scale-[0.97]"
              style={{ background: PRIMARY, boxShadow: `0 4px 16px ${PRIMARY}35` }}
            >
              Got it <IconArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export function UpdatePopup() {
  const [step, setStep] = useState<'hidden' | 'strip' | 'full'>('hidden');

  useEffect(() => {
    if (localStorage.getItem(RELEASE_KEY)) return;
    const t = setTimeout(() => setStep('strip'), 2000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(RELEASE_KEY, '1');
    setStep('hidden');
  };

  return (
    <>
      {/* Mini strip — bottom right */}
      <div className="fixed bottom-5 right-5 z-[9999] pointer-events-none w-full max-w-[380px]">
        <AnimatePresence>
          {step === 'strip' && (
            <div className="pointer-events-auto">
              <MiniStrip onExpand={() => setStep('full')} onDismiss={dismiss} />
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