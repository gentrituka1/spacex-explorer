import type { FavoriteLaunch, Launch } from "@/types/spacex";

const STORAGE_KEY = "spacex-explorer-favorites";

export function readFavorites(): FavoriteLaunch[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as FavoriteLaunch[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(favorites: FavoriteLaunch[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function launchToFavorite(launch: Launch): FavoriteLaunch {
  return {
    id: launch.id,
    name: launch.name,
    date_utc: launch.date_utc,
    success: launch.success,
    upcoming: launch.upcoming,
    patchSmall: launch.links.patch.small,
    savedAt: new Date().toISOString(),
  };
}
