"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { useFavorites } from "@/stores/favorites-store";

const navItems: {
  href: string;
  label: string;
  icon: AppIconName;
  exact?: boolean;
}[] = [
  { href: "/", label: "Home", icon: "home", exact: true },
  { href: "/launches", label: "Launches", icon: "rocket" },
  { href: "/favorites", label: "Favorites", icon: "star" },
  { href: "/stats", label: "Stats", icon: "chart" },
  { href: "/compare", label: "Compare", icon: "compare" },
];

function isNavActive(pathname: string, href: string, exact?: boolean): boolean {
  if (exact) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({
  icon,
  isActive,
}: {
  icon: AppIconName;
  isActive: boolean;
}) {
  const isStar = icon === "star";

  return (
    <AppIcon
      name={icon}
      size={18}
      starFilled={isStar && isActive}
      className={clsx(
        isStar && isActive && "text-amber-400",
        isStar && !isActive && "text-current",
      )}
    />
  );
}

export function Header() {
  const pathname = usePathname();
  const { favorites } = useFavorites();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/25 transition-all group-hover:bg-sky-500/15 group-hover:ring-sky-400/40"
            aria-hidden="true"
          >
            <AppIcon name="rocket" size={22} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight text-white transition-colors group-hover:text-sky-300">
              SpaceX Explorer
            </p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Mission data · Live from API
            </p>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden md:block">
          <ul className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive = isNavActive(pathname, item.href, item.exact);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={clsx(
                      "relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 lg:px-3.5",
                      isActive
                        ? "bg-sky-500/15 text-sky-300"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white",
                    )}
                  >
                    <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                      <NavIcon icon={item.icon} isActive={isActive} />
                    </span>
                    <span>{item.label}</span>
                    {item.href === "/favorites" && favorites.length > 0 && (
                      <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">
                        {favorites.length}
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-sky-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((open) => !open)}
        >
          <AppIcon name={mobileOpen ? "close" : "menu"} size={22} />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-800/60 md:hidden"
            aria-label="Mobile navigation"
          >
            <ul className="space-y-1 px-4 py-3">
              {navItems.map((item) => {
                const isActive = isNavActive(pathname, item.href, item.exact);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sky-500/15 text-sky-300"
                          : "text-slate-300 hover:bg-slate-800",
                      )}
                    >
                      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                        <NavIcon icon={item.icon} isActive={isActive} />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/favorites" && favorites.length > 0 && (
                        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold leading-none text-slate-950">
                          {favorites.length}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
