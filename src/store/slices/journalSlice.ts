import { type StateCreator } from 'zustand';
import { type AppStore, type JournalEntry } from '../types';
import { journalService, journalStickyNoteService, type JournalStickyNote } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { getStoreErrorMessage, normalizeJournalEntry } from '../helpers';

export interface JournalSlice {
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;

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
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().journals;
    const next = [entry, ...previous];
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      await journalService.create(uid, entry);
      useToastStore.getState().addToast('Success', 'Journal entry saved', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save journal entry'), 'error');
      throw error;
    }
  },
  updateJournalEntry: async (id, data) => {
    const previous = get().journals;
    const next = previous.map((j) => (j.id === id ? { ...j, ...data } : j));
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      const uid = useAuthStore.getState().user?.id;
      await journalService.update(id, data, uid);
      useToastStore.getState().addToast('Success', 'Journal entry updated', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update journal entry'), 'error');
      throw error;
    }
  },
  deleteJournalEntry: async (id) => {
    const previous = get().journals;
    const next = previous.filter((j) => j.id !== id);
    localStorage.setItem('phq_journals', JSON.stringify(next));
    set({ journals: next });
    try {
      await journalService.delete(id);
      useToastStore.getState().addToast('Success', 'Journal entry deleted', 'success');
    } catch (error) {
      localStorage.setItem('phq_journals', JSON.stringify(previous));
      set({ journals: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete journal entry'), 'error');
      throw error;
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
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save sticky note'), 'error');
      throw error;
    }
  },
  updateJournalStickyNote: async (id, data) => {
    const previous = get().journalStickyNotes;
    const next = previous.map((n) => (n.id === id ? { ...n, ...data } : n));
    localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(next));
    set({ journalStickyNotes: next });
    try {
      await journalStickyNoteService.update(id, data);
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update sticky note'), 'error');
      throw error;
    }
  },
  deleteJournalStickyNote: async (id) => {
    const previous = get().journalStickyNotes;
    const next = previous.filter((n) => n.id !== id);
    localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(next));
    set({ journalStickyNotes: next });
    try {
      await journalStickyNoteService.delete(id);
    } catch (error) {
      localStorage.setItem('phq_journal_sticky_notes', JSON.stringify(previous));
      set({ journalStickyNotes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete sticky note'), 'error');
      throw error;
    }
  },
});
