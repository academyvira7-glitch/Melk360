const C='m360-v7',A=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>fetch(u,{cache:'reload'}).then(r=>r.ok&&c.put(u,r)).catch(()=>0)))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!='GET'||q.cache=='no-store'||q.cache=='reload')return;const same=new URL(q.url).origin==location.origin;
e.respondWith((async()=>{const c=await caches.open(C),hit=await c.match(q,{ignoreSearch:same}),net=(same?fetch(q.url,{cache:'no-cache'}):fetch(q)).then(r=>{if(r&&(r.ok||r.type=='opaque'))c.put(q,r.clone());return r});e.waitUntil(net.catch(()=>0));if(!hit)return net;return Promise.race([net,new Promise(r=>setTimeout(()=>r(hit),4000))]).catch(()=>hit)})())});
