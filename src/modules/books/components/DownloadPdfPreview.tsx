import React from 'react';
import type { Book } from '../../../store/types';

interface DownloadPdfPreviewProps {
  book: Book;
  includeBookmarks: boolean;
  includeTopics: boolean;
  includeContent: boolean;
  includeHighlights: boolean;
  includeNotes: boolean;
}

export const DownloadPdfPreview: React.FC<DownloadPdfPreviewProps> = ({
  book,
  includeBookmarks,
  includeTopics,
  includeContent,
  includeHighlights,
  includeNotes,
}) => {
  return (
    <div className="w-full md:w-1/2 bg-surface-alt border-r border-border p-6 flex flex-col justify-center items-center text-left">
      <span className="text-[10px] uppercase font-bold text-text-muted mb-4 block tracking-widest">
        Print Preview
      </span>
      <div className="w-64 aspect-[1/1.4] bg-white border border-border/60 shadow-lifted rounded-lg p-5 flex flex-col justify-between relative text-[8px] leading-relaxed text-slate-700 select-none overflow-hidden">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
            <span className="font-extrabold text-[9px] text-slate-800 truncate max-w-[80px]">
              {book.title}
            </span>
            <span className="text-[6px] text-slate-400 font-medium">Page 1</span>
          </div>

          {/* Bookmark */}
          {includeBookmarks && (book.bookmarks || []).includes(1) && (
            <div className="inline-block bg-blue-50 text-blue-600 rounded px-1.5 py-0.5 font-bold text-[6px] mb-2">
              ★ Bookmarked
            </div>
          )}

          {/* Book title headings */}
          <div className="mb-4">
            <h4 className="text-[11px] font-black text-slate-900 leading-tight">{book.title}</h4>
            <p className="text-[6px] text-slate-500 italic mt-0.5">"{book.tagline}"</p>
          </div>

          {/* Topics / Contents page if checked */}
          {includeTopics && (
            <div className="mb-3">
              <div className="font-extrabold text-[7px] text-slate-900 border-b border-slate-100 pb-1 mb-1">
                Introduction
              </div>
            </div>
          )}

          {/* Content mock paragraphs */}
          {includeContent ? (
            <div className="text-[7px] text-slate-600 space-y-2">
              <p>
                The Alchemist is a novel by Paulo Coelho that follows the journey of Santiago, a
                young shepherd{' '}
                {includeHighlights ? (
                  <span className="bg-yellow-100 px-0.5 rounded font-medium text-slate-800">
                    who dreams of finding a treasure.
                  </span>
                ) : (
                  'who dreams of finding a treasure.'
                )}
              </p>
              <p>
                His journey teaches him valuable lessons about{' '}
                {includeHighlights ? (
                  <span className="bg-emerald-100 px-0.5 rounded font-medium text-slate-800">
                    life, destiny, and listening to one's heart.
                  </span>
                ) : (
                  "life, destiny, and listening to one's heart."
                )}
              </p>
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-slate-400 italic">
              Content excluded from PDF
            </div>
          )}

          {/* Sticky note */}
          {includeNotes && (book.stickyNotes || []).length > 0 && (
            <div className="mt-3 bg-amber-50 border-l-2 border-amber-400 p-2 rounded text-[6px] text-slate-700">
              <div className="font-bold text-slate-900">Remember</div>
              <div>Add a note about the symbolism of the desert...</div>
            </div>
          )}
        </div>

        {/* Page number */}
        <div className="text-center font-mono text-[7px] text-slate-400 font-bold border-t border-slate-100 pt-2">
          1
        </div>
      </div>
    </div>
  );
};
