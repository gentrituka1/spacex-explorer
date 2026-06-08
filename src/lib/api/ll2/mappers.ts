import type {
  Launch,
  LaunchFailure,
  LaunchLinks,
  Launchpad,
  PaginatedResponse,
  Rocket,
  StatsLaunch,
} from "@/types/spacex";
import type {
  Ll2Launch,
  Ll2LauncherConfiguration,
  Ll2Paginated,
  Ll2PadDetailed,
  Ll2Status,
} from "./types";

const SUCCESS_STATUS_IDS = new Set([3]);
const FAILURE_STATUS_IDS = new Set([4, 7]);
const UPCOMING_STATUS_IDS = new Set([1, 2, 5, 8]);

function mapStatusToSuccess(status: Ll2Status): boolean | null {
  if (SUCCESS_STATUS_IDS.has(status.id)) {
    return true;
  }
  if (FAILURE_STATUS_IDS.has(status.id)) {
    return false;
  }
  return null;
}

function isUpcomingLaunch(status: Ll2Status, net: string): boolean {
  if (SUCCESS_STATUS_IDS.has(status.id) || FAILURE_STATUS_IDS.has(status.id)) {
    return false;
  }
  if (UPCOMING_STATUS_IDS.has(status.id)) {
    return true;
  }
  return new Date(net).getTime() > Date.now();
}

function extractYoutubeId(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return match?.[1] ?? null;
}

function computeWindowSeconds(launch: Ll2Launch): number | null {
  if (!launch.window_start || !launch.window_end) {
    return null;
  }
  const seconds =
    (new Date(launch.window_end).getTime() -
      new Date(launch.window_start).getTime()) /
    1000;
  return seconds > 0 ? Math.round(seconds) : null;
}

function mapLinks(launch: Ll2Launch): LaunchLinks {
  const imageUrl = launch.image?.image_url ?? null;
  const thumbUrl = launch.image?.thumbnail_url ?? imageUrl;
  const webcast =
    launch.vid_urls?.[0] ?? launch.mission?.vid_urls?.[0] ?? null;

  return {
    patch: {
      small: thumbUrl,
      large: imageUrl,
    },
    reddit: {
      campaign: null,
      launch: null,
      media: null,
      recovery: null,
    },
    flickr: {
      small: thumbUrl ? [thumbUrl] : [],
      original: imageUrl ? [imageUrl] : [],
    },
    presskit: null,
    webcast,
    youtube_id: extractYoutubeId(webcast),
    article: launch.info_urls?.[0] ?? null,
    wikipedia: launch.mission?.info_urls?.[0] ?? null,
  };
}

function mapFailures(launch: Ll2Launch): LaunchFailure[] {
  if (!launch.failreason?.trim()) {
    return [];
  }
  return [{ time: 0, altitude: null, reason: launch.failreason.trim() }];
}

export function mapLl2LaunchToLaunch(launch: Ll2Launch): Launch {
  const rocketId = launch.rocket?.configuration?.id;
  const padId = launch.pad?.id;

  return {
    id: launch.id,
    flight_number:
      launch.agency_launch_attempt_count ??
      launch.orbital_launch_attempt_count ??
      0,
    name: launch.name,
    date_utc: launch.net,
    date_unix: Math.floor(new Date(launch.net).getTime() / 1000),
    date_local: launch.net,
    date_precision:
      typeof launch.net_precision === "object" && launch.net_precision?.name
        ? launch.net_precision.name.toLowerCase()
        : "hour",
    static_fire_date_utc: null,
    static_fire_date_unix: null,
    tdb: launch.status.id === 2,
    net: launch.status.id === 2 || launch.status.id === 8,
    window: computeWindowSeconds(launch),
    rocket: rocketId ? String(rocketId) : "",
    success: mapStatusToSuccess(launch.status),
    failures: mapFailures(launch),
    upcoming: isUpcomingLaunch(launch.status, launch.net),
    details: launch.mission?.description ?? null,
    launchpad: padId ? String(padId) : "",
    payloads: launch.mission ? [launch.mission.name] : [],
    cores: [],
    links: mapLinks(launch),
    auto_update: true,
  };
}

export function mapLl2PaginatedLaunches(
  response: Ll2Paginated<Ll2Launch>,
  page: number,
  limit: number,
): PaginatedResponse<Launch> {
  const totalPages = Math.max(1, Math.ceil(response.count / limit));

  return {
    docs: response.results.map(mapLl2LaunchToLaunch),
    totalDocs: response.count,
    offset: (page - 1) * limit,
    limit,
    totalPages,
    page,
    pagingCounter: (page - 1) * limit + 1,
    hasPrevPage: page > 1,
    hasNextPage: Boolean(response.next),
    prevPage: page > 1 ? page - 1 : null,
    nextPage: response.next ? page + 1 : null,
  };
}

export function mapLl2LaunchToStatsLaunch(launch: Ll2Launch): StatsLaunch {
  const mapped = mapLl2LaunchToLaunch(launch);
  return {
    date_utc: mapped.date_utc,
    success: mapped.success,
    upcoming: mapped.upcoming,
    rocket: mapped.rocket,
    launchpad: mapped.launchpad,
  };
}

function emptyThrust() {
  return { kN: 0, lbf: 0 };
}

export function mapLl2LauncherToRocket(config: Ll2LauncherConfiguration): Rocket {
  const manufacturer = config.manufacturer?.[0];
  const total = config.total_launch_count ?? 0;
  const successful = config.successful_launches ?? 0;
  const failed = config.failed_launches ?? 0;
  const completed = successful + failed;
  const successRate =
    completed > 0 ? Math.round((successful / completed) * 100) : 0;

  const heightMeters = config.length ?? config.height ?? null;

  return {
    id: String(config.id),
    name: config.full_name ?? config.name,
    type: config.families?.[0]?.name ?? "rocket",
    active: true,
    stages: 2,
    boosters: 0,
    cost_per_launch: config.launch_cost ?? 0,
    success_rate_pct: successRate,
    first_flight: config.maiden_flight ?? "—",
    country: manufacturer?.country?.[0]?.name ?? "United States of America",
    company: manufacturer?.name ?? "SpaceX",
    height: {
      meters: heightMeters,
      feet: heightMeters ? heightMeters * 3.28084 : null,
    },
    diameter: {
      meters: config.diameter ?? null,
      feet: config.diameter ? config.diameter * 3.28084 : null,
    },
    mass: { kg: null, lb: null },
    payload_weights: config.leo_capacity
      ? [
          {
            id: "leo",
            name: "LEO",
            kg: config.leo_capacity,
            lb: Math.round(config.leo_capacity * 2.20462),
          },
        ]
      : [],
    first_stage: {
      reusable: config.reusable ?? true,
      engines: 9,
      fuel_amount_tons: 0,
      burn_time_sec: null,
      thrust_sea_level: emptyThrust(),
      thrust_vacuum: emptyThrust(),
    },
    second_stage: {
      reusable: false,
      engines: 1,
      fuel_amount_tons: 0,
      burn_time_sec: null,
      thrust: emptyThrust(),
      payloads: {
        composite_fairing: {
          height: { meters: null, feet: null },
          diameter: { meters: null, feet: null },
        },
        option_1: "composite fairing",
      },
    },
    engines: {
      number: 9,
      type: config.name,
      version: config.full_name ?? config.name,
      layout: null,
      isp: { sea_level: null, vacuum: null },
      engine_loss_max: null,
      propellant_1: null,
      propellant_2: null,
      thrust_sea_level: emptyThrust(),
      thrust_vacuum: emptyThrust(),
    },
    landing_legs: {
      number: config.reusable ? 4 : 0,
      material: config.reusable ? "carbon fiber" : null,
    },
    description: config.description ?? null,
    flickr_images: config.image?.image_url ? [config.image.image_url] : [],
  };
}

export function mapLl2PadToLaunchpad(pad: Ll2PadDetailed): Launchpad {
  const locationName = pad.location?.name ?? "";
  const [locality, ...rest] = locationName.split(",").map((part) => part.trim());

  return {
    id: String(pad.id),
    name: pad.name,
    full_name: pad.location?.name
      ? `${pad.name}, ${pad.location.name}`
      : pad.name,
    locality: locality || pad.name,
    region: rest.join(", ") || pad.location?.name || "",
    latitude: pad.latitude ?? 0,
    longitude: pad.longitude ?? 0,
    launch_attempts: pad.total_launch_count ?? pad.orbital_launch_attempt_count ?? 0,
    launch_successes: pad.orbital_launch_attempt_count ?? 0,
    rockets: [],
    timezone: pad.location?.timezone_name ?? "UTC",
    status: pad.active ? "active" : "retired",
    details: pad.description ?? pad.location?.description ?? null,
    images: {
      large: [
        pad.map_image,
        pad.image?.image_url,
      ].filter((url): url is string => Boolean(url)),
    },
  };
}
