import React from 'react';
import { IconAdjustments, IconCopy, IconTrash } from '@tabler/icons-react';

interface NodeSelectionOverlayProps {
  width: number;
  height: number;
  onInspect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStartResize: (e: React.MouseEvent | React.TouchEvent, handle: string) => void;
}

export const NodeSelectionOverlay: React.FC<NodeSelectionOverlayProps> = ({
  width,
  height,
  onInspect,
  onDuplicate,
  onDelete,
  onStartResize,
}) => {
  return (
    <>
      <div className="absolute -inset-[3px] border-2 border-primary border-dashed rounded-[calc(var(--radius-card,24px)+4px)] pointer-events-none z-40" />

      {/* Live Dimensions Badge */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-text-primary text-text-on-accent text-[10.5px] font-black tracking-wider shadow-md pointer-events-none z-50 whitespace-nowrap">
        {width} &times; {height}
      </div>

      {/* Quick Floating Action Pill */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-full px-2 py-1 shadow-lg flex items-center gap-1.5 z-50">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onInspect();
          }}
          className="p-1 rounded-full hover:bg-surface-alt text-text-secondary hover:text-text-primary cursor-pointer"
          title="Edit Node Properties"
        >
          <IconAdjustments size={15} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 rounded-full hover:bg-surface-alt text-text-secondary hover:text-text-primary cursor-pointer"
          title="Duplicate Node"
        >
          <IconCopy size={15} />
        </button>
        <div className="w-[1px] h-3.5 bg-border" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded-full hover:bg-rose-500/10 text-rose-500 cursor-pointer"
          title="Delete Node"
        >
          <IconTrash size={15} />
        </button>
      </div>

      {/* 8 Resize Handles */}
      {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
        let posClass = '';
        if (handle === 'nw') posClass = '-top-1.5 -left-1.5 cursor-nwse-resize';
        if (handle === 'n') posClass = '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
        if (handle === 'ne') posClass = '-top-1.5 -right-1.5 cursor-nesw-resize';
        if (handle === 'e') posClass = 'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize';
        if (handle === 'se') posClass = '-bottom-1.5 -right-1.5 cursor-nwse-resize';
        if (handle === 's') posClass = '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
        if (handle === 'sw') posClass = '-bottom-1.5 -left-1.5 cursor-nesw-resize';
        if (handle === 'w') posClass = 'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize';

        return (
          <div
            key={handle}
            onMouseDown={(e) => {
              e.stopPropagation();
              onStartResize(e, handle);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onStartResize(e, handle);
            }}
            className={`absolute w-3.5 h-3.5 rounded-full bg-surface border-2 border-primary shadow-xs z-50 hover:scale-125 transition-transform ${posClass}`}
          />
        );
      })}
    </>
  );
};
