import { toPng } from 'html-to-image';

export interface SelectedItem {
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

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean,
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
export async function buildGroupCollage(items: SelectedItem[]): Promise<string | null> {
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
    roundRect(
      ctx,
      x + 10,
      y + headerHeight + 2,
      cardWidth - 20,
      h - headerHeight - 12,
      8,
      true,
      false,
    );
    ctx.drawImage(img, imgX, imgY, renderW, renderH);

    currentY[c] += h + gap;
  });

  return canvas.toDataURL('image/png');
}
