const CACHE_VERSION = "v1";
const API_CACHE = `spacex-api-${CACHE_VERSION}`;
const APP_CACHE = `spacex-app-${CACHE_VERSION}`;
const API_ORIGIN = "https://api.spacexdata.com";
const MAX_API_ENTRIES = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              (key.startsWith("spacex-api-") || key.startsWith("spacex-app-")) &&
              !key.endsWith(CACHE_VERSION),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

async function cacheKeyForRequest(request) {
  if (request.method === "GET") {
    return request.url;
  }

  const body = await request.clone().text();
  return `${request.url}#post-${hashString(body)}`;
}

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length <= MAX_API_ENTRIES) {
    return;
  }

  const excess = keys.length - MAX_API_ENTRIES;
  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)));
}

async function staleWhileRevalidateApi(request) {
  const cache = await caches.open(API_CACHE);
  const cacheKey = await cacheKeyForRequest(request);
  const cached = await cache.match(cacheKey);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(cacheKey, response.clone());
        await trimCache(cache);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => undefined);
    return cached;
  }

  const networkResponse = await networkPromise;
  if (networkResponse) {
    return networkResponse;
  }

  return Response.json(
    { message: "Offline — no cached data for this request." },
    { status: 503, statusText: "Service Unavailable" },
  );
}

async function networkFirstApp(request) {
  const cache = await caches.open(APP_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok && request.method === "GET") {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    if (request.mode === "navigate") {
      const fallback = await cache.match("/");
      if (fallback) {
        return fallback;
      }
    }

    throw new Error("Offline and no cached response.");
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === API_ORIGIN) {
    event.respondWith(staleWhileRevalidateApi(request));
    return;
  }

  if (url.origin === self.location.origin && request.method === "GET") {
    event.respondWith(networkFirstApp(request));
  }
});
