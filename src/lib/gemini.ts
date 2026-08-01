import type { AiSuggestion } from '../store/types';

export interface GeminiSubTask {
  title: string;
}

export interface GeminiTaskResult {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'none';
  tags: string[];
  dueDate?: string | null;
  subtasks: GeminiSubTask[];
}

export interface GeminiMarkdownResult {
  title: string;
  content: string;
}

export interface GeminiJournalResult {
  title: string;
  content: string;
  mood: 'great' | 'good' | 'meh' | 'bad' | 'terrible';
  tags: string[];
  whatWentWell: string;
  whatCanBeBetter: string;
}

export interface GeminiHabitResult {
  _thinking?: string;
  name: string;
  description?: string;
  category: 'health' | 'learning' | 'productivity' | 'mindfulness';
  frequencyType?: 'daily' | 'weekly_days' | 'weekly_count';
  frequencyDays?: number[];
  frequencyCount?: number;
  targetDaysPerWeek: number;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

/**
 * Helper to detect if user prompt implies a multi-step workflow
 */
export function isMultiStepIntent(userPrompt: string): boolean {
  const p = userPrompt.toLowerCase();
  const keywords = ['and', 'also', 'subtask', 'subtasks', 'plan', '.md', 'file', 'habit', 'routine', 'checklist', 'breakdown', 'workflow', 'study for', 'roadmap', 'schedule'];
  let matchCount = 0;
  keywords.forEach(kw => {
    if (p.includes(kw)) matchCount++;
  });
  return matchCount >= 2 || p.includes('and create') || p.includes('and make') || p.includes('and write') || p.includes('break into') || p.includes('subtasks');
}

/**
 * Validates Gemini API Key with a lightweight ping request.
 */
export async function testGeminiApiKey(apiKey: string, model: string = DEFAULT_MODEL): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Respond with OK if connected.' }]
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      return { success: false, message: errMsg };
    }

    return { success: true, message: 'Gemini API Key validated successfully!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Network request failed' };
  }
}

/**
 * Helper to strip JSON markdown wrappers if returned by AI
 */
function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Generates a structured To-Do task with subtasks from user prompt
 */
export async function generateAiTaskWithSubtasks(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<GeminiTaskResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required. Please set your API Key in Settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a high-productivity AI task breakdown engine.
Your job is to analyze the user's prompt and break it down into a main task title, priority, tags, and actionable subtasks.
Respond ONLY with valid JSON matching this exact structure:
{
  "title": "Clear actionable main task title",
  "priority": "low" | "medium" | "high" | "none",
  "tags": ["tag1", "tag2"],
  "subtasks": [
    { "title": "Subtask step 1" },
    { "title": "Subtask step 2" }
  ]
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Request: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawContent) {
    throw new Error('Received empty response from Gemini API.');
  }

  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as GeminiTaskResult;

  return {
    title: parsed.title || userPrompt,
    priority: ['low', 'medium', 'high', 'none'].includes(parsed.priority) ? parsed.priority : 'medium',
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['ai-generated'],
    subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks.filter(s => s && s.title) : []
  };
}

/**
 * Generates a full formatted Markdown document from user prompt
 */
export async function generateAiMarkdownDoc(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<GeminiMarkdownResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required. Please set your API Key in Settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are an expert Markdown document creator.
Your job is to draft clean, beautifully structured Markdown text based on the user's prompt.
Include proper headings (#, ##), bullet points (-), checklists (- [ ]), callouts (> [!NOTE] or > [!TIP] or > [!WARNING]), and code/tables if relevant.
Respond ONLY with valid JSON in this exact structure:
{
  "title": "Document Title",
  "content": "Full markdown string with line breaks escaped appropriately"
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Request: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawContent) {
    throw new Error('Received empty response from Gemini API.');
  }

  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as GeminiMarkdownResult;

  return {
    title: parsed.title || 'AI Document',
    content: parsed.content || rawContent
  };
}

/**
 * Generates a Journal entry with mood and reflections
 */
export async function generateAiJournalEntry(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<GeminiJournalResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a thoughtful personal journal writing assistant.
Draft a personal journal entry based on the user prompt.
Respond ONLY with JSON in this exact structure:
{
  "title": "Journal Entry Title",
  "content": "Reflective journal content paragraph...",
  "mood": "great" | "good" | "meh" | "bad" | "terrible",
  "tags": ["journal", "reflection"],
  "whatWentWell": "Highlights and wins from today",
  "whatCanBeBetter": "Areas for future improvement"
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as GeminiJournalResult;

  return {
    title: parsed.title || 'Daily Reflection',
    content: parsed.content || userPrompt,
    mood: ['great', 'good', 'meh', 'bad', 'terrible'].includes(parsed.mood) ? parsed.mood : 'good',
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['journal', 'ai'],
    whatWentWell: parsed.whatWentWell || '',
    whatCanBeBetter: parsed.whatCanBeBetter || ''
  };
}

/**
 * Generates a Habit Routine
 */
export async function generateAiHabit(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<GeminiHabitResult> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a habit tracking habit coach.
Analyze the prompt and create a clear actionable habit.
Respond ONLY with JSON:
{
  "name": "Habit Name (e.g. Read 15 pages of a book)",
  "category": "health" | "learning" | "productivity" | "mindfulness",
  "targetDaysPerWeek": 1-7
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Prompt: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as GeminiHabitResult;

  return {
    name: parsed.name || userPrompt,
    category: ['health', 'learning', 'productivity', 'mindfulness'].includes(parsed.category) ? parsed.category : 'productivity',
    targetDaysPerWeek: typeof parsed.targetDaysPerWeek === 'number' ? Math.min(7, Math.max(1, parsed.targetDaysPerWeek)) : 7
  };
}

/**
 * General conversational or creative response from Gemini
 */
export async function generateAiGeneralResponse(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required. Please set your API Key in Settings.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are Antigravity Mini AI, a helpful, intelligent productivity assistant inside Personal HQ app.
Provide concise, helpful, and beautifully formatted responses. Use markdown when appropriate.`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Request: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
}

export interface AiClarificationQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface AiMultiStepPlanOutput {
  taskTitle: string;
  priority: 'low' | 'medium' | 'high' | 'none';
  tags: string[];
  subtasks: { title: string }[];
  markdownTitle: string;
  markdownContent: string;
  habitName: string;
  habitCategory: 'health' | 'learning' | 'productivity' | 'mindfulness';
  targetDaysPerWeek: number;
}

/**
 * Generates 2-3 interactive clarification questions with option pills
 */
export async function generateAiClarificationQuestions(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<AiClarificationQuestion[]> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a productivity AI planning assistant.
Analyze the user's goal or request and formulate 3 quick clarification questions to personalize their plan.
For each question, provide 3 to 4 concise option choices.
Respond ONLY with valid JSON in this exact structure:
[
  {
    "id": "q1",
    "question": "What is your current skill level in this area?",
    "options": ["Beginner", "Intermediate", "Advanced"]
  },
  {
    "id": "q2",
    "question": "How many hours can you dedicate daily or weekly?",
    "options": ["1-2 hours", "2-3 hours", "4+ hours"]
  },
  {
    "id": "q3",
    "question": "What is your target timeline?",
    "options": ["1 month", "3 months", "6 months"]
  }
]`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Request: ${userPrompt}` }]
        }
      ],
      generationConfig: {
        temperature: 0.5,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as AiClarificationQuestion[];

  return Array.isArray(parsed) ? parsed : [];
}

/**
 * Generates full multi-step plan payload (Task, Subtasks, Markdown Doc, Habit Routine)
 */
export async function generateAiMultiStepPlan(
  apiKey: string,
  userPrompt: string,
  answersSummary: string,
  model: string = DEFAULT_MODEL
): Promise<AiMultiStepPlanOutput> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Gemini API key is required.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const systemInstruction = `You are a multi-step productivity execution engine.
Analyze the user request and their answers, then generate:
1. Main Task Title & Subtasks
2. Full formatted Markdown document (.md file)
3. Actionable daily/weekly Habit Routine

Respond ONLY with valid JSON in this exact structure:
{
  "taskTitle": "Study for OS Exam",
  "priority": "high",
  "tags": ["study", "exam", "os"],
  "subtasks": [
    { "title": "Review syllabus & exam pattern" },
    { "title": "Read Unit 1 - Process Management" },
    { "title": "Make summary notes" },
    { "title": "Solve previous year questions" },
    { "title": "Revise key formulas" }
  ],
  "markdownTitle": "os_exam_study_plan.md",
  "markdownContent": "# OS Exam Study Plan\\n\\n## 🎯 Objectives\\n- Master Process Scheduling\\n- Review Memory Management\\n\\n> [!TIP]\\n> Focus 60% of review on deadlock algorithms.",
  "habitName": "Daily OS Study Session at 8:00 PM",
  "habitCategory": "learning",
  "targetDaysPerWeek": 5
}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Request: ${userPrompt}\nUser Preferences & Answers: ${answersSummary}` }]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanedJson = cleanJsonResponse(rawContent);
  const parsed = JSON.parse(cleanedJson) as AiMultiStepPlanOutput;

  return {
    taskTitle: parsed.taskTitle || userPrompt,
    priority: ['low', 'medium', 'high', 'none'].includes(parsed.priority) ? parsed.priority : 'high',
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['ai-plan'],
    subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
    markdownTitle: parsed.markdownTitle || 'study_plan.md',
    markdownContent: parsed.markdownContent || '# Study Plan\n\nGenerated by AI Assistant.',
    habitName: parsed.habitName || 'Daily Focus Habit',
    habitCategory: ['health', 'learning', 'productivity', 'mindfulness'].includes(parsed.habitCategory) ? parsed.habitCategory : 'learning',
    targetDaysPerWeek: parsed.targetDaysPerWeek || 5
  };
}

/**
 * Generates intelligent suggestions based on current app state (tasks, habits, journals)
 */
export function generateRealAppContextSuggestions(
  todoTasks: any[] = [],
  habits: any[] = [],
  _journals: any[] = []
): AiSuggestion[] {
  const suggestions: AiSuggestion[] = [];
  const pendingTasks = todoTasks.filter(t => !t.completed && !t.deleted);
  const todayStr = new Date().toISOString().split('T')[0];
  const dueHabits = habits.filter(h => !h.completedDates?.includes(todayStr));

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
      targetData: topTask
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
      actionType: 'schedule'
    });
  }

  suggestions.push({
    id: 'sug_daily_plan',
    title: 'Create a Structured Daily Plan',
    description: 'Organize tasks, study goals & habits into a workflow',
    contextTag: 'Brain Dump',
    reason: 'Start your session with full clarity',
    actionLabel: 'Plan my day',
    actionType: 'create_plan'
  });

  return suggestions;
}

/**
 * Analyzes and classifies user prompt intent using Gemini API or smart heuristic classification
 */
export async function analyzeAndClassifyUserPrompt(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL,
  _persona: string = 'Professional'
): Promise<{
  intent: 'ASK_CLARIFICATION' | 'CREATE_TODO_TASK' | 'BREAKDOWN_TASK' | 'CREATE_MARKDOWN_DOC' | 'CREATE_HABIT_ROUTINE' | 'MULTI_STEP_GOAL' | 'GENERAL_CHAT';
  replyText?: string;
  clarificationFields?: any[];
  taskData?: GeminiTaskResult;
  targetTaskTitle?: string;
  markdownData?: GeminiMarkdownResult;
  habitData?: GeminiHabitResult;
  multiStepPlan?: any;
}> {
  const p = userPrompt.toLowerCase().trim();

  // Multi-step workflows
  if (isMultiStepIntent(userPrompt)) {
    try {
      const plan = await generateAiMultiStepPlan(apiKey, userPrompt, '', model);
      return {
        intent: 'MULTI_STEP_GOAL',
        replyText: `Multi-step plan for **"${plan.taskTitle}"** created!`,
        multiStepPlan: plan
      };
    } catch (e) {
      console.warn('Multi-step generation failed, falling back to general classifier:', e);
    }
  }

  // Breakdown task
  if (p.includes('break down') || p.includes('break task') || p.includes('subtasks')) {
    try {
      const taskRes = await generateAiTaskWithSubtasks(apiKey, userPrompt, model);
      return {
        intent: 'BREAKDOWN_TASK',
        targetTaskTitle: taskRes.title,
        taskData: taskRes,
        replyText: `Here is the breakdown for **"${taskRes.title}"**`
      };
    } catch (e) {
      return { intent: 'BREAKDOWN_TASK' };
    }
  }

  // Task creation
  if (p.startsWith('add task') || p.startsWith('create task') || p.includes('todo') || p.includes('remind me to') || p.includes('buy') || p.includes('finish')) {
    try {
      const taskRes = await generateAiTaskWithSubtasks(apiKey, userPrompt, model);
      return {
        intent: 'CREATE_TODO_TASK',
        taskData: taskRes,
        replyText: `Task **"${taskRes.title}"** has been added to your To-Do list.`
      };
    } catch (e) {
      // fallback
    }
  }

  // Habit creation
  if (p.includes('habit') || p.includes('routine') || p.includes('every day') || p.includes('daily')) {
    try {
      const habitRes = await generateAiHabit(apiKey, userPrompt, model);
      return {
        intent: 'CREATE_HABIT_ROUTINE',
        habitData: habitRes,
        replyText: `Habit **"${habitRes.name}"** created successfully.`
      };
    } catch (e) {
      // fallback
    }
  }

  // Markdown document creation
  if (p.includes('markdown') || p.includes('notes') || p.includes('document') || p.includes('summary') || p.includes('write')) {
    try {
      const mdRes = await generateAiMarkdownDoc(apiKey, userPrompt, model);
      return {
        intent: 'CREATE_MARKDOWN_DOC',
        markdownData: mdRes,
        replyText: `Markdown doc **"${mdRes.title}"** is ready.`
      };
    } catch (e) {
      // fallback
    }
  }

  // General response
  const generalReply = await generateAiGeneralResponse(apiKey, userPrompt, model);
  return {
    intent: 'GENERAL_CHAT',
    replyText: generalReply
  };
}
