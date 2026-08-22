import React from 'react';
import { IconAdjustments, IconCopy, IconTrash } from '@tabler/icons-react';

interface NodePopupMenuProps {
  onInspect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export const NodePopupMenu: React.FC<NodePopupMenuProps> = ({
  onInspect,
  onDuplicate,
  onDelete,
  onClose,
}) => {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute top-10 right-2 z-50 p-1.5 bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[150px]"
    >
      <button
        type="button"
        onClick={() => {
          onClose();
          onInspect();
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-text-primary hover:bg-surface-alt cursor-pointer"
      >
        <IconAdjustments size={15} />
        <span>Edit Node</span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onDuplicate();
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-text-primary hover:bg-surface-alt cursor-pointer"
      >
        <IconCopy size={15} />
        <span>Duplicate</span>
      </button>

      <div className="w-full h-[1px] bg-border my-0.5" />

      <button
        type="button"
        onClick={() => {
          onClose();
          onDelete();
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
      >
        <IconTrash size={15} />
        <span>Delete</span>
      </button>
    </div>
  );
};
