import { supabase } from '../supabase';
import type { TodoProject, TodoTask } from '../../store/types';

export const todoProjectService = {
  async fetchAll(userId: string, limit = 50): Promise<TodoProject[]> {
    const { data, error } = await supabase
      .from('todo_projects')
      .select('id, name, color')
      .eq('user_id', userId)
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
    }));
  },

  async create(userId: string, project: TodoProject): Promise<boolean> {
    try {
      const { error } = await supabase.from('todo_projects').insert({
        id: project.id,
        user_id: userId,
        name: project.name,
        color: project.color,
      });
      if (error) {
        console.warn('TodoProject Create Error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('TodoProject Create Exception:', e);
      return false;
    }
  },

  async update(id: string, updates: Partial<TodoProject>) {
    try {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.color !== undefined) payload.color = updates.color;
      const { error } = await supabase.from('todo_projects').update(payload).eq('id', id);
      if (error) console.warn('TodoProject Update Error:', error);
    } catch (e) {
      console.warn('TodoProject Update Exception:', e);
    }
  },

  async delete(id: string) {
    try {
      const { error: taskError } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('project_id', id);
      if (taskError) {
        console.warn('TodoTasks Delete Error:', taskError);
      }

      const { error } = await supabase.from('todo_projects').delete().eq('id', id);
      if (error) {
        console.warn('TodoProject Delete Error:', error);
      }
    } catch (e) {
      console.warn('TodoProject Delete Exception:', e);
    }
  },
};

const TODO_OPTIONAL_COLUMNS = ['subtasks', 'deleted', 'start_time', 'end_time', 'pomodoro_count'];

const isMissingTodoColumnError = (error: unknown) => {
  const text = [
    typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message ?? '') : '',
    typeof error === 'object' && error !== null && 'details' in error ? String((error as { details?: unknown }).details ?? '') : '',
    typeof error === 'object' && error !== null && 'hint' in error ? String((error as { hint?: unknown }).hint ?? '') : '',
  ].join(' ').toLowerCase();

  return TODO_OPTIONAL_COLUMNS.some((column) => text.includes(column));
};

const buildTodoTaskBasePayload = (userId: string, task: TodoTask) => ({
  id: task.id,
  user_id: userId,
  project_id: task.projectId,
  title: task.title,
  completed: task.completed,
  priority: task.priority,
  tags: task.tags,
  due_date: task.dueDate,
  created_at: task.createdAt,
});

const buildTodoTaskOptionalPayload = (task: TodoTask) => ({
  start_time: task.startTime,
  end_time: task.endTime,
  pomodoro_count: task.pomodoroCount ?? 0,
  deleted: task.deleted ?? false,
  subtasks: task.subtasks ?? [],
});

const buildTodoTaskUpdateBasePayload = (data: Partial<TodoTask>) => ({
  ...(data.projectId !== undefined && { project_id: data.projectId }),
  ...(data.title !== undefined && { title: data.title }),
  ...(data.completed !== undefined && { completed: data.completed }),
  ...(data.priority !== undefined && { priority: data.priority }),
  ...(data.tags !== undefined && { tags: data.tags }),
  ...(data.dueDate !== undefined && { due_date: data.dueDate }),
});

const buildTodoTaskUpdateOptionalPayload = (data: Partial<TodoTask>) => ({
  ...(data.startTime !== undefined && { start_time: data.startTime }),
  ...(data.endTime !== undefined && { end_time: data.endTime }),
  ...(data.pomodoroCount !== undefined && { pomodoro_count: data.pomodoroCount }),
  ...(data.deleted !== undefined && { deleted: data.deleted }),
  ...(data.subtasks !== undefined && { subtasks: data.subtasks }),
});

export const todoTaskService = {
  async fetchAll(userId: string, limit = 100): Promise<TodoTask[]> {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      projectId: r.project_id,
      title: r.title,
      completed: r.completed,
      priority: r.priority,
      tags: r.tags ?? [],
      dueDate: r.due_date,
      startTime: r.start_time,
      endTime: r.end_time,
      pomodoroCount: r.pomodoro_count ?? 0,
      deleted: r.deleted ?? false,
      createdAt: r.created_at,
      subtasks: r.subtasks ?? [],
    }));
  },

  async create(userId: string, task: TodoTask): Promise<boolean> {
    try {
      const basePayload = buildTodoTaskBasePayload(userId, task);
      const primaryPayload = { ...basePayload, ...buildTodoTaskOptionalPayload(task) };

      let { error } = await supabase.from('todo_tasks').insert(primaryPayload);

      if (error && isMissingTodoColumnError(error)) {
        ({ error } = await supabase.from('todo_tasks').insert(basePayload));
      }

      if (error) {
        console.warn('TodoTask Create Error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('TodoTask Create Exception:', e);
      return false;
    }
  },

  async update(id: string, data: Partial<TodoTask>) {
    try {
      const basePayload = buildTodoTaskUpdateBasePayload(data);
      const primaryPayload = { ...basePayload, ...buildTodoTaskUpdateOptionalPayload(data) };

      if (Object.keys(primaryPayload).length === 0) return;

      let { error } = await supabase.from('todo_tasks').update(primaryPayload).eq('id', id);

      if (error && isMissingTodoColumnError(error)) {
        if (Object.keys(basePayload).length > 0) {
          ({ error } = await supabase.from('todo_tasks').update(basePayload).eq('id', id));
        } else {
          return;
        }
      }

      if (error) {
        console.warn('TodoTask Update Error:', error);
      }
    } catch (e) {
      console.warn('TodoTask Update Exception:', e);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from('todo_tasks').delete().eq('id', id);
      if (error) {
        console.warn('TodoTask Delete Error:', error);
      }
    } catch (e) {
      console.warn('TodoTask Delete Exception:', e);
    }
  },
};
