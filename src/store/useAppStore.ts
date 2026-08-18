import { create } from 'zustand';
import { type AppStore } from './types';
import { createCoreSlice } from './slices/coreSlice';
import { createJournalSlice } from './slices/journalSlice';
import { createMindmapSlice } from './slices/mindmapSlice';
import { createTodoSlice } from './slices/todoSlice';
import { createHabitSlice } from './slices/habitSlice';
import { createBooksSlice } from './slices/booksSlice';
import { createStudyExamSlice } from './slices/studyExamSlice';
import { createVisionSlice } from './slices/visionSlice';
import { createProjectStructureSlice } from './slices/projectStructureSlice';
import {
  createUtilitySlice,
  globalPomodoroTick,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  syncPomodoroFromStorage
} from './slices/utilitySlice';

export * from './types';


export const useAppStore = create<AppStore>()((...a) => ({
  ...createCoreSlice(...a),
  ...createJournalSlice(...a),
  ...createMindmapSlice(...a),
  ...createTodoSlice(...a),
  ...createHabitSlice(...a),
  ...createUtilitySlice(...a),
  ...createBooksSlice(...a),
  ...createStudyExamSlice(...a),
  ...createVisionSlice(...a),
  ...createProjectStructureSlice(...a),
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
  window.addEventListener('focus', () => {
    syncTimer();
  });

  // Listen for Pomodoro state changes in other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'focusflow_pomodoro_sync_state' && event.newValue) {
      try {
        const payload = JSON.parse(event.newValue);
        syncPomodoroFromStorage(payload, useAppStore.setState, useAppStore.getState);
      } catch (e) {
        console.error('Failed to sync Pomodoro from storage:', e);
      }
    }
  });
}

