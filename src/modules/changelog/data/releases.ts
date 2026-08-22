import { RECENT_RELEASES } from './recentReleases';
import { ARCHIVE_RELEASES } from './archiveReleases';
import type { Release, Feature } from './types';
import { IconBolt, IconPackage, IconDatabase, IconRocket, IconDeviceMobile } from '@tabler/icons-react';

export type { Release, Feature };

export const RELEASES: Release[] = [
  {
    version: 'v4.7.0.1 (Beta)',
    codename: 'Modularization Hotfix',
    date: 'August 22, 2026',
    headline: 'UI Refinements and Core Services Stabilized',
    sub: 'Addressed immediate post-modularization refinements across AI Agents, Core Services, and Mobile Layouts.',
    type: 'patch',
    features: [
      {
        Icon: IconPackage,
        title: 'Core Service Fixes',
        desc: 'Refinements to journalService, visionService, and MockClient ensuring correct bounded data loading.',
        badge: 'Services',
      },
      {
        Icon: IconBolt,
        title: 'AI & Store Optimizations',
        desc: 'Optimized Gemini agents and visionSlice schemas for enhanced stability and strictly typed actions.',
      },
      {
        Icon: IconDeviceMobile,
        title: 'Mobile UI Polish',
        desc: 'Continued layout enhancements specifically targeting MobileBottomNav, MobileHeader, and responsive modals.',
      }
    ],
  },
  {
    version: 'v4.7.0 (Beta)',
    codename: 'Project Modularization',
    date: 'August 22, 2026',
    headline: 'Massive 19,000+ LOC Codebase Modularization & Refactor.',
    sub: 'Executed a sweeping architectural refactor splitting monolithic 2,000+ LOC files into isolated modules. Cleaned up unused files and tables for unprecedented UI and data fetching performance.',
    type: 'major',
    features: [
      {
        Icon: IconBolt,
        title: 'Zero Lag UI (60-120 FPS)',
        desc: 'Isolated subcomponents (e.g., NotebookPageSpread, StickyCard) eliminate DOM thrashing. Canvas zoom, pan, and drag operations are now incredibly smooth as only relevant leaf nodes re-render.',
        badge: 'Render Perf',
      },
      {
        Icon: IconPackage,
        title: 'Bundle Size & Tree-Shaking',
        desc: 'Modular architecture and removal of dead code enable granular Vite route-level chunking. Initial script evaluation time and browser memory footprint have significantly dropped.',
        badge: 'Efficiency',
      },
      {
        Icon: IconDatabase,
        title: 'Database & Egress Optimization',
        desc: 'Removed unused duplicate tables (e.g., link_saver) and organized strict bounded queries via clean domain services (todoService, journalService, etc.). Massive drops in payload size and query latency.',
        badge: 'Network',
      },
      {
        Icon: IconRocket,
        title: 'Instant HMR (< 50ms)',
        desc: 'With all files strictly under 500 lines (mostly 100-250), Vite Hot-Module-Replacement is virtually instantaneous. Full production builds now compile in ~4.7 seconds.',
        badge: 'DX',
      },
    ],
  },
  ...RECENT_RELEASES,
  ...ARCHIVE_RELEASES
];
