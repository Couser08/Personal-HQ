import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useBugReportStore } from '../../store/useBugReportStore';
import { useAppStore } from '../../store/useAppStore';
import { type BugReportElementInfo, type BugReportElementItem } from '../../store/types';
import {
  getElementClasses,
  getDataAttributes,
  getAncestorPath,
  getElementFingerprint,
} from './utils/elementFingerprint';
import {
  IconBug,
  IconX,
  IconLoader2,
  IconLayersSubtract,
  IconCheck,
  IconTarget,
  IconRotate,
  IconDots,
} from '@tabler/icons-react';

interface HoverBox {
  x: number;
  y: number;
  width: number;
  height: number;
  tag: string;
  id?: string;
  classes: string[];
  ancestorPath: string;
  selector: string;
}

interface SelectedItem {
  id: string;
  element: HTMLElement;
  tag: string;
  idAttr?: string;
  classes: string[];
  ancestorPath?: string;
  dataAttributes?: Record<string, string>;
  selector: string;
  textSnippet: string;
  pageModule: string;
  pageTitle: string;
  screenshotSnippet?: string;
}

const ALL_PAGES = [
  { id: 'dashboard', label: 'Dashboard', emoji: '🏠' },
  { id: 'todo', label: 'Daily Planner', emoji: '📅' },
  { id: 'calendar', label: 'Monthly Calendar', emoji: '📆' },
  { id: 'journal', label: 'Journal', emoji: '📖' },
  { id: 'books', label: 'My Library', emoji: '📚' },
  { id: 'markdown', label: 'Markdown Creator', emoji: '✍️' },
  { id: 'til', label: 'Today I Learned', emoji: '💡' },
  { id: 'snippets', label: 'Code Snippets', emoji: '💻' },
  { id: 'habits', label: 'Habits Tracker', emoji: '🔥' },
  { id: 'pomodoro', label: 'Pomodoro Timer', emoji: '⏱️' },
  { id: 'vision', label: 'Vision Board', emoji: '🎯' },
  { id: 'exam', label: 'AI Exam Prep', emoji: '🧠' },
  { id: 'mindmap', label: 'Mindmap', emoji: '🗺️' },
  { id: 'drawing', label: 'Drawing Canvas', emoji: '🎨' },
  { id: 'media', label: 'Media Log', emoji: '🎮' },
  { id: 'condition', label: 'Workstation', emoji: '📊' },
  { id: 'utilities', label: 'Utilities', emoji: '🛠️' },
  { id: 'linksaver', label: 'Link Vault', emoji: '🔗' },
  { id: 'tags', label: 'Tag Manager', emoji: '🏷️' },
  { id: 'profile', label: 'Profile', emoji: '👤' },
  { id: 'settings', label: 'Settings', emoji: '⚙️' },
  { id: 'changelog', label: "What's New", emoji: '🚀' },
  { id: 'admin', label: 'Admin Panel', emoji: '🛡️' },
];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Builds a focused visual collage for multi-element bug reports (never the entire page)
async function buildGroupCollage(items: SelectedItem[]): Promise<string | null> {
  if (items.length === 0) return null;
  if (items.length === 1 && items[0].screenshotSnippet) {
    return items[0].screenshotSnippet;
  }

  const loadedImages: { img: HTMLImageElement; item: SelectedItem }[] = [];
  for (const item of items) {
    let src = item.screenshotSnippet;
    if (!src && item.element && item.element.isConnected) {
      try {
        src = await toPng(item.element, {
          pixelRatio: 1.5,
          quality: 0.85,
          skipFonts: true,
          fontEmbedCSS: '',
          filter: (n: HTMLElement) => !n.id?.includes('bug-report-inspector-ui'),
        });
      } catch {
        // ignore
      }
    }
    if (src) {
      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src!;
      });
      if (img.width > 0 && img.height > 0) {
        loadedImages.push({ img, item });
      }
    }
  }

  if (loadedImages.length === 0) return null;

  const isGrid = loadedImages.length >= 4;
  const cols = isGrid ? 2 : 1;
  const cardWidth = isGrid ? 380 : 540;
  const padding = 20;
  const headerHeight = 36;
  const gap = 16;

  const cardHeights = loadedImages.map(({ img }) => {
    const scale = Math.min(1, (cardWidth - 24) / img.width);
    const scaledH = Math.min(260, Math.max(60, img.height * scale));
    return headerHeight + scaledH + 20;
  });

  const totalWidth = padding * 2 + cardWidth * cols + (cols - 1) * gap;
  const colHeights = new Array(cols).fill(padding + 28);

  loadedImages.forEach((_, idx) => {
    const c = idx % cols;
    colHeights[c] += cardHeights[idx] + gap;
  });

  const totalHeight = Math.max(...colHeights) + padding;

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Background
  ctx.fillStyle = '#121214';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  // Title Banner
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`GROUP REPORT SNAPSHOT (${loadedImages.length} SELECTED ELEMENTS)`, padding, 24);

  const currentY = new Array(cols).fill(padding + 30);

  loadedImages.forEach(({ img, item }, idx) => {
    const c = idx % cols;
    const x = padding + c * (cardWidth + gap);
    const y = currentY[c];
    const h = cardHeights[idx];

    // Card background
    ctx.fillStyle = '#1c1c22';
    ctx.strokeStyle = '#2d2d38';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, cardWidth, h, 14, true, true);

    // Number Badge
    ctx.fillStyle = '#10b981';
    roundRect(ctx, x + 12, y + 10, 20, 20, 10, true, false);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${idx + 1}`, x + 22, y + 20);

    // Tag & Page Info
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`<${item.tag}>`, x + 38, y + 24);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px system-ui, sans-serif';
    const pageLabel = item.pageTitle || item.pageModule || 'Current Workspace';
    ctx.fillText(`[${pageLabel}]`, x + 120, y + 24);

    // Inner image
    const imgMaxW = cardWidth - 24;
    const imgMaxH = h - headerHeight - 16;
    const scale = Math.min(imgMaxW / img.width, imgMaxH / img.height);
    const renderW = img.width * scale;
    const renderH = img.height * scale;
    const imgX = x + (cardWidth - renderW) / 2;
    const imgY = y + headerHeight + 6;

    ctx.fillStyle = '#0a0a0c';
    roundRect(ctx, x + 10, y + headerHeight + 2, cardWidth - 20, h - headerHeight - 12, 8, true, false);
    ctx.drawImage(img, imgX, imgY, renderW, renderH);

    currentY[c] += h + gap;
  });

  return canvas.toDataURL('image/png');
}

export function BugReportInspector() {
  const { isInspecting, cancelInspection, captureAndOpenModal } = useBugReportStore();
  const { activeModule, setActiveModule } = useAppStore();
  const [inspectionMode, setInspectionMode] = useState<'single' | 'group'>('single');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [hoverBox, setHoverBox] = useState<HoverBox | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPageSwitcherOpen, setIsPageSwitcherOpen] = useState(false);
  const [, setScrollVersion] = useState(0);

  const hoveredElementRef = useRef<HTMLElement | null>(null);
  const inspectionModeRef = useRef(inspectionMode);
  inspectionModeRef.current = inspectionMode;

  const activeModuleRef = useRef(activeModule);
  activeModuleRef.current = activeModule;

  const isCapturingRef = useRef(isCapturing);
  isCapturingRef.current = isCapturing;

  const selectedItemsRef = useRef(selectedItems);
  selectedItemsRef.current = selectedItems;

  const updateHoverFromPoint = useCallback((clientX: number, clientY: number) => {
    if (isCapturingRef.current) return;

    const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    if (!el || el.closest('#bug-report-inspector-ui')) {
      return;
    }

    hoveredElementRef.current = el;
    const rect = el.getBoundingClientRect();
    const classes = getElementClasses(el);
    const ancestorPath = getAncestorPath(el);

    setHoverBox({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes,
      ancestorPath,
      selector: ancestorPath,
    });
  }, []);

  const syncHoverOnScroll = useCallback(() => {
    if (hoveredElementRef.current && hoveredElementRef.current.isConnected) {
      const rect = hoveredElementRef.current.getBoundingClientRect();
      setHoverBox((prev) =>
        prev
          ? {
              ...prev,
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height,
            }
          : null
      );
    }
    setScrollVersion((v) => (v + 1) % 1000);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    updateHoverFromPoint(e.clientX, e.clientY);
  }, [updateHoverFromPoint]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      updateHoverFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [updateHoverFromPoint]);

  // Capture single element with full fingerprint
  const captureSingleElement = useCallback(async (targetEl: HTMLElement) => {
    setIsCapturing(true);
    try {
      const elementInfo = getElementFingerprint(targetEl);

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
            // ignore
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
  }, [captureAndOpenModal, cancelInspection]);

  // Capture selected group of elements with collage snapshot
  const captureGroupElements = useCallback(async () => {
    const items = selectedItemsRef.current;
    if (items.length === 0) return;
    if (items.length === 1) {
      await captureSingleElement(items[0].element);
      return;
    }

    setIsCapturing(true);
    try {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      items.forEach(({ element }) => {
        if (element && element.isConnected) {
          const r = element.getBoundingClientRect();
          if (r.left < minX) minX = r.left;
          if (r.top < minY) minY = r.top;
          if (r.right > maxX) maxX = r.right;
          if (r.bottom > maxY) maxY = r.bottom;
        }
      });

      if (minX === Infinity) {
        minX = 0;
        minY = 0;
        maxX = window.innerWidth;
        maxY = window.innerHeight;
      }

      const groupElements: BugReportElementItem[] = items.map((item) => {
        const isConn = item.element && item.element.isConnected;
        const r = isConn ? item.element.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
        return {
          tag: item.tag,
          id: item.idAttr,
          classes: item.classes,
          ancestorPath: item.ancestorPath,
          dataAttributes: item.dataAttributes,
          selector: item.ancestorPath || item.selector,
          innerTextSnippet: item.textSnippet,
          pageModule: item.pageModule,
          pageTitle: item.pageTitle,
          screenshotSnippet: item.screenshotSnippet,
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

      const pagesList = Array.from(new Set(items.map((i) => i.pageTitle || i.pageModule))).join(', ');

      const elementInfo: BugReportElementInfo = {
        tag: 'group',
        classes: [],
        selector: `Group Report: ${items.length} elements (Pages: ${pagesList})`,
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
          devicePixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
        },
        innerTextSnippet: items.map((i) => i.textSnippet).filter(Boolean).slice(0, 3).join(' | '),
        isGroup: true,
        groupCount: items.length,
        groupElements,
      };

      // Generate focused group collage snapshot
      const screenshotData = await buildGroupCollage(items);

      setIsCapturing(false);
      captureAndOpenModal(elementInfo, screenshotData);
    } catch (err) {
      console.error('[BugReportInspector] Group capture failed:', err);
      setIsCapturing(false);
      cancelInspection();
    }
  }, [captureSingleElement, captureAndOpenModal, cancelInspection]);

  const handleElementAction = useCallback(
    async (targetEl: HTMLElement) => {
      if (!targetEl || targetEl.closest('#bug-report-inspector-ui')) return;

      if (inspectionModeRef.current === 'single') {
        void captureSingleElement(targetEl);
      } else {
        // Toggle item in group selection
        const currentItems = selectedItemsRef.current;
        const exists = currentItems.some((item) => item.element === targetEl);
        if (exists) {
          setSelectedItems((prev) => prev.filter((item) => item.element !== targetEl));
        } else {
          // Pre-capture snippet so cross-page switching preserves image
          let snippet: string | undefined = undefined;
          try {
            snippet = await toPng(targetEl, {
              pixelRatio: 1.5,
              quality: 0.8,
              skipFonts: true,
              fontEmbedCSS: '',
              filter: (n: HTMLElement) => !n.id?.includes('bug-report-inspector-ui'),
            });
          } catch {
            // ignore
          }

          const currentMod = activeModuleRef.current;
          const currentModInfo = ALL_PAGES.find((p) => p.id === currentMod) || {
            id: currentMod,
            label: currentMod,
          };

          const ancestorPath = getAncestorPath(targetEl);
          const newItem: SelectedItem = {
            id: `sel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            element: targetEl,
            tag: targetEl.tagName.toLowerCase(),
            idAttr: targetEl.id || undefined,
            classes: getElementClasses(targetEl),
            ancestorPath,
            dataAttributes: getDataAttributes(targetEl),
            selector: ancestorPath || targetEl.tagName.toLowerCase(),
            textSnippet: (targetEl.innerText || '').trim().slice(0, 60),
            pageModule: currentMod,
            pageTitle: currentModInfo.label,
            screenshotSnippet: snippet,
          };

          setSelectedItems((prev) => [...prev, newItem]);
        }
      }
    },
    [captureSingleElement]
  );

  // Intercept events on window
  const handleInterceptEvent = useCallback(
    (e: Event) => {
      if (isCapturingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target || target.closest('#bug-report-inspector-ui')) return;

      // CRITICAL: Block default navigation, link triggers, and button submits
      e.preventDefault();
      e.stopPropagation();

      if (e.type === 'click' || e.type === 'touchend') {
        const targetEl = hoveredElementRef.current || target;
        void handleElementAction(targetEl);
      }
    },
    [handleElementAction]
  );

  // Keep references to event listeners completely stable
  const handleMouseMoveRef = useRef(handleMouseMove);
  handleMouseMoveRef.current = handleMouseMove;

  const handleTouchMoveRef = useRef(handleTouchMove);
  handleTouchMoveRef.current = handleTouchMove;

  const syncHoverOnScrollRef = useRef(syncHoverOnScroll);
  syncHoverOnScrollRef.current = syncHoverOnScroll;

  const handleInterceptEventRef = useRef(handleInterceptEvent);
  handleInterceptEventRef.current = handleInterceptEvent;

  useEffect(() => {
    if (!isInspecting) {
      setHoverBox(null);
      hoveredElementRef.current = null;
      setSelectedItems((prev) => (prev.length > 0 ? [] : prev));
      setIsPageSwitcherOpen(false);
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelInspection();
    };

    const onMouseMove = (e: MouseEvent) => {
      handleMouseMoveRef.current(e);
    };

    const onTouchMove = (e: TouchEvent) => {
      handleTouchMoveRef.current(e);
    };

    const onScroll = () => {
      syncHoverOnScrollRef.current();
    };

    const onIntercept = (e: Event) => {
      handleInterceptEventRef.current(e);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('click', onIntercept, true);
    window.addEventListener('touchstart', onIntercept, { capture: true, passive: false });
    window.addEventListener('touchend', onIntercept, { capture: true, passive: false });
    window.addEventListener('pointerdown', onIntercept, { capture: true, passive: false });
    window.addEventListener('keydown', onKeyDown);

    document.body.style.cursor = 'crosshair';

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('click', onIntercept, true);
      window.removeEventListener('touchstart', onIntercept, true);
      window.removeEventListener('touchend', onIntercept, true);
      window.removeEventListener('pointerdown', onIntercept, true);
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.cursor = 'default';
    };
  }, [isInspecting, cancelInspection]);

  if (!isInspecting) return null;

  return (
    <div id="bug-report-inspector-ui" className="fixed inset-0 z-[99999] pointer-events-none select-none font-sans">
      {/* ─── Bottom Floating Inspector Toolbar ─── */}
      <div className="pointer-events-auto fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[100000] w-auto max-w-[96vw] flex flex-col items-center gap-2">
        {/* Page Switcher Popover */}
        <AnimatePresence>
          {isPageSwitcherOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-zinc-950/95 text-white border border-white/20 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-2xl w-[94vw] max-w-2xl max-h-[60vh] sm:max-h-[420px] overflow-y-auto custom-scrollbar flex flex-col gap-3 pointer-events-auto"
            >
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10 px-1">
                <div>
                  <h4 className="text-[13px] sm:text-sm font-bold text-white tracking-tight">
                    Switch Workspace / Page
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Navigate to any module to select elements across multiple pages for a unified report.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPageSwitcherOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close page switcher"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {ALL_PAGES.map((page) => {
                  const isActive = activeModule === page.id;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setActiveModule(page.id);
                        setIsPageSwitcherOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-500 text-white shadow-md font-bold'
                          : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5'
                      }`}
                    >
                      <span className="text-base shrink-0">{page.emoji}</span>
                      <span className="truncate flex-1">{page.label}</span>
                      {isActive && <IconCheck size={14} className="shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Floating Dock */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="flex flex-row items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-zinc-950/95 text-white shadow-[0_16px_40px_rgba(0,0,0,0.5)] border border-white/20 backdrop-blur-2xl whitespace-nowrap"
        >
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 pl-1">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <IconBug size={15} className="text-rose-400 shrink-0" />
            <span className="text-[11.5px] font-bold tracking-tight hidden md:inline text-zinc-200">
              {isCapturing
                ? 'Capturing...'
                : inspectionMode === 'single'
                ? 'Tap element to report'
                : 'Select elements'}
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

          {/* Page Switcher Trigger (...) */}
          <button
            type="button"
            onClick={() => setIsPageSwitcherOpen(!isPageSwitcherOpen)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-all cursor-pointer ${
              isPageSwitcherOpen
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60'
            }`}
            title="Switch workspace / page while reporting"
          >
            <IconDots size={14} />
            <span className="hidden sm:inline">Pages</span>
          </button>

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

          {/* Exit Button */}
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

      {/* ─── Selected Items Bounding Boxes (Live attached during scrolling) ─── */}
      {inspectionMode === 'group' && (
        <AnimatePresence>
          {selectedItems.map((item, idx) => {
            if (!item.element || !item.element.isConnected) return null;
            const r = item.element.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return null;

            return (
              <div
                key={item.id}
                style={{
                  position: 'fixed',
                  left: `${r.left}px`,
                  top: `${r.top}px`,
                  width: `${r.width}px`,
                  height: `${r.height}px`,
                  pointerEvents: 'none',
                  zIndex: 99997,
                }}
                className="border-2 border-emerald-500 bg-emerald-500/15 shadow-[0_0_15px_rgba(16,185,129,0.4)] rounded-md transition-all duration-75"
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
              </div>
            );
          })}
        </AnimatePresence>
      )}

      {/* ─── Hover Bounding Box (Live attached during scrolling) ─── */}
      <AnimatePresence>
        {hoverBox && !isCapturing && (
          <div
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
          </div>
        )}
      </AnimatePresence>

      {/* ─── Capturing Loader Overlay ─── */}
      {isCapturing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100001] pointer-events-auto">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-3">
            <IconLoader2 size={24} className="animate-spin text-rose-400" />
            <div>
              <p className="text-sm font-bold">Generating Focused Element Snapshot...</p>
              <p className="text-xs text-zinc-400">Extracting element structure & compiling group preview</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
