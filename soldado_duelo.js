/* M.A.T · Duelo 1 vs 1 entre dos soldados (#/soldado?vs=<código>&duelo=<mapa>): simulación automática IA contra IA, sin explosivos.
   Se carga solo al abrir el duelo (desde la comparación o desde Batallas). */

/* ===================== núcleo: perfiles, mapas, simulación (sin DOM) ===================== */
const EN_=()=>typeof window!=='undefined'&&window.MAT_LANG==='en';
const L=(es,en)=>EN_()?en:es;
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
/* --- clases de arma: mismo tiempo de reacción para todos; la clase solo cambia alcance, precisión, cadencia y daño --- */
export const CL={
 pistola:{n:['Pistola','Pistol'],band:['corta','short'],acc:.55,R:30,rate:1.8,dmg:24,cqb:.10,pen:0,lo:3,hi:22,doc:'push'},
 subfusil:{n:['Subfusil','SMG'],band:['corta','short'],acc:.6,R:75,rate:2.6,dmg:22,cqb:.10,pen:0,lo:3,hi:35,doc:'push'},
 escopeta:{n:['Escopeta','Shotgun'],band:['muy corta','very short'],acc:.75,R:18,rate:1.0,dmg:55,cqb:.12,pen:0,lo:2,hi:12,doc:'push'},
 asalto:{n:['Fusil de asalto','Assault rifle'],band:['media (vale para todo)','medium (all-round)'],acc:.6,R:260,rate:2.2,dmg:30,cqb:0,pen:.2,lo:8,hi:300,doc:'move'},
 combate:{n:['Fusil de combate','Battle rifle'],band:['media-larga','medium-long'],acc:.58,R:320,rate:1.6,dmg:38,cqb:-.05,pen:.4,lo:20,hi:400,doc:'move'},
 dmr:{n:['Fusil de tirador','Marksman rifle'],band:['media-larga','medium-long'],acc:.62,R:480,rate:1.2,dmg:42,cqb:-.15,pen:.4,lo:60,hi:550,doc:'hold'},
 mg:{n:['Ametralladora','Machine gun'],band:['media','medium'],acc:.42,R:330,rate:3.4,dmg:30,cqb:-.2,pen:.3,lo:40,hi:450,doc:'mg'},
 tirador:{n:['Francotirador','Sniper rifle'],band:['larga','long'],acc:.8,R:850,rate:.55,dmg:75,cqb:-.35,pen:.5,lo:150,hi:1000,doc:'hold'},
 nada:{n:['Sin arma','Unarmed'],band:['ninguna','none'],acc:.3,R:4,rate:.8,dmg:10,cqb:0,pen:0,lo:1,hi:3,doc:'push'}
};
/* datos reales de cada arma (ficha de Armas: velocidad en boca m/s, alcance eficaz m, cadencia disparos/min); null = no consta y se usa el de su clase */
export const WST={'m4a1':[910, 500, 835],'scar':[[870, 500, 650], [710, 600, 550]],'mp7':[735, 200, 950],'sr-25':[null, null, null],'m82':[853, 1800, null],'p90':[715, 200, 975],'aug':[970, 300, 715],'l85a2':[930, 400, 692.5],'m16a4':[960, 550, 750],'g18c':[null, null, null],'m9':[381, 50, null],'g17':[null, null, null],'m1911':[253, 50, null],'p226':[null, null, null],'m17':[null, 25, null],'usp':[null, 50, null],'ppk':[256, null, null],'deagle':[470, null, null],'fn57':[762, 50, null],'makarov':[315, 50, null],'cz75':[null, 100, null],'hipower':[335, 50, null],'tt33':[420, 50, null],'p99':[408, 50, null],'m24':[790, 800, null],'awm':[936, 1500, null],'hk416':[917, 550, 850],'hk417':[750, 600, 600],'g36':[920, 600, 750],'ak74':[880, 500, 650],'ak12':[880, 440, 700],'famas':[930, 300, 1000],'tavor':[910, 550, 850],'mp5':[400, 200, 800],'m249':[915, 700, 850],'m240':[853, 800, 600],'pkm':[825, 1000, 700],'ak47':[715, 350, 600],'svd':[830, 800, null],'g3':[800, null, 550],'m60':[853, 1100, 600],'m2':[890, 1800, 525],'garand':[853, 457, null],'mg3':[820, null, 875],'asval':[280, 400, 900],'ump45':[260, 65, 650],'mp9':[400, 100, 900],'m1014':[408, 50, null],'spas12':[null, null, null],'aw':[850, 800, null],'qbz95':[930, 400, 650],'arx160':[920, null, 700]};
const REF={pistola:[380,50],subfusil:[400,200],escopeta:[400,50],asalto:[900,500],combate:[800,600],dmr:[820,800],mg:[880,800],tirador:[850,1000],nada:[300,5]}, RPMREF={asalto:750,subfusil:850,mg:750,combate:600};
export function wclass(kind,id){ const k=String(kind||'').toLowerCase();
  if(/escopeta|shotgun/.test(k)) return 'escopeta';
  if(/pistola ametralladora|machine pistol/.test(k)) return 'subfusil';
  if(/pistola|pistol/.test(k)) return 'pistola';
  if(/subfusil|defensa personal|submachine|personal defen/.test(k)) return 'subfusil';
  if(/francotirador|sniper|antimaterial|anti-materi/.test(k)) return 'tirador';
  if(/tirador designado|marksman/.test(k)) return 'dmr';
  if(/ametralladora|machine gun/.test(k)) return 'mg';
  if(/combate|battle|semiautom/.test(k)&&!/asalto|assault/.test(k)) return 'combate';
  if(/fusil|rifle|carabina|carbine/.test(k)) return 'asalto';
  return id?'asalto':'nada'; }
function mag(a){ if(!a) return {m:1,one:false,iron:true}; const t=(a.k&&a.k[0]||'')+' '+(a.n||''); let m=1, one=/1×|punto rojo|colimador|réflex|reflex|hologr|1 o 4|1–8|1-8|rmr/i.test(t);
  t.replace(/(\d+(?:[.,]\d+)?)\s*(?:×|x\d|aumentos)/gi,(s,n)=>{ const v=parseFloat(n.replace(',','.')); if(v>m&&v<60) m=v; return s; });
  t.replace(/de (\d+(?:[.,]\d+)?) a (\d+(?:[.,]\d+)?) aumentos/i,(s,a1,b1)=>{ m=Math.max(m,parseFloat(b1.replace(',','.'))); return s; });
  return {m,one:one||m<=1,iron:false}; }
const EXPL=['frag','smoke','m203he','c4','clay','at4','smawd','jav'];
/* perfil de combate a partir de TODOS los datos del código: arma, accesorios, equipo, peso */
export function profile(st,dd,ARM,nick){ st=st||{}; dd=dd||{}; const q=st.q||{}, A=st.arma||null; const W=ARM&&ARM.W||[], ACC=ARM&&ARM.ACC||{};
  const w=A?W.find(x=>x.id===A.id):null, kind=w?(w.kind&&w.kind[0]):'';
  let cls=w?wclass(kind,A.id):(q.m9p?'pistola':'nada'); const on=(A&&A.on)||{};
  /* variante elegida (p. ej. SCAR-L = fusil de asalto, SCAR-H 7,62×51 = fusil de combate) y sus datos reales */
  const vi=A&&w&&w.V&&w.V[+A.v||0]?(+A.v||0):0, vlab=w&&w.V&&w.V[vi]&&w.V[vi].lab?w.V[vi].lab[0]:'';
  if(cls==='asalto'&&/combate|battle/i.test(kind)&&/7,62×51|SCAR-H/.test(vlab)) cls='combate';
  let ws=A?WST[A.id]:null; if(ws&&Array.isArray(ws[0])) ws=ws[vi]||ws[0]; ws=ws||[null,null,null];
  const rf=REF[cls]||REF.nada, vel=ws[0]||rf[0], er=ws[1]||rf[1], rk=clamp(Math.sqrt(er/rf[1]),.85,1.15), rr=ws[2]&&RPMREF[cls]?clamp(Math.pow(ws[2]/RPMREF[cls],.3),.9,1.1):1;
  const opt=on.optic?mag(ACC[on.optic]):mag(null), acc=k=>ACC[on[k]]||null, kt=k=>{ const a=acc(k); return a?((a.k&&a.k[0])||'')+' '+a.n:''; };
  const supp=/silenciador|suppressor/i.test(kt('muzzle'))||/silenciad|suppressed/i.test(kind||'');
  const gl=/lanzagranadas|grenade/i.test(kt('under')+' '+kt('muzzle'));
  const plates=!!q.iba||Object.keys(q).some(k=>q[k]>0&&/^(sapi|esapi|side|p_)/.test(k)&&k!=='p_soft_iiia_shellback_clc');
  const soft=!plates&&!!q.p_soft_iiia_shellback_clc, helmet=['ach','ihps','fast','pasgt'].some(k=>q[k]>0);
  const med={uses:(q.medbag||0)*3+(q.cls||0)*2+(q.iv||0), hp:q.medbag?35:q.cls?30:20, t:q.medbag?7:q.cls?6:8, what:q.medbag?L('bolsa de médico','medic bag'):q.cls?L('bolsa de socorrista','CLS bag'):q.iv?L('kit de vía intravenosa','IV kit'):''};
  const kg=+st.kg||80, tot=dd.tot!=null?+dd.tot:0, pct=dd.pct!=null?+dd.pct:(kg?tot/kg*100:0);
  const spd=3.2*clamp(1-0.011*Math.max(0,pct-15),0.4,1);
  const wn=dd.wName||(w?w.n:L('sin arma','no weapon'));
  return {nick:nick||L('Soldado','Soldier'),cls,kind,wid:A?A.id:'',wn,heavy50:/\.50|12,7/.test(kind||''),pdw:/defensa personal|personal defen/i.test(kind||''),opt,optName:on.optic&&ACC[on.optic]?ACC[on.optic].n:'',supp,gl,
    bip:!!(on.bipod||on.tripod), grip:!!(on.under&&!gl&&!/bayoneta|bayonet/i.test(kt('under'))), laser:!!(on.laser||on.light),
    armor:plates?.45:soft?.2:0, plates, soft, helmet, med, side:cls!=='pistola'&&!!q.m9p,
    spot:(q.bino||q.m144||q.gvs5)?1.4:1, thermal:!!q.pas13, gh:st.role==='tirador'&&st.gh?st.gh:null,
    expl:EXPL.filter(k=>q[k]>0).length, kg, tot, pct, spd, vel, velReal:!!ws[0], er, erReal:!!ws[1], rk, rr, vlab};
}
/* --- mapas (metros; simétricos en x: el de la izquierda y el de la derecha empiezan igual) --- */
function mir(W,r){ return Object.assign({},r,{x:W-r.x-(r.w||0)}); }
function sym(W,list){ const out=[]; list.forEach(r=>{ out.push(r); const m=mir(W,r); if(Math.abs(m.x-r.x)>0.01) out.push(m); }); return out; }
function symZ(W,list){ const out=[]; list.forEach(z=>{ out.push(z); if(Math.abs(W-z.cx-z.cx)>0.01) out.push(Object.assign({},z,{cx:W-z.cx})); }); return out; }
export const MAPS={
 casa:{n:['Casa','House'],b:['Distancia corta: habitaciones, pasillo y puertas','Short range: rooms, a corridor and doors'],W:36,H:24,g:2.5,e:6,ground:'#2a2620',
  F:sym(36,[{x:9.8,y:0,w:.4,h:3.5},{x:9.8,y:5.5,w:.4,h:5.5},{x:9.8,y:13,w:.4,h:5.5},{x:9.8,y:20.5,w:.4,h:3.5},{x:10.2,y:7.8,w:6.8,h:.4},{x:10.2,y:15.8,w:6.8,h:.4},{x:17.2,y:10.8,w:1.6,h:2.4}]),
  L:sym(36,[{x:3,y:8,w:2.6,h:1.2},{x:3,y:15,w:2.6,h:1.2},{x:6.5,y:3,w:1.2,h:2.5},{x:6.5,y:18.5,w:1.2,h:2.5},{x:12.5,y:2.5,w:2.5,h:1.4},{x:12.5,y:20,w:2.5,h:1.4},{x:13,y:9.6,w:1,h:1},{x:13,y:13.4,w:1,h:1}]),
  V:[],Z:[],A:{x:2,y:12},B:{x:34,y:12}},
 pueblo:{n:['Pueblo','Village'],b:['Corta y media: calles, plaza, coches y tapias','Short and medium: streets, a square, cars and walls'],W:140,H:90,g:9,e:22,ground:'#2b2b24',
  F:sym(140,[{x:8,y:8,w:20,h:24},{x:36,y:10,w:16,h:22},{x:8,y:58,w:20,h:24},{x:36,y:58,w:16,h:22},{x:62,y:4,w:16,h:20},{x:62,y:68,w:16,h:18},{x:24,y:32,w:4,h:6},{x:36,y:52,w:4,h:6},{x:66,y:40,w:8,h:10}]),
  L:sym(140,[{x:63,y:36,w:3,h:2},{x:22,y:41,w:5,h:2.2},{x:44,y:47,w:5,h:2.2},{x:56,y:30,w:1,h:8},{x:56,y:52,w:1,h:8},{x:30,y:24,w:1,h:8},{x:30,y:60,w:1,h:8},{x:14,y:44,w:3,h:2}]),
  V:sym(140,[{x:2,y:34,w:10,h:6},{x:44,y:84,w:12,h:5},{x:44,y:1,w:12,h:5}]),Z:[],A:{x:3,y:45},B:{x:137,y:45}},
 montana:{n:['Montaña','Mountain'],b:['Distancia larga: crestas, rocas, bosque y altura','Long range: ridges, rocks, forest and height'],W:800,H:420,g:45,e:140,ground:'#2a2c22',
  F:sym(800,[{x:180,y:240,w:34,h:26},{x:380,y:140,w:40,h:22},{x:380,y:330,w:40,h:24},{x:290,y:70,w:24,h:40},{x:120,y:330,w:30,h:22},{x:388,y:185,w:24,h:50},{x:62,y:190,w:14,h:40}]),
  L:sym(800,[{x:100,y:150,w:8,h:5},{x:150,y:105,w:8,h:5},{x:260,y:200,w:7,h:5},{x:330,y:250,w:8,h:5},{x:240,y:120,w:8,h:5},{x:340,y:170,w:7,h:5},{x:300,y:330,w:8,h:5},{x:396,y:220,w:8,h:6},{x:60,y:250,w:8,h:5},{x:200,y:60,w:8,h:5}]),
  V:sym(800,[{x:230,y:290,w:120,h:90},{x:50,y:320,w:60,h:80},{x:330,y:20,w:60,h:40}]),Z:symZ(800,[{cx:130,cy:120,r:120,h:70},{cx:400,cy:300,r:80,h:25}]),A:{x:30,y:210},B:{x:770,y:210}},
 trincheras:{n:['Trincheras','Trenches'],b:['Media y larga: dos líneas de trincheras, cráteres y una zapa','Medium and long: two trench lines, craters and a sap'],W:320,H:200,g:18,e:45,ground:'#2b271f',
  F:sym(320,[{x:120,y:112,w:3,h:20},{x:150,y:20,w:20,h:6}]),
  L:sym(320,[{x:37.6,y:8,w:.8,h:184},{x:42.4,y:8,w:.8,h:184},{x:43.2,y:37.6,w:66,h:.8},{x:43.2,y:42.4,w:66,h:.8},{x:130,y:88,w:6,h:6},{x:150,y:142,w:7,h:6},{x:100,y:160,w:6,h:5},{x:155,y:60,w:10,h:6},{x:85,y:110,w:6,h:5},{x:150,y:100,w:20,h:3}]),
  V:sym(320,[{x:60,y:150,w:30,h:30}]),Z:[],T:sym(320,[{x:38.4,y:8,w:4,h:184},{x:43.2,y:38.4,w:66,h:4}]),A:{x:40.4,y:120},B:{x:279.6,y:120}}
};
/* --- geometría --- */
function segRect(ax,ay,bx,by,r,pad){ pad=pad||0; let t0=0,t1=1; const dx=bx-ax, dy=by-ay, x0=r.x-pad, x1=r.x+r.w+pad, y0=r.y-pad, y1=r.y+r.h+pad;
  const P=[-dx,dx,-dy,dy], Q=[ax-x0,x1-ax,ay-y0,y1-ay]; for(let i=0;i<4;i++){ if(P[i]===0){ if(Q[i]<0) return false; } else { const t=Q[i]/P[i]; if(P[i]<0){ if(t>t1) return false; if(t>t0) t0=t; } else { if(t<t0) return false; if(t<t1) t1=t; } } } return true; }
function inR(x,y,r,p){ p=p||0; return x>=r.x-p&&x<=r.x+r.w+p&&y>=r.y-p&&y<=r.y+r.h+p; }
function prep(M){ if(M._p) return M; const F=M.F, N=[]; const ok=(x,y)=>x>0.5&&y>0.5&&x<M.W-.5&&y<M.H-.5&&!F.some(r=>inR(x,y,r,.6))&&!M.L.some(r=>inR(x,y,r,.15));
  const add=(x,y)=>{ if(ok(x,y)&&!N.some(n=>Math.abs(n.x-x)<M.g*.18&&Math.abs(n.y-y)<M.g*.18)) N.push({x,y}); };
  add(M.A.x,M.A.y); add(M.B.x,M.B.y);
  M.L.forEach(r=>{ const o=.9; const st=Math.max(3,M.g*.6); for(let x=r.x+Math.min(r.w/2,st/2);x<r.x+r.w;x+=st){ add(x,r.y-o); add(x,r.y+r.h+o); } for(let y=r.y+Math.min(r.h/2,st/2);y<r.y+r.h;y+=st){ add(r.x-o,y); add(r.x+r.w+o,y); } });
  if(M.T) M.T.forEach(r=>{ const st=Math.max(4,M.g*.5); if(r.h>r.w) for(let y=r.y+2;y<r.y+r.h;y+=st) add(r.x+r.w/2,y); else for(let x=r.x+2;x<r.x+r.w;x+=st) add(x,r.y+r.h/2); });
  F.forEach(r=>{ const o=1.1; [[r.x-o,r.y-o],[r.x+r.w+o,r.y-o],[r.x-o,r.y+r.h+o],[r.x+r.w+o,r.y+r.h+o]].forEach(p=>add(p[0],p[1])); });
  for(let x=M.g/2;x<M.W;x+=M.g) for(let y=M.g/2;y<M.H;y+=M.g) add(x,y);
  /* simetría exacta: cada nodo con su espejo */ const n0=N.length; for(let i=0;i<n0;i++){ const m={x:M.W-N[i].x,y:N[i].y}; if(!N.some(n=>Math.abs(n.x-m.x)<.05&&Math.abs(n.y-m.y)<.05)&&ok(m.x,m.y)) N.push(m); }
  N.forEach((n,i)=>{ n.i=i; n.h=elev(M,n.x,n.y); n.v=veg(M,n.x,n.y); n.t=M.T?M.T.some(r=>inR(n.x,n.y,r)):false; n.e=[]; });
  for(let i=0;i<N.length;i++) for(let j=i+1;j<N.length;j++){ const a=N[i],b=N[j], d=Math.hypot(a.x-b.x,a.y-b.y); if(d>M.e) continue; if(F.some(r=>segRect(a.x,a.y,b.x,b.y,r,.35))) continue; a.e.push([j,d]); b.e.push([i,d]); }
  /* lo expuesta que está cada posición a la mitad del rival (para quien no sabe dónde está el otro) */
  N.forEach(n=>{ let a=0,b=0,na=0,nb=0; for(const m of N){ const far=Math.hypot(m.x-n.x,m.y-n.y); if(far>600) continue; const l=los(M,n.x,n.y,m.x,m.y)&&!(m.v&&far>40);
      if(m.x>M.W/2){ nb++; if(l) b++; } else { na++; if(l) a++; } } n.o=[nb?b/nb:0,na?a/na:0]; });
  M.N=N; M._p=1; return M; }
function elev(M,x,y){ let h=0; (M.Z||[]).forEach(z=>{ const d=Math.hypot(x-z.cx,y-z.cy); if(d<z.r) h=Math.max(h,z.h*(1-d/z.r)); }); return h; }
function veg(M,x,y){ return (M.V||[]).some(r=>inR(x,y,r)); }
function los(M,ax,ay,bx,by){ return !M.F.some(r=>segRect(ax,ay,bx,by,r)); }
/* cobertura del blanco T frente a un tirador S: muro bajo pegado al blanco (o borde de una pared, una esquina, el parapeto) */
function cover(M,sx,sy,tx,ty,sh,th){ const d=Math.hypot(sx-tx,sy-ty); if(d<.5) return 0; const k=Math.min(4,d*.6)/d, px=tx+(sx-tx)*k, py=ty+(sy-ty)*k;
  let c=0; if(M.L.some(r=>segRect(px,py,tx,ty,r))) c=.72; else if(d>3&&M.F.some(r=>segRect(px,py,tx,ty,r,1.0))) c=.45;
  if(c&&sh-th>15&&d<350) c*=.6; return c; }
/* --- azar con semilla (los dos códigos + mapa + ronda) --- */
export function hash(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; }
function rng(seed){ let a=seed>>>0; a^=a>>>16; a=Math.imul(a,0x85ebca6b)>>>0; a^=a>>>13; a=Math.imul(a,0xc2b2ae35)>>>0; a^=a>>>16; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }

/* ===================== simulación automática IA contra IA ===================== */
const NAT={montana:1,trincheras:1};
/* ajustes del duelo: dónde entra un impacto (cabeza = golpe de suerte, brazo/pierna sin placa), lo difícil que es para un fusil de cerrojo seguir a quien corre, y cómo se esconde el de arma corta */
const TU={head:.08,limb:.3,limbM:.6,headM:2.5,mvD:60,mvS:.3,exW:5,dive:12,far:.25,redive:8};
function optR(P,cls){ const o=P.opt; if(o.iron) return /asalto|combate|dmr|tirador|mg/.test(cls)?.8:1; return o.m<=1?1:Math.min(1.9,1+.22*Math.log2(o.m)); }
function accAt(s,d,moving){ const P=s.P, cls=s.side?'pistola':P.cls, C=CL[cls]; const R=C.R*(s.side?1:optR(P,cls)*(P.rk||1))*(cls==='tirador'&&P.heavy50?1.15:1);
  let p=C.acc/(1+Math.pow(d/R,2.5)); if(d<15) p*=1+C.cqb; if(!s.side&&!P.opt.one&&P.opt.m>=3&&d<25) p*=P.opt.m>=5?.6:.85;
  if(!s.side&&P.opt.m>=5&&!P.opt.one&&d<120) p*=.75; if(!s.side&&P.bip&&!moving&&d>80) p*=1.1; if(!s.side&&(P.grip||P.laser)&&d<30) p*=1.04;
  p*=1-clamp(.006*(P.pct-30),0,.25); if(moving) p*=/pistola|subfusil|escopeta/.test(cls)?.7:cls==='asalto'?.65:.5; return Math.min(.95,p); }
function dmgOf(s,e,d,loc){ const cls=s.side?'pistola':s.P.cls, C=CL[cls]; let g=C.dmg; if(cls==='tirador'&&s.P.heavy50) g=95; if(cls==='escopeta') g*=d<10?1:d<20?.7:.4;
  /* dónde entra el impacto: las placas solo protegen el torso; brazos y piernas no llevan placa; cabeza/cuello es el «golpe de suerte» (el casco frena sobre todo pistola y subfusil) */
  if(loc===1) return Math.max(1,Math.round(g*TU.limbM));
  if(loc===2) return Math.max(1,Math.round(g*TU.headM*(e.P.helmet?(/pistola|subfusil/.test(cls)?.6:.85):1)));
  const pen=cls==='subfusil'&&s.P.pdw?.3:C.pen, red=e.P.armor*(1-pen)*(pen?1:1.5)+(e.P.helmet?.06:0); return Math.max(1,Math.round(g*(1-red))); }
function spotR(M,mk,o,e,t){ const P=o.P, m=P.opt.iron?1:P.opt.m; let r=250*(1+.35*Math.log2(Math.max(1,m)))*(o.mv?1:P.spot); if(o.h-e.h>15) r*=1.15;
  if(e.vg) r*=P.thermal?1:(e.P.gh?.3:.42); else if(e.P.gh&&NAT[mk]) r*=.75;
  if(e.mv) r*=e.vg?1.25:1.6; else if(e.cov>.4) r*=.75; if(t-e.firedT<1.5){ const dd=Math.hypot(o.x-e.x,o.y-e.y); r*=e.P.supp&&!e.side?(dd<60?3:1.25):3; } return r; }
export function simulate(PA,PB,mk,seed,opt){ opt=opt||{}; const M=prep(MAPS[mk]), N=M.N, R=rng(seed), DT=.25, TMAX=opt.tmax||Math.round(240*Math.sqrt(clamp(MAPS[mk].W/150,1,6)));
  const near=(x,y)=>{ let b=0,bd=1e9; for(const n of N){ const d=(n.x-x)*(n.x-x)+(n.y-y)*(n.y-y); if(d<bd){ bd=d; b=n.i; } } return b; };
  const mkS=(P,sp,ep,k)=>({k,P,x:sp.x,y:sp.y,h:elev(M,sp.x,sp.y),vg:veg(M,sp.x,sp.y),node:near(sp.x,sp.y),path:[],tgt:null,tsc:-1e9,hp:100,K:{x:ep.x,y:ep.y,t:-99,src:'spawn'},visT:0,vis:false,cd:0,heal:0,
    med:P.med.uses,side:false,sw:0,supp:-9,firedT:-99,hitT:-99,seenT:-99,mv:false,cov:0,stats:{sh:0,hit:0,dmg:0,heal:0,dist:0},lg:{},mode:'hold',flank:0});
  const S=[mkS(PA,M.A,M.B,0),mkS(PB,M.B,M.A,1)]; const ev=[], fr=[], LOG=[];
  const log=(t,k,txt,key)=>{ if(key){ if(LOG.some(l=>l.key===key)) return; } LOG.push({t,k,txt,key}); };
  const nm=s=>s.P.nick; const f0=v=>Math.round(v); 
  const C0=s=>CL[s.P.cls];
  /* frases de arranque: la doctrina sale del arma y el peso */
  S.forEach(s=>{ const P=s.P, c=C0(s), d=c.doc, w=P.wn;
    const t=d==='hold'?L(nm(s)+' ('+w+') busca una posición lejana y en alto, y espera.',nm(s)+' ('+w+') looks for a distant, high position and waits.'):
      d==='mg'?L(nm(s)+' ('+w+') se planta a cubierto para barrer con fuego.',nm(s)+' ('+w+') sets up in cover to sweep with fire.'):
      d==='push'?L(nm(s)+' ('+w+') quiere acercarse: rodea por donde no le vean.',nm(s)+' ('+w+') wants to close in: flanks out of sight.'):
      L(nm(s)+' ('+w+') avanza de cubierta en cubierta: vale de cerca y de lejos.',nm(s)+' ('+w+') moves cover to cover: works up close and far.');
    log(0,s.k,t,'doc'+s.k); });
  { const a=S[0],b=S[1], fa=a.P.spd, fb=b.P.spd; if(Math.abs(fa-fb)/Math.max(fa,fb)>.08){ const sl=fa<fb?a:b, fa2=fa<fb?b:a; log(0,sl.k,L('Con '+String(Math.round(sl.P.tot*10)/10).replace('.',',')+' kg ('+f0(sl.P.pct)+' % de su peso) '+nm(sl)+' se mueve un '+f0((1-sl.P.spd/fa2.P.spd)*100)+' % más lento que '+nm(fa2)+'.','Carrying '+Math.round(sl.P.tot*10)/10+' kg ('+f0(sl.P.pct)+'% of body weight) '+nm(sl)+' moves '+f0((1-sl.P.spd/fa2.P.spd)*100)+'% slower than '+nm(fa2)+'.'),'spd'); } }
  if((S[0].P.gl||S[0].P.expl)&&(S[1].P.gl||S[1].P.expl)) log(0,-1,L('Los dos llevan granadas o lanzagranadas, pero aquí no se usan: solo cuentan por lo que pesan.','Both carry grenades or launchers, but they are not used here: only their weight counts.'),'exb');
  else S.forEach(s=>{ if(s.P.gl||s.P.expl) log(0,s.k,L(nm(s)+' lleva '+(s.P.gl?'lanzagranadas':'granadas o explosivos')+', pero aquí no se usan: solo pesan.',nm(s)+' carries '+(s.P.gl?'a grenade launcher':'grenades or explosives')+', but they are not used here: only their weight counts.'),'ex'+s.k); });
  function plan(s,e,t){ const K=s.K, P=s.P, c=C0(s), doc=s.side?'push':c.doc, spd=P.spd;
    const ex=new Float32Array(N.length), cMe=new Float32Array(N.length), Lk=new Uint8Array(N.length);
    const unk=K.src==='spawn'||K.src==='guess'||t-K.t>20, ms=Math.sqrt(clamp(M.W/150,1,6));
    for(const n of N){ const l=los(M,n.x,n.y,K.x,K.y); Lk[n.i]=l?1:0; const cv=l?cover(M,K.x,K.y,n.x,n.y,elev(M,K.x,K.y),n.h):1; cMe[n.i]=cv; const dd=Math.hypot(n.x-K.x,n.y-K.y); ex[n.i]=l&&dd<Math.max(420,C0(e).hi*.9)?(cv>.4?.3:1)*(n.v?.5:1)*(s.cau?TU.exW:1):0;
      if(unk) ex[n.i]=Math.max(ex[n.i],n.o[s.k]*(n.v?.4:1)*(cv>.4?.5:1)); }
    const dist=new Float64Array(N.length).fill(1e9), prev=new Int32Array(N.length).fill(-1), done=new Uint8Array(N.length); const st=s.path.length?s.path[0]:s.node; dist[st]=0;
    const H=[[0,st]]; const push=(a)=>{ H.push(a); let i=H.length-1; while(i>0){ const p=(i-1)>>1; if(H[p][0]<=H[i][0]) break; [H[p],H[i]]=[H[i],H[p]]; i=p; } };
    const pop=()=>{ const top=H[0], last=H.pop(); if(H.length){ H[0]=last; let i=0; for(;;){ const l=2*i+1, r=l+1; let m=i; if(l<H.length&&H[l][0]<H[m][0]) m=l; if(r<H.length&&H[r][0]<H[m][0]) m=r; if(m===i) break; [H[m],H[i]]=[H[i],H[m]]; i=m; } } return top; };
    while(H.length){ const [bd,u]=pop(); if(done[u]) continue; if(bd>400) break; done[u]=1;
      for(const [v,len] of N[u].e){ if(done[v]) continue; const w=len/spd*(1+2.5*(ex[u]+ex[v])/2); if(bd+w<dist[v]){ dist[v]=bd+w; prev[v]=u; push([dist[v],v]); } } }
    const d0=Math.hypot(s.x-K.x,s.y-K.y)+1, idle=t-Math.max(s.seenT,0), pat=(doc==='hold'?(c===CL.dmr?25:35):doc==='mg'?30:12)*ms;
    const prog=(doc==='push'?.6:doc==='move'?.3:0)+(idle>pat?Math.min(3,.6+.04*(idle-pat)):0);
    let best=-1,bs=-1e9; const cw=1/(ms*ms);
    for(const n of N){ if(dist[n.i]>=1e9) continue; const dK=Math.hypot(n.x-K.x,n.y-K.y), lo=c.lo, hi=c.hi;
      const band=dK<lo?Math.exp(-2*Math.pow((lo-dK)/lo,2)):dK>hi?Math.pow(hi/dK,2):1, L_=Lk[n.i], cE=L_?cover(M,n.x,n.y,K.x,K.y,n.h,elev(M,K.x,K.y)):1, pr=1-dK/d0;
      let sc; if(doc==='hold') sc=2.2*band+1.2*cMe[n.i]*(L_?1:.5)+(L_?.7:0)+1.0*Math.min(1,n.h/50)+(n.v?(P.gh?.5:.3):0)-.012*cw*dist[n.i]-(dK<lo*.6?1:0)+(prog?prog*pr:-.8*pr);
      else if(doc==='mg') sc=2.0*band+1.3*cMe[n.i]*(L_?1:.5)+(L_?.8:0)-.015*cw*dist[n.i]+prog*pr;
      else if(doc==='push') sc=2.2*band+.6*cMe[n.i]+(L_?.9*(1-cE):.15)-.02*cw*dist[n.i]+prog*pr+(n.v?.15:0);
      else sc=1.6*band+1.0*cMe[n.i]*(L_?1:.6)+(L_?.6*(1-cE):0)-.02*cw*dist[n.i]+prog*pr+(n.t?.1:0);
      if(s.flank>t&&L_) sc+=1.2*(1-cE);
      if(unk&&doc!=='hold') sc-=.5*n.o[s.k];
      sc+=R()*.04; if(sc>bs){ bs=sc; best=n.i; } }
    if(best<0) return; const cur=s.path.length?s.path[s.path.length-1]:s.node;
    if(best===cur||(s.tgt===cur&&bs<s.tsc+.15&&s.path.length)) { s.tsc=bs; return; }
    const pth=[]; for(let v=best;v>=0&&v!==st;v=prev[v]) pth.unshift(v); s.path=s.path.length?[s.path[0]].concat(pth):pth; s.tgt=best; s.tsc=bs;
    if(s.flank>t&&!s.lg.fl){ s.lg.fl=1; const side=N[best].y<K.y?L('por arriba','from above'):L('por abajo','from below'); log(t,s.k,L(nm(s)+' rodea '+side+' para que el muro no le cubra.',nm(s)+' flanks '+side+' so the cover no longer protects the other.'),'fl'+s.k); }
  }
  function decide(s,e,t){ if(s.hp<=0||s.heal>0) return; const P=s.P, d=Math.hypot(s.x-e.x,s.y-e.y);
    /* arma corta de cerca (si la lleva) */ if(P.side&&/tirador|dmr|mg/.test(P.cls)){ if(!s.side&&s.vis&&d<15){ s.side=true; s.sw=1; log(t,s.k,L(nm(s)+' saca la pistola: a '+f0(d)+' m su arma larga es lenta.',nm(s)+' draws the pistol: at '+f0(d)+' m the long gun is slow.'),'side'+s.k); } else if(s.side&&d>35){ s.side=false; s.sw=1; } }
    if(s.hp<55&&s.med>0&&(!s.vis||(s.hp<30&&s.cov>.4))&&t-s.hitT>1.5){ s.heal=P.med.t; s.path=[]; s.mode='heal'; return; }
    if(s.hp<55&&s.med>0&&s.vis&&d>8){ let b=-1,bc=1e9; for(const n of N){ const dd=Math.hypot(n.x-s.x,n.y-s.y); if(dd>P.spd*5||los(M,e.x,e.y,n.x,n.y)) continue; if(dd<bc){ bc=dd; b=n.i; } }
      if(b>=0){ s.path=[b]; s.mode='move'; s.tgt=b; if(!s.lg.rt){ s.lg.rt=1; log(t,s.k,L(nm(s)+' está herido: se aparta de la vista para curarse.',nm(s)+' is hurt: breaks line of sight to patch up.'),'rt'+s.k); } return; } }
    if(s.hp<55&&s.med<=0&&!P.med.uses&&e.P.med.uses) log(t,s.k,L(nm(s)+' está herido y no lleva botiquín: no puede curarse.',nm(s)+' is hurt and carries no medical kit: cannot heal.'),'nomed'+s.k);
    if(s.vis&&accAt(s,d,false)<(!s.side&&C0(s).doc==='push'&&C0(e).hi>3*C0(s).hi?TU.far:.05)){ const dc=s.side?'push':C0(s).doc; if(dc==='hold'||dc==='mg'){ s.mode='hold'; s.path=[]; return; }
      if(dc==='push'&&(!s.cau||t-s.cauT>TU.redive)){ let b=-1,bc=1e9; for(const n of N){ const dd=Math.hypot(n.x-s.x,n.y-s.y); if(dd>P.spd*TU.dive||los(M,e.x,e.y,n.x,n.y)) continue; if(dd<bc){ bc=dd; b=n.i; } }
        if(b>=0){ s.cau=1; s.cauT=t; s.path=[b]; s.mode='move'; s.tgt=b; s.flank=t+40; if(!s.lg.dv){ s.lg.dv=1; log(t,s.k,L(nm(s)+' no llega tan lejos con su arma: se quita de la vista y se acercará a escondidas.',nm(s)+' cannot reach that far: drops out of sight to sneak closer.'),'dive'+s.k); } return; } } if(!s.flank||s.flank<t) s.flank=t+30; s.mode='move'; if(!s.path.length||Math.round(t*2)%2===0) plan(s,e,t); return; }
    if(s.vis){ const mp=accAt(s,d,false)*(1-cover(M,s.x,s.y,e.x,e.y,s.h,e.h)), ep=accAt(e,d,false)*(1-s.cov);
      if(s.cov>=.4||d<20||mp>=ep*1.5||(C0(s).doc==='push'&&mp>=ep*.9)){ s.mode='fire'; s.path=s.path.length?[s.path[0]]:[]; if(!s.path.length) s.mode='fire';
        if(mp<.1&&s.cov>=.4&&!s.flank&&t-s.seenT<2&&(s.stale=(s.stale||0)+1)>(P.spd>=e.P.spd*.95?10:9999)&&C0(s).doc!=='hold'){ s.flank=t+40; s.stale=0; s.mode='move'; plan(s,e,t); } return; }
      /* al descubierto y en desventaja: a la cubierta más cercana */
      let b=-1,bc=1e9; for(const n of N){ const dd=Math.hypot(n.x-s.x,n.y-s.y); if(dd>P.spd*4) continue; const cv=los(M,e.x,e.y,n.x,n.y)?cover(M,e.x,e.y,n.x,n.y,e.h,n.h):1; if(cv<.4) continue; const sc=dd/P.spd-(cv>.9?1:0); if(sc<bc){ bc=sc; b=n.i; } }
      if(b>=0&&b!==s.node){ s.path=[b]; s.mode='move'; s.tgt=b; if(!s.lg.cv){ s.lg.cv=1; if(!LOG.some(l=>/^cv/.test(l.key||''))) log(t,s.k,L(nm(s)+' le ve venir y corre a cubrirse: tras un muro el otro no tiene tiro limpio.',nm(s)+' is spotted and runs for cover: behind a wall the other has no clean shot.'),'cv'+s.k); } }
      else s.mode='fire'; return; }
    if(Math.hypot(s.x-s.K.x,s.y-s.K.y)<Math.max(8,M.g)&&!s.vis&&t-s.K.t>3){ s.K={x:M.W-s.x,y:M.H-s.y,t:t,src:'guess'}; }
    s.mode='move'; if(!s.path.length||Math.round(t*2)%2===0) plan(s,e,t); }
  let t=0, end=null, first=null;
  for(let it=0;t<=TMAX;it++,t+=DT){ const ord=it%2?[1,0]:[0,1];
    for(const i of ord){ const s=S[i], e=S[1-i]; if(s.hp<=0) continue; const d=Math.hypot(s.x-e.x,s.y-e.y), l=los(M,s.x,s.y,e.x,e.y);
      if(l&&d<=spotR(M,mk,s,e,t)){ s.visT+=DT; } else if(!l||d>spotR(M,mk,s,e,t)*1.3){ s.visT=0; }
      const was=s.vis; s.vis=s.visT>=.4; if(s.vis){ s.K={x:e.x,y:e.y,t,src:'eye'}; s.seenT=t; if(!was&&!first){ first=s.k; const why=e.mv?L(' se mueve al descubierto',' is moving in the open'):e.vg?L(' está entre la vegetación',' is in the vegetation'):''; log(t,s.k,L(nm(s)+' ve primero a '+nm(e)+' a '+f0(d)+' m'+(s.P.opt.m>=3&&!s.side?' con su visor de '+String(s.P.opt.m).replace('.',',')+' aumentos':'')+(why?': '+nm(e)+why:'')+'.',nm(s)+' spots '+nm(e)+' first at '+f0(d)+' m'+(s.P.opt.m>=3&&!s.side?' with a '+s.P.opt.m+'× scope':'')+(why?': '+nm(e)+why:'')+'.'),'first'); } }
      /* ruido de pasos: el que carga mucho suena antes */ if(!s.vis&&e.mv&&d<(e.P.pct>45?30:18)) s.K={x:e.x,y:e.y,t,src:'ear'};
    }
    if(it%2===0) for(const i of (it%4?[1,0]:[0,1])){ const s=S[i]; if(s.hp>0) decide(s,S[1-i],t); }
    for(const i of ord){ const s=S[i], e=S[1-i]; if(s.hp<=0) continue; if(s.sw>0) s.sw-=DT;
      if(s.heal>0){ s.heal-=DT; s.mv=false; if(s.heal<=0){ s.med--; const g=Math.min(100-s.hp,s.P.med.hp); s.hp+=g; s.stats.heal+=g; ev.push({t,k:'heal',s:s.k,v:g}); log(t,s.k,L(nm(s)+' se cura con su '+s.P.med.what+': +'+g+' de vida.',nm(s)+' patches up with the '+s.P.med.what+': +'+g+' HP.'),'heal'+s.k+'_'+s.med); s.mode='hold'; } continue; }
      const moving=s.path.length>0&&!(s.mode==='fire'&&s.vis);
      if(moving){ const n=N[s.path[0]], dx=n.x-s.x, dy=n.y-s.y, dd=Math.hypot(dx,dy), st=s.P.spd*DT*(s.vis&&s.mode!=='move'?.5:1); if(dd<=st){ s.x=n.x; s.y=n.y; s.node=n.i; s.path.shift(); s.stats.dist+=dd; } else { s.x+=dx/dd*st; s.y+=dy/dd*st; s.stats.dist+=st; } s.mv=true; } else s.mv=false;
      s.h=elev(M,s.x,s.y); s.vg=veg(M,s.x,s.y); s.cov=s.mv?0:cover(M,e.x,e.y,s.x,s.y,e.h,s.h);
      if(s.cov===0&&!s.mv){ const nn=N[s.node]; if(nn&&nn.t) s.cov=cover(M,e.x,e.y,s.x,s.y,e.h,s.h); }
      s.cd-=DT; const d=Math.hypot(s.x-e.x,s.y-e.y), cls=s.side?'pistola':s.P.cls, C=CL[cls];
      const canMoveFire=/pistola|subfusil|escopeta|asalto/.test(cls)&&d<40;
      if(s.vis&&s.cd<=0&&s.sw<=0&&e.hp>0&&(!s.mv||canMoveFire)&&d<C.R*2.5&&accAt(s,d,s.mv)*(1-(e.mv?0:e.cov))>=(s.mv?.08:.03)){ s.cd+=1/(C.rate*(s.side?1:(s.P.rr||1))*(cls==='tirador'&&s.P.heavy50?1.4:1)); if(s.cd<0) s.cd=0;
        let p=accAt(s,d,s.mv)*(1-(e.mv?0:e.cov))*(e.mv?(d>60?(cls==='tirador'&&d>TU.mvD?TU.mvS:.65):.85)*(!s.side&&s.P.opt.m>=5&&d<150?.75:1):1)*(t<s.supp?.75:1)*(e.mv&&d>100&&!s.side?clamp(1+.3*((s.P.vel||850)-850)/850*Math.min(1,(d-100)/300),.85,1.08):1); s.stats.sh++; s.firedT=t; const hit=R()<p;
        ev.push({t,k:'shot',s:s.k,hit,x:e.x,y:e.y,p:Math.round(p*100)});
        e.supp=t+(cls==='mg'?2:1); if(!(s.P.supp&&!s.side)||d<60){ e.K={x:s.x,y:s.y,t,src:'shot'}; } else if(!e.vis){ const er=d*.25; e.K={x:clamp(s.x+(R()-.5)*er,0,M.W),y:clamp(s.y+(R()-.5)*er,0,M.H),t,src:'shot?'}; if(!e.lg.sup){ e.lg.sup=1; log(t,s.k,L('El silenciador de '+nm(s)+' hace que '+nm(e)+' no sepa bien de dónde le disparan.',nm(s)+'\'s suppressor means '+nm(e)+' cannot tell where the shots come from.'),'sup'+s.k); } }
        if(hit){ const lr=R(), loc=lr<TU.head?2:lr<TU.head+TU.limb?1:0, g=Math.min(e.hp,dmgOf(s,e,d,loc)); e.hp=Math.max(0,e.hp-g); e.hitT=t; s.stats.hit++; s.stats.dmg+=g;
          if(loc===2&&!s.lg.hd){ s.lg.hd=1; log(t,s.k,L('¡Golpe de suerte! '+nm(s)+' le da a '+nm(e)+' en la cabeza a '+f0(d)+' m: −'+g+' de vida'+(e.P.helmet?' (el casco frena parte)':' (no lleva casco)')+'.','Lucky shot! '+nm(s)+' hits '+nm(e)+' in the head at '+f0(d)+' m: −'+g+' HP'+(e.P.helmet?' (the helmet stops some)':' (no helmet)')+'.'),'hd'+s.k); s.lg.h1=1; }
          if(e.mv&&d>150&&!s.side&&s.P.velReal&&!s.lg.vl&&s.P.vel>=(e.P.vel||0)*1.1&&s.P.vel>=850){ s.lg.vl=1; log(t,s.k,L('La bala de '+nm(s)+' llega antes ('+f0(s.P.vel)+' m/s): a '+f0(d)+' m cuesta menos acertar a quien se mueve.',nm(s)+'\'s bullet gets there sooner ('+f0(s.P.vel)+' m/s): at '+f0(d)+' m a moving target is easier to hit.'),'vl'+s.k); }
          if(!s.lg.h1){ s.lg.h1=1; const ar=loc===1?L(' en un brazo o una pierna, donde no hay placa',' in an arm or leg, where there is no plate'):e.P.armor>0?L(' (las placas paran parte)',' (the plates stop some)'):L(' (no lleva placas: entra entero)',' (no plates: full damage)'); const cv=e.cov>.4?L(', aunque estaba a cubierto',', even though in cover'):e.mv?L(': le pilla moviéndose al descubierto',': caught moving in the open'):''; log(t,s.k,L(nm(s)+' acierta a '+f0(d)+' m: −'+g+' de vida'+ar+cv+'.',nm(s)+' hits at '+f0(d)+' m: −'+g+' HP'+ar+cv+'.'),'h1'+s.k); }
          if(e.hp<=0){ end={w:s.k,t,d,how:'ko'}; } } }
    }
    if(it%2===0) fr.push(S.map(s=>[Math.round(s.x*10)/10,Math.round(s.y*10)/10,s.hp,s.mode==='heal'?2:s.vis?1:0,s.side?1:0,s.cov>.4?1:0]));
    if(end) break; }
  if(!end){ const a=S[0].hp, b=S[1].hp; end=a===b?{w:-1,t:TMAX,how:'time'}:{w:a>b?0:1,t:TMAX,how:'time'}; }
  const W_=end.w>=0?S[end.w]:null, Ls=end.w>=0?S[1-end.w]:null;
  if(end.how==='ko') log(end.t,end.w,L(nm(Ls)+' queda fuera de combate a '+f0(end.d)+' m. Gana '+nm(W_)+' con '+W_.hp+' de vida.',nm(Ls)+' is out of action at '+f0(end.d)+' m. '+nm(W_)+' wins with '+W_.hp+' HP.'),'end');
  else if(W_) log(end.t,end.w,L('Se acaba el tiempo sin que nadie caiga: gana '+nm(W_)+' por tener más vida ('+W_.hp+' contra '+Ls.hp+').','Time runs out with nobody down: '+nm(W_)+' wins on HP ('+W_.hp+' vs '+Ls.hp+').'),'end');
  else log(end.t,-1,L('Se acaba el tiempo y los dos siguen igual: empate.','Time runs out with both level: draw.'),'end');
  return {w:end.w,how:end.how,t:end.t,fr,ev,log:LOG,S:S.map(s=>({hp:s.hp,stats:s.stats,P:s.P,med:s.med})),dt:DT*2,map:mk};
}
/* duelo canónico: el orden de los lados sale de los códigos, así los dos amigos ven el mismo resultado */
export function duel(a,b,mk,round){ const sw=String(a.code||'')>String(b.code||''); const L0=sw?b:a, R0=sw?a:b; const seed=hash([L0.code||L0.P.nick,R0.code||R0.P.nick,mk,round||1].join('|'));
  /* se juega dos veces, cambiando de lado, para que empezar a la izquierda o a la derecha no cuente; gana quien gane las dos, o si se reparten, quien gane con más margen */
  const r1=simulate(L0.P,R0.P,mk,seed), r2=simulate(R0.P,L0.P,mk,(seed^0x9e3779b9)>>>0); const w1=r1.w, w2=r2.w<0?-1:1-r2.w;
  const m1=w1>=0?r1.S[w1].hp+(r1.how==='ko'?100:0):0, m2=w2>=0?r2.S[r2.w].hp+(r2.how==='ko'?100:0):0;
  const pick2=w1!==w2&&m2>m1; const r=pick2?r2:r1; r.swap=pick2?!sw:sw; r.both=w1===w2; return r; }
/* ===================== interfaz (solo se carga al abrir el duelo) ===================== */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(n,d)=>{ try{ return (+n).toLocaleString(EN_()?'en-GB':'es-ES',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}); }catch(e){ return String(n); } };
const PC=v=>nf(v,0)+(EN_()?'%':' %');
const LL=a=>Array.isArray(a)?(EN_()?a[1]:a[0]):a;
const ORDER=['casa','pueblo','montana','trincheras'];
const COL=['#c8f03c','#ff9f43'];
function css(){ if(document.getElementById('sdducss')) return; const s=document.createElement('style'); s.id='sdducss'; s.textContent=
 '.sddu{margin:6px 0 18px;padding:16px;background:linear-gradient(165deg,#1d2018 0%,#14160f 60%,#0f110c 100%);clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%);min-width:0}'+
 '.sddu .k{display:block;font:600 10.5px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--lime,#c8f03c);margin-bottom:7px}.sddu h2{margin:0 0 4px;font-size:22px;line-height:1.15;overflow-wrap:anywhere}.sddu>p,.sddu .sub2{margin:2px 0 12px;color:var(--mu,#a3a796);font-size:13.5px;line-height:1.4}'+
 '.sddu .pr{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 12px}.sddu .pc{min-width:0;padding:9px 10px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.03);font-size:12.5px;line-height:1.35;color:var(--mu,#a3a796)}.sddu .pc b{display:block;color:var(--tx,#efeee6);font-size:14px;margin-bottom:2px;overflow-wrap:anywhere}.sddu .pc .dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:0}'+
 '.sddu .mp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:6px 0 12px}@media (min-width:760px){.sddu .mp{grid-template-columns:repeat(4,1fr)}}.sddu .mp button{display:flex;flex-direction:column;align-items:stretch;gap:6px;min-width:0;padding:8px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.03);color:var(--tx,#efeee6);text-align:left;cursor:pointer;font:inherit}.sddu .mp button.on{border-color:var(--lime,#c8f03c);box-shadow:inset 0 0 0 1px var(--lime,#c8f03c)}.sddu .mp canvas{width:100%;height:auto;display:block;background:#111}.sddu .mp b{font-size:14.5px}.sddu .mp small{color:var(--mu,#a3a796);font-size:11.5px;line-height:1.3}'+
 '.sddu .b{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.sddu .b a,.sddu .b button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 15px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.04);color:var(--tx,#efeee6);font:600 14px/1 system-ui,sans-serif;text-decoration:none;cursor:pointer}.sddu .b .pri{background:var(--lime,#c8f03c);border-color:var(--lime,#c8f03c);color:#0b0c0a;font-weight:700}'+
 '.sddu .ar{position:relative;margin:6px auto 0;max-width:760px}.sddu .hp,.sddu .ct,.sddu ol,.sddu [data-end]{max-width:760px;margin-left:auto;margin-right:auto}.sddu .ar canvas{display:block;width:100%;height:auto;background:#1a1c16;touch-action:manipulation}.sddu .ph{position:absolute;left:8px;top:8px;padding:4px 8px;background:rgba(10,11,8,.78);font:700 11px/1 system-ui,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--lime,#c8f03c)}'+
 '.sddu .hp{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0 6px}.sddu .hp div{min-width:0;font:600 12.5px/1.2 system-ui,sans-serif;color:var(--tx,#efeee6)}.sddu .hp span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-bottom:4px}.sddu .hp i{display:block;height:8px;background:#2a2e24;position:relative}.sddu .hp i em{position:absolute;left:0;top:0;bottom:0;transition:width .25s}'+
 '.sddu .ct{display:flex;gap:8px;margin:8px 0}.sddu .ct button{min-height:38px;padding:0 12px;border:1px solid var(--line,#2a2e24);background:rgba(255,255,255,.04);color:var(--tx,#efeee6);font:600 13px/1 system-ui,sans-serif;cursor:pointer}'+
 '.sddu ol{list-style:none;margin:8px 0 0;padding:0;font-size:13.5px;line-height:1.4}.sddu ol li{padding:6px 0 6px 12px;border-left:3px solid #3a4230;margin:0 0 4px;color:var(--tx,#efeee6)}.sddu ol li small{color:var(--dim,#6e7365);margin-right:6px}'+
 '.sddu .wn{margin:14px 0 8px;padding:14px;border:1px solid var(--lime,#c8f03c);background:rgba(200,240,60,.07)}.sddu .wn b{display:block;font-size:22px;line-height:1.15;color:var(--tx,#efeee6);overflow-wrap:anywhere}.sddu .wn span{color:var(--mu,#a3a796);font-size:13px}'+
 '.sddu table{width:100%;border-collapse:collapse;margin:8px 0 4px;font-size:13px;table-layout:fixed}.sddu th,.sddu td{padding:7px 4px;border-bottom:1px solid var(--line,#2a2e24);text-align:center;overflow-wrap:anywhere}.sddu th{font:700 11px/1.2 system-ui,sans-serif;letter-spacing:.06em;text-transform:uppercase}.sddu td:first-child,.sddu th:first-child{text-align:left;color:var(--mu,#a3a796);width:32%}'+
 '.sddu .n{font-size:12px;color:var(--dim,#6e7365);margin:10px 0 0;line-height:1.4}.sddu textarea{width:100%;box-sizing:border-box;min-height:64px;padding:9px;background:#0b0c0a;border:1px solid var(--line,#2a2e24);color:var(--tx,#efeee6);font:600 13px/1.35 ui-monospace,Menlo,Consolas,monospace;resize:vertical}.sddu .er{color:#ff8a65;font-size:13px;margin:6px 0 0}';
 document.head.appendChild(s); }
/* --- dibujo del mapa --- */
function drawMap(cx,M,w,mir){ const s=w/M.W, X=x=>mir?(M.W-x)*s:x*s; cx.fillStyle=M.ground; cx.fillRect(0,0,w,M.H*s);
  (M.Z||[]).forEach(z=>{ for(let i=4;i>=1;i--){ cx.beginPath(); cx.ellipse(X(z.cx),z.cy*s,z.r*s*i/4,z.r*s*i/4,0,0,7); cx.fillStyle='rgba(120,130,90,'+(.07)+')'; cx.fill(); cx.strokeStyle='rgba(170,180,130,.18)'; cx.lineWidth=1; cx.stroke(); } });
  (M.V||[]).forEach(r=>{ cx.fillStyle='rgba(60,110,50,.45)'; const x0=mir?X(r.x+r.w):X(r.x); cx.fillRect(x0,r.y*s,r.w*s,r.h*s); cx.fillStyle='rgba(80,140,60,.5)'; for(let i=0;i<Math.max(3,r.w*r.h*s*s/180);i++){ const px=x0+((i*37)%97)/97*r.w*s, py=r.y*s+((i*61)%89)/89*r.h*s; cx.beginPath(); cx.arc(px,py,Math.max(2,3*s*Math.min(3,M.g/9)),0,7); cx.fill(); } });
  (M.T||[]).forEach(r=>{ cx.fillStyle='#17140f'; cx.fillRect(mir?X(r.x+r.w):X(r.x),r.y*s,Math.max(2,r.w*s),Math.max(2,r.h*s)); });
  M.L.forEach(r=>{ cx.fillStyle='#8a7a55'; cx.fillRect(mir?X(r.x+r.w):X(r.x),r.y*s,Math.max(2,r.w*s),Math.max(2,r.h*s)); });
  M.F.forEach(r=>{ cx.fillStyle='#55584c'; cx.fillRect(mir?X(r.x+r.w):X(r.x),r.y*s,Math.max(2,r.w*s),Math.max(2,r.h*s)); cx.strokeStyle='#777a6c'; cx.lineWidth=1; cx.strokeRect((mir?X(r.x+r.w):X(r.x))+.5,r.y*s+.5,Math.max(1,r.w*s-1),Math.max(1,r.h*s-1)); });
  /* escala */ const m=M.W>500?100:M.W>100?20:5; cx.fillStyle='rgba(230,230,210,.75)'; cx.fillRect(w-10-m*s,M.H*s-10,m*s,2); cx.font='600 10px system-ui,sans-serif'; cx.textAlign='right'; cx.fillText(m+' m',w-10,M.H*s-14); }
function thumb(mk){ const M=MAPS[mk], w=280, cv=document.createElement('canvas'); cv.width=w; cv.height=Math.round(M.H*w/M.W); drawMap(cv.getContext('2d'),M,w,false);
  const cx=cv.getContext('2d'), s=w/M.W; [[M.A,COL[0]],[M.B,COL[1]]].forEach(([p,c])=>{ cx.beginPath(); cx.arc(p.x*s,p.y*s,6,0,7); cx.fillStyle=c; cx.fill(); cx.strokeStyle='#0b0c0a'; cx.lineWidth=2; cx.stroke(); }); return cv; }
/* --- ficha corta de cada soldado --- */
function chip(P,col){ const C=CL[P.cls], ex=[]; if(P.optName) ex.push(L('visor ','scope ')+(P.opt.m>1?String(P.opt.m).replace('.',EN_()?'.':',')+'×':'1×')); if(P.supp) ex.push(L('silenciador','suppressor')); if(P.bip) ex.push(L('bípode','bipod')); if(P.gh) ex.push('ghillie'); if(P.side) ex.push(L('pistola','pistol'));
  return '<div class="pc"><b><span class="dot" style="background:'+col+'"></span>'+esc(P.nick)+'</b>'+esc(P.wn)+' · '+esc(LL(C.n))+'<br>'+L('Alcance: ','Range: ')+esc(LL(C.band))+'<br>'+nf(P.tot,1)+' kg ('+PC(P.pct)+') → '+nf(P.spd,1)+' m/s<br>'+(P.plates?L('Placas','Plates'):P.soft?L('Chaleco blando','Soft vest'):L('Sin chaleco','No vest'))+(P.helmet?L(' + casco',' + helmet'):'')+' · '+(P.med.uses?L('botiquín ×','med kit ×')+P.med.uses:L('sin botiquín','no med kit'))+(ex.length?'<br>'+esc(ex.join(' · ')):'')+'</div>'; }
/* --- estado --- */
let RUN=0, ANIM=0;
function sec(){ let el=document.getElementById('sddu'); if(!el){ el=document.createElement('section'); el.id='sddu'; el.className='sddu'; el.setAttribute('data-noi18n',''); const vs=document.getElementById('sdvs'); const app=document.getElementById('app'); if(vs&&vs.parentNode) vs.parentNode.insertBefore(el,vs); else if(app) app.insertBefore(el,app.firstChild); } return el; }
function codeU(c){ const n=codeN(c); return /^SOL-/i.test(n)?n:'SOL-'+n; }
function codeN(c){ try{ return window.MAT_SDP&&MAT_SDP.norm?MAT_SDP.norm(c):String(c||'').toUpperCase(); }catch(e){ return String(c||''); } }
function linkFor(G,mk,r){ return location.origin+location.pathname+'#/soldado?vs='+codeU(G.me.code)+'&a='+codeU(G.fr.code)+'&duelo='+mk+(r>1?'&r='+r:''); }
function setURL(G,mk,r){ try{ history.replaceState(history.state,'','#/soldado?vs='+codeU(G.fr.code)+(G.aCode?'&a='+codeU(G.aCode):'')+'&duelo='+mk+(r>1?'&r='+r:'')); }catch(e){} }
/* entrada desde la comparación: X = utilidades de soldado.js; o = {code, F, a, map, r} */
export async function open(X,o){ css(); const my=++RUN; cancelAnimationFrame(ANIM); const el=sec();
  el.innerHTML='<span class="k">⚔️ '+L('Duelo 1 vs 1','1 vs 1 duel')+'</span><h2>'+L('Preparando el duelo…','Preparing the duel…')+'</h2>';
  const ARM=await X.arm().catch(()=>null); if(my!==RUN) return;
  let mine=null, mNick='', mCode='';
  if(o.a){ const Fa=window.MAT_SDP?MAT_SDP.decode(X,o.a):{err:1}; if(!Fa.err){ mine=Fa.st; mNick=Fa.nick; mCode=codeN(o.a); } }
  if(!mine){ const s=X.st(); if(s&&(s.role||s.arma||Object.keys(s.q||{}).some(k=>s.q[k]>0))){ mine=s; mNick=X.nickGet?X.nickGet():''; try{ const md=X.dataFor(s); md.nick=mNick; mCode=codeN(MAT_SDP.encode(X,md)); }catch(e){ mCode='YO'; } } }
  if(!mine){ el.innerHTML='<span class="k">⚔️ '+L('Duelo 1 vs 1','1 vs 1 duel')+'</span><h2>'+L('Crea tu soldado','Create your soldier')+'</h2><p>'+L('Para luchar contra el soldado de ','To fight ')+esc(o.F.nick||L('tu amigo','your friend'))+L(' necesitas el tuyo: elige rol y arma aquí abajo y vuelve a pulsar «Luchar 1 vs 1».','\'s soldier you need your own: pick a role and weapon below, then press “Fight 1 vs 1” again.')+'</p><div class="b"><a class="pri" href="#/soldado" data-sdmk>'+L('Crea tu soldado','Create your soldier')+'</a></div>';
    const b=el.querySelector('[data-sdmk]'); if(b) b.onclick=e=>{ e.preventDefault(); const t=document.getElementById('sdrole')||document.querySelector('.sd-card'); if(t) t.scrollIntoView({behavior:'smooth',block:'start'}); }; el.scrollIntoView({block:'start'}); return; }
  const fCode=codeN(o.code), fd=X.dataFor(o.F.st), md=X.dataFor(mine);
  const G={X,ARM,aCode:o.a?mCode:'',me:{code:mCode,P:profile(mine,md,ARM,mNick||L('Tu soldado','Your soldier'))},fr:{code:fCode,P:profile(o.F.st,fd,ARM,o.F.nick||L('Tu amigo','Your friend'))}};
  if(G.me.P.nick===G.fr.P.nick) G.fr.P.nick+=' (2)';
  picker(G,el,o.map&&MAPS[o.map]?o.map:null,o.r|0||1,!!(o.map&&MAPS[o.map]));
}
function head(G){ return '<span class="k">⚔️ '+L('Duelo 1 vs 1 · sin explosivos','1 vs 1 duel · no explosives')+'</span><h2>'+esc(G.me.P.nick)+' vs '+esc(G.fr.P.nick)+'</h2><div class="pr">'+chip(G.me.P,COL[0])+chip(G.fr.P,COL[1])+'</div>'; }
function picker(G,el,mk,r,go){ let sel=mk||'pueblo';
  el.innerHTML=head(G)+'<p class="sub2">'+L('Elige el mapa. Cada uno sale en un extremo, sin ayuda. Luchan solos: cada soldado decide según su arma, su equipo y su peso.','Pick the map. Each starts at one end, with no help. They fight on their own: each soldier decides from its weapon, kit and weight.')+'</p><div class="mp">'+ORDER.map(k=>'<button type="button" data-m="'+k+'"'+(k===sel?' class="on"':'')+'><span data-t></span><b>'+esc(LL(MAPS[k].n))+'</b><small>'+esc(LL(MAPS[k].b))+'</small></button>').join('')+'</div><div class="b"><button type="button" class="pri" data-go>⚔️ '+L('Luchar','Fight')+'</button></div><p class="n">'+L('Mismo tiempo de reacción para los dos. El empleo y las medallas no dan ventaja. Mismo duelo y mismo mapa = mismo resultado.','Same reaction time for both. Rank and medals give no edge. Same duel and same map = same result.')+'</p>';
  el.querySelectorAll('[data-m]').forEach(b=>{ b.querySelector('[data-t]').appendChild(thumb(b.dataset.m)); b.onclick=()=>{ sel=b.dataset.m; el.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b)); }; });
  el.querySelector('[data-go]').onclick=()=>fight(G,el,sel,r);
  if(go) fight(G,el,sel,r); else el.scrollIntoView({block:'start'}); }
function fight(G,el,mk,r){ const my=++RUN; cancelAnimationFrame(ANIM); setURL(G,mk,r); const M=prep(MAPS[mk]);
  el.innerHTML=head(G)+'<div class="sub2">'+esc(LL(M.n))+' · '+esc(LL(M.b))+(r>1?' · '+L('revancha ','rematch ')+r:'')+'</div><div class="hp"><div><span>'+esc(G.me.P.nick)+'</span><i><em style="width:100%;background:'+COL[0]+'"></em></i></div><div><span>'+esc(G.fr.P.nick)+'</span><i><em style="width:100%;background:'+COL[1]+'"></em></i></div></div><div class="ar"><canvas></canvas><div class="ph">'+L('Calculando…','Working it out…')+'</div></div><div class="ct"><button type="button" data-x>×3</button><button type="button" data-sk>'+L('Saltar ›','Skip ›')+'</button></div><ol></ol><div data-end></div>';
  el.scrollIntoView({block:'start'});
  setTimeout(()=>{ if(my!==RUN) return; let res; try{ res=duel({P:G.me.P,code:G.me.code},{P:G.fr.P,code:G.fr.code},mk,r); }catch(e){ console.warn('duelo',e); el.querySelector('.ph').textContent=L('No se pudo calcular el duelo.','The duel could not be worked out.'); return; } play(G,el,mk,r,res,my); },30); }
function play(G,el,mk,r,res,my){ const M=MAPS[mk], cv=el.querySelector('canvas'), cx=cv.getContext('2d'), mir=res.swap; /* mi soldado siempre a la izquierda */
  const me=res.swap?1:0; const col=k=>k===me?COL[0]:COL[1]; const nick=k=>k===me?G.me.P.nick:G.fr.P.nick;
  const W0=Math.max(280,Math.round(cv.parentNode.clientWidth||340)), dpr=Math.min(2,window.devicePixelRatio||1), H0=Math.round(W0*M.H/M.W);
  cv.width=W0*dpr; cv.height=H0*dpr; cv.style.height=H0+'px'; cx.setTransform(dpr,0,0,dpr,0,0);
  const bg=document.createElement('canvas'); bg.width=W0*dpr; bg.height=H0*dpr; const bx=bg.getContext('2d'); bx.setTransform(dpr,0,0,dpr,0,0); drawMap(bx,M,W0,mir);
  const s=W0/M.W, X=x=>mir?(M.W-x)*s:x*s, Y=y=>y*s; const fr=res.fr, T=res.t, firstSpot=(res.log.find(l=>l.key==='first')||{}).t;
  const busy=fr.map((f,i)=>f[0][3]===1||f[1][3]===1||f[0][3]===2||f[1][3]===2); res.ev.forEach(e=>{ const i=Math.round(e.t/res.dt); for(let j=i-2;j<=i+2;j++) if(j>=0&&j<busy.length) busy[j]=true; });
  const Tw=busy.reduce((a,b)=>a+(b?1:.25),0)*res.dt, dur=clamp(Tw*.5,8,35), v0=Tw/dur; let sp=1, t0=performance.now(), simT=0, last=t0, done=false; const ol=el.querySelector('ol'), ph=el.querySelector('.ph'), bars=el.querySelectorAll('.hp em'); let shown=0;
  const lines=res.log.filter(l=>l.key!=='end');
  const phase=t=>t>=T-.01?L('Resultado','Result'):firstSpot==null||t<firstSpot?L('Movimiento','Movement'):t<firstSpot+3?L('Contacto','Contact'):L('Intercambio de fuego','Exchange of fire');
  function frame(now){ try{ frame0(now); }catch(e){ console.error('duelo frame '+(e&&e.stack)); } }
  function frame0(now){ if(my!==RUN) return; const dt=Math.max(0,Math.min(.1,(now-last)/1000)); last=now; const bi=Math.min(busy.length-1,Math.max(0,Math.floor(simT/res.dt))); simT=Math.max(0,Math.min(T,simT+dt*sp*v0*(busy[bi]?1:4))); const fi=simT/res.dt, i0=Math.max(0,Math.min(fr.length-1,Math.floor(fi))), i1=Math.min(fr.length-1,i0+1), a=fi-i0;
    cx.drawImage(bg,0,0,W0,H0);
    res.ev.forEach(e=>{ if(e.k!=='shot'||e.t>simT||e.t<simT-.35) return; const f=fr[Math.min(fr.length-1,Math.round(e.t/res.dt))]; const p=f[e.s]; const tx=e.hit?e.x:e.x+((e.t*7919)%5-2.5)*(M.W/80), ty=e.hit?e.y:e.y+((e.t*104729)%5-2.5)*(M.W/80);
      cx.strokeStyle=e.hit?'rgba(255,230,140,.95)':'rgba(255,230,140,.45)'; cx.lineWidth=e.hit?1.6:1; cx.beginPath(); cx.moveTo(X(p[0]),Y(p[1])); cx.lineTo(X(tx),Y(ty)); cx.stroke();
      if(e.hit){ cx.fillStyle='rgba(255,240,180,.9)'; cx.beginPath(); cx.arc(X(e.x),Y(e.y),3,0,7); cx.fill(); } });
    for(let k=0;k<2;k++){ const p0=fr[i0][k], p1=fr[i1][k]; const x=X(p0[0]+(p1[0]-p0[0])*a), y=Y(p0[1]+(p1[1]-p0[1])*a), hp=p0[2], dead=hp<=0&&simT>=T-.01;
      cx.beginPath(); cx.arc(x,y,7,0,7); cx.fillStyle=dead?'#6b6e63':col(k); cx.fill(); cx.lineWidth=2; cx.strokeStyle='#0b0c0a'; cx.stroke();
      if(p0[3]===2){ cx.fillStyle='#7dff9a'; cx.font='700 12px system-ui,sans-serif'; cx.textAlign='center'; cx.fillText('+',x,y-11); }
      else if(p0[3]===1&&!dead){ cx.fillStyle='#fff'; cx.font='700 11px system-ui,sans-serif'; cx.textAlign='center'; cx.fillText('!',x,y+4); }
      cx.font='700 11px system-ui,sans-serif'; cx.textAlign=x<W0*.15?'left':x>W0*.85?'right':'center'; cx.lineWidth=3; cx.strokeStyle='rgba(10,11,8,.85)'; const ly=y>18?y-12:y+20; cx.strokeText(nick(k),x,ly); cx.fillStyle=dead?'#9a9d90':col(k); cx.fillText(nick(k),x,ly);
      bars[k===me?0:1].style.width=Math.max(0,hp)+'%'; }
    ph.textContent=phase(simT);
    while(shown<lines.length&&lines[shown].t<=simT+.01){ const l=lines[shown++]; const li=document.createElement('li'); li.style.borderLeftColor=l.k<0?'#5d6648':col(l.k); li.innerHTML='<small>'+Math.round(l.t)+' s</small>'+esc(l.txt); ol.insertBefore(li,ol.firstChild); }
    if(simT>=T-.001){ if(!done){ done=true; result(G,el,mk,r,res,me); } return; }
    ANIM=requestAnimationFrame(frame); }
  el.querySelector('[data-x]').onclick=e=>{ sp=sp===1?3:1; e.target.textContent=sp===1?'×3':'×1'; };
  el.querySelector('[data-sk]').onclick=()=>{ simT=T; };
  ANIM=requestAnimationFrame(frame); }
function result(G,el,mk,r,res,me){ const end=res.log.find(l=>l.key==='end'), Sm=res.S[me], Sf=res.S[1-me], M=MAPS[mk];
  const wn=res.w<0?null:res.w===me?G.me.P:G.fr.P;
  const row=(n,a,b)=>'<tr><td>'+n+'</td><td>'+a+'</td><td>'+b+'</td></tr>';
  const pr=x=>x.stats.sh?PC(x.stats.hit/x.stats.sh*100):'—';
  const h='<div class="wn"><b>'+(wn?'🏆 '+L('Gana ','Winner: ')+esc(wn.nick):L('Empate','Draw'))+'</b><span>'+esc(end?end.txt:'')+'</span></div>'+
    '<table><thead><tr><th></th><th style="color:'+COL[0]+'">'+esc(G.me.P.nick)+'</th><th style="color:'+COL[1]+'">'+esc(G.fr.P.nick)+'</th></tr></thead><tbody>'+
    row(L('Arma','Weapon'),esc(G.me.P.wn),esc(G.fr.P.wn))+row(L('Alcance','Range'),esc(LL(CL[G.me.P.cls].band)),esc(LL(CL[G.fr.P.cls].band)))+
    row(L('Carga','Load'),nf(G.me.P.tot,1)+' kg · '+PC(G.me.P.pct),nf(G.fr.P.tot,1)+' kg · '+PC(G.fr.P.pct))+row(L('Velocidad','Speed'),nf(G.me.P.spd,1)+' m/s',nf(G.fr.P.spd,1)+' m/s')+
    row(L('Disparos / aciertos','Shots / hits'),Sm.stats.sh+' / '+Sm.stats.hit+' ('+pr(Sm)+')',Sf.stats.sh+' / '+Sf.stats.hit+' ('+pr(Sf)+')')+row(L('Vida final','Final HP'),Sm.hp,Sf.hp)+
    (Sm.stats.heal||Sf.stats.heal?row(L('Curado','Healed'),'+'+Sm.stats.heal,'+'+Sf.stats.heal):'')+'</tbody></table>';
  const url=linkFor(G,mk,r), txt=L('⚔️ Duelo 1 vs 1 en M.A.T ('+LL(M.n)+'): '+G.me.P.nick+' contra '+G.fr.P.nick+(wn?' — ganó '+wn.nick:' — empate')+'. Míralo y pide la revancha: ','⚔️ 1 vs 1 duel on M.A.T ('+LL(M.n)+'): '+G.me.P.nick+' vs '+G.fr.P.nick+(wn?' — '+wn.nick+' won':' — draw')+'. Watch it and ask for a rematch: ')+url;
  const box=el.querySelector('[data-end]'); box.innerHTML=h+'<div class="b"><a class="pri" href="https://wa.me/?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener">'+L('Compartir resultado','Share result')+'</a><button type="button" data-re>'+L('Revancha','Rematch')+'</button><button type="button" data-om>'+L('Otro mapa','Another map')+'</button><button type="button" data-rp>'+L('Ver otra vez','Watch again')+'</button></div><p class="n">'+L('La revancha cambia los pequeños detalles (cada disparo acierta o no); si un soldado es claramente mejor en ese mapa, vuelve a ganar. El código no se comprueba en ningún servidor: es un juego.','A rematch changes the small details (each shot hits or not); if one soldier is clearly better on that map, it wins again. The code is not checked on any server: it is a game.')+'</p>';
  box.querySelector('[data-re]').onclick=()=>fight(G,el,mk,r+1); box.querySelector('[data-om]').onclick=()=>picker(G,el,mk,1,false); box.querySelector('[data-rp]').onclick=()=>fight(G,el,mk,r); }
/* --- sección «1 vs 1 contra tu amigo» en Batallas --- */
export function hub(app){ css(); if(!app||document.getElementById('sdduhub')) return; const at=app.querySelector('.bt-hub'); if(!at) return; const el=document.createElement('section'); el.id='sdduhub'; el.className='sddu'; el.setAttribute('data-noi18n',''); el.style.marginTop='16px';
  let sel='pueblo'; const act=window.MAT_SDP&&MAT_SDP.active?MAT_SDP.active():null, myc=act&&act.code?act.code:'';
  el.innerHTML='<span class="k">⚔️ '+L('Nuevo · 1 vs 1','New · 1 vs 1')+'</span><h2>'+L('1 vs 1 contra tu amigo','1 vs 1 against your friend')+'</h2><p>'+L('Pega el código de soldado de tu amigo (SOL-…) o el enlace que te mandó, elige el mapa y mira quién gana. Cada uno lucha con su arma, su equipo y su peso.','Paste your friend\'s soldier code (SOL-…) or the link they sent you, pick the map and see who wins. Each fights with its own weapon, kit and weight.')+'</p>'+
   '<textarea aria-label="'+L('Código o enlace de tu amigo','Your friend\'s code or link')+'" placeholder="SOL-… / https://matmilitar.es/#/soldado?vs=SOL-…" spellcheck="false" autocomplete="off"></textarea><div class="er" hidden></div>'+
   '<div class="mp" style="margin-top:10px">'+ORDER.map(k=>'<button type="button" data-m="'+k+'"'+(k===sel?' class="on"':'')+'><span data-t></span><b>'+esc(LL(MAPS[k].n))+'</b><small>'+esc(LL(MAPS[k].b))+'</small></button>').join('')+'</div>'+
   '<div class="b"><button type="button" class="pri" data-go>⚔️ '+L('Luchar','Fight')+'</button>'+(myc?'<a href="https://wa.me/?text='+encodeURIComponent(L('Te reto a un duelo 1 vs 1 en M.A.T con mi soldado: ','I challenge you to a 1 vs 1 duel on M.A.T with my soldier: ')+location.origin+location.pathname+'#/soldado?vs='+myc)+'" target="_blank" rel="noopener">'+L('Retar con mi código','Challenge with my code')+'</a>':'<a href="#/soldado">'+(localStorage.getItem('mat_soldado')?L('Mi soldado y mi código','My soldier and my code'):L('Crea tu soldado','Create your soldier'))+'</a>')+'</div><p class="n">'+L('Sin explosivos ni granadas. Mismo tiempo de reacción para los dos; el empleo y las medallas no dan ventaja.','No explosives or grenades. Same reaction time for both; rank and medals give no edge.')+'</p>';
  at.parentNode.insertBefore(el,at.nextSibling);
  el.querySelectorAll('[data-m]').forEach(b=>{ b.querySelector('[data-t]').appendChild(thumb(b.dataset.m)); b.onclick=()=>{ sel=b.dataset.m; el.querySelectorAll('[data-m]').forEach(x=>x.classList.toggle('on',x===b)); }; });
  el.querySelector('[data-go]').onclick=()=>{ const raw=el.querySelector('textarea').value||'', er=el.querySelector('.er'); let c=''; const m=raw.match(/[?&]vs=([^&\s#]+)/i); if(m) c=decodeURIComponent(m[1]); else { const m2=raw.replace(/\s+/g,'').match(/SOL-?[0-9A-Za-z]{10,}/i); if(m2) c=m2[0]; }
    if(!c){ er.hidden=false; er.textContent=/MAT-/i.test(raw)?L('Ese es un código de medallas. Aquí va el código de soldado, que empieza por SOL-.','That is a medals code. This needs the soldier code, which starts with SOL-.'):L('Pega el código completo de tu amigo (empieza por SOL-) o su enlace.','Paste your friend\'s whole code (it starts with SOL-) or their link.'); return; }
    location.hash='#/soldado?vs='+encodeURIComponent(c.toUpperCase())+'&duelo='+sel; }; }
