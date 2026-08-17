import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMotionTestStore } from './useMotionTestStore';
import { type MotionMode, MOTION_PRESETS } from './types';
import { IconBolt, IconSparkles, IconActivity } from '@tabler/icons-react';
import { useToastStore } from '../../store/useToastStore';
import { useAppStore } from '../../store/useAppStore';

export function MotionModeSwitcher() {
  const { fps, avgFrameTime, setMode, updateMetrics } = useMotionTestStore();
  const appMode = useAppStore((s) => s.settings.performanceMode);
  const storeMode = useMotionTestStore((s) => s.mode);
  const mode = (appMode || storeMode || 'balanced') as MotionMode;
  const addToast = useToastStore((s) => s.addToast);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number | null>(null);

  // Passive FPS & Frame Budget Monitor
  useEffect(() => {
    let active = true;

    const loop = (now: number) => {
      if (!active) return;
      frameCountRef.current++;
      const delta = now - lastTimeRef.current;

      if (delta >= 600) {
        const currentFps = Math.min(120, Math.round((frameCountRef.current * 1000) / delta));
        const frameTime = +(delta / frameCountRef.current).toFixed(1);
        updateMetrics(currentFps, frameTime);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateMetrics]);

  const handleSelectMode = (newMode: MotionMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    const preset = MOTION_PRESETS[newMode];
    addToast(
      `${preset.iconEmoji} ${preset.label} Mode Active`,
      preset.desc,
      'info'
    );
  };

  const getModeIcon = (m: MotionMode) => {
    switch (m) {
      case 'performance':
        return <IconBolt size={16} className="text-amber-500" />;
      case 'balanced':
        return <IconSparkles size={16} className="text-purple-500" />;
      case 'potato':
        return <span className="text-sm">🥔</span>;
    }
  };

  return (
    <div className="w-full bg-surface border border-border rounded-3xl p-5 shadow-float backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Active Spec */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20 shrink-0">
            {MOTION_PRESETS[mode]?.iconEmoji || '✨'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-text-primary">Animation Engine & Mode Switcher</h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-alt border border-border text-text-secondary">
                {mode}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 leading-snug max-w-md">
              {MOTION_PRESETS[mode]?.desc}
            </p>
          </div>
        </div>

        {/* Live FPS Telemetry Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-surface-alt/70 border border-border rounded-2xl px-3.5 py-2">
          <IconActivity size={16} className={fps >= 55 ? 'text-emerald-500 animate-pulse' : fps >= 30 ? 'text-amber-500' : 'text-rose-500'} />
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className={`text-sm font-black ${fps >= 55 ? 'text-emerald-500' : fps >= 30 ? 'text-amber-500' : 'text-rose-500'}`}>
              {fps}
            </span>
            <span className="text-[10px] font-bold text-text-muted">FPS</span>
            <span className="text-text-muted/40 text-xs">•</span>
            <span className="text-[11px] text-text-secondary">{avgFrameTime}ms</span>
          </div>
        </div>
      </div>

      {/* 3 Modes Switcher Buttons: Performance, Balanced, Potato */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5 p-1.5 bg-surface-alt rounded-2xl border border-border">
        {(Object.keys(MOTION_PRESETS) as MotionMode[]).map((mKey) => {
          const preset = MOTION_PRESETS[mKey];
          const isSelected = mode === mKey;

          return (
            <button
              key={mKey}
              onClick={() => handleSelectMode(mKey)}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all cursor-pointer text-left font-sans ${
                isSelected
                  ? 'bg-surface text-text-primary shadow-sm border border-border font-bold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface/50 border border-transparent font-medium'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMotionPill"
                  className="absolute inset-0 rounded-xl bg-surface border border-border shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <div className="shrink-0">{getModeIcon(mKey)}</div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold leading-tight truncate">
                  {preset.label}
                </span>
                <span className="text-[10px] opacity-70 leading-tight truncate">
                  {mKey === 'performance' ? '120fps GPU Only' : mKey === 'balanced' ? 'Springs & Shaders' : 'Instant Zero-Lag'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
