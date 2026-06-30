import { supabase } from './supabase';
import type {
  Note, Link, StockEntry, Subject, InterestRecord,
  MediaLog, Countdown, CodeSnippet, BudgetCategory, BudgetTransaction
} from '../store/useAppStore';

// ─── Notes ────────────────────────────────────────────────────────────────────

export const noteService = {
  async fetchAll(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      tags: r.tags ?? [],
      pinned: r.pinned,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
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

// ─── Links ────────────────────────────────────────────────────────────────────

export const linkService = {
  async fetchAll(userId: string): Promise<Link[]> {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      tags: r.tags ?? [],
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
      saved_at: link.savedAt,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Stocks ───────────────────────────────────────────────────────────────────

export const stockService = {
  async fetchAll(userId: string): Promise<StockEntry[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      ticker: r.ticker,
      entryPrice: r.entry_price,
      quantity: r.quantity,
      action: r.action,
      notes: r.notes,
      date: r.date,
    }));
  },

  async create(userId: string, entry: StockEntry) {
    const { error } = await supabase.from('stocks').insert({
      id: entry.id,
      user_id: userId,
      ticker: entry.ticker,
      entry_price: entry.entryPrice,
      quantity: entry.quantity,
      action: entry.action,
      notes: entry.notes,
      date: entry.date,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('stocks').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const subjectService = {
  async fetchAll(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      semester: r.semester,
      topics: r.topics ?? [],
    }));
  },

  async create(userId: string, subject: Subject) {
    const { error } = await supabase.from('subjects').insert({
      id: subject.id,
      user_id: userId,
      name: subject.name,
      semester: subject.semester,
      topics: subject.topics,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<Subject>) {
    const { error } = await supabase.from('subjects').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.topics !== undefined && { topics: data.topics }),
      ...(data.semester !== undefined && { semester: data.semester }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Interest Records ─────────────────────────────────────────────────────────

export const interestService = {
  async fetchAll(userId: string): Promise<InterestRecord[]> {
    const { data, error } = await supabase
      .from('interest_records')
      .select('*')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      principal: r.principal,
      rate: r.rate,
      time: r.time,
      timeUnit: r.time_unit,
      interest: r.interest,
      totalAmount: r.total_amount,
      compoundFrequency: r.compound_frequency,
      label: r.label,
      calculatedAt: r.calculated_at,
    }));
  },

  async create(userId: string, record: InterestRecord) {
    const { error } = await supabase.from('interest_records').insert({
      id: record.id,
      user_id: userId,
      type: record.type,
      principal: record.principal,
      rate: record.rate,
      time: record.time,
      time_unit: record.timeUnit,
      interest: record.interest,
      total_amount: record.totalAmount,
      compound_frequency: record.compoundFrequency ?? null,
      label: record.label,
      calculated_at: record.calculatedAt,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('interest_records').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Media Logs ───────────────────────────────────────────────────────────────

export const mediaService = {
  async fetchAll(userId: string): Promise<MediaLog[]> {
    const { data, error } = await supabase
      .from('media_logs')
      .select('*')
      .eq('user_id', userId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      type: r.type,
      title: r.title,
      status: r.status,
      rating: r.rating,
      episodes: r.episodes,
      notes: r.notes,
      addedAt: r.added_at,
    }));
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
    const { error } = await supabase.from('media_logs').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.episodes !== undefined && { episodes: data.episodes }),
      ...(data.notes !== undefined && { notes: data.notes }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('media_logs').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Countdowns ───────────────────────────────────────────────────────────────

export const countdownService = {
  async fetchAll(userId: string): Promise<Countdown[]> {
    const { data, error } = await supabase
      .from('countdowns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      label: r.label,
      targetDate: r.target_date,
      emoji: r.emoji,
      color: r.color,
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, countdown: Countdown) {
    const { error } = await supabase.from('countdowns').insert({
      id: countdown.id,
      user_id: userId,
      label: countdown.label,
      target_date: countdown.targetDate,
      emoji: countdown.emoji,
      color: countdown.color,
      created_at: countdown.createdAt,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('countdowns').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Code Snippets ────────────────────────────────────────────────────────────

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
  async fetchAll(userId: string): Promise<CodeSnippet[]> {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
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

// ─── Budget Categories ─────────────────────────────────────────────────────────

export const budgetCategoryService = {
  async fetchAll(userId: string): Promise<BudgetCategory[]> {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      budget: r.budget,
      color: r.color,
      icon: r.icon,
    }));
  },

  async create(userId: string, category: BudgetCategory) {
    const { error } = await supabase.from('budget_categories').insert({
      id: category.id,
      user_id: userId,
      name: category.name,
      budget: category.budget,
      color: category.color,
      icon: category.icon,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<BudgetCategory>) {
    const { error } = await supabase.from('budget_categories').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.budget !== undefined && { budget: data.budget }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.icon !== undefined && { icon: data.icon }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error: transactionError } = await supabase
      .from('budget_transactions')
      .delete()
      .eq('category_id', id);
    if (transactionError) throw transactionError;

    const { error } = await supabase.from('budget_categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Budget Transactions ───────────────────────────────────────────────────────

export const budgetTransactionService = {
  async fetchAll(userId: string): Promise<BudgetTransaction[]> {
    const { data, error } = await supabase
      .from('budget_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      categoryId: r.category_id,
      amount: r.amount,
      description: r.description,
      date: r.date,
      type: r.type,
    }));
  },

  async create(userId: string, transaction: BudgetTransaction) {
    const { error } = await supabase.from('budget_transactions').insert({
      id: transaction.id,
      user_id: userId,
      category_id: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      date: transaction.date,
      type: transaction.type,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('budget_transactions').delete().eq('id', id);
    if (error) throw error;
  },
};
