import { supabase } from '../supabase';
import type { Mindmap } from '../../store/types';

export const mindmapService = {
  async fetchAll(userId: string, limit = 20): Promise<Mindmap[]> {
    const { data, error } = await supabase
      .from('mindmaps')
      .select('id, title, nodes, links, edge_style, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      nodes: r.nodes ?? [],
      links: r.links ?? [],
      edgeStyle: r.edge_style ?? 'solid',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async create(userId: string, mindmap: Mindmap) {
    const { error } = await supabase.from('mindmaps').insert({
      id: mindmap.id,
      user_id: userId,
      title: mindmap.title,
      nodes: mindmap.nodes,
      links: mindmap.links,
      edge_style: mindmap.edgeStyle || 'solid',
      created_at: mindmap.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<Mindmap>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.nodes !== undefined) payload.nodes = data.nodes;
    if (data.links !== undefined) payload.links = data.links;
    if (data.edgeStyle !== undefined) payload.edge_style = data.edgeStyle;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('mindmaps').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('mindmaps').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};
