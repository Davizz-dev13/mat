(function(){
"use strict";
// ============ M.A.T · Guerra nuclear › Defensa aérea (#/guerra-nuclear?tab=defensa) ============
// Simulador divulgativo de defensa antiaérea: baterías reales con alcances de fuentes abiertas, ataques con drones y misiles,
// escenarios reales con el resultado publicado al lado. Datos: defensa.json.gz (+ ciudades de alcance.json.gz).
// Mapa: Leaflet + teselas estándar de OpenStreetMap y Esri World Imagery. Probabilidades de derribo: estimaciones de M.A.T.
var D=null, LD=null, LP=null, CITY=null, MAP=null, ST=null, X0=null, R0=null, SYSI={}, THRI={}, SCI={};
var LY={b:[],t:null,o:[],base:null,lab:null}, SIM=null, AN=null, CV=null, CX=null, HUD=null, MODE=null, PLC=null, MC=null, DIRTY=true, LASTRES=null;
var CL=['dron','cru','srbm','mrbm'];
var CC={dron:'#ffb000',cru:'#ff6a2b',srbm:'#ff3b5c',mrbm:'#d04dff'};
var VIS={dron:22,cru:13,srbm:7,mrbm:8};
function EN(){return window.MAT_LANG==='en';}
function T2(es,en){return EN()?en:es;}
function L(a){ if(!a) return ''; if(typeof a==='string') return a; return EN()&&a[1]?a[1]:a[0]; }
function e(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function nf(n){ n=Math.round(n); var s=String(Math.abs(n)), o=''; while(s.length>3){ o=(EN()?',':'.')+s.slice(-3)+o; s=s.slice(0,-3);} return (n<0?'-':'')+s+o; }
function dec(x,d){ var s=(+x).toFixed(d); if(d>0) s=s.replace(/\.?0+$/,''); return s.replace('.',EN()?'.':','); }
function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function slugc(c){ return norm(c[0]).replace(/[^a-z0-9]+/g,'')+'-'+c[2]; }
function V(){ var s=document.querySelector('script[data-v]'); return s?s.getAttribute('data-v'):'1'; }
function pct(x){ return dec(x*100,x>=0.995||x<=0.005?0:(x*100<10?1:0))+(EN()?'%':' %'); }
function money(m){ // millones de $ → texto
  if(m==null||!isFinite(m)) return '—';
  if(m>=1000){ var b=m/1000; return EN()?'$'+dec(b,b<10?2:1)+'bn':dec(m,0).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' M$'; }
  if(m>=1) return EN()?'$'+dec(m,m<10?2:1)+'M':dec(m,m<10?2:1)+' M$';
  var u=Math.round(m*1e6); u=u>=10000?Math.round(u/1000)*1000:Math.round(u/100)*100; return EN()?'$'+nf(u):nf(u)+' $'; }
function mrange(a,b){ if(Math.abs(a-b)<=Math.max(a,b)*0.02) return money((a+b)/2); return money(a)+'–'+money(b); }
function kmf(k){ return (k<10?dec(k,1):nf(k))+' km'; }
var DN={};
function cname(iso){ var l=EN()?'en':'es'; try{ if(!DN[l]) DN[l]=new Intl.DisplayNames([l],{type:'region'}); var n=DN[l].of(String(iso).toUpperCase()); if(n) return n; }catch(x){} return String(iso).toUpperCase(); }
function fl(iso){ if(!iso) return ''; return '<img class="df-fl" src="flags/'+iso+'.png" alt="" loading="lazy" onerror="this.style.display=\'none\'">'; }
function est(){ return '<span class="df-est" title="'+T2('Cifra débil o supuesta por M.A.T','Weak figure or assumed by M.A.T')+'">'+T2('Estimación','Estimate')+'</span>'; }
function src(k){ var s=D.src[k]; if(!s) return ''; return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>'; }
function srcs(a){ return (a||[]).filter(function(k,i,x){ return D.src[k]&&x.indexOf(k)===i; }).map(function(k){ return '<li>'+src(k)+'</li>'; }).join(''); }
function clsN(c,pl){ var N={dron:['Drones','Drones'],cru:['Misiles de crucero','Cruise missiles'],srbm:['Balísticos de corto alcance','Short-range ballistic'],mrbm:['Balísticos de alcance medio','Medium-range ballistic']}; var S={dron:['dron','drone'],cru:['misil de crucero','cruise missile'],srbm:['balístico corto','short-range ballistic'],mrbm:['balístico medio','medium-range ballistic']}; return L((pl===false?S:N)[c]); }
function sysN(s){ return L(s.n); }
function toast(t){ var o=document.querySelector('.df-toast'); if(o) o.remove(); var d=document.createElement('div'); d.className='toast df-toast'; d.textContent=t; (document.querySelector('.dfa')||document.body).appendChild(d); setTimeout(function(){ d.remove(); },2800); }
// ---------- geometría ----------
var RAD=Math.PI/180, RE=6371;
function gdist(a,b){ var p1=a[0]*RAD,p2=b[0]*RAD,dp=p2-p1,dl=(b[1]-a[1])*RAD; var h=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2); return 2*RE*Math.asin(Math.min(1,Math.sqrt(h))); }
function dest(lat,lon,brg,dkm){ var d=dkm/RE, b=brg*RAD, p1=lat*RAD, l1=lon*RAD; var p2=Math.asin(Math.sin(p1)*Math.cos(d)+Math.cos(p1)*Math.sin(d)*Math.cos(b)); var l2=l1+Math.atan2(Math.sin(b)*Math.sin(d)*Math.cos(p1),Math.cos(d)-Math.sin(p1)*Math.sin(p2)); return [p2/RAD,((l2/RAD+540)%360)-180]; }
function gcPts(a,b,n){ var p1=a[0]*RAD,l1=a[1]*RAD,p2=b[0]*RAD,l2=b[1]*RAD; var d=gdist(a,b)/RE, out=[]; if(d<1e-9){ for(var j=0;j<=n;j++) out.push([a[0],a[1]]); return out; }
  for(var i=0;i<=n;i++){ var f=i/n, A=Math.sin((1-f)*d)/Math.sin(d), B=Math.sin(f*d)/Math.sin(d); var x=A*Math.cos(p1)*Math.cos(l1)+B*Math.cos(p2)*Math.cos(l2), y=A*Math.cos(p1)*Math.sin(l1)+B*Math.cos(p2)*Math.sin(l2), z=A*Math.sin(p1)+B*Math.sin(p2); out.push([Math.atan2(z,Math.sqrt(x*x+y*y))/RAD,Math.atan2(y,x)/RAD]); } return out; }
function jit(p,km,rnd){ if(!km) return [p[0],p[1]]; var r=km*Math.sqrt(rnd()), b=rnd()*360; return dest(p[0],p[1],b,r); }
function horizon(hm,alt){ return 4.12*(Math.sqrt(hm)+Math.sqrt(alt)); } // km, refracción estándar (4/3)
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hash(s){ var h=2166136261; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; }

// ---------- motor de simulación ----------
function sysR(s,c,alt){ var r=s.r[c]||0; if(!r) return 0; if(c==='dron'||c==='cru') r=Math.min(r,horizon(s.hm||10,alt||50)); return r; }
function cost(s,c){ var x=s.c; if(!Array.isArray(x)) x=x[c]||x.dron; return x; }
function buildTracks(groups,seed,fail){ var rnd=mulberry(seed), T=[], oor={}; fail=fail||{};
  groups.forEach(function(g,gi){ var th=THRI[g.t]; if(!th) return; var tw=0; g.aim.forEach(function(a){ tw+=a[1]; });
    for(var i=0;i<g.n;i++){ var a0=g.fr, st=jit(a0,g.sp||0,rnd), r=rnd()*tw, aim=g.aim[0][0]; for(var k=0;k<g.aim.length;k++){ r-=g.aim[k][1]; if(r<=0){ aim=g.aim[k][0]; break; } }
      var tg=jit(aim,g.sc||0,rnd), legs=g.via?[st,jit(g.via,60,rnd),tg]:[st,tg];
      var P=[], cum=[0], Ltot=0; for(var l=0;l<legs.length-1;l++){ var dl=gdist(legs[l],legs[l+1]), n=Math.max(6,Math.min(48,Math.round(dl/25))); var pts=gcPts(legs[l],legs[l+1],n); if(l) pts.shift(); pts.forEach(function(p,j){ if(P.length){ var dd=gdist(P[P.length-1],p); Ltot+=dd; cum.push(Ltot); } P.push(p); }); }
      if(Ltot>th.rg[1]*1.0001){ oor[g.t]=(oor[g.t]||0)+1; continue; }
      var ft=Ltot/th.v*60, arr=(g.t0||0)+(g.wv?Math.floor(rnd()*g.wv.k)*g.wv.span/g.wv.k:0)+rnd()*(g.win||0);
      var fr=rnd(), fx=fr<(fail[th.cls]||0)?arr-ft+ft*(0.04+0.5*rnd()):null;
      T.push({i:T.length,t:g.t,c:th.cls,g:gi,P:P,cum:cum,L:Ltot,ft:ft,arr:arr,l0:arr-ft,fx:fx,alt:th.alt||0,h:th.h||1,tg:tg,lat:new Float64Array(P.map(function(p){return p[0];})),lon:new Float64Array(P.map(function(p){return p[1];}))}); } });
  return {T:T,oor:oor}; }
function posAt(tr,t){ var f=(t-tr.l0)/tr.ft; if(f<=0) return [tr.lat[0],tr.lon[0]]; if(f>=1){ var n=tr.lat.length-1; return [tr.lat[n],tr.lon[n]]; }
  var d=f*tr.L, c=tr.cum, lo=0, hi=c.length-1; while(hi-lo>1){ var m=(lo+hi)>>1; if(c[m]<=d) lo=m; else hi=m; }
  var sg=c[hi]-c[lo], u=sg>0?(d-c[lo])/sg:0; return [tr.lat[lo]+(tr.lat[hi]-tr.lat[lo])*u, tr.lon[lo]+(tr.lon[hi]-tr.lon[lo])*u]; }
function fd(a,b){ var k=Math.cos((a[0]+b[0])/2*RAD), dx=(b[1]-a[1])*k*111.32, dy=(b[0]-a[0])*110.57; return Math.sqrt(dx*dx+dy*dy); }
function pairs(T,B){ var P=[];
  B.forEach(function(b,bi){ var s=SYSI[b.s]; if(!s) return;
    T.forEach(function(tr){ if(tr.fx!=null) return; var R=sysR(s,tr.c,tr.alt); if(!R) return; var K=Math.max(24,Math.min(180,Math.round(tr.L/6))), tin=null, tout=null, prevIn=false;
      for(var k=0;k<=K;k++){ var t=tr.l0+tr.ft*k/K, p=posAt(tr,t), inn=fd(b.ll,p)<=R;
        if(inn&&tin===null){ var a0=k?tr.l0+tr.ft*(k-1)/K:t, a1=t; if(k){ for(var it=0;it<7;it++){ var m=(a0+a1)/2; if(fd(b.ll,posAt(tr,m))<=R) a1=m; else a0=m; } } tin=a1; }
        if(inn) tout=t; else if(prevIn) break; prevIn=inn; }
      if(tin!==null) P.push({tr:tr.i,b:bi,tin:tin,tout:tout,R:R}); }); });
  return P; }
function Heap(){ this.a=[]; }
Heap.prototype.push=function(x){ var a=this.a; a.push(x); var i=a.length-1; while(i>0){ var p=(i-1)>>1; if(a[p].t<=x.t) break; a[i]=a[p]; i=p; } a[i]=x; };
Heap.prototype.pop=function(){ var a=this.a, top=a[0], x=a.pop(); if(a.length){ a[0]=x; var i=0, n=a.length; while(true){ var l=2*i+1, r=l+1, m=i; if(l<n&&a[l].t<a[m].t) m=l; if(r<n&&a[r].t<a[m].t) m=r; if(m===i) break; var tmp=a[i]; a[i]=a[m]; a[m]=tmp; i=m; } } return top; };
Heap.prototype.size=function(){ return this.a.length; };
function engage(W,seed,rec){ var rnd=mulberry(seed^0x9e3779b9), T=W.T, B=W.B, PR=W.P, REACT=0.25;
  var bs=B.map(function(b){ var s=SYSI[b.s], o=b.o||{}, mag=o.m||s.mag; var pk={}; CL.forEach(function(c){ var r=s.pk[c]; if(r) pk[c]=r[0]+(r[1]-r[0])*rnd(); });
    return {s:s,mag:mag,rdy:mag,res:o.rs!=null?o.rs:Math.round(mag*(o.v||s.res||2)),rq:[],qi:0,ch:new Float64Array(o.ch||s.ch||4).fill(-1e18),pk:pk,used:0,cl:0,ch_:0,cost0:0,cost1:0,kills:0}; });
  var dead=new Float64Array(T.length).fill(1e18), killer=new Int16Array(T.length).fill(-1), eng=new Float64Array(T.length).fill(-1e9), shots=rec?[]:null, h=new Heap();
  PR.forEach(function(p,pi){ h.push({t:p.tin+REACT,p:pi}); });
  var guard=0;
  while(h.size()&&guard++<400000){ var ev=h.pop(), p=PR[ev.p], tr=T[p.tr], t=ev.t, b=bs[p.b];
    if(dead[tr.i]<1e17||t>=tr.arr-0.03||t>p.tout+0.01) continue;
    if(eng[tr.i]>t){ if(eng[tr.i]+0.02<Math.min(p.tout,tr.arr)) h.push({t:eng[tr.i]+0.02,p:ev.p}); continue; }
    while(b.qi<b.rq.length&&b.rq[b.qi]<=t){ b.rdy++; b.qi++; }
    var ci=-1, nb=1e18; for(var c=0;c<b.ch.length;c++){ if(b.ch[c]<=t){ ci=c; break; } if(b.ch[c]<nb) nb=b.ch[c]; }
    if(ci<0){ if(nb+0.01<Math.min(p.tout,tr.arr)) h.push({t:nb+0.01,p:ev.p}); continue; }
    if(b.rdy<1){ if(b.qi<b.rq.length&&b.rq[b.qi]<Math.min(p.tout,tr.arr)) h.push({t:b.rq[b.qi]+0.001,p:ev.p}); continue; }
    var pk=b.pk[tr.c]; if(!pk) continue; pk*=tr.h;
    if(tr.c==='dron'&&b.s.dr&&b.rdy<=b.mag*b.s.dr) continue;
    var v=(b.s.v||1)*60, ti=t+fd(B[p.b].ll,posAt(tr,t))/v; for(var it=0;it<3;it++) ti=t+fd(B[p.b].ll,posAt(tr,ti))/v;
    if(ti>=tr.arr-0.02) continue; if(fd(B[p.b].ll,posAt(tr,ti))>p.R*1.15) continue;
    var n=Math.min(b.s.sal[tr.c]||1,b.rdy); b.rdy-=n; b.used+=n; for(var q=0;q<n;q++){ if(b.res>0){ b.res--; b.rq.push(t+(b.s.rl||45)); } }
    var cc=cost(b.s,tr.c); b.cost0+=n*cc[0]; b.cost1+=n*cc[1];
    b.ch[ci]=ti; eng[tr.i]=ti;
    var kill=rnd()<1-Math.pow(1-pk,n);
    if(rec) shots.push({b:p.b,tr:tr.i,t0:t,t1:ti,k:kill,n:n});
    if(kill){ dead[tr.i]=ti; killer[tr.i]=p.b; b.kills++; }
    else if(ti+0.05<Math.min(p.tout,tr.arr)) h.push({t:ti+0.05,p:ev.p}); }
  var out={dead:dead,killer:killer,shots:shots,bs:bs,kill:0,imp:0,fail:0,byC:{},used:0,c0:0,c1:0};
  T.forEach(function(tr){ var k=out.byC[tr.c]||(out.byC[tr.c]={n:0,k:0,f:0}); k.n++; if(tr.fx!=null){ out.fail++; k.f++; } else if(dead[tr.i]<1e17){ out.kill++; k.k++; } else out.imp++; });
  bs.forEach(function(b){ out.used+=b.used; out.c0+=b.cost0; out.c1+=b.cost1; });
  return out; }
function attackCost(T){ var a=0,b=0; T.forEach(function(tr){ var c=THRI[tr.t].c; a+=c[0]; b+=c[1]; }); return [a,b]; }
function quant(a,q){ if(!a.length) return 0; var s=a.slice().sort(function(x,y){return x-y;}); var i=(s.length-1)*q, lo=Math.floor(i), hi=Math.ceil(i); return s[lo]+(s[hi]-s[lo])*(i-lo); }
function failCfg(){ return ST.sc&&ST.fl!==false&&SCI[ST.sc].fail?SCI[ST.sc].fail.f:null; }
function simulate(){ var groups=attackGroups(), seed=hash(stateStr());
  var bt=buildTracks(groups,seed,failCfg()), W={T:bt.T,B:ST.d.slice(),P:null}; W.P=pairs(W.T,W.B);
  var main=engage(W,seed,true); main.shots.sort(function(a,b){ return a.t0-b.t0; });
  var N=Math.max(30,Math.min(200,Math.round(120000/Math.max(1,W.P.length+W.T.length)))), ks=[], is=[], us=[], cs=[];
  for(var r=1;r<=N;r++){ var o=engage(W,seed+r*7919,false); ks.push(o.kill); is.push(o.imp); us.push(o.used); cs.push((o.c0+o.c1)/2); }
  var ts=1e18, te=-1e18; W.T.forEach(function(tr){ if(tr.l0<ts) ts=tr.l0; if(tr.arr>te) te=tr.arr; });
  if(!W.T.length){ ts=0; te=1; }
  return {W:W,main:main,oor:bt.oor,mc:{n:N,k5:quant(ks,.05),k95:quant(ks,.95),i5:quant(is,.05),i95:quant(is,.95),u5:quant(us,.05),u95:quant(us,.95),c5:quant(cs,.05),c95:quant(cs,.95)},ac:attackCost(W.T),ts:ts,te:te,groups:groups}; }

// ---------- estado, URL y ataque ----------
function cityIdx(slug){ if(!slug||!CITY) return -1; for(var i=0;i<CITY.c.length;i++){ if(slugc(CITY.c[i])===slug) return i; } return -1; }
function cityName(i){ var c=CITY.c[i]; return EN()&&c[1]?c[1]:c[0]; }
function tgtName(){ if(ST.sc) return L(SCI[ST.sc].tn); if(ST.c!=null&&ST.c>=0) return cityName(ST.c); return T2('Punto elegido','Chosen point')+' ('+dec(ST.ll[0],2)+', '+dec(ST.ll[1],2)+')'; }
var DIRS=[['n',0,'Norte','North'],['ne',45,'Noreste','North-east'],['e',90,'Este','East'],['se',135,'Sureste','South-east'],['s',180,'Sur','South'],['so',225,'Suroeste','South-west'],['o',270,'Oeste','West'],['no',315,'Noroeste','North-west']];
function originPt(o){ o=o||ST.o; if(o.k==='p'){ var p=null; D.lp.forEach(function(x){ if(x[0]===o.id) p=[x[3],x[4]]; }); if(p) return p; }
  if(o.k==='ll') return o.ll; var d=DIRS[2]; DIRS.forEach(function(x){ if(x[0]===o.b) d=x; }); return dest(ST.ll[0],ST.ll[1],d[1],o.km||800); }
function originName(o){ o=o||ST.o; if(o.k==='p'){ var n=''; D.lp.forEach(function(x){ if(x[0]===o.id) n=EN()?x[2]:x[1]; }); return n; } if(o.k==='ll') return T2('Punto elegido en el mapa','Point chosen on the map');
  var d=DIRS[2]; DIRS.forEach(function(x){ if(x[0]===o.b) d=x; }); return (EN()?d[3]:d[2])+' · '+nf(o.km||800)+' km'; }
function scTotals(sc){ var t={}; sc.atk.forEach(function(g){ t[g.t]=(t[g.t]||0)+g.n; }); return t; }
function curCounts(){ if(ST.sc&&!ST.am) return scTotals(SCI[ST.sc]); return ST.a; }
function attackGroups(){ var A=curCounts();
  if(ST.sc){ var sc=SCI[ST.sc], tot=scTotals(sc), out=[];
    Object.keys(tot).forEach(function(t){ var want=A[t]==null?tot[t]:A[t], gs=sc.atk.filter(function(g){ return g.t===t; }), acc=0;
      gs.forEach(function(g,i){ var n=i===gs.length-1?want-acc:Math.round(g.n*want/tot[t]); n=Math.max(0,n); acc+=n; if(n) out.push(Object.assign({},g,{n:n})); }); });
    Object.keys(A).forEach(function(t){ if(tot[t]==null&&A[t]>0){ var g0=sc.atk[0], th=THRI[t]; out.push({t:t,n:A[t],fr:g0.fr,aim:[[sc.tgt,1]],sp:g0.sp||40,sc:th.cls==='dron'?6:3,t0:0,win:th.cls==='dron'?60:15}); } });
    return out; }
  var O=originPt(), out2=[], city=ST.c!=null&&ST.c>=0;
  Object.keys(A).forEach(function(t){ var n=A[t]; if(!n) return; var th=THRI[t]; if(!th) return; var c=th.cls;
    out2.push({t:t,n:n,fr:O,aim:[[ST.ll,1]],sp:c==='dron'?40:30,sc:c==='dron'?(city?5:2):(c==='cru'?(city?4:1.5):(city?3:1)),t0:0,win:c==='dron'?60:(c==='cru'?20:10)}); });
  return out2; }
function f3(x){ return String(Math.round(x*1000)/1000); }
function stateStr(){ return [ST.sc||'',f3(ST.ll[0])+','+f3(ST.ll[1]),ST.d.map(function(b){ return b.s+','+f3(b.ll[0])+','+f3(b.ll[1])+(b.k!=null?',@'+b.k:''); }).join('~'),JSON.stringify(curCounts()),ST.sc?(ST.fl===false?'nf':''):JSON.stringify(ST.o)].join('|'); }
function qstr(){ var h='#/guerra-nuclear?tab=defensa';
  if(ST.sc){ h+='&s='+ST.sc; }
  else { if(ST.c!=null&&ST.c>=0) h+='&c='+encodeURIComponent(slugc(CITY.c[ST.c])); else h+='&ll='+f3(ST.ll[0])+','+f3(ST.ll[1]);
    var o=ST.o; h+='&o='+(o.k==='p'?'p,'+o.id:(o.k==='ll'?'ll,'+f3(o.ll[0])+','+f3(o.ll[1]):'dir,'+o.b+','+(o.km||800))); }
  if(!ST.sc||ST.dm) h+='&d='+(ST.d.map(function(b){ var sc=ST.sc?SCI[ST.sc]:null, df=sc&&b.k!=null?sc.dfn[b.k]:null; if(df&&Math.abs(df[1]-b.ll[0])<1e-4&&Math.abs(df[2]-b.ll[1])<1e-4) return '@'+b.k; return b.s+','+f3(b.ll[0])+','+f3(b.ll[1])+(b.k!=null?',@'+b.k:''); }).join('~')||'-');
  if(!ST.sc||ST.am){ var A=curCounts(); h+='&a='+(Object.keys(A).filter(function(t){ return A[t]>0||ST.sc; }).map(function(t){ return t+','+A[t]; }).join('~')||'-'); }
  if(ST.sc&&ST.fl===false) h+='&f=0'; if(ST.bl==='s') h+='&bl=s'; if(ST.spd!==1) h+='&v='+ST.spd;
  return h; }
function writeQ(){ var h=qstr(); if(location.hash!==h){ try{ history.replaceState(null,'',h); }catch(x){} } if(window.MAT_GN_Q) window.MAT_GN_Q('defensa',h); }
function scDefs(sc){ return sc.dfn.map(function(d,k){ return {s:d[0],ll:[d[1],d[2]],o:d[3]||{},k:k}; }); }
function parseD(str,sc){ var out=[]; if(!str||str==='-') return out; str.split('~').forEach(function(p){ var a=p.split(','), k=null;
    if(a.length===1&&/^@\d+$/.test(a[0])&&sc){ k=+a[0].slice(1); var df=sc.dfn[k]; if(df) out.push({s:df[0],ll:[df[1],df[2]],o:df[3]||{},k:k}); return; }
    if(a.length>=3&&SYSI[a[0]]&&isFinite(+a[1])&&isFinite(+a[2])&&Math.abs(+a[1])<=85&&Math.abs(+a[2])<=180){ var b={s:a[0],ll:[+a[1],+a[2]],o:{}}; if(a[3]&&/^@\d+$/.test(a[3])&&sc&&sc.dfn[+a[3].slice(1)]){ b.k=+a[3].slice(1); b.o=sc.dfn[b.k][3]||{}; } out.push(b); } });
  return out.slice(0,40); }
function parseA(str){ var o={}; if(!str||str==='-') return o; str.split('~').forEach(function(p){ var a=p.split(','); if(THRI[a[0]]&&/^\d{1,4}$/.test(a[1]||'')) o[a[0]]=Math.min(2000,+a[1]); }); return o; }
function defaultCustom(){ var mi=cityIdx('madrid-es'); ST={sc:null,c:mi,ll:mi>=0?[CITY.c[mi][3],CITY.c[mi][4]]:[40.42,-3.70],d:[],a:{shahed:40,kh101:8},o:{k:'dir',b:'e',km:800},bl:ST&&ST.bl||'m',spd:ST&&ST.spd||1,dm:false,am:false};
  ST.d=[{s:'patriot',ll:[ST.ll[0]-0.06,ST.ll[1]+0.10],o:{}},{s:'nasams',ll:[ST.ll[0]+0.08,ST.ll[1]+0.18],o:{}},{s:'irist',ll:[ST.ll[0]-0.10,ST.ll[1]+0.25],o:{}},{s:'gepard',ll:[ST.ll[0]+0.02,ST.ll[1]+0.35],o:{}}]; }
function loadSc(id){ var sc=SCI[id]; ST={sc:id,c:null,ll:sc.tgt.slice(),d:scDefs(sc),a:{},o:{k:'ll',ll:sc.atk[0].fr},bl:ST?ST.bl:'m',spd:ST?ST.spd:1,dm:false,am:false}; }
function readQ(q){ var bl=q.bl==='s'?'s':'m', spd=[0.5,1,2,4,8].indexOf(+q.v)>=0?+q.v:1;
  if(q.s&&SCI[q.s]){ ST=null; loadSc(q.s); ST.bl=bl; ST.spd=spd; if(q.f==='0') ST.fl=false; if(q.d!=null){ ST.d=parseD(q.d,SCI[q.s]); ST.dm=true; } if(q.a!=null){ ST.a=Object.assign(scTotals(SCI[q.s]),parseA(q.a)); ST.am=true; } return; }
  ST=null; defaultCustom(); ST.bl=bl; ST.spd=spd;
  if(q.c){ var i=cityIdx(q.c); if(i>=0){ ST.c=i; ST.ll=[CITY.c[i][3],CITY.c[i][4]]; } }
  if(q.ll){ var m=q.ll.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/); if(m&&Math.abs(+m[1])<=85&&Math.abs(+m[2])<=180){ ST.ll=[+m[1],+m[2]]; ST.c=null; } }
  if(q.d!=null) ST.d=parseD(q.d,null); else if(q.c||q.ll){ var c0=ST.ll; ST.d.forEach(function(b,k){ var off=[[-0.06,0.10],[0.08,0.18],[-0.10,0.25],[0.02,0.35]][k]; b.ll=[c0[0]+off[0],c0[1]+off[1]]; }); }
  if(q.a!=null) ST.a=parseA(q.a);
  if(q.o){ var a=q.o.split(','); if(a[0]==='p'&&a[1]) ST.o={k:'p',id:a[1]}; else if(a[0]==='ll'&&isFinite(+a[1])&&isFinite(+a[2])) ST.o={k:'ll',ll:[+a[1],+a[2]]}; else if(a[0]==='dir') ST.o={k:'dir',b:a[1]||'e',km:Math.max(50,Math.min(5000,+a[2]||800))}; } }
function brg(a,b){ var r=Math.PI/180, y=Math.sin((b[1]-a[1])*r)*Math.cos(b[0]*r), x=Math.cos(a[0]*r)*Math.sin(b[0]*r)-Math.sin(a[0]*r)*Math.cos(b[0]*r)*Math.cos((b[1]-a[1])*r); return Math.atan2(y,x)/r; }
function moveTgt(ll){ var old=ST.ll; ST.d.forEach(function(b){ var km=gdist(old,b.ll); if(km>2500) return; var p=dest(ll[0],ll[1],brg(old,b.ll),km); b.ll=[p[0],p[1]]; }); if(ST.o.k==='ll'&&gdist(old,ST.o.ll)<6000){ var q=dest(ll[0],ll[1],brg(old,ST.o.ll),gdist(old,ST.o.ll)); ST.o={k:'dir',b:'e',km:800}; var bb=brg(ll,q), km2=gdist(ll,q), best=DIRS[0]; DIRS.forEach(function(d){ var df=Math.abs(((bb-d[1])%360+540)%360-180), bd=Math.abs(((bb-best[1])%360+540)%360-180); if(df<bd) best=d; }); var ks=[150,300,500,800,1200,2000], bk=800; ks.forEach(function(k){ if(Math.abs(k-km2)<Math.abs(bk-km2)) bk=k; }); ST.o={k:'dir',b:best[0],km:bk}; } ST.ll=ll; }
function toCustom(){ if(!ST.sc) return; var A=curCounts(), g0=SCI[ST.sc].atk[0]; ST.a=Object.assign({},A); ST.o={k:'ll',ll:g0.fr.slice()}; ST.d.forEach(function(b){ delete b.k; }); ST.sc=null; ST.c=null; ST.dm=false; ST.am=false; }

// ---------- interfaz ----------
var TIERS=[['bmd','Antimisiles balísticos de gran altitud','High-altitude ballistic missile defence'],['lr','Largo alcance','Long range'],['mr','Medio alcance','Medium range'],['sr','Corto alcance','Short range'],['vshorad','Muy corto alcance y antidrones','Very short range and counter-drone'],['air','Aviación','Aircraft']];
var PICK=null;
function flags(pa){ return (pa||[]).map(fl).join(''); }
function rTxt(s){ var parts=[]; var a=s.r.dron||s.r.cru, b=s.r.srbm||s.r.mrbm; if(a) parts.push(kmf(a)+' '+T2('aéreo','air')); if(b) parts.push(kmf(Math.max(s.r.srbm||0,s.r.mrbm||0))+' '+T2('balístico','ballistic')); return parts.join(' · '); }
function canTxt(s){ return CL.filter(function(c){ return s.r[c]>0; }).map(function(c){ return clsN(c); }).join(', '); }
function pkTxt(s){ return CL.filter(function(c){ return s.pk[c]; }).map(function(c){ return clsN(c)+': '+Math.round(s.pk[c][0]*100)+'–'+Math.round(s.pk[c][1]*100)+' %'; }).join(' · '); }
function costTxt(s){ if(Array.isArray(s.c)) return mrange(s.c[0],s.c[1]); var u={}; CL.forEach(function(c){ if(s.c[c]){ var k=mrange(s.c[c][0],s.c[c][1]); (u[k]=u[k]||[]).push(clsN(c)); } }); return Object.keys(u).map(function(k){ return k+' ('+u[k].join(', ').toLowerCase()+')'; }).join(' · '); }
function ficha(s,b,used){ var o=(b&&b.o)||{}, nm=o.lb?L(o.lb):'';
  return '<div class="df-fi"><div class="df-fit"><span class="df-bdg" style="background:'+s.col+'">'+e(s.ab)+'</span><b>'+e(sysN(s))+'</b> '+flags(s.pa)+'</div>'+(nm?'<div class="df-fil">'+e(nm)+'</div>':'')+
   '<p>'+e(L(s.d))+'</p><dl>'+
   '<dt>'+T2('Alcance','Range')+'</dt><dd>'+e(L(s.rn))+(s.re?' '+est():'')+'</dd>'+
   '<dt>'+T2('Puede derribar','Can shoot down')+'</dt><dd>'+e(canTxt(s))+'</dd>'+
   '<dt>'+T2('Coste por interceptor','Cost per interceptor')+'</dt><dd><b>'+e(costTxt(s))+'</b>'+(s.cx?' '+est():'')+'<br><small>'+e(L(s.cn))+'</small></dd>'+
   '<dt>'+T2('En el simulador','In the simulator')+' '+est()+'</dt><dd>'+(o.m||s.mag)+' '+T2('interceptores listos','interceptors ready')+' · '+(s.ch)+' '+T2('blancos a la vez','targets at once')+'<br><small>'+T2('Probabilidad de derribo por disparo: ','Kill probability per shot: ')+e(pkTxt(s))+'</small></dd>'+
   (used!=null?'<dt>'+T2('Esta simulación','This simulation')+'</dt><dd>'+used+'</dd>':'')+'</dl>'+
   '<div class="df-fia">'+(s.f?'<a class="btn" href="#/a/'+e(s.f)+'">📄 '+T2('Ficha completa','Full profile')+'</a>':'')+(b?'<button type="button" class="btn" data-rm="'+ST.d.indexOf(b)+'">✕ '+T2('Quitar','Remove')+'</button>':'')+'</div></div>'; }
function scCount(sc){ var t=scTotals(sc), n=0, by={dron:0,cru:0,srbm:0,mrbm:0}; Object.keys(t).forEach(function(k){ n+=t[k]; by[THRI[k].cls]+=t[k]; }); return {n:n,by:by}; }
function scCards(){ return D.sc.map(function(sc){ var c=scCount(sc), on=ST.sc===sc.id;
    return '<button type="button" class="df-sc'+(on?' on':'')+'" data-sc="'+sc.id+'" aria-pressed="'+on+'"><span class="df-scf">'+sc.flag.map(fl).join('')+'</span><b>'+e(L(sc.n))+'</b><small>'+e(L(sc.sub))+'</small><span class="df-scn">'+(c.by.dron?'<i style="color:'+CC.dron+'">●</i>'+nf(c.by.dron)+' ':'')+(c.by.cru?'<i style="color:'+CC.cru+'">●</i>'+nf(c.by.cru)+' ':'')+((c.by.srbm+c.by.mrbm)?'<i style="color:'+CC.mrbm+'">●</i>'+nf(c.by.srbm+c.by.mrbm):'')+'</span></button>'; }).join('')+
  '<button type="button" class="df-sc df-own'+(!ST.sc?' on':'')+'" data-sc="" aria-pressed="'+(!ST.sc)+'"><span class="df-scf">🛠️</span><b>'+T2('Tu propia simulación','Your own simulation')+'</b><small>'+T2('Elige ciudad, defensas y ataque','Pick a city, defences and attack')+'</small></button>'; }
function scBox(){ var el=R0.querySelector('#df-scbox'); if(!el) return; if(!ST.sc){ el.innerHTML=''; el.hidden=true; return; } var sc=SCI[ST.sc]; el.hidden=false;
  el.innerHTML='<div class="df-scb"><div class="df-scbt">⭐ '+e(L(sc.n))+'</div><p>'+e(L(sc.sub))+'.</p><p class="ds">'+e(L(sc.note))+'</p>'+((ST.dm||ST.am)?'<p class="df-mod">✏️ '+T2('Has cambiado el escenario: el resultado real ya no es comparable.','You changed the scenario: the real outcome is no longer comparable.')+' <button type="button" class="df-lnk" data-reset="1">'+T2('Restaurar','Restore')+'</button></p>':'')+'<button type="button" class="btn df-go2" data-go="1">🚀 '+T2('Lanzar este ataque','Launch this attack')+'</button></div>'; }
function b1(){ var el=R0.querySelector('#df-b1b'); if(!el) return;
  el.innerHTML='<div class="df-cur">🎯 <b>'+e(tgtName())+'</b>'+(ST.c!=null&&ST.c>=0?' <span class="ds">'+e(cname(CITY.c[ST.c][2]))+'</span>':'')+'</div>'+
  '<div class="df-srch"><span aria-hidden="true">🔎</span><input type="search" id="df-q" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="'+T2('Busca una ciudad: Kiev, Tel Aviv, Madrid…','Search a city: Kyiv, Tel Aviv, Madrid…')+'"><button type="button" class="df-x" id="df-qx" aria-label="'+T2('Borrar','Clear')+'" hidden>×</button></div><div class="df-qr" id="df-qr"></div>'+
  '<button type="button" class="chip" data-mode="target" aria-pressed="'+(MODE==='target')+'">📍 '+T2('O toca el mapa en cualquier punto','Or tap the map anywhere')+'</button>'; }
function cityHits(q){ q=norm(q).trim(); if(!q) return []; var R=[]; CITY.c.forEach(function(c,i){ var a=norm(c[0]), b=norm(c[1]||''), cn=norm(cname(c[2])), sc=0;
    if(a===q||b===q) sc=4; else if(a.indexOf(q)===0||b.indexOf(q)===0) sc=3; else if((' '+a).indexOf(' '+q)>=0||(' '+b).indexOf(' '+q)>=0) sc=2; else if(a.indexOf(q)>=0||b.indexOf(q)>=0) sc=1.5; else if(cn.indexOf(q)===0) sc=1;
    if(sc) R.push([sc+(c[5]?c[5]/1e5:0),i]); });
  R.sort(function(x,y){ return y[0]-x[0]; }); return R.slice(0,8).map(function(r){ return r[1]; }); }
function qres(){ var qi=R0.querySelector('#df-q'), el=R0.querySelector('#df-qr'), x=R0.querySelector('#df-qx'); if(!qi||!el) return; var q=qi.value; x.hidden=!q; if(!q){ el.innerHTML=''; return; }
  var H=cityHits(q); el.innerHTML=H.length?H.map(function(i){ var c=CITY.c[i]; return '<button type="button" class="df-qi" data-ci="'+i+'">'+fl(c[2])+'<b>'+e(cityName(i))+'</b><small>'+e(cname(c[2]))+'</small></button>'; }).join(''):'<p class="ds">'+T2('No está en la lista de ciudades de M.A.T. Toca el mapa en cualquier punto.','Not in the M.A.T city list. Tap the map anywhere.')+'</p>'; }
function b2(){ var el=R0.querySelector('#df-b2b'); if(!el) return; var sel=PICK?SYSI[PICK]:null;
  var h=TIERS.map(function(t){ var ss=D.sys.filter(function(s){ return s.tier===t[0]; }); if(!ss.length) return ''; return '<div class="df-tl">'+e(EN()?t[2]:t[1])+'</div><div class="df-chips">'+ss.map(function(s){ return '<button type="button" class="chip df-sy" data-sys="'+s.id+'" aria-pressed="'+(PICK===s.id)+'"><span class="df-dot" style="background:'+s.col+'"></span>'+e(sysN(s))+'</button>'; }).join('')+'</div>'; }).join('');
  if(sel) h+='<div class="df-sel"><div class="df-selt">'+flags(sel.pa)+'<b>'+e(sysN(sel))+'</b><span class="ds"> · '+e(rTxt(sel))+'</span></div><div class="ds">'+T2('Derriba: ','Engages: ')+e(canTxt(sel))+' · '+T2('Interceptor: ','Interceptor: ')+e(costTxt(sel))+(sel.cx?' '+est():'')+'</div>'+
    '<div class="df-selb"><button type="button" class="btn df-pl" data-mode="place" aria-pressed="'+(MODE==='place')+'">📍 '+(MODE==='place'?T2('Toca el mapa para colocar…','Tap the map to place…'):T2('Colocar en el mapa','Place on the map'))+'</button><button type="button" class="btn" data-near="1">＋ '+T2('Junto al objetivo','Next to the target')+'</button><button type="button" class="btn df-i" data-info="'+sel.id+'" aria-label="'+T2('Ficha','Profile')+'">ℹ️</button></div><div id="df-selfi"></div></div>';
  else h+='<p class="ds" style="margin:8px 0 0">'+T2('Elige un sistema y tócalo en el mapa, o usa «Junto al objetivo».','Pick a system and tap it on the map, or use "Next to the target".')+'</p>';
  h+='<div class="df-tl">'+T2('Desplegadas','Deployed')+' · '+ST.d.length+'</div>'+(ST.d.length?'<div class="df-pl2">'+ST.d.map(function(b,i){ var s=SYSI[b.s]; return '<div class="df-pr"><span class="df-bdg sm" style="background:'+s.col+'">'+e(s.ab)+'</span><button type="button" class="df-lnk" data-fly="'+i+'">'+e(sysN(s))+(b.o&&b.o.lb?' <small>'+e(L(b.o.lb))+'</small>':'')+'</button><button type="button" class="df-x" data-rm="'+i+'" aria-label="'+T2('Quitar','Remove')+'">×</button></div>'; }).join('')+'</div><button type="button" class="df-lnk" data-clear="1">'+T2('Quitar todas','Remove all')+'</button>':'<p class="ds">'+T2('Ninguna: todo lo que se lance llegará.','None: everything launched will get through.')+'</p>');
  el.innerHTML=h; }
function b3(){ var el=R0.querySelector('#df-b3b'); if(!el) return; var A=curCounts(), O=ST.sc?null:originPt();
  var h='<div class="df-pre">'+[['w',T2('Oleada de Shahed','Shahed wave'),{shahed:100}],['m',T2('Mixto tipo Ucrania','Ukraine-style mix'),{shahed:120,gerbera:40,kh101:12,iskander:4}],['b',T2('Salva balística','Ballistic salvo'),{iskander:12,kinzhal:2}],['i',T2('Mixto tipo Irán','Iran-style mix'),{shahed:60,irancru:10,emad:30}]].map(function(p){ return '<button type="button" class="chip" data-pre="'+p[0]+'">'+e(p[1])+'</button>'; }).join('')+'</div>';
  h+=CL.map(function(c){ var ts=D.thr.filter(function(t){ return t.cls===c; }); return '<div class="df-tl"><i style="color:'+CC[c]+'">●</i> '+e(clsN(c))+'</div>'+ts.map(function(t){ var n=A[t.id]||0, far=O&&n?gdist(O,ST.ll)>t.rg[1]:false;
      return '<div class="df-tr'+(n?' on':'')+'"><button type="button" class="df-tn" data-tinfo="'+t.id+'">'+flags(t.pa)+'<span>'+e(L(t.n))+'<small>'+nf(t.v)+' km/h · '+e(mrange(t.c[0],t.c[1]))+(t.cx?' *':'')+(far?' · <b class="df-far">⚠ '+T2('fuera de alcance','out of range')+' ('+nf(t.rg[1])+' km)</b>':'')+'</small></span></button><div class="df-st"><button type="button" data-tm="'+t.id+'" aria-label="−">−</button><input type="number" inputmode="numeric" min="0" max="2000" value="'+n+'" data-tn="'+t.id+'" aria-label="'+e(L(t.n))+'"><button type="button" data-tp="'+t.id+'" aria-label="+">+</button></div></div>'; }).join(''); }).join('');
  h+='<div id="df-tfi"></div>';
  if(ST.sc&&SCI[ST.sc].fail){ var fa=SCI[ST.sc].fail; h+='<label class="df-tog"><input type="checkbox" id="df-fl"'+(ST.fl!==false?' checked':'')+'> <span>💨 '+e(L(fa.n))+'</span></label>'; }
  if(ST.sc){ var labs=[]; SCI[ST.sc].atk.forEach(function(g){ var l=g.lb?L(g.lb):''; if(l&&labs.indexOf(l)<0) labs.push(l); }); h+='<div class="df-tl">'+T2('Desde dónde','Launched from')+'</div><p class="ds">'+e(labs.length?labs.join(' · '):T2('Puntos del escenario (ver mapa)','Scenario launch points (see map)'))+'</p>'; }
  else { h+='<div class="df-tl">'+T2('Desde dónde','Launched from')+'</div><div class="df-org"><select id="df-o" aria-label="'+T2('Zona de lanzamiento','Launch area')+'"><optgroup label="'+T2('Dirección y distancia','Direction and distance')+'">';
    [150,300,500,800,1200,2000].forEach(function(km){ DIRS.forEach(function(d){ var v='dir,'+d[0]+','+km, on=ST.o.k==='dir'&&ST.o.b===d[0]&&(ST.o.km||800)===km; h+='<option value="'+v+'"'+(on?' selected':'')+'>'+e((EN()?d[3]:d[2])+' · '+nf(km)+' km')+'</option>'; }); });
    h+='</optgroup><optgroup label="'+T2('Lugares','Places')+'">'+D.lp.map(function(p){ return '<option value="p,'+p[0]+'"'+(ST.o.k==='p'&&ST.o.id===p[0]?' selected':'')+'>'+e(EN()?p[2]:p[1])+'</option>'; }).join('')+'</optgroup>'+(ST.o.k==='ll'?'<option value="ll" selected>'+T2('Punto elegido en el mapa','Point chosen on the map')+'</option>':'')+'</select><button type="button" class="chip" data-mode="origin" aria-pressed="'+(MODE==='origin')+'">📍 '+T2('En el mapa','On the map')+'</button></div><p class="ds">🚀 '+e(originName())+' · '+nf(gdist(O,ST.ll))+' km '+T2('hasta el objetivo','to the target')+'</p>'; }
  el.innerHTML=h; }
function thrFicha(t){ return '<div class="df-fi"><div class="df-fit"><b>'+e(L(t.n))+'</b> '+flags(t.pa)+'</div><p>'+e(L(t.d))+'</p><dl><dt>'+T2('Velocidad','Speed')+'</dt><dd>'+nf(t.v)+' km/h'+(t.vx?' '+est():'')+'</dd><dt>'+T2('Alcance','Range')+'</dt><dd>'+(t.rg[0]===t.rg[1]?nf(t.rg[0]):nf(t.rg[0])+'–'+nf(t.rg[1]))+' km</dd><dt>'+T2('Coste por unidad','Unit cost')+'</dt><dd><b>'+e(mrange(t.c[0],t.c[1]))+'</b>'+(t.cx?' '+est():'')+'</dd></dl><ul class="srcl">'+srcs(t.s)+'</ul>'+(t.f?'<a class="btn" href="#/a/'+e(t.f)+'">📄 '+T2('Ficha completa','Full profile')+'</a>':'')+'</div>'; }
function panels(){ b1(); b2(); b3(); scBox(); var sl=R0.querySelector('#df-scl'); if(sl) sl.innerHTML=scCards(); hint(); }
function hint(){ var el=R0.querySelector('#df-hint'); if(!el) return; var t='';
  if(MODE==='target') t=T2('Toca el mapa para elegir qué defiendes','Tap the map to choose what you defend'); else if(MODE==='place'&&PICK) t=T2('Toca el mapa para colocar: ','Tap the map to place: ')+sysN(SYSI[PICK]); else if(MODE==='origin') t=T2('Toca el mapa: desde dónde se lanza el ataque','Tap the map: where the attack is launched from');
  el.hidden=!t; el.innerHTML=t?'<span>'+e(t)+'</span><button type="button" data-mode="" aria-label="'+T2('Cancelar','Cancel')+'">×</button>':''; if(MAP) MAP.getContainer().style.cursor=t?'crosshair':''; }
function changed(redrawMap){ stop(); SIM=null; DIRTY=true; writeQ(); panels(); if(redrawMap!==false) drawMap(); var r=R0.querySelector('#df-res'); if(r&&LASTRES) r.innerHTML='<div class="df-stale">'+T2('Has cambiado la simulación: pulsa «Lanzar» para ver el nuevo resultado.','You changed the simulation: press "Launch" to see the new result.')+'</div>'; }
function setMode(m){ MODE=m||null; panels(); }

// ---------- mapa ----------
function leaflet(){ if(window.L&&window.L.map) return Promise.resolve(window.L); if(LP) return LP;
  LP=new Promise(function(res,rej){ if(!document.querySelector('link[href^="leaflet.css"]')){ var l=document.createElement('link'); l.rel='stylesheet'; l.href='leaflet.css?v='+V(); document.head.appendChild(l); }
    var s=document.createElement('script'); s.src='leaflet.js?v='+V(); s.onload=function(){ if(window.L&&window.L.map) res(window.L); else { LP=null; rej(new Error('leaflet')); } }; s.onerror=function(){ LP=null; rej(new Error('leaflet')); }; document.head.appendChild(s); }); return LP; }
var ATT_C='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> '+(window.MAT_LANG==='en'?'contributors':'colaboradores');
var ATT_E='Tiles © <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a> — Esri, Maxar, Earthstar Geographics, GIS User Community';
function setBase(k){ if(!MAP) return; ST.bl=k; [LY.base,LY.lab].forEach(function(l){ if(l) MAP.removeLayer(l); }); var Lf=window.L;
  if(k==='s'){ LY.base=Lf.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:ATT_E}).addTo(MAP); LY.lab=Lf.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,pane:'overlayPane',opacity:.9}).addTo(MAP); }
  else { LY.base=Lf.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:ATT_C}).addTo(MAP); LY.lab=null; }
  [].forEach.call(R0.querySelectorAll('[data-bl]'),function(b){ b.setAttribute('aria-pressed',String(b.getAttribute('data-bl')===k)); }); }
function mapInit(){ var Lf=window.L; MAP=Lf.map('df-map',{zoomControl:true,worldCopyJump:true,minZoom:2,maxZoom:18,tap:true});
  MAP.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  setBase(ST.bl||'m');
  CV=document.createElement('canvas'); CV.className='df-cv'; MAP.getContainer().appendChild(CV); CX=CV.getContext('2d');
  MAP.on('click',function(ev){ var ll=[ev.latlng.lat,((ev.latlng.lng+540)%360)-180];
    if(MODE==='target'){ if(ST.sc){ toCustom(); toast(T2('Ahora es una simulación propia con tu objetivo.','It is now your own simulation with your target.')); } ST.c=null; moveTgt(ll); MODE=null; changed(); fitView(); }
    else if(MODE==='place'&&PICK){ if(ST.d.length>=40){ toast(T2('Máximo 40 baterías.','Up to 40 batteries.')); return; } ST.d.push({s:PICK,ll:ll,o:{}}); if(ST.sc) ST.dm=true; changed(); toast(T2('Colocada. Toca otra vez para añadir otra.','Placed. Tap again to add another one.')); }
    else if(MODE==='origin'){ ST.o={k:'ll',ll:ll}; MODE=null; changed(); } });
  MAP.on('zoomstart',function(){ if(CV) CV.style.opacity='0'; }); MAP.on('zoomend moveend resize',function(){ if(CV) CV.style.opacity='1'; sizeCv(); paint(); });
  MAP.on('popupopen',function(pe){ var el=pe.popup.getElement(); if(!el) return; [].forEach.call(el.querySelectorAll('[data-rm]'),function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-rm'); if(ST.d[i]){ ST.d.splice(i,1); if(ST.sc) ST.dm=true; MAP.closePopup(); changed(); } }); }); });
  sizeCv(); drawMap(); fitView(); }
function sizeCv(){ if(!CV||!MAP) return; var sz=MAP.getSize(), r=Math.min(2,window.devicePixelRatio||1); if(CV.width!==Math.round(sz.x*r)||CV.height!==Math.round(sz.y*r)){ CV.width=Math.round(sz.x*r); CV.height=Math.round(sz.y*r); CV.style.width=sz.x+'px'; CV.style.height=sz.y+'px'; } CX.setTransform(r,0,0,r,0,0); }
function bIcon(s,sel){ return window.L.divIcon({className:'df-bm',html:'<span class="df-bdg'+(sel?' on':'')+'" style="background:'+s.col+'">'+e(s.ab)+'</span>',iconSize:[30,30],iconAnchor:[15,15]}); }
function drawMap(){ if(!MAP) return; var Lf=window.L; LY.b.forEach(function(l){ MAP.removeLayer(l); }); LY.b=[]; LY.o.forEach(function(l){ MAP.removeLayer(l); }); LY.o=[]; if(LY.t){ MAP.removeLayer(LY.t); LY.t=null; }
  ST.d.forEach(function(b,i){ var s=SYSI[b.s]; if(!s) return; var ra=Math.max(sysR(s,'dron',1000),sysR(s,'cru',50)), rc=sysR(s,'cru',50), rb=Math.max(s.r.srbm||0,s.r.mrbm||0), mx=Math.max(ra,rb);
    var circ=[]; if(ra) circ.push(Lf.circle(b.ll,{radius:ra*1000,color:s.col,weight:1.5,opacity:.9,fillColor:s.col,fillOpacity:.07,interactive:false}));
    if(rc&&rc<ra-1) circ.push(Lf.circle(b.ll,{radius:rc*1000,color:s.col,weight:1,opacity:.8,dashArray:'2 5',fill:false,interactive:false}));
    if(rb&&Math.abs(rb-ra)>1) circ.push(Lf.circle(b.ll,{radius:rb*1000,color:s.col,weight:2,opacity:.95,dashArray:'8 6',fill:!ra,fillColor:s.col,fillOpacity:.05,interactive:false}));
    circ.forEach(function(c){ c.addTo(MAP); LY.b.push(c); });
    var m=Lf.marker(b.ll,{icon:bIcon(s),draggable:true,autoPan:true,title:sysN(s),zIndexOffset:500}).addTo(MAP); LY.b.push(m);
    m.on('click',function(){ var used=null; if(LASTRES&&LASTRES.main.bs[i]&&!DIRTY){ var bb=LASTRES.main.bs[i]; used=nf(bb.used)+' '+T2('interceptores','interceptors')+' · '+nf(bb.kills)+' '+T2('derribos','kills')+' · '+mrange(bb.cost0,bb.cost1); } m.bindPopup(ficha(s,b,used),{maxWidth:300,minWidth:240,autoPanPadding:[20,60]}).openPopup(); });
    m.on('dragend',function(){ var p=m.getLatLng(); b.ll=[p.lat,((p.lng+540)%360)-180]; if(ST.sc) ST.dm=true; changed(); }); });
  var tl=Lf.marker(ST.ll,{icon:Lf.divIcon({className:'df-tg',html:'<span>🎯</span>',iconSize:[34,34],iconAnchor:[17,17]}),interactive:false,zIndexOffset:400}).addTo(MAP); tl.bindTooltip(tgtName(),{permanent:true,direction:'bottom',offset:[0,14],className:'df-tt'}); LY.t=tl;
  var orig=[]; if(ST.sc){ SCI[ST.sc].atk.forEach(function(g){ var k=g.fr.join(','); if(!orig.some(function(o){ return o.k===k; })) orig.push({k:k,ll:g.fr,via:g.via,lb:g.lb?L(g.lb):''}); }); } else orig.push({k:'o',ll:originPt(),lb:originName()});
  orig.forEach(function(o){ var line=Lf.polyline(o.via?[o.ll,o.via,ST.ll]:[o.ll,ST.ll],{color:'#c0392b',weight:1.5,opacity:.55,dashArray:'4 6',interactive:false}).addTo(MAP); LY.o.push(line);
    var mk=Lf.marker(o.ll,{icon:Lf.divIcon({className:'df-om',html:'<span>🚀</span>',iconSize:[28,28],iconAnchor:[14,14]}),interactive:!!o.lb,zIndexOffset:300}).addTo(MAP); if(o.lb) mk.bindTooltip(o.lb,{direction:'top',className:'df-tt'}); LY.o.push(mk); });
  paint(); }
function fitView(){ if(!MAP) return; var Lf=window.L; if(ST.sc){ var sc=SCI[ST.sc]; var bb=Lf.latLngBounds([sc.tgt]); sc.atk.forEach(function(g){ bb.extend(g.fr); }); ST.d.forEach(function(b){ bb.extend(b.ll); }); MAP.fitBounds(bb,{paddingTopLeft:[40,30],paddingBottomRight:[20,30],maxZoom:9,animate:false}); return; }
  var b=Lf.latLngBounds([ST.ll]); ST.d.forEach(function(x){ b.extend(x.ll); }); var o=originPt(); b.extend(o); MAP.fitBounds(b,{padding:[22,22],maxZoom:10,animate:false}); }
// ---------- animación ----------
function stop(){ if(AN){ AN.play=false; if(AN.raf) cancelAnimationFrame(AN.raf); } AN=null; hud(); ctl(); paint(); }
function launch(){ if(!SIM||DIRTY){ var r=R0.querySelector('#df-res'); if(r) r.innerHTML='<p class="sub">'+T2('Calculando…','Calculating…')+'</p>'; }
  setTimeout(function(){ if(!R0||!document.body.contains(R0)) return; if(!SIM||DIRTY){ SIM=simulate(); DIRTY=false; LASTRES=SIM; }
    var tot=SIM.W.T.length; if(!tot){ results(); toast(T2('Nada que lanzar: añade drones o misiles al alcance del objetivo.','Nothing to launch: add drones or missiles within range of the target.')); return; }
    var s1=SIM.main.shots.slice().sort(function(a,b){ return a.t1-b.t1; }), imp=SIM.W.T.filter(function(tr){ return SIM.main.dead[tr.i]>=1e17&&tr.fx==null; }).sort(function(a,b){ return a.arr-b.arr; }), la=SIM.W.T.slice().sort(function(a,b){ return a.l0-b.l0; });
    var fl=SIM.W.T.filter(function(tr){ return tr.fx!=null; }).sort(function(a,b){ return a.fx-b.fx; });
    AN={tc:SIM.ts,play:true,last:performance.now(),fx:[],s1:s1,p1:0,imp:imp,pi:0,la:la,fl:fl,fi:0,kills:[],hits:[],raf:0,li:0};
    var r2=R0.querySelector('#df-res'); if(r2) r2.innerHTML='<div class="df-stale">'+T2('Ataque en curso… El resultado aparecerá al terminar (o pulsa ⏭).','Attack in progress… The result will appear at the end (or press ⏭).')+'</div>';
    var mw=R0.querySelector('.dfm'); if(mw&&mw.getBoundingClientRect().top<0) mw.scrollIntoView({behavior:'smooth',block:'start'});
    ctl(); AN.raf=requestAnimationFrame(frame); },20); }
function frame(now){ if(!AN) return; if(!R0||!document.body.contains(R0)){ stopAll(); return; } var dt=Math.min(0.1,(now-AN.last)/1000); AN.last=now; var T=SIM.W.T, main=SIM.main;
  if(AN.play){ var span=SIM.te-SIM.ts, base=span/45, mn={}, act=false;
    for(var i=0;i<T.length;i++){ var tr=T[i]; if(AN.tc<tr.l0) continue; var end=main.dead[i]<1e17?main.dead[i]:(tr.fx!=null?tr.fx:tr.arr); if(AN.tc>=end) continue; act=true; if(mn[tr.c]==null||tr.ft<mn[tr.c]) mn[tr.c]=tr.ft; }
    var rate=base; Object.keys(mn).forEach(function(c){ rate=Math.min(rate,mn[c]/VIS[c]); }); rate=Math.max(rate,span/2400);
    if(!act){ while(AN.li<AN.la.length&&AN.la[AN.li].l0<=AN.tc) AN.li++; AN.li=AN.li||0; var nx=null; for(var j=AN.li;j<AN.la.length;j++){ if(AN.la[j].l0>AN.tc){ nx=AN.la[j].l0; break; } } if(nx!=null&&nx-AN.tc>rate*0.6) AN.tc=nx-rate*0.3; }
    AN.rate=rate*ST.spd; AN.tc+=dt*AN.rate; if(AN.tc>=SIM.te){ AN.tc=SIM.te; AN.play=false; AN.done=true; } }
  while(AN.p1<AN.s1.length&&AN.s1[AN.p1].t1<=AN.tc){ var sh=AN.s1[AN.p1++]; if(sh.k){ var pk=posAt(T[sh.tr],sh.t1); AN.kills.push(pk); AN.fx.push({ll:pk,k:1,t:now}); } else AN.fx.push({ll:posAt(T[sh.tr],sh.t1),k:2,t:now}); }
  while(AN.pi<AN.imp.length&&AN.imp[AN.pi].arr<=AN.tc){ var it=AN.imp[AN.pi++]; var pi=[it.lat[it.lat.length-1],it.lon[it.lon.length-1]]; AN.hits.push(pi); AN.fx.push({ll:pi,k:0,t:now}); }
  while(AN.fi<AN.fl.length&&AN.fl[AN.fi].fx<=AN.tc){ var fq=AN.fl[AN.fi++]; AN.fx.push({ll:posAt(fq,fq.fx),k:3,t:now}); }
  paint(now); hud();
  if(AN.done){ AN.done=false; results(); ctl(); return; }
  if(AN.play) AN.raf=requestAnimationFrame(frame); }
function paint(now){ if(!CX||!MAP) return; var sz=MAP.getSize(); CX.clearRect(0,0,sz.x,sz.y); if(!AN||!SIM) return; now=now||performance.now();
  var T=SIM.W.T, main=SIM.main, tc=AN.tc, P=function(ll){ return MAP.latLngToContainerPoint(ll); }, rate=AN.rate||((SIM.te-SIM.ts)/45);
  CX.lineCap='round';
  CX.fillStyle='rgba(120,120,120,.55)'; AN.kills.forEach(function(ll){ var p=P(ll); CX.fillRect(p.x-1.2,p.y-1.2,2.4,2.4); });
  AN.hits.forEach(function(ll){ var p=P(ll); CX.beginPath(); CX.arc(p.x,p.y,4,0,7); CX.fillStyle='#e0201b'; CX.fill(); CX.lineWidth=1.5; CX.strokeStyle='#fff'; CX.stroke(); });
  var paths={}, heads={}; CL.forEach(function(c){ paths[c]=new Path2D(); heads[c]=new Path2D(); });
  var fly=0;
  for(var i=0;i<T.length;i++){ var tr=T[i]; if(tc<tr.l0) continue; var end=main.dead[i]<1e17?main.dead[i]:(tr.fx!=null?tr.fx:tr.arr); if(tc>=end) continue; fly++;
    var p=P(posAt(tr,tc)), tl=Math.min(tr.ft*0.08,rate*0.7), q=P(posAt(tr,Math.max(tr.l0,tc-tl))); paths[tr.c].moveTo(q.x,q.y); paths[tr.c].lineTo(p.x,p.y); var r=tr.c==='dron'?2.2:3; heads[tr.c].moveTo(p.x+r,p.y); heads[tr.c].arc(p.x,p.y,r,0,7); }
  CL.forEach(function(c){ CX.strokeStyle=CC[c]; CX.globalAlpha=.55; CX.lineWidth=2; CX.stroke(paths[c]); CX.globalAlpha=1; CX.fillStyle=CC[c]; CX.fill(heads[c]); });
  var sp=new Path2D(), sh=new Path2D();
  main.shots.forEach(function(s){ if(s.t0>tc||s.t1<=tc) return; var b=P(SIM.W.B[s.b].ll), ip=P(posAt(T[s.tr],s.t1)), f=(tc-s.t0)/Math.max(1e-6,s.t1-s.t0), hx=b.x+(ip.x-b.x)*f, hy=b.y+(ip.y-b.y)*f; sp.moveTo(b.x+(ip.x-b.x)*Math.max(0,f-0.35),b.y+(ip.y-b.y)*Math.max(0,f-0.35)); sp.lineTo(hx,hy); sh.moveTo(hx+2,hy); sh.arc(hx,hy,2,0,7); });
  CX.strokeStyle='rgba(120,230,255,.9)'; CX.lineWidth=1.6; CX.stroke(sp); CX.fillStyle='#bff4ff'; CX.fill(sh);
  var emo=0; AN.fx=AN.fx.filter(function(f){ var a=(now-f.t)/900; if(a>=1) return false; var p=P(f.ll);
    if(f.k===1){ CX.beginPath(); CX.arc(p.x,p.y,4+14*a,0,7); CX.strokeStyle='rgba(255,170,40,'+(1-a)+')'; CX.lineWidth=2; CX.stroke(); if(emo++<40&&a<0.7){ CX.globalAlpha=1-a; CX.font='16px sans-serif'; CX.textAlign='center'; CX.textBaseline='middle'; CX.fillText('💥',p.x,p.y); CX.globalAlpha=1; } }
    else if(f.k===0){ CX.beginPath(); CX.arc(p.x,p.y,5+20*a,0,7); CX.fillStyle='rgba(224,32,27,'+(0.5*(1-a))+')'; CX.fill(); CX.strokeStyle='rgba(255,60,50,'+(1-a)+')'; CX.lineWidth=2; CX.stroke(); }
    else if(f.k===3){ CX.beginPath(); CX.arc(p.x,p.y,3+10*a,0,7); CX.fillStyle='rgba(170,170,170,'+(0.6*(1-a))+')'; CX.fill(); }
    else { CX.beginPath(); CX.arc(p.x,p.y,3+6*a,0,7); CX.strokeStyle='rgba(180,220,255,'+(0.8*(1-a))+')'; CX.lineWidth=1; CX.stroke(); }
    return true; });
  AN.fly=fly; }
function clock(m){ var span=SIM.te-SIM.ts; m=Math.max(0,m); var d=Math.floor(m/1440), hh=Math.floor((m%1440)/60), mm=Math.floor(m%60); var s=(hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm; return span>2880?T2('Día ','Day ')+(d+1)+' · '+s:'T+'+(d?d*24+hh:hh)+':'+(mm<10?'0':'')+mm; }
function hud(){ var el=R0&&R0.querySelector('#df-hud'); if(!el) return; if(!AN||!SIM){ el.hidden=true; return; } el.hidden=false;
  el.innerHTML='<span>⏱ '+clock(AN.tc-SIM.ts)+'</span><span>✈️ '+nf(AN.fly||0)+'</span><span>💥 '+nf(AN.kills.length)+'</span><span>🔴 '+nf(AN.hits.length)+'</span>'; }
function ctl(){ var el=R0&&R0.querySelector('#df-ctl'); if(!el) return; var run=!!AN, pl=AN&&AN.play;
  el.querySelector('#df-go').innerHTML=run?(pl?'⏸ '+T2('Pausa','Pause'):(AN.tc>=SIM.te?'↺ '+T2('Repetir','Replay'):'▶ '+T2('Seguir','Resume'))):'🚀 '+T2('Lanzar','Launch');
  el.querySelector('#df-end').hidden=!run||AN.tc>=SIM.te;
  [].forEach.call(el.querySelectorAll('[data-spd]'),function(b){ b.setAttribute('aria-pressed',String(+b.getAttribute('data-spd')===ST.spd)); }); }

// ---------- resultado ----------
function results(){ var el=R0&&R0.querySelector('#df-res'); if(!el||!SIM) return; var M=SIM.main, T=SIM.W.T, n0=T.length, n=n0-M.fail, mc=SIM.mc, oor=0; Object.keys(SIM.oor).forEach(function(k){ oor+=SIM.oor[k]; });
  var h='<div class="res df-r"><h3>📊 '+T2('Resultado de la simulación','Simulation result')+'</h3>';
  if(!n0){ h+='<p>'+T2('No se lanzó nada que pudiera llegar al objetivo.','Nothing was launched that could reach the target.')+'</p>'+(oor?'<p class="ds">'+nf(oor)+' '+T2('fuera de alcance (no se lanzan).','out of range (not launched).')+'</p>':'')+'</div>'; el.innerHTML=h; return; }
  h+='<div class="df-k3"><div><div class="k">'+T2('Lanzados','Launched')+'</div><div class="v">'+nf(n0)+'</div></div><div><div class="k">'+T2('Interceptados','Intercepted')+'</div><div class="v g">'+nf(M.kill)+' <small>'+pct(n?M.kill/n:0)+'</small></div></div><div><div class="k">'+T2('Impactos','Impacts')+'</div><div class="v d">'+nf(M.imp)+'</div></div></div>';
  if(M.fail) h+='<p class="df-mc">💨 '+nf(M.fail)+' '+T2('fallaron por sí solos (','failed on their own (')+e(L(SCI[ST.sc].fail.s))+'). '+T2('El porcentaje de intercepción se calcula sobre los ','The interception rate is calculated over the ')+nf(n)+' '+T2('que siguieron volando.','that kept flying.')+'</p>';
  h+='<p class="df-mc">🎲 '+T2('Repitiendo '+mc.n+' veces el mismo ataque: entre ','Repeating the same attack '+mc.n+' times: between ')+'<b>'+nf(mc.k5)+'</b> '+T2('y','and')+' <b>'+nf(mc.k95)+'</b> '+T2('interceptados','intercepted')+' ('+pct(n?mc.k5/n:0)+'–'+pct(n?mc.k95/n:0)+') '+T2('en el 90 % de los casos.','in 90% of cases.')+'</p>';
  if(oor) h+='<p class="ds">⚠ '+nf(oor)+' '+T2('no se lanzan porque el objetivo está fuera de su alcance: ','are not launched because the target is out of their range: ')+Object.keys(SIM.oor).map(function(k){ return e(L(THRI[k].n))+' ×'+SIM.oor[k]; }).join(', ')+'</p>';
  h+='<div class="df-tw"><table class="df-t"><thead><tr><th></th><th>'+T2('Lanzados','Launched')+'</th><th>'+T2('Derribados','Downed')+'</th><th>'+T2('Impactos','Impacts')+'</th>'+(M.fail?'<th>'+T2('Fallos','Failures')+'</th>':'')+'</tr></thead><tbody>'+CL.filter(function(c){ return M.byC[c]; }).map(function(c){ var x=M.byC[c]; return '<tr><td><i style="color:'+CC[c]+'">●</i> '+e(clsN(c))+'</td><td class="n">'+nf(x.n)+'</td><td class="n">'+nf(x.k)+'</td><td class="n">'+nf(x.n-x.k-x.f)+'</td>'+(M.fail?'<td class="n">'+nf(x.f)+'</td>':'')+'</tr>'; }).join('')+'</tbody></table></div>';
  var bs=M.bs.map(function(b,i){ return {b:b,i:i}; }).filter(function(x){ return x.b.used>0; }).sort(function(a,b){ return b.b.used-a.b.used; });
  h+='<h4>'+T2('Interceptores usados','Interceptors used')+': '+nf(M.used)+'</h4>'+(bs.length?'<table class="df-t"><tbody>'+bs.map(function(x){ var s=x.b.s, d=SIM.W.B[x.i]; return '<tr><td><span class="df-bdg sm" style="background:'+s.col+'">'+e(s.ab)+'</span> '+e(sysN(s))+(d.o&&d.o.lb?'<br><small class="ds">'+e(L(d.o.lb))+'</small>':'')+'</td><td class="n">'+nf(x.b.used)+'<small>'+nf(x.b.kills)+' '+(x.b.kills===1?T2('derribo','kill'):T2('derribos','kills'))+'</small></td><td class="n">'+mrange(x.b.cost0,x.b.cost1)+'</td></tr>'; }).join('')+'</tbody></table>':'<p class="ds">'+T2('Ninguno: ninguna batería tenía el ataque a su alcance.','None: no battery had the attack within range.')+'</p>');
  var ac=SIM.ac, am=(ac[0]+ac[1])/2, dm=(M.c0+M.c1)/2, mx=Math.max(am,dm,1e-9);
  h+='<h4>💸 '+T2('La guerra de desgaste: coste','The war of attrition: cost')+'</h4><div class="df-cost"><div class="df-cr"><span>'+T2('Ataque','Attack')+'</span><div class="df-bar"><i style="width:'+Math.max(2,am/mx*100)+'%;background:#c0392b"></i></div><b>'+mrange(ac[0],ac[1])+'</b></div><div class="df-cr"><span>'+T2('Defensa','Defence')+'</span><div class="df-bar"><i style="width:'+Math.max(2,dm/mx*100)+'%;background:#2f8fd6"></i></div><b>'+mrange(M.c0,M.c1)+'</b></div></div>';
  if(am>0&&dm>0){ var r=dm/am; h+='<p class="df-rat">'+(r>=1.15?T2('Defender cuesta ≈ <b>'+dec(r,r<10?1:0)+' veces</b> lo que cuesta atacar.','Defending costs ≈ <b>'+dec(r,r<10?1:0)+' times</b> what the attack costs.'):(r<=0.87?T2('El ataque cuesta ≈ <b>'+dec(1/r,1/r<10?1:0)+' veces</b> más que los interceptores gastados.','The attack costs ≈ <b>'+dec(1/r,1/r<10?1:0)+' times</b> more than the interceptors used.'):T2('Ataque y defensa cuestan más o menos lo mismo.','Attack and defence cost about the same.')))+' '+T2('Solo cuenta drones, misiles e interceptores: no los daños que se evitan o se sufren.','It only counts drones, missiles and interceptors: not the damage avoided or suffered.')+'</p>'; }
  h+='<details class="df-how"><summary>ⓘ '+T2('Cómo se calcula (y por qué es una estimación)','How it is calculated (and why it is an estimate)')+'</summary>'+howTxt()+'</details>';
  h+='<p class="ds df-disc">⚠️ '+T2('Simulación divulgativa: no es una predicción ni describe un ataque real. Las probabilidades de derribo son estimaciones de M.A.T.','Educational simulation: not a prediction and not a description of a real attack. Kill probabilities are M.A.T estimates.')+'</p></div>';
  if(ST.sc&&!ST.dm&&!ST.am) h+=realBox(); else if(ST.sc) h+='<div class="box df-real"><p class="ds">'+T2('Has modificado el escenario: restaura el original para compararlo con lo que pasó.','You modified the scenario: restore the original to compare it with what happened.')+'</p></div>';
  el.innerHTML=h; }
function realBox(){ var sc=SCI[ST.sc], M=SIM.main, n0=SIM.W.T.length, n=n0-M.fail, K={fail:T2('Fallos','Failures'),launch:T2('Lanzados','Launched'),int:T2('Interceptados','Intercepted'),imp:T2('Impactos','Impacts'),vic:T2('Víctimas','Casualties'),cost:T2('Coste','Cost'),used:T2('Interceptores','Interceptors')};
  var simv={launch:nf(n0),int:nf(M.kill)+' ('+pct(M.kill/n)+')<br><small>'+T2('90 % de los casos: ','90% of cases: ')+pct(SIM.mc.k5/n)+'–'+pct(SIM.mc.k95/n)+'</small>',imp:nf(M.imp),vic:'<span class="ds">'+T2('No se simulan','Not simulated')+'</span>',cost:T2('Ataque ','Attack ')+mrange(SIM.ac[0],SIM.ac[1])+'<br>'+T2('Defensa ','Defence ')+mrange(M.c0,M.c1),fail:M.fail?nf(M.fail):(ST.fl===false?'<span class="ds">'+T2('Desactivados','Turned off')+'</span>':'0'),used:M.bs.map(function(b){ return b; }).reduce(function(acc,b){ acc[b.s.id]=(acc[b.s.id]||0)+b.used; return acc; },{})};
  if(sc.id==='12d'){ var u=simv.used; simv.used='THAAD '+nf(u.thaad||0)+' · Arrow 3 '+nf(u.arrow3||0)+' · Arrow 2 '+nf(u.arrow2||0); } else delete simv.used;
  var h='<div class="box df-real"><h3>⚖️ '+T2('Lo que pasó y lo que da la simulación','What happened and what the simulation gives')+'</h3><table class="df-t df-rt"><thead><tr><th></th><th>'+T2('Lo que se publicó','What was reported')+'</th><th>'+T2('Simulación','Simulation')+'</th></tr></thead><tbody>'+sc.real.map(function(r){ return '<tr><th>'+e(K[r[0]]||r[0])+'</th><td>'+e(L(r[1]))+'</td><td>'+(simv[r[0]]!=null?simv[r[0]]:'—')+'</td></tr>'; }).join('')+'</tbody></table>';
  if(sc.rn&&sc.rn.int!=null){ var d=M.kill/n-sc.rn.int; h+='<p class="df-cmp">'+(Math.abs(d)<0.04?'✅ '+T2('La simulación se parece a la tasa publicada (','The simulation is close to the reported rate (')+pct(sc.rn.int)+').':(d<0?'🔻 '+T2('La simulación intercepta menos que la tasa publicada (','The simulation intercepts less than the reported rate (')+pct(sc.rn.int)+'). '+T2('Faltan defensas que no se modelan (guerra electrónica, más aviones, más baterías) o las probabilidades reales son mayores.','Some defences are not modelled (electronic warfare, more aircraft, more batteries) or real probabilities are higher.'):'🔺 '+T2('La simulación intercepta más que la tasa publicada (','The simulation intercepts more than the reported rate (')+pct(sc.rn.int)+'). '+T2('Las probabilidades reales pueden ser menores o había menos defensas disponibles.','Real probabilities may be lower or fewer defences were available.')))+'</p>'; }
  h+='<p class="ds">'+e(L(sc.note))+'</p><div class="df-tl">'+T2('Fuentes del escenario','Scenario sources')+'</div><ul class="srcl">'+srcs(sc.src)+'</ul></div>'; return h; }
function howTxt(){ return '<p>'+T2('<b>Trayectorias.</b> Cada dron o misil vuela en línea recta sobre la esfera (ruta ortodrómica, con un punto de paso en algunos escenarios) a su velocidad de crucero o, en los balísticos, a una velocidad media estimada. Los lanzamientos se ordenan para que lleguen en la ventana de tiempo del ataque, como en las oleadas coordinadas reales.','<b>Trajectories.</b> Each drone or missile flies in a straight line over the sphere (great-circle route, with a waypoint in some scenarios) at its cruise speed or, for ballistic missiles, at an estimated average speed. Launches are timed so they arrive in the attack window, as in real coordinated waves.')+'</p>'+
  '<p>'+T2('<b>Cuándo dispara una batería.</b> Cuando el blanco entra en su radio contra ese tipo de amenaza (de las fuentes). Contra drones y misiles de crucero el radio se limita además por el horizonte radar: d ≈ 4,12 × (√h<sub>antena</sub> + √h<sub>blanco</sub>) km, con la antena a 10 m (25 m en buques; los cazas ven desde 8.000 m) y el blanco a 1.000 m (drones) o 30–100 m (misiles de crucero). Por eso un Patriot de 160 km solo ve un misil de crucero a unos 40 km.','<b>When a battery fires.</b> When the target enters its radius against that threat type (from the sources). Against drones and cruise missiles the radius is also limited by the radar horizon: d ≈ 4.12 × (√h<sub>antenna</sub> + √h<sub>target</sub>) km, with the antenna at 10 m (25 m on ships; fighters see from 8,000 m) and the target at 1,000 m (drones) or 30–100 m (cruise missiles). That is why a 160 km Patriot only sees a cruise missile at about 40 km.')+'</p>'+
  '<p>'+T2('<b>Disparo.</b> Un interceptor contra drones y misiles de crucero y dos contra balísticos (como las dos por misil del Patriot en Al Udeid, JINSA). Si falla y queda tiempo, vuelve a disparar. Cada batería tiene interceptores listos y canales de tiro limitados, y recarga a los 45 minutos desde una reserva. Las baterías no disparan dos veces a la vez al mismo blanco.','<b>Firing.</b> One interceptor against drones and cruise missiles and two against ballistic missiles (like the two per missile fired by Patriot at Al Udeid, JINSA). If it misses and there is time, it fires again. Each battery has limited ready interceptors and fire channels, and reloads after 45 minutes from a reserve. Batteries do not fire at the same target at the same time.')+'</p>'+
  '<p>'+T2('<b>Probabilidad de derribo.</b> No hay cifras públicas fiables: los ejércitos no las publican y las tasas de cada guerra se disputan. M.A.T usa para cada sistema y tipo de amenaza un intervalo orientativo (por ejemplo, 80–95 % por disparo para un Patriot contra un dron) y en cada repetición elige un valor al azar dentro de él. El resultado de una repetición sale de tirar los dados en cada disparo; por eso se dan también los valores del 90 % de las repeticiones. Los misiles maniobrables (Kinzhal, Fattah) restan un 15 %.','<b>Kill probability.</b> There are no reliable public figures: armed forces do not publish them and each war\'s rates are disputed. For each system and threat type M.A.T uses an indicative range (for example, 80–95% per shot for a Patriot against a drone) and in each repetition picks a random value within it. One repetition comes from rolling the dice on every shot; that is why the 90% range of the repetitions is also shown. Manoeuvring missiles (Kinzhal, Fattah) subtract 15%.')+'</p>'+
  '<p>'+T2('<b>Lo que no se modela:</b> guerra electrónica, señuelos que engañan al radar, drones interceptores, la altitud real de cada trayectoria, fallos de lanzamiento del atacante, la decisión de no disparar contra lo que va a caer en zonas vacías, el daño de cada impacto y los restos de las intercepciones. Las posiciones de las baterías de los escenarios son ilustrativas.','<b>Not modelled:</b> electronic warfare, decoys that fool radars, interceptor drones, the real altitude of each trajectory, attacker launch failures, the choice not to fire at what will fall on empty areas, the damage of each impact and debris from interceptions. Battery positions in the scenarios are illustrative.')+'</p>'; }
function catalog(){ var el=R0.querySelector('#df-catb'); if(!el||el.getAttribute('data-ok')) return; el.setAttribute('data-ok','1');
  var h='<h4>🛡️ '+T2('Sistemas de defensa','Defence systems')+'</h4>'+D.sys.map(function(s){ return '<details class="df-cs"><summary><span class="df-bdg sm" style="background:'+s.col+'">'+e(s.ab)+'</span> '+e(sysN(s))+' '+flags(s.pa)+'<small> · '+e(rTxt(s))+'</small></summary>'+ficha(s,null,null)+'<ul class="srcl">'+srcs(s.s)+'</ul></details>'; }).join('');
  h+='<h4>🚀 '+T2('Amenazas','Threats')+'</h4>'+D.thr.map(function(t){ return '<details class="df-cs"><summary><i style="color:'+CC[t.cls]+'">●</i> '+e(L(t.n))+' '+flags(t.pa)+'<small> · '+nf(t.v)+' km/h · '+e(mrange(t.c[0],t.c[1]))+'</small></summary>'+thrFicha(t)+'</details>'; }).join('');
  h+='<p class="ds">'+T2('Datos actualizados: ','Data updated: ')+e(D.upd)+'. '+T2('«Estimación» = cifra débil, supuesta por M.A.T o sin fuente pública fiable.','"Estimate" = weak figure, assumed by M.A.T or without a reliable public source.')+'</p>';
  el.innerHTML=h; }

function css(){ if(document.getElementById('df-css')) return; var s=document.createElement('style'); s.id='df-css'; s.textContent=
'.dfa .df-int{color:var(--mu);font-size:14px;line-height:1.45;margin:0 0 12px}'+
'.dfa .df-fl{width:20px;height:14px;object-fit:cover;border-radius:2px;vertical-align:-2px;margin-right:4px;box-shadow:0 0 0 1px rgba(255,255,255,.15)}'+
'.dfa .df-est{display:inline-block;font-size:10.5px;font-weight:600;letter-spacing:.02em;border:1px solid #8a6d2a;color:#e8c46a;background:rgba(232,181,74,.1);border-radius:4px;padding:0 5px;margin-left:2px;white-space:nowrap;vertical-align:1px}'+
'.dfa .df-scs{margin:0 0 12px}.dfa .df-h{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:0 0 8px}.dfa .df-h b{font-size:17px;color:#f0d68a}.dfa .df-h small{color:var(--mu);font-size:12.5px}'+
'.dfa .df-scl{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x mandatory;padding:2px 2px 8px;scrollbar-width:thin}'+
'.dfa .df-sc{flex:0 0 232px;scroll-snap-align:start;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:left;border:1px solid #4d4224;background:linear-gradient(160deg,rgba(214,178,94,.13),rgba(19,21,23,.9) 60%);color:var(--tx);border-radius:10px;padding:10px 11px;font:inherit;cursor:pointer;min-height:118px}'+
'.dfa .df-sc b{font-size:14.5px;line-height:1.2}.dfa .df-sc small{color:var(--mu);font-size:12px;line-height:1.3}.dfa .df-sc .df-scf{font-size:18px;line-height:1}.dfa .df-sc .df-scf .df-fl{width:24px;height:16px}.dfa .df-scn{margin-top:auto;font-size:12px;color:#d9d4cc;font-weight:650}.dfa .df-scn i{font-style:normal;margin-right:2px}'+
'.dfa .df-sc.on{border-color:#d6b25e;box-shadow:inset 0 -3px 0 #d6b25e}.dfa .df-own{border-color:var(--line);background:var(--s1)}'+
'@media(min-width:1000px){.dfa .df-scl{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));overflow:visible}.dfa .df-sc{min-width:0}}'+
'.dfa .df-scb{border:1px solid #6b5a2c;border-left:4px solid #d6b25e;background:rgba(214,178,94,.07);border-radius:var(--r);padding:10px 12px;margin:0 0 12px}.dfa .df-scbt{font-weight:750;font-size:16px;color:#f0d68a;margin-bottom:2px}.dfa .df-scb p{margin:4px 0;font-size:13.5px;line-height:1.45}.dfa .df-mod{color:#ffcf7a}'+
'.dfa .df-go2{margin-top:6px;border-color:#a2402f!important;background:#3a1612!important;color:#ffd9cf!important;font-weight:700}'+
'.dfa .dfm{margin:0;scroll-margin-top:70px}.dfa #df-map{height:64vh;min-height:360px;max-height:680px;background:#dfe3e6}'+
'.dfa .df-cv{position:absolute;left:0;top:0;z-index:450;pointer-events:none;transition:opacity .15s}'+
'.dfa .df-lt{position:absolute;top:10px;right:10px;z-index:800;display:flex;border-radius:8px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.35)}.dfa .df-lt button{border:0;background:#fff;color:#222;font:inherit;font-size:13px;font-weight:600;padding:8px 10px;cursor:pointer;min-height:36px}.dfa .df-lt button+button{border-left:1px solid #ddd}.dfa .df-lt button[aria-pressed=true]{background:#1f6fd1;color:#fff}'+
'.dfa .df-hint{position:absolute;left:50%;transform:translateX(-50%);bottom:26px;z-index:800;display:flex;align-items:center;gap:6px;background:rgba(17,19,21,.92);color:#fff;border:1px solid #d6b25e;border-radius:999px;padding:4px 4px 4px 14px;font-size:13px;max-width:92%;box-shadow:0 2px 10px rgba(0,0,0,.4)}.dfa .df-hint[hidden]{display:none}.dfa .df-hint button{background:none;border:0;color:#fff;font-size:20px;line-height:1;width:32px;height:32px;cursor:pointer}'+
'.dfa .df-hud{position:absolute;left:54px;top:10px;z-index:800;display:flex;flex-wrap:wrap;gap:4px;max-width:calc(100% - 200px)}.dfa .df-hud[hidden]{display:none}.dfa .df-hud span{background:rgba(17,19,21,.88);color:#fff;border-radius:6px;padding:3px 7px;font-size:12.5px;font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}'+
'@media(max-width:520px){.dfa .df-hud{left:50px;max-width:calc(100% - 60px);top:54px}.dfa .df-lt button{padding:7px 8px;font-size:12.5px}}'+
'.dfa .df-ctl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0 6px}.dfa .df-go{flex:1 1 110px;min-height:48px;font-size:16px;font-weight:750;border-color:#a2402f!important;background:#3a1612!important;color:#ffd9cf!important}.dfa .df-spd{display:flex;gap:4px}.dfa .df-spd .chip{padding:7px 9px;font-size:12.5px}#df-end{min-width:48px}@media(max-width:430px){.dfa .df-spd [data-spd="0.5"]{display:none}.dfa .df-spd .chip{padding:7px 8px}}'+
'.dfa .df-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:#cfd1cd;margin:2px 0 8px}.dfa .df-leg i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px}.dfa .df-leg i.ln{width:16px;height:2px;border-radius:1px;background:#78e6ff;vertical-align:3px}.dfa .df-leg .ds{flex-basis:100%;font-size:11.5px}'+
'.dfa .df-bdg{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;padding:0 3px;border-radius:7px;color:#fff;font-size:11px;font-weight:800;letter-spacing:.02em;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45);box-sizing:border-box}.dfa .df-bdg.sm{min-width:22px;height:20px;font-size:10px;border-width:1px;border-radius:5px;vertical-align:-4px}'+
'.df-bm{background:none;border:0}.df-bm .df-bdg{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;color:#fff;font:800 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.5);box-sizing:border-box;cursor:grab}'+
'.df-tg{background:none;border:0;font-size:26px;line-height:34px;text-align:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}.df-om{background:none;border:0;font-size:20px;line-height:28px;text-align:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,.6))}'+
'.leaflet-tooltip.df-tt{background:rgba(17,19,21,.9);color:#fff;border:1px solid #444;border-radius:6px;font:600 12px/1.3 -apple-system,Segoe UI,Roboto,sans-serif;padding:2px 7px;box-shadow:none}.leaflet-tooltip.df-tt:before{display:none}'+
'.dfa .leaflet-container{font:12px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}.dfa .leaflet-control-attribution{font-size:10px}'+
'.dfa .leaflet-popup-content{margin:10px 12px;font-size:13px;line-height:1.4;color:#1c1f22}.dfa .leaflet-popup-content .df-fi p{margin:4px 0}.dfa .leaflet-popup-content .df-est{color:#7a5a10;border-color:#c49a3a;background:#fff4d6}.dfa .leaflet-popup-content .btn{min-height:36px;font-size:13px;color:#111;background:#f1f1ef;border-color:#ccc;padding:0 10px}'+
'.dfa .df-fit{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:14.5px}.dfa .df-fil{font-size:12.5px;color:#d6b25e;margin:2px 0}.dfa .leaflet-popup-content .df-fil{color:#7a5a10}.dfa .df-fi dl{margin:6px 0;display:grid;grid-template-columns:minmax(0,1fr);gap:1px}.dfa .df-fi dt{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--dim);margin-top:5px}.dfa .leaflet-popup-content dt{color:#6b7177}.dfa .df-fi dd{margin:0;font-size:13px;line-height:1.4}.dfa .df-fi dd small{color:var(--mu)}.dfa .leaflet-popup-content dd small{color:#555}.dfa .df-fia{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}'+
'.dfa .df-cur{font-size:15px;margin:0 0 8px}.dfa .df-srch{position:relative;display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:var(--bg);border-radius:8px;padding:0 6px 0 10px}.dfa .df-srch input{flex:1;min-width:0;height:44px;border:0;background:transparent;color:var(--tx);font:inherit;font-size:16px;outline:none}.dfa .df-srch:focus-within{border-color:var(--ac)}'+
'.dfa .df-x{background:none;border:0;color:var(--mu);font-size:22px;line-height:1;width:36px;height:36px;cursor:pointer;flex:0 0 auto}.dfa .df-x[hidden]{display:none}'+
'.dfa .df-qr{margin:4px 0 8px}.dfa .df-qi{display:flex;align-items:center;gap:6px;width:100%;text-align:left;background:transparent;border:0;border-bottom:1px solid var(--line);color:var(--tx);padding:9px 4px;font:inherit;font-size:14.5px;cursor:pointer}.dfa .df-qi small{margin-left:auto;color:var(--mu);font-size:12px}.dfa .df-qi:hover{background:var(--s2)}'+
'.dfa .df-tl{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);margin:12px 0 6px}.dfa .df-chips{display:flex;flex-wrap:wrap;gap:6px}.dfa .df-sy{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}.dfa .df-dot{width:10px;height:10px;border-radius:3px;flex:0 0 10px}'+
'.dfa .df-sel{border:1px solid var(--line);border-radius:var(--r);background:var(--s2);padding:9px 10px;margin:10px 0 0;font-size:13px;line-height:1.4}.dfa .df-selt{font-size:14.5px;margin-bottom:3px}.dfa .df-selb{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.dfa .df-selb .btn{min-height:40px;font-size:13.5px;flex:1 1 auto;padding:0 10px}.dfa .df-selb .df-i{flex:0 0 44px}.dfa .df-pl[aria-pressed=true]{border-color:#d6b25e;color:#f0d68a}'+
'.dfa .df-pl2{display:flex;flex-direction:column}.dfa .df-pr{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:2px 0}.dfa .df-pr .df-lnk{flex:1;min-width:0;text-align:left}.dfa .df-pr small{color:var(--mu)}'+
'.dfa .df-lnk{background:none;border:0;color:var(--ac2);font:inherit;font-size:13.5px;cursor:pointer;padding:6px 0;text-decoration:underline;text-underline-offset:2px}'+
'.dfa .df-pre{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 4px}'+
'.dfa .df-tr{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--line);padding:4px 0}.dfa .df-tr.on .df-tn span{color:var(--tx);font-weight:650}.dfa .df-tn{flex:1;min-width:0;display:flex;align-items:center;gap:4px;background:none;border:0;color:#cfd1cd;font:inherit;font-size:13.5px;text-align:left;cursor:pointer;padding:4px 0}.dfa .df-tn span{display:flex;flex-direction:column;min-width:0}.dfa .df-tn small{color:var(--mu);font-size:11.5px;font-weight:400}.dfa .df-far{color:#ff9c8a;font-weight:600}'+
'.dfa .df-st{display:flex;align-items:center;flex:0 0 auto}.dfa .df-st button{width:36px;height:36px;border:1px solid var(--line);background:var(--s2);color:var(--tx);font-size:18px;cursor:pointer;border-radius:8px}.dfa .df-st input{width:54px;height:36px;margin:0 4px;text-align:center;border:1px solid var(--line);background:var(--bg);color:var(--tx);border-radius:8px;font:inherit;font-size:16px;-moz-appearance:textfield}.dfa .df-st input::-webkit-inner-spin-button{-webkit-appearance:none}'+
'.dfa .df-tog{display:flex;align-items:center;gap:8px;font-size:13.5px;margin:10px 0 2px;cursor:pointer;line-height:1.35}.dfa .df-tog input{width:20px;height:20px;flex:0 0 20px;accent-color:#d6b25e}'+
'.dfa .df-org{display:flex;gap:6px;align-items:center}.dfa .df-org select{flex:1;min-width:0;height:42px;border:1px solid var(--line);background:var(--bg);color:var(--tx);border-radius:8px;font:inherit;font-size:16px;padding:0 6px}'+
'.dfa .df-stale{border:1px dashed var(--line);border-radius:var(--r);padding:10px 12px;color:var(--mu);font-size:13.5px;margin:10px 0}'+
'.dfa .df-r{border-color:#244a6a;border-left-color:#2f8fd6}.dfa .df-k3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:4px 0 6px}.dfa .df-k3 .k{font-size:12px;color:var(--mu)}.dfa .df-k3 .v{font-size:22px;font-weight:780;line-height:1.15}.dfa .df-k3 .v small{font-size:13px;font-weight:650;color:#9fe0a8}.dfa .df-k3 .v.g{color:#7fd18b}.dfa .df-k3 .v.d{color:#ff8a7a}'+
'.dfa .df-mc{font-size:13px;color:#cfd8de;margin:6px 0;line-height:1.45}.dfa .df-r h4{font-size:14px;margin:14px 0 4px}'+
'.dfa .df-tw{overflow-x:auto;max-width:100%}.dfa .df-t{width:100%;font-size:13px}.dfa .df-t thead th{letter-spacing:.02em;font-size:10.5px;white-space:nowrap}.dfa .df-t td,.dfa .df-t th{padding:6px 3px}.dfa .df-t td.n{text-align:right;white-space:nowrap}.dfa .df-t td.n small{display:block;color:var(--dim);font-size:11px}'+
'.dfa .df-cost{display:flex;flex-direction:column;gap:6px;margin:6px 0}.dfa .df-cr{display:grid;grid-template-columns:62px minmax(0,1fr) auto;align-items:center;gap:8px;font-size:13px}.dfa .df-bar{height:12px;background:var(--s2);border-radius:6px;overflow:hidden}.dfa .df-bar i{display:block;height:100%;border-radius:6px}.dfa .df-cr b{white-space:nowrap}'+
'.dfa .df-rat{font-size:13.5px;line-height:1.45;margin:6px 0}.dfa .df-how{border-top:1px solid var(--line);margin-top:10px;padding-top:6px}.dfa .df-how summary{cursor:pointer;font-weight:650;color:#9fd3ee;padding:6px 0}.dfa .df-how p{font-size:13px;line-height:1.5;color:#cfd1cd}.dfa .df-disc{margin-top:8px}'+
'.dfa .df-real{border-left:4px solid #d6b25e}.dfa .df-real h3{margin:0 0 6px;font-size:16px}.dfa .df-rt th{font-size:11.5px;letter-spacing:.04em;text-transform:none;color:var(--mu);vertical-align:top}.dfa .df-rt td{font-size:13px;line-height:1.4;vertical-align:top}.dfa .df-rt tbody th{color:#e8dcb8;font-weight:650;white-space:nowrap;padding-right:6px}.dfa .df-cmp{font-size:13.5px;line-height:1.45}'+
'@media(max-width:560px){.dfa .df-rt thead{display:none}.dfa .df-rt tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border-bottom:1px solid var(--line);padding:4px 0}.dfa .df-rt tbody th{grid-column:1/3;border:0;padding:4px 4px 0}.dfa .df-rt td{border:0}.dfa .df-rt td:nth-of-type(2){color:#bfe3ff}}'+
'.dfa .df-cs{border-bottom:1px solid var(--line)}.dfa .df-cs summary{cursor:pointer;padding:9px 0;font-size:14px}.dfa .df-cs summary small{color:var(--mu)}.dfa .df-cs .df-fi{padding:0 0 10px}'+
'.dfa #df-cat h4{font-size:14.5px;margin:12px 0 4px}';
 document.head.appendChild(s); }

// ---------- página ----------
function render(body,X){ X0=X; R0=null; var h='<div class="nu dfa" data-noi18n>'+
  '<p class="df-int">'+T2('Coloca defensas antiaéreas reales en el mapa, lanza un ataque de drones y misiles y mira cuántos se interceptan, cuántos pasan y cuánto cuesta cada bando. Alcances y precios con fuente; la probabilidad de derribo es una estimación.','Place real air defences on the map, launch a drone and missile attack and see how many are intercepted, how many get through and what each side spends. Ranges and prices are sourced; the kill probability is an estimate.')+'</p>'+
  '<section class="df-scs"><div class="df-h"><b>⭐ '+T2('Escenarios reales','Real scenarios')+'</b><small>'+T2('con lo que se publicó al lado','with what was reported alongside')+'</small></div><div class="df-scl" id="df-scl"></div></section>'+
  '<div id="df-scbox" hidden></div>'+
  '<div class="grid"><div class="mcol"><div class="mapw dfm"><div id="df-map"></div><div class="df-hint" id="df-hint" hidden></div><div class="df-hud" id="df-hud" hidden></div>'+
   '<div class="df-lt" role="group" aria-label="'+T2('Tipo de mapa','Map type')+'"><button type="button" data-bl="m" aria-pressed="true">🗺️ '+T2('Mapa','Map')+'</button><button type="button" data-bl="s" aria-pressed="false">🛰️ '+T2('Satélite','Satellite')+'</button></div></div>'+
   '<div class="df-ctl" id="df-ctl"><button type="button" class="btn df-go" id="df-go">🚀 '+T2('Lanzar','Launch')+'</button><div class="df-spd" role="group" aria-label="'+T2('Velocidad','Speed')+'">'+[0.5,1,2,4,8].map(function(v){ return '<button type="button" class="chip" data-spd="'+v+'">×'+dec(v,1)+'</button>'; }).join('')+'</div><button type="button" class="btn" id="df-end" hidden aria-label="'+T2('Ir al final','Skip to the end')+'">⏭</button></div>'+
   '<div class="df-leg"><span><i style="background:'+CC.dron+'"></i>'+T2('Dron','Drone')+'</span><span><i style="background:'+CC.cru+'"></i>'+T2('Crucero','Cruise')+'</span><span><i style="background:'+CC.srbm+'"></i>'+T2('Balístico corto','Short-range ballistic')+'</span><span><i style="background:'+CC.mrbm+'"></i>'+T2('Balístico medio','Medium-range ballistic')+'</span><span><i class="ln"></i>'+T2('Interceptor','Interceptor')+'</span><span>💥 '+T2('Derribo','Kill')+'</span><span>🔴 '+T2('Impacto','Impact')+'</span><span class="ds">'+T2('Círculo: radio contra drones · punteado: contra misiles de crucero (horizonte radar) · rayas: contra balísticos','Circle: radius against drones · dotted: against cruise missiles (radar horizon) · dashed: against ballistic missiles')+'</span></div>'+
   '<div id="df-res"></div></div>'+
  '<div class="side"><div class="box"><h3>① 🎯 '+T2('Qué defiendes','What you defend')+'</h3><div id="df-b1b"></div></div><div class="box"><h3>② 🛡️ '+T2('Tus defensas','Your defences')+'</h3><div id="df-b2b"></div></div><div class="box"><h3>③ 🚀 '+T2('El ataque','The attack')+'</h3><div id="df-b3b"></div></div></div></div>'+
  '<details class="mt" id="df-cat"><summary>📋 '+T2('Sistemas y amenazas: datos y fuentes','Systems and threats: data and sources')+'</summary><div id="df-catb"><p class="sub">…</p></div></details>'+
  '<div class="acts"><button type="button" class="btn" id="df-sh">🔗 '+T2('Compartir esta simulación','Share this simulation')+'</button></div></div>';
  X.set(h,T2('Defensa aérea · Guerra nuclear','Air defence · Nuclear war'));
  R0=body.querySelector('.dfa'); panels(); writeQ(); bind();
  leaflet().then(function(){ if(!R0||!document.body.contains(R0)||!document.getElementById('df-map')) return; mapInit(); }).catch(function(){ var m=document.getElementById('df-map'); if(m) m.innerHTML='<p class="sub" style="padding:20px">'+T2('No se pudo cargar el mapa.','Could not load the map.')+'</p>'; }); }
function share(){ var url=location.href.split('#')[0]+qstr(), t=T2('Simulador de defensa aérea (M.A.T): ','Air defence simulator (M.A.T): ')+(ST.sc?L(SCI[ST.sc].n):tgtName());
  if(navigator.share){ navigator.share({title:'M.A.T',text:t,url:url}).catch(function(){}); return; }
  try{ navigator.clipboard.writeText(url).then(function(){ toast(T2('Enlace copiado','Link copied')); },function(){ prompt(T2('Copia el enlace:','Copy the link:'),url); }); }catch(x){ prompt(T2('Copia el enlace:','Copy the link:'),url); } }
function bind(){ R0.addEventListener('click',function(ev){ var t=ev.target.closest('button,a'); if(!t||!R0.contains(t)) return; var a;
  if((a=t.getAttribute('data-sc'))!=null){ if(a){ loadSc(a); } else { if(ST.sc){ defaultCustom(); } } MODE=null; PICK=null; changed(); fitView(); if(a) toast(T2('Escenario cargado: pulsa «Lanzar».','Scenario loaded: press "Launch".')); var mw=R0.querySelector('#df-scbox'); if(mw&&a) setTimeout(function(){ var y=mw.getBoundingClientRect().top+(window.scrollY||0)-70; window.scrollTo({top:Math.max(0,y),behavior:'smooth'}); },60); return; }
  if(t.hasAttribute('data-reset')){ loadSc(ST.sc); changed(); fitView(); return; }
  if(t.hasAttribute('data-go')||t.id==='df-go'){ if(AN&&SIM){ if(AN.play){ AN.play=false; ctl(); } else { if(AN.tc>=SIM.te){ launch(); } else { AN.play=true; AN.last=performance.now(); ctl(); AN.raf=requestAnimationFrame(frame); } } } else launch(); if(t.hasAttribute('data-go')){ var mw2=R0.querySelector('.dfm'); if(mw2) mw2.scrollIntoView({behavior:'smooth',block:'start'}); } return; }
  if(t.id==='df-end'){ if(AN&&SIM){ AN.tc=SIM.te-1e-6; AN.play=true; AN.last=performance.now(); if(!AN.raf||true) AN.raf=requestAnimationFrame(frame); } return; }
  if((a=t.getAttribute('data-spd'))!=null){ ST.spd=+a; writeQ(); ctl(); return; }
  if((a=t.getAttribute('data-bl'))!=null){ setBase(a); writeQ(); return; }
  if((a=t.getAttribute('data-mode'))!=null){ if(a==='place'&&!PICK) return; setMode(MODE===a||!a?null:a); if(MODE&&MAP){ var mw3=R0.querySelector('.dfm'); if(mw3&&mw3.getBoundingClientRect().top<0) mw3.scrollIntoView({behavior:'smooth',block:'start'}); } return; }
  if((a=t.getAttribute('data-sys'))!=null){ PICK=PICK===a?null:a; MODE=PICK?'place':null; panels(); return; }
  if((a=t.getAttribute('data-info'))!=null){ var fe=R0.querySelector('#df-selfi'); if(fe) fe.innerHTML=fe.innerHTML?'':ficha(SYSI[a],null,null); return; }
  if(t.hasAttribute('data-near')&&PICK){ var k=ST.d.length, ang=(k*137.5)%360, s=SYSI[PICK], dd=s.tier==='air'?60:(s.id==='aegis'?40:(s.tier==='vshorad'?6:(s.tier==='sr'?10:15))); ST.d.push({s:PICK,ll:dest(ST.ll[0],ST.ll[1],ang,dd),o:{}}); if(ST.sc) ST.dm=true; changed(); return; }
  if((a=t.getAttribute('data-rm'))!=null){ var i=+a; if(ST.d[i]){ ST.d.splice(i,1); if(ST.sc) ST.dm=true; if(MAP) MAP.closePopup(); changed(); } return; }
  if(t.hasAttribute('data-clear')){ ST.d=[]; if(ST.sc) ST.dm=true; changed(); return; }
  if((a=t.getAttribute('data-fly'))!=null){ var b=ST.d[+a]; if(b&&MAP){ MAP.setView(b.ll,Math.max(MAP.getZoom(),8)); var mw4=R0.querySelector('.dfm'); if(mw4) mw4.scrollIntoView({behavior:'smooth',block:'start'}); } return; }
  if((a=t.getAttribute('data-ci'))!=null){ var ci=+a; if(ST.sc) toCustom(); ST.c=ci; moveTgt([CITY.c[ci][3],CITY.c[ci][4]]); var q=R0.querySelector('#df-q'); if(q) q.value=''; changed(); fitView(); return; }
  if(t.id==='df-qx'){ var q2=R0.querySelector('#df-q'); q2.value=''; qres(); q2.focus(); return; }
  if((a=t.getAttribute('data-pre'))!=null){ var P={w:{shahed:100},m:{shahed:120,gerbera:40,kh101:12,iskander:4},b:{iskander:12,kinzhal:2},i:{shahed:60,irancru:10,emad:30}}[a]; if(ST.sc){ ST.a={}; Object.keys(scTotals(SCI[ST.sc])).forEach(function(k){ ST.a[k]=0; }); Object.assign(ST.a,P); ST.am=true; } else ST.a=Object.assign({},P); changed(false); drawMap(); return; }
  if((a=t.getAttribute('data-tm'))!=null||(a=t.getAttribute('data-tp'))!=null){ var up=t.hasAttribute('data-tp'), A=Object.assign({},curCounts()), v=A[a]||0, st=v>=100?10:(v>=20?5:1); A[a]=Math.max(0,Math.min(2000,v+(up?st:-st))); ST.a=A; if(ST.sc) ST.am=true; changed(false); drawMap(); return; }
  if((a=t.getAttribute('data-tinfo'))!=null){ var tf=R0.querySelector('#df-tfi'); if(tf){ tf.innerHTML=tf.getAttribute('data-t')===a?'':thrFicha(THRI[a]); tf.setAttribute('data-t',tf.innerHTML?a:''); } return; }
  if(t.id==='df-sh'){ share(); return; } });
 R0.addEventListener('input',function(ev){ if(ev.target.id==='df-q') qres(); });
 R0.addEventListener('keydown',function(ev){ if(ev.target.id==='df-q'&&ev.key==='Enter'){ var f=R0.querySelector('#df-qr [data-ci]'); if(f){ ev.preventDefault(); f.click(); } } if(ev.target.id==='df-q'&&ev.key==='Escape'){ ev.target.value=''; qres(); } });
 R0.addEventListener('change',function(ev){ var t=ev.target, a;
  if((a=t.getAttribute('data-tn'))!=null){ var A=Object.assign({},curCounts()); A[a]=Math.max(0,Math.min(2000,Math.round(+t.value||0))); ST.a=A; if(ST.sc) ST.am=true; changed(false); drawMap(); return; }
  if(t.id==='df-fl'){ ST.fl=t.checked?undefined:false; changed(false); return; }
  if(t.id==='df-o'){ var v=t.value.split(','); if(v[0]==='p') ST.o={k:'p',id:v[1]}; else if(v[0]==='dir') ST.o={k:'dir',b:v[1],km:+v[2]}; changed(); fitView(); } });
 var cat=R0.querySelector('#df-cat'); cat.addEventListener('toggle',function(){ if(cat.open) catalog(); }); }
function load(){ if(LD) return LD; LD=Promise.all([window.MAT_GET('defensa.json.gz'),window.MAT_GET('alcance.json.gz')]).then(function(z){ D=z[0]; CITY=z[1]; D.sys.forEach(function(s){ SYSI[s.id]=s; }); D.thr.forEach(function(t){ THRI[t.id]=t; }); D.sc.forEach(function(s){ SCI[s.id]=s; }); return D; }); LD.catch(function(){ LD=null; }); return LD; }
window.MAT_DEFENSA=function(body,X){ css(); stopAll(); load().then(function(){ if(X.alive&&!X.alive()) return; readQ(X.qs()); MODE=null; PICK=null; LASTRES=null; SIM=null; DIRTY=true; render(body,X); }).catch(function(err){ if(X.alive&&!X.alive()) return; body.innerHTML='<p class="sub" style="padding:24px 0">'+T2('No se pudo cargar el simulador. Actualiza la página.','Could not load the simulator. Refresh the page.')+'</p>'; if(window.console) console.error(err); }); };
function stopAll(){ if(AN&&AN.raf) cancelAnimationFrame(AN.raf); AN=null; if(MAP){ try{ MAP.remove(); }catch(x){} } MAP=null; CV=null; CX=null; LY={b:[],t:null,o:[],base:null,lab:null}; }
window.MAT_DEFENSA_STOP=function(){ stopAll(); R0=null; };
window.MAT_DEFENSA_META=function(el){ return load().then(function(){ var all=[]; D.sys.forEach(function(s){ all=all.concat(s.s); }); D.thr.forEach(function(t){ all=all.concat(t.s); }); D.sc.forEach(function(s){ all=all.concat(s.src); });
  el.innerHTML=howTxt()+'<p>'+T2('<b>Mapa.</b> Mapa base © colaboradores de OpenStreetMap (ODbL), teselas estándar de OpenStreetMap; imagen de satélite de Esri World Imagery (Esri, Maxar, Earthstar Geographics y la comunidad de usuarios de SIG); mostrados con Leaflet.','<b>Map.</b> Base map © OpenStreetMap contributors (ODbL), standard OpenStreetMap tiles; satellite imagery from Esri World Imagery (Esri, Maxar, Earthstar Geographics and the GIS user community); shown with Leaflet.')+'</p><h3 style="font-size:15px;margin:12px 0 4px">'+T2('Fuentes','Sources')+'</h3><ul class="srcl">'+srcs(all)+'</ul><p class="ds">'+T2('Datos actualizados: ','Data updated: ')+e(D.upd)+'</p>'; }); };

})();
