import { type StateCreator } from 'zustand';
import { type AppStore, type BudgetCategory, type BudgetTransaction } from '../types';
import { budgetCategoryService, budgetTransactionService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';

export interface BudgetSlice {
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  budgetCategories: BudgetCategory[];
  budgetTransactions: BudgetTransaction[];

  addBudgetCategory: (category: BudgetCategory) => Promise<void>;
  updateBudgetCategory: (id: string, data: Partial<BudgetCategory>) => Promise<void>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  addBudgetTransaction: (transaction: BudgetTransaction) => Promise<void>;
  deleteBudgetTransaction: (id: string) => Promise<void>;
  updateBudgetTransaction: (id: string, data: Partial<BudgetTransaction>) => Promise<void>;
}

export const createBudgetSlice: StateCreator<
  AppStore,
  [],
  [],
  BudgetSlice
> = (set, get) => ({
  selectedCurrency: localStorage.getItem('focusflow_budget_currency') || 'INR',
  setSelectedCurrency: (currency: string) => {
    localStorage.setItem('focusflow_budget_currency', currency);
    set({ selectedCurrency: currency });
  },
  budgetCategories: [],
  budgetTransactions: [],

  addBudgetCategory: async (category) => {
    if (shouldThrottle('addBudgetCategory')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().budgetCategories;
    set((state) => ({ budgetCategories: [...state.budgetCategories, category] }));
    try {
      await budgetCategoryService.create(uid, category);
      useToastStore.getState().addToast('Success', 'Budget category added', 'success');
    } catch (error) {
      set({ budgetCategories: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not add budget category'), 'error');
      throw error;
    }
  },
  updateBudgetCategory: async (id, data) => {
    set((state) => ({
      budgetCategories: state.budgetCategories.map(c => c.id === id ? { ...c, ...data } : c),
    }));
    await budgetCategoryService.update(id, data);
    useToastStore.getState().addToast('Success', 'Budget category updated', 'success');
  },
  deleteBudgetCategory: async (id) => {
    const previousCategories = get().budgetCategories;
    const previousTransactions = get().budgetTransactions;
    set((state) => ({
      budgetCategories: state.budgetCategories.filter(c => c.id !== id),
      budgetTransactions: state.budgetTransactions.filter(t => t.categoryId !== id),
    }));
    try {
      await budgetCategoryService.delete(id);
      useToastStore.getState().addToast('Success', 'Budget category deleted', 'success');
    } catch (error) {
      set({ budgetCategories: previousCategories, budgetTransactions: previousTransactions });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete budget category'), 'error');
      throw error;
    }
  },
  addBudgetTransaction: async (transaction) => {
    if (shouldThrottle('addBudgetTransaction')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().budgetTransactions;
    set((state) => ({ budgetTransactions: [transaction, ...state.budgetTransactions] }));
    try {
      await budgetTransactionService.create(uid, transaction);
      useToastStore.getState().addToast('Success', 'Budget transaction added', 'success');
    } catch (error) {
      set({ budgetTransactions: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save transaction'), 'error');
      throw error;
    }
  },
  deleteBudgetTransaction: async (id) => {
    set((state) => ({ budgetTransactions: state.budgetTransactions.filter(t => t.id !== id) }));
    await budgetTransactionService.delete(id);
    useToastStore.getState().addToast('Success', 'Budget transaction deleted', 'success');
  },
  updateBudgetTransaction: async (id, data) => {
    const previous = get().budgetTransactions;
    set((state) => ({
      budgetTransactions: state.budgetTransactions.map(t => t.id === id ? { ...t, ...data } : t)
    }));
    try {
      await budgetTransactionService.update(id, data);
      useToastStore.getState().addToast('Success', 'Transaction updated', 'success');
    } catch (error) {
      set({ budgetTransactions: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update transaction'), 'error');
      throw error;
    }
  },
});
