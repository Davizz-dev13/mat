(function(){
"use strict";
// M.A.T · Batallas históricas (#/batallas, #/batallas/<id>). Motor genérico: cada batalla vive en batallas/<id>.json
// (pasos, vistas del mapa, unidades, flechas, defensas, playas, fuerzas y fuentes). Mapa SVG dibujado por M.A.T.
var IDX=null, CACHE={};
function EN(){return window.MAT_LANG==='en';}
function T(a){ if(a==null) return ''; if(Array.isArray(a)) return EN()?(a[1]!=null?a[1]:a[0]):a[0]; a=String(a); var i=a.indexOf('|'); if(i>0) return EN()?a.slice(i+1):a.slice(0,i); return a; }
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function V(){var s=document.querySelector('script[src^="loader.js"]')||document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1';}
function get(f){ return fetch(f+'?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }); }
function RM(){ try{ return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(x){ return false; } }
var NS='http://www.w3.org/2000/svg';
var ICON='<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><rect x="6" y="9" width="36" height="30" rx="2" fill="#e9dcb8" stroke="#8a6d3b" stroke-width="1.4"/><path d="M9 30c5-2 8 2 13 0s7-6 11-5 5 3 6 2" fill="none" stroke="#5b4526" stroke-width="1.3"/><path d="M14 20q8-7 17 1" fill="none" stroke="#1d3f8a" stroke-width="1.8" stroke-linecap="round"/><path d="M28 17.5l3.6 3.9-5.1.4z" fill="#1d3f8a"/><rect x="31" y="25" width="7" height="5" fill="none" stroke="#222" stroke-width="1.2"/></svg>';
window.MAT_BATALLAS_ICON=ICON;
var UI={es:{h:'Batallas históricas',home:'Inicio',sub:'Grandes batallas contadas paso a paso sobre mapas de estilo antiguo: dónde estaba cada fuerza, con qué carros de combate y aviones, por dónde atacaron y los pequeños detalles. Datos de fuentes públicas citadas en cada paso.',ver:'Ver batalla',soon:'Próximamente',prev:'Anterior',next:'Siguiente',paso:'Paso',det:'Detalle',src:'Fuentes de este paso',playas:'Las cinco playas',fz:'Fuerzas enfrentadas',fuentes:'Todas las fuentes',leyenda:'Leyenda del mapa',back:'Volver a los pasos',vermap:'Ver en el mapa',hora:'Hora H',sec:'Sector',uds:'Unidades',mandos:'Mandos',tropas:'Desembarcados',bajas:'Bajas aliadas (aprox.)',carros:'Carros de combate y vehículos',de:'Defensores alemanes',cur:'Curiosidad',defs:'Defensas en el mapa',cifras:'Cifras',medios:'Material (fichas M.A.T)',tap:'Toca una unidad o una defensa del mapa para ver más.',eq:'Material',aprox:'Posición aproximada',cerrar:'Cerrar',load:'Cargando…',err:'No se pudo cargar la batalla.',timeline:'Línea de tiempo',notfound:'Batalla no encontrada'},
 en:{h:'Historic battles',home:'Home',sub:'Great battles told step by step on old-style maps: where each force was, with which tanks and aircraft, where they attacked and the small details. Data from public sources cited in every step.',ver:'View battle',soon:'Coming soon',prev:'Previous',next:'Next',paso:'Step',det:'Detail',src:'Sources for this step',playas:'The five beaches',fz:'Opposing forces',fuentes:'All sources',leyenda:'Map legend',back:'Back to the steps',vermap:'Show on the map',hora:'H-Hour',sec:'Sector',uds:'Units',mandos:'Commanders',tropas:'Landed',bajas:'Allied casualties (approx.)',carros:'Tanks and vehicles',de:'German defenders',cur:'Did you know?',defs:'Defences on the map',cifras:'Figures',medios:'Equipment (M.A.T entries)',tap:'Tap a unit or a defence on the map for more.',eq:'Equipment',aprox:'Approximate position',cerrar:'Close',load:'Loading…',err:'Could not load the battle.',timeline:'Timeline',notfound:'Battle not found'}};
function U_(k){return UI[EN()?'en':'es'][k];}
var NAT={us:'EE. UU.|USA',uk:'Reino Unido|UK',ca:'Canadá|Canada',fr:'Francia|France',de:'Alemania|Germany'};
var FLAG={us:'us',uk:'gb',ca:'ca',fr:'fr',de:'de'};

var CSS='.bt{--pa:#efe3c2;--pa2:#e4d3a8;--ink:#3b2b16;--ink2:#6b5433;--al:#1d3f8a;--al2:#b3261e;--ge:#2b2b2b;--ge2:#7a7a72;color:var(--tx)}'+
'.bt .bt-title{font-family:"Iowan Old Style","Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;letter-spacing:.02em}'+
'.bt h1.bt-title{font-size:26px;line-height:1.15;margin:6px 0 2px}'+
'.bt .bt-meta{color:var(--mu);font-size:13px;margin:0 0 10px}'+
'.bt-list{display:grid;gap:12px;margin:12px 0 24px}'+
'.bt-card{display:flex;gap:12px;align-items:center;padding:14px;border-radius:8px;background:#e9dcb8 radial-gradient(circle at 30% 20%,#f3e8cb,#dcc89a);color:#3b2b16;text-decoration:none;border:1px solid #b89a63;box-shadow:inset 0 0 30px rgba(110,80,30,.25)}'+
'.bt-card .t{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:19px;font-weight:700}.bt-card .d{font-size:13px;color:#5b4526}.bt-card .go{margin-left:auto;font-size:22px;color:#6b5433}'+
'.bt-card.soon{opacity:.6;filter:grayscale(.4)}.bt-card .bdg{font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1px solid #8a6d3b;border-radius:3px;padding:2px 6px;margin-left:6px;vertical-align:2px}'+
'.bt-mapw{position:relative;border-radius:6px;overflow:hidden;border:1px solid #8a6d3b;background:#e7d7ad;box-shadow:inset 0 0 50px rgba(90,60,20,.45)}'+
'.bt-mapw:before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.33;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3CfeColorMatrix values=%270 0 0 0 .45 0 0 0 0 .33 0 0 0 0 .18 0 0 0 .55 0%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")}'+
'.bt-mapw:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(80,50,15,.35) 100%)}'+
'.bt-map{display:block;width:100%;aspect-ratio:4/3;touch-action:manipulation}@media(min-width:900px){.bt-map{aspect-ratio:16/10}}'+
'.bt-map .sea{fill:#bccbc6}.bt-map .wl{fill:none;stroke:#8fb0b4;stroke-opacity:.55;stroke-linejoin:round}.bt-map .grat{fill:none;stroke:#a08a5c;stroke-opacity:.35}.bt-map .land{fill:#efe3c2;fill-rule:evenodd}.bt-map .landov{fill:#efe3c2;stroke:#3b2b16;stroke-linejoin:round}'+
'.bt-map .coast{fill:none;stroke:#3b2b16;stroke-linejoin:round;stroke-linecap:round}.bt-map .riv{fill:none;stroke:#5c7794;stroke-opacity:.8}.bt-map .flood{fill:url(#btFlood);stroke:#5c7794;stroke-opacity:.5}'+
'.bt-map .area{fill:#1d3f8a;fill-opacity:.16;stroke:#1d3f8a;stroke-dasharray:4 3;fill-rule:nonzero}.bt-map .beach{fill:none;stroke-linecap:round}'+
'.bt-map text{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;fill:#3b2b16;paint-order:stroke;stroke:#efe3c2;stroke-width:3px;stroke-linejoin:round}'+
'.bt-map .sym{transition:opacity .45s}.bt-map .sym.off{opacity:0;pointer-events:none}.bt-map .hide{display:none}.bt-map .tap{cursor:pointer}'+
'.bt-map .arw{transition:opacity .5s}.bt-map .arw.draw path.ln{stroke-dasharray:1 1;stroke-dashoffset:1;animation:btdraw 1.2s ease-out forwards}@keyframes btdraw{to{stroke-dashoffset:0}}'+
'.bt-map.wide .ulab{display:none}.bt-map .ttl{font-size:12px;letter-spacing:.18em;text-transform:uppercase}'+
'@media(prefers-reduced-motion:reduce){.bt-map .sym,.bt-map .arw{transition:none}.bt-map .arw.draw path.ln{animation:none;stroke-dashoffset:0}}'+
'.bt-cap{position:absolute;left:6px;bottom:6px;z-index:3;background:rgba(239,227,194,.9);color:#3b2b16;border:1px solid #8a6d3b;border-radius:3px;padding:2px 7px;font:600 11px/1.3 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;letter-spacing:.03em;max-width:calc(100% - 12px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.bt-ctl{display:flex;align-items:center;gap:8px;margin:10px 0 4px}.bt-ctl .btn{flex:0 0 auto;padding:9px 12px;font-size:14px}.bt-ctl .num{flex:1;text-align:center;color:var(--mu);font-size:13px}'+
'.bt-rng{width:100%;margin:6px 0 2px;accent-color:#b08d4f}.bt-ticks{display:flex;justify-content:space-between;font-size:10px;color:var(--dim);margin:0 2px 8px}'+
'.bt-step{background:#efe3c2;color:#3b2b16;border:1px solid #b89a63;border-radius:6px;padding:14px 14px 10px;margin:8px 0 12px;box-shadow:inset 0 0 40px rgba(120,85,30,.18)}'+
'.bt-step .hh{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a5c2e;margin:0 0 2px}.bt-step h2{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:21px;line-height:1.2;margin:0 0 8px;color:#2d2010}'+
'.bt-step p{margin:0 0 10px;font-size:15px;line-height:1.55}.bt-det{border-left:3px solid #b3261e;background:rgba(255,250,235,.7);padding:8px 10px;margin:4px 0 10px;border-radius:0 4px 4px 0}.bt-det b{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#b3261e;margin-bottom:2px}.bt-det span.tt{display:block;font-weight:700;margin-bottom:3px}'+
'.bt-step details{font-size:13px;margin-top:4px}.bt-step summary{cursor:pointer;color:#6b5433}.bt-step ol,.bt-src ol{margin:6px 0 4px 18px;padding:0}.bt-step a,.bt-src a{color:#1d3f8a}'+
'.bt-info{background:#f6eed8;color:#3b2b16;border:1px solid #b89a63;border-radius:6px;padding:10px 12px;margin:8px 0;font-size:14px;position:relative}.bt-info .x{position:absolute;right:6px;top:4px;background:none;border:0;font-size:20px;color:#6b5433;cursor:pointer}.bt-info h3{margin:0 24px 4px 0;font-size:16px}.bt-info .tags{margin-top:6px}.bt-info .tag{background:#fff8e6;color:#1d3f8a;border-color:#c9ae78}'+
'.bt-sec{margin:18px 0 6px}.bt-sec>summary{cursor:pointer;font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:19px;font-weight:700;padding:8px 0;border-bottom:1px solid var(--line);list-style:none}.bt-sec>summary::-webkit-details-marker{display:none}.bt-sec>summary:after{content:"＋";float:right;color:var(--dim)}.bt-sec[open]>summary:after{content:"－"}'+
'.bt-beach{border:1px solid var(--line);border-radius:6px;margin:10px 0;background:var(--s1)}.bt-beach>summary{cursor:pointer;padding:10px 12px;display:flex;gap:10px;align-items:center;list-style:none}.bt-beach>summary::-webkit-details-marker{display:none}.bt-beach .bn{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-size:18px;font-weight:700}.bt-beach .bh{margin-left:auto;color:var(--mu);font-size:13px}.bt-beach .bb{padding:0 12px 12px;font-size:14px}.bt-beach dl{margin:0}.bt-beach dt{color:var(--mu);font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-top:8px}.bt-beach dd{margin:2px 0 0}'+
'.bt-fz{display:grid;gap:12px}@media(min-width:760px){.bt-fz{grid-template-columns:1fr 1fr}}.bt-fz>div{border:1px solid var(--line);border-radius:6px;padding:12px;background:var(--s1)}.bt-fz h3{margin:0 0 6px;font-size:18px;display:flex;gap:6px;align-items:center}.bt-fz table{width:100%;border-collapse:collapse;font-size:13px}.bt-fz td{padding:4px 0;border-bottom:1px solid var(--line);vertical-align:top}.bt-fz td:first-child{color:var(--mu);padding-right:8px;width:48%}.bt-fz .tags{margin-top:6px}.bt-fz .tag small{color:var(--mu)}'+
'.bt-leg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 10px;font-size:12px;color:var(--mu);margin:8px 0}.bt-leg span{display:flex;gap:6px;align-items:center}.bt-leg svg{flex:0 0 34px}'+
'.bt-flag{width:20px;height:13px;border-radius:2px;vertical-align:-2px}.bt-cred{font-size:11px;color:var(--dim);margin:6px 0 0}.bt-modep{display:none;margin:8px 0}.bt-modep.on{display:block}';
function css(){ if(document.getElementById('bt-css')) return; var s=document.createElement('style'); s.id='bt-css'; s.textContent=CSS; document.head.appendChild(s); }

// ---------- list page ----------
function listPage(app,X){
  set0(X,'<p class="sub" style="padding:24px 0">'+U_('load')+'</p>',U_('h'));
  (IDX?Promise.resolve(IDX):get('batallas/index.json').then(function(d){IDX=d;return d;})).then(function(L){
    if(!/^#\/batallas\/?$/.test(location.hash.split('?')[0])) return;
    var h=X.crumbs([[U_('home'),'#/'],[U_('h')]])+'<div class="bt" data-noi18n><h1 class="bt-title">'+e(U_('h'))+'</h1><p class="sub">'+e(U_('sub'))+'</p><div class="bt-list">';
    L.forEach(function(b){
      if(b.soon) h+='<div class="bt-card soon" aria-disabled="true">'+ICON+'<div><div class="t">'+e(T(b.t))+'<span class="bdg">'+e(U_('soon'))+'</span></div><div class="d">'+e(T(b.fecha))+' · '+e(T(b.lugar))+'</div></div></div>';
      else h+='<a class="bt-card" href="#/batallas/'+e(b.id)+'">'+ICON+'<div><div class="t">'+e(T(b.t))+'</div><div class="d">'+e(T(b.fecha))+' · '+e(T(b.lugar))+'</div><div class="d" style="margin-top:3px">'+e(T(b.d))+'</div></div><span class="go">›</span></a>';
    });
    h+='</div></div>'; X.set(h,U_('h'));
  }).catch(function(){ X.set(X.crumbs([[U_('home'),'#/'],[U_('h')]])+'<p class="sub">'+U_('err')+'</p>',U_('h')); });
}
function set0(X,h,t){ X.set(h,t); }

// ---------- projection & helpers ----------
function mkP(pr){ return function(ll){ return [(ll[0]-pr.lon0)*pr.kx, -(ll[1]-pr.lat0)*pr.ky]; }; }
function el(tag,at,par){ var n=document.createElementNS(NS,tag); if(at) for(var k in at) n.setAttribute(k,at[k]); if(par) par.appendChild(n); return n; }
function curve(pts){ // Catmull-Rom -> Bezier
  if(pts.length<3) return 'M'+pts.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' L');
  var d='M'+pts[0][0].toFixed(2)+','+pts[0][1].toFixed(2);
  for(var i=0;i<pts.length-1;i++){ var p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    var c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6], c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=' C'+c1[0].toFixed(2)+','+c1[1].toFixed(2)+' '+c2[0].toFixed(2)+','+c2[1].toFixed(2)+' '+p2[0].toFixed(2)+','+p2[1].toFixed(2); }
  return d; }
function wob(pts,amp,seed){ // hand-drawn wobble: extra jittered midpoints
  var out=[pts[0]], s=seed||1; function rnd(){ s=(s*9301+49297)%233280; return s/233280-.5; }
  for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L;
    [.33,.66].forEach(function(t){ var j=rnd()*amp*L; out.push([a[0]+dx*t+nx*j,a[1]+dy*t+ny*j]); }); out.push(b); }
  return out; }

// unit symbol (NATO-like box), size in screen px (scaled by group transform)
function unitSym(u){
  var g=document.createElementNS(NS,'g'), al=u.s==='al';
  var stroke=al?'#1d3f8a':'#1f1f1f', fill=al?'rgba(214,226,246,.95)':'rgba(170,170,162,.95)';
  if(u.ty==='naval'){ el('path',{d:'M-13,-2 L13,-2 L9,5 L-9,5 Z',fill:fill,stroke:stroke,'stroke-width':1.6},g); el('path',{d:'M-4,-2 L-4,-7 L3,-7 L3,-2 M-1,-7 L-1,-10',fill:'none',stroke:stroke,'stroke-width':1.4},g); }
  else {
    el('rect',{x:-12,y:-8,width:24,height:16,fill:fill,stroke:stroke,'stroke-width':1.6,'stroke-dasharray':u.ty==='fake'?'3 2':''},g);
    if(u.ty==='inf'||u.ty==='para'||u.ty==='glider'||u.ty==='rng'||u.ty==='fake') el('path',{d:'M-12,-8 L12,8 M-12,8 L12,-8',stroke:stroke,'stroke-width':1.3},g);
    if(u.ty==='arm') el('ellipse',{cx:0,cy:0,rx:8,ry:4.2,fill:'none',stroke:stroke,'stroke-width':1.5},g);
    if(u.ty==='para') el('path',{d:'M-6,5 Q-3,1 0,5 Q3,1 6,5',fill:'none',stroke:stroke,'stroke-width':1.3},g);
    if(u.ty==='glider') el('path',{d:'M-7,4 L7,4',stroke:stroke,'stroke-width':1.6},g);
    if(u.ty==='rng'||u.ty==='cdo'){ var t=el('text',{x:0,y:4,'text-anchor':'middle','font-size':10,'font-weight':700,style:'stroke:none;fill:'+stroke},g); t.textContent=u.ty==='rng'?'R':'C'; if(u.ty==='cdo') el('path',{d:'M-12,-8 L12,8 M-12,8 L12,-8',stroke:stroke,'stroke-width':.8,'stroke-opacity':.5},g); }
    if(u.sz){ var z=el('text',{x:0,y:-10.5,'text-anchor':'middle','font-size':8,'font-weight':700,style:'stroke:none;fill:'+stroke},g); z.textContent=u.sz; }
  }
  if(al&&u.nat&&u.ty!=='fake'){ var r=el('rect',{x:9,y:-12,width:12,height:7,fill:'#b3261e',rx:1},g); var tn=el('text',{x:15,y:-6.6,'text-anchor':'middle','font-size':5.8,'font-weight':700,style:'stroke:none;fill:#fff'},g); tn.textContent=u.nat==='uk'?'GB':u.nat.toUpperCase(); }
  var lb=el('text',{x:0,y:u.ty==='naval'?16:19,'text-anchor':'middle','font-size':9.5,'font-weight':600,'class':'ulab'},g); lb.textContent=T(u.sn||u.n);
  el('rect',{x:-16,y:-14,width:32,height:36,fill:'transparent'},g);
  return g; }
function defSym(d){
  var g=document.createElementNS(NS,'g');
  if(d.k==='bat'){ el('circle',{cx:0,cy:0,r:5.5,fill:'#3a3a36',stroke:'#111','stroke-width':1},g); el('path',{d:'M0,0 L10,-6',stroke:'#111','stroke-width':2.2,'stroke-linecap':'round'},g); }
  else { el('path',{d:'M-6,3 A6,6 0 0 1 6,3 Z',fill:'#2b2b2b',stroke:'#111','stroke-width':.8},g); el('path',{d:'M-4,-2.5 L-6.5,-6 M0,-3.5 L0,-8 M4,-2.5 L6.5,-6',stroke:'#111','stroke-width':1.1},g); }
  var t=el('text',{x:0,y:13,'text-anchor':'middle','font-size':8.5,'font-style':'italic'},g); t.textContent=T(d.n);
  el('rect',{x:-12,y:-10,width:24,height:26,fill:'transparent'},g);
  return g; }
function mkSym(m){
  var g=document.createElementNS(NS,'g'), t;
  if(m.k==='dz'){ el('circle',{r:9,fill:'rgba(29,63,138,.10)',stroke:'#1d3f8a','stroke-width':1.2,'stroke-dasharray':'2 2'},g); t=el('text',{y:3,'text-anchor':'middle','font-size':7.5,'font-weight':700,style:'stroke:none;fill:#1d3f8a'},g); t.textContent=m.n; }
  else if(m.k==='bomb'){ el('path',{d:'M0,-9 L2.5,-3 L9,-3 L4,1 L6,8 L0,4 L-6,8 L-4,1 L-9,-3 L-2.5,-3 Z',fill:'#c0392b',stroke:'#6d1a12','stroke-width':.8,'fill-opacity':.85},g); }
  else if(m.k==='zone'){ el('circle',{r:12,fill:'none',stroke:'#1d3f8a','stroke-width':1.4,'stroke-dasharray':'3 2'},g); t=el('text',{y:m.below?24:-15,'text-anchor':'middle','font-size':9,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='storm'){ el('path',{d:'M-10,0 a10,10 0 1 1 10,10 M10,0 a10,10 0 1 1 -10,-10',fill:'none',stroke:'#5c7794','stroke-width':1.8},g); t=el('text',{y:22,'text-anchor':'middle','font-size':9,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='bridge'){ el('path',{d:'M-7,-3 L7,-3 M-7,3 L7,3 M-9,-6 L-7,-3 M9,-6 L7,-3 M-9,6 L-7,3 M9,6 L7,3',stroke:'#3b2b16','stroke-width':1.6,fill:'none'},g); t=el('text',{y:-8,'text-anchor':'middle','font-size':8.5,'font-weight':700},g); t.textContent=T(m.n); }
  else if(m.k==='harbour'){ el('path',{d:'M-10,4 L-10,-4 L10,-4 L10,4 M-6,-4 L-6,-9 M6,-4 L6,-9',stroke:'#1d3f8a','stroke-width':2,fill:'none'},g); t=el('text',{y:-12,'text-anchor':'middle','font-size':8.5,'font-weight':700,style:'fill:#1d3f8a'},g); t.textContent=T(m.n); }
  else { t=el('text',{y:0,'text-anchor':'middle','font-size':11,'font-style':'italic','font-weight':700,'letter-spacing':'.08em',style:m.c==='de'?'fill:#222':m.c==='fake'?'fill:#6b6b60':'fill:#1d3f8a'},g); t.textContent=T(m.n); }
  return g; }
function placeSym(p){
  var g=document.createElementNS(NS,'g'), big=p.k==='city', port=p.k==='port';
  if(port) el('path',{d:'M0,-4 L0,4 M-3,1 Q0,6 3,1 M-2,-2 L2,-2',stroke:'#3b2b16','stroke-width':1.2,fill:'none'},g);
  else el('circle',{r:big?3.2:2.2,fill:big?'#3b2b16':'#efe3c2',stroke:'#3b2b16','stroke-width':1.1},g);
  var t=el('text',{x:5,y:3.5,'font-size':big?10.5:9,'font-style':big?'normal':'italic','font-weight':big?700:400},g); t.textContent=T(p.n);
  return g; }

// ---------- battle page ----------
function battle(app,X,id){
  css();
  X.set('<p class="sub" style="padding:24px 0">'+U_('load')+'</p>',U_('h'));
  (CACHE[id]?Promise.resolve(CACHE[id]):get('batallas/'+id+'.json').then(function(d){CACHE[id]=d;return d;})).then(function(D){
    if(location.hash.split('?')[0].replace(/\/$/,'')!=='#/batallas/'+id) return;
    render(app,X,D);
  }).catch(function(err){ X.set(X.crumbs([[U_('home'),'#/'],[U_('h'),'#/batallas']])+'<h1>'+U_('notfound')+'</h1><p class="sub">'+U_('err')+'</p>',U_('h')); if(window.console) console.warn(err); });
}
function srcList(D,keys){ return '<ol>'+keys.map(function(k){ var s=D.src[k]; return s?'<li><a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a></li>':''; }).join('')+'</ol>'; }
function flag(n){ return '<img class="bt-flag" src="flags/'+FLAG[n]+'.png" alt="" loading="lazy">'; }
function ficha(id,name,note){ return '<a class="tag" href="#/a/'+e(id)+'">'+e(name)+(note?' <small>· '+e(T(note))+'</small>':'')+'</a>'; }
function render(app,X,D){
  var N=D.steps.length, qm=(location.hash.match(/[?&]paso=(\d+)/)||[])[1], cur=qm?Math.max(0,Math.min(N-1,(+qm)-1)):0;
  var h=X.crumbs([[U_('home'),'#/'],[U_('h'),'#/batallas'],[T(D.t)]])+'<div class="bt" data-noi18n>';
  h+='<h1 class="bt-title">'+e(T(D.t))+'</h1><p class="bt-meta">'+e(T(D.fecha))+' · '+e(T(D.lugar))+' · '+e(T(D.guerra))+'</p><p class="sub" style="margin-top:0">'+e(T(D.intro))+'</p>';
  h+='<div class="bt-mapw"><div class="bt-cap" id="btcap"></div><svg class="bt-map" id="btmap" role="img" aria-label="'+e(T(D.t))+'"></svg></div>';
  h+='<div class="bt-modep" id="btmodep"><button type="button" class="btn" id="btback">‹ '+e(U_('back'))+'</button></div>';
  h+='<div id="btsteps"><div class="bt-ctl"><button type="button" class="btn" id="btprev" aria-label="'+e(U_('prev'))+'">‹ '+e(U_('prev'))+'</button><span class="num" id="btnum"></span><button type="button" class="btn" id="btnext" aria-label="'+e(U_('next'))+'">'+e(U_('next'))+' ›</button></div>';
  h+='<input type="range" class="bt-rng" id="btrng" min="0" max="'+(N-1)+'" step="1" value="'+cur+'" aria-label="'+e(U_('timeline'))+'"><div class="bt-ticks">'+D.steps.map(function(s,i){return '<span>'+(i+1)+'</span>';}).join('')+'</div></div>';
  h+='<div id="btinfo"></div><div class="bt-step" id="btstep" aria-live="polite"></div>';
  // legend
  h+='<details class="bt-sec"><summary>'+e(U_('leyenda'))+'</summary><div class="bt-leg">'+legend()+'</div><p class="bt-cred">'+e(T(D.credito))+'</p></details>';
  // beaches
  if(D.playas&&D.playas.length){ h+='<details class="bt-sec" open><summary>'+e(U_('playas'))+'</summary>';
    D.playas.forEach(function(p){ h+='<details class="bt-beach"><summary>'+flag(p.nat)+'<span class="bn">'+e(p.n)+'</span><span class="bh">'+e(U_('hora'))+' '+e(p.hora)+'</span></summary><div class="bb"><dl>'+
      '<dt>'+e(U_('sec'))+'</dt><dd>'+e(T(p.sec))+'</dd><dt>'+e(U_('uds'))+'</dt><dd>'+e(T(p.uds))+'</dd><dt>'+e(U_('mandos'))+'</dt><dd>'+e(T(p.mandos))+'</dd><dt>'+e(U_('tropas'))+'</dt><dd>'+e(T(p.tropas))+'</dd><dt>'+e(U_('bajas'))+'</dt><dd>'+e(T(p.bajas))+'</dd>'+
      '<dt>'+e(U_('carros'))+'</dt><dd><div class="tags">'+p.carros.map(function(c){return c[1]?ficha(c[1],T(c[0])):'<span class="tag">'+e(T(c[0]))+'</span>';}).join('')+'</div></dd>'+
      '<dt>'+e(U_('de'))+'</dt><dd>'+e(T(p.de))+'</dd><dt>'+e(U_('defs'))+'</dt><dd>'+p.wn.map(function(w){var d=byId(D.defs,w);return d?e(T(d.n)):'';}).filter(Boolean).join(' · ')+'</dd>'+
      '<dt>'+e(U_('cur'))+'</dt><dd>'+e(T(p.cur))+'</dd></dl><p style="margin:10px 0 4px"><button type="button" class="btn btbeach" data-b="'+e(p.id)+'">'+e(U_('vermap'))+' ›</button></p><details style="font-size:13px"><summary>'+e(U_('src'))+'</summary>'+srcList(D,p.src)+'</details></div></details>'; });
    h+='</details>'; }
  // forces
  if(D.fuerzas){ var F=D.fuerzas; h+='<details class="bt-sec" open><summary>'+e(U_('fz'))+'</summary><div class="bt-fz">';
    ['al','de'].forEach(function(k){ var f=F[k]; h+='<div><h3>'+f.nat.map(flag).join('')+' '+e(T(f.t))+'</h3><table>'+f.mandos.map(function(m){return '<tr><td>'+e(T(m[0]))+'</td><td>'+e(T(m[1]))+'</td></tr>';}).join('')+'</table><p class="cnt" style="margin:10px 0 2px;text-transform:uppercase;letter-spacing:.08em">'+e(U_('cifras'))+'</p><table>'+f.cifras.map(function(m){return '<tr><td>'+e(T(m[0]))+'</td><td>'+e(T(m[1]))+'</td></tr>';}).join('')+'</table><p class="cnt" style="margin:10px 0 2px;text-transform:uppercase;letter-spacing:.08em">'+e(U_('medios'))+'</p><div class="tags">'+f.medios.map(function(m){return ficha(m[1],m[0],m[2]);}).join('')+'</div></div>'; });
    h+='</div><details style="font-size:13px;margin-top:8px"><summary>'+e(U_('src'))+'</summary>'+srcList(D,F.src)+'</details></details>'; }
  h+='<details class="bt-sec"><summary>'+e(U_('fuentes'))+'</summary><div class="bt-src">'+srcList(D,Object.keys(D.src))+'</div></details>';
  h+='</div>';
  X.set(h,T(D.t));
  var M=Map_(document.getElementById('btmap'),D);
  var mode=null;
  function show(i,instant){ cur=i; var s=D.steps[i];
    document.getElementById('btnum').textContent=U_('paso')+' '+(i+1)+' / '+N+' · '+T(s.h);
    document.getElementById('btrng').value=i;
    document.getElementById('btprev').disabled=i===0; document.getElementById('btnext').disabled=i===N-1;
    var st=document.getElementById('btstep');
    st.innerHTML='<p class="hh">'+e(U_('paso'))+' '+(i+1)+' · '+e(T(s.h))+'</p><h2>'+e(T(s.t))+'</h2>'+T(s.txt).split('\n\n').map(function(p){return '<p>'+e(p)+'</p>';}).join('')+
      (s.det?'<div class="bt-det"><b>'+e(U_('det'))+'</b><span class="tt">'+e(T(s.det.t))+'</span>'+e(T(s.det.x))+'</div>':'')+
      '<p class="cnt" style="margin:0 0 4px">'+e(U_('tap'))+'</p><details><summary>'+e(U_('src'))+' ('+s.src.length+')</summary>'+srcList(D,s.src)+'</details>';
    document.getElementById('btcap').style.display='none';
    document.getElementById('btinfo').innerHTML='';
    M.go(s,instant);
    try{ history.replaceState(history.state,'',location.pathname+location.search+'#/batallas/'+D.id+(i?'?paso='+(i+1):'')); }catch(x){}
  }
  function exitMode(){ mode=null; document.getElementById('btmodep').classList.remove('on'); document.getElementById('btsteps').style.display=''; document.getElementById('btstep').style.display=''; show(cur); }
  document.getElementById('btprev').onclick=function(){ if(cur>0) show(cur-1); };
  document.getElementById('btnext').onclick=function(){ if(cur<N-1) show(cur+1); };
  document.getElementById('btrng').oninput=function(){ show(+this.value); };
  document.getElementById('btback').onclick=exitMode;
  Array.prototype.forEach.call(document.querySelectorAll('.btbeach'),function(b){ b.onclick=function(){ var p=byId(D.playas,b.getAttribute('data-b')); if(!p) return; mode=p.id;
    document.getElementById('btmodep').classList.add('on'); document.getElementById('btsteps').style.display='none'; document.getElementById('btstep').style.display='none';
    var cp=document.getElementById('btcap'); cp.style.display=''; cp.textContent=p.n+' · '+U_('hora')+' '+p.hora; document.getElementById('btinfo').innerHTML='';
    M.go({view:p.view,u:[],ar:[],mk:[],show:['defs','obs','beaches','flood'],defs:p.wn,focus:p.id},false);
    var w=document.querySelector('.bt-mapw'), hd=document.querySelector('header.top'); if(w){ var y=w.getBoundingClientRect().top+window.scrollY-((hd&&hd.offsetHeight)||0)-8; try{ window.scrollTo({top:y,behavior:RM()?'auto':'smooth'}); }catch(x){ window.scrollTo(0,y); } } }; });
  M.onTap=function(kind,o){ var box=document.getElementById('btinfo'), h2;
    if(kind==='u'){ h2='<div class="bt-info"><button class="x" type="button" aria-label="'+e(U_('cerrar'))+'">×</button><h3>'+(o.s==='al'?flag(o.nat):flag('de'))+' '+e(T(o.n))+'</h3><div>'+e(T(o.info))+'</div>'+(o.eq&&o.eq.length?'<div class="tags"><span class="cnt">'+e(U_('eq'))+':</span> '+o.eq.map(function(id){return ficha(id,(D.fn&&D.fn[id])||id);}).join('')+'</div>':'')+'<div class="cnt" style="margin-top:4px">'+e(U_('aprox'))+'</div></div>'; }
    else { h2='<div class="bt-info"><button class="x" type="button" aria-label="'+e(U_('cerrar'))+'">×</button><h3>'+flag('de')+' '+e(T(o.n))+'</h3><div>'+(o.note?e(T(o.note)):'')+'</div><div class="cnt" style="margin-top:4px">'+e(U_('aprox'))+'</div></div>'; }
    box.innerHTML=h2; box.querySelector('.x').onclick=function(){ box.innerHTML=''; }; };
  document.addEventListener('keydown',function kd(ev){ if(!document.getElementById('btmap')){ document.removeEventListener('keydown',kd); return; } if(mode||/INPUT|TEXTAREA|SELECT/.test((ev.target||{}).tagName||'')) return; if(ev.key==='ArrowRight'&&cur<N-1) show(cur+1); if(ev.key==='ArrowLeft'&&cur>0) show(cur-1); });
  show(cur,true);
}
function byId(a,id){ for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
function legend(){
  function sv(inner,w){ return '<svg viewBox="-17 -15 34 30" width="34" height="30" aria-hidden="true">'+inner+'</svg>'; }
  var A='stroke="#1d3f8a" stroke-width="1.6"', G='stroke="#1f1f1f" stroke-width="1.6"';
  var items=[
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+A+'/>'),'Infantería aliada|Allied infantry'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><ellipse rx="8" ry="4.2" fill="none" '+A+'/>'),'Unidad acorazada aliada|Allied armour'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+A+'/><path d="M-6,5 Q-3,1 0,5 Q3,1 6,5" fill="none" '+A+'/>'),'Paracaidistas|Paratroopers'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#aaaaa2" '+G+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+G+'/>'),'Unidad alemana|German unit'],
   [sv('<path d="M-13,-2 L13,-2 L9,5 L-9,5 Z" fill="#d6e2f6" '+A+'/>'),'Fuerza naval|Naval force'],
   [sv('<text x="0" y="3" text-anchor="middle" font-size="9" font-weight="700">XX</text>'),'XX división · X brigada · III regimiento · II batallón|XX division · X brigade · III regiment · II battalion'],
   [sv('<path d="M-6,3 A6,6 0 0 1 6,3 Z" fill="#2b2b2b"/><path d="M-4,-2.5 L-6.5,-6 M0,-3.5 L0,-8 M4,-2.5 L6.5,-6" stroke="#111" stroke-width="1.1"/>'),'Nido de resistencia (WN)|Resistance nest (WN)'],
   [sv('<circle r="5.5" fill="#3a3a36"/><path d="M0,0 L10,-6" stroke="#111" stroke-width="2.2"/>'),'Batería de costa|Coastal battery'],
   [sv('<path d="M-12,0 h24" stroke="#8b1d1d" stroke-width="1.2" stroke-dasharray="1 3"/><path d="M-8,-3 l4,4 m0,-4 l-4,4 M2,-3 l4,4 m0,-4 l-4,4" stroke="#222" stroke-width="1.2"/>'),'Obstáculos de playa|Beach obstacles'],
   [sv('<rect x="-12" y="-7" width="24" height="14" fill="#b9c6cf" stroke="#5c7794"/>'),'Zona inundada (aprox.)|Flooded area (approx.)'],
   [sv('<circle r="9" fill="rgba(29,63,138,.1)" stroke="#1d3f8a" stroke-dasharray="2 2"/>'),'Zona de salto (DZ)|Drop zone (DZ)'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1d3f8a" stroke-width="2.2"/><path d="M12,0 l-5,-4 l1,5 z" fill="#1d3f8a"/>'),'Avance / ruta aliada|Allied advance / route'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1d3f8a" stroke-width="1.6" stroke-dasharray="1.5 3"/>'),'Ruta aérea|Air route'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1f1f1f" stroke-width="2.4"/><path d="M12,0 l-5,-4 l1,5 z" fill="#1f1f1f"/>'),'Contraataque alemán|German counter-attack'],
   [sv('<path d="M-14,4 L12,0" fill="none" stroke="#b3261e" stroke-width="1.3" stroke-dasharray="4 2"/>'),'Fuego naval|Naval gunfire'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#7a7a72" stroke-width="1.6" stroke-dasharray="5 3"/>'),'Engaño / amenaza falsa|Deception / fake threat'],
   [sv('<rect x="-12" y="-7" width="24" height="14" fill="rgba(29,63,138,.16)" stroke="#1d3f8a" stroke-dasharray="4 3"/>'),'Cabeza de playa (aprox.)|Beachhead (approx.)']];
  return items.map(function(x){return '<span>'+x[0]+T(x[1])+'</span>';}).join(''); }

// ---------- the map ----------
function Map_(svg,D){
  var P=mkP(D.proj), api={}, VB=null, anim=null, curStep=null;
  var G=D.geo, defsEl=el('defs',null,svg);
  defsEl.innerHTML='<pattern id="btFlood" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#c9d3d6"/><path d="M0,3 h6" stroke="#5c7794" stroke-width="1"/></pattern>';
  var sea=el('rect',{x:-2000,y:-2000,width:4000,height:4000,'class':'sea'},svg);
  var grat=el('path',{'class':'grat'},svg), gd='';
  for(var lo=-8;lo<=4;lo+=.5){ var a=P([lo,47.5]),b=P([lo,52.5]); gd+='M'+a[0].toFixed(1)+','+a[1].toFixed(1)+'L'+b[0].toFixed(1)+','+b[1].toFixed(1); }
  for(var la=47.5;la<=52.5;la+=.5){ var c=P([-8,la]),d2=P([4,la]); gd+='M'+c[0].toFixed(1)+','+c[1].toFixed(1)+'L'+d2[0].toFixed(1)+','+d2[1].toFixed(1); }
  grat.setAttribute('d',gd);
  var gOvG=el('g',null,svg), gOvW=el('path',{d:G.ovc,'class':'wl'},gOvG); el('path',{d:G.ov,'class':'land'},gOvG); var gOv=el('path',{d:G.ovc,'class':'coast'},gOvG);
  var gDet=el('g',null,svg); var gDetW=el('path',{d:G.coast+(G.ovoutc||''),'class':'wl'},gDet); el('path',{d:G.ovout||'','class':'land'},gDet); el('path',{d:G.det,'class':'land'},gDet); var gDetC2=el('path',{d:G.ovoutc||'','class':'coast'},gDet);
  var gFlood=el('path',{d:G.flood,'class':'flood hide'},svg);
  var gArea=el('path',{d:G.areas,'class':'area hide'},svg);
  var gRiv=el('path',{d:G.riv,'class':'riv'},gDet);
  var gCoast=el('path',{d:G.coast,'class':'coast'},gDet);
  var gBeach=el('g',null,svg), beachEls={};
  var BC={us:'#1d3f8a',uk:'#b3261e',ca:'#b3261e'};
  (D.playas||[]).forEach(function(p){ if(!G.beach[p.id]) return; var b=el('path',{d:G.beach[p.id],'class':'beach',stroke:BC[p.nat]||'#1d3f8a','stroke-opacity':.75},gBeach); beachEls[p.id]=b; });
  var gObs=el('g',{'class':'hide'},svg), gArr=el('g',null,svg), gPl=el('g',null,svg), gDef=el('g',null,svg), gMk=el('g',null,svg), gBl=el('g',null,svg), gU=el('g',null,svg);
  var syms=[]; // {g, x, y}
  function addSym(g,ll,par){ var xy=P(ll); var o={g:g,x:xy[0],y:xy[1]}; par.appendChild(g); syms.push(o); return o; }
  // beach labels
  var BL={}; (D.playas||[]).forEach(function(p){ var pts=G.beach[p.id]; if(!pts) return; var m=pts.match(/-?[\d.]+,-?[\d.]+/g)||[]; var mid=m[Math.floor(m.length/2)]; if(!mid) return; var xy=mid.split(',').map(Number);
    var g=document.createElementNS(NS,'g'); var t=el('text',{y:-8,'text-anchor':'middle','font-size':12.5,'font-weight':700,'class':'ttl',style:'fill:'+(BC[p.nat]||'#1d3f8a')},g); t.textContent=p.n.toUpperCase();
    gBl.appendChild(g); var o={g:g,x:xy[0],y:xy[1]-0.25}; syms.push(o); BL[p.id]=o; });
  // places
  var PLc=D.places.map(function(p){ var o=addSym(placeSym(p),p.ll,gPl); o.p=p; return o; });
  // defences
  var DFc=D.defs.map(function(d){ var g=defSym(d); g.classList.add('tap'); var o=addSym(g,d.ll,gDef); o.d=d; g.addEventListener('click',function(){ api.onTap&&api.onTap('d',d); }); return o; });
  // obstacles
  Object.keys(D.obs||{}).forEach(function(b){ D.obs[b].forEach(function(ll){ var g=document.createElementNS(NS,'g'); el('path',{d:'M-2.6,-2.6 L2.6,2.6 M-2.6,2.6 L2.6,-2.6',stroke:'#222','stroke-width':1.2},g); var o=addSym(g,ll,gObs); o.b=b; }); });
  // units (persist across steps)
  var UN={}; D.units.forEach(function(u){ var g=unitSym(u); g.classList.add('sym','off','tap'); var o=addSym(g,u.ll,gU); o.u=u; o.hx=o.x; o.hy=o.y; UN[u.id]=o; g.addEventListener('click',function(){ if(!g.classList.contains('off')) api.onTap&&api.onTap('u',u); }); });
  var MKs=[], WIDE=false;
  function pxW(){ var r=svg.getBoundingClientRect(); return r.width||360; }
  function pxH(){ var r=svg.getBoundingClientRect(); return r.height||270; }
  function fit(v){ var a=P([v[0],v[3]]),b=P([v[2],v[1]]); var w=b[0]-a[0],h=b[1]-a[1],ar=pxW()/pxH(); var cx=(a[0]+b[0])/2, cy=(a[1]+b[1])/2; if(w/h<ar) w=h*ar; else h=w/ar; return [cx-w/2,cy-h/2,w,h]; }
  function lvOK(lv,layer,close){ if(!lv) return true; if(lv==='ov') return layer==='ov'; if(lv==='ovdet') return true; if(lv==='det') return layer==='det'; if(lv==='det2') return layer==='det'&&close; return true; }
  function applyVB(vb){ VB=vb; svg.setAttribute('viewBox',vb.map(function(x){return x.toFixed(3);}).join(' ')); var s=vb[2]/pxW();
    for(var i=0;i<syms.length;i++){ var o=syms[i]; o.g.setAttribute('transform','translate('+o.x.toFixed(3)+','+o.y.toFixed(3)+') scale('+(s*(o.u&&WIDE?.8:1)).toFixed(5)+')'); }
    gOv.style.strokeWidth=(1.3*s).toFixed(4); gDetC2.style.strokeWidth=(1.3*s).toFixed(4); gOvW.style.strokeWidth=(9*s).toFixed(4); gDetW.style.strokeWidth=(12*s).toFixed(4); gCoast.style.strokeWidth=(1.5*s).toFixed(4); gRiv.style.strokeWidth=(1.1*s).toFixed(4); grat.style.strokeWidth=(.8*s).toFixed(4); gArea.style.strokeWidth=(1.2*s).toFixed(4); gFlood.style.strokeWidth=(.6*s).toFixed(4);
    gArea.style.strokeDasharray=(4*s)+' '+(3*s);
    for(var k in beachEls) beachEls[k].style.strokeWidth=(5*s).toFixed(4);
    arrowsScale(s); }
  // arrows
  var ARR=[];
  function drawArrows(list,animate){ gArr.innerHTML=''; ARR=[];
    (list||[]).forEach(function(a,i){ var pts=a.p.map(P); var col=a.s==='de'?'#1f1f1f':(a.k==='fire'?'#b3261e':(a.k==='fake'?'#7a7a72':'#1d3f8a'));
      var raw=(a.k==='land'||a.k==='sea')?wob(pts,.035,i*7+3):pts;
      var g=el('g',{'class':'arw'+(animate&&(a.k==='land'||a.k==='sea')&&!RM()?' draw':'')},gArr);
      var ln=el('path',{d:curve(raw),fill:'none',stroke:col,'stroke-linecap':'round','stroke-linejoin':'round','class':'ln'},g); if(g.classList.contains('draw')) ln.setAttribute('pathLength','1');
      var head=(a.k!=='fire')?el('path',{fill:col},g):null;
      ARR.push({a:a,pts:pts,ln:ln,head:head,col:col}); });
    if(VB) arrowsScale(VB[2]/pxW()); }
  function arrowsScale(s){ ARR.forEach(function(o){ var k=o.a.k, w=k==='land'?3.2:k==='sea'?2.4:k==='air'?1.8:k==='fire'?1.3:1.7;
      o.ln.style.strokeWidth=(w*s).toFixed(4);
      if(k==='air') o.ln.style.strokeDasharray=(1.5*s)+' '+(3.5*s); else if(k==='fake') o.ln.style.strokeDasharray=(6*s)+' '+(4*s); else if(k==='fire') o.ln.style.strokeDasharray=(5*s)+' '+(3*s); else if(!o.ln.parentNode.classList.contains('draw')) o.ln.style.strokeDasharray='';
      if(o.head){ var p=o.pts, b=p[p.length-1], a=p[p.length-2], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L, uy=dy/L, hl=(k==='land'?11:9)*s, hw=(k==='land'?6.5:5)*s;
        o.head.setAttribute('d','M'+(b[0]+ux*hl*.25).toFixed(3)+','+(b[1]+uy*hl*.25).toFixed(3)+' L'+(b[0]-ux*hl-uy*hw).toFixed(3)+','+(b[1]-uy*hl+ux*hw).toFixed(3)+' L'+(b[0]-ux*hl*.62).toFixed(3)+','+(b[1]-uy*hl*.62).toFixed(3)+' L'+(b[0]-ux*hl+uy*hw).toFixed(3)+','+(b[1]-uy*hl-ux*hw).toFixed(3)+' Z'); } }); }
  function setMarks(list){ MKs.forEach(function(o){ var i=syms.indexOf(o); if(i>=0) syms.splice(i,1); if(o.g.parentNode) o.g.parentNode.removeChild(o.g); }); MKs=[];
    (list||[]).forEach(function(m){ MKs.push(addSym(mkSym(m),m.ll,gMk)); }); }
  function declutter(){ // hide labels (places, then defences) that collide with units or higher-priority labels
    var placed=[], sr=svg.getBoundingClientRect();
    function box(n){ var r=n.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom]; }
    function hit(b){ for(var i=0;i<placed.length;i++){ var c=placed[i]; if(b[0]<c[2]&&b[2]>c[0]&&b[1]<c[3]&&b[3]>c[1]) return true; } return false; }
    function vis(g){ return !g.classList.contains('hide')&&!g.classList.contains('off')&&!(g.parentNode&&g.parentNode.classList&&g.parentNode.classList.contains('hide')); }
    Object.keys(UN).forEach(function(id){ var g=UN[id].g; if(vis(g)) placed.push(box(g)); });
    MKs.forEach(function(o){ placed.push(box(o.g)); });
    function lab(list,all){ list.forEach(function(g){ var t=g.querySelector('text'); if(!t) return; t.style.display=''; if(all) g.style.display=''; if(!vis(g)) return; var b=box(t); var off=b[0]<sr.left-1||b[2]>sr.right+1||b[1]<sr.top-1||b[3]>sr.bottom+1; if(off||hit(b)){ if(all) g.style.display='none'; else t.style.display='none'; } else placed.push(b); }); }
    lab(Object.keys(BL).map(function(k){return BL[k].g;}));
    lab(DFc.filter(function(o){return o.d.k==='bat';}).map(function(o){return o.g;}));
    lab(PLc.filter(function(o){return o.p.k==='city';}).map(function(o){return o.g;}),true);
    lab(DFc.filter(function(o){return o.d.k!=='bat';}).map(function(o){return o.g;}));
    lab(PLc.filter(function(o){return o.p.k!=='city';}).map(function(o){return o.g;}),true);
  }
  api.go=function(s,instant){ curStep=s; var v=D.views[s.view]||D.views[Object.keys(D.views)[0]]; var layer=v[4], close=(v[2]-v[0])<0.45;
    var sh={}; (s.show||[]).forEach(function(k){sh[k]=1;});
    gOvG.classList.toggle('hide',layer!=='ov'); gDet.classList.toggle('hide',layer!=='det');
    gFlood.classList.toggle('hide',!(sh.flood&&layer==='det')); gArea.classList.toggle('hide',!sh.areas); gObs.classList.toggle('hide',!(sh.obs&&close));
    gBeach.classList.toggle('hide',!sh.beaches); gBl.classList.toggle('hide',!(sh.beaches&&layer==='det'));
    for(var k in beachEls) beachEls[k].setAttribute('stroke-opacity',s.focus?(k===s.focus?.95:.35):.75);
    PLc.forEach(function(o){ o.g.classList.toggle('hide',!lvOK(o.p.lv,layer,close)); if(o.p.k==='port') o.g.classList.toggle('hide',!(sh.ports&&layer==='ov')); });
    var dset=null; if(s.defs){ dset={}; s.defs.forEach(function(x){dset[x]=1;}); }
    DFc.forEach(function(o){ var vis=sh.defs&&lvOK(o.d.lv,layer,close)&&(!dset||dset[o.d.id]||o.d.k==='bat'); o.g.classList.toggle('hide',!vis); });
    setMarks(s.mk);
    // units: targets
    var want={}; (s.u||[]).forEach(function(id){ want[id]=1; }); WIDE=(s.u||[]).length>8; svg.classList.toggle('wide',WIDE);
    var from=VB?VB.slice():null, to=fit(v), moves=[];
    Object.keys(UN).forEach(function(id){ var o=UN[id], on=!!want[id]; var tgt=(s.pos&&s.pos[id])?P(s.pos[id]):[o.hx,o.hy];
      if(on){ if(o.g.classList.contains('off')){ o.x=tgt[0]; o.y=tgt[1]; o.g.classList.remove('off'); } else moves.push({o:o,x0:o.x,y0:o.y,x1:tgt[0],y1:tgt[1]}); }
      else o.g.classList.add('off'); });
    drawArrows(null);
    if(anim){ cancelAnimationFrame(anim); anim=null; } if(api._fb) clearTimeout(api._fb);
    var dur=(instant||!from||RM())?0:850, t0=null;
    function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
    var done=false, fb=null;
    function frame(ts){ if(done) return; if(t0==null) t0=ts; var t=dur?Math.min(1,(ts-t0)/dur):1, k=ease(t);
      moves.forEach(function(m){ m.o.x=m.x0+(m.x1-m.x0)*k; m.o.y=m.y0+(m.y1-m.y0)*k; });
      var vb=from?from.map(function(x,i){return x+(to[i]-x)*k;}):to; applyVB(vb);
      if(t<1) anim=requestAnimationFrame(frame); else { done=true; anim=null; clearTimeout(fb); drawArrows(s.ar,!instant); declutter(); } }
    if(dur){ anim=requestAnimationFrame(frame); fb=api._fb=setTimeout(function(){ if(!done){ if(anim) cancelAnimationFrame(anim); t0=-1e9; frame(0); } },dur+400); } else frame(0);
  };
  var rt=null; window.addEventListener('resize',function(){ if(!svg.isConnected) return; clearTimeout(rt); rt=setTimeout(function(){ if(curStep&&svg.isConnected){ var v=D.views[curStep.view]; applyVB(fit(v)); declutter(); } },150); });
  return api;
}

window.MAT_BATALLAS=function(app,X){
  css(); var p=X.p||[];
  if(p.length<2) return listPage(app,X);
  return battle(app,X,p[1]);
};
})();
