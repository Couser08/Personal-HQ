import React from 'react';
import { IconBell, IconCheck, IconX, IconSparkles } from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { ToggleSwitch } from './ToggleSwitch';
import { TOAST_POSITIONS } from '../constants/presets';

interface NotificationsSectionProps {
  toastPos: string;
  handleToastPos: (pos: string) => void;
  addToast: (titleOrMessage: string, messageOrType: string, type?: any) => void;
  settings: any;
  updateSettings: (s: any) => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  toastPos,
  handleToastPos,
  addToast,
  settings,
  updateSettings,
}) => {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2">
        Notifications &amp; Behavior
      </h2>
      <Card padding="none" className="flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-danger flex items-center justify-center text-white shadow-sm">
              <IconBell className="w-5 h-5" stroke={1.5} />
            </div>
            <p className="text-base font-medium text-text-primary">Toast Position</p>
          </div>
          <div className="w-full sm:w-48">
            <CustomSelect value={toastPos} onChange={handleToastPos} options={TOAST_POSITIONS} />
          </div>
        </div>

        <div className="h-px w-full bg-border-hairline" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 gap-4 bg-surface-alt">
          <div>
            <p className="text-base font-medium text-text-primary">Test Notifications</p>
            <p className="text-[13px] text-text-secondary mt-0.5">Preview how toasts look</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => addToast('Success', 'Everything looks great!', 'success')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-accent-success/10 text-accent-success text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <IconCheck className="w-4 h-4" /> Success
            </button>
            <button
              onClick={() => addToast('Error', 'Something went wrong.', 'error')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-accent-danger/10 text-accent-danger text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <IconX className="w-4 h-4" /> Error
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 sm:p-5">
          <div>
            <p className="text-base font-medium text-text-primary">Wavy Complete Effect</p>
            <p className="text-[13px] text-text-secondary mt-0.5">Show ripple animation on completions</p>
          </div>
          <ToggleSwitch
            checked={settings.wavyEffectEnabled !== false}
            onChange={() =>
              updateSettings({
                wavyEffectEnabled: settings.wavyEffectEnabled === false ? true : false,
              })
            }
          />
        </div>

        {settings.wavyEffectEnabled !== false && (
          <>
            <div className="h-px w-full bg-border-hairline" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-surface-alt gap-4">
              <div>
                <p className="text-base font-medium text-text-primary">Effect Quality</p>
                <p className="text-[13px] text-text-secondary mt-0.5 max-w-[250px] leading-snug">
                  Choose Minimal to reduce GPU load.
                </p>
              </div>
              <div className="flex bg-surface border border-border-hairline p-1 rounded-lg w-full sm:w-auto">
                <button
                  onClick={() => updateSettings({ wavyEffectMode: 'premium' })}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    settings.wavyEffectMode !== 'minimal'
                      ? 'bg-primary text-text-on-accent shadow-sm'
                      : 'text-text-secondary'
                  }`}
                >
                  Premium
                </button>
                <button
                  onClick={() => updateSettings({ wavyEffectMode: 'minimal' })}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-[13px] font-medium rounded-md transition-all ${
                    settings.wavyEffectMode === 'minimal'
                      ? 'bg-white dark:bg-zinc-600 text-zinc-900 dark:text-white shadow-sm'
                      : 'text-zinc-500'
                  }`}
                >
                  Minimal
                </button>
              </div>
            </div>
          </>
        )}

        <div className="h-px w-full bg-border-hairline" />

        <div className="p-4 sm:p-5">
          <button
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('trigger-wavy-effect', { detail: { type: 'test' } }),
              )
            }
            className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <IconSparkles className="w-4 h-4 text-amber-500" /> Trigger Test Ripple
          </button>
        </div>
      </Card>
    </section>
  );
};
