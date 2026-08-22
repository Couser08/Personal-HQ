import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconPlus, IconX } from '@tabler/icons-react';
import { type BookTopic, type BookStickyNote } from '../../../../store/types';
import { MarginNote } from '../MarginNote';

interface NotebookSidePanelProps {
  showTopicsPanel: boolean;
  setShowTopicsPanel: (val: boolean) => void;
  showNotesPanel: boolean;
  setShowNotesPanel: (val: boolean) => void;
  topics: BookTopic[];
  stickyNotes: BookStickyNote[];
  currentPage: number;
  onSelectTopicPage: (pageNo: number) => void;
  onToggleTopicState: (topicId: string, nextState: 'unread' | 'in_progress' | 'done') => void;
  onEditTopic: (topic: BookTopic) => void;
  onDeleteTopic: (id: string, title: string) => void;
  openAddTopicModal: () => void;
  openAddStickyModal: (color: 'yellow' | 'pink') => void;
  onEditSticky: (note: BookStickyNote) => void;
  onDeleteSticky: (id: string, title: string) => void;
}

export const NotebookSidePanel: React.FC<NotebookSidePanelProps> = ({
  showTopicsPanel,
  setShowTopicsPanel,
  showNotesPanel,
  setShowNotesPanel,
  topics,
  stickyNotes,
  currentPage,
  onSelectTopicPage,
  onToggleTopicState,
  onEditTopic,
  onDeleteTopic,
  openAddTopicModal,
  openAddStickyModal,
  onEditSticky,
  onDeleteSticky,
}) => {
  return (
    <>
      {/* Desktop Inline Right Sidebar: Topics & Notes Panels (xl+) */}
      {(showTopicsPanel || showNotesPanel) && (
        <div className="hidden xl:flex xl:flex-col xl:w-72 xl:gap-4 shrink-0">
          {/* Topics Panel */}
          {showTopicsPanel && (
            <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden border bg-surface border-border rounded-2xl text-left">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-black text-text-primary">Topics & Progress</span>
                <span className="text-[10px] text-text-muted font-bold">
                  {topics.filter((t) => t.readingState === 'done').length}/{topics.length} Done
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 text-xs font-semibold pr-0.5 custom-scrollbar">
                {topics.length === 0 ? (
                  <div className="py-6 italic text-center text-text-muted">No topics. Add chapters below.</div>
                ) : (
                  topics.map((topic) => {
                    const state = topic.readingState || 'unread';
                    const stateBg =
                      state === 'done'
                        ? 'bg-emerald-500 text-white'
                        : state === 'in_progress'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-slate-400 dark:bg-slate-500';

                    const stateTitle =
                      state === 'done'
                        ? 'Completed (Click to change)'
                        : state === 'in_progress'
                        ? 'In Progress (Click to change)'
                        : 'Unread (Click to change)';

                    return (
                      <div
                        key={topic.id}
                        onClick={() => onSelectTopicPage(topic.pageNumber)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-surface-hover/60 transition-colors ${
                          currentPage === topic.pageNumber || currentPage + 1 === topic.pageNumber
                            ? 'bg-rose-500/10 text-rose-500 font-bold'
                            : 'text-text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextState: 'unread' | 'in_progress' | 'done' =
                                state === 'unread' ? 'in_progress' : state === 'in_progress' ? 'done' : 'unread';
                              onToggleTopicState(topic.id, nextState);
                            }}
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${stateBg} transition-transform hover:scale-125 border-none cursor-pointer`}
                            title={stateTitle}
                          />
                          <span className="truncate">{topic.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-[10px] text-text-muted font-mono">p. {topic.pageNumber}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTopic(topic);
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
                              onDeleteTopic(topic.id, topic.title);
                            }}
                            className="text-text-muted hover:text-red-500 font-bold px-1 py-0.5 cursor-pointer text-[10px]"
                            title="Delete Topic"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                <button
                  type="button"
                  onClick={openAddTopicModal}
                  className="w-full flex items-center justify-center gap-1.5 p-2 mt-2 rounded-xl border border-dashed border-border hover:border-rose-500/50 hover:bg-rose-500/5 text-rose-500 font-bold text-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  <IconPlus size={13} />
                  <span>+ New Topic</span>
                </button>
              </div>
            </div>
          )}

          {/* Notes Panel */}
          {showNotesPanel && (
            <div className="flex flex-col flex-1 gap-3 p-4 overflow-hidden border bg-surface border-border rounded-2xl text-left">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-xs font-black text-text-primary">Anchored Notes</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openAddStickyModal('yellow')}
                    className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-bold text-[9px] cursor-pointer"
                  >
                    + Yellow
                  </button>
                  <button
                    onClick={() => openAddStickyModal('pink')}
                    className="px-2 py-0.5 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded font-bold text-[9px] cursor-pointer"
                  >
                    + Pink
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-0.5 custom-scrollbar">
                {stickyNotes.length === 0 ? (
                  <div className="py-6 text-xs italic text-center text-text-muted">No anchored notes.</div>
                ) : (
                  stickyNotes.map((note) => (
                    <MarginNote
                      key={note.id}
                      note={note}
                      onEdit={onEditSticky}
                      onDelete={(id) => onDeleteSticky(id, 'Sticky Note')}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile/Tablet Slide-in Drawer for Topics & Notes (< xl) */}
      <AnimatePresence>
        {(showTopicsPanel || showNotesPanel) && (
          <div className="xl:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowTopicsPanel(false);
                setShowNotesPanel(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative ml-auto w-full max-w-[340px] h-full bg-surface border-l border-border p-4 shadow-lifted flex flex-col gap-3.5 z-10"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                <span className="font-extrabold text-sm text-text-primary">
                  {showTopicsPanel ? '📚 Topics & Chapters' : '📌 Anchored Notes'}
                </span>
                <button
                  onClick={() => {
                    setShowTopicsPanel(false);
                    setShowNotesPanel(false);
                  }}
                  className="p-1.5 rounded-lg bg-surface-alt hover:bg-surface border border-border text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <IconX size={16} />
                </button>
              </div>

              {showTopicsPanel && (
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
                  {topics.length === 0 ? (
                    <div className="py-8 italic text-center text-text-muted text-xs">No topics found. Add one below.</div>
                  ) : (
                    topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => {
                          onSelectTopicPage(topic.pageNumber);
                          setShowTopicsPanel(false);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover/60 transition-colors ${
                          currentPage === topic.pageNumber
                            ? 'bg-rose-500/10 text-rose-500 font-bold'
                            : 'text-text-secondary'
                        }`}
                      >
                        <span className="text-xs truncate">{topic.title}</span>
                        <span className="text-[10px] text-text-muted font-mono shrink-0 ml-2">p. {topic.pageNumber}</span>
                      </div>
                    ))
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowTopicsPanel(false);
                      openAddTopicModal();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 p-2.5 mt-3 rounded-xl border border-dashed border-border hover:border-rose-500/50 hover:bg-rose-500/5 text-rose-500 font-bold text-xs cursor-pointer"
                  >
                    <IconPlus size={14} />
                    <span>+ New Topic</span>
                  </button>
                </div>
              )}

              {showNotesPanel && (
                <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 custom-scrollbar">
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => {
                        setShowNotesPanel(false);
                        openAddStickyModal('yellow');
                      }}
                      className="flex-1 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs cursor-pointer text-center"
                    >
                      + Yellow Note
                    </button>
                    <button
                      onClick={() => {
                        setShowNotesPanel(false);
                        openAddStickyModal('pink');
                      }}
                      className="flex-1 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-900 rounded-lg font-bold text-xs cursor-pointer text-center"
                    >
                      + Pink Note
                    </button>
                  </div>

                  {stickyNotes.length === 0 ? (
                    <div className="py-8 text-xs italic text-center text-text-muted">No anchored notes on this notebook.</div>
                  ) : (
                    stickyNotes.map((note) => (
                      <MarginNote
                        key={note.id}
                        note={note}
                        onEdit={(n) => {
                          setShowNotesPanel(false);
                          onEditSticky(n);
                        }}
                        onDelete={(id) => onDeleteSticky(id, 'Sticky Note')}
                      />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
