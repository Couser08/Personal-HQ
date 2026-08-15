import { create } from 'zustand';
import { type MotionMode, MOTION_PRESETS } from './types';

import { useAppStore } from '../../store/useAppStore';

interface MotionTestState {
  mode: MotionMode;
  fps: number;
  avgFrameTime: number;
  setMode: (mode: MotionMode) => void;
  updateMetrics: (fps: number, avgFrameTime: number) => void;
}

export const useMotionTestStore = create<MotionTestState>((set) => ({
  mode: ((localStorage.getItem('phq_test_motion_mode') || 'balanced') as MotionMode),
  fps: 60,
  avgFrameTime: 16.6,
  setMode: (mode: MotionMode) => {
    localStorage.setItem('phq_test_motion_mode', mode);
    set({ mode });
    try {
      useAppStore.getState().updateSettings({
        performanceMode: mode,
        reduceBlur: mode !== 'balanced',
        reduceAnimations: mode === 'potato',
        wavyEffectEnabled: mode !== 'potato',
        wavyEffectMode: mode === 'balanced' ? 'premium' : 'minimal'
      });
    } catch {
      // ignore
    }
  },
  updateMetrics: (fps: number, avgFrameTime: number) => {
    set({ fps, avgFrameTime });
  }
}));

export function useActivePreset() {
  const storeMode = useMotionTestStore((s) => s.mode);
  const appMode = useAppStore((s) => s.settings.performanceMode);
  const active = (appMode || storeMode || 'balanced') as MotionMode;
  return MOTION_PRESETS[active] || MOTION_PRESETS.balanced;
}
