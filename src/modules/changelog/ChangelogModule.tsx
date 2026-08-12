/**
 * ChangelogModule — A dedicated, navigable changelog page.
 *
 * Accessible via the sidebar ("What's New" / changelog link).
 * Displays all releases in a beautiful vertical timeline.
 *
 * Design: Linear/Vercel-style timeline on desktop, stacked cards on mobile.
 * Full dark-mode adaptive, uses the app's existing color tokens.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconCalendarMonth,
  IconFlame,
  IconLink,
  IconPhoto,
  IconPuzzle,
  IconCheckbox,
  IconTrash,
  IconPackage,
  IconTag,
  IconBrain,
  IconBolt,
  IconSparkles,
  IconLayoutKanban,
  IconWifiOff,
  IconDatabase,
  IconDeviceMobile,
  IconChevronDown,
  IconChevronUp,
  IconRocket,
  IconStar,
} from '@tabler/icons-react';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Feature {
  Icon: React.ElementType;
  color: string;
  title: string;
  desc: string;
  badge?: string;
  badgeColor?: string;
}

interface Release {
  version: string;
  codename: string;
  date: string;
  headline: string;
  sub: string;
  features: Feature[];
  type: 'major' | 'minor' | 'patch';
}

const RELEASES: Release[] = [
  {
    version: 'v4.2.0',
    codename: 'Polished',
    date: 'August 12, 2026',
    headline: 'Planner revamped. Markdown upgraded. Store & storage layer refined.',
    sub: 'Deep planner overhaul with a full monthly calendar view, plus a rewritten Markdown editor and a unified client-side storage utility.',
    type: 'minor',
    features: [
      {
        Icon: IconPuzzle,
        color: '#EC4899',
        title: 'Planner — Monthly Calendar View',
        desc: 'MonthlyCalendarView completely rewritten (795 lines). Drag tasks between days, see habit completions per day, week heat indicators, and a mini agenda panel on day click.',
        badge: 'New',
        badgeColor: '#EC4899',
      },
      {
        Icon: IconPuzzle,
        color: '#8B5CF6',
        title: 'Planner Sidebar — Deep Redesign',
        desc: 'PlannerSidebar rebuilt (470 lines) with collapsible project sections, tag filter chips, priority sort, and a live task-count badge per section.',
        badge: 'Redesigned',
        badgeColor: '#8B5CF6',
      },
      {
        Icon: IconFileText,
        color: '#0EA5E9',
        title: 'Markdown Editor — Enhanced',
        desc: 'MarkdownEditor rewritten with toolbar shortcuts, frontmatter support, split-pane resizing, and live word/character count. Export to .md now works in one click.',
      },
      {
        Icon: IconDatabase,
        color: '#10B981',
        title: 'Client-Side Storage Utility',
        desc: 'New src/utils/storage.ts — typed wrappers for localStorage (get, set, remove, clear) with TTL expiry, JSON serialisation, and error boundaries.',
        badge: 'New',
        badgeColor: '#10B981',
      },
      {
        Icon: IconBolt,
        color: '#F59E0B',
        title: 'useAppStore — API Expanded',
        desc: 'setActiveModule, theme selectors, and settings slice updated for the new changelog, storage, and planner module wiring. 46 lines of API additions.',
      },
    ],
  },
  {
    version: 'v4.1.0',
    codename: 'Grounded',
    date: 'August 11, 2026',
    headline: 'Calendar ships. Habits rebuilt. Links & Media unified.',
    sub: 'The Calendar module arrives ahead of schedule alongside a full Habit Tracker redesign and a merged Links experience.',
    type: 'major',
    features: [
      {
        Icon: IconCalendarMonth,
        color: '#EC4899',
        title: 'Unified Master Calendar',
        desc: 'All tasks, habits, Pomodoro sessions, and study blocks in one interactive calendar. Day, week, and month views with drag-to-reschedule and colour-coded event types.',
        badge: 'New',
        badgeColor: '#EC4899',
      },
      {
        Icon: IconFlame,
        color: '#F59E0B',
        title: 'Habit Tracker — Full Redesign',
        desc: 'Rebuilt HabitCalendar, HabitCard, HabitChecklist, HabitModal, and HabitStats (+366 lines). Streak heatmaps, smooth check-in animations, per-habit colour themes, and a new stats dashboard.',
        badge: 'Redesigned',
        badgeColor: '#F59E0B',
      },
      {
        Icon: IconLink,
        color: '#0EA5E9',
        title: 'Links Module Unified',
        desc: 'LinkSaverModule (493 lines) merged into LinksModule. One clean home for all saved links with tag filtering, favicon detection, rich preview cards, and bulk import.',
      },
      {
        Icon: IconPhoto,
        color: '#8B5CF6',
        title: 'Media — Lightbox Detail View & Masonry Grid',
        desc: 'MediaDetailView rewritten as a full-screen lightbox (571 lines). MediaGrid now uses masonry layout. Inline edit and delete work without leaving the gallery.',
        badge: 'Redesigned',
        badgeColor: '#8B5CF6',
      },
      {
        Icon: IconSitemap,
        color: '#6366F1',
        title: 'Mindmap Canvas — Node Interaction Improved',
        desc: 'MindmapCanvas updated with better node drag handles, smoother edge routing, and a right-click context menu for add/delete/collapse.',
      },
      {
        Icon: IconDatabase,
        color: '#10B981',
        title: 'Supabase — Habit & Media & Links Migration',
        desc: 'New migration 20260810100000 adds habit_entries polymorphic table, media_items v2 with dimensions, and links_v2 with og_data JSONB column.',
      },
    ],
  },
  {
    version: 'v4.0.0',
    codename: 'Refined',
    date: 'August 10, 2026',
    headline: 'Ground-up Todo rebuild. Budget & Projects removed. Design system born.',
    sub: 'The largest structural refactor in Personal HQ history — 6,000 lines removed, a unified component library added, cross-module tagging shipped.',
    type: 'major',
    features: [
      {
        Icon: IconCheckbox,
        color: '#f43f5e',
        title: 'Todo Module — Ground-Up Rebuild',
        desc: 'TaskList (1546 lines) and TodoSidebar (220 lines) removed. Replaced by modular todo/components/ architecture: DailyPlannerView, PlannerHeader, PlannerSidebar, PlannerStats, PlannerTimeline.',
        badge: 'Major',
        badgeColor: '#f43f5e',
      },
      {
        Icon: IconTrash,
        color: '#6366F1',
        title: 'Budget & Projects Modules Removed',
        desc: 'BudgetModule + 5 components (1400 lines) and ProjectsModule (1911 lines) removed to reduce bundle. Budget returns as Finance module in a future release.',
      },
      {
        Icon: IconPackage,
        color: '#0EA5E9',
        title: 'Unified Design System',
        desc: 'New shared primitives: Button, Card, IconButton, Input, TextArea. All modules now consume these — consistent padding, focus rings, and dark-mode throughout.',
      },
      {
        Icon: IconTag,
        color: '#10B981',
        title: 'Cross-Module Tagging',
        desc: 'TagInput component + taggables Supabase migration (polymorphic join table with RLS). Tag any item across Journal, Todo, Books, Study.',
        badge: 'New',
        badgeColor: '#10B981',
      },
      {
        Icon: IconBrain,
        color: '#8B5CF6',
        title: 'Gemini Layer — Major Rewrite',
        desc: 'gemini.ts rewritten to 1,292 lines with structured function calls, multi-module context injection, streaming token delivery, and per-module action routing.',
      },
      {
        Icon: IconSparkles,
        color: '#EC4899',
        title: 'AI Structured Reply Component',
        desc: 'New AiStructuredReply.tsx renders AI responses as typed cards (task list, flashcards, key points) instead of plain markdown — actionable and scannable.',
        badge: 'New',
        badgeColor: '#EC4899',
      },
      {
        Icon: IconDatabase,
        color: '#F59E0B',
        title: 'Supabase — Taggables & Todo Schema',
        desc: 'Two new migrations: taggables polymorphic join table (20260808) and todo_tasks_recreate with updated schema and RLS (20260810).',
      },
    ],
  },
  {
    version: 'v3.6.0',
    codename: 'Fast & Clean',
    date: 'August 2, 2026',
    headline: 'Blur audit complete. Global paint cost slashed by ~60%.',
    sub: 'Every animated surface audited against the compositor-only ruleset. All blur values brought within the 8 px ceiling.',
    type: 'minor',
    features: [
      {
        Icon: IconBolt,
        color: '#F59E0B',
        title: 'Global Blur Audit — 9 Files Fixed',
        desc: 'Removed stray global backdrop-filter from :root dark selector. Downgraded backdrop-blur-xl/2xl to backdrop-blur-sm across JournalModule, MarkdownEditor/Preview/Sidebar, ProfileModule (×6), SettingsModule (×5), LoginPage, LoginForm.',
        badge: 'Perf',
        badgeColor: '#F59E0B',
      },
      {
        Icon: IconDeviceMobile,
        color: '#0EA5E9',
        title: 'Command Palette — Blur Optimised',
        desc: 'Modal panel backdrop-blur-xl removed (panel is opaque — blur had zero visual benefit). Overlay downgraded backdrop-blur-md → backdrop-blur-sm. Paint work reduced ~60%.',
      },
      {
        Icon: IconRocket,
        color: '#8B5CF6',
        title: 'Changelog Page Introduced',
        desc: 'UpdatePopup replaced with a dedicated Changelog page (this page). Accessible from sidebar "What\'s New" link. Full timeline, collapsible releases, stats bar.',
      },
    ],
  },
  {
    version: 'v3.5.0',
    codename: 'Intelligent',
    date: 'August 1, 2026',
    headline: 'AI studio rebuilt from scratch. Offline-first engine ships.',
    sub: 'Streaming AI responses, multi-turn session memory, offline data loading, and a completely new modular assistant architecture.',
    type: 'major',
    features: [
      {
        Icon: IconBrain,
        color: '#f43f5e',
        title: 'AI Assistant — Full Rebuild',
        desc: 'AiAssistantModal modularised into ai-assistant/ directory. Streaming token responses, code-block highlighting with copy, multi-turn memory, context-aware module actions.',
        badge: 'Major',
        badgeColor: '#f43f5e',
      },
      {
        Icon: IconWifiOff,
        color: '#6366F1',
        title: 'Offline-First Hybrid Engine',
        desc: 'All 18 modules hydrate from localStorage instantly. Supabase syncs in the background via coreSlice Promise.allSettled. Zero blank screens on slow or no connection.',
      },
      {
        Icon: IconLayoutKanban,
        color: '#8B5CF6',
        title: 'Categorised Sidebar',
        desc: '18 modules grouped into 4 sections: Create & Write, Organise, Track, Tools. Smart collapsed-icon mode, category landing pages, ⌘K quick-add shortcut.',
      },
      {
        Icon: IconDatabase,
        color: '#10B981',
        title: 'db.ts — Service Layer Refactored',
        desc: 'Uniform error shapes, column-scoped selects, automatic retry on 503, and parallel data hydration. 137 lines of new service utilities.',
      },
    ],
  },
  {
    version: 'v3.2.0',
    codename: 'Resilient',
    date: 'July 2026',
    headline: 'Local-first storage, image optimisation, smarter sync.',
    sub: 'Foundation release — everything that makes the app feel instant regardless of network conditions.',
    type: 'minor',
    features: [
      {
        Icon: IconPhoto,
        color: '#EC4899',
        title: 'Client-Side Image Optimiser',
        desc: 'Automatic WebP compression before upload across notebooks, covers, and media. Average image size reduced 60–80%. Zero configuration needed.',
      },
      {
        Icon: IconBolt,
        color: '#F59E0B',
        title: 'Parallel Data Hydration',
        desc: 'All 18 data sources load concurrently via Promise.allSettled in coreSlice. One slow Supabase table can no longer stall the rest of the application.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Release type badge styles
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_STYLES = {
  major: { bg: 'rgba(244,63,94,0.10)', color: '#f43f5e', border: 'rgba(244,63,94,0.22)', label: 'Major' },
  minor: { bg: 'rgba(59,130,246,0.10)', color: '#3B82F6', border: 'rgba(59,130,246,0.22)', label: 'Minor' },
  patch: { bg: 'rgba(16,185,129,0.10)', color: '#10B981', border: 'rgba(16,185,129,0.22)', label: 'Patch' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Feature row
// ─────────────────────────────────────────────────────────────────────────────

function FeatureRow({ f, i }: { f: Feature; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-start gap-3.5 py-3.5"
      style={{ borderBottom: '1px solid var(--border-border, rgba(0,0,0,0.06))' }}
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: `${f.color}12`,
          border: `1.5px solid ${f.color}22`,
        }}
      >
        <f.Icon size={17} style={{ color: f.color }} strokeWidth={1.7} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 mb-0.5 flex-wrap">
          <span className="text-[13.5px] font-semibold leading-snug text-text-primary">
            {f.title}
          </span>
          {f.badge && (
            <span
              className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0 mt-0.5"
              style={{
                background: `${f.badgeColor ?? f.color}14`,
                color: f.badgeColor ?? f.color,
                border: `1px solid ${f.badgeColor ?? f.color}25`,
              }}
            >
              {f.badge}
            </span>
          )}
        </div>
        <p className="text-[12.5px] leading-relaxed text-text-secondary">
          {f.desc}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Release card
// ─────────────────────────────────────────────────────────────────────────────

function ReleaseCard({ release, index, isLatest }: {
  release: Release;
  index: number;
  isLatest: boolean;
}) {
  const [expanded, setExpanded] = useState(isLatest);
  const ts = TYPE_STYLES[release.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex gap-5 md:gap-8"
    >
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        {/* Dot */}
        <div
          className="w-3 h-3 rounded-full shrink-0 ring-4 ring-background"
          style={{
            background: isLatest
              ? 'linear-gradient(135deg, #f43f5e, #8B5CF6)'
              : 'var(--border-border, rgba(0,0,0,0.15))',
          }}
        />
        {/* Line */}
        <div
          className="w-px flex-1 mt-2"
          style={{ background: 'var(--border-border, rgba(0,0,0,0.08))' }}
        />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-10">
        {/* Header row */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full text-left cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Version */}
              <span className="text-[13px] font-black tracking-tight text-text-primary">
                {release.version}
              </span>

              {/* Codename */}
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: ts.bg,
                  color: ts.color,
                  border: `1px solid ${ts.border}`,
                }}
              >
                {release.codename}
              </span>

              {/* Type badge */}
              <span
                className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                style={{ background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}
              >
                {ts.label}
              </span>

              {isLatest && (
                <span
                  className="text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(16,185,129,0.10)', color: '#10B981', border: '1px solid rgba(16,185,129,0.22)' }}
                >
                  Latest
                </span>
              )}
            </div>

            {/* Expand toggle */}
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <span className="text-[10.5px] text-text-muted">{release.date}</span>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-colors group-hover:bg-surface-alt"
                style={{ color: 'var(--text-muted)' }}
              >
                {expanded
                  ? <IconChevronUp size={13} strokeWidth={2.5} />
                  : <IconChevronDown size={13} strokeWidth={2.5} />
                }
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-[15px] font-bold text-text-primary leading-snug mb-1">
            {release.headline}
          </h2>
          <p className="text-[12.5px] text-text-secondary leading-relaxed">
            {release.sub}
          </p>
        </button>

        {/* Features — collapsible */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-4 overflow-hidden"
          >
            {release.features.map((f, i) => (
              <FeatureRow key={f.title} f={f} i={i} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export default function ChangelogModule() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-10"
      >
        {/* Icon row */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #f43f5e 0%, #8B5CF6 55%, #0EA5E9 100%)',
              boxShadow: '0 4px 20px rgba(244,63,94,0.24)',
            }}
          >
            <IconRocket size={22} className="text-white" strokeWidth={1.6} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-text-primary leading-tight tracking-tight">
              Changelog
            </h1>
            <p className="text-[13px] text-text-secondary mt-0.5">
              Personal HQ · Release History
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: RELEASES.length, label: 'Releases', Icon: IconStar, color: '#f43f5e' },
            { value: RELEASES.filter(r => r.type === 'major').length, label: 'Major', Icon: IconRocket, color: '#8B5CF6' },
            { value: RELEASES.reduce((a, r) => a + r.features.length, 0), label: 'Features', Icon: IconSparkles, color: '#0EA5E9' },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-surface"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}
              >
                <s.Icon size={15} style={{ color: s.color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[17px] font-black text-text-primary leading-none">{s.value}</p>
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="h-px bg-border mb-8" />

      {/* Timeline */}
      <div>
        {RELEASES.map((r, i) => (
          <ReleaseCard key={r.version} release={r} index={i} isLatest={i === 0} />
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="text-center py-8 text-[12px] text-text-muted"
      >
        Personal HQ · Built by Rahul · All releases documented
      </motion.div>
    </div>
  );
}
