import { supabase } from './supabase';
import type {
  Note, Link, SavedLink, AppTag, StockEntry, InterestRecord,
  MediaLog, Countdown, CodeSnippet,
  TodoProject, TodoTask, JournalEntry, Mindmap, StandardCalculation, Habit,
  Sprint, DsaProblem, TilLog, LearningRoadmap, ResourceBookmark, DevGoal,
  StudyMaterial, Exam, ExamAttempt, DailyReflection, Vision, VisionBoard, VisionNode,
  BudgetCategory, BudgetTransaction, BugReport, BugReportStatus, BugReportElementInfo,
  ProjectStructure, ProjectNode
} from '../store/types';

// ─── Notes ────────────────────────────────────────────────────────────────────

export const noteService = {
  async fetchAll(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, tags, pinned, created_at, updated_at')
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
      .select('id, url, title, tags, type, term_type, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('does not exist')) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('links')
          .select('id, url, title, tags, saved_at')
          .eq('user_id', userId)
          .order('saved_at', { ascending: false });
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

// ─── Link Saver ───────────────────────────────────────────────────────────────

export const linkSaverService = {
  async fetchAll(userId: string): Promise<SavedLink[]> {
    const { data, error } = await supabase
      .from('link_saver')
      .select('id, url, title, type, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      type: r.type as SavedLink['type'],
      savedAt: r.saved_at,
    }));
  },

  async create(userId: string, link: SavedLink) {
    const { error } = await supabase.from('link_saver').insert({
      id: link.id,
      user_id: userId,
      url: link.url,
      title: link.title,
      type: link.type,
      saved_at: link.savedAt,
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('link_saver').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Tags ─────────────────────────────────────────────────────────────────────

export const tagService = {
  async fetchAll(userId: string): Promise<AppTag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('id, name, color, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
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

// ─── Stocks ───────────────────────────────────────────────────────────────────

export const stockService = {
  async fetchAll(userId: string): Promise<StockEntry[]> {
    const { data, error } = await supabase
      .from('stocks')
      .select('id, ticker, entry_price, quantity, action, notes, date')
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

// ─── Interest Records ─────────────────────────────────────────────────────────

export const interestService = {
  async fetchAll(userId: string): Promise<InterestRecord[]> {
    const { data, error } = await supabase
      .from('interest_records')
      .select('id, type, principal, rate, time, time_unit, interest, total_amount, compound_frequency, label, calculated_at')
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
      .select('id, type, title, status, rating, episodes, notes, added_at')
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

// ─── Countdowns ───────────────────────────────────────────────────────────────

export const countdownService = {
  async fetchAll(userId: string): Promise<Countdown[]> {
    const { data, error } = await supabase
      .from('countdowns')
      .select('id, label, target_date, emoji, color, created_at')
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
      .select('id, name, budget, color, icon')
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
      .select('id, category_id, amount, description, date, type, payment_method')
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
      paymentMethod: r.payment_method || 'online',
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
      payment_method: transaction.paymentMethod || 'online',
    });
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('budget_transactions').delete().eq('id', id);
    if (error) throw error;
  },

  async update(id: string, transaction: Partial<BudgetTransaction>) {
    const updateData: any = {};
    if (transaction.categoryId !== undefined) updateData.category_id = transaction.categoryId;
    if (transaction.amount !== undefined) updateData.amount = transaction.amount;
    if (transaction.description !== undefined) updateData.description = transaction.description;
    if (transaction.date !== undefined) updateData.date = transaction.date;
    if (transaction.type !== undefined) updateData.type = transaction.type;
    if (transaction.paymentMethod !== undefined) updateData.payment_method = transaction.paymentMethod;

    const { error } = await supabase.from('budget_transactions').update(updateData).eq('id', id);
    if (error) throw error;
  },
};

// ─── To-Do Projects ────────────────────────────────────────────────────────────

export const todoProjectService = {
  async fetchAll(userId: string): Promise<TodoProject[]> {
    const { data, error } = await supabase
      .from('todo_projects')
      .select('id, name, color')
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
      color: r.color,
    }));
  },

  async create(userId: string, project: TodoProject): Promise<boolean> {
    try {
      const { error } = await supabase.from('todo_projects').insert({
        id: project.id,
        user_id: userId,
        name: project.name,
        color: project.color,
      });
      if (error) {
        console.warn('TodoProject Create Error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('TodoProject Create Exception:', e);
      return false;
    }
  },

  async update(id: string, updates: Partial<TodoProject>) {
    try {
      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.color !== undefined) payload.color = updates.color;
      const { error } = await supabase.from('todo_projects').update(payload).eq('id', id);
      if (error) console.warn('TodoProject Update Error:', error);
    } catch (e) {
      console.warn('TodoProject Update Exception:', e);
    }
  },

  async delete(id: string) {
    try {
      const { error: taskError } = await supabase
        .from('todo_tasks')
        .delete()
        .eq('project_id', id);
      if (taskError) {
        console.warn('TodoTasks Delete Error:', taskError);
      }

      const { error } = await supabase.from('todo_projects').delete().eq('id', id);
      if (error) {
        console.warn('TodoProject Delete Error:', error);
      }
    } catch (e) {
      console.warn('TodoProject Delete Exception:', e);
    }
  },
};


const TODO_OPTIONAL_COLUMNS = ['subtasks', 'deleted', 'start_time', 'end_time', 'pomodoro_count'];

const isMissingTodoColumnError = (error: unknown) => {
  const text = [
    typeof error === 'object' && error !== null && 'message' in error ? String((error as { message?: unknown }).message ?? '') : '',
    typeof error === 'object' && error !== null && 'details' in error ? String((error as { details?: unknown }).details ?? '') : '',
    typeof error === 'object' && error !== null && 'hint' in error ? String((error as { hint?: unknown }).hint ?? '') : '',
  ].join(' ').toLowerCase();

  return TODO_OPTIONAL_COLUMNS.some((column) => text.includes(column));
};

const buildTodoTaskBasePayload = (userId: string, task: TodoTask) => ({
  id: task.id,
  user_id: userId,
  project_id: task.projectId,
  title: task.title,
  completed: task.completed,
  priority: task.priority,
  tags: task.tags,
  due_date: task.dueDate,
  created_at: task.createdAt,
});

const buildTodoTaskOptionalPayload = (task: TodoTask) => ({
  start_time: task.startTime,
  end_time: task.endTime,
  pomodoro_count: task.pomodoroCount ?? 0,
  deleted: task.deleted ?? false,
  subtasks: task.subtasks ?? [],
});

const buildTodoTaskUpdateBasePayload = (data: Partial<TodoTask>) => ({
  ...(data.projectId !== undefined && { project_id: data.projectId }),
  ...(data.title !== undefined && { title: data.title }),
  ...(data.completed !== undefined && { completed: data.completed }),
  ...(data.priority !== undefined && { priority: data.priority }),
  ...(data.tags !== undefined && { tags: data.tags }),
  ...(data.dueDate !== undefined && { due_date: data.dueDate }),
});

const buildTodoTaskUpdateOptionalPayload = (data: Partial<TodoTask>) => ({
  ...(data.startTime !== undefined && { start_time: data.startTime }),
  ...(data.endTime !== undefined && { end_time: data.endTime }),
  ...(data.pomodoroCount !== undefined && { pomodoro_count: data.pomodoroCount }),
  ...(data.deleted !== undefined && { deleted: data.deleted }),
  ...(data.subtasks !== undefined && { subtasks: data.subtasks }),
});

// ─── To-Do Tasks ───────────────────────────────────────────────────────────────

export const todoTaskService = {
  async fetchAll(userId: string): Promise<TodoTask[]> {
    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST116' || error.message?.includes('relation') || error.details?.includes('404')) {
        return [];
      }
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      projectId: r.project_id,
      title: r.title,
      completed: r.completed,
      priority: r.priority,
      tags: r.tags ?? [],
      dueDate: r.due_date,
      startTime: r.start_time,
      endTime: r.end_time,
      pomodoroCount: r.pomodoro_count ?? 0,
      deleted: r.deleted ?? false,
      createdAt: r.created_at,
      subtasks: r.subtasks ?? [],
    }));
  },

  async create(userId: string, task: TodoTask): Promise<boolean> {
    try {
      const basePayload = buildTodoTaskBasePayload(userId, task);
      const primaryPayload = { ...basePayload, ...buildTodoTaskOptionalPayload(task) };

      let { error } = await supabase.from('todo_tasks').insert(primaryPayload);

      if (error && isMissingTodoColumnError(error)) {
        ({ error } = await supabase.from('todo_tasks').insert(basePayload));
      }

      if (error) {
        console.warn('TodoTask Create Error:', error);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('TodoTask Create Exception:', e);
      return false;
    }
  },

  async update(id: string, data: Partial<TodoTask>) {
    try {
      const basePayload = buildTodoTaskUpdateBasePayload(data);
      const primaryPayload = { ...basePayload, ...buildTodoTaskUpdateOptionalPayload(data) };

      if (Object.keys(primaryPayload).length === 0) return;

      let { error } = await supabase.from('todo_tasks').update(primaryPayload).eq('id', id);

      if (error && isMissingTodoColumnError(error)) {
        if (Object.keys(basePayload).length > 0) {
          ({ error } = await supabase.from('todo_tasks').update(basePayload).eq('id', id));
        } else {
          return;
        }
      }

      if (error) {
        console.warn('TodoTask Update Error:', error);
      }
    } catch (e) {
      console.warn('TodoTask Update Exception:', e);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase.from('todo_tasks').delete().eq('id', id);
      if (error) {
        console.warn('TodoTask Delete Error:', error);
      }
    } catch (e) {
      console.warn('TodoTask Delete Exception:', e);
    }
  },
};

// ─── Journal Entries ──────────────────────────────────────────────────────────

export const journalService = {
  async fetchAll(userId: string): Promise<JournalEntry[]> {
    const { data, error } = await supabase
      .from('journals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      date: r.date,
      mood: r.mood,
      tags: r.tags ?? [],
      pinned: r.pinned ?? false,
      focusList: r.focus_list ?? [],
      pageStyle: r.page_style ?? 'default',
      images: r.images ?? [],
      reflection: r.reflection ?? { whatWentWell: '', whatCanBeBetter: '' },
      attachments: r.attachments ?? [],
      location: r.location ?? '',
      reminder: r.reminder ?? '',
      stylePreset: r.style_preset ?? 'calm',
    }));
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

// ─── Mindmaps ─────────────────────────────────────────────────────────────────

export const mindmapService = {
  async fetchAll(userId: string): Promise<Mindmap[]> {
    const { data, error } = await supabase
      .from('mindmaps')
      .select('id, title, nodes, links, edge_style, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
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
      if (error.code === '42P01' || error.message?.includes('relation') || error.details?.includes('404')) {
        console.warn("Supabase mindmaps table relation does not exist. Operating in local-only fallback mode.");
        return;
      }
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
      if (error.code === '42P01' || error.message?.includes('relation') || error.details?.includes('404')) {
        console.warn("Supabase mindmaps table relation does not exist. Operating in local-only fallback mode.");
        return;
      }
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('mindmaps').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation') || error.details?.includes('404')) {
        console.warn("Supabase mindmaps table relation does not exist. Operating in local-only fallback mode.");
        return;
      }
      throw error;
    }
  }
};

// ─── Standard Arithmetic Calculations ─────────────────────────────────────────

export const standardCalcService = {
  async fetchAll(userId: string): Promise<StandardCalculation[]> {
    const { data, error } = await supabase
      .from('standard_calculations')
      .select('id, expression, result, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      expression: r.expression,
      result: r.result,
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, record: StandardCalculation) {
    const { error } = await supabase.from('standard_calculations').insert({
      id: record.id,
      user_id: userId,
      expression: record.expression,
      result: record.result,
      created_at: record.createdAt,
    });
    if (error) throw error;
  },

  async clearAll(userId: string) {
    const { error } = await supabase
      .from('standard_calculations')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }
};



export const settingsService = {
  async fetch(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsert(userId: string, settings: any) {
    try {
      const payload: Record<string, any> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      };

      // Theme
      let dbTheme = settings.theme;
      if (dbTheme !== undefined) {
        payload.theme = ['light', 'dark', 'system'].includes(dbTheme) ? dbTheme : 'dark';
      }

      // Map valid columns (checking snake_case first, then camelCase fallback)
      const mapCol = (snake: string, camel: string) => {
        if (settings[snake] !== undefined) payload[snake] = settings[snake];
        else if (settings[camel] !== undefined) payload[snake] = settings[camel];
      };

      mapCol('countdown_template', 'countdownTemplate');
      mapCol('accent_color', 'accentColor');
      mapCol('animation_speed', 'animationSpeed');
      mapCol('compact_mode', 'compactMode');
      mapCol('sound_enabled', 'soundEnabled');
      mapCol('initial_bank_balance', 'initialBankBalance');
      mapCol('initial_cash_balance', 'initialCashBalance');
      mapCol('currency_symbol', 'currencySymbol');
      mapCol('media_quote', 'mediaQuote');
      mapCol('reduce_blur', 'reduceBlur');
      mapCol('reduce_animations', 'reduceAnimations');
      mapCol('gemini_api_key', 'geminiApiKey');
      mapCol('gemini_model', 'geminiModel');
      mapCol('ai_persona', 'aiPersona');
      mapCol('active_focus_item', 'activeFocusItem');
      mapCol('performance_mode', 'performanceMode');
      mapCol('wavy_effect_enabled', 'wavyEffectEnabled');
      mapCol('clock_style', 'clockStyle');

      let { error } = await supabase.from('user_settings').upsert(payload);

      if (error) {
        const basePayload = { 
          user_id: payload.user_id,
          updated_at: payload.updated_at,
          ...(payload.theme && { theme: payload.theme })
        };
        const res = await supabase.from('user_settings').upsert(basePayload);
        error = res.error;
      }

      if (error) {
        console.warn('Settings sync warning (operating in local fallback):', error.message || error);
      }
    } catch (e) {
      console.warn('Settings upsert exception:', e);
    }
  }
};

// ─── Habit Tracker ────────────────────────────────────────────────────────────

export const habitService = {
  async fetchAll(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('id, name, description, frequency_type, frequency_days, frequency_count, completed_dates, streak, best_streak, created_at, why_text, habit_type, completion_details, target_time, relationships')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      frequencyType: r.frequency_type as any,
      frequencyDays: r.frequency_days ?? [],
      frequencyCount: r.frequency_count ?? 0,
      completedDates: r.completed_dates ?? [],
      streak: r.streak ?? 0,
      bestStreak: r.best_streak ?? 0,
      createdAt: r.created_at,
      whyText: r.why_text ?? '',
      habitType: (r.habit_type as any) ?? 'generic',
      completionDetails: r.completion_details ?? {},
      targetTime: r.target_time ?? '',
      relationships: r.relationships ?? [],
    }));
  },

  async create(userId: string, habit: Habit) {
    const { error } = await supabase.from('habits').insert({
      id: habit.id,
      user_id: userId,
      name: habit.name,
      description: habit.description,
      frequency_type: habit.frequencyType,
      frequency_days: habit.frequencyDays,
      frequency_count: habit.frequencyCount,
      completed_dates: habit.completedDates,
      streak: habit.streak,
      best_streak: habit.bestStreak,
      created_at: habit.createdAt,
      updated_at: new Date().toISOString(),
      why_text: habit.whyText ?? '',
      habit_type: habit.habitType ?? 'generic',
      completion_details: habit.completionDetails ?? {},
      target_time: habit.targetTime ?? '',
      relationships: habit.relationships ?? [],
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<Habit>) {
    const { error } = await supabase.from('habits').update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.frequencyType !== undefined && { frequency_type: data.frequencyType }),
      ...(data.frequencyDays !== undefined && { frequency_days: data.frequencyDays }),
      ...(data.frequencyCount !== undefined && { frequency_count: data.frequencyCount }),
      ...(data.completedDates !== undefined && { completed_dates: data.completedDates }),
      ...(data.streak !== undefined && { streak: data.streak }),
      ...(data.bestStreak !== undefined && { best_streak: data.bestStreak }),
      ...(data.whyText !== undefined && { why_text: data.whyText }),
      ...(data.habitType !== undefined && { habit_type: data.habitType }),
      ...(data.completionDetails !== undefined && { completion_details: data.completionDetails }),
      ...(data.targetTime !== undefined && { target_time: data.targetTime }),
      ...(data.relationships !== undefined && { relationships: data.relationships }),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Sprints ──────────────────────────────────────────────────────────────────

export const sprintService = {
  async fetchAll(userId: string): Promise<Sprint[]> {
    const { data, error } = await supabase
      .from('sprints')
      .select('id, title, start_date, end_date, tasks, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status as any,
      tasks: r.tasks ?? [],
    }));
  },

  async create(userId: string, sprint: Sprint) {
    const { error } = await supabase.from('sprints').insert({
      id: sprint.id,
      user_id: userId,
      title: sprint.title,
      start_date: sprint.startDate,
      end_date: sprint.endDate,
      status: sprint.status,
      tasks: sprint.tasks,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<Sprint>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.startDate !== undefined) payload.start_date = data.startDate;
    if (data.endDate !== undefined) payload.end_date = data.endDate;
    if (data.status !== undefined) payload.status = data.status;
    if (data.tasks !== undefined) payload.tasks = data.tasks;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('sprints').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('sprints').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── DSA Problems ─────────────────────────────────────────────────────────────

export const dsaProblemService = {
  async fetchAll(userId: string): Promise<DsaProblem[]> {
    const { data, error } = await supabase
      .from('dsa_problems')
      .select('id, title, platform, difficulty, topic, link, status, notes, solved_at')
      .eq('user_id', userId)
      .order('solved_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      platform: r.platform,
      difficulty: r.difficulty as any,
      topic: r.topic,
      link: r.link || undefined,
      status: r.status as any,
      notes: r.notes || undefined,
      solvedAt: r.solved_at,
    }));
  },

  async create(userId: string, problem: DsaProblem) {
    const { error } = await supabase.from('dsa_problems').insert({
      id: problem.id,
      user_id: userId,
      title: problem.title,
      platform: problem.platform,
      difficulty: problem.difficulty,
      topic: problem.topic,
      link: problem.link || null,
      status: problem.status,
      notes: problem.notes || null,
      solved_at: problem.solvedAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<DsaProblem>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.platform !== undefined) payload.platform = data.platform;
    if (data.difficulty !== undefined) payload.difficulty = data.difficulty;
    if (data.topic !== undefined) payload.topic = data.topic;
    if (data.link !== undefined) payload.link = data.link;
    if (data.status !== undefined) payload.status = data.status;
    if (data.notes !== undefined) payload.notes = data.notes;
    if (data.solvedAt !== undefined) payload.solved_at = data.solvedAt;

    const { error } = await supabase.from('dsa_problems').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('dsa_problems').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── TIL Logs ─────────────────────────────────────────────────────────────────

export const tilLogService = {
  async fetchAll(userId: string): Promise<TilLog[]> {
    const { data, error } = await supabase
      .from('til_logs')
      .select('id, title, content, tags, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      tags: r.tags ?? [],
      createdAt: r.created_at,
    }));
  },

  async create(userId: string, log: TilLog) {
    const { error } = await supabase.from('til_logs').insert({
      id: log.id,
      user_id: userId,
      title: log.title,
      content: log.content,
      tags: log.tags,
      created_at: log.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('til_logs').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── Learning Roadmaps ────────────────────────────────────────────────────────

export const roadmapService = {
  async fetchAll(userId: string): Promise<LearningRoadmap[]> {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('id, title, description, nodes')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      nodes: r.nodes ?? [],
    }));
  },

  async create(userId: string, roadmap: LearningRoadmap) {
    const { error } = await supabase.from('roadmaps').insert({
      id: roadmap.id,
      user_id: userId,
      title: roadmap.title,
      description: roadmap.description,
      nodes: roadmap.nodes,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<LearningRoadmap>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.description !== undefined) payload.description = data.description;
    if (data.nodes !== undefined) payload.nodes = data.nodes;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('roadmaps').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('roadmaps').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── Bookmarks & Resources ────────────────────────────────────────────────────

export const resourceService = {
  async fetchAll(userId: string): Promise<ResourceBookmark[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, url, description, tags, status, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      description: r.description || undefined,
      tags: r.tags ?? [],
      status: r.status as any,
      savedAt: r.saved_at,
    }));
  },

  async create(userId: string, res: ResourceBookmark) {
    const { error } = await supabase.from('resources').insert({
      id: res.id,
      user_id: userId,
      title: res.title,
      url: res.url,
      description: res.description || null,
      tags: res.tags,
      status: res.status,
      saved_at: res.savedAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<ResourceBookmark>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.url !== undefined) payload.url = data.url;
    if (data.description !== undefined) payload.description = data.description;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.status !== undefined) payload.status = data.status;

    const { error } = await supabase.from('resources').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── Developer Goals ──────────────────────────────────────────────────────────

export const devGoalService = {
  async fetchAll(userId: string): Promise<DevGoal[]> {
    const { data, error } = await supabase
      .from('dev_goals')
      .select('id, title, target, current, metric, due_date, completed')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      target: Number(r.target),
      current: Number(r.current),
      metric: r.metric,
      dueDate: r.due_date,
      completed: r.completed,
    }));
  },

  async create(userId: string, goal: DevGoal) {
    const { error } = await supabase.from('dev_goals').insert({
      id: goal.id,
      user_id: userId,
      title: goal.title,
      target: goal.target,
      current: goal.current,
      metric: goal.metric,
      due_date: goal.dueDate,
      completed: goal.completed,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async update(id: string, data: Partial<DevGoal>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.target !== undefined) payload.target = data.target;
    if (data.current !== undefined) payload.current = data.current;
    if (data.metric !== undefined) payload.metric = data.metric;
    if (data.dueDate !== undefined) payload.due_date = data.dueDate;
    if (data.completed !== undefined) payload.completed = data.completed;

    const { error } = await supabase.from('dev_goals').update(payload).eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from('dev_goals').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

// ─── Journal Sticky Notes ───────────────────────────────────────────────────────

export interface JournalStickyNote {
  id: string;
  content: string;
  x: number;
  y: number;
  createdAt: string;
}

export const journalStickyNoteService = {
  async fetchAll(userId: string): Promise<JournalStickyNote[]> {
    const { data, error } = await supabase
      .from('journal_sticky_notes')
      .select('id, content, x, y, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
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

// ─── Study Materials & Exams ───────────────────────────────────────────────────

export const studyMaterialService = {
  async fetchAll(userId: string): Promise<StudyMaterial[]> {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      rawContent: r.raw_content,
      structuredData: r.structured_data,
      flashcards: r.flashcards || [],
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, material: StudyMaterial) {
    const { error } = await supabase.from('study_materials').insert({
      id: material.id,
      user_id: userId,
      title: material.title,
      raw_content: material.rawContent,
      structured_data: material.structuredData,
      flashcards: material.flashcards || [],
      created_at: material.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async update(userId: string, id: string, updates: Partial<StudyMaterial>) {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.structuredData !== undefined) payload.structured_data = updates.structuredData;
    if (updates.flashcards !== undefined) payload.flashcards = updates.flashcards;

    const { error } = await supabase
      .from('study_materials')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(userId: string, id: string) {
    const { error } = await supabase.from('study_materials').delete().eq('id', id).eq('user_id', userId);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

export const examService = {
  async fetchAll(userId: string): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      materialId: r.material_id,
      title: r.title,
      totalMarks: r.total_marks,
      specPrompt: r.spec_prompt,
      questions: r.questions,
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, exam: Exam) {
    const { error } = await supabase.from('exams').insert({
      id: exam.id,
      user_id: userId,
      material_id: exam.materialId,
      title: exam.title,
      total_marks: exam.totalMarks,
      spec_prompt: exam.specPrompt,
      questions: exam.questions,
      created_at: exam.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

export const examAttemptService = {
  async fetchAll(userId: string): Promise<ExamAttempt[]> {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      examId: r.exam_id,
      answers: r.answers,
      totalScore: r.total_score,
      feedback: r.feedback,
      weaknessSummary: r.weakness_summary,
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, attempt: ExamAttempt) {
    const { error } = await supabase.from('exam_attempts').insert({
      id: attempt.id,
      user_id: userId,
      exam_id: attempt.examId,
      answers: attempt.answers,
      total_score: attempt.totalScore,
      feedback: attempt.feedback,
      weakness_summary: attempt.weaknessSummary,
      created_at: attempt.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from('exam_attempts').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  }
};

export const reflectionService = {
  async fetchAll(userId: string): Promise<DailyReflection[]> {
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('id, date, score, what_went_well, blockers, tomorrow_plan')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      date: r.date,
      score: r.score,
      whatWentWell: r.what_went_well ?? '',
      blockers: r.blockers ?? '',
      tomorrowPlan: r.tomorrow_plan ?? '',
    }));
  },

  async create(userId: string, ref: DailyReflection) {
    const { error } = await supabase.from('daily_reflections').insert({
      id: ref.id,
      user_id: userId,
      date: ref.date,
      score: ref.score,
      what_went_well: ref.whatWentWell,
      blockers: ref.blockers,
      tomorrow_plan: ref.tomorrowPlan,
    });
    if (error) throw error;
  },

  async update(id: string, data: Partial<DailyReflection>) {
    const { error } = await supabase.from('daily_reflections').update({
      ...(data.score !== undefined && { score: data.score }),
      ...(data.whatWentWell !== undefined && { what_went_well: data.whatWentWell }),
      ...(data.blockers !== undefined && { blockers: data.blockers }),
      ...(data.tomorrowPlan !== undefined && { tomorrow_plan: data.tomorrowPlan }),
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('daily_reflections').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Visions ──────────────────────────────────────────────────────────────────

export const visionService = {
  async fetchAll(userId: string): Promise<Vision[]> {
    const { data, error } = await supabase.from('visions').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      imageUrl: r.image_url,
      targetDate: r.target_date,
      whyText: r.why_text,
      status: r.status,
      progress: r.progress,
      linkedHabitIds: r.linked_habit_ids ?? [],
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }));
  },
  async create(userId: string, vision: Vision) {
    const { error } = await supabase.from('visions').insert({
      id: vision.id,
      user_id: userId,
      title: vision.title,
      category: vision.category,
      image_url: vision.imageUrl,
      target_date: vision.targetDate,
      why_text: vision.whyText,
      status: vision.status,
      progress: vision.progress,
      linked_habit_ids: vision.linkedHabitIds,
      created_at: vision.createdAt,
      updated_at: vision.updatedAt
    });
    if (error) throw error;
  },
  async update(id: string, data: Partial<Vision>) {
    const { error } = await supabase.from('visions').update({
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.imageUrl !== undefined && { image_url: data.imageUrl }),
      ...(data.targetDate !== undefined && { target_date: data.targetDate }),
      ...(data.whyText !== undefined && { why_text: data.whyText }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.linkedHabitIds !== undefined && { linked_habit_ids: data.linkedHabitIds }),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },
  async delete(id: string) {
    const { error } = await supabase.from('visions').delete().eq('id', id);
    if (error) throw error;
  }
};

// ─── Vision Boards & Canvas Nodes ─────────────────────────────────────────────

export const visionBoardService = {
  async fetchAll(userId: string): Promise<VisionBoard[]> {
    const { data: boardsData, error: bError } = await supabase
      .from('vision_boards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (bError) throw bError;

    const { data: nodesData, error: nError } = await supabase
      .from('vision_nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (nError) throw nError;

    const nodesByBoard: Record<string, VisionNode[]> = {};
    (nodesData ?? []).forEach((n: any) => {
      const node: VisionNode = {
        id: n.id,
        boardId: n.board_id,
        type: n.type,
        title: n.title,
        subtitle: n.subtitle,
        content: n.content,
        imageUrl: n.image_url,
        accentColor: n.accent_color,
        tags: n.tags ?? [],
        position: { x: Number(n.position_x) || 0, y: Number(n.position_y) || 0 },
        size: { width: Number(n.width) || 320, height: Number(n.height) || 220 },
        cornerRadius: n.corner_radius ?? 20,
        hasShadow: n.has_shadow !== false,
        hasBorder: !!n.has_border,
        linkUrl: n.link_url,
        progress: n.progress ?? 0,
        goalTarget: n.goal_target,
        goalCurrent: n.goal_current,
        goalUnit: n.goal_unit,
        mapPins: n.map_pins ?? [],
        audioUrl: n.audio_url,
        audioDuration: n.audio_duration,
        quoteAuthor: n.quote_author,
        fontFamily: n.font_family ?? 'sans',
        fontSize: n.font_size ?? 16,
        fontWeight: n.font_weight ?? 'bold',
        fontStyle: n.font_style ?? 'normal',
        isUppercase: n.is_uppercase !== false,
        letterSpacing: n.letter_spacing ?? 'tight',
        textAlign: n.text_align ?? 'left',
        bgStyle: n.bg_style ?? 'solid',
        textColor: n.text_color,
        isFavorite: !!n.is_favorite,
        createdAt: n.created_at,
        updatedAt: n.updated_at,
      };
      if (!nodesByBoard[n.board_id]) {
        nodesByBoard[n.board_id] = [];
      }
      nodesByBoard[n.board_id].push(node);
    });

    return (boardsData ?? []).map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      category: b.category,
      icon: b.icon ?? '✨',
      isFavorite: !!b.is_favorite,
      theme: b.theme ?? 'dots',
      nodes: nodesByBoard[b.id] ?? [],
      createdAt: b.created_at,
      updatedAt: b.updated_at,
    }));
  },

  async upsertBoard(userId: string, board: VisionBoard) {
    const { error } = await supabase.from('vision_boards').upsert({
      id: board.id,
      user_id: userId,
      title: board.title,
      subtitle: board.subtitle,
      category: board.category,
      icon: board.icon,
      is_favorite: board.isFavorite,
      theme: board.theme,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async deleteBoard(id: string) {
    const { error } = await supabase.from('vision_boards').delete().eq('id', id);
    if (error) throw error;
  },

  async upsertNode(userId: string, node: VisionNode) {
    const { error } = await supabase.from('vision_nodes').upsert({
      id: node.id,
      board_id: node.boardId,
      user_id: userId,
      type: node.type,
      title: node.title,
      subtitle: node.subtitle,
      content: node.content,
      image_url: node.imageUrl,
      accent_color: node.accentColor,
      tags: node.tags,
      position_x: node.position.x,
      position_y: node.position.y,
      width: node.size?.width || 320,
      height: node.size?.height || 220,
      corner_radius: node.cornerRadius ?? 20,
      has_shadow: node.hasShadow !== false,
      has_border: !!node.hasBorder,
      link_url: node.linkUrl,
      progress: node.progress,
      goal_target: node.goalTarget,
      goal_current: node.goalCurrent,
      goal_unit: node.goalUnit,
      map_pins: node.mapPins,
      audio_url: node.audioUrl,
      audio_duration: node.audioDuration,
      quote_author: node.quoteAuthor,
      font_family: node.fontFamily,
      font_size: node.fontSize,
      font_weight: node.fontWeight,
      font_style: node.fontStyle,
      is_uppercase: node.isUppercase,
      letter_spacing: node.letterSpacing,
      text_align: node.textAlign,
      bg_style: node.bgStyle,
      text_color: node.textColor,
      is_favorite: node.isFavorite,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  },

  async deleteNode(id: string) {
    const { error } = await supabase.from('vision_nodes').delete().eq('id', id);
    if (error) throw error;
  },
};

// ─── Bug Reports ─────────────────────────────────────────────────────────────

function normalizeBugStatus(status: any): BugReportStatus {
  if (!status) return 'open';
  const s = String(status).trim().toLowerCase();
  if (s === 'open') return 'open';
  if (s === 'in progress' || s === 'in_progress' || s === 'in_review') return 'in_review';
  if (s === 'fixed_pending_verification' || s === 'pending_verification') return 'fixed_pending_verification';
  if (s === 'resolved' || s === 'closed' || s === 'verified_done' || s === 'done') return 'verified_done';
  if (s === 'reopened' || s === 'reopen') return 'reopened';
  return 'open';
}

function parseClasses(raw: any): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      // split by whitespace
    }
    return raw.split(/\s+/).filter(Boolean);
  }
  return [];
}

function mapBugReportFromRow(r: any): BugReport {
  const classes = parseClasses(r.element_classes);
  const dataAttributes = r.element_data_attributes || {};
  const ancestorPath = r.element_ancestor_path || r.element_selector || undefined;
  const boundingRect = r.element_position || { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0 };
  const viewport = r.viewport_size || r.viewport || { width: 0, height: 0, scrollX: 0, scrollY: 0 };

  const elementInfo: BugReportElementInfo | undefined = (r.element_tag || r.element_position || r.element_selector || r.element_ancestor_path) ? {
    tag: r.element_tag || 'element',
    id: dataAttributes['id'] || undefined,
    classes,
    ancestorPath,
    dataAttributes,
    sectionName: r.section_name || undefined,
    pageRoute: r.page_route || r.route || undefined,
    selector: r.element_selector || ancestorPath || r.element_tag || 'element',
    boundingRect,
    viewport,
    innerTextSnippet: undefined,
  } : undefined;

  return {
    id: r.id,
    userId: r.user_id,
    userEmail: r.user_email,
    reporter: r.reporter || r.user_email || 'user',
    title: r.title,
    description: r.description,
    category: r.category,
    severity: r.severity,
    status: normalizeBugStatus(r.status),
    elementInfo,
    route: r.page_route || r.route || '/dashboard',
    pageRoute: r.page_route || r.route || '/dashboard',
    sectionName: r.section_name || 'General',
    screenshotData: r.screenshot_data,
    markdownContent: r.markdown_content,
    userAgent: r.user_agent,
    fixedInFiles: r.fixed_in_files,
    fixNotes: r.fix_notes,
    verificationNotes: r.verification_notes,
    fixedAt: r.fixed_at,
    verifiedAt: r.verified_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

export const bugReportService = {
  async fetchForAdmin(): Promise<BugReport[]> {
    const { data, error } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapBugReportFromRow);
  },

  async fetchAll(userId?: string): Promise<BugReport[]> {
    let query = supabase.from('bug_reports').select('*').order('created_at', { ascending: false });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(mapBugReportFromRow);
  },

  async create(report: BugReport): Promise<void> {
    const { error } = await supabase.from('bug_reports').insert({
      id: report.id,
      user_id: report.userId || null,
      user_email: report.userEmail || null,
      reporter: report.reporter || report.userEmail || 'user',
      title: report.title,
      description: report.description,
      category: report.category,
      severity: report.severity,
      status: normalizeBugStatus(report.status || 'open'),
      element_selector: report.elementInfo?.selector || report.elementInfo?.ancestorPath || null,
      element_tag: report.elementInfo?.tag || null,
      element_classes: report.elementInfo?.classes ? JSON.stringify(report.elementInfo.classes) : null,
      element_ancestor_path: report.elementInfo?.ancestorPath || null,
      element_data_attributes: report.elementInfo?.dataAttributes || {},
      element_position: report.elementInfo?.boundingRect || {},
      viewport: report.elementInfo?.viewport || {},
      viewport_size: report.elementInfo?.viewport || {},
      route: report.route || report.pageRoute || '/dashboard',
      page_route: report.pageRoute || report.route || '/dashboard',
      section_name: report.sectionName || report.elementInfo?.sectionName || 'General',
      screenshot_data: report.screenshotData || null,
      markdown_content: report.markdownContent || null,
      user_agent: report.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : null),
      fixed_in_files: Array.isArray(report.fixedInFiles) ? report.fixedInFiles.join(', ') : (report.fixedInFiles || null),
      fix_notes: report.fixNotes || null,
      verification_notes: report.verificationNotes || null,
      fixed_at: report.fixedAt || null,
      verified_at: report.verifiedAt || null,
      created_at: report.createdAt || new Date().toISOString(),
      updated_at: report.updatedAt || new Date().toISOString()
    });
    if (error) throw error;
  },

  async updateStatus(id: string, status: BugReportStatus, extra?: Partial<BugReport>): Promise<void> {
    const payload: Record<string, any> = {
      status: normalizeBugStatus(status),
      updated_at: new Date().toISOString()
    };
    if (extra?.fixedInFiles) {
      payload.fixed_in_files = Array.isArray(extra.fixedInFiles) ? extra.fixedInFiles.join(', ') : extra.fixedInFiles;
    }
    if (extra?.fixNotes !== undefined) payload.fix_notes = extra.fixNotes;
    if (extra?.verificationNotes !== undefined) payload.verification_notes = extra.verificationNotes;
    if (extra?.fixedAt !== undefined) payload.fixed_at = extra.fixedAt;
    if (extra?.verifiedAt !== undefined) payload.verified_at = extra.verifiedAt;

    const { error } = await supabase.from('bug_reports').update(payload).eq('id', id);
    if (error) throw error;
  },

  async handOffForVerification(id: string, fixedInFiles: string[] | string, fixNotes: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').update({
      status: 'fixed_pending_verification',
      fixed_in_files: Array.isArray(fixedInFiles) ? fixedInFiles.join(', ') : fixedInFiles,
      fix_notes: fixNotes,
      fixed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async verifyBug(id: string, verified: boolean, notes?: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').update({
      status: verified ? 'verified_done' : 'reopened',
      verification_notes: notes || (verified ? 'Verified as fixed' : 'Reopened during verification'),
      verified_at: verified ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('bug_reports').delete().eq('id', id);
    if (error) throw error;
  }
};

// ─── Project Structures / Maintainer ──────────────────────────────────────────

export const projectStructureService = {
  async fetchAll(userId: string): Promise<ProjectStructure[]> {
    const { data, error } = await supabase
      .from('project_structures')
      .select('id, user_id, name, description, root_name, nodes, tags, template_type, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      // Graceful fallback if table not yet created in Supabase SQL Editor
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

