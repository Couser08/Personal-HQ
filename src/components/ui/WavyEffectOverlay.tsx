import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  type EffectType,
  type AnimationDetails,
  resolveAnimationDetails,
} from './wavy/wavyConfigs';
import { WavyAnimationCanvas } from './wavy/WavyAnimationCanvas';

export const WavyEffectOverlay = () => {
  const settings = useAppStore((state) => state.settings);
  const [activeEffect, setActiveEffect] = useState<EffectType | null>(null);
  const [variant, setVariant] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: EffectType }>;
      const isEnabled =
        settings?.wavyEffectEnabled !== false && settings?.performanceMode !== 'potato';
      const isReduced =
        settings?.reduceAnimations === true || settings?.performanceMode === 'potato';

      if (customEvent.detail?.type && isEnabled && !isReduced) {
        const rand = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
        setVariant(rand);
        setActiveEffect(customEvent.detail.type);
      }
    };

    window.addEventListener('trigger-wavy-effect', handleTrigger);
    return () => {
      window.removeEventListener('trigger-wavy-effect', handleTrigger);
    };
  }, [settings]);

  // Auto-dismiss
  useEffect(() => {
    if (activeEffect) {
      const timer = setTimeout(() => {
        setActiveEffect(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [activeEffect]);

  if (!activeEffect) return null;

  const resolvedEffect: 'habits' | 'todo' | 'pomodoro' =
    activeEffect === 'test'
      ? (['habits', 'todo', 'pomodoro'] as const)[Math.floor(Math.random() * 3)]
      : activeEffect;

  const info: AnimationDetails = resolveAnimationDetails(resolvedEffect, variant);

  return (
    <AnimatePresence>
      <div
        onClick={() => setActiveEffect(null)}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden pointer-events-auto bg-black/45 dark:bg-black/75 backdrop-blur-[8px] select-none"
      >
        {/* Central visual card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320, mass: 0.9 }}
          className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/80 rounded-[36px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.35)] w-full max-w-[620px] pointer-events-auto p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden antialiased m-4 border-t border-t-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Text block (Left side) */}
          <div className="flex-1 flex flex-col items-start gap-4 text-left order-2 md:order-1">
            <span
              className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${info.badgeClass}`}
            >
              {info.badge}
            </span>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                {info.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                {info.subtitle}
              </p>
            </div>
            <button
              onClick={() => setActiveEffect(null)}
              className={`w-full md:w-auto px-8 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-lg ${info.buttonClass}`}
            >
              {info.buttonText}
            </button>
          </div>

          {/* Visual animation canvas (Right side) */}
          <WavyAnimationCanvas resolvedEffect={resolvedEffect} variant={variant} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
