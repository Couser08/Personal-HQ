# Performance Tuning Rules

## 1. Optimistic Updates Over Spinners
- Never block the UI with full-screen loading spinners for user-initiated write actions (adding notes, deleting tasks, checking habits).
- Update Zustand state and UI immediately (optimistic UI), fire Supabase write in background, and automatically roll back with an error toast on failure.

## 2. Debounced Autosave
- Continuous text input surfaces (Journal, Markdown Creator, Notes) must write to local state instantly on every keystroke, and debounce network writes to Supabase by `500ms–800ms`.

## 3. Query Discipline & Column Limiting
- **Never** execute unbounded `select('*')` on list or feed queries.
- Select only needed columns for card/list representations: `.select('id, title, created_at, category')`.
- Paginate or limit large lists using `.range()` or virtualized scrolling.

## 4. Route Code-Splitting & Memoization
- Lazy-load heavy module views with `React.lazy()` and `Suspense`.
- Memoize heavy list item renderers (`React.memo`) for task rows, journal cards, link cards, and habit calendar grids to prevent re-render cascades.
