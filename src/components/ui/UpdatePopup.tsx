import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX, IconArrowRight, IconChevronRight,
  IconPackage, IconTrash, IconSparkles, IconBrain,
  IconCalendarMonth, IconLayoutKanban,
  IconDatabase, IconTag, IconCheckbox,
  IconBolt, IconDeviceMobile, IconPuzzle,
} from '@tabler/icons-react';

// ── Config ────────────────────────────────────────────────────────────────────
const VERSION     = '4.0';
const CODENAME    = 'Refined';
const RELEASE_KEY = 'phq_popup_v40';

// ── Content ───────────────────────────────────────────────────────────────────
type TabId = 'new' | 'roadmap' | 'perf' | 'fixes';

const TABS: { id: TabId; label: string; dot?: boolean }[] = [
  { id: 'new',     label: "What's New",   dot: true },
  { id: 'roadmap', label: 'Roadmap',      dot: true },
  { id: 'perf',    label: 'Improvements' },
  { id: 'fixes',   label: 'Fixes'        },
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
    headline: 'Todo rebuilt from scratch. Budget & Projects removed. Design system unified.',
    sub: 'The biggest structural refactor in Personal HQ history — leaner, faster, cleaner.',
    items: [
      {
        Icon: IconCheckbox,
        title: 'Todo Module — Ground-Up Rebuild',
        desc: 'TaskList and TodoSidebar replaced by a new modular components architecture under todo/components/. Planner sub-module added. Leaner state, faster renders, fully keyboard-accessible.',
        accent: '#f43f5e',
        tag: 'Major',
      },
      {
        Icon: IconTrash,
        title: 'Budget & Projects Removed',
        desc: 'BudgetModule (6 files, 1400+ lines) and ProjectsModule (1900+ lines) removed to reduce bundle size and maintenance overhead. Features will return in a dedicated Finance module in a future release.',
        accent: '#8B5CF6',
        tag: 'Breaking',
      },
      {
        Icon: IconPackage,
        title: 'Unified Design System Components',
        desc: 'New shared primitives: Button, Card, IconButton, Input, TextArea. All modules now consume these instead of ad-hoc Tailwind. Consistent padding, focus rings, and dark-mode behaviour everywhere.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconTag,
        title: 'Cross-Module Tagging System',
        desc: 'New TagInput component + taggables Supabase migration. Tag any item across Journal, Todo, Books, and Study — filter by tag from a single command palette search.',
        accent: '#10B981',
      },
    ],
  },
  roadmap: {
    headline: 'Calendar & Vision Board arriving this month — here\'s the exact schedule.',
    sub: '3-phase rollout across the last two weeks of August 2026.',
    items: [
      {
        Icon: IconCalendarMonth,
        title: 'Phase 1 · Unified Master Calendar',
        desc: 'Task deadlines, habit streaks, Pomodoro blocks, and study sessions in one interactive day/week/month view. Drag to reschedule.',
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
        desc: 'AI schedules optimal deep-work sessions around your existing habits. Yearly consistency heatmaps and streak analytics.',
        accent: '#F59E0B',
        tag: 'Aug 31',
      },
    ],
  },
  perf: {
    headline: 'Smaller bundle, smarter Gemini layer, tighter UI primitives.',
    sub: 'Everything that makes the app feel fast and intentional.',
    items: [
      {
        Icon: IconBolt,
        title: 'Bundle Shrunk by ~3800 Lines',
        desc: 'Removing Budget (1400 lines), Projects (1900 lines), and legacy TaskList/TodoSidebar (1766 lines) makes the production bundle significantly leaner.',
        accent: '#F59E0B',
      },
      {
        Icon: IconSparkles,
        title: 'Gemini Layer Major Refactor',
        desc: 'gemini.ts rewritten with 1292 lines of structured function calls, context injection, and multi-module awareness. AI responses are richer and more accurate.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconDatabase,
        title: 'Supabase Schema: Taggables Migration',
        desc: 'New taggables join table supports polymorphic cross-module tags. Optimised with composite indexes and RLS policies. Todo tasks table recreated with updated schema.',
        accent: '#6366F1',
      },
      {
        Icon: IconPuzzle,
        title: 'AI Structured Reply Component',
        desc: 'New AiStructuredReply.tsx renders AI responses as typed cards (task list, flashcards, summaries) rather than plain markdown — better for actionable AI output.',
        accent: '#10B981',
      },
    ],
  },
  fixes: {
    headline: 'Sidebar polish, command palette search, and AI chat UX fixes.',
    sub: 'Consistency and correctness throughout.',
    items: [
      {
        Icon: IconCheckbox,
        title: 'Todo Planner Sub-Module Added',
        desc: 'New todo/components/planner/ folder introduces a visual daily planner view. Accessible from the Todo module header tabs.',
        accent: '#f43f5e',
      },
      {
        Icon: IconDeviceMobile,
        title: 'Sidebar Collapse & Mobile Nav Fixed',
        desc: 'Sidebar.tsx refactored for cleaner collapse state, icon-only mode, and correct mobile bottom nav stacking with safe-area padding.',
        accent: '#0EA5E9',
      },
      {
        Icon: IconSparkles,
        title: 'AI Chat — Message Bubble & Input Polish',
        desc: 'AiMessageBubble and AiChatInput rebuilt with tighter spacing, better code block contrast, and correct focus management on message send.',
        accent: '#8B5CF6',
      },
    ],
  },
};

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIMARY   = '#f43f5e';
const BG_CARD   = '#111111';
const BORDER    = '1px solid rgba(255,255,255,0.06)';
const GRAD_LINE = `linear-gradient(90deg, ${PRIMARY} 0%, #8B5CF6 50%, #0EA5E9 100%)`;

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
      <div style={{ height: 2, background: GRAD_LINE }} />

      <div className="flex items-center gap-3 px-4 py-3.5">
        <div
          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
          style={{ background: `${PRIMARY}15`, border: `1px solid ${PRIMARY}25` }}
        >
          <IconPackage size={16} style={{ color: PRIMARY }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-white leading-none">
              v{VERSION} — {CODENAME}
            </span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: `${PRIMARY}15`, color: PRIMARY, border: `1px solid ${PRIMARY}25` }}
            >
              Major
            </span>
          </div>
          <p className="text-[10.5px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Todo rebuilt · Budget &amp; Projects removed · Tagging system
          </p>
        </div>

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
      <div
        className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5"
        style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}
      >
        <Icon size={15} style={{ color: accent }} />
      </div>
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
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[10000]"
        style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
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
          <div style={{ height: 2, background: GRAD_LINE, flexShrink: 0 }} />

          {/* Header */}
          <div className="flex items-start gap-3.5 px-5 pt-5 pb-4 shrink-0">
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: `${PRIMARY}12`, border: `1px solid ${PRIMARY}22` }}
            >
              <IconPackage size={17} style={{ color: PRIMARY }} />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
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
                  key={tab}
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
                {/* Roadmap banner */}
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
      <div className="fixed bottom-5 right-5 z-[9999] pointer-events-none w-full max-w-[380px]">
        <AnimatePresence>
          {step === 'strip' && (
            <div className="pointer-events-auto">
              <MiniStrip onExpand={() => setStep('full')} onDismiss={dismiss} />
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