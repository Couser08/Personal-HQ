import type { Countdown } from '../../../store/types';
import { getTimeLeft } from '../utils/countdownHelpers';
import {
  TemplateDefault,
  TemplateMinimal,
  TemplateGradient,
  TemplateCircle,
  TemplateEvent,
  TemplateSale,
} from './templates/BasicTemplates';
import {
  TemplateDark,
  TemplateCompact,
  TemplateFlip,
  TemplateProgress,
  TemplateVertical,
  TemplateSplit,
} from './templates/AdvancedTemplates';
import { FlipDigit, ProgressRing, BigProgressRing, CompletedBadge } from './templates/SharedTemplateComponents';

export {
  FlipDigit,
  ProgressRing,
  BigProgressRing,
  CompletedBadge,
  TemplateDefault,
  TemplateMinimal,
  TemplateGradient,
  TemplateCircle,
  TemplateEvent,
  TemplateSale,
  TemplateDark,
  TemplateCompact,
  TemplateFlip,
  TemplateProgress,
  TemplateVertical,
  TemplateSplit,
};

export const renderTemplate = (
  c: Countdown,
  t: ReturnType<typeof getTimeLeft>,
  createdAt: string,
) => {
  const style = c.style || 'default';
  switch (style) {
    case 'minimal':
      return <TemplateMinimal c={c} t={t} />;
    case 'gradient':
      return <TemplateGradient c={c} t={t} />;
    case 'circle':
      return <TemplateCircle c={c} t={t} />;
    case 'event':
      return <TemplateEvent c={c} t={t} />;
    case 'sale':
      return <TemplateSale c={c} t={t} />;
    case 'dark':
      return <TemplateDark c={c} t={t} />;
    case 'compact':
      return <TemplateCompact c={c} t={t} />;
    case 'flip':
      return <TemplateFlip c={c} t={t} />;
    case 'progress':
      return <TemplateProgress c={c} t={t} createdAt={createdAt} />;
    case 'vertical':
      return <TemplateVertical c={c} t={t} />;
    case 'split':
      return <TemplateSplit c={c} t={t} />;
    default:
      return <TemplateDefault c={c} t={t} />;
  }
};
