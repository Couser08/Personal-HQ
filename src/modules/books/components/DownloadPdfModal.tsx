import React, { useState } from 'react';
import { IconX, IconDownload } from '@tabler/icons-react';
import { type Book } from '../../../store/types';

interface DownloadPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
}

export const DownloadPdfModal: React.FC<DownloadPdfModalProps> = ({ isOpen, onClose, book }) => {
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
    // Generate a printable window styling specific to a book layout
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Build printed content based on selected filters
    const getActiveTopicForPage = (pageNo: number) => {
      const sortedTopics = [...book.topics].sort((a, b) => a.pageNumber - b.pageNumber);
      let activeTopic = null;
      let topicIndex = -1;
      for (let i = 0; i < sortedTopics.length; i++) {
        if (sortedTopics[i].pageNumber <= pageNo) {
          activeTopic = sortedTopics[i];
          topicIndex = i + 1;
        } else {
          break;
        }
      }
      return activeTopic ? `Topic ${topicIndex}: ${activeTopic.title}` : 'Notebook Entry';
    };

    let htmlContent = `
      <html>
        <head>
          <title>${book.title} - Book Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
            
            @page {
              size: A4;
              margin: 20mm;
            }
            
            body {
              font-family: 'DM Sans', sans-serif;
              color: #2c3e50;
              line-height: 1.6;
              padding: 0;
              margin: 0;
              background: #fff;
            }
            
            .page {
              page-break-after: always;
              page-break-inside: avoid;
              box-sizing: border-box;
              position: relative;
              height: 250mm; /* strictly bound to prevent spilling */
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-top: 15mm;
              padding-bottom: 10mm;
            }
            
            .running-header {
              font-size: 8px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #94a3b8;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
              margin-bottom: 15mm;
              display: flex;
              justify-content: space-between;
            }
            
            .cover-container {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              height: 100%;
            }
            
            .cover-logo {
              font-size: 10px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 3px;
              color: #6366f1;
              margin-bottom: 5mm;
            }
            
            .cover-title {
              font-family: 'Playfair Display', serif;
              font-size: 42px;
              font-weight: 700;
              color: #1e1b4b;
              margin: 4mm 0;
              line-height: 1.1;
            }
            
            .cover-author {
              font-size: 18px;
              font-weight: 500;
              color: #475569;
              margin-bottom: 8mm;
            }
            
            .cover-tagline {
              font-style: italic;
              font-size: 14px;
              color: #64748b;
              max-width: 120mm;
              margin: 5mm auto;
              line-height: 1.5;
            }
            
            .cover-footer {
              margin-top: 30mm;
              font-size: 10px;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 5mm;
              width: 80mm;
            }
            
            h3.section-title {
              font-family: 'Playfair Display', serif;
              font-size: 24px;
              font-weight: 700;
              color: #1e1b4b;
              margin-top: 0;
              margin-bottom: 8mm;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 3mm;
            }
            
            .toc-list {
              margin-top: 10mm;
            }
            
            .toc-item {
              display: flex;
              justify-content: space-between;
              align-items: baseline;
              padding: 10px 0;
              font-size: 13px;
              font-weight: 500;
              color: #334155;
            }
            
            .toc-dots {
              flex-grow: 1;
              border-bottom: 1px dashed #cbd5e1;
              margin: 0 10px;
            }
            
            .text-block {
              font-size: 14px;
              color: #334155;
              text-align: justify;
              margin-bottom: 10mm;
              flex-grow: 1;
            }
            
            .text-block p {
              margin: 0 0 12px 0;
            }
            
            /* Highlighters colors in PDF */
            span[style*="background-color"] {
              padding: 2px 4px;
              border-radius: 4px;
            }
            
            .sticky-notes-container {
              margin-top: 10mm;
              display: grid;
              grid-template-cols: 1fr;
              gap: 4mm;
            }
            
            .sticky-note {
              background: #fef9c3;
              border-left: 4px solid #eab308;
              padding: 12px 16px;
              border-radius: 8px;
              font-size: 12px;
              color: #713f12;
            }
            
            .sticky-note.pink {
              background: #fce7f3;
              border-left-color: #db2777;
              color: #701a75;
            }
            
            .sticky-note-title {
              font-weight: 700;
              margin-bottom: 4px;
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            
            .sticky-note-date {
              font-size: 9px;
              opacity: 0.6;
              margin-top: 6px;
            }
            
            .bookmark-badge {
              display: inline-flex;
              align-items: center;
              background: #e0e7ff;
              color: #3730a3;
              padding: 3px 8px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 700;
              margin-bottom: 6mm;
            }
            
            .page-num {
              text-align: center;
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              border-top: 1px solid #f1f5f9;
              padding-top: 4mm;
            }
          </style>
        </head>
        <body>
    `;

    // 1. Cover Page
    htmlContent += `
      <div class="page">
        <div class="cover-container">
          <div class="cover-logo">Personal Notebook</div>
          <h1 class="cover-title">${book.title}</h1>
          <h2 class="cover-author">by ${book.author}</h2>
          <div class="cover-tagline">"${book.tagline}"</div>
          <div class="cover-footer">Exported via Personal HQ • ${new Date().toLocaleDateString('en-GB')}</div>
        </div>
      </div>
    `;

    // 2. Table of Contents
    if (includeTopics && book.topics.length > 0) {
      htmlContent += `
        <div class="page">
          <div>
            <div class="running-header">
              <span>${book.title}</span>
              <span>Table of Contents</span>
            </div>
            <h3 class="section-title">Table of Contents</h3>
            <div class="toc-list">
      `;
      book.topics.forEach((topic) => {
        htmlContent += `
          <div class="toc-item">
            <span>${topic.title}</span>
            <span class="toc-dots"></span>
            <span>Page ${topic.pageNumber}</span>
          </div>
        `;
      });
      htmlContent += `
            </div>
          </div>
          <div class="page-num">ii</div>
        </div>
      `;
    }

    // 3. Pages Content
    if (includeContent) {
      let pageNumbers: number[] = [];
      if (pageRange === 'all') {
        pageNumbers = Object.keys(book.pages).map(Number).sort((a, b) => a - b);
      } else if (pageRange === 'current') {
        pageNumbers = [book.currentPage];
      } else {
        const start = Math.max(1, customStart);
        const end = Math.min(book.pagesCount, customEnd);
        for (let i = start; i <= end; i++) {
          if (book.pages[i]) pageNumbers.push(i);
        }
      }

      pageNumbers.forEach((pageNo) => {
        const hasBookmark = includeBookmarks && book.bookmarks.includes(pageNo);
        const pageNotes = includeNotes ? book.stickyNotes.filter((n) => n.pageNumber === pageNo) : [];
        const activeTopicName = getActiveTopicForPage(pageNo);
        let text = book.pages[pageNo] || '';

        htmlContent += `
          <div class="page">
            <div>
              <div class="running-header">
                <span>${book.title}</span>
                <span>${activeTopicName}</span>
              </div>
              
              ${hasBookmark ? `<div class="bookmark-badge">★ Bookmarked Page</div>` : ''}
              
              <div class="text-block">${text}</div>
        `;

        if (pageNotes.length > 0) {
          htmlContent += `<div class="sticky-notes-container">`;
          pageNotes.forEach((note) => {
            htmlContent += `
              <div class="sticky-note ${note.color}">
                <div class="sticky-note-title">${note.title}</div>
                <div>${note.content}</div>
                <div class="sticky-note-date">${note.date}</div>
              </div>
            `;
          });
          htmlContent += `</div>`;
        }

        htmlContent += `
            </div>
            <div class="page-num">${pageNo}</div>
          </div>
        `;
      });
    }

    htmlContent += `
        </body>
      </html>
    `;

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
        <div className="w-full md:w-1/2 bg-surface-alt border-r border-border p-6 flex flex-col justify-center items-center">
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
              {includeBookmarks && book.bookmarks.includes(1) && (
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
                    The Alchemist is a novel by Paulo Coelho that follows the journey of Santiago, a young shepherd{' '}
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
              {includeNotes && book.stickyNotes.length > 0 && (
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

        {/* Right Column: Settings & Configuration */}
        <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 justify-between overflow-y-auto max-h-[90vh]">
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
                    max={book.pagesCount}
                    value={customStart}
                    onChange={(e) => setCustomStart(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-surface-alt border border-border rounded-lg px-2 py-1 text-xs text-center text-text-primary"
                  />
                  <span className="text-xs text-text-secondary">to</span>
                  <input
                    type="number"
                    min={1}
                    max={book.pagesCount}
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

      </div>
    </div>
  );
};
