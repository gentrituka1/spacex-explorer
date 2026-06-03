"use client";

import { motion, AnimatePresence } from "framer-motion";
import { StatsChartBuilder } from "@/components/stats/StatsChartBuilder";
import { StatsChartPanel } from "@/components/stats/StatsChartPanel";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import {
  computeSuccessRateFromLaunches,
  computeTotalsFromLaunches,
  getBusiestYear,
  getYearsActive,
} from "@/lib/stats-data";
import { useLaunchStats } from "@/hooks/useLaunchStats";
import { useStatsCharts } from "@/stores/stats-charts-store";
import { useToast } from "@/stores/toast-store";
import type { ChartConfig } from "@/lib/stats-chart-config";

function StatCard({
  label,
  value,
  suffix,
  color,
  delay = 0,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-3xl font-bold leading-tight ${color}`}>
        {value}
        {suffix && (
          <span className="ml-1 text-base font-normal text-slate-400">{suffix}</span>
        )}
      </p>
    </motion.div>
  );
}

export function LaunchStatsCharts() {
  const { data, isLoading, isError, error, refetch } = useLaunchStats();
  const { showToast } = useToast();
  const {
    charts,
    hydrated,
    addChart,
    updateChart,
    removeChart,
    duplicateChart,
    resetCharts,
  } = useStatsCharts();

  const handleAddChart = (config: ChartConfig) => {
    addChart(config);
    showToast(`Chart "${config.title}" added`, "success");
  };

  const handleRemoveChart = (id: string) => {
    const chart = charts.find((item) => item.id === id);
    removeChart(id);
    showToast(
      chart ? `Chart "${chart.title}" removed` : "Chart removed",
      "info",
    );
  };

  const handleDuplicateChart = (config: ChartConfig) => {
    duplicateChart(config);
    showToast(`Duplicated "${config.title}"`, "success");
  };

  const handleResetCharts = () => {
    resetCharts();
    showToast("Charts reset to defaults", "info");
  };

  if (isLoading || !hydrated) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-shimmer rounded-2xl border border-slate-800/80"
            />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Unable to load statistics"
        message={error instanceof Error ? error.message : "Failed to load stats."}
        onRetry={() => void refetch()}
      />
    );
  }

  const { launches, lookups } = data;
  const totals = computeTotalsFromLaunches(launches);
  const successRate = computeSuccessRateFromLaunches(launches);
  const peakYear = getBusiestYear(launches);
  const yearsActive = getYearsActive(launches);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Success rate"
          value={successRate}
          suffix="%"
          color="text-emerald-300"
          delay={0}
        />
        <StatCard
          label="Total launches"
          value={totals.total.toLocaleString()}
          color="text-sky-300"
          delay={0.05}
        />
        <StatCard
          label="Successful"
          value={totals.successful.toLocaleString()}
          color="text-emerald-400"
          delay={0.1}
        />
        <StatCard
          label="Busiest year"
          value={peakYear?.year ?? "—"}
          suffix={peakYear ? ` (${peakYear.total})` : undefined}
          color="text-violet-300"
          delay={0.15}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/30 px-4 py-3"
      >
        <p className="text-sm text-slate-500">
          Tracking {yearsActive} years · {charts.length} chart
          {charts.length === 1 ? "" : "s"} · layouts saved in your browser
        </p>
        <Button variant="ghost" className="text-xs" onClick={handleResetCharts}>
          Reset to defaults
        </Button>
      </motion.div>

      <StatsChartBuilder onAdd={handleAddChart} />

      {charts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/20 px-6 py-12 text-center">
          <p className="text-slate-400">
            No charts yet. Use the builder above to add your first visualization.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {charts.map((config, index) => (
              <StatsChartPanel
                key={config.id}
                config={config}
                launches={launches}
                lookups={lookups}
                index={index}
                onUpdate={updateChart}
                onRemove={handleRemoveChart}
                onDuplicate={handleDuplicateChart}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
