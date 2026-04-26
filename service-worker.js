// Service Worker para PWA - Caching Strategy: Cache First, falling back to Network
const CACHE_NAME = 'quiz-app-v5';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './preguntas.json',
  './js/config.js',
  './js/data.js',
  './js/dom.js',
  './js/state.js',
  './js/controller/index.js',
  './js/controller/quizInitializer.js',
  './js/controller/quizFlow.js',
  './js/controller/answerValidator.js',
  './js/controller/storageManager.js',
  './js/render/index.js',
  './js/render/renderUI.js',
  './js/render/renderQuestion.js',
  './js/render/renderResults.js',
  './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cacheando archivos de la app...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch((error) => {
        console.warn('⚠️ Error durante el cache:', error);
      })
  );
  // Fuerza activación inmediata
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Limpia caches antiguos
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Toma control inmediato de clientes
  self.clients.claim();
});

// Fetch - Strategy: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo cachear requests GET
  if (request.method !== 'GET') {
    return;
  }

  // No cachear requests a dominios externos
  if (url.origin !== self.location.origin) {
    return;
  }

  // Para preguntas.json priorizamos red para no quedarnos con datos antiguos.
  if (url.pathname.endsWith('/preguntas.json')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('✅ Sirviendo desde cache:', request.url);
          return response;
        }

        return fetch(request)
          .then((networkResponse) => {
            // No cachear respuestas no-ok
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Cachear la respuesta
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            console.warn('❌ Fetch fallido para:', request.url);
            // Sirve una página offline si está disponible
            if (request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Sin conexión', { status: 503 });
          });
      })
  );
});

// Sincronización en background (opcional - para futuras mejoras)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-preguntas') {
    event.waitUntil(
      // Aquí iría la lógica de sincronización
      Promise.resolve()
    );
  }
});

// Push notifications (opcional - para futuras mejoras)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nueva notificación del Quiz',
    icon: './manifest.json',
    badge: './manifest.json',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Quiz OP', options)
  );
});
