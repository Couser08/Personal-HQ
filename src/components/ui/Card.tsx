import { type HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'md', children, ...props }, ref) => {
    const paddingClass = {
      none: '',
      sm: 'p-3 sm:p-4',
      md: 'p-4 sm:p-5',
      lg: 'p-6 sm:p-8',
    }[padding];

    return (
      <div
        ref={ref}
        className={`bg-surface border border-border rounded-2xl shadow-[var(--shadow-subtle)] ${paddingClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
