import React from 'react';
import { IconTarget, IconSparkles } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import type { TodoTask, Habit } from '../../../store/types';

interface PomodoroTargetCardProps {
  todoTasks: TodoTask[];
  habits: Habit[];
  pomodoroAssociatedTaskId: string | null;
  handleAssociatedTaskChange: (id: string | null) => void;
  associatedTask?: TodoTask;
  customSessions: Record<string, { minutes: number; total: number }>;
  setCustomSessions: React.Dispatch<
    React.SetStateAction<Record<string, { minutes: number; total: number }>>
  >;
  applyTimer: (minutes: number, sid: any) => void;
}

export const PomodoroTargetCard: React.FC<PomodoroTargetCardProps> = ({
  todoTasks,
  habits,
  pomodoroAssociatedTaskId,
  handleAssociatedTaskChange,
  associatedTask,
  customSessions,
  setCustomSessions,
  applyTimer,
}) => {
  return (
    <>
      {/* Task Association Row */}
      <Card padding="md" className="flex items-center justify-between gap-4 flex-wrap text-left">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-surface-alt text-text-primary">
            <IconTarget size={18} />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-text-primary">Focus Target</h3>
            <p className="text-[11px] text-text-secondary">Attach a todo item or habit to this timer</p>
          </div>
        </div>

        <div>
          <select
            value={pomodoroAssociatedTaskId || ''}
            onChange={(e) => handleAssociatedTaskChange(e.target.value || null)}
            className="bg-surface-alt rounded-[var(--radius-input)] px-4 py-2.5 text-[13px] font-medium text-text-primary focus:outline-none focus:ring-1 focus:ring-text-primary cursor-pointer min-w-56 border-none"
          >
            <option value="">No Associated Target</option>
            <optgroup label="To-Do Tasks">
              {todoTasks
                .filter((t) => !t.completed && !t.deleted)
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title} {task.pomodoroCount ? `(🍅 ${task.pomodoroCount})` : ''}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Habits">
              {habits.map((habit: Habit) => (
                <option key={habit.id} value={`habit-${habit.id}`}>
                  {habit.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </Card>

      {/* Custom Task Session setup (if active task) */}
      {associatedTask && (
        <Card padding="md" className="flex flex-col gap-3 -mt-2 text-left">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <IconSparkles size={16} className="text-text-primary" />
              <div>
                <h4 className="text-[13px] font-semibold text-text-primary">
                  Custom Target for "{associatedTask.title}"
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Configure specific duration and quota for this item
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={!!customSessions[associatedTask.id]}
                onChange={(e) => {
                  if (e.target.checked) {
                    const updated = {
                      ...customSessions,
                      [associatedTask.id]: { minutes: 25, total: 4 },
                    };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                    applyTimer(25, 'focus');
                  } else {
                    const updated = { ...customSessions };
                    delete updated[associatedTask.id];
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-text-primary"></div>
            </label>
          </div>

          {customSessions[associatedTask.id] && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-hairline">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Minutes
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={customSessions[associatedTask.id].minutes}
                  onChange={(e) => {
                    const m = Math.max(1, parseInt(e.target.value) || 25);
                    const updated = {
                      ...customSessions,
                      [associatedTask.id]: { ...customSessions[associatedTask.id], minutes: m },
                    };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                    applyTimer(m, 'focus');
                  }}
                  className="bg-surface-alt rounded-[var(--radius-input)] px-3 py-2 text-[13px] font-medium text-text-primary outline-none border-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Target Count
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={customSessions[associatedTask.id].total}
                  onChange={(e) => {
                    const tot = Math.max(1, parseInt(e.target.value) || 4);
                    const updated = {
                      ...customSessions,
                      [associatedTask.id]: { ...customSessions[associatedTask.id], total: tot },
                    };
                    setCustomSessions(updated);
                    localStorage.setItem('phq_task_custom_sessions', JSON.stringify(updated));
                  }}
                  className="bg-surface-alt rounded-[var(--radius-input)] px-3 py-2 text-[13px] font-medium text-text-primary outline-none border-none"
                />
              </div>
            </div>
          )}
        </Card>
      )}
    </>
  );
};
