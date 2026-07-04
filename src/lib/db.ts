import { supabase } from './supabase';
import type {
  Note, Link, StockEntry, Subject, InterestRecord,
  MediaLog, Countdown, CodeSnippet, BudgetCategory, BudgetTransaction,
  TodoProject, TodoTask, JournalEntry, Mindmap, StandardCalculation
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
    }));
  },

  async create(userId: string, entry: JournalEntry) {
    const { error } = await supabase.from('journals').insert({
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
    if (error) throw error;
  },

  async update(id: string, data: Partial<JournalEntry>) {
    const payload: any = {};
    if (data.title !== undefined) payload.title = data.title;
    if (data.content !== undefined) payload.content = data.content;
    if (data.date !== undefined) payload.date = data.date;
    if (data.mood !== undefined) payload.mood = data.mood;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.pinned !== undefined) payload.pinned = data.pinned;
    if (data.focusList !== undefined) payload.focus_list = data.focusList;
    if (data.pageStyle !== undefined) payload.page_style = data.pageStyle;
    if (data.images !== undefined) payload.images = data.images;
    if (data.reflection !== undefined) payload.reflection = data.reflection;
    if (data.attachments !== undefined) payload.attachments = data.attachments;
    payload.updated_at = new Date().toISOString();

    const { error } = await supabase.from('journals').update(payload).eq('id', id);
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
