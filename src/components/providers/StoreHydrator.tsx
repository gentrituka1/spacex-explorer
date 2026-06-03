"use client";

import { useEffect } from "react";
import { useFavoritesStore } from "@/stores/favorites-store";
import { useStatsChartsStore } from "@/stores/stats-charts-store";

export function StoreHydrator() {
  useEffect(() => {
    void useFavoritesStore.persist.rehydrate();
    void useStatsChartsStore.persist.rehydrate();
  }, []);

  return null;
}
