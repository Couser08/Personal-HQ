import { useState } from 'react';
import type { Book, BookTopic, BookStickyNote } from '../../../store/types';

interface UseNotebookModalsAndActionsOptions {
  book: Book;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
  onBack: () => void;
  pageText: string;
  handleTextChange: (newVal: string) => void;
}

export function useNotebookModalsAndActions({
  book,
  updateBook,
  deleteBook,
  showConfirm,
  onBack,
  pageText,
  handleTextChange,
}: UseNotebookModalsAndActionsOptions) {
  // Modal states
  const [activeModal, setActiveModal] = useState<
    | 'add-topic'
    | 'edit-topic'
    | 'add-sticky'
    | 'edit-sticky'
    | 'delete-confirm'
    | 'edit-book-details'
    | null
  >(null);

  const [titleInput, setTitleInput] = useState(book?.title ?? '');
  const [taglineInput, setTaglineInput] = useState(book?.tagline ?? '');
  const [bookCoverInput, setBookCoverInput] = useState(book?.coverImage ?? '');
  const [bookAuthorInput, setBookAuthorInput] = useState(book?.author ?? '');

  const [modalTopicTitle, setModalTopicTitle] = useState('');
  const [modalTopicPage, setModalTopicPage] = useState(1);
  const [modalTopicId, setModalTopicId] = useState('');

  const [modalStickyTitle, setModalStickyTitle] = useState('');
  const [modalStickyContent, setModalStickyContent] = useState('');
  const [modalStickyColor, setModalStickyColor] = useState<'yellow' | 'pink'>('yellow');
  const [modalStickyId, setModalStickyId] = useState('');
  const [modalStickyPosition, setModalStickyPosition] = useState<
    'middle-left' | 'bottom-right' | 'top-right'
  >('bottom-right');
  const [modalStickyStyleTheme, setModalStickyStyleTheme] = useState<
    'hand-drawn' | 'terminal' | 'default'
  >('default');

  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'topic' | 'sticky';
    id: string;
    name: string;
  } | null>(null);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiOutput, setAiOutput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const saveBookDetails = () => {
    updateBook(book.id, {
      title: titleInput || 'Untitled Notebook',
      tagline: taglineInput,
      coverImage: bookCoverInput,
      author: bookAuthorInput || 'Unknown Author',
    });
    setActiveModal(null);
  };

  const openEditBookDetailsModal = () => {
    setTitleInput(book.title || '');
    setTaglineInput(book.tagline || '');
    setBookAuthorInput(book.author || '');
    setBookCoverInput(book.coverImage || '');
    setActiveModal('edit-book-details');
  };

  const openAddTopicModal = () => {
    setModalTopicTitle('');
    setModalTopicPage(book.currentPage || 1);
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
    if (!modalTopicTitle.trim()) return;
    const currentTopics = (book.topics || []) as BookTopic[];
    if (modalTopicId) {
      const updatedTopics = currentTopics.map((t) =>
        t.id === modalTopicId
          ? { ...t, title: modalTopicTitle.trim(), pageNumber: modalTopicPage }
          : t,
      );
      updateBook(book.id, { topics: updatedTopics });
    } else {
      const newTopic: BookTopic = {
        id: crypto.randomUUID(),
        title: modalTopicTitle.trim(),
        pageNumber: modalTopicPage,
        readingState: 'unread',
        createdAt: new Date().toISOString(),
      };
      updateBook(book.id, { topics: [...currentTopics, newTopic] });
    }
    setActiveModal(null);
  };

  const openAddStickyModal = (color: 'yellow' | 'pink' = 'yellow') => {
    setModalStickyTitle('');
    setModalStickyContent('');
    setModalStickyColor(color);
    setModalStickyId('');
    setModalStickyPosition('bottom-right');
    setModalStickyStyleTheme('default');
    setActiveModal('add-sticky');
  };

  const openEditStickyModal = (sticky: BookStickyNote) => {
    setModalStickyTitle(sticky.title || '');
    setModalStickyContent(sticky.content || '');
    setModalStickyColor(sticky.color === 'pink' ? 'pink' : 'yellow');
    setModalStickyId(sticky.id || '');
    setModalStickyPosition((sticky.position as any) || 'bottom-right');
    setModalStickyStyleTheme((sticky.styleTheme as any) || 'default');
    setActiveModal('edit-sticky');
  };

  const submitStickyForm = () => {
    if (!modalStickyTitle.trim()) return;
    const currentNotes = (book.stickyNotes || []) as BookStickyNote[];
    if (modalStickyId) {
      const updatedNotes = currentNotes.map((n) =>
        n.id === modalStickyId
          ? {
              ...n,
              title: modalStickyTitle.trim(),
              content: modalStickyContent.trim(),
              color: modalStickyColor,
              position: modalStickyPosition,
              styleTheme: modalStickyStyleTheme,
            }
          : n,
      );
      updateBook(book.id, { stickyNotes: updatedNotes });
    } else {
      const newNote: BookStickyNote = {
        id: crypto.randomUUID(),
        title: modalStickyTitle.trim(),
        content: modalStickyContent.trim(),
        color: modalStickyColor,
        pageNumber: book.currentPage || 1,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        position: modalStickyPosition,
        styleTheme: modalStickyStyleTheme,
      };
      updateBook(book.id, { stickyNotes: [...currentNotes, newNote] });
    }
    setActiveModal(null);
  };

  const triggerDeleteConfirm = (type: 'topic' | 'sticky' | 'book', id: string, name: string) => {
    if (type === 'book') {
      showConfirm('Delete Notebook', `Are you sure you want to delete "${name}"?`, () => {
        deleteBook(id);
        onBack();
      });
    } else if (type === 'topic') {
      showConfirm('Delete Chapter/Topic', `Are you sure you want to delete "${name}"?`, () => {
        if (book) {
          const currentTopics = (book.topics || []) as BookTopic[];
          updateBook(book.id, { topics: currentTopics.filter((t) => t.id !== id) });
        }
      });
    } else if (type === 'sticky') {
      showConfirm('Delete Sticky Note', `Are you sure you want to delete this sticky note?`, () => {
        if (book) {
          const currentNotes = (book.stickyNotes || []) as BookStickyNote[];
          updateBook(book.id, { stickyNotes: currentNotes.filter((n) => n.id !== id) });
        }
      });
    }
  };

  const submitDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === ('book' as any)) {
      deleteBook(book.id);
      onBack();
    } else if (deleteTarget.type === 'topic') {
      const currentTopics = (book.topics || []) as BookTopic[];
      updateBook(book.id, {
        topics: currentTopics.filter((t) => t.id !== deleteTarget.id),
      });
    } else {
      const currentNotes = (book.stickyNotes || []) as BookStickyNote[];
      updateBook(book.id, {
        stickyNotes: currentNotes.filter((n) => n.id !== deleteTarget.id),
      });
    }
    setDeleteTarget(null);
    setActiveModal(null);
  };

  const toggleBookmark = (pageNo: number) => {
    const currentBookmarks = (book.bookmarks || []) as number[];
    const list = currentBookmarks.includes(pageNo)
      ? currentBookmarks.filter((p) => p !== pageNo)
      : [...currentBookmarks, pageNo];
    updateBook(book.id, { bookmarks: list });
  };

  const handleAiPrompt = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiOutput('Writing suggestion...');

    setTimeout(() => {
      let result = '';
      if (aiPrompt.toLowerCase().includes('summarize')) {
        result = `Summary of Page ${book.currentPage || 1}:\nThis page details key concepts, reflecting the core theme and detailing relevant takeaways.`;
      } else if (
        aiPrompt.toLowerCase().includes('improve') ||
        aiPrompt.toLowerCase().includes('write')
      ) {
        result = `Here is an improved version of your page:\n"The chapter chronicles foundational principles, structured thinking, and disciplined study."`;
      } else {
        result = `AI Response:\n"To develop this topic, explore the connections between underlying architecture and runtime execution."`;
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

  return {
    activeModal,
    setActiveModal,
    titleInput,
    setTitleInput,
    taglineInput,
    setTaglineInput,
    bookCoverInput,
    setBookCoverInput,
    bookAuthorInput,
    setBookAuthorInput,
    modalTopicTitle,
    setModalTopicTitle,
    modalTopicPage,
    setModalTopicPage,
    modalStickyTitle,
    setModalStickyTitle,
    modalStickyContent,
    setModalStickyContent,
    modalStickyColor,
    setModalStickyColor,
    modalStickyPosition,
    setModalStickyPosition,
    modalStickyStyleTheme,
    setModalStickyStyleTheme,
    deleteTarget,
    setDeleteTarget,
    aiPrompt,
    setAiPrompt,
    aiOutput,
    isAiLoading,
    saveBookDetails,
    openEditBookDetailsModal,
    openAddTopicModal,
    openEditTopicModal,
    submitTopicForm,
    openAddStickyModal,
    openEditStickyModal,
    submitStickyForm,
    triggerDeleteConfirm,
    submitDelete,
    toggleBookmark,
    handleAiPrompt,
    handleApplyAiText,
  };
}
