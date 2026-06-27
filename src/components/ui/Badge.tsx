import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  onClick?: () => void;
  className?: string;
}

export const Badge = ({ children, variant = 'default', onClick, className = '' }: BadgeProps) => {
  const baseStyle = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border";
  
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
  };

  return (
    <span 
      className={`${baseStyle} ${variants[variant]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
};
