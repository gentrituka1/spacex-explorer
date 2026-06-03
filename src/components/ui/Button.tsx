import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-sky-500 hover:shadow-sky-500/30 focus-visible:ring-sky-400/50 active:scale-[0.98]",
  secondary:
    "bg-slate-800/80 text-slate-100 border border-slate-600/80 hover:border-slate-500 hover:bg-slate-700/80 focus-visible:ring-slate-400/50 active:scale-[0.98]",
  ghost:
    "bg-transparent text-slate-200 hover:bg-slate-800/60 focus-visible:ring-slate-400/50 active:scale-[0.98]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-400/50 active:scale-[0.98]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
