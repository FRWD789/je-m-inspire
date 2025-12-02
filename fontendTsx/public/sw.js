const CACHE_NAME = 'jminspire-v1';
const STATIC_CACHE = 'jminspire-static-v1';
const IMAGE_CACHE = 'jminspire-images-v1';

// Fichiers critiques à mettre en cache lors de l'installation
const STATIC_FILES = [
  '/',
  '/assets/img/bg-hero.avif',
  // Ajoute ici les assets critiques
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker: Installation');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('📦 Service Worker: Mise en cache des fichiers statiques');
      return cache.addAll(STATIC_FILES);
    })
  );
  
  // Force l'activation immédiate
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker: Activation');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            // Supprimer les anciens caches
            return name !== STATIC_CACHE && 
                   name !== IMAGE_CACHE && 
                   name !== CACHE_NAME;
          })
          .map((name) => {
            console.log('🗑️ Service Worker: Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Prendre le contrôle immédiatement
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Stratégie pour les images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) {
    event.respondWith(handleImageRequest(event.request));
    return;
  }
  
  // Stratégie pour les autres fichiers
  event.respondWith(handleRequest(event.request));
});

// Gestion des requêtes d'images (Cache First)
async function handleImageRequest(request) {
  try {
    // 1. Chercher dans le cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📸 Cache HIT:', request.url);
      return cachedResponse;
    }
    
    // 2. Sinon, fetch depuis le réseau
    console.log('🌐 Cache MISS:', request.url);
    const response = await fetch(request);
    
    // 3. Mettre en cache si succès
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ Erreur fetch image:', error);
    // Retourner une image placeholder en cas d'erreur
    return new Response('Image non disponible', { status: 404 });
  }
}

// Gestion des autres requêtes (Network First avec fallback cache)
async function handleRequest(request) {
  try {
    // 1. Essayer le réseau d'abord
    const response = await fetch(request);
    
    // 2. Mettre en cache si succès
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 3. Fallback sur le cache si erreur réseau
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Fallback cache:', request.url);
      return cachedResponse;
    }
    
    // 4. Si rien dans le cache non plus
    console.error('❌ Aucune réponse disponible:', error);
    return new Response('Contenu non disponible hors ligne', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}