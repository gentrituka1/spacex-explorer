import {
  buildLl2SearchParams,
  buildLl2StatsParams,
  getLl2LaunchesPath,
} from "@/lib/api/ll2/query-params";
import {
  mapLl2LaunchToLaunch,
  mapLl2LaunchToStatsLaunch,
  mapLl2PaginatedLaunches,
} from "@/lib/api/ll2/mappers";
import type { Ll2Launch, Ll2Paginated } from "@/lib/api/ll2/types";
import type {
  Launch,
  LaunchQueryOptions,
  PaginatedResponse,
  StatsLaunch,
} from "@/types/spacex";
import { apiFetch } from "./client";

const PAGE_SIZE = 20;
const STATS_PAGE_SIZE = 100;

export function getPageSize(): number {
  return PAGE_SIZE;
}

export async function queryLaunches(
  options: LaunchQueryOptions,
): Promise<PaginatedResponse<Launch>> {
  const { page, limit, filters } = options;
  const path = getLl2LaunchesPath(filters);
  const params = buildLl2SearchParams(filters, page, limit);

  const response = await apiFetch<Ll2Paginated<Ll2Launch>>(
    `${path}/?${params.toString()}`,
  );

  return mapLl2PaginatedLaunches(response, page, limit);
}

export async function getLaunch(id: string): Promise<Launch> {
  const response = await apiFetch<Ll2Launch>(`/launches/${id}/?mode=detailed`);
  return mapLl2LaunchToLaunch(response);
}

export async function queryLaunchStats(): Promise<StatsLaunch[]> {
  const allDocs: StatsLaunch[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const params = buildLl2StatsParams(page, STATS_PAGE_SIZE);
    const response = await apiFetch<Ll2Paginated<Ll2Launch>>(
      `/launches/?${params.toString()}`,
    );

    allDocs.push(...response.results.map(mapLl2LaunchToStatsLaunch));

    hasNextPage = Boolean(response.next);
    page += 1;
  }

  return allDocs;
}
