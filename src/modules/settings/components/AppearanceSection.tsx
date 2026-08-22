import React from 'react';
import { IconPalette, IconCheck } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { THEMES, ACCENT_COLORS } from '../constants/presets';
import type { AccentColor } from '../../../store/useAppStore';

interface AppearanceSectionProps {
  theme: string;
  setTheme: (theme: any) => void;
  accentColor?: AccentColor;
  updateSettings: (settings: any) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  theme,
  setTheme,
  accentColor,
  updateSettings,
}) => {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">
        Appearance
      </h2>
      <Card padding="none" className="flex flex-col overflow-hidden">
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
            {THEMES.map((t) => (
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
                  <span className="text-[14px] font-medium text-zinc-900 dark:text-white">
                    {t.label}
                  </span>
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

        <div className="h-px w-full bg-border-hairline" />

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
                  accentColor === c.name
                    ? 'border-zinc-900 dark:border-white scale-110'
                    : 'border-transparent'
                }`}
                style={{ background: c.hex }}
                title={c.name}
              >
                {accentColor === c.name && (
                  <IconCheck className="w-4 h-4 text-white font-bold" stroke={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </section>
  );
};
