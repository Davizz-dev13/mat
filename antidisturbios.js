/* M.A.T — «Antidisturbios»: simulador de gestión del orden público con la UIP de la Policía Nacional (#/antidisturbios).
   Calles reales de Madrid trazadas con datos de OpenStreetMap (© OpenStreetMap contributors, ODbL).
   Organización, vehículos, equipo y principios legales: fuentes citadas en el panel «Datos» y en #/license.
   El comportamiento de la multitud, las probabilidades de heridos y la puntuación son estimaciones de M.A.T (se marcan «Estimación»). */
const EN=()=>window.MAT_LANG==='en'; const L=(es,en)=>EN()?en:es;
const CELL=2, DUR=1800;
let APP=null, X=null, MAPS=null, CFG=null, G=null, RAF=0, CV=null, CTX=null, LAST=0;
function rng(seed){ let a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------------- mapas y escenarios (coordenadas en metros sobre el recorte OSM) ---------------- */
const MD={
 sol:{n:['Puerta del Sol','Puerta del Sol'],dest:[391,331,'la Puerta del Sol'],starts:[[744,208,'Calle de Alcalá'],[744,367,'Carrera de San Jerónimo']],A:[439,114,'Plaza del Carmen'],B:[411,606,'Plaza de Jacinto Benavente'],prot:null},
 granvia:{n:['Gran Vía – Callao','Gran Vía – Callao'],dest:[283,331,'la Plaza del Callao'],starts:[[842,374,'Gran Vía (Red de San Luis)'],[18,72,'Gran Vía (Plaza de España)']],A:[41,301,'Plaza de Santo Domingo'],B:[621,339,'Red de San Luis'],prot:null},
 congreso:{n:['Congreso – Neptuno','Congreso – Neptuno'],dest:[330,355,'la Plaza de las Cortes'],starts:[[10,253,'Carrera de San Jerónimo'],[449,10,'Calle de Alcalá']],A:[524,400,'Plaza de Neptuno'],B:[62,253,'Carrera de San Jerónimo'],prot:[305,291,'el Congreso de los Diputados']}
};
const ESC={pac:['Manifestación pacífica','Peaceful demonstration'],tensa:['Manifestación que puede torcerse','Demonstration that may turn violent'],rival:['Dos grupos radicales enfrentados','Two rival radical groups'],rnd:['Sorpresa (al azar)','Surprise (random)']};
const GCOL={pac:'#e9dcae',rad:'#ff8a3d',A:'#ff5a5a',B:'#c48bff'};
/* ---------------- datos reales (con fuente) ---------------- */
const SRC=[
 ['Wikipedia: Unidades de Intervención Policial','https://es.wikipedia.org/wiki/Unidades_de_Intervenci%C3%B3n_Policial'],
 ['BOE: Ley Orgánica 4/2015, de protección de la seguridad ciudadana (art. 23)','https://www.boe.es/buscar/act.php?id=BOE-A-2015-3442'],
 ['BOE: Ley Orgánica 2/1986, de Fuerzas y Cuerpos de Seguridad (art. 5)','https://www.boe.es/buscar/act.php?id=BOE-A-1986-6859'],
 ['BOE: Ley Orgánica 9/1983, reguladora del derecho de reunión (art. 5)','https://www.boe.es/buscar/act.php?id=BOE-A-1983-19946'],
 ['El Confidencial Digital (28-10-2024): «La Policía defiende los botes de humo…»','https://www.elconfidencialdigital.com/articulo/seguridad/policia-defiende-botes-humo-mientras-llega-prohibicion-pelotas-goma/20241028000000865674.html'],
 ['Infobae (04-10-2024): «Pelotas de goma: el “último recurso” de los antidisturbios»','https://www.infobae.com/espana/2024/10/04/pelotas-de-goma-el-ultimo-recurso-de-los-antidisturbios-sobre-el-que-interior-oculta-los-datos-oficiales/'],
 ['OpenStreetMap (calles y edificios de Madrid, ODbL)','https://www.openstreetmap.org/copyright']];
function datosHTML(){ const W='[1]',B4='[2]',B2='[3]',B9='[4]',ECD='[5]',INF='[6]';
 const S=EN()?[
  ['Organisation',['The UIP (Unidades de Intervención Policial) are the National Police’s mobile public-order units, created in 1989 (Royal Decree 1668/1989). '+W,'Each UIP has two or more operational groups (Madrid’s I UIP has 12). A group has about 50 officers, led by an inspector; it splits into 3 sub-groups of 15 officers under a sub-inspector; the basic unit is the team: one officer plus six police. '+W,'Total strength in October 2012: 2,744 officers. '+W+' In 2024 the press counted 52 UIP groups. '+ECD]],
  ['Real deployments in Madrid',['22 March 2014 («Marchas de la Dignidad»): an unprecedented deployment of 33 UIP groups, about 1,700 officers. The incidents ended with 29 arrests and 101 injured, 67 of them police. '+W,'So a big Madrid demonstration of 200 officers is about 4 groups (12 sub-groups). In this game you choose 1, 2, 4 or 6 groups.']],
  ['Vehicles',['Standard transport: the van (furgón), mostly the Mercedes-Benz Sprinter 315 CDI with light armour (windows included), carrying 8 officers with their gear; also VW Crafter and Ford Transit. '+W,'Other: armoured Nissan Patrol GR, Unimog UR-416 (practically retired), three BMR armoured vehicles bought in 2017 and 2022, and water-cannon trucks (URO, Pegaso, Unimog; a new Iveco Trakker in December 2014), rarely used. '+W]],
  ['Protective gear',['3K intervention helmet (Fedur), rectangular ERC-1 and round EC-1 riot shields, anti-trauma vest, elbow, forearm, knee and leg protection, cut-resistant gloves and semi-rigid or extendable batons (defensas). '+W]],
  ['Crowd-control tools',['Rubber balls, ATF smoke and ATL tear-gas rounds fired with a shotgun launcher, and CS tear-gas grenades. '+W,'The police defend smoke canisters against hostile crowds because «the risk of injuries is reduced». '+ECD,'The Ertzaintza and the Mossos d’Esquadra stopped using rubber balls and switched to foam rounds; the UIP sources consulted list rubber balls. '+INF]],
  ['Law and principles',['Interventions in demonstrations «will be gradual and proportionate to the circumstances»; dissolving them is «the last resort». Officers must warn those affected first (verbally if urgent), except when there is violence with weapons, explosives or blunt or dangerous objects. '+B4,'Police must act with «congruence, opportuneness and proportionality» in the means they use. '+B2,'A demonstration can be dissolved when it is unlawful, when public order is disturbed with danger to people or property, or when paramilitary uniforms are worn. '+B9,'UIP protocols: «minimum intervention of force, least harm» and «progressive use of force»: first identify the organisers and ask verbally, then minimum force, and only then rubber balls or tear gas. '+W]],
  ['What is an estimate («Estimación»)',['The crowd model (moods, how a march turns violent), the odds of injury in each action, the number of barrier sections (4 per group) and the score are M.A.T estimates for a game. They are not official figures. Each dot is about 10 people.']]
 ]:[
  ['Organización',['Las UIP (Unidades de Intervención Policial) son las unidades móviles de orden público de la Policía Nacional, creadas en 1989 (Real Decreto 1668/1989). '+W,'Cada UIP tiene dos o más grupos operativos (la I UIP de Madrid tiene 12). Un grupo son unos 50 agentes al mando de un inspector; se divide en 3 subgrupos de 15 agentes al mando de un subinspector; la unidad básica es el equipo: un oficial y seis policías. '+W,'Plantilla en octubre de 2012: 2.744 agentes. '+W+' En 2024 la prensa contaba 52 grupos de UIP. '+ECD]],
  ['Despliegues reales en Madrid',['22 de marzo de 2014 («Marchas de la Dignidad»): un dispositivo sin precedentes de 33 grupos de la UIP, unos 1.700 agentes. Los incidentes acabaron con 29 detenidos y 101 heridos, 67 de ellos policías. '+W,'Así que una manifestación grande en Madrid con 200 agentes son unos 4 grupos (12 subgrupos). En el juego eliges 1, 2, 4 o 6 grupos.']],
  ['Vehículos',['Transporte estándar: el furgón, sobre todo la Mercedes-Benz Sprinter 315 CDI con blindaje ligero (también las ventanas), para 8 agentes con su equipo; también Volkswagen Crafter y Ford Transit. '+W,'Otros: todoterrenos blindados Nissan Patrol GR, la tanqueta Unimog UR-416 (prácticamente dada de baja), tres BMR comprados en 2017 y 2022 y camiones lanzaagua (URO, Pegaso, Unimog; un Iveco Trakker nuevo en diciembre de 2014), raramente empleados. '+W]],
  ['Equipo de protección',['Casco de intervención 3K (Fedur), escudos antidisturbios rectangulares ERC-1 y redondos EC-1, chaleco anti-trauma, protecciones de codo, antebrazo, rodilla y pierna, guantes anticorte y defensas (porras) semirrígidas o extensibles. '+W]],
  ['Medios de control de masas',['Pelotas de caucho, artificios de humo ATF y lacrimógenos ATL lanzados con escopeta, y granadas lacrimógenas de gas CS. '+W,'La Policía defiende los botes de humo ante masas hostiles porque «se disminuye el riesgo de lesiones». '+ECD,'La Ertzaintza y los Mossos d’Esquadra dejaron las pelotas de goma por proyectiles de foam; en las fuentes consultadas la UIP usa pelotas de caucho. '+INF]],
  ['Ley y principios',['Las medidas en reuniones y manifestaciones «serán graduales y proporcionadas a las circunstancias»; la disolución es «el último recurso». Antes hay que avisar a los afectados (de palabra si hay urgencia), salvo que haya alteración con armas, artefactos explosivos u objetos contundentes o peligrosos. '+B4,'La policía debe actuar con «congruencia, oportunidad y proporcionalidad» en los medios que usa. '+B2,'Se puede disolver una manifestación si es ilícita, si hay alteraciones del orden público con peligro para personas o bienes, o si se usan uniformes paramilitares. '+B9,'Protocolos de la UIP: «intervención mínima de la fuerza y de menor lesividad» y «uso progresivo de la fuerza»: primero identificar a los promotores y pedir la disolución de palabra, luego fuerza mínima y solo después pelotas de caucho o gases lacrimógenos. '+W]],
  ['Qué es estimación («Estimación»)',['El modelo de la multitud (ánimo, cómo se tuerce una marcha), la probabilidad de heridos de cada acción, los tramos de valla (4 por grupo) y la puntuación son estimaciones de M.A.T para un juego. No son cifras oficiales. Cada punto son unas 10 personas.']]
 ];
 let h='<details class="ad-datos"><summary>'+L('Datos reales y fuentes','Real data and sources')+'</summary>';
 S.forEach(s=>{ h+='<h3>'+s[0]+'</h3>'+s[1].map(p=>'<p>'+esc(p).replace(/\[(\d)\]/g,(m,n)=>'<sup><a href="'+SRC[n-1][1]+'" target="_blank" rel="noopener">['+n+']</a></sup>')+'</p>').join(''); });
 h+='<h3>'+L('Fuentes','Sources')+'</h3><ol class="ad-src">'+SRC.map(s=>'<li><a href="'+s[1]+'" target="_blank" rel="noopener">'+esc(s[0])+'</a></li>').join('')+'</ol>';
 h+='<p class="ad-osm">'+L('Mapas: calles y edificios reales de Madrid de OpenStreetMap.','Maps: real Madrid streets and buildings from OpenStreetMap.')+' © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a> (ODbL).</p></details>';
 return h; }

/* ---------------- rejilla de calles ---------------- */
function buildGrid(M){ const gw=Math.ceil(M.w/CELL), gh=Math.ceil(M.h/CELL); const c=document.createElement('canvas'); c.width=gw; c.height=gh; const g=c.getContext('2d');
  g.fillStyle='#000'; g.strokeStyle='#000'; g.lineWidth=0.45;
  M.b.forEach(b=>{ g.beginPath(); for(let i=0;i<b.length;i+=2){ const x=b[i]/CELL,y=b[i+1]/CELL; if(i) g.lineTo(x,y); else g.moveTo(x,y); } g.closePath(); g.fill(); g.stroke(); });
  const d=g.getImageData(0,0,gw,gh).data; const bld=new Uint8Array(gw*gh); for(let i=0;i<gw*gh;i++) bld[i]=d[i*4+3]>110?1:0; return {gw,gh,bld}; }
function ci(x,y){ const gx=Math.floor(x/CELL), gy=Math.floor(y/CELL); if(gx<0||gy<0||gx>=G.gw||gy>=G.gh) return -1; return gy*G.gw+gx; }
function free(x,y){ const i=ci(x,y); return i>=0&&!G.blk[i]; }
function bfs(src,blk){ /* distancia «chaflán» 2-3 (casi euclídea) con cola por cubos; resultado en celdas */ const gw=G.gw,gh=G.gh,N=gw*gh; const D=new Float32Array(N).fill(1e9); const B=[[],[],[],[]]; let cur=0, left=0;
  for(const i of src){ if(i>=0&&!blk[i]&&D[i]>0){ D[i]=0; B[0].push(i); left++; } }
  const NB=[[-1,0,2],[1,0,2],[0,-1,2],[0,1,2],[-1,-1,3],[1,-1,3],[-1,1,3],[1,1,3]];
  while(left>0){ const q=B[cur%4]; if(!q.length){ cur++; continue; } const i=q.pop(); left--; if(D[i]!==cur) continue; const x=i%gw, y=(i-x)/gw;
    for(const n of NB){ const X=x+n[0], Y=y+n[1]; if(X<0||Y<0||X>=gw||Y>=gh) continue; const j=Y*gw+X; if(blk[j]) continue; if(n[2]===3&&(blk[y*gw+X]||blk[Y*gw+x])) continue; const d=cur+n[2]; if(d<D[j]){ D[j]=d; B[d%4].push(j); left++; } } }
  for(let i=0;i<N;i++) if(D[i]<1e9) D[i]*=0.5; return D; }
function snapPt(x,y,blk){ blk=blk||G.bld; const gx=Math.floor(x/CELL), gy=Math.floor(y/CELL);
  for(let r=0;r<60;r++) for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue; const X=gx+dx,Y=gy+dy; if(X<0||Y<0||X>=G.gw||Y>=G.gh) continue; if(!blk[Y*G.gw+X]) return [X*CELL+1,Y*CELL+1]; }
  return [x,y]; }
function cellsNear(x,y,rad){ const out=[]; const r=Math.ceil(rad/CELL), gx=Math.floor(x/CELL), gy=Math.floor(y/CELL); for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){ if(dx*dx+dy*dy>r*r) continue; const X=gx+dx,Y=gy+dy; if(X>=0&&Y>=0&&X<G.gw&&Y<G.gh) out.push(Y*G.gw+X); } return out; }
/* ancho libre de la calle en un punto: devuelve la línea que la cruza */
function across(x,y,maxL){ let best=null; for(let a=0;a<180;a+=10){ const r=a*Math.PI/180, c=Math.cos(r), s=Math.sin(r); let p=0,n=0;
    while(p<45&&free0(x+c*(p+1),y+s*(p+1))) p+=1; while(n<45&&free0(x-c*(n+1),y-s*(n+1))) n+=1;
    const w=p+n; if(!best||w<best.w) best={w,ang:r,mx:x+c*(p-n)/2,my:y+s*(p-n)/2}; }
  const len=Math.max(4,Math.min(best.w+1,maxL)); return {x:best.mx,y:best.my,ang:best.ang,len,w:best.w}; }
function free0(x,y){ const i=ci(x,y); return i>=0&&!G.bld[i]; }
function rastSeg(arr,x,y,ang,len,th){ const c=Math.cos(ang), s=Math.sin(ang); for(let u=-len/2;u<=len/2;u+=0.6) for(let v=-th/2;v<=th/2;v+=0.6){ const i=ci(x+c*u-s*v,y+s*u+c*v); if(i>=0) arr[i]=1; } }
function nearName(x,y){ let b=null,bd=1e9; G.M.l.forEach(l=>{ const d=Math.hypot(l[1]-x,l[2]-y); if(d<bd){bd=d;b=l[0];} }); return b?(bd<140?(L('cerca de ','near ')+b):''):''; }
/* ---------------- partida ---------------- */
function budgetFor(g){ return {sub:g*3,van:g*6,fen:g*4}; }
function newGame(cfg){ const M=MAPS[cfg.m], md=MD[cfg.m]; const R=rng(cfg.s);
  let e=cfg.e; if(e==='rnd'){ const r=R(); e=r<0.34?'pac':r<0.67?'tensa':'rival'; }
  const gr=buildGrid(M);
  G={cfg,esc:e,R,M,md,gw:gr.gw,gh:gr.gh,bld:gr.bld,pol:new Uint8Array(gr.gw*gr.gh),blk:null,t:0,phase:'plan',units:[],vans:[],fences:[],barr:[],groups:[],ag:[],smokes:[],fires:[],proj:[],log:[],inc:{},st:{civ:0,civPol:0,pol:0,det:0,detV:0,dmg:0,left:0,fightS:0},bud:budgetFor(cfg.g),sel:null,tool:'sub',spd:2,pause:false,dirty:true,fields:{},events:[],press:1,pend:null,lastAct:-1e9,violS:0,warnUsed:0,uid:0,cam:null,rel:0};
  G.blk=new Uint8Array(G.bld);
  /* quitar patios cerrados: celdas que no conectan con el destino */
  const dP=snapPt(md.dest[0],md.dest[1]); const D0=bfs([ci(dP[0],dP[1])],G.bld); for(let i=0;i<D0.length;i++) if(!G.bld[i]&&D0[i]>=1e9) G.bld[i]=1;
  G.blk=new Uint8Array(G.bld); G.dest=dP;
  /* grupos */
  const mk=(k,name,pt,persons,T,thr)=>{ const p=snapPt(pt[0],pt[1]); const g={k,name,T,base:T,thr,violent:false,state:'gather',st:p,n0:0,warned:-1e9,cx:p[0],cy:p[1],until:0,host:null,vt:0,ct:0,blockLog:0,lead:-1,gone:0,rioted:false,fieldT:-99}; g.id=G.groups.length; G.groups.push(g); spawn(g,p,Math.round(persons/10)); return g; };
  if(e==='rival'){ const a=mk('A',L('Grupo radical A','Radical group A'),md.A,220+R()*200,45,58); const b=mk('B',L('Grupo radical B','Radical group B'),md.B,180+R()*180,45,58); a.foe=b; b.foe=a; a.gatherT=60+R()*60; b.gatherT=90+R()*80; arm(a,0.35+R()*0.25,0.08+R()*0.12); arm(b,0.35+R()*0.25,0.08+R()*0.12); }
  else { const s=md.starts[R()<0.6?0:1]; G.startN=s[2]; const p=mk('pac',L('Manifestación','Demonstration'),s,3000+R()*3000,12,82); p.gatherT=80+R()*60;
    if(e==='tensa'){ const r=mk('rad',L('Bloque radical','Radical bloc'),[s[0]+(R()-.5)*10,s[1]+(R()-.5)*10],200+R()*250,38,55); r.host=p; r.gatherT=p.gatherT; arm(r,0.3+R()*0.3,0.1+R()*0.2); } }
  /* sucesos al azar (cada partida distinta) */
  const ev=e==='rival'?['contra','provocacion','bengalas','rumor','periodista','lluvia','herido']:e==='tensa'?['organizadores','provocacion','rumor','bengalas','periodista','lluvia','botella','herido','separa']:['organizadores','provocacion','rumor','periodista','lluvia','botella','herido','separa'];
  const n=3+Math.floor(R()*3); for(let i=0;i<n;i++){ const k=ev[Math.floor(R()*ev.length)]; G.events.push({t:240+R()*1100,k}); }
  if(e==='pac'&&R()<0.4) G.events.push({t:350+R()*450,k:'encapuchados'}); if(e==='tensa'&&R()<0.7) G.events.push({t:300+R()*500,k:'chispa'});
  G.events.sort((a,b)=>a.t-b.t);
  computeFields(); return G; }
function spawn(g,p,n){ const F=bfs([ci(p[0],p[1])],G.bld); const cells=[]; let rad=4; while(cells.length<n*0.9&&rad<60){ cells.length=0; for(let i=0;i<F.length;i++) if(F[i]<=rad) cells.push(i); rad+=2; }
  for(let k=0;k<n;k++){ const c=cells[Math.floor(G.R()*cells.length)]; const x=(c%G.gw)*CELL+G.R()*CELL, y=Math.floor(c/G.gw)*CELL+G.R()*CELL; G.ag.push({x,y,vx:0,vy:0,g:g.id,arm:0,cd:G.R()*20,fl:0,r:G.R(),on:1,hit:0}); }
  g.n0+=n; if(g.lead<0){ g.lead=G.ag.length-n+Math.floor(n/2); } }
function arm(g,fr,mol){ G.ag.forEach((a,i)=>{ if(a.g!==g.id||i===g.lead) return; const r=G.R(); if(r<mol) a.arm=2; else if(r<fr) a.arm=1; }); }
function obstacles(){ const P=G.pol; P.fill(0);
  G.units.forEach(u=>{ if(u.block) rastSeg(P,u.x,u.y,u.ang,u.len,1.6); });
  G.vans.forEach(v=>{ if(v.on) rastSeg(P,v.x,v.y,v.ang,5.9,2.4); });
  G.fences.forEach(f=>{ if(f.on) rastSeg(P,f.x,f.y,f.ang,f.len,1); });
  G.barr.forEach(b=>rastSeg(P,b.x,b.y,b.ang,b.len,1.4));
  for(let i=0;i<P.length;i++) G.blk[i]=G.bld[i]|P[i]; }
function exitsSrc(blk){ const s=[], gw=G.gw, gh=G.gh; for(let x=0;x<gw;x++){ s.push(x); s.push((gh-1)*gw+x); } for(let y=0;y<gh;y++){ s.push(y*gw); s.push(y*gw+gw-1); } return s.filter(i=>!blk[i]); }
function computeFields(){ obstacles(); G.fields.dest=bfs([ci(G.dest[0],G.dest[1])],G.blk); G.fields.exit=bfs(exitsSrc(G.blk),G.blk); G.fields.exit0=G.fields.exit0||bfs(exitsSrc(G.bld),G.bld); G.dirty=false;
  /* salidas visibles en el borde: tramos de borde libres */
  const ex=[]; const gw=G.gw, gh=G.gh; const run=(get,len,side)=>{ let st=-1; for(let k=0;k<=len;k++){ const i=k<len?get(k):-1; const ok=i>=0&&!G.bld[i]; if(ok&&st<0) st=k; if(!ok&&st>=0){ const m=Math.floor((st+k-1)/2); ex.push({side,k:m,len:k-st,i:get(m)}); st=-1; } } };
  run(x=>x,gw,'N'); run(x=>(gh-1)*gw+x,gw,'S'); run(y=>y*gw,gh,'W'); run(y=>y*gw+gw-1,gh,'E');
  G.exits=ex.filter(e=>e.len>=3).map(e=>({x:(e.i%gw)*CELL+1,y:Math.floor(e.i/gw)*CELL+1,side:e.side,open:G.fields.dest[e.i]<1e9})); }
function groupField(g){ if(G.t-g.fieldT<3&&g.field) return g.field; g.fieldT=G.t; let src=[];
  if(g.state==='seek'&&g.foe&&alive(g.foe)>0){ src=cellsNear(g.foe.cx,g.foe.cy,10); }
  else if(g.violent){ G.units.forEach(u=>{ src.push(...cellsNear(u.x,u.y,4)); }); G.vans.forEach(v=>{ if(v.on) src.push(...cellsNear(v.x,v.y,4)); }); if(G.md.prot) src.push(...cellsNear(G.md.prot[0],G.md.prot[1],22)); }
  const blk=g.state==='seek'?new Uint8Array(G.blk):new Uint8Array(G.bld); G.barr.forEach(b=>rastSeg(blk,b.x,b.y,b.ang,b.len,1.4)); G.vans.forEach(v=>{ if(v.on) rastSeg(blk,v.x,v.y,v.ang,5.9,2.4); }); G.fences.forEach(f=>{ if(f.on) rastSeg(blk,f.x,f.y,f.ang,f.len,1); });
  src=src.filter(i=>!blk[i]); g.field=src.length?bfs(src,blk):null; return g.field; }
function alive(g){ let n=0; G.ag.forEach(a=>{ if(a.on&&a.g===g.id) n++; }); return n; }

/* ---------------- simulación ---------------- */
function lg(txt,c){ const l0=G.log[0]; if(l0&&l0.base===txt&&G.t-l0.t<120){ l0.n=(l0.n||1)+1; l0.txt=txt+' (×'+l0.n+')'; l0.t=G.t; return; } G.log.unshift({t:G.t,txt,base:txt,c:c||''}); if(G.log.length>80) G.log.pop(); }
function inc(k,n){ G.inc[k]=(G.inc[k]||0)+(n||1); }
function clock(t){ const b=G.cfg.h==='noche'?21*60+30:18*60; const m=b+Math.floor(t/60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); }
function gName(g){ return g.name; }
let HEAD=null, NEXT=null;
function hash(){ const N=G.gw*G.gh; if(!HEAD||HEAD.length!==N) HEAD=new Int32Array(N); HEAD.fill(-1); if(!NEXT||NEXT.length<G.ag.length) NEXT=new Int32Array(G.ag.length+64);
  G.ag.forEach((a,i)=>{ if(!a.on) return; const c=ci(a.x,a.y); if(c<0) return; NEXT[i]=HEAD[c]; HEAD[c]=i; }); }
function eachNear(x,y,r,fn){ const R=Math.ceil(r/CELL), gx=Math.floor(x/CELL), gy=Math.floor(y/CELL); for(let dy=-R;dy<=R;dy++) for(let dx=-R;dx<=R;dx++){ const X=gx+dx,Y=gy+dy; if(X<0||Y<0||X>=G.gw||Y>=G.gh) continue; for(let j=HEAD[Y*G.gw+X];j>=0;j=NEXT[j]){ const a=G.ag[j]; const d=Math.hypot(a.x-x,a.y-y); if(d<=r) fn(a,j,d); } } }
function descend(F,x,y){ if(!F) return null; const i=ci(x,y); if(i<0) return null; const v=F[i]; if(v>=1e9) return null; const gw=G.gw;
  const f=j=>(j<0||j>=F.length||G.blk[j]||F[j]>=1e9)?v+1:F[j]; const x0=i%gw; let gx=(x0>0?f(i-1):v+1)-(x0<gw-1?f(i+1):v+1), gy=f(i-gw)-f(i+gw);
  let m=Math.hypot(gx,gy); if(m<0.2){ let bi=-1,bv=v; for(const j of [i-1,i+1,i-gw,i+gw,i-gw-1,i-gw+1,i+gw-1,i+gw+1]){ if(j<0||j>=F.length||G.blk[j]) continue; if(F[j]<bv){ bv=F[j]; bi=j; } } if(bi<0) return {at:true,v}; gx=(bi%gw)*CELL+1-x; gy=Math.floor(bi/gw)*CELL+1-y; m=Math.hypot(gx,gy)||1; }
  return {x:gx/m,y:gy/m,v}; }
function startField(g){ if(!g.sfield) g.sfield=bfs([ci(g.st[0],g.st[1])],G.bld); return g.sfield; }
function moveAgents(dt){ hash(); const R=G.R;
  for(let i=0;i<G.ag.length;i++){ const a=G.ag[i]; if(!a.on) continue; const g=G.groups[a.g]; let dir=null, sp=0.9, mill=false;
    const fleeing=a.fl>G.t, leaving=a.lv||g.state==='leave';
    if(fleeing||leaving){ dir=descend(G.fields.exit,a.x,a.y); sp=fleeing?2.3:1.1; if(!dir){ const e=nearestExit(a.x,a.y); dir=e?unit(e.x-a.x,e.y-a.y):null; } }
    else if((g.k==='A'||g.k==='B')&&g.state==='seek'){ dir=descend(groupField(g),a.x,a.y); sp=1.25; if(dir&&dir.v<3) mill=true; if(!dir&&g.foe) dir=unit(g.foe.cx-a.x,g.foe.cy-a.y); }
    else if(g.violent&&(g.k!=='pac'||a.arm)){ const F=groupField(g); dir=descend(F,a.x,a.y); sp=1.3; const stop=a.arm?7:11; if(dir&&dir.v<stop){ mill=true; dir=null; } if(!F) mill=true; }
    else if(g.state==='go'){ dir=descend(g.tf,a.x,a.y); sp=1.0; if(!dir||dir.at||dir.v<12) mill=true; }
    else if(g.state==='gather'){ dir=descend(startField(g),a.x,a.y); sp=0.7; if(!dir||dir.v<9) mill=true; }
    else if(g.state==='march'||g.state==='rally'){ dir=descend(G.fields.dest,a.x,a.y); sp=g.state==='march'?0.95:0.5; if(g.state==='march'&&dir&&g.mv!=null) sp*=Math.max(0.15,Math.min(1.5,1+(dir.v-g.mv)/30)); if(dir&&dir.at) mill=true; if(g.state==='rally'&&dir&&dir.v<(g.rr||16)) mill=true; if(!dir) dir=unit(G.dest[0]-a.x,G.dest[1]-a.y); }
    /* separación */
    let sx=0,sy=0,k=0; eachNear(a.x,a.y,3.3,(b,j,d)=>{ if(j===i||k>16) return; k++; const f=(3.3-d)/(d||0.1)*1.0; sx+=(a.x-b.x)*f; sy+=(a.y-b.y)*f; }); const sm=Math.hypot(sx,sy); if(sm>2){ sx*=2/sm; sy*=2/sm; }
    if(k>=6&&!fleeing&&!leaving&&(g.state==='rally'||g.state==='gather')&&dir&&dir.v<(g.rr||16)*2.2) mill=true;
    let dx=0,dy=0; if(mill){ dx=(R()-.5)*0.5; dy=(R()-.5)*0.5; } else if(dir&&!dir.at){ const s=sp*(0.8+a.r*0.4), th=(a.r-0.5)*0.9, c=Math.cos(th), n=Math.sin(th); dx=(dir.x*c-dir.y*n)*s; dy=(dir.x*n+dir.y*c)*s; }
    G.units.forEach(u=>{ if(u.block) return; const d=Math.hypot(a.x-u.x,a.y-u.y); if(d<4){ sx+=(a.x-u.x)/(d||1)*1.5; sy+=(a.y-u.y)/(d||1)*1.5; } });
    a.vx=a.vx*0.55+(dx+sx*0.9)*0.45; a.vy=a.vy*0.55+(dy+sy*0.9)*0.45;
    const nx=a.x+a.vx*dt, ny=a.y+a.vy*dt; const c=ci(nx,ny);
    if(c<0){ if(fleeing||leaving){ a.on=0; G.st.left++; } else { a.vx=a.vy=0; } continue; }
    if(!G.blk[c]){ a.x=nx; a.y=ny; } else if(free(nx,a.y)){ a.x=nx; a.vy*=0.3; } else if(free(a.x,ny)){ a.y=ny; a.vx*=0.3; } else { a.vx*=-0.2; a.vy*=-0.2; }
    if(G.blk[ci(a.x,a.y)]){ const p=snapPt(a.x,a.y,G.blk); a.x=p[0]; a.y=p[1]; } } }
function unit(dx,dy){ const d=Math.hypot(dx,dy)||1; return {x:dx/d,y:dy/d,v:999}; }
function nearestExit(x,y){ let b=null,bd=1e9; (G.exits||[]).forEach(e=>{ const d=Math.hypot(e.x-x,e.y-y); if(d<bd){bd=d;b=e;} }); return b; }
function dotsOf(u){ const out=[]; const n=Math.max(1,u.n-u.inj); if(u.block||u.st==='hold'){ const c=Math.cos(u.ang), s=Math.sin(u.ang); for(let k=0;k<n;k++){ const f=n>1?k/(n-1)-0.5:0; out.push([u.x+c*f*u.len,u.y+s*f*u.len]); } }
  else { const h=u.hd||0, c=Math.cos(h), s=Math.sin(h); for(let k=0;k<n;k++){ const row=Math.floor(k/3), col=k%3-1; out.push([u.x-c*row*1.3-s*col*1.2,u.y-s*row*1.3+c*col*1.2]); } } return out; }
function moveUnits(dt){ G.units.forEach(u=>{ if(u.st==='move'||u.st==='charge'||u.st==='detain'){
    let tx=u.tx, ty=u.ty; if(u.st==='detain'){ const a=G.ag[u.tgt]; if(!a||!a.on){ u.st='hold'; settle(u); return; } tx=a.x; ty=a.y; }
    const d=Math.hypot(tx-u.x,ty-u.y); const sp=u.st==='charge'?4.2:u.st==='detain'?2.6:(d>120?6:2.8);
    if(d<(u.st==='detain'?2.5:1.5)){ arrive(u); return; }
    let dir=null; if(u.st!=='charge'){ if(!u.field||u.fT!==Math.floor(G.t/4)||u.st==='detain'){ if(u.st==='detain'&&u.field&&G.t-u.fT0<3){} else { const blk=new Uint8Array(G.bld); G.barr.forEach(b=>rastSeg(blk,b.x,b.y,b.ang,b.len,1.4)); u.field=bfs([ci(tx,ty)],blk); u.fT=Math.floor(G.t/4); u.fT0=G.t; } } dir=descend(u.field,u.x,u.y); }
    if(!dir||dir.at) dir=unit(tx-u.x,ty-u.y);
    const nx=u.x+dir.x*sp*dt, ny=u.y+dir.y*sp*dt; u.hd=Math.atan2(dir.y,dir.x); if(free0(nx,ny)){ u.x=nx; u.y=ny; } else if(u.st==='charge'){ arrive(u); return; }
    if(u.st==='charge'){ u.ct=(u.ct||0)+dt; if(u.ct>9){ arrive(u); return; } chargeHit(u); } } }); }
function settle(u){ let a=across(u.x,u.y,15.5); if(a.w>16) a=sideSlot(a,G.units.filter(o=>o!==u&&o.block),15); u.x=a.x; u.y=a.y; u.ang=a.ang; u.len=a.len; u.block=true; u.st='hold'; G.dirty=true; }
function arrive(u){ if(u.st==='detain'){ const a=G.ag[u.tgt]; if(a&&a.on){ a.on=0; G.st.det++; const g=G.groups[a.g]; const viol=g.violent&&a.arm>0; if(viol){ G.st.detV++; g.T=Math.max(0,g.T-4); if(u.tgt===g.lead){ g.T=Math.max(0,g.T-14); lg(L('Detenido el cabecilla de ','Leader of ')+gName(g)+L(': el grupo pierde empuje',' arrested: the group loses momentum'),'good'); } else lg(u.nm+L(' detiene a un violento ',' arrests a violent person ')+(a.arm===2?L('con un cóctel molotov','with a Molotov cocktail'):a.arm===1?L('con una barra','with a bar'):L('que lanzaba objetos','who was throwing objects')),'good'); }
      else { inc('detArb'); g.T=Math.min(100,g.T+12); lg(u.nm+L(' detiene a un manifestante que no hacía nada violento: detención arbitraria',' arrests a protester who was doing nothing violent: an arbitrary arrest'),'bad'); }
      if(G.R()<(g.violent?0.25:0.05)){ u.inj++; G.st.pol++; } } }
  if(u.st==='move'&&u.then==='aside'){ u.st='aside'; u.block=false; G.dirty=true; return; }
  if(u.st==='move'&&(u.then==='smoke'||u.then==='charge'||u.then==='warn')){ const k=u.then; u.then=null; settle(u); order(u,k); return; }
  settle(u); if(u.then==='protect') lg(u.nm+L(' se interpone para proteger','takes position to protect'),''); u.then=null; }
function chargeHit(u){ const n=u.n-u.inj; eachNear(u.x,u.y,6,(a,j)=>{ if(a.hit===u.cid) return; a.hit=u.cid; const g=G.groups[a.g]; a.fl=G.t+40+G.R()*20;
    if(G.R()<0.03){ G.st.civ++; G.st.civPol++; }
    if(g.violent&&a.arm){ if(G.R()<0.05){ u.inj++; G.st.pol++; } if(G.R()<0.12&&n>4){ a.on=0; G.st.det++; G.st.detV++; } } }); }
function tick1(){ const R=G.R; hash();
  /* centros y tamaño */
  G.groups.forEach(g=>{ g.sx=0; g.sy=0; g.n=0; }); G.ag.forEach(a=>{ if(!a.on) return; const g=G.groups[a.g]; g.sx+=a.x; g.sy+=a.y; g.n++; });
  G.groups.forEach(g=>{ if(g.n){ g.cx=g.sx/g.n; g.cy=g.sy/g.n; } });
  const anyViol=G.groups.some(g=>g.violent&&g.n>0);
  G.groups.forEach(g=>{ if(!g.n){ if(!g.gone){ g.gone=1; } return; }
    const isRiv=g.k==='A'||g.k==='B';
    if(g.state==='gather'&&G.t>=g.gatherT){ g.state=isRiv?'seek':'march'; if(g.k==='pac') lg(L('La manifestación arranca desde ','The march sets off from ')+(G.startN||'')+L(' hacia ',' towards ')+G.md.dest[2],''); if(isRiv) lg(gName(g)+L(' sale a buscar al otro grupo',' sets off to look for the other group'),'bad'); }
    if(g.k==='pac'){ if(g.state==='march'&&Math.hypot(g.cx-G.dest[0],g.cy-G.dest[1])<45){ g.state='rally'; g.until=G.t+300+R()*240; lg(L('La manifestación llega a ','The demonstration reaches ')+G.md.dest[2]+L(' y se concentra',' and gathers'),''); }
      if(g.state==='rally'&&G.t>=g.until){ g.state='leave'; lg(L('Los organizadores dan por terminada la manifestación: la gente empieza a irse','The organisers end the demonstration: people start to leave'),g.violent?'':'good'); } }
    if(g.k==='rad'&&g.host){ const h=g.host; if(!g.violent){ g.state=h.state==='leave'&&G.t<(h.until||0)+60?'rally':h.state; if(g.state==='leave'&&!g.rioted&&g.T<g.thr) g.state='leave'; } else if(h.state==='leave'&&G.t>(h.until||0)+420){ g.violent=false; g.state='leave'; lg(gName(g)+L(' se disuelve por las calles laterales',' melts away into the side streets'),''); } }
    if(g.state==='go'&&G.t>g.until){ g.state='leave'; lg(gName(g)+L(' se va disolviendo',' gradually disperses'),''); }
    if(isRiv&&g.state!=='leave'&&(G.t>(g.leaveT||(g.leaveT=1100+R()*400))||g.n<0.3*g.n0)){ g.state='leave'; lg(gName(g)+L(' se retira',' withdraws'),''); }
    /* tensión */
    g.T+=(g.base-g.T)*0.006;
    let press=0; G.ag.forEach(a=>{ if(!a.on||a.g!==g.id) return; const c=ci(a.x,a.y); if(c<0) return; const gw=G.gw; if(G.pol[c-1]||G.pol[c+1]||G.pol[c-gw]||G.pol[c+gw]||G.pol[c-2]||G.pol[c+2]) press++; });
    if(press>6) g.T+=g.k==='pac'?0.035:0.1;
    { let sv=0,nv=0; G.ag.forEach(a=>{ if(a.on&&a.g===g.id){ const c=ci(a.x,a.y); if(c>=0&&G.fields.dest[c]<1e9){ sv+=G.fields.dest[c]; nv++; } } }); g.mv=nv?sv/nv:null; }
    g.rr=Math.max(10,Math.sqrt(g.n*10/1.6/Math.PI)/CELL); let inf=0; if(g.state==='march'){ G.ag.forEach(a=>{ if(a.on&&a.g===g.id&&!(a.fl>G.t)){ const c=ci(a.x,a.y); if(c>=0&&G.fields.dest[c]>=1e9) inf++; } }); }
    if(g.state==='march'&&inf>g.n*0.5){ g.T+=g.k==='pac'?0.12:0.2; if(G.t-g.blockLog>240){ g.blockLog=G.t; lg(gName(g)+L(' encuentra el paso cortado ',' finds its way blocked ')+nearName(g.cx,g.cy)+L(' y presiona el cordón',' and pushes against the cordon'),'bad'); if(g.k==='pac'&&!g.violent) radio('cortado',g.cx,g.cy,g); } }
    if(g.k==='pac'&&anyViol&&!g.violent){ G.groups.forEach(o=>{ if(o!==g&&o.violent&&o.n&&Math.hypot(o.cx-g.cx,o.cy-g.cy)<90){ g.T+=0.05; G.ag.forEach(a=>{ if(a.on&&a.g===g.id&&!a.lv&&R()<0.012) a.lv=1; }); } }); }
    if(isRiv&&g.state==='seek') g.T+=0.04; if(g.k==='rad'&&(g.state==='march'||g.state==='rally')) g.T+=0.012;
    g.T=Math.max(0,Math.min(100,g.T));
    if(!g.violent&&g.T>=g.thr&&g.state!=='leave'){ g.violent=true; g.rioted=true; g.vt=G.t;
      if(g.k==='pac'){ G.ag.forEach(a=>{ if(a.on&&a.g===g.id&&R()<0.07) a.arm=3; }); G.ag.forEach(a=>{ if(a.on&&a.g===g.id&&!a.arm&&R()<0.35) a.lv=1; }); lg(L('La manifestación se tuerce: un grupo empieza a lanzar objetos ','The demonstration turns: some start throwing objects ')+nearName(g.cx,g.cy),'bad'); radio('violento',g.cx,g.cy,g); }
      else lg(gName(g)+L(' pasa a la violencia ',' turns violent ')+nearName(g.cx,g.cy),'bad'); if(g.k!=='A'&&g.k!=='B') radio('violento',g.cx,g.cy,g); }
    if(g.violent&&g.T<35){ g.ct++; if(g.ct>45){ g.violent=false; g.ct=0; lg(gName(g)+L(' se calma',' calms down'),'good'); } } else g.ct=0; });
  /* violencia: lanzamientos, cuerpo a cuerpo, destrozos, barricadas */
  G.ag.forEach((a,i)=>{ if(!a.on||!a.arm) return; const g=G.groups[a.g]; if(!g.violent||a.fl>G.t||a.cd>G.t) return; const isRiv=g.k==='A'||g.k==='B';
    let tg=null,td=1e9; const rng_=a.arm===2?18:24;
    if(!isRiv||g.T>65){ G.units.forEach(u=>{ const d=Math.hypot(u.x-a.x,u.y-a.y); if(d<td){td=d;tg={u,x:u.x,y:u.y};} }); G.vans.forEach(v=>{ if(!v.on) return; const d=Math.hypot(v.x-a.x,v.y-a.y); if(d<td){td=d;tg={v,x:v.x,y:v.y};} }); }
    if(isRiv&&g.foe&&g.foe.n){ eachNear(a.x,a.y,16,(b,j,d)=>{ if(b.g===g.foe.id&&d<td){ td=d; tg={b,x:b.x,y:b.y}; } }); }
    if(tg&&td<=rng_){ if(tg.u&&td<3&&a.arm===1){ if(R()<0.03){ tg.u.inj++; G.st.pol++; } if(R()<0.03){ G.st.civ++; G.st.civPol++; } a.cd=G.t+4; return; }
      G.proj.push({x0:a.x,y0:a.y,x1:tg.x+(R()-.5)*4,y1:tg.y+(R()-.5)*4,t0:G.t,d:1.2,k:a.arm,tg}); if(a.arm===2){ a.mol=(a.mol==null?1+Math.floor(R()*2):a.mol)-1; if(a.mol<=0) a.arm=3; } a.cd=G.t+(a.arm===2?30:10)+R()*15; return; }
    if(!isRiv&&(!tg||td>40)&&R()<0.012&&G.t-(g.dmT||0)>45){ const c=ci(a.x,a.y); const gw=G.gw; if(G.bld[c-2]||G.bld[c+2]||G.bld[c-2*gw]||G.bld[c+2*gw]){ g.dmT=G.t; G.st.dmg++; G.fires.push({x:a.x,y:a.y,t0:G.t,d:30}); lg(R()<0.5?L('Queman un contenedor ','A rubbish container is set on fire ')+nearName(a.x,a.y):L('Rompen un escaparate ','A shop window is smashed ')+nearName(a.x,a.y),'bad'); a.cd=G.t+60; } } });
  G.groups.forEach(g=>{ if(!g.violent||!g.n||g.k==='A'||g.k==='B') return; if(G.t-(g.bt||g.vt)>75&&G.barr.length<6){ const c=across(g.cx+(R()-.5)*12,g.cy+(R()-.5)*12,9); if(free0(c.x,c.y)){ g.bt=G.t; G.barr.push({x:c.x,y:c.y,ang:c.ang,len:c.len}); G.st.dmg++; G.dirty=true; lg(gName(g)+L(' levanta una barricada con contenedores ',' builds a barricade of rubbish containers ')+nearName(c.x,c.y),'bad'); radio('barricada',c.x,c.y,g); } } });
  { const A=G.groups.find(g=>g.k==='A'), B=G.groups.find(g=>g.k==='B'); if(A&&B&&A.n&&B.n&&!G.apr&&A.state==='seek'&&Math.hypot(A.cx-B.cx,A.cy-B.cy)<150){ G.apr=1; radio('acercan',(A.cx+B.cx)/2,(A.cy+B.cy)/2); } }
  radioPump();
  /* peleas entre grupos rivales */
  let fight=false; G.fc=0; G.ag.forEach(a=>{ if(!a.on) return; const g=G.groups[a.g]; if(g.k!=='A'||!g.foe) return; eachNear(a.x,a.y,2.2,(b)=>{ if(b.g===g.foe.id){ fight=true; G.fc=(G.fc||0)+1; } }); });
  if(fight){ if(R()<Math.min(0.15,G.fc*0.002)) G.st.civ++; G.st.fightS++; G.groups.forEach(g=>{ if((g.k==='A'||g.k==='B')&&g.state==='seek'){ g.fs=(g.fs||0)+1; if(g.fs>100+R()*60){ g.state='leave'; lg(gName(g)+L(' se dispersa tras la pelea',' scatters after the brawl'),''); } } }); G.groups.forEach(g=>{ if(g.k==='A'||g.k==='B') g.T=Math.min(100,g.T+0.6); }); if(!G.fightLog||G.t-G.fightLog>90){ G.fightLog=G.t; lg(L('¡Los dos grupos llegan a las manos ','The two groups come to blows ')+nearName(G.groups[0].cx,G.groups[0].cy)+'!','bad'); } }
  /* avalancha: gente que huye sin salida */
  G.groups.forEach(g=>{ let trap=0; G.ag.forEach(a=>{ if(a.on&&a.g===g.id&&(a.fl>G.t||a.lv||g.state==='leave')){ const c=ci(a.x,a.y); if(c>=0&&G.fields.exit[c]>=1e9) trap++; } });
    if(trap>25&&(G.ag.some(a=>a.on&&a.g===g.id&&a.fl>G.t))){ if(R()<0.35){ G.st.civ++; G.st.civPol++; } if(!g.crushT||G.t-g.crushT>90){ g.crushT=G.t; inc('sinSalida'); lg(L('Avalancha: la gente que huye no tiene salida ','Crush: people running away have no way out ')+nearName(g.cx,g.cy),'bad'); } } });
  /* pasividad */
  if(anyViol){ G.violS++; if(G.t-G.lastAct>240&&G.violS>240&&(!G.pasT||G.t-G.pasT>300)){ G.pasT=G.t; inc('pasividad'); lg(L('Llevas cuatro minutos sin responder a la violencia: la prensa habla de pasividad','Four minutes without responding to the violence: the press talks of passivity'),'bad'); } }
  G.units.forEach(u=>{ if(u.inj>=7&&!u.out){ u.out=1; u.st='move'; u.then='aside'; const p=snapPt(u.home[0],u.home[1]); u.tx=p[0]; u.ty=p[1]; u.block=false; G.dirty=true; lg(u.nm+L(' tiene demasiados heridos y se repliega',' has too many injured and falls back'),'bad'); } });
  G.smokes=G.smokes.filter(s=>G.t-s.t0<s.d); G.fires=G.fires.filter(f=>G.t-f.t0<f.d);
  G.smokes.forEach(s=>{ const r=Math.min(18,4+(G.t-s.t0)*1.4); eachNear(s.x,s.y,r,(a)=>{ if(a.fl<G.t+5) a.fl=G.t+25+R()*15; }); });
  const tot=G.ag.filter(a=>a.on).length; const allLeave=G.groups.every(g=>!g.n||g.state==='leave'); if(allLeave&&!G.allLv) G.allLv=G.t; if(!allLeave) G.allLv=0; if(G.t>=DUR||(G.t>200&&tot<G.ag.length*0.04)||(G.allLv&&G.t-G.allLv>300)) end(); }
function projectiles(){ G.proj=G.proj.filter(p=>{ if(G.t-p.t0<p.d) return true; const R=G.R;
    if(p.k===2) G.fires.push({x:p.x1,y:p.y1,t0:G.t,d:14});
    if(p.tg.u){ if(R()<(p.k===2?0.05:0.014)){ p.tg.u.inj++; G.st.pol++; if(p.k===2){ lg(L('Un cóctel molotov alcanza a ','A Molotov cocktail hits ')+p.tg.u.nm+L(': un agente herido',': one officer injured'),'bad'); radio('molotov',p.tg.u.x,p.tg.u.y); } } }
    else if(p.tg.v){ if(p.k===2&&R()<0.3&&!p.tg.v.burn){ p.tg.v.burn=1; G.st.dmg+=2; lg(L('Arde un furgón policial ','A police van is on fire ')+nearName(p.tg.v.x,p.tg.v.y),'bad'); } }
    else if(p.tg.b){ if(R()<0.02){ G.st.civ++; } }
    return false; }); }
function end(){ if(G.phase!=='live') return; G.phase='result'; render(); }
/* ---------------- órdenes ---------------- */
function nearestCrowd(u,maxD,pred){ let b=null,bd=maxD; G.ag.forEach((a,i)=>{ if(!a.on) return; if(pred&&!pred(a)) return; const d=Math.hypot(a.x-u.x,a.y-u.y); if(d<bd){bd=d;b=a;} }); return b; }
function groupsNear(x,y,r,min){ const c={}; G.ag.forEach(a=>{ if(a.on&&Math.hypot(a.x-x,a.y-y)<r) c[a.g]=(c[a.g]||0)+1; }); return Object.keys(c).filter(k=>c[k]>=(min||1)).map(i=>G.groups[i]); }
function forceCheck(u,gs,what){ /* proporcionalidad y aviso previo (LO 4/2015 art. 23) */
  gs.forEach(g=>{ const armedViol=g.violent; if(!armedViol){ inc(what==='carga'?'cargaPac':'humoPac'); g.T=Math.min(100,g.T+(what==='carga'?30:7)); lg((what==='carga'?L('Carga contra ','Charge against '):L('Humo contra ','Smoke against '))+gName(g)+L(', que no estaba siendo violenta: desproporcionado',', which was not violent: disproportionate'),'bad'); if(G.t-g.warned>600){ inc('sinAviso'); lg(L('Además, sin aviso previo por megafonía (la ley lo exige si no hay armas ni objetos peligrosos)','And with no prior warning by megaphone (the law requires it when there are no weapons or dangerous objects)'),'bad'); } }
    else { g.T=Math.max(0,g.T-(what==='carga'?22:10)); if(G.t-g.warned<=600) inc('avisoOK'); lg(u.nm+(what==='carga'?L(' carga contra los violentos de ',' charges the violent members of '):L(' lanza humo contra ',' fires smoke at '))+gName(g),'good'); } }); }
function order(u,k){ const R=G.R; G.sel=u;
  if(k==='hold'){ u.st='hold'; settle(u); lg(u.nm+L(' mantiene la línea',' holds the line')); }
  else if(k==='adv'){ G.pend={u,k:'adv'}; }
  else if(k==='warn'){ const gs=groupsNear(u.x,u.y,150); gs.forEach(g=>{ g.warned=G.t; g.T=Math.max(0,g.T-(g.violent?2:g.k==='pac'?8:3)); }); G.warnUsed++; lg(u.nm+L(' avisa por megafonía: «Policía. Despejen la vía; de lo contrario se procederá a la disolución»',' warns by megaphone: “Police. Clear the street, or the crowd will be dispersed”'),gs.length?'good':''); if(!gs.length) lg(L('No había nadie a menos de 150 m para oírlo','Nobody within 150 m heard it')); }
  else if(k==='smoke'){ const a=nearestCrowd(u,45); if(!a){ lg(L('No hay nadie a menos de 45 m','Nobody within 45 m')); return; } const gs=groupsNear(a.x,a.y,22,6); G.proj.push({x0:u.x,y0:u.y,x1:a.x,y1:a.y,t0:G.t,d:1,k:9,tg:{}}); G.smokes.push({x:a.x,y:a.y,t0:G.t+1,d:70}); G.lastAct=G.t; forceCheck(u,gs,'humo'); }
  else if(k==='charge'){ const a=nearestCrowd(u,60); if(!a){ lg(L('No hay nadie a menos de 60 m para cargar','Nobody within 60 m to charge')); return; } const gs=groupsNear(a.x,a.y,20,6); const d=Math.hypot(a.x-u.x,a.y-u.y)||1; const f=Math.min(1,(d+12)/d); u.tx=u.x+(a.x-u.x)*f; u.ty=u.y+(a.y-u.y)*f; u.st='charge'; u.ct=0; u.cid=++G.uid; u.block=false; G.dirty=true; G.lastAct=G.t; forceCheck(u,gs,'carga'); }
  else if(k==='open'){ let n=0; G.fences.forEach(f=>{ if(f.on&&Math.hypot(f.x-u.x,f.y-u.y)<30){ f.on=0; n++; } }); G.vans.forEach(v=>{ if(v.on&&Math.hypot(v.x-u.x,v.y-u.y)<30){ v.on=0; n++; } }); u.st='aside'; u.block=false; G.dirty=true; lg(u.nm+L(' abre una vía de salida ',' opens an exit route ')+nearName(u.x,u.y)+(n?L(' (retira '+n+' vallas/furgones)',' (removes '+n+' barriers/vans)'):''),'good'); inc('abre'); }
  else if(k==='prot'){ let p=null; const A=G.groups.find(g=>g.k==='A'), B=G.groups.find(g=>g.k==='B');
    if(A&&B&&A.n&&B.n) p=[(A.cx+B.cx)/2,(A.cy+B.cy)/2]; else { const v=G.groups.find(g=>g.violent&&g.n), pc=G.groups.find(g=>g.k==='pac'&&g.n); if(v&&pc) p=[(v.cx+pc.cx)/2,(v.cy+pc.cy)/2]; else if(G.md.prot) p=[G.md.prot[0],G.md.prot[1]+40]; else if(pc) p=[pc.cx,pc.cy]; }
    if(!p){ lg(L('No hay a quién proteger ahora','Nobody to protect right now')); return; } p=snapPt(p[0],p[1]); u.tx=p[0]; u.ty=p[1]; u.st='move'; u.then='protect'; u.block=false; u.field=null; G.dirty=true; G.lastAct=G.t; lg(u.nm+L(' va a interponerse ',' moves to stand in between ')+nearName(p[0],p[1])); }
  else if(k==='det'){ const rng_=G.cfg.h==='noche'?45:70; let a=nearestCrowd(u,rng_,b=>b.arm&&G.groups[b.g].violent); let arb=false; if(!a){ a=nearestCrowd(u,40); arb=true; } if(!a){ lg(L('No hay nadie cerca','Nobody nearby')); return; } u.tgt=G.ag.indexOf(a); u.st='detain'; u.block=false; u.field=null; G.dirty=true; G.lastAct=G.t; lg(u.nm+(arb?L(' entra a detener, aunque nadie está cometiendo delitos aquí',' goes in to arrest, though nobody here is committing an offence'):L(' entra a detener a un violento identificado',' goes in to arrest an identified violent person')),arb?'bad':''); }
  else if(k==='back'){ const a=nearestCrowd(u,200); let p=u.home; if(a){ const d=Math.hypot(u.x-a.x,u.y-a.y)||1; p=[u.x+(u.x-a.x)/d*40,u.y+(u.y-a.y)/d*40]; } p=snapPt(p[0],p[1]); u.tx=p[0]; u.ty=p[1]; u.st='move'; u.then='aside'; u.block=false; u.field=null; G.dirty=true; lg(u.nm+L(' se retira y deja espacio',' withdraws and gives space')); }
  render(); }

/* ---------------- sucesos ---------------- */
function doEvent(k){ const R=G.R; const pac=G.groups.find(g=>g.k==='pac'), rad=G.groups.find(g=>g.k==='rad'), A=G.groups.find(g=>g.k==='A'), B=G.groups.find(g=>g.k==='B');
  const add=(g,v)=>{ if(g&&g.n) g.T=Math.max(0,Math.min(100,g.T+v)); };
  if(k==='organizadores'&&pac&&pac.n){ add(pac,-10); add(rad,-3); lg(L('Los organizadores piden calma por megafonía','The organisers call for calm over the PA'),'good'); }
  else if(k==='provocacion'){ add(pac,7); add(rad,10); add(A,10); add(B,10); lg(L('Insultos y provocaciones desde una terraza: sube la tensión','Insults and provocation from a balcony: tension rises'),'bad'); }
  else if(k==='rumor'){ add(pac,10); add(rad,14); add(A,8); add(B,8); lg(L('Corre por las redes el rumor (falso) de un herido grave: la gente se calienta','A (false) rumour of a badly injured person spreads online: people get angry'),'bad'); }
  else if(k==='chispa'){ add(rad,22); add(pac,6); lg(L('Un grupo de la cabecera rompe la marcha y se encara con la policía','Some at the front break away from the march and square up to the police'),'bad'); }
  else if(k==='bengalas'){ add(rad,8); add(A,8); add(B,8); lg(L('Encienden bengalas y petardos en la cabecera','Flares and firecrackers at the front'),'bad'); }
  else if(k==='lluvia'){ let n=0; G.ag.forEach(a=>{ if(a.on&&!a.arm&&R()<0.18){ a.lv=1; n++; } }); G.groups.forEach(g=>add(g,-5)); lg(L('Empieza a llover: parte de la gente se va a casa','It starts to rain: some people go home'),'good'); }
  else if(k==='botella'){ add(rad||pac,6); lg(L('Vuela una botella hacia el cordón policial','A bottle flies towards the police cordon'),'bad'); }
  else if(k==='periodista'){ G.press=1.35; lg(L('Varias televisiones graban en directo: cualquier exceso tendrá más eco','Several TV crews are filming live: any excess will get more coverage'),''); radio('prensa',G.dest[0],G.dest[1]); }
  else if(k==='herido'){ const gs=G.groups.filter(g=>g.n); if(!gs.length) return; const g=gs[Math.floor(R()*gs.length)]; G.st.civ++; lg(L('Una persona se desmaya y cae ','A person faints and falls ')+nearName(g.cx,g.cy),''); radio('herido',g.cx,g.cy,g); }
  else if(k==='separa'){ const g=rad&&rad.n?rad:pac; if(!g||!g.n||g.state==='leave') return; const ls=G.M.l.filter(l=>Math.hypot(l[1]-g.cx,l[2]-g.cy)>120&&Math.hypot(l[1]-g.cx,l[2]-g.cy)<320); if(!ls.length) return; const l=ls[Math.floor(R()*ls.length)]; let ng=g; if(g===pac){ ng={k:'pac',name:L('Grupo desgajado','Breakaway group'),T:pac.T+15,base:30,thr:75,violent:false,state:'go',st:[g.cx,g.cy],n0:0,warned:-1e9,cx:g.cx,cy:g.cy,until:0,host:null,vt:0,ct:0,blockLog:0,lead:-1,gone:0,fieldT:-99}; ng.id=G.groups.length; G.groups.push(ng); let m=0; G.ag.forEach((a,i)=>{ if(a.on&&a.g===pac.id&&R()<0.12){ a.g=ng.id; m++; if(ng.lead<0) ng.lead=i; } }); ng.n0=m; } else { ng.host=null; } ng.state='go'; ng.until=G.t+420; const p=snapPt(l[1],l[2]); ng.tf=bfs([ci(p[0],p[1])],G.bld); lg(gName(ng)+L(' se separa hacia ',' breaks away towards ')+l[0],'bad'); radio('separa',g.cx,g.cy,ng,l[0]); }
  else if(k==='contra'&&B&&B.n){ const p=snapPt(G.md.B[0],G.md.B[1]); spawn(B,p,4+Math.floor(R()*4)); arm(B,0.4,0.1); add(B,10); lg(L('Llegan refuerzos al ','Reinforcements join ')+gName(B),'bad'); }
  else if(k==='encapuchados'&&pac&&pac.n&&!rad){ const s=G.md.starts[R()<0.5?0:1]; const g={k:'rad',name:L('Encapuchados','Hooded group'),T:50,base:40,thr:55,violent:false,state:pac.state,st:snapPt(s[0],s[1]),n0:0,warned:-1e9,cx:0,cy:0,until:0,host:pac,vt:0,ct:0,blockLog:0,lead:-1,gone:0,fieldT:-99}; g.id=G.groups.length; G.groups.push(g); spawn(g,g.st,15+Math.floor(R()*12)); arm(g,0.5,0.2); lg(L('Un grupo de encapuchados se une a la manifestación por ','A group of hooded people joins the march from ')+s[2],'bad'); radio('encap',g.st[0],g.st[1],g); } }

/* ---------------- radio: el mando informa y tú decides ---------------- */
const RO={warn:['Avisar por megafonía','Warn by megaphone'],smoke:['Lanzar humo','Fire smoke'],charge:['Cargar','Charge'],open:['Abrir una salida','Open an exit'],hold:['Mantener la línea','Hold the line'],ref:['Enviar refuerzos','Send reinforcements'],prot:['Interponer una unidad','Put a unit in between'],det:['Detener a los violentos','Arrest the violent'],back:['Replegar la unidad','Pull the unit back'],wait:['Esperar y vigilar','Wait and watch'],samur:['Abrir paso al SAMUR','Clear a path for paramedics'],calm:['Ordenar máxima contención','Order maximum restraint']};
const RV={violento:{warn:1,det:1,smoke:0,charge:0,hold:0,wait:-1},barricada:{smoke:1,det:1,ref:1,charge:1,wait:-1},molotov:{det:1,smoke:1,back:0,wait:-1},cortado:{open:1,warn:1,hold:0,charge:-1,smoke:-1},acercan:{prot:1,ref:1,smoke:0,wait:-1},herido:{samur:1,wait:-1},separa:{ref:1,warn:1,hold:0,charge:-1},prensa:{calm:1,wait:0},encap:{warn:1,prot:1,det:-1,wait:0}};
const RQ_OPTS={violento:['warn','det','smoke','charge'],barricada:['smoke','charge','ref','wait'],molotov:['det','smoke','back'],cortado:['open','hold','warn','charge'],acercan:['prot','ref','smoke','wait'],herido:['samur','wait'],separa:['ref','warn','hold','charge'],prensa:['calm','wait'],encap:['warn','prot','det','wait']};
function radio(k,x,y,g,extra){ if(G.phase!=='live') return; G.rq=G.rq||[]; G.rk=G.rk||{}; if(G.rq.some(r=>r.k===k)||(G.rk[k]||0)>=2) return; G.rk[k]=(G.rk[k]||0)+1; const where=nearName(x,y); const gn=g?gName(g):'';
  const T={violento:[L(gn+' está lanzando objetos '+where+'. ¿Qué hacemos?',gn+' is throwing objects '+where+'. What do we do?'),'091'],
   barricada:[L('Un grupo está levantando una barricada con contenedores '+where+'. ¿Qué hacemos?','A group is building a barricade of rubbish containers '+where+'. What do we do?'),'JD'],
   molotov:[L('¡Nos tiran cócteles molotov '+where+'! Hay un agente herido. ¿Órdenes?','Molotov cocktails are being thrown at us '+where+'! One officer injured. Orders?'),'JD'],
   cortado:[L('La cabecera de la manifestación presiona el cordón '+where+'. Son pacíficos, pero se están calentando.','The front of the march is pushing against the cordon '+where+'. They are peaceful, but getting angry.'),'JD'],
   acercan:[L('Los dos grupos radicales están a menos de 150 metros '+where+'. Vienen a pegarse.','The two radical groups are less than 150 metres apart '+where+'. They want a fight.'),'091'],
   herido:[L('Hay una persona herida en el suelo '+where+'. El SAMUR no puede entrar.','A person is lying injured '+where+'. Paramedics cannot get in.'),'091'],
   separa:[L(gn+' se separa de la marcha y va hacia '+(extra||'')+'.',gn+' breaks away from the march and heads for '+(extra||'')+'.'),'091'],
   prensa:[L('Varias televisiones están emitiendo en directo desde primera línea.','Several TV channels are broadcasting live from the front line.'),'JD'],
   encap:[L('Un grupo de encapuchados se ha unido a la manifestación '+where+'.','A hooded group has joined the demonstration '+where+'.'),'091']}[k];
  if(!T) return; G.rq.push({k,x,y,g,txt:T[0],from:T[1]==='091'?L('Sala 091','091 Control room'):L('Jefe de dispositivo','Operation commander'),opts:RQ_OPTS[k],t:G.t}); }
function radioPump(){ if(G.radio||!G.rq||!G.rq.length||G.phase!=='live') return; if(G.t-(G.radT||-999)<25) return; G.radio=G.rq.shift(); G.radT=G.t; G.radio.t=G.t; render(); }
function nearestUnit(x,y,skip){ let b=null,bd=1e9; G.units.forEach(u=>{ if(u.out||(skip&&skip.indexOf(u)>=0)) return; const d=Math.hypot(u.x-x,u.y-y); if(d<bd){bd=d;b=u;} }); return b; }
function radioChoose(c){ const r=G.radio; if(!r) return; G.radio=null; const v=(RV[r.k]||{})[c]; G.rdec=G.rdec||[]; G.rdec.push({k:r.k,c,v:v==null?0:v,t:G.t,txt:r.txt});
  lg(L('Radio: «','Radio: “')+L(RO[c][0],RO[c][1])+L('»','”'),v>0?'good':v<0?'bad':'');
  const u=nearestUnit(r.x,r.y);
  if(c==='ref'){ const a=nearestUnit(r.x,r.y), b=nearestUnit(r.x,r.y,[a]), cc=nearestUnit(r.x,r.y,[a,b]); [b,cc].forEach(x=>{ if(!x) return; const p=snapPt(r.x+(G.R()-.5)*20,r.y+(G.R()-.5)*20); x.tx=p[0]; x.ty=p[1]; x.st='move'; x.then=null; x.block=false; x.field=null; }); G.dirty=true; G.lastAct=G.t; lg(L('Refuerzos en camino ','Reinforcements on the way ')+nearName(r.x,r.y)); }
  else if(c==='samur'){ inc('samur'); lg(L('Se abre un pasillo: el SAMUR atiende al herido','A path is cleared: paramedics treat the injured person'),'good'); }
  else if(c==='calm'){ G.press=Math.min(G.press,1.1); G.groups.forEach(g=>{ if(!g.violent) g.T=Math.max(0,g.T-3); }); lg(L('Orden a todas las unidades: máxima contención','Order to all units: maximum restraint'),'good'); }
  else if(c==='wait'){ if(v<0) lg(L('Nadie actúa: la situación sigue','Nobody acts: the situation continues'),'bad'); }
  else if(u){ const d=Math.hypot(u.x-r.x,u.y-r.y); if((c==='smoke'||c==='charge'||c==='warn')&&d>40){ const p=snapPt(r.x+(u.x-r.x)/d*30,r.y+(u.y-r.y)/d*30); u.tx=p[0]; u.ty=p[1]; u.st='move'; u.then=c; u.block=false; u.field=null; G.dirty=true; G.lastAct=G.t; lg(u.nm+L(' se acerca para actuar ',' moves in to act ')+nearName(r.x,r.y)); } else order(u,c); }
  render(); }
/* ---------------- resultado ---------------- */
function verdict(){ const s=G.st, I=k=>G.inc[k]||0, P=G.press; const pac=G.groups.find(g=>g.k==='pac'), riv=G.esc==='rival';
  let sc=100-1.1*s.civ-1.1*s.pol-2.2*s.dmg-12*P*I('cargaPac')-6*P*I('humoPac')-6*P*I('sinAviso')-6*P*I('detArb')-10*I('sinSalida')-10*I('pasividad')+Math.min(10,1.5*s.detV);
  const marchaOK=pac&&!pac.rioted&&!I('cargaPac')&&!I('humoPac'); if(marchaOK) sc+=5; if(riv&&s.fightS<15) sc+=8;
  if(G.early){ sc=Math.min(sc,Math.round(sc*G.early/(DUR*0.6))); }
  const RD=G.rdec||[], rg=RD.filter(d=>d.v>0).length, rb=RD.filter(d=>d.v<0).length; sc+=Math.min(10,2*rg)-3*rb;
  sc=Math.max(0,Math.min(100,Math.round(sc)));
  let pr=-15*I('cargaPac')-8*I('humoPac')-8*I('sinAviso')-6*I('detArb')-10*I('sinSalida')-10*I('pasividad')-0.4*s.civ-0.4*s.pol-1.5*s.dmg+(marchaOK?12:0)+Math.min(10,2*s.detV)+(riv&&s.fightS<15?10:0); pr*=P; pr=Math.max(-100,Math.min(100,Math.round(pr)));
  const den=3*I('cargaPac')+I('humoPac')+2*I('detArb')+2*I('sinSalida')+Math.floor(s.civPol/3);
  const ok=[],ko=[]; const place=G.md.n[0];
  if(G.warnUsed&&(I('avisoOK')||!(I('cargaPac')+I('humoPac')))) ok.push(L('Avisaste por megafonía antes de usar la fuerza, como exige la ley','You warned by megaphone before using force, as the law requires'));
  if(s.detV) ok.push(L(s.detV===1?'Detuviste a 1 violento identificado':'Detuviste a '+s.detV+' violentos identificados',s.detV===1?'You arrested 1 identified violent person':'You arrested '+s.detV+' identified violent people'));
  if(marchaOK) ok.push(L('La manifestación pacífica pudo ejercer su derecho sin cargas','The peaceful demonstration exercised its right without charges'));
  if(riv&&s.fightS<15) ok.push(L('Mantuviste separados a los dos grupos rivales','You kept the two rival groups apart'));
  if(!I('sinSalida')&&(I('abre')||G.exits.some(e=>e.open))) ok.push(L('Dejaste vías de salida abiertas para dispersar','You left exit routes open for dispersal'));
  if(G.groups.some(g=>g.rioted)&&!I('pasividad')&&s.dmg<6) ok.push(L('Respondiste rápido cuando empezó la violencia','You responded quickly when the violence started'));
  if(I('cargaPac')) ko.push(L('Cargaste '+I('cargaPac')+' vez/veces contra gente que no era violenta','You charged '+I('cargaPac')+' time(s) at people who were not violent'));
  if(I('humoPac')) ko.push(L('Usaste humo contra gente que no era violenta','You used smoke on people who were not violent'));
  if(I('sinAviso')) ko.push(L('Usaste la fuerza sin aviso previo','You used force with no prior warning'));
  if(I('detArb')) ko.push(L(I('detArb')+' detenciones arbitrarias','arbitrary arrests: '+I('detArb')));
  if(I('sinSalida')) ko.push(L('La gente que huía se encontró sin salida (avalancha)','People running away had no way out (crush)'));
  if(I('pasividad')) ko.push(L('Tardaste demasiado en responder a la violencia','You took too long to respond to the violence'));
  if(riv&&s.fightS>=15) ko.push(L('Los grupos rivales llegaron a pelearse ('+s.fightS+' s de enfrentamiento)','The rival groups fought ('+s.fightS+' s of clashes)'));
  if(s.dmg>=6) ko.push(L('Daños importantes en el mobiliario y los comercios','Heavy damage to street furniture and shops'));
  if(s.pol>=10) ko.push(L('Demasiados agentes heridos: faltó apoyo o distancia','Too many officers injured: not enough support or distance'));
  if(G.early) ko.push(L('Terminaste la partida antes de que la situación se resolviera','You ended the game before the situation was resolved'));
  if(rg) ok.push(L('Decisiones acertadas por radio: '+rg+' de '+RD.length,'Good radio decisions: '+rg+' of '+RD.length)); RD.filter(d=>d.v<0).slice(0,3).forEach(d=>ko.push(L('Radio: ante «'+d.txt+'» elegiste «'+RO[d.c][0]+'»','Radio: to “'+d.txt+'” you chose “'+RO[d.c][1]+'”')));
  const head=pr>=30?L('«Dispositivo ejemplar en '+place+': orden y derechos garantizados»','“Model operation in '+place+': order kept, rights protected”'):pr>=5?L('«Jornada sin grandes incidentes en '+place+'»','“A day without major incidents in '+place+'”'):pr>=-25?L('«Polémica por la actuación policial en '+place+'»','“Controversy over the police response in '+place+'”'):L('«Críticas generalizadas al dispositivo de '+place+'»','“Widespread criticism of the operation in '+place+'”');
  const gr=sc>=85?L('Excelente','Excellent'):sc>=70?L('Buena','Good'):sc>=50?L('Mejorable','Could be better'):L('Mala','Poor');
  return {sc,gr,pr,head,den,ok,ko,rg,rn:RD.length}; }

/* ---------------- dibujo ---------------- */
function layer(){ const M=G.M, k=2, night=G.cfg.h==='noche'; const c=document.createElement('canvas'); c.width=M.w*k; c.height=M.h*k; const g=c.getContext('2d'); g.scale(k,k);
  g.fillStyle=night?'#2a2e35':'#5d6166'; g.fillRect(0,0,M.w,M.h);
  g.fillStyle=night?'#363431':'#77736a'; M.q.forEach(p=>{ g.beginPath(); for(let i=0;i<p.length;i+=2){ if(i) g.lineTo(p[i],p[i+1]); else g.moveTo(p[i],p[i+1]); } g.closePath(); g.fill(); });
  g.fillStyle=night?'#121418':'#2b2f35'; g.strokeStyle=night?'#22262c':'#41464d'; g.lineWidth=0.5;
  M.b.forEach(b=>{ g.beginPath(); for(let i=0;i<b.length;i+=2){ if(i) g.lineTo(b[i],b[i+1]); else g.moveTo(b[i],b[i+1]); } g.closePath(); g.fill(); g.stroke(); });
  if(G.md.prot){ const P=G.md.prot; g.strokeStyle='#d6b25e'; g.lineWidth=1.5; M.b.forEach(b=>{ let ins=false; for(let i=0,j=b.length-2;i<b.length;j=i,i+=2){ if(((b[i+1]>P[1])!==(b[j+1]>P[1]))&&(P[0]<(b[j]-b[i])*(P[1]-b[i+1])/(b[j+1]-b[i+1])+b[i])) ins=!ins; } if(ins){ g.beginPath(); for(let i=0;i<b.length;i+=2){ if(i) g.lineTo(b[i],b[i+1]); else g.moveTo(b[i],b[i+1]); } g.closePath(); g.stroke(); g.fillStyle='rgba(214,178,94,.22)'; g.fill(); } }); }
  return c; }
function fit(){ const wrap=CV.parentNode; const cw=wrap.clientWidth; const chMax=Math.max(260,Math.min(window.innerHeight*0.62,720)); const s0=Math.min(cw/G.M.w,chMax/G.M.h); const ch=Math.round(G.M.h*s0);
  const dpr=Math.min(2,window.devicePixelRatio||1); CV.style.width=cw+'px'; CV.style.height=ch+'px'; CV.width=Math.round(cw*dpr); CV.height=Math.round(ch*dpr);
  const z=(G.cam&&G.cam.z)||1; G.cam={s0,z,s:s0*z,ox:(G.cam&&G.cam.ox)||0,oy:(G.cam&&G.cam.oy)||0,cw,ch,dpr}; clampCam(); }
function clampCam(){ const c=G.cam; c.s=c.s0*c.z; const mw=G.M.w*c.s, mh=G.M.h*c.s; c.ox=mw<=c.cw?(c.cw-mw)/2:Math.min(0,Math.max(c.cw-mw,c.ox)); c.oy=mh<=c.ch?(c.ch-mh)/2:Math.min(0,Math.max(c.ch-mh,c.oy)); }
function zoom(f,cx,cy){ const c=G.cam; cx=cx==null?c.cw/2:cx; cy=cy==null?c.ch/2:cy; const wx=(cx-c.ox)/c.s, wy=(cy-c.oy)/c.s; c.z=Math.max(1,Math.min(4,c.z*f)); c.s=c.s0*c.z; c.ox=cx-wx*c.s; c.oy=cy-wy*c.s; clampCam(); draw(); }
function draw(){ if(!CV||!G) return; const c=G.cam, g=CTX, M=G.M, night=G.cfg.h==='noche'; g.setTransform(c.dpr,0,0,c.dpr,0,0); g.fillStyle='#0b0c0d'; g.fillRect(0,0,c.cw,c.ch);
  g.setTransform(c.dpr*c.s,0,0,c.dpr*c.s,c.dpr*c.ox,c.dpr*c.oy); g.drawImage(G.layerC,0,0,M.w,M.h); const px=1/c.s;
  /* salidas y destino */
  (G.exits||[]).forEach(e=>{ g.fillStyle=e.open?'rgba(90,200,120,.85)':'rgba(230,80,70,.85)'; g.beginPath(); g.arc(e.x,e.y,Math.max(2,3.5*px),0,7); g.fill(); });
  if(G.esc!=='rival'){ const d=G.dest; g.strokeStyle='rgba(233,220,174,.7)'; g.lineWidth=Math.max(1,1.5*px); g.setLineDash([4*px,3*px]); g.beginPath(); g.arc(d[0],d[1],45,0,7); g.stroke(); g.setLineDash([]); }
  if(G.phase==='plan'&&G.route&&G.route.length>1){ g.strokeStyle=G.routeCut?'rgba(255,90,80,.9)':'rgba(255,230,140,.9)'; g.lineWidth=Math.max(1.5,2.5*px); g.setLineDash([6*px,5*px]); g.beginPath(); G.route.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.stroke(); g.setLineDash([]); }
  /* obstáculos */
  G.fences.forEach(f=>{ if(!f.on) return; const cc=Math.cos(f.ang), s=Math.sin(f.ang); g.strokeStyle='#f2c94c'; g.lineWidth=Math.max(1.2,2.2*px); g.setLineDash([2.2,1.4]); g.beginPath(); g.moveTo(f.x-cc*f.len/2,f.y-s*f.len/2); g.lineTo(f.x+cc*f.len/2,f.y+s*f.len/2); g.stroke(); g.setLineDash([]); });
  G.barr.forEach(b=>{ const cc=Math.cos(b.ang), s=Math.sin(b.ang); g.strokeStyle='#9c7a54'; g.lineWidth=Math.max(2,2.6*px); g.beginPath(); g.moveTo(b.x-cc*b.len/2,b.y-s*b.len/2); g.lineTo(b.x+cc*b.len/2,b.y+s*b.len/2); g.stroke(); });
  G.vans.forEach(v=>{ if(!v.on) return; g.save(); g.translate(v.x,v.y); g.rotate(v.ang); const L_=Math.max(5.9,9*px), W_=Math.max(2.4,4*px); g.fillStyle=v.burn?'#7a2d1a':'#1f4fa3'; g.fillRect(-L_/2,-W_/2,L_,W_); g.strokeStyle='#e8eef8'; g.lineWidth=Math.max(0.3,0.8*px); g.strokeRect(-L_/2,-W_/2,L_,W_); g.restore(); });
  /* fuego */
  const fl=(G.t*7)%1; G.fires.forEach(f=>{ const r=Math.max(2,3.2*px)*(0.8+0.3*Math.sin(G.t*9+f.x)); g.fillStyle='rgba(255,120,30,.9)'; g.beginPath(); g.arc(f.x,f.y,r,0,7); g.fill(); g.fillStyle='rgba(255,220,90,.9)'; g.beginPath(); g.arc(f.x,f.y,r*0.5,0,7); g.fill(); });
  /* multitud */
  const ra=Math.max(1.3,1.7*px);
  G.groups.forEach(gr=>{ g.fillStyle=GCOL[gr.k]; g.beginPath(); G.ag.forEach(a=>{ if(a.on&&a.g===gr.id){ g.moveTo(a.x+ra,a.y); g.arc(a.x,a.y,ra,0,6.3); } }); g.fill(); });
  g.fillStyle='#ff2b2b'; g.beginPath(); G.ag.forEach(a=>{ if(a.on&&a.arm&&G.groups[a.g].violent){ g.moveTo(a.x+ra*0.6,a.y); g.arc(a.x,a.y,ra*0.6,0,6.3); } }); g.fill();
  G.groups.forEach(gr=>{ const a=G.ag[gr.lead]; if(a&&a.on){ g.strokeStyle='#ffffff'; g.lineWidth=Math.max(0.4,1*px); g.beginPath(); g.arc(a.x,a.y,ra*2.2,0,7); g.stroke(); } });
  /* policía */
  const rp=Math.max(1.1,1.5*px);
  G.units.forEach(u=>{ const D=dotsOf(u); if(u.block){ const cc=Math.cos(u.ang), s=Math.sin(u.ang); g.strokeStyle='rgba(78,161,255,.55)'; g.lineWidth=Math.max(1.5,2.4*px); g.beginPath(); g.moveTo(u.x-cc*u.len/2,u.y-s*u.len/2); g.lineTo(u.x+cc*u.len/2,u.y+s*u.len/2); g.stroke(); }
    g.fillStyle=u.st==='charge'?'#9fd0ff':'#4ea1ff'; g.beginPath(); D.forEach(p=>{ g.moveTo(p[0]+rp,p[1]); g.arc(p[0],p[1],rp,0,6.3); }); g.fill();
    if(G.sel===u){ g.strokeStyle='#ffd84d'; g.lineWidth=Math.max(0.8,1.6*px); g.beginPath(); g.arc(u.x,u.y,Math.max(10,14*px),0,7); g.stroke(); }
    if(u.st==='move'||u.st==='detain'){ g.strokeStyle='rgba(255,216,77,.6)'; g.lineWidth=Math.max(0.6,1*px); g.setLineDash([3*px,3*px]); g.beginPath(); g.moveTo(u.x,u.y); const t=u.st==='detain'&&G.ag[u.tgt]?G.ag[u.tgt]:{x:u.tx,y:u.ty}; g.lineTo(t.x,t.y); g.stroke(); g.setLineDash([]); } });
  /* proyectiles */
  G.proj.forEach(p=>{ const f=Math.min(1,(G.t-p.t0)/p.d); const x=p.x0+(p.x1-p.x0)*f, y=p.y0+(p.y1-p.y0)*f-Math.sin(f*Math.PI)*6; g.fillStyle=p.k===2?'#ff9b2f':p.k===9?'#dddddd':'#bbbbbb'; g.beginPath(); g.arc(x,y,Math.max(0.8,1.6*px),0,7); g.fill(); });
  G.smokes.forEach(s=>{ const age=G.t-s.t0; if(age<0) return; const r=Math.min(18,4+age*1.4); const al=Math.max(0,0.6*(1-age/s.d)*(1-age/s.d)+0.08); g.fillStyle='rgba(225,228,232,'+al+')'; g.beginPath(); g.arc(s.x,s.y,r,0,7); g.fill(); g.beginPath(); g.arc(s.x+r*0.4,s.y-r*0.3,r*0.7,0,7); g.fill(); });
  if(G.radio){ const r=G.radio, pr=(performance.now()/600)%1; g.strokeStyle='rgba(255,216,77,'+(1-pr)+')'; g.lineWidth=Math.max(1,2*px); g.beginPath(); g.arc(r.x,r.y,8+pr*25,0,7); g.stroke(); }
  /* rótulos en pantalla */
  g.setTransform(c.dpr,0,0,c.dpr,0,0); const fs=c.cw<500?9.5:11; g.font='600 '+fs+'px -apple-system,Segoe UI,Roboto,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  const nl=c.z>1.4||c.cw>700?M.l.length:7;
  M.l.slice(0,nl).forEach(l=>{ const x=c.ox+l[1]*c.s, y=c.oy+l[2]*c.s; if(x<-40||y<-10||x>c.cw+40||y>c.ch+10) return; g.save(); g.translate(x,y); g.rotate(l[3]); g.fillStyle=night?'rgba(200,205,215,.55)':'rgba(235,235,230,.6)'; g.fillText(l[0].replace(/^Calle (de la |del |de los |de las |de )?/,'').replace(/^Plaza (de la |del |de )?/,'Pl. '),0,0); g.restore(); });
  g.font='700 '+(fs+0.5)+'px -apple-system,Segoe UI,Roboto,sans-serif';
  G.units.forEach(u=>{ const x=c.ox+u.x*c.s, y=c.oy+u.y*c.s-Math.max(9,8*c.s); g.fillStyle='rgba(11,12,13,.65)'; const w=g.measureText(u.nm).width+6; g.fillRect(x-w/2,y-7,w,14); g.fillStyle=G.sel===u?'#ffd84d':'#9cc8ff'; g.fillText(u.nm,x,y); });
  if(G.md.prot){ const x=c.ox+G.md.prot[0]*c.s, y=c.oy+G.md.prot[1]*c.s; g.fillStyle='#e9cf8a'; g.fillText(L('Congreso','Congress'),x,y); }
  g.textAlign='left'; g.font='10px -apple-system,Segoe UI,Roboto,sans-serif'; g.fillStyle='rgba(233,233,230,.75)'; g.fillText('© OpenStreetMap contributors',6,c.ch-8);
  const sb=100*c.s; g.fillStyle='rgba(233,233,230,.8)'; g.fillRect(c.cw-sb-10,c.ch-10,sb,2); g.textAlign='right'; g.fillText('100 m',c.cw-10,c.ch-18);
  if(G.phase==='live'||G.phase==='result'){ g.textAlign='left'; g.font='700 13px -apple-system,Segoe UI,Roboto,sans-serif'; g.fillStyle='rgba(11,12,13,.7)'; g.fillRect(6,6,58,20); g.fillStyle='#e9e9e6'; g.fillText(clock(G.t),12,17); }
  if(G.pend){ g.textAlign='center'; g.font='600 12px -apple-system,Segoe UI,Roboto,sans-serif'; const t=L('Toca el mapa: destino de ','Tap the map: destination for ')+G.pend.u.nm; const w=g.measureText(t).width+14; g.fillStyle='rgba(255,216,77,.92)'; g.fillRect(c.cw/2-w/2,c.ch-34,w,20); g.fillStyle='#111'; g.fillText(t,c.cw/2,c.ch-23); } }

/* ---------------- interfaz ---------------- */
const CSS='.ad h1{margin:6px 0 4px}.ad .sub{margin-top:0}.ad-set{display:grid;gap:12px;margin:12px 0}.ad-row{display:flex;flex-direction:column;gap:6px}.ad-lb{font-size:13px;color:var(--mu);letter-spacing:.04em;text-transform:uppercase}.ad-seg{display:flex;flex-wrap:wrap;gap:6px}.ad-seg button,.ad-btn{background:var(--s2);color:var(--tx);border:1px solid var(--line);border-radius:var(--r);padding:8px 11px;font:inherit;font-size:14px;cursor:pointer;min-height:40px}.ad-seg button.on{border-color:var(--ac2);background:#2b3122;color:#e9f0d0}.ad-btn.pri{background:var(--ac);border-color:var(--ac);color:#0b0c0d;font-weight:700}.ad-btn.warn{border-color:#a8483e;color:#ffb3aa}.ad-btn:disabled{opacity:.45;cursor:default}.ad-note{color:var(--mu);font-size:14px;margin:0}.ad-cv{position:relative;width:100%;margin:8px 0 0;touch-action:none;user-select:none;-webkit-user-select:none}.ad-cv canvas{display:block;border-radius:var(--r);border:1px solid var(--line)}.ad-zm{position:absolute;right:6px;top:6px;display:flex;flex-direction:column;gap:4px}.ad-zm button{width:34px;height:34px;border-radius:6px;border:1px solid var(--line);background:rgba(19,21,23,.85);color:var(--tx);font-size:18px;line-height:1;cursor:pointer}.ad-hud{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:var(--mu);margin:8px 0 2px}.ad-hud b{color:var(--tx)}.ad-grp{display:grid;gap:4px;margin:6px 0}.ad-g{display:grid;grid-template-columns:minmax(0,1fr) 90px;gap:8px;align-items:center;font-size:13px}.ad-g .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.ad-bar{height:8px;border-radius:4px;background:var(--s2);overflow:hidden}.ad-bar i{display:block;height:100%}.ad-ctl{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}.ad-chips{display:flex;flex-wrap:wrap;gap:5px;margin:6px 0}.ad-chips button{min-height:34px;padding:4px 8px;font-size:13px}.ad-chips button.sel{border-color:#ffd84d;color:#ffd84d}.ad-chips button.blk{box-shadow:inset 0 -3px 0 #4ea1ff}.ad-unit{background:var(--s1);border:1px solid var(--line);border-radius:var(--r);padding:8px;margin:6px 0}.ad-unit .t{font-size:14px;margin-bottom:6px}.ad-ord{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.ad-ord button{min-height:44px;padding:6px 4px;font-size:13px;line-height:1.2}.ad-log{list-style:none;padding:0;margin:8px 0;font-size:13px;max-height:190px;overflow:auto;border-top:1px solid var(--line)}.ad-log li{padding:4px 0;border-bottom:1px solid var(--line);color:var(--mu)}.ad-log li.bad{color:#ffb3aa}.ad-log li.good{color:#bfe3a5}.ad-log time{color:var(--dim);margin-right:6px;font-variant-numeric:tabular-nums}.ad-res{background:var(--s1);border:1px solid var(--line);border-radius:var(--r);padding:12px;margin:10px 0}.ad-sc{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}.ad-sc .n{font-size:40px;font-weight:800}.ad-sc .g{font-size:18px;color:var(--ac2)}.ad-press{font-family:Georgia,serif;font-size:17px;margin:8px 0}.ad-kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;font-size:14px;margin:8px 0}.ad-kv div{display:flex;justify-content:space-between;gap:8px;border-bottom:1px solid var(--line);padding:3px 0}.ad-res h3{font-size:15px;margin:12px 0 4px}.ad-res ul{margin:0;padding-left:18px;font-size:14px}.ad-ok li{color:#bfe3a5}.ad-ko li{color:#ffb3aa}.ad-datos{margin:16px 0;background:var(--s1);border:1px solid var(--line);border-radius:var(--r);padding:8px 12px}.ad-datos summary{cursor:pointer;font-weight:700;min-height:32px;display:flex;align-items:center}.ad-datos h3{font-size:15px;margin:14px 0 4px;color:var(--ac2)}.ad-datos p,.ad-datos li{font-size:14px;color:var(--mu);overflow-wrap:anywhere}.ad-datos sup a{color:var(--ac2);text-decoration:none}.ad-radio{background:#1d1a10;border:1px solid #d6b25e;border-radius:var(--r);padding:10px;margin:8px 0}.ad-radio .rh{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#d6b25e;font-weight:700}.ad-radio .rt{font-size:15px;margin:4px 0 8px}.ad-radio .ro{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-bottom:6px}.ad-radio .ro button{min-height:44px}.ad-intel{background:var(--s1);border-left:3px solid var(--ac);padding:8px 10px;font-size:14px;margin:8px 0;border-radius:4px}.ad-leg{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:var(--mu);margin:4px 0}.ad-leg span::before{content:"";display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px;vertical-align:-1px;background:var(--c)}';
const STN={go:['por su cuenta','on its own'],gather:['concentrándose','gathering'],march:['en marcha','marching'],rally:['concentrada','gathered'],leave:['dispersándose','dispersing'],seek:['buscando pelea','looking for a fight']};
const ORD=[['hold','Mantener línea','Hold the line'],['adv','Avanzar','Advance'],['warn','Avisar (megáfono)','Warn (megaphone)'],['smoke','Humo','Smoke'],['charge','Cargar','Charge'],['open','Abrir salida','Open an exit'],['prot','Proteger grupo','Protect a group'],['det','Detener violentos','Arrest the violent'],['back','Retirarse','Withdraw']];
function ustate(u){ return {hold:L('en línea','holding the line'),move:L('moviéndose','moving'),charge:L('cargando','charging'),detain:L('deteniendo','arresting'),aside:L('apartado, sin cortar la calle','standing aside, street open')}[u.st]||u.st; }
function shareURL(){ const c=G?G.cfg:CFG; return location.origin+location.pathname+'#/antidisturbios?m='+c.m+'&e='+c.e+'&h='+c.h+'&g='+c.g+'&s='+c.s; }
function page(inner){ X.set('<div class="ad" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Antidisturbios','Riot control')]])+'<h1>'+L('Antidisturbios','Riot control')+'</h1><p class="sub">'+L('Simulador de gestión del orden público: diriges a la UIP de la Policía Nacional en calles reales de Madrid. Cada decisión tiene consecuencias.','Public-order management simulator: you command the National Police UIP on real Madrid streets. Every decision has consequences.')+'</p><div id="ad-main">'+inner+'</div>'+datosHTML()+'</div>',L('Antidisturbios','Riot control')); }
function seg(k,opts){ return '<div class="ad-seg" role="group">'+opts.map(o=>'<button type="button" data-set="'+k+'" data-v="'+o[0]+'" class="'+(String(CFG[k])===String(o[0])?'on':'')+'">'+o[1]+'</button>').join('')+'</div>'; }
function setupHTML(){ const g=CFG.g, b=budgetFor(g);
  return '<div class="ad-set"><div class="ad-row"><span class="ad-lb">'+L('Mapa (calles reales)','Map (real streets)')+'</span>'+seg('m',Object.keys(MD).map(k=>[k,MD[k].n[EN()?1:0]]))+'</div>'+
   '<div class="ad-row"><span class="ad-lb">'+L('Escenario','Scenario')+'</span>'+seg('e',Object.keys(ESC).map(k=>[k,ESC[k][EN()?1:0]]))+'</div>'+
   '<div class="ad-row"><span class="ad-lb">'+L('Hora','Time')+'</span>'+seg('h',[['dia',L('Día (18:00)','Day (18:00)')],['noche',L('Noche (21:30)','Night (21:30)')]])+'</div>'+
   '<div class="ad-row"><span class="ad-lb">'+L('Efectivos de la UIP','UIP strength')+'</span>'+seg('g',[[1,L('1 grupo (≈50)','1 group (≈50)')],[2,L('2 grupos (≈100)','2 groups (≈100)')],[4,L('4 grupos (≈200)','4 groups (≈200)')],[6,L('6 grupos (≈300)','6 groups (≈300)')]])+
   '<p class="ad-note">'+L('Tendrás '+b.sub+' subgrupos de 15 agentes, '+b.van+' furgones (8 agentes por furgón) y '+b.fen+' tramos de valla (Estimación). Un grupo real son unos 50 agentes en 3 subgrupos.','You get '+b.sub+' sub-groups of 15 officers, '+b.van+' vans (8 officers per van) and '+b.fen+' barrier sections (estimate). A real group is about 50 officers in 3 sub-groups.')+'</p></div>'+
   '<div class="ad-ctl"><button type="button" class="ad-btn pri" data-a="plan">'+L('Planificar el despliegue','Plan the deployment')+'</button></div></div>'; }
function intel(){ const md=G.md; const gs=G.groups; let t='';
  if(G.esc==='rival'){ const A=gs[0],B=gs[1]; t=L('Inteligencia: dos grupos radicales quieren enfrentarse. ','Intelligence: two radical groups want to clash. ')+'<b>'+L('Grupo A','Group A')+'</b> (≈'+A.n0*10+') '+L('en ','at ')+md.A[2]+'; <b>'+L('Grupo B','Group B')+'</b> (≈'+B.n0*10+') '+L('en ','at ')+md.B[2]+L('. Tu misión: que no lleguen a tocarse y que no haya daños.','. Your job: keep them apart and prevent damage.'); }
  else { const p=gs[0]; t=L('Inteligencia: manifestación comunicada de unas ','Intelligence: a notified demonstration of about ')+'<b>'+(Math.round(p.n0*10/100)*100)+L(' personas',' people')+'</b>'+L(' que saldrá de ',' leaving from ')+G.startN+L(' hacia ',' towards ')+md.dest[2]+'. '+(G.esc==='tensa'?L('Se espera un bloque radical (≈'+gs[1].n0*10+') con posibles cócteles molotov y barras.','A radical bloc is expected (≈'+gs[1].n0*10+') with possible Molotov cocktails and bars.'):L('No se esperan incidentes, pero todo puede cambiar.','No incidents are expected, but anything can change.'))+(md.prot?L(' Hay que proteger el Congreso de los Diputados.',' The Congress of Deputies must be protected.'):''); }
  return '<div class="ad-intel">'+t+'</div>'; }
function legend(){ return '<div class="ad-leg"><span style="--c:#e9dcae">'+L('Manifestantes','Protesters')+'</span>'+(G.groups.some(g=>g.k==='rad')||G.esc==='pac'?'<span style="--c:#ff8a3d">'+L('Radicales','Radicals')+'</span>':'')+(G.esc==='rival'?'<span style="--c:#ff5a5a">'+L('Grupo A','Group A')+'</span><span style="--c:#c48bff">'+L('Grupo B','Group B')+'</span>':'')+'<span style="--c:#ff2b2b">'+L('Armados (molotov, barras)','Armed (Molotov, bars)')+'</span><span style="--c:#4ea1ff">'+L('UIP','UIP')+'</span><span style="--c:#1f4fa3">'+L('Furgón','Van')+'</span><span style="--c:#f2c94c">'+L('Valla','Barrier')+'</span><span style="--c:#5ac878">'+L('Salida abierta','Open exit')+'</span></div>'; }
function gameShell(){ page('<div id="ad-intel"></div><div id="ad-hud"></div><div class="ad-cv" id="ad-cvw"><canvas id="ad-cv"></canvas><div class="ad-zm"><button type="button" data-a="zin" aria-label="Zoom +">+</button><button type="button" data-a="zout" aria-label="Zoom −">−</button></div></div>'+legend()+'<div id="ad-ctl"></div><ul class="ad-log" id="ad-log"></ul>');
  CV=document.getElementById('ad-cv'); CTX=CV.getContext('2d'); G.layerC=layer(); G.cam=null; fit(); bindCanvas(); }
function hudHTML(){ const s=G.st; let h='<div class="ad-hud"><span>'+L('Heridos civiles','Injured civilians')+' <b>'+s.civ+'</b></span><span>'+L('Policías heridos','Injured officers')+' <b>'+s.pol+'</b></span><span>'+L('Detenidos','Arrests')+' <b>'+s.det+'</b></span><span>'+L('Daños','Damage')+' <b>'+s.dmg+'</b></span></div><div class="ad-grp">';
  G.groups.forEach(g=>{ if(!g.n&&G.phase!=='plan') return; const n=G.phase==='plan'?g.n0:g.n; const T=Math.round(g.T); const col=g.violent?'#ff4b3e':T>60?'#ff9b2f':T>35?'#e8c547':'#7ac36a'; h+='<div class="ad-g"><div class="nm"><b style="color:'+GCOL[g.k]+'">'+esc(g.name)+'</b> · ≈'+(n*10)+' · '+(g.violent?L('violenta','violent'):(STN[g.state]||['',''])[EN()?1:0])+'</div><div class="ad-bar" title="'+L('Tensión','Tension')+' '+T+'"><i style="width:'+Math.max(3,T)+'%;background:'+col+'"></i></div></div>'; });
  return h+'</div>'; }
function render(){ if(!G||!document.getElementById('ad-ctl')) return; const ctl=document.getElementById('ad-ctl');
  document.getElementById('ad-hud').innerHTML=G.phase==='plan'?'':hudHTML();
  if(G.phase==='plan'){ document.getElementById('ad-intel').innerHTML=intel(); const b=G.bud, used={sub:G.units.length,van:G.vans.length,fen:G.fences.length};
    const tb=(k,lab)=>'<button type="button" data-tool="'+k+'" class="'+(G.tool===k?'on':'')+'">'+lab+'</button>';
    ctl.innerHTML='<div style="width:100%"><div class="ad-seg">'+tb('sub',L('Subgrupo ','Sub-group ')+(b.sub-used.sub))+tb('van',L('Furgón ','Van ')+(b.van-used.van))+tb('fen',L('Valla ','Barrier ')+(b.fen-used.fen))+tb('del',L('Quitar','Remove'))+'</div>'+
     '<p class="ad-note" style="margin-top:6px">'+L('Toca una calle para colocar. Se colocan cruzando la calle: un subgrupo cubre unos 15 m. La línea amarilla es la ruta prevista; los puntos verdes, las salidas abiertas.','Tap a street to place. Items are placed across the street: a sub-group covers about 15 m. The yellow line is the expected route; green dots are open exits.')+(G.routeCut?' <b style="color:#ffb3aa">'+L('Has cortado la ruta prevista: la marcha se encontrará el paso cerrado.','You have cut the expected route: the march will find its way blocked.')+'</b>':'')+'</p>'+
     '<div class="ad-ctl"><button type="button" class="ad-btn" data-a="auto">'+L('Despliegue sugerido','Suggested deployment')+'</button><button type="button" class="ad-btn" data-a="clear">'+L('Borrar todo','Clear all')+'</button><button type="button" class="ad-btn pri" data-a="start"'+(G.units.length?'':' disabled')+'>'+L('Empezar','Start')+'</button><button type="button" class="ad-btn" data-a="setup">'+L('Ajustes','Settings')+'</button></div></div>';
    document.getElementById('ad-log').innerHTML=''; draw(); return; }
  const ri=document.getElementById('ad-intel'); if(G.phase==='live'&&G.radio){ const r=G.radio; ri.innerHTML='<div class="ad-radio" role="alertdialog"><div class="rh">'+L('Radio','Radio')+' · '+esc(r.from)+' · '+clock(r.t)+'</div><div class="rt">«'+esc(r.txt)+'»</div><div class="ro">'+r.opts.map(o=>'<button type="button" class="ad-btn'+(o==='charge'?' warn':'')+'" data-r="'+o+'">'+L(RO[o][0],RO[o][1])+'</button>').join('')+'</div><div class="ad-note">'+L('Partida en pausa hasta que decidas.','Game paused until you decide.')+'</div></div>'; } else ri.innerHTML='';
  if(G.phase==='live'){ const u=G.sel;
    let h='<div style="width:100%"><div class="ad-ctl">'+[1,2,4].map(v=>'<button type="button" class="ad-btn'+(G.spd===v&&!G.pause?' pri':'')+'" data-spd="'+v+'">×'+v+'</button>').join('')+'<button type="button" class="ad-btn'+(G.pause?' pri':'')+'" data-a="pause">'+(G.pause?L('Seguir','Resume'):L('Pausa','Pause'))+'</button><button type="button" class="ad-btn" data-a="end">'+L('Terminar','Finish')+'</button></div>';
    h+='<div class="ad-chips">'+G.units.map((x,i)=>'<button type="button" class="ad-btn'+(x===u?' sel':'')+(x.block?' blk':'')+'" data-u="'+i+'">'+x.nm+'</button>').join('')+'</div>';
    if(u){ h+='<div class="ad-unit"><div class="t"><b>'+u.nm+'</b> · '+(u.n-u.inj)+L(' agentes',' officers')+(u.inj?' · '+u.inj+L(' heridos',' injured'):'')+' · '+ustate(u)+'</div><div class="ad-ord">'+ORD.map(o=>'<button type="button" class="ad-btn'+(o[0]==='charge'?' warn':'')+'" data-o="'+o[0]+'"'+(u.out?' disabled':'')+'>'+L(o[1],o[2])+'</button>').join('')+'</div></div>'; }
    else h+='<p class="ad-note">'+L('Toca un subgrupo (en el mapa o en la lista) para darle órdenes.','Tap a sub-group (on the map or in the list) to give it orders.')+'</p>';
    ctl.innerHTML=h+'</div>'; }
  if(G.phase==='result'){ const v=verdict(), s=G.st; G.v=v;
    ctl.innerHTML='<div class="ad-res" id="ad-res" style="width:100%"><div class="ad-sc"><span class="n">'+v.sc+'</span><span class="g">'+v.gr+'</span><span class="ad-note">'+L('de 100','out of 100')+'</span></div><div class="ad-press">'+L('La prensa: ','The press: ')+v.head+'</div>'+
      '<div class="ad-kv"><div><span>'+L('Heridos civiles','Injured civilians')+'</span><b>'+s.civ+'</b></div><div><span>'+L('Policías heridos','Injured officers')+'</span><b>'+s.pol+'</b></div><div><span>'+L('Detenidos','Arrests')+'</span><b>'+s.det+'</b></div><div><span>'+L('… de ellos violentos','… of them violent')+'</span><b>'+s.detV+'</b></div><div><span>'+L('Daños (incidentes)','Damage (incidents)')+'</span><b>'+s.dmg+'</b></div><div><span>'+L('Denuncias por la actuación','Complaints about the police')+'</span><b>'+v.den+'</b></div><div><span>'+L('Proporcionalidad','Proportionality')+'</span><b>'+((G.inc.cargaPac||0)+(G.inc.humoPac||0)+(G.inc.detArb||0)?L('fallos','failures'):L('correcta','correct'))+'</b></div><div><span>'+L('Reacción de la prensa','Press reaction')+'</span><b>'+(v.pr>0?'+':'')+v.pr+'</b></div><div><span>'+L('Decisiones por radio','Radio decisions')+'</span><b>'+v.rg+'/'+v.rn+'</b></div></div>'+
      (v.ok.length?'<h3>'+L('Lo que hiciste bien','What you did right')+'</h3><ul class="ad-ok">'+v.ok.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+(v.ko.length?'<h3>'+L('Lo que hiciste mal','What you did wrong')+'</h3><ul class="ad-ko">'+v.ko.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'')+
      '<p class="ad-note" style="margin-top:8px">'+L('Puntuación y consecuencias: Estimación de M.A.T según los principios de la ley (proporcionalidad y aviso previo).','Score and consequences: M.A.T estimate based on the legal principles (proportionality and prior warning).')+'</p>'+
      '<div class="ad-ctl"><button type="button" class="ad-btn pri" data-a="rematch">'+L('Revancha','Rematch')+'</button><button type="button" class="ad-btn" data-a="replay">'+L('Repetir (misma semilla)','Replay (same seed)')+'</button><button type="button" class="ad-btn" data-a="share">'+L('Compartir','Share')+'</button><button type="button" class="ad-btn" data-a="setup">'+L('Ajustes','Settings')+'</button></div></div>'; }
  document.getElementById('ad-log').innerHTML=G.log.slice(0,40).map(e=>'<li class="'+e.c+'"><time>'+clock(e.t)+'</time>'+esc(e.txt)+'</li>').join(''); draw(); }

/* ---------------- planificación ---------------- */
function tracePath(F,x,y,max){ const out=[[x,y]]; let i=ci(x,y); if(i<0||F[i]>=1e9) return out; const gw=G.gw;
  for(let k=0;k<(max||2000);k++){ let bi=-1,bv=F[i]; for(const j of [i-1,i+1,i-gw,i+gw,i-gw-1,i-gw+1,i+gw-1,i+gw+1]){ if(j<0||j>=F.length) continue; if(F[j]<bv){ bv=F[j]; bi=j; } } if(bi<0) break; i=bi; if(k%2===0) out.push([(i%gw)*CELL+1,Math.floor(i/gw)*CELL+1]); }
  out.push([(i%gw)*CELL+1,Math.floor(i/gw)*CELL+1]); return out; }
function planUpdate(){ computeFields(); if(G.esc==='rival'){ const A=G.groups[0],B=G.groups[1]; const F=bfs([ci(B.st[0],B.st[1])],G.blk); const fr=F[ci(A.st[0],A.st[1])]; G.route=tracePath(F,A.st[0],A.st[1]); G.routeCut=false; if(fr>=1e9) G.route=[A.st,B.st]; }
  else { const s=G.groups[0].st; const v=G.fields.dest[ci(s[0],s[1])]; G.routeCut=v>=1e9; G.route=G.routeCut?tracePath(bfs([ci(G.dest[0],G.dest[1])],G.bld),s[0],s[1]):tracePath(G.fields.dest,s[0],s[1]); } }
function sideSlot(a,list,step){ for(let k=0;k<6;k++){ const hit=list.find(o=>Math.hypot(o.x-a.x,o.y-a.y)<step*0.6); if(!hit) return a; const c=Math.cos(a.ang), s=Math.sin(a.ang); let moved=false; for(const sg of [1,-1]){ const nx=hit.x+c*step*sg, ny=hit.y+s*step*sg; if(free0(nx,ny)&&!list.some(o=>Math.hypot(o.x-nx,o.y-ny)<step*0.6)){ a={x:nx,y:ny,ang:a.ang,len:a.len,w:a.w}; moved=true; break; } } if(!moved) return a; } return a; }
function addUnit(x,y){ if(G.units.length>=G.bud.sub) return false; let a=across(x,y,15.5); if(a.w>16) a=sideSlot(a,G.units,15); const u={nm:'S'+(G.units.length+1),n:15,inj:0,x:a.x,y:a.y,ang:a.ang,len:Math.min(15.5,a.len),block:true,st:'hold',home:[a.x,a.y]}; G.units.push(u); return u; }
function addVan(x,y){ if(G.vans.length>=G.bud.van) return false; const a=across(x,y,6); G.vans.push({x:a.x,y:a.y,ang:a.ang,on:1}); return true; }
function addFence(x,y){ if(G.fences.length>=G.bud.fen) return false; let a=across(x,y,20); if(a.w>21) a=sideSlot(a,G.fences,20); G.fences.push({x:a.x,y:a.y,ang:a.ang,len:Math.min(20,a.w+1),on:1}); return true; }
function removeNear(x,y){ const r=Math.max(12,16/G.cam.s); let best=null,bd=r,arr=null; [[G.units],[G.vans],[G.fences]].forEach(([A])=>A.forEach((o,i)=>{ const d=Math.hypot(o.x-x,o.y-y); if(d<bd){bd=d;best=i;arr=A;} })); if(arr){ arr.splice(best,1); G.units.forEach((u,i)=>u.nm='S'+(i+1)); return true; } return false; }
function autoDeploy(){ G.units=[]; G.vans=[]; G.fences=[]; computeFields(); const md=G.md, R=rng(G.cfg.s+7); const placed=[];
  const far=(x,y,d)=>placed.every(p=>Math.hypot(p[0]-x,p[1]-y)>=d);
  const put=(x,y,van)=>{ if(!free0(x,y)||!far(x,y,38)) return false; const u=addUnit(x,y); if(!u) return false; placed.push([u.x,u.y]); if(van){ const c=Math.cos(u.ang+Math.PI/2), s=Math.sin(u.ang+Math.PI/2); for(const sg of [1,-1]){ const vx=u.x+c*9*sg, vy=u.y+s*9*sg; if(free0(vx,vy)){ addVan(vx,vy); break; } } } return true; };
  if(G.esc==='rival'){ const A=G.groups[0],B=G.groups[1]; const F=bfs([ci(B.st[0],B.st[1])],G.bld); const P=tracePath(F,A.st[0],A.st[1]); const n=P.length; const used=[];
    for(let rep=0;rep<4&&G.units.length<G.bud.sub-1;rep++){ let best=null; for(let k=Math.floor(n*0.3);k<Math.floor(n*0.7);k+=2){ const p=P[k]; if(used.some(q=>Math.hypot(q[0]-p[0],q[1]-p[1])<45)) continue; const a=across(p[0],p[1],60); if(!best||a.w<best.w) best={w:a.w,p}; } if(!best) break; used.push(best.p);
      const need=Math.max(1,Math.ceil((best.w+1)/15)); for(let j=0;j<need;j++){ const u=addUnit(best.p[0],best.p[1]); if(!u) break; placed.push([u.x,u.y]); } addFence(best.p[0]+(R()-.5)*2,best.p[1]+(R()-.5)*2); const u0=G.units[G.units.length-1]; if(u0){ const c=Math.cos(u0.ang+Math.PI/2), sn=Math.sin(u0.ang+Math.PI/2); if(free0(u0.x+c*10,u0.y+sn*10)) addVan(u0.x+c*10,u0.y+sn*10); } } }
  else { const s=G.groups[0].st; const path=tracePath(G.fields.dest,s[0],s[1]); const onPath=(x,y)=>path.some(p=>Math.hypot(p[0]-x,p[1]-y)<22);
    if(md.prot){ const p=snapPt(md.prot[0],md.prot[1]+30); put(p[0],p[1],true); }
    const F=G.fields.dest; const cand=[]; for(let i=0;i<F.length;i++){ const v=F[i]*CELL; if(v>85&&v<150&&!G.bld[i]) cand.push(i); }
    for(let k=0;k<400&&G.units.length<Math.min(G.bud.sub,md.prot?6:5);k++){ const i=cand[Math.floor(R()*cand.length)]; const x=(i%G.gw)*CELL+1, y=Math.floor(i/G.gw)*CELL+1; if(onPath(x,y)) continue; const a=across(x,y,40); if(a.w>26) continue; put(x,y,true); } }
  planUpdate(); render(); }
/* ---------------- entrada (tocar, arrastrar) ---------------- */
function bindCanvas(){ let st=null; const pos=e=>{ const r=CV.getBoundingClientRect(); return [e.clientX-r.left,e.clientY-r.top]; };
  CV.addEventListener('pointerdown',e=>{ const p=pos(e); st={x:p[0],y:p[1],ox:G.cam.ox,oy:G.cam.oy,drag:false}; try{CV.setPointerCapture(e.pointerId);}catch(_){} });
  CV.addEventListener('pointermove',e=>{ if(!st) return; const p=pos(e); const dx=p[0]-st.x, dy=p[1]-st.y; if(!st.drag&&Math.hypot(dx,dy)>7&&G.cam.z>1) st.drag=true; if(st.drag){ G.cam.ox=st.ox+dx; G.cam.oy=st.oy+dy; clampCam(); draw(); } });
  CV.addEventListener('pointerup',e=>{ if(!st) return; const was=st.drag; st=null; if(was) return; const p=pos(e); tap((p[0]-G.cam.ox)/G.cam.s,(p[1]-G.cam.oy)/G.cam.s); });
  CV.addEventListener('wheel',e=>{ e.preventDefault(); const p=pos(e); zoom(e.deltaY<0?1.25:0.8,p[0],p[1]); },{passive:false}); }
function tap(x,y){ if(x<0||y<0||x>G.M.w||y>G.M.h) return;
  if(G.phase==='plan'){ if(G.tool==='del'){ removeNear(x,y); } else { if(!free0(x,y)){ const p=snapPt(x,y); if(Math.hypot(p[0]-x,p[1]-y)>10) return; x=p[0]; y=p[1]; } if(G.tool==='sub') addUnit(x,y); else if(G.tool==='van') addVan(x,y); else if(G.tool==='fen') addFence(x,y); } planUpdate(); render(); return; }
  if(G.phase!=='live') return;
  if(G.pend){ const u=G.pend.u; G.pend=null; const p=free0(x,y)?[x,y]:snapPt(x,y); u.tx=p[0]; u.ty=p[1]; u.st='move'; u.then=null; u.block=false; u.field=null; G.dirty=true; G.lastAct=G.t; lg(u.nm+L(' avanza ',' advances ')+nearName(p[0],p[1])); render(); return; }
  let best=null,bd=Math.max(14,20/G.cam.s); G.units.forEach(u=>{ const d=Math.hypot(u.x-x,u.y-y); if(d<bd){bd=d;best=u;} }); G.sel=best; render(); }
/* ---------------- bucle ---------------- */
function loop(ts){ RAF=0; if(!G||!/^#\/antidisturbios/.test(location.hash)||!document.getElementById('ad-cv')){ return; }
  const dt=Math.min(0.1,(ts-(LAST||ts))/1000); LAST=ts;
  if(G.phase==='live'&&!G.pause&&!G.pend&&!G.radio){ G.acc=(G.acc||0)+dt*6*G.spd; let n=0; while(G.acc>=0.5&&n<30&&G.phase==='live'){ G.acc-=0.5; n++; step(0.5); } if(n>=30) G.acc=0; }
  draw(); if(ts-(G.hudT||0)>350&&G.phase==='live'){ G.hudT=ts; const h=document.getElementById('ad-hud'); if(h) h.innerHTML=hudHTML(); const lgE=document.getElementById('ad-log'); if(lgE&&G.logN!==G.log.length+':'+(G.log[0]&&G.log[0].t)){ G.logN=G.log.length+':'+(G.log[0]&&G.log[0].t); lgE.innerHTML=G.log.slice(0,40).map(e=>'<li class="'+e.c+'"><time>'+clock(e.t)+'</time>'+esc(e.txt)+'</li>').join(''); } const ut=document.querySelector('.ad-unit .t'); if(ut&&G.sel){ ut.innerHTML='<b>'+G.sel.nm+'</b> · '+(G.sel.n-G.sel.inj)+L(' agentes',' officers')+(G.sel.inj?' · '+G.sel.inj+L(' heridos',' injured'):'')+' · '+ustate(G.sel); } }
  RAF=requestAnimationFrame(loop); }
function step(dt){ G.t+=dt; if(G.dirty) computeFields(); while(G.events.length&&G.events[0].t<=G.t) doEvent(G.events.shift().k); moveUnits(dt); moveAgents(dt); projectiles(); if(Math.floor(G.t)!==Math.floor(G.t-dt)) tick1(); }
function kick(){ if(!RAF){ LAST=0; RAF=requestAnimationFrame(loop); } }
/* ---------------- acciones ---------------- */
function startPlan(seed){ if(seed!=null) CFG.s=seed; try{ localStorage.setItem('mat_ad_cfg',JSON.stringify(CFG)); }catch(e){} newGame(CFG); gameShell(); planUpdate(); render(); kick(); }
function act(a){ if(a==='plan'){ startPlan(); }
  else if(a==='setup'){ G=null; page(setupHTML()); }
  else if(a==='auto') autoDeploy();
  else if(a==='clear'){ G.units=[]; G.vans=[]; G.fences=[]; planUpdate(); render(); }
  else if(a==='start'){ if(!G.units.length) return; G.phase='live'; G.t=0; G.lastAct=0; G.sel=null; G.units.forEach(u=>{ u.home=[u.x,u.y]; }); G.dirty=true; computeFields(); lg(L('Dispositivo desplegado: ','Deployment ready: ')+G.units.length+L(' subgrupos (',' sub-groups (')+G.units.length*15+L(' agentes), ',' officers), ')+G.vans.length+L(' furgones y ',' vans and ')+G.fences.length+L(' vallas',' barriers'),''); render(); kick(); }
  else if(a==='pause'){ G.pause=!G.pause; render(); }
  else if(a==='end'){ if(G.phase==='live'&&G.t<DUR*0.6&&G.groups.some(g=>g.n&&g.state!=='leave')) G.early=G.t; end(); }
  else if(a==='rematch'){ startPlan(Math.floor(Math.random()*1e6)); }
  else if(a==='replay'){ const keep={u:G.units.map(u=>[u.home[0],u.home[1]]),v:G.vans.map(v=>[v.x,v.y]),f:G.fences.map(f=>[f.x,f.y])}; startPlan(CFG.s); keep.u.forEach(p=>addUnit(p[0],p[1])); keep.v.forEach(p=>addVan(p[0],p[1])); keep.f.forEach(p=>addFence(p[0],p[1])); planUpdate(); render(); }
  else if(a==='share'){ const url=shareURL(); const v=G&&G.v; const txt=L('Antidisturbios en M.A.T: '+(v?v.sc+'/100 en '+G.md.n[0]+'. ':'')+'¿Lo haces mejor?','Riot control on M.A.T: '+(v?v.sc+'/100 in '+G.md.n[1]+'. ':'')+'Can you do better?');
    if(navigator.share){ navigator.share({title:'M.A.T',text:txt,url}).catch(()=>{}); } else if(navigator.clipboard){ navigator.clipboard.writeText(txt+' '+url).then(()=>{ const b=document.querySelector('[data-a="share"]'); if(b) b.textContent=L('Enlace copiado','Link copied'); }).catch(()=>prompt(L('Copia el enlace','Copy the link'),url)); } else prompt(L('Copia el enlace','Copy the link'),url); }
  else if(a==='zin') zoom(1.5); else if(a==='zout') zoom(1/1.5); }
function onClick(e){ const t=e.target.closest('[data-a],[data-set],[data-tool],[data-o],[data-u],[data-spd],[data-r]'); if(!t||!APP.contains(t)||!document.querySelector('.ad')) return;
  if(t.dataset.set){ const k=t.dataset.set; CFG[k]=k==='g'?+t.dataset.v:t.dataset.v; page(setupHTML()); return; }
  if(t.dataset.tool){ G.tool=t.dataset.tool; render(); return; }
  if(t.dataset.r){ if(G&&G.radio) radioChoose(t.dataset.r); return; }
  if(t.dataset.o){ if(G&&G.sel&&G.phase==='live') order(G.sel,t.dataset.o); return; }
  if(t.dataset.u!=null){ G.sel=G.units[+t.dataset.u]; render(); return; }
  if(t.dataset.spd){ G.spd=+t.dataset.spd; G.pause=false; render(); return; }
  act(t.dataset.a); }
let BOUND=false;
export function route(app,x){ APP=app; X=x; const q=(location.hash.split('?')[1]||''); const P={}; q.split('&').forEach(kv=>{ const [k,v]=kv.split('='); if(k) P[k]=decodeURIComponent(v||''); });
  let saved={}; try{ saved=JSON.parse(localStorage.getItem('mat_ad_cfg')||'{}'); }catch(e){}
  CFG={m:MD[P.m]?P.m:(MD[saved.m]?saved.m:'sol'),e:ESC[P.e]?P.e:(ESC[saved.e]?saved.e:'tensa'),h:P.h==='noche'||P.h==='dia'?P.h:(saved.h||'dia'),g:[1,2,4,6].indexOf(+P.g)>=0?+P.g:([1,2,4,6].indexOf(+saved.g)>=0?+saved.g:4),s:P.s?(+P.s>>>0):Math.floor(Math.random()*1e6)};
  if(!document.getElementById('adcss')){ const s=document.createElement('style'); s.id='adcss'; s.textContent=CSS; document.head.appendChild(s); }
  if(!BOUND){ BOUND=true; document.addEventListener('click',onClick); window.addEventListener('resize',()=>{ if(G&&CV&&document.getElementById('ad-cv')){ fit(); draw(); } }); }
  G=null; if(RAF){ cancelAnimationFrame(RAF); RAF=0; }
  const go=()=>{ if(!/^#\/antidisturbios/.test(location.hash)) return; if(P.s) startPlan(); else page(setupHTML()); };
  if(MAPS) return go();
  page('<p class="sub">'+L('Cargando calles de Madrid…','Loading Madrid streets…')+'</p>');
  const v=(document.querySelector('script[data-v]')||{getAttribute:()=>'1'}).getAttribute('data-v');
  const get=window.MAT_GET?window.MAT_GET('antidisturbios_mapas.json.gz'):fetch('antidisturbios_mapas.json.gz?v='+v).then(r=>r.json());
  get.then(d=>{ MAPS=d; go(); }).catch(()=>page('<p class="sub">'+L('No se pudieron cargar los mapas. Actualiza la página.','The maps could not be loaded. Reload the page.')+'</p>')); }
if(typeof window!=='undefined') window.MAT_AD_DEBUG=()=>({G,CFG,radioChoose,startPlan,step,verdict,act,order,tap,autoDeploy,tracePath,bfs,ci,across,free0});
