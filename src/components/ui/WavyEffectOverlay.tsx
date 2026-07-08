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
        {/* Dynamic Blobs in background */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
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

        {/* Concentric Expanding Ripple Rings */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {[...Array(4)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.05, opacity: 0.9 }}
              animate={{ scale: 3.2, opacity: 0 }}
              transition={{
                duration: 3.2,
                ease: [0.16, 1, 0.3, 1],
                delay: idx * 0.7,
                repeat: Infinity,
              }}
              className="absolute rounded-full border-2"
              style={{
                borderColor: config.waveColor,
                boxShadow: `0 0 50px ${config.waveColorAlpha}, inset 0 0 50px ${config.waveColorAlpha}`,
                width: '450px',
                height: '450px',
                background: `radial-gradient(circle, ${config.waveColorAlpha} 0%, transparent 65%)`
              }}
            />
          ))}
        </div>

        {/* Floating Confetti-like bits for extra premiumness */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => {
            const angle = (i * 360) / 12;
            const distance = 160 + Math.random() * 80;
            const rad = (angle * Math.PI) / 180;
            const tx = Math.cos(rad) * distance;
            const ty = Math.sin(rad) * distance;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
                animate={{ x: tx, y: ty, scale: [0, 1.2, 0.8, 0], opacity: 0, rotate: 360 }}
                transition={{ duration: 2.5, ease: 'easeOut', delay: 0.2 }}
                className="absolute left-1/2 top-1/2 w-3.5 h-3.5 rounded-lg"
                style={{
                  backgroundColor: config.waveColor,
                  boxShadow: `0 0 10px ${config.waveColor}`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>

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
            className="absolute -top-16 -left-16 w-40 h-40 rounded-full blur-3xl pointer-events-none animate-pulse" 
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
