export type EffectType = 'pomodoro' | 'todo' | 'habits' | 'test';

export interface AnimationDetails {
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  badgeClass: string;
  buttonClass: string;
}

export function resolveAnimationDetails(
  resolvedEffect: 'habits' | 'todo' | 'pomodoro',
  variant: 1 | 2 | 3,
): AnimationDetails {
  if (resolvedEffect === 'habits') {
    switch (variant) {
      case 1:
        return {
          badge: 'Animation 1',
          title: 'Great job! 🌟',
          subtitle: 'You completed your habit. Keep the streak going!',
          buttonText: 'Awesome!',
          badgeClass:
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
        };
      case 2:
        return {
          badge: 'Animation 2',
          title: 'Habit Completed! 🎉',
          subtitle: "You're building something incredible!",
          buttonText: 'Awesome!',
          badgeClass:
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
        };
      default:
        return {
          badge: 'Animation 3',
          title: 'Streak Maintained! 🔥',
          subtitle: "Another day, another win! You're on fire!",
          buttonText: 'Awesome!',
          badgeClass:
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
          buttonClass: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20',
        };
    }
  } else if (resolvedEffect === 'todo') {
    switch (variant) {
      case 1:
        return {
          badge: 'Animation 1',
          title: 'Task Completed! 🚀',
          subtitle: 'You just checked off a task from your list.',
          buttonText: 'Nice Work!',
          badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
          buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20',
        };
      case 2:
        return {
          badge: 'Animation 2',
          title: 'All Set! ✅',
          subtitle: 'This task is now complete. Great progress!',
          buttonText: 'Nice Work!',
          badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
          buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20',
        };
      default:
        return {
          badge: 'Animation 3',
          title: 'Done & Dusted! 🎯',
          subtitle: 'One step closer to your goals.',
          buttonText: 'Nice Work!',
          badgeClass: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
          buttonClass: 'bg-purple-500 hover:bg-purple-600 text-white shadow-purple-500/20',
        };
    }
  } else {
    // pomodoro
    switch (variant) {
      case 1:
        return {
          badge: 'Animation 1 – AirDrop Pulse',
          title: 'Focus Complete! 🌐',
          subtitle: "Great session! Ready for what's next?",
          buttonText: 'Awesome!',
          badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20',
        };
      case 2:
        return {
          badge: 'Animation 2 – Receiving',
          title: 'Session Done! 📡',
          subtitle: 'Your focus is being shared with success.',
          buttonText: 'Awesome!',
          badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20',
        };
      default:
        return {
          badge: 'Animation 3 – Shared!',
          title: 'Great Focus! 🌐',
          subtitle: 'Your session is complete and synced.',
          buttonText: 'Awesome!',
          badgeClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
          buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20',
        };
    }
  }
}
