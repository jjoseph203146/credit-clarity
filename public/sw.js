const CACHE_NAME = "credit-clarity-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Network-first for page navigations, falling back to a static offline page
// only when the network is genuinely unreachable. Everything else (API
// routes, auth, Stripe, data fetches, Next's own hashed static assets)
// passes straight through uncached — this app is session-gated and
// data-driven, so caching anything beyond this one offline shell page risks
// serving stale or wrong-user content.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
});
