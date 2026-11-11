/* M.A.T — «Crea tu soldado» (#/soldado). Calculadora de carga del combatiente con equipo real y estimación de movilidad SOLO con fuentes publicadas.
   Pesos: fichas de fabricantes / documentos oficiales y anexo D del informe del Ejército de EE. UU. «The Modern Warrior's Combat Load» (2003).
   Umbrales: ATP 3-21.18 (2017) tabla 3-4 y FM 21-18 (1990). Gasto energético: ecuación de Pandolf, Givoni y Goldman (1977). Nada inventado: sin dato publicado, sin cifra. */
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(x,d)=>Number(x).toLocaleString(EN()?'en-GB':'es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
const kg=x=>nf(x,1)+' kg';
const LBKG=0.45359237;

/* Francotirador: ni el informe de 2003 ni otra fuente publicada que hayamos encontrado dan la carga total medida de un francotirador.
   Equipo elegido por M.A.T SOLO con objetos que ya tienen peso con fuente en esta página y en el Armero (AWM: ficha; visor y bípode: fabricantes). */
const TIR={id:'tirador',mat:1,n:['Francotirador','Sniper'],arma:{id:'awm',on:{optic:'pm2_525',bipod:'bipod'}},
  sel:[{uni:1,boots:1,knee:1,gog:1,iba:1,ach:1,m9p:1,m9mag:2,m144:1,gvs5:1,pvs14:1,prc148:1,comp:1,cant:2,hyd:1,water:3,mtool:1},
       {uni:1,boots:1,knee:1,gog:1,iba:1,ach:1,m9p:1,m9mag:2,m144:1,gvs5:1,pvs14:1,prc148:1,comp:1,cant:2,hyd:1,water:5,mtool:1,apack:1,mre:2,poncho:1,pliner:1},
       {uni:1,boots:1,knee:1,gog:1,iba:1,ach:1,m9p:1,m9mag:2,m144:1,gvs5:1,pvs14:1,prc148:1,comp:1,cant:2,hyd:1,water:5,mtool:1,apack:1,mre:4,poncho:1,pliner:1,ruck:1,sbag:1,pad:1}],
  miss:['Munición .338 Lapua Magnum y cargadores del AWM, y el traje ghillie: no tenemos un peso publicado con fuente, así que no se suman.','.338 Lapua Magnum ammunition and AWM magazines, and the ghillie suit: we have no published, sourced weight, so they are not added.']};
const RL=id=>(DATA&&DATA.roles.find(x=>x.id===id))||(id==='tirador'?TIR:null);
let CARD=null; const card=()=>CARD?Promise.resolve(CARD):import('./soldado_card.js?v='+VER).then(m=>CARD=m);
const b64e=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const b64d=t=>JSON.parse(decodeURIComponent(escape(atob(t.replace(/-/g,'+').replace(/_/g,'/')))));
let DATA=null, ARM=null, ACTIVE3D=null;
const CSS=`
.sd-wrap{display:grid;grid-template-columns:minmax(0,1fr);gap:14px}
@media(min-width:980px){.sd-wrap{grid-template-columns:minmax(0,1.25fr) minmax(0,1fr)}.sd-side{position:sticky;top:10px;align-self:start}}
.sd-card{border:1px solid var(--line,#2c333b);border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.025);margin-bottom:12px}
.sd-card h2{font-size:17px;margin:0 0 8px}.sd-card h3{font-size:14px;margin:12px 0 6px;opacity:.9}
.sd-in{display:flex;gap:10px;flex-wrap:wrap}.sd-in label{flex:1 1 130px;font-size:13px;opacity:.9}.sd-in input,.sd-in select{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:9px 10px;border-radius:8px;border:1px solid var(--line,#3a424c);background:rgba(0,0,0,.25);color:inherit;font-size:16px}
.sd-chips{display:flex;flex-wrap:wrap;gap:6px}.sd-chip{border:1px solid var(--line,#3a424c);background:rgba(255,255,255,.04);color:inherit;border-radius:999px;padding:7px 12px;font-size:13px;cursor:pointer}
.sd-chip.on{background:#4f6a36;border-color:#7e9c5a;color:#fff}.sd-chip[disabled]{opacity:.45;cursor:not-allowed}
.sd-it{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid rgba(255,255,255,.06)}.sd-it:first-child{border-top:0}
.sd-it .nm{flex:1;min-width:0;font-size:14px}.sd-it .nm small{display:block;opacity:.7;font-size:12px;margin-top:2px}.sd-it .nm small a{opacity:.95}
.sd-it .w{font-size:13px;white-space:nowrap;opacity:.9;text-align:right;min-width:62px}
.sd-q{display:flex;align-items:center;gap:4px}.sd-q button{width:30px;height:30px;border-radius:8px;border:1px solid var(--line,#3a424c);background:rgba(255,255,255,.05);color:inherit;font-size:17px;line-height:1;cursor:pointer}
.sd-q span{min-width:20px;text-align:center;font-weight:600}.sd-it.on .nm{font-weight:600}
.sd-tot{font-size:30px;font-weight:700;line-height:1.1}.sd-pct{font-size:15px;margin-top:2px}
.sd-bar{position:relative;height:16px;border-radius:8px;overflow:hidden;display:flex;margin:10px 0 4px}.sd-bar i{display:block;height:100%}
.sd-mk{position:absolute;top:-4px;width:3px;height:24px;background:#fff;border-radius:2px;box-shadow:0 0 0 1px #000}
.sd-scale{display:flex;justify-content:space-between;font-size:11px;opacity:.75}
.sd-band{margin-top:8px;padding:8px 10px;border-radius:8px;font-size:14px}
.sd-row{display:flex;justify-content:space-between;gap:10px;padding:5px 0;border-top:1px solid rgba(255,255,255,.06);font-size:14px}.sd-row:first-child{border-top:0}.sd-row b{white-space:nowrap}
.sd-src{font-size:12px;opacity:.75;margin-top:6px;line-height:1.45}.sd-src a{word-break:break-word}
.sd-est{display:inline-block;font-size:11px;padding:2px 7px;border-radius:6px;background:rgba(181,154,43,.18);border:1px solid rgba(181,154,43,.5);margin-bottom:6px}
.sd-btn{display:inline-block;border:0;border-radius:10px;padding:11px 16px;font-size:15px;font-weight:600;background:#4f6a36;color:#fff;cursor:pointer;margin:4px 6px 4px 0}
.sd-btn.sec{background:rgba(255,255,255,.08);color:inherit;border:1px solid var(--line,#3a424c)}
.sd-stage{position:relative;width:100%;height:min(78vh,620px);min-height:380px;border-radius:12px;background:radial-gradient(ellipse at 50% 35%,#3e464e,#1b1f24 70%);box-shadow:inset 0 0 80px rgba(0,0,0,.4);overflow:hidden;touch-action:none;margin-bottom:8px}
.sd-stage canvas{display:block;width:100%;height:100%}.sd-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;opacity:.85;text-align:center;padding:20px}
.sd-stage .arm-btns{position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:2}.sd-stage .arm-btns button{background:rgba(20,22,24,.75);color:#e8eaec;border:1px solid #444b52;border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer}
.sd-role{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;margin-top:8px;font-size:14px}
.sd-role ul{margin:6px 0 0 18px;padding:0;font-size:12px;opacity:.85}
details.sd-d summary{cursor:pointer;font-size:13px;opacity:.9;margin-top:6px}
.sd-warn{font-size:12px;opacity:.8;margin-top:4px}
.sd-wp{display:flex;gap:10px;align-items:center}.sd-wp img{width:120px;height:48px;object-fit:contain;border-radius:6px;background:#20252b}
.sd-cam{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.sd-cam button{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer}.sd-cam button.on{border-color:#fff}

.sdx-cat{border-top:1px solid rgba(255,255,255,.08)}.sdx-cat:first-child{border-top:0}.sdx-cat>summary{display:flex;align-items:center;gap:8px;min-height:46px;cursor:pointer;list-style:none;padding:4px 0}.sdx-cat>summary::-webkit-details-marker{display:none}.sdx-cat>summary::before{content:'▸';flex:none;width:14px;opacity:.7;transition:transform .15s}.sdx-cat[open]>summary::before{transform:rotate(90deg)}.sdx-cat>summary h3{flex:1;min-width:0;margin:0!important}.sdx-cs{flex:none;font-size:12px;opacity:.75;white-space:nowrap;border:1px solid var(--line,#3a424c);border-radius:999px;padding:2px 9px}.sdx-cs.on{opacity:1;background:#4f6a36;border-color:#7e9c5a;color:#fff}.sdx-cat[open]{padding-bottom:6px}.sdx-bar{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;gap:10px;margin:0 0 12px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));border:1px solid var(--line,#2c333b);border-radius:12px;background:rgba(11,12,13,.94);backdrop-filter:blur(4px)}.sdx-bl{flex:1;min-width:0;font-size:13px;line-height:1.3}.sdx-bl small{display:block;opacity:.7;font-size:11px;text-transform:uppercase;letter-spacing:.04em}.sdx-bl b{font-size:17px}.sdx-bar .sd-btn{margin:0;flex:none}@media(min-width:980px){.sdx-bar{display:none}}
.sd-gh{margin-top:10px;display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap}.sd-gh canvas{flex:none;width:132px;height:176px;border-radius:10px;background:#20262b}.sd-gh>.sd-figw{position:relative;flex:none;width:132px;height:176px;min-width:0}.sd-figw #sdface{position:absolute;right:3px;bottom:3px;width:74px;height:74px;border-radius:50%;background:transparent}.sd-gh>div{flex:1 1 170px;min-width:0}.sd-gh .sd-chip i{display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:-1px;margin-right:5px;border:1px solid rgba(255,255,255,.35)}
.sd-shp{margin-top:10px;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px}.sd-shp img{display:block;width:100%;max-width:360px;height:auto;border-radius:10px;margin:0 auto 8px;background:#14181b}.sd-shp label{display:flex;gap:8px;align-items:center;font-size:13px;margin:6px 0}.sd-shp label input{width:18px;height:18px}.sd-shp a.sd-btn{text-decoration:none}
`;
function css(){ if(!document.getElementById('sd-css')){ const s=document.createElement('style'); s.id='sd-css'; s.textContent=CSS; document.head.appendChild(s); } }
function data(){ return DATA?Promise.resolve(DATA):fetch('soldado.json?v='+VER).then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(d=>DATA=d); }
function arm(){ return ARM?Promise.resolve(ARM):import('./armero.js?v='+VER).then(m=>ARM=m); }
const KEY='mat_soldado';
/* categorías de equipo plegables (solo interfaz): cuáles están abiertas */
const SDX_KEY='mat_sd_ui'; const SDX_OPEN=new Set((()=>{ try{ const u=JSON.parse(localStorage.getItem(SDX_KEY)||'{}'); return Array.isArray(u.open)?u.open:[]; }catch(e){ return []; } })());
function sdxSave(){ try{ localStorage.setItem(SDX_KEY,JSON.stringify({open:[...SDX_OPEN]})); }catch(e){} }
function loadSt(){ let s=null; try{ s=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
  return Object.assign({h:175,kg:80,role:null,lvl:0,q:{},arma:null,camo:'od',v:4,terr:0,g:0},s||{}); }
function saveSt(st){ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} try{ window.MAT_MED&&window.MAT_MED.event('soldado.equipo',{role:st.role,arma:!!st.arma,lvl:st.lvl}); }catch(_){} }
/* peso del arma: ficha M.A.T + accesorios con peso publicado (las culatas sustituyen a la de serie y no se suman, como en el Armero) */
export function weaponInfo(M,b){ if(!M||!b) return null; const w=M.W.find(x=>x.id===b.id); if(!w) return null; const v=w.V[Math.min(b.v||0,w.V.length-1)];
  const acc=Object.entries(b.on||{}).map(([s,a])=>M.ACC[a]).filter(Boolean); const addG=acc.filter(x=>x.slot!=='stock').reduce((s,x)=>s+(x.g||0),0);
  return {w,v,acc,addG,kg:v.w!=null?v.w+addG/1000:null}; }
function totals(st){ const D=DATA; let g=0; const rows=[];
  for(const [id,q] of Object.entries(st.q)){ const it=D.items[id]; if(!it||!q) continue; g+=it.g*q; rows.push([id,q,it.g*q]); }
  let wk=null, wi=null; if(st.arma&&ARM){ wi=weaponInfo(ARM,st.arma); if(wi&&wi.kg!=null) wk=wi.kg; }
  const tot=g/1000+(wk||0); return {tot,gear:g/1000,wk,wi,rows}; }
function band(p){ const B=DATA.bands; for(const b of B){ if(b.max==null||p<=b.max) return b; } return B[B.length-1]; }
/* Pandolf, Givoni y Goldman (1977): M = 1,5·W + 2,0·(W+L)·(L/W)² + η·(W+L)·(1,5·V² + 0,35·V·G)   [W] */
export function pandolf(W,Lk,V,G,eta){ return 1.5*W+2.0*(W+Lk)*Math.pow(Lk/W,2)+eta*(W+Lk)*(1.5*V*V+0.35*V*G); }
let ctxG=null;
export function route(app,ctx,p){ css(); ctxG=ctx; stop3d();
  ctx.set('<p class="sub" style="padding:30px 0">'+L('Cargando…','Loading…')+'</p>',L('Crea tu soldado','Build your soldier'));
  data().then(()=>{ if(!/^#\/soldado/.test(location.hash)) return; page(app,ctx); }).catch(()=>{ ctx.set(ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Crea tu soldado','Build your soldier')]])+'<p class="sub">'+L('No se pudo cargar. Comprueba la conexión.','Could not load. Check your connection.')+'</p>'); });
}
let EQN=0, EQBUSY=false; function stop3d(){ EQN++; EQBUSY=false; if(ACTIVE3D){ try{ ACTIVE3D.destroy(); }catch(e){} ACTIVE3D=null; } }
function page(app,ctx){
  const D=DATA; const st=loadSt();
  const sv=new URLSearchParams((location.hash.split('?')[1]||''));
  const pre=sv.get('arma');
  const itemsByCat=c=>D.order.filter(id=>D.items[id]&&D.items[id].c===c);
  const single=new Set(D.cats.filter(c=>c[2]).map(c=>c[0]));
  let h=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Juegos','Games'),'#/juegos'],[L('Crea tu soldado','Build your soldier')]])+
   '<h1>'+L('Crea tu soldado','Build your soldier')+'</h1><p class="sub">'+L('Pon tu altura y tu peso, elige un rol o equipo real (chaleco, placas, casco, mochila, munición y un arma del Armero 3D) y mira cuánto pesa todo, qué porcentaje de tu peso supone y cómo afecta a la movilidad según la doctrina y los estudios publicados. Pulsa «Equipar» para verlo en 3D.','Enter your height and weight, choose a role or real gear (vest, plates, helmet, pack, ammunition and a weapon from the 3D Gunsmith) and see the total load, what share of your body weight it is and how it affects mobility according to published doctrine and studies. Press “Equip” to see it in 3D.')+'</p>'+
   '<div class="sd-wrap"><div class="sd-main">'+
   '<div class="sd-card"><h2>'+L('1 · Tus datos','1 · About you')+'</h2><div class="sd-in"><label>'+L('Altura (cm)','Height (cm)')+'<input id="sdh" type="number" inputmode="numeric" min="140" max="215" value="'+st.h+'"></label><label>'+L('Peso corporal (kg)','Body weight (kg)')+'<input id="sdkg" type="number" inputmode="decimal" min="40" max="160" step="0.5" value="'+st.kg+'"></label></div><div class="sd-warn">'+L('Solo se usan en tu navegador; no se envían a ningún sitio.','Only used in your browser; nothing is sent anywhere.')+'</div></div>'+
   '<div class="sd-card"><h2>'+L('2 · Rol (cargas medidas en combate)','2 · Role (loads measured in combat)')+'</h2><div class="sd-chips" id="sdroles">'+D.roles.map(r=>'<button type="button" class="sd-chip" data-r="'+r.id+'">'+esc(LL(r.n))+'</button>').join('')+'<button type="button" class="sd-chip" data-r="tirador">'+L('Francotirador','Sniper')+'</button><button type="button" class="sd-chip" data-r="">'+L('Libre','Custom')+'</button></div><div id="sdrole"></div></div>'+
   '<div class="sd-card"><h2>'+L('3 · Arma principal (del Armero 3D)','3 · Primary weapon (from the 3D Gunsmith)')+'</h2><div id="sdarma"><p class="sd-warn">'+L('Cargando armas…','Loading weapons…')+'</p></div></div>'+
   '<div class="sd-card"><h2>'+L('4 · Equipo','4 · Gear')+'</h2><p class="sd-warn">'+L('Cada peso lleva su fuente. Toca + / − para añadir o quitar.','Every weight carries its source. Tap + / − to add or remove.')+' '+L('Toca una categoría para abrirla.','Tap a category to open it.')+'</p><div id="sdgear"></div></div>'+
   '<div class="sdx-bar" id="sdxbar"></div></div><div class="sd-side"><div class="sd-card" id="sdres"></div><div class="sd-card" id="sdmov"></div>'+
   '<div class="sd-card"><button type="button" class="sd-btn" id="sdeq">'+L('Equipar (ver en 3D)','Equip (view in 3D)')+'</button><button type="button" class="sd-btn" id="sdsh">'+L('Compartir','Share')+'</button><button type="button" class="sd-btn sec" id="sdclr">'+L('Vaciar','Clear')+'</button><div id="sdshare"></div><div id="sd3d"></div></div>'+
   '</div></div><div class="sd-card" id="sdsrc"></div>';
  ctx.set(h,L('Crea tu soldado','Build your soldier'));
  /* precarga del 3D en segundo plano (no con «ahorro de datos») */
  { const cn=navigator.connection; if(!(cn&&(cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'')))){ const go=()=>{ if(!document.getElementById('sdeq')) return; Promise.all([arm(),import('./soldado3d.js?v='+VER)]).then(([,S3])=>{ S3.prefetch&&S3.prefetch(); }).catch(()=>{}); }; (window.requestIdleCallback||((f)=>setTimeout(f,1200)))(go,{timeout:2500}); } }
  const $=id=>document.getElementById(id);
  let SHOPEN=false, SHHW=false, SHF=null, SHU=null, SHTOK=0, SHT=null;
  function shareURL(){ const a=st.arma?{id:st.arma.id,v:st.arma.v||0,on:st.arma.on||{},camo:st.arma.camo||'orig',ca:!!st.arma.ca}:null; return location.origin+location.pathname+'#/soldado?s='+b64e({r:st.role||'',l:st.lvl||0,q:st.q,a,g:st.role==='tirador'?(st.gh||''):''}); }
  function shareData(){ const r=RL(st.role), T=totals(st), bw=+st.kg||0, pct=bw?T.tot/bw*100:null, b=pct!=null?band(pct):null, wi=T.wi;
    const lvn=[L('Carga de combate','Fighting load'),L('Marcha de aproximación','Approach march'),L('Marcha de emergencia','Emergency march')];
    const items=T.rows.slice().sort((p,q)=>q[2]-p[2]).map(([id,q,g])=>[LL(D.items[id].n)+(q>1?' ×'+q:''),g/1000]);
    const mob=[]; const lb=T.tot/LBKG; if(lb>40){ const over=(lb-40)/10; mob.push([L('Distancia en 6 h','Distance in 6 h'),nf(2*over,1)+L(' km menos',' km less')],[L('Pista de asalto','Assault course'),'+'+nf(15*over,0)+' %']); } else mob.push([L('Penalización FM 21-18','FM 21-18 penalty'),L('ninguna','none')]);
    if(bw>0){ const V=(+st.v||0)/3.6, eta=D.pandolf.eta[st.terr]?D.pandolf.eta[st.terr][2]:1, G=+st.g||0, M=pandolf(bw,T.tot,V,G,eta), M0=pandolf(bw,0,V,G,eta); mob.push([L('Gasto a ','Cost at ')+nf(+st.v||0,1)+' km/h','≈ '+nf(M,0)+' W'],[L('Aumento por la carga','Increase from load'),'+'+nf((M/M0-1)*100,0)+' %']); }
    return {role:r?LL(r.n):L('Libre','Custom'), lvl:r?lvn[st.lvl]||'':L('Equipo a tu medida','Your own kit'), gh:st.role==='tirador'?st.gh:null, wName:wi?wi.w.n+(wi.w.V.length>1&&wi.v.lab?' · '+LL(wi.v.lab):''):'', wKg:wi?wi.kg:null, wImg:wi?'m3d/armero/'+(wi.w.img||wi.w.id)+'.jpg?v='+VER:null,
      tot:T.tot, pct, band:b?{n:LL(b.n),c:b.c}:null, bands:D.bands, items, mob, hw:SHHW&&bw?{h:+st.h||0,kg:bw}:null, fig:figOpts()}; }
  function shareText(d){ const g=d.gh&&CARD?CARD.ghById(d.gh):null; return L('Mi soldado en M.A.T: ','My soldier on M.A.T: ')+d.role+(g?' ('+(EN()?String(LL(g[1])).toLowerCase()+' ghillie':'ghillie de '+String(LL(g[1])).toLowerCase())+')':'')+' · '+kg(d.tot)+(d.pct!=null?' ('+nf(d.pct,0)+' % '+L('de su peso','of body weight')+')':'')+(d.wName?' · '+d.wName:'')+'. '+L('Crea el tuyo: ','Build yours: ')+shareURL(); }
  function shareOpen(first){ clearTimeout(SHT); const box=$('sdshare'); if(!box) return; if(first) box.innerHTML='<div class="sd-shp"><p class="sd-warn">'+L('Creando la tarjeta…','Creating the card…')+'</p></div>';
    SHT=setTimeout(()=>{ const tok=++SHTOK; const d=shareData(); Promise.all([card(),arm().catch(()=>null)]).then(([M])=>M.renderCard(d)).then(cv=>new Promise(res=>cv.toBlob(b=>res(b),'image/png'))).then(blob=>{ if(tok!==SHTOK||!SHOPEN||!document.getElementById('sdshare')) return; if(!blob) throw new Error('blob');
      if(SHU) try{ URL.revokeObjectURL(SHU); }catch(e){} SHU=URL.createObjectURL(blob); try{ SHF=new File([blob],'mat-soldado.png',{type:'image/png'}); }catch(e){ SHF=null; }
      let can=false; try{ can=!!(SHF&&navigator.canShare&&navigator.share&&navigator.canShare({files:[SHF]})); }catch(e){}
      const txt=shareText(d);
      $('sdshare').innerHTML='<div class="sd-shp"><img id="sdshimg" src="'+SHU+'" alt="'+L('Tarjeta de tu soldado','Your soldier card')+'" width="1080" height="1350"><label><input type="checkbox" id="sdshhw"'+(SHHW?' checked':'')+'>'+L('Poner mi altura y mi peso en la tarjeta','Show my height and weight on the card')+'</label>'+
        '<div>'+(can?'<button type="button" class="sd-btn" id="sdshgo">'+L('Enviar imagen (WhatsApp…)','Send image (WhatsApp…)')+'</button>':'')+'<a class="sd-btn'+(can?' sec':'')+'" id="sdshdl" href="'+SHU+'" download="mat-soldado.png">'+L('Descargar imagen','Download image')+'</a><a class="sd-btn sec" id="sdshwa" href="https://wa.me/?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener">'+L('Compartir por WhatsApp','Share on WhatsApp')+'</a><button type="button" class="sd-btn sec" id="sdshcp">'+L('Copiar enlace','Copy link')+'</button></div>'+
        '<p class="sd-warn">'+L('La tarjeta se hace en tu navegador y no se sube a ningún sitio. Por defecto no lleva tu altura ni tu peso, solo el %. El enlace abre este mismo soldado.','The card is made in your browser and is not uploaded anywhere. By default it does not show your height or weight, only the %. The link opens this same soldier.')+(can?'':' '+L('En el móvil, descarga la imagen y mándala por WhatsApp, o usa el botón de WhatsApp para enviar el enlace.','On a phone, download the image and send it on WhatsApp, or use the WhatsApp button to send the link.'))+'</p></div>';
      void txt; }).catch(e=>{ console.warn('tarjeta',e); const b=$('sdshare'); if(b&&tok===SHTOK) b.innerHTML='<div class="sd-shp"><p class="sd-warn">'+L('No se pudo crear la imagen en este navegador. Puedes enviar el enlace:','The image could not be created in this browser. You can send the link:')+'</p><a class="sd-btn sec" href="https://wa.me/?text='+encodeURIComponent(shareText(d))+'" target="_blank" rel="noopener">'+L('Compartir por WhatsApp','Share on WhatsApp')+'</a><button type="button" class="sd-btn sec" id="sdshcp">'+L('Copiar enlace','Copy link')+'</button></div>'; }); },first?0:350); }
  function shareNative(){ if(!SHF||!navigator.share) return; const d=shareData(); navigator.share({files:[SHF],title:'M.A.T — '+L('Crea tu soldado','Build your soldier'),text:shareText(d)}).catch(()=>{}); }
  function gearHTML(){ return D.cats.map(c=>{ const ids=itemsByCat(c[0]); if(!ids.length) return ''; const nOn=ids.reduce((a,id)=>a+(st.q[id]||0),0), gOn=ids.reduce((a,id)=>a+(st.q[id]||0)*D.items[id].g,0); return '<details class="sdx-cat" data-c="'+esc(c[0])+'"'+(SDX_OPEN.has(c[0])?' open':'')+'><summary><h3>'+esc(LL(c[1]))+(c[2]?' <small style="opacity:.6">'+L('(uno)','(one)')+'</small>':'')+'</h3><span class="sdx-cs'+(nOn?' on':'')+'">'+(nOn?nOn+' · '+kg(gOn/1000):ids.length+' '+(ids.length===1?L('opción','option'):L('opciones','options')))+'</span></summary>'+ids.map(id=>{ const it=D.items[id], q=st.q[id]||0, src=LL(it.src)||[];
    const blocked=(c[0]==='plate'&&st.q.iba&&id!=='side');
    return '<div class="sd-it'+(q?' on':'')+'" data-i="'+id+'"><div class="nm">'+esc(LL(it.n))+(it.nij?' <i style="opacity:.7">· '+esc(LL(it.nij))+'</i>':'')+'<small>'+(it.unit?nf(it.g/1000,1)+' kg/'+LL(it.unit):fmtG(it.g))+(it.note?' · '+esc(LL(it.note)):'')+(blocked?' · '+L('el chaleco IBA ya incluye 2 placas SAPI','the IBA vest already includes 2 SAPI plates'):'')+' · '+src.slice(0,1).map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+L('fuente','source')+'</a>').join('')+'</small></div><div class="w">'+(q?kg(it.g*q/1000):'')+'</div><div class="sd-q"><button type="button" data-m="-1" aria-label="−">−</button><span>'+q+'</span><button type="button" data-m="1" aria-label="+"'+(blocked?' disabled':'')+'>+</button></div></div>'; }).join('')+'</details>'; }).join(''); }
  function fmtG(g){ return g>=1000?nf(g/1000,2)+' kg':nf(g,0)+' g'; }
  function tirHTML(r){ const G=CARD?CARD.GHO:null;
    return '<div class="sd-role"><b>'+L('Selección de M.A.T — no hay carga medida publicada para este rol','M.A.T selection — no measured load has been published for this role')+'</b>'+
     '<div class="sd-src">'+L('El informe «The Modern Warrior\'s Combat Load» (Ejército de EE. UU., 2003), del que salen las cargas de los demás roles, no midió francotiradores, y no hemos encontrado otra fuente publicada con la carga total de un francotirador. Por eso abajo se carga un equipo elegido por M.A.T solo con objetos que ya tienen peso publicado, cada uno con su fuente: el fusil Accuracy International AWM del Armero con visor Schmidt & Bender PM II 5–25×56 y bípode Harris, el telescopio de observación M144, el telémetro láser GVS-5, visor nocturno, radio, pistola M9 y el equipo básico del fusilero. Es un ejemplo para comparar, no una carga medida.','The “The Modern Warrior\'s Combat Load” report (US Army, 2003), where the other roles\' loads come from, did not measure snipers, and we found no other published source with a sniper\'s total load. So below M.A.T loads a kit it chose using only items that already have a published weight, each with its source: the Accuracy International AWM rifle from the Gunsmith with a Schmidt & Bender PM II 5–25×56 scope and a Harris bipod, the M144 spotting scope, the GVS-5 laser rangefinder, night vision, radio, M9 pistol and the rifleman\'s basic gear. It is an example to compare, not a measured load.')+' '+esc(LL(r.miss))+'</div>'+
     '<div class="sd-gh"><canvas id="sdghc" width="264" height="352" aria-label="'+L('Vista previa del traje ghillie','Ghillie suit preview')+'"></canvas><div><h3 style="margin-top:0">'+L('Traje ghillie (solo francotirador)','Ghillie suit (sniper only)')+'</h3><div class="sd-chips" id="sdgh">'+
     (G?G.map(g=>'<button type="button" class="sd-chip'+(st.gh===g[0]?' on':'')+'" data-gh="'+g[0]+'" aria-pressed="'+(st.gh===g[0])+'"><i style="background:'+g[2]+'"></i>'+esc(LL(g[1]))+'</button>').join(''):'')+
     '<button type="button" class="sd-chip'+(!st.gh?' on':'')+'" data-gh="">'+L('Sin ghillie','No ghillie')+'</button></div>'+
     '<div class="sd-src">'+L('Elige el camuflaje según el terreno: bosque, montaña o terreno árido, nieve o desierto. Pulsa «Equipar» para verlo en 3D. Dibujo y modelo hechos por M.A.T, orientativos. Peso del ghillie: no hemos encontrado un peso publicado con fuente, así que no se suma.','Pick the camouflage for the terrain: woodland, mountain or arid ground, snow or desert. Press “Equip” to see it in 3D. Drawing and model made by M.A.T, for illustration. Ghillie weight: we found no published, sourced weight, so it is not added.')+'</div></div></div></div>'; }
  function drawGh(){ const c=$('sdghc'); if(!c) return; card().then(M=>{ if(!document.getElementById('sdghc')) return; if(!$('sdgh').querySelector('[data-gh="bosque"]')){ $('sdrole').innerHTML=roleHTML(); } const cv=$('sdghc'); const x=cv.getContext('2d'); x.clearRect(0,0,cv.width,cv.height);
    const g=M.ghById(st.gh); const bg={bosque:['#33402a','#1e261a'],montana:['#5a564b','#2e2b25'],nieve:['#c9d3d8','#7e8a90'],desierto:['#a88c62','#5c4a31']}[g?g[0]:''] || ['#323a40','#1a1f23']; const gr=x.createLinearGradient(0,0,0,cv.height); gr.addColorStop(0,bg[0]); gr.addColorStop(1,bg[1]); x.fillStyle=gr; x.fillRect(0,0,cv.width,cv.height);
    M.drawSoldier(x,cv.width/2,18,cv.height-30,figOpts()); }).catch(()=>{}); }
  function figOpts(){ const q=st.q, has=k=>(q[k]||0)>0, wi=ARM&&st.arma?weaponInfo(ARM,st.arma):null; const kd=wi?String(LL(wi.w.kind)||''):'';
    const wk=!wi?null:(/francotirador|sniper|antimaterial|anti-materiel/i.test(kd)?'sniper':/ametralladora|machine gun/i.test(kd)?'mg':/pistola|pistol/i.test(kd)?'pistol':/combate|battle|tirador|marksman|semiautom/i.test(kd)?'long':'carbine');
    return {gh:st.role==='tirador'?st.gh:null, helmet:['ach','ihps','fast','pasgt'].some(has), vest:has('iba')||Object.keys(q).some(k=>q[k]>0&&D.items[k]&&(D.items[k].c==='vest'||D.items[k].c==='plate')), pack:has('ruck')?2:has('apack')?1:0, wkind:wk, scope:!!(st.arma&&st.arma.on&&st.arma.on.optic)}; }
  function roleHTML(){ const r=RL(st.role); if(!r){ return '<p class="sd-warn">'+L('Elige un rol para cargar un equipo típico medido en el informe, o monta el tuyo libremente abajo.','Choose a role to load a typical kit measured in the report, or build your own freely below.')+'</p>'; }
    const lv=[[L('Carga de combate','Fighting load'),0],[L('Marcha de aproximación','Approach march'),1],[L('Marcha de emergencia','Emergency march'),2]];
    if(r.mat) return '<div class="sd-chips" style="margin-top:8px">'+lv.filter(x=>r.sel[x[1]]).map(x=>'<button type="button" class="sd-chip'+(st.lvl===x[1]?' on':'')+'" data-l="'+x[1]+'">'+x[0]+'</button>').join('')+'</div>'+tirHTML(r);
    const t=r.tot[st.lvl];
    return '<div class="sd-chips" style="margin-top:8px">'+lv.filter(x=>r.sel[x[1]]).map(x=>'<button type="button" class="sd-chip'+(st.lvl===x[1]?' on':'')+'" data-l="'+x[1]+'">'+x[0]+'</button>').join('')+'</div>'+
     '<div class="sd-role">'+(t?'<b>'+L('Medido en el informe','Measured in the report')+': '+kg(t.kg)+'</b> ('+nf(t.lb,1)+' lb) · '+nf(t.pct,1)+' % '+L('del peso corporal medio de ese grupo','of that group\'s average body weight'):'')+
     '<div class="sd-src">'+L('Media medida a paracaidistas de la 82.ª División Aerotransportada (Afganistán, 2003), rol «','Average measured on 82nd Airborne paratroopers (Afghanistan, 2003), role “')+esc(r.name_src)+L('». ','”. ')+'<a href="'+esc(D.tfd.src[1])+'" target="_blank" rel="noopener">'+L('Informe «The Modern Warrior\'s Combat Load» (Ejército de EE. UU., 2003)','“The Modern Warrior\'s Combat Load” report (US Army, 2003)')+'</a>, '+esc(r.page)+'.</div>'+
     '<div class="sd-src">'+L('Abajo se carga una selección aproximada de M.A.T con los objetos de esa lista que tienen peso publicado; por eso tu total puede salir menor que el medido (faltan objetos pequeños sin peso por unidad).','Below, M.A.T loads an approximate selection with the items from that list that have a published weight, so your total can be lower than the measured one (small items without a per-unit weight are missing).')+(r.miss?' '+esc(LL(r.miss)):'')+'</div>'+
     '<details class="sd-d"><summary>'+L('Lista original del informe (en inglés)','Original list from the report')+'</summary>'+[['A',L('Sobre el cuerpo','Worn on the body')],['B',L('En el chaleco / portaequipo','On the vest / load carrier')],['C',L('Mochila de asalto','Assault pack')],['D',L('Mochila principal','Main rucksack')]].map(([k,t])=>(r.list[k]&&r.list[k].length&&(k<'C'||st.lvl>=(k==='C'?1:2)))?'<b style="font-size:12px">'+t+'</b><ul>'+r.list[k].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'').join('')+'</details></div>'; }
  function applyRole(){ const r=RL(st.role); if(!r) return; let lvl=st.lvl; if(!r.sel[lvl]) lvl=st.lvl=0; st.q=Object.assign({},r.sel[lvl]); st.arma=JSON.parse(JSON.stringify(Object.assign({v:0,camo:'orig',ca:false},r.arma))); if(r.id==='tirador'&&st.gh===undefined) st.gh='bosque'; }
  function armaHTML(){ if(!ARM) return '<p class="sd-warn">'+L('Cargando armas…','Loading weapons…')+'</p>';
    const lb=ARM.lastBuild&&ARM.lastBuild(); const wi=weaponInfo(ARM,st.arma);
    let h='<label class="sd-in" style="display:block"><select id="sdw"><option value="">'+L('— Sin arma principal —','— No primary weapon —')+'</option>'+ARM.W.map(w=>'<option value="'+w.id+'"'+(st.arma&&st.arma.id===w.id?' selected':'')+'>'+esc(w.n)+'</option>').join('')+'</select></label>';
    if(lb&&ARM.W.find(w=>w.id===lb.id)) h+='<button type="button" class="sd-chip" id="sdlast" style="margin-top:8px">'+L('Usar mi último montaje del Armero','Use my last Gunsmith build')+': '+esc(ARM.W.find(w=>w.id===lb.id).n)+(Object.keys(lb.on||{}).length?' + '+Object.keys(lb.on).length+' '+L('acc.','acc.'):'')+'</button>';
    if(wi){ h+='<div class="sd-wp" style="margin-top:8px"><img src="m3d/armero/'+(wi.w.img||wi.w.id)+'.jpg?v='+VER+'" alt="" loading="lazy"><div style="font-size:14px"><b>'+esc(wi.w.n)+'</b>'+(wi.w.V.length>1?' · '+esc(LL(wi.v.lab||'')):'')+'<br>'+(wi.kg!=null?kg(wi.kg)+' <span class="sd-warn">('+L('ficha','data sheet')+(wi.addG?' + '+fmtG(wi.addG)+' '+L('accesorios','accessories'):'')+')</span>':'<span class="sd-warn">'+L('Sin peso único publicado en la ficha: no se suma.','No single published weight in the data sheet: not added.')+'</span>')+'<br>'+(wi.acc.length?'<span class="sd-warn">'+wi.acc.map(a=>esc(a.n)).join(', ')+'</span><br>':'')+'<a href="#/armero/'+wi.w.id+'?acc='+Object.values(st.arma.on||{}).join(',')+'">'+L('Cambiar accesorios en el Armero →','Change accessories in the Gunsmith →')+'</a></div></div>'; }
    return h; }
  function resHTML(){ const T=totals(st), bw=+st.kg||0, pct=bw?T.tot/bw*100:0, b=band(pct);
    const B=D.bands, max=90; let bar=''; let prev=0; B.forEach(x=>{ const to=x.max==null?max:x.max; bar+='<i style="width:'+((to-prev)/max*100)+'%;background:'+x.c+'"></i>'; prev=to; });
    const fl=48*LBKG, am=72*LBKG;
    return '<h2>'+L('Carga total','Total load')+'</h2><div class="sd-tot">'+kg(T.tot)+'</div><div class="sd-pct">'+(bw?'<b>'+nf(pct,1)+' %</b> '+L('de tu peso corporal','of your body weight')+' ('+kg(bw)+')':'')+'</div>'+
     '<div class="sd-bar">'+bar+'<span class="sd-mk" style="left:calc('+Math.min(99.5,pct/max*100)+'% - 1px)"></span></div><div class="sd-scale"><span>0 %</span><span>30 %</span><span>45 %</span><span>70 %</span><span>90 %</span></div>'+
     '<div class="sd-band" style="background:'+b.c+'33;border:1px solid '+b.c+'"><b>'+esc(LL(b.n))+'</b> — '+esc(LL(b.d))+'</div>'+
     '<div class="sd-src">'+L('Umbrales: ','Thresholds: ')+'<a href="'+esc(D.band_src[1])+'" target="_blank" rel="noopener">'+esc(LL([D.band_src[0],D.band_src_en[0]]))+'</a>. «'+esc(D.atp_quote)+'»</div>'+
     '<div style="margin-top:10px">'+
     '<div class="sd-row"><span>'+L('Equipo','Gear')+'</span><b>'+kg(T.gear)+'</b></div>'+
     '<div class="sd-row"><span>'+L('Arma principal','Primary weapon')+'</span><b>'+(T.wk!=null?kg(T.wk):(st.arma?L('sin peso publicado','no published weight'):'—'))+'</b></div>'+
     '<div class="sd-row"><span>'+L('Tope de carga de combate (FM 21-18)','Fighting load cap (FM 21-18)')+'</span><b>48 lb = '+kg(fl)+(T.tot>fl?' ⚠':' ✓')+'</b></div>'+
     '<div class="sd-row"><span>'+L('Tope de marcha de aproximación (FM 21-18)','Approach march cap (FM 21-18)')+'</span><b>72 lb = '+kg(am)+(T.tot>am?' ⚠':' ✓')+'</b></div>'+
     (bw?'<div class="sd-row"><span>'+L('30 % / 45 % / 70 % de tu peso','30 % / 45 % / 70 % of your weight')+'</span><b>'+nf(bw*.3,1)+' / '+nf(bw*.45,1)+' / '+nf(bw*.7,1)+' kg</b></div>':'')+
     '</div><div class="sd-src">'+L('FM 21-18 (1990), p. 2-7: «','FM 21-18 (1990), p. 2-7: “')+esc(D.fm_quote)+L('»','”')+' <a href="'+esc(D.fm_src[1])+'" target="_blank" rel="noopener">FM 21-18</a></div>'; }
  function movHTML(){ const T=totals(st), W=+st.kg||0, Lk=T.tot, V=(+st.v||0)/3.6, eta=D.pandolf.eta[st.terr]?D.pandolf.eta[st.terr][2]:1, G=+st.g||0;
    let h='<h2>'+L('Movilidad','Mobility')+'</h2><span class="sd-est">'+L('Estimación basada en publicaciones del Ejército de EE. UU. y en Pandolf et al. (1977)','Estimate based on US Army publications and Pandolf et al. (1977)')+'</span>';
    const lb=Lk/LBKG;
    h+='<h3>'+L('Reglas prácticas del FM 21-18 (figura 5-2)','FM 21-18 rules of thumb (Figure 5-2)')+'</h3>';
    if(lb>40){ const over=(lb-40)/10; h+='<div class="sd-row"><span>'+L('Distancia recorrida en 6 h','Distance marched in 6 h')+'</span><b>'+nf(2*over,1)+L(' km menos',' km less')+'</b></div><div class="sd-row"><span>'+L('Tiempo en pista de asalto','Assault course time')+'</span><b>+'+nf(15*over,0)+' %</b></div><div class="sd-src">'+L('Respecto a llevar 40 lb (18,1 kg). Regla del FM 21-18: la distancia recorrida en 6 horas baja 2 km por cada 10 lb por encima de 40 lb, y el tiempo en la pista de asalto sube un 15 % por cada 10 lb por encima de 40 lb. Con pendientes medias del 10 % la distancia se reduce a la mitad.','Compared with carrying 40 lb (18.1 kg). FM 21-18 rule: distance marched in 6 hours drops 2 km for every 10 lb over 40 lb, and assault-course time rises 15 % for every 10 lb over 40 lb. On average gradients of 10 % distance is halved.')+'</div>'; }
    else h+='<p class="sd-warn">'+L('Por debajo de 40 lb (18,1 kg) el FM 21-18 no da penalización.','Below 40 lb (18.1 kg) FM 21-18 gives no penalty.')+'</p>';
    h+='<div class="sd-src">'+L('Ritmos de marcha del FM 21-18 (apéndice A): carretera 4,0 km/h de día y 3,2 de noche; campo a través 2,4 de día y 1,6 de noche.','FM 21-18 march rates (Appendix A): road 4.0 km/h by day and 3.2 by night; cross-country 2.4 by day and 1.6 by night.')+' <a href="'+esc(D.fm_src[1])+'" target="_blank" rel="noopener">FM 21-18</a></div>';
    h+='<h3>'+L('Gasto energético al marchar (ecuación de Pandolf)','Energy cost of marching (Pandolf equation)')+'</h3><div class="sd-in"><label>'+L('Velocidad (km/h)','Speed (km/h)')+'<input id="sdv" type="number" inputmode="decimal" min="0" max="7" step="0.1" value="'+st.v+'"></label><label>'+L('Pendiente (%)','Grade (%)')+'<input id="sdg" type="number" inputmode="decimal" min="0" max="25" step="1" value="'+st.g+'"></label><label style="flex-basis:100%">'+L('Terreno (coeficiente η)','Terrain (coefficient η)')+'<select id="sdt">'+D.pandolf.eta.map((e,i)=>'<option value="'+i+'"'+(i===+st.terr?' selected':'')+'>'+esc(EN()?e[1]:e[0])+' — η '+nf(e[2],1)+'</option>').join('')+'</select></label></div>';
    if(W>0){ const M=pandolf(W,Lk,V,G,eta), M0=pandolf(W,0,V,G,eta), cls=D.work.W; const ks=Object.keys(cls);
      let near=ks[0]; ks.forEach(k=>{ if(Math.abs(cls[k]-M)<Math.abs(cls[near]-M)) near=k; });
      const tr={'Easy Work':['fácil','easy'],'Moderate Work':['moderado','moderate'],'Heavy Work':['duro','hard'],'Very Heavy Work':['muy duro','very hard']};
      h+='<div class="sd-row"><span>'+L('Gasto con esta carga','Cost with this load')+'</span><b>≈ '+nf(M,0)+' W ('+nf(M*0.8598,0)+' kcal/h)</b></div><div class="sd-row"><span>'+L('Sin carga, mismo ritmo','No load, same pace')+'</span><b>≈ '+nf(M0,0)+' W</b></div><div class="sd-row"><span>'+L('Aumento por la carga','Increase due to the load')+'</span><b>+'+nf((M/M0-1)*100,0)+' %</b></div>'+
       '<div class="sd-row"><span>'+L('Clase de trabajo más próxima (TB MED 507)','Nearest work class (TB MED 507)')+'</span><b>'+(tr[near]?LL(tr[near]):near)+' (≈ '+cls[near]+' W)</b></div>'+
       (V>1.0?'<p class="sd-warn">'+L('Ojo: el estudio de 1977 midió entre 0,2 y 1,0 m/s (0,7–3,6 km/h) con mochilas de 32 a 50 kg; a más velocidad el resultado se aleja de lo medido. Es una ecuación para caminar, no para correr.','Note: the 1977 study measured 0.2 to 1.0 m/s (0.7–3.6 km/h) with 32 to 50 kg packs; at higher speeds the result is beyond what was measured. It is a walking equation, not a running one.')+'</p>':'')+
       '<div class="sd-src">M = 1,5·W + 2,0·(W+L)·(L/W)² + η·(W+L)·(1,5·V² + 0,35·V·G) — W '+L('peso corporal','body mass')+' (kg), L '+L('carga','load')+' (kg), V (m/s), G '+L('pendiente','grade')+' (%), η '+L('terreno','terrain')+'. '+esc(D.pandolf.cit)+' '+D.pandolf.src.map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>').join(' · ')+'. '+L('Coeficientes de terreno: figura 5 del mismo artículo (Soule y Goldman, 1972). Sin corrección para cuesta abajo (no verificada). Clases de trabajo: ','Terrain coefficients: Figure 5 of the same paper (Soule & Goldman, 1972). No downhill correction (not verified). Work classes: ')+'<a href="'+esc(D.work.src[1])+'" target="_blank" rel="noopener">TB MED 507 (2022)</a>, '+esc(D.work.page)+' (250 / 425 / 600 / 800 W). '+L('Con cargas de más del 30 % del peso corporal, el gasto de energía va subiendo durante la marcha (ATP 3-21.18, apéndice C).','With loads above 30 % of body weight, energy expenditure keeps rising during the march (ATP 3-21.18, Appendix C).')+'</div>'; }
    else h+='<p class="sd-warn">'+L('Pon tu peso corporal para calcularlo.','Enter your body weight to compute it.')+'</p>';
    return h; }
  function srcHTML(){ return '<h2>'+L('Fuentes y método','Sources and method')+'</h2><div class="sd-src" style="font-size:13px">'+
    L('Pesos de equipo: fichas técnicas de fabricantes y documentos oficiales (enlazados en cada objeto) y el anexo D «Equipment Weight Table» del informe del Ejército de EE. UU. ','Gear weights: makers\' data sheets and official documents (linked on each item) and Annex D “Equipment Weight Table” of the US Army report ')+'<a href="'+esc(D.tfd.src[1])+'" target="_blank" rel="noopener">«The Modern Warrior\'s Combat Load» (2003)</a>. '+
    L('Peso del arma: ficha de M.A.T (Wikipedia) más el peso publicado de cada accesorio del Armero 3D. Umbrales: ATP 3-21.18 (2017) tabla 3-4 y FM 21-18 (1990). Movilidad: reglas del FM 21-18 y ecuación de Pandolf (1977). No usamos fórmulas propias: si no hay dato publicado, no hay cifra.','Weapon weight: M.A.T data sheet (Wikipedia) plus each accessory\'s published weight from the 3D Gunsmith. Thresholds: ATP 3-21.18 (2017) Table 3-4 and FM 21-18 (1990). Mobility: FM 21-18 rules and the Pandolf equation (1977). We use no formulas of our own: no published data, no number.')+
    ' '+L('Esto es una estimación educativa, no una evaluación médica ni de aptitud.','This is an educational estimate, not a medical or fitness assessment.')+
    ' <a href="'+esc(D.atp_src[1])+'" target="_blank" rel="noopener">ATP 3-21.18</a> · <a href="'+esc(D.fm_src[1])+'" target="_blank" rel="noopener">FM 21-18</a> · <a href="#/license">'+L('Licencias de los modelos 3D','3D model licences')+'</a></div>'; }
  function renderAll(){ $('sdrole').innerHTML=roleHTML(); drawGh(); [...$('sdroles').children].forEach(b=>b.classList.toggle('on',b.dataset.r===(st.role||'')&&!b.disabled)); $('sdarma').innerHTML=armaHTML(); $('sdgear').innerHTML=gearHTML(); calc(); }
  function sdxBar(){ const b=$('sdxbar'); if(!b) return; const T=totals(st), bw=+st.kg||0; b.innerHTML='<div class="sdx-bl"><small>'+L('Carga total','Total load')+'</small><b>'+kg(T.tot)+'</b>'+(bw?' · '+nf(T.tot/bw*100,1)+' % '+L('de tu peso','of your weight'):'')+'</div><button type="button" class="sd-btn sec" id="sdxgo">'+L('Ver resultado','See result')+' ↓</button>'; }
  function calc(){ $('sdres').innerHTML=resHTML(); $('sdmov').innerHTML=movHTML(); saveSt(st); if(ACTIVE3D) ACTIVE3D.update(st); sdxBar(); drawGh(); if(SHOPEN) shareOpen(); }
  $('sdsrc').innerHTML=srcHTML();
  if(pre){ st.role=null; }
  { const sc=sv.get('s'); if(sc){ try{ const o=b64d(sc); if(o&&typeof o==='object'){ const q={}; Object.entries(o.q||{}).forEach(([k,v])=>{ const it=D.items[k]; v=Math.round(+v||0); if(it&&v>0) q[k]=Math.min(it.max||9,v); });
      st.role=RL(o.r)?o.r:null; st.lvl=[0,1,2].includes(+o.l)?+o.l:0; st.q=q; st.arma=(o.a&&typeof o.a.id==='string')?{id:o.a.id,v:Math.max(0,+o.a.v||0),on:(o.a.on&&typeof o.a.on==='object')?o.a.on:{},camo:typeof o.a.camo==='string'?o.a.camo:'orig',ca:!!o.a.ca}:null; st.gh=(st.role==='tirador'&&typeof o.g==='string'&&/^(bosque|montana|nieve|desierto)$/.test(o.g))?o.g:(st.role==='tirador'?null:st.gh); saveSt(st); } }catch(e){} try{ history.replaceState(null,'',location.pathname+location.search+'#/soldado'); }catch(e){} } }
  card().catch(()=>{});
  renderAll();
  arm().then(M=>{ if(!document.getElementById('sdarma')) return;
     if(pre){ const lb=M.lastBuild&&M.lastBuild(); st.arma=(lb&&lb.id===pre)?lb:{id:pre,v:0,on:{},camo:'orig',ca:false}; if(!M.W.find(w=>w.id===pre)) st.arma=null; }
     $('sdarma').innerHTML=armaHTML(); calc(); }).catch(()=>{ $('sdarma').innerHTML='<p class="sd-warn">'+L('No se pudieron cargar las armas.','Could not load the weapons.')+'</p>'; });
  const main=document.querySelector('.sd-wrap');
  main.addEventListener('input',e=>{ const t=e.target; if(t.id==='sdh') st.h=Math.max(140,Math.min(215,+t.value||175)); else if(t.id==='sdkg') st.kg=+t.value||0; else if(t.id==='sdv') st.v=+t.value||0; else if(t.id==='sdg') st.g=+t.value||0; else return;
     if(t.id==='sdh'){ saveSt(st); if(ACTIVE3D) ACTIVE3D.update(st); return; } $('sdres').innerHTML=resHTML(); sdxBar(); const mv=$('sdmov'); if(t.id!=='sdv'&&t.id!=='sdg') mv.innerHTML=movHTML(); else { const keep=t.id; mv.innerHTML=movHTML(); const n=$(keep); if(n){ n.focus(); try{ n.setSelectionRange(n.value.length,n.value.length); }catch(e){} } } saveSt(st); });
  main.addEventListener('change',e=>{ const t=e.target; if(t.id==='sdshhw'){ SHHW=t.checked; shareOpen(); return; } if(t.id==='sdt'){ st.terr=+t.value; $('sdmov').innerHTML=movHTML(); saveSt(st); }
     else if(t.id==='sdw'){ st.arma=t.value?{id:t.value,v:0,on:{},camo:'orig',ca:false}:null; $('sdarma').innerHTML=armaHTML(); calc(); } });
  main.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.r!=null&&b.parentNode.id==='sdroles'){ if(b.disabled) return; st.role=b.dataset.r||null; st.lvl=0; if(st.role) applyRole(); renderAll(); return; }
    if(b.dataset.l!=null){ st.lvl=+b.dataset.l; applyRole(); renderAll(); return; }
    if(b.dataset.gh!=null&&b.parentNode.id==='sdgh'){ st.gh=b.dataset.gh||null; $('sdrole').innerHTML=roleHTML(); calc(); return; }
    if(b.id==='sdsh'){ SHOPEN=!SHOPEN; if(SHOPEN) shareOpen(true); else $('sdshare').innerHTML=''; return; }
    if(b.id==='sdshgo'){ shareNative(); return; }
    if(b.id==='sdshcp'){ const u=shareURL(); (navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(u):Promise.reject()).then(()=>{ b.textContent=L('Enlace copiado ✓','Link copied ✓'); }).catch(()=>{ window.prompt(L('Copia el enlace:','Copy the link:'),u); }); return; }
    if(b.id==='sdlast'){ const lb=ARM.lastBuild(); if(lb){ st.arma=lb; $('sdarma').innerHTML=armaHTML(); calc(); } return; }
    if(b.dataset.m){ const row=b.closest('.sd-it'); const id=row.dataset.i, it=D.items[id]; let q=(st.q[id]||0)+(+b.dataset.m); q=Math.max(0,Math.min(it.max||9,q));
      if(q>0&&single.has(it.c)) D.order.forEach(k=>{ if(k!==id&&D.items[k]&&D.items[k].c===it.c) delete st.q[k]; });
      if(id==='iba'&&q>0) D.order.forEach(k=>{ if(D.items[k]&&D.items[k].c==='plate'&&k!=='side') delete st.q[k]; });
      if(it.c==='plate'&&id!=='side'&&q>0){ D.order.forEach(k=>{ if(k!==id&&D.items[k]&&D.items[k].c==='plate'&&k!=='side') delete st.q[k]; }); delete st.q.iba; }
      if(q) st.q[id]=q; else delete st.q[id]; $('sdgear').innerHTML=gearHTML(); calc(); return; }
    if(b.id==='sdclr'){ st.q={}; st.role=null; st.arma=null; renderAll(); return; }
    if(b.id==='sdeq'){ equip(); return; }
    if(b.id==='sdxgo'){ const r=$('sdres'); if(r) r.scrollIntoView({behavior:'smooth',block:'start'}); return; } });
  $('sdgear').addEventListener('toggle',e=>{ const d=e.target; if(!d||!d.classList||!d.classList.contains('sdx-cat')) return; const c=d.dataset.c; if(d.open) SDX_OPEN.add(c); else SDX_OPEN.delete(c); sdxSave(); },true);
  function equip(){ const box=$('sd3d'); if(ACTIVE3D||EQBUSY){ box.scrollIntoView({behavior:'smooth',block:'center'}); return; } EQBUSY=true; const my=++EQN; /* un solo visor 3D aunque se pulse dos veces mientras carga */
    box.innerHTML='<div class="sd-stage" id="sdst"><div class="sd-load">'+L('Cargando soldado 3D…','Loading 3D soldier…')+'</div></div><div id="sdcam"></div><div class="sd-src" id="sdcred"></div>';
    box.scrollIntoView({behavior:'smooth',block:'start'});
    Promise.all([arm(),import('./soldado3d.js?v='+VER)]).then(([M,S])=>S.mount($('sdst'),st,D,M,{cam:$('sdcam'),cred:$('sdcred'),save:()=>saveSt(st)})).then(v=>{ if(my===EQN) EQBUSY=false; if(my!==EQN||!document.getElementById('sdst')){ v&&v.destroy(); return; } ACTIVE3D=v; })
      .catch(e=>{ if(my===EQN) EQBUSY=false; console.warn(e); const s=$('sdst'); if(s) s.innerHTML='<div class="sd-load">'+L('No se pudo cargar el visor 3D en este dispositivo.','The 3D viewer could not load on this device.')+'</div>'; }); }
  if(sv.get('ver')==='3d') setTimeout(equip,50);
}
window.addEventListener('hashchange',()=>{ if(!/^#\/soldado/.test(location.hash)) stop3d(); });
