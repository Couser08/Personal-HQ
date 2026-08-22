import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animate?: boolean;
  dataComponent?: string;
}

const maxWidthMap = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  (
    {
      children,
      maxWidth = 'md',
      animate = true,
      dataComponent = 'PageContainer',
      className = '',
      ...props
    },
    ref
  ) => {
    const content = (
      <div
        ref={ref}
        data-component={dataComponent}
        className={`w-full ${maxWidthMap[maxWidth]} mx-auto flex flex-col gap-6 sm:gap-8 pb-28 md:pb-16 text-left antialiased select-none font-sans ${className}`}
        {...props}
      >
        {children}
      </div>
    );

    if (!animate) {
      return content;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {content}
      </motion.div>
    );
  }
);

PageContainer.displayName = 'PageContainer';
