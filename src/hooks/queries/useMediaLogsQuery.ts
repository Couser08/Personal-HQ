import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, SEVEN_MINUTES_MS } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { mediaService } from '../../lib/db';
import type { MediaLog } from '../../store/types';

export function useMediaLogsQuery(userId: string | undefined, tab?: string) {
  return useQuery({
    queryKey: queryKeys.media.all(userId, tab),
    queryFn: async () => {
      if (!userId) return [];
      const logs = await mediaService.fetchAll(userId);
      if (!tab || tab === 'all') return logs;
      return logs.filter((l) => l.type === tab.toLowerCase() || l.type === tab);
    },
    enabled: Boolean(userId),
    staleTime: SEVEN_MINUTES_MS, // 7 minutes
  });
}

export function useMediaMutations(userId: string | undefined) {
  const addMediaLogMutation = useMutation({
    mutationFn: async (log: MediaLog) => {
      if (!userId) throw new Error('User not logged in');
      return mediaService.create(userId, log);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', userId] });
    },
  });

  const updateMediaLogMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MediaLog> }) => {
      return mediaService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', userId] });
    },
  });

  const deleteMediaLogMutation = useMutation({
    mutationFn: async (id: string) => {
      return mediaService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media', userId] });
    },
  });

  return {
    addMediaLogMutation,
    updateMediaLogMutation,
    deleteMediaLogMutation,
  };
}
