import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'update';

export type ToastPosition = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastMessage[];
  position: ToastPosition;
  setPosition: (position: ToastPosition) => void;
  addToast: (titleOrMessage: string, messageOrType: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  position: (localStorage.getItem('toast-position') as ToastPosition) || 'bottom-center',
  setPosition: (position) => {
    localStorage.setItem('toast-position', position);
    set({ position });
  },
  addToast: (titleOrMessage, messageOrType, type) => {
    let t: ToastType;
    let msg: string;
    let title: string;

    if (!type) {
      // 2 arguments: (message, type)
      t = (messageOrType as ToastType) || 'info';
      msg = titleOrMessage;
      title = t.charAt(0).toUpperCase() + t.slice(1); // Default title based on type
    } else {
      // 3 arguments: (title, message, type)
      title = titleOrMessage;
      msg = messageOrType;
      t = type;
    }

    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { id, title, message: msg, type: t }]
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),
}));
