import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useBugReportStore } from '../../store/useBugReportStore';
import { type BugReportElementInfo, type BugReportElementItem } from '../../store/types';
import { IconBug, IconX, IconLoader2, IconLayersSubtract, IconCheck, IconTarget, IconRotate } from '@tabler/icons-react';

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

interface SelectedItem {
  element: HTMLElement;
  rect: DOMRect;
  tag: string;
  id?: string;
  classes: string[];
  selector: string;
  textSnippet: string;
}

export function BugReportInspector() {
  const { isInspecting, cancelInspection, captureAndOpenModal } = useBugReportStore();
  const [inspectionMode, setInspectionMode] = useState<'single' | 'group'>('single');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [hoverBox, setHoverBox] = useState<HoverBox | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const hoveredElementRef = useRef<HTMLElement | null>(null);

  // Compute CSS selector path
  const computeSelector = (el: HTMLElement): string => {
    if (el.id) return `#${el.id}`;
    const path: string[] = [];
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

  const updateHoverFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!isInspecting || isCapturing) return;

    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el || el.closest('#bug-report-inspector-ui')) {
      return;
    }

    hoveredElementRef.current = el;
    const rect = el.getBoundingClientRect();
    const classes = el.className && typeof el.className === 'string'
      ? el.className.split(/\s+/).filter(Boolean).slice(0, 4)
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateHoverFromPoint(e.clientX, e.clientY);
  }, [updateHoverFromPoint]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      updateHoverFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateHoverFromPoint]);

  // Capture single element
  const captureSingleElement = async (targetEl: HTMLElement) => {
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
        isGroup: false,
      };

      let screenshotData: string | null = null;
      try {
        screenshotData = await toPng(targetEl, {
          pixelRatio: Math.min(window.devicePixelRatio || 1.5, 2),
          quality: 0.85,
          cacheBust: true,
          skipFonts: true,
          fontEmbedCSS: '',
          filter: (node: HTMLElement) => !node.id?.includes('bug-report-inspector-ui'),
        });
      } catch (captureErr) {
        console.warn('[BugReportInspector] Direct element capture fallback:', captureErr);
        if (targetEl.parentElement) {
          try {
            screenshotData = await toPng(targetEl.parentElement, {
              pixelRatio: 1.5,
              quality: 0.8,
              skipFonts: true,
              fontEmbedCSS: '',
              filter: (node: HTMLElement) => !node.id?.includes('bug-report-inspector-ui'),
            });
          } catch {
            // fallback gracefully
          }
        }
      }

      setIsCapturing(false);
      captureAndOpenModal(elementInfo, screenshotData);
    } catch (err) {
      console.error('[BugReportInspector] Capture failed:', err);
      setIsCapturing(false);
      cancelInspection();
    }
  };

  // Capture selected group of elements
  const captureGroupElements = async () => {
    if (selectedItems.length === 0) return;
    if (selectedItems.length === 1) {
      await captureSingleElement(selectedItems[0].element);
      return;
    }

    setIsCapturing(true);
    try {
      // Find bounding box encompassing all items
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      selectedItems.forEach(({ element }) => {
        const r = element.getBoundingClientRect();
        if (r.left < minX) minX = r.left;
        if (r.top < minY) minY = r.top;
        if (r.right > maxX) maxX = r.right;
        if (r.bottom > maxY) maxY = r.bottom;
      });

      // Find common ancestor
      let commonAncestor: HTMLElement | null = selectedItems[0].element.parentElement;
      for (let i = 1; i < selectedItems.length; i++) {
        while (commonAncestor && !commonAncestor.contains(selectedItems[i].element)) {
          commonAncestor = commonAncestor.parentElement;
        }
      }
      if (!commonAncestor || commonAncestor === document.body) {
        commonAncestor = document.getElementById('root') || document.body;
      }

      const groupElements: BugReportElementItem[] = selectedItems.map((item) => {
        const r = item.element.getBoundingClientRect();
        return {
          tag: item.tag,
          id: item.id,
          classes: item.classes,
          selector: item.selector,
          innerTextSnippet: item.textSnippet,
          boundingRect: {
            x: Math.round(r.left + window.scrollX),
            y: Math.round(r.top + window.scrollY),
            width: Math.round(r.width),
            height: Math.round(r.height),
            top: Math.round(r.top),
            left: Math.round(r.left),
          },
        };
      });

      const elementInfo: BugReportElementInfo = {
        tag: commonAncestor.tagName.toLowerCase(),
        id: commonAncestor.id || undefined,
        classes: commonAncestor.className && typeof commonAncestor.className === 'string'
          ? commonAncestor.className.split(/\s+/).filter(Boolean).slice(0, 5)
          : [],
        selector: `Group: ${selectedItems.length} elements (${computeSelector(commonAncestor)})`,
        boundingRect: {
          x: Math.round(minX + window.scrollX),
          y: Math.round(minY + window.scrollY),
          width: Math.round(maxX - minX),
          height: Math.round(maxY - minY),
          top: Math.round(minY),
          left: Math.round(minX),
        },
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: Math.round(window.scrollX),
          scrollY: Math.round(window.scrollY),
        },
        innerTextSnippet: selectedItems.map(i => i.textSnippet).filter(Boolean).slice(0, 3).join(' | '),
        isGroup: true,
        groupCount: selectedItems.length,
        groupElements,
      };

      let screenshotData: string | null = null;
      try {
        screenshotData = await toPng(commonAncestor, {
          pixelRatio: Math.min(window.devicePixelRatio || 1.5, 2),
          quality: 0.85,
          cacheBust: true,
          skipFonts: true,
          fontEmbedCSS: '',
          filter: (node: HTMLElement) => !node.id?.includes('bug-report-inspector-ui'),
        });
      } catch (err) {
        console.warn('[BugReportInspector] Group capture error:', err);
      }

      setIsCapturing(false);
      captureAndOpenModal(elementInfo, screenshotData);
    } catch (err) {
      console.error('[BugReportInspector] Group capture failed:', err);
      setIsCapturing(false);
      cancelInspection();
    }
  };

  const handleElementAction = useCallback((targetEl: HTMLElement) => {
    if (!targetEl || targetEl.closest('#bug-report-inspector-ui')) return;

    if (inspectionMode === 'single') {
      void captureSingleElement(targetEl);
    } else {
      // Toggle in group selection
      setSelectedItems((prev) => {
        const exists = prev.some(item => item.element === targetEl);
        if (exists) {
          return prev.filter(item => item.element !== targetEl);
        } else {
          const rect = targetEl.getBoundingClientRect();
          const newItem: SelectedItem = {
            element: targetEl,
            rect,
            tag: targetEl.tagName.toLowerCase(),
            id: targetEl.id || undefined,
            classes: targetEl.className && typeof targetEl.className === 'string'
              ? targetEl.className.split(/\s+/).filter(Boolean)
              : [],
            selector: computeSelector(targetEl),
            textSnippet: (targetEl.innerText || '').trim().slice(0, 60),
          };
          return [...prev, newItem];
        }
      });
    }
  }, [inspectionMode]);

  // Unified click / tap interception
  const handleInterceptEvent = useCallback((e: Event) => {
    if (!isInspecting || isCapturing) return;

    const target = e.target as HTMLElement | null;
    if (!target || target.closest('#bug-report-inspector-ui')) return;

    // CRITICAL: Block default navigation, link triggers, and button submits
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'click' || e.type === 'touchend') {
      const targetEl = hoveredElementRef.current || target;
      handleElementAction(targetEl);
    }
  }, [isInspecting, isCapturing, handleElementAction]);

  useEffect(() => {
    if (!isInspecting) {
      setHoverBox(null);
      hoveredElementRef.current = null;
      setSelectedItems([]);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancelInspection();
      }
    };

    // Intercept in capture phase across all relevant events
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleInterceptEvent, true);
    window.addEventListener('touchstart', handleInterceptEvent, { capture: true, passive: false });
    window.addEventListener('touchend', handleInterceptEvent, { capture: true, passive: false });
    window.addEventListener('pointerdown', handleInterceptEvent, { capture: true, passive: false });
    window.addEventListener('keydown', handleKeyDown);

    document.body.style.cursor = 'crosshair';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleInterceptEvent, true);
      window.removeEventListener('touchstart', handleInterceptEvent, true);
      window.removeEventListener('touchend', handleInterceptEvent, true);
      window.removeEventListener('pointerdown', handleInterceptEvent, true);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = 'default';
    };
  }, [isInspecting, handleMouseMove, handleTouchMove, handleInterceptEvent, cancelInspection]);

  if (!isInspecting) return null;

  return (
    <div id="bug-report-inspector-ui" className="fixed inset-0 z-[99999] pointer-events-none select-none font-sans">
      {/* Bottom Floating Inspector Toolbar */}
      <div className="pointer-events-auto fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-[100000] w-auto max-w-[94vw] flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="flex flex-row items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2 rounded-full bg-zinc-950/95 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-2xl whitespace-nowrap"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <IconBug size={16} className="text-rose-400 shrink-0" />
            <span className="text-[12px] font-bold tracking-tight hidden sm:inline text-zinc-200">
              {isCapturing ? 'Capturing...' : inspectionMode === 'single' ? 'Tap element to report' : 'Tap to select elements'}
            </span>
          </div>

          <div className="h-4 w-px bg-white/20" />

          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-800/80 p-0.5 rounded-full border border-zinc-700/60">
            <button
              type="button"
              onClick={() => {
                setInspectionMode('single');
                setSelectedItems([]);
              }}
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                inspectionMode === 'single'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <IconTarget size={12} />
              <span>Single</span>
            </button>

            <button
              type="button"
              onClick={() => setInspectionMode('group')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                inspectionMode === 'group'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <IconLayersSubtract size={12} />
              <span>Group</span>
            </button>
          </div>

          {/* Group Mode Actions */}
          {inspectionMode === 'group' && (
            <>
              <div className="h-4 w-px bg-white/20" />
              <span className="text-[10.5px] font-mono font-bold text-rose-300 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30">
                {selectedItems.length}
              </span>

              {selectedItems.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => void captureGroupElements()}
                    disabled={isCapturing}
                    className="flex items-center gap-1 text-[11.5px] font-extrabold bg-white text-zinc-900 hover:bg-zinc-100 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer shadow-md"
                  >
                    <IconCheck size={13} />
                    <span>Done ({selectedItems.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Reset selection"
                  >
                    <IconRotate size={13} />
                  </button>
                </>
              )}
            </>
          )}

          <div className="h-4 w-px bg-white/20" />

          {/* Exit / Cancel Button */}
          <button
            type="button"
            onClick={cancelInspection}
            disabled={isCapturing}
            className="flex items-center gap-1 text-[11.5px] font-extrabold text-zinc-300 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors cursor-pointer active:scale-95"
            title="Exit bug report mode"
          >
            <IconX size={13} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </motion.div>
      </div>

      {/* Selected Items Bounding Boxes (in Group Mode) */}
      {inspectionMode === 'group' && (
        <AnimatePresence>
          {selectedItems.map((item, idx) => {
            const r = item.element.getBoundingClientRect();
            return (
              <motion.div
                key={idx}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                style={{
                  position: 'fixed',
                  left: `${r.left}px`,
                  top: `${r.top}px`,
                  width: `${r.width}px`,
                  height: `${r.height}px`,
                  pointerEvents: 'none',
                  zIndex: 99997,
                }}
                className="border-2 border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-md"
              >
                {/* Number Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '-12px',
                  }}
                  className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center shadow-lg border-2 border-zinc-900"
                >
                  {idx + 1}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {/* Hover Bounding Box */}
      <AnimatePresence>
        {hoverBox && !isCapturing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.08 }}
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
                top: hoverBox.y < 45 ? `${hoverBox.height + 6}px` : '-32px',
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
              <p className="text-xs text-zinc-400">Extracting DOM structure & coordinates</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
