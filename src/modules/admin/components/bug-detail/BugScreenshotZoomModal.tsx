import React from 'react';
import { IconX } from '@tabler/icons-react';

interface BugScreenshotZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  screenshotData?: string | null;
}

export const BugScreenshotZoomModal: React.FC<BugScreenshotZoomModalProps> = ({
  isOpen,
  onClose,
  screenshotData,
}) => {
  if (!isOpen || !screenshotData) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
    >
      <div className="relative max-w-6xl max-h-[90vh] bg-surface rounded-3xl overflow-hidden border border-white/20 p-2 shadow-2xl">
        <img
          src={screenshotData}
          alt="Zoomed Screenshot"
          className="max-h-[82vh] w-auto object-contain rounded-2xl"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white p-2.5 rounded-full transition-colors cursor-pointer shadow-lg"
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
};
