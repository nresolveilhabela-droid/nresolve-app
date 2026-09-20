const CACHE='nresolve-v197';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
   for(const k of await caches.keys()) if(k!==CACHE) await caches.delete(k);
   await self.clients.claim();
 })());
});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.mode==='navigate'){
   event.respondWith((async()=>{
     try{
       const r=await fetch(event.request,{cache:'no-store'});
       const c=await caches.open(CACHE); await c.put(event.request,r.clone()); return r;
     }catch(e){return (await caches.match(event.request))||(await caches.match('./'))||Response.error()}
   })());
 }
});
self.addEventListener('push',event=>{
 let d={};
 try{d=event.data?event.data.json():{}}catch(e){d={body:event.data?event.data.text():''}}
 const title=d.title||d.titulo||(d.notification&&d.notification.title)||'N Resolve';
 const body=d.body||d.mensagem||(d.notification&&d.notification.body)||'Você recebeu um novo alerta.';
 const url=d.url||d.link||(d.data&&d.data.url)||'./';
 event.waitUntil(self.registration.showNotification(title,{
   body,
   data:{url},
   tag:d.tag||'nresolve-'+Date.now(),
   renotify:true,
   requireInteraction:false
 }));
});
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const url=(event.notification.data&&event.notification.data.url)||'./';
 event.waitUntil((async()=>{
   const wins=await clients.matchAll({type:'window',includeUncontrolled:true});
   for(const w of wins){if('focus'in w){await w.focus();try{await w.navigate(url)}catch(e){}return}}
   if(clients.openWindow)return clients.openWindow(url);
 })());
});
