import React from 'react';
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconArrowRight,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { ProgressRing } from '../../../components/ui/ProgressRing';
import type { TodoTask, Habit } from '../../../store/types';

interface PomodoroClockCardProps {
  pomodoroSessionId: string;
  display: string;
  fontStyle: string;
  pomodoroStreak: number;
  associatedTask?: TodoTask;
  associatedHabit?: Habit | null;
  isRunning: boolean;
  pomodoroTimerState: string;
  togglePlayPause: () => void;
  stopGlobalPomodoro: () => void;
  skipGlobalPomodoro: () => void;
  ringSize: number;
  progress: number;
  sessionColor: string;
  ringStyle: any;
}

export const PomodoroClockCard: React.FC<PomodoroClockCardProps> = ({
  pomodoroSessionId,
  display,
  fontStyle,
  pomodoroStreak,
  associatedTask,
  associatedHabit,
  isRunning,
  pomodoroTimerState,
  togglePlayPause,
  stopGlobalPomodoro,
  skipGlobalPomodoro,
  ringSize,
  progress,
  sessionColor,
  ringStyle,
}) => {
  return (
    <Card
      padding="lg"
      className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-12 relative overflow-hidden p-5 sm:p-8 text-left"
    >
      {/* Left pane: digital clock & controls */}
      <div className="flex-1 flex flex-col justify-center gap-6 text-center md:text-left w-full">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary block mb-2">
            {pomodoroSessionId === 'focus' ? 'Focus Mode' : 'Break Time'}
          </span>

          <div
            className={`text-6xl sm:text-7xl md:text-[6.5rem] leading-none font-semibold tracking-tight text-text-primary select-none ${fontStyle}`}
          >
            {display}
          </div>

          <div className="mt-6 flex flex-col gap-2 items-center md:items-start">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[12px] font-semibold bg-surface-alt text-text-primary">
              <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
              {pomodoroSessionId === 'focus'
                ? `Session ${pomodoroStreak + 1}`
                : 'Rest & Recharge'}
            </span>
            {associatedTask && (
              <span className="text-[13px] text-text-secondary">
                🎯 Target:{' '}
                <span className="font-semibold text-text-primary">{associatedTask.title}</span>
              </span>
            )}
            {associatedHabit && (
              <span className="text-[13px] text-text-secondary">
                🔥 Habit:{' '}
                <span className="font-semibold text-text-primary">{associatedHabit.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 justify-center md:justify-start">
          <button
            onClick={togglePlayPause}
            className="px-8 py-3 rounded-full text-[14px] font-semibold bg-text-primary text-background hover:opacity-90 transition-all flex items-center gap-2 border-none shadow-sm cursor-pointer"
          >
            {isRunning ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
            {isRunning ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={stopGlobalPomodoro}
            disabled={pomodoroTimerState === 'idle'}
            className="px-5 py-3 rounded-full text-[13px] font-semibold bg-surface-alt hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-primary transition-all disabled:opacity-40 border-none cursor-pointer"
          >
            Stop
          </button>
          <button
            onClick={skipGlobalPomodoro}
            disabled={pomodoroTimerState === 'idle'}
            className="px-5 py-3 rounded-full text-[13px] font-semibold bg-surface-alt hover:bg-neutral-200 dark:hover:bg-neutral-800 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 border-none cursor-pointer flex items-center gap-1"
          >
            <IconArrowRight size={15} /> Skip
          </button>
        </div>
      </div>

      {/* Vertical Hairline Divider */}
      <div className="hidden md:block w-px h-56 bg-border-hairline" />

      {/* Right pane: Radial Progress Ring */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        <div
          className="relative flex items-center justify-center"
          style={{ width: ringSize, height: ringSize }}
        >
          <ProgressRing
            progress={progress}
            size={ringSize}
            strokeWidth={8}
            color={pomodoroSessionId === 'focus' ? '#111111' : sessionColor}
            style={ringStyle}
          />

          {/* Center interactive button */}
          <button
            onClick={togglePlayPause}
            aria-label={isRunning ? 'Pause' : 'Play'}
            className="absolute w-20 h-20 rounded-full bg-surface shadow-float flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-10 cursor-pointer border-none"
          >
            {isRunning ? (
              <IconPlayerPause size={28} className="text-text-primary" />
            ) : (
              <IconPlayerPlay size={28} className="text-text-primary translate-x-0.5" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
