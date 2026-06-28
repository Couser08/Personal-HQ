import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { IconSun, IconMoon, IconPalette, IconBell, IconRefresh, IconHourglass } from '@tabler/icons-react';
import { CustomSelect } from '../../components/ui/CustomSelect';

const COUNTDOWN_TEMPLATES = [
  { value: 'default',  label: 'Default Cards' },
  { value: 'minimal',  label: 'Minimal Text' },
  { value: 'gradient', label: 'Gradient Vibe' },
  { value: 'circle',   label: 'Circular Progress' },
  { value: 'event',    label: 'Event Celebration' },
  { value: 'sale',     label: 'Flash Sale' },
  { value: 'dark',     label: 'Dark Mode' },
  { value: 'compact',  label: 'Compact Row' },
  { value: 'flip',     label: 'Mechanical Flip' },
  { value: 'progress', label: 'Progress Ring' },
  { value: 'vertical', label: 'Vertical Stack' },
  { value: 'split',    label: 'Split Layout' },
];

const TOAST_POSITIONS = [
  { value: 'top-right',     label: 'Top Right' },
  { value: 'top-left',      label: 'Top Left' },
  { value: 'top-center',    label: 'Top Center' },
  { value: 'bottom-right',  label: 'Bottom Right' },
  { value: 'bottom-left',   label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
];

const SectionCard = ({ icon, iconColor, iconBg, title, children }: {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-5 p-6 rounded-2xl border bg-surface border-border">
    <div className="flex gap-3 items-center">
      <div className="flex justify-center items-center w-9 h-9 rounded-xl shrink-0" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
    </div>
    {children}
  </div>
);

export default function SettingsModule() {
  const { theme, setTheme, settings, updateSettings } = useAppStore();
  const addToast = useToastStore(s => s.addToast);

  // Track toast position locally so CustomSelect is controlled
  const [toastPos, setToastPos] = useState<string>(useToastStore.getState().position || 'top-right');

  const handleToastPos = (val: string) => {
    setToastPos(val);
    useToastStore.getState().setPosition(val as 'top-right');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex flex-col gap-6 max-w-4xl"
    >
      {/* Header */}
      <div>
        <h1 className="flex gap-2 items-center text-2xl font-bold">
          Settings <span className="inline-block w-2 h-2 rounded-full bg-primary" />
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Manage app preferences and appearance</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

        {/* ── Appearance ── */}
        <SectionCard
          icon={<IconPalette className="w-5 h-5" />}
          iconColor="#f43f5e"
          iconBg="rgba(244,63,94,0.12)"
          title="Appearance"
        >
          <div>
            <p className="text-sm font-semibold text-text-primary">Theme</p>
            <p className="text-xs text-text-secondary mt-0.5 mb-3">Choose between light and dark mode</p>
            <div className="inline-flex gap-1 items-center p-1 rounded-2xl border bg-surface-alt border-border">
              <button
                onClick={() => setTheme('light')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  theme === 'light'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <IconSun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  theme === 'dark'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                <IconMoon className="w-4 h-4" /> Dark
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Notifications ── */}
        <SectionCard
          icon={<IconBell className="w-5 h-5" />}
          iconColor="#3b82f6"
          iconBg="rgba(59,130,246,0.12)"
          title="Notifications"
        >
          <div>
            <p className="text-sm font-semibold text-text-primary mb-1">Toast Position</p>
            <p className="text-xs text-text-secondary mb-3">Where notifications appear on screen</p>
            <CustomSelect
              value={toastPos}
              onChange={handleToastPos}
              options={TOAST_POSITIONS}
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text-primary">Test Notification</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addToast('Success', 'Everything looks great!', 'success')}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold border border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/15 transition-colors"
              >
                ✓ Success
              </button>
              <button
                onClick={() => addToast('Error', 'Something went wrong.', 'error')}
                className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold border border-rose-500/30 bg-rose-500/5 text-rose-600 hover:bg-rose-500/15 transition-colors"
              >
                ✕ Error
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Countdown Template ── full width */}
        <div className="md:col-span-2">
          <SectionCard
            icon={<IconHourglass className="w-5 h-5" />}
            iconColor="#f59e0b"
            iconBg="rgba(245,158,11,0.12)"
            title="Countdown Display Template"
          >
            <div>
              <p className="text-xs text-text-secondary mb-3">
                Select how countdown cards appear globally across your app
              </p>
              <div className="max-w-sm">
                <CustomSelect
                  value={settings.countdownTemplate}
                  onChange={val => updateSettings({ countdownTemplate: val as never })}
                  options={COUNTDOWN_TEMPLATES}
                />
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── App Tour ── full width */}
        <div className="md:col-span-2">
          <SectionCard
            icon={<IconRefresh className="w-5 h-5" />}
            iconColor="#a855f7"
            iconBg="rgba(168,85,247,0.12)"
            title="App Onboarding"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Restart App Tour</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                  Want a quick refresher on how to use Personal HQ? Trigger the interactive guided tour to explore all the main features.
                </p>
              </div>
              <button
                onClick={() => window.dispatchEvent(new Event('start-app-tour'))}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-muted text-white text-sm font-bold rounded-xl transition-all shrink-0"
              >
                Start Tour
              </button>
            </div>
          </SectionCard>
        </div>

      </div>
    </motion.div>
  );
}
