import React, { useState } from 'react';
import { IconPlus, IconTrash, IconFileText } from '@tabler/icons-react';
import { Modal } from '../../components/ui/Modal';

interface Doc {
  id: string;
  title: string;
  createdAt: string;
}

interface MarkdownSidebarProps {
  activeDocId: string | null;
  setActiveDocId: (id: string | null) => void;
  markdownDocs: Doc[];
  handleDeleteDoc: (id: string, e: React.MouseEvent) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (val: boolean) => void;
  newDocTitle: string;
  setNewDocTitle: (val: string) => void;
  selectedTemplate: 'blank' | 'dailyLog' | 'roadmap' | 'spec';
  setSelectedTemplate: (val: 'blank' | 'dailyLog' | 'roadmap' | 'spec') => void;
  handleCreateDocSubmit: (e: React.FormEvent) => void;
  TEMPLATES: Record<string, string>;
}

export const MarkdownSidebar: React.FC<MarkdownSidebarProps> = ({
  activeDocId,
  setActiveDocId,
  markdownDocs,
  handleDeleteDoc,
  isCreateModalOpen,
  setIsCreateModalOpen,
  newDocTitle,
  setNewDocTitle,
  selectedTemplate,
  setSelectedTemplate,
  handleCreateDocSubmit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = markdownDocs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[260px] h-full flex flex-col gap-4 p-4 rounded-3xl border border-border/50 bg-surface/40 backdrop-blur-md shadow-sm shrink-0 text-left select-none">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <span className="text-xs font-black uppercase tracking-widest text-text-muted">Documents</span>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-md shadow-primary/10"
          title="Create New Doc"
        >
          <IconPlus size={15} />
        </button>
      </div>

      <input
        type="text"
        placeholder="Search documents..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        className="w-full px-3 py-1.5 text-xs font-semibold bg-surface-alt/75 border border-border/60 rounded-xl outline-none focus:border-primary/50 text-text-primary placeholder-text-muted"
      />

      <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto custom-scrollbar">
        {filteredDocs.length === 0 ? (
          <p className="text-[10px] text-text-muted italic text-center py-4">No documents found</p>
        ) : (
          filteredDocs.map(doc => {
            const active = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  active 
                    ? 'bg-surface border-border shadow-sm text-primary' 
                    : 'bg-transparent border-transparent hover:bg-surface-alt/45 text-text-secondary hover:text-text-primary'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <IconFileText size={15} className={active ? 'text-primary' : 'text-text-muted'} />
                  <span className="text-xs font-bold truncate leading-none">{doc.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteDoc(doc.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 text-text-muted hover:text-red-500 rounded-lg transition-all"
                  title="Delete Document"
                >
                  <IconTrash size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Document"
      >
        <form onSubmit={handleCreateDocSubmit} className="flex flex-col gap-4 text-left font-sans select-none">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Document Title</label>
            <input
              type="text"
              required
              placeholder="e.g. project-proposal.md"
              value={newDocTitle}
              onChange={e => setNewDocTitle(e.target.value)}
              className="input-field text-sm"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Template Preset</label>
            <select
              value={selectedTemplate}
              onChange={e => setSelectedTemplate(e.target.value as any)}
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
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-border hover:bg-surface-alt rounded-xl text-xs font-bold text-text-secondary cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-[0_4px_12px_rgba(244,63,94,0.15)]"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
