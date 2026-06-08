import { mapLl2PadToLaunchpad } from "@/lib/api/ll2/mappers";
import type { Ll2PadDetailed, Ll2Paginated } from "@/lib/api/ll2/types";
import type { Launchpad } from "@/types/spacex";
import { apiFetch } from "./client";

const SPACEX_AGENCY_ID = "121";

export async function getLaunchpad(id: string): Promise<Launchpad> {
  const response = await apiFetch<Ll2PadDetailed>(`/pads/${id}/?mode=detailed`);
  return mapLl2PadToLaunchpad(response);
}

export async function queryAllLaunchpads(): Promise<Launchpad[]> {
  const allPads: Launchpad[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      agencies_ids: SPACEX_AGENCY_ID,
      limit: String(limit),
      offset: String(offset),
      mode: "detailed",
    });

    const response = await apiFetch<Ll2Paginated<Ll2PadDetailed>>(
      `/pads/?${params.toString()}`,
    );

    allPads.push(...response.results.map(mapLl2PadToLaunchpad));
    hasMore = Boolean(response.next);
    offset += limit;
  }

  return allPads;
}
