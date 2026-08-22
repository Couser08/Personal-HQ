import React from 'react';

interface TopicModalProps {
  isAdd: boolean;
  topicTitle: string;
  setTopicTitle: (val: string) => void;
  topicPage: number;
  setTopicPage: (val: number) => void;
  pagesCount: number;
  onClose: () => void;
  onSubmit: () => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isAdd,
  topicTitle,
  setTopicTitle,
  topicPage,
  setTopicPage,
  pagesCount,
  onClose,
  onSubmit,
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
        <div>
          <h3 className="text-base font-black text-text-primary">
            {isAdd ? '✦ Create New Topic' : '✎ Edit Topic Details'}
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Define a navigable section or chapter in your book</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 transition-colors border rounded-full cursor-pointer hover:bg-surface-hover border-border/40 text-text-muted hover:text-text-primary"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-5 py-6 overflow-y-auto px-7">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Topic Title</label>
          <input
            type="text"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="e.g. Chapter 1: The Beginning"
            className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Starting Page Number</label>
          <select
            value={topicPage}
            onChange={(e) => setTopicPage(Number(e.target.value))}
            className="px-4 py-3 text-sm transition-all border cursor-pointer bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500"
          >
            {Array.from({ length: pagesCount || 5 }).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Page {idx + 1}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-text-muted">Topic will begin from the selected page onward</p>
        </div>
      </div>

      <div className="flex gap-3 py-5 border-t px-7 border-border/60">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 border border-border bg-surface hover:bg-surface-hover rounded-2xl text-sm font-bold text-text-secondary cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-sm font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shadow-md"
        >
          {isAdd ? 'Create Topic' : 'Save Changes'}
        </button>
      </div>
    </>
  );
};
