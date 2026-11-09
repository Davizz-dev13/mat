/* M.A.T — «Francotirador» (#/francotirador): tiro de precisión a larga distancia contra placas de acero.
   Sin personas: solo placas y gongs de acero en un campo de tiro.
   La web simula balística exterior real (masa puntual con tablas G1/G7, atmósfera, viento por tramos, deriva por giro,
   Coriolis/Eötvös, régimen transónico). El jugador hace lo que hace un tirador: medir, leer el viento y girar las torretas.
   Datos de cartuchos con fuente (Hornady, Sierra, Lapua, Litz/Applied Ballistics) y fusiles de las fichas de M.A.T.
   Lo que no tiene fuente publicada va marcado «Estimación». */
const EN=()=>window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const nf=(v,d)=>{ d=d==null?1:d; const s=(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d); return EN()?s:s.replace('.',','); };
const ni=v=>{ const s=String(Math.round(v)); return EN()?s.replace(/\B(?=(\d{3})+(?!\d))/g,','):s.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); };
const nfs=(v,d)=>(v<0&&Math.abs(v)>=0.5*Math.pow(10,-(d==null?1:d))?'−':'')+nf(Math.abs(v),d);
const EST=()=>'<span class="frest">'+L('Estimación','Estimate')+'</span>';
let RND=Math.random;
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function gauss(){ let u=0,v=0; while(u===0)u=RND(); while(v===0)v=RND(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
const rr=(a,b)=>a+(b-a)*RND();

/* ===== Balística exterior: modelo de masa puntual (3 GDL) con tablas de arrastre G1/G7 =====
   Ecuaciones: McCoy, Modern Exterior Ballistics (1999), cap. 5 y 7; Litz, Applied Ballistics for Long-Range Shooting (3.ª ed.).
   Tablas G1 y G7 (Cd frente a Mach) del Ballistic Research Laboratory, tal como las publica py-ballisticcalc (LGPL). */
const G1T=[0,0.2629,0.05,0.2558,0.1,0.2487,0.15,0.2413,0.2,0.2344,0.25,0.2278,0.3,0.2214,0.35,0.2155,0.4,0.2104,0.45,0.2061,0.5,0.2032,0.55,0.202,0.6,0.2034,0.7,0.2165,0.725,0.223,0.75,0.2313,0.775,0.2417,0.8,0.2546,0.825,0.2706,0.85,0.2901,0.875,0.3136,0.9,0.3415,0.925,0.3734,0.95,0.4084,0.975,0.4448,1,0.4805,1.025,0.5136,1.05,0.5427,1.075,0.5677,1.1,0.5883,1.125,0.6053,1.15,0.6191,1.2,0.6393,1.25,0.6518,1.3,0.6589,1.35,0.6621,1.4,0.6625,1.45,0.6607,1.5,0.6573,1.55,0.6528,1.6,0.6474,1.65,0.6413,1.7,0.6347,1.75,0.628,1.8,0.621,1.85,0.6141,1.9,0.6072,1.95,0.6003,2,0.5934,2.05,0.5867,2.1,0.5804,2.15,0.5743,2.2,0.5685,2.25,0.563,2.3,0.5577,2.35,0.5527,2.4,0.5481,2.45,0.5438,2.5,0.5397,2.6,0.5325,2.7,0.5264,2.8,0.5211,2.9,0.5168,3,0.5133,3.1,0.5105,3.2,0.5084,3.3,0.5067,3.4,0.5054,3.5,0.504,3.6,0.503,3.7,0.5022,3.8,0.5016,3.9,0.501,4,0.5006,4.2,0.4998,4.4,0.4995,4.6,0.4992,4.8,0.499,5,0.4988];
const G7T=[0,0.1198,0.05,0.1197,0.1,0.1196,0.15,0.1194,0.2,0.1193,0.25,0.1194,0.3,0.1194,0.35,0.1194,0.4,0.1193,0.45,0.1193,0.5,0.1194,0.55,0.1193,0.6,0.1194,0.65,0.1197,0.7,0.1202,0.725,0.1207,0.75,0.1215,0.775,0.1226,0.8,0.1242,0.825,0.1266,0.85,0.1306,0.875,0.1368,0.9,0.1464,0.925,0.166,0.95,0.2054,0.975,0.2993,1,0.3803,1.025,0.4015,1.05,0.4043,1.075,0.4034,1.1,0.4014,1.125,0.3987,1.15,0.3955,1.2,0.3884,1.25,0.381,1.3,0.3732,1.35,0.3657,1.4,0.358,1.5,0.344,1.55,0.3376,1.6,0.3315,1.65,0.326,1.7,0.3209,1.75,0.316,1.8,0.3117,1.85,0.3078,1.9,0.3042,1.95,0.301,2,0.298,2.05,0.2951,2.1,0.2922,2.15,0.2892,2.2,0.2864,2.25,0.2835,2.3,0.2807,2.35,0.2779,2.4,0.2752,2.45,0.2725,2.5,0.2697,2.55,0.267,2.6,0.2643,2.65,0.2615,2.7,0.2588,2.75,0.2561,2.8,0.2533,2.85,0.2506,2.9,0.2479,2.95,0.2451,3,0.2424,3.1,0.2368,3.2,0.2313,3.3,0.2258,3.4,0.2205,3.5,0.2154,3.6,0.2106,3.7,0.206,3.8,0.2017,3.9,0.1975,4,0.1935,4.2,0.1861,4.4,0.1793,4.6,0.173,4.8,0.1672,5,0.1618];
const OMEGA=7.292115e-5, GRAV=9.80665, MIL=1000;
function cdOf(tab,M){ const n=tab.length/2; if(M<=tab[0]) return tab[1]; if(M>=tab[(n-1)*2]) return tab[(n-1)*2+1];
  let lo=0,hi=n-1; while(hi-lo>1){ const mid=(lo+hi)>>1; if(tab[mid*2]>M) hi=mid; else lo=mid; }
  const m0=tab[lo*2],c0=tab[lo*2+1],m1=tab[hi*2],c1=tab[hi*2+1]; return c0+(c1-c0)*(M-m0)/(m1-m0); }
/* atmósfera: presión de estación (hPa), temperatura (°C), humedad (%) -> densidad (kg/m³), velocidad del sonido (m/s) */
function atmos(pHpa,tC,rh){ const T=tC+273.15; const es=6.1121*Math.exp((18.678-tC/234.5)*(tC/(257.14+tC))); const pv=Math.max(0,Math.min(100,rh||0))/100*es;
  const rho=((pHpa-pv)*100)/(287.058*T)+(pv*100)/(461.495*T); const a=Math.sqrt(1.4*287.058*T)*(1+0.0016*pv/pHpa*10);
  return {rho:rho,a:a,T:tC,P:pHpa,rh:rh||0,da:densAlt(rho)}; }
function stdPress(h){ return 1013.25*Math.pow(1-2.25577e-5*h,5.25588); }
function stdTemp(h){ return 15-0.0065*h; }
function densAlt(rho){ return (1-Math.pow(rho/1.225,1/4.255876))/2.25577e-5; }
function atmosAtDAT(da,tC){ const rho=1.225*Math.pow(1-2.25577e-5*da,4.255876); const T=tC+273.15; const P=rho*287.058*T/100; return atmos(P,tC,0); }
function atmosAtDA(da){ const h=da; return atmos(stdPress(h),stdTemp(h),0); }
/* estabilidad giroscópica, fórmula de Miller (2005) con su corrección atmosférica */
function millerSg(b,env){ const d=b.dIn, l=b.lIn/d, t=b.twistIn/d; const sg0=30*b.gr/(t*t*d*d*d*l*(1+l*l));
  const vf=Math.cbrt((b.mv/0.3048)/2800); const tF=env.T*9/5+32; const pin=env.P*0.0295300;
  return sg0*vf*((tF+460)/519)*(29.92/pin); }
/* trayectoria. sh: {alpha (rad, ángulo del ánima sobre la línea de mira), beta (rad, a la derecha), incl (rad, ángulo de la línea de mira),
   az (rad, acimut), lat (rad), wind(x)->[cola m/s, cruzado m/s (+ empuja a la derecha)], cor (bool), mvAdj (m/s)} */
function fly(b,rf,env,sh,R,opt){ opt=opt||{};
  const tab=b.model==='G7'?G7T:G1T; const k=Math.PI/8/(b.bc*703.0696);
  const ci=Math.cos(sh.incl||0), si=Math.sin(sh.incl||0);
  const gx=0, gy=-GRAV*ci; /* en pendiente: gravedad perpendicular a la línea de mira (regla mejorada del fusilero, la de «Fórmulas»); no se aplica la pequeña componente a lo largo del tiro */
  const Od=0,Ou=0,Or=0; /* Coriolis y Eötvös: se suman al final con las fórmulas de Litz (las de «Fórmulas»), con el tiempo de vuelo real de este disparo */
  const v0=b.mv+(sh.mvAdj||0);
  let x=0,y=-rf.sh,z=0, vx=v0*Math.cos(sh.alpha)*Math.cos(sh.beta||0), vy=v0*Math.sin(sh.alpha), vz=v0*Math.cos(sh.alpha)*Math.sin(sh.beta||0), t=0;
  const W=sh.wind||(()=>[0,0]); const dt=opt.dt||0.002; let minM=9, track=opt.track?[]:null;
  function acc(x,vx,vy,vz,out){ const w=W(x); const rx=vx-w[0], ry=vy, rz=vz-w[1]; const vr=Math.sqrt(rx*rx+ry*ry+rz*rz); const M=vr/env.a;
    const dr=k*env.rho*cdOf(tab,M)*vr; out[0]=-dr*rx+gx-2*(Ou*vz-Or*vy); out[1]=-dr*ry+gy-2*(Or*vx-Od*vz); out[2]=-dr*rz-2*(Od*vy-Ou*vx); return M; }
  const a1=[0,0,0],a2=[0,0,0],a3=[0,0,0],a4=[0,0,0];
  let px=0,py=y,pz=0,pt=0,pv=v0; const mk=opt.marks||null, mo=mk?[]:null; let mi=0;
  while(x<R && t<12){ px=x;py=y;pz=z;pt=t;pv=Math.sqrt(vx*vx+vy*vy+vz*vz);
    const M=acc(x,vx,vy,vz,a1); if(M<minM) minM=M;
    acc(x+vx*dt/2,vx+a1[0]*dt/2,vy+a1[1]*dt/2,vz+a1[2]*dt/2,a2);
    acc(x+(vx+a1[0]*dt/2)*dt/2,vx+a2[0]*dt/2,vy+a2[1]*dt/2,vz+a2[2]*dt/2,a3);
    acc(x+(vx+a2[0]*dt/2)*dt,vx+a3[0]*dt,vy+a3[1]*dt,vz+a3[2]*dt,a4);
    const nvx=vx+dt/6*(a1[0]+2*a2[0]+2*a3[0]+a4[0]), nvy=vy+dt/6*(a1[1]+2*a2[1]+2*a3[1]+a4[1]), nvz=vz+dt/6*(a1[2]+2*a2[2]+2*a3[2]+a4[2]);
    x+=dt*(vx+nvx)/2; y+=dt*(vy+nvy)/2; z+=dt*(vz+nvz)/2; vx=nvx;vy=nvy;vz=nvz; t+=dt;
    if(mk){ while(mi<mk.length && x>=mk[mi]){ const q=(mk[mi]-px)/((x-px)||1); mo.push([mk[mi],py+(y-py)*q,pz+(z-pz)*q,pt+(t-pt)*q,Math.sqrt(vx*vx+vy*vy+vz*vz)]); mi++; } }
    if(track && (track.length===0||x-track[track.length-1][0]>R/60)) track.push([x,y,z,t]); }
  const f=(R-px)/((x-px)||1); const yy=py+(y-py)*f, zz=pz+(z-pz)*f, tt=pt+(t-pt)*f; const vv=pv+(Math.sqrt(vx*vx+vy*vy+vz*vz)-pv)*f;
  let cz=0,cy=0; if(sh.cor){ cz=OMEGA*R*tt*Math.sin(sh.lat); cy=OMEGA*R*tt*Math.cos(sh.lat)*Math.sin(sh.az); }
  let spin=0; if(opt.spin){ const sg=millerSg(b,env); spin=b.twistDir*1.25*(sg+1.2)*Math.pow(tt,1.83)*0.0254; }
  if(track) track.push([R,yy+cy,zz+spin+cz,tt]);
  return {marks:mo,y:yy+cy,z:zz+spin+cz,spin:spin,t:tt,v:vv,mach:vv/env.a,minMach:Math.min(minM,vv/env.a),track:track}; }
/* ángulo de cero: el ánima corta la línea de mira a rf.zero metros (atmósfera ICAO, sin viento) */
function zeroAngle(b,rf){ const env=atmos(1013.25,15,0); let lo=-0.01,hi=0.03; for(let i=0;i<50;i++){ const m=(lo+hi)/2; const r=fly(b,rf,env,{alpha:m},rf.zero,{dt:0.001}); if(r.y>0) hi=m; else lo=m; } return (lo+hi)/2; }
/* corrección de alza (mil) para impactar en la línea de mira a distancia R con la atmósfera env (sin viento) */
function elevFor(b,rf,env,R,incl,a0){ a0=a0==null?zeroAngle(b,rf):a0; let lo=a0-0.005,hi=a0+0.12; for(let i=0;i<40;i++){ const m=(lo+hi)/2; const r=fly(b,rf,env,{alpha:m,incl:incl||0},R); if(r.y>0) hi=m; else lo=m; } return ((lo+hi)/2-a0)*MIL; }

/* ===== Fusiles y cartuchos (fusiles de las fichas de M.A.T; cartuchos con datos publicados) ===== */
const RIFLES=[
 {id:'m24',ficha:'g-m24-sniper-weapon-system',n:'M24 SWS',cal:['7,62×51 mm OTAN (.308 Win)','7.62×51mm NATO (.308 Win)'],
  bul:['M118LR · Sierra MatchKing 175 gr','M118LR · Sierra MatchKing 175 gr'],gr:175,model:'G7',bc:0.243,mv:790,dIn:0.308,lIn:1.240,twistIn:11.25,twistDir:1,
  sh:0.038,zero:100,mvSd:4.5,moa:1.0,maxV:1200,
  src:{bc:'Litz, Applied Ballistics (G7 medido del 175 SMK)',mv:['Ficha M.A.T del M24 (2.580 ft/s con M118LR)','M.A.T M24 entry (2,580 ft/s with M118LR)'],tw:['Wikipedia, M24 (1:11,25 in, dextrógiro)','Wikipedia, M24 (1:11.25 in, right-hand)']}},
 {id:'trg22',ficha:'g-sako-trg',n:'Sako TRG-22 A1',cal:['6,5 Creedmoor','6.5 Creedmoor'],
  bul:['Hornady 140 gr ELD Match','Hornady 140 gr ELD Match'],gr:140,model:'G7',bc:0.326,mv:826,dIn:0.264,lIn:1.392,twistIn:8,twistDir:1,
  sh:0.038,zero:100,mvSd:3,moa:0.5,maxV:1400,
  src:{bc:'Hornady (hornady.com/bc, G7 a Mach 2,25)',mv:['Hornady, munición 6.5 CM 140 ELD Match: 2.710 ft/s','Hornady, 6.5 CM 140 ELD Match ammo: 2,710 ft/s'],tw:['Sako (TRG 22 A1 6,5 CM: 1:8 in)','Sako (TRG 22 A1 6.5 CM: 1:8 in)']}},
 {id:'m2010',ficha:'g-m2010-enhanced-sniper-rifle',n:'M2010 ESR',cal:['.300 Winchester Magnum','.300 Winchester Magnum'],
  bul:['Mk 248 Mod 1 · Sierra MatchKing 220 gr','Mk 248 Mod 1 · Sierra MatchKing 220 gr'],gr:220,model:'G7',bc:0.310,mv:869,dIn:0.308,lIn:1.540,twistIn:10,twistDir:1,
  sh:0.038,zero:100,mvSd:4.5,moa:0.75,maxV:1500,
  src:{bc:'Litz, Applied Ballistics (análisis WEZ del XM2010, 2012)',mv:['Litz, WEZ del XM2010: 2.850 ft/s en cañón de 24 in','Litz, XM2010 WEZ: 2,850 ft/s from a 24 in barrel'],tw:['Wikipedia, M2010 (1:10 in)','Wikipedia, M2010 (1:10 in)']}},
 {id:'trg42',ficha:'g-sako-trg',n:'Sako TRG-42 A1',cal:['.338 Lapua Magnum','.338 Lapua Magnum'],
  bul:['Lapua Scenar 300 gr (GB528)','Lapua Scenar 300 gr (GB528)'],gr:300,model:'G1',bc:0.736,mv:820,dIn:0.338,lIn:1.700,twistIn:10,twistDir:1,
  sh:0.040,zero:100,mvSd:3,moa:0.5,maxV:1600,
  src:{bc:'Lapua (ficha del cartucho 4318013: G1 0,736 · G7 0,368)',mv:['Lapua: 820 m/s en cañón de 680 mm','Lapua: 820 m/s from a 680 mm barrel'],tw:['Sako (TRG 42 A1 .338 LM: 1:10 in)','Sako (TRG 42 A1 .338 LM: 1:10 in)']}},
 {id:'m82',ficha:'g-barrett-m82',n:'Barrett M82A1 (M107)',cal:['12,7×99 mm OTAN (.50 BMG)','12.7×99mm NATO (.50 BMG)'],
  bul:['Hornady 750 gr A-MAX Match','Hornady 750 gr A-MAX Match'],gr:750,model:'G1',bc:1.050,mv:853,dIn:0.510,lIn:2.400,twistIn:15,twistDir:1,
  sh:0.050,zero:100,mvSd:6,moa:1.5,maxV:2000,
  src:{bc:'Hornady (750 gr A-MAX/A-Tip Match, G1 1,050)',mv:['Ficha M.A.T del M82 (853 m/s); Hornady da 2.815 ft/s en cañón de prueba de 36 in','M.A.T M82 entry (853 m/s); Hornady lists 2,815 ft/s from a 36 in test barrel'],tw:['Barrett (M82A1: 1:15 in)','Barrett (M82A1: 1:15 in)']}}
];
/* ===== Escenarios: un único puesto de tiro fijo por escenario ===== */
const STAGES=[
 {id:'campo',n:['Campo de tiro de meseta','Plateau range'],d:['Llanura de secano a 700 m de altitud, otoño','Dry plateau at 700 m altitude, autumn'],alt:700,T:[12,20],rh:[35,60],lat:40.4,az:[270,90,0,180],ter:'campo',
  sky:['#5d86b5','#bcd0e2'],far:'#8a97a3',near:'#6f7a3e',mid:'#9b9a62',hz:'#c9cdc4'},
 {id:'desierto',n:['Desierto','Desert'],d:['Calor de 40 °C y espejismo fuerte, a 350 m de altitud','40 °C heat and strong mirage, 350 m altitude'],alt:350,T:[38,45],rh:[8,18],lat:32.5,az:[90,270,180],ter:'desierto',
  sky:['#4f86c6','#e9dcc0'],far:'#c8a982',near:'#c79b62',mid:'#d9b98a',hz:'#efe0c6'},
 {id:'montana',n:['Alta montaña','High mountains'],d:['2.300 m de altitud y aire fino; disparos en pendiente','2,300 m altitude and thin air; sloped shots'],alt:2300,T:[-2,8],rh:[40,70],lat:42.7,az:[180,0,90],ter:'montana',
  sky:['#3a6fb0','#cfe0f0'],far:'#7d8a96',near:'#56653f',mid:'#7f8a5c',hz:'#d8e2ea'},
 {id:'artico',n:['Campo de tiro ártico','Arctic range'],d:['−18 °C y aire denso a 69° de latitud norte','−18 °C dense air at 69° north'],alt:80,T:[-24,-12],rh:[60,85],lat:69.3,az:[0,270,90],ter:'artico',
  sky:['#6f8fb3','#dfe8f1'],far:'#a9b6c4',near:'#e9eef2',mid:'#d5dde5',hz:'#eef3f7'},
 {id:'noche',n:['Campo de tiro nocturno','Night range'],d:['La meseta de noche y sin luna: visor de visión nocturna o térmico','The plateau on a moonless night: night-vision or thermal scope'],alt:700,T:[2,9],rh:[60,85],lat:40.4,az:[270,90,0,180],ter:'campo',night:true,
  sky:['#06090f','#142030'],far:'#1d242c',near:'#171c13',mid:'#20261a',hz:'#26303a'}
];
const MODES={aprende:{n:['Aprende a disparar','Learn to shoot']},facil:{n:['Fácil','Easy']},veterano:{n:['Veterano','Veteran']},desafio:{n:['Desafío','Challenge']},movil:{n:['Blancos en movimiento','Moving targets']},record:{n:['Distancias récord','Record distances']}};
/* modos con computadora balística (reglas de Fácil) */
const EZ=m=>{ m=m||(G&&G.mode); return m==='facil'||m==='movil'||m==='record'; };
/* el observador ayuda en todos los modos menos en Desafío (el más difícil) y en las lecciones */
const SPOT=()=>!!G&&!G.tut&&G.mode!=='desafio'&&CFG.spot!==false;
const RM=()=>{ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
/* Distancias récord: los disparos más largos confirmados en combate (Wikipedia, «Longest recorded sniper kills»), aquí contra placas de acero */
const RECS=[
 {d:2430,y:2002,who:['Rob Furlong, ejército de Canadá (Afganistán)','Rob Furlong, Canadian Army (Afghanistan)'],gun:'McMillan TAC-50 · .50 BMG',same:1},
 {d:2475,y:2009,who:['Craig Harrison, ejército británico (Afganistán)','Craig Harrison, British Army (Afghanistan)'],gun:'Accuracy International L115A3 · .338 Lapua Magnum',same:0},
 {d:2815,y:2012,who:['2.º Regimiento de Comandos de Australia (Afganistán)','Australian 2nd Commando Regiment (Afghanistan)'],gun:'Barrett M82A1 · .50 BMG',same:2},
 {d:3540,y:2017,who:['JTF2, fuerzas especiales de Canadá (Irak)','JTF2, Canadian special forces (Iraq)'],gun:'McMillan TAC-50 · .50 BMG',same:1}];
const RECSRC='https://en.wikipedia.org/wiki/Longest_recorded_sniper_kills';
const MOA_PER_MIL=3.43775;

/* ===== Estado ===== */
let APP=null, X=null, G=null, CFG=null, RAF=0, CV=null, CTX=null, CACHE=null, LASTKEY='';
const EYE=3; /* el puesto de tiro está sobre un pequeño talud: ojo a 3 m sobre el terreno de delante */
function loadCfg(){ let c={}; try{ c=JSON.parse(localStorage.getItem('mat_fr_cfg')||'{}'); }catch(e){} return Object.assign({mode:'facil',rifle:'m24',stage:'campo',unit:'mil'},c); }
function saveCfg(){ try{ localStorage.setItem('mat_fr_cfg',JSON.stringify(CFG)); }catch(e){} }
function bests(){ try{ return JSON.parse(localStorage.getItem('mat_fr_best')||'{}'); }catch(e){ return {}; } }
const rifleOf=id=>RIFLES.find(r=>r.id===id)||RIFLES[0];
const stageOf=id=>STAGES.find(s=>s.id===id)||STAGES[0];

/* terreno: altura (m) a distancia d y desplazamiento u (mil) */
function terrain(st,d,u){ const t=st.ter; const Z=(G&&G.zone)||1600; const f=Math.min(1,Math.pow(d/600,1.4));
  /* zona de tiro: ondulación suave (≤0,35 m) para que todas las placas se vean desde el puesto; más allá, colinas de fondo */
  let h=f*(0.22*Math.sin(u*0.05+d*0.013)+0.13*Math.sin(u*0.11-d*0.031));
  if(t==='montana') h+=d*Math.tan(5*Math.PI/180);
  if(d>Z){ const k=Math.min(1,(d-Z)/1800); const a=(t==='montana'?0.09:(t==='desierto'?0.035:(t==='artico'?0.03:0.025)))*(d-Z);
    h+=k*a*(1.2+0.8*Math.sin(u*0.009+d*0.0007)+0.45*Math.sin(u*0.027-d*0.0013)); }
  return h; }
function farRidge(st,u){ const t=st.ter; const k=t==='montana'?1:(t==='desierto'?0.55:(t==='artico'?0.7:0.35));
  return k*(26+14*Math.sin(u*0.0042+0.3)+9*Math.sin(u*0.0113+1.1)+4*Math.sin(u*0.031)); } /* mil sobre el horizonte, a ~10 km */

/* atmósfera del escenario */
function stageEnv(st,T,rh,dp){ const P=stdPress(st.alt)+dp; return atmos(P,T,rh); }

/* ===== Viento: 3 tramos de la línea de tiro. Tramo 1 = el que mide el anemómetro en el puesto ===== */
/* viento constante en cada tramo durante toda la serie: sin rachas ni azar entre medir y disparar */
function windAt(t,band){ const b=G.wind.b[band]; return {s:b.s,dir:b.dir}; }
function bandOf(x){ return x<G.wind.e1?0:(x<G.wind.e2?1:2); }
/* componentes respecto a un acimut A (°): cola (+ empuja hacia el blanco), cruzado (+ empuja a la derecha) */
function comps(w,A){ const r=(w.dir-A)*Math.PI/180; return {tail:-w.s*Math.cos(r),cross:-w.s*Math.sin(r)}; }

/* ===== Mundo ===== */
function newGame(){ const mode=CFG.mode; const rf=mode==='record'?rifleOf('m82'):rifleOf(CFG.rifle), st=stageOf(CFG.stage); const ez=EZ(mode);
  const seed=mode==='desafio'?(STAGES.indexOf(st)*7919+RIFLES.indexOf(rf)*104729+20261108):((Date.now()^(Math.random()*1e9))>>>0);
  RND=rng(seed);
  const T=Math.round(rr(st.T[0],st.T[1])), rh=Math.round(rr(st.rh[0],st.rh[1])), dp=Math.round(rr(-12,12));
  const az=st.az[Math.floor(RND()*st.az.length)];
  const env=stageEnv(st,T,rh,dp);
  let dmin,dmax; if(mode==='facil'){ dmin=300; dmax=800; } else if(mode==='movil'){ dmin=300; dmax=700; } else { dmin=600; dmax=rf.maxV; }
  const n=mode==='record'?RECS.length:5; const ds=[]; for(let i=0;i<n;i++){ const f=n===1?0:i/(n-1); ds.push(Math.round((dmin+(dmax-dmin)*f+rr(-25,25))/5)*5); }
  ds[0]=Math.max(dmin,ds[0]); ds[n-1]=Math.min(dmax,ds[n-1]);
  if(mode==='record') RECS.forEach((r,i)=>{ ds[i]=r.d; });
  G={zone:Math.max.apply(null,ds)+220};
  const us=(mode==='movil'?[-160,-80,0,80,160]:(mode==='record'?[-90,-30,30,90]:[-120,-60,0,60,120])).map(u=>u+rr(-18,18)); for(let i=us.length-1;i>0;i--){ const j=Math.floor(RND()*(i+1)); [us[i],us[j]]=[us[j],us[i]]; }
  const targets=ds.map((d,i)=>{ const mil=mode==='record'?0.6:(ez?1.0:0.75); let w=Math.max(0.3,Math.round(d*mil/1000*10)/10); const shape=i%2?'gong':'placa';
    const u=us[i]; const g=terrain(st,d,u); return {i:i,d:d,u:u,w:w,h:shape==='gong'?w:w,shape:shape,post:0.9,gy:g,hits:[],res:null,shots:0,pts:0,lased:null,rec:mode==='record'?RECS[i]:null}; });
  targets.forEach(t=>{ t.zc=t.gy+t.post+t.h/2; t.e=Math.atan2(t.zc-EYE,Math.hypot(t.d,0))*1000; t.R=Math.hypot(t.d,t.zc-EYE); });
  if(mode==='movil'){ const sp=[1.0,1.4,1.8,2.2,2.6]; targets.forEach((t,i)=>{ const v=sp[i]; const open=clamp(Math.round(t.R*0.045),12,18); const Tpass=(open+2*t.w)/v; const gap=1.0; const Tp=Tpass+gap;
      t.mv={v:v,dir:RND()<0.5?-1:1,open:open,Tpass:Tpass,Tp:Tp,ph:Math.round(RND()*Tp*10)/10}; t.u0=t.u; }); }
  const dm=Math.max.apply(null,ds);
  /* límites de tramo lejos (>15 m) de los puntos medios D/6, D/2 y 5D/6 de cada placa: así el tramo que toca a cada tercio no es dudoso */
  const nud=e0=>{ for(let k=0;k<120;k++){ const e=e0+(k%2?-1:1)*5*Math.ceil(k/2); if(targets.every(t=>[t.R/6,t.R/2,5*t.R/6].every(m=>Math.abs(m-e)>15))) return e; } return e0; };
  const e1=nud(Math.round(dm/3)), e2=nud(Math.round(2*dm/3));
  /* viento del puesto en décimas de m/s y grados enteros: el anemómetro lo da exacto */
  const s0=Math.round(rr(1.5,mode==='record'?4:(ez?5:6.5))*10)/10, dir0=Math.round(rr(0,360))%360;
  const b=[{s:s0,dir:dir0}];
  if(ez){ b.push({s:s0,dir:dir0},{s:s0,dir:dir0}); }
  else { b.push({s:s0*rr(0.6,1.45),dir:(dir0+rr(-35,35)+360)%360},{s:s0*rr(0.5,1.5),dir:(dir0+rr(-45,45)+360)%360}); }
  const flags=[{d:Math.round(e1*0.5),u:-170+rr(-8,8),band:0},{d:Math.round((e1+e2)/2),u:-150+rr(-8,8),band:1},{d:Math.round((e2+dm)/2),u:-135+rr(-8,8),band:2}];
  flags.forEach(f=>{ f.gy=terrain(st,f.d,f.u); });
  const a0=zeroAngle(rf,rf);
  G={zone:G.zone,mode:mode,rf:rf,st:st,seed:seed,T:T,rh:rh,dp:dp,az:az,env:env,targets:targets,flags:flags,a0:a0,
     wind:{b:b,e1:e1,e2:e2},t0:performance.now(),cur:0,view:'pano',zoom:12,aim:{u:targets[0].u,e:targets[0].e},pano:{u:0},
     dialE:0,dialW:0,score:0,shots:[],readK:null,readL:null,busy:false,breath:0,timeLimit:ez?0:(mode==='desafio'?12*60:15*60),
     rounds:ez?5:3,over:false,notes:'',anim:null,shake:{x:0,y:0},recoil:0,sheet:null,track:true,trackOff:0,trackLag:0,sensor:'nv',fx:[],lastF:0};
  try{ G.notes=localStorage.getItem('mat_fr_notes')||''; }catch(e){}
  CACHE=null; return G; }
function now(){ return (performance.now()-G.t0)/1000; }
/* ===== Blancos en movimiento: la placa cruza un claro entre dos protecciones a velocidad constante, siempre en el mismo sentido =====
   posición lateral x (m) respecto al centro del claro; sin azar: depende solo del reloj de la partida */
function mvX(t,tm){ const m=t.mv; if(!m) return 0; const s=((tm+m.ph)%m.Tp+m.Tp)%m.Tp; const x=s<m.Tpass?-(m.open/2+t.w)+m.v*s:(m.open/2+t.w+0.05); return x*m.dir; }
function mvVis(t,tm){ return !t.mv||Math.abs(mvX(t,tm))<=t.mv.open/2-t.w/2+1e-9; }
/* disparo válido contra una placa móvil: visible al disparar y al llegar, en la misma pasada (así está a la vista todo el vuelo) */
function mvOK(t,tf,tof){ if(!t.mv) return true; const m=t.mv; return mvVis(t,tf)&&mvVis(t,tf+tof)&&Math.floor((tf+m.ph)/m.Tp)===Math.floor((tf+tof+m.ph)/m.Tp); }
function mvU(t,tm){ return t.mv?t.u0+mvX(t,tm)/t.R*1000:t.u; }
function movUpd(tm){ if(!G||G.mode!=='movil') return; G.targets.forEach(t=>{ if(t.mv) t.u=mvU(t,tm); }); }
/* adelanto (mil, + a la derecha) = velocidad × tiempo de vuelo real, pasado a ángulo a esa distancia */
function leadMil(t,tof){ return t.mv?t.mv.v*t.mv.dir*tof*1000/t.R:0; }
/* «Seguir la placa»: la retícula acompaña el movimiento continuo exactamente; solo el salto de una pasada a la siguiente se suaviza */
function trackUpd(dt){ if(!G||G.mode!=='movil'||G.view!=='scope'||!G.track){ if(G) G.trackPrev=null; return; } const t=G.targets[G.cur]; if(!t||!t.mv) return;
  if(G.trackPrev&&G.trackPrev.i===t.i&&Math.abs(t.u-G.trackPrev.u)>3) G.trackErr=(G.trackErr||0)+(G.trackPrev.u-t.u);
  if(!G.trackPrev||G.trackPrev.i!==t.i) G.trackErr=G.aim.u-(t.u+(G.trackOff||0));
  G.trackPrev={i:t.i,u:t.u}; G.trackErr=(G.trackErr||0)*Math.exp(-dt*12); if(Math.abs(G.trackErr)<0.03) G.trackErr=0;
  G.aim.u=t.u+(G.trackOff||0)+G.trackErr; G.trackLag=Math.abs(G.trackErr); }
function timeLeft(){ return G.timeLimit?Math.max(0,G.timeLimit-now()):Infinity; }

/* ===== Física aplicada al disparo ===== */
/* viento aplicado = método de «Fórmulas»: la distancia horizontal D se parte en tercios; cada tercio toma el viento cruzado del tramo donde cae su punto medio
   (D/6, D/2, 5D/6) y se combinan con los pesos 0,45/0,38/0,17. Ese viento efectivo actúa en toda la trayectoria (método del retardo de Didion).
   Solo cuenta la componente cruzada; el viento de cara o de cola no se aplica. */
function zoneCross(A,k){ return comps(windAt(0,k),A).cross; }
function weffAt(A,D){ return 0.45*zoneCross(A,bandOf(D/6))+0.38*zoneCross(A,bandOf(D/2))+0.17*zoneCross(A,bandOf(5*D/6)); }
function windFn(A,t,D){ const w=weffAt(A,D); return x=>[0,w]; }
/* resuelve el disparo hacia un punto (u,e en mil) a distancia oblicua R; devuelve impacto relativo a la línea de mira */
function shotFlight(o){ const rf=G.rf, env=G.env; const A=G.az+o.u*0.0572958; const incl=o.e/1000;
  const sh={alpha:G.a0+o.alpha/1000,beta:o.beta/1000,incl:incl,az:A*Math.PI/180,lat:G.st.lat*Math.PI/180,wind:o.nowind?null:windFn(A,o.t,o.R),cor:!o.nocor,mvAdj:o.mvAdj||0};
  return fly(rf,rf,env,sh,o.R,{spin:!o.nospin,track:o.track}); }
/* desglose exacto (lo que el debriefing y la computadora balística llaman «valores reales») */
function breakdown(R,u,e,t){ const base={R:R,u:u,e:e,t:t,alpha:0,beta:0};
  const g=shotFlight(Object.assign({},base,{nowind:true,nocor:true,nospin:true}));
  const w=shotFlight(Object.assign({},base,{nocor:true,nospin:true}));
  const s=shotFlight(Object.assign({},base,{nowind:true,nocor:true}));
  const c=shotFlight(Object.assign({},base,{nowind:true,nospin:true}));
  const k=1000/R; let drop=-g.y*k; const wind=w.z*k; const spin=(s.z-g.z)*k; const corH=(c.z-g.z)*k, corV=(c.y-g.y)*k;
  /* a distancias récord el ángulo es grande y la suma lineal ya no basta: se ajusta con la trayectoria completa (3 pasadas) */
  if(G.mode==='record'){ let el=drop-corV, wd=-(wind+spin+corH); for(let it=0;it<3;it++){ const f=shotFlight(Object.assign({},base,{alpha:el,beta:wd})); el-=f.y*k; wd-=f.z*k; } drop=el+corV; }
  return {drop:drop,wind:wind,spin:spin,corH:corH,corV:corV,corHcm:(c.z-g.z)*100,corVcm:(c.y-g.y)*100,elev:drop-corV,wdg:-(wind+spin+corH),t:g.t,v:g.v,mach:g.mach,minMach:g.minMach,
    sg:millerSg(G.rf,G.env)}; }
/* tabla DOPE de la tarjeta: atmósfera estándar a una altitud de densidad dada */
const DOPE={};
function dopeTable(rf,da,tC){ tC=tC==null?(G?G.T:15):tC; const key=rf.id+'|'+da+'|'+tC; if(DOPE[key]) return DOPE[key]; const env=atmosAtDAT(da,tC); const a0=zeroAngle(rf,rf); const rows=[]; const max=rf.maxV+100;
  const marks=[]; for(let d=100; d<=max; d+=50) marks.push(d);
  const tr=fly(rf,rf,env,{alpha:a0},max+5,{track:true,dt:0.002,marks:marks});
  const tw=fly(rf,rf,env,{alpha:a0,wind:()=>[0,1]},max+5,{marks:marks});
  marks.forEach((d,i)=>{ const m=tr.marks[i], mw=tw.marks[i]; if(!m) return; rows.push({d:d,el:-m[1]/d*1000,w:(mw[2]-m[2])/d*1000,t:m[3],v:m[4]}); });
  return DOPE[key]=rows; }
function rowsInterp(rows,d){ for(let i=1;i<rows.length;i++){ if(rows[i].d>=d){ const a=rows[i-1],b=rows[i],f=(d-a.d)/(b.d-a.d); const o={}; ['el','w','t','v'].forEach(k=>o[k]=a[k]+(b[k]-a[k])*f); return o; } } return rows[rows.length-1]; }
const DAS=[-1500,-1000,-500,0,500,1000,1500,2000,2500,3000,3500,4000,4500]; /* cada 500 m: la interpolación lineal entre columnas queda por debajo de ~0,02 mil */

/* ===== Estilos ===== */
function css(){ if(document.getElementById('fr-css')) return; const s=document.createElement('style'); s.id='fr-css';
 s.textContent=[
 '.frw{max-width:1180px;margin:0 auto;padding-bottom:40px}',
 '.frhero{position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);margin:10px 0 14px;background:#000}',
 '.frhero img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;filter:saturate(.8) brightness(.62)}',
 '@media(min-width:800px){.frhero img{aspect-ratio:21/8}}',
 '.frhero .ht{position:absolute;left:0;right:0;bottom:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,0,.88))}',
 '.frhero .ht b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(34px,8vw,58px);letter-spacing:.03em;line-height:1}',
 '.frhero .ht span{color:#d6d8d2;font-size:15px;display:block;margin-top:6px;max-width:640px}',
 '.frsec{margin:16px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98}',
 '.frgrid{display:grid;grid-template-columns:1fr;gap:8px}',
 '@media(min-width:640px){.frgrid.c3{grid-template-columns:repeat(3,1fr)}.frgrid.c2{grid-template-columns:repeat(2,1fr)}}',
 '.fropt{display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);color:var(--tx);padding:12px 14px;font:inherit;cursor:pointer;min-height:48px}',
 '.fropt b{display:block;font-size:16px;margin-bottom:2px}',
 '.fropt span{display:block;font-size:13.5px;color:#bfc2b8;line-height:1.35}',
 '.fropt.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac) inset;background:#1a1d14}',
 '.frrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:12px 0}',
 '.frbtn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:46px;padding:10px 16px;border-radius:var(--r);border:1px solid var(--ac);background:var(--ac);color:#0b0c0d;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;touch-action:manipulation;-webkit-user-select:none;user-select:none}',
 '.frbtn.sec{background:transparent;color:var(--tx);border-color:var(--line)}',
 '.frbtn.sm{min-height:40px;padding:8px 12px;font-size:14px}',
 '.frbtn.fire{background:#b8432f;border-color:#d0563f;color:#fff;font-size:17px;letter-spacing:.06em;min-height:54px}',
 '.frbtn.on{background:#2a3220;border-color:var(--ac);color:var(--tx)}',
 '.frbtn:disabled{opacity:.4;cursor:default}',
 '.frseg{display:inline-flex;border:1px solid var(--line);border-radius:var(--r);overflow:hidden}',
 '.frseg button{min-height:42px;padding:8px 14px;border:0;background:transparent;color:var(--tx);font:inherit;cursor:pointer}',
 '.frseg button.on{background:var(--ac);color:#0b0c0d;font-weight:700}',
 '.frest{display:inline-block;font-size:11px;letter-spacing:.04em;text-transform:uppercase;border:1px solid #6b6d58;color:#cfd0b8;border-radius:4px;padding:0 5px;margin-left:5px;vertical-align:1px}',
 '.frdet{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);margin:12px 0;padding:0 12px}',
 '.frdet>summary{cursor:pointer;padding:13px 0;font-weight:700;min-height:22px}',
 '.frdet .in{padding:0 0 12px;font-size:14.5px;line-height:1.5;color:#d5d7cf}',
 '.frdet .in p{margin:6px 0 10px}',
 '.frdet code,.frf{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;background:#0e100c;border:1px solid #2a2e24;border-radius:6px;padding:6px 8px;display:block;overflow-x:auto;white-space:pre-wrap;color:#e8ead8;margin:4px 0 8px}',
 '.frtab{width:100%;border-collapse:collapse;font-size:13.5px}',
 '.frtab th,.frtab td{border-bottom:1px solid #262a20;padding:5px 4px;text-align:right;font-variant-numeric:tabular-nums}',
 '.frtab th:first-child,.frtab td:first-child{text-align:left}',
 '.frtab th{color:#a8ad98;font-weight:600;font-size:12px}',
 /* juego */
 '.frg{display:grid;grid-template-columns:1fr;gap:10px}',
 '@media(min-width:900px){.frg{grid-template-columns:minmax(0,1fr) 340px;align-items:start}}',
 '.frtop{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;justify-content:space-between;margin:8px 0;font-size:14px;color:#cfd1c8}',
 '.frtop b{color:var(--tx)}',
 '.frview{position:relative;border:1px solid var(--line);border-radius:var(--r);overflow:hidden;background:#000;touch-action:none;-webkit-user-select:none;user-select:none}',
 '.frview canvas{display:block;width:100%;height:min(100vw,62vh);min-height:300px;cursor:grab}',
 '@media(min-width:900px){.frview canvas{height:min(70vh,640px)}}',
 '.frmsg{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:rgba(10,12,8,.82);border:1px solid #3a3f30;color:#f0f0e6;border-radius:16px;padding:6px 14px;font-size:14px;line-height:1.3;text-align:center;pointer-events:none;width:max-content;max-width:92%;animation:frIn .22s ease-out both}',
 '.frmsg.hit{border-color:#b9d36a;color:#e9ffb0;font-weight:700}',
 '.frmsg.miss{border-color:#c46a4f;color:#ffd0c0}',
 '.frhint{position:absolute;left:8px;bottom:8px;right:8px;font-size:12.5px;color:#e6e8de;text-shadow:0 1px 2px #000;pointer-events:none}',
 '.frside{display:flex;flex-direction:column;gap:10px}',
 '.frpanel{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px}',
 '.frpanel h4{margin:0 0 8px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98;font-weight:600}',
 '.frtur{display:grid;grid-template-columns:auto 1fr auto;gap:6px;align-items:center;margin:4px 0}',
 '.frtur .val{text-align:center;font-family:ui-monospace,Menlo,monospace;font-size:20px;font-weight:700;color:#e9f0c8;background:#0c0e0a;border:1px solid #2c3124;border-radius:8px;padding:6px 4px;min-width:0}',
 '.frtur .val small{display:block;font-size:11px;font-weight:400;color:#a8ad98;font-family:inherit}',
 '.frtur .bt{display:flex;gap:4px}',
 '.frtur .bt button{min-width:44px;min-height:44px;border-radius:8px;border:1px solid var(--line);background:#1b1e16;color:var(--tx);font:inherit;font-weight:700;cursor:pointer;touch-action:manipulation}',
 '.frtur .bt button:active{background:#2b3122}',
 '.frchips{display:flex;flex-wrap:wrap;gap:6px}',
 '.frchip{min-height:40px;padding:6px 10px;border-radius:8px;border:1px solid var(--line);background:#16190f;color:var(--tx);font:inherit;font-size:14px;cursor:pointer}',
 '.frchip.on{border-color:var(--ac);background:#263019}',
 '.frchip.ok{border-color:#7d9a3b;color:#d8f0a0}',
 '.frchip.ko{border-color:#8e4a3a;color:#f0b8a8}',
 '.frtools{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}',
 '.frtools button{min-height:48px;border-radius:8px;border:1px solid var(--line);background:#16190f;color:var(--tx);font:inherit;font-size:13.5px;cursor:pointer;padding:6px 4px;line-height:1.2}',
 '.frtools button.hl{border-color:var(--ac)}',
 '.frsheet{position:fixed;left:0;right:0;bottom:0;z-index:60;max-height:78vh;overflow:auto;background:#10120d;border-top:1px solid #3a4030;border-radius:14px 14px 0 0;box-shadow:0 -10px 40px rgba(0,0,0,.6);padding:12px 14px 20px;-webkit-overflow-scrolling:touch}',
 '@media(min-width:900px){.frsheet{left:auto;right:16px;bottom:16px;width:420px;border-radius:14px;border:1px solid #3a4030;max-height:82vh}}',
 '.frsheet .hd{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}',
 '.frsheet .hd b{font-size:17px}',
 '.frsheet .x{min-width:44px;min-height:44px;border-radius:8px;border:1px solid var(--line);background:transparent;color:var(--tx);font-size:20px;cursor:pointer}',
 '.frdev{background:linear-gradient(#2b2f33,#1d2023);border:1px solid #454b52;border-radius:16px;padding:12px}',
 '.frlcd{background:#b9c7a6;color:#1b2414;border-radius:8px;padding:10px 12px;font-family:ui-monospace,Menlo,monospace;box-shadow:inset 0 2px 6px rgba(0,0,0,.35)}',
 '.frlcd .r{display:flex;justify-content:space-between;gap:10px;font-size:15px;padding:2px 0;border-bottom:1px dashed rgba(27,36,20,.25)}',
 '.frlcd .r:last-child{border-bottom:0}',
 '.frlcd .big{font-size:30px;font-weight:700;text-align:center;padding:6px 0}',
 '.frkv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}',
 '.frkv span{color:#a8ad98}',
 '.frkv b{text-align:right;font-variant-numeric:tabular-nums;font-weight:600}',
 '.frnote{width:100%;min-height:110px;box-sizing:border-box;background:#0c0e0a;color:var(--tx);border:1px solid var(--line);border-radius:8px;padding:8px;font:14px ui-monospace,Menlo,monospace}',
 '.frin{width:100%;box-sizing:border-box;background:#0c0e0a;color:var(--tx);border:1px solid var(--line);border-radius:8px;padding:10px;font:16px ui-monospace,Menlo,monospace;min-height:44px}',
 '.frbig{font-size:15px;line-height:1.5}',
 '.frok{color:#d6f09a}.frko{color:#f2b19e}',
  '.frcoach{scroll-margin-top:76px;margin-top:10px;border:1px solid var(--ac);border-radius:var(--r);background:#13160f;padding:12px 12px 4px;min-width:0}',
  '.frcoach h3{margin:8px 0 4px;font-size:18px;line-height:1.25}',
  '.frco-hd{display:grid;gap:5px;font-size:12.5px;color:#a8ad98}',
  '.frco-bar{height:4px;background:#2a2e24;border-radius:2px;overflow:hidden}.frco-bar i{display:block;height:100%;background:var(--ac)}',
  '.frco-bd p,.frco-res p{margin:6px 0;font-size:15px;line-height:1.5}',
  '.frco-in{display:grid;gap:10px;margin:10px 0 4px}.frco-in label{display:grid;gap:4px;font-size:14px;color:#d8dbcc}',
  '.frco-ch{display:flex;flex-wrap:wrap;gap:6px}.frco-ch .frbtn.on{border-color:var(--ac);background:#2c3320;color:var(--tx)}',
  '.frco-ul{margin:4px 0 8px;padding-left:18px;font-size:14.5px;line-height:1.5}.frco-ul li{margin:4px 0}',
  '.frco-kv{display:grid;grid-template-columns:auto 1fr;gap:2px 12px;font-size:14px;margin:8px 0}.frco-kv span{color:#cfd2c4}.frco-kv b{text-align:right;font-variant-numeric:tabular-nums}.frco-kv em{grid-column:1/-1;font-style:normal;font-size:13px;color:#a8ad98;margin-bottom:6px}',
  '.frco-nav{justify-content:space-between}',
 '.frsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}',
 '.frsum div{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px;text-align:center}',
 '.frsum b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:28px}',
 '.frsum span{font-size:12px;color:#a8ad98;text-transform:uppercase;letter-spacing:.06em}',
 '@keyframes frIn{from{opacity:0;transform:translate(-50%,-6px)}to{opacity:1;transform:translate(-50%,0)}}',
 '@keyframes frUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}',
 '@keyframes frFade{from{opacity:0}to{opacity:1}}',
 '.frmsg.out{opacity:0;transition:opacity .25s}',
 '.frsheet{animation:frUp .28s cubic-bezier(.2,.8,.2,1) both}',
 '.frbtn,.fropt,.frchip,.frtools button,.frtur button{transition:background-color .18s,border-color .18s,color .18s,transform .12s}',
 '.frbtn:active,.fropt:active,.frtur button:active{transform:scale(.97)}',
 '.frbtn.sm.on{border-color:#b9d36a;color:#e9ffb0}',
 '.frspot{border:1px solid #6d7f3a;background:linear-gradient(180deg,#1b2210,#141a0c);border-radius:12px;padding:10px 12px;margin:8px 0 10px}',
 '.frspot .tag{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#0b0c0d;background:#b9d36a;border-radius:999px;padding:2px 8px;margin-bottom:6px}',
 '.frspot p{margin:2px 0 8px;font-size:15.5px;line-height:1.45;color:#eef3dc}',
 '.frspot.rec{border-color:#c9a23a;background:linear-gradient(180deg,#241d0c,#17130a)}',
 '.frspot.rec .tag{background:#e3b94a}',
 '.frnote{font-size:12.5px;color:#a8ad98;line-height:1.45;margin:6px 0 0}',
 '.frrec .rr{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px solid #2a2f22}',
 '.frrec .rr b{font-family:Anton,Impact,sans-serif;font-weight:400;font-size:22px;min-width:92px;color:#e3b94a}',
 '.frrec .rr span{font-size:13px;color:#cfd3c2}',
 '.frrec p{font-size:13.5px;color:#bfc2b8;line-height:1.5}',
 '@media (prefers-reduced-motion:reduce){.frsheet,.frmsg{animation:none!important}.frbtn,.fropt{transition:none!important}}'
 ].join('\n'); document.head.appendChild(s); }

/* ===== Textos: cómo funciona, fórmulas, validación ===== */
function howHTML(){ return '<details class="frdet"><summary>'+L('Cómo funciona la simulación','How the simulation works')+'</summary><div class="in">'+
 '<p>'+L('Cada disparo se calcula integrando paso a paso la trayectoria de la bala (modelo de masa puntual, Runge-Kutta de 4.º orden, paso de 2 ms) con su coeficiente balístico real sobre las tablas de arrastre G1 o G7 del Ballistic Research Laboratory. Nada es una animación precalculada: si cambias una torreta, el viento o el acimut, cambia el impacto.','Every shot is computed by integrating the bullet’s trajectory step by step (point-mass model, 4th-order Runge-Kutta, 2 ms step) with its real ballistic coefficient on the Ballistic Research Laboratory G1 or G7 drag tables. Nothing is a canned animation: change a turret, the wind or the azimuth and the impact changes.')+'</p>'+
 '<p><b>'+L('Qué se simula','What is simulated')+'</b>: '+L('gravedad (en pendiente, perpendicular a la línea de mira: regla mejorada del fusilero); arrastre según el número de Mach; densidad del aire a partir de presión, temperatura y humedad; velocidad del sonido según la temperatura; viento distinto en 3 tramos, constante durante la serie (Veterano), aplicado con la regla de tramos de «Fórmulas»; deriva por giro (fórmula de Litz con la estabilidad de Miller); Coriolis horizontal y vertical (efecto Eötvös) según latitud y acimut, con las fórmulas de Litz de «Fórmulas» y el tiempo de vuelo real; paso por el régimen transónico, que dispara el arrastre. <b>En el juego no hay dispersión aleatoria: si el cálculo es correcto, el impacto es seguro.</b> No hay dispersión del fusil, ni variación de velocidad en boca, ni rachas: dos disparos iguales caen en el mismo punto.','gravity (on slopes, perpendicular to the line of sight: improved rifleman’s rule); drag as a function of Mach number; air density from pressure, temperature and humidity; speed of sound from temperature; different wind in 3 zones, steady for the whole string (Veteran), applied with the zone rule in “Formulas”; spin drift (Litz formula with Miller stability); horizontal and vertical (Eötvös) Coriolis from latitude and azimuth, with Litz’s formulas from “Formulas” and the real time of flight; passage through the transonic regime, where drag shoots up. <b>There is no random dispersion in the game: if your calculation is right, the hit is certain.</b> No rifle dispersion, no muzzle-velocity spread and no gusts: two identical shots land on the same spot.')+'</p>'+
 '<p><b>'+L('Un único puesto de tiro','A single firing position')+'</b>: '+L('no te mueves. Miras el campo a simple vista (banderas, placas e instrumentos) y, cuando quieres disparar, miras por el visor, arrastras para apuntar, giras las torretas (clics de 0,1 mil o 1/4 MOA) y aprietas el disparador.','you do not move. You look at the range with the naked eye (flags, plates and instruments) and, when you want to shoot, you look through the scope, drag to aim, dial the turrets (0.1 mil or 1/4 MOA clicks) and press the trigger.')+'</p>'+
 '<p><b>'+L('Fácil','Easy')+'</b>: '+L('mides tú (anemómetro y telémetro) y la computadora balística te da la solución exacta, desglosada: caída, viento, giro y Coriolis. El viento es igual en todo el recorrido y el observador te corrige si fallas. Placas a 300–800 m.','you measure (wind meter and rangefinder) and the ballistic computer gives you the exact solution, broken down: drop, wind, spin and Coriolis. The wind is the same along the whole path and the spotter corrects you if you miss. Plates at 300–800 m.')+'</p>'+
 '<p><b>'+L('Veterano','Veteran')+'</b>: '+L('no hay computadora. Tienes los instrumentos de verdad (anemómetro con altitud de densidad, telémetro láser, brújula y GPS), la tarjeta de datos del fusil con su tabla, un bloc con calculadora y las fórmulas. El viento lejano puede no ser el que mides: léelo en las banderas y el espejismo. 3 disparos por placa, 15 minutos. Placas a 600 m hasta el alcance del cartucho (.50 BMG a 2.000 m).','there is no computer. You have the real instruments (wind meter with density altitude, laser rangefinder, compass and GPS), the rifle’s data card with its table, a notepad with calculator and the formulas. The far wind may not be what you measure: read it from the flags and the mirage. 3 rounds per plate, 15 minutes. Plates from 600 m to the cartridge’s reach (.50 BMG to 2,000 m).')+'</p>'+
 '<p><b>'+L('Desafío','Challenge')+'</b>: '+L('reglas de Veterano con condiciones fijas por escenario y fusil, para comparar tu mejor puntuación (se guarda en este dispositivo). 12 minutos.','Veteran rules with fixed conditions per location and rifle, so you can compare your best score (saved on this device). 12 minutes.')+'</p>'+
 '<p><b>'+L('Estimación','Estimate')+'</b>: '+L('altura del visor, longitud de cada bala (solo para calcular la estabilidad), el alcance máximo del telémetro del juego (2.500 m), la regla de ponderación de tramos (0,45/0,38/0,17, sacada del propio simulador y que el juego aplica tal cual al viento) y el visor genérico 5–25× de plano focal frontal son valores del juego, no datos publicados del fabricante.','scope height, each bullet’s length (only used to compute stability), the game rangefinder’s maximum range (2,500 m), the zone-weighting rule (0.45/0.38/0.17, taken from the simulator itself and applied by the game to the wind as written) and the generic 5–25× first-focal-plane scope are game values, not published manufacturer data.')+EST()+'</p>'+
 '<p><b>'+L('Fuentes','Sources')+'</b>: R. L. McCoy, <i>Modern Exterior Ballistics</i> (Schiffer, 1999); B. Litz, <i>Applied Ballistics for Long-Range Shooting</i> (3.ª ed., 2015) '+L('y su análisis WEZ del XM2010 (2012)','and his XM2010 WEZ analysis (2012)')+'; D. Miller, '+L('regla de estabilidad','stability rule')+' (<i>Precision Shooting</i>, 2005); '+L('tablas G1/G7 del BRL tal como las publica','BRL G1/G7 tables as published by')+' py-ballisticcalc (LGPL); '+L('atmósfera estándar ICAO; presión de vapor de Buck (1981)','ICAO standard atmosphere; Buck (1981) vapour pressure')+'; '+L('coeficientes y velocidades de Hornady (hornady.com/bc), Lapua (cartucho 4318013) y Sierra/Litz; paso de estriado de Sako, Barrett y Wikipedia; lectura de banderas y espejismo del manual del Ejército de EE. UU. FM 23-10','coefficients and velocities from Hornady (hornady.com/bc), Lapua (cartridge 4318013) and Sierra/Litz; twist rates from Sako, Barrett and Wikipedia; flag and mirage reading from the U.S. Army manual FM 23-10')+' (<i>Sniper Training</i>, 1994).</p>'+
 '</div></details>'; }
function formulasHTML(open){ const f=(s)=>'<code class="frf">'+s+'</code>';
 return '<details class="frdet"'+(open?' open':'')+'><summary>'+L('Fórmulas (para calcularlo a mano)','Formulas (to work it out by hand)')+'</summary><div class="in">'+
 '<p><b>1. '+L('Densidad del aire y altitud de densidad','Air density and density altitude')+'</b></p>'+f('ρ = (p − pv)/(287,058·T) + pv/(461,495·T)   [p, pv en Pa; T en K]\npv = HR/100 · 611,21·e^((18,678 − t/234,5)·t/(257,14 + t))   [t en °C]\nDA = (1 − (ρ/1,225)^(1/4,2559)) / 2,25577·10⁻⁵   [m]')+
 '<p>'+L('El anemómetro ya te da la altitud de densidad (DA). La tarjeta trae la tabla cada 500 m de DA (de −1.500 a 4.500 m) y cada 50 m de distancia: interpola entre las dos columnas que rodean tu DA y entre las dos filas que rodean tu distancia.','The wind meter already gives you density altitude (DA). The card has the table every 500 m of DA (−1,500 to 4,500 m) and every 50 m of range: interpolate between the two columns around your DA and the two rows around your distance.')+'</p>'+
 '<p><b>2. '+L('Caída (alza)','Drop (elevation)')+'</b></p>'+f(L('Alza = tabla(DA, D) · cos θ   ← regla mejorada del fusilero: lee la tabla a la distancia\n   del telémetro y multiplica por el coseno del ángulo (el juego aplica justo esto)','Elevation = table(DA, D) · cos θ   ← improved rifleman’s rule: read the table at the rangefinder\n   distance and multiply by the cosine of the angle (the game applies exactly this)'))+
 '<p><b>3. '+L('Viento (método del retardo de Didion, Litz)','Wind (Didion lag-time method, Litz)')+'</b></p>'+f(L('deriva (m) = Wc · (t − D/V0)        en mil: deriva/D·1000\nWc = W · sen(dirección de donde viene − acimut de tiro)\n   (+ viene de la derecha y empuja a la IZQUIERDA)\nTramos: parte la distancia D del telémetro en tercios; cada tercio usa\n   el viento cruzado del tramo donde cae su punto medio (D/6, D/2, 5·D/6)\nWef = 0,45·W(D/6) + 0,38·W(D/2) + 0,17·W(5·D/6)   ← el juego aplica justo esto\nTramo 1: anemómetro, con el rumbo de la placa que da el telémetro\nBandera: ángulo con el mástil (°) / 4 = viento cruzado en mph; 1 mph = 0,44704 m/s\nSolo cuenta el viento cruzado: el de cara o de cola no se aplica','drift (m) = Wc · (t − D/V0)        in mil: drift/D·1000\nWc = W · sin(direction it blows from − firing azimuth)\n   (+ comes from the right and pushes LEFT)\nZones: split the rangefinder distance D into thirds; each third uses\n   the crosswind of the zone its midpoint falls in (D/6, D/2, 5·D/6)\nWeff = 0.45·W(D/6) + 0.38·W(D/2) + 0.17·W(5·D/6)   ← the game applies exactly this\nZone 1: wind meter, with the plate heading from the rangefinder\nFlag: angle from the pole (°) / 4 = crosswind in mph; 1 mph = 0.44704 m/s\nOnly crosswind counts: head or tail wind is not applied'))+
 '<p>'+L('La columna «Viento 1 m/s» de la tarjeta ya es (t − D/V0)/D·1000 para 1 m/s: multiplícala por tu viento cruzado efectivo.','The card’s “Wind 1 m/s” column is already (t − D/V0)/D·1000 for 1 m/s: multiply it by your effective crosswind.')+'</p>'+
 '<p><b>4. '+L('Deriva por giro (aproximación de Litz)','Spin drift (Litz approximation)')+'</b></p>'+f(L('SD (pulgadas) = 1,25 · (Sg + 1,2) · t^1,83     → a la DERECHA (estriado dextrógiro)\nSg (Miller) = 30·m / (tw²·d³·l·(1+l²)) · (V/2800)^(1/3) · ((T°F+460)/519) · (29,92/P inHg)\n   m en grains; d en pulgadas; tw y l en calibres','SD (inches) = 1.25 · (Sg + 1.2) · t^1.83     → to the RIGHT (right-hand twist)\nSg (Miller) = 30·m / (tw²·d³·l·(1+l²)) · (V/2800)^(1/3) · ((T°F+460)/519) · (29.92/P inHg)\n   m in grains; d in inches; tw and l in calibres'))+
 '<p><b>5. Coriolis</b></p>'+f(L('ω = 7,292·10⁻⁵ rad/s     φ = latitud     A = acimut de tiro\nHorizontal:  Z = ω·D·t·sen φ           → en mil: 1000·ω·t·sen φ (a la derecha en el hemisferio norte)\nVertical (Eötvös):  Y = ω·D·t·cos φ·sen A  → en mil: 1000·ω·t·cos φ·sen A (sube tirando al ESTE, baja al OESTE)','ω = 7.292·10⁻⁵ rad/s     φ = latitude     A = firing azimuth\nHorizontal:  Z = ω·D·t·sin φ           → in mil: 1000·ω·t·sin φ (to the right in the northern hemisphere)\nVertical (Eötvös):  Y = ω·D·t·cos φ·sin A  → in mil: 1000·ω·t·cos φ·sin A (up shooting EAST, down shooting WEST)'))+
 '<p><b>6. '+L('Medir la distancia con la retícula','Ranging with the reticle')+'</b></p>'+f(L('D (m) = tamaño (m) · 1000 / tamaño medido (mil)','D (m) = size (m) · 1000 / measured size (mil)'))+
 '<p><b>7. '+L('Solución','Solution')+'</b></p>'+f(L('ALZA   = caída − Eötvös\nDERIVA = −(viento + giro + Coriolis horizontal)     (− = a la izquierda)\n1 mil = 3,438 MOA = 10 cm a 100 m','ELEVATION = drop − Eötvös\nWINDAGE   = −(wind + spin + horizontal Coriolis)     (− = left)\n1 mil = 3.438 MOA = 10 cm at 100 m'))+
 '<p>'+L('En el juego no hay dispersión aleatoria: si el cálculo es correcto, el impacto es seguro. Lo único que mueve el tiro es el temblor: si contienes el aire más de 6 s el visor tiembla y la bala va a donde apunte la retícula en ese instante.','There is no random dispersion in the game: if your calculation is right, the hit is certain. The only thing that moves the shot is shake: hold your breath longer than 6 s and the scope shakes, and the bullet goes where the reticle points at that instant.')+EST()+'</p>'+
 '</div></details>'; }
function validHTML(){ const r=(a,b,c,d)=>'<tr><td>'+a+'</td><td>'+b+'</td><td>'+c+'</td><td>'+d+'</td></tr>';
 return '<details class="frdet"><summary>'+L('Validación del simulador','Simulator validation')+'</summary><div class="in"><p>'+L('Comparado con tablas publicadas por los fabricantes y con un calculador balístico independiente (py-ballisticcalc), en atmósfera ICAO:','Compared with manufacturers’ published tables and with an independent ballistic calculator (py-ballisticcalc), in the ICAO atmosphere:')+'</p>'+
 '<table class="frtab"><tr><th>'+L('Caso','Case')+'</th><th>'+L('Publicado','Published')+'</th><th>M.A.T</th><th>'+L('Dif.','Diff.')+'</th></tr>'+
 r(L('.338 LM 300 gr Scenar, 820 m/s, cero 100 m: caída a 1.000 m','.338 LM 300 gr Scenar, 820 m/s, 100 m zero: drop at 1,000 m'),'9.595 mm (Lapua)','9.719 mm','+1,3 %')+
 r(L('… a 1.500 m','… at 1,500 m'),'29.006 mm (Lapua)','29.509 mm','+1,7 %')+
 r(L('… velocidad a 1.500 m','… velocity at 1,500 m'),'344 m/s (Lapua)','349 m/s','+1,5 %')+
 r(L('.50 BMG 750 gr A-MAX, 2.815 ft/s, cero 200 yd: caída a 500 yd','.50 BMG 750 gr A-MAX, 2,815 ft/s, 200 yd zero: drop at 500 yd'),'35,6 in (Hornady)','36,1 in','+1,4 %')+
 r(L('.308 175 gr SMK, 2.600 ft/s, cero 100 m: caída a 1.000 m','.308 175 gr SMK, 2,600 ft/s, 100 m zero: drop at 1,000 m'),'14.314 mm (py-ballisticcalc)','14.313 mm','0,0 %')+
 '</table><p>'+L('El viento de la tabla de Lapua (4 m/s) sale un 9–12 % menor que el del simulador; Lapua no publica su método y su cifra tampoco cuadra con el método de Didion aplicado a sus propias velocidades, así que M.A.T mantiene el cálculo físico.','Lapua’s table wind drift (4 m/s) is 9–12% lower than the simulator’s; Lapua does not publish its method and its figure does not match Didion’s method applied to its own velocities either, so M.A.T keeps the physical calculation.')+'</p></div></details>'; }

/* ===== Menú ===== */
function recHTML(){ const rf=rifleOf('m82');
  return '<div class="frsec">'+L('Las cuatro distancias','The four distances')+'</div><div class="frpanel frrec">'+RECS.map((r,i)=>'<div class="rr"><b>'+ni(r.d)+' m</b><span>'+r.y+' · '+esc(L(r.who[0],r.who[1]))+' · '+esc(r.gun)+'</span></div>').join('')+
   '<p>'+L('Son las distancias de los disparos más largos confirmados en combate de la lista de Wikipedia («Longest recorded sniper kills»). Aquí se tiran contra placas de acero, todas con el ','These are the distances of the longest confirmed combat shots in Wikipedia’s list (“Longest recorded sniper kills”). Here they are fired at steel plates, all with the ')+esc(rf.n)+' (.50 BMG, '+esc(L(rf.bul[0],rf.bul[1]))+'). '+
   L('El de 2.815 m se hizo con este mismo fusil; los de 2.430 y 3.540 m con el McMillan TAC-50, del mismo cartucho; el de 2.475 m con un .338 Lapua Magnum. Ucrania ha comunicado tiros de 3.800 m (2023) y 4.000 m (2025) con 14,5 mm que nadie ajeno ha podido comprobar, por eso no están.','The 2,815 m shot used this very rifle; the 2,430 and 3,540 m ones a McMillan TAC-50 in the same cartridge; the 2,475 m one a .338 Lapua Magnum. Ukraine has announced 3,800 m (2023) and 4,000 m (2025) shots in 14.5 mm that no outside party has been able to check, so they are left out.')+
   ' <a href="'+RECSRC+'" target="_blank" rel="noopener">'+L('Fuente','Source')+'</a></p><p class="frnote">'+L('Placas de 0,6 mil (1,5 m a 2.430 m; 2,1 m a 3.540 m), 5 disparos por placa y computadora balística. La torreta llega a 90 mil de elevación como con una base inclinada: simplificado para el juego.','0.6 mil plates (1.5 m at 2,430 m; 2.1 m at 3,540 m), 5 rounds per plate and a ballistic computer. The turret reaches 90 mil of elevation as with a tapered base: simplified for the game.')+'</p></div>'; }
function intro(){ stopLoop(); if(CFG._u){ CFG.unit=CFG._u; delete CFG._u; } const rf=CFG.mode==='record'?rifleOf('m82'):rifleOf(CFG.rifle), st=stageOf(CFG.stage); const B=bests();
 const opt=(on,attr,b,s)=>'<button type="button" class="fropt'+(on?' on':'')+'" '+attr+'><b>'+b+'</b><span>'+s+'</span></button>';
 let h='<div class="frw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],['Francotirador']])+
 '<div class="frhero"><img src="img/juegos/francotirador.webp" width="640" height="400" alt="'+esc(L('Tirador con un Barrett M107 en un campo de tiro de Yibuti','Marksman with a Barrett M107 on a range in Djibouti'))+'"><div class="ht"><b>'+L('FRANCOTIRADOR','SNIPER')+'</b><span>'+L('Placas de acero de 300 a 2.000 m. Mide la distancia, lee el viento y gira las torretas: la bala sigue la física de verdad, incluida la rotación de la Tierra.','Steel plates from 300 to 2,000 m. Range it, read the wind and dial the turrets: the bullet follows real physics, including the Earth’s rotation.')+'</span></div></div>';
  h+='<div class="frsec">'+L('¿Nunca has disparado?','Never fired a shot?')+'</div><div class="frgrid">'+opt(CFG.mode==='aprende','data-m="aprende"',L('Aprende a disparar','Learn to shoot'),L('Clase guiada paso a paso: te explico cada medida y cada cuenta, tú las haces y yo las compruebo. Dos lecciones: 480 m y 1.540 m.','A step-by-step guided class: I explain each reading and each sum, you do them and I check them. Two lessons: 480 m and 1,540 m.'))+'</div>';
 h+='<div class="frsec">'+L('Modo','Mode')+'</div><div class="frgrid c3">'+
  opt(CFG.mode==='facil','data-m="facil"',L('Fácil','Easy'),L('Mides tú y la computadora balística te da la solución desglosada. 300–800 m.','You measure and the ballistic computer gives you the broken-down solution. 300–800 m.'))+
  opt(CFG.mode==='veterano','data-m="veterano"',L('Veterano','Veteran'),L('Sin computadora: instrumentos, tarjeta, fórmulas y tu cabeza. Coriolis, giro y densidad los calculas tú. 600–2.000 m.','No computer: instruments, data card, formulas and your head. You work out Coriolis, spin and density. 600–2,000 m.'))+
  opt(CFG.mode==='desafio','data-m="desafio"',L('Desafío','Challenge'),L('Reglas de Veterano con condiciones fijas para batir tu récord. Sin observador.','Veteran rules with fixed conditions to beat your record. No spotter.'))+'</div>';
  h+='<div class="frsec">'+L('Retos especiales','Special challenges')+'</div><div class="frgrid c2">'+
   opt(CFG.mode==='movil','data-m="movil"',L('Blancos en movimiento','Moving targets'),L('Cinco placas cruzan un claro entre dos protecciones, de 1 a 2,6 m/s. El adelanto sale del tiempo de vuelo real. 300–700 m.','Five plates cross a gap between two covers at 1 to 2.6 m/s. The lead comes from the real time of flight. 300–700 m.'))+
   opt(CFG.mode==='record','data-m="record"',L('Distancias récord','Record distances'),L('Cuatro placas a las distancias de los disparos más largos confirmados: 2.430, 2.475, 2.815 y 3.540 m. Con el .50 BMG.','Four plates at the distances of the longest confirmed shots: 2,430, 2,475, 2,815 and 3,540 m. With the .50 BMG.'))+'</div>';
  if(CFG.mode==='aprende'){ const ls=CFG.lesson?1:0;
  h+='<div class="frsec">'+L('Lección','Lesson')+'</div><div class="frgrid c2">'+opt(ls===0,'data-l="0"',L('Lección 1 · 480 m','Lesson 1 · 480 m'),L('M24 (.308) en terreno llano, a 700 m de altitud. Aprendes el método completo: distancia, aire, caída, viento, giro y Tierra.','M24 (.308) on flat ground at 700 m altitude. You learn the whole method: distance, air, drop, wind, spin and the Earth.'))+
   opt(ls===1,'data-l="1"',L('Lección 2 · 1.540 m','Lesson 2 · 1,540 m'),L('Sako TRG-42 (.338 Lapua) con frío ártico (−12 °C) y tiro al este a 69° de latitud: aquí el Coriolis y el Eötvös ya cuentan.','Sako TRG-42 (.338 Lapua) in Arctic cold (−12 °C), firing east at 69° north: here Coriolis and Eötvös matter.'))+'</div>';
  h+='<div class="frrow"><button type="button" class="frbtn" id="frgo">'+L('Empezar la lección ','Start lesson ')+(ls+1)+'</button></div>';
  h+='<p style="font-size:13.5px;color:#bfc2b8">'+L('Solo placas y gongs de acero en un campo de tiro. Sin personas.','Steel plates and gongs on a range only. No people.')+'</p>';
 } else {
  if(CFG.mode==='record') h+=recHTML(); else h+='<div class="frsec">'+L('Fusil y cartucho','Rifle and cartridge')+'</div><div class="frgrid c2">'+RIFLES.map(r=>opt(CFG.rifle===r.id,'data-r="'+r.id+'"',esc(r.n)+' · '+esc(L(r.cal[0],r.cal[1])),esc(L(r.bul[0],r.bul[1]))+' · BC '+r.model+' '+nf(r.bc,3)+' · V0 '+r.mv+' m/s · '+L('hasta','to')+' '+ni(r.maxV)+' m')).join('')+'</div>';
 h+='<p style="font-size:13.5px;color:#bfc2b8;margin:6px 2px">'+L('Ficha del fusil','Rifle entry')+': <a href="#/a/'+rf.ficha+'">'+esc(rf.n)+'</a></p>';
 h+='<div class="frsec">'+L('Escenario','Location')+'</div><div class="frgrid c2">'+STAGES.map(s=>{ const k=CFG.mode+'|'+s.id+'|'+rf.id; const b=B[k]; return opt(CFG.stage===s.id,'data-s="'+s.id+'"',esc(L(s.n[0],s.n[1])),esc(L(s.d[0],s.d[1]))+' · '+L('latitud','latitude')+' '+nf(s.lat,1)+'°'+(b?' · '+L('récord','best')+' '+b:'')); }).join('')+'</div>';
 h+='<div class="frrow"><span style="color:#bfc2b8">'+L('Unidades del visor','Scope units')+'</span><span class="frseg"><button type="button" data-u="mil" class="'+(CFG.unit==='mil'?'on':'')+'">MIL</button><button type="button" data-u="moa" class="'+(CFG.unit==='moa'?'on':'')+'">MOA</button></span></div>';
  if(CFG.mode!=='desafio') h+='<div class="frrow"><span style="color:#bfc2b8">'+L('Ayuda: observador','Help: spotter')+'</span><span class="frseg"><button type="button" data-sp="1" class="'+(CFG.spot!==false?'on':'')+'">'+L('Sí','On')+'</button><button type="button" data-sp="0" class="'+(CFG.spot===false?'on':'')+'">'+L('No','Off')+'</button></span></div><p style="font-size:12.5px;color:#a8ad98;margin:-4px 2px 8px">'+L('Tras un fallo te dice dónde fue el impacto y la corrección exacta en clics. En Desafío no hay.','After a miss he tells you where the round went and the exact correction in clicks. Not in Challenge.')+'</p>';
 h+='<div class="frrow"><button type="button" class="frbtn" id="frgo">'+L('Ir al puesto de tiro','Go to the firing position')+'</button></div>';
 h+='<p style="font-size:13.5px;color:#bfc2b8">'+L('Solo placas y gongs de acero en un campo de tiro. Sin personas.','Steel plates and gongs on a range only. No people.')+'</p>';
 }
 h+=howHTML()+formulasHTML(false)+validHTML()+'</div>';
 X.set(h,'Francotirador');
 const root=APP;
 root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ CFG.mode=b.getAttribute('data-m'); saveCfg(); intro(); });
 root.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ CFG.rifle=b.getAttribute('data-r'); saveCfg(); intro(); });
 root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ CFG.stage=b.getAttribute('data-s'); saveCfg(); intro(); });
 root.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{ CFG.lesson=+b.getAttribute('data-l'); saveCfg(); intro(); });
 root.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{ CFG.unit=b.getAttribute('data-u'); saveCfg(); intro(); });
 root.querySelectorAll('[data-sp]').forEach(b=>b.onclick=()=>{ CFG.spot=b.getAttribute('data-sp')==='1'; saveCfg(); intro(); });
 const go=document.getElementById('frgo'); if(go) go.onclick=()=>{ if(CFG.mode==='aprende') newLesson(CFG.lesson||0); else newGame(); game(); window.scrollTo(0,0); };
}

/* ===== Dibujo del mundo ===== */

/* ===== Efectos de dibujo (solo imagen: no tocan la balística) ===== */
let NOISE=null; function noiseCv(){ if(NOISE) return NOISE; const n=document.createElement('canvas'); n.width=n.height=160; const x=n.getContext('2d'); const im=x.createImageData(160,160);
  for(let i=0;i<im.data.length;i+=4){ const v=Math.random()*255; im.data[i]=im.data[i+1]=im.data[i+2]=v; im.data[i+3]=255; } x.putImageData(im,0,0); return NOISE=n; }
/* reverberación: franjas horizontales de la imagen desplazadas; más fuerte con calor y aumentos, con deriva según el viento cruzado */
function drawShimmer(c,P,tm,dpr){ if(G.zoom<8||RM()) return; const t=G.targets[G.cur]; if(!t) return; const cr=comps(windAt(tm,bandOf(t.d*0.66)),G.az+t.u*0.0572958).cross;
  const heat=clamp((G.T+8)/48,0.12,1)*(G.st.night?0.35:1); const amp=(0.35+1.1*heat)*Math.min(1.6,G.zoom/12)*dpr; const step=Math.round(5*dpr); const y0=Math.max(0,Math.floor((P.cy-P.r)*dpr)), y1=Math.min(CV.height,Math.ceil((P.cy+P.r)*dpr));
  const sp=Math.abs(cr)<0.7?2.2:3+Math.abs(cr)*0.9; const run=cr*0.9*dpr;
  for(let y=y0;y<y1;y+=step){ const dx=amp*Math.sin(y*0.045/dpr-tm*sp)+amp*0.5*Math.sin(y*0.11/dpr+tm*sp*1.7)+run*Math.sin(tm*0.6+y*0.01); c.drawImage(CACHE.cv,0,y,CV.width,step,dx,y,CV.width,step); } }
/* hierba junto a cada placa: se inclina con el viento cruzado del tramo de esa placa (lo mismo que dicen las banderas) */
function drawGrass(c,P,tm){ const rm=RM(); G.targets.forEach((t,ti)=>{ const x0=PX(P,t.mv?t.u0:t.u); if(x0<P.cx-P.r-80||x0>P.cx+P.r+80) return; const d=t.d-4; const yg=PZ(P,d,t.gy); if(yg<P.cy-P.r||yg>P.cy+P.r+20) return;
   const cr=comps(windAt(tm,bandOf(t.d)),G.az+t.u*0.0572958).cross; const k=1/d*1000*P.s; const hh=0.32*k; if(hh<2) return; const lean=clamp(cr*0.16,-0.95,0.95);
   const spread=(t.mv?t.mv.open/2+3:t.w*3); c.strokeStyle=G.st.night?'rgba(120,130,110,.55)':(G.st.ter==='artico'?'rgba(150,160,170,.6)':(G.st.ter==='desierto'?'rgba(120,92,52,.7)':'rgba(52,64,28,.75)')); c.lineWidth=Math.max(1,0.012*k); c.beginPath();
   for(let j=0;j<26;j++){ const hs=hash(ti*97+j,17); const u=(t.mv?t.u0:t.u)+(hs-0.5)*2*spread/d*1000; const x=PX(P,u); const y=PZ(P,d+(hash(j,ti)-0.5)*3,t.gy); const h=hh*(0.6+0.7*hash(j,ti+5));
     for(let b=-1;b<=1;b++){ const fl=rm?0:Math.sin(tm*(2.2+Math.abs(cr)*0.8)+j*1.3+b)*0.1*clamp(Math.abs(cr)/3,0.2,1); const a=lean+fl+b*0.12; c.moveTo(x+b*1.2,y); c.quadraticCurveTo(x+b*1.2+Math.sin(a)*h*0.4,y-h*0.6,x+b*1.2+Math.sin(a)*h,y-Math.cos(a)*h); } }
   c.stroke(); }); }
/* placas móviles: carril, placa y las dos protecciones del claro (encima de la placa) */
function drawMovers(c,P,tm){ if(G.mode!=='movil') return; G.targets.forEach(t=>{ if(!t.mv) return; const d=t.d; const k=P.scope?1/d*1000*P.s:1/d*1000*P.s*2.2; const m=t.mv;
   const yg=PZ(P,d,t.gy); const half=m.open/2; const uL=t.u0-(half+1.25)*1000/t.R, uR=t.u0+(half+1.25)*1000/t.R;
   if(P.scope){ c.strokeStyle='rgba(40,38,34,.9)'; c.lineWidth=Math.max(1,0.05*k); c.beginPath(); c.moveTo(PX(P,uL),yg); c.lineTo(PX(P,uR),yg); c.stroke(); }
   if(P.scope||mvVis(t,tm)) drawObj(c,P,{k:'plate',t:t,d:d,mv:1});
   const hw=1.25*(P.scope?k:k*0.55), hc=(t.post+t.h+0.45)*k; const night=G.st.night;
   [uL,uR].forEach(u=>{ const x=PX(P,u); const g=c.createLinearGradient(x-hw,0,x+hw,0); g.addColorStop(0,night?'#3b4038':'#8d877a'); g.addColorStop(0.5,night?'#4a5046':'#a69f90'); g.addColorStop(1,night?'#30342e':'#6f6a5f'); c.fillStyle=g; c.fillRect(x-hw,yg-hc,hw*2,hc+1); c.fillStyle='rgba(0,0,0,.18)'; c.fillRect(x-hw,yg-hc,hw*2,Math.max(1,hc*0.08)); });
 }); }
function hitFx(t,rec){ G.fx.push({t:t,t0:performance.now(),dx:rec.dxm,dy:rec.dym}); if(G.fx.length>6) G.fx.shift(); }
/* placa tocada: destello, ondas de «gong» y chispas */
function drawFx(c,P){ if(!G.fx.length) return; const pn=performance.now(); const rm=RM(); c.save(); if(P.scope){ c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.clip(); }
  G.fx=G.fx.filter(f=>pn-f.t0<1100); G.fx.forEach(f=>{ const a=(pn-f.t0)/1000; const t=f.t; const k=P.scope?1/t.d*1000*P.s:1/t.d*1000*P.s*2.2; const x=PX(P,t.u)+(P.scope?f.dx*k:0), y=(P.scope?PY(P,t.e):Math.min(PZ(P,t.d,t.gy)-5,PZ(P,t.d,t.zc)))-(P.scope?f.dy*k:0);
    const R0=Math.max(t.w*k*0.5,6); if(a<0.18){ c.fillStyle='rgba(255,246,210,'+(1-a/0.18)+')'; c.beginPath(); c.arc(x,y,Math.max(3,R0*0.35),0,2*Math.PI); c.fill(); }
    if(rm) return; for(let i=0;i<3;i++){ const b=a-i*0.12; if(b<0||b>0.8) continue; c.strokeStyle='rgba(255,236,170,'+(0.55*(1-b/0.8))+')'; c.lineWidth=Math.max(1,2.2*(1-b/0.8)); c.beginPath(); c.arc(x,y,R0*(0.7+b*2.4),0,2*Math.PI); c.stroke(); }
    if(a<0.35){ c.strokeStyle='rgba(255,220,140,'+(1-a/0.35)+')'; c.lineWidth=1.2; c.beginPath(); for(let i=0;i<9;i++){ const an=i*0.7+hash(i,7)*0.5; const r1=R0*0.3+a*R0*3*(0.6+hash(i,3)); c.moveTo(x+Math.cos(an)*r1*0.6,y-Math.sin(an)*r1*0.6); c.lineTo(x+Math.cos(an)*r1,y-Math.sin(an)*r1); } c.stroke(); } });
  c.restore(); }
/* visor nocturno: escala de grises por saturación, tinte de fósforo verde y grano; térmico: blanco caliente */
function nightFx(c,P,tm,W,H){ c.save(); if(P.scope){ c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.clip(); }
  c.globalCompositeOperation='saturation'; c.fillStyle='#808080'; c.fillRect(0,0,W,H);
  if(G.sensor==='nv'){ c.globalCompositeOperation='multiply'; c.fillStyle='#46ff78'; c.fillRect(0,0,W,H); c.globalCompositeOperation='screen'; c.fillStyle='rgba(8,34,14,1)'; c.fillRect(0,0,W,H); }
  else { c.globalCompositeOperation='screen'; c.fillStyle='rgba(10,10,12,1)'; c.fillRect(0,0,W,H); }
  c.globalCompositeOperation='source-over'; c.globalAlpha=G.sensor==='nv'?0.13:0.06; const n=noiseCv(); const ox=RM()?0:Math.floor(Math.random()*160), oy=RM()?0:Math.floor(Math.random()*160);
  c.save(); c.translate(-ox,-oy); c.fillStyle=c.createPattern(n,'repeat'); c.fillRect(0,0,W+160,H+160); c.restore(); c.globalAlpha=1;
  if(G.sensor==='nv'){ const vg=c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.25,W/2,H/2,Math.max(W,H)*0.7); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,10,0,.55)'); c.fillStyle=vg; c.fillRect(0,0,W,H); }
  c.restore(); }
/* paleta: de día la del escenario; de noche, la que «ve» cada sensor */
function palSt(){ const st=G.st; if(!st.night) return st; const th=G.sensor==='th';
  return Object.assign({},st,th?{sky:['#000000','#08080a'],far:'#202022',hz:'#18181a',mid:'#3a3a37',near:'#4a4a45',berm:'#6a6a66',plate:'#ffffff',edge:'#f0f0f0'}:{sky:['#07090a','#1d231e'],far:'#384036',hz:'#454e43',mid:'#6d7864',near:'#7c8871',berm:'#59634f',plate:'#ffffff',edge:'#c8d0c0'}); }
function hex2rgb(h){ h=h.replace('#',''); return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)]; }
function mix(a,b,t){ t=clamp(t,0,1); return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]; }
function rgb(c,k){ k=k==null?1:k; return 'rgb('+Math.round(clamp(c[0]*k,0,255))+','+Math.round(clamp(c[1]*k,0,255))+','+Math.round(clamp(c[2]*k,0,255))+')'; }
function hash(i,j){ let h=Math.imul(i|0,374761393)+Math.imul(j|0,668265263); h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967296; }
const NB=60, BANDS=[]; for(let k=0;k<NB;k++) BANDS.push(6*Math.pow(12000/6,1-k/(NB-1)));
function viewParams(W,H){ if(G.view==='scope'){ const diam=Math.min(W,H)*0.97; const fov=370/G.zoom; const s=diam/fov; const rc=recoilOff();
    return {scope:true,W:W,H:H,cx:W/2,cy:H/2,r:diam/2,s:s,vx:1,cu:G.aim.u+G.shake.x,ce:G.aim.e+G.shake.y+rc,Y0:H/2}; }
  const s=W/520; return {scope:false,W:W,H:H,cx:W/2,s:s,vx:5,cu:G.pano.u,ce:0,Y0:H*0.36}; }
function PX(P,u){ return P.cx+(u-P.cu)*P.s; }
function PY(P,e){ return P.scope?(P.Y0-(e-P.ce)*P.s):(P.Y0-e*P.vx*P.s); }
function eOf(Z,d){ return Math.atan2(Z-EYE,d)*1000; }
/* a simple vista se usa una perspectiva estilizada (más separación entre distancias) */
function PZ(P,d,Z){ if(P.scope) return PY(P,eOf(Z,d)); if(G&&G.st.ter==='montana') Z-=d*Math.tan(5*Math.PI/180); return P.Y0+P.H*0.085*Math.pow(1000/Math.max(d,5),0.62)-(Z)*1000/Math.max(d,5)*P.s*2.2; }
/* ===== Escenario mejorado (solo dibujo; no toca balística, puntería ni placas) =====
   Cielo en 3 tonos con sol y nubes fijas, perspectiva aérea (bruma con la distancia), luz rasante en las crestas y vegetación.
   Todo determinista (hash, sin azar) y estático: nada se mueve solo. Los árboles nunca tapan una placa: se dejan pasillos libres. */
const ENV={campo:{vis:7000,hzk:0.55,veg:'encina',vd:0.30,cl:0.45},desierto:{vis:4200,hzk:0.6,veg:'mata',vd:0.10,cl:0.15},montana:{vis:14000,hzk:0.45,veg:'pino',vd:0.42,cl:0.55},artico:{vis:9000,hzk:0.5,veg:'abeto',vd:0.16,cl:0.6}};
const SPR={};
function spriteCv(k){ if(SPR[k]) return SPR[k]; const n=document.createElement('canvas'); n.width=n.height=128; const x=n.getContext('2d'); const g=x.createRadialGradient(64,64,0,64,64,64);
  if(k==='sun'){ g.addColorStop(0,'rgba(255,246,220,.42)'); g.addColorStop(0.25,'rgba(255,240,205,.16)'); g.addColorStop(1,'rgba(255,240,205,0)'); }
  else { g.addColorStop(0,'rgba(255,255,255,.75)'); g.addColorStop(0.6,'rgba(250,250,252,.35)'); g.addColorStop(1,'rgba(245,247,250,0)'); }
  x.fillStyle=g; x.fillRect(0,0,128,128); return SPR[k]=n; }
/* pasillos sin vegetación delante de cada placa (y de todo el recorrido de las móviles) */
function vegFree(u,d,wm){ for(const t of G.targets){ if(d>=t.d-2) continue; const half=(t.mv?(t.mv.open/2+t.w):t.w/2)/t.R*1000; const uc=t.mv?t.u0:t.u; if(Math.abs(u-uc)<half+(wm/2)/d*1000+22) return false; } return true; }
function drawTree(c,x,y,hp,kind,night,k){ const w=hp*(kind==='pino'||kind==='abeto'?0.42:(kind==='mata'?1.5:0.95));
  const dark=night?[24,30,22]:(kind==='mata'?[120,104,70]:(kind==='abeto'?[34,52,40]:[52,66,38])), lit=night?[38,46,34]:(kind==='mata'?[160,140,95]:(kind==='abeto'?[66,88,70]:[96,112,62]));
  const a=k; c.fillStyle='rgba(0,0,0,'+(0.18*a)+')'; c.beginPath(); c.ellipse(x+w*0.25,y,w*0.55,Math.max(0.6,hp*0.06),0,0,2*Math.PI); c.fill();
  if(kind==='mata'){ c.fillStyle=rgb(dark); c.beginPath(); c.ellipse(x,y-hp*0.3,w/2,hp*0.32,0,0,2*Math.PI); c.fill(); c.fillStyle=rgb(lit); c.beginPath(); c.ellipse(x-w*0.12,y-hp*0.38,w*0.28,hp*0.18,0,0,2*Math.PI); c.fill(); return; }
  if(hp>6){ c.strokeStyle=night?'#1c1a16':'#4a3a28'; c.lineWidth=Math.max(0.7,hp*0.07); c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-hp*0.45); c.stroke(); }
  if(kind==='pino'||kind==='abeto'){ c.fillStyle=rgb(dark); c.beginPath(); c.moveTo(x,y-hp); c.lineTo(x+w/2,y-hp*0.18); c.lineTo(x-w/2,y-hp*0.18); c.closePath(); c.fill();
    c.fillStyle=rgb(lit); c.beginPath(); c.moveTo(x,y-hp); c.lineTo(x-w*0.08,y-hp*0.25); c.lineTo(x-w/2,y-hp*0.18); c.closePath(); c.fill(); return; }
  /* encina: copa ancha y baja */
  c.fillStyle=rgb(dark); c.beginPath(); c.ellipse(x,y-hp*0.62,w/2,hp*0.36,0,0,2*Math.PI); c.fill();
  c.fillStyle=rgb(lit); c.beginPath(); c.ellipse(x-w*0.14,y-hp*0.72,w*0.28,hp*0.2,0,0,2*Math.PI); c.fill(); }
function drawSky(c,P,st){ const W=P.W, H=P.H, yh=PY(P,0);
  if(st.night){ const sky=c.createLinearGradient(0,0,0,yh); sky.addColorStop(0,st.sky[0]); sky.addColorStop(1,st.sky[1]); c.fillStyle=sky; c.fillRect(0,0,W,H); return; }
  const top=hex2rgb(st.sky[0]), bot=hex2rgb(st.sky[1]), hz=hex2rgb(st.hz); const vx=P.scope?1:P.vx; const yA=yh-260*vx*P.s, yB=yh-40*vx*P.s;
  const g=c.createLinearGradient(0,Math.min(yA,yh-1),0,yh); g.addColorStop(0,rgb(mix(top,[20,40,90],0.12))); g.addColorStop(clamp((yB-yA)/((yh-yA)||1),0.05,0.95),rgb(mix(top,bot,0.55))); g.addColorStop(1,rgb(mix(bot,hz,0.5)));
  c.fillStyle=g; const yF=clamp(yh+4,0,H); c.fillRect(0,0,W,yF); if(yF<H){ c.fillStyle=rgb(mix(bot,hz,0.5)); c.fillRect(0,yF,W,H-yF); }
  /* sol bajo a la izquierda del campo (fijo en el cielo) */
  const sx=PX(P,-900), sy=PY(P,150*(P.scope?1:0.35)), sr=Math.max(W,H)*0.6; if(sx+sr>0&&sx-sr<W&&sy+sr>0&&sy-sr<yh){ c.save(); c.beginPath(); c.rect(0,0,W,Math.max(0,yh)); c.clip(); c.drawImage(spriteCv('sun'),sx-sr,sy-sr,sr*2,sr*2); c.restore(); }
  /* nubes: cúmulos suaves y fijos */
  const E=ENV[st.ter]||ENV.campo; if(E.cl>0){ for(let i=0;i<26;i++){ const cu=-2600+i*210+hash(i,11)*140, ce=(14+hash(i,12)*46)*(P.scope?1:0.6), cw=50+hash(i,13)*110; const x=PX(P,cu), y=PY(P,ce), wpx=cw*P.s, hpx=cw*0.2*P.s; if(x+wpx<0||x-wpx>W||y+hpx<0||y-hpx*2>H) continue;
    c.save(); c.globalAlpha=E.cl*(0.55+0.45*hash(i,14)); const spr=spriteCv('cloud'); for(let j=0;j<5;j++){ const ox=(hash(i,20+j)-0.5)*wpx*1.2, oy=-hash(i,30+j)*hpx*0.9, rr_=wpx*(0.22+0.18*hash(i,40+j)); c.drawImage(spr,x+ox-rr_,y+oy-rr_*0.55,rr_*2,rr_*1.1); } c.restore(); } } }
/* distancia a lo que hay bajo la cruz de la retícula: placa (distancia exacta) o terreno (aprox.) */
function aimDist(P){ if(!P||!P.scope||!G) return null; const st=G.st;
  for(const t of G.targets){ if(t.mv&&!mvVis(t,now())) continue; const hw=t.w/2/t.R*1000+0.15, hh=t.h/2/t.R*1000+0.15; if(Math.abs(P.cu-t.u)<=hw&&Math.abs(P.ce-t.e)<=hh) return {m:t.R,t:t}; }
  for(let d=8;d<=12000;d*=1.012){ if(eOf(terrain(st,d,P.cu),d)>=P.ce) return {m:d,ground:true}; }
  return {sky:true}; }
function renderWorld(c,P){ const st=palSt(), W=P.W, H=P.H;
  drawSky(c,P,st); const ENVs=ENV[st.ter]||ENV.campo;
  const step=P.scope?4:5; const uL=P.cu-(P.cx+8)/P.s, uR=P.cu+(W-P.cx+8)/P.s;
  /* cordillera lejana */
  const far=hex2rgb(st.far), hz=hex2rgb(st.hz), mid=hex2rgb(st.mid), near=hex2rgb(st.near);
  c.beginPath(); c.moveTo(-5,H+5); for(let x=-5;x<=W+5;x+=step*2){ const u=P.cu+(x-P.cx)/P.s; c.lineTo(x,PY(P,farRidge(st,u)*(P.scope?1:0.5))); } c.lineTo(W+5,H+5); c.closePath(); c.fillStyle=rgb(mix(far,hz,0.45)); c.fill();
  if(st.ter==='montana'||st.ter==='artico'){ c.save(); c.clip(); c.beginPath(); for(let x=-5;x<=W+5;x+=step*2){ const u=P.cu+(x-P.cx)/P.s; const e=farRidge(st,u)*(P.scope?1:0.5); const y=PY(P,e); const y2=PY(P,e*0.78); if(x===-5) c.moveTo(x,y2); c.lineTo(x,y2); } c.lineTo(W+5,-5); c.lineTo(-5,-5); c.closePath(); c.fillStyle='rgba(245,248,252,.75)'; c.fill(); c.restore(); }
  /* objetos ordenados por distancia (de lejos a cerca) */
  const objs=[]; G.targets.forEach(t=>{ objs.push({d:t.d+9,k:'berm',t:t}); if(!t.mv) objs.push({d:t.d,k:'plate',t:t}); }); G.flags.forEach(f=>objs.push({d:f.d,k:'flag',f:f})); objs.sort((a,b)=>b.d-a.d); let oi=0;
  for(let k=0;k<NB;k++){ const d=BANDS[k];
    while(oi<objs.length && objs[oi].d>=d){ drawObj(c,P,objs[oi]); oi++; }
    const lt=Math.log(d/6)/Math.log(2000); let col; if(d>1500) col=mix(mix(mid,far,0.35),hz,clamp((d-1500)/9000,0,0.75)); else col=mix(near,mid,clamp(Math.log(d/40)/Math.log(1500/40),0,1));
    const kk=0.94+0.1*hash(k,7)+(st.ter==='artico'?0.02:0);
    c.beginPath(); c.moveTo(-5,H+5); let first=true;
    const RP=[]; for(let x=-5;x<=W+5;x+=step){ const u=P.cu+(x-P.cx)/P.s; const y=PZ(P,d,terrain(st,d,u)); c.lineTo(x,y); RP.push(x,y); }
    c.lineTo(W+5,H+5); c.closePath();
    if(!st.night) col=mix(col,hz,(1-Math.exp(-d/ENVs.vis))*ENVs.hzk);
    c.fillStyle=rgb(col,kk); c.fill();
    /* luz rasante en la cresta de cada loma (una línea, barata) */
    if(!st.night&&k%3===1&&d<3000){ c.beginPath(); for(let q=0;q<RP.length;q+=2){ if(q) c.lineTo(RP[q],RP[q+1]+0.6); else c.moveTo(RP[q],RP[q+1]+0.6); } c.strokeStyle=rgb(col,kk*1.12); c.lineWidth=d<400?1.6:1; c.stroke(); }
    /* vegetación (árboles/matas) en lomas medias, sin tapar nunca una placa */
    if(ENVs.vd>0&&d>170&&d<(P.scope?2600:1800)&&(k%2===0)){ const hm=ENVs.veg==='pino'?9:(ENVs.veg==='abeto'?7:(ENVs.veg==='mata'?1.2:5.5)); const hp=hm/d*1000*P.s*(P.scope?1:2.2); if(hp>=2){ const spm=Math.max(18,d*0.05), sp=spm/d*1000; const j0=Math.floor(uL/sp), j1=Math.ceil(uR/sp); let nd=0;
      if(j1-j0<400) for(let j=j0;j<=j1&&nd<70;j++){ const hh=hash(j,k*17+5); if(hh>ENVs.vd) continue; const u=(j+hash(j,k*17+6))*sp; if(!vegFree(u,d,hm)) continue; const x=PX(P,u); const y=PZ(P,d,terrain(st,d,u)); const hk=hp*(0.75+0.5*hash(j,k*17+7)); drawTree(c,x,y+hk*0.04,hk,ENVs.veg,!!st.night,1); nd++; } } }
    /* detalle: matas/piedras (solo en el visor o cerca) */
    if(P.scope&&d>110&&d<2200){ const sp=1.6/d*1000; const j0=Math.floor(uL/sp), j1=Math.ceil(uR/sp); if(j1-j0<220){ c.strokeStyle=st.ter==='artico'?'rgba(150,165,180,.45)':(st.ter==='desierto'?'rgba(120,90,55,.4)':'rgba(40,52,25,.5)'); c.lineWidth=1; c.beginPath();
        for(let j=j0;j<=j1;j++){ const hh=hash(j,k*31+3); if(hh<0.4) continue; const u=(j+hash(j,k))*sp; const x=PX(P,u); const y=PZ(P,d,terrain(st,d,u)); const ln=Math.min(14,Math.max(1.5,(0.12+0.25*hh)/d*1000*P.s)); c.moveTo(x,y); c.lineTo(x+(hh-0.7)*ln*0.6,y-ln); c.moveTo(x+2,y); c.lineTo(x+2+(0.5-hh)*ln*0.5,y-ln*0.8); }
        c.stroke(); } }
  }
  if(!st.night){ const yh=PY(P,0); const vx=P.scope?1:P.vx; const hzc=hex2rgb(st.hz); const hb_=Math.min(14*vx*P.s,36); const hg=c.createLinearGradient(0,yh-hb_,0,yh+hb_*0.7); hg.addColorStop(0,'rgba('+hzc.map(Math.round).join(',')+',0)'); hg.addColorStop(0.55,'rgba('+hzc.map(Math.round).join(',')+','+(0.22*ENVs.hzk)+')'); hg.addColorStop(1,'rgba('+hzc.map(Math.round).join(',')+',0)'); c.fillStyle=hg; if(yh+hb_>0&&yh-hb_<H) c.fillRect(0,yh-hb_,W,hb_*1.7); }
  while(oi<objs.length){ drawObj(c,P,objs[oi]); oi++; }
}
function drawObj(c,P,o){ if(o.k==='flag') return; const t=o.t; const st=palSt();
  if(o.k==='berm'){ const d=t.d+9; const x=PX(P,t.u); const yg=PZ(P,d,t.gy); const wpx=Math.max(P.scope?3:6,(t.mv?t.mv.open+6:t.w*4.5)/d*1000*P.s*(P.scope?1:2.2)); const hpx=Math.max(P.scope?2:3,(t.post+t.h*1.6)/d*1000*P.s*(P.scope?1:2.2));
    c.beginPath(); c.ellipse(x,yg,wpx/2,hpx,0,Math.PI,2*Math.PI); c.fillStyle=st.berm||(st.ter==='artico'?'#c9d3dc':(st.ter==='desierto'?'#b58a57':'#7a6a48')); c.fill(); return; }
  const d=t.d; const x=PX(P,t.u); const yg=PZ(P,d,t.gy); const yc=P.scope?PY(P,t.e):Math.min(yg-5,PZ(P,d,t.zc));
  const sx=t.w/d*1000*P.s*(P.scope?1:2.2), sy=t.h/d*1000*P.s*(P.scope?1:2.2); const pano=!P.scope;
  if(pano){ const w=Math.max(4,sx), h=Math.max(4,sy); c.fillStyle='#3b3a34'; c.fillRect(x-0.6,yc,1.2,yg-yc); c.fillStyle=st.night?(st.plate):(t.res==='hit'?'#e6f3b0':'#f2f2ec'); c.fillRect(x-w/2,yc-h/2,w,h);
    return; }
  /* poste y patas */
  c.strokeStyle='#2f2b25'; c.lineWidth=Math.max(1,0.08/d*1000*P.s); c.beginPath(); c.moveTo(x-sx*0.25,yg); c.lineTo(x,yc); c.lineTo(x+sx*0.25,yg); c.stroke();
  let sq=1; if(G.anim&&G.anim.swing&&G.anim.t===t){ const a=(performance.now()-G.anim.swing)/1000; if(a<1.6) sq=Math.cos(a*9)*Math.exp(-a*1.8)*0.6+0.4*Math.cos(a*9*0.5+0.3)*Math.exp(-a*2)+ (1-Math.exp(-a*2))*1; sq=clamp(Math.abs(sq),0.15,1); }
  c.save(); c.translate(x,yc); c.scale(sq,1);
  if(st.night&&G.sensor==='th'){ c.shadowColor='rgba(255,255,255,.85)'; c.shadowBlur=Math.max(3,sx*0.35); }
  /* acero pintado: degradado suave con luz desde arriba a la izquierda */
  const pg=c.createLinearGradient(-sx/2,-sy/2,sx/2,sy/2); if(st.night){ pg.addColorStop(0,st.plate); pg.addColorStop(1,st.plate); } else { pg.addColorStop(0,'#fbfaf4'); pg.addColorStop(0.55,'#e9e7de'); pg.addColorStop(1,'#cfccc1'); }
  c.fillStyle=pg; c.strokeStyle=st.edge||'#5c5a52'; c.lineWidth=Math.max(0.6,sx*0.03);
  if(t.shape==='gong'){ c.beginPath(); c.arc(0,0,sx/2,0,2*Math.PI); c.fill(); c.stroke(); }
  else { c.fillRect(-sx/2,-sy/2,sx,sy); c.strokeRect(-sx/2,-sy/2,sx,sy); }
  t.hits.forEach(hm=>{ c.fillStyle='rgba(70,70,64,.85)'; const rr_=Math.max(1,0.03/d*1000*P.s); c.beginPath(); c.arc(hm[0]/d*1000*P.s,-hm[1]/d*1000*P.s,rr_,0,2*Math.PI); c.fill(); });
  c.restore();
}
/* la bandera se ve contra tu línea de tiro hacia la placa elegida: ángulo con el mástil = 4 × viento cruzado (mph), exacto (sin tope ni redondeo) */
function flagA(){ const t=G.targets[G.cur]||G.targets[0]; return G.az+t.u*0.0572958; }
function flagGeom(f,tm){ const w=windAt(tm,f.band); const cr=comps(w,flagA()).cross; const mph=Math.abs(cr)/0.44704; const th=4*mph; return {th:th,thd:clamp(th,2.5,88),side:cr>=0?1:-1,cross:cr,s:w.s}; }
function drawFlags(c,P,tm){ G.flags.forEach((f,i)=>{ const d=f.d; const x=PX(P,f.u); if(x<-60||x>P.W+60) return; const yg=PZ(P,d,f.gy);
   const k=P.scope?1/d*1000*P.s:Math.max(1000/d*P.s*2.2, 5); const pole=4*k; const top=yg-pole;
   c.strokeStyle='#d9d6cc'; c.lineWidth=Math.max(1,0.08*k); c.beginPath(); c.moveTo(x,yg); c.lineTo(x,top); c.stroke();
   const g=flagGeom(f,tm); const th=g.thd*Math.PI/180; const L_=1.6*k, Wd=0.9*k; const dx=Math.sin(th)*g.side, dy=Math.cos(th);
   const hA=Wd*Math.sin(th)+0.12*k; const ex=-dy, ey=dx; c.beginPath(); const n=8; const amp=Wd*0.12*Math.min(1,g.s/4+0.2);
   for(let j=0;j<=n;j++){ const s=j/n; const wv=Math.sin(s*5-tm*(6+g.s*1.5))*amp*s; c.lineTo(x+dx*L_*s+ex*wv, top+dy*L_*s+ey*wv); }
   for(let j=n;j>=0;j--){ const s=j/n; const wv=Math.sin(s*5-tm*(6+g.s*1.5)+0.5)*amp*s; c.lineTo(x+dx*L_*s+ex*wv, top+hA+dy*L_*s+ey*wv); }
   c.closePath(); c.fillStyle=i===0?'#e0472f':(i===1?'#f0a020':'#e0472f'); c.fill();
   if(!P.scope){ c.fillStyle='rgba(0,0,0,.55)'; c.font='600 11px system-ui,sans-serif'; c.fillText(L('B','F')+(i+1),x+3,yg+12); }
 }); }

function recoilOff(){ if(!G.anim||!G.anim.fired) return 0; const a=(performance.now()-G.anim.fired)/1000; const m=G.rf.gr>500?7:(G.rf.gr>250?4:2.5); return a<0.9?m*Math.exp(-a*7)*Math.cos(a*14):0; }
function drawReticle(c,P){ const cx=P.cx, cy=P.cy, s=P.s, R=P.r; const moa=CFG.unit==='moa'; const u=moa?1/MOA_PER_MIL:1; /* paso en mil */
  c.save(); c.beginPath(); c.arc(cx,cy,R,0,2*Math.PI); c.clip();
  const rc=G.st.night?'rgba(255,74,58,.95)':'rgba(8,8,8,.92)'; c.strokeStyle=rc; c.fillStyle=rc; c.lineWidth=1.1; if(G.st.night){ c.shadowColor='rgba(255,60,40,.8)'; c.shadowBlur=3; }
  const lim=moa?30:10; /* extensión fina */ const px=v=>v*u*s;
  c.beginPath(); c.moveTo(cx-px(lim),cy); c.lineTo(cx+px(lim),cy); c.moveTo(cx,cy-px(lim*0.6)); c.lineTo(cx,cy+px(lim)); c.stroke();
  c.lineWidth=Math.max(3,R*0.025); c.beginPath(); c.moveTo(cx-R,cy); c.lineTo(cx-px(lim),cy); c.moveTo(cx+px(lim),cy); c.lineTo(cx+R,cy); c.moveTo(cx,cy+px(lim)); c.lineTo(cx,cy+R); c.moveTo(cx,cy-R); c.lineTo(cx,cy-px(lim*0.6)); c.stroke();
  c.lineWidth=1; const big=moa?5:1, sub=moa?1:0.2; const fs=Math.max(8,Math.min(12,s*u*big*0.42));
  c.font='600 '+fs+'px system-ui,sans-serif'; c.textAlign='center';
  for(let v=-lim; v<=lim+1e-6; v+=sub){ if(Math.abs(v)<1e-6) continue; const isB=Math.abs(v/big-Math.round(v/big))<1e-6; const l=isB?Math.max(5,s*u*big*0.18):Math.max(2.5,s*u*big*0.08);
    if(px(sub)<2.2&&!isB) continue;
    c.beginPath(); c.moveTo(cx+px(v),cy-l); c.lineTo(cx+px(v),cy+l); c.stroke();
    if(v>0&&v<=lim){ c.beginPath(); c.moveTo(cx-l,cy+px(v)); c.lineTo(cx+l,cy+px(v)); c.stroke(); }
    if(v<0&&v>=-lim*0.6){ c.beginPath(); c.moveTo(cx-l,cy+px(v)); c.lineTo(cx+l,cy+px(v)); c.stroke(); }
    if(isB&&Math.abs(Math.round(v))%(moa?10:2)===0&&px(big)>16){ c.fillText(String(Math.abs(Math.round(v))),cx+px(v),cy-l-3); if(v>0) c.fillText(String(Math.round(v)),cx-l-9,cy+px(v)+4); } }
  /* árbol de viento */
  const rowStep=moa?5:1; for(let k=1;k*rowStep<=lim;k++){ const yv=k*rowStep; const n=Math.min(1+Math.floor(k/2)+1,5); for(let j=-n;j<=n;j++){ if(j===0) continue; const xv=j*(moa?5:1); const r=Math.max(1,Math.min(2.2,s*u*0.04)); c.beginPath(); c.arc(cx+px(xv),cy+px(yv),r,0,2*Math.PI); c.fill(); } }
  c.fillStyle=G.st.night?'#ffd0c8':'#ff3b2f'; c.beginPath(); c.arc(cx,cy,Math.max(1.6,Math.min(3,s*0.05)),0,2*Math.PI); c.fill();
  c.restore(); }
function drawMirage(c,P,tm){ if(G.zoom<8) return; const t=G.targets[G.cur]; const band=bandOf(t.d*0.66); const cr=comps(windAt(tm,band),G.az).cross; const k=clamp((G.T+8)/48,0.12,1);
  c.save(); c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.clip(); c.lineWidth=2; c.strokeStyle='rgba(255,255,255,'+(0.035+0.05*k)+')';
  const sp=cr*14; const boil=Math.abs(cr)<0.7;
  for(let i=0;i<14;i++){ const y0=P.cy-P.r+(i+0.5)*(2*P.r/14); c.beginPath(); for(let x=P.cx-P.r; x<=P.cx+P.r; x+=6){ const ph=(x-(boil?0:tm*sp))*0.045+i*1.7; const yy=y0+Math.sin(ph)*(3+3*k)+(boil?Math.sin(tm*5+i+x*0.02)*2.5*k:0); if(x===P.cx-P.r) c.moveTo(x,yy); else c.lineTo(x,yy); } c.stroke(); }
  c.restore(); }
function drawTrace(c,P){ const A=G.anim; if(!A||!A.track) return; const a=(performance.now()-A.fired)/1000-0.05; if(a<0) return; const tr=A.track;
  c.save(); if(P.scope){ c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.clip(); }
  const pts=[]; for(const p of tr){ if(p[0]<60) continue; if(p[3]>a) break; pts.push([PX(P,A.u+p[2]/p[0]*1000),PY(P,A.e+p[1]/p[0]*1000)]); }
  if(pts.length>1){ const fade=a>A.tof?clamp(1-(a-A.tof)/0.8,0,1):1; c.lineCap='round';
    c.strokeStyle='rgba(235,240,245,'+(0.22*fade)+')'; c.lineWidth=Math.max(3,P.s*0.12); c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.stroke();
    c.strokeStyle='rgba(255,255,255,'+(0.35*fade)+')'; c.lineWidth=1.2; c.stroke(); }
  if(a>A.tof&&!A.hit){ const b=(a-A.tof); if(b<1.3){ const x=PX(P,A.iu), y=PY(P,A.ie); const r=(4+b*30)*Math.max(0.5,P.s/12); c.fillStyle='rgba(176,150,110,'+(0.55*(1-b/1.3))+')'; c.beginPath(); c.arc(x,y,r,0,2*Math.PI); c.fill(); c.beginPath(); c.arc(x+r*0.5,y-r*0.3,r*0.6,0,2*Math.PI); c.fill(); } }
  if(a>A.tof&&A.hit){ const b=(a-A.tof); if(b<0.25){ const x=PX(P,A.iu), y=PY(P,A.ie); c.fillStyle='rgba(255,250,220,'+(1-b/0.25)+')'; c.beginPath(); c.arc(x,y,Math.max(4,P.s*0.3),0,2*Math.PI); c.fill(); } }
  c.restore(); }
function drawPanoMarks(c,P){ G.targets.forEach((t,i)=>{ const x=PX(P,t.u), y=Math.min(PZ(P,t.d,t.gy)-5,PZ(P,t.d,t.zc)); const on=i===G.cur; c.strokeStyle=on?'#ffd23a':'rgba(255,255,255,.75)'; c.lineWidth=on?2:1;
   c.beginPath(); c.moveTo(x,y-6); c.lineTo(x,y-22); c.stroke(); const lab='P'+(i+1)+(t.lased?' · '+ni(t.lased)+' m':''); c.font='700 12px system-ui,sans-serif'; c.textAlign='center';
   const w=c.measureText(lab).width+10; c.fillStyle=on?'rgba(60,48,0,.85)':'rgba(0,0,0,.6)'; c.fillRect(x-w/2,y-38,w,17); c.fillStyle=t.res==='hit'?'#d8f0a0':(t.res==='miss'?'#f2b19e':(on?'#ffe38a':'#fff')); c.fillText(lab,x,y-25);
   if(on){ c.beginPath(); c.arc(x,y,9,0,2*Math.PI); c.stroke(); } });
  /* rosa de rumbo */
  c.textAlign='right'; c.font='600 12px system-ui,sans-serif'; c.fillStyle='rgba(255,255,255,.9)'; const az=(G.az+P.cu*0.0572958+360)%360; c.fillText(L('Rumbo ','Heading ')+Math.round(az)+'°',P.W-10,58); c.textAlign='left'; }
function draw(){ if(!CV||!G) return; const dpr=Math.min(2,window.devicePixelRatio||1); const W=CV.clientWidth, H=CV.clientHeight; if(!W||!H) return;
  if(CV.width!==Math.round(W*dpr)||CV.height!==Math.round(H*dpr)){ CV.width=Math.round(W*dpr); CV.height=Math.round(H*dpr); CACHE=null; }
  const c=CTX; c.setTransform(dpr,0,0,dpr,0,0); const tm=now(); updShake(tm);
  const pn=performance.now(); const dt=G.lastF?Math.min(0.1,(pn-G.lastF)/1000):0; G.lastF=pn; movUpd(tm); trackUpd(dt);
  if(G.bcam){ drawBulletCam(c,W,H,dpr); return; }
  const P=viewParams(W,H); const key=[G.view,P.cu.toFixed(3),P.ce.toFixed(3),P.s.toFixed(4),W,H,G.hitVer||0,G.st.night?G.sensor:''].join('|'); const swinging=G.anim&&G.anim.swing&&pn-G.anim.swing<1700;
  if(!CACHE||CACHE.key!==key||swinging){ if(!CACHE) CACHE={cv:document.createElement('canvas')}; const cc=CACHE.cv; cc.width=CV.width; cc.height=CV.height; const x=cc.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); renderWorld(x,P); CACHE.key=swinging?'':key; }
  c.setTransform(1,0,0,1,0,0); c.drawImage(CACHE.cv,0,0);
  if(P.scope) drawShimmer(c,P,tm,dpr);
  c.setTransform(dpr,0,0,dpr,0,0);
  if(P.scope) drawGrass(c,P,tm);
  drawMovers(c,P,tm);
  drawFlags(c,P,tm);
  if(P.scope){ drawMirage(c,P,tm); drawTrace(c,P); }
  drawFx(c,P);
  if(G.st.night) nightFx(c,P,tm,W,H);
  if(P.scope){
    c.save(); c.fillStyle='#000'; c.beginPath(); c.rect(0,0,W,H); c.arc(P.cx,P.cy,P.r,0,2*Math.PI,true); c.fill('evenodd'); c.restore();
    const vg=c.createRadialGradient(P.cx,P.cy,P.r*0.68,P.cx,P.cy,P.r); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(0.8,'rgba(0,0,0,.35)'); vg.addColorStop(1,'rgba(0,0,0,.9)'); c.fillStyle=vg; c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.fill();
    /* reflejo suave del cristal y anillo del tubo */
    const gl=c.createLinearGradient(P.cx-P.r,P.cy-P.r,P.cx+P.r*0.2,P.cy+P.r*0.2); gl.addColorStop(0,'rgba(255,255,255,.07)'); gl.addColorStop(0.45,'rgba(255,255,255,0)'); c.fillStyle=gl; c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.fill();
    c.strokeStyle='rgba(40,44,40,.9)'; c.lineWidth=3; c.beginPath(); c.arc(P.cx,P.cy,P.r-1,0,2*Math.PI); c.stroke();
    drawReticle(c,P);
    hudScope(c,P,W,H,tm);
  } else { drawPanoMarks(c,P); }
  if(G.iris&&!RM()){ const a=(pn-G.iris)/280; if(a<1){ c.fillStyle='rgba(0,0,0,'+(1-a)*(1-a)+')'; c.fillRect(0,0,W,H); } else G.iris=0; }
}
/* ===== Cámara bala: la cámara sigue a la bala por su trayectoria real (la misma que calcula el integrador), en cámara lenta, hasta la placa ===== */
function v3(x,y,z){ return [x,y,z]; } function vsub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; } function vadd(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; } function vmul(a,k){ return [a[0]*k,a[1]*k,a[2]*k]; }
function vdot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; } function vcross(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; } function vnorm(a){ const l=Math.hypot(a[0],a[1],a[2])||1; return [a[0]/l,a[1]/l,a[2]/l]; }
function camStart(rec,anim,done){ const tr=anim.track; if(!tr||tr.length<4) return false; const T=anim.tof; const D=clamp(2.4+1.5*Math.sqrt(T),3,6.5);
  /* mundo: X hacia el blanco (m), Y altura (m, terreno + ojo), Z a la derecha (m) */
  const pts=tr.map(p=>[p[0],EYE+p[0]*Math.tan(anim.e/1000)+p[1],p[0]*Math.tan(anim.u/1000)+p[2],p[3]]); pts.unshift([0,EYE-G.rf.sh,0,0]);
  G.bcam={t0:performance.now(),T:T,D:D,pts:pts,rec:rec,t:anim.t,done:done,hold:1.5,stopD:Math.max(8,anim.t.w*7)}; const m=document.getElementById('frmsg'); if(m) m.hidden=true; const hn=document.getElementById('frhint'); if(hn) hn.style.opacity='0'; return true; }
function camAt(B,tau){ const p=B.pts; if(tau<=0) return p[0].slice(0,3); for(let i=1;i<p.length;i++){ if(p[i][3]>=tau){ const a=p[i-1],b=p[i],f=(tau-a[3])/((b[3]-a[3])||1); return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]; } } const q=p[p.length-1]; return [q[0],q[1],q[2]]; }
function camEnd(){ const B=G.bcam; if(!B) return; G.bcam=null; CACHE=null; const hn=document.getElementById('frhint'); if(hn) hn.style.opacity=''; if(B.done) B.done(); }
function drawBulletCam(c,W,H,dpr){ const B=G.bcam; const st=palSt(); const pn=performance.now(); const el=(pn-B.t0)/1000; const T=B.T;
  if(B.skip||el>B.D+B.hold){ camEnd(); return; }
  const u=clamp(el/B.D,0,1); const w=u-0.8*Math.sin(2*Math.PI*u)/(2*Math.PI); const tau=T*w;
  const Rt=B.rec.R; const bp=camAt(B,tau); const ahead=camAt(B,Math.min(T,tau+0.02)); let dir=vnorm(vsub(ahead,bp)); if(tau>=T) dir=B.lastDir||dir; B.lastDir=dir;
  /* la cámara va 2,4 m detrás y algo por encima; a 9 m de la placa se queda quieta y la bala se aleja hacia el impacto */
  const camFor=x=>{ const p=camAt(B,x); const a=camAt(B,Math.min(T,x+0.02)); const d=vnorm(vsub(a,p)); const r0=vnorm(vcross(d,[0,1,0])); return vadd(vadd(vadd(p,vmul(d,-0.7)),[0,0.06,0]),vmul(r0,-0.12)); };
  let tStop=T; for(let i=B.pts.length-1;i>0;i--){ if(B.pts[i][0]<Rt-B.stopD){ const a=B.pts[i],b=B.pts[i+1]||a; const f=b[0]>a[0]?(Rt-B.stopD-a[0])/(b[0]-a[0]):0; tStop=a[3]+(b[3]-a[3])*clamp(f,0,1); break; } }
  const cam=camFor(Math.min(tau,tStop)); const t=B.t; const tgt=[t.d,t.zc,(B.rec.uA!=null?B.rec.uA:t.u)/1000*t.d];
  const k=clamp((tau-tStop*0.55)/(tStop*0.4+1e-6),0,1); const kk=k*k*(3-2*k); let look=vnorm(vadd(vadd(vmul(dir,1-kk),vmul(vnorm(vsub(tgt,cam)),kk)),[0,-0.01*(1-kk),0]));
  if(tau>tStop){ look=vnorm(vsub(tgt,cam)); }
  const up0=[0,1,0]; const rgt=vnorm(vcross(look,up0)); const upv=vcross(rgt,look); const F=Math.max(W,H)*1.3; const cx=W/2, cy=H*0.5;
  const pr=P_=>{ const d=vsub(P_,cam); const z=vdot(d,look); if(z<0.25) return null; return [cx+vdot(d,rgt)/z*F, cy-vdot(d,upv)/z*F, z]; };
  /* cielo */
  const hzY=cy+vdot([0,0,0],upv)-(look[1]/Math.max(0.2,Math.hypot(look[0],look[2])))*F; const sky=c.createLinearGradient(0,0,0,Math.max(10,hzY)); sky.addColorStop(0,st.sky[0]); sky.addColorStop(1,st.sky[1]); c.fillStyle=sky; c.fillRect(0,0,W,H);
  if(!st.night){ const sg=c.createRadialGradient(W*0.78,hzY-H*0.25,4,W*0.78,hzY-H*0.25,H*0.6); sg.addColorStop(0,'rgba(255,248,225,.45)'); sg.addColorStop(1,'rgba(255,248,225,0)'); c.fillStyle=sg; c.fillRect(0,0,W,H); }
  const far=hex2rgb(st.far), hz=hex2rgb(st.hz), mid=hex2rgb(st.mid), near=hex2rgb(st.near);
  /* cordillera lejana */
  c.beginPath(); c.moveTo(-5,H+5); for(let i=0;i<=40;i++){ const L_=cam[2]+(i/40-0.5)*9000; const X=cam[0]+6000; const u_=L_/X*1000; const p=pr([X,EYE+farRidge(G.st,u_)/1000*X,L_]); if(p) c.lineTo(p[0],p[1]); } c.lineTo(W+5,H+5); c.closePath(); c.fillStyle=rgb(mix(far,hz,0.45)); c.fill();
  /* terreno por franjas, de lejos a cerca */
  const x0=cam[0]+1.2, x1=Math.max(Rt+400,cam[0]+600); const NBc=46; const objs=[];
  G.targets.forEach(tt=>objs.push({d:tt.d,t:tt})); G.flags.forEach(f=>objs.push({d:f.d,f:f})); objs.sort((a,b)=>b.d-a.d); let oi=0; while(oi<objs.length&&objs[oi].d>x1) oi++;
  for(let kb=0;kb<NBc;kb++){ const X=x0+(x1-x0)*Math.pow(1-kb/(NBc-1),2.6); while(oi<objs.length&&objs[oi].d>=X){ camObj(c,pr,objs[oi],st,pn,B); oi++; }
    const dd=X; let col; if(dd>1500) col=mix(mix(mid,far,0.35),hz,clamp((dd-1500)/9000,0,0.75)); else col=mix(near,mid,clamp(Math.log(Math.max(40,dd)/40)/Math.log(1500/40),0,1));
    const kz=0.985+0.03*Math.sin(X*0.013); const spread=(X-cam[0])*1.4+6; c.beginPath(); c.moveTo(-5,H+5); let any=false;
    for(let i=0;i<=28;i++){ const L_=cam[2]+(i/28-0.5)*2*spread; const u_=L_/Math.max(X,1)*1000; const p=pr([X,terrain(G.st,X,u_),L_]); if(p){ c.lineTo(p[0],p[1]); any=true; } }
    c.lineTo(W+5,H+5); c.closePath(); if(any){ c.fillStyle=rgb(col,kz); c.fill(); }
    /* matas cercanas: dan la sensación de velocidad */
    const rel=X-cam[0]; if(rel<260){ c.strokeStyle=st.night?'rgba(150,160,140,.35)':(G.st.ter==='artico'?'rgba(140,155,170,.5)':(G.st.ter==='desierto'?'rgba(120,90,55,.5)':'rgba(40,52,25,.5)')); c.lineWidth=rel<30?1.5:1; c.beginPath(); for(let j=0;j<(rel<40?26:14);j++){ const L_=cam[2]+(hash(Math.floor(X*3),j)-0.5)*spread*1.6; const gy=terrain(G.st,X,L_/Math.max(X,1)*1000); const a=pr([X,gy,L_]), b=pr([X,gy+0.25+0.25*hash(j,Math.floor(X)),L_]); if(a&&b){ c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); } } c.stroke(); } }
  while(oi<objs.length){ camObj(c,pr,objs[oi],st,pn,B); oi++; }
  /* estelas de velocidad hacia los bordes (solo imagen) */
  if(tau<tStop){ const vp=pr(vadd(cam,vmul(look,1000)))||[cx,cy]; c.save(); c.lineCap='round'; for(let i=0;i<22;i++){ const an=hash(i,31)*Math.PI*2; const ph=((pn/1000)*1.6+hash(i,5))%1; const r1=Math.max(W,H)*(0.32+ph*0.55), r2=r1+Math.max(W,H)*(0.06+0.08*ph);
      c.strokeStyle='rgba(255,255,255,'+(0.10*ph)+')'; c.lineWidth=1+ph; c.beginPath(); c.moveTo(vp[0]+Math.cos(an)*r1,vp[1]+Math.sin(an)*r1); c.lineTo(vp[0]+Math.cos(an)*r2,vp[1]+Math.sin(an)*r2); c.stroke(); } c.restore(); }
  /* bruma de distancia junto al horizonte */
  if(!st.night){ const fg=c.createLinearGradient(0,hzY-H*0.06,0,hzY+H*0.12); fg.addColorStop(0,'rgba(215,225,232,0)'); fg.addColorStop(0.5,'rgba(215,225,232,.22)'); fg.addColorStop(1,'rgba(215,225,232,0)'); c.fillStyle=fg; c.fillRect(0,hzY-H*0.06,W,H*0.18); }
  /* bala: estela, cono de Mach si va supersónica y el proyectil */
  const hitT=tau>=T; const bs=pr(bp);
  if(bs&&!hitT){ const back=pr(vadd(bp,vmul(dir,-1.2))), tip=pr(vadd(bp,vmul(dir,0.06))); const vNow=Math.hypot(...vsub(camAt(B,Math.min(T,tau+0.002)),bp))/0.002||0; const M=vNow/G.env.a;
    const bk=pr(vadd(bp,vmul(dir,-0.22))); if(bk){ const g=c.createLinearGradient(bk[0],bk[1],bs[0],bs[1]); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(255,250,235,.45)'); c.strokeStyle=g; c.lineCap='round'; c.lineWidth=Math.max(2,0.012/bs[2]*F*3); c.beginPath(); c.moveTo(bk[0],bk[1]); c.lineTo(bs[0],bs[1]); c.stroke(); }
    if(M>1.02&&!RM()){ const rr2=Math.max(4,G.rf.dIn*0.0254*2.2/bs[2]*F); c.strokeStyle='rgba(255,255,255,.18)'; c.lineWidth=1; for(let i=0;i<3;i++){ const ph=((pn/1000)*3+i/3)%1; c.globalAlpha=1-ph; c.beginPath(); c.arc(bs[0],bs[1],rr2*(1.6+ph*3.2),0,2*Math.PI); c.stroke(); } c.globalAlpha=1; }
    /* proyectil visto desde atrás: base, cuerpo y ojiva proyectados en 3D (escala ×2,2 para que se lea) */
    const cal=G.rf.dIn*0.0254*2.2, Lb=cal*3.4; const pB=pr(vadd(bp,vmul(dir,-Lb*0.5))), pT=pr(vadd(bp,vmul(dir,Lb*0.5)));
    if(pB&&pT){ const rB=Math.max(3,cal/2/pB[2]*F), rT=Math.max(1,cal*0.12/pT[2]*F); const ang=Math.atan2(pT[1]-pB[1],pT[0]-pB[0]); const len=Math.hypot(pT[0]-pB[0],pT[1]-pB[1]);
      c.save(); c.translate(pB[0],pB[1]); c.rotate(ang); const bg=c.createLinearGradient(0,-rB,0,rB); bg.addColorStop(0,'#f6d7a2'); bg.addColorStop(0.42,'#c78748'); bg.addColorStop(1,'#5d391b'); c.fillStyle=bg;
      c.beginPath(); c.moveTo(0,-rB); c.lineTo(len*0.55,-rB*0.98); c.quadraticCurveTo(len*0.92,-rB*0.7,len,-rT); c.lineTo(len,rT); c.quadraticCurveTo(len*0.92,rB*0.7,len*0.55,rB*0.98); c.lineTo(0,rB); c.closePath(); c.fill();
      c.fillStyle='#4a2d15'; c.beginPath(); c.ellipse(0,0,Math.max(1,rB*Math.min(1,0.25+0.75*rB/Math.max(rB,len))),rB,0,0,2*Math.PI); c.fill();
      const ph=(tau*G.rf.mv/(G.rf.twistIn*0.0254))*2*Math.PI; c.strokeStyle='rgba(255,236,200,.5)'; c.lineWidth=1; c.beginPath(); const yy=Math.sin(ph)*rB*0.7; c.moveTo(len*0.05,yy); c.lineTo(len*0.6,yy*0.95); c.stroke(); c.restore(); } }
  /* impacto */
  if(hitT){ const ps=pr(tgt); const a=el-B.D*1; if(ps){ const R0=Math.max(8,t.w/ps[2]*F*0.5); if(a<0.22){ c.fillStyle='rgba(255,248,215,'+(1-a/0.22)+')'; c.beginPath(); c.arc(ps[0],ps[1],R0*1.4,0,2*Math.PI); c.fill(); }
      for(let i=0;i<3;i++){ const b=a-i*0.14; if(b<0||b>1) continue; c.strokeStyle='rgba(255,232,160,'+(0.6*(1-b))+')'; c.lineWidth=2*(1-b)+0.5; c.beginPath(); c.arc(ps[0],ps[1],R0*(0.8+b*3),0,2*Math.PI); c.stroke(); }
      if(a<0.5){ c.strokeStyle='rgba(255,214,130,'+(1-a/0.5)+')'; c.lineWidth=1.4; c.beginPath(); for(let i=0;i<14;i++){ const an=i*0.45+hash(i,9); const r1=R0*(0.4+a*5*(0.5+hash(i,4))); c.moveTo(ps[0]+Math.cos(an)*r1*0.55,ps[1]-Math.sin(an)*r1*0.55); c.lineTo(ps[0]+Math.cos(an)*r1,ps[1]-Math.sin(an)*r1); } c.stroke(); } } }
  if(G.st.night) nightFx(c,{scope:false},performance.now()/1000,W,H);
  /* letterbox y datos reales del vuelo */
  const bar=Math.round(H*0.075); c.fillStyle='rgba(0,0,0,.82)'; c.fillRect(0,0,W,bar); c.fillRect(0,H-bar,W,bar);
  const vNow2=hitT?B.rec.v:(Math.hypot(...vsub(camAt(B,Math.min(T,tau+0.002)),bp))/0.002); const drop=bp[1]-(EYE+bp[0]*Math.tan(B.pts.length?0:0));
  c.font='800 12px system-ui,sans-serif'; c.textAlign='left'; c.fillStyle='#e3b94a'; c.fillText(L('CÁMARA BALA','BULLET CAM'),12,bar*0.62); c.fillStyle='rgba(235,240,225,.8)'; c.font='600 11px system-ui,sans-serif'; c.fillText(L(' · cámara lenta',' · slow motion'),12+c.measureText(L('CÁMARA BALA','BULLET CAM')).width+18,bar*0.62);
  c.textAlign='right'; c.font='700 12px system-ui,sans-serif'; c.fillStyle='#fff'; c.fillText(L('Saltar ›','Skip ›'),W-12,bar*0.62);
  const seg=hitT?[ni(Rt)+' m',nf(T,2)+' s',Math.round(B.rec.v)+' m/s']:[ni(Math.max(0,bp[0]))+' m',nf(tau,2)+' s',Math.round(vNow2)+' m/s · Mach '+nf(vNow2/G.env.a,2)];
  c.font='700 13px system-ui,sans-serif'; c.fillStyle='#f0f2e6'; c.textAlign='left'; c.fillText(seg[0]+'  ·  '+seg[1],12,H-bar*0.38); c.textAlign='right'; c.fillText(seg[2],W-12,H-bar*0.38);
  const los=bp[1]-(EYE+bp[0]*Math.tan(B.rec.ie/1000)); if(!hitT){ c.textAlign='center'; c.font='600 11.5px system-ui,sans-serif'; c.fillStyle='rgba(235,240,225,.85)'; c.fillText(L('sobre la línea de mira ','above line of sight ')+(los>=0?'+':'−')+nf(Math.abs(los),2)+' m',W/2,bar+18); }
  if(hitT){ const a=el-B.D; c.globalAlpha=clamp(a/0.3,0,1); c.textAlign='center'; c.fillStyle='#e9ffb0'; c.font='400 '+Math.round(Math.min(W,H)*0.12)+'px Anton,Impact,sans-serif'; c.fillText(L('IMPACTO','HIT'),W/2,H*0.3); c.font='700 14px system-ui,sans-serif'; c.fillStyle='#fff'; c.fillText(ni(Rt)+' m · '+nf(T,2)+' s',W/2,H*0.3+26); if(t.rec){ c.font='600 12.5px system-ui,sans-serif'; c.fillStyle='#e3b94a'; c.fillText(L('distancia del récord de ','record distance of ')+t.rec.y,W/2,H*0.3+46); } c.globalAlpha=1; }
  if(u<0.06&&!RM()){ c.fillStyle='rgba(0,0,0,'+(1-u/0.06)+')'; c.fillRect(0,0,W,H); }
  if(el>B.D+B.hold-0.3){ c.fillStyle='rgba(0,0,0,'+clamp((el-(B.D+B.hold-0.3))/0.3,0,1)+')'; c.fillRect(0,0,W,H); }
}
function camObj(c,pr,o,st,pn,B){ if(o.f){ const f=o.f; const L_=f.u/1000*f.d; const a=pr([f.d,f.gy,L_]), b=pr([f.d,f.gy+4,L_]); if(!a||!b) return; c.strokeStyle='#d9d6cc'; c.lineWidth=Math.max(1,(a[1]-b[1])*0.02); c.beginPath(); c.moveTo(a[0],a[1]); c.lineTo(b[0],b[1]); c.stroke();
    const g=flagGeom(f,now()); const th=g.thd*Math.PI/180; const tip=pr([f.d,f.gy+4-1.6*Math.cos(th),L_+1.6*Math.sin(th)*g.side]), lo=pr([f.d,f.gy+3.1-1.6*Math.cos(th)*0.8,L_+1.6*Math.sin(th)*g.side*0.9]); const b2=pr([f.d,f.gy+3.1,L_]);
    if(tip&&lo&&b2){ c.fillStyle='#e0472f'; c.beginPath(); c.moveTo(b[0],b[1]); c.lineTo(tip[0],tip[1]); c.lineTo(lo[0],lo[1]); c.lineTo(b2[0],b2[1]); c.closePath(); c.fill(); } return; }
  const t=o.t; const uu=(t===B.t&&B.rec.uA!=null)?B.rec.uA:t.u; const L_=uu/1000*t.d; const L0=(t.mv?t.u0:t.u)/1000*t.d;
  const base=pr([t.d,t.gy,L_]), top=pr([t.d,t.zc,L_]); if(!base||!top) return; const sc=(top[1]-base[1])/(t.zc-t.gy||1); const px=Math.abs(sc);
  /* talud detrás: perfil bajo proyectado de verdad */ { const hw=(t.mv?t.mv.open/2+3:t.w*2.2), hh=t.post+t.h*1.3; c.beginPath(); let ok=false; for(let i=0;i<=16;i++){ const f=i/16*2-1; const p=pr([t.d+7,t.gy+hh*Math.sqrt(Math.max(0,1-f*f)),L0+f*hw]); if(p){ if(!ok){ c.moveTo(p[0],p[1]); ok=true; } else c.lineTo(p[0],p[1]); } } const pe=pr([t.d+7,t.gy,L0+hw]), ps0=pr([t.d+7,t.gy,L0-hw]); if(ok&&pe&&ps0){ c.lineTo(pe[0],pe[1]); c.lineTo(ps0[0],ps0[1]); c.closePath(); c.fillStyle=st.berm||(st.ter==='artico'?'#c9d3dc':(st.ter==='desierto'?'#b58a57':'#7a6a48')); c.fill(); } }
  c.strokeStyle='#2f2b25'; c.lineWidth=Math.max(1,0.06*px); c.beginPath(); c.moveTo(base[0],base[1]); c.lineTo(top[0],top[1]+t.h/2*px); c.stroke();
  let sw=1; if(t===B.t&&pn-B.t0>B.D*1000){ const a=(pn-B.t0)/1000-B.D; sw=Math.cos(a*8)*Math.exp(-a*1.6)*0.55+0.45+(1-Math.exp(-a*2))*0.55; sw=clamp(Math.abs(sw),0.12,1); }
  const sx=t.w*px, sy=t.h*px*sw; c.save(); if(st.night&&G.sensor==='th'){ c.shadowColor='rgba(255,255,255,.85)'; c.shadowBlur=Math.max(3,sx*0.3); }
  const pg=c.createLinearGradient(top[0]-sx/2,top[1]-sy/2,top[0]+sx/2,top[1]+sy/2); if(st.night){ pg.addColorStop(0,st.plate); pg.addColorStop(1,st.plate); } else { pg.addColorStop(0,'#fbfaf4'); pg.addColorStop(0.55,'#e9e7de'); pg.addColorStop(1,'#cfccc1'); } c.fillStyle=pg; c.strokeStyle=st.edge||'#5c5a52'; c.lineWidth=Math.max(0.6,sx*0.03);
  if(t.shape==='gong'){ c.beginPath(); c.ellipse(top[0],top[1],sx/2,Math.max(0.5,sy/2),0,0,2*Math.PI); c.fill(); c.stroke(); } else { c.fillRect(top[0]-sx/2,top[1]-sy/2,sx,sy); c.strokeRect(top[0]-sx/2,top[1]-sy/2,sx,sy); }
  c.restore();
  /* marca del impacto en el acero, en el punto exacto calculado */
  if(t===B.t&&pn-B.t0>B.D*1000&&B.rec.hit){ const mx=top[0]+B.rec.dxm*px, my=top[1]-B.rec.dym*px*sw; c.fillStyle='rgba(70,62,52,.9)'; c.beginPath(); c.arc(mx,my,Math.max(1.5,0.045*px),0,2*Math.PI); c.fill(); c.strokeStyle='rgba(120,110,95,.6)'; c.lineWidth=1; c.beginPath(); c.arc(mx,my,Math.max(2.5,0.08*px),0,2*Math.PI); c.stroke(); }
  if(t.mv){ [-1,1].forEach(sg=>{ const Lc=L0+sg*(t.mv.open/2+1.25); const a=pr([t.d-1,t.gy,Lc]), b=pr([t.d-1,t.gy+t.post+t.h+0.45,Lc]); if(a&&b){ const hw=1.25*Math.abs(b[1]-a[1])/(t.post+t.h+0.45); c.fillStyle=st.night?'#3b4038':'#8d877a'; c.fillRect(a[0]-hw,b[1],hw*2,a[1]-b[1]); } }); } }
function hudScope(c,P,W,H,tm){ c.save(); c.font='600 12px system-ui,sans-serif'; c.textBaseline='alphabetic';
  const pill=(txt,x,y,al,col)=>{ c.font='700 11.5px system-ui,sans-serif'; const w=c.measureText(txt).width+12; const x0=al==='right'?x-w:(al==='center'?x-w/2:x); c.fillStyle='rgba(0,0,0,.55)'; c.beginPath(); if(c.roundRect) c.roundRect(x0,y-14,w,19,9); else c.rect(x0,y-14,w,19); c.fill(); c.fillStyle=col||'rgba(235,240,225,.95)'; c.textAlign='left'; c.fillText(txt,x0+6,y); };
  pill(G.zoom+'×',8,22,'left'); pill(CFG.unit==='moa'?'MOA':'MIL',W-8,22,'right'); const yb=H-38;
  /* distancia bajo la cruz, pequeña, arriba a la derecha (no tapa la retícula) */
  { const k=[P.cu.toFixed(2),P.ce.toFixed(2),G.cur,G.zoom].join('|'); if(!G.adK||G.adK!==k||(G.mode==='movil')){ G.adK=k; G.adV=aimDist(P); } const a=G.adV;
    const txt=!a||a.sky?'⌖ —':(a.ground&&a.m>6000?'⌖ > 6 km':('⌖ '+(a.ground?'≈ '+ni(Math.round(a.m/5)*5):ni(a.m))+' m')); c.save(); c.font='700 11px system-ui,sans-serif'; const w=c.measureText(txt).width+10; c.fillStyle='rgba(0,0,0,.5)'; c.beginPath(); if(c.roundRect) c.roundRect(W-8-w,30,w,16,8); else c.rect(W-8-w,30,w,16); c.fill(); c.fillStyle=a&&a.t?'#d8f0a0':'rgba(235,240,225,.9)'; c.textAlign='left'; c.textBaseline='alphabetic'; c.fillText(txt,W-8-w+5,42); c.restore(); }
  const t=G.targets[G.cur]; if(t){ let lab='P'+(t.i+1)+(t.lased?' · '+ni(t.lased)+' m':''); if(t.mv) lab+=' · '+nf(t.mv.v,1)+' m/s '+(t.mv.dir>0?'→':'←'); pill(lab,8,yb,'left'); }
  if(G.st.night) pill(G.sensor==='nv'?L('VISIÓN NOCTURNA','NIGHT VISION'):L('TÉRMICO','THERMAL'),W-8,yb,'right',G.sensor==='nv'?'#9dff9d':'#f2f2f2');
  if(G.breath){ const hb=(performance.now()-G.breath)/1000; pill(L('Respiración contenida ','Breath held ')+nf(hb,1)+' s',W/2,yb-24,'center',hb>6?'#ffb08a':'#d8f0a0'); }
  if(G.mode==='movil'&&t&&t.mv&&!t.res){ if(t.tofE==null) t.tofE=shotFlight({R:t.R,u:t.u0,e:t.e,t:0,alpha:0,beta:0,nowind:true,nocor:true,nospin:true}).t; const ok=mvOK(t,now(),t.tofE+0.05); if(!ok) pill(L('Placa tapada a la llegada: espera','Plate behind cover on arrival: wait'),W/2,yb-24,'center','#ffcf8a'); }
  c.restore(); }
function updShake(tm){ if(G.breath){ const hb=(performance.now()-G.breath)/1000; if(hb>12){ G.breath=0; msg(L('Has soltado el aire','You let your breath go')); }
   const a=hb>6?Math.min(0.5,(hb-6)*0.09):0; G.shake.x=a*(Math.sin(tm*7.3)+0.6*Math.sin(tm*12.9+1)); G.shake.y=a*(Math.cos(tm*6.1)+0.5*Math.sin(tm*10.7)); }
  else { G.shake.x=0; G.shake.y=0; } }
function loop(){ RAF=0; if(!CV||!document.body.contains(CV)){ CV=null; return; } draw(); RAF=requestAnimationFrame(loop); }
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF=0; CV=null; if(G&&G.timer){ clearInterval(G.timer); G.timer=0; } }
let MSGT=0; function msg(t,cls){ const m=document.getElementById('frmsg'); if(!m) return; m.textContent=t; m.className='frmsg'+(cls?' '+cls:''); m.hidden=false; void m.offsetWidth; clearTimeout(MSGT); MSGT=setTimeout(()=>{ m.classList.add('out'); MSGT=setTimeout(()=>{ m.hidden=true; },260); },(cls?3200:2400)+Math.min(2600,t.length*25)); }

/* ===== Pantalla de juego ===== */
const EMAX=()=>G&&G.mode==='record'?90:40; /* recorrido de la torreta; en récord, base inclinada (simplificado para el juego) */
/* mira libre: se puede mover por todo el paisaje, de unos 22° hacia abajo (el suelo delante del puesto) a 34° hacia arriba y 45° a cada lado; donde esté la retícula al disparar es donde se apunta (sujeción). Antes el tope fijo era +80 mil y las placas de Alta montaña están a unos +85 mil (5° de subida) */ const ELIM=()=>{ let lo=-400,hi=600; if(G&&G.targets) G.targets.forEach(t=>{ if(isFinite(t.e)){ lo=Math.min(lo,t.e-400); hi=Math.max(hi,t.e+600); } }); return [lo,hi]; }; const ULIM=800; const U=()=>CFG.unit==='moa'; const CLICK=()=>U()?0.25/MOA_PER_MIL:0.1; /* un clic en mil */
function fmtAng(mil,signs){ const v=U()?mil*MOA_PER_MIL:mil; return nf(Math.abs(v),U()?2:1)+' '+(U()?'MOA':'mil'); }
function fmtE(mil){ return (mil>=0?L('Arriba ','Up '):L('Abajo ','Down '))+fmtAng(mil); }
function fmtW(mil){ return Math.abs(mil)<0.005?fmtAng(0):((mil>=0?L('D ','R '):L('I ','L '))+fmtAng(mil)); }
function game(){ stopLoop(); const rf=G.rf, st=G.st;
 let h='<div class="frw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],['Francotirador','#/francotirador'],[L(MODES[G.mode].n[0],MODES[G.mode].n[1])]])+
  '<div class="frtop"><span><b>'+esc(rf.n)+'</b> · '+esc(L(rf.cal[0],rf.cal[1]))+' · '+esc(L(st.n[0],st.n[1]))+'</span><span id="frstat"></span><button type="button" class="frbtn sec sm" id="frquit">'+L('Salir','Quit')+'</button></div>'+
  '<div class="frg"><div><div class="frview" id="frview"><canvas id="frc" aria-label="'+L('Vista del campo de tiro','Range view')+'"></canvas><div class="frmsg" id="frmsg" hidden></div><div class="frhint" id="frhint"></div></div>'+(G.tut?'<div class="frcoach" id="frcoach" aria-live="polite"></div>':'')+'</div>'+
  '<div class="frside" id="frside"></div></div></div>';
 X.set(h,'Francotirador');
 CV=document.getElementById('frc'); CTX=CV.getContext('2d'); CACHE=null;
 document.getElementById('frquit').onclick=()=>{ closeSheet(); stopLoop(); intro(); window.scrollTo(0,0); };
 bindView(); side(); status(); coach();
 G.timer=setInterval(()=>{ if(!document.getElementById('frstat')){ clearInterval(G.timer); return; } status(); if(G.timeLimit&&timeLeft()<=0&&!G.over){ endGame(L('Se acabó el tiempo','Time is up')); } },500);
 RAF=requestAnimationFrame(loop);
 msg(G.tut?L('Sigue la lección paso a paso, debajo de la vista','Follow the lesson step by step, below the view'):G.mode==='movil'?L('Las placas cruzan entre dos protecciones: mide, pide la solución con el adelanto y dispara cuando quieras','The plates cross between two covers: measure, get the solution with the lead and fire whenever you like'):G.mode==='record'?L('Cuatro placas a las distancias de los tiros récord. Mide y pide la solución: la bala tarda segundos en llegar','Four plates at the record-shot distances. Measure and get the solution: the bullet takes seconds to arrive'):EZ()?L('Mide con el telémetro y el anemómetro, y pide la solución','Use the rangefinder and the wind meter, then get the solution'):L('Mide, calcula y dispara. Toca una placa para elegirla','Measure, compute and fire. Tap a plate to pick it'));
}
function status(){ const s=document.getElementById('frstat'); if(!s) return; const t=G.targets[G.cur]; const tl=timeLeft();
 s.innerHTML='P'+(G.cur+1)+'/'+G.targets.length+' · '+L('disparos','rounds')+' '+(G.rounds-t.shots)+' · '+L('puntos','score')+' <b>'+G.score+'</b>'+(isFinite(tl)?' · '+Math.floor(tl/60)+':'+String(Math.floor(tl%60)).padStart(2,'0'):''); }
function chipsHTML(){ return '<div class="frchips">'+G.targets.map((t,i)=>'<button type="button" class="frchip'+(i===G.cur?' on':'')+(t.res==='hit'?' ok':(t.res==='miss'?' ko':''))+'" data-t="'+i+'">P'+(i+1)+' · '+(t.shape==='gong'?L('gong','gong'):L('placa','plate'))+' '+Math.round(t.w*100)+(t.shape==='gong'?' cm':'×'+Math.round(t.h*100)+' cm')+(t.res==='hit'?' · '+L('tocada','hit'):(t.res==='miss'?' · '+L('fallada','missed'):''))+'</button>').join('')+'</div>'; }
function toolsHTML(){ const T_=[['kestrel',L('Anemómetro','Wind meter')],['lrf',L('Telémetro','Rangefinder')],['comp',L('Brújula y GPS','Compass & GPS')],['card',L('Tarjeta','Data card')],['notes',L('Notas y calculadora','Notes & calculator')]];
 if(EZ()) T_.push(['pc',L('Computadora balística','Ballistic computer')]); else T_.push(['flags',L('Prismáticos: banderas','Binoculars: flags')]);
 T_.push(['form',L('Fórmulas','Formulas')]);
 return '<div class="frtools">'+T_.map(t=>'<button type="button" data-tool="'+t[0]+'"'+(t[0]==='pc'?' class="hl"':'')+'>'+t[1]+'</button>').join('')+'</div>'; }
function side(){ const sd=document.getElementById('frside'); if(!sd) return; const t=G.targets[G.cur]; const hint=document.getElementById('frhint');
 if(G.view==='pano'){
  sd.innerHTML='<div class="frrow" style="margin:0"><button type="button" class="frbtn" id="frtog" style="flex:1">'+L('Mirar por la mira','Look through the scope')+'</button>'+(G.st.night?'<button type="button" class="frbtn sec on" id="frsn">'+(G.sensor==='nv'?L('Visión nocturna','Night vision'):L('Térmico','Thermal'))+'</button>':'')+'</div>'+
   '<div class="frpanel"><h4>'+L('Placas','Plates')+'</h4>'+chipsHTML()+'</div><div class="frpanel"><h4>'+L('Instrumentos','Instruments')+'</h4>'+toolsHTML()+'</div>';
  if(hint) hint.textContent=L('Arrastra para mirar alrededor · toca una placa o una bandera','Drag to look around · tap a plate or a flag');
 } else {
  sd.innerHTML='<div class="frrow" style="margin:0;display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:6px"><button type="button" class="frbtn sec" id="frtog">'+L('Quitar la mira','Leave the scope')+'</button><button type="button" class="frbtn sec'+(G.breath?' on':'')+'" id="frbr">'+(G.breath?L('Soltar aire','Breathe out'):L('Contener aire','Hold breath'))+'</button><button type="button" class="frbtn fire" id="frfire"'+(G.busy||G.over||t.res==='hit'||t.shots>=G.rounds?' disabled':'')+'>'+L('DISPARAR','FIRE')+'</button></div>'+
   '<div class="frpanel"><h4>'+L('Torretas','Turrets')+' ('+(U()?L('clic 1/4 MOA','click 1/4 MOA'):L('clic 0,1 mil','click 0.1 mil'))+')</h4>'+
   '<div class="frtur"><div class="bt"><button type="button" data-d="e" data-v="-10">−'+(U()?'2,5':'1')+'</button><button type="button" data-d="e" data-v="-1">−</button></div><div class="val" id="frve"><small>'+L('Elevación','Elevation')+'</small>'+fmtE(G.dialE)+'</div><div class="bt"><button type="button" data-d="e" data-v="1">+</button><button type="button" data-d="e" data-v="10">+'+(U()?'2,5':'1')+'</button></div></div>'+
   '<div class="frtur"><div class="bt"><button type="button" data-d="w" data-v="-10">'+L('I','L')+(U()?'2,5':'1')+'</button><button type="button" data-d="w" data-v="-1">'+L('I','L')+'</button></div><div class="val" id="frvw"><small>'+L('Deriva','Windage')+'</small>'+fmtW(G.dialW)+'</div><div class="bt"><button type="button" data-d="w" data-v="1">'+L('D','R')+'</button><button type="button" data-d="w" data-v="10">'+L('D','R')+(U()?'2,5':'1')+'</button></div></div>'+
   '<div class="frtur"><div class="bt"><button type="button" data-z="-1">−</button></div><div class="val"><small>'+L('Aumentos','Magnification')+'</small>'+G.zoom+'×</div><div class="bt"><button type="button" data-z="1">+</button></div></div>'+
   '<div class="frrow" style="margin:6px 0 0"><button type="button" class="frbtn sec sm" id="frctr">'+L('Centrar en P','Center on P')+(G.cur+1)+'</button><button type="button" class="frbtn sec sm" id="fr0">'+L('Torretas a cero','Zero turrets')+'</button>'+
    (G.mode==='movil'?'<button type="button" class="frbtn sec sm'+(G.track?' on':'')+'" id="frtk">'+L('Seguir la placa: ','Track the plate: ')+(G.track?L('sí','on'):L('no','off'))+'</button>':'')+
    (G.st.night?'<button type="button" class="frbtn sec sm on" id="frsn">'+L('Visor: ','Scope: ')+(G.sensor==='nv'?L('visión nocturna','night vision'):L('térmico','thermal'))+'</button>':'')+'</div></div>'+
   '<div class="frpanel"><h4>'+L('Placa','Plate')+'</h4>'+chipsHTML()+'</div><div class="frpanel"><h4>'+L('Instrumentos','Instruments')+'</h4>'+toolsHTML()+'</div>';
  if(hint) hint.textContent=L('Arrastra para apuntar · sujeción con la retícula o torretas','Drag to aim · hold with the reticle or dial');
 }
 const q=id=>document.getElementById(id);
 q('frtog').onclick=()=>{ G.view=G.view==='pano'?'scope':'pano'; G.iris=performance.now(); if(G.view==='scope'){ const t=G.targets[G.cur]; if(!G.aimSet||t.mv){ G.aim={u:t.u,e:t.e}; G.trackOff=0; G.aimSet=true; } } else { G.breath=0; G.pano.u=clamp(G.aim.u,-200,200); } CACHE=null; side(); const vw=document.getElementById('frview'); if(vw&&vw.getBoundingClientRect().top<0) vw.scrollIntoView({block:'start'}); };
 sd.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ selTarget(+b.getAttribute('data-t'),true); });
 sd.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>tool(b.getAttribute('data-tool')));
 const sn0=q('frsn'); if(sn0) sn0.onclick=()=>{ G.sensor=G.sensor==='nv'?'th':'nv'; CACHE=null; G.iris=performance.now(); side(); msg(G.sensor==='nv'?L('Visión nocturna: amplifica la poca luz que hay','Night vision: amplifies what little light there is'):L('Térmico: ves el calor; las placas llevan mantas térmicas, como en los campos de tiro para estos visores','Thermal: you see heat; the plates carry heat pads, as on ranges for these scopes')); };
 if(G.view==='scope'){
  sd.querySelectorAll('[data-d]').forEach(b=>{ const f=()=>{ const v=+b.getAttribute('data-v')*CLICK(); if(b.getAttribute('data-d')==='e') G.dialE=Math.round((G.dialE+v)/CLICK())*CLICK(); else G.dialW=Math.round((G.dialW+v)/CLICK())*CLICK(); G.dialE=clamp(G.dialE,-5,EMAX()); G.dialW=clamp(G.dialW,-12,12); q('frve').innerHTML='<small>'+L('Elevación','Elevation')+'</small>'+fmtE(G.dialE); q('frvw').innerHTML='<small>'+L('Deriva','Windage')+'</small>'+fmtW(G.dialW); };
    let rep=0,del=0; b.addEventListener('pointerdown',e=>{ e.preventDefault(); f(); del=setTimeout(()=>{ rep=setInterval(f,70); },420); });
    const stop=()=>{ clearTimeout(del); clearInterval(rep); }; b.addEventListener('pointerup',stop); b.addEventListener('pointerleave',stop); b.addEventListener('pointercancel',stop); });
  sd.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{ zoomStep(+b.getAttribute('data-z')); side(); });
  q('frctr').onclick=()=>{ const t=G.targets[G.cur]; G.aim={u:t.u,e:t.e}; G.trackOff=0; };
  const tk=q('frtk'); if(tk) tk.onclick=()=>{ G.track=!G.track; if(G.track){ const t=G.targets[G.cur]; G.trackOff=clamp(G.aim.u-t.u,-150,150); } side(); };
  q('fr0').onclick=()=>{ G.dialE=0; G.dialW=0; side(); };
  q('frbr').onclick=()=>{ G.breath=G.breath?0:performance.now(); side(); };
  q('frfire').onclick=()=>fire();
 }
}
function selTarget(i,center){ if(G.over) return; G.cur=i; if(center){ const t=G.targets[i]; if(G.view==='scope') G.aim={u:t.u,e:t.e}; else G.pano.u=clamp(t.mv?t.u0:t.u,-200,200); G.aimSet=true; G.aim={u:t.u,e:t.e}; G.trackOff=0; } side(); status(); }
function bindView(){ const v=CV; let down=null, moved=0;
 v.addEventListener('pointerdown',e=>{ if(G&&G.bcam){ G.bcam.skip=true; return; } down={x:e.clientX,y:e.clientY}; moved=0; v.setPointerCapture(e.pointerId); });
 v.addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-down.x, dy=e.clientY-down.y; moved+=Math.abs(dx)+Math.abs(dy); down={x:e.clientX,y:e.clientY};
   const P=viewParams(v.clientWidth,v.clientHeight); if(G.view==='scope'){ if(G.mode==='movil'&&G.track&&G.targets[G.cur].mv){ G.trackOff=clamp((G.trackOff||0)-dx/P.s,-150,150); } else G.aim.u=clamp(G.aim.u-dx/P.s,-ULIM,ULIM); const el=ELIM(); G.aim.e=clamp(G.aim.e+dy/P.s,el[0],el[1]); } else { G.pano.u=clamp(G.pano.u-dx/P.s,-260,260); } });
 v.addEventListener('pointerup',e=>{ if(down&&moved<8&&G.view==='pano'){ const r=v.getBoundingClientRect(); const x=e.clientX-r.left, y=e.clientY-r.top; const P=viewParams(v.clientWidth,v.clientHeight);
     let best=-1,bd=34; G.targets.forEach((t,i)=>{ const dd=Math.hypot(PX(P,t.u)-x,Math.min(PZ(P,t.d,t.gy)-5,PZ(P,t.d,t.zc))-y-8); if(dd<bd){ bd=dd; best=i; } });
     if(best>=0) selTarget(best,false); else { let bf=-1,fd=40; G.flags.forEach((f,i)=>{ const dd=Math.hypot(PX(P,f.u)-x,PZ(P,f.d,f.gy)-y-10); if(dd<fd){ fd=dd; bf=i; } }); if(bf>=0) tool('flags',bf); } }
   down=null; });
 v.addEventListener('wheel',e=>{ if(G.view!=='scope') return; e.preventDefault(); zoomStep(e.deltaY<0?1:-1); side(); },{passive:false});
}

const ZS=[5,6,8,10,12,14,16,18,20,22,25];
function zoomStep(dir){ let i=ZS.indexOf(G.zoom); if(i<0) i=4; G.zoom=ZS[clamp(i+dir,0,ZS.length-1)]; }
/* ===== Hojas (paneles superpuestos) ===== */
function closeSheet(){ const s=document.getElementById('frsheet'); if(s) s.remove(); if(G) G.sheet=null; }
function sheet(title,html,bind,id){ closeSheet(); const s=document.createElement('div'); s.className='frsheet'; s.id='frsheet'; s.setAttribute('data-noi18n',''); s.setAttribute('role','dialog');
 s.innerHTML='<div class="hd"><b>'+title+'</b><button type="button" class="x" aria-label="'+L('Cerrar','Close')+'">×</button></div><div class="bd">'+html+'</div>';
 document.body.appendChild(s); s.querySelector('.x').onclick=closeSheet; if(G) G.sheet=id||title; if(bind) bind(s); return s; }
if(!window.__frHash){ window.__frHash=1; window.addEventListener('hashchange',()=>{ if(!/^#\/francotirador/.test(location.hash)){ const s=document.getElementById('frsheet'); if(s) s.remove(); } }); }
/* ===== Instrumentos ===== */
function kestrel(){ const w=windAt(now(),0); const r={T:G.T,rh:G.rh,P:G.env.P,da:G.env.da,s:Math.round(w.s*10)/10,dir:Math.round(w.dir)%360,at:now()}; G.readK=r; return r; }
function raycast(u,e){ for(let d=30; d<4000; d+=d<500?5:15){ if(eOf(terrain(G.st,d,u),d)>=e) return d; } return 0; }
function aimedTarget(u,e){ let best=null,bd=1e9; G.targets.forEach(t=>{ const half=Math.max(t.w,t.h)/t.d*1000/2; const tol=Math.max(half*1.6,1.2);
   /* placa móvil: vale apuntar por delante (adelanto) dentro del claro */
   const du=t.mv?Math.max(0,Math.abs(t.u-u)-(t.mv.open*1000/t.R)*0.6):Math.abs(t.u-u); const da=Math.hypot(du,t.e-e); if(da<=tol&&da<bd){ bd=da; best=t; } }); return best; }
function lase(){ let t=null; if(G.view==='scope') t=aimedTarget(G.aim.u,G.aim.e); else t=G.targets[G.cur];
 const lim=G.mode==='record'?4500:(EZ()?3000:2500);
 if(!t){ const d=G.view==='scope'?raycast(G.aim.u,G.aim.e):0; if(!d) return {none:true}; const R=Math.hypot(d,terrain(G.st,d,G.aim.u)-EYE); if(R>lim) return {far:true}; return {R:Math.round(R),ang:Math.atan2(terrain(G.st,d,G.aim.u)-EYE,d)*180/Math.PI,az:(G.az+G.aim.u*0.0572958+360)%360,ground:true}; }
 if(t.R>lim) return {far:true,i:t.i};
 const R=Math.round(t.R); /* sin error aleatorio: la lectura es la distancia real redondeada al metro */
 const r={i:t.i,R:R,ang:t.e*0.0572958,az:(G.az+t.u*0.0572958+360)%360}; t.lased=R; G.readL=r; if(t.i!==G.cur) selTarget(t.i,false); return r; }
function heading(){ const u=G.view==='scope'?G.aim.u:G.pano.u; return (G.az+u*0.0572958+360)%360; }
function tool(k,arg){ const rf=G.rf;
 if(k==='kestrel'){ const show=()=>{ const r=G.readK; return '<div class="frdev"><div class="frlcd">'+(r?
    '<div class="r"><span>'+L('Temperatura','Temperature')+'</span><b>'+nf(r.T,1)+' °C</b></div><div class="r"><span>'+L('Humedad relativa','Relative humidity')+'</span><b>'+r.rh+' %</b></div><div class="r"><span>'+L('Presión de estación','Station pressure')+'</span><b>'+nf(r.P,1)+' hPa</b></div><div class="r"><span>'+L('Altitud de densidad','Density altitude')+'</span><b>'+ni(r.da)+' m</b></div><div class="big">'+nf(r.s,1)+' m/s</div><div class="r"><span>'+L('Viento desde','Wind from')+'</span><b>'+r.dir+'°</b></div>'+(EZ()?'<div class="r"><span>'+L('Cruzado sobre tu rumbo','Crosswind on your heading')+'</span><b>'+(function(){ const cr=comps({s:r.s,dir:r.dir},G.az+G.targets[G.cur].u*0.0572958).cross; return nf(Math.abs(cr),1)+' m/s '+(cr>=0?L('→ empuja a la derecha','→ pushes right'):L('← empuja a la izquierda','← pushes left')); })()+'</b></div>':'')
    :'<div class="big" style="font-size:18px">'+L('Pulsa MEDIR','Press MEASURE')+'</div>')+'</div>'+
    '<div class="frrow"><button type="button" class="frbtn" id="frkm">'+L('MEDIR','MEASURE')+'</button>'+(r?'<button type="button" class="frbtn sec" id="frkn">'+L('Anotar','Write down')+'</button>':'')+'</div></div><p style="font-size:13px;color:#a8ad98">'+L('Mide el aire y el viento en tu puesto (tramo 1). Lejos el viento puede ser otro: míralo en las banderas.','Measures the air and the wind at your position (zone 1). Further out the wind may differ: check the flags.')+'</p>'; };
   const bind=s=>{ s.querySelector('#frkm').onclick=()=>{ kestrel(); s.querySelector('.bd').innerHTML=show(); bind(s); }; const n=s.querySelector('#frkn'); if(n) n.onclick=()=>{ const r=G.readK; addNote(L('Anemómetro','Meter')+': '+nf(r.T,1)+'°C '+r.rh+'% '+nf(r.P,1)+'hPa DA '+ni(r.da)+'m · '+L('viento','wind')+' '+nf(r.s,1)+' m/s '+L('desde','from')+' '+r.dir+'°'); msg(L('Anotado','Written down')); }; };
   sheet(L('Anemómetro (tipo Kestrel)','Wind meter (Kestrel type)'),show(),bind,'kestrel'); return; }
 if(k==='lrf'){ const r=lase(); let h; if(r.none) h='<div class="frlcd"><div class="big" style="font-size:20px">'+L('Sin eco','No echo')+'</div></div>'; else if(r.far) h='<div class="frlcd"><div class="big" style="font-size:20px">'+L('Sin lectura','No reading')+'</div></div><p>'+L('Fuera del alcance del telémetro (2.500 m en este modo). Mide con la retícula: D = tamaño (m) × 1000 / mil.','Beyond the rangefinder’s reach (2,500 m in this mode). Range with the reticle: D = size (m) × 1000 / mil.')+EST()+'</p>';
   else h='<div class="frlcd"><div class="big">'+ni(r.R)+' m</div><div class="r"><span>'+L('Ángulo','Angle')+'</span><b>'+(r.ang>=0?'+':'')+nfs(r.ang,1)+'°</b></div><div class="r"><span>'+L('Rumbo','Heading')+'</span><b>'+nf(r.az,1)+'°</b></div>'+(EZ()?'<div class="r"><span>'+L('Distancia horizontal','Horizontal distance')+'</span><b>'+ni(r.R*Math.cos(r.ang*Math.PI/180))+' m</b></div>':'')+'</div>'+(r.ground?'<p>'+L('Has medido el terreno, no una placa.','You ranged the ground, not a plate.')+'</p>':'<p>P'+(r.i+1)+' · '+(G.targets[r.i].shape==='gong'?L('gong de ','gong ')+Math.round(G.targets[r.i].w*100)+' cm':L('placa de ','plate ')+Math.round(G.targets[r.i].w*100)+'×'+Math.round(G.targets[r.i].h*100)+' cm')+'</p>');
   sheet(L('Telémetro láser','Laser rangefinder'),h+(r.R&&!r.ground?'<div class="frrow"><button type="button" class="frbtn sec" id="frln">'+L('Anotar','Write down')+'</button></div>':''),s=>{ const n=s.querySelector('#frln'); if(n) n.onclick=()=>{ addNote('P'+(r.i+1)+': '+ni(r.R)+' m · '+nf(r.ang,1)+'° · '+L('rumbo','heading')+' '+nf(r.az,1)+'°'); msg(L('Anotado','Written down')); }; },'lrf'); return; }
 if(k==='comp'){ const hd=heading(); const e=G.view==='scope'?G.aim.e:0; sheet(L('Brújula y GPS','Compass & GPS'),'<div class="frlcd"><div class="big">'+Math.round(hd)+'°</div><div class="r"><span>'+L('Rumbo (verdadero) de la vista','View heading (true)')+'</span><b>'+['N','NE','E','SE','S','SW','W','NW'][Math.round(hd/45)%8].replace('W',EN()?'W':'O')+'</b></div><div class="r"><span>'+L('Latitud (GPS)','Latitude (GPS)')+'</span><b>'+nf(G.st.lat,1)+'° N</b></div><div class="r"><span>'+L('Altitud del puesto','Position altitude')+'</span><b>'+ni(G.st.alt)+' m</b></div>'+(G.view==='scope'?'<div class="r"><span>'+L('Inclinación del visor','Scope inclination')+'</span><b>'+nf(e*0.0572958,1)+'°</b></div>':'')+'</div><p style="font-size:13px;color:#a8ad98">'+L('Acimut 90° = este, 270° = oeste. La línea de tiro de este puesto mira a ','Azimuth 90° = east, 270° = west. This position’s firing line faces ')+G.az+'°.</p>',null,'comp'); return; }
 if(k==='card'){ let di=0; if(G.readK){ while(di<DAS.length-1&&G.readK.da>=DAS[di+1]) di++; } cardSheet(di); return; }
 if(k==='notes'){ sheet(L('Notas y calculadora','Notes & calculator'),'<textarea class="frnote" id="frnt" placeholder="'+L('Apunta aquí tus lecturas y cálculos','Write your readings and sums here')+'">'+esc(G.notes)+'</textarea><div class="frrow" style="margin:8px 0 4px"><input class="frin" id="frcx" inputmode="decimal" placeholder="'+L('p. ej. 0,45*3,2+0,38*2,1','e.g. 0.45*3.2+0.38*2.1')+'" style="flex:1" autocomplete="off"><button type="button" class="frbtn" id="frce">=</button></div><div id="frcr" class="frbig"></div><p style="font-size:12.5px;color:#a8ad98">'+L('Operaciones: + − * / ^ ( ) · sin cos tan (en grados) · sqrt · pi','Operations: + − * / ^ ( ) · sin cos tan (degrees) · sqrt · pi')+'</p>',
   s=>{ const ta=s.querySelector('#frnt'); ta.oninput=()=>{ G.notes=ta.value; try{ localStorage.setItem('mat_fr_notes',G.notes); }catch(e){} };
     const ev=()=>{ const v=calc(s.querySelector('#frcx').value); s.querySelector('#frcr').innerHTML=v==null?'<span class="frko">'+L('Expresión no válida','Invalid expression')+'</span>':'= <b>'+nf(v,4)+'</b> <button type="button" class="frbtn sec sm" id="frca">'+L('Anotar','Write down')+'</button>'; const a=s.querySelector('#frca'); if(a) a.onclick=()=>{ addNote(s.querySelector('#frcx').value+' = '+nf(v,4)); ta.value=G.notes; }; };
     s.querySelector('#frce').onclick=ev; s.querySelector('#frcx').onkeydown=e=>{ if(e.key==='Enter') ev(); }; },'notes'); return; }
 if(k==='form'){ sheet(L('Fórmulas','Formulas'),formulasHTML(true),null,'form'); return; }
 if(k==='flags'){ flagsSheet(arg==null?0:arg); return; }
 if(k==='pc'){ pcSheet(); return; }
}
function addNote(s){ G.notes=(G.notes?G.notes.replace(/\s*$/,'')+'\n':'')+s; try{ localStorage.setItem('mat_fr_notes',G.notes); }catch(e){} }
function calc(x){ x=String(x||'').replace(/,/g,'.').replace(/×/g,'*').replace(/−/g,'-').trim(); if(!x||x.length>200) return null; if(!/^[0-9+\-*/^().\sa-z]*$/i.test(x)) return null;
 const ok=['sin','cos','tan','sqrt','pi','asin','acos','atan','abs','e']; const ids=x.match(/[a-z]+/gi)||[]; if(ids.some(i=>ok.indexOf(i.toLowerCase())<0)) return null;
 const y=x.toLowerCase().replace(/\^/g,'**').replace(/\basin\(/g,'AS(').replace(/\bacos\(/g,'AC(').replace(/\batan\(/g,'AT(').replace(/\bsin\(/g,'S(').replace(/\bcos\(/g,'C(').replace(/\btan\(/g,'TN(').replace(/\bsqrt\(/g,'Q(').replace(/\babs\(/g,'B(').replace(/\bpi\b/g,'PI').replace(/\be\b/g,'EE');
 try{ const D=Math.PI/180; const f=new Function('S','C','TN','Q','B','AS','AC','AT','PI','EE','"use strict";return ('+y+');'); const v=f(a=>Math.sin(a*D),a=>Math.cos(a*D),a=>Math.tan(a*D),Math.sqrt,Math.abs,a=>Math.asin(a)/D,a=>Math.acos(a)/D,a=>Math.atan(a)/D,Math.PI,Math.E); return (typeof v==='number'&&isFinite(v))?v:null; }catch(e){ return null; } }
function cardSheet(di){ const rf=G.rf; const da=DAS[di]; const rows=dopeTable(rf,da); const sg=millerSg(rf,atmos(1013.25,15,0)); const uf=U()?MOA_PER_MIL:1, un=U()?'MOA':'mil';
 let h='<div class="frkv"><span>'+L('Fusil','Rifle')+'</span><b><a href="#/a/'+rf.ficha+'">'+esc(rf.n)+'</a></b><span>'+L('Cartucho','Cartridge')+'</span><b>'+esc(L(rf.cal[0],rf.cal[1]))+'</b><span>'+L('Bala','Bullet')+'</span><b>'+esc(L(rf.bul[0],rf.bul[1]))+'</b>'+
  '<span>'+L('Masa · calibre','Mass · calibre')+'</span><b>'+rf.gr+' gr ('+nf(rf.gr*0.06479891,1)+' g) · '+nf(rf.dIn,3)+' in</b><span>BC</span><b>'+rf.model+' '+nf(rf.bc,3)+'</b><span>'+L('Velocidad en boca','Muzzle velocity')+'</span><b>'+rf.mv+' m/s</b>'+
  '<span>'+L('Paso de estriado','Twist rate')+'</span><b>1:'+nf(rf.twistIn,rf.twistIn%1?2:0)+' in '+L('dextrógiro','right-hand')+'</b><span>'+L('Altura del visor','Scope height')+'</span><b>'+Math.round(rf.sh*1000)+' mm '+EST()+'</b><span>'+L('Cero','Zero')+'</span><b>'+rf.zero+' m (ICAO)</b>'+
  '<span>Sg (Miller, ICAO)</span><b>'+nf(sg,2)+' · '+L('longitud de bala','bullet length')+' '+nf(rf.lIn,3)+' in '+EST()+'</b><span>'+L('Visor','Scope')+'</span><b>5–25× FFP · '+(U()?'1/4 MOA':'0,1 mil')+' '+EST()+'</b></div>';
 h+='<p style="font-size:12.5px;color:#a8ad98;margin:8px 0">'+L('Fuentes: BC ','Sources: BC ')+esc(rf.src.bc)+' · V0 '+esc(L(rf.src.mv[0],rf.src.mv[1]))+' · '+esc(L(rf.src.tw[0],rf.src.tw[1]))+'</p>';
 h+='<p style="font-size:13px;margin:8px 0 0">'+L('Tablas preparadas para la temperatura de hoy (','Tables prepared for today’s temperature (')+nf(G.T,0)+' °C): '+L('elige la altitud de densidad e interpola.','pick the density altitude and interpolate.')+'</p><div class="frrow" style="margin:6px 0"><span style="font-size:13px;color:#a8ad98">'+L('Altitud de densidad','Density altitude')+'</span><span class="frseg" style="display:flex;flex-wrap:wrap;overflow:visible;border:0;gap:4px">'+DAS.map((d,i)=>'<button type="button" data-da="'+i+'" class="'+(i===di?'on':'')+'" style="padding:6px 8px;min-height:36px;border:1px solid var(--line);border-radius:6px">'+ni(d)+' m</button>').join('')+'</span></div>';
 h+='<table class="frtab"><tr><th>'+L('Dist. (m)','Dist. (m)')+'</th><th>'+L('Alza','Elev.')+' ('+un+')</th><th>'+L('Viento 1 m/s','Wind 1 m/s')+' ('+un+')</th><th>'+L('T. vuelo (s)','ToF (s)')+'</th><th>V (m/s)</th></tr>'+
  rows.map(r=>'<tr><td>'+ni(r.d)+'</td><td>'+nf(r.el*uf,U()?1:2)+'</td><td>'+nf(r.w*uf,3)+'</td><td>'+nf(r.t,3)+'</td><td>'+Math.round(r.v)+'</td></tr>').join('')+'</table>';
 h+='<p style="font-size:12.5px;color:#a8ad98">'+L('Tabla sin viento, sin giro y sin Coriolis, tiro horizontal. Esos tres los calculas tú con las fórmulas.','Table with no wind, spin or Coriolis, level shot. You work those three out with the formulas.')+'</p>';
 sheet(L('Tarjeta de datos','Data card'),h,s=>{ s.querySelectorAll('[data-da]').forEach(b=>b.onclick=()=>cardSheet(+b.getAttribute('data-da'))); },'card'); }
function flagsSheet(i){ const f=G.flags[i]; const g=flagGeom(f,now()); const bands=[[0,G.wind.e1],[G.wind.e1,G.wind.e2],[G.wind.e2,null]];
 const b=bands[f.band];
 let h='<canvas id="frfc" width="600" height="360" style="width:100%;height:auto;border-radius:10px;background:#9db3c9"></canvas>';
 h+='<p class="frbig">'+L('Bandera ','Flag ')+(i+1)+' · '+ni(f.d)+' m · '+L('tramo ','zone ')+(f.band+1)+': '+ni(b[0])+'–'+(b[1]?ni(b[1])+' m':L('más allá','beyond'))+'</p>';
 if(EZ()) h+='<p>'+L('Viento cruzado aquí: ','Crosswind here: ')+'<b>'+nf(Math.abs(g.cross),1)+' m/s</b> '+(g.cross>=0?L('hacia la derecha','to the right'):L('hacia la izquierda','to the left'))+'. '+L('En Fácil es igual en todo el recorrido.','In Easy it is the same along the whole path.')+'</p>';
 else h+='<p class="frbig">'+L('Ángulo con el mástil (transportador de los prismáticos): ','Angle from the pole (binocular protractor): ')+'<b>'+nf(g.th,1)+'°</b> '+(g.cross>=0?L('hacia la derecha','to the right'):L('hacia la izquierda','to the left'))+'</p><p style="font-size:13.5px;color:#bfc2b8">'+L('Ángulo / 4 = viento cruzado en mph sobre tu línea de tiro a P','Angle / 4 = crosswind in mph across your line of fire to P')+(G.cur+1)+L(' (FM 23-10). 1 mph = 0,44704 m/s. La bandera cuelga hacia donde empuja el viento.',' (FM 23-10). 1 mph = 0.44704 m/s. The flag hangs the way the wind pushes.')+'</p>';
 h+='<div class="frrow">'+G.flags.map((x,j)=>'<button type="button" class="frbtn '+(j===i?'':'sec')+' sm" data-fl="'+j+'">'+L('Bandera ','Flag ')+(j+1)+'</button>').join('')+'</div>';
 sheet(L('Prismáticos','Binoculars'),h,s=>{ s.querySelectorAll('[data-fl]').forEach(bb=>bb.onclick=()=>flagsSheet(+bb.getAttribute('data-fl')));
   const cv=s.querySelector('#frfc'); const c=cv.getContext('2d'); const draw_=()=>{ if(!document.body.contains(cv)) return; const tm=now(); const gg=flagGeom(f,tm);
     c.fillStyle='#9db3c9'; c.fillRect(0,0,600,360); c.fillStyle=G.st.near; c.fillRect(0,300,600,60);
     const x=300,top=60,pole=240; c.strokeStyle='#ddd'; c.lineWidth=6; c.beginPath(); c.moveTo(x,top+pole); c.lineTo(x,top); c.stroke();
     c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=1; c.font='14px system-ui,sans-serif'; c.fillStyle='rgba(255,255,255,.9)'; c.textAlign='center';
     for(let a=0;a<=90;a+=15){ const r=Math.PI*a/180; [1,-1].forEach(sd=>{ c.beginPath(); c.moveTo(x,top); c.lineTo(x+Math.sin(r)*sd*200,top+Math.cos(r)*200); c.stroke(); if(a>0) c.fillText(a+'°',x+Math.sin(r)*sd*222,top+Math.cos(r)*222+5); }); }
     const th=gg.thd*Math.PI/180, dx=Math.sin(th)*gg.side, dy=Math.cos(th); const Lf=170, Wd=95; const hA=Wd*Math.sin(th)+12; const ex=-dy, ey=dx; const amp=Wd*0.1*Math.min(1,gg.s/4+0.2);
     c.beginPath(); for(let j=0;j<=12;j++){ const ss=j/12; const wv=Math.sin(ss*5-tm*(6+gg.s*1.5))*amp*ss; c.lineTo(x+dx*Lf*ss+ex*wv,top+dy*Lf*ss+ey*wv); } for(let j=12;j>=0;j--){ const ss=j/12; const wv=Math.sin(ss*5-tm*(6+gg.s*1.5)+0.5)*amp*ss; c.lineTo(x+dx*Lf*ss+ex*wv,top+hA+dy*Lf*ss+ey*wv); } c.closePath(); c.fillStyle=i===1?'#f0a020':'#e0472f'; c.fill();
     requestAnimationFrame(draw_); }; draw_(); },'flags'); }
function pcSheet(){ const t=G.targets[G.cur]; const K=G.readK, R_=G.readL&&G.readL.i===t.i?G.readL:null;
 if(!K||!R_){ sheet(L('Computadora balística','Ballistic computer'),'<p class="frbig">'+L('Necesito tus lecturas de esta placa:','I need your readings for this plate:')+'</p><p>'+(K?'<span class="frok">✓</span> ':'· ')+L('Anemómetro: temperatura, presión y viento','Wind meter: temperature, pressure and wind')+'<br>'+(R_?'<span class="frok">✓</span> ':'· ')+L('Telémetro: distancia y ángulo de P','Rangefinder: distance and angle of P')+(t.i+1)+'</p><div class="frrow">'+(K?'':'<button type="button" class="frbtn sec" id="frk">'+L('Abrir anemómetro','Open wind meter')+'</button>')+(R_?'':'<button type="button" class="frbtn sec" id="frl">'+L('Medir P','Range P')+(t.i+1)+'</button>')+'</div>',s=>{ const a=s.querySelector('#frk'); if(a) a.onclick=()=>tool('kestrel'); const b=s.querySelector('#frl'); if(b) b.onclick=()=>tool('lrf'); },'pc'); return; }
 const bd=breakdown(R_.R,t.mv?t.u0:t.u,t.e,now()); const A=G.az+(t.mv?t.u0:t.u)*0.0572958; const ld=t.mv?leadMil(t,bd.t):0; const wTot=bd.wdg+ld; const cr=comps({s:K.s,dir:K.dir},A).cross;
 const row=(a,b)=>'<span>'+a+'</span><b>'+b+'</b>';
 let h='<div class="frkv">'+row(L('Distancia · ángulo','Distance · angle'),ni(R_.R)+' m · '+nfs(R_.ang,1)+'°')+row(L('Altitud de densidad','Density altitude'),ni(K.da)+' m')+row(L('Viento cruzado','Crosswind'),nf(Math.abs(cr),1)+' m/s '+(cr>=0?L('→ derecha','→ right'):L('← izquierda','← left')))+row(L('Rumbo · latitud','Heading · latitude'),Math.round(A)+'° · '+nf(G.st.lat,1)+'° N')+'</div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Elevación','Elevation')+'</h4><div class="frlcd"><div class="big">'+fmtE(bd.elev)+'</div></div><div class="frkv" style="margin-top:6px">'+row(L('Caída de la bala','Bullet drop'),fmtE(bd.drop))+row(L('Coriolis vertical (Eötvös)','Vertical Coriolis (Eötvös)'),(bd.corV>=0?L('la bala sube ','bullet rises '):L('la bala baja ','bullet drops '))+nf(Math.abs(bd.corVcm),1)+' cm → '+fmtE(-bd.corV))+'</div></div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Deriva','Windage')+'</h4><div class="frlcd"><div class="big">'+fmtW(wTot)+'</div></div><div class="frkv" style="margin-top:6px">'+row(L('Viento','Wind'),fmtW(-bd.wind))+row(L('Deriva por giro','Spin drift'),fmtW(-bd.spin))+row(L('Coriolis horizontal','Horizontal Coriolis'),nf(Math.abs(bd.corHcm),1)+' cm → '+fmtW(-bd.corH))+
   (t.mv?row('<b>'+L('Adelanto (placa en movimiento)','Lead (moving plate)')+'</b>','<b>'+fmtW(ld)+'</b>'):'')+'</div>'+
   (t.mv?'<p class="frnote">'+L('La placa va a ','The plate moves at ')+nf(t.mv.v,1)+' m/s '+(t.mv.dir>0?L('hacia la derecha','to the right'):L('hacia la izquierda','to the left'))+L('. Mientras vuela la bala (','. While the bullet flies (')+nf(bd.t,2)+' s) '+L('recorre ','it covers ')+nf(t.mv.v*bd.t,2)+' m: '+nf(t.mv.v*bd.t,2)+' × 1000 ÷ '+ni(R_.R)+' = '+fmtAng(Math.abs(ld))+'. '+L('Con «Seguir la placa» la retícula va con ella y el adelanto lo pones en la deriva.','With “Track the plate” the reticle moves with it and the lead goes on the windage turret.')+'</p>':'')+'</div>';
 h+='<div class="frkv">'+row(L('Tiempo de vuelo','Time of flight'),nf(bd.t,2)+' s')+row(L('Velocidad al llegar','Impact velocity'),Math.round(bd.v)+' m/s (Mach '+nf(bd.mach,2)+')')+row(L('Régimen','Regime'),bd.minMach<1?'<span class="frko">'+L('llega subsónica: más caída y más viento','arrives subsonic: more drop and more wind')+'</span>':(bd.minMach<1.2?'<span class="frko">'+L('entra en transónico','goes transonic')+'</span>':L('supersónica todo el vuelo','supersonic all the way')))+'</div>';
 h+='<div class="frrow"><button type="button" class="frbtn" id="frap">'+L('Ajustar torretas','Dial it in')+'</button></div><p style="font-size:12.5px;color:#a8ad98">'+L('También puedes sujetar con la retícula en vez de girar las torretas.','You can also hold with the reticle instead of dialing.')+'</p>';
 sheet(L('Computadora balística','Ballistic computer'),h,s=>{ s.querySelector('#frap').onclick=()=>{ G.dialE=Math.round(bd.elev/CLICK())*CLICK(); G.dialW=Math.round(wTot/CLICK())*CLICK(); G.dialE=clamp(G.dialE,-5,EMAX()); G.dialW=clamp(G.dialW,-12,12); closeSheet(); if(G.view!=='scope'){ G.view='scope'; G.aim={u:t.u,e:t.e}; G.trackOff=0; G.aimSet=true; CACHE=null; G.iris=performance.now(); } side(); const vw=document.getElementById('frview'); if(vw&&vw.getBoundingClientRect().top<0) vw.scrollIntoView({block:'start',behavior:'smooth'}); msg(L('Torretas: ','Turrets: ')+fmtE(G.dialE)+' · '+fmtW(G.dialW)); }; },'pc'); }

/* sujeción con la retícula (holdover): si la retícula está por encima, por debajo o al lado de la placa en vez de encima, la bala se calcula en el marco de esa placa con la sujeción sumada a las torretas (el mismo ángulo del cañón, así que sujetar X mil es exactamente lo mismo que girar X mil) */
function shootHold(t,aimU,aimE,dialE,dialW,tm){ const u0=t.mv?mvU(t,tm):t.u, e0=t.e, R=t.R;
 const fl=shotFlight({R:R,u:u0,e:e0,t:tm,alpha:dialE+(aimE-e0),beta:dialW+(aimU-u0),track:true});
 const iu=u0+fl.z/R*1000, ie=e0+fl.y/R*1000; const uA=t.mv?mvU(t,tm+fl.t):t.u;
 const dxm=(iu-uA)*R/1000, dym=(ie-t.e)*R/1000; const hit=mvOK(t,tm,fl.t)&&(t.shape==='gong'?Math.hypot(dxm,dym)<=t.w/2:(Math.abs(dxm)<=t.w/2&&Math.abs(dym)<=t.h/2));
 return {R:R,fl:fl,iu:iu,ie:ie,dxm:dxm,dym:dym,hit:hit,mvAdj:0,ea:0,wa:0,tsg:0,uA:uA,u0:u0,e0:e0,hold:true}; }
function shoot(t,tg,aimU,aimE,dialE,dialW,held,tm){ let R=t.R; if(!tg){ const d=raycast(aimU,aimE); R=d?Math.hypot(d,terrain(G.st,d,aimU)-EYE):2500; }
 /* sin azar: el impacto es la solución exacta del integrador para lo que has girado en las torretas y donde está la retícula */
 const mvAdj=0, ea=0, wa=0, tsg=0;
 const fl=shotFlight({R:R,u:aimU,e:aimE,t:tm,alpha:dialE,beta:dialW,track:true});
 const iu=aimU+fl.z/R*1000, ie=aimE+fl.y/R*1000;
 const uA=t.mv?mvU(t,tm+fl.t):t.u; /* placa móvil: donde está cuando llega la bala */
 const dxm=(iu-uA)*R/1000, dym=(ie-t.e)*R/1000; const hit=!!tg&&mvOK(t,tm,fl.t)&&(t.shape==='gong'?Math.hypot(dxm,dym)<=t.w/2:(Math.abs(dxm)<=t.w/2&&Math.abs(dym)<=t.h/2));
 return {R:R,fl:fl,iu:iu,ie:ie,dxm:dxm,dym:dym,hit:hit,mvAdj:mvAdj,ea:ea,wa:wa,tsg:tsg,uA:uA}; }
/* ===== Disparo ===== */
function fire(){ if(G.busy||G.over) return; let t=G.targets[G.cur]; const tm=now(); movUpd(tm); trackUpd(0); /* la retícula, donde está la placa en este instante */
 if(G.mode==='movil'&&G.track&&G.trackLag>0.05){ msg(L('Espera: la retícula aún está volviendo a la placa','Wait: the reticle is still swinging back onto the plate')); return; }
 const aimU=G.aim.u+G.shake.x, aimE=G.aim.e+G.shake.y; const tg=aimedTarget(aimU,aimE); if(tg){ t=tg; G.cur=tg.i; }
 if(t.res==='hit'||t.shots>=G.rounds){ msg(L('Esa placa ya está resuelta: elige otra','That plate is done: pick another')); return; }
 let sh=shoot(t,tg,aimU,aimE,G.dialE,G.dialW,!!G.breath,tm); let hold=null;
 /* retícula fuera de la placa: se mira dónde va de verdad la bala (sujeción); se prueba primero la placa elegida y luego las demás por cercanía */
 if(!tg){ const cs=G.targets.filter(x=>!x.res&&x.shots<G.rounds).sort((a,b)=>(a.i===G.cur?-1:0)-(b.i===G.cur?-1:0)||Math.abs(a.u-aimU)-Math.abs(b.u-aimU));
   for(const c of cs){ const s2=shootHold(c,aimU,aimE,G.dialE,G.dialW,tm); if(s2.hit){ hold=s2; t=c; G.cur=c.i; break; } }
   /* sujeción cerca de la placa elegida (por encima de ella, o a menos de 10 mil): el fallo se cuenta en esa placa para que el observador pueda corregir */
   if(!hold&&!t.res&&t.shots<G.rounds){ const s2=shootHold(t,aimU,aimE,G.dialE,G.dialW,tm); const u0=s2.u0; if(Math.abs(aimU-u0)<10+(t.mv?t.mv.open*1000/t.R:0)&&aimE>t.e-10&&Math.abs(s2.ie-t.e)<10&&Math.abs(s2.iu-s2.uA)<10&&mvOK(t,tm,s2.fl.t)) hold=s2; } }
 if(hold) sh=hold; const hTg=hold?t:tg; const {R,fl,iu,ie,dxm,dym,hit,mvAdj,ea,wa,tsg}=sh; const held=!!G.breath;
 if(tg&&t.mv&&!mvOK(t,tm,fl.t)){ msg(mvVis(t,tm)?L('Espera: cuando llegue la bala la placa estaría tapada por la protección','Wait: by the time the bullet arrives the plate would be behind cover'):L('Espera a que la placa salga de la protección','Wait for the plate to come out from behind cover')); return; }
 t.shots++; G.breath=0;
 const bd=breakdown(t.R,t.mv?t.u0:t.u,t.e,tm);
 const rec={shk:Math.hypot(G.shake.x,G.shake.y),i:t.i,R:t.R,hit:hit,dxm:dxm,dym:dym,dialE:G.dialE,dialW:G.dialW,holdE:aimE-t.e,holdW:aimU-t.u,bd:bd,mvAdj:mvAdj,disp:Math.hypot(ea,wa),tsg:tsg,tof:fl.t,v:fl.v,mach:fl.mach,minMach:fl.minMach,held:held,
   az:G.az+aimU*0.0572958,iu:iu,ie:ie,shot:t.shots,pts:0,ground:!hTg,lead:t.mv?leadMil(t,bd.t):0,uA:sh.uA,tm:tm};
 if(hit){ const tab=EZ()?[3,2,1,1,1]:[5,3,1]; rec.pts=Math.round((tab[t.shots-1]||1)*(1+t.d/1000)); G.score+=rec.pts; t.pts=rec.pts; t.res='hit'; t.hits.push([dxm,dym]); }
 else if(t.shots>=G.rounds) t.res='miss';
 G.shots.push(rec); G.last=rec;
 G.anim={fired:performance.now(),track:fl.track,u:hold?hold.u0:aimU,e:hold?hold.e0:aimE,tof:fl.t,iu:iu,ie:ie,hit:hit,t:t}; G.busy=true; side(); status();
 const fx=document.getElementById('frview'); if(fx){ fx.style.transform='translateY(2px)'; setTimeout(()=>{ fx.style.transform=''; },90); }
 const g0=G; const alive=()=>G===g0&&!G.over&&!!document.getElementById('frside'); rec.anim=G.anim;
 const finalHit=hit&&G.targets.every(x=>x.res); const camOn=hit&&!RM()&&!G.tut&&(finalHit||!!t.rec);
 if(camOn&&camStart(rec,G.anim,()=>{ if(!alive()) return; G.anim.swing=performance.now(); G.hitVer=(G.hitVer||0)+1; hitFx(t,rec); msg(L('IMPACTO','HIT')+' · P'+(t.i+1)+' · '+ni(t.R)+' m','hit'); setTimeout(()=>{ if(!alive()) return; G.busy=false; side(); debrief(rec); },700); })){ if(window.MAT_FR) window.MAT_FR.lastShot=rec; return rec; }
 setTimeout(()=>{ if(!alive()||G.anim.t!==t) return; if(hit){ hitFx(t,rec); G.anim.swing=performance.now(); G.hitVer=(G.hitVer||0)+1; msg(L('IMPACTO','HIT')+' · P'+(t.i+1)+' · '+ni(t.R)+' m'+(t.rec?' · '+L('distancia del récord de ','record distance of ')+t.rec.y:''),'hit'); } else msg(L('Fallo','Miss')+' · '+missTxt(rec),'miss'); },fl.t*1000+60);
 setTimeout(()=>{ if(!alive()) return; G.busy=false; side(); debrief(rec); },fl.t*1000+(hit?1500:1100));
 if(window.MAT_FR) window.MAT_FR.lastShot=rec; return rec; }
/* observador: dónde ha ido el impacto respecto a la placa y la corrección exacta en clics (con la misma puntería) */
function spotCorr(r){ const t=G.targets[r.i]; const bd=r.bd; const ce=bd.elev-(r.dialE+r.holdE); const cw=bd.wdg+(r.lead||0)-(r.dialW+r.holdW); const k=CLICK();
  return {ce:Math.round(ce/k)*k, cw:Math.round(cw/k)*k, rawE:ce, rawW:cw}; }
function cmTxt(m){ const cm=Math.abs(m)*100; const r=cm<20?Math.max(5,Math.round(cm/5)*5):Math.round(cm/10)*10; if(r>=100) return nf(cm/100,1)+' m'; return r+' cm'; }
function spotHTML(r){ const t=G.targets[r.i];
  let tx; if(r.ground){ tx=L('«La bala ha dado en el suelo a unos ','“The round hit the ground about ')+ni(Math.round(r.R/10)*10)+L(' m: no estabas apuntando a la placa. Centra la retícula en P',' m out: you weren’t aiming at the plate. Put the reticle on P')+(t.i+1)+L(' y repite.»',' and go again.”');
    return '<div class="frspot"><span class="tag">'+L('Ayuda · observador','Help · spotter')+'</span><p>'+tx+'</p></div>'; }
  const v=r.dym, hz=r.dxm; const vt=Math.abs(v)>=0.01?(v>0?L('alto','high'):L('bajo','low')):''; const ht=Math.abs(hz)>=0.01?(hz>0?L('a la derecha','right'):L('a la izquierda','left')):'';
  const dist=Math.hypot(v,hz); const parts=[]; if(vt) parts.push(nf(Math.abs(v)*100,0)+' cm '+vt); if(ht) parts.push(nf(Math.abs(hz)*100,0)+' cm '+ht);
  tx=L('«Impacto ','“Impact ')+[vt,ht].filter(Boolean).join(L(' y ',' and '))+L(', a unos ',', about ')+cmTxt(dist)+L(' del centro',' from centre')+' ('+parts.join(', ')+').';
  if(t.mv){ const behind=hz*t.mv.dir<0; tx+=' '+(behind?L('Te has quedado corto de adelanto.','You were short on lead.'):L('Te has pasado de adelanto.','Too much lead.')); }
  const c=spotCorr(r); const a=[]; if(Math.abs(c.ce)>1e-6) a.push((c.ce>0?L('Sube ','Come up '):L('Baja ','Come down '))+fmtAng(c.ce)); if(Math.abs(c.cw)>1e-6) a.push(L('corrige ','')+fmtAng(c.cw)+' '+(c.cw>0?L('a la derecha','right'):L('a la izquierda','left')));
  if(a.length){ a[0]=a[0].charAt(0).toUpperCase()+a[0].slice(1); tx+=' '+a.join(L(' y ',' and '))+'.'; }
  tx+=(r.shk>0.005?L(' Y suelta el aire antes: el visor temblaba.',' And breathe out sooner: the scope was shaking.'):'')+L('»','”');
  return '<div class="frspot"><span class="tag">'+L('Ayuda · observador','Help · spotter')+'</span><p>'+tx+'</p>'+(a.length?'<button type="button" class="frbtn sec sm" id="frspa">'+L('Girar las torretas así','Dial that in')+'</button>':'')+'</div>'; }
function missTxt(r){ const v=r.dym*100, h=r.dxm*100; return (Math.abs(v)>=1?nf(Math.abs(v),0)+' cm '+(v>0?L('alto','high'):L('bajo','low')):'')+(Math.abs(v)>=1&&Math.abs(h)>=1?' · ':'')+(Math.abs(h)>=1?nf(Math.abs(h),0)+' cm '+(h>0?L('a la derecha','right'):L('a la izquierda','left')):''); }
function debrief(r){ if(!G||G.over&&!r) return; if(G.tut&&!r._tut){ r._tut=1; tutShot(r); } const t=G.targets[r.i], bd=r.bd; const row=(a,b)=>'<span>'+a+'</span><b>'+b+'</b>';
 const effE=r.dialE+r.holdE, effW=r.dialW+r.holdW; const dE=effE-bd.elev, dW=effW-bd.wdg-(r.lead||0);
 let h='<p class="frbig">'+(r.hit?'<b class="frok">'+L('IMPACTO','HIT')+'</b>':'<b class="frko">'+L('FALLO','MISS')+'</b>')+' · P'+(t.i+1)+' · '+ni(r.ground?t.R:r.R)+' m · '+(r.hit?'+'+r.pts+' '+L('puntos','points'):(r.ground?L('la bala ha dado en el suelo a unos ','the round hit the ground about ')+ni(Math.round(r.R/10)*10)+' m':L('impacto ','impact ')+missTxt(r)+' '+L('del centro','from centre')))+'</p>';
  if(r.hit&&t.rec) h+='<div class="frspot rec"><span class="tag">'+ni(t.rec.d)+' m · '+t.rec.y+'</span><p>'+L('Has tocado la placa a la distancia del disparo récord de ','You hit the plate at the distance of the record shot by ')+esc(L(t.rec.who[0],t.rec.who[1]))+' ('+esc(t.rec.gun)+'). '+L('La bala ha tardado ','The bullet took ')+nf(r.tof,1)+L(' s en llegar.',' s to arrive.')+'</p></div>';
 h+='<div class="frkv">'+row(L('Tiempo de vuelo','Time of flight'),nf(r.tof,2)+' s')+row(L('Velocidad al llegar','Impact velocity'),Math.round(r.v)+' m/s · Mach '+nf(r.mach,2))+row(L('Transónica','Transonic'),r.minMach<1.2?'<span class="frko">'+L('sí, Mach mínimo ','yes, minimum Mach ')+nf(r.minMach,2)+'</span>':L('no','no'))+'</div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Valores reales de este disparo','True values for this shot')+'</h4><div class="frkv">'+
  row(L('Caída','Drop'),fmtAng(bd.drop))+row(L('Coriolis vertical (Eötvös)','Vertical Coriolis (Eötvös)'),(Math.abs(bd.corVcm)<0.05?'':(bd.corV>=0?'+':'−'))+nf(Math.abs(bd.corVcm),1)+' cm ('+(Math.abs(bd.corV)<0.005?'':(bd.corV>=0?'+':'−'))+fmtAng(bd.corV)+')')+row('<b>'+L('Alza necesaria','Elevation needed')+'</b>','<b>'+fmtE(bd.elev)+'</b>')+
  row(L('Viento','Wind'),fmtAng(bd.wind)+' '+(bd.wind>=0?L('a la derecha','right'):L('a la izquierda','left')))+row(L('Deriva por giro','Spin drift'),fmtAng(bd.spin)+' '+L('a la derecha','right'))+row(L('Coriolis horizontal','Horizontal Coriolis'),nf(Math.abs(bd.corHcm),1)+' cm '+(bd.corH>=0?L('a la derecha','right'):L('a la izquierda','left')))+(r.lead?row(L('Adelanto (placa en movimiento)','Lead (moving plate)'),fmtW(r.lead)):'')+row('<b>'+L('Deriva necesaria','Windage needed')+'</b>','<b>'+fmtW(bd.wdg+(r.lead||0))+'</b>')+'</div></div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Lo que pusiste','What you set')+'</h4><div class="frkv">'+row(L('Torretas','Turrets'),fmtE(r.dialE)+' · '+fmtW(r.dialW))+row(L('Sujeción con la retícula','Reticle hold'),fmtE(r.holdE)+' · '+fmtW(r.holdW))+
  row(L('Diferencia','Difference'),(Math.abs(dE)<0.05?L('alza exacta','elevation spot on'):(dE>0?L('alto ','high '):L('bajo ','low '))+fmtAng(dE))+' · '+(Math.abs(dW)<0.05?L('deriva exacta','windage spot on'):(dW>0?L('a la derecha ','right '):L('a la izquierda ','left '))+fmtAng(dW)))+
  row(L('Dispersión aleatoria','Random dispersion'),'0 · '+L('el impacto sale exacto de lo que pusiste','the impact follows exactly from what you set'))+(r.shk>0.005?row(L('Temblor del visor (aire contenido demasiado)','Scope shake (breath held too long)'),'<span class="frko">'+fmtAng(r.shk)+'</span>'):'')+'</div></div>';
 if(SPOT()&&!r.hit){ h=spotHTML(r)+h; }
 if(r.hit&&r.anim&&r.anim.track&&!RM()&&!G.tut) h+='<div class="frrow" style="margin:4px 0 8px"><button type="button" class="frbtn sec sm" id="frcam">'+L('Ver la cámara bala','Watch the bullet cam')+'</button></div>';
  const more=t.res!=='hit'&&t.shots<G.rounds; const next=G.targets.findIndex(x=>!x.res);
  if(G.tut) h+='<div class="frrow"><button type="button" class="frbtn" id="frcon">'+L('Seguir con la lección','Back to the lesson')+'</button></div>'; else h+='<div class="frrow">'+(more?'<button type="button" class="frbtn" id="frag">'+L('Otro disparo','Fire again')+' ('+(G.rounds-t.shots)+')</button>':'')+(next>=0?'<button type="button" class="frbtn'+(more?' sec':'')+'" id="frnx">'+L('Siguiente placa','Next plate')+' (P'+(next+1)+')</button>':'<button type="button" class="frbtn" id="frend">'+L('Ver resultado','See result')+'</button>')+'</div>';
 sheet(L('Informe del disparo','Shot debrief'),h,s=>{ const cn=s.querySelector('#frcon'); if(cn) cn.onclick=()=>{ closeSheet(); const c=document.getElementById('frcoach'); if(c) c.scrollIntoView({block:'start',behavior:'smooth'}); }; const a=s.querySelector('#frag'); if(a) a.onclick=()=>{ closeSheet(); };
    const cm=s.querySelector('#frcam'); if(cm) cm.onclick=()=>{ closeSheet(); const vw=document.getElementById('frview'); if(vw) vw.scrollIntoView({block:'center',behavior:RM()?'auto':'smooth'}); G.busy=true; side(); camStart(r,r.anim,()=>{ if(!G||G.over) return; G.busy=false; side(); debrief(r); }); };
    const sp=s.querySelector('#frspa'); if(sp) sp.onclick=()=>{ const c=spotCorr(r); G.dialE=clamp(Math.round((G.dialE+c.ce)/CLICK())*CLICK(),-5,EMAX()); G.dialW=clamp(Math.round((G.dialW+c.cw)/CLICK())*CLICK(),-12,12); closeSheet(); side(); msg(L('Torretas: ','Turrets: ')+fmtE(G.dialE)+' · '+fmtW(G.dialW)); };
   const n=s.querySelector('#frnx'); if(n) n.onclick=()=>{ closeSheet(); G.cur=next; G.dialE=0; G.dialW=0; G.view='pano'; G.aimSet=false; G.pano.u=clamp(G.targets[next].u,-200,200); CACHE=null; side(); status(); msg(L('P','P')+(next+1)+': '+L('mide y calcula','measure and compute')); };
   const e=s.querySelector('#frend'); if(e) e.onclick=()=>{ closeSheet(); endGame(); }; },'debrief');
 if(next<0&&!more) setTimeout(()=>{},0);
}
function endGame(why){ if(G.over) return; G.over=true; closeSheet(); stopLoop(); const B=bests(); const k=G.mode+'|'+G.st.id+'|'+G.rf.id; const rec=!B[k]||G.score>B[k]; if(rec&&G.score>0){ B[k]=G.score; try{ localStorage.setItem('mat_fr_best',JSON.stringify(B)); }catch(e){} }
 const hits=G.targets.filter(t=>t.res==='hit').length; const shots=G.shots.length;
 let h='<div class="frw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],['Francotirador','#/francotirador'],[L('Resultado','Result')]])+'<h1 style="font-family:Anton,Impact,sans-serif;font-weight:400;letter-spacing:.02em;margin:14px 0 4px">'+(why?esc(why):L('Fin de la serie','End of the string'))+'</h1>'+
  '<p style="color:#bfc2b8">'+esc(G.rf.n)+' · '+esc(L(G.st.n[0],G.st.n[1]))+' · '+L(MODES[G.mode].n[0],MODES[G.mode].n[1])+'</p>'+
  '<div class="frsum"><div><b>'+G.score+'</b><span>'+L('puntos','points')+'</span></div><div><b>'+hits+'/'+G.targets.length+'</b><span>'+L('placas','plates')+'</span></div><div><b>'+shots+'</b><span>'+L('disparos','rounds')+'</span></div></div>'+
  (rec&&G.score>0?'<p class="frok frbig">'+L('Nuevo récord en este escenario con este fusil','New best for this location and rifle')+'</p>':(B[k]?'<p>'+L('Récord','Best')+': '+B[k]+'</p>':''))+
  '<table class="frtab"><tr><th>'+L('Placa','Plate')+'</th><th>'+L('Distancia','Distance')+'</th><th>'+L('Disparos','Rounds')+'</th><th>'+L('Resultado','Result')+'</th><th>'+L('Puntos','Points')+'</th></tr>'+G.targets.map(t=>'<tr><td>P'+(t.i+1)+'</td><td>'+ni(t.R)+' m</td><td>'+t.shots+'</td><td>'+(t.res==='hit'?'<span class="frok">'+L('tocada','hit')+'</span>':(t.shots?'<span class="frko">'+L('fallada','missed')+'</span>':'—'))+'</td><td>'+t.pts+'</td></tr>').join('')+'</table>'+
  '<div class="frrow"><button type="button" class="frbtn" id="frre">'+L('Otra serie','Another string')+'</button><button type="button" class="frbtn sec" id="frmenu">'+L('Cambiar fusil o modo','Change rifle or mode')+'</button></div></div>';
 X.set(h,'Francotirador'); document.getElementById('frre').onclick=()=>{ newGame(); game(); window.scrollTo(0,0); }; document.getElementById('frmenu').onclick=()=>{ intro(); window.scrollTo(0,0); }; }

/* ===== Solución «a mano» con lo que ve el jugador (para comprobar que el Veterano es resoluble) ===== */
function manualSolve(i){ const t=G.targets[i]; G.cur=i; const K=kestrel(); let Lr=lase(); if(!Lr||Lr.none||Lr.far) return null; const rf=G.rf;
 /* solo lo que el jugador lee, con la precisión que muestra la pantalla */
 const r1=v=>Math.round(v*10)/10;
 const D=Lr.R, thd=r1(Lr.ang), A=r1(Lr.az), cth=Math.cos(thd*Math.PI/180), Dh=D; const da=Math.round(K.da), Ks=r1(K.s), Kd=Math.round(K.dir), KT=r1(K.T), KP=r1(K.P);
 let j=0; while(j<DAS.length-2&&da>DAS[j+1]) j++; const f=(da-DAS[j])/(DAS[j+1]-DAS[j]);
 const dec={el:100,w:1000,t:1000}; const shown=rows=>rows.map(r=>({d:r.d,el:Math.round(r.el*100)/100,w:Math.round(r.w*1000)/1000,t:Math.round(r.t*1000)/1000,v:r.v}));
 const T0=shown(dopeTable(rf,DAS[j])), T1=shown(dopeTable(rf,DAS[j+1])); const q=(rows,k)=>rowsInterp(rows,Dh)[k];
 const it=k=>q(T0,k)+(q(T1,k)-q(T0,k))*f;
 const drop=it('el')*cth, wcol=it('w'), tof=it('t');
 const c1=-Ks*Math.sin((Kd-A)*Math.PI/180);
 const cf=G.flags.map(fl=>{ const g=flagGeom(fl,now()); return g.side*(r1(g.th)/4)*0.44704; });
 const cb=[c1,cf[1],cf[2]];
 const weff=0.45*cb[bandOf(Dh/6)]+0.38*cb[bandOf(Dh/2)]+0.17*cb[bandOf(5*Dh/6)];
 const sg=millerSg(rf,atmos(1013.25,15,0))*(((KT*9/5+32)+460)/519)*(29.92/(KP*0.02953));
 const spin=1.25*(sg+1.2)*Math.pow(tof,1.83)*0.0254/D*1000; const lat=G.st.lat*Math.PI/180, Ar=A*Math.PI/180;
 const corH=1000*OMEGA*tof*Math.sin(lat), corV=1000*OMEGA*tof*Math.cos(lat)*Math.sin(Ar);
 return {elev:drop-corV, wdg:-(weff*wcol+spin+corH), parts:{wcol:wcol,drop:drop,corV:corV,wind:weff*wcol,spin:spin,corH:corH,weff:weff,D:D,Dh:Dh,da:da}}; }


/* ===== Modo «Aprende a disparar»: lecciones guiadas, paso a paso, con los mismos métodos de «Fórmulas» ===== */
/* el viento de cada tramo da en la bandera un ángulo entero (ángulo = 4 × mph), así las cuentas del alumno salen exactas */
const LESSONS=[
 {rf:'m24',st:'campo',T:14,rh:50,dp:0,az:0,d:480,w:0.6,mil:1.25,mph:[8,6,4],sd:[1,1,1]},
 {rf:'trg42',st:'artico',T:-12,rh:70,dp:4,az:90,d:1540,w:0.77,mil:0.5,mph:[10,6,3],sd:[1,1,-1]}];
function newLesson(n){ n=n?1:0; const Ls=LESSONS[n]; const keep={mode:CFG.mode,rifle:CFG.rifle,stage:CFG.stage};
 if(CFG.unit!=='mil'){ CFG._u=CFG.unit; CFG.unit='mil'; }
 CFG.mode='veterano'; CFG.rifle=Ls.rf; CFG.stage=Ls.st; newGame(); Object.assign(CFG,keep);
 const st=G.st; G.mode='aprende'; G.T=Ls.T; G.rh=Ls.rh; G.dp=Ls.dp; G.az=Ls.az; G.env=stageEnv(st,G.T,G.rh,G.dp); G.zone=Ls.d+220;
 const t={i:0,d:Ls.d,u:0,w:Ls.w,h:Ls.w,shape:'placa',post:0.9,gy:terrain(st,Ls.d,0),hits:[],res:null,shots:0,pts:0,lased:null};
 t.zc=t.gy+t.post+t.h/2; t.e=Math.atan2(t.zc-EYE,t.d)*1000; t.R=Math.hypot(t.d,t.zc-EYE); G.targets=[t];
 const e1=Math.round(t.R/3), e2=Math.round(2*t.R/3);
 G.wind={b:Ls.mph.map((m,k)=>({s:m*0.44704,dir:(G.az+(Ls.sd[k]>0?270:90))%360})),e1:e1,e2:e2};
 G.flags=[{d:Math.round(e1*0.5),u:-170,band:0},{d:Math.round((e1+e2)/2),u:-150,band:1},{d:Math.round((e2+t.R)/2),u:-135,band:2}]; G.flags.forEach(f=>{ f.gy=terrain(st,f.d,f.u); });
 G.timeLimit=0; G.rounds=9; G.cur=0; G.view='pano'; G.aim={u:0,e:t.e}; G.aimSet=false; G.pano={u:0}; G.dialE=0; G.dialW=0; G.readK=null; G.readL=null; G.score=0; G.shots=[];
 G.tut={n:n,s:0,ok:{},val:{},ch:{},res:'',show:false}; CACHE=null; G.tut.sol=tutCalc(); return G; }
/* las cuentas de la lección, con la misma precisión que muestran los instrumentos y la tarjeta */
function tutCalc(){ const t=G.targets[0], rf=G.rf; const r1=v=>Math.round(v*10)/10, r2=v=>Math.round(v*100)/100, r3=v=>Math.round(v*1000)/1000;
 const R=Math.round(t.R), ang=r1(t.e*0.0572958), cth=r3(Math.cos(ang*Math.PI/180)), P=r1(G.env.P), da=Math.round(G.env.da);
 let j=0; while(j<DAS.length-2&&da>DAS[j+1]) j++; const c0=DAS[j], c1=DAS[j+1], f=r2((da-c0)/(c1-c0));
 const A_=dopeTable(rf,c0), B_=dopeTable(rf,c1); let k=1; while(k<A_.length-1&&A_[k].d<R) k++; const d0=A_[k-1].d, d1=A_[k].d, fr=r2((R-d0)/(d1-d0));
 const grid=(key,rd)=>{ const a0=rd(A_[k-1][key]),a1=rd(A_[k][key]),b0=rd(B_[k-1][key]),b1=rd(B_[k][key]); const x=rd(a0+(a1-a0)*fr), y=rd(b0+(b1-b0)*fr); return {a0:a0,a1:a1,b0:b0,b1:b1,x:x,y:y,v:rd(x+(y-x)*f)}; };
 const EL=grid('el',r2), WC=grid('w',r3), TF=grid('t',r3); const drop=r2(EL.v*cth);
 const fl=G.flags.map(x=>{ const g=flagGeom(x,0); return {th:r1(g.th),side:g.side}; }); const mph=fl.map(x=>r2(x.th/4)), ms=mph.map(m=>r2(m*0.44704));
 const zi=[bandOf(R/6),bandOf(R/2),bandOf(5*R/6)], W_=[0.45,0.38,0.17];
 const weff=r2(W_[0]*fl[zi[0]].side*ms[zi[0]]+W_[1]*fl[zi[1]].side*ms[zi[1]]+W_[2]*fl[zi[2]].side*ms[zi[2]]); const wmil=r2(weff*WC.v);
 const sg0=r2(millerSg(rf,atmos(1013.25,15,0))), tF=r1(G.T*9/5+32), fT=r3((tF+460)/519), Pin=r2(P*0.02953), fP=r3(29.92/Pin), sg=r2(sg0*fT*fP);
 const tt=TF.v, t183=r3(Math.pow(tt,1.83)), sdIn=r2(1.25*(sg+1.2)*t183), sdCm=r1(sdIn*2.54), spin=r2(sdCm/(R/10));
 const lat=G.st.lat, Az=G.az, sinp=r3(Math.sin(lat*Math.PI/180)), cosp=r3(Math.cos(lat*Math.PI/180)), sinA=r3(Math.sin(Az*Math.PI/180));
 const corH=r2(1000*OMEGA*tt*sinp), corV=r2(1000*OMEGA*tt*cosp*sinA), corHcm=r1(OMEGA*R*tt*sinp*100), corVcm=r1(OMEGA*R*tt*cosp*sinA*100);
 const elev=r2(drop-corV), push=r2(wmil+spin+corH);
 return {R:R,ang:ang,cth:cth,P:P,da:da,c0:c0,c1:c1,f:f,d0:d0,d1:d1,fr:fr,EL:EL,WC:WC,TF:TF,drop:drop,fl:fl,mph:mph,ms:ms,zi:zi,weff:weff,wmil:wmil,
  sg0:sg0,tF:tF,fT:fT,Pin:Pin,fP:fP,sg:sg,tt:tt,t183:t183,sdIn:sdIn,sdCm:sdCm,spin:spin,lat:lat,Az:Az,sinp:sinp,cosp:cosp,sinA:sinA,corH:corH,corV:corV,corHcm:corHcm,corVcm:corVcm,
  elev:elev,push:push,dialE:r1(elev),dialW:r1(-push)}; }

function tutSteps(){ const tu=G.tut, S=tu.sol, Ls=LESSONS[tu.n], rf=G.rf, n=tu.n; const N=(v,d)=>nf(v,d==null?2:d), cm=mil=>ni(Math.abs(mil)*S.R/10)+' cm';
 const side=s=>s>0?L('derecha','right'):L('izquierda','left'); const F=s=>'<code class="frf">'+s+'</code>'; const p=s=>'<p>'+s+'</p>';
 const steps=[];
 steps.push({id:'start',h:n===0?L('Lección 1: tu primer disparo a '+ni(S.R)+' m','Lesson 1: your first shot at '+ni(S.R)+' m'):L('Lección 2: '+ni(S.R)+' m y la rotación de la Tierra','Lesson 2: '+ni(S.R)+' m and the Earth’s rotation'),
  body:(n===0?p(L('Vas a disparar un '+esc(rf.n)+' (.308) a una placa de acero de '+Math.round(Ls.w*100)+' cm, en terreno llano. Un tirador no apunta «a ojo»: mide, calcula y gira las torretas del visor.','You will fire an '+esc(rf.n)+' (.308) at a '+Math.round(Ls.w*100)+' cm steel plate on flat ground. A marksman does not aim “by eye”: they measure, work it out and dial the scope turrets.')):
   p(L('Ahora un '+esc(rf.n)+' (.338 Lapua Magnum) a '+ni(S.R)+' m, en un campo ártico a '+nf(G.T,0)+' °C y '+nf(S.lat,1)+'° de latitud norte. La bala vuela unos '+nf(S.tt,1)+' segundos (al final ya va más lenta que el sonido) y en ese tiempo la Tierra gira debajo de ella: aquí el Coriolis ya cuenta.','Now an '+esc(rf.n)+' (.338 Lapua Magnum) at '+ni(S.R)+' m, on an Arctic range at '+nf(G.T,0)+' °C and '+nf(S.lat,1)+'° north. The bullet flies for about '+nf(S.tt,1)+' seconds (by the end it is slower than sound) and in that time the Earth turns under it: here Coriolis matters.')))+
   p(L('Son 7 pasos: distancia, aire, caída, viento, giro de la bala, rotación de la Tierra y, al final, sumarlo todo y disparar. En cada paso te explico qué hacer; tú lees el instrumento o haces la cuenta, y yo lo compruebo.','There are 7 steps: distance, air, drop, wind, bullet spin, the Earth’s rotation and, at the end, adding it all up and firing. In each step I explain what to do; you read the instrument or do the sum, and I check it.'))+
   p(L('Todo se mide en mil (milirradianes): 1 mil son 10 cm a 100 m, así que a '+ni(S.R)+' m 1 mil son '+cm(1)+'. Ten a mano la calculadora del móvil o la de «Notas y calculadora».','Everything is measured in mils (milliradians): 1 mil is 10 cm at 100 m, so at '+ni(S.R)+' m 1 mil is '+cm(1)+'. Keep your phone’s calculator handy, or the one in “Notes & calculator”.'))});
 steps.push({id:'dist',h:L('1. La distancia','1. The distance'),
  body:p(L('Todo depende de la distancia: cuanto más lejos, más cae la bala y más la empuja el viento. Abre el telémetro láser: lanza un rayo a la placa y te da la distancia en metros.','Everything depends on the distance: the further away, the more the bullet drops and the more the wind pushes it. Open the laser rangefinder: it fires a beam at the plate and gives you the distance in metres.'))+
   p(L('Sin telémetro se mide con la retícula del visor: la placa mide '+N(Ls.w)+' m y en la retícula ocupa '+N(Ls.mil)+' mil.','Without a rangefinder you range with the scope reticle: the plate is '+N(Ls.w)+' m wide and covers '+N(Ls.mil)+' mil in the reticle.'))+F(L('Distancia (m) = tamaño (m) × 1000 ÷ mil','Distance (m) = size (m) × 1000 ÷ mils')),
  tools:[['lrf',L('Abrir el telémetro','Open the rangefinder')]],
  inputs:[{label:L('Distancia a la placa (m)','Distance to the plate (m)'),v:S.R,tol:1,hint:L('Abre el telémetro y copia el número grande, en metros.','Open the rangefinder and copy the big number, in metres.')}],
  work:F(L('Telémetro: '+ni(S.R)+' m\nCon la retícula: '+N(Ls.w)+' × 1000 ÷ '+N(Ls.mil)+' = '+ni(S.R)+' m   (coinciden)','Rangefinder: '+ni(S.R)+' m\nWith the reticle: '+N(Ls.w)+' × 1000 ÷ '+N(Ls.mil)+' = '+ni(S.R)+' m   (they match)'))+p(L('Ángulo '+nf(S.ang,1)+'°: el terreno es llano, así que no hay que corregir por pendiente (cos θ = '+N(S.cth,3)+').','Angle '+nf(S.ang,1)+'°: the ground is flat, so there is no slope correction (cos θ = '+N(S.cth,3)+').'))});
 const cols=[[S.c0-500,S.c0],[S.c0,S.c1],[S.c1,S.c1+500]]; const c0t=S.c0<0?'('+ni(S.c0)+')':ni(S.c0);
 steps.push({id:'atm',h:L('2. El aire: temperatura, presión y altitud de densidad','2. The air: temperature, pressure and density altitude'),
  body:p(L('El aire frena la bala. Si el aire es <b>caliente o fino</b> (calor, montaña, presión baja), frena menos: la bala cae menos y necesitas <b>menos mil</b>. Si es <b>frío o denso</b> (frío, nivel del mar, presión alta), frena más: necesitas <b>más mil</b>.','Air slows the bullet down. If the air is <b>hot or thin</b> (heat, mountains, low pressure) it slows it less: the bullet drops less and you need <b>fewer mils</b>. If it is <b>cold or dense</b> (cold, sea level, high pressure) it slows it more: you need <b>more mils</b>.'))+
   p(L('El anemómetro (tipo Kestrel) junta temperatura, presión y humedad en un solo número: la <b>altitud de densidad</b> (DA). Ábrelo, pulsa MEDIR y apunta la DA. La tarjeta de datos tiene una columna cada 500 m de DA: elige las dos entre las que cae la tuya.','The wind meter (Kestrel type) combines temperature, pressure and humidity into one number: the <b>density altitude</b> (DA). Open it, press MEASURE and note the DA. The data card has a column every 500 m of DA: pick the two yours falls between.')),
  tools:[['kestrel',L('Abrir el anemómetro','Open the wind meter')]],
  inputs:[{label:L('Altitud de densidad (m)','Density altitude (m)'),v:S.da,tol:2,hint:L('Pulsa MEDIR en el anemómetro y copia la línea «Altitud de densidad».','Press MEASURE on the wind meter and copy the “Density altitude” line.')},
   {label:L('Columnas de la tarjeta','Card columns'),choice:cols.map(c=>ni(c[0])+' / '+ni(c[1])+' m'),v:1,hint:L('Tu DA tiene que quedar entre las dos columnas.','Your DA must lie between the two columns.')}],
  work:F(L('Anemómetro: '+nf(G.T,1)+' °C · '+nf(S.P,1)+' hPa · '+G.rh+' % → DA '+ni(S.da)+' m\n'+ni(S.da)+' está entre las columnas '+ni(S.c0)+' y '+ni(S.c1)+'\nFracción entre columnas = ('+ni(S.da)+' − '+c0t+') ÷ 500 = '+N(S.f),'Wind meter: '+nf(G.T,1)+' °C · '+nf(S.P,1)+' hPa · '+G.rh+' % → DA '+ni(S.da)+' m\n'+ni(S.da)+' lies between the '+ni(S.c0)+' and '+ni(S.c1)+' columns\nFraction between columns = ('+ni(S.da)+' − '+c0t+') ÷ 500 = '+N(S.f)))+
   p(L('Compruébalo en la tarjeta a '+ni(S.R)+' m: con DA '+ni(S.c0)+' la caída es '+N(S.EL.x)+' mil y con DA '+ni(S.c1)+' es '+N(S.EL.y)+' mil. Más DA (aire más fino) = menos caída.','Check it on the card at '+ni(S.R)+' m: at DA '+ni(S.c0)+' the drop is '+N(S.EL.x)+' mil and at DA '+ni(S.c1)+' it is '+N(S.EL.y)+' mil. Higher DA (thinner air) = less drop.')+
    (S.da<0?L(' Hoy, a '+nf(G.T,0)+' °C, el aire es tan denso que la DA sale negativa: es como tirar por debajo del nivel del mar, y la bala caerá más.',' Today, at '+nf(G.T,0)+' °C, the air is so dense that the DA is negative: it is like shooting below sea level, and the bullet will drop more.'):''))});
 steps.push({id:'drop',h:L('3. La caída de la bala','3. Bullet drop'),
  body:p(L('La gravedad tira de la bala desde que sale del cañón. La columna «Alza» de la tarjeta dice cuántos mil hay que subir la torreta de elevación a cada distancia. Abre la tarjeta.','Gravity pulls the bullet down from the moment it leaves the barrel. The card’s “Elev.” column tells you how many mils to dial up on the elevation turret at each distance. Open the card.'))+
   p(L('Tus '+ni(S.R)+' m no están en la tabla: quedan entre las filas '+ni(S.d0)+' y '+ni(S.d1)+' m, a una fracción ('+ni(S.R)+' − '+ni(S.d0)+') ÷ 50 = '+N(S.fr)+'. Interpola primero entre filas en cada columna y luego entre las dos columnas con la fracción '+N(S.f)+' del paso 2.','Your '+ni(S.R)+' m are not in the table: they lie between the '+ni(S.d0)+' and '+ni(S.d1)+' m rows, at a fraction ('+ni(S.R)+' − '+ni(S.d0)+') ÷ 50 = '+N(S.fr)+'. Interpolate between rows in each column first, then between the two columns with the fraction '+N(S.f)+' from step 2.'))+
   F(L('valor = fila '+ni(S.d0)+' + (fila '+ni(S.d1)+' − fila '+ni(S.d0)+') × '+N(S.fr)+'\ncaída = col. '+ni(S.c0)+' + (col. '+ni(S.c1)+' − col. '+ni(S.c0)+') × '+N(S.f),'value = row '+ni(S.d0)+' + (row '+ni(S.d1)+' − row '+ni(S.d0)+') × '+N(S.fr)+'\ndrop = col. '+ni(S.c0)+' + (col. '+ni(S.c1)+' − col. '+ni(S.c0)+') × '+N(S.f))),
  tools:[['card',L('Abrir la tarjeta','Open the data card')]],
  inputs:[{label:L('Caída (mil)','Drop (mil)'),v:S.drop,tol:0.03,hint:L('Usa la columna «Alza» en las DA '+ni(S.c0)+' y '+ni(S.c1)+', filas '+ni(S.d0)+' y '+ni(S.d1)+' m.','Use the “Elev.” column at DA '+ni(S.c0)+' and '+ni(S.c1)+', rows '+ni(S.d0)+' and '+ni(S.d1)+' m.')}],
  work:F(L('DA '+ni(S.c0)+': '+N(S.EL.a0)+' + ('+N(S.EL.a1)+' − '+N(S.EL.a0)+') × '+N(S.fr)+' = '+N(S.EL.x)+'\nDA '+ni(S.c1)+': '+N(S.EL.b0)+' + ('+N(S.EL.b1)+' − '+N(S.EL.b0)+') × '+N(S.fr)+' = '+N(S.EL.y)+'\nEntre columnas: '+N(S.EL.x)+' + ('+N(S.EL.y)+' − '+N(S.EL.x)+') × '+N(S.f)+' = '+N(S.EL.v)+' mil\nPendiente: × cos θ = × '+N(S.cth,3)+' → caída '+N(S.drop)+' mil',
   'DA '+ni(S.c0)+': '+N(S.EL.a0)+' + ('+N(S.EL.a1)+' − '+N(S.EL.a0)+') × '+N(S.fr)+' = '+N(S.EL.x)+'\nDA '+ni(S.c1)+': '+N(S.EL.b0)+' + ('+N(S.EL.b1)+' − '+N(S.EL.b0)+') × '+N(S.fr)+' = '+N(S.EL.y)+'\nBetween columns: '+N(S.EL.x)+' + ('+N(S.EL.y)+' − '+N(S.EL.x)+') × '+N(S.f)+' = '+N(S.EL.v)+' mil\nSlope: × cos θ = × '+N(S.cth,3)+' → drop '+N(S.drop)+' mil'))+
   p(L('Es lo que subirás en la torreta de elevación. La giras en el paso 7, junto con el último ajuste.','That is what you will dial up on the elevation turret. You dial it in step 7, together with the last adjustment.'))});

 const fN=[0,1,2].map(i=>L('Bandera ','Flag ')+(i+1)); const K5=EN()?'0.44704':'0,44704';
 steps.push({id:'flags',h:L('4. El viento (1 de 3): leer las banderas','4. Wind (1 of 3): reading the flags'),
  body:p(L('El viento empuja la bala de lado. Entre tú y la placa hay 3 banderas, una en cada tercio del recorrido: tramo 1 cerca, tramo 2 en medio y tramo 3 lejos. El anemómetro solo mide el viento donde estás tú; lo de lejos se lee en las banderas.','The wind pushes the bullet sideways. Between you and the plate there are 3 flags, one in each third of the path: zone 1 near, zone 2 in the middle and zone 3 far. The wind meter only measures the wind where you are; further out you read it from the flags.'))+
   p(L('Abre los prismáticos y mira cada bandera: el transportador da el ángulo de la tela con el mástil y hacia qué lado cuelga. Regla de campo del manual del Ejército de EE. UU. (FM 23-10):','Open the binoculars and look at each flag: the protractor gives the angle of the cloth from the pole and which way it hangs. Field rule from the US Army manual (FM 23-10):'))+F(L('viento cruzado (mph) = ángulo (°) ÷ 4      1 mph = 0,44704 m/s','crosswind (mph) = angle (°) ÷ 4      1 mph = 0.44704 m/s')),
  tools:[['flags',L('Abrir los prismáticos','Open the binoculars')]],
  inputs:[0,1,2].map(i=>({label:fN[i]+': '+L('ángulo (°)','angle (°)'),v:S.fl[i].th,tol:0.5,hint:L('En los prismáticos pulsa «Bandera '+(i+1)+'» y copia el «Ángulo con el mástil».','In the binoculars press “Flag '+(i+1)+'” and copy the “Angle from the pole”.')})),
  work:F([0,1,2].map(i=>fN[i]+': '+nf(S.fl[i].th,1)+'° ÷ 4 = '+N(S.mph[i])+' mph × '+K5+' = '+N(S.ms[i])+' m/s → '+side(S.fl[i].side)).join('\n'))+
   (S.fl.some(x=>x.side<0)?p(L('Ojo: la bandera 3 cuelga hacia el otro lado. Allí el viento empuja al contrario y en el paso siguiente se resta.','Careful: flag 3 hangs the other way. Out there the wind pushes the opposite way, and in the next step it is subtracted.')):'')});
 const wsum=[0,1,2].map(i=>(i===0?(S.fl[S.zi[0]].side>0?'':'− '):(S.fl[S.zi[i]].side>0?' + ':' − '))+N([0.45,0.38,0.17][i])+' × '+N(S.ms[S.zi[i]])).join('');
 steps.push({id:'weff',h:L('4. El viento (2 de 3): el viento efectivo','4. Wind (2 of 3): the effective wind'),
  body:p(L('El viento cerca de ti pesa más que el lejano: si la bala se tuerce al principio, ese error crece durante todo el vuelo. Por eso cada tramo tiene un peso: <b>tramo 1 × 0,45</b>, <b>tramo 2 × 0,38</b> y <b>tramo 3 × 0,17</b>. Suma los tres (si uno empuja al lado contrario, réstalo).','Wind near you counts more than wind far away: if the bullet is pushed off at the start, that error grows over the whole flight. So each zone has a weight: <b>zone 1 × 0.45</b>, <b>zone 2 × 0.38</b> and <b>zone 3 × 0.17</b>. Add the three (if one pushes the other way, subtract it).'))+
   F(L('Viento efectivo = ','Effective wind = ')+wsum+' = ?'),
  inputs:[{label:L('Viento efectivo hacia la ','Effective wind to the ')+side(S.weff)+' (m/s)',v:Math.abs(S.weff),tol:0.03,hint:L('Multiplica cada viento en m/s por su peso y súmalos','Multiply each wind in m/s by its weight and add them')+(S.fl.some(x=>x.side<0)?L(' (el de la bandera 3 se resta)',' (flag 3’s is subtracted)'):'')+'.'}],
  work:F(L('Viento efectivo = ','Effective wind = ')+wsum+' = '+N(Math.abs(S.weff))+' m/s → '+side(S.weff))});
 steps.push({id:'wmil',h:L('4. El viento (3 de 3): pasarlo a mil','4. Wind (3 of 3): turning it into mils'),
  body:p(L('La tarjeta tiene la columna «Viento 1 m/s»: cuántos mil desvía 1 m/s de viento cruzado a cada distancia. Interpólala igual que la caída (filas '+ni(S.d0)+' y '+ni(S.d1)+', columnas '+ni(S.c0)+' y '+ni(S.c1)+') y multiplícala por tu viento efectivo.','The card has the “Wind 1 m/s” column: how many mils 1 m/s of crosswind moves the bullet at each distance. Interpolate it like the drop (rows '+ni(S.d0)+' and '+ni(S.d1)+', columns '+ni(S.c0)+' and '+ni(S.c1)+') and multiply it by your effective wind.'))+
   F(L('desvío (mil) = viento efectivo (m/s) × columna «Viento 1 m/s»','deflection (mil) = effective wind (m/s) × “Wind 1 m/s” column')),
  tools:[['card',L('Abrir la tarjeta','Open the data card')]],
  inputs:[{label:L('Desvío por viento hacia la ','Wind deflection to the ')+side(S.wmil)+' (mil)',v:Math.abs(S.wmil),tol:0.03,hint:L('Columna «Viento 1 m/s» a '+ni(S.R)+' m (interpolada sale '+N(S.WC.v,3)+') × '+N(Math.abs(S.weff))+'.','“Wind 1 m/s” column at '+ni(S.R)+' m (interpolated it is '+N(S.WC.v,3)+') × '+N(Math.abs(S.weff))+'.')}],
  work:F(L('DA '+ni(S.c0)+': '+N(S.WC.a0,3)+' + ('+N(S.WC.a1,3)+' − '+N(S.WC.a0,3)+') × '+N(S.fr)+' = '+N(S.WC.x,3)+'\nDA '+ni(S.c1)+': '+N(S.WC.b0,3)+' + ('+N(S.WC.b1,3)+' − '+N(S.WC.b0,3)+') × '+N(S.fr)+' = '+N(S.WC.y,3)+'\nEntre columnas: '+N(S.WC.x,3)+' + ('+N(S.WC.y,3)+' − '+N(S.WC.x,3)+') × '+N(S.f)+' = '+N(S.WC.v,3)+' mil por cada m/s\nDesvío: '+N(Math.abs(S.weff))+' × '+N(S.WC.v,3)+' = '+N(Math.abs(S.wmil))+' mil hacia la '+side(S.wmil)+' ('+cm(S.wmil)+')',
   'DA '+ni(S.c0)+': '+N(S.WC.a0,3)+' + ('+N(S.WC.a1,3)+' − '+N(S.WC.a0,3)+') × '+N(S.fr)+' = '+N(S.WC.x,3)+'\nDA '+ni(S.c1)+': '+N(S.WC.b0,3)+' + ('+N(S.WC.b1,3)+' − '+N(S.WC.b0,3)+') × '+N(S.fr)+' = '+N(S.WC.y,3)+'\nBetween columns: '+N(S.WC.x,3)+' + ('+N(S.WC.y,3)+' − '+N(S.WC.x,3)+') × '+N(S.f)+' = '+N(S.WC.v,3)+' mil per m/s\nDeflection: '+N(Math.abs(S.weff))+' × '+N(S.WC.v,3)+' = '+N(Math.abs(S.wmil))+' mil to the '+side(S.wmil)+' ('+cm(S.wmil)+')'))+
   p(L('La bala se iría a la '+side(S.wmil)+'; en el paso 7 corregirás hacia el lado contrario.','The bullet would go '+side(S.wmil)+'; in step 7 you will correct the other way.'))});
 const tw=nf(rf.twistIn,rf.twistIn%1?2:0);
 steps.push({id:'spin',h:L('5. La deriva por giro','5. Spin drift'),
  body:p(L('El cañón tiene estrías que hacen girar la bala (paso 1:'+tw+' in, dextrógiro). Una bala que gira hacia la derecha se va desviando poco a poco hacia la <b>derecha</b>: con este cañón, siempre a la derecha.','The barrel has rifling that spins the bullet (1:'+tw+' in twist, right-hand). A bullet spinning to the right slowly drifts to the <b>right</b>: with this barrel, always to the right.'))+
   p(L('La tarjeta trae Sg, la estabilidad de la bala en aire estándar: '+N(S.sg0)+'. Se ajusta al aire de hoy y entra en la fórmula de Litz con el tiempo de vuelo t, que también sale de la tarjeta. Te dejo hechas las cuentas largas:','The card gives Sg, the bullet’s stability in standard air: '+N(S.sg0)+'. It is adjusted to today’s air and goes into Litz’s formula with the time of flight t, also from the card. Here are the long sums done for you:'))+
   F(L('t (columna «T. vuelo», interpolada) = '+N(S.tt,3)+' s\nSg hoy = '+N(S.sg0)+' × (('+nf(S.tF,1)+' °F + 460) ÷ 519) × (29,92 ÷ '+N(S.Pin)+' inHg)\n       = '+N(S.sg0)+' × '+N(S.fT,3)+' × '+N(S.fP,3)+' = '+N(S.sg)+'\nDeriva = 1,25 × (Sg + 1,2) × t^1,83 = 1,25 × '+N(S.sg+1.2)+' × '+N(S.t183,3)+' = '+N(S.sdIn)+' pulgadas\n       = '+N(S.sdIn)+' × 2,54 = '+nf(S.sdCm,1)+' cm',
    't (“ToF” column, interpolated) = '+N(S.tt,3)+' s\nSg today = '+N(S.sg0)+' × (('+nf(S.tF,1)+' °F + 460) ÷ 519) × (29.92 ÷ '+N(S.Pin)+' inHg)\n         = '+N(S.sg0)+' × '+N(S.fT,3)+' × '+N(S.fP,3)+' = '+N(S.sg)+'\nDrift = 1.25 × (Sg + 1.2) × t^1.83 = 1.25 × '+N(S.sg+1.2)+' × '+N(S.t183,3)+' = '+N(S.sdIn)+' inches\n      = '+N(S.sdIn)+' × 2.54 = '+nf(S.sdCm,1)+' cm'))+
   p(L('Tu parte: pásalo a mil. A '+ni(S.R)+' m, 1 mil son '+cm(1)+'.','Your part: turn it into mils. At '+ni(S.R)+' m, 1 mil is '+cm(1)+'.'))+F(L('mil = cm ÷ (distancia ÷ 10)','mil = cm ÷ (distance ÷ 10)')),
  inputs:[{label:L('Deriva por giro hacia la derecha (mil)','Spin drift to the right (mil)'),v:S.spin,tol:0.02,hint:L('Divide '+nf(S.sdCm,1)+' cm entre '+nf(S.R/10,0)+'.','Divide '+nf(S.sdCm,1)+' cm by '+nf(S.R/10,0)+'.')}],
  work:F(nf(S.sdCm,1)+' cm ÷ ('+ni(S.R)+' ÷ 10) = '+nf(S.sdCm,1)+' ÷ '+nf(S.R/10,0)+' = '+N(S.spin)+L(' mil a la derecha',' mil to the right'))});
 const OM=EN()?'0.00007292':'0,00007292', hd=S.Az===0?L(' (norte)',' (north)'):(S.Az===90?L(' (este)',' (east)'):(S.Az===270?L(' (oeste)',' (west)'):(S.Az===180?L(' (sur)',' (south)'):'')));
 steps.push({id:'earth',h:L('6. La rotación de la Tierra: Coriolis y Eötvös','6. The Earth’s rotation: Coriolis and Eötvös'),
  body:p(L('Mientras la bala vuela, la Tierra gira debajo de ella (ω = '+OM+' rad/s). Abre la brújula: estás a '+nf(S.lat,1)+'° de latitud norte y tiras con rumbo '+S.Az+'°'+hd+'.','While the bullet flies, the Earth turns under it (ω = '+OM+' rad/s). Open the compass: you are at '+nf(S.lat,1)+'° north and firing on heading '+S.Az+'°'+hd+'.'))+
   p(L('<b>Coriolis horizontal</b>: en el hemisferio norte la bala se desvía siempre a la derecha. <b>Eötvös</b> (vertical): tirando al este la bala llega más alta, al oeste más baja, y al norte o al sur no cambia.','<b>Horizontal Coriolis</b>: in the northern hemisphere the bullet always drifts right. <b>Eötvös</b> (vertical): shooting east the bullet arrives higher, west lower, and north or south it does not change.'))+
   F(L('Coriolis (mil) = 1000 × ω × t × sen(latitud)\n              = 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.sinp,3)+'\nEötvös  (mil) = 1000 × ω × t × cos(latitud) × sen(rumbo)\n              = 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.cosp,3)+' × '+N(S.sinA,3),
    'Coriolis (mil) = 1000 × ω × t × sin(latitude)\n              = 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.sinp,3)+'\nEötvös  (mil) = 1000 × ω × t × cos(latitude) × sin(heading)\n              = 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.cosp,3)+' × '+N(S.sinA,3))),
  tools:[['comp',L('Abrir la brújula','Open the compass')]],
  inputs:[{label:L('Coriolis hacia la derecha (mil)','Coriolis to the right (mil)'),v:S.corH,tol:0.01,hint:L('Multiplica 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.sinp,3)+'.','Multiply 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.sinp,3)+'.')},
   {label:L('Eötvös: cuánto sube la bala (mil)','Eötvös: how much the bullet rises (mil)'),v:S.corV,tol:0.01,hint:S.sinA===0?L('Tiras al norte: sen(0°) = 0, así que el Eötvös es 0.','You are shooting north: sin(0°) = 0, so Eötvös is 0.'):L('Multiplica 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.cosp,3)+' × '+N(S.sinA,3)+'.','Multiply 1000 × '+OM+' × '+N(S.tt,3)+' × '+N(S.cosp,3)+' × '+N(S.sinA,3)+'.')}],
  work:F(L('Coriolis = '+N(S.corH)+' mil a la derecha ('+nf(S.corHcm,1)+' cm a '+ni(S.R)+' m)\nEötvös = '+N(S.corV)+' mil'+(S.corV?' ('+nf(S.corVcm,1)+' cm más alta)':' (tiras al norte)'),'Coriolis = '+N(S.corH)+' mil to the right ('+nf(S.corHcm,1)+' cm at '+ni(S.R)+' m)\nEötvös = '+N(S.corV)+' mil'+(S.corV?' ('+nf(S.corVcm,1)+' cm higher)':' (shooting north)')))+
   p(n===0?L('A '+ni(S.R)+' m es diminuto: '+nf(S.corHcm,1)+' cm, mucho menos que la placa. Aun así se suma. En la lección 2, a 1.540 m, verás que ya importa.','At '+ni(S.R)+' m it is tiny: '+nf(S.corHcm,1)+' cm, far smaller than the plate. You still add it. In lesson 2, at 1,540 m, you will see it matters.'):
    L('A '+ni(S.R)+' m ya no es poca cosa: '+nf(S.corHcm,1)+' cm a la derecha y '+nf(S.corVcm,1)+' cm más alta por tirar al este. Muy al norte el Coriolis horizontal es mayor (sen '+nf(S.lat,1)+'° = '+N(S.sinp,3)+') y el Eötvös menor (cos '+nf(S.lat,1)+'° = '+N(S.cosp,3)+').','At '+ni(S.R)+' m it is no longer small: '+nf(S.corHcm,1)+' cm to the right and '+nf(S.corVcm,1)+' cm higher from shooting east. Far north the horizontal Coriolis is bigger (sin '+nf(S.lat,1)+'° = '+N(S.sinp,3)+') and Eötvös smaller (cos '+nf(S.lat,1)+'° = '+N(S.cosp,3)+').'))});

 const dirIdx=S.push>0?0:1, wL=S.dialW<0?L('I ','L '):L('D ','R '), wL1=S.dialW<0?L('I','L'):L('D','R');
 steps.push({id:'total',h:L('7. Sumarlo todo','7. Adding it all up'),
  body:p(L('Ya tienes todas las piezas. La torreta se gira hacia el lado <b>contrario</b> de donde se iría la bala.','You now have every piece. You turn the turret the <b>opposite</b> way to where the bullet would go.'))+
   F(L('Elevación = caída − Eötvös\n          = '+N(S.drop)+' − '+N(S.corV)+'\nDesvío    = viento + giro + Coriolis   (+ = a la derecha)\n          = '+N(S.wmil)+' + '+N(S.spin)+' + '+N(S.corH)+'\nDeriva en la torreta = el desvío, hacia el otro lado',
    'Elevation  = drop − Eötvös\n           = '+N(S.drop)+' − '+N(S.corV)+'\nDeflection = wind + spin + Coriolis   (+ = to the right)\n           = '+N(S.wmil)+' + '+N(S.spin)+' + '+N(S.corH)+'\nTurret windage = the deflection, the other way')),
  inputs:[{label:L('Elevación total, hacia arriba (mil)','Total elevation, up (mil)'),v:S.elev,tol:0.03,hint:L('Caída '+N(S.drop)+' menos Eötvös '+N(S.corV)+'.','Drop '+N(S.drop)+' minus Eötvös '+N(S.corV)+'.')},
   {label:L('Deriva total (mil)','Total windage (mil)'),v:Math.abs(S.push),tol:0.03,hint:L('Suma viento, giro y Coriolis.','Add wind, spin and Coriolis.')},
   {label:L('¿Hacia dónde giras la deriva?','Which way do you dial the windage?'),choice:[L('Izquierda','Left'),L('Derecha','Right')],v:dirIdx,hint:L('La bala se iría a la '+side(S.push)+': se corrige al otro lado.','The bullet would go '+side(S.push)+': you correct the other way.')}],
  work:F(L('Elevación = '+N(S.drop)+' − '+N(S.corV)+' = '+N(S.elev)+' mil arriba\nDesvío = '+N(S.wmil)+' + '+N(S.spin)+' + '+N(S.corH)+' = '+N(S.push)+' mil → deriva '+N(Math.abs(S.push))+' mil a la '+side(-S.push)+'\nEn clics de 0,1 mil: Arriba '+N(S.dialE,1)+' · '+wL+N(Math.abs(S.dialW),1),
   'Elevation = '+N(S.drop)+' − '+N(S.corV)+' = '+N(S.elev)+' mil up\nDeflection = '+N(S.wmil)+' + '+N(S.spin)+' + '+N(S.corH)+' = '+N(S.push)+' mil → windage '+N(Math.abs(S.push))+' mil '+side(-S.push)+'\nIn 0.1 mil clicks: Up '+N(S.dialE,1)+' · '+wL+N(Math.abs(S.dialW),1)))});
 steps.push({id:'fire',h:L('7. Girar las torretas y disparar','7. Dial the turrets and fire'),
  body:p(L('Pulsa «Mirar por la mira». Con los botones de las torretas pon <b>Elevación: Arriba '+N(S.dialE,1)+'</b> y <b>Deriva: '+wL+N(Math.abs(S.dialW),1)+'</b>. Cada clic es 0,1 mil; «+1» y «'+wL1+'1» son 10 clics de golpe. Deja la retícula en el centro de la placa y pulsa «Comprobar torretas».','Press “Look through the scope”. With the turret buttons set <b>Elevation: Up '+N(S.dialE,1)+'</b> and <b>Windage: '+wL+N(Math.abs(S.dialW),1)+'</b>. Each click is 0.1 mil; “+1” and “'+wL1+'1” are 10 clicks at once. Keep the reticle on the centre of the plate and press “Check turrets”.'))+
   p(L('Después pulsa «Contener aire» para que el visor quede quieto y DISPARAR antes de 6 segundos: si aguantas más, el pulso tiembla.','Then press “Hold breath” so the scope stays still, and FIRE within 6 seconds: hold it longer and your aim shakes.')),
  tools:[['scope',L('Mirar por la mira','Look through the scope')]],turret:true});
 steps.push({id:'end',h:L('Impacto. Repaso de la lección','Hit. Lesson review'),end:true,body:(()=>{ const row=(a,mil,why)=>'<span>'+a+'</span><b>'+N(Math.abs(mil))+' mil · '+cm(mil)+'</b><em>'+why+'</em>';
   return p(L('Has dado en la placa de '+Math.round(Ls.w*100)+' cm a '+ni(S.R)+' m. Así se reparte el disparo:','You hit the '+Math.round(Ls.w*100)+' cm plate at '+ni(S.R)+' m. This is how the shot breaks down:'))+
   '<div class="frco-kv">'+row(L('Caída (arriba)','Drop (up)'),S.drop,L('La gravedad: la pieza más grande. Sale de la tarjeta, ajustada al aire con la DA.','Gravity: the biggest piece. From the card, adjusted to the air with the DA.'))+
   row(L('Viento','Wind'),S.wmil,L('Tres banderas, pesos 0,45 / 0,38 / 0,17 y la columna de viento de la tarjeta.','Three flags, weights 0.45 / 0.38 / 0.17 and the card’s wind column.'))+
   row(L('Giro (derecha)','Spin (right)'),S.spin,L('La bala gira con las estrías y se va a la derecha.','The bullet spins with the rifling and drifts right.'))+
   row(L('Coriolis (derecha)','Coriolis (right)'),S.corH,L('La Tierra gira debajo de la bala.','The Earth turns under the bullet.'))+
   row(L('Eötvös (vertical)','Eötvös (vertical)'),S.corV,S.corV?L('Al este la bala llega más alta: se resta de la elevación.','Shooting east the bullet arrives higher: it comes off the elevation.'):L('Al norte no cambia nada.','Shooting north it changes nothing.'))+'</div>'+
   p(L('La placa mide '+Math.round(Ls.w*100)+' cm: tenías '+nf(Ls.w*50,0)+' cm de margen a cada lado del centro. Sin la corrección de viento habrías fallado por '+cm(S.wmil)+'.','The plate is '+Math.round(Ls.w*100)+' cm wide: you had '+nf(Ls.w*50,0)+' cm to spare each side of the centre. Without the wind correction you would have missed by '+cm(S.wmil)+'.')+
    (n===1?L(' Y sin giro ni Coriolis la bala se habría ido '+cm(S.spin+S.corH)+' a la derecha: fuera de la placa.',' And without spin and Coriolis the bullet would have gone '+cm(S.spin+S.corH)+' right: off the plate.'):''))+
   p(n===0?L('Ya sabes el método completo. En la lección 2 lo repites a 1.540 m, con frío ártico y una rotación de la Tierra que ya se nota.','You now know the whole method. In lesson 2 you repeat it at 1,540 m, with Arctic cold and an Earth’s rotation you can actually feel.'):L('Este es exactamente el método de Veterano. En Fácil la computadora balística hace las cuentas por ti; en Veterano las haces tú.','This is exactly the Veteran method. In Easy the ballistic computer does the sums for you; in Veteran you do them.')); })()});
 return steps; }

function coach(){ const el=document.getElementById('frcoach'); if(!el||!G||!G.tut) return; const tu=G.tut, S=tutSteps(); tu.s=clamp(tu.s,0,S.length-1); const st=S[tu.s];
 const okStep=(!st.inputs&&!st.turret)||tu.ok[st.id];
 let h='<div class="frco-hd"><span>'+L('Aprende a disparar','Learn to shoot')+' · '+L('lección ','lesson ')+(tu.n+1)+' · '+L('paso ','step ')+(tu.s+1)+' '+L('de','of')+' '+S.length+'</span><div class="frco-bar"><i style="width:'+Math.round(100*(tu.s+1)/S.length)+'%"></i></div></div>';
 h+='<h3>'+st.h+'</h3><div class="frco-bd">'+st.body+'</div>';
 if(st.tools) h+='<div class="frrow">'+st.tools.map(x=>'<button type="button" class="frbtn sec sm" data-ct="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>';
 if(st.inputs){ h+='<div class="frco-in">'+st.inputs.map((q,i)=>'<label><span>'+q.label+'</span>'+(q.choice?'<span class="frco-ch">'+q.choice.map((c,ci)=>'<button type="button" class="frbtn sec sm'+(tu.ch[st.id+i]===ci?' on':'')+'" data-cc="'+i+'" data-ci="'+ci+'">'+esc(c)+'</button>').join('')+'</span>':'<input class="frin" type="text" inputmode="decimal" autocomplete="off" data-cq="'+i+'" value="'+esc(tu.val[st.id+i]==null?'':tu.val[st.id+i])+'">')+'</label>').join('')+'</div>';
  h+='<div class="frrow"><button type="button" class="frbtn" id="frcchk">'+L('Comprobar','Check')+'</button></div>'; }
 if(st.turret) h+='<div class="frrow"><button type="button" class="frbtn" id="frcchk">'+L('Comprobar torretas','Check turrets')+'</button></div>';
 h+='<div class="frco-res" id="frcres">'+(tu.res||'')+(tu.show&&st.work&&!tu.ok[st.id]?st.work:'')+'</div>';
 if(st.end) h+='<div class="frrow">'+(tu.n===0?'<button type="button" class="frbtn" id="frcl2">'+L('Lección 2','Lesson 2')+'</button>':'')+'<button type="button" class="frbtn'+(tu.n===0?' sec':'')+'" id="frcfac">'+L('Saltar a Fácil','Go to Easy')+'</button><button type="button" class="frbtn sec" id="frcvet">'+L('Saltar a Veterano','Go to Veteran')+'</button><button type="button" class="frbtn sec" id="frcagain">'+L('Repetir la lección','Repeat the lesson')+'</button><button type="button" class="frbtn sec" id="frcdeb">'+L('Ver el informe del disparo','See the shot debrief')+'</button></div>';
 else h+='<div class="frrow frco-nav">'+(tu.s>0?'<button type="button" class="frbtn sec sm" id="frcprev">'+L('Paso anterior','Previous step')+'</button>':'')+(st.inputs||st.turret?'<button type="button" class="frbtn sec sm" id="frcrep">'+L('Repetir paso','Repeat step')+'</button>':'')+(st.turret?'':'<button type="button" class="frbtn sm" id="frcnext"'+(okStep?'':' disabled')+'>'+(tu.s===0?L('Empezar','Start'):L('Siguiente paso','Next step'))+'</button>')+'</div>';
 el.innerHTML=h;
 const q=s=>el.querySelector(s);
 el.querySelectorAll('[data-ct]').forEach(b=>b.onclick=()=>{ const k=b.getAttribute('data-ct'); if(k==='scope'){ closeSheet(); const t=G.targets[0]; G.cur=0; G.view='scope'; G.aim={u:t.u,e:t.e}; G.aimSet=true; CACHE=null; side(); const vw=document.getElementById('frview'); if(vw) vw.scrollIntoView({block:'start',behavior:'smooth'}); } else tool(k,k==='flags'?0:undefined); });
 el.querySelectorAll('[data-cq]').forEach(inp=>{ inp.oninput=()=>{ tu.val[st.id+inp.getAttribute('data-cq')]=inp.value; }; inp.onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); tutCheck(); } }; });
 el.querySelectorAll('[data-cc]').forEach(b=>b.onclick=()=>{ tu.ch[st.id+b.getAttribute('data-cc')]=+b.getAttribute('data-ci'); coach(); });
 const c=q('#frcchk'); if(c) c.onclick=()=>tutCheck();
 const sh=q('#frcshow'); if(sh) sh.onclick=()=>{ tu.show=true; coach(); };
 const pv=q('#frcprev'); if(pv) pv.onclick=()=>tutGo(tu.s-1);
 const nx=q('#frcnext'); if(nx) nx.onclick=()=>tutGo(tu.s+1);
 const rp=q('#frcrep'); if(rp) rp.onclick=()=>{ delete tu.ok[st.id]; (st.inputs||[]).forEach((x,i)=>{ delete tu.val[st.id+i]; delete tu.ch[st.id+i]; }); if(st.turret){ G.dialE=0; G.dialW=0; side(); } tu.res=''; tu.show=false; coach(); };
 const back=()=>{ closeSheet(); stopLoop(); if(CFG._u){ CFG.unit=CFG._u; delete CFG._u; } };
 const l2=q('#frcl2'); if(l2) l2.onclick=()=>{ closeSheet(); stopLoop(); CFG.lesson=1; saveCfg(); newLesson(1); game(); window.scrollTo(0,0); };
 const ag=q('#frcagain'); if(ag) ag.onclick=()=>{ closeSheet(); stopLoop(); newLesson(tu.n); game(); window.scrollTo(0,0); };
 const fa=q('#frcfac'); if(fa) fa.onclick=()=>{ back(); CFG.mode='facil'; saveCfg(); intro(); window.scrollTo(0,0); };
 const ve=q('#frcvet'); if(ve) ve.onclick=()=>{ back(); CFG.mode='veterano'; saveCfg(); intro(); window.scrollTo(0,0); };
 const db=q('#frcdeb'); if(db) db.onclick=()=>{ if(G.last) debrief(G.last); };
}
function tutGo(s){ const tu=G.tut; tu.s=s; tu.res=''; tu.show=false; closeSheet(); coach(); const el=document.getElementById('frcoach'); if(el&&el.getBoundingClientRect().top<0) el.scrollIntoView({block:'start',behavior:'smooth'}); }
function tutNum(s,big){ s=String(s==null?'':s).trim().replace(/\s/g,'').replace('−','-'); if(big){ if(!EN()&&/^[-+]?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s=s.replace(/\./g,''); if(EN()&&/^[-+]?[1-9]\d{0,2}(,\d{3})+$/.test(s)) s=s.replace(/,/g,''); }
 s=s.replace(',','.'); return s===''||!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s)?NaN:+s; }
function tutCheck(){ const tu=G.tut, S=tutSteps(), st=S[tu.s], sol=tu.sol; const okP='<p class="frok frbig"><b>'+L('Correcto.','Correct.')+'</b></p>';
 if(st.turret){ const dE=Math.round((G.dialE-sol.dialE)/0.1), dW=Math.round((G.dialW-sol.dialW)/0.1); const okE=Math.abs(dE)<=1, okW=Math.abs(dW)<=1;
  if(okE&&okW){ tu.ok[st.id]=true; tu.res=okP+'<p>'+L('Torretas: ','Turrets: ')+fmtE(G.dialE)+' · '+fmtW(G.dialW)+'. '+L('Ahora pulsa «Contener aire» y DISPARAR.','Now press “Hold breath” and FIRE.')+'</p>'; }
  else { delete tu.ok[st.id]; const li=[]; if(!okE) li.push(L('Elevación: tienes ','Elevation: you have ')+fmtE(G.dialE)+L('; tiene que marcar ','; it must read ')+fmtE(sol.dialE)+' ('+(dE>0?L('baja ','down '):L('sube ','up '))+Math.abs(dE)+L(' clics)',' clicks)'));
   if(!okW) li.push(L('Deriva: tienes ','Windage: you have ')+fmtW(G.dialW)+L('; tiene que marcar ','; it must read ')+fmtW(sol.dialW)+' ('+Math.abs(dW)+L(' clics hacia la ',' clicks to the ')+(dW>0?L('izquierda','left'):L('derecha','right'))+')');
   tu.res='<p class="frko frbig"><b>'+L('Todavía no.','Not yet.')+'</b></p><ul class="frco-ul">'+li.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+(G.view!=='scope'?'<p>'+L('Las torretas están en la vista por la mira: pulsa «Mirar por la mira».','The turrets are in the scope view: press “Look through the scope”.')+'</p>':''); }
  coach(); return; }
 const bad=[]; (st.inputs||[]).forEach((q,i)=>{ if(q.choice){ const c=tu.ch[st.id+i]; if(c!==q.v) bad.push('<b>'+q.label+'</b>: '+(c==null?L('elige una opción. ','pick an option. '):L('esa no es. ','that is not it. '))+q.hint); return; }
  const x=tutNum(tu.val[st.id+i],q.v>=100); if(isNaN(x)) { bad.push('<b>'+q.label+'</b>: '+L('escribe un número (puedes usar coma o punto). ','type a number (comma or point both work). ')+q.hint); return; }
  if(Math.abs(x-q.v)>q.tol+1e-9){ let why=''; if(q.v&&Math.abs(x+q.v)<=q.tol+1e-9) why=L('El número está bien pero con el signo cambiado. ','The number is right but with the wrong sign. '); else if(q.v&&Math.abs(x-q.v)<=Math.max(q.tol*4,Math.abs(q.v)*0.05)) why=L('Te acercas, pero no del todo: revisa los decimales. ','Close, but not quite: check the decimals. ');
   bad.push('<b>'+q.label+'</b>: '+L('has puesto ','you typed ')+esc(tu.val[st.id+i])+'. '+why+q.hint); } });
 if(!bad.length){ tu.ok[st.id]=true; tu.res=okP+(st.work||''); tu.show=false; }
 else { delete tu.ok[st.id]; tu.res='<p class="frko frbig"><b>'+L('No es correcto.','Not correct.')+'</b></p><ul class="frco-ul">'+bad.map(x=>'<li>'+x+'</li>').join('')+'</ul>'+(st.work&&!tu.show?'<div class="frrow"><button type="button" class="frbtn sec sm" id="frcshow">'+L('Ver la cuenta resuelta','Show the worked sum')+'</button></div>':''); }
 coach(); const r=document.getElementById('frcres'); if(r&&r.getBoundingClientRect().bottom>innerHeight) r.scrollIntoView({block:'nearest',behavior:'smooth'}); }
function tutShot(r){ const tu=G.tut; if(!tu) return; const S=tutSteps();
 if(r.hit){ tu.s=S.findIndex(x=>x.id==='end'); tu.res=''; tu.show=false; }
 else { const sol=tu.sol, offE=Math.abs(r.dialE-sol.dialE)>0.1001, offW=Math.abs(r.dialW-sol.dialW)>0.1001;
  tu.res='<p class="frko frbig"><b>'+L('Fallo','Miss')+'</b>: '+L('impacto ','impact ')+missTxt(r)+'.</p><p>'+(offE||offW?L('Las torretas no marcaban la solución: ','The turrets were not on the solution: ')+fmtE(r.dialE)+' · '+fmtW(r.dialW)+L('. Deben marcar ','. They must read ')+fmtE(sol.dialE)+' · '+fmtW(sol.dialW)+'.':(r.shk>0.005?L('El visor temblaba: contuviste el aire demasiado. Suéltalo, vuelve a contenerlo y dispara enseguida.','The scope was shaking: you held your breath too long. Breathe out, hold it again and fire straight away.'):L('La retícula no estaba en el centro de la placa: pulsa «Centrar en P1» y vuelve a disparar.','The reticle was not on the centre of the plate: press “Center on P1” and fire again.')))+'</p>'; }
 coach(); }

/* ===== Ruta ===== */
export function route(app,x){ APP=app; X=x; css(); CFG=loadCfg();
 const q=(location.hash.split('?')[1]||''); const P_={}; q.split('&').forEach(kv=>{ const [k,v]=kv.split('='); if(k) P_[k]=decodeURIComponent(v||''); });
 if(P_.m&&MODES[P_.m]) CFG.mode=P_.m; if(P_.r&&RIFLES.some(r=>r.id===P_.r)) CFG.rifle=P_.r; if(P_.s&&STAGES.some(s=>s.id===P_.s)) CFG.stage=P_.s; if(P_.u==='moa'||P_.u==='mil') CFG.unit=P_.u;
 intro(); }
/* para QA automática */
window.MAT_FR={G:()=>G,aimDist:()=>{ const W=CV?CV.clientWidth:390,H=CV?CV.clientHeight:844; return aimDist(viewParams(W,H)); },cfg:o=>{ Object.assign(CFG,o||{}); saveCfg(); return CFG; },cam:()=>G.bcam,camSkip:()=>{ if(G.bcam) G.bcam.skip=true; },start:()=>{ newGame(); game(); return G; },lase:lase,kestrel:kestrel,tool:tool,fire:fire,manual:manualSolve,breakdown:breakdown,
 dial:(e,w)=>{ G.dialE=e; G.dialW=w; side(); },aimAt:(i,he,hw)=>{ const t=G.targets[i]; G.cur=i; G.view='scope'; G.aimSet=true; movUpd(now()); G.aim={u:t.u+(hw||0),e:t.e+(he||0)}; G.trackOff=hw||0; G.trackLag=0; G.trackErr=0; G.trackPrev={i:i,u:t.u}; CACHE=null; side(); },
 view:v=>{ G.view=v; CACHE=null; side(); },setAz:a=>{ G.az=a; },setStage:o=>{ Object.assign(G,o); },debrief:()=>debrief(G.last),dope:da=>dopeTable(G.rf,da),closeSheet:closeSheet,
 solver:{fly:fly,atmos:atmos,zeroAngle:zeroAngle,millerSg:millerSg},
 sim:(i,e,w,held)=>{ const t=G.targets[i]; const s=shoot(t,t,t.u,t.e,e,w,held!==false,now()); return {hit:s.hit,dx:s.dxm,dy:s.dym,minMach:s.fl.minMach,t:s.fl.t}; },
 newGame:()=>newGame(),now:()=>now(),mv:{x:mvX,vis:mvVis,u:mvU,lead:leadMil,upd:movUpd},spot:spotCorr,
  testShot:(i,E,W_,hu,he,tm)=>{ const t=G.targets[i]; movUpd(tm); const aimU=t.u+(hu||0), aimE=t.e+(he||0); const sh=shoot(t,t,aimU,aimE,E,W_,true,tm); const bd=breakdown(t.R,t.mv?t.u0:t.u,t.e,tm);
    const r={i:i,R:t.R,dxm:sh.dxm,dym:sh.dym,dialE:E,dialW:W_,holdE:aimE-t.e,holdW:aimU-t.u,bd:bd,lead:t.mv?leadMil(t,bd.t):0,hit:sh.hit,tof:sh.fl.t,vis:mvOK(t,tm,sh.fl.t)}; r.c=spotCorr(r); return r; },tut:{start:n=>{ newLesson(n); game(); return G; },sol:()=>G.tut.sol,steps:()=>tutSteps().map(s=>s.id),go:s=>tutGo(s),state:()=>G.tut,check:()=>tutCheck()}};
