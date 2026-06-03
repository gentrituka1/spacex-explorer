import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { FavoritesView } from "@/components/favorites/FavoritesView";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Your bookmarked SpaceX launches stored in local storage.",
};

export default function FavoritesPage() {
  return (
    <div className="space-y-8">
      <PageHero
        badge="Your collection"
        icon="star"
        title="Favorites"
        description="Your personal shortlist of missions. Saved locally in your browser — no account needed."
      />
      <FavoritesView />
    </div>
  );
}
