import { supabase } from '../supabase';
import type { Habit } from '../../store/types';

export const habitService = {
  async fetchAll(userId: string, limit = 50): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('id, name, description, frequency_type, frequency_days, frequency_count, completed_dates, streak, best_streak, created_at, why_text, habit_type, completion_details, target_time, relationships')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
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
