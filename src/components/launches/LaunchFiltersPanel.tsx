"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import type { LaunchFilters } from "@/types/spacex";
import { DEFAULT_LAUNCH_FILTERS, parseFlightNumberSearch } from "@/lib/launch-query";
import { useToast } from "@/stores/toast-store";

interface LaunchFiltersPanelProps {
  filters: LaunchFilters;
  onChange: (filters: LaunchFilters) => void;
  totalDocs?: number;
  isUpdating?: boolean;
}

const upcomingLabels: Record<LaunchFilters["upcoming"], string> = {
  all: "All launches",
  upcoming: "Upcoming",
  past: "Past",
};

const successLabels: Record<LaunchFilters["success"], string> = {
  all: "All outcomes",
  success: "Successful",
  failure: "Failed",
};

export const LaunchFiltersPanel = memo(function LaunchFiltersPanel({
  filters,
  onChange,
  totalDocs,
  isUpdating = false,
}: LaunchFiltersPanelProps) {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const [collapsed, setCollapsed] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onChange]);

  const updateFilter = useCallback(
    <K extends keyof LaunchFilters>(key: K, value: LaunchFilters[K]) => {
      onChange({ ...filters, [key]: value });
    },
    [filters, onChange],
  );

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    onChange(DEFAULT_LAUNCH_FILTERS);
    showToast("Filters cleared", "info");
  }, [onChange, showToast]);

  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onRemove: () => void }> = [];

    if (filters.search) {
      const flightNumber = parseFlightNumberSearch(filters.search);
      chips.push({
        key: "search",
        label: flightNumber !== null ? `Flight #${flightNumber}` : `"${filters.search}"`,
        onRemove: () => {
          setSearchInput("");
          setDebouncedSearch("");
          onChange({ ...filters, search: "" });
        },
      });
    }
    if (filters.upcoming !== "all") {
      chips.push({
        key: "upcoming",
        label: upcomingLabels[filters.upcoming],
        onRemove: () => updateFilter("upcoming", "all"),
      });
    }
    if (filters.success !== "all") {
      chips.push({
        key: "success",
        label: successLabels[filters.success],
        onRemove: () => updateFilter("success", "all"),
      });
    }
    if (filters.dateFrom) {
      chips.push({
        key: "dateFrom",
        label: `From ${filters.dateFrom}`,
        onRemove: () => updateFilter("dateFrom", ""),
      });
    }
    if (filters.dateTo) {
      chips.push({
        key: "dateTo",
        label: `To ${filters.dateTo}`,
        onRemove: () => updateFilter("dateTo", ""),
      });
    }
    if (filters.sortBy !== DEFAULT_LAUNCH_FILTERS.sortBy) {
      chips.push({
        key: "sortBy",
        label: `Sort: ${filters.sortBy}`,
        onRemove: () => updateFilter("sortBy", DEFAULT_LAUNCH_FILTERS.sortBy),
      });
    }
    if (filters.sortOrder !== DEFAULT_LAUNCH_FILTERS.sortOrder) {
      chips.push({
        key: "sortOrder",
        label: filters.sortOrder === "asc" ? "Oldest first" : "Newest first",
        onRemove: () =>
          updateFilter("sortOrder", DEFAULT_LAUNCH_FILTERS.sortOrder),
      });
    }

    return chips;
  }, [filters, onChange, updateFilter]);

  const hasActiveFilters = activeChips.length > 0;

  return (
    <section
      aria-label="Launch filters"
      className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Filters &amp; sort
          </h2>
          {isUpdating && (
            <span className="inline-flex items-center gap-1.5 text-xs text-sky-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
              Updating
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {typeof totalDocs === "number" && (
            <p className="hidden text-sm text-slate-500 sm:block">
              {totalDocs.toLocaleString()} found
            </p>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white sm:hidden"
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">Search mission or flight #</span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="e.g. Starlink, #142, flight 200"
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">Timeline</span>
                <select
                  value={filters.upcoming}
                  onChange={(event) =>
                    updateFilter(
                      "upcoming",
                      event.target.value as LaunchFilters["upcoming"],
                    )
                  }
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="all">All launches</option>
                  <option value="upcoming">Upcoming only</option>
                  <option value="past">Past only</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">Outcome</span>
                <select
                  value={filters.success}
                  onChange={(event) =>
                    updateFilter(
                      "success",
                      event.target.value as LaunchFilters["success"],
                    )
                  }
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                >
                  <option value="all">All outcomes</option>
                  <option value="success">Successful</option>
                  <option value="failure">Failed</option>
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">Sort by</span>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(event) =>
                      updateFilter(
                        "sortBy",
                        event.target.value as LaunchFilters["sortBy"],
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(event) =>
                      updateFilter(
                        "sortOrder",
                        event.target.value as LaunchFilters["sortOrder"],
                      )
                    }
                    aria-label="Sort order"
                    className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </select>
                </div>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">From date</span>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(event) => updateFilter("dateFrom", event.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-slate-300">To date</span>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(event) => updateFilter("dateTo", event.target.value)}
                  className="rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                />
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-800/60 px-4 py-3 sm:px-5">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active
          </span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-500/25 transition-colors hover:bg-sky-500/25"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={resetFilters}
            className={clsx(
              "ml-auto text-xs font-medium text-slate-400 transition-colors hover:text-sky-300",
            )}
          >
            Clear all
          </button>
        </div>
      )}
    </section>
  );
});
