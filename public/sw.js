// sw.js — offline support (build 002). App shell + static assets are cached; /api/* is never cached.
const V='lex-b002';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['/','/favicon.svg','/manifest.webmanifest'])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put('/',c));return x;}).catch(()=>caches.match('/')));return;}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c));}return x;})));
});
