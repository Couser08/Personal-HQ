import { create } from 'zustand';
import { type AppStore } from './types';
import { createCoreSlice } from './slices/coreSlice';
import { createJournalSlice } from './slices/journalSlice';
import { createMindmapSlice } from './slices/mindmapSlice';
import { createStudySlice } from './slices/studySlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createTodoSlice } from './slices/todoSlice';
import { createHabitSlice } from './slices/habitSlice';
import { createBooksSlice } from './slices/booksSlice';
import { createStudyExamSlice } from './slices/studyExamSlice';
import { useAuthStore } from './useAuthStore';
import {
  createUtilitySlice,
  globalPomodoroTick,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  syncPomodoroFromStorage
} from './slices/utilitySlice';

import { safeSetItem } from '../utils/storage';

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
  ...createBooksSlice(...a),
  ...createStudyExamSlice(...a),
}));

if (typeof window !== 'undefined') {
  let lastSyncTime = 0;
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

  const syncData = () => {
    const now = Date.now();
    if (now - lastSyncTime < 10000) return; // 10s throttle
    lastSyncTime = now;

    const state = useAppStore.getState();
    const user = useAuthStore.getState().user;
    if (user && state.loadAllData) {
      state.loadAllData(user.id).catch((e) => console.error('Failed to sync on visibility/focus:', e));
    }
  };

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncTimer();
      syncData();
    }
  });
  window.addEventListener('focus', () => {
    syncTimer();
    syncData();
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

  // Automatically persist state changes to localStorage
  useAppStore.subscribe((state) => {
    safeSetItem('phq_todo_projects', JSON.stringify(state.todoProjects));
    safeSetItem('phq_todo_tasks', JSON.stringify(state.todoTasks));
    safeSetItem('phq_journals', JSON.stringify(state.journals));
    safeSetItem('phq_mindmaps', JSON.stringify(state.mindmaps));
    safeSetItem('phq_habits', JSON.stringify(state.habits));
    safeSetItem('phq_sprints', JSON.stringify(state.sprints));
    safeSetItem('phq_dsa_problems', JSON.stringify(state.dsaProblems));
    safeSetItem('phq_til_logs', JSON.stringify(state.tilLogs));
    safeSetItem('phq_roadmaps', JSON.stringify(state.roadmaps));
    safeSetItem('phq_resources', JSON.stringify(state.resources));
    safeSetItem('phq_dev_goals', JSON.stringify(state.devGoals));
    safeSetItem('phq_journal_sticky_notes', JSON.stringify(state.journalStickyNotes));
    safeSetItem('phq_saved_links', JSON.stringify(state.savedLinks));
    safeSetItem('phq_app_tags', JSON.stringify(state.appTags));
    safeSetItem('phq_links', JSON.stringify(state.links));
    safeSetItem('phq_subjects', JSON.stringify(state.subjects));
    safeSetItem('phq_media_logs', JSON.stringify(state.mediaLogs));
    safeSetItem('phq_countdowns', JSON.stringify(state.countdowns));
    safeSetItem('phq_budget_categories', JSON.stringify(state.budgetCategories));
    safeSetItem('phq_budget_transactions', JSON.stringify(state.budgetTransactions));
  });
}
