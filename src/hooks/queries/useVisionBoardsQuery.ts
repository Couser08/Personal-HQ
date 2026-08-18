import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { visionBoardService, visionService } from '../../lib/db';
import { DEFAULT_SEEDED_BOARDS } from '../../store/slices/visionSlice';
import type { VisionBoard, VisionNode, Vision } from '../../store/types';

export function useVisionBoardsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vision.boards(userId),
    queryFn: async () => {
      if (!userId) {
        try {
          const raw = localStorage.getItem('phq_vision_boards');
          return raw ? JSON.parse(raw) : DEFAULT_SEEDED_BOARDS;
        } catch {
          return DEFAULT_SEEDED_BOARDS;
        }
      }

      try {
        const boards = await visionBoardService.fetchAll(userId);
        if (boards && boards.length > 0) {
          return boards;
        }
      } catch (err) {
        console.warn('Could not fetch vision boards from server, checking local fallback:', err);
      }

      // Check localStorage fallback or return default seeded boards
      try {
        const raw = localStorage.getItem('phq_vision_boards');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }

      return DEFAULT_SEEDED_BOARDS;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLegacyVisionsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vision.visions(userId),
    queryFn: async () => {
      if (!userId) return [];
      return visionService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useVisionMutations(userId: string | undefined) {
  const createBoardMutation = useMutation({
    mutationFn: async (board: VisionBoard) => {
      if (!userId) throw new Error('User not logged in');
      return visionBoardService.upsertBoard(userId, board);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });

  const updateBoardMutation = useMutation({
    mutationFn: async (board: VisionBoard) => {
      if (!userId) throw new Error('User not logged in');
      return visionBoardService.upsertBoard(userId, board);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      return visionBoardService.deleteBoard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });

  const createNodeMutation = useMutation({
    mutationFn: async (node: VisionNode) => {
      if (!userId) throw new Error('User not logged in');
      return visionBoardService.upsertNode(userId, node);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });

  const updateNodeMutation = useMutation({
    mutationFn: async (node: VisionNode) => {
      if (!userId) throw new Error('User not logged in');
      return visionBoardService.upsertNode(userId, node);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });

  const deleteNodeMutation = useMutation({
    mutationFn: async (id: string) => {
      return visionBoardService.deleteNode(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.boards(userId) });
    },
  });


  const addLegacyVisionMutation = useMutation({
    mutationFn: async (vision: Vision) => {
      if (!userId) throw new Error('User not logged in');
      return visionService.create(userId, vision);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.visions(userId) });
    },
  });

  const updateLegacyVisionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Vision> }) => {
      return visionService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.visions(userId) });
    },
  });

  const deleteLegacyVisionMutation = useMutation({
    mutationFn: async (id: string) => {
      return visionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vision.visions(userId) });
    },
  });

  return {
    createBoardMutation,
    updateBoardMutation,
    deleteBoardMutation,
    createNodeMutation,
    updateNodeMutation,
    deleteNodeMutation,
    addLegacyVisionMutation,
    updateLegacyVisionMutation,
    deleteLegacyVisionMutation,
  };
}
