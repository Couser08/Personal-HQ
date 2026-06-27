import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore, type ToastType } from '../../store/useToastStore';
import { IconCheck, IconX, IconInfoCircle, IconAlertTriangle, IconDots } from '@tabler/icons-react';

const getToastConfig = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        icon: <IconCheck className="w-5 h-5 text-green-500" />,
        borderColor: 'border-l-green-500',
        iconBg: 'bg-green-500/10'
      };
    case 'error':
      return {
        icon: <IconX className="w-5 h-5 text-rose-500" />,
        borderColor: 'border-l-rose-500',
        iconBg: 'bg-rose-500/10'
      };
    case 'warning':
      return {
        icon: <IconAlertTriangle className="w-5 h-5 text-amber-500" />,
        borderColor: 'border-l-amber-500',
        iconBg: 'bg-amber-500/10'
      };
    case 'info':
      return {
        icon: <IconInfoCircle className="w-5 h-5 text-blue-500" />,
        borderColor: 'border-l-blue-500',
        iconBg: 'bg-blue-500/10'
      };
    case 'update':
      return {
        icon: <IconDots className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />,
        borderColor: 'border-l-zinc-700 dark:border-l-zinc-500',
        iconBg: 'bg-zinc-500/10'
      };
    default:
      return {
        icon: <IconInfoCircle className="w-5 h-5 text-blue-500" />,
        borderColor: 'border-l-blue-500',
        iconBg: 'bg-blue-500/10'
      };
  }
};

export const ToastContainer = () => {
  const { toasts, removeToast, position } = useToastStore();

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4 items-start';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2 items-center';
      case 'bottom-right': return 'bottom-4 right-4 items-end';
      case 'bottom-left': return 'bottom-4 left-4 items-start';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2 items-center';
      case 'top-right':
      default:
        return 'top-4 right-4 items-end';
    }
  };

  const getAnimationProps = () => {
    const isTop = position.startsWith('top');
    return {
      initial: { opacity: 0, y: isTop ? -50 : 50, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };
  };

  return (
    <div className={`fixed z-[9999] flex flex-col gap-3 pointer-events-none ${getPositionClasses()}`}>
      <AnimatePresence>
        {toasts.map((toast) => {
          const config = getToastConfig(toast.type);
          const anim = getAnimationProps();
          return (
            <motion.div
              key={toast.id}
              initial={anim.initial}
              animate={anim.animate}
              exit={anim.exit}
              layout
              className={`pointer-events-auto flex items-start gap-4 p-4 pr-10 bg-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-border min-w-[320px] max-w-[400px] border-l-4 ${config.borderColor} relative`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${config.iconBg}`}>
                {config.icon}
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="text-sm font-bold text-text-primary m-0 leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[13px] text-text-secondary m-0 leading-relaxed font-medium">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
