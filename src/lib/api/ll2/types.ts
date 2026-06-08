export interface Ll2Status {
  id: number;
  name: string;
  abbrev: string;
  description?: string;
}

export interface Ll2Image {
  image_url?: string | null;
  thumbnail_url?: string | null;
}

export interface Ll2Mission {
  id: number;
  name: string;
  description?: string | null;
  vid_urls?: string[];
  info_urls?: string[];
}

export interface Ll2RocketConfiguration {
  id: number;
  name: string;
  full_name?: string;
}

export interface Ll2Pad {
  id: number;
  name: string;
  url?: string;
  location?: {
    name?: string;
  };
}

export interface Ll2Launch {
  id: string;
  name: string;
  net: string;
  net_precision?: { name?: string } | null;
  window_start?: string | null;
  window_end?: string | null;
  status: Ll2Status;
  failreason?: string | null;
  image?: Ll2Image | null;
  mission?: Ll2Mission | null;
  rocket?: {
    configuration?: Ll2RocketConfiguration;
  };
  pad?: Ll2Pad;
  vid_urls?: string[];
  info_urls?: string[];
  agency_launch_attempt_count?: number | null;
  orbital_launch_attempt_count?: number | null;
}

export interface Ll2Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Ll2LauncherConfiguration {
  id: number;
  name: string;
  full_name?: string;
  description?: string | null;
  maiden_flight?: string | null;
  total_launch_count?: number;
  successful_launches?: number;
  failed_launches?: number;
  launch_cost?: number | null;
  length?: number | null;
  height?: number | null;
  diameter?: number | null;
  apogee?: number | null;
  leo_capacity?: number | null;
  to_thrust?: number | null;
  reusable?: boolean;
  families?: Array<{ name?: string }>;
  manufacturer?: Array<{
    name?: string;
    country?: Array<{ name?: string }>;
  }>;
  image?: Ll2Image | null;
}

export interface Ll2PadDetailed {
  id: number;
  name: string;
  description?: string | null;
  latitude?: number;
  longitude?: number;
  active?: boolean;
  total_launch_count?: number;
  orbital_launch_attempt_count?: number;
  map_image?: string | null;
  image?: Ll2Image | null;
  location?: {
    name?: string;
    timezone_name?: string;
    description?: string | null;
  };
}
