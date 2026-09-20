const CACHE='nresolve-v1-0-86';
self.addEventListener('install',event=>{self.skipWaiting();});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const u=new URL(event.request.url);
  if(u.hostname.includes('supabase.co'))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(event.request,c));return r;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('./'))));
  }
});
self.addEventListener('push',event=>{
  let data={}; try{data=event.data?event.data.json():{}}catch(_){data={body:event.data?event.data.text():'Nova atualização no sistema.'}}
  const title=data.title||'N Resolve';
  const options={body:data.body||'Há uma nova atualização no sistema.',icon:data.icon||'./icon-192.png',badge:data.badge||'./icon-192.png',tag:data.tag||'nresolve',data:{url:data.url||'./'}};
  event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close(); const url=event.notification.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus' in c){c.navigate(url);return c.focus();}}return clients.openWindow(url);}));
});
