(function(){
"use strict";
// M.A.T · Mapas de guerras (ampliación): #/guerras/oriente, /sudan, /myanmar, /sahel, /somalia, /congo, /mexico + eventos clave en el mapa de Ucrania.
// Campos opcionales por guerra en guerras_ev.json maps.<id>: h [es,en] título de la sección de figuras, note [es,en] aviso bajo los datos, ab [es,en] frase extra en «Sobre esta página»; img[].k [es,en] etiqueta de la figura (por defecto «Mapa»); ev[].u.x [[texto,url],…] fuentes adicionales.
// Eventos: fecha y coordenadas de Wikidata, enlace a Wikipedia en cada uno; textos propios y neutrales.
// Mapas de control: imágenes libres de Wikimedia Commons (CC0 / CC BY-SA / dominio público), con autor, licencia y fecha de versión. Sin DeepStateMap ni ISW.
var IDS=['oriente','sudan','myanmar','sahel','somalia','congo','mexico']; window.MAT_GW2_IDS=IDS;
var DP=null, DD=null, MAP=null;
function EN(){ return window.MAT_LANG==='en'; }
function T(a){ return a==null?'':(Array.isArray(a)?(EN()?(a[1]!=null?a[1]:a[0]):a[0]):a); }
function e(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function V(){ var s=document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1'; }
function load(){ if(DP) return DP; DP=fetch('guerras_ev.json?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ DD=d; return d; }); DP.catch(function(){ DP=null; }); return DP; }
var MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'], MEN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fd(iso){ var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||''); if(!m) return e(iso||''); return (+m[3])+' '+(EN()?MEN[+m[2]-1]:MES[+m[2]-1])+' '+m[1]; }
function css(){ if(document.getElementById('gw2-css')) return; var s=document.createElement('style'); s.id='gw2-css';
  s.textContent='.gw2ev{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.gw2ev:last-child{border-bottom:0}'+
  '.gw2n{flex:0 0 26px;height:26px;border-radius:50%;background:#d6b25e;color:#0b0c0d;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:0;font-family:inherit}'+
  '.gw2b{min-width:0;flex:1}.gw2d{font-size:12px;color:var(--ac2);letter-spacing:.02em}.gw2t{font-weight:650;font-size:15px;line-height:1.3;margin:1px 0 2px}.gw2x{font-size:14px;color:#cfd2cc;line-height:1.45}'+
  '.gw2s{font-size:11px;color:var(--dim);margin-top:3px}.gw2s a{color:var(--mu)}.gw2ap{font-size:11px;color:var(--dim)}'+
  '.gw2map{height:62vh;min-height:340px;max-height:560px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#0d0f11;margin:10px 0 4px}'+
  '.gw2map.dk .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.85) contrast(.9) saturate(.6)}'+
  '.gw2pin{background:#d6b25e;color:#0b0c0d;border:2px solid #0b0c0d;border-radius:50%;font:700 11px/18px -apple-system,Segoe UI,Roboto,Arial,sans-serif;text-align:center;box-shadow:0 0 0 1px rgba(214,178,94,.6)}'+
  '.gw2pin.ap{background:#0b0c0d;color:#d6b25e;border-color:#d6b25e;border-style:dashed}'+
  '.gw2pop b{display:block;font-size:14px;margin-bottom:2px}.gw2pop .d{color:#8a6d1f;font-size:12px}.gw2pop p{margin:4px 0;font-size:13px}.gw2pop a{font-size:12px}'+
  '.gw2leg{background:rgba(11,12,13,.88);color:#e9e9e6;border:1px solid #2a2e32;border-radius:6px;padding:6px 8px;font-size:11px;line-height:1.5;max-width:180px}.gw2leg i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:5px;vertical-align:-2px}'+
  '.gw2yrs{display:flex;gap:6px;overflow-x:auto;padding:4px 0;-webkit-overflow-scrolling:touch}.gw2yrs .chip{flex:0 0 auto}'+
  '.gw2fig{margin:12px 0;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);overflow:hidden}.gw2fig a.im{display:block;background:#fff}.gw2fig img{width:100%;height:auto;max-height:520px;object-fit:contain}'+
  '.gw2fig figcaption{padding:8px 10px;font-size:12px;color:var(--mu);line-height:1.45}.gw2fig figcaption .s{color:var(--dim);font-size:11px;margin-top:3px}.gw2fig figcaption a{color:var(--mu)}'+
  '.gw2note{border-left:3px solid #d6b25e;padding:8px 10px;margin:10px 0;background:var(--s1);border-radius:4px}'+
  '.gw2facts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0}.gw2f{background:var(--s1);border:1px solid var(--line);border-radius:var(--r);padding:8px 10px}.gw2f .k{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em}.gw2f .v{font-size:15px;font-weight:650;margin-top:2px}.gw2f.w{grid-column:1/-1}.gw2f.w .v{font-size:14px;font-weight:500}';
  document.head.appendChild(s); }
function killMap(){ if(MAP){ try{ MAP.remove(); }catch(x){} MAP=null; } }
window.addEventListener('hashchange',function(){ var h=location.hash; if(!IDS.some(function(i){ return h.indexOf('#/guerras/'+i)===0; })) killMap(); });
function pinIcon(Lf,n,ap){ return Lf.divIcon({className:'',html:'<div class="gw2pin'+(ap?' ap':'')+'" style="width:22px;height:22px">'+n+'</div>',iconSize:[22,22],iconAnchor:[11,11],popupAnchor:[0,-10]}); }
function src(u){ var a=[]; if(EN()){ if(u.en) a.push('<a href="'+e(u.en)+'" target="_blank" rel="noopener">Wikipedia</a>'); if(u.es) a.push('<a href="'+e(u.es)+'" target="_blank" rel="noopener">Wikipedia (ES)</a>'); } else { if(u.es) a.push('<a href="'+e(u.es)+'" target="_blank" rel="noopener">Wikipedia</a>'); if(u.en) a.push('<a href="'+e(u.en)+'" target="_blank" rel="noopener">Wikipedia (EN)</a>'); } (u.x||[]).forEach(function(x){ if(x&&x[1]) a.push('<a href="'+e(x[1])+'" target="_blank" rel="noopener">'+e(x[0])+'</a>'); }); return a.join(' · '); }
function popHTML(v){ return '<div class="gw2pop"><b>'+e(T(v.n))+'</b><div class="d">'+e(T(v.d))+'</div><p>'+e(T(v.t))+'</p>'+(v.ap?'<div class="gw2ap">'+(EN()?'Approximate location':'Ubicación aproximada')+'</div>':'')+(EN()?'Source: ':'Fuente: ')+src(v.u)+'</div>'; }
function evList(evs){ return '<div class="gw2list">'+evs.map(function(v,i){ return '<div class="gw2ev" data-i="'+i+'"><button type="button" class="gw2n" data-i="'+i+'" aria-label="'+(EN()?'Show on map':'Ver en el mapa')+'">'+(i+1)+'</button><div class="gw2b"><div class="gw2d">'+e(T(v.d))+'</div><div class="gw2t">'+e(T(v.n))+'</div><div class="gw2x">'+e(T(v.t))+'</div><div class="gw2s">'+(EN()?'Source: ':'Fuente: ')+src(v.u)+(v.ap?' · '+(EN()?'approximate location on the map':'ubicación aproximada en el mapa'):'')+'</div></div></div>'; }).join('')+'</div>'; }
function legend(Lf,map,extra){ var lg=Lf.control({position:'topright'}); lg.onAdd=function(){ var d=Lf.DomUtil.create('div','gw2leg'); d.setAttribute('data-noi18n','');
  d.innerHTML=(extra||'')+'<div><i style="background:#d6b25e;border:2px solid #0b0c0d"></i>'+(EN()?'Key event (tap for date and source)':'Evento clave (toca: fecha y fuente)')+'</div><div><i style="background:#0b0c0d;border:2px dashed #d6b25e"></i>'+(EN()?'Approximate location':'Ubicación aproximada')+'</div>'; return d; }; lg.addTo(map); }
function addPins(Lf,map,evs,pane){ var ms=[]; evs.forEach(function(v,i){ var m=Lf.marker(v.c,{icon:pinIcon(Lf,i+1,v.ap),pane:pane||'markerPane',keyboard:true,title:T(v.n)}); m.bindPopup(popHTML(v),{maxWidth:260}); m.addTo(map); ms.push(m); }); return ms; }
function wire(root,ms,map,evs){ [].forEach.call(root.querySelectorAll('.gw2n'),function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'), m=ms[i]; if(!m) return; var el=map.getContainer(); try{ el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} map.setView(evs[i].c,Math.max(map.getZoom(),6)); m.openPopup(); }); }); }
// ---------- página de una guerra ----------
window.MAT_GW2_PAGE=function(app,X,id,w,G){
  css(); var title=T(w&&w.n)||id;
  X.set(X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad','#/guerras'],[title]])+'<p class="sub" style="padding:24px 0">'+(EN()?'Loading…':'Cargando…')+'</p>',title);
  var h0=location.hash;
  Promise.all([load(),G.loadLeaflet()]).then(function(){ if(location.hash!==h0) return; render(); }).catch(function(){ X.set(X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad','#/guerras'],[title]])+'<p class="sub" style="padding:24px 0">'+(EN()?'Could not load the map. Check your connection.':'No se pudo cargar el mapa. Comprueba la conexión.')+'</p>',title); });
  function render(){
    var M=DD.maps[id], all=DD.ev[id]||[], q=X.qs?X.qs():{}, yr=q.y||'';
    var yrs=[]; all.forEach(function(v){ var y=v.s.slice(0,4); if(yrs.indexOf(y)<0) yrs.push(y); });
    var evs=all.filter(function(v){ return !yr||v.s.slice(0,4)===yr; });
    var h=X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad','#/guerras'],[title]])+'<div data-noi18n>';
    if(w&&w.locs) h+='<div class="gwfl" style="margin-top:6px">'+w.locs.slice(0,8).map(function(l){ return '<img src="flags/'+e(l[0])+'.png" alt="" title="'+e(EN()?l[2]:l[1])+'" loading="lazy">'; }).join('')+'</div>';
    h+='<h1>'+e(title)+'</h1>';
    if(w&&w.res) h+='<p class="gwintro">'+e(T(w.res))+'</p>';
    if(w){ h+='<div class="gw2facts"><div class="gw2f"><div class="k">'+(EN()?'Since':'Desde')+'</div><div class="v">'+e(w.start)+'</div></div><div class="gw2f"><div class="k">'+(EN()?'Combat deaths 2026':'Muertes en combate 2026')+'</div><div class="v">'+e(w.f&&w.f.y26||'—')+'</div></div>'+(w.par?'<div class="gw2f w"><div class="k">'+(EN()?'Main parties':'Partes principales')+'</div><div class="v">'+e(T(w.par))+'</div></div>':'')+'</div>'; }
    if(M&&M.note) h+='<p class="gwnote gw2note">'+e(T(M.note))+'</p>';
    h+='<h2>'+(EN()?'Key events on the map':'Eventos clave en el mapa')+'</h2><p class="gwintro">'+(EN()?'Each numbered point is a key event, with its date and source. Drag to move, pinch or use +/− to zoom. Filter by year:':'Cada punto numerado es un evento clave, con su fecha y su fuente. Arrastra para moverte y pellizca o usa +/− para acercarte. Filtra por año:')+'</p>';
    h+='<div class="gw2yrs" role="group" aria-label="'+(EN()?'Year':'Año')+'"><button type="button" class="chip" data-y="" aria-pressed="'+(!yr)+'">'+(EN()?'All':'Todos')+'</button>'+yrs.map(function(y){ return '<button type="button" class="chip" data-y="'+y+'" aria-pressed="'+(y===yr)+'">'+y+'</button>'; }).join('')+'</div>';
    h+='<div class="gw2map dk" id="gw2map"></div>';
    h+=evList(evs);
    if(M&&M.img&&M.img.length){ h+='<h2>'+(M.h?e(T(M.h)):(EN()?'Who controls what':'Quién controla qué'))+'</h2>';
      M.img.forEach(function(im){ var fn=decodeURIComponent((im.pg||'').split('File:')[1]||'').replace(/_/g,' ');
        h+='<figure class="gw2fig"><a class="im" href="'+e(im.pg)+'" target="_blank" rel="noopener"><img src="'+e(im.th)+'" alt="'+e(T(im.cap))+'" loading="lazy"></a><figcaption>'+e(T(im.cap))+'<div class="s">'+(im.k?e(T(im.k))+': ':(EN()?'Map: ':'Mapa: '))+'<a href="'+e(im.pg)+'" target="_blank" rel="noopener">«'+e(fn)+'»</a>, Wikimedia Commons · '+(EN()?'version of ':'versión del ')+fd(im.ts)+' · '+e(im.by)+' · '+e(im.lic)+(EN()?'. Tap to open it full size.':'. Tócalo para verlo en grande.')+'</div></figcaption></figure>'; }); }
    h+='<h2>'+(EN()?'About this page':'Sobre esta página')+'</h2><p class="gwnote">'+(EN()?'Event dates and coordinates come from Wikidata; each event links its Wikipedia article. Short texts written by M.A.T in neutral terms. Control maps: free images from Wikimedia Commons with their author, licence and the date of the version shown; they are made by volunteers from press reports and can lag behind events. No DeepStateMap or ISW material is used. Base map © OpenStreetMap contributors (darkened). Map library: Leaflet (BSD-2-Clause). Reviewed ':'Las fechas y coordenadas de los eventos proceden de Wikidata y cada evento enlaza su artículo de Wikipedia. Textos breves redactados por M.A.T en términos neutrales. Mapas de control: imágenes libres de Wikimedia Commons con su autor, licencia y fecha de la versión mostrada; las hacen voluntarios a partir de informaciones de prensa y pueden ir por detrás de los hechos. No se usa material de DeepStateMap ni del ISW. Mapa base © colaboradores de OpenStreetMap (oscurecido). Librería del mapa: Leaflet (BSD-2-Clause). Revisado: ')+fd(DD.rev)+'.'+(M&&M.ab?' '+e(T(M.ab)):'')+'</p></div>';
    X.set(h,title);
    var el=document.getElementById('gw2map'), Lf=window.L; killMap(); G.killMap();
    var map=Lf.map(el,{zoomControl:true,minZoom:2,maxZoom:12,zoomSnap:0.5,zoomDelta:0.5,worldCopyJump:false}); MAP=map;
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
    var b=M&&M.b; if(evs.length){ var bb=Lf.latLngBounds(evs.map(function(v){ return v.c; })); if(b&&!yr) bb.extend(b); map.fitBounds(bb,{padding:[24,24],maxZoom:7}); } else if(b) map.fitBounds(b);
    legend(Lf,map); var ms=addPins(Lf,map,evs); wire(app,ms,map,evs);
    [].forEach.call(app.querySelectorAll('.gw2yrs .chip'),function(c){ c.addEventListener('click',function(){ var y=c.getAttribute('data-y'); try{ history.replaceState(null,'','#/guerras/'+id+(y?'?y='+y:'')); }catch(x){} render(); }); });
  }
};
// ---------- Ucrania: capa de eventos clave sobre el mapa existente ----------
window.MAT_GW2_UA=function(API){
  css(); load().then(function(){ var map=API&&API.map, Lf=window.L; if(!map||!map.getContainer()||!document.body.contains(map.getContainer())) return;
    var evs=DD.ev.ucrania||[]; map.createPane('gw2ev'); map.getPane('gw2ev').style.zIndex=650;
    var grp=Lf.layerGroup(); var ms=[]; evs.forEach(function(v,i){ var m=Lf.marker(v.c,{icon:pinIcon(Lf,i+1,v.ap),pane:'gw2ev',title:T(v.n)}); m.bindPopup(popHTML(v),{maxWidth:260}); m.addTo(grp); ms.push(m); }); grp.addTo(map);
    var lg=document.querySelector('.guleg'); if(lg&&!lg.querySelector('.gw2l')){ var d=document.createElement('div'); d.className='gw2l'; d.innerHTML='<i style="background:#d6b25e;border-radius:50%;border:2px solid #0b0c0d;width:10px;height:10px"></i>'+(EN()?'Key event (tap)':'Evento clave (toca)'); lg.appendChild(d); }
    var tg=document.querySelector('.gutog'); if(tg&&!tg.querySelector('[data-t="ev"]')){ var b=document.createElement('button'); b.type='button'; b.className='chip'; b.setAttribute('data-t','ev'); b.setAttribute('aria-pressed','true'); b.textContent=EN()?'Key events':'Eventos clave'; b.addEventListener('click',function(ev){ ev.stopImmediatePropagation(); var on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',String(on)); if(on) grp.addTo(map); else map.removeLayer(grp); },true); tg.insertBefore(b,tg.firstChild); }
    var inf=document.getElementById('guinfo'); if(inf&&!document.getElementById('gw2uaev')){ var s=document.createElement('div'); s.id='gw2uaev'; s.setAttribute('data-noi18n','');
      s.innerHTML='<h2>'+(EN()?'Key events on the map':'Eventos clave en el mapa')+'</h2><p class="gwintro">'+(EN()?'Numbered points on the map; tap a number to see it there.':'Puntos numerados en el mapa; toca un número para verlo allí.')+'</p>'+evList(evs);
      inf.parentNode.insertBefore(s,inf.nextSibling); wire(s,ms,map,evs); }
  }).catch(function(){});
};
})();
