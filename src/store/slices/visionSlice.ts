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
  visions: [],

  addVision: async (vision, userId) => {
    const activeUserId = userId || useAuthStore.getState().user?.id;
    set({ visions: [vision, ...get().visions] });
    if (activeUserId) {
      await visionService.create(activeUserId, vision).catch(err => {
        console.error('Failed to create vision in db', err);
        set({ visions: get().visions.filter(v => v.id !== vision.id) });
        throw err;
      });
    }
  },

  updateVision: async (id, updates) => {
    const prev = get().visions;
    set({
      visions: prev.map(v => (v.id === id ? { ...v, ...updates } : v)),
    });
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.update(id, updates).catch(err => {
        console.error('Failed to update vision in db', err);
        set({ visions: prev });
        throw err;
      });
    }
  },

  deleteVision: async (id) => {
    const prev = get().visions;
    set({ visions: prev.filter(v => v.id !== id) });
    const user = useAuthStore.getState().user;
    if (user) {
      await visionService.delete(id).catch(err => {
        console.error('Failed to delete vision in db', err);
        set({ visions: prev });
        throw err;
      });
    }
  },
});
