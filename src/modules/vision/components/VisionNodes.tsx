import React, { useState, useRef, useEffect } from 'react';
import type { VisionNode } from '../../../store/types';
import { useAppStore } from '../../../store/useAppStore';
import { NodeSelectionOverlay } from './nodes/NodeSelectionOverlay';
import { NodePopupMenu } from './nodes/NodePopupMenu';
import { ImageNodeView } from './nodes/ImageNodeView';
import { TextNodeView } from './nodes/TextNodeView';
import { GoalNodeView } from './nodes/GoalNodeView';
import { QuoteNodeView } from './nodes/QuoteNodeView';
import { MapNodeView } from './nodes/MapNodeView';
import { AudioNodeView } from './nodes/AudioNodeView';
import { SkillShapeNodeView } from './nodes/SkillShapeNodeView';

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
      if (useAppStore.getState().settings.soundEnabled === false) return;
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
      {isSelected && (
        <NodeSelectionOverlay
          width={width}
          height={height}
          onInspect={onInspect}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onStartResize={onStartResize}
        />
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
        {node.type === 'image' && (
          <ImageNodeView
            node={node}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}

        {node.type === 'text' && (
          <TextNodeView
            node={node}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
            onUpdate={onUpdate}
            onInspect={onInspect}
          />
        )}

        {node.type === 'goal' && (
          <GoalNodeView
            node={node}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}

        {node.type === 'quote' && (
          <QuoteNodeView
            node={node}
            isLiked={isLiked}
            onHeartClick={handleHeartClick}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}

        {node.type === 'map' && (
          <MapNodeView
            node={node}
            activeMapPinIndex={activeMapPinIndex}
            setActiveMapPinIndex={setActiveMapPinIndex}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}

        {node.type === 'audio' && (
          <AudioNodeView
            node={node}
            isPlayingAudio={isPlayingAudio}
            onToggleAudio={toggleAudio}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}

        {(node.type === 'skill' || node.type === 'embed' || node.type === 'shape') && (
          <SkillShapeNodeView
            node={node}
            onToggleMenu={(e) => {
              e.stopPropagation();
              setShowMenu((p) => !p);
            }}
          />
        )}
      </div>

      {showMenu && (
        <NodePopupMenu
          onInspect={onInspect}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};
