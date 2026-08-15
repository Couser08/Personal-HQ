import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppLogo } from '../../../components/ui/AppLogo';

interface AuthLoadingOverlayProps {
  customMessage?: string;
  subMessage?: string;
}

export const AuthLoadingOverlay: React.FC<AuthLoadingOverlayProps> = ({
  customMessage = 'Signing in to your workspace...',
  subMessage = 'Personalizing your experience...',
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    customMessage,
    'Syncing personal database...',
    'Loading workspace modules...',
    'Welcome back!',
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIndex(1), 600);
    const timer2 = setTimeout(() => setStepIndex(2), 1400);
    const timer3 = setTimeout(() => setStepIndex(3), 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md p-6"
    >
      {/* Ambient background glow behind logo */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute w-72 h-72 rounded-full bg-primary/10 blur-[90px] pointer-events-none"
      />

      {/* Central Interactive Logo Card */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        {/* Logo with outer dash spinner */}
        <div className="relative flex items-center justify-center">
          {/* Orbital Spinner Ring */}
          <svg
            className="absolute -inset-4 w-28 h-28 sm:w-32 sm:h-32 animate-spin pointer-events-none text-text-primary"
            style={{ animationDuration: '2s' }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="var(--border-border-alt)"
              strokeWidth="3"
              fill="none"
              opacity="0.3"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeDasharray="70 200"
              strokeLinecap="round"
              fill="none"
            />
          </svg>

          {/* Logo with Spring Bounce */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 shadow-2xl rounded-[28px] overflow-hidden"
          >
            <AppLogo className="w-full h-full" />
          </motion.div>
        </div>

        {/* Brand name */}
        <div className="flex flex-col items-center text-center gap-1.5 mt-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-text-secondary">
            Personal HQ
          </span>

          {/* Dynamic Step Text */}
          <motion.h3
            key={stepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-base sm:text-lg font-bold text-text-primary tracking-tight"
          >
            {steps[stepIndex] || steps[0]}
          </motion.h3>

          <p className="text-[12px] text-text-tertiary font-medium">
            {subMessage}
          </p>
        </div>

        {/* 3-Dot Stagger Loader */}
        <div className="flex items-center gap-2 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                scale: [0.8, 1.25, 0.8],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full bg-text-primary"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
