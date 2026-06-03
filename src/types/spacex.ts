export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  offset: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface LaunchLinks {
  patch: {
    small: string | null;
    large: string | null;
  };
  reddit: {
    campaign: string | null;
    launch: string | null;
    media: string | null;
    recovery: string | null;
  };
  flickr: {
    small: string[];
    original: string[];
  };
  presskit: string | null;
  webcast: string | null;
  youtube_id: string | null;
  article: string | null;
  wikipedia: string | null;
}

export interface LaunchFailure {
  time: number;
  altitude: number | null;
  reason: string;
}

export interface Launch {
  id: string;
  flight_number: number;
  name: string;
  date_utc: string;
  date_unix: number;
  date_local: string;
  date_precision: string;
  static_fire_date_utc: string | null;
  static_fire_date_unix: number | null;
  tdb: boolean;
  net: boolean;
  window: number | null;
  rocket: string;
  success: boolean | null;
  failures: LaunchFailure[];
  upcoming: boolean;
  details: string | null;
  launchpad: string;
  payloads: string[];
  cores: Array<{
    core: string | null;
    flight: number | null;
    gridfins: boolean | null;
    legs: boolean | null;
    reused: boolean | null;
    landing_attempt: boolean | null;
    landing_success: boolean | null;
    landing_type: string | null;
    landpad: string | null;
  }>;
  links: LaunchLinks;
  auto_update: boolean;
}

export interface Rocket {
  id: string;
  name: string;
  type: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
  country: string;
  company: string;
  height: { meters: number | null; feet: number | null };
  diameter: { meters: number | null; feet: number | null };
  mass: { kg: number | null; lb: number | null };
  payload_weights: Array<{
    id: string;
    name: string;
    kg: number;
    lb: number;
  }>;
  first_stage: {
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number | null;
    thrust_sea_level: { kN: number; lbf: number };
    thrust_vacuum: { kN: number; lbf: number };
  };
  second_stage: {
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number | null;
    thrust: { kN: number; lbf: number };
    payloads: {
      composite_fairing: {
        height: { meters: number | null; feet: number | null };
        diameter: { meters: number | null; feet: number | null };
      };
      option_1: string;
    };
  };
  engines: {
    number: number;
    type: string;
    version: string;
    layout: string | null;
    isp: { sea_level: number | null; vacuum: number | null };
    engine_loss_max: number | null;
    propellant_1: string | null;
    propellant_2: string | null;
    thrust_sea_level: { kN: number; lbf: number };
    thrust_vacuum: { kN: number; lbf: number };
  };
  landing_legs: {
    number: number;
    material: string | null;
  };
  description: string | null;
  flickr_images: string[];
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
  launch_attempts: number;
  launch_successes: number;
  rockets: string[];
  timezone: string;
  status: string;
  details: string | null;
  images: {
    large: string[];
  };
}

export type UpcomingFilter = "all" | "upcoming" | "past";
export type SuccessFilter = "all" | "success" | "failure";
export type SortField = "date" | "name";
export type SortOrder = "asc" | "desc";

export interface LaunchFilters {
  upcoming: UpcomingFilter;
  success: SuccessFilter;
  dateFrom: string;
  dateTo: string;
  search: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}

export interface LaunchQueryOptions {
  page: number;
  limit: number;
  filters: LaunchFilters;
}

export interface FavoriteLaunch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  patchSmall: string | null;
  savedAt: string;
}

export interface LaunchStatsPoint {
  year: string;
  total: number;
  successful: number;
  failed: number;
}

export interface StatsLaunch {
  date_utc: string;
  success: boolean | null;
  upcoming: boolean;
  rocket: string;
  launchpad: string;
}

export interface StatsLookups {
  rockets: Map<string, string>;
  launchpads: Map<string, string>;
}

export interface ChartDataPoint {
  label: string;
  total: number;
  successful: number;
  failed: number;
  upcoming: number;
  success_rate: number;
}
