// ─── High-Fidelity Realistic Seed Dataset for Local Mock Database ──────────────

export function generateSeedData(): Record<string, any[]> {
  const adminId = 'usr_admin_mock_001';
  const now = Date.now();
  const dayMs = 86400000;

  const iso = (offsetDays = 0, offsetHours = 0) =>
    new Date(now - offsetDays * dayMs - offsetHours * 3600000).toISOString();

  // 1. Tags
  const tags = [
    { id: 'tag-1', user_id: adminId, name: 'DeepWork', color: '#6366f1', created_at: iso(60) },
    { id: 'tag-2', user_id: adminId, name: 'Architecture', color: '#06b6d4', created_at: iso(58) },
    { id: 'tag-3', user_id: adminId, name: 'React', color: '#3b82f6', created_at: iso(55) },
    { id: 'tag-4', user_id: adminId, name: 'Health', color: '#10b981', created_at: iso(50) },
    { id: 'tag-5', user_id: adminId, name: 'Finance', color: '#f59e0b', created_at: iso(48) },
    { id: 'tag-6', user_id: adminId, name: 'Books', color: '#ec4899', created_at: iso(45) },
    { id: 'tag-7', user_id: adminId, name: 'AI & ML', color: '#8b5cf6', created_at: iso(40) },
    { id: 'tag-8', user_id: adminId, name: 'HighPriority', color: '#ef4444', created_at: iso(35) },
  ];

  // 2. Notes
  const notes = [
    {
      id: 'note-01',
      user_id: adminId,
      title: 'Local-First Architecture Patterns & Offline Cache',
      content: `# Local-First Architecture Patterns\n\nBuilding resilient apps means treating local storage as the primary source of truth rather than a temporary cache.\n\n### Core Pillars:\n1. **Zero-Latency Interactions**: Writes succeed immediately in memory/IndexedDB.\n2. **Background Sync**: Deterministic sync engine with signature comparisons.\n3. **Graceful Degradation**: Real-time subscriptions only when connected.\n\n\`\`\`ts\n// Delta signature comparison\nconst isUpToDate = localUpdatedAt >= remoteUpdatedAt;\n\`\`\`\n\nNext steps: audit all module queries to enforce pagination.`,
      tags: ['Architecture', 'DeepWork', 'React'],
      pinned: true,
      created_at: iso(2),
      updated_at: iso(1),
    },
    {
      id: 'note-02',
      user_id: adminId,
      title: 'CSS Performance & Compositor-Only Transitions',
      content: `### Golden Rules for 60fps Web UI\n\n- Never animate \`width\`, \`height\`, \`top\`, \`margin\`, or \`padding\`.\n- Restrict micro-interactions to \`transform\` (translate, scale) and \`opacity\`.\n- Use \`will-change: transform\` sparingly on high-frequency gesture layers.\n- Avoid stacking multiple heavy \`backdrop-filter: blur()\` layers on low-power devices.`,
      tags: ['React', 'Architecture'],
      pinned: true,
      created_at: iso(5),
      updated_at: iso(4),
    },
    {
      id: 'note-03',
      user_id: adminId,
      title: 'Productivity Systems & Time Blocking Principles',
      content: `Key takeaways from *Deep Work* and *Atomic Habits*:\n\n- Group similar cognitive tasks into 90-minute ultradian cycles.\n- Shutdown ritual at 7:00 PM: close all dev tabs, review tomorrow's top 3 priority tasks.\n- Habit stacking: *After I brew morning espresso, I will write 100 words in the daily journal.*`,
      tags: ['DeepWork', 'Health'],
      pinned: false,
      created_at: iso(8),
      updated_at: iso(8),
    },
    {
      id: 'note-04',
      user_id: adminId,
      title: 'PostgreSQL Indexing & Optimization Notes',
      content: `When queries use \`.eq('user_id', uid).order('created_at', { ascending: false })\`, create a compound index:\n\n\`\`\`sql\nCREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);\n\`\`\`\n\nThis prevents expensive sequence scans on multi-tenant tables.`,
      tags: ['Architecture', 'Finance'],
      pinned: false,
      created_at: iso(12),
      updated_at: iso(12),
    },
    {
      id: 'note-05',
      user_id: adminId,
      title: 'System Design Checklist for Client Applications',
      content: `- [x] Optimistic UI updates with rollback on network rejection\n- [x] Command Palette with keyboard-first navigation\n- [x] Shared Design System tokens without per-file overrides\n- [ ] Exportable workspace backup snapshots`,
      tags: ['Architecture'],
      pinned: false,
      created_at: iso(15),
      updated_at: iso(15),
    },
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `note-seed-${i + 6}`,
      user_id: adminId,
      title: `Engineering Log #${i + 6} — Module Optimization`,
      content: `Detailed documentation on subsystem improvements, cache layers, and performance profiling for sprint iteration #${i + 6}.\n\n### Findings:\n- Memory footprint maintained below 50MB.\n- IndexedDB batch transaction read times average < 12ms.\n- Optimistic Zustand state reducers resolved in < 1ms.`,
      tags: ['Architecture', 'DeepWork'],
      pinned: false,
      created_at: iso(16 + i),
      updated_at: iso(16 + i),
    })),
  ];

  // 3. Journals
  const moods = ['Awesome', 'Good', 'Productive', 'Calm', 'Reflective'];
  const journals = [
    {
      id: 'journal-01',
      user_id: adminId,
      title: 'Architecting the In-App Mock Engine & Offline Parity',
      content: `Today made significant progress on designing a local-first mock Supabase client.\n\nBy matching the chainable PostgREST API with a fluent builder and IndexedDB persistence, we get instantaneous development iteration with 0 egress costs and 0 network flakiness. Tested the thenable promise pattern and verified query filtering logic.\n\nEnergy levels were high throughout the morning block. Afternoon focus stayed steady with 3 pomodoro intervals.`,
      date: new Date(now).toISOString().split('T')[0],
      mood: 'Awesome',
      tags: ['DeepWork', 'Architecture'],
      pinned: true,
      bookmarked: true,
      focus_list: [
        { id: 'f-1', text: 'Build MockQueryBuilder with filter support', completed: true },
        { id: 'f-2', text: 'Wire IndexedDB snapshot persistence', completed: true },
        { id: 'f-3', text: 'Verify admin QA ledger views', completed: true },
      ],
      reflection: {
        highlights: 'Finished offline mock architecture without altering consumer code.',
        improvements: 'Need to ensure sleep schedule remains consistent at 11 PM.',
      },
      images: [],
      created_at: iso(0, 2),
      updated_at: iso(0, 1),
    },
    {
      id: 'journal-02',
      user_id: adminId,
      title: 'Refining UI Polish and Motion Curves',
      content: `Spent time auditing all button interactions and modal transitions across modules.\n\nStandardized the spring stiffness to 350 and damping to 30. The app feels much more cohesive when modals share one unified backdrop and entering scale transition.`,
      date: new Date(now - dayMs).toISOString().split('T')[0],
      mood: 'Productive',
      tags: ['React', 'DeepWork'],
      pinned: false,
      bookmarked: true,
      focus_list: [
        { id: 'f-4', text: 'Unify modal backdrop animations', completed: true },
        { id: 'f-5', text: 'Test reduce-motion media query fallback', completed: true },
      ],
      reflection: {
        highlights: 'Animation curves feel tactile and responsive.',
        improvements: 'Hydrate more water during coding sprints.',
      },
      images: [],
      created_at: iso(1, 4),
      updated_at: iso(1, 2),
    },
    ...Array.from({ length: 23 }, (_, i) => ({
      id: `journal-seed-${i + 3}`,
      user_id: adminId,
      title: `Daily Reflection & Focus Log — Day -${i + 2}`,
      content: `Morning session dedicated to deep development work and review of ongoing tasks.\n\nMaintained high focus during deep work intervals. Finished planned deliverables, tracked nutritional goals, and did evening mobility stretching. Tomorrow will focus on module integrations and comprehensive testing.`,
      date: new Date(now - (i + 2) * dayMs).toISOString().split('T')[0],
      mood: moods[i % moods.length],
      tags: ['DeepWork', 'Health'],
      pinned: false,
      bookmarked: false,
      focus_list: [
        { id: `f-seed-${i}-1`, text: `Execute milestone focus item #${i + 1}`, completed: true },
        { id: `f-seed-${i}-2`, text: 'Read 20 pages of technical literature', completed: true },
      ],
      reflection: {
        highlights: `Maintained consistency and hit daily output targets on day -${i + 2}.`,
        improvements: 'Keep evening screen time limited.',
      },
      images: [],
      created_at: iso(i + 2, 8),
      updated_at: iso(i + 2, 2),
    })),
  ];

  // 4. Todo Projects & Tasks
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
      tags: [tags[i % tags.length].name],
      due_date: new Date(now + (i - 3) * dayMs).toISOString().split('T')[0],
      subtasks: [
        { id: `sub-seed-${i}-1`, title: 'Prepare design spec', completed: true },
        { id: `sub-seed-${i}-2`, title: 'Perform verification check', completed: i % 2 === 0 },
      ],
      created_at: iso(10 + i),
    })),
  ];

  // 5. Habits
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

  // 6. Links & Link Saver
  const links = [
    {
      id: 'link-1',
      user_id: adminId,
      url: 'https://react.dev',
      title: 'React Official Documentation & Hooks Reference',
      tags: ['React', 'Architecture'],
      type: 'documentation',
      term_type: 'long',
      saved_at: iso(10),
    },
    {
      id: 'link-2',
      user_id: adminId,
      url: 'https://tailwindcss.com/docs',
      title: 'Tailwind CSS Modern Styling Guide',
      tags: ['React'],
      type: 'tool',
      term_type: 'long',
      saved_at: iso(12),
    },
    {
      id: 'link-3',
      user_id: adminId,
      url: 'https://supabase.com/docs',
      title: 'Supabase Architecture & PostgREST Query Reference',
      tags: ['Architecture'],
      type: 'backend',
      term_type: 'long',
      saved_at: iso(15),
    },
    {
      id: 'link-4',
      user_id: adminId,
      url: 'https://motion.dev',
      title: 'Framer Motion Spring Physics Guide',
      tags: ['React'],
      type: 'animation',
      term_type: 'medium',
      saved_at: iso(18),
    },
    ...Array.from({ length: 12 }, (_, i) => ({
      id: `link-seed-${i + 5}`,
      user_id: adminId,
      url: `https://github.com/developer/reference-resource-${i + 1}`,
      title: `Technical Reference Guide #${i + 1} — Engineering Systems`,
      tags: ['Architecture', 'DeepWork'],
      type: 'resource',
      term_type: 'short',
      saved_at: iso(20 + i),
    })),
  ];

  const linkSaver = [
    {
      id: 'ls-1',
      user_id: adminId,
      url: 'https://news.ycombinator.com',
      title: 'Hacker News — Tech & Startup Discussions',
      type: 'article',
      saved_at: iso(1),
    },
    {
      id: 'ls-2',
      user_id: adminId,
      url: 'https://danluu.com',
      title: 'Dan Luu Systems Engineering Blog',
      type: 'blog',
      saved_at: iso(3),
    },
    {
      id: 'ls-3',
      user_id: adminId,
      url: 'https://overreacted.io',
      title: 'Overreacted — Dan Abramov Insights',
      type: 'blog',
      saved_at: iso(6),
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `ls-seed-${i + 4}`,
      user_id: adminId,
      url: `https://developer.mozilla.org/en-US/docs/Web/API/Item_${i + 1}`,
      title: `MDN Web Platform Specification Doc #${i + 1}`,
      type: 'doc',
      saved_at: iso(8 + i),
    })),
  ];

  // 7. Media Logs
  const mediaLogs = [
    {
      id: 'media-1',
      user_id: adminId,
      type: 'ANIME',
      title: 'Frieren: Beyond Journey’s End',
      status: 'COMPLETED',
      rating: 10,
      episodes: 28,
      notes: 'Masterpiece in pacing, melancholy, character growth, and atmosphere.',
      added_at: iso(20),
    },
    {
      id: 'media-2',
      user_id: adminId,
      type: 'ANIME',
      title: 'Steins;Gate',
      status: 'COMPLETED',
      rating: 10,
      episodes: 24,
      notes: 'Incredible sci-fi narrative with phenomenal character arcs and plot resolution.',
      added_at: iso(25),
    },
    {
      id: 'media-3',
      user_id: adminId,
      type: 'GAME',
      title: 'Elden Ring',
      status: 'COMPLETED',
      rating: 10,
      episodes: 120, // hours
      notes: 'World-class world design, exploration rewards, and combat depth.',
      added_at: iso(30),
    },
    {
      id: 'media-4',
      user_id: adminId,
      type: 'SERIES',
      title: 'Severance (Season 1)',
      status: 'COMPLETED',
      rating: 9,
      episodes: 9,
      notes: 'Remarkable cinematography, sterile aesthetic, and tension-building mystery.',
      added_at: iso(35),
    },
    {
      id: 'media-5',
      user_id: adminId,
      type: 'MOVIE',
      title: 'Oppenheimer',
      status: 'COMPLETED',
      rating: 9,
      episodes: 1,
      notes: 'Electrifying sound design and non-linear biographical pacing.',
      added_at: iso(40),
    },
    {
      id: 'media-6',
      user_id: adminId,
      type: 'ANIME',
      title: 'Chainsaw Man',
      status: 'COMPLETED',
      rating: 8,
      episodes: 12,
      notes: 'Dynamic animation direction and memorable soundtrack.',
      added_at: iso(45),
    },
    {
      id: 'media-7',
      user_id: adminId,
      type: 'GAME',
      title: 'Cyberpunk 2077: Phantom Liberty',
      status: 'COMPLETED',
      rating: 9,
      episodes: 65,
      notes: 'Stunning city design, incredible soundtrack, and emotional story.',
      added_at: iso(50),
    },
  ];

  // 8. Code Snippets
  const snippets = [
    {
      id: 'snip-1',
      user_id: adminId,
      title: 'PostgREST Thenable Fluent Query Builder Pattern',
      language: 'typescript',
      description: 'Enables seamless awaitable chaining identical to supabase-js client.',
      is_favorite: true,
      tags: ['TypeScript', 'Supabase', 'Architecture'],
      code: `class MockQueryBuilder<T> {\n  private filters: Array<(row: T) => boolean> = [];\n  private projection = '*';\n\n  select(cols: string) {\n    this.projection = cols;\n    return this;\n  }\n\n  eq(key: keyof T, val: any) {\n    this.filters.push(r => r[key] === val);\n    return this;\n  }\n\n  async _execute() {\n    let rows = store.get(this.table) || [];\n    rows = rows.filter(r => this.filters.every(f => f(r)));\n    return { data: rows, error: null };\n  }\n\n  then(resolve: any, reject: any) {\n    return this._execute().then(resolve, reject);\n  }\n}`,
      created_at: iso(10),
      updated_at: iso(5),
    },
    {
      id: 'snip-2',
      user_id: adminId,
      title: 'React Custom Hook: useDebouncedValue',
      language: 'typescript',
      description: 'Debounces rapid value changes to prevent unneeded API re-fetches.',
      is_favorite: true,
      tags: ['React', 'Hooks'],
      code: `import { useState, useEffect } from 'react';\n\nexport function useDebouncedValue<T>(value: T, delayMs = 300): T {\n  const [debounced, setDebounced] = useState<T>(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delayMs);\n    return () => clearTimeout(timer);\n  }, [value, delayMs]);\n\n  return debounced;\n}`,
      created_at: iso(15),
      updated_at: iso(15),
    },
    {
      id: 'snip-3',
      user_id: adminId,
      title: 'Fast Exponential Backoff Retry Utility',
      language: 'typescript',
      description: 'Robust async retry handler with jitter for resilient network requests.',
      is_favorite: false,
      tags: ['TypeScript', 'Utilities'],
      code: `export async function retryWithBackoff<T>(\n  fn: () => Promise<T>,\n  maxAttempts = 3,\n  baseDelayMs = 250\n): Promise<T> {\n  for (let attempt = 1; attempt <= maxAttempts; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (attempt === maxAttempts) throw err;\n      const jitter = Math.random() * 100;\n      const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n  throw new Error('Unreachable');\n}`,
      created_at: iso(20),
      updated_at: iso(20),
    },
  ];

  // 9. Bug Reports (High quality test data for Admin Command Center QA Ledger)
  const bugReports = [
    {
      id: 'bug-001',
      title: 'Journal autosave race condition on fast keystrokes',
      description: 'Rapid typing followed by an immediate navigation event could occasionally trigger an out-of-order state reconciliation.',
      status: 'verified_done',
      severity: 'High',
      category: 'UI/UX',
      route: '/journal',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '.journal-editor textarea', tag: 'TEXTAREA' },
      screenshot_data: null,
      verification_notes: 'Fixed by introducing Zustand synchronous buffer before debounce timer.',
      created_at: iso(8),
      updated_at: iso(2),
    },
    {
      id: 'bug-002',
      title: 'Habit checkbox toggle flicker on rapid tap',
      description: 'Double tapping the habit checkmark triggered multiple concurrent mutate calls causing animation jank.',
      status: 'fixed_pending_verification',
      severity: 'Medium',
      category: 'Performance',
      route: '/habits',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '.habit-checkbox-btn', tag: 'BUTTON' },
      screenshot_data: null,
      verification_notes: 'Added tactile lock and optimistic store reducer debounce.',
      created_at: iso(5),
      updated_at: iso(1),
    },
    {
      id: 'bug-003',
      title: 'Command Palette Cmd+K overlay backdrop opacity glitch',
      description: 'Modal backdrop occasionally did not cover full height when scrolling on Safari desktop.',
      status: 'open',
      severity: 'Low',
      category: 'Responsiveness',
      route: '/dashboard',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '[data-component="CommandPalette"]', tag: 'DIV' },
      screenshot_data: null,
      created_at: iso(3),
      updated_at: iso(3),
    },
    {
      id: 'bug-004',
      title: 'Media review modal rating star keyboard navigation focus ring',
      description: 'Tab key does not visibly outline the 10-star rating picker when navigating via keyboard only.',
      status: 'in_review',
      severity: 'Low',
      category: 'UI/UX',
      route: '/media',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '.rating-star-btn', tag: 'BUTTON' },
      screenshot_data: null,
      created_at: iso(4),
      updated_at: iso(2),
    },
    {
      id: 'bug-005',
      title: 'Code snippet copy button toast confirmation missing haptic feedback',
      description: 'Clicking copy on dark mode code blocks copies text correctly but lacks micro-interaction press feedback.',
      status: 'open',
      severity: 'Low',
      category: 'Motion',
      route: '/snippets',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '.snippet-copy-btn', tag: 'BUTTON' },
      screenshot_data: null,
      created_at: iso(6),
      updated_at: iso(6),
    },
    {
      id: 'bug-006',
      title: 'Admin asset upload WebP compression error handling on huge files',
      description: 'Uploading images over 25MB should show a user-friendly validation toast before compression step.',
      status: 'verified_done',
      severity: 'Medium',
      category: 'Behavior',
      route: '/admin',
      user_id: adminId,
      reporter: 'tungariyarahul08@gmail.com',
      user_email: 'tungariyarahul08@gmail.com',
      element_info: { selector: '.asset-uploader input', tag: 'INPUT' },
      screenshot_data: null,
      verification_notes: 'Added client-side size pre-check toast.',
      created_at: iso(10),
      updated_at: iso(4),
    },
  ];

  // 10. Financial Stocks & Interest
  const stocks = [
    { id: 'stk-1', user_id: adminId, ticker: 'AAPL', entry_price: 182.5, quantity: 15, action: 'BUY', notes: 'Core long term tech holding', date: iso(45) },
    { id: 'stk-2', user_id: adminId, ticker: 'NVDA', entry_price: 118.0, quantity: 25, action: 'BUY', notes: 'AI compute leader', date: iso(35) },
    { id: 'stk-3', user_id: adminId, ticker: 'MSFT', entry_price: 415.0, quantity: 10, action: 'BUY', notes: 'Cloud enterprise moat', date: iso(25) },
    { id: 'stk-4', user_id: adminId, ticker: 'GOOGL', entry_price: 165.0, quantity: 20, action: 'BUY', notes: 'Search + Gemini frontier models', date: iso(15) },
  ];

  const interestRecords = [
    {
      id: 'int-1',
      user_id: adminId,
      type: 'compound',
      principal: 25000,
      rate: 7.2,
      time: 5,
      time_unit: 'years',
      interest: 10392.5,
      total_amount: 35392.5,
      compound_frequency: 'annually',
      label: '5-Year Compound Growth Fund',
      calculated_at: iso(10),
    },
    {
      id: 'int-2',
      user_id: adminId,
      type: 'simple',
      principal: 10000,
      rate: 5.5,
      time: 2,
      time_unit: 'years',
      interest: 1100,
      total_amount: 11100,
      label: 'High Yield Savings Account',
      calculated_at: iso(20),
    },
  ];

  // 11. Countdowns
  const countdowns = [
    {
      id: 'cd-1',
      user_id: adminId,
      label: 'Personal HQ Production Release',
      target_date: new Date(now + 14 * dayMs).toISOString(),
      emoji: '🚀',
      color: '#6366f1',
      created_at: iso(5),
    },
    {
      id: 'cd-2',
      user_id: adminId,
      label: 'Marathon Race Day',
      target_date: new Date(now + 45 * dayMs).toISOString(),
      emoji: '🏃',
      color: '#10b981',
      created_at: iso(10),
    },
    {
      id: 'cd-3',
      user_id: adminId,
      label: 'Next Quarter OKR Review',
      target_date: new Date(now + 30 * dayMs).toISOString(),
      emoji: '🎯',
      color: '#f59e0b',
      created_at: iso(15),
    },
  ];

  // 12. Budget
  const budgetCategories = [
    { id: 'bcat-1', user_id: adminId, name: 'Housing & Utilities', budget: 1800, color: '#6366f1', icon: '🏠' },
    { id: 'bcat-2', user_id: adminId, name: 'Groceries & Nutrition', budget: 600, color: '#10b981', icon: '🥗' },
    { id: 'bcat-3', user_id: adminId, name: 'Technology & Subscriptions', budget: 250, color: '#06b6d4', icon: '💻' },
    { id: 'bcat-4', user_id: adminId, name: 'Leisure & Entertainment', budget: 350, color: '#ec4899', icon: '🍿' },
    { id: 'bcat-5', user_id: adminId, name: 'Investments & Savings', budget: 1500, color: '#f59e0b', icon: '📈' },
  ];

  const budgetTransactions = [
    { id: 'tx-1', user_id: adminId, category_id: 'bcat-1', amount: 1650, description: 'Monthly Apartment Rent', date: iso(2), type: 'expense', payment_method: 'online' },
    { id: 'tx-2', user_id: adminId, category_id: 'bcat-2', amount: 142.5, description: 'Organic Grocery Market', date: iso(3), type: 'expense', payment_method: 'card' },
    { id: 'tx-3', user_id: adminId, category_id: 'bcat-3', amount: 20, description: 'GitHub Copilot / Cloud subscription', date: iso(5), type: 'expense', payment_method: 'online' },
    { id: 'tx-4', user_id: adminId, category_id: 'bcat-5', amount: 1000, description: 'Index ETF Monthly DCA', date: iso(6), type: 'expense', payment_method: 'online' },
  ];

  // 13. Settings
  const userSettings = [
    {
      id: 'settings-1',
      user_id: adminId,
      theme: 'dark',
      accent_color: 'purple',
      countdown_template: 'gradient',
      animation_speed: 'normal',
      compact_mode: false,
      sound_enabled: true,
      initial_bank_balance: 14500,
      initial_cash_balance: 850,
      currency_symbol: '$',
      media_quote: 'Outdo your yesterday.',
      reduce_blur: false,
      reduce_animations: false,
      gemini_api_key: '',
      gemini_model: 'gemini-2.5-flash',
      ai_persona: 'Professional',
      created_at: iso(60),
      updated_at: iso(0),
    },
  ];

  // 14. Mindmap & Misc
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

  const standardCalculations = [
    { id: 'calc-1', user_id: adminId, expression: '1850 * 12 + 6500', result: '28700', calculated_at: iso(2) },
    { id: 'calc-2', user_id: adminId, expression: '(45000 * 0.08) / 12', result: '300', calculated_at: iso(5) },
  ];

  const sprints = [
    { id: 'sp-1', user_id: adminId, title: 'Sprint 14: Mock Backend & Offline Testing', goal: 'Build in-app query simulator and zero egress dev mode', start_date: iso(7), end_date: iso(-7), status: 'ACTIVE' },
  ];

  const dsaProblems = [
    { id: 'dsa-1', user_id: adminId, title: 'LRU Cache Design', difficulty: 'Medium', status: 'Solved', category: 'Design / Hash + DLL', link: 'https://leetcode.com', notes: 'Use doubly linked list + Map for O(1) get and put.' },
    { id: 'dsa-2', user_id: adminId, title: 'Trapping Rain Water', difficulty: 'Hard', status: 'Solved', category: 'Two Pointers', link: 'https://leetcode.com', notes: 'Two pointer approach maintains leftMax and rightMax bounds.' },
  ];

  const tilLogs = [
    { id: 'til-1', user_id: adminId, title: 'PostgREST Thenable Object Pattern', content: 'Implementing .then() on an object allows JavaScript to treat standard classes as native Promises in await expressions.', tags: ['TypeScript', 'Architecture'], created_at: iso(1) },
  ];

  const roadmaps = [
    { id: 'rm-1', user_id: adminId, title: 'Fullstack Systems Architect Roadmap', progress: 65, stages: ['Data Modeling', 'Local-First Sync', 'Distributed Queues', 'Observability'], created_at: iso(30) },
  ];

  const resources = [
    { id: 'res-1', user_id: adminId, title: 'Designing Data-Intensive Applications', type: 'Book', author: 'Martin Kleppmann', status: 'Completed', rating: 10, created_at: iso(40) },
  ];

  const devGoals = [
    { id: 'dg-1', user_id: adminId, title: 'Achieve Sub-10ms App Interaction Latency', target_quarter: 'Q3 2026', progress: 85, completed: false, created_at: iso(20) },
  ];

  const studyMaterials = [
    { id: 'sm-1', user_id: adminId, subject: 'Distributed Database Systems', title: 'Raft Consensus Protocol & Vector Clocks', notes: 'Leader election, log replication, safety invariants.', created_at: iso(12) },
  ];

  const exams = [
    { id: 'ex-1', user_id: adminId, title: 'Systems Design & Offline Architecture Exam', duration_minutes: 45, passing_score: 80, created_at: iso(10) },
  ];

  const examAttempts = [
    { id: 'ea-1', user_id: adminId, exam_id: 'ex-1', score: 95, passed: true, completed_at: iso(5) },
  ];

  const dailyReflections = [
    { id: 'dr-1', user_id: adminId, date: new Date(now).toISOString().split('T')[0], gratitude: 'Grateful for dedicated deep work time and clear focus.', learned: 'Simulated latency keeps UI loading skeletons honest.', target_tomorrow: 'Ship production quality mock client.', created_at: iso(0) },
  ];

  const visions = [
    { id: 'vis-1', user_id: adminId, title: 'Craft World-Class Digital Tools', timeframe: '5-Year Vision', description: 'Empower creators with fluid, local-first productivity software.', created_at: iso(50) },
  ];

  const visionBoards = [
    { id: 'vb-1', user_id: adminId, name: '2026 Milestone Map', created_at: iso(40) },
  ];

  const visionNodes = [
    { id: 'vn-1', user_id: adminId, board_id: 'vb-1', title: 'Product Launch', x: 100, y: 150, color: '#6366f1', created_at: iso(40) },
  ];

  const projectStructures = [
    { id: 'ps-1', user_id: adminId, name: 'Personal HQ Modular Codebase', tree: { name: 'src', children: [{ name: 'modules' }, { name: 'lib' }, { name: 'components' }] }, created_at: iso(30) },
  ];

  const journalStickyNotes = [
    { id: 'sn-1', user_id: adminId, title: 'Sprint Focus', content: 'Focus on high-leverage primitives first.', color: '#fef08a', x: 20, y: 40, date: iso(1) },
  ];

  return {
    notes,
    journals,
    links,
    link_saver: linkSaver,
    tags,
    stocks,
    interest_records: interestRecords,
    media_logs: mediaLogs,
    countdowns,
    snippets,
    budget_categories: budgetCategories,
    budget_transactions: budgetTransactions,
    todo_projects: todoProjects,
    todo_tasks: todoTasks,
    habits,
    user_settings: userSettings,
    bug_reports: bugReports,
    mindmaps,
    standard_calculations: standardCalculations,
    sprints,
    dsa_problems: dsaProblems,
    til_logs: tilLogs,
    roadmaps,
    resources,
    dev_goals: devGoals,
    study_materials: studyMaterials,
    exams,
    exam_attempts: examAttempts,
    daily_reflections: dailyReflections,
    visions,
    vision_boards: visionBoards,
    vision_nodes: visionNodes,
    project_structures: projectStructures,
    journal_sticky_notes: journalStickyNotes,
  };
}
