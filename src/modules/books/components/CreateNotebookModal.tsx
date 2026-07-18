import React, { useState } from 'react';
import { IconX, IconBook, IconUser, IconStar, IconPhoto, IconPlus } from '@tabler/icons-react';
import { PRESET_COVERS, BookCover } from '../utils/presetCovers';
import { useAppStore } from '../../../store/useAppStore';
import { type Book } from '../../../store/types';

interface CreateNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({ isOpen, onClose }) => {
  const { addBook } = useAppStore();
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedPresetId, setSelectedPresetId] = useState('purple-mountain');
  const [category, setCategory] = useState('Fiction');

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;

    const newBook: Book = {
      id: `book-${Date.now()}`,
      title: name,
      author: author || 'Unknown Author',
      tagline: 'Click Edit Mode to add a summary or subtitle.',
      rating,
      coverImage: selectedPresetId,
      pagesCount: 100,
      category,
      isFavorite: false,
      readingList: true,
      audiobook: false,
      progress: 0,
      currentPage: 1,
      pages: {
        1: `Welcome to your new notebook "${name}"!\n\nThis is page 1. Click the "Edit Mode" button at the top right to start writing, format your text, highlight sections, or insert sticky notes.`
      },
      topics: [
        { id: `t-${Date.now()}`, title: 'First Topic', pageNumber: 1, color: 'blue' }
      ],
      stickyNotes: [],
      bookmarks: [1],
      highlights: [],
      createdAt: new Date().toISOString()
    };

    await addBook(newBook);
    onClose();
    setName('');
    setAuthor('');
    setRating(0);
    setSelectedPresetId('purple-mountain');
    setCategory('Fiction');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 duration-200 bg-zinc-950/45 dark:bg-black/65 backdrop-blur-[4px] animate-in fade-in">
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800/60">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Create New Notebook</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Fill in the details below to initialize your workspace.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/40 rounded-lg transition-colors cursor-pointer text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto text-left scrollbar-thin">
          
          {/* Row 1: Name & Author (Grid structure maps cleaner on web views) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Notebook Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                <IconBook size={13} className="text-rose-500 dark:text-rose-400" />
                Notebook Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Chemistry Revision"
                  className="w-full py-2 pl-3 pr-12 text-sm transition-all border bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
                  {name.length}/50
                </span>
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                <IconUser size={13} className="text-rose-500 dark:text-rose-400" />
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name or 'Unknown'"
                className="w-full px-3 py-2 text-sm transition-all border bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 focus:ring-2 focus:ring-rose-500/10 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Row 2: Category & Rating */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                <IconBook size={13} className="text-rose-500 dark:text-rose-400" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm transition-all border appearance-none cursor-pointer bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 rounded-xl focus:outline-none focus:border-rose-500 dark:focus:border-rose-400 text-zinc-900 dark:text-zinc-100"
                style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundPosition: 'right 0.75rem center', backgroundSize: '16px', backgroundRepeat: 'no-repeat' }}
              >
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Biography">Biography</option>
                <option value="Self-Help">Self-Help</option>
              </select>
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                <IconStar size={13} className="text-rose-500 dark:text-rose-400" />
                Initial Rating
              </label>
              <div className="h-[38px] flex items-center justify-between px-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <IconStar
                        size={16}
                        fill={star <= (hoverRating || rating) ? '#F59E0B' : 'transparent'}
                        color={star <= (hoverRating || rating) ? '#F59E0B' : '#9CA3AF'}
                        strokeWidth={star <= (hoverRating || rating) ? 1.5 : 2}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {rating > 0 ? `${rating} / 5` : 'Unrated'}
                </span>
              </div>
            </div>
          </div>

          {/* Cover Style Selector */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-[11px] font-medium tracking-wide text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                <IconPhoto size={13} className="text-rose-500 dark:text-rose-400" />
                Cover Design
              </label>
              
              <label className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors active:scale-[0.97] transition-transform flex items-center gap-1">
                <IconPlus size={10} /> Upload Image Cover (3:4 ratio - JPG, PNG)
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setSelectedPresetId(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-6 gap-2.5">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer active:scale-[0.97] ${
                    selectedPresetId === preset.id 
                      ? 'border-rose-500 dark:border-rose-400 scale-[1.03] shadow-md shadow-rose-500/5' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  <BookCover presetId={preset.id} title={name || 'Untitled'} showDetails={false} />
                </button>
              ))}

              {/* Show Custom Upload Cover Option if selectedPresetId is Base64 */}
              {selectedPresetId.startsWith('data:image/') && (
                <button
                  type="button"
                  onClick={() => {}}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-rose-500 dark:border-rose-400 scale-[1.03] shadow-md p-0.5 cursor-default"
                >
                  <BookCover presetId={selectedPresetId} title={name || 'Untitled'} showDetails={false} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-[9px] font-bold text-white uppercase tracking-wider">
                    Uploaded
                  </div>
                </button>
              )}
            </div>

            {/* Active Status Info */}
            <div className="flex items-center gap-3 p-3 transition-all border bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800/80 rounded-xl">
              <div className="p-2 text-rose-500 rounded-lg bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400">
                <IconPhoto size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Active Theme</span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  {selectedPresetId.startsWith('data:image/') 
                    ? 'Uploaded Custom Image Cover' 
                    : `${PRESET_COVERS.find((c) => c.id === selectedPresetId)?.name || 'Default'} Style`}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium transition-colors bg-white border cursor-pointer border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.97] transition-transform duration-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={`px-4 py-2 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-[0.97] transition-transform ${
              name.trim() 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-sm' 
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed'
            }`}
          >
            <IconPlus size={14} />
            Create Notebook
          </button>
        </div>

      </div>
    </div>
  );
};