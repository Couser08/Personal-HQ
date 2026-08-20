// ─── Localhost-Only Togglable Mock Backend Controls ───────────────────────────

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconDatabase,
  IconRefresh,
  IconClock,
  IconAlertTriangle,
  IconUser,
  IconChevronDown,
  IconX,
  IconFileExport,
  IconFileImport,
  IconCheck,
  IconBolt,
} from '@tabler/icons-react';
import {
  isLocalhost,
  isMockEnabled,
  setMockEnabled,
  getLatencyRange,
  setLatencyRange,
  getForceErrorRate,
  setForceErrorRate,
  getMockUser,
  setMockUser,
} from '../../lib/mock/mockConfig';
import { resetMockBackend, getMockStoreStats, exportMockDatabaseSnapshot, importMockDatabaseSnapshot } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { useToastStore } from '../../store/useToastStore';
import { queryClient } from '../../lib/queryClient';

export const MockDataControls: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mockActive, setMockActive] = useState(isMockEnabled());
  const [latencyMin, setLatencyMin] = useState(getLatencyRange().min);
  const [latencyMax, setLatencyMax] = useState(getLatencyRange().max);
  const [errorRate, setErrorRate] = useState(getForceErrorRate());
  const [currentUser, setCurrentUser] = useState(getMockUser().email);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isResetting, setIsResetting] = useState(false);
  const [copiedSnapshot, setCopiedSnapshot] = useState(false);

  const { addToast } = useToastStore();
  const { initialize: initAuth } = useAuthStore();
  const { loadAllData } = useAppStore();

  const refreshStats = useCallback(() => {
    setStats(getMockStoreStats());
  }, []);

  useEffect(() => {
    refreshStats();

    const handleConfigChange = () => {
      setMockActive(isMockEnabled());
      const range = getLatencyRange();
      setLatencyMin(range.min);
      setLatencyMax(range.max);
      setErrorRate(getForceErrorRate());
      setCurrentUser(getMockUser().email);
      refreshStats();
    };

    window.addEventListener('phq-mock-config-changed', handleConfigChange);
    window.addEventListener('phq-mock-user-changed', handleConfigChange);
    return () => {
      window.removeEventListener('phq-mock-config-changed', handleConfigChange);
      window.removeEventListener('phq-mock-user-changed', handleConfigChange);
    };
  }, [refreshStats]);

  const handleToggleMock = (enabled: boolean) => {
    setMockEnabled(enabled);
    setMockActive(enabled);
    queryClient.clear();
    addToast(
      enabled ? 'Mock Mode Enabled' : 'Real Supabase Enabled',
      enabled ? 'Running fully local with zero network egress.' : 'Connected to live Supabase backend.',
      'info'
    );
    // Re-initialize auth & workspace data
    setTimeout(() => {
      initAuth();
      const user = useAuthStore.getState().user;
      if (user) loadAllData(user.id);
    }, 100);
  };

  const handleResetData = async () => {
    if (window.confirm('Reset local mock database to fresh seed data? Any new test records will be restored to defaults.')) {
      setIsResetting(true);
      await resetMockBackend();
      queryClient.clear();
      const user = useAuthStore.getState().user;
      if (user) await loadAllData(user.id);
      refreshStats();
      setIsResetting(false);
      addToast('Mock Data Reset', 'Database successfully restored to seed state.', 'success');
    }
  };

  const handleLatencyPreset = (preset: 'instant' | 'normal' | 'slow') => {
    if (preset === 'instant') {
      setLatencyRange(0, 0);
      setLatencyMin(0);
      setLatencyMax(0);
    } else if (preset === 'normal') {
      setLatencyRange(100, 350);
      setLatencyMin(100);
      setLatencyMax(350);
    } else {
      setLatencyRange(700, 1200);
      setLatencyMin(700);
      setLatencyMax(1200);
    }
    addToast('Latency Updated', `Simulated network delay set to ${preset} mode.`, 'info');
  };

  const handleErrorRateChange = (rate: number) => {
    setForceErrorRate(rate);
    setErrorRate(rate);
  };

  const handleSwitchUser = (email: string) => {
    setMockUser(email);
    setCurrentUser(email);
    initAuth();
    setTimeout(() => {
      const user = useAuthStore.getState().user;
      if (user) loadAllData(user.id);
    }, 150);
    addToast('User Switched', `Logged in as ${email}`, 'success');
  };

  const handleExportSnapshot = () => {
    const json = exportMockDatabaseSnapshot();
    navigator.clipboard.writeText(json);
    setCopiedSnapshot(true);
    setTimeout(() => setCopiedSnapshot(false), 2000);
    addToast('Exported', 'Mock database snapshot copied to clipboard.', 'success');
  };

  const handleImportSnapshot = async () => {
    const input = prompt('Paste mock database JSON snapshot:');
    if (!input) return;
    const ok = await importMockDatabaseSnapshot(input);
    if (ok) {
      queryClient.clear();
      const user = useAuthStore.getState().user;
      if (user) await loadAllData(user.id);
      refreshStats();
      addToast('Import Success', 'Snapshot loaded into mock database.', 'success');
    } else {
      addToast('Import Failed', 'Invalid JSON snapshot.', 'error');
    }
  };

  // Strict guard: NEVER render on non-localhost hosts
  if (!isLocalhost()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 font-sans select-none text-left">
      {/* ── Collapsed Floating Pill ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 p-1 rounded-full bg-surface/90 border border-border shadow-float backdrop-blur-md"
      >
        <button
          onClick={() => handleToggleMock(!mockActive)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            mockActive
              ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
              : 'bg-zinc-500/15 text-text-tertiary hover:bg-zinc-500/25'
          }`}
          title="Toggle Mock / Live Supabase Mode"
        >
          <span className={`w-2 h-2 rounded-full ${mockActive ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
          <span>{mockActive ? 'Mock Backend' : 'Live Supabase'}</span>
        </button>

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            refreshStats();
          }}
          className="p-1.5 text-text-secondary hover:text-text-primary rounded-full hover:bg-surface-alt transition-colors cursor-pointer"
          title="Dev Mock Database Controls"
        >
          {isOpen ? <IconChevronDown size={16} /> : <IconDatabase size={16} />}
        </button>
      </motion.div>

      {/* ── Expanded Drawer / Popover ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-80 sm:w-96 p-4 rounded-3xl bg-surface border border-border shadow-float backdrop-blur-xl flex flex-col gap-4 text-text-primary overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <IconBolt size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider">Dev Mock Controls</h3>
                  <span className="text-[10px] text-text-tertiary block">Localhost Testing Suite</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-alt transition-colors cursor-pointer"
              >
                <IconX size={16} />
              </button>
            </div>

            {/* Mode Toggle Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-surface-alt/70 border border-border-hairline">
              <div className="flex flex-col">
                <span className="text-xs font-bold">In-App Mock Engine</span>
                <span className="text-[10px] text-text-tertiary">Zero real network egress</span>
              </div>
              <button
                onClick={() => handleToggleMock(!mockActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  mockActive ? 'bg-emerald-500' : 'bg-zinc-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150 ${
                    mockActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reset Seed Data */}
            <button
              onClick={handleResetData}
              disabled={isResetting || !mockActive}
              className="w-full py-2 px-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <IconRefresh size={15} className={isResetting ? 'animate-spin' : ''} />
              <span>Reset Database to Seeds</span>
            </button>

            {/* Latency Simulator */}
            <div className="flex flex-col gap-2 p-2.5 rounded-2xl bg-surface-alt/40 border border-border-hairline">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <IconClock size={14} className="text-primary" /> Latency Simulation
                </span>
                <span className="text-[11px] font-mono text-text-secondary">
                  {latencyMin === 0 ? '0ms (Instant)' : `${latencyMin}–${latencyMax}ms`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <button
                  onClick={() => handleLatencyPreset('instant')}
                  className={`py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    latencyMin === 0 ? 'bg-primary text-text-on-accent' : 'bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  Instant (0ms)
                </button>
                <button
                  onClick={() => handleLatencyPreset('normal')}
                  className={`py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    latencyMin === 100 ? 'bg-primary text-text-on-accent' : 'bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  Normal (250ms)
                </button>
                <button
                  onClick={() => handleLatencyPreset('slow')}
                  className={`py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    latencyMin === 700 ? 'bg-primary text-text-on-accent' : 'bg-surface hover:bg-surface-alt text-text-secondary'
                  }`}
                >
                  Slow 3G (1s)
                </button>
              </div>
            </div>

            {/* Error Rate Simulator */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-surface-alt/40 border border-border-hairline">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <IconAlertTriangle size={14} className="text-amber-500" /> Error Injection
                </span>
                <span className="text-[11px] font-mono text-text-secondary">{Math.round(errorRate * 100)}% failure</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={errorRate}
                onChange={(e) => handleErrorRateChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            {/* Mock User Persona Switcher */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-surface-alt/40 border border-border-hairline">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <IconUser size={14} className="text-primary" /> Active Mock Persona
              </span>
              <div className="flex flex-col gap-1 pt-1">
                <button
                  onClick={() => handleSwitchUser('tungariyarahul08@gmail.com')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentUser === 'tungariyarahul08@gmail.com'
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'hover:bg-surface text-text-secondary'
                  }`}
                >
                  <span>Admin (Rahul)</span>
                  {currentUser === 'tungariyarahul08@gmail.com' && <IconCheck size={14} />}
                </button>
                <button
                  onClick={() => handleSwitchUser('dev.tester@example.com')}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                    currentUser === 'dev.tester@example.com'
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'hover:bg-surface text-text-secondary'
                  }`}
                >
                  <span>Standard Test User</span>
                  {currentUser === 'dev.tester@example.com' && <IconCheck size={14} />}
                </button>
              </div>
            </div>

            {/* Table Row Count Diagnostics */}
            <div className="flex flex-col gap-1.5 p-2.5 rounded-2xl bg-surface-alt/40 border border-border-hairline">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Live Store Telemetry
              </span>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] font-mono text-text-secondary pt-0.5">
                <div>Notes: <span className="text-text-primary font-bold">{stats.notes ?? 0}</span></div>
                <div>Journals: <span className="text-text-primary font-bold">{stats.journals ?? 0}</span></div>
                <div>Todos: <span className="text-text-primary font-bold">{stats.todo_tasks ?? 0}</span></div>
                <div>Habits: <span className="text-text-primary font-bold">{stats.habits ?? 0}</span></div>
                <div>Bugs: <span className="text-text-primary font-bold">{stats.bug_reports ?? 0}</span></div>
                <div>Media: <span className="text-text-primary font-bold">{stats.media_logs ?? 0}</span></div>
              </div>
            </div>

            {/* Snapshot Backup / Restore */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleExportSnapshot}
                className="flex-1 py-1.5 px-2 rounded-xl bg-surface-alt hover:bg-surface text-[11px] font-bold text-text-secondary hover:text-text-primary flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                {copiedSnapshot ? <IconCheck size={14} className="text-emerald-500" /> : <IconFileExport size={14} />}
                <span>{copiedSnapshot ? 'Copied' : 'Export JSON'}</span>
              </button>
              <button
                onClick={handleImportSnapshot}
                className="flex-1 py-1.5 px-2 rounded-xl bg-surface-alt hover:bg-surface text-[11px] font-bold text-text-secondary hover:text-text-primary flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <IconFileImport size={14} />
                <span>Import JSON</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
