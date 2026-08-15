import { type StateCreator } from 'zustand';
import type { AppStore } from '../useAppStore';
import type { Vision, VisionTask } from '../types';
import { visionService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';

export interface VisionSlice {
  visions: Vision[];
  addVision: (vision: Vision, userId?: string) => Promise<void>;
  updateVision: (id: string, updates: Partial<Vision>) => Promise<void>;
  deleteVision: (id: string) => Promise<void>;
  updateVisionPosition: (id: string, position: { x: number; y: number }, rotation?: number) => Promise<void>;
  assignTaskToVision: (visionId: string, taskId: string) => Promise<void>;
  unassignTaskFromVision: (visionId: string, taskId: string) => Promise<void>;
  addVisionTask: (visionId: string, taskTitle: string, dueDate?: string, priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  toggleVisionTask: (visionId: string, taskId: string) => Promise<void>;
  deleteVisionTask: (visionId: string, taskId: string) => Promise<void>;
}

export const createVisionSlice: StateCreator<AppStore, [], [], VisionSlice> = (set, get) => ({
  visions: (() => {
    try {
      const raw = localStorage.getItem('phq_visions');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addVision: async (vision, userId) => {
    const activeUserId = userId || useAuthStore.getState().user?.id;
    const next = [vision, ...get().visions];
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    if (activeUserId) {
      await visionService.create(activeUserId, vision).catch(err => {
        console.error('Failed to create vision in db', err);
        const rollback = get().visions.filter(v => v.id !== vision.id);
        set({ visions: rollback });
        localStorage.setItem('phq_visions', JSON.stringify(rollback));
        throw err;
      });
    }
  },

  updateVision: async (id, updates) => {
    const prev = get().visions;
    const next = prev.map(v => (v.id === id ? { ...v, ...updates } : v));
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.update(id, updates).catch(err => {
        console.error('Failed to update vision in db', err);
        set({ visions: prev });
        localStorage.setItem('phq_visions', JSON.stringify(prev));
        throw err;
      });
    }
  },

  deleteVision: async (id) => {
    const prev = get().visions;
    const next = prev.filter(v => v.id !== id);
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.delete(id).catch(err => {
        console.error('Failed to delete vision in db', err);
        set({ visions: prev });
        localStorage.setItem('phq_visions', JSON.stringify(prev));
        throw err;
      });
    }
  },

  updateVisionPosition: async (id, position, rotation) => {
    const prev = get().visions;
    const next = prev.map(v => (v.id === id ? { ...v, position, ...(rotation !== undefined ? { rotation } : {}) } : v));
    set({ visions: next });
    localStorage.setItem('phq_visions', JSON.stringify(next));
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.update(id, { position, ...(rotation !== undefined ? { rotation } : {}) }).catch(err => {
        console.error('Failed to update vision position in db', err);
      });
    }
  },

  assignTaskToVision: async (visionId, taskId) => {
    const vision = get().visions.find(v => v.id === visionId);
    if (!vision) return;
    const currentLinked = vision.linkedTaskIds || [];
    if (currentLinked.includes(taskId)) return;

    const newLinked = [...currentLinked, taskId];
    await get().updateVision(visionId, { linkedTaskIds: newLinked });
  },

  unassignTaskFromVision: async (visionId, taskId) => {
    const vision = get().visions.find(v => v.id === visionId);
    if (!vision) return;
    const currentLinked = vision.linkedTaskIds || [];
    const newLinked = currentLinked.filter(id => id !== taskId);
    await get().updateVision(visionId, { linkedTaskIds: newLinked });
  },

  addVisionTask: async (visionId, taskTitle, dueDate, priority = 'medium') => {
    const vision = get().visions.find(v => v.id === visionId);
    if (!vision) return;

    const newTask: VisionTask = {
      id: crypto.randomUUID(),
      title: taskTitle.trim(),
      completed: false,
      dueDate: dueDate || null,
      priority,
    };

    const currentTasks = vision.tasks || [];
    const updatedTasks = [...currentTasks, newTask];

    // Compute progress
    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : vision.progress;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : (progress > 0 ? 'In Progress' : vision.status)
    });

    // Also add to global TodoTask store so it shows in the user's Todo system!
    try {
      await get().addTodoTask({
        id: newTask.id,
        title: newTask.title,
        completed: false,
        priority: newTask.priority || 'medium',
        dueDate: newTask.dueDate || null,
        projectId: null,
        tags: ['vision', vision.category.toLowerCase()],
        createdAt: new Date().toISOString(),
        description: `Linked to Vision: ${vision.title}`,
      });
    } catch (e) {
      console.warn('Could not sync vision task to global todo list:', e);
    }
  },

  toggleVisionTask: async (visionId, taskId) => {
    const vision = get().visions.find(v => v.id === visionId);
    if (!vision) return;

    const currentTasks = vision.tasks || [];
    const updatedTasks = currentTasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : vision.progress;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : (progress > 0 ? 'In Progress' : (vision.status === 'Achieved' ? 'In Progress' : vision.status))
    });

    // Update in global TodoTask store if present
    try {
      const globalTask = get().todoTasks.find(t => t.id === taskId);
      if (globalTask) {
        const targetTask = updatedTasks.find(t => t.id === taskId);
        if (targetTask) {
          await get().updateTodoTask(taskId, { completed: targetTask.completed });
        }
      }
    } catch (e) {
      console.warn('Could not update global todo task:', e);
    }
  },

  deleteVisionTask: async (visionId, taskId) => {
    const vision = get().visions.find(v => v.id === visionId);
    if (!vision) return;

    const currentTasks = vision.tasks || [];
    const updatedTasks = currentTasks.filter(t => t.id !== taskId);

    const total = updatedTasks.length;
    const completed = updatedTasks.filter(t => t.completed).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    await get().updateVision(visionId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'Achieved' : (progress > 0 ? 'In Progress' : 'Not Started')
    });
  },
});
