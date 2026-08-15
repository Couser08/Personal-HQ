import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { Card } from './Card';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  value: string | number;
  label?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ icon, value, label, title, subtitle, description, trend, className = '', ...props }, ref) => {
    const headerText = title || label;
    const subText = subtitle || description;

    return (
      <Card
        ref={ref}
        padding="sm"
        className={`flex flex-col items-center justify-center gap-1.5 p-4.5 text-center ${className}`}
        {...props}
      >
        {icon && (
          <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary mb-0.5">
            {icon}
          </div>
        )}
        <div className="text-[22px] font-semibold text-text-primary leading-none tracking-tight">
          {value}
        </div>
        {headerText && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
            {headerText}
          </div>
        )}
        {subText && (
          <div className="text-[11px] text-text-secondary mt-0.5 truncate max-w-full">
            {subText}
          </div>
        )}
        {trend && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
            trend.isPositive ? 'bg-accent-success/10 text-accent-success' : 'bg-accent-danger/10 text-accent-danger'
          }`}>
            {trend.value}
          </span>
        )}
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';
