export type PomodoroSessionId = 'focus' | 'short-break' | 'long-break';

export interface PomodoroCompletionNotification {
  id: string;
  sessionId: PomodoroSessionId;
  title: string;
  subtitle: string;
  icon: 'award' | 'confetti';
  variant: 'success' | 'achievement';
  timestamp: number;
}

const POMODORO_COMPLETION_EVENT = 'pomodoro-completion';
const POMODORO_COMPLETION_STORAGE_KEY = 'phq_pomodoro_completion';
const POMODORO_NOTIFICATION_PROMPTED_KEY = 'phq_pomodoro_notifications_prompted';

export const notifyPomodoroCompletion = (notification: PomodoroCompletionNotification) => {
  if (typeof window === 'undefined') return;

  const payload = JSON.stringify(notification);
  localStorage.setItem(POMODORO_COMPLETION_STORAGE_KEY, payload);
  window.dispatchEvent(
    new CustomEvent<PomodoroCompletionNotification>(POMODORO_COMPLETION_EVENT, {
      detail: notification,
    })
  );
};

export const subscribePomodoroCompletion = (
  handler: (notification: PomodoroCompletionNotification) => void
) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<PomodoroCompletionNotification>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== POMODORO_COMPLETION_STORAGE_KEY || !event.newValue) return;

    try {
      const notification = JSON.parse(event.newValue) as PomodoroCompletionNotification;
      if (notification?.id) {
        handler(notification);
      }
    } catch {
      // Ignore malformed payloads from other tabs.
    }
  };

  window.addEventListener(POMODORO_COMPLETION_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(POMODORO_COMPLETION_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

export const requestPomodoroNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported' as const;
  }

  if (Notification.permission !== 'default') {
    return Notification.permission;
  }

  if (localStorage.getItem(POMODORO_NOTIFICATION_PROMPTED_KEY) === 'true') {
    return Notification.permission;
  }

  localStorage.setItem(POMODORO_NOTIFICATION_PROMPTED_KEY, 'true');

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

export const showPomodoroDesktopNotification = (notification: PomodoroCompletionNotification) => {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted') return false;

  new Notification(notification.title, {
    body: notification.subtitle,
    tag: `pomodoro-${notification.sessionId}-${notification.id}`,
  });

  return true;
};