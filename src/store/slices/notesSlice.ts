import { type StateCreator } from 'zustand';
import type { AppStore, Note } from '../types';
import { noteService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { safeSetItem } from '../../utils/storage';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface NotesSlice {
  notes: Note[];
  addNote: (note: Note, userId?: string) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>, silent?: boolean) => Promise<void>;
  updateNoteLocally: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;
}

export const createNotesSlice: StateCreator<AppStore, [], [], NotesSlice> = (set, get) => ({
  notes: (() => {
    try {
      const raw = localStorage.getItem('phq_notes');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  addNote: async (note) => {
    if (shouldThrottle('addNote')) return;
    const previous = get().notes;
    const next = [note, ...previous];
    safeSetItem('phq_notes', JSON.stringify(next));
    set({ notes: next });

    const uid = useAuthStore.getState().user?.id;
    if (!uid) {
      useToastStore.getState().addToast('Success', 'Note saved locally', 'success');
      return;
    }

    try {
      await noteService.create(uid, note);
      queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(uid) });
      useToastStore.getState().addToast('Success', 'Note saved to cloud', 'success');
    } catch (error) {
      useToastStore.getState().addToast('Saved Locally', 'Saved locally in workspace', 'info');
    }
  },
  updateNote: async (id, data, silent = false) => {
    const previous = get().notes;
    const uid = useAuthStore.getState().user?.id;
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
    try {
      await noteService.update(id, data);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(uid) });
      if (!silent) {
        useToastStore.getState().addToast('Success', 'Note updated', 'success');
      }
    } catch (error) {
      set({ notes: previous });
      if (!silent) {
        useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update note'), 'error');
      }
      throw error;
    }
  },
  updateNoteLocally: (id: string, data: Partial<Note>) => {
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? { ...n, ...data } : n)),
    }));
  },
  deleteNote: async (id) => {
    const previous = get().notes;
    const uid = useAuthStore.getState().user?.id;
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    try {
      await noteService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.notes.all(uid) });
      useToastStore.getState().addToast('Success', 'Note deleted', 'success');
    } catch (error) {
      set({ notes: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete note'), 'error');
      throw error;
    }
  },
});
