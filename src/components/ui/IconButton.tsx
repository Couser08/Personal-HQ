import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { Button } from './Button';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', variant = 'ghost', size = 'md', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        isSquare
        className={className}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

IconButton.displayName = 'IconButton';
