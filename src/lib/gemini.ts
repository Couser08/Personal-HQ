import type { AiSuggestion } from '../store/types';

export interface GeminiSubTask {
  title: string;
}

export interface GeminiTaskResult {
  title: string;
  priority: 'low' | 'medium' | 'high' | 'none';
  tags: string[];
  dueDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
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

export type ClarificationFieldType = 'input' | 'textarea' | 'radio' | 'checkbox' | 'time';

export interface ClarificationField {
  id: string;
  label: string;
  type: ClarificationFieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  defaultValue?: string | string[];
}

export type StructuredReplyBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'callout'; variant: 'tip' | 'note' | 'warning'; text: string };

export interface StructuredAiReply {
  replyText: string;
  blocks: StructuredReplyBlock[];
}

export type AiIntent =
  | 'ASK_CLARIFICATION'
  | 'CREATE_TODO_TASK'
  | 'BREAKDOWN_TASK'
  | 'CREATE_MARKDOWN_DOC'
  | 'CREATE_HABIT_ROUTINE'
  | 'MULTI_STEP_GOAL'
  | 'GENERAL_CHAT';

export interface AiClassifyContext {
  originalPrompt?: string;
  pendingIntent?: AiIntent | null;
  clarificationAnswers?: string;
  /** Structured form values — preferred for CREATE_TODO_TASK */
  clarificationAnswerMap?: Record<string, string | string[]>;
}

export interface AiClassifyResult {
  intent: AiIntent;
  replyText?: string;
  blocks?: StructuredReplyBlock[];
  clarificationFields?: ClarificationField[];
  pendingIntent?: AiIntent;
  taskData?: GeminiTaskResult;
  targetTaskTitle?: string;
  markdownData?: GeminiMarkdownResult;
  habitData?: GeminiHabitResult;
  multiStepPlan?: AiMultiStepPlanOutput;
}

const DEFAULT_MODEL = 'gemini-2.5-flash';

function geminiUrl(apiKey: string, model: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
}

async function callGeminiJson<T>(
  apiKey: string,
  model: string,
  prompt: string,
  temperature = 0.4
): Promise<T> {
  const response = await fetch(geminiUrl(apiKey, model), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API Error (${response.status})`);
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!rawContent) throw new Error('Received empty response from Gemini API.');
  return JSON.parse(cleanJsonResponse(rawContent)) as T;
}

/**
 * Helper to detect if user prompt implies a multi-step workflow
 */
export function isMultiStepIntent(userPrompt: string): boolean {
  const p = userPrompt.toLowerCase();
  const strongSignals = [
    'and create',
    'and make',
    'and write',
    'and add a habit',
    'full plan',
    'multi-step',
    'roadmap',
    'study plan',
    'break into subtasks and',
  ];
  if (strongSignals.some((s) => p.includes(s))) return true;

  const keywords = ['subtask', 'subtasks', 'habit', 'routine', 'checklist', 'workflow', 'schedule'];
  const matchCount = keywords.filter((kw) => p.includes(kw)).length;
  return matchCount >= 2;
}

/**
 * Validates Gemini API Key with a lightweight ping request.
 */
export async function testGeminiApiKey(
  apiKey: string,
  model: string = DEFAULT_MODEL
): Promise<{ success: boolean; message: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, message: 'API key is empty.' };
  }

  try {
    const response = await fetch(geminiUrl(apiKey, model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Respond with OK if connected.' }] }],
      }),
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

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

function normalizeClarificationFields(raw: any[]): ClarificationField[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f, i) => {
      const type: ClarificationFieldType =
        f?.type === 'checkbox' ||
        f?.type === 'radio' ||
        f?.type === 'textarea' ||
        f?.type === 'input' ||
        f?.type === 'time'
          ? f.type
          : Array.isArray(f?.options) && f.options.length
            ? 'radio'
            : 'input';

      const options = Array.isArray(f?.options)
        ? f.options.map((o: any) => String(o)).filter(Boolean).slice(0, 8)
        : undefined;

      if ((type === 'radio' || type === 'checkbox') && (!options || options.length < 2)) {
        return null;
      }

      return {
        id: String(f?.id || `field_${i + 1}`),
        label: String(f?.label || f?.question || `Question ${i + 1}`),
        type,
        placeholder: f?.placeholder ? String(f.placeholder) : undefined,
        options,
        required: f?.required !== false,
      } as ClarificationField;
    })
    .filter(Boolean) as ClarificationField[];
}

function normalizeBlocks(raw: any): StructuredReplyBlock[] {
  if (!Array.isArray(raw)) return [];
  const blocks: StructuredReplyBlock[] = [];
  for (const b of raw) {
    if (!b || typeof b !== 'object') continue;
    if (b.type === 'heading' && b.text) blocks.push({ type: 'heading', text: String(b.text) });
    else if (b.type === 'paragraph' && b.text) blocks.push({ type: 'paragraph', text: String(b.text) });
    else if (b.type === 'bullets' && Array.isArray(b.items)) {
      blocks.push({ type: 'bullets', items: b.items.map(String).filter(Boolean) });
    } else if (b.type === 'steps' && Array.isArray(b.items)) {
      blocks.push({ type: 'steps', items: b.items.map(String).filter(Boolean) });
    } else if (b.type === 'callout' && b.text) {
      const variant = ['tip', 'note', 'warning'].includes(b.variant) ? b.variant : 'note';
      blocks.push({ type: 'callout', variant, text: String(b.text) });
    }
  }
  return blocks;
}

function plainFromBlocks(blocks: StructuredReplyBlock[], fallback = ''): string {
  if (!blocks.length) return fallback;
  return blocks
    .map((b) => {
      if (b.type === 'heading' || b.type === 'paragraph' || b.type === 'callout') return b.text;
      if (b.type === 'bullets' || b.type === 'steps') return b.items.join('; ');
      return '';
    })
    .filter(Boolean)
    .join(' ');
}

/** Explicit create-task phrasing — avoids AI slop from casual words like "buy" / "finish". */
function isExplicitTaskCreate(p: string): boolean {
  return (
    /^(add|create|make|new)\s+(a\s+)?(task|todo|to-?do)/i.test(p) ||
    /^remind me (to|about)/i.test(p) ||
    /^(add|create)\s+.+\s+(to|as)\s+(my\s+)?(task|todo|to-?do)/i.test(p)
  );
}

function isExplicitHabitCreate(p: string): boolean {
  return (
    /^(add|create|start|set up|setup)\s+(a\s+)?(new\s+)?habit/i.test(p) ||
    /^(track|log)\s+(a\s+)?habit/i.test(p)
  );
}

function isExplicitMarkdownCreate(p: string): boolean {
  return (
    /^(write|create|draft|generate)\s+(a\s+)?(markdown|md|note|document|doc|summary)/i.test(p) ||
    /\b(markdown|md)\s+(file|doc|document|note)\b/i.test(p)
  );
}

function isExplicitBreakdown(p: string): boolean {
  return (
    /break\s*(down|it|this|the\s+task)/i.test(p) ||
    /split\s+(into\s+)?subtasks?/i.test(p) ||
    /^break\s+down\s+task/i.test(p)
  );
}

function isVagueGoal(p: string): boolean {
  const vague = [
    'help me',
    'plan my',
    'make a plan',
    'goal',
    'roadmap',
    'suggest',
    'what should i',
    'how do i',
    'organize my',
    'set up a',
    'build a',
  ];
  return vague.some((v) => p.includes(v)) && p.split(/\s+/).length < 14;
}

/**
 * Builds a todo from user request / form answers.
 * Subtasks are ONLY included when includeSubtasks is true (user asked to break it down).
 */
export async function generateAiTask(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL,
  options: { includeSubtasks?: boolean } = {}
): Promise<GeminiTaskResult> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required. Please set your API Key in Settings.');

  const includeSubtasks = Boolean(options.includeSubtasks);

  const parsed = await callGeminiJson<GeminiTaskResult>(
    apiKey,
    model,
    `You are a productivity task engine inside Personal HQ.
Extract ONE task from the user request and answers. Do not invent extra work.
Return JSON only:
{
  "title": "Clear actionable task title",
  "priority": "low" | "medium" | "high" | "none",
  "tags": ["tag1"],
  "startTime": "HH:MM" | null,
  "endTime": "HH:MM" | null,
  "dueDate": null,
  "subtasks": ${includeSubtasks ? '[{ "title": "Concrete step" }]' : '[]'}
}
Rules:
- Use the user's title/name exactly when provided
- Map priority from Low/Medium/High/None (case-insensitive)
- Parse startTime / endTime as 24h "HH:MM" when given (e.g. 09:00, 14:30)
- Tags: split comma-separated values; keep short lowercase tags; empty array if none
${includeSubtasks
  ? '- Include 3–7 concrete subtasks the user asked for'
  : '- subtasks MUST be an empty array []. Never invent subtasks.'}
- Never invent unrelated busywork

User Request: ${userPrompt}`,
    0.2
  );

  const priorityRaw = String(parsed.priority || '').toLowerCase();
  const priority = (['low', 'medium', 'high', 'none'].includes(priorityRaw)
    ? priorityRaw
    : 'medium') as GeminiTaskResult['priority'];

  const tags = Array.isArray(parsed.tags)
    ? parsed.tags.map((t) => String(t).trim()).filter(Boolean)
    : [];

  const normalizeTime = (v: unknown): string | null => {
    if (v == null || v === '') return null;
    const s = String(v).trim();
    const m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  return {
    title: parsed.title || userPrompt,
    priority,
    tags,
    dueDate: parsed.dueDate ?? null,
    startTime: normalizeTime(parsed.startTime),
    endTime: normalizeTime(parsed.endTime),
    subtasks: includeSubtasks
      ? (Array.isArray(parsed.subtasks) ? parsed.subtasks.filter((s) => s && s.title) : [])
      : [],
  };
}

/** Breakdown helper — only when user asks for subtasks */
export async function generateAiTaskWithSubtasks(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<GeminiTaskResult> {
  return generateAiTask(apiKey, userPrompt, model, { includeSubtasks: true });
}

/** Build task from structured form answers — no invented subtasks */
export function buildTaskFromClarificationAnswers(
  answers: Record<string, string | string[]>,
  fallbackTitle = 'New task'
): GeminiTaskResult {
  const pick = (id: string) => {
    const v = answers[id];
    if (Array.isArray(v)) return v.join(', ');
    return (v || '').trim();
  };

  const title = pick('title') || pick('name') || pick('task') || fallbackTitle;

  const priorityRaw = pick('priority').toLowerCase();
  const priority = (['low', 'medium', 'high', 'none'].includes(priorityRaw)
    ? priorityRaw
    : 'medium') as GeminiTaskResult['priority'];

  const startTime = pick('startTime') || pick('time_from') || pick('from') || null;
  const endTime = pick('endTime') || pick('time_to') || pick('to') || null;

  const tagsRaw = answers['tags'];
  let tags: string[] = [];
  if (Array.isArray(tagsRaw)) {
    tags = tagsRaw.map(String).map((t) => t.trim()).filter(Boolean);
  } else if (typeof tagsRaw === 'string' && tagsRaw.trim()) {
    tags = tagsRaw.split(/[,#]/).map((t) => t.trim()).filter(Boolean);
  }

  const normalizeTime = (v: string | null): string | null => {
    if (!v) return null;
    const m = v.trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    const h = Math.min(23, Math.max(0, parseInt(m[1], 10)));
    const min = Math.min(59, Math.max(0, parseInt(m[2], 10)));
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  return {
    title,
    priority,
    tags,
    dueDate: null,
    startTime: normalizeTime(startTime),
    endTime: normalizeTime(endTime),
    subtasks: [],
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
  if (!apiKey?.trim()) throw new Error('Gemini API key is required. Please set your API Key in Settings.');

  const parsed = await callGeminiJson<GeminiMarkdownResult>(
    apiKey,
    model,
    `You are a Markdown document writer for Personal HQ.
Draft a useful document for the request. Keep structure tight — headings, bullets, checklists only where they help.
Return JSON only:
{ "title": "Document Title", "content": "Full markdown body" }

User Request: ${userPrompt}`,
    0.6
  );

  return {
    title: parsed.title || 'AI Document',
    content: parsed.content || '',
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
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const parsed = await callGeminiJson<GeminiJournalResult>(
    apiKey,
    model,
    `You are a personal journal assistant.
Draft a reflective entry from the prompt. No corporate self-help tone.
Return JSON:
{
  "title": "Journal Entry Title",
  "content": "Reflective journal content...",
  "mood": "great" | "good" | "meh" | "bad" | "terrible",
  "tags": ["journal"],
  "whatWentWell": "...",
  "whatCanBeBetter": "..."
}

User Prompt: ${userPrompt}`,
    0.7
  );

  return {
    title: parsed.title || 'Daily Reflection',
    content: parsed.content || userPrompt,
    mood: ['great', 'good', 'meh', 'bad', 'terrible'].includes(parsed.mood) ? parsed.mood : 'good',
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['journal', 'ai'],
    whatWentWell: parsed.whatWentWell || '',
    whatCanBeBetter: parsed.whatCanBeBetter || '',
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
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const parsed = await callGeminiJson<GeminiHabitResult>(
    apiKey,
    model,
    `You are a habit coach for Personal HQ.
Create ONE specific, measurable habit — not a vague life goal.
Return JSON:
{
  "name": "Habit Name (e.g. Read 15 pages)",
  "description": "One-line why / how",
  "category": "health" | "learning" | "productivity" | "mindfulness",
  "frequencyType": "daily" | "weekly_days" | "weekly_count",
  "frequencyDays": [1,2,3,4,5],
  "frequencyCount": 3,
  "targetDaysPerWeek": 1-7
}

User Prompt: ${userPrompt}`,
    0.4
  );

  return {
    name: parsed.name || userPrompt,
    description: parsed.description || '',
    category: ['health', 'learning', 'productivity', 'mindfulness'].includes(parsed.category)
      ? parsed.category
      : 'productivity',
    frequencyType: parsed.frequencyType || 'daily',
    frequencyDays: Array.isArray(parsed.frequencyDays) ? parsed.frequencyDays : [1, 2, 3, 4, 5],
    frequencyCount: parsed.frequencyCount || 3,
    targetDaysPerWeek:
      typeof parsed.targetDaysPerWeek === 'number'
        ? Math.min(7, Math.max(1, parsed.targetDaysPerWeek))
        : 7,
  };
}

/**
 * Structured conversational reply — never dump raw markdown into chat UI.
 */
export async function generateAiGeneralResponse(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<StructuredAiReply> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required. Please set your API Key in Settings.');

  const parsed = await callGeminiJson<StructuredAiReply>(
    apiKey,
    model,
    `You are Antigravity AI inside Personal HQ (todos, habits, journal, markdown notes, study).
Answer helpfully in structured JSON — NEVER use markdown syntax (#, **, -, \`\`\`).
Write plain sentences. Prefer asking one clarifying question over inventing a fake plan.

Return JSON:
{
  "replyText": "One short sentence shown as the chat summary",
  "blocks": [
    { "type": "heading", "text": "Optional section title" },
    { "type": "paragraph", "text": "Plain prose" },
    { "type": "bullets", "items": ["Point one", "Point two"] },
    { "type": "steps", "items": ["Do this first", "Then this"] },
    { "type": "callout", "variant": "tip" | "note" | "warning", "text": "Short aside" }
  ]
}

Rules:
- 1–5 blocks max
- No emoji spam, no filler ("Certainly!", "Great question!", "As an AI...")
- If the request is vague, use a paragraph that asks what they need + suggest they use the form if one is shown
- Do not invent tasks/habits the user did not ask to create

User Request: ${userPrompt}`,
    0.55
  );

  const blocks = normalizeBlocks(parsed.blocks);
  const replyText = (parsed.replyText || plainFromBlocks(blocks) || 'Here is what I can help with.').trim();
  return { replyText, blocks };
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
 * Builds typed clarification fields for ambiguous requests.
 */
export async function generateClarificationFields(
  apiKey: string,
  userPrompt: string,
  intendedIntent: AiIntent,
  model: string = DEFAULT_MODEL
): Promise<{ replyText: string; fields: ClarificationField[] }> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const parsed = await callGeminiJson<{ replyText?: string; fields?: any[] }>(
    apiKey,
    model,
    `You help Personal HQ collect missing details before taking action.
Intended action: ${intendedIntent}
User said: "${userPrompt}"

Ask 1–4 short questions ONLY for missing info. Use the right control type:
- "radio" = exactly one choice (2–5 options)
- "checkbox" = select multiple (2–6 options)
- "input" = free-text single line (deadline, title, name, tags)
- "textarea" = longer free text
- "time" = clock time from/to (HH:MM)

For CREATE_TODO_TASK always collect: title (input), priority (radio Low/Medium/High/None), startTime (time), endTime (time), tags (input, optional). Never ask about subtasks for CREATE_TODO_TASK.
Never ask for information already clear in the prompt.
Never invent options that don't fit the request.
No markdown. No motivational fluff.

Return JSON:
{
  "replyText": "One plain sentence explaining why you need these answers",
  "fields": [
    {
      "id": "q1",
      "label": "Clear question label",
      "type": "radio" | "checkbox" | "input" | "textarea",
      "placeholder": "optional for input/textarea",
      "options": ["only for radio/checkbox"],
      "required": true
    }
  ]
}`,
    0.35
  );

  const fields = normalizeClarificationFields(parsed.fields || []);
  return {
    replyText: parsed.replyText || 'A couple details will help me do this properly.',
    fields,
  };
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
  if (!apiKey?.trim()) throw new Error('Gemini API key is required.');

  const parsed = await callGeminiJson<AiMultiStepPlanOutput>(
    apiKey,
    model,
    `You are a multi-step productivity engine for Personal HQ.
Build a concrete plan from the request + answers. No filler content.

Return JSON:
{
  "taskTitle": "Main task",
  "priority": "high",
  "tags": ["tag"],
  "subtasks": [{ "title": "Step" }],
  "markdownTitle": "plan_title",
  "markdownContent": "# Title\\n\\nUseful body with headings and bullets",
  "habitName": "Specific habit name",
  "habitCategory": "learning",
  "targetDaysPerWeek": 5
}

Rules:
- 4–8 real subtasks
- Markdown is useful reference, not motivational essay
- Habit is one measurable action

User Request: ${userPrompt}
User Answers: ${answersSummary || 'None provided'}`,
    0.5
  );

  return {
    taskTitle: parsed.taskTitle || userPrompt,
    priority: ['low', 'medium', 'high', 'none'].includes(parsed.priority) ? parsed.priority : 'high',
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['ai-plan'],
    subtasks: Array.isArray(parsed.subtasks) ? parsed.subtasks : [],
    markdownTitle: parsed.markdownTitle || 'study_plan',
    markdownContent: parsed.markdownContent || '# Plan\n\nGenerated by AI Assistant.',
    habitName: parsed.habitName || 'Daily Focus Habit',
    habitCategory: ['health', 'learning', 'productivity', 'mindfulness'].includes(parsed.habitCategory)
      ? parsed.habitCategory
      : 'learning',
    targetDaysPerWeek: parsed.targetDaysPerWeek || 5,
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
    contextTag: 'Brain Dump',
    reason: 'Start your session with full clarity',
    actionLabel: 'Plan my day',
    actionType: 'create_plan',
  });

  return suggestions;
}

async function askThenReturn(
  apiKey: string,
  userPrompt: string,
  pendingIntent: AiIntent,
  model: string,
  fallbackReply: string
): Promise<AiClassifyResult> {
  try {
    const { replyText, fields } = await generateClarificationFields(apiKey, userPrompt, pendingIntent, model);
    if (fields.length > 0) {
      return {
        intent: 'ASK_CLARIFICATION',
        replyText,
        clarificationFields: fields,
        pendingIntent,
      };
    }
  } catch (e) {
    console.warn('Clarification generation failed:', e);
  }
  return {
    intent: 'ASK_CLARIFICATION',
    replyText: fallbackReply,
    clarificationFields: defaultFieldsForIntent(pendingIntent, userPrompt),
    pendingIntent,
  };
}

function extractTaskTitleHint(prompt: string): string | null {
  const m =
    prompt.match(/^(?:add|create|make|new)\s+(?:a\s+)?(?:task|todo|to-?do)\s*[:\-]\s*(.+)$/i) ||
    prompt.match(/^(?:add|create|make|new)\s+(?:a\s+)?(?:task|todo|to-?do)\s+(.+)$/i) ||
    prompt.match(/^remind me (?:to|about)\s+(.+)$/i);
  const title = m?.[1]?.trim();
  if (!title || /^(please|now|for me)$/i.test(title)) return null;
  return title;
}

function taskClarificationFields(prompt?: string): ClarificationField[] {
  const hint = prompt ? extractTaskTitleHint(prompt) : null;
  return [
    {
      id: 'title',
      label: 'Task name',
      type: 'input',
      placeholder: 'e.g. Finish OS notes',
      required: true,
      defaultValue: hint || undefined,
    },
    {
      id: 'priority',
      label: 'Priority',
      type: 'radio',
      options: ['Low', 'Medium', 'High', 'None'],
      required: true,
    },
    { id: 'startTime', label: 'Time from', type: 'time', required: true },
    { id: 'endTime', label: 'Time to', type: 'time', required: true },
    {
      id: 'tags',
      label: 'Tags',
      type: 'input',
      placeholder: 'e.g. work, study (comma-separated)',
      required: false,
    },
  ];
}
function defaultFieldsForIntent(intent: AiIntent, prompt?: string): ClarificationField[] {
  switch (intent) {
    case 'CREATE_TODO_TASK':
      return taskClarificationFields(prompt);
    case 'CREATE_HABIT_ROUTINE':
      return [
        { id: 'name', label: 'Habit name', type: 'input', placeholder: 'e.g. Read 20 pages', required: true },
        {
          id: 'frequency',
          label: 'How often?',
          type: 'radio',
          options: ['Every day', 'Weekdays', '3× per week', 'Custom'],
          required: true,
        },
        {
          id: 'category',
          label: 'Category',
          type: 'radio',
          options: ['Health', 'Learning', 'Productivity', 'Mindfulness'],
          required: true,
        },
      ];
    case 'CREATE_MARKDOWN_DOC':
      return [
        { id: 'topic', label: 'Document topic', type: 'input', placeholder: 'What should it cover?', required: true },
        {
          id: 'format',
          label: 'Format',
          type: 'radio',
          options: ['Outline', 'Checklist', 'Notes', 'Study guide'],
          required: true,
        },
        {
          id: 'sections',
          label: 'Include sections',
          type: 'checkbox',
          options: ['Overview', 'Steps', 'Resources', 'Checklist'],
          required: false,
        },
      ];
    case 'MULTI_STEP_GOAL':
      return [
        { id: 'goal', label: 'What is the goal?', type: 'textarea', placeholder: 'Be specific…', required: true },
        {
          id: 'timeline',
          label: 'Timeline',
          type: 'radio',
          options: ['This week', '2 weeks', '1 month', '3 months'],
          required: true,
        },
        {
          id: 'deliverables',
          label: 'What should I create?',
          type: 'checkbox',
          options: ['Task + subtasks', 'Markdown plan', 'Habit'],
          required: true,
        },
        {
          id: 'hours',
          label: 'Hours you can spend per week',
          type: 'radio',
          options: ['1–3 hrs', '4–6 hrs', '7–10 hrs', '10+ hrs'],
          required: true,
        },
      ];
    case 'BREAKDOWN_TASK':
      return [
        { id: 'task', label: 'Which task?', type: 'input', placeholder: 'Paste or type the task title', required: true },
        {
          id: 'depth',
          label: 'How detailed?',
          type: 'radio',
          options: ['3–4 steps', '5–7 steps', 'Very detailed'],
          required: true,
        },
      ];
    default:
      return [
        {
          id: 'need',
          label: 'What do you need help with?',
          type: 'radio',
          options: ['Create a task', 'Break down a task', 'Create a habit', 'Write notes', 'Build a full plan'],
          required: true,
        },
        { id: 'details', label: 'Any extra details?', type: 'textarea', placeholder: 'Optional context…', required: false },
      ];
  }
}

/**
 * Analyzes and classifies user prompt — asks clarification when details are missing.
 * Never auto-creates junk from vague wording.
 */
export async function analyzeAndClassifyUserPrompt(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL,
  _persona: string = 'Professional',
  context: AiClassifyContext = {}
): Promise<AiClassifyResult> {
  if (!apiKey?.trim()) throw new Error('Gemini API key is required. Please set your API Key in Settings.');

  const p = userPrompt.toLowerCase().trim();
  const original = (context.originalPrompt || userPrompt).trim();
  const answers = (context.clarificationAnswers || '').trim();
  const hasAnswers = Boolean(answers);
  const forcedIntent = context.pendingIntent || null;

  const enrichedPrompt = hasAnswers
    ? `Original request: ${original}\n\nUser answers:\n${answers}\n\nLatest message: ${userPrompt}`
    : userPrompt;

  // Resume after clarification — execute the pending intent with answers
  if (hasAnswers && forcedIntent && forcedIntent !== 'ASK_CLARIFICATION' && forcedIntent !== 'GENERAL_CHAT') {
    return executeIntent(
      apiKey,
      enrichedPrompt,
      forcedIntent,
      model,
      answers,
      context.clarificationAnswerMap
    );
  }

  // Explicit multi-step → always clarify first unless answers already present
  if (isMultiStepIntent(userPrompt) || forcedIntent === 'MULTI_STEP_GOAL') {
    if (!hasAnswers) {
      return askThenReturn(
        apiKey,
        userPrompt,
        'MULTI_STEP_GOAL',
        model,
        'Before I build the plan, I need a few specifics.'
      );
    }
    return executeIntent(apiKey, enrichedPrompt, 'MULTI_STEP_GOAL', model, answers);
  }

  if (isExplicitBreakdown(p) || forcedIntent === 'BREAKDOWN_TASK') {
    // "Break down a task" with no title → let UI show task picker (modal handles empty title)
    if (!hasAnswers && !/"[^"]+"/.test(userPrompt) && !/task\s+".+"/.test(p) && p.length < 28) {
      return { intent: 'BREAKDOWN_TASK', replyText: 'Which task should I break down?' };
    }
    if (!hasAnswers && isVagueGoal(p)) {
      return askThenReturn(apiKey, userPrompt, 'BREAKDOWN_TASK', model, 'Which task, and how detailed?');
    }
    return executeIntent(apiKey, enrichedPrompt, 'BREAKDOWN_TASK', model, answers);
  }

  if (isExplicitTaskCreate(p) || forcedIntent === 'CREATE_TODO_TASK') {
    // Always collect name, priority, time from/to, tags before creating — no auto subtasks
    if (!hasAnswers) {
      return {
        intent: 'ASK_CLARIFICATION',
        replyText: 'Fill in the task details and I’ll add it.',
        clarificationFields: taskClarificationFields(userPrompt),
        pendingIntent: 'CREATE_TODO_TASK',
      };
    }
    return executeIntent(apiKey, enrichedPrompt, 'CREATE_TODO_TASK', model, answers, context.clarificationAnswerMap);
  }

  if (isExplicitHabitCreate(p) || forcedIntent === 'CREATE_HABIT_ROUTINE') {
    const tooThin = /^(add|create|start|set up|setup)\s+(a\s+)?(new\s+)?habit\s*:?\s*$/i.test(userPrompt.trim());
    if (!hasAnswers && (tooThin || isVagueGoal(p))) {
      return askThenReturn(
        apiKey,
        userPrompt,
        'CREATE_HABIT_ROUTINE',
        model,
        'Tell me what habit to track.'
      );
    }
    return executeIntent(apiKey, enrichedPrompt, 'CREATE_HABIT_ROUTINE', model, answers);
  }

  if (isExplicitMarkdownCreate(p) || forcedIntent === 'CREATE_MARKDOWN_DOC') {
    const tooThin = /^(write|create|draft|generate)\s+(a\s+)?(markdown|md|note|document|doc|summary)\s*:?\s*$/i.test(
      userPrompt.trim()
    );
    if (!hasAnswers && (tooThin || isVagueGoal(p))) {
      return askThenReturn(
        apiKey,
        userPrompt,
        'CREATE_MARKDOWN_DOC',
        model,
        'What should the document cover?'
      );
    }
    return executeIntent(apiKey, enrichedPrompt, 'CREATE_MARKDOWN_DOC', model, answers);
  }

  // Vague planning language without explicit create → clarify, don't invent slop
  if (isVagueGoal(p) || /^(plan|help|suggest|organize)/i.test(p)) {
    return askThenReturn(
      apiKey,
      userPrompt,
      'MULTI_STEP_GOAL',
      model,
      'I can help — answer a few questions so I build the right thing.'
    );
  }

  // Gemini classify ambiguous mid-length prompts
  try {
    const classified = await callGeminiJson<{
      intent: AiIntent;
      needsClarification: boolean;
      replyText?: string;
      fields?: any[];
    }>(
      apiKey,
      model,
      `Classify this Personal HQ request. Prefer asking clarification over inventing content.

User: "${userPrompt}"

Intents:
- CREATE_TODO_TASK — user clearly wants a todo created
- BREAKDOWN_TASK — break an existing/new task into steps
- CREATE_MARKDOWN_DOC — write a note/doc
- CREATE_HABIT_ROUTINE — create a habit
- MULTI_STEP_GOAL — wants a full plan (task + notes + habit)
- GENERAL_CHAT — question/advice, no create
- ASK_CLARIFICATION — too vague to act

Set needsClarification true if key details are missing.
If needsClarification, include 1–3 fields with type input|textarea|radio|checkbox.

Return JSON:
{
  "intent": "...",
  "needsClarification": true/false,
  "replyText": "plain sentence",
  "fields": [{ "id":"q1","label":"...","type":"radio","options":["A","B"],"required":true }]
}`,
      0.2
    );

    if (classified.needsClarification || classified.intent === 'ASK_CLARIFICATION') {
      const fields = normalizeClarificationFields(classified.fields || []);
      const pending =
        classified.intent !== 'ASK_CLARIFICATION' && classified.intent !== 'GENERAL_CHAT'
          ? classified.intent
          : 'MULTI_STEP_GOAL';
      return {
        intent: 'ASK_CLARIFICATION',
        replyText: classified.replyText || 'I need a bit more detail.',
        clarificationFields: fields.length ? fields : defaultFieldsForIntent(pending, userPrompt),
        pendingIntent: pending,
      };
    }

    if (classified.intent === 'GENERAL_CHAT') {
      const general = await generateAiGeneralResponse(apiKey, userPrompt, model);
      return { intent: 'GENERAL_CHAT', replyText: general.replyText, blocks: general.blocks };
    }

    return executeIntent(apiKey, enrichedPrompt, classified.intent, model, answers);
  } catch (e) {
    console.warn('Classifier failed, falling back to general chat:', e);
  }

  const general = await generateAiGeneralResponse(apiKey, userPrompt, model);
  return { intent: 'GENERAL_CHAT', replyText: general.replyText, blocks: general.blocks };
}

async function executeIntent(
  apiKey: string,
  prompt: string,
  intent: AiIntent,
  model: string,
  answers: string,
  answerMap?: Record<string, string | string[]>
): Promise<AiClassifyResult> {
  switch (intent) {
    case 'CREATE_TODO_TASK': {
      // Prefer structured form answers; never invent subtasks on plain "add task"
      const taskData =
        answerMap && Object.keys(answerMap).length > 0
          ? buildTaskFromClarificationAnswers(answerMap, prompt)
          : await generateAiTask(apiKey, prompt, model, { includeSubtasks: false });
      return {
        intent,
        taskData,
        replyText: `Added “${taskData.title}” to your to-do list.`,
      };
    }
    case 'BREAKDOWN_TASK': {
      const taskData = await generateAiTask(apiKey, prompt, model, { includeSubtasks: true });
      return {
        intent,
        taskData,
        targetTaskTitle: taskData.title,
        replyText: `Here’s a breakdown for “${taskData.title}”.`,
      };
    }
    case 'CREATE_MARKDOWN_DOC': {
      const markdownData = await generateAiMarkdownDoc(apiKey, prompt, model);
      return {
        intent,
        markdownData,
        replyText: `Draft ready: “${markdownData.title}”.`,
      };
    }
    case 'CREATE_HABIT_ROUTINE': {
      const habitData = await generateAiHabit(apiKey, prompt, model);
      return {
        intent,
        habitData,
        replyText: `Habit “${habitData.name}” is set up.`,
      };
    }
    case 'MULTI_STEP_GOAL': {
      const multiStepPlan = await generateAiMultiStepPlan(apiKey, prompt, answers, model);
      return {
        intent,
        multiStepPlan,
        replyText: `Plan ready for “${multiStepPlan.taskTitle}”. Review it, then run the steps.`,
      };
    }
    default: {
      const general = await generateAiGeneralResponse(apiKey, prompt, model);
      return { intent: 'GENERAL_CHAT', replyText: general.replyText, blocks: general.blocks };
    }
  }
}

/** @deprecated Prefer generateClarificationFields — kept for older imports */
export async function generateAiClarificationQuestions(
  apiKey: string,
  userPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<AiClarificationQuestion[]> {
  const { fields } = await generateClarificationFields(apiKey, userPrompt, 'MULTI_STEP_GOAL', model);
  return fields
    .filter((f) => f.type === 'radio' || f.type === 'checkbox')
    .map((f) => ({
      id: f.id,
      question: f.label,
      options: f.options || [],
    }));
}
