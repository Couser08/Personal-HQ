# Caching & State Synchronization Rules

## 1. TanStack Query Discipline
- Query keys must be centralized in `src/lib/queryKeys.ts` (e.g. `queryKeys.journal.entries()`, `queryKeys.admin.bugReports(...)`).
- On every write mutation, invalidate or set query cache immediately: `queryClient.invalidateQueries({ queryKey: ... })`.
- Set sensible `staleTime` (e.g. `1000 * 60 * 5` for relatively static data, `0` for live sync items).

## 2. Zustand Slice Isolation
- Keep module stores isolated in discrete slices (`useJournalStore`, `useHabitStore`, `useBugReportStore`, `useAppStore`).
- Always use granular selectors (`useAppStore(state => state.activeModule)` or `useShallow`) to prevent unrelated component re-renders.

## 3. Offline & IndexedDB Fallback
- For large media, offline drafts, and bug reports containing base64 snapshots, persist to IndexedDB (`setIDBItem`) while keeping light JSON in `localStorage`.
- Always sanitize large data payloads before writing to `localStorage` to avoid `QUOTA_EXCEEDED_ERR`.

## 4. Realtime Subscription Safety
- Open Supabase Realtime channels only when a module is active, and clean up channels in `useEffect` return cleanup handlers to avoid memory leaks.
