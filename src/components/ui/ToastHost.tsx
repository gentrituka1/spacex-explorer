"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { AppIcon } from "@/components/ui/AppIcon";
import { useToastStore, type ToastVariant } from "@/stores/toast-store";

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-500/40 bg-emerald-950/90 text-emerald-100",
  info: "border-sky-500/40 bg-slate-900/95 text-slate-100",
  error: "border-rose-500/40 bg-rose-950/90 text-rose-100",
};

const variantIcons: Record<ToastVariant, "check" | "info" | "alert"> = {
  success: "check",
  info: "info",
  error: "alert",
};

export function ToastHost() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(100vw-2rem,22rem)] flex-col gap-2 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={clsx(
              "pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-md",
              variantStyles[toast.variant],
            )}
          >
            <span
              className={clsx(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                toast.variant === "success" && "bg-emerald-500/20 text-emerald-300",
                toast.variant === "info" && "bg-sky-500/20 text-sky-300",
                toast.variant === "error" && "bg-rose-500/20 text-rose-300",
              )}
              aria-hidden="true"
            >
              <AppIcon name={variantIcons[toast.variant]} size={12} />
            </span>
            <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              aria-label="Dismiss notification"
            >
              <AppIcon name="close" size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

