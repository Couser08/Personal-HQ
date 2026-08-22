import React from 'react';
import { IconLink, IconPlus, IconX } from '@tabler/icons-react';

interface CardStylingControlsProps {
  tags: string[];
  isAddingTag: boolean;
  setIsAddingTag: (a: boolean) => void;
  newTagInput: string;
  setNewTagInput: (t: string) => void;
  handleAddTag: (e: React.FormEvent) => void;
  handleRemoveTag: (t: string) => void;
  sizePreset: 'Small' | 'Medium' | 'Large' | 'Custom';
  setSizePreset: (s: 'Small' | 'Medium' | 'Large' | 'Custom') => void;
  cornerRadius: number;
  setCornerRadius: (r: number) => void;
  hasBorder: boolean;
  setHasBorder: (b: boolean) => void;
  hasShadow: boolean;
  setHasShadow: (s: boolean) => void;
  linkUrl: string;
  setLinkUrl: (l: string) => void;
}

export const CardStylingControls: React.FC<CardStylingControlsProps> = ({
  tags,
  isAddingTag,
  setIsAddingTag,
  newTagInput,
  setNewTagInput,
  handleAddTag,
  handleRemoveTag,
  sizePreset,
  setSizePreset,
  cornerRadius,
  setCornerRadius,
  hasBorder,
  setHasBorder,
  hasShadow,
  setHasShadow,
  linkUrl,
  setLinkUrl,
}) => {
  return (
    <>
      {/* ── TAGS SECTION ── */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-2">
          Category Tags
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt text-text-primary border border-border text-[12px] font-bold shadow-xs hover:border-border-alt transition-colors"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-text-tertiary hover:text-danger cursor-pointer ml-0.5"
                aria-label={`Remove tag ${tag}`}
              >
                <IconX size={13} />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <form onSubmit={handleAddTag} className="inline-flex">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="New tag..."
                className="px-3 py-1 rounded-xl bg-surface border border-primary text-[12px] text-text-primary focus:outline-none w-28 font-semibold"
                autoFocus
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingTag(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-border hover:border-primary text-[12px] font-bold text-text-tertiary hover:text-primary cursor-pointer transition-colors bg-surface"
            >
              <IconPlus size={13} />
              <span>Add tag</span>
            </button>
          )}
        </div>
      </div>

      {/* ── UNIVERSAL CARD SETTINGS ── */}
      <div className="space-y-4 pt-4 border-t border-border">
        <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
          Card Dimensions &amp; Styling
        </span>

        {/* Size Preset */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-text-primary">Size Preset</span>
          <div className="flex items-center gap-1 bg-surface-alt p-1 rounded-xl border border-border">
            {(['Small', 'Medium', 'Large'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSizePreset(s)}
                className={`px-3 py-1 rounded-lg text-[11.5px] font-bold transition-colors cursor-pointer ${
                  sizePreset === s
                    ? 'bg-text-primary text-text-on-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Corner Radius Slider */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[13px] font-bold">
            <span className="text-text-primary">Corner Radius</span>
            <span className="text-text-secondary font-mono">{cornerRadius}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="36"
            value={cornerRadius}
            onChange={(e) => setCornerRadius(parseInt(e.target.value, 10))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Hairline Border Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-bold text-text-primary block">Hairline Border</span>
            <span className="text-[10.5px] text-text-tertiary font-medium">Crisp high-contrast edge outline</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={hasBorder}
            onClick={() => setHasBorder(!hasBorder)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
              hasBorder ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                hasBorder ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Ambient Shadow Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-text-primary">Ambient Shadow</span>
          <button
            type="button"
            role="switch"
            aria-checked={hasShadow}
            onClick={() => setHasShadow(!hasShadow)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative ${
              hasShadow ? 'bg-primary' : 'bg-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                hasShadow ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* External Link */}
        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
            Attach External Link / Notion
          </label>
          <div className="flex items-center gap-2">
            <IconLink size={16} className="text-text-tertiary shrink-0" />
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-surface-alt border border-border text-[12px] text-text-primary focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>
    </>
  );
};
