/* MesCours : fonctionne sans internet.
   Si internet marche, on prend la dernière version (pour recevoir les mises à jour).
   Si internet est lent ou coupé, on ouvre la copie enregistrée sur l'iPad. */
const CACHE='mescours-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;
 if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const net=fetch(r).then(res=>{if(res.ok)cache.put(r,res.clone());return res});
  const cached=(await cache.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await cache.match('./index.html'):null);
  if(!cached)return net;
  const slow=new Promise(res=>setTimeout(()=>res(cached),3000));
  try{return await Promise.race([net,slow])}catch(err){return cached}
 })());
});
