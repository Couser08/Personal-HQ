import React, { useState } from 'react';
import { MOCK_BOOKS } from '../fixtures';
import type { Book } from '../fixtures';
import { BookCover } from '../../../modules/books/utils/presetCovers';
import { IconChevronDown, IconStar, IconCheck } from '@tabler/icons-react';

export const VariantD: React.FC = () => {
  const [booksList, setBooksList] = useState<Book[]>(MOCK_BOOKS);
  const [expandedBookId, setExpandedBookId] = useState<string | null>('1');

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBooksList(prev => prev.map(b => b.id === id ? { ...b, isFavorite: !b.isFavorite } : b));
  };

  const handleUpdateRating = (id: string, rating: number) => {
    setBooksList(prev => prev.map(b => b.id === id ? { ...b, rating } : b));
  };

  const handleToggleReadingList = (id: string) => {
    setBooksList(prev => prev.map(b => b.id === id ? { ...b, readingList: !b.readingList } : b));
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 w-full text-left">
      {/* Visual Axis Descriptor */}
      <div className="border-b border-border pb-4 flex flex-col gap-1">
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Axis D</span>
        <h3 className="text-md font-bold text-text-primary">Interaction Focus: In-place Accordions</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Notion-style progressive disclosure. Clicking on any book expands a details section directly below it, exposing simple toggles, star ratings, and edit fields in-place without triggering modals or routing away.
        </p>
      </div>

      {/* Accordion Container */}
      <div className="flex flex-col gap-3">
        {booksList.map(book => {
          const isExpanded = book.id === expandedBookId;
          return (
            <div 
              key={book.id}
              className={`border border-border/80 rounded-2xl overflow-hidden transition-all duration-200 ${
                isExpanded ? 'bg-surface shadow-subtle ring-1 ring-rose-500/25' : 'bg-surface-alt/40 hover:bg-surface-alt'
              }`}
            >
              {/* Accordion Header */}
              <div 
                onClick={() => setExpandedBookId(isExpanded ? null : book.id)}
                className="p-4 flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-10 rounded overflow-hidden shadow-sm shrink-0">
                    <BookCover presetId={book.coverImage} title={book.title} showDetails={false} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-text-primary truncate">{book.title}</h4>
                    <p className="text-[10px] text-text-secondary truncate">{book.author}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="hidden sm:inline-block px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-semibold">
                    {book.category}
                  </span>
                  
                  {/* Favorite Indicator */}
                  <button 
                    onClick={e => handleToggleFavorite(book.id, e)}
                    className="p-1 rounded hover:bg-surface text-text-muted hover:text-amber-500 cursor-pointer bg-transparent border-none"
                  >
                    <IconStar size={13} fill={book.isFavorite ? '#F59E0B' : 'transparent'} className={book.isFavorite ? 'text-amber-500' : 'text-text-muted'} />
                  </button>

                  <IconChevronDown size={14} className={`text-text-muted transition-transform duration-200 ${isExpanded ? 'rotate-180 text-rose-500' : ''}`} />
                </div>
              </div>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-border/40 bg-surface/50 text-xs flex flex-col gap-4 text-left animate-fadeIn">
                  
                  {/* Grid fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Category Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Category</label>
                      <span className="font-bold text-text-primary">{book.category}</span>
                    </div>

                    {/* Rating selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Adjust Rating</label>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => handleUpdateRating(book.id, star)}
                            className="p-0.5 hover:scale-110 cursor-pointer transition-transform bg-transparent border-none"
                          >
                            <IconStar size={14} fill={star <= book.rating ? '#F59E0B' : 'transparent'} className={star <= book.rating ? 'text-amber-500' : 'text-text-muted'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status checkbox toggler */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-text-muted">Collection Status</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`rl-${book.id}`}
                          checked={book.readingList}
                          onChange={() => handleToggleReadingList(book.id)}
                          className="w-3.5 h-3.5 text-rose-500 border-border rounded focus:ring-rose-500 cursor-pointer"
                        />
                        <label htmlFor={`rl-${book.id}`} className="text-text-primary cursor-pointer select-none">
                          In Reading List
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quick summary notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-text-muted">Pages & Meta</label>
                    <p className="text-text-secondary leading-relaxed">
                      This workbook contains <span className="font-bold text-text-primary">{book.pagesCount}</span> pages. 
                      It was added to your command center on <span className="font-bold text-text-primary">{new Date(book.createdAt).toLocaleDateString()}</span>.
                    </p>
                  </div>

                  {/* Secondary buttons */}
                  <div className="flex items-center gap-2 mt-1">
                    <button className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer border-none flex items-center gap-1 active:scale-95 transition-all">
                      <IconCheck size={12} /> Open Full Editor
                    </button>
                    <button className="px-3 py-1.5 bg-surface border border-border hover:bg-surface-hover text-text-secondary rounded-lg text-[10px] font-bold cursor-pointer active:scale-95">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
