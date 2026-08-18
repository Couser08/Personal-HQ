import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { todoProjectService, todoTaskService } from '../../lib/db';
import type { TodoProject, TodoTask } from '../../store/types';

export function useTodoProjectsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.todos.projects(userId),
    queryFn: async () => {
      if (!userId) return [];
      return todoProjectService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTodoTasksQuery(userId: string | undefined, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.todos.tasks(userId, filters),
    queryFn: async () => {
      if (!userId) return [];
      return todoTaskService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTodoMutations(userId: string | undefined) {
  const addTaskMutation = useMutation({
    mutationFn: async (task: TodoTask) => {
      if (!userId) throw new Error('User not logged in');
      return todoTaskService.create(userId, task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(userId) });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TodoTask> }) => {
      return todoTaskService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(userId) });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      return todoTaskService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(userId) });
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (project: TodoProject) => {
      if (!userId) throw new Error('User not logged in');
      return todoProjectService.create(userId, project);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.projects(userId) });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TodoProject> }) => {
      return todoProjectService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.projects(userId) });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return todoProjectService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(userId) });
    },
  });

  return {
    addTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    addProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
  };
}
