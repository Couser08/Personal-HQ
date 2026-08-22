import { type StateCreator } from 'zustand';
import type { AppStore, AppTag } from '../types';
import { tagService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface TagsSlice {
  appTags: AppTag[];
  addAppTag: (tag: AppTag) => Promise<void>;
  updateAppTag: (id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAppTag: (id: string) => Promise<void>;
}

export const createTagsSlice: StateCreator<AppStore, [], [], TagsSlice> = (set, get) => ({
  appTags: (() => {
    try {
      const stored = localStorage.getItem('phq_app_tags');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addAppTag: async (tag: AppTag) => {
    if (shouldThrottle('addAppTag')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().appTags;
    set((state) => ({ appTags: [...state.appTags, tag] }));
    try {
      await tagService.create(uid, tag);
      queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(uid) });
      useToastStore.getState().addToast('Success', 'Tag created in database', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create tag'), 'error');
      throw error;
    }
  },
  updateAppTag: async (id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().appTags;
    set((state) => ({
      appTags: state.appTags.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    try {
      await tagService.update(id, updates);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(uid) });
      useToastStore.getState().addToast('Success', 'Tag updated', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update tag'), 'error');
      throw error;
    }
  },
  deleteAppTag: async (id: string) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().appTags;
    set((state) => ({ appTags: state.appTags.filter((t) => t.id !== id) }));
    try {
      await tagService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.tags.all(uid) });
      useToastStore.getState().addToast('Success', 'Tag deleted', 'success');
    } catch (error) {
      set({ appTags: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete tag'), 'error');
      throw error;
    }
  },
});
