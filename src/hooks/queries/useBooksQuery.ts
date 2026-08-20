import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, SEVEN_MINUTES_MS } from '../../lib/queryClient';
import { queryKeys } from '../../lib/queryKeys';
import { getIDBItem, setIDBItem } from '../../lib/indexedDB';
import type { Book } from '../../store/types';

export function useBooksQuery() {
  return useQuery({
    queryKey: queryKeys.books.all(),
    queryFn: async (): Promise<Book[]> => {
      try {
        const books = await getIDBItem<Book[]>('phq_books');
        if (books && books.length > 0) return books;
      } catch (err) {
        console.warn('Failed to load books from IDB:', err);
      }
      return [];
    },
    staleTime: SEVEN_MINUTES_MS, // 7 minutes
  });
}

export function useBooksMutations() {
  const saveAllBooksMutation = useMutation({
    mutationFn: async (books: Book[]) => {
      await setIDBItem('phq_books', books);
      return books;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.books.all() });
    },
  });

  return {
    saveAllBooksMutation,
  };
}
