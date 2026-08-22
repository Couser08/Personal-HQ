import { supabase } from '../supabase';
import type {
  Sprint,
  DsaProblem,
  TilLog,
  LearningRoadmap,
  ResourceBookmark,
  DevGoal,
  DailyReflection,
} from '../../store/types';

export const sprintService = {
  async fetchAll(userId: string, limit = 50): Promise<Sprint[]> {
    const { data, error } = await supabase
      .from('sprints')
      .select('id, title, start_date, end_date, tasks, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);
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
  },
};

export const dsaProblemService = {
  async fetchAll(userId: string, limit = 50): Promise<DsaProblem[]> {
    const { data, error } = await supabase
      .from('dsa_problems')
      .select('id, title, platform, difficulty, topic, link, status, notes, solved_at')
      .eq('user_id', userId)
      .order('solved_at', { ascending: false })
      .limit(limit);
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
  },
};

export const tilLogService = {
  async fetchAll(userId: string, limit = 50): Promise<TilLog[]> {
    const { data, error } = await supabase
      .from('til_logs')
      .select('id, title, content, tags, created_at')
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
  },
};

export const roadmapService = {
  async fetchAll(userId: string, limit = 50): Promise<LearningRoadmap[]> {
    const { data, error } = await supabase
      .from('roadmaps')
      .select('id, title, description, nodes')
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
  },
};

export const resourceService = {
  async fetchAll(userId: string, limit = 50): Promise<ResourceBookmark[]> {
    const { data, error } = await supabase
      .from('resources')
      .select('id, title, url, description, tags, status, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .limit(limit);
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
  },
};

export const devGoalService = {
  async fetchAll(userId: string, limit = 50): Promise<DevGoal[]> {
    const { data, error } = await supabase
      .from('dev_goals')
      .select('id, title, target, current, metric, due_date, completed')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .limit(limit);
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
  },
};

export const reflectionService = {
  async fetchAll(userId: string, limit = 50): Promise<DailyReflection[]> {
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('id, date, score, what_went_well, blockers, tomorrow_plan')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
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
    const { error } = await supabase
      .from('daily_reflections')
      .update({
        ...(data.score !== undefined && { score: data.score }),
        ...(data.whatWentWell !== undefined && { what_went_well: data.whatWentWell }),
        ...(data.blockers !== undefined && { blockers: data.blockers }),
        ...(data.tomorrowPlan !== undefined && { tomorrow_plan: data.tomorrowPlan }),
      })
      .eq('id', id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from('daily_reflections').delete().eq('id', id);
    if (error) throw error;
  },
};
