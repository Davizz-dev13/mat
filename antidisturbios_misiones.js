/* M.A.T · Antidisturbios: misiones especiales (escolta del autobús del equipo, visita oficial) y Caballería de la Policía Nacional.
   Calles y edificios reales de Madrid de OpenStreetMap (© OpenStreetMap contributors, ODbL).
   Funciones de la Caballería: folleto oficial de la Policía Nacional (Comisaría General de Seguridad Ciudadana). Controles y registros: LO 4/2015 arts. 17, 18 y 20 (BOE).
   El comportamiento de la gente, los tiempos de control, las velocidades y la puntuación son estimaciones de M.A.T para el juego (se marcan «Estimación»). Sin dados: la misma partida se repite igual
   y una decisión correcta siempre funciona. */
const EN=()=>window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const CELL=2, DT=0.2;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
let C=null, G=null, CV=null, CTX=null, RAF=0, LAST=0, BOUND=false;
const ENT_MAYOR=[{"x": 491, "y": 251, "ix": 485, "iy": 258, "q": [491, 251, 489, 249, 487, 247, 487, 237, 485, 235, 485, 227, 483, 225, 483, 223, 483, 221, 469, 207, 467, 207, 465, 207], "c": "NE"}, {"x": 427, "y": 253, "ix": 430, "iy": 261, "q": [427, 253, 425, 233, 411, 219, 411, 217, 419, 201, 427, 191, 435, 175, 445, 161, 447, 155], "c": "N"}, {"x": 401, "y": 255, "ix": 407, "iy": 262, "q": [401, 255, 397, 249, 397, 239, 385, 227, 379, 227], "c": "NO"}, {"x": 523, "y": 271, "ix": 515, "iy": 275, "q": [523, 271, 529, 267, 543, 267, 545, 265, 547, 265, 555, 257, 583, 243, 593, 233, 595, 233, 597, 233, 617, 217, 619, 217, 643, 195], "c": "NE"}, {"x": 373, "y": 275, "ix": 381, "iy": 278, "q": [373, 275, 365, 269, 349, 265, 325, 241, 317, 241], "c": "O"}, {"x": 525, "y": 309, "ix": 516, "iy": 309, "q": [525, 309, 527, 311, 535, 311, 537, 313, 551, 313, 553, 315, 563, 315, 565, 317, 567, 319, 577, 319, 579, 321, 581, 321, 583, 321, 605, 343, 607, 343], "c": "E"}, {"x": 527, "y": 341, "ix": 519, "iy": 337, "q": [527, 341, 529, 343, 531, 345, 541, 349, 575, 383], "c": "SE"}, {"x": 503, "y": 361, "ix": 497, "iy": 355, "q": [503, 361, 505, 363, 505, 365, 505, 367, 497, 375, 497, 377, 497, 379, 473, 403, 471, 409, 461, 419], "c": "SE"}, {"x": 395, "y": 367, "ix": 401, "iy": 360, "q": [395, 367, 395, 369, 395, 371, 379, 387], "c": "SO"}, {"x": 427, "y": 367, "ix": 430, "iy": 358, "q": [427, 367, 433, 375, 435, 395, 437, 397, 437, 411, 439, 413, 439, 421, 449, 431, 459, 431], "c": "S"}];
const PLAZA_MAYOR=[503, 346, 513, 346, 507, 262, 387, 269, 393, 353, 425, 352, 437, 350, 437, 351, 503, 346];
const VIS_RES=1; /* acceso reservado a la autoridad (el del norte) */
const SRC=[
 ['Policía Nacional, Comisaría General de Seguridad Ciudadana: «Unidades de Caballería» (folleto oficial, NIPO 126-18-080-3)','https://www.policia.es/miscelanea/estructura/dao/seguridad_ciudadana/normativa/caballeria.pdf'],
 ['BOE: Ley Orgánica 4/2015, de protección de la seguridad ciudadana (arts. 17, 18 y 20)','https://www.boe.es/buscar/act.php?id=BOE-A-2015-3442'],
 ['BOE: Ley Orgánica 2/1986, de Fuerzas y Cuerpos de Seguridad (art. 5: congruencia, oportunidad y proporcionalidad)','https://www.boe.es/buscar/act.php?id=BOE-A-1986-6859'],
 ['Policía Nacional (vídeo oficial): Caballería y UIP escoltan la llegada de un equipo al estadio','https://www.tiktok.com/@policia/video/7481010791764823318'],
 ['OpenStreetMap (calles y edificios de Madrid, ODbL)','https://www.openstreetmap.org/copyright']];
function datos(){ const es=!EN(); let h='<details class="ad-datos mi-datos"><summary>'+L('Datos reales de estas misiones y fuentes','Real data for these missions and sources')+'</summary><ul>';
 const P=es?[
  'La <b>Caballería</b> de la Policía Nacional forma parte de la Jefatura de Unidades Especiales de la Comisaría General de Seguridad Ciudadana. Entre sus funciones oficiales: dispositivos de seguridad en grandes eventos (también deportivos), protección estática y dinámica de personas y bienes, y restablecimiento de la seguridad ciudadana en graves alteraciones, en colaboración con otras unidades [1].',
  'Según la Policía Nacional, la patrulla a caballo, «por su posición elevada», tiene mejor observación del entorno y es un punto de referencia [1]. Su antecedente es el Regimiento de Caballería «Celadores Reales», creado el 1 de septiembre de 1825: la unidad más antigua del Cuerpo [1].',
  'La Policía Nacional ha difundido escoltas de Caballería y UIP a la llegada de un equipo al estadio [4]. En el juego el equipo es genérico («el autobús del equipo local») y la ruta es <b>plausible</b>, no la oficial.',
  'Controles en la vía pública y zonas de seguridad: art. 17 LO 4/2015. Comprobaciones y ocupación temporal de objetos peligrosos: art. 18. Registro corporal externo (cacheo): art. 20, solo con indicios racionales, por un agente del mismo sexo, con injerencia mínima [2].',
  'Principios de actuación: congruencia, oportunidad y proporcionalidad (art. 5 LO 2/1986) [3].',
  '<b>Estimación de M.A.T</b> (no son datos oficiales): número de agentes y caballos por unidad, velocidades, tiempos de cada control, alcance de visión y la puntuación. Los puntos débiles de los caballos (calles estrechas y objetos lanzados) son reglas del juego.']:[
  'The National Police <b>Mounted Unit</b> belongs to the Special Units HQ of the General Commissariat for Public Safety. Its official tasks include security operations at large events (sport included), static and mobile protection of people and property, and restoring public safety in serious disturbances together with other units [1].',
  'According to the National Police, a mounted patrol, «from its elevated position», has a better view of its surroundings and is a point of reference [1]. Its forerunner is the «Celadores Reales» cavalry regiment, created on 1 September 1825: the oldest unit of the force [1].',
  'The National Police has published mounted and UIP escorts of a team arriving at the stadium [4]. In the game the team is generic («the home team bus») and the route is <b>plausible</b>, not the official one.',
  'Checkpoints on public roads and security zones: art. 17 LO 4/2015. Checks and temporary seizure of dangerous objects: art. 18. External body search (pat-down): art. 20, only with reasonable grounds, by an officer of the same sex, with minimum intrusion [2].',
  'Principles: congruence, timeliness and proportionality (art. 5 LO 2/1986) [3].',
  '<b>M.A.T estimate</b> (not official data): officers and horses per unit, speeds, time per check, sight range and the score. The horses\' weak points (narrow streets and thrown objects) are game rules.'];
 h+=P.map(p=>'<li>'+p+'</li>').join('')+'</ul><ol class="mi-src">'+SRC.map(s=>'<li><a href="'+s[1]+'" target="_blank" rel="noopener">'+esc(s[0])+'</a></li>').join('')+'</ol><p class="ad-osm">'+L('Mapas: calles y edificios reales de Madrid de OpenStreetMap.','Maps: real Madrid streets and buildings from OpenStreetMap.')+' © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL).</p></details>'; return h; }
const CSS='.mi-cv{position:relative;touch-action:none;user-select:none;-webkit-user-select:none;border-radius:var(--r);overflow:hidden;background:#3c4046;margin:6px 0}.mi-cv canvas{display:block}.mi-zm{position:absolute;right:6px;top:6px;display:flex;flex-direction:column;gap:6px}.mi-zm button{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:rgba(20,22,26,.75);color:#fff;font-size:20px;font-weight:700}'+
 '.mi-hud{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;margin:6px 0 0}.mi-hud b{font-variant-numeric:tabular-nums}.mi-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.mi-chip{display:inline-flex;align-items:center;gap:6px;background:var(--s2);color:var(--tx);border:1px solid var(--line);border-radius:999px;padding:6px 11px;font:inherit;font-size:13px;font-weight:700;min-height:38px;cursor:pointer}.mi-chip i{display:inline-block;width:12px;height:12px;border-radius:50%}.mi-chip.on{border-color:#e8c547;box-shadow:0 0 0 2px rgba(232,197,71,.35)}.mi-chip.off{opacity:.55}'+
 '.mi-ord{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:6px 0}.mi-ord .ad-btn{white-space:normal;line-height:1.15;font-weight:700;font-size:13px}.mi-ord .ad-btn small{display:block;font-weight:500;opacity:.75;font-size:11px}.mi-tip{font-size:13px;color:var(--mu);margin:4px 0}.mi-log{list-style:none;margin:6px 0;padding:0;font-size:13px;max-height:160px;overflow:auto}.mi-log li{padding:3px 0;border-bottom:1px solid var(--line)}.mi-log time{color:var(--mu);margin-right:6px;font-variant-numeric:tabular-nums}.mi-log .bad{color:#ffb3a6}.mi-log .good{color:#a9dc9b}'+
 '.mi-ent{display:grid;gap:6px;margin:6px 0}.mi-ent .r{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;padding:6px 8px;background:var(--s2);border:1px solid var(--line);border-radius:var(--r)}.mi-ent .r.on{border-color:#e8c547}.mi-ent .r b{font-size:13px}.mi-ent .ad-seg button{min-height:34px;padding:5px 8px;font-size:12px}.mi-res{background:var(--s2);border-radius:var(--r);padding:10px 12px;margin:8px 0}.mi-res .sc{font-size:34px;font-weight:800}.mi-cards{display:grid;gap:10px;margin:12px 0}.mi-card{display:block;text-align:left;background:var(--s2);color:var(--tx);border:1px solid var(--line);border-radius:var(--r);padding:12px;font:inherit;cursor:pointer}.mi-card b{font-size:16px;display:block;margin-bottom:3px}.mi-card span{font-size:13px;color:var(--mu)}.mi-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--mu);margin:4px 0}.mi-leg span:before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px;background:var(--c)}.mi-datos ul{padding-left:18px}.mi-datos li{margin:4px 0}';
/* ---------------- rejilla ---------------- */
function buildGrid(M){ const gw=Math.ceil(M.w/CELL), gh=Math.ceil(M.h/CELL); const c=document.createElement('canvas'); c.width=gw; c.height=gh; const g=c.getContext('2d');
  g.fillStyle='#000'; g.strokeStyle='#000'; g.lineWidth=0.45;
  M.b.forEach(b=>{ g.beginPath(); for(let i=0;i<b.length;i+=2){ const x=b[i]/CELL,y=b[i+1]/CELL; if(i) g.lineTo(x,y); else g.moveTo(x,y); } g.closePath(); g.fill(); g.stroke(); });
  if(M.x){ g.globalCompositeOperation='destination-out'; g.lineWidth=3.6/CELL; g.lineCap='round'; M.x.forEach(p=>{ g.beginPath(); for(let i=0;i<p.length;i+=2){ const x=p[i]/CELL,y=p[i+1]/CELL; if(i) g.lineTo(x,y); else g.moveTo(x,y); } g.stroke(); }); g.globalCompositeOperation='source-over'; }
  const d=g.getImageData(0,0,gw,gh).data; const bld=new Uint8Array(gw*gh); for(let i=0;i<gw*gh;i++) bld[i]=d[i*4+3]>110?1:0; return {gw,gh,bld}; }
function ci(x,y){ const gx=Math.floor(x/CELL), gy=Math.floor(y/CELL); if(gx<0||gy<0||gx>=G.gw||gy>=G.gh) return -1; return gy*G.gw+gx; }
function free(x,y){ const i=ci(x,y); return i>=0&&!G.bld[i]; }
function snap(x,y){ if(free(x,y)) return [x,y]; for(let r=1;r<12;r++) for(let a=0;a<16;a++){ const t=a/16*Math.PI*2, px=x+Math.cos(t)*r*1.2, py=y+Math.sin(t)*r*1.2; if(free(px,py)) return [px,py]; } return [x,y]; }
function bfs(srcs){ const gw=G.gw,gh=G.gh,N=gw*gh,blk=G.bld; const D=new Int32Array(N).fill(1e9); const Bk=[[]];
  srcs.forEach(i=>{ if(i>=0&&!blk[i]&&D[i]){ D[i]=0; Bk[0].push(i); } });
  const NB=[[-1,0,2],[1,0,2],[0,-1,2],[0,1,2],[-1,-1,3],[1,-1,3],[-1,1,3],[1,1,3]];
  for(let c=0;c<Bk.length;c++){ const b=Bk[c]; if(!b) continue; for(let k=0;k<b.length;k++){ const i=b[k]; if(D[i]!==c) continue; const x=i%gw, y=(i-x)/gw;
    for(let n=0;n<8;n++){ const dx=NB[n][0],dy=NB[n][1]; const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=gw||ny>=gh) continue; const j=ny*gw+nx; if(blk[j]) continue; if(dx&&dy&&(blk[i+dx]||blk[i+dy*gw])) continue; const nd=c+NB[n][2]; if(nd<D[j]){ D[j]=nd; (Bk[nd]||(Bk[nd]=[])).push(j); } } } Bk[c]=null; }
  return D; }
function descend(F,x,y){ const i=ci(x,y); if(i<0||F[i]>=1e9) return null; const gw=G.gw; const gx=i%gw, gy=(i-gx)/gw; let best=F[i], bx=0, by=0;
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy) continue; const nx=gx+dx, ny=gy+dy; if(nx<0||ny<0||nx>=gw||ny>=G.gh) continue; const j=ny*gw+nx; if(F[j]<best){ if(dx&&dy&&(G.bld[i+dx]||G.bld[i+dy*gw])) continue; best=F[j]; bx=(nx+0.5)*CELL; by=(ny+0.5)*CELL; } }
  if(best===F[i]) return null; const vx=bx-x, vy=by-y, m=Math.hypot(vx,vy)||1; return [vx/m,vy/m]; }
function los(x0,y0,x1,y1){ const d=Math.hypot(x1-x0,y1-y0); const n=Math.ceil(d/1.2); for(let k=1;k<n;k++){ const x=x0+(x1-x0)*k/n, y=y0+(y1-y0)*k/n; if(!free(x,y)) return false; } return true; }
function width(x,y){ let best=1e9; for(let a=0;a<180;a+=15){ const r=a*Math.PI/180, c=Math.cos(r), s=Math.sin(r); let p=0,n=0; while(p<40&&free(x+c*p,y+s*p)) p+=1; while(n<40&&free(x-c*n,y-s*n)) n+=1; best=Math.min(best,p+n); } return best; }
/* ---------------- tabla espacial ---------------- */
function hashAll(){ const H=G.H||(G.H=new Map()); H.clear(); const add=(o,k)=>{ const key=(Math.floor(o.x/4)<<12)|Math.floor(o.y/4); let a=H.get(key); if(!a){ a=[]; H.set(key,a); } a.push([o,k]); };
  G.P.forEach(p=>{ if(p.on) add(p,0); }); G.U.forEach(u=>u.m.forEach(m=>add(m,u.k==='cab'?2:1))); }
function near(x,y,r,fn){ const R=Math.ceil(r/4), gx=Math.floor(x/4), gy=Math.floor(y/4); for(let dy=-R;dy<=R;dy++) for(let dx=-R;dx<=R;dx++){ const a=G.H.get(((gx+dx)<<12)|(gy+dy)); if(!a) continue; for(const e of a){ const d=Math.hypot(e[0].x-x,e[0].y-y); if(d<=r) fn(e[0],e[1],d); } } }
/* ---------------- ruta del autobús ---------------- */
function routeInit(R){ const pts=R.map(p=>[p[0],p[1]]); const cum=[0]; for(let i=1;i<pts.length;i++) cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1])); return {pts,cum,len:cum[cum.length-1]}; }
function rAt(s){ const R=G.route; s=Math.max(0,Math.min(R.len,s)); let i=1; while(i<R.cum.length-1&&R.cum[i]<s) i++; const a=R.pts[i-1], b=R.pts[i], f=(s-R.cum[i-1])/((R.cum[i]-R.cum[i-1])||1); const hd=Math.atan2(b[1]-a[1],b[0]-a[0]); return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,hd]; }
function rProj(x,y){ const R=G.route; let best={d:1e9,s:0,side:1}; for(let i=1;i<R.pts.length;i++){ const a=R.pts[i-1], b=R.pts[i]; const vx=b[0]-a[0], vy=b[1]-a[1], l2=vx*vx+vy*vy; let f=((x-a[0])*vx+(y-a[1])*vy)/l2; f=Math.max(0,Math.min(1,f)); const px=a[0]+vx*f, py=a[1]+vy*f, d=Math.hypot(x-px,y-py); if(d<best.d){ const cr=vx*(y-a[1])-vy*(x-a[0]); best={d,s:R.cum[i-1]+Math.sqrt(l2)*f,side:cr>=0?1:-1}; } } return best; }
function rOff(s,off){ const p=rAt(s); return [p[0]-Math.sin(p[2])*off,p[1]+Math.cos(p[2])*off]; }

/* ---------------- unidades policiales ---------------- */
const UK={uip:{n:8,sp:1.1,v:2.6,vr:3.6,acc:1.6,see:15,col:'#4ea1ff'},cab:{n:4,sp:2.7,v:3.9,vr:5.2,acc:1.4,see:35,col:'#8a5a2b'}};
function mkUnit(k,i,x,y){ const D=UK[k]; const p=snap(x,y); const u={id:G.U.length,k,i,cx:p[0],cy:p[1],vx:0,vy:0,hd:-Math.PI/2,fc:-Math.PI/2,tx:p[0],ty:p[1],st:'line',form:'line',m:[],F:null,nerv:0,push:0,sel:false,name:k==='uip'?L('UIP ','UIP ')+(i+1):L('Caballería ','Mounted ')+(i+1),idT:null,fol:0};
  for(let j=0;j<D.n;j++){ const s=slot(u,j); u.m.push({x:s[0],y:s[1],px:s[0],py:s[1],vx:0,vy:0,hd:u.fc,u}); } G.U.push(u); return u; }
function slot(u,j){ const D=UK[u.k], n=D.n; if(u.form==='col'){ const r=Math.floor(j/2), c=j%2; const bx=u.cx-Math.cos(u.hd)*r*(u.k==='cab'?3.0:1.1), by=u.cy-Math.sin(u.hd)*r*(u.k==='cab'?3.0:1.1); const o=(c-0.5)*(u.k==='cab'?1.8:1.0); return [bx-Math.sin(u.hd)*o,by+Math.cos(u.hd)*o]; }
  const o=(j-(n-1)/2)*D.sp; const fw=u.brace>0?0.45:0; let x=u.cx-Math.sin(u.fc)*o+Math.cos(u.fc)*fw, y=u.cy+Math.cos(u.fc)*o+Math.sin(u.fc)*fw; const p=free(x,y)?[x,y]:snap(x,y); return p; }
function faceFor(u){ if(G.mi==='bus'){ const pr=rProj(u.cx,u.cy); const p=rAt(pr.s); /* mira hacia fuera de la calzada (hacia el público) */ const ang=p[2]+(pr.side>0?Math.PI/2:-Math.PI/2); return ang; }
  /* visita: mira hacia fuera de la plaza */ return Math.atan2(u.cy-305,u.cx-447); }
function orderMove(u,x,y,keep){ const p=snap(x,y); u.tx=p[0]; u.ty=p[1]; u.F=bfs([ci(p[0],p[1])]); u.st='move'; u.form='col'; u.fol=0; u.push=0; if(!keep) u.idT=null; }
function confined(u){ const w=width(u.cx,u.cy); return w<10; }
function stepUnits(dt){ G.U.forEach(u=>{ const D=UK[u.k]; u.nerv=Math.max(0,u.nerv-dt); u.brace=Math.max(0,(u.brace||0)-dt);
  /* objetivo del centro */ let tx=u.tx, ty=u.ty;
  if(u.fol&&G.bus){ const b=G.bus; const pr=rProj(u.cx,u.cy); const s=Math.max(0,Math.min(G.route.len,b.s+(u.k==='cab'?15:-14))); const side=u.fol; const p=rOff(s,side*6.2); const q=snap(p[0],p[1]); tx=q[0]; ty=q[1]; if(Math.hypot(tx-u.tx,ty-u.ty)>6||!u.F){ u.tx=tx; u.ty=ty; u.F=bfs([ci(tx,ty)]); } }
  if(u.idT){ const a=u.idT; if(!a.on||a.dis){ u.idT=null; u.st='line'; u.form='line'; u.fc=faceFor(u); } else { tx=a.x; ty=a.y; if(Math.hypot(tx-u.tx,ty-u.ty)>3){ u.tx=tx; u.ty=ty; u.F=bfs([ci(tx,ty)]); } } }
  if(u.nerv>0&&u.nv){ tx=u.nv[0]; ty=u.nv[1]; }
  const d=Math.hypot(tx-u.cx,ty-u.cy); const conf=u.k==='cab'&&confined(u); u.conf=conf;
  let vmax=(u.fol||u.idT||u.nerv>0)?D.vr:D.v; if(conf) vmax=Math.min(vmax,1.5);
  if(d>0.4){ let dir=null; if(d>4&&u.F) dir=descend(u.F,u.cx,u.cy); if(!dir){ dir=[(tx-u.cx)/d,(ty-u.cy)/d]; }
    const want=Math.min(vmax,Math.sqrt(2*D.acc*Math.max(0,d-0.3))); const dvx=dir[0]*want-u.vx, dvy=dir[1]*want-u.vy, dm=Math.hypot(dvx,dvy), mx=D.acc*dt*1.6; const f=dm>mx?mx/dm:1; u.vx+=dvx*f; u.vy+=dvy*f;
    if(Math.hypot(u.vx,u.vy)>0.3){ const th=Math.atan2(u.vy,u.vx); let dh=th-u.hd; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; u.hd+=dh*Math.min(1,dt*3); }
    const nx=u.cx+u.vx*dt, ny=u.cy+u.vy*dt; if(free(nx,ny)){ u.cx=nx; u.cy=ny; } else if(free(nx,u.cy)){ u.cx=nx; u.vy*=0.3; } else if(free(u.cx,ny)){ u.cy=ny; u.vx*=0.3; } else { u.vx*=0.2; u.vy*=0.2; }
    if(d>3) u.form='col'; }
  else { u.vx*=0.5; u.vy*=0.5; if(u.st==='move'){ u.st='line'; } if(!u.fol&&!u.idT&&!(u.brace>0)){ u.form='line'; const f=faceFor(u); let dh=f-u.fc; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; u.fc+=dh*Math.min(1,dt*2.5); } }
  if(u.fol&&d<=3){ u.form='col'; }
  /* empujar: la línea avanza despacio hacia el público */
  if(u.push>0){ u.push-=dt; const sp=u.k==='cab'?1.3:0.6; const nx=u.cx+Math.cos(u.fc)*sp*dt, ny=u.cy+Math.sin(u.fc)*sp*dt; if(free(nx,ny)){ u.cx=nx; u.cy=ny; u.tx=nx; u.ty=ny; } if(u.push<=0){ u.push=0; } }
  /* cada agente/caballo va a su puesto con aceleración y frenada */
  u.m.forEach((m,j)=>{ m.px=m.x; m.py=m.y; let s=slot(u,j); if(u.nerv>0&&u.k==='cab'){ s=[s[0]+Math.cos(j*2.1)*1.2,s[1]+Math.sin(j*2.1)*1.2]; } const dx=s[0]-m.x, dy=s[1]-m.y, dd=Math.hypot(dx,dy); const vm=(u.k==='cab'&&u.conf)?1.6:D.vr+0.6;
    const want=Math.min(vm,Math.sqrt(2*D.acc*Math.max(0,dd-0.05))*1.2); const tvx=dd>0.02?dx/dd*want:0, tvy=dd>0.02?dy/dd*want:0; const dvx=tvx-m.vx, dvy=tvy-m.vy, dm=Math.hypot(dvx,dvy), mx=D.acc*1.8*dt; const f=dm>mx?mx/dm:1; m.vx+=dvx*f; m.vy+=dvy*f;
    let nx=m.x+m.vx*dt, ny=m.y+m.vy*dt; if(!free(nx,ny)){ if(free(nx,m.y)) ny=m.y; else if(free(m.x,ny)) nx=m.x; else { nx=m.x; ny=m.y; m.vx=0; m.vy=0; } } m.x=nx; m.y=ny;
    const sp=Math.hypot(m.vx,m.vy); const th=sp>0.4?Math.atan2(m.vy,m.vx):(u.form==='line'?u.fc:u.hd); let dh=th-m.hd; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; m.hd+=dh*Math.min(1,dt*(u.k==='cab'?2.2:4)); });
 }); }
/* ---------------- personas ---------------- */
function mkP(x,y,o){ const R=G.R; const p=Object.assign({x,y,px:x,py:y,vx:0,vy:0,on:true,tx:x,ty:y,v:1.15+R()*0.35,nerve:R(),rt:0.3+R()*0.9,st:'stand',hd:R()*6.28,still:0,stuck:0,side:0,F:null,react:0,rx:0,ry:0,seen:false},o||{}); G.P.push(p); return p; }
function stepP(p,dt){ p.px=p.x; p.py=p.y; if(!p.on) return;
  if(p.react>0){ p.react-=dt; }
  let tx=p.tx, ty=p.ty; if(p.react>0){ tx+=p.rx; ty+=p.ry; }
  const d=Math.hypot(tx-p.x,ty-p.y); let dir=null;
  if(d>0.15){ if(p.F&&d>6) dir=descend(p.F,p.x,p.y); if(!dir) dir=[(tx-p.x)/d,(ty-p.y)/d]; }
  const vmax=p.run?Math.max(3.2,p.v*2.4):p.v; const want=dir?Math.min(vmax,Math.sqrt(2*1.6*Math.max(0,d-0.1))):0;
  let ax=(dir?dir[0]*want:0)-p.vx, ay=(dir?dir[1]*want:0)-p.vy;
  /* separación: personas, agentes (escudos) y caballos */
  let sx=0,sy=0; near(p.x,p.y,2.6,(o,k,dd)=>{ if(o===p||dd<0.01) return; const rad=k===0?0.75:k===1?1.05:2.2; if(dd<rad){ const w=(rad-dd)/rad*(k===0?2.2:5); sx+=(p.x-o.x)/dd*w; sy+=(p.y-o.y)/dd*w; } });
  ax+=sx; ay+=sy; const am=Math.hypot(ax,ay), mx=2.4*dt*(p.run?2:1)+Math.hypot(sx,sy)*dt; const f=am>mx?mx/am:1; p.vx+=ax*f; p.vy+=ay*f;
  const sp=Math.hypot(p.vx,p.vy), cap=vmax*1.15; if(sp>cap){ p.vx*=cap/sp; p.vy*=cap/sp; }
  let nx=p.x+p.vx*dt, ny=p.y+p.vy*dt;
  /* no atravesar la línea policial: frena en seco antes del escudo */
  let blocked=false; near(nx,ny,2.2,(o,k)=>{ if(k===0||blocked) return; const rad=k===1?0.62:1.35; if(Math.hypot(nx-o.x,ny-o.y)<rad) blocked=true; });
  if(blocked){ nx=p.x+p.vx*dt*0.15; ny=p.y+p.vy*dt*0.15; p.vx*=0.3; p.vy*=0.3; p.hitLine=G.t; }
  if(!free(nx,ny)){ if(free(nx,p.y)){ ny=p.y; p.vy=0; } else if(free(p.x,ny)){ nx=p.x; p.vx=0; } else { nx=p.x; ny=p.y; p.vx=0; p.vy=0; } }
  const mv=Math.hypot(nx-p.x,ny-p.y); p.x=nx; p.y=ny;
  if(p.alert>G.t&&mv<0.03){ p.lowT=(p.lowT||0)+dt; if(p.lowT>0.8){ p.fg=(p.fg||0)+1; const a=p.hd+(p.fg%2?1.9:-1.9); p.react=0.6+p.rt*0.3; p.rx=Math.cos(a)*0.55; p.ry=Math.sin(a)*0.55; p.lowT=0; } } else p.lowT=0;
  if(dir&&want>0.3&&mv<0.04){ p.stuck+=dt; if(p.stuck>1.0&&p.react<=0){ const a=Math.atan2(dir[1],dir[0])+(p.nerve>0.5?1.4:-1.4); p.react=0.8; p.rx=Math.cos(a)*1.4; p.ry=Math.sin(a)*1.4; p.stuck=0; } } else p.stuck=0;
  if(sp>0.25) { const th=Math.atan2(p.vy,p.vx); let dh=th-p.hd; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; p.hd+=dh*Math.min(1,dt*5); }
  else if(p.look!=null){ let dh=p.look-p.hd; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; p.hd+=dh*Math.min(1,dt*3); } }
/* estímulo: lo que la gente ve u oye a su alrededor (sin dados: el retraso de reacción es propio de cada persona) */
function stim(x,y,r,k,fromX,fromY){ (G.ev||(G.ev=[])).push({x,y,r,k,t:G.t}); near(x,y,r,(p,kk,d)=>{ if(kk!==0||!p.on) return; if(p.inq){ p.react=Math.max(p.react,0.8+p.rt*0.5); p.alert=G.t+2.5; const ax=p.x-x, ay=p.y-y, am=Math.hypot(ax,ay)||1; p.rx=ax/am*0.45; p.ry=ay/am*0.45; p.look=Math.atan2(-ay,-ax); return; } if(d>6&&!los(p.x,p.y,x,y)) return; const ax=p.x-(fromX!=null?fromX:x), ay=p.y-(fromY!=null?fromY:y), am=Math.hypot(ax,ay)||1; const back=k==='horse'?1.6:k==='hit'?2.4:1.0;
  p.alert=G.t+2.5; p.react=Math.max(p.react,0.9+p.rt); p.rx=ax/am*back; p.ry=ay/am*back; p.look=Math.atan2(y-p.y,x-p.x); }); }

/* ---------------- mensajes ---------------- */
function clockS(t){ t=Math.max(0,Math.floor(t)); return Math.floor(t/60)+':'+String(t%60).padStart(2,'0'); }
function lg(es,en,c,x,y){ const txt=en==null?es:L(es,en); G.log.unshift({t:G.t,txt,c:c||''}); if(G.log.length>60) G.log.length=60; if(x!=null){ G.call=G.call.filter(k=>G.t-k.t<3.5); if(G.call.length>=3) G.call.shift(); G.call.push({x,y,txt:txt.length>46?txt.slice(0,44)+'…':txt,t:G.t,c:c||''}); } G.dirtyUI=true; }
/* ================= MISIÓN 1: escolta del autobús del equipo ================= */
function newBus(seed){ const M=C.MAPS.bernabeu; const R=rng(seed); const gr=buildGrid(M);
  G={mi:'bus',seed,R,M,gw:gr.gw,gh:gr.gh,bld:gr.bld,P:[],U:[],proj:[],log:[],call:[],ev:[],t:0,phase:'plan',spd:1,pause:false,sel:null,cam:null,acc:0,
     sc:{hits:0,inc:0,runIn:0,unjust:0,blocked:0,disarm:0,deter:0,stopT:0,horseScare:0,confPush:0},spots:[],follow:true};
  G.route=routeInit(M.r); const RL=G.route.len;
  G.bus={s:0,v:0,stop:false,arr:null,len:12,w:2.6,x:0,y:0,hd:0,px:0,py:0,phd:0,go:8};
  { const p=rAt(0); G.bus.x=G.bus.px=p[0]; G.bus.y=G.bus.py=p[1]; G.bus.hd=G.bus.phd=p[2]; }
  /* zonas de público a lo largo de la ruta (cada partida distinta) */
  const cand=[]; for(let s=70;s<RL-120;s+=30) for(const side of [1,-1]){ const off=side*(10+R()*3); const p=rOff(s,off); if(!free(p[0],p[1])) continue; const pr=rProj(p[0],p[1]); if(pr.d<7.5) continue; cand.push({s,side,x:p[0],y:p[1]}); }
  for(let i=cand.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); const t=cand[i]; cand[i]=cand[j]; cand[j]=t; }
  const spots=[]; cand.forEach(c=>{ if(spots.length<8&&spots.every(o=>Math.abs(o.s-c.s)>40||o.side!==c.side)) spots.push(c); });
  spots.sort((a,b)=>a.s-b.s); const nr=2+(R()<0.5?1:0); const idx=spots.map((_,i)=>i); for(let i=idx.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); const t=idx[i]; idx[i]=idx[j]; idx[j]=t; }
  idx.slice(0,nr).forEach(i=>spots[i].risk=true);
  /* llegada: recibimiento junto al estadio */
  for(const [s,side] of [[RL-60,1],[RL-25,-1],[RL-95,-1]]){ const p=rOff(s,side*10); const q=snap(p[0],p[1]); spots.push({s,side,x:q[0],y:q[1],arr:true}); }
  spots.forEach((sp,i)=>{ sp.id=i; sp.n=sp.arr?45+Math.floor(R()*25):(sp.risk?18+Math.floor(R()*10):16+Math.floor(R()*22)); });
  G.spots=spots;
  spots.forEach(sp=>{ let k=0, tries=0; while(k<sp.n&&tries<sp.n*30){ tries++; const a=R()*6.283, r=Math.sqrt(R())*(sp.arr?9:6.5); const x=sp.x+Math.cos(a)*r, y=sp.y+Math.sin(a)*r; if(!free(x,y)) continue; const pr=rProj(x,y); if(pr.d<6.3) continue;
      const p=mkP(x,y,{role:'fan',sp:sp.id,s:pr.s,side:pr.side,hx:x,hy:y,wo:Math.max(5.4,Math.min(pr.d,5.6+R()*2.2)),sx:(R()-.5)*3,eager:!sp.risk&&R()>0.9,ea:R()*6.283}); p.hd=Math.atan2(rAt(pr.s)[1]-y,rAt(pr.s)[0]-x); k++; } });
  /* en las zonas de riesgo: lanzadores y alguien que intentará meterse delante del autobús */
  spots.filter(s=>s.risk).forEach((sp,j)=>{ const ps=G.P.filter(p=>p.sp===sp.id); ps.sort((a,b)=>a.nerve-b.nerve); const th=ps.slice(0,j===0?2:1); th.forEach(p=>{ p.role='thr'; p.obj=R()<0.5?'botella':'lata'; }); const rn=ps.find(p=>p.role==='fan'); if(rn&&(j<2)) rn.role='run'; });
  /* unidades en la zona de salida */
  for(let i=0;i<4;i++){ const p=rOff(14+i*7,(i%2?-1:1)*8); mkUnit('uip',i,p[0],p[1]); }
  for(let i=0;i<2;i++){ const p=rOff(30+i*8,(i?-1:1)*7); mkUnit('cab',i,p[0],p[1]); }
  G.U.forEach(u=>{ u.fc=faceFor(u); u.m.forEach((m,j)=>{ const s=slot(u,j); m.x=m.px=s[0]; m.y=m.py=s[1]; m.hd=u.fc; }); });
  G.ideal=G.bus.go+(RL-55)/4.0+55/2.2+6;
  return G; }
function busRect(b){ return {cx:b.x-Math.cos(b.hd)*b.len/2,cy:b.y-Math.sin(b.hd)*b.len/2}; }
function inBus(x,y,pad){ const b=G.bus; const c=busRect(b); const dx=x-c.cx, dy=y-c.cy; const a=dx*Math.cos(b.hd)+dy*Math.sin(b.hd), l=-dx*Math.sin(b.hd)+dy*Math.cos(b.hd); return Math.abs(a)<=b.len/2+(pad||0)&&Math.abs(l)<=b.w/2+(pad||0); }
function stepBus(dt){ const b=G.bus, RL=G.route.len; b.px=b.x; b.py=b.y; b.phd=b.hd;
  /* ¿hay alguien en la calzada delante? */
  let block=null; if(G.t>=b.go&&b.arr==null){ for(const ds of [5,9,13,17]){ const p=rAt(b.s+ds); near(p[0],p[1],3.6,(o,k)=>{ if(k===0&&o.on&&!block){ const pr=rProj(o.x,o.y); if(pr.d<3.3&&pr.s>b.s+1&&pr.s<b.s+19) block=o; } }); if(block) break; } }
  let vt=G.t<b.go?0:(b.s>RL-55?2.2:4.0); if(block) vt=0; if(b.s>=RL-0.5) vt=0;
  const a=vt>b.v?0.9:3.2; b.v+=Math.max(-a*dt,Math.min(a*dt,vt-b.v)); if(b.v<0) b.v=0; b.s=Math.min(RL,b.s+b.v*dt);
  if(block&&b.v<0.3){ G.sc.stopT+=dt; if(!b.stop){ b.stop=true; lg('El autobús se detiene: hay gente en la calzada','The bus stops: people in the road','bad',block.x,block.y); } } else if(!block) b.stop=false;
  const p=rAt(b.s); b.x=p[0]; b.y=p[1]; let dh=p[2]-b.hd; while(dh>Math.PI) dh-=2*Math.PI; while(dh<-Math.PI) dh+=2*Math.PI; b.hd+=dh*Math.min(1,dt*1.8);
  if(b.arr==null&&b.s>=RL-0.5){ b.arr=G.t; lg('El autobús llega al estadio','The bus reaches the stadium','good',b.x,b.y); G.endAt=G.t+5; }
  if(b.v>0.5){ near(b.x,b.y,13,(o,k,d)=>{ if(k===0&&o.on) o.alert=G.t+2; if(k===0&&o.on&&d<9&&o.react<=0){ o.react=0.8+o.rt*0.5; const ax=o.x-b.x, ay=o.y-b.y, am=Math.hypot(ax,ay)||1; o.rx=ax/am*0.6; o.ry=ay/am*0.6; o.look=Math.atan2(-ay,-ax); } }); }
}
function seenBy(p){ for(const u of G.U){ const r=UK[u.k].see; for(const m of u.m){ const d=Math.hypot(m.x-p.x,m.y-p.y); if(d<r&&(d<6||los(m.x,m.y,p.x,p.y))) return u; } } return null; }
function polNear(x,y,r,kind){ let best=null,bd=r; G.U.forEach(u=>{ if(kind&&u.k!==kind) return; if(u.nerv>0&&u.k==='cab') return; u.m.forEach(m=>{ const d=Math.hypot(m.x-x,m.y-y); if(d<bd){ bd=d; best=m; } }); }); return best; }
function stepFans(dt){ const b=G.bus, started=G.t>=b.go-3;
  G.P.forEach(p=>{ if(!p.on) return; const bd=p.s-b.s;
    /* ver a los sospechosos: solo si una unidad los tiene a la vista (la caballería ve más lejos) */
    if((p.role==='thr'||p.role==='run')&&!p.seen&&(G.stepN%3===0)){ const u=seenBy(p); if(u){ p.seen=true; lg(p.role==='thr'?(u.k==='cab'?'Caballería: posible lanzador, lleva una '+p.obj:'UIP: posible lanzador, lleva una '+p.obj):(u.k==='cab'?'Caballería: ':'UIP: ')+'alguien nervioso mira mucho la calzada, puede intentar meterse',p.role==='thr'?(u.k==='cab'?'Mounted unit':'UIP')+': possible thrower, carrying a '+(p.obj==='botella'?'bottle':'can'):(u.k==='cab'?'Mounted unit':'UIP')+': someone nervous keeps eyeing the road, may try to run in','bad',p.x,p.y); } }
    let tx=p.hx, ty=p.hy, run=false;
    const watch=started&&bd>-18&&bd<80;
    if(watch){ const q=rOff(p.s+p.sx,p.side*p.wo); tx=q[0]; ty=q[1]; p.look=Math.atan2(b.y-p.y,b.x-p.x); }
    if(p.role==='fan'&&p.eager&&started&&bd>5&&bd<26&&!p.done){ const det=polNear(p.x,p.y,6,'uip')||polNear(p.x,p.y,18,'cab');
      if(det&&!p.inRoad){ p.done=true; G.sc.deter++; }
      else if(!det&&!(p.backT>G.t)){ const q=rOff(p.s+p.sx,p.side*2.2); tx=q[0]; ty=q[1]; const pr=rProj(p.x,p.y); if(pr.d<3.4&&!p.inRoad){ p.inRoad=true; p.inT=G.t; G.sc.inc++; lg('Un aficionado se mete en la calzada para grabar','A fan steps into the road to film','bad',p.x,p.y); } }
      }
    if(p.inRoad&&!(p.backT>G.t)&&(G.t-p.inT>3.5||(bd<22&&b.v<1.5))){ p.backT=G.t+12; }
    if(p.inRoad&&p.backT>G.t){ const q=rOff(p.s+p.sx,p.side*p.wo); tx=q[0]; ty=q[1]; if(rProj(p.x,p.y).d>4.2){ p.inRoad=false; p.done=true; } }
    if(p.role==='run'&&!p.done){ const det=polNear(p.x,p.y,16,'cab')||polNear(p.x,p.y,4,'uip');
      if(p.st==='held'){ }
      else if(p.st==='road'){ const q=rAt(Math.max(p.s,b.s+7)); tx=q[0]; ty=q[1]; run=true; if(G.t>p.roadT+6){ p.done=true; p.st='left'; lg('Sale de la calzada','Leaves the road','',p.x,p.y); } }
      else if(started&&bd>6&&bd<28){ if(det){ p.done=true; p.st='deter'; G.sc.deter++; lg(det.u.k==='cab'?'Ve los caballos y desiste':'Ve el cordón y desiste',det.u.k==='cab'?'Sees the horses and gives up':'Sees the cordon and gives up','good',p.x,p.y); }
        else if(bd<17) p.st='go'; }
      if(p.st==='go'){ const q=rAt(b.s+11); tx=q[0]; ty=q[1]; run=true; if(p.hitLine&&G.t-p.hitLine<0.6){ p.st='held'; p.done=true; G.sc.deter++; lg('El cordón lo retiene: no llega a la calzada','The cordon holds him: he never reaches the road','good',p.x,p.y); }
        else if(rProj(p.x,p.y).d<3.0){ p.st='road'; p.roadT=G.t; G.sc.runIn++; lg('¡Se mete delante del autobús!','Runs in front of the bus!','bad',p.x,p.y); } } }
    if(p.role==='thr'&&!p.dis&&!p.thrown&&started&&bd>-2&&bd<26){ const d=Math.hypot(b.x-p.x,b.y-p.y);
      if(d<23&&los(p.x,p.y,b.x,b.y)){ const det=polNear(p.x,p.y,3.6,'uip'); if(det){ if(!p.detLog){ p.detLog=true; G.sc.deter++; lg('No se atreve a lanzar: tiene agentes al lado','Does not dare to throw: officers right next to him','good',p.x,p.y); } } else throwAt(p); } }
    if(p.thrown&&!p.retreat){ p.retreat=true; const ax=p.x-rAt(p.s)[0], ay=p.y-rAt(p.s)[1], am=Math.hypot(ax,ay)||1; const q=snap(p.x+ax/am*6,p.y+ay/am*6); p.hx=q[0]; p.hy=q[1]; }
    if(p.thrown){ tx=p.hx; ty=p.hy; }
    p.tx=tx; p.ty=ty; p.run=run; });
}
function throwAt(p){ const b=G.bus; p.thrown=true; const T=0.9; const ps=rAt(b.s+b.v*T); const d=Math.hypot(ps[0]-p.x,ps[1]-p.y); const e=(0.4+d*0.075)*(1.15-p.nerve*0.5);
  const x1=ps[0]-Math.cos(ps[2])*5+Math.cos(p.ea)*e, y1=ps[1]-Math.sin(ps[2])*5+Math.sin(p.ea)*e;
  G.proj.push({x0:p.x,y0:p.y,x1,y1,t0:G.t,T,k:p.obj,by:p}); lg('Lanza una '+p.obj+' al autobús','Throws a '+(p.obj==='botella'?'bottle':'can')+' at the bus','bad',p.x,p.y); }
function stepProj(){ G.proj=G.proj.filter(pr=>{ const f=(G.t-pr.t0)/pr.T; if(pr.done) return G.t-pr.t0<pr.T+2.5;
    /* escudos de la UIP en línea entre el lanzador y el objetivo */
    if(!pr.blk){ const x=pr.x0+(pr.x1-pr.x0)*Math.min(1,f), y=pr.y0+(pr.y1-pr.y0)*Math.min(1,f); near(x,y,1.0,(m,k)=>{ if(k===1&&m.u.form==='line'&&!pr.blk){ pr.blk=true; pr.x1=x; pr.y1=y; pr.done=true; G.sc.blocked++; lg('El escudo para el objeto','A shield stops the object','good',x,y); } }); if(pr.blk) return true; }
    if(f<1) return true; pr.done=true; const x=pr.x1, y=pr.y1;
    if(G.bus&&inBus(x,y,0.3)){ G.sc.hits++; G.bus.hitT=G.t; lg('Impacto en el autobús (cristal dañado, sin heridos)','Hit on the bus (glass damaged, no one hurt)','bad',x,y); }
    stim(x,y,7,'hit');
    G.U.forEach(u=>{ if(u.k!=='uip') return; if(Math.hypot(u.cx-x,u.cy-y)<14){ u.brace=1.2; if(u.form==='line'&&!u.fol){ u.fc=Math.atan2(pr.y0-u.cy,pr.x0-u.cx); } } });
    G.U.forEach(u=>{ if(u.k!=='cab'||u.nerv>0) return; if(u.m.some(m=>Math.hypot(m.x-x,m.y-y)<5.5)){ u.nerv=7; G.sc.horseScare++; const ax=u.cx-x, ay=u.cy-y, am=Math.hypot(ax,ay)||1; u.nv=snap(u.cx+ax/am*8,u.cy+ay/am*8); lg('Los caballos se asustan con el impacto y retroceden','The horses are startled by the impact and back off','bad',u.cx,u.cy); } });
    return true; }); }
function busOrder(u,o){ if(o==='line'){ u.fol=0; u.idT=null; u.push=0; u.tx=u.cx; u.ty=u.cy; u.st='line'; u.form='line'; u.fc=faceFor(u); }
  else if(o==='fol'){ if(G.phase==='plan'){ u.fol=u.i%2?-1:1; } else { const pr=rProj(u.cx,u.cy); u.fol=pr.side||1; } u.idT=null; u.push=0; u.st='fol'; lg(u.name+L(': acompaña al autobús por delante',': escorts the bus, ahead of it'),null,''); }
  else if(o==='push'){ if(u.k==='cab'&&confined(u)){ lg('Calle estrecha: los caballos no pueden empujar aquí','Narrow street: the horses cannot push here','bad',u.cx,u.cy); G.sc.confPush++; return; }
    let need=0; near(u.cx,u.cy,14,(o2,k)=>{ if(k===0&&o2.on){ const pr=rProj(o2.x,o2.y); if(pr.d<3.6) need+=3; else if(o2.hitLine&&G.t-o2.hitLine<2) need++; } });
    u.push=u.k==='cab'?3.2:3.6; u.fol=0; u.idT=null; u.form='line'; u.fc=faceFor(u);
    near(u.cx+Math.cos(u.fc)*3,u.cy+Math.sin(u.fc)*3,7,(p,k)=>{ if(k===0) { p.react=1.6+p.rt*0.4; p.rx=Math.cos(u.fc)*3; p.ry=Math.sin(u.fc)*3; p.look=u.fc+Math.PI; } });
    if(need>=3){ lg(u.name+L(': empuja la línea y aparta al público de la calzada',': pushes the line and clears the public off the road'),null,'good',u.cx,u.cy); } else { G.sc.unjust++; lg(u.name+L(': empuja sin que nadie invada la calzada (fuerza innecesaria)',': pushes although no one is in the road (needless force)'),null,'bad',u.cx,u.cy); } }
  else if(o==='id'){ if(u.k!=='uip') return; let best=null,bd=60; G.P.forEach(p=>{ if(p.on&&p.role==='thr'&&p.seen&&!p.dis&&!p.thrown){ const d=Math.hypot(p.x-u.cx,p.y-u.cy); if(d<bd){ bd=d; best=p; } } });
    if(!best){ lg('No hay ningún sospechoso a la vista cerca: primero hay que verlo','No suspect in sight nearby: someone has to spot him first','',''); return; } u.fol=0; u.push=0; u.idT=best; orderMove(u,best.x,best.y,true); u.idT=best; lg(u.name+L(': va a identificarlo',': goes to identify him'),null,'',best.x,best.y); }
}
function stepIdent(){ G.U.forEach(u=>{ const p=u.idT; if(!p||!p.on||p.dis) return; if(u.m.some(m=>Math.hypot(m.x-p.x,m.y-p.y)<2.0)){ p.dis=true; p.role='fan'; G.sc.disarm++; p.react=1.5; lg('Identificado; la '+p.obj+' se le retira (art. 18.2 LO 4/2015)','Identified; the '+(p.obj==='botella'?'bottle':'can')+' is taken away (art. 18.2 LO 4/2015)','good',p.x,p.y); u.idT=null; u.st='line'; u.form='line'; u.tx=u.cx; u.ty=u.cy; u.fc=faceFor(u); } }); }
function busScore(){ const s=G.sc, b=G.bus; const arr=b.arr==null?G.t+60:b.arr; const delay=Math.max(0,arr-G.ideal);
  const pT=Math.round(35*Math.max(0,Math.min(1,1-(delay-8)/80))), pB=Math.max(0,30-10*s.hits), pR=Math.max(0,20-4*s.inc-8*s.runIn), pF=Math.max(0,15-5*s.unjust-3*s.confPush);
  return {tot:pT+pB+pR+pF,parts:[[L('Llega a tiempo','Arrives on time'),pT,35,b.arr==null?L('No llegó','Did not arrive'):(delay<1?L('sin retraso','no delay'):L('retraso ','delay ')+Math.round(delay)+' s')],[L('Autobús intacto','Bus unharmed'),pB,30,s.hits?s.hits+L(' impacto(s)',' hit(s)'):L('ningún impacto','no hits')],[L('Calzada despejada','Road kept clear'),pR,20,(s.inc+s.runIn)?(s.inc+L(' en la calzada, ',' in the road, ')+s.runIn+L(' delante del autobús',' in front of the bus')):L('nadie se metió','no one got in')],[L('Fuerza mínima','Minimum force'),pF,15,(s.unjust+s.confPush)?(s.unjust+L(' empujón(es) innecesario(s)',' needless push(es)')):L('solo cuando hizo falta','only when needed')]],delay}; }

/* ================= MISIÓN 2: visita oficial (protocolo, controles de acceso en la Plaza Mayor) ================= */
const VM={none:['Sin cubrir','Uncovered'],valla:['Solo vallas','Barriers only'],V:['Vallas + pareja','Barriers + 2 officers'],A:['Control: bolsos','Check: bags'],B:['Bolsos + detector','Bags + detector'],C:['Cacheo a todos','Pat down everyone']};
const VT={A:3,B:4.5,C:12};
function inPlaza(x,y){ const p=PLAZA_MAYOR; let ins=false; for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){ if(((p[i+1]>y)!==(p[j+1]>y))&&(x<(p[j]-p[i])*(y-p[i+1])/(p[j+1]-p[i+1])+p[i])) ins=!ins; } return ins; }
function newVis(seed){ const M=C.MAPS.mayor; const R=rng(seed); const gr=buildGrid(M);
  G={mi:'vis',seed,R,M,gw:gr.gw,gh:gr.gh,bld:gr.bld,P:[],U:[],proj:[],log:[],call:[],ev:[],t:0,phase:'plan',spd:2,pause:false,sel:null,selE:null,cam:null,acc:0,teams:28,
     sc:{itemsIn:0,colIn:0,found:0,colStop:0,waits:[],inside:0,resQ:0,unCtl:0},E:[],tA:300};
  G.dais=[447,305];
  ENT_MAYOR.forEach((e,i)=>{ const q=[]; for(let k=0;k<e.q.length;k+=2) q.push([e.q[k],e.q[k+1]]);
    /* puestos de la cola: dos filas a lo largo de la calle, hacia fuera */
    const slots=[[],[]]; let acc=0; const step=0.8; let k=0; let seg=0; let pos=[q[0][0],q[0][1]];
    const pts=[]; for(let s=1;s<q.length;s++){ const a=q[s-1], b=q[s]; const l=Math.hypot(b[0]-a[0],b[1]-a[1]); for(let d=(s===1?1.6:0);d<l;d+=step){ const x=a[0]+(b[0]-a[0])*d/l, y=a[1]+(b[1]-a[1])*d/l; pts.push([x,y,Math.atan2(b[1]-a[1],b[0]-a[0])]); } }
    pts.forEach(pt=>{ for(const l of [0,1]){ const o=(l-0.5)*1.1; const x=pt[0]-Math.sin(pt[2])*o, y=pt[1]+Math.cos(pt[2])*o; const s=free(x,y)?[x,y]:snap(x,y); slots[l].push(s); } });
    const ang=Math.atan2(e.iy-e.y,e.ix-e.x);
    G.E.push({i,x:e.x,y:e.y,ix:e.ix,iy:e.iy,ang,mode:'none',q:[[],[]],lane:[null,null],slots,F:null,name:L('Acceso ','Entrance ')+(i+1)+' ('+L(e.c,e.c.replace('O','W').replace('SO','SW').replace('NO','NW'))+')',res:i===VIS_RES,chg:0}); });
  G.E.forEach(e=>{ e.F=bfs([ci(e.x,e.y)]); });
  /* puntos de llegada en los bordes del mapa */
  /* el público llega a pie por las calles de alrededor, a unos 60-140 m de la plaza */
  G.src=[]; for(let gy=2;gy<G.gh;gy+=5) for(let gx=2;gx<G.gw;gx+=5){ const i=gy*G.gw+gx; if(G.bld[i]) continue; let md=1e9; G.E.forEach(e=>{ if(e.F[i]<md) md=e.F[i]; }); const x=(gx+0.5)*CELL, y=(gy+0.5)*CELL; if(md>=60&&md<=140&&!inPlaza(x,y)&&width(x,y)>=4) G.src.push([x,y]); }
  /* visitantes: hora de llegada y procedencia fijas por partida; casi todos vienen a ver el acto */
  const N=320; for(let i=0;i<N;i++){ const r=R(); const ta=Math.pow(r,1.2)*215; const s=G.src[Math.floor(R()*G.src.length)];
    mkP(s[0],s[1],{role:'vis',ta,on:false,metal:R()<0.09,st:'wait',item:null,col:false,v:1.05+R()*0.35}); }
  const vis=G.P.slice(); const pick=()=>{ for(;;){ const p=vis[Math.floor(R()*vis.length)]; if(!p.item&&!p.col&&p.ta<230) return p; } };
  for(let k=0;k<2;k++){ const p=pick(); p.item='navaja'; p.metal=true; }
  for(let k=0;k<2;k++){ const p=pick(); p.item='bengala'; }
  for(let k=0;k<1+(R()<0.5?1:0);k++){ const p=pick(); p.col=true; }
  /* sección de caballería: vigilancia exterior */
  const cu=mkUnit('cab',0,447,206); cu.fc=-Math.PI/2; cu.m.forEach((m,j)=>{ const s=slot(cu,j); m.x=m.px=s[0]; m.y=m.py=s[1]; });
  /* la alta autoridad y su escolta (genérico: sin nombre ni retrato) */
  const re=G.E[VIS_RES]; const qs=re.slots[0]; const st=qs[Math.min(qs.length-1,30)]||[re.x,re.y-20];
  G.vip={x:st[0],y:st[1],px:st[0],py:st[1],on:false,st:'wait',path:null,k:0};
  return G; }
function cost(m){ return m==='A'||m==='B'||m==='C'?4:m==='V'?2:0; }
function teamsUsed(){ return G.E.reduce((a,e)=>a+cost(e.mode),0); }
function setMode(i,m){ const e=G.E[i]; if(!e||e.mode===m) return; const staff=x=>x==='A'||x==='B'||x==='C'; if(teamsUsed()-cost(e.mode)+cost(m)>G.teams){ lg('No quedan agentes libres: deja otro acceso solo con vallas o quita un control','No officers left: leave another entrance with barriers only or remove a checkpoint','bad'); return; }
  e.mode=m; e.chg=G.phase==='live'?G.t+5:0; if(!staff(m)){ /* la gente de su cola se va al acceso abierto más cercano */ for(const l of [0,1]){ e.q[l].forEach(p=>{ p.inq=null; p.ent=null; }); e.q[l]=[]; if(e.lane[l]){ const p=e.lane[l].p; p.inq=null; p.ent=null; e.lane[l]=null; } } }
  if(G.phase==='live') lg(e.name+': '+L(VM[m][0],VM[m][1]),null,'',e.x,e.y); G.dirtyUI=true; }
function openE(e){ return e.mode!=='valla'&&e.mode!=='V'; }
function chooseE(p,exclude){ let best=null,bd=1e9; G.E.forEach(e=>{ if(exclude&&exclude.indexOf(e)>=0) return; if(p.col){ if(e.mode==='A'||e.mode==='B'||e.mode==='C') return; } else if(!openE(e)) return; const d=e.F[ci(p.x,p.y)]; if(d<bd){ bd=d; best=e; } });
  if(!best&&p.col){ p.col=false; return chooseE(p); } return best; }
function laneCount(e,l){ return e.q[l].length+(e.lane[l]?1:0); }
function stepVis(dt){ const T=G.t;
  G.P.forEach(p=>{ if(p.role!=='vis') return;
    if(!p.on&&p.st==='wait'){ if(T>=p.ta){ p.on=true; p.st='walk'; p.ent=chooseE(p); if(p.ent) p.F=p.ent.F; } return; }
    if(!p.on) return;
    if(p.st==='walk'){ const e=p.ent; if(!e){ p.ent=chooseE(p); return; } p.F=e.F; p.tx=e.x; p.ty=e.y; const d=e.F[ci(p.x,p.y)];
      /* llega a una entrada cerrada: lo ve y busca otra */
      if((e.mode==='valla'||e.mode==='V')&&d<14&&!p.col){ p.ent=chooseE(p,[e]); p.react=0.8; p.rx=0; p.ry=0; return; }
      if((e.mode==='valla'||e.mode==='V')&&p.col&&d<5){ let seen=e.mode==='V'?e:null; G.U.forEach(u=>u.m.forEach(m=>{ const dd=Math.hypot(m.x-e.x,m.y-e.y); if(!seen&&dd<(u.k==='cab'?40:30)&&los(m.x,m.y,e.x,e.y)) seen=u; }));
        G.E.forEach(o=>{ if(seen||!(o.mode==='A'||o.mode==='B'||o.mode==='C')) return; const dd=Math.hypot(o.x-e.x,o.y-e.y); if(dd<30&&los(o.x,o.y,e.x,e.y)) seen=o; });
        if(seen){ p.col=false; G.sc.colStop++; lg('Intenta saltar la valla del '+e.name.toLowerCase()+': lo ven y lo mandan a un control','Tries to climb the barrier at '+e.name.toLowerCase()+': spotted and sent to a checkpoint','good',e.x,e.y); p.ent=chooseE(p,[e]); p.react=1; return; }
        p.st='in'; p.colIn=true; G.sc.colIn++; hid('Alguien saltó la valla del '+e.name.toLowerCase()+': ningún agente la tenía a la vista','Someone climbed the barrier at '+e.name.toLowerCase()+': no officer had it in sight'); goIn(p,e); return; }
      if(e.mode==='none'&&d<4){ /* acceso sin control: entra sin más */ if(p.item){ G.sc.itemsIn++; hid('Entró una '+p.item+' por el '+e.name.toLowerCase()+', que estaba sin control','A '+(p.item==='navaja'?'knife':'flare')+' got in through '+e.name.toLowerCase()+', which was unchecked'); } if(p.col){ G.sc.colIn++; hid('Alguien que buscaba colarse entró por el '+e.name.toLowerCase()+', sin control','Someone looking to sneak in entered through '+e.name.toLowerCase()+', unchecked'); } G.sc.unCtl++; goIn(p,e); return; }
      if((e.mode==='A'||e.mode==='B'||e.mode==='C')){ const ql=Math.min(laneCount(e,0),laneCount(e,1)); if(d<ql*0.8+5){ const l=laneCount(e,0)<=laneCount(e,1)?0:1; e.q[l].push(p); p.inq={e,l}; p.st='q'; p.qT=T; p.F=null; } }
      return; }
    if(p.st==='q'){ const e=p.inq.e, l=p.inq.l, k=e.q[l].indexOf(p); const sl=e.slots[l]; const s=sl[Math.min(sl.length-1,k)]||[e.x,e.y]; let ox=0, oy=0; if(k>=sl.length){ const j=k-sl.length+1; ox=Math.cos(k*2.4)*Math.min(4,j*0.5); oy=Math.sin(k*2.4)*Math.min(4,j*0.5); } p.tx=s[0]+ox; p.ty=s[1]+oy; p.look=Math.atan2(e.y-p.y,e.x-p.x); return; }
    if(p.st==='chk'){ const e=p.inq.e; const g=gatePos(e,p.inq.l); p.tx=g[0]; p.ty=g[1]; p.look=e.ang; return; }
    if(p.st==='out'){ p.tx=p.ox; p.ty=p.oy; if(Math.hypot(p.x-p.ox,p.y-p.oy)<1.2){ p.fade=(p.fade||0)+dt; if(p.fade>3) p.on=false; } return; }
    if(p.st==='in'){ if(p.k2===0&&Math.hypot(p.x-p.tx,p.y-p.ty)<1.5){ p.k2=1; p.tx=p.sx; p.ty=p.sy; p.F=null; }
      if(p.k2===1&&G.vip.on&&G.vip.st!=='wait'){ const dv=Math.hypot(p.x-G.vip.x,p.y-G.vip.y); if(dv<12) p.alert=G.t+2; if(dv<16&&p.react<=0){ p.look=Math.atan2(G.vip.y-p.y,G.vip.x-p.x); if(dv<7){ p.react=0.9+p.rt*0.5; p.rx=(p.x-G.vip.x)/dv*1.0; p.ry=(p.y-G.vip.y)/dv*1.0; } else { p.react=1.2+p.rt; p.rx=(G.vip.x-p.x)/dv*0.9; p.ry=(G.vip.y-p.y)/dv*0.9; } } else if(p.k2===1&&dv>=16) p.look=Math.atan2(G.dais[1]-p.y,G.dais[0]-p.x); }
      return; } });
  /* controles en cada acceso */
  G.E.forEach(e=>{ if(!(e.mode==='A'||e.mode==='B'||e.mode==='C')) return; if(T<e.chg) return;
    for(const l of [0,1]){ let c=e.lane[l]; if(!c&&e.q[l].length){ const p=e.q[l][0]; if(Math.hypot(p.x-e.slots[l][0][0],p.y-e.slots[l][0][1])<1.8){ e.q[l].shift(); p.st='chk'; c=e.lane[l]={p,t0:T,dur:procT(e,p),stage:0}; } }
      if(!c) continue; const p=c.p; const g=gatePos(e,l); if(Math.hypot(p.x-g[0],p.y-g[1])>1.2){ c.t0=T; continue; }
      if(c.stage===0&&e.mode==='B'&&p.metal&&T-c.t0>VT.B-1.5){ c.stage=1; stim(g[0],g[1],5,'alarm'); lg(p.item==='navaja'?e.name+': salta el detector; paleta e indicio claro: registro corporal (art. 20)':e.name+': salta el detector: es el cinturón, revisado con paleta',p.item==='navaja'?e.name+': detector alarm; hand wand finds clear grounds: external body search (art. 20)':e.name+': detector alarm: it is a belt, checked with the hand wand','',g[0],g[1]); }
      if(T-c.t0>=c.dur){ e.lane[l]=null; G.sc.waits.push(T-p.qT); const found=p.item&&(p.item==='bengala'||e.mode==='B'||e.mode==='C');
        if(found){ G.sc.found++; p.st='out'; const a=e.ang+Math.PI+(l?0.6:-0.6); const q=snap(e.x+Math.cos(a)*6,e.y+Math.sin(a)*6); p.ox=q[0]; p.oy=q[1]; stim(g[0],g[1],5,'alarm'); lg(e.name+': '+(p.item==='navaja'?'navaja intervenida':'bengala intervenida en el bolso')+' (art. 18 LO 4/2015)',e.name+': '+(p.item==='navaja'?'knife seized':'flare found in a bag')+' (art. 18 LO 4/2015)','good',g[0],g[1]); p.item=null; }
        else { if(p.item){ G.sc.itemsIn++; hid(e.name+': pasó una '+p.item+' que el control de bolsos no detecta (hace falta detector)',e.name+': a '+(p.item==='navaja'?'knife':'flare')+' got through; a bag check cannot find it (a detector is needed)'); } goIn(p,e); }
        p.inq=null; } } });
  stepVip(dt); }
function gatePos(e,l){ const o=(l-0.5)*1.4; return [e.x-Math.sin(e.ang)*o+Math.cos(e.ang)*0.6,e.y+Math.cos(e.ang)*o+Math.sin(e.ang)*0.6]; }
function procT(e,p){ let t=VT[e.mode]; if(e.mode==='B'&&p.metal) t+=4+(p.item==='navaja'?6:0); return t; }
function goIn(p,e){ p.st='in'; p.k2=0; p.F=null; p.tx=e.ix; p.ty=e.iy; G.sc.inside++; const R=G.R;
  for(let k=0;k<40;k++){ const x=380+R()*134, y=262+R()*92; if(!inPlaza(x,y)||!free(x,y)) continue; if(Math.hypot(x-G.dais[0],y-G.dais[1])<10) continue; const re=G.E[VIS_RES]; if(distSeg(x,y,re.ix,re.iy,G.dais[0],G.dais[1])<4.5) continue; p.sx=x; p.sy=y; return; } p.sx=e.ix; p.sy=e.iy; }
function distSeg(x,y,ax,ay,bx,by){ const vx=bx-ax, vy=by-ay, l2=vx*vx+vy*vy; let f=((x-ax)*vx+(y-ay)*vy)/l2; f=Math.max(0,Math.min(1,f)); return Math.hypot(x-ax-vx*f,y-ay-vy*f); }
function stepVip(dt){ const v=G.vip, T=G.t; v.px=v.x; v.py=v.y; const re=G.E[VIS_RES];
  if(v.st==='wait'&&T>=G.tA){ v.on=true; v.st='walk'; const sl=re.slots[0]; const path=[]; for(let k=Math.min(sl.length-1,30);k>=0;k-=3) path.push(sl[k]); path.push([re.x,re.y],[re.ix,re.iy],[G.dais[0],G.dais[1]+0.5]); v.path=path; v.k=0;
    const qn=re.q[0].length+re.q[1].length; if(re.mode!=='valla'&&re.mode!=='V'){ G.sc.resQ=1; lg('La autoridad llega por un acceso que no se cerró al público','The dignitary arrives through an entrance that was not closed to the public','bad',re.x,re.y); } else lg('Llega la alta autoridad por el acceso reservado','The dignitary arrives through the reserved entrance','good',re.x,re.y);
    G.sc.q300=G.P.filter(p=>p.role==='vis'&&p.on&&(p.st==='q'||p.st==='chk')).length; }
  if(v.st==='walk'){ const tgt=v.path[v.k]; const d=Math.hypot(tgt[0]-v.x,tgt[1]-v.y); const sp=1.0; if(d<0.6){ v.k++; if(v.k>=v.path.length){ v.st='act'; v.actT=T; lg('Empieza el acto','The ceremony begins','good',v.x,v.y); } } else { let blocked=false; near(v.x+(tgt[0]-v.x)/d*0.9,v.y+(tgt[1]-v.y)/d*0.9,0.8,(o,k)=>{ if(k===0&&o.on) blocked=true; }); if(!blocked){ v.x+=(tgt[0]-v.x)/d*Math.min(d,sp*dt); v.y+=(tgt[1]-v.y)/d*Math.min(d,sp*dt); } else { v.wait=(v.wait||0)+dt; } }
    near(v.x,v.y,3,(o,k,dd)=>{ if(k===0&&o.on&&o.react<=0&&dd<2.5){ o.react=1+o.rt*0.4; const ax=o.x-v.x, ay=o.y-v.y, am=Math.hypot(ax,ay)||1; o.rx=ax/am*1.6; o.ry=ay/am*1.6; } }); }
  if(v.st==='act'&&T-v.actT>60){ v.st='done'; G.endAt=T+1; } }
function visScore(){ const s=G.sc; const w=s.waits.length?s.waits.reduce((a,b)=>a+b,0)/s.waits.length:0; const wmax=s.waits.length?Math.max(...s.waits):0; const q300=s.q300||0;
  const nC=G.E.filter(e=>e.mode==='C').length, nN=G.E.filter(e=>e.mode==='none').length;
  const pS=Math.max(0,50-15*s.itemsIn-12*s.colIn), pF=Math.max(0,Math.round(30*Math.max(0,Math.min(1,1-Math.max(0,w-50)/150))-Math.min(15,q300/10))), pL=Math.max(0,20-Math.min(16,8*nC)-8*s.resQ-4*nN);
  return {tot:pS+pF+pL,w,wmax,q300,parts:[[L('Seguridad','Security'),pS,50,(s.itemsIn||s.colIn)?(s.itemsIn+L(' objeto(s) dentro, ',' object(s) inside, ')+s.colIn+L(' colado(s)',' sneaked in')):L('nada peligroso dentro','nothing dangerous inside')],[L('Flujo y colas','Flow and queues'),pF,30,L('espera media ','average wait ')+Math.round(w)+' s · '+L('máx. ','max ')+Math.round(wmax)+' s · '+q300+L(' fuera al llegar la autoridad',' still outside at arrival')],[L('Legalidad y protocolo','Legality and protocol'),pL,20,(nC?nC+L(' acceso(s) con cacheo a todos (sin indicios, art. 20)',' entrance(s) patting down everyone (no grounds, art. 20)')+' · ':'')+(s.resQ?L('acceso reservado abierto · ','reserved entrance left open · '):'')+(nN?nN+L(' sin cubrir',' uncovered'):'')||L('correcto','correct')]]}; }

function hid(es,en){ (G.sc.hid||(G.sc.hid=[])).push(L(es,en)); }
/* ================= común: paso de simulación ================= */
function step(){ const dt=DT; G.t+=dt; G.stepN=(G.stepN||0)+1; G.ev=G.ev.filter(e=>G.t-e.t<3); hashAll();
  if(G.mi==='bus'){ stepBus(dt); stepFans(dt); stepIdent(); stepProj(); } else stepVis(dt);
  stepUnits(dt);
  /* los caballos al moverse apartan a la gente que tienen al lado */
  if(G.stepN%2===0) G.U.forEach(u=>{ if(u.k!=='cab') return; u.m.forEach(m=>{ if(Math.hypot(m.vx,m.vy)<0.8) return; near(m.x,m.y,4.5,(p,k,d)=>{ if(k===0&&p.on) p.alert=G.t+2; if(k===0&&p.on&&p.react<=0){ p.react=0.9+p.rt*0.4; const ax=p.x-m.x, ay=p.y-m.y, am=Math.hypot(ax,ay)||1; p.rx=ax/am*1.8; p.ry=ay/am*1.8; p.look=Math.atan2(-ay,-ax); } }); }); });
  hashAll(); G.P.forEach(p=>stepP(p,dt));
  if(G.mi==='bus'&&G.bus){ /* nadie dentro del autobús */ G.P.forEach(p=>{ if(p.on&&inBus(p.x,p.y,0.5)){ const b=G.bus, c=busRect(b); const l=-(p.x-c.cx)*Math.sin(b.hd)+(p.y-c.cy)*Math.cos(b.hd); const sgn=l>=0?1:-1; const o=b.w/2+0.55-Math.abs(l); p.x+=-Math.sin(b.hd)*sgn*o; p.y+=Math.cos(b.hd)*sgn*o; if(!free(p.x,p.y)){ const q=snap(p.x,p.y); p.x=q[0]; p.y=q[1]; } } }); }
  if(G.endAt!=null&&G.t>=G.endAt) endGame();
  if(G.mi==='bus'&&G.t>420&&G.phase==='live') endGame();
  if(G.mi==='vis'&&G.t>560&&G.phase==='live') endGame();
}
function endGame(){ if(G.phase!=='live') return; G.phase='end'; G.res=G.mi==='bus'?busScore():visScore(); G.dirtyUI=true; render(); }
/* ================= dibujo ================= */
function layer(){ const M=G.M, k=2; const c=document.createElement('canvas'); c.width=M.w*k; c.height=M.h*k; const g=c.getContext('2d'); g.scale(k,k);
  g.fillStyle='#5d6166'; g.fillRect(0,0,M.w,M.h);
  const poly=(p,dx,dy)=>{ g.beginPath(); for(let i=0;i<p.length;i+=2){ if(i) g.lineTo(p[i]+(dx||0),p[i+1]+(dy||0)); else g.moveTo(p[i]+(dx||0),p[i+1]+(dy||0)); } g.closePath(); };
  g.fillStyle='#77736a'; (M.q||[]).forEach(p=>{ poly(p); g.fill(); });
  if(M.g){ g.fillStyle='#5f7a5c'; M.g.forEach(p=>{ poly(p); g.fill(); }); }
  if(G.mi==='bus'){ /* calzada de la ruta (solo dibujo) */ const R=G.route; g.lineCap='round'; g.lineJoin='round'; g.strokeStyle='#4f5358'; g.lineWidth=8.6; g.beginPath(); R.pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)'; g.lineWidth=0.25; g.setLineDash([3,4]); g.beginPath(); R.pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke(); g.setLineDash([]); }
  g.lineJoin='round'; g.strokeStyle='#80817f'; g.lineWidth=3.6; M.b.forEach(b=>{ poly(b); g.stroke(); }); g.strokeStyle='rgba(255,255,255,.10)'; g.lineWidth=4.4; M.b.forEach(b=>{ poly(b); g.stroke(); }); g.lineJoin='miter';
  g.fillStyle='rgba(8,10,14,.42)'; M.b.forEach(b=>{ poly(b,2.4,3); g.fill(); }); g.fillStyle='rgba(8,10,14,.22)'; M.b.forEach(b=>{ poly(b,4.8,6); g.fill(); });
  g.strokeStyle='#41464d'; g.lineWidth=0.5; M.b.forEach(b=>{ const hv=((Math.round(b[0]*7.3+b[1]*3.1)%9)+9)%9; const m=1+(hv-4)*0.05; g.fillStyle='rgb('+[43,47,53].map(v=>Math.round(v*m)).join(',')+')'; poly(b); g.fill(); g.save(); g.clip(); g.strokeStyle='rgba(255,255,255,.12)'; g.lineWidth=1.3; poly(b,0.7,0.8); g.stroke(); g.restore(); poly(b); g.stroke(); });
  if(M.x){ g.save(); g.strokeStyle='#8a8478'; g.lineWidth=3.4; g.lineCap='round'; M.x.forEach(p=>{ g.beginPath(); for(let i=0;i<p.length;i+=2){ if(i) g.lineTo(p[i],p[i+1]); else g.moveTo(p[i],p[i+1]); } g.stroke(); }); g.restore(); }
  if(M.st){ g.strokeStyle='#d6b25e'; g.lineWidth=1.6; poly(M.st); g.stroke(); g.fillStyle='rgba(214,178,94,.16)'; g.fill(); }
  const lg_=g.createLinearGradient(0,0,M.w,M.h); lg_.addColorStop(0,'rgba(255,236,200,.08)'); lg_.addColorStop(0.55,'rgba(255,236,200,0)'); lg_.addColorStop(1,'rgba(10,20,40,.16)'); g.fillStyle=lg_; g.fillRect(0,0,M.w,M.h);
  const rg=g.createRadialGradient(M.w/2,M.h/2,Math.min(M.w,M.h)*0.35,M.w/2,M.h/2,Math.max(M.w,M.h)*0.72); rg.addColorStop(0,'rgba(0,0,0,0)'); rg.addColorStop(1,'rgba(0,0,0,.24)'); g.fillStyle=rg; g.fillRect(0,0,M.w,M.h);
  /* nombres de calles */
  g.fillStyle='rgba(255,255,255,.62)'; g.font='600 6px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; (M.l||[]).forEach(l=>{ g.save(); g.translate(l[1],l[2]); g.rotate(l[3]||0); g.fillText(l[0],0,0); g.restore(); });
  return c; }
function fit(){ const wrap=CV.parentNode; const cw=wrap.clientWidth; const chMax=Math.max(280,Math.min(window.innerHeight*0.6,700)); const ch=Math.round(Math.min(chMax,cw*(G.mi==='bus'?1.15:0.95))); const s0=Math.max(cw/G.M.w,ch/G.M.h);
  const dpr=Math.min(2,window.devicePixelRatio||1); CV.style.width=cw+'px'; CV.style.height=ch+'px'; CV.width=Math.round(cw*dpr); CV.height=Math.round(ch*dpr);
  const z=(G.cam&&G.cam.z)||(G.mi==='bus'?3.2:3.0); G.cam={s0,z,s:s0*z,ox:(G.cam&&G.cam.ox)||0,oy:(G.cam&&G.cam.oy)||0,cw,ch,dpr}; if(!G.camSet){ G.camSet=1; center(G.mi==='bus'?G.bus.x:447,G.mi==='bus'?G.bus.y-30:306); } clampCam(); }
function clampCam(){ const c=G.cam; c.s=c.s0*c.z; const mw=G.M.w*c.s, mh=G.M.h*c.s; c.ox=mw<=c.cw?(c.cw-mw)/2:Math.min(0,Math.max(c.cw-mw,c.ox)); c.oy=mh<=c.ch?(c.ch-mh)/2:Math.min(0,Math.max(c.ch-mh,c.oy)); }
function center(x,y){ const c=G.cam; c.ox=c.cw/2-x*c.s; c.oy=c.ch/2-y*c.s; clampCam(); }
function zoom(f,cx,cy){ const c=G.cam; cx=cx==null?c.cw/2:cx; cy=cy==null?c.ch/2:cy; const wx=(cx-c.ox)/c.s, wy=(cy-c.oy)/c.s; c.z=Math.max(1,Math.min(10,c.z*f)); c.s=c.s0*c.z; c.ox=cx-wx*c.s; c.oy=cy-wy*c.s; clampCam(); }
function lerp(a,b,f){ return a+(b-a)*f; }
function lerpA(a,b,f){ let d=b-a; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return a+d*f; }
function draw(){ if(!CTX) return; const c=G.cam, g=CTX; const f=G.phase==='live'&&!G.pause?Math.max(0,Math.min(1,G.acc/DT)):1;
  if(G.mi==='bus'&&G.follow&&G.phase==='live'){ const b=G.bus; const bx=lerp(b.px,b.x,f), by=lerp(b.py,b.y,f); const tx=c.cw/2-(bx+Math.cos(b.hd)*14)*c.s, ty=c.ch/2-(by+Math.sin(b.hd)*14)*c.s; c.ox+=(tx-c.ox)*0.08; c.oy+=(ty-c.oy)*0.08; clampCam(); }
  g.setTransform(c.dpr,0,0,c.dpr,0,0); g.fillStyle='#3c4046'; g.fillRect(0,0,c.cw,c.ch); g.setTransform(c.dpr*c.s,0,0,c.dpr*c.s,c.dpr*c.ox,c.dpr*c.oy);
  g.imageSmoothingEnabled=true; g.drawImage(G.layerC,0,0,G.M.w,G.M.h);
  const px=1/c.s; /* 1 píxel de pantalla en metros */
  if(G.mi==='bus') drawBusExtras(g,f,px); else drawVisExtras(g,f,px);
  /* personas */
  const rP=Math.max(0.42,1.7*px);
  G.P.forEach(p=>{ if(!p.on) return; const x=lerp(p.px,p.x,f), y=lerp(p.py,p.y,f); let col=p.role==='vis'?'#ddd5c4':'#e9dcae'; if(p.role==='thr'&&p.seen&&!p.dis) col='#ff6b5a'; if(p.st==='out') col='#c9c2b2';
    g.globalAlpha=p.fade?Math.max(0,1-p.fade/3):1; g.fillStyle='rgba(0,0,0,.35)'; g.beginPath(); g.arc(x+0.25,y+0.3,rP,0,7); g.fill(); g.fillStyle=col; g.beginPath(); g.arc(x,y,rP,0,7); g.fill();
    if(p.seen&&!p.dis&&!p.done&&(p.role==='thr'||p.role==='run')){ g.strokeStyle=p.role==='thr'?'#ff4b3e':'#ff9b2f'; g.lineWidth=Math.max(0.18,1.6*px); g.beginPath(); g.arc(x,y,rP+Math.max(0.5,2.5*px),0,7); g.stroke(); }
    if(p.inRoad||p.st==='road'){ g.strokeStyle='#ffd23e'; g.lineWidth=Math.max(0.15,1.2*px); g.beginPath(); g.arc(x,y,rP+Math.max(0.4,2*px),0,7); g.stroke(); }
    if(p.st==='out'){ g.strokeStyle='#4ea1ff'; g.lineWidth=Math.max(0.15,1.2*px); g.beginPath(); g.arc(x,y,rP+Math.max(0.4,2*px),0,7); g.stroke(); } });
  g.globalAlpha=1;
  /* policía: UIP (puntos azules con escudo) y caballería (puntos grandes y alargados) */
  G.U.forEach(u=>{ const D=UK[u.k]; const sel=G.sel===u;
    u.m.forEach(m=>{ const x=lerp(m.px,m.x,f), y=lerp(m.py,m.y,f), h=m.hd;
      if(u.k==='cab'){ const L1=Math.max(1.25,3.6*px), W1=Math.max(0.55,1.8*px); g.save(); g.translate(x,y); g.rotate(h); g.fillStyle='rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0.35,0.45,L1,W1,0,0,7); g.fill(); g.fillStyle=u.nerv>0?'#a8774a':'#7a4f27'; g.beginPath(); g.ellipse(0,0,L1,W1,0,0,7); g.fill(); g.fillStyle='#5b3a1c'; g.beginPath(); g.ellipse(L1*0.85,0,W1*0.55,W1*0.42,0,0,7); g.fill(); g.fillStyle='#4ea1ff'; g.beginPath(); g.arc(-L1*0.08,0,W1*0.62,0,7); g.fill(); g.strokeStyle='#fff'; g.lineWidth=Math.max(0.1,0.8*px); g.stroke(); g.restore(); }
      else { const r=Math.max(0.45,1.9*px); g.fillStyle='rgba(0,0,0,.35)'; g.beginPath(); g.arc(x+0.25,y+0.3,r,0,7); g.fill(); g.fillStyle=D.col; g.beginPath(); g.arc(x,y,r,0,7); g.fill();
        if(u.form==='line'){ g.strokeStyle='#cfe6ff'; g.lineWidth=Math.max(0.22,1.4*px); g.beginPath(); g.arc(x,y,r+Math.max(0.12,0.7*px),h-0.9,h+0.9); g.stroke(); } } });
    if(sel){ g.strokeStyle='#e8c547'; g.lineWidth=Math.max(0.25,2*px); g.setLineDash([Math.max(1,5*px),Math.max(1,4*px)]); g.beginPath(); g.arc(u.cx,u.cy,u.k==='cab'?7:6,0,7); g.stroke(); g.setLineDash([]); if(u.st==='move'||u.fol){ g.strokeStyle='rgba(232,197,71,.6)'; g.beginPath(); g.moveTo(u.cx,u.cy); g.lineTo(u.tx,u.ty); g.stroke(); } }
    g.fillStyle='rgba(15,18,22,.78)'; const lab=u.k==='cab'?'C'+(u.i+1):'U'+(u.i+1); const fs=Math.max(1.6,10*px); g.font='700 '+fs+'px system-ui,sans-serif'; const tw=g.measureText(lab).width; const lx=u.cx-Math.cos(u.fc)*(u.k==='cab'?4:3), ly=u.cy-Math.sin(u.fc)*(u.k==='cab'?4:3); g.beginPath(); g.roundRect?g.roundRect(lx-tw/2-fs*0.35,ly-fs*0.65,tw+fs*0.7,fs*1.3,fs*0.4):g.rect(lx-tw/2-fs*0.35,ly-fs*0.65,tw+fs*0.7,fs*1.3); g.fill(); g.fillStyle=u.k==='cab'?'#e2b07c':'#9fd0ff'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(lab,lx,ly); });
  if(G.mi==='bus') drawBus(g,f,px);
  if(G.mi==='vis') drawVip(g,f,px);
  /* objetos lanzados */
  G.proj.forEach(pr=>{ const tt=Math.min(1,(G.t-pr.t0+(f-1)*DT)/pr.T); const x=lerp(pr.x0,pr.x1,tt), y=lerp(pr.y0,pr.y1,tt); const hgt=Math.sin(Math.min(1,tt)*Math.PI)*4;
    if(!pr.done||tt<1){ g.fillStyle='rgba(0,0,0,.35)'; g.beginPath(); g.arc(x,y,0.35,0,7); g.fill(); g.fillStyle=pr.k==='botella'?'#7fd18b':'#d0d4da'; g.beginPath(); g.arc(x-hgt*0.25,y-hgt,Math.max(0.35,1.6*px),0,7); g.fill(); }
    else { const a=Math.max(0,1-(G.t-pr.t0-pr.T)/2.5); g.strokeStyle='rgba(230,230,230,'+(a*0.8)+')'; g.lineWidth=Math.max(0.12,1*px); g.beginPath(); g.arc(pr.x1,pr.y1,0.6+(1-a)*2.2,0,7); g.stroke(); } });
  /* avisos sobre el mapa */
  const fs=Math.max(2,12*px); g.font='700 '+fs+'px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  G.call.filter(k=>G.t-k.t<3.5&&k.x!=null).forEach((k,i)=>{ const a=Math.min(1,(3.5-(G.t-k.t))/0.6); const tw=g.measureText(k.txt).width; const vx0=-c.ox/c.s, vx1=(c.cw-c.ox)/c.s, vy0=-c.oy/c.s; const half=tw/2+fs*0.7; const x=Math.max(vx0+half,Math.min(vx1-half,k.x)), y=Math.max(vy0+fs*1.2,k.y-fs*(2.2+i*1.6)); g.globalAlpha=a; g.fillStyle=k.c==='bad'?'rgba(120,30,24,.88)':k.c==='good'?'rgba(28,80,38,.88)':'rgba(20,24,30,.85)'; g.beginPath(); g.roundRect?g.roundRect(x-tw/2-fs*0.5,y-fs*0.75,tw+fs,fs*1.5,fs*0.5):g.rect(x-tw/2-fs*0.5,y-fs*0.75,tw+fs,fs*1.5); g.fill(); g.fillStyle='#fff'; g.fillText(k.txt,x,y); });
  g.globalAlpha=1;
  /* crédito OSM visible */
  g.setTransform(c.dpr,0,0,c.dpr,0,0); g.font='500 10px system-ui,sans-serif'; g.textAlign='right'; g.textBaseline='bottom'; g.fillStyle='rgba(0,0,0,.45)'; const ct='© OpenStreetMap contributors'; const cw2=g.measureText(ct).width; g.fillRect(c.cw-cw2-8,c.ch-15,cw2+8,15); g.fillStyle='rgba(255,255,255,.85)'; g.fillText(ct,c.cw-4,c.ch-2); }
function drawBusExtras(g,f,px){ const R=G.route, RL=R.len; const end=rAt(RL);
  g.strokeStyle='rgba(232,197,71,.85)'; g.lineWidth=Math.max(0.3,2*px); g.setLineDash([Math.max(1.5,6*px),Math.max(1.5,6*px)]); g.beginPath(); for(let s=G.bus.s;s<=RL;s+=4){ const p=rAt(s); s===G.bus.s?g.moveTo(p[0],p[1]):g.lineTo(p[0],p[1]); } g.lineTo(end[0],end[1]); g.stroke(); g.setLineDash([]);
  g.fillStyle='rgba(232,197,71,.25)'; g.strokeStyle='#e8c547'; g.beginPath(); g.arc(end[0],end[1],6,0,7); g.fill(); g.stroke();
  if(G.phase==='plan'){ G.spots.forEach(sp=>{ g.strokeStyle=sp.risk?'rgba(255,107,90,.9)':'rgba(233,220,174,.55)'; g.lineWidth=Math.max(0.3,1.6*px); g.setLineDash(sp.risk?[]:[Math.max(1,4*px),Math.max(1,3*px)]); g.beginPath(); g.arc(sp.x,sp.y,sp.arr?11:8,0,7); g.stroke(); g.setLineDash([]);
    const fs=Math.max(1.8,10*px); g.font='700 '+fs+'px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const t=sp.risk?L('Grupo de riesgo','Risk group'):sp.arr?L('Recibimiento','Welcome crowd'):L('Aficionados','Fans'); const tw=g.measureText(t).width; g.fillStyle='rgba(15,18,22,.75)'; g.fillRect(sp.x-tw/2-fs*0.4,sp.y-(sp.arr?11:8)-fs*1.6,tw+fs*0.8,fs*1.3); g.fillStyle=sp.risk?'#ff9f92':'#efe4bf'; g.fillText(t,sp.x,sp.y-(sp.arr?11:8)-fs*0.95); }); } }
function drawBus(g,f,px){ const b=G.bus; const x=lerp(b.px,b.x,f), y=lerp(b.py,b.y,f), h=lerpA(b.phd,b.hd,f); g.save(); g.translate(x,y); g.rotate(h);
  g.fillStyle='rgba(0,0,0,.4)'; g.fillRect(-b.len+0.5,-b.w/2+0.6,b.len,b.w); g.fillStyle=(b.hitT&&G.t-b.hitT<0.6)?'#ffd0c8':'#f1f2f4'; g.beginPath(); g.roundRect?g.roundRect(-b.len,-b.w/2,b.len,b.w,0.6):g.rect(-b.len,-b.w/2,b.len,b.w); g.fill();
  g.fillStyle='#2b3b52'; g.fillRect(-b.len+0.8,-b.w/2+0.35,b.len-2.6,b.w-0.7); g.fillStyle='#89a6c8'; g.fillRect(-1.5,-b.w/2+0.3,1.2,b.w-0.6); g.fillStyle='#c9a227'; g.fillRect(-b.len+1.2,-0.18,b.len-3.2,0.36);
  if(b.hits){ g.strokeStyle='#fff'; g.lineWidth=0.08; for(let i=0;i<Math.min(4,b.hits);i++){ const cx=-3-i*2.2; g.beginPath(); g.moveTo(cx-0.4,-0.5); g.lineTo(cx+0.3,0.2); g.lineTo(cx-0.1,0.6); g.stroke(); } }
  g.restore(); const fs=Math.max(1.8,10*px); g.font='700 '+fs+'px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const t=L('Autobús del equipo local','Home team bus'); const tw=g.measureText(t).width; const ly=y-Math.max(4,22*px); g.fillStyle='rgba(15,18,22,.78)'; g.fillRect(x-tw/2-fs*0.4,ly-fs*0.65,tw+fs*0.8,fs*1.3); g.fillStyle='#fff'; g.fillText(t,x,ly); }
function drawVisExtras(g,f,px){ /* tribuna con la bandera de España */ const d=G.dais; g.fillStyle='#3a3530'; g.fillRect(d[0]-4,d[1]-2,8,4); g.strokeStyle='#d6b25e'; g.lineWidth=0.3; g.strokeRect(d[0]-4,d[1]-2,8,4);
  g.fillStyle='#c60b1e'; g.fillRect(d[0]+4.6,d[1]-4.2,2.4,1.6); g.fillStyle='#ffc400'; g.fillRect(d[0]+4.6,d[1]-3.8,2.4,0.8); g.strokeStyle='#ddd'; g.lineWidth=0.12; g.beginPath(); g.moveTo(d[0]+4.6,d[1]-4.2); g.lineTo(d[0]+4.6,d[1]-1); g.stroke();
  const re=G.E[VIS_RES]; g.strokeStyle='rgba(232,197,71,.5)'; g.lineWidth=Math.max(0.3,1.2*px); g.setLineDash([Math.max(1,4*px),Math.max(1,4*px)]); g.beginPath(); g.moveTo(re.ix,re.iy); g.lineTo(d[0],d[1]); g.stroke(); g.setLineDash([]);
  G.E.forEach(e=>{ const sel=G.selE===e.i; const staff=e.mode==='A'||e.mode==='B'||e.mode==='C'; const pa=e.ang+Math.PI/2; const hw=3.2;
    if(e.mode==='V'){ for(const s of [-1,1]){ const ax=e.x-Math.cos(e.ang)*1.4+Math.cos(pa)*s*1.6, ay=e.y-Math.sin(e.ang)*1.4+Math.sin(pa)*s*1.6; g.fillStyle='#4ea1ff'; g.beginPath(); g.arc(ax,ay,Math.max(0.45,1.9*px),0,7); g.fill(); } }
    if(e.mode==='valla'||e.mode==='V'){ g.strokeStyle='#f2c94c'; g.lineWidth=0.7; g.beginPath(); g.moveTo(e.x-Math.cos(pa)*hw,e.y-Math.sin(pa)*hw); g.lineTo(e.x+Math.cos(pa)*hw,e.y+Math.sin(pa)*hw); g.stroke(); g.strokeStyle='#8a6d1f'; g.lineWidth=0.18; for(let k=-3;k<=3;k++){ const x=e.x+Math.cos(pa)*k, y=e.y+Math.sin(pa)*k; g.beginPath(); g.moveTo(x-Math.cos(e.ang)*0.4,y-Math.sin(e.ang)*0.4); g.lineTo(x+Math.cos(e.ang)*0.4,y+Math.sin(e.ang)*0.4); g.stroke(); } }
    if(staff){ /* puesto de control: dos calles y el equipo de 4 agentes */ for(const l of [0,1]){ const gp=gatePos(e,l); if(e.mode!=='A'){ g.fillStyle='#9aa3ad'; const ox=Math.cos(pa)*0.75, oy=Math.sin(pa)*0.75; g.fillRect(gp[0]-ox-0.18,gp[1]-oy-0.18,0.36,0.36); g.fillRect(gp[0]+ox-0.18,gp[1]+oy-0.18,0.36,0.36); g.strokeStyle='#9aa3ad'; g.lineWidth=0.12; g.beginPath(); g.moveTo(gp[0]-ox,gp[1]-oy); g.lineTo(gp[0]+ox,gp[1]+oy); g.stroke(); }
        g.fillStyle='#6d5b3a'; g.fillRect(gp[0]+Math.cos(e.ang)*1.2-0.5,gp[1]+Math.sin(e.ang)*1.2-0.5,1,1);
        for(const s of [-1,1]){ const ax=gp[0]+Math.cos(e.ang)*1.4+Math.cos(pa)*s*0.9*(l?1:-1)*0.6, ay=gp[1]+Math.sin(e.ang)*1.4+Math.sin(pa)*s*0.9*(l?1:-1)*0.6; const r=Math.max(0.45,1.9*px); g.fillStyle='#4ea1ff'; g.beginPath(); g.arc(ax,ay,r,0,7); g.fill(); } }
      const ln=G.E[e.i].lane; for(const l of [0,1]){ const c=ln[l]; if(c&&c.stage===1){ const gp=gatePos(e,l); g.strokeStyle='rgba(255,210,62,'+(0.5+0.5*Math.sin(G.t*8))+')'; g.lineWidth=0.25; g.beginPath(); g.arc(gp[0],gp[1],1.6,0,7); g.stroke(); } } }
    if(e.mode==='none'){ g.strokeStyle='rgba(255,107,90,.8)'; g.lineWidth=Math.max(0.3,1.4*px); g.setLineDash([Math.max(1,3*px),Math.max(1,3*px)]); g.beginPath(); g.moveTo(e.x-Math.cos(pa)*hw,e.y-Math.sin(pa)*hw); g.lineTo(e.x+Math.cos(pa)*hw,e.y+Math.sin(pa)*hw); g.stroke(); g.setLineDash([]); }
    const fs=Math.max(1.8,10*px); g.font='800 '+fs+'px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const lx=e.x-Math.cos(e.ang)*(5+fs*0.6), ly=e.y-Math.sin(e.ang)*(5+fs*0.6); const t=String(e.i+1)+(e.res?' ★':'');
    g.fillStyle=sel?'#e8c547':staff?'rgba(30,70,120,.92)':(e.mode==='valla'||e.mode==='V')?'rgba(110,88,25,.92)':'rgba(120,30,24,.9)'; g.beginPath(); g.arc(lx,ly,fs*0.95,0,7); g.fill(); g.fillStyle=sel?'#111':'#fff'; g.fillText(t,lx,ly); }); }
function drawVip(g,f,px){ const v=G.vip; if(!v.on) return; const x=lerp(v.px,v.x,f), y=lerp(v.py,v.y,f); const r=Math.max(0.6,2.4*px);
  for(let k=0;k<4;k++){ const a=k*Math.PI/2+0.78; g.fillStyle='#2a3340'; g.beginPath(); g.arc(x+Math.cos(a)*1.5,y+Math.sin(a)*1.5,Math.max(0.42,1.7*px),0,7); g.fill(); g.strokeStyle='#9fb3c8'; g.lineWidth=Math.max(0.08,0.6*px); g.stroke(); }
  g.fillStyle='#f2c94c'; g.beginPath(); g.arc(x,y,r,0,7); g.fill(); g.strokeStyle='#fff'; g.lineWidth=Math.max(0.12,1*px); g.stroke();
  const fs=Math.max(1.8,10*px); g.font='700 '+fs+'px system-ui,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; const t=L('Alta autoridad','Dignitary'); const tw=g.measureText(t).width; g.fillStyle='rgba(15,18,22,.78)'; g.fillRect(x-tw/2-fs*0.4,y-r-fs*1.7,tw+fs*0.8,fs*1.3); g.fillStyle='#f6e3a1'; g.fillText(t,x,y-r-fs*1.05); }

/* ================= interfaz ================= */
function objTxt(){ return G.mi==='bus'?L('Objetivo: que el autobús del equipo local llegue al estadio a tiempo y sin daños: calzada despejada, nadie delante del autobús y ningún objeto contra él, con la mínima fuerza.','Objective: get the home team bus to the stadium on time and unharmed: road clear, no one in front of the bus and nothing thrown at it, with minimum force.')
  :L('Objetivo: llega una alta autoridad a la Plaza Mayor. Controla todos los accesos (controles, cacheos, detector) para que no entre nada peligroso, sin colas eternas, y deja libre el acceso reservado (★).','Objective: a dignitary is coming to the Plaza Mayor. Control every entrance (checks, pat-downs, detector) so nothing dangerous gets in, without endless queues, and keep the reserved entrance (★) clear.'); }
function shell(){ C.page('<div class="mi" id="mi"><h2 style="margin:6px 0 2px">'+(G.mi==='bus'?L('Escolta del autobús del equipo','Team bus escort'):L('Visita oficial','Official visit'))+'</h2><p class="ad-note" style="margin:0 0 4px">'+(G.mi==='bus'?L('Madrid · Paseo de la Castellana → Avenida de Concha Espina (estadio Santiago Bernabéu). Ruta plausible, no la oficial.','Madrid · Paseo de la Castellana → Avenida de Concha Espina (Santiago Bernabéu stadium). Plausible route, not the official one.'):L('Madrid · Plaza Mayor (calles reales de OpenStreetMap).','Madrid · Plaza Mayor (real streets from OpenStreetMap).'))+'</p><div class="ad-obj">'+objTxt()+'</div><div id="mi-hud" class="mi-hud"></div><div class="mi-cv" id="mi-cvw"><canvas id="mi-cv"></canvas><div class="mi-zm"><button type="button" data-mz="in" aria-label="Zoom +">+</button><button type="button" data-mz="out" aria-label="Zoom −">−</button></div></div>'+legend()+'<div id="mi-ctl"></div><ul class="mi-log" id="mi-log"></ul>'+datos()+'</div>');
  CV=document.getElementById('mi-cv'); CTX=CV.getContext('2d'); G.layerC=layer(); G.cam=null; G.camSet=0; fit(); bindCanvas(); render(); }
function legend(){ return '<div class="mi-leg">'+(G.mi==='bus'?'<span style="--c:#e9dcae">'+L('Aficionados','Fans')+'</span><span style="--c:#ff4b3e">'+L('Posible lanzador (visto)','Possible thrower (spotted)')+'</span><span style="--c:#ff9b2f">'+L('Puede meterse en la calzada','May run into the road')+'</span>':'<span style="--c:#ddd5c4">'+L('Público','Public')+'</span><span style="--c:#f2c94c">'+L('Alta autoridad · vallas','Dignitary · barriers')+'</span><span style="--c:#2a3340">'+L('Escolta','Escort')+'</span>')+'<span style="--c:#4ea1ff">UIP</span><span style="--c:#7a4f27">'+L('Caballería (a caballo)','Mounted police')+'</span></div>'; }
function hudHTML(){ if(G.mi==='bus'){ const b=G.bus, RL=G.route.len; const eta=b.arr!=null?L('llegó','arrived'):Math.round(Math.max(0,G.ideal-G.t))+' s'; return '<span>⏱ <b>'+clockS(G.t)+'</b></span><span>'+L('Autobús','Bus')+' <b>'+Math.round(b.s)+'/'+Math.round(RL)+' m</b></span><span>'+L('Horario','Schedule')+' <b>'+(G.t<b.go?L('sale en ','leaves in ')+Math.ceil(b.go-G.t)+' s':eta)+'</b></span><span>'+L('Impactos','Hits')+' <b>'+G.sc.hits+'</b></span><span>'+L('En la calzada','In the road')+' <b>'+(G.sc.inc+G.sc.runIn)+'</b></span>'; }
  const inq=G.P.filter(p=>p.on&&(p.st==='q'||p.st==='chk')).length, ins=G.P.filter(p=>p.on&&p.st==='in').length; const w=G.sc.waits.length?Math.round(G.sc.waits.reduce((a,b)=>a+b,0)/G.sc.waits.length):0; const ta=G.tA-G.t;
  return '<span>⏱ <b>'+clockS(G.t)+'</b></span><span>'+L('Autoridad','Dignitary')+' <b>'+(ta>0?L('llega en ','arrives in ')+clockS(ta):(G.vip.st==='act'?L('en el acto','at the ceremony'):L('entrando','arriving')))+'</b></span><span>'+L('Dentro','Inside')+' <b>'+ins+'</b></span><span>'+L('En cola','Queueing')+' <b>'+inq+'</b></span><span>'+L('Espera media','Avg wait')+' <b>'+w+' s</b></span><span>'+L('Intervenido','Seized')+' <b>'+G.sc.found+'</b></span>'; }
function chips(){ return '<div class="mi-chips">'+G.U.map(u=>'<button type="button" class="mi-chip'+(G.sel===u?' on':'')+'" data-mu="'+u.id+'"><i style="background:'+UK[u.k].col+'"></i>'+esc(u.name)+(u.nerv>0?' · '+L('asustados','startled'):u.fol?' · '+L('escolta','escort'):u.idT?' · '+L('identificando','identifying'):'')+'</button>').join('')+'</div>'; }
function speedHTML(){ return '<div class="ad-seg" style="margin-top:6px">'+[1,2,4].map(s=>'<button type="button" data-msp="'+s+'" class="'+(G.spd===s&&!G.pause?'on':'')+'">x'+s+'</button>').join('')+'<button type="button" data-ma="pause" class="'+(G.pause?'on':'')+'">'+(G.pause?L('Seguir','Resume'):L('Pausa','Pause'))+'</button>'+(G.mi==='bus'?'<button type="button" data-ma="cam" class="'+(G.follow?'on':'')+'">'+L('Cámara: autobús','Camera: bus')+'</button>':'')+'</div>'; }
function ordersBus(){ const u=G.sel; if(!u) return '<p class="mi-tip">'+(G.phase==='plan'?L('Toca una unidad (o su botón) y luego el mapa para colocarla. Rojo = grupo de riesgo según la información previa.','Tap a unit (or its button), then the map to place it. Red = risk group according to prior intelligence.'):L('Toca una unidad para darle órdenes; con una unidad elegida, toca el mapa para moverla.','Tap a unit to give orders; with a unit selected, tap the map to move it.'))+'</p>';
  const cab=u.k==='cab'; const b=(o,t,s,dis)=>'<button type="button" class="ad-btn" data-mo="'+o+'"'+(dis?' disabled':'')+'>'+t+'<small>'+s+'</small></button>';
  return '<div class="mi-ord">'+b('line',L('Cordón','Cordon'),L('línea en el bordillo, de cara al público','line at the curb, facing the public'))+b('fol',L('Acompañar','Escort'),cab?L('abre paso delante del autobús (trote en avenida)','clears the way ahead of the bus (trot on avenues)'):L('van detrás a pie: no llegan','they follow on foot: too slow'))+(G.phase==='live'?b('push',L('Empujar','Push'),cab?L('separa al público rápido; no en calles estrechas','separates the public fast; not in narrow streets'):L('la línea avanza despacio','the line advances slowly'))+(cab?'':b('id',L('Identificar','Identify'),L('a un sospechoso ya visto; retira el objeto','a spotted suspect; take the object'))):'')+'</div><p class="mi-tip">'+(cab?L('Caballería: ve más lejos (posición elevada) y se ve desde lejos. Rápida en avenidas; en calles estrechas va al paso. Un objeto que cae cerca asusta a los caballos.','Mounted unit: sees further (elevated position) and is seen from afar. Fast on avenues; walks in narrow streets. An object landing nearby startles the horses.'):L('UIP: los escudos en línea paran los objetos y el cordón retiene a quien intenta pasar. A pie no alcanzan al autobús.','UIP: shields in line stop thrown objects and the cordon holds anyone trying to get through. On foot they cannot keep up with the bus.'))+(u.conf?' <b>'+L('Calle estrecha.','Narrow street.')+'</b>':'')+'</p>'; }
function entRows(){ const used=teamsUsed(); return '<p class="mi-tip">'+L('Agentes UIP asignados: ','UIP officers assigned: ')+'<b>'+used+'/'+G.teams+'</b> '+L('(control = 4, vallas + pareja = 2)','(checkpoint = 4, barriers + pair = 2)')+' · '+L('Toca un número en el mapa o elige aquí. El acceso ★ es el de la autoridad.','Tap a number on the map or choose here. Entrance ★ is the dignitary\'s.')+'</p><div class="mi-ent">'+G.E.map(e=>'<div class="r'+(G.selE===e.i?' on':'')+'"><b>'+esc(e.name)+(e.res?' ★ '+L('reservado a la autoridad','reserved for the dignitary'):'')+(G.phase==='live'&&(e.mode==='A'||e.mode==='B'||e.mode==='C')?' · '+L('cola ','queue ')+(laneCount(e,0)+laneCount(e,1)):'')+'</b><div class="ad-seg">'+Object.keys(VM).map(m=>'<button type="button" data-me="'+e.i+'" data-mm="'+m+'" class="'+(e.mode===m?'on':'')+'">'+L(VM[m][0],VM[m][1])+'</button>').join('')+'</div></div>').join('')+'</div>'+
  '<p class="mi-tip">'+L('Bolsos: encuentra objetos en bolsos y mochilas. Detector: además, objetos metálicos encima; si salta y hay indicio, registro corporal (art. 20). Cacheo a todos: lo encuentra todo, pero es lentísimo y sin indicios no se ajusta al art. 20. Una valla sola se puede saltar si ningún agente la ve (la caballería, desde arriba, vigila vallas a 40 m).','Bags: finds objects in bags and backpacks. Detector: also metal objects on the body; if it beeps and there are grounds, external body search (art. 20). Pat down everyone: finds everything, but it is very slow and without grounds it does not fit art. 20. A barrier alone can be climbed if no officer can see it (the mounted unit, from above, watches barriers 40 m away).')+'</p>'; }
function resultHTML(){ const r=G.res; const grade=r.tot>=90?L('Excelente','Excellent'):r.tot>=70?L('Bien','Good'):r.tot>=50?L('Mejorable','Needs work'):L('Mal','Poor');
  let h='<div class="mi-res"><div class="sc">'+r.tot+'<small style="font-size:16px"> / 100 · '+grade+'</small></div><ul class="ad-doc">'+r.parts.map(p=>'<li><span class="m '+(p[1]>=p[2]*0.85?'y':p[1]>=p[2]*0.4?'z':'n')+'">'+(p[1]>=p[2]*0.85?'✓':p[1]>=p[2]*0.4?'~':'✗')+'</span><span><b>'+esc(p[0])+': '+p[1]+'/'+p[2]+'</b><small>'+esc(p[3])+'</small></span></li>').join('')+'</ul>';
  const tips=G.mi==='bus'?[L('La patrulla a caballo, «por su posición elevada», observa mejor y es un punto de referencia (Policía Nacional). En el juego: delante del autobús, a los dos lados, disuade a quien quiere meterse.','A mounted patrol, «from its elevated position», sees better and is a point of reference (National Police). In the game: ahead of the bus, on both sides, it deters those who want to step in.'),L('Los grupos de riesgo se cubren antes con un cordón de la UIP: los escudos paran los objetos y la línea retiene a quien corre hacia la calzada.','Risk groups are covered beforehand with a UIP cordon: shields stop objects and the line holds anyone running for the road.'),L('Un objeto peligroso a la vista se puede retirar temporalmente (art. 18.2 LO 4/2015): identificar antes de que pase el autobús.','A dangerous object in sight can be temporarily seized (art. 18.2 LO 4/2015): identify before the bus passes.'),L('Proporcionalidad (art. 5 LO 2/1986): empujar solo cuando alguien invade la calzada.','Proportionality (art. 5 LO 2/1986): push only when someone is in the road.')]
   :[L('Todos los accesos, controlados o cerrados y vigilados: una valla sin nadie que la vea se salta.','Every entrance either checked or closed and watched: an unwatched barrier gets climbed.'),L('Controles en vías y lugares públicos para prevenir delitos graves: art. 17 LO 4/2015. Comprobación de efectos y objetos: art. 18.','Checkpoints on public roads and places to prevent serious crime: art. 17 LO 4/2015. Checks of belongings and objects: art. 18.'),L('Registro corporal externo solo con indicios racionales, por agente del mismo sexo y con injerencia mínima: art. 20. El detector da el indicio.','External body search only with reasonable grounds, by an officer of the same sex, with minimum intrusion: art. 20. The detector provides the grounds.'),L('Acceso reservado cerrado al público para la llegada de la autoridad, y caballería fuera para ver las vallas desde lejos.','Reserved entrance closed to the public for the dignitary, and the mounted unit outside to watch the barriers from afar.')];
  h+='<p style="margin:8px 0 2px"><b>'+L('Lo que dice la doctrina','What doctrine says')+'</b></p><ul style="margin:0;padding-left:18px;font-size:14px">'+tips.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';
  if(G.sc.hid&&G.sc.hid.length) h+='<p style="margin:8px 0 2px"><b>'+L('Lo que no visteis','What you did not see')+'</b></p><ul style="margin:0;padding-left:18px;font-size:14px">'+G.sc.hid.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';
  h+='<p class="ad-note">'+L('Puntuación: Estimación de M.A.T. Sin dados: con las mismas decisiones, la misma partida acaba igual.','Score: M.A.T estimate. No dice: the same decisions give the same result in the same game.')+'</p><div style="display:flex;flex-wrap:wrap;gap:6px"><button type="button" class="ad-btn pri" data-ma="again">'+L('Repetir esta partida','Replay this game')+'</button><button type="button" class="ad-btn" data-ma="new">'+L('Partida nueva','New game')+'</button><button type="button" class="ad-btn" data-ma="other">'+(G.mi==='bus'?L('Ir a «Visita oficial»','Go to «Official visit»'):L('Ir a «Escolta del autobús»','Go to «Team bus escort»'))+'</button><button type="button" class="ad-btn" data-ma="back">'+L('Volver a Antidisturbios','Back to Riot control')+'</button></div></div>'; return h; }
function render(){ const h=document.getElementById('mi-hud'); if(h) h.innerHTML=hudHTML(); const c=document.getElementById('mi-ctl'); if(!c) return; G.dirtyUI=false; let s='';
  if(G.phase==='end') s=resultHTML();
  else if(G.mi==='bus'){ s=chips()+ordersBus()+(G.phase==='plan'?'<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px"><button type="button" class="ad-btn pri ad-go" data-ma="start">'+L('Empezar: sale el autobús','Start: the bus leaves')+'</button><button type="button" class="ad-btn" data-ma="sug">'+L('Despliegue sugerido','Suggested deployment')+'</button></div>':speedHTML()); }
  else { s=(G.phase==='plan'?'':speedHTML())+entRows()+chips()+(G.sel?'<p class="mi-tip">'+L('Caballería: toca el mapa para '+(G.phase==='plan'?'colocarla':'moverla')+'. Ve las vallas desde más lejos (40 m) que un agente a pie (30 m).','Mounted unit: tap the map to '+(G.phase==='plan'?'place':'move')+' it. It watches barriers from further away (40 m) than an officer on foot (30 m).')+'</p>':'')+(G.phase==='plan'?'<div style="margin-top:6px"><button type="button" class="ad-btn pri ad-go" data-ma="start">'+L('Abrir los accesos al público','Open the entrances to the public')+'</button></div>':''); }
  c.innerHTML=s; const lgE=document.getElementById('mi-log'); if(lgE) lgE.innerHTML=G.log.slice(0,30).map(e=>'<li class="'+e.c+'"><time>'+clockS(e.t)+'</time>'+esc(e.txt)+'</li>').join(''); }
function suggest(){ /* despliegue de ejemplo (no es el óptimo): UIP en los grupos más numerosos, caballería escoltando */ const sp=G.spots.slice().sort((a,b)=>b.n-a.n); G.U.filter(u=>u.k==='uip').forEach((u,i)=>{ const s=sp[i]; if(!s) return; const p=rOff(s.s,s.side*5.4); placeU(u,p[0],p[1]); }); G.U.filter(u=>u.k==='cab').forEach((u,i)=>{ busOrder(u,'fol'); }); render(); }
function placeU(u,x,y){ const p=snap(x,y); u.cx=u.tx=p[0]; u.cy=u.ty=p[1]; u.vx=u.vy=0; u.fol=0; u.idT=null; u.st='line'; u.form='line'; u.F=null; u.fc=faceFor(u); u.hd=u.fc; u.m.forEach((m,j)=>{ const s=slot(u,j); m.x=m.px=s[0]; m.y=m.py=s[1]; m.vx=m.vy=0; m.hd=u.fc; }); }
function onTap(x,y){ if(G.phase==='end') return;
  if(G.mi==='vis'){ let be=null,bd=10; G.E.forEach(e=>{ const lx=e.x-Math.cos(e.ang)*6, ly=e.y-Math.sin(e.ang)*6; const d=Math.min(Math.hypot(e.x-x,e.y-y),Math.hypot(lx-x,ly-y)); if(d<bd){ bd=d; be=e; } }); if(be&&!(G.sel&&bd>5)){ G.selE=G.selE===be.i?null:be.i; G.sel=null; render(); return; } }
  let bu=null,bd=7; G.U.forEach(u=>{ u.m.forEach(m=>{ const d=Math.hypot(m.x-x,m.y-y); if(d<bd){ bd=d; bu=u; } }); }); if(bu){ G.sel=G.sel===bu?null:bu; render(); return; }
  if(G.sel){ const u=G.sel; if(!free(x,y)){ return; } if(G.phase==='plan') placeU(u,x,y); else { u.fol=0; u.idT=null; orderMove(u,x,y); } render(); } }
function bindCanvas(){ const P=new Map(); let drag=null, pinch=null, moved=false;
  const loc=e=>{ const r=CV.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
  CV.addEventListener('pointerdown',e=>{ CV.setPointerCapture(e.pointerId); P.set(e.pointerId,loc(e)); moved=false; if(P.size===1){ const p=loc(e); drag={x:p[0],y:p[1],ox:G.cam.ox,oy:G.cam.oy}; } else if(P.size===2){ const a=[...P.values()]; pinch={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),z:G.cam.z}; drag=null; } });
  CV.addEventListener('pointermove',e=>{ if(!P.has(e.pointerId)) return; P.set(e.pointerId,loc(e)); if(pinch&&P.size===2){ const a=[...P.values()]; const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]); const f=(pinch.z*d/pinch.d)/G.cam.z; zoom(f,(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2); moved=true; G.follow=false; }
    else if(drag){ const p=loc(e); const dx=p[0]-drag.x, dy=p[1]-drag.y; if(Math.hypot(dx,dy)>7) moved=true; if(moved){ G.cam.ox=drag.ox+dx; G.cam.oy=drag.oy+dy; clampCam(); if(G.follow){ G.follow=false; G.dirtyUI=true; } } } });
  const up=e=>{ const had=P.has(e.pointerId); P.delete(e.pointerId); if(P.size<2) pinch=null; if(had&&!moved&&P.size===0&&drag){ const p=loc(e); const c=G.cam; onTap((p[0]-c.ox)/c.s,(p[1]-c.oy)/c.s); } if(P.size===0) drag=null; };
  CV.addEventListener('pointerup',up); CV.addEventListener('pointercancel',e=>{ P.delete(e.pointerId); drag=null; pinch=null; });
  CV.addEventListener('wheel',e=>{ e.preventDefault(); const p=loc(e); zoom(e.deltaY<0?1.2:1/1.2,p[0],p[1]); },{passive:false}); }
function onClick(e){ const t=e.target.closest('[data-mu],[data-mo],[data-ma],[data-msp],[data-me],[data-mz],[data-mis]'); if(!t||!document.getElementById('mi')&&!t.dataset.mis) return;
  if(t.dataset.mis){ return; }
  if(!G) return;
  if(t.dataset.mz){ zoom(t.dataset.mz==='in'?1.4:1/1.4); return; }
  if(t.dataset.mu!=null){ const u=G.U[+t.dataset.mu]; G.sel=G.sel===u?null:u; if(G.sel&&G.mi==='bus'&&!G.follow) center(u.cx,u.cy); render(); return; }
  if(t.dataset.mo){ if(G.sel&&G.mi==='bus') busOrder(G.sel,t.dataset.mo); render(); return; }
  if(t.dataset.me!=null){ setMode(+t.dataset.me,t.dataset.mm); G.selE=+t.dataset.me; render(); return; }
  if(t.dataset.msp){ G.spd=+t.dataset.msp; G.pause=false; render(); return; }
  const a=t.dataset.ma;
  if(a==='start'){ G.phase='live'; G.t=0; G.acc=0; G.sel=null; if(G.mi==='bus'){ G.follow=true; lg('El autobús del equipo local saldrá en 8 s','The home team bus leaves in 8 s',''); } else lg('Se abren los accesos: empieza a llegar el público','Entrances open: the public starts arriving',''); render(); kick(); }
  else if(a==='pause'){ G.pause=!G.pause; render(); }
  else if(a==='cam'){ G.follow=!G.follow; render(); }
  else if(a==='sug') suggest();
  else if(a==='again') launch(G.mi,G.seed);
  else if(a==='new') launch(G.mi,(Math.random()*4294967296)>>>0);
  else if(a==='other') launch(G.mi==='bus'?'vis':'bus',(Math.random()*4294967296)>>>0);
  else if(a==='back'){ G=null; if(RAF){ cancelAnimationFrame(RAF); RAF=0; } C.back(); } }
function loop(ts){ RAF=0; if(!G||!/^#\/antidisturbios/.test(location.hash)||!document.getElementById('mi-cv')) return; const dt=Math.min(0.1,(ts-(LAST||ts))/1000); LAST=ts;
  if(G.phase==='live'&&!G.pause){ G.acc+=dt*G.spd; let n=0; while(G.acc>=DT&&n<40&&G.phase==='live'){ G.acc-=DT; n++; step(); } if(n>=40) G.acc=0; }
  draw(); if(ts-(G.hudT||0)>300){ G.hudT=ts; const h=document.getElementById('mi-hud'); if(h) h.innerHTML=hudHTML(); if(G.dirtyUI||(G.phase==='live'&&ts-(G.ctlT||0)>1500)){ G.ctlT=ts; render(); } }
  RAF=requestAnimationFrame(loop); }
function kick(){ if(!RAF){ LAST=0; RAF=requestAnimationFrame(loop); } }
function launch(mi,seed){ if(RAF){ cancelAnimationFrame(RAF); RAF=0; } G=null; seed=(seed>>>0)||1; if(mi==='bus') newBus(seed); else newVis(seed); shell(); kick(); window.scrollTo&&window.scrollTo(0,0); }
export function start(ctx){ C=ctx; if(!document.getElementById('micss')){ const s=document.createElement('style'); s.id='micss'; s.textContent=CSS; document.head.appendChild(s); }
  if(!BOUND){ BOUND=true; document.addEventListener('click',onClick); window.addEventListener('resize',()=>{ if(G&&CV&&document.getElementById('mi-cv')){ fit(); draw(); } }); }
  launch(ctx.mi==='vis'?'vis':'bus',ctx.seed!=null?ctx.seed:((Math.random()*4294967296)>>>0)); }
export function cards(){ return '<div class="mi-cards"><button type="button" class="mi-card" data-a="mi-bus"><b>'+L('Misión: Escolta del autobús del equipo','Mission: Team bus escort')+' <small class="ad-new">'+L('nuevo','new')+'</small></b><span>'+L('La UIP y la Caballería llevan el autobús del equipo local por la Castellana hasta el estadio: calzada despejada, nadie delante, ningún objeto contra él.','UIP and mounted police take the home team bus along the Castellana to the stadium: road clear, no one in front, nothing thrown at it.')+'</span></button><button type="button" class="mi-card" data-a="mi-vis"><b>'+L('Misión: Visita oficial','Mission: Official visit')+' <small class="ad-new">'+L('nuevo','new')+'</small></b><span>'+L('Llega una alta autoridad a la Plaza Mayor: la UIP en cada entrada con controles de acceso, detector y cacheos con indicios, sin colas eternas.','A dignitary arrives at the Plaza Mayor: UIP at every entrance with access checks, detector and pat-downs with grounds, without endless queues.')+'</span></button></div>'; }
if(typeof window!=='undefined') window.MAT_MI_DEBUG=()=>({G,step,busOrder,orderMove,placeU,setMode,onTap,render,draw,launch,rAt,rProj,UK,endGame,center,zoom,fit,hashAll,polNear});
