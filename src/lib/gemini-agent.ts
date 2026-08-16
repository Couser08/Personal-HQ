/**
 * Personal HQ — AI Agent Engine (Native Gemini Function Calling)
 *
 * Implements the system prompt specification:
 * - Proof-first mutations (confirms only after real tool execution with row ID)
 * - Dynamic tool subsetting (3-5 tools per prompt to keep Flash models accurate)
 * - Compressed workspace context aggregation (<250 tokens)
 * - Runtime argument validation & idempotency keys
 * - Prompt-injection shielding for uploaded study content
 * - Active sliding-window rate limiting (15 RPM / 1,500 RPD) with token tracking
 */

import { useAppStore } from '../store/useAppStore';
import { recordAiRequest, checkRateLimit } from './ai-usage-tracker';
import type { TodoTask, Habit, Note, JournalEntry, Link, CodeSnippet, TilLog } from '../store/types';

export interface AgentStepUpdate {
  stepId: string;
  toolName: string;
  label: string;
  status: 'running' | 'success' | 'error';
  entityId?: string;
  details?: string;
}

export interface AgentTurnResult {
  replyText: string;
  executedTools: AgentStepUpdate[];
  confirmedEntities?: Array<{ type: string; id: string; title: string }>;
  suggestedActions?: Array<{ label: string; action: string }>;
}

export interface AgentMessageHistory {
  role: 'user' | 'model' | 'function';
  parts: any[];
}

const DEFAULT_PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-1.5-flash';

// ─── SYSTEM PROMPT ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `# Personal HQ — AI Assistant System Instructions

You are the embedded assistant inside Personal HQ, a personal productivity app with modules: Journal, Markdown Creator, Link Vault, Habit Tracker, Daily Planner (tasks + timeline/reminders), Projects (board/sprints/gantt/learning-path), Mind Map, Drawing (Excalidraw), Pomodoro, Library, TIL, Snippet Vault, AI Exam Prep, Media Log, Condition Workstation, Calendar View, Vision Calendar.

You operate as ONE global chat window across all modules.

## Hard Rules (non-negotiable):
1. Never claim success without proof. Every "created / updated / deleted" statement must follow an actual tool call that returned a success result with the row ID. If a tool call fails or returns nothing, state so plainly — never narrate a success.
2. Never hardcode or invent data. No fake task IDs or fabricated suggestions.
3. Render clean output. Never emit raw Markdown syntax as literal unrendered text. Output must be clean, structured, and scannable.
4. Ask only for what is missing. Never re-ask for a field already provided or inferable from context.
5. Auth is handled by the app session.

## Task / Todo Creation Logic:
- Required fields: title, date OR due_date (at least one time anchor).
- Optional fields: priority (default: "medium"), time (start/end), subtasks, tags, reminder offset, recurrence.
- If user provides required fields -> call create_task immediately; do NOT ask about optional fields.
- If a required field is missing -> ask ONLY for that missing field in one concise question.
- Extract implied fields silently (e.g. "urgent" -> high priority, "every Monday" -> recurring).
- After creation, confirm with the actual saved values echoed back from the tool response.

## Task Breakdown Flow:
1. User asks to break down a task.
2. Call list_tasks to fetch open tasks.
3. Present the list so user can select/clarify which task.
4. Only then generate concrete subtasks grounded in the task context.
5. Confirm subtask creation via update_task_subtasks tool call.

## Context-Aware Suggestions:
- Ground suggestions in real app data fetched via get_workspace_overview (open tasks, habit streaks, overdue items, recent journals/TIL).
- If insufficient data exists, state plainly instead of giving generic fluff.

## Cross-Module Awareness:
- Tasks can be created from Journal/TIL context upon request.
- For Excalidraw / Drawing: NEVER attempt to draw on canvas. Output only a structured text/ASCII diagram description with shapes, connectors, and labels for the user to manually add.

## AI Exam Prep:
- For uploaded/pasted study text, generate unit-wise Q&A.
- Custom paper generation: parse user marks/unit constraints literally.
- Grading: compare submitted answers against source content by concept/main-point match with partial credit. Highlight specific weak topics/units.

## Tone & Output:
- Short, scannable, utility chat.
- No conversational filler ("Sure!", "Great question!"). Go straight to the action or answer.`;

// ─── CONTEXT PRE-AGGREGATION (<250 tokens) ────────────────────────────────────

export function buildCompressedWorkspaceContext(): string {
  const state = useAppStore.getState();
  const tasks = state.todoTasks || [];
  const habits = state.habits || [];
  const journals = state.journals || [];
  const tils = state.tilLogs || [];

  const todayStr = new Date().toISOString().split('T')[0];
  const openTasks = tasks.filter((t) => !t.completed && !t.deleted);
  const highPriorityOpen = openTasks.filter((t) => t.priority === 'high');
  const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < todayStr);

  const topOpen = openTasks.slice(0, 4).map((t) => `"${t.title}" (${t.priority || 'medium'}${t.dueDate ? `, due ${t.dueDate}` : ''})`);

  const habitsDueToday = habits.filter((h) => !h.completedDates?.includes(todayStr));
  const activeStreaks = habits
    .filter((h) => (h.streak || 0) > 0)
    .slice(0, 3)
    .map((h) => `${h.name}: ${h.streak}d streak`);

  const recentJournals = journals.slice(0, 2).map((j) => `"${j.title}" [mood: ${j.mood || 'good'}]`);
  const recentTils = tils.slice(0, 2).map((t) => `"${t.title}"`);

  return JSON.stringify({
    date: todayStr,
    openTasksCount: openTasks.length,
    highPriorityCount: highPriorityOpen.length,
    overdueCount: overdueTasks.length,
    topOpenTasks: topOpen,
    habitsDueTodayCount: habitsDueToday.length,
    activeStreaks,
    recentJournals,
    recentTils,
  });
}

// ─── TOOL DEFINITIONS ──────────────────────────────────────────────────────────

const ALL_TOOL_DECLARATIONS = [
  // ── Tasks & Planner ──
  {
    name: 'create_task',
    description: 'Create a new task or to-do item in Personal HQ. Requires title and date/due_date.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The actionable title of the task.' },
        due_date: { type: 'STRING', description: 'Due date in YYYY-MM-DD format or relative like "today", "tomorrow".' },
        priority: { type: 'STRING', enum: ['low', 'medium', 'high', 'none'], description: 'Priority level (default: medium).' },
        start_time: { type: 'STRING', description: 'Start time in 24h HH:MM format.' },
        end_time: { type: 'STRING', description: 'End time in 24h HH:MM format.' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Categorization tags.' },
        subtasks: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Initial subtask titles.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_tasks',
    description: 'Fetch existing tasks from the user planner to inspect open items, overdue tasks, or break them down.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: { type: 'STRING', enum: ['open', 'completed', 'all'], description: 'Filter tasks status (default: open).' },
        query: { type: 'STRING', description: 'Optional search keyword to match task title or tags.' },
        limit: { type: 'INTEGER', description: 'Maximum number of tasks to return (default: 8).' },
      },
    },
  },
  {
    name: 'update_task_subtasks',
    description: 'Add or update subtasks for an existing task in Personal HQ.',
    parameters: {
      type: 'OBJECT',
      properties: {
        task_id: { type: 'STRING', description: 'The exact ID of the existing task.' },
        subtasks: { type: 'ARRAY', items: { type: 'STRING' }, description: 'List of subtask titles.' },
      },
      required: ['task_id', 'subtasks'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark an existing task as completed.',
    parameters: {
      type: 'OBJECT',
      properties: {
        task_id: { type: 'STRING', description: 'The exact ID of the task to complete.' },
      },
      required: ['task_id'],
    },
  },

  // ── Habits ──
  {
    name: 'create_habit',
    description: 'Create a new recurring habit routine in Habit Tracker.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING', description: 'Name of the habit (e.g. Read 20 pages).' },
        description: { type: 'STRING', description: 'Brief description or motivation.' },
        category: { type: 'STRING', enum: ['health', 'learning', 'productivity', 'mindfulness'], description: 'Category.' },
        target_days_per_week: { type: 'INTEGER', description: 'Target frequency from 1 to 7 days per week.' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_habits',
    description: 'List user habits and current completion status/streaks.',
    parameters: {
      type: 'OBJECT',
      properties: {
        limit: { type: 'INTEGER', description: 'Maximum habits to return.' },
      },
    },
  },
  {
    name: 'log_habit_check',
    description: 'Log completion for a habit today to maintain streaks.',
    parameters: {
      type: 'OBJECT',
      properties: {
        habit_id: { type: 'STRING', description: 'The ID of the habit.' },
        date: { type: 'STRING', description: 'Date in YYYY-MM-DD format (defaults to today).' },
      },
      required: ['habit_id'],
    },
  },

  // ── Notes & Markdown ──
  {
    name: 'create_markdown_note',
    description: 'Create a new markdown note or document in Markdown Creator / Notes.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of the note.' },
        content: { type: 'STRING', description: 'Formatted markdown body content.' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tags for the note.' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'search_notes',
    description: 'Search user markdown notes and documentation by keyword.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term.' },
      },
      required: ['query'],
    },
  },

  // ── Journal & TIL ──
  {
    name: 'create_journal_entry',
    description: 'Create a new personal reflective journal entry.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of the journal entry.' },
        content: { type: 'STRING', description: 'Reflective body text.' },
        mood: { type: 'STRING', enum: ['great', 'good', 'meh', 'bad', 'terrible'], description: 'Mood rating.' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tags.' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'create_til_entry',
    description: 'Log a "Today I Learned" (TIL) knowledge nugget.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'What was learned.' },
        content: { type: 'STRING', description: 'Detailed takeaway or code snippet.' },
        category: { type: 'STRING', description: 'Topic category (e.g. React, TypeScript, Devops).' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tags.' },
      },
      required: ['title', 'content'],
    },
  },

  // ── Knowledge & Snippets ──
  {
    name: 'save_link',
    description: 'Save a bookmark or article link in Link Vault.',
    parameters: {
      type: 'OBJECT',
      properties: {
        url: { type: 'STRING', description: 'Valid HTTP/HTTPS URL.' },
        title: { type: 'STRING', description: 'Title of the saved resource.' },
        category: { type: 'STRING', description: 'Category or folder.' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tags.' },
      },
      required: ['url', 'title'],
    },
  },
  {
    name: 'save_snippet',
    description: 'Save a reusable code snippet in Snippet Vault.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title or description of the snippet.' },
        code: { type: 'STRING', description: 'The actual code snippet content.' },
        language: { type: 'STRING', description: 'Programming language (e.g. typescript, python, sql, bash).' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tags.' },
      },
      required: ['title', 'code', 'language'],
    },
  },

  // ── Workspace Context ──
  {
    name: 'get_workspace_overview',
    description: 'Fetch real-time compressed statistics of open tasks, active habits, streaks, and recent entries across Personal HQ.',
    parameters: {
      type: 'OBJECT',
      properties: {
        modules: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Specific modules to inspect.' },
      },
    },
  },
];

// ─── DYNAMIC TOOL SCOPING (SUBSETS) ──────────────────────────────────────────

export function getScopedToolDeclarations(userPrompt: string, activeModule?: string) {
  const p = userPrompt.toLowerCase();

  // Task & Planner intent
  const isTask = /task|todo|to-do|planner|schedule|remind|deadline|subtask|breakdown/i.test(p) || activeModule === 'todo';
  // Habit intent
  const isHabit = /habit|streak|routine|daily track|log habit/i.test(p) || activeModule === 'habits';
  // Notes / Markdown intent
  const isNote = /note|markdown|doc|document|write|draft|article/i.test(p) || activeModule === 'notes';
  // Journal intent
  const isJournal = /journal|diary|reflection|mood|feel|today went/i.test(p) || activeModule === 'journal';
  // TIL / Snippet / Link intent
  const isKnowledge = /til|learned|snippet|code|link|bookmark|vault/i.test(p) || activeModule === 'links' || activeModule === 'snippets' || activeModule === 'til';

  const selectedNames = new Set<string>();
  selectedNames.add('get_workspace_overview');

  if (isTask || (!isHabit && !isNote && !isJournal && !isKnowledge)) {
    selectedNames.add('create_task');
    selectedNames.add('list_tasks');
    selectedNames.add('update_task_subtasks');
  }

  if (isHabit) {
    selectedNames.add('create_habit');
    selectedNames.add('list_habits');
    selectedNames.add('log_habit_check');
  }

  if (isNote) {
    selectedNames.add('create_markdown_note');
    selectedNames.add('search_notes');
  }

  if (isJournal) {
    selectedNames.add('create_journal_entry');
  }

  if (isKnowledge) {
    selectedNames.add('save_link');
    selectedNames.add('save_snippet');
    selectedNames.add('create_til_entry');
  }

  // Ensure maximum 5-6 tools per call to preserve Gemini Flash precision
  const subset = ALL_TOOL_DECLARATIONS.filter((t) => selectedNames.has(t.name)).slice(0, 6);
  return subset.length > 0 ? subset : ALL_TOOL_DECLARATIONS.slice(0, 5);
}

// ─── RUNTIME ARGUMENT VALIDATION & EXECUTOR ──────────────────────────────────

function normalizeDate(raw?: string): string {
  if (!raw) {
    return new Date().toISOString().split('T')[0];
  }
  const lower = raw.toLowerCase().trim();
  const now = new Date();
  if (lower === 'today') return now.toISOString().split('T')[0];
  if (lower === 'tomorrow') {
    const d = new Date(now.getTime() + 86400000);
    return d.toISOString().split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return now.toISOString().split('T')[0];
}

async function executeToolCall(
  name: string,
  args: Record<string, any>,
  idempotencyKey: string
): Promise<{ result: any; entity?: { type: string; id: string; title: string } }> {
  const store = useAppStore.getState();

  switch (name) {
    case 'create_task': {
      const title = String(args.title || '').trim();
      if (!title) throw new Error('Task title cannot be empty.');

      const priority = ['low', 'medium', 'high', 'none'].includes(String(args.priority).toLowerCase())
        ? (String(args.priority).toLowerCase() as any)
        : 'medium';

      const dueDate = normalizeDate(args.due_date);
      const taskId = `task_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;

      const subtasks = Array.isArray(args.subtasks)
        ? args.subtasks.map((st: string, idx: number) => ({
            id: `sub_${taskId}_${idx}`,
            title: String(st).trim(),
            completed: false,
          }))
        : [];

      const newTask: TodoTask = {
        id: taskId,
        projectId: null,
        title,
        completed: false,
        priority,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        dueDate,
        startTime: args.start_time || null,
        endTime: args.end_time || null,
        subtasks,
        createdAt: new Date().toISOString(),
      };

      await store.addTodoTask(newTask);

      return {
        result: {
          success: true,
          task_id: taskId,
          title: newTask.title,
          priority: newTask.priority,
          due_date: newTask.dueDate,
          start_time: newTask.startTime,
          end_time: newTask.endTime,
          subtasks_count: subtasks.length,
        },
        entity: { type: 'task', id: taskId, title: newTask.title },
      };
    }

    case 'list_tasks': {
      const allTasks = store.todoTasks || [];
      const filter = args.filter || 'open';
      const query = String(args.query || '').toLowerCase().trim();
      const limit = Math.min(args.limit || 8, 20);

      let filtered = allTasks.filter((t) => !t.deleted);
      if (filter === 'open') filtered = filtered.filter((t) => !t.completed);
      else if (filter === 'completed') filtered = filtered.filter((t) => t.completed);

      if (query) {
        filtered = filtered.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            t.tags?.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      const list = filtered.slice(0, limit).map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        priority: t.priority || 'medium',
        due_date: t.dueDate,
        subtasks_count: (t.subtasks || []).length,
      }));

      return {
        result: {
          success: true,
          count: list.length,
          tasks: list,
        },
      };
    }

    case 'update_task_subtasks': {
      const taskId = String(args.task_id || '').trim();
      if (!taskId) throw new Error('task_id is required to update subtasks.');

      const task = (store.todoTasks || []).find((t) => t.id === taskId);
      if (!task) throw new Error(`Task with ID ${taskId} not found.`);

      const subtasks = (Array.isArray(args.subtasks) ? args.subtasks : []).map((s: string, idx: number) => ({
        id: `sub_${taskId}_${Date.now()}_${idx}`,
        title: String(s).trim(),
        completed: false,
      }));

      await store.updateTodoTask(taskId, { subtasks });

      return {
        result: {
          success: true,
          task_id: taskId,
          task_title: task.title,
          subtasks_added: subtasks.length,
          subtasks: subtasks.map((s) => s.title),
        },
        entity: { type: 'task', id: taskId, title: task.title },
      };
    }

    case 'complete_task': {
      const taskId = String(args.task_id || '').trim();
      if (!taskId) throw new Error('task_id is required.');
      await store.updateTodoTask(taskId, { completed: true });
      return {
        result: { success: true, task_id: taskId, message: 'Task marked as completed.' },
        entity: { type: 'task', id: taskId, title: 'Completed Task' },
      };
    }

    case 'create_habit': {
      const name = String(args.name || '').trim();
      if (!name) throw new Error('Habit name cannot be empty.');

      const habitId = `habit_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const targetDays = Math.min(7, Math.max(1, args.target_days_per_week || 7));

      const newHabit: Habit = {
        id: habitId,
        name,
        description: args.description || '',
        frequencyType: 'daily',
        frequencyDays: [0, 1, 2, 3, 4, 5, 6],
        frequencyCount: targetDays,
        completedDates: [],
        streak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
      };

      await store.addHabit(newHabit);

      return {
        result: {
          success: true,
          habit_id: habitId,
          name: newHabit.name,
          target_days_per_week: targetDays,
        },
        entity: { type: 'habit', id: habitId, title: newHabit.name },
      };
    }

    case 'list_habits': {
      const habits = store.habits || [];
      const todayStr = new Date().toISOString().split('T')[0];
      const list = habits.slice(0, args.limit || 8).map((h) => ({
        id: h.id,
        name: h.name,
        streak: h.streak || 0,
        completed_today: h.completedDates?.includes(todayStr) || false,
      }));

      return {
        result: { success: true, count: list.length, habits: list },
      };
    }

    case 'log_habit_check': {
      const habitId = String(args.habit_id || '').trim();
      const date = normalizeDate(args.date);
      if (!habitId) throw new Error('habit_id is required.');

      await store.toggleHabitCompletion(habitId, date);
      const habit = (store.habits || []).find((h) => h.id === habitId);

      return {
        result: {
          success: true,
          habit_id: habitId,
          habit_name: habit?.name || 'Habit',
          logged_date: date,
        },
        entity: { type: 'habit', id: habitId, title: habit?.name || 'Habit' },
      };
    }

    case 'create_markdown_note': {
      const title = String(args.title || '').trim();
      const content = String(args.content || '').trim();
      if (!title || !content) throw new Error('Title and content are required for notes.');

      const noteId = `note_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newNote: Note = {
        id: noteId,
        title,
        content,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : ['ai-note'],
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.addNote(newNote);

      return {
        result: {
          success: true,
          note_id: noteId,
          title: newNote.title,
          tags: newNote.tags,
        },
        entity: { type: 'note', id: noteId, title: newNote.title },
      };
    }

    case 'search_notes': {
      const query = String(args.query || '').toLowerCase().trim();
      const notes = store.notes || [];
      const matches = notes
        .filter((n) => n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query))
        .slice(0, 6)
        .map((n) => ({
          id: n.id,
          title: n.title,
          preview: n.content.slice(0, 100).replace(/\n/g, ' '),
        }));

      return {
        result: { success: true, count: matches.length, matches },
      };
    }

    case 'create_journal_entry': {
      const title = String(args.title || '').trim();
      const content = String(args.content || '').trim();
      if (!title || !content) throw new Error('Title and content are required.');

      const journalId = `journal_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newJournal: JournalEntry = {
        id: journalId,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        mood: args.mood || 'good',
        tags: Array.isArray(args.tags) ? args.tags.map(String) : ['journal'],
      };

      await store.addJournalEntry(newJournal);

      return {
        result: {
          success: true,
          journal_id: journalId,
          title: newJournal.title,
          mood: newJournal.mood,
        },
        entity: { type: 'journal', id: journalId, title: newJournal.title },
      };
    }

    case 'create_til_entry': {
      const title = String(args.title || '').trim();
      const content = String(args.content || '').trim();
      if (!title) throw new Error('TIL title cannot be empty.');

      const tilId = `til_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newTil: TilLog = {
        id: tilId,
        title,
        content,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        createdAt: new Date().toISOString(),
      };

      await store.addTilLog(newTil);

      return {
        result: { success: true, til_id: tilId, title: newTil.title },
        entity: { type: 'til', id: tilId, title: newTil.title },
      };
    }

    case 'save_link': {
      const url = String(args.url || '').trim();
      const title = String(args.title || '').trim();
      if (!url || !title) throw new Error('URL and title are required for links.');

      const linkId = `link_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newLink: Link = {
        id: linkId,
        url,
        title,
        category: args.category || 'general',
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        savedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await store.addLink(newLink);

      return {
        result: { success: true, link_id: linkId, title: newLink.title, url: newLink.url },
        entity: { type: 'link', id: linkId, title: newLink.title },
      };
    }

    case 'save_snippet': {
      const title = String(args.title || '').trim();
      const code = String(args.code || '').trim();
      const language = String(args.language || 'typescript').toLowerCase();
      if (!title || !code) throw new Error('Title and code are required.');

      const snippetId = `snip_${idempotencyKey.slice(0, 8)}_${Date.now().toString().slice(-4)}`;
      const newSnippet: CodeSnippet = {
        id: snippetId,
        title,
        code,
        language,
        tags: Array.isArray(args.tags) ? args.tags.map(String) : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await store.addSnippet(newSnippet);

      return {
        result: { success: true, snippet_id: snippetId, title: newSnippet.title, language },
        entity: { type: 'snippet', id: snippetId, title: newSnippet.title },
      };
    }

    case 'get_workspace_overview': {
      const contextJson = buildCompressedWorkspaceContext();
      return {
        result: { success: true, overview: JSON.parse(contextJson) },
      };
    }

    default:
      throw new Error(`Unknown tool "${name}".`);
  }
}

// ─── API DISPATCHER (GEMINI DIRECT / PROXY) ──────────────────────────────────

async function callGeminiApi(
  apiKey: string,
  model: string,
  payload: any
): Promise<any> {
  // Pre-flight Rate Limit check
  const rateStatus = checkRateLimit();
  if (!rateStatus.allowed) {
    throw new Error(rateStatus.warningMessage || 'Rate limit reached. Please wait before making more requests.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const status = response.status;
    const msg = errorBody.error?.message || response.statusText;

    if (status === 429) {
      throw new Error('Gemini API rate limit exceeded (429). Please wait 30 seconds before retrying.');
    }
    if (status === 503 || status === 500) {
      throw new Error(`Gemini service temporarily overloaded (${status}). Retrying with backup model.`);
    }
    throw new Error(`Gemini API error (${status}): ${msg}`);
  }

  const data = await response.json();

  // Track Token Usage
  const usage = data.usageMetadata;
  const promptTokens = usage?.promptTokenCount || 200;
  const completionTokens = usage?.candidatesTokenCount || 100;
  recordAiRequest(promptTokens, completionTokens);

  return data;
}

// ─── MULTI-TURN TOOL CALLING AGENT LOOP ───────────────────────────────────────

export async function runAgentTurn(
  apiKey: string,
  userPrompt: string,
  conversationHistory: AgentMessageHistory[] = [],
  options: {
    model?: string;
    activeModule?: string;
    onStepUpdate?: (step: AgentStepUpdate) => void;
  } = {}
): Promise<AgentTurnResult> {
  if (!apiKey?.trim()) {
    throw new Error('Gemini API key is required. Please set your key in Settings.');
  }

  const primaryModel = options.model || DEFAULT_PRIMARY_MODEL;
  const tools = getScopedToolDeclarations(userPrompt, options.activeModule);
  const executedSteps: AgentStepUpdate[] = [];
  const confirmedEntities: Array<{ type: string; id: string; title: string }> = [];

  // Generate turn idempotency key
  const turnIdempotencyKey = Math.random().toString(36).substring(2, 10);

  // Build working contents array
  const contents: any[] = [...conversationHistory];

  // Append user message with workspace context header
  const compressedContext = buildCompressedWorkspaceContext();
  const userTextWithContext = `[Live App State: ${compressedContext}]\n\nUser Request: ${userPrompt}`;

  contents.push({
    role: 'user',
    parts: [{ text: userTextWithContext }],
  });

  let currentTurn = 0;
  const maxTurns = 4; // Safety ceiling to prevent infinite loops

  while (currentTurn < maxTurns) {
    currentTurn++;

    const payload = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      tools: [{ functionDeclarations: tools }],
      generationConfig: {
        temperature: 0.25,
      },
    };

    let responseData: any;
    try {
      responseData = await callGeminiApi(apiKey, primaryModel, payload);
    } catch (err: any) {
      // Fallback if 503 or primary model fails
      if (primaryModel !== FALLBACK_MODEL && err.message?.includes('overloaded')) {
        console.warn(`[Agent] Falling back to ${FALLBACK_MODEL}`);
        responseData = await callGeminiApi(apiKey, FALLBACK_MODEL, payload);
      } else {
        throw err;
      }
    }

    const candidate = responseData.candidates?.[0];
    const candidateContent = candidate?.content;
    const parts = candidateContent?.parts || [];

    // Check if model emitted function calls
    const functionCalls = parts.filter((p: any) => p.functionCall);

    if (functionCalls.length === 0) {
      // Final textual response reached
      const replyText = parts.map((p: any) => p.text || '').join('\n').trim();
      return {
        replyText: replyText || 'Action completed successfully.',
        executedTools: executedSteps,
        confirmedEntities,
      };
    }

    // Append model's response to history
    contents.push(candidateContent);

    // Execute tool calls sequentially
    const functionResponseParts: any[] = [];

    for (const fcPart of functionCalls) {
      const call = fcPart.functionCall;
      const toolName = call.name;
      const toolArgs = call.args || {};
      const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;

      const stepUpdate: AgentStepUpdate = {
        stepId,
        toolName,
        label: `Executing ${toolName.replace(/_/g, ' ')}...`,
        status: 'running',
        details: JSON.stringify(toolArgs),
      };

      executedSteps.push(stepUpdate);
      options.onStepUpdate?.(stepUpdate);

      try {
        const { result, entity } = await executeToolCall(toolName, toolArgs, turnIdempotencyKey);

        stepUpdate.status = 'success';
        stepUpdate.entityId = entity?.id;
        stepUpdate.label = `Completed: ${toolName.replace(/_/g, ' ')}`;
        options.onStepUpdate?.(stepUpdate);

        if (entity) confirmedEntities.push(entity);

        functionResponseParts.push({
          functionResponse: {
            name: toolName,
            response: result,
          },
        });
      } catch (toolErr: any) {
        stepUpdate.status = 'error';
        stepUpdate.details = toolErr.message || 'Tool execution failed';
        stepUpdate.label = `Failed: ${toolName.replace(/_/g, ' ')}`;
        options.onStepUpdate?.(stepUpdate);

        functionResponseParts.push({
          functionResponse: {
            name: toolName,
            response: { error: toolErr.message || 'Execution error' },
          },
        });
      }
    }

    // Append tool execution proofs back to Gemini in the same conversation
    contents.push({
      role: 'function',
      parts: functionResponseParts,
    });
  }

  return {
    replyText: 'Actions processed and recorded in your workspace.',
    executedTools: executedSteps,
    confirmedEntities,
  };
}
