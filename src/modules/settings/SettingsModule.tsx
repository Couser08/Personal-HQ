import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { IconSun, IconMoon, IconPalette, IconBell, IconRefresh, IconHourglass } from '@tabler/icons-react';

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
            <div className="inline-flex gap-2 items-center p-1 rounded-2xl border bg-surface-alt border-border">
              <button
                onClick={() => setTheme('light')}
                className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <IconSun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
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
            <p className="text-sm font-semibold text-text-primary">Toast Position</p>
            <p className="text-xs text-text-secondary mt-0.5 mb-3">Where notifications appear on screen</p>
            <select
              defaultValue={useToastStore.getState().position}
              onChange={e => useToastStore.getState().setPosition(e.target.value as 'top-right')}
              className="select-field"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
            </select>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-text-primary">Test Notification</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addToast('Success', 'Everything looks great!', 'success')}
                className="btn btn-secondary btn-md text-green-600 border-green-500/30 hover:bg-green-500/10"
              >
                ✓ Success
              </button>
              <button
                onClick={() => addToast('Error', 'Something went wrong.', 'error')}
                className="btn btn-danger btn-md"
              >
                ✕ Error
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ── Countdown Template ── (full width) */}
        <div className="md:col-span-2">
          <SectionCard
            icon={<IconHourglass className="w-5 h-5" />}
            iconColor="#f59e0b"
            iconBg="rgba(245,158,11,0.12)"
            title="Countdown Display Template"
          >
            <div>
              <p className="mb-3 text-xs text-text-secondary">Select how countdown cards appear globally across your app</p>
              <select
                value={settings.countdownTemplate}
                onChange={e => updateSettings({ countdownTemplate: e.target.value as never })}
                className="select-field"
              >
                {COUNTDOWN_TEMPLATES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </SectionCard>
        </div>

        {/* ── App Tour ── (full width) */}
        <div className="md:col-span-2">
          <SectionCard
            icon={<IconRefresh className="w-5 h-5" />}
            iconColor="#a855f7"
            iconBg="rgba(168,85,247,0.12)"
            title="App Onboarding"
          >
            <div>
              <p className="text-sm font-semibold text-text-primary">Restart App Tour</p>
              <p className="mt-1 mb-4 text-xs leading-relaxed text-text-secondary">
                Want a quick refresher on how to use Personal HQ? Trigger the interactive guided tour to explore all the main features.
              </p>
              <button
                onClick={() => window.dispatchEvent(new Event('start-app-tour'))}
                className="btn btn-primary btn-md"
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
