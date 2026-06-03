"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Badge,
  getLaunchBadgeVariant,
  getLaunchStatusLabel,
} from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LaunchSkeleton } from "@/components/ui/Skeleton";
import { useFavorites } from "@/stores/favorites-store";
import { useToast } from "@/stores/toast-store";
import { truncateLabel } from "@/lib/format-toast";
import { AppIcon, MissionPatchPlaceholder } from "@/components/ui/AppIcon";
import { StarIcon } from "@/components/ui/StarIcon";

function formatDate(dateUtc: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(dateUtc));
}

export function FavoritesView() {
  const router = useRouter();
  const { favorites, removeFavorite, isHydrated } = useFavorites();
  const { showToast } = useToast();

  if (!isHydrated) {
    return <LaunchSkeleton count={3} />;
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites yet"
        description="Bookmark launches from the list or detail pages. Your favorites stay saved in this browser."
        icon={<StarIcon filled size="xl" className="text-amber-400" />}
        action={
          <Link href="/launches">
            <Button variant="primary">Browse launches</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="space-y-3" aria-label="Favorite launches">
      {favorites.map((favorite, index) => (
        <motion.li
          key={favorite.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          layout
        >
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/launches/${favorite.id}`)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push(`/launches/${favorite.id}`);
              }
            }}
            className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 transition-colors hover:border-amber-500/25 hover:bg-slate-900/70"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800/80 ring-1 ring-slate-700/50">
              {favorite.patchSmall ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={favorite.patchSmall}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <MissionPatchPlaceholder size={22} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={`/launches/${favorite.id}`}
                onClick={(event) => event.stopPropagation()}
                className="font-semibold text-white transition-colors group-hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded"
              >
                {favorite.name}
              </Link>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {formatDate(favorite.date_utc)} UTC
              </p>
              <Badge
                variant={getLaunchBadgeVariant(favorite.upcoming, favorite.success)}
                className="mt-2"
              >
                {getLaunchStatusLabel(favorite.upcoming, favorite.success)}
              </Badge>
            </div>

            <Button
              variant="ghost"
              onClick={(event) => {
                event.stopPropagation();
                removeFavorite(favorite.id);
                showToast(
                  `Removed "${truncateLabel(favorite.name)}" from favorites`,
                  "info",
                );
              }}
              aria-label={`Remove ${favorite.name} from favorites`}
              className="opacity-60 transition-opacity group-hover:opacity-100"
            >
              Remove
            </Button>

            <span
              className="hidden shrink-0 text-slate-600 transition-colors group-hover:text-amber-400 sm:inline-flex"
              aria-hidden="true"
            >
              <AppIcon name="chevron-right" size={18} />
            </span>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
