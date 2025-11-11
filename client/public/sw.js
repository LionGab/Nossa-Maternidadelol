const CACHE_NAME = 'nossa-maternidade-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
];

// Instalar service worker e cachear arquivos estáticos
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[Service Worker] Cacheando arquivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('[Service Worker] Erro ao cachear:', error);
      })
  );
  self.skipWaiting();
});

// Ativar service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Removendo cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Estratégia: Network First, com fallback para cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorar requisições não-HTTP
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estratégia diferente para API vs recursos estáticos
  if (request.url.includes('/api/')) {
    // API: Network First (sempre tenta rede primeiro)
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clonar resposta antes de retornar
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Se falhar, tenta cache
          return caches.match(request);
        })
    );
  } else {
    // Recursos estáticos: Cache First
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Só cachear respostas válidas
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              
              return response;
            })
            .catch(() => {
              // Fallback para página offline para navegação
              if (request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
            });
        })
    );
  }
});

// Push notifications (preparado para futuro)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova mensagem!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Nossa Maternidade', options)
  );
});

// Notificação clicada
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
