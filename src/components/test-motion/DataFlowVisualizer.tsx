import { useEffect, useRef, useState } from 'react';
import { useActivePreset } from './useMotionTestStore';
import { IconRefresh, IconRadar } from '@tabler/icons-react';

interface NodePoint {
  id: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
}

const INITIAL_NODES: NodePoint[] = [
  { id: 'core', label: 'Personal HQ', x: 250, y: 110, vx: 0.2, vy: 0.1, color: '#111111', radius: 24 },
  { id: 'tasks', label: 'To-Do Core', x: 100, y: 60, vx: -0.15, vy: 0.2, color: '#3B82F6', radius: 18 },
  { id: 'journal', label: 'Daily Journal', x: 400, y: 60, vx: 0.1, vy: -0.15, color: '#EC4899', radius: 18 },
  { id: 'habits', label: 'Habit Engine', x: 140, y: 170, vx: 0.2, vy: -0.1, color: '#10B981', radius: 18 },
  { id: 'vision', label: 'Vision Matrix', x: 360, y: 170, vx: -0.2, vy: 0.15, color: '#F59E0B', radius: 18 },
];

export function DataFlowVisualizer() {
  const preset = useActivePreset();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<NodePoint[]>(JSON.parse(JSON.stringify(INITIAL_NODES)));
  const [pulseCount, setPulseCount] = useState(0);

  // Canvas render loop following `fixing-motion-performance` rule:
  // In minimal mode: draw once and stop loop to prevent background battery drain.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let running = true;

    const width = 500;
    const height = 220;
    canvas.width = width * (window.devicePixelRatio || 1);
    canvas.height = height * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const render = () => {
      if (!running) return;

      ctx.clearRect(0, 0, width, height);

      const nodes = nodesRef.current;

      // Draw Connection lines
      ctx.lineWidth = 1.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 260) {
            const alpha = (1 - dist / 260) * 0.35;
            ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw Nodes
      nodes.forEach((node, idx) => {
        // In balanced/performance mode, apply organic subtle drifting
        if (!preset.reducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < node.radius || node.x > width - node.radius) node.vx *= -1;
          if (node.y < node.radius || node.y > height - node.radius) node.vy *= -1;
        }

        // Outer glow/ring
        if (preset.enableBlur) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = `${node.color}15`;
          ctx.fill();
        }

        // Inner Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? 'var(--color-primary)' : node.color;
        ctx.fill();

        // Label
        ctx.fillStyle = 'var(--text-primary)';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 14);
      });

      if (!preset.reducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      running = false;
      if (animId) cancelAnimationFrame(animId);
    };
  }, [preset.reducedMotion, preset.enableBlur, pulseCount]);

  const handleStimulateNetwork = () => {
    nodesRef.current.forEach((n) => {
      n.vx = (Math.random() - 0.5) * 1.8;
      n.vy = (Math.random() - 0.5) * 1.8;
    });
    setPulseCount((c) => c + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
          4. Real-Time Data Flow Matrix
        </h3>
        <span className="text-[10px] font-mono text-text-muted">
          {preset.reducedMotion ? 'Static Graph (0% CPU)' : preset.mode === 'performance' ? '120fps RAF Compositor' : 'Organic Wave Physics'}
        </span>
      </div>

      <div className="w-full bg-surface border border-border rounded-3xl p-6 shadow-float flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        
        {/* Canvas Display */}
        <div className="w-full max-w-[500px] h-[220px] relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '220px' }}
            className="cursor-pointer select-none"
            onClick={handleStimulateNetwork}
            title="Click to stimulate physics pulse"
          />
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between w-full pt-3 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium">
            <IconRadar size={16} className={preset.reducedMotion ? 'text-text-muted' : 'text-emerald-500 animate-spin'} style={{ animationDuration: '4s' }} />
            <span>5 Nodes Cross-Synced</span>
          </div>

          <button
            onClick={handleStimulateNetwork}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-primary text-xs font-bold border border-border cursor-pointer transition-all active:scale-95 shadow-sm"
          >
            <IconRefresh size={14} />
            <span>Stimulate Flow</span>
          </button>
        </div>
      </div>
    </div>
  );
}
