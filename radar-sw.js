// M.A.T · Radar: service worker mínimo, solo para mostrar el aviso de avistamiento del navegador (no guarda nada en caché).
self.addEventListener('install',function(){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('notificationclick',function(e){ e.notification.close(); var h=e.notification.data&&e.notification.data.h;
  var url=new URL('./#/radar'+(h?'?h='+h:''),self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(cs){ for(var i=0;i<cs.length;i++){ if(cs[i].url.indexOf('#/radar')>=0&&'focus' in cs[i]) return cs[i].focus(); } return self.clients.openWindow?self.clients.openWindow(url):null; })); });
