import React from 'react';
import { IconRocket, IconLayoutList } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';

interface DashboardHeroBannerProps {
  greeting: string;
  pomodoroTimerState: string;
  startGlobalPomodoro: () => void;
  resumeGlobalPomodoro: () => void;
  setActiveModule: (m: any) => void;
  completedTasksCount: number;
  totalTasks: number;
  todayTasksCount: number;
}

export const DashboardHeroBanner: React.FC<DashboardHeroBannerProps> = ({
  greeting,
  pomodoroTimerState,
  startGlobalPomodoro,
  resumeGlobalPomodoro,
  setActiveModule,
  completedTasksCount,
  totalTasks,
  todayTasksCount,
}) => {
  return (
    <Card
      padding="lg"
      className="relative flex flex-col items-start justify-between gap-6 overflow-hidden md:flex-row md:items-center text-left"
    >
      <div className="z-10 flex flex-col max-w-2xl gap-2">
        <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
          {greeting} •{' '}
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </span>
        <h1 className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-text-primary leading-tight">
          Focus on what matters today.
        </h1>
        <p className="text-[14px] text-text-secondary leading-relaxed mt-1">
          Organise your thoughts, track daily habits, and lock in deep work sessions inside your
          personal headquarters.
        </p>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => {
              if (pomodoroTimerState !== 'running') {
                if (pomodoroTimerState === 'paused') {
                  resumeGlobalPomodoro();
                } else {
                  startGlobalPomodoro();
                }
              }
              setActiveModule('pomodoro');
            }}
            className="bg-primary text-text-on-accent px-6 py-2.5 rounded-full font-semibold text-[13px] hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <IconRocket size={16} /> Start Focus Session
          </button>
          <button
            onClick={() => setActiveModule('todo')}
            className="bg-surface-alt text-text-primary px-5 py-2.5 rounded-full font-semibold text-[13px] hover:bg-surface-hover transition-colors cursor-pointer flex items-center gap-2"
          >
            <IconLayoutList size={16} className="text-text-secondary" /> View Tasks
          </button>
        </div>
      </div>

      {/* Quick Schedule Preview Pill inside Hero */}
      <div className="z-10 flex flex-col gap-2 bg-surface-alt p-4 rounded-[18px] w-full md:w-auto min-w-[200px] shrink-0">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
            Daily Target
          </span>
          <span className="w-2 h-2 rounded-full bg-accent-success" />
        </div>
        <div className="text-[18px] font-semibold text-text-primary">
          {completedTasksCount} / {totalTasks} Done
        </div>
        <span className="text-[12px] text-text-secondary">{todayTasksCount} tasks remaining</span>
      </div>
    </Card>
  );
};
