/* M.A.T — «Combate» táctico visto desde arriba: tu soldado (azul) contra 1–6 soldados IA (rojo).
   Mapas, simulación y dibujo hechos por M.A.T en código (canvas 2D). La simulación es determinista con semilla.
   Todos los factores del juego (probabilidades, tiempos de recarga, conos de visión) son estimaciones de M.A.T y se explican en la página. */
const EN=()=>window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es; const LL=a=>Array.isArray(a)?(EN()?(a[1]||a[0]):a[0]):(a||'');
/* ---------------- mapas ---------------- */
function wallG(x1,y1,x2,y2,gaps,t){ /* muro recto (horizontal o vertical) con huecos: gaps=[[desde,hasta,tipo]] tipo 'door' (vacío) o 'win' (ventana) */
  const H=y1===y2, a0=H?Math.min(x1,x2):Math.min(y1,y2), a1=H?Math.max(x1,x2):Math.max(y1,y2), c=H?y1:x1; const out=[]; let cur=a0;
  const P=(u,v,tt)=>{ if(v-u<0.01) return; out.push(H?[u,c,v,c,tt]:[c,u,c,v,tt]); };
  (gaps||[]).slice().sort((p,q)=>p[0]-q[0]).forEach(g=>{ P(cur,g[0],t||'w'); if(g[2]==='win') P(g[0],g[1],'win'); cur=g[1]; }); P(cur,a1,t||'w'); return out; }
function rectS(x,y,w,h,t){ return [[x,y,x+w,y,t],[x+w,y,x+w,y+h,t],[x+w,y+h,x,y+h,t],[x,y+h,x,y,t]]; }
function casa(){ const S=[]; const add=a=>a.forEach(s=>S.push(s));
  add(wallG(6,4,26,4,[[15.5,17.5,'win'],[22,24,'win']])); add(wallG(6,18,26,18,[[9,11,'win'],[23,25,'win']]));
  add(wallG(6,4,6,18,[[6,7.5,'win'],[11,12.2,'door']])); add(wallG(26,4,26,18,[[15.4,16.6,'door'],[6.5,8,'win']]));
  add(wallG(6,10,26,10,[[9,10.2,'door'],[15,16.2,'door'],[22.6,23.8,'door']]));
  add(wallG(13,4,13,10,[])); add(wallG(20,4,20,10,[[7,8.2,'door']])); add(wallG(17,10,17,18,[[15,16.2,'door']]));
  add(wallG(17,14,26,14,[[18.4,19.6,'door'],[23,24.2,'door']])); add(wallG(21,10,21,14,[]));
  /* muebles (cobertura baja) */ add(rectS(8.5,15.6,3,0.9,'low')); add(rectS(13.8,4.25,5.6,0.65,'low')); add(rectS(15.4,6.6,1.6,1.1,'low')); add(rectS(6.4,4.6,2,2.6,'low')); add(rectS(23.6,4.5,2,2.6,'low')); add(rectS(17.4,10.3,1.2,0.8,'low'));
  /* fuera: coche y murete */ add(rectS(1.2,15.2,1.8,4.5,'low')); add(wallG(0.8,3,4.5,3,[],'low')); add(wallG(28,8,28,13,[],'low'));
  const fl=[[6,4,20,14,'#a1927b'],[17,14,9,4,'#8f8a80'],[17,10,4,4,'#b8c0c4']];
  return {k:'casa',w:30,h:22,S,floors:fl,ground:'#5d6a48',cars:[[1.2,15.2,1.8,4.5]],
    rooms:[[6,10,11,8,['el salón','the living room']],[6,4,7,6,['el dormitorio 1','bedroom 1']],[13,4,7,6,['la cocina','the kitchen']],[20,4,6,6,['el dormitorio 2','bedroom 2']],[17,10,4,4,['el baño','the bathroom']],[21,10,5,4,['la habitación del fondo','the back room']],[17,14,9,4,['el pasillo trasero','the back corridor']]],
    blue:{p:[1.4,20.8],f:-Math.PI/3,route:[[3.4,13.4],[4.6,11.6,['la puerta principal','the front door']],[8.5,11.8],[14.5,12.5],[15.6,10.9],[15.6,8.6],[18.5,8.2],[20.9,7.6],[23.5,7.2],[17,8.2],[15.6,9.2],[13.5,11.2],[9.6,10.8],[9.6,8.2],[9.6,11.5],[15.4,15.6],[17.8,15.6],[21,16.2],[23.6,15.2],[23.6,12.4],[19,15],[19,12.2]]},
    red:[[18.6,8.6,Math.PI*0.95],[24.6,5.6,Math.PI*0.8],[16,16.6,-Math.PI*0.85],[7.6,5.2,Math.PI*0.35],[24.8,16.6,Math.PI],[24.6,11.2,Math.PI*0.75],[19.6,11.2,Math.PI*0.5],[11,6.8,Math.PI*0.6]],
    target:[16,11]}; }
function trincheras(){ const S=[]; const add=a=>a.forEach(s=>S.push(s));
  /* trinchera almenada (traveses): tramos a y=8 y y=12, de 1,6 m de ancho; los muros son de tierra; parapetos de sacos (bajos) en los puestos de tiro */
  const T=[[2,7.2,10.8,1.6],[9.2,7.2,1.6,6.4],[9.2,11.2,10.6,1.6],[18.2,7.2,1.6,6.4],[18.2,7.2,10.6,1.6],[27.2,7.2,1.6,6.4],[27.2,11.2,10.6,1.6],[36.2,7.2,1.6,6.4],[36.2,7.2,7.8,1.6],[22.4,1.6,1.6,5.8]];
  const occ=(x,y)=>T.some(r=>x>r[0]&&x<r[0]+r[2]&&y>r[1]&&y<r[1]+r[3]);
  /* bordes de la unión de rectángulos, por rejilla de 0,2 m */ const G=0.2, W=44, H=30; const segs=[];
  for(let y=0;y<=H;y+=G) for(let x=0;x<W;x+=G){ const a=occ(x+G/2,y-G/2), b=occ(x+G/2,y+G/2); if(a!==b) segs.push([x,y,x+G,y]); }
  for(let x=0;x<=W;x+=G) for(let y=0;y<H;y+=G){ const a=occ(x-G/2,y+G/2), b=occ(x+G/2,y+G/2); if(a!==b) segs.push([x,y,x,y+G]); }
  const mergeA=(arr,hz)=>{ const key=s=>hz?s[1].toFixed(2):s[0].toFixed(2); const by={}; arr.forEach(s=>{ (by[key(s)]=by[key(s)]||[]).push(s); }); const out=[];
    Object.values(by).forEach(l=>{ l.sort((p,q)=>hz?p[0]-q[0]:p[1]-q[1]); let c=l[0].slice(); for(let i=1;i<l.length;i++){ const s=l[i]; if(hz?Math.abs(s[0]-c[2])<1e-6:Math.abs(s[1]-c[3])<1e-6){ c[2]=s[2]; c[3]=s[3]; } else { out.push(c); c=s.slice(); } } out.push(c); }); return out; };
  let E=mergeA(segs.filter(s=>s[1]===s[3]),true).concat(mergeA(segs.filter(s=>s[0]===s[2]),false)).map(s=>[+s[0].toFixed(2),+s[1].toFixed(2),+s[2].toFixed(2),+s[3].toFixed(2),'e']);
  /* aberturas (rampas de entrada) y parapetos de sacos (puestos de tiro, lado sur) */
  const cut=(s,a0,a1,t)=>{ const H_=s[1]===s[3]; const u0=H_?Math.min(s[0],s[2]):Math.min(s[1],s[3]), u1=H_?Math.max(s[0],s[2]):Math.max(s[1],s[3]); if(a1<=u0||a0>=u1) return [s]; const c=H_?s[1]:s[0]; const r=[]; const P=(u,v,tt)=>{ if(v-u>0.01) r.push(H_?[u,c,v,c,tt]:[c,u,c,v,tt]); };
    P(u0,Math.max(u0,a0),s[4]); if(t) P(Math.max(u0,a0),Math.min(u1,a1),t); P(Math.min(u1,a1),u1,s[4]); return r; };
  const mods=[[1.6,[22.4,24],null],[7.2,[38.4,39.8],null],[12.8,[11.5,13.5],null],[12.8,[14.5,17],'low'],[8.8,[3,7],'low'],[8.8,[20,24.2],'low'],[12.8,[29.5,33],'low'],[8.8,[38.5,42],'low'],[8.8,[24.2,26.5],'low'],[12.8,[33.5,35.5],null],[8.8,[0,2.6],null]];
  mods.forEach(([y,[a0,a1],t])=>{ E=E.flatMap(s=>(s[1]===s[3]&&Math.abs(s[1]-y)<0.01)?cut(s,a0,a1,t):[s]); });
  /* el extremo oeste queda abierto (entrada) */ E=E.filter(s=>!(s[0]===s[2]&&s[0]===2&&s[1]>=7&&s[3]<=9));
  E.forEach(s=>S.push(s));
  /* búnker de hormigón al norte, con tronera y entrada desde la trinchera de comunicación */
  add(wallG(19.5,-0.2,27,-0.2,[])); add(wallG(19.5,1.6,27,1.6,[[22.4,24,'door']])); add(wallG(19.5,-0.2,19.5,1.6,[])); add(wallG(27,-0.2,27,1.6,[]));
  add(wallG(31,9.4,31,11.2,[],'w')); add(wallG(30.2,2.6,34.2,2.6,[[31.5,32.7,'door']])); add(wallG(30.2,5.6,34.2,5.6,[[31.4,32.8,'win']])); add(wallG(30.2,2.6,30.2,5.6,[[3.7,4.7,'win']])); add(wallG(34.2,2.6,34.2,5.6,[]));
  /* embudos (cráteres) con borde de tierra y alambrada como cobertura baja */
  const crat=[[13,21,1.3],[24,20,1.6],[7,18,1.1],[33,22,1.4],[19,24.5,1.2],[29,17.5,1.1]]; crat.forEach(([x,y,r])=>{ for(let i=0;i<10;i++){ if(i===7||i===8) continue; const a=i/10*Math.PI*2, b=(i+1)/10*Math.PI*2; S.push([x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,'low']); } });
  return {k:'trincheras',w:44,h:30,S,floors:[],ground:'#6b6a4a',trench:T,crat,
    rooms:[[2,7,17,6,['el tramo oeste de la trinchera','the west trench bay']],[18,7,10,6,['el tramo central','the central bay']],[27,7,17,6,['el tramo este','the east bay']],[19.5,-0.2,7.5,1.8,['el búnker','the bunker']],[22.4,1.6,1.6,5.8,['la trinchera de comunicación','the communication trench']],[30.2,2.6,4,3,['el puesto de hormigón','the concrete post']]],
    blue:{p:[0.8,1.2],f:Math.PI/2,route:[[1.0,6.4],[1.2,8.0,['la entrada de la trinchera','the trench entrance']],[6,8],[10,8.2],[10,12],[15,12],[19,11.8],[19,8],[23.2,8],[23.2,4],[23.2,0.8],[21,0.7],[25.5,0.7],[23.2,4],[23.2,8],[28,8],[28,12],[33,12],[37,12],[37,8],[42,8]]},
    red:[[15.5,12.1,Math.PI/2],[24.8,8,Math.PI*0.5],[32,12.1,Math.PI/2],[5,8,Math.PI*0.55],[23.2,0.7,Math.PI/2],[40,8,Math.PI*0.6],[32,4.4,Math.PI*0.5],[11,12.1,Math.PI*0.5]],
    target:[23,6]}; }

function pueblo(){ const S=[]; const add=a=>a.forEach(s=>S.push(s));
  /* B1 casa de dos habitaciones (noroeste) */ add(wallG(4,3,16,3,[[6,8,'win'],[12,14,'win']])); add(wallG(4,12,16,12,[[6,8,'win'],[12,13.2,'door']])); add(wallG(4,3,4,12,[[6,8,'win']])); add(wallG(16,3,16,12,[[5,6.5,'win']])); add(wallG(10,3,10,12,[[6,7.2,'door']])); add(rectS(5,4,1.6,2,'low'));
  /* B5 tienda */ add(wallG(17,3,21,3,[])); add(wallG(17,8,21,8,[[18,19.5,'win']])); add(wallG(17,3,17,8,[])); add(wallG(21,3,21,8,[[5,6.2,'door']])); add(rectS(17.5,3.5,3,0.7,'low'));
  /* B2 ayuntamiento (noreste) */ add(wallG(32,2,46,2,[[35,37,'win'],[41,43,'win']])); add(wallG(32,12,46,12,[[34,36,'win'],[38,39.4,'door'],[42,44,'win']])); add(wallG(32,2,32,12,[[6,8,'win']])); add(wallG(46,2,46,12,[[6,8,'win']])); add(wallG(40,2,40,8,[])); add(rectS(35,5,3,1,'low'));
  /* B3 casa (suroeste) */ add(wallG(3,24,14,24,[[4.5,6.5,'win'],[7,8.2,'door'],[10.5,12.5,'win']])); add(wallG(3,33,14,33,[[6,8,'win']])); add(wallG(3,24,3,33,[[27,29,'win']])); add(wallG(14,24,14,33,[[29.5,31,'win']])); add(wallG(3,28.5,14,28.5,[[10,11.2,'door']])); add(rectS(4,30,2,2.4,'low'));
  /* B4 edificio en ruinas (sureste): muros con brechas */ add(wallG(33,24,45,24,[[36,37.2,'door'],[39.5,41.5,'door']])); add(wallG(33,33,45,33,[[37,40,'door']])); add(wallG(33,24,33,33,[[28,29.2,'door']])); add(wallG(45,24,45,33,[[26,28,'win']])); add(wallG(39,24,39,29,[[26,27.2,'door']]));
  [[35,30,0.8,0.6],[41,31,1.2,0.6],[43.5,25.2,0.6,0.9],[36.5,27.5,0.9,0.5]].forEach(r=>add(rectS(r[0],r[1],r[2],r[3],'low')));
  /* muretes de jardín y coches */ add(wallG(30,13.4,47,13.4,[[37.6,40,'door']],'low')); add(wallG(29.6,23,29.6,34,[[27,29,'door']],'low')); add(wallG(2,22.6,15,22.6,[[6.6,8.6,'door']],'low'));
  const cars=[[8,18.4,4.4,1.8],[17,15.8,4.4,1.8],[30,19.2,4.4,1.8],[23.6,26,1.8,4.4],[41,16,4.4,1.8]]; cars.forEach(c=>add(rectS(c[0],c[1],c[2],c[3],'low')));
  const fl=[[0,14.5,50,7.5,'#4b4e52'],[22,0,6.5,36,'#4b4e52'],[0,13.8,50,0.7,'#7b776d'],[0,22,50,0.6,'#7b776d'],[21.4,0,0.6,36,'#7b776d'],[28.5,0,0.6,36,'#7b776d'],
    [4,3,12,9,'#a1927b'],[17,3,4,5,'#b4a68c'],[32,2,14,10,'#9c8f7c'],[3,24,11,9,'#a1927b'],[33,24,12,9,'#857a6a']];
  return {k:'pueblo',w:50,h:36,S,floors:fl,ground:'#66704f',cars,
    rooms:[[4,3,6,9,['la casa del noroeste (oeste)','the north-west house (west room)']],[10,3,6,9,['la casa del noroeste (este)','the north-west house (east room)']],[17,3,4,5,['la tienda','the shop']],[32,2,8,10,['el ayuntamiento (oeste)','the town hall (west)']],[40,2,6,10,['el ayuntamiento (este)','the town hall (east)']],[3,24,11,4.5,['la casa del suroeste (delante)','the south-west house (front)']],[3,28.5,11,4.5,['la casa del suroeste (fondo)','the south-west house (back)']],[33,24,12,9,['el edificio en ruinas','the ruined building']],[0,14.5,50,7.5,['la calle mayor','the main street']],[22,0,6.5,36,['la calle transversal','the cross street']]],
    blue:{p:[0.8,18],f:0,route:[[6.5,17.2,['la calle mayor','the main street']],[12.6,13.4],[12.6,10.4],[13,6],[10,6.6],[7,6.6],[7,10],[12.6,13.4],[7.6,22.2],[7.6,25.6],[11,26.4],[10.6,29.8],[6,30.8],[7.6,25.6],[7.6,22],[16,20.6],[22.8,6],[19,5.6],[22.8,9],[26,14],[38.7,14.2],[38.7,10.6],[36,7],[34,9],[42,9],[43.4,4.6],[38.7,10.6],[38.7,14.2],[36.6,22.6],[36.6,25.4],[36,30],[39,26.6],[42,28.5],[42,25.4],[31,28],[26,24]]},
    red:[[7.2,10.4,Math.PI*0.5],[36.5,9.6,Math.PI*0.5],[43.5,5,Math.PI*0.6],[6.5,26.8,-Math.PI*0.5],[40.5,27.5,-Math.PI*0.6],[19,5.6,Math.PI*0.5],[31.5,18.6,Math.PI],[13.6,9.6,Math.PI*0.6]],
    target:[38,8]}; }
export const MAPS={casa,trincheras,pueblo};
/* ---------------- geometría ---------------- */
function segX(ax,ay,bx,by,cx,cy,dx,dy){ const r1=bx-ax, r2=by-ay, s1=dx-cx, s2=dy-cy; const den=r1*s2-r2*s1; if(Math.abs(den)<1e-9) return -1; const t=((cx-ax)*s2-(cy-ay)*s1)/den, u=((cx-ax)*r2-(cy-ay)*r1)/den; return (t>=0&&t<=1&&u>=0&&u<=1)?t:-1; }
function dSeg(px,py,s){ const vx=s[2]-s[0], vy=s[3]-s[1]; const l=vx*vx+vy*vy; let t=l?((px-s[0])*vx+(py-s[1])*vy)/l:0; t=Math.max(0,Math.min(1,t)); const x=s[0]+vx*t-px, y=s[1]+vy*t-py; return Math.sqrt(x*x+y*y); }
export const AIK=0.45; /* la IA dispara con menos precisión que tu soldado: ajuste de juego (estimación de M.A.T) */
const BLOCK_LOS={w:1,e:1}, BLOCK_MOVE={w:1,e:1,win:1,low:1};
/* ---------------- aleatorio con semilla ---------------- */
export function rng(seed){ let a=seed>>>0; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
/* ---------------- simulación ---------------- */
export function makeSim(mapKey,blue,reds,o){ const M=MAPS[mapKey](); const R=rng(o.seed||1); const night=!!o.night; const ev=[]; let T=0;
  const sim={M,T:0,ev,agents:[],fx:[],over:null,night,stats:{},destroyed:[],strike:null};
  const log=(es,en,cls)=>{ ev.push({t:T,es,en,cls}); };
  /* rejilla de navegación (0,5 m) */ const C=0.5, gw=Math.ceil(M.w/C), gh=Math.ceil(M.h/C); let blk=new Uint8Array(gw*gh);
  function rebuildGrid(){ blk=new Uint8Array(gw*gh); for(let j=0;j<gh;j++) for(let i=0;i<gw;i++){ const x=(i+0.5)*C, y=(j+0.5)*C; for(const s of M.S){ if(!BLOCK_MOVE[s[4]]) continue; if(dSeg(x,y,s)<0.3){ blk[j*gw+i]=1; break; } } } }
  rebuildGrid(); sim.grid=()=>({blk,gw,gh,C});
  const cellOf=(x,y)=>[Math.max(0,Math.min(gw-1,Math.floor(x/C))),Math.max(0,Math.min(gh-1,Math.floor(y/C)))];
  function nearestFree(i,j){ if(!blk[j*gw+i]) return [i,j]; for(let r=1;r<8;r++) for(let dj=-r;dj<=r;dj++) for(let di=-r;di<=r;di++){ const a=i+di,b=j+dj; if(a>=0&&b>=0&&a<gw&&b<gh&&!blk[b*gw+a]) return [a,b]; } return [i,j]; }
  function astar(ax,ay,bx,by){ let [si,sj]=nearestFree(...cellOf(ax,ay)), [ti,tj]=nearestFree(...cellOf(bx,by)); const N=gw*gh, g=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), closed=new Uint8Array(N);
    const open=[]; const h=(i,j)=>Math.hypot(i-ti,j-tj); const s=sj*gw+si; g[s]=0; open.push([h(si,sj),s]); let it=0;
    while(open.length&&it++<20000){ let bi=0; for(let k=1;k<open.length;k++) if(open[k][0]<open[bi][0]) bi=k; const cur=open.splice(bi,1)[0][1]; if(closed[cur]) continue; closed[cur]=1; const ci=cur%gw, cj=(cur/gw)|0; if(ci===ti&&cj===tj) break;
      for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){ if(!di&&!dj) continue; const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=gw||nj>=gh) continue; const n=nj*gw+ni; if(blk[n]||closed[n]) continue; if(di&&dj&&(blk[cj*gw+ni]||blk[nj*gw+ci])) continue;
        const ng=g[cur]+(di&&dj?1.414:1); if(ng<g[n]){ g[n]=ng; from[n]=cur; open.push([ng+h(ni,nj),n]); } } }
    const t=tj*gw+ti; if(from[t]<0&&t!==s) return null; const path=[]; let c=t; while(c>=0&&c!==s){ path.push([(c%gw+0.5)*C,((c/gw|0)+0.5)*C]); c=from[c]; } path.reverse(); path.push([bx,by]);
    /* suavizado: salta a la vista más lejana sin obstáculos */ const clear=(x0,y0,x1,y1)=>{ const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/0.2); for(let k=1;k<n;k++){ const x=x0+(x1-x0)*k/n, y=y0+(y1-y0)*k/n; const [i,j]=cellOf(x,y); if(blk[j*gw+i]) return false; } return true; };
    const out=[]; let px=ax, py=ay, k=0; while(k<path.length){ let far=k; for(let m=path.length-1;m>k;m--){ if(clear(px,py,path[m][0],path[m][1])){ far=m; break; } } out.push(path[far]); px=path[far][0]; py=path[far][1]; k=far+1; } return out; }
  sim.astar=astar;
  const losBlocked=(ax,ay,bx,by)=>{ for(const s of M.S){ if(!BLOCK_LOS[s[4]]) continue; if(segX(ax,ay,bx,by,s[0],s[1],s[2],s[3])>=0) return true; } return false; };
  sim.los=(a,b)=>!losBlocked(a.x,a.y,b.x,b.y);
  function inCover(t,sh){ /* cobertura baja o ventana entre el tirador y el blanco, a menos de 1,6 m del blanco */ const dx=t.x-sh.x, dy=t.y-sh.y, d=Math.hypot(dx,dy); if(d<1.2) return false;
    for(const s of M.S){ if(s[4]!=='low'&&s[4]!=='win') continue; const u=segX(sh.x,sh.y,t.x,t.y,s[0],s[1],s[2],s[3]); if(u>=0&&(1-u)*d<1.6) return true; } return false; }
  /* agentes */ let id=0;
  function mk(team,kit,x,y,f,extra){ const a=Object.assign({id:id++,team,kit,x,y,dir:f,hp:100,alive:true,sup:0,mag:kit.magSize,reloadT:0,aimT:0,burst:0,cd:0,path:null,pi:0,mode:'hold',tgt:null,known:null,duck:0,frags:kit.frags||0,fl:0,hold:f,flank:false,flankT:0,moving:false,lastShot:-9,stops:0,hitsT:0,hits:0,fired:0,kills:0,nightKills:0,seenBy:{},label:kit.short},extra||{}); sim.agents.push(a); return a; }
  const B=mk(0,blue,M.blue.p[0],M.blue.p[1],M.blue.f,{route:M.blue.route.slice(),ri:0,name:L('Tu soldado','Your soldier')});
  const spots=M.red.slice(); for(let i=spots.length-1;i>0;i--){ const j=Math.floor(R()*(i+1)); [spots[i],spots[j]]=[spots[j],spots[i]]; }
  reds.forEach((k,i)=>{ const s=spots[i%spots.length]; const a=mk(1,k,s[0],s[1],s[2],{name:L('Enemigo '+(i+1),'Enemy '+(i+1)),flank:R()<0.4}); });
  const roomOf=(x,y)=>{ const r=(M.rooms||[]).find(r=>x>=r[0]&&x<=r[0]+r[2]&&y>=r[1]&&y<=r[1]+r[3]); return r?LL(r[4]):null; };
  sim.roomOf=roomOf;
  /* visión: de día hasta 60 m; de noche 8 m a simple vista, 40 m con visor nocturno o mira nocturna; linterna: 25 m y te delata */
  function visRange(a){ const k=a.kit; const att=a.team===0?1.15:(a.known&&T-a.known.t<8?1.0:0.7); if(!night) return {r:60,c:att}; if(k.nvg) return {r:40,c:Math.min(att,0.85)}; if(k.nightSight) return {r:40,c:0.32}; if(k.light) return {r:25,c:0.5}; return {r:8,c:att}; }
  sim.visRange=visRange;
  function sees(a,b){ if(!b.alive) return false; const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy); const V=visRange(a);
    let r=V.r; const ang=Math.abs(angD(Math.atan2(dy,dx),a.dir)); let inCone=ang<=V.c||d<1.6;
    if(night){ if(b.kit.light&&!b.kit.nvg&&d<45&&b.mode!=='hold') { r=Math.max(r,45); inCone=inCone||ang<1.6; } if(T-b.lastShot<0.4&&d<60){ r=Math.max(r,60); inCone=inCone||ang<1.7; } }
    if(d>r||!inCone) return false; return !losBlocked(a.x,a.y,b.x,b.y); }
  sim.sees=sees;
  const angD=(a,b)=>{ let d=a-b; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return d; };
  const enemiesOf=a=>sim.agents.filter(b=>b.team!==a.team&&b.alive);
  function hearShot(sh){ sim.agents.forEach(b=>{ if(b.team!==sh.team&&b.alive&&Math.hypot(b.x-sh.x,b.y-sh.y)<35){ b.known={x:sh.x,y:sh.y,t:T}; } }); }
  /* un disparo */
  function shoot(a,t){ const k=a.kit; a.mag--; a.fired++; a.lastShot=T; hearShot(a); const d=Math.hypot(t.x-a.x,t.y-a.y);
    let p=0.3*Math.exp(-d/25)+0.03; const mag=k.mag||1; if(mag>=3&&d>25) p*=1.3; else if(k.dot&&d<50) p*=1.1; else if(mag<1.5&&!k.dot&&d>25) p*=0.9;
    if(k.alc&&d>k.alc) p*=Math.pow(k.alc/d,2); const cov=inCover(t,a); if(t.duck>0) p*=0.15; else if(cov) p*=0.45; if(t.moving) p*=0.8; p*=1-0.5*a.sup;
    if(night){ if(k.nvg) p*=k.irLaser?1:0.85; else if(k.nightSight) p*=0.95; else if(!k.light) p*=0.8; } if(k.mg) p*=0.8; if(a.team===1) p*=AIK; p=Math.max(0.01,Math.min(0.8,p));
    const hit=R()<p; let ex=t.x, ey=t.y; const fxs={t:'tr',x0:a.x,y0:a.y,team:a.team,t0:T};
    if(hit){ a.hits++; const u=R(); let dmg=0, stop=false, loc; if(u<0.1){ loc='head'; dmg=100; } else if(u<0.6){ loc='torso'; if(t.kit.plate&&R()<(t.kit.plateN>=2?0.7:0.55)){ stop=true; dmg=5; t.stops++; } else dmg=45; } else { loc='limb'; dmg=25; }
      t.hp-=dmg; t.hitsT++; t.sup=Math.min(1,t.sup+(stop?0.3:0.2)); fxs.hit=true; fxs.stop=stop;
      if(stop) log((t.team===0?'Tu placa para un impacto':t.name+': su placa para un impacto')+' ('+Math.round(d)+' m)',(t.team===0?'Your plate stops a hit':t.name+': plate stops a hit')+' ('+Math.round(d)+' m)','hit');
      if(t.hp<=0&&t.alive){ t.alive=false; a.kills++; if(loc==='head') t.headK=true; const vis=night&&!sees(t,a); if(vis) a.nightKills++; t.killedBy=a.id;
        log((a.team===0?'Tu soldado abate a ':t.team===0?a.name+' abate a ':'')+(t.team===0?'tu soldado':t.name)+(loc==='head'?' (impacto en la cabeza)':'')+(roomOf(t.x,t.y)?' en '+roomOf(t.x,t.y):''),(a.team===0?'Your soldier takes down ':a.name+' takes down ')+(t.team===0?'your soldier':t.name)+(loc==='head'?' (head hit)':''),'kill'); sim.lastKill={a:a.id,t:t.id,T,d,loc,stop}; } }
    else { const ang=Math.atan2(t.y-a.y,t.x-a.x)+(R()-0.5)*0.22; const L_=d+1.5+R()*4; ex=a.x+Math.cos(ang)*L_; ey=a.y+Math.sin(ang)*L_; t.sup=Math.min(1,t.sup+(k.mg?0.09:0.06));
      /* la bala se para en el primer muro */ let best=1; for(const s of M.S){ if(!BLOCK_LOS[s[4]]&&s[4]!=='low') continue; const u=segX(a.x,a.y,ex,ey,s[0],s[1],s[2],s[3]); if(u>0.02&&u<best) best=u; } ex=a.x+(ex-a.x)*best; ey=a.y+(ey-a.y)*best; fxs.wall=best<1; }
    fxs.x1=hit?t.x:ex; fxs.y1=hit?t.y:ey; sim.fx.push(fxs); }
  /* granada M67: retardo 4–5 s; radio mortal 5 m y de heridas 15 m (Wikipedia, «M67 grenade») */
  function throwFrag(a,tx,ty){ a.frags--; const d=Math.hypot(tx-a.x,ty-a.y); const fl=Math.max(0.6,d/12); sim.fx.push({t:'gren',x0:a.x,y0:a.y,x1:tx,y1:ty,t0:T,fl,boom:T+4.2,team:a.team,done:false}); a.fragT=T+4.4; a.lastFrag=T; log((a.team===0?'Tu soldado lanza una granada M67':a.name+' lanza una granada')+(roomOf(tx,ty)?' hacia '+roomOf(tx,ty):''),(a.team===0?'Your soldier throws an M67 grenade':a.name+' throws a grenade'),'gren'); }
  function boom(g){ g.done=true; sim.fx.push({t:'boom',x:g.x1,y:g.y1,t0:T,r:5,r2:15});
    sim.agents.forEach(b=>{ if(!b.alive) return; const d=Math.hypot(b.x-g.x1,b.y-g.y1); if(d>15) return; if(losBlocked(g.x1,g.y1,b.x,b.y)) return; let dmg=0; if(d<5) dmg=R()<0.75?100:60; else if(R()<0.5) dmg=Math.round(40*(1-(d-5)/10)); b.sup=1; if(dmg>0){ b.hp-=dmg; b.hitsT++; if(b.hp<=0){ b.alive=false; const th=sim.agents.find(x=>x.team===g.team); if(th) { th.kills++; th.gKills=(th.gKills||0)+1; } log((b.team===0?'La granada alcanza a tu soldado':'La granada deja fuera de combate a '+b.name),(b.team===0?'The grenade hits your soldier':'The grenade takes out '+b.name),'kill'); sim.lastKill={a:g.team===0?B.id:-1,t:b.id,T,d,gren:true}; } } }); }
  /* apoyo aéreo/artillería antes de entrar */
  sim.applyStrike=function(st){ if(!st) return; const [cx,cy]=st.at; sim.strike=st; let killed=0, dWalls=0;
    const rounds=st.rounds||[[cx,cy]]; rounds.forEach(([x,y])=>{ /* cráter y muros destruidos */
      const before=M.S.length; const rW=st.rD*1.6; M.S=M.S.filter(s=>{ const d=dSeg(x,y,s); if(d<rW){ dWalls++; if(s[4]==='w'||s[4]==='win'){ /* escombros: un trozo bajo */ if(R()<0.35) sim.destroyed.push([ (s[0]+s[2])/2+(R()-0.5),(s[1]+s[3])/2+(R()-0.5)]); } return false; } return true; });
      sim.agents.forEach(b=>{ if(!b.alive||b.team===0) return; const d=Math.hypot(b.x-x,b.y-y); if(d<st.rD||(d<st.rD*2&&R()<0.85)){ b.alive=false; b.hp=0; killed++; b.byStrike=true; return; }
        if(d<st.rL){ const prot=losBlocked(x,y,b.x,b.y)?(M.k==='trincheras'?0.1:0.2):1; const pk=st.pk*prot*Math.pow(1-d/st.rL,1.5); if(R()<pk){ b.alive=false; b.hp=0; killed++; b.byStrike=true; } else { b.hp-=Math.round(25*prot*(1-d/st.rL)); b.sup=1; if(b.hp<=0){ b.alive=false; killed++; b.byStrike=true; } } } }); });
    sim.destroyed.forEach(([x,y])=>{ M.S.push([x-0.5,y,x+0.5,y+0.2,'low']); });
    rebuildGrid(); st.killed=killed; st.walls=dWalls; log(LL(st.logN)+': '+(killed?killed+(killed>1?' enemigos fuera de combate':' enemigo fuera de combate'):'ningún enemigo fuera de combate')+(dWalls?', '+dWalls+' tramos de muro destruidos':''),LL(st.logN)+': '+killed+' enem'+(killed===1?'y':'ies')+' out of action'+(dWalls?', '+dWalls+' wall sections destroyed':''),'air');
    if(!enemiesOf(B).length){ sim.over={w:0,how:'strike'}; } };
  /* paso de simulación */
  function moveAlong(a,dt){ if(!a.path||a.pi>=a.path.length){ a.moving=false; return true; } const sp=2.4/a.kit.move*(a.duck>0?0:1)*(a.team===1&&a.flankRun?1.15:1); let rem=sp*dt; a.moving=rem>0;
    while(rem>0&&a.pi<a.path.length){ const [tx,ty]=a.path[a.pi]; const dx=tx-a.x, dy=ty-a.y, d=Math.hypot(dx,dy); if(d<1e-3){ a.pi++; continue; } const want=Math.atan2(dy,dx); turn(a,want,dt*0.8); const s=Math.min(d,rem); a.x+=dx/d*s; a.y+=dy/d*s; rem-=s; if(s>=d-1e-6) a.pi++; } return a.pi>=a.path.length; }
  function turn(a,want,dt){ const d=angD(want,a.dir); const m=6*dt; a.dir+=Math.max(-m,Math.min(m,d)); return Math.abs(d)<0.12; }
  function goTo(a,x,y){ const p=astar(a.x,a.y,x,y); a.path=p; a.pi=0; a.goal=[x,y]; return !!p; }
  function pickTarget(a){ const vis=enemiesOf(a).filter(b=>sees(a,b)); vis.forEach(b=>{ b.seenBy[a.id]=T; a.known={x:b.x,y:b.y,t:T,id:b.id}; }); if(!vis.length) return null; vis.sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y)); return vis[0]; }
  function fireCtl(a,t,dt){ const k=a.kit; if(a.reloadT>0) return; if(a.mag<=0){ a.reloadT=k.reload; log((a.team===0?'Tu soldado recarga':a.name+' recarga'),(a.team===0?'Your soldier reloads':a.name+' reloads'),'rel'); return; }
    const want=Math.atan2(t.y-a.y,t.x-a.x); const ok=turn(a,want,dt); if(!ok) return; if(a.tgt!==t){ a.tgt=t; const d=Math.hypot(t.x-a.x,t.y-a.y); a.aimT=(a.team===1&&!(a.known&&T-a.known.t<5)?1.0+R()*0.7:0.35)+((k.mag||1)>=3&&d<8?0.3:0)+(night&&!k.nvg&&!k.light&&!k.nightSight?0.25:0); if(a.team===0&&!a.contactLog){ a.contactLog=1; } log((a.team===0?'Contacto: enemigo a '+Math.round(d)+' m':a.name+' te ve a '+Math.round(d)+' m')+(roomOf(t.x,t.y)?' ('+roomOf(t.x,t.y)+')':''),(a.team===0?'Contact: enemy at '+Math.round(d)+' m':a.name+' spots you at '+Math.round(d)+' m'),'con'); }
    if(a.aimT>0){ a.aimT-=dt; return; } a.cd-=dt; if(a.cd>0) return;
    if(a.burst<=0){ a.burst=k.mg?6:(k.auto?3:1); }
    shoot(a,t); a.burst--; a.cd=a.burst>0?60/(k.rate||700):(k.mg?0.6:k.auto?0.5:0.4); if(a.mag<=0) a.burst=0; }
  function stepAgent(a,dt){ if(!a.alive) return; const k=a.kit; a.sup=Math.max(0,a.sup-0.28*dt); if(a.reloadT>0){ a.reloadT-=dt; if(a.reloadT<=0){ a.mag=k.magSize; } }
    if(a.duck>0){ a.duck-=dt; a.moving=false; return; } if(a.sup>0.75&&!a.ducked){ a.duck=1.2; a.ducked=true; a.sup*=0.7; log((a.team===0?'Tu soldado se cubre (fuego de supresión)':a.name+' se cubre'),(a.team===0?'Your soldier takes cover (suppressive fire)':a.name+' takes cover'),'sup'); return; } if(a.sup<0.4) a.ducked=false;
    if(a.fragT&&T<a.fragT){ a.moving=false; return; }
    const t=pickTarget(a);
    if(t){ a.moving=false; a.lostT=0;
      /* granada: si el enemigo está a cubierto entre 6 y 22 m y lo llevas */ const d=Math.hypot(t.x-a.x,t.y-a.y); if(a.frags>0&&d>6&&d<22&&inCover(t,a)&&(!a.lastFrag||T-a.lastFrag>8)&&R()<0.02){ throwFrag(a,t.x+(R()-0.5),t.y+(R()-0.5)); return; }
      fireCtl(a,t,dt); return; }
    a.tgt=null; a.burst=0;
    if(a.team===0){ /* azul: limpia el recorrido; si ya no queda recorrido, busca al enemigo más cercano */
      if(a.known&&T-a.known.t<1.2){ const want=Math.atan2(a.known.y-a.y,a.known.x-a.x); if(Math.abs(angD(want,a.dir))>0.25){ a.moving=false; turn(a,want,dt); return; } }
      if(a.known&&T-a.known.t<4&&Math.hypot(a.known.x-a.x,a.known.y-a.y)>1.5){ if(!a.goal||(Math.hypot(a.goal[0]-a.known.x,a.goal[1]-a.known.y)>1.5&&T-(a.rpT||0)>0.5)){ a.rpT=T; goTo(a,a.known.x,a.known.y); } moveAlong(a,dt); return; }
      if(a.frags>0&&a.known&&T-a.known.t<10&&!a.lastFrag){ const d=Math.hypot(a.known.x-a.x,a.known.y-a.y); if(d>6&&d<20&&!losBlocked(a.x,a.y,a.known.x,a.known.y)===false&&R()<0.01){ throwFrag(a,a.known.x,a.known.y); return; } }
      if(a.ri<a.route.length){ const w=a.route[a.ri]; if(!a.path||a.goal[0]!==w[0]||a.goal[1]!==w[1]){ if(!goTo(a,w[0],w[1])){ a.ri++; a.path=null; return; } if(w[2]) log('Tu soldado avanza hacia '+LL(w[2]),'Your soldier moves to '+LL(w[2]),'mov'); else { const rn=roomOf(w[0],w[1]); if(rn&&rn!==a.lastRoom){ a.lastRoom=rn; log('Tu soldado entra en '+rn,'Your soldier enters '+rn,'mov'); } } }
        if(moveAlong(a,dt)) a.ri++; return; }
      const en=enemiesOf(a); if(en.length){ const n=en.sort((p,q)=>Math.hypot(p.x-a.x,p.y-a.y)-Math.hypot(q.x-a.x,q.y-a.y))[0]; if((!a.path||!a.goal||Math.hypot(a.goal[0]-n.x,a.goal[1]-n.y)>1.5||a.pi>=a.path.length)&&T-(a.rpT||0)>0.6){ a.rpT=T; goTo(a,n.x,n.y); } moveAlong(a,dt); } return; }
    /* rojo: aguanta en su puesto; si te oye y no te ve, gira hacia el ruido; algunos flanquean */
    if(a.known&&T-a.known.t<12){ const want=Math.atan2(a.known.y-a.y,a.known.x-a.x); if(a.flank&&T-a.known.t>2.5&&!a.flankDone){ if(!a.flankRun){ a.flankRun=true; const ang=want+(R()<0.5?1:-1)*0.9; const fx=a.known.x-Math.cos(ang)*5, fy=a.known.y-Math.sin(ang)*5; if(goTo(a,Math.max(1,Math.min(M.w-1,fx)),Math.max(1,Math.min(M.h-1,fy)))) log(a.name+' flanquea'+(roomOf(fx,fy)?' por '+roomOf(fx,fy):''),a.name+' flanks','mov'); else a.flankDone=true; } if(moveAlong(a,dt)){ a.flankDone=true; a.flankRun=false; } return; }
      turn(a,want,dt); a.moving=false; return; }
    a.moving=false; turn(a,a.hold,dt); }
  sim.step=function(dt){ if(sim.over) return; T+=dt; sim.T=T;
    sim.fx.forEach(f=>{ if(f.t==='gren'&&!f.done&&T>=f.boom) boom(f); });
    const order=sim.agents.slice(); for(const a of order) stepAgent(a,dt);
    sim.agents.forEach(a=>{ if(a.alive&&a.hp<=0){ a.alive=false; } });
    sim.fx=sim.fx.filter(f=>T-f.t0<(f.t==='gren'?6:f.t==='boom'?1.6:0.5));
    if(!B.alive) sim.over={w:1,how:'ko'}; else if(!enemiesOf(B).length) sim.over={w:0,how:'ko'}; else if(T>240) sim.over={w:1,how:'time'};
    if(sim.over){ log(sim.over.w===0?'Misión cumplida: todos los enemigos fuera de combate':sim.over.how==='time'?'Se acaba el tiempo: el enemigo mantiene la posición':'Tu soldado queda fuera de combate',sim.over.w===0?'Mission complete: all enemies out of action':sim.over.how==='time'?'Time is up: the enemy holds the position':'Your soldier is out of action','end'); } };
  sim.B=B; sim.reds=sim.agents.filter(a=>a.team===1); log('Tu soldado empieza la misión en '+LL(M.k==='casa'?['la casa','the house']:M.k==='pueblo'?['el pueblo','the village']:['las trincheras','the trenches'])+(night?' (de noche)':' (de día)'),'Your soldier starts the mission'+(night?' (night)':' (day)'),'start');
  return sim; }
/* ---------------- dibujo ---------------- */
export function makeView(cv,sim,o){ const g=cv.getContext('2d'); const M=sim.M; let W=0,H=0,dpr=1,rot=false,sc=1,ox=0,oy=0; let bg=null, bgKey='';
  function layout(){ const r=cv.getBoundingClientRect(); dpr=Math.min(window.devicePixelRatio||1,2)*(o.dprK||1); W=Math.max(10,r.width); H=Math.max(10,r.height); cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    rot=(W/H<1)!==(M.w/M.h<1); const mw=rot?M.h:M.w, mh=rot?M.w:M.h; const pad=8; sc=Math.min((W-pad*2)/mw,(H-pad*2-(o.top||0))/mh); ox=(W-mw*sc)/2; oy=(o.top||0)+(H-(o.top||0)-mh*sc)/2; bgKey=''; }
  const tx=(x,y)=>rot?[ox+(M.h-y)*sc,oy+x*sc]:[ox+x*sc,oy+y*sc];
  function world(){ if(rot) g.setTransform(0,sc*dpr,-sc*dpr,0,(ox+M.h*sc)*dpr,oy*dpr); else g.setTransform(sc*dpr,0,0,sc*dpr,ox*dpr,oy*dpr); }
  function screen(){ g.setTransform(dpr,0,0,dpr,0,0); }
  function drawStatic(c){ const x=c.getContext('2d'); x.save(); x.setTransform(1,0,0,1,0,0); x.clearRect(0,0,c.width,c.height); x.restore();
    const gg=g; const sv=g; /* dibuja en el lienzo de fondo con la misma transformación */ const save=g; 
    x.save(); if(rot) x.setTransform(0,sc*dpr,-sc*dpr,0,(ox+M.h*sc)*dpr,oy*dpr); else x.setTransform(sc*dpr,0,0,sc*dpr,ox*dpr,oy*dpr);
    x.fillStyle=M.ground; x.fillRect(0,0,M.w,M.h);
    /* textura: motas */ let s=7; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; }; for(let i=0;i<M.w*M.h*0.9;i++){ x.fillStyle=r()<0.5?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.05)'; const z=0.15+r()*0.35; x.fillRect(r()*M.w,r()*M.h,z,z); }
    if(M.trench){ x.fillStyle='#4a3b2a'; M.trench.forEach(t=>x.fillRect(t[0],t[1],t[2],t[3])); x.strokeStyle='rgba(120,95,60,0.35)'; x.lineWidth=0.05; M.trench.forEach(t=>{ for(let k=0.4;k<(t[2]>t[3]?t[2]:t[3]);k+=0.4){ x.beginPath(); if(t[2]>t[3]){ x.moveTo(t[0]+k,t[1]+0.15); x.lineTo(t[0]+k,t[1]+t[3]-0.15); } else { x.moveTo(t[0]+0.15,t[1]+k); x.lineTo(t[0]+t[2]-0.15,t[1]+k); } x.stroke(); } }); }
    if(M.crat){ M.crat.forEach(([cx,cy,cr])=>{ const gr=x.createRadialGradient(cx,cy,0.1,cx,cy,cr); gr.addColorStop(0,'#3d3326'); gr.addColorStop(0.8,'#5b4d39'); gr.addColorStop(1,'rgba(91,77,57,0)'); x.fillStyle=gr; x.beginPath(); x.arc(cx,cy,cr,0,7); x.fill(); }); }
    (M.floors||[]).forEach(f=>{ x.fillStyle=f[4]; x.fillRect(f[0],f[1],f[2],f[3]); x.strokeStyle='rgba(0,0,0,0.07)'; x.lineWidth=0.03; for(let k=f[1]+0.5;k<f[1]+f[3];k+=0.5){ x.beginPath(); x.moveTo(f[0],k); x.lineTo(f[0]+f[2],k); x.stroke(); } });
    (sim.craters||[]).forEach(([cx,cy,cr])=>{ const gr=x.createRadialGradient(cx,cy,0.1,cx,cy,cr); gr.addColorStop(0,'#1f1a14'); gr.addColorStop(0.7,'#3e352a'); gr.addColorStop(1,'rgba(62,53,42,0)'); x.fillStyle=gr; x.beginPath(); x.arc(cx,cy,cr,0,7); x.fill(); });
    (M.cars||[]).forEach(c=>{ x.fillStyle='#3b4a5c'; x.fillRect(c[0],c[1],c[2],c[3]); x.fillStyle='#8fb3cf'; x.fillRect(c[0]+0.2,c[1]+0.9,c[2]-0.4,0.7); x.fillRect(c[0]+0.2,c[1]+c[3]-1.4,c[2]-0.4,0.55); });
    x.lineCap='round';
    M.S.forEach(s=>{ const t=s[4]; if(t==='w'){ x.strokeStyle='#17191c'; x.lineWidth=0.3; } else if(t==='e'){ x.strokeStyle='#2c2318'; x.lineWidth=0.34; } else if(t==='win'){ x.strokeStyle='#8cc6ea'; x.lineWidth=0.16; } else { x.strokeStyle='#b39a68'; x.lineWidth=0.34; }
      x.beginPath(); x.moveTo(s[0],s[1]); x.lineTo(s[2],s[3]); x.stroke(); if(t==='low'&&(M.k==='trincheras')){ x.strokeStyle='rgba(60,45,25,0.5)'; x.lineWidth=0.05; const n=Math.hypot(s[2]-s[0],s[3]-s[1])/0.45; for(let k=1;k<n;k++){ const px=s[0]+(s[2]-s[0])*k/n, py=s[1]+(s[3]-s[1])*k/n; x.beginPath(); x.arc(px,py,0.12,0,7); x.stroke(); } } });
    x.restore(); }
  /* niebla de guerra: polígono de visión del soldado azul (rayos contra muros) */
  const fog=document.createElement('canvas'); let fogG=fog.getContext('2d');
  function visPoly(a){ const V=sim.visRange(a); const pts=[[a.x,a.y]]; const n=Math.max(24,Math.round(V.c*60)); const R_=V.r;
    for(let i=0;i<=n;i++){ const an=a.dir-V.c+2*V.c*i/n; const ex=a.x+Math.cos(an)*R_, ey=a.y+Math.sin(an)*R_; let best=1; for(const s of M.S){ if(s[4]!=='w'&&s[4]!=='e') continue; const u=segX(a.x,a.y,ex,ey,s[0],s[1],s[2],s[3]); if(u>=0&&u<best) best=u; } pts.push([a.x+(ex-a.x)*best,a.y+(ey-a.y)*best]); }
    return pts; }
  const ghosts={};
  function draw(){ if(!bg||bgKey!==W+'x'+H+':'+(sim.mapVer||0)){ bg=bg||document.createElement('canvas'); bg.width=cv.width; bg.height=cv.height; drawStatic(bg); bgKey=W+'x'+H+':'+(sim.mapVer||0); }
    screen(); g.clearRect(0,0,W,H); g.fillStyle='#0d1013'; g.fillRect(0,0,W,H); g.setTransform(1,0,0,1,0,0); g.drawImage(bg,0,0); world();
    const T=sim.T, B=sim.B, night=sim.night;
    /* efectos de suelo: explosiones */
    sim.fx.forEach(f=>{ if(f.t==='boom'){ const k=(T-f.t0)/1.6; g.globalAlpha=Math.max(0,1-k); g.fillStyle='#ffb347'; g.beginPath(); g.arc(f.x,f.y,f.r*Math.min(1,k*4),0,7); g.fill(); g.globalAlpha=Math.max(0,0.5-k*0.5); g.strokeStyle='#ffd27a'; g.lineWidth=0.15; g.beginPath(); g.arc(f.x,f.y,f.r2*Math.min(1,k*2),0,7); g.stroke(); g.globalAlpha=1; } });
    /* agentes */
    const showRed=a=>a.team===0||sim.over||(B.alive&&sim.sees(B,a))||o.reveal;
    sim.agents.forEach(a=>{ if(a.team===1){ if(a.alive&&showRed(a)) ghosts[a.id]={x:a.x,y:a.y,t:T}; } });
    Object.entries(ghosts).forEach(([id,gh])=>{ const a=sim.agents[id]; if(!a||!a.alive||showRed(a)) return; const k=1-(T-gh.t)/6; if(k<=0) return; g.globalAlpha=k*0.6; g.strokeStyle='#ff6b5e'; g.lineWidth=0.08; g.setLineDash([0.2,0.15]); g.beginPath(); g.arc(gh.x,gh.y,0.5,0,7); g.stroke(); g.setLineDash([]); g.globalAlpha=1; });
    sim.agents.forEach(a=>{ if(a.team===1&&!showRed(a)&&a.alive) return; if(a.team===1&&!a.alive&&!a.seenDead&&!sim.over){ if(B.alive&&!sim.los(B,a)) return; a.seenDead=true; }
      const col=a.team===0?'#2f8cff':'#ff3b30';
      if(a.alive){ const V=sim.visRange(a); g.fillStyle=a.team===0?'rgba(47,140,255,0.10)':'rgba(255,59,48,0.10)'; g.beginPath(); g.moveTo(a.x,a.y); g.arc(a.x,a.y,Math.min(V.r,a.team===0?5:4),a.dir-V.c,a.dir+V.c); g.closePath(); g.fill(); }
      if(a.alive&&a.sup>0.3){ g.strokeStyle='rgba(255,210,60,'+(0.3+0.5*a.sup)+')'; g.lineWidth=0.07; g.beginPath(); g.arc(a.x,a.y,0.75+0.1*Math.sin(T*18),0,7); g.stroke(); }
      if(a.alive){ g.fillStyle=col; g.beginPath(); g.arc(a.x,a.y,a.duck>0?0.36:0.45,0,7); g.fill(); g.strokeStyle='#fff'; g.lineWidth=0.08; g.stroke(); g.strokeStyle=col; g.lineWidth=0.14; g.beginPath(); g.moveTo(a.x+Math.cos(a.dir)*0.45,a.y+Math.sin(a.dir)*0.45); g.lineTo(a.x+Math.cos(a.dir)*1.05,a.y+Math.sin(a.dir)*1.05); g.stroke(); if(night&&a.kit.light&&!a.kit.nvg&&(a.moving||a.tgt)){ g.fillStyle='rgba(255,250,210,0.18)'; g.beginPath(); g.moveTo(a.x,a.y); g.arc(a.x,a.y,9,a.dir-0.25,a.dir+0.25); g.closePath(); g.fill(); } }
      else { g.strokeStyle=col; g.globalAlpha=0.85; g.lineWidth=0.14; g.beginPath(); g.moveTo(a.x-0.35,a.y-0.35); g.lineTo(a.x+0.35,a.y+0.35); g.moveTo(a.x+0.35,a.y-0.35); g.lineTo(a.x-0.35,a.y+0.35); g.stroke(); g.globalAlpha=1; } });
    /* trazadoras y granadas */
    sim.fx.forEach(f=>{ if(f.t==='tr'){ const k=(T-f.t0)/0.5; if(k>1) return; g.globalAlpha=1-k; g.strokeStyle=f.team===0?'#ffd36b':(o.redTracer||'#ff7a5c'); g.lineWidth=0.06; g.beginPath(); g.moveTo(f.x0,f.y0); g.lineTo(f.x1,f.y1); g.stroke(); if(k<0.35){ g.fillStyle='#fff3c4'; g.beginPath(); g.arc(f.x0+Math.cos(Math.atan2(f.y1-f.y0,f.x1-f.x0))*0.6,f.y0+Math.sin(Math.atan2(f.y1-f.y0,f.x1-f.x0))*0.6,0.22*(1-k*2),0,7); g.fill(); }
        if(f.hit&&k<0.5){ g.fillStyle=f.stop?'#ffe08a':'#ff4d3d'; g.beginPath(); g.arc(f.x1,f.y1,0.35*(1-k),0,7); g.fill(); } else if(f.wall&&k<0.4){ g.fillStyle='#d8c7a0'; g.beginPath(); g.arc(f.x1,f.y1,0.18,0,7); g.fill(); } g.globalAlpha=1; }
      if(f.t==='gren'&&!f.done){ const k=Math.min(1,(T-f.t0)/f.fl); const x=f.x0+(f.x1-f.x0)*k, y=f.y0+(f.y1-f.y0)*k; g.fillStyle='#2b3a22'; g.beginPath(); g.arc(x,y,0.18+0.12*Math.sin(k*Math.PI),0,7); g.fill(); g.strokeStyle='#e8e2b0'; g.lineWidth=0.04; g.stroke(); } });
    /* niebla */
    const fogA=night?0.72:0.3; if(!o.reveal&&!sim.over){ if(fog.width!==cv.width||fog.height!==cv.height){ fog.width=cv.width; fog.height=cv.height; fogG=fog.getContext('2d'); }
      fogG.setTransform(1,0,0,1,0,0); fogG.globalCompositeOperation='source-over'; fogG.clearRect(0,0,fog.width,fog.height); fogG.fillStyle=night?'rgba(4,8,14,'+fogA+')':'rgba(10,14,18,'+fogA+')'; fogG.fillRect(0,0,fog.width,fog.height);
      if(rot) fogG.setTransform(0,sc*dpr,-sc*dpr,0,(ox+M.h*sc)*dpr,oy*dpr); else fogG.setTransform(sc*dpr,0,0,sc*dpr,ox*dpr,oy*dpr);
      fogG.globalCompositeOperation='destination-out'; if(B.alive){ const P=visPoly(B); fogG.fillStyle='#000'; fogG.beginPath(); fogG.moveTo(P[0][0],P[0][1]); P.forEach(p=>fogG.lineTo(p[0],p[1])); fogG.closePath(); fogG.fill(); fogG.beginPath(); fogG.arc(B.x,B.y,1.4,0,7); fogG.fill(); }
      fogG.globalCompositeOperation='source-over'; g.setTransform(1,0,0,1,0,0); g.drawImage(fog,0,0); if(night&&B.alive&&B.kit.nvg){ g.fillStyle='rgba(60,255,90,0.07)'; g.fillRect(0,0,cv.width,cv.height); } world(); }
    /* apoyo aéreo: animación de llegada */
    if(sim.anim) sim.anim(g,T,world,screen);
    /* etiquetas (siempre derechas) */
    screen(); g.font='600 10px system-ui,sans-serif'; g.textAlign='center';
    sim.agents.forEach(a=>{ if(!a.alive) return; if(a.team===1&&!showRed(a)) return; const [sx,sy]=tx(a.x,a.y); const w=26; g.fillStyle='rgba(0,0,0,0.55)'; g.fillRect(sx-w/2,sy-sc*0.45-15,w,6); g.fillStyle=a.hp>60?'#5fbf4a':a.hp>30?'#e0b33a':'#d9493a'; g.fillRect(sx-w/2+1,sy-sc*0.45-14,(w-2)*Math.max(0,a.hp)/100,2.2); g.fillStyle='#9fc3ff'; if(a.kit.plate) g.fillRect(sx-w/2+1,sy-sc*0.45-11,(w-2)*Math.max(0,a.kit.plateN)/2,1.6);
      g.fillStyle='#fff'; g.strokeStyle='rgba(0,0,0,0.75)'; g.lineWidth=3; g.strokeText(a.label,sx,sy+sc*0.45+11); g.fillText(a.label,sx,sy+sc*0.45+11); }); }
  layout(); return {draw,layout,tx,get sc(){ return sc; },get rot(){ return rot; }}; }
