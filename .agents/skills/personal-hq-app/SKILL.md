---
name: personal-hq-app
description: Use this skill whenever working on the Personal HQ app — a multi-module productivity app (Journal, Markdown Creator, Link Vault, Habit Tracker) built with React, Tailwind CSS, React Router, Zustand, and Supabase. Trigger this for ANY task touching UI consistency, cross-module data, state management, Supabase queries/schema, or perceived performance in this app. This skill exists so the agent does NOT re-derive architecture decisions from scratch — follow the rules below directly instead of reasoning about alternatives.
---

# Personal HQ App — Build Rules

Stack: React + Tailwind + React Router + Zustand + Supabase + Tabler Icons.
Known problems to fix: (1) modules feel disconnected, (2) app feels slow/laggy, (3) UI inconsistent across modules.

Do not propose a different stack. Do not re-litigate Zustand vs Redux, or Supabase vs Firebase. Work within what exists.

---

## 1. One Design System, Not Four Apps

The "inconsistent UI" problem means each module was probably built as its own mini-app. Fix at the primitive level, not per-screen.

**Rule:** Every module (Journal, MD Creator, Link Vault, Habit Tracker) consumes the SAME set of primitives. Never let a module define its own button, card, input, or modal.

Create `src/components/ui/` with exactly these primitives, used everywhere with zero exceptions:
- `Card.jsx` — one elevation style, one border-radius, one padding scale
- `Button.jsx` — variants: `primary | secondary | ghost | danger`. No module invents a new variant.
- `Input.jsx`, `TextArea.jsx` — same focus ring, same error state styling
- `Modal.jsx` / `Drawer.jsx` — one shared overlay pattern for ALL create/edit flows across modules
- `IconButton.jsx` — wraps Tabler icons at one fixed stroke-width and size scale (e.g. `stroke-width={1.75}`, sizes `16/20/24`)
- `EmptyState.jsx` — one visual language for "no entries yet" across all four modules
- `Toast.jsx` — one feedback system for save/delete/error, used everywhere (never module-specific alerts)

**Tailwind discipline:** define the design tokens ONCE in `tailwind.config.js` (spacing scale, radius, one accent color, semantic colors for success/error/warning). Every module references tokens (`bg-surface`, `text-muted`, `rounded-card`) — never raw Tailwind values like `bg-gray-800` scattered per-file. If a screen needs a new color, it goes in the config first, not inline.

**Motion:** one shared transition duration/easing (e.g. `150ms ease-out` for micro-interactions, `250ms` for modals/drawers). Define once, import everywhere (Framer Motion variants file or CSS custom properties) — don't hand-tune per component.

---

## 2. Kill the "Disconnected Modules" Feeling

Root cause is almost always that each module has its own isolated Supabase table with no shared vocabulary. Fix with a cross-cutting layer:

**Shared tagging system.** One `tags` table, one `taggables` join table (polymorphic: `taggable_type` + `taggable_id`) that Journal entries, Link Vault items, and Habit notes all reference. This is the single highest-leverage fix for "feels disconnected" — a tag clicked in Journal should surface related Link Vault items and habit notes.

**Global command palette / quick-add (Cmd+K).** One entry point that can create a journal entry, save a link, or log a habit without navigating. This is what makes a multi-module app feel like one app instead of four tabs.

**Global search.** One search bar that queries across all four modules (use Supabase full-text search or `ilike` across tables in a single RPC function) — not four separate per-module searches.

**Shared "recent activity" feed** on a home/dashboard screen pulling from all modules — gives the user one place that proves the modules are connected.

Do not build these as an afterthought bolted onto finished modules. If modules are already built in isolation, the fix order is: (1) add the join table, (2) add global search RPC, (3) add command palette, (4) add activity feed. In that order — later items depend on earlier ones.

---

## 3. Perceived Performance > Raw Speed

For a personal productivity app, the user notices friction on WRITE actions (adding a journal entry, saving a link, checking off a habit) far more than on initial load. Optimize in this priority order:

1. **Optimistic updates everywhere.** Every create/update/delete updates the Zustand store immediately, THEN fires the Supabase call in the background. Never show a spinner for a save action. On failure, roll back the optimistic change and toast an error. This alone fixes most "feels laggy" complaints — it's a UX fix, not a speed fix.
2. **Debounce autosave** for Journal and MD Creator (e.g. 500–800ms after last keystroke), write to Zustand state on every keystroke (instant), write to Supabase on debounce.
3. **Zustand store shape:** one slice per module (`useJournalStore`, `useLinkVaultStore`, `useHabitStore`) but a SHARED base slice for cross-cutting data (tags, current user, activity feed). Don't let one giant store trigger re-renders across unrelated modules — split slices, use selectors (`useStore(state => state.entries)`), never subscribe to the whole store.
4. **Supabase query discipline:**
   - Select only needed columns (`select('id, title, created_at')`), never `select('*')` on list views
   - Paginate/limit list views (habit logs and journal entries grow unbounded — use `.range()` or infinite scroll, never fetch all rows)
   - Add indexes on any column used in `.eq()`/`.order()` in a hot path (user_id, created_at, tag joins)
   - Use Supabase Realtime subscriptions ONLY where live updates matter; don't subscribe on every screen
5. **Code-split by route.** Each module is a `React.lazy()` route — don't ship Link Vault's code on first paint if the user opened Habit Tracker.
6. **Avoid re-render storms:** memoize list item components (`React.memo`) for journal entry lists, link cards, habit rows.

---

## 4. Low-Friction Capture

- Habit check-off = ONE tap, no confirmation modal, no navigation. Optimistic toggle.
- New journal entry: default to "type immediately." Autofocus the editor on route entry.
- Link Vault save: support paste-a-URL-and-go — auto-fetch title/favicon, don't force manual title entry.
- Keyboard-first: Cmd+K for quick add/search, Cmd+Enter to save/submit, Esc to close any modal/drawer. Apply identically across all modules.

---

## 5. Anti-Patterns — Do Not Do These

- Don't build a new modal/button/input component per module. Extend the shared primitive with a prop instead.
- Don't add a loading spinner for actions that can be optimistic (saves, toggles, deletes).
- Don't `select('*')` or fetch unbounded lists.
- Don't build cross-module features as a "phase 2."
- Don't hardcode colors/spacing per file — always go through `tailwind.config.js` tokens.

---

## Build/Fix Priority Order

If asked to "make this app better" without more specific direction, work in this order:

1. Extract shared UI primitives → fixes UI inconsistency
2. Add tags + taggables join table, wire into all modules → fixes disconnected feeling
3. Add optimistic updates to all write actions → fixes perceived slowness
4. Add global search + Cmd+K quick add → makes it feel like one app
5. Add pagination/column-limiting + route-level code splitting → fixes real performance
6. Add activity feed to home dashboard → reinforces the "connected app" feeling visually
