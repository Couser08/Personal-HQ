import { useAppStore } from '../store/useAppStore';

export const exportData = () => {
  const userStr = localStorage.getItem('phq_user');
  if (!userStr) return;
  const user = JSON.parse(userStr);

  const state = useAppStore.getState();
  
  const data = {
    _meta: {
      _owner: {
        usernameHash: user.usernameHash,
        passwordHash: user.passwordHash,
      },
      exportedAt: new Date().toISOString(),
      appVersion: "0.6.0"
    },
    notes: state.notes,
    links: state.links,
    stocks: state.stocks,
    subjects: state.subjects,
    interestHistory: state.interestHistory,
    mediaLogs: state.mediaLogs,
    countdowns: state.countdowns,
    snippets: state.snippets,
    settings: state.settings
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'personal-hq-backup.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const importData = (file: File, onSuccess: () => void, onError: (msg: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const data = JSON.parse(content);

      if (!data._meta || !data._meta._owner) {
        onError("Invalid or corrupted backup file.");
        return;
      }

      const userStr = localStorage.getItem('phq_user');
      if (!userStr) {
        onError("No active user session.");
        return;
      }
      const user = JSON.parse(userStr);

      if (
        data._meta._owner.usernameHash !== user.usernameHash ||
        data._meta._owner.passwordHash !== user.passwordHash
      ) {
        onError("This backup doesn't belong to your account.");
        return;
      }

      // Safe to import
      useAppStore.getState().importData({
        notes: data.notes || [],
        links: data.links || [],
        stocks: data.stocks || [],
        subjects: data.subjects || [],
        interestHistory: data.interestHistory || [],
        mediaLogs: data.mediaLogs || [],
        countdowns: data.countdowns || [],
        snippets: data.snippets || [],
        settings: data.settings || { countdownTemplate: 'default' }
      });

      onSuccess();
    } catch (err) {
      onError("Failed to parse backup file.");
    }
  };
  reader.readAsText(file);
};
