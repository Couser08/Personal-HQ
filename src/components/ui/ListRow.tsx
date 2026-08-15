import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';

export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  icon?: ReactNode;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  trailing?: ReactNode;
  active?: boolean;
}

export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(
  ({ icon, title, subtitle, trailing, active = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-between p-3 min-h-[56px] rounded-[var(--radius-row)] transition-colors duration-150 ${
          active ? 'bg-surface-alt' : 'hover:bg-surface-alt bg-transparent'
        } ${props.onClick ? 'cursor-pointer' : ''} ${className}`}
        {...props}
      >
        <div className="flex items-center gap-4 min-w-0">
          {icon && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-secondary">
              {icon}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className={`text-[16px] font-semibold truncate ${active ? 'text-primary' : 'text-text-primary'}`}>
              {title}
            </div>
            {subtitle && (
              <div className="text-[13px] text-text-secondary truncate mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        
        {trailing && (
          <div className="flex-shrink-0 ml-4 flex items-center text-text-secondary">
            {trailing}
          </div>
        )}
      </div>
    );
  }
);

ListRow.displayName = 'ListRow';
