import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconClipboardText } from '@tabler/icons-react';

interface ClipboardPopupCardProps {
  showClipboardPopup: boolean;
  detectedLink: string | null;
  handleSaveClipboardLink: () => void;
  handleDismissClipboard: (e: React.MouseEvent) => void;
}

export const ClipboardPopupCard: React.FC<ClipboardPopupCardProps> = ({
  showClipboardPopup,
  detectedLink,
  handleSaveClipboardLink,
  handleDismissClipboard,
}) => {
  return (
    <AnimatePresence>
      {showClipboardPopup && detectedLink && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 80, rotate: -3 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -6, 0],
            rotate: [1, -1, 1],
            transition: {
              y: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
              rotate: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
            },
          }}
          exit={{ opacity: 0, scale: 0.7, y: 120, transition: { duration: 0.25 } }}
          style={{ x: '-50%', willChange: 'transform, opacity' }}
          onClick={handleSaveClipboardLink}
          className="fixed bottom-24 left-1/2 z-[9999] w-[90%] max-w-sm cursor-pointer p-4 bg-gradient-to-br from-zinc-950 via-stone-900 to-black text-white border border-primary/30 rounded-3xl shadow-[0_24px_60px_rgba(244,63,94,0.3)] flex flex-col gap-3 hover:border-primary/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <IconClipboardText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">
                Clipboard Link Caught
              </span>
              <h4
                className="text-xs font-bold text-white truncate w-[200px]"
                title={detectedLink}
              >
                {detectedLink}
              </h4>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-2.5 mt-1">
            <span className="text-[9px] text-zinc-400 font-bold uppercase">
              👆 Click Card to Quick Save
            </span>
            <button
              onClick={handleDismissClipboard}
              className="text-[9px] font-black uppercase tracking-wider text-zinc-400 hover:text-white px-3 py-1.5 rounded-xl transition-colors border-none bg-white/5 cursor-pointer hover:bg-white/10"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
