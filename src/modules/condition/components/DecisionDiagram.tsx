import { useEffect } from 'react';
import { IconEye, IconDownload } from '@tabler/icons-react';
import { type Rule } from '../utils/conditionEvaluator';

export function DecisionDiagram({
  canvasRef,
  logicalWidth,
  logicalHeight,
  scaleFactor,
  rules,
  evalResult,
  defaultOutcome,
  setIsPreviewOpen,
  exportImage,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  logicalWidth: number;
  logicalHeight: number;
  scaleFactor: number;
  rules: Rule[];
  evalResult: any;
  defaultOutcome: string;
  setIsPreviewOpen: (val: boolean) => void;
  exportImage: (format: 'png' | 'jpeg') => void;
}) {
  const NODE_W = 200;
  const NODE_H = 52;
  const ROW_GAP = 90;
  const OUTCOME_W = 180;
  const DIAGRAM_PAD = 40;

  const drawDiagram = (ctx: CanvasRenderingContext2D, scale: number) => {
    const isDark = document.documentElement.classList.contains('dark');
    const W = logicalWidth;
    const H = logicalHeight;

    const surfaceColor = isDark ? '#1c1c28' : '#ffffff';
    const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textPrimary = isDark ? '#f0f0f5' : '#1d1d1f';
    const textMuted   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
    const arrowColor  = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)';
    const trueColor   = '#34c759';
    const falseColor  = '#ff3b30';

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const truncate = (c: CanvasRenderingContext2D, text: string, maxW: number): string => {
      if (c.measureText(text).width <= maxW) return text;
      let t = text;
      while (t.length > 0 && c.measureText(t + '…').width > maxW) {
        t = t.slice(0, -1);
      }
      return t + '…';
    };

    const drawNode = (
      x: number, y: number, w: number, h: number,
      label: string, sub: string,
      accent: string, isActive: boolean
    ) => {
      const r = 14;
      ctx.shadowColor = 'rgba(0,0,0,0.12)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;

      ctx.fillStyle = isActive ? accent + '18' : surfaceColor;
      ctx.strokeStyle = isActive ? accent : borderColor;
      ctx.lineWidth = isActive ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(x - w / 2, y, w, h, r);
      ctx.fill();
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.stroke();

      if (isActive) {
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.roundRect(x - w / 2, y + 8, 3, h - 16, 2);
        ctx.fill();
      }

      ctx.font = `600 10px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif`;
      ctx.fillStyle = isActive ? accent : textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const maxW = w - 28;
      ctx.fillText(truncate(ctx, label.toUpperCase(), maxW), x, y + h * 0.3);

      ctx.font = `500 11px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      ctx.fillStyle = textPrimary;
      ctx.fillText(truncate(ctx, sub, maxW), x, y + h * 0.68);
    };

    const drawVArrow = (fromX: number, fromY: number, toY: number, color: string, labelText: string) => {
      const GAP = 6;
      const sy = fromY + GAP;
      const ey = toY - GAP;
      const mx = (sy + ey) / 2;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(fromX, sy);
      ctx.lineTo(fromX, ey);
      ctx.stroke();
      ctx.setLineDash([]);

      const AH = 6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(fromX, ey + AH);
      ctx.lineTo(fromX - 4, ey);
      ctx.lineTo(fromX + 4, ey);
      ctx.closePath();
      ctx.fill();

      const labelX = fromX + 12;
      const labelY = mx;
      ctx.font = `600 8.5px -apple-system, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, labelX, labelY);
    };

    const drawHArrow = (fromX: number, midY: number, toX: number, color: string, active: boolean) => {
      const GAP = 6;
      const sx = fromX - NODE_W / 2 - GAP;
      const ex = toX + OUTCOME_W / 2 + GAP;

      ctx.strokeStyle = active ? color : arrowColor;
      ctx.lineWidth = active ? 1.5 : 1;
      ctx.setLineDash(active ? [] : [3, 4]);
      ctx.beginPath();
      ctx.moveTo(sx, midY);
      ctx.lineTo(ex + 8, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      const AH = 6;
      ctx.fillStyle = active ? color : arrowColor;
      ctx.beginPath();
      ctx.moveTo(ex, midY);
      ctx.lineTo(ex + AH, midY - 4);
      ctx.lineTo(ex + AH, midY + 4);
      ctx.closePath();
      ctx.fill();
    };

    const mainX = W * 0.62;
    const outcomeX = W * 0.2;

    let cy = DIAGRAM_PAD;
    drawNode(mainX, cy, NODE_W, NODE_H, 'Input', 'Test Workbench', trueColor, false);

    let prevBottomY = cy + NODE_H;

    rules.forEach((rule, idx) => {
      const nextNodeY = cy + NODE_H + (idx + 1) * ROW_GAP;

      drawVArrow(mainX, prevBottomY, nextNodeY, arrowColor, 'No match');

      const isMatched = evalResult.matchedRuleId === rule.id;
      const opLabel = rule.operator.replace('_', ' ');
      const valDisplay = rule.operator === 'regex'
        ? 'regex pattern'
        : rule.value.length > 12 ? rule.value.slice(0, 12) + '…' : rule.value;
      const nodeLabel = `Rule ${idx + 1}: ${rule.variableName}`;
      const nodeSub   = `${opLabel} "${valDisplay}"`;

      drawNode(mainX, nextNodeY, NODE_W, NODE_H, nodeLabel, nodeSub, trueColor, isMatched);

      const midY = nextNodeY + NODE_H / 2;
      drawHArrow(mainX, midY, outcomeX, trueColor, isMatched);

      const outcomeActive = isMatched;
      const outcomeLabel = 'Outcome';
      const outcomeSub   = rule.outcome;
      drawNode(outcomeX, nextNodeY, OUTCOME_W, NODE_H, outcomeLabel, outcomeSub, trueColor, outcomeActive);

      ctx.font = `600 8.5px -apple-system, sans-serif`;
      ctx.fillStyle = isMatched ? trueColor : arrowColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Match', (mainX - NODE_W / 2 + outcomeX + OUTCOME_W / 2) / 2, midY - 9);

      prevBottomY = nextNodeY + NODE_H;
    });

    const defaultY = cy + NODE_H + (rules.length + 1) * ROW_GAP - ROW_GAP / 2 + ROW_GAP / 2 - 10;
    drawVArrow(mainX, prevBottomY, defaultY, falseColor, 'No match');
    const isDefaultApplied = evalResult.matchedRuleId === null;
    drawNode(mainX, defaultY, NODE_W, NODE_H, 'Default', defaultOutcome, falseColor, isDefaultApplied);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) drawDiagram(ctx, scaleFactor);
  }, [rules, evalResult, defaultOutcome, scaleFactor]);

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 flex flex-col gap-4 shadow-sm overflow-hidden text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-text-primary">Decision Flow Diagram</h3>
          <p className="text-xs text-text-muted mt-0.5">Auto-generated visual trace of your rules</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="btn btn-primary btn-sm h-8 py-0 px-3 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
            title="Open fullscreen preview"
          >
            <IconEye size={12} /> Preview
          </button>
          <button
            onClick={() => exportImage('png')}
            className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Export as PNG"
          >
            <IconDownload size={12} /> PNG
          </button>
          <button
            onClick={() => exportImage('jpeg')}
            className="btn btn-secondary btn-sm h-8 py-0 px-2.5 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Export as JPG"
          >
            <IconDownload size={12} /> JPG
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto flex justify-center py-1">
        <canvas
          ref={canvasRef}
          width={logicalWidth * scaleFactor}
          height={logicalHeight * scaleFactor}
          style={{ width: `${logicalWidth}px`, height: `${logicalHeight}px` }}
          className="rounded-2xl max-w-full"
        />
      </div>
    </div>
  );
}
