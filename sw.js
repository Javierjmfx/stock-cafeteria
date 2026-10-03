/* Service worker — Stock Cafetería
   Cachea la app completa para que funcione sin conexión.
   Sube el número de VERSION cada vez que reemplaces index.html. */
var VERSION = 'stock-cafe-v5';
var ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png',
  './icon.svg',
  './fonts/inter-latin-400-normal.woff2',
  './fonts/inter-latin-500-normal.woff2',
  './fonts/inter-latin-600-normal.woff2',
  './fonts/inter-latin-700-normal.woff2',
  './fonts/jetbrains-mono-latin-500-normal.woff2',
  './fonts/jetbrains-mono-latin-700-normal.woff2'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){ return c.addAll(ASSETS); })
           .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ if(k!==VERSION) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Estrategia: la red primero para el HTML (así ves cambios al reconectar),
   pero si no hay conexión, tira del caché. El resto: caché primero. */
self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  var esDoc = req.mode === 'navigate' ||
              (req.headers.get('accept')||'').indexOf('text/html') > -1;
  if(esDoc){
    e.respondWith(
      fetch(req).then(function(res){
        var copia = res.clone();
        caches.open(VERSION).then(function(c){ c.put('./index.html', copia); });
        return res;
      }).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match('./'); });
      })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function(r){
        return r || fetch(req).then(function(res){
          var copia = res.clone();
          caches.open(VERSION).then(function(c){ c.put(req, copia); });
          return res;
        }).catch(function(){ return r; });
      })
    );
  }
});
