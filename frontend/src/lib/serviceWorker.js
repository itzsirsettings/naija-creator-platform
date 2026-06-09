// Service worker registration. No-op in dev; registers a small cache-first SW in production.

export function installServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((error) => {
        // Silent failure — the site still works without a SW
        console.warn("[tehilla] service worker registration failed", error);
      });
  });
}
