"use client";

import { useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  CHART_TYPE_OPTIONS,
  GROUP_BY_OPTIONS,
  METRIC_OPTIONS,
  createChartConfig,
  type ChartConfig,
  type ChartType,
  type ChartWidth,
  type GroupBy,
  type MetricKey,
  type SortOrder,
} from "@/lib/stats-chart-config";

interface StatsChartBuilderProps {
  onAdd: (config: ChartConfig) => void;
}

const inputClassName =
  "w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3 py-2.5 text-sm text-slate-100 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30";

export function StatsChartBuilder({ onAdd }: StatsChartBuilderProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ChartConfig>(() => createChartConfig());

  const toggleMetric = (metric: MetricKey) => {
    setDraft((current) => {
      const exists = current.metrics.includes(metric);
      const metrics = exists
        ? current.metrics.filter((item) => item !== metric)
        : [...current.metrics, metric];
      return { ...current, metrics: metrics.length > 0 ? metrics : [metric] };
    });
  };

  const handleAdd = () => {
    onAdd(createChartConfig(draft));
    setDraft(createChartConfig());
    setOpen(false);
  };

  return (
    <section
      aria-label="Add custom chart"
      className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-800/30"
        aria-expanded={open}
      >
        <div>
          <h2 className="text-lg font-semibold text-white">Build a custom chart</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Choose chart type, grouping, metrics, and layout — add as many as you like
          </p>
        </div>
        <span
          className={clsx(
            "text-xl text-sky-400 transition-transform",
            open && "rotate-45",
          )}
          aria-hidden="true"
        >
          +
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-slate-800/60 px-5 py-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="flex flex-col gap-1.5 text-sm md:col-span-2 xl:col-span-3">
                  <span className="font-medium text-slate-300">Chart title</span>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(event) =>
                      setDraft({ ...draft, title: event.target.value })
                    }
                    placeholder="e.g. Launches by rocket"
                    className={inputClassName}
                  />
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-300">Chart type</span>
                  <select
                    value={draft.chartType}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        chartType: event.target.value as ChartType,
                      })
                    }
                    className={inputClassName}
                  >
                    {CHART_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-300">Group data by</span>
                  <select
                    value={draft.groupBy}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        groupBy: event.target.value as GroupBy,
                      })
                    }
                    className={inputClassName}
                  >
                    {GROUP_BY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-300">Sort order</span>
                  <select
                    value={draft.sortOrder}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        sortOrder: event.target.value as SortOrder,
                      })
                    }
                    className={inputClassName}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                    <option value="none">Default</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-slate-300">Chart width</span>
                  <select
                    value={draft.width}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        width: event.target.value as ChartWidth,
                      })
                    }
                    className={inputClassName}
                  >
                    <option value="half">Half width</option>
                    <option value="full">Full width</option>
                  </select>
                </label>

                {(draft.groupBy === "rocket" || draft.groupBy === "launchpad") && (
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-slate-300">Top N items</span>
                    <input
                      type="number"
                      min={3}
                      max={30}
                      value={draft.limit}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          limit: Math.max(3, Number(event.target.value) || 12),
                        })
                      }
                      className={inputClassName}
                    />
                  </label>
                )}
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-300">
                  Metrics to display
                  {draft.chartType === "pie" && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      (pie uses the first selected metric)
                    </span>
                  )}
                </legend>
                <div className="flex flex-wrap gap-2">
                  {METRIC_OPTIONS.map((option) => {
                    const active = draft.metrics.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleMetric(option.value)}
                        className={clsx(
                          "rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
                          active
                            ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
                            : "bg-slate-800/60 text-slate-400 ring-slate-700 hover:text-slate-200",
                        )}
                        aria-pressed={active}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={draft.showLegend}
                    onChange={(event) =>
                      setDraft({ ...draft, showLegend: event.target.checked })
                    }
                    className="rounded border-slate-600 bg-slate-950 text-sky-500"
                  />
                  Show legend
                </label>
                <label className="flex items-center gap-2 text-slate-300">
                  <input
                    type="checkbox"
                    checked={draft.showGrid}
                    onChange={(event) =>
                      setDraft({ ...draft, showGrid: event.target.checked })
                    }
                    className="rounded border-slate-600 bg-slate-950 text-sky-500"
                  />
                  Show grid
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAdd}>Add chart</Button>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
