# UI Audit & Design Implementation Plan — Books Module

This document outlines the visual design audit of the FocusFlow Books surface against the system's design manual (`design.md`) and proposes self-contained changes to align the surface with FocusFlow's premium Apple-style visual guidelines.

---

## Design Language
- **Audited Surface:** Books/Notebooks Module (`src/modules/books/`)
- **Design Sources:** [design.md](file:///c:/Users/Rahul/OneDrive/Desktop/PersonalApp/design.md), [index.css](file:///c:/Users/Rahul/OneDrive/Desktop/PersonalApp/src/index.css)
- **Documented Decisions:**
  - Primary Accent Color: Rose-Red (`#f43f5e`, tailwind class `rose-500` / `accent-primary`)
  - Tactile Micro-interactions: Active scale down `active:scale-[0.97] transition-transform duration-100` for physical press feedback on all buttons
  - Apple Glassmorphism and Zen Layouts
  - Aspect Ratio standard for book covers (3:4 aspect ratio)
- **Governing Owners and Consumers:** `LibraryDashboard.tsx`, `CreateNotebookModal.tsx`, `NotebookEditor.tsx`
- **Explicit Exceptions:** None documented

---

## Findings

| # | Problem | Evidence | Proposed Change | Scope | Confidence |
|---|---|---|---|---|---|
| 1 | **Primary Accent Color Drift** | Accent color is Rose-Red (`rose-500` / `var(--accent-primary)`). Current book buttons (Add Book, modal buttons, active navs) hardcode indigo color classes (`bg-indigo-600`, `hover:bg-indigo-700`, `text-indigo-600`). | Replace all hardcoded indigo styling classes (`bg-indigo-*`, `hover:bg-indigo-*`, `text-indigo-*`, `border-indigo-*`) with Rose-Red equivalents. | `CreateNotebookModal.tsx`, `NotebookEditor.tsx`, `LibraryDashboard.tsx` | High |
| 2 | **Tactile Haptic Bounce Omission** | The design system specifies all interactive buttons must scale down slightly (`active:scale-[0.97]`) when pressed. Book buttons lack the active haptic state class. | Add `active:scale-[0.97] transition-transform duration-100` to primary buttons and clickable elements. | `CreateNotebookModal.tsx`, `NotebookEditor.tsx`, `LibraryDashboard.tsx` | High |
| 3 | **Undefined Aspect Ratio for Image Uploads** | Presets use a strict 3:4 aspect ratio. Custom file upload options don't specify the correct aspect ratio, leading to potential layout breaks. | Update cover upload button labels to specify `(3:4 ratio - JPG, PNG)` for clarity. | `CreateNotebookModal.tsx`, `NotebookEditor.tsx` | High |

---

## Improve First
The **Primary Accent Color Drift** is the highest-leverage finding. Aligning all buttons and active tabs to FocusFlow's signature Rose-Red theme maintains a unified visual brand across the workspace.

---

# Implementation Plan

This section contains the exact file changes to execute.

## [Component Name] Books Module UI Clean-up

### [MODIFY] [CreateNotebookModal.tsx](file:///c:/Users/Rahul/OneDrive/Desktop/PersonalApp/src/modules/books/components/CreateNotebookModal.tsx)
- Add aspect ratio instruction to the Upload button label:
  ```diff
  - <IconPlus size={10} /> Upload Image Cover (JPG, PNG)
  + <IconPlus size={10} /> Upload Image Cover (3:4 ratio - JPG, PNG)
  ```
- Change all `indigo` color states to `rose`:
  - `bg-indigo-600 hover:bg-indigo-700` -> `bg-rose-500 hover:bg-rose-600`
  - `border-indigo-500 dark:border-indigo-400` -> `border-rose-500 dark:border-rose-400`
  - `text-indigo-600` / `text-indigo-500` -> `text-rose-500`
  - `bg-indigo-50` / `bg-indigo-950/40` -> `bg-rose-50 dark:bg-rose-950/40`
- Add haptic press tactile feedback to modal buttons:
  - Add `active:scale-[0.97] transition-transform` to the "Create Notebook" and "Cancel" button classes.

### [MODIFY] [NotebookEditor.tsx](file:///c:/Users/Rahul/OneDrive/Desktop/PersonalApp/src/modules/books/components/NotebookEditor.tsx)
- Add aspect ratio instruction to the Cover Configuration Upload button label:
  ```diff
  - <IconPlus size={10} /> Change Custom Cover
  + <IconPlus size={10} /> Change Custom Cover (3:4 ratio - JPG, PNG)
  ```
- Change all `indigo` color states to `rose`:
  - `bg-indigo-600 hover:bg-indigo-700` -> `bg-rose-500 hover:bg-rose-600`
  - `border-indigo-500` -> `border-rose-500`
  - `text-indigo-600` / `text-indigo-500` -> `text-rose-500`
  - `bg-indigo-50/80 hover:bg-indigo-100/80` -> `bg-rose-50/80 hover:bg-rose-100/80`
  - `ring-indigo-500` -> `ring-rose-500`
- Add haptic press tactile feedback to primary actions:
  - Add `active:scale-[0.97] transition-transform` to "+ Add 5 Pages", bottom color buttons, header settings buttons, and TOC links.

### [MODIFY] [LibraryDashboard.tsx](file:///c:/Users/Rahul/OneDrive/Desktop/PersonalApp/src/modules/books/components/LibraryDashboard.tsx)
- Change all `indigo` color states to `rose`:
  - `bg-indigo-600 hover:bg-indigo-700` -> `bg-rose-500 hover:bg-rose-600`
  - `text-indigo-600` -> `text-rose-500`
  - `bg-indigo-500/10` -> `bg-rose-500/10`
  - `border-indigo-500/20` -> `border-rose-500/20`
  - `from-violet-500/10 to-indigo-500/10` -> `from-rose-500/10 to-violet-500/10`
- Add haptic press tactile feedback to buttons:
  - Add `active:scale-[0.97] transition-transform` to "Add Book" and tab switches.
