import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import {
  snippetService,
  noteService,
  countdownService,
  stockService,
  interestService,
  standardCalcService,
  devGoalService,
  tilLogService,
  roadmapService,
  resourceService,
  studyMaterialService,
  examService,
  examAttemptService,
  projectStructureService,
  settingsService,
  mindmapService,
} from '../../lib/db';

// ─── Settings Query ──────────────────────────────────────────────────────────

export function useSettingsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.settings(userId),
    queryFn: async () => {
      if (!userId) return null;
      return settingsService.fetch(userId);
    },
    enabled: Boolean(userId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSettingsMutation(userId: string | undefined) {
  return useMutation({
    mutationFn: async (settings: any) => {
      if (!userId) throw new Error('User not logged in');
      return settingsService.upsert(userId, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings(userId) });
    },
  });
}

// ─── Snippets ────────────────────────────────────────────────────────────────
export function useSnippetsQuery(userId: string | undefined, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.snippets.all(userId, filters),
    queryFn: async () => {
      if (!userId) return [];
      const snippets = await snippetService.fetchAll(userId);
      if (!filters) return snippets;
      return snippets.filter((s) => {
        if (filters.language && s.language !== filters.language) return false;
        if (filters.tag && !s.tags?.includes(filters.tag)) return false;
        return true;
      });
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ─── Notes ───────────────────────────────────────────────────────────────────
export function useNotesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.notes.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return noteService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ─── Mindmaps ────────────────────────────────────────────────────────────────
export function useMindmapsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.mindmaps.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return mindmapService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 3 * 60 * 1000,
  });
}

// ─── Countdowns ──────────────────────────────────────────────────────────────
export function useCountdownsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.countdowns.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return countdownService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Stocks ──────────────────────────────────────────────────────────────────
export function useStocksQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.stocks.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return stockService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000, // 1 minute
  });
}

// ─── Interest Records ────────────────────────────────────────────────────────
export function useInterestHistoryQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.interest.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return interestService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Standard Calc History ───────────────────────────────────────────────────
export function useStandardCalcHistoryQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.standardCalc.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return standardCalcService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Dev Goals ───────────────────────────────────────────────────────────────
export function useDevGoalsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.devGoals.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return devGoalService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 3 * 60 * 1000,
  });
}

// ─── TIL Logs ────────────────────────────────────────────────────────────────
export function useTilLogsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.til.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return tilLogService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 3 * 60 * 1000,
  });
}

// ─── Roadmaps ────────────────────────────────────────────────────────────────
export function useRoadmapsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.roadmaps.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return roadmapService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Resources ───────────────────────────────────────────────────────────────
export function useResourcesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.resources.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return resourceService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Study Materials & Exams ─────────────────────────────────────────────────
export function useStudyMaterialsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.study.materials(userId),
    queryFn: async () => {
      if (!userId) return [];
      return studyMaterialService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExamsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.study.exams(userId),
    queryFn: async () => {
      if (!userId) return [];
      return examService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExamAttemptsQuery(userId: string | undefined, examId?: string) {
  return useQuery({
    queryKey: queryKeys.study.attempts(userId, examId),
    queryFn: async () => {
      if (!userId) return [];
      const all = await examAttemptService.fetchAll(userId);
      if (examId) return all.filter((a) => a.examId === examId);
      return all;
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

// ─── Project Structures ──────────────────────────────────────────────────────
export function useProjectStructuresQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projectStructure.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return projectStructureService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}
