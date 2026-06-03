"use client";

import clsx from "clsx";

export function LaunchSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading launches">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex animate-shimmer items-center gap-4 rounded-2xl border border-slate-800/60 p-4"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="h-14 w-14 shrink-0 rounded-xl bg-slate-700/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded-lg bg-slate-700/50" />
            <div className="h-3 w-1/3 rounded-lg bg-slate-800/50" />
          </div>
          <div className="h-6 w-16 rounded-full bg-slate-700/50" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading launch details">
      <div className="animate-shimmer h-40 rounded-2xl border border-slate-800/60" />
      <div className="animate-shimmer h-64 rounded-2xl border border-slate-800/60" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="animate-shimmer h-48 rounded-2xl border border-slate-800/60" />
        <div className="animate-shimmer h-48 rounded-2xl border border-slate-800/60" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div
      className={clsx(
        "h-72 animate-shimmer rounded-2xl border border-slate-800/60",
      )}
      aria-busy="true"
      aria-label="Loading chart"
    />
  );
}
