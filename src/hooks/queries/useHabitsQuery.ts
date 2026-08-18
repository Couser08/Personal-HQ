import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { habitService, reflectionService } from '../../lib/db';
import type { Habit, DailyReflection } from '../../store/types';

export function useHabitsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.habits.all(userId),
    queryFn: async () => {
      if (!userId) return [];
      return habitService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDailyReflectionsQuery(userId: string | undefined, date?: string) {
  return useQuery({
    queryKey: queryKeys.habits.reflections(userId, date),
    queryFn: async () => {
      if (!userId) return [];
      const all = await reflectionService.fetchAll(userId);
      if (date) {
        return all.filter((r) => r.date === date);
      }
      return all;
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useHabitMutations(userId: string | undefined) {
  const addHabitMutation = useMutation({
    mutationFn: async (habit: Habit) => {
      if (!userId) throw new Error('User not logged in');
      return habitService.create(userId, habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(userId) });
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      return habitService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(userId) });
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async (id: string) => {
      return habitService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.all(userId) });
    },
  });

  const addReflectionMutation = useMutation({
    mutationFn: async (ref: DailyReflection) => {
      if (!userId) throw new Error('User not logged in');
      return reflectionService.create(userId, ref);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(userId) });
    },
  });

  const updateReflectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DailyReflection> }) => {
      return reflectionService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(userId) });
    },
  });

  const deleteReflectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return reflectionService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits.reflections(userId) });
    },
  });

  return {
    addHabitMutation,
    updateHabitMutation,
    deleteHabitMutation,
    addReflectionMutation,
    updateReflectionMutation,
    deleteReflectionMutation,
  };
}
