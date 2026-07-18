import React, { useState } from 'react';
import { MOCK_BOOKS } from '../fixtures';
import { BookCover } from '../../../modules/books/utils/presetCovers';
import { IconStar, IconPlus, IconMusic, IconChevronRight } from '@tabler/icons-react';

export const VariantE: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="bg-[#0f0724] border border-violet-500/20 rounded-[32px] p-8 flex flex-col gap-8 w-full text-left relative overflow-hidden text-zinc-100">
      
      {/* Background ambient glowing spheres */}
      <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute left-1/4 -bottom-16 w-56 h-56 rounded-full bg-rose-500/10 blur-[80px] pointer-events-none" />

      {/* Visual Axis Descriptor */}
      <div className="border-b border-white/10 pb-5 flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Axis E</span>
        <h3 className="text-md font-bold text-white">Apple Glassmorphic Style</h3>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Premium visual design. Uses frosted translucency, large negative spaces, floating card dimensions, and ambient shadow glows to make the interface feel highly aesthetic and material-centric.
        </p>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400">
            <IconMusic size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight leading-none">Aura Library</h2>
            <span className="text-[10px] font-semibold text-zinc-400 block mt-1">Frosted Glass Command Surface</span>
          </div>
        </div>

        <button className="self-start sm:self-center px-4.5 py-2.5 bg-gradient-to-r from-rose-500 to-violet-600 hover:from-rose-600 hover:to-violet-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_12px_24px_-10px_rgba(244,63,94,0.4)] border-none cursor-pointer active:scale-95 transition-all">
          <IconPlus size={14} /> Add Notebook
        </button>
      </div>

      {/* Glassmorphic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 relative z-10">
        {MOCK_BOOKS.slice(0, 3).map(book => {
          const isHovered = book.id === hoveredId;
          return (
            <div
              key={book.id}
              onMouseEnter={() => setHoveredId(book.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-3xl bg-white/[0.04] dark:bg-black/20 border border-white/10 p-5 flex flex-col gap-5 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 shadow-lifted"
            >
              
              {/* Cover stack with ambient drop shadow glow on hover */}
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden transition-transform duration-300" style={{ transform: isHovered ? 'translateY(-6px)' : 'translateY(0px)' }}>
                
                {/* Book cover component */}
                <BookCover presetId={book.coverImage} title={book.title} showDetails={false} className="rounded-2xl" />

                {/* Favorite Bookmark floating */}
                {book.isFavorite && (
                  <div className="absolute top-4 left-4 p-1.5 rounded-xl bg-amber-500 text-white shadow-lifted z-20">
                    <IconStar size={12} fill="white" />
                  </div>
                )}

                {/* Overlaid details button */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="px-4 py-2 bg-white text-zinc-950 font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-high">
                    Open Editor <IconChevronRight size={12} />
                  </span>
                </div>
              </div>

              {/* Text metadata */}
              <div className="text-left flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-rose-500/15 text-rose-300 rounded-lg text-[8px] font-black uppercase tracking-wider">
                    {book.category}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-bold font-mono">
                    {book.pagesCount} pages
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white tracking-tight truncate">
                  {book.title}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate">{book.author}</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
