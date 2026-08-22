import { type StateCreator } from 'zustand';
import type { AppStore, MediaLog } from '../types';
import { mediaService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface MediaSlice {
  mediaLogs: MediaLog[];
  addMediaLog: (log: MediaLog, userId?: string) => Promise<void>;
  updateMediaLog: (id: string, data: Partial<MediaLog>) => Promise<void>;
  deleteMediaLog: (id: string) => Promise<void>;
}

export const createMediaSlice: StateCreator<AppStore, [], [], MediaSlice> = (set, get) => ({
  mediaLogs: (() => {
    try {
      const stored = localStorage.getItem('phq_media_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addMediaLog: async (log) => {
    if (shouldThrottle('addMediaLog')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().mediaLogs;
    set((state) => ({ mediaLogs: [log, ...state.mediaLogs] }));
    try {
      await mediaService.create(uid, log);
      queryClient.invalidateQueries({ queryKey: queryKeys.media.all(uid) });
      useToastStore.getState().addToast('Success', 'Media log added', 'success');
    } catch (error) {
      set({ mediaLogs: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save media log'), 'error');
      throw error;
    }
  },
  updateMediaLog: async (id, data) => {
    const uid = useAuthStore.getState().user?.id;
    set((state) => ({
      mediaLogs: state.mediaLogs.map((m) => (m.id === id ? { ...m, ...data } : m)),
    }));
    await mediaService.update(id, data);
    if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.media.all(uid) });
    useToastStore.getState().addToast('Success', 'Media log updated', 'success');
  },
  deleteMediaLog: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    set((state) => ({ mediaLogs: state.mediaLogs.filter((m) => m.id !== id) }));
    await mediaService.delete(id);
    if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.media.all(uid) });
    useToastStore.getState().addToast('Success', 'Media log deleted', 'success');
  },
});
