import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LaunchStatsCharts } from "@/components/stats/LaunchStatsCharts";

export const metadata: Metadata = {
  title: "Stats",
  description: "Launch statistics including launches per year and success rates.",
};

export default function StatsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        badge="Analytics"
        icon="chart"
        title="Launch statistics"
        description="Track SpaceX launch cadence and build your own dashboards. Add custom charts, pick metrics, and explore data by year, rocket, launchpad, and more."
      />
      <LaunchStatsCharts />
    </div>
  );
}
