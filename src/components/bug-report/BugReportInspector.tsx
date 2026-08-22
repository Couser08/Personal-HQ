import { useEffect, useState, useRef, useCallback } from 'react';
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
import { ALL_PAGES } from './constants/pages';
import { buildGroupCollage, type SelectedItem } from './utils/collageBuilder';
import { InspectorToolbar } from './components/InspectorToolbar';
import { InspectorOverlays, type HoverBox } from './components/InspectorOverlays';

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
          : null,
      );
    }
    setScrollVersion((v) => (v + 1) % 1000);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      updateHoverFromPoint(e.clientX, e.clientY);
    },
    [updateHoverFromPoint],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateHoverFromPoint(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    [updateHoverFromPoint],
  );

  const captureSingleElement = useCallback(
    async (targetEl: HTMLElement) => {
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
    },
    [captureAndOpenModal, cancelInspection],
  );

  const captureGroupElements = useCallback(async () => {
    const items = selectedItemsRef.current;
    if (items.length === 0) return;
    if (items.length === 1) {
      await captureSingleElement(items[0].element);
      return;
    }

    setIsCapturing(true);
    try {
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
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
        const r = isConn
          ? item.element.getBoundingClientRect()
          : { left: 0, top: 0, width: 0, height: 0 };
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

      const pagesList = Array.from(
        new Set(items.map((i) => i.pageTitle || i.pageModule)),
      ).join(', ');

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
        const currentItems = selectedItemsRef.current;
        const exists = currentItems.some((item) => item.element === targetEl);
        if (exists) {
          setSelectedItems((prev) => prev.filter((item) => item.element !== targetEl));
        } else {
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
    [captureSingleElement],
  );

  const handleInterceptEvent = useCallback(
    (e: Event) => {
      if (isCapturingRef.current) return;

      const target = e.target as HTMLElement | null;
      if (!target || target.closest('#bug-report-inspector-ui')) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.type === 'click' || e.type === 'touchend') {
        const targetEl = hoveredElementRef.current || target;
        void handleElementAction(targetEl);
      }
    },
    [handleElementAction],
  );

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
    <div
      id="bug-report-inspector-ui"
      className="fixed inset-0 z-[99999] pointer-events-none select-none font-sans"
    >
      <InspectorToolbar
        inspectionMode={inspectionMode}
        setInspectionMode={setInspectionMode}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        isCapturing={isCapturing}
        isPageSwitcherOpen={isPageSwitcherOpen}
        setIsPageSwitcherOpen={setIsPageSwitcherOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        captureGroupElements={captureGroupElements}
        cancelInspection={cancelInspection}
      />

      <InspectorOverlays
        inspectionMode={inspectionMode}
        selectedItems={selectedItems}
        hoverBox={hoverBox}
        isCapturing={isCapturing}
      />
    </div>
  );
}
