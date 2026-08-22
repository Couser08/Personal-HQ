import { type StateCreator } from 'zustand';
import type { AppStore, StockEntry, InterestRecord, StandardCalculation } from '../types';
import { stockService, interestService, standardCalcService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface FinanceSlice {
  stocks: StockEntry[];
  addStock: (entry: StockEntry, userId?: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

  interestHistory: InterestRecord[];
  addInterestRecord: (record: InterestRecord, userId?: string) => Promise<void>;
  deleteInterestRecord: (id: string) => Promise<void>;

  standardHistory: StandardCalculation[];
  addStandardRecord: (record: StandardCalculation) => Promise<void>;
  clearStandardHistory: () => Promise<void>;
}

export const createFinanceSlice: StateCreator<AppStore, [], [], FinanceSlice> = (set, get) => ({
  stocks: [],
  addStock: async (entry) => {
    if (shouldThrottle('addStock')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().stocks;
    set((state) => ({ stocks: [entry, ...state.stocks] }));
    try {
      await stockService.create(uid, entry);
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all(uid) });
      useToastStore.getState().addToast('Success', 'Stock entry saved', 'success');
    } catch (error) {
      set({ stocks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save stock entry'), 'error');
      throw error;
    }
  },
  deleteStock: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().stocks;
    set((state) => ({ stocks: state.stocks.filter((s) => s.id !== id) }));
    try {
      await stockService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all(uid) });
      useToastStore.getState().addToast('Success', 'Stock entry deleted', 'success');
    } catch (error) {
      set({ stocks: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete stock entry'), 'error');
      throw error;
    }
  },

  interestHistory: [],
  addInterestRecord: async (record) => {
    if (shouldThrottle('addInterest')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().interestHistory;
    set((state) => ({ interestHistory: [record, ...state.interestHistory] }));
    try {
      await interestService.create(uid, record);
      queryClient.invalidateQueries({ queryKey: queryKeys.interest.all(uid) });
      useToastStore.getState().addToast('Success', 'Record saved', 'success');
    } catch (error) {
      set({ interestHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save record'), 'error');
      throw error;
    }
  },
  deleteInterestRecord: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().interestHistory;
    set((state) => ({
      interestHistory: state.interestHistory.filter((r) => r.id !== id),
    }));
    try {
      await interestService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.interest.all(uid) });
      useToastStore.getState().addToast('Success', 'Record deleted', 'success');
    } catch (error) {
      set({ interestHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete record'), 'error');
      throw error;
    }
  },

  standardHistory: [],
  addStandardRecord: async (record) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().standardHistory;
    const next = [record, ...previous].slice(0, 20);
    set({ standardHistory: next });
    try {
      await standardCalcService.create(uid, record);
      queryClient.invalidateQueries({ queryKey: queryKeys.standardCalc.all(uid) });
    } catch (error) {
      set({ standardHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save calculation'), 'error');
      throw error;
    }
  },
  clearStandardHistory: async () => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().standardHistory;
    set({ standardHistory: [] });
    try {
      await standardCalcService.clearAll(uid);
      queryClient.invalidateQueries({ queryKey: queryKeys.standardCalc.all(uid) });
    } catch (error) {
      set({ standardHistory: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not clear history'), 'error');
      throw error;
    }
  },
});
