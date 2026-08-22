import { useState } from 'react';
import {
  IconPalette,
  IconPencil,
  IconMoodSmile,
  IconMapPin,
  IconBell,
  IconCheck,
  IconTrash,
  IconTag,
  IconChevronRight,
  IconDownload,
  IconPlus,
  IconSparkles,
  IconX,
} from '@tabler/icons-react';

import { CustomSelect } from '../../../components/ui/CustomSelect';
import { TagInput } from '../../../components/ui/TagInput';
import { StickyNotes } from './StickyNotes';
import { type JournalStickyNote } from '../../../store/types';
import {
  STYLE_PRESETS,
  PAGE_STYLE_OPTIONS,
  MOOD_OPTIONS,
  type EntryStylePreset,
  type EntryPageStyle,
  type EntryMood,
} from '../utils';

export function JournalSettingsSidebar({
  stylePreset,
  setStylePreset,
  pageStyle,
  setPageStyle,
  mood,
  setMood,
  tags,
  setTags,
  location,
  setLocation,
  reminder,
  setReminder,
  focusItems,
  setFocusItems,
  newFocusText,
  setNewFocusText,
  addFocusItem,
  toggleFocusItem,
  removeFocusItem,
  focusCompletion,
  streakDays,
  saveAsTemplate,
  exportEntry,
  createEntry,
  setIsSettingsOpen,
  forceSave,

  journalStickyNotes,
  addJournalStickyNote,
  updateJournalStickyNote,
  deleteJournalStickyNote,
  resolvedTheme,
  isDrawer = false,
}: {
  stylePreset: EntryStylePreset;
  setStylePreset: (val: EntryStylePreset) => void;
  pageStyle: EntryPageStyle;
  setPageStyle: (val: EntryPageStyle) => void;
  mood: EntryMood;
  setMood: (val: EntryMood) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  location: string;
  setLocation: (val: string) => void;
  reminder: string;
  setReminder: (val: string) => void;
  focusItems: { text: string; checked: boolean }[];
  setFocusItems: (items: { text: string; checked: boolean }[]) => void;
  newFocusText: string;
  setNewFocusText: (val: string) => void;
  addFocusItem: () => void;
  toggleFocusItem: (index: number) => void;
  removeFocusItem: (index: number) => void;
  focusCompletion: number;
  streakDays: number;
  saveAsTemplate: () => void;
  exportEntry: () => void;
  createEntry: () => void;
  setIsSettingsOpen: (val: boolean) => void;
  forceSave: () => void;

  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void> | void;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void> | void;
  deleteJournalStickyNote: (id: string) => Promise<void> | void;
  resolvedTheme: string;
  isDrawer?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'style' | 'focus'>('style');

  return (
    <aside
      className={`@container relative group/settings flex flex-col gap-3.5 rounded-3xl sm:rounded-[28px] border border-border/60 bg-surface/95 p-3.5 sm:p-4 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.28)] backdrop-blur-xl overflow-y-auto custom-scrollbar transition-all duration-300 w-full ${
        isDrawer ? 'max-h-[85dvh] sm:max-h-[90dvh]' : 'max-h-[calc(100dvh-2rem)] xl:w-[320px] shrink-0'
      }`}
    >
      {/* Header & Collapse Handle */}
      <div className="flex items-center justify-between pb-1 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-text-primary">
            Settings & Toolkit
          </span>
        </div>

        {/* Drawer Close / Desktop Collapse Button */}
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="w-8 h-8 rounded-xl border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover flex items-center justify-center cursor-pointer transition-colors shrink-0"
          title="Close Settings Panel"
        >
          {isDrawer ? <IconX size={15} /> : <IconChevronRight size={15} />}
        </button>
      </div>

      {/* Top Persistent Navigation Tab Bar */}
      <div className="grid grid-cols-2 p-1 bg-surface-alt rounded-2xl border border-border/50 text-xs font-bold shrink-0 select-none">
        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`py-2 px-3 min-h-[38px] rounded-xl transition-all border-none cursor-pointer text-center text-xs ${
            activeTab === 'style'
              ? 'bg-surface text-primary shadow-xs font-black'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          🎨 Style & Paper
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('focus')}
          className={`py-2 px-3 min-h-[38px] rounded-xl transition-all border-none cursor-pointer text-center text-xs ${
            activeTab === 'focus'
              ? 'bg-surface text-primary shadow-xs font-black'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          🎯 Focus & Notes
        </button>
      </div>

      {/* ── TAB 1: Style & Paper ── */}
      {activeTab === 'style' && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          {/* Style Presets */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Choose a style</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">Match the paper & accent.</p>
              </div>
              <IconPalette size={14} className="text-text-muted" />
            </div>
            <div className="mt-3 grid grid-cols-1 @sm:grid-cols-2 gap-2">
              {STYLE_PRESETS.map((preset) => {
                const selected = preset.id === stylePreset;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setStylePreset(preset.id)}
                    className={`group flex items-center gap-2.5 rounded-xl border p-2 text-left transition-all cursor-pointer ${
                      selected ? 'border-primary bg-primary/10 shadow-xs' : 'border-border bg-surface hover:bg-surface-hover'
                    }`}
                  >
                    <span
                      className="h-8 w-8 rounded-lg border border-border/40 shrink-0"
                      style={{ background: preset.surface, boxShadow: `inset 0 0 0 1px ${preset.glow}` }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold text-text-primary truncate">{preset.label}</span>
                      <span className="block text-[9.5px] text-text-muted truncate">{preset.caption}</span>
                    </span>
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-border/40 shrink-0"
                      style={{ backgroundColor: selected ? preset.glow : 'transparent' }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: preset.accent }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Type Style */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Paper Template</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">Line pattern and ruling layout.</p>
              </div>
              <IconPencil size={14} className="text-text-muted" />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {PAGE_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPageStyle(option.value)}
                  className={`rounded-xl border px-3 py-1.5 min-h-[34px] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    pageStyle === option.value
                      ? 'border-primary bg-primary text-text-on-accent'
                      : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Journal Meta Settings */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
              <IconMoodSmile size={14} className="text-primary" />
              <span>Mood & Tags</span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Mood</label>
                <CustomSelect value={mood} onChange={(value) => setMood(value as EntryMood)} options={MOOD_OPTIONS} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Tags</label>
                <TagInput tags={tags} onChange={setTags} placeholder="Add tag + Enter" />
              </div>

              <div className="space-y-1">
                <label htmlFor="journal-location" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Location</label>
                <div className="relative">
                  <IconMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="journal-location"
                    name="location"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    onBlur={forceSave}
                    placeholder="e.g. Kyoto, Coffeehouse"
                    className="input-field w-full pl-9 text-xs py-2"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="journal-reminder" className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Reminder</label>
                <div className="relative">
                  <IconBell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                  <input
                    id="journal-reminder"
                    name="reminder"
                    value={reminder}
                    onChange={(event) => setReminder(event.target.value)}
                    onBlur={forceSave}
                    placeholder="e.g. Follow-up tomorrow 9am"
                    className="input-field w-full pl-9 text-xs py-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Focus & Notes ── */}
      {activeTab === 'focus' && (
        <div className="flex flex-col gap-3.5 animate-fadeIn">
          {/* Focus Checklist */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Focus Items</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">{focusCompletion}% focus complete</p>
              </div>
              <IconCheck size={14} className="text-text-muted" />
            </div>

            {/* Progress bar */}
            <div className="mt-2.5 w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${focusCompletion}%` }} />
            </div>

            <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              {focusItems.length > 0 ? (
                focusItems.map((item, index) => (
                  <div
                    key={`${item.text}-${index}`}
                    className={`flex items-center justify-between gap-2 rounded-xl border p-2 text-xs transition-all ${
                      item.checked ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border/60 bg-surface text-text-secondary'
                    }`}
                  >
                    <button type="button" onClick={() => toggleFocusItem(index)} className="flex-1 flex items-center gap-2 text-left min-h-[28px] cursor-pointer">
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.checked ? 'bg-primary' : 'bg-text-muted/40'}`} />
                      <span className={item.checked ? 'line-through opacity-70' : ''}>{item.text}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFocusItem(index)}
                      className="p-1 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-text-muted py-1">No focus checklist items added yet.</p>
              )}
            </div>

            <div className="mt-2.5 flex gap-2">
              <input
                id="new-focus-item"
                name="newFocusItem"
                aria-label="Add a focus item"
                value={newFocusText}
                onChange={(event) => setNewFocusText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addFocusItem();
                  }
                }}
                placeholder="Add a focus goal"
                className="input-field flex-1 text-xs py-2 px-3 rounded-xl"
              />
              <button onClick={addFocusItem} className="btn btn-primary btn-md text-xs py-2 px-3.5 h-auto min-h-[36px] rounded-xl cursor-pointer">
                Add
              </button>
            </div>

            {focusItems.length > 0 && (
              <div className="mt-2 flex justify-end border-t border-border/20 pt-2">
                <button
                  onClick={() => setFocusItems([])}
                  className="text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Focus Streak */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">Focus Streak</p>
                <p className="mt-0.5 text-[11px] text-text-secondary">Keep the streak alive daily.</p>
              </div>
              <IconSparkles size={14} className="text-primary" />
            </div>

            <div className="mt-3 rounded-2xl border border-border/60 bg-surface p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-black text-xs">{streakDays}</span>
                <span className="text-xs">{streakDays} day streak 🔥</span>
              </div>
              <div className="mt-2.5 flex items-end gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[8.5px] font-semibold text-text-muted">{day}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border text-[9px] font-bold ${
                        index <= streakDays % 7 ? 'border-primary bg-primary text-text-on-accent' : 'border-border bg-surface text-text-muted'
                      }`}
                    >
                      {index < streakDays % 7 ? <IconCheck size={9} /> : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Notes */}
          <StickyNotes
            journalStickyNotes={journalStickyNotes}
            addJournalStickyNote={addJournalStickyNote}
            updateJournalStickyNote={updateJournalStickyNote}
            deleteJournalStickyNote={deleteJournalStickyNote}
            isDark={resolvedTheme === 'dark'}
          />

          {/* Quick Actions */}
          <div className="rounded-[22px] border border-border/60 bg-surface-alt/35 p-3.5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
              <IconTag size={14} className="text-primary" />
              <span>Quick Actions</span>
            </div>
            <div className="mt-2.5 space-y-1.5">
              <button
                onClick={saveAsTemplate}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover cursor-pointer"
              >
                <span className="text-xs font-semibold text-text-primary">Save as Template</span>
                <IconChevronRight size={13} className="text-text-muted" />
              </button>
              <button
                onClick={exportEntry}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover cursor-pointer"
              >
                <span className="text-xs font-semibold text-text-primary">Export JSON</span>
                <IconDownload size={13} className="text-text-muted" />
              </button>
              <button
                onClick={createEntry}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-hover cursor-pointer"
              >
                <span className="text-xs font-semibold text-text-primary">New Blank Entry</span>
                <IconPlus size={13} className="text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
