import { useAppStore } from '../../../store/useAppStore';

// Programmatic chime synthesis for completing all tasks
export const playCelebratoryChime = () => {
  try {
    if (useAppStore.getState().settings.soundEnabled === false) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g = ctx.createGain();

    o1.frequency.setValueAtTime(523.25, now); // C5
    o1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    o2.frequency.setValueAtTime(783.99, now + 0.16); // G5

    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    o1.connect(g);
    o2.connect(g);
    g.connect(ctx.destination);

    o1.start();
    o2.start(now + 0.08);
    o1.stop(now + 0.6);
    o2.stop(now + 0.6);
  } catch {}
};
