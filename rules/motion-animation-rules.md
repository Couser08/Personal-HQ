# Motion & Animation Rules

## 1. Unified Timing & Easing Curves
- Micro-interactions (hover, active click, toggle): `150ms ease-out` or `transition-all duration-150`.
- Modals, dialogs, drawers: `250ms` spring transitions (`transition={{ type: 'spring', damping: 26, stiffness: 360 }}`).
- Never hardcode arbitrary, sluggish durations (>400ms) for UI navigation or panel opening.

## 2. Hardware-Accelerated Compositor Properties
- **Animate only composite properties**: `transform` and `opacity`.
- **Never** animate layout geometry directly (`width`, `height`, `margin`, `padding`, `top`, `left`) when transforms (`scale`, `translate3d`) can achieve the visual effect.
- Use `willChange: 'transform, opacity'` on high-frequency animated elements.

## 3. Layout Thrashing Elimination
- Avoid reading DOM properties (`getBoundingClientRect`, `offsetHeight`, `scrollHeight`) inside scroll listeners or render loops without batching or requestAnimationFrame.
- Use Framer Motion's `layoutId` or CSS transforms for list item reordering instead of triggering continuous browser reflows.

## 4. Reduced Motion & Performance Fallback
- Honor `prefers-reduced-motion`: disable large translation springs and replace with clean cross-fades.
- In low-power or low-spec mode ("Potato Engine"), dynamically drop heavy `backdrop-filter: blur(...)` to solid surface backgrounds.
