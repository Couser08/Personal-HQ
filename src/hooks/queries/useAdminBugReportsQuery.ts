import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { bugReportService } from '../../lib/db';
import type { BugReport, BugReportStatus } from '../../store/types';

export function useBugReportsQuery(isAdmin: boolean, userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.admin.bugReports({ isAdmin, userId }),
    queryFn: async (): Promise<BugReport[]> => {
      if (isAdmin) {
        return bugReportService.fetchForAdmin();
      }
      return bugReportService.fetchAll(userId);
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useBugReportMutations(isAdmin: boolean, userId: string | undefined) {
  const queryKey = queryKeys.admin.bugReports({ isAdmin, userId });

  const createBugReportMutation = useMutation({
    mutationFn: async (report: BugReport) => {
      return bugReportService.create(report);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BugReportStatus }) => {
      return bugReportService.updateStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteBugReportMutation = useMutation({
    mutationFn: async (id: string) => {
      return bugReportService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    createBugReportMutation,
    updateBugStatusMutation,
    deleteBugReportMutation,
  };
}
