import { type StateCreator } from 'zustand';
import type { AppStore, CodeSnippet } from '../types';
import { snippetService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface SnippetsSlice {
  snippets: CodeSnippet[];
  addSnippet: (snippet: CodeSnippet, userId?: string) => Promise<void>;
  updateSnippet: (id: string, data: Partial<CodeSnippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
}

export const createSnippetsSlice: StateCreator<AppStore, [], [], SnippetsSlice> = (set, get) => ({
  snippets: [],
  addSnippet: async (snippet) => {
    if (shouldThrottle('addSnippet')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().snippets;
    set((state) => ({ snippets: [snippet, ...state.snippets] }));
    try {
      await snippetService.create(uid, snippet);
      queryClient.invalidateQueries({ queryKey: queryKeys.snippets.all(uid) });
      useToastStore.getState().addToast('Success', 'Snippet added', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save snippet'), 'error');
      throw error;
    }
  },
  updateSnippet: async (id, data) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().snippets;
    const nextData = { ...data, updatedAt: data.updatedAt ?? new Date().toISOString() };
    set((state) => ({
      snippets: state.snippets.map((s) => (s.id === id ? { ...s, ...nextData } : s)),
    }));
    try {
      await snippetService.update(id, nextData);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.snippets.all(uid) });
      useToastStore.getState().addToast('Success', 'Snippet updated', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update snippet'), 'error');
      throw error;
    }
  },
  deleteSnippet: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().snippets;
    set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }));
    try {
      await snippetService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.snippets.all(uid) });
      useToastStore.getState().addToast('Success', 'Snippet deleted', 'success');
    } catch (error) {
      set({ snippets: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete snippet'), 'error');
      throw error;
    }
  },
});
