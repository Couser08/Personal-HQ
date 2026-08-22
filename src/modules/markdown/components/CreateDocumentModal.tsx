import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { TEMPLATES } from '../constants/templates';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newDocTitle: string;
  setNewDocTitle: (t: string) => void;
  selectedTemplate: keyof typeof TEMPLATES;
  setSelectedTemplate: (t: keyof typeof TEMPLATES) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newDocTitle,
  setNewDocTitle,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Document">
      <form onSubmit={onSubmit} className="flex flex-col gap-4 text-left font-sans select-none">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Document Title</label>
          <input
            type="text"
            required
            placeholder="e.g. project-proposal.md"
            value={newDocTitle}
            onChange={(e) => setNewDocTitle(e.target.value)}
            className="input-field text-sm"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Template Preset</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as any)}
            className="input-field text-sm bg-surface"
          >
            <option value="blank">Blank Page</option>
            <option value="dailyLog">Daily Project Log</option>
            <option value="roadmap">Project Roadmap</option>
            <option value="spec">RFC / Specs Template</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-border hover:bg-surface-alt rounded-xl text-xs font-bold text-text-secondary cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary hover:opacity-90 text-text-on-accent rounded-xl text-xs font-bold cursor-pointer transition-all shadow-subtle"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};
