import { useAuthStore } from '../store/useAuthStore';
import { useAppStore, type AppSettings, type AppStore } from '../store/useAppStore';

export const BACKUP_VERSION = '1.0.0';

type BackupOwner = {
  userId: string;
  email: string | null;
};

type BackupPayload = {
  _meta: {
    app: 'personal-hq';
    schemaVersion: typeof BACKUP_VERSION;
    exportedAt: string;
    owner: BackupOwner;
  };
  notes: AppStore['notes'];
  links: AppStore['links'];
  stocks: AppStore['stocks'];
  interestHistory: AppStore['interestHistory'];
  examAttempts: AppStore['examAttempts'];
  dailyReflections: AppStore['dailyReflections'];
  visions: AppStore['visions'];
  mediaLogs: AppStore['mediaLogs'];
  countdowns: AppStore['countdowns'];
  snippets: AppStore['snippets'];
  todoProjects: AppStore['todoProjects'];
  todoTasks: AppStore['todoTasks'];
  pomodoroStats: AppStore['pomodoroStats'];
  journals: AppStore['journals'];
  settings: AppSettings;
};

const DEFAULT_SETTINGS: AppSettings = {
  countdownTemplate: 'default',
  accentColor: 'rose',
  animationSpeed: 'normal',
  compactMode: false,
  soundEnabled: true,
  initialBankBalance: 0,
  initialCashBalance: 0,
  reduceBlur: false,
  reduceAnimations: false,
};

export const buildBackupData = (state: AppStore, owner: BackupOwner): BackupPayload => ({
  _meta: {
    app: 'personal-hq',
    schemaVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    owner,
  },
  notes: state.notes,
  links: state.links,
  stocks: state.stocks,
  interestHistory: state.interestHistory,
  examAttempts: state.examAttempts,
  dailyReflections: state.dailyReflections,
  visions: state.visions,
  mediaLogs: state.mediaLogs,
  countdowns: state.countdowns,
  snippets: state.snippets,
  todoProjects: state.todoProjects,
  todoTasks: state.todoTasks,
  pomodoroStats: state.pomodoroStats,
  journals: state.journals,
  settings: state.settings,
});

export const validateBackupOwner = (data: unknown, owner: BackupOwner): string | null => {
  if (!data || typeof data !== 'object' || !('_meta' in data)) {
    return 'Invalid or corrupted backup file.';
  }

  const meta = (data as { _meta?: { app?: string; owner?: Partial<BackupOwner> } })._meta;
  if (!meta || meta.app !== 'personal-hq' || !meta.owner?.userId) {
    return 'This is not a valid Personal HQ backup.';
  }

  if (meta.owner.userId !== owner.userId) {
    return "This backup belongs to a different account.";
  }

  if (meta.owner.email && owner.email && meta.owner.email !== owner.email) {
    return "This backup belongs to a different email address.";
  }

  return null;
};

export const normalizeImportedState = (data: Partial<BackupPayload>): Partial<AppStore> => ({
  notes: Array.isArray(data.notes) ? data.notes : [],
  links: Array.isArray(data.links) ? data.links : [],
  stocks: Array.isArray(data.stocks) ? data.stocks : [],
  interestHistory: Array.isArray(data.interestHistory) ? data.interestHistory : [],
  examAttempts: Array.isArray(data.examAttempts) ? data.examAttempts : [],
  dailyReflections: Array.isArray(data.dailyReflections) ? data.dailyReflections : [],
  visions: Array.isArray(data.visions) ? data.visions : [],
  mediaLogs: Array.isArray(data.mediaLogs) ? data.mediaLogs : [],
  countdowns: Array.isArray(data.countdowns) ? data.countdowns : [],
  snippets: Array.isArray(data.snippets) ? data.snippets : [],
  todoProjects: Array.isArray(data.todoProjects) ? data.todoProjects : [],
  todoTasks: Array.isArray(data.todoTasks) ? data.todoTasks : [],
  pomodoroStats: data.pomodoroStats ?? { totalSessions: 0, totalMinutes: 0 },
  journals: Array.isArray(data.journals) ? data.journals : [],
  settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
});

export const exportData = () => {
  const user = useAuthStore.getState().user;
  if (!user) return false;

  const data = buildBackupData(useAppStore.getState(), {
    userId: user.id,
    email: user.email ?? null,
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `personal-hq-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

export const importData = (file: File, onSuccess: () => void, onError: (msg: string) => void) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        onError('No active Supabase session. Sign in before importing a backup.');
        return;
      }

      const content = event.target?.result;
      if (typeof content !== 'string') {
        onError('Failed to read backup file.');
        return;
      }

      const data = JSON.parse(content) as Partial<BackupPayload>;
      const ownerError = validateBackupOwner(data, { userId: user.id, email: user.email ?? null });
      if (ownerError) {
        onError(ownerError);
        return;
      }

      useAppStore.getState().importData(normalizeImportedState(data));
      onSuccess();
    } catch {
      onError('Failed to parse backup file.');
    }
  };
  reader.onerror = () => onError('Failed to read backup file.');
  reader.readAsText(file);
};
