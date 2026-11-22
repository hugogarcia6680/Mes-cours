/* MesCours : fonctionne sans internet.
   Si internet marche, on prend la dernière version (pour recevoir les mises à jour).
   Si internet est lent ou coupé, on ouvre la copie enregistrée sur l'iPad. */
const CACHE='mescours-v2';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const page=r.mode==='navigate'||/\.html$|\/$/.test(new URL(r.url).pathname);
  const net=(page?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r)).then(res=>{if(res.ok)cache.put(page?'./index.html':r,res.clone());return res});
  const cached=page?await cache.match('./index.html'):await cache.match(r,{ignoreSearch:true});
  if(!cached)return net;
  const slow=new Promise(res=>setTimeout(()=>res(cached),3000));
  try{return await Promise.race([net,slow])}catch(err){return cached}
 })());
});
