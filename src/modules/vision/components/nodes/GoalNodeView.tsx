import React from 'react';
import { IconBook, IconDots } from '@tabler/icons-react';
import type { VisionNode } from '../../../../store/types';

interface GoalNodeViewProps {
  node: VisionNode;
  onToggleMenu: (e: React.MouseEvent) => void;
}

export const GoalNodeView: React.FC<GoalNodeViewProps> = ({ node, onToggleMenu }) => {
  return (
    <div className="w-full h-full p-5 flex flex-col justify-between bg-surface border border-border/80">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconBook size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">
              {node.title}
            </h3>
            {node.subtitle && (
              <p className="text-[11px] font-semibold text-text-tertiary">{node.subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black text-text-primary">
            {node.goalCurrent || 0} / {node.goalTarget || 50}
          </span>
          <button
            type="button"
            onClick={onToggleMenu}
            className="w-7 h-7 rounded-lg hover:bg-surface-alt text-text-tertiary flex items-center justify-center cursor-pointer"
          >
            <IconDots size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-2">
        <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${
                node.goalTarget
                  ? Math.min(100, Math.round(((node.goalCurrent || 0) / node.goalTarget) * 100))
                  : node.progress || 0
              }%`,
            }}
          />
        </div>
      </div>

      {/* Tags Strip */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(node.tags && node.tags.length > 0 ? node.tags : ['Discipline', 'Growth']).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 rounded-lg bg-surface-alt border border-border text-[10.5px] font-bold text-text-secondary"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
