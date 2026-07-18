


import { type StateCreator } from 'zustand';
import { type AppStore, type Book } from '../types';
import { useToastStore } from '../useToastStore';
import { getIDBItem, setIDBItem } from '../../lib/indexedDB';

export interface BooksSlice {
  books: Book[];
  loadBooks: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  updateBook: (id: string, data: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    tagline: 'A story about following your dreams.',
    rating: 5,
    coverImage: 'purple-mountain',
    pagesCount: 5,
    category: 'Fiction',
    isFavorite: true,
    readingList: true,
    audiobook: false,
    progress: 10,
    currentPage: 1,
    pages: {
      1: `<p>The Alchemist is a novel by Paulo Coelho that follows the journey of Santiago, a young shepherd <span style="background-color: #FEF08A">who dreams of finding a treasure</span>.</p><p>His journey teaches him valuable lessons about <span style="background-color: #BBF7D0">life, destiny, and listening to one's heart</span>.</p><p>Sometimes, the treasure we seek is not a place, <span style="background-color: #F3E8FF">but a new way of seeing life itself</span>.</p>`,
      2: `<p>The desert is a teacher. It does not speak, but it speaks to the soul of those who listen. Santiago learned that the wind is also a traveler, carrying the secrets of the world.</p><p><strong>To find one's Personal Legend is the only real obligation of a person.</strong> When you want something, all the universe conspires in helping you to achieve it.</p>`,
      3: `<p>Santiago arrived at the oasis, a place of peace and rest. Here he met Fatima, who told him that the women of the desert wait for their men to return. <em>Love does not require one to abandon their Personal Legend.</em></p>`,
      4: `<p>The Alchemist took the boy under his wing. Together, they rode into the dangerous territories of the desert, where war was brewing. "Listen to your heart," the Alchemist advised. "It knows all things."</p>`,
      5: `<p>At the pyramids, Santiago dug into the sand, weeping with joy. A group of refugees found him and beat him, stealing his gold. But one of them laughed and told him of a dream he had about treasure buried under a sycamore tree in Spain.</p>`
    },
    topics: [
      { id: 't-1', title: 'Introduction', pageNumber: 1, color: 'blue' },
      { id: 't-2', title: 'The Dream', pageNumber: 2, color: 'green' },
      { id: 't-3', title: 'The Journey Begins', pageNumber: 3, color: 'blue' },
      { id: 't-4', title: 'The Alchemist', pageNumber: 4, color: 'orange' },
      { id: 't-5', title: 'The Treasure', pageNumber: 5, color: 'pink' }
    ],
    stickyNotes: [
      {
        id: 'note-1',
        title: 'Remember',
        content: 'Add a note about the symbolism of the desert and the wind.',
        date: '10 May 2024',
        color: 'yellow',
        pageNumber: 1
      },
      {
        id: 'note-2',
        title: 'Idea for later',
        content: 'Add a real-life example of following your dreams.',
        date: '10 May 2024',
        color: 'pink',
        pageNumber: 1
      }
    ],
    bookmarks: [1],
    highlights: [
      { id: 'h-1', text: 'dreams of finding a treasure', color: 'yellow', pageNumber: 1, startOffset: 106, endOffset: 133 },
      { id: 'h-2', text: "life, destiny, and listening to one's heart.", color: 'green', pageNumber: 1, startOffset: 178, endOffset: 221 },
      { id: 'h-3', text: 'but a new way of seeing life itself.', color: 'purple', pageNumber: 1, startOffset: 265, endOffset: 301 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-2',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    tagline: 'Two systems shape how we think: System 1 (fast, intuitive) and System 2 (slow, deliberate).',
    rating: 4,
    coverImage: 'blue-lake',
    pagesCount: 5,
    category: 'Non-Fiction',
    isFavorite: false,
    readingList: true,
    audiobook: false,
    progress: 5,
    currentPage: 1,
    pages: {
      1: `<p><strong>System 1</strong> operates automatically and quickly, with little or no effort and no sense of voluntary control.</p><p><strong>System 2</strong> allocates attention to the effortful mental activities that demand it, including complex calculations.</p>`,
      2: `<p>Page 2 of slow thinking details.</p>`,
      3: `<p>Page 3 of slow thinking details.</p>`,
      4: `<p>Page 4 of slow thinking details.</p>`,
      5: `<p>Page 5 of slow thinking details.</p>`
    },
    topics: [
      { id: 't-1', title: 'Two Systems', pageNumber: 1, color: 'blue' }
    ],
    stickyNotes: [],
    bookmarks: [1],
    highlights: [],
    createdAt: new Date().toISOString()
  },
  {
    id: 'book-3',
    title: 'The Power of Now',
    author: 'Eckhart Tolle',
    tagline: 'A guide to spiritual enlightenment through living fully in the present moment.',
    rating: 5,
    coverImage: 'green-forest',
    pagesCount: 5,
    category: 'Self-Help',
    isFavorite: false,
    readingList: false,
    audiobook: false,
    progress: 8,
    currentPage: 1,
    pages: {
      1: `<p>Realize deeply that the present moment is all you have. Make the <strong>NOW</strong> the primary focus of your life.</p><p>To be free of time is to be free of the psychological need of past for your identity and future for your fulfillment.</p>`,
      2: `<p>Living in the Present page 2.</p>`,
      3: `<p>Living in the Present page 3.</p>`,
      4: `<p>Living in the Present page 4.</p>`,
      5: `<p>Living in the Present page 5.</p>`
    },
    topics: [
      { id: 't-1', title: 'The Present Moment', pageNumber: 1, color: 'green' }
    ],
    stickyNotes: [],
    bookmarks: [1],
    highlights: [],
    createdAt: new Date().toISOString()
  }
];

export const createBooksSlice: StateCreator<
  AppStore,
  [],
  [],
  BooksSlice
> = (set, get) => ({
  books: INITIAL_BOOKS,

  loadBooks: async () => {
    try {
      // 1. Try loading from IndexedDB
      let booksData = await getIDBItem<Book[]>('phq_books');

      // 2. Migration fallback: check if localStorage has books
      const localRaw = localStorage.getItem('phq_books');
      if (localRaw) {
        try {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // If we don't have books in IDB yet, migrate them
            if (!booksData || booksData.length === 0) {
              booksData = parsed;
              await setIDBItem('phq_books', booksData);
            }
            // Remove from localStorage to prevent duplicate loading/wasted quota
            localStorage.removeItem('phq_books');
          }
        } catch (e) {
          console.warn('Failed to parse/migrate books from localStorage:', e);
        }
      }

      // 3. Fallback to INITIAL_BOOKS if nothing in either store
      if (!booksData || booksData.length === 0) {
        booksData = INITIAL_BOOKS;
        await setIDBItem('phq_books', booksData);
      }

      set({ books: booksData });
    } catch (error) {
      console.error('Failed to load books from IndexedDB:', error);
      set({ books: INITIAL_BOOKS });
    }
  },

  addBook: async (book) => {
    const previous = get().books;
    const next = [...previous, book];
    try {
      await setIDBItem('phq_books', next);
      set({ books: next });
      useToastStore.getState().addToast('Book Created', `"${book.title}" was added to your library.`, 'success');
    } catch (error) {
      console.error('Failed to add book to IndexedDB:', error);
      useToastStore.getState().addToast('Storage Error', 'Could not save book locally.', 'error');
    }
  },

  updateBook: async (id, data) => {
    const previous = get().books;
    const next = previous.map((b) => (b.id === id ? { ...b, ...data } : b));
    try {
      await setIDBItem('phq_books', next);
      set({ books: next });
    } catch (error) {
      console.error('Failed to update book in IndexedDB:', error);
    }
  },

  deleteBook: async (id) => {
    const previous = get().books;
    const bookToDelete = previous.find((b) => b.id === id);
    const next = previous.filter((b) => b.id !== id);
    try {
      await setIDBItem('phq_books', next);
      set({ books: next });
      if (bookToDelete) {
        useToastStore.getState().addToast('Book Deleted', `"${bookToDelete.title}" was deleted.`, 'info');
      }
    } catch (error) {
      console.error('Failed to delete book from IndexedDB:', error);
    }
  }
});
