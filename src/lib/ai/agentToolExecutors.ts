import { useAppStore } from '../../store/useAppStore';
import { buildCompressedWorkspaceContext } from './agentSystemPrompt';
import type { TodoTask, Habit, Note, JournalEntry, Link, CodeSnippet, TilLog } from '../../store/types';

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

export async function executeToolCall(
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
