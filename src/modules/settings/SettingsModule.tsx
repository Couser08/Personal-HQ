import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { IconSettings, IconSun, IconMoon, IconPalette, IconBell, IconRefresh, IconDeviceDesktop } from '@tabler/icons-react';

export default function SettingsModule() {
  const { theme, setTheme, showConfirm } = useAppStore();
  const { addToast } = useToastStore();

  const handleTestToast = (type: 'success' | 'error' | 'warning' | 'info' | 'update') => {
    const msgs = {
      success: { t: 'Success', m: 'Your note has been saved successfully.' },
      info: { t: 'Info', m: "Here's some helpful information for you." },
      warning: { t: 'Warning', m: 'Please review the details before proceeding.' },
      error: { t: 'Error', m: 'Something went wrong. Please try again.' },
      update: { t: 'Update', m: 'Your app is up to date.' }
    };
    addToast(msgs[type].t, msgs[type].m, type);
  };

  const handleStartTour = () => {
    // We will trigger the app tour from here
    window.dispatchEvent(new Event('start-app-tour'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      className="flex flex-col h-full gap-6 pb-20"
      style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Settings <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
        </h2>
        <p className="text-text-secondary text-sm mt-1">Manage app preferences and appearance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Appearance Section */}
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold flex items-center gap-2 m-0">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <IconPalette size={18} />
            </div>
            Appearance
          </h3>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold m-0">Theme Preference</h4>
                <p className="text-xs text-text-secondary m-0">Choose between light and dark mode</p>
              </div>
              <div className="flex bg-surface-alt p-1 rounded-xl border border-border-alt">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <IconSun size={16} /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-text-muted hover:text-text-primary'}`}
                >
                  <IconMoon size={16} /> Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications & Toasts Section */}
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold flex items-center gap-2 m-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IconBell size={18} />
            </div>
            Notification Settings
          </h3>

          <div className="flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-semibold m-0">Toast Position</h4>
              <p className="text-xs text-text-secondary m-0">Where notifications appear on screen.</p>
            </div>
            <select
              value={useToastStore.getState().position}
              onChange={(e) => useToastStore.getState().setPosition(e.target.value as any)}
              className="w-full bg-surface-alt border border-border-alt rounded-[10px] px-3 py-2 focus:outline-none focus:border-primary text-sm font-medium"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-center">Bottom Center</option>
            </select>

            <div className="mt-2">
              <h4 className="text-sm font-semibold m-0 mb-2">Test Notification</h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleTestToast('success')} className="flex items-center justify-center gap-2 px-4 py-2 border border-green-500/30 bg-green-500/5 text-green-600 hover:bg-green-500/10 rounded-xl text-sm font-semibold transition-colors">
                  Success
                </button>
                <button onClick={() => handleTestToast('error')} className="flex items-center justify-center gap-2 px-4 py-2 border border-rose-500/30 bg-rose-500/5 text-rose-600 hover:bg-rose-500/10 rounded-xl text-sm font-semibold transition-colors">
                  Error
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Settings Section */}
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-6 md:col-span-2">
          <h3 className="text-lg font-bold flex items-center gap-2 m-0">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <IconRefresh size={18} />
            </div>
            Countdown Defaults
          </h3>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Default Template</label>
            <p className="text-xs text-text-secondary m-0 mb-2">Select how you want your countdowns to look globally.</p>
            <select
              value={useAppStore.getState().settings.countdownTemplate}
              onChange={(e) => useAppStore.getState().updateSettings({ countdownTemplate: e.target.value as any })}
              className="w-full max-w-sm bg-surface-alt border border-border-alt rounded-[10px] px-3 py-2 focus:outline-none focus:border-primary text-sm font-medium cursor-pointer"
            >
              <option value="default">Default Cards</option>
              <option value="minimal">Minimal Text</option>
              <option value="gradient">Gradient Vibe</option>
              <option value="circle">Circular Progress</option>
              <option value="event">Event Celebration</option>
              <option value="sale">Flash Sale</option>
              <option value="dark">Dark Mode</option>
              <option value="compact">Compact Row</option>
              <option value="flip">Mechanical Flip</option>
              <option value="progress">Progress Ring</option>
              <option value="vertical">Vertical Stack</option>
              <option value="split">Split Layout</option>
            </select>
          </div>
        </div>

        {/* App Tour */}
        <div className="bg-surface border border-border rounded-[16px] p-6 flex flex-col gap-6 md:col-span-2">
          <h3 className="text-lg font-bold flex items-center gap-2 m-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <IconDeviceDesktop size={18} />
            </div>
            App Onboarding
          </h3>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold m-0">Restart App Tour</h4>
              <p className="text-xs text-text-secondary m-0 mt-1 max-w-md">
                Want a quick refresher on how to use Personal HQ? Trigger the interactive guided tour to explore all the main features.
              </p>
            </div>
            <button
              onClick={handleStartTour}
              className="px-6 py-2 bg-primary text-white hover:bg-primary-muted rounded-xl text-sm font-bold transition-colors shrink-0"
            >
              Start Tour
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
