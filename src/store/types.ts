import { type JournalStickyNote } from '../lib/db';
export { type JournalStickyNote };

export type Theme = 'light' | 'dark' | 'system' | 'cyberpunk' | 'nordic' | 'sakura' | 'auraglass';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood: 'great' | 'good' | 'meh' | 'bad' | 'terrible';
  tags: string[];
  images: string[];
  pinned: boolean;
  reflection: {
    whatWentWell: string;
    whatCanBeBetter: string;
  };
  focusList: { text: string; checked: boolean }[];
  attachments: { name: string; size: string }[];
  pageStyle: 'default' | 'lines' | 'dotted' | 'grid' | 'cornell';
  location: string;
  reminder: string;
  stylePreset: 'calm' | 'warm' | 'evergreen' | 'ocean';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  url: string;
  title: string;
  tags: string[];
  savedAt: string;
}

export interface StockEntry {
  id: string;
  ticker: string;
  entryPrice: number;
  quantity: number;
  action: 'BUY' | 'SELL' | 'WATCHLIST';
  notes: string;
  date: string;
}

export interface TodoProject {
  id: string;
  name: string;
  color: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoTask {
  id: string;
  projectId: string | null;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'none';
  tags: string[];
  dueDate: string | null;
  startTime?: string | null;
  endTime?: string | null;
  pomodoroCount?: number;
  deleted?: boolean;
  createdAt: string;
  subtasks?: SubTask[];
}

export interface TopicNote {
  id: string;
  title: string;
  content: string;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export interface TopicResource {
  id: string;
  title: string;
  type: 'link' | 'pdf' | 'doc' | 'image' | 'video' | 'youtube';
  url: string;
  fileSize?: string;
  tags?: string[];
  uploadDate: string;
}

export interface TopicQuestion {
  id: string;
  question: string;
  answer?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'solved' | 'unsolved';
  repeated?: boolean;
}

export interface TopicFlashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
  nextReview?: string;
  revisionCount?: number;
}

export interface TopicTask {
  id: string;
  title: string;
  done: boolean;
}

export interface TopicAnalytics {
  timeSpent?: number;
  studySessions?: number;
}

export interface Topic {
  id: string;
  name: string;
  done: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  priority?: 'low' | 'medium' | 'high';
  timeSpent?: number;
  lastOpened?: string;
  description?: string;
  tags?: string[];
  notes?: TopicNote[];
  snippets?: TopicSnippet[];
  resources?: TopicResource[];
  questions?: TopicQuestion[];
  flashcards?: TopicFlashcard[];
  tasks?: TopicTask[];
  analytics?: TopicAnalytics;
  learningStreak?: number;
}

export interface SprintTask {
  id: string;
  title: string;
  description?: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high';
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  tags: string[];
}

export interface Sprint {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  tasks: SprintTask[];
  status: 'planned' | 'active' | 'completed';
}

export interface DsaProblem {
  id: string;
  title: string;
  platform: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  link?: string;
  status: 'solved' | 'review' | 'revision';
  notes?: string;
  solvedAt: string;
}

export interface TilLog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  completed: boolean;
  children?: string[];
}

export interface LearningRoadmap {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

export interface ResourceBookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  status: 'to_read' | 'reading' | 'completed';
  savedAt: string;
}

export interface DevGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  metric: string;
  dueDate: string;
  completed: boolean;
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
  semester: string;
}

export interface InterestRecord {
  id: string;
  type: 'SI' | 'CI';
  principal: number;
  rate: number;
  time: number;
  timeUnit: 'years' | 'months';
  interest: number;
  totalAmount: number;
  compoundFrequency?: 'annually' | 'semi-annually' | 'quarterly' | 'monthly';
  label: string;
  calculatedAt: string;
}

export interface MediaLog {
  id: string;
  type: 'ANIME' | 'GAME';
  title: string;
  status: 'WATCHING' | 'COMPLETED' | 'DROPPED' | 'PLANNING' | 'PLAYING' | 'FINISHED' | 'WISHLIST';
  rating: number | null;
  episodes?: number;
  season?: number;
  notes: string;
  addedAt: string;
}

export interface Countdown {
  id: string;
  label: string;
  targetDate: string;
  emoji: string;
  color: 'rose' | 'amber' | 'blue' | 'green' | 'purple';
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  color: 'rose' | 'blue' | 'green' | 'amber' | 'purple';
  icon: string;
}

export interface BudgetTransaction {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  paymentMethod?: 'cash' | 'online';
}

export interface CodeSnippet {
  id: string;
  title: string;
  description?: string;
  language: string;
  code: string;
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export interface MediaEntryModalState {
  isOpen: boolean;
  editingLog: MediaLog | null;
  activeTab: 'ANIME' | 'GAME';
}

export interface TodoTaskModalState {
  isOpen: boolean;
  task: TodoTask | null;
}

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'gray';
  isRoot?: boolean;
  parentId?: string;
  side?: 'left' | 'right' | 'bottom';
  collapsed?: boolean;
  icon?: string;
  notes?: string;
  linkUrl?: string;
  imageUrl?: string;
  images?: string[];
  pdfs?: { name: string; base64: string }[];
  links?: string[];
}

export interface MindmapLink {
  source: string;
  target: string;
}

export interface Mindmap {
  id: string;
  title: string;
  nodes: MindmapNode[];
  links: MindmapLink[];
  edgeStyle?: 'solid' | 'dashed' | 'dotted';
  createdAt: string;
  updatedAt?: string;
}

export interface StandardCalculation {
  id: string;
  expression: string;
  result: string;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  description: string;
  frequencyType: 'daily' | 'weekly_days' | 'weekly_count';
  frequencyDays: number[]; // 0 = Sunday, 6 = Saturday
  frequencyCount: number;
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  bestStreak: number;
  createdAt: string;
}

export type CountdownTemplate = 'default' | 'minimal' | 'gradient' | 'circle' | 'event' | 'sale' | 'dark' | 'compact' | 'flip' | 'progress' | 'vertical' | 'split';
export type ClockStyle = 'digital' | 'flip' | 'analog' | 'minimal-ring';
export type AccentColor = 'rose' | 'blue' | 'green' | 'amber' | 'purple' | 'teal' | 'gray';
export type AnimationSpeed = 'fast' | 'normal' | 'slow';

export interface AppSettings {
  countdownTemplate: CountdownTemplate;
  clockStyle?: ClockStyle;
  accentColor: AccentColor;
  animationSpeed: AnimationSpeed;
  compactMode: boolean;
  soundEnabled: boolean;
  initialBankBalance: number;
  initialCashBalance: number;
  currencySymbol?: string;
  mediaQuote?: string;
  reduceBlur: boolean;
  reduceAnimations: boolean;
  wavyEffectEnabled?: boolean;
  wavyEffectMode?: 'premium' | 'minimal';
  todoCompletionAnimation?: string;
}

export interface PomodoroStats {
  totalSessions: number;
  totalMinutes: number;
}

export interface AppStore {
  activeModule: string;
  setActiveModule: (module: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  confirmDialog: ConfirmDialogState;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;

  mediaEntryModal: MediaEntryModalState;
  openMediaEntryModal: (tab: 'ANIME' | 'GAME', log?: MediaLog) => void;
  closeMediaEntryModal: () => void;

  todoProjectModal: { isOpen: boolean };
  openTodoProjectModal: () => void;
  closeTodoProjectModal: () => void;

  todoTaskModal: TodoTaskModalState;
  openTodoTaskModal: (task?: TodoTask | null) => void;
  closeTodoTaskModal: () => void;

  // Supabase sync
  dataLoaded: boolean;
  loadAllData: (userId: string) => Promise<void>;
  clearAllData: () => void;

  notes: Note[];
  addNote: (note: Note, userId?: string) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>, silent?: boolean) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  links: Link[];
  addLink: (link: Link, userId?: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;

  stocks: StockEntry[];
  addStock: (entry: StockEntry, userId?: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

  subjects: Subject[];
  addSubject: (subject: Subject, userId?: string) => Promise<void>;
  addTopic: (subjectId: string, topic: Topic, userId?: string) => Promise<void>;
  toggleTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;
  updateTopic: (subjectId: string, topicId: string, data: Partial<Topic>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  deleteTopic: (subjectId: string, topicId: string, userId?: string) => Promise<void>;

  interestHistory: InterestRecord[];
  addInterestRecord: (record: InterestRecord, userId?: string) => Promise<void>;
  deleteInterestRecord: (id: string) => Promise<void>;

  mediaLogs: MediaLog[];
  addMediaLog: (log: MediaLog, userId?: string) => Promise<void>;
  updateMediaLog: (id: string, data: Partial<MediaLog>) => Promise<void>;
  deleteMediaLog: (id: string) => Promise<void>;

  countdowns: Countdown[];
  addCountdown: (countdown: Countdown, userId?: string) => Promise<void>;
  deleteCountdown: (id: string) => Promise<void>;

  snippets: CodeSnippet[];
  addSnippet: (snippet: CodeSnippet, userId?: string) => Promise<void>;
  updateSnippet: (id: string, data: Partial<CodeSnippet>) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;

  pomodoroStats: PomodoroStats;
  recordPomodoroSession: (minutes: number) => void;
  pomodoroSecondsLeft: number;
  pomodoroTotalSeconds: number;
  pomodoroTimerState: 'idle' | 'running' | 'paused';
  pomodoroSessionId: 'focus' | 'short-break' | 'long-break';
  pomodoroStreak: number;
  pomodoroAssociatedTaskId: string | null;
  pomodoroPipWindow: Window | null;
  pomodoroPipEnabled: boolean;
  setPomodoroSecondsLeft: (secs: number) => void;
  setPomodoroTotalSeconds: (secs: number) => void;
  setPomodoroTimerState: (state: 'idle' | 'running' | 'paused') => void;
  setPomodoroSessionId: (id: 'focus' | 'short-break' | 'long-break') => void;
  setPomodoroStreak: (streak: number) => void;
  setPomodoroAssociatedTaskId: (id: string | null) => void;
  setPomodoroPipWindow: (win: Window | null) => void;
  setPomodoroPipEnabled: (enabled: boolean) => void;
  startGlobalPomodoro: () => void;
  pauseGlobalPomodoro: () => void;
  resumeGlobalPomodoro: () => void;
  stopGlobalPomodoro: () => void;

  // Budget Tracker
  selectedCurrency: string;
  setSelectedCurrency: (currency: string) => void;
  budgetCategories: BudgetCategory[];
  budgetTransactions: BudgetTransaction[];
  addBudgetCategory: (category: BudgetCategory) => Promise<void>;
  updateBudgetCategory: (id: string, data: Partial<BudgetCategory>) => Promise<void>;
  deleteBudgetCategory: (id: string) => Promise<void>;
  addBudgetTransaction: (transaction: BudgetTransaction) => Promise<void>;
  deleteBudgetTransaction: (id: string) => Promise<void>;
  updateBudgetTransaction: (id: string, data: Partial<BudgetTransaction>) => Promise<void>;
  
  // To-Do
  todoTasks: TodoTask[];
  todoProjects: TodoProject[];
  addTodoTask: (task: TodoTask) => Promise<void>;
  updateTodoTask: (id: string, data: Partial<TodoTask>) => Promise<void>;
  deleteTodoTask: (id: string) => Promise<void>;
  restoreTodoTask: (id: string) => Promise<void>;
  emptyTodoTrash: () => Promise<void>;
  addTodoProject: (project: TodoProject) => Promise<void>;
  deleteTodoProject: (id: string) => Promise<void>;
  
  // Journal Tracker
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  
  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void>;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void>;
  deleteJournalStickyNote: (id: string) => Promise<void>;
  
  // Mindmap Creator
  mindmaps: Mindmap[];
  addMindmap: (mindmap: Mindmap) => Promise<void>;
  updateMindmap: (id: string, data: Partial<Mindmap>) => Promise<void>;
  deleteMindmap: (id: string) => Promise<void>;

  // Drawing Module
  drawingElements: readonly any[];
  drawingAppState: any;
  setDrawingData: (elements: readonly any[], appState: any) => void;

  // Standard Arithmetic Calculator
  standardHistory: StandardCalculation[];
  addStandardRecord: (record: StandardCalculation) => Promise<void>;
  clearStandardHistory: () => Promise<void>;
  
  // Habits state and actions
  habits: Habit[];
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (id: string, data: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (id: string, dateStr: string) => Promise<void>;

  // Coder Hub / Projects State
  sprints: Sprint[];
  dsaProblems: DsaProblem[];
  tilLogs: TilLog[];
  roadmaps: LearningRoadmap[];
  resources: ResourceBookmark[];
  devGoals: DevGoal[];

  // Coder Hub Actions
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, data: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  addSprintTask: (sprintId: string, task: SprintTask) => void;
  updateSprintTask: (sprintId: string, taskId: string, data: Partial<SprintTask>) => void;
  deleteSprintTask: (sprintId: string, taskId: string) => void;
  addDsaProblem: (prob: DsaProblem) => void;
  updateDsaProblem: (id: string, data: Partial<DsaProblem>) => void;
  deleteDsaProblem: (id: string) => void;
  addTilLog: (log: TilLog) => void;
  deleteTilLog: (id: string) => void;
  updateRoadmapNode: (roadmapId: string, nodeId: string, completed: boolean) => void;
  addRoadmap: (roadmap: LearningRoadmap) => void;
  deleteRoadmap: (id: string) => void;
  addResource: (res: ResourceBookmark) => void;
  updateResource: (id: string, data: Partial<ResourceBookmark>) => void;
  deleteResource: (id: string) => void;
  addDevGoal: (goal: DevGoal) => void;
  updateDevGoal: (id: string, data: Partial<DevGoal>) => void;
  deleteDevGoal: (id: string) => void;

  activeFocusItem: { type: 'todo' | 'habit'; id: string; title: string } | null;
  setActiveFocusItem: (item: { type: 'todo' | 'habit'; id: string; title: string } | null) => void;

  importData: (data: Partial<AppStore>) => void;
}
