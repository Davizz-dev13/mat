(function(){
"use strict";
// ============ M.A.T · Guerra nuclear (#/guerra-nuclear; alias #/nuclear) ============
// Simulador divulgativo de los efectos de UNA detonación nuclear sobre una ciudad.
// Datos: nuclear.json.gz (442 ciudades con población por anillos GHSL 2025, preajustes de potencia, fuentes).
// Mapa: Leaflet (ya alojado en la web) + teselas estándar de OpenStreetMap, cargados solo en esta ruta.
var PI=Math.PI, RAD=PI/180, RE=6371, MI=1.609344, FT=0.0003048;
var D=null, LD=null, LP=null, MAP=null, S=null, LY=[], ANI=null, X0=null, IDX={};
function EN(){return window.MAT_LANG==='en';}
function T2(es,en){return EN()?en:es;}
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nf(n){ n=Math.round(n); var s=String(Math.abs(n)), o=''; while(s.length>3){ o=(EN()?',':'.')+s.slice(-3)+o; s=s.slice(0,-3);} return (n<0?'-':'')+s+o; }
function dec(x,d){ return String((+x).toFixed(d)).replace('.',EN()?'.':','); }
function kmf(r){ if(r<=0) return '—'; if(r<1) return nf(Math.round(r*1000/10)*10)+' m'; return dec(r,r<10?1:0)+' km'; }
function sig2(n){ if(n<=0) return 0; var p=Math.pow(10,Math.floor(Math.log10(n))-1); return Math.round(n/p)*p; }
function people(n){ if(n<1) return '0'; if(n<100) return nf(Math.max(1,Math.round(n/10)*10)); n=sig2(n); if(n>=1e6) return dec(n/1e6,n>=1e7?0:1)+(EN()?' million':' millones'); return nf(n); }
function tr(n,d){ return String(+(+n).toFixed(d)).replace('.',EN()?'.':','); }
function ykt(y){ return y>=1000?tr(y/1000,y>=10000?0:2)+' Mt':tr(y,y<1?2:(y<10?1:0))+' kt'; }
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,''); }
function V(){ var s=document.querySelector('script[data-v]'); return s?s.getAttribute('data-v'):'1'; }
var DN={};
function cname(iso){ var l=EN()?'en':'es'; try{ if(!DN[l]) DN[l]=new Intl.DisplayNames([l],{type:'region'}); var n=DN[l].of(String(iso).toUpperCase()); if(n) return n; }catch(x){} return String(iso).toUpperCase(); }
function cn(c){ return EN()&&c[1]?c[1]:c[0]; }
function slug(c){ return norm(c[0])+'-'+c[2]; }
function fl(iso){ if(!iso||!D||D.f.indexOf(iso)<0) return ''; return '<img class="nu-fl" src="flags/'+iso+'.png" alt="" loading="lazy" onerror="this.style.display=\'none\'">'; }
function dist(a1,o1,a2,o2){ var p1=a1*RAD,p2=a2*RAD,dp=p2-p1,dl=(o2-o1)*RAD; var h=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2); return 2*RE*Math.asin(Math.min(1,Math.sqrt(h))); }
function dest(lat,lon,brg,dkm){ var d=dkm/RE, b=brg*RAD, p1=lat*RAD, l1=lon*RAD; var p2=Math.asin(Math.sin(p1)*Math.cos(d)+Math.cos(p1)*Math.sin(d)*Math.cos(b)); var l2=l1+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(p1),Math.cos(d)-Math.sin(p1)*Math.sin(p2)); return [p2/RAD,((l2/RAD+540)%360)-180]; }

// ---------- modelo de efectos ----------
// Ajustes de curvas publicados (Glasstone y Dolan 1977; Fletcher et al. 1963; Miller 1963), tal como los recopila NUKEMAP.
function poly(x,a){ var l=0; for(var i=0;i<a.length;i++) l+=a[i]*Math.pow(x,i); return l; }
function lg(x,a,b){ var lx=b===Math.E?Math.log(x):Math.log10(x); return Math.pow(b===Math.E?Math.E:10,poly(lx,a)); }
var EQ108=[-0.0193419,-0.4804553,-0.0055685,0.0002013];
var BQ={th1:[1.93566176470914,0.325315457507999,-0.113516274769641,0.0300971575115961,-0.00330445814836616,0.000129665656335876],
 th2:[4.0147058823566697,0.37180525416799937,-0.045026131075683193,0.013549565337157871,-0.0016559848551158524,0.000070380159845451207],
 th3:[5.9981617647112317,0.53350791551060528,-0.023435878115600033,0.010395274013807305,-0.0014366360115630195,0.000063930657856814399]};
var OTA_TH={th1:11,th2:10,th3:8}; // OTA (1979), p. 21: 1 Mt, día despejado (visibilidad 16 km)
function thq(y,k){ return Math.log(lg(y,BQ[k],Math.E)); } // cal/cm2 para el 50 % de probabilidad (fig. 12.65)
function thmi(y,k,air){ var f=air?1:0.7;
  if(y<1) return thmi(1,k,air)*Math.pow(y,1/3);
  if(y>20000) return thmi(20000,k,air)*Math.pow(y/20000,0.41);
  return lg(thq(y,k)/(f*y),EQ108,10); }
function rad500mi(y,rem){ var a=0.1237561,a_=0.0143624,b=0.0994027,b_=-0.0000816,c=0.0011878,c_=-0.0000014,d=-0.0002481,d_=0.0054734,ee=0.0000096,e_=-0.0003272,f=-0.1308215,f_=0.0000106,g=0.0009881,g_=-0.0001220,h=-0.0032363,h_=0.0000217,i=0.0000111,i_=-0.0000006;
  var lI=Math.log10(rem),lW=Math.log10(y),I2=lI*lI,I3=I2*lI;
  var D2=a+(b+a_*lI+d_*I2+g_*I3)*lW+(c+b_*lI+e_*I2+h_*I3)*Math.pow(lW,3)+(d+c_*lI+f_*I2+i_*I3)*Math.pow(lW,5)+ee*Math.pow(lW,7)+f*lI+g*I2+h*I3+i*Math.pow(lI,5);
  return Math.pow(10,D2); }
function ctop(y){ var k; if(y<=100) k=9.0355598798544854*Math.pow(y,0.32095070520890268-0.000047081309288753766*y)+0.081777330384279173; else if(y<=4000) k=23.037246630847605*Math.pow(y,0.15119655810555122-4.6347426409373220/y)+1.4709881303279233; else k=6.5357594810058774*Math.exp(663.0/y)*Math.pow(y,0.28416073403767877); return k*1000*FT; }
function cbot(y){ return Math.max(0.3,1000*FT*(171.54976807456771*Math.pow(y/524029.66478808509,0.25445292192920910)*Math.exp(y/524029.66478808509)-0.32665357749287349)); }
function cwid(y){ return 2*2340*Math.pow(y,0.431)*FT; }
function hob(y){ return 0.24*Math.cbrt(y); } // altura de explosión aérea escalada desde Hiroshima (~600 m para 15 kt): aproximación
function eff(y,b){ var F=D.fx, s=Math.cbrt(y/1000), air=b!=='surf', B=air?F.air:F.surf, o={y:y,b:b};
  o.fb=(air?200:290)*Math.pow(y,0.4)*FT;
  o.p20=air&&B.p20?B.p20*s:0; o.p12=B.p12*s; o.p5=B.p5*s; o.p2=B.p2*s; o.p1=B.p1*s;
  ['th1','th2','th3'].forEach(function(k){ o[k]=OTA_TH[k]*thmi(y,k,air)/thmi(1000,k,true); });
  var sl=rad500mi(y,500)*MI; o.h=air?hob(y):0; o.r500=air?(sl>o.h?Math.sqrt(sl*sl-o.h*o.h):0):sl; o.sl=sl;
  o.ct=ctop(y); o.cb=Math.min(cbot(y),o.ct*0.8); o.cw=cwid(y);
  return o; }
var FX=[ // clave, color, nombre ES/EN, descripción ES/EN, fuente
 ['fb','#ffd34d',['Bola de fuego','Fireball'],['Radio máximo de la bola de fuego: lo que hay dentro se vaporiza.','Maximum fireball radius: whatever is inside is vaporised.'],'G&D cap. 2'],
 ['p20','#7d1712',['Onda expansiva 20 psi','Blast 20 psi'],['Arrasa incluso estructuras de hormigón armado.','Even reinforced-concrete structures are levelled.'],'OTA'],
 ['r500','#3fd07a',['Radiación inicial 500 rem','Initial radiation 500 rem'],['Dosis instantánea de 500 rem: sin tratamiento médico, mortal para la mayoría (OTA: 450 rem matarían a la mitad).','Instant dose of 500 rem: without medical care, fatal for most (OTA: 450 rem would kill half).'],'Fletcher / G&D cap. 8'],
 ['p12','#c0301f',['Onda expansiva 12 psi','Blast 12 psi'],['Destrucción casi total; en el modelo OTA muere el 98 %.','Near-total destruction; 98% killed in the OTA model.'],'OTA'],
 ['p5','#f08a24',['Onda expansiva 5 psi','Blast 5 psi'],['Se derrumban las viviendas y los edificios ligeros; OTA: 50 % muertos, 40 % heridos.','Homes and light buildings collapse; OTA: 50% killed, 40% injured.'],'OTA'],
 ['th3','#ffb000',['Quemaduras de 3.er grado','3rd-degree burns'],['Destruyen la piel; personas al descubierto en un día despejado.','Destroy the skin; people in the open on a clear day.'],'OTA + G&D'],
 ['th2','#ffcf5a',['Quemaduras de 2.º grado','2nd-degree burns'],['Ampollas y cicatrices; peligro de infección.','Blisters and scarring; risk of infection.'],'OTA + G&D'],
 ['p2','#c7a27a',['Onda expansiva 2 psi','Blast 2 psi'],['Daños graves en viviendas; heridos por escombros (OTA: 5 % muertos, 45 % heridos).','Severe damage to homes; injuries from debris (OTA: 5% killed, 45% injured).'],'OTA'],
 ['th1','#ffe9a8',['Quemaduras de 1.er grado','1st-degree burns'],['Como una quemadura solar fuerte.','Like a bad sunburn.'],'OTA + G&D'],
 ['p1','#8fb3c9',['Onda expansiva 1 psi','Blast 1 psi'],['Rotura de cristales; heridos por cristales y objetos lanzados (OTA: 25 % heridos).','Windows shattered; injuries from glass and flying objects (OTA: 25% injured).'],'OTA']];
// ---------- población (perfiles GHSL por anillos) ----------
function popR(c,r){ var R=D.R, P=c[6]; if(r<=0) return 0; if(r<=R[0]) return P[0]*(r*r)/(R[0]*R[0]);
  for(var i=1;i<R.length;i++){ if(r<=R[i]){ var a=R[i-1],b=R[i]; return P[i-1]+(P[i]-P[i-1])*(r*r-a*a)/(b*b-a*a); } } return P[P.length-1]; }
function cas(c,o){ if(!c) return null; var ed=[0,o.p12,o.p5,o.p2,o.p1], F=D.fx.fr, dead=0, inj=0;
  for(var i=0;i<4;i++){ var pop=popR(c,ed[i+1])-popR(c,ed[i]); dead+=pop*F[i][0]/100; inj+=pop*F[i][1]/100; }
  return {dead:dead,inj:inj,p1:popR(c,o.p1),p5:popR(c,o.p5)}; }
// ---------- lluvia radiactiva: Glasstone y Dolan (1977), tabla 9.93 ----------
var T993=[[3000,0.95,0.45,0.0076,0.86,0.026,0.58],[1000,1.8,0.45,0.036,0.76,0.060,0.57],[300,4.5,0.45,0.13,0.66,0.20,0.48],[100,8.9,0.45,0.38,0.60,0.39,0.42],[30,16,0.45,0.76,0.56,0.53,0.41],[10,24,0.45,1.4,0.53,0.68,0.41],[3,30,0.45,2.2,0.50,0.89,0.41],[1,40,0.45,3.3,0.48,1.5,0.41]];
var FOL=[[1000,'#5b1a7a'],[100,'#8e3fb0'],[10,'#b77ccc'],[1,'#dcb8e8']];
function ffrac(y){ return y<=25?1:0.5; } // aproximación: fisión pura hasta 25 kt; 50 % por encima (ejemplo de Glasstone § 9.94)
function foDims(y,rate,vk){ // rate = tasa de dosis mostrada (rad/h a H+1)
  var tr=rate/ffrac(y), W=y, rows=T993.map(function(r){ return [r[0],r[1]*Math.pow(W,r[2])*MI,r[3]*Math.pow(W,r[4])*MI,r[5]*Math.pow(W,r[6])*MI]; });
  var i=0; while(i<rows.length-2&&tr<rows[i+1][0]) i++;
  var a=rows[i], b=rows[i+1], t=(Math.log(tr)-Math.log(a[0]))/(Math.log(b[0])-Math.log(a[0])); t=Math.max(-0.5,Math.min(1.5,t));
  function L(k){ return Math.exp(Math.log(a[k])+(Math.log(b[k])-Math.log(a[k]))*t); }
  var v=vk/MI, Fw=v>15?1+(v-15)/60:1+(v-15)/30;
  return {dd:L(1)*Fw, mw:L(2), gz:L(3)}; }
function foPolar(dm){ var out=[], a=dm.dd/2, bb=Math.max(dm.mw/2,1e-6), rc=dm.gz/2; for(var k=0;k<180;k++){ var th=(k*2-180)*RAD, c=Math.cos(th), s=Math.sin(th), re=0; if(c>0) re=(2*c/a)/(c*c/(a*a)+s*s/(bb*bb)); out.push(Math.max(rc,re)); } return out; }
function foPoly(lat,lon,dm,wd){ var P=foPolar(dm); return P.map(function(r,k){ return dest(lat,lon,wd+(k*2-180),r); }); }
function foPop(c,dm){ if(!c) return null; var P=foPolar(dm), mx=0; P.forEach(function(r){ if(r>mx) mx=r; }); var tot=0, n=60, prev=0;
  for(var j=1;j<=n;j++){ var r=mx*j/n, rm=mx*(j-0.5)/n, cnt=0; P.forEach(function(x){ if(x>=rm) cnt++; }); var pr=popR(c,r); tot+=(pr-prev)*cnt/P.length; prev=pr; } return tot; }
// ---------- estado y URL ----------
function cityBy(q){ if(!q) return -1; if(IDX[q]!=null) return IDX[q]; var n=norm(q), best=-1; for(var i=0;i<D.c.length;i++){ var c=D.c[i]; if(norm(c[0])===n||norm(c[1]||'')===n){ if(best<0||(c[2]==='es'&&D.c[best][2]!=='es')||(c[5]&&!D.c[best][5]&&D.c[best][2]!=='es')) best=i; } } return best; }
function readQ(X){ var q=X.qs(), s={c:IDX['madrid-es'],ll:null,y:100,yid:'w76',b:'air',fo:1,wd:90,ws:24,y2:0,dk:0};
  if(q.c){ var i=cityBy(q.c); if(i>=0) s.c=i; }
  if(q.ll){ var m=q.ll.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); if(m&&Math.abs(+m[1])<=85&&Math.abs(+m[2])<=180){ s.ll=[+m[1],+m[2]]; s.c=null; } }
  if(q.y&&+q.y>=0.1&&+q.y<=50000){ s.y=+q.y; s.yid=null; D.fx.y.forEach(function(p){ if(p[3]===s.y) s.yid=p[0]; }); }
  if(q.b==='surf') s.b='surf'; if(q.fo==='0') s.fo=0; if(q.wd&&isFinite(+q.wd)) s.wd=((+q.wd%360)+360)%360; if(q.ws&&+q.ws>=13&&+q.ws<=72) s.ws=+q.ws;
  if(q.y2&&+q.y2>=0.1&&+q.y2<=50000) s.y2=+q.y2; if(q.dk==='1') s.dk=1;
  return s; }
function qstr(){ var h='#/guerra-nuclear?'+(S.c!=null?'c='+slug(D.c[S.c]):'ll='+S.ll[0].toFixed(4)+','+S.ll[1].toFixed(4))+'&y='+S.y+'&b='+S.b; if(S.b==='surf') h+='&fo='+S.fo+'&wd='+S.wd+'&ws='+S.ws; if(S.y2) h+='&y2='+S.y2; return h; }
function writeQ(){ var h=qstr(); if(location.hash!==h){ try{ history.replaceState(null,'',h); }catch(x){} } }
function gz(){ if(S.c!=null){ var c=D.c[S.c]; return {lat:c[3],lon:c[4],c:c,n:cn(c)}; } return {lat:S.ll[0],lon:S.ll[1],c:null,n:(EN()?'Chosen point':'Punto elegido')+' ('+dec(Math.abs(S.ll[0]),2)+'°'+(S.ll[0]>=0?'N':'S')+' '+dec(Math.abs(S.ll[1]),2)+'°'+(S.ll[1]>=0?'E':(EN()?'W':'O'))+')'}; }
// ---------- CSS ----------
function css(){ if(document.getElementById('nu-css')) return; var s=document.createElement('style'); s.id='nu-css'; s.textContent=
 '.nu h1{margin-bottom:2px}.nu .subt{color:var(--mu);font-size:14px;margin:0 0 10px}'+
 '.nu .ctx{border:1px solid #3a4a5a;background:rgba(79,179,224,.06);border-radius:var(--r);padding:9px 11px;font-size:13px;color:#cfd8de;margin:8px 0 12px;line-height:1.45}.nu .ctx b{color:#9fd3ee}.nu .ctx a{color:var(--ac2)}'+
 '.nu .note{border:1px solid #5a4a22;background:rgba(232,181,74,.07);color:#e6dcc4;border-radius:var(--r);padding:9px 11px;font-size:13px;margin:10px 0;line-height:1.45}.nu .note b{color:#f0c96a}'+
 '.nu .lbl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);margin:12px 0 6px;display:flex;align-items:center;gap:8px}'+
 '.nu .citb{display:flex;align-items:center;gap:8px;width:100%;min-height:46px;border:1px solid var(--line);background:var(--s1);color:var(--tx);border-radius:var(--r);padding:6px 12px;font:inherit;font-size:15.5px;font-weight:650;cursor:pointer;text-align:left}'+
 '.nu .citb span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nu .citb small{font-weight:400;color:var(--mu);font-size:12.5px}'+
 '.nu .pick{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:8px;margin:6px 0}.nu .pick[hidden]{display:none}'+
 '.nu .pick input{width:100%;height:42px;box-sizing:border-box;border:1px solid var(--line);background:var(--bg);color:var(--tx);border-radius:8px;padding:0 10px;font:inherit;font-size:16px}'+
 '.nu .plist{max-height:min(46vh,380px);overflow:auto;-webkit-overflow-scrolling:touch;margin-top:6px}'+
 '.nu .pgh{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);padding:10px 4px 4px}'+
 '.nu .pr{display:flex;align-items:center;gap:8px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--line);color:var(--tx);padding:9px 4px;font:inherit;font-size:14.5px;cursor:pointer}.nu .pr:hover{background:var(--s2)}.nu .pr small{color:var(--mu);font-size:12px;margin-left:auto;white-space:nowrap}'+
 '.nu .nu-fl{width:20px;height:14px;object-fit:cover;border-radius:2px;flex:0 0 20px;vertical-align:-2px;margin-right:4px;box-shadow:0 0 0 1px rgba(255,255,255,.15)}'+
 '.nu .chips{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 0 6px;scrollbar-width:thin}.nu .chips .chip{flex:0 0 auto;white-space:nowrap}'+
 '.nu .yv{font-size:22px;font-weight:750;color:#ffb38a;margin-right:6px}.nu .yn{color:var(--mu);font-size:13px}'+
 '.nu input[type=range]{width:100%;height:32px;padding:0;margin:4px 0;background:transparent;border:0;accent-color:#e8452c}'+
 '.nu .row2{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'+
 '.nu .det{margin-left:auto;min-height:44px;font-size:15px;font-weight:700;border-color:#a2402f!important;background:#3a1612!important;color:#ffd9cf!important;padding:0 18px}'+
 '.nu .mapw{position:relative;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#0e1113;margin:10px 0 0}'+
 '.nu #nu-map{height:62vh;min-height:340px;max-height:640px;background:#dfe3e6}.nu .dk #nu-map{background:#0e1113}'+
 '.nu .dk .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.82) contrast(.9) saturate(.55)}'+
 '.nu .leaflet-container{font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}'+
 '.nu .leaflet-control-attribution{background:rgba(11,12,13,.8)!important;color:#c3c7cb!important;font-size:10.5px}.nu .leaflet-control-attribution a{color:#b3bd8c!important}'+
 '.nu .leaflet-bar a{background:#15181a!important;color:#e9e9e6!important;border-bottom-color:#2a2e32!important}.nu .leaflet-bar{border:1px solid #2a2e32!important}'+
 '.nu .mtools{position:absolute;right:10px;bottom:24px;z-index:800;display:flex;flex-direction:column;gap:6px}.nu .mtools button{width:40px;height:40px;border-radius:8px;border:1px solid #2a2e32;background:rgba(21,24,26,.92);color:#e9e9e6;font-size:16px;cursor:pointer}'+
 '.nu .flash{position:absolute;inset:0;z-index:900;pointer-events:none;background:radial-gradient(circle at 50% 50%,#fff 0,#fff7d6 30%,rgba(255,200,120,.6) 60%,rgba(255,160,80,0) 100%);opacity:0}'+
 '.nu .flash.on{animation:nuflash 1.1s ease-out forwards}@keyframes nuflash{0%{opacity:1}15%{opacity:1}100%{opacity:0}}'+
 '.nu .gzlab{background:rgba(17,19,21,.88);color:#fff;border:1px solid #b3261e;border-radius:999px;padding:2px 8px;font-size:12px;font-weight:650;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.4)}'+
 '.nu .grid{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}@media(min-width:1000px){.nu .grid{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);align-items:start}.nu .side{position:sticky;top:74px}}'+
 '.nu .res{border:1px solid #6a2a24;border-left:4px solid #b3261e;border-radius:var(--r);background:var(--s1);padding:11px 12px;margin:10px 0}'+
 '.nu .res h3{margin:0 0 6px;font-size:16px}.nu .rcols{display:grid;grid-template-columns:minmax(0,1fr);gap:10px}.nu .rcols.two{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}'+
 '.nu .rc .k{font-size:12px;color:var(--mu)}.nu .rc .v{font-size:19px;font-weight:750;line-height:1.2;margin:1px 0 6px}.nu .rc .v.d{color:#ff8a7a}.nu .rc .v.i{color:#ffcf7a}.nu .rc .hd{font-size:12.5px;font-weight:700;color:#ffb38a;margin-bottom:4px;border-bottom:1px solid var(--line);padding-bottom:3px}'+
 '.nu .rc .hd.b{color:#9fd3ee}.nu .res .sm{font-size:12px;color:var(--mu);margin-top:4px;line-height:1.4}'+
 '.nu table{width:100%;border-collapse:collapse;font-size:13.5px}.nu td,.nu th{padding:7px 4px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}'+
 '.nu th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);font-weight:600}.nu td.n{white-space:nowrap;text-align:right;color:var(--tx)}.nu td.n small{display:block;color:var(--dim);font-size:11.5px}'+
 '.nu .dot{display:inline-block;width:11px;height:11px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid rgba(255,255,255,.35)}'+
 '.nu .ds{color:var(--mu);font-size:12.5px}.nu .stag{display:inline-block;font-size:10.5px;border:1px solid var(--line);border-radius:4px;padding:0 5px;color:var(--dim);margin-left:4px;white-space:nowrap}'+
 '.nu .box{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px 12px;margin:10px 0}'+
 '.nu .box h3{margin:0 0 6px;font-size:15.5px}.nu .compass{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:6px 0}.nu .compass .chip{justify-content:center;text-align:center}'+
 '.nu .tog{display:flex;align-items:center;gap:8px;font-size:14px;cursor:pointer;min-height:40px}.nu .tog input{width:20px;height:20px;accent-color:#a64dbd}'+
 '.nu .cloud svg{width:100%;height:auto;display:block}'+
 '.nu details.mt{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:0 12px;margin:10px 0}.nu details.mt summary{cursor:pointer;padding:12px 0;font-weight:600}'+
 '.nu details.mt p,.nu details.mt li{font-size:13.5px;color:#cfd1cd;line-height:1.5}.nu details.mt a{color:var(--ac2);overflow-wrap:anywhere}.nu .srcl{padding-left:18px;margin:6px 0 12px}.nu .srcl li{margin:4px 0}'+
 '.nu .acts{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.nu .acts .btn{min-height:42px;font-size:14px}'+
 '.nu .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#1d2124;border:1px solid var(--line);color:var(--tx);border-radius:999px;padding:9px 16px;font-size:13.5px;z-index:2000;box-shadow:0 6px 20px rgba(0,0,0,.5);max-width:92vw}';
 document.head.appendChild(s); }
function toast(t){ var o=document.querySelector('.nu-toast'); if(o) o.remove(); var d=document.createElement('div'); d.className='toast nu-toast'; d.textContent=t; (document.querySelector('.nu')||document.body).appendChild(d); setTimeout(function(){ d.remove(); },2600); }
// ---------- carga ----------
function load(){ if(LD) return LD; LD=window.MAT_GET('nuclear.json.gz').then(function(z){ D=z; D.c.forEach(function(c,i){ IDX[slug(c)]=i; }); return D; }); LD.catch(function(){ LD=null; }); return LD; }
function leaflet(){ if(window.L&&window.L.map) return Promise.resolve(window.L); if(LP) return LP;
  LP=new Promise(function(res,rej){ if(!document.querySelector('link[href^="leaflet.css"]')){ var l=document.createElement('link'); l.rel='stylesheet'; l.href='leaflet.css?v='+V(); document.head.appendChild(l); }
    var s=document.createElement('script'); s.src='leaflet.js?v='+V(); s.onload=function(){ if(window.L&&window.L.map) res(window.L); else { LP=null; rej(new Error('leaflet')); } }; s.onerror=function(){ LP=null; rej(new Error('leaflet')); }; document.head.appendChild(s); }); return LP; }
// ---------- vista ----------
var QUICK=['madrid-es','barcelona-es','sevilla-es','valencia-es','kiev-ua','moscu-ru','washingtondc-us','londres-gb','paris-fr','berlin-de','pekin-cn','teheran-ir','pionyang-kp','telaviv-il','nuevayork-us','tokio-jp'];
function render(app,X){
  var h='<div class="nu" data-noi18n>'+X.crumbs([[T2('Inicio','Home'),'#/'],[T2('Guerra nuclear','Nuclear war')]])+
  '<h1>💥 '+T2('Guerra nuclear','Nuclear war')+'</h1><p class="subt">'+T2('Simulador de efectos de una detonación nuclear — divulgativo','Simulator of the effects of a nuclear detonation — educational')+'</p>'+
  '<div class="ctx"><b>'+T2('Para qué sirve esto:','What this is for:')+'</b> '+T2('divulgación. Muestra, con datos públicos y modelos clásicos (Congreso de EE. UU., Glasstone y Dolan), la escala de los efectos de una sola detonación sobre una ciudad real. No es una predicción ni representa ningún plan: los efectos reales dependerían de muchísimos factores. Ver <a href="javascript:void 0" data-how="1">fuentes y método</a>.','education. Using public data and classic models (U.S. Congress, Glasstone & Dolan), it shows the scale of the effects of a single detonation over a real city. It is not a prediction and does not represent any plan: real effects would depend on a great many factors. See <a href="javascript:void 0" data-how="1">sources and method</a>.')+'</div>'+
  '<div class="grid"><div>'+
  '<div class="lbl">'+T2('1 · Ciudad (punto cero en el centro)','1 · City (ground zero at the centre)')+'</div>'+
  '<button type="button" class="citb" id="nu-cb" aria-expanded="false"></button><div class="pick" id="nu-pick" hidden><input type="search" id="nu-q" placeholder="'+T2('Busca una ciudad o un país…','Search a city or a country…')+'" autocomplete="off" aria-label="'+T2('Buscar ciudad','Search city')+'"><div class="plist" id="nu-pl"></div></div>'+
  '<div class="chips" id="nu-qc">'+QUICK.filter(function(k){ return IDX[k]!=null; }).map(function(k){ var c=D.c[IDX[k]]; return '<button type="button" class="chip" data-ci="'+IDX[k]+'">'+e(cn(c))+'</button>'; }).join('')+'</div>'+
  '<div class="lbl">'+T2('2 · Potencia','2 · Yield')+'</div>'+
  '<div><span class="yv" id="nu-yv"></span><span class="yn" id="nu-yn"></span></div>'+
  '<input type="range" id="nu-ys" min="0" max="1000" step="1" aria-label="'+T2('Potencia','Yield')+'">'+
  '<div class="chips" id="nu-yc">'+D.fx.y.map(function(y){ return '<button type="button" class="chip" data-y="'+y[3]+'" data-yid="'+y[0]+'">'+e(EN()?y[2]:y[1])+' · '+ykt(y[3])+'</button>'; }).join('')+'</div>'+
  '<div class="lbl">'+T2('3 · Tipo de explosión','3 · Type of burst')+'</div>'+
  '<div class="row2"><button type="button" class="chip" data-b="air">'+T2('Aérea','Air burst')+'</button><button type="button" class="chip" data-b="surf">'+T2('En superficie','Surface burst')+'</button>'+
  '<button type="button" class="btn det" id="nu-det">💥 '+T2('Detonar','Detonate')+'</button></div>'+
  '<div id="nu-fo"></div>'+
  '<div class="mapw" id="nu-mw"><div id="nu-map" role="application" aria-label="'+T2('Mapa de efectos','Effects map')+'"></div><div class="flash" id="nu-fl"></div>'+
  '<div class="mtools"><button type="button" id="nu-fit" aria-label="'+T2('Encuadrar','Fit')+'" title="'+T2('Encuadrar','Fit')+'">⤢</button><button type="button" id="nu-dk" aria-label="'+T2('Mapa claro u oscuro','Light or dark map')+'" title="'+T2('Mapa claro / oscuro','Light / dark map')+'">🌓</button></div></div>'+
  '<p class="ds" style="margin:6px 0 0">'+T2('Pellizca o usa la rueda para acercarte a tu barrio; arrastra para moverte. Toca el mapa y pulsa «Detonar aquí» para cambiar el punto cero.','Pinch or scroll to zoom into your neighbourhood; drag to pan. Tap the map and press “Detonate here” to move ground zero.')+'</p>'+
  '</div><div class="side">'+
  '<div id="nu-res"></div>'+
  '<div class="box"><label class="tog"><input type="checkbox" id="nu-cmp"> '+T2('Comparar con otra potencia','Compare with another yield')+'</label><div id="nu-cmpb"></div></div>'+
  '<div class="acts"><button type="button" class="btn" id="nu-sh">🔗 '+T2('Compartir','Share')+'</button><a class="btn" href="#/alcance">🎯 '+T2('Alcance de misiles','Missile ranges')+'</a></div>'+
  '<div id="nu-tab"></div><div class="box cloud" id="nu-cl"></div>'+
  '</div></div>'+
  '<div class="note">'+T2('<b>Simulación divulgativa y muy aproximada.</b> Los efectos reales dependerían de la hora (la población de día y de noche es distinta), el tiempo, el relieve, los edificios, los refugios y la altura exacta de la explosión. Las cifras de víctimas no incluyen la lluvia radiactiva, las tormentas de fuego, el colapso de los servicios sanitarios ni los efectos a largo plazo.','<b>Educational, very rough simulation.</b> Real effects would depend on the time of day (daytime and night-time population differ), weather, terrain, buildings, shelters and the exact height of burst. Casualty figures exclude fallout, firestorms, the collapse of health services and long-term effects.')+'</div>'+
  '<div id="nu-how"></div></div>';
  X.set(h,T2('Guerra nuclear: simulador de efectos','Nuclear war: effects simulator'));
  var R0=app.querySelector('.nu');
  // ciudad
  var cb=R0.querySelector('#nu-cb'), pk=R0.querySelector('#nu-pick'), qi=R0.querySelector('#nu-q');
  cb.addEventListener('click',function(){ var o=pk.hidden; pk.hidden=!o; cb.setAttribute('aria-expanded',String(o)); if(o){ qi.value=''; plist(''); setTimeout(function(){ try{ qi.focus({preventScroll:true}); }catch(x){} },30); } });
  qi.addEventListener('input',function(){ plist(qi.value); });
  R0.querySelector('#nu-pl').addEventListener('click',function(ev){ var b=ev.target.closest('[data-ci]'); if(!b) return; pickCity(+b.getAttribute('data-ci')); pk.hidden=true; cb.setAttribute('aria-expanded','false'); });
  R0.querySelector('#nu-qc').addEventListener('click',function(ev){ var b=ev.target.closest('[data-ci]'); if(b) pickCity(+b.getAttribute('data-ci')); });
  // potencia
  var ys=R0.querySelector('#nu-ys'); ys.value=y2s(S.y);
  ys.addEventListener('input',function(){ S.y=s2y(+ys.value); S.yid=null; upd(false); });
  ys.addEventListener('change',function(){ upd(true); });
  R0.querySelector('#nu-yc').addEventListener('click',function(ev){ var b=ev.target.closest('[data-y]'); if(!b) return; S.y=+b.getAttribute('data-y'); S.yid=b.getAttribute('data-yid'); ys.value=y2s(S.y); upd(true); });
  [].forEach.call(R0.querySelectorAll('[data-b]'),function(b){ b.addEventListener('click',function(){ S.b=b.getAttribute('data-b'); upd(true); }); });
  R0.querySelector('#nu-det').addEventListener('click',function(){ upd(true); try{ R0.querySelector('#nu-mw').scrollIntoView({behavior:'smooth',block:'center'}); }catch(x){} });
  var ck=R0.querySelector('#nu-cmp'); ck.checked=!!S.y2; ck.addEventListener('change',function(){ S.y2=ck.checked?(S.y>=1000?S.y/10:Math.min(50000,S.y*10)):0; S.y2=snapY(S.y2); upd(true); });
  R0.querySelector('#nu-cmpb').addEventListener('click',function(ev){ var b=ev.target.closest('[data-y2]'); if(!b) return; S.y2=+b.getAttribute('data-y2'); upd(true); });
  R0.querySelector('#nu-fo').addEventListener('click',function(ev){ var b=ev.target.closest('[data-wd]'); if(b){ S.wd=+b.getAttribute('data-wd'); upd(true); } });
  R0.querySelector('#nu-fo').addEventListener('change',function(ev){ if(ev.target.id==='nu-fot'){ S.fo=ev.target.checked?1:0; upd(true); } });
  R0.querySelector('#nu-fo').addEventListener('input',function(ev){ if(ev.target.id==='nu-ws'){ S.ws=+ev.target.value; upd(false); } });
  R0.querySelector('#nu-sh').addEventListener('click',share);
  R0.querySelector('#nu-fit').addEventListener('click',function(){ fit(); });
  R0.querySelector('#nu-dk').addEventListener('click',function(){ S.dk=S.dk?0:1; R0.querySelector('#nu-mw').classList.toggle('dk',!!S.dk); });
  R0.querySelector('#nu-mw').classList.toggle('dk',!!S.dk);
  R0.querySelector('[data-how]').addEventListener('click',function(ev){ ev.preventDefault(); var t=document.getElementById('nu-how'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); });
  how();
  upd(false);
  leaflet().then(function(){ if(!document.getElementById('nu-map')) return; mapInit(); draw(true); }).catch(function(){ var m=document.getElementById('nu-map'); if(m) m.innerHTML='<p class="sub" style="padding:20px">'+T2('No se pudo cargar el mapa.','Could not load the map.')+'</p>'; });
}
function snapY(y){ var best=y,bd=1e9; D.fx.y.forEach(function(p){ var d=Math.abs(Math.log(p[3]/y)); if(d<bd){ bd=d; best=p[3]; } }); return best; }
function y2s(y){ return Math.round((Math.log10(y)+1)/(Math.log10(50000)+1)*1000); }
function s2y(s){ var v=Math.pow(10,s/1000*(Math.log10(50000)+1)-1); return v<1?Math.round(v*100)/100:(v<10?Math.round(v*10)/10:(v<1000?Math.round(v):(v<10000?Math.round(v/10)*10:Math.round(v/100)*100))); }
function plist(q){ var el=document.getElementById('nu-pl'); if(!el) return; var n=norm(q), L=[];
  D.c.forEach(function(c,i){ if(!n||norm(c[0]).indexOf(n)>=0||norm(c[1]||'').indexOf(n)>=0||norm(cname(c[2])).indexOf(n)>=0) L.push(i); });
  function srt(a,b){ var A=D.c[a],B=D.c[b]; return cn(A).localeCompare(cn(B)); }
  var es=L.filter(function(i){ return D.c[i][2]==='es'; }).sort(srt), cap=L.filter(function(i){ return D.c[i][2]!=='es'&&D.c[i][5]; }).sort(srt), ot=L.filter(function(i){ return D.c[i][2]!=='es'&&!D.c[i][5]; }).sort(srt);
  function row(i){ var c=D.c[i]; return '<button type="button" class="pr" data-ci="'+i+'">'+fl(c[2])+'<span>'+e(cn(c))+'</span><small>'+e(cname(c[2]))+'</small></button>'; }
  var h=''; if(es.length) h+='<div class="pgh">🇪🇸 '+T2('España','Spain')+' ('+es.length+')</div>'+es.map(row).join('');
  if(cap.length) h+='<div class="pgh">🏛 '+T2('Capitales del mundo','World capitals')+' ('+cap.length+')</div>'+cap.map(row).join('');
  if(ot.length) h+='<div class="pgh">🌍 '+T2('Otras ciudades','Other cities')+' ('+ot.length+')</div>'+ot.map(row).join('');
  el.innerHTML=h||'<p class="ds" style="padding:8px">'+T2('Sin resultados.','No results.')+'</p>'; }
function pickCity(i){ S.c=i; S.ll=null; upd(true); }
// ---------- cálculo + interfaz ----------
var CUR=null;
function upd(anim){ var R0=document.querySelector('.nu'); if(!R0) return; var g=gz();
  var c=g.c; R0.querySelector('#nu-cb').innerHTML='📍 '+(c?fl(c[2]):'')+'<span>'+e(g.n)+'</span><small>'+(c?e(cname(c[2])):'')+' ▾</small>';
  [].forEach.call(R0.querySelectorAll('#nu-qc [data-ci]'),function(b){ b.setAttribute('aria-pressed',String(+b.getAttribute('data-ci')===S.c)); });
  R0.querySelector('#nu-yv').textContent=ykt(S.y); var yp=null; D.fx.y.forEach(function(y){ if(y[0]===S.yid) yp=y; });
  R0.querySelector('#nu-yn').textContent=yp?(EN()?yp[2]:yp[1]):(S.y<15?T2('menor que Hiroshima','smaller than Hiroshima'):'≈ '+dec(S.y/15,S.y/15<10?1:0)+' × Hiroshima');
  [].forEach.call(R0.querySelectorAll('#nu-yc [data-yid]'),function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-yid')===S.yid)); });
  [].forEach.call(R0.querySelectorAll('[data-b]'),function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-b')===S.b)); });
  var A=eff(S.y,S.b), B=S.y2?eff(S.y2,S.b):null; CUR={A:A,B:B,g:g};
  foPanel(); cmpPanel(); results(); table(); cloud(); writeQ(); draw(anim); }
var WD=[[0,'N','N'],[45,'NE','NE'],[90,'E','E'],[135,'SE','SE'],[180,'S','S'],[225,'SO','SW'],[270,'O','W'],[315,'NO','NW']];
function foPanel(){ var el=document.getElementById('nu-fo'); if(!el) return; var h='';
  if(S.b==='surf'){ h='<div class="box"><h3>☢️ '+T2('Lluvia radiactiva (modelo simplificado)','Radioactive fallout (simplified model)')+'</h3>'+
   '<label class="tog"><input type="checkbox" id="nu-fot"'+(S.fo?' checked':'')+'> '+T2('Mostrar la nube de lluvia radiactiva','Show the fallout plume')+'</label>';
   if(S.fo){ h+='<div class="ds">'+T2('El viento sopla hacia:','The wind blows towards:')+'</div><div class="compass">'+WD.map(function(w){ return '<button type="button" class="chip" data-wd="'+w[0]+'" aria-pressed="'+(S.wd===w[0])+'">'+(EN()?w[2]:w[1])+'</button>'; }).join('')+'</div>'+
    '<div class="ds">'+T2('Velocidad del viento efectivo: ','Effective wind speed: ')+'<b id="nu-wsv">'+S.ws+' km/h</b></div><input type="range" id="nu-ws" min="13" max="72" step="1" value="'+S.ws+'" aria-label="'+T2('Velocidad del viento','Wind speed')+'">'+
    '<div class="ds">'+T2('Contornos idealizados de Glasstone y Dolan (1977, tabla 9.93) para la tasa de dosis a la hora 1, terreno liso y personas al aire libre. El viento real cambia con la altura y el tiempo: es solo una aproximación.','Idealised contours from Glasstone & Dolan (1977, table 9.93) for the dose rate at hour 1, smooth terrain and people outdoors. Real winds change with height and time: this is only an approximation.')+'</div>'; }
   h+='</div>'; }
  else h='<p class="ds" style="margin:8px 0 0">☢️ '+T2('En una explosión aérea la bola de fuego no toca el suelo y apenas hay lluvia radiactiva local (Glasstone y Dolan, § 9.48). Elige «En superficie» para ver la nube radiactiva.','In an air burst the fireball does not touch the ground and there is little local fallout (Glasstone & Dolan, § 9.48). Choose “Surface burst” to see the fallout plume.')+'</p>';
  el.innerHTML=h; }
function cmpPanel(){ var el=document.getElementById('nu-cmpb'); if(!el) return; if(!S.y2){ el.innerHTML=''; return; }
  el.innerHTML='<div class="ds" style="margin:4px 0">'+T2('Segunda potencia (anillos discontinuos):','Second yield (dashed rings):')+'</div><div class="chips">'+D.fx.y.map(function(y){ return '<button type="button" class="chip" data-y2="'+y[3]+'" aria-pressed="'+(S.y2===y[3])+'">'+e(EN()?y[2]:y[1])+' · '+ykt(y[3])+'</button>'; }).join('')+'</div>'; }
function results(){ var el=document.getElementById('nu-res'); if(!el) return; var g=CUR.g, c=g.c;
  function col(o,lab,cls){ var cs=cas(c,o), h='<div class="rc">'+(lab?'<div class="hd'+(cls||'')+'">'+lab+'</div>':'');
    if(cs){ h+='<div class="k">'+T2('Muertos estimados','Estimated deaths')+'</div><div class="v d">'+people(cs.dead*0.7)+' – '+people(cs.dead*1.3)+'</div>'+
      '<div class="k">'+T2('Heridos estimados','Estimated injured')+'</div><div class="v i">'+people(cs.inj*0.7)+' – '+people(cs.inj*1.3)+'</div>'+
      '<div class="k">'+T2('Personas dentro del anillo de 1 psi','People inside the 1 psi ring')+'</div><div class="v" style="font-size:16px">'+people(cs.p1)+'</div>';
      if(o.b==='surf'&&S.fo){ var fp=foPop(c,foDims(o.y,100,S.ws)); h+='<div class="k">'+T2('Personas bajo la lluvia radiactiva ≥100 rad/h','People under fallout ≥100 rad/h')+'</div><div class="v" style="font-size:16px;color:#d6a6ec">≈ '+people(fp)+'</div>'; } }
    return h+'</div>'; }
  var h='<div class="res"><h3>💥 '+e(ykt(S.y))+(S.y2?' / '+e(ykt(S.y2)):'')+' · '+e(g.n)+' · '+(S.b==='surf'?T2('en superficie','surface'):T2('aérea','air burst'))+'</h3>';
  if(c){ h+='<div class="rcols'+(CUR.B?' two':'')+'">'+col(CUR.A,CUR.B?ykt(S.y):'')+(CUR.B?col(CUR.B,ykt(S.y2)+' - - -',' b'):'')+'</div>'+
    '<div class="sm">'+T2('Intervalo = resultado del modelo de la OTA (1979) ±30 %. Población residente estimada para 2025 en cada anillo (GHSL, Comisión Europea), centrada en '+e(cn(c))+'. No incluye la lluvia radiactiva ni los incendios.','Range = OTA (1979) model result ±30%. Estimated 2025 resident population in each ring (GHSL, European Commission), centred on '+e(cn(c))+'. Excludes fallout and fires.')+'</div>'; }
  else h+='<p class="ds">'+T2('Para un punto elegido en el mapa no hay estimación de víctimas: elige una de las 442 ciudades con datos de población.','There is no casualty estimate for a point chosen on the map: pick one of the 442 cities with population data.')+'</p>';
  el.innerHTML=h+'</div>'; }
function table(){ var el=document.getElementById('nu-tab'); if(!el) return; var A=CUR.A, B=CUR.B;
  var h='<table><thead><tr><th>'+T2('Efecto','Effect')+'</th><th style="text-align:right">'+(B?ykt(S.y):T2('Radio','Radius'))+'</th>'+(B?'<th style="text-align:right">'+ykt(S.y2)+'</th>':'')+'</tr></thead><tbody>';
  FX.forEach(function(f){ var k=f[0], ra=A[k]||0, rb=B?(B[k]||0):0; if(!ra&&!rb&&k==='p20') return;
    h+='<tr><td><span class="dot" style="background:'+f[1]+'"></span><b>'+e(EN()?f[2][1]:f[2][0])+'</b><span class="stag">'+e(f[4])+'</span><br><span class="ds">'+e(EN()?f[3][1]:f[3][0])+(k==='r500'&&A.b!=='surf'&&!ra?' '+T2('(con esta potencia, a esa dosis no llega al suelo)','(at this yield the dose does not reach the ground)'):'')+'</span></td>'+
     '<td class="n">'+kmf(ra)+(ra?'<small>'+areaS(ra)+'</small>':'')+'</td>'+(B?'<td class="n">'+kmf(rb)+(rb?'<small>'+areaS(rb)+'</small>':'')+'</td>':'')+'</tr>'; });
  if(S.b==='surf'&&S.fo){ FOL.forEach(function(f){ var da=foDims(S.y,f[0],S.ws), db=B?foDims(S.y2,f[0],S.ws):null;
    h+='<tr><td><span class="dot" style="background:'+f[1]+'"></span><b>'+T2('Lluvia radiactiva ','Fallout ')+nf(f[0])+' rad/h</b><span class="stag">G&amp;D 9.93</span><br><span class="ds">'+foTxt(f[0])+'</span></td><td class="n">'+kmf(da.dd)+'<small>'+T2('a favor del viento','downwind')+'</small></td>'+(B?'<td class="n">'+kmf(db.dd)+'</td>':'')+'</tr>'; }); }
  el.innerHTML=h+'</tbody></table><p class="ds" style="margin-top:6px">'+T2('Radios desde el punto cero. Fuentes de cada fila en «Cómo se calcula».','Radii from ground zero. Sources for each row in “How it is calculated”.')+'</p>'; }
function areaS(r){ var a=PI*r*r; return dec(a,a<10?1:0)+' km²'; }
function foTxt(r){ var day=r*2.35;
  if(r>=1000) return T2('Al aire libre, unos '+nf(day)+' rad en las primeras 24 h: muy por encima de los 450 rem que la OTA estima mortales para la mitad de los expuestos.','Outdoors, about '+nf(day)+' rad in the first 24 h: far above the 450 rem the OTA estimates would kill half of those exposed.');
  if(r>=100) return T2('Al aire libre, unos '+nf(day)+' rad en las primeras 24 h: enfermedad grave por radiación (OTA: 200–450 rem).','Outdoors, about '+nf(day)+' rad in the first 24 h: severe radiation sickness (OTA: 200–450 rem).');
  if(r>=10) return T2('Al aire libre, unos '+nf(day)+' rad en las primeras 24 h: por debajo de los 50–200 rem que causan náuseas según la OTA.','Outdoors, about '+nf(day)+' rad in the first 24 h: below the 50–200 rem that cause nausea according to the OTA.');
  return T2('Al aire libre, unos '+dec(day,1)+' rad en las primeras 24 h; refugiarse en el interior la reduce mucho.','Outdoors, about '+dec(day,1)+' rad in the first 24 h; sheltering indoors reduces it a lot.'); }
function cloud(){ var el=document.getElementById('nu-cl'); if(!el) return; var A=CUR.A, B=CUR.B;
  var top=Math.max(A.ct,B?B.ct:0,12), wmax=Math.max(A.cw,B?B.cw:0), W=340, H=200, pad=28, ky=(H-pad-10)/(top*1.08), kx=Math.min(ky,(W-60)/(wmax*(B?2.3:1.25)));
  function cl(o,cx,col,dash){ var yT=H-pad-o.ct*ky, yB=H-pad-o.cb*ky, hw=o.cw/2*kx, sw=Math.max(3,hw*0.16);
    return '<path d="M'+(cx-sw)+' '+(H-pad)+' L'+(cx-sw*0.8)+' '+yB+' L'+(cx+sw*0.8)+' '+yB+' L'+(cx+sw)+' '+(H-pad)+' Z" fill="'+col+'" fill-opacity=".35"'+(dash?' stroke="'+col+'" stroke-dasharray="4 3"':'')+'/>'+
     '<ellipse cx="'+cx+'" cy="'+((yT+yB)/2)+'" rx="'+hw+'" ry="'+Math.max(4,(yB-yT)/2)+'" fill="'+col+'" fill-opacity=".55" stroke="'+col+'"'+(dash?' stroke-dasharray="4 3"':'')+'/>'; }
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+T2('Altura de la nube en hongo','Mushroom cloud height')+'">';
  [[8.85,T2('Everest 8,8 km','Everest 8.8 km')],[11,T2('Avión comercial ≈11 km','Airliner ≈11 km')]].forEach(function(r){ if(r[0]<top*1.08){ var y=H-pad-r[0]*ky; s+='<line x1="0" x2="'+W+'" y1="'+y+'" y2="'+y+'" stroke="#55606a" stroke-dasharray="3 4"/><text x="4" y="'+(y-3)+'" fill="#8d979f" font-size="10">'+r[1]+'</text>'; } });
  s+='<line x1="0" x2="'+W+'" y1="'+(H-pad)+'" y2="'+(H-pad)+'" stroke="#8d979f"/>';
  s+=cl(A,B?W*0.33:W*0.6,'#e8a46a',false); if(B) s+=cl(B,W*0.72,'#7fc3e6',true);
  s+='<text x="'+(W-4)+'" y="'+(H-10)+'" fill="#8d979f" font-size="10" text-anchor="end">'+T2('esquema; alturas a escala','sketch; heights to scale')+'</text></svg>';
  function tx(o){ return T2('techo ≈ ','top ≈ ')+dec(o.ct,o.ct<10?1:0)+' km · '+T2('base ≈ ','base ≈ ')+dec(o.cb,o.cb<10?1:0)+' km · '+T2('anchura ≈ ','width ≈ ')+dec(o.cw,o.cw<10?1:0)+' km'; }
  el.innerHTML='<h3>🍄 '+T2('Nube en hongo (estabilizada, ~10 min)','Mushroom cloud (stabilised, ~10 min)')+'</h3>'+s+'<div class="ds">'+(B?'<b>'+ykt(S.y)+'</b>: ':'')+tx(A)+(B?'<br><b>'+ykt(S.y2)+'</b>: '+tx(B):'')+'</div><div class="ds" style="font-size:11.5px;margin-top:4px">'+T2('Altura: ajuste a la fig. 9.96 de Glasstone y Dolan; anchura: Miller (1963). Valores medios en latitudes medias.','Height: fit to Glasstone & Dolan fig. 9.96; width: Miller (1963). Mid-latitude averages.')+'</div>'; }
// ---------- mapa ----------
function mapInit(){ var Lf=window.L, el=document.getElementById('nu-map'); if(MAP){ try{ MAP.remove(); }catch(x){} MAP=null; } LY=[];
  var g=CUR.g; MAP=Lf.map(el,{zoomControl:true,minZoom:3,maxZoom:18,zoomSnap:0.25,zoomDelta:0.5,worldCopyJump:true}).setView([g.lat,g.lon],11);
  MAP.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> '+T2('colaboradores','contributors')}).addTo(MAP);
  MAP.createPane('nufo'); MAP.getPane('nufo').style.zIndex=405;
  MAP.createPane('nuri'); MAP.getPane('nuri').style.zIndex=410;
  MAP.on('click',function(ev){ var ll=ev.latlng, d=document.createElement('div'); d.innerHTML='<button type="button" class="btn" style="min-height:36px;font-size:13px">💥 '+T2('Detonar aquí','Detonate here')+'</button>';
    d.firstChild.addEventListener('click',function(){ MAP.closePopup(); var best=-1,bd=1e9; D.c.forEach(function(c,i){ var dd=dist(ll.lat,ll.lng,c[3],c[4]); if(dd<bd){ bd=dd; best=i; } }); if(bd<1.5){ S.c=best; S.ll=null; } else { S.c=null; S.ll=[ll.lat,((ll.lng+540)%360)-180]; } upd(true); });
    Lf.popup({closeButton:true}).setLatLng(ll).setContent(d).openOn(MAP); });
  setTimeout(function(){ try{ MAP.invalidateSize(); }catch(x){} },60); }
function clear(){ if(!MAP) return; LY.forEach(function(l){ try{ MAP.removeLayer(l); }catch(x){} }); LY=[]; if(ANI){ cancelAnimationFrame(ANI); ANI=null; } }
function draw(anim){ if(!MAP||!window.L) return; var Lf=window.L; clear(); var g=CUR.g, A=CUR.A, B=CUR.B, C=[g.lat,g.lon];
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduce) anim=false;
  if(S.b==='surf'&&S.fo){ FOL.slice().reverse().forEach(function(f){ [[A,false],[B,true]].forEach(function(p){ if(!p[0]) return; var dm=foDims(p[0].y,f[0],S.ws); var pg=Lf.polygon(foPoly(g.lat,g.lon,dm,S.wd),{pane:'nufo',color:f[1],weight:p[1]?1.5:1,opacity:.9,fillColor:f[1],fillOpacity:p[1]?0:.28,dashArray:p[1]?'6 5':null,interactive:false}); pg.addTo(MAP); LY.push(pg); }); }); }
  var rings=[];
  function add(o,dash){ FX.slice().reverse().forEach(function(f){ var r=o[f[0]]; if(!r) return; var c=Lf.circle(C,{pane:'nuri',radius:anim?1:r*1000,color:f[1],weight:dash?1.6:2,opacity:.95,fillColor:f[1],fillOpacity:dash?0:(f[0]==='fb'?.45:.12),dashArray:dash?'6 5':(/^th/.test(f[0])?'2 4':null),interactive:true});
    c.bindTooltip((EN()?f[2][1]:f[2][0])+(dash?' ('+ykt(o.y)+')':'')+': '+kmf(r),{sticky:true}); c.addTo(MAP); LY.push(c); rings.push([c,r*1000]); }); }
  add(A,false); if(B) add(B,true);
  var mk=Lf.circleMarker(C,{pane:'nuri',radius:5,color:'#fff',weight:2,fillColor:'#b3261e',fillOpacity:1}).addTo(MAP); mk.bindTooltip(e(g.n),{permanent:true,direction:'top',offset:[0,-8],className:'gzlab'}); LY.push(mk);
  if(anim){ fit(); var fl=document.getElementById('nu-fl'); if(fl){ fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); }
    var t0=performance.now(), dur=1700; rings.sort(function(a,b){ return a[1]-b[1]; });
    (function step(t){ var k=Math.min(1,(t-t0)/dur); rings.forEach(function(p,i){ var st=i/rings.length*0.45, kk=Math.max(0,Math.min(1,(k-st)/(1-st))); var ee=1-Math.pow(1-kk,3); p[0].setRadius(Math.max(1,p[1]*ee)); }); if(k<1) ANI=requestAnimationFrame(step); else ANI=null; })(t0); }
}
function fit(){ if(!MAP||!CUR) return; var A=CUR.A, B=CUR.B, g=CUR.g, r=Math.max(A.p1,A.th1,B?Math.max(B.p1,B.th1):0);
  var Lf=window.L, b=Lf.latLng(g.lat,g.lon).toBounds(r*2000*1.08);
  if(S.b==='surf'&&S.fo){ var dm=foDims(Math.max(S.y,S.y2||0),100,S.ws); foPoly(g.lat,g.lon,dm,S.wd).forEach(function(p){ b.extend(p); }); }
  MAP.fitBounds(b,{animate:false,padding:[8,8]}); }
function share(){ var url=location.href.split('#')[0]+qstr(), g=CUR.g, t=T2('Guerra nuclear (M.A.T): ','Nuclear war (M.A.T): ')+ykt(S.y)+' · '+g.n;
  if(navigator.share){ navigator.share({title:t,text:t,url:url}).catch(function(){}); return; }
  function ok(){ toast(T2('Enlace copiado','Link copied')); }
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(ok,function(){ prompt(T2('Copia el enlace:','Copy the link:'),url); }); else prompt(T2('Copia el enlace:','Copy the link:'),url); }
function how(){ var el=document.getElementById('nu-how'); if(!el) return; function li(s){ return '<li><a href="'+e(s.u)+'" target="_blank" rel="noopener">'+e(s.t)+'</a></li>'; }
  el.innerHTML='<h2>'+T2('Cómo se calcula','How it is calculated')+'</h2><details class="mt" open><summary>'+T2('Método, supuestos y límites','Method, assumptions and limits')+'</summary>'+
  (EN()?'<p><b>Blast.</b> Overpressure radii (20, 12, 5, 2 and 1 psi) come from the U.S. Congress OTA report <i>The Effects of Nuclear War</i> (1979, table 3 and figure 1) for 1 Mt and are scaled to other yields with the cube-root law (Glasstone & Dolan, ch. 3). For an air burst the height is the one that maximises the reach of each pressure, as in OTA.</p>'+
   '<p><b>Fireball.</b> Maximum radius from Glasstone & Dolan (1977, ch. 2).</p>'+
   '<p><b>Thermal burns.</b> Anchored on OTA (1979, p. 21): a 1 Mt burst on a clear day (16 km visibility) causes 1st-degree burns at about 11 km, 2nd-degree at 10 km and 3rd-degree at 8 km. For other yields the radii are scaled with curve fits to Glasstone & Dolan (fig. 12.65 and eq. for thermal fluence vs distance; surface bursts deliver ~70% of the air-burst fluence), as compiled in NUKEMAP. Approximation: fog, rain, clouds or snow change these radii a lot (OTA: with 3 km visibility 2nd-degree burns reach only 4.3 km at 1 Mt).</p>'+
   '<p><b>Initial nuclear radiation (500 rem).</b> Slant range from the curve fit of Fletcher et al. (U.S. AEC, 1963, eq. 2.116), compatible with Glasstone & Dolan ch. 8. For an air burst the ground distance is obtained by subtracting the height of burst; that height is <i>approximated</i> by scaling Hiroshima (≈600 m for 15 kt) with the cube root of the yield. OTA (1979): 450 rem in a short time would cause fatal illness in half of those exposed; 300 rem would kill about 10%.</p>'+
   '<p><b>Mushroom cloud.</b> Height of the stabilised cloud top and base: curve fits to Glasstone & Dolan fig. 9.96 (mid-latitude averages; above ~30 Mt it is an extrapolation). Width: Miller (1963). Approximation.</p>'+
   '<p><b>Fallout (surface burst only).</b> Idealised unit-time reference dose-rate contours of Glasstone & Dolan (1977, table 9.93: 15 mph wind, smooth terrain), with the wind-speed correction of § 9.97 applied to the downwind distance (valid for 13–72 km/h). Assumed fission fraction: 100% up to 25 kt and 50% above (<i>approximation</i>; § 9.94 uses 50% as its example). Accumulated doses use the t<sup>−1.2</sup> decay law (§ 9.146): from hour 1 to hour 24 a person outdoors would receive ≈2.35 times the hour-1 dose rate. Real fallout depends on winds at every altitude, rain and terrain (§ 9.95: roughness reduces doses by ~30%), so this is only an outline. People under the plume are estimated assuming the population of each ring is spread evenly around the centre (approximation).</p>'+
   '<p><b>Casualties.</b> OTA (1979) model: inside 12 psi, 98% killed and 2% injured; 5–12 psi, 50% and 40%; 2–5 psi, 5% and 45%; 1–2 psi, 0% and 25%. Population of each band from GHS-POP R2023A (European Commission JRC), the estimated resident population in 2025 on a 1 km grid; M.A.T summed the population of every cell inside rings of 0.5 to 150 km around the city centre and interpolates between them. The range shown is the model result ±30%. Night-time (resident) population; it ignores commuters, tourists, shelters and building types, and excludes fallout, fires and long-term effects.</p>'+
   '<p><b>Map.</b> Base map © OpenStreetMap contributors (ODbL), standard OpenStreetMap tiles, displayed with Leaflet. Ground zero is the city centre according to Natural Earth (world) or Wikidata (Spanish municipalities).</p>'
  :'<p><b>Onda expansiva.</b> Los radios de sobrepresión (20, 12, 5, 2 y 1 psi) salen del informe del Congreso de EE. UU. <i>The Effects of Nuclear War</i> (OTA, 1979, tabla 3 y figura 1) para 1 Mt y se escalan a otras potencias con la ley de la raíz cúbica (Glasstone y Dolan, cap. 3). En la explosión aérea, la altura es la que maximiza el alcance de cada presión, como en la OTA.</p>'+
   '<p><b>Bola de fuego.</b> Radio máximo según Glasstone y Dolan (1977, cap. 2).</p>'+
   '<p><b>Quemaduras.</b> Ancladas en la OTA (1979, p. 21): una explosión de 1 Mt en un día despejado (visibilidad de 16 km) causa quemaduras de 1.er grado a unos 11 km, de 2.º grado a 10 km y de 3.er grado a 8 km. Para otras potencias los radios se escalan con los ajustes de curvas de Glasstone y Dolan (fig. 12.65 y ecuación de energía térmica según la distancia; en superficie llega ~70 % de la energía de una explosión aérea), recopilados en NUKEMAP. Aproximación: la niebla, la lluvia, las nubes o la nieve cambian mucho estos radios (OTA: con 3 km de visibilidad, las de 2.º grado llegan solo a 4,3 km con 1 Mt).</p>'+
   '<p><b>Radiación nuclear inicial (500 rem).</b> Distancia oblicua según el ajuste de Fletcher et al. (Comisión de Energía Atómica de EE. UU., 1963, ec. 2.116), coherente con Glasstone y Dolan, cap. 8. En la explosión aérea la distancia en el suelo se obtiene restando la altura de la explosión, que se <i>aproxima</i> escalando la de Hiroshima (≈600 m para 15 kt) con la raíz cúbica de la potencia. OTA (1979): 450 rem en poco tiempo causarían una enfermedad mortal a la mitad de los expuestos; 300 rem matarían a un 10 %.</p>'+
   '<p><b>Nube en hongo.</b> Altura del techo y de la base de la nube estabilizada: ajustes a la fig. 9.96 de Glasstone y Dolan (promedios en latitudes medias; por encima de ~30 Mt es una extrapolación). Anchura: Miller (1963). Aproximación.</p>'+
   '<p><b>Lluvia radiactiva (solo en superficie).</b> Contornos idealizados de tasa de dosis de referencia a la hora 1 de Glasstone y Dolan (1977, tabla 9.93: viento de 24 km/h, terreno liso), con la corrección por velocidad del viento del § 9.97 aplicada a la distancia a favor del viento (válida entre 13 y 72 km/h). Fracción de fisión supuesta: 100 % hasta 25 kt y 50 % por encima (<i>aproximación</i>; el § 9.94 usa el 50 % como ejemplo). Las dosis acumuladas usan la ley de desintegración t<sup>−1,2</sup> (§ 9.146): entre la hora 1 y la hora 24 una persona al aire libre recibiría ≈2,35 veces la tasa de la hora 1. La lluvia radiactiva real depende de los vientos a todas las alturas, la lluvia y el relieve (§ 9.95: la rugosidad del terreno reduce las dosis ~30 %), así que es solo un esbozo. Las personas bajo la nube se estiman suponiendo que la población de cada anillo se reparte por igual alrededor del centro (aproximación).</p>'+
   '<p><b>Víctimas.</b> Modelo de la OTA (1979): dentro de 12 psi, 98 % muertos y 2 % heridos; entre 5 y 12 psi, 50 % y 40 %; entre 2 y 5 psi, 5 % y 45 %; entre 1 y 2 psi, 0 % y 25 %. La población de cada banda sale de GHS-POP R2023A (Centro Común de Investigación de la Comisión Europea), la población residente estimada para 2025 en celdas de 1 km; M.A.T ha sumado la población de todas las celdas dentro de anillos de 0,5 a 150 km alrededor del centro de cada ciudad e interpola entre ellos. El intervalo mostrado es el resultado del modelo ±30 %. Es población residente (de noche): no tiene en cuenta a quienes se desplazan a trabajar, turistas, refugios ni tipos de edificio, y no incluye lluvia radiactiva, incendios ni efectos a largo plazo.</p>'+
   '<p><b>Mapa.</b> Mapa base © colaboradores de OpenStreetMap (ODbL), teselas estándar de OpenStreetMap, mostradas con Leaflet. El punto cero es el centro de la ciudad según Natural Earth (mundo) o Wikidata (municipios españoles).</p>')+
  '<h3 style="font-size:15px;margin:12px 0 4px">'+T2('Fuentes','Sources')+'</h3><ul class="srcl">'+D.src.map(li).join('')+D.fx.y.map(function(y){ return y[4]; }).filter(function(s,i,a){ return a.map(function(x){ return x.u; }).indexOf(s.u)===i; }).map(li).join('')+'</ul>'+
  '<p class="ds">'+T2('Potencias de los preajustes: cifras públicas citadas en cada fuente; las de algunas cabezas son estimaciones.','Preset yields: public figures cited in each source; some warhead yields are estimates.')+' '+T2('Datos actualizados: ','Data updated: ')+e(D.upd)+'</p></details>'; }
window.MAT_NUCLEAR=function(app,X){ css(); X0=X; if(MAP){ try{ MAP.remove(); }catch(x){} MAP=null; }
  app.innerHTML='<p class="sub" style="padding:24px 0">'+T2('Cargando…','Loading…')+'</p>';
  load().then(function(){ if(!/^#\/guerra-nuclear/.test(location.hash||'')) return; S=readQ(X); if(S.c==null&&!S.ll) S.c=0; render(app,X); }).catch(function(err){ app.innerHTML='<p class="sub" style="padding:24px 0">'+T2('No se pudo cargar esta sección.','Could not load this section.')+'</p>'; if(window.console) console.error(err); }); };
})();
