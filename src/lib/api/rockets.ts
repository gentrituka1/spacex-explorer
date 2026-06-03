import type { Rocket } from "@/types/spacex";
import { apiFetch } from "./client";

export async function getRocket(id: string): Promise<Rocket> {
  return apiFetch<Rocket>(`/rockets/${id}`);
}

export async function queryAllRockets(): Promise<Rocket[]> {
  return apiFetch<Rocket[]>("/rockets");
}
