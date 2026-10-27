(function(){
"use strict";
// ============ M.A.T · Guerra nuclear, pestaña ① Alcance (#/guerra-nuclear?tab=alcance; alias #/alcance) ============
// Cargado por el contenedor de nuclear.js (pestañas Alcance / Impacto).
// Datos: alcance.json.gz (misiles, presets, ciudades) + world.json.gz (Natural Earth 1:50m, el mismo mapa base de #/mapa).
// Proyección azimutal equidistante centrada en el punto de lanzamiento: los círculos de alcance son círculos reales
// (distancias geodésicas sobre una esfera de 6.371 km). Sin librerías ni teselas externas.
var R=6371, PI=Math.PI, RAD=PI/180, ANTI=PI*R;
var COL=['#e8b54a','#ef5b52','#4fb3e0'];
var D=null, W=null, LD=null, ST=null, MAP=null, CUR=null;
function EN(){return window.MAT_LANG==='en';}
function L(a){return a?(EN()?(a[1]||a[0]):a[0]):'';}
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nf(n){ n=Math.round(n); var s=String(Math.abs(n)), o=''; while(s.length>3){ o=(EN()?',':'.')+s.slice(-3)+o; s=s.slice(0,-3);} return (n<0?'-':'')+s+o; }
function km(n){ return nf(n)+' km'; }
function rng(m){ return m.r[0]===m.r[1]?km(m.r[1]):nf(m.r[0])+'–'+km(m.r[1]); }
function fl(iso,cls){ if(!iso||(D&&D.f&&D.f.indexOf(iso)<0)) return ''; return '<img class="'+(cls||'mini')+'" src="flags/'+iso+'.png" alt="" loading="lazy" onerror="this.style.display=\'none\'">'; }
var DN={};
function cname(iso,fb){ var l=EN()?'en':'es'; try{ if(!DN[l]) DN[l]=new Intl.DisplayNames([l],{type:'region'}); var n=DN[l].of(String(iso).toUpperCase()); if(n&&n.toUpperCase()!==String(iso).toUpperCase()) return n; }catch(x){} return fb||String(iso).toUpperCase(); }
var PN={ru:['Rusia','Russia'],us:['EE. UU.','United States'],fr:['Francia','France'],gb:['Reino Unido','United Kingdom'],de:['Alemania','Germany'],se:['Suecia','Sweden'],no:['Noruega','Norway'],cn:['China','China'],kp:['Corea del Norte','North Korea'],ir:['Irán','Iran'],'in':['India','India'],pk:['Pakistán','Pakistan'],il:['Israel','Israel'],kr:['Corea del Sur','South Korea'],tw:['Taiwán','Taiwan']};
function pais(m){ return L(PN[m.pa])+(m.pa2?' / '+L(PN[m.pa2]):''); }
var GL={srbm:['Balístico de corto alcance (SRBM)','Short-range ballistic (SRBM)'],mrbm:['Balístico de medio alcance (MRBM)','Medium-range ballistic (MRBM)'],irbm:['Balístico de alcance intermedio (IRBM)','Intermediate-range ballistic (IRBM)'],icbm:['Balístico intercontinental (ICBM)','Intercontinental ballistic (ICBM)'],slbm:['Balístico lanzado desde submarino (SLBM)','Submarine-launched ballistic (SLBM)'],cm:['Misil de crucero','Cruise missile'],hyp:['Hipersónico','Hypersonic'],air:['Lanzado desde avión','Air-launched'],as:['Antibuque','Anti-ship']};
var GS={srbm:['SRBM','SRBM'],mrbm:['MRBM','MRBM'],irbm:['IRBM','IRBM'],icbm:['ICBM','ICBM'],slbm:['SLBM','SLBM'],cm:['Crucero','Cruise'],hyp:['Hipersónico','Hypersonic'],air:['Aire-superficie','Air-launched'],as:['Antibuque','Anti-ship']};
var CATS=[['all','Todos','All'],['srbm','Corto alcance','Short range'],['mrbm','Medio alcance','Medium range'],['irbm','Intermedio','Intermediate'],['icbm','Intercontinentales','Intercontinental'],['slbm','Desde submarino','Sub-launched'],['cm','Crucero','Cruise'],['hyp','Hipersónicos','Hypersonic'],['air','Desde avión','Air-launched'],['as','Antibuque','Anti-ship']];
var STL={serv:['En servicio','In service'],dev:['En desarrollo','In development'],test:['Probado (estado operativo incierto)','Tested (operational status uncertain)'],ret:['Retirado','Retired']};
var WHL={conv:['Convencional','Conventional'],nuc:['Nuclear','Nuclear'],dual:['Convencional o nuclear (capacidad dual)','Conventional or nuclear (dual-capable)']};
function tags(m){ return [m.g].concat(m.tags||[]); }
function byId(id){ for(var i=0;i<D.m.length;i++) if(D.m[i].id===id) return D.m[i]; return null; }
function preset(k){ for(var i=0;i<D.p.length;i++) if(D.p[i][0]===k) return D.p[i]; return null; }
// ---------- geodesia ----------
function dist(a1,o1,a2,o2){ var p1=a1*RAD,p2=a2*RAD,dp=p2-p1,dl=(o2-o1)*RAD; var h=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2); return 2*R*Math.asin(Math.min(1,Math.sqrt(h))); }
function tball(d){ var MU=398600.4418, psi=d/R; if(psi<1e-4) return 0; var a=R*(1+Math.sin(psi/2))/2, ec=R*Math.cos(psi/2)/(2*a); var cv=(a*(1-ec*ec)/R-1)/ec; cv=Math.max(-1,Math.min(1,cv)); var v=Math.acos(cv); var E=2*Math.atan(Math.sqrt((1-ec)/(1+ec))*Math.tan(v/2)); var M=E-ec*Math.sin(E); return 2*(PI-M)/Math.sqrt(MU/(a*a*a))/60; }
function tfmt(min){ if(min<1) return '<1 min'; if(min<90) return Math.round(min)+' min'; var t=Math.round(min/10)*10, h=Math.floor(t/60), mm=t-h*60; return h+' h'+(mm?' '+mm:''); }
function ftime(m,d){ if(m.vk){ var a=tfmt(d/m.vk[1]*60), b=tfmt(d/m.vk[0]*60); if(a===b) return '≈ '+a; if(/min$/.test(a)&&/min$/.test(b)) return '≈ '+a.replace(' min','')+'–'+b; return '≈ '+a+' – '+b; } return '≈ '+tfmt(tball(d)); }
// ---------- estado ----------
function readQ(X){ var q=X.qs(), s={m:[],p:'kaliningrado',ll:null};
  if(q.m){ q.m.split(',').forEach(function(id){ if(byId(id)&&s.m.indexOf(id)<0&&s.m.length<3) s.m.push(id); }); }
  if(!q.m) s.m=['iskander-m','kalibr','oreshnik'];
  if(q.p){ var mm=q.p.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); if(mm){ var la=+mm[1], lo=+mm[2]; if(Math.abs(la)<=90&&Math.abs(lo)<=180){ s.p=null; s.ll=[la,lo]; } } else if(preset(q.p)) s.p=q.p; }
  if(q.t){ var ti=cityIdx(q.t); if(ti>=0) s.t={i:ti}; else { var tm=q.t.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); if(tm&&Math.abs(+tm[1])<=90&&Math.abs(+tm[2])<=180) s.t={ll:[+tm[1],+tm[2]]}; } }
  return s; }
function cityIdx(sl){ for(var i=0;i<D.c.length;i++) if(nuks(D.c[i])===sl) return i; return -1; }
function tpos(){ var t=ST.t; if(!t) return null; if(t.i!=null){ var c=D.c[t.i]; return {lat:c[3],lon:c[4],n:cn(c),q:nuks(c)}; } return {lat:t.ll[0],lon:t.ll[1],n:customName(t.ll),q:t.ll[0].toFixed(3)+','+t.ll[1].toFixed(3)}; }
function lpq(){ return ST.p||(ST.ll[0].toFixed(2)+','+ST.ll[1].toFixed(2)); }
// enlace a la pestaña ② Impacto para una ciudad (índice) o un punto: misil que llega (con potencia de su cabeza si la fuente la da)
function impHref(i,ll){ var lp=launch(), c=i!=null?D.c[i]:null, d=c?dist(lp.lat,lp.lon,c[3],c[4]):dist(lp.lat,lp.lon,ll[0],ll[1]), pick=null;
  sel().forEach(function(m){ if(d<=m.r[1]&&(!pick||(m.ny&&!pick.ny))) pick=m; });
  var h='#/guerra-nuclear?tab=impacto&'+(c?'c='+nuks(c):'ll='+ll[0].toFixed(4)+','+ll[1].toFixed(4));
  if(pick){ h+='&fm='+pick.id+'&fp='+lpq(); if(pick.ny) h+='&y='+pick.ny[0][1]+'&yi='+pick.ny[0][0]; }
  return h; }
function writeQ(){ var h='#/guerra-nuclear?tab=alcance&m='+ST.m.join(',')+'&p='+lpq(); var tp=tpos(); if(tp) h+='&t='+tp.q;
  if(location.hash!==h){ try{ history.replaceState(null,'',h); }catch(x){} } if(window.MAT_GN_Q) window.MAT_GN_Q('alcance',h); }
function launch(){ if(ST.p){ var p=preset(ST.p); return {lat:p[3],lon:p[4],n:EN()?p[2]:p[1]}; } return {lat:ST.ll[0],lon:ST.ll[1],n:customName(ST.ll)}; }
function customName(ll){ var best=null,bd=1e9; D.c.forEach(function(c){ var d=dist(ll[0],ll[1],c[3],c[4]); if(d<bd){bd=d;best=c;} });
  var t=(Math.abs(ll[0]).toFixed(2)+'°'+(ll[0]>=0?'N':'S')+' '+Math.abs(ll[1]).toFixed(2)+'°'+(ll[1]>=0?'E':(EN()?'W':'O')));
  if(best&&bd<3) return cn(best)+' ('+t+')';
  if(best&&bd<300) return (EN()?'Near ':'Cerca de ')+cn(best)+' ('+t+')'; return (EN()?'Chosen point ':'Punto elegido ')+'('+t+')'; }
function cn(c){ return EN()&&c[1]?c[1]:c[0]; }
function sel(){ return ST.m.map(byId).filter(Boolean); }
// ---------- CSS ----------
function css(){ if(document.getElementById('alc-css')) return; var s=document.createElement('style'); s.id='alc-css';
 s.textContent=
 '.alc .alc-nuk{display:inline-block;margin-top:4px;font-size:12.5px;color:#ff9c8a;border:1px solid #6a2a24;border-radius:999px;padding:3px 10px;text-decoration:none}.alc .alc-nuk:hover{background:#2a1311}'+
 '.alc .tgt{border:1px solid #6a2a24;background:rgba(162,64,47,.10);border-radius:var(--r);padding:10px 12px;margin:8px 0 10px}.alc .tgt h3{margin:0 0 2px;font-size:16px}.alc .tgt .tx{float:right;background:none;border:0;color:var(--mu);font-size:20px;line-height:1;cursor:pointer;padding:0 2px}.alc .tgt .tl{display:flex;flex-direction:column;gap:4px;margin:8px 0 4px}.alc .tgt .tr{display:flex;align-items:center;gap:8px;text-align:left;width:100%;background:rgba(0,0,0,.25);border:1px solid #3a2a26;border-radius:8px;padding:7px 9px;color:inherit;font:inherit;font-size:13.5px;cursor:pointer}.alc .tgt .tr:hover{border-color:#a2402f}.alc .tgt .tr b{flex:1;min-width:0}.alc .tgt .tr small{color:var(--mu);white-space:nowrap}.alc .tgt .cur{font-size:13px;color:#e6d4cf;margin:6px 0 0}'+
 '.alc .nextc{display:flex;flex-wrap:wrap;align-items:center;gap:10px;border:1px solid #a2402f;background:#2a1311;border-radius:var(--r);padding:12px 14px;margin:14px 0 6px;color:#ffd9cf}.alc .nextc .tx2{flex:1 1 240px;font-size:14px;line-height:1.45}.alc .nextc b{color:#fff}.alc .nextc a.btn{border-color:#a2402f;background:#3a1714;color:#ffd9cf;font-weight:700;text-decoration:none;min-height:44px;display:inline-flex;align-items:center}'+
 '.alc .csr,.alc .lsr{position:relative;display:flex;align-items:center;margin:6px 0 8px}.alc .lsr{flex:1 1 100%;margin:0}'+
 '.alc .csr input,.alc .lsr input{width:100%;height:46px;box-sizing:border-box;border:1px solid var(--line);background:var(--bg);color:var(--tx);border-radius:10px;padding:0 42px 0 38px;font:inherit;font-size:16px;-webkit-appearance:none;appearance:none}'+
 '.alc .csr input{border-color:#7a5a24;background:var(--s1)}.alc .csr input:focus,.alc .lsr input:focus{outline:2px solid #e8b54a;outline-offset:1px}'+
 '.alc .csr input::-webkit-search-cancel-button,.alc .lsr input::-webkit-search-cancel-button{-webkit-appearance:none;display:none}'+
 '.alc .csr .ic,.alc .lsr .ic{position:absolute;left:12px;top:23px;transform:translateY(-50%);font-size:15px;pointer-events:none;opacity:.85}'+
 '.alc .cx{position:absolute;right:4px;top:23px;transform:translateY(-50%);width:38px;height:38px;border:0;background:none;color:var(--mu);font-size:24px;line-height:1;cursor:pointer;padding:0}.alc .cx[hidden]{display:none}'+
 '.alc .cresh{font-size:12.5px;color:var(--mu);margin:2px 0 4px}'+
 '.alc .crow{display:flex;gap:10px;align-items:flex-start;border:1px solid var(--line);background:var(--s1);border-radius:10px;padding:9px 11px;margin:6px 0;cursor:pointer}.alc .crow.on{border-color:#ffd166;box-shadow:0 0 0 1px #ffd166 inset}'+
 '.alc .crow .cm{flex:1;min-width:0;line-height:1.55;overflow-wrap:anywhere}.alc .crow .n{white-space:nowrap;font-weight:700;font-variant-numeric:tabular-nums;padding-top:1px}'+
 '.alc .crow .out{font-size:12.5px;color:#ff9c8a}.alc .crow .ca{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.alc .crow .ca .alc-nuk{margin-top:0}'+
 '.alc .cb2{font:inherit;font-size:12.5px;color:var(--tx);background:var(--s2);border:1px solid var(--line);border-radius:999px;padding:3px 10px;cursor:pointer}.alc .cb2:hover{border-color:#e8b54a}'+
 '.alc .cres0{border:1px dashed var(--line);border-radius:10px;padding:10px 12px;font-size:14px;line-height:1.45;margin:6px 0}.alc .cres0 a{color:#ff9c8a}'+
 '.alc .lpl{position:absolute;left:0;right:0;top:48px;z-index:30;background:var(--s1);border:1px solid var(--line);border-radius:10px;max-height:min(50vh,340px);overflow:auto;-webkit-overflow-scrolling:touch;box-shadow:0 10px 28px rgba(0,0,0,.5)}.alc .lpl[hidden]{display:none}'+
 '.alc .lpl .pr{padding:9px 10px}.alc .lpl .pr:focus{background:var(--s2);outline:none}.alc .pick input{font-size:16px}'+
 '.alc .note{border:1px solid #5a4a22;background:rgba(232,181,74,.07);color:#e6dcc4;border-radius:var(--r);padding:9px 11px;font-size:13px;margin:10px 0 4px;line-height:1.45}'+
 '.alc .note b{color:#f0c96a}'+
 '.alc .selbar{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 8px}'+
 '.alc .pill{display:flex;align-items:center;gap:5px;border:1px solid var(--line);background:var(--s1);border-radius:999px;padding:2px 3px 2px 8px;font-size:12.5px;min-width:0;max-width:100%}'+
 '@media(max-width:600px){.alc .pill small{display:none}}.alc .pill i{width:10px;height:10px;border-radius:50%;flex:0 0 10px}.alc .pill small{font-size:11.5px}'+
 '.alc .pill span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.alc .pill small{color:var(--mu);white-space:nowrap}'+
 '.alc .pill button{border:0;background:var(--s2);color:var(--mu);width:28px;height:28px;border-radius:50%;font-size:15px;line-height:1;cursor:pointer;flex:0 0 28px}'+
 '.alc .addb{border:1px dashed var(--ac);background:transparent;color:var(--ac2);border-radius:999px;padding:6px 12px;font-size:13.5px;cursor:pointer;font-family:inherit}'+
 '.alc .pick{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px;margin:6px 0 10px}'+
 '.alc .pick[hidden]{display:none}.alc .pick input{height:40px;margin:8px 0}'+
 '.alc .plist{max-height:min(52vh,420px);overflow:auto;-webkit-overflow-scrolling:touch;border-top:1px solid var(--line);margin-top:4px}'+
 '.alc .pgh{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);padding:10px 4px 4px;display:flex;align-items:center;gap:6px}'+
 '.alc .pr{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--line);color:var(--tx);padding:9px 4px;font:inherit;cursor:pointer}'+
 '.alc .pr:hover{background:var(--s2)}.alc .pr .nm{flex:1;min-width:0;font-weight:600;font-size:14.5px}.alc .pr .nm small{display:block;font-weight:400;color:var(--mu);font-size:12px}'+
 '.alc .pr .rg{font-size:12.5px;color:var(--ac2);white-space:nowrap;text-align:right}.alc .pr .ck{width:22px;height:22px;border-radius:50%;border:1px solid var(--line);flex:0 0 22px}'+
 '.alc .lrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0 10px}.alc .lrow .sel{flex:1 1 220px;min-width:0}'+
 '.alc .lrow .hint{font-size:12.5px;color:var(--mu);flex:1 1 100%}'+
 '.alc .grid{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}'+
 '@media(min-width:980px){.alc .grid{grid-template-columns:minmax(0,1.45fr) minmax(0,1fr);align-items:start}.alc .side{max-height:calc(100vh - 90px);overflow:auto;position:sticky;top:74px}}'+
 '.alc .mapw{position:relative;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#070809;touch-action:none;user-select:none;-webkit-user-select:none}'+
 '.alc canvas{display:block;width:100%;cursor:crosshair}'+
 '.alc .mbtn{position:absolute;right:8px;display:flex;flex-direction:column;gap:6px;top:8px}'+
 '.alc .mbtn button{width:38px;height:38px;border-radius:6px;border:1px solid var(--line);background:rgba(19,21,23,.88);color:var(--tx);font-size:18px;cursor:pointer;font-family:inherit}'+
 '.alc .mleg{position:absolute;left:8px;bottom:8px;right:54px;font-size:11.5px;color:#cfd1cd;pointer-events:none;text-shadow:0 1px 2px #000}'+
 '.alc .mtip{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(19,21,23,.94);border:1px solid var(--line);border-radius:999px;padding:6px 12px;font-size:12.5px;white-space:nowrap;max-width:calc(100% - 70px);overflow:hidden;text-overflow:ellipsis;pointer-events:none;transition:opacity .3s}'+
 '.alc .cards{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;margin:10px 0}'+
 '.alc .sc{border:1px solid var(--line);border-left:4px solid;border-radius:var(--r);background:var(--s1);padding:9px 11px}'+
 '.alc .sc .t{font-weight:650;font-size:15px}.alc .sc .d{font-size:13px;color:var(--mu);margin-top:2px}.alc .sc .d b{color:var(--tx);font-weight:600}'+
 '.alc .mad{border:1px solid #3c4a2c;background:rgba(143,154,106,.09);border-radius:var(--r);padding:10px 12px;font-size:14px;margin:8px 0}'+
 '.alc .tabs{display:flex;gap:6px;margin:6px 0 8px}'+
 '.alc table{width:100%;border-collapse:collapse;font-size:13.5px}.alc td,.alc th{padding:7px 4px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}'+
 '.alc th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);font-weight:600}.alc td.n{white-space:nowrap;text-align:right;color:var(--mu)}'+
 '.alc .bd{display:inline-block;border-radius:4px;padding:1px 6px;margin:2px 4px 2px 0;font-size:12px;white-space:nowrap;border:1px solid}'+
 '.alc .bd.o{background:transparent!important;border-style:dashed}'+
 '.alc .no{color:var(--dim);font-size:12px}'+
 '.alc .more{margin:8px 0;background:transparent;border:1px solid var(--line);color:var(--mu);border-radius:var(--r);padding:8px 12px;font:inherit;font-size:13px;cursor:pointer}'+
 '.alc .ctry{display:flex;flex-wrap:wrap;gap:6px}.alc .ctry span{border:1px solid var(--line);border-radius:999px;padding:3px 9px 3px 6px;font-size:12.5px;white-space:nowrap}'+
 '.alc .fichas{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}@media(min-width:760px){.alc .fichas{grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}}'+
 '.alc .fc{border:1px solid var(--line);border-top:4px solid;border-radius:var(--r);background:var(--s1);padding:12px}'+
 '.alc .fc h3{margin:0;font-size:18px;display:flex;align-items:center;gap:8px}.alc .fc .al{color:var(--mu);font-size:13px;margin:2px 0 8px}'+
 '.alc .fc dl{margin:0;display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 12px;font-size:13.5px}.alc .fc dt{color:var(--mu)}.alc .fc dd{margin:0;overflow-wrap:anywhere}'+
 '.alc .fc .src{font-size:12.5px;margin-top:10px;color:var(--mu)}.alc .fc .src a{color:var(--ac2)}'+
 '.alc .fc .acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.alc .fc .acts a,.alc .fc .acts button{font-size:13px;min-height:36px;padding:0 12px}'+
 '.alc .tag{display:inline-block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;border:1px solid var(--line);border-radius:4px;padding:1px 6px;margin:0 4px 4px 0;color:var(--mu)}'+
 '.alc .tag.nuc{border-color:#7a3b37;color:#f09a92}.alc .tag.unc{border-color:#7a6431;color:#f0c96a}'+
 '.alc details.mt{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:0 12px;margin:10px 0}.alc details.mt summary{cursor:pointer;padding:12px 0;font-weight:600}'+
 '.alc details.mt p,.alc details.mt li{font-size:13.5px;color:#cfd1cd}.alc details.mt a{color:var(--ac2);overflow-wrap:anywhere}'+
 '.alc .srcl{padding-left:18px;margin:6px 0 12px}.alc .srcl li{margin:3px 0}'+
 '.alc .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#1d2124;border:1px solid var(--line);color:var(--tx);border-radius:999px;padding:9px 16px;font-size:13.5px;z-index:60;box-shadow:0 6px 20px rgba(0,0,0,.5);max-width:92vw}';
 document.head.appendChild(s); }
function toast(t){ var o=document.querySelector('.alc-toast'); if(o) o.remove(); var d=document.createElement('div'); d.className='toast alc-toast'; d.textContent=t; (document.querySelector('.alc')||document.body).appendChild(d); setTimeout(function(){ d.remove(); },2600); }
// ---------- carga ----------
var LDD=null;
function loadD(){ if(!LDD) LDD=window.MAT_GET('alcance.json.gz').then(function(z){ if(!D) D=z; return D; }); return LDD; }
function load(){ if(LD) return LD; LD=Promise.all([loadD(),window.MAT_GET('world.json.gz')]).then(function(z){ W=prepW(z[1]); return D; }); return LD; }
function prepW(w){ return w.c.map(function(c){ var R2=c.r.map(function(a){ var o=new Float32Array(a.length), x=0,y=0; for(var i=0;i<a.length;i+=2){ x+=a[i]; y+=a[i+1]; o[i]=x/100; o[i+1]=y/100; } return o; }); return {i:c.i,n:c.n,R:R2}; }); }
// ---------- mapa ----------
function Map(cv,wrap,onTap){
  var ctx=cv.getContext('2d'), self=this, dpr=1, Wd=0, Hd=0;
  var C0=null, land=null, borders=null, grat=null, cityP=null, minD=null;
  self.k=1; self.ox=0; self.oy=0; self.rings=[]; self.cities=[]; self.labels=true;
  function proj(lat,lon,s0,c0,l0){ var p=lat*RAD, dl=lon*RAD-l0, cp=Math.cos(p), sp=Math.sin(p), cd=Math.cos(dl);
    var cc=s0*sp+c0*cp*cd; if(cc>1)cc=1; if(cc<-1)cc=-1; var c=Math.acos(cc); if(c>PI-0.0035) return null; var kk=c<1e-9?1:c/Math.sin(c);
    return [R*kk*cp*Math.sin(dl), R*kk*(c0*sp-s0*cp*cd), c*R]; }
  self.center=function(lat,lon){ C0=[lat,lon]; var s0=Math.sin(lat*RAD), c0=Math.cos(lat*RAD), l0=lon*RAD;
    land=new Path2D(); borders=new Path2D(); minD={}; var J=2500;
    W.forEach(function(c){ var md=1e9; c.R.forEach(function(a){ var pth=new Path2D(), prev=null, brk=false, n=0;
        for(var i=0;i<a.length;i+=2){ var q=proj(a[i+1],a[i],s0,c0,l0); if(!q){ brk=true; prev=null; continue; } if(q[2]<md) md=q[2];
          if(prev&&Math.abs(q[0]-prev[0])+Math.abs(q[1]-prev[1])>J){ brk=true; prev=null; }
          if(prev) pth.lineTo(q[0],q[1]); else pth.moveTo(q[0],q[1]); prev=q; n++; }
        if(!brk){ pth.closePath(); land.addPath(pth); } borders.addPath(pth); });
      minD[c.i]=Math.min(minD[c.i]==null?1e9:minD[c.i],md); });
    W.forEach(function(c){ if(pip(c,lon,lat)) minD[c.i]=0; });
    grat=new Path2D(); var la,lo,q,pv;
    for(lo=-180;lo<180;lo+=15){ pv=null; for(la=-90;la<=90;la+=2){ q=proj(la,lo,s0,c0,l0); if(!q||(pv&&Math.abs(q[0]-pv[0])+Math.abs(q[1]-pv[1])>J)){ pv=null; if(!q) continue; } if(pv) grat.lineTo(q[0],q[1]); else grat.moveTo(q[0],q[1]); pv=q; } }
    for(la=-75;la<=75;la+=15){ pv=null; for(lo=-180;lo<=180;lo+=2){ q=proj(la,lo,s0,c0,l0); if(!q||(pv&&Math.abs(q[0]-pv[0])+Math.abs(q[1]-pv[1])>J)){ pv=null; if(!q) continue; } if(pv) grat.lineTo(q[0],q[1]); else grat.moveTo(q[0],q[1]); pv=q; } }
    cityP=D.c.map(function(c){ var q=proj(c[3],c[4],s0,c0,l0); return q?[q[0],q[1],q[2]]:null; });
    self.minD=minD; };
  function pip(c,x,y){ var ins=false; for(var r=0;r<c.R.length;r++){ var a=c.R[r], n=a.length; for(var i=0,j=n-2;i<n;j=i,i+=2){ var yi=a[i+1], yj=a[j+1]; if((yi>y)!==(yj>y)){ var xi=a[i], xj=a[j]; if(x<(xj-xi)*(y-yi)/(yj-yi)+xi) ins=!ins; } } } return ins; }
  self.inv=function(px,py){ var x=(px-Wd/2-self.ox)/self.k, y=-(py-Hd/2-self.oy)/self.k, rho=Math.sqrt(x*x+y*y), c=rho/R; if(c>PI) return null; if(rho<1e-6) return C0.slice();
    var p0=C0[0]*RAD, l0=C0[1]*RAD, sc=Math.sin(c), cc=Math.cos(c);
    var lat=Math.asin(cc*Math.sin(p0)+y*sc*Math.cos(p0)/rho), lon=l0+Math.atan2(x*sc,rho*Math.cos(p0)*cc-y*Math.sin(p0)*sc);
    lon=lon/RAD; while(lon>180) lon-=360; while(lon<-180) lon+=360; return [lat/RAD,lon]; };
  self.fit=function(rk){ var r=Math.max(rk||1000,350)*1.12; self.k=Math.min(Wd,Hd)/2/r; self.ox=0; self.oy=0; self.draw(); };
  self.resize=function(){ var w=wrap.clientWidth||320, h=Math.round(Math.max(300,Math.min(w<600?w*1.06:w*0.8,640,(window.innerHeight||700)*0.66))); dpr=Math.min(window.devicePixelRatio||1,2); cv.style.height=h+'px'; cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); Wd=w; Hd=h; };
  function T(){ ctx.setTransform(self.k*dpr,0,0,-self.k*dpr,(Wd/2+self.ox)*dpr,(Hd/2+self.oy)*dpr); }
  function S(x,y){ return [Wd/2+self.ox+x*self.k, Hd/2+self.oy-y*self.k]; }
  function step(){ var vr=Math.min(Wd,Hd)/2/self.k, st=[100,250,500,1000,2000,2500,5000]; for(var i=0;i<st.length;i++) if(vr/st[i]<=4.2) return st[i]; return 5000; }
  self.draw=function(){ if(!C0) return; var k=self.k;
    ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle='#070809'; ctx.fillRect(0,0,cv.width,cv.height);
    T(); ctx.beginPath(); ctx.arc(0,0,ANTI,0,7); ctx.fillStyle='#0d1820'; ctx.fill();
    ctx.lineWidth=1/k; ctx.strokeStyle='#17293a'; ctx.stroke(grat);
    ctx.fillStyle='#262d24'; ctx.fill(land); ctx.lineWidth=0.7/k; ctx.strokeStyle='#4a5641'; ctx.stroke(borders);
    // rejilla de distancias
    var s=step(); ctx.setLineDash([3/k,5/k]); ctx.lineWidth=0.8/k; ctx.strokeStyle='rgba(180,190,200,.22)';
    for(var d=s; d<ANTI && d<Math.min(Wd,Hd)/k*1.5; d+=s){ ctx.beginPath(); ctx.arc(0,0,d,0,7); ctx.stroke(); }
    ctx.setLineDash([]);
    ctx.lineWidth=1.2/k; ctx.strokeStyle='#3a4a58'; ctx.beginPath(); ctx.arc(0,0,ANTI,0,7); ctx.stroke();
    // anillos de alcance (de mayor a menor)
    var rs=self.rings.slice().sort(function(a,b){return b.r[1]-a.r[1];});
    rs.forEach(function(g){ ctx.beginPath(); ctx.arc(0,0,Math.min(g.r[1],ANTI),0,7); ctx.globalAlpha=.10; ctx.fillStyle=g.c; ctx.fill(); ctx.globalAlpha=1;
      if(g.r[0]<g.r[1]){ ctx.beginPath(); ctx.arc(0,0,Math.min(g.r[1],ANTI),0,7); ctx.arc(0,0,Math.min(g.r[0],ANTI),0,7,true); ctx.globalAlpha=.16; ctx.fill(); ctx.globalAlpha=1; } });
    rs.forEach(function(g){ ctx.strokeStyle=g.c; ctx.lineWidth=2.2/k; ctx.beginPath(); ctx.arc(0,0,Math.min(g.r[1],ANTI),0,7); ctx.stroke();
      if(g.r[0]<g.r[1]){ ctx.setLineDash([6/k,5/k]); ctx.lineWidth=1.4/k; ctx.beginPath(); ctx.arc(0,0,g.r[0],0,7); ctx.stroke(); ctx.setLineDash([]); } });
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // etiquetas de la rejilla
    ctx.font='10.5px -apple-system,Segoe UI,Roboto,Arial,sans-serif'; ctx.fillStyle='rgba(200,206,212,.55)'; ctx.textAlign='left'; ctx.textBaseline='middle';
    for(d=s; d<ANTI && d<Math.min(Wd,Hd)/k*1.5; d+=s){ var p=S(0,-d); if(p[1]>8&&p[1]<Hd-8&&p[0]>0&&p[0]<Wd) ctx.fillText(nf(d)+' km',p[0]+4,p[1]-6); }
    // ciudades
    var occ=[], maxR=0; self.rings.forEach(function(g){ if(g.r[1]>maxR) maxR=g.r[1]; });
    function free(x,y,w,h){ for(var i=0;i<occ.length;i++){ var o=occ[i]; if(x<o[0]+o[2]&&x+w>o[0]&&y<o[1]+o[3]&&y+h>o[1]) return false; } return true; }
    var order=D.c.map(function(c,i){return i;}), sc=function(c){ return (c[0]==='Madrid'?1e7:0)+c[5]+(c[6]?3000:0)+(c[2]==='es'?(k>0.05?1e6:(k>0.02?1500:200)):0); }; order.sort(function(a,b){ return sc(D.c[b])-sc(D.c[a]); });
    ctx.font='600 11.5px -apple-system,Segoe UI,Roboto,Arial,sans-serif'; ctx.lineJoin='round';
    order.forEach(function(ix){ var q=cityP[ix]; if(!q) return; var p=S(q[0],q[1]); if(p[0]<-20||p[0]>Wd+20||p[1]<-20||p[1]>Hd+20) return;
      var c=D.c[ix], inr=null; for(var j=0;j<self.rings.length;j++){ var g=self.rings[j]; if(q[2]<=g.r[1]&&(!inr||g.r[1]<inr.r[1])) inr=g; }
      var es=c[2]==='es', big=c[6]||c[5]>=5000||es&&c[5]>=500;
      if(!big&&!es&&!inr&&k<0.02) return; ctx.beginPath(); ctx.arc(p[0],p[1],inr?(big||es?2.8:(k<0.02?1.5:2)):(big?2.2:1.5),0,7); ctx.fillStyle=inr?inr.c:(es?'#d9d4c3':'#8e959b'); ctx.fill();
      if(inr&&(big||es)){ ctx.lineWidth=1; ctx.strokeStyle='#000'; ctx.stroke(); }
      if(!self.labels) return; var t=cn(c), w=ctx.measureText(t).width+4;
      if(!big&&!inr&&k<0.03) return; if(!big&&k<0.012) return; if(es&&c[0]!=='Madrid'&&k<0.012) return;
      var lx=p[0]+5, ly=p[1]-12; if(lx+w>Wd-46) lx=p[0]-5-w;
      if(!free(lx,ly,w,14)) return; occ.push([lx,ly,w,14]);
      ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,.85)'; ctx.strokeText(t,lx+2,ly+7); ctx.fillStyle=inr?'#fff':(es?'#e4dfcf':'#b9bec2'); ctx.fillText(t,lx+2,ly+7); });
    // objetivo elegido en Impacto («¿Qué misiles llegan aquí?»)
    if(self.tgt!=null&&cityP&&cityP[self.tgt]){ var tq=cityP[self.tgt], tp=S(tq[0],tq[1]); if(tp[0]>-20&&tp[0]<Wd+20&&tp[1]>-20&&tp[1]<Hd+20){ ctx.lineWidth=2.2; ctx.strokeStyle='#ff6a55'; ctx.beginPath(); ctx.arc(tp[0],tp[1],9,0,7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(tp[0]-16,tp[1]); ctx.lineTo(tp[0]-5,tp[1]); ctx.moveTo(tp[0]+5,tp[1]); ctx.lineTo(tp[0]+16,tp[1]); ctx.moveTo(tp[0],tp[1]-16); ctx.lineTo(tp[0],tp[1]-5); ctx.moveTo(tp[0],tp[1]+5); ctx.lineTo(tp[0],tp[1]+16); ctx.stroke(); } }
    // ciudad resaltada desde el buscador
    if(self.hl!=null&&cityP&&cityP[self.hl]){ var hq=cityP[self.hl], hp=S(hq[0],hq[1]); ctx.setLineDash([]); ctx.lineWidth=2.5; ctx.strokeStyle='#ffd166'; ctx.beginPath(); ctx.arc(hp[0],hp[1],11,0,7); ctx.stroke(); ctx.beginPath(); ctx.arc(hp[0],hp[1],4,0,7); ctx.fillStyle='#ffd166'; ctx.fill();
      var ht=cn(D.c[self.hl]); ctx.font='700 13px -apple-system,Segoe UI,Roboto,Arial,sans-serif'; var hw=ctx.measureText(ht).width+10, hx=Math.max(4,Math.min(Wd-hw-4,hp[0]-hw/2)), hy=hp[1]-36; if(hy<4) hy=hp[1]+16; ctx.fillStyle='rgba(8,10,12,.88)'; ctx.fillRect(hx,hy,hw,20); ctx.fillStyle='#ffd166'; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillText(ht,hx+5,hy+10.5); }
    // punto de lanzamiento
    var o=S(0,0); ctx.beginPath(); ctx.arc(o[0],o[1],9,0,7); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fill(); ctx.beginPath(); ctx.arc(o[0],o[1],4.5,0,7); ctx.fillStyle='#fff'; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='#d33'; ctx.stroke();
    // etiquetas de anillo
    ctx.font='700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif';
    var lb=[]; rs.slice().reverse().forEach(function(g){ var r=Math.min(g.r[1],ANTI*0.985), t=g.n+' · '+nf(g.r[1])+' km', w=ctx.measureText(t).width+6, hh=16, angs=[90,62,118,35,145,10,170,-20,-160,-55,-125,-90], ok=null;
      for(var a=0;a<angs.length&&!ok;a++){ var th=angs[a]*RAD, p=S(r*Math.cos(th),r*Math.sin(th)), x=p[0]-w/2, y=(angs[a]>0?p[1]-hh-2:p[1]+2);
        if(x<4||x+w>Wd-48||y<4||y+hh>Hd-22) continue; var clash=lb.some(function(o){ return x<o[0]+o[2]&&x+w>o[0]&&y<o[1]+o[3]&&y+hh>o[1]; }); if(!clash) ok=[x,y,w,hh]; }
      if(!ok) return; lb.push(ok); ctx.fillStyle='rgba(8,10,12,.78)'; ctx.fillRect(ok[0],ok[1],ok[2],ok[3]); ctx.fillStyle=g.c; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillText(t,ok[0]+3,ok[1]+hh/2+0.5); });
  };
  self.fly=function(ix,done){ var q=cityP&&cityP[ix]; if(!q){ done(); return; } var t0=performance.now(), dur=1400;
    function f(now){ var t=Math.min(1,(now-t0)/dur), ez=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; self.draw(); var o=S(0,0), d=S(q[0],q[1]), x=o[0]+(d[0]-o[0])*ez, y=o[1]+(d[1]-o[1])*ez;
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.setLineDash([5,4]); ctx.lineWidth=2; ctx.strokeStyle='rgba(255,150,120,.95)'; ctx.beginPath(); ctx.moveTo(o[0],o[1]); ctx.lineTo(x,y); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(d[0],d[1],8,0,7); ctx.lineWidth=1.5; ctx.strokeStyle='rgba(255,106,85,.9)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(x,y,5,0,7); ctx.fillStyle='#fff'; ctx.fill(); ctx.lineWidth=2.2; ctx.strokeStyle='#ff5a3c'; ctx.stroke();
      if(t<1){ requestAnimationFrame(f); return; }
      ctx.beginPath(); ctx.arc(d[0],d[1],16,0,7); ctx.fillStyle='rgba(255,226,190,.9)'; ctx.fill(); setTimeout(done,280); }
    requestAnimationFrame(f); };
  // gestos
  var pts={}, start=null, pinch=null, moved=false;
  function pos(ev){ var b=cv.getBoundingClientRect(); return [ev.clientX-b.left, ev.clientY-b.top]; }
  cv.addEventListener('pointerdown',function(ev){ cv.setPointerCapture&&cv.setPointerCapture(ev.pointerId); pts[ev.pointerId]=pos(ev); var ks=Object.keys(pts);
    if(ks.length===1){ start={p:pos(ev),ox:self.ox,oy:self.oy,t:Date.now()}; moved=false; }
    else if(ks.length===2){ var a=pts[ks[0]], b=pts[ks[1]]; pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),k:self.k,m:[(a[0]+b[0])/2,(a[1]+b[1])/2],ox:self.ox,oy:self.oy}; moved=true; } });
  cv.addEventListener('pointermove',function(ev){ if(!pts[ev.pointerId]) return; pts[ev.pointerId]=pos(ev); var ks=Object.keys(pts);
    if(ks.length===2&&pinch){ var a=pts[ks[0]], b=pts[ks[1]], d=Math.hypot(a[0]-b[0],a[1]-b[1]); zoomAt(pinch.m[0],pinch.m[1],pinch.k*d/pinch.d,pinch); return; }
    if(start){ var p=pos(ev), dx=p[0]-start.p[0], dy=p[1]-start.p[1]; if(Math.abs(dx)+Math.abs(dy)>6) moved=true; if(moved){ self.ox=start.ox+dx; self.oy=start.oy+dy; req(); } } });
  function up(ev){ var was=pts[ev.pointerId]; delete pts[ev.pointerId]; var n=Object.keys(pts).length;
    if(n<2) pinch=null; if(n===0){ if(start&&!moved&&was&&Date.now()-start.t<600){ var ll=self.inv(was[0],was[1]); if(ll) onTap(ll); } start=null; } else if(n===1){ var k2=Object.keys(pts)[0]; start={p:pts[k2],ox:self.ox,oy:self.oy,t:0}; } }
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',function(ev){ delete pts[ev.pointerId]; pinch=null; start=null; });
  function zoomAt(x,y,nk,base){ nk=Math.max(0.004,Math.min(nk,4)); var b=base||{k:self.k,ox:self.ox,oy:self.oy};
    var wx=(x-Wd/2-b.ox)/b.k, wy=(y-Hd/2-b.oy)/b.k; self.k=nk; self.ox=x-Wd/2-wx*nk; self.oy=y-Hd/2-wy*nk; req(); }
  self.zoom=function(f){ zoomAt(Wd/2,Hd/2,self.k*f); };
  cv.addEventListener('wheel',function(ev){ ev.preventDefault(); var p=pos(ev); zoomAt(p[0],p[1],self.k*Math.pow(1.0018,-ev.deltaY)); },{passive:false});
  var rq=0; function req(){ if(rq) return; rq=requestAnimationFrame(function(){ rq=0; self.draw(); }); }
  self.req=req;
}
// ---------- página ----------
function render(app,X){
  var M=sel(), lp=launch();
  var h='<div class="alc" data-noi18n>'+
   '<p class="lead">'+(EN()?'<b>Step 1.</b> Pick up to three missiles and a launch point: the map draws each one’s range as a true geodesic circle and shows which cities it reaches, how far and roughly how fast. Then tap <b>💥 Simulate impact here</b> on any city to go to step 2.':'<b>Paso 1.</b> Elige hasta tres misiles y un punto de lanzamiento: el mapa dibuja su alcance como un círculo geodésico real y te dice a qué ciudades llega, a qué distancia y en cuánto tiempo aproximado. Después toca <b>💥 Simular impacto aquí</b> en cualquier ciudad para pasar al paso 2.')+'</p>'+
   '<div class="tgt" id="alc-tgt" hidden></div>'+'<div class="selbar" id="alc-sel"></div>'+
   '<div class="pick" id="alc-pick" hidden></div>'+
   '<div class="lrow"><label for="alc-lp" style="font-size:13px;color:var(--mu)">'+(EN()?'Launch from':'Lanzar desde')+'</label><select class="sel" id="alc-lp"></select><div class="lsr"><span class="ic" aria-hidden="true">🚀</span><input type="search" id="alc-lq" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="'+(EN()?'…or search a launch point or city: Madrid, Moscow…':'…o busca un punto o ciudad de lanzamiento: Madrid, Moscú…')+'" aria-label="'+(EN()?'Search launch point':'Buscar punto de lanzamiento')+'" aria-controls="alc-lpl"><button type="button" class="cx" id="alc-lx" aria-label="'+(EN()?'Clear':'Borrar')+'" hidden>×</button><div class="lpl" id="alc-lpl" role="listbox" hidden></div></div><span class="hint">'+(EN()?'…or tap the map to launch from any point. Drag to move · pinch or scroll to zoom.':'…o toca el mapa para lanzar desde cualquier punto. Arrastra para moverte · pellizca o rueda para zoom.')+'</span></div>'+
   '<div class="grid"><div><div class="mapw" id="alc-mw"><canvas id="alc-cv" aria-label="'+(EN()?'Range map':'Mapa de alcance')+'"></canvas>'+
   '<div class="mbtn"><button type="button" data-z="1.5" aria-label="Zoom +">+</button><button type="button" data-z="0.667" aria-label="Zoom −">−</button><button type="button" data-fit="1" aria-label="'+(EN()?'Fit':'Encuadrar')+'">⤢</button><button type="button" data-lab="1" aria-label="'+(EN()?'Labels':'Nombres')+'" style="font-size:13px">Aa</button></div>'+
   '<div class="mtip" id="alc-tip"></div><div class="mleg" id="alc-leg"></div></div>'+
   '<div class="note">'+(EN()?'<b>Estimated nominal range.</b> Real range depends on payload, trajectory, launch platform and conditions. Many figures are third-party estimates or claims by the countries themselves; disputed figures are shown as a range (dashed inner ring = lowest figure, or the shortest-range version). Informational content based on open sources.':'<b>Alcance nominal estimado.</b> El alcance real depende de la carga útil, la trayectoria, la plataforma de lanzamiento y las condiciones. Muchas cifras son estimaciones de terceros o afirmaciones de los propios países; las disputadas se muestran como un intervalo (anillo interior discontinuo = cifra más baja, o la versión de menor alcance). Contenido divulgativo basado en fuentes abiertas.')+'</div>'+'<p class="sub" style="margin-top:8px;font-size:12.5px">'+(EN()?'Azimuthal equidistant projection centred on the launch point: distances and directions from that point are true, which is why ranges are perfect circles; distant shapes are distorted. The outer edge is the antipode (20,015 km).':'Proyección azimutal equidistante centrada en el punto de lanzamiento: las distancias y direcciones desde ese punto son reales, por eso los alcances son círculos perfectos; las formas lejanas se deforman. El borde exterior es el antípoda (20.015 km).')+'</p></div>'+
   '<div class="side"><div id="alc-sum"></div></div></div>'+
   '<h2 id="alc-ch">'+(EN()?'Cities in range':'Ciudades al alcance')+'</h2>'+
   '<div class="csr"><span class="ic" aria-hidden="true">🔎</span><input type="search" id="alc-cq" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="'+(EN()?'Search any city: Lima, Málaga, New York…':'Busca cualquier ciudad: Lima, Málaga, Nueva York…')+'" aria-label="'+(EN()?'Search city':'Buscar ciudad')+'"><button type="button" class="cx" id="alc-cx" aria-label="'+(EN()?'Clear':'Borrar')+'" hidden>×</button></div>'+
   '<div id="alc-cres" aria-live="polite"></div>'+
   '<div id="alc-cities"></div>'+
   '<div class="nextc" id="alc-next"></div>'+
   '<div id="alc-ctry"></div>'+
   '<h2>'+(EN()?'Missile profiles':'Fichas de los misiles')+'</h2><div class="fichas" id="alc-fichas"></div>'+
   '</div>';
  X.set(h,EN()?'Nuclear war: missile ranges':'Guerra nuclear: alcance de misiles');
  var root=app.querySelector('.alc');
  // presets
  var s=root.querySelector('#alc-lp'); s.innerHTML=D.p.map(function(p){ return '<option value="'+p[0]+'">'+e(EN()?p[2]:p[1])+'</option>'; }).join('')+'<option value="_c">'+(EN()?'Point chosen on the map':'Punto elegido en el mapa')+'</option>';
  s.addEventListener('change',function(){ if(s.value==='_c') return; ST.p=s.value; ST.ll=null; recenter(true); });
  // buscadores
  var cq=root.querySelector('#alc-cq'), lq=root.querySelector('#alc-lq'), lpl=root.querySelector('#alc-lpl');
  cq.addEventListener('input',function(){ CUR.cmore=false; csearch(); });
  cq.addEventListener('keydown',function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); cq.blur(); } else if(ev.key==='Escape'){ cq.value=''; csearch(); } });
  root.querySelector('#alc-cx').addEventListener('click',function(){ cq.value=''; CUR.cmore=false; if(MAP){ MAP.hl=null; MAP.draw(); } csearch(); cq.focus(); });
  root.querySelector('#alc-cres').addEventListener('click',function(ev){ if(ev.target.closest('a')) return; var lf=ev.target.closest('[data-lfrom]'); if(lf){ var c=D.c[+lf.getAttribute('data-lfrom')]; lfrom([c[3],c[4]],cn(c)); return; }
    if(ev.target.closest('[data-cmore]')){ CUR.cmore=true; csearch(); return; } var sh=ev.target.closest('[data-show]'); if(sh) cshow(+sh.getAttribute('data-show')); });
  lq.addEventListener('input',lsearch); lq.addEventListener('focus',function(){ if(lq.value) lsearch(); });
  lq.addEventListener('keydown',function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); lpick(lpl.querySelector('.pr')); } else if(ev.key==='Escape'){ lq.value=''; lsearch(); } else if(ev.key==='ArrowDown'){ var f=lpl.querySelector('.pr'); if(f){ ev.preventDefault(); f.focus(); } } });
  lpl.addEventListener('keydown',function(ev){ var b=ev.target.closest('.pr'); if(!b) return; if(ev.key==='ArrowDown'&&b.nextElementSibling){ ev.preventDefault(); b.nextElementSibling.focus(); } else if(ev.key==='ArrowUp'){ ev.preventDefault(); (b.previousElementSibling||lq).focus(); } else if(ev.key==='Escape'){ lq.focus(); lpl.hidden=true; } });
  lpl.addEventListener('click',function(ev){ lpick(ev.target.closest('.pr')); });
  root.querySelector('#alc-lx').addEventListener('click',function(){ lq.value=''; lsearch(); lq.focus(); });
  root.addEventListener('click',function(ev){ if(!ev.target.closest('.lsr')){ lpl.hidden=true; } });
  var cv=root.querySelector('#alc-cv'), mw=root.querySelector('#alc-mw');
  MAP=new Map(cv,mw,function(ll){ ST.p=null; ST.ll=[Math.round(ll[0]*100)/100,Math.round(ll[1]*100)/100]; recenter(false); toast((EN()?'Launch point: ':'Punto de lanzamiento: ')+launch().n); });
  MAP.resize();
  root.querySelector('.mbtn').addEventListener('click',function(ev){ var b=ev.target.closest('button'); if(!b) return; if(b.dataset.z) MAP.zoom(+b.dataset.z); else if(b.dataset.fit) fitAll(); else if(b.dataset.lab){ MAP.labels=!MAP.labels; MAP.draw(); } });
  root.querySelector('#alc-sel').addEventListener('click',function(ev){ var b=ev.target.closest('button'); if(!b) return; if(b.dataset.rm){ ST.m=ST.m.filter(function(x){return x!==b.dataset.rm;}); update(true); } else if(b.dataset.add!=null){ var pk=root.querySelector('#alc-pick'); pk.hidden=!pk.hidden; if(!pk.hidden){ pickRender(); var i=pk.querySelector('input'); if(i&&window.matchMedia&&window.matchMedia('(hover: hover)').matches) i.focus(); } } });
  root.addEventListener('click',function(ev){ var nk=ev.target.closest('a.alc-nuk[data-ci]');
    if(nk&&!ev.metaKey&&!ev.ctrlKey&&!ev.shiftKey&&!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)){ ev.preventDefault(); var fx=+nk.getAttribute('data-ci'), fh=nk.getAttribute('href'); if(CUR.flying) return; CUR.flying=1;
      try{ root.querySelector('#alc-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} MAP.fit(Math.max(CUR.dist[fx]*1.3,400));
      setTimeout(function(){ MAP.fly(fx,function(){ CUR.flying=0; location.hash=fh; }); },450); return; }
    var b=ev.target.closest('[data-home]'); if(b){ ST.p=b.getAttribute('data-home'); ST.ll=null; recenter(true); try{ root.querySelector('#alc-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} }
    var tm=ev.target.closest('[data-tm]'); if(tm){ var mid=tm.getAttribute('data-tm'), mm=byId(mid); if(mm){ ST.m=[mid].concat(ST.m.filter(function(x){ return x!==mid; })).slice(0,3); ST.p=mm.home; ST.ll=null; recenter(true); try{ root.querySelector('#alc-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} } }
    if(ev.target.closest('[data-tx]')){ ST.t=null; update(false); }
    if(ev.target.closest('[data-tmore]')){ CUR.tmore=true; tgt(); }
    var t=ev.target.closest('[data-tab]'); if(t){ CUR.tab=t.getAttribute('data-tab'); CUR.more=false; cities(); }
    var mo=ev.target.closest('[data-more]'); if(mo){ CUR.more=true; cities(); }
    var cp=ev.target.closest('[data-copy]'); if(cp){ var u=location.href; (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){ toast(EN()?'Link copied':'Enlace copiado'); },function(){ window.prompt(EN()?'Copy this link':'Copia este enlace',u); }); } });
  var rz=null; CUR.onrs=function(){ clearTimeout(rz); rz=setTimeout(function(){ if(!document.body.contains(cv)){ window.removeEventListener('resize',CUR.onrs); return; } var k0=MAP.k; MAP.resize(); MAP.k=k0; MAP.draw(); },120); };
  window.addEventListener('resize',CUR.onrs);
  meta(); recenter(true);
}
// ---------- buscador de ciudades (todas las de D.c, dentro o fuera de alcance) ----------
function nz(s){ return norm(s).replace(/[^a-z0-9]+/g,' ').trim(); }
var AKA={us:'usa eeuu ee uu estados unidos united states america',gb:'uk inglaterra england gran bretana britain',ru:'rusia russia',kp:'corea del norte north korea',kr:'corea del sur south korea',cn:'china',ae:'emiratos uae',nl:'holanda holland'};
var CK=null;
function ckeys(){ if(CK) return CK; var DNs={};
  function cnm(iso,l){ try{ if(!DNs[l]) DNs[l]=new Intl.DisplayNames([l],{type:'region'}); return DNs[l].of(String(iso).toUpperCase())||''; }catch(x){ return ''; } }
  CK=D.c.map(function(c){ var iso=c[2]; return {n:[nz(c[0]),nz(c[1]||'')].filter(Boolean), k:nz([cnm(iso,'es'),cnm(iso,'en'),PN[iso]?PN[iso].join(' '):'',AKA[iso]||''].join(' '))}; });
  return CK; }
function cfind(q){ var n=nz(q); if(!n) return []; var nc=n.replace(/ /g,''), toks=n.split(' '), K=ckeys(), out=[];
  K.forEach(function(k,i){ var sc=0;
    k.n.forEach(function(nm){ var cm=nm.replace(/ /g,''), v=0; if(nm===n||cm===nc) v=100; else if(cm.indexOf(nc)===0) v=80; else if((' '+nm).indexOf(' '+n)>=0) v=70; else if(cm.indexOf(nc)>=0) v=50; if(v>sc) sc=v; });
    if(!sc){ var hay=k.n.join(' ')+' '+k.k; if(toks.every(function(t){ return hay.indexOf(t)>=0; })) sc=(' '+k.k).indexOf(' '+n)>=0?30:15; }
    if(sc) out.push([i,sc]); });
  out.sort(function(a,b){ var A=D.c[a[0]],B=D.c[b[0]]; return b[1]-a[1]||((B[2]==='es')-(A[2]==='es'))||((B[6]||0)-(A[6]||0))||(B[5]-A[5]); });
  return out.map(function(x){ return x[0]; }); }
function csearch(){ var el=document.getElementById('alc-cres'), qi=document.getElementById('alc-cq'); if(!el||!qi) return; var q=qi.value, cx=document.getElementById('alc-cx'); if(cx) cx.hidden=!q;
  if(!nz(q)){ el.innerHTML=''; return; }
  var r=cfind(q), M=sel(), lp=launch();
  if(!r.length){ el.innerHTML='<div class="cres0"><b>'+(EN()?'Not in M.A.T’s city list':'No está en la lista de ciudades de M.A.T')+'</b><br>'+(EN()?'Tip: tap the map at any point to launch from there, or pick any point on the map as a target in the <a href="#/guerra-nuclear?tab=impacto">Impact tab</a>.':'Consejo: toca el mapa en cualquier punto para lanzar desde ahí, o elige cualquier punto del mapa como objetivo en la <a href="#/guerra-nuclear?tab=impacto">pestaña Impacto</a>.')+'</div>'; return; }
  var lim=CUR.cmore?60:8, shown=r.slice(0,lim);
  var h='<div class="cresh">'+(EN()?(r.length===1?'1 result':r.length+' results')+' · distance from '+e(lp.n):(r.length===1?'1 resultado':r.length+' resultados')+' · distancia desde '+e(lp.n))+'</div>'+
   shown.map(function(i){ var c=D.c[i], d=CUR.dist[i]; var bs=M.map(function(m,j){ return badge(m,j,d); }).join('');
    return '<div class="crow'+(MAP&&MAP.hl===i?' on':'')+'" data-show="'+i+'"><div class="cm">'+fl(c[2])+'<b>'+e(cn(c))+'</b> <span class="no">'+e(cname(c[2]))+'</span><br>'+
     (bs||'<span class="out">'+(M.length?(EN()?'Out of range of the selected missiles':'Fuera de alcance de los misiles elegidos'):(EN()?'Pick a missile to see if it reaches':'Elige un misil para ver si llega'))+'</span>')+
     '<div class="ca"><a class="alc-nuk" data-ci="'+i+'" href="'+impHref(i)+'">💥 '+(EN()?'Simulate impact here':'Simular impacto aquí')+'</a><button type="button" class="cb2" data-show="'+i+'">📍 '+(EN()?'See on map':'Ver en el mapa')+'</button><button type="button" class="cb2" data-lfrom="'+i+'">🚀 '+(EN()?'Launch from here':'Lanzar desde aquí')+'</button></div></div><div class="n">'+km(d)+'</div></div>'; }).join('');
  if(r.length>lim) h+='<button type="button" class="more" data-cmore="1">'+(EN()?'Show more results ':'Ver más resultados ')+'('+r.length+')</button>';
  el.innerHTML=h; }
function cshow(i){ if(!MAP) return; MAP.hl=i; MAP.fit(Math.max((CUR.dist[i]||0)*1.25,600)); MAP.draw(); csearch(); try{ document.getElementById('alc-mw').scrollIntoView({behavior:'smooth',block:'nearest'}); }catch(x){} }
function lfrom(ll,nm){ ST.p=null; ST.ll=[Math.round(ll[0]*100)/100,Math.round(ll[1]*100)/100]; recenter(true); toast((EN()?'Launch point: ':'Punto de lanzamiento: ')+(nm||launch().n)); }
// ---------- buscador del punto de lanzamiento (puntos de referencia + cualquier ciudad) ----------
function lsearch(){ var el=document.getElementById('alc-lpl'), qi=document.getElementById('alc-lq'); if(!el||!qi) return; var q=qi.value, n=nz(q), lx=document.getElementById('alc-lx'); if(lx) lx.hidden=!q;
  if(!n){ el.hidden=true; el.innerHTML=''; return; }
  var ps=D.p.filter(function(p){ return (' '+nz(p[1]+' '+p[2]+' '+p[0])).indexOf(' '+n)>=0||nz(p[1]+' '+p[2]).replace(/ /g,'').indexOf(n.replace(/ /g,''))>=0; }).slice(0,6);
  var cs=cfind(q).slice(0,8);
  var h=ps.map(function(p){ return '<button type="button" class="pr" role="option" data-lp="'+e(p[0])+'"><span class="nm">🎯 '+e(EN()?p[2]:p[1])+'<small>'+(EN()?'Reference launch point':'Punto de lanzamiento de referencia')+'</small></span></button>'; }).join('')+
   cs.map(function(i){ var c=D.c[i]; return '<button type="button" class="pr" role="option" data-lc="'+i+'">'+fl(c[2])+'<span class="nm">'+e(cn(c))+'<small>'+e(cname(c[2]))+' · '+(EN()?'launch from this city':'lanzar desde esta ciudad')+'</small></span></button>'; }).join('');
  el.innerHTML=h||'<p class="sub" style="padding:8px 10px;margin:0">'+(EN()?'No match. Tap the map to launch from any point.':'Sin coincidencias. Toca el mapa para lanzar desde cualquier punto.')+'</p>';
  el.hidden=false; }
function lpick(b){ var qi=document.getElementById('alc-lq'); if(!b) return;
  if(b.hasAttribute('data-lp')){ ST.p=b.getAttribute('data-lp'); ST.ll=null; recenter(true); }
  else if(b.hasAttribute('data-lc')){ var c=D.c[+b.getAttribute('data-lc')]; lfrom([c[3],c[4]],cn(c)); }
  if(qi){ qi.value=''; qi.blur(); } lsearch(); }
function fitAll(){ var mx=0; sel().forEach(function(m){ if(m.r[1]>mx) mx=m.r[1]; }); MAP.fit(mx||1000); }
function recenter(fit){ var lp=launch(); MAP.center(lp.lat,lp.lon); update(fit!==false); var s=document.getElementById('alc-lp'); if(s) s.value=ST.p||'_c'; }
function update(fit){
  var M=sel(); writeQ(); var lp=launch();
  MAP.rings=M.map(function(m,i){ return {r:m.r,c:COL[i],n:m.n.split(' (')[0]}; });
  // distancias a ciudades
  CUR.dist=D.c.map(function(c){ return dist(lp.lat,lp.lon,c[3],c[4]); });
  var order=D.c.map(function(c,i){return i;}); order.sort(function(a,b){ var A=D.c[a],B=D.c[b]; var pa=(A[2]==='es'?2e6:0)+(A[6]?1e6:0)+A[5], pb=(B[2]==='es'?2e6:0)+(B[6]?1e6:0)+B[5]; return pb-pa; });
  MAP.cityOrder=order;
  if(fit) fitAll(); else MAP.draw();
  // barra de selección
  var sb=document.getElementById('alc-sel');
  sb.innerHTML=M.map(function(m,i){ return '<span class="pill"><i style="background:'+COL[i]+'"></i><span>'+e(m.n.split(' (')[0])+'</span><small>'+rng(m)+'</small><button type="button" data-rm="'+m.id+'" aria-label="'+(EN()?'Remove':'Quitar')+'">×</button></span>'; }).join('')+
    '<button type="button" class="addb" data-add="1">'+(M.length<3?(EN()?'+ Add missile':'+ Añadir misil'):(EN()?'Change missiles':'Cambiar misiles'))+' ('+D.m.length+')</button>';
  if(!M.length){ var pk=document.getElementById('alc-pick'); if(pk.hidden){ pk.hidden=false; pickRender(); } }
  var pk2=document.getElementById('alc-pick'); if(pk2&&!pk2.hidden) pickRender(true);
  document.getElementById('alc-leg').textContent=(EN()?'Launch: ':'Lanzamiento: ')+lp.n;
  document.getElementById('alc-tip').style.opacity=0;
  tgt(); summary(); csearch(); cities(); nextc(); countries(); fichas();
}
// panel «¿Qué misiles llegan a…?» (viene de la pestaña Impacto) y tarjeta del paso 2
function tgt(){ var el=document.getElementById('alc-tgt'); if(!el) return; var tp=tpos(); MAP.tgt=(ST.t&&ST.t.i!=null)?ST.t.i:null;
  if(!tp){ el.hidden=true; el.innerHTML=''; return; } el.hidden=false;
  var L2=D.m.map(function(m){ var hp=preset(m.home), d=dist(hp[3],hp[4],tp.lat,tp.lon); return {m:m,hp:hp,d:d}; }).filter(function(x){ return x.d<=x.m.r[1]; });
  L2.sort(function(a,b){ return a.d-b.d; });
  var lp=launch(), dl=dist(lp.lat,lp.lon,tp.lat,tp.lon), cur=sel().filter(function(m){ return dl<=m.r[1]; });
  var lim=CUR.tmore?L2.length:6;
  var h='<button type="button" class="tx" data-tx="1" aria-label="'+(EN()?'Close':'Cerrar')+'">×</button><h3>🎯 '+(EN()?'Which missiles reach ':'¿Qué misiles llegan a ')+'<b>'+e(tp.n)+'</b>?</h3>'+
   '<div class="sub" style="font-size:12.5px">'+(L2.length?(EN()?L2.length+' of '+D.m.length+' missiles, each from its reference launch point in M.A.T (its country or usual base). Tap one to draw it on the map.':L2.length+' de '+D.m.length+' misiles, cada uno desde su punto de lanzamiento de referencia en M.A.T (su país o base habitual). Toca uno para dibujarlo en el mapa.'):(EN()?'None of the '+D.m.length+' missiles reaches it from its reference launch point.':'Ninguno de los '+D.m.length+' misiles llega desde su punto de lanzamiento de referencia.'))+'</div>';
  if(L2.length) h+='<div class="tl">'+L2.slice(0,lim).map(function(x){ return '<button type="button" class="tr" data-tm="'+x.m.id+'">'+fl(x.m.pa)+'<b>'+e(x.m.n.split(' (')[0])+'</b><small>'+(EN()?'from ':'desde ')+e(EN()?x.hp[2]:x.hp[1])+' · '+km(x.d)+' · '+ftime(x.m,x.d)+'</small></button>'; }).join('')+'</div>'+(L2.length>lim?'<button type="button" class="more" data-tmore="1">'+(EN()?'Show all ':'Ver todos ')+'('+L2.length+')</button>':'');
  h+='<p class="cur">'+(EN()?'From the current launch point (':'Desde el punto de lanzamiento actual (')+e(lp.n)+', '+km(dl)+'): '+(cur.length?cur.map(function(m){ return '<b>'+e(m.n.split(' (')[0])+'</b> '+ftime(m,dl); }).join(', '):(EN()?'none of the selected missiles reaches it.':'no llega ninguno de los misiles elegidos.'))+'</p>'+
   '<a class="alc-nuk" href="'+impHref(ST.t.i!=null?ST.t.i:null,ST.t.ll)+'">💥 '+(EN()?'Back to the impact on ':'Volver al impacto en ')+e(tp.n)+'</a>';
  el.innerHTML=h; }
function nextc(){ var el=document.getElementById('alc-next'); if(!el) return; var tp=tpos(), mi=0; D.c.forEach(function(c,i){ if(c[0]==='Madrid') mi=i; });
  var href=tp?impHref(ST.t.i!=null?ST.t.i:null,ST.t.ll):impHref(mi), nm=tp?tp.n:cn(D.c[mi]);
  el.innerHTML='<div class="tx2"><b>② '+(EN()?'What would happen if it hit?':'¿Qué pasaría si impacta?')+'</b><br>'+(EN()?'Tap <b>💥 Simulate impact here</b> on any city above, or go straight to the Impact tab: effects of the detonation on the real street map.':'Toca <b>💥 Simular impacto aquí</b> en cualquier ciudad de la lista, o pasa directamente a la pestaña Impacto: efectos de la detonación sobre el callejero real.')+'</div><a class="btn" href="'+href+'">💥 '+(EN()?'Impact on ':'Impacto en ')+e(nm)+' ›</a>'; }

function pickRender(keep){ var pk=document.getElementById('alc-pick'); if(!pk) return; var c=CUR.cat||'all', q=(CUR.q||'');
  if(!keep||!pk.querySelector('.plist')){
    pk.innerHTML='<div class="chips" id="alc-cats">'+CATS.map(function(k){ return '<button type="button" class="chip" data-cat="'+k[0]+'" aria-pressed="'+(k[0]===c)+'">'+e(EN()?k[2]:k[1])+'</button>'; }).join('')+'</div>'+
    '<input type="search" id="alc-q" placeholder="'+(EN()?'Search: Tomahawk, Iran, ICBM…':'Buscar: Tomahawk, Irán, ICBM…')+'" value="'+e(q)+'" autocomplete="off"><div class="plist" id="alc-pl"></div>';
    pk.querySelector('#alc-cats').addEventListener('click',function(ev){ var b=ev.target.closest('[data-cat]'); if(!b) return; CUR.cat=b.getAttribute('data-cat'); [].forEach.call(pk.querySelectorAll('[data-cat]'),function(x){ x.setAttribute('aria-pressed',x===b); }); plist(); });
    pk.querySelector('#alc-q').addEventListener('input',function(ev){ CUR.q=ev.target.value; plist(); });
    pk.querySelector('#alc-pl').addEventListener('click',function(ev){ var b=ev.target.closest('[data-id]'); if(!b) return; toggle(b.getAttribute('data-id')); });
  }
  plist(); }
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function plist(){ var pl=document.getElementById('alc-pl'); if(!pl) return; var c=CUR.cat||'all', q=norm(CUR.q);
  var L2=D.m.filter(function(m){ if(c!=='all'&&tags(m).indexOf(c)<0) return false; if(q){ var hay=norm([m.n,m.alt,pais(m),L(PN[m.pa]),PN[m.pa]?PN[m.pa].join(' '):'',tags(m).map(function(t){return GS[t].join(' ');}).join(' ')].join(' ')); return q.split(/\s+/).every(function(w){ return hay.indexOf(w)>=0; }); } return true; });
  var by={}, ord=[]; L2.forEach(function(m){ if(!by[m.pa]){ by[m.pa]=[]; ord.push(m.pa); } by[m.pa].push(m); });
  pl.innerHTML=ord.map(function(p){ return '<div class="pgh">'+fl(p)+e(L(PN[p]))+' · '+by[p].length+'</div>'+by[p].map(function(m){ var i=ST.m.indexOf(m.id);
    return '<button type="button" class="pr" data-id="'+m.id+'"><span class="ck" style="'+(i>=0?'background:'+COL[i]+';border-color:'+COL[i]:'')+'"></span><span class="nm">'+e(m.n)+'<small>'+e(L(GL[m.g]))+(m.st==='ret'?' · '+e(L(STL.ret)):'')+(m.unc?' · ⚠ '+(EN()?'uncertain':'incierto'):'')+'</small></span><span class="rg">'+rng(m)+'</span></button>'; }).join(''); }).join('')||'<p class="sub" style="padding:12px 4px">'+(EN()?'No matches.':'Sin resultados.')+'</p>'; }
function toggle(id){ var i=ST.m.indexOf(id); if(i>=0) ST.m.splice(i,1); else { if(ST.m.length>=3){ var old=byId(ST.m[2]); ST.m[2]=id; toast((EN()?'Up to 3 missiles: replaced ':'Máximo 3 misiles: se sustituye ')+old.n); } else ST.m.push(id); } update(true); }
function summary(){ var M=sel(), lp=launch(), el=document.getElementById('alc-sum'); if(!el) return;
  var mi=-1; D.c.forEach(function(c,i){ if(c[0]==='Madrid') mi=i; }); var md=CUR.dist[mi];
  var reach=M.filter(function(m){ return md<=m.r[1]; });
  var h='<div class="mad">📍 <b>Madrid</b> · '+km(md)+(EN()?' from ':' desde ')+e(lp.n)+'<br>'+(M.length?(reach.length?(EN()?'Within range of: ':'Al alcance de: ')+reach.map(function(m){ var i=ST.m.indexOf(m.id); return '<span class="bd'+(md>m.r[0]?' o':'')+'" style="border-color:'+COL[i]+';background:'+COL[i]+'22;color:'+COL[i]+'">'+e(m.n.split(' (')[0])+' · '+ftime(m,md)+'</span>'; }).join(''):(EN()?'Out of range of the selected missiles.':'Fuera del alcance de los misiles elegidos.')):'')+'<br><a class="alc-nuk" data-ci="'+mi+'" href="'+impHref(mi)+'">💥 '+(EN()?'Simulate impact on Madrid':'Simular impacto en Madrid')+'</a></div>';
  h+='<div class="cards">'+M.map(function(m,i){ var n=0,ne=0; CUR.dist.forEach(function(d,j){ if(d<=m.r[1]){ n++; if(D.c[j][2]==='es') ne++; } });
    return '<div class="sc" style="border-left-color:'+COL[i]+'"><div class="t">'+fl(m.pa)+e(m.n)+'</div><div class="d">'+(EN()?'Range ':'Alcance ')+'<b>'+rng(m)+'</b> · '+e(L(GS[m.g]))+'</div><div class="d"><b>'+n+'</b> '+(EN()?'cities in range':'ciudades al alcance')+' ('+(EN()?'Spain: ':'España: ')+'<b>'+ne+'</b>)'+(m.air?' · '+(EN()?'from the release point':'desde el punto de suelta'):'')+'</div></div>'; }).join('')+'</div>';
  h+='<button type="button" class="btn" data-copy="1" style="width:100%">🔗 '+(EN()?'Copy link to this map':'Copiar enlace a este mapa')+'</button>';
  el.innerHTML=h; }
function badge(m,i,d){ var inn=d<=m.r[1]; if(!inn) return ''; var dub=d>m.r[0]; return '<span class="bd'+(dub?' o':'')+'" title="'+(dub?(EN()?'only within the highest estimate':'solo dentro de la estimación más alta'):'')+'" style="border-color:'+COL[i]+';background:'+COL[i]+'22;color:'+COL[i]+'">'+e(m.n.split(' (')[0].split(' / ')[0])+' '+ftime(m,d)+'</span>'; }
function nuks(c){ return encodeURIComponent(String(c[0]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'')+'-'+c[2]); }
function cities(){ var el=document.getElementById('alc-cities'); if(!el) return; var M=sel(); var tab=CUR.tab||'es';
  var idx=D.c.map(function(c,i){return i;}).filter(function(i){ return tab==='es'?D.c[i][2]==='es':D.c[i][2]!=='es'; });
  var mx=0; M.forEach(function(m){ if(m.r[1]>mx) mx=m.r[1]; });
  if(tab!=='es') idx=idx.filter(function(i){ return CUR.dist[i]<=mx; });
  idx.sort(function(a,b){ return CUR.dist[a]-CUR.dist[b]; });
  var tot=idx.length, lim=CUR.more?idx.length:(tab==='es'?60:40); var shown=idx.slice(0,lim);
  var h='<div class="tabs"><button type="button" class="chip" data-tab="es" aria-pressed="'+(tab==='es')+'">🇪🇸 '+(EN()?'Spain (all)':'España (todas)')+'</button><button type="button" class="chip" data-tab="w" aria-pressed="'+(tab!=='es')+'">🌍 '+(EN()?'Rest of the world':'Resto del mundo')+'</button></div>';
  if(!tot) h+='<p class="sub">'+(EN()?'No major city falls within the selected ranges.':'Ninguna ciudad importante queda dentro de los alcances elegidos.')+'</p>';
  else h+='<table><thead><tr><th>'+(EN()?'City':'Ciudad')+'</th><th style="text-align:right">'+(EN()?'Distance':'Distancia')+'</th></tr></thead><tbody>'+shown.map(function(i){ var c=D.c[i], d=CUR.dist[i];
    var bs=M.map(function(m,j){ return badge(m,j,d); }).join('');
    return '<tr><td>'+fl(c[2])+'<b>'+e(cn(c))+'</b>'+(c[2]!=='es'?' <span class="no">'+e(cname(c[2]))+'</span>':'')+'<br>'+(bs||'<span class="no">'+(EN()?'out of range':'fuera de alcance')+'</span>')+'<br><a class="alc-nuk" data-ci="'+i+'" href="'+impHref(i)+'">💥 '+(EN()?'Simulate impact here':'Simular impacto aquí')+'</a></td><td class="n">'+km(d)+'</td></tr>'; }).join('')+'</tbody></table>';
  if(tot>lim) h+='<button type="button" class="more" data-more="1">'+(EN()?'Show all ':'Ver todas ')+'('+tot+')</button>';
  h+='<p class="sub" style="font-size:12px;margin-top:8px">'+(EN()?'Times are rough estimates (see “How it is calculated”). Dashed badge = only within the highest range estimate.':'Los tiempos son estimaciones orientativas (ver «Cómo se calcula»). Etiqueta discontinua = solo dentro de la estimación de alcance más alta.')+'</p>';
  el.innerHTML=h; }
function countries(){ var el=document.getElementById('alc-ctry'); if(!el) return; var M=sel(), mx=0; M.forEach(function(m){ if(m.r[1]>mx) mx=m.r[1]; });
  var md=MAP.minD||{}, L2=[]; W.forEach(function(c){ if(L2.some(function(x){return x.i===c.i;})) return; var d=md[c.i]; if(d!=null&&d<=mx) L2.push({i:c.i,n:cname(c.i,c.n),d:d}); });
  L2.sort(function(a,b){ return a.d-b.d; });
  el.innerHTML='<h2>'+(EN()?'Countries reached (fully or partly)':'Países al alcance (total o parcialmente)')+' · '+L2.length+'</h2>'+(L2.length?'<div class="ctry">'+L2.map(function(x){ return '<span>'+fl(x.i)+e(x.n)+'</span>'; }).join('')+'</div>':'<p class="sub">—</p>')+
   '<p class="sub" style="font-size:12px;margin-top:8px">'+(EN()?'Based on the largest selected range. A country counts if any part of its territory (Natural Earth 1:50m outline) is within range.':'Según el mayor alcance elegido. Un país cuenta si alguna parte de su territorio (contorno Natural Earth 1:50m) queda dentro.')+'</p>'; }
function ficha(m,i){ var lp=launch(), hp=preset(m.home);
  var fid=m.fid&&window.MAT_DATA&&(window.MAT_DATA.items||[]).some(function(a){return a.id===m.fid;})?m.fid:null;
  var tg=tags(m).map(function(t){ return '<span class="tag">'+e(L(GS[t]))+'</span>'; }).join('')+(m.wh!=='conv'?'<span class="tag nuc">'+(m.wh==='nuc'?(EN()?'Nuclear':'Nuclear'):(EN()?'Nuclear-capable':'Capacidad nuclear'))+'</span>':'')+(m.unc?'<span class="tag unc">⚠ '+(EN()?'Uncertain figures':'Cifras inciertas')+'</span>':'');
  return '<div class="fc" style="border-top-color:'+COL[i]+'"><h3>'+fl(m.pa,'flag')+e(m.n)+'</h3><div class="al">'+e(m.alt||'')+'</div><div>'+tg+'</div><dl>'+
   '<dt>'+(EN()?'Country':'País')+'</dt><dd>'+e(pais(m))+'</dd>'+
   '<dt>'+(EN()?'Type':'Tipo')+'</dt><dd>'+e(L(GL[m.g]))+'</dd>'+
   '<dt>'+(EN()?'Range':'Alcance')+'</dt><dd><b>'+rng(m)+'</b> <span class="no">('+(EN()?'estimated nominal range':'alcance nominal estimado')+')</span>'+(m.rn?'<br><span style="color:#cfd1cd">'+e(L(m.rn))+'</span>':'')+'</dd>'+
   '<dt>'+(EN()?'Speed':'Velocidad')+'</dt><dd>'+(m.v?e(L(m.v)):(EN()?'Ballistic: hypersonic on re-entry (no published figure)':'Balístico: hipersónico en la reentrada (sin cifra publicada)'))+'</dd>'+
   '<dt>'+(EN()?'Warhead':'Cabeza')+'</dt><dd>'+e(L(WHL[m.wh]))+(m.whn?'<br><span class="no" style="font-size:12.5px">'+e(L(m.whn))+'</span>':'')+'</dd>'+
   '<dt>'+(EN()?'Status':'Estado')+'</dt><dd>'+e(L(STL[m.st]))+(m.yr&&m.yr!=='—'?' · '+(EN()?'since ':'desde ')+e(m.yr):'')+(m.ret?'<br><span class="no">'+e(L(m.ret))+'</span>':'')+'</dd>'+
   '<dt>'+(EN()?'Launched from':'Plataforma')+'</dt><dd>'+e(L(m.pl))+'</dd>'+
   (m.esp?'<dt>'+(EN()?'Spain':'España')+'</dt><dd>'+(EN()?'In service with the Spanish Air and Space Force':'En servicio en el Ejército del Aire y del Espacio')+'</dd>':'')+
   '</dl><div class="acts">'+(fid?'<a class="btn" href="#/a/'+e(fid)+'">'+(EN()?'M.A.T profile':'Ficha M.A.T')+' ›</a>':'')+(hp&&ST.p!==m.home?'<button type="button" class="btn" data-home="'+e(m.home)+'">📍 '+(EN()?'Launch from ':'Lanzar desde ')+e(EN()?hp[2]:hp[1])+'</button>':'')+'</div>'+
   '<div class="src">'+(EN()?'Sources: ':'Fuentes: ')+m.src.map(function(s){ return '<a href="'+e(s.u)+'" target="_blank" rel="noopener">'+e(s.t)+'</a>'; }).join(' · ')+'</div></div>'; }
function fichas(){ var el=document.getElementById('alc-fichas'); if(!el) return; var M=sel(); el.innerHTML=M.length?M.map(ficha).join(''):'<p class="sub">'+(EN()?'Add a missile to see its profile.':'Añade un misil para ver su ficha.')+'</p>'; }
function meta(){ var el=document.getElementById('alc-meta'); if(!el) return; var U={}, lst=[];
  D.m.forEach(function(m){ m.src.forEach(function(s){ if(!U[s.u]){ U[s.u]=1; lst.push(s); } }); }); [{t:'Union of Concerned Scientists — ICBMs are unnecessary (tiempo de vuelo de unos 30 minutos)',u:'https://www.ucs.org/about/news/icbms-are-unnecessary-according-union-concerned-scientists'}].forEach(function(s){ if(!U[s.u]){ U[s.u]=1; lst.push(s); } });
  var cs=lst.filter(function(s){return /csis/.test(s.u);}), ot=lst.filter(function(s){return !/csis/.test(s.u);});
  function li(s){ return '<li><a href="'+e(s.u)+'" target="_blank" rel="noopener">'+e(s.t)+'</a></li>'; }
  el.innerHTML=
  (EN()?'<p><b>Range rings.</b> Each ring is the set of points at exactly the stated range from the launch point, measured as a great-circle (geodesic) distance on a sphere of radius 6,371 km (difference from the real ellipsoid: under 0.5%). The map uses an azimuthal equidistant projection centred on the launch point, so rings are drawn as true circles. When sources disagree, the solid ring is the highest figure and the dashed ring the lowest; the band between them is the uncertainty zone.</p><p><b>Cities and countries.</b> A city is “in range” if its distance is less than or equal to the range. Countries count if any point of their outline is inside the largest ring.</p><p><b>Flight times (rough estimates by M.A.T).</b> Ballistic missiles: time of a minimum-energy ballistic trajectory between two points on the surface (Kepler’s laws, no atmosphere or Earth rotation), without the boost phase (about 1–5 minutes depending on the missile). Real missiles can fly flatter (depressed) or higher (lofted) trajectories, which change the time. Cruise, glide and hypersonic missiles: distance divided by the speed given by the sources (Mach ≈ 1,100 km/h at altitude); for subsonic missiles with no published speed, 800–900 km/h is assumed. For air-launched missiles the range and time are counted from the release point; the aircraft can fly a long way before launching.</p><p><b>What this tool does not do.</b> It does not model defences, accuracy, terrain or missile routing (cruise missiles do not fly in a straight line). It is not a targeting tool: it is an educational map based on public data. Detonation effects are in step ② Impact.</p>':
  '<p><b>Anillos de alcance.</b> Cada anillo es el conjunto de puntos que están exactamente a la distancia del alcance indicado desde el punto de lanzamiento, medida como distancia ortodrómica (geodésica) sobre una esfera de 6.371 km de radio (diferencia con el elipsoide real: menos del 0,5 %). El mapa usa una proyección azimutal equidistante centrada en el punto de lanzamiento, por eso los anillos se dibujan como círculos reales. Cuando las fuentes discrepan, el anillo continuo es la cifra más alta y el discontinuo la más baja; la franja entre ambos es la zona de incertidumbre.</p><p><b>Ciudades y países.</b> Una ciudad está «al alcance» si su distancia es menor o igual que el alcance. Un país cuenta si algún punto de su contorno queda dentro del mayor anillo.</p><p><b>Tiempos de vuelo (estimaciones orientativas de M.A.T).</b> Misiles balísticos: tiempo de una trayectoria balística de mínima energía entre dos puntos de la superficie (leyes de Kepler, sin atmósfera ni rotación terrestre), sin contar la fase propulsada (entre 1 y 5 minutos según el misil). Los misiles reales pueden volar trayectorias más tendidas (deprimidas) o más altas (elevadas), que cambian el tiempo. Misiles de crucero, de planeo e hipersónicos: distancia dividida entre la velocidad que dan las fuentes (Mach ≈ 1.100 km/h en altura); en los subsónicos sin velocidad publicada se suponen 800-900 km/h. En los lanzados desde avión, alcance y tiempo se cuentan desde el punto de suelta; el avión puede volar muy lejos antes de lanzar.</p><p><b>Lo que esta herramienta no hace.</b> No modela defensas, precisión, relieve ni rutas (los misiles de crucero no vuelan en línea recta). No es una herramienta de designación de blancos: es un mapa divulgativo basado en datos públicos. Los efectos de la detonación están en el paso ② Impacto.</p>')+
  (EN()?'<p><b>Check on flight times.</b> The model gives about 30–33 minutes for 9,000–10,000 km, in line with the roughly 30-minute flight time of an intercontinental ballistic missile cited by the Union of Concerned Scientists.</p>':'<p><b>Comprobación de los tiempos.</b> El modelo da unos 30-33 minutos para 9.000-10.000 km, en línea con los unos 30 minutos de vuelo de un misil intercontinental que cita la Union of Concerned Scientists.</p>')+
  '<h3 style="font-size:15px;margin:12px 0 4px">'+(EN()?'Sources':'Fuentes')+' · '+lst.length+'</h3>'+
  '<details class="mt"><summary>'+(EN()?'All sources used':'Todas las fuentes usadas')+' ('+lst.length+')</summary>'+
  '<p><b>CSIS Missile Threat</b> — Center for Strategic and International Studies, Missile Defense Project (missilethreat.csis.org). '+cs.length+(EN()?' entries:':' fichas:')+'</p><ul class="srcl">'+cs.map(li).join('')+'</ul>'+
  '<p><b>'+(EN()?'Official sources, manufacturers and other references':'Fuentes oficiales, fabricantes y otras referencias')+'</b></p><ul class="srcl">'+ot.map(li).join('')+'</ul>'+
  '<p><b>'+(EN()?'Map and cities':'Mapa y ciudades')+'</b></p><ul class="srcl"><li><a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> — '+(EN()?'1:50m country outlines and 1:10m populated places (public domain). City selection: national capitals, cities over 3 million, large European and Mediterranean cities and every Spanish city over ~140,000 inhabitants plus provincial capitals and Ceuta, Melilla, Cartagena and Rota.':'contornos de países 1:50m y núcleos de población 1:10m (dominio público). Selección de ciudades: capitales nacionales, ciudades de más de 3 millones, grandes ciudades europeas y mediterráneas y todas las españolas de más de unos 140.000 habitantes, más capitales de provincia, Ceuta, Melilla, Cartagena y Rota.')+'</li></ul>'+
  '<p class="sub" style="font-size:12px">'+(EN()?'Figures checked against the sources on ':'Cifras comprobadas en las fuentes el ')+e(D.upd||'')+'. '+(EN()?'Neutral, informational content: M.A.T does not make its own range estimates.':'Contenido neutral y divulgativo: M.A.T no hace estimaciones propias de alcance.')+'</p></details>'; }

// ---------- datos para la pestaña Impacto («viene de Alcance») ----------
// Devuelve el misil, el punto de lanzamiento, la distancia y el tiempo de vuelo hasta el punto cero (solo carga alcance.json.gz).
window.MAT_ALC_ORIGIN=function(fm,fp,lat,lon){ return loadD().then(function(){ var m=byId(fm); if(!m) return null; var lp=null;
  if(fp&&preset(fp)){ var p=preset(fp); lp={lat:p[3],lon:p[4],n:EN()?p[2]:p[1]}; }
  else { var mm=String(fp||'').match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); if(mm&&Math.abs(+mm[1])<=90&&Math.abs(+mm[2])<=180) lp={lat:+mm[1],lon:+mm[2],n:customName([+mm[1],+mm[2]])}; }
  if(!lp){ var h=preset(m.home); lp={lat:h[3],lon:h[4],n:EN()?h[2]:h[1]}; fp=m.home; }
  var d=dist(lp.lat,lp.lon,lat,lon);
  return {id:m.id,n:m.n.split(' (')[0],fl:fl(m.pa),pa:pais(m),from:lp.n,fp:fp,d:d,km:km(d),t:ftime(m,d),reach:d<=m.r[0]?2:(d<=m.r[1]?1:0),rng:rng(m),wh:m.wh,whl:L(WHL[m.wh]),ny:m.ny||null,src:m.src[0]||null}; }); };
window.MAT_ALCANCE_META=function(){ return loadD().then(function(){ css(); meta(); }); };
window.MAT_ALCANCE=function(app,X){ css(); app.innerHTML='<p class="sub" style="padding:24px 0">'+(EN()?'Loading map…':'Cargando mapa…')+'</p>';
  load().then(function(){ if(X.alive&&!X.alive()) return; ST=readQ(X); CUR={tab:(CUR&&CUR.tab)||'es'}; render(app,X); }).catch(function(err){ app.innerHTML='<p class="sub" style="padding:24px 0">'+(EN()?'Could not load the map.':'No se pudo cargar el mapa.')+'</p>'; if(window.console) console.error(err); }); };
})();
