const CACHE='nresolve-shell-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});

// Navegação: sempre tenta a versão atual do site; cache só serve de contingência offline.
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const fresh=await fetch(req,{cache:'no-store'});
        const c=await caches.open(CACHE); c.put(req,fresh.clone());
        return fresh;
      }catch(e){
        return (await caches.match(req)) || (await caches.match('./')) || Response.error();
      }
    })());
  }
});

// Mantém compatibilidade com Web Push.
self.addEventListener('push',event=>{
  let data={};
  try{data=event.data?event.data.json():{}}catch(e){data={body:event.data?event.data.text():''}}
  const title=data.title||data.titulo||'N Resolve';
  const options={
    body:data.body||data.mensagem||'Você recebeu um novo alerta.',
    data:{url:data.url||data.link||'./'},
    tag:data.tag||'nresolve-alerta',
    renotify:true
  };
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=(event.notification.data&&event.notification.data.url)||'./';
  event.waitUntil((async()=>{
    const all=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of all){
      if('focus' in c){ await c.focus(); try{c.navigate(target)}catch(e){} return; }
    }
    if(clients.openWindow)return clients.openWindow(target);
  })());
});
