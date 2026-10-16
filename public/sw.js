// Service worker: makes the app work offline (M1, D-42).
// Static file, works on any host. Assets are cached as they are fetched;
// the page also sends the list of files it already loaded ("warm"), so the
// very first visit is enough to work offline.

const CACHE = "ig-layout-v1";
const SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function sameOrigin(url) {
  return new URL(url, self.location.href).origin === self.location.origin;
}

function putInCache(request, response) {
  if (response.ok && response.type === "basic") {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "warm") return;
  const urls = (event.data.urls || []).filter(sameOrigin);
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        urls.map((url) => cache.match(url).then((hit) => hit || cache.add(url))),
      ).then(() => event.ports[0]?.postMessage("warmed")),
    ),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !sameOrigin(request.url)) return;

  // Pages: network first (picks up new deploys), cached shell when offline.
  // Only the app itself ("/") is kept as the offline shell — other pages (e.g. /labs/)
  // must not replace it.
  if (request.mode === "navigate") {
    const isApp = new URL(request.url).pathname === "/";
    event.respondWith(
      fetch(request)
        .then((response) => (isApp ? putInCache("/", response) : response))
        .catch(() => caches.match(isApp ? "/" : request).then((hit) => hit || caches.match("/"))),
    );
    return;
  }

  // Everything else: cache first. Next.js asset names are content-hashed.
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => putInCache(request, response))),
  );
});
