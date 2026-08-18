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
  title: string;
  url: string;
  category?: string;
  tags?: string[];
  type?: string;
  termType?: string;
  savedAt?: string;
  createdAt?: string;
}

export interface SavedLink {
  id: string;
  title: string;
  url: string;
  category?: string;
  type?: string;
  tags?: string[];
  faviconUrl?: string;
  notes?: string;
  savedAt?: string;
  createdAt?: string;
}

export interface AppTag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

export interface StockEntry {
  id: string;
  ticker: string;
  name?: string;
  entryPrice?: number;
  buyPrice?: number;
  currentPrice?: number;
  shares?: number;
  quantity?: number;
  action?: 'BUY' | 'SELL';
  notes?: string;
  date?: string;
  createdAt?: string;
}

export interface InterestRecord {
  id: string;
  principal: number;
  rate: number;
  timeYears?: number;
  time?: number;
  timeUnit?: string;
  compoundingFrequency?: any;
  compoundFrequency?: any;
  type: 'simple' | 'compound' | 'SI' | 'CI';
  calculatedInterest?: number;
  interest?: number;
  totalAmount: number;
  label?: string;
  notes?: string;
  calculatedAt?: string;
  createdAt?: string;
}

export interface MediaLog {
  id: string;
  type: 'ANIME' | 'MOVIE' | 'GAME' | 'SERIES';
  title: string;
  originalTitle?: string;
  coverImage?: string;
  bannerImage?: string;
  rating?: number | null;
  status: 'WATCHING' | 'COMPLETED' | 'PLAN_TO_WATCH' | 'DROPPED' | 'PLAYING' | 'PAUSED' | 'PLANNING' | 'FINISHED' | 'WISHLIST';
  progress?: {
    current: number;
    total: number;
    unit: string;
  };
  review?: string;
  notes?: string;
  tags?: string[];
  genres?: string[];
  favoriteCharacters?: string[];
  quotes?: string[];
  startDate?: string;
  finishDate?: string;
  hoursPlayed?: number;
  releaseYear?: number;
  studioOrDeveloper?: string;
  platform?: string;
  season?: string | number;
  episodes?: number;
  addedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Countdown {
  id: string;
  title?: string;
  targetDate: string;
  description?: string;
  category?: string;
  icon?: string;
  label?: string;
  emoji?: string;
  color?: any;
  createdAt: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  category?: string;
  description?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TodoProject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  projectId: string | null;
  priority: 'none' | 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  completed: boolean;
  dueDate: string | null;
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
  order?: number;
  deleted?: boolean;
  pomodoroCount?: number;
  category?: string;
  description?: string;
  location?: string;
  reminder?: string;
  repeat?: string;
  featured?: boolean;
  subtasks?: SubTask[];
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  mood?: string;
  bookmarked?: boolean;
  pinned?: boolean;
  reflection?: any;
  focusList?: any;
  attachments?: any;
  pageStyle?: any;
  location?: any;
  reminder?: any;
  stylePreset?: any;
  images?: string[];
}

export interface JournalStickyNote {
  id: string;
  content?: string;
  text?: string;
  title?: string;
  color?: string;
  date?: string;
  x?: number;
  y?: number;
  createdAt?: string;
}

export interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  isRoot?: boolean;
  parentId?: string;
  side?: any;
  icon?: string;
  linkUrl?: string;
  imageUrl?: string;
  pdfs?: any[];
  notes?: string;
  links?: string[];
  images?: string[];
  collapsed?: boolean;
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
  edgeStyle?: string;
  createdAt: string;
}

export interface StandardCalculation {
  id: string;
  expression: string;
  result: string;
  timestamp?: string;
  createdAt?: string;
}

export type HabitFrequency = 'daily' | 'weekly_days' | 'weekly_count';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  frequencyType: HabitFrequency;
  frequencyDays: number[];
  frequencyCount: number;
  createdAt: string;
  completedDates: string[];
  completionDetails?: Record<string, any>;
  habitType?: string;
  streak?: number;
  bestStreak?: number;
  whyText?: string;
  targetTime?: string;
  relationships?: any;
}

export interface DailyReflection {
  id: string;
  date: string;
  score?: number;
  whatWentWell?: string;
  blockers?: string;
  tomorrowPlan?: string;
  highlightOfDay?: string;
  gratitude?: string;
  improvement?: string;
  rating?: number;
  createdAt?: string;
}

export interface ExamFlashcard {
  id?: string;
  front: string;
  back: string;
  category?: string;
}

export interface ExamQuestion {
  id: string;
  question?: string;
  questionText?: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string | number;
  explanation?: string;
  marks?: number;
  type?: string;
}

export interface StudyUnit {
  id: string;
  title: string;
  topics?: any[];
  qna?: any[];
}

export interface ExamGradingReport {
  score?: number;
  totalScore?: number;
  totalQuestions?: number;
  feedback: any;
  weaknessSummary?: string;
  weaknesses?: string[];
  answers: any[];
}

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  reason?: string;
  type?: string;
  actionType?: string;
  actionLabel?: string;
  contextTag?: string;
  action?: any;
  targetData?: any;
}

export interface AiHistoryItem {
  id: string;
  title: string;
  timestamp?: string;
  createdAt?: string;
  summary?: string;
  isStarred?: boolean;
  actionType?: string;
  messages: any[];
}

export interface AiReplyBlock {
  type: string;
  title?: string;
  text?: string;
  variant?: string;
  content?: any;
  items?: any[];
  itemsList?: any[];
  headers?: string[];
  rows?: any[][];
}

export interface AiClarificationField {
  id: string;
  label: string;
  type: 'text' | 'input' | 'textarea' | 'time' | 'select' | 'checkbox' | 'radio' | 'date';
  placeholder?: string;
  options?: any[];
  defaultValue?: any;
  required?: boolean;
}

export interface StudyMaterial {
  id: string;
  title: string;
  content?: string;
  rawContent?: string;
  summary?: string;
  keyPoints?: string[];
  flashcards?: { front: string; back: string }[];
  tags?: string[];
  structuredData?: any;
  createdAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  materialId?: string;
  description?: string;
  timeLimitMinutes?: number;
  totalMarks?: number;
  specPrompt?: string;
  questions: ExamQuestion[];
  createdAt?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  score?: number;
  totalScore?: number;
  totalQuestions?: number;
  answers: any;
  feedback?: string;
  weaknessSummary?: string;
  timeTakenSeconds?: number;
  date?: string;
  createdAt?: string;
}

export interface BookTopic {
  id: string;
  title: string;
  pageNumber: number;
  color?: string;
  orderIndex?: number;
  readingState?: string;
  createdAt?: string;
}

export interface BookStickyNote {
  id: string;
  title?: string;
  pageNumber?: number;
  text?: string;
  content?: string;
  blockId?: string;
  date?: string;
  color?: string;
  styleTheme?: string;
  position?: string;
  x?: number;
  y?: number;
  createdAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  tagline?: string;
  coverImage?: string;
  totalPages?: number;
  pagesCount?: number;
  currentPage?: number;
  category?: string;
  isFavorite?: boolean;
  readingList?: boolean;
  audiobook?: boolean;
  progress?: number;
  pages?: Record<number | string, string>;
  topics?: BookTopic[];
  stickyNotes?: BookStickyNote[];
  bookmarks?: number[];
  highlights?: any[];
  status?: 'Reading' | 'Completed' | 'Want to Read' | 'Dropped';
  notes?: string;
  rating?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface VisionTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string | null;
  priority?: 'none' | 'low' | 'medium' | 'high' | 'urgent';
}

export type VisionNodeType =
  | 'image'
  | 'text'
  | 'goal'
  | 'quote'
  | 'map'
  | 'audio'
  | 'skill'
  | 'embed'
  | 'shape';

export type VisionBoardCategory = 'FAVORITES' | 'PERSONAL' | 'CAREER' | 'LIFESTYLE' | 'OTHER';

export interface VisionNodeMapPin {
  id: string;
  title: string;
  lat: number;
  lng: number;
  note?: string;
  imageUrl?: string;
}

export interface VisionNode {
  id: string;
  boardId: string;
  type: VisionNodeType;
  title: string;
  subtitle?: string;
  content?: string;
  imageUrl?: string;
  accentColor?: string;
  tags?: string[];
  position: { x: number; y: number };
  size?: { width: number; height: number };
  rotation?: number;
  cornerRadius?: number;
  hasShadow?: boolean;
  hasBorder?: boolean;
  linkUrl?: string;
  linkedHabitIds?: string[];
  linkedTaskIds?: string[];
  tasks?: VisionTask[];
  progress?: number;
  goalTarget?: number;
  goalCurrent?: number;
  goalUnit?: string;
  mapPins?: VisionNodeMapPin[];
  audioUrl?: string;
  audioDuration?: string;
  quoteAuthor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  fontStyle?: 'normal' | 'italic';
  isUppercase?: boolean;
  letterSpacing?: 'tight' | 'normal' | 'wide' | 'widest';
  textAlign?: 'left' | 'center' | 'right';
  bgStyle?: 'solid' | 'gradient' | 'glass' | 'pastel';
  textColor?: string;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisionBoard {
  id: string;
  title: string;
  subtitle?: string;
  category: VisionBoardCategory;
  icon?: string;
  isFavorite?: boolean;
  theme?: 'dots' | 'grid' | 'blank';
  nodes: VisionNode[];
  createdAt: string;
  updatedAt: string;
}

export interface Vision {
  id: string;
  title: string;
  category: string;
  imageUrl?: string;
  targetDate?: string;
  whyText?: string;
  status: 'Not Started' | 'In Progress' | 'Achieved' | 'Paused';
  progress: number;
  linkedHabitIds: string[];
  linkedTaskIds?: string[];
  tasks?: VisionTask[];
  position?: { x: number; y: number };
  rotation?: number;
  ropeTier?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budget: number;
  color: string;
  icon: string;
}

export interface BudgetTransaction {
  id: string;
  category_id?: string;
  categoryId?: string;
  amount: number;
  description: string;
  date: string;
  type: 'expense' | 'income';
  payment_method?: string;
  paymentMethod?: string;
}

export interface Sprint {
  id: string;
  title: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed';
  tasks: SprintTask[];
}

export interface SprintTask {
  id: string;
  title: string;
  completed: boolean;
  points?: number;
}

export interface DsaProblem {
  id: string;
  title: string;
  platform?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic?: string;
  category?: string;
  status: 'Todo' | 'Attempted' | 'Solved';
  notes?: string;
  link?: string;
  dateSolved?: string;
  solvedAt?: string;
}

export interface TilLog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

export interface LearningRoadmap {
  id: string;
  title: string;
  description: string;
  nodes: { id: string; title: string; completed: boolean }[];
}

export interface ResourceBookmark {
  id: string;
  title: string;
  url: string;
  category?: string;
  description?: string;
  tags?: string[];
  status?: string;
  savedAt?: string;
  notes?: string;
}

export interface DevGoal {
  id: string;
  title: string;
  target?: number;
  current?: number;
  metric?: string;
  dueDate?: string;
  targetDate?: string;
  completed: boolean;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  blocks?: any[];
  options?: { label: string; value: string }[];
  questionId?: string;
  resultCard?: any;
  pendingIntent?: string;
  originalPrompt?: string;
  executedTools?: Array<{
    stepId: string;
    toolName: string;
    label: string;
    status: 'running' | 'success' | 'error';
    entityId?: string;
    details?: string;
  }>;
  confirmedEntities?: Array<{ type: string; id: string; title: string }>;
}

export interface PomodoroStats {
  totalMinutes: number;
  totalSessions?: number;
  completedSessions?: number;
}

export type BugReportSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type BugReportStatus =
  | 'open'
  | 'in_review'
  | 'fixed_pending_verification'
  | 'verified_done'
  | 'reopened'
  // Backward compatibility legacy values
  | 'Open'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';
export type BugReportCategory = 'UI Glitch' | 'Performance' | 'Data Sync' | 'Crash / Error' | 'Other';

export interface BugReportElementItem {
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath?: string;
  dataAttributes?: Record<string, string>;
  selector: string;
  innerTextSnippet?: string;
  pageModule?: string;
  pageTitle?: string;
  screenshotSnippet?: string;
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
}

export interface BugReportElementInfo {
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath?: string;
  dataAttributes?: Record<string, string>;
  sectionName?: string;
  pageRoute?: string;
  selector: string;
  xpath?: string;
  boundingRect: {
    x: number;
    y: number;
    width: number;
    height: number;
    top: number;
    left: number;
  };
  viewport: {
    width: number;
    height: number;
    scrollX: number;
    scrollY: number;
    devicePixelRatio?: number;
  };
  innerTextSnippet?: string;
  isGroup?: boolean;
  groupCount?: number;
  groupElements?: BugReportElementItem[];
}

export interface BugReport {
  id: string;
  userId?: string;
  userEmail?: string;
  reporter?: string;
  title: string;
  description: string;
  category: BugReportCategory;
  severity: BugReportSeverity;
  status: BugReportStatus;
  elementInfo?: BugReportElementInfo;
  route: string;
  pageRoute?: string;
  sectionName?: string;
  screenshotData?: string;
  markdownContent?: string;
  userAgent?: string;
  fixedInFiles?: string[] | string;
  fixNotes?: string;
  verificationNotes?: string;
  fixedAt?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectNodeType = 'file' | 'folder';

export interface ProjectNode {
  id: string;
  name: string;
  type: ProjectNodeType;
  path: string;
  parentId: string | null;
  content?: string;
  extension?: string;
  isExpanded?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProjectStructure {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  rootName: string;
  nodes: ProjectNode[];
  tags: string[];
  templateType?: string;
  createdAt: string;
  updatedAt: string;
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
  
  // Journal Tracker
  journals: JournalEntry[];
  addJournalEntry: (entry: JournalEntry) => Promise<void>;
  updateJournalEntry: (id: string, data: Partial<JournalEntry>) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  
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
