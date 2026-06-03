"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import {
  createChartConfig,
  DEFAULT_CHARTS,
  generateChartId,
  type ChartConfig,
} from "@/lib/stats-chart-config";

const STORAGE_KEY = "spacex-explorer-stats-charts";

function ensureUniqueChartIds(charts: ChartConfig[]): ChartConfig[] {
  const seen = new Set<string>();

  return charts.map((chart) => {
    if (!seen.has(chart.id)) {
      seen.add(chart.id);
      return chart;
    }

    const next = { ...chart, id: generateChartId() };
    seen.add(next.id);
    return next;
  });
}

const chartsStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }

    const value = localStorage.getItem(name);
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        const charts = ensureUniqueChartIds(parsed as ChartConfig[]);
        return JSON.stringify({
          state: { charts, hasHydrated: true },
          version: 0,
        });
      }
    } catch {
      return value;
    }

    return value;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

interface StatsChartsState {
  charts: ChartConfig[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  addChart: (config: ChartConfig) => void;
  updateChart: (config: ChartConfig) => void;
  removeChart: (id: string) => void;
  duplicateChart: (config: ChartConfig) => void;
  resetCharts: () => void;
}

export const useStatsChartsStore = create<StatsChartsState>()(
  persist(
    (set, get) => ({
      charts: DEFAULT_CHARTS,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      addChart: (config) =>
        set({ charts: ensureUniqueChartIds([...get().charts, config]) }),
      updateChart: (config) =>
        set({
          charts: get().charts.map((item) =>
            item.id === config.id ? config : item,
          ),
        }),
      removeChart: (id) =>
        set({ charts: get().charts.filter((item) => item.id !== id) }),
      duplicateChart: (config) =>
        set({
          charts: ensureUniqueChartIds([
            ...get().charts,
            createChartConfig({
              ...config,
              title: `${config.title} (copy)`,
            }),
          ]),
        }),
      resetCharts: () => set({ charts: DEFAULT_CHARTS }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => chartsStorage),
      partialize: (state) => ({ charts: state.charts }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          state.charts = ensureUniqueChartIds(state.charts);
        }
      },
    },
  ),
);

export function useStatsCharts() {
  const charts = useStatsChartsStore((state) => state.charts);
  const hydrated = useStatsChartsStore((state) => state.hasHydrated);
  const addChart = useStatsChartsStore((state) => state.addChart);
  const updateChart = useStatsChartsStore((state) => state.updateChart);
  const removeChart = useStatsChartsStore((state) => state.removeChart);
  const duplicateChart = useStatsChartsStore((state) => state.duplicateChart);
  const resetCharts = useStatsChartsStore((state) => state.resetCharts);

  return {
    charts,
    hydrated,
    addChart,
    updateChart,
    removeChart,
    duplicateChart,
    resetCharts,
  };
}
