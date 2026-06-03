"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { launchToFavorite } from "@/lib/favorites-storage";
import type { FavoriteLaunch, Launch } from "@/types/spacex";

const STORAGE_KEY = "spacex-explorer-favorites";

interface FavoritesState {
  favorites: FavoriteLaunch[];
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (launch: Launch) => void;
  removeFavorite: (id: string) => void;
}

const favoritesStorage: StateStorage = {
  getItem: (name) => {
    if (typeof window === "undefined") {
      return null;
    }

    const value = localStorage.getItem(name);
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return JSON.stringify({
          state: { favorites: parsed, hasHydrated: true },
          version: 0,
        });
      }
    } catch {
      return value;
    }

    return value;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      isFavorite: (id) => get().favorites.some((item) => item.id === id),
      toggleFavorite: (launch) => {
        const current = get().favorites;
        const exists = current.some((item) => item.id === launch.id);
        set({
          favorites: exists
            ? current.filter((item) => item.id !== launch.id)
            : [launchToFavorite(launch), ...current],
        });
      },
      removeFavorite: (id) =>
        set({ favorites: get().favorites.filter((item) => item.id !== id) }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => favoritesStorage),
      partialize: (state) => ({ favorites: state.favorites }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useFavorites() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const isHydrated = useFavoritesStore((state) => state.hasHydrated);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  return {
    favorites,
    isHydrated,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
