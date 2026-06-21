// Kill switch — replaces the legacy Vite-era caching service worker.
//
// The old service worker served the app shell with stale-while-revalidate,
// which pinned returning browsers to a cached old build (wrong role view,
// stale UI, mock data) regardless of new deploys. This version unregisters
// itself, purges every cache, and reloads open tabs so no browser stays stuck.
// Browsers automatically re-fetch sw.js on navigation, so existing installs
// pick this up and self-destruct. The app no longer registers any worker.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete all caches created by the previous worker.
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));

      // Unregister this worker so it never controls a page again.
      await self.registration.unregister();

      // Reload any open tabs so they fetch the live build directly.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});

// Pass-through: never serve from cache while we wind down.
self.addEventListener("fetch", () => {});
