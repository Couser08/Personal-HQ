import React, { useState, useEffect, useRef } from 'react';
import {
  IconArrowLeft,
  IconPencil,
  IconBook,
  IconDots,
  IconTrash,
  IconList,
  IconPlus,
  IconFileText,
  IconHighlight,
  IconBookmark,
  IconSearch,
  IconSparkles,
  IconSettings,
  IconChevronLeft,
  IconChevronRight,
  IconMaximize,
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconListNumbers,
  IconAlignLeft,
  IconPhoto
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { type BookTopic, type BookStickyNote } from '../../../store/types';
import { PRESET_COVERS, BookCover } from '../utils/presetCovers';


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
  const { books, updateBook, deleteBook } = useAppStore();
  const book = books.find((b) => b.id === bookId);

  // Fallback if book deleted
  if (!book) {
    return (
      <div className="p-8 text-center border bg-surface rounded-2xl border-border">
        <h3 className="font-bold text-text-primary">Notebook not found</h3>
        <button onClick={onBack} className="px-4 py-2 mt-4 text-xs font-bold text-white bg-rose-500 rounded-xl active:scale-[0.97] transition-transform duration-100">
          Go Back
        </button>
      </div>
    );
  }

  // Local editor states
  const [isEditMode, setIsEditMode] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [titleInput, setTitleInput] = useState(book.title);
  const [taglineInput, setTaglineInput] = useState(book.tagline);

  // Sidebars display toggles
  const [showTopicsPanel, setShowTopicsPanel] = useState(true);
  const [showNotesPanel, setShowNotesPanel] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState<'toc' | 'sticky' | 'highlighter' | 'bookmarks' | 'search' | 'ai' | 'settings'>('toc');

  // Text Selection & Formatting states
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState(14);
  const [activeHighlightColor, setActiveHighlightColor] = useState('yellow');
  const editorRefLeft = useRef<HTMLDivElement>(null);
  const editorRefRight = useRef<HTMLDivElement>(null);
  const lastFocusedEditorRef = useRef<'left' | 'right'>('left');
  
  // Highlighter hover state with delay timer
  const [isHighlighterHovered, setIsHighlighterHovered] = useState(false);
  const highlighterHoverTimerRef = useRef<any>(null);

  // Reading Mode Modern Style Templates
  const [readingStyle, setReadingStyle] = useState<'warm' | 'minimal' | 'scholar' | 'sage'>('warm');

  // Modal display
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Custom Modal State for Topics, Notes, and Delete confirmations
  const [activeModal, setActiveModal] = useState<'add-topic' | 'edit-topic' | 'add-sticky' | 'edit-sticky' | 'delete-confirm' | 'edit-book-details' | null>(null);
  const [bookCoverInput, setBookCoverInput] = useState(book.coverImage);
  const [bookAuthorInput, setBookAuthorInput] = useState(book.author || '');
  
  // Custom Modal Form Fields
  const [modalTopicTitle, setModalTopicTitle] = useState('');
  const [modalTopicPage, setModalTopicPage] = useState(1);
  const [modalTopicId, setModalTopicId] = useState('');
  
  const [modalStickyTitle, setModalStickyTitle] = useState('');
  const [modalStickyContent, setModalStickyContent] = useState('');
  const [modalStickyColor, setModalStickyColor] = useState<'yellow' | 'pink'>('yellow');
  const [modalStickyId, setModalStickyId] = useState('');
  const [modalStickyPosition, setModalStickyPosition] = useState<'middle-left' | 'bottom-right' | 'top-right'>('bottom-right');
  const [modalStickyStyleTheme, setModalStickyStyleTheme] = useState<'hand-drawn' | 'terminal' | 'default'>('default');
  
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'topic' | 'sticky'; id: string; name: string } | null>(null);

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
  const [pageText, setPageText] = useState(book.pages[book.currentPage] || '');

  // Search inside book (slide-out inline layout)
  const [searchInnerQuery, setSearchInnerQuery] = useState('');
  const [isSearchBoxOpen, setIsSearchBoxOpen] = useState(false);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Formatting operations
  const executeFormatting = (command: string, value: string = '') => {
    const activeEditor = lastFocusedEditorRef.current === 'left' ? editorRefLeft.current : editorRefRight.current;
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
      pink: '#FCE7F3'
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
    const leftVal = book.pages[book.currentPage] || '';
    const rightVal = book.pages[book.currentPage + 1] || '';
    
    setPageText(leftVal);
    
    if (editorRefLeft.current) {
      editorRefLeft.current.innerHTML = leftVal;
    }
    if (editorRefRight.current) {
      editorRefRight.current.innerHTML = rightVal;
    }
  }, [book.currentPage, book.id]);

  // Simulated Auto-Save
  const saveTimerRef = useRef<any>(null);
  const handleTextChange = (newVal: string) => {
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

  // Save Book details configuration
  const saveBookDetails = () => {
    updateBook(book.id, {
      title: titleInput || 'Untitled Notebook',
      tagline: taglineInput,
      coverImage: bookCoverInput,
      author: bookAuthorInput || 'Unknown Author'
    });
    setActiveModal(null);
  };

  const openEditBookDetailsModal = () => {
    setTitleInput(book.title);
    setTaglineInput(book.tagline);
    setBookAuthorInput(book.author || '');
    setBookCoverInput(book.coverImage);
    setActiveModal('edit-book-details');
  };

  const getStickyPositionClasses = (position?: string) => {
    switch (position) {
      case 'middle-left':
        return 'absolute left-[-20px] sm:left-[-40px] top-[40%] -translate-y-1/2 pointer-events-auto z-20';
      case 'top-right':
        return 'absolute right-[-20px] sm:right-[-45px] top-6 pointer-events-auto z-20';
      case 'bottom-right':
      default:
        return 'absolute right-[-20px] sm:right-[-45px] bottom-12 pointer-events-auto z-20';
    }
  };

  const renderStickyNoteCard = (note: BookStickyNote, idx: number) => {
    const isPink = note.color === 'pink';
    const rotation = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';
    const theme = note.styleTheme || 'default';
    
    if (theme === 'terminal') {
      return (
        <div
          onClick={() => openEditStickyModal(note)}
          className={`w-[160px] bg-zinc-950 border border-zinc-800 text-[#00ff66] p-2.5 rounded-lg shadow-lg relative group cursor-pointer font-mono text-[9px] transition-transform hover:scale-105 active:scale-95 duration-200 ease-out ${rotation}`}
        >
          <div className="flex items-center gap-1 mb-2 border-b border-zinc-900 pb-1.5 justify-between">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff5f56]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#27c93f]" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerDeleteConfirm('sticky', note.id, note.title || 'Note');
              }}
              className="text-[10px] w-5 h-5 flex items-center justify-center text-zinc-500 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity font-sans"
            >
              ×
            </button>
          </div>
          <div className="font-bold text-[9px] uppercase tracking-wider text-zinc-400 mb-0.5 truncate">{note.title}</div>
          <div className="break-words leading-normal select-none">{note.content}</div>
        </div>
      );
    }
    
    if (theme === 'hand-drawn') {
      return (
        <div
          onClick={() => openEditStickyModal(note)}
          className={`w-[160px] p-3 border-2 border-black border-dashed bg-amber-50 rounded-[16px_8px_16px_8px] relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200 ease-out ${rotation}`}
          style={{ 
            boxShadow: '2.5px 2.5px 0px rgba(0,0,0,0.9)', 
            backgroundColor: isPink ? '#fdf2f8' : '#fffbeb', 
            fontFamily: 'Comic Sans MS, cursive, sans-serif' 
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerDeleteConfirm('sticky', note.id, note.title || 'Note');
            }}
            className="absolute top-1 right-1.5 w-5 h-5 flex items-center justify-center text-black hover:text-red-500 font-extrabold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-sm" />
          <div className="font-bold text-[9px] uppercase tracking-wider opacity-70 mb-0.5 truncate text-black">{note.title}</div>
          <div className="leading-tight text-[10px] text-zinc-800 break-words select-none">{note.content}</div>
        </div>
      );
    }

    return (
      <div
        onClick={() => openEditStickyModal(note)}
        className={`w-[150px] p-2.5 rounded-xl shadow-md border text-[10px] text-left relative group cursor-pointer transition-transform hover:scale-105 active:scale-95 duration-200 ease-out ${rotation} ${
          isPink
            ? 'bg-pink-100/90 border-pink-200 text-pink-900 shadow-pink-100/50'
            : 'bg-yellow-100/90 border-yellow-200 text-yellow-900 shadow-yellow-100/50'
        }`}
        style={{ fontFamily: 'sans-serif' }}
      >
        <div className="absolute -top-2 left-1/4 right-1/4 h-2.5 bg-white/40 border border-white/60 shadow-sm rounded-sm backdrop-blur-[1px] rotate-1" />
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerDeleteConfirm('sticky', note.id, note.title || 'Sticky Note');
          }}
          className="absolute top-1 right-1.5 w-5 h-5 flex items-center justify-center text-text-muted hover:text-red-500 font-bold cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete note"
        >
          ×
        </button>
        <div className="font-bold text-[8px] uppercase tracking-wider opacity-60 mb-0.5 truncate">{note.title}</div>
        <div className="leading-tight break-words select-none">{note.content}</div>
      </div>
    );
  };

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

    if (activeTopic) {
      return { ...activeTopic, index: topicIndex };
    }
    return null;
  };

  const getStyleForReadingTheme = (): React.CSSProperties => {
    if (isEditMode) return {
      fontFamily: fontFamily === 'serif' ? 'Georgia, serif' : fontFamily === 'mono' ? '"JetBrains Mono", Consolas, monospace' : '"Inter", sans-serif',
      fontSize: `${fontSize}px`,
      transform: `scale(${zoomLevel / 100})`,
      transformOrigin: 'top left',
    };
    
    const baseSize = `${fontSize}px`;
    const scale = `scale(${zoomLevel / 100})`;
    switch (readingStyle) {
      case 'minimal':
        return {
          fontFamily: '"Inter", "DM Sans", sans-serif',
          color: '#1a1a2e',
          fontSize: baseSize,
          lineHeight: '1.85',
          letterSpacing: '0.01em',
          transform: scale,
          transformOrigin: 'top left',
        };
      case 'scholar':
        return {
          fontFamily: '"Crimson Pro", Georgia, serif',
          color: '#e8d5b7',
          fontSize: baseSize,
          lineHeight: '1.9',
          letterSpacing: '0.02em',
          transform: scale,
          transformOrigin: 'top left',
        };
      case 'sage':
        return {
          fontFamily: '"DM Serif Display", Georgia, serif',
          color: '#1e3a2f',
          fontSize: baseSize,
          lineHeight: '1.8',
          transform: scale,
          transformOrigin: 'top left',
        };
      case 'warm':
      default:
        return {
          fontFamily: '"Lora", Georgia, serif',
          color: '#2c1a0e',
          fontSize: baseSize,
          lineHeight: '1.85',
          transform: scale,
          transformOrigin: 'top left',
        };
    }
  };

  // Turn page action
  const handlePageTurn = (direction: 'next' | 'prev') => {
    const totalPages = book.pagesCount;
    let nextNum = book.currentPage + (direction === 'next' ? 2 : -2);
    if (nextNum < 1) nextNum = 1;
    if (nextNum > totalPages) nextNum = totalPages;

    // Ensure target pages exist in map
    const updatedPages = { ...book.pages };
    if (!updatedPages[nextNum]) {
      updatedPages[nextNum] = `Ruled page ${nextNum}. Click edit mode to start writing here...`;
    }
    if (!updatedPages[nextNum + 1] && nextNum + 1 <= totalPages) {
      updatedPages[nextNum + 1] = `Ruled page ${nextNum + 1}. Click edit mode to start writing here...`;
    }

    updateBook(book.id, {
      currentPage: nextNum,
      pages: updatedPages
    });
  };

  // Custom Modals Action Triggers & Submission Handlers
  const openAddTopicModal = () => {
    setModalTopicTitle('');
    setModalTopicPage(book.currentPage);
    setModalTopicId('');
    setActiveModal('add-topic');
  };

  const openEditTopicModal = (topic: BookTopic) => {
    setModalTopicTitle(topic.title);
    setModalTopicPage(topic.pageNumber);
    setModalTopicId(topic.id);
    setActiveModal('edit-topic');
  };

  const submitTopicForm = () => {
    if (!modalTopicTitle.trim()) {
      triggerToast('Please enter a topic title.');
      return;
    }
    if (modalTopicId) {
      const updatedTopics = book.topics.map((t) => {
        if (t.id === modalTopicId) {
          return { ...t, title: modalTopicTitle, pageNumber: modalTopicPage };
        }
        return t;
      });
      updateBook(book.id, { topics: updatedTopics });
    } else {
      const colors = ['blue', 'green', 'orange', 'pink', 'purple', 'teal'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newTopic: BookTopic = {
        id: `topic-${Date.now()}`,
        title: modalTopicTitle,
        pageNumber: modalTopicPage,
        color: randomColor
      };
      updateBook(book.id, { topics: [...book.topics, newTopic] });
    }
    setActiveModal(null);
  };

  const openAddStickyModal = (color: 'yellow' | 'pink' = 'yellow') => {
    setModalStickyTitle(color === 'yellow' ? 'Remember' : 'Idea');
    setModalStickyContent('');
    setModalStickyColor(color);
    setModalStickyId('');
    setModalStickyPosition('bottom-right');
    setModalStickyStyleTheme('default');
    setActiveModal('add-sticky');
  };

  const openEditStickyModal = (note: BookStickyNote) => {
    setModalStickyTitle(note.title);
    setModalStickyContent(note.content);
    setModalStickyColor(note.color === 'pink' ? 'pink' : 'yellow');
    setModalStickyId(note.id);
    setModalStickyPosition(note.position || 'bottom-right');
    setModalStickyStyleTheme(note.styleTheme || 'default');
    setActiveModal('edit-sticky');
  };

  const submitStickyForm = () => {
    if (!modalStickyContent.trim()) {
      triggerToast('Please enter sticky note content.');
      return;
    }
    if (modalStickyId) {
      const updatedNotes = book.stickyNotes.map((n) => {
        if (n.id === modalStickyId) {
          return {
            ...n,
            title: modalStickyTitle,
            content: modalStickyContent,
            color: modalStickyColor,
            position: modalStickyPosition,
            styleTheme: modalStickyStyleTheme
          };
        }
        return n;
      });
      updateBook(book.id, { stickyNotes: updatedNotes });
    } else {
      const targetPage = lastFocusedEditorRef.current === 'right' && book.currentPage + 1 <= book.pagesCount
        ? book.currentPage + 1
        : book.currentPage;
      const newNote: BookStickyNote = {
        id: `sticky-${Date.now()}`,
        title: modalStickyTitle || (modalStickyColor === 'yellow' ? 'Remember' : 'Idea'),
        content: modalStickyContent,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        color: modalStickyColor,
        pageNumber: targetPage,
        position: modalStickyPosition,
        styleTheme: modalStickyStyleTheme
      };
      updateBook(book.id, { stickyNotes: [...book.stickyNotes, newNote] });
    }
    setActiveModal(null);
  };

  const triggerDeleteConfirm = (type: 'topic' | 'sticky', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setActiveModal('delete-confirm');
  };

  const submitDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'book' as any) {
      deleteBook(book.id);
      onBack();
    } else if (deleteTarget.type === 'topic') {
      updateBook(book.id, {
        topics: book.topics.filter((t) => t.id !== deleteTarget.id)
      });
    } else {
      updateBook(book.id, {
        stickyNotes: book.stickyNotes.filter((n) => n.id !== deleteTarget.id)
      });
    }
    setDeleteTarget(null);
    setActiveModal(null);
  };

  // Bookmark page toggle
  const toggleBookmark = (pageNo: number) => {
    const list = book.bookmarks.includes(pageNo)
      ? book.bookmarks.filter((p) => p !== pageNo)
      : [...book.bookmarks, pageNo];
    updateBook(book.id, { bookmarks: list });
  };



  // AI assistant prompt
  const handleAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiOutput('Writing suggestion...');

    // Simulate AI response
    setTimeout(() => {
      let result = '';
      if (aiPrompt.toLowerCase().includes('summarize')) {
        result = `Summary of Page ${book.currentPage}:\nThis page details Santiago's journey and emphasizes the theme of seeking one's Personal Legend, detailing how the universe conspires to assist.`;
      } else if (aiPrompt.toLowerCase().includes('improve') || aiPrompt.toLowerCase().includes('write')) {
        result = `Here is an improved version of your page:\n"The Alchemist, Paulo Coelho's masterpiece, chronicles the spiritual journey of Santiago, a shepherd seeking treasure. Along his journey, he uncovers truths about destiny, connection, and the soul."`;
      } else {
        result = `AI Response:\n"To develop this topic, explore the conflict Santiago experiences between comfort (his sheep, Fatima) and his destiny (the pyramids)."`;
      }
      setAiOutput(result);
      setIsAiLoading(false);
    }, 1200);
  };

  const handleApplyAiText = () => {
    if (!aiOutput) return;
    handleTextChange(pageText + '\n\n' + aiOutput);
    setAiOutput('');
    setAiPrompt('');
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Clean formatting styles helper for Read Mode (renders HTML directly and matches search terms)
  const renderReadModeHTML = (textStr: string) => {
    if (!textStr) return <p className="italic text-text-muted">Blank page. Switch to Edit Mode to write.</p>;

    let html = textStr;
    if (searchInnerQuery && searchInnerQuery.trim()) {
      html = highlightMatches(html, searchInnerQuery);
    }

    return (
      <div
        className="break-words"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  };

  return (
    <div className="relative flex flex-col h-full gap-5 text-left">
      
      {/* ─── Top Header Bar ─── */}
      <div className="flex flex-col items-start justify-between gap-4 p-4 border bg-surface border-border rounded-xl sm:flex-row sm:items-center">
        
        {/* Left header group */}
        <div className="flex items-center gap-3.5 flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-2 transition-colors border rounded-full cursor-pointe hover:bg-surface-hover border-border/40 text-text-secondary hover:text-text-primary"
          >
            <IconArrowLeft size={16} />
          </button>

            <div
              className="flex-1 min-w-0 p-1 transition-colors rounded-lg cursor-pointer group hover:bg-surface-hover/30"
              onClick={openEditBookDetailsModal}
              title="Edit Notebook Configurations"
            >
              <h2 className="text-sm font-black text-text-primary flex items-center gap-1.5 truncate">
                {book.title}
                <IconPencil size={12} className="transition-opacity opacity-0 text-text-muted group-hover:opacity-100" />
              </h2>
              <p className="text-[10px] text-text-secondary truncate mt-0.5">{book.tagline}</p>
            </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {/* Saved Status Indicator */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary bg-surface-alt px-2.5 py-1.5 rounded-lg border border-border">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
          </div>

          {/* Style selector - only visible in Read Mode */}
          {!isEditMode && (
            <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary">
              <span className="font-bold select-none text-text-secondary">Theme:</span>
              <select
                value={readingStyle}
                onChange={(e) => setReadingStyle(e.target.value as any)}
                className="px-1 py-0 font-bold bg-transparent border-none cursor-pointer text-text-primary focus:outline-none"
              >
                <option value="warm" className="bg-surface text-text-primary">Warm Editorial</option>
                <option value="minimal" className="bg-surface text-text-primary">Minimalist Clean</option>
                <option value="scholar" className="bg-surface text-text-primary">Dark Scholar</option>
                <option value="sage" className="bg-surface text-text-primary">Cozy Sage</option>
              </select>
            </div>
          )}

          {/* Edit/Read Mode Toggler */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 border border-border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-[0.97] transition-transform duration-100 ${
              isEditMode
                ? 'bg-rose-500 border-rose-500 text-white hover:bg-rose-600'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary'
            }`}
          >
            {isEditMode ? <IconPencil size={14} /> : <IconBook size={14} />}
            {isEditMode ? 'Edit Mode' : 'Read Mode'}
          </button>

          {/* Options ... */}
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
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    // Build a clean print window with all book pages
                    const sortedTopics = [...book.topics].sort((a, b) => a.pageNumber - b.pageNumber);
                    const getTopicForPage = (pageNo: number) => {
                      let t: typeof sortedTopics[0] | null = null;
                      for (const topic of sortedTopics) {
                        if (topic.pageNumber <= pageNo) t = topic;
                        else break;
                      }
                      return t;
                    };
                    const pagesHTML = Array.from({ length: book.pagesCount }, (_, i) => i + 1)
                      .filter(p => book.pages[p])
                      .map(p => {
                        const topic = getTopicForPage(p);
                        return `
                          <div class="page">
                            ${topic ? `<div class="chapter-label">Chapter ${sortedTopics.indexOf(topic)+1}</div><h2 class="chapter-title">${topic.title}</h2><hr class="chapter-rule"/>` : ''}
                            <div class="page-num">Page ${p}</div>
                            <div class="page-content">${book.pages[p] || ''}</div>
                          </div>`;
                      }).join('');

                    // Compile sticky notes for a dedicated summary page at the end
                    const stickyNotesHTML = book.stickyNotes.length > 0
                      ? `
                        <div class="page sticky-notes-summary-page">
                          <h2 class="chapter-title" style="margin-top:0; border-bottom: 2px solid #c0956a; padding-bottom: 12px; margin-bottom: 30px; font-family: 'Inter', sans-serif;">📌 Sticky Notes & Insights Summary</h2>
                          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            ${book.stickyNotes.map((note) => {
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
                        <title>${book.title} — ${book.author}</title>
                        <link rel="preconnect" href="https://fonts.googleapis.com">
                        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                        <style>
                          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                          html, body { background: #fff; color: #1a1a1a; font-family: 'Lora', Georgia, serif; }
                          
                          /* Force background printing for highlighters and sticky cards */
                          * {
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                          }
                          
                          /* Cover page */
                          .cover { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 80px 60px; text-align: center; border-bottom: 3px solid #c0956a; page-break-after: always; }
                          .cover-title { font-size: 3rem; font-weight: 700; color: #1a0e05; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 20px; }
                          .cover-author { font-size: 1.15rem; color: #9b6e3d; font-style: italic; margin-bottom: 12px; }
                          .cover-tagline { font-size: 0.85rem; color: #7a6a58; max-width: 480px; line-height: 1.7; }
                          .cover-rule { width: 60px; height: 3px; background: #c0956a; border: none; margin: 28px auto; border-radius: 2px; }
                          /* Content pages */
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
                          /* header & footer on print */
                          @media print {
                            @page { size: A4; margin: 0; }
                            .cover, .page { padding: 60px 72px; }
                          }
                        </style>
                      </head>
                      <body>
                        <div class="cover">
                          <div class="cover-title">${book.title}</div>
                          <hr class="cover-rule"/>
                          <div class="cover-author">${book.author}</div>
                          <div class="cover-tagline">${book.tagline || ''}</div>
                        </div>
                        ${pagesHTML}
                        ${stickyNotesHTML}
                      </body></html>`);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => { printWindow.print(); }, 800);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-hover cursor-pointer"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => {
                    triggerToast('Notebook duplication simulated!');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-hover cursor-pointer"
                >
                  Duplicate Book
                </button>
              </div>
            )}
          </div>

          {/* Delete Book */}
          <button
            onClick={() => triggerDeleteConfirm('book' as any, book.id, book.title)}
            className="px-3 py-1.5 border border-red-200 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <IconTrash size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* ─── Editor Layout Spread ─── */}
      <div className="flex-1 flex gap-5 min-h-[480px]">
        
        {/* Left Toolbar Strip */}
        <div className="w-12 bg-surface border border-border rounded-2xl p-1.5 flex flex-col gap-2.5 items-center">
          {[
            { id: 'toc', icon: IconList, label: 'Table of Contents', toggle: () => setShowTopicsPanel(!showTopicsPanel) },
            { id: 'add-topic', icon: IconPlus, label: 'Add Topic', toggle: openAddTopicModal },
            { id: 'sticky', icon: IconFileText, label: 'Sticky Notes', toggle: () => setShowNotesPanel(!showNotesPanel) },
            { id: 'add-sticky', icon: IconPlus, label: 'Add Sticky Note', toggle: () => openAddStickyModal('yellow') },
            { id: 'highlighter', icon: IconHighlight, label: 'Apply Highlight', toggle: applyHighlight },
            { id: 'bookmarks', icon: IconBookmark, label: 'Bookmark Page', toggle: () => toggleBookmark(book.currentPage) },
            { id: 'search', icon: IconSearch, label: 'Search Content', toggle: () => setIsSearchBoxOpen(!isSearchBoxOpen) },
            { id: 'ai', icon: IconSparkles, label: 'AI Assistant', toggle: () => setActiveLeftTab('ai') },
            { id: 'settings', icon: IconSettings, label: 'Notebook Settings', toggle: () => setActiveLeftTab('settings') },
          ].map((item) => {
            const Icon = item.icon;
            const isTabActive = activeLeftTab === item.id;
            
            if (item.id === 'highlighter') {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => {
                    if (highlighterHoverTimerRef.current) {
                      clearTimeout(highlighterHoverTimerRef.current);
                    }
                    setIsHighlighterHovered(true);
                  }}
                  onMouseLeave={() => {
                    highlighterHoverTimerRef.current = setTimeout(() => {
                      setIsHighlighterHovered(false);
                    }, 300);
                  }}
                >
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyHighlight(activeHighlightColor)}
                    title={item.label}
                    className={`p-2 rounded-xl transition-all cursor-pointer active:scale-[0.97] transition-transform ${
                      isTabActive
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                  
                  {isHighlighterHovered && (
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-surface border border-border shadow-high rounded-xl px-2.5 py-2 z-[9999] whitespace-nowrap animate-fadeIn">
                      {[
                        { id: 'yellow', color: '#FEF08A', border: '#d4a017' },
                        { id: 'green', color: '#BBF7D0', border: '#22a05a' },
                        { id: 'blue', color: '#DBEAFE', border: '#3b82f6' },
                        { id: 'purple', color: '#F3E8FF', border: '#8b5cf6' },
                        { id: 'pink', color: '#FCE7F3', border: '#ec4899' },
                      ].map((col) => {
                        const isActive = activeHighlightColor === col.id;
                        return (
                          <div key={col.id} className="relative flex items-center justify-center">
                            <button
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setActiveHighlightColor(col.id);
                                applyHighlight(col.id);
                              }}
                              title={`${col.id}${isActive ? ' (active)' : ''}`}
                              className={`rounded-full cursor-pointer transition-all ${
                                isActive
                                  ? 'w-5 h-5 scale-110 shadow-md'
                                  : 'w-4 h-4 hover:scale-125'
                              }`}
                              style={{
                                backgroundColor: col.color,
                                border: isActive ? `2.5px solid ${col.border}` : '1.5px solid rgba(0,0,0,0.12)',
                                boxShadow: isActive ? `0 0 0 2px white, 0 0 0 3.5px ${col.border}` : undefined
                              }}
                            />
                            {isActive && (
                              <svg className="absolute pointer-events-none" width="9" height="9" viewBox="0 0 10 10">
                                <path d="M2 5l2.5 2.5L8 3" stroke={col.border} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                              </svg>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            if (item.id === 'search') {
              return (
                <div key={item.id} className="relative flex items-center">
                  <button
                    onClick={() => setIsSearchBoxOpen(!isSearchBoxOpen)}
                    title={item.label}
                    className={`p-2 rounded-xl transition-all cursor-pointer active:scale-[0.97] transition-transform ${
                      isSearchBoxOpen || searchInnerQuery
                        ? 'bg-rose-500/10 text-rose-500'
                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Icon size={18} />
                  </button>
                  
                  {isSearchBoxOpen && (
                    <div className="absolute left-12 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-surface border border-border shadow-high rounded-xl p-1.5 z-[9999] whitespace-nowrap animate-slideRight">
                      <input
                        type="text"
                        value={searchInnerQuery}
                        onChange={(e) => setSearchInnerQuery(e.target.value)}
                        placeholder="Search word..."
                        className="bg-transparent text-xs text-text-primary focus:outline-none w-32 px-1 py-0.5 border-none"
                        autoFocus
                      />
                      {searchInnerQuery && (
                        <button
                          onClick={() => setSearchInnerQuery('')}
                          className="text-[10px] text-text-muted hover:text-text-primary font-bold px-1 py-0.5 border-none bg-transparent cursor-pointer"
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            }

            const isAddSticky = item.id === 'add-sticky';
            const isAddTopic = item.id === 'add-topic';

            return (
              <button
                key={item.id}
                onMouseDown={(e) => {
                  if (item.id === 'bookmarks' || isAddTopic || isAddSticky) {
                    e.preventDefault();
                  }
                }}
                onClick={() => {
                  if (item.id === 'ai' || item.id === 'settings') {
                    setActiveLeftTab(item.id as any);
                  } else {
                    item.toggle();
                  }
                }}
                title={item.label}
                className={`p-2 rounded-xl transition-all cursor-pointer relative active:scale-[0.97] transition-transform ${
                  isTabActive
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={18} className={isAddSticky ? 'text-amber-500' : isAddTopic ? 'text-rose-500' : ''} />
                {isAddSticky && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full border border-surface" />}
                {isAddTopic && <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-surface" />}
              </button>
            );
          })}
        </div>

        {/* Centered Ruled Notebook Area */}
        <div className={`flex-1 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative transition-shadow duration-300 shadow-high ${
          isEditMode 
            ? 'bg-vellum border-l-[14px] border-l-amber-800 dark:border-l-zinc-900 border border-border' 
            : readingStyle === 'warm'
            ? 'bg-vellum border-l-[14px] border-l-amber-800 border border-[#D4C4A0]'
            : readingStyle === 'minimal'
            ? 'bg-white border border-slate-200'
            : readingStyle === 'scholar'
            ? 'bg-[#0f172a] border-l-[14px] border-l-zinc-900 border border-slate-800'
            : 'bg-vellum border-l-[14px] border-l-[#5c7a61] border border-[#B5CDB8]'
        }`}
        style={!isEditMode && readingStyle !== 'scholar' && readingStyle !== 'minimal' ? {
          background: readingStyle === 'warm'
            ? 'linear-gradient(135deg, #FDFBF4 0%, #F7F0DC 40%, #EDE4CC 100%)'
            : 'linear-gradient(135deg, #EDF4EE 0%, #D8EAD9 50%, #C6DBC8 100%)'
        } : undefined}>
          
          {/* Fold/Crease effect down the middle simulating binding shadows */}
          <div className="absolute top-0 bottom-0 w-6 -translate-x-1/2 pointer-events-none left-1/2 bg-gradient-to-r from-black/0 via-black/8 dark:via-black/35 to-black/0 z-20" />
          <div className="absolute top-0 bottom-0 w-[1px] -translate-x-1/2 pointer-events-none left-1/2 bg-black/10 dark:bg-white/5 z-20" />

          {/* Book Sheets Spread layout */}
          <div className="relative z-10 grid flex-1 grid-cols-1 gap-8 md:grid-cols-2">
            
            {/* Sheet 1: Left Page */}
            <div
              className={`flex flex-col relative ${isEditMode ? '' : 'px-4'}`}
              style={getStyleForReadingTheme()}
            >
              {/* Top Page bookmark badge */}
              {book.bookmarks.includes(book.currentPage) && (
                <div className="absolute top-0 left-2 w-5 h-8 bg-rose-500 text-white rounded-b-md flex items-center justify-center font-bold text-[10px]">
                  ★
                </div>
              )}

              {/* Topic Header Display */}
              {(() => {
                const activeTopic = getActiveTopicForPage(book.currentPage);
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
                // Read Mode — dramatic themed topic headers
                return activeTopic ? (
                  <div className={`mb-6 text-left pl-2 ${
                    readingStyle === 'warm'
                      ? 'border-l-4 border-[#C0956A] pl-5'
                      : readingStyle === 'scholar'
                      ? 'border-l-4 border-[#c9a84c] pl-5'
                      : readingStyle === 'minimal'
                      ? 'border-b-2 border-slate-200 pb-4 pl-0'
                      : 'border-l-4 border-[#6a9e74] pl-5'
                  }`}>
                    <div className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 ${
                      readingStyle === 'warm' ? 'text-[#9b6e3d]'
                      : readingStyle === 'scholar' ? 'text-[#c9a84c]'
                      : readingStyle === 'minimal' ? 'text-slate-400'
                      : 'text-[#5a8a63]'
                    }`}>
                      Chapter {activeTopic.index}
                    </div>
                    <h2 className={`font-black leading-tight ${
                      readingStyle === 'warm' ? 'text-[1.4rem] text-[#2c1a0e]'
                      : readingStyle === 'scholar' ? 'text-[1.35rem] text-[#f0e6d3]'
                      : readingStyle === 'minimal' ? 'text-[1.5rem] text-slate-900 tracking-tight'
                      : 'text-[1.35rem] text-[#1e3a2f]'
                    }`}>
                      {activeTopic.title}
                    </h2>
                    <div className={`mt-2 h-0.5 w-16 rounded-full ${
                      readingStyle === 'warm' ? 'bg-[#C0956A]/50'
                      : readingStyle === 'scholar' ? 'bg-[#c9a84c]/50'
                      : readingStyle === 'minimal' ? 'bg-slate-200'
                      : 'bg-[#6a9e74]/50'
                    }`} />
                  </div>
                ) : null;
              })()}

              {/* Ruled Notebook content */}
              <div className="relative flex flex-1 pl-6">
                
                {/* Vertical Ruled margin line */}
                {isEditMode && <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rose-500/40" />}

                {/* Line numbers margin */}
                {isEditMode && (
                  <div className="w-4 select-none font-mono text-[10px] text-text-muted/50 text-right pr-3 pt-1 space-y-3 leading-[24px]">
                    {Array.from({ length: 15 }).map((_, idx) => (
                      <div key={idx}>{idx + 1}</div>
                    ))}
                  </div>
                )}

                {/* Editable Ruled Text Sheet */}
                <div className="flex-1 pt-1 min-h-[300px] leading-[24px] text-left">
                  {isEditMode ? (
                    <div
                      ref={editorRefLeft}
                      contentEditable={true}
                      onInput={(e) => handleTextChange(e.currentTarget.innerHTML)}
                      onFocus={() => { lastFocusedEditorRef.current = 'left'; }}
                      onKeyDown={handleEditorKeyDown}
                      className="w-full h-full bg-transparent border-none focus:outline-none text-text-primary cursor-text notebook-content"
                      style={{
                        lineHeight: '24px',
                        backgroundImage: 'linear-gradient(var(--border-border) 1px, transparent 1px)',
                        backgroundSize: '100% 24px',
                        minHeight: '300px'
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

              {/* Floating Page Sticky Notes */}
              {book.stickyNotes
                .filter((n) => n.pageNumber === book.currentPage)
                .map((note, idx) => (
                  <div key={note.id} className={getStickyPositionClasses(note.position)}>
                    {renderStickyNoteCard(note, idx)}
                  </div>
                ))}

              {/* Page indicator bottom-left */}
              <div className="pt-3 mt-4 font-mono text-xs font-bold text-center border-t select-none border-border/40 text-text-muted">
                {book.currentPage}
              </div>
            </div>

            {/* Sheet 2: Right Page */}
            <div
              className={`hidden md:flex flex-col relative border-l border-border/20 pl-4 ${isEditMode ? '' : 'px-4'}`}
              style={getStyleForReadingTheme()}
            >
              {/* Bookmark */}
              {book.bookmarks.includes(book.currentPage + 1) && (
                <div className="absolute top-0 right-2 w-5 h-8 bg-rose-500 text-white rounded-b-md flex items-center justify-center font-bold text-[10px]">
                  ★
                </div>
              )}

              {/* Topic Header Display */}
              {(() => {
                const activeTopic = getActiveTopicForPage(book.currentPage + 1);
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
                // Read Mode — dramatic themed topic headers
                return activeTopic ? (
                  <div className={`mb-6 text-left pl-2 ${
                    readingStyle === 'warm'
                      ? 'border-l-4 border-[#C0956A] pl-5'
                      : readingStyle === 'scholar'
                      ? 'border-l-4 border-[#c9a84c] pl-5'
                      : readingStyle === 'minimal'
                      ? 'border-b-2 border-slate-200 pb-4 pl-0'
                      : 'border-l-4 border-[#6a9e74] pl-5'
                  }`}>
                    <div className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1.5 ${
                      readingStyle === 'warm' ? 'text-[#9b6e3d]'
                      : readingStyle === 'scholar' ? 'text-[#c9a84c]'
                      : readingStyle === 'minimal' ? 'text-slate-400'
                      : 'text-[#5a8a63]'
                    }`}>
                      Chapter {activeTopic.index}
                    </div>
                    <h2 className={`font-black leading-tight ${
                      readingStyle === 'warm' ? 'text-[1.4rem] text-[#2c1a0e]'
                      : readingStyle === 'scholar' ? 'text-[1.35rem] text-[#f0e6d3]'
                      : readingStyle === 'minimal' ? 'text-[1.5rem] text-slate-900 tracking-tight'
                      : 'text-[1.35rem] text-[#1e3a2f]'
                    }`}>
                      {activeTopic.title}
                    </h2>
                    <div className={`mt-2 h-0.5 w-16 rounded-full ${
                      readingStyle === 'warm' ? 'bg-[#C0956A]/50'
                      : readingStyle === 'scholar' ? 'bg-[#c9a84c]/50'
                      : readingStyle === 'minimal' ? 'bg-slate-200'
                      : 'bg-[#6a9e74]/50'
                    }`} />
                  </div>
                ) : null;
              })()}

              {/* Renders content of page (currentPage + 1) */}
              <div className="relative flex-1 pl-4">
                {isEditMode && <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-rose-500/20" />}
                
                <div className="pt-1 min-h-[300px] leading-[24px] text-left text-text-primary">
                  {isEditMode ? (
                    <div
                      ref={editorRefRight}
                      contentEditable={true}
                      onInput={(e) => {
                        const rightContent = e.currentTarget.innerHTML;
                        const updatedPages = { ...book.pages, [book.currentPage + 1]: rightContent };
                        updateBook(book.id, { pages: updatedPages });
                      }}
                      onFocus={() => { lastFocusedEditorRef.current = 'right'; }}
                      onKeyDown={handleEditorKeyDown}
                      className="w-full h-full bg-transparent border-none focus:outline-none text-text-primary cursor-text notebook-content"
                      style={{
                        lineHeight: '24px',
                        backgroundImage: 'linear-gradient(var(--border-border) 1px, transparent 1px)',
                        backgroundSize: '100% 24px',
                        minHeight: '300px'
                      }}
                    />
                  ) : (
                    <div
                      className={`w-full h-full leading-relaxed prose prose-sm max-w-none notebook-content read-theme-${readingStyle}`}
                      style={{ lineHeight: '1.85' }}
                    >
                      {renderReadModeHTML(book.pages[book.currentPage + 1] || '')}
                    </div>
                  )}
                </div>
              </div>

              {/* Floating Page Sticky Notes */}
              {book.stickyNotes
                .filter((n) => n.pageNumber === book.currentPage + 1)
                .map((note, idx) => (
                  <div key={note.id} className={getStickyPositionClasses(note.position)}>
                    {renderStickyNoteCard(note, idx)}
                  </div>
                ))}

              {/* Page indicator bottom-right */}
              <div className="pt-3 mt-4 font-mono text-xs font-bold text-center border-t select-none border-border/40 text-text-muted">
                {book.currentPage + 1}
              </div>
            </div>

          </div>

          {/* Navigation Page Turn Arrows */}
          <div className="absolute text-center z-30 flex justify-between pointer-events-none inset-y-1/2 -left-6 -right-6">
            <button
              onClick={() => handlePageTurn('prev')}
              disabled={book.currentPage <= 1}
              className={` p-4 bg-surface hover:bg-surface-hover border border-border shadow-high rounded-full text-text-primary hover:text-rose-500 hover:scale-110 pointer-events-auto cursor-pointer transition-all active:scale-[0.9] transition-transform duration-100 ${
                book.currentPage <= 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <IconChevronLeft size={20} />
            </button>
            <button
              onClick={() => handlePageTurn('next')}
              disabled={book.currentPage >= book.pagesCount - 1}
              className={`p-4 bg-surface hover:bg-surface-hover border border-border shadow-high rounded-full text-text-primary hover:text-rose-500 hover:scale-110 pointer-events-auto cursor-pointer transition-all active:scale-[0.9] transition-transform duration-100 ${
                book.currentPage >= book.pagesCount - 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <IconChevronRight size={20} />
            </button>
          </div>

        </div>

        {/* Right Sidebar: Topics & Notes Panels */}
        {(showTopicsPanel || showNotesPanel) && (
          <div className="flex flex-col w-64 gap-4">
            
            {/* 1. Topics Panel */}
            {showTopicsPanel && (
              <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden border bg-surface border-border rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-xs font-black text-text-primary">Topics</span>
                  <button
                    onClick={openAddTopicModal}
                    className="p-1 hover:bg-surface-hover rounded text-rose-500 cursor-pointer flex items-center gap-1 font-bold text-[10px] border-none active:scale-[0.97] transition-transform duration-100"
                  >
                    <IconPlus size={12} /> Add Topic
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-semibold">
                  {book.topics.length === 0 ? (
                    <div className="py-6 italic text-center text-text-muted">No topics. Add chapters.</div>
                  ) : (
                    book.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => {
                          const pageTarget = topic.pageNumber % 2 === 0 ? topic.pageNumber - 1 : topic.pageNumber;
                          updateBook(book.id, { currentPage: pageTarget });
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-surface-hover/60 transition-colors ${
                          book.currentPage === topic.pageNumber || book.currentPage + 1 === topic.pageNumber
                            ? 'bg-rose-500/10 text-rose-500 font-bold'
                            : 'text-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-2 h-2 rounded-full`}
                            style={{
                              backgroundColor:
                                topic.color === 'blue'
                                  ? '#3B82F6'
                                  : topic.color === 'green'
                                  ? '#10B981'
                                  : topic.color === 'orange'
                                  ? '#F59E0B'
                                  : topic.color === 'pink'
                                  ? '#EC4899'
                                  : topic.color === 'purple'
                                  ? '#8B5CF6'
                                  : '#06B6D4'
                            }}
                          />
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-text-muted font-mono mr-1">p. {topic.pageNumber}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTopicModal(topic);
                            }}
                            className="text-text-muted hover:text-rose-500 font-bold px-1 py-0.5 cursor-pointer text-[10px]"
                            title="Edit Topic"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDeleteConfirm('topic', topic.id, topic.title);
                            }}
                            className="text-text-muted hover:text-red-500 font-bold px-1 py-0.5 cursor-pointer text-[10px]"
                            title="Delete Topic"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 2. Notes Panel (Sticky notes) */}
            {showNotesPanel && (
              <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden border bg-surface border-border rounded-2xl">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-xs font-black text-text-primary">Notes</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openAddStickyModal('yellow')}
                      className="px-2 py-0.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded font-bold text-[9px] cursor-pointer"
                    >
                      + Yellow
                    </button>
                    <button
                      onClick={() => openAddStickyModal('pink')}
                      className="px-2 py-0.5 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded font-bold text-[9px] cursor-pointer"
                    >
                      + Pink
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto">
                  {book.stickyNotes.length === 0 ? (
                    <div className="py-6 text-xs italic text-center text-text-muted">No sticky notes.</div>
                  ) : (
                    book.stickyNotes.map((note) => (
                      <div
                        key={note.id}
                        onClick={() => openEditStickyModal(note)}
                        className={`p-3 rounded-2xl border text-xs text-left relative group cursor-pointer hover:scale-[1.02] transition-transform ${
                          note.color === 'pink'
                            ? 'bg-pink-100/50 border-pink-200 text-pink-900'
                            : 'bg-yellow-100/50 border-yellow-200 text-yellow-900'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{note.title}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerDeleteConfirm('sticky', note.id, note.title || 'Sticky Note');
                            }}
                            className="transition-opacity opacity-0 cursor-pointer text-text-muted hover:text-red-500 group-hover:opacity-100"
                          >
                            ×
                          </button>
                        </div>
                        <div className="mt-1 leading-relaxed">{note.content}</div>
                        <div className="text-[8px] text-text-muted mt-2">{note.date}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* ─── Bottom Formatting Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 border bg-surface border-border rounded-2xl">
        
        {/* Zoom & Font selection */}
        <div className="flex items-center gap-3">
          
          {/* Zoom */}
          <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1 rounded-lg cursor-pointer hover:bg-surface"
            >
              -
            </button>
            <span className="px-2 font-mono font-bold text-[10px]">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              className="p-1 rounded-lg cursor-pointer hover:bg-surface"
            >
              +
            </button>
          </div>

          {/* Font Type */}
          <div className="relative">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="bg-surface-alt border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary cursor-pointer focus:outline-none"
            >
              <option value="sans">Aa Sans</option>
              <option value="serif">Aa Serif</option>
              <option value="mono">Aa Mono</option>
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5 text-xs">
            <button
              onClick={() => setFontSize(Math.max(10, fontSize - 1))}
              className="px-1.5 py-0.5 hover:bg-surface rounded cursor-pointer"
            >
              -
            </button>
            <span className="px-1.5 font-bold text-[10px]">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
              className="px-1.5 py-0.5 hover:bg-surface rounded cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Text styling controls */}
        <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl p-1">
          <button
            onClick={() => executeFormatting('bold')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Bold"
          >
            <IconBold size={14} />
          </button>
          <button
            onClick={() => executeFormatting('italic')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Italic"
          >
            <IconItalic size={14} />
          </button>
          <button
            onClick={() => executeFormatting('underline')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Underline"
          >
            <IconUnderline size={14} />
          </button>
          <button
            onClick={() => executeFormatting('strikeThrough')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Strikethrough"
          >
            <IconStrikethrough size={14} />
          </button>
          <span className="w-px h-4 mx-1 bg-border/60" />
          <button
            onClick={() => executeFormatting('insertUnorderedList')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Bullet List"
          >
            <IconList size={14} />
          </button>
          <button
            onClick={() => executeFormatting('insertOrderedList')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Numbered List"
          >
            <IconListNumbers size={14} />
          </button>
          <span className="w-px h-4 mx-1 bg-border/60" />
          <button
            onClick={() => executeFormatting('justifyLeft')}
            className="p-1.5 hover:bg-surface rounded-lg text-text-secondary cursor-pointer"
            title="Align Left"
          >
            <IconAlignLeft size={14} />
          </button>
        </div>

        {/* Highlighter & colors */}
        <div className="flex items-center gap-2">
          
          {/* Colors — simple active ring only */}
          <div className="flex items-center gap-1.5 bg-surface-alt border border-border rounded-xl p-1.5">
            {[
              { id: 'yellow', color: '#F59E0B' },
              { id: 'green', color: '#10B981' },
              { id: 'blue', color: '#3B82F6' },
              { id: 'purple', color: '#8B5CF6' },
              { id: 'pink', color: '#EC4899' },
            ].map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  setActiveHighlightColor(col.id);
                  if (isEditMode) applyHighlight(col.id);
                }}
                title={`${col.id}${activeHighlightColor === col.id ? ' (active)' : ''}`}
                className={`rounded-full cursor-pointer transition-all duration-150 ${
                  activeHighlightColor === col.id
                    ? 'w-4 h-4 ring-2 ring-offset-1 ring-rose-500'
                    : 'w-3.5 h-3.5 hover:scale-110 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.color }}
              />
            ))}
          </div>

          {/* Add actions */}
          <button
            onClick={() => openAddStickyModal('yellow')}
            className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
          >
            <IconFileText size={16} />
          </button>
          <button
            onClick={() => toggleBookmark(book.currentPage)}
            className={`p-2 border rounded-xl cursor-pointer transition-colors ${
              book.bookmarks.includes(book.currentPage)
                ? 'bg-rose-500/10 text-rose-500 border-rose-200'
                : 'hover:bg-surface-hover text-text-secondary border-border'
            }`}
          >
            <IconBookmark size={16} />
          </button>
          <button
            onClick={() => {
              triggerToast('Image insertion is coming soon in updates!');
            }}
            className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
          >
            <IconPhoto size={16} />
          </button>
        </div>

        {/* Fullscreen & Screen modes */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              const newLimit = book.pagesCount + 5;
              updateBook(book.id, { pagesCount: newLimit });
              triggerToast(`Added 5 more pages! New limit is ${newLimit} pages.`);
            }}
            className="px-3.5 py-1.5 bg-rose-50/80 hover:bg-rose-100/80 text-rose-600 border border-rose-200 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100"
            title="Add 5 more pages to this notebook"
          >
            + Add 5 Pages
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 transition-colors border cursor-pointer hover:bg-surface-hover border-border rounded-xl text-text-secondary"
          >
            <IconMaximize size={16} />
          </button>
        </div>

      </div>

      {/* AI Assistant tab view overlay */}
      {activeLeftTab === 'ai' && (
        <div className="fixed bottom-24 left-10 w-80 bg-surface border border-border rounded-2xl shadow-high z-50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="text-xs font-black text-text-primary flex items-center gap-1.5">
              <IconSparkles size={14} className="text-rose-500" /> AI Notebook Assistant
            </span>
            <button onClick={() => setActiveLeftTab('toc')} className="text-xs cursor-pointer text-text-muted hover:text-text-primary">
              Close
            </button>
          </div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask AI to 'summarize' or 'improve structure' of this page..."
            className="w-full h-16 p-2 text-xs border resize-none bg-surface-alt border-border rounded-xl focus:outline-none focus:border-rose-500 text-text-primary"
          />
          <button
            onClick={handleAiPrompt}
            disabled={isAiLoading || !aiPrompt.trim()}
            className="flex items-center justify-center w-full gap-1 py-2 text-xs font-bold text-white transition-colors bg-rose-500 cursor-pointer hover:bg-rose-600 rounded-xl active:scale-[0.97] transition-transform duration-100"
          >
            {isAiLoading ? 'AI is thinking...' : 'Generate Suggestion'}
          </button>

          {aiOutput && (
            <div className="p-3 mt-1 space-y-2 border border-border bg-surface-alt rounded-xl">
              <div className="text-[10px] text-text-secondary leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap font-mono">
                {aiOutput}
              </div>
              <button
                onClick={handleApplyAiText}
                className="w-full py-1 bg-rose-50 hover:bg-rose-100 text-rose-500 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer active:scale-[0.97] transition-transform duration-100"
              >
                Apply to Page
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab Overlay */}
      {activeLeftTab === 'settings' && (
        <div className="fixed bottom-24 left-10 w-72 bg-surface border border-border rounded-2xl shadow-high z-50 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <span className="text-xs font-black text-text-primary flex items-center gap-1.5">
              <IconSettings size={14} className="text-rose-500" /> Notebook Configurations
            </span>
            <button onClick={() => setActiveLeftTab('toc')} className="text-xs cursor-pointer text-text-muted hover:text-text-primary">
              Close
            </button>
          </div>
          
          <div className="space-y-3.5 text-xs text-text-primary">
            <div className="flex items-center justify-between">
              <span>Total Pages Limit</span>
              <span className="font-mono bg-surface-alt border border-border rounded px-2 py-0.5 font-bold">
                {book.pagesCount} pages
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Created At</span>
              <span className="font-bold text-text-secondary">
                {new Date(book.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1">
              <span>Adjust Page Count</span>
              <div className="flex items-center bg-surface-alt border border-border rounded-xl p-0.5">
                <button
                  onClick={() => updateBook(book.id, { pagesCount: Math.max(5, book.pagesCount - 5) })}
                  className="px-2.5 py-1 hover:bg-surface rounded-lg cursor-pointer font-bold text-xs"
                  title="Remove 5 pages"
                >
                  -5
                </button>
                <span className="px-2 font-mono font-bold text-[10px]">{book.pagesCount}</span>
                <button
                  onClick={() => updateBook(book.id, { pagesCount: book.pagesCount + 5 })}
                  className="px-2.5 py-1 hover:bg-surface rounded-lg cursor-pointer font-bold text-xs"
                  title="Add 5 pages"
                >
                  +5
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modals Overlay */}
      {activeModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-9999 bg-black/50 backdrop-blur-[3px] animate-fadeIn">
          <div className="bg-surface border border-border w-full max-w-[30%] rounded-2xl shadow-2xl flex flex-col text-left overflow-hidden" style={{ maxHeight: '85vh' }}>
            
            {/* Modal 1 & 2: Topic Modals */}
            {(activeModal === 'add-topic' || activeModal === 'edit-topic') && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
                  <div>
                    <h3 className="text-base font-black text-text-primary">
                      {activeModal === 'add-topic' ? '✦ Create New Topic' : '✎ Edit Topic Details'}
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Define a navigable section or chapter in your book</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-5 py-6 overflow-y-auto px-7">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Topic Title</label>
                    <input
                      type="text"
                      value={modalTopicTitle}
                      onChange={(e) => setModalTopicTitle(e.target.value)}
                      placeholder="e.g. Chapter 1: The Beginning"
                      className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Starting Page Number</label>
                    <select
                      value={modalTopicPage}
                      onChange={(e) => setModalTopicPage(Number(e.target.value))}
                      className="px-4 py-3 text-sm transition-all border cursor-pointer bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500"
                    >
                      {Array.from({ length: book.pagesCount }).map((_, idx) => (
                        <option key={idx + 1} value={idx + 1}>
                          Page {idx + 1}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-text-muted">Topic will begin from the selected page onward</p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 py-5 border-t px-7 border-border/60">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitTopicForm}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shadow-md"
                  >
                    {activeModal === 'add-topic' ? 'Create Topic' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* Modal 3 & 4: Sticky Note Modals */}
            {(activeModal === 'add-sticky' || activeModal === 'edit-sticky') && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
                  <div>
                    <h3 className="text-base font-black text-text-primary">
                      {activeModal === 'add-sticky' ? '📌 Add Sticky Note' : '✎ Edit Sticky Note'}
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Attach a memorable note to this page</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-5 py-6 overflow-y-auto px-7">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Note Title / Header</label>
                    <input
                      type="text"
                      value={modalStickyTitle}
                      onChange={(e) => setModalStickyTitle(e.target.value)}
                      placeholder="e.g. Remember, Key Insight, Important!"
                      className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      autoFocus
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Note Content</label>
                    <textarea
                      value={modalStickyContent}
                      onChange={(e) => setModalStickyContent(e.target.value)}
                      placeholder="Write your note, insight, or reminder here..."
                      rows={4}
                      className="px-4 py-3 text-sm transition-all border resize-none bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Page Position</label>
                      <select
                        value={modalStickyPosition}
                        onChange={(e) => setModalStickyPosition(e.target.value as any)}
                        className="px-4 py-3 text-sm transition-all border cursor-pointer bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500"
                      >
                        <option value="top-right">Top Right</option>
                        <option value="middle-left">Middle Left</option>
                        <option value="bottom-right">Bottom Right</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Visual Style Theme</label>
                      <select
                        value={modalStickyStyleTheme}
                        onChange={(e) => setModalStickyStyleTheme(e.target.value as any)}
                        className="px-4 py-3 text-sm transition-all border cursor-pointer bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500"
                      >
                        <option value="default">Classic Joyful Tape</option>
                        <option value="hand-drawn">Playful Hand-Drawn</option>
                        <option value="terminal">macOS Developer Terminal</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Color Tint</label>
                    <div className="flex gap-3">
                      {[
                        { id: 'yellow', label: 'Yellow Tint', color: '#FEF9C3', border: '#EAB308', textColor: '#713f12' },
                        { id: 'pink', label: 'Pink Tint', color: '#FCE7F3', border: '#DB2777', textColor: '#701a75' },
                      ].map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setModalStickyColor(col.id as any)}
                          className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100 ${
                            modalStickyColor === col.id
                              ? 'ring-2 ring-rose-500 ring-offset-2 scale-[1.02] shadow-md'
                              : 'opacity-60 hover:opacity-90 hover:scale-[1.01]'
                          }`}
                          style={{ backgroundColor: col.color, borderColor: modalStickyColor === col.id ? '#f43f5e' : col.border, color: col.textColor }}
                        >
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-black/20 shadow-sm" style={{ backgroundColor: col.border }} />
                          <span>{col.label}</span>
                          {modalStickyColor === col.id && <span className="ml-auto text-rose-500 font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 py-5 border-t px-7 border-border/60">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitStickyForm}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shadow-md"
                  >
                    {activeModal === 'add-sticky' ? 'Add Note' : 'Save Changes'}
                  </button>
                </div>
              </>
            )}

            {/* Modal 5: Custom Delete Confirmation Modal */}
            {activeModal === 'delete-confirm' && deleteTarget && (
              <>
                {/* Delete Modal Header */}
                <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                      <IconTrash size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-text-primary">Confirm Deletion</h3>
                      <p className="text-[11px] text-text-secondary">This action cannot be undone</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDeleteTarget(null); setActiveModal(null); }}
                    className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
                  >
                    ✕
                  </button>
                </div>

                {/* Delete Modal Body */}
                <div className="flex flex-col items-center gap-4 py-8 text-center px-7">
                  <div className="flex items-center justify-center w-16 h-16 border-2 border-red-100 rounded-full bg-red-50 dark:bg-red-950/30 dark:border-red-900/50">
                    <IconTrash size={28} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm leading-relaxed text-text-secondary">
                      Are you sure you want to delete this {deleteTarget.type === 'topic' ? 'topic' : 'sticky note'}?
                    </p>
                    <p className="inline-block px-4 py-2 mt-2 text-sm font-black border text-text-primary bg-surface-alt border-border rounded-xl">
                      "{deleteTarget.name}"
                    </p>
                  </div>
                </div>

                {/* Delete Modal Footer */}
                <div className="flex gap-3 py-5 border-t px-7 border-border/60">
                  <button
                    onClick={() => { setDeleteTarget(null); setActiveModal(null); }}
                    className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors"
                  >
                    Keep It
                  </button>
                  <button
                    onClick={submitDelete}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors shadow-md"
                  >
                    Yes, Delete
                  </button>
                </div>
              </>
            )}

            {/* Modal 6: Edit Book Details Modal */}
            {activeModal === 'edit-book-details' && (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
                  <div>
                    <h3 className="text-base font-black text-text-primary">⚙ Configure Notebook Settings</h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">Customize title, subtitle, author, and cover art</p>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex flex-col gap-5 py-6 overflow-y-auto px-7 max-h-[50vh] scrollbar-thin">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Notebook Title</label>
                      <input
                        type="text"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        placeholder="Notebook Title"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Author Name</label>
                      <input
                        type="text"
                        value={bookAuthorInput}
                        onChange={(e) => setBookAuthorInput(e.target.value)}
                        className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        placeholder="Author Name"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={taglineInput}
                      onChange={(e) => setTaglineInput(e.target.value)}
                      className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      placeholder="Notebook Subtitle/Tagline"
                    />
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Cover Design</label>
                      <label className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform flex items-center gap-1">
                        <IconPlus size={10} /> Change Custom Cover (3:4 ratio - JPG, PNG)
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = () => {
                                if (typeof reader.result === 'string') {
                                  setBookCoverInput(reader.result);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {PRESET_COVERS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setBookCoverInput(preset.id)}
                          className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer active:scale-[0.97] ${
                            bookCoverInput === preset.id
                              ? 'border-rose-500 scale-[1.03] shadow-md shadow-rose-500/10'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <BookCover presetId={preset.id} title={titleInput || 'Untitled'} showDetails={false} />
                        </button>
                      ))}

                      {bookCoverInput.startsWith('data:image/') && (
                        <button
                          type="button"
                          className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-rose-500 scale-[1.03] shadow-md p-0.5 cursor-default"
                        >
                          <BookCover presetId={bookCoverInput} title={titleInput || 'Untitled'} showDetails={false} />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[8px] font-bold text-white uppercase">
                            Custom
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 py-5 border-t px-7 border-border/60">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveBookDetails}
                    className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

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
