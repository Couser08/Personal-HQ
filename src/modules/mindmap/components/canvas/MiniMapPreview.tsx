import React from 'react';
import { type MindmapNode } from '../../../../store/useAppStore';

interface MiniMapPreviewProps {
  visibleNodes: MindmapNode[];
  miniMapBounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
}

export const MiniMapPreview: React.FC<MiniMapPreviewProps> = ({
  visibleNodes,
  miniMapBounds,
}) => {
  return (
    <div className="absolute bottom-6 right-6 w-32 h-24 bg-surface/90 border border-border/60 rounded-2xl shadow-xl p-2.5 backdrop-blur z-20 flex flex-col items-center justify-center overflow-hidden hidden md:flex">
      <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1.5 block select-none">
        Canvas Preview
      </span>
      <div className="relative w-full h-full bg-surface-alt/40 rounded-lg border border-border/30 overflow-hidden">
        {visibleNodes.map((n) => {
          const scaleX = 100 / miniMapBounds.width;
          const scaleY = 60 / miniMapBounds.height;
          const left = (n.x - miniMapBounds.minX) * scaleX;
          const top = (n.y - miniMapBounds.minY) * scaleY;
          return (
            <div
              key={n.id}
              style={{
                left: `${left + 5}%`,
                top: `${top + 10}%`,
                width: n.isRoot ? '12px' : '9px',
                height: '4px',
                position: 'absolute',
                backgroundColor:
                  n.isRoot
                    ? 'var(--color-primary, #f43f5e)'
                    : n.color === 'rose'
                    ? '#f43f5e'
                    : n.color === 'amber'
                    ? '#f59e0b'
                    : n.color === 'purple'
                    ? '#a855f7'
                    : n.color === 'green'
                    ? '#10b880'
                    : '#3b82f6',
                borderRadius: '1px',
                opacity: 0.8,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
