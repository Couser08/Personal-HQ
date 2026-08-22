import { supabase } from '../supabase';
import type { Note } from '../../store/types';

export const noteService = {
  async fetchAll(userId: string, limit = 50): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, tags, pinned, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      content: '', // Metadata-first: content loaded on demand via fetchDetail
      tags: r.tags ?? [],
      pinned: r.pinned,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async fetchDetail(id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('id, content')
      .eq('id', id)
      .single();
    if (error) return null;
    return data?.content ?? '';
  },

  async create(userId: string, note: Note) {
    const { error } = await supabase.from('notes').insert({
      id: note.id,
      user_id: userId,
      title: note.title,
      content: note.content,
      tags: note.tags,
      pinned: note.pinned,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<Note>) {
    const { error } = await supabase.from('notes').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.pinned !== undefined && { pinned: data.pinned }),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
  },
};
