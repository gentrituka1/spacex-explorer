"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";

interface PageHeroProps {
  title: string;
  description: string;
  icon?: AppIconName;
  badge?: string;
}

export function PageHero({ title, description, icon, badge }: PageHeroProps) {
  const isStar = icon === "star";

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950/80 p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-start gap-4 sm:gap-5">
        {icon && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className={clsx(
              "hidden shrink-0 items-center justify-center rounded-xl ring-1 sm:flex sm:h-14 sm:w-14",
              isStar
                ? "bg-amber-500/10 ring-amber-500/25"
                : "bg-sky-500/10 ring-sky-500/25",
            )}
            aria-hidden="true"
          >
            <AppIcon
              name={icon}
              size={28}
              starFilled={isStar}
              className={isStar ? "text-amber-400" : "text-sky-400"}
            />
          </motion.div>
        )}
        <div className="min-w-0 flex-1">
          {badge && (
            <span className="mb-2 inline-block rounded-full bg-sky-500/15 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-sky-300 ring-1 ring-sky-500/20">
              {badge}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-400">
            {description}
          </p>
        </div>
      </div>
    </motion.header>
  );
}
