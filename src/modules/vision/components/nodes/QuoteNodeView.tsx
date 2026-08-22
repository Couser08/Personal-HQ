import React from 'react';
import { IconHeart, IconHeartFilled, IconDots } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface QuoteNodeViewProps {
  node: VisionNode;
  isLiked: boolean;
  onHeartClick: (e: React.MouseEvent) => void;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const QuoteNodeView: React.FC<QuoteNodeViewProps> = ({
  node,
  isLiked,
  onHeartClick,
  onToggleMenu,
}) => {
  const getFontFamilyClass = (family?: string) => {
    if (family === 'serif') return 'font-serif';
    if (family === 'mono') return 'font-mono-code';
    if (family === 'caveat' || family === 'cursive') return 'font-caveat';
    if (family === 'syne' || family === 'display') return 'font-syne';
    return 'font-sans';
  };

  const getFontWeightClass = (weight?: string) => {
    if (weight === 'normal') return 'font-normal';
    if (weight === 'medium') return 'font-medium';
    if (weight === 'bold') return 'font-bold';
    if (weight === 'black') return 'font-black';
    return 'font-bold';
  };

  return (
    <div
      className="w-full h-full p-5 flex flex-col justify-between relative text-text-primary"
      style={{
        color: node.textColor || undefined,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-3xl font-serif leading-none opacity-60">&ldquo;</span>
        <button
          type="button"
          onClick={onHeartClick}
          className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-rose-500 transition-colors cursor-pointer"
        >
          {isLiked ? <IconHeartFilled size={16} className="text-rose-500" /> : <IconHeart size={16} />}
        </button>
      </div>

      <p
        className={`text-[14px] sm:text-[15.5px] leading-snug my-auto ${getFontFamilyClass(
          node.fontFamily || 'serif'
        )} ${getFontWeightClass(node.fontWeight || 'bold')} ${
          node.fontStyle === 'italic' ? 'italic' : ''
        }`}
      >
        {node.content || 'Discipline today freedom tomorrow.'}
      </p>

      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] font-semibold opacity-75 italic">
          {node.quoteAuthor ? `— ${node.quoteAuthor}` : '— Unknown'}
        </span>
        <button
          type="button"
          onClick={onToggleMenu}
          className="opacity-50 hover:opacity-100 p-1 cursor-pointer"
        >
          <IconDots size={14} />
        </button>
      </div>
    </div>
  );
};
