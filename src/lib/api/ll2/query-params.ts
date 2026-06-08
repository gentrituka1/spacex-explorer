import { parseFlightNumberSearch } from "@/lib/launch-query";
import type { LaunchFilters } from "@/types/spacex";

const SPACEX_PROVIDER = "SpaceX";
const SUCCESS_STATUS = "3";
const FAILURE_STATUSES = "4,7";

export function getLl2LaunchesPath(filters: LaunchFilters): string {
  if (filters.upcoming === "upcoming") {
    return "/launches/upcoming";
  }
  if (filters.upcoming === "past") {
    return "/launches/previous";
  }
  return "/launches";
}

export function buildLl2SearchParams(
  filters: LaunchFilters,
  page: number,
  limit: number,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("lsp__name", SPACEX_PROVIDER);
  params.set("limit", String(limit));
  params.set("offset", String((page - 1) * limit));
  params.set("mode", "normal");

  if (filters.success === "success") {
    params.set("status__ids", SUCCESS_STATUS);
  } else if (filters.success === "failure") {
    params.set("status__ids", FAILURE_STATUSES);
  }

  if (filters.dateFrom) {
    params.set("net__gte", new Date(filters.dateFrom).toISOString());
  }

  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    params.set("net__lte", end.toISOString());
  }

  const search = filters.search.trim();
  if (search) {
    const flightNumber = parseFlightNumberSearch(search);
    if (flightNumber !== null) {
      params.set("agency_launch_attempt_count", String(flightNumber));
    } else {
      params.set("search", search);
    }
  }

  if (filters.sortBy === "name") {
    params.set("ordering", filters.sortOrder === "asc" ? "name" : "-name");
  } else {
    params.set("ordering", filters.sortOrder === "asc" ? "net" : "-net");
  }

  return params;
}

export function buildLl2StatsParams(page: number, limit: number): URLSearchParams {
  const params = new URLSearchParams();
  params.set("lsp__name", SPACEX_PROVIDER);
  params.set("limit", String(limit));
  params.set("offset", String((page - 1) * limit));
  params.set("mode", "list");
  params.set("ordering", "net");
  return params;
}
