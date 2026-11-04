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
.sd-stage{position:relative;width:100%;height:min(78vh,620px);min-height:380px;border-radius:12px;background:radial-gradient(ellipse at 50% 35%,#3a4148,#1b1f24 70%);overflow:hidden;touch-action:none;margin-bottom:8px}
.sd-stage canvas{display:block;width:100%;height:100%}.sd-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;opacity:.85;text-align:center;padding:20px}
.sd-stage .arm-btns{position:absolute;right:8px;top:8px;display:flex;gap:6px;z-index:2}.sd-stage .arm-btns button{background:rgba(20,22,24,.75);color:#e8eaec;border:1px solid #444b52;border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer}
.sd-role{border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;margin-top:8px;font-size:14px}
.sd-role ul{margin:6px 0 0 18px;padding:0;font-size:12px;opacity:.85}
details.sd-d summary{cursor:pointer;font-size:13px;opacity:.9;margin-top:6px}
.sd-warn{font-size:12px;opacity:.8;margin-top:4px}
.sd-wp{display:flex;gap:10px;align-items:center}.sd-wp img{width:120px;height:48px;object-fit:contain;border-radius:6px;background:#20252b}
.sd-cam{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.sd-cam button{width:34px;height:34px;border-radius:50%;border:2px solid transparent;cursor:pointer}.sd-cam button.on{border-color:#fff}
`;
function css(){ if(!document.getElementById('sd-css')){ const s=document.createElement('style'); s.id='sd-css'; s.textContent=CSS; document.head.appendChild(s); } }
function data(){ return DATA?Promise.resolve(DATA):fetch('soldado.json?v='+VER).then(r=>{ if(!r.ok) throw 0; return r.json(); }).then(d=>DATA=d); }
function arm(){ return ARM?Promise.resolve(ARM):import('./armero.js?v='+VER).then(m=>ARM=m); }
const KEY='mat_soldado';
function loadSt(){ let s=null; try{ s=JSON.parse(localStorage.getItem(KEY)||'null'); }catch(e){}
  return Object.assign({h:175,kg:80,role:null,lvl:0,q:{},arma:null,camo:'od',v:4,terr:0,g:0},s||{}); }
function saveSt(st){ try{ localStorage.setItem(KEY,JSON.stringify(st)); }catch(e){} }
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
function stop3d(){ if(ACTIVE3D){ try{ ACTIVE3D.destroy(); }catch(e){} ACTIVE3D=null; } }
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
   '<div class="sd-card"><h2>'+L('2 · Rol (cargas medidas en combate)','2 · Role (loads measured in combat)')+'</h2><div class="sd-chips" id="sdroles">'+D.roles.map(r=>'<button type="button" class="sd-chip" data-r="'+r.id+'">'+esc(LL(r.n))+'</button>').join('')+'<button type="button" class="sd-chip" data-r="tirador" disabled title="'+L('Sin datos publicados','No published data')+'">'+L('Francotirador','Sniper')+'</button><button type="button" class="sd-chip" data-r="">'+L('Libre','Custom')+'</button></div><div id="sdrole"></div></div>'+
   '<div class="sd-card"><h2>'+L('3 · Arma principal (del Armero 3D)','3 · Primary weapon (from the 3D Gunsmith)')+'</h2><div id="sdarma"><p class="sd-warn">'+L('Cargando armas…','Loading weapons…')+'</p></div></div>'+
   '<div class="sd-card"><h2>'+L('4 · Equipo','4 · Gear')+'</h2><p class="sd-warn">'+L('Cada peso lleva su fuente. Toca + / − para añadir o quitar.','Every weight carries its source. Tap + / − to add or remove.')+'</p><div id="sdgear"></div></div>'+
   '</div><div class="sd-side"><div class="sd-card" id="sdres"></div><div class="sd-card" id="sdmov"></div>'+
   '<div class="sd-card"><button type="button" class="sd-btn" id="sdeq">'+L('Equipar (ver en 3D)','Equip (view in 3D)')+'</button><button type="button" class="sd-btn sec" id="sdclr">'+L('Vaciar','Clear')+'</button><div id="sd3d"></div></div>'+
   '</div></div><div class="sd-card" id="sdsrc"></div>';
  ctx.set(h,L('Crea tu soldado','Build your soldier'));
  /* precarga del 3D en segundo plano (no con «ahorro de datos») */
  { const cn=navigator.connection; if(!(cn&&(cn.saveData||/(^|-)2g$/.test(cn.effectiveType||'')))){ const go=()=>{ if(!document.getElementById('sdeq')) return; Promise.all([arm(),import('./soldado3d.js?v='+VER)]).then(([,S3])=>{ S3.prefetch&&S3.prefetch(); }).catch(()=>{}); }; (window.requestIdleCallback||((f)=>setTimeout(f,1200)))(go,{timeout:2500}); } }
  const $=id=>document.getElementById(id);
  function gearHTML(){ return D.cats.map(c=>{ const ids=itemsByCat(c[0]); if(!ids.length) return ''; return '<h3>'+esc(LL(c[1]))+(c[2]?' <small style="opacity:.6">'+L('(uno)','(one)')+'</small>':'')+'</h3>'+ids.map(id=>{ const it=D.items[id], q=st.q[id]||0, src=LL(it.src)||[];
    const blocked=(c[0]==='plate'&&st.q.iba&&id!=='side');
    return '<div class="sd-it'+(q?' on':'')+'" data-i="'+id+'"><div class="nm">'+esc(LL(it.n))+(it.nij?' <i style="opacity:.7">· '+esc(it.nij)+'</i>':'')+'<small>'+(it.unit?nf(it.g/1000,1)+' kg/'+LL(it.unit):fmtG(it.g))+(it.note?' · '+esc(LL(it.note)):'')+(blocked?' · '+L('el chaleco IBA ya incluye 2 placas SAPI','the IBA vest already includes 2 SAPI plates'):'')+' · '+src.slice(0,1).map(s=>'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+L('fuente','source')+'</a>').join('')+'</small></div><div class="w">'+(q?kg(it.g*q/1000):'')+'</div><div class="sd-q"><button type="button" data-m="-1" aria-label="−">−</button><span>'+q+'</span><button type="button" data-m="1" aria-label="+"'+(blocked?' disabled':'')+'>+</button></div></div>'; }).join(''); }).join(''); }
  function fmtG(g){ return g>=1000?nf(g/1000,2)+' kg':nf(g,0)+' g'; }
  function roleHTML(){ const r=D.roles.find(x=>x.id===st.role); if(!r){ return st.role==='tirador'?'':'<p class="sd-warn">'+L('Elige un rol para cargar un equipo típico medido en el informe, o monta el tuyo libremente abajo.','Choose a role to load a typical kit measured in the report, or build your own freely below.')+'</p><p class="sd-warn">'+L('Francotirador: el informe no tiene un apartado de francotirador y no hemos encontrado otra fuente publicada con su carga; por eso no hay plantilla (puedes montarlo en «Libre»).','Sniper: the report has no sniper section and we found no other published source for its load, so there is no preset (you can build it under “Custom”).')+'</p>'; }
    const lv=[[L('Carga de combate','Fighting load'),0],[L('Marcha de aproximación','Approach march'),1],[L('Marcha de emergencia','Emergency march'),2]];
    const t=r.tot[st.lvl];
    return '<div class="sd-chips" style="margin-top:8px">'+lv.filter(x=>r.sel[x[1]]).map(x=>'<button type="button" class="sd-chip'+(st.lvl===x[1]?' on':'')+'" data-l="'+x[1]+'">'+x[0]+'</button>').join('')+'</div>'+
     '<div class="sd-role">'+(t?'<b>'+L('Medido en el informe','Measured in the report')+': '+kg(t.kg)+'</b> ('+nf(t.lb,1)+' lb) · '+nf(t.pct,1)+' % '+L('del peso corporal medio de ese grupo','of that group\'s average body weight'):'')+
     '<div class="sd-src">'+L('Media medida a paracaidistas de la 82.ª División Aerotransportada (Afganistán, 2003), rol «','Average measured on 82nd Airborne paratroopers (Afghanistan, 2003), role “')+esc(r.name_src)+L('». ','”. ')+'<a href="'+esc(D.tfd.src[1])+'" target="_blank" rel="noopener">'+L('Informe «The Modern Warrior\'s Combat Load» (Ejército de EE. UU., 2003)','“The Modern Warrior\'s Combat Load” report (US Army, 2003)')+'</a>, '+esc(r.page)+'.</div>'+
     '<div class="sd-src">'+L('Abajo se carga una selección aproximada de M.A.T con los objetos de esa lista que tienen peso publicado; por eso tu total puede salir menor que el medido (faltan objetos pequeños sin peso por unidad).','Below, M.A.T loads an approximate selection with the items from that list that have a published weight, so your total can be lower than the measured one (small items without a per-unit weight are missing).')+(r.miss?' '+esc(LL(r.miss)):'')+'</div>'+
     '<details class="sd-d"><summary>'+L('Lista original del informe (en inglés)','Original list from the report')+'</summary>'+[['A',L('Sobre el cuerpo','Worn on the body')],['B',L('En el chaleco / portaequipo','On the vest / load carrier')],['C',L('Mochila de asalto','Assault pack')],['D',L('Mochila principal','Main rucksack')]].map(([k,t])=>(r.list[k]&&r.list[k].length&&(k<'C'||st.lvl>=(k==='C'?1:2)))?'<b style="font-size:12px">'+t+'</b><ul>'+r.list[k].map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'').join('')+'</details></div>'; }
  function applyRole(){ const r=D.roles.find(x=>x.id===st.role); if(!r) return; let lvl=st.lvl; if(!r.sel[lvl]) lvl=st.lvl=0; st.q=Object.assign({},r.sel[lvl]); st.arma=JSON.parse(JSON.stringify(Object.assign({v:0,camo:'orig',ca:false},r.arma))); }
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
    if(lb>40){ const over=(lb-40)/10; h+='<div class="sd-row"><span>'+L('Distancia recorrida en 6 h','Distance marched in 6 h')+'</span><b>−'+nf(2*over,1)+' km</b></div><div class="sd-row"><span>'+L('Tiempo en pista de asalto','Assault course time')+'</span><b>+'+nf(15*over,0)+' %</b></div><div class="sd-src">'+L('Respecto a llevar 40 lb (18,1 kg). Regla del FM 21-18: la distancia recorrida en 6 horas baja 2 km por cada 10 lb por encima de 40 lb, y el tiempo en la pista de asalto sube un 15 % por cada 10 lb por encima de 40 lb. Con pendientes medias del 10 % la distancia se reduce a la mitad.','Compared with carrying 40 lb (18.1 kg). FM 21-18 rule: distance marched in 6 hours drops 2 km for every 10 lb over 40 lb, and assault-course time rises 15 % for every 10 lb over 40 lb. On average gradients of 10 % distance is halved.')+'</div>'; }
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
  function renderAll(){ $('sdrole').innerHTML=roleHTML(); [...$('sdroles').children].forEach(b=>b.classList.toggle('on',b.dataset.r===(st.role||'')&&!b.disabled)); $('sdarma').innerHTML=armaHTML(); $('sdgear').innerHTML=gearHTML(); calc(); }
  function calc(){ $('sdres').innerHTML=resHTML(); $('sdmov').innerHTML=movHTML(); saveSt(st); if(ACTIVE3D) ACTIVE3D.update(st); }
  $('sdsrc').innerHTML=srcHTML();
  if(pre){ st.role=null; }
  renderAll();
  arm().then(M=>{ if(!document.getElementById('sdarma')) return;
     if(pre){ const lb=M.lastBuild&&M.lastBuild(); st.arma=(lb&&lb.id===pre)?lb:{id:pre,v:0,on:{},camo:'orig',ca:false}; if(!M.W.find(w=>w.id===pre)) st.arma=null; }
     $('sdarma').innerHTML=armaHTML(); calc(); }).catch(()=>{ $('sdarma').innerHTML='<p class="sd-warn">'+L('No se pudieron cargar las armas.','Could not load the weapons.')+'</p>'; });
  const main=document.querySelector('.sd-wrap');
  main.addEventListener('input',e=>{ const t=e.target; if(t.id==='sdh') st.h=Math.max(140,Math.min(215,+t.value||175)); else if(t.id==='sdkg') st.kg=+t.value||0; else if(t.id==='sdv') st.v=+t.value||0; else if(t.id==='sdg') st.g=+t.value||0; else return;
     if(t.id==='sdh'){ saveSt(st); if(ACTIVE3D) ACTIVE3D.update(st); return; } $('sdres').innerHTML=resHTML(); const mv=$('sdmov'); if(t.id!=='sdv'&&t.id!=='sdg') mv.innerHTML=movHTML(); else { const keep=t.id; mv.innerHTML=movHTML(); const n=$(keep); if(n){ n.focus(); try{ n.setSelectionRange(n.value.length,n.value.length); }catch(e){} } } saveSt(st); });
  main.addEventListener('change',e=>{ const t=e.target; if(t.id==='sdt'){ st.terr=+t.value; $('sdmov').innerHTML=movHTML(); saveSt(st); }
     else if(t.id==='sdw'){ st.arma=t.value?{id:t.value,v:0,on:{},camo:'orig',ca:false}:null; $('sdarma').innerHTML=armaHTML(); calc(); } });
  main.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.r!=null&&b.parentNode.id==='sdroles'){ if(b.disabled) return; st.role=b.dataset.r||null; st.lvl=0; if(st.role) applyRole(); renderAll(); return; }
    if(b.dataset.l!=null){ st.lvl=+b.dataset.l; applyRole(); renderAll(); return; }
    if(b.id==='sdlast'){ const lb=ARM.lastBuild(); if(lb){ st.arma=lb; $('sdarma').innerHTML=armaHTML(); calc(); } return; }
    if(b.dataset.m){ const row=b.closest('.sd-it'); const id=row.dataset.i, it=D.items[id]; let q=(st.q[id]||0)+(+b.dataset.m); q=Math.max(0,Math.min(it.max||9,q));
      if(q>0&&single.has(it.c)) D.order.forEach(k=>{ if(k!==id&&D.items[k]&&D.items[k].c===it.c) delete st.q[k]; });
      if(id==='iba'&&q>0) D.order.forEach(k=>{ if(D.items[k]&&D.items[k].c==='plate'&&k!=='side') delete st.q[k]; });
      if(it.c==='plate'&&id!=='side'&&q>0){ D.order.forEach(k=>{ if(k!==id&&D.items[k]&&D.items[k].c==='plate'&&k!=='side') delete st.q[k]; }); delete st.q.iba; }
      if(q) st.q[id]=q; else delete st.q[id]; $('sdgear').innerHTML=gearHTML(); calc(); return; }
    if(b.id==='sdclr'){ st.q={}; st.role=null; st.arma=null; renderAll(); return; }
    if(b.id==='sdeq'){ equip(); return; } });
  function equip(){ const box=$('sd3d'); if(ACTIVE3D){ box.scrollIntoView({behavior:'smooth',block:'center'}); return; }
    box.innerHTML='<div class="sd-stage" id="sdst"><div class="sd-load">'+L('Cargando soldado 3D…','Loading 3D soldier…')+'</div></div><div id="sdcam"></div><div class="sd-src" id="sdcred"></div>';
    box.scrollIntoView({behavior:'smooth',block:'start'});
    Promise.all([arm(),import('./soldado3d.js?v='+VER)]).then(([M,S])=>S.mount($('sdst'),st,D,M,{cam:$('sdcam'),cred:$('sdcred'),save:()=>saveSt(st)})).then(v=>{ if(!document.getElementById('sdst')){ v&&v.destroy(); return; } ACTIVE3D=v; })
      .catch(e=>{ console.warn(e); const s=$('sdst'); if(s) s.innerHTML='<div class="sd-load">'+L('No se pudo cargar el visor 3D en este dispositivo.','The 3D viewer could not load on this device.')+'</div>'; }); }
  if(sv.get('ver')==='3d') setTimeout(equip,50);
}
window.addEventListener('hashchange',()=>{ if(!/^#\/soldado/.test(location.hash)) stop3d(); });
