import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { IconCheck, IconFlame, IconSparkles } from '@tabler/icons-react';

type EffectType = 'pomodoro' | 'todo' | 'habits' | 'test';

interface EffectConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string; // Tailwind color name / CSS color
  waveColor: string;
  waveColorAlpha: string;
  accentBlob1: string;
  accentBlob2: string;
}

const EFFECT_CONFIGS: Record<EffectType, EffectConfig> = {
  pomodoro: {
    title: 'Focus Session Finished!',
    subtitle: 'Amazing focus! Time for a well-deserved break.',
    icon: <span className="text-3xl">🍅</span>,
    color: 'text-rose-500',
    waveColor: '#f43f5e',
    waveColorAlpha: 'rgba(244, 63, 94, 0.12)',
    accentBlob1: 'bg-rose-500/20',
    accentBlob2: 'bg-orange-500/20',
  },
  todo: {
    title: 'Task Completed!',
    subtitle: 'Nice job knocking that off your list! Keep going.',
    icon: <IconCheck className="w-8 h-8 text-blue-500" strokeWidth={2.5} />,
    color: 'text-blue-500',
    waveColor: '#3b82f6',
    waveColorAlpha: 'rgba(59, 130, 246, 0.12)',
    accentBlob1: 'bg-blue-500/20',
    accentBlob2: 'bg-indigo-500/20',
  },
  habits: {
    title: 'All Habits Completed!',
    subtitle: 'Incredible consistency! You completed all scheduled habits for today.',
    icon: <IconFlame className="w-8 h-8 text-emerald-500" strokeWidth={2} />,
    color: 'text-emerald-500',
    waveColor: '#10b981',
    waveColorAlpha: 'rgba(16, 185, 129, 0.12)',
    accentBlob1: 'bg-emerald-500/20',
    accentBlob2: 'bg-teal-500/20',
  },
  test: {
    title: 'Wavy Ripple Tested!',
    subtitle: 'This premium complete effect is working beautifully.',
    icon: <IconSparkles className="w-8 h-8 text-purple-500" strokeWidth={2} />,
    color: 'text-purple-500',
    waveColor: '#8b5cf6',
    waveColorAlpha: 'rgba(139, 92, 246, 0.12)',
    accentBlob1: 'bg-purple-500/20',
    accentBlob2: 'bg-pink-500/20',
  },
};

export const WavyEffectOverlay = () => {
  const settings = useAppStore((state) => state.settings);
  const [activeEffect, setActiveEffect] = useState<EffectType | null>(null);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: EffectType }>;
      const isEnabled = settings?.wavyEffectEnabled !== false;
      const isReduced = settings?.reduceAnimations === true;
      
      if (customEvent.detail?.type && isEnabled && !isReduced) {
        setActiveEffect(customEvent.detail.type);
      }
    };

    window.addEventListener('trigger-wavy-effect', handleTrigger);
    return () => {
      window.removeEventListener('trigger-wavy-effect', handleTrigger);
    };
  }, [settings]);

  // Auto-dismiss the overlay
  useEffect(() => {
    if (activeEffect) {
      const timer = setTimeout(() => {
        setActiveEffect(null);
      }, 4500); // Display for 4.5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeEffect]);

  if (!activeEffect) return null;

  const config = EFFECT_CONFIGS[activeEffect];

  return (
    <AnimatePresence>
      <div 
        onClick={() => setActiveEffect(null)}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden pointer-events-auto bg-black/35 backdrop-blur-[6px] select-none"
      >
        {/* Dynamic Blobs in background - Hidden in minimal mode for low CPU/GPU load */}
        {settings?.wavyEffectMode !== 'minimal' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70">
            <motion.div 
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 90, 0],
                x: [-20, 20, -20],
                y: [-10, 10, -10]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute w-[450px] h-[450px] rounded-full mix-blend-screen filter blur-[80px] ${config.accentBlob1}`} 
            />
            <motion.div 
              animate={{ 
                scale: [1.1, 0.95, 1.1],
                rotate: [90, 0, 90],
                x: [30, -30, 30],
                y: [20, -20, 20]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className={`absolute w-[380px] h-[380px] rounded-full mix-blend-screen filter blur-[70px] ${config.accentBlob2}`} 
              style={{ transform: 'translate(60px, -40px)' }}
            />
          </div>
        )}

        {/* Distinct Completion Effects - Bypassed in minimal mode */}
        {settings?.wavyEffectMode !== 'minimal' && (
          <>
            {/* 1. Pomodoro Breathing Ripples */}
            {activeEffect === 'pomodoro' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.1, opacity: 0.8 }}
                    animate={{ scale: [0.1, 1.9, 2.3], opacity: [0.8, 0.35, 0] }}
                    transition={{
                      duration: 3.8,
                      ease: 'easeInOut',
                      delay: idx * 1.1,
                      repeat: Infinity,
                    }}
                    className="absolute border rounded-full"
                    style={{
                      borderColor: config.waveColor,
                      boxShadow: `0 0 40px ${config.waveColor}33`,
                      width: '420px',
                      height: '420px',
                    }}
                  />
                ))}
              </div>
            )}

            {/* 2. Todo Celebratory Confetti Burst */}
            {activeEffect === 'todo' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(16)].map((_, i) => {
                  const angle = (i * 360) / 16 + (Math.random() * 10 - 5);
                  const distance = 130 + Math.random() * 110;
                  const rad = (angle * Math.PI) / 180;
                  const tx = Math.cos(rad) * distance;
                  const ty = Math.sin(rad) * distance;
                  const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
                  const particleColor = colors[i % colors.length];
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                      animate={{ x: tx, y: ty, scale: [0, 1.5, 0.7, 0], opacity: [1, 1, 0], rotate: 360 }}
                      transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 top-1/2 w-3.5 h-3.5 rounded-full"
                      style={{ 
                        backgroundColor: particleColor, 
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 8px ${particleColor}88`
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* 3. Habits Flame Sparks */}
            {activeEffect === 'habits' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(14)].map((_, i) => {
                  const startX = (Math.random() - 0.5) * 160;
                  const endX = startX + (Math.random() - 0.5) * 50;
                  const size = 6 + Math.random() * 6;
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: startX, y: 160, scale: 0, opacity: 0 }}
                      animate={{ 
                        y: [-120, -240], 
                        x: [startX, endX],
                        scale: [0, 1.4, 0.7, 0], 
                        opacity: [0, 0.95, 0.4, 0] 
                      }}
                      transition={{ 
                        duration: 2.0 + Math.random() * 1.5, 
                        ease: 'easeOut',
                        delay: Math.random() * 1.0,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 0.5
                      }}
                      className="absolute rounded-full left-1/2 top-1/2"
                      style={{ 
                        width: size,
                        height: size,
                        background: 'radial-gradient(circle, #fb923c 0%, #f43f5e 100%)',
                        boxShadow: '0 0 12px #f97316',
                        transform: 'translate(-50%, -50%)' 
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* 4. Test Colorful Sparkle Burst */}
            {activeEffect === 'test' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 360) / 12;
                  const distance = 130 + Math.random() * 80;
                  const rad = (angle * Math.PI) / 180;
                  const tx = Math.cos(rad) * distance;
                  const ty = Math.sin(rad) * distance;
                  return (
                    <motion.div
                      key={i}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                      animate={{ x: tx, y: ty, scale: [0, 1.4, 0], opacity: [1, 0], rotate: 180 }}
                      transition={{ duration: 2.2, ease: 'easeOut', delay: i * 0.04 }}
                      className="absolute w-5 h-5 text-purple-400 left-1/2 top-1/2"
                      style={{ transform: 'translate(-50%, -50%)' }}
                    >
                      <IconSparkles className="w-full h-full" />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Central Premium Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 340, mass: 0.9 }}
          className="bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/60 rounded-[28px] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.35)] w-full max-w-[360px] pointer-events-auto text-center backdrop-blur-2xl flex flex-col items-center gap-6 relative overflow-hidden antialiased m-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Radial premium gradient bloom background */}
          <div 
            className="absolute w-40 h-40 rounded-full pointer-events-none -top-16 -left-16 blur-3xl animate-pulse" 
            style={{ backgroundColor: `${config.waveColor}20` }} 
          />

          {/* Icon Container - Squircle geometry with realistic drop shadow */}
          <motion.div 
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-sm mt-3 shrink-0"
            style={{ 
              backgroundColor: `${config.waveColor}15`, 
              borderColor: `${config.waveColor}25`,
              borderWidth: '1px'
            }}
          >
            {config.icon}
          </motion.div>

          {/* Content Block */}
          <div className="w-full flex flex-col gap-2.5 px-1">
            <h3 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              {config.title}
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
              {config.subtitle}
            </p>
          </div>

          {/* Primary Call-to-action Button */}
          <button
            onClick={() => setActiveEffect(null)}
            className="w-full py-3 bg-zinc-950 dark:bg-zinc-50 text-white dark:text-zinc-950 rounded-2xl text-xs font-bold hover:opacity-95 active:scale-[0.97] transition-all duration-200 shadow-md shadow-zinc-950/10 dark:shadow-zinc-50/5 cursor-pointer"
          >
            Awesome
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
