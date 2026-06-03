import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { PageHero } from "@/components/layout/PageHero";
import { VirtualizedLaunchList } from "@/components/launches/VirtualizedLaunchList";
import { launchesInfiniteOptions } from "@/lib/query-options";

export const metadata: Metadata = {
  title: "Launches",
  description: "Browse and filter SpaceX launches with server-side pagination.",
};

/** ISR: refresh the default launch list on the server every 5 minutes. */
export const revalidate = 300;

export default async function LaunchesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchInfiniteQuery(launchesInfiniteOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="space-y-8">
        <PageHero
          badge="Mission catalog"
          icon="rocket"
          title="Launches"
          description="Explore every SpaceX mission with powerful filters, infinite scroll, and instant favorites. Click any launch to dive into mission details."
        />
        <VirtualizedLaunchList />
      </div>
    </HydrationBoundary>
  );
}
