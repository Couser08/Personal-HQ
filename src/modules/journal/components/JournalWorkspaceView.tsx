import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconArrowLeft,
  IconCheck,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconTrash,
  IconPalette,
} from '@tabler/icons-react';
import { type JournalEntry, type JournalStickyNote } from '../../../store/useAppStore';
import { Button } from '../../../components/ui/Button';
import { IconButton } from '../../../components/ui/IconButton';
import { JournalEditor } from './JournalEditor';
import { JournalSettingsSidebar } from './JournalSettingsSidebar';
import { formatDateTime, type EntryMood, type EntryPageStyle, type EntryStylePreset } from '../utils';

interface JournalWorkspaceViewProps {
  activeEntry: JournalEntry;
  previewMode: boolean;
  setPreviewMode: (fn: (v: boolean) => boolean) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  title: string;
  setTitle: (t: string) => void;
  content: string;
  setContent: (c: string) => void;
  mood: EntryMood;
  setMood: (m: EntryMood) => void;
  tags: string[];
  setTags: (t: string[]) => void;
  location: string;
  setLocation: (l: string) => void;
  reminder: string;
  setReminder: (r: string) => void;
  stylePreset: EntryStylePreset;
  setStylePreset: (s: EntryStylePreset) => void;
  pageStyle: EntryPageStyle;
  setPageStyle: (p: EntryPageStyle) => void;
  focusItems: { text: string; checked: boolean }[];
  setFocusItems: (f: { text: string; checked: boolean }[]) => void;
  newFocusText: string;
  setNewFocusText: (t: string) => void;
  addFocusItem: () => void;
  toggleFocusItem: (idx: number) => void;
  removeFocusItem: (idx: number) => void;
  focusCompletion: number;
  streakDays: number;
  currentStyle: any;
  editorPaperStyle: any;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (fn: (open: boolean) => boolean) => void;
  forceSave: () => Promise<void>;
  forceSaveAndClose: () => Promise<void>;
  togglePinned: () => void;
  deleteCurrentEntry: () => void;
  saveAsTemplate: () => void;
  exportEntry: () => void;
  createEntry: () => void;
  journalStickyNotes: JournalStickyNote[];
  addJournalStickyNote: (note: JournalStickyNote) => void;
  updateJournalStickyNote: (id: string, updates: Partial<JournalStickyNote>) => void;
  deleteJournalStickyNote: (id: string) => void;
  resolvedTheme: 'dark' | 'light';
}

export const JournalWorkspaceView: React.FC<JournalWorkspaceViewProps> = ({
  activeEntry,
  previewMode,
  setPreviewMode,
  saveStatus,
  title,
  setTitle,
  content,
  setContent,
  mood,
  setMood,
  tags,
  setTags,
  location,
  setLocation,
  reminder,
  setReminder,
  stylePreset,
  setStylePreset,
  pageStyle,
  setPageStyle,
  focusItems,
  setFocusItems,
  newFocusText,
  setNewFocusText,
  addFocusItem,
  toggleFocusItem,
  removeFocusItem,
  focusCompletion,
  streakDays,
  currentStyle,
  editorPaperStyle,
  isSettingsOpen,
  setIsSettingsOpen,
  forceSave,
  forceSaveAndClose,
  togglePinned,
  deleteCurrentEntry,
  saveAsTemplate,
  exportEntry,
  createEntry,
  journalStickyNotes,
  addJournalStickyNote,
  updateJournalStickyNote,
  deleteJournalStickyNote,
  resolvedTheme,
}) => {
  return (
    <motion.div
      data-component="JournalModule"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', damping: 24, stiffness: 280 }}
      className="@container/workspace flex min-h-[calc(100dvh-4rem)] flex-col gap-3 text-left relative"
    >
      <div
        className={`grid grid-cols-1 min-h-[calc(100dvh-4rem)] gap-4 transition-all duration-300 ${
          isSettingsOpen ? 'xl:grid-cols-[1fr_320px]' : 'xl:grid-cols-1'
        }`}
      >
        {/* Center Column (Workspace Editor) */}
        <section className="relative group/workspace flex min-h-0 flex-col gap-3 rounded-3xl sm:rounded-4xl border border-border/70 bg-surface/90 p-2 sm:p-4 shadow-[0_18px_55px_-30px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-300">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-2 rounded-2xl sm:rounded-[28px] border border-border/60 bg-surface px-3 py-2 sm:px-4.5 sm:py-2.5 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={forceSaveAndClose}
                className="flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl sm:rounded-2xl border border-border bg-surface-alt text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary cursor-pointer shrink-0"
                title="Back to Journal Catalog"
              >
                <IconArrowLeft size={16} />
              </button>

              <div className="min-w-0">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-text-muted truncate">
                  Journal
                </p>
                <p className="text-[10px] sm:text-[11px] text-text-secondary font-medium truncate">
                  {formatDateTime(activeEntry.date)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-surface-alt px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold text-text-secondary">
                {saveStatus === 'saved' || saveStatus === 'idle' ? (
                  <IconCheck size={12} className="text-emerald-500" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Saving...' : 'Saved'}</span>
              </div>
              <Button
                onClick={() => {
                  setPreviewMode((value) => !value);
                  void forceSave();
                }}
                variant="secondary"
                className={`text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 h-8 sm:h-9 min-h-[32px] ${previewMode ? 'border-primary text-primary' : ''}`}
              >
                <IconEye size={14} />
                <span>{previewMode ? 'Edit' : 'Preview'}</span>
              </Button>
              <IconButton onClick={togglePinned} variant="ghost" title="Pin entry" className="p-1.5 sm:p-2 min-h-[32px] min-w-[32px]">
                {activeEntry.pinned ? <IconHeartFilled size={16} className="text-red-500" /> : <IconHeart size={16} />}
              </IconButton>
              <IconButton onClick={deleteCurrentEntry} variant="ghost" className="text-red-500 p-1.5 sm:p-2 min-h-[32px] min-w-[32px]" title="Delete entry">
                <IconTrash size={16} />
              </IconButton>

              <button
                onClick={() => setIsSettingsOpen((open) => !open)}
                className={`flex h-8.5 w-8.5 sm:h-9.5 sm:w-9.5 items-center justify-center rounded-xl sm:rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSettingsOpen
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border bg-surface-alt text-text-secondary hover:bg-surface-hover'
                }`}
                title="Toggle Styles & Toolkit"
              >
                <IconPalette size={16} />
              </button>
            </div>
          </div>

          <JournalEditor
            activeEntry={activeEntry}
            previewMode={previewMode}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            mood={mood || ''}
            tags={tags}
            currentStyle={currentStyle}
            editorPaperStyle={editorPaperStyle}
            forceSave={forceSave}
          />
        </section>

        {/* Desktop View (xl+ inline) */}
        <div className="hidden xl:block">
          {isSettingsOpen && (
            <JournalSettingsSidebar
              stylePreset={stylePreset}
              setStylePreset={setStylePreset}
              pageStyle={pageStyle}
              setPageStyle={setPageStyle}
              mood={mood}
              setMood={setMood}
              tags={tags}
              setTags={setTags}
              location={location}
              setLocation={setLocation}
              reminder={reminder}
              setReminder={setReminder}
              focusItems={focusItems}
              setFocusItems={setFocusItems}
              newFocusText={newFocusText}
              setNewFocusText={setNewFocusText}
              addFocusItem={addFocusItem}
              toggleFocusItem={toggleFocusItem}
              removeFocusItem={removeFocusItem}
              focusCompletion={focusCompletion}
              streakDays={streakDays}
              saveAsTemplate={saveAsTemplate}
              exportEntry={exportEntry}
              createEntry={createEntry}
              setIsSettingsOpen={setIsSettingsOpen as any}
              forceSave={forceSave}
              journalStickyNotes={journalStickyNotes}
              addJournalStickyNote={addJournalStickyNote}
              updateJournalStickyNote={updateJournalStickyNote}
              deleteJournalStickyNote={deleteJournalStickyNote}
              resolvedTheme={resolvedTheme}
              isDrawer={false}
            />
          )}
        </div>

        {/* Mobile & Tablet Slide-in Drawer (< xl) */}
        <AnimatePresence>
          {isSettingsOpen && (
            <div className="xl:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsOpen(() => false)}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="fixed top-0 bottom-0 right-0 z-50 w-[90%] max-w-[360px] p-3 sm:p-4 flex flex-col justify-center"
              >
                <JournalSettingsSidebar
                  stylePreset={stylePreset}
                  setStylePreset={setStylePreset}
                  pageStyle={pageStyle}
                  setPageStyle={setPageStyle}
                  mood={mood}
                  setMood={setMood}
                  tags={tags}
                  setTags={setTags}
                  location={location}
                  setLocation={setLocation}
                  reminder={reminder}
                  setReminder={setReminder}
                  focusItems={focusItems}
                  setFocusItems={setFocusItems}
                  newFocusText={newFocusText}
                  setNewFocusText={setNewFocusText}
                  addFocusItem={addFocusItem}
                  toggleFocusItem={toggleFocusItem}
                  removeFocusItem={removeFocusItem}
                  focusCompletion={focusCompletion}
                  streakDays={streakDays}
                  saveAsTemplate={saveAsTemplate}
                  exportEntry={exportEntry}
                  createEntry={createEntry}
                  setIsSettingsOpen={setIsSettingsOpen as any}
                  forceSave={forceSave}
                  journalStickyNotes={journalStickyNotes}
                  addJournalStickyNote={addJournalStickyNote}
                  updateJournalStickyNote={updateJournalStickyNote}
                  deleteJournalStickyNote={deleteJournalStickyNote}
                  resolvedTheme={resolvedTheme}
                  isDrawer={true}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
