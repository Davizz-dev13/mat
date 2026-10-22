(function(){
"use strict";
// M.A.T · Ceuta y Melilla (#/ceuta-melilla, #/ceuta-melilla/melilla). Vista principal: mapa 2D (Leaflet, teselas OpenStreetMap y satélite Esri) con
// bases militares, aeropuerto/helipuertos y puertos (cym.json "inst": ubicación de páginas oficiales y Wikipedia, cada uno con su fuente), la frontera,
// los pasos y los sucesos clave. El relieve 3D (cym3d.js + three.js, DEM libre cym_<ciudad>.bin.gz) queda como vista opcional.
var DP=null, D=null, V3=null, CUR=null, HM={}, LM=null, LP=null, SAT=false;
function V(){ var s=document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1'; }
function EN(){ return window.MAT_LANG==='en'; }
function T(a){ return Array.isArray(a)?(EN()?(a[1]!=null?a[1]:a[0]):a[0]):(a==null?'':a); }
function e(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function load(){ if(DP) return DP; DP=fetch('cym.json?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ D=d; return d; }); DP.catch(function(){ DP=null; }); return DP; }
function hmap(k){ if(HM[k]) return HM[k]; HM[k]=fetch('cym_'+k+'.bin.gz?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(); }).then(function(b){ return new Uint16Array(b); }); HM[k].catch(function(){ HM[k]=null; }); return HM[k]; }
function webgl(){ try{ var c=document.createElement('canvas'); return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl'))); }catch(x){ return false; } }
function loadLeaflet(){ if(window.L&&window.L.map) return Promise.resolve(window.L); if(LP) return LP;
  LP=new Promise(function(res,rej){ if(!document.querySelector('link[href^="leaflet.css"]')){ var l=document.createElement('link'); l.rel='stylesheet'; l.href='leaflet.css?v='+V(); document.head.appendChild(l); }
    var s=document.createElement('script'); s.src='leaflet.js?v='+V(); s.onload=function(){ if(window.L&&window.L.map) res(window.L); else { LP=null; rej(new Error('leaflet')); } }; s.onerror=function(){ LP=null; rej(new Error('leaflet')); }; document.head.appendChild(s); });
  return LP; }
function kill(){ if(CUR){ try{ CUR.dispose(); }catch(x){} CUR=null; } if(LM){ try{ LM.remove(); }catch(x){} LM=null; } }
window.addEventListener('hashchange',function(){ if(!/^#\/ceuta-melilla/.test(location.hash)) kill(); });
var ICON='<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><path d="M8 10l10-4 12 4 10-4v32l-10 4-12-4-10 4z" fill="none" stroke="#b3bd8c" stroke-width="1.6" stroke-linejoin="round"/><path d="M18 6v32M30 10v32" stroke="#6b7177" stroke-width="1.2"/><circle cx="24" cy="20" r="5" fill="#3f6b2a" stroke="#d6b25e" stroke-width="1.4"/><circle cx="14" cy="30" r="3" fill="#1565c0"/><circle cx="35" cy="28" r="3" fill="#00838f"/></svg>';
window.MAT_CYM_ICON=ICON;
var COL={mil:'#3f6b2a',air:'#1565c0',port:'#00838f'};
var GLY={
  mil:'<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2.8l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.6l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" fill="#fff"/></svg>',
  nav:'<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2a2.6 2.6 0 0 0-1.1 5V9H8v2h2.9v8.8A7.2 7.2 0 0 1 5.2 14H7.4L4.2 10 1 14h2.2A8.9 8.9 0 0 0 12 22a8.9 8.9 0 0 0 8.8-8H23l-3.2-4-3.2 4h2.2a7.2 7.2 0 0 1-5.7 5.8V11H16V9h-2.9V7A2.6 2.6 0 0 0 12 2zm0 1.7a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" fill="#fff"/></svg>',
  air:'<svg viewBox="0 0 24 24" width="17" height="17"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" fill="#fff"/></svg>',
  heli:'<b style="font:800 14px/1 system-ui,sans-serif;color:#fff">H</b>'};
GLY.port=GLY.nav;
var EVC={evento:'#d6b25e',mil:'#7fb0ff',valla:'#ff8a65',paso:'#c7a0ff',inst:'#9ad18b'};
var CSS='.cym-map{position:relative;height:60vh;min-height:340px;max-height:580px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#dfe3e6;margin:8px 0 6px;z-index:0}'+
 '.cym-map .leaflet-popup-content{margin:10px 12px;font-size:13px;line-height:1.4;color:#1d1f21}.cym-map .leaflet-popup-content a{color:#1a5fb4}'+
 '.cym-mk{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.55);box-sizing:border-box}'+
 '.cym-mk.nav{border-radius:7px}.cym-ek{display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;border:1.5px solid #0b0c0d;color:#0b0c0d;font:700 11px/1 system-ui,sans-serif;box-shadow:0 1px 3px rgba(0,0,0,.5);box-sizing:border-box}'+
 '.cym-pk{width:13px;height:13px;background:#f2f2ee;border:1.5px solid #0b0c0d;transform:rotate(45deg);box-sizing:border-box;margin:3px}'+
 '.cym-pt{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;margin-bottom:2px}.cym-pn{font-weight:700;font-size:14px;margin-bottom:2px}.cym-pu{font-size:12px;color:#555;margin-bottom:4px}.cym-ps{font-size:11px;color:#666;margin-top:5px;overflow-wrap:anywhere}'+
 '.cym-fl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}.cym-fb{display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid var(--line);color:var(--mu);border-radius:16px;padding:5px 10px;font:inherit;font-size:13px;cursor:pointer}'+
 '.cym-fb[aria-pressed="true"]{border-color:#d6b25e;color:#eee;background:rgba(214,178,94,.10)}.cym-fb[aria-pressed="false"]{opacity:.55}.cym-fb i{display:inline-block;width:12px;height:12px;border-radius:50%;flex:0 0 12px}.cym-fb i.ps{border-radius:2px;transform:rotate(45deg);width:9px;height:9px;flex-basis:9px}'+
 '.cym-note{font-size:13px;color:#cfd2cc;border-left:3px solid #1565c0;padding:4px 0 4px 10px;margin:8px 0}'+
 '.cym-ic{flex:0 0 28px;height:28px;border-radius:50%;border:0;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}.cym-ic.nav{border-radius:7px}'+
 '.cym-ap{font-size:11px;color:var(--dim)}.cym-ctl [hidden],.cym-hint[hidden]{display:none!important}';
function css(){ if(document.getElementById('cym-css2')) return; var s=document.createElement('style'); s.id='cym-css2'; s.textContent=CSS; document.head.appendChild(s); }
window.MAT_CYM=function(app,X){
  var p=X.p||[], city=(p[1]==='melilla')?'melilla':'ceuta', en=EN();
  var L=en?{h:'Ceuta and Melilla',home:'Home',sub:'Map of both cities with their military bases, airport, heliports and ports, the border with Morocco (in red), the border crossings and the key events. Tap an icon to see what it is and its source.',
      rot:'Drag to rotate · pinch to zoom',reset:'Reset view',ex:'Relief',v3:'⛰ View terrain in 3D',v2:'🗺 Back to the map',ev:'Key events',pasos:'Border crossings',src:'Sources',cred:'Credits',load:'Loading the map…',load3:'Loading 3D terrain…',err:'Could not load the data. Check your connection and try again.',
      no3d:'3D is not available on this device.',intro:'Ceuta and Melilla are Spanish autonomous cities in North Africa; Morocco claims sovereignty over them.',rev:'Reviewed',see:'See on the map',ap:'approx. position',
      ty:{mil:'Military bases',air:'Airport and heliports',port:'Ports'},ty1:{mil:'Military base',nav:'Navy',air:'Airport',heli:'Heliport',port:'Port'},fe:'Key events',fp:'Crossings',bm2:'🗺 Street map',bs2:'🛰 Satellite',mapErr:'The map could not be loaded. Check your connection.'}
    :{h:'Ceuta y Melilla',home:'Inicio',sub:'Mapa de las dos ciudades con sus bases militares, aeropuerto, helipuertos y puertos, la frontera con Marruecos (en rojo), los pasos fronterizos y los sucesos clave. Toca un icono para ver qué es y su fuente.',
      rot:'Arrastra para girar · pellizca para acercar',reset:'Vista inicial',ex:'Relieve',v3:'⛰ Ver relieve en 3D',v2:'🗺 Volver al mapa',ev:'Sucesos clave',pasos:'Pasos fronterizos',src:'Fuentes',cred:'Créditos',load:'Cargando el mapa…',load3:'Cargando el relieve 3D…',err:'No se pudieron cargar los datos. Comprueba la conexión y vuelve a intentarlo.',
      no3d:'El 3D no está disponible en este dispositivo.',intro:'Ceuta y Melilla son ciudades autónomas españolas en el norte de África; Marruecos reivindica su soberanía.',rev:'Revisado',see:'Ver en el mapa',ap:'posición aproximada',
      ty:{mil:'Bases militares',air:'Aeropuerto y helipuertos',port:'Puertos'},ty1:{mil:'Base militar',nav:'Armada',air:'Aeropuerto',heli:'Helipuerto',port:'Puerto'},fe:'Sucesos',fp:'Pasos',bm2:'🗺 Callejero',bs2:'🛰 Satélite',mapErr:'No se pudo cargar el mapa. Comprueba la conexión.'};
  kill(); css();
  X.set(X.crumbs([[L.home,'#/'],[L.h]])+'<div data-nofold data-noi18n class="cym"><h1>'+L.h+'</h1><p class="sub">'+L.sub+'</p><p class="sub">'+L.load+'</p></div>',L.h);
  load().then(function(DD){
    var C=DD.city[city], evs=DD.ev.filter(function(x){ return x.c===city; }).sort(function(a,b){ return a.s<b.s?-1:1; }), ps=DD.pasos.filter(function(x){ return x.c===city; }),
      ins=(DD.inst||[]).filter(function(x){ return x.c===city; });
    evs.forEach(function(x,i){ x.id='e'+i; x.num=i+1; }); ps.forEach(function(x,i){ x.id='p'+i; }); ins.forEach(function(x,i){ x.id='i'+i; });
    function gk(x){ return x.g||x.k; }
    function ic(x,cls){ var g=gk(x); return '<span class="'+cls+(g==='nav'?' nav':'')+'" style="background:'+COL[x.k]+'">'+GLY[g]+'</span>'; }
    function srcs(a){ return a.map(function(s){ return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>'; }).join(' · '); }
    function instList(k){ var a=ins.filter(function(x){ return x.k===k; }); if(!a.length) return '';
      return '<h2>'+L.ty[k]+' ('+a.length+')</h2><div class="cym-evs">'+a.map(function(x){ var g=gk(x); return '<div class="cym-ev"><button type="button" class="cym-ic'+(g==='nav'?' nav':'')+'" style="background:'+COL[x.k]+'" data-id="'+x.id+'" aria-label="'+L.see+'">'+GLY[g]+'</button><div class="cym-eb"><div class="cym-t">'+e(T(x.n))+'</div><div class="cym-d">'+e(T(x.u))+'</div><div class="cym-x">'+e(T(x.t))+'</div>'+(x.ap?'<div class="cym-ap">'+L.ap+'</div>':'')+'<div class="cym-s">'+L.src+': '+srcs(x.src)+'</div></div></div>'; }).join('')+'</div>'; }
    var cnt={mil:0,air:0,port:0}; ins.forEach(function(x){ cnt[x.k]++; });
    var FL=[['mil',L.ty.mil,COL.mil,cnt.mil],['air',L.ty.air,COL.air,cnt.air],['port',L.ty.port,COL.port,cnt.port],['ev',L.fe,'#d6b25e',evs.length],['ps',L.fp,'#f2f2ee',ps.length]];
    var h=X.crumbs([[L.home,'#/'],[L.h]])+'<div data-nofold data-noi18n class="cym"><h1>'+L.h+'</h1><p class="sub">'+L.sub+'</p>'+
      '<div class="cym-tabs" role="tablist">'+['ceuta','melilla'].map(function(k){ return '<a role="tab" href="#/ceuta-melilla'+(k==='melilla'?'/melilla':'')+'" class="cym-tab'+(k===city?' on':'')+'">'+T(DD.city[k].n)+'</a>'; }).join('')+'</div>'+
      '<p class="cym-f">'+e(T(C.f))+'</p>'+(DD.note&&DD.note[city]?'<p class="cym-note">'+e(T(DD.note[city]))+'</p>':'')+
      '<div class="cym-fl" id="cymfl">'+FL.map(function(f){ return '<button type="button" class="cym-fb" data-f="'+f[0]+'" aria-pressed="true"><i'+(f[0]==='ps'?' class="ps"':'')+' style="background:'+f[2]+'"></i>'+f[1]+' · '+f[3]+'</button>'; }).join('')+'</div>'+
      '<div class="cym-map" id="cymv"><div class="cym-msg" id="cymmsg">'+L.load+'</div></div>'+
      '<div class="cym-ctl"><button type="button" class="cym-b" id="cymbm" hidden></button><button type="button" class="cym-b" id="cym3d">'+L.v3+'</button><button type="button" class="cym-b" id="cymreset" hidden>⟲ '+L.reset+'</button><label class="cym-ex" id="cymexl" hidden>'+L.ex+' <input type="range" id="cymex" min="1" max="3" step="0.1" value="1.6"></label></div>'+
      '<p class="cym-hint" id="cymhint" hidden>'+L.rot+'</p>'+
      '<div class="cym-card" id="cymcard" hidden></div>'+
      instList('mil')+instList('air')+instList('port')+
      '<h2>'+L.ev+'</h2><div class="cym-evs">'+evs.map(function(x){ return '<div class="cym-ev" id="cym-'+x.id+'"><button type="button" class="cym-n k-'+x.k+'" data-id="'+x.id+'" aria-label="'+L.see+'">'+x.num+'</button><div class="cym-eb"><div class="cym-d">'+e(T(x.d))+'</div><div class="cym-t">'+e(T(x.n))+'</div><div class="cym-x">'+e(T(x.t))+'</div><div class="cym-s">'+L.src+': '+srcs(x.src)+'</div></div></div>'; }).join('')+'</div>'+
      '<h2>'+L.pasos+'</h2><div class="cym-evs">'+ps.map(function(x){ return '<div class="cym-ev"><button type="button" class="cym-n ps" data-id="'+x.id+'" aria-label="'+L.see+'">◆</button><div class="cym-eb"><div class="cym-t">'+e(T(x.n))+'</div><div class="cym-x">'+e(T(x.t))+'</div></div></div>'; }).join('')+'</div>'+
      '<p class="cym-intro">'+L.intro+' '+L.src+': '+srcs(C.src)+'</p>'+
      '<div class="cym-cred"><b>'+L.cred+'</b><br>'+DD.cred[en?'en':'es'].map(e).join('<br>')+'</div><p class="cym-rev">'+L.rev+': '+e(DD.rev)+'</p></div>';
    X.set(h,L.h+' · '+T(C.n));
    var view=document.getElementById('cymv'), card=document.getElementById('cymcard'), mode='map', MK={}, GR={}, ON={mil:1,air:1,port:1,ev:1,ps:1};
    var ALL={}; evs.forEach(function(x){ ALL[x.id]=x; }); ps.forEach(function(x){ ALL[x.id]=x; }); ins.forEach(function(x){ ALL[x.id]=x; });
    function grp(x){ return x.id.charAt(0)==='i'?x.k:(x.id.charAt(0)==='e'?'ev':'ps'); }
    function pop(x){ if(x.id.charAt(0)==='i'){ var g=gk(x); return '<div class="cym-pt" style="color:'+COL[x.k]+'">'+L.ty1[g]+'</div><div class="cym-pn">'+e(T(x.n))+'</div><div class="cym-pu">'+e(T(x.u))+'</div><div>'+e(T(x.t))+'</div>'+(x.ap?'<div class="cym-ps">'+L.ap+'</div>':'')+'<div class="cym-ps">'+L.src+': '+srcs(x.src)+'</div>'; }
      return (x.d?'<div class="cym-pt" style="color:#8a6d1f">'+e(T(x.d))+'</div>':'')+'<div class="cym-pn">'+(x.num?x.num+'. ':'')+e(T(x.n))+'</div><div>'+e(T(x.t))+'</div>'+(x.src?'<div class="cym-ps">'+L.src+': '+srcs(x.src)+'</div>':'')+(x.num?'<div class="cym-ps">'+L.ap+'</div>':''); }
    function show3(id){ var x=ALL[id]; if(!x) return; card.hidden=false;
      card.innerHTML='<button type="button" class="cym-close" aria-label="×">×</button>'+pop(x).replace(/class="cym-p[nt]"/g,'class="cym-t"');
      card.querySelector('.cym-close').onclick=function(){ card.hidden=true; if(CUR&&CUR.select) CUR.select(null); };
      if(CUR&&CUR.select) CUR.select(id); }
    function goTo(id){ var x=ALL[id]; if(!x) return;
      if(mode==='map'&&LM&&MK[id]){ var g=grp(x); if(!ON[g]) setF(g,true); LM.setView(x.ll,Math.max(LM.getZoom(),15),{animate:true}); MK[id].openPopup(); }
      else if(mode==='3d'){ show3(id); if(CUR&&CUR.focus) CUR.focus(x.ll); }
      view.scrollIntoView({behavior:'smooth',block:'center'}); }
    [].forEach.call(app.querySelectorAll('.cym-n,.cym-ic'),function(bn){ bn.onclick=function(){ goTo(bn.getAttribute('data-id')); }; });
    function setF(f,on){ ON[f]=on?1:0; var b=app.querySelector('.cym-fb[data-f="'+f+'"]'); if(b) b.setAttribute('aria-pressed',on?'true':'false'); if(LM&&GR[f]){ if(on) GR[f].addTo(LM); else LM.removeLayer(GR[f]); } }
    [].forEach.call(app.querySelectorAll('.cym-fb'),function(b){ b.onclick=function(){ var f=b.getAttribute('data-f'); setF(f,!ON[f]); }; });
    function map2d(){ kill(); mode='map'; card.hidden=true; view.className='cym-map'; view.innerHTML='<div class="cym-msg">'+L.load+'</div>';
      document.getElementById('cym3d').textContent=L.v3; document.getElementById('cym3d').disabled=!webgl();
      document.getElementById('cymreset').hidden=true; document.getElementById('cymexl').hidden=true; document.getElementById('cymhint').hidden=true;
      loadLeaflet().then(function(Lf){ if(!document.body.contains(view)||mode!=='map') return; view.innerHTML='';
        var m=Lf.map(view,{zoomControl:true,attributionControl:true,zoomSnap:0.25}); LM=m;
        m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
        var base=Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
        var sat=Lf.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Imagery © <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, Maxar, Earthstar Geographics'});
        (SAT?sat:base).addTo(m); var bb=document.getElementById('cymbm'); bb.hidden=false; bb.textContent=SAT?L.bm2:L.bs2; bb.onclick=function(){ SAT=!SAT; if(SAT){ m.removeLayer(base); sat.addTo(m); } else { m.removeLayer(sat); base.addTo(m); } bb.textContent=SAT?L.bm2:L.bs2; };
        (C.border||[]).forEach(function(line){ Lf.polyline(line,{color:'#e2482c',weight:4,opacity:.9}).addTo(m); });
        GR={mil:Lf.layerGroup(),air:Lf.layerGroup(),port:Lf.layerGroup(),ev:Lf.layerGroup(),ps:Lf.layerGroup()}; MK={};
        evs.forEach(function(x){ MK[x.id]=Lf.marker(x.ll,{icon:Lf.divIcon({className:'',html:'<div class="cym-ek" style="background:'+(EVC[x.k]||'#d6b25e')+'">'+x.num+'</div>',iconSize:[22,22],iconAnchor:[11,11],popupAnchor:[0,-10]}),title:T(x.n),zIndexOffset:100}).bindPopup(pop(x),{maxWidth:270}).addTo(GR.ev); });
        ps.forEach(function(x){ MK[x.id]=Lf.marker(x.ll,{icon:Lf.divIcon({className:'',html:'<div class="cym-pk"></div>',iconSize:[19,19],iconAnchor:[9,9],popupAnchor:[0,-8]}),title:T(x.n),zIndexOffset:50}).bindPopup(pop(x),{maxWidth:270}).addTo(GR.ps); });
        ins.forEach(function(x){ MK[x.id]=Lf.marker(x.ll,{icon:Lf.divIcon({className:'',html:ic(x,'cym-mk'),iconSize:[28,28],iconAnchor:[14,14],popupAnchor:[0,-13]}),title:T(x.n),zIndexOffset:500}).bindPopup(pop(x),{maxWidth:270}).addTo(GR[x.k]); });
        Object.keys(GR).forEach(function(f){ if(ON[f]) GR[f].addTo(m); });
        var pts=(ins.length?ins:evs.concat(ps)).map(function(x){ return x.ll; }); if(pts.length) m.fitBounds(Lf.latLngBounds(pts),{padding:[16,16],maxZoom:16}); else { var b=C.b; m.fitBounds([[b.s,b.w],[b.n,b.e]]); }
        setTimeout(function(){ if(LM===m) m.invalidateSize(); },250);
      }).catch(function(){ if(document.body.contains(view)) view.innerHTML='<div class="cym-msg">'+L.mapErr+'</div>'; }); }
    function three(){ kill(); mode='3d'; view.className='cym-view'; view.innerHTML='<div class="cym-msg" id="cymmsg">'+L.load3+'</div>'; var msg=document.getElementById('cymmsg');
      document.getElementById('cym3d').textContent=L.v2; document.getElementById('cymbm').hidden=true; document.getElementById('cymreset').hidden=false; document.getElementById('cymexl').hidden=false; document.getElementById('cymhint').hidden=false;
      var pins=evs.map(function(x){ return {id:x.id,ll:x.ll,cls:'k-'+x.k,html:String(x.num),label:T(x.n)}; }).concat(ps.map(function(x){ return {id:x.id,ll:x.ll,cls:'ps',html:'◆',label:T(x.n),up:40}; }));
      Promise.all([V3||(V3=import('./cym3d.js?v='+V())), hmap(city)]).then(function(z){ if(!document.body.contains(view)||mode!=='3d') return; kill();
        CUR=z[0].mount(view,C,z[1],'cym_'+city+'.jpg?v='+V(),pins,{ex:+document.getElementById('cymex').value,zoom:city==='melilla'?1.2:1,onPin:function(q){ show3(q.id); },onReady:function(){ if(msg&&msg.parentNode) msg.parentNode.removeChild(msg); },onError:function(){ map2d(); }});
      }).catch(function(){ V3=null; map2d(); var m=document.createElement('p'); m.className='cym-hint'; m.textContent=L.no3d; view.parentNode.insertBefore(m,view.nextSibling); }); }
    document.getElementById('cymreset').onclick=function(){ if(CUR) CUR.reset(); };
    document.getElementById('cymex').oninput=function(ev){ if(CUR&&CUR.exag) CUR.exag(+ev.target.value); };
    document.getElementById('cym3d').onclick=function(){ if(mode==='map') three(); else map2d(); };
    map2d();
  }).catch(function(){ X.set(X.crumbs([[L.home,'#/'],[L.h]])+'<p class="sub" style="padding:20px 0">'+L.err+'</p>',L.h); });
};
})();
