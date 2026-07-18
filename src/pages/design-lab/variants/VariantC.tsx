import React, { useState, useMemo } from 'react';
import { MOCK_BOOKS } from '../fixtures';
import { BookCover } from '../../../modules/books/utils/presetCovers';
import { IconSearch, IconStar, IconBookmark, IconTrash, IconEye, IconFilter } from '@tabler/icons-react';

export const VariantC: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) || book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || book.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 w-full text-left">
      {/* Visual Axis Descriptor */}
      <div className="border-b border-border pb-4 flex flex-col gap-1">
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Axis C</span>
        <h3 className="text-md font-bold text-text-primary">Density & List Focus</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          High-density utility list inspired by developer tools. Maximizes horizontal space, showing covers, pages count, ratings, and actions in structured columns. Reduces scroll footprint.
        </p>
      </div>

      {/* Tight Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-grow max-w-md">
          <IconSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-text-primary focus:outline-none"
          />
        </div>

        {/* Quick category filter dropdown */}
        <div className="flex items-center gap-1.5">
          <IconFilter size={12} className="text-text-muted shrink-0" />
          <select
            value={categoryFilter || ''}
            onChange={e => setCategoryFilter(e.target.value || null)}
            className="bg-surface border border-border/80 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Biography">Biography</option>
            <option value="Science">Science</option>
            <option value="Self-Help">Self-Help</option>
          </select>
        </div>
      </div>

      {/* High-density Table */}
      <div className="border border-border/60 rounded-2xl overflow-hidden bg-surface shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-alt border-b border-border text-text-muted font-bold">
              <th className="p-3 w-10 text-center">Cover</th>
              <th className="p-3">Title & Author</th>
              <th className="p-3 hidden sm:table-cell">Category</th>
              <th className="p-3 text-right">Pages</th>
              <th className="p-3 text-center w-28">Rating</th>
              <th className="p-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map(book => (
              <tr 
                key={book.id}
                className="border-b border-border/40 hover:bg-surface-hover/30 transition-colors cursor-pointer group"
              >
                <td className="p-2">
                  <div className="w-7 aspect-[3/4] rounded shadow-sm overflow-hidden mx-auto">
                    <BookCover presetId={book.coverImage} title={book.title} showDetails={false} />
                  </div>
                </td>
                <td className="p-2.5">
                  <div className="font-bold text-text-primary text-[13px] truncate max-w-[200px] sm:max-w-none group-hover:text-rose-500 transition-colors">
                    {book.title}
                  </div>
                  <div className="text-[10px] text-text-secondary mt-0.5 truncate">{book.author}</div>
                </td>
                <td className="p-2.5 hidden sm:table-cell">
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-bold">
                    {book.category}
                  </span>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-text-secondary tabular-nums">
                  {book.pagesCount}
                </td>
                <td className="p-2.5">
                  <div className="flex items-center justify-center gap-0.5 text-amber-500">
                    {Array.from({ length: book.rating }).map((_, i) => (
                      <IconStar key={i} size={10} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </td>
                <td className="p-2.5" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-center gap-1.5">
                    <button className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer transition-colors bg-transparent border-none">
                      <IconEye size={13} />
                    </button>
                    <button className={`p-1 rounded cursor-pointer transition-colors bg-transparent border-none ${
                      book.isFavorite ? 'text-amber-500' : 'text-text-muted hover:text-amber-500 hover:bg-amber-500/10'
                    }`}>
                      <IconBookmark size={13} fill={book.isFavorite ? '#F59E0B' : 'transparent'} />
                    </button>
                    <button className="p-1 text-text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer transition-colors bg-transparent border-none">
                      <IconTrash size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
