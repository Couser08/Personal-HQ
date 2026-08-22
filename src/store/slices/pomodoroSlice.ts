import { type StateCreator } from 'zustand';
import type { AppStore, PomodoroStats } from '../types';
import { useToastStore } from '../useToastStore';
import {
  notifyPomodoroCompletion,
  requestPomodoroNotificationPermission,
  showPomodoroDesktopNotification,
  type PomodoroCompletionNotification,
} from '../../utils/pomodoroNotifications';
import {
  globalPomodoroInterval,
  globalPomodoroWorker,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  globalPomodoroTick,
  setGlobalPomodoroStartTime,
  setGlobalPomodoroSecondsAtStart,
  setGlobalPomodoroTick,
  startTimer,
  stopTimer,
  syncPomodoroStateToLocalStorage,
  syncPomodoroFromStorage,
  handlePomodoroSessionCompleted,
} from './pomodoroEngine';

export {
  globalPomodoroInterval,
  globalPomodoroWorker,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  globalPomodoroTick,
  syncPomodoroFromStorage,
};

export interface PomodoroSlice {
  pomodoroStats: PomodoroStats;
  recordPomodoroSession: (minutes: number) => void;
  pomodoroSecondsLeft: number;
  pomodoroTotalSeconds: number;
  pomodoroTimerState: 'idle' | 'running' | 'paused';
  pomodoroSessionId: 'focus' | 'short-break' | 'long-break';
  pomodoroStreak: number;
  pomodoroAssociatedTaskId: string | null;
  pomodoroPipWindow: Window | null;
  pomodoroPipEnabled: boolean;
  setPomodoroSecondsLeft: (secs: number) => void;
  setPomodoroTotalSeconds: (secs: number) => void;
  setPomodoroTimerState: (state: 'idle' | 'running' | 'paused') => void;
  setPomodoroSessionId: (id: 'focus' | 'short-break' | 'long-break') => void;
  setPomodoroStreak: (streak: number) => void;
  setPomodoroAssociatedTaskId: (id: string | null) => void;
  setPomodoroPipWindow: (win: Window | null) => void;
  setPomodoroPipEnabled: (enabled: boolean) => void;
  startGlobalPomodoro: () => void;
  pauseGlobalPomodoro: () => void;
  resumeGlobalPomodoro: () => void;
  stopGlobalPomodoro: () => void;
  skipGlobalPomodoro: () => void;
}

export const createPomodoroSlice: StateCreator<AppStore, [], [], PomodoroSlice> = (set, get) => {
  let initialSecondsLeft = 25 * 60;
  let initialTotalSeconds = 25 * 60;
  let initialTimerState: 'idle' | 'running' | 'paused' = 'idle';
  let initialSessionId: 'focus' | 'short-break' | 'long-break' = 'focus';
  let initialStreak = 0;
  let initialAssociatedTaskId: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('focusflow_pomodoro_sync_state');
      if (raw) {
        const payload = JSON.parse(raw);
        initialSecondsLeft = payload.pomodoroSecondsLeft;
        initialTotalSeconds = payload.pomodoroTotalSeconds;
        initialTimerState = payload.pomodoroTimerState;
        initialSessionId = payload.pomodoroSessionId;
        initialStreak = payload.pomodoroStreak;
        initialAssociatedTaskId = payload.pomodoroAssociatedTaskId;

        if (initialTimerState === 'running') {
          setGlobalPomodoroStartTime(payload.globalPomodoroStartTime);
          setGlobalPomodoroSecondsAtStart(payload.globalPomodoroSecondsAtStart);
          const elapsed = Math.floor((Date.now() - payload.globalPomodoroStartTime) / 1000);
          initialSecondsLeft = Math.max(0, payload.globalPomodoroSecondsAtStart - elapsed);
        }
      }
    } catch (e) {
      console.error('Failed to restore initial pomodoro state:', e);
    }
  }

  if (typeof window !== 'undefined' && initialTimerState === 'running' && initialSecondsLeft > 0) {
    setTimeout(() => {
      const raw = localStorage.getItem('focusflow_pomodoro_sync_state');
      if (raw) {
        try {
          const payload = JSON.parse(raw);
          syncPomodoroFromStorage(payload, set, get);
        } catch {}
      }
    }, 150);
  }

  return {
    pomodoroStats: { totalSessions: 0, totalMinutes: 0 },
    pomodoroSecondsLeft: initialSecondsLeft,
    pomodoroTotalSeconds: initialTotalSeconds,
    pomodoroTimerState: initialTimerState,
    pomodoroSessionId: initialSessionId,
    pomodoroStreak: initialStreak,
    pomodoroAssociatedTaskId: initialAssociatedTaskId,
    pomodoroPipWindow: null,
    pomodoroPipEnabled: false,

    setPomodoroSecondsLeft: (secs) => {
      set({ pomodoroSecondsLeft: secs });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroTotalSeconds: (secs) => {
      set({ pomodoroTotalSeconds: secs });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroTimerState: (state) => {
      set({ pomodoroTimerState: state });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroSessionId: (id) => {
      set({ pomodoroSessionId: id });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroStreak: (streak) => {
      set({ pomodoroStreak: streak });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroAssociatedTaskId: (id) => {
      set({ pomodoroAssociatedTaskId: id });
      syncPomodoroStateToLocalStorage(get());
    },
    setPomodoroPipWindow: (win) => set({ pomodoroPipWindow: win }),
    setPomodoroPipEnabled: (enabled) => set({ pomodoroPipEnabled: enabled }),

    recordPomodoroSession: (minutes) =>
      set((state) => ({
        pomodoroStats: {
          totalSessions: (state.pomodoroStats?.totalSessions || 0) + 1,
          totalMinutes: (state.pomodoroStats?.totalMinutes || 0) + minutes,
          completedSessions:
            ((state.pomodoroStats as any)?.completedSessions ||
              state.pomodoroStats?.totalSessions ||
              0) + 1,
        },
      })),

    startGlobalPomodoro: () => {
      stopTimer();
      set({ pomodoroTimerState: 'running' });

      void requestPomodoroNotificationPermission();

      setGlobalPomodoroStartTime(Date.now());
      setGlobalPomodoroSecondsAtStart(get().pomodoroSecondsLeft);

      const tick = () => {
        const elapsedMs = Date.now() - globalPomodoroStartTime;
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);

        if (secondsLeft <= 0) {
          stopTimer();
          setGlobalPomodoroTick(null);
          set({ pomodoroTimerState: 'idle', pomodoroSecondsLeft: 0 });

          handlePomodoroSessionCompleted(set, get);
        } else {
          set({ pomodoroSecondsLeft: secondsLeft });
        }
      };

      setGlobalPomodoroTick(tick);
      startTimer(tick);
      syncPomodoroStateToLocalStorage(get());
    },

    pauseGlobalPomodoro: () => {
      stopTimer();
      setGlobalPomodoroTick(null);
      set({ pomodoroTimerState: 'paused' });
      syncPomodoroStateToLocalStorage(get());
    },

    resumeGlobalPomodoro: () => {
      get().startGlobalPomodoro();
    },

    stopGlobalPomodoro: () => {
      stopTimer();
      setGlobalPomodoroTick(null);
      const { pomodoroTotalSeconds, pomodoroPipWindow } = get();
      set({
        pomodoroTimerState: 'idle',
        pomodoroSecondsLeft: pomodoroTotalSeconds,
      });
      if (pomodoroPipWindow) {
        pomodoroPipWindow.close();
        set({ pomodoroPipWindow: null });
      }
      syncPomodoroStateToLocalStorage(get());
    },

    skipGlobalPomodoro: () => {
      stopTimer();
      setGlobalPomodoroTick(null);

      const {
        pomodoroSessionId,
        pomodoroSecondsLeft,
        pomodoroTotalSeconds,
        pomodoroStreak,
        pomodoroAssociatedTaskId,
        todoTasks,
        updateTodoTask,
        recordPomodoroSession,
        pomodoroPipWindow,
      } = get();

      const addToast = useToastStore.getState().addToast;
      let completionNotification: PomodoroCompletionNotification;

      if (pomodoroSessionId === 'focus') {
        if (pomodoroSecondsLeft < 120) {
          const nextStreak = pomodoroStreak + 1;
          set({ pomodoroStreak: nextStreak });
          recordPomodoroSession(Math.round(pomodoroTotalSeconds / 60));

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('trigger-wavy-effect', { detail: { type: 'pomodoro' } }),
            );
          }

          if (pomodoroAssociatedTaskId) {
            if (pomodoroAssociatedTaskId.startsWith('habit-')) {
              const habitId = pomodoroAssociatedTaskId.replace('habit-', '');
              const matchedHabit = get().habits.find((h) => h.id === habitId);
              if (matchedHabit) {
                const todayStr = new Date().toISOString().split('T')[0];
                get().toggleHabitCompletion(habitId, todayStr);
                addToast(
                  '🔥 Habit Completed',
                  `Completed Pomodoro session for "${matchedHabit.name}"`,
                  'success',
                );
              }
            } else {
              const matchedTask = todoTasks.find((t) => t.id === pomodoroAssociatedTaskId);
              if (matchedTask) {
                updateTodoTask(pomodoroAssociatedTaskId, {
                  pomodoroCount: (matchedTask.pomodoroCount || 0) + 1,
                });
                addToast(
                  '🍅 Session Logged (Skipped < 2m left)',
                  `Logged focus session to "${matchedTask.title}"`,
                  'success',
                );
              }
            }
          } else {
            addToast(
              '🎉 Focus Complete! (Skipped < 2m left)',
              'Great work! Time for a break.',
              'success',
            );
          }

          completionNotification = {
            id: crypto.randomUUID(),
            sessionId: pomodoroSessionId,
            title: 'Focus Complete',
            subtitle: 'Great work. Break starts now.',
            icon: 'confetti',
            variant: 'success',
            timestamp: Date.now(),
          };

          const nextSid = nextStreak % 4 === 0 ? 'long-break' : 'short-break';
          const breakMins = nextSid === 'short-break' ? 5 : 15;
          set({
            pomodoroTimerState: 'idle',
            pomodoroSessionId: nextSid,
            pomodoroSecondsLeft: breakMins * 60,
            pomodoroTotalSeconds: breakMins * 60,
          });

          notifyPomodoroCompletion(completionNotification);
          showPomodoroDesktopNotification(completionNotification);
        } else {
          addToast('Focus Skipped', 'Skipped focus session.', 'info');
          const nextStreak = pomodoroStreak;
          const nextSid = (nextStreak + 1) % 4 === 0 ? 'long-break' : 'short-break';
          const breakMins = nextSid === 'short-break' ? 5 : 15;
          set({
            pomodoroTimerState: 'idle',
            pomodoroSessionId: nextSid,
            pomodoroSecondsLeft: breakMins * 60,
            pomodoroTotalSeconds: breakMins * 60,
          });
        }
      } else {
        addToast('⏰ Break Over!', 'Ready to focus again? 🚀', 'info');

        completionNotification = {
          id: crypto.randomUUID(),
          sessionId: pomodoroSessionId,
          title: 'Break Complete',
          subtitle: 'Ready to focus again?',
          icon: 'award',
          variant: 'achievement',
          timestamp: Date.now(),
        };

        set({
          pomodoroTimerState: 'idle',
          pomodoroSessionId: 'focus',
          pomodoroSecondsLeft: 25 * 60,
          pomodoroTotalSeconds: 25 * 60,
        });

        notifyPomodoroCompletion(completionNotification);
        showPomodoroDesktopNotification(completionNotification);
      }

      if (pomodoroPipWindow) {
        pomodoroPipWindow.close();
        set({ pomodoroPipWindow: null });
      }
      syncPomodoroStateToLocalStorage(get());
    },
  };
};
