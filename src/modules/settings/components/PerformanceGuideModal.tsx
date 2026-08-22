import React from 'react';
import { IconInfoCircle, IconSparkles } from '@tabler/icons-react';
import { Modal } from '../../../components/ui/Modal';
import { type PerformanceMode } from '../../../store/types';

interface PerformanceGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPerfMode: PerformanceMode;
  handleSetPerformanceMode: (m: PerformanceMode) => void;
}

export const PerformanceGuideModal: React.FC<PerformanceGuideModalProps> = ({
  isOpen,
  onClose,
  currentPerfMode,
  handleSetPerformanceMode,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Performance & Animation Engine Guide"
      maxWidthClassName="max-w-3xl"
    >
      <div className="flex flex-col gap-6 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-alt border border-border">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <IconInfoCircle size={20} />
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-bold text-text-primary text-sm mb-0.5">
                3 Adaptive Rendering Tiers
              </p>
              Personal HQ is engineered to deliver 120 FPS high-refresh rate speed on gaming rigs
              while remaining battery-friendly on laptops and ultra-lightweight on low-power devices.
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface-alt border border-border">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
              <IconSparkles size={20} />
            </div>
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-bold text-text-primary text-sm mb-0.5">Reduced Motion &amp; WCAG 2.2</p>
              In production, Personal HQ strictly honors your OS accessibility preference. In local
              development, the Dev Motion Bypass prevents OS flags from blocking animation
              previews.
            </div>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-alt/70 font-bold text-text-primary">
                <th className="p-3.5">Engine Spec</th>
                <th className="p-3.5">⚡ Performance</th>
                <th className="p-3.5">✨ Balanced (Default)</th>
                <th className="p-3.5">🥔 Potato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-text-secondary font-medium">
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Target Frame Rate</td>
                <td className="p-3.5 text-amber-500 font-bold font-mono">120 FPS</td>
                <td className="p-3.5 text-purple-500 font-bold font-mono">60 FPS Fluid</td>
                <td className="p-3.5 text-emerald-500 font-bold font-mono">0 FPS Idle (Instant)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">GPU &amp; Rendering</td>
                <td className="p-3.5">
                  Compositor Only (<code className="text-[10px]">transform, opacity</code>)
                </td>
                <td className="p-3.5">3D Parallax &amp; Fluid Springs</td>
                <td className="p-3.5">Flat 2D Elements</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Backdrop Blur</td>
                <td className="p-3.5 font-mono text-text-muted">Disabled (0px)</td>
                <td className="p-3.5 font-mono text-emerald-500 font-bold">Enabled (16px blur)</td>
                <td className="p-3.5 font-mono text-text-muted">Disabled (0px)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Spring Physics</td>
                <td className="p-3.5">Snappy (Stiffness: 500)</td>
                <td className="p-3.5">Organic (Stiffness: 320)</td>
                <td className="p-3.5">Instant Snap (0ms)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Continuous Loops</td>
                <td className="p-3.5">Optimized RAF</td>
                <td className="p-3.5">Continuous Particle Wave</td>
                <td className="p-3.5 font-bold text-emerald-500">Terminated (0% CPU)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Battery &amp; CPU Load</td>
                <td className="p-3.5">Very Low</td>
                <td className="p-3.5">Moderate</td>
                <td className="p-3.5 font-bold text-emerald-500">Minimal (Max Battery)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-text-primary">Best Suited For</td>
                <td className="p-3.5">144Hz+ monitors, fast typists, dense dashboards</td>
                <td className="p-3.5">Modern MacBooks, Windows laptops, iOS/Android</td>
                <td className="p-3.5">Older PCs, virtual machines, weak battery mode</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Quick 1-Click Switch inside Modal */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-surface-alt border border-border gap-4">
          <div>
            <p className="text-xs font-bold text-text-primary">Quick Switch Now</p>
            <p className="text-[11px] text-text-secondary">
              Changes take effect immediately across all windows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['performance', 'balanced', 'potato'] as PerformanceMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleSetPerformanceMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentPerfMode === m
                    ? 'bg-primary text-text-on-accent shadow-sm'
                    : 'bg-surface hover:bg-surface-hover border border-border text-text-secondary'
                }`}
              >
                <span>{m === 'performance' ? '⚡' : m === 'balanced' ? '✨' : '🥔'}</span>
                <span className="capitalize">{m}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-primary text-text-on-accent text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
