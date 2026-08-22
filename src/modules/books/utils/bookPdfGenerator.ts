import type { Book } from '../../../store/types';

interface GeneratePdfOptions {
  book: Book;
  includeContent: boolean;
  includeTopics: boolean;
  includeNotes: boolean;
  includeBookmarks: boolean;
  includeHighlights: boolean;
  pageRange: 'all' | 'current' | 'custom';
  customStart: number;
  customEnd: number;
}

export function generateBookPdfHtml(options: GeneratePdfOptions): string {
  const {
    book,
    includeContent,
    includeTopics,
    includeNotes,
    includeBookmarks,
    pageRange,
    customStart,
    customEnd,
  } = options;

  const getActiveTopicForPage = (pageNo: number) => {
    const sortedTopics = [...(book.topics || [])].sort((a, b) => a.pageNumber - b.pageNumber);
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
            height: 250mm;
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
  if (includeTopics && book.topics && book.topics.length > 0) {
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
  if (includeContent && book.pages) {
    let pageNumbers: number[] = [];
    if (pageRange === 'all') {
      pageNumbers = Object.keys(book.pages).map(Number).sort((a, b) => a - b);
    } else if (pageRange === 'current') {
      pageNumbers = [book.currentPage || 1];
    } else {
      const start = Math.max(1, customStart);
      const end = Math.min(book.pagesCount || 20, customEnd);
      for (let i = start; i <= end; i++) {
        if (book.pages[i]) pageNumbers.push(i);
      }
    }

    pageNumbers.forEach((pageNo) => {
      const hasBookmark = includeBookmarks && (book.bookmarks || []).includes(pageNo);
      const pageNotes = includeNotes
        ? (book.stickyNotes || []).filter((n) => n.pageNumber === pageNo)
        : [];
      const activeTopicName = getActiveTopicForPage(pageNo);
      let text = (book.pages || {})[pageNo] || '';

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

  return htmlContent;
}
