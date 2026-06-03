import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePageClient } from "@/components/compare/ComparePageClient";
import { LaunchSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare two SpaceX launches side by side with a shareable URL.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<LaunchSkeleton count={4} />}>
      <ComparePageClient />
    </Suspense>
  );
}
