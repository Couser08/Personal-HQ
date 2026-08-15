import { type StateCreator } from 'zustand';
import type { AppStore } from '../useAppStore';
import type { Vision } from '../types';
import { visionService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';

export interface VisionSlice {
  visions: Vision[];
  addVision: (vision: Vision, userId?: string) => Promise<void>;
  updateVision: (id: string, updates: Partial<Vision>) => Promise<void>;
  deleteVision: (id: string) => Promise<void>;
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
});
