import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { journalService, journalStickyNoteService } from '../../lib/db';
import type { JournalEntry, JournalStickyNote } from '../../store/types';

export function useJournalsQuery(userId: string | undefined, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.journals.all(userId, filters),
    queryFn: async () => {
      if (!userId) return [];
      const entries = await journalService.fetchAll(userId);
      if (!filters) return entries;
      return entries.filter((e) => {
        if (filters.tag && !e.tags?.includes(filters.tag)) return false;
        if (filters.mood && e.mood !== filters.mood) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = e.title.toLowerCase().includes(q);
          const matchContent = e.content.toLowerCase().includes(q);
          if (!matchTitle && !matchContent) return false;
        }
        return true;
      });
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useJournalStickyNotesQuery(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.journals.stickyNotes(userId),
    queryFn: async () => {
      if (!userId) return [];
      return journalStickyNoteService.fetchAll(userId);
    },
    enabled: Boolean(userId),
    staleTime: 2 * 60 * 1000,
  });
}

export function useJournalMutations(userId: string | undefined) {
  const addJournalMutation = useMutation({
    mutationFn: async (entry: JournalEntry) => {
      if (!userId) throw new Error('User not logged in');
      return journalService.create(userId, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(userId) });
    },
  });

  const updateJournalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JournalEntry> }) => {
      return journalService.update(id, data, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(userId) });
    },
  });

  const deleteJournalMutation = useMutation({
    mutationFn: async (id: string) => {
      return journalService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.all(userId) });
    },
  });

  const addStickyNoteMutation = useMutation({
    mutationFn: async (note: JournalStickyNote) => {
      if (!userId) throw new Error('User not logged in');
      return journalStickyNoteService.create(userId, {
        id: note.id,
        content: note.content || '',
        x: note.x ?? 0,
        y: note.y ?? 0,
        createdAt: note.createdAt || new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(userId) });
    },
  });


  const updateStickyNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<JournalStickyNote> }) => {
      return journalStickyNoteService.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(userId) });
    },
  });

  const deleteStickyNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      return journalStickyNoteService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.journals.stickyNotes(userId) });
    },
  });

  return {
    addJournalMutation,
    updateJournalMutation,
    deleteJournalMutation,
    addStickyNoteMutation,
    updateStickyNoteMutation,
    deleteStickyNoteMutation,
  };
}
