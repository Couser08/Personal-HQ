import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowRight,
  IconPlus,
  IconCheck,
  IconTarget,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import type { TodoTask } from '../../../store/types';

interface DashboardWeekPlannerProps {
  weekDays: { dayName: string; dateNum: number; fullDate: Date; isToday: boolean }[];
  selectedDayOffset: number;
  setSelectedDayOffset: (offset: number) => void;
  setActiveModule: (m: any) => void;
  todayTasks: TodoTask[];
  visibleTasks: TodoTask[];
  showAllTasks: boolean;
  setShowAllTasks: (show: boolean) => void;
  updateTodoTask: (id: string, updates: Partial<TodoTask>) => void;
  activeFocusItem: any;
  setActiveFocusItem: (item: any) => void;
  handleAddTask: (e: React.FormEvent) => void;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
}

export const DashboardWeekPlanner: React.FC<DashboardWeekPlannerProps> = ({
  weekDays,
  selectedDayOffset,
  setSelectedDayOffset,
  setActiveModule,
  todayTasks,
  visibleTasks,
  showAllTasks,
  setShowAllTasks,
  updateTodoTask,
  activeFocusItem,
  setActiveFocusItem,
  handleAddTask,
  newTaskTitle,
  setNewTaskTitle,
}) => {
  return (
    <Card padding="lg" className="flex flex-col gap-6 text-left">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[18px] font-semibold text-text-primary">Week Planner</h2>
          <p className="text-[13px] text-text-secondary">Select a day to view agenda and tasks</p>
        </div>
        <span className="text-[12px] font-medium text-text-tertiary">
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((d, index) => {
          const isSelected = selectedDayOffset === index;
          return (
            <button
              key={d.dayName}
              onClick={() => setSelectedDayOffset(index)}
              className="flex flex-col items-center gap-2 p-2 rounded-[14px] hover:bg-surface-alt transition-colors cursor-pointer group"
            >
              <span
                className={`text-[11px] font-semibold uppercase transition-colors ${
                  d.isToday
                    ? 'text-accent-highlight'
                    : 'text-text-secondary group-hover:text-text-primary'
                }`}
              >
                {d.dayName}
              </span>
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-[14px] sm:text-[15px] font-semibold transition-all ${
                  d.isToday
                    ? 'bg-accent-highlight text-white shadow-sm'
                    : isSelected
                    ? 'bg-primary text-surface shadow-sm'
                    : 'text-text-primary group-hover:bg-surface-alt'
                }`}
              >
                {d.dateNum}
              </div>
              {d.isToday && <div className="w-1.5 h-1.5 rounded-full bg-accent-highlight mt-0.5" />}
              {!d.isToday && <div className="w-1.5 h-1.5 rounded-full bg-transparent mt-0.5" />}
            </button>
          );
        })}
      </div>

      <div className="w-full h-px bg-border-hairline" />

      {/* Quick Task Entry inside Planner */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
            Today's Action Items ({todayTasks.length})
          </span>
          <button
            onClick={() => setActiveModule('todo')}
            className="text-[12px] font-semibold text-text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Planner <IconArrowRight size={14} />
          </button>
        </div>

        <form onSubmit={handleAddTask} className="flex w-full gap-2">
          <input
            type="text"
            placeholder="Add a new task for today..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 bg-surface-alt border border-transparent rounded-[12px] px-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:bg-surface focus:ring-2 focus:ring-primary/20 transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="bg-primary text-surface px-5 py-2.5 rounded-[12px] font-semibold text-[13px] hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <IconPlus size={16} /> Add
          </button>
        </form>

        {/* Tasks List */}
        <div className="flex flex-col gap-2">
          {todayTasks.length === 0 ? (
            <div className="p-8 text-center bg-surface-alt rounded-[14px]">
              <p className="text-[13px] font-medium text-text-secondary">
                🎉 All caught up! No pending tasks for today.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {visibleTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center justify-between p-3.5 rounded-[14px] bg-surface-alt hover:bg-surface-hover transition-colors group"
                >
                  <button
                    onClick={() => updateTodoTask(task.id, { completed: !task.completed })}
                    className="flex items-center gap-3.5 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        task.completed
                          ? 'bg-accent-success border-accent-success text-white'
                          : 'border-border-alt group-hover:border-text-primary'
                      }`}
                    >
                      {task.completed && <IconCheck size={12} stroke={3} />}
                    </div>
                    <span
                      className={`text-[14px] truncate ${
                        task.completed
                          ? 'line-through text-text-tertiary'
                          : 'font-medium text-text-primary'
                      }`}
                    >
                      {task.title}
                    </span>
                  </button>

                  {!task.completed && (
                    <button
                      onClick={() => {
                        const isActive = activeFocusItem?.id === task.id;
                        setActiveFocusItem(
                          isActive ? null : { type: 'todo', id: task.id, title: task.title },
                        );
                      }}
                      title={activeFocusItem?.id === task.id ? 'Active Focus' : 'Focus on Task'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                        activeFocusItem?.id === task.id
                          ? 'bg-primary text-surface'
                          : 'text-text-tertiary hover:text-text-primary opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <IconTarget size={15} />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {todayTasks.length > 4 && (
            <button
              onClick={() => setShowAllTasks(!showAllTasks)}
              className="w-full py-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-center"
            >
              {showAllTasks ? 'Show fewer tasks' : `Show all ${todayTasks.length} tasks`}
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
