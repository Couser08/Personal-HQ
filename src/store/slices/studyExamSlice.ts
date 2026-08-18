import { type StateCreator } from 'zustand';
import { type AppStore, type StudyMaterial, type Exam, type ExamAttempt } from '../types';
import { studyMaterialService, examService, examAttemptService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { queryClient } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';

export interface StudyExamSlice {
  studyMaterials: StudyMaterial[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  addStudyMaterial: (mat: StudyMaterial) => Promise<void>;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => Promise<void>;
  deleteStudyMaterial: (id: string) => Promise<void>;
  addExam: (exam: Exam) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addExamAttempt: (attempt: ExamAttempt) => Promise<void>;
  deleteExamAttempt: (id: string) => Promise<void>;
}

export const createStudyExamSlice: StateCreator<AppStore, [], [], StudyExamSlice> = (set, get) => ({
  studyMaterials: (() => {
    try {
      const raw = localStorage.getItem('phq_study_materials');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  exams: (() => {
    try {
      const raw = localStorage.getItem('phq_exams');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),
  examAttempts: (() => {
    try {
      const raw = localStorage.getItem('phq_exam_attempts');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })(),

  addStudyMaterial: async (mat) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().studyMaterials;
    const next = [mat, ...previous];
    set({ studyMaterials: next });
    try {
      await studyMaterialService.create(uid, mat);
      queryClient.invalidateQueries({ queryKey: queryKeys.study.materials(uid) });
    } catch (e: any) {
      set({ studyMaterials: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save material to cloud', 'error');
      throw e;
    }
  },

  updateStudyMaterial: async (id, updates) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().studyMaterials;
    const next = previous.map((m) => (m.id === id ? { ...m, ...updates } : m));
    set({ studyMaterials: next });
    try {
      await studyMaterialService.update(uid, id, updates);
      queryClient.invalidateQueries({ queryKey: queryKeys.study.materials(uid) });
    } catch (e: any) {
      set({ studyMaterials: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to update material', 'error');
      throw e;
    }
  },

  deleteStudyMaterial: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const prevMaterials = get().studyMaterials;
    const prevExams = get().exams;
    const nextMaterials = prevMaterials.filter((m) => m.id !== id);
    const nextExams = prevExams.filter((e) => e.materialId !== id);
    set({ studyMaterials: nextMaterials, exams: nextExams });
    try {
      if (uid) {
        await studyMaterialService.delete(uid, id);
        queryClient.invalidateQueries({ queryKey: queryKeys.study.materials(uid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.study.exams(uid) });
      }
    } catch (e: any) {
      set({ studyMaterials: prevMaterials, exams: prevExams });
      useToastStore.getState().addToast('Error', e.message || 'Failed to delete material', 'error');
      throw e;
    }
  },

  addExam: async (exam) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().exams;
    const next = [exam, ...previous];
    set({ exams: next });
    try {
      await examService.create(uid, exam);
      queryClient.invalidateQueries({ queryKey: queryKeys.study.exams(uid) });
    } catch (e: any) {
      set({ exams: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save exam', 'error');
      throw e;
    }
  },

  deleteExam: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const prevExams = get().exams;
    const prevAttempts = get().examAttempts;
    const nextExams = prevExams.filter((e) => e.id !== id);
    const nextAttempts = prevAttempts.filter((a) => a.examId !== id);
    set({ exams: nextExams, examAttempts: nextAttempts });
    try {
      await examService.delete(id);
      if (uid) {
        queryClient.invalidateQueries({ queryKey: queryKeys.study.exams(uid) });
        queryClient.invalidateQueries({ queryKey: queryKeys.study.attempts(uid) });
      }
    } catch (e: any) {
      set({ exams: prevExams, examAttempts: prevAttempts });
      useToastStore.getState().addToast('Error', e.message || 'Failed to delete exam', 'error');
      throw e;
    }
  },

  addExamAttempt: async (attempt) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().examAttempts;
    const next = [attempt, ...previous];
    set({ examAttempts: next });
    try {
      await examAttemptService.create(uid, attempt);
      queryClient.invalidateQueries({ queryKey: queryKeys.study.attempts(uid) });
    } catch (e: any) {
      set({ examAttempts: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save exam attempt', 'error');
      throw e;
    }
  },

  deleteExamAttempt: async (id) => {
    const uid = useAuthStore.getState().user?.id;
    const prevAttempts = get().examAttempts;
    const nextAttempts = prevAttempts.filter((a) => a.id !== id);
    set({ examAttempts: nextAttempts });
    try {
      await examAttemptService.delete(id);
      if (uid) queryClient.invalidateQueries({ queryKey: queryKeys.study.attempts(uid) });
    } catch (e: any) {
      set({ examAttempts: prevAttempts });
      useToastStore.getState().addToast('Error', e.message || 'Failed to delete exam attempt', 'error');
      throw e;
    }
  },
});


