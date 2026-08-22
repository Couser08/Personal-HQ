import { supabase } from '../supabase';
import type { MediaLog } from '../../store/types';

export const mediaService = {
  async fetchAll(userId: string, limit = 50): Promise<MediaLog[]> {
    const { data, error } = await supabase
      .from('media_logs')
      .select('id, type, title, status, rating, episodes, added_at')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      status: r.status,
      rating: r.rating,
      episodes: r.episodes,
      notes: '', // Metadata-first: notes fetched on demand via fetchDetail
      addedAt: r.added_at,
    }));
  },

  async fetchDetail(id: string): Promise<{ id: string; notes?: string } | null> {
    const { data, error } = await supabase
      .from('media_logs')
      .select('id, notes')
      .eq('id', id)
      .single();
    if (error) return null;
    return { id: data?.id, notes: data?.notes ?? '' };
  },

  async create(userId: string, log: MediaLog) {
    const { error } = await supabase.from('media_logs').insert({
      id: log.id,
      user_id: userId,
      type: log.type,
      title: log.title,
      status: log.status,
      rating: log.rating ?? null,
      episodes: log.episodes ?? null,
      notes: log.notes,
      added_at: log.addedAt,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<MediaLog>) {
    try {
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.status !== undefined) payload.status = data.status;
      if (data.rating !== undefined) payload.rating = data.rating;
      if (data.episodes !== undefined) payload.episodes = data.episodes;
      if (data.notes !== undefined) payload.notes = data.notes;

      if (Object.keys(payload).length === 0) return;

      const { error } = await supabase.from('media_logs').update(payload).eq('id', id);
      if (error) {
        console.warn('MediaLog Update warning:', error.message || error);
      }
    } catch (e) {
      console.warn('MediaLog Update exception:', e);
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('media_logs').delete().eq('id', id);
    if (error) throw error;
  },
};
