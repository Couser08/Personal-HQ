import React from 'react';
import { motion } from 'framer-motion';
import { IconTrash } from '@tabler/icons-react';
import type { Countdown, CountdownTemplate } from '../../../store/types';
import { COLOR_HEX, useCountdown } from '../utils/countdownHelpers';
import {
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
} from './CountdownTemplates';

const DARK_WRAPPER_TEMPLATES = new Set(['dark']);

interface CountdownCardProps {
  c: Countdown;
  template: CountdownTemplate;
  onDelete: () => void;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  c,
  template,
  onDelete,
}) => {
  const t = useCountdown(c.targetDate);
  const isDarkTemplate = DARK_WRAPPER_TEMPLATES.has(template);

  const wrapperClass = isDarkTemplate
    ? 'bg-[#111] border border-[#222] text-white rounded-xl p-6 flex flex-col relative group overflow-hidden'
    : template === 'vertical'
    ? 'bg-surface border border-border rounded-xl p-6 flex flex-col relative group overflow-hidden border-l-4'
    : 'bg-surface border border-border rounded-xl p-6 flex flex-col relative group overflow-hidden';

  const verticalBorderStyle =
    template === 'vertical' ? { borderLeftColor: COLOR_HEX[c.color || 'rose'] } : {};
  const isPast = t.isPast;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isPast ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`${wrapperClass} ${isPast ? 'grayscale' : ''}`}
      style={verticalBorderStyle}
    >
      {/* Header */}
      <div className="flex justify-between items-start text-left">
        <div>
          {template !== 'split' && template !== 'compact' && (
            <span className="text-2xl mb-2 block">{c.emoji}</span>
          )}
          <h3
            className={`text-lg font-semibold ${
              isDarkTemplate ? 'text-white' : 'text-text-primary'
            }`}
          >
            {c.label}
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              isDarkTemplate ? 'text-[#666]' : 'text-text-muted'
            }`}
          >
            {new Date(c.targetDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="btn btn-ghost btn-sm btn-square text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>

      {/* Template body */}
      {template === 'default' && <TemplateDefault c={c} t={t} />}
      {template === 'minimal' && <TemplateMinimal c={c} t={t} />}
      {template === 'gradient' && <TemplateGradient c={c} t={t} />}
      {template === 'circle' && <TemplateCircle c={c} t={t} />}
      {template === 'event' && <TemplateEvent c={c} t={t} />}
      {template === 'sale' && <TemplateSale c={c} t={t} />}
      {template === 'dark' && <TemplateDark c={c} t={t} />}
      {template === 'compact' && <TemplateCompact c={c} t={t} />}
      {template === 'flip' && <TemplateFlip c={c} t={t} />}
      {template === 'progress' && <TemplateProgress c={c} t={t} createdAt={c.createdAt} />}
      {template === 'vertical' && <TemplateVertical c={c} t={t} />}
      {template === 'split' && <TemplateSplit c={c} t={t} />}
    </motion.div>
  );
};
