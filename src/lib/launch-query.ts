import type { LaunchFilters } from "@/types/spacex";

export function parseFlightNumberSearch(search: string): number | null {
  const trimmed = search.trim();
  if (!trimmed) {
    return null;
  }

  const hashMatch = trimmed.match(/^#\s*(\d+)$/);
  if (hashMatch) {
    return Number.parseInt(hashMatch[1], 10);
  }

  const plainNumberMatch = trimmed.match(/^(\d+)$/);
  if (plainNumberMatch) {
    return Number.parseInt(plainNumberMatch[1], 10);
  }

  const flightPrefixMatch = trimmed.match(/^flight\s+#?\s*(\d+)$/i);
  if (flightPrefixMatch) {
    return Number.parseInt(flightPrefixMatch[1], 10);
  }

  return null;
}

export const DEFAULT_LAUNCH_FILTERS: LaunchFilters = {
  upcoming: "all",
  success: "all",
  dateFrom: "",
  dateTo: "",
  search: "",
  sortBy: "date",
  sortOrder: "desc",
};
