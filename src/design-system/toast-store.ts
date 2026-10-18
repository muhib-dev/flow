import { create } from 'zustand';

export type Toast = {
  id: number;
  message: string;
  tone: 'info' | 'success' | 'error';
  action?: { label: string; onPress: () => void };
};

type ToastState = {
  toasts: Toast[];
  show: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
};

const DURATION_MS = 4000;
let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (toast) => {
    const id = nextId++;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().dismiss(id), DURATION_MS);
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

/** Imperative helpers usable outside React (mutations, sync engine). */
export const toast = {
  info: (message: string, action?: Toast['action']) =>
    useToastStore.getState().show({ message, tone: 'info', action }),
  success: (message: string) => useToastStore.getState().show({ message, tone: 'success' }),
  error: (message: string, action?: Toast['action']) =>
    useToastStore.getState().show({ message, tone: 'error', action }),
};
