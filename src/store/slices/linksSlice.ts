import { type StateCreator } from 'zustand';
import type { AppStore, Link, SavedLink } from '../types';
import { linkService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface LinksSlice {
  links: Link[];
  addLink: (link: Link, userId?: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  updateLink: (id: string, data: Partial<Link>) => Promise<void>;

  savedLinks: SavedLink[];
  addSavedLink: (link: SavedLink) => Promise<void>;
  deleteSavedLink: (id: string) => Promise<void>;
}

export const createLinksSlice: StateCreator<AppStore, [], [], LinksSlice> = (set, get) => ({
  links: (() => {
    try {
      const stored = localStorage.getItem('phq_links');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })(),
  addLink: async (link) => {
    if (shouldThrottle('addLink')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().links;
    const updated = [link, ...previous];
    set({ links: updated, savedLinks: updated as any[] as SavedLink[] });
    try {
      await linkService.create(uid, link);
      queryClient.invalidateQueries({ queryKey: queryKeys.links.all(uid) });
      useToastStore.getState().addToast('Success', 'Link saved', 'success');
    } catch (error) {
      set({ links: previous, savedLinks: previous as any[] as SavedLink[] });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not save link'), 'error');
      throw error;
    }
  },
  deleteLink: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().links;
    const updated = previous.filter((l) => l.id !== id);
    set({ links: updated, savedLinks: updated as any[] as SavedLink[] });
    try {
      await linkService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.links.all(uid) });
      useToastStore.getState().addToast('Success', 'Link deleted', 'success');
    } catch (error) {
      set({ links: previous, savedLinks: previous as any[] as SavedLink[] });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete link'), 'error');
      throw error;
    }
  },
  updateLink: async (id: string, data: Partial<Link>) => {
    const uid = useAuthStore.getState().user?.id;
    const previous = get().links;
    const updated = previous.map((l) => (l.id === id ? { ...l, ...data } : l));
    set({ links: updated, savedLinks: updated as any[] as SavedLink[] });
    try {
      await linkService.update(id, data);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.links.all(uid) });
      useToastStore.getState().addToast('Success', 'Link updated', 'success');
    } catch (error) {
      set({ links: previous, savedLinks: previous as any[] as SavedLink[] });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not update link'), 'error');
      throw error;
    }
  },

  savedLinks: (() => {
    try {
      const stored = localStorage.getItem('phq_links');
      return stored ? (JSON.parse(stored) as any[] as SavedLink[]) : [];
    } catch {
      return [];
    }
  })(),
  addSavedLink: async (link: SavedLink) => {
    await get().addLink(link as any as Link);
  },
  deleteSavedLink: async (id: string) => {
    await get().deleteLink(id);
  },
});
