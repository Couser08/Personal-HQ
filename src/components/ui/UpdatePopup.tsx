/**
 * WhatsNewPage — Apple-style full-screen "What's New" overlay.
 *
 * Replaces the old popup. Renders as a full-screen layer above the app.
 * Shown automatically once per release (localStorage key), dismissed with
 * "Continue" or the × button.
 *
 * Design: Apple onboarding aesthetic — generous whitespace, large type,
 * icon pills, vertical timeline grouped by version, smooth spring physics.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconX,
  IconArrowRight,
  IconCheckbox,
  IconTrash,
  IconPackage,
  IconTag,
  IconCalendarMonth,
  IconLayoutKanban,
  IconBrain,
  IconFlame,
  IconLink,
  IconPhoto,
  IconSparkles,
  IconBolt,
  IconPuzzle,
} from '@tabler/icons-react';

// ─────────────────────────────────────────────────────────────────────────────
// Release data
// ─────────────────────────────────────────────────────────────────────────────

const CURRENT_VERSION = '4.1.0';
const STORAGE_KEY     = 'phq_whatsnew_v410';

interface Feature {
  Icon: React.ElementType;
  color: string;           // icon background accent
  title: string;
  desc: string;
  badge?: string;          // optional pill label
}

interface Release {
  version: string;
  date: string;
  headline: string;
  features: Feature[];
}

const RELEASES: Release[] = [
  {
    version: 'v4.1',
    date: 'Aug 11, 2026',
    headline: 'Calendar arrives. Habits & Links refined.',
    features: [
      {
        Icon: IconCalendarMonth,
        color: '#EC4899',
        title: 'Unified Master Calendar',
        desc: 'All your tasks, habits, Pomodoro sessions, and study blocks in a single interactive calendar — day, week, and month views with drag-to-reschedule.',
        badge: 'New',
      },
      {
        Icon: IconFlame,
        color: '#F59E0B',
        title: 'Habit Tracker — Full Redesign',
        desc: 'Rebuilt HabitCalendar, HabitCard, HabitChecklist, HabitModal, and HabitStats from scratch. Streak heatmaps, check-in animations, and per-habit colour themes.',
        badge: 'Redesigned',
      },
      {
        Icon: IconLink,
        color: '#0EA5E9',
        title: 'Links Module Unified',
        desc: 'LinkSaverModule merged into LinksModule. One clean home for all saved links with tag filtering, favicon detection, and rich preview cards.',
      },
      {
        Icon: IconPhoto,
        color: '#8B5CF6',
        title: 'Media Gallery — Detail View & Grid',
        desc: 'MediaDetailView and MediaGrid reworked with a lightbox detail view, masonry layout, and inline edit/delete without leaving the gallery.',
      },
      {
        Icon: IconPuzzle,
        color: '#10B981',
        title: 'Planner Monthly View',
        desc: 'New MonthlyCalendarView component inside the Todo Planner — drag tasks onto calendar days and see your schedule at a glance alongside habits.',
        badge: 'New',
      },
    ],
  },
  {
    version: 'v4.0',
    date: 'Aug 10, 2026',
    headline: 'Biggest structural refactor in Personal HQ history.',
    features: [
      {
        Icon: IconCheckbox,
        color: '#f43f5e',
        title: 'Todo Module — Ground-Up Rebuild',
        desc: 'TaskList and TodoSidebar replaced by a new modular architecture. Planner sub-module, keyboard navigation, and faster renders.',
        badge: 'Major',
      },
      {
        Icon: IconTrash,
        color: '#6366F1',
        title: 'Budget & Projects Removed',
        desc: '~3800 lines removed to shrink the bundle. Budget will return as a dedicated Finance module. Projects are being rethought.',
      },
      {
        Icon: IconPackage,
        color: '#0EA5E9',
        title: 'Unified Design System',
        desc: 'New shared primitives — Button, Card, IconButton, Input, TextArea — used consistently across all modules.',
      },
      {
        Icon: IconTag,
        color: '#10B981',
        title: 'Cross-Module Tagging',
        desc: 'Tag any item across Journal, Todo, Books, and Study. New TagInput component + polymorphic Supabase taggables table.',
      },
    ],
  },
  {
    version: 'v3.6',
    date: 'Aug 2, 2026',
    headline: 'Performance audit — blur & paint cost slashed.',
    features: [
      {
        Icon: IconBolt,
        color: '#F59E0B',
        title: 'Global Blur Audit',
        desc: 'Removed a stray global backdrop-filter from :root. Downgraded backdrop-blur-xl / 2xl to backdrop-blur-sm across 9 files. All surfaces now within the ≤8 px guideline.',
        badge: 'Perf',
      },
      {
        Icon: IconSparkles,
        color: '#8B5CF6',
        title: 'UpdatePopup — Stripe-Style Redesign',
        desc: 'What's New replaced the old popup card with a dark-native strip (this page!) — icon rows, segmented tabs, gradient accent bar.',
      },
    ],
  },
  {
    version: 'v3.5',
    date: 'Aug 1, 2026',
    headline: 'AI studio rebuilt, offline engine shipped.',
    features: [
      {
        Icon: IconBrain,
        color: '#f43f5e',
        title: 'AI Assistant — Full Rebuild',
        desc: 'Streaming token responses, code-block syntax highlighting, multi-turn session memory, and context-aware module actions.',
        badge: 'Major',
      },
      {
        Icon: IconLayoutKanban,
        color: '#6366F1',
        title: 'Offline-First Hybrid Storage',
        desc: 'All 18 modules hydrate from localStorage instantly. Supabase syncs in the background. Zero blank screens on slow connections.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Feature row
// ─────────────────────────────────────────────────────────────────────────────

function FeatureRow({ feature, index }: { feature: Feature; index: number }) {
  const { Icon, color, title, desc, badge } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, delay: 0.06 + index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-start gap-4"
    >
      {/* Icon pill */}
      <div
        className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: `${color}15`,
          border: `1.5px solid ${color}25`,
          boxShadow: `0 2px 8px ${color}14`,
        }}
      >
        <Icon size={20} style={{ color }} strokeWidth={1.7} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pb-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.055)' }}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-semibold leading-snug text-[#1d1d1f] dark:text-[rgba(255,255,255,0.92)]">
            {title}
          </span>
          {badge && (
            <span
              className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0"
              style={{ background: `${color}14`, color, border: `1px solid ${color}25` }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-[#6e6e73] dark:text-[rgba(255,255,255,0.40)]">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Release section
// ─────────────────────────────────────────────────────────────────────────────

function ReleaseSection({ release, sectionIndex, isFirst }: {
  release: Release;
  sectionIndex: number;
  isFirst: boolean;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: sectionIndex * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Version label */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-black uppercase tracking-[0.12em]"
              style={{ color: isFirst ? '#f43f5e' : 'rgba(0,0,0,0.28)', }}
            >
              {release.version}
            </span>
            {isFirst && (
              <span
                className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md"
                style={{ background: 'rgba(244,63,94,0.10)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.20)' }}
              >
                Latest
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium text-[#aeaeb2] dark:text-[rgba(255,255,255,0.25)] mt-0.5">
            {release.date}
          </span>
        </div>
        <div className="flex-1 h-px bg-black/[0.06] dark:bg-white/[0.07]" />
      </div>

      {/* Headline */}
      <p className="text-[15px] font-semibold text-[#3a3a3c] dark:text-[rgba(255,255,255,0.55)] mb-4 leading-snug">
        {release.headline}
      </p>

      {/* Features */}
      <div className="flex flex-col gap-0">
        {release.features.map((f, i) => (
          <FeatureRow key={f.title} feature={f} index={i + sectionIndex * 4} />
        ))}
      </div>

      <div className="h-6" />
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export function WhatsNewPage() {
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleScroll = () => {
    setScrolled((scrollRef.current?.scrollTop ?? 0) > 12);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Full-screen backdrop */}
          <motion.div
            className="fixed inset-0 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          {/* Page sheet */}
          <div className="fixed inset-0 z-[10001] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ type: 'spring', damping: 32, stiffness: 300, mass: 0.9 }}
              style={{ willChange: 'transform, opacity' }}
              className={`
                relative w-full sm:max-w-[540px] flex flex-col overflow-hidden
                rounded-t-[28px] sm:rounded-[28px]
                bg-[#f5f5f7] dark:bg-[#1c1c1e]
                shadow-[0_28px_80px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]
                dark:shadow-[0_28px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]
              `}
              style={{ maxHeight: '90vh' }}
            >

              {/* ── Sticky header ── */}
              <div
                className={`flex items-center justify-between px-6 pt-5 pb-4 shrink-0 transition-shadow duration-200 ${
                  scrolled ? 'shadow-[0_1px_0_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]' : ''
                }`}
              >
                <div />
                <div className="text-center absolute left-0 right-0 pointer-events-none">
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: scrolled ? 1 : 0, y: scrolled ? 0 : -4 }}
                    transition={{ duration: 0.18 }}
                    className="text-[13px] font-semibold text-[#1d1d1f] dark:text-white"
                  >
                    What's New
                  </motion.p>
                </div>
                <button
                  onClick={dismiss}
                  aria-label="Close"
                  className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-[0.93]"
                  style={{
                    background: 'rgba(0,0,0,0.07)',
                    color: 'rgba(0,0,0,0.45)',
                  }}
                >
                  <IconX size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* ── Hero ── */}
              <div className="px-6 pb-6 shrink-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* App icon */}
                  <div
                    className="w-14 h-14 rounded-[18px] flex items-center justify-center mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #0EA5E9 100%)',
                      boxShadow: '0 6px 24px rgba(244,63,94,0.28)',
                    }}
                  >
                    <IconSparkles size={26} className="text-white" strokeWidth={1.5} />
                  </div>

                  <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1d1d1f] dark:text-white mb-1">
                    What's New
                  </h1>
                  <p className="text-[15px] text-[#8e8e93] dark:text-[rgba(255,255,255,0.38)] font-normal">
                    Personal HQ · {CURRENT_VERSION}
                  </p>
                </motion.div>
              </div>

              {/* ── Scrollable timeline ── */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-6"
                style={{ scrollbarWidth: 'none' }}
              >
                {RELEASES.map((r, i) => (
                  <ReleaseSection
                    key={r.version}
                    release={r}
                    sectionIndex={i}
                    isFirst={i === 0}
                  />
                ))}
                {/* Bottom spacer for CTA */}
                <div className="h-24" />
              </div>

              {/* ── Sticky CTA ── */}
              <div
                className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-6 shrink-0"
                style={{
                  background: 'linear-gradient(to top, #f5f5f7 65%, transparent)',
                }}
              >
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  onClick={dismiss}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-12 flex items-center justify-center gap-2 text-[15px] font-semibold text-white rounded-2xl cursor-pointer transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #0EA5E9 100%)',
                    boxShadow: '0 4px 20px rgba(244,63,94,0.32)',
                  }}
                >
                  Continue <IconArrowRight size={16} strokeWidth={2.2} />
                </motion.button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Keep the old name exported so Layout.tsx doesn't need changes
export { WhatsNewPage as UpdatePopup };