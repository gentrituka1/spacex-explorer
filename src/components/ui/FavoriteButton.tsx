"use client";

import { useState } from "react";
import clsx from "clsx";
import { StarIcon } from "@/components/ui/StarIcon";
import { useFavorites } from "@/stores/favorites-store";
import { useToast } from "@/stores/toast-store";
import { truncateLabel } from "@/lib/format-toast";
import type { Launch } from "@/types/spacex";

interface FavoriteButtonProps {
  launch: Launch;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  launch,
  className,
  size = "md",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const { showToast } = useToast();
  const saved = isHydrated && isFavorite(launch.id);
  const [animating, setAnimating] = useState(false);

  return (
    <button
      type="button"
      aria-label={
        saved
          ? `Remove ${launch.name} from favorites`
          : `Save ${launch.name} to favorites`
      }
      aria-pressed={saved}
      disabled={!isHydrated}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        setAnimating(true);
        toggleFavorite(launch);
        showToast(
          saved
            ? `Removed "${truncateLabel(launch.name)}" from favorites`
            : `Saved "${truncateLabel(launch.name)}" to favorites`,
          saved ? "info" : "success",
        );
        window.setTimeout(() => setAnimating(false), 300);
      }}
      className={clsx(
        "rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 disabled:opacity-50",
        saved
          ? "text-amber-400 hover:text-amber-300"
          : "text-slate-500 hover:bg-slate-800/50 hover:text-amber-400/80",
        className,
      )}
    >
      <span
        className={clsx(
          "inline-flex items-center justify-center",
          animating && "animate-favorite-pop",
        )}
        aria-hidden="true"
      >
        <StarIcon
          filled={saved}
          size={size === "sm" ? "md" : "lg"}
        />
      </span>
    </button>
  );
}
