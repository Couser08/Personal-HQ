import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, SEVEN_MINUTES_MS } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { linkService, linkSaverService, tagService } from '../../lib/db';
import type { Link, SavedLink, AppTag } from '../../store/types';

export function useLinksQuery(userId: string | undefined, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.links.all(userId, filters),
    queryFn: async () => {
      if (!userId) return [];
      const links = await linkService.fetchAll(userId);
      if (!filters) return links;
      return links.filter((l) => {
        if (filters.type && l.type !== filters.type) return false;
        if (filters.termType && l.termType !== filters.termType) return false;
        if (filters.tag && !l.tags?.includes(filters.tag)) return false;
        return true;
      });
    },
    enabled: Boolean(userId),
    staleTime: SEVEN_MINUTES_MS, // 7 minutes
  });
}

export function useSavedLinksQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.links.saved(userId),
    queryFn: async () => {
      if (!userId) return [];
      return linkSaverService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: SEVEN_MINUTES_MS, // 7 minutes
  });
}

export function useTagsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tags.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return tagService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: SEVEN_MINUTES_MS, // 7 minutes
  });
}

export function useLinkMutations(userId: string | undefined) {
  const addLinkMutation = useMutation({
    mutationFn: async (link: Link) => {
      if (!userId) throw new Error('User not logged in');
      return linkService.create(userId, link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all(userId) });
    },
  });

  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Link> }) => {
      return linkService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all(userId) });
    },
  });

  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return linkService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all(userId) });
    },
  });

  const addSavedLinkMutation = useMutation({
    mutationFn: async (link: SavedLink) => {
      if (!userId) throw new Error('User not logged in');
      return linkSaverService.create(userId, link);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.saved(userId) });
    },
  });

  const deleteSavedLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      return linkSaverService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.saved(userId) });
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async (tag: AppTag) => {
      if (!userId) throw new Error('User not logged in');
      return tagService.create(userId, tag);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(userId) });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppTag> }) => {
      return tagService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(userId) });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: async (id: string) => {
      return tagService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(userId) });
    },
  });

  return {
    addLinkMutation,
    updateLinkMutation,
    deleteLinkMutation,
    addSavedLinkMutation,
    deleteSavedLinkMutation,
    addTagMutation,
    updateTagMutation,
    deleteTagMutation,
  };
}
