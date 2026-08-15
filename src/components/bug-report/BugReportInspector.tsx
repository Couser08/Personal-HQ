import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useBugReportStore } from '../../store/useBugReportStore';
import { type BugReportElementInfo } from '../../store/types';
import { IconBug, IconX, IconLoader2 } from '@tabler/icons-react';

interface HoverBox {
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
  id?: string;
  classes: string[];
  selector: string;
}

export function BugReportInspector() {
  const { isInspecting, cancelInspection, captureAndOpenModal } = useBugReportStore();
  const [hoverBox, setHoverBox] = useState<HoverBox | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const hoveredElementRef = useRef<HTMLElement | null>(null);

  // Compute CSS selector path
  const computeSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`;
    let path: string[] = [];
    let curr: HTMLElement | null = el;
    let depth = 0;
    while (curr && curr !== document.body && depth < 4) {
      let segment = curr.tagName.toLowerCase();
      if (curr.id) {
        segment += `#${curr.id}`;
        path.unshift(segment);
        break;
      }
      if (curr.className && typeof curr.className === 'string') {
        const cls = curr.className.split(/\s+/).filter(c => c && !c.includes(':') && !c.includes('[') && !c.includes('/'))[0];
        if (cls) segment += `.${cls}`;
      }
      path.unshift(segment);
      curr = curr.parentElement;
      depth++;
    }
    return path.join(' > ');
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isInspecting || isCapturing) return;

    // Find element under cursor
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    if (!el || el.closest('#bug-report-inspector-ui')) {
      return;
    }

    hoveredElementRef.current = el;
    const rect = el.getBoundingClientRect();
    const classes = el.className && typeof el.className === 'string'
      ? el.className.split(/\s+/).filter(Boolean).slice(0, 5)
      : [];

    setHoverBox({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes,
      selector: computeSelector(el),
    });
  }, [isInspecting, isCapturing]);

  const handleElementClick = useCallback(async (e: MouseEvent) => {
    if (!isInspecting || isCapturing) return;

    const target = e.target as HTMLElement | null;
    if (!target || target.closest('#bug-report-inspector-ui')) return;

    e.preventDefault();
    e.stopPropagation();

    const targetEl = hoveredElementRef.current || target;
    setIsCapturing(true);

    try {
      const rect = targetEl.getBoundingClientRect();
      const elementInfo: BugReportElementInfo = {
        tag: targetEl.tagName.toLowerCase(),
        id: targetEl.id || undefined,
        classes: targetEl.className && typeof targetEl.className === 'string'
          ? targetEl.className.split(/\s+/).filter(Boolean)
          : [],
        selector: computeSelector(targetEl),
        boundingRect: {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          top: Math.round(rect.top),
          left: Math.round(rect.left),
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: Math.round(window.scrollX),
          scrollY: Math.round(window.scrollY),
        },
        innerTextSnippet: (targetEl.innerText || '').trim().slice(0, 120),
      };

      // High-resolution visual snapshot capture using html-to-image
      let screenshotData: string | null = null;
      try {
        screenshotData = await toPng(targetEl, {
          pixelRatio: Math.min(window.devicePixelRatio || 2, 2.5),
          quality: 0.95,
          cacheBust: true,
          filter: (node: HTMLElement) => {
            return !node.id?.includes('bug-report-inspector-ui');
          },
        });
      } catch (captureErr) {
        console.warn('[BugReportInspector] Direct element capture failed, capturing parent container:', captureErr);
        if (targetEl.parentElement) {
          try {
            screenshotData = await toPng(targetEl.parentElement, {
              pixelRatio: 2,
              quality: 0.9,
            });
          } catch {
            // fallback gracefully
          }
        }
      }

      setIsCapturing(false);
      captureAndOpenModal(elementInfo, screenshotData);
    } catch (err) {
      console.error('[BugReportInspector] Error during capture:', err);
      setIsCapturing(false);
      cancelInspection();
    }
  }, [isInspecting, isCapturing, captureAndOpenModal, cancelInspection]);

  useEffect(() => {
    if (!isInspecting) {
      setHoverBox(null);
      hoveredElementRef.current = null;
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelInspection();
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleElementClick, true);
    window.addEventListener('keydown', handleKeyDown);

    // Change cursor
    document.body.style.cursor = 'crosshair';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleElementClick, true);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = 'default';
    };
  }, [isInspecting, handleMouseMove, handleElementClick, cancelInspection]);

  if (!isInspecting) return null;

  return (
    <div id="bug-report-inspector-ui" className="fixed inset-0 z-[99999] pointer-events-none select-none font-sans">
      {/* Top Banner Toolbar */}
      <div className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 z-[100000]">
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex items-center gap-3.5 px-5 py-2.5 rounded-full bg-zinc-900/90 text-white shadow-2xl border border-white/20 backdrop-blur-xl"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <IconBug size={18} className="text-rose-400" />
            <span className="text-xs font-bold tracking-wide">
              {isCapturing ? 'Capturing Element Snapshot...' : 'Inspector Active: Click any element to report'}
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          <span className="text-[11px] text-zinc-300 font-medium hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono border border-zinc-700">ESC</kbd> to exit
          </span>

          <button
            onClick={cancelInspection}
            disabled={isCapturing}
            className="flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors cursor-pointer"
          >
            <IconX size={14} /> Cancel
          </button>
        </motion.div>
      </div>

      {/* Hover Bounding Box */}
      <AnimatePresence>
        {hoverBox && !isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: 'fixed',
              left: `${hoverBox.x}px`,
              top: `${hoverBox.y}px`,
              width: `${hoverBox.width}px`,
              height: `${hoverBox.height}px`,
              pointerEvents: 'none',
              zIndex: 99998,
            }}
            className="border-2 border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.35)] rounded-md transition-all duration-75"
          >
            {/* Element Tag Pill Badge */}
            <div
              style={{
                position: 'absolute',
                top: hoverBox.y < 40 ? `${hoverBox.height + 6}px` : '-32px',
                left: '0px',
              }}
              className="px-2.5 py-1 rounded-md bg-zinc-900/95 text-white border border-rose-500/40 text-[11px] font-mono flex items-center gap-2 shadow-lg backdrop-blur-md whitespace-nowrap"
            >
              <span className="font-bold text-rose-400">&lt;{hoverBox.tag}&gt;</span>
              {hoverBox.id && <span className="text-amber-300">#{hoverBox.id}</span>}
              {hoverBox.classes.length > 0 && (
                <span className="text-blue-300">.{hoverBox.classes[0]}</span>
              )}
              <span className="text-zinc-400 text-[10px]">
                {Math.round(hoverBox.width)} × {Math.round(hoverBox.height)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Capturing Loader Overlay */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100001] pointer-events-auto">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
            <IconLoader2 size={24} className="animate-spin text-rose-400" />
            <div>
              <p className="text-sm font-bold">Capturing High-Resolution Snapshot...</p>
              <p className="text-xs text-zinc-400">Extracting DOM structure and element coordinates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
