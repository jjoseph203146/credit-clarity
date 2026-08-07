"use client";

import { useEffect } from "react";

// Registered only in production — in dev this would fight next dev's own
// asset hashing/hot-reload with a stale cache. Silent no-op on browsers
// without service worker support (older Safari, some in-app browsers).
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
