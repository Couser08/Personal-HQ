export function generateProductivitySeeds(
  adminId: string,
  iso: (offsetDays?: number, offsetHours?: number) => string,
  now: number,
  dayMs: number,
  tags: Array<{ name: string }>
) {
  const todoProjects = [
    { id: 'proj-1', user_id: adminId, name: 'Personal HQ OS', color: '#6366f1', icon: '🚀', created_at: iso(40) },
    { id: 'proj-2', user_id: adminId, name: 'Frontend Architecture', color: '#06b6d4', icon: '⚡', created_at: iso(35) },
    { id: 'proj-3', user_id: adminId, name: 'Fitness & Health', color: '#10b981', icon: '💪', created_at: iso(30) },
    { id: 'proj-4', user_id: adminId, name: 'Financial Freedom', color: '#f59e0b', icon: '📈', created_at: iso(25) },
    { id: 'proj-5', user_id: adminId, name: 'Learning & Books', color: '#ec4899', icon: '📚', created_at: iso(20) },
  ];

  const todoTasks = [
    {
      id: 'task-1',
      user_id: adminId,
      project_id: 'proj-1',
      title: 'Verify offline Mock Supabase client across all modules',
      completed: true,
      priority: 'urgent',
      tags: ['Architecture', 'DeepWork'],
      due_date: new Date(now + dayMs).toISOString().split('T')[0],
      subtasks: [
        { id: 'sub-1', title: 'Test CRUD on Notes & Journals', completed: true },
        { id: 'sub-2', title: 'Test Habit toggling and streak updates', completed: true },
        { id: 'sub-3', title: 'Test Media review adding & rating', completed: true },
      ],
      created_at: iso(2),
    },
    {
      id: 'task-2',
      user_id: adminId,
      project_id: 'proj-2',
      title: 'Audit Framer Motion layout transitions for 60fps',
      completed: false,
      priority: 'high',
      tags: ['React'],
      due_date: new Date(now + 2 * dayMs).toISOString().split('T')[0],
      subtasks: [
        { id: 'sub-4', title: 'Check modal backdrop blurs on mobile', completed: true },
        { id: 'sub-5', title: 'Verify will-change usage', completed: false },
      ],
      created_at: iso(3),
    },
    {
      id: 'task-3',
      user_id: adminId,
      project_id: 'proj-3',
      title: 'Run 5km interval training and log recovery metrics',
      completed: true,
      priority: 'medium',
      tags: ['Health'],
      due_date: new Date(now).toISOString().split('T')[0],
      created_at: iso(1),
    },
    {
      id: 'task-4',
      user_id: adminId,
      project_id: 'proj-4',
      title: 'Review monthly asset allocation & emergency fund balance',
      completed: false,
      priority: 'medium',
      tags: ['Finance'],
      due_date: new Date(now + 4 * dayMs).toISOString().split('T')[0],
      created_at: iso(4),
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `task-seed-${i + 5}`,
      user_id: adminId,
      project_id: todoProjects[i % todoProjects.length].id,
      title: `Scheduled Sprint Objective #${i + 5} — Review & Execute`,
      completed: i % 2 === 0,
      priority: (['urgent', 'high', 'medium', 'low'] as const)[i % 4],
      tags: [tags[i % tags.length]?.name || 'General'],
      due_date: new Date(now + (i - 3) * dayMs).toISOString().split('T')[0],
      subtasks: [
        { id: `sub-seed-${i}-1`, title: 'Prepare design spec', completed: true },
        { id: `sub-seed-${i}-2`, title: 'Perform verification check', completed: i % 2 === 0 },
      ],
      created_at: iso(10 + i),
    })),
  ];

  const habits = [
    {
      id: 'habit-1',
      user_id: adminId,
      title: 'Morning Deep Work Block (90m)',
      category: 'Productivity',
      frequency: 'daily',
      streak: 18,
      best_streak: 24,
      color: '#6366f1',
      icon: '⚡',
      logs: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        completed: true,
      })),
      created_at: iso(60),
    },
    {
      id: 'habit-2',
      user_id: adminId,
      title: '3 Liters Daily Hydration',
      category: 'Health',
      frequency: 'daily',
      streak: 22,
      best_streak: 30,
      color: '#06b6d4',
      icon: '💧',
      logs: Array.from({ length: 14 }, (_, i) => ({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        completed: true,
      })),
      created_at: iso(60),
    },
    {
      id: 'habit-3',
      user_id: adminId,
      title: 'Strength & Conditioning Workout',
      category: 'Fitness',
      frequency: 'daily',
      streak: 5,
      best_streak: 14,
      color: '#10b981',
      icon: '🏋️',
      logs: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        completed: i < 5,
      })),
      created_at: iso(45),
    },
    {
      id: 'habit-4',
      user_id: adminId,
      title: 'Read 20+ Pages of Non-Fiction',
      category: 'Learning',
      frequency: 'daily',
      streak: 12,
      best_streak: 15,
      color: '#ec4899',
      icon: '📖',
      logs: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        completed: true,
      })),
      created_at: iso(40),
    },
    {
      id: 'habit-5',
      user_id: adminId,
      title: 'Evening Digital Sunset & Journaling',
      category: 'Mindfulness',
      frequency: 'daily',
      streak: 9,
      best_streak: 21,
      color: '#f59e0b',
      icon: '🌙',
      logs: Array.from({ length: 10 }, (_, i) => ({
        date: new Date(now - i * dayMs).toISOString().split('T')[0],
        completed: true,
      })),
      created_at: iso(35),
    },
  ];

  const sprints = [
    { id: 'sp-1', user_id: adminId, title: 'Sprint 14: Mock Backend & Offline Testing', goal: 'Build in-app query simulator and zero egress dev mode', start_date: iso(7), end_date: iso(-7), status: 'ACTIVE' },
  ];

  const devGoals = [
    { id: 'dg-1', user_id: adminId, title: 'Achieve Sub-10ms App Interaction Latency', target_quarter: 'Q3 2026', progress: 85, completed: false, created_at: iso(20) },
  ];

  const mindmaps = [
    {
      id: 'mm-1',
      user_id: adminId,
      title: 'Personal HQ System Architecture',
      nodes: [
        { id: 'root', text: 'Personal HQ', x: 0, y: 0, color: '#6366f1', isRoot: true },
        { id: 'n-1', parentId: 'root', text: 'Local-First Core', x: 220, y: -80, color: '#06b6d4' },
        { id: 'n-2', parentId: 'root', text: 'Modules & UI Primitives', x: 220, y: 80, color: '#10b981' },
        { id: 'n-3', parentId: 'n-1', text: 'IndexedDB & Offline Parity', x: 440, y: -120, color: '#8b5cf6' },
        { id: 'n-4', parentId: 'n-1', text: 'Delta Sync Engine', x: 440, y: -40, color: '#3b82f6' },
      ],
      created_at: iso(15),
      updated_at: iso(2),
    },
  ];

  return { todoProjects, todoTasks, habits, sprints, devGoals, mindmaps };
}
