import React from 'react';
import { IconDownload } from '@tabler/icons-react';
import type { Book } from '../../../store/types';

interface DownloadPdfControlsProps {
  book: Book;
  includeContent: boolean;
  setIncludeContent: (v: boolean) => void;
  includeTopics: boolean;
  setIncludeTopics: (v: boolean) => void;
  includeNotes: boolean;
  setIncludeNotes: (v: boolean) => void;
  includeBookmarks: boolean;
  setIncludeBookmarks: (v: boolean) => void;
  includeHighlights: boolean;
  setIncludeHighlights: (v: boolean) => void;
  pageRange: 'all' | 'current' | 'custom';
  setPageRange: (v: 'all' | 'current' | 'custom') => void;
  customStart: number;
  setCustomStart: (v: number) => void;
  customEnd: number;
  setCustomEnd: (v: number) => void;
  pageSize: string;
  setPageSize: (v: string) => void;
  onClose: () => void;
  handleDownload: () => void;
}

export const DownloadPdfControls: React.FC<DownloadPdfControlsProps> = ({
  book,
  includeContent,
  setIncludeContent,
  includeTopics,
  setIncludeTopics,
  includeNotes,
  setIncludeNotes,
  includeBookmarks,
  setIncludeBookmarks,
  includeHighlights,
  setIncludeHighlights,
  pageRange,
  setPageRange,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  pageSize,
  setPageSize,
  onClose,
  handleDownload,
}) => {
  return (
    <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 justify-between overflow-y-auto max-h-[90vh] text-left">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-black text-text-primary tracking-tight">Download as PDF</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Choose what you want to include in your PDF export
          </p>
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
            Include in PDF
          </span>
          <div className="space-y-2 bg-surface-alt border border-border/60 rounded-xl p-3.5">
            {[
              {
                id: 'content',
                label: 'Content (All Pages)',
                desc: 'All pages of your book',
                val: includeContent,
                set: setIncludeContent,
              },
              {
                id: 'topics',
                label: 'Topics (Table of Contents)',
                desc: 'All topics and chapters',
                val: includeTopics,
                set: setIncludeTopics,
              },
              {
                id: 'notes',
                label: 'Notes & Sticky Notes',
                desc: 'All notes and sticky notes',
                val: includeNotes,
                set: setIncludeNotes,
              },
              {
                id: 'bookmarks',
                label: 'Bookmarks',
                desc: 'All bookmarks',
                val: includeBookmarks,
                set: setIncludeBookmarks,
              },
              {
                id: 'highlights',
                label: 'Highlights',
                desc: 'All highlighted content',
                val: includeHighlights,
                set: setIncludeHighlights,
              },
            ].map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 p-1 cursor-pointer select-none group text-xs"
              >
                <input
                  type="checkbox"
                  checked={item.val}
                  onChange={(e) => item.set(e.target.checked)}
                  className="mt-0.5 rounded border-border text-indigo-600 focus:ring-indigo-500/20 cursor-pointer"
                />
                <div>
                  <div className="font-bold text-text-primary group-hover:text-indigo-600 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Page Range selector */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
            Page Range
          </span>
          <div className="grid grid-cols-3 gap-2 bg-surface-alt border border-border/60 rounded-xl p-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Pages' },
              { id: 'current', label: 'Current Page' },
              { id: 'custom', label: 'Custom Range' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setPageRange(range.id as any)}
                className={`py-1.5 rounded-lg cursor-pointer transition-colors text-[10px] font-bold ${
                  pageRange === range.id
                    ? 'bg-indigo-600 text-white shadow-subtle'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {pageRange === 'custom' && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min={1}
                max={book.pagesCount || 20}
                value={customStart}
                onChange={(e) => setCustomStart(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-surface-alt border border-border rounded-lg px-2 py-1 text-xs text-center text-text-primary"
              />
              <span className="text-xs text-text-secondary">to</span>
              <input
                type="number"
                min={1}
                max={book.pagesCount || 20}
                value={customEnd}
                onChange={(e) => setCustomEnd(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 bg-surface-alt border border-border rounded-lg px-2 py-1 text-xs text-center text-text-primary"
              />
            </div>
          )}
        </div>

        {/* Page Size */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider block">
            Page Size
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className="w-full bg-surface-alt border border-border rounded-xl px-3.5 py-2 text-xs text-text-primary cursor-pointer focus:outline-none focus:border-indigo-500"
          >
            <option value="A4">A4 (210 x 297 mm)</option>
            <option value="Letter">Letter (8.5 x 11 in)</option>
            <option value="Legal">Legal (8.5 x 14 in)</option>
          </select>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          onClick={onClose}
          className="px-5 py-2 border border-border bg-surface text-text-primary text-xs font-semibold rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleDownload}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-subtle cursor-pointer transition-colors"
        >
          <IconDownload size={14} />
          Download PDF
        </button>
      </div>
    </div>
  );
};
