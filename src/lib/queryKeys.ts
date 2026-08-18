/**
 * Centralized Query Keys Factory for Personal HQ.
 * Adheres to rule: query keys MUST include the actual parameters and user ID
 * so different filters/pages cache independently without collision.
 */

export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
  },
  settings: (userId: string | undefined) => ['settings', userId ?? 'anonymous'] as const,
  
  todos: {
    all: (userId: string | undefined) => ['todos', userId ?? 'anonymous'] as const,
    projects: (userId: string | undefined) => ['todos', 'projects', userId ?? 'anonymous'] as const,
    tasks: (userId: string | undefined, filters?: Record<string, any>) =>
      ['todos', 'tasks', userId ?? 'anonymous', filters ?? {}] as const,
  },
  
  habits: {
    all: (userId: string | undefined) => ['habits', userId ?? 'anonymous'] as const,
    reflections: (userId: string | undefined, date?: string) =>
      ['habits', 'reflections', userId ?? 'anonymous', date ?? 'all'] as const,
  },
  
  journals: {
    all: (userId: string | undefined, filters?: Record<string, any>) =>
      ['journals', userId ?? 'anonymous', filters ?? {}] as const,
    stickyNotes: (userId: string | undefined) =>
      ['journals', 'stickyNotes', userId ?? 'anonymous'] as const,
  },
  
  links: {
    all: (userId: string | undefined, filters?: Record<string, any>) =>
      ['links', userId ?? 'anonymous', filters ?? {}] as const,
    saved: (userId: string | undefined) =>
      ['links', 'saved', userId ?? 'anonymous'] as const,
  },
  
  tags: {
    all: (userId: string | undefined) => ['tags', userId ?? 'anonymous'] as const,
  },
  
  media: {
    all: (userId: string | undefined, tab?: string) =>
      ['media', userId ?? 'anonymous', tab ?? 'all'] as const,
  },
  
  vision: {
    boards: (userId: string | undefined) => ['vision', 'boards', userId ?? 'anonymous'] as const,
    visions: (userId: string | undefined) => ['vision', 'visions', userId ?? 'anonymous'] as const,
  },
  
  books: {
    all: () => ['books'] as const,
  },
  
  snippets: {
    all: (userId: string | undefined, filters?: Record<string, any>) =>
      ['snippets', userId ?? 'anonymous', filters ?? {}] as const,
  },
  
  study: {
    materials: (userId: string | undefined) => ['study', 'materials', userId ?? 'anonymous'] as const,
    exams: (userId: string | undefined) => ['study', 'exams', userId ?? 'anonymous'] as const,
    attempts: (userId: string | undefined, examId?: string) =>
      ['study', 'attempts', userId ?? 'anonymous', examId ?? 'all'] as const,
  },
  
  til: {
    all: (userId: string | undefined) => ['til', userId ?? 'anonymous'] as const,
  },
  
  roadmaps: {
    all: (userId: string | undefined) => ['roadmaps', userId ?? 'anonymous'] as const,
  },
  
  resources: {
    all: (userId: string | undefined) => ['resources', userId ?? 'anonymous'] as const,
  },
  
  devGoals: {
    all: (userId: string | undefined) => ['devGoals', userId ?? 'anonymous'] as const,
  },
  
  mindmaps: {
    all: (userId: string | undefined) => ['mindmaps', userId ?? 'anonymous'] as const,
  },
  
  notes: {
    all: (userId: string | undefined) => ['notes', userId ?? 'anonymous'] as const,
  },
  
  countdowns: {
    all: (userId: string | undefined) => ['countdowns', userId ?? 'anonymous'] as const,
  },
  
  stocks: {
    all: (userId: string | undefined) => ['stocks', userId ?? 'anonymous'] as const,
  },
  
  interest: {
    all: (userId: string | undefined) => ['interest', userId ?? 'anonymous'] as const,
  },
  
  standardCalc: {
    all: (userId: string | undefined) => ['standardCalc', userId ?? 'anonymous'] as const,
  },
  
  projectStructure: {
    all: (userId: string | undefined) => ['projectStructure', userId ?? 'anonymous'] as const,
  },
  
  admin: {
    bugReports: (filters?: { isAdmin?: boolean; userId?: string; status?: string }) =>
      ['admin', 'bugReports', filters ?? {}] as const,
  },
};
