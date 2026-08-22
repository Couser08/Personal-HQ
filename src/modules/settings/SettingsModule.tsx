import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import { subscribeAiUsage, type AiUsageStats, type RateLimitStatus } from '../../lib/ai-usage-tracker';
import { type PerformanceMode } from '../../store/types';
import { usePerformanceTelemetry, getEffectiveReducedMotion } from '../../lib/performanceEngine';
import { AppearanceSection } from './components/AppearanceSection';
import { AiSettingsSection } from './components/AiSettingsSection';
import { NotificationsSection } from './components/NotificationsSection';
import { PreferencesSection } from './components/PreferencesSection';
import { PerformanceSection } from './components/PerformanceSection';
import { PerformanceGuideModal } from './components/PerformanceGuideModal';

export default function SettingsModule() {
  const { theme, setTheme, settings, updateSettings } = useAppStore(
    useShallow((state) => ({
      theme: state.theme,
      setTheme: state.setTheme,
      settings: state.settings,
      updateSettings: state.updateSettings,
    })),
  );

  const addToast = useToastStore((s) => s.addToast);
  const [toastPos, setToastPos] = useState<string>(
    useToastStore.getState().position || 'top-right',
  );
  const [isPerformanceHelpOpen, setIsPerformanceHelpOpen] = useState(false);

  const [usageStats, setUsageStats] = useState<AiUsageStats | null>(null);
  const [rateStatus, setRateStatus] = useState<RateLimitStatus | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAiUsage((stats, status) => {
      setUsageStats(stats);
      setRateStatus(status);
    });
    return () => unsubscribe();
  }, []);

  const { fps: liveFps, frameTime: liveFrameTime } = usePerformanceTelemetry(true);
  const currentPerfMode: PerformanceMode = settings.performanceMode || 'balanced';
  const effectiveReducedMotion = getEffectiveReducedMotion(settings);
  const isDev = Boolean(import.meta.env.DEV);

  const handleSetPerformanceMode = (newMode: PerformanceMode) => {
    updateSettings({
      performanceMode: newMode,
      reduceBlur: newMode !== 'balanced',
      reduceAnimations: newMode === 'potato',
      wavyEffectEnabled: newMode !== 'potato',
      wavyEffectMode: newMode === 'balanced' ? 'premium' : 'minimal',
    });

    const labels: Record<PerformanceMode, { title: string; desc: string }> = {
      performance: {
        title: '⚡ Performance Mode Active',
        desc: '120 FPS pure GPU compositing enabled. Blurs disabled for maximum frame rate.',
      },
      balanced: {
        title: '✨ Balanced Mode Active',
        desc: 'Smooth spring physics and glassmorphism enabled.',
      },
      potato: {
        title: '🥔 Potato Mode Active',
        desc: 'Zero idle CPU load. Instant snap transitions and blurs disabled.',
      },
    };

    addToast(labels[newMode].title, labels[newMode].desc, 'info');
  };

  const handleToastPos = (val: string) => {
    setToastPos(val);
    useToastStore.getState().setPosition(val as any);
    addToast(
      'Position Updated',
      `Toast alerts will now appear at ${val.replace('-', ' ')}`,
      'info',
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex flex-col gap-8 w-full max-w-3xl mx-auto pb-12"
    >
      <div className="flex flex-col gap-2 mt-4 px-4 sm:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
          Settings
        </h1>
      </div>

      <AppearanceSection
        theme={theme}
        setTheme={setTheme}
        accentColor={settings.accentColor}
        updateSettings={updateSettings}
      />

      <AiSettingsSection
        settings={settings}
        updateSettings={updateSettings}
        usageStats={usageStats}
        rateStatus={rateStatus}
        addToast={addToast}
      />

      <NotificationsSection
        toastPos={toastPos}
        handleToastPos={handleToastPos}
        addToast={addToast}
        settings={settings}
        updateSettings={updateSettings}
      />

      <PreferencesSection settings={settings} updateSettings={updateSettings} theme={theme} />

      <PerformanceSection
        currentPerfMode={currentPerfMode}
        handleSetPerformanceMode={handleSetPerformanceMode}
        liveFps={liveFps}
        liveFrameTime={liveFrameTime}
        effectiveReducedMotion={effectiveReducedMotion}
        settings={settings}
        updateSettings={updateSettings}
        addToast={addToast}
        setIsPerformanceHelpOpen={setIsPerformanceHelpOpen}
        isDev={isDev}
      />

      <PerformanceGuideModal
        isOpen={isPerformanceHelpOpen}
        onClose={() => setIsPerformanceHelpOpen(false)}
        currentPerfMode={currentPerfMode}
        handleSetPerformanceMode={handleSetPerformanceMode}
      />
    </motion.div>
  );
}