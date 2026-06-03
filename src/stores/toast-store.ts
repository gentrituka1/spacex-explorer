"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "info" | "error";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, variant?: ToastVariant) => void;
  dismissToast: (id: number) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, variant = "info") => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, message, variant }] });
    window.setTimeout(() => {
      get().dismissToast(id);
    }, 3200);
  },
  dismissToast: (id) =>
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));

export function useToast() {
  const showToast = useToastStore((state) => state.showToast);
  return { showToast };
}
