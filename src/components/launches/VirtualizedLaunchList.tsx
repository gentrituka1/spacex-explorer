"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { List, type RowComponentProps } from "react-window";
import { LaunchRow } from "@/components/launches/LaunchRow";
import { LaunchFiltersPanel } from "@/components/launches/LaunchFiltersPanel";
import { CompareLaunchFilters } from "@/components/compare/CompareLaunchFilters";
import { AppIcon } from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LaunchSkeleton } from "@/components/ui/Skeleton";
import {
  getLaunchesErrorMessage,
  useLaunchesInfinite,
} from "@/hooks/useLaunches";
import { DEFAULT_LAUNCH_FILTERS } from "@/lib/launch-query";
import type { Launch, LaunchFilters } from "@/types/spacex";

const ROW_HEIGHT = 100;
const LOAD_MORE_THRESHOLD = 5;
const MIN_LIST_HEIGHT = 360;
const MAX_LIST_HEIGHT = 720;
const COMPARE_LIST_MIN = 280;
const COMPARE_LIST_MAX = 440;

interface VirtualizedLaunchListProps {
  compareMode?: boolean;
  selectedIds?: string[];
  onToggleCompare?: (launch: Launch) => void;
}

type LaunchRowData = {
  launches: Launch[];
  compareMode: boolean;
  selectedIds: string[];
  onToggleCompare?: (launch: Launch) => void;
};

function VirtualRow({
  index,
  style,
  ariaAttributes,
  launches,
  compareMode,
  selectedIds,
  onToggleCompare,
}: RowComponentProps<LaunchRowData>) {
  const launch = launches[index];

  if (!launch) {
    return (
      <div style={style} className="px-1 pb-3 pt-1">
        <div className="h-[88px] w-full animate-shimmer rounded-xl" />
      </div>
    );
  }

  return (
    <LaunchRow
      launch={launch}
      style={style}
      ariaAttributes={ariaAttributes}
      compareMode={compareMode}
      isSelected={selectedIds.includes(launch.id)}
      compareSlotIndex={selectedIds.indexOf(launch.id)}
      onToggleCompare={onToggleCompare}
    />
  );
}

function LaunchListFooter({
  launchesCount,
  totalDocs,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: {
  launchesCount: number;
  totalDocs?: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 bg-slate-900/40 px-4 py-3 sm:px-5">
      <p className="text-sm text-slate-400">
        Loaded{" "}
        <span className="font-medium text-slate-200">
          {launchesCount.toLocaleString()}
        </span>
        {typeof totalDocs === "number" ? ` of ${totalDocs.toLocaleString()}` : ""}
      </p>

      {hasNextPage && (
        <Button
          variant="secondary"
          className="text-sm"
          onClick={onLoadMore}
          disabled={isFetchingNextPage}
          aria-busy={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading more…" : "Load more"}
        </Button>
      )}
    </div>
  );
}

function ScrollableMissionList({
  listKey,
  launches,
  listHeight,
  rowProps,
  isRefetching,
  onRowsRendered,
  scrollRef,
}: {
  listKey: string;
  launches: Launch[];
  listHeight: number;
  rowProps: LaunchRowData;
  isRefetching: boolean;
  onRowsRendered: (visible: { startIndex: number; stopIndex: number }) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={scrollRef}
      className="relative shrink-0 overflow-hidden bg-slate-950/30"
      style={{ height: listHeight }}
    >
      {isRefetching && (
        <div
          className="absolute inset-0 z-10 flex items-start justify-center bg-slate-950/55 pt-10 backdrop-blur-[2px]"
          aria-live="polite"
        >
          <span className="rounded-full bg-slate-900/95 px-4 py-2 text-sm text-sky-300 ring-1 ring-sky-500/30">
            Updating results…
          </span>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-5 bg-gradient-to-b from-slate-950/90 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-6 bg-gradient-to-t from-slate-950/95 to-transparent"
        aria-hidden="true"
      />

      <List
        key={listKey}
        rowCount={launches.length}
        rowHeight={ROW_HEIGHT}
        rowComponent={VirtualRow}
        rowProps={rowProps}
        onRowsRendered={onRowsRendered}
        overscanCount={5}
        style={{ height: listHeight }}
        className="launch-list-scroll px-1 py-1"
        role="list"
        aria-label="Launches"
      />
    </div>
  );
}

export const VirtualizedLaunchList = memo(function VirtualizedLaunchList({
  compareMode = false,
  selectedIds = [],
  onToggleCompare,
}: VirtualizedLaunchListProps) {
  const [filters, setFilters] = useState<LaunchFilters>(DEFAULT_LAUNCH_FILTERS);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(compareMode ? 360 : 520);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetching,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useLaunchesInfinite(filters);

  const launches = useMemo(
    () => data?.pages.flatMap((page) => page.docs) ?? [],
    [data],
  );

  const totalDocs = data?.pages[0]?.totalDocs;
  const isRefetching = isFetching && !isLoading && !isFetchingNextPage;

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const updateHeight = () => {
      const rect = element.getBoundingClientRect();
      const bottomPadding = compareMode ? 72 : 96;
      const available = window.innerHeight - rect.top - bottomPadding;
      const min = compareMode ? COMPARE_LIST_MIN : MIN_LIST_HEIGHT;
      const max = compareMode ? COMPARE_LIST_MAX : MAX_LIST_HEIGHT;
      setListHeight(Math.min(max, Math.max(min, available)));
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [compareMode, launches.length, isLoading]);

  const handleRowsRendered = useCallback(
    (visibleRows: { startIndex: number; stopIndex: number }) => {
      if (!hasNextPage || isFetchingNextPage) {
        return;
      }

      if (visibleRows.stopIndex >= launches.length - LOAD_MORE_THRESHOLD) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, launches.length],
  );

  const rowProps = useMemo(
    () => ({
      launches,
      compareMode,
      selectedIds,
      onToggleCompare,
    }),
    [launches, compareMode, selectedIds, onToggleCompare],
  );

  const listKey = useMemo(
    () =>
      [
        filters.search,
        filters.upcoming,
        filters.success,
        filters.dateFrom,
        filters.dateTo,
        filters.sortBy,
        filters.sortOrder,
      ].join("|"),
    [filters],
  );

  const showInitialLoading = isLoading && launches.length === 0;
  const showEmpty = !isLoading && !isError && launches.length === 0;

  const listHeader = (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/60 bg-slate-900/50 px-4 py-3 sm:px-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
          <AppIcon name="rocket" size={16} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-white">
            {compareMode ? "Select missions" : "Mission catalog"}
          </h3>
          <p className="text-xs text-slate-500">
            {compareMode
              ? "Scroll · click a row for slot A or B"
              : "Scroll to browse · load more at the bottom"}
          </p>
        </div>
      </div>
      {typeof totalDocs === "number" && (
        <span className="shrink-0 rounded-full bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-700/80">
          {totalDocs.toLocaleString()} total
        </span>
      )}
    </div>
  );

  if (compareMode) {
    return (
      <div className="space-y-4">
        {showInitialLoading && <LaunchSkeleton count={4} />}

        {isError && (
          <ErrorState
            message={getLaunchesErrorMessage(error)}
            onRetry={() => void refetch()}
          />
        )}

        {showEmpty && (
          <EmptyState
            title="No launches match your search"
            description="Try another mission name or flight number (e.g. #142)."
            icon="🔭"
            action={
              <Button
                variant="secondary"
                onClick={() => setFilters(DEFAULT_LAUNCH_FILTERS)}
              >
                Clear filters
              </Button>
            }
          />
        )}

        {!isError && launches.length > 0 && (
          <section
            aria-label="Launch picker"
            className="compare-launch-picker flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/70 to-slate-950/90 shadow-xl shadow-slate-950/50"
          >
            <CompareLaunchFilters
              filters={filters}
              onChange={setFilters}
              totalDocs={totalDocs}
              isUpdating={isRefetching}
            />

            {listHeader}

            <ScrollableMissionList
              listKey={listKey}
              launches={launches}
              listHeight={listHeight}
              rowProps={rowProps}
              isRefetching={isRefetching}
              onRowsRendered={handleRowsRendered}
              scrollRef={scrollRef}
            />

            <LaunchListFooter
              launchesCount={launches.length}
              totalDocs={totalDocs}
              hasNextPage={Boolean(hasNextPage)}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => void fetchNextPage()}
            />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <LaunchFiltersPanel
        filters={filters}
        onChange={setFilters}
        totalDocs={totalDocs}
        isUpdating={isRefetching}
      />

      {showInitialLoading && <LaunchSkeleton count={6} />}

      {isError && (
        <ErrorState
          message={getLaunchesErrorMessage(error)}
          onRetry={() => void refetch()}
        />
      )}

      {showEmpty && (
        <EmptyState
          title="No launches match your filters"
          description="Try a different mission name, flight number (e.g. #142), date range, or outcome filter."
          icon="🔭"
          action={
            <Button
              variant="secondary"
              onClick={() => setFilters(DEFAULT_LAUNCH_FILTERS)}
            >
              Clear filters
            </Button>
          }
        />
      )}

      {!isError && launches.length > 0 && (
        <section
          aria-label="Launch results"
          className="launch-list-panel flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/60 to-slate-950/80 shadow-xl shadow-slate-950/50"
        >
          {listHeader}

          <ScrollableMissionList
            listKey={listKey}
            launches={launches}
            listHeight={listHeight}
            rowProps={rowProps}
            isRefetching={isRefetching}
            onRowsRendered={handleRowsRendered}
            scrollRef={scrollRef}
          />

          <LaunchListFooter
            launchesCount={launches.length}
            totalDocs={totalDocs}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={() => void fetchNextPage()}
          />
        </section>
      )}
    </div>
  );
});
