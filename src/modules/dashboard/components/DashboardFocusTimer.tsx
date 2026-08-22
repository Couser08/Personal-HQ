import React from 'react';
import {
  IconClockPlay,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';

interface DashboardFocusTimerProps {
  pomodoroTimerState: string;
  pomodoroSecondsLeft: number;
  pauseGlobalPomodoro: () => void;
  resumeGlobalPomodoro: () => void;
  startGlobalPomodoro: () => void;
  stopGlobalPomodoro: () => void;
  pomodoroProgress: number;
  formatTime: (sec: number) => string;
}

export const DashboardFocusTimer: React.FC<DashboardFocusTimerProps> = ({
  pomodoroTimerState,
  pomodoroSecondsLeft,
  pauseGlobalPomodoro,
  resumeGlobalPomodoro,
  startGlobalPomodoro,
  stopGlobalPomodoro,
  pomodoroProgress,
  formatTime,
}) => {
  const timerRadius = 48;
  const timerCircumference = 2 * Math.PI * timerRadius;

  return (
    <Card padding="lg" className="flex flex-col gap-6 lg:col-span-1 min-h-[360px] text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-alt text-text-primary">
            <IconClockPlay size={17} />
          </div>
          <span className="text-[15px] font-semibold text-text-primary">Focus Timer</span>
        </div>
        <span
          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
            pomodoroTimerState === 'running'
              ? 'bg-accent-success/10 text-accent-success'
              : pomodoroTimerState === 'paused'
              ? 'bg-accent-warning/10 text-accent-warning'
              : 'bg-surface-alt text-text-tertiary'
          }`}
        >
          {pomodoroTimerState === 'running'
            ? 'Running'
            : pomodoroTimerState === 'paused'
            ? 'Paused'
            : 'Ready'}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center w-36 h-36">
          <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={timerRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-border-hairline"
            />
            <circle
              cx="60"
              cy="60"
              r={timerRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              className={pomodoroTimerState !== 'idle' ? 'text-primary' : 'text-text-tertiary/30'}
              strokeDasharray={`${timerCircumference}`}
              strokeDashoffset={`${timerCircumference * (1 - pomodoroProgress / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <span className="text-[32px] font-semibold text-text-primary font-mono tracking-tight z-10">
            {formatTime(pomodoroSecondsLeft)}
          </span>
        </div>
        <p className="text-[12px] text-text-secondary mt-4 font-medium">
          {pomodoroTimerState === 'running' ? 'Deep work active' : 'Standard 25-min interval'}
        </p>
      </div>

      <div className="flex w-full gap-2 mt-auto">
        {pomodoroTimerState === 'running' ? (
          <button
            onClick={pauseGlobalPomodoro}
            className="flex-1 py-2.5 rounded-full bg-surface-alt hover:bg-surface-hover text-text-primary font-semibold text-[13px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <IconPlayerPause size={16} /> Pause
          </button>
        ) : (
          <button
            onClick={pomodoroTimerState === 'paused' ? resumeGlobalPomodoro : startGlobalPomodoro}
            className="flex-1 py-2.5 rounded-full bg-primary text-surface font-semibold text-[13px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
          >
            <IconPlayerPlay size={16} />{' '}
            {pomodoroTimerState === 'paused' ? 'Resume' : 'Start Focus'}
          </button>
        )}
        <button
          onClick={stopGlobalPomodoro}
          disabled={pomodoroTimerState === 'idle'}
          title="Reset Timer"
          className="flex items-center justify-center w-10 h-10 transition-colors rounded-full cursor-pointer bg-surface-alt hover:bg-surface-hover text-text-secondary disabled:opacity-30 shrink-0"
        >
          <IconRefresh size={16} />
        </button>
      </div>
    </Card>
  );
};
