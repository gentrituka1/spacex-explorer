"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Badge,
  getLaunchBadgeVariant,
  getLaunchStatusLabel,
} from "@/components/ui/Badge";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { DetailSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ImageGallery } from "@/components/launch-detail/ImageGallery";
import {
  getDetailErrorMessage,
  useLaunch,
  useLaunchpad,
  useRocket,
} from "@/hooks/useLaunchDetail";
import type { Launch } from "@/types/spacex";

function formatLaunchDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(new Date(dateUtc));
}

function formatLocalDate(dateLocal: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "long",
  }).format(new Date(dateLocal));
}

function formatWindow(seconds: number | null): string {
  if (seconds === null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes} min`;
}

function formatNullable(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function InfoCard({
  title,
  icon,
  children,
  delay = 0,
  className,
}: {
  title: string;
  icon: AppIconName;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-sm ${className ?? ""}`}
    >
      <h2 className="flex items-center gap-2.5 text-lg font-semibold text-white">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400"
          aria-hidden="true"
        >
          <AppIcon name={icon} size={18} />
        </span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800/60 py-2.5 last:border-0">
      <dt className="shrink-0 text-slate-400">{label}</dt>
      <dd className="text-right font-medium text-slate-100">{value}</dd>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function buildMissionStats(launch: Launch) {
  const landedCores = launch.cores.filter((core) => core.landing_success === true).length;
  const landingAttempts = launch.cores.filter((core) => core.landing_attempt).length;
  const reusedCores = launch.cores.filter((core) => core.reused).length;

  return [
    { label: "Flight #", value: launch.flight_number },
    { label: "Payloads", value: launch.payloads.length },
    { label: "Cores", value: launch.cores.length },
    { label: "Launch window", value: formatWindow(launch.window) },
    { label: "Landings", value: `${landedCores}/${landingAttempts || launch.cores.length}` },
    { label: "Reused cores", value: reusedCores },
  ];
}

interface LaunchDetailViewProps {
  launchId: string;
}

export function LaunchDetailView({ launchId }: LaunchDetailViewProps) {
  const launchQuery = useLaunch(launchId);
  const launch = launchQuery.data;

  const rocketQuery = useRocket(launch?.rocket);
  const launchpadQuery = useLaunchpad(launch?.launchpad);

  if (launchQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (launchQuery.isError || !launch) {
    return (
      <ErrorState
        title="Unable to load launch"
        message={getDetailErrorMessage(launchQuery.error)}
        onRetry={() => void launchQuery.refetch()}
      />
    );
  }

  const externalLinks = [
    { label: "Webcast", href: launch.links.webcast, icon: "▶" },
    { label: "Article", href: launch.links.article, icon: "📰" },
    { label: "Wikipedia", href: launch.links.wikipedia, icon: "📖" },
    { label: "Press kit", href: launch.links.presskit, icon: "📄" },
    {
      label: "YouTube",
      href: launch.links.youtube_id
        ? `https://www.youtube.com/watch?v=${launch.links.youtube_id}`
        : null,
      icon: "📺",
    },
  ].filter((link): link is { label: string; href: string; icon: string } =>
    Boolean(link.href),
  );

  const redditLinks = [
    { label: "Campaign", href: launch.links.reddit.campaign },
    { label: "Launch thread", href: launch.links.reddit.launch },
    { label: "Media", href: launch.links.reddit.media },
    { label: "Recovery", href: launch.links.reddit.recovery },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const patch = launch.links.patch.small;
  const missionStats = buildMissionStats(launch);
  const launchpad = launchpadQuery.data;
  const mapsUrl = launchpad
    ? `https://www.google.com/maps?q=${launchpad.latitude},${launchpad.longitude}`
    : null;

  return (
    <article className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/launches"
            className="inline-flex items-center gap-1 text-sm text-sky-400 transition-colors hover:text-sky-300"
          >
            ← Back to launches
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link href="/compare#picker">
              <Button variant="secondary" className="text-xs">
                Compare launches
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            {patch && (
              <div className="hidden h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-800/80 ring-1 ring-slate-700/50 sm:flex">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patch}
                  alt=""
                  className="h-full w-full object-contain p-2"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {launch.name}
              </h1>
              <p className="mt-2 font-mono text-sm text-slate-400">
                Flight #{launch.flight_number} · {formatLaunchDate(launch.date_utc)}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge
                  variant={getLaunchBadgeVariant(launch.upcoming, launch.success)}
                >
                  {getLaunchStatusLabel(launch.upcoming, launch.success)}
                </Badge>
                {launch.upcoming && launch.net && (
                  <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-300 ring-1 ring-violet-500/25">
                    NET
                  </span>
                )}
                {launch.tdb && (
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-300 ring-1 ring-amber-500/25">
                    TBD
                  </span>
                )}
              </div>
            </div>
          </div>
          <FavoriteButton launch={launch} />
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {missionStats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <ImageGallery links={launch.links} launchName={launch.name} />
      </motion.div>

      <InfoCard title="Timeline" icon="clock" delay={0.18}>
        <dl className="mt-4 text-sm">
          <DetailRow label="UTC launch" value={formatLaunchDate(launch.date_utc)} />
          <DetailRow label="Local launch" value={formatLocalDate(launch.date_local)} />
          <DetailRow
            label="Date precision"
            value={launch.date_precision.replace("_", " ")}
          />
          <DetailRow label="Launch window" value={formatWindow(launch.window)} />
          <DetailRow
            label="Static fire"
            value={
              launch.static_fire_date_utc
                ? formatLaunchDate(launch.static_fire_date_utc)
                : "—"
            }
          />
        </dl>
      </InfoCard>

      {launch.details && (
        <InfoCard title="Mission details" icon="clipboard" delay={0.2}>
          <p className="mt-3 leading-relaxed text-slate-300">{launch.details}</p>
        </InfoCard>
      )}

      {launch.cores.length > 0 && (
        <InfoCard title="Booster & core recovery" icon="wrench" delay={0.22}>
          <ul className="mt-4 space-y-3">
            {launch.cores.map((core, index) => (
              <li
                key={`${core.core ?? "core"}-${index}`}
                className="rounded-xl border border-slate-800/60 bg-slate-950/30 px-4 py-3 text-sm"
              >
                <p className="font-medium text-white">
                  Core {index + 1}
                  {core.flight !== null ? ` · Flight #${core.flight}` : ""}
                </p>
                <dl className="mt-2 grid gap-1.5 sm:grid-cols-2">
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Reused</dt>
                    <dd className="text-slate-200">{formatNullable(core.reused)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Landing attempt</dt>
                    <dd className="text-slate-200">
                      {formatNullable(core.landing_attempt)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Landing success</dt>
                    <dd className="text-slate-200">
                      {formatNullable(core.landing_success)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Landing type</dt>
                    <dd className="text-slate-200">
                      {core.landing_type ?? "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Grid fins</dt>
                    <dd className="text-slate-200">{formatNullable(core.gridfins)}</dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-slate-500">Legs</dt>
                    <dd className="text-slate-200">{formatNullable(core.legs)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </InfoCard>
      )}

      {launch.payloads.length > 0 && (
        <InfoCard title="Payloads" icon="package" delay={0.24}>
          <p className="mt-3 text-sm text-slate-400">
            {launch.payloads.length} payload{launch.payloads.length === 1 ? "" : "s"}{" "}
            on this mission
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {launch.payloads.map((payloadId) => (
              <li
                key={payloadId}
                className="rounded-lg bg-slate-800/60 px-2.5 py-1 font-mono text-xs text-slate-300"
              >
                {payloadId}
              </li>
            ))}
          </ul>
        </InfoCard>
      )}

      {launch.failures.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          aria-labelledby="launch-failures-heading"
        >
          <h2 id="launch-failures-heading" className="text-xl font-semibold text-rose-300">
            Failures
          </h2>
          <ul className="mt-3 space-y-2">
            {launch.failures.map((failure, index) => (
              <li
                key={`${failure.time}-${index}`}
                className="rounded-xl border border-rose-500/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-100"
              >
                {failure.reason}
                {failure.altitude !== null && (
                  <span className="text-rose-200/70">
                    {" "}
                    · Altitude: {failure.altitude} km · T+{failure.time}s
                  </span>
                )}
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard title="Rocket" icon="rocket" delay={0.3}>
          {rocketQuery.isLoading && (
            <p className="mt-3 text-sm text-slate-400">Loading rocket data…</p>
          )}
          {rocketQuery.isError && (
            <p className="mt-3 text-sm text-rose-300">Failed to load rocket details.</p>
          )}
          {rocketQuery.data && (
            <dl className="mt-4 text-sm">
              <DetailRow label="Name" value={rocketQuery.data.name} />
              <DetailRow label="Type" value={rocketQuery.data.type} />
              <DetailRow label="Company" value={rocketQuery.data.company} />
              <DetailRow label="Country" value={rocketQuery.data.country} />
              <DetailRow
                label="First flight"
                value={rocketQuery.data.first_flight}
              />
              <DetailRow
                label="Success rate"
                value={`${rocketQuery.data.success_rate_pct}%`}
              />
              <DetailRow
                label="Cost / launch"
                value={`$${rocketQuery.data.cost_per_launch.toLocaleString()}`}
              />
              <DetailRow label="Stages" value={rocketQuery.data.stages} />
              <DetailRow label="Boosters" value={rocketQuery.data.boosters} />
              <DetailRow
                label="Height"
                value={
                  rocketQuery.data.height.meters
                    ? `${rocketQuery.data.height.meters} m`
                    : "—"
                }
              />
              <DetailRow
                label="Diameter"
                value={
                  rocketQuery.data.diameter.meters
                    ? `${rocketQuery.data.diameter.meters} m`
                    : "—"
                }
              />
              <DetailRow
                label="Mass"
                value={
                  rocketQuery.data.mass.kg
                    ? `${rocketQuery.data.mass.kg.toLocaleString()} kg`
                    : "—"
                }
              />
              <DetailRow
                label="Engines (1st stage)"
                value={rocketQuery.data.first_stage.engines}
              />
              {rocketQuery.data.description && (
                <p className="pt-3 leading-relaxed text-slate-300">
                  {rocketQuery.data.description}
                </p>
              )}
            </dl>
          )}
        </InfoCard>

        <InfoCard title="Launchpad" icon="map-pin" delay={0.35}>
          {launchpadQuery.isLoading && (
            <p className="mt-3 text-sm text-slate-400">Loading launchpad data…</p>
          )}
          {launchpadQuery.isError && (
            <p className="mt-3 text-sm text-rose-300">
              Failed to load launchpad details.
            </p>
          )}
          {launchpad && (
            <dl className="mt-4 text-sm">
              <DetailRow label="Name" value={launchpad.full_name} />
              <DetailRow
                label="Location"
                value={`${launchpad.locality}, ${launchpad.region}`}
              />
              <DetailRow label="Status" value={launchpad.status} />
              <DetailRow label="Timezone" value={launchpad.timezone} />
              <DetailRow label="Attempts" value={launchpad.launch_attempts} />
              <DetailRow label="Successes" value={launchpad.launch_successes} />
              <DetailRow
                label="Coordinates"
                value={
                  mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-sky-300"
                    >
                      {launchpad.latitude.toFixed(4)}, {launchpad.longitude.toFixed(4)}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              {launchpad.details && (
                <p className="pt-3 leading-relaxed text-slate-300">
                  {launchpad.details}
                </p>
              )}
            </dl>
          )}
        </InfoCard>
      </div>

      {(externalLinks.length > 0 || redditLinks.length > 0) && (
        <InfoCard title="Links & media" icon="link" delay={0.4}>
          {externalLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {externalLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-100 transition-all hover:border-slate-500 hover:bg-slate-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 active:scale-[0.98]"
                >
                  <span aria-hidden="true">{link.icon}</span>
                  {link.label}
                </a>
              ))}
            </div>
          )}
          {redditLinks.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Reddit
              </p>
              <div className="flex flex-wrap gap-2">
                {redditLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-orange-500/20 bg-orange-950/20 px-3 py-2 text-sm text-orange-200 transition-colors hover:border-orange-500/40 hover:bg-orange-950/40"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </InfoCard>
      )}

      <InfoCard title="Identifiers" icon="tag" delay={0.42}>
        <dl className="mt-4 text-sm">
          <DetailRow label="Launch ID" value={launch.id} />
          <DetailRow label="Rocket ID" value={launch.rocket} />
          <DetailRow label="Launchpad ID" value={launch.launchpad} />
          <DetailRow label="Auto-update" value={formatNullable(launch.auto_update)} />
        </dl>
      </InfoCard>
    </article>
  );
}
