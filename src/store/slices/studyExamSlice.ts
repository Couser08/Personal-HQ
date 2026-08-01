import { type StateCreator } from 'zustand';
import { type AppStore, type StudyMaterial, type Exam, type ExamAttempt } from '../types';
import { studyMaterialService, examService, examAttemptService } from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';

export interface StudyExamSlice {
  studyMaterials: StudyMaterial[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  addStudyMaterial: (mat: StudyMaterial) => Promise<void>;
  deleteStudyMaterial: (id: string) => Promise<void>;
  addExam: (exam: Exam) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  addExamAttempt: (attempt: ExamAttempt) => Promise<void>;
  deleteExamAttempt: (id: string) => Promise<void>;
}

export const createStudyExamSlice: StateCreator<AppStore, [], [], StudyExamSlice> = (set, get) => ({
  studyMaterials: [],
  exams: [],
  examAttempts: [],

  addStudyMaterial: async (mat) => {
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().studyMaterials;
    const next = [mat, ...previous];
    set({ studyMaterials: next });
    try {
      await studyMaterialService.create(uid, mat);
    } catch (e: any) {
      set({ studyMaterials: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save material to cloud', 'error');
      throw e;
    }
  },

  deleteStudyMaterial: async (id) => {
    const prevMaterials = get().studyMaterials;
    const prevExams = get().exams;
    const nextMaterials = prevMaterials.filter((m) => m.id !== id);
    const nextExams = prevExams.filter((e) => e.materialId !== id);
    set({ studyMaterials: nextMaterials, exams: nextExams });
    try {
      await studyMaterialService.delete(id);
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
    } catch (e: any) {
      set({ exams: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save exam', 'error');
      throw e;
    }
  },

  deleteExam: async (id) => {
    const prevExams = get().exams;
    const prevAttempts = get().examAttempts;
    const nextExams = prevExams.filter((e) => e.id !== id);
    const nextAttempts = prevAttempts.filter((a) => a.examId !== id);
    set({ exams: nextExams, examAttempts: nextAttempts });
    try {
      await examService.delete(id);
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
    } catch (e: any) {
      set({ examAttempts: previous });
      useToastStore.getState().addToast('Error', e.message || 'Failed to save exam attempt', 'error');
      throw e;
    }
  },

  deleteExamAttempt: async (id) => {
    const prevAttempts = get().examAttempts;
    const nextAttempts = prevAttempts.filter((a) => a.id !== id);
    set({ examAttempts: nextAttempts });
    try {
      await examAttemptService.delete(id);
    } catch (e: any) {
      set({ examAttempts: prevAttempts });
      useToastStore.getState().addToast('Error', e.message || 'Failed to delete exam attempt', 'error');
      throw e;
    }
  },
});
