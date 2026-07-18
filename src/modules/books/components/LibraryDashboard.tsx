import React, { useState, useMemo } from 'react';
import {
  IconSearch,
  IconPlus,
  IconLayoutGrid,
  IconList,
  IconChevronDown,
  IconBookmark,
  IconDotsVertical,
  IconSparkles,
  IconHome,
  IconBooks,
  IconStar,
  IconMusic,
  IconTag
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { BookCover } from '../utils/presetCovers';
import { CreateNotebookModal } from './CreateNotebookModal';

interface LibraryDashboardProps {
  onSelectBook: (id: string) => void;
}

export const LibraryDashboard: React.FC<LibraryDashboardProps> = ({ onSelectBook }) => {
  const { books, updateBook, deleteBook } = useAppStore();

  // Navigation states
  const [activeTab, setActiveTab] = useState<'home' | 'all' | 'favorites' | 'reading-list' | 'audiobooks'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Search & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'createdAt'>('createdAt');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // View settings
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);



  // Card Menu states
  const [activeMenuBookId, setActiveMenuBookId] = useState<string | null>(null);

  // Filter books list
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // 1. Search Query
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // 2. Active Tab Filter
      if (activeTab === 'favorites' && !book.isFavorite) return false;
      if (activeTab === 'reading-list' && !book.readingList) return false;
      if (activeTab === 'audiobooks' && !book.audiobook) return false;

      // 3. Category Filter
      if (selectedCategory && book.category !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [books, activeTab, selectedCategory, searchQuery, sortBy]);



  return (
    <div className="flex flex-col lg:flex-row gap-6 text-left min-h-full">
      {/* ─── Library Module Left Navigation ─── */}
      <div className="w-full lg:w-60 flex-shrink-0 flex flex-col gap-6">
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-5">
          <div className="flex items-center gap-2.5 px-2 py-1.5 border-b border-border/40 pb-3">
            <span className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
              <IconBooks size={18} />
            </span>
            <span className="font-bold text-text-primary text-sm tracking-tight">My Library</span>
          </div>

          {/* Nav List */}
          <div className="flex flex-col gap-1">
            {[
              { id: 'home', label: 'Home', icon: IconHome },
              { id: 'all', label: 'All Books', icon: IconBooks },
              { id: 'favorites', label: 'Favorites', icon: IconStar },
              { id: 'reading-list', label: 'Reading List', icon: IconBookmark },
              { id: 'audiobooks', label: 'Audiobooks', icon: IconMusic },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id && !selectedCategory;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSelectedCategory(null);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100 ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Categories List */}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
            <span className="text-[10px] uppercase font-bold text-text-muted px-2.5 tracking-wider">
              Categories
            </span>
            <div className="flex flex-col gap-1">
              {['Fiction', 'Non-Fiction', 'Science', 'Biography', 'Self-Help'].map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isActive ? null : cat)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left border-none cursor-pointer transition-all active:scale-[0.97] transition-transform duration-100 ${
                      isActive
                        ? 'bg-rose-500/10 text-rose-600 font-bold'
                        : 'hover:bg-surface-hover text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <IconTag size={14} className={isActive ? 'text-rose-600' : 'text-text-muted'} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="bg-gradient-to-br from-violet-500/10 to-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex flex-col gap-3.5 relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-rose-500/10 rounded-full blur-xl" />
          <IconSparkles size={20} className="text-rose-500" />
          <div>
            <h4 className="text-xs font-extrabold text-text-primary">Upgrade to Premium</h4>
            <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
              Unlock unlimited notebooks, export formats, offline reading, and AI editing tools.
            </p>
          </div>
          <button className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-subtle active:scale-[0.97] transition-transform duration-100">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Header greeting */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-serif font-bold text-text-primary tracking-tight">
              Welcome back, Ramesh 👋
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              What would you like to read today?
            </p>
          </div>

          {/* Header Accessories */}
          <div className="flex items-center gap-3">
            <button className="p-2 bg-surface hover:bg-surface-hover border border-border rounded-xl cursor-pointer text-text-secondary transition-[background-color,color] duration-150 ease-out active:scale-95">
              <IconSearch size={16} />
            </button>
          </div>
        </div>

        {/* Search bar & Add button */}
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1">
            <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebook name, author, categories..."
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-primary focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-subtle cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100 shrink-0"
          >
            <IconPlus size={16} />
            Add Book
          </button>
        </div>



        {/* ─── My Books Segment ─── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-md font-bold text-text-primary">My Books</h2>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-bold">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'Book' : 'Books'}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              {/* Grid/List togglers */}
              <div className="flex items-center bg-surface border border-border rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors active:scale-[0.97] transition-transform ${
                    viewMode === 'grid' ? 'bg-rose-500/10 text-rose-600' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <IconLayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors active:scale-[0.97] transition-transform ${
                    viewMode === 'list' ? 'bg-rose-500/10 text-rose-600' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <IconList size={16} />
                </button>
              </div>

              {/* Sort selector */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  Sort by: {sortBy === 'title' ? 'Title' : sortBy === 'rating' ? 'Rating' : 'Date Created'}
                  <IconChevronDown size={14} />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-40 bg-surface border border-border rounded-xl shadow-lifted z-50 overflow-hidden">
                    {[
                      { id: 'createdAt', label: 'Date Created' },
                      { id: 'title', label: 'Title' },
                      { id: 'rating', label: 'Rating' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id as any);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold cursor-pointer hover:bg-surface-hover ${
                          sortBy === opt.id ? 'text-rose-600 bg-rose-500/5' : 'text-text-secondary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Cards Container */}
          {filteredBooks.length === 0 ? (
            <div className="bg-surface border border-border rounded-[24px] p-12 text-center flex flex-col items-center gap-3">
              <span className="p-4 bg-rose-500/5 text-rose-500 rounded-full">
                <IconBooks size={32} />
              </span>
              <h4 className="font-bold text-text-primary text-sm">No books found</h4>
              <p className="text-xs text-text-secondary max-w-sm leading-relaxed">
                We couldn't find any notebooks matching your filters. Create a new notebook or clear search parameters.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-subtle cursor-pointer transition-colors active:scale-[0.97] transition-transform duration-100"
              >
                <IconPlus size={14} /> Add First Book
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4 relative group hover:shadow-lifted hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 ease-out"
                >
                  {/* Card Actions overlay / Bookmark top-left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBook(book.id, { isFavorite: !book.isFavorite });
                    }}
                    className={`absolute left-7 top-7 z-20 p-1.5 rounded-lg border border-white/20 transition-[transform,background-color] duration-150 cursor-pointer backdrop-blur-md active:scale-90 ${
                      book.isFavorite
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-black/35 hover:bg-black/55 text-white/80'
                    }`}
                  >
                    <IconBookmark size={14} fill={book.isFavorite ? 'white' : 'transparent'} />
                  </button>

                  {/* Three-dots menu */}
                  <div className="absolute right-7 top-7 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuBookId(activeMenuBookId === book.id ? null : book.id);
                      }}
                      className="p-1.5 bg-black/35 hover:bg-black/55 text-white/85 rounded-lg border border-white/20 cursor-pointer backdrop-blur-md transition-[background-color] duration-150 active:scale-90"
                    >
                      <IconDotsVertical size={14} />
                    </button>

                    {activeMenuBookId === book.id && (
                      <div className="absolute right-0 mt-1.5 w-36 bg-surface border border-border rounded-xl shadow-high z-30 overflow-hidden animate-fadeIn">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBook(book.id);
                            setActiveMenuBookId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover cursor-pointer"
                        >
                          Open Notebook
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBook(book.id, { readingList: !book.readingList });
                            setActiveMenuBookId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-text-primary hover:bg-surface-hover cursor-pointer"
                        >
                          {book.readingList ? 'Remove Reading List' : 'Add Reading List'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${book.title}"? This cannot be undone.`)) {
                              deleteBook(book.id);
                            }
                            setActiveMenuBookId(null);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/5 cursor-pointer"
                        >
                          Delete Notebook
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clickable cover design with stacked pages stack */}
                  <div
                    onClick={() => onSelectBook(book.id)}
                    className="relative cursor-pointer notebook-page-stack"
                  >
                    <BookCover presetId={book.coverImage} title={book.title} author={book.author} className="rounded-xl" />
                    
                    {/* Hover read button */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity duration-200">
                      <span className="px-4 py-2 bg-white text-rose-600 text-xs font-bold rounded-xl shadow-high transform translate-y-1.5 group-hover:translate-y-0 transition-[transform,opacity] duration-200 ease-out">
                        Open Editor
                      </span>
                    </div>
                  </div>

                  {/* Description Details */}
                  <div className="text-left flex flex-col gap-1.5 px-1 mt-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-bold">
                        {book.category}
                      </span>
                      <span className="text-[10px] text-text-muted font-bold font-mono tabular-nums">
                        {book.pagesCount} pages
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectBook(book.id)}
                      className="font-bold text-text-primary text-sm tracking-tight cursor-pointer hover:text-rose-600 transition-colors duration-150 truncate"
                    >
                      {book.title}
                    </h4>
                    <p className="text-[11px] text-text-secondary truncate">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-subtle">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-alt border-b border-border text-text-muted font-bold">
                    <th className="p-4 w-12">Cover</th>
                    <th className="p-4">Title & Author</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Pages</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      onClick={() => onSelectBook(book.id)}
                      className="border-b border-border/50 hover:bg-surface-hover/30 cursor-pointer transition-colors duration-150 ease-out"
                    >
                      <td className="p-3">
                        <div className="w-8 aspect-[3/4] rounded overflow-hidden shadow-subtle">
                          <BookCover presetId={book.coverImage} title={book.title} showDetails={false} />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-text-primary text-xs">{book.title}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{book.author}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-semibold">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-3 text-text-secondary font-mono tabular-nums">{book.pagesCount}</td>
                      <td className="p-3 text-amber-500 flex items-center gap-0.5">
                        {Array.from({ length: book.rating }).map((_, i) => (
                          <IconStar key={i} size={10} fill="#F59E0B" color="#F59E0B" />
                        ))}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateBook(book.id, { isFavorite: !book.isFavorite })}
                            className={`p-1.5 rounded-lg border cursor-pointer transition-[background-color,transform] duration-150 active:scale-90 ${
                              book.isFavorite ? 'bg-amber-500 text-white border-amber-600' : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
                            }`}
                          >
                            <IconBookmark size={12} fill={book.isFavorite ? 'white' : 'transparent'} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${book.title}"?`)) deleteBook(book.id);
                            }}
                            className="p-1.5 bg-surface hover:bg-rose-500/10 text-text-secondary hover:text-rose-500 border border-border rounded-lg cursor-pointer transition-[background-color,color] duration-150 active:scale-90"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Creation Modal */}
      <CreateNotebookModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default LibraryDashboard;
