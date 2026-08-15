import React from 'react';
import { motion } from 'framer-motion';
import {
  IconAlertCircle,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react';

export type AlertType = 'error' | 'success' | 'info' | 'warning';

interface AuthAlertProps {
  message: string;
  type?: AlertType;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const alertStyles: Record<
  AlertType,
  {
    bg: string;
    border: string;
    text: string;
    iconColor: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
  }
> = {
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/15',
    border: 'border-red-500/30 dark:border-red-500/30',
    text: 'text-red-700 dark:text-red-300',
    iconColor: 'text-red-500',
    Icon: IconAlertCircle,
  },
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/30 dark:border-emerald-500/30',
    text: 'text-emerald-800 dark:text-emerald-300',
    iconColor: 'text-emerald-500',
    Icon: IconCheck,
  },
  info: {
    bg: 'bg-surface-alt border border-border',
    border: 'border-border',
    text: 'text-text-primary',
    iconColor: 'text-primary',
    Icon: IconInfoCircle,
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/30 dark:border-amber-500/30',
    text: 'text-amber-800 dark:text-amber-300',
    iconColor: 'text-amber-500',
    Icon: IconAlertTriangle,
  },
};

export const AuthAlert: React.FC<AuthAlertProps> = ({
  message,
  type = 'info',
  title,
  onClose,
  className = '',
}) => {
  const config = alertStyles[type];
  const Icon = config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role="alert"
      className={`relative flex items-start gap-3 p-3.5 rounded-[var(--radius-input)] border ${config.bg} ${config.border} shadow-sm ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        <Icon size={18} className={config.iconColor} />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className={`text-[13px] font-bold tracking-tight mb-0.5 ${config.text}`}>
            {title}
          </h4>
        )}
        <p className={`text-[13px] leading-relaxed font-medium ${config.text}`}>
          {message}
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface/50 transition-colors cursor-pointer"
        >
          <IconX size={14} />
        </button>
      )}
    </motion.div>
  );
};
