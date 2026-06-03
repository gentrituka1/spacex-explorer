"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompareSelectionBar } from "@/components/compare/CompareSelectionBar";
import { CompareView } from "@/components/compare/CompareView";
import { PageHero } from "@/components/layout/PageHero";
import { VirtualizedLaunchList } from "@/components/launches/VirtualizedLaunchList";
import { useToast } from "@/stores/toast-store";
import { truncateLabel } from "@/lib/format-toast";
import { useCompareLaunches } from "@/hooks/useLaunchDetail";
import type { Launch } from "@/types/spacex";

function parseIds(raw: string | null): string[] {
  if (!raw) {
    return [];
  }
  return raw.split(",").map((id) => id.trim()).filter(Boolean).slice(0, 2);
}

export function ComparePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const compareResultsRef = useRef<HTMLDivElement>(null);
  const prevSelectedCount = useRef(0);

  const idsFromUrl = useMemo(
    () => parseIds(searchParams.get("ids")),
    [searchParams],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(idsFromUrl);
  const [pickerExpanded, setPickerExpanded] = useState(idsFromUrl.length < 2);

  useEffect(() => {
    setSelectedIds(idsFromUrl);
    if (idsFromUrl.length === 2) {
      setPickerExpanded(false);
    }
  }, [idsFromUrl.join(",")]);

  useEffect(() => {
    if (selectedIds.length === 2) {
      const param = selectedIds.join(",");
      if (searchParams.get("ids") !== param) {
        router.replace(`/compare?ids=${param}`, { scroll: false });
      }
    } else if (searchParams.get("ids")) {
      router.replace("/compare", { scroll: false });
    }
  }, [selectedIds, router, searchParams]);

  useEffect(() => {
    if (prevSelectedCount.current !== 2 && selectedIds.length === 2) {
      setPickerExpanded(false);
      window.requestAnimationFrame(() => {
        compareResultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
    prevSelectedCount.current = selectedIds.length;
  }, [selectedIds.length]);

  const { launches: selectedLaunches, isLoading: selectedLoading } =
    useCompareLaunches(selectedIds);

  const shareUrl =
    typeof window !== "undefined" && selectedIds.length === 2
      ? `${window.location.origin}/compare?ids=${selectedIds.join(",")}`
      : "";

  const removeFromSelection = useCallback(
    (id: string) => {
      setSelectedIds((current) => {
        const launch = selectedLaunches.find((item) => item.id === id);
        const next = current.filter((item) => item !== id);
        if (launch) {
          showToast(
            `Removed "${truncateLabel(launch.name)}" from comparison`,
            "info",
          );
        }
        return next;
      });
      setPickerExpanded(true);
    },
    [selectedLaunches, showToast],
  );

  const toggleCompare = useCallback(
    (launch: Launch) => {
      let toastMessage: { message: string; variant: "success" | "info" } | undefined;

      setSelectedIds((current) => {
        const exists = current.includes(launch.id);

        if (exists) {
          toastMessage = {
            message: `Removed "${truncateLabel(launch.name)}" from comparison`,
            variant: "info",
          };
          return current.filter((id) => id !== launch.id);
        }

        if (current.length >= 2) {
          toastMessage = {
            message: `Swapped selection for "${truncateLabel(launch.name)}"`,
            variant: "info",
          };
          return [current[1], launch.id];
        }

        const next = [...current, launch.id];
        toastMessage =
          next.length === 2
            ? {
                message: "Comparison ready — scroll up to see results",
                variant: "success",
              }
            : {
                message: `Added "${truncateLabel(launch.name)}" as mission ${next.length === 1 ? "A" : "B"}`,
                variant: "info",
              };
        return next;
      });

      if (toastMessage) {
        showToast(toastMessage.message, toastMessage.variant);
      }
    },
    [showToast],
  );

  const swapSelection = useCallback(() => {
    setSelectedIds((current) => {
      if (current.length !== 2) {
        return current;
      }
      showToast("Swapped mission order", "info");
      return [current[1], current[0]];
    });
  }, [showToast]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setPickerExpanded(true);
    showToast("Comparison selection cleared", "info");
  }, [showToast]);

  const copyShareLink = async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Comparison link copied to clipboard", "success");
    } catch {
      showToast("Could not copy link — try again", "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        badge="Side by side"
        icon="compare"
        title="Compare launches"
        description="Pick two missions and see dates, rockets, outcomes, and details compared instantly. Share the link when you're done."
      />

      <CompareSelectionBar
        selectedIds={selectedIds}
        launches={selectedLaunches}
        isLoading={selectedLoading}
        shareUrl={shareUrl}
        pickerExpanded={pickerExpanded}
        onRemove={removeFromSelection}
        onSwap={swapSelection}
        onClear={clearSelection}
        onCopyLink={copyShareLink}
        onTogglePicker={() => setPickerExpanded((open) => !open)}
      />

      <div ref={compareResultsRef} id="comparison-results">
        <CompareView ids={selectedIds} />
      </div>

      {pickerExpanded && (
        <section id="picker" aria-label="Launch picker" className="space-y-4">
          <VirtualizedLaunchList
            compareMode
            selectedIds={selectedIds}
            onToggleCompare={toggleCompare}
          />
        </section>
      )}
    </div>
  );
}
