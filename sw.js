/* My Vision service worker: the app opens offline after the first visit.
   Same-origin files and Google Fonts are served from cache and refreshed in the background,
   so a new version shows up the second time the app is opened. */
const CACHE = 'myday-v15';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const font = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !font) return;
  let done;
  e.waitUntil(new Promise(res => { done = res; }));
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r)
      .then(res => (res && (res.ok || res.type === 'opaque')) ? c.put(r, res.clone()).then(() => res, () => res) : res)
      .catch(() => null)
      .then(res => { done(); return res; });
    if (hit) return hit;
    const res = await net;
    if (res) return res;
    if (r.mode === 'navigate') {
      const fb = await c.match('index.html');
      if (fb) return fb;
    }
    return Response.error();
  })());
});
