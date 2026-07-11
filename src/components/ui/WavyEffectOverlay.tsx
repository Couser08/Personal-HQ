import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { IconCheck, IconBroadcast, IconStarFilled } from '@tabler/icons-react';

type EffectType = 'pomodoro' | 'todo' | 'habits' | 'test';

// Cute vector Memoji profile helpers (Offline, SVG-based, looks extremely premium)
const MemojiAvatar = ({ id, className = "w-10 h-10" }: { id: number; className?: string }) => {
  switch (id) {
    case 1: // Brown hair girl
      return (
        <svg className={`${className} rounded-full border border-white/80 shadow-md`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#ffd6e0" />
          <circle cx="50" cy="54" r="28" fill="#ffd0db" /> {/* face */}
          <path d="M25 45 C25 25, 75 25, 75 45 C75 52, 70 56, 50 56 C30 56, 25 52, 25 45 Z" fill="#471018" /> {/* hair */}
          <circle cx="40" cy="46" r="3.5" fill="#471018" />
          <circle cx="60" cy="46" r="3.5" fill="#471018" />
          <path d="M44 54 Q50 58 56 54" stroke="#471018" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 2: // Cap boy
      return (
        <svg className={`${className} rounded-full border border-white/80 shadow-md`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#fef08a" />
          <circle cx="50" cy="54" r="28" fill="#fde047" />
          <path d="M30 40 C30 25, 70 25, 70 40 L70 50 L30 50 Z" fill="#2563eb" /> {/* cap */}
          <path d="M20 40 L80 40 L80 46 L20 46 Z" fill="#ef4444" /> {/* visor */}
          <circle cx="40" cy="54" r="3.5" fill="#1e3a8a" />
          <circle cx="60" cy="54" r="3.5" fill="#1e3a8a" />
          <path d="M44 62 Q50 66 56 62" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 3: // Hat girl
      return (
        <svg className={`${className} rounded-full border border-white/80 shadow-md`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#ffedd5" />
          <circle cx="50" cy="54" r="28" fill="#fed7aa" />
          <path d="M22 55 C22 35, 78 35, 78 55 Z" fill="#ca8a04" /> {/* hair */}
          <path d="M26 38 C32 24, 68 24, 74 38 Z" fill="#b45309" /> {/* hat top */}
          <path d="M16 38 L84 38 L84 44 L16 44 Z" fill="#78350f" /> {/* hat brim */}
          <circle cx="40" cy="56" r="3.5" fill="#78350f" />
          <circle cx="60" cy="56" r="3.5" fill="#78350f" />
          <path d="M44 64 Q50 68 56 64" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 4: // Glass girl
      return (
        <svg className={`${className} rounded-full border border-white/80 shadow-md`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#bfdbfe" />
          <circle cx="50" cy="54" r="28" fill="#93c5fd" />
          <path d="M22 50 C22 30, 78 30, 78 50 Z" fill="#1e3a8a" /> {/* hair */}
          <circle cx="38" cy="52" r="10" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <circle cx="62" cy="52" r="10" stroke="#ef4444" strokeWidth="3.5" fill="none" />
          <line x1="48" y1="52" x2="52" y2="52" stroke="#ef4444" strokeWidth="3.5" />
          <circle cx="38" cy="52" r="3.5" fill="#1e3a8a" />
          <circle cx="62" cy="52" r="3.5" fill="#1e3a8a" />
          <path d="M44 65 Q50 69 56 65" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default: // Pink hat boy
      return (
        <svg className={`${className} rounded-full border border-white/80 shadow-md`} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="50" fill="#fbcfe8" />
          <circle cx="50" cy="54" r="28" fill="#f472b6" />
          <path d="M30 42 C30 28, 70 28, 70 42 Z" fill="#db2777" /> {/* beanie */}
          <circle cx="40" cy="54" r="3.5" fill="#831843" />
          <circle cx="60" cy="54" r="3.5" fill="#831843" />
          <path d="M44 62 Q50 66 56 62" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
  }
};

// Config structure
interface AnimationDetails {
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  badgeClass: string;
  buttonClass: string;
}

export const WavyEffectOverlay = () => {
  const settings = useAppStore((state) => state.settings);
  const [activeEffect, setActiveEffect] = useState<EffectType | null>(null);
  
  // Randomly select animation variant (1, 2, or 3) on mount
  const [variant, setVariant] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: EffectType }>;
      const isEnabled = settings?.wavyEffectEnabled !== false;
      const isReduced = settings?.reduceAnimations === true;
      
      if (customEvent.detail?.type && isEnabled && !isReduced) {
        // Pick a random variant (1, 2, or 3)
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
      }, 5500); // 5.5 seconds overlay
      return () => clearTimeout(timer);
    }
  }, [activeEffect]);

  if (!activeEffect) return null;

  // Resolve test type to habits/todo/pomodoro variant randomly
  const resolvedEffect = activeEffect === 'test' 
    ? (['habits', 'todo', 'pomodoro'] as const)[Math.floor(Math.random() * 3)]
    : activeEffect;

  // Render text data based on resolved type and variant
  const info: AnimationDetails = (() => {
    if (resolvedEffect === 'habits') {
      switch (variant) {
        case 1:
          return {
            badge: 'Animation 1',
            title: 'Great job! 🌟',
            subtitle: 'You completed your habit. Keep the streak going!',
            buttonText: 'Awesome!',
            badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
            buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          };
        case 2:
          return {
            badge: 'Animation 2',
            title: 'Habit Completed! 🎉',
            subtitle: "You're building something incredible!",
            buttonText: 'Awesome!',
            badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
            buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          };
        default:
          return {
            badge: 'Animation 3',
            title: 'Streak Maintained! 🔥',
            subtitle: "Another day, another win! You're on fire!",
            buttonText: 'Awesome!',
            badgeClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
            buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
          };
      }
    } else if (resolvedEffect === 'todo') {
      switch (variant) {
        case 1:
          return {
            badge: 'Animation 1',
            title: 'Task Completed! 🚀',
            subtitle: 'You just checked off a task from your list.',
            buttonText: 'Nice Work!',
            badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
            buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20'
          };
        case 2:
          return {
            badge: 'Animation 2',
            title: 'All Set! ✅',
            subtitle: 'This task is now complete. Great progress!',
            buttonText: 'Nice Work!',
            badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
            buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20'
          };
        default:
          return {
            badge: 'Animation 3',
            title: 'Done & Dusted! 🎯',
            subtitle: 'One step closer to your goals.',
            buttonText: 'Nice Work!',
            badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
            buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20'
          };
      }
    } else { // pomodoro
      switch (variant) {
        case 1:
          return {
            badge: 'Animation 1 – AirDrop Pulse',
            title: 'Focus Complete! 🌐',
            subtitle: "Great session! Ready for what's next?",
            buttonText: 'Awesome!',
            badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
            buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
          };
        case 2:
          return {
            badge: 'Animation 2 – Receiving',
            title: 'Session Done! 📡',
            subtitle: 'Your focus is being shared with success.',
            buttonText: 'Awesome!',
            badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
            buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
          };
        default:
          return {
            badge: 'Animation 3 – Shared!',
            title: 'Great Focus! 🌐',
            subtitle: 'Your session is complete and synced.',
            buttonText: 'Awesome!',
            badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
            buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
          };
      }
    }
  })();

  return (
    <AnimatePresence>
      <div 
        onClick={() => setActiveEffect(null)}
        className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden pointer-events-auto bg-black/45 dark:bg-black/75 backdrop-blur-[8px] select-none"
      >
        
        {/* Central visual card (Responsive split layout matching the design image) */}
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
            <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${info.badgeClass}`}>
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
          <div className="w-[180px] h-[180px] rounded-3xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-center shrink-0 order-1 md:order-2 relative overflow-hidden shadow-inner select-none">
            
            {/* ── Habits Animation Visuals ── */}
            {resolvedEffect === 'habits' && (
              <>
                {/* 1. Orbit Sparkles */}
                {variant === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.15)] z-10">
                      <IconCheck className="w-7 h-7 stroke-[3]" />
                    </div>
                    {/* Ring orbit */}
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-emerald-500/20 animate-spin" style={{ animationDuration: '6s' }} />
                    {/* Orbiting particles */}
                    {[...Array(6)].map((_, i) => {
                      const angle = (i * 360) / 6;
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * 44;
                      const y = Math.sin(rad) * 44;
                      return (
                        <motion.div
                          key={i}
                          animate={{ 
                            scale: [0.7, 1.2, 0.7], 
                            opacity: [0.6, 1, 0.6] 
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
                          style={{ left: `calc(50% + ${x}px - 3px)`, top: `calc(50% + ${y}px - 3px)` }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 2. 3D Floating Block & Confetti */}
                {variant === 2 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d', transform: 'perspective(400px) rotateX(16deg) rotateY(-16deg)' }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white border-b-[5px] border-emerald-700 shadow-lg shadow-emerald-500/20"
                    >
                      <IconCheck className="w-7 h-7 stroke-[3.5]" />
                    </motion.div>
                    
                    {/* Floating confetti dots */}
                    {[...Array(12)].map((_, i) => {
                      const x = (Math.random() - 0.5) * 120;
                      const y = (Math.random() - 0.5) * 120;
                      const colors = ['#34d399', '#f87171', '#60a5fa', '#fbbf24', '#c084fc'];
                      const col = colors[i % colors.length];
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: [0, 1.2, 0.5, 0], opacity: [0, 1, 1, 0], x, y }}
                          transition={{ duration: 2.2, repeat: Infinity, delay: Math.random() * 1.5 }}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: col }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 3. Streak Progress Rings */}
                {variant === 3 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 z-10">
                      <IconCheck className="w-6 h-6 stroke-[3]" />
                    </div>
                    {/* Ring 1 */}
                    <svg className="absolute w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="42" stroke="var(--border-border)" strokeWidth="4" fill="transparent" className="opacity-10" />
                      <motion.circle 
                        cx="48" cy="48" r="42" 
                        stroke="#10b981" strokeWidth="4" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 42}
                        initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                        animate={{ strokeDashoffset: [2 * Math.PI * 42, 0] }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Ring 2 */}
                    <svg className="absolute w-30 h-30 transform rotate-45">
                      <circle cx="60" cy="60" r="54" stroke="var(--border-border)" strokeWidth="2.5" fill="transparent" className="opacity-5" />
                      <motion.circle 
                        cx="60" cy="60" r="54" 
                        stroke="#60a5fa" strokeWidth="2.5" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 54}
                        initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                        animate={{ strokeDashoffset: [2 * Math.PI * 54, 2 * Math.PI * 18] }}
                        transition={{ duration: 2.2, ease: 'easeOut', delay: 0.2 }}
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                )}
              </>
            )}

            {/* ── Tasks Animation Visuals ── */}
            {resolvedEffect === 'todo' && (
              <>
                {/* 1. Orbit Sparkles (Purple) */}
                {variant === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.15)] z-10">
                      <IconCheck className="w-7 h-7 stroke-[3]" />
                    </div>
                    {/* Ring orbit */}
                    <div className="absolute w-24 h-24 rounded-full border border-dashed border-purple-500/20 animate-spin" style={{ animationDuration: '6s' }} />
                    {[...Array(6)].map((_, i) => {
                      const angle = (i * 360) / 6;
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * 44;
                      const y = Math.sin(rad) * 44;
                      return (
                        <motion.div
                          key={i}
                          animate={{ 
                            scale: [0.7, 1.2, 0.7], 
                            opacity: [0.6, 1, 0.6] 
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                          style={{ left: `calc(50% + ${x}px - 3px)`, top: `calc(50% + ${y}px - 3px)` }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* 2. 3D Floating Block & Stars */}
                {variant === 2 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ transformStyle: 'preserve-3d', transform: 'perspective(400px) rotateX(16deg) rotateY(-16deg)' }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white border-b-[5px] border-purple-700 shadow-lg shadow-purple-500/20"
                    >
                      <IconCheck className="w-7 h-7 stroke-[3.5]" />
                    </motion.div>
                    
                    {/* Orbiting star icons */}
                    {[...Array(6)].map((_, i) => {
                      const angle = (i * 360) / 6;
                      const rad = (angle * Math.PI) / 180;
                      const x = Math.cos(rad) * 46;
                      const y = Math.sin(rad) * 46;
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: [0.6, 1, 0.6], rotate: 180 }}
                          transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
                          className="absolute text-amber-400"
                          style={{ left: `calc(50% + ${x}px - 6px)`, top: `calc(50% + ${y}px - 6px)` }}
                        >
                          <IconStarFilled className="w-3.5 h-3.5" />
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* 3. Radial Burst Firework */}
                {variant === 3 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/15 z-10">
                      <IconCheck className="w-6 h-6 stroke-[3]" />
                    </div>

                    {/* Expanding particle lines */}
                    {[...Array(16)].map((_, i) => {
                      const angle = (i * 360) / 16;
                      const rad = (angle * Math.PI) / 180;
                      const startDistance = 24;
                      const endDistance = 58;
                      const sx = Math.cos(rad) * startDistance;
                      const sy = Math.sin(rad) * startDistance;
                      const ex = Math.cos(rad) * endDistance;
                      const ey = Math.sin(rad) * endDistance;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ 
                            x: [sx, ex], 
                            y: [sy, ey], 
                            scale: [0, 1.2, 0.4], 
                            opacity: [0, 1, 0] 
                          }}
                          transition={{ duration: 1.6, repeat: Infinity, delay: Math.random() * 0.4 }}
                          className="absolute w-1 h-3 rounded-full bg-purple-400"
                          style={{ 
                            transform: `rotate(${angle + 90}deg)`,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* ── Pomodoro AirDrop Style Animation Visuals ── */}
            {resolvedEffect === 'pomodoro' && (
              <>
                {/* 1. AirDrop Pulse Radar with Avatars */}
                {variant === 1 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center z-15 shadow-md shadow-blue-500/20">
                      <IconCheck className="w-6 h-6 stroke-[3.5]" />
                    </div>

                    {/* Pulsing Concentric Circles */}
                    {[...Array(3)].map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0.4, opacity: 0.8 }}
                        animate={{ scale: [0.4, 2.1, 2.8], opacity: [0.8, 0.35, 0] }}
                        transition={{
                          duration: 3,
                          ease: 'easeInOut',
                          delay: idx * 0.9,
                          repeat: Infinity,
                        }}
                        className="absolute border border-blue-500/35 rounded-full w-[60px] h-[60px] pointer-events-none"
                      />
                    ))}

                    {/* Surrounding Avatar Bubbles */}
                    {[
                      { id: 1, x: -50, y: -45 },
                      { id: 2, x: 50, y: -50 },
                      { id: 3, x: -45, y: 45 },
                      { id: 4, x: 55, y: 40 }
                    ].map(av => (
                      <motion.div
                        key={av.id}
                        animate={{ 
                          scale: [1, 1.05, 1], 
                          y: [av.y, av.y - 3, av.y] 
                        }}
                        transition={{ duration: 3 + av.id, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute"
                        style={{ left: `calc(50% + ${av.x}px - 14px)`, top: `calc(50% + ${av.y}px - 14px)` }}
                      >
                        <MemojiAvatar id={av.id} className="w-7 h-7" />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 2. Antenna Receiving Beam */}
                {variant === 2 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* Beam Light Effect */}
                    <div className="absolute top-16 bottom-0 w-24 bg-gradient-to-b from-blue-500/20 to-transparent blur-md transform -translate-x-1" />

                    {/* Custom SVG AirDrop Signal Antenna */}
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.15)] z-10">
                      <IconBroadcast className="w-8 h-8 stroke-[2] animate-pulse" />
                    </div>

                    {/* Waves expanding outwards */}
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.7, opacity: 0.9 }}
                        animate={{ scale: [0.7, 2], opacity: [0.9, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7 }}
                        className="absolute border border-blue-500/20 rounded-full w-20 h-20"
                      />
                    ))}

                    <div className="absolute bottom-3 font-mono text-[9px] text-blue-500 font-extrabold uppercase tracking-widest leading-none">
                      Syncing...
                    </div>
                  </div>
                )}

                {/* 3. Node Shared Network */}
                {variant === 3 && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    
                    {/* Central Check Node */}
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center z-15 shadow-sm">
                      <IconCheck className="w-5 h-5 stroke-[3]" />
                    </div>

                    {/* Radial Nodes mapping */}
                    {[
                      { id: 1, x: -50, y: -45 },
                      { id: 2, x: 50, y: -50 },
                      { id: 3, x: -45, y: 45 },
                      { id: 4, x: 55, y: 40 }
                    ].map(av => (
                      <div key={av.id} className="absolute inset-0">
                        {/* Connecting Line */}
                        <svg className="absolute inset-0 w-full h-full">
                          <line 
                            x1="90" y1="90" 
                            x2={90 + av.x} y2={90 + av.y} 
                            stroke="rgba(59, 130, 246, 0.25)" 
                            strokeWidth="2" 
                            strokeDasharray="4 4"
                          />
                        </svg>

                        {/* Pulse Packet traveling down the line */}
                        <motion.div
                          animate={{ 
                            x: [0, av.x], 
                            y: [0, av.y],
                            scale: [0.8, 1.2, 0.8],
                            opacity: [1, 1, 0.3] 
                          }}
                          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: av.id * 0.2 }}
                          className="absolute w-2 h-2 rounded-full bg-blue-400 left-[86px] top-[86px] z-10 shadow-sm"
                        />

                        {/* Surrounding Node Avatar */}
                        <div 
                          className="absolute"
                          style={{ left: `calc(50% + ${av.x}px - 14px)`, top: `calc(50% + ${av.y}px - 14px)` }}
                        >
                          <MemojiAvatar id={av.id} className="w-7 h-7" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
