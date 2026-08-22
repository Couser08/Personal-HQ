import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { type Book } from '../../../store/types';
import { generateBookPdfHtml } from '../utils/bookPdfGenerator';
import { DownloadPdfPreview } from './DownloadPdfPreview';
import { DownloadPdfControls } from './DownloadPdfControls';

interface DownloadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

export const DownloadPdfModal: React.FC<DownloadPdfModalProps> = ({
  isOpen,
  onClose,
  book: rawBook,
}) => {
  const book = {
    ...rawBook,
    pages: rawBook.pages || {},
    topics: rawBook.topics || [],
    stickyNotes: rawBook.stickyNotes || [],
    bookmarks: rawBook.bookmarks || [],
    pagesCount: rawBook.pagesCount || 20,
    currentPage: rawBook.currentPage || 1,
  };

  // Checklist states
  const [includeContent, setIncludeContent] = useState(true);
  const [includeTopics, setIncludeTopics] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [includeBookmarks, setIncludeBookmarks] = useState(true);
  const [includeHighlights, setIncludeHighlights] = useState(true);

  // Range & Size states
  const [pageRange, setPageRange] = useState<'all' | 'current' | 'custom'>('all');
  const [customStart, setCustomStart] = useState(1);
  const [customEnd, setCustomEnd] = useState(book.pagesCount || 20);
  const [pageSize, setPageSize] = useState('A4');

  if (!isOpen) return null;

  const handleDownload = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = generateBookPdfHtml({
      book,
      includeContent,
      includeTopics,
      includeNotes,
      includeBookmarks,
      includeHighlights,
      pageRange,
      customStart,
      customEnd,
    });

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative bg-surface border border-border w-full max-w-4xl rounded-[28px] shadow-high flex flex-col md:flex-row overflow-hidden max-h-[90vh] text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-20 p-2 hover:bg-surface-hover border border-border/40 rounded-full transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <IconX size={16} />
        </button>

        {/* Left Column: Live PDF print preview */}
        <DownloadPdfPreview
          book={book}
          includeBookmarks={includeBookmarks}
          includeTopics={includeTopics}
          includeContent={includeContent}
          includeHighlights={includeHighlights}
          includeNotes={includeNotes}
        />

        {/* Right Column: Settings & Configuration */}
        <DownloadPdfControls
          book={book}
          includeContent={includeContent}
          setIncludeContent={setIncludeContent}
          includeTopics={includeTopics}
          setIncludeTopics={setIncludeTopics}
          includeNotes={includeNotes}
          setIncludeNotes={setIncludeNotes}
          includeBookmarks={includeBookmarks}
          setIncludeBookmarks={setIncludeBookmarks}
          includeHighlights={includeHighlights}
          setIncludeHighlights={setIncludeHighlights}
          pageRange={pageRange}
          setPageRange={setPageRange}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
          pageSize={pageSize}
          setPageSize={setPageSize}
          onClose={onClose}
          handleDownload={handleDownload}
        />
      </div>
    </div>
  );
};
