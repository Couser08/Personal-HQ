import { IconCheck, IconTarget } from '@tabler/icons-react';
import { type Habit } from '../../../store/types';

export function HabitChecklist({
  dueHabits,
  todayStr,
  overallProgress,
  completedTodayCount,
  activeFocusItem,
  setActiveFocusItem,
  handleToggleHabit,
}: {
  dueHabits: Habit[];
  todayStr: string;
  overallProgress: number;
  completedTodayCount: number;
  activeFocusItem: any;
  setActiveFocusItem: (val: any) => void;
  handleToggleHabit: (id: string) => Promise<void>;
}) {
  return (
    <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-5 shadow-sm flex flex-col gap-4 text-left">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Due Today</span>
        {dueHabits.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-text-muted">{completedTodayCount}/{dueHabits.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 min-h-[120px]">
        {dueHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <span className="text-2xl">🎉</span>
            <p className="text-xs text-text-muted font-medium">No habits scheduled for today.</p>
          </div>
        ) : (
          dueHabits.map(habit => {
            const isCompleted = habit.completedDates.includes(todayStr);
            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-2xl text-left transition-all w-full border ${
                  isCompleted
                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                    : 'bg-surface-alt/60 border border-border/50 hover:border-border'
                }`}
              >
                <button
                  onClick={() => handleToggleHabit(habit.id)}
                  className="flex items-center gap-3 min-w-0 flex-grow text-left cursor-pointer bg-transparent border-none p-0 outline-none"
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-border'
                  }`}>
                    {isCompleted && <IconCheck size={11} strokeWidth={3} className="text-white" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-semibold truncate ${
                      isCompleted ? 'line-through text-text-muted' : 'text-text-primary'
                    }`}>{habit.name}</p>
                    {habit.description && (
                      <p className="text-[10px] text-text-muted truncate mt-0.5">{habit.description}</p>
                    )}
                  </div>
                </button>
                
                {!isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const isActive = activeFocusItem?.id === habit.id;
                      setActiveFocusItem(isActive ? null : { type: 'habit', id: habit.id, title: habit.name });
                    }}
                    className={`p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer border-none bg-transparent ${
                      activeFocusItem?.id === habit.id
                        ? 'text-emerald-500 bg-emerald-500/10'
                        : 'text-text-muted hover:text-emerald-500 hover:bg-emerald-500/10'
                    }`}
                    title={activeFocusItem?.id === habit.id ? "Deactivate focus" : "Focus on this habit"}
                  >
                    <IconTarget size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
