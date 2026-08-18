# Behavior & Interaction Rules

## 1. Zero-Friction Capture
- **Habit Check-off**: Must be exactly ONE tap or click. Never trigger a confirmation dialog, extra routing, or reload. Toggle state instantly and fire haptic feedback.
- **New Journal / Note / Book Entry**: Default to instant typing mode. Autofocus the text input / editor immediately on route entry or creation.
- **Link Vault**: Support "Paste-a-URL-and-go". Automatically fetch URL metadata (title, favicon, description) without blocking user interactions.

## 2. Smart Defaults & Decision Fatigue Elimination
- Always initialize forms and input models with realistic, valid defaults (e.g. current date, default category, medium priority).
- Never present empty or ambiguous inputs when a logical default can be deduced.

## 3. Keyboard-First Workflows
- **Cmd+K / Ctrl+K**: Global Command Palette for quick search and cross-module action triggers.
- **Cmd+Enter / Ctrl+Enter**: Submit or save active forms, notes, entries, and dialogs.
- **Escape**: Dismiss modals, floating popups, drawers, and inspection overlays.
- Accessible focus rings: ensure clear `:focus-visible` ring on keyboard navigation, suppressed on mouse click.

## 4. Tactile Haptic Responses
- Every button, card, and interactive target must provide immediate tactile physical press feedback using active downscaling:
  `active:scale-[0.97] transition-transform duration-100`
- Toggle switches and checkboxes must animate smoothly without layout jank.
