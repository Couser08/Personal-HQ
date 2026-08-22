import React from 'react';
import { IconMapPin, IconTrash, IconPlus } from '@tabler/icons-react';
import { PRESET_PHOTO_ASSETS } from '../../constants/inspectorPresets';
import type { VisionNode, VisionNodeMapPin } from '../../../../store/types';

interface NodeTypeControlsProps {
  nodeType: VisionNode['type'];
  imageUrl: string;
  setImageUrl: (u: string) => void;
  content: string;
  setContent: (c: string) => void;
  goalCurrent: number;
  setGoalCurrent: (c: number) => void;
  goalTarget: number;
  setGoalTarget: (t: number) => void;
  goalUnit: string;
  setGoalUnit: (u: string) => void;
  quoteAuthor: string;
  setQuoteAuthor: (a: string) => void;
  mapPins: VisionNodeMapPin[];
  newPinCity: string;
  setNewPinCity: (c: string) => void;
  handleAddMapPin: (e: React.FormEvent) => void;
  handleRemoveMapPin: (id: string) => void;
}

export const NodeTypeControls: React.FC<NodeTypeControlsProps> = ({
  nodeType,
  imageUrl,
  setImageUrl,
  content,
  setContent,
  goalCurrent,
  setGoalCurrent,
  goalTarget,
  setGoalTarget,
  goalUnit,
  setGoalUnit,
  quoteAuthor,
  setQuoteAuthor,
  mapPins,
  newPinCity,
  setNewPinCity,
  handleAddMapPin,
  handleRemoveMapPin,
}) => {
  return (
    <>
      {/* 1. IMAGE NODE CONTROLS */}
      {nodeType === 'image' && (
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

      {/* 2. TEXT CONTENT */}
      {nodeType === 'text' && (
        <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
          <label className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
            Body Statement
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Express your vision statement..."
            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none focus:border-primary"
          />
        </div>
      )}

      {/* 3. GOAL / PROGRESS CONTROLS */}
      {nodeType === 'goal' && (
        <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
          <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
            Progress &amp; Metric Tracker
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">Current</label>
              <input
                type="number"
                value={goalCurrent}
                onChange={(e) => setGoalCurrent(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[13px] font-bold text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">Target</label>
              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-[13px] font-bold text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">Unit</label>
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
      {nodeType === 'quote' && (
        <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
          <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
            Quote &amp; Attribution
          </span>
          <div>
            <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">Quote Phrase</label>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Inspirational words..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-[13px] text-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10.5px] font-bold text-text-tertiary mb-1">Author</label>
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
      {nodeType === 'map' && (
        <div className="space-y-3 p-4 rounded-2xl bg-surface-alt/60 border border-border">
          <span className="block text-[11px] font-black uppercase tracking-wider text-text-tertiary">
            Destination Pins ({mapPins.length})
          </span>

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
    </>
  );
};
