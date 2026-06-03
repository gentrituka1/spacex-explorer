"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = "🛰️",
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900/60 to-slate-950/60 px-6 py-20 text-center"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.05)_0%,_transparent_70%)]"
        aria-hidden="true"
      />
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-center justify-center"
        aria-hidden="true"
      >
        {typeof icon === "string" ? (
          <span className="text-5xl">{icon}</span>
        ) : (
          icon
        )}
      </motion.div>
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      </div>
      {action}
    </motion.div>
  );
}
