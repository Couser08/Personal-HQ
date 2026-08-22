import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { EMOJIS, COLORS, COLOR_HEX } from '../utils/countdownHelpers';

interface AddCountdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  setLabel: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  time: string;
  setTime: (v: string) => void;
  emoji: string;
  setEmoji: (v: string) => void;
  color: (typeof COLORS)[number];
  setColor: (v: (typeof COLORS)[number]) => void;
  handleSave: () => void;
}

export const AddCountdownModal: React.FC<AddCountdownModalProps> = ({
  isOpen,
  onClose,
  label,
  setLabel,
  date,
  setDate,
  time,
  setTime,
  emoji,
  setEmoji,
  color,
  setColor,
  handleSave,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Countdown"
      maxWidthClassName="max-w-2xl"
    >
      <div className="flex flex-col gap-4 text-left">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-text-secondary">Label</label>
          <input
            type="text"
            placeholder="e.g. Graduation, Trip to Japan"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-text-secondary">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-medium text-text-secondary">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-surface-alt border border-border-alt rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <label className="text-sm font-medium text-text-secondary">Pick an Emoji</label>
          <div className="grid grid-cols-10 gap-1.5">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`btn btn-ghost btn-sm btn-square text-xl ${
                  emoji === e
                    ? 'bg-primary/20 scale-110 ring-1 ring-primary'
                    : 'hover:scale-110'
                }`}
                type="button"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-secondary">Color Accent</label>
          <div className="flex gap-3">
            {COLORS.map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => setColor(col)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === col
                    ? 'border-text-primary scale-110 shadow-lg'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: COLOR_HEX[col] }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="btn btn-secondary btn-md">
            Cancel
          </button>
          <button onClick={handleSave} className="btn btn-primary btn-md">
            Save Countdown
          </button>
        </div>
      </div>
    </Modal>
  );
};
