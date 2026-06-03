"use client";

import Link from "next/link";
import { memo } from "react";
import clsx from "clsx";
import {
  Badge,
  getLaunchBadgeVariant,
  getLaunchStatusLabel,
} from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { AppIcon, MissionPatchPlaceholder } from "@/components/ui/AppIcon";
import type { Launch } from "@/types/spacex";

function formatLaunchDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(dateUtc));
}

interface LaunchRowProps {
  launch: Launch;
  style?: React.CSSProperties;
  ariaAttributes?: {
    "aria-posinset": number;
    "aria-setsize": number;
    role: "listitem";
  };
  compareMode?: boolean;
  isSelected?: boolean;
  compareSlotIndex?: number;
  onToggleCompare?: (launch: Launch) => void;
}

export const LaunchRow = memo(function LaunchRow({
  launch,
  style,
  ariaAttributes,
  compareMode = false,
  isSelected = false,
  compareSlotIndex = -1,
  onToggleCompare,
}: LaunchRowProps) {
  const patch = launch.links.patch.small;

  const cardClasses = clsx(
    "group flex h-[88px] w-full items-center gap-4 rounded-xl border px-4 transition-colors duration-200",
    compareMode
      ? "cursor-pointer border-slate-800 bg-slate-900/70 hover:border-sky-500/40 hover:bg-slate-900/90"
      : "border-slate-800/80 bg-slate-900/50 hover:border-sky-500/50 hover:bg-slate-900/90",
    compareMode && isSelected && "border-sky-500/45 bg-sky-500/[0.07] ring-1 ring-sky-500/25",
  );

  const content = (
    <>
      {compareMode ? (
        <label
          className="flex shrink-0 items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleCompare?.(launch)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-950 text-sky-500 focus:ring-sky-500/40"
            aria-label={`Select ${launch.name} for comparison`}
          />
        </label>
      ) : null}

      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800/80 ring-1 ring-slate-700/50">
        {patch ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={patch}
            alt=""
            className="h-full w-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <MissionPatchPlaceholder size={22} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {compareMode && compareSlotIndex >= 0 && (
            <span
              className={clsx(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ring-1",
                compareSlotIndex === 0
                  ? "bg-sky-500/20 text-sky-300 ring-sky-500/40"
                  : "bg-violet-500/20 text-violet-300 ring-violet-500/40",
              )}
              aria-hidden="true"
            >
              {compareSlotIndex === 0 ? "A" : "B"}
            </span>
          )}
          <span className="truncate text-base font-semibold text-white transition-colors group-hover:text-sky-300">
            {launch.name}
          </span>
          <Badge variant={getLaunchBadgeVariant(launch.upcoming, launch.success)}>
            {getLaunchStatusLabel(launch.upcoming, launch.success)}
          </Badge>
        </div>
        <p className="mt-1 font-mono text-xs text-slate-500 sm:text-sm">
          Flight #{launch.flight_number} · {formatLaunchDate(launch.date_utc)} UTC
        </p>
      </div>

      {!compareMode && (
        <span
          className="hidden shrink-0 text-slate-600 transition-colors group-hover:text-sky-400 sm:inline-flex"
          aria-hidden="true"
        >
          <AppIcon name="chevron-right" size={18} />
        </span>
      )}
    </>
  );

  return (
    <article {...ariaAttributes} style={style} className="px-1 pb-3 pt-1">
      <div
        className={cardClasses}
        onClick={
          compareMode
            ? () => onToggleCompare?.(launch)
            : undefined
        }
        onKeyDown={
          compareMode
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggleCompare?.(launch);
                }
              }
            : undefined
        }
        role={compareMode ? "button" : undefined}
        tabIndex={compareMode ? 0 : undefined}
      >
        {compareMode ? (
          <div className="flex min-w-0 flex-1 items-center gap-4">{content}</div>
        ) : (
          <Link
            href={`/launches/${launch.id}`}
            className="flex min-w-0 flex-1 items-center gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 rounded-lg"
          >
            {content}
          </Link>
        )}

        {!compareMode && (
          <div className="shrink-0">
            <FavoriteButton launch={launch} size="sm" />
          </div>
        )}
      </div>
    </article>
  );
});
