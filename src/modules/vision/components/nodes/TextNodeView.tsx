import React from 'react';
import {
  IconDots,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconLink,
} from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface TextNodeViewProps {
  node: VisionNode;
  onToggleMenu: (e: React.MouseEvent) => void;
  onUpdate: (updates: Partial<VisionNode>) => void;
  onInspect: () => void;
}

export const TextNodeView: React.FC<TextNodeViewProps> = ({
  node,
  onToggleMenu,
  onUpdate,
  onInspect,
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

  const getLetterSpacingClass = (spacing?: string) => {
    if (spacing === 'tight') return 'tracking-tight';
    if (spacing === 'normal') return 'tracking-normal';
    if (spacing === 'wide') return 'tracking-wide';
    if (spacing === 'widest') return 'tracking-widest';
    return 'tracking-tight';
  };

  return (
    <div
      className={`w-full h-full p-6 flex flex-col justify-between relative text-text-primary ${
        node.bgStyle === 'gradient'
          ? 'bg-gradient-to-br from-rose-100/70 via-purple-100/60 to-teal-100/70 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-teal-950/40'
          : node.bgStyle === 'glass'
          ? 'bg-surface/80 backdrop-blur-xl'
          : ''
      }`}
      style={{
        color: node.textColor || undefined,
      }}
    >
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={onToggleMenu}
          className="w-7 h-7 rounded-full bg-surface-alt/80 text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <IconDots size={15} />
        </button>
      </div>

      <div
        className={`flex flex-col my-auto px-2 ${
          node.textAlign === 'center'
            ? 'items-center text-center'
            : node.textAlign === 'right'
            ? 'items-end text-right'
            : 'items-start text-left'
        }`}
      >
        <h2
          className={`leading-tight ${getFontFamilyClass(node.fontFamily)} ${getFontWeightClass(
            node.fontWeight
          )} ${getLetterSpacingClass(node.letterSpacing)} ${
            node.isUppercase !== false ? 'uppercase' : ''
          } ${node.fontStyle === 'italic' ? 'italic' : ''}`}
          style={{ fontSize: `${node.fontSize || 22}px` }}
        >
          {node.title}
        </h2>
        {node.subtitle && (
          <span className="text-[12px] font-bold text-text-tertiary mt-1">{node.subtitle}</span>
        )}
        {node.content && (
          <p className="text-[12.5px] text-text-secondary mt-2 line-clamp-3 leading-relaxed">
            {node.content}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2 border-t border-border/40 text-text-tertiary">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ textAlign: 'left' });
          }}
          className={`p-1 cursor-pointer transition-colors ${
            node.textAlign === 'left' ? 'text-primary font-bold' : 'hover:text-text-primary'
          }`}
          title="Align Left"
        >
          <IconAlignLeft size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ textAlign: 'center' });
          }}
          className={`p-1 cursor-pointer transition-colors ${
            node.textAlign === 'center' ? 'text-primary font-bold' : 'hover:text-text-primary'
          }`}
          title="Align Center"
        >
          <IconAlignCenter size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ textAlign: 'right' });
          }}
          className={`p-1 cursor-pointer transition-colors ${
            node.textAlign === 'right' ? 'text-primary font-bold' : 'hover:text-text-primary'
          }`}
          title="Align Right"
        >
          <IconAlignRight size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          className="hover:text-text-primary p-1 cursor-pointer"
          title="Customize Typography & Background"
        >
          <IconLink size={15} />
        </button>
      </div>
    </div>
  );
};
