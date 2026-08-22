import React from 'react';
import {
  IconCpu,
  IconActivity,
  IconHelp,
  IconCompass,
  IconChevronRight,
  IconBug,
  IconFileText,
  IconDownload,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { ToggleSwitch } from './ToggleSwitch';
import { type PerformanceMode } from '../../../store/types';
import { useBugReportStore } from '../../../store/useBugReportStore';

interface PerformanceSectionProps {
  currentPerfMode: PerformanceMode;
  handleSetPerformanceMode: (m: PerformanceMode) => void;
  liveFps: number;
  liveFrameTime: number;
  effectiveReducedMotion: string;
  settings: any;
  updateSettings: (s: any) => void;
  addToast: (titleOrMessage: string, messageOrType: string, type?: any) => void;
  setIsPerformanceHelpOpen: (open: boolean) => void;
  isDev: boolean;
}

export const PerformanceSection: React.FC<PerformanceSectionProps> = ({
  currentPerfMode,
  handleSetPerformanceMode,
  liveFps,
  liveFrameTime,
  effectiveReducedMotion,
  settings,
  updateSettings,
  addToast,
  setIsPerformanceHelpOpen,
  isDev,
}) => {
  return (
    <>
      {/* ── System & Performance Section ── */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between ml-2 mr-1">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary">
            System &amp; Performance Engine
          </h2>
          <button
            onClick={() => setIsPerformanceHelpOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer"
            title="View Performance Guide"
          >
            <span className="w-4 h-4 rounded-full bg-surface-alt border border-border flex items-center justify-center text-[10px] font-black">
              ?
            </span>
            <span>Guide</span>
          </button>
        </div>

        <Card padding="lg" className="flex flex-col gap-5">
          {/* Header & Live Telemetry Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                <IconCpu className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-base font-bold text-text-primary">
                    Rendering &amp; Animation Engine
                  </p>
                  <button
                    onClick={() => setIsPerformanceHelpOpen(true)}
                    className="w-5 h-5 rounded-full bg-surface-alt hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                    title="What does each mode change?"
                  >
                    ?
                  </button>
                </div>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  Select your hardware profile to tune frame rates, backdrop blurs, and animation
                  physics.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-surface-alt/80 border border-border rounded-xl px-3 py-1.5 font-mono text-xs">
                <IconActivity
                  size={14}
                  className={
                    liveFps >= 55
                      ? 'text-emerald-500 animate-pulse'
                      : liveFps >= 30
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                />
                <span
                  className={`font-bold ${
                    liveFps >= 55
                      ? 'text-emerald-500'
                      : liveFps >= 30
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {liveFps} FPS
                </span>
                <span className="text-text-muted/40">•</span>
                <span className="text-text-secondary">{liveFrameTime}ms</span>
              </div>
              <button
                onClick={() => setIsPerformanceHelpOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-bold border border-border transition-all cursor-pointer shrink-0"
              >
                <IconHelp size={14} /> Breakdown
              </button>
            </div>
          </div>

          {/* 3-Mode Segmented Controller */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'performance' as PerformanceMode,
                label: 'Performance',
                emoji: '⚡',
                sub: '120 FPS GPU Composited',
                desc: 'Snappy composite transforms, zero blur, max throughput.',
                badge: '120 FPS',
                badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
              },
              {
                id: 'balanced' as PerformanceMode,
                label: 'Balanced',
                emoji: '✨',
                sub: 'Smooth & Glassmorphic',
                desc: 'Default physics, 3D parallax, fluid springs & soft blur.',
                badge: '60 FPS',
                badgeColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
              },
              {
                id: 'potato' as PerformanceMode,
                label: 'Potato',
                emoji: '🥔',
                sub: 'Zero Idle CPU',
                desc: 'Instant transitions, loops disabled, max battery saver.',
                badge: '0% Idle',
                badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
              },
            ].map((item) => {
              const isSelected = currentPerfMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSetPerformanceMode(item.id)}
                  className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden select-none ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                      : 'border-border bg-surface-alt/60 hover:bg-surface-alt hover:border-border/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-sm font-bold text-text-primary">{item.label}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-text-secondary mb-1">{item.sub}</span>
                  <p className="text-[11px] text-text-muted leading-snug">{item.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Active Mode Summary & Reduced Motion Telemetry */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl bg-surface-alt/50 border border-border text-xs gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-text-secondary">Engine Status:</span>
              <span className="font-mono font-bold text-text-primary uppercase bg-surface px-2 py-0.5 rounded border border-border">
                {currentPerfMode}
              </span>
              <span className="text-text-muted/40">•</span>
              <span className="text-text-secondary">
                Motion Policy:{' '}
                <strong
                  className={
                    effectiveReducedMotion === 'never'
                      ? 'text-blue-500'
                      : effectiveReducedMotion === 'always'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }
                >
                  {effectiveReducedMotion === 'never'
                    ? '⚡ Dev Override (Animations Active)'
                    : effectiveReducedMotion === 'always'
                    ? '🥔 Reduced Motion Enforced'
                    : '♿ OS Respect Mode'}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-3 text-text-muted text-[11px]">
              <span>
                Blur:{' '}
                <strong>
                  {currentPerfMode === 'balanced' && !settings.reduceBlur ? 'Active' : 'Disabled'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Physics:{' '}
                <strong>
                  {currentPerfMode === 'potato' || settings.reduceAnimations
                    ? 'Instant Snap (0ms)'
                    : currentPerfMode === 'performance'
                    ? 'Snappy 120Hz'
                    : 'Fluid 60Hz'}
                </strong>
              </span>
            </div>
          </div>

          {/* Granular Performance Overrides */}
          <div className="flex flex-col gap-3 pt-1">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Granular Engine Controls
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dev Motion Override */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/40 border border-border/80">
                <div className="flex flex-col pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-text-primary">Dev Motion Bypass</span>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      {isDev ? 'DEV MODE' : 'DEV TOOL'}
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Allow animations in dev mode even if OS has Reduced Motion enabled.
                  </span>
                </div>
                <ToggleSwitch
                  checked={settings.devMotionOverride !== false}
                  onChange={() => {
                    const next = settings.devMotionOverride === false;
                    updateSettings({ devMotionOverride: next });
                    addToast(
                      next ? 'Dev Motion Bypass Enabled' : 'OS Reduced Motion Enforced',
                      next
                        ? 'Animations will now render in local development.'
                        : 'Respecting OS-level reduced motion flag.',
                      'info',
                    );
                  }}
                />
              </div>

              {/* Disable Glassmorphism / Blurs */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/40 border border-border/80">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-text-primary">Disable Backdrop Blurs</span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Switches frosted glass to solid backgrounds for max GPU throughput.
                  </span>
                </div>
                <ToggleSwitch
                  checked={Boolean(settings.reduceBlur)}
                  onChange={() => {
                    const next = !settings.reduceBlur;
                    updateSettings({ reduceBlur: next });
                    addToast(
                      next ? 'Backdrop Blurs Disabled' : 'Backdrop Blurs Enabled',
                      next ? 'Solid backgrounds active' : 'Glassmorphism active',
                      'info',
                    );
                  }}
                />
              </div>

              {/* Force Zero Motion */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/40 border border-border/80">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-text-primary">Zero Animations Mode</span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Enforces instant transitions (0ms) across all components.
                  </span>
                </div>
                <ToggleSwitch
                  checked={Boolean(settings.reduceAnimations)}
                  onChange={() => {
                    const next = !settings.reduceAnimations;
                    updateSettings({ reduceAnimations: next });
                    addToast(
                      next ? 'Zero Animations Active' : 'Spring Animations Active',
                      next ? 'All transitions set to 0ms' : 'Spring physics restored',
                      'info',
                    );
                  }}
                />
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/40 border border-border/80">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-text-primary">Sound Effects</span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Haptic audio feedback for tasks and interactions.
                  </span>
                </div>
                <ToggleSwitch
                  checked={settings.soundEnabled !== false}
                  onChange={() => {
                    const next = settings.soundEnabled === false;
                    updateSettings({ soundEnabled: next });
                    addToast(
                      next ? 'Sound Effects Enabled' : 'Sound Effects Disabled',
                      next ? 'Web audio haptics active' : 'Audio feedback muted',
                      'info',
                    );
                  }}
                />
              </div>

              {/* Ambient Waves */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/40 border border-border/80">
                <div className="flex flex-col pr-2">
                  <span className="text-xs font-bold text-text-primary">
                    Background Ambient Waves
                  </span>
                  <span className="text-[11px] text-text-muted mt-0.5">
                    Subtle background wave rendering in header and cards.
                  </span>
                </div>
                <ToggleSwitch
                  checked={settings.wavyEffectEnabled !== false}
                  onChange={() => {
                    const next = settings.wavyEffectEnabled === false;
                    updateSettings({ wavyEffectEnabled: next });
                    addToast(next ? 'Ambient Waves Enabled' : 'Ambient Waves Disabled', '', 'info');
                  }}
                />
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-border-hairline" />

          {/* Restart Tour button */}
          <button
            onClick={() => window.dispatchEvent(new Event('start-app-tour'))}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-alt transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                <IconCompass className="w-5 h-5" stroke={1.5} />
              </div>
              <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">
                Restart Onboarding Tour
              </p>
            </div>
            <IconChevronRight className="w-4 h-4 text-text-muted" />
          </button>
        </Card>
      </section>

      {/* ── Bug Reporting & Diagnostics Section ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">
          Bug Reporting &amp; Diagnostics
        </h2>
        <Card padding="lg" className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/15 shrink-0 mt-0.5">
                <IconBug className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-text-primary">Interactive Bug Reporter</p>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  Point at any element on screen to automatically capture its ID, styles, position &amp;
                  visual snapshot.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] font-mono text-text-muted bg-surface-alt px-2 py-0.5 rounded-md border border-border">
                    Shortcut: <kbd className="font-bold">Ctrl+Shift+B</kbd>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => useBugReportStore.getState().startInspection()}
              className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-[13px] shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <IconBug size={16} /> Inspect &amp; Report Bug
            </button>
          </div>

          <div className="h-px w-full bg-border-hairline my-1" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-alt/50 p-3.5 rounded-xl border border-border/60">
            <div className="flex items-center gap-2.5">
              <IconFileText className="w-4 h-4 text-text-secondary" />
              <span className="text-[13px] font-medium text-text-secondary">
                Bug reports are maintained in local markdown ledger and synchronized with the database.
              </span>
            </div>
            <button
              onClick={() => useBugReportStore.getState().downloadMarkdownFile()}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-primary transition-colors cursor-pointer shrink-0"
            >
              <IconDownload size={14} /> Download reports.md
            </button>
          </div>
        </Card>
      </section>
    </>
  );
};
