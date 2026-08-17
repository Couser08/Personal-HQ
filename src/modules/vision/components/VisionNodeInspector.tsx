import React, { useState, useEffect } from 'react';
import {
  IconChevronLeft,
  IconCheck,
  IconPlus,
  IconX,
  IconLink,
  IconTrash,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconMapPin,
  IconSparkles,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionNodeMapPin } from '../../../store/types';

interface VisionNodeInspectorProps {
  nodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Harmonious brand color swatches for Personal HQ
const BRAND_ACCENT_SWATCHES = [
  { name: 'Onyx / Brand Primary', value: '#111111' },
  { name: 'Sapphire Blue', value: '#3b82f6' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Sunset Amber', value: '#f59e0b' },
  { name: 'Rose Red', value: '#ef4444' },
  { name: 'Amethyst Violet', value: '#8b5cf6' },
  { name: 'Blush Pink', value: '#ec4899' },
  { name: 'Cyan Mineral', value: '#06b6d4' },
  { name: 'Slate Gray', value: '#64748b' },
];

const PRESET_PHOTO_ASSETS = [
  { name: 'Maldives Paradise', url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Minimalist Architecture', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Nordic Alpine Morning', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Tokyo Creative Studio', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop' },
  { name: 'Misty Pine Forest', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop' },
];

export const VisionNodeInspector: React.FC<VisionNodeInspectorProps> = ({
  nodeId,
  isOpen,
  onClose,
}) => {
  const {
    visionBoards,
    activeBoardId,
    updateVisionNode,
    deleteVisionNode,
    addToast,
    showConfirm,
  } = useAppStore();

  const activeBoard = visionBoards.find((b) => b.id === activeBoardId) || visionBoards[0];
  const node = activeBoard?.nodes.find((n) => n.id === nodeId);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(20);
  const [hasShadow, setHasShadow] = useState(true);
  const [hasBorder, setHasBorder] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [sizePreset, setSizePreset] = useState<'Small' | 'Medium' | 'Large' | 'Custom'>('Large');

  // Specialized attributes
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<number>(16);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [goalTarget, setGoalTarget] = useState<number>(50);
  const [goalCurrent, setGoalCurrent] = useState<number>(32);
  const [goalUnit, setGoalUnit] = useState<string>('books');
  const [quoteAuthor, setQuoteAuthor] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<string>('02:45');
  const [mapPins, setMapPins] = useState<VisionNodeMapPin[]>([]);
  const [newPinCity, setNewPinCity] = useState('');
  const [newPinNote, setNewPinNote] = useState('');

  useEffect(() => {
    if (node) {
      setTitle(node.title || '');
      setSubtitle(node.subtitle || '');
      setContent(node.content || '');
      setImageUrl(node.imageUrl || '');
      setAccentColor(node.accentColor || '#3b82f6');
      setTags(node.tags || []);
      setCornerRadius(node.cornerRadius !== undefined ? node.cornerRadius : 20);
      setHasShadow(node.hasShadow !== undefined ? node.hasShadow : true);
      setHasBorder(!!node.hasBorder);
      setLinkUrl(node.linkUrl || '');

      setFontFamily((node.fontFamily as any) || 'sans');
      setFontSize(node.fontSize || 16);
      setTextAlign(node.textAlign || 'left');
      setGoalTarget(node.goalTarget || 50);
      setGoalCurrent(node.goalCurrent || 32);
      setGoalUnit(node.goalUnit || 'books');
      setQuoteAuthor(node.quoteAuthor || '');
      setAudioDuration(node.audioDuration || '02:45');
      setMapPins(node.mapPins || []);

      const w = node.size?.width || 320;
      if (w <= 240) setSizePreset('Small');
      else if (w <= 320) setSizePreset('Medium');
      else if (w <= 380) setSizePreset('Large');
      else setSizePreset('Custom');
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleSave = async () => {
    let width = node.size?.width || 320;
    let height = node.size?.height || 220;

    if (sizePreset === 'Small') {
      width = 240;
      height = 180;
    } else if (sizePreset === 'Medium') {
      width = 320;
      height = 220;
    } else if (sizePreset === 'Large') {
      width = 360;
      height = 260;
    }

    const calculatedProgress =
      goalTarget > 0 ? Math.round((goalCurrent / goalTarget) * 100) : node.progress;

    await updateVisionNode(node.id, {
      title: title.trim() || 'Untitled Node',
      subtitle: subtitle.trim(),
      content: content.trim(),
      imageUrl: imageUrl.trim(),
      accentColor,
      tags,
      cornerRadius,
      hasShadow,
      hasBorder,
      linkUrl: linkUrl.trim(),
      fontFamily,
      fontSize,
      textAlign,
      goalTarget,
      goalCurrent,
      goalUnit,
      progress: calculatedProgress,
      quoteAuthor: quoteAuthor.trim(),
      audioDuration: audioDuration.trim(),
      mapPins,
      size: { width, height },
    });

    addToast('Changes Saved', `"${title || 'Node'}" customized successfully.`, 'success');
    onClose();
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    if (!tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddMapPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinCity.trim()) return;
    const newPin: VisionNodeMapPin = {
      id: crypto.randomUUID(),
      title: newPinCity.trim(),
      lat: 40 + Math.random() * 20,
      lng: -70 + Math.random() * 40,
      note: newPinNote.trim() || 'Destination to explore & create memories.',
    };
    setMapPins([...mapPins, newPin]);
    setNewPinCity('');
    setNewPinNote('');
  };

  const handleRemoveMapPin = (pinId: string) => {
    setMapPins(mapPins.filter((p) => p.id !== pinId));
  };

  const handleDelete = () => {
    showConfirm('Delete Node', 'Are you sure you want to remove this node from the canvas?', () => {
      deleteVisionNode(node.id);
      onClose();
    });
  };

  return (
    <>
      {/* Semi-transparent dark Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Slide-over Right Drawer Container */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[440px] bg-surface text-text-primary border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* TOP HEADER */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface/90 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[13px] font-bold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <IconChevronLeft size={18} />
            <span>Back to Canvas</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-text-primary text-text-on-accent text-[12.5px] font-black uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* Card Preview Banner */}
          <div className="relative h-44 rounded-2xl bg-surface-alt border border-border overflow-hidden shadow-xs">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-tertiary gap-2 bg-gradient-to-br from-surface-alt to-surface">
                <IconSparkles size={36} className="text-primary/40" />
                <span className="text-xs font-bold text-text-secondary">{node.type.toUpperCase()} NODE</span>
              </div>
            )}

            {/* High-Contrast Pill Tag on Preview */}
            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-border text-text-primary text-[12px] font-black tracking-wide shadow-md flex items-center gap-1.5">
              <span>{title || 'Node Preview'}</span>
              <IconSparkles size={13} className="text-primary" />
            </div>
          </div>

          {/* Core Fields: Title & Subtitle */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
                Node Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dream Studio"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-[13.5px] font-bold text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-1">
                Subtitle / Category
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. 2026 Milestone"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-alt border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* ── TYPE-SPECIFIC CUSTOMIZATION ── */}

          {/* 1. IMAGE NODE CONTROLS */}
          {node.type === 'image' && (
            <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
              <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Image Source &amp; Presets
              </span>
              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste Image URL (https://...)"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[12.5px] text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Quick Presets */}
              <div>
                <span className="block text-[10px] font-bold text-text-tertiary mb-1.5">
                  Or pick a curated wallpaper:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_PHOTO_ASSETS.map((asset) => (
                    <button
                      key={asset.name}
                      type="button"
                      onClick={() => setImageUrl(asset.url)}
                      className={`p-2 rounded-xl text-[11px] font-bold text-left truncate transition-all cursor-pointer border ${
                        imageUrl === asset.url
                          ? 'bg-primary text-text-on-accent border-primary'
                          : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
                      }`}
                    >
                      {asset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. TEXT / TYPOGRAPHY CONTROLS */}
          {node.type === 'text' && (
            <div className="space-y-4 p-4 rounded-2xl bg-surface-alt/60 border border-border">
              <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Typography &amp; Layout
              </span>

              {/* Body Text */}
              <div>
                <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                  Body Content
                </label>
                <textarea
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Express your vision statement..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Font Family */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-text-secondary">Font Family</span>
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                  {(['sans', 'serif', 'mono'] as const).map((font) => (
                    <button
                      key={font}
                      type="button"
                      onClick={() => setFontFamily(font)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                        fontFamily === font
                          ? 'bg-text-primary text-text-on-accent'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-text-secondary">Alignment</span>
                <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setTextAlign('left')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      textAlign === 'left' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
                    }`}
                  >
                    <IconAlignLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('center')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      textAlign === 'center' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
                    }`}
                  >
                    <IconAlignCenter size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign('right')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      textAlign === 'right' ? 'bg-text-primary text-text-on-accent' : 'text-text-secondary'
                    }`}
                  >
                    <IconAlignRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. GOAL / PROGRESS CONTROLS */}
          {node.type === 'goal' && (
            <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
              <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Progress &amp; Metric Tracker
              </span>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                    Current
                  </label>
                  <input
                    type="number"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[13px] font-bold text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[13px] font-bold text-text-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value)}
                    placeholder="books, km"
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. QUOTE CONTROLS */}
          {node.type === 'quote' && (
            <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
              <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Quote &amp; Attribution
              </span>
              <div>
                <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                  Quote Phrase
                </label>
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Inspirational words..."
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={quoteAuthor}
                  onChange={(e) => setQuoteAuthor(e.target.value)}
                  placeholder="e.g. Marcus Aurelius"
                  className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* 5. MAP DESTINATION PINS */}
          {node.type === 'map' && (
            <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
              <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
                Destination Pins ({mapPins.length})
              </span>

              {/* Pins List */}
              <div className="space-y-2">
                {mapPins.map((pin) => (
                  <div
                    key={pin.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border text-[12px]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <IconMapPin size={15} className="text-primary shrink-0" />
                      <span className="font-bold text-text-primary truncate">{pin.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMapPin(pin.id)}
                      className="p-1 text-text-tertiary hover:text-danger cursor-pointer"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Pin Form */}
              <form onSubmit={handleAddMapPin} className="space-y-2 pt-1">
                <input
                  type="text"
                  value={newPinCity}
                  onChange={(e) => setNewPinCity(e.target.value)}
                  placeholder="Add Destination City (e.g. Paris)"
                  className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-[12px] text-text-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!newPinCity.trim()}
                  className="w-full py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-[12px] font-bold text-text-primary cursor-pointer flex items-center justify-center gap-1"
                >
                  <IconPlus size={14} />
                  <span>Add Destination Pin</span>
                </button>
              </form>
            </div>
          )}

          {/* ── ACCENT COLOR PALETTE ── */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary mb-2">
              Brand Accent Color
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {BRAND_ACCENT_SWATCHES.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => setAccentColor(swatch.value)}
                  style={{ backgroundColor: swatch.value }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer relative shadow-xs ${
                    accentColor === swatch.value
                      ? 'scale-125 ring-2 ring-primary ring-offset-2'
                      : 'hover:scale-110'
                  }`}
                  title={swatch.name}
                >
                  {accentColor === swatch.value && (
                    <IconCheck
                      size={14}
                      className="text-white absolute inset-0 m-auto"
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-7 h-7 rounded-full border border-border cursor-pointer bg-transparent"
                title="Custom Hex Picker"
              />
            </div>
          </div>

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
                max="32"
                value={cornerRadius}
                onChange={(e) => setCornerRadius(parseInt(e.target.value, 10))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Shadow Toggle */}
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

            {/* Border Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-text-primary">Hairline Border</span>
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
        </div>

        {/* BOTTOM FOOTER CONTROLS */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-border bg-surface-alt/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 text-[12px] font-bold transition-colors cursor-pointer"
          >
            <IconTrash size={16} />
            <span>Delete Node</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-text-primary text-text-on-accent font-black uppercase tracking-wider text-[12px] hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};
