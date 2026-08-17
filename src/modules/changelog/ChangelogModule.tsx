/**
 * ChangelogModule — A dedicated, navigable changelog page.
 *
 * Accessible via the sidebar ("What's New" / changelog link).
 * Displays all releases in a vertical timeline.
 *
 * Design: Minimal-Premium. Soft canvas, floating cards, disciplined accents.
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
  IconUser,
  IconEye,
  IconBug,
  IconShieldLock,
  IconPalette,
  IconCpu,
} from '@tabler/icons-react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';

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
    version: 'v4.6.4 (Beta)',
    codename: 'Vision Overhaul',
    date: 'August 17, 2026',
    headline: 'Complete redesign of the Vision Board with major new features.',
    sub: 'The Vision Board has been rebuilt from scratch! Enjoy a fully redesigned canvas with exciting new features and a fresh aesthetic. (Note: Mobile responsiveness is still in Beta).',
    type: 'major',
    features: [
      {
        Icon: IconEye,
        title: 'Vision Board — Redesigned',
        desc: 'Rebuilt from the ground up! A vastly improved visual canvas with major architectural changes and cool new features for mapping out your goals.',
        badge: 'Redesigned',
      },
      {
        Icon: IconDeviceMobile,
        title: 'Mobile UI (Beta)',
        desc: 'Mobile responsiveness rollout continues, but is still in active beta. Please report any layout issues using the Bug Reporter.',
        badge: 'Beta',
      },
    ],
  },
  {
    version: 'v4.6.3 (Beta)',
    codename: 'Project Architect',
    date: 'August 17, 2026',
    headline: 'Introducing the Project Architect module to plan your complex structures.',
    sub: 'A brand new module designed to help you outline, manage, and template project folder structures and architectures.',
    type: 'minor',
    features: [
      {
        Icon: IconSitemap,
        title: 'Project Structure Module',
        desc: 'New "Project Architect" view added to the Command Palette. Outline files, folders, and architecture before writing a single line of code.',
        badge: 'New',
      },
      {
        Icon: IconPuzzle,
        title: 'Vision & Core Types Restored',
        desc: 'Fixed underlying store typing issues and restored the Vision Board spatial positioning data structures.',
      },
    ],
  },
  {
    version: 'v4.6.2 (Beta)',
    codename: 'Engine & Diagnostics',
    date: 'August 17, 2026',
    headline: 'Performance engine refinement, fully released Bug Reporter, and AI limits.',
    sub: 'Deep refinements to the new Performance Modes from the ground up. The Bug Reporter is now fully released with multi-element group reporting and cross-page navigation.',
    type: 'patch',
    features: [
      {
        Icon: IconCpu,
        title: 'Performance Engine Refinement',
        desc: 'Ground-up refinements to the performance modes (Potato/Balanced/Performance) to ensure absolute stability and correct CSS application.',
      },
      {
        Icon: IconBug,
        title: 'Bug Reporter v1.0',
        desc: 'Fully released! You can now report a "group report" of multiple elements and seamlessly navigate between different pages while in bug reporter mode.',
        badge: 'Released',
      },
      {
        Icon: IconBrain,
        title: 'AI Usage Limit Adjusted',
        desc: 'Daily AI usage limit has been reduced from 1500 to 500 requests to maintain service stability and speed.',
      },
    ],
  },
  {
    version: 'v4.6.1 (Beta)',
    codename: 'Mobile Iteration',
    date: 'August 16, 2026',
    headline: 'Mobile layout improvements, massive AI tuning, and mobile Bug Reporter.',
    sub: 'Continuing the mobile foundation rollout with refinements across several modules. Plus, significant improvements to the AI assistant and mobile bug reporting capabilities.',
    type: 'patch',
    features: [
      {
        Icon: IconDeviceMobile,
        title: 'Mobile Responsiveness Tweaks',
        desc: 'Layout improvements across the Journal, Markdown Editor, Library, and Daily Planner to better support smaller screens. Still under active development.',
        badge: 'Beta',
      },
      {
        Icon: IconBrain,
        title: 'Massive AI Tuning',
        desc: 'Deep optimizations and tuning to the AI system for better context awareness and faster responses.',
      },
      {
        Icon: IconBug,
        title: 'Bug Reporter on Mobile',
        desc: 'The interactive Bug Reporter is now functional on mobile devices (in beta), making it easier to capture UI layout issues directly from your phone.',
        badge: 'Beta',
      },
    ],
  },
  {
    version: 'v4.6.0 (Beta)',
    codename: 'Mobile Foundation',
    date: 'August 15, 2026',
    headline: 'Massive mobile responsiveness update is under development!',
    sub: 'We are completely overhauling the app for mobile devices. Some changes are live now. This is a beta patch — please use the Interactive Bug Reporter (Ctrl+Shift+B) to report any UI glitches and help us develop faster.',
    type: 'minor',
    features: [
      {
        Icon: IconDeviceMobile,
        title: 'Mobile UI — Work in Progress',
        desc: 'New bottom navigation, mobile slide drawers, and responsive headers are being rolled out. Expect layout shifts as we perfect the mobile experience.',
        badge: 'Beta',
      },
      {
        Icon: IconBug,
        title: 'Report Bugs for Fast Development',
        desc: 'Encountered a weird layout on your screen size? Use the new Bug Reporter to snap a visual report instantly so we can fix it.',
      },
    ],
  },
  {
    version: 'v4.5.0',
    codename: 'Velocity & Quality',
    date: 'August 15, 2026',
    headline: 'Performance Engine, Bug Reporter, and Deep UI Polish.',
    sub: 'Massive combined update. Features the new Potato/Balanced/Performance rendering engine, an Interactive Bug Reporter (Ctrl+Shift+B), massive Admin module expansion, and a unified minimal-premium redesign across Dashboards, Habits, and Pomodoro.',
    type: 'major',
    features: [
      {
        Icon: IconCpu,
        title: 'Performance & Rendering Engine',
        desc: 'Toggle between Performance (120 FPS), Balanced (Fluid physics & blur), and Potato (Zero idle CPU, instant snap) modes. Deeply integrated CSS overrides.',
        badge: 'New',
      },
      {
        Icon: IconBug,
        title: 'Interactive Bug Reporter',
        desc: 'New built-in diagnostics tool (Ctrl+Shift+B). Point at any element to instantly capture its ID, styles, position, and visual snapshot.',
        badge: 'New',
      },
      {
        Icon: IconShieldLock,
        title: 'Admin Module — Massive Expansion',
        desc: 'Admin dashboard heavily expanded (+808 lines) to review incoming bug reports, monitor system telemetry, and manage users.',
        badge: 'Expanded',
      },
      {
        Icon: IconLayoutGrid,
        title: 'Dashboard & Habits — Deep Redesign',
        desc: 'Dashboard widgets, HabitCard, HabitModal, and HabitTrackerModule fully updated. Replaced glassmorphism with crisp borders and solid contrasting colours.',
        badge: 'Redesigned',
      },
      {
        Icon: IconClockPlay,
        title: 'Pomodoro Module — Streamlined',
        desc: 'Massive code reduction and visual refresh in the Pomodoro module to ensure it aligns with the clean, flat UI language.',
      },
      {
        Icon: IconPalette,
        title: 'Theme Contrast & Shared Components',
        desc: 'Added new --text-on-accent variables for perfect contrast. Introduced standard ListRow and StatCard components to unify the application.',
      },
    ],
  },
  {
    version: 'v4.4.0',
    codename: 'Vision & Speed',
    date: 'August 14, 2026',
    headline: 'Vision Board arrives. Profile & Changelog redesigned. Study module retired.',
    sub: 'Massive cleanup and forward momentum. The Study module has been fully removed, making way for the new Vision Board. Performance modes are coming soon.',
    type: 'major',
    features: [
      {
        Icon: IconUser,
        title: 'Profile & Changelog — Redesigned',
        desc: 'Both pages have been fully redesigned with a clean, flat, editorial aesthetic. Removed all gradients and glassmorphism for a premium, minimal look.',
        badge: 'Redesigned',
      },
      {
        Icon: IconEye,
        title: 'Vision Board — Added',
        desc: 'New Vision Board module introduced. A dedicated space to map out long-term goals and visualise your future.',
        badge: 'New',
      },
      {
        Icon: IconTrash,
        title: 'Study Module — Removed',
        desc: 'The Study module (Dashboards, Timers, Workspaces) has been entirely removed from the codebase to streamline the app\'s core focus.',
        badge: 'Removed',
      },
      {
        Icon: IconBolt,
        title: 'Performance Modes — Coming Soon',
        desc: 'Groundwork laid for upcoming performance profiles: Power (max animations), Default, and Potato (zero animations for maximum battery/speed).',
        badge: 'Upcoming',
      },
    ],
  },
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
      className="flex items-start gap-4"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 bg-surface-alt text-text-secondary"
      >
        <f.Icon size={20} strokeWidth={1.5} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[15px] font-semibold text-text-primary tracking-tight">
            {f.title}
          </span>
          {f.badge && (
            <span
              className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full ${
                f.badge === 'New' ? 'bg-accent-success/10 text-accent-success' : 
                f.badge === 'Removed' ? 'bg-rose-500/10 text-rose-500' :
                'bg-surface-alt text-text-secondary'
              }`}
            >
              {f.badge}
            </span>
          )}
        </div>
        <p className="text-[14px] leading-relaxed text-text-secondary">
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
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0 pt-2">
        <div
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLatest ? 'bg-text-primary' : 'bg-surface-alt border border-border-hairline'}`}
        />
        <div
          className="w-px flex-1 mt-3 bg-border-hairline"
        />
      </div>

      {/* Card */}
      <div className="flex-1 min-w-0 pb-12">
        <Card padding="md" className="group transition-shadow">
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full text-left cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[16px] font-bold text-text-primary tracking-tight">
                  {release.version}
                </span>
                <span className="text-[13px] font-medium text-text-secondary">
                  {release.codename}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-alt text-text-muted font-medium">
                  {release.type.toUpperCase()}
                </span>
                {isLatest && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-highlight/10 text-accent-highlight">
                    LATEST
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 pt-0.5 text-text-muted">
                <span className="text-[12px]">{release.date}</span>
                {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </div>
            </div>
            <h2 className="text-[18px] font-semibold text-text-primary leading-snug mb-1">
              {release.headline}
            </h2>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-3xl">
              {release.sub}
            </p>
          </button>

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-4 pt-4 border-t border-border-hairline overflow-hidden"
            >
              <div className="flex flex-col gap-6">
                {release.features.map((f, i) => (
                  <FeatureRow key={f.title} f={f} i={i} />
                ))}
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

type TabFilter = 'all' | 'new' | 'updates' | 'fixes';

export default function ChangelogModule() {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredReleases = RELEASES.map(r => {
    let filteredFeatures = r.features;
    if (activeTab === 'new') {
      filteredFeatures = r.features.filter(f => f.badge === 'New');
    } else if (activeTab === 'updates') {
      filteredFeatures = r.features.filter(f => !f.badge || f.badge === 'Upgraded' || f.badge === 'Improved');
    } else if (activeTab === 'fixes') {
      filteredFeatures = r.features.filter(f => f.badge === 'Fixed');
    }
    return { ...r, features: filteredFeatures };
  }).filter(r => r.features.length > 0);
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: RELEASES.length, label: 'Releases', Icon: IconStar },
            { value: RELEASES.filter(r => r.type === 'major').length, label: 'Major Updates', Icon: IconRocket },
            { value: RELEASES.reduce((a, r) => a + r.features.length, 0), label: 'Features Shipped', Icon: IconSparkles },
          ].map(s => (
            <StatCard key={s.label} label={s.label} value={s.value} icon={<s.Icon size={20} />} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-border-hairline pb-4 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all', label: 'All Changes' },
          { id: 'new', label: 'New Features' },
          { id: 'updates', label: 'Updates & Improvements' },
          { id: 'fixes', label: 'Bug Fixes' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabFilter)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-text-primary text-surface'
                : 'bg-surface-alt text-text-secondary hover:bg-surface-alt/70 hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Flat Timeline */}
      <div>
        {filteredReleases.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            No changes found for this category.
          </div>
        ) : (
          filteredReleases.map((r, i) => (
            <ReleaseCard key={r.version} release={r} index={i} isLatest={i === 0 && activeTab === 'all'} />
          ))
        )}
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
