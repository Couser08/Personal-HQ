import React, { useState, useMemo } from 'react';
import {
  IconSearch,
  IconX,
  IconHeart,
  IconHeartFilled,
  IconMessageCircle,
  IconPlus,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';

interface VisionDiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InspirationItem {
  id: string;
  title: string;
  category: 'Travel' | 'Career' | 'Health' | 'Style';
  imageUrl: string;
  authorName: string;
  authorAvatar: string;
  likes: number;
  comments: number;
  tags: string[];
}

const INSPIRATION_ITEMS: InspirationItem[] = [
  {
    id: 'insp-1',
    title: 'Maldives trip retreat and coastal bliss',
    category: 'Travel',
    imageUrl: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Anushka',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    likes: 1240,
    comments: 32,
    tags: ['Travel', 'Ocean', 'Resort'],
  },
  {
    id: 'insp-2',
    title: 'Minimalist Architecture & Design Studio',
    category: 'Career',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Anushka',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    likes: 842,
    comments: 18,
    tags: ['Design', 'Studio', 'Workspace'],
  },
  {
    id: 'insp-3',
    title: 'Nordic Alpine Morning & Mindful Living',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Elena',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    likes: 2150,
    comments: 54,
    tags: ['Mindfulness', 'Nature', 'Serenity'],
  },
  {
    id: 'insp-4',
    title: 'Cybernetic Tokyo Creative Lab',
    category: 'Style',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop',
    authorName: 'Kenji',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    likes: 970,
    comments: 41,
    tags: ['Tokyo', 'Neon', 'Tech'],
  },
];

export const VisionDiscoverModal: React.FC<VisionDiscoverModalProps> = ({
  isOpen,
  onClose,
}) => {
  const addVisionNode = useAppStore((s) => s.addVisionNode);
  const addToast = useToastStore((s) => s.addToast);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    return INSPIRATION_ITEMS.filter((item) => {
      if (activeCategory !== 'All' && item.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleImportToBoard = async (item: InspirationItem) => {
    await addVisionNode({
      type: 'image',
      title: item.title,
      subtitle: item.category,
      imageUrl: item.imageUrl,
      tags: item.tags,
      cornerRadius: 24,
      hasShadow: true,
    });

    setImportedIds((prev) => new Set([...prev, item.id]));
    addToast('Imported to Canvas', `"${item.title}" added to your active board.`, 'success');
  };

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[540px] md:w-[680px] max-h-[88vh] bg-surface border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-border bg-surface/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-surface-alt border border-border flex items-center justify-center shadow-xs">
              <IconSparkles size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-text-primary uppercase tracking-tight leading-tight">
                Discover Inspiration
              </h2>
              <p className="text-[11.5px] font-semibold text-text-tertiary">
                Curated aesthetic vision templates for your boards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-surface-alt hover:bg-surface text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Search & Category Filter Chips */}
        <div className="p-4 sm:p-5 pb-2 space-y-3 bg-surface-alt/40 border-b border-border/60">
          <div className="relative">
            <IconSearch
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inspiration..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-surface border border-border text-[13px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary font-medium"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {(['All', 'Travel', 'Career', 'Health', 'Style'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-text-primary text-text-on-accent shadow-xs'
                    : 'bg-surface hover:bg-surface-alt text-text-secondary border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 custom-scrollbar">
          {filteredItems.map((item) => {
            const isLiked = likedIds.has(item.id);
            const isImported = importedIds.has(item.id);

            return (
              <div
                key={item.id}
                className="bg-surface rounded-2xl border border-border overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                <div className="relative h-44 bg-surface-alt overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-surface/90 backdrop-blur-md text-[10.5px] font-black text-text-primary uppercase border border-border shadow-xs">
                    {item.category}
                  </div>
                </div>

                <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                  <div>
                    <h3 className="font-extrabold text-[13.5px] text-text-primary line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  {/* Author & Interactions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <img
                        src={item.authorAvatar}
                        alt={item.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-[11.5px] font-bold text-text-secondary">
                        {item.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleLike(item.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-text-tertiary hover:text-rose-500 cursor-pointer"
                      >
                        {isLiked ? (
                          <IconHeartFilled size={14} className="text-rose-500" />
                        ) : (
                          <IconHeart size={14} />
                        )}
                        <span>{item.likes + (isLiked ? 1 : 0)}</span>
                      </button>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-text-tertiary">
                        <IconMessageCircle size={14} />
                        <span>{item.comments}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Board Button */}
                  <button
                    type="button"
                    disabled={isImported}
                    onClick={() => handleImportToBoard(item)}
                    className={`w-full py-2.5 px-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isImported
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-text-primary text-text-on-accent hover:opacity-90 shadow-xs'
                    }`}
                  >
                    {isImported ? (
                      <>
                        <IconCheck size={15} />
                        <span>Added to Canvas</span>
                      </>
                    ) : (
                      <>
                        <IconPlus size={15} />
                        <span>Add to Canvas</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
