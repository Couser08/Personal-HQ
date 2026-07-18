import React, { useState, useMemo } from 'react';
import { MOCK_BOOKS } from '../fixtures';
import { BookCover } from '../../../modules/books/utils/presetCovers';
import { IconSearch, IconPlus, IconSearchOff, IconChevronRight } from '@tabler/icons-react';

export const VariantA: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'reading-list'>('all');

  const filteredBooks = useMemo(() => {
    return MOCK_BOOKS.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'favorites' && book.isFavorite) ||
        (activeTab === 'reading-list' && book.readingList);

      const matchesCategory = !selectedCategory || book.category === selectedCategory;

      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [searchQuery, selectedCategory, activeTab]);

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 flex flex-col gap-6 w-full text-left">
      {/* Visual Axis Descriptor */}
      <div className="border-b border-border pb-4 flex flex-col gap-1">
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Axis A</span>
        <h3 className="text-md font-bold text-text-primary">Information Hierarchy Focus</h3>
        <p className="text-[11px] text-text-secondary leading-relaxed">
          Stripe-style clean hierarchy. Clear separation between main dashboard actions, search-filter bar, and clean card items. Reduces visual clutter.
        </p>
      </div>

      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-text-primary tracking-tight">Your Digital Library</h2>
          <p className="text-xs text-text-secondary">Keep track of your study notebooks and reading logs.</p>
        </div>
        <button className="self-start sm:self-center px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-subtle cursor-pointer active:scale-95 transition-all">
          <IconPlus size={15} /> Add New Book
        </button>
      </div>

      {/* Structured Search & Filter Bar */}
      <div className="flex flex-col gap-3 p-3 bg-surface-alt/50 border border-border/55 rounded-2xl">
        <div className="relative">
          <IconSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search title, author, or keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border/70 rounded-xl pl-9 pr-4 py-2 text-xs text-text-primary focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-surface border border-border p-0.5 rounded-lg">
            {[
              { id: 'all', label: 'All Books' },
              { id: 'favorites', label: 'Favorites' },
              { id: 'reading-list', label: 'Reading List' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold cursor-pointer transition-all border-none ${
                  activeTab === tab.id
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Categories Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {['Fiction', 'Science', 'Biography', 'Self-Help'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-rose-500 border-rose-500/50 text-white'
                    : 'bg-surface border-border text-text-muted hover:text-text-primary hover:border-border-alt'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[220px]">
        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 border border-dashed border-border rounded-2xl text-center">
            <IconSearchOff size={28} className="text-text-muted" />
            <p className="text-xs text-text-muted font-bold">No notebooks match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredBooks.map(book => (
              <div 
                key={book.id} 
                className="group relative bg-surface border border-border hover:border-rose-500/30 rounded-2xl p-3 flex flex-col gap-3 transition-all duration-200 hover:shadow-subtle cursor-pointer"
              >
                {/* Visual Stack Cover */}
                <div className="aspect-[3/4] w-full rounded-xl overflow-hidden shadow-subtle group-hover:scale-[1.01] transition-transform duration-200">
                  <BookCover presetId={book.coverImage} title={book.title} showDetails={false} />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                    <span className="px-3 py-1.5 bg-white text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-lifted">
                      Read <IconChevronRight size={10} />
                    </span>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-col gap-1 text-left px-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500">{book.category}</span>
                    <span className="text-[10px] font-mono font-bold text-text-muted">{book.pagesCount} pages</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-text-primary tracking-tight truncate group-hover:text-rose-500 transition-colors">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
