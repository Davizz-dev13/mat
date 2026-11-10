/* M.A.T — «Artillero» (#/artillero): misión de tiro con obuses reales sobre un mapa táctico.
   Flujo como en una batería real (FM 6-40 / TC 3-09.81 «Manual Cannon Gunnery»; ATP 3-09.30 «Observed Fires»):
   orden de tiro → plotear el objetivo en el mapa (cuadrícula de 8 cifras) → regla y transportador (alcance en metros,
   azimut en milésimas, 6.400 por vuelta) → tabla de tiro (+ correcciones de viento, temperatura y cota) → apuntar la pieza →
   fuego → el observador corrige (alarga/acorta, derecha/izquierda) → fuego por eficacia.
   Determinista: sin dispersión ni tiradas de suerte. Unos datos de tiro bien calculados SIEMPRE aciertan.
   Las piezas, calibres, alcances y elevaciones salen de las fichas de M.A.T (Wikipedia). La velocidad en boca, las cargas y
   la tabla de tiro son del MODELO DEL JUEGO (se calculan para que la carga máxima llegue al alcance de la ficha): no son datos reales.
   Facciones genéricas, sin banderas ni personas. «Carros de combate», nunca «tanques». */
const EN=()=>typeof window!=='undefined'&&window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const nf=(v,d)=>{ d=d==null?1:d; const s=(Math.round(v*Math.pow(10,d))/Math.pow(10,d)).toFixed(d); return EN()?s:s.replace('.',','); };
const ni=v=>{ const r=Math.round(v), s=String(Math.abs(r)); const t=EN()?s.replace(/\B(?=(\d{3})+(?!\d))/g,','):(s.length>4?s.replace(/\B(?=(\d{3})+(?!\d))/g,'.'):s); return (r<0?'−':'')+t; };
const sg=v=>(v>=0?'+':'−')+String(Math.abs(v));
const n64=a=>((a%6400)+6400)%6400;
const m4=v=>String(Math.round(n64(v))%6400).padStart(4,'0');
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hsh(a,b,c){ let h=(a*374761393+b*668265263+(c||0)*2147483647)|0; h=Math.imul(h^(h>>>13),1274126177); return ((h^(h>>>16))>>>0)/4294967295; }

/* ===== Piezas: datos de las fichas de M.A.T (blindados_d, campo «alcance_tiro», «elevacion», «calibre», «cadencia») =====
   r = alcance que usa el juego (el de la munición estándar que cita la ficha). el = elevación máxima de la ficha en grados (null = la ficha no la da).
   v0 = velocidad en boca real con la carga máxima (fuente en fs). nz = número real de cargas/zonas; zl = sus nombres.
   kf = factor de resistencia del aire AJUSTADO por el juego para que la carga máxima llegue al alcance r de la ficha. trav = sector sin
   mover colas (mils a cada lado; 0 = 360°; null = sin dato). emp = [entrada, salida] en posición en s (fuente). sh = proyectil y masa (kg). */
const GUNS=[
 {id:'sbs',rpm:10,sp:false,crew:null,ficha:'b-santa-b-rbara-sistemas-155-52',n:'SBS 155/52',full:'Santa Bárbara Sistemas 155/52',kc:155,cal:'155 mm L/52',r:30000,el:72,v0:945,nz:6,zl:null,trav:711,emp:null,sh:["M107 HE", 43.2],kf:0.8686,fs:["V0 945 m/s: cañón 155/52 con 6 módulos y proyectil L15A1 (Rheinmetall, folleto del sistema de cargas modulares; el fabricante del SBS no la publica). Sector de puntería ±40° (Wikipedia ES). Cadencia 10/min (ficha; el Ejército de Tierra da 8/min).", "V0 945 m/s: 155/52 gun with 6 modules and L15A1 shell (Rheinmetall modular charge brochure; the SBS maker does not publish it). Traverse ±40° (Spanish Wikipedia). Rate 10/min (data sheet; the Spanish Army gives 8/min)."],tipo:['Obús remolcado · España','Towed howitzer · Spain'],
  src:['Alcance 30 km convencional (40 km con proyectil asistido por cohete); elevación −3° a +72°; 10 disparos/min','Range 30 km conventional (40 km rocket-assisted); elevation −3° to +72°; 10 rounds/min']},
 {id:'m109',rpm:4,sp:true,crew:'6 (A5)',ficha:'b-m109-howitzer',n:'M109A5',full:'M109 (A5–A7)',kc:155,cal:'155 mm L/39',r:21000,el:null,v0:810,nz:5,zl:['1L','2L','3H','4H','5H'],trav:0,emp:null,sh:["M107 HE", 43.2],kf:1.0816,fs:["V0 810 m/s: cañón 155/39 con 5 módulos (Rheinmetall, cita el M109). Cargas MACS M231 (zonas 1–2) y M232A1 (3–5) (General Dynamics OTS). Giro 360° (Wikipedia).", "V0 810 m/s: 155/39 gun with 5 modules (Rheinmetall, lists the M109). MACS charges M231 (zones 1–2) and M232A1 (3–5) (General Dynamics OTS). 360° traverse (Wikipedia)."],tipo:['Obús autopropulsado · EE. UU.','Self-propelled howitzer · USA'],
  src:['M109A5–A7: HE 21 km; RAP 30 km; Excalibur 40 km; máx. 4 disparos/min durante 3 min','M109A5–A7: HE 21 km; RAP 30 km; Excalibur 40 km; max 4 rounds/min for 3 min']},
 {id:'m777',rpm:8,sp:false,crew:'7+1',ficha:'b-m777-howitzer',n:'M777',full:'M777',kc:155,cal:'155 mm',r:21000,el:71.7,v0:810,nz:5,zl:['1L','2L','3H','4H','5H'],trav:400,emp:null,sh:["M107 HE", 43.2],kf:1.0816,fs:["V0 810 m/s: cañón 155/39 con 5 módulos (Rheinmetall, cita el M777; Wikipedia da 827 m/s con la carga 8S de saquetes). Cargas MACS M231 (1–2) y M232A1 (3–5) (General Dynamics OTS). Sector sobre afuste: 400 mils a cada lado (BAE Systems).", "V0 810 m/s: 155/39 gun with 5 modules (Rheinmetall, lists the M777; Wikipedia gives 827 m/s with bagged charge 8S). MACS charges M231 (1–2) and M232A1 (3–5) (General Dynamics OTS). On-carriage traverse: 400 mils each side (BAE Systems)."],tipo:['Obús remolcado · Reino Unido','Towed howitzer · UK'],
  src:['M107: 21 km; M795: 23,5 km; ERFB M795E1: 30 km; elevación 0° a +71,7°','M107: 21 km; M795: 23.5 km; ERFB M795E1: 30 km; elevation 0° to +71.7°']},
 {id:'pzh',rpm:10,sp:true,crew:'5',ficha:'b-panzerhaubitze-2000',n:'PzH 2000',full:'Panzerhaubitze 2000',kc:155,cal:'155 mm L52',r:30000,el:null,v0:945,nz:6,zl:null,trav:0,emp:null,sh:["M107 HE", 43.2],kf:0.8686,fs:["V0 945 m/s con 6 módulos y proyectil L15A1 (Rheinmetall). Seis cargas modulares (Wikipedia). Torre 360°.", "V0 945 m/s with 6 modules and L15A1 shell (Rheinmetall). Six modular charges (Wikipedia). 360° turret."],tipo:['Obús autopropulsado · Alemania','Self-propelled howitzer · Germany'],
  src:['DM121 Boattail: 30 km; M1711 base bleed: 40 km; 3 disparos en 9 s','DM121 Boattail: 30 km; M1711 base bleed: 40 km; 3 rounds in 9 s']},
 {id:'caesar',rpm:6,sp:true,crew:'5-6',ficha:'b-caesar-self-propelled-howitzer',n:'CAESAR',full:'CAESAR',kc:155,cal:'155 mm L/52',r:40000,el:null,v0:945,nz:6,zl:null,trav:null,emp:[60, 40],sh:["M107 HE", 43.2],kf:0.5818,fs:["En posición en unos 60 s y fuera en 40 s (Wikipedia, cita a KNDS). KNDS no publica la V0: el juego usa la de un 155/52 con 6 módulos (945 m/s, Rheinmetall). Sin dato de sector: no se penaliza el giro.", "Into action in about 60 s and out in 40 s (Wikipedia, citing KNDS). KNDS does not publish the muzzle velocity: the game uses a 155/52 with 6 modules (945 m/s, Rheinmetall). No traverse figure: turning is not penalised."],tipo:['Cañón autopropulsado · Francia','Self-propelled gun · France'],
  src:['ERFB: 4,5 a 40 km; asistido por cohete: 55 km; 6 disparos/min','ERFB: 4.5 to 40 km; rocket-assisted: 55 km; 6 rounds/min']},
 {id:'k9',rpm:8,sp:true,crew:'5',ficha:'b-k9-thunder',n:'K9 Thunder',full:'K9 Thunder',kc:155,cal:'155 mm L/52',r:18000,el:null,v0:924,nz:6,zl:null,trav:0,emp:[30, 60],sh:["M107 HE", 43.2],kf:1.5569,fs:["V0 924 m/s con carga de seis zonas y proyectil K307 (Army Guide). Primer disparo en 30 s parado y 60 s en marcha (folleto de Hanwha). Torre 360°.", "V0 924 m/s with six-zone charge and K307 shell (Army Guide). First round within 30 s stationary and 60 s on the move (Hanwha brochure). 360° turret."],tipo:['Obús autopropulsado · Corea del Sur','Self-propelled howitzer · South Korea'],
  src:['18 km (M107, HE); 30 km (M549A1, RAP); 54 km (K315); 6-8 disparos/min','18 km (M107, HE); 30 km (M549A1, RAP); 54 km (K315); 6-8 rounds/min']},
 {id:'msta',rpm:8,sp:true,crew:'5',ficha:'b-2s19-msta-s',n:'2S19 Msta-S',full:'2S19 Msta-S',kc:152,cal:'152 mm L47',r:24700,el:null,v0:864,nz:5,zl:null,trav:0,emp:null,sh:["OF-45", 43.56],kf:1.0046,fs:["V0 864 m/s y proyectil OF-45 de 43,56 kg (GlobalSecurity). Torre 360° (Wikipedia). Número de cargas sin fuente: el juego usa 5.", "V0 864 m/s and 43.56 kg OF-45 shell (GlobalSecurity). 360° turret (Wikipedia). Number of charges unsourced: the game uses 5."],tipo:['Obús autopropulsado · URSS','Self-propelled howitzer · USSR'],
  src:['Proyectil estándar: 24,7 km; base bleed: 29 km; asistido por cohete: 36 km','Standard shell: 24.7 km; base bleed: 29 km; rocket-assisted: 36 km']},
 {id:'l118',rpm:12,sp:false,crew:'6',ficha:'b-l118-light-gun',n:'L118',full:'L118 Light Gun',kc:105,cal:'105 mm',r:17200,el:70,v0:708,nz:7,zl:['1','2','3','4','4½','5','S'],trav:100,emp:null,sh:["L31 HE", 16.1],kf:0.878,fs:["V0 máx. 708 m/s (Military History Wiki). Cargas 1, 2, 3, 4, 4½, 5 y «Super»; proyectil L31 HE de 16,1 kg; puntería fina 200 mils, 360° sobre la plataforma (Wikipedia, cita a Janes).", "Max V0 708 m/s (Military History Wiki). Charges 1, 2, 3, 4, 4½, 5 and Super; 16.1 kg L31 HE shell; 200 mils fine traverse, 360° on the platform (Wikipedia, citing Janes)."],tipo:['Cañón remolcado · Reino Unido','Towed gun · UK'],
  src:['17,2 km; 20,6 km con base bleed; elevación +70° / −5,5°; 12 disparos/min','17.2 km; 20.6 km base bleed; elevation +70° / −5.5°; 12 rounds/min']},
 {id:'d30',rpm:12,sp:false,crew:'1+7',ficha:'b-122-mm-howitzer-2a18-d-30',n:'D-30',full:'D-30 (2A18)',kc:122,cal:'122 mm',r:15400,el:70,v0:690,nz:5,zl:['B','B+1','B+2','B+3','B+4'],trav:0,emp:null,sh:["OF-462", 21.76],kf:1.0549,fs:["V0 690 m/s con la carga máxima y proyectil OF-462 de 21,76 kg; carga base más cuatro incrementos; giro 360° sobre el trípode (Wikipedia).", "V0 690 m/s at maximum charge and 21.76 kg OF-462 shell; base charge plus four increments; 360° traverse on the tripod (Wikipedia)."],tipo:['Obús remolcado · URSS','Towed howitzer · USSR'],
  src:['15,4 km; 21,9 km con proyectil asistido por cohete; elevación −7° a 70°','15.4 km; 21.9 km rocket-assisted; elevation −7° to 70°']}
];
const gunOf=id=>GUNS.find(g=>g.id===id)||GUNS[0];
/* Diferencias por pieza: recarga = 60 / cadencia máxima de la ficha. Girar más del sector g.trav (fuente en fs)
   sobre la última puntería obliga a mover las colas (+TRAIL s, VALOR DEL JUEGO: ninguna fuente da ese tiempo).
   Puente: 2 impactos con 152/155 mm, 3 con 105/122 mm (VALOR DEL JUEGO por calibre; las fichas no dan el peso del proyectil). */
const TRAIL=60;
const reloadOf=g=>60/g.rpm;
const needPu=g=>g.sh[1]>=40?2:3;
function gunRules(g){ const sg=n=>ni(Math.round(n));
 const tr=g.trav===0?L('Giro de 360°: apunta a cualquier azimut sin coste de tiempo.','360° traverse: any azimuth at no time cost.'):(g.trav?L('Sector sin mover el afuste: ±'+g.trav+' mils. Fuera de él hay que mover las colas o la plataforma: +'+TRAIL+' s','Traverse without moving the carriage: ±'+g.trav+' mils. Beyond it the trails or platform must be shifted: +'+TRAIL+' s')+' <span class="artest">'+L('tiempo: valor del juego','time: game value')+'</span>':L('Sin dato de sector: el juego no penaliza el giro.','No traverse figure: turning is not penalised.'));
 const em=g.emp?(g.id==='k9'?L('Primer disparo en '+g.emp[0]+' s parado y '+g.emp[1]+' s en marcha.','First round within '+g.emp[0]+' s stationary and '+g.emp[1]+' s on the move.'):L('En posición en '+g.emp[0]+' s; sale en '+g.emp[1]+' s.','Into action in '+g.emp[0]+' s; out in '+g.emp[1]+' s.')):'';
 return '<p class="artnote art-rules">'+L('V0 máx. ','Max V0 ')+sg(g.v0)+' m/s · '+g.nz+L(' cargas (',' charges (')+(g.zl?g.zl.join(' · '):'1–'+g.nz)+') · '+esc(g.sh[0])+' '+nf(g.sh[1],2).replace(/[,.]?0+$/,'')+' kg<br>'+
 L('Recarga ','Reload ')+nf(60/g.rpm,1)+' s ('+L('cadencia máxima de la ficha: ','max rate of fire in the data sheet: ')+g.rpm+'/min)'+(g.crew?' · '+L('dotación ','crew ')+esc(g.crew):'')+'<br>'+tr+(em?'<br>'+em:'')+
 '<br>'+L('Puente: ','Bridge: ')+needPu(g)+L(' impactos con proyectil de ',' hits with a ')+nf(g.sh[1],1)+' kg <span class="artest">'+L('regla del juego','game rule')+'</span>'+
 '<br><small>'+L('Fuente: ','Source: ')+esc(L(g.fs[0],g.fs[1]))+'</small></p>'; }
const elMaxMil=g=>Math.round((g.el||67.5)*6400/360);

/* ===== Motor balístico del juego (determinista) =====
   Masa puntual con resistencia cuadrática (Cd constante 0,30 y la masa típica del proyectil de cada calibre), densidad que baja
   con la altura (escala 8.500 m) y con la temperatura, y viento constante. Integración de paso fijo (0,05 s). Es el MODELO DEL JUEGO. */
const G0=9.80665, M2R=2*Math.PI/6400, DT=0.05;
const KPROJ={105:1.05e-4,122:9.86e-5,152:7.65e-5,155:7.97e-5};
const CHFN={5:[0.42,0.55,0.68,0.83,1.0],6:[0.40,0.50,0.61,0.73,0.86,1.0],7:[0.38,0.46,0.55,0.65,0.75,0.87,1.0]};
const chf=g=>CHFN[g.nz]||CHFN[5];
const zn=(g,c)=>g.zl?g.zl[c]:String(c+1);
function sim(gun,ch,elMil,o){ o=o||{}; const v0=gun.v0*chf(gun)[ch]; const k=KPROJ[gun.kc]*(gun.kf||1); const T=o.T==null?15:o.T; const rhoT=288.15/(T+273.15);
 const wr=o.wr||0, wc=o.wc||0; const a=elMil*M2R; let x=0,y=0,z=0,vx=v0*Math.cos(a),vy=v0*Math.sin(a),vz=0,t=0; const hit=o.ground; const path=o.path?[]:null; let apex=0, ex=0;
 if(path) path.push([0,0,0,0]);
 for(let i=0;i<20000;i++){
  const ux=vx-wr, uz=vz-wc; const sp=Math.sqrt(ux*ux+vy*vy+uz*uz); const kk=k*rhoT*Math.exp(-y/8500)*sp;
  const mx=vx-kk*ux*DT/2, my=vy+(-G0-kk*vy)*DT/2, mz=vz-kk*uz*DT/2; const yy=y+vy*DT/2;
  const ux2=mx-wr, uz2=mz-wc; const sp2=Math.sqrt(ux2*ux2+my*my+uz2*uz2); const kk2=k*rhoT*Math.exp(-yy/8500)*sp2;
  const px=x,py=y,pz=z; x+=mx*DT; y+=my*DT; z+=mz*DT;
  vx+=(-kk2*ux2)*DT; vy+=(-G0-kk2*my)*DT; vz+=(-kk2*uz2)*DT; t+=DT; if(y>apex){ apex=y; ex=x; }
  if(path&&(i%5===4)) path.push([x,y,z,t]);
  const gh=hit?hit(x,z):(o.h||0);
  if(y<=gh&&(vy<0||(hit&&x>30))){ const gp=hit?hit(px,pz):(o.h||0); const d0=py-gp, d1=y-gh; const f=clamp(d0/((d0-d1)||1e-9),0,1); const X=px+(x-px)*f, Z=pz+(z-pz)*f, Tt=t-DT+DT*f, Y=py+(y-py)*f;
   if(path) path.push([X,Y,Z,Tt]);
   return {x:X,y:Y,z:Z,t:Tt,apex:apex,ax:ex,path:path,desc:Math.atan2(-vy,Math.hypot(vx,vz)),asc:vy>0};
  }
  if(t>300) break;
 }
 return {x:x,y:y,z:z,t:t,apex:apex,ax:ex,path:path,desc:0,asc:false};
}

/* ===== Tabla de tiro del juego (por pieza, carga y ángulo bajo/alto). Filas cada 100 m; correcciones calculadas cada 500 m
   e interpoladas (como en las tablas reales, se interpola entre filas). ===== */
const TBL={};
function tableOf(gun,ch,hi){ const key=gun.id+'|'+ch+'|'+(hi?1:0); if(TBL[key]) return TBL[key];
 let best=0,be=0; for(let e=600;e<=1000;e+=8){ const r=sim(gun,ch,e).x; if(r>best){best=r;be=e;} } for(let e=be-8;e<=be+8;e+=1){ const r=sim(gun,ch,e).x; if(r>best){best=r;be=e;} }
 const eA=hi?be:40, eB=hi?Math.min(elMaxMil(gun),1450):be; const S=[];
 for(let e=eA;e<=eB+0.01;e+=4){ const s=sim(gun,ch,e); S.push([e,s.x,s.t]); }
 const rmin=Math.min(S[0][1],S[S.length-1][1]), rmax=Math.max(S[0][1],S[S.length-1][1]);
 const R0=Math.ceil((rmin+50)/100)*100, R1=Math.min(Math.floor((rmax-30)/100)*100,21000); const rows=[];
 const elFor=(R,o)=>{ let i=0; for(i=0;i<S.length-1;i++){ const a=S[i][1],b=S[i+1][1]; if((R-a)*(R-b)<=0) break; } i=Math.min(i,S.length-2);
  let e=S[i][0]+(S[i+1][0]-S[i][0])*(R-S[i][1])/((S[i+1][1]-S[i][1])||1e-9);
  for(let k=0;k<3;k++){ const r1=sim(gun,ch,e,o).x, r2=sim(gun,ch,e+0.5,o).x; const d=(r2-r1)/0.5; if(Math.abs(d)<1e-6) break; e+= (R-r1)/d; }
  return e; };
 const corr={};
 for(let R=Math.ceil(R0/500)*500-500;R<=R1+500;R+=500){ if(R<R0-500) continue; const Rc=clamp(R,R0,R1); const e=elFor(Rc); const b=sim(gun,ch,e);
  const hw=sim(gun,ch,e,{wr:-5}).x, cr=sim(gun,ch,e,{wc:-5}).z, tp=sim(gun,ch,e,{T:25}).x; const e100=elFor(Rc,{h:100});
  corr[R]={w:(b.x-hw)/5, x:-Math.atan2(cr/5,b.x)/M2R, T:(b.x-tp)/10, h:(e100-e)/10}; }
 const cAt=(R,k)=>{ const a=Math.floor(R/500)*500, b=a+500; const A=corr[a]||corr[b], B=corr[b]||corr[a]; if(!A) return 0; return A[k]+(B[k]-A[k])*(R-a)/500; };
 for(let R=R0;R<=R1;R+=100){ const e=elFor(R); const s=sim(gun,ch,e); const p=sim(gun,ch,e+1).x, m=sim(gun,ch,e-1).x;
  rows.push({R:R,el:e,t:s.t,dR:(p-m)/2,w:cAt(R,'w'),x:cAt(R,'x'),T:cAt(R,'T'),h:cAt(R,'h'),apex:s.apex}); }
 const T={gun:gun.id,ch:ch,hi:!!hi,rows:rows,R0:R0,R1:R1,rmax:best,emax:be}; TBL[key]=T; return T; }
function tInterp(T,R){ const rs=T.rows; if(!rs.length||R<T.R0-1e-6||R>T.R1+1e-6) return null; const i=clamp(Math.floor((R-T.R0)/100),0,rs.length-2); const a=rs[i], b=rs[Math.min(i+1,rs.length-1)]; const f=b===a?0:(R-a.R)/100; const o={}; ['el','t','dR','w','x','T','h','apex'].forEach(k=>{ o[k]=a[k]+(b[k]-a[k])*f; }); o.R=R; return o; }

/* ===== Procedimiento de la Central de Tiro (el que sigue el jugador; la calculadora de Fácil muestra exactamente esto) =====
   alcance corregido = alcance + viento de cara × corr. viento + (T − 15 °C) × corr. temperatura
   elevación = tabla(alcance corregido) + (Δcota / 10 m) × corr. cota
   azimut = azimut de la cuadrícula + viento lateral desde la derecha × corr. lateral */
function metComp(m,az){ const rel=(m.wd-az)*M2R; return {head:m.ws*Math.cos(rel), right:m.ws*Math.sin(rel)}; }
function procedure(M,gun,ch,hi,pe,pn){ const dE=pe-M.bE, dN=pn-M.bN; const R=Math.hypot(dE,dN); const az=n64(Math.atan2(dE,dN)/M2R); const T=tableOf(gun,ch,hi);
 const dh=hAt(M,pe,pn,true)-M.bH; const r0=tInterp(T,R); if(!r0) return {R:R,az:az,dh:dh,out:true};
 const wc=metComp(M.met,az); const Rc=R+wc.head*r0.w+(M.met.T-15)*r0.T; const r1=tInterp(T,Rc); if(!r1) return {R:R,az:az,dh:dh,out:true};
 const el=r1.el+dh/10*r0.h; const azf=az+wc.right*r0.x;
 return {R:R,az:az,dh:dh,Rc:Rc,tbl:r1.el,elh:dh/10*r0.h,head:wc.head,right:wc.right,cw:r0.w,cT:r0.T,ch_:r0.h,cx:r0.x,el:el,azf:n64(azf),t:r1.t,dR:r1.dR,wr:wc.head*r0.w,Tr:(M.met.T-15)*r0.T,xr:wc.right*r0.x}; }

/* ===== Mapa táctico generado (semilla) — solo la GENERACIÓN usa la semilla; el impacto no tiene azar ===== */
const MAP=20000, GN=101, GS=200, E0=40000, N0=20000;
const BIO=['llanura','bosque','montana','ciudad','costa'];
const BION=b=>({llanura:L('Llanura','Plains'),bosque:L('Bosque','Forest'),montana:L('Montaña','Mountains'),ciudad:L('Ciudad','City'),costa:L('Costa','Coast')}[b]||b);
const KN=k=>({pc:L('Puesto de mando','Command post'),pu:L('Puente','Bridge'),ba:L('Batería enemiga','Enemy battery'),co:L('Columna de vehículos','Vehicle column')}[k]||k);
const VNAMES=['Valdecastro','Fuentelaguna','Peñarrubia','Torrealba','Navalcruz','Villaseca','Montejo','Robledal','Casarejo','Puertoviejo','Hontanar','Aldeanueva','Castrillo','Navahonda','Valmayor','Peñaflor','Quintanar','Sotoancho','Riofrío','Tablada'];
function grid8(e,n){ return String(Math.floor((E0+e)/10)%10000).padStart(4,'0')+' '+String(Math.floor((N0+n)/10)%10000).padStart(4,'0'); }
function sq(e,n){ const c=clamp(Math.floor(e/2000),0,9), r=clamp(9-Math.floor(n/2000),0,9); return 'ABCDEFGHIJ'[c]+(r+1); }
function parseGrid(s){ const d=String(s||'').replace(/\D/g,''); if(d.length!==8) return null; const e=(+d.slice(0,4))*10-E0, n=(+d.slice(4))*10-N0; if(e<0||e>MAP||n<0||n>MAP) return null; return {e:e+5,n:n+5}; }
function lattice(r,cell){ const c=Math.ceil(MAP/cell)+2; const v=new Float32Array(c*c); for(let i=0;i<v.length;i++) v[i]=r()*2-1; return (e,n)=>{ const x=e/cell, y=n/cell; const i=Math.floor(x), j=Math.floor(y); const fx=x-i, fy=y-j; const sx=fx*fx*(3-2*fx), sy=fy*fy*(3-2*fy);
 const a=v[j*c+i]||0,b=v[j*c+i+1]||0,cc=v[(j+1)*c+i]||0,d=v[(j+1)*c+i+1]||0; return a+(b-a)*sx+(cc-a)*sy+(a-b-cc+d)*sx*sy; }; }
function segDist(px,py,ax,ay,bx,by){ const dx=bx-ax, dy=by-ay; const l=dx*dx+dy*dy||1; const t=clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1); return Math.hypot(px-ax-dx*t,py-ay-dy*t); }
function polyD(pl,e,n){ let d=1e9; for(let i=0;i<pl.length-1;i++){ const v=segDist(e,n,pl[i][0],pl[i][1],pl[i+1][0],pl[i+1][1]); if(v<d) d=v; } return d; }
function walk(r,e,n,dir,step,turn){ const pts=[[e,n]]; let a=dir; for(let i=0;i<120;i++){ a+=(r()*2-1)*turn; e+=Math.sin(a)*step; n+=Math.cos(a)*step; pts.push([e,n]); if(e<-400||e>MAP+400||n<-400||n>MAP+400) break; } return pts; }
function through(r,e,n,dir,step,turn){ const A=walk(r,e,n,dir,step,turn), B=walk(r,e,n,dir+Math.PI,step,turn); return B.reverse().concat(A.slice(1)); }
function plLen(pl){ let s=0; for(let i=0;i<pl.length-1;i++) s+=Math.hypot(pl[i+1][0]-pl[i][0],pl[i+1][1]-pl[i][1]); return s; }
function plAt(pl,s){ for(let i=0;i<pl.length-1;i++){ const l=Math.hypot(pl[i+1][0]-pl[i][0],pl[i+1][1]-pl[i][1]); if(s<=l||i===pl.length-2){ const f=clamp(s/(l||1),0,1); return [pl[i][0]+(pl[i+1][0]-pl[i][0])*f,pl[i][1]+(pl[i+1][1]-pl[i][1])*f,Math.atan2(pl[i+1][0]-pl[i][0],pl[i+1][1]-pl[i][1])]; } s-=l; } return pl[pl.length-1]; }
function plS(pl,e,n){ let s=0,best=1e9,bs=0; for(let i=0;i<pl.length-1;i++){ const ax=pl[i][0],ay=pl[i][1],bx=pl[i+1][0],by=pl[i+1][1]; const l=Math.hypot(bx-ax,by-ay)||1; const t=clamp(((e-ax)*(bx-ax)+(n-ay)*(by-ay))/(l*l),0,1); const d=Math.hypot(e-ax-(bx-ax)*t,n-ay-(by-ay)*t); if(d<best){best=d;bs=s+l*t;} s+=l; } return bs; }

/* misión: def = {seed, biome, kind, mode, dist, lesson, met, id} */
function genMission(def){ const r=rng(def.seed*7919+13); const mode=def.mode; let biome=def.biome||BIO[Math.floor(r()*BIO.length)]; if(!BIO.includes(biome)) biome='llanura';
 let kinds=mode==='veterano'?['pc','pu','ba','co']:['pc','pu','ba']; if(biome==='ciudad') kinds=mode==='veterano'?['pc','pc','pu','co']:['pc','pc','pu'];
 const kind=def.kind||kinds[Math.floor(r()*kinds.length)];
 const dist=def.dist||Math.round((mode==='veterano'?5500+r()*11500:4500+r()*9500)/10)*10;
 let bE=0,bN=0,tE=0,tN=0,az=0; for(let k=0;k<80;k++){ bE=2500+r()*15000; bN=1200+r()*2200; az=(r()*2-1)*1150; tE=bE+dist*Math.sin(az*M2R); tN=bN+dist*Math.cos(az*M2R); if(tE>1600&&tE<MAP-1600&&tN>1600&&tN<MAP-1600) break; }
 if(def.bE!=null){ bE=def.bE; bN=def.bN; tE=def.tE; tN=def.tN; }
 const n1=lattice(r,4000), n2=lattice(r,1800), n3=lattice(r,800), nf_=lattice(r,900), nf2=lattice(r,350);
 const P={llanura:[180,45,0.55],bosque:[380,110,0.05],montana:[650,330,0.32],ciudad:[90,22,0.75],costa:[60,70,0.5]}[biome];
 const ux=(tE-bE)/dist, uy=(tN-bN)/dist; let ridge=null;
 if(biome==='montana'){ const f=0.5+r()*0.2; ridge={e:bE+(tE-bE)*f,n:bN+(tN-bN)*f,h:720+r()*420,w:520+r()*260}; }
 let sea=null; if(biome==='costa'){ const side=(bE+tE)/2<MAP/2?1:-1; const cx=side>0?Math.max(bE,tE)+2600+r()*1500:Math.min(bE,tE)-2600-r()*1500; sea={cx:cx,side:side}; }
 const H=new Float32Array(GN*GN);
 const hRaw=(e,n)=>{ let h=P[0]+P[1]*(n1(e,n)*0.62+n2(e,n)*0.28+n3(e,n)*0.1);
  if(ridge){ const along=(e-ridge.e)*ux+(n-ridge.n)*uy, across=-(e-ridge.e)*uy+(n-ridge.n)*ux; h+=ridge.h*Math.exp(-(along*along)/(2*ridge.w*ridge.w))*(0.75+0.25*Math.cos(across/2600)); }
  if(sea){ const cx=sea.cx+700*n2(0,n)+300*n3(e*0.3,n); const d=(e-cx)*sea.side; if(d>0) h=-5; else h=Math.max(2,h*Math.min(1,-d/2500)); }
  return h; };
 for(let j=0;j<GN;j++) for(let i=0;i<GN;i++) H[j*GN+i]=hRaw(i*GS,j*GS);
 { const slope=(e,n)=>Math.max(Math.abs(hRaw(e+100,n)-hRaw(e-100,n)),Math.abs(hRaw(e,n+100)-hRaw(e,n-100)))/200;
  for(const k of [0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6,8,-8,10,-10]){ const e=tE+ux*k*150, n=tN+uy*k*150; if(hRaw(e,n)>5&&slope(e,n)<0.07){ tE=e; tN=n; break; } } }
 const M={def:def,seed:def.seed,mode:mode,biome:biome,kind:kind,H:H,bE:bE,bN:bN,ridge:ridge,sea:sea,forest:(e,n)=>(nf_(e,n)*0.75+nf2(e,n)*0.35)>P[2],roads:[],rivers:[],rails:[],villages:[],blocks:[],labels:[],city:null};
 /* ríos */
 const gtA=Math.atan2(ux,uy);
 if(kind==='pu'||biome!=='montana'||r()<0.5){ const rp=kind==='pu'?[tE,tN]:[bE+(tE-bE)*(0.3+r()*0.4)+(r()-0.5)*3000,bN+(tN-bN)*(0.3+r()*0.4)]; M.rivers.push(through(r,rp[0],rp[1],gtA+Math.PI/2+(r()-0.5)*0.6,260,0.35)); }
 /* ciudad */
 if(biome==='ciudad'){ const cE=kind==='pc'?tE+(r()-0.5)*600:tE+(r()-0.5)*1500, cN=kind==='pc'?tN+(r()-0.5)*600:tN+(r()-0.5)*1500; M.city={e:cE,n:cN,r:2300+r()*900,b:120,s:30}; }
 /* carreteras */
 const roadT=kind==='pu'?gtA+(r()-0.5)*0.5:gtA+Math.PI/2+(r()-0.5)*1.2;
 const mainRoad=through(r,tE+(kind==='pc'&&biome!=='ciudad'?180:0),tN,roadT,300,0.22); M.roads.push(mainRoad);
 M.roads.push(through(r,bE+(r()-0.5)*1200,bN+600,(r()-0.5)*0.8,300,0.25));
 M.roads.push(through(r,r()*MAP,r()*MAP,r()*Math.PI,300,0.3));
 M.rails.push(through(r,r()*MAP,MAP*(0.3+r()*0.4),Math.PI/2+(r()-0.5)*0.7,500,0.08));
 /* pueblos */
 const nv=biome==='ciudad'?2:3+Math.floor(r()*3); const used={};
 const village=(e,n,big)=>{ let nm; for(let k=0;k<20;k++){ nm=VNAMES[Math.floor(r()*VNAMES.length)]; if(!used[nm]) break; } used[nm]=1; const v={e:e,n:n,name:nm}; M.villages.push(v);
  const cnt=big?14:6+Math.floor(r()*8); for(let k=0;k<cnt;k++){ const a=r()*Math.PI*2, d=r()*(big?420:300); const w=40+r()*70, h=30+r()*60; M.blocks.push({e:e+Math.sin(a)*d,n:n+Math.cos(a)*d,w:w,h:h,ht:7+r()*6}); } };
 if(kind==='pc'&&biome!=='ciudad') village(tE+(r()-0.5)*500,tN+(r()-0.5)*500,true);
 for(let k=0;k<nv;k++){ const e=1500+r()*(MAP-3000), n=1500+r()*(MAP-3000); if(sea&&(e-sea.cx)*sea.side>-600) continue; if(Math.hypot(e-tE,n-tN)<2500||Math.hypot(e-bE,n-bN)<1500||M.villages.some(v=>Math.hypot(v.e-e,v.n-n)<3200)) continue; village(e,n,false); }
 /* objetivo */
 const T={kind:kind,e:tE,n:tN};
 if(kind==='pc'){ T.rad=biome==='ciudad'?45:60; T.need=1; }
 if(kind==='pu'){ T.rad=40; T.need=2; T.dir=plAt(mainRoad,plS(mainRoad,tE,tN))[2]; }
 if(kind==='ba'){ T.rad=70; T.need=1; T.timer=mode==='veterano'?300:0; }
 if(kind==='co'){ T.rad=70; T.need=1; T.road=mainRoad; T.sT=plS(mainRoad,tE,tN); T.v=8.3; T.tp=Math.round(170+r()*70); T.len=plLen(mainRoad); }
 M.T=T;
 /* observador avanzado */
 const oa=gtA+Math.PI+(r()<0.5?1:-1)*(0.5+r()*0.5), od=2200+r()*1300; M.OP={e:clamp(tE+Math.sin(oa)*od,600,MAP-600),n:clamp(tN+Math.cos(oa)*od,600,MAP-600)};
 /* meteo */
 const met=def.met?{ws:def.met.ws,wd:n64(Math.round((az+(def.met.rel||0))/100)*100),T:def.met.T}:(mode==='veterano'?{ws:Math.round(2+r()*7),wd:Math.round(r()*64)*100,T:Math.round(-4+r()*34)}:mode==='facil'?{ws:Math.round(r()*4),wd:Math.round(r()*64)*100,T:Math.round(8+r()*14)}:{ws:0,wd:0,T:15});
 M.met=met; M.bH=Math.round(hAt(M,bE,bN,false)); M.tH=Math.round(hAt(M,tE,tN,true));
 /* rótulos */
 M.labels.push([tE+300,tN+380,'',0]);
 for(let k=0;k<4;k++){ const e=1200+r()*(MAP-2400), n=1200+r()*(MAP-2400); if(Math.hypot(e-tE,n-tN)<1200) continue; M.labels.push([e,n,(EN()?'Hill ':'Cota ')+Math.round(hAt(M,e,n,false)),1]); }
 return M; }
function hAt(M,e,n,bld){ const x=clamp(e/GS,0,GN-1.001), y=clamp(n/GS,0,GN-1.001); const i=Math.floor(x), j=Math.floor(y), fx=x-i, fy=y-j; const H=M.H;
 let h=H[j*GN+i]*(1-fx)*(1-fy)+H[j*GN+i+1]*fx*(1-fy)+H[(j+1)*GN+i]*(1-fx)*fy+H[(j+1)*GN+i+1]*fx*fy; if(bld) h+=bldAt(M,e,n); return h; }
function bldAt(M,e,n){ const c=M.city; if(c){ const d=Math.hypot(e-c.e,n-c.n); if(d<c.r){ const p=c.b+c.s; const ii=Math.floor((e-c.e)/p), jj=Math.floor((n-c.n)/p); const fx=(e-c.e)-ii*p, fy=(n-c.n)-jj*p; if(fx<c.b&&fy<c.b&&((ii%5+5)%5)!==2&&((jj%5+5)%5)!==2){ const k=hsh(ii+500,jj+500,7); if(k>0.08) return 10+Math.round(k*22*(1-d/c.r*0.6)); } } } return 0; }

function groundFn(M,az){ const s=Math.sin(az*M2R), c=Math.cos(az*M2R); return (x,z)=>hAt(M,M.bE+x*s+z*c,M.bN+x*c-z*s,true)-M.bH; }
function shoot(M,gun,ch,el,az,path){ const w=metComp(M.met,az); const r=sim(gun,ch,el,{ground:groundFn(M,az),wr:-w.head,wc:-w.right,T:M.met.T,path:path}); const s=Math.sin(az*M2R), c=Math.cos(az*M2R); r.E=M.bE+r.x*s+r.z*c; r.N=M.bN+r.x*c-r.z*s; return r; }
function recommend(M,gun,pe,pn,rad){ rad=rad||(M.T&&M.T.rad)||60; for(const hi of [false,true]) for(let c=0;c<gun.nz;c++){ const p=procedure(M,gun,c,hi,pe,pn); if(p.out) continue; const TT=tableOf(gun,c,hi); if(!hi&&p.Rc>TT.R1-150) continue; if(hi&&(p.Rc<TT.R0+150||p.Rc>TT.R1-150)) continue; if(p.el>elMaxMil(gun)) continue;
  const r=shoot(M,gun,c,Math.round(p.el),Math.round(p.azf)); if(Math.hypot(r.E-pe,r.N-pn)<rad*0.8) return {ch:c,hi:hi,p:p,r:r}; } return null; }

/* ===== Campaña (misiones hechas a mano) ===== */
const CAMP=[
 {id:'a1',mode:'aprende',lesson:1,seed:101,biome:'llanura',kind:'pc',dist:7200,met:{ws:7,rel:0,T:15},n:['Lección 1 · Reglaje','Lesson 1 · Adjust fire'],d:['Puesto de mando a 7 km en llanura. Primer disparo solo con la tabla; el observador te corrige y rematas.','Command post 7 km away on open plains. First round from the table only; the observer corrects you and you finish it.']},
 {id:'a2',mode:'aprende',lesson:2,seed:202,biome:'bosque',kind:'pu',dist:9400,met:{ws:6,rel:1100,T:26},n:['Lección 2 · Viento, temperatura y cota','Lesson 2 · Wind, temperature and height'],d:['Puente a 9,4 km. Aplicas el boletín meteorológico y la diferencia de cota para acertar a la primera.','Bridge 9.4 km away. You apply the met message and the height difference to hit first time.']},
 {id:'a3',mode:'aprende',lesson:3,seed:303,biome:'montana',kind:'pc',dist:10600,met:{ws:3,rel:3200,T:8},n:['Lección 3 · Por encima de la cresta','Lesson 3 · Over the crest'],d:['Puesto de mando en un valle detrás de una sierra. Con ángulo bajo no pasa: tiro de ángulo alto.','Command post in a valley behind a ridge. Low angle cannot clear it: high-angle fire.']},
 {id:'f1',mode:'facil',seed:411,biome:'bosque',kind:'pu',dist:9000,n:['Puente sobre el río','Bridge over the river'],d:['Corta el puente: 2 impactos en el tablero con proyectil de más de 40 kg, 3 con los de 105/122 mm.','Cut the bridge: 2 hits on the span with shells over 40 kg, 3 with 105/122 mm shells.']},
 {id:'f2',mode:'facil',seed:512,biome:'llanura',kind:'pc',dist:12500,n:['Puesto de mando en la aldea','Command post in the village'],d:['Neutraliza el puesto de mando enemigo a 12,5 km.','Neutralise the enemy command post 12.5 km away.']},
 {id:'f3',mode:'facil',seed:613,biome:'costa',kind:'ba',dist:11000,n:['Batería en la costa','Battery on the coast'],d:['Batería enemiga junto al mar.','Enemy battery by the sea.']},
 {id:'f4',mode:'facil',seed:714,biome:'ciudad',kind:'pc',dist:8000,n:['Puesto de mando en la ciudad','Command post in the city'],d:['Entre edificios: mira el perfil antes de disparar.','Between buildings: check the profile before you fire.']},
 {id:'v1',mode:'veterano',seed:815,biome:'montana',kind:'pc',dist:11000,n:['El valle','The valley'],d:['Detrás de la sierra, con viento y frío.','Behind the ridge, with wind and cold.']},
 {id:'v2',mode:'veterano',seed:916,biome:'ciudad',kind:'pc',dist:13000,n:['Centro urbano','City centre'],d:['Puesto de mando en una manzana: radio de acierto de 35 m.','Command post in a city block: 35 m hit radius.']},
 {id:'v3',mode:'veterano',seed:1017,biome:'bosque',kind:'ba',dist:12000,n:['Contrabatería','Counter-battery'],d:['Os han detectado: 5 minutos antes de que os localicen.','You have been detected: 5 minutes before they locate you.']},
 {id:'v4',mode:'veterano',seed:1118,biome:'llanura',kind:'co',dist:9500,n:['Columna en movimiento','Moving column'],d:['La columna pasará por el punto de paso: dispara a la hora justa.','The column will pass the checkpoint: fire at exactly the right time.']}
];
const MODES={aprende:[L('Aprende','Learn'),L('3 lecciones guiadas','3 guided lessons'),L('Te explico cada paso de una misión de tiro real con números del juego: plotear, medir, tabla de tiro, apuntar, corregir.','I explain each step of a real fire mission with the game’s numbers: plot, measure, firing table, lay, correct.')],
 facil:[L('Fácil','Easy'),L('Con calculadora de tiro','With fire-direction calculator'),L('Ploteas tú y la calculadora te da los datos desglosados (tabla + viento + cota). Viento flojo.','You plot and the calculator gives you the broken-down data (table + wind + height). Light wind.')],
 veterano:[L('Veterano','Veteran'),L('Sin calculadora · 5–17 km','No calculator · 5–17 km'),L('Tabla de tiro y tu cabeza: viento, temperatura, cota, crestas, columnas en movimiento y contrabatería con reloj.','Firing table and your head: wind, temperature, height, crests, moving columns and counter-battery against the clock.')]};
const MK={aprende:'aprende',facil:'facil',veterano:'veterano'};
function bests(){ let b={}; try{ b=JSON.parse(localStorage.getItem('mat_art_best')||'{}'); }catch(e){ b={}; } const o={}; if(b&&typeof b==='object'&&!Array.isArray(b)) for(const k in b){ const v=b[k]; if(v&&typeof v==='object'&&CAMP.some(c=>c.id===k)){ const s=Math.round(+v.s), p=Math.round(+v.p); if(s>=1&&s<=3) o[k]={s:s,p:p>0?p:0}; } } return o; }
function saveBests(b){ try{ localStorage.setItem('mat_art_best',JSON.stringify(b)); }catch(e){} }
function loadCfg(){ let c={mode:'aprende',gun:'sbs',biome:'',seed:null}; try{ Object.assign(c,JSON.parse(localStorage.getItem('mat_art_cfg')||'{}')); }catch(e){} if(!MODES[c.mode]) c.mode='aprende'; if(!GUNS.some(g=>g.id===c.gun)) c.gun='sbs'; if(typeof c.biome!=='string'||(c.biome&&BIO.indexOf(c.biome)<0)) c.biome=''; return c; }
function saveCfg(){ try{ localStorage.setItem('mat_art_cfg',JSON.stringify({mode:CFG.mode,gun:CFG.gun,biome:CFG.biome})); }catch(e){} }
let APP=null, X=null, CFG=null, G=null, RAF=0, BASE=null;
function stopLoop(){ if(RAF) cancelAnimationFrame(RAF); RAF=0; }

function css(){ if(document.getElementById('art-css')) return; const s=document.createElement('style'); s.id='art-css';
 s.textContent=[
 '.artw{max-width:1180px;margin:0 auto;padding-bottom:40px}',
 '.art-dt{margin:8px 0;border:1px solid var(--line);border-radius:var(--r);background:var(--s1)}',
 '.art-dt>summary{cursor:pointer;padding:9px 12px;font-size:13.5px;font-weight:600;color:var(--tx);list-style:revert}',
 '.art-dt>summary+*{margin:0 10px 10px}',
 '.art-dt .artord{margin:0 10px 10px}',
 '.art-hd{display:flex;gap:12px;align-items:center;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);overflow:hidden;margin:8px 0 10px;padding:8px}',
 '.art-hd img{width:92px;height:58px;object-fit:cover;border-radius:8px;flex:none;filter:saturate(.85) brightness(.8)}',
 '.art-hd .ht{min-width:0}',
 '.art-hd .ht>b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:28px;letter-spacing:.03em;line-height:1}',
 '.art-hd .ht>span{display:block;font-size:12.5px;color:#bfc2b8;line-height:1.35;margin-top:4px}',
 '.art-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin:0 0 8px}',
 '.art-tab{display:block;min-width:0;min-height:54px;text-align:left;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);color:var(--tx);padding:7px 8px;font:inherit;cursor:pointer;touch-action:manipulation}',
 '.art-tab small{display:block;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;color:#a8ad98;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
 '.art-tab b{display:-webkit-box;font-size:13px;line-height:1.25;margin-top:2px;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical}',
 '.art-tab.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac) inset;background:#1a1d14}',
 '.art-pane{margin:0 0 10px}',
 '.art-pane .artgr.c2,.art-pane .artgr.c3{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}',
 '.art-pane .artgr.art-md{grid-template-columns:repeat(3,minmax(0,1fr))}',
 '.art-pane .artopt{min-height:0}',
 '.art-pane .artopt b{font-size:14.5px}',
 '@media(min-width:700px){.art-pane .artgr.c3{grid-template-columns:repeat(3,minmax(0,1fr))}}',
 '.art-pane .artopt{padding:8px 10px}',
 '.art-ms .artopt span,.art-gn .artopt span{font-size:12px}',
 '.art-gen{display:flex;gap:6px;flex-wrap:nowrap}',
 '.art-gen select{flex:1 1 40%;min-width:0;width:auto}',
 '.art-gen input{flex:1 1 30%;min-width:0;width:auto}',
 '.art-gen .artbtn{flex:none}',
 '.art-rc{display:grid;gap:8px}',
 '.art-rc>div{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:7px 10px;display:grid;gap:2px;font-size:13px}',
 '.art-rc span{display:flex;justify-content:space-between;gap:8px;color:#bfc2b8}',
 '.art-rc i{font-style:normal;color:#e3c46a;white-space:nowrap}',
 '@media(min-width:900px){.art-rc{grid-template-columns:repeat(3,1fr)}}',
 '.arthero{position:relative;border-radius:var(--r);overflow:hidden;border:1px solid var(--line);margin:10px 0 14px;background:#20211a}',
 '.arthero img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;filter:saturate(.75) brightness(.62)}',
 '@media(min-width:800px){.arthero img{aspect-ratio:21/8}}',
 '.arthero .ht{position:absolute;left:0;right:0;bottom:0;padding:16px;background:linear-gradient(transparent,rgba(0,0,0,.88))}',
 '.arthero .ht b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:clamp(34px,8vw,58px);letter-spacing:.03em;line-height:1}',
 '.arthero .ht span{color:#d6d8d2;font-size:15px;display:block;margin-top:6px;max-width:660px}',
 '.artsec{margin:16px 0 8px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#a8ad98}',
 '.artgr{display:grid;grid-template-columns:1fr;gap:8px}',
 '@media(min-width:640px){.artgr.c2{grid-template-columns:repeat(2,1fr)}.artgr.c3{grid-template-columns:repeat(3,1fr)}}',
 '.artopt{display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);color:var(--tx);padding:11px 13px;font:inherit;cursor:pointer;min-height:48px}',
 '.artopt b{display:block;font-size:16px;margin-bottom:2px}',
 '.artopt span{display:block;font-size:13.5px;color:#bfc2b8;line-height:1.35}',
 '.artopt.on{border-color:var(--ac);box-shadow:0 0 0 1px var(--ac) inset;background:#1a1d14}',
 '.artopt i{font-style:normal;color:#d6b25e;font-size:13px}',
 '.artopt a{color:#b3bd8c;font-size:12.5px}',
 '.artrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}',
 '.artbtn{border:1px solid var(--line);background:var(--s1);color:var(--tx);border-radius:10px;padding:10px 14px;font:inherit;font-size:15px;cursor:pointer;min-height:44px}',
 '.artbtn.pri{background:#b3bd8c;color:#14160f;border-color:#b3bd8c;font-weight:700}',
 '.artbtn.fire{background:#9a3b2a;border-color:#c2563f;color:#fff;font-weight:700;letter-spacing:.06em;min-width:120px}',
 '.artbtn:disabled{opacity:.45;cursor:default}',
 '.artbtn.sm{padding:6px 10px;min-height:36px;font-size:14px}',
 '.artin{background:#0f100c;border:1px solid var(--line);color:var(--tx);border-radius:8px;padding:8px;font:inherit;font-size:16px;width:7.2em;min-height:40px}',
 '.artnote{font-size:13px;color:#a9ac9f;line-height:1.45}',
 '.artnote b{color:#d6d8d2}',
 '.artest{display:inline-block;font-size:11px;border:1px solid #6b6a50;border-radius:5px;padding:0 5px;color:#cfd0b8}',
 '.artplay{display:grid;grid-template-columns:1fr;gap:10px}',
 '@media(min-width:1000px){.artplay{grid-template-columns:minmax(0,560px) minmax(0,1fr);align-items:start}}',
 '.artcard{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px 12px;min-width:0}',
 '.artord{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;color:#e0dccb;background:#14150f;border-left:3px solid #c2a24e;padding:8px 10px;border-radius:6px;white-space:pre-wrap;word-break:break-word}',
 '.artmap{position:relative;width:100%;max-width:560px;margin:0 auto;touch-action:none}',
 '.artmap canvas{display:block;width:100%;height:auto;border-radius:8px;border:1px solid #6b5f45;background:#e9e0c9}',
 '.artprof canvas{display:block;width:100%;height:auto;border-radius:8px;border:1px solid var(--line);background:#11130e}',
 '.artread{font-size:14px;line-height:1.5;margin:6px 0;font-variant-numeric:tabular-nums}',
 '.artread b{font-size:15px}',
 '.arttabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}',
 '.arttabs button{flex:1 1 auto;min-width:0}',
 '.arttbl{max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:8px;-webkit-overflow-scrolling:touch}',
 '.arttbl table{border-collapse:collapse;width:100%;font-size:12.5px;font-variant-numeric:tabular-nums}',
 '.arttbl th{position:sticky;top:0;background:#1d1f17;color:#c9cbb9;font-weight:600;padding:5px 4px;text-align:right;white-space:nowrap}',
 '.arttbl td{padding:4px;text-align:right;border-top:1px solid #23251c;white-space:nowrap}',
 '.arttbl tr.hl td{background:#3a3a1f;color:#fff}',
 '.artlay{display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center}',
 '.artlay label{font-size:14px;color:#c9cbb9}',
 '.artstep{display:flex;gap:3px;flex-wrap:nowrap;align-items:center}',
 '.artstep .artin{width:4.6em;padding:8px 6px;text-align:center}',
 '.artstep .artbtn.sm{padding:6px 0;min-width:38px}',
 '.artlog{font-size:13.5px;line-height:1.45;max-height:170px;overflow:auto}',
 '.artlog p{margin:4px 0;padding:4px 6px;border-radius:6px;background:#14150f}',
 '.artlog p.ok{background:#1e2a17;color:#cfe8b5}',
 '.artlog p.bad{background:#2a1a17;color:#f0c2b5}',
 '.artguide{border:1px solid #c2a24e;background:#211f14;border-radius:var(--r);padding:10px 12px;font-size:14.5px;line-height:1.45}',
 '.artguide h4{margin:0 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#d6b25e}',
 '.artcalc table{width:100%;font-size:13.5px;border-collapse:collapse}',
 '.artcalc td{padding:3px 2px;border-top:1px solid #23251c}',
 '.artcalc td:last-child{text-align:right;font-variant-numeric:tabular-nums}',
 '.artcalc tr.fin td{font-weight:700;color:#fff;border-top:2px solid #b3bd8c}',
 '.arthud{display:flex;gap:10px;flex-wrap:wrap;font-size:13.5px;color:#c9cbb9;margin:4px 0 8px}',
 '.arthud b{color:#fff}',
 '.artend{text-align:center;padding:14px 8px}',
 '.artend .st{font-size:34px;letter-spacing:4px;color:#e0b73c}',
 '.artend h3{margin:6px 0;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:30px;letter-spacing:.03em}',
 'details.artmore{margin:10px 0;border:1px solid var(--line);border-radius:var(--r);padding:8px 12px;background:var(--s1)}',
 'details.artmore summary{cursor:pointer;font-weight:600}',
 'details.artmore p,details.artmore li{font-size:13.5px;color:#bfc2b8;line-height:1.5}'
 ].join('\n'); document.head.appendChild(s); }

function stars(n){ return '★'.repeat(n)+'☆'.repeat(Math.max(0,3-n)); }
let UIT='mis';
function intro(){ stopLoop(); G=null; const B=bests(); const M=CFG.mode; const gun=gunOf(CFG.gun);
 const opt=(on,attr,b,s)=>'<button type="button" class="artopt'+(on?' on':'')+'" '+attr+'><b>'+b+'</b><span>'+s+'</span></button>';
 const camp=CAMP.filter(c=>c.mode===M);
 const nStars=CAMP.reduce((a,c)=>a+(B[c.id]?B[c.id].s:0),0), nDone=CAMP.filter(c=>B[c.id]).length;
 let med=null; try{ const AT=/^at[ahfbdcvmg]\d/; const all=(window.MAT_MED&&window.MAT_MED.list)?window.MAT_MED.list().filter(x=>AT.test(x)):[]; const got=Object.keys((JSON.parse(localStorage.getItem('mat_med')||'{}').m)||{}).filter(x=>AT.test(x)); if(all.length) med=[got.length,all.length]; }catch(e){}
 const TABS=[['modo',L('Nivel','Level'),MODES[M][0]],['mis',M==='aprende'?L('Lección','Lesson'):L('Misión','Mission'),M==='aprende'?L('3 lecciones','3 lessons'):camp.length+L(' + infinitas',' + endless')],['gun',L('Obús','Gun'),gun.n],['rec',L('Récords','Records'),nStars+' ★']];
 if(UIT&&!TABS.some(t=>t[0]===UIT)) UIT='mis';
 let h='<div class="artw art-mn" data-noi18n>';
 h+='<div class="art-hd"><img src="img/juegos/artillero.webp" width="640" height="400" alt="'+esc(L('Obús de 155 mm haciendo fuego','A 155 mm howitzer firing'))+'" onerror="this.style.display=\'none\'"><div class="ht"><b>'+L('ARTILLERO','ARTILLERY')+'</b><span>'+L('Obuses reales sobre un mapa táctico: ploteas, mides, lees la tabla, apuntas y corriges. Si el cálculo está bien, acierta.','Real howitzers on a tactical map: plot, measure, read the table, lay and correct. If the calculation is right, it hits.')+'</span></div></div>';
 h+='<div class="art-tabs" role="tablist">'+TABS.map(t=>'<button type="button" role="tab" class="art-tab'+(UIT===t[0]?' on':'')+'" data-tab="'+t[0]+'" aria-selected="'+(UIT===t[0])+'" aria-expanded="'+(UIT===t[0])+'"><small>'+t[1]+' '+(UIT===t[0]?'▴':'▾')+'</small><b>'+esc(t[2])+'</b></button>').join('')+'</div>';
 let p='';
 if(UIT==='modo'){
  p+='<div class="artgr c3 art-md">'+Object.keys(MODES).map(k=>opt(M===k,'data-m="'+k+'"',MODES[k][0],MODES[k][1])).join('')+'</div><p class="artnote">'+MODES[M][2]+'</p>';
 } else if(UIT==='mis'){
  p+='<div class="artgr c2 art-ms">'+camp.map(c=>{ const b=B[c.id]; return opt(false,'data-c="'+c.id+'" title="'+esc(L(c.d[0],c.d[1]))+'"',L(c.n[0],c.n[1])+(b?' <i>'+stars(b.s)+'</i>':''),BION(c.biome)+' · '+KN(c.kind)+' · '+nf(c.dist/1000,1)+' km'); }).join('')+'</div>';
  if(M!=='aprende') p+='<div class="artsec">'+L('Misión generada (infinitas)','Generated mission (endless)')+'</div><div class="artrow art-gen"><select id="artbio" class="artin" aria-label="'+L('Terreno','Terrain')+'">'+['',...BIO].map(b=>'<option value="'+b+'"'+(CFG.biome===b?' selected':'')+'>'+(b?BION(b):L('Al azar','Random'))+'</option>').join('')+'</select>'+
   '<input id="artseed" class="artin" inputmode="numeric" aria-label="'+L('Nº de misión','Mission no.')+'" placeholder="'+L('Nº','No.')+'"><button type="button" class="artbtn pri" id="artgen">'+L('Generar','Generate')+'</button></div><p class="artnote">'+L('Nº vacío = misión nueva. El mismo número da siempre el mismo mapa y la misma orden.','Empty no. = new mission. The same number always gives the same map and order.')+'</p>';
  else p+='<p class="artnote">'+L('Al terminar las lecciones, pasa a Fácil para la campaña y las misiones generadas.','After the lessons, switch to Easy for the campaign and generated missions.')+'</p>';
 } else if(UIT==='gun'){
  p+='<div class="artgr c3 art-gn">'+GUNS.map(g=>'<button type="button" class="artopt'+(g.id===gun.id?' on':'')+'" data-g="'+g.id+'"><b>'+esc(g.n)+'</b><span>'+esc(g.cal)+' · '+nf(g.r/1000,1).replace(/[,.]0$/,'')+' km · '+(g.sp?L('autoprop.','SP'):L('remolcado','towed'))+'</span></button>').join('')+'</div>';
  p+=gunRules(gun);
  p+='<details class="artmore"><summary>'+esc(gun.full)+': '+L('datos de la ficha','data sheet')+'</summary><p class="artnote">'+esc(L(gun.tipo[0],gun.tipo[1]))+' · '+esc(L(gun.src[0],gun.src[1]))+' (ficha de M.A.T, Wikipedia). <a href="#/a/'+gun.ficha+'">'+L('Ver ficha','Open data sheet')+' ›</a><br>'+L('Velocidad en boca con la carga máxima: ','Muzzle velocity at maximum charge: ')+ni(gun.v0)+' m/s. '+L('Las cargas intermedias y la resistencia del aire (ajustada para llegar al alcance de la ficha) son ','Intermediate charges and air drag (fitted to reach the data-sheet range) are ')+'<span class="artest">'+L('modelo del juego','game model')+'</span>'+(gun.el?'':' · '+L('La ficha no da la elevación máxima: el juego usa 1.200 mils.','The data sheet gives no maximum elevation: the game uses 1,200 mils.'))+'</p></details>';
 } else if(UIT==='rec'){
  p+='<p class="artnote">'+L('Misiones hechas: ','Missions done: ')+nDone+'/'+CAMP.length+' · '+nStars+'/'+(CAMP.length*3)+' ★'+(med?' · 🎖 '+med[0]+'/'+med[1]:'')+'</p>';
  p+='<div class="art-rc">'+Object.keys(MODES).map(k=>'<div><b>'+MODES[k][0]+'</b>'+CAMP.filter(c=>c.mode===k).map(c=>{ const b=B[c.id]; return '<span>'+esc(L(c.n[0],c.n[1]).replace(/^Lección (\d) · /,'L$1 · ').replace(/^Lesson (\d) · /,'L$1 · '))+' <i>'+(b?stars(b.s)+' · '+ni(b.p||0):'—')+'</i></span>'; }).join('')+'</div>').join('')+'</div>';
  p+='<div class="artrow"><button type="button" class="artbtn" id="artmed">🎖 '+L('Medallas','Medals')+'</button></div>';
 }
 if(p) h+='<div class="art-pane" role="tabpanel">'+p+'</div>';
 h+='<details class="artmore"><summary>'+L('Cómo se calcula (y qué es real)','How it is calculated (and what is real)')+'</summary>'+
  '<p>'+L('El procedimiento es el de una batería real: el observador o el mando envían la cuadrícula del objetivo; en la central de tiro se plotea en el mapa, se miden el alcance (regla) y el azimut (transportador, en milésimas OTAN: 6.400 por vuelta), se entra en la tabla de tiro con el alcance corregido por el boletín meteorológico (viento y temperatura) y por la diferencia de cota, y se pasan los datos a la pieza. El observador corrige en metros: «alarga/acorta» y «derecha/izquierda».','The procedure is a real battery’s: the observer or headquarters sends the target grid; the fire direction centre plots it on the map, measures the range (ruler) and azimuth (protractor, in NATO mils: 6,400 per circle), enters the firing table with the range corrected for the met message (wind and temperature) and the height difference, and sends the data to the gun. The observer corrects in metres: “add/drop” and “right/left”.')+'</p>'+
  '<p>'+L('Real: las piezas, su calibre, alcance, elevación máxima y cadencia (fichas de M.A.T); y, con su fuente en cada pieza, la velocidad en boca máxima, el número y nombre de las cargas, el proyectil y su masa, el sector de puntería y los tiempos de entrada en posición publicados. Del juego: las velocidades de las cargas intermedias, la resistencia del aire (ajustada para que la carga máxima llegue al alcance de la ficha) y, con ellas, la tabla de tiro. Como en una central real, el observador corrige en metros sobre su línea observador-objetivo y la central lo pasa a la línea pieza-objetivo (ángulo T).','Real: the guns, their calibre, range, maximum elevation and rate of fire (M.A.T data sheets); and, with the source on each gun, the maximum muzzle velocity, the number and names of the charges, the shell and its mass, the traverse and the published emplacement times. From the game: the velocities of the intermediate charges, the air drag (fitted so the top charge reaches the data-sheet range) and, from them, the firing table. As in a real FDC, the observer corrects in metres on his observer-target line and the FDC converts it to the gun-target line (angle T).')+'</p>'+
  '<p>'+L('Fuentes del procedimiento: Ejército de EE. UU., FM 6-40 y TC 3-09.81 «Field Artillery Manual Cannon Gunnery»; ATP 3-09.30 «Observed Fires»; cuadrícula MGRS de 8 cifras = 10 m.','Procedure sources: US Army FM 6-40 and TC 3-09.81 “Field Artillery Manual Cannon Gunnery”; ATP 3-09.30 “Observed Fires”; 8-digit MGRS grid = 10 m.')+'</p></details>';
 h+='</div>';
 X.set(X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Artillero','Artillery')]])+h,L('Artillero','Artillery'));
 const q=s=>APP.querySelectorAll(s);
 q('[data-tab]').forEach(b=>b.onclick=()=>{ const t=b.getAttribute('data-tab'); UIT=UIT===t?null:t; intro(); });
 q('[data-m]').forEach(b=>b.onclick=()=>{ CFG.mode=b.getAttribute('data-m'); saveCfg(); UIT='mis'; intro(); });
 q('[data-g]').forEach(b=>b.onclick=()=>{ CFG.gun=b.getAttribute('data-g'); saveCfg(); intro(); });
 q('[data-c]').forEach(b=>b.onclick=()=>{ const c=CAMP.find(x=>x.id===b.getAttribute('data-c')); start(Object.assign({},c)); });
 const gb=APP.querySelector('#artgen'); if(gb) gb.onclick=()=>{ CFG.biome=APP.querySelector('#artbio').value; saveCfg(); let sd=parseInt((APP.querySelector('#artseed').value||'').replace(/\D/g,''),10); if(!(sd>0)) sd=1+Math.floor(Math.random()*999998); start({id:'g',gen:true,mode:CFG.mode,seed:sd,biome:CFG.biome||null}); };
 const mb=APP.querySelector('#artmed'); if(mb) mb.onclick=()=>{ try{ window.MAT_MED.open(); }catch(e){} };
}

/* ===== Partida ===== */
const DPR=()=>Math.min(2,window.devicePixelRatio||1);
function start(def){ stopLoop(); let gun=gunOf(CFG.gun); def=Object.assign({},def); if(!def.mode) def.mode=CFG.mode;
 let M=null, note='';
 for(let k=0;k<12;k++){ M=genMission(def); const T=M.T; const R=Math.hypot(T.e-M.bE,T.n-M.bN);
  let ok=R<=gun.r*0.97&&recommend(M,gun,T.e,T.n);
  if(!ok&&!def.gen){ const alt=GUNS.find(g=>Math.hypot(T.e-M.bE,T.n-M.bN)<=g.r*0.97&&recommend(M,g,T.e,T.n)); if(alt){ note=L('Tu pieza no llega o no tiene solución limpia en esta misión: usas el ','Your gun cannot reach or has no clean solution here: you use the ')+alt.n+'.'; gun=alt; ok=true; } }
  if(ok||!def.gen) break; def.seed=def.seed%999999+1; }
 const T=M.T; G={M:M,gun:gun,def:def,ch:0,hi:false,el:'',az:'',fat:'',plot:{e:M.bE+(T.e-M.bE)*0.45,n:M.bN+(T.n-M.bN)*0.45},plotted:false,rounds:[],hits:0,clock:0,speed:1,fly:null,done:false,log:[],zoom:1,tab:def.mode==='veterano'?'tiro':'calc',gstep:0,corr:null,armT:null,note:note,t0:performance.now(),last:performance.now(),dirty:true,flash:0};
 if(def.mode==='veterano') G.tab='tiro';
 G.ready=0; G.lastAz=null; if(T.kind==='pu') T.need=needPu(gun);
 render(); }
function nameOf(def){ if(def.gen) return L('Misión generada','Generated mission')+' nº '+def.seed; const c=CAMP.find(x=>x.id===def.id); return c?L(c.n[0],c.n[1]):''; }
function fmtClock(s){ s=Math.max(0,Math.round(s)); return 'H+'+String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0'); }
function orderText(){ const M=G.M, T=M.T; const g=grid8(T.e,T.n); const lines=[];
 lines.push(L('DE: CENTRAL DE TIRO DEL GRUPO · A: BATERÍA','FROM: BATTALION FIRE DIRECTION · TO: BATTERY'));
 lines.push(L('MISIÓN DE TIRO','FIRE MISSION')+' · '+nameOf(G.def));
 const what={pc:L('DESTRUIR PUESTO DE MANDO ENEMIGO','DESTROY ENEMY COMMAND POST'),pu:L('DESTRUIR PUENTE ('+T.need+' impactos en el tablero)','DESTROY BRIDGE ('+T.need+' hits on the span)'),ba:L('CONTRABATERÍA: BATERÍA ENEMIGA EN POSICIÓN','COUNTER-BATTERY: ENEMY BATTERY IN POSITION'),co:L('BATIR COLUMNA DE VEHÍCULOS EN MOVIMIENTO','ENGAGE MOVING VEHICLE COLUMN')}[T.kind];
 lines.push(what);
 lines.push(L('OBJETIVO: cuadrícula ','TARGET: grid ')+g+' ('+sq(T.e,T.n)+') · '+L('cota ','height ')+M.tH+' m');
 lines.push(L('BATERÍA: cuadrícula ','BATTERY: grid ')+grid8(M.bE,M.bN)+' · '+L('cota ','height ')+M.bH+' m');
 if(T.kind==='co') lines.push(L('La cabeza de la columna pasará por el punto de paso (PP, la cuadrícula del objetivo) a ','The head of the column will pass the checkpoint (PP, the target grid) at ')+fmtClock(T.tp)+L(' a 30 km/h.',' at 30 km/h.'));
 if(T.kind==='ba'&&T.timer) lines.push(L('Os han detectado: tenéis hasta ','You have been detected: you have until ')+fmtClock(T.timer)+L(' antes de que os localicen.',' before they locate you.'));
 lines.push(L('ACIERTO: a menos de ','HIT: within ')+T.rad+' m'+(T.need>1?' · '+T.need+L(' impactos',' hits'):''));
 const m=M.met; lines.push(L('METEO: viento ','MET: wind ')+m.ws+L(' m/s desde ',' m/s from ')+m4(m.wd)+' mils ('+Math.round(m.wd*360/6400)+'°) · '+L('temperatura ','temperature ')+m.T+' °C');
 lines.push(L('OBSERVADOR AVANZADO en ','FORWARD OBSERVER at ')+grid8(M.OP.e,M.OP.n)+'. '+L('Corrige en metros sobre la línea observador-objetivo (dirección OT ','Corrects in metres on the observer-target line (OT direction ')+n64(Math.round(Math.atan2(M.T.e-M.OP.e,M.T.n-M.OP.n)/M2R))+').');
 return lines.join('\n'); }
function render(){ const M=G.M, T=M.T; const ve=G.def.mode==='veterano';
 let h='<div class="artw" data-noi18n><div class="arthud"><span><b>'+esc(nameOf(G.def))+'</b></span><span>'+BION(M.biome)+'</span><span>'+esc(G.gun.n)+'</span><span id="artclk"></span><span id="artrnd"></span><span id="arttmr"></span></div>';
 if(G.note) h+='<p class="artnote">'+esc(G.note)+'</p>';
 h+='<div class="artplay"><div><details class="art-dt" id="artordd" open><summary>'+L('Orden de tiro de la central','Fire order from FDC')+' · '+KN(T.kind)+'</summary><div class="artord" id="artord">'+esc(orderText())+'</div></details>';
 h+='<div class="artmap" id="artmapw" style="margin-top:8px"><canvas id="artmap" width="600" height="600" aria-label="'+L('Mapa táctico','Tactical map')+'"></canvas></div>';
 h+='<div class="artrow"><button type="button" class="artbtn sm" id="artzoom">🔍 '+L('Zoom','Zoom')+'</button><input id="artgrid" class="artin" inputmode="numeric" placeholder="'+L('cuadrícula','grid')+' 8" style="width:9.5em"><button type="button" class="artbtn sm" id="artplot">'+L('Plotear','Plot')+'</button><button type="button" class="artbtn sm" id="artsnap">⌖ '+L('Al objetivo','On target')+'</button></div>';
 h+='<details class="art-dt"><summary>'+L('Leyenda del mapa','Map legend')+'</summary><div class="artnote" id="artleg"></div></details>';
 h+='<div class="artread" id="artread"></div><div class="artprof"><canvas id="artprof" width="600" height="170"></canvas></div><div class="artnote" id="artprofn"></div></div>';
 h+='<div><div id="artguide"></div><div id="artres"></div><div class="arttabs">'+
  '<button type="button" class="artbtn sm" data-t="tiro">'+L('Pieza','Gun')+'</button><button type="button" class="artbtn sm" data-t="tabla">'+L('Tabla de tiro','Firing table')+'</button>'+
  '<button type="button" class="artbtn sm" data-t="calc">'+(ve?L('Fórmulas','Formulas'):L('Calculadora','Calculator'))+'</button></div><div class="artcard" id="artpanel"></div>'+
  '<div class="artsec">'+L('Radio del observador','Observer radio')+'</div><div class="artlog artcard" id="artlog"></div>'+
  '<div class="artrow"><button type="button" class="artbtn" id="artmenu">‹ '+L('Menú','Menu')+'</button><button type="button" class="artbtn" id="artrst">↺ '+L('Reiniciar','Restart')+'</button></div></div></div></div>';
 X.set(X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Artillero','Artillery'),'#/artillero'],[nameOf(G.def)]])+h,L('Artillero','Artillery'));
 const $=s=>APP.querySelector(s);
 $('#artmenu').onclick=()=>{ intro(); window.scrollTo(0,0); };
 $('#artrst').onclick=()=>start(G.def);
 $('#artzoom').onclick=()=>{ G.zoom=G.zoom===1?2.6:1; G.dirty=true; };
 $('#artplot').onclick=()=>{ const p=parseGrid($('#artgrid').value); if(!p){ say(L('Escribe 8 cifras: 4 de este y 4 de norte (p. ej. ','Type 8 digits: 4 easting and 4 northing (e.g. ')+grid8(G.M.T.e,G.M.T.n)+').','bad'); return; } setPlot(p.e,p.n,true); };
 $('#artsnap').onclick=()=>{ const T=G.M.T; setPlot(T.e,T.n,true); };
 APP.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{ G.tab=b.getAttribute('data-t'); panel(); });
 $('#artleg').innerHTML=legend();
 BASE=drawBase(M);
 initMap(); panel(); logRender(); guide(); hud(); G.dirty=true; loop(); }
function legend(){ const sw=(c,t,dash)=>'<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;white-space:nowrap"><span style="display:inline-block;width:18px;height:'+(dash?2:8)+'px;background:'+c+';border-radius:2px'+(dash?';border-top:2px dashed '+c:'')+'"></span>'+t+'</span>';
 return sw('#2f5d9a',L('Batería propia','Own battery'))+sw('#b33a2a',L('Objetivo','Target'))+sw('#3c7a9a',L('Observador','Observer'))+sw('#b8452f',L('Carretera','Road'))+sw('#6f9fb8',L('Río','River'))+sw('#8a8a8a',L('Ferrocarril','Railway'))+sw('#b9c08f',L('Bosque','Forest'))+sw('#dcb3a6',L('Edificios','Buildings'))+'<br>'+L('Cuadrícula de 2 km (A–J, 1–10). Curvas de nivel cada ','2 km grid squares (A–J, 1–10). Contours every ')+contI(G.M)+' m.'; }
function contI(M){ return M.biome==='montana'?50:M.biome==='bosque'?20:10; }

/* ---- mapa base (offscreen, una vez por misión) ---- */
function drawBase(M){ const W=900; const c=document.createElement('canvas'); c.width=W; c.height=W; const x=c.getContext('2d'); const img=x.createImageData(W,W); const d=img.data; const hp=new Float32Array(W*W); const sc=MAP/W;
 for(let j=0;j<W;j++){ const n=MAP-(j+0.5)*sc; for(let i=0;i<W;i++){ hp[j*W+i]=hAt(M,(i+0.5)*sc,n,false); } }
 const ci=contI(M); const hmin=M.biome==='montana'?200:0, hmax=M.biome==='montana'?1800:600;
 for(let j=0;j<W;j++){ const n=MAP-(j+0.5)*sc; for(let i=0;i<W;i++){ const k=j*W+i, h=hp[k]; let r=235,g=227,b=204;
  if(h<0){ r=169;g=195;b=201; const w=hsh(i>>2,j>>2,3)*6; r-=w; g-=w; b-=w; }
  else { const t=clamp((h-hmin)/(hmax-hmin),0,1); r-=t*22; g-=t*30; b-=t*44;
   const hx=i<W-1?hp[k+1]:h, hy=j<W-1?hp[k+W]:h; const sh=clamp(((hx-h)-(hy-h))*-0.9/(sc/22),-18,18); r+=sh; g+=sh; b+=sh;
   const e=(i+0.5)*sc; if(M.forest(e,n)&&!bldAt(M,e,n)){ r=r*0.6+185*0.4; g=g*0.6+192*0.4; b=b*0.6+143*0.4; if(hsh(i>>1,j>>1,9)>0.82){ r-=16; g-=14; b-=18; } }
   if(Math.floor(h/ci)!==Math.floor(hx/ci)||Math.floor(h/ci)!==Math.floor(hy/ci)){ const idx=Math.floor(Math.max(h,hx,hy)/ci)%5===0; const a=idx?0.62:0.36; r=r*(1-a)+128*a; g=g*(1-a)+98*a; b=b*(1-a)+64*a; } }
  d[k*4]=r; d[k*4+1]=g; d[k*4+2]=b; d[k*4+3]=255; } }
 x.putImageData(img,0,0);
 const P=(e,n)=>[e/sc,(MAP-n)/sc]; const line=(pl,col,w,dash)=>{ x.beginPath(); pl.forEach((p,i)=>{ const q=P(p[0],p[1]); i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]); }); x.strokeStyle=col; x.lineWidth=w; x.setLineDash(dash||[]); x.stroke(); x.setLineDash([]); };
 x.lineJoin='round'; x.lineCap='round';
 M.rivers.forEach(pl=>{ line(pl,'#6f9fb8',4.2); line(pl,'#9cc0d2',1.6); });
 /* ciudad: manzanas */
 if(M.city){ const C=M.city, p=C.b+C.s; const N=Math.ceil(C.r/p)+1; for(let jj=-N;jj<=N;jj++) for(let ii=-N;ii<=N;ii++){ const e=C.e+ii*p, n=C.n+jj*p; const hb=bldAt(M,e+C.b/2,n+C.b/2); if(!hb) continue; const q=P(e,n+C.b); x.fillStyle=hb>24?'#cf9f92':'#dcb3a6'; x.fillRect(q[0],q[1],C.b/sc,C.b/sc); x.strokeStyle='#b88878'; x.lineWidth=0.6; x.strokeRect(q[0],q[1],C.b/sc,C.b/sc); } }
 M.blocks.forEach(b=>{ const q=P(b.e-b.w/2,b.n+b.h/2); x.fillStyle='#dcb3a6'; x.fillRect(q[0],q[1],b.w/sc,b.h/sc); x.strokeStyle='#b88878'; x.lineWidth=0.6; x.strokeRect(q[0],q[1],b.w/sc,b.h/sc); });
 M.rails.forEach(pl=>{ line(pl,'#7d7d7d',2.4); line(pl,'#f2efe6',1,[5,5]); });
 M.roads.forEach(pl=>{ line(pl,'#8f2f1f',3.2); line(pl,'#d4664c',1.6); });
 /* puentes: cruces carretera-río */
 M.roads.forEach(rd=>M.rivers.forEach(rv=>{ for(let i=0;i<rd.length-1;i++) for(let k=0;k<rv.length-1;k++){ const p=segX(rd[i],rd[i+1],rv[k],rv[k+1]); if(p){ const q=P(p[0],p[1]); const a=Math.atan2(rd[i+1][0]-rd[i][0],rd[i+1][1]-rd[i][1]); x.save(); x.translate(q[0],q[1]); x.rotate(a); x.fillStyle='#2b2b2b'; x.fillRect(-3.2,-6,6.4,12); x.fillStyle='#e7e0cb'; x.fillRect(-1.6,-6,3.2,12); x.restore(); } } }));
 /* rejilla */
 x.strokeStyle='rgba(60,50,35,.5)'; x.lineWidth=1; for(let k=1;k<10;k++){ const v=k*2000/sc; x.beginPath(); x.moveTo(v,0); x.lineTo(v,W); x.moveTo(0,v); x.lineTo(W,v); x.stroke(); }
 x.strokeStyle='rgba(60,50,35,.85)'; x.lineWidth=2; x.strokeRect(1,1,W-2,W-2);
 /* rótulos */
 x.textAlign='center'; x.textBaseline='middle';
 M.villages.forEach(v=>{ const q=P(v.e,v.n); x.font='bold 15px system-ui,sans-serif'; x.lineWidth=3.5; x.strokeStyle='rgba(240,234,214,.9)'; const t=v.name.toUpperCase(); x.strokeText(t,q[0],q[1]-24); x.fillStyle='#4a3826'; x.fillText(t,q[0],q[1]-24); });
 M.labels.forEach(l=>{ if(!l[3]) return; const q=P(l[0],l[1]); x.font='12px system-ui,sans-serif'; x.fillStyle='#6b5338'; x.fillText('▲ '+l[2],q[0],q[1]); });
 if(M.city){ const q=P(M.city.e,M.city.n+M.city.r+250); x.font='bold 16px system-ui,sans-serif'; x.lineWidth=4; x.strokeStyle='rgba(240,234,214,.9)'; const t=(EN()?'CITY':'CIUDAD')+' '+VNAMES[M.seed%VNAMES.length].toUpperCase(); x.strokeText(t,q[0],q[1]); x.fillStyle='#4a3826'; x.fillText(t,q[0],q[1]); }
 return c; }
function segX(a,b,c,d){ const r1=b[0]-a[0], s1=b[1]-a[1], r2=d[0]-c[0], s2=d[1]-c[1]; const den=r1*s2-s1*r2; if(Math.abs(den)<1e-9) return null; const t=((c[0]-a[0])*s2-(c[1]-a[1])*r2)/den, u=((c[0]-a[0])*s1-(c[1]-a[1])*r1)/den; if(t<0||t>1||u<0||u>1) return null; return [a[0]+r1*t,a[1]+s1*t]; }

/* ---- vista del mapa ---- */
function view(){ const span=MAP/G.zoom; let cx=MAP/2, cy=MAP/2; if(G.zoom>1){ cx=clamp(G.plot.e,span/2,MAP-span/2); cy=clamp(G.plot.n,span/2,MAP-span/2); } return {x0:cx-span/2,y0:cy-span/2,span:span}; }
function initMap(){ const cv=APP.querySelector('#artmap'); const w=Math.round(cv.getBoundingClientRect().width||360); const px=Math.round(w*DPR()); cv.width=px; cv.height=px;
 const pc=APP.querySelector('#artprof'); const pw=Math.round(pc.getBoundingClientRect().width||360); pc.width=Math.round(pw*DPR()); pc.height=Math.round(pw*DPR()*0.42);
 let drag=false; const toW=ev=>{ const r=cv.getBoundingClientRect(); const v=view(); const fx=(ev.clientX-r.left)/r.width, fy=(ev.clientY-r.top)/r.height; return {e:v.x0+fx*v.span,n:v.y0+(1-fy)*v.span}; };
 const mv=ev=>{ const p=toW(ev); const T=G.M.T; const snap=(G.zoom>1?90:260); if(Math.hypot(p.e-T.e,p.n-T.n)<snap) setPlot(T.e,T.n,false); else setPlot(clamp(p.e,0,MAP),clamp(p.n,0,MAP),false); };
 cv.addEventListener('pointerdown',ev=>{ drag=true; try{ cv.setPointerCapture(ev.pointerId); }catch(e){} mv(ev); ev.preventDefault(); });
 cv.addEventListener('pointermove',ev=>{ if(drag) mv(ev); });
 const up=()=>{ if(drag){ drag=false; G.plotted=true; panel(); guide(); } }; cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); }
function setPlot(e,n,fin){ G.plot={e:e,n:n}; G.dirty=true; readout(); if(fin){ G.plotted=true; panel(); guide(); } }
function geo(){ const M=G.M; const dE=G.plot.e-M.bE, dN=G.plot.n-M.bN; return {R:Math.hypot(dE,dN),az:n64(Math.atan2(dE,dN)/M2R),dh:hAt(M,G.plot.e,G.plot.n,true)-M.bH}; }
function readout(){ const g=geo(); const el=APP.querySelector('#artread'); if(!el) return; const ap=G.def.mode==='aprende';
 el.innerHTML=L('Ploteo','Plot')+': <b>'+grid8(G.plot.e,G.plot.n)+'</b> ('+sq(G.plot.e,G.plot.n)+') · '+L('Regla','Ruler')+': <b>'+ni(g.R)+' m</b> · '+L('Transportador','Protractor')+': <b>'+ni(g.az)+' mils</b>'+(ap||G.def.mode==='facil'?' ('+nf(g.az*360/6400,1)+'°)':'')+' · Δ'+L('cota','height')+': <b>'+sg(Math.round(g.dh))+' m</b>'; }

function W2C(v,e,n,cv){ return [(e-v.x0)/v.span*cv.width,(1-(n-v.y0)/v.span)*cv.height]; }
function drawMap(now){ const cv=APP.querySelector('#artmap'); if(!cv) return; const x=cv.getContext('2d'); const v=view(); const W=cv.width; const s=W/360;
 const bs=BASE.width/MAP; x.imageSmoothingEnabled=true; x.drawImage(BASE,v.x0*bs,(MAP-v.y0-v.span)*bs,v.span*bs,v.span*bs,0,0,W,W);
 const M=G.M, T=M.T; const P=(e,n)=>W2C(v,e,n,cv);
 /* letras y números de la cuadrícula */
 x.font='bold '+Math.round(10*s)+'px system-ui,sans-serif'; x.textAlign='center'; x.textBaseline='middle';
 for(let k=0;k<10;k++){ const ce=k*2000+1000, cn=MAP-(k*2000+1000); const a=P(ce,v.y0+v.span), b=P(v.x0,cn);
  if(a[0]>0&&a[0]<W){ x.fillStyle='rgba(240,234,214,.85)'; x.fillRect(a[0]-8*s,0,16*s,13*s); x.fillStyle='#3a2e1f'; x.fillText('ABCDEFGHIJ'[k],a[0],7*s); }
  if(b[1]>0&&b[1]<W){ x.fillStyle='rgba(240,234,214,.85)'; x.fillRect(0,b[1]-7*s,16*s,14*s); x.fillStyle='#3a2e1f'; x.fillText(String(k+1),8*s,b[1]); } }
 /* objetivo: círculo rayado */
 const tp=P(T.e,T.n), rr=Math.max(14*s,(T.kind==='co'?500:380)/v.span*W);
 x.save(); x.beginPath(); x.arc(tp[0],tp[1],rr,0,Math.PI*2); x.clip(); x.strokeStyle='rgba(179,58,42,.55)'; x.lineWidth=1.4*s; for(let k=-rr*2;k<rr*2;k+=5*s){ x.beginPath(); x.moveTo(tp[0]+k,tp[1]-rr); x.lineTo(tp[0]+k+rr,tp[1]+rr); x.stroke(); } x.restore();
 x.beginPath(); x.arc(tp[0],tp[1],rr,0,Math.PI*2); x.strokeStyle='#b33a2a'; x.lineWidth=2*s; x.stroke();
 const hitR=T.rad/v.span*W; if(hitR>3){ x.beginPath(); x.arc(tp[0],tp[1],hitR,0,Math.PI*2); x.setLineDash([3*s,3*s]); x.strokeStyle='#7a1d12'; x.lineWidth=1.2*s; x.stroke(); x.setLineDash([]); }
 x.fillStyle='#b33a2a'; x.strokeStyle='#fff'; x.lineWidth=1.2*s;
 if(T.kind==='pc'){ x.fillRect(tp[0]-7*s,tp[1]-5*s,14*s,10*s); x.strokeRect(tp[0]-7*s,tp[1]-5*s,14*s,10*s); x.fillStyle='#fff'; x.font='bold '+Math.round(7*s)+'px system-ui'; x.fillText('PC',tp[0],tp[1]+0.5); }
 else if(T.kind==='pu'){ x.save(); x.translate(tp[0],tp[1]); x.rotate(T.dir); x.fillRect(-4*s,-9*s,8*s,18*s); x.strokeRect(-4*s,-9*s,8*s,18*s); x.restore(); }
 else if(T.kind==='ba'){ for(let k=0;k<4;k++){ const q=[tp[0]+(k-1.5)*7*s,tp[1]+((k%2)?3:-3)*s]; x.beginPath(); x.arc(q[0],q[1],2.6*s,0,Math.PI*2); x.fill(); x.stroke(); } }
 else if(T.kind==='co'){ x.strokeStyle='#b33a2a'; x.lineWidth=2*s; x.beginPath(); x.moveTo(tp[0]-6*s,tp[1]-6*s); x.lineTo(tp[0]+6*s,tp[1]+6*s); x.moveTo(tp[0]+6*s,tp[1]-6*s); x.lineTo(tp[0]-6*s,tp[1]+6*s); x.stroke(); x.fillStyle='#7a1d12'; x.font='bold '+Math.round(8*s)+'px system-ui'; x.fillText('PP',tp[0]+12*s,tp[1]-8*s);
  colPos(G.clock).forEach((q,i)=>{ if(!q) return; const p=P(q[0],q[1]); x.save(); x.translate(p[0],p[1]); x.rotate(q[2]); x.fillStyle=i?'#9a3b2a':'#d0402a'; x.fillRect(-2.2*s,-3.4*s,4.4*s,6.8*s); x.restore(); }); }
 /* observador */
 const op=P(M.OP.e,M.OP.n); x.beginPath(); x.moveTo(op[0],op[1]-7*s); x.lineTo(op[0]+6*s,op[1]+4.5*s); x.lineTo(op[0]-6*s,op[1]+4.5*s); x.closePath(); x.fillStyle='rgba(60,122,154,.25)'; x.fill(); x.strokeStyle='#3c7a9a'; x.lineWidth=2*s; x.stroke();
 x.fillStyle='#3c7a9a'; x.font='bold '+Math.round(8*s)+'px system-ui'; x.fillText(L('OA','FO'),op[0],op[1]+12*s);
 /* regla y transportador */
 const bp=P(M.bE,M.bN), pp=P(G.plot.e,G.plot.n); const g=geo();
 x.strokeStyle='#1d1d1d'; x.lineWidth=1.6*s; x.setLineDash([6*s,4*s]); x.beginPath(); x.moveTo(bp[0],bp[1]); x.lineTo(pp[0],pp[1]); x.stroke(); x.setLineDash([]);
 for(let k=1000;k<g.R;k+=1000){ const f=k/g.R; const q=[bp[0]+(pp[0]-bp[0])*f,bp[1]+(pp[1]-bp[1])*f]; const nx=-(pp[1]-bp[1])/(Math.hypot(pp[0]-bp[0],pp[1]-bp[1])||1), ny=(pp[0]-bp[0])/(Math.hypot(pp[0]-bp[0],pp[1]-bp[1])||1); const L5=(k%5000===0?6:3.5)*s; x.beginPath(); x.moveTo(q[0]-nx*L5,q[1]-ny*L5); x.lineTo(q[0]+nx*L5,q[1]+ny*L5); x.stroke(); }
 const mid=[(bp[0]+pp[0])/2,(bp[1]+pp[1])/2]; x.font='bold '+Math.round(10*s)+'px system-ui'; const lt=ni(g.R)+' m'; const tw=x.measureText(lt).width; x.fillStyle='rgba(255,250,235,.92)'; x.fillRect(mid[0]-tw/2-4*s,mid[1]-8*s,tw+8*s,16*s); x.fillStyle='#1d1d1d'; x.fillText(lt,mid[0],mid[1]);
 const pr=46*s; x.beginPath(); x.arc(bp[0],bp[1],pr,0,Math.PI*2); x.strokeStyle='rgba(29,29,29,.75)'; x.lineWidth=1.2*s; x.stroke();
 for(let m=0;m<6400;m+=100){ const a=m*M2R; const Lk=(m%800===0?9:m%400===0?6:3.5)*s; x.beginPath(); x.moveTo(bp[0]+Math.sin(a)*pr,bp[1]-Math.cos(a)*pr); x.lineTo(bp[0]+Math.sin(a)*(pr-Lk),bp[1]-Math.cos(a)*(pr-Lk)); x.stroke(); }
 x.beginPath(); x.moveTo(bp[0],bp[1]); x.arc(bp[0],bp[1],pr*0.62,-Math.PI/2,-Math.PI/2+g.az*M2R,false); x.closePath(); x.fillStyle='rgba(214,178,94,.28)'; x.fill();
 x.fillStyle='#1d1d1d'; x.font=Math.round(8*s)+'px system-ui'; x.fillText('N 0',bp[0],bp[1]-pr-7*s); x.fillText('1600',bp[0]+pr+12*s,bp[1]); x.fillText('3200',bp[0],bp[1]+pr+7*s); x.fillText('4800',bp[0]-pr-12*s,bp[1]);
 const at=ni(g.az)+' mils'; x.font='bold '+Math.round(9.5*s)+'px system-ui'; const aw=x.measureText(at).width; const ap=[bp[0]+Math.sin(g.az*M2R+0.5)*pr*0.62,bp[1]-Math.cos(g.az*M2R+0.5)*pr*0.62]; x.fillStyle='rgba(255,250,235,.92)'; x.fillRect(ap[0]-aw/2-3*s,ap[1]-7*s,aw+6*s,14*s); x.fillStyle='#1d1d1d'; x.fillText(at,ap[0],ap[1]);
 /* batería propia */
 x.fillStyle='#dfe8f5'; x.fillRect(bp[0]-8*s,bp[1]-6*s,16*s,12*s); x.strokeStyle='#2f5d9a'; x.lineWidth=2*s; x.strokeRect(bp[0]-8*s,bp[1]-6*s,16*s,12*s); x.beginPath(); x.arc(bp[0],bp[1],2.6*s,0,Math.PI*2); x.fillStyle='#2f5d9a'; x.fill();
 /* cruz de ploteo */
 x.strokeStyle='#111'; x.lineWidth=1.8*s; x.beginPath(); x.arc(pp[0],pp[1],7*s,0,Math.PI*2); x.moveTo(pp[0]-13*s,pp[1]); x.lineTo(pp[0]-4*s,pp[1]); x.moveTo(pp[0]+4*s,pp[1]); x.lineTo(pp[0]+13*s,pp[1]); x.moveTo(pp[0],pp[1]-13*s); x.lineTo(pp[0],pp[1]-4*s); x.moveTo(pp[0],pp[1]+4*s); x.lineTo(pp[0],pp[1]+13*s); x.stroke();
 /* impactos */
 G.rounds.forEach((r,i)=>{ const q=P(r.E,r.N); const last=i===G.rounds.length-1&&!G.fly; const age=last?(now-r.at)/1000:9; if(age<1.6){ x.beginPath(); x.arc(q[0],q[1],(4+age*26)*s,0,Math.PI*2); x.strokeStyle='rgba(230,120,40,'+(1-age/1.6)+')'; x.lineWidth=3*s; x.stroke(); }
  x.fillStyle=r.hit?'#d03a1f':'#222'; x.beginPath(); for(let k=0;k<10;k++){ const a=k*Math.PI/5, rr2=(k%2?2.2:5.4)*s; x.lineTo(q[0]+Math.cos(a)*rr2,q[1]+Math.sin(a)*rr2); } x.closePath(); x.fill(); x.fillStyle='#111'; x.font='bold '+Math.round(8*s)+'px system-ui'; x.fillText(String(i+1),q[0]+8*s,q[1]-7*s); });
 /* proyectil en vuelo */
 if(G.fly){ const f=G.fly; const pt=pathAt(f.path,f.tt); const sn=Math.sin(f.az*M2R), cs=Math.cos(f.az*M2R); const E=M.bE+pt[0]*sn+pt[2]*cs, N=M.bN+pt[0]*cs-pt[2]*sn; const q=P(E,N); x.strokeStyle='rgba(30,30,30,.6)'; x.lineWidth=1.4*s; x.beginPath(); x.moveTo(bp[0],bp[1]); x.lineTo(q[0],q[1]); x.stroke(); x.fillStyle='#111'; x.beginPath(); x.arc(q[0],q[1],3.2*s,0,Math.PI*2); x.fill(); }
 if(G.flash>0){ x.fillStyle='rgba(255,220,150,'+G.flash*0.35+')'; x.fillRect(0,0,W,W); }
}
function pathAt(path,t){ if(!path.length) return [0,0,0,0]; let i=0; while(i<path.length-1&&path[i+1][3]<t) i++; const a=path[i], b=path[Math.min(i+1,path.length-1)]; const f=b[3]>a[3]?clamp((t-a[3])/(b[3]-a[3]),0,1):0; return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f,t]; }
function colPos(clock){ const T=G.M.T; if(T.kind!=='co') return []; const out=[]; for(let k=0;k<6;k++){ const s=T.sT-T.v*(T.tp-clock)-k*60; out.push(s<0||s>T.len?null:plAt(T.road,s)); } return out; }

/* ---- perfil lateral (2,5D) ---- */
function drawProf(now){ const cv=APP.querySelector('#artprof'); if(!cv) return; const x=cv.getContext('2d'); const W=cv.width, H=cv.height; const M=G.M; const s=W/360;
 const lastR=G.fly?G.fly:(G.rounds.length?G.rounds[G.rounds.length-1]:null); const g=geo(); const az=lastR?lastR.az:g.az; const sn=Math.sin(az*M2R), cs=Math.cos(az*M2R);
 const Rmax=Math.max(g.R,lastR?lastR.x:0)*1.08+400; const N=160; const prof=[]; let hmin=1e9,hmax=-1e9;
 for(let k=0;k<=N;k++){ const d=Rmax*k/N; const h=hAt(M,M.bE+d*sn,M.bN+d*cs,true); prof.push(h); hmin=Math.min(hmin,h); hmax=Math.max(hmax,h); }
 let top=hmax+150; const path=lastR&&lastR.path; if(path) path.forEach(p=>{ top=Math.max(top,p[1]+M.bH+150); });
 const bot=hmin-60; const X_=d=>12*s+(d/Rmax)*(W-24*s), Y_=h=>H-10*s-(h-bot)/(top-bot)*(H-26*s);
 x.fillStyle='#11130e'; x.fillRect(0,0,W,H);
 x.fillStyle='#4d4a34'; x.beginPath(); x.moveTo(X_(0),H); prof.forEach((h,k)=>x.lineTo(X_(Rmax*k/N),Y_(h))); x.lineTo(X_(Rmax),H); x.closePath(); x.fill(); x.strokeStyle='#a39a6a'; x.lineWidth=1.2*s; x.stroke();
 const tx=X_(g.R); x.strokeStyle='#d0402a'; x.lineWidth=1.5*s; x.beginPath(); x.moveTo(tx,Y_(hAt(M,G.plot.e,G.plot.n,true))); x.lineTo(tx,Y_(hAt(M,G.plot.e,G.plot.n,true))-14*s); x.stroke(); x.fillStyle='#d0402a'; x.font='bold '+Math.round(9*s)+'px system-ui'; x.textAlign='center'; x.fillText(L('OBJ','TGT'),tx,Y_(hAt(M,G.plot.e,G.plot.n,true))-19*s);
 /* pieza */
 const bx=X_(0), by=Y_(M.bH); const elv=(+G.el||0)*M2R; const ex=Math.max(1,(W-24*s)/Rmax), ey=(H-26*s)/(top-bot); const ang=Math.atan2(Math.sin(elv)*ey,Math.cos(elv)*ex);
 x.fillStyle='#b3bd8c'; x.fillRect(bx-6*s,by-6*s,12*s,6*s); x.strokeStyle='#b3bd8c'; x.lineWidth=3*s; x.beginPath(); x.moveTo(bx,by-5*s); x.lineTo(bx+Math.cos(ang)*16*s,by-5*s-Math.sin(ang)*16*s); x.stroke();
 if(path){ x.strokeStyle='rgba(214,178,94,.85)'; x.lineWidth=1.4*s; x.setLineDash([4*s,3*s]); x.beginPath(); const tt=G.fly?G.fly.tt:1e9; let started=false; for(const p of path){ if(p[3]>tt) break; const q=[X_(p[0]),Y_(p[1]+M.bH)]; started?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]); started=true; } x.stroke(); x.setLineDash([]);
  if(G.fly){ const p=pathAt(path,G.fly.tt); x.fillStyle='#fff'; x.beginPath(); x.arc(X_(p[0]),Y_(p[1]+M.bH),3*s,0,Math.PI*2); x.fill(); }
  else { const r=lastR; const q=[X_(r.x),Y_(r.y+M.bH)]; const age=(now-r.at)/1000; if(age<1.5){ x.fillStyle='rgba(240,140,60,'+(1-age/1.5)+')'; x.beginPath(); x.arc(q[0],q[1],(3+age*16)*s,0,Math.PI*2); x.fill(); } x.fillStyle='#e0e0d0'; x.font=Math.round(9*s)+'px system-ui'; x.textAlign='left'; x.fillText(L('flecha ','max ord. ')+ni(r.apex)+' m · '+L('TdV ','ToF ')+nf(r.t,1)+' s',8*s,12*s); } }
 x.textAlign='right'; x.fillStyle='#8f9380'; x.font=Math.round(8.5*s)+'px system-ui'; x.fillText(L('perfil del terreno pieza → objetivo (escala vertical exagerada)','terrain profile gun → target (vertical scale exaggerated)'),W-8*s,H-2*s); x.textAlign='center'; }

/* ---- paneles ---- */
function panel(){ const el=APP.querySelector('#artpanel'); if(!el||!G) return; APP.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('pri',b.getAttribute('data-t')===G.tab));
 if(G.tab==='tiro') el.innerHTML=panTiro(); else if(G.tab==='tabla') el.innerHTML=panTabla(); else el.innerHTML=panCalc();
 const $=s=>el.querySelector(s);
 el.querySelectorAll('[data-ch]').forEach(b=>b.onclick=()=>{ G.ch=+b.getAttribute('data-ch'); panel(); guide(); });
 el.querySelectorAll('[data-hi]').forEach(b=>b.onclick=()=>{ G.hi=b.getAttribute('data-hi')==='1'; panel(); guide(); });
 el.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{ const [k,d]=b.getAttribute('data-st').split(':'); const cur=parseFloat(G[k])||(k==='az'?Math.round(geo().az):0); G[k]=String(k==='az'?n64(cur+(+d)):Math.max(0,cur+(+d))); const i=$('#art_'+k); if(i) i.value=G[k]; G.dirty=true; guide(); });
 ['el','az','fat'].forEach(k=>{ const i=$('#art_'+k); if(i) i.oninput=()=>{ G[k]=i.value.replace(',','.'); G.dirty=true; guide(); }; });
 const f=$('#artfire'); if(f) f.onclick=()=>fire();
 const fa=$('#artarm'); if(fa) fa.onclick=()=>{ const t=parseFloat(G.fat); if(!(t>G.clock)){ say(L('La hora de fuego tiene que ser posterior a la hora actual.','The fire time must be later than now.'),'bad'); return; } G.armT=t; say(L('Fuego a la hora armado: ','Time-on-target armed: ')+fmtClock(t)+'.'); hud(); };
 const sp=$('#artfast'); if(sp) sp.onclick=()=>{ G.speed=G.speed===1?8:1; panel(); };
 const ac=$('#artapply'); if(ac) ac.onclick=()=>applyCorr();
 const tb=el.querySelector('.arttbl tr.hl'); if(tb&&tb.scrollIntoView){ const box=el.querySelector('.arttbl'); box.scrollTop=Math.max(0,tb.offsetTop-box.clientHeight/2); }
}
function chBtns(){ let h='<div class="artrow"><span class="artnote">'+L('Carga','Charge')+'</span>'; for(let c=0;c<G.gun.nz;c++) h+='<button type="button" class="artbtn sm'+(G.ch===c?' pri':'')+'" data-ch="'+c+'">'+zn(G.gun,c)+'</button>'; h+='</div><div class="artrow"><span class="artnote">'+L('Ángulo','Angle')+'</span><button type="button" class="artbtn sm'+(!G.hi?' pri':'')+'" data-hi="0">'+L('Bajo','Low')+'</button><button type="button" class="artbtn sm'+(G.hi?' pri':'')+'" data-hi="1">'+L('Alto','High')+'</button></div>'; return h; }
function stepper(k,lab,unit){ return '<label for="art_'+k+'">'+lab+'<br><span class="artnote">'+unit+'</span></label><div class="artstep"><button type="button" class="artbtn sm" data-st="'+k+':-10">−10</button><button type="button" class="artbtn sm" data-st="'+k+':-1">−1</button><input id="art_'+k+'" class="artin" inputmode="decimal" value="'+esc(G[k])+'"><button type="button" class="artbtn sm" data-st="'+k+':1">+1</button><button type="button" class="artbtn sm" data-st="'+k+':10">+10</button></div>'; }
function panTiro(){ const T=G.M.T; let h=chBtns();
 h+='<div class="artlay">'+stepper('az',L('Azimut','Azimuth'),'mils')+stepper('el',L('Elevación','Elevation'),'mils')+'</div>';
 h+='<p class="artnote">'+L('Elevación máxima de la pieza: ','Gun maximum elevation: ')+ni(elMaxMil(G.gun))+' mils'+(G.gun.el?' ('+nf(G.gun.el,1)+'°, '+L('ficha','data sheet')+')':' ('+L('la ficha no la da','not in the data sheet')+')')+'. 6.400 mils = 360°.</p>';
 if(T.kind==='co'){ h+='<div class="artlay" style="margin-top:6px"><label for="art_fat">'+L('Hora de fuego','Fire time')+' H+</label><div class="artstep"><input id="art_fat" class="artin" inputmode="numeric" value="'+esc(G.fat)+'"> <span class="artnote">s</span> <button type="button" class="artbtn sm" id="artarm">'+L('Armar','Arm')+'</button></div></div>'; }
 h+='<div class="artrow"><button type="button" class="artbtn fire" id="artfire"'+(G.fly||G.done?' disabled':'')+'>'+L('¡FUEGO!','FIRE!')+'</button>'+((T.kind==='co'||T.timer)?'<button type="button" class="artbtn sm" id="artfast">'+(G.speed>1?'⏸ ×1':'⏩ ×8')+'</button>':'')+(G.corr?'<button type="button" class="artbtn sm" id="artapply">'+L('Aplicar corrección al ploteo','Apply correction to the plot')+'</button>':'')+'</div>';
 h+='<details class="art-dt"><summary>'+L('Datos de la pieza y fuentes','Gun data and sources')+' · '+esc(G.gun.n)+'</summary>'+gunRules(G.gun)+'</details>';
 return h; }
function panTabla(){ const ve=G.def.mode==='veterano'; const TT=tableOf(G.gun,G.ch,G.hi); const R=geo().R;
 let h=chBtns()+'<p class="artnote">'+L('Tabla de tiro del juego','Game firing table')+' · '+esc(G.gun.n)+' · '+L('carga ','charge ')+zn(G.gun,G.ch)+' · '+(G.hi?L('ángulo alto','high angle'):L('ángulo bajo','low angle'))+' · '+L('alcance ','range ')+ni(TT.R0)+'–'+ni(TT.R1)+' m. <span class="artest">'+L('calculada con el modelo del juego, no es una tabla oficial','computed with the game model, not an official table')+'</span> '+L('Condiciones tipo: sin viento, 15 °C, objetivo a la cota de la pieza.','Standard conditions: no wind, 15 °C, target at the gun’s height.')+'</p>';
 h+='<div class="arttbl"><table><thead><tr><th>'+L('Alcance m','Range m')+'</th><th>'+L('Elev. mils','Elev. mils')+'</th><th>'+L('m / 1 mil','m / 1 mil')+'</th><th>'+L('TdV s','ToF s')+'</th><th>'+L('Flecha m','Max ord. m')+'</th>'+(ve||G.def.mode!=='aprende'?'<th title="">'+L('Viento cara: +m por m/s','Headwind: +m per m/s')+'</th><th>'+L('Lateral dcha.: +mils por m/s','Wind from right: +mils per m/s')+'</th><th>'+L('Temp.: m por +1 °C','Temp.: m per +1 °C')+'</th><th>'+L('Cota: mils por +10 m','Height: mils per +10 m')+'</th>':'<th>'+L('Viento cara','Headwind')+'</th><th>'+L('Lateral','Cross')+'</th><th>'+L('Temp.','Temp.')+'</th><th>'+L('Cota','Height')+'</th>')+'</tr></thead><tbody>';
 TT.rows.forEach(r=>{ const hl=Math.abs(r.R-R)<100; h+='<tr'+(hl?' class="hl"':'')+'><td>'+ni(r.R)+'</td><td>'+nf(r.el,1)+'</td><td>'+nf(Math.abs(r.dR),1)+'</td><td>'+nf(r.t,1)+'</td><td>'+ni(r.apex)+'</td><td>'+nf(r.w,1)+'</td><td>'+nf(r.x,2)+'</td><td>'+nf(r.T,1)+'</td><td>'+nf(r.h,2)+'</td></tr>'; });
 h+='</tbody></table></div><p class="artnote">'+L('Interpola entre las dos filas de tu alcance. Las correcciones se suman al alcance (viento, temperatura), a la elevación (cota) y al azimut (viento lateral).','Interpolate between the two rows around your range. Corrections add to the range (wind, temperature), the elevation (height) and the azimuth (crosswind).')+'</p>'; return h; }
function rowsCalc(p){ const tr=(a,b,c)=>'<tr'+(c?' class="fin"':'')+'><td>'+a+'</td><td>'+b+'</td></tr>'; let t='<table>';
 t+=tr(L('Alcance (regla)','Range (ruler)'),ni(p.R)+' m')+tr(L('Azimut de la cuadrícula','Grid azimuth'),nf(p.az,1)+' mils')+tr('Δ '+L('cota objetivo − pieza','height target − gun'),sg(Math.round(p.dh))+' m');
 t+=tr(L('Viento de cara','Headwind')+' '+nf(p.head,1)+' m/s × '+nf(p.cw,1),sg(Math.round(p.wr))+' m')+tr(L('Temperatura','Temperature')+' ('+G.M.met.T+' − 15) × '+nf(p.cT,1),sg(Math.round(p.Tr))+' m')+tr(L('Alcance corregido','Corrected range'),ni(p.Rc)+' m');
 t+=tr(L('Tabla','Table')+' ('+ni(p.Rc)+' m)',nf(p.tbl,1)+' mils')+tr(L('Cota','Height')+' '+sg(Math.round(p.dh))+' m ÷ 10 × '+nf(p.ch_,2),(p.elh>=0?'+':'−')+nf(Math.abs(p.elh),1)+' mils')+tr(L('ELEVACIÓN','ELEVATION'),'<b>'+Math.round(p.el)+'</b> mils',1);
 t+=tr(L('Viento lateral desde la dcha.','Wind from the right')+' '+nf(p.right,1)+' m/s × '+nf(p.cx,2),(p.xr>=0?'+':'−')+nf(Math.abs(p.xr),1)+' mils')+tr(L('AZIMUT','AZIMUTH'),'<b>'+Math.round(p.azf)%6400+'</b> mils',1)+tr(L('Tiempo de vuelo','Time of flight'),nf(p.t,1)+' s');
 return t+'</table>'; }
function panCalc(){ const ve=G.def.mode==='veterano'; let h=chBtns();
 if(ve){ h+='<div class="artnote"><p><b>'+L('Procedimiento (Central de Tiro)','Procedure (Fire Direction)')+'</b></p><p>1. '+L('Componentes del viento: cara = v·cos(viento − azimut); desde la derecha = v·sen(viento − azimut).','Wind components: head = v·cos(wind − azimuth); from the right = v·sin(wind − azimuth).')+'</p><p>2. '+L('Alcance corregido = alcance + cara × (col. viento) + (T − 15) × (col. temp.).','Corrected range = range + head × (wind col.) + (T − 15) × (temp. col.).')+'</p><p>3. '+L('Elevación = tabla(alcance corregido) + Δcota/10 × (col. cota).','Elevation = table(corrected range) + Δheight/10 × (height col.).')+'</p><p>4. '+L('Azimut = azimut + desde la derecha × (col. lateral).','Azimuth = azimuth + from the right × (cross col.).')+'</p><p>5. '+L('Mira el perfil: si la flecha no libra la cresta o los edificios, otra carga o ángulo alto.','Check the profile: if the trajectory does not clear the crest or the buildings, another charge or high angle.')+'</p><p>6. '+L('El observador corrige sobre su línea observador-objetivo (dirección OT). Pásalo a la línea pieza-objetivo con el ángulo T, o pulsa «Aplicar corrección al ploteo» y la central lo dibuja en el mapa como en el tablero de tiro. Ya sobre la línea pieza-objetivo: alarga N m → +N ÷ (m/1 mil) mils de elevación; derecha N m → +N ÷ (alcance en km) mils de azimut.','The observer corrects on his observer-target line (OT direction). Convert it to the gun-target line with angle T, or press “Apply correction to the plot” and the FDC draws it on the map as on a firing chart. Once on the gun-target line: add N m → +N ÷ (m/1 mil) mils of elevation; right N m → +N ÷ (range in km) mils of azimuth.')+'</p>'+(G.M.T.kind==='co'?'<p>7. '+L('Hora de fuego = hora de paso por el PP − tiempo de vuelo.','Fire time = time the column passes PP − time of flight.')+'</p>':'')+'<p>'+L('Cos y sen de milésimas: 1.600 mils = 90°.','Cos and sin of mils: 1,600 mils = 90°.')+'</p></div>'; return h; }
 if(!G.plotted){ return h+'<p class="artnote">'+L('Primero plotea el objetivo en el mapa (arrastra la cruz, escribe la cuadrícula o pulsa «Al objetivo»).','First plot the target on the map (drag the cross, type the grid or press “On target”).')+'</p>'; }
 const p=procedure(G.M,G.gun,G.ch,G.hi,G.plot.e,G.plot.n); const rc=recommend(G.M,G.gun,G.plot.e,G.plot.n);
 h+='<p class="artnote">'+L('Calculadora de la Central de Tiro. ','Fire-direction calculator. ')+(rc?L('Carga recomendada: ','Recommended charge: ')+'<b>'+zn(G.gun,rc.ch)+' · '+(rc.hi?L('ángulo alto','high angle'):L('ángulo bajo','low angle'))+'</b>':L('Ninguna carga libra el terreno con esta pieza.','No charge clears the terrain with this gun.'))+'</p>';
 if(p.out){ h+='<p class="artnote">'+L('Con esta carga y ángulo el objetivo queda fuera de la tabla. Cambia de carga.','With this charge and angle the target is outside the table. Change the charge.')+'</p>'; return h; }
 h+='<div class="artcalc">'+rowsCalc(p)+'</div>';
 if(p.el>elMaxMil(G.gun)) h+='<p class="artnote">⚠ '+L('Supera la elevación máxima de la pieza.','Above the gun’s maximum elevation.')+'</p>';
 else { const r=shoot(G.M,G.gun,G.ch,Math.round(p.el),Math.round(p.azf)); const d=Math.hypot(r.E-G.plot.e,r.N-G.plot.n); h+='<p class="artnote">'+(d<G.M.T.rad?'✔ '+L('La trayectoria libra el terreno.','The trajectory clears the terrain.'):'⚠ '+L('Con estos datos la trayectoria choca con el terreno o un edificio antes de llegar: elige otra carga o ángulo alto.','With these data the trajectory hits the terrain or a building first: choose another charge or high angle.'))+'</p>'; }
 if(G.M.T.kind==='co') h+='<p class="artnote">'+L('Hora de fuego = ','Fire time = ')+fmtClock(G.M.T.tp)+' − '+nf(p.t,1)+' s = <b>'+fmtClock(G.M.T.tp-p.t)+'</b></p>';
 return h; }

/* ---- disparo ---- */
function fire(){ if(G.fly||G.done) return; const el=parseFloat(G.el), az=parseFloat(G.az);
 if(!(el>0)||!(az>=0)||az>=6400){ say(L('Pon la elevación y el azimut en milésimas antes de disparar.','Set the elevation and the azimuth in mils before firing.'),'bad'); return; }
 if(el>elMaxMil(G.gun)){ say(L('La pieza no eleva tanto: máximo ','The gun cannot elevate that far: maximum ')+ni(elMaxMil(G.gun))+' mils.','bad'); return; }
 const wait=Math.max(0,(G.ready||0)-G.clock); let trail=0; if(G.gun.trav&&G.lastAz!=null){ let dz=Math.abs(az-G.lastAz); dz=Math.min(dz,6400-dz); if(dz>G.gun.trav) trail=TRAIL; }
 if(wait>0.05) say(L('Recargando: el disparo sale ','Reloading: the round leaves ')+nf(wait,1)+L(' s más tarde (cadencia de la ficha: ',' s later (data-sheet rate of fire: ')+G.gun.rpm+L('/min).','/min).'));
 if(trail) say(L('Giras más de '+G.gun.trav+' mils: la dotación mueve las colas (+'+TRAIL+' s, valor del juego).','You traverse more than '+G.gun.trav+' mils: the crew shifts the trails (+'+TRAIL+' s, game value).'));
 G.clock+=wait+trail; G.ready=G.clock+reloadOf(G.gun); G.lastAz=az;
 if(!G.rounds.length){ const od=APP.querySelector('#artordd'); if(od&&innerWidth<900) od.open=false; }
 const r=shoot(G.M,G.gun,G.ch,el,az,true); r.az=az; r.el=el; r.ch=G.ch; r.hi=G.hi; r.ft=G.clock;
 G.fly={path:r.path,res:r,az:az,tt:0,T:r.t,dur:(window.__ART&&window.__ART.fast)?0.2:clamp(r.t/14,2.2,3.8),t0:performance.now()}; G.flash=1; G.armT=null;
 say(L('Disparo ','Round ')+(G.rounds.length+1)+': '+L('carga ','charge ')+zn(G.gun,G.ch)+', '+L('elevación ','elevation ')+nf(el,1)+', '+L('azimut ','azimuth ')+nf(az,1)+' mils. '+L('Tiempo de vuelo ','Time of flight ')+nf(r.t,1)+' s.'); panel(); }
function land(){ const f=G.fly; const r=f.res; G.fly=null; r.at=performance.now(); const M=G.M, T=M.T;
 let tgt=[T.e,T.n]; if(T.kind==='co'){ const cp=colPos(G.clock); let best=1e9; cp.forEach(q=>{ if(!q) return; const d=Math.hypot(r.E-q[0],r.N-q[1]); if(d<best){ best=d; tgt=[q[0],q[1]]; } }); if(!cp[0]) tgt=[T.e,T.n]; }
 const R=Math.hypot(tgt[0]-M.bE,tgt[1]-M.bN), ux=(tgt[0]-M.bE)/R, uy=(tgt[1]-M.bN)/R; const dx=r.E-tgt[0], dy=r.N-tgt[1]; const dR=dx*ux+dy*uy, dL=dx*uy-dy*ux; const d=Math.hypot(dx,dy);
 r.hit=d<=T.rad; G.rounds.push(r);
 const masked=r.x<Math.hypot(G.plot.e-M.bE,G.plot.n-M.bN)-400;
 if(r.hit){ G.hits++; G.corr=null; if(G.hits>=T.need){ say(L('¡Impacto! Objetivo destruido a ','Hit! Target destroyed ')+ni(d)+L(' m del centro.',' m from the centre.'),'ok'); end(true); }
  else say(L('Impacto en el tablero (','Hit on the span (')+G.hits+'/'+T.need+L('). Fuego por eficacia: repite los mismos datos.','). Fire for effect: repeat the same data.'),'ok'); }
 else { const RO=Math.hypot(tgt[0]-M.OP.e,tgt[1]-M.OP.n)||1, ox=(tgt[0]-M.OP.e)/RO, oy=(tgt[1]-M.OP.n)/RO; const oR=dx*ox+dy*oy, oL=dx*oy-dy*ox;
  const add=-Math.round(oR/10)*10, right=-Math.round(oL/10)*10; const otd=n64(Math.round(Math.atan2(ox,oy)/M2R)); const gtd=n64(Math.round(Math.atan2(ux,uy)/M2R)); let angT=Math.abs(otd-gtd); angT=Math.min(angT,6400-angT);
  G.corr={add:add,right:right,ot:otd,angT:angT,gAdd:-Math.round(dR/10)*10,gRight:-Math.round(dL/10)*10};
  let t=L('Observador (dirección OT ','Observer (OT direction ')+otd+'): '+(add?(add>0?L('alarga ','add ')+add:L('acorta ','drop ')+(-add)):'')+(add&&right?', ':'')+(right?(right>0?L('derecha ','right ')+right:L('izquierda ','left ')+(-right)):'')+(add||right?'':L('en línea','on line'))+'.';
  if(G.def.mode!=='veterano') t+=' '+L('Central (ángulo T ','FDC (angle T ')+angT+L(' mils), sobre la línea pieza-objetivo: ',' mils), on the gun-target line: ')+(G.corr.gAdd>=0?'+':'')+G.corr.gAdd+(G.corr.gRight?', '+(G.corr.gRight>0?L('dcha. ','R ')+G.corr.gRight:L('izq. ','L ')+(-G.corr.gRight)):'')+'.';
  if(masked) t+=' '+(M.city&&bldAt(M,r.E,r.N)?L('Ha dado en un edificio antes del objetivo: sube la trayectoria (otra carga o ángulo alto).','It hit a building short of the target: raise the trajectory (another charge or high angle).'):L('Ha dado en el terreno antes del objetivo: no libra la cresta. Otra carga o ángulo alto.','It hit the ground short of the target: it does not clear the crest. Another charge or high angle.'));
  if(T.kind==='pu'&&d<T.rad*2.5) t+=' '+L('Muy cerca del puente.','Very close to the bridge.');
  say(t,'bad'); }
 G.dirty=true; panel(); guide(); hud(); }
function applyCorr(){ if(!G.corr) return; const ux=Math.sin(G.corr.ot*M2R), uy=Math.cos(G.corr.ot*M2R);
 setPlot(G.plot.e+ux*G.corr.add+uy*G.corr.right,G.plot.n+uy*G.corr.add-ux*G.corr.right,true); say(L('Ploteo corregido: ','Plot corrected: ')+grid8(G.plot.e,G.plot.n)+L('. Vuelve a calcular los datos.','. Work out the data again.')); G.corr=null; panel(); }
function end(win,why){ if(G.done) return; G.done=true; const M=G.M, T=M.T, n=G.rounds.length; const st=!win?0:(n<=T.need?3:n<=T.need+2?2:1); const sc=win?Math.max(100,1000-150*(n-T.need)-Math.floor(G.clock/10)):0;
 const id=G.def.gen?'g':G.def.id; if(win&&id!=='g'){ const B=bests(); if(!B[id]||B[id].s<st||(B[id].s===st&&B[id].p<sc)) B[id]={s:st,p:sc}; saveBests(B); }
 const first=win&&n===T.need;
 try{ window.MAT_MED&&window.MAT_MED.event('art.fin',{mode:G.def.mode,kind:T.kind,win:!!win,rounds:n,first:first,gen:!!G.def.gen,crest:!!(win&&M.biome==='montana'),cb:!!(win&&T.kind==='ba'&&T.timer>0),lesson:G.def.lesson||0}); }catch(_){}
 const box=APP.querySelector('#artres'); if(box){ box.innerHTML='<div class="artcard artend"><div class="st">'+(win?stars(st):'✖')+'</div><h3>'+(win?L('MISIÓN CUMPLIDA','MISSION ACCOMPLISHED'):L('MISIÓN FALLIDA','MISSION FAILED'))+'</h3><p class="artnote">'+(win?L('Disparos: ','Rounds: ')+n+' · '+L('tiempo ','time ')+fmtClock(G.clock)+' · '+L('puntos ','points ')+sc:esc(why||''))+'</p><div class="artrow" style="justify-content:center"><button type="button" class="artbtn" id="artagain">↺ '+L('Repetir','Replay')+'</button>'+(G.def.gen?'<button type="button" class="artbtn pri" id="artnext">'+L('Nueva misión','New mission')+'</button>':nextCamp()?'<button type="button" class="artbtn pri" id="artnext">'+L('Siguiente misión','Next mission')+' ›</button>':'')+'<button type="button" class="artbtn" id="artmenu2">'+L('Menú','Menu')+'</button></div></div>';
  box.querySelector('#artagain').onclick=()=>start(G.def); box.querySelector('#artmenu2').onclick=()=>intro(); const nx=box.querySelector('#artnext'); if(nx) nx.onclick=()=>{ if(G.def.gen) start({id:'g',gen:true,mode:G.def.mode,seed:1+Math.floor(Math.random()*999998),biome:CFG.biome||null}); else start(Object.assign({},nextCamp())); };
  try{ box.scrollIntoView({block:'nearest'}); }catch(e){} }
 panel(); guide(); }
function nextCamp(){ const i=CAMP.findIndex(c=>c.id===G.def.id); return i>=0&&CAMP[i+1]&&CAMP[i+1].mode===G.def.mode?CAMP[i+1]:null; }
function say(t,cls){ G.log.push([t,cls||'']); logRender(); }
function logRender(){ const el=APP.querySelector('#artlog'); if(!el) return; el.innerHTML=G.log.length?G.log.slice(-12).map(l=>'<p class="'+l[1]+'">'+esc(l[0])+'</p>').join(''):'<p>'+L('Esperando datos de tiro…','Waiting for firing data…')+'</p>'; el.scrollTop=el.scrollHeight; }
function hud(){ const c=APP.querySelector('#artclk'); if(c) c.innerHTML='⏱ <b>'+fmtClock(G.clock)+'</b>'; const r=APP.querySelector('#artrnd'); if(r) r.innerHTML=L('Disparos','Rounds')+' <b>'+G.rounds.length+'</b>'+(G.M.T.need>1?' · '+L('impactos','hits')+' <b>'+G.hits+'/'+G.M.T.need+'</b>':'');
 const t=APP.querySelector('#arttmr'); if(t){ const T=G.M.T; t.innerHTML=T.timer?'⚠ '+L('os localizan en ','located in ')+'<b>'+fmtClock(Math.max(0,T.timer-G.clock)).slice(2)+'</b>':T.kind==='co'?L('paso por PP ','PP at ')+'<b>'+fmtClock(T.tp)+'</b>'+(G.armT?' · '+L('armado ','armed ')+fmtClock(G.armT):''):''; } }

/* ---- Aprende: guía paso a paso ---- */
function lessonData(){ const M=G.M, T=M.T, gun=G.gun; const rc=recommend(M,gun,T.e,T.n); const ch=rc?rc.ch:0, hi=rc?rc.hi:false; const p=procedure(M,gun,ch,hi,T.e,T.n); const TT=tableOf(gun,ch,hi); const row=tInterp(TT,p.R);
 const i=clamp(Math.floor((p.R-TT.R0)/100),0,TT.rows.length-2); return {ch:ch,hi:hi,p:p,row:row,a:TT.rows[i],b:TT.rows[i+1],TT:TT}; }
function guide(){ const box=APP.querySelector('#artguide'); if(!box||!G) return; if(G.def.mode!=='aprende'){ box.innerHTML=''; return; }
 const M=G.M, T=M.T, ls=G.def.lesson||1, D=G.LD||(G.LD=lessonData()); const p=D.p; const g=geo(); const onT=Math.hypot(G.plot.e-T.e,G.plot.n-T.n)<40;
 const near=(v,t)=>Math.abs(parseFloat(v)-t)<=1.01;
 const base1={el:Math.round(D.row.el),az:Math.round(p.az)};
 const steps=[];
 steps.push({t:L('Te llega la orden de tiro (arriba). Busca el objetivo: cuadrícula ','The fire order is in (above). Find the target: grid ')+grid8(T.e,T.n)+' ('+sq(T.e,T.n)+L('). Cada cuadro mide 2 km; las 4 primeras cifras son el este y las 4 últimas el norte, en decenas de metro.','). Each square is 2 km; the first 4 digits are easting and the last 4 northing, in tens of metres.'),ok:()=>true,btn:1});
 steps.push({t:L('Plotea el objetivo: arrastra la cruz sobre el círculo rojo, escribe la cuadrícula y pulsa «Plotear», o pulsa «Al objetivo».','Plot the target: drag the cross onto the red circle, type the grid and press “Plot”, or press “On target”.'),ok:()=>onT&&G.plotted});
 steps.push({t:L('La regla da el alcance: ','The ruler gives the range: ')+'<b>'+ni(p.R)+' m</b>. '+L('El transportador da el azimut desde el norte: ','The protractor gives the azimuth from north: ')+'<b>'+ni(p.az)+' mils</b> ('+nf(p.az*360/6400,1)+'°). '+L('La artillería mide en milésimas: 6.400 por vuelta; 1 mil a 1 km son unos 1 m de lado.','Artillery measures in mils: 6,400 per circle; 1 mil at 1 km is about 1 m sideways.'),ok:()=>true,btn:1});
 if(ls===3) steps.push({t:L('Mira el perfil de abajo: entre la pieza y el objetivo hay una sierra. Con la carga más fuerte la trayectoria es tensa y choca con ella. La columna «Flecha» de la tabla dice la altura máxima del proyectil: tiene que pasar por encima. Por eso eliges una carga baja (la trayectoria sube más) o el ángulo alto.','Look at the profile below: there is a ridge between the gun and the target. With the strongest charge the trajectory is flat and hits it. The “Max ord.” column in the table tells you the shell’s maximum height: it has to clear the ridge. So you pick a low charge (the trajectory climbs higher) or high angle.'),ok:()=>true,btn:1});
 steps.push({t:L('Elige la carga ','Choose charge ')+'<b>'+zn(G.gun,D.ch)+'</b>'+L(' y ángulo ',' and ')+(D.hi?L('alto','high angle'):L('bajo','low angle'))+L(' (pestaña «Pieza»): es la más baja que alcanza y libra el terreno.',' (“Gun” tab): it is the lowest that reaches and clears the terrain.'),ok:()=>G.ch===D.ch&&G.hi===D.hi});
 if(ls===1){ steps.push({t:L('Abre «Tabla de tiro». Tu alcance, ','Open “Firing table”. Your range, ')+ni(p.R)+L(' m, cae entre las filas ',' m, falls between the rows ')+ni(D.a.R)+' ('+nf(D.a.el,1)+' mils) '+L('y','and')+' '+ni(D.b.R)+' ('+nf(D.b.el,1)+' mils). '+L('Interpolando: ','Interpolating: ')+'<b>'+nf(D.row.el,1)+' mils</b>. '+L('Este primer disparo es de reglaje: lo hacemos solo con la tabla, sin corregir viento ni cota; el observador nos dirá cuánto falla.','This first round is an adjusting round: table only, no wind or height correction; the observer will tell us how far off it is.'),ok:()=>true,btn:1});
  steps.push({t:L('Apunta la pieza: azimut ','Lay the gun: azimuth ')+'<b>'+base1.az+'</b>'+L(' y elevación ',' and elevation ')+'<b>'+base1.el+'</b> mils.',ok:()=>near(G.el,base1.el)&&near(G.az,base1.az)});
  steps.push({t:L('¡Fuego! Pulsa el botón rojo y mira el tiempo de vuelo.','Fire! Press the red button and watch the time of flight.'),ok:()=>G.rounds.length>=1});
  const r1=G.rounds[0]; const c0=G.corr||{gAdd:0,gRight:0}, c={add:c0.gAdd||0,right:c0.gRight||0}; const el2=base1.el+(c.add/(Math.abs(D.row.dR)||1)), az2=base1.az+c.right/(p.R/1000)*1.0186;
  steps.push({t:L('El observador corrige sobre su línea observador-objetivo; la central lo pasa a la línea pieza-objetivo. Para ','The observer corrects on his observer-target line; the FDC converts it to the gun-target line. To ')+(c.add>=0?L('alargar ','add ')+c.add:L('acortar ','drop ')+(-c.add))+L(' m: divide entre la columna «m / 1 mil» (',' m: divide by the “m / 1 mil” column (')+nf(Math.abs(D.row.dR),1)+') = '+sg(Math.round(c.add/(Math.abs(D.row.dR)||1)))+L(' mils → elevación ',' mils → elevation ')+'<b>'+Math.round(el2)+'</b>. '+(c.right?L('Lateral: ','Sideways: ')+c.right+' m ÷ '+nf(p.R/1000,1)+' km = '+sg(Math.round(c.right/(p.R/1000)*1.0186))+' mils → '+L('azimut ','azimuth ')+'<b>'+Math.round(az2)+'</b>. ':L('Lateral: nada, el azimut se queda en ','Sideways: nothing, the azimuth stays at ')+'<b>'+base1.az+'</b>. ')+L('Pon los nuevos datos y dispara.','Set the new data and fire.'),ok:()=>G.hits>=1||G.done});
 } else {
  steps.push({t:L('Calculadora (o hazlo a mano con la tabla): ','Calculator (or do it by hand with the table): ')+L('el viento de ','the wind of ')+M.met.ws+' m/s '+L('desde ','from ')+m4(M.met.wd)+L(' mils te da ',' mils gives ')+nf(p.head,1)+L(' m/s de cara (alarga ',' m/s headwind (add ')+Math.round(p.wr)+' m) '+L('y ','and ')+nf(p.right,1)+L(' m/s desde la derecha (',' m/s from the right (')+sg(Math.round(p.xr))+' mils). '+L('La temperatura de ','The temperature of ')+M.met.T+' °C '+L('cambia ','changes ')+sg(Math.round(p.Tr))+L(' m. Alcance corregido ',' m. Corrected range ')+ni(p.Rc)+' m → '+L('tabla ','table ')+nf(p.tbl,1)+' mils; '+L('la cota (','height (')+sg(Math.round(p.dh))+' m) '+L('suma ','adds ')+nf(p.elh,1)+' mils.',ok:()=>true,btn:1});
  steps.push({t:L('Apunta la pieza: azimut ','Lay the gun: azimuth ')+'<b>'+Math.round(p.azf)+'</b>'+L(' y elevación ',' and elevation ')+'<b>'+Math.round(p.el)+'</b> mils.',ok:()=>near(G.el,Math.round(p.el))&&near(G.az,Math.round(p.azf))});
  steps.push({t:L('¡Fuego! Con todo corregido, el primer disparo entra.','Fire! With everything corrected, the first round goes in.'),ok:()=>G.rounds.length>=1});
  if(T.need>1) steps.push({t:L('Fuego por eficacia: el puente necesita ','Fire for effect: the bridge needs ')+T.need+L(' impactos. Como el cálculo es bueno, repite los mismos datos.',' hits. Since the calculation is good, repeat the same data.'),ok:()=>G.hits>=T.need||G.done});
 }
 steps.push({t:G.done?L('¡Hecho! Así trabaja una batería: orden, ploteo, tabla, pieza, observador. Prueba la siguiente lección o el nivel Fácil.','Done! That is how a battery works: order, plot, table, gun, observer. Try the next lesson or Easy level.'):L('Termina la misión.','Finish the mission.'),ok:()=>false});
 while(G.gstep<steps.length-1&&!steps[G.gstep].btn&&steps[G.gstep].ok()) G.gstep++;
 const s=steps[Math.min(G.gstep,steps.length-1)];
 box.innerHTML='<div class="artguide"><h4>'+L('Lección ','Lesson ')+ls+' · '+L('paso ','step ')+(Math.min(G.gstep,steps.length-1)+1)+'/'+steps.length+'</h4><div>'+s.t+'</div>'+(s.btn?'<div class="artrow"><button type="button" class="artbtn pri sm" id="artgnext">'+L('Entendido','Got it')+' ›</button></div>':'')+'</div>';
 const b=box.querySelector('#artgnext'); if(b) b.onclick=()=>{ G.gstep++; guide(); }; }

/* ---- bucle ---- */
function loop(){ stopLoop(); const step=()=>{ RAF=0; if(!G||!APP.querySelector('#artmap')) return; const now=performance.now(); const dt=Math.min(0.1,(now-G.last)/1000); G.last=now; const T=G.M.T;
  if(!G.done){ if(G.fly){ const f=G.fly; const u=(now-f.t0)/1000/f.dur; const nt=Math.min(f.T,u*f.T); G.clock+=nt-f.tt; f.tt=nt; if(u>=1) land(); }
   else { G.clock+=dt*G.speed; if(G.armT!=null&&G.clock>=G.armT){ G.clock=G.armT; fire(); } }
   if(T.timer&&G.clock>=T.timer&&!G.fly) end(false,L('La batería enemiga os ha localizado. Cambiad de asentamiento.','The enemy battery has located you. Displace to a new position.'));
   if(T.kind==='co'&&!G.fly){ const s=T.sT-T.v*(T.tp-G.clock); if(s>Math.min(T.len-50,T.sT+3000)) end(false,L('La columna ha salido de la zona.','The column has left the area.')); }
   G.dirty=true; }
  if(G.flash>0) G.flash=Math.max(0,G.flash-dt*3);
  if(G.dirty){ drawMap(now); drawProf(now); G.dirty=!!(G.fly||G.flash>0||G.rounds.length&&now-G.rounds[G.rounds.length-1].at<1700); readout(); }
  if(!G.hudT||now-G.hudT>250){ G.hudT=now; hud(); }
  RAF=requestAnimationFrame(step); }; RAF=requestAnimationFrame(step); }

/* QA / vídeo: acceso de solo lectura al estado y a la solución de la Central de Tiro */
if(typeof window!=='undefined') window.__ART={state:()=>G,solve:()=>{ if(!G) return null; const T=G.M.T; const rc=recommend(G.M,G.gun,T.e,T.n); if(!rc) return null; const raw=tInterp(tableOf(G.gun,rc.ch,rc.hi),rc.p.R); return {ch:rc.ch,hi:rc.hi,el:Math.round(rc.p.el),az:Math.round(rc.p.azf)%6400,t:rc.p.t,tp:T.tp,rawEl:raw?Math.round(raw.el):null,rawAz:Math.round(rc.p.az)%6400}; },start:d=>start(d),camp:CAMP,guns:GUNS};

export function route(app,x){ APP=app; X=x; css(); CFG=loadCfg(); stopLoop(); intro(); window.scrollTo(0,0); }
