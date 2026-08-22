---
name: personal-hq-app
description: Use this skill whenever working on the Personal HQ app — Rahul's multi-module productivity app (Journal, MD Creator, Link Vault, Habit Tracker, Daily Planner, Calendar View, Project Structure, AI agent layer, and more) built with React, Tailwind CSS, React Router, Zustand, and Supabase. Trigger this for ANY task touching UI consistency, cross-module data, state management, Supabase queries/schema, caching/egress, bug-pull workflow, or the AI agent. This skill exists so the agent does NOT re-derive architecture decisions from scratch — follow the rules below directly instead of reasoning about alternatives.
---

# Personal HQ App — Build Rules (v2)

Stack: React + Tailwind + React Router + Zustand + Supabase + Tabler Icons.
Do not propose a different stack. Do not re-litigate Zustand vs Redux, or Supabase vs Firebase. Work within what exists.

Original problems (modules disconnected, app laggy, UI inconsistent) are being fixed via a phased redesign — check current phase before assuming greenfield work.

---

## 1. Current Module Set

Journal, MD Creator, Link Vault (merged with old Link Saver — one module now), Habit Tracker, Daily Planner (replaced old To-Do: adds timeline/scheduling, recurring tasks, reminders 5/10/15/20 min before start), Calendar View (frontend-only, integrates habits + planner, month/week/day, inline toggle/edit/delete), Vision Calendar (built, not yet launched — long-term goals), Project Structure (VS Code-style: infinite nested folder/file tree, markdown-only files, adjacency-list Supabase schema, split Zustand stores — replaces old board/sprints/gantt), Mind Map (manual create + JSON import to markdown), Drawing (Excalidraw), Pomodoro, Library (book CRUD, custom covers, sticky notes), TIL, Snippet Vault, AI Exam Prep (upload .md → AI generates unit-wise Q&A, custom paper generation, AI grades by concept match not exact text), Media Log, Condition Workstation (variables + conditions → decision flow diagram), Utilities cluster (link vault, tag manager, calculator, event countdown), Settings, Admin Panel, Profile.

**Removed permanently — do not re-add or suggest reviving:**
- Budget/Expense Tracker — removed after 4-5 major redesign attempts, kept resurfacing bugs
- Study Tracker (subject→topic hierarchy) — removed due to repeated duplicated tabs, flashcards/revision breaking on every fix

If asked to add tracking/finance or study-hierarchy features again, flag that these were deliberately killed rather than silently rebuilding them.

---

## 2. Design System — One System, Not N Apps

Same rule as before, now with system-level primitives already built:

- `PageContainer` — layout primitive every page routes through
- `ActionHub` — shared component for page-level actions
- `AppShell` — CSS Grid shell handling sidebar collapse

Every module consumes the SAME `src/components/ui/` primitives: `Card`, `Button` (`primary|secondary|ghost|danger`), `Input`/`TextArea`, `Modal`/`Drawer`, `IconButton` (fixed stroke-width, sizes 16/20/24), `EmptyState`, `Toast`. No module invents its own variant.

**Visual direction (current redesign target):** minimal-but-premium. Soft neutral-grey backgrounds, floating white cards with heavy rounded corners + soft shadows, tight two-tier text hierarchy (bold title + muted grey subtext), pill-shaped tags/badges, generous padding, monochrome line icons with one accent color used sparingly (gradient avatar ring, one status-color badge, one accent dot).

**Redesign sequencing:** phase-wise, small pages first (profile, settings, home, admin) before big ones (journal, pomodoro, etc.). Don't jump straight to the biggest/messiest module.

**Tailwind discipline:** tokens defined once in `tailwind.config.js`. Never raw values (`bg-gray-800`) scattered per file.

---

## 3. Cross-Module Cohesion

Root architectural finding: **shared data gets independently re-modeled per module** (task counts, sync status, streak counts computed separately in Journal/Habit/Planner/Dashboard) — this is the actual cause of drift bugs, not just missing tags. Treat any new cross-module metric as a single source of truth, computed once, consumed everywhere — never recompute the same count in two stores.

Still valid from original plan: shared tagging (`tags` + polymorphic `taggables`), global search RPC, Cmd+K quick add, home activity feed — build in that dependency order if not already present.

---

## 4. Data Loading — Metadata-First

Journal and Library: **store only metadata by default** (heading, dates, etc.); load full content only when the specific card/entry is opened. Do not eagerly fetch full body content on list views for any module.

General Supabase discipline still applies: narrow `select()`, paginate/`.range()` on unbounded lists (journal entries, habit logs), index hot-path columns (`user_id`, `created_at`, tag joins), Realtime only where live updates matter.

---

## 5. Caching & Egress

- `staleTime` is correctly set to 5 min with partial (not full) data updates on refetch — this was verified NOT to be the gap when egress spiked.
- Egress spikes (300–500MB on dev days vs ~30MB on non-dev days) were traced to **dev-time testing hitting production Supabase**, not real usage or bad cache config.
- **Dev/prod isolation is mandatory before further architecture work**: an in-app mock Supabase client (local fake DB, near-real query/calculation behavior) is the chosen approach — a second real Supabase project was evaluated and rejected as too much overhead. Mock client is implemented and working; use it for all UI-only dev work.
- Don't propose staleTime tweaks or query-key restructuring as the fix for egress issues — check dev/prod isolation first.

---

## 6. Bug-Pull Workflow (current — replaces any older in-app admin fetch flow)

Do NOT build or use a live in-app admin UI that fetches/renders bug data from the DB. Current decided flow:

1. App generates a **copyable command** from its bug reporter.
2. Rahul pastes that command into Antigravity (the AI builder).
3. Antigravity pulls all bug data from the DB (deleting/clearing it after pull) into a local folder/file and works from that snapshot — not a live fetch.

Bug reporter fingerprinting limitation to keep in mind: it currently captures only one class per element and struggles in areas with 3–4 nested elements — factor this in when triaging reports, don't assume the element ID is fully reliable.

Once pulled locally, the fix sequence is still: review all → evaluate against rule files → group by root cause → write a fix plan → fix → hand off for verification (never mark done directly).

---

## 7. AI Agent Layer (major rebuild in progress)

The AI agent is a **store/action layer only** — task create, breakdown, suggestions, planning. It is NOT a coding/inline-completion feature; don't conflate it with IDE-style AI features.

- Model: Gemini 3.7 Flash (stable, free tier) — upgraded from 2.5 Flash. Confirmed best free-tier option for agentic/tool-calling and cheaper per-token than 3.5 Flash even on paid tier.
- Architecture: Gemini Function Calling + Supabase Edge Function proxy + tuned system prompt file + tool-use + rate limiting.
- Design constraint: tune for **low thinking budget** and a **token-efficient system prompt/schema** — this is a hard requirement, not a nice-to-have.
- Approach: **full rebuild from scratch**, not a model swap on the old agent. Old agent is removed entirely (not kept behind a flag / parallel branch). Old app architecture keeps running until the new agent is fully working, then it releases as a unit.
- UI: single global chat window handles all modules — never build per-module mini-chats.
- Excalidraw integration: AI only outputs a text description with shape/arrow references — it does not draw directly on the canvas.
- Task creation: define required vs optional fields; a task can be created from required fields alone; only ask the user for fields that are genuinely missing, not everything by default.
- Break-down-task flow: show existing tasks first → user selects one → then AI breaks it down. Never an immediate hardcoded breakdown.
- Suggestions: after first integration, AI should scan the app and gather real context before suggesting anything — never hardcoded/random suggestions.

If old agent bugs come up (API key not persisting in chat widget, AI claiming a task was created when it wasn't, raw unrendered markdown in responses, no chat history page) — these belong to the **old agent being replaced**, don't patch them; they're superseded by the rebuild.

---

## 8. Perceived Performance (still applies)

1. Optimistic updates on every write (Zustand first, Supabase in background, rollback + toast on failure) — never spinner a save.
2. Debounce autosave (500–800ms) for Journal/MD Creator: instant Zustand write, debounced Supabase write.
3. Zustand: one slice per module + a shared base slice for cross-cutting data (tags, user, activity feed). Selectors only, never subscribe to the whole store.
4. Route-level code splitting (`React.lazy()`), memoize list items (`React.memo`).

---

## 9. Anti-Patterns — Do Not Do These

- Don't recreate Budget Tracker or Study Tracker in any form without being explicitly asked to reconsider — they were deliberately killed.
- Don't build a live in-app admin bug-fetch UI — use the command → Antigravity pull flow.
- Don't fetch full Journal/Library content on list views — metadata-first.
- Don't touch production Supabase from dev/UI work — use the mock client.
- Don't patch the old AI agent's bugs — it's being replaced wholesale.
- Don't build a new modal/button/input per module — extend the shared primitive.
- Don't mix bug-fix pushes with feature/improvement pushes in the same batch (current workflow: use app 3-4 days, log issues, batch fixes and improvements as separate pushes).

---

## Current Priority Order

If asked "what's next" without more specific direction, current stated sequencing is:

1. Bug-reporter/app coordination (currently disconnected, hard to trace) — command-based pull flow
2. UI/UX bugs — fix → test → re-fix loop
3. Non-caching small/event-listener bugs
4. Major caching/performance overhaul (dev/prod isolation → architecture refactor: list-query audit, metadata-first loading, delta-sync bug panel)
5. AI agent full rebuild
6. v4.6.6 stabilization (Beta → stable), then refine further in v4.7.0