import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivePreset } from './useMotionTestStore';
import { IconCheck, IconFlame, IconDroplet, IconWalk, IconSparkles } from '@tabler/icons-react';

interface HabitItem {
  id: string;
  name: string;
  color: string;
  icon: any;
  current: number;
  target: number;
  unit: string;
}

export function MorphingHabitRing() {
  const preset = useActivePreset();

  const [habits, setHabits] = useState<HabitItem[]>([
    { id: 'focus', name: 'Deep Focus', color: '#FF7A45', icon: IconFlame, current: 4, target: 5, unit: 'hrs' },
    { id: 'water', name: 'Hydration', color: '#3B82F6', icon: IconDroplet, current: 2000, target: 2500, unit: 'ml' },
    { id: 'steps', name: 'Daily Movement', color: '#10B981', icon: IconWalk, current: 8500, target: 10000, unit: 'steps' },
  ]);

  const [burstHabitId, setBurstHabitId] = useState<string | null>(null);

  const incrementHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const step = h.id === 'water' ? 250 : h.id === 'steps' ? 1000 : 0.5;
        const nextVal = Math.min(h.target * 1.5, h.current + step);
        if (nextVal >= h.target && h.current < h.target) {
          triggerCelebration(id);
        }
        return { ...h, current: nextVal };
      })
    );
  };

  const triggerCelebration = (id: string) => {
    setBurstHabitId(id);
    setTimeout(() => setBurstHabitId(null), 1200);
  };

  const size = 160;
  const strokeWidth = 10;
  const center = size / 2;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          2. Multi-Layer Morphing Activity Rings
        </h3>
        <span className="text-[10px] font-mono text-text-muted">
          {preset.enableParticles ? 'Particles Active' : preset.mode === 'performance' ? 'CSS Compositing' : 'Static Ring'}
        </span>
      </div>

      <div className="w-full bg-surface border border-border rounded-3xl p-6 shadow-float flex flex-col md:flex-row items-center gap-8 justify-between">
        
        {/* Concentric SVG Rings Container */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {habits.map((h, i) => {
              const radius = center - strokeWidth - i * 16;
              const circumference = 2 * Math.PI * radius;
              const pct = Math.min(1, h.current / h.target);
              const strokeDashoffset = circumference - pct * circumference;

              return (
                <g key={h.id}>
                  {/* Track */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    className="text-border"
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={0.3}
                  />
                  {/* Progress Arc */}
                  <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={h.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={circumference}
                    initial={false}
                    animate={{ strokeDashoffset }}
                    transition={{
                      type: 'spring',
                      stiffness: preset.springStiffness,
                      damping: preset.springDamping,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Activity Sparkle Icon */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <IconSparkles size={22} className="text-primary opacity-80" />
            <span className="text-[10px] font-mono font-bold text-text-muted mt-0.5">HQ RING</span>
          </div>

          {/* Floating Confetti Particle Bursts (Balanced Mode Only) */}
          <AnimatePresence>
            {preset.enableParticles && burstHabitId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.2 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {[...Array(8)].map((_, idx) => {
                  const angle = (idx * 45 * Math.PI) / 180;
                  const dist = 60;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ x: 0, y: 0, opacity: 1 }}
                      animate={{
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute w-2 h-2 rounded-full bg-accent-highlight shadow-sm"
                    />
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Habit Controls List */}
        <div className="flex flex-col gap-2.5 w-full">
          {habits.map((h) => {
            const Icon = h.icon;
            const isCompleted = h.current >= h.target;
            const pct = Math.round((h.current / h.target) * 100);

            return (
              <div
                key={h.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-alt border border-border/60 hover:border-border transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${h.color}15`, color: h.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-text-primary">{h.name}</h4>
                      {isCompleted && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-0.5">
                          <IconCheck size={10} strokeWidth={3} /> Done
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-text-secondary">
                      {h.current} / {h.target} {h.unit} ({pct}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => incrementHabit(h.id)}
                  className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover text-text-primary text-xs font-bold border border-border shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
