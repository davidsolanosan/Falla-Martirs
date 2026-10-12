const CACHE_NAME = 'falla-martirs-v2';
const PRECACHE_URLS = ['/', '/manifest.json'];

// Instalación: precache tolerante a fallos (un 404 no aborta todo)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url))
      ))
  );
  self.skipWaiting();
});

// Activación: limpiar caches antiguos (incluido el v1 corrupto)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpiando cache antiguo', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Solo recursos del propio origen: nunca cachear llamadas a
  // Supabase u otras APIs externas (datos vivos, no estáticos)
  if (url.origin !== self.location.origin) return;

  // Assets hasheados de Vite (/assets/index-HASH.js): inmutables,
  // cache-first — si están en cache son válidos para siempre
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navegación y resto (incluye index.html): network first.
  // Online siempre baja la versión nueva; el cache solo es fallback offline.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(response => response || caches.match('/'));
      })
  );
});
