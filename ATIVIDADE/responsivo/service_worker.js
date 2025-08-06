// ===== SERVICE WORKER PARA PWA =====
const CACHE_NAME = 'imc-calculator-v1.0.0';
const STATIC_CACHE_URLS = [
    '/',
    '/styles.css',
    '/manifest.json'
];

// ===== INSTALAÇÃO =====
self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .then(() => {
                console.log('Service Worker: Arquivos em cache');
                return self.skipWaiting();
            })
    );
});

// ===== ATIVAÇÃO =====
self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Ativo');
            return self.clients.claim();
        })
    );
});

// ===== INTERCEPTAÇÃO DE REQUESTS =====
self.addEventListener('fetch', event => {
    // Estratégia: Cache First para recursos estáticos
    if (STATIC_CACHE_URLS.includes(new URL(event.request.url).pathname)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log('Service Worker: Servindo do cache:', event.request.url);
                        return response;
                    }
                    
                    console.log('Service Worker: Buscando da rede:', event.request.url);
                    return fetch(event.request)
                        .then(response => {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseClone));
                            return response;
                        });
                })
                .catch(() => {
                    console.log('Service Worker: Falha ao buscar:', event.request.url);
                    // Fallback para página offline (futuro)
                    // return caches.match('/offline.html');
                })
        );
    }
    // Estratégia: Network First para API calls
    else if (event.request.url.includes('/calcular-imc') || event.request.url.includes('/tabela-imc')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => cache.put(event.request, responseClone));
                    }
                    return response;
                })
                .catch(() => {
                    console.log('Service Worker: API offline, tentando cache');
                    return caches.match(event.request);
                })
        );
    }
});

// ===== BACKGROUND SYNC (futuro) =====
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync');
        // Implementar sincronização em background
    }
});

// ===== PUSH NOTIFICATIONS (futuro) =====
self.addEventListener('push', event => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '1'
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Ver detalhes',
                    icon: '/check.png'
                },
                {
                    action: 'close',
                    title: 'Fechar',
                    icon: '/xmark.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification('Calculadora IMC', options)
        );
    }
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// ===== UPDATE AVAILABLE =====
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('Service Worker: Pulando espera para atualização');
        self.skipWaiting();
    }
});