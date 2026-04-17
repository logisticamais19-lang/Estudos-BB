// frontend/sw.js
// Service Worker — cache apenas de assets estáticos, nunca de dados do usuário

const CACHE_NAME  = 'estudobb-v1';
const CACHE_URLS  = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Domínios que NUNCA devem ser cacheados (dados sensíveis)
const NO_CACHE_HOSTS = [
  'firestore.googleapis.com',
  'firebase.googleapis.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'apis.google.com'
];

function isNoCacheRequest(url) {
  try {
    const u = new URL(url);
    return NO_CACHE_HOSTS.some(h => u.hostname.includes(h));
  } catch {
    return false;
  }
}

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Só processa GET
  if (e.request.method !== 'GET') return;

  // Firebase/Auth — nunca cacheia
  if (isNoCacheRequest(e.request.url)) return;

  // Dados do usuário (Firestore paths) — nunca cacheia
  if (e.request.url.includes('/users/') || e.request.url.includes('/data/')) return;

  // Estratégia: Network First → fallback para cache
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Só cacheia respostas válidas de assets estáticos
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
