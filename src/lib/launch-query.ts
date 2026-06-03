import type { LaunchFilters } from "@/types/spacex";

type MongoQuery = Record<string, unknown>;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

export function buildLaunchQuery(filters: LaunchFilters): MongoQuery {
  const query: MongoQuery = {};

  if (filters.upcoming === "upcoming") {
    query.upcoming = true;
  } else if (filters.upcoming === "past") {
    query.upcoming = false;
  }

  if (filters.success === "success") {
    query.success = true;
  } else if (filters.success === "failure") {
    query.success = false;
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateRange: Record<string, string> = {};
    if (filters.dateFrom) {
      dateRange.$gte = new Date(filters.dateFrom).toISOString();
    }
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      dateRange.$lte = end.toISOString();
    }
    query.date_utc = dateRange;
  }

  const search = filters.search.trim();
  if (search) {
    const flightNumber = parseFlightNumberSearch(search);

    if (flightNumber !== null) {
      query.$or = [
        { flight_number: flightNumber },
        { name: { $regex: escapeRegex(String(flightNumber)), $options: "i" } },
      ];
    } else {
      query.name = { $regex: escapeRegex(search), $options: "i" };
    }
  }

  return query;
}

export function buildLaunchSort(filters: LaunchFilters): Record<string, 1 | -1> {
  const field = filters.sortBy === "name" ? "name" : "date_utc";
  const direction = filters.sortOrder === "asc" ? 1 : -1;
  return { [field]: direction };
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
