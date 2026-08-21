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
