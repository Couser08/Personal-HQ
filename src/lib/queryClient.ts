import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute fresh window by default
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection window
      refetchOnWindowFocus: true, // Auto background revalidate when user returns to tab
      refetchOnReconnect: true,
      retry: 1, // Fail fast on network/auth errors, don't spam 3 retries
    },
    mutations: {
      retry: 0,
    },
  },
});
