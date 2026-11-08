/* M.A.T — «Submarino» (#/submarino): caza con sonar pasivo, análisis de movimiento del blanco (TMA) y torpedo filoguiado.
   Sin personas: los blancos son buques que aparecen solo como trazas de sonar y marcas en el plot.
   Simulación determinista (sin tiradas de suerte): el resultado depende solo de lo que hace el jugador.
   Modelo acústico simplificado de la ecuación del sonar (Urick, «Principles of Underwater Sound»; Wagner, Mylander y Sanders,
   «Naval Operations Analysis»). Las cifras sin fuente publicada se marcan «Estimación». */
const EN=()=>typeof window!=='undefined'&&window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const nf=(v,d)=>{ d=d==null?1:d; const s=(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d); return EN()?s:s.replace('.',','); };
const ni=v=>{ const s=String(Math.round(v)); return EN()?s.replace(/\B(?=(\d{3})+(?!\d))/g,','):s.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); };
const p3=v=>String(Math.round(((v%360)+360)%360)%360).padStart(3,'0');
const EST=()=>'<span class="sbest">'+L('Estimación','Estimate')+'</span>';
const D2R=Math.PI/180, KN=0.514444;
const n360=a=>((a%360)+360)%360; const dAng=(a,b)=>{ let d=n360(a-b); if(d>180)d-=360; return d; };
const brgOf=(dx,dy)=>n360(Math.atan2(dx,dy)/D2R);
const lg=v=>Math.log10(Math.max(v,1e-9));
const psum=(a,b)=>10*lg(Math.pow(10,a/10)+Math.pow(10,b/10));
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hsh(a,b){ let h=(a*374761393+b*668265263)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; }

/* ===== Submarinos propios: cifras de las fichas de M.A.T (Wikipedia); acústica = Estimación ===== */
const SUBS=[
 {id:'t209',n:'Tipo 209/1400',ficha:'s-type-209-submarine',vmax:22.5,test:500,tubes:8,load:6,sl4:100,vc0:3.0,
  src:['Velocidad 22,5 nudos sumergido, profundidad de prueba 500 m, 8 tubos de 533 mm (ficha Tipo 209, Wikipedia)','Speed 22.5 kn submerged, test depth 500 m, 8 × 533 mm tubes (Type 209 entry, Wikipedia)'],
  note:['Diésel-eléctrico de exportación alemán: rápido y con muchos tubos, algo más ruidoso.','German export diesel-electric: fast with many tubes, a little noisier.']},
 {id:'s80',n:'S-80 Plus «Isaac Peral»',ficha:'s-s-80-plus-class-submarine',vmax:19,test:460,tubes:6,load:6,sl4:96,vc0:3.5,
  src:['Velocidad 19 nudos sumergido, profundidad 460 m, 6 tubos de 533 mm (ficha S-80 Plus, Wikipedia)','Speed 19 kn submerged, depth 460 m, 6 × 533 mm tubes (S-80 Plus entry, Wikipedia)'],
  note:['Submarino AIP español: más lento, pero más silencioso y cavita más tarde.','Spanish AIP submarine: slower, but quieter and it cavitates later.']}
];
const MAXDEP=300; /* profundidad máxima del juego (Estimación, muy por debajo de la de prueba) */
/* Buques: nivel de fuente por Hz a ~1 kHz a la velocidad de referencia; sube 50·log(v/vref) (Ross/Urick, Estimación) */
const SHIPS={
 merc:{n:['Mercante','Merchant'],sl:140,vr:12,bl:5,tpk:8,vmax:17},
 frig:{n:['Fragata','Frigate'],sl:128,vr:14,bl:5,tpk:10,vmax:28},
 fish:{n:['Pesquero','Fishing boat'],sl:128,vr:8,bl:4,tpk:35,vmax:11}
};
const AC={amb:60,di:18,dt:0,alpha:0.06,layerP:15,
 eDiTow:25,eDiHull:15,eDt:3,eInt:20,
 pingSL:220,ts:15,alphaA:0.2,ambA:55,eDiA:20,eDtA:15,layerA:30,maxA:12000,
 torpSL:150,cav:15,silent:6};
const TORP={v:50,range:40000,seek:1500,cone:30,turn:5,gate:600};
const TL=r=>20*lg(Math.max(r,1))+AC.alpha*r/1000;
const TLa=r=>20*lg(Math.max(r,1))+AC.alphaA*r/1000;
const vcav=(sub,d)=>sub.vc0*Math.sqrt(1+Math.max(d,0)/10);
function ownSL(sub,v,d,sil){ return sub.sl4+40*lg(Math.max(v,1)/4)+(v>vcav(sub,d)?AC.cav:0)-(sil?AC.silent:0); }
function ownNL(v){ return psum(AC.amb,40+30*lg(Math.max(v,1))); }
function shipSL(s){ const T_=SHIPS[s.k]; if(s.dead) return 95; return T_.sl+50*lg(Math.max(s.v,1)/T_.vr); }
const crossL=(d1,d2,L_)=>((d1<L_)!==(d2<L_));
/* el ruido propio que oiría una escolta de referencia (8 nudos, sonar remolcado, por encima de la capa) */
function riskRanges(sub,v,d,sil,layer){
 const sl=ownSL(sub,v,d,sil); const nlE=psum(AC.amb,45+30*lg(8))-AC.eDiTow+AC.eDt; const lp=d>=layer?AC.layerP:0;
 const pas=invTL(sl-lp-nlE,TL);
 const nlA=psum(AC.ambA,45+30*lg(8))-AC.eDiA; const tot=AC.pingSL+AC.ts-nlA-AC.eDtA-(d>=layer?2*AC.layerA:0);
 const act=Math.min(AC.maxA,invTL(tot/2,TLa));
 return {sl:sl,pas:pas,act:act,cav:v>vcav(sub,d)};
}
function invTL(x,f){ if(f(1)>x) return 0; let a=1,b=200000; if(f(b)<x) return b; for(let i=0;i<50;i++){ const m=(a+b)/2; if(f(m)<x)a=m; else b=m; } return a; }

/* ===== Patrullas (semilla fija) ===== */
const PATROLS=[
 {id:'p1',seed:1101,n:['Patrulla 1 · El estrecho','Patrol 1 · The strait'],layer:60,dep:50,crs:0,lim:5400,
  d:['Un mercante escoltado por una fragata cruza de este a oeste. Escolta solo en pasivo.','An escorted merchant crosses east to west. The escort listens only.'],
  ships:[{k:'merc',tgt:1,b:62,r:15000,c:268,v:12},{k:'frig',esc:1,ahead:2600,side:1800,zz:900,zp:480,v:14},{k:'fish',b:318,r:9000,c:95,v:5}]},
 {id:'p2',seed:2207,n:['Patrulla 2 · Convoy','Patrol 2 · Convoy'],layer:70,dep:50,crs:20,lim:6000,
  d:['Dos mercantes en columna y un pesquero cerca de su derrota. Cuidado con el neutral.','Two merchants in column and a fishing boat near their track. Mind the neutral.'],
  ships:[{k:'merc',tgt:1,b:48,r:17000,c:250,v:11},{k:'merc',tgt:1,lead:0,astern:3000,b:48,r:17000,c:250,v:11},{k:'frig',esc:1,ahead:3000,side:-1500,zz:1200,zp:540,v:15},{k:'fish',b:20,r:10500,c:180,v:4}]},
 {id:'p3',seed:3313,n:['Patrulla 3 · Escolta alerta','Patrol 3 · Alert escort'],layer:80,dep:110,crs:330,lim:6600,
  d:['La fragata ya busca en activo. Empiezas bajo la capa: si subes, te encuentra.','The frigate is already pinging. You start below the layer: go up and it finds you.'],
  ships:[{k:'merc',tgt:1,b:300,r:13000,c:105,v:13},{k:'frig',esc:1,ahead:2200,side:-1600,zz:1000,zp:420,v:14,ping:30},{k:'fish',b:210,r:8000,c:60,v:5}]},
 {id:'p4',seed:4421,n:['Patrulla 4 · Atlántico','Patrol 4 · Atlantic'],layer:100,dep:60,crs:90,lim:7200,
  d:['Mercante rápido a larga distancia, capa profunda y escolta que alterna activo. Para veteranos.','Fast merchant at long range, deep layer and an escort that pings at times. For veterans.'],
  ships:[{k:'merc',tgt:1,b:120,r:21000,c:330,v:16},{k:'frig',esc:1,ahead:2800,side:2000,zz:1300,zp:600,v:17,ping:60}]}
];

/* ===== Estado del juego ===== */
let G=null;
function newGame(cfg){
 const pt=PATROLS.find(p=>p.id===cfg.patrol)||PATROLS[0]; const sub=SUBS.find(s=>s.id===cfg.sub)||SUBS[0];
 const seed=cfg.seed!=null?cfg.seed:pt.seed; const R=rng(seed); const base=seed===pt.seed;
 const j=(a)=>base?0:(R()*2-1)*a;
 const layer=Math.round(pt.layer+j(10));
 const g={pt:pt,sub:sub,mode:cfg.mode,seed:seed,t:0,layer:layer,lim:pt.lim,
  own:{x:0,y:0,c:pt.crs,v:5,d:pt.dep,oc:pt.crs,ov:5,od:pt.dep,sil:false},
  ships:[],cont:[],nextS:1,torps:[],tubes:sub.load,fired:0,hits:0,neutral:0,log:[],wf:[],
  noiseSum:0,noiseN:0,noisePeak:0,detN:0,detNow:false,over:null,shots:[],man:{},sel:null,firstHit:null,otrk:[],trk:{}};
 const merc0=[];
 pt.ships.forEach((s,i)=>{
  const k=s.k, T_=SHIPS[k]; let o;
  if(s.esc){ o={k:k,esc:1,ahead:s.ahead,side:s.side,zz:s.zz,zp:s.zp,v:s.v+j(1),ping:s.ping||0}; }
  else if(s.astern!=null&&merc0[0]){ const m=merc0[0]; o={k:k,x:m.x-Math.sin(m.c*D2R)*s.astern,y:m.y-Math.cos(m.c*D2R)*s.astern,c:m.c,v:m.v}; }
  else { const b=s.b+j(12), r=s.r+j(2000); o={k:k,x:Math.sin(b*D2R)*r,y:Math.cos(b*D2R)*r,c:n360(s.c+j(15)),v:Math.max(2,s.v+j(1.5))}; }
  o.tgt=!!s.tgt; o.id=i; o.d=k==='frig'?6:5; o.dead=false; o.sonarHold=0; o.cid=null; o.bl=T_.bl; o.tpk=T_.tpk;
  if(k==='merc') merc0.push(o);
  g.ships.push(o);
 });
 const lead=merc0[0];
 g.ships.forEach(o=>{ if(o.esc){ o.ref=lead; o.st='patrol'; o.pingT=0; o.lostT=0; o.okP=0; o.badP=0; o.datum=null; o.srch=0; o.v0=o.v; escortStation(o,0,true); }});
 return g;
}
function escortStation(e,t,init){
 const m=e.ref; const c=m.c*D2R; const u={x:Math.sin(c),y:Math.cos(c)}, nn={x:Math.cos(c),y:-Math.sin(c)};
 const lat=e.side+e.zz*Math.sin(2*Math.PI*t/e.zp);
 const px=m.x+u.x*e.ahead+nn.x*lat, py=m.y+u.y*e.ahead+nn.y*lat;
 if(init){ e.x=px; e.y=py; e.c=m.c; return; }
 return {x:px,y:py};
}
function say(es,en,kind){ G.log.push({t:G.t,es:es,en:en,k:kind||''}); if(G.log.length>60) G.log.shift(); }
function own(){ return G.own; }
function dist(a,b){ return Math.hypot(a.x-b.x,a.y-b.y); }
function turnTo(o,c,rate){ const d=dAng(c,o.c); o.c=n360(o.c+clamp(d,-rate,rate)); }
function moveObj(o,dt){ o.x+=Math.sin(o.c*D2R)*o.v*KN*dt; o.y+=Math.cos(o.c*D2R)*o.v*KN*dt; }

function step(){ const g=G; if(g.over) return; const dt=1; g.t+=dt; const O=g.own;
 /* maniobra propia */
 const tr=clamp(0.4+O.v*0.12,0.5,1.6); turnTo(O,O.oc,tr*dt);
 O.v+=clamp(O.ov-O.v,-0.06*dt,0.05*dt); O.d+=clamp(O.od-O.d,-1.5*dt,1.5*dt); moveObj(O,dt);
 const sl=ownSL(g.sub,O.v,O.d,O.sil); g.noiseSum+=sl; g.noiseN++; g.noisePeak=Math.max(g.noisePeak,sl);
 /* buques */
 g.ships.forEach(s=>{
  if(s.dead){ s.v=Math.max(0,s.v-0.05); moveObj(s,dt); return; }
  if(s.esc) escortAI(s,dt);
  else { if(s.evadeAt!=null&&g.t>=s.evadeAt&&!s.evade){ s.evade={c:s.evadeC}; say('El convoy vira de emergencia: ha oído el buscador del torpedo.','The convoy makes an emergency turn: it heard the torpedo seeker.','bad'); }
   if(s.evade){ turnTo(s,s.evade.c,1.0*dt); s.v=Math.min(SHIPS[s.k].vmax,s.v+0.02*dt); } moveObj(s,dt); }
 });
 torpStep(dt);
 sonarStep();
 if(g.t%20===0){ g.otrk.push([O.x,O.y]); if(g.otrk.length>600) g.otrk.shift(); g.ships.forEach(s=>{ (g.trk[s.id]=g.trk[s.id]||[]).push([s.x,s.y]); }); }
 if(!g.over&&g.hits>0&&g.torps.every(t=>t.done)&&g.t-g.firstHit>120){ const es=g.ships.filter(e=>e.esc&&!e.dead); if(!es.length||es.every(e=>e.st==='return'||e.st==='patrol'||dist(e,O)>15000)){ say('La escolta te ha perdido: misión cumplida.','The escort has lost you: mission complete.','good'); endGame('escaped'); } }
 if(g.t>=g.lim&&!g.over) endGame('time');
}
/* ===== IA de la escolta: solo reacciona a lo que oye (pasivo) o a sus ecos (activo). Determinista ===== */
function escortHearsSub(e){ const O=G.own; const r=dist(e,O); const sl=ownSL(G.sub,O.v,O.d,O.sil);
 const di=e.v<=10?AC.eDiTow:AC.eDiHull; const nl=psum(AC.amb,45+30*lg(Math.max(e.v,1)))-di;
 const se=sl-TL(r)-(O.d>=G.layer?AC.layerP:0)-nl-AC.eDt; return se; }
function pingEcho(e){ const O=G.own; const r=dist(e,O); if(r>AC.maxA) return -99;
 const nl=psum(AC.ambA,45+30*lg(Math.max(e.v,1)))-AC.eDiA; const lay=O.d>=G.layer?2*AC.layerA:0;
 return AC.pingSL+AC.ts-2*TLa(r)-lay-nl-AC.eDtA; }
function setDatum(e,x,y,why){ e.datum={x:x,y:y}; }
function escortAI(e,dt){ const g=G, O=g.own;
 /* oído pasivo continuo: 20 s seguidos por encima del umbral */
 const seP=escortHearsSub(e); e.sonarHold=seP>0?e.sonarHold+dt:0;
 let contact=false;
 if(e.sonarHold>=AC.eInt){ contact=true; }
 /* pings activos */
 const pingEvery=(e.st==='patrol'||e.st==='return')?(e.ping||0):(e.st==='hunt'?10:15);
 let pinged=false, echo=false;
 if(pingEvery>0){ e.pingT+=dt; if(e.pingT>=pingEvery){ e.pingT=0; pinged=true; g.pingNow=(g.pingNow||0)+1; e.lastPing=g.t; if(pingEcho(e)>0){ echo=true; contact=true; } } }
 if(contact){ if(!g.detNow){ g.detNow=true; g.detN++; say('La escolta te ha detectado'+(echo?' con su sonar activo':' en pasivo')+'.','The escort has detected you'+(echo?' with active sonar':' on passive')+'.','bad'); }
   e.lastC=g.t; setDatum(e,O.x,O.y); if(e.st!=='hunt'){ e.st='hunt'; e.badP=0; } }
 if(e.st==='hunt'){
   if(contact&&!echo) e.badP=0;
   if(pinged){ if(echo){ e.badP=0; e.okP++; } else if(!contact){ e.badP++; e.okP=0; } }
   if(e.badP>=3){ e.st='search'; e.srch=g.t; e.badP=0; if(g.detNow){ g.detNow=false; say('La escolta ha perdido el contacto: busca en tu última posición.','The escort has lost contact: it is searching your last position.','good'); } }
   if(e.okP>=3&&dist(e,O)<2000){ endGame('fixed'); return; }
   const tg=e.datum; const r=dist(e,tg); turnTo(e,brgOf(tg.x-e.x,tg.y-e.y),3*dt); e.v=clamp(r>2500?24:15,0,SHIPS.frig.vmax);
 } else if(e.st==='alert'){
   const tg=e.datum; const r=dist(e,tg); turnTo(e,brgOf(tg.x-e.x,tg.y-e.y),3*dt); e.v=r>4000?20:9;
   if(r<600){ e.st='search'; e.srch=g.t; }
 } else if(e.st==='search'){
   /* cuadrado creciente alrededor del datum a 8 nudos durante 10 minutos */
   const k=Math.floor((g.t-e.srch)/150); const leg=600*(1+Math.floor(k/2)); const hd=n360(90*k);
   const tgx=e.datum.x+Math.sin(hd*D2R)*leg, tgy=e.datum.y+Math.cos(hd*D2R)*leg;
   turnTo(e,brgOf(tgx-e.x,tgy-e.y),3*dt); e.v=8;
   if(g.t-e.srch>600){ e.st='return'; if(g.detNow) g.detNow=false; g.lostOnce=true; say('Contacto perdido: la escolta abandona la búsqueda.','Contact lost: the escort gives up the search.','good'); }
 } else if(e.st==='return'){
   const p=escortStation(e,g.t); const r=dist(e,p); turnTo(e,brgOf(p.x-e.x,p.y-e.y),2*dt); e.v=r>1500?18:e.v0; if(r<800) e.st='patrol';
 } else { /* patrol */
   const p=escortStation(e,g.t); turnTo(e,brgOf(p.x-e.x,p.y-e.y),3*dt); const r=dist(e,p); e.v=clamp(e.v0+(r-300)/200,e.v0-4,e.v0+6);
 }
 moveObj(e,dt);
}
function alarmEscorts(x,y,es,en){ G.ships.forEach(e=>{ if(e.esc&&!e.dead&&(e.st==='patrol'||e.st==='return'||e.st==='search')){ e.st='alert'; setDatum(e,x,y); e.pingT=10; } }); if(es) say(es,en,'bad'); }

/* ===== Sonar propio: ecuación del sonar pasivo, sin ruido aleatorio ===== */
function sonarStep(){ const g=G, O=g.own; const nl=ownNL(O.v)-AC.di+AC.dt;
 g.ships.forEach(s=>{ const r=dist(s,O); const b=brgOf(s.x-O.x,s.y-O.y);
  const baf=Math.abs(dAng(b,O.c))>150; /* zona ciega de popa (baffles), ±30° */
  const se=shipSL(s)-TL(r)-(crossL(O.d,s.d,g.layer)?AC.layerP:0)-nl;
  s.se=se; s.brg=b; s.baf=baf; const det=se>0&&!baf;
  const pinging=s.esc&&s.lastPing&&g.t-s.lastPing<3;
  if((det||pinging)&&s.cid==null){ s.cid='S'+(g.nextS++); s.t0=g.t; g.cont.push(s); s.brgs=[]; say('Nuevo contacto '+s.cid+' por '+p3(b)+'°.','New contact '+s.cid+' bearing '+p3(b)+'°.'); if(!g.sel) g.sel=s.cid; }
  s.det=det; s.ping=pinging;
  if(s.cid&&(det||pinging)&&g.t%20===0){ s.brgs.push({t:g.t,b:Math.round(b*10)/10,ox:O.x,oy:O.y}); if(s.brgs.length>400) s.brgs.shift(); }
 });
 if(g.t%10===0){ /* fila de la cascada */
  const row=new Float32Array(180);
  g.ships.forEach(s=>{ if(s.baf) return; const amp=s.se>-6?clamp((s.se+6)/24,0,1.2):0; const pg=s.ping?1.4:0; if(!amp&&!pg) return;
   for(let i=0;i<180;i++){ let d=Math.abs(dAng(i*2+1,s.brg)); const w=s.ping?9:2.2; row[i]+=amp*Math.exp(-d*d/(w*w))+pg*Math.exp(-d*d/(14*14)); } });
  g.torps.forEach(tp=>{ if(tp.done) return; const b=brgOf(tp.x-O.x,tp.y-O.y); for(let i=0;i<180;i++){ const d=Math.abs(dAng(i*2+1,b)); row[i]+=0.8*Math.exp(-d*d/4); } });
  if(g.boom&&g.t-g.boom.t<12){ const b=g.boom.b; for(let i=0;i<180;i++){ const d=Math.abs(dAng(i*2+1,b)); row[i]+=1.6*Math.exp(-d*d/30); } }
  const fl=clamp((ownNL(O.v)-62)/30,0,0.5);
  for(let i=0;i<180;i++) row[i]+=0.08+0.16*hsh(i,g.t)+fl*0.5*hsh(i+7,g.t+3);
  g.wf.push(row); if(g.wf.length>150) g.wf.shift();
 }
}

/* ===== TMA: estimador pseudolineal de mínimos cuadrados sobre las demoras (solo con lo que oye el jugador) ===== */
function solve4(A,b){ const n=4; const M=A.map((r,i)=>r.concat([b[i]]));
 for(let c=0;c<n;c++){ let p=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r; [M[c],M[p]]=[M[p],M[c]]; if(Math.abs(M[c][c])<1e-12) return null;
  for(let r=0;r<n;r++){ if(r===c) continue; const f=M[r][c]/M[c][c]; for(let k=c;k<=n;k++) M[r][k]-=f*M[c][k]; } }
 return M.map((r,i)=>r[n]/r[i]); }
function ple(br,pert){ const n=br.length; if(n<4) return null; const tr=br[n-1].t; const A=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], B=[0,0,0,0];
 br.forEach((q,i)=>{ const b=(q.b+(pert?pert*(i%2?1:-1):0))*D2R; const tau=q.t-tr; const row=[Math.cos(b),-Math.sin(b),Math.cos(b)*tau,-Math.sin(b)*tau]; const z=Math.cos(b)*q.ox-Math.sin(b)*q.oy;
  for(let a=0;a<4;a++){ B[a]+=row[a]*z; for(let c=0;c<4;c++) A[a][c]+=row[a]*row[c]; } });
 const s=solve4(A,B); if(!s) return null; return {t:tr,x:s[0],y:s[1],vx:s[2],vy:s[3]}; }
function solOf(st,O){ /* a partir de un estado (t,x,y,vx,vy): distancia, rumbo, velocidad ahora */
 const dt=G.t-st.t; const x=st.x+st.vx*dt, y=st.y+st.vy*dt; return {x:x,y:y,vx:st.vx,vy:st.vy,r:Math.hypot(x-O.x,y-O.y),b:brgOf(x-O.x,y-O.y),c:brgOf(st.vx,st.vy),v:Math.hypot(st.vx,st.vy)/KN,t:G.t}; }
function autoSolution(s){ if(!s||!s.brgs) return {ok:false,why:'nodata'}; const br=s.brgs.filter(q=>q.t>=G.t-1200); if(br.length<8) return {ok:false,why:'few',n:br.length};
 const span=br[br.length-1].t-br[0].t; if(span<240) return {ok:false,why:'span'};
 const a=ple(br,0); if(!a) return {ok:false,why:'geom'}; const b=ple(br,0.1); const O=G.own;
 const sa=solOf(a,O); const sb=b?solOf(b,O):null; const q=sb?Math.abs(sb.r-sa.r)/Math.max(sa.r,1):1;
 if(!(sa.r>200&&sa.r<60000)||q>0.06||sa.v>40) return {ok:false,why:'geom',q:q};
 sa.ok=true; sa.q=q<0.02?'alta':'media'; sa.st=a; return sa; }
function manualSolution(s){ const m=G.man[s.cid]; if(!m||!s.brgs||!s.brgs.length) return null; const q=s.brgs[clamp(m.k,0,s.brgs.length-1)];
 const x=q.ox+Math.sin(q.b*D2R)*m.R, y=q.oy+Math.cos(q.b*D2R)*m.R; const vx=Math.sin(m.C*D2R)*m.V*KN, vy=Math.cos(m.C*D2R)*m.V*KN;
 const st={t:q.t,x:x,y:y,vx:vx,vy:vy}; const so=solOf(st,G.own); so.ok=true; so.st=st; so.manual=true; return so; }
function curSolution(s){ if(!s) return null; return G.mode==='facil'?autoSolution(s):manualSolution(s); }

/* ===== Torpedo pesado filoguiado ===== */
function intercept(px,py,vx,vy,sx,sy,V){ const dx=px-sx, dy=py-sy; const a=vx*vx+vy*vy-V*V, b=2*(dx*vx+dy*vy), c=dx*dx+dy*dy;
 let t; if(Math.abs(a)<1e-9) t=-c/b; else { const D=b*b-4*a*c; if(D<0) return null; const t1=(-b-Math.sqrt(D))/(2*a), t2=(-b+Math.sqrt(D))/(2*a); t=Math.min(t1,t2)>0?Math.min(t1,t2):Math.max(t1,t2); }
 if(!(t>0)) return null; return {x:px+vx*t,y:py+vy*t,t:t}; }
function fire(s,opt){ const g=G; opt=opt||{}; if(g.over) return {err:'over'}; if(!s) return {err:'nosel'}; if(!s.tgt) return {err:'rules'}; if(g.tubes<=0) return {err:'empty'};
 const sol=curSolution(s); if(!sol||!sol.ok) return {err:'nosol'}; const O=g.own;
 const tp={id:g.fired+1,x:O.x+Math.sin(O.c*D2R)*40,y:O.y+Math.cos(O.c*D2R)*40,c:O.c,v:TORP.v,run:0,wire:true,seek:false,lock:null,done:false,off:0,
   act:opt.act!=null?opt.act:(g.mode==='facil'?1200:(g.actSet!=null?g.actSet:1200)),st:sol.st,lx:O.x,ly:O.y,cid:s.cid,tgtId:s.id,trk:[],res:null,t0:g.t};
 /* error de la solución en el momento del disparo, frente a la verdad (solo se enseña en el informe) */
 const tr={r:dist(s,O),c:s.c,v:s.v}; tp.err={dr:(sol.r-tr.r)/tr.r*100,dc:dAng(sol.c,tr.c),dv:sol.v-tr.v,r:tr.r};
 g.tubes--; g.fired++; g.torps.push(tp); g.shots.push(tp);
 say('Torpedo '+tp.id+' fuera, filoguiado hacia '+s.cid+'.','Torpedo '+tp.id+' away, wire-guided at '+s.cid+'.');
 /* el transitorio de lanzamiento y el torpedo a 50 nudos los oye la escolta: datum = punto de lanzamiento */
 g.ships.forEach(e=>{ if(e.esc&&!e.dead){ const se=AC.torpSL-TL(dist(e,O))-nlE(e); if(se>0) { e.st=e.st==='hunt'?'hunt':'alert'; setDatum(e,O.x,O.y); e.pingT=10; } } });
 if(g.ships.some(e=>e.esc&&!e.dead&&e.st==='alert')) say('La escolta ha oído el lanzamiento y va hacia el punto de disparo.','The escort heard the launch and is heading for the firing point.','bad');
 return {ok:true,id:tp.id,err:tp.err}; }
function nlE(e){ return psum(AC.amb,45+30*lg(Math.max(e.v,1)))-AC.eDiHull+AC.eDt; }
function torpStep(dt){ const g=G, O=g.own;
 g.torps.forEach(tp=>{ if(tp.done) return;
  /* el cable se rompe solo por maniobra del jugador: velocidad propia > 12 nudos con el cable conectado */
  if(tp.wire&&O.v>12){ tp.wire=false; say('Cable del torpedo '+tp.id+' roto: has superado 12 nudos.','Torpedo '+tp.id+' wire broken: you went above 12 knots.','bad'); }
  let cmd=tp.c;
  if(tp.lock){ const s=tp.lock; const ip=intercept(s.x,s.y,Math.sin(s.c*D2R)*s.v*KN,Math.cos(s.c*D2R)*s.v*KN,tp.x,tp.y,tp.v*KN); const tx=ip?ip.x:s.x, ty=ip?ip.y:s.y; cmd=brgOf(tx-tp.x,ty-tp.y); }
  else if(tp.wire&&!tp.passed){ const so=solOf(tp.st,O); const ip=intercept(so.x,so.y,so.vx,so.vy,tp.x,tp.y,tp.v*KN); if(ip){ cmd=n360(brgOf(ip.x-tp.x,ip.y-tp.y)+tp.off); tp.togo=Math.hypot(ip.x-tp.x,ip.y-tp.y); tp.aim=ip; if(tp.togo<60){ tp.passed=true; } } }
  else if(tp.wire&&tp.passed){ cmd=n360(tp.c+0); tp.togo=0; }
  else if(tp.aim){ tp.togo=Math.max(0,(tp.togo||0)-tp.v*KN*dt); }
  turnTo(tp,cmd,TORP.turn*dt); moveObj(tp,dt); tp.run+=tp.v*KN*dt; if(g.t%5===0) tp.trk.push([tp.x,tp.y]);
  if(!tp.seek&&!tp.lock&&tp.togo!=null&&tp.togo<=tp.act){ activateSeeker(tp,'auto'); }
  if(tp.seek&&!tp.lock){ /* con cable, la computadora le pasa al buscador la posición prevista del blanco y elige el eco más cercano a ella; sin cable, el más cercano al torpedo */
   const pp=tp.wire?solOf(tp.st,O):null; let best=null,bd=1e9; g.ships.forEach(s=>{ if(s.dead) return; const r=dist(s,tp); const a=Math.abs(dAng(brgOf(s.x-tp.x,s.y-tp.y),tp.c)); const sc=pp?Math.hypot(s.x-pp.x,s.y-pp.y):r; if(r<=TORP.seek&&a<=TORP.cone&&(!pp||sc<=TORP.gate)&&sc<bd){ bd=sc; best=s; } });
   if(best){ tp.lock=best; say('Torpedo '+tp.id+': blanco adquirido.','Torpedo '+tp.id+': target acquired.'); } }
  if(tp.lock&&dist(tp.lock,tp)<25){ hit(tp,tp.lock); return; }
  if(tp.run>=TORP.range){ tp.done=true; tp.res='fuel'; tp.wire=false; say('Torpedo '+tp.id+' sin combustible: fallo.','Torpedo '+tp.id+' out of fuel: miss.','bad'); }
 });
}
function activateSeeker(tp,how){ if(tp.seek||tp.done) return; tp.seek=true; tp.seekAt=tp.togo; say('Torpedo '+tp.id+': buscador activo'+(tp.togo!=null?' a '+ni(tp.togo)+' m del punto previsto':'')+'.','Torpedo '+tp.id+': seeker active'+(tp.togo!=null?' '+ni(tp.togo)+' m from the predicted point':'')+'.');
 /* los pings del buscador los oye la escolta, que ordena al convoy virar 60° alejándose (tras 30 s) */
 const g=G; g.ships.forEach(e=>{ if(e.esc&&!e.dead&&dist(e,tp)<AC.maxA){ g.ships.forEach(s=>{ if(!s.esc&&!s.dead&&s.k==='merc'&&!s.evade&&dist(s,tp)>TORP.seek){ const away=brgOf(s.x-tp.x,s.y-tp.y); const side=dAng(away,s.c)>=0?1:-1; s.evadeAt=g.t+30; s.evadeC=n360(s.c+60*side); } }); } });
}
function hit(tp,s){ const g=G; tp.done=true; tp.wire=false; tp.res=s.tgt?'hit':'neutral'; tp.hitId=s.id; tp.hitT=g.t; s.dead=true; g.boom={t:g.t,b:brgOf(s.x-g.own.x,s.y-g.own.y),x:s.x,y:s.y};
 if(s.tgt){ g.hits++; if(!g.firstHit) g.firstHit=g.t; say('Impacto en '+(s.cid||'el blanco')+': blanco detenido.','Hit on '+(s.cid||'the target')+': target stopped.','good'); }
 else { g.neutral++; say('Impacto en un buque no designado ('+L(SHIPS[s.k].n[0],SHIPS[s.k].n[1])+'): penalización.','Hit on a non-designated ship: penalty.','bad'); }
 g.ships.forEach(e=>{ if(e.esc&&!e.dead&&e.st!=='hunt'){ e.st='alert'; setDatum(e,tp.lx,tp.ly); e.pingT=10; } });
}

function endGame(why){ const g=G; if(g.over) return; g.over=why; g.tEnd=g.t; stopLoop(); const sc=score(); g.sc=sc;
 const B=bests(); const k=g.pt.id+'|'+g.mode+'|'+g.sub.id+(g.seed!==g.pt.seed?'|'+g.seed:''); g.newBest=false; if(!B[k]||sc.total>B[k]){ B[k]=sc.total; g.newBest=true; saveBests(B); } g.best=B[k];
 if(APP) setTimeout(debrief,10); }
function score(){ const g=G; const avg=g.noiseN?g.noiseSum/g.noiseN:0; let pts=0; const items=[];
 const add=(es,en,v)=>{ items.push([es,en,Math.round(v)]); pts+=v; };
 add('Impactos en blancos designados','Hits on designated targets',g.hits*1000);
 g.shots.forEach(tp=>{ if(tp.res==='hit'){ const e=tp.err; add('Precisión de la solución (torpedo '+tp.id+')','Solution accuracy (torpedo '+tp.id+')',Math.max(0,300-Math.abs(e.dr)*10-Math.abs(e.dc)*5-Math.abs(e.dv)*20)); } });
 const miss=g.shots.filter(tp=>tp.res&&tp.res!=='hit').length+g.shots.filter(tp=>!tp.res).length; if(miss) add('Torpedos fallados','Torpedoes missed',-150*miss);
 if(g.neutral) add('Impactos en buques no designados','Hits on non-designated ships',-800*g.neutral);
 if(g.detN) add('Veces detectado','Times detected',-120*g.detN);
 const np=Math.max(0,avg-(g.sub.sl4+8))*25; if(np) add('Ruido medio alto','High average noise',-np);
 if(g.hits&&g.over!=='fixed') add('Rapidez','Speed',Math.max(0,(g.lim-g.t)/g.lim*400));
 if(g.over==='escaped') add('Evasión completada','Evasion completed',500);
 if(g.over==='fixed') add('La escolta te fijó','The escort pinned you',-600);
 let total=Math.max(0,pts); if(g.mode==='veterano'){ items.push(['Multiplicador Veterano ×1,5','Veteran multiplier ×1.5',Math.round(total*0.5)]); total*=1.5; }
 total=Math.round(total);
 const R=[[2600,'Comandante de élite','Elite commander'],[1900,'Capitán de fragata','Commander'],[1300,'Capitán de corbeta','Lieutenant commander'],[700,'Teniente de navío','Lieutenant'],[300,'Alférez de navío','Sub-lieutenant'],[0,'Guardiamarina','Midshipman']];
 const rk=R.find(r=>total>=r[0]); return {items:items,total:total,rank:[rk[1],rk[2]],avg:avg,peak:g.noisePeak}; }
function bests(){ try{ return JSON.parse(localStorage.getItem('mat_sub_best')||'{}'); }catch(e){ return {}; } }
function saveBests(b){ try{ localStorage.setItem('mat_sub_best',JSON.stringify(b)); }catch(e){} }
function loadCfg(){ let c={mode:'facil',sub:'t209',patrol:'p1',seed:null}; try{ Object.assign(c,JSON.parse(localStorage.getItem('mat_sub_cfg')||'{}')); }catch(e){} c.seed=null; return c; }
function saveCfg(){ try{ localStorage.setItem('mat_sub_cfg',JSON.stringify({mode:CFG.mode,sub:CFG.sub,patrol:CFG.patrol})); }catch(e){} }

/* ===== Interfaz ===== */
let APP=null,X=null,CFG=null,RAF=0,LAST=0,ACC=0,SPEED=10,PAUSED=false,TAB='sonar',LASTDRAW=0,LASTUI=0,SIG='';
const CL={bg:'#0b0c0a',s1:'#12140f',line:'#2a2e24',tx:'#efeee6',mu:'#a3a796',lime:'#c8f03c',ol:'#8f9a6a',red:'#e0533d',amb:'#e8b040',cy:'#7fd3c4'};
function css(){ if(document.getElementById('sb-css')) return; const s=document.createElement('style'); s.id='sb-css';
 s.textContent=[
 '.sbw{max-width:1280px;margin:0 auto;padding-bottom:40px}',
 '.sbhero{position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);margin:10px 0 14px;background:#000}',
 '.sbhero img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;filter:saturate(.75) brightness(.6)}',
 '@media(min-width:800px){.sbhero img{aspect-ratio:21/8}}',
 '.sbhero .ht{position:absolute;left:0;right:0;bottom:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,0,.88))}',
 '.sbhero .ht b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(34px,8vw,58px);letter-spacing:.03em;line-height:1}',
 '.sbhero .ht span{color:#d6d8d2;font-size:15px;display:block;margin-top:6px;max-width:640px}',
 '.sbsec{margin:16px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98}',
 '.sbgr{display:grid;grid-template-columns:1fr;gap:8px}',
 '@media(min-width:640px){.sbgr.c2{grid-template-columns:repeat(2,1fr)}}',
 '.sbopt{display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);color:var(--tx);padding:12px 14px;font:inherit;cursor:pointer;min-height:48px}',
 '.sbopt b{display:block;font-size:16px;margin-bottom:2px}',
 '.sbopt span{display:block;font-size:13.5px;color:#bfc2b8;line-height:1.35}',
 '.sbopt span.sbest{display:inline-block;font-size:11px;color:#cfd0b8}',
 '.sbopt.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac) inset;background:#1a1d14}',
 '.sbrow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}',
 '.sbbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:44px;min-width:44px;padding:8px 12px;border-radius:var(--r);border:1px solid var(--line);background:#181b14;color:var(--tx);font:inherit;font-size:14.5px;font-weight:600;cursor:pointer;touch-action:manipulation;-webkit-user-select:none;user-select:none}',
 '.sbbtn.pri{background:var(--ac);border-color:var(--ac);color:#0b0c0d;font-weight:700}',
 '.sbbtn.fire{background:#b8432f;border-color:#d0563f;color:#fff;letter-spacing:.06em;min-height:52px;font-size:16px;flex:1 1 100%}',
 '.sbbtn.on{background:#2a3220;border-color:var(--ac);color:#eaf6c0}',
 '.sbbtn:disabled{opacity:.4;cursor:default}',
 '.sbbtn.sm{min-height:40px;padding:6px 10px;font-size:14px}',
 '.sbest{display:inline-block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;border:1px solid #6b6d58;color:#cfd0b8;border-radius:4px;padding:0 5px;margin-left:5px;vertical-align:1px}',
 '.sbdet{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);margin:12px 0;padding:0 14px}',
 '.sbdet summary{cursor:pointer;padding:12px 0;font-weight:700;min-height:24px}',
 '.sbdet p,.sbdet li{font-size:14.5px;line-height:1.5;color:#d4d6cc}',
 '.sbtop{position:sticky;top:0;z-index:5;background:rgba(11,12,10,.97);border-bottom:1px solid var(--line);padding:6px 0;margin:0 0 8px}',
 '.sbtop .r1{display:flex;align-items:center;gap:6px;flex-wrap:wrap}',
 '.sbclk{font-family:ui-monospace,Menlo,monospace;font-size:15px;color:#e8eadf;min-width:68px}',
 '.sbseg{display:inline-flex;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}',
 '.sbseg button{min-height:40px;min-width:36px;padding:6px 6px;border:0;background:transparent;color:var(--tx);font:inherit;font-size:14px;cursor:pointer}',
 '.sbseg button.on{background:var(--ac);color:#0b0c0d;font-weight:700}',
 '.sbmini{display:flex;gap:10px;flex-wrap:wrap;font-size:13.5px;color:#c9ccbf;margin-top:6px;font-variant-numeric:tabular-nums}',
 '.sbmini b{color:#eef0e4;font-weight:650}',
 '.sbrisk{display:inline-block;padding:1px 8px;border-radius:10px;font-weight:700;font-size:12.5px;letter-spacing:.04em}',
 '.sbrisk.lo{background:#23301a;color:#c8f03c}.sbrisk.me{background:#3a3214;color:#e8b040}.sbrisk.hi{background:#3d1a14;color:#ff8a70}',
 '.sbtabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:6px 0 0}',
 '.sbtabs button{min-height:42px;border:1px solid var(--line);border-radius:6px;background:var(--s1);color:#a3a796;font:inherit;font-size:13px;font-weight:700;letter-spacing:.08em;cursor:pointer}',
 '.sbtabs button.on{border-color:var(--ol,#8f9a6a);color:#c8f03c;background:#22281a}',
 '.sbpan{display:none;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px;min-width:0}',
 '.sbpan.on{display:block}',
 '.sbpan h3{margin:0 0 8px;font-size:12.5px;letter-spacing:.1em;text-transform:uppercase;color:#a8ad98;font-weight:700}',
 '.sbcv{display:block;width:100%;border-radius:6px;background:#060705;touch-action:manipulation}',
 '.sbc{display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:6px;background:#0f110c;color:var(--tx);font:inherit;padding:8px 10px;margin:6px 0 0;cursor:pointer;min-height:44px}',
 '.sbc.on{border-color:var(--ac);background:#1a1d14}',
 '.sbc .a{font-weight:700}.sbc .b{display:block;font-size:13px;color:#bfc2b8;margin-top:2px;font-variant-numeric:tabular-nums}',
 '.sbtag{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-radius:4px;padding:1px 6px;margin-left:6px;vertical-align:1px}',
 '.sbtag.t{background:#3a3214;color:#e8b040}.sbtag.n{background:#1e2a2a;color:#7fd3c4}.sbtag.e{background:#3d1a14;color:#ff8a70}',
 '.sbkv{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;font-size:14px;font-variant-numeric:tabular-nums;margin:6px 0}',
 '.sbkv dt{color:#a3a796}.sbkv dd{margin:0;color:#eef0e4;font-weight:600}',
 '.sbnote{font-size:13.5px;color:#bfc2b8;line-height:1.45;margin:6px 0}',
 '.sbgauge{height:10px;border-radius:5px;background:linear-gradient(90deg,#3f6b1f,#c8a030 55%,#c0432f);position:relative;margin:8px 0 4px}',
 '.sbgauge i{position:absolute;top:-4px;width:4px;height:18px;background:#fff;border-radius:2px;margin-left:-2px}',
 '.sblog{border:1px solid var(--line);border-radius:var(--r);background:#0f110c;padding:6px 10px;margin:8px 0;font-size:13.5px;line-height:1.45;min-height:84px}',
 '.sblog div{color:#cfd2c6}.sblog .good{color:#c8f03c}.sblog .bad{color:#ff9a80}.sblog span{color:#80846f;font-family:ui-monospace,Menlo,monospace;margin-right:6px}',
 '.sbctl{display:grid;grid-template-columns:1fr;gap:10px}',
 '.sbctl .lab{font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98;margin-bottom:4px}',
 '.sbctl .val{font-size:22px;font-weight:700;font-variant-numeric:tabular-nums;color:#eef0e4;margin-bottom:4px}',
 '.sbctl .val small{font-size:13px;color:#a3a796;font-weight:500;margin-left:6px}',
 '@media(min-width:1000px){.sbtabs{display:none}.sbgrid{display:grid;grid-template-columns:1.1fr 1fr;gap:10px;align-items:start}.sbpan{display:block}.sbctl{grid-template-columns:1fr 1fr}}',
 '.sbtbl{width:100%;border-collapse:collapse;font-size:14.5px;font-variant-numeric:tabular-nums}',
 '.sbtbl td{padding:6px 4px;border-bottom:1px solid #20241b}.sbtbl td:last-child{text-align:right;font-weight:650}',
 '.sbbig{font-family:Anton,Impact,sans-serif;font-size:clamp(30px,7vw,46px);letter-spacing:.03em;line-height:1.05;margin:6px 0}',
 '.sbbig.good{color:#c8f03c}.sbbig.bad{color:#ff8a70}'
 ].join('\n'); document.head.appendChild(s); }
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF=0; }
function hhmmss(t){ t=Math.round(t); const h=Math.floor(t/3600), m=Math.floor(t/60)%60, s=t%60; return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'); }
const opt=(on,attr,b,s)=>'<button type="button" class="sbopt'+(on?' on':'')+'" '+attr+'><b>'+b+'</b><span>'+s+'</span></button>';
function crumbs(){ return X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Submarino','Submarine')]]); }

function intro(){ stopLoop(); G=null; const B=bests(); const sub=SUBS.find(s=>s.id===CFG.sub)||SUBS[0];
 let h='<div class="sbw" data-noi18n>'+crumbs()+
 '<div class="sbhero"><img src="img/juegos/submarino.webp" width="640" height="400" alt="'+esc(L(CARD_ALT[0],CARD_ALT[1]))+'"><div class="ht"><b>'+L('SUBMARINO','SUBMARINE')+'</b><span>'+L('No ves nada: solo oyes. Escucha con el sonar, calcula a qué distancia y rumbo va el blanco, lanza un torpedo filoguiado y escapa de la escolta.','You see nothing: you only listen. Track with sonar, work out the target’s range and course, fire a wire-guided torpedo and slip away from the escort.')+'</span></div></div>';
 h+='<div class="sbsec">'+L('Modo','Mode')+'</div><div class="sbgr c2">'+
  opt(CFG.mode==='facil','data-m="facil"',L('Fácil','Easy'),L('La computadora de tiro calcula la solución cuando tienes datos suficientes y guía el torpedo sola.','The fire-control computer works out the solution once you have enough data and guides the torpedo itself.'))+
  opt(CFG.mode==='veterano','data-m="veterano"',L('Veterano','Veteran'),L('Pones tú el punto de distancia, el rumbo y la velocidad sobre el plot. La calidad de tu solución solo se ve tras disparar.','You place the range dot, course and speed on the plot yourself. Your solution’s quality is shown only after firing.'))+'</div>';
 h+='<div class="sbsec">'+L('Submarino','Submarine')+'</div><div class="sbgr c2">'+SUBS.map(s=>opt(CFG.sub===s.id,'data-s="'+s.id+'"',esc(s.n),esc(L(s.note[0],s.note[1]))+'<br>'+L('Máx.','Max')+' '+nf(s.vmax,1)+' '+L('nudos','kn')+' · '+L('prueba','test')+' '+ni(s.test)+' m · '+s.tubes+' '+L('tubos','tubes')+'<br>'+L('Ruido a 4 nudos','Noise at 4 kn')+' '+s.sl4+' dB · '+L('cavita desde','cavitates from')+' '+nf(vcav(s,50),1)+' '+L('nudos a 50 m','kn at 50 m')+' '+EST())).join('')+'</div>';
 h+='<p class="sbnote">'+L('Fichas','Entries')+': '+SUBS.map(s=>'<a href="#/a/'+s.ficha+'">'+esc(s.n)+'</a>').join(' · ')+'</p>';
 h+='<div class="sbsec">'+L('Patrulla','Patrol')+'</div><div class="sbgr c2">'+PATROLS.map(p=>{ const k=p.id+'|'+CFG.mode+'|'+CFG.sub; const b=B[k]; return opt(CFG.patrol===p.id,'data-p="'+p.id+'"',esc(L(p.n[0],p.n[1])),esc(L(p.d[0],p.d[1]))+'<br>'+L('Capa térmica a','Thermal layer at')+' '+p.layer+' m · '+L('semilla','seed')+' '+p.seed+(b!=null?' · '+L('Tu récord','Your best')+': '+ni(b):'')); }).join('')+'</div>';
 h+='<div class="sbrow" style="margin-top:14px"><button type="button" class="sbbtn pri" data-go style="flex:1 1 100%;min-height:52px;font-size:17px">'+L('Empezar patrulla','Start patrol')+'</button></div>';
 h+=howItWorks();
 h+='</div>';
 X.set(h,L('Submarino','Submarine'));
 const root=APP.querySelector('.sbw');
 root.addEventListener('click',ev=>{ const b=ev.target.closest('button'); if(!b) return;
  if(b.dataset.m){ CFG.mode=b.dataset.m; saveCfg(); intro(); }
  else if(b.dataset.s){ CFG.sub=b.dataset.s; saveCfg(); intro(); }
  else if(b.dataset.p){ CFG.patrol=b.dataset.p; saveCfg(); intro(); }
  else if(b.hasAttribute('data-go')){ start(); }
 });
}
const CARD_ALT=['El submarino S-81 «Isaac Peral» atracado en Cartagena, 2023','The submarine S-81 Isaac Peral alongside in Cartagena, 2023'];
function howItWorks(){ const E=EST();
 return '<details class="sbdet"><summary>'+L('Cómo funciona (sonar, TMA, capa térmica) y fuentes','How it works (sonar, TMA, thermal layer) and sources')+'</summary>'+
 '<p><b>'+L('Sonar pasivo.','Passive sonar.')+'</b> '+L('Oyes un buque si su señal supera tu ruido: exceso de señal = nivel de fuente − pérdida de propagación − (ruido − índice de directividad). Si sale positivo, aparece en la cascada (demora en horizontal, tiempo hacia abajo). Es la ecuación del sonar de Urick.','You hear a ship when its signal beats your noise: signal excess = source level − transmission loss − (noise − directivity index). If it is positive, it shows on the waterfall (bearing across, time down). This is Urick’s sonar equation.')+'</p>'+
 '<p>'+L('Pérdida de propagación: 20·log₁₀(distancia) + absorción 0,06 dB/km (dispersión esférica, una simplificación conservadora).','Transmission loss: 20·log₁₀(range) + 0.06 dB/km absorption (spherical spreading, a conservative simplification).')+' '+L('Niveles de fuente a ~1 kHz: mercante 140 dB a 12 nudos, fragata 128 dB a 14, pesquero 128 dB a 8; suben 50·log(v/vref).','Source levels at ~1 kHz: merchant 140 dB at 12 kn, frigate 128 dB at 14, fishing boat 128 dB at 8; they rise 50·log(v/vref).')+E+' '+L('Tu propio ruido sube con la velocidad (40 + 30·log v sobre un ambiente de 60 dB) y te deja más sordo.','Your own noise rises with speed (40 + 30·log v over 60 dB ambient) and makes you deafer.')+E+' '+L('No oyes por la popa (zona ciega de ±30°).','You cannot hear astern (±30° baffles).')+'</p>'+
 '<p><b>'+L('Tu ruido y la cavitación.','Your noise and cavitation.')+'</b> '+L('Tu nivel radiado sube 40·log(v/4) y salta +15 dB cuando la hélice cavita. La velocidad de cavitación sube con la profundidad, con la raíz de la presión: v = v₀·√(1 + prof/10). Por eso a 50 m cavitas antes que a 200 m. «Silencio» quita 6 dB de maquinaria auxiliar.','Your radiated level rises 40·log(v/4) and jumps +15 dB when the propeller cavitates. Cavitation speed grows with depth, with the square root of pressure: v = v₀·√(1 + depth/10). So at 50 m you cavitate sooner than at 200 m. «Silent» removes 6 dB of auxiliary machinery.')+E+'</p>'+
 '<p><b>'+L('La capa térmica.','The thermal layer.')+'</b> '+L('Bajo la capa el sonido se dobla y deja una zona de sombra: entre un lado y otro de la capa se pierden 15 dB en pasivo y 30 dB por trayecto en activo. Debajo te oyen peor… y tú también oyes peor a los buques.','Below the layer sound bends away and leaves a shadow zone: across it you lose 15 dB on passive and 30 dB each way on active. Below it they hear you worse… and you hear the ships worse too.')+E+'</p>'+
 '<p><b>'+L('TMA (análisis del movimiento del blanco).','TMA (target motion analysis).')+'</b> '+L('El pasivo solo da la demora. Con un rumbo fijo, muchas soluciones encajan con las mismas demoras; si haces un segundo tramo con otro rumbo (≥ 30°), solo una encaja. Por eso hay que maniobrar. En Fácil, la computadora resuelve las demoras por mínimos cuadrados (estimador pseudolineal). En Veterano pones tú un punto de distancia sobre una demora, el rumbo y la velocidad, y compruebas que tu derrota cruza todas las demoras. La velocidad sale también de las palas: rpm ÷ rpm por nudo.','Passive gives only the bearing. On one steady course, many solutions fit the same bearings; run a second leg on another course (≥ 30°) and only one fits. That is why you must manoeuvre. In Easy, the computer solves the bearings by least squares (pseudo-linear estimator). In Veteran you place a range dot on a bearing, plus course and speed, and check that your track crosses every bearing. Speed also comes from the blades: rpm ÷ rpm per knot.')+'</p>'+
 '<p>'+L('Palas por clase','Blades by class')+': '+L('mercante 5 palas, 8 rpm/nudo; fragata 5 palas, 10 rpm/nudo; pesquero 4 palas, 35 rpm/nudo.','merchant 5 blades, 8 rpm/kn; frigate 5 blades, 10 rpm/kn; fishing boat 4 blades, 35 rpm/kn.')+E+'</p>'+
 '<p><b>'+L('Torpedo pesado filoguiado.','Wire-guided heavyweight torpedo.')+'</b> '+L('50 nudos y 40 km de recorrido, guiado por cable hacia el punto de interceptación de tu solución. El buscador se activa a la distancia que elijas del punto previsto (1.200 m por defecto) y adquiere lo que haya a menos de 1.500 m dentro de ±30°. Sin buscador activo no detona. El cable se rompe si superas 12 nudos.','50 knots and 40 km run, wire-guided to your solution’s intercept point. The seeker switches on at the distance you choose from the predicted point (1,200 m by default) and acquires whatever is within 1,500 m inside ±30°. Without an active seeker it does not detonate. The wire breaks if you go above 12 knots.')+E+' '+L('Si activas el buscador lejos, la escolta lo oye y el convoy vira 60°.','Switch the seeker on far out and the escort hears it and the convoy turns 60°.')+'</p>'+
 '<p><b>'+L('La escolta.','The escort.')+'</b> '+L('Solo sabe lo que oye: tu ruido frente a su sensor (sonar remolcado a ≤ 10 nudos, de casco más rápido), la distancia y la capa; 20 s seguidos por encima de su umbral y te detecta. Al oír un lanzamiento va al punto de disparo y busca en activo (220 dB, alcance directo 12 km). Bajo la capa sus ecos casi no llegan. Si te mantiene en contacto tres pings seguidos a menos de 2 km, te ha fijado.','It knows only what it hears: your noise against its sensor (towed array at ≤ 10 kn, hull sonar when faster), range and the layer; 20 s in a row above its threshold and it detects you. When it hears a launch it heads to the firing point and searches on active (220 dB, 12 km direct path). Below the layer its echoes barely return. Three pings in a row in contact within 2 km and it has pinned you.')+E+'</p>'+
 '<p><b>'+L('Sin azar.','No luck.')+'</b> '+L('No hay tiradas de dados: ni pérdidas de blanco al azar ni roturas de cable aleatorias. Si la solución es correcta y guías bien el torpedo, impacta siempre. Solo fallas por un error tuyo: mala solución, buscador demasiado pronto o tarde, o fuera de alcance. La escolta también es determinista: te encuentra o no según tu ruido, tu profundidad y la distancia.','No dice rolls: no random lock losses, no random wire breaks. If the solution is right and you guide the torpedo well, it always hits. You only miss through your own error: a bad solution, the seeker too early or too late, or out of range. The escort is deterministic too: it finds you or not by your noise, your depth and the range.')+'</p>'+
 '<p><b>'+L('Fuentes','Sources')+'</b></p><ul>'+
 '<li>R. J. Urick, «Principles of Underwater Sound», 3.ª ed. (1983): '+L('ecuación del sonar, pérdida de propagación, capa y zona de sombra, intensidad de blanco de un submarino (10–25 dB).','sonar equation, transmission loss, layer and shadow zone, submarine target strength (10–25 dB).')+'</li>'+
 '<li>D. H. Wagner, W. C. Mylander, T. J. Sanders, «Naval Operations Analysis», 3.ª ed. (Naval Institute Press, 1999): '+L('detección, búsqueda y datum.','detection, search and datum.')+'</li>'+
 '<li>D. Ross, «Mechanics of Underwater Noise» (1976): '+L('ruido radiado de buques y cavitación con la profundidad.','ship radiated noise and cavitation with depth.')+'</li>'+
 '<li>'+L('S. C. Nardone, A. G. Lindgren, K. F. Gong, «Fundamental properties and performance of conventional bearings-only target motion analysis», IEEE Trans. Automatic Control 29(9), 1984; y el manual público de la Marina de EE. UU. «Fundamentals of Naval Weapons Systems» (cap. de sonar y TMA).','S. C. Nardone, A. G. Lindgren, K. F. Gong, «Fundamental properties and performance of conventional bearings-only target motion analysis», IEEE Trans. Automatic Control 29(9), 1984; and the public U.S. Navy text «Fundamentals of Naval Weapons Systems» (sonar and TMA chapters).')+'</li>'+
 '<li>'+L('Submarinos: fichas de M.A.T del Tipo 209 y del S-80 Plus (Wikipedia). Torpedo: cifras públicas de los torpedos pesados de 533 mm (Wikipedia: DM2A4, Mk 48), redondeadas.','Submarines: M.A.T entries for the Type 209 and S-80 Plus (Wikipedia). Torpedo: public figures for 533 mm heavyweight torpedoes (Wikipedia: DM2A4, Mk 48), rounded.')+E+'</li></ul>'+
 '<p class="sbnote">'+L('Todo lo marcado «Estimación» son valores redondos de M.A.T para el juego, no datos oficiales de ningún buque.','Everything marked «Estimate» is a round M.A.T value for the game, not official data for any ship.')+'</p></details>';
}
function start(){ G=newGame(CFG); TAB='sonar'; PAUSED=false; SPEED=10; game(); }
function game(){ const g=G; SIG='';
 const tabs=[['sonar','SONAR'],['tma','TMA'],['armas',L('ARMAS','WEAPONS')],['mando',L('MANDO','CONN')]];
 let h='<div class="sbw" data-noi18n>'+crumbs()+
 '<div class="sbtop"><div class="r1"><span class="sbclk" id="sbclk">00:00:00</span><div class="sbseg" id="sbspd">'+[1,5,10,30].map(v=>'<button type="button" data-spd="'+v+'"'+(v===SPEED?' class="on"':'')+'>×'+v+'</button>').join('')+'</div>'+
 '<button type="button" class="sbbtn sm" data-pause style="padding:6px 8px;min-width:0">'+L('Pausa','Pause')+'</button><button type="button" class="sbbtn sm" data-end style="margin-left:auto;padding:6px 8px;min-width:0">'+L('Terminar','End')+'</button></div>'+
 '<div class="sbmini" id="sbmini"></div>'+
 '<div class="sbtabs">'+tabs.map(t=>'<button type="button" data-tab="'+t[0]+'"'+(t[0]===TAB?' class="on"':'')+'>'+t[1]+'</button>').join('')+'</div></div>'+
 '<div class="sbgrid">'+
 '<section class="sbpan'+(TAB==='sonar'?' on':'')+'" data-pan="sonar"><h3>'+L('Sonar pasivo · cascada','Passive sonar · waterfall')+'</h3><canvas class="sbcv" id="sbwf" height="300"></canvas><div id="sbcon"></div></section>'+
 '<section class="sbpan'+(TAB==='tma'?' on':'')+'" data-pan="tma"><h3>'+L('TMA · plot','TMA · plot')+' <span id="sbtmasel"></span></h3><canvas class="sbcv" id="sbplot" height="330"></canvas><div id="sbtma"></div><div id="sbtmactl"></div></section>'+
 '<section class="sbpan'+(TAB==='armas'?' on':'')+'" data-pan="armas"><h3>'+L('Armas · torpedo pesado filoguiado','Weapons · wire-guided heavyweight torpedo')+'</h3><div id="sbfc"></div><div id="sbfctl"></div><div id="sbtorp"></div></section>'+
 '<section class="sbpan'+(TAB==='mando'?' on':'')+'" data-pan="mando"><h3>'+L('Mando · rumbo, profundidad, velocidad','Conn · course, depth, speed')+'</h3>'+ctlHTML()+'<div id="sbrisk"></div></section>'+
 '</div><div class="sblog" id="sblog"></div>'+
 '<p class="sbnote">'+L('Consejo: haz un tramo de 4–5 min, cambia el rumbo 40–90° y haz otro. Antes de disparar, piensa por dónde vas a escapar.','Tip: run a 4–5 min leg, change course 40–90° and run another. Before you fire, plan your escape.')+'</p>'+howItWorks()+'</div>';
 X.set(h,L('Submarino','Submarine'));
 const root=APP.querySelector('.sbw'); root.addEventListener('click',onClick);
 const pc=document.getElementById('sbplot'); pc.addEventListener('click',onPlotTap);
 if(!g.over){ LAST=0; ACC=0; RAF=requestAnimationFrame(loop); }
 ui(true); draw(); }
function ctlHTML(){ const g=G; const sub=g.sub;
 const b=(attr,txt,cls)=>'<button type="button" class="sbbtn sm'+(cls?' '+cls:'')+'" '+attr+'>'+txt+'</button>';
 return '<div class="sbctl">'+
 '<div><div class="lab">'+L('Rumbo ordenado','Ordered course')+'</div><div class="val" id="sbvc"></div><div class="sbrow">'+b('data-dc="-10"','−10°')+b('data-dc="-1"','−1°')+b('data-dc="1"','+1°')+b('data-dc="10"','+10°')+b('data-dc="90"','+90°')+b('data-dc="-90"','−90°')+'</div></div>'+
 '<div><div class="lab">'+L('Profundidad ordenada','Ordered depth')+'</div><div class="val" id="sbvd"></div><div class="sbrow">'+[30,50,100,150,200,300].map(d=>b('data-dd="'+d+'"',d+' m')).join('')+b('data-ddr="-10"','−10')+b('data-ddr="10"','+10')+'</div></div>'+
 '<div><div class="lab">'+L('Velocidad ordenada','Ordered speed')+'</div><div class="val" id="sbvv"></div><div class="sbrow">'+[2,4,6,8,12,16].map(v=>b('data-dv="'+v+'"',v+' kn')).join('')+b('data-dv="'+sub.vmax+'"',L('Máx.','Max'))+'</div></div>'+
 '<div><div class="lab">'+L('Silencio','Silent running')+'</div><div class="sbrow">'+b('data-sil','',' ')+'</div><p class="sbnote">'+L('Apaga bombas y ventilación: −6 dB.','Shuts down pumps and fans: −6 dB.')+EST()+'</p></div>'+
 '</div>'; }
function loop(ts){ RAF=requestAnimationFrame(loop); if(!G||G.over){ stopLoop(); return; }
 if(!LAST) LAST=ts; const dt=Math.min(0.25,(ts-LAST)/1000); LAST=ts;
 if(!PAUSED){ ACC+=dt*SPEED; let n=0; while(ACC>=1&&n<400){ step(); ACC-=1; n++; if(G.over) break; } }
 if(G.over) return;
 if(ts-LASTDRAW>120){ LASTDRAW=ts; draw(); } if(ts-LASTUI>300){ LASTUI=ts; ui(); } }
function selS(){ return G.cont.find(s=>s.cid===G.sel)||null; }
function cls(s){ return s.cid&&G.t-s.t0>=60; }
function shipName(s){ return cls(s)?L(SHIPS[s.k].n[0],SHIPS[s.k].n[1]):L('Sin clasificar','Unclassified'); }
function ui(force){ const g=G; if(!g||!document.getElementById('sbclk')) return; const O=g.own;
 document.getElementById('sbclk').textContent=hhmmss(g.t);
 const rk=riskRanges(g.sub,O.v,O.d,O.sil,g.layer); const lvl=rk.pas>3000||rk.cav?'hi':rk.pas>600?'me':'lo';
 document.getElementById('sbmini').innerHTML='<span>'+L('Prof','Depth')+' <b>'+Math.round(O.d)+' m</b></span><span>'+L('Vel','Spd')+' <b>'+nf(O.v,1)+' kn</b></span><span>'+L('Rumbo','Crs')+' <b>'+p3(O.c)+'°</b></span><span>'+L('Ruido','Noise')+' <b>'+Math.round(rk.sl)+' dB</b></span><span class="sbrisk '+lvl+'">'+(lvl==='hi'?L('RIESGO ALTO','HIGH RISK'):lvl==='me'?L('RIESGO MEDIO','MED RISK'):L('RIESGO BAJO','LOW RISK'))+'</span>'+(O.d>=g.layer?'<span>'+L('bajo la capa','below layer')+'</span>':'')+(O.sil?'<span>'+L('silencio','silent')+'</span>':'');
 document.getElementById('sbvc').innerHTML=p3(O.oc)+'°<small>'+L('actual','now')+' '+p3(O.c)+'°</small>';
 document.getElementById('sbvd').innerHTML=Math.round(O.od)+' m<small>'+L('actual','now')+' '+Math.round(O.d)+' m · '+L('capa a','layer at')+' '+g.layer+' m</small>';
 document.getElementById('sbvv').innerHTML=nf(O.ov,1)+' kn<small>'+L('actual','now')+' '+nf(O.v,1)+' kn</small>';
 const sb=APP.querySelector('[data-sil]'); if(sb){ sb.textContent=O.sil?L('Silencio: ACTIVADO','Silent: ON'):L('Silencio: desactivado','Silent: off'); sb.classList.toggle('on',O.sil); }
 APP.querySelectorAll('[data-pause]').forEach(b=>{ b.textContent=PAUSED?L('Seguir','Resume'):L('Pausa','Pause'); b.classList.toggle('on',PAUSED); });
 /* riesgo */
 const pos=clamp(lg(Math.max(rk.pas,50)/50)/lg(20000/50)*100,0,100);
 document.getElementById('sbrisk').innerHTML='<div class="lab" style="font-size:12.5px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98;margin-top:12px">'+L('Riesgo de detección','Detection risk')+'</div><div class="sbgauge"><i style="left:'+pos.toFixed(1)+'%"></i></div>'+
  '<dl class="sbkv"><dt>'+L('Ruido radiado','Radiated noise')+'</dt><dd>'+Math.round(rk.sl)+' dB'+(rk.cav?' · <span style="color:#ff8a70">'+L('CAVITANDO','CAVITATING')+'</span>':'')+'</dd>'+
  '<dt>'+L('Cavitas a partir de','You cavitate above')+'</dt><dd>'+nf(vcav(g.sub,O.d),1)+' kn '+L('a','at')+' '+Math.round(O.d)+' m</dd>'+
  '<dt>'+L('Te oiría en pasivo','Passive hears you at')+'</dt><dd>≈ '+(rk.pas<1000?Math.round(rk.pas/10)*10+' m':nf(rk.pas/1000,1)+' km')+'</dd>'+
  '<dt>'+L('Su sonar activo','Its active sonar')+'</dt><dd>≈ '+(rk.act<1000?Math.round(rk.act/10)*10+' m':nf(rk.act/1000,1)+' km')+'</dd>'+
  '<dt>'+L('Capa térmica','Thermal layer')+'</dt><dd>'+g.layer+' m · '+(O.d>=g.layer?L('estás DEBAJO','you are BELOW'):L('estás ENCIMA','you are ABOVE'))+'</dd></dl>'+
  '<p class="sbnote">'+L('Referencia: una fragata escuchando a 8 nudos con sonar remolcado, por encima de la capa.','Reference: a frigate listening at 8 kn with a towed array, above the layer.')+EST()+'</p>';
 /* contactos */
 const sig=g.cont.map(s=>s.cid+(s.det||s.ping?1:0)+(cls(s)?1:0)+(s.dead?1:0)).join(',')+'|'+g.sel;
 const con=document.getElementById('sbcon');
 if(sig!==SIG||force){ SIG=sig; con.innerHTML=g.cont.length?g.cont.map(s=>'<button type="button" class="sbc'+(s.cid===g.sel?' on':'')+'" data-sel="'+s.cid+'"><span class="a">'+s.cid+' · '+esc(shipName(s))+'</span>'+(s.tgt&&cls(s)?'<span class="sbtag t">'+L('blanco designado','designated target')+'</span>':'')+(s.k==='fish'&&cls(s)?'<span class="sbtag n">'+L('neutral','neutral')+'</span>':'')+(s.esc&&cls(s)?'<span class="sbtag e">'+L('escolta','escort')+'</span>':'')+'<span class="b" id="sbcb-'+s.cid+'"></span></button>').join(''):'<p class="sbnote">'+L('Sin contactos todavía. Escucha: a menos velocidad oyes más lejos.','No contacts yet. Listen: the slower you go, the farther you hear.')+'</p>'; }
 g.cont.forEach(s=>{ const el=document.getElementById('sbcb-'+s.cid); if(!el) return; const T_=SHIPS[s.k]; const on=s.det||s.ping;
  let t=(on?p3(s.brg)+'°':L('perdido','lost')+(s.brgs.length?' · '+L('última','last')+' '+p3(s.brgs[s.brgs.length-1].b)+'°':''))+(on&&s.det?' · '+L('señal','signal')+' '+(s.se>=0?'+':'')+Math.round(s.se)+' dB':'')+(s.ping?' · <b style="color:#ff8a70">'+L('TRANSMITE EN ACTIVO','PINGING')+'</b>':'');
  if(cls(s)&&s.det){ const rpm=T_.tpk*s.v; t+=' · '+T_.bl+' '+L('palas','blades')+' · '+nf(rpm,1)+' rpm ('+nf(rpm*T_.bl/60,1)+' Hz)'; }
  if(s.dead) t+=' · '+L('detenido','stopped');
  if(s.baf) t+=' · '+L('en la zona ciega de popa','in the stern baffles');
  el.innerHTML=t; });
 tmaUI(force); fcUI(force);
 document.getElementById('sblog').innerHTML=g.log.slice(-5).reverse().map(m=>'<div class="'+m.k+'"><span>'+hhmmss(m.t)+'</span>'+esc(EN()?m.en:m.es)+'</div>').join('')||'<div>'+L('Patrulla en curso. Velocidad del tiempo ×10 por defecto.','Patrol under way. Time runs ×10 by default.')+'</div>';
}

function manOf(s){ if(!G.man[s.cid]){ const n=s.brgs.length; G.man[s.cid]={k:Math.max(0,n-1),R:8000,C:n360(Math.round((s.brgs.length?s.brgs[n-1].b:0)+90)),V:10}; } return G.man[s.cid]; }
function tmaUI(force){ const g=G, s=selS(); const sel=document.getElementById('sbtmasel'); sel.textContent=s?'· '+s.cid+' '+shipName(s):'';
 const box=document.getElementById('sbtma'), ctl=document.getElementById('sbtmactl');
 if(!s){ box.innerHTML='<p class="sbnote">'+L('Elige un contacto en la lista del sonar.','Pick a contact in the sonar list.')+'</p>'; ctl.innerHTML=''; ctl.dataset.sig=''; return; }
 const nb=s.brgs.length;
 if(g.mode==='facil'){ const so=autoSolution(s); ctl.innerHTML=''; ctl.dataset.sig='';
  if(so.ok) box.innerHTML='<dl class="sbkv"><dt>'+L('Solución','Solution')+'</dt><dd>'+L('calidad','quality')+' '+(so.q==='alta'?L('alta','high'):L('media','medium'))+'</dd><dt>'+L('Distancia','Range')+'</dt><dd>'+ni(so.r)+' m</dd><dt>'+L('Demora','Bearing')+'</dt><dd>'+p3(so.b)+'°</dd><dt>'+L('Rumbo del blanco','Target course')+'</dt><dd>'+p3(so.c)+'°</dd><dt>'+L('Velocidad','Speed')+'</dt><dd>'+nf(so.v,1)+' kn</dd><dt>'+L('Demoras usadas','Bearings used')+'</dt><dd>'+Math.min(nb,61)+'</dd></dl>';
  else { const why={nodata:L('Sin demoras de este contacto.','No bearings on this contact.'),few:L('Pocas demoras','Too few bearings')+' ('+(so.n||0)+'/8). '+L('Sigue escuchando.','Keep listening.'),span:L('Hacen falta al menos 4 minutos de demoras.','At least 4 minutes of bearings are needed.'),geom:L('Las demoras aún encajan con muchas soluciones: cambia de rumbo 40–90° y haz un segundo tramo de 4–5 min.','The bearings still fit many solutions: change course 40–90° and run a second 4–5 min leg.')}[so.why];
   box.innerHTML='<p class="sbnote"><b>'+L('Computadora de tiro','Fire control')+':</b> '+why+'</p>'; }
  return; }
 /* Veterano: punto de distancia + rumbo + velocidad a mano */
 if(!nb){ box.innerHTML='<p class="sbnote">'+L('Aún no hay demoras de este contacto.','No bearings on this contact yet.')+'</p>'; ctl.innerHTML=''; ctl.dataset.sig=''; return; }
 const m=manOf(s); m.k=clamp(m.k,0,nb-1); const q=s.brgs[m.k]; const so=manualSolution(s); const T_=SHIPS[s.k];
 let aid=''; if(cls(s)) aid='<p class="sbnote">'+L('Palas','Blades')+': '+(s.det?nf(T_.tpk*s.v,1)+' rpm':'—')+' ÷ '+T_.tpk+' rpm/'+L('nudo','kn')+EST()+(s.det?' = '+nf(s.v,1)+' kn':'')+'</p>';
 box.innerHTML='<dl class="sbkv"><dt>'+L('Punto sobre la demora','Dot on bearing')+'</dt><dd>nº '+(m.k+1)+'/'+nb+' · '+hhmmss(q.t)+' · '+p3(q.b)+'°</dd><dt>'+L('Distancia del punto','Dot range')+'</dt><dd>'+ni(m.R)+' m</dd><dt>'+L('Rumbo del blanco','Target course')+'</dt><dd>'+p3(m.C)+'°</dd><dt>'+L('Velocidad','Speed')+'</dt><dd>'+nf(m.V,1)+' kn</dd>'+(so?'<dt>'+L('Ahora (tu solución)','Now (your solution)')+'</dt><dd>'+ni(so.r)+' m · '+p3(so.b)+'°</dd>':'')+'</dl>'+aid+
  '<p class="sbnote">'+L('Ajusta hasta que las marcas de tu derrota caigan sobre todas las demoras. Toca el plot para mover el punto a lo largo de la demora elegida. La calidad real solo se ve después de disparar.','Adjust until your track ticks sit on every bearing line. Tap the plot to slide the dot along the chosen bearing. The real quality is shown only after firing.')+'</p>';
 if(ctl.dataset.sig!=='v'+s.cid){ ctl.dataset.sig='v'+s.cid; const b=(a,t)=>'<button type="button" class="sbbtn sm" '+a+'>'+t+'</button>';
  ctl.innerHTML='<div class="sbrow"><span class="sbnote" style="min-width:86px">'+L('Demora','Bearing')+'</span>'+b('data-mk="-10"','−10')+b('data-mk="-1"','−1')+b('data-mk="1"','+1')+b('data-mk="999"',L('Última','Last'))+'</div>'+
  '<div class="sbrow"><span class="sbnote" style="min-width:86px">'+L('Distancia','Range')+'</span>'+b('data-mr="-1000"','−1000')+b('data-mr="-100"','−100')+b('data-mr="-10"','−10')+b('data-mr="10"','+10')+b('data-mr="100"','+100')+b('data-mr="1000"','+1000')+'</div>'+
  '<div class="sbrow"><span class="sbnote" style="min-width:86px">'+L('Rumbo','Course')+'</span>'+b('data-mc="-10"','−10°')+b('data-mc="-1"','−1°')+b('data-mc="1"','+1°')+b('data-mc="10"','+10°')+'</div>'+
  '<div class="sbrow"><span class="sbnote" style="min-width:86px">'+L('Velocidad','Speed')+'</span>'+b('data-mv="-1"','−1')+b('data-mv="-0.1"','−0,1')+b('data-mv="0.1"','+0,1')+b('data-mv="1"','+1')+'</div>'; }
}
function fcUI(force){ const g=G, s=selS(); const box=document.getElementById('sbfc'), ctl=document.getElementById('sbfctl'), tb=document.getElementById('sbtorp'); const O=g.own;
 let h='<dl class="sbkv"><dt>'+L('Tubos cargados','Tubes loaded')+'</dt><dd>'+g.tubes+' / '+g.sub.load+'</dd><dt>'+L('Blanco','Target')+'</dt><dd>'+(s?s.cid+' · '+esc(shipName(s)):'—')+'</dd>';
 let can=false, why='';
 if(s){ const so=curSolution(s);
  if(!s.tgt&&cls(s)) why=L('Reglas del ejercicio: solo blancos designados.','Exercise rules: designated targets only.');
  else if(!cls(s)) why=L('Clasifica primero el contacto (1 min de escucha).','Classify the contact first (1 min of listening).');
  else if(!so||!so.ok) why=g.mode==='facil'?L('Sin solución todavía: mira el TMA.','No solution yet: check the TMA.'):L('Pon tu solución en el TMA.','Set your solution on the TMA.');
  else { const ip=intercept(so.x,so.y,so.vx,so.vy,O.x,O.y,TORP.v*KN); can=g.tubes>0;
   h+='<dt>'+L('Solución','Solution')+'</dt><dd>'+ni(so.r)+' m · '+p3(so.c)+'° · '+nf(so.v,1)+' kn</dd>';
   if(ip){ const run=Math.hypot(ip.x-O.x,ip.y-O.y); h+='<dt>'+L('Rumbo del torpedo','Torpedo course')+'</dt><dd>'+p3(brgOf(ip.x-O.x,ip.y-O.y))+'°</dd><dt>'+L('Recorrido previsto','Predicted run')+'</dt><dd>'+ni(run)+' m · '+hhmmss(ip.t)+(run>TORP.range?' · <span style="color:#ff8a70">'+L('FUERA DE ALCANCE','OUT OF RANGE')+'</span>':'')+'</dd>'; }
   if(g.tubes<=0){ can=false; why=L('No quedan torpedos.','No torpedoes left.'); } } }
 h+='<dt>'+L('Buscador se activa a','Seeker switches on at')+'</dt><dd>'+ni(g.mode==='facil'?1200:(g.actSet!=null?g.actSet:1200))+' m '+L('del punto previsto','from the predicted point')+'</dd></dl>';
 if(why) h+='<p class="sbnote">'+why+'</p>';
 if(O.v>12) h+='<p class="sbnote" style="color:#e8b040">'+L('A más de 12 nudos el cable se rompe.','Above 12 knots the wire breaks.')+'</p>';
 box.innerHTML=h;
 const csig='c'+g.mode;
 if(ctl.dataset.sig!==csig){ ctl.dataset.sig=csig; ctl.innerHTML='<div class="sbrow">'+(g.mode==='veterano'?'<span class="sbnote">'+L('Activación','Enable')+'</span><button type="button" class="sbbtn sm" data-act="-250">−250 m</button><button type="button" class="sbbtn sm" data-act="250">+250 m</button>':'')+'<button type="button" class="sbbtn fire" data-fire>'+L('LANZAR TORPEDO','FIRE TORPEDO')+'</button></div>'; }
 const fb=ctl.querySelector('[data-fire]'); if(fb) fb.disabled=!can;
 const live=g.torps; const tsig=live.map(t=>t.id+(t.done?'d':'')+(t.seek?'s':'')+(t.wire?'w':'')).join(',');
 if(tb.dataset.sig!==tsig){ tb.dataset.sig=tsig; tb.innerHTML=live.map(t=>'<div class="sbc" style="cursor:default"><span class="a">'+L('Torpedo','Torpedo')+' '+t.id+' → '+t.cid+'</span><span class="b" id="sbtp-'+t.id+'"></span>'+(!t.done?'<div class="sbrow">'+(!t.seek?'<button type="button" class="sbbtn sm" data-seek="'+t.id+'">'+L('Activar buscador','Seeker on')+'</button>':'')+(t.wire?'<button type="button" class="sbbtn sm" data-wire="'+t.id+'" data-w="-5">'+L('Cable','Wire')+' ◀ 5°</button><button type="button" class="sbbtn sm" data-wire="'+t.id+'" data-w="5">5° ▶</button>':'')+'</div>':'')+'</div>').join(''); }
 live.forEach(t=>{ const el=document.getElementById('sbtp-'+t.id); if(!el) return;
  const st=t.res==='hit'?L('IMPACTO','HIT'):t.res==='neutral'?L('impacto en un no designado','hit a non-designated ship'):t.res==='fuel'?L('fallo: sin combustible','miss: out of fuel'):t.lock?L('blanco adquirido','target acquired'):t.seek?L('buscador activo, buscando','seeker active, searching'):t.wire?L('guiado por cable','wire-guided'):L('autónomo','autonomous');
  el.innerHTML=st+' · '+L('recorrido','run')+' '+nf(t.run/1000,1)+'/'+(TORP.range/1000)+' km'+(t.togo!=null&&!t.done&&!t.lock?' · '+L('al punto previsto','to predicted point')+' '+ni(t.togo)+' m':'')+(t.off?' · '+L('corrección','offset')+' '+(t.off>0?'+':'')+t.off+'°':''); });
}
function onClick(ev){ const b=ev.target.closest('button'); if(!b||!G) return; const g=G, O=g.own, d=b.dataset;
 if(d.tab){ TAB=d.tab; APP.querySelectorAll('.sbtabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===TAB)); APP.querySelectorAll('.sbpan').forEach(p=>p.classList.toggle('on',p.dataset.pan===TAB)); draw(); try{ const tp=APP.querySelector('.sbtop'), pn=APP.querySelector('.sbpan.on'); if(tp&&pn){ const y=pn.getBoundingClientRect().top; const hb=tp.getBoundingClientRect().bottom; if(y<hb) window.scrollBy(0,y-hb-6); } }catch(e){} return; }
 if(d.spd){ SPEED=+d.spd; APP.querySelectorAll('[data-spd]').forEach(x=>x.classList.toggle('on',+x.dataset.spd===SPEED)); return; }
 if(b.hasAttribute('data-pause')){ PAUSED=!PAUSED; ui(); return; }
 if(b.hasAttribute('data-end')){ endGame('quit'); return; }
 if(g.over) return;
 if(d.dc){ O.oc=n360(O.oc+(+d.dc)); }
 else if(d.dd){ O.od=clamp(+d.dd,20,MAXDEP); }
 else if(d.ddr){ O.od=clamp(O.od+(+d.ddr),20,MAXDEP); }
 else if(d.dv){ O.ov=clamp(+d.dv,0,g.sub.vmax); }
 else if(b.hasAttribute('data-sil')){ O.sil=!O.sil; }
 else if(d.sel){ g.sel=d.sel; }
 else if(d.mk||d.mr||d.mc||d.mv){ const s=selS(); if(!s) return; const m=manOf(s); const n=s.brgs.length;
  if(d.mk){ m.k=+d.mk===999?n-1:clamp(m.k+(+d.mk),0,n-1); } if(d.mr) m.R=clamp(m.R+(+d.mr),100,60000); if(d.mc) m.C=n360(m.C+(+d.mc)); if(d.mv) m.V=clamp(Math.round((m.V+(+d.mv))*10)/10,0,40); }
 else if(d.act){ g.actSet=clamp((g.actSet!=null?g.actSet:1200)+(+d.act),0,6000); }
 else if(b.hasAttribute('data-fire')){ fire(selS()); }
 else if(d.seek){ const t=g.torps.find(x=>x.id===+d.seek); if(t) activateSeeker(t,'man'); }
 else if(d.wire){ const t=g.torps.find(x=>x.id===+d.wire); if(t&&t.wire) t.off=clamp(t.off+(+d.w),-60,60); }
 ui(true); draw(); }
let PLOTV=null;
function onPlotTap(ev){ const g=G; if(!g||g.mode!=='veterano'||!PLOTV) return; const s=selS(); if(!s||!s.brgs.length) return; const r=ev.currentTarget.getBoundingClientRect();
 const px=ev.clientX-r.left, py=ev.clientY-r.top; const wx=PLOTV.x0+(px-PLOTV.ox)/PLOTV.k, wy=PLOTV.y0-(py-PLOTV.oy)/PLOTV.k;
 const m=manOf(s); const q=s.brgs[m.k]; const R=(wx-q.ox)*Math.sin(q.b*D2R)+(wy-q.oy)*Math.cos(q.b*D2R); m.R=clamp(Math.round(R/10)*10,100,60000); ui(true); draw(); }
function sizeCv(cv,h){ const w=Math.max(200,cv.clientWidth||cv.parentNode.clientWidth||300); const dpr=Math.min(2,window.devicePixelRatio||1); if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){ cv.width=Math.round(w*dpr); cv.height=Math.round(h*dpr); cv.style.height=h+'px'; } const c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); return {c:c,w:w,h:h}; }
let WFC=null;
function draw(){ const g=G; if(!g) return; const wide=window.innerWidth>=1000;
 const wf=document.getElementById('sbwf'); if(wf&&(wide||TAB==='sonar')) drawWF(wf,wide?380:300);
 const pl=document.getElementById('sbplot'); if(pl&&(wide||TAB==='tma')) drawPlot(pl,wide?420:340,false); }
function drawWF(cv,H){ const g=G,O=g.own; const {c,w,h}=sizeCv(cv,H); const top=22, NR=150;
 c.fillStyle='#060705'; c.fillRect(0,0,w,h);
 if(!WFC){ WFC=document.createElement('canvas'); WFC.width=180; WFC.height=NR; }
 const wc=WFC.getContext('2d'); const img=wc.createImageData(180,NR); const D=img.data;
 for(let r=0;r<NR;r++){ const row=g.wf[g.wf.length-1-r]; for(let i=0;i<180;i++){ const v=row?row[i]:0.08+0.16*hsh(i,-r*10-7); const k=(r*180+i)*4; const q=Math.pow(clamp(v,0,1),1.25), o=clamp(v-1,0,1);
  D[k]=Math.min(255,q*110+o*210); D[k+1]=Math.min(255,q*232+10); D[k+2]=Math.min(255,q*58+8+o*120); D[k+3]=255; } }
 wc.putImageData(img,0,0); c.imageSmoothingEnabled=true; c.drawImage(WFC,0,0,180,NR,0,top,w,h-top);
 const bx=b=>n360(b)/360*w;
 /* zona ciega de popa */
 const st=n360(O.c+180); c.fillStyle='rgba(120,60,40,.18)'; const a1=n360(st-30), a2=n360(st+30); if(a1<a2) c.fillRect(bx(a1),top,bx(a2)-bx(a1),h-top); else { c.fillRect(bx(a1),top,w-bx(a1),h-top); c.fillRect(0,top,bx(a2),h-top); }
 c.fillStyle='#0b0c0a'; c.fillRect(0,0,w,top); c.font='600 11px system-ui,sans-serif'; c.textAlign='center'; c.fillStyle='#8f9a6a';
 for(let b=0;b<360;b+=45){ const x=bx(b); c.fillRect(x,top-5,1,5); c.fillText(p3(b),clamp(x,14,w-14),12); }
 c.fillStyle='#c8f03c'; const hx=bx(O.c); c.beginPath(); c.moveTo(hx,top); c.lineTo(hx-5,top-7); c.lineTo(hx+5,top-7); c.fill();
 c.font='700 12px system-ui,sans-serif'; g.cont.forEach(s=>{ if(!(s.det||s.ping)) return; const x=bx(s.brg); c.fillStyle=s.ping?'#ff8a70':(s.cid===g.sel?'#e8b040':'#eef0e4'); c.fillText(s.cid,clamp(x,12,w-12),top+14); });
 c.textAlign='left'; c.fillStyle='rgba(11,12,10,.75)'; c.fillRect(4,h-20,170,16); c.fillStyle='#a3a796'; c.font='500 11px system-ui,sans-serif'; c.fillText(L('demora →  ·  tiempo ↓ (25 min)','bearing →  ·  time ↓ (25 min)'),8,h-8); }
function drawPlot(cv,H,recon){ const g=G,O=g.own; const {c,w,h}=sizeCv(cv,H); const s=recon?null:selS();
 c.fillStyle='#060705'; c.fillRect(0,0,w,h);
 const pts=[[O.x,O.y]].concat(g.otrk); let so=null; if(s){ so=curSolution(s); if(so&&so.ok){ pts.push([so.x,so.y]); } }
 g.torps.forEach(t=>t.trk.forEach(p=>pts.push(p)));
 if(recon) g.ships.forEach(sh=>(g.trk[sh.id]||[]).forEach(p=>pts.push(p)));
 let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; pts.forEach(p=>{ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); });
 const cx=(x0+x1)/2, cy=(y0+y1)/2; let span=Math.max(x1-x0,(y1-y0)*w/h,12000)*1.15; const k=w/span; const ox=w/2, oy=h/2;
 PLOTV={x0:cx,y0:cy,k:k,ox:ox,oy:oy}; const P=(x,y)=>[ox+(x-cx)*k,oy-(y-cy)*k];
 /* rejilla 2 km */
 const gs=span>40000?10000:span>20000?5000:2000; c.strokeStyle='#1a1d16'; c.lineWidth=1; c.beginPath();
 for(let gx=Math.floor((cx-span)/gs)*gs;gx<cx+span;gx+=gs){ const p=P(gx,0); c.moveTo(p[0],0); c.lineTo(p[0],h); }
 for(let gy=Math.floor((cy-span)/gs)*gs;gy<cy+span;gy+=gs){ const p=P(0,gy); c.moveTo(0,p[1]); c.lineTo(w,p[1]); } c.stroke();
 c.fillStyle='#80846f'; c.font='500 11px system-ui,sans-serif'; c.fillText(L('cuadrícula','grid')+' '+gs/1000+' km · N ↑',8,h-8);
 if(s&&s.brgs.length){ const L2=span*1.5; const n=s.brgs.length; const from=Math.max(0,n-60); c.lineWidth=1;
  for(let i=from;i<n;i++){ const q=s.brgs[i]; const a=P(q.ox,q.oy), b=P(q.ox+Math.sin(q.b*D2R)*L2,q.oy+Math.cos(q.b*D2R)*L2); c.strokeStyle=(g.mode==='veterano'&&g.man[s.cid]&&g.man[s.cid].k===i)?'rgba(232,176,64,.9)':'rgba(143,154,106,'+(0.25+0.5*(i-from)/(n-from))+')'; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); }
  if(so&&so.ok){ const st=so.st; c.strokeStyle='#e8b040'; c.lineWidth=2; const t0=s.brgs[from].t, t1=g.t+600; const a=P(st.x+st.vx*(t0-st.t),st.y+st.vy*(t0-st.t)), b=P(st.x+st.vx*(t1-st.t),st.y+st.vy*(t1-st.t)); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();
   c.fillStyle='#e8b040'; for(let i=from;i<n;i+=Math.max(1,Math.floor((n-from)/12))){ const q=s.brgs[i]; const p=P(st.x+st.vx*(q.t-st.t),st.y+st.vy*(q.t-st.t)); c.fillRect(p[0]-2,p[1]-2,4,4); }
   const pn=P(so.x,so.y); c.beginPath(); c.arc(pn[0],pn[1],5,0,7); c.fill(); c.font='700 12px system-ui,sans-serif'; { const lb=s.cid+(g.mode==='facil'?'':' ('+L('tu solución','your solution')+')'); const tw=c.measureText(lb).width; c.fillText(lb,clamp(pn[0]+8,4,w-tw-4),clamp(pn[1]-6,14,h-20)); }
   if(g.mode==='veterano'){ const m=g.man[s.cid]; const q=s.brgs[m.k]; const pd=P(q.ox+Math.sin(q.b*D2R)*m.R,q.oy+Math.cos(q.b*D2R)*m.R); c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(pd[0],pd[1],7,0,7); c.stroke(); } } }
 if(recon){ g.ships.forEach(sh=>{ const tr=g.trk[sh.id]||[]; if(tr.length<2) return; c.strokeStyle=sh.tgt?'#e8b040':sh.esc?'#ff8a70':'#7fd3c4'; c.lineWidth=1.6; c.beginPath(); tr.forEach((p,i)=>{ const q=P(p[0],p[1]); i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke(); const e=P(tr[tr.length-1][0],tr[tr.length-1][1]); c.fillStyle=c.strokeStyle; c.font='700 12px system-ui,sans-serif'; c.fillText((sh.cid||'')+' '+L(SHIPS[sh.k].n[0],SHIPS[sh.k].n[1]),e[0]+6,e[1]-4); });
  g.shots.forEach(tp=>{ const st=tp.st; const a=P(st.x,st.y), b=P(st.x+st.vx*600,st.y+st.vy*600); c.setLineDash([5,4]); c.strokeStyle='rgba(232,176,64,.8)'; c.lineWidth=1.5; c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke(); c.setLineDash([]); }); }
 c.strokeStyle='#7fd3c4'; c.lineWidth=1.6; g.torps.forEach(t=>{ if(!t.trk.length) return; c.beginPath(); t.trk.forEach((p,i)=>{ const q=P(p[0],p[1]); i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); const e=P(t.x,t.y); c.lineTo(e[0],e[1]); c.stroke();
  if(t.res==='hit'||t.res==='neutral'){ c.fillStyle=t.res==='hit'?'#c8f03c':'#ff8a70'; c.font='700 13px system-ui,sans-serif'; c.beginPath(); c.arc(e[0],e[1],7,0,7); c.fill(); { const lb=t.res==='hit'?L('IMPACTO','HIT'):L('NO DESIGNADO','NON-DESIGNATED'); const tw=c.measureText(lb).width; c.fillText(lb,clamp(e[0]+10,4,w-tw-4),clamp(e[1]+4,14,h-20)); } }
  else if(!t.done){ c.fillStyle='#7fd3c4'; c.fillRect(e[0]-3,e[1]-3,6,6); if(t.seek){ c.strokeStyle='rgba(127,211,196,.5)'; c.beginPath(); c.moveTo(e[0],e[1]); c.arc(e[0],e[1],TORP.seek*k,(t.c-90-TORP.cone)*D2R,(t.c-90+TORP.cone)*D2R); c.closePath(); c.stroke(); c.strokeStyle='#7fd3c4'; } } });
 c.strokeStyle='#c8f03c'; c.lineWidth=2; c.beginPath(); g.otrk.concat([[O.x,O.y]]).forEach((p,i)=>{ const q=P(p[0],p[1]); i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]); }); c.stroke();
 const me=P(O.x,O.y); c.save(); c.translate(me[0],me[1]); c.rotate(O.c*D2R); c.fillStyle='#c8f03c'; c.beginPath(); c.moveTo(0,-9); c.lineTo(6,7); c.lineTo(-6,7); c.closePath(); c.fill(); c.restore(); }
function debrief(){ const g=G; if(!APP||!g) return; const sc=g.sc;
 const tt={escaped:[L('MISIÓN CUMPLIDA','MISSION COMPLETE'),'good',L('Blanco alcanzado y la escolta te ha perdido.','Target hit and the escort has lost you.')],fixed:[L('TE HAN FIJADO','PINNED'),'bad',L('La escolta te mantuvo en contacto a menos de 2 km: en combate real lanzaría sus armas.','The escort held you within 2 km: in real combat it would launch its weapons.')],time:[L('TIEMPO AGOTADO','TIME UP'),'bad',L('Se acabó el tiempo de la patrulla.','The patrol time ran out.')],quit:[L('PATRULLA TERMINADA','PATROL ENDED'),g.hits?'good':'bad',L('Has terminado la patrulla.','You ended the patrol.')]}[g.over];
 let h='<div class="sbw" data-noi18n>'+crumbs()+'<div class="sbbig '+tt[1]+'">'+tt[0]+'</div><p class="sbnote" style="font-size:15px">'+tt[2]+'</p>';
 h+='<div class="sbpan on"><h3>'+L('Informe','Debrief')+' · '+esc(L(g.pt.n[0],g.pt.n[1]))+' · '+esc(g.sub.n)+' · '+(g.mode==='facil'?L('Fácil','Easy'):L('Veterano','Veteran'))+'</h3><table class="sbtbl">'+
 '<tr><td>'+L('Tiempo de patrulla','Patrol time')+'</td><td>'+hhmmss(g.tEnd)+'</td></tr>'+
 '<tr><td>'+L('Torpedos lanzados / impactos','Torpedoes fired / hits')+'</td><td>'+g.fired+' / '+g.hits+(g.neutral?' (+'+g.neutral+' '+L('no designado','non-designated')+')':'')+'</td></tr>'+
 g.shots.map(tp=>'<tr><td>'+L('Error de la solución, torpedo','Solution error, torpedo')+' '+tp.id+' ('+(tp.res==='hit'?L('impacto','hit'):tp.res==='neutral'?L('no designado','non-designated'):L('fallo','miss'))+')</td><td>'+L('dist.','range')+' '+(tp.err.dr>=0?'+':'')+nf(tp.err.dr,1)+' % · '+L('rumbo','course')+' '+(tp.err.dc>=0?'+':'')+nf(tp.err.dc,1)+'° · '+L('vel.','speed')+' '+(tp.err.dv>=0?'+':'')+nf(tp.err.dv,1)+' kn'+(tp.seekAt!=null?' · '+L('buscador a','seeker at')+' '+ni(tp.seekAt)+' m':'')+'</td></tr>').join('')+
 '<tr><td>'+L('Ruido medio / pico','Average / peak noise')+'</td><td>'+Math.round(sc.avg)+' / '+Math.round(sc.peak)+' dB</td></tr>'+
 '<tr><td>'+L('Veces detectado','Times detected')+'</td><td>'+g.detN+'</td></tr></table>'+
 '<h3 style="margin-top:14px">'+L('Puntuación','Score')+'</h3><table class="sbtbl">'+sc.items.map(it=>'<tr><td>'+esc(L(it[0],it[1]))+'</td><td>'+(it[2]>0?'+':'')+ni(it[2])+'</td></tr>').join('')+
 '<tr><td><b>'+L('Total','Total')+'</b></td><td><b>'+ni(sc.total)+'</b></td></tr><tr><td>'+L('Rango','Rank')+'</td><td>'+esc(L(sc.rank[0],sc.rank[1]))+'</td></tr><tr><td>'+L('Tu récord en esta patrulla','Your best on this patrol')+'</td><td>'+ni(g.best)+(g.newBest?' · '+L('¡nuevo!','new!'):'')+'</td></tr></table></div>';
 h+='<div class="sbpan on" style="margin-top:10px"><h3>'+L('Reconstrucción: derrotas reales (color) y tu solución al disparar (discontinua)','Reconstruction: true tracks (colour) and your solution at firing (dashed)')+'</h3><canvas class="sbcv" id="sbrec" height="360"></canvas></div>';
 h+='<div class="sbrow" style="margin-top:12px"><button type="button" class="sbbtn pri" data-again>'+L('Repetir patrulla','Replay patrol')+'</button><button type="button" class="sbbtn" data-menu>'+L('Cambiar patrulla','Change patrol')+'</button></div></div>';
 X.set(h,L('Submarino','Submarine'));
 const root=APP.querySelector('.sbw'); root.addEventListener('click',ev=>{ const b=ev.target.closest('button'); if(!b) return; if(b.hasAttribute('data-again')) start(); else if(b.hasAttribute('data-menu')) intro(); });
 drawPlot(document.getElementById('sbrec'),360,true); try{ window.scrollTo(0,0); }catch(e){} }

export function route(app,x){ APP=app; X=x; css(); CFG=loadCfg(); stopLoop();
 const q=(location.hash.split('?')[1]||''); q.split('&').forEach(kv=>{ const [k,v]=kv.split('='); if(k==='m'&&(v==='facil'||v==='veterano')) CFG.mode=v; if(k==='s'&&SUBS.some(s=>s.id===v)) CFG.sub=v; if(k==='p'&&PATROLS.some(p=>p.id===v)) CFG.patrol=v; });
 intro(); }
if(typeof window!=='undefined'){ window.addEventListener('hashchange',()=>{ if(!/^#\/submarino/.test(location.hash)) stopLoop(); });
/* para QA automática */
window.MAT_SUB={G:()=>G,cfg:o=>{ Object.assign(CFG,o||{}); return CFG; },start:()=>{ start(); return G; },
 orders:o=>{ const O=G.own; if(o.c!=null) O.oc=n360(o.c); if(o.d!=null) O.od=clamp(o.d,20,MAXDEP); if(o.v!=null) O.ov=clamp(o.v,0,G.sub.vmax); if(o.sil!=null) O.sil=!!o.sil; },
 run:(sec,until)=>{ for(let i=0;i<sec&&!G.over;i++){ step(); if(until&&until(G)) break; } if(!G.over){ ui(true); draw(); } return G.t; },
 sel:cid=>{ G.sel=cid; ui(true); draw(); },auto:cid=>{ const s=G.cont.find(x=>x.cid===cid); return autoSolution(s); },
 manual:(cid,m)=>{ const s=G.cont.find(x=>x.cid===cid); G.man[cid]=Object.assign(manOf(s),m); return manualSolution(s); },
 ple:cid=>{ const s=G.cont.find(x=>x.cid===cid); const br=s.brgs.filter(q=>q.t>=G.t-1200); const a=ple(br,0); return a?solOf(a,G.own):null; },
 fire:(cid,o)=>{ const s=G.cont.find(x=>x.cid===cid); return fire(s,o); },seeker:id=>{ const t=G.torps.find(x=>x.id===id); if(t) activateSeeker(t,'man'); },
 wire:(id,d)=>{ const t=G.torps.find(x=>x.id===id); if(t) t.off=d; },actSet:v=>{ G.actSet=v; },end:w=>endGame(w||'quit'),
 contacts:()=>G.cont.map(s=>({cid:s.cid,k:s.k,tgt:s.tgt,esc:!!s.esc,det:s.det,n:s.brgs.length,brg:s.brg,cls:cls(s)})),
 truth:cid=>{ const s=G.cont.find(x=>x.cid===cid); const O=G.own; return {r:dist(s,O),b:brgOf(s.x-O.x,s.y-O.y),c:s.c,v:s.v,x:s.x,y:s.y}; },
 esc:()=>G.ships.filter(s=>s.esc).map(e=>({st:e.st,r:dist(e,G.own),v:e.v})),risk:()=>{ const O=G.own; return riskRanges(G.sub,O.v,O.d,O.sil,G.layer); },
 debrief:()=>debrief(),tab:t=>{ TAB=t; APP.querySelectorAll('.sbtabs button').forEach(x=>x.classList.toggle('on',x.dataset.tab===TAB)); APP.querySelectorAll('.sbpan').forEach(p=>p.classList.toggle('on',p.dataset.pan===TAB)); draw(); },
 pause:p=>{ PAUSED=!!p; }};
}
