import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { LaunchDetailView } from "@/components/launch-detail/LaunchDetailView";
import { getLaunch } from "@/lib/api/launches";
import { prefetchLaunchDetail } from "@/lib/query-options";
import { ApiError } from "@/lib/api/client";

interface LaunchDetailPageProps {
  params: Promise<{ id: string }>;
}

/** ISR: revalidate launch detail HTML every hour. */
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: LaunchDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const launch = await getLaunch(id);
    return {
      title: `${launch.name} | SpaceX Explorer`,
      description:
        launch.details ??
        `${launch.name} — SpaceX launch mission details, rocket specs, and launchpad.`,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { title: "Launch not found" };
    }
    return {
      title: "Launch details",
      description: "Detailed SpaceX launch information including rocket and launchpad.",
    };
  }
}

export default async function LaunchDetailPage({ params }: LaunchDetailPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    await prefetchLaunchDetail(queryClient, id);
  } catch {
    // Client handles missing launches; dehydrated cache may be empty.
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <LaunchDetailView launchId={id} />
    </HydrationBoundary>
  );
}
