import React from 'react';
import { IconFlame, IconCheck, IconSitemap, IconPlus } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';

interface DashboardHabitsAndMindmapsProps {
  dueHabits: any[];
  completedTodayCount: number;
  todayStr: string;
  toggleHabitCompletion: (id: string, date: string) => void;
  setActiveModule: (m: any) => void;
  mindmaps: any[];
  handleOpenMindmap: (id: string) => void;
  handleCreateMindmap: () => void;
}

export const DashboardHabitsAndMindmaps: React.FC<DashboardHabitsAndMindmapsProps> = ({
  dueHabits,
  completedTodayCount,
  todayStr,
  toggleHabitCompletion,
  setActiveModule,
  mindmaps,
  handleOpenMindmap,
  handleCreateMindmap,
}) => {
  return (
    <div className="flex flex-col gap-6 lg:col-span-2 text-left">
      {/* Habits Card */}
      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-accent-success">
              <IconFlame size={17} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Daily Habits</h3>
              <span className="text-[12px] text-text-secondary">
                {completedTodayCount} of {dueHabits.length} completed
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveModule('habits')}
            className="text-[12px] font-semibold text-text-primary hover:underline cursor-pointer"
          >
            Manage
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {dueHabits.length === 0 ? (
            <p className="text-[13px] text-text-secondary italic py-2">
              No habits scheduled for today.
            </p>
          ) : (
            dueHabits.slice(0, 3).map((habit) => {
              const isCompleted = habit.completedDates.includes(todayStr);
              return (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors"
                >
                  <button
                    onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                    className="flex items-center flex-1 min-w-0 gap-3 text-left cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-accent-success border-accent-success text-white'
                          : 'border-border-alt'
                      }`}
                    >
                      {isCompleted && <IconCheck size={12} stroke={3} />}
                    </div>
                    <span
                      className={`text-[14px] truncate ${
                        isCompleted
                          ? 'line-through text-text-tertiary'
                          : 'font-medium text-text-primary'
                      }`}
                    >
                      {habit.name}
                    </span>
                  </button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Quick Mindmaps Card */}
      <Card padding="lg" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-primary">
              <IconSitemap size={17} />
            </div>
            <h3 className="text-[15px] font-semibold text-text-primary">Recent Mindmaps</h3>
          </div>
          <button
            onClick={handleCreateMindmap}
            className="text-[12px] font-semibold text-text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <IconPlus size={14} /> New Mindmap
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mindmaps.slice(0, 2).map((m) => (
            <button
              key={m.id}
              onClick={() => handleOpenMindmap(m.id)}
              className="flex items-center gap-3 p-3 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-surface text-text-secondary shrink-0">
                <IconSitemap size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-text-primary truncate">{m.title}</p>
                <span className="text-[11px] text-text-secondary">{m.nodes.length} nodes</span>
              </div>
            </button>
          ))}
          {mindmaps.length === 0 && (
            <p className="text-[13px] text-text-secondary italic col-span-2 py-2">
              No mindmaps created yet.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
