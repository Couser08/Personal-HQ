import { useEffect, useState } from 'react';
import type { Transition, Variants } from 'framer-motion';
import type { AppSettings, PerformanceMode } from '../store/types';

export type ReducedMotionPolicy = 'always' | 'never' | 'user';

/**
 * Determines the active Framer Motion reducedMotion setting:
 * - If in Potato Mode or explicit reduceAnimations -> "always" (disables motion everywhere)
 * - If in Development mode (import.meta.env.DEV) and devMotionOverride is not explicitly false -> "never" (bypasses OS setting so animations render during local development)
 * - Otherwise (Production or explicit OS adherence) -> "user" (respects user's OS preference)
 */
export function getEffectiveReducedMotion(settings?: Partial<AppSettings>): ReducedMotionPolicy {
  const mode: PerformanceMode = settings?.performanceMode || 'balanced';
  const reduceAnimations = settings?.reduceAnimations ?? false;

  // Potato mode or explicitly reduced animations always forces motion off
  if (mode === 'potato' || reduceAnimations) {
    return 'always';
  }

  // In development mode, default to 'never' so OS reduced motion doesn't block local dev/design work,
  // unless the developer explicitly toggled off devMotionOverride to test reduced-motion accessibility.
  const isDev = Boolean(import.meta.env.DEV);
  const devOverride = settings?.devMotionOverride !== false; // defaults to true in dev

  if (isDev && devOverride) {
    return 'never';
  }

  // In production, strictly respect the user's OS-level accessibility setting
  return 'user';
}

/**
 * Synchronizes HTML root classes and dataset attributes with current performance settings.
 */
export function applyPerformanceDOMState(settings?: Partial<AppSettings>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const mode: PerformanceMode = settings?.performanceMode || 'balanced';
  const reduceBlur = settings?.reduceBlur ?? (mode !== 'balanced');
  const reduceAnimations = settings?.reduceAnimations ?? (mode === 'potato');
  const effectiveReducedMotion = getEffectiveReducedMotion(settings);

  // Set data-attribute for CSS media query guarding
  root.setAttribute('data-reduced-motion', effectiveReducedMotion);
  root.setAttribute('data-performance-mode', mode);

  // Clear previous mode classes
  root.classList.remove('mode-performance', 'mode-balanced', 'mode-potato', 'reduce-blur', 'reduce-motion');
  document.body?.classList.remove('mode-performance', 'mode-balanced', 'mode-potato', 'reduce-blur', 'reduce-motion');

  // Add active mode class
  root.classList.add(`mode-${mode}`);
  document.body?.classList.add(`mode-${mode}`);

  // Apply conditional flags
  if (reduceAnimations || mode === 'potato') {
    root.classList.add('reduce-motion');
    document.body?.classList.add('reduce-motion');
  }

  if (reduceBlur || mode === 'performance' || mode === 'potato') {
    root.classList.add('reduce-blur');
    document.body?.classList.add('reduce-blur');
  }
}

/**
 * Standardized Framer Motion spring presets adhering to fixing-motion-performance rules:
 * - Pure transform & opacity compositing
 * - Zero layout thrashing
 */
export const MOTION_SPRINGS = {
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 35,
    mass: 0.6,
  } as Transition,
  smooth: {
    type: 'spring',
    stiffness: 320,
    damping: 26,
    mass: 0.8,
  } as Transition,
  gentle: {
    type: 'spring',
    stiffness: 220,
    damping: 24,
    mass: 1,
  } as Transition,
  instant: {
    type: 'tween',
    duration: 0.001,
  } as Transition,
};

/**
 * Standardized Module / Page Transition Variants (GPU composited)
 */
export const pageModuleVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 28,
      mass: 0.7,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.99,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
};

/**
 * Lightweight telemetry hook for monitoring FPS and frame budget in real-time.
 */
export function usePerformanceTelemetry(enabled = true) {
  const [fps, setFps] = useState(60);
  const [frameTime, setFrameTime] = useState(16.6);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let active = true;
    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number | null = null;

    const loop = (now: number) => {
      if (!active) return;
      frameCount++;
      const delta = now - lastTime;

      if (delta >= 600) {
        const currentFps = Math.min(144, Math.round((frameCount * 1000) / delta));
        const currentFrameTime = +(delta / frameCount).toFixed(1);
        setFps(currentFps);
        setFrameTime(currentFrameTime);
        frameCount = 0;
        lastTime = now;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [enabled]);

  return { fps, frameTime };
}
