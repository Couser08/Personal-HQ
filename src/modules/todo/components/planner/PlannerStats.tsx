
import { IconCircleCheck, IconClock, IconFlame, IconLayoutList } from '@tabler/icons-react';
import { type TodoTask } from '../../../../store/types';

interface PlannerStatsProps {
  tasks: TodoTask[];
}

export function PlannerStats({ tasks }: PlannerStatsProps) {
  const totalPlans = tasks.length;
  const completedPlans = tasks.filter(t => t.completed).length;
  
  // Calculate focus time based on pomodoroCount (assume 25m per pomodoro)
  const totalPomodoros = tasks.reduce((acc, t) => acc + (t.pomodoroCount || 0), 0);
  const totalFocusMinutes = totalPomodoros * 25;
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusMins = totalFocusMinutes % 60;
  const focusTimeString = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  const productivityTarget = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
      {/* Plans Today */}
      <div className="bg-surface rounded-xl p-3 border border-border/50 shadow-subtle flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
          <IconCircleCheck size={20} stroke={1.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary leading-tight">{totalPlans}</span>
          <span className="text-[11px] font-semibold text-text-muted">Plans Today</span>
        </div>
      </div>

      {/* Focus Time */}
      <div className="bg-surface rounded-xl p-3 border border-border/50 shadow-subtle flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
          <IconClock size={20} stroke={1.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary leading-tight">{focusTimeString}</span>
          <span className="text-[11px] font-semibold text-text-muted">Focus Time</span>
        </div>
      </div>

      {/* Productivity Target */}
      <div className="bg-surface rounded-xl p-3 border border-border/50 shadow-subtle flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
          <IconFlame size={20} stroke={1.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary leading-tight">{productivityTarget}%</span>
          <span className="text-[11px] font-semibold text-text-muted">Productivity</span>
        </div>
      </div>

      {/* Completed Today */}
      <div className="bg-surface rounded-xl p-3 border border-border/50 shadow-subtle flex items-center gap-3">
        <div className="w-10 h-10 rounded-[12px] bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
          <IconLayoutList size={20} stroke={1.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-text-primary leading-tight">{tasks.filter(t => !t.completed).length}</span>
          <span className="text-[11px] font-semibold text-text-muted">Remaining Tasks</span>
        </div>
      </div>
    </div>
  );
}
