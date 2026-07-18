import React, { useState, useMemo } from 'react';
import { MOCK_BOOKS } from '../fixtures';
import { BookCover } from '../../../modules/books/utils/presetCovers';
import { IconSearch, IconStar, IconTrash, IconExternalLink, IconCalendar, IconNotebook } from '@tabler/icons-react';

export const VariantB: React.FC = () => {
  const [selectedBookId, setSelectedBookId] = useState<string>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedBook = useMemo(() => {
    return MOCK_BOOKS.find(b => b.id === selectedBookId) || MOCK_BOOKS[0];
  }, [selectedBookId]);

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 w-full text-left">
      {/* Visual Axis Descriptor */}
      <div className="border-b border-border pb-4 flex flex-col gap-1">
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Axis B</span>
        <h3 className="text-md font-bold text-text-primary">Layout Model Exploration</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Split-pane dashboard interface inspired by Linear and Slack. Renders the book list alongside a permanent, context-aware side preview column. Ideal for rapid details scanning.
        </p>
      </div>

      {/* Split Pane Container */}
      <div className="flex flex-col lg:flex-row gap-6 border border-border/60 rounded-2xl overflow-hidden bg-surface-alt/20">
        
        {/* Left Side: Books List & Search (60%) */}
        <div className="flex-1 p-4 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-border/50">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">Library List</h4>
            <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-[10px] rounded-full text-text-secondary font-bold">
              {filteredBooks.length} Books
            </span>
          </div>

          <div className="relative">
            <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter books..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border/80 rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-text-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredBooks.map(book => {
              const isSelected = book.id === selectedBookId;
              return (
                <button
                  key={book.id}
                  onClick={() => setSelectedBookId(book.id)}
                  className={`w-full p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-center gap-3 active:scale-[0.99] ${
                    isSelected 
                      ? 'bg-rose-500/10 border-rose-500/30 shadow-sm' 
                      : 'bg-surface border-border hover:bg-surface-hover hover:border-border-alt'
                  }`}
                >
                  <div className="w-9 h-12 rounded overflow-hidden shadow-subtle shrink-0">
                    <BookCover presetId={book.coverImage} title={book.title} showDetails={false} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[8px] uppercase font-black text-rose-500">{book.category}</span>
                      {book.isFavorite && <IconStar size={10} className="text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <h5 className={`text-xs font-bold truncate mt-0.5 ${isSelected ? 'text-rose-600' : 'text-text-primary'}`}>{book.title}</h5>
                    <p className="text-[10px] text-text-secondary truncate">{book.author}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Detail Preview Panel (40%) */}
        <div className="w-full lg:w-72 p-5 bg-surface/80 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">Book Preview</span>
            <IconNotebook size={14} className="text-text-muted" />
          </div>

          {selectedBook ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="w-16 shadow-lifted rounded-xl overflow-hidden shrink-0">
                  <BookCover presetId={selectedBook.coverImage} title={selectedBook.title} showDetails={false} />
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="font-extrabold text-sm text-text-primary leading-tight line-clamp-3">{selectedBook.title}</h4>
                  <p className="text-[11px] text-text-secondary mt-1">{selectedBook.author}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-bold">
                    {selectedBook.category}
                  </span>
                </div>
              </div>

              {/* Attributes Details */}
              <div className="flex flex-col gap-2.5 p-3 bg-surface-alt/40 border border-border/40 rounded-xl text-[11px]">
                <div className="flex justify-between">
                  <span className="text-text-secondary flex items-center gap-1"><IconCalendar size={12} /> Created</span>
                  <span className="font-bold text-text-primary">{new Date(selectedBook.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Pages Count</span>
                  <span className="font-bold text-text-primary font-mono">{selectedBook.pagesCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">Is Favorite</span>
                  <span className="font-bold text-text-primary">
                    {selectedBook.isFavorite ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-2">
                <button className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border-none active:scale-95 transition-all">
                  <IconExternalLink size={13} /> Open in Editor
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 bg-surface border border-border hover:bg-surface-hover text-text-primary rounded-lg text-[10px] font-bold cursor-pointer active:scale-95">
                    Toggle Favorite
                  </button>
                  <button className="px-2 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 rounded-lg cursor-pointer active:scale-95">
                    <IconTrash size={12} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-text-muted">Select a book to preview</div>
          )}
        </div>

      </div>
    </div>
  );
};
