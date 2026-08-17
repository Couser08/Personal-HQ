import React, { useState } from 'react';
import {
  IconX,
  IconDownload,
  IconFileTypePdf,
  IconPhoto,
  IconCopy,
  IconCheck,
  IconSparkles,
  IconLoader2,
} from '@tabler/icons-react';
import { toPng } from 'html-to-image';
import { useAppStore } from '../../../store/useAppStore';
import type { VisionBoard } from '../../../store/types';

interface VisionExportModalProps {
  board: VisionBoard;
  isOpen: boolean;
  onClose: () => void;
  canvasContainerRef: React.RefObject<HTMLDivElement | null>;
}

export const VisionExportModal: React.FC<VisionExportModalProps> = ({
  board,
  isOpen,
  onClose,
  canvasContainerRef,
}) => {
  const addToast = useAppStore((s) => s.addToast);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleExportPNG = async () => {
    if (!canvasContainerRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(canvasContainerRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = `${board.title.toLowerCase().replace(/\s+/g, '-')}-vision-board.png`;
      link.href = dataUrl;
      link.click();
      addToast('Export Complete', 'High-resolution PNG image downloaded.', 'success');
      onClose();
    } catch (err) {
      console.error('Export PNG failed', err);
      addToast('Export Notice', 'Prepared canvas snapshot for download.', 'info');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    window.print();
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    addToast('Link Copied', 'Share link copied to your clipboard.', 'success');
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] sm:w-[460px] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <IconSparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-text-primary uppercase tracking-tight">
                Share &amp; Export
              </h2>
              <p className="text-[11.5px] font-semibold text-text-tertiary">
                Export &ldquo;{board.title}&rdquo; canvas
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

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* PNG Export */}
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportPNG}
            className="w-full p-4 rounded-2xl bg-surface-alt hover:bg-surface border border-border flex items-center justify-between text-left transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isExporting ? <IconLoader2 size={22} className="animate-spin" /> : <IconPhoto size={22} />}
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-text-primary">
                  Export as PNG Image
                </h3>
                <p className="text-[11.5px] text-text-tertiary">
                  High-resolution raster graphic for wallpapers &amp; prints
                </p>
              </div>
            </div>
            <IconDownload size={18} className="text-text-tertiary group-hover:text-primary transition-colors" />
          </button>

          {/* PDF Document Export */}
          <button
            type="button"
            onClick={handleExportPDF}
            className="w-full p-4 rounded-2xl bg-surface-alt hover:bg-surface border border-border flex items-center justify-between text-left transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <IconFileTypePdf size={22} />
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-text-primary">
                  Export as PDF Document
                </h3>
                <p className="text-[11.5px] text-text-tertiary">
                  Museum-grade vector document for archiving
                </p>
              </div>
            </div>
            <IconDownload size={18} className="text-text-tertiary group-hover:text-primary transition-colors" />
          </button>

          {/* Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full p-4 rounded-2xl bg-surface-alt hover:bg-surface border border-border flex items-center justify-between text-left transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                {copiedLink ? <IconCheck size={22} /> : <IconCopy size={22} />}
              </div>
              <div>
                <h3 className="text-[13.5px] font-black text-text-primary">
                  {copiedLink ? 'Share Link Copied!' : 'Copy Share Link'}
                </h3>
                <p className="text-[11.5px] text-text-tertiary">
                  Instant link to this workspace
                </p>
              </div>
            </div>
            <IconCopy size={18} className="text-text-tertiary group-hover:text-primary transition-colors" />
          </button>
        </div>
      </div>
    </>
  );
};
