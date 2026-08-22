import React from 'react';

interface StickyNoteModalProps {
  isAdd: boolean;
  stickyTitle: string;
  setStickyTitle: (val: string) => void;
  stickyContent: string;
  setStickyContent: (val: string) => void;
  stickyPosition: 'top-right' | 'middle-left' | 'bottom-right';
  setStickyPosition: (val: 'top-right' | 'middle-left' | 'bottom-right') => void;
  stickyStyleTheme: 'default' | 'hand-drawn' | 'terminal';
  setStickyStyleTheme: (val: 'default' | 'hand-drawn' | 'terminal') => void;
  stickyColor: 'yellow' | 'pink';
  setStickyColor: (val: 'yellow' | 'pink') => void;
  onClose: () => void;
  onSubmit: () => void;
}

export const StickyNoteModal: React.FC<StickyNoteModalProps> = ({
  isAdd,
  stickyTitle,
  setStickyTitle,
  stickyContent,
  setStickyContent,
  stickyPosition,
  setStickyPosition,
  stickyStyleTheme,
  setStickyStyleTheme,
  stickyColor,
  setStickyColor,
  onClose,
  onSubmit,
}) => {
  return (
    <>
      <div className="flex items-center justify-between py-5 border-b px-7 border-border/60">
        <div>
          <h3 className="text-base font-black text-text-primary">
            {isAdd ? '📌 Add Sticky Note' : '✎ Edit Sticky Note'}
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Attach a memorable note to this page</p>
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
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Note Title / Header</label>
          <input
            type="text"
            value={stickyTitle}
            onChange={(e) => setStickyTitle(e.target.value)}
            placeholder="e.g. Remember, Key Insight, Important!"
            className="px-4 py-3 text-sm transition-all border bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Note Content</label>
          <textarea
            value={stickyContent}
            onChange={(e) => setStickyContent(e.target.value)}
            placeholder="Write your note, insight, or reminder here..."
            rows={4}
            className="px-4 py-3 text-sm transition-all border resize-none bg-surface-alt border-border rounded-2xl text-text-primary focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Page Position</label>
            <select
              value={stickyPosition}
              onChange={(e) => setStickyPosition(e.target.value as any)}
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
              value={stickyStyleTheme}
              onChange={(e) => setStickyStyleTheme(e.target.value as any)}
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
                onClick={() => setStickyColor(col.id as any)}
                className={`flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100 ${
                  stickyColor === col.id
                    ? 'ring-2 ring-rose-500 ring-offset-2 scale-[1.02] shadow-md'
                    : 'opacity-60 hover:opacity-90 hover:scale-[1.01]'
                }`}
                style={{ backgroundColor: col.color, borderColor: stickyColor === col.id ? '#f43f5e' : col.border, color: col.textColor }}
              >
                <span className="w-3.5 h-3.5 rounded-full border-2 border-black/20 shadow-sm" style={{ backgroundColor: col.border }} />
                <span>{col.label}</span>
                {stickyColor === col.id && <span className="ml-auto text-rose-500 font-bold">✓</span>}
              </button>
            ))}
          </div>
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
          {isAdd ? 'Add Note' : 'Save Changes'}
        </button>
      </div>
    </>
  );
};
