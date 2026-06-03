import type { ChartConfig, MetricKey } from "@/lib/stats-chart-config";
import type { ChartDataPoint, StatsLaunch, StatsLookups } from "@/types/spacex";

function emptyPoint(label: string): ChartDataPoint {
  return {
    label,
    total: 0,
    successful: 0,
    failed: 0,
    upcoming: 0,
    success_rate: 0,
  };
}

function finalizePoint(point: ChartDataPoint): ChartDataPoint {
  const completed = point.successful + point.failed;
  point.success_rate =
    completed === 0 ? 0 : Math.round((point.successful / completed) * 100);
  return point;
}

function addLaunchToPoint(point: ChartDataPoint, launch: StatsLaunch): void {
  point.total += 1;
  if (launch.upcoming) {
    point.upcoming += 1;
  } else if (launch.success === true) {
    point.successful += 1;
  } else if (launch.success === false) {
    point.failed += 1;
  }
}

function getGroupKey(
  launch: StatsLaunch,
  groupBy: ChartConfig["groupBy"],
  lookups: StatsLookups,
): string {
  const date = new Date(launch.date_utc);

  switch (groupBy) {
    case "year":
      return date.getUTCFullYear().toString();
    case "month": {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    }
    case "quarter": {
      const year = date.getUTCFullYear();
      const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
      return `${year} Q${quarter}`;
    }
    case "outcome":
      if (launch.upcoming) return "Upcoming";
      if (launch.success === true) return "Successful";
      if (launch.success === false) return "Failed";
      return "Unknown";
    case "rocket":
      return lookups.rockets.get(launch.rocket) ?? launch.rocket.slice(0, 8);
    case "launchpad":
      return lookups.launchpads.get(launch.launchpad) ?? launch.launchpad.slice(0, 8);
    default:
      return "Other";
  }
}

function sortDataPoints(
  points: ChartDataPoint[],
  groupBy: ChartConfig["groupBy"],
  sortOrder: ChartConfig["sortOrder"],
): ChartDataPoint[] {
  if (sortOrder === "none") {
    return points;
  }

  const direction = sortOrder === "asc" ? 1 : -1;

  if (groupBy === "outcome") {
    const order = ["Successful", "Failed", "Upcoming", "Unknown"];
    return [...points].sort(
      (a, b) => (order.indexOf(a.label) - order.indexOf(b.label)) * direction,
    );
  }

  return [...points].sort((a, b) => a.label.localeCompare(b.label) * direction);
}

export function buildChartData(
  config: ChartConfig,
  launches: StatsLaunch[],
  lookups: StatsLookups,
): ChartDataPoint[] {
  const buckets = new Map<string, ChartDataPoint>();

  for (const launch of launches) {
    const key = getGroupKey(launch, config.groupBy, lookups);
    const point = buckets.get(key) ?? emptyPoint(key);
    addLaunchToPoint(point, launch);
    buckets.set(key, point);
  }

  let points = [...buckets.values()].map(finalizePoint);
  points = sortDataPoints(points, config.groupBy, config.sortOrder);

  if (
    (config.groupBy === "rocket" || config.groupBy === "launchpad") &&
    config.limit > 0
  ) {
    points = [...points]
      .sort((a, b) => b.total - a.total)
      .slice(0, config.limit);
    if (config.sortOrder === "asc") {
      points.reverse();
    }
  }

  return points;
}

export function computeTotalsFromLaunches(launches: StatsLaunch[]) {
  return launches.reduce(
    (acc, launch) => {
      acc.total += 1;
      if (launch.upcoming) {
        acc.upcoming += 1;
      } else if (launch.success === true) {
        acc.successful += 1;
      } else if (launch.success === false) {
        acc.failed += 1;
      }
      return acc;
    },
    { total: 0, successful: 0, failed: 0, upcoming: 0 },
  );
}

export function computeSuccessRateFromLaunches(launches: StatsLaunch[]): number {
  const totals = computeTotalsFromLaunches(launches);
  const completed = totals.successful + totals.failed;
  if (completed === 0) return 0;
  return Math.round((totals.successful / completed) * 100);
}

export function getYearsActive(launches: StatsLaunch[]): number {
  const years = new Set(
    launches.map((launch) => new Date(launch.date_utc).getUTCFullYear()),
  );
  return years.size;
}

export function getBusiestYear(launches: StatsLaunch[]): { year: string; total: number } | null {
  const byYear = buildChartData(
    {
      id: "temp",
      title: "",
      chartType: "bar",
      groupBy: "year",
      metrics: ["total"],
      width: "half",
      showLegend: false,
      showGrid: false,
      sortOrder: "desc",
      limit: 0,
    },
    launches,
    { rockets: new Map(), launchpads: new Map() },
  );

  if (byYear.length === 0) return null;
  const peak = byYear.reduce((best, point) =>
    point.total > best.total ? point : best,
  );
  return { year: peak.label, total: peak.total };
}

export function metricValue(point: ChartDataPoint, metric: MetricKey): number {
  return point[metric];
}

export function toRechartsData(points: ChartDataPoint[]) {
  return points.map((point) => ({
    label: point.label,
    total: point.total,
    successful: point.successful,
    failed: point.failed,
    upcoming: point.upcoming,
    success_rate: point.success_rate,
  }));
}
