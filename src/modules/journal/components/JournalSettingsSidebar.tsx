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
  IconSparkles
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
  type EntryMood
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
  addJournalStickyNote: (note: JournalStickyNote) => Promise<void>;
  updateJournalStickyNote: (id: string, data: Partial<JournalStickyNote>) => Promise<void>;
  deleteJournalStickyNote: (id: string) => Promise<void>;
  resolvedTheme: string;
}) {
  return (
    <aside className="relative group/settings flex flex-col gap-4 rounded-[28px] border border-border/60 bg-surface/90 p-4 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.28)] backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-2rem)] transition-all duration-300 w-full sm:w-[320px]">
      {/* Hover Collapse Slider Handle */}
      <div className="absolute top-1/2 -left-3 -translate-y-1/2 z-20 opacity-0 group-hover/settings:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="w-5 h-10 rounded-full border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-hover flex items-center justify-center shadow-md cursor-pointer"
          title="Collapse Settings"
        >
          <IconChevronRight size={12} />
        </button>
      </div>

      {/* Style Presets */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Choose a style</p>
            <p className="mt-1 text-xs text-text-secondary">Match the paper and accent to your mood.</p>
          </div>
          <IconPalette size={14} className="text-text-muted" />
        </div>
        <div className="mt-4 grid gap-2.5">
          {STYLE_PRESETS.map((preset) => {
            const selected = preset.id === stylePreset;
            return (
              <button
                key={preset.id}
                onClick={() => setStylePreset(preset.id)}
                className={`group flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${
                  selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-surface hover:bg-surface-hover'
                }`}
              >
                <span
                  className="h-10 w-10 rounded-xl border border-border/40"
                  style={{ background: preset.surface, boxShadow: `inset 0 0 0 1px ${preset.glow}` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-text-primary">{preset.label}</span>
                  <span className="block text-[10px] text-text-muted">{preset.caption}</span>
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-border/40"
                  style={{ backgroundColor: selected ? preset.glow : 'transparent' }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: preset.accent }} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Paper Type Style (Lines, Dotted, Cornell, etc.) */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Paper Template</p>
            <p className="mt-1 text-xs text-text-secondary">Set the background line styling.</p>
          </div>
          <IconPencil size={14} className="text-text-muted" />
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {PAGE_STYLE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setPageStyle(option.value)}
              className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                pageStyle === option.value
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Journal Settings */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
          <IconMoodSmile size={14} className="text-primary" />
          <span>Journal Settings</span>
        </div>

        <div className="mt-4 space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Mood</label>
            <CustomSelect value={mood} onChange={(value) => setMood(value as EntryMood)} options={MOOD_OPTIONS} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Tags</label>
            <TagInput tags={tags} onChange={setTags} placeholder="Add tag and press Enter" />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Location</label>
            <div className="relative">
              <IconMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                onBlur={forceSave}
                placeholder="Add location"
                className="input-field w-full pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Reminder</label>
            <div className="relative">
              <IconBell className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                value={reminder}
                onChange={(event) => setReminder(event.target.value)}
                onBlur={forceSave}
                placeholder="Set reminder"
                className="input-field w-full pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Checklist */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Focus Items</p>
            <p className="mt-1 text-xs text-text-secondary">{focusCompletion}% focus complete</p>
          </div>
          <IconCheck size={14} className="text-text-muted" />
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full h-1.5 bg-border/40 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${focusCompletion}%` }} />
        </div>

        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
          {focusItems.length > 0 ? (
            focusItems.map((item, index) => (
              <div
                key={`${item.text}-${index}`}
                className={`flex items-center justify-between gap-2 rounded-xl border p-2 text-xs transition-all ${
                  item.checked ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border/60 bg-surface text-text-secondary'
                }`}
              >
                <button type="button" onClick={() => toggleFocusItem(index)} className="flex-1 flex items-center gap-2 text-left">
                  <span className={`h-2 w-2 rounded-full ${item.checked ? 'bg-primary' : 'bg-text-muted/40'}`} />
                  <span className={item.checked ? 'line-through opacity-70' : ''}>{item.text}</span>
                </button>
                <button
                  type="button"
                  onClick={() => removeFocusItem(index)}
                  className="text-text-muted hover:text-red-500 transition-colors"
                >
                  <IconTrash size={12} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-text-muted">No focus checklist items added yet.</p>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={newFocusText}
            onChange={(event) => setNewFocusText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addFocusItem();
              }
            }}
            placeholder="Add a focus item"
            className="input-field flex-1 text-xs py-1.5 px-3 rounded-xl"
          />
          <button onClick={addFocusItem} className="btn btn-primary btn-md text-xs py-1.5 px-3 h-auto min-h-0 rounded-xl">
            Add
          </button>
        </div>

        {focusItems.length > 0 && (
          <div className="mt-3 flex gap-2 justify-end border-t border-border/20 pt-2.5">
            <button
              onClick={() => setFocusItems([])}
              className="text-[10px] font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              Clear Focus
            </button>
          </div>
        )}
      </div>

      {/* Streak days */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">Focus Streak</p>
            <p className="mt-1 text-xs text-text-secondary">Keep the habit alive with daily entries.</p>
          </div>
          <IconSparkles size={14} className="text-primary" />
        </div>

        <div className="mt-4 rounded-[24px] border border-border/60 bg-surface p-3.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">{streakDays}</span>
            <span>{streakDays} day streak</span>
          </div>
          <div className="mt-3 flex items-end gap-1.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div key={`${day}-${index}`} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[9px] font-semibold text-text-muted">{day}</span>
                <span
                  className={`flex h-6.5 w-6.5 items-center justify-center rounded-full border text-[10px] font-bold ${
                    index <= streakDays % 7 ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-text-muted'
                  }`}
                >
                  {index < streakDays % 7 ? <IconCheck size={10} /> : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Notes inside Journal Workspace Editor */}
      <StickyNotes
        journalStickyNotes={journalStickyNotes}
        addJournalStickyNote={addJournalStickyNote}
        updateJournalStickyNote={updateJournalStickyNote}
        deleteJournalStickyNote={deleteJournalStickyNote}
        isDark={resolvedTheme === 'dark'}
      />

      {/* Quick Actions */}
      <div className="rounded-[24px] border border-border/60 bg-surface-alt/35 p-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-muted">
          <IconTag size={14} className="text-primary" />
          <span>Quick Actions</span>
        </div>
        <div className="mt-4 space-y-2">
          <button
            onClick={saveAsTemplate}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <span className="text-xs font-semibold text-text-primary">Save as Template</span>
            <IconChevronRight size={14} className="text-text-muted" />
          </button>
          <button
            onClick={exportEntry}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <span className="text-xs font-semibold text-text-primary">Export entry JSON</span>
            <IconDownload size={14} className="text-text-muted" />
          </button>
          <button
            onClick={createEntry}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-hover"
          >
            <span className="text-xs font-semibold text-text-primary">New Blank Entry</span>
            <IconPlus size={14} className="text-text-muted" />
          </button>
        </div>
      </div>
    </aside>
  );
}
