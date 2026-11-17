/* Service worker: tiene l'app disponibile anche senza rete.
   La pagina si prende sempre dalla rete quando c'e', cosi' gli aggiornamenti arrivano subito. */
const V='bab-567793def6';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin!==location.origin) return;            /* le chiamate al database passano diritte */
  if(r.mode==='navigate'||u.pathname.endsWith('/index.html')){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(c2=>c2.put('./index.html',c));return res;})
      .catch(()=>caches.match('./index.html').then(x=>x||caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    if(res&&res.status===200){const c=res.clone();caches.open(V).then(c2=>c2.put(r,c));}
    return res;
  })));
});
