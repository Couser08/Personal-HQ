import { useAppStore } from '../../store/useAppStore';

export const SYSTEM_PROMPT = `You are the Personal HQ AI Agent.
Role: A store/action layer for tasks, habits, notes, journals, links, and study exams.
Rules:
1. Never claim an action succeeded unless a tool call returned success.
2. Never invent data, IDs, or fake suggestions.
3. Keep answers extremely concise and scannable (no conversational filler).
4. Do NOT ask for optional fields. Only ask for required fields if genuinely missing.
5. For Excalidraw, output a structured text description of shapes/connectors, do NOT draw.
6. When breaking down a task, list open tasks first via list_tasks, wait for the user to pick one, then break it down.`;

export function buildDynamicContext(userPrompt: string, activeModule?: string): string {
  const state = useAppStore.getState();
  const dateStr = new Date().toISOString().split('T')[0];
  const p = userPrompt.toLowerCase();

  const isTask = /task|todo|to-do|planner|schedule|remind|breakdown/.test(p) || activeModule === 'todo';
  const isHabit = /habit|streak|routine|daily/.test(p) || activeModule === 'habits';
  const isNote = /note|markdown|doc/.test(p) || activeModule === 'notes';
  const isJournal = /journal|diary|mood/.test(p) || activeModule === 'journal';
  const isKnowledge = /til|snippet|code|link|bookmark/.test(p) || ['links', 'snippets', 'til'].includes(activeModule || '');

  const context: any = { date: dateStr, activeModule };

  if (isTask || (!isHabit && !isNote && !isJournal && !isKnowledge)) {
    const tasks = state.todoTasks || [];
    const openTasks = tasks.filter(t => !t.completed && !t.deleted);
    context.tasks = {
      openCount: openTasks.length,
      overdueCount: openTasks.filter(t => t.dueDate && t.dueDate < dateStr).length,
      topTasks: openTasks.slice(0, 5).map(t => ({ id: t.id, title: t.title, due: t.dueDate }))
    };
  }

  if (isHabit) {
    const habits = state.habits || [];
    context.habits = {
      activeCount: habits.length,
      dueTodayCount: habits.filter(h => !h.completedDates?.includes(dateStr)).length,
      topStreaks: habits.filter(h => (h.streak || 0) > 0).slice(0, 3).map(h => ({ name: h.name, streak: h.streak }))
    };
  }

  if (isJournal || isKnowledge) {
    const journals = state.journals || [];
    context.recentJournals = journals.slice(0, 2).map(j => j.title);
    const tils = state.tilLogs || [];
    context.recentTils = tils.slice(0, 2).map(t => t.title);
  }

  return JSON.stringify(context);
}
