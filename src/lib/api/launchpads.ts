import type { Launchpad } from "@/types/spacex";
import { apiFetch } from "./client";

export async function getLaunchpad(id: string): Promise<Launchpad> {
  return apiFetch<Launchpad>(`/launchpads/${id}`);
}

export async function queryAllLaunchpads(): Promise<Launchpad[]> {
  return apiFetch<Launchpad[]>("/launchpads");
}
