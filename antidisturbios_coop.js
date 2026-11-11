/* M.A.T · Antidisturbios · 👥 Cooperativo para 2 jugadores (11-11-2026)
   Los dos móviles se conectan directamente (WebRTC). Un servicio público y gratuito (PeerJS) solo los pone en contacto;
   no hay servidor de M.A.T ni cuentas. Los dos ejecutan la misma simulación con la misma semilla: el anfitrión marca el
   reloj (pasos fijos de 0,5 s) y reparte las órdenes de los dos con el número de paso en que se aplican. Cada 10 s de
   juego se compara una huella del estado; si no coincide, el invitado copia el estado del anfitrión. */
let A=null, S=null, VER='1';
const PJ=['https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js','https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'];
const PFX='mat-uip-', ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789', HK=20, TMO=15000, DROP=12000;
const ICE={iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:stun2.l.google.com:19302'}]};
const COL={h:'#1f4fa3',g:'#1d8a4e'};
const CSS='.coop{max-width:560px;margin:0 auto}.coop h2{margin:4px 0 8px;font-size:21px}.coop .cc{font:800 40px/1.1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:6px;text-align:center;padding:12px 6px;margin:8px 0;border-radius:12px;background:rgba(127,214,194,.12);border:1px solid rgba(127,214,194,.45)}.coop .st{margin:8px 0;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.06);font-size:15px}.coop .st.ok{background:rgba(70,180,110,.18);border:1px solid rgba(70,180,110,.55)}.coop .st.bad{background:rgba(255,90,70,.15);border:1px solid rgba(255,90,70,.5)}.coop .row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.coop .row>*{flex:1 1 140px}.coop label{display:block;font-size:13px;opacity:.85;margin:6px 0 3px}.coop select,.coop input{width:100%;box-sizing:border-box;font-size:16px;padding:9px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.25);background:rgba(0,0,0,.25);color:inherit}.coop input.code{font:700 24px ui-monospace,Menlo,monospace;letter-spacing:5px;text-transform:uppercase;text-align:center}.coop a.ad-btn{text-decoration:none;display:inline-flex;align-items:center;justify-content:center;text-align:center}.coop .lnk{word-break:break-all;font-size:13px;opacity:.85}.coop .tm{display:flex;gap:8px;margin:8px 0}.coop .tm div{flex:1;padding:8px;border-radius:10px;font-size:14px;border:2px solid}.ad-coop{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:13px;margin:0 0 6px;padding:6px 10px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.18)}.ad-coop .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:-1px}.ad-coop.bad{background:rgba(255,90,70,.15);border-color:rgba(255,90,70,.5)}.ad-coop .ad-btn{padding:4px 10px}';
const L=(a,b)=>A.L(a,b);
function css(){ if(!document.getElementById('coopcss')){ const s=document.createElement('style'); s.id='coopcss'; s.textContent=CSS; document.head.appendChild(s); } }
function code(){ let c=''; const r=crypto.getRandomValues(new Uint32Array(5)); for(let i=0;i<5;i++) c+=ABC[r[i]%ABC.length]; return c; }
function clean(c){ return String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6); }
function link(c){ return location.origin+location.pathname+'#/antidisturbios?coop='+c; }
function loadPJ(){ if(window.Peer) return Promise.resolve(window.Peer); if(loadPJ.p) return loadPJ.p;
  loadPJ.p=new Promise((ok,ko)=>{ let i=0; const tryOne=()=>{ if(i>=PJ.length){ loadPJ.p=null; ko(new Error('peerjs')); return; } const s=document.createElement('script'); s.src=PJ[i++]; s.async=true; s.onload=()=>window.Peer?ok(window.Peer):tryOne(); s.onerror=()=>{ s.remove(); tryOne(); }; document.head.appendChild(s); }; tryOne(); });
  return loadPJ.p; }
function now(){ return Date.now(); }
function send(m){ if(S&&S.conn&&S.conn.open){ try{ S.conn.send(m); }catch(e){} } }
function K(){ const G=A.G; return G?Math.round(G.t*2):0; }

/* ---------- huella del estado (números exactos) ---------- */
const F64=new Float64Array(1), U32=new Uint32Array(F64.buffer);
function sh(t){ t=String(t||''); let h=7; for(let i=0;i<t.length;i++) h=Math.imul(h^t.charCodeAt(i),31); return h; }
function hash(){ const G=A.G; let h=-2128831035; const mix=x=>{ h=Math.imul(h^x,16777619); }; const num=x=>{ F64[0]=+x||0; mix(U32[0]); mix(U32[1]); };
  num(G.t); mix(G.R.g()|0); const s=G.st; Object.keys(s).forEach(k=>num(s[k]));
  G.ag.forEach(a=>{ num(a.x); num(a.y); mix(a.on?1:0); mix(a.g|0); mix(a.arm|0); });
  G.units.forEach(u=>{ num(u.x); num(u.y); num(u.inj); mix(sh(u.st)); });
  G.vans.forEach(v=>{ num(v.x); num(v.y); mix(v.on?1:0); });
  G.groups.forEach(g=>{ num(g.T); num(g.n); mix(sh(g.state)); mix(g.violent?1:0); });
  mix(G.events.length); mix(G.radio?sh(G.radio.k):0); mix(G.proj.length); mix((G.smokes||[]).length);
  return (h>>>0).toString(36); }

/* ---------- copia del estado completo (para resincronizar) ---------- */
const SKIP={cfg:1,R:1,M:1,md:1,layerC:1,cam:1,sel:1,pend:1,tool:1,toast:1,more:1,hudT:1,logN:1,fx:1,rt:1,quiet:1,tut:1,spd:1,pause:1,acc:1,v:1};
function b64(v){ const u=new Uint8Array(v.buffer,v.byteOffset,v.byteLength); let s=''; for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); return btoa(s); }
function unb64(s){ const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
function ser(){ const G=A.G, ids=new Map();
  const enc=(v,top)=>{ if(v===undefined) return {$u:1}; if(typeof v==='number'){ if(Object.is(v,-0)||!isFinite(v)) return {$n:Object.is(v,-0)?'-0':String(v)}; return v; } if(v===null||typeof v!=='object') return typeof v==='function'?{$u:1}:v;
    if(ids.has(v)) return {$r:ids.get(v)}; const id=ids.size; ids.set(v,id);
    if(ArrayBuffer.isView(v)) return {$x:1}; /* campos de distancia y rejillas: se recalculan igual en los dos al cargar */
    if(Array.isArray(v)){ const a=new Array(v.length); for(let i=0;i<v.length;i++) a[i]=enc(v[i]); return {$i:id,a}; }
    const o={}; for(const k in v){ if(top&&SKIP[k]) continue; if(k==='bw'||typeof v[k]==='function') continue; o[k]=enc(v[k]); } return {$i:id,o}; };
  return JSON.stringify({g:enc(G,true),r:G.R.g(),k:K()}); }
const XF={xf:1};
function des(txt){ const d=JSON.parse(txt), objs=[];
  const dec=e=>{ if(e===null||typeof e!=='object') return e; if(e.$r!=null) return objs[e.$r]; if(e.$x) return XF; if(e.$n!=null) return Number(e.$n); if(e.$u) return undefined;
    if(e.$t){ const T=window[e.$t]; const u=unb64(e.b); const v=new T(u.buffer,0,u.byteLength/T.BYTES_PER_ELEMENT); objs[e.$i]=v; return v; }
    if(e.a){ const v=new Array(e.a.length); objs[e.$i]=v; for(let i=0;i<e.a.length;i++) v[i]=dec(e.a[i]); return v; }
    const v={}; objs[e.$i]=v; for(const k in e.o) v[k]=dec(e.o[k]); return v; };
  return {g:dec(d.g),r:d.r,k:d.k}; }
function load(txt){ const old=A.G, d=des(txt), G=d.g;
  Object.keys(SKIP).forEach(k=>{ if(k!=='R'&&k!=='sel'&&k!=='pend'&&k!=='v') G[k]=old[k]; });
  const R=A.rng(0); R.s(d.r); G.R=R; G.tut=0; G.pend=null;
  const N=old.bld.length; G.bld=old.bld; G.pol=new Uint8Array(N); G.blk=new Uint8Array(N); G.fields={exit0:old.fields.exit0}; A.setG(G); A.computeFields();
  G.units.concat(G.vans).forEach(o=>{ if(o.field===XF) o.field=A.bfs([A.ci(o.tx,o.ty)],A.blkU()); });
  G.groups.forEach(g=>{ if(g.field===XF){ g.field=null; g.fieldT=-99; } if(g.sfield===XF) g.sfield=null; });
  if(old.sel){ const i=old.units.indexOf(old.sel), j=old.vans.indexOf(old.sel); G.sel=i>=0?G.units[i]:j>=0?G.vans[j]:null; } else G.sel=null;
  A.setG(G); G.dirty=G.dirty||false; A.render(); }

/* ---------- órdenes ---------- */
function ownU(i,n){ return i<Math.ceil(n/2)?'h':'g'; }
function owner(o){ const G=A.G; if(!G) return 'h'; let i=G.units.indexOf(o); if(i>=0) return ownU(i,G.units.length); i=G.vans.indexOf(o); if(i>=0) return (S.vo&&S.vo[i])||'h'; return 'h'; }
function mine(o){ return !S||S.solo||!o||owner(o)===S.role; }
function run(c,who){ const G=A.G; if(!G||G.phase!=='live') return; const sel=G.sel, pend=G.pend, more=G.more; let tx='';
  try{ if(c[0]==='mv'){ const o=c[1]==='v'?G.vans[c[2]]:G.units[c[2]]; if(o&&!o.out){ A.moveTo(o,c[3],c[4]); tx=o.nm+L(' se mueve',' moves'); } }
    else if(c[0]==='ch'){ const u=G.units[c[1]]; if(u&&!u.out){ A.chargeTo(u,c[2],c[3]); tx=u.nm+L(': carga',': charge'); } }
    else if(c[0]==='or'){ const u=G.units[c[1]]; if(u){ A.order(u,c[2],!!c[3]); tx=u.nm+': '+ordName(c[2]); } }
    else if(c[0]==='vo'){ const v=G.vans[c[1]]; if(v){ A.vorder(v,c[2]); tx=v.nm+': '+(c[2]==='vblock'?L('corta la calle','blocks the street'):L('se aparta','moves aside')); } }
    else if(c[0]==='rd'){ if(G.radio&&G.radio.k===c[2]&&G.radio.t===c[3]){ A.radioChoose(c[1]); tx=L('Radio respondida','Radio answered'); } }
    else if(c[0]==='dl'){ A.dialogo(); tx=L('Equipo de diálogo','Dialogue team'); }
    else if(c[0]==='sfn'){ A.sfAct('sf-next'); tx=L('Siguiente oleada','Next wave'); }
    else if(c[0]==='end'){ A.act('end'); }
  } finally { const g2=A.G; if(g2){ g2.sel=sel; g2.pend=pend; g2.more=more; } }
  S.nc++; if(tx&&who&&who!==S.role) S.last=(who==='h'?L('Anfitrión','Host'):L('Invitado','Guest'))+': '+tx; A.render(); }
function ordName(k){ return ({hold:L('mantiene la línea','holds the line'),warn:L('avisa','warns'),smoke:L('humo','smoke'),charge:L('carga','charge'),open:L('abre salida','opens an exit'),prot:L('protege','protects'),det:L('detiene','arrests'),back:L('se retira','withdraws'),pace:L('cambia de paso','changes pace')})[k]||k; }
function valid(c,who){ const G=A.G; if(!G) return false; if(S.solo) return true;
  if(c[0]==='mv'){ const o=c[1]==='v'?G.vans[c[2]]:G.units[c[2]]; return !!o&&owner(o)===who; }
  if(c[0]==='ch'||c[0]==='or'){ const o=G.units[c[1]]; return !!o&&owner(o)===who; }
  if(c[0]==='vo'){ const o=G.vans[c[1]]; return !!o&&owner(o)===who; }
  return ['rd','dl','sfn','end'].indexOf(c[0])>=0; }
function cmd(c){ if(!S) return; c=c.map(x=>typeof x==='number'&&!Number.isInteger(x)?Math.round(x*1000)/1000:x);
  if(S.role==='h'||S.solo) S.q.push([c,S.role]); else { send({y:'c',c}); S.sent++; if(c[0]==='rd'){ S.rdp=c[3]; A.render(); } } }

/* ---------- reloj ---------- */
function frame(dt){ const G=A.G; if(!G||!S) return; if(S.role==='h'||S.solo) hostFrame(dt); else guestFrame(); bar(); }
function hostFrame(dt){ const G=A.G; if(G.phase!=='live'){ S.q.length=0; return; }
  if(S.rs&&!S.solo){ S.rs=false; sendSnap(); if(A.G!==G) return; }
  const k0=K(); while(S.q.length){ const x=S.q.shift(); if(!valid(x[0],x[1])) continue; run(x[0],x[1]); S.cs++; if(!S.solo) send({y:'c',k:k0,c:x[0],w:x[1],n:S.cs}); if(A.G!==G||G.phase!=='live') break; }
  if(G.phase==='live'&&!G.pause&&!G.radio&&!(G.sf&&G.sf.dlg)){ G.acc=(G.acc||0)+dt*6*G.spd; let n=0;
    while(G.acc>=0.5&&n<30&&G.phase==='live'&&!G.radio&&!G.pause&&!(G.sf&&G.sf.dlg)){ G.acc-=0.5; n++; A.step(0.5); const k=K(); if(!S.solo&&k%HK===0){ send({y:'h',k,h:hash()}); } }
    if(n>=30) G.acc=0; }
  if(!S.solo){ const k=K(); if(k!==S.ak||G.pause!==S.ap||G.spd!==S.as||now()-S.at>1000){ S.ak=k; S.ap=G.pause; S.as=G.spd; S.at=now(); send({y:'a',k,p:G.pause?1:0,s:G.spd,ph:G.phase}); } } }
function guestFrame(){ const G=A.G; if(G.phase!=='live'){ return; } let n=0;
  for(;;){ const g=A.G; if(g.phase!=='live') break; const k=K();
    if(S.hh[k]!=null){ const h=S.hh[k]; delete S.hh[k]; const mine_=hash(); if(h===mine_) S.ok++; else { S.bad++; S.wait=true; send({y:'rs',k}); } }
    if(S.wait) break;
    while(S.q.length&&S.q[0].k<=k){ const x=S.q.shift(); if(x.k<k) S.late++; run(x.c,x.w); if(A.G.phase!=='live') break; }
    if(A.G.phase!=='live'||k>=S.adv||n>=40) break;
    A.step(0.5); n++; }
  const g=A.G; g.acc=0.49; g.spd=S.hs||1; g.pause=!!S.hp; }
function sendSnap(){ const txt=ser(); load(txt); /* el anfitrión también carga la copia: así los dos parten exactamente del mismo estado */ const id=++S.sid, CH=6000, /* la conexión acepta mensajes de menos de 16 KB */ n=Math.ceil(txt.length/CH); for(let i=0;i<n;i++) send({y:'sp',id,i,n,cs:S.cs,s:txt.slice(i*CH,(i+1)*CH)}); S.snaps++; S.snapBytes=txt.length; }

/* ---------- mensajes ---------- */
function onMsg(m){ if(!S||!m||typeof m!=='object') return; S.seen=now();
  if(m.y==='k') return;
  if(m.y==='hi'){ if(String(m.v)!==String(VER)){ S.verBad=true; status(L('Tu compañero tiene otra versión del juego. Recargad los dos la página e intentadlo de nuevo.','Your partner has a different version of the game. Both of you reload the page and try again.'),'bad'); return; } if(S.role==='g') send({y:'hi',v:VER}); clearTimeout(S.to); S.st='conn'; lobby(); return; }
  if(m.y==='full'){ status(L('Esa sala ya tiene dos jugadores.','That room already has two players.'),'bad'); return; }
  if(m.y==='bye'){ drop(L('Tu compañero ha salido de la partida.','Your partner has left the game.')); return; }
  if(S.role==='h'){ if(m.y==='c'&&Array.isArray(m.c)){ S.rc++; S.q.push([m.c,'g']); } else if(m.y==='rs'){ S.rs=true; } return; }
  /* invitado */
  if(m.y==='go'){ startGame(m.c); return; }
  if(m.y==='lobby'){ A.kill(); S.st='conn'; S.inGame=false; lobby(); return; }
  if(m.y==='c'){ S.q.push(m); return; }
  if(m.y==='a'){ S.adv=m.k; const ch=S.hp!==m.p||S.hs!==m.s; S.hp=m.p; S.hs=m.s; if(ch&&A.G){ A.G.pause=!!m.p; A.G.spd=m.s||1; A.render(); } return; }
  if(m.y==='h'){ S.hh[m.k]=m.h; return; }
  if(m.y==='sp'){ if(!S.sp||S.sp.id!==m.id) S.sp={id:m.id,n:m.n,cs:m.cs,p:[]}; S.sp.p[m.i]=m.s; if(S.sp.p.filter(x=>x!=null).length===m.n){ const txt=S.sp.p.join(''), cs=S.sp.cs; S.sp=null; load(txt); S.q=S.q.filter(x=>x.n>cs); Object.keys(S.hh).forEach(k=>{ if(+k<=K()) delete S.hh[k]; }); S.wait=false; S.rsN++; } return; } }
function wire(conn){ S.conn=conn; conn.on('data',onMsg); conn.on('close',()=>drop()); conn.on('error',()=>{ if(S) S.cerr=(S.cerr||0)+1; }); }
function drop(why){ if(!S||S.dropped) return; S.dropped=true; const wasGame=S.inGame&&A.G&&A.G.phase==='live';
  try{ S.conn&&S.conn.close(); }catch(e){} try{ S.peer&&S.peer.destroy(); }catch(e){}
  S.conn=null; S.solo=true; S.why=why||L('Se ha perdido la conexión con tu compañero.','The connection with your partner was lost.');
  if(wasGame){ S.st='solo'; S.q=S.role==='g'?[]:S.q; const G=A.G; G.pause=false; G.acc=0; if(S.role==='g'){ G.spd=S.hs||1; } A.toast(S.why,S.why); A.render(); A.kick(); }
  else if(S.inGame){ S.st='solo'; }
  else { S.st='err'; status(S.why+' '+L('Puedes volver al menú y crear otra sala.','You can go back to the menu and create another room.'),'bad'); } }

/* ---------- partida ---------- */
function startGame(c){ S.inGame=true; S.st='play'; S.q=[]; S.hh={}; S.adv=0; S.wait=false; S.last=''; S.cfg=c;
  const cfg={m:c.m,e:c.sf?'tensa':c.e,h:c.h,g:4,s:c.s>>>0,d:'f'}; if(c.sf) cfg.sf=1;
  A.newGame(cfg); A.gameShell(); A.autoDeploy(); A.act('start'); const G=A.G; G.tut=0; G.spd=1; G.pause=false; G.acc=0; G.sel=null;
  S.vo=G.vans.map(v=>{ let b=0,bd=1e9; G.units.forEach((u,i)=>{ const d=Math.hypot(u.x-v.x,u.y-v.y); if(d<bd){ bd=d; b=i; } }); return ownU(b,G.units.length); });
  const w=document.getElementById('ad-intel'); if(w&&!document.getElementById('ad-coop')){ const d=document.createElement('div'); d.id='ad-coop'; d.className='ad-coop'; w.parentNode.insertBefore(d,w); d.addEventListener('click',e=>{ const b=e.target.closest('[data-co]'); if(b) coAct(b.dataset.co); }); }
  A.setCO(CTRL); S.barH=''; A.render(); A.kick();
  if(S.role==='h'){ send({y:'h',k:0,h:hash()}); } }
function names(r){ const G=A.G, n=G?G.units.length:4, a=[], b=[]; for(let i=0;i<n;i++)(ownU(i,n)==='h'?a:b).push('G'+(i+1)); return (r==='h'?a:b).join('–'); }
function bar(){ const el=document.getElementById('ad-coop'); if(!el) return; const G=A.G; let h;
  const me=S.role, ot=me==='h'?'g':'h', dot=c=>'<span class="dot" style="background:'+COL[c]+'"></span>';
  if(S.solo){ h='<span>⚠️ <b>'+A.esc(S.why||'')+'</b> '+L('Sigues tú solo con todas las unidades.','You carry on alone with all the units.')+'</span>'; }
  else h='<span>👥 <b>'+L('Cooperativo','Co-op')+'</b> · '+L('Conectado','Connected')+' ✅</span><span>'+dot(me)+L('Tú','You')+': '+names(me)+'</span><span>'+dot(ot)+L('Compañero','Partner')+': '+names(ot)+'</span>'+(me==='g'?'<span class="dim">'+L('Pausa y velocidad: el anfitrión','Pause and speed: the host')+(S.hp?' · <b>'+L('En pausa','Paused')+'</b>':'')+'</span>':'')+(S.last?'<span class="dim">'+A.esc(S.last)+'</span>':'');
  if(G&&G.phase==='result'){ h+=S.solo?'<span>'+L('Partida terminada.','Game over.')+'</span>':'<span>'+L('Partida terminada: los dos veis el mismo resultado.','Game over: you both see the same result.')+'</span>'+(me==='h'?'<button type="button" class="ad-btn pri" data-co="again">'+L('Otra partida juntos','Play again together')+'</button>':'<span class="dim">'+L('El anfitrión puede empezar otra.','The host can start another one.')+'</span>')+'<button type="button" class="ad-btn" data-co="leave">'+L('Salir','Leave')+'</button>'; }
  if(h!==S.barH){ S.barH=h; el.className='ad-coop'+(S.solo?' bad':''); el.innerHTML=h; } }
function coAct(a){ if(a==='again'&&S&&S.role==='h'&&!S.solo){ send({y:'lobby'}); A.kill(); S.inGame=false; S.st='conn'; lobby(); }
  else if(a==='leave'){ leave(); A.setupPage(); window.scrollTo&&window.scrollTo(0,0); } }
function leave(silent){ if(!S) return; if(S.conn&&S.conn.open){ try{ S.conn.send({y:'bye'}); }catch(e){} } const s=S; S=null; A.setCO(null); clearInterval(s.iv); clearTimeout(s.to); setTimeout(()=>{ try{ s.conn&&s.conn.close(); }catch(e){} try{ s.peer&&s.peer.destroy(); }catch(e){} },300); }
const CTRL={ frame, cmd, mine, isHost:()=>!S||S.role==='h'||S.solo,
  mv:(o,x,y)=>{ const G=A.G; return o.van?['mv','v',G.vans.indexOf(o),x,y]:['mv','u',G.units.indexOf(o),x,y]; },
  order:(o,k)=>{ const G=A.G; if(o.van){ cmd(['vo',G.vans.indexOf(o),k]); return true; } if(k==='adv'||(k==='charge'&&A.MD&&G.cfg.d==='r')) return false; if(k==='charge'||k==='smoke'){ cmd(['or',G.units.indexOf(o),k,1]); return true; } cmd(['or',G.units.indexOf(o),k,0]); return true; },
  notMine:o=>{ A.toast(o.nm+': lo lleva tu compañero',o.nm+': your partner controls it'); A.render(); A.draw(); },
  hostOnly:()=>{ A.toast('La pausa y la velocidad las lleva el anfitrión','Pause and speed are up to the host'); A.render(); A.draw(); },
  act:a=>{ if(!S) return false; if(a==='dial'){ cmd(['dl']); return true; } if(a==='sf-next'){ cmd(['sfn']); return true; } if(a==='end'){ cmd(['end']); return true; }
    if(a==='pause'&&!(S.role==='h'||S.solo)){ CTRL.hostOnly(); return true; }
    if(['rematch','replay','setup','sf-again','sf-replay','sf-menu','plan','auto','clear','start'].indexOf(a)>=0){ leave(); return false; } return false; },
  col:u=>COL[S&&!S.solo?owner(u):'h'],
  chip:o=>{ if(!S||S.solo) return ''; const c=COL[owner(o)]; return ' style="box-shadow:inset 0 -3px 0 '+c+(mine(o)?'':';opacity:.6')+'"'; },
  hint:()=>S&&!S.solo?L('Tus grupos son '+names(S.role)+' ('+(S.role==='h'?'azul':'verde')+'); los de tu compañero salen en '+(S.role==='h'?'verde':'azul')+'. Toca uno tuyo y luego una calle. La radio la decide el primero que responda.','Your groups are '+names(S.role)+' ('+(S.role==='h'?'blue':'green')+'); your partner’s are '+(S.role==='h'?'green':'blue')+'. Tap one of yours, then a street. The radio is decided by whoever answers first.'):L('Toca un grupo (G1–G4) o un furgón para darle órdenes.','Tap a group (G1–G4) or a van to give it orders.'),
  radioNote:()=>S&&!S.solo&&S.rdp!=null&&A.G&&A.G.radio&&A.G.radio.t===S.rdp?L('Respuesta enviada: esperando al anfitrión…','Answer sent: waiting for the host…'):S&&!S.solo?L('Partida en pausa: decide el primero de los dos que responda.','Game paused: whoever answers first decides.'):L('Partida en pausa hasta que decidas.','Game paused until you decide.'),
  leave };

/* ---------- sala ---------- */
function status(t,c){ const e=document.getElementById('coop-st'); if(e){ e.className='st'+(c?' '+c:''); e.innerHTML=t; } }
function shell(inner){ css(); A.page('<div class="coop" id="coop">'+inner+'</div>'); const el=document.getElementById('coop'); el.addEventListener('click',e=>{ const b=e.target.closest('[data-co]'); if(b) uiAct(b.dataset.co,b); }); }
function home(msg){ const en=A.EN();
  shell('<h2>👥 '+L('Cooperativo (2 jugadores)','Co-op (2 players)')+'</h2><p class="ad-note">'+L('Jugáis los dos la misma operación, cada uno en su móvil, y os repartís los 4 grupos UIP: el anfitrión lleva G1–G2 y el invitado G3–G4. Los móviles se conectan directamente con un código de sala: no hace falta cuenta.','You both play the same operation, each on your own phone, and split the 4 UIP groups: the host has G1–G2 and the guest G3–G4. The phones connect directly with a room code: no account needed.')+'</p>'+
  '<div class="row"><button type="button" class="ad-btn pri" data-co="host">'+L('Crear sala','Create a room')+'</button></div>'+
  '<label for="coop-in">'+L('¿Te han pasado un código? Escríbelo aquí:','Got a code? Type it here:')+'</label><div class="row"><input id="coop-in" class="code" maxlength="6" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABC12"><button type="button" class="ad-btn" data-co="join">'+L('Unirme','Join')+'</button></div>'+
  '<div id="coop-st" class="st'+(msg?' bad':'')+'"'+(msg?'':' style="display:none"')+'>'+(msg||'')+'</div>'+
  '<p class="ad-note">'+L('Funciona mejor con los dos en WiFi. En algunas redes móviles la conexión directa no es posible.','Works best with both on WiFi. On some mobile networks a direct connection is not possible.')+'</p><div class="row"><button type="button" class="ad-btn" data-co="back">'+L('← Volver','← Back')+'</button></div>');
  const inp=document.getElementById('coop-in'); inp.addEventListener('keydown',e=>{ if(e.key==='Enter') uiAct('join'); }); }
function mapOpts(){ const en=A.EN()?1:0, C=A.CFG||{}; return Object.keys(A.MD).map(k=>'<option value="'+k+'"'+(C.m===k?' selected':'')+'>'+A.esc(A.MD[k].n[en])+'</option>').join(''); }
function lobby(){ const en=A.EN()?1:0, C=A.CFG||{}, h=S.role==='h', cc=S.code;
  let body='<h2>👥 '+L('Cooperativo','Co-op')+'</h2>';
  if(h) body+='<p class="ad-note" style="margin:0">'+L('Código de la sala','Room code')+'</p><div class="cc" id="coop-code">'+cc+'</div>';
  body+='<div id="coop-st" class="st'+(S.st==='conn'?' ok':'')+'">'+(S.st==='conn'?'✅ <b>'+L('Conectado','Connected')+'</b> · '+(h?L('tu compañero está dentro.','your partner is in.'):L('estás en la sala '+cc+'.','you are in room '+cc+'.')):(h?L('Esperando a tu compañero… Pásale el código o el enlace.','Waiting for your partner… Send them the code or the link.'):L('Conectando…','Connecting…')))+'</div>';
  if(h&&S.st!=='conn'){ const url=link(cc), wa='https://wa.me/?text='+encodeURIComponent(L('¿Jugamos juntos a Antidisturbios en M.A.T? Código de sala: ','Shall we play riot control together on M.A.T? Room code: ')+cc+' · '+url);
    body+='<div class="row"><a class="ad-btn pri" href="'+wa+'" target="_blank" rel="noopener">'+L('Enviar por WhatsApp','Send on WhatsApp')+'</a><button type="button" class="ad-btn" data-co="copy">'+L('Copiar enlace','Copy link')+'</button></div><p class="lnk">'+A.esc(url)+'</p>'; }
  body+='<div class="tm"><div style="border-color:'+COL.h+'"><b>'+L('Anfitrión','Host')+(h?' ('+L('tú','you')+')':'')+'</b><br>G1–G2 · '+L('azul','blue')+'<br><small>'+L('Elige la partida, pausa y velocidad','Picks the game, pause and speed')+'</small></div><div style="border-color:'+COL.g+'"><b>'+L('Invitado','Guest')+(!h?' ('+L('tú','you')+')':'')+'</b><br>G3–G4 · '+L('verde','green')+'<br><small>'+L('Furgones: los de sus grupos','Vans: the ones by their groups')+'</small></div></div>';
  body+='<p class="ad-note">'+L('Radio: decide el primero de los dos que responda. Si uno se desconecta, el otro sigue solo con todas las unidades.','Radio: whoever answers first decides. If one of you disconnects, the other carries on alone with all the units.')+'</p>';
  if(h){ body+='<div class="row"><div><label for="coop-mo">'+L('Partida','Game')+'</label><select id="coop-mo"><option value="n">'+L('Manifestación','Demonstration')+'</option><option value="sf"'+(S.mo==='sf'?' selected':'')+'>♾️ '+L('Sin fin (oleadas)','Endless (waves)')+'</option></select></div><div><label for="coop-m">'+L('Mapa','Map')+'</label><select id="coop-m">'+mapOpts()+'</select></div></div>'+
    '<div class="row"><div><label for="coop-e">'+L('Escenario','Scenario')+'</label><select id="coop-e">'+['pac','tensa','rival','rnd'].map(k=>'<option value="'+k+'"'+((C.e||'tensa')===k?' selected':'')+'>'+A.esc(A.ESC[k][en])+'</option>').join('')+'</select></div><div><label for="coop-h">'+L('Hora','Time')+'</label><select id="coop-h"><option value="dia">'+L('Día (18:00)','Day (18:00)')+'</option><option value="noche"'+(C.h==='noche'?' selected':'')+'>'+L('Noche (21:30)','Night (21:30)')+'</option></select></div></div>'+
    '<p class="ad-note">'+L('Modo Fácil, con el despliegue sugerido para los dos.','Easy mode, with the suggested deployment for both of you.')+'</p><div class="row"><button type="button" class="ad-btn pri" data-co="go"'+(S.st==='conn'?'':' disabled')+'>'+L('Empezar la partida','Start the game')+'</button></div>'; }
  else if(S.st==='conn') body+='<p class="ad-note"><b>'+L('El anfitrión elige la partida y la empieza.','The host picks the game and starts it.')+'</b></p>';
  body+='<div class="row"><button type="button" class="ad-btn" data-co="back">'+L('← Salir','← Leave')+'</button></div>';
  shell(body); }
function uiAct(a){ if(a==='back'){ leave(); A.setupPage(); return; }
  if(a==='host') return host(); if(a==='join'){ const v=clean((document.getElementById('coop-in')||{}).value); if(v.length<4){ status(L('El código tiene 5 letras o números.','The code has 5 letters or numbers.'),'bad'); document.getElementById('coop-st').style.display=''; return; } return join(v); }
  if(a==='copy'){ const url=link(S.code); if(navigator.clipboard) navigator.clipboard.writeText(url).then(()=>status(L('Enlace copiado. Pégalo en WhatsApp.','Link copied. Paste it into WhatsApp.'))).catch(()=>prompt('',url)); else prompt('',url); return; }
  if(a==='go'&&S&&S.role==='h'&&S.st==='conn'){ const g=id=>(document.getElementById(id)||{}).value; const c={m:g('coop-m')||'sol',e:g('coop-e')||'tensa',h:g('coop-h')||'dia',sf:g('coop-mo')==='sf'?1:0,s:crypto.getRandomValues(new Uint32Array(1))[0]>>>0}; S.mo=c.sf?'sf':'n'; send({y:'go',c}); startGame(c); } }
function newS(role){ if(S) leave(true); S={role,code:'',peer:null,conn:null,st:'wait',q:[],hh:{},adv:0,nc:0,ok:0,bad:0,late:0,rsN:0,snaps:0,sid:0,rc:0,sent:0,seen:now(),vo:[],last:'',cs:0};
  S.iv=setInterval(()=>{ if(!S) return; if(!/^#\/antidisturbios/.test(location.hash)){ leave(); return; } if(S.conn&&S.conn.open){ send({y:'k'}); if(now()-S.seen>DROP&&!S.dropped) drop(); } },2000); return S; }
function pjErr(e){ const t=e&&e.type; return t==='peer-unavailable'?L('No hay ninguna sala abierta con ese código. Revisa el código o pide que creen otra sala.','There is no open room with that code. Check the code or ask for a new room.'):t==='browser-incompatible'?L('Este navegador no permite la conexión directa. Prueba con Chrome o Safari actualizados.','This browser does not support direct connections. Try an up-to-date Chrome or Safari.'):L('No se pudo conectar. Probad los dos con WiFi o con otra red.','Could not connect. Both of you try WiFi or another network.'); }
function host(tries){ tries=tries||0; const s=newS('h'); s.code=code(); lobby(); status(L('Abriendo la sala…','Opening the room…'));
  loadPJ().then(Peer=>{ if(S!==s) return; const p=new Peer(PFX+s.code,{config:ICE,debug:0}); s.peer=p;
    p.on('open',()=>{ if(S!==s) return; lobby(); });
    p.on('connection',c=>{ if(S!==s) return; if(s.conn&&!s.dropped){ c.on('open',()=>{ try{ c.send({y:'full'}); }catch(e){} setTimeout(()=>c.close(),500); }); return; }
      wire(c); status(L('Tu compañero está entrando…','Your partner is joining…')); s.to=setTimeout(()=>{ if(S===s&&s.st==='wait'){ try{ c.close(); }catch(e){} s.conn=null; status(L('Tu compañero no ha podido conectar. Probad los dos con WiFi o con otra red, y que vuelva a meter el código.','Your partner could not connect. Both of you try WiFi or another network, then have them enter the code again.'),'bad'); } },TMO);
      c.on('open',()=>{ if(S!==s) return; s.seen=now(); c.send({y:'hi',v:VER}); }); });
    p.on('error',e=>{ if(S!==s) return; if(e&&e.type==='unavailable-id'&&tries<4){ leave(true); host(tries+1); return; } if(s.inGame) return; status(pjErr(e),'bad'); }); })
  .catch(()=>{ if(S===s) status(L('No se pudo cargar la conexión. Revisa tu internet y vuelve a intentarlo.','The connection could not be loaded. Check your internet and try again.'),'bad'); }); }
function join(cc){ const s=newS('g'); s.code=cc; lobby(); status(L('Conectando con la sala ','Connecting to room ')+cc+'…');
  const fail=t=>{ if(S!==s||s.st!=='wait') return; const m=t||L('No se pudo conectar. Probad los dos con WiFi o con otra red.','Could not connect. Both of you try WiFi or another network.'); leave(true); home(m); };
  s.to=setTimeout(()=>fail(),TMO);
  loadPJ().then(Peer=>{ if(S!==s) return; const p=new Peer({config:ICE,debug:0}); s.peer=p;
    p.on('open',()=>{ if(S!==s) return; const c=p.connect(PFX+cc,{reliable:true,serialization:'json'}); wire(c); c.on('open',()=>{ s.seen=now(); }); });
    p.on('error',e=>{ if(S!==s) return; if(s.inGame) return; fail(pjErr(e)); }); })
  .catch(()=>fail(L('No se pudo cargar la conexión. Revisa tu internet y vuelve a intentarlo.','The connection could not be loaded. Check your internet and try again.'))); }
export function open(api,cc,ver){ A=api; VER=ver||'1'; css(); if(window) window.MAT_AD_COOP=()=>S; cc=clean(cc); if(cc&&cc.length>=4) join(cc); else home(); }
