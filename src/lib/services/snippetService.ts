import { supabase } from '../supabase';
import type { CodeSnippet } from '../../store/types';

const SNIPPET_OPTIONAL_COLUMNS = ['description', 'is_favorite', 'updated_at'];

const isMissingSnippetColumnError = (error: unknown) => {
  const text = [
    typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message ?? '') : '',
    typeof error === 'object' && error !== null && 'details' in error ? String((error as { details?: unknown }).details ?? '') : '',
    typeof error === 'object' && error !== null && 'hint' in error ? String((error as { hint?: unknown }).hint ?? '') : '',
  ].join(' ').toLowerCase();

  return SNIPPET_OPTIONAL_COLUMNS.some((column) => text.includes(column));
};

const buildSnippetBasePayload = (userId: string, snippet: CodeSnippet) => ({
  id: snippet.id,
  user_id: userId,
  title: snippet.title,
  language: snippet.language,
  code: snippet.code,
  tags: snippet.tags,
  created_at: snippet.createdAt,
});

const buildSnippetOptionalPayload = (snippet: CodeSnippet) => ({
  description: snippet.description ?? '',
  is_favorite: snippet.isFavorite ?? false,
  updated_at: snippet.updatedAt ?? snippet.createdAt,
});

const buildSnippetUpdateBasePayload = (data: Partial<CodeSnippet>) => ({
  ...(data.title !== undefined && { title: data.title }),
  ...(data.language !== undefined && { language: data.language }),
  ...(data.code !== undefined && { code: data.code }),
  ...(data.tags !== undefined && { tags: data.tags }),
});

const buildSnippetUpdateOptionalPayload = (data: Partial<CodeSnippet>) => ({
  ...(data.description !== undefined && { description: data.description }),
  ...(data.isFavorite !== undefined && { is_favorite: data.isFavorite }),
  updated_at: data.updatedAt ?? new Date().toISOString(),
});

export const snippetService = {
  async fetchAll(userId: string, limit = 50): Promise<CodeSnippet[]> {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description ?? '',
      language: r.language,
      code: r.code,
      tags: r.tags ?? [],
      isFavorite: r.is_favorite ?? false,
      createdAt: r.created_at,
      updatedAt: r.updated_at ?? r.created_at,
    }));
  },

  async create(userId: string, snippet: CodeSnippet) {
    const basePayload = buildSnippetBasePayload(userId, snippet);
    const primaryPayload = { ...basePayload, ...buildSnippetOptionalPayload(snippet) };

    let { error } = await supabase.from('snippets').insert(primaryPayload);

    if (error && isMissingSnippetColumnError(error)) {
      ({ error } = await supabase.from('snippets').insert(basePayload));
    }

    if (error) throw error;
  },

  async update(id: string, data: Partial<CodeSnippet>) {
    const basePayload = buildSnippetUpdateBasePayload(data);
    const primaryPayload = { ...basePayload, ...buildSnippetUpdateOptionalPayload(data) };

    let { error } = await supabase.from('snippets').update(primaryPayload).eq('id', id);

    if (error && isMissingSnippetColumnError(error)) {
      if (Object.keys(basePayload).length === 0) {
        return;
      }
      ({ error } = await supabase.from('snippets').update(basePayload).eq('id', id));
    }

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (error) throw error;
  },
};
