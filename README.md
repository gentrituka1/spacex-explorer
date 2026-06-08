# SpaceX Explorer

A frontend SpaceX mission explorer built with **Next.js (App Router)**, **React**, **TypeScript**, and the [Launch Library 2 API](https://thespacedevs.com/llapi) (SpaceX data). The original [SpaceX API v4](https://github.com/r-spacex/SpaceX-API) is archived and no longer updated; this app uses LL2 via a cached Next.js proxy.

## How to run

```bash
npm install
npm run dev    # http://localhost:3000
npm run build
npm start
npm run lint
```

Requires **Node.js 18+**.

## Features

| Route | Description |
|-------|-------------|
| `/` | Home — overview of app capabilities and quick navigation |
| `/launches` | Paginated launch list with filters, search, infinite scroll |
| `/launches/[id]` | Launch detail — rocket, launchpad, payloads, cores, Flickr gallery |
| `/favorites` | Saved launches (persisted in `localStorage` via Zustand) |
| `/stats` | Launch analytics — preset charts plus a user-configurable dashboard |
| `/compare` | Side-by-side comparison of two launches with shareable URL (`?a=&b=`) |

### Must-have requirements (spec)

| Requirement | Status |
|-------------|--------|
| Next.js + TypeScript (App Router) | Done |
| Strong TypeScript types (no `any` in core logic) | Done |
| `POST /launches/query` — server-side pagination, filter, sort | Done (via LL2 GET + query params, same UX) |
| Filters: upcoming/past, success/failure, date range | Done |
| Sort by date / name | Done |
| Search by mission name | Done (+ flight number: `142`, `#142`, `flight 142`) |
| Infinite scroll / Load more | Done |
| Skeletons, error states, retry | Done |
| Launch detail with rocket + launchpad fetched by ID | Done |
| Flickr image gallery | Done |
| Favorites in LocalStorage + favorites page | Done (Zustand persist) |
| React Query (TanStack Query) for cache / dedupe | Done |
| Retry / backoff for 429 and 5xx | Done (`src/lib/api/client.ts`) |
| Virtualized long lists (`react-window`) | Done |
| Memoized list rows and expensive selectors | Done |
| Loading, empty, error UX; responsive layout | Done |
| Semantic HTML, labels, keyboard nav, ARIA | Done (see Accessibility) |

### Optional bonuses (spec)

| Bonus | Status |
|-------|--------|
| Charts (launches per year / success rate) | Done — Recharts + custom chart builder on `/stats` |
| Compare two launches side-by-side | Done — `/compare` with diff highlighting |
| Shareable compare URL | Done — `?ids=<id1>,<id2>` synced to selection |
| Offline / service worker for favorites + cached lists | Done — `public/sw.js` caches `/api/ll2` + app shell; favorites in Zustand/`localStorage` |
| SSR/SSG for list or detail with hydration | Done — ISR + React Query dehydration on `/launches` (5m) and `/launches/[id]` (1h) |
| Optional `GET /payloads/:id`, `GET /cores/:id` | Not used — payload/core data comes from the launch document embedded fields |

## Architecture decisions

### App Router (not Pages Router)

**Choice:** App Router (`src/app/`).

**Why:**

- Route-based layouts (`layout.tsx`) for shared shell (header, providers, background).
- Colocated `loading.tsx` / `error.tsx` patterns where useful.
- `generateMetadata` on dynamic routes fetches launch name/details server-side for SEO.
- Client islands (`"use client"`) only where interactivity, React Query, or browser APIs are needed.

**SSR/ISR tradeoffs:**

- **`/launches`** prefetches the default-filter first page on the server (`revalidate: 300`) and dehydrates into TanStack Query — faster first paint, no skeleton flash for the initial list. Filter changes still fetch client-side (filters are not in the URL).
- **`/launches/[id]`** prefetches launch + rocket + launchpad on the server (`revalidate: 3600`) with real mission metadata. Gallery, favorites, and animations hydrate on the client.
- **Why not full SSG for every launch?** SpaceX has hundreds of missions; prebuilding all IDs at build time would slow CI and stale quickly. On-demand ISR per `[id]` is a better fit.
- **Why keep client components?** Infinite scroll, filters, compare picker, and Zustand persistence need browser APIs; server components handle the initial data layer only.

### TanStack Query (not SWR or raw fetch)

**Choice:** `@tanstack/react-query`.

**Why:**

- Built-in cache keys, deduplication, stale-while-revalidate, and `useInfiniteQuery` for pagination.
- Plays well with client components and Zustand without prop drilling.
- Query-level retry integrates with our `ApiError` wrapper.

**Config:** 60s `staleTime`, 5min `gcTime`, limited retries for non-retryable errors (`src/components/providers/QueryProvider.tsx`).

### Zustand (not React Context)

**Choice:** Zustand with `persist` middleware for favorites, toast notifications, and stats chart layout.

**Why:** Avoids Context re-render issues (especially on favorites pages), gives simple selectors, and persists favorites/stats to `localStorage` with a migration path from the legacy `spacex-favorites` key.

### Styling

**Tailwind CSS v4** with shared UI primitives (`Button`, `Badge`, `Card`, `AppIcon`, `ToastHost`) and **Framer Motion** for page/section transitions.

## SpaceX API usage

**Data source:** [Launch Library 2 (LL2)](https://ll.thespacedevs.com/2.3.0/) — filtered to SpaceX (`lsp__name=SpaceX`). The legacy `api.spacexdata.com` API was archived by its maintainer and is read-only/stale; LL2 is the community-recommended successor with ongoing updates.

**Proxy:** Browser requests go through `/api/ll2/*` (Next.js route handler with 5-minute ISR cache) to reduce rate-limit pressure. Server-side prefetch calls LL2 directly.

| Endpoint | Usage |
|----------|--------|
| `GET /launches/` (+ `/upcoming/`, `/previous/`) | Paginated SpaceX launch list with filters |
| `GET /launches/:id/` | Launch detail (`mode=detailed`) |
| `GET /launcher_configurations/:id/` | Rocket specs on detail + compare |
| `GET /pads/:id/` | Pad info on detail + compare |
| `GET /launcher_configurations/`, `GET /pads/` | Lookup maps for stats charts |

Filter building lives in `src/lib/api/ll2/query-params.ts`:

- Upcoming/past via dedicated LL2 endpoints; success via `status__ids`.
- Date range on `net__gte` / `net__lte`; search via `search` or `agency_launch_attempt_count`.
- Sort: `ordering=-net` or `-name`.
- Pagination: `limit` + `offset` mapped to the app's page model.

Response mapping to the app's domain types: `src/lib/api/ll2/mappers.ts`.

Optional env: `LL2_API_BASE` (defaults to `https://ll.thespacedevs.com/2.3.0`). Use `https://lldev.thespacedevs.com/2.3.0` only for local experimentation.

HTTP layer (`src/lib/api/client.ts`): exponential backoff (500ms base, 3 retries) on **429** and **5xx**, plus network failures.

## Project structure

```
src/
  app/                    # Routes (App Router)
  components/
    home/                 # Landing page
    launches/             # List, filters, virtualization
    launch-detail/        # Detail view + gallery
    favorites/
    stats/                # Charts + dashboard builder
    compare/              # Picker, selection bar, diff view
    layout/               # Header, PageHero, background
    providers/            # QueryProvider, StoreHydrator, service worker, offline UI
    ui/                   # Shared primitives, icons, toasts
  hooks/                  # React Query hooks
  lib/
    api/                  # Typed API clients
    launch-query.ts       # Query/sort builders
    query-options.ts      # Shared TanStack Query keys + server prefetch helpers
    stats-*.ts            # Chart config + aggregation
  stores/                 # Zustand (favorites, toasts, stats charts)
  types/spacex.ts         # API types
```

## Performance

- **Virtualization:** `react-window` `List` for launch rows — only visible rows mount.
- **Memoization:** `LaunchRow`, filter panels, and chart components use `memo` where re-renders were costly.
- **Pagination:** Server-side via `/launches/query`; client accumulates pages through infinite query.
- **Caching:** TanStack Query prevents duplicate in-flight requests; stats prefetch rockets/pads once per session.
- **SSR hydration:** Default launch list and launch detail prefetch on the server via `HydrationBoundary`.
- **Offline:** Service worker (`public/sw.js`) stale-while-revalidates SpaceX API responses and network-first caches the app shell. Favorites are always available offline via Zustand persist.
- **Images:** Next.js `Image` where applicable; Flickr gallery uses native `<img>` with lazy loading.

## Accessibility

- Skip link to main content (`layout.tsx`).
- Semantic landmarks: `<header>`, `<main>`, `<nav>`, `<section>`.
- Form controls with `<label>` / `aria-label` on icon-only buttons (favorites, gallery prev/next).
- Keyboard: gallery arrow keys; focusable interactive elements; visible focus rings.
- `aria-live` regions for toasts and dynamic compare selection state.
- Reduced-motion-friendly animations (respects `prefers-reduced-motion` where configured).

## Tradeoffs & what I'd do next

**Current tradeoffs:**

1. **Filter state is client-only** — Changing filters refetches client-side; only the default list is server-prefetched.
2. **Stats charts** — Aggregate from paginated `/launches/query` calls (capped page loop) rather than a dedicated analytics endpoint; good enough for demo scale.
3. **Compare picker** — Simplified filters (search + timeline/outcome) vs full date-range panel on `/launches`; keeps the picker focused.
4. **Service worker is production-only** — Registered after `npm run build && npm start`; dev mode skips SW to avoid stale cache during development.
5. **Offline API cache is best-effort** — Only previously fetched launches/rockets/pads are available offline; uncached endpoints return 503.

**With more time:**

- URL-synced filter state on `/launches` for shareable filtered views.
- Fetch optional `/payloads/:id` for richer payload metadata when IDs are present.
- E2E tests (Playwright) for critical flows: list pagination, favorites, compare URL, offline cache.
- Open Graph images per launch using `links.patch.small`.
- `generateStaticParams` for the most recent N launches to warm the CDN at deploy time.

## Known limitations / TODOs

- [ ] Launch list filters are not reflected in the URL (compare selection is).
- [ ] Service worker registers only in production builds.
- [ ] Stats aggregation may require multiple paginated API calls for full history; very large datasets could be slow.
- [ ] Saved favorites from the old API use MongoDB-style IDs and won't match LL2 UUIDs — re-favorite missions after migration.
- [ ] LL2 free tier rate limit is 15 requests/hour on the upstream API; the proxy cache mitigates this but heavy stats usage can still hit limits.
- [ ] Optional `/payloads/:id` and `/cores/:id` endpoints unused — embedded launch fields are sufficient for current UI.
