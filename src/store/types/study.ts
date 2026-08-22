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
