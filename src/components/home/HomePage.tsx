"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { useFavorites } from "@/stores/favorites-store";

const features: {
  icon: AppIconName;
  title: string;
  href: string;
  ctaLabel: string;
  description: string;
  highlights: string[];
}[] = [
  {
    icon: "rocket",
    title: "Browse every launch",
    href: "/launches",
    ctaLabel: "Browse launches",
    description:
      "Search missions by name or flight number, filter by date, outcome, and timeline, then scroll through the full SpaceX catalog with server-side pagination.",
    highlights: [
      "Mission name & flight # search",
      "Date range & outcome filters",
      "Infinite scroll virtualized list",
      "Rich mission detail pages",
    ],
  },
  {
    icon: "star",
    title: "Save favorites",
    href: "/favorites",
    ctaLabel: "View favorites",
    description:
      "Bookmark launches you care about with one click. Your shortlist stays in the browser — no account required.",
    highlights: [
      "One-click star on any mission",
      "Stored locally in your browser",
      "Quick access from the nav badge",
      "Jump back to full mission details",
    ],
  },
  {
    icon: "chart",
    title: "Build custom dashboards",
    href: "/stats",
    ctaLabel: "Open stats",
    description:
      "Explore launch cadence and success rates, then add your own charts — bar, line, pie, radar, and more — grouped by year, rocket, launchpad, or outcome.",
    highlights: [
      "Overall success rate KPIs",
      "Add, duplicate & remove charts",
      "7 chart types & 6 groupings",
      "Layout saved in your browser",
    ],
  },
  {
    icon: "compare",
    title: "Compare missions",
    href: "/compare",
    ctaLabel: "Compare missions",
    description:
      "Pick any two launches and see them side by side — dates, rockets, launchpads, outcomes, and mission details with differences highlighted.",
    highlights: [
      "Checkbox picker in the launch list",
      "Shareable comparison URLs",
      "Mission patches in headers",
      "Diff highlighting in the table",
    ],
  },
];

const detailHighlights: {
  icon: AppIconName;
  title: string;
  text: string;
}[] = [
  {
    icon: "image",
    title: "Photo galleries",
    text: "Flickr images with keyboard navigation, thumbnails, and mission patch fallbacks.",
  },
  {
    icon: "wrench",
    title: "Booster recovery",
    text: "Core reuse, landing attempts, grid fins, legs, and landing type per booster.",
  },
  {
    icon: "map-pin",
    title: "Launchpad intel",
    text: "Pad location, timezone, status, attempt history, and a link to coordinates on Maps.",
  },
  {
    icon: "link",
    title: "Media & links",
    text: "Webcasts, press kits, Wikipedia, YouTube, Reddit threads, and more in one place.",
  },
];

const steps = [
  {
    step: "1",
    title: "Start on Launches",
    text: "Open the mission catalog, search for Starlink or #200, and filter to past successful flights.",
  },
  {
    step: "2",
    title: "Open a mission",
    text: "Click any row for the full story — timeline, rocket specs, launchpad, payloads, and gallery.",
  },
  {
    step: "3",
    title: "Save & analyze",
    text: "Star favorites, build stats charts for trends, or compare two missions and share the URL.",
  },
];

function FeatureIcon({ icon }: { icon: AppIconName }) {
  const isStar = icon === "star";

  return (
    <span
      className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${
        isStar
          ? "bg-amber-500/10 text-amber-400 ring-amber-500/25"
          : "bg-sky-500/10 text-sky-400 ring-sky-500/25"
      }`}
      aria-hidden="true"
    >
      <AppIcon name={icon} size={22} starFilled={isStar} />
    </span>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm"
    >
      <FeatureIcon icon={feature.icon} />
      <h3 className="mt-4 text-xl font-semibold text-white">{feature.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
        {feature.description}
      </p>
      <ul className="mt-4 space-y-2">
        {feature.highlights.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm text-slate-300"
          >
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-sky-400"
              aria-hidden="true"
            >
              <AppIcon name="check" size={14} />
            </span>
            {item}
          </li>
        ))}
      </ul>
      <Link href={feature.href} className="mt-6">
        <Button variant="secondary" className="w-full">
          {feature.ctaLabel}
        </Button>
      </Link>
    </motion.article>
  );
}

export function HomePage() {
  const { favorites } = useFavorites();

  return (
    <div className="space-y-16 pb-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950/90 px-6 py-12 sm:px-10 sm:py-16"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl">
          <p className="inline-flex rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-sky-300 ring-1 ring-sky-500/25">
            Your SpaceX mission companion
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Explore every SpaceX launch, your way
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-400">
            SpaceX Explorer pulls up-to-date SpaceX launch data from{" "}
            <a
              href="https://thespacedevs.com/llapi"
              className="text-sky-400 transition-colors hover:text-sky-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch Library 2
            </a>
            . Browse missions, save favorites, chart launch history, and compare
            flights side by side — all in a fast, dark-themed dashboard built for
            space fans and curious users alike.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/launches">
              <Button>Explore launches</Button>
            </Link>
            <Link href="/stats">
              <Button variant="secondary">View statistics</Button>
            </Link>
          </div>
        </div>

        <dl className="relative z-10 mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Data source", value: "Launch Library 2" },
            { label: "Your favorites", value: favorites.length.toString() },
            { label: "Account needed", value: "None" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-slate-800/60 bg-slate-950/40 px-4 py-3"
            >
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-white">{item.value}</dd>
            </div>
          ))}
        </dl>
      </motion.section>

      <section aria-labelledby="features-heading">
        <div className="mb-8">
          <h2 id="features-heading" className="text-2xl font-bold text-white sm:text-3xl">
            Everything you can do
          </h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Four main areas — each designed to help you discover, save, analyze,
            and compare SpaceX missions without leaving the app.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => (
            <FeatureCard key={feature.href} feature={feature} index={index} />
          ))}
        </div>
      </section>

      <section
        aria-labelledby="details-heading"
        className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-6 sm:p-8"
      >
        <h2 id="details-heading" className="text-2xl font-bold text-white">
          Deep mission detail pages
        </h2>
        <p className="mt-2 max-w-2xl text-slate-400">
          Every launch opens a dedicated page with timelines, hardware info,
          recovery data, and external media — not just a summary card.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {detailHighlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border border-slate-800/60 bg-slate-950/30 p-4"
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 text-sky-400"
                aria-hidden="true"
              >
                <AppIcon name={item.icon} size={18} />
              </span>
              <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-2xl font-bold text-white">
          How to get started
        </h2>
        <p className="mt-2 text-slate-400">
          Three steps from zero to exploring like a launch director.
        </p>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          {steps.map((item, index) => (
            <motion.li
              key={item.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-300 ring-1 ring-sky-500/30">
                {item.step}
              </span>
              <h3 className="mt-3 font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {item.text}
              </p>
            </motion.li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="tech-heading"
        className="grid gap-6 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
          <h2 id="tech-heading" className="text-xl font-bold text-white">
            Built for performance
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {[
              "Server-side filtering and pagination — only fetch what you need",
              "Virtualized launch list for smooth scrolling through hundreds of missions",
              "Stats aggregated from the full API catalog with cached queries",
              "Favorites and chart layouts persist locally via your browser",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0 text-sky-400" aria-hidden="true">
                  <AppIcon name="chevron-right" size={16} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6">
          <h2 className="text-xl font-bold text-white">Privacy & storage</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Launch data is read from{" "}
            <a
              href="https://thespacedevs.com/llapi"
              className="text-sky-400 hover:text-sky-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              Launch Library 2
            </a>{" "}
            by{" "}
            <a
              href="https://thespacedevs.com/"
              className="text-sky-400 hover:text-sky-300"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Space Devs
            </a>
            , filtered to SpaceX missions. Favorites and custom stats dashboards
            are saved only in your browser&apos;s local storage — nothing is sent
            to a backend server.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Clear your browser data to reset favorites and charts, or use
            &quot;Reset to defaults&quot; on the Stats page for charts only.
          </p>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-500/10 via-slate-900/50 to-violet-500/10 p-8 text-center"
      >
        <h2 className="text-2xl font-bold text-white">Ready to lift off?</h2>
        <p className="mx-auto mt-2 max-w-lg text-slate-400">
          Jump into the launch catalog or build your first custom stats chart.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/launches">
            <Button>Browse launches</Button>
          </Link>
          <Link href="/compare">
            <Button variant="secondary">Compare missions</Button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
}
