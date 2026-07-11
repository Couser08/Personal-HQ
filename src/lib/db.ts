import { supabase } from './supabase';
import type {
  Note, Link, StockEntry, Subject, InterestRecord,
  MediaLog, Countdown, CodeSnippet, BudgetCategory, BudgetTransaction,
  TodoProject, TodoTask, JournalEntry, Mindmap, StandardCalculation, Habit,
  Sprint, DsaProblem, TilLog, LearningRoadmap, ResourceBookmark, DevGoal
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
      const { error } = await supabase.from('todo_tasks').insert({
        id: task.id,
        user_id: userId,
        project_id: task.projectId,
        title: task.title,
        completed: task.completed,
        priority: task.priority,
        tags: task.tags,
        due_date: task.dueDate,
        start_time: task.startTime,
        end_time: task.endTime,
        pomodoro_count: task.pomodoroCount ?? 0,
        deleted: task.deleted ?? false,
        created_at: task.createdAt,
        subtasks: task.subtasks ?? [],
      });
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
      const payload: any = {};
      if (data.projectId !== undefined) payload.project_id = data.projectId;
      if (data.title !== undefined) payload.title = data.title;
      if (data.completed !== undefined) payload.completed = data.completed;
      if (data.priority !== undefined) payload.priority = data.priority;
      if (data.tags !== undefined) payload.tags = data.tags;
      if (data.dueDate !== undefined) payload.due_date = data.dueDate;
      if (data.startTime !== undefined) payload.start_time = data.startTime;
      if (data.endTime !== undefined) payload.end_time = data.endTime;
      if (data.pomodoroCount !== undefined) payload.pomodoro_count = data.pomodoroCount;
      if (data.deleted !== undefined) payload.deleted = data.deleted;
      if (data.subtasks !== undefined) payload.subtasks = data.subtasks;

      const { error } = await supabase.from('todo_tasks').update(payload).eq('id', id);
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
      .select('*')
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

// ─── User Settings ────────────────────────────────────────────────────────────

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
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;
  }
};

// ─── Habit Tracker ────────────────────────────────────────────────────────────

export const habitService = {
  async fetchAll(userId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
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
      .select('*')
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
      .select('*')
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
      .select('*')
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
      .select('*')
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
      .select('*')
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


