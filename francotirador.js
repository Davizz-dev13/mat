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
  const gx=-GRAV*si, gy=-GRAV*ci;
  let Od=0,Ou=0,Or=0; if(sh.cor){ const cl=Math.cos(sh.lat), sl=Math.sin(sh.lat), A=sh.az; Od=OMEGA*cl*Math.cos(A); Ou=OMEGA*sl; Or=-OMEGA*cl*Math.sin(A); }
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
  let spin=0; if(opt.spin){ const sg=millerSg(b,env); spin=b.twistDir*1.25*(sg+1.2)*Math.pow(tt,1.83)*0.0254; }
  if(track) track.push([R,yy,zz+spin,tt]);
  return {marks:mo,y:yy,z:zz+spin,spin:spin,t:tt,v:vv,mach:vv/env.a,minMach:Math.min(minM,vv/env.a),track:track}; }
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
  sky:['#6f8fb3','#dfe8f1'],far:'#a9b6c4',near:'#e9eef2',mid:'#d5dde5',hz:'#eef3f7'}
];
const MODES={facil:{n:['Fácil','Easy']},veterano:{n:['Veterano','Veteran']},desafio:{n:['Desafío','Challenge']}};
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
function windAt(t,band){ const W=G.wind; const b=W.b[band]; const g=G.mode==='facil'?1:(1+0.12*Math.sin(t/7.3+band)+0.06*Math.sin(t/2.1+2*band));
  const dd=G.mode==='facil'?0:(5*Math.sin(t/9.1+band*1.7)); return {s:Math.max(0,b.s*g),dir:(b.dir+dd+360)%360}; }
function bandOf(x){ return x<G.wind.e1?0:(x<G.wind.e2?1:2); }
/* componentes respecto a un acimut A (°): cola (+ empuja hacia el blanco), cruzado (+ empuja a la derecha) */
function comps(w,A){ const r=(w.dir-A)*Math.PI/180; return {tail:-w.s*Math.cos(r),cross:-w.s*Math.sin(r)}; }

/* ===== Mundo ===== */
function newGame(){ const rf=rifleOf(CFG.rifle), st=stageOf(CFG.stage); const mode=CFG.mode;
  const seed=mode==='desafio'?(STAGES.indexOf(st)*7919+RIFLES.indexOf(rf)*104729+20261108):((Date.now()^(Math.random()*1e9))>>>0);
  RND=rng(seed);
  const T=Math.round(rr(st.T[0],st.T[1])), rh=Math.round(rr(st.rh[0],st.rh[1])), dp=Math.round(rr(-12,12));
  const az=st.az[Math.floor(RND()*st.az.length)];
  const env=stageEnv(st,T,rh,dp);
  let dmin,dmax; if(mode==='facil'){ dmin=300; dmax=800; } else { dmin=600; dmax=rf.maxV; }
  const n=5; const ds=[]; for(let i=0;i<n;i++){ const f=n===1?0:i/(n-1); ds.push(Math.round((dmin+(dmax-dmin)*f+rr(-25,25))/5)*5); }
  ds[0]=Math.max(dmin,ds[0]); ds[n-1]=Math.min(dmax,ds[n-1]);
  G={zone:Math.max.apply(null,ds)+220};
  const us=[-120,-60,0,60,120].map(u=>u+rr(-18,18)); for(let i=us.length-1;i>0;i--){ const j=Math.floor(RND()*(i+1)); [us[i],us[j]]=[us[j],us[i]]; }
  const targets=ds.map((d,i)=>{ const mil=mode==='facil'?1.0:0.75; let w=Math.max(0.3,Math.round(d*mil/1000*10)/10); const shape=i%2?'gong':'placa';
    const u=us[i]; const g=terrain(st,d,u); return {i:i,d:d,u:u,w:w,h:shape==='gong'?w:w,shape:shape,post:0.9,gy:g,hits:[],res:null,shots:0,pts:0,lased:null}; });
  targets.forEach(t=>{ t.zc=t.gy+t.post+t.h/2; t.e=Math.atan2(t.zc-EYE,Math.hypot(t.d,0))*1000; t.R=Math.hypot(t.d,t.zc-EYE); });
  const dm=Math.max.apply(null,ds); const e1=Math.round(dm/3), e2=Math.round(2*dm/3);
  const s0=rr(1.5,mode==='facil'?5:6.5), dir0=Math.round(rr(0,360));
  const b=[{s:s0,dir:dir0}];
  if(mode==='facil'){ b.push({s:s0,dir:dir0},{s:s0,dir:dir0}); }
  else { b.push({s:s0*rr(0.6,1.45),dir:(dir0+rr(-35,35)+360)%360},{s:s0*rr(0.5,1.5),dir:(dir0+rr(-45,45)+360)%360}); }
  const flags=[{d:Math.round(e1*0.5),u:-170+rr(-8,8),band:0},{d:Math.round((e1+e2)/2),u:-150+rr(-8,8),band:1},{d:Math.round((e2+dm)/2),u:-135+rr(-8,8),band:2}];
  flags.forEach(f=>{ f.gy=terrain(st,f.d,f.u); });
  const a0=zeroAngle(rf,rf);
  G={zone:G.zone,mode:mode,rf:rf,st:st,seed:seed,T:T,rh:rh,dp:dp,az:az,env:env,targets:targets,flags:flags,a0:a0,
     wind:{b:b,e1:e1,e2:e2},t0:performance.now(),cur:0,view:'pano',zoom:12,aim:{u:targets[0].u,e:targets[0].e},pano:{u:0},
     dialE:0,dialW:0,score:0,shots:[],readK:null,readL:null,busy:false,breath:0,timeLimit:mode==='facil'?0:(mode==='desafio'?12*60:15*60),
     rounds:mode==='facil'?5:3,over:false,notes:'',anim:null,shake:{x:0,y:0},recoil:0,sheet:null};
  try{ G.notes=localStorage.getItem('mat_fr_notes')||''; }catch(e){}
  CACHE=null; return G; }
function now(){ return (performance.now()-G.t0)/1000; }
function timeLeft(){ return G.timeLimit?Math.max(0,G.timeLimit-now()):Infinity; }

/* ===== Física aplicada al disparo ===== */
function windFn(A,t){ const c=[0,1,2].map(k=>comps(windAt(t,k),A)); return x=>{ const k=bandOf(x); return [c[k].tail,c[k].cross]; }; }
/* resuelve el disparo hacia un punto (u,e en mil) a distancia oblicua R; devuelve impacto relativo a la línea de mira */
function shotFlight(o){ const rf=G.rf, env=G.env; const A=G.az+o.u*0.0572958; const incl=o.e/1000;
  const sh={alpha:G.a0+o.alpha/1000,beta:o.beta/1000,incl:incl,az:A*Math.PI/180,lat:G.st.lat*Math.PI/180,wind:o.nowind?null:windFn(A,o.t),cor:!o.nocor,mvAdj:o.mvAdj||0};
  return fly(rf,rf,env,sh,o.R,{spin:!o.nospin,track:o.track}); }
/* desglose exacto (lo que el debriefing y la computadora balística llaman «valores reales») */
function breakdown(R,u,e,t){ const base={R:R,u:u,e:e,t:t,alpha:0,beta:0};
  const g=shotFlight(Object.assign({},base,{nowind:true,nocor:true,nospin:true}));
  const w=shotFlight(Object.assign({},base,{nocor:true,nospin:true}));
  const s=shotFlight(Object.assign({},base,{nowind:true,nocor:true}));
  const c=shotFlight(Object.assign({},base,{nowind:true,nospin:true}));
  const k=1000/R; const drop=-g.y*k; const wind=w.z*k; const spin=(s.z-g.z)*k; const corH=(c.z-g.z)*k, corV=(c.y-g.y)*k;
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
const DAS=[-1500,0,1500,3000,4500];

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
 '.frmsg{position:absolute;left:50%;top:12px;transform:translateX(-50%);background:rgba(10,12,8,.82);border:1px solid #3a3f30;color:#f0f0e6;border-radius:999px;padding:6px 14px;font-size:14px;white-space:nowrap;pointer-events:none;max-width:94%;overflow:hidden;text-overflow:ellipsis}',
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
 '.frsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}',
 '.frsum div{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px;text-align:center}',
 '.frsum b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:28px}',
 '.frsum span{font-size:12px;color:#a8ad98;text-transform:uppercase;letter-spacing:.06em}'
 ].join('\n'); document.head.appendChild(s); }

/* ===== Textos: cómo funciona, fórmulas, validación ===== */
function howHTML(){ return '<details class="frdet"><summary>'+L('Cómo funciona la simulación','How the simulation works')+'</summary><div class="in">'+
 '<p>'+L('Cada disparo se calcula integrando paso a paso la trayectoria de la bala (modelo de masa puntual, Runge-Kutta de 4.º orden, paso de 2 ms) con su coeficiente balístico real sobre las tablas de arrastre G1 o G7 del Ballistic Research Laboratory. Nada es una animación precalculada: si cambias una torreta, el viento o el acimut, cambia el impacto.','Every shot is computed by integrating the bullet’s trajectory step by step (point-mass model, 4th-order Runge-Kutta, 2 ms step) with its real ballistic coefficient on the Ballistic Research Laboratory G1 or G7 drag tables. Nothing is a canned animation: change a turret, the wind or the azimuth and the impact changes.')+'</p>'+
 '<p><b>'+L('Qué se simula','What is simulated')+'</b>: '+L('gravedad (también en disparos en pendiente); arrastre según el número de Mach; densidad del aire a partir de presión, temperatura y humedad; velocidad del sonido según la temperatura; viento distinto en 3 tramos con rachas (Veterano); deriva por giro (fórmula de Litz con la estabilidad de Miller); Coriolis horizontal y vertical (efecto Eötvös) según latitud y acimut; paso por el régimen transónico, que añade dispersión; dispersión del fusil y variación de la velocidad en boca de cada cartucho.','gravity (including sloped shots); drag as a function of Mach number; air density from pressure, temperature and humidity; speed of sound from temperature; different wind in 3 zones with gusts (Veteran); spin drift (Litz formula with Miller stability); horizontal and vertical (Eötvös) Coriolis from latitude and azimuth; passage through the transonic regime, which adds dispersion; rifle dispersion and each cartridge’s muzzle-velocity spread.')+'</p>'+
 '<p><b>'+L('Un único puesto de tiro','A single firing position')+'</b>: '+L('no te mueves. Miras el campo a simple vista (banderas, placas e instrumentos) y, cuando quieres disparar, miras por el visor, arrastras para apuntar, giras las torretas (clics de 0,1 mil o 1/4 MOA) y aprietas el disparador.','you do not move. You look at the range with the naked eye (flags, plates and instruments) and, when you want to shoot, you look through the scope, drag to aim, dial the turrets (0.1 mil or 1/4 MOA clicks) and press the trigger.')+'</p>'+
 '<p><b>'+L('Fácil','Easy')+'</b>: '+L('mides tú (anemómetro y telémetro) y la computadora balística te da la solución exacta, desglosada: caída, viento, giro y Coriolis. El viento es igual en todo el recorrido y el observador te corrige si fallas. Placas a 300–800 m.','you measure (wind meter and rangefinder) and the ballistic computer gives you the exact solution, broken down: drop, wind, spin and Coriolis. The wind is the same along the whole path and the spotter corrects you if you miss. Plates at 300–800 m.')+'</p>'+
 '<p><b>'+L('Veterano','Veteran')+'</b>: '+L('no hay computadora. Tienes los instrumentos de verdad (anemómetro con altitud de densidad, telémetro láser, brújula y GPS), la tarjeta de datos del fusil con su tabla, un bloc con calculadora y las fórmulas. El viento lejano puede no ser el que mides: léelo en las banderas y el espejismo. 3 disparos por placa, 15 minutos. Placas a 600 m hasta el alcance del cartucho (.50 BMG a 2.000 m).','there is no computer. You have the real instruments (wind meter with density altitude, laser rangefinder, compass and GPS), the rifle’s data card with its table, a notepad with calculator and the formulas. The far wind may not be what you measure: read it from the flags and the mirage. 3 rounds per plate, 15 minutes. Plates from 600 m to the cartridge’s reach (.50 BMG to 2,000 m).')+'</p>'+
 '<p><b>'+L('Desafío','Challenge')+'</b>: '+L('reglas de Veterano con condiciones fijas por escenario y fusil, para comparar tu mejor puntuación (se guarda en este dispositivo). 12 minutos.','Veteran rules with fixed conditions per location and rifle, so you can compare your best score (saved on this device). 12 minutes.')+'</p>'+
 '<p><b>'+L('Estimación','Estimate')+'</b>: '+L('altura del visor, longitud de cada bala (solo para calcular la estabilidad), dispersión de cada fusil, variación de velocidad en boca, el modelo de dispersión transónica, las rachas, el alcance máximo del telémetro del juego (1.800 m), la regla de ponderación de tramos (0,45/0,38/0,17, sacada del propio simulador) y el visor genérico 5–25× de plano focal frontal son valores del juego, no datos publicados del fabricante.','scope height, each bullet’s length (only used to compute stability), each rifle’s dispersion, muzzle-velocity spread, the transonic dispersion model, the gusts, the game rangefinder’s maximum range (1,800 m), the zone-weighting rule (0.45/0.38/0.17, taken from the simulator itself) and the generic 5–25× first-focal-plane scope are game values, not published manufacturer data.')+EST()+'</p>'+
 '<p><b>'+L('Fuentes','Sources')+'</b>: R. L. McCoy, <i>Modern Exterior Ballistics</i> (Schiffer, 1999); B. Litz, <i>Applied Ballistics for Long-Range Shooting</i> (3.ª ed., 2015) '+L('y su análisis WEZ del XM2010 (2012)','and his XM2010 WEZ analysis (2012)')+'; D. Miller, '+L('regla de estabilidad','stability rule')+' (<i>Precision Shooting</i>, 2005); '+L('tablas G1/G7 del BRL tal como las publica','BRL G1/G7 tables as published by')+' py-ballisticcalc (LGPL); '+L('atmósfera estándar ICAO; presión de vapor de Buck (1981)','ICAO standard atmosphere; Buck (1981) vapour pressure')+'; '+L('coeficientes y velocidades de Hornady (hornady.com/bc), Lapua (cartucho 4318013) y Sierra/Litz; paso de estriado de Sako, Barrett y Wikipedia; lectura de banderas y espejismo del manual del Ejército de EE. UU. FM 23-10','coefficients and velocities from Hornady (hornady.com/bc), Lapua (cartridge 4318013) and Sierra/Litz; twist rates from Sako, Barrett and Wikipedia; flag and mirage reading from the U.S. Army manual FM 23-10')+' (<i>Sniper Training</i>, 1994).</p>'+
 '</div></details>'; }
function formulasHTML(open){ const f=(s)=>'<code class="frf">'+s+'</code>';
 return '<details class="frdet"'+(open?' open':'')+'><summary>'+L('Fórmulas (para calcularlo a mano)','Formulas (to work it out by hand)')+'</summary><div class="in">'+
 '<p><b>1. '+L('Densidad del aire y altitud de densidad','Air density and density altitude')+'</b></p>'+f('ρ = (p − pv)/(287,058·T) + pv/(461,495·T)   [p, pv en Pa; T en K]\npv = HR/100 · 611,21·e^((18,678 − t/234,5)·t/(257,14 + t))   [t en °C]\nDA = (1 − (ρ/1,225)^(1/4,2559)) / 2,25577·10⁻⁵   [m]')+
 '<p>'+L('El anemómetro ya te da la altitud de densidad (DA). La tarjeta trae la tabla para DA −1.500, 0, 1.500 y 3.000 m: interpola entre las dos columnas que rodean tu DA.','The wind meter already gives you density altitude (DA). The card has the table for DA −1,500, 0, 1,500 and 3,000 m: interpolate between the two columns around your DA.')+'</p>'+
 '<p><b>2. '+L('Caída (alza)','Drop (elevation)')+'</b></p>'+f(L('Alza = tabla(DA, D·cos θ)   ← regla del fusilero: en pendiente usa la distancia horizontal','Elevation = table(DA, D·cos θ)   ← rifleman’s rule: on a slope use the horizontal distance'))+
 '<p><b>3. '+L('Viento (método del retardo de Didion, Litz)','Wind (Didion lag-time method, Litz)')+'</b></p>'+f(L('deriva (m) = Wc · (t − D/V0)        en mil: deriva/D·1000\nWc = W · sen(dirección de donde viene − acimut de tiro)\n   (+ viene de la derecha y empuja a la IZQUIERDA)\nTramos (tercios de la distancia): Wef ≈ 0,45·W1 + 0,38·W2 + 0,17·W3\nBandera: ángulo con el mástil (°) / 4 = viento cruzado en mph; 1 mph = 0,447 m/s','drift (m) = Wc · (t − D/V0)        in mil: drift/D·1000\nWc = W · sin(direction it blows from − firing azimuth)\n   (+ comes from the right and pushes LEFT)\nZones (thirds of the distance): Weff ≈ 0.45·W1 + 0.38·W2 + 0.17·W3\nFlag: angle from the pole (°) / 4 = crosswind in mph; 1 mph = 0.447 m/s'))+
 '<p>'+L('La columna «Viento 1 m/s» de la tarjeta ya es (t − D/V0)/D·1000 para 1 m/s: multiplícala por tu viento cruzado efectivo.','The card’s “Wind 1 m/s” column is already (t − D/V0)/D·1000 for 1 m/s: multiply it by your effective crosswind.')+'</p>'+
 '<p><b>4. '+L('Deriva por giro (aproximación de Litz)','Spin drift (Litz approximation)')+'</b></p>'+f(L('SD (pulgadas) = 1,25 · (Sg + 1,2) · t^1,83     → a la DERECHA (estriado dextrógiro)\nSg (Miller) = 30·m / (tw²·d³·l·(1+l²)) · (V/2800)^(1/3) · ((T°F+460)/519) · (29,92/P inHg)\n   m en grains; d en pulgadas; tw y l en calibres','SD (inches) = 1.25 · (Sg + 1.2) · t^1.83     → to the RIGHT (right-hand twist)\nSg (Miller) = 30·m / (tw²·d³·l·(1+l²)) · (V/2800)^(1/3) · ((T°F+460)/519) · (29.92/P inHg)\n   m in grains; d in inches; tw and l in calibres'))+
 '<p><b>5. Coriolis</b></p>'+f(L('ω = 7,292·10⁻⁵ rad/s     φ = latitud     A = acimut de tiro\nHorizontal:  Z = ω·D·t·sen φ           → en mil: 1000·ω·t·sen φ (a la derecha en el hemisferio norte)\nVertical (Eötvös):  Y = ω·D·t·cos φ·sen A  → en mil: 1000·ω·t·cos φ·sen A (sube tirando al ESTE, baja al OESTE)','ω = 7.292·10⁻⁵ rad/s     φ = latitude     A = firing azimuth\nHorizontal:  Z = ω·D·t·sin φ           → in mil: 1000·ω·t·sin φ (to the right in the northern hemisphere)\nVertical (Eötvös):  Y = ω·D·t·cos φ·sin A  → in mil: 1000·ω·t·cos φ·sin A (up shooting EAST, down shooting WEST)'))+
 '<p><b>6. '+L('Medir la distancia con la retícula','Ranging with the reticle')+'</b></p>'+f(L('D (m) = tamaño (m) · 1000 / tamaño medido (mil)','D (m) = size (m) · 1000 / measured size (mil)'))+
 '<p><b>7. '+L('Solución','Solution')+'</b></p>'+f(L('ALZA   = caída − Eötvös\nDERIVA = −(viento + giro + Coriolis horizontal)     (− = a la izquierda)\n1 mil = 3,438 MOA = 10 cm a 100 m','ELEVATION = drop − Eötvös\nWINDAGE   = −(wind + spin + horizontal Coriolis)     (− = left)\n1 mil = 3.438 MOA = 10 cm at 100 m'))+
 '<p>'+L('Sin contener la respiración el disparo dispersa algo más; si la contienes más de 6 s el visor empieza a temblar.','Without holding your breath the shot spreads a little more; hold it longer than 6 s and the scope starts to shake.')+EST()+'</p>'+
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
function intro(){ stopLoop(); const rf=rifleOf(CFG.rifle), st=stageOf(CFG.stage); const B=bests();
 const opt=(on,attr,b,s)=>'<button type="button" class="fropt'+(on?' on':'')+'" '+attr+'><b>'+b+'</b><span>'+s+'</span></button>';
 let h='<div class="frw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],['Francotirador']])+
 '<div class="frhero"><img src="img/juegos/francotirador.webp" width="640" height="400" alt="'+esc(L('Tirador con un Barrett M107 en un campo de tiro de Yibuti','Marksman with a Barrett M107 on a range in Djibouti'))+'"><div class="ht"><b>'+L('FRANCOTIRADOR','SNIPER')+'</b><span>'+L('Placas de acero de 300 a 2.000 m. Mide la distancia, lee el viento y gira las torretas: la bala sigue la física de verdad, incluida la rotación de la Tierra.','Steel plates from 300 to 2,000 m. Range it, read the wind and dial the turrets: the bullet follows real physics, including the Earth’s rotation.')+'</span></div></div>';
 h+='<div class="frsec">'+L('Modo','Mode')+'</div><div class="frgrid c3">'+
  opt(CFG.mode==='facil','data-m="facil"',L('Fácil','Easy'),L('Mides tú y la computadora balística te da la solución desglosada. 300–800 m.','You measure and the ballistic computer gives you the broken-down solution. 300–800 m.'))+
  opt(CFG.mode==='veterano','data-m="veterano"',L('Veterano','Veteran'),L('Sin computadora: instrumentos, tarjeta, fórmulas y tu cabeza. Coriolis, giro y densidad los calculas tú. 600–2.000 m.','No computer: instruments, data card, formulas and your head. You work out Coriolis, spin and density. 600–2,000 m.'))+
  opt(CFG.mode==='desafio','data-m="desafio"',L('Desafío','Challenge'),L('Reglas de Veterano con condiciones fijas para batir tu récord.','Veteran rules with fixed conditions to beat your record.'))+'</div>';
 h+='<div class="frsec">'+L('Fusil y cartucho','Rifle and cartridge')+'</div><div class="frgrid c2">'+RIFLES.map(r=>opt(CFG.rifle===r.id,'data-r="'+r.id+'"',esc(r.n)+' · '+esc(L(r.cal[0],r.cal[1])),esc(L(r.bul[0],r.bul[1]))+' · BC '+r.model+' '+nf(r.bc,3)+' · V0 '+r.mv+' m/s · '+L('hasta','to')+' '+ni(r.maxV)+' m')).join('')+'</div>';
 h+='<p style="font-size:13.5px;color:#bfc2b8;margin:6px 2px">'+L('Ficha del fusil','Rifle entry')+': <a href="#/a/'+rf.ficha+'">'+esc(rf.n)+'</a></p>';
 h+='<div class="frsec">'+L('Escenario','Location')+'</div><div class="frgrid c2">'+STAGES.map(s=>{ const k=CFG.mode+'|'+s.id+'|'+CFG.rifle; const b=B[k]; return opt(CFG.stage===s.id,'data-s="'+s.id+'"',esc(L(s.n[0],s.n[1])),esc(L(s.d[0],s.d[1]))+' · '+L('latitud','latitude')+' '+nf(s.lat,1)+'°'+(b?' · '+L('récord','best')+' '+b:'')); }).join('')+'</div>';
 h+='<div class="frrow"><span style="color:#bfc2b8">'+L('Unidades del visor','Scope units')+'</span><span class="frseg"><button type="button" data-u="mil" class="'+(CFG.unit==='mil'?'on':'')+'">MIL</button><button type="button" data-u="moa" class="'+(CFG.unit==='moa'?'on':'')+'">MOA</button></span></div>';
 h+='<div class="frrow"><button type="button" class="frbtn" id="frgo">'+L('Ir al puesto de tiro','Go to the firing position')+'</button></div>';
 h+='<p style="font-size:13.5px;color:#bfc2b8">'+L('Solo placas y gongs de acero en un campo de tiro. Sin personas.','Steel plates and gongs on a range only. No people.')+'</p>';
 h+=howHTML()+formulasHTML(false)+validHTML()+'</div>';
 X.set(h,'Francotirador');
 const root=APP;
 root.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{ CFG.mode=b.getAttribute('data-m'); saveCfg(); intro(); });
 root.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ CFG.rifle=b.getAttribute('data-r'); saveCfg(); intro(); });
 root.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ CFG.stage=b.getAttribute('data-s'); saveCfg(); intro(); });
 root.querySelectorAll('[data-u]').forEach(b=>b.onclick=()=>{ CFG.unit=b.getAttribute('data-u'); saveCfg(); intro(); });
 const go=document.getElementById('frgo'); if(go) go.onclick=()=>{ newGame(); game(); window.scrollTo(0,0); };
}

/* ===== Dibujo del mundo ===== */
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
function PZ(P,d,Z){ if(P.scope) return PY(P,eOf(Z,d)); return P.Y0+P.H*0.085*Math.pow(1000/Math.max(d,5),0.62)-(Z)*1000/Math.max(d,5)*P.s*2.2; }
function renderWorld(c,P){ const st=G.st, W=P.W, H=P.H;
  const sky=c.createLinearGradient(0,0,0,PY(P,0)); sky.addColorStop(0,st.sky[0]); sky.addColorStop(1,st.sky[1]); c.fillStyle=sky; c.fillRect(0,0,W,H);
  const step=P.scope?4:5; const uL=P.cu-(P.cx+8)/P.s, uR=P.cu+(W-P.cx+8)/P.s;
  /* cordillera lejana */
  const far=hex2rgb(st.far), hz=hex2rgb(st.hz), mid=hex2rgb(st.mid), near=hex2rgb(st.near);
  c.beginPath(); c.moveTo(-5,H+5); for(let x=-5;x<=W+5;x+=step*2){ const u=P.cu+(x-P.cx)/P.s; c.lineTo(x,PY(P,farRidge(st,u)*(P.scope?1:0.5))); } c.lineTo(W+5,H+5); c.closePath(); c.fillStyle=rgb(mix(far,hz,0.45)); c.fill();
  if(st.ter==='montana'||st.ter==='artico'){ c.save(); c.clip(); c.beginPath(); for(let x=-5;x<=W+5;x+=step*2){ const u=P.cu+(x-P.cx)/P.s; const e=farRidge(st,u)*(P.scope?1:0.5); const y=PY(P,e); const y2=PY(P,e*0.78); if(x===-5) c.moveTo(x,y2); c.lineTo(x,y2); } c.lineTo(W+5,-5); c.lineTo(-5,-5); c.closePath(); c.fillStyle='rgba(245,248,252,.75)'; c.fill(); c.restore(); }
  /* objetos ordenados por distancia (de lejos a cerca) */
  const objs=[]; G.targets.forEach(t=>objs.push({d:t.d+9,k:'berm',t:t},{d:t.d,k:'plate',t:t})); G.flags.forEach(f=>objs.push({d:f.d,k:'flag',f:f})); objs.sort((a,b)=>b.d-a.d); let oi=0;
  for(let k=0;k<NB;k++){ const d=BANDS[k];
    while(oi<objs.length && objs[oi].d>=d){ drawObj(c,P,objs[oi]); oi++; }
    const lt=Math.log(d/6)/Math.log(2000); let col; if(d>1500) col=mix(mix(mid,far,0.35),hz,clamp((d-1500)/9000,0,0.75)); else col=mix(near,mid,clamp(Math.log(d/40)/Math.log(1500/40),0,1));
    const kk=0.94+0.1*hash(k,7)+(st.ter==='artico'?0.02:0);
    c.beginPath(); c.moveTo(-5,H+5); let first=true;
    for(let x=-5;x<=W+5;x+=step){ const u=P.cu+(x-P.cx)/P.s; const y=PZ(P,d,terrain(st,d,u)); c.lineTo(x,y); }
    c.lineTo(W+5,H+5); c.closePath(); c.fillStyle=rgb(col,kk); c.fill();
    /* detalle: matas/piedras (solo en el visor o cerca) */
    if(P.scope&&d>110&&d<2200){ const sp=1.6/d*1000; const j0=Math.floor(uL/sp), j1=Math.ceil(uR/sp); if(j1-j0<220){ c.strokeStyle=st.ter==='artico'?'rgba(150,165,180,.45)':(st.ter==='desierto'?'rgba(120,90,55,.4)':'rgba(40,52,25,.5)'); c.lineWidth=1; c.beginPath();
        for(let j=j0;j<=j1;j++){ const hh=hash(j,k*31+3); if(hh<0.4) continue; const u=(j+hash(j,k))*sp; const x=PX(P,u); const y=PZ(P,d,terrain(st,d,u)); const ln=Math.min(14,Math.max(1.5,(0.12+0.25*hh)/d*1000*P.s)); c.moveTo(x,y); c.lineTo(x+(hh-0.7)*ln*0.6,y-ln); c.moveTo(x+2,y); c.lineTo(x+2+(0.5-hh)*ln*0.5,y-ln*0.8); }
        c.stroke(); } }
  }
  while(oi<objs.length){ drawObj(c,P,objs[oi]); oi++; }
}
function drawObj(c,P,o){ if(o.k==='flag') return; const t=o.t; const st=G.st;
  if(o.k==='berm'){ const d=t.d+9; const x=PX(P,t.u); const yg=PZ(P,d,t.gy); const wpx=Math.max(P.scope?3:6,t.w*4.5/d*1000*P.s*(P.scope?1:2.2)); const hpx=Math.max(P.scope?2:3,(t.post+t.h*1.6)/d*1000*P.s*(P.scope?1:2.2));
    c.beginPath(); c.ellipse(x,yg,wpx/2,hpx,0,Math.PI,2*Math.PI); c.fillStyle=st.ter==='artico'?'#c9d3dc':(st.ter==='desierto'?'#b58a57':'#7a6a48'); c.fill(); return; }
  const d=t.d; const x=PX(P,t.u); const yg=PZ(P,d,t.gy); const yc=P.scope?PY(P,t.e):Math.min(yg-5,PZ(P,d,t.zc));
  const sx=t.w/d*1000*P.s*(P.scope?1:2.2), sy=t.h/d*1000*P.s*(P.scope?1:2.2); const pano=!P.scope;
  if(pano){ const w=Math.max(4,sx), h=Math.max(4,sy); c.fillStyle='#3b3a34'; c.fillRect(x-0.6,yc,1.2,yg-yc); c.fillStyle=t.res==='hit'?'#e6f3b0':'#f2f2ec'; c.fillRect(x-w/2,yc-h/2,w,h);
    return; }
  /* poste y patas */
  c.strokeStyle='#2f2b25'; c.lineWidth=Math.max(1,0.08/d*1000*P.s); c.beginPath(); c.moveTo(x-sx*0.25,yg); c.lineTo(x,yc); c.lineTo(x+sx*0.25,yg); c.stroke();
  let sq=1; if(G.anim&&G.anim.swing&&G.anim.t===t){ const a=(performance.now()-G.anim.swing)/1000; if(a<1.6) sq=Math.cos(a*9)*Math.exp(-a*1.8)*0.6+0.4*Math.cos(a*9*0.5+0.3)*Math.exp(-a*2)+ (1-Math.exp(-a*2))*1; sq=clamp(Math.abs(sq),0.15,1); }
  c.save(); c.translate(x,yc); c.scale(sq,1);
  c.fillStyle='#ecebe4'; c.strokeStyle='#5c5a52'; c.lineWidth=Math.max(0.6,sx*0.03);
  if(t.shape==='gong'){ c.beginPath(); c.arc(0,0,sx/2,0,2*Math.PI); c.fill(); c.stroke(); }
  else { c.fillRect(-sx/2,-sy/2,sx,sy); c.strokeRect(-sx/2,-sy/2,sx,sy); }
  t.hits.forEach(hm=>{ c.fillStyle='rgba(70,70,64,.85)'; const rr_=Math.max(1,0.03/d*1000*P.s); c.beginPath(); c.arc(hm[0]/d*1000*P.s,-hm[1]/d*1000*P.s,rr_,0,2*Math.PI); c.fill(); });
  c.restore();
}
function flagGeom(f,tm){ const w=windAt(tm,f.band); const cr=comps(w,G.az).cross; const mph=Math.abs(cr)/0.44704; const th=clamp(4*mph,4,86); return {th:th,side:cr>=0?1:-1,cross:cr,s:w.s}; }
function drawFlags(c,P,tm){ G.flags.forEach((f,i)=>{ const d=f.d; const x=PX(P,f.u); if(x<-60||x>P.W+60) return; const yg=PZ(P,d,f.gy);
   const k=P.scope?1/d*1000*P.s:Math.max(1000/d*P.s*2.2, 5); const pole=4*k; const top=yg-pole;
   c.strokeStyle='#d9d6cc'; c.lineWidth=Math.max(1,0.08*k); c.beginPath(); c.moveTo(x,yg); c.lineTo(x,top); c.stroke();
   const g=flagGeom(f,tm); const th=g.th*Math.PI/180; const L_=1.6*k, Wd=0.9*k; const dx=Math.sin(th)*g.side, dy=Math.cos(th);
   const hA=Wd*Math.sin(th)+0.12*k; const ex=-dy, ey=dx; c.beginPath(); const n=8; const amp=Wd*0.12*Math.min(1,g.s/4+0.2);
   for(let j=0;j<=n;j++){ const s=j/n; const wv=Math.sin(s*5-tm*(6+g.s*1.5))*amp*s; c.lineTo(x+dx*L_*s+ex*wv, top+dy*L_*s+ey*wv); }
   for(let j=n;j>=0;j--){ const s=j/n; const wv=Math.sin(s*5-tm*(6+g.s*1.5)+0.5)*amp*s; c.lineTo(x+dx*L_*s+ex*wv, top+hA+dy*L_*s+ey*wv); }
   c.closePath(); c.fillStyle=i===0?'#e0472f':(i===1?'#f0a020':'#e0472f'); c.fill();
   if(!P.scope){ c.fillStyle='rgba(0,0,0,.55)'; c.font='600 11px system-ui,sans-serif'; c.fillText(L('B','F')+(i+1),x+3,yg+12); }
 }); }

function recoilOff(){ if(!G.anim||!G.anim.fired) return 0; const a=(performance.now()-G.anim.fired)/1000; const m=G.rf.gr>500?7:(G.rf.gr>250?4:2.5); return a<0.9?m*Math.exp(-a*7)*Math.cos(a*14):0; }
function drawReticle(c,P){ const cx=P.cx, cy=P.cy, s=P.s, R=P.r; const moa=CFG.unit==='moa'; const u=moa?1/MOA_PER_MIL:1; /* paso en mil */
  c.save(); c.beginPath(); c.arc(cx,cy,R,0,2*Math.PI); c.clip();
  c.strokeStyle='rgba(8,8,8,.92)'; c.fillStyle='rgba(8,8,8,.92)'; c.lineWidth=1.1;
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
  c.fillStyle='#ff3b2f'; c.beginPath(); c.arc(cx,cy,Math.max(1.6,Math.min(3,s*0.05)),0,2*Math.PI); c.fill();
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
  const P=viewParams(W,H); const key=[G.view,P.cu.toFixed(3),P.ce.toFixed(3),P.s.toFixed(4),W,H,G.hitVer||0].join('|'); const swinging=G.anim&&G.anim.swing&&performance.now()-G.anim.swing<1700;
  if(!CACHE||CACHE.key!==key||swinging){ if(!CACHE) CACHE={cv:document.createElement('canvas')}; const cc=CACHE.cv; cc.width=CV.width; cc.height=CV.height; const x=cc.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); renderWorld(x,P); CACHE.key=swinging?'':key; }
  c.setTransform(1,0,0,1,0,0); c.drawImage(CACHE.cv,0,0); c.setTransform(dpr,0,0,dpr,0,0);
  drawFlags(c,P,tm);
  if(P.scope){ drawMirage(c,P,tm); drawTrace(c,P);
    c.save(); c.fillStyle='#000'; c.beginPath(); c.rect(0,0,W,H); c.arc(P.cx,P.cy,P.r,0,2*Math.PI,true); c.fill('evenodd'); c.restore();
    const vg=c.createRadialGradient(P.cx,P.cy,P.r*0.72,P.cx,P.cy,P.r); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.78)'); c.fillStyle=vg; c.beginPath(); c.arc(P.cx,P.cy,P.r,0,2*Math.PI); c.fill();
    drawReticle(c,P);
    c.fillStyle='rgba(230,235,220,.9)'; c.font='600 12px system-ui,sans-serif'; c.textAlign='left'; c.fillText(G.zoom+'×',10,18); c.textAlign='right'; c.fillText(CFG.unit==='moa'?'MOA':'MIL',W-10,18);
    if(G.breath){ const hb=(performance.now()-G.breath)/1000; c.textAlign='center'; c.fillStyle=hb>6?'#ffb08a':'#d8f0a0'; c.fillText(L('Respiración contenida ','Breath held ')+nf(hb,1)+' s',W/2,H-12); }
  } else { drawPanoMarks(c,P); }
}
function updShake(tm){ if(G.breath){ const hb=(performance.now()-G.breath)/1000; if(hb>12){ G.breath=0; msg(L('Has soltado el aire','You let your breath go')); }
   const a=hb>6?Math.min(0.5,(hb-6)*0.09):0; G.shake.x=a*(Math.sin(tm*7.3)+0.6*Math.sin(tm*12.9+1)); G.shake.y=a*(Math.cos(tm*6.1)+0.5*Math.sin(tm*10.7)); }
  else { G.shake.x=0; G.shake.y=0; } }
function loop(){ RAF=0; if(!CV||!document.body.contains(CV)){ CV=null; return; } draw(); RAF=requestAnimationFrame(loop); }
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF=0; CV=null; if(G&&G.timer){ clearInterval(G.timer); G.timer=0; } }
let MSGT=0; function msg(t,cls){ const m=document.getElementById('frmsg'); if(!m) return; m.textContent=t; m.className='frmsg'+(cls?' '+cls:''); m.hidden=false; clearTimeout(MSGT); MSGT=setTimeout(()=>{ m.hidden=true; },cls?3200:2400); }

/* ===== Pantalla de juego ===== */
const U=()=>CFG.unit==='moa'; const CLICK=()=>U()?0.25/MOA_PER_MIL:0.1; /* un clic en mil */
function fmtAng(mil,signs){ const v=U()?mil*MOA_PER_MIL:mil; return nf(Math.abs(v),U()?2:1)+' '+(U()?'MOA':'mil'); }
function fmtE(mil){ return (mil>=0?L('Arriba ','Up '):L('Abajo ','Down '))+fmtAng(mil); }
function fmtW(mil){ return Math.abs(mil)<0.005?'0':((mil>=0?L('D ','R '):L('I ','L '))+fmtAng(mil)); }
function game(){ stopLoop(); const rf=G.rf, st=G.st;
 let h='<div class="frw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],['Francotirador','#/francotirador'],[L(MODES[G.mode].n[0],MODES[G.mode].n[1])]])+
  '<div class="frtop"><span><b>'+esc(rf.n)+'</b> · '+esc(L(rf.cal[0],rf.cal[1]))+' · '+esc(L(st.n[0],st.n[1]))+'</span><span id="frstat"></span><button type="button" class="frbtn sec sm" id="frquit">'+L('Salir','Quit')+'</button></div>'+
  '<div class="frg"><div><div class="frview" id="frview"><canvas id="frc" aria-label="'+L('Vista del campo de tiro','Range view')+'"></canvas><div class="frmsg" id="frmsg" hidden></div><div class="frhint" id="frhint"></div></div></div>'+
  '<div class="frside" id="frside"></div></div></div>';
 X.set(h,'Francotirador');
 CV=document.getElementById('frc'); CTX=CV.getContext('2d'); CACHE=null;
 document.getElementById('frquit').onclick=()=>{ closeSheet(); stopLoop(); intro(); window.scrollTo(0,0); };
 bindView(); side(); status();
 G.timer=setInterval(()=>{ if(!document.getElementById('frstat')){ clearInterval(G.timer); return; } status(); if(G.timeLimit&&timeLeft()<=0&&!G.over){ endGame(L('Se acabó el tiempo','Time is up')); } },500);
 RAF=requestAnimationFrame(loop);
 msg(G.mode==='facil'?L('Mide con el telémetro y el anemómetro, y pide la solución','Use the rangefinder and the wind meter, then get the solution'):L('Mide, calcula y dispara. Toca una placa para elegirla','Measure, compute and fire. Tap a plate to pick it'));
}
function status(){ const s=document.getElementById('frstat'); if(!s) return; const t=G.targets[G.cur]; const tl=timeLeft();
 s.innerHTML='P'+(G.cur+1)+'/'+G.targets.length+' · '+L('disparos','rounds')+' '+(G.rounds-t.shots)+' · '+L('puntos','score')+' <b>'+G.score+'</b>'+(isFinite(tl)?' · '+Math.floor(tl/60)+':'+String(Math.floor(tl%60)).padStart(2,'0'):''); }
function chipsHTML(){ return '<div class="frchips">'+G.targets.map((t,i)=>'<button type="button" class="frchip'+(i===G.cur?' on':'')+(t.res==='hit'?' ok':(t.res==='miss'?' ko':''))+'" data-t="'+i+'">P'+(i+1)+' · '+(t.shape==='gong'?L('gong','gong'):L('placa','plate'))+' '+Math.round(t.w*100)+(t.shape==='gong'?' cm':'×'+Math.round(t.h*100)+' cm')+(t.res==='hit'?' · '+L('tocada','hit'):(t.res==='miss'?' · '+L('fallada','missed'):''))+'</button>').join('')+'</div>'; }
function toolsHTML(){ const T_=[['kestrel',L('Anemómetro','Wind meter')],['lrf',L('Telémetro','Rangefinder')],['comp',L('Brújula y GPS','Compass & GPS')],['card',L('Tarjeta','Data card')],['notes',L('Notas y calculadora','Notes & calculator')]];
 if(G.mode==='facil') T_.push(['pc',L('Computadora balística','Ballistic computer')]); else T_.push(['flags',L('Prismáticos: banderas','Binoculars: flags')]);
 T_.push(['form',L('Fórmulas','Formulas')]);
 return '<div class="frtools">'+T_.map(t=>'<button type="button" data-tool="'+t[0]+'"'+(t[0]==='pc'?' class="hl"':'')+'>'+t[1]+'</button>').join('')+'</div>'; }
function side(){ const sd=document.getElementById('frside'); if(!sd) return; const t=G.targets[G.cur]; const hint=document.getElementById('frhint');
 if(G.view==='pano'){
  sd.innerHTML='<div class="frrow" style="margin:0"><button type="button" class="frbtn" id="frtog" style="flex:1">'+L('Mirar por la mira','Look through the scope')+'</button></div>'+
   '<div class="frpanel"><h4>'+L('Placas','Plates')+'</h4>'+chipsHTML()+'</div><div class="frpanel"><h4>'+L('Instrumentos','Instruments')+'</h4>'+toolsHTML()+'</div>';
  if(hint) hint.textContent=L('Arrastra para mirar alrededor · toca una placa o una bandera','Drag to look around · tap a plate or a flag');
 } else {
  sd.innerHTML='<div class="frrow" style="margin:0;display:grid;grid-template-columns:1fr 1fr 1.3fr;gap:6px"><button type="button" class="frbtn sec" id="frtog">'+L('Quitar la mira','Leave the scope')+'</button><button type="button" class="frbtn sec'+(G.breath?' on':'')+'" id="frbr">'+(G.breath?L('Soltar aire','Breathe out'):L('Contener aire','Hold breath'))+'</button><button type="button" class="frbtn fire" id="frfire"'+(G.busy||G.over||t.res==='hit'||t.shots>=G.rounds?' disabled':'')+'>'+L('DISPARAR','FIRE')+'</button></div>'+
   '<div class="frpanel"><h4>'+L('Torretas','Turrets')+' ('+(U()?L('clic 1/4 MOA','click 1/4 MOA'):L('clic 0,1 mil','click 0.1 mil'))+')</h4>'+
   '<div class="frtur"><div class="bt"><button type="button" data-d="e" data-v="-10">−'+(U()?'2,5':'1')+'</button><button type="button" data-d="e" data-v="-1">−</button></div><div class="val" id="frve"><small>'+L('Elevación','Elevation')+'</small>'+fmtE(G.dialE)+'</div><div class="bt"><button type="button" data-d="e" data-v="1">+</button><button type="button" data-d="e" data-v="10">+'+(U()?'2,5':'1')+'</button></div></div>'+
   '<div class="frtur"><div class="bt"><button type="button" data-d="w" data-v="-10">'+L('I','L')+(U()?'2,5':'1')+'</button><button type="button" data-d="w" data-v="-1">'+L('I','L')+'</button></div><div class="val" id="frvw"><small>'+L('Deriva','Windage')+'</small>'+fmtW(G.dialW)+'</div><div class="bt"><button type="button" data-d="w" data-v="1">'+L('D','R')+'</button><button type="button" data-d="w" data-v="10">'+L('D','R')+(U()?'2,5':'1')+'</button></div></div>'+
   '<div class="frtur"><div class="bt"><button type="button" data-z="-1">−</button></div><div class="val"><small>'+L('Aumentos','Magnification')+'</small>'+G.zoom+'×</div><div class="bt"><button type="button" data-z="1">+</button></div></div>'+
   '<div class="frrow" style="margin:6px 0 0"><button type="button" class="frbtn sec sm" id="frctr">'+L('Centrar en P','Center on P')+(G.cur+1)+'</button><button type="button" class="frbtn sec sm" id="fr0">'+L('Torretas a cero','Zero turrets')+'</button></div></div>'+
   '<div class="frpanel"><h4>'+L('Placa','Plate')+'</h4>'+chipsHTML()+'</div><div class="frpanel"><h4>'+L('Instrumentos','Instruments')+'</h4>'+toolsHTML()+'</div>';
  if(hint) hint.textContent=L('Arrastra para apuntar · sujeción con la retícula o torretas','Drag to aim · hold with the reticle or dial');
 }
 const q=id=>document.getElementById(id);
 q('frtog').onclick=()=>{ G.view=G.view==='pano'?'scope':'pano'; if(G.view==='scope'){ const t=G.targets[G.cur]; if(!G.aimSet){ G.aim={u:t.u,e:t.e}; G.aimSet=true; } } else { G.breath=0; G.pano.u=clamp(G.aim.u,-200,200); } CACHE=null; side(); };
 sd.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ selTarget(+b.getAttribute('data-t'),true); });
 sd.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>tool(b.getAttribute('data-tool')));
 if(G.view==='scope'){
  sd.querySelectorAll('[data-d]').forEach(b=>{ const f=()=>{ const v=+b.getAttribute('data-v')*CLICK(); if(b.getAttribute('data-d')==='e') G.dialE=Math.round((G.dialE+v)/CLICK())*CLICK(); else G.dialW=Math.round((G.dialW+v)/CLICK())*CLICK(); G.dialE=clamp(G.dialE,-5,40); G.dialW=clamp(G.dialW,-12,12); q('frve').innerHTML='<small>'+L('Elevación','Elevation')+'</small>'+fmtE(G.dialE); q('frvw').innerHTML='<small>'+L('Deriva','Windage')+'</small>'+fmtW(G.dialW); };
    let rep=0,del=0; b.addEventListener('pointerdown',e=>{ e.preventDefault(); f(); del=setTimeout(()=>{ rep=setInterval(f,70); },420); });
    const stop=()=>{ clearTimeout(del); clearInterval(rep); }; b.addEventListener('pointerup',stop); b.addEventListener('pointerleave',stop); b.addEventListener('pointercancel',stop); });
  sd.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>{ zoomStep(+b.getAttribute('data-z')); side(); });
  q('frctr').onclick=()=>{ const t=G.targets[G.cur]; G.aim={u:t.u,e:t.e}; };
  q('fr0').onclick=()=>{ G.dialE=0; G.dialW=0; side(); };
  q('frbr').onclick=()=>{ G.breath=G.breath?0:performance.now(); side(); };
  q('frfire').onclick=()=>fire();
 }
}
function selTarget(i,center){ if(G.over) return; G.cur=i; if(center){ const t=G.targets[i]; if(G.view==='scope') G.aim={u:t.u,e:t.e}; else G.pano.u=clamp(t.u,-200,200); G.aimSet=true; G.aim={u:t.u,e:t.e}; } side(); status(); }
function bindView(){ const v=CV; let down=null, moved=0;
 v.addEventListener('pointerdown',e=>{ down={x:e.clientX,y:e.clientY}; moved=0; v.setPointerCapture(e.pointerId); });
 v.addEventListener('pointermove',e=>{ if(!down) return; const dx=e.clientX-down.x, dy=e.clientY-down.y; moved+=Math.abs(dx)+Math.abs(dy); down={x:e.clientX,y:e.clientY};
   const P=viewParams(v.clientWidth,v.clientHeight); if(G.view==='scope'){ G.aim.u=clamp(G.aim.u-dx/P.s,-320,320); G.aim.e=clamp(G.aim.e+dy/P.s,-120,80); } else { G.pano.u=clamp(G.pano.u-dx/P.s,-260,260); } });
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
function aimedTarget(u,e){ let best=null,bd=1e9; G.targets.forEach(t=>{ const half=Math.max(t.w,t.h)/t.d*1000/2; const da=Math.hypot(t.u-u,t.e-e); if(da<=Math.max(half*1.6,1.2)&&da<bd){ bd=da; best=t; } }); return best; }
function lase(){ let t=null; if(G.view==='scope') t=aimedTarget(G.aim.u,G.aim.e); else t=G.targets[G.cur];
 const lim=G.mode==='facil'?3000:1800;
 if(!t){ const d=G.view==='scope'?raycast(G.aim.u,G.aim.e):0; if(!d) return {none:true}; const R=Math.hypot(d,terrain(G.st,d,G.aim.u)-EYE); if(R>lim) return {far:true}; return {R:Math.round(R),ang:Math.atan2(terrain(G.st,d,G.aim.u)-EYE,d)*180/Math.PI,az:(G.az+G.aim.u*0.0572958+360)%360,ground:true}; }
 if(t.R>lim) return {far:true,i:t.i};
 const R=Math.round(t.R+(G.mode==='facil'?0:Math.round(gauss()*0.7)));
 const r={i:t.i,R:R,ang:t.e*0.0572958,az:(G.az+t.u*0.0572958+360)%360}; t.lased=R; G.readL=r; if(t.i!==G.cur) selTarget(t.i,false); return r; }
function heading(){ const u=G.view==='scope'?G.aim.u:G.pano.u; return (G.az+u*0.0572958+360)%360; }
function tool(k,arg){ const rf=G.rf;
 if(k==='kestrel'){ const show=()=>{ const r=G.readK; return '<div class="frdev"><div class="frlcd">'+(r?
    '<div class="r"><span>'+L('Temperatura','Temperature')+'</span><b>'+nf(r.T,1)+' °C</b></div><div class="r"><span>'+L('Humedad relativa','Relative humidity')+'</span><b>'+r.rh+' %</b></div><div class="r"><span>'+L('Presión de estación','Station pressure')+'</span><b>'+nf(r.P,1)+' hPa</b></div><div class="r"><span>'+L('Altitud de densidad','Density altitude')+'</span><b>'+ni(r.da)+' m</b></div><div class="big">'+nf(r.s,1)+' m/s</div><div class="r"><span>'+L('Viento desde','Wind from')+'</span><b>'+r.dir+'°</b></div>'+(G.mode==='facil'?'<div class="r"><span>'+L('Cruzado sobre tu rumbo','Crosswind on your heading')+'</span><b>'+(function(){ const cr=comps({s:r.s,dir:r.dir},G.az+G.targets[G.cur].u*0.0572958).cross; return nf(Math.abs(cr),1)+' m/s '+(cr>=0?L('→ empuja a la derecha','→ pushes right'):L('← empuja a la izquierda','← pushes left')); })()+'</b></div>':'')
    :'<div class="big" style="font-size:18px">'+L('Pulsa MEDIR','Press MEASURE')+'</div>')+'</div>'+
    '<div class="frrow"><button type="button" class="frbtn" id="frkm">'+L('MEDIR','MEASURE')+'</button>'+(r?'<button type="button" class="frbtn sec" id="frkn">'+L('Anotar','Write down')+'</button>':'')+'</div></div><p style="font-size:13px;color:#a8ad98">'+L('Mide el aire y el viento en tu puesto (tramo 1). Lejos el viento puede ser otro: míralo en las banderas.','Measures the air and the wind at your position (zone 1). Further out the wind may differ: check the flags.')+'</p>'; };
   const bind=s=>{ s.querySelector('#frkm').onclick=()=>{ kestrel(); s.querySelector('.bd').innerHTML=show(); bind(s); }; const n=s.querySelector('#frkn'); if(n) n.onclick=()=>{ const r=G.readK; addNote(L('Anemómetro','Meter')+': '+nf(r.T,1)+'°C '+r.rh+'% '+nf(r.P,1)+'hPa DA '+ni(r.da)+'m · '+L('viento','wind')+' '+nf(r.s,1)+' m/s '+L('desde','from')+' '+r.dir+'°'); msg(L('Anotado','Written down')); }; };
   sheet(L('Anemómetro (tipo Kestrel)','Wind meter (Kestrel type)'),show(),bind,'kestrel'); return; }
 if(k==='lrf'){ const r=lase(); let h; if(r.none) h='<div class="frlcd"><div class="big" style="font-size:20px">'+L('Sin eco','No echo')+'</div></div>'; else if(r.far) h='<div class="frlcd"><div class="big" style="font-size:20px">'+L('Sin lectura','No reading')+'</div></div><p>'+L('Fuera del alcance del telémetro (1.800 m en este modo). Mide con la retícula: D = tamaño (m) × 1000 / mil.','Beyond the rangefinder’s reach (1,800 m in this mode). Range with the reticle: D = size (m) × 1000 / mil.')+EST()+'</p>';
   else h='<div class="frlcd"><div class="big">'+ni(r.R)+' m</div><div class="r"><span>'+L('Ángulo','Angle')+'</span><b>'+(r.ang>=0?'+':'')+nf(r.ang,1)+'°</b></div><div class="r"><span>'+L('Rumbo','Heading')+'</span><b>'+Math.round(r.az)+'°</b></div>'+(G.mode==='facil'?'<div class="r"><span>'+L('Distancia horizontal','Horizontal distance')+'</span><b>'+ni(r.R*Math.cos(r.ang*Math.PI/180))+' m</b></div>':'')+'</div>'+(r.ground?'<p>'+L('Has medido el terreno, no una placa.','You ranged the ground, not a plate.')+'</p>':'<p>P'+(r.i+1)+' · '+(G.targets[r.i].shape==='gong'?L('gong de ','gong ')+Math.round(G.targets[r.i].w*100)+' cm':L('placa de ','plate ')+Math.round(G.targets[r.i].w*100)+'×'+Math.round(G.targets[r.i].h*100)+' cm')+'</p>');
   sheet(L('Telémetro láser','Laser rangefinder'),h+(r.R&&!r.ground?'<div class="frrow"><button type="button" class="frbtn sec" id="frln">'+L('Anotar','Write down')+'</button></div>':''),s=>{ const n=s.querySelector('#frln'); if(n) n.onclick=()=>{ addNote('P'+(r.i+1)+': '+ni(r.R)+' m · '+nf(r.ang,1)+'° · '+L('rumbo','heading')+' '+Math.round(r.az)+'°'); msg(L('Anotado','Written down')); }; },'lrf'); return; }
 if(k==='comp'){ const hd=heading(); const e=G.view==='scope'?G.aim.e:0; sheet(L('Brújula y GPS','Compass & GPS'),'<div class="frlcd"><div class="big">'+Math.round(hd)+'°</div><div class="r"><span>'+L('Rumbo (verdadero) de la vista','View heading (true)')+'</span><b>'+['N','NE','E','SE','S','SW','W','NW'][Math.round(hd/45)%8].replace('W',EN()?'W':'O')+'</b></div><div class="r"><span>'+L('Latitud (GPS)','Latitude (GPS)')+'</span><b>'+nf(G.st.lat,1)+'° N</b></div><div class="r"><span>'+L('Altitud del puesto','Position altitude')+'</span><b>'+ni(G.st.alt)+' m</b></div>'+(G.view==='scope'?'<div class="r"><span>'+L('Inclinación del visor','Scope inclination')+'</span><b>'+nf(e*0.0572958,1)+'°</b></div>':'')+'</div><p style="font-size:13px;color:#a8ad98">'+L('Acimut 90° = este, 270° = oeste. La línea de tiro de este puesto mira a ','Azimuth 90° = east, 270° = west. This position’s firing line faces ')+G.az+'°.</p>',null,'comp'); return; }
 if(k==='card'){ cardSheet(0); return; }
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
 h+='<p style="font-size:13px;margin:8px 0 0">'+L('Tablas preparadas para la temperatura de hoy (','Tables prepared for today’s temperature (')+nf(G.T,0)+' °C): '+L('elige la altitud de densidad e interpola.','pick the density altitude and interpolate.')+'</p><div class="frrow" style="margin:6px 0"><span style="font-size:13px;color:#a8ad98">'+L('Altitud de densidad','Density altitude')+'</span><span class="frseg">'+DAS.map((d,i)=>'<button type="button" data-da="'+i+'" class="'+(i===di?'on':'')+'">'+ni(d)+' m</button>').join('')+'</span></div>';
 h+='<table class="frtab"><tr><th>'+L('Dist. (m)','Dist. (m)')+'</th><th>'+L('Alza','Elev.')+' ('+un+')</th><th>'+L('Viento 1 m/s','Wind 1 m/s')+' ('+un+')</th><th>'+L('T. vuelo (s)','ToF (s)')+'</th><th>V (m/s)</th></tr>'+
  rows.map(r=>'<tr><td>'+ni(r.d)+'</td><td>'+nf(r.el*uf,U()?1:2)+'</td><td>'+nf(r.w*uf,U()?2:2)+'</td><td>'+nf(r.t,3)+'</td><td>'+Math.round(r.v)+'</td></tr>').join('')+'</table>';
 h+='<p style="font-size:12.5px;color:#a8ad98">'+L('Tabla sin viento, sin giro y sin Coriolis, tiro horizontal. Esos tres los calculas tú con las fórmulas.','Table with no wind, spin or Coriolis, level shot. You work those three out with the formulas.')+'</p>';
 sheet(L('Tarjeta de datos','Data card'),h,s=>{ s.querySelectorAll('[data-da]').forEach(b=>b.onclick=()=>cardSheet(+b.getAttribute('data-da'))); },'card'); }
function flagsSheet(i){ const f=G.flags[i]; const g=flagGeom(f,now()); const bands=[[0,G.wind.e1],[G.wind.e1,G.wind.e2],[G.wind.e2,null]];
 const b=bands[f.band];
 let h='<canvas id="frfc" width="600" height="360" style="width:100%;height:auto;border-radius:10px;background:#9db3c9"></canvas>';
 h+='<p class="frbig">'+L('Bandera ','Flag ')+(i+1)+' · '+ni(f.d)+' m · '+L('tramo ','zone ')+(f.band+1)+': '+ni(b[0])+'–'+(b[1]?ni(b[1])+' m':L('más allá','beyond'))+'</p>';
 if(G.mode==='facil') h+='<p>'+L('Viento cruzado aquí: ','Crosswind here: ')+'<b>'+nf(Math.abs(g.cross),1)+' m/s</b> '+(g.cross>=0?L('hacia la derecha','to the right'):L('hacia la izquierda','to the left'))+'. '+L('En Fácil es igual en todo el recorrido.','In Easy it is the same along the whole path.')+'</p>';
 else h+='<p style="font-size:13.5px;color:#bfc2b8">'+L('Lee el ángulo entre la bandera y el mástil: ángulo / 4 = viento cruzado en mph (FM 23-10). 1 mph = 0,447 m/s.','Read the angle between flag and pole: angle / 4 = crosswind in mph (FM 23-10). 1 mph = 0.447 m/s.')+'</p>';
 h+='<div class="frrow">'+G.flags.map((x,j)=>'<button type="button" class="frbtn '+(j===i?'':'sec')+' sm" data-fl="'+j+'">'+L('Bandera ','Flag ')+(j+1)+'</button>').join('')+'</div>';
 sheet(L('Prismáticos','Binoculars'),h,s=>{ s.querySelectorAll('[data-fl]').forEach(bb=>bb.onclick=()=>flagsSheet(+bb.getAttribute('data-fl')));
   const cv=s.querySelector('#frfc'); const c=cv.getContext('2d'); const draw_=()=>{ if(!document.body.contains(cv)) return; const tm=now(); const gg=flagGeom(f,tm);
     c.fillStyle='#9db3c9'; c.fillRect(0,0,600,360); c.fillStyle=G.st.near; c.fillRect(0,300,600,60);
     const x=300,top=60,pole=240; c.strokeStyle='#ddd'; c.lineWidth=6; c.beginPath(); c.moveTo(x,top+pole); c.lineTo(x,top); c.stroke();
     c.strokeStyle='rgba(255,255,255,.55)'; c.lineWidth=1; c.font='14px system-ui,sans-serif'; c.fillStyle='rgba(255,255,255,.9)'; c.textAlign='center';
     for(let a=0;a<=90;a+=15){ const r=Math.PI*a/180; [1,-1].forEach(sd=>{ c.beginPath(); c.moveTo(x,top); c.lineTo(x+Math.sin(r)*sd*200,top+Math.cos(r)*200); c.stroke(); if(a>0) c.fillText(a+'°',x+Math.sin(r)*sd*222,top+Math.cos(r)*222+5); }); }
     const th=gg.th*Math.PI/180, dx=Math.sin(th)*gg.side, dy=Math.cos(th); const Lf=170, Wd=95; const hA=Wd*Math.sin(th)+12; const ex=-dy, ey=dx; const amp=Wd*0.1*Math.min(1,gg.s/4+0.2);
     c.beginPath(); for(let j=0;j<=12;j++){ const ss=j/12; const wv=Math.sin(ss*5-tm*(6+gg.s*1.5))*amp*ss; c.lineTo(x+dx*Lf*ss+ex*wv,top+dy*Lf*ss+ey*wv); } for(let j=12;j>=0;j--){ const ss=j/12; const wv=Math.sin(ss*5-tm*(6+gg.s*1.5)+0.5)*amp*ss; c.lineTo(x+dx*Lf*ss+ex*wv,top+hA+dy*Lf*ss+ey*wv); } c.closePath(); c.fillStyle=i===1?'#f0a020':'#e0472f'; c.fill();
     requestAnimationFrame(draw_); }; draw_(); },'flags'); }
function pcSheet(){ const t=G.targets[G.cur]; const K=G.readK, R_=G.readL&&G.readL.i===t.i?G.readL:null;
 if(!K||!R_){ sheet(L('Computadora balística','Ballistic computer'),'<p class="frbig">'+L('Necesito tus lecturas de esta placa:','I need your readings for this plate:')+'</p><p>'+(K?'<span class="frok">✓</span> ':'· ')+L('Anemómetro: temperatura, presión y viento','Wind meter: temperature, pressure and wind')+'<br>'+(R_?'<span class="frok">✓</span> ':'· ')+L('Telémetro: distancia y ángulo de P','Rangefinder: distance and angle of P')+(t.i+1)+'</p><div class="frrow">'+(K?'':'<button type="button" class="frbtn sec" id="frk">'+L('Abrir anemómetro','Open wind meter')+'</button>')+(R_?'':'<button type="button" class="frbtn sec" id="frl">'+L('Medir P','Range P')+(t.i+1)+'</button>')+'</div>',s=>{ const a=s.querySelector('#frk'); if(a) a.onclick=()=>tool('kestrel'); const b=s.querySelector('#frl'); if(b) b.onclick=()=>tool('lrf'); },'pc'); return; }
 const bd=breakdown(R_.R,t.u,t.e,now()); const A=G.az+t.u*0.0572958; const cr=comps({s:K.s,dir:K.dir},A).cross;
 const row=(a,b)=>'<span>'+a+'</span><b>'+b+'</b>';
 let h='<div class="frkv">'+row(L('Distancia · ángulo','Distance · angle'),ni(R_.R)+' m · '+nf(R_.ang,1)+'°')+row(L('Altitud de densidad','Density altitude'),ni(K.da)+' m')+row(L('Viento cruzado','Crosswind'),nf(Math.abs(cr),1)+' m/s '+(cr>=0?L('→ derecha','→ right'):L('← izquierda','← left')))+row(L('Rumbo · latitud','Heading · latitude'),Math.round(A)+'° · '+nf(G.st.lat,1)+'° N')+'</div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Elevación','Elevation')+'</h4><div class="frlcd"><div class="big">'+fmtE(bd.elev)+'</div></div><div class="frkv" style="margin-top:6px">'+row(L('Caída de la bala','Bullet drop'),fmtE(bd.drop))+row(L('Coriolis vertical (Eötvös)','Vertical Coriolis (Eötvös)'),(bd.corV>=0?L('la bala sube ','bullet rises '):L('la bala baja ','bullet drops '))+nf(Math.abs(bd.corVcm),1)+' cm → '+fmtE(-bd.corV))+'</div></div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Deriva','Windage')+'</h4><div class="frlcd"><div class="big">'+fmtW(bd.wdg)+'</div></div><div class="frkv" style="margin-top:6px">'+row(L('Viento','Wind'),fmtW(-bd.wind))+row(L('Deriva por giro','Spin drift'),fmtW(-bd.spin))+row(L('Coriolis horizontal','Horizontal Coriolis'),nf(Math.abs(bd.corHcm),1)+' cm → '+fmtW(-bd.corH))+'</div></div>';
 h+='<div class="frkv">'+row(L('Tiempo de vuelo','Time of flight'),nf(bd.t,2)+' s')+row(L('Velocidad al llegar','Impact velocity'),Math.round(bd.v)+' m/s (Mach '+nf(bd.mach,2)+')')+row(L('Régimen','Regime'),bd.minMach<1?'<span class="frko">'+L('llega subsónica: más dispersión','arrives subsonic: more spread')+'</span>':(bd.minMach<1.2?'<span class="frko">'+L('entra en transónico','goes transonic')+'</span>':L('supersónica todo el vuelo','supersonic all the way')))+'</div>';
 h+='<div class="frrow"><button type="button" class="frbtn" id="frap">'+L('Ajustar torretas','Dial it in')+'</button></div><p style="font-size:12.5px;color:#a8ad98">'+L('También puedes sujetar con la retícula en vez de girar las torretas.','You can also hold with the reticle instead of dialing.')+'</p>';
 sheet(L('Computadora balística','Ballistic computer'),h,s=>{ s.querySelector('#frap').onclick=()=>{ G.dialE=Math.round(bd.elev/CLICK())*CLICK(); G.dialW=Math.round(bd.wdg/CLICK())*CLICK(); closeSheet(); if(G.view!=='scope'){ G.view='scope'; G.aim={u:t.u,e:t.e}; G.aimSet=true; CACHE=null; } side(); msg(L('Torretas: ','Turrets: ')+fmtE(G.dialE)+' · '+fmtW(G.dialW)); }; },'pc'); }

function shoot(t,tg,aimU,aimE,dialE,dialW,held,tm){ let R=t.R; if(!tg){ const d=raycast(aimU,aimE); R=d?Math.hypot(d,terrain(G.st,d,aimU)-EYE):2500; }
 const rf=G.rf; const sig=0.3*rf.moa*0.2909+(held?0:0.1);
 const mvAdj=gauss()*rf.mvSd, ea=gauss()*sig, wa=gauss()*sig;
 const fl=shotFlight({R:R,u:aimU,e:aimE,t:tm,alpha:dialE+ea,beta:dialW+wa,mvAdj:mvAdj,track:true});
 let tx=0,ty=0,tsg=0; if(fl.minMach<1.2){ tsg=clamp((1.2-fl.minMach)/0.2,0,1.5)*0.25; tx=gauss()*tsg; ty=gauss()*tsg; }
 const iu=aimU+fl.z/R*1000+tx, ie=aimE+fl.y/R*1000+ty;
 const dxm=(iu-t.u)*R/1000, dym=(ie-t.e)*R/1000; const hit=!!tg&&(t.shape==='gong'?Math.hypot(dxm,dym)<=t.w/2:(Math.abs(dxm)<=t.w/2&&Math.abs(dym)<=t.h/2));
 return {R:R,fl:fl,iu:iu,ie:ie,dxm:dxm,dym:dym,hit:hit,mvAdj:mvAdj,ea:ea,wa:wa,tsg:tsg}; }
/* ===== Disparo ===== */
function fire(){ if(G.busy||G.over) return; let t=G.targets[G.cur]; const tm=now();
 const aimU=G.aim.u+G.shake.x, aimE=G.aim.e+G.shake.y; const tg=aimedTarget(aimU,aimE); if(tg){ t=tg; G.cur=tg.i; }
 if(t.res==='hit'||t.shots>=G.rounds){ msg(L('Esa placa ya está resuelta: elige otra','That plate is done: pick another')); return; }
 const sh=shoot(t,tg,aimU,aimE,G.dialE,G.dialW,!!G.breath,tm); const {R,fl,iu,ie,dxm,dym,hit,mvAdj,ea,wa,tsg}=sh; const held=!!G.breath;
 t.shots++; G.breath=0;
 const bd=breakdown(t.R,t.u,t.e,tm);
 const rec={i:t.i,R:t.R,hit:hit,dxm:dxm,dym:dym,dialE:G.dialE,dialW:G.dialW,holdE:aimE-t.e,holdW:aimU-t.u,bd:bd,mvAdj:mvAdj,disp:Math.hypot(ea,wa),tsg:tsg,tof:fl.t,v:fl.v,mach:fl.mach,minMach:fl.minMach,held:held,
   az:G.az+aimU*0.0572958,iu:iu,ie:ie,shot:t.shots,pts:0};
 if(hit){ const tab=G.mode==='facil'?[3,2,1,1,1]:[5,3,1]; rec.pts=Math.round((tab[t.shots-1]||1)*(1+t.d/1000)); G.score+=rec.pts; t.pts=rec.pts; t.res='hit'; t.hits.push([dxm,dym]); }
 else if(t.shots>=G.rounds) t.res='miss';
 G.shots.push(rec); G.last=rec;
 G.anim={fired:performance.now(),track:fl.track,u:aimU,e:aimE,tof:fl.t,iu:iu,ie:ie,hit:hit,t:t}; G.busy=true; side(); status();
 const fx=document.getElementById('frview'); if(fx){ fx.style.transform='translateY(2px)'; setTimeout(()=>{ fx.style.transform=''; },90); }
 setTimeout(()=>{ if(!G||G.anim.t!==t) return; if(hit){ G.anim.swing=performance.now(); G.hitVer=(G.hitVer||0)+1; msg(L('IMPACTO','HIT')+' · P'+(t.i+1)+' · '+ni(t.R)+' m','hit'); } else msg(L('Fallo','Miss')+' · '+missTxt(rec),'miss'); },fl.t*1000+60);
 setTimeout(()=>{ if(!G) return; G.busy=false; side(); debrief(rec); },fl.t*1000+(hit?1500:1100));
 if(window.MAT_FR) window.MAT_FR.lastShot=rec; return rec; }
function missTxt(r){ const v=r.dym*100, h=r.dxm*100; return (Math.abs(v)>=1?nf(Math.abs(v),0)+' cm '+(v>0?L('alto','high'):L('bajo','low')):'')+(Math.abs(v)>=1&&Math.abs(h)>=1?' · ':'')+(Math.abs(h)>=1?nf(Math.abs(h),0)+' cm '+(h>0?L('a la derecha','right'):L('a la izquierda','left')):''); }
function debrief(r){ if(!G||G.over&&!r) return; const t=G.targets[r.i], bd=r.bd; const row=(a,b)=>'<span>'+a+'</span><b>'+b+'</b>';
 const effE=r.dialE+r.holdE, effW=r.dialW+r.holdW; const dE=effE-bd.elev, dW=effW-bd.wdg;
 let h='<p class="frbig">'+(r.hit?'<b class="frok">'+L('IMPACTO','HIT')+'</b>':'<b class="frko">'+L('FALLO','MISS')+'</b>')+' · P'+(t.i+1)+' · '+ni(r.R)+' m · '+(r.hit?'+'+r.pts+' '+L('puntos','points'):L('impacto ','impact ')+missTxt(r)+' '+L('del centro','from centre'))+'</p>';
 h+='<div class="frkv">'+row(L('Tiempo de vuelo','Time of flight'),nf(r.tof,2)+' s')+row(L('Velocidad al llegar','Impact velocity'),Math.round(r.v)+' m/s · Mach '+nf(r.mach,2))+row(L('Transónica','Transonic'),r.minMach<1.2?'<span class="frko">'+L('sí, Mach mínimo ','yes, minimum Mach ')+nf(r.minMach,2)+'</span>':L('no','no'))+'</div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Valores reales de este disparo','True values for this shot')+'</h4><div class="frkv">'+
  row(L('Caída','Drop'),fmtAng(bd.drop))+row(L('Coriolis vertical (Eötvös)','Vertical Coriolis (Eötvös)'),(bd.corV>=0?'+':'−')+nf(Math.abs(bd.corVcm),1)+' cm ('+fmtAng(bd.corV)+')')+row('<b>'+L('Alza necesaria','Elevation needed')+'</b>','<b>'+fmtE(bd.elev)+'</b>')+
  row(L('Viento','Wind'),fmtAng(bd.wind)+' '+(bd.wind>=0?L('a la derecha','right'):L('a la izquierda','left')))+row(L('Deriva por giro','Spin drift'),fmtAng(bd.spin)+' '+L('a la derecha','right'))+row(L('Coriolis horizontal','Horizontal Coriolis'),nf(Math.abs(bd.corHcm),1)+' cm '+(bd.corH>=0?L('a la derecha','right'):L('a la izquierda','left')))+row('<b>'+L('Deriva necesaria','Windage needed')+'</b>','<b>'+fmtW(bd.wdg)+'</b>')+'</div></div>';
 h+='<div class="frpanel" style="margin:10px 0"><h4>'+L('Lo que pusiste','What you set')+'</h4><div class="frkv">'+row(L('Torretas','Turrets'),fmtE(r.dialE)+' · '+fmtW(r.dialW))+row(L('Sujeción con la retícula','Reticle hold'),fmtE(r.holdE)+' · '+fmtW(r.holdW))+
  row(L('Diferencia','Difference'),(Math.abs(dE)<0.05?L('alza exacta','elevation spot on'):(dE>0?L('alto ','high '):L('bajo ','low '))+fmtAng(dE))+' · '+(Math.abs(dW)<0.05?L('deriva exacta','windage spot on'):(dW>0?L('a la derecha ','right '):L('a la izquierda ','left '))+fmtAng(dW)))+
  row(L('Azar de este disparo','This shot’s randomness'),'V0 '+(r.mvAdj>=0?'+':'−')+nf(Math.abs(r.mvAdj),1)+' m/s · '+L('dispersión ','spread ')+fmtAng(r.disp+r.tsg*0.8)+(r.held?'':' · '+L('sin contener aire','breath not held')))+'</div></div>';
 if(G.mode==='facil'&&!r.hit){ const ce=-r.dym/r.R*1000, cw=-r.dxm/r.R*1000; h+='<p class="frbig"><b>'+L('Observador','Spotter')+':</b> '+L('«Impacto ','“Impact ')+missTxt(r)+'. '+(Math.abs(ce)>=0.05?(ce>0?L('Sube ','Come up '):L('Baja ','Come down '))+fmtAng(ce):'')+(Math.abs(ce)>=0.05&&Math.abs(cw)>=0.05?L(' y ',' and '):'')+(Math.abs(cw)>=0.05?L('corrige ','hold ')+fmtAng(cw)+' '+(cw>0?L('a la derecha','right'):L('a la izquierda','left')):'')+L('.»','.”')+'</p>'; }
 const more=t.res!=='hit'&&t.shots<G.rounds; const next=G.targets.findIndex(x=>!x.res);
 h+='<div class="frrow">'+(more?'<button type="button" class="frbtn" id="frag">'+L('Otro disparo','Fire again')+' ('+(G.rounds-t.shots)+')</button>':'')+(next>=0?'<button type="button" class="frbtn'+(more?' sec':'')+'" id="frnx">'+L('Siguiente placa','Next plate')+' (P'+(next+1)+')</button>':'<button type="button" class="frbtn" id="frend">'+L('Ver resultado','See result')+'</button>')+'</div>';
 sheet(L('Informe del disparo','Shot debrief'),h,s=>{ const a=s.querySelector('#frag'); if(a) a.onclick=()=>{ closeSheet(); if(G.mode==='facil'&&!r.hit){ /* el observador ya te dijo la corrección */ } };
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
function manualSolve(i){ const t=G.targets[i]; G.cur=i; const K=kestrel(); let Lr=lase(); if(!Lr||Lr.none) return null; if(Lr.far){ const mil=t.w/t.d*1000; const Dm=t.w*1000/mil; Lr={R:Dm/Math.cos(t.e/1000),ang:t.e*0.0572958,az:(G.az+t.u*0.0572958+360)%360,milRanged:true}; } const rf=G.rf;
 const D=Lr.R, th=Lr.ang*Math.PI/180, Dh=D*Math.cos(th), A=Lr.az; const da=K.da;
 let j=0; while(j<DAS.length-2&&da>DAS[j+1]) j++; const f=clamp((da-DAS[j])/(DAS[j+1]-DAS[j]),-0.5,1.5);
 const r0=rowsInterp(dopeTable(rf,DAS[j]),Dh), r1=rowsInterp(dopeTable(rf,DAS[j+1]),Dh); const it=k=>r0[k]+(r1[k]-r0[k])*f;
 const drop=it('el'), wcol=it('w'), tof=it('t');
 const c1=-K.s*Math.sin((K.dir-A)*Math.PI/180);
 const cf=G.flags.map(fl=>{ const g=flagGeom(fl,now()); return g.side*(g.th/4)*0.44704; });
 const cb=[c1,cf[1],cf[2]]; const bandAt=x=>x<G.wind.e1?0:(x<G.wind.e2?1:2);
 const weff=0.45*cb[bandAt(D/6)]+0.38*cb[bandAt(D/2)]+0.17*cb[bandAt(5*D/6)];
 const sg=millerSg(rf,atmos(1013.25,15,0))*(((K.T*9/5+32)+460)/519)*(29.92/(K.P*0.02953));
 const spin=1.25*(sg+1.2)*Math.pow(tof,1.83)*0.0254/D*1000; const lat=G.st.lat*Math.PI/180, Ar=A*Math.PI/180;
 const corH=1000*OMEGA*tof*Math.sin(lat), corV=1000*OMEGA*tof*Math.cos(lat)*Math.sin(Ar);
 return {elev:drop-corV, wdg:-(weff*wcol+spin+corH), parts:{drop:drop,corV:corV,wind:weff*wcol,spin:spin,corH:corH,weff:weff,D:D,da:da}}; }

/* ===== Ruta ===== */
export function route(app,x){ APP=app; X=x; css(); CFG=loadCfg();
 const q=(location.hash.split('?')[1]||''); const P_={}; q.split('&').forEach(kv=>{ const [k,v]=kv.split('='); if(k) P_[k]=decodeURIComponent(v||''); });
 if(P_.m&&MODES[P_.m]) CFG.mode=P_.m; if(P_.r&&RIFLES.some(r=>r.id===P_.r)) CFG.rifle=P_.r; if(P_.s&&STAGES.some(s=>s.id===P_.s)) CFG.stage=P_.s; if(P_.u==='moa'||P_.u==='mil') CFG.unit=P_.u;
 intro(); }
/* para QA automática */
window.MAT_FR={G:()=>G,cfg:o=>{ Object.assign(CFG,o||{}); saveCfg(); return CFG; },start:()=>{ newGame(); game(); return G; },lase:lase,kestrel:kestrel,tool:tool,fire:fire,manual:manualSolve,breakdown:breakdown,
 dial:(e,w)=>{ G.dialE=e; G.dialW=w; side(); },aimAt:(i,he,hw)=>{ const t=G.targets[i]; G.cur=i; G.view='scope'; G.aimSet=true; G.aim={u:t.u+(hw||0),e:t.e+(he||0)}; CACHE=null; side(); },
 view:v=>{ G.view=v; CACHE=null; side(); },setAz:a=>{ G.az=a; },setStage:o=>{ Object.assign(G,o); },debrief:()=>debrief(G.last),dope:da=>dopeTable(G.rf,da),closeSheet:closeSheet,
 solver:{fly:fly,atmos:atmos,zeroAngle:zeroAngle,millerSg:millerSg},
 sim:(i,e,w,held)=>{ const t=G.targets[i]; const s=shoot(t,t,t.u,t.e,e,w,held!==false,now()); return {hit:s.hit,dx:s.dxm,dy:s.dym,minMach:s.fl.minMach,t:s.fl.t}; },
 newGame:()=>newGame()};
