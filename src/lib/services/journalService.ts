import { supabase } from '../supabase';
import type { JournalEntry, JournalStickyNote } from '../../store/types';

const JOURNAL_OPTIONAL_COLUMNS = ['location', 'reminder', 'style_preset'];

const isMissingJournalColumnError = (error: unknown) => {
  const text = [
    typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message ?? '') : '',
    typeof error === 'object' && error !== null && 'details' in error ? String((error as { details?: unknown }).details ?? '') : '',
    typeof error === 'object' && error !== null && 'hint' in error ? String((error as { hint?: unknown }).hint ?? '') : '',
  ].join(' ').toLowerCase();

  return JOURNAL_OPTIONAL_COLUMNS.some((column) => text.includes(column));
};

const buildJournalBasePayload = (userId: string, entry: JournalEntry) => ({
  id: entry.id,
  user_id: userId,
  title: entry.title,
  content: entry.content,
  date: entry.date,
  mood: entry.mood,
  tags: entry.tags,
  pinned: entry.pinned,
  focus_list: entry.focusList,
  page_style: entry.pageStyle,
  images: entry.images,
  reflection: entry.reflection,
  attachments: entry.attachments,
});

const buildJournalOptionalPayload = (entry: JournalEntry) => ({
  location: entry.location,
  reminder: entry.reminder,
  style_preset: entry.stylePreset,
});

const buildJournalUpdateBasePayload = (data: Partial<JournalEntry>) => ({
  ...(data.title !== undefined && { title: data.title }),
  ...(data.content !== undefined && { content: data.content }),
  ...(data.date !== undefined && { date: data.date }),
  ...(data.mood !== undefined && { mood: data.mood }),
  ...(data.tags !== undefined && { tags: data.tags }),
  ...(data.pinned !== undefined && { pinned: data.pinned }),
  ...(data.focusList !== undefined && { focus_list: data.focusList }),
  ...(data.pageStyle !== undefined && { page_style: data.pageStyle }),
  ...(data.images !== undefined && { images: data.images }),
  ...(data.reflection !== undefined && { reflection: data.reflection }),
  ...(data.attachments !== undefined && { attachments: data.attachments }),
});

const buildJournalUpdateOptionalPayload = (data: Partial<JournalEntry>) => ({
  ...(data.location !== undefined && { location: data.location }),
  ...(data.reminder !== undefined && { reminder: data.reminder }),
  ...(data.stylePreset !== undefined && { style_preset: data.stylePreset }),
});

export const journalService = {
  async fetchAll(userId: string, limit = 50): Promise<JournalEntry[]> {
    let queryData: any[] | null = null;
    let queryError: any = null;

    const res = await supabase
      .from('journals')
      .select('id, title, content, date, mood, tags, pinned, focus_list, page_style, images, reflection, attachments, location, reminder, style_preset, created_at, updated_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    queryData = res.data;
    queryError = res.error;

    if (queryError && isMissingJournalColumnError(queryError)) {
      const fallback = await supabase
        .from('journals')
        .select('id, title, content, date, mood, tags, pinned, focus_list, page_style, images, reflection, attachments, created_at, updated_at')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);
      queryData = fallback.data;
      queryError = fallback.error;
    }

    if (queryError) {
      if (queryError.code === '42P01' || queryError.message?.includes('relation')) return [];
      console.warn('Journal fetchAll warning:', queryError);
      return [];
    }

    return (queryData ?? []).map((r: any) => ({
      id: r.id,
      title: r.title || 'Untitled Entry',
      content: r.content || '',
      date: r.date || r.created_at || new Date().toISOString(),
      mood: r.mood || 'neutral',
      tags: r.tags ?? [],
      pinned: !!r.pinned,
      focusList: Array.isArray(r.focus_list) ? r.focus_list : [],
      pageStyle: r.page_style || 'default',
      images: Array.isArray(r.images) ? r.images : [],
      reflection: r.reflection || { whatWentWell: '', whatCanBeBetter: '' },
      attachments: Array.isArray(r.attachments) ? r.attachments : [],
      location: r.location || '',
      reminder: r.reminder || '',
      stylePreset: r.style_preset || 'calm',
    }));
  },

  async fetchDetail(id: string): Promise<Partial<JournalEntry> | null> {
    const { data, error } = await supabase
      .from('journals')
      .select('id, content, focus_list, page_style, images, reflection, attachments, updated_at')
      .eq('id', id)
      .single();
    if (error) return null;
    return {
      id: data?.id,
      content: data?.content ?? '',
      focusList: data?.focus_list ?? [],
      pageStyle: data?.page_style ?? 'default',
      images: data?.images ?? [],
      reflection: data?.reflection ?? { whatWentWell: '', whatCanBeBetter: '' },
      attachments: data?.attachments ?? [],
    };
  },

  async create(userId: string, entry: JournalEntry) {
    const basePayload = buildJournalBasePayload(userId, entry);
    const primaryPayload = { ...basePayload, ...buildJournalOptionalPayload(entry) };

    let { error } = await supabase.from('journals').insert(primaryPayload);

    if (error && isMissingJournalColumnError(error)) {
      ({ error } = await supabase.from('journals').insert(basePayload));
    }

    if (error) throw error;
  },

  async update(id: string, data: Partial<JournalEntry>, userId?: string) {
    const basePayload = buildJournalUpdateBasePayload(data);
    const primaryPayload = { ...basePayload, ...buildJournalUpdateOptionalPayload(data), updated_at: new Date().toISOString() };

    let error;
    if (userId) {
      const upsertPayload = {
        id,
        user_id: userId,
        ...primaryPayload
      };
      const response = await supabase.from('journals').upsert(upsertPayload);
      error = response.error;

      if (error && isMissingJournalColumnError(error)) {
        const fallbackUpsert = {
          id,
          user_id: userId,
          ...basePayload,
          updated_at: new Date().toISOString()
        };
        const fallbackResponse = await supabase.from('journals').upsert(fallbackUpsert);
        error = fallbackResponse.error;
      }
    } else {
      const response = await supabase.from('journals').update(primaryPayload).eq('id', id);
      error = response.error;

      if (error && isMissingJournalColumnError(error)) {
        const fallbackPayload = { ...basePayload, updated_at: new Date().toISOString() };
        const fallbackResponse = await supabase.from('journals').update(fallbackPayload).eq('id', id);
        error = fallbackResponse.error;
      }
    }

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('journals').delete().eq('id', id);
    if (error) throw error;
  }
};

export const journalStickyNoteService = {
  async fetchAll(userId: string, limit = 50): Promise<JournalStickyNote[]> {
    const { data, error } = await supabase
      .from('journal_sticky_notes')
      .select('id, content, x, y, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      content: r.content,
      x: Number(r.x),
      y: Number(r.y),
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, note: JournalStickyNote) {
    const { error } = await supabase.from('journal_sticky_notes').insert({
      id: note.id,
      user_id: userId,
      content: note.content,
      x: note.x,
      y: note.y,
      created_at: note.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<JournalStickyNote>) {
    const payload: any = {};
    if (data.content !== undefined) payload.content = data.content;
    if (data.x !== undefined) payload.x = data.x;
    if (data.y !== undefined) payload.y = data.y;

    const { error } = await supabase.from('journal_sticky_notes').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('journal_sticky_notes').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};
