// ─── High-Fidelity Realistic Seed Dataset for Local Mock Database ──────────────

import { generateContentSeeds } from './seeds/contentSeeds';
import { generateProductivitySeeds } from './seeds/productivitySeeds';
import { generateFinanceAndMediaSeeds } from './seeds/financeAndMediaSeeds';
import { generateLearningAndQaSeeds } from './seeds/learningAndQaSeeds';

export function generateSeedData(): Record<string, any[]> {
  const adminId = 'usr_admin_mock_001';
  const now = Date.now();
  const dayMs = 86400000;

  const iso = (offsetDays = 0, offsetHours = 0) =>
    new Date(now - offsetDays * dayMs - offsetHours * 3600000).toISOString();

  const content = generateContentSeeds(adminId, iso, now, dayMs);
  const productivity = generateProductivitySeeds(adminId, iso, now, dayMs, content.tags);
  const financeAndMedia = generateFinanceAndMediaSeeds(adminId, iso, now, dayMs);
  const learningAndQa = generateLearningAndQaSeeds(adminId, iso, now);

  return {
    notes: content.notes,
    journals: content.journals,
    links: content.links,
    link_saver: content.linkSaver,
    tags: content.tags,
    snippets: content.snippets,
    journal_sticky_notes: content.journalStickyNotes,

    todo_projects: productivity.todoProjects,
    todo_tasks: productivity.todoTasks,
    habits: productivity.habits,
    sprints: productivity.sprints,
    dev_goals: productivity.devGoals,
    mindmaps: productivity.mindmaps,

    media_logs: financeAndMedia.mediaLogs,
    stocks: financeAndMedia.stocks,
    interest_records: financeAndMedia.interestRecords,
    countdowns: financeAndMedia.countdowns,
    budget_categories: financeAndMedia.budgetCategories,
    budget_transactions: financeAndMedia.budgetTransactions,
    standard_calculations: financeAndMedia.standardCalculations,

    bug_reports: learningAndQa.bugReports,
    user_settings: learningAndQa.userSettings,
    dsa_problems: learningAndQa.dsaProblems,
    til_logs: learningAndQa.tilLogs,
    roadmaps: learningAndQa.roadmaps,
    resources: learningAndQa.resources,
    study_materials: learningAndQa.studyMaterials,
    exams: learningAndQa.exams,
    exam_attempts: learningAndQa.examAttempts,
    daily_reflections: learningAndQa.dailyReflections,
    visions: learningAndQa.visions,
    vision_boards: learningAndQa.visionBoards,
    vision_nodes: learningAndQa.visionNodes,
    project_structures: learningAndQa.projectStructures,
  };
}
