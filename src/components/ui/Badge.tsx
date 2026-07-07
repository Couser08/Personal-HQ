import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  onClick?: () => void;
  className?: string;
}

export const Badge = ({ children, variant = 'default', onClick, className = '' }: BadgeProps) => {
  // Apple uses precise tracking (letter-spacing) and semibold for small text labels
  const baseStyle = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide transition-all duration-200 ease-in-out select-none";
  
  // Apple's color palette relies on clean, solid semi-transparent fills or neutral systemic shades
  const variants = {
    primary: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
    info: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    default: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  };

  // If clickable, Apple wraps it in a subtle active scale or background shift instead of just opacity
  const interactiveStyle = onClick 
    ? "cursor-pointer hover:bg-opacity-15 active:scale-[0.96]" 
    : "";

  // Apple rarely uses arbitrary borders when background contrast is enough to define the shape
  return (
    <span 
      className={`${baseStyle} ${variants[variant]} ${interactiveStyle} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </span>
  );
};