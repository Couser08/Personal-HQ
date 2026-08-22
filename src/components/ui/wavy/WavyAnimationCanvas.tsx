import React from 'react';
import { motion } from 'framer-motion';
import { IconCheck, IconStarFilled, IconBroadcast } from '@tabler/icons-react';
import { MemojiAvatar } from './MemojiAvatar';

interface WavyAnimationCanvasProps {
  resolvedEffect: 'habits' | 'todo' | 'pomodoro';
  variant: 1 | 2 | 3;
}

export const WavyAnimationCanvas: React.FC<WavyAnimationCanvasProps> = ({
  resolvedEffect,
  variant,
}) => {
  return (
    <div className="w-[180px] h-[180px] rounded-3xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-center shrink-0 order-1 md:order-2 relative overflow-hidden shadow-inner select-none">
      {/* ── Habits Animation Visuals ── */}
      {resolvedEffect === 'habits' && (
        <>
          {variant === 1 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.15)] z-10">
                <IconCheck className="w-7 h-7 stroke-[3]" />
              </div>
              <div
                className="absolute w-24 h-24 rounded-full border border-dashed border-emerald-500/20 animate-spin"
                style={{ animationDuration: '6s' }}
              />
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
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
                    style={{
                      left: `calc(50% + ${x}px - 3px)`,
                      top: `calc(50% + ${y}px - 3px)`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {variant === 2 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'perspective(400px) rotateX(16deg) rotateY(-16deg)',
                }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white border-b-[5px] border-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                <IconCheck className="w-7 h-7 stroke-[3.5]" />
              </motion.div>

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

          {variant === 3 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/10 z-10">
                <IconCheck className="w-6 h-6 stroke-[3]" />
              </div>
              <svg className="absolute w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="var(--border-border)"
                  strokeWidth="4"
                  fill="transparent"
                  className="opacity-10"
                />
                <motion.circle
                  cx="48"
                  cy="48"
                  r="42"
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 42}
                  initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                  animate={{ strokeDashoffset: [2 * Math.PI * 42, 0] }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              <svg className="absolute w-30 h-30 transform rotate-45">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="var(--border-border)"
                  strokeWidth="2.5"
                  fill="transparent"
                  className="opacity-5"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  fill="transparent"
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
          {variant === 1 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-[0_0_24px_rgba(168,85,247,0.15)] z-10">
                <IconCheck className="w-7 h-7 stroke-[3]" />
              </div>
              <div
                className="absolute w-24 h-24 rounded-full border border-dashed border-purple-500/20 animate-spin"
                style={{ animationDuration: '6s' }}
              />
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
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full"
                    style={{
                      left: `calc(50% + ${x}px - 3px)`,
                      top: `calc(50% + ${y}px - 3px)`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {variant === 2 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'perspective(400px) rotateX(16deg) rotateY(-16deg)',
                }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white border-b-[5px] border-purple-700 shadow-lg shadow-purple-500/20"
              >
                <IconCheck className="w-7 h-7 stroke-[3.5]" />
              </motion.div>

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
                    style={{
                      left: `calc(50% + ${x}px - 6px)`,
                      top: `calc(50% + ${y}px - 6px)`,
                    }}
                  >
                    <IconStarFilled className="w-3.5 h-3.5" />
                  </motion.div>
                );
              })}
            </div>
          )}

          {variant === 3 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/15 z-10">
                <IconCheck className="w-6 h-6 stroke-[3]" />
              </div>

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
                      opacity: [0, 1, 0],
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
          {variant === 1 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center z-15 shadow-md shadow-blue-500/20">
                <IconCheck className="w-6 h-6 stroke-[3.5]" />
              </div>

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

              {[
                { id: 1, x: -50, y: -45 },
                { id: 2, x: 50, y: -50 },
                { id: 3, x: -45, y: 45 },
                { id: 4, x: 55, y: 40 },
              ].map((av) => (
                <motion.div
                  key={av.id}
                  animate={{
                    scale: [1, 1.05, 1],
                    y: [av.y, av.y - 3, av.y],
                  }}
                  transition={{ duration: 3 + av.id, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${av.x}px - 14px)`,
                    top: `calc(50% + ${av.y}px - 14px)`,
                  }}
                >
                  <MemojiAvatar id={av.id} className="w-7 h-7" />
                </motion.div>
              ))}
            </div>
          )}

          {variant === 2 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="absolute top-16 bottom-0 w-24 bg-gradient-to-b from-blue-500/20 to-transparent blur-md transform -translate-x-1" />

              <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_24px_rgba(59,130,246,0.15)] z-10">
                <IconBroadcast className="w-8 h-8 stroke-[2] animate-pulse" />
              </div>

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

          {variant === 3 && (
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center z-15 shadow-sm">
                <IconCheck className="w-5 h-5 stroke-[3]" />
              </div>

              {[
                { id: 1, x: -50, y: -45 },
                { id: 2, x: 50, y: -50 },
                { id: 3, x: -45, y: 45 },
                { id: 4, x: 55, y: 40 },
              ].map((av) => (
                <div key={av.id} className="absolute inset-0">
                  <svg className="absolute inset-0 w-full h-full">
                    <line
                      x1="90"
                      y1="90"
                      x2={90 + av.x}
                      y2={90 + av.y}
                      stroke="rgba(59, 130, 246, 0.25)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  <motion.div
                    animate={{
                      x: [0, av.x],
                      y: [0, av.y],
                      scale: [0.8, 1.2, 0.8],
                      opacity: [1, 1, 0.3],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: av.id * 0.2,
                    }}
                    className="absolute w-2 h-2 rounded-full bg-blue-400 left-[86px] top-[86px] z-10 shadow-sm"
                  />

                  <div
                    className="absolute"
                    style={{
                      left: `calc(50% + ${av.x}px - 14px)`,
                      top: `calc(50% + ${av.y}px - 14px)`,
                    }}
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
  );
};
