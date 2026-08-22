import React from 'react';
import { IconPlus, IconFileText, IconTrash } from '@tabler/icons-react';
import { type Note } from '../../../store/types';
import { EmptyState } from '../../../components/ui/EmptyState';
import { TEMPLATES } from '../constants/templates';

interface MarkdownCatalogViewProps {
  markdownDocs: Note[];
  filteredMarkdownDocs: Note[];
  workspaceSearch: string;
  setWorkspaceSearch: (s: string) => void;
  openCreateModal: (template?: keyof typeof TEMPLATES) => void;
  onSelectDoc: (id: string) => void;
  onDeleteDoc: (id: string, title: string, e: React.MouseEvent) => void;
}

export const MarkdownCatalogView: React.FC<MarkdownCatalogViewProps> = ({
  markdownDocs,
  filteredMarkdownDocs,
  workspaceSearch,
  setWorkspaceSearch,
  openCreateModal,
  onSelectDoc,
  onDeleteDoc,
}) => {
  const getTemplateBadge = (docContent: string) => {
    if (docContent.includes('Objectives') && docContent.includes('Activity Log')) {
      return {
        label: 'Daily Log',
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 shadow-sm',
      };
    }
    if (docContent.includes('Phases & Milestones')) {
      return {
        label: 'Roadmap',
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 shadow-sm',
      };
    }
    if (docContent.includes('RFC:') || docContent.includes('Introduction')) {
      return {
        label: 'Spec Doc',
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-550/25 shadow-sm',
      };
    }
    return {
      label: 'Document',
      color: 'bg-slate-550/10 text-slate-600 dark:text-slate-400 border border-slate-500/25 shadow-sm',
    };
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-24 select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
            Markdown Workspace
            <span className="inline-block w-2 h-2 rounded-full bg-primary" />
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {markdownDocs.length > 0
              ? `${markdownDocs.length} document${markdownDocs.length !== 1 ? 's' : ''} · ${markdownDocs
                  .reduce((acc, d) => acc + d.content.split(/\s+/).filter(Boolean).length, 0)
                  .toLocaleString()} total words`
              : 'Create documentation, timelines, and flowcharts in markdown.'}
          </p>
        </div>
        <button
          onClick={() => openCreateModal('blank')}
          className="btn btn-primary btn-sm flex items-center gap-1.5"
        >
          <IconPlus size={15} /> New Document
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mr-1">Quick Start:</span>
          {(
            [
              { key: 'blank', label: '📄 Blank' },
              { key: 'dailyLog', label: '🗓 Daily Log' },
              { key: 'roadmap', label: '🗺 Roadmap' },
              { key: 'spec', label: '📐 Spec Doc' },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => openCreateModal(key)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 hover:bg-surface-alt text-text-secondary hover:text-text-primary transition-all cursor-pointer"
            >
              {label}
            </button>
          ))}
        </div>

        {markdownDocs.length > 0 && (
          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              value={workspaceSearch}
              onChange={(e) => setWorkspaceSearch(e.target.value)}
              placeholder="Search documents..."
              className="input-field w-full text-xs py-2 px-3 border-border/60 bg-surface rounded-xl font-medium"
            />
          </div>
        )}
      </div>

      {filteredMarkdownDocs.length === 0 ? (
        <EmptyState
          icon={<IconFileText className="w-10 h-10 text-text-muted" />}
          title={markdownDocs.length === 0 ? 'No Markdown Documents' : 'No matching documents'}
          description={
            markdownDocs.length === 0
              ? 'Create a document using one of the structural presets (Daily log, Roadmap, Spec).'
              : 'Try adjusting your search query.'
          }
          action={
            <button
              onClick={() => openCreateModal('blank')}
              className="btn btn-primary btn-sm flex items-center gap-2 animate-none"
            >
              <IconPlus size={15} /> Create Document
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left select-none">
          {filteredMarkdownDocs.map((doc) => {
            const wc = doc.content.split(/\s+/).filter(Boolean).length;
            const readTime = Math.max(1, Math.ceil(wc / 225));
            const preview = doc.content
              .replace(/```[\s\S]*?```/g, '')
              .replace(/Searched for `[^`]+`/gi, '')
              .replace(/Read, lines \d+ to \d+/gi, '')
              .replace(/<[^>]+>/g, '')
              .replace(/[#*`>_\-=\[\]()]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 95);
            const badge = getTemplateBadge(doc.content);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc.id)}
                className="p-5.5 bg-surface/50 dark:bg-zinc-900/30 backdrop-blur-sm border border-border/40 hover:border-primary/20 rounded-[28px] hover:shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between min-h-[175px] relative group"
              >
                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mt-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                      <IconFileText size={17} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[14px] font-black text-text-primary group-hover:text-primary transition-colors truncate block">
                        {doc.title}
                      </span>
                      <p className="text-[11px] text-text-secondary font-medium mt-1.5 line-clamp-2 leading-relaxed">
                        {preview || 'No content yet...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-border/60">
                  <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                    <span>
                      {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{readTime} min read</span>
                  </div>
                  <button
                    onClick={(e) => onDeleteDoc(doc.id, doc.title, e)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-550/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 border-none bg-transparent active:scale-90"
                    title="Delete document"
                  >
                    <IconTrash size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
