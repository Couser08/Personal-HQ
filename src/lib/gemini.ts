import type { AiSuggestion } from '../store/types';
import { runAgentTurn, buildCompressedWorkspaceContext, type AgentStepUpdate, type AgentTurnResult, type AgentMessageHistory } from './gemini-agent';
import { recordAiRequest, checkRateLimit, type AiUsageStats, type RateLimitStatus } from './ai-usage-tracker';
import { supabase } from './supabase';

export {
  runAgentTurn,
  buildCompressedWorkspaceContext,
  recordAiRequest,
  checkRateLimit,
};
export type { AgentStepUpdate, AgentTurnResult, AgentMessageHistory, AiUsageStats, RateLimitStatus };

export interface GeminiSubTask { title: string; }
export interface GeminiTaskResult { title: string; priority: 'low' | 'medium' | 'high' | 'none'; tags: string[]; dueDate?: string | null; startTime?: string | null; endTime?: string | null; subtasks: GeminiSubTask[]; }
export interface GeminiMarkdownResult { title: string; content: string; }
export interface GeminiJournalResult { title: string; content: string; mood: 'great' | 'good' | 'meh' | 'bad' | 'terrible'; tags: string[]; whatWentWell: string; whatCanBeBetter: string; }
export interface GeminiHabitResult { _thinking?: string; name: string; description?: string; category: 'health' | 'learning' | 'productivity' | 'mindfulness'; frequencyType?: 'daily' | 'weekly_days' | 'weekly_count'; frequencyDays?: number[]; frequencyCount?: number; targetDaysPerWeek: number; }
export interface StructuredReplyBlock { type: 'heading' | 'paragraph' | 'bullets' | 'steps' | 'callout'; text?: string; items?: string[]; variant?: 'tip' | 'note' | 'warning'; }
export interface StructuredAiReply { replyText: string; blocks: StructuredReplyBlock[]; }

export type AiIntent = 'ASK_CLARIFICATION' | 'CREATE_TODO_TASK' | 'BREAKDOWN_TASK' | 'CREATE_MARKDOWN_DOC' | 'CREATE_HABIT_ROUTINE' | 'MULTI_STEP_GOAL' | 'GENERAL_CHAT';

export interface AiClassifyResult { intent: AiIntent; replyText?: string; blocks?: StructuredReplyBlock[]; taskData?: GeminiTaskResult; targetTaskTitle?: string; markdownData?: GeminiMarkdownResult; habitData?: GeminiHabitResult; multiStepPlan?: any; }

const DEFAULT_MODEL = 'gemini-3.7-flash';

export async function testGeminiApiKey(
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  try {
    const payload = { contents: [{ role: 'user', parts: [{ text: 'Respond with OK if connected.' }] }] };
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { model, action: 'generateContent', payload },
      headers: { 'x-gemini-key': apiKey.trim() }
    });

    if (error) return { success: false, message: error.message };
    if (data?.error) return { success: false, message: data.error.message };

    recordAiRequest(20, 10);
    return { success: true, message: 'Gemini API Key validated successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network request failed' };
  }
}

export function generateRealAppContextSuggestions(
  todoTasks: any[] = [],
  habits: any[] = [],
  _journals: any[] = []
): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const pendingTasks = todoTasks.filter((t) => !t.completed && !t.deleted);
  const todayStr = new Date().toISOString().split('T')[0];
  const dueHabits = habits.filter((h) => !h.completedDates?.includes(todayStr));

  if (pendingTasks.length > 0) {
    const topTask = pendingTasks[0];
    suggestions.push({
      id: 'sug_task_breakdown',
      title: `Break down "${topTask.title}"`,
      description: `Split into actionable sub-steps`,
      contextTag: 'Current Tasks',
      reason: `You have ${pendingTasks.length} pending task(s)`,
      actionLabel: 'Break into subtasks',
      actionType: 'prioritize',
      targetData: topTask,
    });
  }

  if (dueHabits.length > 0) {
    suggestions.push({
      id: 'sug_habit_check',
      title: `Track ${dueHabits.length} pending habits`,
      description: 'Keep your streak alive today',
      contextTag: 'Goal Progress',
      reason: `${dueHabits.length} habit(s) awaiting completion today`,
      actionLabel: 'Focus on habits',
      actionType: 'schedule',
    });
  }

  suggestions.push({
    id: 'sug_daily_plan',
    title: 'Create a Structured Daily Plan',
    description: 'Organize tasks, study goals & habits into a workflow',
    contextTag: 'Planner',
    reason: 'Review tasks and plan your day',
    actionLabel: 'Plan my day',
    actionType: 'create_plan',
  });

  return suggestions;
}
