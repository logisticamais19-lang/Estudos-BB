// EstudoBB Service Worker v6
const CACHE = 'estudobb-v6'
const ASSETS = ['/', '/app', '/app.html', '/favicon.svg']

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {}))
  )
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', e => {
  // Nunca cacheia Firebase
  if (e.request.url.includes('firebase') ||
      e.request.url.includes('googleapis') ||
      e.request.url.includes('stripe')) return

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
})
