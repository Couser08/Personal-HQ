import { supabase } from '../supabase';
import type { ProjectStructure, ProjectNode } from '../../store/types';

export const projectStructureService = {
  async fetchAll(userId: string, limit = 50): Promise<ProjectStructure[]> {
    const { data, error } = await supabase
      .from('project_structures')
      .select('id, user_id, name, description, root_name, nodes, tags, template_type, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST116' ||
        error.message?.includes('does not exist') ||
        error.message?.includes('not found') ||
        error.message?.includes('404')
      ) {
        return [];
      }
      return [];
    }

    return (data ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      description: r.description || '',
      rootName: r.root_name || 'my-project',
      nodes: (r.nodes as ProjectNode[]) || [],
      tags: r.tags || [],
      templateType: r.template_type || 'custom',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  },

  async create(userId: string, project: ProjectStructure): Promise<void> {
    const { error } = await supabase.from('project_structures').insert({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description || '',
      root_name: project.rootName,
      nodes: project.nodes || [],
      tags: project.tags || [],
      template_type: project.templateType || 'custom',
      created_at: project.createdAt || new Date().toISOString(),
      updated_at: project.updatedAt || new Date().toISOString(),
    });
    if (error && error.code !== '42P01') throw error;
  },

  async update(id: string, data: Partial<ProjectStructure>): Promise<void> {
    const { error } = await supabase.from('project_structures').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.rootName !== undefined && { root_name: data.rootName }),
      ...(data.nodes !== undefined && { nodes: data.nodes }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.templateType !== undefined && { template_type: data.templateType }),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error && error.code !== '42P01') throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('project_structures').delete().eq('id', id);
    if (error && error.code !== '42P01') throw error;
  },
};
