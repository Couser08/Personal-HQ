import { supabase } from '../supabase';
import type { StudyMaterial, Exam, ExamAttempt } from '../../store/types';

export const studyMaterialService = {
  async fetchAll(userId: string, limit = 50): Promise<StudyMaterial[]> {
    const { data, error } = await supabase
      .from('study_materials')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      rawContent: r.raw_content,
      structuredData: r.structured_data,
      flashcards: r.flashcards || [],
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, material: StudyMaterial) {
    const { error } = await supabase.from('study_materials').insert({
      id: material.id,
      user_id: userId,
      title: material.title,
      raw_content: material.rawContent,
      structured_data: material.structuredData,
      flashcards: material.flashcards || [],
      created_at: material.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async update(userId: string, id: string, updates: Partial<StudyMaterial>) {
    const payload: any = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.structuredData !== undefined) payload.structured_data = updates.structuredData;
    if (updates.flashcards !== undefined) payload.flashcards = updates.flashcards;

    const { error } = await supabase
      .from('study_materials')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(userId: string, id: string) {
    const { error } = await supabase
      .from('study_materials')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
};

export const examService = {
  async fetchAll(userId: string, limit = 50): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      materialId: r.material_id,
      title: r.title,
      totalMarks: r.total_marks,
      specPrompt: r.spec_prompt,
      questions: r.questions,
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, exam: Exam) {
    const { error } = await supabase.from('exams').insert({
      id: exam.id,
      user_id: userId,
      material_id: exam.materialId,
      title: exam.title,
      total_marks: exam.totalMarks,
      spec_prompt: exam.specPrompt,
      questions: exam.questions,
      created_at: exam.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
};

export const examAttemptService = {
  async fetchAll(userId: string, limit = 50): Promise<ExamAttempt[]> {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return [];
      throw error;
    }
    return (data ?? []).map((r) => ({
      id: r.id,
      examId: r.exam_id,
      answers: r.answers,
      totalScore: r.total_score,
      feedback: r.feedback,
      weaknessSummary: r.weakness_summary,
      createdAt: r.created_at,
    }));
  },
  async create(userId: string, attempt: ExamAttempt) {
    const { error } = await supabase.from('exam_attempts').insert({
      id: attempt.id,
      user_id: userId,
      exam_id: attempt.examId,
      answers: attempt.answers,
      total_score: attempt.totalScore,
      feedback: attempt.feedback,
      weakness_summary: attempt.weaknessSummary,
      created_at: attempt.createdAt,
    });
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
  async delete(id: string) {
    const { error } = await supabase.from('exam_attempts').delete().eq('id', id);
    if (error) {
      if (error.code === '42P01' || error.message?.includes('relation')) return;
      throw error;
    }
  },
};
