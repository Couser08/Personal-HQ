import { type StateCreator } from 'zustand';
import type { AppStore, Countdown } from '../types';
import { countdownService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface CountdownsSlice {
  countdowns: Countdown[];
  addCountdown: (countdown: Countdown, userId?: string) => Promise<void>;
  deleteCountdown: (id: string) => Promise<void>;
}

export const createCountdownsSlice: StateCreator<AppStore, [], [], CountdownsSlice> = (set, get) => ({
  countdowns: (() => {
    try {
      const stored = localStorage.getItem('phq_countdowns');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addCountdown: async (countdown) => {
    if (shouldThrottle('addCountdown')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().countdowns;
    set((state) => ({ countdowns: [countdown, ...state.countdowns] }));
    try {
      await countdownService.create(uid, countdown);
      queryClient.invalidateQueries({ queryKey: queryKeys.countdowns.all(uid) });
      useToastStore.getState().addToast('Success', 'Countdown created', 'success');
    } catch (error) {
      set({ countdowns: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not create countdown'), 'error');
      throw error;
    }
  },
  deleteCountdown: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    set((state) => ({ countdowns: state.countdowns.filter((c) => c.id !== id) }));
    await countdownService.delete(id);
    if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.countdowns.all(uid) });
    useToastStore.getState().addToast('Success', 'Countdown deleted', 'success');
  },
});
