import type { ReactNode } from 'react';
import { IconInbox } from '@tabler/icons-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Premium Apple-inspired Minimalist Empty State Component
 * Focusing on hyper-crisp micro-typography, precise spacing, and fluid transitions.
 */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
    role="status"
    className="w-full flex flex-col items-center justify-center text-center py-10 px-4 select-none"
  >
    {/* Icon Container: Dropped the heavy circle border for an organic layout weight */}
    <div
      aria-hidden="true"
      className="mb-4 text-zinc-300 dark:text-zinc-600 flex items-center justify-center transition-colors duration-200"
    >
      {icon ?? <IconInbox className="w-10 h-10 stroke-[1.25]" />}
    </div>

    {/* Title: Sharp, condensed system typography */}
    <h3 className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
      {title}
    </h3>

    {/* Description: Balanced leading with maximum line control */}
    {description && (
      <p className="mt-1 text-[12px] text-zinc-400 dark:text-zinc-500 font-normal leading-relaxed max-w-[260px] mx-auto">
        {description}
      </p>
    )}

    {/* Action Wrapper */}
    {action && (
      <div className="mt-5 w-full flex justify-center items-center">
        {action}
      </div>
    )}
  </motion.div>
);