"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  Badge,
  getLaunchBadgeVariant,
  getLaunchStatusLabel,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AppIcon, MissionPatchPlaceholder } from "@/components/ui/AppIcon";
import type { Launch } from "@/types/spacex";

interface CompareSelectionBarProps {
  selectedIds: string[];
  launches: Launch[];
  isLoading: boolean;
  shareUrl: string;
  pickerExpanded: boolean;
  onRemove: (id: string) => void;
  onSwap: () => void;
  onClear: () => void;
  onCopyLink: () => void;
  onTogglePicker: () => void;
}

function formatShortDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(dateUtc));
}

function SelectionSlot({
  slot,
  label,
  launch,
  isLoading,
  onRemove,
}: {
  slot: "A" | "B";
  label: string;
  launch?: Launch;
  isLoading: boolean;
  onRemove: (id: string) => void;
}) {
  const accent =
    slot === "A"
      ? "border-sky-500/30 bg-sky-500/5 ring-sky-500/20"
      : "border-violet-500/30 bg-violet-500/5 ring-violet-500/20";

  if (isLoading && launch === undefined) {
    return (
      <div
        className={clsx(
          "flex min-h-[88px] flex-1 items-center gap-3 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/40 p-3",
          accent,
        )}
      >
        <div className="h-12 w-12 animate-shimmer rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-shimmer rounded" />
          <div className="h-4 w-32 animate-shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div
        className={clsx(
          "flex min-h-[88px] flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-700/80 bg-slate-950/30 p-4 text-center",
        )}
      >
        <span
          className={clsx(
            "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1",
            slot === "A"
              ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
              : "bg-violet-500/15 text-violet-300 ring-violet-500/30",
          )}
        >
          {slot}
        </span>
        <p className="text-sm font-medium text-slate-300">{label}</p>
        <p className="text-xs text-slate-500">Tap a mission below</p>
      </div>
    );
  }

  const patch = launch.links.patch.small;

  return (
    <div
      className={clsx(
        "relative flex min-h-[88px] flex-1 items-start gap-3 rounded-xl border p-3 ring-1",
        accent,
      )}
    >
      <span
        className={clsx(
          "absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-1",
          slot === "A"
            ? "bg-sky-500/20 text-sky-300 ring-sky-500/40"
            : "bg-violet-500/20 text-violet-300 ring-violet-500/40",
        )}
      >
        {slot}
      </span>
      <div className="ml-8 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800/80 ring-1 ring-slate-700/50">
        {patch ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={patch} alt="" className="h-full w-full object-contain p-0.5" />
        ) : (
          <MissionPatchPlaceholder size={20} />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <Link
          href={`/launches/${launch.id}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-white hover:text-sky-300"
        >
          {launch.name}
        </Link>
        <p className="mt-1 font-mono text-[11px] text-slate-500">
          #{launch.flight_number} · {formatShortDate(launch.date_utc)}
        </p>
        <Badge
          variant={getLaunchBadgeVariant(launch.upcoming, launch.success)}
          className="mt-1.5"
        >
          {getLaunchStatusLabel(launch.upcoming, launch.success)}
        </Badge>
      </div>
      <button
        type="button"
        onClick={() => onRemove(launch.id)}
        className="shrink-0 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        aria-label={`Remove ${launch.name} from comparison`}
      >
        <AppIcon name="close" size={16} />
      </button>
    </div>
  );
}

export function CompareSelectionBar({
  selectedIds,
  launches,
  isLoading,
  shareUrl,
  pickerExpanded,
  onRemove,
  onSwap,
  onClear,
  onCopyLink,
  onTogglePicker,
}: CompareSelectionBarProps) {
  const ready = selectedIds.length === 2;
  const launchA = launches.find((launch) => launch.id === selectedIds[0]);
  const launchB = launches.find((launch) => launch.id === selectedIds[1]);

  return (
    <section
      aria-label="Comparison selection"
      className="compare-selection-bar sticky top-16 z-40 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/95 p-4 shadow-lg shadow-slate-950/60 backdrop-blur-xl sm:p-5"
    >
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Your comparison</h2>
            <p className="text-xs text-slate-500">
              {ready
                ? "Side-by-side results appear below"
                : selectedIds.length === 1
                  ? "Pick one more mission"
                  : "Choose any two launches"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                ready
                  ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                  : "bg-slate-800 text-slate-400 ring-slate-700",
              )}
            >
              {selectedIds.length}/2
            </span>
            {selectedIds.length > 0 && (
              <Button variant="ghost" className="px-2.5 py-1.5 text-xs" onClick={onClear}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <SelectionSlot
            slot="A"
            label="First mission"
            launch={launchA}
            isLoading={isLoading && selectedIds.length >= 1 && !launchA}
            onRemove={onRemove}
          />

          <button
            type="button"
            onClick={onSwap}
            disabled={!ready}
            className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700/80 bg-slate-900 text-slate-400 transition-colors hover:border-sky-500/40 hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-40 sm:mx-0"
            aria-label="Swap mission order"
            title="Swap order"
          >
            <AppIcon name="swap" size={16} />
          </button>

          <SelectionSlot
            slot="B"
            label="Second mission"
            launch={launchB}
            isLoading={isLoading && selectedIds.length >= 2 && !launchB}
            onRemove={onRemove}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={pickerExpanded ? "secondary" : "primary"}
            className="text-xs sm:text-sm"
            onClick={onTogglePicker}
          >
            {pickerExpanded ? "Hide launch list" : "Change launches"}
          </Button>
          {ready && shareUrl && (
            <Button
              variant="secondary"
              className="text-xs sm:text-sm"
              onClick={() => void onCopyLink()}
            >
              Copy share link
            </Button>
          )}
          {!pickerExpanded && (
            <a
              href="#comparison-results"
              className="text-xs text-sky-400 hover:text-sky-300 sm:text-sm"
            >
              Jump to results ↓
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
