import React from 'react';
import { 
  IconChevronLeft, IconChevronRight 
} from '@tabler/icons-react';

interface MarkdownPreviewProps {
  parsedHtml: string;
  isEditorOpen: boolean;
  setIsEditorOpen: (val: boolean) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  parsedHtml,
  isEditorOpen,
  setIsEditorOpen,
}) => {
  return (
    <section className="flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 min-w-0 flex-1 h-full">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 select-none">
        <h3 className="text-sm font-bold text-text-primary pl-1 font-sans">Live Preview</h3>
        <button
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all ml-auto font-sans"
          title={isEditorOpen ? "Hide Editor Pane" : "Show Editor Pane"}
        >
          {isEditorOpen ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
        </button>
      </div>

      <div className="flex-grow min-h-0 relative overflow-hidden flex flex-col">
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 bg-surface border border-border/40 rounded-2xl p-6 text-left">
          <article 
            id="markdown-preview-pane"
            className="max-w-none text-text-primary md-preview overflow-hidden break-words"
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
          />
        </div>
      </div>
    </section>
  );
};
