import type { Metadata } from "next";
import { HomePage } from "@/components/home/HomePage";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore SpaceX launches, save favorites, build custom stats dashboards, and compare missions — powered by the SpaceX API v4.",
};

export default function Page() {
  return <HomePage />;
}
