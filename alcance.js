(function(){
"use strict";
// ============ M.A.T · Alcance de misiles (#/alcance) ============
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
  return s; }
function writeQ(){ var h='#/alcance?m='+ST.m.join(',')+'&p='+(ST.p||(ST.ll[0].toFixed(2)+','+ST.ll[1].toFixed(2)));
  if(location.hash!==h){ try{ history.replaceState(null,'',h); }catch(x){} } }
function launch(){ if(ST.p){ var p=preset(ST.p); return {lat:p[3],lon:p[4],n:EN()?p[2]:p[1]}; } return {lat:ST.ll[0],lon:ST.ll[1],n:customName(ST.ll)}; }
function customName(ll){ var best=null,bd=1e9; D.c.forEach(function(c){ var d=dist(ll[0],ll[1],c[3],c[4]); if(d<bd){bd=d;best=c;} });
  var t=(Math.abs(ll[0]).toFixed(2)+'°'+(ll[0]>=0?'N':'S')+' '+Math.abs(ll[1]).toFixed(2)+'°'+(ll[1]>=0?'E':(EN()?'W':'O')));
  if(best&&bd<300) return (EN()?'Near ':'Cerca de ')+cn(best)+' ('+t+')'; return (EN()?'Chosen point ':'Punto elegido ')+'('+t+')'; }
function cn(c){ return EN()&&c[1]?c[1]:c[0]; }
function sel(){ return ST.m.map(byId).filter(Boolean); }
// ---------- CSS ----------
function css(){ if(document.getElementById('alc-css')) return; var s=document.createElement('style'); s.id='alc-css';
 s.textContent=
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
function load(){ if(LD) return LD; LD=Promise.all([window.MAT_GET('alcance.json.gz'),window.MAT_GET('world.json.gz')]).then(function(z){ D=z[0]; W=prepW(z[1]); return D; }); return LD; }
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
    // punto de lanzamiento
    var o=S(0,0); ctx.beginPath(); ctx.arc(o[0],o[1],9,0,7); ctx.fillStyle='rgba(255,255,255,.18)'; ctx.fill(); ctx.beginPath(); ctx.arc(o[0],o[1],4.5,0,7); ctx.fillStyle='#fff'; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='#d33'; ctx.stroke();
    // etiquetas de anillo
    ctx.font='700 12px -apple-system,Segoe UI,Roboto,Arial,sans-serif';
    var lb=[]; rs.slice().reverse().forEach(function(g){ var r=Math.min(g.r[1],ANTI*0.985), t=g.n+' · '+nf(g.r[1])+' km', w=ctx.measureText(t).width+6, hh=16, angs=[90,62,118,35,145,10,170,-20,-160,-55,-125,-90], ok=null;
      for(var a=0;a<angs.length&&!ok;a++){ var th=angs[a]*RAD, p=S(r*Math.cos(th),r*Math.sin(th)), x=p[0]-w/2, y=(angs[a]>0?p[1]-hh-2:p[1]+2);
        if(x<4||x+w>Wd-48||y<4||y+hh>Hd-22) continue; var clash=lb.some(function(o){ return x<o[0]+o[2]&&x+w>o[0]&&y<o[1]+o[3]&&y+hh>o[1]; }); if(!clash) ok=[x,y,w,hh]; }
      if(!ok) return; lb.push(ok); ctx.fillStyle='rgba(8,10,12,.78)'; ctx.fillRect(ok[0],ok[1],ok[2],ok[3]); ctx.fillStyle=g.c; ctx.textBaseline='middle'; ctx.textAlign='left'; ctx.fillText(t,ok[0]+3,ok[1]+hh/2+0.5); });
  };
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
  var h='<div class="alc" data-noi18n>'+X.crumbs([[EN()?'Home':'Inicio','#/'],[EN()?'Missile ranges':'Alcance de misiles']])+
   '<h1>'+(EN()?'Missile ranges':'Alcance de misiles')+'</h1>'+
   '<p class="lead">'+(EN()?'Pick up to three missiles and a launch point: the map draws each one’s range as a true geodesic circle and shows which cities it reaches, how far and roughly how fast.':'Elige hasta tres misiles y un punto de lanzamiento: el mapa dibuja su alcance como un círculo geodésico real y te dice a qué ciudades llega, a qué distancia y en cuánto tiempo aproximado.')+'</p>'+
   '<a class="btn alc-nuc" href="#/guerra-nuclear" style="display:flex;align-items:center;gap:10px;min-height:52px;margin:6px 0 10px;border-color:#a2402f;background:#2a1311;color:#ffd9cf;font-weight:700;font-size:16px;text-decoration:none"><span style="font-size:22px">💥</span><span style="flex:1">'+(EN()?'Nuclear war':'Guerra nuclear')+'<small style="display:block;font-weight:400;font-size:12.5px;color:#e6bdb3">'+(EN()?'Effects simulator on the real map of any city':'Simulador de efectos sobre el mapa real de cualquier ciudad')+'</small></span><span style="font-size:20px">›</span></a>'+'<div class="selbar" id="alc-sel"></div>'+
   '<div class="pick" id="alc-pick" hidden></div>'+
   '<div class="lrow"><label for="alc-lp" style="font-size:13px;color:var(--mu)">'+(EN()?'Launch from':'Lanzar desde')+'</label><select class="sel" id="alc-lp"></select><span class="hint">'+(EN()?'…or tap the map to launch from any point. Drag to move · pinch or scroll to zoom.':'…o toca el mapa para lanzar desde cualquier punto. Arrastra para moverte · pellizca o rueda para zoom.')+'</span></div>'+
   '<div class="grid"><div><div class="mapw" id="alc-mw"><canvas id="alc-cv" aria-label="'+(EN()?'Range map':'Mapa de alcance')+'"></canvas>'+
   '<div class="mbtn"><button type="button" data-z="1.5" aria-label="Zoom +">+</button><button type="button" data-z="0.667" aria-label="Zoom −">−</button><button type="button" data-fit="1" aria-label="'+(EN()?'Fit':'Encuadrar')+'">⤢</button><button type="button" data-lab="1" aria-label="'+(EN()?'Labels':'Nombres')+'" style="font-size:13px">Aa</button></div>'+
   '<div class="mtip" id="alc-tip"></div><div class="mleg" id="alc-leg"></div></div>'+
   '<div class="note">'+(EN()?'<b>Estimated nominal range.</b> Real range depends on payload, trajectory, launch platform and conditions. Many figures are third-party estimates or claims by the countries themselves; disputed figures are shown as a range (dashed inner ring = lowest figure, or the shortest-range version). Informational content based on open sources.':'<b>Alcance nominal estimado.</b> El alcance real depende de la carga útil, la trayectoria, la plataforma de lanzamiento y las condiciones. Muchas cifras son estimaciones de terceros o afirmaciones de los propios países; las disputadas se muestran como un intervalo (anillo interior discontinuo = cifra más baja, o la versión de menor alcance). Contenido divulgativo basado en fuentes abiertas.')+'</div>'+'<p class="sub" style="margin-top:8px;font-size:12.5px">'+(EN()?'Azimuthal equidistant projection centred on the launch point: distances and directions from that point are true, which is why ranges are perfect circles; distant shapes are distorted. The outer edge is the antipode (20,015 km).':'Proyección azimutal equidistante centrada en el punto de lanzamiento: las distancias y direcciones desde ese punto son reales, por eso los alcances son círculos perfectos; las formas lejanas se deforman. El borde exterior es el antípoda (20.015 km).')+'</p></div>'+
   '<div class="side"><div id="alc-sum"></div></div></div>'+
   '<div id="alc-cities"></div><div id="alc-ctry"></div>'+
   '<h2>💥 '+(EN()?'Nuclear detonation effects (simulator)':'Efectos de una detonación nuclear (simulador)')+'</h2><div id="alc-fx"></div>'+
   '<h2>'+(EN()?'Missile profiles':'Fichas de los misiles')+'</h2><div class="fichas" id="alc-fichas"></div>'+
   '<div id="alc-meta"></div></div>';
  X.set(h,EN()?'Missile ranges':'Alcance de misiles');
  var root=app.querySelector('.alc');
  // presets
  var s=root.querySelector('#alc-lp'); s.innerHTML=D.p.map(function(p){ return '<option value="'+p[0]+'">'+e(EN()?p[2]:p[1])+'</option>'; }).join('')+'<option value="_c">'+(EN()?'Point chosen on the map':'Punto elegido en el mapa')+'</option>';
  s.addEventListener('change',function(){ if(s.value==='_c') return; ST.p=s.value; ST.ll=null; recenter(true); });
  var cv=root.querySelector('#alc-cv'), mw=root.querySelector('#alc-mw');
  MAP=new Map(cv,mw,function(ll){ if(CUR.pickT){ CUR.pickT=false; fxPick(ll); return; } ST.p=null; ST.ll=[Math.round(ll[0]*100)/100,Math.round(ll[1]*100)/100]; recenter(false); toast((EN()?'Launch point: ':'Punto de lanzamiento: ')+launch().n); });
  MAP.resize();
  root.querySelector('.mbtn').addEventListener('click',function(ev){ var b=ev.target.closest('button'); if(!b) return; if(b.dataset.z) MAP.zoom(+b.dataset.z); else if(b.dataset.fit) fitAll(); else if(b.dataset.lab){ MAP.labels=!MAP.labels; MAP.draw(); } });
  root.querySelector('#alc-sel').addEventListener('click',function(ev){ var b=ev.target.closest('button'); if(!b) return; if(b.dataset.rm){ ST.m=ST.m.filter(function(x){return x!==b.dataset.rm;}); update(true); } else if(b.dataset.add!=null){ var pk=root.querySelector('#alc-pick'); pk.hidden=!pk.hidden; if(!pk.hidden){ pickRender(); var i=pk.querySelector('input'); if(i&&window.matchMedia&&window.matchMedia('(hover: hover)').matches) i.focus(); } } });
  root.addEventListener('click',function(ev){ var b=ev.target.closest('[data-home]'); if(b){ ST.p=b.getAttribute('data-home'); ST.ll=null; recenter(true); try{ root.querySelector('#alc-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} }
    var t=ev.target.closest('[data-tab]'); if(t){ CUR.tab=t.getAttribute('data-tab'); CUR.more=false; cities(); }
    var mo=ev.target.closest('[data-more]'); if(mo){ CUR.more=true; cities(); }
    var cp=ev.target.closest('[data-copy]'); if(cp){ var u=location.href; (navigator.clipboard?navigator.clipboard.writeText(u):Promise.reject()).then(function(){ toast(EN()?'Link copied':'Enlace copiado'); },function(){ window.prompt(EN()?'Copy this link':'Copia este enlace',u); }); } });
  var rz=null; CUR.onrs=function(){ clearTimeout(rz); rz=setTimeout(function(){ if(!document.body.contains(cv)){ window.removeEventListener('resize',CUR.onrs); return; } var k0=MAP.k; MAP.resize(); MAP.k=k0; MAP.draw(); if(CUR.fxcv) fxUpd(false); },120); };
  window.addEventListener('resize',CUR.onrs);
  meta(); recenter(true); fxInit();
}
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
  summary(); cities(); countries(); fichas(); if(CUR.fxcv) fxUpd(false);
}
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
  var h='<div class="mad">📍 <b>Madrid</b> · '+km(md)+(EN()?' from ':' desde ')+e(lp.n)+'<br>'+(M.length?(reach.length?(EN()?'Within range of: ':'Al alcance de: ')+reach.map(function(m){ var i=ST.m.indexOf(m.id); return '<span class="bd'+(md>m.r[0]?' o':'')+'" style="border-color:'+COL[i]+';background:'+COL[i]+'22;color:'+COL[i]+'">'+e(m.n.split(' (')[0])+' · '+ftime(m,md)+'</span>'; }).join(''):(EN()?'Out of range of the selected missiles.':'Fuera del alcance de los misiles elegidos.')):'')+'</div>';
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
  var h='<h2>'+(EN()?'Cities in range':'Ciudades al alcance')+'</h2><div class="tabs"><button type="button" class="chip" data-tab="es" aria-pressed="'+(tab==='es')+'">🇪🇸 '+(EN()?'Spain (all)':'España (todas)')+'</button><button type="button" class="chip" data-tab="w" aria-pressed="'+(tab!=='es')+'">🌍 '+(EN()?'Rest of the world':'Resto del mundo')+'</button></div>';
  if(!tot) h+='<p class="sub">'+(EN()?'No major city falls within the selected ranges.':'Ninguna ciudad importante queda dentro de los alcances elegidos.')+'</p>';
  else h+='<table><thead><tr><th>'+(EN()?'City':'Ciudad')+'</th><th style="text-align:right">'+(EN()?'Distance':'Distancia')+'</th></tr></thead><tbody>'+shown.map(function(i){ var c=D.c[i], d=CUR.dist[i];
    var bs=M.map(function(m,j){ return badge(m,j,d); }).join('');
    return '<tr><td>'+fl(c[2])+'<b>'+e(cn(c))+'</b>'+(c[2]!=='es'?' <span class="no">'+e(cname(c[2]))+'</span>':'')+'<br>'+(bs||'<span class="no">'+(EN()?'out of range':'fuera de alcance')+'</span>')+'<br><a class="alc-nuk" href="#/guerra-nuclear?c='+nuks(c)+'" style="display:inline-block;margin-top:4px;font-size:12.5px;color:#ff9c8a;border:1px solid #6a2a24;border-radius:999px;padding:3px 10px;text-decoration:none">💥 '+(EN()?'Simulate impact here':'Simular impacto aquí')+'</a></td><td class="n">'+km(d)+'</td></tr>'; }).join('')+'</tbody></table>';
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
  D.m.forEach(function(m){ m.src.forEach(function(s){ if(!U[s.u]){ U[s.u]=1; lst.push(s); } }); }); D.fx.y.forEach(function(y){ var s=y[4]; if(!U[s.u]){ U[s.u]=1; lst.push(s); } }); D.fx.src.concat([{t:'Union of Concerned Scientists — ICBMs are unnecessary (tiempo de vuelo de unos 30 minutos)',u:'https://www.ucs.org/about/news/icbms-are-unnecessary-according-union-concerned-scientists'}]).forEach(function(s){ if(!U[s.u]){ U[s.u]=1; lst.push(s); } });
  var cs=lst.filter(function(s){return /csis/.test(s.u);}), ot=lst.filter(function(s){return !/csis/.test(s.u);});
  function li(s){ return '<li><a href="'+e(s.u)+'" target="_blank" rel="noopener">'+e(s.t)+'</a></li>'; }
  el.innerHTML='<h2>'+(EN()?'How it is calculated':'Cómo se calcula')+'</h2>'+
  '<details class="mt"><summary>'+(EN()?'Method, assumptions and limits':'Método, supuestos y límites')+'</summary>'+
  (EN()?'<p><b>Range rings.</b> Each ring is the set of points at exactly the stated range from the launch point, measured as a great-circle (geodesic) distance on a sphere of radius 6,371 km (difference from the real ellipsoid: under 0.5%). The map uses an azimuthal equidistant projection centred on the launch point, so rings are drawn as true circles. When sources disagree, the solid ring is the highest figure and the dashed ring the lowest; the band between them is the uncertainty zone.</p><p><b>Cities and countries.</b> A city is “in range” if its distance is less than or equal to the range. Countries count if any point of their outline is inside the largest ring.</p><p><b>Flight times (rough estimates by M.A.T).</b> Ballistic missiles: time of a minimum-energy ballistic trajectory between two points on the surface (Kepler’s laws, no atmosphere or Earth rotation), without the boost phase (about 1–5 minutes depending on the missile). Real missiles can fly flatter (depressed) or higher (lofted) trajectories, which change the time. Cruise, glide and hypersonic missiles: distance divided by the speed given by the sources (Mach ≈ 1,100 km/h at altitude); for subsonic missiles with no published speed, 800–900 km/h is assumed. For air-launched missiles the range and time are counted from the release point; the aircraft can fly a long way before launching.</p><p><b>What this tool does not do.</b> It does not model defences, accuracy, warhead effects, terrain or missile routing (cruise missiles do not fly in a straight line). It is not a targeting tool: it is an educational map based on public data.</p>':
  '<p><b>Anillos de alcance.</b> Cada anillo es el conjunto de puntos que están exactamente a la distancia del alcance indicado desde el punto de lanzamiento, medida como distancia ortodrómica (geodésica) sobre una esfera de 6.371 km de radio (diferencia con el elipsoide real: menos del 0,5 %). El mapa usa una proyección azimutal equidistante centrada en el punto de lanzamiento, por eso los anillos se dibujan como círculos reales. Cuando las fuentes discrepan, el anillo continuo es la cifra más alta y el discontinuo la más baja; la franja entre ambos es la zona de incertidumbre.</p><p><b>Ciudades y países.</b> Una ciudad está «al alcance» si su distancia es menor o igual que el alcance. Un país cuenta si algún punto de su contorno queda dentro del mayor anillo.</p><p><b>Tiempos de vuelo (estimaciones orientativas de M.A.T).</b> Misiles balísticos: tiempo de una trayectoria balística de mínima energía entre dos puntos de la superficie (leyes de Kepler, sin atmósfera ni rotación terrestre), sin contar la fase propulsada (entre 1 y 5 minutos según el misil). Los misiles reales pueden volar trayectorias más tendidas (deprimidas) o más altas (elevadas), que cambian el tiempo. Misiles de crucero, de planeo e hipersónicos: distancia dividida entre la velocidad que dan las fuentes (Mach ≈ 1.100 km/h en altura); en los subsónicos sin velocidad publicada se suponen 800-900 km/h. En los lanzados desde avión, alcance y tiempo se cuentan desde el punto de suelta; el avión puede volar muy lejos antes de lanzar.</p><p><b>Lo que esta herramienta no hace.</b> No modela defensas, precisión, efectos de la cabeza de guerra, relieve ni rutas (los misiles de crucero no vuelan en línea recta). No es una herramienta de designación de blancos: es un mapa divulgativo basado en datos públicos.</p>')+
  (EN()?'<p><b>Check on flight times.</b> The model gives about 30–33 minutes for 9,000–10,000 km, in line with the roughly 30-minute flight time of an intercontinental ballistic missile cited by the Union of Concerned Scientists.</p><p><b>Nuclear effects simulator.</b> Blast rings: distances for 1 megaton from the U.S. Congress Office of Technology Assessment (OTA, <i>The Effects of Nuclear War</i>, 1979): air burst at 8,000 ft, table 3 (20 psi 1.3 km, 10 psi 4.8 km, 5 psi 7.0 km, 3 psi 9.5 km, 1 psi 18.6 km; 12 and 2 psi interpolated by M.A.T); surface burst, Detroit case (12 psi 2.7 km, 5 psi 4.4 km, 2 psi 7.6 km; 1 psi ≈11.8 km measured on its figure 4). Other yields use the cube-root scaling law (Glasstone & Dolan, ch. 3). Fireball: maximum radius ≈ twice the breakaway radius, 100·W<sup>0.4</sup> ft in the air and 145·W<sup>0.4</sup> ft on the surface (Glasstone & Dolan §2.127). Third-degree burns: 8 km for 1 Mt on a clear day (OTA), scaled with W<sup>0.41</sup>, an approximation that allows for atmospheric attenuation (thermal range is smaller for surface bursts and in haze, rain or cloud). Casualties: population of the built-up urban area (Demographia World Urban Areas 2025) spread uniformly over a circle of the same area centred on the city, multiplied by the OTA fractions (figure 1): over 12 psi 98% killed and 2% injured; 5–12 psi 50% killed and 40% injured; 2–5 psi 5% killed and 45% injured; 1–2 psi 25% injured. The result is shown as a ±30% range and rounded. It ignores fallout, fires, radiation and the actual layout of the city.</p>':'<p><b>Comprobación de los tiempos.</b> El modelo da unos 30-33 minutos para 9.000-10.000 km, en línea con los unos 30 minutos de vuelo de un misil intercontinental que cita la Union of Concerned Scientists.</p><p><b>Simulador de efectos nucleares.</b> Anillos de la onda expansiva: distancias para 1 megatón de la Oficina de Evaluación Tecnológica del Congreso de EE. UU. (OTA, <i>The Effects of Nuclear War</i>, 1979): explosión aérea a 8.000 pies, tabla 3 (20 psi 1,3 km; 10 psi 4,8 km; 5 psi 7,0 km; 3 psi 9,5 km; 1 psi 18,6 km; 12 y 2 psi interpolados por M.A.T); explosión en superficie, caso de Detroit (12 psi 2,7 km; 5 psi 4,4 km; 2 psi 7,6 km; 1 psi ≈11,8 km medido sobre su figura 4). Para otras potencias se aplica la ley de escala de la raíz cúbica (Glasstone y Dolan, cap. 3). Bola de fuego: radio máximo ≈ el doble del radio de «breakaway», 100·W<sup>0,4</sup> pies en el aire y 145·W<sup>0,4</sup> pies en superficie (Glasstone y Dolan §2.127). Quemaduras de tercer grado: 8 km para 1 Mt en un día despejado (OTA), escalado con W<sup>0,41</sup>, aproximación que tiene en cuenta la atenuación atmosférica (el alcance térmico es menor en superficie y con bruma, lluvia o nubes). Víctimas: población del área urbana construida (Demographia World Urban Areas 2025) repartida uniformemente en un círculo de la misma superficie centrado en la ciudad, multiplicada por las fracciones de la OTA (figura 1): más de 12 psi, 98 % muertos y 2 % heridos; 5-12 psi, 50 % muertos y 40 % heridos; 2-5 psi, 5 % muertos y 45 % heridos; 1-2 psi, 25 % heridos. El resultado se da como intervalo ±30 % y redondeado. No tiene en cuenta lluvia radiactiva, incendios, radiación ni la forma real de la ciudad.</p>')+'</details>'+
  '<h2>'+(EN()?'Sources':'Fuentes')+' · '+lst.length+'</h2>'+
  '<details class="mt"><summary>'+(EN()?'All sources used':'Todas las fuentes usadas')+' ('+lst.length+')</summary>'+
  '<p><b>CSIS Missile Threat</b> — Center for Strategic and International Studies, Missile Defense Project (missilethreat.csis.org). '+cs.length+(EN()?' entries:':' fichas:')+'</p><ul class="srcl">'+cs.map(li).join('')+'</ul>'+
  '<p><b>'+(EN()?'Official sources, manufacturers and other references':'Fuentes oficiales, fabricantes y otras referencias')+'</b></p><ul class="srcl">'+ot.map(li).join('')+'</ul>'+
  '<p><b>'+(EN()?'Map and cities':'Mapa y ciudades')+'</b></p><ul class="srcl"><li><a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a> — '+(EN()?'1:50m country outlines and 1:10m populated places (public domain). City selection: national capitals, cities over 3 million, large European and Mediterranean cities and every Spanish city over ~140,000 inhabitants plus provincial capitals and Ceuta, Melilla, Cartagena and Rota.':'contornos de países 1:50m y núcleos de población 1:10m (dominio público). Selección de ciudades: capitales nacionales, ciudades de más de 3 millones, grandes ciudades europeas y mediterráneas y todas las españolas de más de unos 140.000 habitantes, más capitales de provincia, Ceuta, Melilla, Cartagena y Rota.')+'</li></ul>'+
  '<p class="sub" style="font-size:12px">'+(EN()?'Figures checked against the sources on ':'Cifras comprobadas en las fuentes el ')+e(D.upd||'')+'. '+(EN()?'Neutral, informational content: M.A.T does not make its own range estimates.':'Contenido neutral y divulgativo: M.A.T no hace estimaciones propias de alcance.')+'</p></details>'; }

// ---------- simulador de efectos nucleares (divulgativo) ----------
function sig2(n){ if(n<=0) return '0'; var p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; }
function people(n){ n=sig2(n); if(n>=1e6) return (EN()?(n/1e6).toFixed(n>=1e7?0:1):String((n/1e6).toFixed(n>=1e7?0:1)).replace('.',','))+(EN()?' million':' millones'); return nf(n); }
function ykt(y){ return y>=1000?(String(+(y/1000).toFixed(y>=10000?0:2)).replace('.',EN()?'.':',')+' Mt'):(String(+y.toFixed(y<1?2:(y<10?1:0))).replace('.',EN()?'.':',')+' kt'); }
function fxRadii(y,b){ var F=D.fx, s=Math.cbrt(y/1000), B=b==='surf'?F.surf:F.air, R=[];
  var fb=(b==='surf'?290:200)*Math.pow(y,0.4)*0.0003048;
  R.push({k:'fb',r:fb,c:'#ffd34d',t:['Bola de fuego (radio máximo)','Fireball (maximum radius)'],d:['Todo lo que hay dentro se vaporiza o arde.','Everything inside is vaporised or burned.']});
  if(B.p20) R.push({k:'p20',r:B.p20*s,c:'#b3261e',t:['Onda expansiva 20 psi','Blast 20 psi'],d:['Arrasa estructuras de hormigón armado (OTA).','Levels reinforced-concrete structures (OTA).']});
  R.push({k:'p12',r:B.p12*s,c:'#e8452c',t:['Onda expansiva 12 psi','Blast 12 psi'],d:['Destrucción casi total; mueren casi todos (98 % en el modelo OTA).','Near-total destruction; almost everyone killed (98% in the OTA model).']});
  R.push({k:'p5',r:B.p5*s,c:'#f08a24',t:['Onda expansiva 5 psi','Blast 5 psi'],d:['Se derrumban las viviendas típicas y los edificios ligeros (OTA).','Typical homes and light buildings collapse (OTA).']});
  R.push({k:'th',r:F.th3*Math.pow(y/1000,0.41),c:'#ffb000',dash:1,t:['Quemaduras de tercer grado','Third-degree burns'],d:['Radiación térmica en un día despejado, personas al descubierto.','Thermal radiation on a clear day, people in the open.']});
  R.push({k:'p2',r:B.p2*s,c:'#c7a27a',t:['Onda expansiva 2 psi','Blast 2 psi'],d:['Daños graves en viviendas; heridos por escombros.','Severe damage to homes; injuries from debris.']});
  R.push({k:'p1',r:B.p1*s,c:'#8fb3c9',t:['Onda expansiva 1 psi','Blast 1 psi'],d:['Rotura de cristales; heridos por cristales y objetos lanzados (OTA).','Windows shattered; injuries from glass and flying objects (OTA).']});
  R.forEach(function(x){ x.r=Math.round(x.r*1000)/1000; }); return R; }
function fxCas(c,R){ if(!c[7]) return null; var P0=c[7][0], A=c[7][1], ru=Math.sqrt(A/PI), rho=P0/A;
  function rr(k){ for(var i=0;i<R.length;i++) if(R[i].k===k) return R[i].r; return 0; }
  var e=[0,rr('p12'),rr('p5'),rr('p2'),rr('p1')], F=D.fx.fr, dead=0, inj=0;
  for(var i=0;i<4;i++){ var a=Math.min(e[i],ru), b=Math.min(e[i+1],ru), pop=rho*PI*(b*b-a*a); dead+=pop*F[i][0]/100; inj+=pop*F[i][1]/100; }
  return {dead:dead,inj:inj,pop:P0,area:A,ru:ru}; }
function fxTargets(){ var L2=[]; D.c.forEach(function(c,i){ if(c[7]) L2.push(i); }); L2.sort(function(a,b){ var A=D.c[a],B=D.c[b]; if((A[2]==='es')!==(B[2]==='es')) return A[2]==='es'?-1:1; return cn(A).localeCompare(cn(B)); }); return L2; }
function fxInit(){ var el=document.getElementById('alc-fx'); if(!el) return; var F=CUR.fx;
  var T2=fxTargets();
  el.innerHTML='<a class="btn alc-nuc2" href="#/guerra-nuclear" style="display:inline-flex;min-height:42px;margin:4px 0 8px;border-color:#a2402f;color:#ffd9cf;text-decoration:none">💥 '+(EN()?'Open the full simulator (real street map, more effects)':'Abrir el simulador completo (callejero real, más efectos)')+' ›</a>'+'<p class="sub" style="font-size:13.5px;color:#cfd1cd">'+(EN()?'What would a single nuclear detonation do to a city? Choose a target and a yield (presets are real warheads with sourced yields). Rings follow the classic scaling laws; casualties use the simple U.S. Congress (OTA, 1979) model.':'¿Qué haría una sola detonación nuclear sobre una ciudad? Elige objetivo y potencia (los preajustes son cabezas reales con potencias citadas). Los anillos siguen las leyes de escala clásicas; las víctimas, el modelo sencillo del Congreso de EE. UU. (OTA, 1979).')+'</p>'+
   '<div class="lrow"><label for="alc-tg" style="font-size:13px;color:var(--mu)">'+(EN()?'Target':'Objetivo')+'</label><select class="sel" id="alc-tg">'+T2.map(function(i){ var c=D.c[i]; return '<option value="'+i+'"'+(i===F.t?' selected':'')+'>'+e(cn(c))+(c[2]!=='es'?' ('+e(cname(c[2]))+')':'')+'</option>'; }).join('')+'</select><button type="button" class="btn" id="alc-tgmap" style="min-height:40px;font-size:13px">🎯 '+(EN()?'Pick on the map':'Elegir en el mapa')+'</button></div>'+
   '<div style="font-size:13px;color:var(--mu);margin:4px 0">'+(EN()?'Yield':'Potencia')+': <b id="alc-yv" style="color:var(--tx)"></b> <span id="alc-yn" class="no"></span></div>'+
   '<div class="chips" id="alc-ych">'+D.fx.y.map(function(y){ return '<button type="button" class="chip" data-y="'+y[3]+'" data-yid="'+y[0]+'">'+e(EN()?y[2]:y[1])+' · '+ykt(y[3])+'</button>'; }).join('')+'</div>'+
   '<input type="range" id="alc-ys" min="0" max="1000" step="1" aria-label="'+(EN()?'Yield':'Potencia')+'" style="width:100%;height:32px;padding:0;margin:6px 0;background:transparent;border:0;accent-color:#e8452c">'+
   '<div class="tabs" style="flex-wrap:wrap"><button type="button" class="chip" data-b="air">'+(EN()?'Air burst':'Explosión aérea')+'</button><button type="button" class="chip" data-b="surf">'+(EN()?'Surface burst':'Explosión en superficie')+'</button><button type="button" class="btn" id="alc-det" style="margin-left:auto;min-height:36px;font-size:13px;border-color:#7a3b37">'+(EN()?'▶ Detonate':'▶ Detonar')+'</button></div>'+
   '<div class="mapw" style="touch-action:auto"><canvas id="alc-fxc" aria-label="'+(EN()?'Effects map':'Mapa de efectos')+'"></canvas><div class="mleg" id="alc-fxl" style="top:8px;bottom:auto;right:8px"></div></div>'+
   '<div id="alc-fxo"></div>';
  var ys=el.querySelector('#alc-ys'); function y2s(y){ return Math.round((Math.log10(y)+1)/(Math.log10(50000)+1)*1000); } function s2y(s){ var v=Math.pow(10,s/1000*(Math.log10(50000)+1)-1); return v<10?Math.round(v*10)/10:(v<1000?Math.round(v):Math.round(v/10)*10); }
  ys.value=y2s(F.y);
  ys.addEventListener('input',function(){ F.y=s2y(+ys.value); F.yid=null; fxUpd(false); });
  el.querySelector('#alc-ych').addEventListener('click',function(ev){ var b=ev.target.closest('[data-y]'); if(!b) return; F.y=+b.getAttribute('data-y'); F.yid=b.getAttribute('data-yid'); ys.value=y2s(F.y); fxUpd(true); });
  el.querySelector('.tabs').addEventListener('click',function(ev){ var b=ev.target.closest('[data-b]'); if(b){ F.b=b.getAttribute('data-b'); fxUpd(true); } });
  el.querySelector('#alc-det').addEventListener('click',function(){ fxUpd(true); });
  el.querySelector('#alc-tg').addEventListener('change',function(ev){ F.t=+ev.target.value; fxUpd(true); });
  el.querySelector('#alc-tgmap').addEventListener('click',function(){ CUR.pickT=true; toast(EN()?'Tap the map above to choose the target city':'Toca el mapa de arriba para elegir la ciudad objetivo'); try{ document.getElementById('alc-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} });
  var cv=el.querySelector('#alc-fxc'); CUR.fxcv=cv;
  fxUpd(true); }
function fxPick(ll){ var best=-1,bd=1e9; D.c.forEach(function(c,i){ if(!c[7]) return; var d=dist(ll[0],ll[1],c[3],c[4]); if(d<bd){ bd=d; best=i; } }); if(best<0) return; CUR.fx.t=best; var s=document.getElementById('alc-tg'); if(s) s.value=best; fxUpd(true); toast((EN()?'Target: ':'Objetivo: ')+cn(D.c[best])); try{ document.getElementById('alc-fx').scrollIntoView({behavior:'smooth',block:'start'}); }catch(x){} }
function fxUpd(anim){ var F=CUR.fx, el=document.getElementById('alc-fx'); if(!el) return; var c=D.c[F.t];
  el.querySelector('#alc-yv').textContent=ykt(F.y);
  var yp=null; D.fx.y.forEach(function(y){ if(y[0]===F.yid) yp=y; }); el.querySelector('#alc-yn').textContent=yp?'— '+(EN()?yp[2]:yp[1]):'';
  [].forEach.call(el.querySelectorAll('[data-yid]'),function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-yid')===F.yid); });
  [].forEach.call(el.querySelectorAll('[data-b]'),function(b){ b.setAttribute('aria-pressed',b.getAttribute('data-b')===F.b); });
  var R=fxRadii(F.y,F.b), cs=fxCas(c,R), lp=launch(), d=dist(lp.lat,lp.lon,c[3],c[4]);
  var M=sel(), h='';
  h+='<div class="mad">🎯 <b>'+e(cn(c))+'</b> · '+km(d)+(EN()?' from ':' desde ')+e(lp.n)+'<br>'+(M.length?M.map(function(m,i){ var ok=d<=m.r[1]; return '<span class="bd'+(ok&&d>m.r[0]?' o':'')+'" style="border-color:'+COL[i]+';background:'+(ok?COL[i]+'22':'transparent')+';color:'+(ok?COL[i]:'var(--dim)')+'">'+e(m.n.split(' (')[0])+' · '+(ok?ftime(m,d):(EN()?'out of range':'fuera de alcance'))+(ok&&m.wh==='conv'?' · '+(EN()?'conventional only':'solo convencional'):'')+'</span>'; }).join(''):'')+'</div>';
  h+='<table><thead><tr><th>'+(EN()?'Effect':'Efecto')+'</th><th style="text-align:right">'+(EN()?'Radius':'Radio')+'</th></tr></thead><tbody>'+R.map(function(x){ return '<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+x.c+';margin-right:6px"></span><b>'+e(L(x.t))+'</b><br><span class="no" style="font-size:12.5px">'+e(L(x.d))+'</span></td><td class="n">'+(x.r<1?String(Math.round(x.r*1000))+' m':String(x.r.toFixed(x.r<10?1:0)).replace('.',EN()?'.':',')+' km')+'<br><span class="no">'+String(+(PI*x.r*x.r).toFixed(PI*x.r*x.r<10?1:0)).replace('.',EN()?'.':',')+' km²</span></td></tr>'; }).join('')+'</tbody></table>';
  if(cs){ var lo=0.7, hi=1.3;
    h+='<div class="sc" style="border-left-color:#b3261e;margin-top:12px"><div class="t">'+(EN()?'Rough casualty estimate':'Estimación muy aproximada de víctimas')+'</div>'+
      '<div class="d">'+(EN()?'Deaths: ':'Muertos: ')+'<b>'+people(cs.dead*lo)+' – '+people(cs.dead*hi)+'</b></div><div class="d">'+(EN()?'Injured: ':'Heridos: ')+'<b>'+people(cs.inj*lo)+' – '+people(cs.inj*hi)+'</b></div>'+
      '<div class="d" style="font-size:12px">'+(EN()?'Urban area: ':'Área urbana: ')+people(cs.pop)+(EN()?' people on ':' habitantes en ')+nf(cs.area)+' km² (Demographia 2025). '+(EN()?'Range = model result ±30%.':'Intervalo = resultado del modelo ±30 %.')+'</div></div>';
  } else h+='<p class="sub">'+(EN()?'No urban population data for this city.':'Sin datos de población urbana para esta ciudad.')+'</p>';
  h+='<div class="note">'+(EN()?'<b>Educational, very rough simulation.</b> Real effects depend on the time of day, weather, terrain, shelters, building types and burst height. It does not include radioactive fallout, firestorms, initial radiation or long-term effects, which would add many more victims. Method and sources in “How it is calculated”.':'<b>Simulación divulgativa y muy aproximada.</b> Los efectos reales dependen de la hora, el clima, el relieve, los refugios, el tipo de edificios y la altura de la explosión. No incluye lluvia radiactiva, tormentas de fuego, radiación inicial ni efectos a largo plazo, que añadirían muchas más víctimas. Método y fuentes en «Cómo se calcula».')+'</div>';
  el.querySelector('#alc-fxo').innerHTML=h;
  fxDraw(c,R,cs,anim); }
function fxDraw(c,R,cs,anim){ var cv=CUR.fxcv; if(!cv) return; var wrap=cv.parentNode, w=wrap.clientWidth||320, hh=Math.round(Math.min(w*0.85,520)), dpr=Math.min(window.devicePixelRatio||1,2);
  cv.style.height=hh+'px'; cv.width=Math.round(w*dpr); cv.height=Math.round(hh*dpr); var ctx=cv.getContext('2d');
  var lat0=c[3], lon0=c[4], kx=111.32*Math.cos(lat0*RAD), ky=110.57, rmax=0; R.forEach(function(x){ if(x.r>rmax) rmax=x.r; }); if(cs) rmax=Math.max(rmax,cs.ru);
  var vr=rmax*1.18, k=Math.min(w,hh)/2/vr, cx=w/2, cy=hh/2;
  function P(lat,lon){ var dl=lon-lon0; if(dl>180) dl-=360; if(dl<-180) dl+=360; return [cx+dl*kx*k, cy-(lat-lat0)*ky*k]; }
  var dlat=vr*1.6/ky, dlon=vr*1.6/Math.max(kx,1);
  var land=new Path2D();
  W.forEach(function(cc){ cc.R.forEach(function(a){ var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; for(var i=0;i<a.length;i+=2){ var dx=((a[i]-lon0+540)%360)-180; if(dx<x0)x0=dx; if(dx>x1)x1=dx; if(a[i+1]<y0)y0=a[i+1]; if(a[i+1]>y1)y1=a[i+1]; } if(x1<-dlon||x0>dlon||y1<lat0-dlat||y0>lat0+dlat||x1-x0>300) return; var p=new Path2D(); for(var j=0;j<a.length;j+=2){ var q=P(a[j+1],a[j]); if(j) p.lineTo(q[0],q[1]); else p.moveTo(q[0],q[1]); } p.closePath(); land.addPath(p); }); });
  var t0=performance.now(), dur=anim?1700:0;
  function frame(now){ var t=dur?Math.min(1,(now-t0)/dur):1;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle='#0d1820'; ctx.fillRect(0,0,w,hh); ctx.fillStyle='#262d24'; ctx.fill(land); ctx.lineWidth=0.8; ctx.strokeStyle='#4a5641'; ctx.stroke(land);
    if(cs){ ctx.setLineDash([5,4]); ctx.strokeStyle='rgba(230,225,205,.55)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(cx,cy,cs.ru*k,0,7); ctx.stroke(); ctx.setLineDash([]); }
    var S2=R.slice().sort(function(a,b){ return b.r-a.r; });
    S2.forEach(function(x,i){ var idx=R.indexOf(x), st=idx/(R.length+2), tt=Math.max(0,Math.min(1,(t-st*0.5)/(1-st*0.5))), ez=1-Math.pow(1-tt,3), r=x.r*k*ez; if(r<=0) return;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,7); if(!x.dash){ ctx.globalAlpha=x.k==='fb'?0.85:0.22; ctx.fillStyle=x.c; ctx.fill(); ctx.globalAlpha=1; }
      ctx.lineWidth=x.dash?2:1.6; ctx.strokeStyle=x.c; if(x.dash) ctx.setLineDash([6,4]); ctx.stroke(); ctx.setLineDash([]); });
    // ciudades cercanas
    ctx.font='600 11px -apple-system,Segoe UI,Roboto,Arial,sans-serif'; ctx.lineJoin='round'; ctx.textBaseline='middle';
    D.c.forEach(function(o){ var q=P(o[3],o[4]); if(q[0]<4||q[0]>w-4||q[1]<4||q[1]>hh-4) return; ctx.beginPath(); ctx.arc(q[0],q[1],o===c?3.5:2.2,0,7); ctx.fillStyle='#fff'; ctx.fill(); var tx=cn(o); ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,.85)'; ctx.strokeText(tx,q[0]+6,q[1]-8); ctx.fillStyle='#fff'; ctx.fillText(tx,q[0]+6,q[1]-8); });
    // escala
    var sb=[0.5,1,2,5,10,20,50,100,200], L3=sb[0]; for(var i=0;i<sb.length;i++) if(sb[i]*k<w*0.28) L3=sb[i];
    ctx.fillStyle='rgba(8,10,12,.75)'; ctx.fillRect(8,hh-30,L3*k+16,22); ctx.strokeStyle='#ddd'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(16,hh-14); ctx.lineTo(16+L3*k,hh-14); ctx.stroke(); ctx.fillStyle='#ddd'; ctx.font='10.5px -apple-system,Segoe UI,Roboto,Arial,sans-serif'; ctx.fillText(String(L3).replace('.',',')+' km',18,hh-22);
    if(t<1) requestAnimationFrame(frame); }
  requestAnimationFrame(frame); if(!anim) frame(performance.now());
  document.getElementById('alc-fxl').textContent=cs?(EN()?'Dashed white circle: urban area of the same size (Demographia)':'Círculo blanco discontinuo: área urbana de igual superficie (Demographia)'):''; }
window.MAT_ALCANCE=function(app,X){ css(); app.innerHTML='<p class="sub" style="padding:24px 0">'+(EN()?'Loading map…':'Cargando mapa…')+'</p>';
  load().then(function(){ if(!/^#\/alcance/.test(location.hash||'')) return; ST=readQ(X); var mi=0; D.c.forEach(function(c,i){ if(c[0]==='Madrid') mi=i; }); CUR={tab:'es',fx:{t:mi,y:100,yid:'w76',b:'air'}}; render(app,X); }).catch(function(err){ app.innerHTML='<p class="sub" style="padding:24px 0">'+(EN()?'Could not load the map.':'No se pudo cargar el mapa.')+'</p>'; if(window.console) console.error(err); }); };
})();
