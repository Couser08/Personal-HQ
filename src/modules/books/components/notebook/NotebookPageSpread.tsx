import React from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { Book, BookTopic, BookStickyNote } from '../../../../store/types';
import { StickyCard, getStickyPositionClasses } from './StickyCard';

interface NotebookPageSpreadProps {
  book: Book;
  isEditMode: boolean;
  readingStyle: 'warm' | 'minimal' | 'scholar' | 'sage';
  pageText: string;
  renderReadModeHTML: (text: string) => React.ReactNode;
  editorRefLeft: React.RefObject<HTMLDivElement | null>;
  editorRefRight: React.RefObject<HTMLDivElement | null>;
  handleTextChange: (newVal: string) => void;
  handleEditorKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  lastFocusedEditorRef: React.MutableRefObject<'left' | 'right'>;
  updateBook: (id: string, updates: Partial<Book>) => void;
  getActiveTopicForPage: (
    pageNo: number,
  ) => { topic: BookTopic; index: number; title: string } | null;
  getStyleForReadingTheme: () => React.CSSProperties | undefined;
  openEditStickyModal: (sticky: any) => void;
  triggerDeleteConfirm: (type: 'topic' | 'sticky' | 'book', id: string, name: string) => void;
  handlePageTurn: (direction: 'next' | 'prev') => void;
}

export const NotebookPageSpread: React.FC<NotebookPageSpreadProps> = ({
  book,
  isEditMode,
  readingStyle,
  pageText,
  renderReadModeHTML,
  editorRefLeft,
  editorRefRight,
  handleTextChange,
  handleEditorKeyDown,
  lastFocusedEditorRef,
  updateBook,
  getActiveTopicForPage,
  getStyleForReadingTheme,
  openEditStickyModal,
  triggerDeleteConfirm,
  handlePageTurn,
}) => {
  const currentPage = book.currentPage || 1;
  const pagesCount = book.pagesCount || 10;
  const bookmarks = (book.bookmarks || []) as number[];
  const stickyNotes = (book.stickyNotes || []) as BookStickyNote[];
  const pages = (book.pages || {}) as Record<number, string>;

  return (
    <div
      className={`flex-1 rounded-2xl p-3.5 sm:p-8 flex flex-col justify-between relative transition-shadow duration-300 shadow-high ${
        isEditMode
          ? 'bg-vellum md:border-l-[14px] border-l-0 border-l-amber-800 dark:border-l-zinc-900 border border-border'
          : readingStyle === 'warm'
          ? 'bg-vellum md:border-l-[14px] border-l-0 border-l-amber-800 border border-[#D4C4A0]'
          : readingStyle === 'minimal'
          ? 'bg-white border border-slate-200'
          : readingStyle === 'scholar'
          ? 'bg-[#0f172a] md:border-l-[14px] border-l-0 border-l-zinc-900 border border-slate-800'
          : 'bg-vellum md:border-l-[14px] border-l-0 border-l-[#5c7a61] border border-[#B5CDB8]'
      }`}
      style={
        !isEditMode && readingStyle !== 'scholar' && readingStyle !== 'minimal'
          ? {
              background:
                readingStyle === 'warm'
                  ? 'linear-gradient(135deg, #FDFBF4 0%, #F7F0DC 40%, #EDE4CC 100%)'
                  : 'linear-gradient(135deg, #EDF4EE 0%, #D8EAD9 50%, #C6DBC8 100%)',
            }
          : undefined
      }
    >
      {/* Fold/Crease effect down the middle simulating binding shadows */}
      <div className="hidden md:block absolute top-0 bottom-0 w-6 -translate-x-1/2 pointer-events-none left-1/2 bg-gradient-to-r from-black/0 via-black/8 dark:via-black/35 to-black/0 z-20" />
      <div className="hidden md:block absolute top-0 bottom-0 w-[1px] -translate-x-1/2 pointer-events-none left-1/2 bg-black/10 dark:bg-white/5 z-20" />

      {/* Book Sheets Spread layout */}
      <div className="relative z-10 grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
        {/* Sheet 1: Left Page */}
        <div
          className={`flex flex-col relative ${isEditMode ? '' : 'px-4'}`}
          style={getStyleForReadingTheme()}
        >
          {bookmarks.includes(currentPage) && (
            <div className="absolute top-0 left-2 w-5 h-8 bg-rose-500 text-white rounded-b-md flex items-center justify-center font-bold text-[10px]">
              ★
            </div>
          )}

          {(() => {
            const activeTopic = getActiveTopicForPage(currentPage);
            if (isEditMode) {
              return activeTopic ? (
                <div className="pb-2 pl-6 mb-4 text-left border-b border-border/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">
                    Topic {activeTopic.index}
                  </span>
                  <h3 className="text-md font-black text-text-primary tracking-tight mt-0.5">
                    {activeTopic.title}
                  </h3>
                </div>
              ) : (
                <div className="pb-2 pl-6 mb-4 text-left border-b select-none border-border/20 opacity-20">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted">
                    No Active Topic
                  </span>
                </div>
              );
            }
            return activeTopic ? (
              <div
                className={`mb-6 text-left pl-2 ${
                  readingStyle === 'warm'
                    ? 'border-l-4 border-[#C0956A] pl-5'
                    : readingStyle === 'scholar'
                    ? 'border-l-4 border-[#c9a84c] pl-5'
                    : readingStyle === 'minimal'
                    ? 'border-b-2 border-slate-200 pb-4 pl-0'
                    : 'border-l-4 border-[#6a9e74] pl-5'
                }`}
              >
                <div
                  className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 ${
                    readingStyle === 'warm'
                      ? 'text-[#9b6e3d]'
                      : readingStyle === 'scholar'
                      ? 'text-[#c9a84c]'
                      : readingStyle === 'minimal'
                      ? 'text-slate-400'
                      : 'text-[#5a8a63]'
                  }`}
                >
                  Chapter {activeTopic.index}
                </div>
                <h2
                  className={`font-black leading-tight ${
                    readingStyle === 'warm'
                      ? 'text-[1.4rem] text-[#2c1a0e]'
                      : readingStyle === 'scholar'
                      ? 'text-[1.35rem] text-[#f0e6d3]'
                      : readingStyle === 'minimal'
                      ? 'text-[1.5rem] text-slate-900 tracking-tight'
                      : 'text-[1.35rem] text-[#1e3a2f]'
                  }`}
                >
                  {activeTopic.title}
                </h2>
                <div
                  className={`mt-2 h-0.5 w-16 rounded-full ${
                    readingStyle === 'warm'
                      ? 'bg-[#C0956A]/50'
                      : readingStyle === 'scholar'
                      ? 'bg-[#c9a84c]/50'
                      : readingStyle === 'minimal'
                      ? 'bg-slate-200'
                      : 'bg-[#6a9e74]/50'
                  }`}
                />
              </div>
            ) : null;
          })()}

          <div className="relative flex flex-1 pl-2 sm:pl-6">
            {isEditMode && (
              <div className="hidden sm:block absolute left-4 top-0 bottom-0 w-0.5 bg-rose-500/40" />
            )}
            {isEditMode && (
              <div className="hidden sm:block w-4 select-none font-mono text-[10px] text-text-muted/50 text-right pr-3 pt-1 space-y-3 leading-[24px]">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>
            )}

            <div className="flex-1 pt-1 min-h-[300px] leading-[24px] text-left">
              {isEditMode ? (
                <div
                  ref={editorRefLeft}
                  contentEditable={true}
                  onInput={(e) => handleTextChange(e.currentTarget.innerHTML)}
                  onFocus={() => {
                    lastFocusedEditorRef.current = 'left';
                  }}
                  onKeyDown={handleEditorKeyDown}
                  className="w-full h-full bg-transparent border-none focus:outline-none text-text-primary cursor-text notebook-content"
                  style={{
                    lineHeight: '24px',
                    backgroundImage: 'linear-gradient(var(--border-border) 1px, transparent 1px)',
                    backgroundSize: '100% 24px',
                    minHeight: '300px',
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full text-text-primary bg-transparent leading-relaxed prose prose-sm max-w-none notebook-content read-theme-${readingStyle}`}
                  style={{ lineHeight: '1.85' }}
                >
                  {renderReadModeHTML(pageText)}
                </div>
              )}
            </div>
          </div>

          {stickyNotes
            .filter((n) => n.pageNumber === currentPage)
            .map((note, idx) => (
              <div key={note.id} className={getStickyPositionClasses(note.position, idx)}>
                <StickyCard
                  note={note}
                  idx={idx}
                  onEdit={openEditStickyModal}
                  onDelete={(id, name) => triggerDeleteConfirm('sticky', id, name)}
                />
              </div>
            ))}

          <div className="pt-3 mt-4 font-mono text-xs font-bold text-center border-t select-none border-border/40 text-text-muted">
            {currentPage}
          </div>
        </div>

        {/* Sheet 2: Right Page */}
        <div
          className={`hidden md:flex flex-col relative border-l border-border/20 pl-4 ${
            isEditMode ? '' : 'px-4'
          }`}
          style={getStyleForReadingTheme()}
        >
          {bookmarks.includes(currentPage + 1) && (
            <div className="absolute top-0 right-2 w-5 h-8 bg-rose-500 text-white rounded-b-md flex items-center justify-center font-bold text-[10px]">
              ★
            </div>
          )}

          {(() => {
            const activeTopic = getActiveTopicForPage(currentPage + 1);
            if (isEditMode) {
              return activeTopic ? (
                <div className="pb-2 pl-4 mb-4 text-left border-b border-border/40">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">
                    Topic {activeTopic.index}
                  </span>
                  <h3 className="text-md font-black text-text-primary tracking-tight mt-0.5">
                    {activeTopic.title}
                  </h3>
                </div>
              ) : (
                <div className="pb-2 pl-4 mb-4 text-left border-b select-none border-border/20 opacity-20">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-text-muted">
                    No Active Topic
                  </span>
                </div>
              );
            }
            return activeTopic ? (
              <div
                className={`mb-6 text-left pl-2 ${
                  readingStyle === 'warm'
                    ? 'border-l-4 border-[#C0956A] pl-5'
                    : readingStyle === 'scholar'
                    ? 'border-l-4 border-[#c9a84c] pl-5'
                    : readingStyle === 'minimal'
                    ? 'border-b-2 border-slate-200 pb-4 pl-0'
                    : 'border-l-4 border-[#6a9e74] pl-5'
                }`}
              >
                <div
                  className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 ${
                    readingStyle === 'warm'
                      ? 'text-[#9b6e3d]'
                      : readingStyle === 'scholar'
                      ? 'text-[#c9a84c]'
                      : readingStyle === 'minimal'
                      ? 'text-slate-400'
                      : 'text-[#5a8a63]'
                  }`}
                >
                  Chapter {activeTopic.index}
                </div>
                <h2
                  className={`font-black leading-tight ${
                    readingStyle === 'warm'
                      ? 'text-[1.4rem] text-[#2c1a0e]'
                      : readingStyle === 'scholar'
                      ? 'text-[1.35rem] text-[#f0e6d3]'
                      : readingStyle === 'minimal'
                      ? 'text-[1.5rem] text-slate-900 tracking-tight'
                      : 'text-[1.35rem] text-[#1e3a2f]'
                  }`}
                >
                  {activeTopic.title}
                </h2>
                <div
                  className={`mt-2 h-0.5 w-16 rounded-full ${
                    readingStyle === 'warm'
                      ? 'bg-[#C0956A]/50'
                      : readingStyle === 'scholar'
                      ? 'bg-[#c9a84c]/50'
                      : readingStyle === 'minimal'
                      ? 'bg-slate-200'
                      : 'bg-[#6a9e74]/50'
                  }`}
                />
              </div>
            ) : null;
          })()}

          <div className="relative flex-1 pl-4">
            {isEditMode && <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-rose-500/20" />}

            <div className="pt-1 min-h-[300px] leading-[24px] text-left text-text-primary">
              {isEditMode ? (
                <div
                  ref={editorRefRight}
                  contentEditable={true}
                  onInput={(e) => {
                    const rightContent = e.currentTarget.innerHTML;
                    const updatedPages = {
                      ...pages,
                      [currentPage + 1]: rightContent,
                    };
                    updateBook(book.id, { pages: updatedPages });
                  }}
                  onFocus={() => {
                    lastFocusedEditorRef.current = 'right';
                  }}
                  onKeyDown={handleEditorKeyDown}
                  className="w-full h-full bg-transparent border-none focus:outline-none text-text-primary cursor-text notebook-content"
                  style={{
                    lineHeight: '24px',
                    backgroundImage: 'linear-gradient(var(--border-border) 1px, transparent 1px)',
                    backgroundSize: '100% 24px',
                    minHeight: '300px',
                  }}
                />
              ) : (
                <div
                  className={`w-full h-full leading-relaxed prose prose-sm max-w-none notebook-content read-theme-${readingStyle}`}
                  style={{ lineHeight: '1.85' }}
                >
                  {renderReadModeHTML(pages[currentPage + 1] || '')}
                </div>
              )}
            </div>
          </div>

          {stickyNotes
            .filter((n) => n.pageNumber === currentPage + 1)
            .map((note, idx) => (
              <div key={note.id} className={getStickyPositionClasses(note.position, idx)}>
                <StickyCard
                  note={note}
                  idx={idx}
                  onEdit={openEditStickyModal}
                  onDelete={(id, name) => triggerDeleteConfirm('sticky', id, name)}
                />
              </div>
            ))}

          <div className="pt-3 mt-4 font-mono text-xs font-bold text-center border-t select-none border-border/40 text-text-muted">
            {currentPage + 1}
          </div>
        </div>
      </div>

      {/* Mobile Page Turn Strip */}
      <div className="flex sm:hidden items-center justify-between pt-3 border-t border-border/30 mt-3 select-none">
        <button
          onClick={() => handlePageTurn('prev')}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary disabled:opacity-30 cursor-pointer shadow-xs"
        >
          ← Prev
        </button>
        <span className="text-xs font-mono font-bold text-text-muted">
          Page {currentPage} / {pagesCount}
        </span>
        <button
          onClick={() => handlePageTurn('next')}
          disabled={currentPage >= pagesCount}
          className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary disabled:opacity-30 cursor-pointer shadow-xs"
        >
          Next →
        </button>
      </div>

      {/* Desktop Navigation Page Turn Arrows */}
      <div className="hidden sm:flex absolute text-center z-30 justify-between pointer-events-none inset-y-1/2 -left-6 -right-6">
        <button
          onClick={() => handlePageTurn('prev')}
          disabled={currentPage <= 1}
          className={`p-3.5 bg-surface hover:bg-surface-hover border border-border shadow-high rounded-full text-text-primary hover:text-rose-500 hover:scale-110 pointer-events-auto cursor-pointer transition-all active:scale-[0.9] duration-100 ${
            currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <IconChevronLeft size={20} />
        </button>
        <button
          onClick={() => handlePageTurn('next')}
          disabled={currentPage >= pagesCount - 1}
          className={`p-3.5 bg-surface hover:bg-surface-hover border border-border shadow-high rounded-full text-text-primary hover:text-rose-500 hover:scale-110 pointer-events-auto cursor-pointer transition-all active:scale-[0.9] duration-100 ${
            currentPage >= pagesCount - 1 ? 'opacity-30 cursor-not-allowed' : ''
          }`}
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
