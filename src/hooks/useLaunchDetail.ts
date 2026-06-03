"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  launchpadQueryOptions,
  launchQueryOptions,
  rocketQueryOptions,
} from "@/lib/query-options";
import { ApiError } from "@/lib/api/client";

export function useLaunch(id: string) {
  return useQuery({
    ...launchQueryOptions(id),
    enabled: Boolean(id),
  });
}

export function useRocket(id: string | undefined) {
  return useQuery({
    ...rocketQueryOptions(id!),
    enabled: Boolean(id),
  });
}

export function useLaunchpad(id: string | undefined) {
  return useQuery({
    ...launchpadQueryOptions(id!),
    enabled: Boolean(id),
  });
}

export function useCompareLaunches(ids: string[]) {
  const launchQueries = useQueries({
    queries: ids.map((id) => ({
      ...launchQueryOptions(id),
      enabled: Boolean(id),
    })),
  });

  const launches = launchQueries
    .map((query) => query.data)
    .filter((launch): launch is NonNullable<typeof launch> => Boolean(launch));

  const rocketIds = [...new Set(launches.map((launch) => launch.rocket))];
  const launchpadIds = [...new Set(launches.map((launch) => launch.launchpad))];

  const rocketQueries = useQueries({
    queries: rocketIds.map((id) => ({
      ...rocketQueryOptions(id),
      enabled: Boolean(id),
    })),
  });

  const launchpadQueries = useQueries({
    queries: launchpadIds.map((id) => ({
      ...launchpadQueryOptions(id),
      enabled: Boolean(id),
    })),
  });

  const rockets = new Map(
    rocketQueries
      .map((query) => query.data)
      .filter((rocket): rocket is NonNullable<typeof rocket> => Boolean(rocket))
      .map((rocket) => [rocket.id, rocket]),
  );

  const launchpads = new Map(
    launchpadQueries
      .map((query) => query.data)
      .filter((pad): pad is NonNullable<typeof pad> => Boolean(pad))
      .map((pad) => [pad.id, pad]),
  );

  const isLoading =
    launchQueries.some((query) => query.isLoading) ||
    rocketQueries.some((query) => query.isLoading) ||
    launchpadQueries.some((query) => query.isLoading);

  const isError = launchQueries.some((query) => query.isError);

  return { launches, rockets, launchpads, isLoading, isError };
}

export function getDetailErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "Launch not found.";
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Failed to load launch details.";
}
