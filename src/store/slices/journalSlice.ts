import { type StateCreator } from 'zustand';
import { type AppStore, type JournalEntry, type JournalStickyNote } from '../types';
import { journalService, journalStickyNoteService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { getStoreErrorMessage, normalizeJournalEntry } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface JournalSlice {
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  fetchJournalDetail: (id: string) => Promise<void>;

  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void>;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void>;
  deleteJournalStickyNote: (id: string) => Promise<void>;
}

export const createJournalSlice: StateCreator<
  AppStore,
  [],
  [],
  JournalSlice
> = (set, get) => ({
  journals: (() => {
    try {
      const raw = localStorage.getItem('phq_journals');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.map((entry) => normalizeJournalEntry(entry)) : [];
    } catch {
      return [];
    }
  })(),
  journalStickyNotes: (() => {
    try {
      const raw = localStorage.getItem('phq_journal_sticky_notes');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addJournalEntry: async (entry) => {
    const previous = get().journals;
    const next = [entry, ...previous];
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });

    const uid = useAuthStore.getState().user?.id;
    if (!uid) {
      useToastStore.getState().addToast('Success', 'Journal entry saved locally', 'success');
      return;
    }

    try {
      await journalService.create(uid, entry);
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(uid) });
      useToastStore.getState().addToast('Success', 'Journal entry saved', 'success');
    } catch (error) {
      useToastStore.getState().addToast('Saved Locally', 'Saved locally in workspace', 'info');
    }
  },
  updateJournalEntry: async (id, data) => {
    const previous = get().journals;
    const next = previous.map((j) => (j.id === id ? { ...j, ...data } : j));
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    const uid = useAuthStore.getState().user?.id;
    try {
      await journalService.update(id, data, uid);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(uid) });
    } catch (error) {
      console.warn('Journal background sync warning:', error);
    }
  },
  deleteJournalEntry: async (id) => {
    const previous = get().journals;
    const next = previous.filter((j) => j.id !== id);
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    const uid = useAuthStore.getState().user?.id;
    try {
      await journalService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(uid) });
      useToastStore.getState().addToast('Success', 'Journal entry deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete journal entry'), 'error');
      throw error;
    }
  },
  fetchJournalDetail: async (id) => {
    const existing = get().journals.find((j) => j.id === id);
    if (existing && existing.content) return;

    try {
      const detail = await journalService.fetchDetail(id);
      if (detail) {
        set((state) => {
          const next = state.journals.map((j) => (j.id === id ? { ...j, ...detail } : j));
          localStorage.setItem('phq_journals', JSON.stringify(next));
          return { journals: next };
        });
      }
    } catch (error) {
      console.warn('Failed to fetch journal detail on demand:', error);
    }
  },

  addJournalStickyNote: async (note) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().journalStickyNotes;
    const next = [...previous, note];
    localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(next));
    set({ journalStickyNotes: next });
    try {
      await journalStickyNoteService.create(uid, note);
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(uid) });
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save sticky note'), 'error');
      throw error;
    }
  },
  updateJournalStickyNote: async (id, data) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().journalStickyNotes;
    const next = previous.map((n) => (n.id === id ? { ...n, ...data } : n));
    localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(next));
    set({ journalStickyNotes: next });
    try {
      await journalStickyNoteService.update(id, data);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(uid) });
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update sticky note'), 'error');
      throw error;
    }
  },
  deleteJournalStickyNote: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().journalStickyNotes;
    const next = previous.filter((n) => n.id !== id);
    localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(next));
    set({ journalStickyNotes: next });
    try {
      await journalStickyNoteService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(uid) });
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete sticky note'), 'error');
      throw error;
    }
  },

});
