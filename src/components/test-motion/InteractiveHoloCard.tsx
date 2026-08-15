import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useActivePreset } from './useMotionTestStore';
import { IconFlame, IconTarget, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';

export function InteractiveHoloCard() {
  const preset = useActivePreset();
  const cardRef = useRef<HTMLDivElement>(null);

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(65);
  const [isRunning, setIsRunning] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!preset.enableParallax || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -12; // tilt max ±12 deg
    const rY = ((x - centerX) / centerX) * 12;
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          1. 3D Holographic Focus Card
        </h3>
        <span className="text-[10px] font-mono text-text-muted">
          {preset.enableParallax ? '3D Parallax ON' : preset.mode === 'performance' ? 'GPU Transform' : 'Reduced Motion'}
        </span>
      </div>

      <div 
        style={{ perspective: preset.enableParallax ? 1000 : undefined }}
        className="w-full flex justify-center py-2"
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotateX: preset.enableParallax ? rotateX : 0,
            rotateY: preset.enableParallax ? rotateY : 0,
            scale: isHovered && !preset.reducedMotion ? 1.02 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: preset.springStiffness,
            damping: preset.springDamping,
          }}
          style={{ willChange: 'transform' }}
          className={`w-full relative overflow-hidden rounded-3xl p-6 border transition-colors select-none ${
            preset.enableBlur 
              ? 'bg-surface/85 backdrop-blur-xl border-border shadow-float hover:shadow-float-hover'
              : 'bg-surface border-border shadow-md'
          }`}
        >
          {/* Subtle Ambient Radial Light Reflection (Balanced Mode Only) */}
          {preset.enableBlur && isHovered && (
            <div 
              className="absolute -inset-10 pointer-events-none opacity-20 bg-gradient-to-tr from-rose-500 via-purple-500 to-amber-500 blur-2xl transition-opacity duration-300"
            />
          )}

          <div className="relative z-10 flex flex-col gap-4">
            
            {/* Header Badge & Streak */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  <IconTarget size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary leading-none">Deep Work Sprint</h4>
                  <span className="text-[11px] text-text-secondary">Core Architecture & Shaders</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                <IconFlame size={14} className={preset.reducedMotion ? '' : 'animate-bounce'} />
                <span>4 Days</span>
              </div>
            </div>

            {/* Progress Display */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-text-secondary">Milestone Progress</span>
                <span className="text-text-primary font-mono">{progress}%</span>
              </div>
              <div className="h-3 w-full bg-surface-alt rounded-full overflow-hidden p-0.5 border border-border">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent-highlight"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{
                    type: 'spring',
                    stiffness: preset.springStiffness,
                    damping: preset.springDamping,
                  }}
                />
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex gap-2">
                <button
                  onClick={() => setProgress((p) => Math.min(100, p + 15))}
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-primary text-xs font-bold border border-border cursor-pointer transition-all active:scale-95"
                >
                  +15% Task
                </button>
                <button
                  onClick={() => setProgress(0)}
                  className="px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-secondary text-xs font-semibold border border-border cursor-pointer transition-all active:scale-95"
                >
                  Reset
                </button>
              </div>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-text-on-accent text-xs font-bold cursor-pointer hover:opacity-90 transition-all active:scale-95 shadow-sm"
              >
                {isRunning ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
