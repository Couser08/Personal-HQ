export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pagesCount: number;
  coverImage: string;
  rating: number;
  isFavorite: boolean;
  readingList: boolean;
  audiobook: boolean;
  createdAt: string;
}

export const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'Atomic Habits',
    author: 'James Clear',
    category: 'Self-Help',
    pagesCount: 320,
    coverImage: 'orange-sunset',
    rating: 5,
    isFavorite: true,
    readingList: true,
    audiobook: true,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    category: 'Fiction',
    pagesCount: 180,
    coverImage: 'purple-mountain',
    rating: 4,
    isFavorite: false,
    readingList: true,
    audiobook: false,
    createdAt: '2026-02-15T11:30:00Z'
  },
  {
    id: '3',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Science',
    pagesCount: 499,
    coverImage: 'blue-lake',
    rating: 5,
    isFavorite: true,
    readingList: false,
    audiobook: true,
    createdAt: '2026-03-01T09:15:00Z'
  },
  {
    id: '4',
    title: 'Educated',
    author: 'Tara Westover',
    category: 'Biography',
    pagesCount: 352,
    coverImage: 'tuscan-leather',
    rating: 4,
    isFavorite: false,
    readingList: false,
    audiobook: false,
    createdAt: '2026-04-12T14:45:00Z'
  },
  {
    id: '5',
    title: 'Deep Work',
    author: 'Cal Newport',
    category: 'Self-Help',
    pagesCount: 304,
    coverImage: 'green-forest',
    rating: 5,
    isFavorite: false,
    readingList: true,
    audiobook: true,
    createdAt: '2026-05-20T16:00:00Z'
  },
  {
    id: '6',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'Non-Fiction',
    pagesCount: 512,
    coverImage: 'pink-rose',
    rating: 5,
    isFavorite: true,
    readingList: false,
    audiobook: true,
    createdAt: '2026-06-05T08:00:00Z'
  }
];
