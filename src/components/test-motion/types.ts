export type MotionMode = 'performance' | 'balanced' | 'potato';

export interface MotionConfigPreset {
  mode: MotionMode;
  label: string;
  desc: string;
  iconEmoji: string;
  springStiffness: number;
  springDamping: number;
  enableParallax: boolean;
  enableParticles: boolean;
  enableBlur: boolean;
  maxFps: number;
  reducedMotion: boolean;
}

export const MOTION_PRESETS: Record<MotionMode, MotionConfigPreset> = {
  performance: {
    mode: 'performance',
    label: 'Performance',
    desc: 'Pure GPU compositing (120 FPS), zero blur, crisp snappy spring response',
    iconEmoji: '⚡',
    springStiffness: 500,
    springDamping: 35,
    enableParallax: false,
    enableParticles: false,
    enableBlur: false,
    maxFps: 120,
    reducedMotion: false,
  },
  balanced: {
    mode: 'balanced',
    label: 'Balanced',
    desc: 'Silky smooth motion, fluid 3D parallax, soft glassmorphism & particle bursts',
    iconEmoji: '✨',
    springStiffness: 320,
    springDamping: 24,
    enableParallax: true,
    enableParticles: true,
    enableBlur: true,
    maxFps: 60,
    reducedMotion: false,
  },
  potato: {
    mode: 'potato',
    label: 'Potato',
    desc: 'Ultra-lightweight potato mode: zero continuous loops, instant snap transitions, 0% idle CPU',
    iconEmoji: '🥔',
    springStiffness: 1000,
    springDamping: 50,
    enableParallax: false,
    enableParticles: false,
    enableBlur: false,
    maxFps: 60,
    reducedMotion: true,
  },
};
