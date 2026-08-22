import { supabase } from '../supabase';
import type { Link } from '../../store/types';

export const linkService = {
  async fetchAll(userId: string, limit = 50): Promise<Link[]> {
    const { data, error } = await supabase
      .from('links')
      .select('id, url, title, tags, type, term_type, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('links')
          .select('id, url, title, tags, saved_at')
          .eq('user_id', userId)
          .order('saved_at', { ascending: false })
          .limit(limit);
        if (fallbackError) throw fallbackError;
        return (fallbackData ?? []).map((r) => ({
          id: r.id,
          url: r.url,
          title: r.title,
          tags: r.tags ?? [],
          type: 'other',
          termType: 'short',
          savedAt: r.saved_at,
        }));
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      tags: r.tags ?? [],
      type: r.type as any,
      termType: r.term_type as any,
      savedAt: r.saved_at,
    }));
  },

  async create(userId: string, link: Link) {
    const { error } = await supabase.from('links').insert({
      id: link.id,
      user_id: userId,
      url: link.url,
      title: link.title,
      tags: link.tags,
      type: link.type || 'other',
      term_type: link.termType || 'short',
      saved_at: link.savedAt,
    });
    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        const { error: fallbackError } = await supabase.from('links').insert({
          id: link.id,
          user_id: userId,
          url: link.url,
          title: link.title,
          tags: link.tags,
          saved_at: link.savedAt,
        });
        if (fallbackError) throw fallbackError;
      } else {
        throw error;
      }
    }
  },

  async update(id: string, data: Partial<Link>) {
    const payload: any = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.termType !== undefined && { term_type: data.termType }),
    };
    const { error } = await supabase.from('links').update(payload).eq('id', id);
    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        const fallbackPayload = {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.url !== undefined && { url: data.url }),
          ...(data.tags !== undefined && { tags: data.tags }),
        };
        const { error: fallbackError } = await supabase.from('links').update(fallbackPayload).eq('id', id);
        if (fallbackError) throw fallbackError;
      } else {
        throw error;
      }
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) throw error;
  },
};
