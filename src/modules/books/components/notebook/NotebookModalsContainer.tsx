import React from 'react';
import { TopicModal } from './TopicModal';
import { StickyNoteModal } from './StickyNoteModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { BookDetailsModal } from './BookDetailsModal';

interface NotebookModalsContainerProps {
  activeModal:
    | 'add-topic'
    | 'edit-topic'
    | 'add-sticky'
    | 'edit-sticky'
    | 'delete-confirm'
    | 'edit-book-details'
    | null;
  setActiveModal: (modal: any) => void;
  modalTopicTitle: string;
  setModalTopicTitle: (v: string) => void;
  modalTopicPage: number;
  setTopicPage: (v: number) => void;
  pagesCount: number;
  submitTopicForm: () => void;
  modalStickyTitle: string;
  setModalStickyTitle: (v: string) => void;
  modalStickyContent: string;
  setModalStickyContent: (v: string) => void;
  modalStickyPosition: 'middle-left' | 'bottom-right' | 'top-right';
  setModalStickyPosition: (v: 'middle-left' | 'bottom-right' | 'top-right') => void;
  modalStickyStyleTheme: 'hand-drawn' | 'terminal' | 'default';
  setModalStickyStyleTheme: (v: 'hand-drawn' | 'terminal' | 'default') => void;
  modalStickyColor: 'yellow' | 'pink';
  setModalStickyColor: (v: 'yellow' | 'pink') => void;
  submitStickyForm: () => void;
  deleteTarget: { type: 'topic' | 'sticky'; id: string; name: string } | null;
  setDeleteTarget: (target: any) => void;
  submitDelete: () => void;
  titleInput: string;
  setTitleInput: (v: string) => void;
  taglineInput: string;
  setTaglineInput: (v: string) => void;
  bookAuthorInput: string;
  setBookAuthorInput: (v: string) => void;
  bookCoverInput: string;
  setBookCoverInput: (v: string) => void;
  saveBookDetails: () => void;
}

export const NotebookModalsContainer: React.FC<NotebookModalsContainerProps> = ({
  activeModal,
  setActiveModal,
  modalTopicTitle,
  setModalTopicTitle,
  modalTopicPage,
  setTopicPage,
  pagesCount,
  submitTopicForm,
  modalStickyTitle,
  setModalStickyTitle,
  modalStickyContent,
  setModalStickyContent,
  modalStickyPosition,
  setModalStickyPosition,
  modalStickyStyleTheme,
  setModalStickyStyleTheme,
  modalStickyColor,
  setModalStickyColor,
  submitStickyForm,
  deleteTarget,
  setDeleteTarget,
  submitDelete,
  titleInput,
  setTitleInput,
  taglineInput,
  setTaglineInput,
  bookAuthorInput,
  setBookAuthorInput,
  bookCoverInput,
  setBookCoverInput,
  saveBookDetails,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-9999 bg-black/50 backdrop-blur-[3px] animate-fadeIn">
      <div
        className="bg-surface border border-border w-full max-w-lg min-w-0 mx-4 rounded-2xl shadow-2xl flex flex-col text-left overflow-hidden"
        style={{ maxHeight: '85vh' }}
      >
        {(activeModal === 'add-topic' || activeModal === 'edit-topic') && (
          <TopicModal
            isAdd={activeModal === 'add-topic'}
            topicTitle={modalTopicTitle}
            setTopicTitle={setModalTopicTitle}
            topicPage={modalTopicPage}
            setTopicPage={setTopicPage}
            pagesCount={pagesCount}
            onClose={() => setActiveModal(null)}
            onSubmit={submitTopicForm}
          />
        )}

        {(activeModal === 'add-sticky' || activeModal === 'edit-sticky') && (
          <StickyNoteModal
            isAdd={activeModal === 'add-sticky'}
            stickyTitle={modalStickyTitle}
            setStickyTitle={setModalStickyTitle}
            stickyContent={modalStickyContent}
            setStickyContent={setModalStickyContent}
            stickyPosition={modalStickyPosition}
            setStickyPosition={setModalStickyPosition}
            stickyStyleTheme={modalStickyStyleTheme}
            setStickyStyleTheme={setModalStickyStyleTheme}
            stickyColor={modalStickyColor}
            setStickyColor={setModalStickyColor}
            onClose={() => setActiveModal(null)}
            onSubmit={submitStickyForm}
          />
        )}

        {activeModal === 'delete-confirm' && deleteTarget && (
          <DeleteConfirmModal
            deleteTarget={deleteTarget}
            onClose={() => {
              setDeleteTarget(null);
              setActiveModal(null);
            }}
            onSubmit={submitDelete}
          />
        )}

        {activeModal === 'edit-book-details' && (
          <BookDetailsModal
            titleInput={titleInput}
            setTitleInput={setTitleInput}
            taglineInput={taglineInput}
            setTaglineInput={setTaglineInput}
            bookAuthorInput={bookAuthorInput}
            setBookAuthorInput={setBookAuthorInput}
            bookCoverInput={bookCoverInput}
            setBookCoverInput={setBookCoverInput}
            onClose={() => setActiveModal(null)}
            onSave={saveBookDetails}
          />
        )}
      </div>
    </div>
  );
};
