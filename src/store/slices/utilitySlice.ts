import { type StateCreator } from 'zustand';
import type { AppStore } from '../types';

import { type NotesSlice, createNotesSlice } from './notesSlice';
import { type LinksSlice, createLinksSlice } from './linksSlice';
import { type TagsSlice, createTagsSlice } from './tagsSlice';
import { type FinanceSlice, createFinanceSlice } from './financeSlice';
import { type MediaSlice, createMediaSlice } from './mediaSlice';
import { type CountdownsSlice, createCountdownsSlice } from './countdownsSlice';
import { type SnippetsSlice, createSnippetsSlice } from './snippetsSlice';
import {
  type PomodoroSlice,
  createPomodoroSlice,
  globalPomodoroInterval,
  globalPomodoroWorker,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  globalPomodoroTick,
  syncPomodoroFromStorage,
} from './pomodoroSlice';

export type {
  NotesSlice,
  LinksSlice,
  TagsSlice,
  FinanceSlice,
  MediaSlice,
  CountdownsSlice,
  SnippetsSlice,
  PomodoroSlice,
};

export {
  globalPomodoroInterval,
  globalPomodoroWorker,
  globalPomodoroStartTime,
  globalPomodoroSecondsAtStart,
  globalPomodoroTick,
  syncPomodoroFromStorage,
};

export interface UtilitySlice
  extends NotesSlice,
    LinksSlice,
    TagsSlice,
    FinanceSlice,
    MediaSlice,
    CountdownsSlice,
    SnippetsSlice,
    PomodoroSlice {}

export const createUtilitySlice: StateCreator<AppStore, [], [], UtilitySlice> = (set, get, api) => ({
  ...createNotesSlice(set, get, api),
  ...createLinksSlice(set, get, api),
  ...createTagsSlice(set, get, api),
  ...createFinanceSlice(set, get, api),
  ...createMediaSlice(set, get, api),
  ...createCountdownsSlice(set, get, api),
  ...createSnippetsSlice(set, get, api),
  ...createPomodoroSlice(set, get, api),
});
