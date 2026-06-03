"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Badge,
  getLaunchBadgeVariant,
  getLaunchStatusLabel,
} from "@/components/ui/Badge";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { AppIcon, MissionPatchPlaceholder } from "@/components/ui/AppIcon";
import { useCompareLaunches } from "@/hooks/useLaunchDetail";
import type { Launch } from "@/types/spacex";

function formatDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(dateUtc));
}

function formatWindow(window: number | null): string {
  if (window === null) {
    return "—";
  }
  if (window === 0) {
    return "Instantaneous";
  }
  return `${window}s`;
}

function countLandings(launch: Launch): string {
  const attempts = launch.cores.filter((core) => core.landing_attempt).length;
  const successes = launch.cores.filter((core) => core.landing_success).length;
  if (attempts === 0) {
    return "No landing attempt";
  }
  return `${successes}/${attempts} landed`;
}

interface CompareViewProps {
  ids: string[];
}

export function CompareView({ ids }: CompareViewProps) {
  const { launches, rockets, launchpads, isLoading, isError } =
    useCompareLaunches(ids);

  if (ids.length < 2) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700/60 bg-slate-900/20 px-6 py-10 text-center">
        <p className="text-sm text-slate-400">
          Select two missions in the bar above to see a full side-by-side comparison
          here.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (isError || launches.length < 2) {
    return (
      <ErrorState
        title="Comparison unavailable"
        message="One or more launches could not be loaded. Try picking different missions from the list."
      />
    );
  }

  const [left, right] = launches;

  const rows = [
    {
      label: "Date (UTC)",
      left: formatDate(left.date_utc),
      right: formatDate(right.date_utc),
    },
    {
      label: "Outcome",
      left: getLaunchStatusLabel(left.upcoming, left.success),
      right: getLaunchStatusLabel(right.upcoming, right.success),
    },
    {
      label: "Flight number",
      left: `#${left.flight_number}`,
      right: `#${right.flight_number}`,
    },
    {
      label: "Rocket",
      left: rockets.get(left.rocket)?.name ?? "—",
      right: rockets.get(right.rocket)?.name ?? "—",
    },
    {
      label: "Launchpad",
      left: launchpads.get(left.launchpad)?.full_name ?? "—",
      right: launchpads.get(right.launchpad)?.full_name ?? "—",
    },
    {
      label: "Launch window",
      left: formatWindow(left.window),
      right: formatWindow(right.window),
    },
    {
      label: "Booster recovery",
      left: countLandings(left),
      right: countLandings(right),
    },
    {
      label: "Payloads",
      left: String(left.payloads.length),
      right: String(right.payloads.length),
    },
    {
      label: "Details",
      left: left.details ?? "No details listed",
      right: right.details ?? "No details listed",
    },
  ];

  const diffCount = rows.filter((row) => row.left !== row.right).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Launch comparison"
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">
          <span className="font-medium text-sky-300">{diffCount}</span> of{" "}
          {rows.length} fields differ — highlighted below
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[left, right].map((launch, index) => {
          const patch = launch.links.patch.small;
          const accent =
            index === 0
              ? "border-sky-500/25 from-sky-500/5"
              : "border-violet-500/25 from-violet-500/5";

          return (
            <motion.header
              key={launch.id}
              initial={{ opacity: 0, x: index === 0 ? -12 : 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className={clsx(
                "overflow-hidden rounded-2xl border bg-gradient-to-br to-slate-950/80 p-5",
                accent,
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={clsx(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-1",
                    index === 0
                      ? "bg-sky-500/20 text-sky-300 ring-sky-500/40"
                      : "bg-violet-500/20 text-violet-300 ring-violet-500/40",
                  )}
                >
                  {index === 0 ? "A" : "B"}
                </span>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800 ring-1 ring-slate-700/50">
                  {patch ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={patch}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <MissionPatchPlaceholder size={24} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/launches/${launch.id}`}
                    className="text-lg font-semibold text-white transition-colors hover:text-sky-300"
                  >
                    {launch.name}
                  </Link>
                  <div className="mt-2">
                    <Badge
                      variant={getLaunchBadgeVariant(
                        launch.upcoming,
                        launch.success,
                      )}
                    >
                      {getLaunchStatusLabel(launch.upcoming, launch.success)}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.header>
          );
        })}
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const differs = row.left !== row.right;
          return (
            <div
              key={row.label}
              className={clsx(
                "rounded-xl border border-slate-800/80 bg-slate-900/40 p-4",
                differs && "border-sky-500/20 bg-sky-500/[0.03]",
              )}
            >
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                {row.label}
                {differs && (
                  <span className="rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] normal-case text-sky-300">
                    Different
                  </span>
                )}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-sky-400">
                    A
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{row.left}</p>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-semibold uppercase text-violet-400">
                    B
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">{row.right}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-800/80 md:block">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <caption className="sr-only">
            Side-by-side comparison of {left.name} and {right.name}
          </caption>
          <thead className="bg-slate-900/80">
            <tr>
              <th
                scope="col"
                className="w-[18%] px-4 py-3 text-left font-medium text-slate-400"
              >
                Field
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-medium text-sky-300/90"
              >
                A · {left.name}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left font-medium text-violet-300/90"
              >
                B · {right.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
            {rows.map((row, index) => {
              const differs = row.left !== row.right;
              return (
                <motion.tr
                  key={row.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.04 }}
                  className={clsx(differs && "bg-sky-500/[0.04]")}
                >
                  <th
                    scope="row"
                    className="px-4 py-3 align-top font-medium text-slate-400"
                  >
                    {row.label}
                    {differs && (
                      <span className="ml-2 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] font-normal text-sky-300">
                        ≠
                      </span>
                    )}
                  </th>
                  <td
                    className={clsx(
                      "px-4 py-3 align-top text-slate-100",
                      differs && "font-medium text-sky-100",
                    )}
                  >
                    {row.left}
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-3 align-top text-slate-100",
                      differs && "font-medium text-violet-100",
                    )}
                  >
                    {row.right}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
