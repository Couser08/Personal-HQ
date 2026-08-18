import React, { useState, useRef, useEffect } from 'react';
import {
  IconDots,
  IconPlayerPlay,
  IconPlayerPause,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconBook,
  IconLink,
  IconTrash,
  IconCopy,
  IconAdjustments,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
} from '@tabler/icons-react';
import type { VisionNode } from '../../../store/types';

interface VisionNodeProps {
  node: VisionNode;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent | React.TouchEvent) => void;
  onInspect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<VisionNode>) => void;
  onStartDrag: (e: React.MouseEvent | React.TouchEvent) => void;
  onStartResize: (e: React.MouseEvent | React.TouchEvent, handle: string) => void;
}

export const VisionNodeCard: React.FC<VisionNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onInspect,
  onDuplicate,
  onDelete,
  onUpdate,
  onStartDrag,
  onStartResize,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLiked, setIsLiked] = useState(node.isFavorite || false);
  const [activeMapPinIndex, setActiveMapPinIndex] = useState(0);

  // Web Audio ambient tone player for Lo-Fi audio node
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPlayingAudio) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioCtxRef.current = ctx;
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsPlayingAudio(true);
      } catch {
        setIsPlayingAudio(true);
      }
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !isLiked;
    setIsLiked(next);
    onUpdate({ isFavorite: next });
  };

  const width = node.size?.width || 320;
  const height = node.size?.height || 220;
  const cornerRadius = node.cornerRadius !== undefined ? node.cornerRadius : 20;

  // Typography helper classes
  const getFontFamilyClass = (family?: string) => {
    if (family === 'serif') return 'font-serif';
    if (family === 'mono') return 'font-mono-code';
    if (family === 'caveat' || family === 'cursive') return 'font-caveat';
    if (family === 'syne' || family === 'display') return 'font-syne';
    return 'font-sans';
  };

  const getFontWeightClass = (weight?: string) => {
    if (weight === 'normal') return 'font-normal';
    if (weight === 'medium') return 'font-medium';
    if (weight === 'bold') return 'font-bold';
    if (weight === 'black') return 'font-black';
    return 'font-bold';
  };

  const getLetterSpacingClass = (spacing?: string) => {
    if (spacing === 'tight') return 'tracking-tight';
    if (spacing === 'normal') return 'tracking-normal';
    if (spacing === 'wide') return 'tracking-wide';
    if (spacing === 'widest') return 'tracking-widest';
    return 'tracking-tight';
  };

  // Card Background Calculation
  const isQuoteOrAffirmation = node.type === 'quote';
  const isText = node.type === 'text';

  const cardBgColor = (() => {
    if (isQuoteOrAffirmation) {
      return node.accentColor || '#fef08a';
    }
    if (isText) {
      if (node.bgStyle === 'solid' || (!node.bgStyle && node.accentColor && node.accentColor !== '#3b82f6')) {
        return node.accentColor || 'var(--color-surface, #ffffff)';
      }
      if (node.bgStyle === 'pastel' && node.accentColor) {
        return node.accentColor;
      }
    }
    return 'var(--color-surface, #ffffff)';
  })();

  return (
    <div
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translate3d(${node.position.x}px, ${node.position.y}px, 0)`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex: isSelected ? 30 : 10,
      }}
      onMouseDown={(e) => {
        onSelect(e);
        onStartDrag(e);
      }}
      onTouchStart={(e) => {
        onSelect(e);
        onStartDrag(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onInspect();
      }}
    >
      {/* SELECTION BOUNDING BOX & 8 RESIZE HANDLES */}
      {isSelected && (
        <>
          <div className="absolute -inset-[3px] border-2 border-primary border-dashed rounded-[calc(var(--radius-card,24px)+4px)] pointer-events-none z-40" />

          {/* Live Dimensions Badge */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-text-primary text-text-on-accent text-[10.5px] font-black tracking-wider shadow-md pointer-events-none z-50 whitespace-nowrap">
            {width} &times; {height}
          </div>

          {/* Quick Floating Action Pill on selected card */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-border rounded-full px-2 py-1 shadow-lg flex items-center gap-1.5 z-50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onInspect();
              }}
              className="p-1 rounded-full hover:bg-surface-alt text-text-secondary hover:text-text-primary cursor-pointer"
              title="Edit Node Properties"
            >
              <IconAdjustments size={15} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="p-1 rounded-full hover:bg-surface-alt text-text-secondary hover:text-text-primary cursor-pointer"
              title="Duplicate Node"
            >
              <IconCopy size={15} />
            </button>
            <div className="w-[1px] h-3.5 bg-border" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 rounded-full hover:bg-rose-500/10 text-rose-500 cursor-pointer"
              title="Delete Node"
            >
              <IconTrash size={15} />
            </button>
          </div>

          {/* 8 Resize Handles */}
          {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
            let posClass = '';
            if (handle === 'nw') posClass = '-top-1.5 -left-1.5 cursor-nwse-resize';
            if (handle === 'n') posClass = '-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
            if (handle === 'ne') posClass = '-top-1.5 -right-1.5 cursor-nesw-resize';
            if (handle === 'e') posClass = 'top-1/2 -translate-y-1/2 -right-1.5 cursor-ew-resize';
            if (handle === 'se') posClass = '-bottom-1.5 -right-1.5 cursor-nwse-resize';
            if (handle === 's') posClass = '-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize';
            if (handle === 'sw') posClass = '-bottom-1.5 -left-1.5 cursor-nesw-resize';
            if (handle === 'w') posClass = 'top-1/2 -translate-y-1/2 -left-1.5 cursor-ew-resize';

            return (
              <div
                key={handle}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onStartResize(e, handle);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onStartResize(e, handle);
                }}
                className={`absolute w-3.5 h-3.5 rounded-full bg-surface border-2 border-primary shadow-xs z-50 hover:scale-125 transition-transform ${posClass}`}
              />
            );
          })}
        </>
      )}

      {/* NODE CARD CONTAINER */}
      <div
        className={`w-full h-full relative overflow-hidden transition-all duration-200 flex flex-col group ${
          node.hasShadow
            ? 'shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.12)]'
            : ''
        } ${
          node.hasBorder
            ? 'border-[1.5px] border-border-alt ring-1 ring-border-alt/70'
            : 'border border-border/40'
        }`}
        style={{
          borderRadius: `${cornerRadius}px`,
          backgroundColor: cardBgColor,
        }}
      >
        {/* ── 1. IMAGE NODE ── */}
        {node.type === 'image' && (
          <div className="w-full h-full relative overflow-hidden">
            <img
              src={
                node.imageUrl ||
                'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1000&auto=format&fit=crop'
              }
              alt={node.title}
              className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
            />
            {/* Top Right Action Menu */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-8 h-8 rounded-full bg-surface/80 backdrop-blur-md text-text-primary flex items-center justify-center hover:bg-surface transition-colors cursor-pointer shadow-xs"
              >
                <IconDots size={16} />
              </button>
            </div>

            {/* Bottom Left Frosted Tag Pill with High Contrast */}
            <div className="absolute bottom-3 left-3 z-20">
              <span className="px-3.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-md text-[12px] font-black uppercase tracking-wider text-text-primary border border-border shadow-md">
                {node.title}
              </span>
            </div>
          </div>
        )}

        {/* ── 2. TEXT / TYPOGRAPHY NODE ── */}
        {node.type === 'text' && (
          <div
            className={`w-full h-full p-6 flex flex-col justify-between relative text-text-primary ${
              node.bgStyle === 'gradient'
                ? 'bg-gradient-to-br from-rose-100/70 via-purple-100/60 to-teal-100/70 dark:from-rose-950/40 dark:via-purple-950/30 dark:to-teal-950/40'
                : node.bgStyle === 'glass'
                ? 'bg-surface/80 backdrop-blur-xl'
                : ''
            }`}
            style={{
              color: node.textColor || undefined,
            }}
          >
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-7 h-7 rounded-full bg-surface-alt/80 text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <IconDots size={15} />
              </button>
            </div>

            <div
              className={`flex flex-col my-auto px-2 ${
                node.textAlign === 'center'
                  ? 'items-center text-center'
                  : node.textAlign === 'right'
                  ? 'items-end text-right'
                  : 'items-start text-left'
              }`}
            >
              <h2
                className={`leading-tight ${getFontFamilyClass(node.fontFamily)} ${getFontWeightClass(
                  node.fontWeight
                )} ${getLetterSpacingClass(node.letterSpacing)} ${
                  node.isUppercase !== false ? 'uppercase' : ''
                } ${node.fontStyle === 'italic' ? 'italic' : ''}`}
                style={{ fontSize: `${node.fontSize || 22}px` }}
              >
                {node.title}
              </h2>
              {node.subtitle && (
                <span className="text-[12px] font-bold text-text-tertiary mt-1">
                  {node.subtitle}
                </span>
              )}
              {node.content && (
                <p className="text-[12.5px] text-text-secondary mt-2 line-clamp-3 leading-relaxed">
                  {node.content}
                </p>
              )}
            </div>

            {/* Bottom inline format toolbar */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-border/40 text-text-tertiary">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ textAlign: 'left' });
                }}
                className={`p-1 cursor-pointer transition-colors ${
                  node.textAlign === 'left' ? 'text-primary font-bold' : 'hover:text-text-primary'
                }`}
                title="Align Left"
              >
                <IconAlignLeft size={15} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ textAlign: 'center' });
                }}
                className={`p-1 cursor-pointer transition-colors ${
                  node.textAlign === 'center' ? 'text-primary font-bold' : 'hover:text-text-primary'
                }`}
                title="Align Center"
              >
                <IconAlignCenter size={15} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ textAlign: 'right' });
                }}
                className={`p-1 cursor-pointer transition-colors ${
                  node.textAlign === 'right' ? 'text-primary font-bold' : 'hover:text-text-primary'
                }`}
                title="Align Right"
              >
                <IconAlignRight size={15} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect();
                }}
                className="hover:text-text-primary p-1 cursor-pointer"
                title="Customize Typography & Background"
              >
                <IconLink size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── 3. MICRO-GOAL PROGRESS NODE ── */}
        {node.type === 'goal' && (
          <div className="w-full h-full p-5 flex flex-col justify-between bg-surface border border-border/80">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IconBook size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">
                    {node.title}
                  </h3>
                  {node.subtitle && (
                    <p className="text-[11px] font-semibold text-text-tertiary">
                      {node.subtitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[12px] font-black text-text-primary">
                  {node.goalCurrent || 0} / {node.goalTarget || 50}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((p) => !p);
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-surface-alt text-text-tertiary flex items-center justify-center cursor-pointer"
                >
                  <IconDots size={14} />
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="my-2">
              <div className="w-full h-2 rounded-full bg-surface-alt overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      node.goalTarget
                        ? Math.min(100, Math.round(((node.goalCurrent || 0) / node.goalTarget) * 100))
                        : node.progress || 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Tags Strip */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(node.tags && node.tags.length > 0
                ? node.tags
                : ['Discipline', 'Growth']
              ).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg bg-surface-alt border border-border text-[10.5px] font-bold text-text-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. QUOTE / AFFIRMATION STICKY NODE ── */}
        {node.type === 'quote' && (
          <div
            className="w-full h-full p-5 flex flex-col justify-between relative text-text-primary"
            style={{
              color: node.textColor || undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl font-serif leading-none opacity-60">
                &ldquo;
              </span>
              <button
                type="button"
                onClick={handleHeartClick}
                className="w-7 h-7 rounded-full flex items-center justify-center text-text-secondary hover:text-rose-500 transition-colors cursor-pointer"
              >
                {isLiked ? (
                  <IconHeartFilled size={16} className="text-rose-500" />
                ) : (
                  <IconHeart size={16} />
                )}
              </button>
            </div>

            <p
              className={`text-[14px] sm:text-[15.5px] leading-snug my-auto ${getFontFamilyClass(
                node.fontFamily || 'serif'
              )} ${getFontWeightClass(node.fontWeight || 'bold')} ${
                node.fontStyle === 'italic' ? 'italic' : ''
              }`}
            >
              {node.content || 'Discipline today freedom tomorrow.'}
            </p>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-semibold opacity-75 italic">
                {node.quoteAuthor ? `— ${node.quoteAuthor}` : '— Unknown'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="opacity-50 hover:opacity-100 p-1 cursor-pointer"
              >
                <IconDots size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── 5. TRAVEL MAP INTERACTIVE NODE ── */}
        {node.type === 'map' && (
          <div className="w-full h-full p-4 flex flex-col justify-between bg-surface border border-border/80 text-text-primary">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IconMapPin size={16} className="text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-text-primary">
                  {node.title || 'TRAVEL MAP'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-6 h-6 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
              >
                <IconDots size={14} />
              </button>
            </div>

            {/* World Map Vector */}
            <div className="relative w-full flex-1 rounded-2xl bg-surface-alt/70 border border-border/40 overflow-hidden flex items-center justify-center">
              <svg
                viewBox="0 0 400 200"
                className="w-full h-full opacity-40 text-text-secondary fill-current pointer-events-none"
              >
                <path d="M50,40 Q90,30 110,60 Q130,90 100,120 Q60,110 50,40 Z" />
                <path d="M100,130 Q120,135 125,160 Q110,180 95,160 Z" />
                <path d="M180,30 Q250,20 280,50 Q260,90 200,80 Q170,50 180,30 Z" />
                <path d="M190,95 Q230,95 240,140 Q210,165 185,130 Z" />
                <path d="M290,60 Q360,50 370,100 Q330,120 300,90 Z" />
                <path d="M310,130 Q350,130 360,160 Q320,170 310,130 Z" />
              </svg>

              {/* Glowing Interactive Pins */}
              {(node.mapPins || [
                { id: 'p1', title: 'New York', lat: 40.7, lng: -74, note: 'The city of dreams.' },
                { id: 'p2', title: 'Maldives', lat: 3.2, lng: 73.2, note: 'Overwater villa retreat.' },
                { id: 'p3', title: 'Tokyo', lat: 35.6, lng: 139.6, note: 'Design studios & neon.' },
              ]).map((pin, idx) => {
                const x = 70 + idx * 110;
                const y = 50 + (idx % 2) * 40;
                const isActive = activeMapPinIndex === idx;

                return (
                  <button
                    key={pin.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMapPinIndex(idx);
                    }}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer z-10"
                    title={pin.title}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-primary scale-125 ring-4 ring-primary/30'
                          : 'bg-primary/70 hover:scale-110'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Destination Card Teaser */}
            {node.mapPins && node.mapPins[activeMapPinIndex] && (
              <div className="mt-3 p-2.5 rounded-xl bg-surface-alt border border-border flex items-center gap-3">
                {node.mapPins[activeMapPinIndex].imageUrl && (
                  <img
                    src={node.mapPins[activeMapPinIndex].imageUrl}
                    alt={node.mapPins[activeMapPinIndex].title}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[12px] font-black text-text-primary block truncate">
                    {node.mapPins[activeMapPinIndex].title}
                  </span>
                  <p className="text-[10.5px] text-text-tertiary line-clamp-2 leading-tight">
                    {node.mapPins[activeMapPinIndex].note || 'A place to grow, explore and create my story.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 6. SKILL / TECH CODE NODE ── */}
        {node.type === 'skill' && (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-blue-50/70 to-indigo-50/70 dark:from-blue-950/40 dark:to-indigo-950/30 border border-border text-text-primary">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M14.3 2.3L4.8 11.8l3.4 3.4 9.5-9.5-3.4-3.4zm-2.8 14.1L8.2 13 4.8 16.4l4.8 4.8 1.9-1.9-2.9-2.9zM19.2 14.2l-3.4-3.4-2.8 2.8 3.4 3.4 2.8-2.8z" />
                </svg>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-7 h-7 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
              >
                <IconDots size={15} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">
                {node.title || 'LEARN FLUTTER'}
              </h3>
              <p className="text-[12px] font-bold text-text-secondary mt-0.5">
                {node.subtitle || 'Spring animation'}
              </p>
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(node.tags || ['Flutter', 'Animation']).map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 rounded-lg bg-surface border border-border text-text-primary text-[10.5px] font-bold shadow-xs"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── 7. AUDIO LO-FI AMBIENT NODE ── */}
        {node.type === 'audio' && (
          <div className="w-full h-full relative overflow-hidden flex flex-col justify-between p-4 text-white">
            <img
              src={
                node.imageUrl ||
                'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=800&auto=format&fit=crop'
              }
              alt={node.title}
              className="absolute inset-0 w-full h-full object-cover brightness-[0.65]"
            />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                Ambient Lo-Fi
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-7 h-7 rounded-full bg-black/40 text-white flex items-center justify-center cursor-pointer"
              >
                <IconDots size={14} />
              </button>
            </div>

            {/* Play Button Center */}
            <div className="relative z-10 my-auto flex items-center justify-center">
              <button
                type="button"
                onClick={toggleAudio}
                className={`w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer ${
                  isPlayingAudio ? 'ring-4 ring-white/50 animate-pulse' : ''
                }`}
                title={isPlayingAudio ? 'Pause Ambient Sound' : 'Play Ambient Sound'}
              >
                {isPlayingAudio ? (
                  <IconPlayerPause size={24} className="fill-current" />
                ) : (
                  <IconPlayerPlay size={24} className="fill-current ml-0.5" />
                )}
              </button>
            </div>

            {/* Track Title and Duration */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[13px] font-extrabold truncate">
                  {node.title || 'Forest Lo-Fi'}
                </span>
                <span className="text-[10px] opacity-75">
                  {isPlayingAudio ? 'Playing ambient stream' : 'Paused'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold opacity-90">
                {node.audioDuration || '02:45'}
              </span>
            </div>
          </div>
        )}

        {/* ── 8. EMBED / SHAPE NODE ── */}
        {(node.type === 'embed' || node.type === 'shape') && (
          <div className="w-full h-full p-5 flex flex-col justify-between bg-surface border border-border text-text-primary">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {node.type.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu((p) => !p);
                }}
                className="w-7 h-7 rounded-lg text-text-tertiary hover:bg-surface-alt flex items-center justify-center cursor-pointer"
              >
                <IconDots size={15} />
              </button>
            </div>
            <div className="my-auto">
              <h3 className="text-base font-black text-text-primary uppercase tracking-tight">
                {node.title}
              </h3>
              {node.content && (
                <p className="text-[12px] text-text-secondary mt-1">
                  {node.content}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* POPUP ACTION MENU */}
      {showMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-10 right-2 z-50 p-1.5 bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[150px]"
        >
          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onInspect();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-text-primary hover:bg-surface-alt cursor-pointer"
          >
            <IconAdjustments size={15} />
            <span>Edit Node</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onDuplicate();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-text-primary hover:bg-surface-alt cursor-pointer"
          >
            <IconCopy size={15} />
            <span>Duplicate</span>
          </button>

          <div className="w-full h-[1px] bg-border my-0.5" />

          <button
            type="button"
            onClick={() => {
              setShowMenu(false);
              onDelete();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-[12px] font-bold text-rose-500 hover:bg-rose-500/10 cursor-pointer"
          >
            <IconTrash size={15} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};
