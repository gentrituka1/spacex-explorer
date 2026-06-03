import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "success" | "failure" | "upcoming" | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  failure: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  upcoming: "bg-sky-500/15 text-sky-300 ring-sky-500/30",
  neutral: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function getLaunchBadgeVariant(
  upcoming: boolean,
  success: boolean | null,
): BadgeVariant {
  if (upcoming) {
    return "upcoming";
  }
  if (success === true) {
    return "success";
  }
  if (success === false) {
    return "failure";
  }
  return "neutral";
}

export function getLaunchStatusLabel(
  upcoming: boolean,
  success: boolean | null,
): string {
  if (upcoming) {
    return "Upcoming";
  }
  if (success === true) {
    return "Success";
  }
  if (success === false) {
    return "Failure";
  }
  return "Unknown";
}
