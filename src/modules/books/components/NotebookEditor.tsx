import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { type BookTopic, type BookStickyNote } from '../../../store/types';

import { SelectionToolbar } from './SelectionToolbar';
import { NotebookTopNav } from './notebook/NotebookTopNav';
import { LeftToolStrip } from './notebook/LeftToolStrip';
import { NotebookToolbar } from './notebook/NotebookToolbar';
import { NotebookSidePanel } from './notebook/NotebookSidePanel';
import { AiAssistantOverlay, NotebookSettingsOverlay } from './notebook/NotebookOverlays';
import { NotebookPageSpread } from './notebook/NotebookPageSpread';
import { NotebookModalsContainer } from './notebook/NotebookModalsContainer';
import { useNotebookModalsAndActions } from '../hooks/useNotebookModalsAndActions';

const highlightMatches = (html: string, query: string) => {
  if (!query || !query.trim()) return html;
  const escaped = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`(?<!<[^>]*)${escaped}`, 'gi');
  return html.replace(regex, (match) => {
    return `<span class="bg-orange-400 dark:bg-orange-500/50 text-amber-950 dark:text-amber-100 px-0.5 rounded font-black border-b border-orange-500 shadow-sm animate-pulse">${match}</span>`;
  });
};

interface NotebookEditorProps {
  bookId: string;
  onBack: () => void;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({ bookId, onBack }) => {
  const { books, updateBook, deleteBook, showConfirm } = useAppStore();
  const rawBook = books.find((b) => b.id === bookId);
  const book = rawBook
    ? {
        ...rawBook,
        pages: rawBook.pages || {},
        topics: (rawBook.topics || []) as BookTopic[],
        stickyNotes: (rawBook.stickyNotes || []) as BookStickyNote[],
        bookmarks: (rawBook.bookmarks || []) as number[],
        highlights: rawBook.highlights || [],
        pagesCount: rawBook.pagesCount || 10,
        currentPage: rawBook.currentPage || 1,
      }
    : undefined;

  // Local editor states
  const [isEditMode, setIsEditMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Sidebars display toggles
  const [showTopicsPanel, setShowTopicsPanel] = useState(true);
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<
    'toc' | 'sticky' | 'highlighter' | 'bookmarks' | 'search' | 'ai' | 'settings'
  >('toc');

  // Text Selection & Formatting states
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState(14);
  const [activeHighlightColor, setActiveHighlightColor] = useState('yellow');
  const [selectionPos, setSelectionPos] = useState<{ top: number; left: number } | null>(null);
  const editorRefLeft = useRef<HTMLDivElement>(null);
  const editorRefRight = useRef<HTMLDivElement>(null);
  const lastFocusedEditorRef = useRef<'left' | 'right'>('left');

  useEffect(() => {
    const handleMouseUp = () => {
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.top > 0) {
          setSelectionPos({ top: rect.top, left: rect.left + rect.width / 2 });
          return;
        }
      }
      setSelectionPos(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Reading Mode Modern Style Templates
  const [readingStyle, setReadingStyle] = useState<'warm' | 'minimal' | 'scholar' | 'sage'>('warm');

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);
  const triggerToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Inner text state
  const [pageText, setPageText] = useState(book?.pages?.[book?.currentPage] || '');

  // Search inside book
  const [searchInnerQuery, setSearchInnerQuery] = useState('');
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  const saveTimerRef = useRef<any>(null);

  const handleTextChange = (newVal: string) => {
    if (!book) return;
    setPageText(newVal);
    setSaveStatus('saving');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      const updatedPages = { ...book.pages, [book.currentPage]: newVal };
      updateBook(book.id, { pages: updatedPages });
      setSaveStatus('saved');
    }, 1000);
  };

  const notebookModals = useNotebookModalsAndActions({
    book: book as any,
    updateBook,
    deleteBook,
    showConfirm,
    onBack,
    pageText,
    handleTextChange,
  });

  // Formatting operations
  const executeFormatting = (command: string, value: string = '') => {
    if (!book) return;
    const activeEditor =
      lastFocusedEditorRef.current === 'left' ? editorRefLeft.current : editorRefRight.current;
    if (activeEditor) {
      activeEditor.focus();
    }
    document.execCommand(command, false, value);
    if (editorRefLeft.current) {
      handleTextChange(editorRefLeft.current.innerHTML);
    }
    if (editorRefRight.current && book.currentPage + 1 <= book.pagesCount) {
      const rightContent = editorRefRight.current.innerHTML;
      const updatedPages = { ...book.pages, [book.currentPage + 1]: rightContent };
      updateBook(book.id, { pages: updatedPages });
    }
  };

  const applyHighlight = (colorId?: string) => {
    const activeColor = colorId || activeHighlightColor;
    const colorsHex: { [key: string]: string } = {
      yellow: '#FEF08A',
      green: '#BBF7D0',
      blue: '#DBEAFE',
      purple: '#F3E8FF',
      pink: '#FCE7F3',
    };
    const hex = colorsHex[activeColor] || '#FEF08A';
    executeFormatting('hiliteColor', hex);
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      setTimeout(() => {
        document.execCommand('hiliteColor', false, 'rgba(0,0,0,0)');
      }, 0);
    }
  };

  // Sync pageText when currentPage changes
  useEffect(() => {
    if (!book) return;
    const leftVal = book.pages[book.currentPage] || '';
    const rightVal = book.pages[book.currentPage + 1] || '';

    setPageText(leftVal);

    if (editorRefLeft.current) {
      editorRefLeft.current.innerHTML = leftVal;
    }
    if (editorRefRight.current) {
      editorRefRight.current.innerHTML = rightVal;
    }
  }, [book?.currentPage, book?.id]);

  if (!book) {
    return (
      <div className="p-8 text-center border bg-surface rounded-2xl border-border">
        <h3 className="font-bold text-text-primary">Notebook not found</h3>
        <button
          onClick={onBack}
          className="px-4 py-2 mt-4 text-xs font-bold text-white bg-rose-500 rounded-xl active:scale-[0.97] transition-transform duration-100"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getActiveTopicForPage = (pageNo: number) => {
    const sortedTopics = [...book.topics].sort((a, b) => a.pageNumber - b.pageNumber);
    let activeTopic: BookTopic | null = null;
    let topicIndex = -1;

    for (let i = 0; i < sortedTopics.length; i++) {
      if (sortedTopics[i].pageNumber <= pageNo) {
        activeTopic = sortedTopics[i];
        topicIndex = i + 1;
      } else {
        break;
      }
    }
    return activeTopic ? { topic: activeTopic, index: topicIndex, title: activeTopic.title } : null;
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const nextP = book.currentPage + 2;
      if (nextP <= book.pagesCount) {
        updateBook(book.id, { currentPage: nextP });
      }
    } else {
      const prevP = book.currentPage - 2;
      if (prevP >= 1) {
        updateBook(book.id, { currentPage: prevP });
      }
    }
  };

  const getStyleForReadingTheme = () => {
    if (isEditMode) return undefined;
    switch (readingStyle) {
      case 'warm':
        return { color: '#2c1a0e', fontFamily: 'serif', fontSize: `${fontSize + 1}px` };
      case 'minimal':
        return { color: '#0f172a', fontFamily: 'sans-serif', fontSize: `${fontSize}px` };
      case 'scholar':
        return { color: '#f1f5f9', fontFamily: 'serif', fontSize: `${fontSize + 1}px` };
      case 'sage':
        return { color: '#132a13', fontFamily: 'serif', fontSize: `${fontSize + 1}px` };
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  const renderReadModeHTML = (textStr: string) => {
    if (!textStr)
      return <p className="italic text-text-muted">Blank page. Switch to Edit Mode to write.</p>;

    let html = textStr;
    if (searchInnerQuery && searchInnerQuery.trim()) {
      html = highlightMatches(html, searchInnerQuery);
    }

    return <div className="break-words" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="@container/notebook flex flex-col gap-3 sm:gap-4 max-w-6xl mx-auto w-full text-left font-sans select-text min-h-[calc(100dvh-5rem)]">
      {/* Top Navigation Bar */}
      <NotebookTopNav
        onBack={onBack}
        openEditBookDetailsModal={notebookModals.openEditBookDetailsModal}
        category={book.category || 'General'}
        title={book.title}
        author={book.author}
        tagline={book.tagline}
        saveStatus={saveStatus}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        readingStyle={readingStyle}
        setReadingStyle={setReadingStyle}
        bookId={book.id}
        topics={book.topics}
        pagesCount={book.pagesCount}
        pages={book.pages}
        stickyNotes={book.stickyNotes}
        onDuplicate={() => triggerToast('Notebook duplication simulated!')}
        onDeleteBook={() => notebookModals.triggerDeleteConfirm('book', book.id, book.title)}
      />

      {/* Editor Layout Spread */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:gap-5 min-h-[480px]">
        {/* Left Toolbar Strip */}
        <LeftToolStrip
          showTopicsPanel={showTopicsPanel}
          setShowTopicsPanel={setShowTopicsPanel}
          showNotesPanel={showNotesPanel}
          setShowNotesPanel={setShowNotesPanel}
          activeLeftTab={activeLeftTab}
          setActiveLeftTab={setActiveLeftTab}
          activeHighlightColor={activeHighlightColor}
          setActiveHighlightColor={setActiveHighlightColor}
          applyHighlight={applyHighlight}
          toggleBookmark={() => notebookModals.toggleBookmark(book.currentPage)}
          searchInnerQuery={searchInnerQuery}
          setSearchInnerQuery={setSearchInnerQuery}
          isSearchBoxOpen={isSearchBoxOpen}
          setIsSearchBoxOpen={setIsSearchBoxOpen}
          openAddTopicModal={notebookModals.openAddTopicModal}
          openAddStickyModal={notebookModals.openAddStickyModal}
        />

        {/* Centered Ruled Notebook Area Spread */}
        <NotebookPageSpread
          book={book}
          isEditMode={isEditMode}
          readingStyle={readingStyle}
          pageText={pageText}
          renderReadModeHTML={renderReadModeHTML}
          editorRefLeft={editorRefLeft}
          editorRefRight={editorRefRight}
          handleTextChange={handleTextChange}
          handleEditorKeyDown={handleEditorKeyDown}
          lastFocusedEditorRef={lastFocusedEditorRef}
          updateBook={updateBook}
          getActiveTopicForPage={getActiveTopicForPage}
          getStyleForReadingTheme={getStyleForReadingTheme}
          openEditStickyModal={notebookModals.openEditStickyModal}
          triggerDeleteConfirm={notebookModals.triggerDeleteConfirm}
          handlePageTurn={handlePageTurn}
        />

        {/* Desktop Inline Right Sidebar: Topics & Notes Panels (xl+) */}
        <NotebookSidePanel
          showTopicsPanel={showTopicsPanel}
          setShowTopicsPanel={setShowTopicsPanel}
          showNotesPanel={showNotesPanel}
          setShowNotesPanel={setShowNotesPanel}
          topics={book.topics}
          stickyNotes={book.stickyNotes}
          currentPage={book.currentPage}
          onSelectTopicPage={(pageNo) => {
            const pageTarget = pageNo % 2 === 0 ? pageNo - 1 : pageNo;
            updateBook(book.id, { currentPage: pageTarget });
          }}
          onToggleTopicState={(topicId, nextState) => {
            const updatedTopics = book.topics.map((t) =>
              t.id === topicId ? { ...t, readingState: nextState } : t,
            );
            updateBook(book.id, { topics: updatedTopics });
          }}
          onEditTopic={notebookModals.openEditTopicModal}
          onDeleteTopic={(id, name) => notebookModals.triggerDeleteConfirm('topic', id, name)}
          openAddTopicModal={notebookModals.openAddTopicModal}
          openAddStickyModal={notebookModals.openAddStickyModal}
          onEditSticky={notebookModals.openEditStickyModal}
          onDeleteSticky={(id, name) => notebookModals.triggerDeleteConfirm('sticky', id, name)}
        />
      </div>

      {/* Bottom Formatting Toolbar */}
      <NotebookToolbar
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        fontSize={fontSize}
        setFontSize={setFontSize}
        executeFormatting={executeFormatting}
        activeHighlightColor={activeHighlightColor}
        setActiveHighlightColor={setActiveHighlightColor}
        applyHighlight={applyHighlight}
        isEditMode={isEditMode}
        openAddStickyModal={notebookModals.openAddStickyModal}
        toggleBookmark={() => notebookModals.toggleBookmark(book.currentPage || 1)}
        isBookmarked={(book.bookmarks || []).includes(book.currentPage || 1)}
        onAddPages={() => {
          const newLimit = (book.pagesCount || 5) + 5;
          updateBook(book.id, { pagesCount: newLimit });
          triggerToast(`Added 5 more pages! New limit is ${newLimit} pages.`);
        }}
        toggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        triggerToast={triggerToast}
      />

      {/* AI Assistant Overlay */}
      {activeLeftTab === 'ai' && (
        <AiAssistantOverlay
          aiPrompt={notebookModals.aiPrompt}
          setAiPrompt={notebookModals.setAiPrompt}
          aiOutput={notebookModals.aiOutput}
          isAiLoading={notebookModals.isAiLoading}
          handleAiPrompt={notebookModals.handleAiPrompt}
          handleApplyAiText={notebookModals.handleApplyAiText}
          onClose={() => setActiveLeftTab('toc')}
        />
      )}

      {/* Settings Tab Overlay */}
      {activeLeftTab === 'settings' && (
        <NotebookSettingsOverlay
          book={book as any}
          updateBook={updateBook}
          onClose={() => setActiveLeftTab('toc')}
        />
      )}

      {/* Custom Modals Overlay */}
      <NotebookModalsContainer
        activeModal={notebookModals.activeModal}
        setActiveModal={notebookModals.setActiveModal}
        modalTopicTitle={notebookModals.modalTopicTitle}
        setModalTopicTitle={notebookModals.setModalTopicTitle}
        modalTopicPage={notebookModals.modalTopicPage}
        setTopicPage={notebookModals.setModalTopicPage}
        pagesCount={book.pagesCount}
        submitTopicForm={notebookModals.submitTopicForm}
        modalStickyTitle={notebookModals.modalStickyTitle}
        setModalStickyTitle={notebookModals.setModalStickyTitle}
        modalStickyContent={notebookModals.modalStickyContent}
        setModalStickyContent={notebookModals.setModalStickyContent}
        modalStickyPosition={notebookModals.modalStickyPosition}
        setModalStickyPosition={notebookModals.setModalStickyPosition}
        modalStickyStyleTheme={notebookModals.modalStickyStyleTheme}
        setModalStickyStyleTheme={notebookModals.setModalStickyStyleTheme}
        modalStickyColor={notebookModals.modalStickyColor}
        setModalStickyColor={notebookModals.setModalStickyColor}
        submitStickyForm={notebookModals.submitStickyForm}
        deleteTarget={notebookModals.deleteTarget}
        setDeleteTarget={notebookModals.setDeleteTarget}
        submitDelete={notebookModals.submitDelete}
        titleInput={notebookModals.titleInput}
        setTitleInput={notebookModals.setTitleInput}
        taglineInput={notebookModals.taglineInput}
        setTaglineInput={notebookModals.setTaglineInput}
        bookAuthorInput={notebookModals.bookAuthorInput}
        setBookAuthorInput={notebookModals.setBookAuthorInput}
        bookCoverInput={notebookModals.bookCoverInput}
        setBookCoverInput={notebookModals.setBookCoverInput}
        saveBookDetails={notebookModals.saveBookDetails}
      />

      {/* Contextual Floating Selection Toolbar */}
      <SelectionToolbar
        position={selectionPos}
        onFormat={(cmd) => executeFormatting(cmd)}
        onHighlight={(col) => applyHighlight(col)}
        onAddNote={() => notebookModals.openAddStickyModal('yellow')}
        onClose={() => setSelectionPos(null)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-9999 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-high text-xs font-bold flex items-center gap-2 animate-slideUp">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default NotebookEditor;
