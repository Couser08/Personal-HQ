# UI/UX Rules & Design Standards

## 1. Single Shared Design System
- All surfaces and modules must consume the exact same UI primitives from `src/components/ui/` (`Button`, `Card`, `Input`, `TextArea`, `Modal`, `IconButton`, `EmptyState`, `Toast`).
- **Never** allow a module to declare its own custom button, dialog, or input style variants.
- Strict token discipline: always reference design tokens defined in `tailwind.config.js` and CSS variables in `src/index.css` (`bg-surface`, `bg-surface-alt`, `text-primary`, `text-secondary`, `border-border`, `accent-primary`).

## 2. Apple Glassmorphism & Materials
- Use translucent backdrop blur overlays for elevated cards and floating surfaces:
  `bg-surface/90 backdrop-blur-xl border border-border/60 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.25)]`
- Ensure dark mode (`#0a0a0a` background, `#111111` surface) and light mode (`#f4f4f5` background, `#ffffff` surface) maintain clean visual hierarchy without muddy borders or harsh contrasts.

## 3. Signature Accent Color
- Primary accent color is Rose-Red (`#f43f5e`, Tailwind `rose-500` / `var(--accent-primary)`).
- Secondary semantic accents:
  - Success / Growth: Emerald (`#22c55e`, Tailwind `emerald-500`)
  - Focus / Timer: Pacific Blue / Indigo (`#3b82f6`, Tailwind `blue-500` / `indigo-500`)
  - Warning / In Progress: Amber (`#f59e0b`, Tailwind `amber-500`)
  - Danger / Critical: Crimson Rose (`#f43f5e`, Tailwind `rose-500`)

## 4. Typography & Spacing
- Primary font is `DM Sans` with negative letter-spacing on headings (`tracking-tight` / `-0.02em`).
- Spacing follows a 4px base scale: `px-1` (4px), `px-2` (8px), `px-3` (12px), `px-4` (16px), `px-6` (24px), `px-8` (32px).
- Every card must have consistent border radius: `rounded-2xl` (16px) or `rounded-3xl` (24px).

## 5. Empty States & Feedback
- Every view with zero items must render an `EmptyState` component with a friendly icon, clear title, concise explanation, and a single prominent call-to-action button.
- All write feedback must trigger a toast through `useToastStore.getState().addToast(...)`.
