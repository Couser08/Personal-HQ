import type { Note, Link, SavedLink, AppTag, StockEntry, InterestRecord, MediaLog, Countdown, CodeSnippet, StandardCalculation, PomodoroStats } from './utilities';
import type { TodoTask, TodoProject } from './todo';
import type { JournalEntry, JournalStickyNote } from './journal';
import type { Mindmap } from './mindmap';
import type { Habit, DailyReflection } from './habits';
import type { Sprint, DsaProblem, TilLog, LearningRoadmap, ResourceBookmark, DevGoal, StudyMaterial, Exam, ExamAttempt } from './study';
import type { Book } from './books';
import type { Vision, VisionBoard, VisionNode } from './vision';
import type { ProjectStructure, ProjectNode } from './projectStructure';

export type Theme = 'light' | 'dark' | 'system' | 'cyberpunk' | 'nordic' | 'sakura' | 'auraglass';
export type AccentColor = 'rose' | 'purple' | 'blue' | 'green' | 'amber' | 'teal' | 'gray';
export type CountdownTemplate = 'default' | 'minimal' | 'gradient' | 'circle' | 'event' | 'sale' | 'dark' | 'compact' | 'flip' | 'progress' | 'vertical' | 'split';
export type ClockStyle = 'digital' | 'flip' | 'analog' | 'minimal-ring';
export type PerformanceMode = 'performance' | 'balanced' | 'potato';

export interface AppSettings {
  countdownTemplate: CountdownTemplate;
  accentColor: AccentColor;
  animationSpeed: 'normal' | 'fast' | 'slow';
  compactMode: boolean;
  soundEnabled: boolean;
  initialBankBalance: number;
  initialCashBalance: number;
  currencySymbol?: string;
  mediaQuote?: string;
  clockStyle?: ClockStyle;
  performanceMode?: PerformanceMode;
  reduceBlur?: boolean;
  reduceAnimations?: boolean;
  wavyEffectEnabled?: boolean;
  wavyEffectMode?: 'minimal' | 'premium';
  todoCompletionAnimation?: string | boolean;
  devMotionOverride?: boolean;
  showFpsTelemetry?: boolean;
  geminiApiKey?: string;
  geminiModel?: string;
  aiPersona?: 'Professional' | 'Friendly/Coaching' | 'Strict';
}

export interface AppStore {
  activeModule: string;
  setActiveModule: (module: string) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;

  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;

  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirm: () => void;

  mediaEntryModal: {
    isOpen: boolean;
    editingLog: MediaLog | null;
    activeTab: 'ANIME' | 'MOVIE' | 'GAME' | 'SERIES';
  };
  openMediaEntryModal: (tab: 'ANIME' | 'MOVIE' | 'GAME' | 'SERIES', log?: MediaLog | null) => void;
  closeMediaEntryModal: () => void;

  todoProjectModal: {
    isOpen: boolean;
  };
  openTodoProjectModal: () => void;
  closeTodoProjectModal: () => void;

  todoTaskModal: {
    isOpen: boolean;
    task: TodoTask | null;
  };
  openTodoTaskModal: (task?: TodoTask | null) => void;
  closeTodoTaskModal: () => void;

  // Supabase sync
  dataLoaded: boolean;
  isSyncing: boolean;
  loadAllData: (userId: string) => Promise<void>;
  forceSync: (userId: string) => Promise<void>;
  clearAllData: () => void;

  notes: Note[];
  addNote: (note: Note, userId?: string) => Promise<void>;
  updateNote: (id: string, data: Partial<Note>, silent?: boolean) => Promise<void>;
  updateNoteLocally: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => Promise<void>;

  links: Link[];
  addLink: (link: Link, userId?: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  updateLink: (id: string, data: Partial<Link>) => Promise<void>;

  savedLinks: SavedLink[];
  addSavedLink: (link: SavedLink) => Promise<void>;
  deleteSavedLink: (id: string) => Promise<void>;

  appTags: AppTag[];
  addAppTag: (tag: AppTag) => Promise<void>;
  updateAppTag: (id: string, updates: Partial<Omit<AppTag, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAppTag: (id: string) => Promise<void>;

  stocks: StockEntry[];
  addStock: (entry: StockEntry, userId?: string) => Promise<void>;
  deleteStock: (id: string) => Promise<void>;

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
  skipGlobalPomodoro: () => void;

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
  
  // Journal Slice
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  fetchJournalDetail: (id: string) => Promise<void>;
  
  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: any) => Promise<void>;
  updateJournalStickyNote: (id: string, data: any) => Promise<void>;
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

  // Reflections state and actions
  dailyReflections: DailyReflection[];
  addDailyReflection: (ref: DailyReflection) => Promise<void>;
  updateDailyReflection?: (id: string, data: Partial<DailyReflection>) => Promise<void>;
  deleteDailyReflection?: (id: string) => Promise<void>;

  // Coder Hub / Projects State (Hydrated from DB)
  sprints?: Sprint[];
  dsaProblems?: DsaProblem[];
  tilLogs?: TilLog[];
  roadmaps?: LearningRoadmap[];
  resources?: ResourceBookmark[];
  devGoals?: DevGoal[];

  addTilLog: (log: TilLog) => void;
  deleteTilLog: (id: string) => void;

  activeFocusItem: { type: 'todo' | 'habit'; id: string; title: string } | null;
  setActiveFocusItem: (item: { type: 'todo' | 'habit'; id: string; title: string } | null) => void;

  // Books & Notebooks
  books: Book[];
  loadBooks: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;

  // Study & Exam Module
  studyMaterials: StudyMaterial[];
  exams: Exam[];
  examAttempts: ExamAttempt[];
  addStudyMaterial: (mat: StudyMaterial) => void;
  updateStudyMaterial: (id: string, updates: Partial<StudyMaterial>) => void;
  deleteStudyMaterial: (id: string) => void;
  addExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  addExamAttempt: (attempt: ExamAttempt) => void;
  deleteExamAttempt: (id: string) => void;

  // Vision Board
  visions: Vision[];
  visionBoards: VisionBoard[];
  activeBoardId: string;
  selectedNodeId: string | null;
  focusMode: boolean;
  canvasTheme: 'dots' | 'grid' | 'blank';
  canvasZoom: number;
  canvasPan: { x: number; y: number };
  activeTool: 'select' | 'pan' | 'create';

  createBoard: (board: Partial<VisionBoard>) => Promise<string>;
  updateBoard: (id: string, updates: Partial<VisionBoard>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  setActiveBoard: (id: string) => void;
  toggleFavoriteBoard: (id: string) => void;

  addVisionNode: (node: Partial<VisionNode>) => Promise<string>;
  updateVisionNode: (id: string, updates: Partial<VisionNode>) => Promise<void>;
  deleteVisionNode: (id: string) => Promise<void>;
  duplicateVisionNode: (id: string) => Promise<void>;
  updateVisionNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateVisionNodeSize: (id: string, size: { width: number; height: number }) => void;
  setSelectedNodeId: (id: string | null) => void;

  setFocusMode: (enabled: boolean) => void;
  setCanvasTheme: (theme: 'dots' | 'grid' | 'blank') => void;
  setCanvasZoom: (zoom: number | ((prev: number) => number)) => void;
  setCanvasPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setActiveTool: (tool: 'select' | 'pan' | 'create') => void;
  resetCanvasView: () => void;

  addVision: (vision: Vision, userId?: string) => Promise<void>;
  updateVision: (id: string, updates: Partial<Vision>) => Promise<void>;
  deleteVision: (id: string) => Promise<void>;
  updateVisionPosition: (id: string, position: { x: number; y: number }, rotation?: number) => Promise<void>;
  assignTaskToVision: (visionId: string, taskId: string) => Promise<void>;
  unassignTaskFromVision: (visionId: string, taskId: string) => Promise<void>;
  addVisionTask: (visionId: string, taskTitle: string, dueDate?: string, priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent') => Promise<void>;
  toggleVisionTask: (visionId: string, taskId: string) => Promise<void>;
  deleteVisionTask: (visionId: string, taskId: string) => Promise<void>;

  // Project Structures / Maintainer
  projectStructures: ProjectStructure[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  addProjectStructure: (project: ProjectStructure, userId?: string) => Promise<void>;
  updateProjectStructure: (id: string, data: Partial<ProjectStructure>) => Promise<void>;
  deleteProjectStructure: (id: string) => Promise<void>;
  addNodeToProject: (projectId: string, node: Partial<ProjectNode>) => void;
  updateNodeInProject: (projectId: string, nodeId: string, updates: Partial<ProjectNode>) => void;
  deleteNodeFromProject: (projectId: string, nodeId: string) => void;
  setProjectNodes: (projectId: string, nodes: ProjectNode[]) => void;
  applyTemplateToProject: (projectId: string, templateKey: string) => void;

  importData: (data: any) => void;
}
