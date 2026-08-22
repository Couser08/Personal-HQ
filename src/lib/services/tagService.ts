import { supabase } from '../supabase';
import type { AppTag } from '../../store/types';

export const tagService = {
  async fetchAll(userId: string, limit = 100): Promise<AppTag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, color, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      color: r.color,
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, tag: AppTag) {
    const { error } = await supabase.from('tags').insert({
      id: tag.id,
      user_id: userId,
      name: tag.name,
      color: tag.color,
      created_at: tag.createdAt,
    });
    if (error) throw error;
  },

  async update(id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) {
    const { error } = await supabase.from('tags').update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.color !== undefined && { color: updates.color }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) throw error;
  },
};
