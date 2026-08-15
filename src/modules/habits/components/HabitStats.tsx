import { IconFlame, IconCheck } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { Card } from '../../../components/ui/Card';
import { StatCard } from '../../../components/ui/StatCard';
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
  const percentage = Math.round(overallProgress * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans select-none">
      {/* Today's Progress Card */}
      <Card padding="md" className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
            Today's Progress
          </span>
          <span className="text-3xl font-semibold text-text-primary tracking-tight leading-none">
            {percentage}%
          </span>
          <span className="text-[13px] text-text-secondary mt-1">
            {completedTodayCount} of {dueHabitsCount} done
          </span>
        </div>
        <div className="shrink-0">
          <ProgressRing
            progress={overallProgress}
            size={68}
            strokeWidth={6}
            color="#22C55E"
            style="solid"
          />
        </div>
      </Card>

      {/* Streak Leader */}
      <StatCard
        title="Streak Leader"
        value={streakLeader ? `${streakLeader.streak}d` : '0d'}
        subtitle={streakLeader ? streakLeader.name : 'No streaks yet'}
        icon={<IconFlame size={20} className="text-[#FF7A45]" />}
        trend={streakLeader && (streakLeader.streak || 0) > 0 ? { value: `${streakLeader.streak} day run`, isPositive: true } : undefined}
      />

      {/* Total Completions */}
      <StatCard
        title="Total Check-ins"
        value={String(totalCompletions)}
        subtitle={`Across ${habitsCount} active habits`}
        icon={<IconCheck size={20} className="text-[#22C55E]" />}
      />
    </div>
  );
}
