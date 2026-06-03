"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getMetricLabel,
  METRIC_COLORS,
  type ChartConfig,
  type MetricKey,
} from "@/lib/stats-chart-config";
import {
  CHART_LEGEND_PROPS,
  CHART_TOOLTIP_LABEL_STYLE,
  CHART_TOOLTIP_STYLE,
  getCategoryXAxisProps,
  getChartMargins,
  getHorizontalBarYAxisWidth,
  getNumericYAxisProps,
  PIE_COLORS,
  truncateLabel,
  LABEL_FILL,
  AXIS_STROKE,
} from "@/lib/stats-chart-theme";
import { buildChartData, toRechartsData } from "@/lib/stats-data";
import type { StatsLaunch, StatsLookups } from "@/types/spacex";

interface StatsChartRendererProps {
  config: ChartConfig;
  launches: StatsLaunch[];
  lookups: StatsLookups;
}

function formatTooltipValue(value: unknown, metric: MetricKey): [string, string] {
  const numeric = typeof value === "number" ? value : Number(value);
  if (metric === "success_rate") {
    return [`${numeric}%`, getMetricLabel(metric)];
  }
  return [numeric.toLocaleString(), getMetricLabel(metric)];
}

export function StatsChartRenderer({
  config,
  launches,
  lookups,
}: StatsChartRendererProps) {
  const data = toRechartsData(buildChartData(config, launches, lookups));
  const metrics =
    config.chartType === "pie" ? [config.metrics[0] ?? "total"] : config.metrics;
  const labels = data.map((point) => point.label);
  const xAxisProps = getCategoryXAxisProps(data.length);
  const yAxisProps = getNumericYAxisProps({
    percent: metrics.length === 1 && metrics[0] === "success_rate",
  });
  const margins = getChartMargins({ dataLength: data.length });
  const grid = config.showGrid ? (
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
  ) : null;
  const legend = config.showLegend ? <Legend {...CHART_LEGEND_PROPS} /> : null;

  if (data.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-slate-800/80 bg-slate-950/20 text-sm text-slate-500">
        No data for this chart configuration
      </div>
    );
  }

  if (config.chartType === "pie") {
    const metric = metrics[0];
    const showSliceLabels = data.length <= 6;

    return (
      <div className="h-80 min-h-[20rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value) => formatTooltipValue(value, metric)}
            />
            {legend}
            <Pie
              data={data}
              dataKey={metric}
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={showSliceLabels ? 92 : 104}
              label={
                showSliceLabels
                  ? ({ name, percent }) =>
                      `${truncateLabel(String(name ?? ""), 14)} (${Math.round((percent ?? 0) * 100)}%)`
                  : false
              }
              labelLine={showSliceLabels}
            >
              {data.map((_, index) => (
                <Cell key={`${data[index].label}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.chartType === "radar") {
    const radarData = data.slice(0, 10).map((point) => ({
      ...point,
      label: truncateLabel(point.label, 14),
    }));

    return (
      <div className="h-80 min-h-[20rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis
              dataKey="label"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
            />
            <PolarRadiusAxis
              stroke="#64748b"
              tick={{ fill: "#64748b", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            />
            {legend}
            {metrics.map((metric) => (
              <Radar
                key={metric}
                name={getMetricLabel(metric)}
                dataKey={metric}
                stroke={METRIC_COLORS[metric]}
                fill={METRIC_COLORS[metric]}
                fillOpacity={0.2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.chartType === "horizontal-bar") {
    const yAxisWidth = getHorizontalBarYAxisWidth(labels);
    const isPercent = metrics.length === 1 && metrics[0] === "success_rate";

    return (
      <div className="h-80 min-h-[20rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={getChartMargins({ dataLength: data.length, horizontal: true, yAxisWidth })}
          >
            {grid}
            <XAxis
              type="number"
              stroke={LABEL_FILL}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: AXIS_STROKE }}
              allowDecimals={false}
              domain={isPercent ? [0, 100] : undefined}
              tickFormatter={isPercent ? (value) => `${value}%` : (value) => value.toLocaleString()}
            />
            <YAxis
              type="category"
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              width={yAxisWidth}
              tickLine={false}
              axisLine={{ stroke: "#64748b" }}
              tickFormatter={(value) => truncateLabel(String(value), 22)}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value, _name, item) =>
                formatTooltipValue(value, item.dataKey as MetricKey)
              }
            />
            {legend}
            {metrics.map((metric) => (
              <Bar
                key={metric}
                dataKey={metric}
                name={getMetricLabel(metric)}
                fill={METRIC_COLORS[metric]}
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.chartType === "line") {
    return (
      <div className="h-80 min-h-[20rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={margins}>
            {grid}
            <XAxis dataKey="label" {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value, _name, item) =>
                formatTooltipValue(value, item.dataKey as MetricKey)
              }
            />
            {legend}
            {metrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                name={getMetricLabel(metric)}
                stroke={METRIC_COLORS[metric]}
                strokeWidth={2.5}
                dot={{ fill: METRIC_COLORS[metric], strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.chartType === "area") {
    return (
      <div className="h-80 min-h-[20rem] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={margins}>
            {grid}
            <XAxis dataKey="label" {...xAxisProps} />
            <YAxis {...yAxisProps} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              labelStyle={CHART_TOOLTIP_LABEL_STYLE}
              formatter={(value, _name, item) =>
                formatTooltipValue(value, item.dataKey as MetricKey)
              }
            />
            {legend}
            {metrics.map((metric) => (
              <Area
                key={metric}
                type="monotone"
                dataKey={metric}
                name={getMetricLabel(metric)}
                stroke={METRIC_COLORS[metric]}
                fill={METRIC_COLORS[metric]}
                fillOpacity={0.18}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const isStacked = config.chartType === "stacked-bar";

  return (
    <div className="h-80 min-h-[20rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={margins}>
          {grid}
          <XAxis dataKey="label" {...xAxisProps} />
          <YAxis {...yAxisProps} />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            labelStyle={CHART_TOOLTIP_LABEL_STYLE}
            formatter={(value, _name, item) =>
              formatTooltipValue(value, item.dataKey as MetricKey)
            }
          />
          {legend}
          {metrics.map((metric, index) => (
            <Bar
              key={metric}
              dataKey={metric}
              name={getMetricLabel(metric)}
              fill={METRIC_COLORS[metric]}
              stackId={isStacked ? "stack" : undefined}
              maxBarSize={isStacked ? undefined : 40}
              radius={
                isStacked && index === metrics.length - 1
                  ? [4, 4, 0, 0]
                  : [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
