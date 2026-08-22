export const ALL_TOOL_DECLARATIONS = [
  // ── Tasks & Planner ──
  {
    name: 'create_task',
    description: 'Create a new task. Only title is required. Do NOT ask for optional fields unless user explicitly mentions them.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'The title of the task.' },
        due_date: { type: 'STRING', description: '(Optional) Due date in YYYY-MM-DD format.' },
        priority: { type: 'STRING', enum: ['low', 'medium', 'high', 'none'], description: '(Optional) Priority level.' },
        tags: { type: 'ARRAY', items: { type: 'STRING' }, description: '(Optional) Categorization tags.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'list_tasks',
    description: 'Fetch open tasks. Use this before suggesting a task breakdown.',
    parameters: {
      type: 'OBJECT',
      properties: {
        filter: { type: 'STRING', enum: ['open', 'completed', 'all'], description: '(Optional) Filter tasks (default: open).' },
        limit: { type: 'INTEGER', description: '(Optional) Maximum tasks to return (default: 8).' },
      },
    },
  },
  {
    name: 'update_task_subtasks',
    description: 'Add subtasks to an existing task.',
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
    description: 'Create a new habit routine. Only name is required.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING', description: 'Name of the habit (e.g. Read 20 pages).' },
        description: { type: 'STRING', description: '(Optional) Brief description.' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_habits',
    description: 'List user habits and streaks.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'log_habit_check',
    description: 'Log completion for a habit today.',
    parameters: {
      type: 'OBJECT',
      properties: {
        habit_id: { type: 'STRING', description: 'The ID of the habit.' },
      },
      required: ['habit_id'],
    },
  },

  // ── Notes & Markdown ──
  {
    name: 'create_markdown_note',
    description: 'Create a new markdown note. Title and content are required.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of the note.' },
        content: { type: 'STRING', description: 'Markdown body content.' },
      },
      required: ['title', 'content'],
    },
  },

  // ── Journal & TIL ──
  {
    name: 'create_journal_entry',
    description: 'Create a new journal entry. Title and content are required.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of the entry.' },
        content: { type: 'STRING', description: 'Body text.' },
        mood: { type: 'STRING', enum: ['great', 'good', 'meh', 'bad', 'terrible'], description: '(Optional) Mood rating.' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'create_til_entry',
    description: 'Log a "Today I Learned" knowledge nugget.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'What was learned.' },
        content: { type: 'STRING', description: 'Detailed takeaway.' },
      },
      required: ['title', 'content'],
    },
  },

  // ── Knowledge & Snippets ──
  {
    name: 'save_link',
    description: 'Save a bookmark link.',
    parameters: {
      type: 'OBJECT',
      properties: {
        url: { type: 'STRING', description: 'Valid URL.' },
        title: { type: 'STRING', description: 'Title of the resource.' },
      },
      required: ['url', 'title'],
    },
  },
  {
    name: 'save_snippet',
    description: 'Save a code snippet.',
    parameters: {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Title of snippet.' },
        code: { type: 'STRING', description: 'The actual code.' },
        language: { type: 'STRING', description: 'Programming language.' },
      },
      required: ['title', 'code', 'language'],
    },
  },
];

export function getScopedToolDeclarations(userPrompt: string, activeModule?: string) {
  const p = userPrompt.toLowerCase();
  
  const isTask = /task|todo|to-do|planner|schedule|remind|breakdown/.test(p) || activeModule === 'todo';
  const isHabit = /habit|streak|routine|daily/.test(p) || activeModule === 'habits';
  const isNote = /note|markdown|doc/.test(p) || activeModule === 'notes';
  const isJournal = /journal|diary|mood/.test(p) || activeModule === 'journal';
  const isKnowledge = /til|snippet|code|link|bookmark/.test(p) || ['links', 'snippets', 'til'].includes(activeModule || '');

  const selectedNames = new Set<string>();

  if (isTask || (!isHabit && !isNote && !isJournal && !isKnowledge)) {
    selectedNames.add('create_task');
    selectedNames.add('list_tasks');
    selectedNames.add('update_task_subtasks');
    selectedNames.add('complete_task');
  }

  if (isHabit) {
    selectedNames.add('create_habit');
    selectedNames.add('list_habits');
    selectedNames.add('log_habit_check');
  }

  if (isNote) {
    selectedNames.add('create_markdown_note');
  }

  if (isJournal) {
    selectedNames.add('create_journal_entry');
  }

  if (isKnowledge) {
    selectedNames.add('save_link');
    selectedNames.add('save_snippet');
    selectedNames.add('create_til_entry');
  }

  const subset = ALL_TOOL_DECLARATIONS.filter(t => selectedNames.has(t.name)).slice(0, 5);
  return subset.length > 0 ? subset : ALL_TOOL_DECLARATIONS.slice(0, 4);
}
