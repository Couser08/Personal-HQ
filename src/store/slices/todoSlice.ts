import { type StateCreator } from 'zustand';
import { type AppStore, type TodoProject, type TodoTask } from '../types';
import { todoProjectService, todoTaskService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';

export interface TodoSlice {
  todoTasks: TodoTask[];
  todoProjects: TodoProject[];

  addTodoProject: (project: TodoProject) => Promise<void>;
  deleteTodoProject: (id: string) => Promise<void>;
  addTodoTask: (task: TodoTask) => Promise<void>;
  updateTodoTask: (id: string, data: Partial<TodoTask>) => Promise<void>;
  deleteTodoTask: (id: string) => Promise<void>;
  restoreTodoTask: (id: string) => Promise<void>;
  emptyTodoTrash: () => Promise<void>;
}

export const createTodoSlice: StateCreator<
  AppStore,
  [],
  [],
  TodoSlice
> = (set, get) => ({
  todoTasks: (() => {
    try {
      const raw = localStorage.getItem('phq_todo_tasks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  todoProjects: (() => {
    try {
      const raw = localStorage.getItem('phq_todo_projects');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addTodoProject: async (project) => {
    if (shouldThrottle('addTodoProject')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().todoProjects;
    const next = [...previous, project];
    localStorage.setItem('phq_todo_projects', JSON.stringify(next));
    set({ todoProjects: next });
    try {
      const savedInDb = await todoProjectService.create(uid, project);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Project saved to ${location}`, 'success');
    } catch (error) {
      localStorage.setItem('phq_todo_projects', JSON.stringify(previous));
      set({ todoProjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create project'), 'error');
      throw error;
    }
  },
  
  deleteTodoProject: async (id) => {
    const previousProjects = get().todoProjects;
    const previousTasks = get().todoTasks;
    const nextProjects = previousProjects.filter(p => p.id !== id);
    const nextTasks = previousTasks.filter(t => t.projectId !== id);
    localStorage.setItem('phq_todo_projects', JSON.stringify(nextProjects));
    localStorage.setItem('phq_todo_tasks', JSON.stringify(nextTasks));
    set({ todoProjects: nextProjects, todoTasks: nextTasks });
    try {
      await todoProjectService.delete(id);
      useToastStore.getState().addToast('Success', 'Project deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_todo_projects', JSON.stringify(previousProjects));
      localStorage.setItem('phq_todo_tasks', JSON.stringify(previousTasks));
      set({ todoProjects: previousProjects, todoTasks: previousTasks });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete project'), 'error');
      throw error;
    }
  },
  
  addTodoTask: async (task) => {
    if (shouldThrottle('addTodoTask')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().todoTasks;
    const next = [task, ...previous];
    localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
    set({ todoTasks: next });
    try {
      const savedInDb = await todoTaskService.create(uid, task);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Task saved to ${location}`, 'success');
    } catch (error) {
      localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create task'), 'error');
      throw error;
    }
  },
  
  updateTodoTask: async (id, data) => {
    const previous = get().todoTasks;
    const next = previous.map(t => t.id === id ? { ...t, ...data } : t);
    localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
    set({ todoTasks: next });

    if (data.completed === true || data.deleted === true) {
      const activeFocusItem = get().activeFocusItem;
      if (activeFocusItem && activeFocusItem.type === 'todo' && activeFocusItem.id === id) {
        get().setActiveFocusItem(null);
      }
    }

    try {
      await todoTaskService.update(id, data);
    } catch (error) {
      localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not update task', 'error');
    }
  },
  
  deleteTodoTask: async (id) => {
    const task = get().todoTasks.find(t => t.id === id);
    if (!task) return;
    const previous = get().todoTasks;

    const activeFocusItem = get().activeFocusItem;
    if (activeFocusItem && activeFocusItem.type === 'todo' && activeFocusItem.id === id) {
      get().setActiveFocusItem(null);
    }

    if (task.deleted) {
      const next = previous.filter(t => t.id !== id);
      localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
      set({ todoTasks: next });
      try {
        await todoTaskService.delete(id);
        useToastStore.getState().addToast('Success', 'Task deleted permanently', 'success');
      } catch (error) {
        localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
        set({ todoTasks: previous });
        useToastStore.getState().addToast('Sync Failed', 'Could not delete task permanently', 'error');
      }
    } else {
      const next = previous.map(t => t.id === id ? { ...t, deleted: true } : t);
      localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
      set({ todoTasks: next });
      try {
        await todoTaskService.update(id, { deleted: true });
        useToastStore.getState().addToast('Success', 'Task moved to Trash', 'success');
      } catch (error) {
        localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
        set({ todoTasks: previous });
        useToastStore.getState().addToast('Sync Failed', 'Could not move task to Trash', 'error');
      }
    }
  },

  restoreTodoTask: async (id) => {
    const previous = get().todoTasks;
    const next = previous.map(t => t.id === id ? { ...t, deleted: false } : t);
    localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
    set({ todoTasks: next });
    try {
      await todoTaskService.update(id, { deleted: false });
      useToastStore.getState().addToast('Success', 'Task restored', 'success');
    } catch (error) {
      localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not restore task', 'error');
    }
  },

  emptyTodoTrash: async () => {
    const trashTasks = get().todoTasks.filter(t => t.deleted);
    if (trashTasks.length === 0) return;

    const previous = get().todoTasks;
    const next = previous.filter(t => !t.deleted);
    localStorage.setItem('phq_todo_tasks', JSON.stringify(next));
    set({ todoTasks: next });

    try {
      await Promise.all(trashTasks.map(t => todoTaskService.delete(t.id)));
      useToastStore.getState().addToast('Success', 'Trash emptied', 'success');
    } catch (error) {
      localStorage.setItem('phq_todo_tasks', JSON.stringify(previous));
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not empty Trash', 'error');
    }
  },
});
