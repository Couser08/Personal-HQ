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
