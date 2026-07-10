import React from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { 
  IconEye, IconPencil, IconSitemap, IconChevronLeft, IconChevronRight 
} from '@tabler/icons-react';

interface MarkdownPreviewProps {
  activeTab: 'preview' | 'sketch' | 'mermaid';
  setActiveTab: (tab: 'preview' | 'sketch' | 'mermaid') => void;
  parsedHtml: string;
  resolvedTheme: 'dark' | 'light';
  isEditorOpen: boolean;
  setIsEditorOpen: (val: boolean) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  activeTab,
  setActiveTab,
  parsedHtml,
  resolvedTheme,
  isEditorOpen,
  setIsEditorOpen,
}) => {
  return (
    <section className={`flex flex-col gap-4 rounded-4xl border border-border/70 bg-surface/90 p-4.5 shadow-[0_16px_50px_-25px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 min-w-0 flex-1 h-full`}>
      <div className="flex items-center justify-between border-b border-border/40 pb-3 select-none">
        <div className="flex bg-surface-alt p-1 rounded-xl border border-border/50 shadow-sm shrink-0">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === 'preview' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconEye size={14} />
            <span>Live Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('sketch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === 'sketch' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconPencil size={14} />
            <span>Whiteboard Sketch</span>
          </button>
          <button
            onClick={() => setActiveTab('mermaid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer font-sans ${
              activeTab === 'mermaid' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <IconSitemap size={14} />
            <span>Pro Guide</span>
          </button>
        </div>

        <button
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          className="btn btn-secondary btn-md text-xs py-1.5 px-2 h-auto min-h-0 rounded-xl flex items-center justify-center cursor-pointer hover:text-primary transition-all ml-auto font-sans"
          title={isEditorOpen ? "Hide Editor Pane" : "Show Editor Pane"}
        >
          {isEditorOpen ? <IconChevronLeft size={14} /> : <IconChevronRight size={14} />}
        </button>
      </div>

      <div className="flex-grow min-h-0 relative overflow-hidden flex flex-col">
        {activeTab === 'preview' && (
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 bg-surface border border-border/40 rounded-2xl p-6 text-left">
            <article 
              id="markdown-preview-pane"
              className="max-w-none text-text-primary md-preview overflow-hidden break-words"
              dangerouslySetInnerHTML={{ __html: parsedHtml }}
            />
          </div>
        )}

        {activeTab === 'sketch' && (
          <div className="flex-grow w-full border border-border/60 rounded-2xl overflow-hidden relative min-h-[400px]">
            <Excalidraw 
              theme={resolvedTheme}
            />
          </div>
        )}

        {activeTab === 'mermaid' && (
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4 text-left select-none">
            <div className="p-4 rounded-2xl bg-surface border border-border/40 text-left flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans">Markdown Pro Tips</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-secondary leading-relaxed font-sans">
                <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                  <span className="font-bold text-text-primary">✨ Alerts & Callouts</span>
                  <p>Github-style alerts:</p>
                  <pre className="bg-black/10 p-1.5 rounded font-mono text-[9px]">
{`> [!NOTE]
> Blue note box

> [!WARNING]
> Yellow warning box

> [!CAUTION]
> Rose danger box`}
                  </pre>
                </div>
                <div className="flex flex-col gap-1 bg-surface-alt p-3 rounded-xl border border-border/40">
                  <span className="font-bold text-text-primary">📊 Table Grid Matrix</span>
                  <p>Markdown tables parse to grid:</p>
                  <pre className="bg-black/10 p-1.5 rounded font-mono text-[9px]">
{`| Head 1 | Head 2 |
| ------ | ------ |
| Cell 1 | Cell 2 |`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
