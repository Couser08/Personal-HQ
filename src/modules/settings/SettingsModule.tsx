import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, type AccentColor } from '../../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { useToastStore } from '../../store/useToastStore';
import {
  IconPalette, IconBell, IconHourglass,
  IconCheck, IconX, IconCompass, IconSparkles,
  IconChevronRight, IconClock
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
  { name: 'green',  hex: '#34c759' },
  { name: 'amber',  hex: '#f59e0b' },
  { name: 'teal',   hex: '#06b6d4' },
  { name: 'gray',   hex: '#8e8e93' },
];

const THEMES = [
  { value: 'light', label: 'Light Mode', color1: '#ffffff', color2: '#f2f2f7', accent: '#f43f5e', desc: 'Clean and bright aesthetic' },
  { value: 'dark', label: 'Dark Mode', color1: '#000000', color2: '#1c1c1e', accent: '#f43f5e', desc: 'Classic sleek dark theme' },
  { value: 'system', label: 'System Default', color1: '#f2f2f7', color2: '#000000', accent: '#8e8e93', desc: 'Syncs with your OS theme' },
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

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button
      type="button"
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-0.5 transition-colors duration-300 ease-in-out cursor-pointer flex items-center shrink-0 border border-transparent shadow-inner ${
        checked ? 'bg-[#34C759] justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
      }`}
    >
      <motion.div 
        layout 
        className="w-6 h-6 rounded-full bg-white shadow-sm border border-black/5 dark:border-white/5"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );

  const renderCountdownPreview = () => {
    const template = settings.countdownTemplate || 'default';
    const isDarkTemplate = template === 'dark';
    const wrapperBg = isDarkTemplate ? 'bg-[#111] border-[#333] text-white' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100';
    const borderL = template === 'vertical' ? 'border-l-4 border-l-blue-500' : '';
    
    return (
      <div className={`p-4 rounded-2xl border ${wrapperBg} ${borderL} flex flex-col gap-3 w-full max-w-[240px] shadow-sm select-none transition-all`}>
        {template !== 'split' && template !== 'compact' && (
          <div className="flex items-center gap-2">
            <span className="text-lg">🎓</span>
            <div className="text-left">
              <h4 className="text-sm font-semibold tracking-tight leading-tight">Graduation</h4>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">12 Oct 2026</span>
            </div>
          </div>
        )}
        
        {/* Restored Full Switch Case for Preview */}
        {(() => {
          switch (template) {
            case 'minimal':
              return (
                <div className="flex items-baseline gap-1 text-sm font-mono font-bold mt-1 text-left">
                  <span>27</span><span className="text-[10px] text-zinc-500 mr-1">d</span>
                  <span>08</span><span className="text-[10px] text-zinc-500 mr-1">h</span>
                  <span>45</span><span className="text-[10px] text-zinc-500 mr-1">m</span>
                  <span>12</span><span className="text-[10px] text-zinc-500">s</span>
                </div>
              );
            case 'gradient':
              return (
                <div className="flex gap-1 mt-1 justify-start">
                  {[{ v: '27', l: 'D' }, { v: '08', l: 'H' }, { v: '45', l: 'M' }, { v: '12', l: 'S' }].map(x => (
                    <div key={x.l} className="flex flex-col items-center bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg p-1 min-w-[32px] text-center shadow-sm">
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
                    <div key={x} className="relative w-8 h-8 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-blue-500">{x}</span>
                    </div>
                  ))}
                </div>
              );
            case 'event':
              return (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mt-1 text-center">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider block">Big Event</span>
                  <span className="text-sm font-black font-mono mt-1 block">27 Days Left</span>
                </div>
              );
            case 'sale':
              return (
                <div className="bg-red-500 text-white rounded-lg p-2 mt-1 text-center font-bold relative overflow-hidden">
                  <div className="text-[7px] uppercase tracking-widest bg-black/20 px-1 py-0.5 rounded w-max mx-auto mb-1">FLASH SALE</div>
                  <span className="text-xs font-mono">27d : 08h : 45m</span>
                </div>
              );
            case 'compact':
              return (
                <div className="flex items-center justify-between mt-1 w-full text-left">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm shrink-0">🎓</span>
                    <span className="text-sm font-medium truncate max-w-[80px]">Graduation</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-blue-500 shrink-0 ml-2">27d 08h</span>
                </div>
              );
            case 'flip':
              return (
                <div className="flex gap-1 justify-start mt-1">
                  {['27', '08', '45', '12'].map((v, i) => (
                    <div key={i} className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-md px-1.5 py-1 text-xs font-bold font-mono text-center shadow-md relative min-w-[28px]">
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
                      {v}
                    </div>
                  ))}
                </div>
              );
            case 'progress':
              return (
                <div className="flex flex-col gap-1.5 mt-1 text-left">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                    <span>27 Days Left</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[70%]" />
                  </div>
                </div>
              );
            case 'vertical':
              return (
                <div className="flex flex-col gap-1 pl-2 mt-1 text-left">
                  <span className="text-xs font-bold font-mono text-blue-500">27 Days Left</span>
                  <span className="text-[9px] text-zinc-500">College graduation ceremony</span>
                </div>
              );
            case 'split':
              return (
                <div className="flex flex-col gap-1 mt-1 text-left">
                  <div className="text-xs font-black uppercase">Graduation</div>
                  <div className="flex items-baseline gap-1 text-sm font-mono font-bold text-blue-500">
                    <span>27</span><span className="text-[8px] text-zinc-500">d</span>
                    <span>08</span><span className="text-[8px] text-zinc-500">h</span>
                    <span>45</span><span className="text-[8px] text-zinc-500">m</span>
                  </div>
                </div>
              );
            default:
              return (
                <div className="flex flex-col gap-2 mt-1 text-left">
                  <div className="flex gap-1">
                    {[{ v: '27', l: 'days' }, { v: '08', l: 'hrs' }, { v: '45', l: 'mins' }].map(x => (
                      <div key={x.l} className="flex-1 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg p-1 text-center">
                        <span className="text-xs font-bold font-mono block tracking-tight">{x.v}</span>
                        <span className="text-[8px] text-zinc-500 uppercase font-bold">{x.l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[70%]" />
                  </div>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  const renderClockPreview = (style: string) => {
    const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const cardBg = style === 'analog' 
      ? 'bg-zinc-950 border-zinc-800 text-zinc-100' 
      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100';

    return (
      <div className={`p-4 rounded-3xl border ${cardBg} flex items-center justify-between gap-4 w-[280px] sm:w-[320px] shadow-sm select-none transition-all`}>
        {/* Left Side: Text/Numbers */}
        <div className="flex-1 flex flex-col gap-2 items-start text-left">
          <span className={`text-[8px] font-bold uppercase tracking-wider ${style === 'analog' ? 'text-rose-500/70' : 'text-zinc-500 dark:text-zinc-400'}`}>
            FOCUS TIME
          </span>
          
          {/* Main Time Render */}
          {style === 'flip' ? (
            <div className="flex items-center gap-1">
              <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-1 text-2xl font-bold font-mono text-center shadow-md relative min-w-[36px]">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
                25
              </div>
              <span className="text-xl font-bold text-zinc-500">:</span>
              <div className="bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-lg px-2 py-1 text-2xl font-bold font-mono text-center shadow-md relative min-w-[36px]">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-black/40" />
                00
              </div>
            </div>
          ) : style === 'analog' ? (
            <div 
              className="text-4xl font-bold font-mono text-rose-500"
              style={{ textShadow: '0 0 10px rgba(244,63,94,0.6)' }}
            >
              25:00
            </div>
          ) : style === 'minimal-ring' ? (
            <div className="text-4xl font-light tracking-tight">
              25:00
            </div>
          ) : (
            /* Variant 1 - Digital */
            <div className="text-4xl font-bold font-mono">
              25:00
            </div>
          )}

          {/* Badges and Sub-elements */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/10" style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(244,63,94,0.08)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" style={{ backgroundColor: 'var(--color-primary)' }} />
            Focus Session 1
          </span>
          <button className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-colors cursor-pointer ${style === 'analog' ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'}`}>
            Stop Focus
          </button>
        </div>

        {/* Vertical Divider */}
        <div className={`w-px h-16 ${style === 'analog' ? 'bg-zinc-850' : 'bg-zinc-200 dark:bg-zinc-800'}`} />

        {/* Right Side: Circular Widget */}
        <div className="shrink-0 flex items-center justify-center relative">
          {style === 'flip' ? (
            <svg width="70" height="70" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? '#333' : '#e4e4e7'} strokeWidth="3" strokeDasharray="0 8" strokeLinecap="round" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="4.5" strokeDasharray="0 8" strokeLinecap="round" strokeDashoffset="24" />
              <circle cx="50" cy="50" r="16" fill={isDark ? '#111' : '#fff'} stroke="#f43f5e" strokeWidth="1" className="shadow-sm" />
              <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
            </svg>
          ) : style === 'analog' ? (
            <svg width="70" height="70" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 0 4px rgba(244,63,94,0.5))' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1f1f23" strokeWidth="2.5" strokeDasharray="4 4" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="3" strokeDasharray="4 4" strokeDashoffset="16" />
              <circle cx="50" cy="50" r="16" fill="#000" stroke="#f43f5e" strokeWidth="1.5" />
              <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
            </svg>
          ) : style === 'minimal-ring' ? (
            <svg width="70" height="70" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? '#222' : '#f4f4f5'} strokeWidth="3" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="4" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" />
              <circle cx="78" cy="22" r="4" fill="white" stroke="#f43f5e" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="16" fill={isDark ? '#111' : '#fff'} stroke="#f43f5e" strokeWidth="1" className="shadow-sm" />
              <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
            </svg>
          ) : (
            /* Digital */
            <svg width="70" height="70" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? '#333' : '#e4e4e7'} strokeWidth="2" strokeDasharray="3 4" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 4" strokeDashoffset="24" />
              <circle cx="50" cy="50" r="16" fill={isDark ? '#111' : '#fff'} stroke="#f43f5e" strokeWidth="1" className="shadow-sm" />
              <polygon points="47,43 47,57 56,50" fill="#f43f5e" />
            </svg>
          )}
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
      className="flex flex-col gap-8 w-full max-w-3xl mx-auto pb-12"
    >
      <div className="flex flex-col gap-2 mt-4 px-4 sm:px-0">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">Settings</h1>
      </div>

      {/* ── Appearance Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Appearance</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
          
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-sm">
                <IconPalette className="w-5 h-5" stroke={1.5} />
              </div>
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Theme Preset</p>
                <p className="text-[13px] text-zinc-500">Select your workspace style</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    theme === t.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 shadow-sm ring-1 ring-blue-500'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[14px] font-medium text-zinc-900 dark:text-white">{t.label}</span>
                    <div className="flex items-center gap-2 shrink-0 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.color1 }} />
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.color2 }} />
                      <div className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: t.accent }} />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500 mt-2">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Accent Color</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Choose your primary app color</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {ACCENT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => updateSettings({ accentColor: c.name })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm border-[3px] ${
                    settings.accentColor === c.name ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ background: c.hex }}
                  title={c.name}
                >
                  {settings.accentColor === c.name && <IconCheck className="w-4 h-4 text-white font-bold" stroke={3} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Notifications & Behavior Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Notifications & Behavior</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white shadow-sm">
                <IconBell className="w-5 h-5" stroke={1.5} />
              </div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Toast Position</p>
            </div>
            <div className="w-full sm:w-48">
              <CustomSelect value={toastPos} onChange={handleToastPos} options={TOAST_POSITIONS} />
            </div>
          </div>

          {/* Restored Test Notification Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4 bg-zinc-50/50 dark:bg-zinc-800/20">
            <div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Test Notifications</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Preview how toasts look</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => addToast('Success', 'Everything looks great!', 'success')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <IconCheck className="w-4 h-4" /> Success
              </button>
              <button
                onClick={() => addToast('Error', 'Something went wrong.', 'error')}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <IconX className="w-4 h-4" /> Error
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 sm:p-5">
             <div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Wavy Complete Effect</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Show ripple animation on completions</p>
            </div>
            <ToggleSwitch 
              checked={settings.wavyEffectEnabled !== false} 
              onChange={() => updateSettings({ wavyEffectEnabled: settings.wavyEffectEnabled === false ? true : false })} 
            />
          </div>

          {settings.wavyEffectEnabled !== false && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-zinc-50/50 dark:bg-zinc-800/20 gap-4">
              <div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Effect Quality</p>
                <p className="text-[13px] text-zinc-500 mt-0.5 max-w-[250px] leading-snug">Choose Minimal to reduce GPU load.</p>
              </div>
              <div className="flex bg-zinc-200/50 dark:bg-zinc-800 p-1 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => updateSettings({ wavyEffectMode: 'premium' })}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    settings.wavyEffectMode !== 'minimal' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  Premium
                </button>
                <button
                  onClick={() => updateSettings({ wavyEffectMode: 'minimal' })}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    settings.wavyEffectMode === 'minimal' ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'
                  }`}
                >
                  Minimal
                </button>
              </div>
            </div>
          )}

          <div className="p-4 sm:p-5">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('trigger-wavy-effect', { detail: { type: 'test' } }))}
              className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <IconSparkles className="w-4 h-4 text-amber-500" /> Trigger Test Ripple
            </button>
          </div>
        </div>
      </section>

      {/* ── Dashboard Cards Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Dashboard</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1 w-full sm:w-auto">
               <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white shadow-sm">
                  <IconHourglass className="w-5 h-5" stroke={1.5} />
                </div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Countdown Layout</p>
              </div>
              <CustomSelect
                value={settings.countdownTemplate}
                onChange={val => updateSettings({ countdownTemplate: val as any })}
                options={COUNTDOWN_TEMPLATES}
              />
            </div>
            <div className="flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 select-none">Live Preview</span>
              {renderCountdownPreview()}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pomodoro Clock Style Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">Pomodoro</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1 w-full sm:w-auto">
               <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-sm">
                  <IconClock className="w-5 h-5" stroke={1.5} />
                </div>
                <p className="text-base font-medium text-zinc-900 dark:text-white">Clock Style</p>
              </div>
              <CustomSelect
                value={settings.clockStyle || 'digital'}
                onChange={val => updateSettings({ clockStyle: val as any })}
                options={[
                  { value: 'digital', label: 'Variant 1 - Digital' },
                  { value: 'flip', label: 'Variant 2 - Flip Clock' },
                  { value: 'analog', label: 'Variant 3 - Analog' },
                  { value: 'minimal-ring', label: 'Variant 4 - Minimal Ring' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 select-none">Live Preview</span>
              {renderClockPreview(settings.clockStyle || 'digital')}
            </div>
          </div>
        </div>
      </section>


      {/* ── System & Performance Section ── */}
      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-medium uppercase tracking-wider text-zinc-500 px-4 sm:px-2">System & Performance</h2>
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-200 dark:divide-zinc-800">
          
          <div className="flex items-center justify-between p-4 sm:p-5">
             <div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Reduce Transparency</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Disables backdrop filters and blur effects</p>
            </div>
            <ToggleSwitch 
              checked={!!settings.reduceBlur} 
              onChange={() => updateSettings({ reduceBlur: !settings.reduceBlur })} 
            />
          </div>

          <div className="flex items-center justify-between p-4 sm:p-5">
             <div>
              <p className="text-base font-medium text-zinc-900 dark:text-white">Reduce Motion</p>
              <p className="text-[13px] text-zinc-500 mt-0.5">Disables UI transitions and physics</p>
            </div>
            <ToggleSwitch 
              checked={!!settings.reduceAnimations} 
              onChange={() => updateSettings({ reduceAnimations: !settings.reduceAnimations })} 
            />
          </div>

          <button 
            onClick={() => window.dispatchEvent(new Event('start-app-tour'))}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                <IconCompass className="w-5 h-5" stroke={1.5} />
              </div>
              <p className="text-base font-medium text-blue-500 dark:text-blue-400">Restart Onboarding Tour</p>
            </div>
            <IconChevronRight className="w-5 h-5 text-zinc-400" />
          </button>

        </div>
      </section>
    </motion.div>
  );
}