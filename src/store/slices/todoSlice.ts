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
  todoTasks: [],
  todoProjects: [],

  addTodoProject: async (project) => {
    if (shouldThrottle('addTodoProject')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().todoProjects;
    set((state) => ({ todoProjects: [...state.todoProjects, project] }));
    try {
      const savedInDb = await todoProjectService.create(uid, project);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Project saved to ${location}`, 'success');
    } catch (error) {
      set({ todoProjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create project'), 'error');
      throw error;
    }
  },
  
  deleteTodoProject: async (id) => {
    const previousProjects = get().todoProjects;
    const previousTasks = get().todoTasks;
    set((state) => ({
      todoProjects: state.todoProjects.filter(p => p.id !== id),
      todoTasks: state.todoTasks.filter(t => t.projectId !== id),
    }));
    try {
      await todoProjectService.delete(id);
      useToastStore.getState().addToast('Success', 'Project deleted', 'success');
    } catch (error) {
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
    set((state) => ({ todoTasks: [task, ...state.todoTasks] }));
    try {
      const savedInDb = await todoTaskService.create(uid, task);
      const location = savedInDb ? 'Database' : 'Local Storage';
      useToastStore.getState().addToast('Success', `Task saved to ${location}`, 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create task'), 'error');
      throw error;
    }
  },
  
  updateTodoTask: async (id, data) => {
    set((state) => ({
      todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, ...data } : t),
    }));
    await todoTaskService.update(id, data);
  },
  
  deleteTodoTask: async (id) => {
    const task = get().todoTasks.find(t => t.id === id);
    if (!task) return;

    if (task.deleted) {
      set((state) => ({ todoTasks: state.todoTasks.filter(t => t.id !== id) }));
      await todoTaskService.delete(id);
      useToastStore.getState().addToast('Success', 'Task deleted permanently', 'success');
    } else {
      const previous = get().todoTasks;
      set((state) => ({
        todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, deleted: true } : t)
      }));
      try {
        await todoTaskService.update(id, { deleted: true });
        useToastStore.getState().addToast('Success', 'Task moved to Trash', 'success');
      } catch (error) {
        set({ todoTasks: previous });
        useToastStore.getState().addToast('Sync Failed', 'Could not move task to Trash', 'error');
      }
    }
  },

  restoreTodoTask: async (id) => {
    const previous = get().todoTasks;
    set((state) => ({
      todoTasks: state.todoTasks.map(t => t.id === id ? { ...t, deleted: false } : t)
    }));
    try {
      await todoTaskService.update(id, { deleted: false });
      useToastStore.getState().addToast('Success', 'Task restored', 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not restore task', 'error');
    }
  },

  emptyTodoTrash: async () => {
    const trashTasks = get().todoTasks.filter(t => t.deleted);
    if (trashTasks.length === 0) return;

    const previous = get().todoTasks;
    set((state) => ({ todoTasks: state.todoTasks.filter(t => !t.deleted) }));

    try {
      await Promise.all(trashTasks.map(t => todoTaskService.delete(t.id)));
      useToastStore.getState().addToast('Success', 'Trash emptied', 'success');
    } catch (error) {
      set({ todoTasks: previous });
      useToastStore.getState().addToast('Sync Failed', 'Could not empty Trash', 'error');
    }
  },
});
