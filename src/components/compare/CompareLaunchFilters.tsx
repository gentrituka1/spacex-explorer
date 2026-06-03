"use client";

import { memo, useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { AppIcon } from "@/components/ui/AppIcon";
import { DEFAULT_LAUNCH_FILTERS } from "@/lib/launch-query";
import { useToast } from "@/stores/toast-store";
import type { LaunchFilters } from "@/types/spacex";

interface CompareLaunchFiltersProps {
  filters: LaunchFilters;
  onChange: (filters: LaunchFilters) => void;
  totalDocs?: number;
  isUpdating?: boolean;
}

type TimelineValue = LaunchFilters["upcoming"];
type OutcomeValue = LaunchFilters["success"];

const TIMELINE_OPTIONS: { value: TimelineValue; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const OUTCOME_OPTIONS: { value: OutcomeValue; label: string; tone?: "success" | "failure" }[] = [
  { value: "all", label: "Any" },
  { value: "success", label: "Success", tone: "success" },
  { value: "failure", label: "Failed", tone: "failure" },
];

function SegmentToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; tone?: "success" | "failure" }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="min-w-0 flex-1">
      <legend className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </legend>
      <div
        className="flex rounded-xl bg-slate-950/70 p-1 ring-1 ring-slate-800/80"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={clsx(
                "flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm",
                active && !option.tone && "bg-sky-500/20 text-sky-200 shadow-sm ring-1 ring-sky-500/35",
                active && option.tone === "success" &&
                  "bg-emerald-500/20 text-emerald-200 shadow-sm ring-1 ring-emerald-500/35",
                active && option.tone === "failure" &&
                  "bg-rose-500/20 text-rose-200 shadow-sm ring-1 ring-rose-500/35",
                !active && "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export const CompareLaunchFilters = memo(function CompareLaunchFilters({
  filters,
  onChange,
  totalDocs,
  isUpdating = false,
}: CompareLaunchFiltersProps) {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onChange]);

  const resetFilters = useCallback(() => {
    setSearchInput("");
    setDebouncedSearch("");
    onChange(DEFAULT_LAUNCH_FILTERS);
    showToast("Filters cleared", "info");
  }, [onChange, showToast]);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.upcoming !== "all" ||
    filters.success !== "all";

  return (
    <section
      aria-label="Find missions to compare"
      className="relative shrink-0 overflow-hidden border-b border-slate-800/60"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.08),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.06),transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-white">Find missions</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Search by name or flight #, then tap a row below
            </p>
          </div>
          <div className="flex items-center gap-2">
            {typeof totalDocs === "number" && (
              <span className="rounded-full bg-slate-900/90 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-slate-700/80">
                {totalDocs.toLocaleString()} matches
              </span>
            )}
            {isUpdating && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-xs text-sky-300 ring-1 ring-sky-500/20">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                Updating
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          >
            <AppIcon name="search" size={18} />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Try Starlink, Falcon Heavy, or #200…"
            className="h-12 w-full rounded-2xl border border-slate-700/80 bg-slate-950/80 pl-11 pr-11 text-sm text-slate-100 shadow-inner shadow-slate-950/50 placeholder:text-slate-600 transition-all focus:border-violet-500/50 focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-violet-500/25"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
                onChange({ ...filters, search: "" });
              }}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
              aria-label="Clear search"
            >
              <AppIcon name="close" size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <SegmentToggle
            label="Timeline"
            options={TIMELINE_OPTIONS}
            value={filters.upcoming}
            onChange={(value) => onChange({ ...filters, upcoming: value })}
          />
          <SegmentToggle
            label="Outcome"
            options={OUTCOME_OPTIONS}
            value={filters.success}
            onChange={(value) => onChange({ ...filters, success: value })}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-medium text-slate-400 transition-colors hover:text-sky-300"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
});
