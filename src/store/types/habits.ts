export type HabitFrequency = 'daily' | 'weekly_days' | 'weekly_count';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  frequencyType: HabitFrequency;
  frequencyDays: number[];
  frequencyCount: number;
  createdAt: string;
  completedDates: string[];
  completionDetails?: Record<string, any>;
  habitType?: string;
  streak?: number;
  bestStreak?: number;
  whyText?: string;
  targetTime?: string;
  relationships?: any;
}

export interface DailyReflection {
  id: string;
  date: string;
  score?: number;
  whatWentWell?: string;
  blockers?: string;
  tomorrowPlan?: string;
  highlightOfDay?: string;
  gratitude?: string;
  improvement?: string;
  rating?: number;
  createdAt?: string;
}
