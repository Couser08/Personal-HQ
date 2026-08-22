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
