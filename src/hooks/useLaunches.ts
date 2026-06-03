"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { launchesInfiniteOptions } from "@/lib/query-options";
import type { LaunchFilters } from "@/types/spacex";
import { ApiError } from "@/lib/api/client";

export function useLaunchesInfinite(filters: LaunchFilters) {
  return useInfiniteQuery({
    ...launchesInfiniteOptions(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function getLaunchesErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Rate limit reached. Please wait a moment and try again.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to load launches.";
}
