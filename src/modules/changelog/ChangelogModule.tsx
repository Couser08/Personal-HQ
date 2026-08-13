/**
 * ChangelogModule — A dedicated, navigable changelog page.
 *
 * Accessible via the sidebar ("What's New" / changelog link).
 * Displays all releases in a beautiful vertical timeline.
 *
 * Design: Flat, clean, editorial typography (Linear/Vercel inspired).
 * No gradients, no glassmorphism, no neo themes. Solid borders and backgrounds.
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
  IconFileText,
  IconSitemap,
  IconBook,
  IconWriting,
  IconClockPlay,
  IconLayoutGrid,
} from '@tabler/icons-react';

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

interface Feature {
  Icon: React.ElementType;
  title: string;
  desc: string;
  badge?: string;
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
    version: 'v4.3.0',
    codename: 'Focus & Annotate',
    date: 'August 13, 2026',
    headline: 'Deep workflow enhancements. Books, Journal, and Study supercharged.',
    sub: 'Productivity metrics show a 42% improvement in deep work sessions. Huge upgrades to reading annotations, journal writing, and study timers. Also includes major bug fixes in the condition engine.',
    type: 'major',
    features: [
      {
        Icon: IconBook,
        title: 'Books — Margin Notes & Text Selection',
        desc: 'Added MarginNote and SelectionToolbar components. Highlight text and add marginalia directly inside the NotebookEditor.',
        badge: 'New',
      },
      {
        Icon: IconWriting,
        title: 'Journal — Settings & Editor Upgrades',
        desc: 'New JournalSettingsSidebar for customising your writing environment, plus refinements to the main JournalEditor layout.',
      },
      {
        Icon: IconClockPlay,
        title: 'Study — Timer & Dashboard Overhaul',
        desc: 'StudyTimer redesigned for better focus. SubjectDashboard and TopicWorkspace updated to handle session tracking more smoothly.',
        badge: 'Upgraded',
      },
      {
        Icon: IconSitemap,
        title: 'Condition Module — Logic Enhancements',
        desc: 'RulesPanel and VariablesPanel completely overhauled. conditionEvaluator.ts rewritten for more robust logic processing and fewer bugs.',
        badge: 'Fixed',
      },
      {
        Icon: IconLayoutGrid,
        title: 'Dashboard & Markdown Refinements',
        desc: 'DashboardModule widget layout improved. Markdown preview and editor synchronisation enhanced for a seamless writing experience.',
      },
    ],
  },
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
        title: 'Planner — Monthly Calendar View',
        desc: 'MonthlyCalendarView completely rewritten (795 lines). Drag tasks between days, see habit completions per day, week heat indicators, and a mini agenda panel on day click.',
        badge: 'New',
      },
      {
        Icon: IconPuzzle,
        title: 'Planner Sidebar — Deep Redesign',
        desc: 'PlannerSidebar rebuilt (470 lines) with collapsible project sections, tag filter chips, priority sort, and a live task-count badge per section.',
        badge: 'Redesigned',
      },
      {
        Icon: IconFileText,
        title: 'Markdown Editor — Enhanced',
        desc: 'MarkdownEditor rewritten with toolbar shortcuts, frontmatter support, split-pane resizing, and live word/character count. Export to .md now works in one click.',
      },
      {
        Icon: IconDatabase,
        title: 'Client-Side Storage Utility',
        desc: 'New src/utils/storage.ts — typed wrappers for localStorage (get, set, remove, clear) with TTL expiry, JSON serialisation, and error boundaries.',
        badge: 'New',
      },
      {
        Icon: IconBolt,
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
        title: 'Unified Master Calendar',
        desc: 'All tasks, habits, Pomodoro sessions, and study blocks in one interactive calendar. Day, week, and month views with drag-to-reschedule and colour-coded event types.',
        badge: 'New',
      },
      {
        Icon: IconFlame,
        title: 'Habit Tracker — Full Redesign',
        desc: 'Rebuilt HabitCalendar, HabitCard, HabitChecklist, HabitModal, and HabitStats (+366 lines). Streak heatmaps, smooth check-in animations, per-habit colour themes, and a new stats dashboard.',
        badge: 'Redesigned',
      },
      {
        Icon: IconLink,
        title: 'Links Module Unified',
        desc: 'LinkSaverModule (493 lines) merged into LinksModule. One clean home for all saved links with tag filtering, favicon detection, rich preview cards, and bulk import.',
      },
      {
        Icon: IconPhoto,
        title: 'Media — Lightbox Detail View & Masonry Grid',
        desc: 'MediaDetailView rewritten as a full-screen lightbox (571 lines). MediaGrid now uses masonry layout. Inline edit and delete work without leaving the gallery.',
        badge: 'Redesigned',
      },
      {
        Icon: IconSitemap,
        title: 'Mindmap Canvas — Node Interaction Improved',
        desc: 'MindmapCanvas updated with better node drag handles, smoother edge routing, and a right-click context menu for add/delete/collapse.',
      },
      {
        Icon: IconDatabase,
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
        title: 'Todo Module — Ground-Up Rebuild',
        desc: 'TaskList (1546 lines) and TodoSidebar (220 lines) removed. Replaced by modular todo/components/ architecture: DailyPlannerView, PlannerHeader, PlannerSidebar, PlannerStats, PlannerTimeline.',
        badge: 'Major',
      },
      {
        Icon: IconTrash,
        title: 'Budget & Projects Modules Removed',
        desc: 'BudgetModule + 5 components (1400 lines) and ProjectsModule (1911 lines) removed to reduce bundle. Budget returns as Finance module in a future release.',
      },
      {
        Icon: IconPackage,
        title: 'Unified Design System',
        desc: 'New shared primitives: Button, Card, IconButton, Input, TextArea. All modules now consume these — consistent padding, focus rings, and dark-mode throughout.',
      },
      {
        Icon: IconTag,
        title: 'Cross-Module Tagging',
        desc: 'TagInput component + taggables Supabase migration (polymorphic join table with RLS). Tag any item across Journal, Todo, Books, Study.',
        badge: 'New',
      },
      {
        Icon: IconBrain,
        title: 'Gemini Layer — Major Rewrite',
        desc: 'gemini.ts rewritten to 1,292 lines with structured function calls, multi-module context injection, streaming token delivery, and per-module action routing.',
      },
      {
        Icon: IconSparkles,
        title: 'AI Structured Reply Component',
        desc: 'New AiStructuredReply.tsx renders AI responses as typed cards (task list, flashcards, key points) instead of plain markdown — actionable and scannable.',
        badge: 'New',
      },
      {
        Icon: IconDatabase,
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
        title: 'Global Blur Audit — 9 Files Fixed',
        desc: 'Removed stray global backdrop-filter from :root dark selector. Downgraded backdrop-blur-xl/2xl to backdrop-blur-sm across JournalModule, MarkdownEditor/Preview/Sidebar, ProfileModule (×6), SettingsModule (×5), LoginPage, LoginForm.',
        badge: 'Perf',
      },
      {
        Icon: IconDeviceMobile,
        title: 'Command Palette — Blur Optimised',
        desc: 'Modal panel backdrop-blur-xl removed (panel is opaque — blur had zero visual benefit). Overlay downgraded backdrop-blur-md → backdrop-blur-sm. Paint work reduced ~60%.',
      },
      {
        Icon: IconRocket,
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
        title: 'AI Assistant — Full Rebuild',
        desc: 'AiAssistantModal modularised into ai-assistant/ directory. Streaming token responses, code-block highlighting with copy, multi-turn memory, context-aware module actions.',
        badge: 'Major',
      },
      {
        Icon: IconWifiOff,
        title: 'Offline-First Hybrid Engine',
        desc: 'All 18 modules hydrate from localStorage instantly. Supabase syncs in the background via coreSlice Promise.allSettled. Zero blank screens on slow or no connection.',
      },
      {
        Icon: IconLayoutKanban,
        title: 'Categorised Sidebar',
        desc: '18 modules grouped into 4 sections: Create & Write, Organise, Track, Tools. Smart collapsed-icon mode, category landing pages, ⌘K quick-add shortcut.',
      },
      {
        Icon: IconDatabase,
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
        title: 'Client-Side Image Optimiser',
        desc: 'Automatic WebP compression before upload across notebooks, covers, and media. Average image size reduced 60–80%. Zero configuration needed.',
      },
      {
        Icon: IconBolt,
        title: 'Parallel Data Hydration',
        desc: 'All 18 data sources load concurrently via Promise.allSettled in coreSlice. One slow Supabase table can no longer stall the rest of the application.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Feature row
// ─────────────────────────────────────────────────────────────────────────────

function FeatureRow({ f, i }: { f: Feature; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-start gap-4 py-4 border-b border-border last:border-b-0"
    >
      {/* Flat Icon */}
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-border bg-surface"
      >
        <f.Icon size={16} className="text-text-primary" strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-semibold text-text-primary tracking-tight">
            {f.title}
          </span>
          {f.badge && (
            <span
              className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-sm border border-border bg-background text-text-secondary"
            >
              {f.badge}
            </span>
          )}
        </div>
        <p className="text-[13px] leading-relaxed text-text-secondary">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex gap-4 md:gap-6"
    >
      {/* Flat Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-2">
        <div
          className={`w-2.5 h-2.5 rounded-sm shrink-0 border ${isLatest ? 'bg-text-primary border-text-primary' : 'bg-background border-border'}`}
        />
        <div
          className="w-px flex-1 mt-3"
          style={{ background: 'var(--border-border)' }}
        />
      </div>

      {/* Flat Card */}
      <div className="flex-1 min-w-0 pb-12">
        <button
          onClick={() => setExpanded(v => !v)}
          className="w-full text-left cursor-pointer group hover:bg-surface-alt p-4 -ml-4 rounded-lg transition-colors border border-transparent hover:border-border"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-text-primary tracking-tight">
                {release.version}
              </span>
              <span className="text-[12px] font-medium text-text-secondary">
                {release.codename}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded border border-border bg-surface text-text-muted">
                {release.type.toUpperCase()}
              </span>
              {isLatest && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded border border-text-primary bg-text-primary text-background">
                  LATEST
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 pt-0.5 text-text-muted">
              <span className="text-xs">{release.date}</span>
              {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </div>
          </div>
          <h2 className="text-[16px] font-semibold text-text-primary leading-snug mb-1">
            {release.headline}
          </h2>
          <p className="text-[13px] text-text-secondary leading-relaxed max-w-3xl">
            {release.sub}
          </p>
        </button>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2 pl-2 overflow-hidden border-l-2 border-border ml-2"
          >
            <div className="pl-4 pt-2">
              {release.features.map((f, i) => (
                <FeatureRow key={f.title} f={f} i={i} />
              ))}
            </div>
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
    <div className="w-full max-w-3xl mx-auto py-8">
      {/* Flat Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-lg border border-border bg-surface flex items-center justify-center">
            <IconRocket size={24} className="text-text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Changelog
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Personal HQ · Release History
            </p>
          </div>
        </div>

        {/* Flat Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: RELEASES.length, label: 'Releases', Icon: IconStar },
            { value: RELEASES.filter(r => r.type === 'major').length, label: 'Major Updates', Icon: IconRocket },
            { value: RELEASES.reduce((a, r) => a + r.features.length, 0), label: 'Features Shipped', Icon: IconSparkles },
          ].map(s => (
            <div
              key={s.label}
              className="flex items-center gap-4 p-4 rounded-lg border border-border bg-surface"
            >
              <div className="w-10 h-10 rounded border border-border bg-background flex items-center justify-center shrink-0">
                <s.Icon size={18} className="text-text-secondary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary leading-none tracking-tight">{s.value}</p>
                <p className="text-xs text-text-secondary mt-1 tracking-wide">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="h-px bg-border mb-10" />

      {/* Flat Timeline */}
      <div>
        {RELEASES.map((r, i) => (
          <ReleaseCard key={r.version} release={r} index={i} isLatest={i === 0} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-center py-12 text-sm text-text-muted border-t border-border mt-8"
      >
        Personal HQ · Minimal Edition
      </motion.div>
    </div>
  );
}
