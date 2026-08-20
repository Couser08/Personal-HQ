import { QueryClient } from '@tanstack/react-query';

export const SEVEN_MINUTES_MS = 7 * 60 * 1000; // 7 minutes fresh window for zero unnecessary egress

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: SEVEN_MINUTES_MS, // 7 minutes fresh window by default
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection window
      refetchOnWindowFocus: false, // Prevent aggressive re-fetching on tab switch
      refetchOnReconnect: true,
      retry: 1, // Fail fast on network/auth errors, don't spam retries
    },
    mutations: {
      retry: 0,
    },
  },
});
