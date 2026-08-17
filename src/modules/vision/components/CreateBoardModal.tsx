import React, { useState } from 'react';
import {
  IconX,
  IconPlus,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoardCategory } from '../../../store/types';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOJI_ICONS = ['✨', '🎯', '🌿', '🚀', '💡', '🌊', '🎨', '🏛️', '💎', '🏝️', '📖', '⚡'];

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createBoard, addToast } = useAppStore();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState<VisionBoardCategory>('PERSONAL');
  const [icon, setIcon] = useState('✨');
  const [isFavorite, setIsFavorite] = useState(false);
  const [theme, setTheme] = useState<'dots' | 'grid' | 'blank'>('dots');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createBoard({
      title: title.trim(),
      subtitle: subtitle.trim(),
      category,
      icon,
      isFavorite,
      theme,
      nodes: [],
    });

    addToast('Board Created', `"${title.trim()}" vision board is ready.`, 'success');
    setTitle('');
    setSubtitle('');
    onClose();
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[480px] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-surface-alt border border-border flex items-center justify-center shadow-xs">
              <IconPlus size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary uppercase tracking-tight">
                New Vision Board
              </h2>
              <p className="text-[11.5px] font-semibold text-text-tertiary">
                Create a fresh canvas workspace
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Icon Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1.5">
              Board Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {EMOJI_ICONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setIcon(em)}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                    icon === em
                      ? 'bg-surface border-2 border-primary scale-110 shadow-xs ring-1 ring-primary/30'
                      : 'bg-surface-alt hover:bg-surface border border-border'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
              Board Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dream Career 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-[13px] font-bold text-text-primary focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
              Subtitle / Theme
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Master-Level Architecture & Leadership"
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['FAVORITES', 'PERSONAL', 'CAREER', 'LIFESTYLE', 'OTHER'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer capitalize text-center ${
                    category === cat
                      ? 'bg-text-primary text-text-on-accent shadow-xs'
                      : 'bg-surface-alt hover:bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {cat.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Matrix Mode */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
              Canvas Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dots', 'grid', 'blank'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`py-2 px-2.5 rounded-xl text-[11.5px] font-bold transition-all cursor-pointer capitalize text-center ${
                    theme === t
                      ? 'bg-text-primary text-text-on-accent shadow-xs'
                      : 'bg-surface-alt hover:bg-surface border border-border text-text-secondary'
                  }`}
                >
                  {t === 'dots' ? '● Dot Matrix' : t === 'grid' ? '# Square Grid' : '○ Clean Blank'}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-bold text-text-secondary hover:text-text-primary cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!title.trim()}
              className="px-6 py-2.5 rounded-xl bg-text-primary text-text-on-accent font-black uppercase tracking-wider text-[12px] hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
