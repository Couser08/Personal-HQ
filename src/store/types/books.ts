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
