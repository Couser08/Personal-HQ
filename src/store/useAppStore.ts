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
  ...createTodoSlice(...a),
  ...createHabitSlice(...a),
  ...createUtilitySlice(...a),
  ...createBooksSlice(...a),
  ...createStudyExamSlice(...a),
  ...createVisionSlice(...a),
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
    if (now - lastSyncTime < 2 * 60 * 1000) return; // 2-minute throttle prevents aggressive 28-table network thrashing
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

  // Automatically persist state changes to localStorage only when slice references change
  let prevState: any = {};
  useAppStore.subscribe((state) => {
    if (state.todoProjects !== prevState.todoProjects) safeSetItem('phq_todo_projects', JSON.stringify(state.todoProjects));
    if (state.todoTasks !== prevState.todoTasks) safeSetItem('phq_todo_tasks', JSON.stringify(state.todoTasks));
    if (state.journals !== prevState.journals) safeSetItem('phq_journals', JSON.stringify(state.journals));
    if (state.mindmaps !== prevState.mindmaps) safeSetItem('phq_mindmaps', JSON.stringify(state.mindmaps));
    if (state.habits !== prevState.habits) safeSetItem('phq_habits', JSON.stringify(state.habits));
    if (state.sprints !== prevState.sprints) safeSetItem('phq_sprints', JSON.stringify(state.sprints));
    if (state.dsaProblems !== prevState.dsaProblems) safeSetItem('phq_dsa_problems', JSON.stringify(state.dsaProblems));
    if (state.tilLogs !== prevState.tilLogs) safeSetItem('phq_til_logs', JSON.stringify(state.tilLogs));
    if (state.roadmaps !== prevState.roadmaps) safeSetItem('phq_roadmaps', JSON.stringify(state.roadmaps));
    if (state.resources !== prevState.resources) safeSetItem('phq_resources', JSON.stringify(state.resources));
    if (state.devGoals !== prevState.devGoals) safeSetItem('phq_dev_goals', JSON.stringify(state.devGoals));
    if (state.journalStickyNotes !== prevState.journalStickyNotes) safeSetItem('phq_journal_sticky_notes', JSON.stringify(state.journalStickyNotes));
    if (state.savedLinks !== prevState.savedLinks) safeSetItem('phq_saved_links', JSON.stringify(state.savedLinks));
    if (state.appTags !== prevState.appTags) safeSetItem('phq_app_tags', JSON.stringify(state.appTags));
    if (state.links !== prevState.links) safeSetItem('phq_links', JSON.stringify(state.links));
    if (state.mediaLogs !== prevState.mediaLogs) safeSetItem('phq_media_logs', JSON.stringify(state.mediaLogs));
    if (state.countdowns !== prevState.countdowns) safeSetItem('phq_countdowns', JSON.stringify(state.countdowns));
    if (state.visions !== prevState.visions) safeSetItem('phq_visions', JSON.stringify(state.visions));
    if (state.exams !== prevState.exams) safeSetItem('phq_exams', JSON.stringify(state.exams));
    if (state.examAttempts !== prevState.examAttempts) safeSetItem('phq_exam_attempts', JSON.stringify(state.examAttempts));
    if (state.studyMaterials !== prevState.studyMaterials) safeSetItem('phq_study_materials', JSON.stringify(state.studyMaterials));
    if (state.dailyReflections !== prevState.dailyReflections) safeSetItem('phq_daily_reflections', JSON.stringify(state.dailyReflections));
    
    prevState = state;
  });
}
