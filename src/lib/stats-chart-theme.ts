export const PIE_COLORS = [
  "#38bdf8",
  "#34d399",
  "#fb7185",
  "#a78bfa",
  "#fbbf24",
  "#f472b6",
  "#2dd4bf",
  "#818cf8",
  "#60a5fa",
  "#4ade80",
];

export const LABEL_FILL = "#94a3b8";
export const AXIS_STROKE = "#64748b";

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "0.75rem",
  color: "#f1f5f9",
};

export const CHART_TOOLTIP_LABEL_STYLE = {
  color: "#e2e8f0",
  fontWeight: 600,
};

export const CHART_LEGEND_PROPS = {
  wrapperStyle: { color: "#cbd5e1", fontSize: 12, paddingTop: 8 },
};

export function truncateLabel(label: string, max = 24): string {
  if (label.length <= max) return label;
  return `${label.slice(0, max - 1)}…`;
}

export function getHorizontalBarYAxisWidth(labels: string[]): number {
  const longest = labels.reduce((max, label) => Math.max(max, label.length), 0);
  return Math.min(Math.max(longest * 6.5, 88), 168);
}

export function getCategoryXAxisProps(dataLength: number) {
  const crowded = dataLength > 6;

  return {
    stroke: LABEL_FILL,
    fontSize: 11,
    tickLine: false,
    axisLine: { stroke: AXIS_STROKE },
    interval: dataLength > 14 ? Math.ceil(dataLength / 10) : 0,
    angle: crowded ? -32 : 0,
    textAnchor: crowded ? ("end" as const) : ("middle" as const),
    height: crowded ? 64 : 32,
    tickFormatter: (value: string) => truncateLabel(String(value), crowded ? 16 : 20),
  };
}

export function getNumericYAxisProps(options?: { percent?: boolean }) {
  return {
    stroke: LABEL_FILL,
    fontSize: 11,
    tickLine: false,
    axisLine: { stroke: AXIS_STROKE },
    width: 44,
    allowDecimals: false,
    domain: options?.percent ? ([0, 100] as [number, number]) : undefined,
    tickFormatter: options?.percent
      ? (value: number) => `${value}%`
      : (value: number) => value.toLocaleString(),
  };
}

export function getChartMargins(options: {
  dataLength: number;
  horizontal?: boolean;
  yAxisWidth?: number;
}) {
  if (options.horizontal) {
    return {
      top: 8,
      right: 16,
      left: 8,
      bottom: 8,
    };
  }

  const crowded = options.dataLength > 6;

  return {
    top: 12,
    right: 16,
    left: 4,
    bottom: crowded ? 8 : 0,
  };
}
