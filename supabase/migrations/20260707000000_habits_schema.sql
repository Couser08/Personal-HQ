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
 * Standardised empty-state atom.
 * IMPORTANT: w-full on root ensures it fills any flex/grid container correctly.
 * Description has explicit max-width so it never wraps word-by-word.
 */
export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', damping: 24, stiffness: 300 }}
    role="status"
    className="w-full flex flex-col items-center justify-center text-center py-16 px-6 select-none"
  >
    <div
      aria-hidden="true"
      className="w-20 h-20 mb-5 rounded-full bg-surface-alt flex items-center justify-center border border-border"
    >
      {icon ?? <IconInbox className="w-9 h-9 text-text-muted" />}
    </div>

    <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>

    {description && (
      <p
        className="text-sm text-text-secondary leading-relaxed mb-5 w-full"
        style={{ maxWidth: 320, margin: '0 auto 20px auto' }}
      >
        {description}
      </p>
    )}

    {action}
  </motion.div>
);
