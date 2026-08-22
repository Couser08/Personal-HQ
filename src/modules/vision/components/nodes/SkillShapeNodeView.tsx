import React from 'react';
import { IconDots } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface SkillShapeNodeViewProps {
  node: VisionNode;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const SkillShapeNodeView: React.FC<SkillShapeNodeViewProps> = ({ node, onToggleMenu }) => {
  if (node.type === 'skill') {
    return (
      <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-border text-text-primary">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M14.3 2.3L4.8 11.8l3.4 3.4 9.5-9.5-3.4-3.4zm-2.8 14.1L8.2 13 4.8 16.4l4.8 4.8 1.9-1.9-2.9-2.9zM19.2 14.2l-3.4-3.4-2.8 2.8 3.4 3.4 2.8-2.8z" />
            </svg>
          </div>

          <button
            type="button"
            onClick={onToggleMenu}
            className="w-7 h-7 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
          >
            <IconDots size={15} />
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
            {node.title || 'LEARN FLUTTER'}
          </h3>
          <p className="text-[12px] font-bold text-text-secondary mt-0.5">
            {node.subtitle || 'Spring animation'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(node.tags || ['Flutter', 'Animation']).map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-lg bg-surface border border-border text-text-primary text-[10.5px] font-bold shadow-xs"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Embed or Shape node
  return (
    <div className="w-full h-full p-5 flex flex-col justify-between bg-surface border border-border text-text-primary">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
          {node.type.toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onToggleMenu}
          className="w-7 h-7 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
        >
          <IconDots size={15} />
        </button>
      </div>
      <div className="my-auto">
        <h3 className="text-base font-black text-text-primary uppercase tracking-tight">
          {node.title}
        </h3>
        {node.content && <p className="text-[12px] text-text-secondary mt-1">{node.content}</p>}
      </div>
    </div>
  );
};
