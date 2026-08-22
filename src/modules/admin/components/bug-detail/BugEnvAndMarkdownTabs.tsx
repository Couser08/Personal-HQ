import React from 'react';
import {
  IconDeviceMobile,
  IconDeviceDesktop,
  IconCheck,
  IconClipboardCopy,
} from '@tabler/icons-react';
import type { BugReport } from '../../../../store/types';
import { getRouteMeta, parseUserAgent } from '../../utils/bugReportHelpers';

interface BugEnvTabProps {
  report: BugReport;
}

export const BugEnvTab: React.FC<BugEnvTabProps> = ({ report }) => {
  const ua = parseUserAgent(report.userAgent);
  const routeMeta = getRouteMeta(report.route);
  const el = report.elementInfo;

  return (
    <div className="space-y-4 animate-in fade-in duration-150 text-xs text-left">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
            Operating System &amp; Browser
          </span>
          <p className="text-sm font-bold text-text-primary flex items-center gap-2">
            {ua.isMobile ? <IconDeviceMobile size={16} /> : <IconDeviceDesktop size={16} />}
            <span>
              {ua.os} · {ua.browser}
            </span>
          </p>
        </div>

        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
            Report Route / Subsystem
          </span>
          <p className="text-sm font-bold text-text-primary flex items-center gap-2">
            <span>{routeMeta.icon}</span>
            <span>/{report.route}</span>
          </p>
        </div>
      </div>

      {/* Viewport & Scrolling */}
      {el?.viewport && (
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-2 font-mono">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block">
            Client Viewport Resolution &amp; Scroll State
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-surface-alt">
              <span className="text-[10px] text-text-muted block">Width</span>
              <strong className="text-text-primary">{el.viewport.width}px</strong>
            </div>
            <div className="p-2 rounded-xl bg-surface-alt">
              <span className="text-[10px] text-text-muted block">Height</span>
              <strong className="text-text-primary">{el.viewport.height}px</strong>
            </div>
            <div className="p-2 rounded-xl bg-surface-alt">
              <span className="text-[10px] text-text-muted block">Scroll X</span>
              <strong className="text-text-primary">{el.viewport.scrollX}px</strong>
            </div>
            <div className="p-2 rounded-xl bg-surface-alt">
              <span className="text-[10px] text-text-muted block">Scroll Y</span>
              <strong className="text-text-primary">{el.viewport.scrollY}px</strong>
            </div>
          </div>
        </div>
      )}

      {/* User Agent String */}
      {report.userAgent && (
        <div className="p-4 rounded-3xl bg-surface border border-border/70 space-y-1.5 font-mono">
          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted font-sans block">
            Raw User-Agent Header
          </span>
          <div className="p-3 rounded-2xl bg-surface-alt/70 border border-border/60 text-text-secondary text-[11px] break-all">
            {report.userAgent}
          </div>
        </div>
      )}
    </div>
  );
};

interface BugMarkdownTabProps {
  report: BugReport;
  copiedKey: string | null;
  handleCopy: (text: string, key: string, label: string) => Promise<void>;
}

export const BugMarkdownTab: React.FC<BugMarkdownTabProps> = ({
  report,
  copiedKey,
  handleCopy,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in duration-150 text-left">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
          Complete Markdown Entry
        </span>
        <button
          type="button"
          onClick={() =>
            handleCopy(report.markdownContent || `# Bug: ${report.title}`, 'md', 'Markdown')
          }
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:opacity-90 text-text-on-accent text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          {copiedKey === 'md' ? <IconCheck size={14} /> : <IconClipboardCopy size={14} />}
          <span>{copiedKey === 'md' ? 'Copied' : 'Copy Markdown'}</span>
        </button>
      </div>

      <pre className="p-4 rounded-3xl bg-background border border-border font-mono text-xs text-text-primary max-h-72 overflow-y-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
        {report.markdownContent || `# Bug: ${report.title}\n\n${report.description}`}
      </pre>
    </div>
  );
};
