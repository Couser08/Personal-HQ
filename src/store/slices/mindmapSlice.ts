import { type StateCreator } from 'zustand';
import { type AppStore, type Mindmap } from '../types';
import { mindmapService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { getStoreErrorMessage } from '../helpers';

export interface MindmapSlice {
  mindmaps: Mindmap[];
  addMindmap: (mindmap: Mindmap) => Promise<void>;
  updateMindmap: (id: string, data: Partial<Mindmap>) => Promise<void>;
  deleteMindmap: (id: string) => Promise<void>;
}

export const createMindmapSlice: StateCreator<
  AppStore,
  [],
  [],
  MindmapSlice
> = (set, get) => ({
  mindmaps: (() => {
    try {
      const raw = localStorage.getItem('phq_mindmaps');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addMindmap: async (mindmap) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().mindmaps;
    const next = [mindmap, ...previous];
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.create(uid, mindmap);
      useToastStore.getState().addToast('Success', 'Mindmap created', 'success');
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save mindmap'), 'error');
      throw error;
    }
  },
  updateMindmap: async (id, data) => {
    const previous = get().mindmaps;
    const next = previous.map((m) => (m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m));
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.update(id, data);
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save mindmap edits'), 'error');
      throw error;
    }
  },
  deleteMindmap: async (id) => {
    const previous = get().mindmaps;
    const next = previous.filter((m) => m.id !== id);
    localStorage.setItem('phq_mindmaps', JSON.stringify(next));
    set({ mindmaps: next });
    try {
      await mindmapService.delete(id);
      useToastStore.getState().addToast('Success', 'Mindmap deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_mindmaps', JSON.stringify(previous));
      set({ mindmaps: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete mindmap'), 'error');
      throw error;
    }
  },
});
