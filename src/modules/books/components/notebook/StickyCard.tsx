import React from 'react';
import { type BookStickyNote } from '../../../../store/types';

interface StickyCardProps {
  note: BookStickyNote;
  idx: number;
  onEdit: (note: BookStickyNote) => void;
  onDelete: (id: string, title: string) => void;
}

export const StickyCard: React.FC<StickyCardProps> = ({
  note,
  idx,
  onEdit,
  onDelete,
}) => {
  const isPink = note.color === 'pink';
  const rotation = idx % 2 === 0 ? 'rotate-1' : '-rotate-1';
  const theme = note.styleTheme || 'default';

  if (theme === 'terminal') {
    return (
      <div
        onClick={() => onEdit(note)}
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
              onDelete(note.id, note.title || 'Note');
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
        onClick={() => onEdit(note)}
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
            onDelete(note.id, note.title || 'Note');
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
      onClick={() => onEdit(note)}
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
          onDelete(note.id, note.title || 'Sticky Note');
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

export const getStickyPositionClasses = (position?: string, idx: number = 0) => {
  const offset = (idx % 3) * 26;
  switch (position) {
    case 'middle-left':
      return `absolute left-[-15px] sm:left-[-35px] top-[calc(35%+${offset}px)] -translate-y-1/2 pointer-events-auto z-20`;
    case 'top-right':
      return `absolute right-[-15px] sm:right-[-35px] top-[calc(20px+${offset}px)] pointer-events-auto z-20`;
    case 'bottom-right':
    default:
      return `absolute right-[-15px] sm:right-[-35px] bottom-[calc(40px+${offset}px)] pointer-events-auto z-20`;
  }
};
