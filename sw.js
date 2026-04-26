const CACHE_NAME='estudobb-pwa-v2';
const OFFLINE_URL='/app';
const PRECACHE=[
  '/app',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(c=>c.addAll(PRECACHE))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(
      fetch(e.request).catch(()=>caches.match(OFFLINE_URL))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      if(res&&res.status===200&&res.type==='basic'){
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
      }
      return res;
    }))
  );
});
