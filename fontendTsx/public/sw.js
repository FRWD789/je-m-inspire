// ==========================================
// SERVICE WORKER - VERSION CORRIGÉE
// ==========================================
// Empêche le cache des requêtes POST
// Optimise le cache pour les assets statiques

const CACHE_VERSION = 'v2';
const CACHE_NAME = `jminspire-cache-${CACHE_VERSION}`;

// Assets à mettre en cache immédiatement
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/img/logo.png',
  '/assets/img/logo-white.png',
];

// ==========================================
// INSTALLATION - Mise en cache initiale
// ==========================================
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('❌ Erreur cache initial:', error);
      });
    })
  );
  
  // Activer immédiatement le nouveau SW
  self.skipWaiting();
});

// ==========================================
// ACTIVATION - Nettoyage des anciens caches
// ==========================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Prendre contrôle immédiatement
  return self.clients.claim();
});

// ==========================================
// FETCH - Gestion des requêtes réseau
// ==========================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ✅ CRITIQUE: Ne JAMAIS cacher les requêtes POST/PUT/DELETE
  if (request.method !== 'GET') {
    return; // Laisser passer sans intervenir
  }

  // Ne pas cacher les requêtes API
  if (url.pathname.startsWith('/api/')) {
    return; // Laisser passer sans cache
  }

  // Stratégie de cache pour les assets statiques
  event.respondWith(handleRequest(request));
});

// ==========================================
// GESTION DES REQUÊTES AVEC CACHE
// ==========================================
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Stratégie différente selon le type de ressource
  if (isImageRequest(url)) {
    return cacheFirstStrategy(request);
  } else if (isStaticAsset(url)) {
    return cacheFirstStrategy(request);
  } else {
    return networkFirstStrategy(request);
  }
}

// ==========================================
// STRATÉGIE: Cache d'abord (images, fonts, CSS, JS)
// ==========================================
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
     
      return cachedResponse;
    }

    
    const networkResponse = await fetch(request);

    // Mettre en cache seulement si succès
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    
    
    // Fallback vers le cache même si réseau échoue
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// ==========================================
// STRATÉGIE: Réseau d'abord (HTML, données)
// ==========================================
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Mettre à jour le cache si succès
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ Réseau inaccessible, fallback cache:', request.url);
    
    // Fallback vers le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// ==========================================
// HELPERS - Détection types de ressources
// ==========================================
function isImageRequest(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.otf', '.eot'];
  return staticExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

// ==========================================
// MESSAGE HANDLER - Communication avec le client
// ==========================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

