import React, { useState, useEffect } from 'react';
import {
  IconChevronLeft,
  IconX,
  IconTrash,
  IconSparkles,
} from '@tabler/icons-react';
import { useAppStore } from '../../../store/useAppStore';
import { useToastStore } from '../../../store/useToastStore';
import type { VisionNodeMapPin } from '../../../store/types';
import { BackgroundControls } from './inspector/BackgroundControls';
import { TypographyControls } from './inspector/TypographyControls';
import { NodeTypeControls } from './inspector/NodeTypeControls';
import { CardStylingControls } from './inspector/CardStylingControls';

interface VisionNodeInspectorProps {
  nodeId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

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
    showConfirm,
  } = useAppStore();

  const addToast = useToastStore((s) => s.addToast);

  const activeBoard = visionBoards.find((b) => b.id === activeBoardId) || visionBoards[0];
  const node = activeBoard?.nodes.find((n) => n.id === nodeId);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [bgStyle, setBgStyle] = useState<'solid' | 'gradient' | 'glass' | 'pastel'>('solid');
  const [textColor, setTextColor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(20);
  const [hasShadow, setHasShadow] = useState(true);
  const [hasBorder, setHasBorder] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [sizePreset, setSizePreset] = useState<'Small' | 'Medium' | 'Large' | 'Custom'>('Large');

  // Rich Typography attributes
  const [fontFamily, setFontFamily] = useState<string>('sans');
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontWeight, setFontWeight] = useState<'normal' | 'medium' | 'bold' | 'black'>('bold');
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [isUppercase, setIsUppercase] = useState<boolean>(true);
  const [letterSpacing, setLetterSpacing] = useState<'tight' | 'normal' | 'wide' | 'widest'>('tight');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  // Specialized fields
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
      setBgStyle(node.bgStyle || 'solid');
      setTextColor(node.textColor || '');
      setTags(node.tags || []);
      setCornerRadius(node.cornerRadius !== undefined ? node.cornerRadius : 20);
      setHasShadow(node.hasShadow !== undefined ? node.hasShadow : true);
      setHasBorder(!!node.hasBorder);
      setLinkUrl(node.linkUrl || '');

      setFontFamily(node.fontFamily || 'sans');
      setFontSize(node.fontSize || 20);
      setFontWeight(node.fontWeight || 'bold');
      setIsItalic(node.fontStyle === 'italic');
      setIsUppercase(node.isUppercase !== false);
      setLetterSpacing(node.letterSpacing || 'tight');
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
      bgStyle,
      textColor: textColor.trim() || undefined,
      tags,
      cornerRadius,
      hasShadow,
      hasBorder,
      linkUrl: linkUrl.trim(),
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle: isItalic ? 'italic' : 'normal',
      isUppercase,
      letterSpacing,
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
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="fixed top-0 bottom-0 right-0 z-50 w-full sm:w-[460px] bg-surface text-text-primary border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
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
          <div
            className="relative h-44 rounded-2xl border overflow-hidden shadow-xs transition-all flex flex-col justify-center items-center p-4 text-center"
            style={{
              backgroundColor:
                node.type === 'quote'
                  ? accentColor
                  : bgStyle === 'solid'
                  ? accentColor
                  : bgStyle === 'pastel'
                  ? accentColor
                  : 'var(--color-surface-alt)',
              borderColor: hasBorder ? 'var(--color-border-alt)' : 'var(--color-border)',
              borderWidth: hasBorder ? '2px' : '1px',
            }}
          >
            {imageUrl && node.type === 'image' ? (
              <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="relative z-10 flex flex-col items-center justify-center gap-1">
                <span
                  className={`text-lg font-black tracking-tight leading-tight uppercase ${
                    fontFamily === 'serif'
                      ? 'font-serif'
                      : fontFamily === 'mono'
                      ? 'font-mono-code'
                      : fontFamily === 'caveat'
                      ? 'font-caveat text-2xl normal-case'
                      : fontFamily === 'syne'
                      ? 'font-syne'
                      : 'font-sans'
                  } ${isItalic ? 'italic' : ''}`}
                  style={{ color: textColor || 'inherit' }}
                >
                  {title || 'Node Preview'}
                </span>
                {subtitle && <span className="text-[11px] font-semibold opacity-75">{subtitle}</span>}
                {content && (
                  <p className="text-[12px] opacity-85 mt-1 line-clamp-2 max-w-[280px]">{content}</p>
                )}
              </div>
            )}

            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-md border border-border text-text-primary text-[12px] font-black tracking-wide shadow-md flex items-center gap-1.5 z-20">
              <span>{title || 'Node Preview'}</span>
              <IconSparkles size={13} className="text-primary" />
            </div>
          </div>

          {/* Core Fields */}
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

          <BackgroundControls
            bgStyle={bgStyle}
            setBgStyle={setBgStyle}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
          />

          <TypographyControls
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontWeight={fontWeight}
            setFontWeight={setFontWeight}
            isItalic={isItalic}
            setIsItalic={setIsItalic}
            isUppercase={isUppercase}
            setIsUppercase={setIsUppercase}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
            letterSpacing={letterSpacing}
            setLetterSpacing={setLetterSpacing}
            textColor={textColor}
            setTextColor={setTextColor}
          />

          <NodeTypeControls
            nodeType={node.type}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            content={content}
            setContent={setContent}
            goalCurrent={goalCurrent}
            setGoalCurrent={setGoalCurrent}
            goalTarget={goalTarget}
            setGoalTarget={setGoalTarget}
            goalUnit={goalUnit}
            setGoalUnit={setGoalUnit}
            quoteAuthor={quoteAuthor}
            setQuoteAuthor={setQuoteAuthor}
            mapPins={mapPins}
            newPinCity={newPinCity}
            setNewPinCity={setNewPinCity}
            handleAddMapPin={handleAddMapPin}
            handleRemoveMapPin={handleRemoveMapPin}
          />

          <CardStylingControls
            tags={tags}
            isAddingTag={isAddingTag}
            setIsAddingTag={setIsAddingTag}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            handleAddTag={handleAddTag}
            handleRemoveTag={handleRemoveTag}
            sizePreset={sizePreset}
            setSizePreset={setSizePreset}
            cornerRadius={cornerRadius}
            setCornerRadius={setCornerRadius}
            hasBorder={hasBorder}
            setHasBorder={setHasBorder}
            hasShadow={hasShadow}
            setHasShadow={setHasShadow}
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
          />
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
