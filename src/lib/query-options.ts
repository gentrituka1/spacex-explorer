import {
  infiniteQueryOptions,
  queryOptions,
  type QueryClient,
} from "@tanstack/react-query";
import { getLaunch, getPageSize, queryLaunches } from "@/lib/api/launches";
import { getLaunchpad } from "@/lib/api/launchpads";
import { getRocket } from "@/lib/api/rockets";
import { DEFAULT_LAUNCH_FILTERS } from "@/lib/launch-query";
import type { Launch, LaunchFilters } from "@/types/spacex";

export function launchesInfiniteOptions(
  filters: LaunchFilters = DEFAULT_LAUNCH_FILTERS,
) {
  return infiniteQueryOptions({
    queryKey: ["launches", filters],
    queryFn: ({ pageParam }) =>
      queryLaunches({
        page: pageParam,
        limit: getPageSize(),
        filters,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage
        ? (lastPage.nextPage ?? lastPage.page + 1)
        : undefined,
  });
}

export function launchQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["launch", id],
    queryFn: () => getLaunch(id),
  });
}

export function rocketQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["rocket", id],
    queryFn: () => getRocket(id),
  });
}

export function launchpadQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["launchpad", id],
    queryFn: () => getLaunchpad(id),
  });
}

export async function prefetchLaunchDetail(
  queryClient: QueryClient,
  id: string,
): Promise<void> {
  const launch = await queryClient.fetchQuery(launchQueryOptions(id));

  await Promise.all([
    queryClient.prefetchQuery(rocketQueryOptions(launch.rocket)),
    queryClient.prefetchQuery(launchpadQueryOptions(launch.launchpad)),
  ]);
}

export type { Launch };
