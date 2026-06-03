"use client";

import { useQuery } from "@tanstack/react-query";
import { queryLaunchStats } from "@/lib/api/launches";
import { queryAllLaunchpads } from "@/lib/api/launchpads";
import { queryAllRockets } from "@/lib/api/rockets";
import type { LaunchStatsPoint, StatsLaunch, StatsLookups } from "@/types/spacex";

function aggregateLaunchStats(launches: StatsLaunch[]): LaunchStatsPoint[] {
  const byYear = new Map<string, LaunchStatsPoint>();

  for (const launch of launches) {
    const year = new Date(launch.date_utc).getUTCFullYear().toString();
    const current = byYear.get(year) ?? {
      year,
      total: 0,
      successful: 0,
      failed: 0,
    };

    current.total += 1;
    if (launch.success === true) {
      current.successful += 1;
    } else if (launch.success === false) {
      current.failed += 1;
    }

    byYear.set(year, current);
  }

  return [...byYear.values()].sort((a, b) => a.year.localeCompare(b.year));
}

function buildLookups(
  rockets: Array<{ id: string; name: string }>,
  launchpads: Array<{ id: string; full_name: string; name: string }>,
): StatsLookups {
  return {
    rockets: new Map(rockets.map((rocket) => [rocket.id, rocket.name])),
    launchpads: new Map(
      launchpads.map((pad) => [pad.id, pad.full_name || pad.name]),
    ),
  };
}

export function useLaunchStats() {
  return useQuery({
    queryKey: ["launch-stats"],
    queryFn: async () => {
      const [launches, rockets, launchpads] = await Promise.all([
        queryLaunchStats(),
        queryAllRockets(),
        queryAllLaunchpads(),
      ]);

      return {
        launches,
        lookups: buildLookups(rockets, launchpads),
        yearly: aggregateLaunchStats(launches),
      };
    },
    staleTime: 10 * 60_000,
  });
}

export function computeSuccessRate(stats: LaunchStatsPoint[]): number {
  const totals = stats.reduce(
    (acc, point) => ({
      successful: acc.successful + point.successful,
      completed: acc.completed + point.successful + point.failed,
    }),
    { successful: 0, completed: 0 },
  );

  if (totals.completed === 0) {
    return 0;
  }

  return Math.round((totals.successful / totals.completed) * 100);
}
