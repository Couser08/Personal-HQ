import React from 'react';
import { IconCheck, IconCopy, IconLayersIntersect } from '@tabler/icons-react';
import type { BugReport } from '../../../../store/types';

interface BugDomTabProps {
  report: BugReport;
  copiedKey: string | null;
  handleCopy: (text: string, key: string, label: string) => Promise<void>;
}

export const BugDomTab: React.FC<BugDomTabProps> = ({ report, copiedKey, handleCopy }) => {
  const el = report.elementInfo;
  const isGroup = el?.isGroup && (el.groupCount || 0) > 1;

  if (!el) {
    return (
      <div className="p-6 rounded-3xl bg-surface-alt/40 border border-dashed border-border text-center text-text-muted">
        <p className="text-xs font-bold font-sans">
          No DOM Element telemetry was captured for this report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-150 font-mono text-xs text-left">
      {/* Ancestor Path */}
      <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans flex items-center gap-1.5">
            <span>🌳</span> Complete Ancestor Nesting Path
          </span>
          <button
            type="button"
            onClick={() => handleCopy(el.ancestorPath || el.selector, 'ancestor', 'Ancestor Path')}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold font-sans cursor-pointer"
          >
            {copiedKey === 'ancestor' ? <IconCheck size={13} /> : <IconCopy size={13} />}
            <span>{copiedKey === 'ancestor' ? 'Copied' : 'Copy Path'}</span>
          </button>
        </div>
        <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/60 text-text-primary break-all font-semibold">
          {el.ancestorPath || el.selector}
        </div>
      </div>

      {/* Geometry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-3xl bg-surface border border-border/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
            Tag &amp; Identifier
          </span>
          <p className="text-sm font-bold text-text-primary">
            &lt;{el.tag}&gt; {el.id ? `#${el.id}` : ''}
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-surface border border-border/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
            Dimensions (W × H)
          </span>
          <p className="text-sm font-bold text-primary">
            {Math.round(el.boundingRect.width)} × {Math.round(el.boundingRect.height)} px
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-surface border border-border/70">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block mb-1">
            Coordinates (X, Y)
          </span>
          <p className="text-sm font-bold text-text-primary">
            x: {Math.round(el.boundingRect.x)}, y: {Math.round(el.boundingRect.y)}
          </p>
        </div>
      </div>

      {/* Data Attributes */}
      {el.dataAttributes && Object.keys(el.dataAttributes).length > 0 && (
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans block">
            Captured Data Attributes
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {Object.entries(el.dataAttributes).map(([key, val]) => (
              <span
                key={key}
                className="px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[11px]"
              >
                <strong>{key}</strong>: "{val}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Class Token Badges */}
      {el.classes && el.classes.length > 0 && (
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-text-muted font-sans block">
              Applied CSS Classes ({el.classes.length})
            </span>
            <button
              type="button"
              onClick={() => handleCopy(el.classes.join(' '), 'classes', 'Classes')}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold font-sans cursor-pointer"
            >
              {copiedKey === 'classes' ? <IconCheck size={13} /> : <IconCopy size={13} />}
              <span>{copiedKey === 'classes' ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto custom-scrollbar p-1">
            {el.classes.map((cls, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-xl bg-surface-alt border border-border/60 text-text-secondary text-[11px]"
              >
                .{cls}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Element Cluster */}
      {isGroup && el.groupElements && (
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-3">
          <span className="text-[11px] font-black uppercase tracking-wider text-purple-500 font-sans flex items-center gap-1.5">
            <IconLayersIntersect size={14} /> Linked Cluster Elements ({el.groupElements.length})
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {el.groupElements.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-2xl bg-surface-alt/70 border border-border/50 flex items-center justify-between gap-3 text-[11px]"
              >
                <span className="text-text-primary font-bold">
                  #{idx + 1} &lt;{item.tag}&gt;
                </span>
                <span className="text-text-muted truncate flex-1 font-mono">{item.selector}</span>
                <span className="text-text-secondary font-bold shrink-0">
                  {Math.round(item.boundingRect.width)}×{Math.round(item.boundingRect.height)}px
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
