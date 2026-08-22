import React from 'react';
import { motion } from 'framer-motion';
import {
  IconPlus,
  IconBook2,
  IconSparkles,
  IconChevronRight,
  IconHeart,
  IconHeartFilled,
  IconSearch,
  IconDownload,
  IconBell,
} from '@tabler/icons-react';
import { type JournalEntry } from '../../../store/useAppStore';
import { Input } from '../../../components/ui/Input';
import { formatDateTime, exportJson } from '../utils';
import { TEMPLATES } from '../constants';
import { MoodIllustration } from './MoodIllustration';

interface JournalCatalogViewProps {
  journals: JournalEntry[];
  search: string;
  setSearch: (s: string) => void;
  activeTab: 'all' | 'favorites';
  setActiveTab: (tab: 'all' | 'favorites') => void;
  featuredEntry: JournalEntry | null;
  recentLogs: JournalEntry[];
  streakDays: number;
  totalWords: number;
  setActiveEntryId: (id: string) => void;
  createEntry: () => void;
  handleRandomPrompt: () => void;
  handleCreateFromTemplate: (template: typeof TEMPLATES[0]) => void;
}

export const JournalCatalogView: React.FC<JournalCatalogViewProps> = ({
  journals,
  search,
  setSearch,
  activeTab,
  setActiveTab,
  featuredEntry,
  recentLogs,
  streakDays,
  totalWords,
  setActiveEntryId,
  createEntry,
  handleRandomPrompt,
  handleCreateFromTemplate,
}) => {
  return (
    <motion.div
      data-component="JournalModule"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="@container/catalog flex min-h-[calc(100dvh-4rem)] flex-col gap-5 text-left relative overflow-y-auto px-1 py-1"
    >
      {/* Ambient background light */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-rose-500/10 dark:bg-rose-500/5 blur-3xl pointer-events-none" />

      {/* Catalog Header */}
      <div className="relative max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-3.5 border-b border-border/40 pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-subtle shrink-0">
              <IconBook2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary truncate">
              Journal Workspace
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-medium pl-0.5">
            Reflect, draft notes, and build streaks inspired by warm editorial layouts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <IconSearch className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search thoughts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full pl-9 pr-3.5 py-1.5 text-xs shadow-subtle"
            />
          </div>

          <button className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-surface border border-border hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer relative shadow-subtle shrink-0">
            <IconBell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-5 items-start relative">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-5 w-full min-w-0">
          {/* Featured Entry Section */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-start w-full">
            <div className="flex-1 relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-surface border border-rose-200/20 p-4 sm:p-6 min-h-[200px] flex flex-col justify-between hover:shadow-lifted transition-all duration-200 group">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-20 80 C40 100, 90 60, 140 90 C190 120, 220 70, 270 100 C320 130, 340 90, 380 110" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="300" cy="50" r="70" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                </svg>
              </div>

              {featuredEntry ? (
                <>
                  <div className="relative z-10">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary">
                      {featuredEntry.pinned ? 'Pinned Memory' : 'Latest Reflection'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-text-primary tracking-tight mt-2 group-hover:text-primary transition-colors line-clamp-1">
                      {featuredEntry.title || 'Untitled Entry'}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed mt-1 line-clamp-2 max-w-md font-medium">
                      {(featuredEntry.content || '').replace(/<[^>]*>/g, '').trim() || 'Start drafting your thoughts...'}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between border-t border-border/30 pt-3 mt-3">
                    <span className="text-[10px] font-bold text-text-muted">
                      {formatDateTime(featuredEntry.date)}
                    </span>
                    <button
                      onClick={() => setActiveEntryId(featuredEntry.id)}
                      className="flex items-center gap-1 bg-primary hover:bg-primary-muted text-text-on-accent text-[11px] font-bold px-3.5 py-1.5 min-h-[34px] rounded-full transition-all cursor-pointer shadow-subtle border-none active:scale-95"
                    >
                      <span>Open Entry</span>
                      <IconChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col justify-center items-center py-6 text-center text-text-muted">
                  <IconBook2 className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-bold text-text-primary">No memories logged yet</p>
                  <p className="text-[10px] max-w-[200px] mt-0.5 leading-normal">
                    Click the buttons on the right to start drafting your catalog.
                  </p>
                </div>
              )}
            </div>

            {/* Action Pills */}
            <div className="flex flex-row sm:flex-col gap-2 shrink-0 justify-between sm:justify-start">
              <button
                onClick={createEntry}
                className="flex-1 sm:flex-initial flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle"
                title="New Entry"
              >
                <IconPlus className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'all' ? 'favorites' : 'all')}
                className={`flex-1 sm:flex-initial flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-subtle ${
                  activeTab === 'favorites'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-surface text-text-secondary hover:bg-surface-hover'
                }`}
                title="Toggle Pinned View"
              >
                {activeTab === 'favorites' ? <IconHeartFilled className="w-5 h-5" /> : <IconHeart className="w-5 h-5 text-rose-500" />}
              </button>
              <button
                onClick={handleRandomPrompt}
                className="flex-1 sm:flex-initial flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle"
                title="Daily Reflection Prompt"
              >
                <IconSparkles className="w-5 h-5 text-amber-500" />
              </button>
              <button
                onClick={() => exportJson('personal-hq-journal-backup.json', journals)}
                className="flex-1 sm:flex-initial flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl bg-surface border border-border hover:bg-surface-hover transition-all cursor-pointer text-text-secondary hover:text-text-primary active:scale-95 shadow-subtle"
                title="Export Backup Log"
              >
                <IconDownload className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>

          {/* Recent Logs List */}
          <div className="flex flex-col gap-2.5 w-full">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Recent Logs</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 @md:grid-cols-3 gap-3 w-full">
              {recentLogs.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-text-muted border border-dashed border-border/50 rounded-2xl italic">
                  No journal entries found.
                </div>
              ) : (
                recentLogs.map((entry) => {
                  const clean = (entry.content || '').replace(/<[^>]*>/g, '').trim();
                  const snippet = clean ? (clean.length > 50 ? clean.slice(0, 50) + '...' : clean) : 'No description...';

                  return (
                    <div
                      key={entry.id}
                      onClick={() => setActiveEntryId(entry.id)}
                      className="bg-surface-alt hover:bg-surface-hover border border-border hover:border-primary/30 rounded-2xl sm:rounded-[24px] p-4 shadow-subtle cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lifted flex flex-col justify-between min-h-[140px]"
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[9px] font-bold text-text-muted">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-surface/60 border border-border flex items-center justify-center shrink-0">
                          <MoodIllustration mood={entry.mood || ''} />
                        </div>
                      </div>

                      <div className="mt-2.5">
                        <h4 className="text-xs font-bold text-text-primary truncate" title={entry.title}>
                          {entry.title || 'Untitled Entry'}
                        </h4>
                        <p className="text-[10px] text-text-secondary leading-normal line-clamp-2 mt-0.5 font-medium">
                          {snippet}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-4 w-full min-w-0">
          {/* User Stats Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-950 to-stone-900 border border-neutral-800 rounded-3xl p-4.5 shadow-lifted text-stone-100 flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
              👨‍💻
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white truncate">Daily Writer</h3>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                  🔥 {streakDays}d
                </span>
              </div>
              <div className="flex gap-3.5 mt-1.5 text-[9.5px] font-bold text-stone-400">
                <div className="flex flex-col">
                  <span className="text-white text-xs font-black">{journals.length}</span>
                  <span>Logs</span>
                </div>
                <div className="w-[1px] bg-white/10 h-5 align-middle self-center" />
                <div className="flex flex-col">
                  <span className="text-white text-xs font-black">
                    {totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : totalWords}
                  </span>
                  <span>Words</span>
                </div>
              </div>
            </div>
          </div>

          {/* Writing Templates Slider */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider pl-0.5">Writing Templates</span>

            <div className="grid grid-cols-2 gap-2.5">
              {TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.name}
                  onClick={() => handleCreateFromTemplate(tmpl)}
                  className="bg-surface border border-border hover:border-primary/20 rounded-2xl p-3 shadow-subtle cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center text-center gap-1.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-surface-alt flex items-center justify-center text-base shrink-0">
                    {tmpl.emoji}
                  </div>
                  <span className="text-[10.5px] font-bold text-text-primary leading-tight truncate w-full">
                    {tmpl.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
