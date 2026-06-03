"use client";

import { OfflineIndicator } from "@/components/providers/OfflineIndicator";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ServiceWorkerRegistration } from "@/components/providers/ServiceWorkerRegistration";
import { StoreHydrator } from "@/components/providers/StoreHydrator";
import { ToastHost } from "@/components/ui/ToastHost";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <StoreHydrator />
      <ServiceWorkerRegistration />
      {children}
      <OfflineIndicator />
      <ToastHost />
    </QueryProvider>
  );
}
