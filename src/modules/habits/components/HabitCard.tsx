import { IconFlame, IconTarget, IconSettings, IconTrash, IconAward } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';
import { getWeekGrid } from '../utils';

export function HabitCard({
  habit,
  todayStr,
  activeFocusItem,
  setActiveFocusItem,
  handleOpenAddModal,
  showConfirm,
  deleteHabit,
}: {
  habit: Habit;
  todayStr: string;
  activeFocusItem: any;
  setActiveFocusItem: (val: any) => void;
  handleOpenAddModal: (habit: Habit) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  deleteHabit: (id: string) => Promise<void>;
}) {
  const weekGrid = getWeekGrid(habit, todayStr);

  return (
    <div className="bg-surface border border-border rounded-3xl p-4 shadow-sm flex flex-col gap-3 group text-left">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary truncate">{habit.name}</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-surface-alt border border-border text-text-muted uppercase tracking-tight shrink-0">
              {habit.frequencyType === 'daily' ? 'Daily' :
               habit.frequencyType === 'weekly_count' ? `${habit.frequencyCount}×/wk` : 'Custom'}
            </span>
          </div>
          {habit.description && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{habit.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {!habit.completedDates.includes(todayStr) && (
            <button
              onClick={() => {
                const isActive = activeFocusItem?.id === habit.id;
                setActiveFocusItem(isActive ? null : { type: 'habit', id: habit.id, title: habit.name });
              }}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer shadow-sm active:scale-95 ${
                activeFocusItem?.id === habit.id
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-surface-alt hover:bg-surface border-border/40 text-text-secondary hover:text-emerald-500'
              }`}
              title={activeFocusItem?.id === habit.id ? "Deactivate focus" : "Focus on this habit"}
            >
              <IconTarget size={13} />
            </button>
          )}
          <button
            onClick={() => handleOpenAddModal(habit)}
            className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface border border-border/40 text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-95"
            title="Edit"
          >
            <IconSettings size={13} />
          </button>
          <button
            onClick={() => showConfirm('Delete Habit', `Delete "${habit.name}"?`, () => deleteHabit(habit.id))}
            className="p-1.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-500/70 hover:text-red-500 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Delete"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 bg-surface-alt/50 rounded-2xl p-3">
        <div className="flex flex-col gap-1.5 flex-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">This Week</span>
          <div className="flex items-center gap-1.5">
            {weekGrid.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-0.5">
                <span className="text-[8px] text-text-muted font-medium">{day.dayLabel.slice(0, 2)}</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                  day.isCompleted
                    ? 'bg-emerald-500 text-white'
                    : day.isToday
                      ? 'border-2 border-primary bg-transparent'
                      : 'bg-surface border border-border text-text-muted'
                }`}>
                  {day.isCompleted ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 border-l border-border pl-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 text-orange-500">
              <IconFlame size={15} />
              <span className="text-base font-black font-mono">{habit.streak}d</span>
            </div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wide mt-0.5">Streak</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-0.5 text-text-secondary">
              <IconAward size={15} />
              <span className="text-base font-black font-mono">{habit.bestStreak}d</span>
            </div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wide mt-0.5">Best</span>
          </div>
        </div>
      </div>

      {/* GitHub-style Contribution Heatmap */}
      <div className="flex flex-col gap-1.5 bg-surface-alt/45 rounded-2xl p-3 border border-border/20">
        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Last 30 Days Consistency</span>
        <div className="flex flex-wrap gap-1 items-center mt-1 select-none">
          {Array.from({ length: 30 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            const isCompleted = habit.completedDates.includes(dateStr);
            const isCurrentToday = dateStr === todayStr;

            return (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${
                  isCompleted 
                    ? 'bg-emerald-500 hover:brightness-110 shadow-sm' 
                    : isCurrentToday
                      ? 'border-2 border-primary bg-transparent animate-pulse'
                      : 'bg-border/60 dark:bg-neutral-800 hover:bg-border/90 dark:hover:bg-neutral-700'
                }`}
                title={`${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}: ${isCompleted ? 'Completed' : 'Missed'}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
