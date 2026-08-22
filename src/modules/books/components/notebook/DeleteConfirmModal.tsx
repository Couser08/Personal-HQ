import React from 'react';
import { IconTrash } from '@tabler/icons-react';

interface DeleteConfirmModalProps {
  deleteTarget: { type: 'topic' | 'sticky'; id: string; name: string };
  onClose: () => void;
  onSubmit: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  deleteTarget,
  onClose,
  onSubmit,
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
            <IconTrash size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-text-primary">Confirm Deletion</h3>
            <p className="text-[11px] text-text-secondary">This action cannot be undone</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col items-center gap-4 py-8 text-center px-7">
        <div className="flex items-center justify-center w-16 h-16 border-2 border-red-100 rounded-full bg-red-50 dark:bg-red-950/30 dark:border-red-900/50">
          <IconTrash size={28} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm leading-relaxed text-text-secondary">
            Are you sure you want to delete this {deleteTarget.type === 'topic' ? 'topic' : 'sticky note'}?
          </p>
          <p className="inline-block px-4 py-2 mt-2 text-sm font-black border text-text-primary bg-surface-alt border-border rounded-xl">
            "{deleteTarget.name}"
          </p>
        </div>
      </div>

      <div className="flex gap-3 py-5 border-t px-7 border-border/60">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors"
        >
          Keep It
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors shadow-md"
        >
          Yes, Delete
        </button>
      </div>
    </>
  );
};
