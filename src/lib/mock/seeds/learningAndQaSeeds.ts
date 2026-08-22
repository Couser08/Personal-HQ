export function generateLearningAndQaSeeds(
  adminId: string,
  iso: (offsetDays?: number, offsetHours?: number) => string,
  now: number
) {
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

  return {
    bugReports,
    userSettings,
    dsaProblems,
    tilLogs,
    roadmaps,
    resources,
    studyMaterials,
    exams,
    examAttempts,
    dailyReflections,
    visions,
    visionBoards,
    visionNodes,
    projectStructures,
  };
}
