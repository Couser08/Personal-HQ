import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IconSparkles,
  IconExternalLink,
  IconKey,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconCheck,
  IconX,
  IconGauge,
  IconRefresh,
  IconActivity,
} from '@tabler/icons-react';
import { Card } from '../../../components/ui/Card';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { testGeminiApiKey } from '../../../lib/gemini';
import { resetAiUsageStats, type AiUsageStats, type RateLimitStatus } from '../../../lib/ai-usage-tracker';

interface AiSettingsSectionProps {
  settings: any;
  updateSettings: (s: any) => void;
  usageStats: AiUsageStats | null;
  rateStatus: RateLimitStatus | null;
  addToast: (titleOrMessage: string, messageOrType: string, type?: any) => void;
}

export const AiSettingsSection: React.FC<AiSettingsSectionProps> = ({
  settings,
  updateSettings,
  usageStats,
  rateStatus,
  addToast,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>(settings.geminiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testStatus, setTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSaveApiKey = (val: string) => {
    setApiKeyInput(val);
    updateSettings({ geminiApiKey: val.trim() });
    setTestStatus(null);
  };

  const handleTestConnection = async () => {
    const keyToTest = apiKeyInput || settings.geminiApiKey;
    if (!keyToTest) {
      setTestStatus({ success: false, message: 'Please enter a Gemini API Key first.' });
      return;
    }
    setIsTestingKey(true);
    setTestStatus(null);
    const res = await testGeminiApiKey(keyToTest, settings.geminiModel || 'gemini-2.5-flash');
    setIsTestingKey(false);
    setTestStatus(res);
    if (res.success) {
      addToast('Connection Success', 'Gemini API is ready to use!', 'success');
    } else {
      addToast('Connection Failed', res.message, 'error');
    }
  };

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-text-tertiary ml-2 flex items-center justify-between">
        <span>AI &amp; Gemini Settings</span>
        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
          <IconSparkles size={12} /> Powered by Gemini
        </span>
      </h2>
      <Card
        padding="lg"
        className="flex flex-col gap-5 border border-purple-500/20 dark:border-purple-500/30"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <IconSparkles className="w-5 h-5" stroke={2} />
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                Gemini API Key
                {settings.geminiApiKey ? (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Configured
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Key Required
                  </span>
                )}
              </p>
              <p className="text-[13px] text-zinc-500">
                Provide your Google AI Studio API key to enable AI task breakdown, live markdown
                generation &amp; smart actions.
              </p>
            </div>
          </div>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 shrink-0"
          >
            Get Free Key <IconExternalLink size={13} />
          </a>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <IconKey size={16} />
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {showApiKey ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </button>
            </div>

            <button
              type="button"
              disabled={isTestingKey || !apiKeyInput.trim()}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
            >
              {isTestingKey ? (
                <>
                  <IconLoader2 size={15} className="animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <IconCheck size={15} /> Test Connection
                </>
              )}
            </button>
          </div>

          {testStatus && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                testStatus.success
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30'
              }`}
            >
              {testStatus.success ? <IconCheck size={16} /> : <IconX size={16} />}
              <span>{testStatus.message}</span>
            </motion.div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Gemini Model</p>
              <p className="text-[12px] text-zinc-500">Select model generation engine</p>
            </div>
            <div className="w-full sm:w-64">
              <CustomSelect
                value={settings.geminiModel || 'gemini-2.5-flash'}
                onChange={(val) => updateSettings({ geminiModel: val })}
                options={[
                  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Fastest & Recommended)' },
                  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Lightweight)' },
                  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Deep Reasoning)' },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/40">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">AI Persona &amp; Tone</p>
              <p className="text-[12px] text-zinc-500">Configure how the AI responds</p>
            </div>
            <div className="w-full sm:w-64">
              <CustomSelect
                value={settings.aiPersona || 'Professional'}
                onChange={(val) => updateSettings({ aiPersona: val as any })}
                options={[
                  { value: 'Professional', label: 'Professional (Default)' },
                  { value: 'Friendly/Coaching', label: 'Friendly & Coaching' },
                  { value: 'Strict', label: 'Strict & Direct' },
                ]}
              />
            </div>
          </div>

          {/* AI Usage & Quota Meter */}
          <div className="flex flex-col gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconGauge size={16} className="text-purple-600 dark:text-purple-400" />
                <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                  AI Usage &amp; Quota Meter
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Multi-Tab Synced
                </span>
                <button
                  type="button"
                  onClick={() => {
                    resetAiUsageStats();
                    addToast('Reset Complete', 'Local AI usage statistics have been reset.', 'info');
                  }}
                  title="Reset Usage Counters"
                  className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <IconRefresh size={12} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Daily Requests Quota */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <IconActivity size={14} className="text-purple-500" /> Daily Requests
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400">
                    {usageStats?.requestsToday || 0} / {rateStatus?.dailyLimit || 500}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (usageStats?.requestsToday || 0) / (rateStatus?.dailyLimit || 500) > 0.85
                        ? 'bg-rose-500'
                        : (usageStats?.requestsToday || 0) / (rateStatus?.dailyLimit || 500) > 0.65
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          2,
                          ((usageStats?.requestsToday || 0) / (rateStatus?.dailyLimit || 500)) * 100,
                        ),
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>
                    {Math.max(0, (rateStatus?.dailyLimit || 500) - (usageStats?.requestsToday || 0))}{' '}
                    requests remaining
                  </span>
                  <span>Resets at midnight</span>
                </div>
              </div>

              {/* 60s RPM Rate */}
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/70 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <IconGauge size={14} className="text-blue-500" /> Live Rate (60s Window)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    {rateStatus?.requestsInLastMinute || 0} / 15 RPM
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      (rateStatus?.requestsInLastMinute || 0) >= 12
                        ? 'bg-rose-500'
                        : (rateStatus?.requestsInLastMinute || 0) >= 8
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-blue-500 to-teal-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(2, ((rateStatus?.requestsInLastMinute || 0) / 15) * 100),
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>
                    {(rateStatus?.requestsInLastMinute || 0) >= 12
                      ? '⚠️ Nearing Rate Limit'
                      : (rateStatus?.requestsInLastMinute || 0) > 0
                      ? 'Active Session'
                      : 'Idle (Safe)'}
                  </span>
                  {rateStatus?.cooldownSeconds ? (
                    <span className="text-rose-500 font-semibold font-mono">
                      Cooldown: {rateStatus.cooldownSeconds}s
                    </span>
                  ) : (
                    <span>Max 15 calls/min</span>
                  )}
                </div>
              </div>
            </div>

            {/* Token Metric Badges */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Prompt Tokens
                </span>
                <span className="text-xs font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                  {(usageStats?.promptTokensToday || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/15 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Response Tokens
                </span>
                <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {(usageStats?.completionTokensToday || 0).toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/15 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Total Requests
                </span>
                <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                  {(usageStats?.totalRequests || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
