const APP_CACHE_VERSION = "naij-v2026-06-12-placeholder-cleanup";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== APP_CACHE_VERSION)
            .map((key) => caches.delete(key)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", () => {
  // Network-first by default. This service worker enables installability
  // without adding stale caching behaviour to the restaurant directory.
});
