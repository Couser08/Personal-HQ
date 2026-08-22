import { useToastStore } from '../useToastStore';
import {
  notifyPomodoroCompletion,
  showPomodoroDesktopNotification,
  type PomodoroCompletionNotification,
} from '../../utils/pomodoroNotifications';

export let globalPomodoroInterval: any = null;
export let globalPomodoroWorker: Worker | null = null;
export let globalPomodoroStartTime: number = 0;
export let globalPomodoroSecondsAtStart: number = 0;
export let globalPomodoroTick: (() => void) | null = null;

export const setGlobalPomodoroStartTime = (time: number) => {
  globalPomodoroStartTime = time;
};

export const setGlobalPomodoroSecondsAtStart = (secs: number) => {
  globalPomodoroSecondsAtStart = secs;
};

export const setGlobalPomodoroTick = (tick: (() => void) | null) => {
  globalPomodoroTick = tick;
};

export const startTimer = (tickFn: () => void) => {
  try {
    if (!globalPomodoroWorker) {
      const workerCode = `
        let intervalId = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (intervalId) clearInterval(intervalId);
            intervalId = setInterval(() => {
              self.postMessage('tick');
            }, 1000);
          } else if (e.data === 'stop') {
            if (intervalId) {
              clearInterval(intervalId);
              intervalId = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      globalPomodoroWorker = new Worker(URL.createObjectURL(blob));
    }
    globalPomodoroWorker.onmessage = () => {
      tickFn();
    };
    globalPomodoroWorker.postMessage('start');
  } catch (e) {
    console.warn('Web Worker not supported or failed to load, falling back to setInterval', e);
    if (globalPomodoroInterval) clearInterval(globalPomodoroInterval);
    globalPomodoroInterval = setInterval(tickFn, 1000);
  }
};

export const stopTimer = () => {
  if (globalPomodoroWorker) {
    globalPomodoroWorker.postMessage('stop');
  }
  if (globalPomodoroInterval) {
    clearInterval(globalPomodoroInterval);
    globalPomodoroInterval = null;
  }
};

export const syncPomodoroStateToLocalStorage = (state: any) => {
  if (typeof window === 'undefined') return;
  const payload = {
    pomodoroSecondsLeft: state.pomodoroSecondsLeft,
    pomodoroTotalSeconds: state.pomodoroTotalSeconds,
    pomodoroTimerState: state.pomodoroTimerState,
    pomodoroSessionId: state.pomodoroSessionId,
    pomodoroStreak: state.pomodoroStreak,
    pomodoroAssociatedTaskId: state.pomodoroAssociatedTaskId,
    globalPomodoroStartTime,
    globalPomodoroSecondsAtStart,
    timestamp: Date.now(),
  };
  localStorage.setItem('focusflow_pomodoro_sync_state', JSON.stringify(payload));
};

export const handlePomodoroSessionCompleted = (
  set: any,
  get: any,
) => {
  const {
    pomodoroSessionId,
    pomodoroStreak,
    pomodoroAssociatedTaskId,
    todoTasks,
    updateTodoTask,
    recordPomodoroSession,
    pomodoroTotalSeconds,
  } = get();

  const addToast = useToastStore.getState().addToast;
  let completionNotification: PomodoroCompletionNotification;

  if (pomodoroSessionId === 'focus') {
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
        const matchedHabit = (get().habits as any[]).find((h: any) => h.id === habitId);
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
        const matchedTask = (todoTasks as any[]).find(
          (t: any) => t.id === pomodoroAssociatedTaskId,
        );
        if (matchedTask) {
          updateTodoTask(pomodoroAssociatedTaskId, {
            pomodoroCount: (matchedTask.pomodoroCount || 0) + 1,
          });
          addToast(
            '🍅 Session Logged',
            `Logged focus session to "${matchedTask.title}"`,
            'success',
          );
        }
      }
    } else {
      addToast('🎉 Focus Complete!', 'Great work! Time for a break.', 'success');
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
      pomodoroSessionId: nextSid,
      pomodoroSecondsLeft: breakMins * 60,
      pomodoroTotalSeconds: breakMins * 60,
    });
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
      pomodoroSessionId: 'focus',
      pomodoroSecondsLeft: 25 * 60,
      pomodoroTotalSeconds: 25 * 60,
    });
  }

  notifyPomodoroCompletion(completionNotification);
  showPomodoroDesktopNotification(completionNotification);
};

export const syncPomodoroFromStorage = (payload: any, set: any, get: any) => {
  if (typeof window === 'undefined') return;

  globalPomodoroStartTime = payload.globalPomodoroStartTime;
  globalPomodoroSecondsAtStart = payload.globalPomodoroSecondsAtStart;

  set({
    pomodoroSecondsLeft: payload.pomodoroSecondsLeft,
    pomodoroTotalSeconds: payload.pomodoroTotalSeconds,
    pomodoroTimerState: payload.pomodoroTimerState,
    pomodoroSessionId: payload.pomodoroSessionId,
    pomodoroStreak: payload.pomodoroStreak,
    pomodoroAssociatedTaskId: payload.pomodoroAssociatedTaskId,
  });

  if (payload.pomodoroTimerState === 'running') {
    stopTimer();

    const tick = () => {
      const elapsedMs = Date.now() - globalPomodoroStartTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);

      if (secondsLeft <= 0) {
        stopTimer();
        globalPomodoroTick = null;
        set({ pomodoroTimerState: 'idle', pomodoroSecondsLeft: 0 });

        handlePomodoroSessionCompleted(set, get);

        const nextState = get();
        const nextPayload = {
          pomodoroSecondsLeft: nextState.pomodoroSecondsLeft,
          pomodoroTotalSeconds: nextState.pomodoroTotalSeconds,
          pomodoroTimerState: nextState.pomodoroTimerState,
          pomodoroSessionId: nextState.pomodoroSessionId,
          pomodoroStreak: nextState.pomodoroStreak,
          pomodoroAssociatedTaskId: nextState.pomodoroAssociatedTaskId,
          globalPomodoroStartTime: 0,
          globalPomodoroSecondsAtStart: nextState.pomodoroSecondsLeft,
          timestamp: Date.now(),
        };
        localStorage.setItem('focusflow_pomodoro_sync_state', JSON.stringify(nextPayload));
      } else {
        set({ pomodoroSecondsLeft: secondsLeft });
      }
    };

    globalPomodoroTick = tick;
    startTimer(tick);
  } else {
    stopTimer();
    globalPomodoroTick = null;
  }
};
