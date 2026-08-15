import { type HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'float' | 'float-hover' | 'none';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', padding = 'md', elevation = 'float', children, ...props }, ref) => {
    const paddingClass = {
      none: '',
      sm: 'p-4', // space-4
      md: 'p-6', // space-6 (default internal padding for cards)
      lg: 'p-8', // space-8
    }[padding];

    const shadowClass = {
      'float': 'shadow-[var(--shadow-float)]',
      'float-hover': 'shadow-[var(--shadow-float)] hover:shadow-[var(--shadow-float-hover)] transition-shadow duration-150',
      'none': 'shadow-none',
    }[elevation];

    return (
      <div
        ref={ref}
        className={`bg-surface rounded-[var(--radius-card)] border-none ${shadowClass} ${paddingClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
