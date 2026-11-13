// Сканер гостей — работа без интернета.
// После первого открытия все файлы (вместе с распознаванием текста) хранятся в телефоне.
const CACHE = "guest-scanner-v1";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "lib/tesseract.min.js", "lib/worker.min.js",
  "lib/core/tesseract-core-simd-lstm.wasm.js", "lib/core/tesseract-core-lstm.wasm.js",
  "lib/lang/eng.traineddata.gz"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("guest-scanner-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
const timeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const page = req.mode === "navigate" || /\/(index\.html)?$/.test(url.pathname);
  if (page){
    // страница: сначала свежая из сети (до 4 сек), иначе из телефона
    e.respondWith(timeout(fetch(req, {cache: "no-cache"}), 4000)
      .then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); } return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // остальное (распознавание, иконки): из телефона, если есть
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(r => r || fetch(req).then(res => {
    if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  })));
});
