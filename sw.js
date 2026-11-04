// TM Bazar — работа как приложение на телефоне.
// Страница всегда берётся свежей из сети (с проверкой обновления), а без интернета — из сохранённой копии.
// Запросы к серверу (товары, чат, вход) не кешируются.
const CACHE = "tm-bazar-v31";
const SHELL = ["./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // страница и списки (index.html, models.json) — всегда сверяем с сервером, чтобы обновления приходили сразу
  const fresh = req.mode === "navigate" || /\/(index\.html|models\.json)?$/.test(new URL(req.url).pathname) || /\.json$/.test(new URL(req.url).pathname);
  e.respondWith(
    fetch(req, fresh ? {cache: "no-cache"} : undefined)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});
