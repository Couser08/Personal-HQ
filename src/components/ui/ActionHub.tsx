import { type ReactNode, forwardRef, type HTMLAttributes } from 'react';
import { Card } from './Card';

export interface ActionHubProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  overline?: string;
  overlineColor?: string;
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  statusDot?: boolean;
  statusDotColor?: string;
  actions?: ReactNode;
  cardVariant?: boolean;
}

export const ActionHub = forwardRef<HTMLDivElement, ActionHubProps>(
  (
    {
      overline,
      overlineColor = 'text-text-tertiary',
      title,
      subtitle,
      statusDot = false,
      statusDotColor = 'bg-accent-success',
      actions,
      cardVariant = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const content = (
      <div
        ref={!cardVariant ? ref : undefined}
        className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left ${className}`}
        {...props}
      >
        <div className="flex flex-col gap-1 min-w-0">
          {overline && (
            <span
              className={`text-[11px] font-semibold uppercase tracking-[0.04em] ${overlineColor}`}
            >
              {overline}
            </span>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary leading-tight">
              {title}
            </h1>
            {statusDot && (
              <span
                className={`w-2 h-2 rounded-full ${statusDotColor} inline-block shrink-0 animate-pulse`}
              />
            )}
          </div>
          {subtitle && (
            <p className="text-[13.5px] sm:text-[14px] text-text-secondary leading-relaxed mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    );

    if (cardVariant) {
      return (
        <Card ref={ref} padding="lg" className="w-full">
          {content}
        </Card>
      );
    }

    return content;
  }
);

ActionHub.displayName = 'ActionHub';
