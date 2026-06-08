import { mapLl2LauncherToRocket } from "@/lib/api/ll2/mappers";
import type {
  Ll2LauncherConfiguration,
  Ll2Paginated,
} from "@/lib/api/ll2/types";
import type { Rocket } from "@/types/spacex";
import { apiFetch } from "./client";

export async function getRocket(id: string): Promise<Rocket> {
  const response = await apiFetch<Ll2LauncherConfiguration>(
    `/launcher_configurations/${id}/?mode=detailed`,
  );
  return mapLl2LauncherToRocket(response);
}

export async function queryAllRockets(): Promise<Rocket[]> {
  const allRockets: Rocket[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const params = new URLSearchParams({
      manufacturer__name: "SpaceX",
      limit: String(limit),
      offset: String(offset),
      mode: "detailed",
    });

    const response = await apiFetch<Ll2Paginated<Ll2LauncherConfiguration>>(
      `/launcher_configurations/?${params.toString()}`,
    );

    allRockets.push(...response.results.map(mapLl2LauncherToRocket));
    hasMore = Boolean(response.next);
    offset += limit;
  }

  return allRockets;
}
