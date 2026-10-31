const C='m360-v6',A=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>0)))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!='GET')return;const same=new URL(q.url).origin==location.origin;
e.respondWith(caches.match(q,{ignoreSearch:same}).then(hit=>{const net=fetch(q).then(r=>{if(r&&(r.ok||r.type=='opaque')){const x=r.clone();caches.open(C).then(c=>c.put(q,x))}return r});
if(!same)return hit||net;return hit?Promise.race([net,new Promise(r=>setTimeout(()=>r(hit),2500))]).catch(()=>hit):net}))});
