import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0 to 100
  className?: string;
}

export const ProgressBar = ({ progress, className = '' }: ProgressBarProps) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className={`w-full bg-surface-alt rounded-full h-2 overflow-hidden ${className}`}>
      <motion.div
        className="bg-primary h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
      />
    </div>
  );
};
