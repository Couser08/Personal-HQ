import React from 'react';
import { IconClock, IconInfinity } from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { TagInput } from '../../../components/ui/TagInput';
import type { Link } from '../../../store/types';

interface LinkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLink: Link | null;
  url: string;
  setUrl: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  termType: 'short' | 'long';
  setTermType: (t: 'short' | 'long') => void;
  tags: string[];
  setTags: (t: string[]) => void;
  handleSave: () => void;
}

export const LinkEditModal: React.FC<LinkEditModalProps> = ({
  isOpen,
  onClose,
  editingLink,
  url,
  setUrl,
  title,
  setTitle,
  termType,
  setTermType,
  tags,
  setTags,
  handleSave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingLink ? 'Edit Saved Link' : 'Save New Resource Link'}
    >
      <div className="flex flex-col gap-4 text-left">
        {/* URL Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="modal-link-url" className="text-xs font-black uppercase text-text-muted">
            URL
          </label>
          <input
            id="modal-link-url"
            name="url"
            type="url"
            placeholder="e.g. https://react.dev"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-surface-alt border border-border-alt rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 text-xs font-semibold"
          />
        </div>

        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="modal-link-title"
            className="text-xs font-black uppercase text-text-muted"
          >
            Title (Optional)
          </label>
          <input
            id="modal-link-title"
            name="title"
            type="text"
            placeholder="Leave blank to auto-generate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-surface-alt border border-border-alt rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary/50 text-xs font-semibold"
          />
        </div>

        {/* Term Type Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-black uppercase text-text-muted">Retention Term</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTermType('short')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                termType === 'short'
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-surface-alt border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconClock size={14} /> Temporary Clip
            </button>
            <button
              type="button"
              onClick={() => setTermType('long')}
              className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                termType === 'long'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                  : 'bg-surface-alt border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <IconInfinity size={14} /> Long-Term Vault
            </button>
          </div>
        </div>

        {/* Tags input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black uppercase text-text-muted">Tags (press Enter)</label>
          <TagInput tags={tags} onChange={setTags} placeholder="e.g. dev, study, work" />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/40">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-md rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-md rounded-xl cursor-pointer">
            {editingLink ? 'Update Link' : 'Save Link'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
