/* Afër Fëmijës — service worker (vetëm asete statike; HTML gjithmonë nga rrjeti) */
const VERSION = "afer-femijes-v9-no-html-cache";
const CORE_CACHE = `${VERSION}-core`;

const CORE_ASSETS = ["/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.startsWith("afer-femijes") ? caches.delete(k) : undefined))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Next.js chunks & CSS — gjithmonë nga rrjeti (mos cache-o).
  if (url.pathname.startsWith("/_next/")) return;

  const accept = request.headers.get("accept") || "";
  const isDocument =
    request.mode === "navigate" || accept.includes("text/html");

  // HTML: vetëm rrjeti — shmang HTML të vjetër pa CSS.
  if (isDocument) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(
            "<!DOCTYPE html><html lang='sq'><body style='font-family:system-ui;padding:24px'><h1>Offline</h1><p>Lidhu me internet dhe rifresko faqen (Ctrl+Shift+R).</p></body></html>",
            {
              status: 503,
              headers: { "Content-Type": "text/html; charset=utf-8" },
            },
          ),
      ),
    );
    return;
  }

  // Imazhe / manifest: network-first, cache vetëm përgjigje të suksesshme.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CORE_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});
