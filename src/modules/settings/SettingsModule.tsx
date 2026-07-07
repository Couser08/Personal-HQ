import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type AccentColor } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import {
  IconPalette, IconBell, IconHourglass,
  IconCheck, IconX, IconCompass, IconPlayerPlay, IconSparkles
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

const THEMES = [
  { value: 'light', label: 'Light Mode', color1: '#ffffff', color2: '#f4f4f5', accent: '#f43f5e', desc: 'Clean and bright aesthetic' },
  { value: 'dark', label: 'Dark Mode', color1: '#0a0a0a', color2: '#111111', accent: '#f43f5e', desc: 'Classic sleek dark theme' },
  { value: 'system', label: 'System Default', color1: '#f4f4f5', color2: '#0a0a0a', accent: '#71717a', desc: 'Syncs with your OS theme' },
  { value: 'cyberpunk', label: 'Cyberpunk Neon', color1: '#06060c', color2: '#0e0f1d', accent: '#ff007f', desc: 'Vibrant neon hot-pink tones' },
  { value: 'nordic', label: 'Nordic Forest', color1: '#1b2421', color2: '#222f2b', accent: '#a3b899', desc: 'Calm evergreen and moss' },
  { value: 'sakura', label: 'Sakura Blossom', color1: '#fff0f5', color2: '#fff9fb', accent: '#db7093', desc: 'Soft pink cherry blossoms' },
  { value: 'auraglass', label: 'Aura Glass', color1: '#0f0724', color2: '#160c30', accent: '#a78bfa', desc: 'Translucent indigo glass' },
];

export default function SettingsModule() {
  const { theme, setTheme, settings, updateSettings } = useAppStore(useShallow(state => ({
    theme: state.theme,
    setTheme: state.setTheme,
    settings: state.settings,
    updateSettings: state.updateSettings
  })));
  const addToast = useToastStore(s => s.addToast);
  const [toastPos, setToastPos] = useState<string>(useToastStore.getState().position || 'top-right');

  const handleToastPos = (val: string) => {
    setToastPos(val);
    useToastStore.getState().setPosition(val as any);
    addToast('Position Updated', `Toast alerts will now appear at ${val.replace('-', ' ')}`, 'info');
  };

  // Render a mini preview countdown card based on currently selected template style
  const renderCountdownPreview = () => {
    const template = settings.countdownTemplate || 'default';
    
    // Base preview wrapper with theme and styling
    const isDarkTemplate = template === 'dark';
    const wrapperBg = isDarkTemplate ? 'bg-[#111] border-[#222] text-white' : 'bg-surface border-border text-text-primary';
    const borderL = template === 'vertical' ? 'border-l-4 border-l-primary' : '';
    
    return (
      <div className={`p-4 rounded-xl border ${wrapperBg} ${borderL} flex flex-col gap-3 w-full max-w-[240px] shadow-sm select-none`}>
        {/* Event Header (unless split or compact) */}
        {template !== 'split' && template !== 'compact' && (
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <div className="text-left">
              <h4 className="text-xs font-bold leading-tight">Graduation</h4>
              <span className="text-[9px] text-text-muted dark:text-zinc-500">12 Oct 2026</span>
            </div>
          </div>
        )}
        
        {/* Template specific countdown rendering */}
        {(() => {
          switch (template) {
            case 'minimal':
              return (
                <div className="flex items-baseline gap-1 text-sm font-mono font-bold mt-1 text-left">
                  <span>27</span><span className="text-[10px] text-text-muted mr-1">d</span>
                  <span>08</span><span className="text-[10px] text-text-muted mr-1">h</span>
                  <span>45</span><span className="text-[10px] text-text-muted mr-1">m</span>
                  <span>12</span><span className="text-[10px] text-text-muted">s</span>
                </div>
              );
            case 'gradient':
              return (
                <div className="flex gap-1 mt-1 justify-start">
                  {[{ v: '27', l: 'D' }, { v: '08', l: 'H' }, { v: '45', l: 'M' }, { v: '12', l: 'S' }].map(x => (
                    <div key={x.l} className="flex flex-col items-center bg-gradient-to-br from-primary to-rose-400 text-white rounded p-1 min-w-[32px] text-center shadow-sm">
                      <span className="text-xs font-bold font-mono">{x.v}</span>
                      <span className="text-[7px] font-bold opacity-80">{x.l}</span>
                    </div>
                  ))}
                </div>
              );
            case 'circle':
              return (
                <div className="flex gap-1.5 justify-start mt-1">
                  {['D', 'H', 'M', 'S'].map(x => (
                    <div key={x} className="relative w-8 h-8 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-primary">{x}</span>
                    </div>
                  ))}
                </div>
              );
            case 'event':
              return (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mt-1 text-center">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Big Event</span>
                  <span className="text-sm font-black font-mono text-text-primary dark:text-white mt-1 block">27 Days Left</span>
                </div>
              );
            case 'sale':
              return (
                <div className="bg-red-600 text-white rounded-lg p-2 mt-1 text-center font-bold relative overflow-hidden">
                  <div className="text-[7px] uppercase tracking-widest bg-black/20 px-1 py-0.5 rounded w-max mx-auto mb-1">FLASH SALE</div>
                  <span className="text-xs font-mono">27d : 08h : 45m</span>
                </div>
              );
            case 'compact':
              return (
                <div className="flex items-center justify-between mt-1 w-full text-left">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">🎓</span>
                    <span className="text-xs font-bold truncate max-w-[80px]">Graduation</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary shrink-0 ml-2">27d 08h</span>
                </div>
              );
            case 'flip':
              return (
                <div className="flex gap-1 justify-start mt-1">
                  {['27', '08', '45', '12'].map((v, i) => (
                    <div key={i} className="bg-zinc-850 dark:bg-zinc-905 text-zinc-100 border border-zinc-700 rounded px-1.5 py-1 text-xs font-bold font-mono text-center shadow-md relative min-w-[28px]">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
                      {v}
                    </div>
                  ))}
                </div>
              );
            case 'progress':
              return (
                <div className="flex flex-col gap-1.5 mt-1 text-left">
                  <div className="flex justify-between text-[9px] font-bold text-text-muted">
                    <span>27 Days Left</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-border-alt dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[70%]" />
                  </div>
                </div>
              );
            case 'vertical':
              return (
                <div className="flex flex-col gap-1 pl-2 mt-1 text-left">
                  <span className="text-xs font-bold font-mono text-primary">27 Days Left</span>
                  <span className="text-[9px] text-text-muted dark:text-zinc-500">College graduation ceremony</span>
                </div>
              );
            case 'split':
              return (
                <div className="flex flex-col gap-1 mt-1 text-left">
                  <div className="text-xs font-black uppercase text-text-primary dark:text-white">Graduation</div>
                  <div className="flex items-baseline gap-1 text-sm font-mono font-bold text-primary">
                    <span>27</span><span className="text-[8px] text-text-muted">d</span>
                    <span>08</span><span className="text-[8px] text-text-muted">h</span>
                    <span>45</span><span className="text-[8px] text-text-muted">m</span>
                  </div>
                </div>
              );
            default:
              return (
                <div className="flex flex-col gap-2 mt-1 text-left">
                  <div className="flex gap-1">
                    {[{ v: '27', l: 'days' }, { v: '08', l: 'hrs' }, { v: '45', l: 'mins' }].map(x => (
                      <div key={x.l} className="flex-1 bg-surface-alt dark:bg-zinc-800/50 border border-border rounded p-1 text-center">
                        <span className="text-xs font-black font-mono block text-text-primary dark:text-white">{x.v}</span>
                        <span className="text-[8px] text-text-muted uppercase font-bold">{x.l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-border-alt dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[70%]" />
                  </div>
                </div>
              );
          }
        })()}
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
        <div className="w-56 shrink-0">
          <CustomSelect
            value={theme}
            onChange={(val) => setTheme(val as any)}
            options={[
              { value: 'system', label: 'System Default' },
              { value: 'light',  label: 'Light Mode' },
              { value: 'dark',   label: 'Dark Mode' },
              { value: 'cyberpunk', label: 'Cyberpunk Neon' },
              { value: 'nordic', label: 'Nordic Forest' },
              { value: 'sakura', label: 'Sakura Blossom' },
              { value: 'auraglass', label: 'Aura Glass' }
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
              <p className="text-sm font-semibold text-text-primary">Theme Preset</p>
              <p className="text-xs text-text-secondary mt-0.5">Select a premium workspace theme preset</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    theme === t.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-surface-alt hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-text-primary">{t.label}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ background: t.color1 }} title="Background" />
                      <div className="w-2.5 h-2.5 rounded-full border border-border/40" style={{ background: t.color2 }} title="Surface" />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.accent }} title="Primary Accent" />
                    </div>
                  </div>
                  <span className="text-[10px] text-text-secondary mt-1">{t.desc}</span>
                </button>
              ))}
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
            <div className="w-full sm:w-80 select-none">
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

        {/* ── Performance Mode Card ── */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <IconSparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">Performance Mode</h3>
              <p className="text-xs text-text-muted">Optimize rendering responsiveness</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-2 border-t border-border/40 mt-1">
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-text-primary">Reduce Blur & Glassmorphism</p>
              <p className="text-xs text-text-secondary mt-0.5">Disable intensive backdrop filters and semi-transparency. Essential for eliminating lag on slower devices.</p>
            </div>
            <button
              onClick={() => updateSettings({ reduceBlur: !settings.reduceBlur })}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 cursor-pointer flex items-center shrink-0 border border-transparent ${
                settings.reduceBlur ? 'bg-[#F43F5E] justify-end' : 'bg-border justify-start'
              }`}
            >
              <motion.div 
                layout 
                className="w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
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
              <p 
                className="mt-1 text-xs text-text-secondary leading-relaxed"
                style={{ display: 'block', width: '100%', maxWidth: '600px' }}
              >
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
