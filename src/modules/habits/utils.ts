import { type Habit } from '../../store/types';

export const DAYS_OF_WEEK = [
  { label: 'S', value: 0, fullName: 'Sunday' },
  { label: 'M', value: 1, fullName: 'Monday' },
  { label: 'T', value: 2, fullName: 'Tuesday' },
  { label: 'W', value: 3, fullName: 'Wednesday' },
  { label: 'T', value: 4, fullName: 'Thursday' },
  { label: 'F', value: 5, fullName: 'Friday' },
  { label: 'S', value: 6, fullName: 'Saturday' }
];

export const isHabitDueToday = (habit: Habit, todayDayOfWeek: number): boolean => {
  if (habit.frequencyType === 'daily') return true;
  if (habit.frequencyType === 'weekly_days') {
    return habit.frequencyDays.includes(todayDayOfWeek);
  }
  if (habit.frequencyType === 'weekly_count') {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);

    const completionsThisWeek = habit.completedDates.filter(dateStr => {
      const d = new Date(dateStr);
      return d >= monday;
    }).length;

    return completionsThisWeek < habit.frequencyCount;
  }
  return true;
};

export const getWeekGrid = (habit: Habit, todayStr: string) => {
  const dates: { dateStr: string; dayLabel: string; isCompleted: boolean; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    dates.push({
      dateStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isCompleted: habit.completedDates.includes(dateStr),
      isToday: dateStr === todayStr
    });
  }
  return dates;
};
