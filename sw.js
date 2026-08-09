// service-worker.js
//
// ESTE ES EL ARCHIVO QUE CAMBIA CADA VEZ QUE ACTUALIZÁS EL JUEGO.
// Subí esta única línea (CACHE_VERSION) cada vez que subas una versión
// nueva del juego -- con eso alcanza para que a tu hermano/primo les
// aparezca el aviso de actualización solos, sin que les tengas que
// volver a mandar nada.
const CACHE_VERSION = 'pvp-ima-v4'; // <-- subí este número en cada actualización (v2, v3, v4...)

const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Al instalar la versión nueva, la descarga y la deja lista aparte
// (todavía no reemplaza la que está activa).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_FILES))
  );
  self.skipWaiting(); // no espera a que se cierren todas las pestañas viejas
});

// Al activarse, borra las versiones de caché VIEJAS (de actualizaciones
// anteriores) -- así nunca queda pegado sirviendo contenido antiguo.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Estrategia "red primero": SIEMPRE intenta traer la versión más
// nueva de internet primero. Si el teléfono está sin señal, recién
// ahí usa lo que tenga guardado en caché. Esto es lo que hace que la
// actualización se note apenas la subís, en vez de quedar pegado con
// una copia vieja guardada.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
