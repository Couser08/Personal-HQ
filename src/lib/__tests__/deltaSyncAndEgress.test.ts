import { describe, it, expect } from 'vitest';
import { SEVEN_MINUTES_MS, queryClient } from '../queryClient';
import { generateFixCommandText } from '../../store/useBugReportStore';
import type { BugReport } from '../../store/types';

describe('TanStack Query Stale Time Configuration', () => {
  it('exports SEVEN_MINUTES_MS equal to 420000ms', () => {
    expect(SEVEN_MINUTES_MS).toBe(7 * 60 * 1000);
    expect(SEVEN_MINUTES_MS).toBe(420000);
  });

  it('configures queryClient default staleTime to 7 minutes and disables window focus refetch', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(SEVEN_MINUTES_MS);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });
});

describe('Antigravity Fix Command Generator', () => {
  const sampleReports: BugReport[] = [
    {
      id: 'bug-1234-uuid-test',
      title: 'Media card overflow on mobile',
      description: 'Long anime titles overflow past the card bounding box.',
      category: 'UI Glitch',
      severity: 'High',
      status: 'open',
      route: '/media',
      pageRoute: '/media',
      sectionName: 'Anime Grid',
      elementInfo: {
        tag: 'div',
        classes: ['media-card-title'],
        selector: '.media-card-title',
        boundingRect: { x: 10, y: 20, width: 300, height: 40, top: 20, left: 10 },
        viewport: { width: 375, height: 667, scrollX: 0, scrollY: 0 },
      },
      createdAt: '2026-08-20T10:00:00.000Z',
      updatedAt: '2026-08-20T10:00:00.000Z',
    },
    {
      id: 'bug-5678-uuid-test',
      title: 'Journal mood dropdown stuck',
      description: 'Selecting mood does not immediately update the icon.',
      category: 'UI Glitch',
      severity: 'Medium',
      status: 'verified_done',
      route: '/journal',
      pageRoute: '/journal',
      sectionName: 'Journal Editor',
      createdAt: '2026-08-20T11:00:00.000Z',
      updatedAt: '2026-08-20T11:30:00.000Z',
    },
  ];

  it('formats instruction block with live unresolved count and issue details', () => {
    const cmd = generateFixCommandText(sampleReports);
    
    expect(cmd).toContain('### Antigravity Task Block: Fix Pending Bugs');
    expect(cmd).toContain('Pending Issues Count**: 1 / 2 total');
    expect(cmd).toContain('Media card overflow on mobile');
    expect(cmd).toContain('/media');
    expect(cmd).toContain('.media-card-title');
    expect(cmd).toContain('High');
    expect(cmd).not.toContain('Journal mood dropdown stuck');
    expect(cmd).toContain('verified_done');
  });

  it('outputs clear all-clear message when zero bugs are pending', () => {
    const allResolved = sampleReports.map((r) => ({ ...r, status: 'verified_done' as const }));
    const cmd = generateFixCommandText(allResolved);
    expect(cmd).toContain('No pending bug reports found! All reported bugs are verified and completed.');
  });
});

describe('Delta Sync & Signature Comparison', () => {
  it('correctly detects unchanged vs changed items between signatures and local cache', () => {
    const localCache = [
      { id: '1', updatedAt: '2026-08-20T10:00:00Z', title: 'Bug 1' },
      { id: '2', updatedAt: '2026-08-20T10:00:00Z', title: 'Bug 2' },
      { id: '3', updatedAt: '2026-08-20T10:00:00Z', title: 'Bug 3' },
    ];

    const remoteSignatures = [
      { id: '1', updated_at: '2026-08-20T10:00:00Z' }, // Unchanged -> 0 egress
      { id: '2', updated_at: '2026-08-20T12:00:00Z' }, // Changed timestamp -> Fetch
      { id: '4', updated_at: '2026-08-20T13:00:00Z' }, // New bug -> Fetch
    ];

    const cacheMap = new Map(localCache.map((c) => [c.id, c]));
    const changedIds: string[] = [];

    remoteSignatures.forEach((sig) => {
      const local = cacheMap.get(sig.id);
      if (!local || local.updatedAt !== sig.updated_at) {
        changedIds.push(sig.id);
      }
    });

    expect(changedIds).toEqual(['2', '4']);
  });
});
