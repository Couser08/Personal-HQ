import React, { useState } from 'react';
import {
  IconArrowLeft,
  IconPencil,
  IconBook,
  IconDots,
  IconTrash,
} from '@tabler/icons-react';
import { type BookTopic } from '../../../../store/types';

interface NotebookTopNavProps {
  onBack: () => void;
  openEditBookDetailsModal: () => void;
  category: string;
  title: string;
  author: string;
  tagline?: string;
  saveStatus: 'saved' | 'saving';
  isEditMode: boolean;
  setIsEditMode: (edit: boolean) => void;
  readingStyle: 'warm' | 'minimal' | 'scholar' | 'sage';
  setReadingStyle: (style: 'warm' | 'minimal' | 'scholar' | 'sage') => void;
  bookId: string;
  topics: BookTopic[];
  pagesCount: number;
  pages: Record<number, string>;
  stickyNotes: any[];
  onDuplicate: () => void;
  onDeleteBook: () => void;
}

export const NotebookTopNav: React.FC<NotebookTopNavProps> = ({
  onBack,
  openEditBookDetailsModal,
  category,
  title,
  author,
  tagline,
  saveStatus,
  isEditMode,
  setIsEditMode,
  readingStyle,
  setReadingStyle,
  topics,
  pagesCount,
  pages,
  stickyNotes,
  onDuplicate,
  onDeleteBook,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const handleExportPdf = () => {
    setIsMoreMenuOpen(false);
    const sortedTopics = [...topics].sort((a, b) => a.pageNumber - b.pageNumber);
    const getTopicForPage = (pageNo: number) => {
      let t: typeof sortedTopics[0] | null = null;
      for (const topic of sortedTopics) {
        if (topic.pageNumber <= pageNo) t = topic;
        else break;
      }
      return t;
    };
    const pagesHTML = Array.from({ length: pagesCount }, (_, i) => i + 1)
      .filter((p) => pages[p])
      .map((p) => {
        const topic = getTopicForPage(p);
        return `
          <div class="page">
            ${topic ? `<div class="chapter-label">Chapter ${sortedTopics.indexOf(topic) + 1}</div><h2 class="chapter-title">${topic.title}</h2><hr class="chapter-rule"/>` : ''}
            <div class="page-num">Page ${p}</div>
            <div class="page-content">${pages[p] || ''}</div>
          </div>`;
      })
      .join('');

    const stickyNotesHTML = stickyNotes.length > 0
      ? `
        <div class="page sticky-notes-summary-page">
          <h2 class="chapter-title" style="margin-top:0; border-bottom: 2px solid #c0956a; padding-bottom: 12px; margin-bottom: 30px; font-family: 'Inter', sans-serif;">📌 Sticky Notes & Insights Summary</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            ${stickyNotes.map((note) => {
              const isPink = note.color === 'pink';
              const bgColor = isPink ? '#fdf2f8' : '#fffbeb';
              const borderColor = isPink ? '#fbcfe8' : '#fef08a';
              const textColor = isPink ? '#831843' : '#713f12';
              const noteTheme = note.styleTheme || 'default';
              const notePos = note.position || 'bottom-right';

              return `
                <div style="background: ${bgColor}; border: 1.5px solid ${borderColor}; padding: 15px; border-radius: 12px; font-family: 'Lora', serif; font-size: 0.85rem; color: ${textColor}; display: flex; flex-direction: column; justify-content: space-between; min-height: 125px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); -webkit-print-color-adjust: exact; print-color-adjust: exact;">
                  <div>
                    <div style="font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; margin-bottom: 6px; display: flex; justify-content: space-between;">
                      <span>${note.title} (Page ${note.pageNumber})</span>
                      <span style="font-size:0.55rem; opacity:0.6;">Theme: ${noteTheme}</span>
                    </div>
                    <div style="line-height: 1.6; word-break: break-word;">${note.content}</div>
                  </div>
                  <div style="font-family: 'Inter', sans-serif; font-size: 0.55rem; opacity: 0.5; margin-top: 10px; display: flex; justify-content: space-between;">
                    <span>Pos: ${notePos}</span>
                    <span>${note.date}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>`
      : '';

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html>
      <head>
        <meta charset="UTF-8"/>
        <title>${title} — ${author}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { background: #fff; color: #1a1a1a; font-family: 'Lora', Georgia, serif; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 80px 60px; text-align: center; border-bottom: 3px solid #c0956a; page-break-after: always; }
          .cover-title { font-size: 3rem; font-weight: 700; color: #1a0e05; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 20px; }
          .cover-author { font-size: 1.15rem; color: #9b6e3d; font-style: italic; margin-bottom: 12px; }
          .cover-tagline { font-size: 0.85rem; color: #7a6a58; max-width: 480px; line-height: 1.7; }
          .cover-rule { width: 60px; height: 3px; background: #c0956a; border: none; margin: 28px auto; border-radius: 2px; }
          .page { padding: 72px 80px; min-height: 100vh; page-break-after: always; position: relative; }
          .chapter-label { font-family: 'Inter', sans-serif; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.25em; color: #9b6e3d; margin-bottom: 8px; }
          .chapter-title { font-size: 1.9rem; font-weight: 700; color: #1a0e05; line-height: 1.2; margin-bottom: 12px; font-family: 'Inter', sans-serif; }
          .chapter-rule { border: none; border-top: 2px solid #c0956a; opacity: 0.4; width: 60px; margin: 0 0 28px 0; }
          .page-num { font-family: 'Inter', sans-serif; font-size: 0.65rem; color: #b0956f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 24px; }
          .page-content { font-size: 0.95rem; line-height: 1.9; color: #2c1a0e; text-align: justify; }
          .page-content p { margin-bottom: 1em; }
          .page-content strong { font-weight: 700; }
          .page-content em { font-style: italic; }
          .page-content u { text-decoration: underline; }
          .page-content ul { list-style: disc; margin-left: 1.5rem; margin-bottom: 1em; }
          .page-content ol { list-style: decimal; margin-left: 1.5rem; margin-bottom: 1em; }
          .page-content li { margin-bottom: 0.3em; }
          .page-content blockquote { border-left: 3px solid #c0956a; padding: 6px 16px; margin: 16px 0; background: rgba(192,149,106,0.07); font-style: italic; color: #7a5432; border-radius: 0 6px 6px 0; }
          @media print {
            @page { size: A4; margin: 0; }
            .cover, .page { padding: 60px 72px; }
          }
        </style>
      </head>
      <body>
        <div class="cover">
          <div class="cover-title">${title}</div>
          <hr class="cover-rule"/>
          <div class="cover-author">${author}</div>
          <div class="cover-tagline">${tagline || ''}</div>
        </div>
        ${pagesHTML}
        ${stickyNotesHTML}
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 800);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-4 border bg-surface border-border rounded-2xl shadow-xs">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <button
          onClick={onBack}
          className="p-2 transition-colors border rounded-xl cursor-pointer hover:bg-surface-hover border-border/40 text-text-secondary hover:text-text-primary shrink-0"
          title="Back to Library"
        >
          <IconArrowLeft size={16} />
        </button>

        <div
          className="flex-1 min-w-0 p-1 transition-colors rounded-lg cursor-pointer group hover:bg-surface-hover/30"
          onClick={openEditBookDetailsModal}
          title="Edit Notebook Configurations"
        >
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            <span className="hover:text-rose-500 transition-colors" onClick={(e) => { e.stopPropagation(); onBack(); }}>
              Library
            </span>
            <span>/</span>
            <span>{category || 'General'}</span>
          </div>
          <h2 className="text-xs sm:text-sm font-black text-text-primary flex items-center gap-1.5 truncate">
            {title}
            <IconPencil size={12} className="transition-opacity opacity-0 text-text-muted group-hover:opacity-100" />
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary bg-surface-alt px-2 sm:px-2.5 py-1.5 rounded-lg border border-border">
          <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className="hidden sm:inline">{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
        </div>

        {!isEditMode && (
          <div className="flex items-center gap-1 bg-surface-alt border border-border rounded-xl px-2 py-1 text-xs text-text-primary">
            <span className="font-bold select-none text-text-secondary hidden sm:inline">Theme:</span>
            <select
              value={readingStyle}
              onChange={(e) => setReadingStyle(e.target.value as any)}
              className="px-1 py-0 font-bold bg-transparent border-none cursor-pointer text-text-primary focus:outline-none text-xs"
            >
              <option value="warm" className="bg-surface text-text-primary">Warm</option>
              <option value="minimal" className="bg-surface text-text-primary">Minimal</option>
              <option value="scholar" className="bg-surface text-text-primary">Scholar</option>
              <option value="sage" className="bg-surface text-text-primary">Sage</option>
            </select>
          </div>
        )}

        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-2.5 sm:px-3 py-1.5 border border-border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.97] ${
            isEditMode
              ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
              : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary'
          }`}
        >
          {isEditMode ? <IconPencil size={14} /> : <IconBook size={14} />}
          <span>{isEditMode ? 'Edit' : 'Read'}</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
          >
            <IconDots size={16} />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 z-50 w-40 mt-2 overflow-hidden border bg-surface border-border rounded-xl shadow-high">
              <button
                onClick={handleExportPdf}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-hover cursor-pointer"
              >
                Export as PDF
              </button>
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onDuplicate();
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-hover cursor-pointer border-b border-border/40"
              >
                Duplicate Book
              </button>
              <button
                onClick={() => {
                  setIsMoreMenuOpen(false);
                  onDeleteBook();
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer flex items-center gap-1.5"
              >
                <IconTrash size={13} />
                Delete Notebook
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
