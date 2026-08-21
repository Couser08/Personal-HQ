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

export interface StandardCalculation {
  id: string;
  expression: string;
  result: string;
  timestamp?: string;
  createdAt?: string;
}

export interface PomodoroStats {
  totalMinutes: number;
  totalSessions?: number;
  completedSessions?: number;
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
