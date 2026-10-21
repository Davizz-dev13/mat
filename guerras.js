(function(){
"use strict";
// ============ M.A.T · Guerras en la actualidad (#/guerras, #/guerras/ucrania) ============
// Solo visualización. Datos: guerras.json.gz (lista y fichas) y guerras_ua.json.gz (mapa de Ucrania,
// capa CC BY-SA 4.0 derivada de Wikimedia Commons). No toca inventario, totales, #/fuerzas, Duelo ni #/mapa.
var D=null, DP=null, GD=null, GP=null, LP=null, MAP=null;
function EN(){return window.MAT_LANG==='en';}
function T(a){return a==null?'':(Array.isArray(a)?(EN()?(a[1]!=null?a[1]:a[0]):a[0]):a);}
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function V(){var s=document.querySelector('script[src^="loader.js"]')||document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1';}
function nf(n){var s=Math.round(n).toString(); return s.replace(/\B(?=(\d{3})+(?!\d))/g,EN()?',':'.');}
function pf(x){return EN()?x.toFixed(1):x.toFixed(1).replace('.',',');}
function numx(s){ if(!s||s==='—') return '—'; return EN()?String(s).replace(/\./g,','):String(s); }
var MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'], MEN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fd(iso){ var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||''); if(!m) return e(iso||''); var d=+m[3], mo=+m[2]-1; return d+' '+(EN()?MEN[mo]:MES[mo])+' '+m[1]; }
function load(){ if(DP) return DP; DP=window.MAT_GET('guerras.json.gz').then(function(d){D=d; return d;}); DP.catch(function(){DP=null;}); return DP; }
function loadGeo(){ if(GP) return GP; GP=window.MAT_GET('guerras_ua.json.gz').then(function(d){GD=d; return d;}); GP.catch(function(){GP=null;}); return GP; }
function loadLeaflet(){ if(LP) return LP; LP=new Promise(function(res,rej){ if(window.L&&window.L.map) return res(window.L);
  var c=document.createElement('link'); c.rel='stylesheet'; c.href='leaflet.css?v='+V(); document.head.appendChild(c);
  var s=document.createElement('script'); s.src='leaflet.js?v='+V(); s.onload=function(){ res(window.L); }; s.onerror=function(){ LP=null; rej(new Error('leaflet')); }; document.head.appendChild(s); }); return LP; }
function css(){ if(document.getElementById('guerras-css')) return; var s=document.createElement('style'); s.id='guerras-css';
 s.textContent='.gwintro{color:var(--mu);font-size:14px;margin:0 0 6px}'+
 '.gwcard{display:block;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:14px;margin:10px 0;text-decoration:none;color:var(--tx)}'+
 'a.gwcard:hover{border-color:var(--ac)}.gwcard.map{border-color:#6a3b33;background:radial-gradient(130% 150% at 0% 0%,#2b1714 0%,#131517 62%)}'+
 '.gwhd{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.gwn{font-weight:650;font-size:17px;line-height:1.25}'+
 '.gwtag{flex:0 0 auto;font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1px solid var(--line);border-radius:3px;padding:3px 7px;color:var(--dim);white-space:nowrap}'+
 '.gwtag.on{border-color:#c25b4c;color:#f2b8ad}.gwfl{display:flex;flex-wrap:wrap;gap:5px;margin:9px 0 6px}'+
 '.gwfl img{width:27px;height:18px;object-fit:cover;border-radius:2px;border:1px solid var(--line)}'+
 '.gwmeta{font-size:13px;color:var(--mu);line-height:1.45}.gwmeta b{color:var(--tx);font-weight:600}'+
 '.gwst{font-size:13px;color:#e6c27a;margin:6px 0 4px;line-height:1.4}.gwres{font-size:14px;line-height:1.5;margin:6px 0}'+
 '.gwsrc{font-size:12px;color:var(--dim);margin-top:6px}.gwsrc a{color:var(--ac2)}.gwnote{font-size:12.5px;color:var(--mu);line-height:1.5}.gwnote a{color:var(--ac2)}'+
 '.guhd{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.guhd img{width:36px;height:24px;border-radius:2px;border:1px solid var(--line);object-fit:cover}.guhd .vs{color:var(--dim);font-size:13px;letter-spacing:.12em}'+
 '.gumap.dk .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.82) contrast(.9) saturate(.55)}.gumap{position:relative;height:60vh;min-height:340px;max-height:620px;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#0e1113;margin:12px 0 0}'+
 '.gumap .leaflet-container,.gumap.leaflet-container{background:#0e1113;font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}'+
 '.gumsg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--mu);font-size:14px;padding:20px;text-align:center}'+
 '.gusnaps{margin:10px 0 2px}.gusnaps .chip{font-size:12.5px;padding:7px 11px}.gurange{width:100%;margin:8px 0 2px;accent-color:#c25b4c}'+
 '.guinfo{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:12px;margin:8px 0}.guinfo .d{font-weight:650;font-size:16px}'+
 '.guinfo .a{font-size:22px;font-weight:700;color:#f2b8ad;margin:4px 0 0;line-height:1.2}.guinfo .a small{font-size:13px;color:var(--mu);font-weight:500}'+
 '.guinfo .dl{font-size:13px;color:var(--mu)}.guinfo .n{font-size:13.5px;line-height:1.45;margin:6px 0 0}.guinfo .s{font-size:12px;color:var(--dim);margin-top:6px;line-height:1.45}.guinfo .s a{color:var(--ac2)}'+
 '.gutog{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.gutog .chip{font-size:12.5px;padding:6px 10px}'+
 '.gulab{background:transparent!important;border:0!important;box-shadow:none!important;color:#eceae4!important;font-size:11.5px;font-weight:600;padding:0 0 0 2px!important;text-shadow:0 0 3px #000,0 0 2px #000,0 0 1px #000;white-space:nowrap}'+
 '.gulab:before{display:none!important}.guobl{color:#a9b0b7;font-size:10px;letter-spacing:.08em;text-transform:uppercase;text-shadow:0 0 3px #000,0 0 2px #000;white-space:nowrap;text-align:center;pointer-events:none}'+
 '.guleg{background:rgba(11,12,13,.82);border:1px solid #2a2e32;border-radius:5px;padding:6px 8px;color:#d9dad6;font-size:11px;line-height:1.5}'+
 '.guleg i{display:inline-block;width:14px;height:10px;margin-right:6px;vertical-align:-1px;border-radius:2px}'+
 '.gumap .leaflet-control-attribution{background:rgba(11,12,13,.82)!important;color:#9aa0a6!important;font-size:10.5px}.gumap .leaflet-control-attribution a{color:#b3bd8c!important}'+
 '.gumap .leaflet-bar a{background:#15181a!important;color:#e9e9e6!important;border-bottom-color:#2a2e32!important}.gumap .leaflet-bar{border:1px solid #2a2e32!important}'+
 '.gufacts{border-top:1px solid var(--line)}.gufact{padding:10px 2px;border-bottom:1px solid var(--line)}.gufact .k{font-size:13px;color:var(--mu)}'+
 '.gufact .v{font-size:17px;font-weight:650;margin:2px 0}.gufact .s{font-size:12px;color:var(--dim);line-height:1.45}.gufact .s a{color:var(--ac2)}'+
 '.gusides{display:flex;flex-direction:column;gap:6px;margin:4px 0}.gusides div{display:flex;align-items:center;gap:8px;font-size:14px}.gusides img{width:27px;height:18px;border-radius:2px;border:1px solid var(--line);object-fit:cover;flex:0 0 27px}'+
 '.gutl{list-style:none;margin:6px 0 10px;padding:0;border-left:2px solid var(--line)}.gutl li{position:relative;padding:5px 0 9px 16px;font-size:14px;line-height:1.45}'+
 '.gutl li:before{content:"";position:absolute;left:-6px;top:10px;width:10px;height:10px;border-radius:50%;background:#c25b4c}.gutl b{display:block;color:#e6c27a;font-size:12.5px;letter-spacing:.02em}'+
 '.gutab{width:100%;border-collapse:collapse;font-size:13px}.gutab td,.gutab th{padding:7px 4px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.gutab th{color:var(--mu);font-weight:600;font-size:12px}.gutab td.r{text-align:right;white-space:nowrap}'+
 '.gunews{border-top:1px solid var(--line)}.gunew{padding:10px 2px;border-bottom:1px solid var(--line)}.gunew .d{font-size:12px;color:var(--dim)}.gunew .t{font-size:15px;font-weight:600;line-height:1.35;margin:2px 0}'+
 '.gunew .s{font-size:12px;color:var(--mu)}.gunew .s a{color:var(--ac2);margin-right:8px}';
 document.head.appendChild(s); }
function flagImg(iso,title){ return '<img src="flags/'+e(iso)+'.png" alt="" title="'+e(title||'')+'" loading="lazy">'; }
function killMap(){ if(MAP){ try{ MAP.remove(); }catch(x){} MAP=null; } }
window.addEventListener('hashchange',function(){ if(location.hash.indexOf('#/guerras/ucrania')!==0) killMap(); });

// ---------- #/guerras ----------
function card(w){
  var hm=w.map||(window.MAT_GW2_IDS&&window.MAT_GW2_IDS.indexOf(w.id)>=0); var href=hm?'#/guerras/'+w.id:null, tag=hm?'<span class="gwtag on">'+(EN()?'Interactive map ›':'Mapa interactivo ›')+'</span>':'<span class="gwtag">'+(EN()?'Map coming soon':'Mapa próximamente')+'</span>';
  var h='<div class="gwhd"><div class="gwn">'+e(T(w.n))+'</div>'+tag+'</div>';
  h+='<div class="gwfl">'+w.locs.map(function(l){return flagImg(l[0],EN()?l[2]:l[1]);}).join('')+'</div>';
  h+='<div class="gwmeta">'+(EN()?'Where: ':'Dónde: ')+e(w.locs.map(function(l){return EN()?l[2]:l[1];}).join(', '))+'</div>';
  h+='<div class="gwmeta">'+(EN()?'Since ':'Desde ')+'<b>'+e(w.start)+'</b>'+(w.ph?' · '+e(T(w.ph)):'')+'</div>';
  if(w.par) h+='<div class="gwmeta">'+(EN()?'Main parties: ':'Partes principales: ')+e(T(w.par))+'</div>';
  h+='<div class="gwst">● '+(EN()?'Active':'Activa')+' · '+(EN()?'combat deaths 2026: ':'muertes en combate 2026: ')+'<b>'+e(numx(w.f.y26))+'</b> · 2025: <b>'+e(numx(w.f.y25))+'</b> · '+(EN()?'cumulative: ':'acumuladas: ')+e(numx(w.f.cum))+'</div>';
  h+='<div class="gwres">'+e(T(w.res))+'</div>';
  var src='<div class="gwsrc">'+(EN()?'Source: ':'Fuente: ')+'Wikipedia (<a href="'+e(w.src.en)+'" target="_blank" rel="noopener">EN</a>'+(w.src.es?' · <a href="'+e(w.src.es)+'" target="_blank" rel="noopener">ES</a>':'')+')</div>';
  if(href) return '<a class="gwcard map" href="'+href+'">'+h+'<div class="gwsrc">'+(EN()?'Source: Wikipedia (see the war page)':'Fuente: Wikipedia (ver la página de la guerra)')+'</div></a>';
  return '<div class="gwcard">'+h+src+'</div>';
}
function listPage(app,X){
  var h=X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad']])+'<div data-noi18n><h1>'+(EN()?'Wars today':'Guerras en la actualidad')+'</h1>';
  h+='<p class="gwintro">'+(EN()?'Armed conflicts that are active now, as classified by Wikipedia’s “List of ongoing armed conflicts” (revision of '+fd(D.acc)+') by combat deaths in the current or previous year. Figures as given by the source; “—” if there is none.':'Conflictos armados activos hoy, según la clasificación de la lista de Wikipedia «List of ongoing armed conflicts» (revisión del '+fd(D.acc)+') por muertes en combate en el año actual o el anterior. Cifras tal como las da la fuente; «—» si no hay dato.')+'</p>';
  var maj=D.wars.filter(function(w){return w.tier===1;}), min=D.wars.filter(function(w){return w.tier===2;});
  h+='<h2>'+(EN()?'Major wars · 10,000+ deaths a year ('+maj.length+')':'Guerras mayores · más de 10.000 muertes al año ('+maj.length+')')+'</h2>'+maj.map(card).join('');
  h+='<h2>'+(EN()?'Minor wars · 1,000–9,999 deaths a year ('+min.length+')':'Guerras menores · 1.000–9.999 muertes al año ('+min.length+')')+'</h2>'+min.map(card).join('');
  h+='<h2>'+(EN()?'Sources and notes':'Fuentes y notas')+'</h2><p class="gwnote">'+(EN()?'List, start years, affected countries and death figures: <a href="'+e(D.list_url)+'" target="_blank" rel="noopener">Wikipedia, “List of ongoing armed conflicts”</a> (fixed revision; its figures come mainly from ACLED and UCDP). Summaries written by M.A.T from each war’s Wikipedia article, in neutral terms. “Where” lists the countries the source marks as affected, not necessarily belligerents. The list also includes smaller conflicts (100–999 deaths a year) that are not shown here.':'Lista, años de inicio, países afectados y cifras de muertos: <a href="'+e(D.list_url)+'" target="_blank" rel="noopener">Wikipedia, «List of ongoing armed conflicts»</a> (revisión fija; sus cifras proceden sobre todo de ACLED y UCDP) · <a href="'+e(D.list_url_es)+'" target="_blank" rel="noopener">versión en español</a>. Resúmenes redactados por M.A.T a partir del artículo de Wikipedia de cada guerra, en términos neutrales. «Dónde» son los países que la fuente marca como afectados, no necesariamente beligerantes. La lista incluye también conflictos menores (100–999 muertes al año) que aquí no se muestran.')+'</p></div>';
  X.set(h,EN()?'Wars today':'Guerras en la actualidad');
}

// ---------- #/guerras/ucrania ----------
function sel(k){ var U=D.ua; for(var i=0;i<U.snaps.length;i++) if(U.snaps[i].k===k) return i; return U.snaps.length-1; }
function infoHTML(i){
  var U=D.ua, s=U.snaps[i], prev=i>0?U.snaps[i-1]:null, dA=prev?s.a-prev.a:null;
  var h='<div class="d">'+e(T(s.l))+'</div><div class="a">≈'+nf(s.a)+' km² <small>· '+pf(s.p)+' % '+(EN()?'of Ukraine':'de Ucrania')+'</small></div>';
  if(prev) h+='<div class="dl">'+(dA>=0?'+':'−')+nf(Math.abs(dA))+' km² '+(EN()?'vs ':'respecto a ')+e(T(prev.l).replace(/ · .*/,''))+'</div>';
  h+='<div class="n">'+e(T(s.note))+'</div>';
  h+='<div class="s">'+(EN()?'Outline: ':'Contorno: ')+'<a href="'+e(s.src.rev)+'" target="_blank" rel="noopener">'+(EN()?'version of ':'versión del ')+fd(s.src.ts)+'</a> '+(EN()?'of':'de')+' <a href="'+e(s.src.file)+'" target="_blank" rel="noopener">«2022 Russian invasion of Ukraine.svg»</a> (Wikimedia Commons, CC BY-SA 4.0; '+(EN()?'edit by ':'edición de ')+e(s.src.user)+'). '+(EN()?'Area computed by M.A.T (approx.).':'Superficie calculada por M.A.T (aprox.).')+'</div>';
  return h;
}
function ll(rings){ return rings.map(function(r){ return r.map(function(c){ return [c[1],c[0]]; }); }); }
function buildMap(el,cur,onReady){
  var Lf=window.L; killMap();
  var map=Lf.map(el,{zoomControl:true,minZoom:4,maxZoom:12,zoomSnap:0.5,zoomDelta:0.5,maxBounds:[[40.5,15.5],[56.5,47.5]],maxBoundsViscosity:0.7,worldCopyJump:false});
  MAP=map;
  map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  var osm=Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'});
  osm.addTo(map); el.classList.add('dk');
  map.createPane('guobl'); map.getPane('guobl').style.zIndex=405; map.getPane('guobl').style.pointerEvents='none';
  map.createPane('guocc'); map.getPane('guocc').style.zIndex=410;
  map.createPane('gupre'); map.getPane('gupre').style.zIndex=415; map.getPane('gupre').style.pointerEvents='none';
  map.createPane('gubrd'); map.getPane('gubrd').style.zIndex=420; map.getPane('gubrd').style.pointerEvents='none';
  map.createPane('gucit'); map.getPane('gucit').style.zIndex=640;
  var obl=Lf.layerGroup(), oblLab=Lf.layerGroup();
  GD.obl.forEach(function(o){ Lf.polygon(o.g.map(ll),{pane:'guobl',fill:false,color:'#7c858e',weight:0.9,opacity:0.7,interactive:false}).addTo(obl);
    Lf.marker([o.c[1],o.c[0]],{pane:'guobl',interactive:false,keyboard:false,icon:Lf.divIcon({className:'guobl',html:e(T(o.n)),iconSize:[150,14],iconAnchor:[75,7]})}).addTo(oblLab); });
  obl.addTo(map);
  Lf.polygon(GD.ukr.map(ll),{pane:'gubrd',fill:false,color:'#d6b25e',weight:1.6,opacity:0.9,interactive:false}).addTo(map);
  var pre=Lf.polygon(GD.snaps.pre.map(ll),{pane:'gupre',fill:false,color:'#f4e3b5',weight:1.3,dashArray:'5 4',opacity:0.9,interactive:false});
  var occ={}; 
  function occLayer(k){ if(!occ[k]) occ[k]=Lf.polygon(GD.snaps[k].map(ll),{pane:'guocc',color:'#ff6a55',weight:1.4,opacity:0.95,fillColor:'#d0402f',fillOpacity:0.42,interactive:false}); return occ[k]; }
  var cityG=[Lf.layerGroup(),Lf.layerGroup(),Lf.layerGroup()];
  GD.cities.forEach(function(c){ var g=cityG[Math.min(2,Math.max(0,c.r-1))];
    var m=Lf.circleMarker([c.c[1],c.c[0]],{pane:'gucit',radius:c.r===1?4:3,color:'#0b0c0d',weight:1,fillColor:'#f5f3ee',fillOpacity:1});
    m.bindTooltip(e(T(c.n)),{permanent:true,direction:'right',offset:[4,0],className:'gulab',pane:'gucit'}); m.addTo(g); });
  var state={k:cur,pre:true,cities:true,obl:true,base:'dark'};
  function zoomVis(){ var z=map.getZoom();
    if(state.cities){ [5,6.5,7.5].forEach(function(t,i){ if(z>=t) cityG[i].addTo(map); else map.removeLayer(cityG[i]); }); } else cityG.forEach(function(g){map.removeLayer(g);});
    if(state.obl&&z>=6.5) oblLab.addTo(map); else map.removeLayer(oblLab); }
  map.on('zoomend',zoomVis);
  var leg=Lf.control({position:'topright'}); leg.onAdd=function(){ var d=Lf.DomUtil.create('div','guleg'); d.setAttribute('data-noi18n','');
    d.innerHTML='<div><i style="background:rgba(208,64,47,.55);border:1px solid #ff6a55"></i>'+(EN()?'Russian-controlled':'Bajo control ruso')+'</div><div><i style="border:1px dashed #f4e3b5;height:0;margin-bottom:3px"></i>'+(EN()?'Line before 24 Feb 2022':'Línea antes del 24 feb 2022')+'</div><div><i style="border-top:2px solid #d6b25e;height:0;margin-bottom:3px"></i>'+(EN()?'Ukraine (internationally recognised borders)':'Ucrania (fronteras reconocidas)')+'</div>'; return d; };
  leg.addTo(map);
  function show(k){ Object.keys(occ).forEach(function(x){ if(x!==k) map.removeLayer(occ[x]); }); occLayer(k).addTo(map); state.k=k;
    if(state.pre&&k!=='pre') pre.addTo(map); else map.removeLayer(pre); }
  map.fitBounds([[44.35,22.1],[52.4,40.25]],{padding:[4,4]});
  show(cur); zoomVis();
  var api={show:show,map:map,
    toggle:function(what,on){ if(what==='pre'){ state.pre=on; show(state.k); }
      else if(what==='cities'){ state.cities=on; zoomVis(); }
      else if(what==='obl'){ state.obl=on; if(on) obl.addTo(map); else map.removeLayer(obl); zoomVis(); }
      else if(what==='base'){ if(on==='osm') el.classList.remove('dk'); else el.classList.add('dk'); state.base=on; } },
    state:state};
  if(onReady) onReady(api);
  return api;
}
function newsHTML(items){
  return '<div class="gunews">'+items.map(function(n){ return '<div class="gunew"><div class="d">'+fd(n.d)+'</div><div class="t">'+e(T(n.t))+'</div><div class="s">'+n.src.map(function(s){return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>';}).join('')+'</div></div>'; }).join('')+'</div>';
}
function liveNews(fb){
  return fetch('noticias.json?t='+Math.floor(Date.now()/600000)).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(N){
    var all=[].concat(N.items||[]); (N.archivo||[]).forEach(function(a){ (a.items||[]).forEach(function(it){ all.push(it); }); });
    var seen={}, out=[];
    all.forEach(function(it){ if(!it||!(it.paises||[]).some(function(p){return p==='ucrania';})) return; var key=it.t_es||it.t_en; if(seen[key]) return; seen[key]=1;
      var src=(it.fuentes||[]).map(function(f){return [f.n,f.url,f.d];}); var d=src.reduce(function(m,s){return s[2]>m?s[2]:m;},'');
      out.push({t:[it.t_es,it.t_en||it.t_es],d:d,src:src}); });
    out.sort(function(a,b){return a.d<b.d?1:a.d>b.d?-1:0;});
    return out.length?out.slice(0,5):fb;
  }).catch(function(){ return fb; });
}
function uaPage(app,X){
  var U=D.ua, q=X.qs?X.qs():{}, cur=U.snaps[sel(q.s||U.snaps[U.snaps.length-1].k)].k, ix=sel(cur);
  var h=X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad','#/guerras'],[EN()?'Ukraine – Russia':'Ucrania – Rusia']])+'<div data-noi18n>';
  h+='<div class="guhd">'+flagImg('ru','')+'<span class="vs">VS</span>'+flagImg('ua','')+'</div><h1>'+(EN()?'Russo-Ukrainian war':'Guerra ruso-ucraniana')+'</h1>';
  h+='<p class="gwintro">'+(EN()?'Territory under Russian control on each date, on an interactive map: drag to move, pinch or use +/− to zoom down to cities. Choose a date:':'Territorio bajo control ruso en cada fecha, en un mapa interactivo: arrastra para moverte y pellizca o usa +/− para acercarte hasta las ciudades. Elige una fecha:')+'</p>';
  h+='<div class="chips gusnaps" role="group" aria-label="'+(EN()?'Date':'Fecha')+'">'+U.snaps.map(function(s,i){return '<button type="button" class="chip" data-k="'+e(s.k)+'" aria-pressed="'+(s.k===cur)+'">'+e(T(s.l))+'</button>';}).join('')+'</div>';
  h+='<input type="range" class="gurange" min="0" max="'+(U.snaps.length-1)+'" step="1" value="'+ix+'" aria-label="'+(EN()?'Timeline':'Línea temporal')+'">';
  h+='<div class="gumap" id="gumap"><div class="gumsg">'+(EN()?'Loading map…':'Cargando mapa…')+'</div></div>';
  h+='<div class="gutog"><button type="button" class="chip" data-t="pre" aria-pressed="true">'+(EN()?'Pre-2022 line':'Línea antes de 2022')+'</button><button type="button" class="chip" data-t="cities" aria-pressed="true">'+(EN()?'Cities':'Ciudades')+'</button><button type="button" class="chip" data-t="obl" aria-pressed="true">'+(EN()?'Oblasts':'Óblasts')+'</button><button type="button" class="chip" data-t="base" aria-pressed="false">'+(EN()?'Light map':'Mapa claro')+'</button></div>';
  h+='<div class="guinfo" id="guinfo">'+infoHTML(ix)+'</div>';
  // key facts
  h+='<h2>'+(EN()?'Key facts':'Datos clave')+'</h2><div class="gufacts"><div class="gufact"><div class="k">'+(EN()?'Start':'Inicio')+'</div><div class="v" style="font-size:15px">'+e(T(U.start))+'</div></div>';
  h+='<div class="gufact"><div class="k">'+(EN()?'Belligerents':'Beligerantes')+'</div><div class="gusides">'+U.sides[0].map(function(s){return '<div>'+flagImg(s[0],'')+e(EN()?s[2]:s[1])+'</div>';}).join('')+'<div style="color:var(--dim);font-size:12px;letter-spacing:.12em">VS</div>'+U.sides[1].map(function(s){return '<div>'+flagImg(s[0],'')+e(EN()?s[2]:s[1])+'</div>';}).join('')+'</div></div>';
  h+=U.facts.map(function(f){ return '<div class="gufact"><div class="k">'+e(T(f.k))+'</div><div class="v">'+e(T(f.v)||'—')+'</div><div class="s">'+(f.n?e(T(f.n))+' ':'')+(EN()?'Source: ':'Fuente: ')+'<a href="'+e(f.u)+'" target="_blank" rel="noopener">'+e(f.s)+'</a> · '+e(T(f.d))+'</div></div>'; }).join('')+'</div>';
  // published area estimates
  h+='<h2>'+(EN()?'Published estimates of the occupied area':'Estimaciones publicadas de la superficie ocupada')+'</h2><table class="gutab"><tr><th>'+(EN()?'Date':'Fecha')+'</th><th class="r">km²</th><th class="r">%</th><th>'+(EN()?'Source':'Fuente')+'</th></tr>'+U.est.map(function(r){ return '<tr><td>'+fd(r.d)+'</td><td class="r">'+e(numx(r.a))+'</td><td class="r">'+e(EN()?r.p.replace(',','.'):r.p)+'</td><td>'+e(r.s)+'</td></tr>'; }).join('')+'</table>';
  h+='<p class="gwnote">'+(EN()?'Compiled in <a href="'+e(U.est_src)+'" target="_blank" rel="noopener">Wikipedia</a> (2021–2025) and Russia Matters (2026). Methods differ between sources.':'Recopiladas en <a href="'+e(U.est_src)+'" target="_blank" rel="noopener">Wikipedia</a> (2021–2025) y Russia Matters (2026). Cada fuente usa un método distinto.')+'</p>';
  // timeline
  h+='<h2>'+(EN()?'Main phases':'Fases principales')+'</h2><ul class="gutl">'+U.timeline.map(function(t){return '<li><b>'+e(T(t.d))+'</b>'+e(T(t.t))+'</li>';}).join('')+'</ul><p class="gwnote">'+(EN()?'Sources: ':'Fuentes: ')+'<a href="'+e(U.tl_src[0])+'" target="_blank" rel="noopener">Wikipedia</a> · <a href="'+e(U.tl_src[1])+'" target="_blank" rel="noopener">Territorial control during the Russo-Ukrainian war</a></p>';
  // news
  h+='<h2>'+(EN()?'Latest confirmed news':'Últimas noticias confirmadas')+'</h2><div id="gunewsbox">'+newsHTML(U.news_fb)+'</div><p class="gwnote">'+(EN()?'Facts only, from reputable outlets (each item links its sources). Updated with the daily news run · <a href="#/noticias">Geopolitics today ›</a>':'Solo hechos, de medios de referencia (cada noticia enlaza sus fuentes). Se actualiza con la revisión diaria de noticias · <a href="#/noticias">Geopolítica hoy ›</a>')+'</p>';
  // method + licences
  h+='<h2>'+(EN()?'About the map':'Sobre el mapa')+'</h2><p class="gwnote">'+(EN()?'The red outlines were digitised by M.A.T from historical versions of <a href="https://commons.wikimedia.org/wiki/File:2022_Russian_invasion_of_Ukraine.svg" target="_blank" rel="noopener">“2022 Russian invasion of Ukraine.svg”</a> on Wikimedia Commons (authors: Viewsridge and other contributors; licence <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>), which is based on ISW assessments and Wikipedia’s detailed control map. They were georeferenced with Natural Earth (public domain) using 49 cities; expect an error of about 1–3 km. Areas are computed by M.A.T on that geometry and leave out lagoons and reservoirs, so they come out a few per cent below published figures; contested areas count as drawn on the source map. The newest free outline is from 20 Dec 2025: there is no free map for Oct 2026, so for “now” see the latest published figure above. The map data layer (guerras_ua.json.gz) is shared under CC BY-SA 4.0. Base map: © OpenStreetMap contributors (shown darkened by default). Oblast borders: Natural Earth. Map library: Leaflet (BSD-2-Clause). Borders shown are the internationally recognised ones, including Crimea.':'Los contornos rojos los ha digitalizado M.A.T a partir de versiones históricas del mapa <a href="https://commons.wikimedia.org/wiki/File:2022_Russian_invasion_of_Ukraine.svg" target="_blank" rel="noopener">«2022 Russian invasion of Ukraine.svg»</a> de Wikimedia Commons (autores: Viewsridge y otros colaboradores; licencia <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.es" target="_blank" rel="noopener">CC BY-SA 4.0</a>), elaborado con las evaluaciones del ISW y el mapa detallado de control de Wikipedia. Están georreferenciados con Natural Earth (dominio público) a partir de 49 ciudades; el error es de 1–3 km aproximadamente. Las superficies las calcula M.A.T sobre esa geometría y no incluyen lagunas ni embalses, por eso salen unos puntos por debajo de las cifras publicadas; las zonas disputadas cuentan como en el mapa original. El contorno libre más reciente es del 20 dic 2025: no existe un mapa libre de oct 2026, así que para «ahora» mira la última cifra publicada, arriba. La capa de datos del mapa (guerras_ua.json.gz) se comparte bajo CC BY-SA 4.0. Mapa base: © colaboradores de OpenStreetMap (oscurecido por defecto). Límites de óblasts: Natural Earth. Librería del mapa: Leaflet (licencia BSD-2-Clause). Las fronteras son las reconocidas internacionalmente, Crimea incluida.')+'</p></div>';
  X.set(h,EN()?'Russo-Ukrainian war':'Guerra ruso-ucraniana');
  var API=null;
  function pick(k,from){ var i=sel(k); cur=U.snaps[i].k;
    [].forEach.call(document.querySelectorAll('.gusnaps .chip'),function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-k')===cur)); if(b.getAttribute('data-k')===cur&&from!=='init'&&b.scrollIntoView) try{ b.scrollIntoView({block:'nearest',inline:'center'}); }catch(x){} });
    var r=document.querySelector('.gurange'); if(r&&from!=='range') r.value=i;
    var inf=document.getElementById('guinfo'); if(inf) inf.innerHTML=infoHTML(i);
    if(API) API.show(cur);
    try{ history.replaceState(null,'','#/guerras/ucrania?s='+cur+(EN()&&/lang=en/.test(location.hash)?'&lang=en':'')); }catch(x){} }
  [].forEach.call(document.querySelectorAll('.gusnaps .chip'),function(b){ b.addEventListener('click',function(){ pick(b.getAttribute('data-k')); }); });
  var rg=document.querySelector('.gurange'); if(rg) rg.addEventListener('input',function(){ pick(U.snaps[+rg.value].k,'range'); });
  [].forEach.call(document.querySelectorAll('.gutog .chip'),function(b){ b.addEventListener('click',function(){ var t=b.getAttribute('data-t'), on=b.getAttribute('aria-pressed')!=='true'; b.setAttribute('aria-pressed',String(on)); if(!API) return; if(t==='base') API.toggle('base',on?'osm':'dark'); else API.toggle(t,on); }); });
  var el=document.getElementById('gumap');
  Promise.all([loadLeaflet(),loadGeo()]).then(function(){ if(!document.body.contains(el)) return; el.innerHTML=''; API=buildMap(el,cur); window.MAT_GUERRAS_DBG=API; if(window.MAT_GW2_UA) window.MAT_GW2_UA(API); }).catch(function(){ if(document.body.contains(el)) el.innerHTML='<div class="gumsg">'+(EN()?'The map could not be loaded. Check your connection.':'No se pudo cargar el mapa. Comprueba la conexión.')+'</div>'; });
  liveNews(U.news_fb).then(function(items){ var b=document.getElementById('gunewsbox'); if(b) b.innerHTML=newsHTML(items); });
}
function route(app,X){
  css(); var p=X.p||[];
  var g2=!!(p[1]&&window.MAT_GW2_IDS&&window.MAT_GW2_IDS.indexOf(p[1])>=0);
  if(p[1]&&p[1]!=='ucrania'&&!g2){ location.replace('#/guerras'); return; }
  if(!D){ X.set(X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Wars today':'Guerras en la actualidad']])+'<p class="sub" style="padding:24px 0">'+(EN()?'Loading…':'Cargando…')+'</p>',EN()?'Wars today':'Guerras en la actualidad');
    var h0=location.hash; load().then(function(){ if(location.hash===h0) route(app,X); }).catch(function(){ X.set('<p class="sub" style="padding:24px 0">'+(EN()?'Could not load the data.':'No se pudieron cargar los datos.')+'</p>'); }); return; }
  if(p[1]==='ucrania') return uaPage(app,X);
  if(g2&&window.MAT_GW2_PAGE){ killMap(); var w2=D.wars.filter(function(x){return x.id===p[1];})[0]; return window.MAT_GW2_PAGE(app,X,p[1],w2,{loadLeaflet:loadLeaflet,killMap:killMap}); }
  killMap(); return listPage(app,X);
}
window.MAT_GUERRAS=route;
})();
