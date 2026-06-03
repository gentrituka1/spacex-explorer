export type ChartType =
  | "bar"
  | "line"
  | "area"
  | "pie"
  | "stacked-bar"
  | "horizontal-bar"
  | "radar";

export type GroupBy =
  | "year"
  | "month"
  | "quarter"
  | "outcome"
  | "rocket"
  | "launchpad";

export type MetricKey =
  | "total"
  | "successful"
  | "failed"
  | "upcoming"
  | "success_rate";

export type ChartWidth = "half" | "full";
export type SortOrder = "asc" | "desc" | "none";

export interface ChartConfig {
  id: string;
  title: string;
  chartType: ChartType;
  groupBy: GroupBy;
  metrics: MetricKey[];
  width: ChartWidth;
  showLegend: boolean;
  showGrid: boolean;
  sortOrder: SortOrder;
  limit: number;
}

export const CHART_TYPE_OPTIONS: Array<{ value: ChartType; label: string }> = [
  { value: "bar", label: "Bar" },
  { value: "stacked-bar", label: "Stacked bar" },
  { value: "horizontal-bar", label: "Horizontal bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
  { value: "radar", label: "Radar" },
];

export const GROUP_BY_OPTIONS: Array<{ value: GroupBy; label: string }> = [
  { value: "year", label: "Year" },
  { value: "month", label: "Month" },
  { value: "quarter", label: "Quarter" },
  { value: "outcome", label: "Outcome" },
  { value: "rocket", label: "Rocket" },
  { value: "launchpad", label: "Launchpad" },
];

export const METRIC_OPTIONS: Array<{ value: MetricKey; label: string }> = [
  { value: "total", label: "Total launches" },
  { value: "successful", label: "Successful" },
  { value: "failed", label: "Failed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "success_rate", label: "Success rate (%)" },
];

export const METRIC_COLORS: Record<MetricKey, string> = {
  total: "#38bdf8",
  successful: "#34d399",
  failed: "#fb7185",
  upcoming: "#a78bfa",
  success_rate: "#fbbf24",
};

export const DEFAULT_CHARTS: ChartConfig[] = [
  {
    id: "default-launches-per-year",
    title: "Launches per year",
    chartType: "stacked-bar",
    groupBy: "year",
    metrics: ["successful", "failed"],
    width: "half",
    showLegend: true,
    showGrid: true,
    sortOrder: "asc",
    limit: 20,
  },
  {
    id: "default-success-rate",
    title: "Success rate by year",
    chartType: "line",
    groupBy: "year",
    metrics: ["success_rate"],
    width: "half",
    showLegend: false,
    showGrid: true,
    sortOrder: "asc",
    limit: 20,
  },
];

export function generateChartId(): string {
  return `chart-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createChartConfig(partial?: Partial<ChartConfig>): ChartConfig {
  const { id: _ignoredId, ...rest } = partial ?? {};

  return {
    title: "Custom chart",
    chartType: "bar",
    groupBy: "year",
    metrics: ["total"],
    width: "half",
    showLegend: true,
    showGrid: true,
    sortOrder: "asc",
    limit: 12,
    ...rest,
    id: generateChartId(),
  };
}

export function getMetricLabel(metric: MetricKey): string {
  return METRIC_OPTIONS.find((option) => option.value === metric)?.label ?? metric;
}
