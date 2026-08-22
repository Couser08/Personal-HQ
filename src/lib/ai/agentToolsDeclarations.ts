export const ALL_TOOL_DECLARATIONS = [
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
