// EstudoBB Service Worker v7
const CACHE = 'estudobb-v7'
const ASSETS = ['/favicon.svg']

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})))
  self.skipWaiting()
})
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))))
  self.clients.claim()
})
self.addEventListener('fetch', e => {
  if (e.request.url.includes('firebase') || e.request.url.includes('googleapis') || e.request.url.includes('stripe') || e.request.url.endsWith('.html') || e.request.url.endsWith('/app') || e.request.url.endsWith('/')) return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
})
