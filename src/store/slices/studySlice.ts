import { type StateCreator } from 'zustand';
import {
  type AppStore,
  type Subject,
  type Topic,
  type Sprint,
  type SprintTask,
  type DsaProblem,
  type TilLog,
  type LearningRoadmap,
  type ResourceBookmark,
  type DevGoal
} from '../types';
import {
  subjectService,
  sprintService,
  dsaProblemService,
  tilLogService,
  roadmapService,
  resourceService,
  devGoalService
} from '../../lib/db';
import { useAuthStore } from '../useAuthStore';
import { useToastStore } from '../useToastStore';
import { shouldThrottle, getStoreErrorMessage } from '../helpers';

export interface StudySlice {
  subjects: Subject[];
  addSubject: (subject: Subject, userId?: string) => Promise<void>;
  addTopic: (subjectId: string, topic: Topic, userId?: string) => Promise<void>;
  toggleTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;
  updateTopic: (subjectId: string, topicId: string, data: Partial<Topic>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;

  sprints: Sprint[];
  dsaProblems: DsaProblem[];
  tilLogs: TilLog[];
  roadmaps: LearningRoadmap[];
  resources: ResourceBookmark[];
  devGoals: DevGoal[];

  addSprint: (sprint: Sprint) => Promise<void>;
  updateSprint: (id: string, data: Partial<Sprint>) => Promise<void>;
  deleteSprint: (id: string) => Promise<void>;
  addSprintTask: (sprintId: string, task: SprintTask) => Promise<void>;
  updateSprintTask: (sprintId: string, taskId: string, data: Partial<SprintTask>) => Promise<void>;
  deleteSprintTask: (sprintId: string, taskId: string) => Promise<void>;
  addDsaProblem: (prob: DsaProblem) => Promise<void>;
  updateDsaProblem: (id: string, data: Partial<DsaProblem>) => Promise<void>;
  deleteDsaProblem: (id: string) => Promise<void>;
  addTilLog: (log: TilLog) => Promise<void>;
  deleteTilLog: (id: string) => Promise<void>;
  updateRoadmapNode: (roadmapId: string, nodeId: string, completed: boolean) => Promise<void>;
  addRoadmap: (roadmap: LearningRoadmap) => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  addResource: (res: ResourceBookmark) => Promise<void>;
  updateResource: (id: string, data: Partial<ResourceBookmark>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
  addDevGoal: (goal: DevGoal) => Promise<void>;
  updateDevGoal: (id: string, data: Partial<DevGoal>) => Promise<void>;
  deleteDevGoal: (id: string) => Promise<void>;

  activeFocusItem: { type: 'todo' | 'habit'; id: string; title: string } | null;
  setActiveFocusItem: (item: { type: 'todo' | 'habit'; id: string; title: string } | null) => void;
}

export const createStudySlice: StateCreator<
  AppStore,
  [],
  [],
  StudySlice
> = (set, get) => ({
  subjects: [],
  sprints: (() => {
    try {
      const stored = localStorage.getItem('phq_sprints');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      {
        id: 'sprint-1',
        title: 'Sprint 1: Core Redesign',
        startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
        status: 'active' as const,
        tasks: [
          { id: 't-1', title: 'Implement Command Palette', storyPoints: 5, priority: 'high' as const, status: 'in_progress' as const, tags: ['frontend'] },
          { id: 't-2', title: 'Design Dynamic Island notification pill', storyPoints: 3, priority: 'medium' as const, status: 'todo' as const, tags: ['design', 'animation'] },
          { id: 't-3', title: 'API Client & Regex matching utilities', storyPoints: 2, priority: 'low' as const, status: 'done' as const, tags: ['utilities'] },
          { id: 't-4', title: 'Setup database schema and stores', storyPoints: 3, priority: 'high' as const, status: 'done' as const, tags: ['backend'] }
        ]
      }
    ];
    localStorage.setItem('phq_sprints', JSON.stringify(initial));
    return initial;
  })(),

  dsaProblems: (() => {
    try {
      const stored = localStorage.getItem('phq_dsa_problems');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      { id: 'dsa-1', title: 'Two Sum', platform: 'LeetCode', difficulty: 'easy' as const, topic: 'Arrays', link: 'https://leetcode.com/problems/two-sum/', status: 'solved' as const, solvedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString() },
      { id: 'dsa-2', title: 'Reverse Linked List', platform: 'LeetCode', difficulty: 'easy' as const, topic: 'Linked List', link: 'https://leetcode.com/problems/reverse-linked-list/', status: 'solved' as const, solvedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: 'dsa-3', title: 'Longest Substring Without Repeating Characters', platform: 'LeetCode', difficulty: 'medium' as const, topic: 'String', link: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', status: 'review' as const, solvedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }
    ];
    localStorage.setItem('phq_dsa_problems', JSON.stringify(initial));
    return initial;
  })(),

  tilLogs: (() => {
    try {
      const stored = localStorage.getItem('phq_til_logs');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      { id: 'til-1', title: 'Zustand shallow comparison', content: 'Use useShallow from `zustand/react/shallow` to prevent unnecessary component re-renders when selecting multiple slices of store state.', tags: ['React', 'Zustand'], createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString() },
      { id: 'til-2', title: 'TypeScript const assertions', content: 'Using `as const` creates read-only literal types, which is extremely helpful when mapping variants or setting string configurations in Framer Motion.', tags: ['TypeScript'], createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString() }
    ];
    localStorage.setItem('phq_til_logs', JSON.stringify(initial));
    return initial;
  })(),

  roadmaps: (() => {
    try {
      const stored = localStorage.getItem('phq_roadmaps');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      {
        id: 'roadmap-frontend',
        title: 'React Frontend Developer',
        description: 'Master HTML, CSS, JavaScript, React, State Management, and Build Systems.',
        nodes: [
          { id: 'fe-1', label: 'HTML & CSS Foundations', completed: true },
          { id: 'fe-2', label: 'JavaScript & DOM Manipulation', completed: true },
          { id: 'fe-3', label: 'React Basics & Lifecycle', completed: true },
          { id: 'fe-4', label: 'Zustand & State Managers', completed: false },
          { id: 'fe-5', label: 'Tailwind CSS Layouts', completed: false },
          { id: 'fe-6', label: 'Next.js Routing & SSR', completed: false }
        ]
      },
      {
        id: 'roadmap-backend',
        title: 'Go Backend Systems Developer',
        description: 'Learn Go syntax, structs, concurrency models, servers, databases, and Docker.',
        nodes: [
          { id: 'be-1', label: 'Go Fundamentals & Pointers', completed: true },
          { id: 'be-2', label: 'Structs, Interfaces, & Methods', completed: false },
          { id: 'be-3', label: 'Goroutines & Channels Concurrency', completed: false },
          { id: 'be-4', label: 'Gin HTTP REST framework', completed: false },
          { id: 'be-5', label: 'PostgreSQL, SQL & Migrations', completed: false },
          { id: 'be-6', label: 'Dockerization & Cloud Deployments', completed: false }
        ]
      }
    ];
    localStorage.setItem('phq_roadmaps', JSON.stringify(initial));
    return initial;
  })(),

  resources: (() => {
    try {
      const stored = localStorage.getItem('phq_resources');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      { id: 'res-1', title: 'Zustand Documentation', url: 'https://docs.pmnd.rs/zustand/getting-started/introduction', description: 'Core guide for state management in React.', tags: ['React', 'Zustand'], status: 'reading' as const, savedAt: new Date().toISOString() },
      { id: 'res-2', title: 'Apple Human Interface Guidelines', url: 'https://developer.apple.com/design/human-interface-guidelines/', description: 'UI/UX best practices and components.', tags: ['Design'], status: 'to_read' as const, savedAt: new Date().toISOString() }
    ];
    localStorage.setItem('phq_resources', JSON.stringify(initial));
    return initial;
  })(),

  devGoals: (() => {
    try {
      const stored = localStorage.getItem('phq_dev_goals');
      if (stored) return JSON.parse(stored);
    } catch {}
    const initial = [
      { id: 'g-1', title: 'Complete 3 Sprints', target: 3, current: 1, metric: 'sprints', dueDate: new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString(), completed: false },
      { id: 'g-2', title: 'Solve 20 DSA Problems', target: 20, current: 2, metric: 'problems', dueDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(), completed: false },
      { id: 'g-3', title: 'Log 5 TIL Journal entries', target: 5, current: 2, metric: 'TILs', dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(), completed: false }
    ];
    localStorage.setItem('phq_dev_goals', JSON.stringify(initial));
    return initial;
  })(),

  activeFocusItem: (() => {
    try {
      const raw = localStorage.getItem('phq_active_focus_item');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })(),

  addSubject: async (subject) => {
    if (shouldThrottle('addSubject')) return;
    const uid = useAuthStore.getState().user?.id;
    if (!uid) return;
    const previous = get().subjects;
    set((state) => ({ subjects: [subject, ...state.subjects] }));
    try {
      await subjectService.create(uid, subject);
      useToastStore.getState().addToast('Success', 'Subject added', 'success');
    } catch (error) {
      set({ subjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not add subject'), 'error');
      throw error;
    }
  },
  addTopic: async (subjectId, topic) => {
    if (shouldThrottle(`addTopic-${subjectId}`)) return;
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId ? { ...s, topics: [...s.topics, topic] } : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
    useToastStore.getState().addToast('Success', 'Topic added', 'success');
  },
  toggleTopic: async (subjectId, topicId) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)) }
          : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
  },
  updateTopic: async (subjectId, topicId, data) => {
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? {
              ...s,
              topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...data } : t)),
            }
          : s
      ),
    }));
    const updated = get().subjects.find((s) => s.id === subjectId);
    if (updated) await subjectService.update(subjectId, { topics: updated.topics });
  },
  deleteSubject: async (id) => {
    const previous = get().subjects;
    set((state) => ({ subjects: state.subjects.filter((s) => s.id !== id) }));
    try {
      await subjectService.delete(id);
      useToastStore.getState().addToast('Success', 'Subject deleted', 'success');
    } catch (error) {
      set({ subjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete subject'), 'error');
      throw error;
    }
  },
  deleteTopic: async (subjectId, topicId) => {
    const previous = get().subjects;
    set((state) => ({
      subjects: state.subjects.map((s) =>
        s.id === subjectId
          ? { ...s, topics: s.topics.filter((t) => t.id !== topicId) }
          : s
      ),
    }));
    try {
      const updated = get().subjects.find((s) => s.id === subjectId);
      if (updated) await subjectService.update(subjectId, { topics: updated.topics });
      useToastStore.getState().addToast('Success', 'Topic deleted', 'success');
    } catch (error) {
      set({ subjects: previous });
      useToastStore.getState().addToast('Sync Failed', getStoreErrorMessage(error, 'Could not delete topic'), 'error');
      throw error;
    }
  },

  addSprint: async (sprint) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().sprints, sprint];
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    if (uid) {
      await sprintService.create(uid, sprint);
    }
  },
  updateSprint: async (id, data) => {
    const next = get().sprints.map(s => s.id === id ? { ...s, ...data } : s);
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    await sprintService.update(id, data);
  },
  deleteSprint: async (id) => {
    const next = get().sprints.filter(s => s.id !== id);
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    await sprintService.delete(id);
  },
  addSprintTask: async (sprintId, task) => {
    const next = get().sprints.map(s => s.id === sprintId ? { ...s, tasks: [...s.tasks, task] } : s);
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    const sprint = next.find(s => s.id === sprintId);
    if (sprint) {
      await sprintService.update(sprintId, { tasks: sprint.tasks });
    }
  },
  updateSprintTask: async (sprintId, taskId, data) => {
    const next = get().sprints.map(s => s.id === sprintId ? {
      ...s,
      tasks: s.tasks.map(t => t.id === taskId ? { ...t, ...data } : t)
    } : s);
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    const sprint = next.find(s => s.id === sprintId);
    if (sprint) {
      await sprintService.update(sprintId, { tasks: sprint.tasks });
    }
  },
  deleteSprintTask: async (sprintId, taskId) => {
    const next = get().sprints.map(s => s.id === sprintId ? {
      ...s,
      tasks: s.tasks.filter(t => t.id !== taskId)
    } : s);
    localStorage.setItem('phq_sprints', JSON.stringify(next));
    set({ sprints: next });
    const sprint = next.find(s => s.id === sprintId);
    if (sprint) {
      await sprintService.update(sprintId, { tasks: sprint.tasks });
    }
  },
  addDsaProblem: async (prob) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().dsaProblems, prob];
    localStorage.setItem('phq_dsa_problems', JSON.stringify(next));
    set({ dsaProblems: next });
    if (uid) {
      await dsaProblemService.create(uid, prob);
    }
  },
  updateDsaProblem: async (id, data) => {
    const next = get().dsaProblems.map(p => p.id === id ? { ...p, ...data } : p);
    localStorage.setItem('phq_dsa_problems', JSON.stringify(next));
    set({ dsaProblems: next });
    await dsaProblemService.update(id, data);
  },
  deleteDsaProblem: async (id) => {
    const next = get().dsaProblems.filter(p => p.id !== id);
    localStorage.setItem('phq_dsa_problems', JSON.stringify(next));
    set({ dsaProblems: next });
    await dsaProblemService.delete(id);
  },
  addTilLog: async (log) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().tilLogs, log];
    localStorage.setItem('phq_til_logs', JSON.stringify(next));
    set({ tilLogs: next });
    if (uid) {
      await tilLogService.create(uid, log);
    }
  },
  deleteTilLog: async (id) => {
    const next = get().tilLogs.filter(l => l.id !== id);
    localStorage.setItem('phq_til_logs', JSON.stringify(next));
    set({ tilLogs: next });
    await tilLogService.delete(id);
  },
  updateRoadmapNode: async (roadmapId, nodeId, completed) => {
    const next = get().roadmaps.map(r => r.id === roadmapId ? {
      ...r,
      nodes: r.nodes.map(n => n.id === nodeId ? { ...n, completed } : n)
    } : r);
    localStorage.setItem('phq_roadmaps', JSON.stringify(next));
    set({ roadmaps: next });
    const roadmap = next.find(r => r.id === roadmapId);
    if (roadmap) {
      await roadmapService.update(roadmapId, { nodes: roadmap.nodes });
    }
  },
  addRoadmap: async (roadmap) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().roadmaps, roadmap];
    localStorage.setItem('phq_roadmaps', JSON.stringify(next));
    set({ roadmaps: next });
    if (uid) {
      await roadmapService.create(uid, roadmap);
    }
  },
  deleteRoadmap: async (id) => {
    const next = get().roadmaps.filter(r => r.id !== id);
    localStorage.setItem('phq_roadmaps', JSON.stringify(next));
    set({ roadmaps: next });
    await roadmapService.delete(id);
  },
  addResource: async (res) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().resources, res];
    localStorage.setItem('phq_resources', JSON.stringify(next));
    set({ resources: next });
    if (uid) {
      await resourceService.create(uid, res);
    }
  },
  updateResource: async (id, data) => {
    const next = get().resources.map(r => r.id === id ? { ...r, ...data } : r);
    localStorage.setItem('phq_resources', JSON.stringify(next));
    set({ resources: next });
    await resourceService.update(id, data);
  },
  deleteResource: async (id) => {
    const next = get().resources.filter(r => r.id !== id);
    localStorage.setItem('phq_resources', JSON.stringify(next));
    set({ resources: next });
    await resourceService.delete(id);
  },
  addDevGoal: async (goal) => {
    const uid = useAuthStore.getState().user?.id;
    const next = [...get().devGoals, goal];
    localStorage.setItem('phq_dev_goals', JSON.stringify(next));
    set({ devGoals: next });
    if (uid) {
      await devGoalService.create(uid, goal);
    }
  },
  updateDevGoal: async (id, data) => {
    const next = get().devGoals.map(g => g.id === id ? { ...g, ...data } : g);
    localStorage.setItem('phq_dev_goals', JSON.stringify(next));
    set({ devGoals: next });
    await devGoalService.update(id, data);
  },
  deleteDevGoal: async (id) => {
    const next = get().devGoals.filter(g => g.id !== id);
    localStorage.setItem('phq_dev_goals', JSON.stringify(next));
    set({ devGoals: next });
    await devGoalService.delete(id);
  },

  setActiveFocusItem: (item) => {
    if (item) {
      localStorage.setItem('phq_active_focus_item', JSON.stringify(item));
    } else {
      localStorage.removeItem('phq_active_focus_item');
    }
    set({ activeFocusItem: item } as any);
  },
});
