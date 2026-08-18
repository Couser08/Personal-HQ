# Responsiveness & Mobile-First Rules

## 1. Breakpoints & Grid Scaling
- Design mobile-first across standardized Tailwind breakpoints:
  - Mobile: `<640px` (single column, full width, stacked controls)
  - Tablet: `sm: 640px` / `md: 768px` (2 columns)
  - Desktop: `lg: 1024px` / `xl: 1280px` (3+ columns, sidebar visible)
- Containers must scale fluidly: `w-full max-w-5xl mx-auto px-3 sm:px-6 md:px-8`.

## 2. Touch Target Ergonomics
- Minimum touch target for all interactive mobile buttons, switches, and icon links is **44×44px** (or padded container `min-h-[44px]`).
- Spacing between adjacent touch targets must be at least `8px` (`gap-2`) to avoid misclicks.

## 3. Horizontal Overflow & Clipping Prevention
- Horizontal scrolling on the body is strictly prohibited: container elements must use `w-full max-w-full overflow-x-hidden` or `truncate` on text labels.
- Long text headers, URLs, and code snippets must use `break-all` or `truncate` to prevent card stretching.

## 4. Mobile Drawer & Modal Ergonomics
- On screens `<768px`, complex multi-pane sidebars collapse into a bottom or slide-over drawer (`MobileSlideDrawer`).
- Modals on mobile must adapt to bottom sheets or full-screen scrollable overlays with a visible close button and `max-h-[92vh]`.
