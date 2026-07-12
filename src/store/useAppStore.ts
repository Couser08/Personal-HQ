import { create } from 'zustand';
import { type AppStore } from './types';
import { createCoreSlice } from './slices/coreSlice';
import { createJournalSlice } from './slices/journalSlice';
import { createMindmapSlice } from './slices/mindmapSlice';
import { createStudySlice } from './slices/studySlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createTodoSlice } from './slices/todoSlice';
import { createHabitSlice } from './slices/habitSlice';
import {
  createUtilitySlice,
  globalPomodoroTick,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart
} from './slices/utilitySlice';

export * from './types';

export const useAppStore = create<AppStore>()((...a) => ({
  ...createCoreSlice(...a),
  ...createJournalSlice(...a),
  ...createMindmapSlice(...a),
  ...createStudySlice(...a),
  ...createBudgetSlice(...a),
  ...createTodoSlice(...a),
  ...createHabitSlice(...a),
  ...createUtilitySlice(...a),
}));

if (typeof window !== 'undefined') {
  const syncTimer = () => {
    const state = useAppStore.getState();
    if (state.pomodoroTimerState === 'running' && globalPomodoroTick) {
      const elapsedMs = Date.now() - globalPomodoroStartTime;
      const elapsedSecs = Math.floor(elapsedMs / 1000);
      const secondsLeft = Math.max(0, globalPomodoroSecondsAtStart - elapsedSecs);
      
      if (secondsLeft <= 0) {
        globalPomodoroTick();
      } else {
        useAppStore.setState({ pomodoroSecondsLeft: secondsLeft });
      }
    }
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncTimer();
    }
  });
  window.addEventListener('focus', syncTimer);
}
