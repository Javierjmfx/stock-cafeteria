/* Service worker — Stock cafetería
   Guarda la app en el móvil para que funcione sin conexión.
   Sube VERSION cada vez que cambies index.html. */
const VERSION = 'stock-cafe-v4.0';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './archivo.woff2',
  './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
/* HTML: red primero (ves los cambios al reconectar) y, sin conexión, la copia guardada.
   Resto: caché primero. Nunca se cachea nada de otros dominios ni archivos .json. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.endsWith('.json')) return;
  const esDoc = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (esDoc){
    e.respondWith(fetch(req).then(res => {
      if (res.ok){ const copia = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copia)); }
      return res;
    }).catch(() => caches.match('./index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok){ const copia = res.clone(); caches.open(VERSION).then(c => c.put(req, copia)); }
    return res;
  })));
});
