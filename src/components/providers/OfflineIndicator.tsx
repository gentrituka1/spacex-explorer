"use client";

import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/AppIcon";

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex max-w-sm items-start gap-2.5 rounded-xl border border-amber-500/30 bg-slate-950/95 px-4 py-3 text-sm text-amber-100 shadow-lg backdrop-blur-sm"
    >
      <AppIcon name="alert" size={18} className="mt-0.5 shrink-0 text-amber-400" />
      <p>
        You&apos;re offline. Favorites and previously loaded launches remain
        available from cache.
      </p>
    </div>
  );
}
