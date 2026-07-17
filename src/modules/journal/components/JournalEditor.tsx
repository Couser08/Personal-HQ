import { useState, useEffect, useRef } from 'react';
import { type JournalEntry } from '../../../store/types';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { formatDateTime, wordCount } from '../utils';

export function JournalEditor({
  activeEntry,
  previewMode,
  title: parentTitle,
  setTitle: parentSetTitle,
  content: parentContent,
  setContent: parentSetContent,
  mood,
  tags,
  currentStyle,
  editorPaperStyle,
  forceSave,
}: {
  activeEntry: JournalEntry;
  previewMode: boolean;
  title: string;
  setTitle: (val: string) => void;
  content: string;
  setContent: (val: string) => void;
  mood: string;
  tags: string[];
  currentStyle: any;
  editorPaperStyle: any;
  forceSave: () => void;
}) {
  const [localTitle, setLocalTitle] = useState(parentTitle);
  const [localContent, setLocalContent] = useState(parentContent);

  const titleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When swapping entries or parent finishes save, synchronize local state
  useEffect(() => {
    setLocalTitle(parentTitle);
  }, [activeEntry.id, parentTitle]);

  useEffect(() => {
    setLocalContent(parentContent);
  }, [activeEntry.id, parentContent]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
      if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
    };
  }, []);

  // Debounced parent updates
  const handleTitleChange = (val: string) => {
    setLocalTitle(val);
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    titleDebounceRef.current = setTimeout(() => {
      parentSetTitle(val);
    }, 400); // Debounce parent state updates
  };

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
    contentDebounceRef.current = setTimeout(() => {
      parentSetContent(val);
    }, 400); // Debounce parent state updates
  };

  // Immediate save on blur to prevent data loss
  const handleBlur = () => {
    if (titleDebounceRef.current) clearTimeout(titleDebounceRef.current);
    if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current);
    parentSetTitle(localTitle);
    parentSetContent(localContent);
    // Let the parent trigger its own auto-save immediately
    setTimeout(() => {
      forceSave();
    }, 50);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Immersive Paper Sheet */}
      <div
        className="flex-1 flex flex-col rounded-[32px] border border-border/65 shadow-md min-h-[450px]"
        style={{
          background: currentStyle.surface,
          boxShadow: `0 20px 45px -30px ${currentStyle.glow}, 0 2px 10px rgba(0,0,0,0.01)`,
        }}
      >
        <div className="flex-1 flex flex-col p-6 md:p-10 rounded-[32px] overflow-y-auto" style={editorPaperStyle}>
          {/* Paper Meta indicators */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/30 pb-3 mb-5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
              <span>{formatDateTime(activeEntry.date)}</span>
              <span>•</span>
              <span>{wordCount(localContent)} words</span>
              <span>•</span>
              <span className="text-primary font-bold">{mood.toUpperCase()}</span>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary/5 text-primary px-2.5 py-0.5 text-[9px] font-bold">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Title input directly on paper */}
          <input
            value={localTitle}
            onChange={(event) => handleTitleChange(event.target.value)}
            onBlur={handleBlur}
            placeholder="Untitled Entry"
            className="w-full border-none bg-transparent text-3xl font-extrabold tracking-tight text-text-primary outline-none placeholder:text-text-muted/20 mb-4"
          />

          {/* Divider */}
          <div className="w-full h-px bg-border/20 mb-6" />

          {/* Content Editor inside Paper Sheet */}
          <div className="flex-1 flex flex-col min-h-0 journal-editor-container">
            <style>{`
              .journal-editor-container .border-border-alt {
                border: none !important;
                background: transparent !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              .journal-editor-container .bg-surface-alt {
                background: transparent !important;
                border-bottom: 1px solid var(--border-border-alt) !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                margin-bottom: 16px !important;
                opacity: 0.85;
              }
              .journal-editor-container .rich-editor {
                min-height: 380px;
                padding: 0 !important;
                font-size: 15px !important;
                line-height: 28px !important;
                font-family: inherit !important;
                color: var(--text-primary) !important;
              }
              .journal-editor-container .rich-editor p,
              .journal-editor-container .rich-editor div {
                line-height: 28px !important;
                margin-bottom: 0 !important;
              }
            `}</style>
            {previewMode ? (
              <article className="max-w-none text-text-primary">
                <div
                  className="min-h-80 text-[15px] leading-7"
                  dangerouslySetInnerHTML={{ __html: localContent || '<p class="text-text-muted">Nothing written yet.</p>' }}
                />
              </article>
            ) : (
              <RichTextEditor
                key={activeEntry.id}
                value={localContent}
                onChange={handleContentChange}
                onBlur={handleBlur}
                placeholder="Start writing your thoughts..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
