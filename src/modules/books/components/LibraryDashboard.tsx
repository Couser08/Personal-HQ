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
  IconTag,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { BookCover } from '../utils/presetCovers';
import { CreateNotebookModal } from './CreateNotebookModal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';

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
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        (book.title || '').toLowerCase().includes(query) ||
        (book.author || '').toLowerCase().includes(query) ||
        (book.category || '').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (activeTab === 'favorites' && !book.isFavorite) return false;
      if (activeTab === 'reading-list' && !book.readingList) return false;
      if (activeTab === 'audiobooks' && !book.audiobook) return false;

      if (selectedCategory && book.category !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [books, activeTab, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="@container/library flex flex-col lg:flex-row gap-5 text-left min-h-full">
      {/* ─── Desktop Left Navigation Column ─── */}
      <div className="hidden lg:flex lg:w-60 shrink-0 flex-col gap-5">
        <div className="bg-surface border border-border rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 px-2 py-1 border-b border-border/40 pb-2.5">
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
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer transition-all active:scale-[0.97] ${
                    isActive
                      ? 'bg-rose-500/10 text-rose-600 font-bold'
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left border-none cursor-pointer transition-all active:scale-[0.97] ${
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

        {/* Upgrade / Stats Card */}
        <div className="bg-gradient-to-br from-violet-500/10 to-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
          <IconSparkles size={20} className="text-rose-500" />
          <div>
            <h4 className="text-xs font-extrabold text-text-primary">Bookshelf Collection</h4>
            <p className="text-[10.5px] text-text-secondary mt-0.5 leading-relaxed">
              {books.length} notebooks saved across all categories.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-subtle active:scale-[0.97]"
          >
            + Create New Book
          </button>
        </div>
      </div>

      {/* ─── Main Content Area ─── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary tracking-tight">
              My Library 📚
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Read, draft notes, and organize your digital books.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-surface border border-border rounded-full text-xs font-bold text-text-secondary">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'Notebook' : 'Notebooks'}
            </span>
          </div>
        </div>

        {/* ─── Mobile Horizontal Tabs & Categories Strip ─── */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          {[
            { id: 'home', label: 'All Books' },
            { id: 'favorites', label: '⭐ Favorites' },
            { id: 'reading-list', label: '🔖 Reading' },
            { id: 'audiobooks', label: '🎧 Audio' },
          ].map((tab) => {
            const isActive = activeTab === tab.id && !selectedCategory;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedCategory(null);
                }}
                className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-border/80 mx-1 shrink-0" />

          {['Fiction', 'Non-Fiction', 'Science', 'Biography', 'Self-Help'].map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive ? null : cat)}
                className={`px-3 py-1.5 min-h-[36px] rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-500/20 text-rose-600 border border-rose-500/30 font-bold'
                    : 'bg-surface-alt border border-border text-text-muted hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search bar & Add button */}
        <div className="flex items-center gap-2.5 w-full">
          <div className="relative flex-1">
            <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebook name, author, categories..."
              className="w-full pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-rose-500/20"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            className="px-3.5 sm:px-4 py-2 min-h-[38px] shrink-0 text-xs font-bold"
          >
            <IconPlus size={16} />
            <span className="hidden sm:inline">Add Book</span>
          </Button>
        </div>

        {/* ─── Books Display Segment ─── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-md font-bold text-text-primary">Bookshelf</h2>
              <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[10px] font-bold">
                {filteredBooks.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Grid/List togglers */}
              <div className="flex items-center bg-surface border border-border rounded-xl p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors active:scale-[0.97] ${
                    viewMode === 'grid' ? 'bg-rose-500/10 text-rose-600' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="Grid View"
                >
                  <IconLayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-colors active:scale-[0.97] ${
                    viewMode === 'list' ? 'bg-rose-500/10 text-rose-600' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  title="List View"
                >
                  <IconList size={15} />
                </button>
              </div>

              {/* Sort selector */}
              <div className="relative">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-2.5 sm:px-3.5 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span className="hidden sm:inline">Sort: </span>
                  <span>{sortBy === 'title' ? 'Title' : sortBy === 'rating' ? 'Rating' : 'Newest'}</span>
                  <IconChevronDown size={13} />
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-36 bg-surface border border-border rounded-xl shadow-high z-50 overflow-hidden animate-fadeIn">
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
                        className={`w-full text-left px-3.5 py-2 text-xs font-semibold cursor-pointer hover:bg-surface-hover ${
                          sortBy === opt.id ? 'text-rose-600 bg-rose-500/5 font-bold' : 'text-text-secondary'
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
            <EmptyState
              icon={<IconBooks className="w-10 h-10 text-text-muted" />}
              title="No books found"
              description="We couldn't find any notebooks matching your filters. Create a new notebook or clear search parameters."
              action={
                <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
                  <IconPlus size={16} /> Add First Book
                </Button>
              }
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 @xl:grid-cols-5 gap-3 sm:gap-5">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-surface border border-border rounded-2xl p-3 sm:p-4 flex flex-col gap-3 relative group hover:shadow-lifted hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Bookmark top-left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateBook(book.id, { isFavorite: !book.isFavorite });
                    }}
                    className={`absolute left-5 sm:left-6 top-5 sm:top-6 z-20 p-1.5 rounded-lg border border-white/20 transition-all cursor-pointer backdrop-blur-md active:scale-90 min-w-[28px] min-h-[28px] flex items-center justify-center ${
                      book.isFavorite
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-black/35 hover:bg-black/55 text-white/80'
                    }`}
                    title={book.isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                  >
                    <IconBookmark size={13} fill={book.isFavorite ? 'white' : 'transparent'} />
                  </button>

                  {/* Three-dots menu */}
                  <div className="absolute right-5 sm:right-6 top-5 sm:top-6 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuBookId(activeMenuBookId === book.id ? null : book.id);
                      }}
                      className="p-1.5 bg-black/35 hover:bg-black/55 text-white/85 rounded-lg border border-white/20 cursor-pointer backdrop-blur-md transition-all active:scale-90 min-w-[28px] min-h-[28px] flex items-center justify-center"
                    >
                      <IconDotsVertical size={13} />
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
                          className="w-full text-left px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                        >
                          Delete Notebook
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Clickable cover design */}
                  <div
                    onClick={() => onSelectBook(book.id)}
                    className="relative cursor-pointer notebook-page-stack"
                  >
                    <BookCover presetId={book.coverImage || 'cover-1'} title={book.title} author={book.author} className="rounded-xl" />
                    
                    {/* Hover read button */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity duration-200">
                      <span className="px-3.5 py-1.5 bg-white text-rose-600 text-xs font-bold rounded-xl shadow-high transform translate-y-1.5 group-hover:translate-y-0 transition-transform">
                        Open Editor
                      </span>
                    </div>
                  </div>

                  {/* Description Details */}
                  <div className="text-left flex flex-col gap-1 px-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-bold truncate">
                        {book.category || 'General'}
                      </span>
                      <span className="text-[9.5px] text-text-muted font-bold font-mono tabular-nums shrink-0">
                        {book.pagesCount}p
                      </span>
                    </div>

                    <h4
                      onClick={() => onSelectBook(book.id)}
                      className="font-bold text-text-primary text-xs sm:text-sm tracking-tight cursor-pointer hover:text-rose-600 transition-colors truncate"
                    >
                      {book.title}
                    </h4>
                    <p className="text-[10.5px] text-text-secondary truncate">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-x-auto shadow-subtle custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-surface-alt border-b border-border text-text-muted font-bold">
                    <th className="p-3 w-12">Cover</th>
                    <th className="p-3">Title & Author</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Pages</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3 w-16">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      onClick={() => onSelectBook(book.id)}
                      className="border-b border-border/50 hover:bg-surface-hover/30 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5">
                        <div className="w-8 aspect-[3/4] rounded overflow-hidden shadow-subtle">
                          <BookCover presetId={book.coverImage || 'cover-1'} title={book.title} showDetails={false} />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <div className="font-bold text-text-primary text-xs">{book.title}</div>
                        <div className="text-[10px] text-text-secondary mt-0.5">{book.author}</div>
                      </td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 rounded-full text-[9px] font-bold">
                          {book.category}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-text-secondary">{book.pagesCount}</td>
                      <td className="p-2.5 text-amber-500 font-bold text-[11px]">★ {book.rating || 5}</td>
                      <td className="p-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBook(book.id);
                          }}
                          className="px-2.5 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold hover:bg-rose-600 cursor-pointer"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Notebook Modal */}
      {isCreateModalOpen && (
        <CreateNotebookModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

export default LibraryDashboard;
