/* Lavame x Fa — service worker */
const CACHE = 'lxf-v1';
const ASSETS = ['/manual.html','/manifest.json','/icon-192.png','/icon-512.png','/apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isHTML) {
    // network-first so updates show when online; cache fallback offline
    e.respondWith(
      fetch(req).then(res => { const cl = res.clone(); caches.open(CACHE).then(c => c.put(req, cl)); return res; })
                .catch(() => caches.match(req).then(c => c || caches.match('/manual.html')))
    );
  } else if (url.origin === location.origin) {
    // cache-first for same-origin assets (icons, manifest)
    e.respondWith(caches.match(req).then(c => c || fetch(req).then(res => { const cl = res.clone(); caches.open(CACHE).then(ca => ca.put(req, cl)); return res; })));
  }
});
