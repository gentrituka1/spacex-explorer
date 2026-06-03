import { buildLaunchQuery, buildLaunchSort } from "@/lib/launch-query";
import type {
  Launch,
  LaunchQueryOptions,
  PaginatedResponse,
  StatsLaunch,
} from "@/types/spacex";
import { apiFetch } from "./client";

const PAGE_SIZE = 20;

export function getPageSize(): number {
  return PAGE_SIZE;
}

export async function queryLaunches(
  options: LaunchQueryOptions,
): Promise<PaginatedResponse<Launch>> {
  const { page, limit, filters } = options;

  return apiFetch<PaginatedResponse<Launch>>("/launches/query", {
    method: "POST",
    body: JSON.stringify({
      query: buildLaunchQuery(filters),
      options: {
        page,
        limit,
        sort: buildLaunchSort(filters),
      },
    }),
  });
}

export async function getLaunch(id: string): Promise<Launch> {
  return apiFetch<Launch>(`/launches/${id}`);
}

export async function queryLaunchStats(): Promise<StatsLaunch[]> {
  const allDocs: StatsLaunch[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await apiFetch<PaginatedResponse<Launch>>(
      "/launches/query",
      {
        method: "POST",
        body: JSON.stringify({
          query: {},
          options: {
            page,
            limit: 100,
            sort: { date_utc: 1 },
            select: {
              date_utc: 1,
              success: 1,
              upcoming: 1,
              rocket: 1,
              launchpad: 1,
            },
          },
        }),
      },
    );

    allDocs.push(
      ...response.docs.map((launch) => ({
        date_utc: launch.date_utc,
        success: launch.success,
        upcoming: launch.upcoming,
        rocket: launch.rocket,
        launchpad: launch.launchpad,
      })),
    );

    hasNextPage = response.hasNextPage;
    page = response.nextPage ?? page + 1;
  }

  return allDocs;
}
