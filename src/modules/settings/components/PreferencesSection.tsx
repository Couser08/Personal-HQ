import React from 'react';
import { IconHourglass, IconClock } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { COUNTDOWN_TEMPLATES } from '../constants/presets';
import { CountdownPreview } from './CountdownPreview';
import { ClockPreview } from './ClockPreview';

interface PreferencesSectionProps {
  settings: any;
  updateSettings: (s: any) => void;
  theme: string;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  settings,
  updateSettings,
  theme,
}) => {
  return (
    <>
      {/* ── Dashboard Cards Section ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">
          Dashboard
        </h2>
        <Card padding="md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-warning flex items-center justify-center text-white shadow-sm">
                  <IconHourglass className="w-5 h-5" stroke={1.5} />
                </div>
                <p className="text-base font-medium text-text-primary">
                  Countdown Layout
                </p>
              </div>
              <CustomSelect
                value={settings.countdownTemplate}
                onChange={(val) => updateSettings({ countdownTemplate: val as any })}
                options={COUNTDOWN_TEMPLATES}
              />
            </div>
            <div className="flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto p-4 bg-surface-alt rounded-2xl border border-border-hairline">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary select-none">
                Live Preview
              </span>
              <CountdownPreview template={settings.countdownTemplate || 'default'} />
            </div>
          </div>
        </Card>
      </section>

      {/* ── Pomodoro Clock Style Section ── */}
      <section className="flex flex-col gap-3">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">
          Pomodoro
        </h2>
        <Card padding="md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-danger flex items-center justify-center text-white shadow-sm">
                  <IconClock className="w-5 h-5" stroke={1.5} />
                </div>
                <p className="text-base font-medium text-text-primary">Clock Style</p>
              </div>
              <CustomSelect
                value={settings.clockStyle || 'digital'}
                onChange={(val) => updateSettings({ clockStyle: val as any })}
                options={[
                  { value: 'digital', label: 'Variant 1 - Digital' },
                  { value: 'flip', label: 'Variant 2 - Flip Clock' },
                  { value: 'analog', label: 'Variant 3 - Analog' },
                  { value: 'minimal-ring', label: 'Variant 4 - Minimal Ring' },
                ]}
              />
            </div>
            <div className="flex flex-col gap-2 items-center sm:items-end w-full sm:w-auto p-4 bg-surface-alt rounded-2xl border border-border-hairline">
              <span className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary select-none">
                Live Preview
              </span>
              <ClockPreview style={settings.clockStyle || 'digital'} theme={theme} />
            </div>
          </div>
        </Card>
      </section>
    </>
  );
};
