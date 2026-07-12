import { IconFlame } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { ProgressRing } from '../../../components/ui/ProgressRing';

export function HabitStats({
  overallProgress,
  completedTodayCount,
  dueHabitsCount,
  streakLeader,
  totalCompletions,
  habitsCount,
}: {
  overallProgress: number;
  completedTodayCount: number;
  dueHabitsCount: number;
  streakLeader: Habit | null;
  totalCompletions: number;
  habitsCount: number;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today's Progress */}
      <div className="bg-surface border border-border rounded-3xl p-5 flex items-center justify-between shadow-sm text-left">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Today's Progress</span>
          <span className="text-3xl font-black text-text-primary tracking-tight leading-none">
            {Math.round(overallProgress * 100)}%
          </span>
          <span className="text-xs text-text-secondary font-medium">
            {completedTodayCount} of {dueHabitsCount} done
          </span>
        </div>
        <div className="shrink-0">
          <ProgressRing
            progress={overallProgress}
            size={70}
            strokeWidth={7}
            color="var(--color-primary)"
            style="glowing"
          />
        </div>
      </div>

      {/* Streak Leader */}
      <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-2 shadow-sm text-left">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Streak Leader</span>
        <div className="flex items-baseline gap-1.5">
          <IconFlame className="text-orange-500" size={20} />
          <span className="text-3xl font-black text-text-primary tracking-tight leading-none">
            {streakLeader ? streakLeader.streak : 0}
          </span>
          <span className="text-sm font-bold text-text-secondary">days</span>
        </div>
        <span className="text-xs text-text-secondary truncate">
          {streakLeader ? streakLeader.name : 'No streaks yet'}
        </span>
      </div>

      {/* Total Check-ins */}
      <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-2 shadow-sm text-left">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">All-Time Check-ins</span>
        <span className="text-3xl font-black text-text-primary tracking-tight leading-none">{totalCompletions}</span>
        <span className="text-xs text-text-secondary">Across {habitsCount} habits</span>
      </div>
    </div>
  );
}
