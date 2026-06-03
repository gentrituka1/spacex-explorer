"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  CHART_TYPE_OPTIONS,
  GROUP_BY_OPTIONS,
  METRIC_OPTIONS,
  getMetricLabel,
  type ChartConfig,
  type MetricKey,
} from "@/lib/stats-chart-config";
import { StatsChartRenderer } from "@/components/stats/StatsChartRenderer";
import type { StatsLaunch, StatsLookups } from "@/types/spacex";

interface StatsChartPanelProps {
  config: ChartConfig;
  launches: StatsLaunch[];
  lookups: StatsLookups;
  index: number;
  onUpdate: (config: ChartConfig) => void;
  onRemove: (id: string) => void;
  onDuplicate: (config: ChartConfig) => void;
}

const selectClassName =
  "min-w-0 rounded-lg border border-slate-700/80 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30";

export function StatsChartPanel({
  config,
  launches,
  lookups,
  index,
  onUpdate,
  onRemove,
  onDuplicate,
}: StatsChartPanelProps) {
  const chartTypeLabel =
    CHART_TYPE_OPTIONS.find((option) => option.value === config.chartType)?.label ??
    config.chartType;
  const groupLabel =
    GROUP_BY_OPTIONS.find((option) => option.value === config.groupBy)?.label ??
    config.groupBy;

  const toggleMetric = (metric: MetricKey) => {
    const exists = config.metrics.includes(metric);
    const metrics = exists
      ? config.metrics.filter((item) => item !== metric)
      : [...config.metrics, metric];
    onUpdate({
      ...config,
      metrics: metrics.length > 0 ? metrics : [metric],
    });
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={clsx(
        "overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm",
        config.width === "full" ? "lg:col-span-2" : "",
      )}
      aria-label={config.title}
    >
      <div className="border-b border-slate-800/60 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={config.title}
              onChange={(event) => onUpdate({ ...config, title: event.target.value })}
              className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-slate-500"
              aria-label="Chart title"
            />
            <p className="mt-1 break-words text-xs leading-relaxed text-slate-500">
              {chartTypeLabel} · {groupLabel} ·{" "}
              {config.metrics.map(getMetricLabel).join(", ")}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              variant="ghost"
              className="px-2.5 py-1.5 text-xs"
              onClick={() => onDuplicate(config)}
            >
              Duplicate
            </Button>
            <Button
              variant="ghost"
              className="px-2.5 py-1.5 text-xs text-rose-300 hover:text-rose-200"
              onClick={() => onRemove(config.id)}
            >
              Remove
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1 text-xs text-slate-400">
            Chart type
            <select
              value={config.chartType}
              onChange={(event) =>
                onUpdate({
                  ...config,
                  chartType: event.target.value as ChartConfig["chartType"],
                })
              }
              className={selectClassName}
            >
              {CHART_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs text-slate-400">
            Group by
            <select
              value={config.groupBy}
              onChange={(event) =>
                onUpdate({
                  ...config,
                  groupBy: event.target.value as ChartConfig["groupBy"],
                })
              }
              className={selectClassName}
            >
              {GROUP_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs text-slate-400">
            Width
            <select
              value={config.width}
              onChange={(event) =>
                onUpdate({
                  ...config,
                  width: event.target.value as ChartConfig["width"],
                })
              }
              className={selectClassName}
            >
              <option value="half">Half width</option>
              <option value="full">Full width</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {METRIC_OPTIONS.map((option) => {
            const active = config.metrics.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleMetric(option.value)}
                className={clsx(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 transition-colors",
                  active
                    ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
                    : "bg-slate-800/40 text-slate-500 ring-slate-700/80 hover:text-slate-300",
                )}
                aria-pressed={active}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-2 pb-4 pt-2 sm:px-4">
        <StatsChartRenderer config={config} launches={launches} lookups={lookups} />
      </div>
    </motion.section>
  );
}
