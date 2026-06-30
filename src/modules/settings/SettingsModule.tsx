import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type AccentColor } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import {
  IconSun, IconMoon, IconPalette, IconBell, IconHourglass,
  IconCheck, IconX, IconCompass, IconPlayerPlay, IconDeviceDesktop
} from '@tabler/icons-react';
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

const ACCENT_COLORS: { name: AccentColor; hex: string }[] = [
  { name: 'rose',   hex: '#f43f5e' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'blue',   hex: '#3b82f6' },
  { name: 'green',  hex: '#22c55e' },
  { name: 'amber',  hex: '#f59e0b' },
  { name: 'teal',   hex: '#06b6d4' },
  { name: 'gray',   hex: '#6b7280' },
];

export default function SettingsModule() {
  const { theme, setTheme, settings, updateSettings } = useAppStore();
  const addToast = useToastStore(s => s.addToast);
  const [toastPos, setToastPos] = useState<string>(useToastStore.getState().position || 'top-right');

  const handleToastPos = (val: string) => {
    setToastPos(val);
    useToastStore.getState().setPosition(val as any);
    addToast('Position Updated', `Toast alerts will now appear at ${val.replace('-', ' ')}`, 'info');
  };

  // Render a mini preview countdown card based on currently selected template style
  const renderCountdownPreview = () => {
    return (
      <div className={`p-4 rounded-xl border border-border bg-surface-alt flex flex-col gap-2 max-w-[200px] w-full shadow-sm`}>
        <div className="flex justify-between items-center text-[10px] text-text-muted font-bold">
          <span>Exam</span>
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary">12 Oct</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-extrabold tracking-tight text-text-primary">27</span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary">
            Days Left
          </span>
          <span className="text-[9px] font-mono text-text-muted">08h 45m 12s left</span>
        </div>
        <div className="w-full bg-border-alt h-1 rounded-full overflow-hidden mt-1">
          <div className="bg-primary h-full w-[70%]" />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ type: 'spring', damping: 24, stiffness: 300 }}
      className="flex flex-col gap-6 max-w-4xl"
    >
      {/* Header Row (mockup style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Settings <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
          </h1>
          <p className="text-sm text-text-secondary">Manage your preferences and customize your experience</p>
        </div>

        {/* Shortcut system dropdown at top-right */}
        <div className="w-48 shrink-0">
          <CustomSelect
            value={theme === 'system' ? 'system' : theme}
            onChange={(val) => setTheme(val as any)}
            options={[
              { value: 'system', label: 'System Default' },
              { value: 'light',  label: 'Light Mode' },
              { value: 'dark',   label: 'Dark Mode' }
            ]}
          />
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Appearance Card ── */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <IconPalette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Appearance</h3>
              <p className="text-xs text-text-muted">Customize how Personal HQ looks</p>
            </div>
          </div>

          {/* Theme selection buttons */}
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-sm font-semibold text-text-primary">Theme</p>
              <p className="text-xs text-text-secondary mt-0.5">Choose your preferred theme</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <IconSun className="w-4 h-4" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <IconMoon className="w-4 h-4" /> Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  theme === 'system'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <IconDeviceDesktop className="w-4 h-4" /> System
              </button>
            </div>
          </div>

          {/* Accent color swatches */}
          <div className="flex flex-col gap-2.5">
            <div>
              <p className="text-sm font-semibold text-text-primary">Accent Color</p>
              <p className="text-xs text-text-secondary mt-0.5">Select your preferred accent color</p>
            </div>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map((c) => {
                const isActive = settings.accentColor === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => updateSettings({ accentColor: c.name })}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all relative hover:scale-105 active:scale-95 shadow-sm"
                    style={{ background: c.hex }}
                    title={`Accent ${c.name}`}
                  >
                    {isActive && (
                      <IconCheck className="w-4 h-4 text-white font-bold" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Notifications Card ── */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IconBell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Notifications</h3>
              <p className="text-xs text-text-muted">Manage how you receive updates</p>
            </div>
          </div>

          {/* Toast position selector */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-text-primary">Toast Position</p>
            <p className="text-xs text-text-secondary mb-1">Choose where notifications appear</p>
            <CustomSelect
              value={toastPos}
              onChange={handleToastPos}
              options={TOAST_POSITIONS}
            />
          </div>

          {/* Test notifications */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-text-primary">Test Notification</p>
            <p className="text-xs text-text-secondary mb-1">Preview how notifications look on your screen</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addToast('Success', 'Everything looks great!', 'success')}
                className="py-2 px-4 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <IconCheck className="w-4 h-4" /> Success
              </button>
              <button
                onClick={() => addToast('Error', 'Something went wrong.', 'error')}
                className="py-2 px-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <IconX className="w-4 h-4" /> Error
              </button>
            </div>
          </div>
        </div>

        {/* ── Countdown Display Template Card ── full width */}
        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <IconHourglass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Countdown Display Template</h3>
              <p className="text-xs text-text-muted">Select how countdown cards appear globally across your app</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1 w-full max-w-sm">
              <CustomSelect
                value={settings.countdownTemplate}
                onChange={val => updateSettings({ countdownTemplate: val as any })}
                options={COUNTDOWN_TEMPLATES}
              />
            </div>
            <div className="flex flex-col gap-1.5 items-center sm:items-end w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold tracking-wider text-text-secondary select-none">
                Preview
              </span>
              {renderCountdownPreview()}
            </div>
          </div>
        </div>

        {/* ── App Onboarding Card ── full width */}
        <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <IconCompass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">App Onboarding</h3>
              <p className="text-xs text-text-muted">Explore tours and guides</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary">Restart App Tour</p>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed max-w-xl">
                Get a quick walkthrough of all features and how to use Personal HQ effectively.
              </p>
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event('start-app-tour'))}
              className="btn btn-primary btn-md flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center"
            >
              <IconPlayerPlay className="w-4 h-4 fill-current" /> Start Tour
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
