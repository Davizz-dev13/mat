// M.A.T · Crea tu ejército (#/ejercito). Módulo que se carga solo al abrir la sección.
// Datos: ejercito.json.gz (precios con fuente), gasto.json.gz (presupuestos SIPRI), fuerzas.json.gz (inventario real) y factbook.json (militares en activo).
let D=null,G=null,FZ=null,FB=null,X=null,APP=null;
const ST={b:'espana',cu:0,pm:1,real:0,cart:{},cat:'caz',cmp:'',open:0};
const PRE=['espana','polonia','francia','uk','alemania','us'];
const DOM={aire:['caz','hel','apo','dro'],mar:['buq','sub','por'],tierra:['car','vci','art'],dfa:['dfa'],mis:['mis'],sol:['sol']};
const DOMN={aire:['Aire','Air'],mar:['Mar','Sea'],tierra:['Tierra','Land'],dfa:['Defensa aérea','Air defence'],mis:['Misiles','Missiles'],sol:['Personal','Personnel']};
const DOMC={aire:'#7aa7d6',mar:'#4f8fb0',tierra:'#b3bd8c',dfa:'#d6b25e',mis:'#d07a5a',sol:'#a58ad0'};
const CMP=[['aviones_combate',['caz'],'Aviones de combate','Combat aircraft'],['helicopteros',['hel'],'Helicópteros','Helicopters'],['aviones_otros',['apo','dro'],'Otros aviones y drones','Other aircraft & drones'],['buques_fragatas,buques_destructores,buques_cruceros',['buq'],'Fragatas, destructores y cruceros','Frigates, destroyers & cruisers'],['submarinos',['sub'],'Submarinos','Submarines'],['buques_portaaviones',['por'],'Portaaviones y buques de asalto','Carriers & assault ships'],['tanques',['car'],'Carros de combate','Main battle tanks'],['blindados',['vci'],'Blindados','Armoured vehicles'],['artilleria',['art'],'Artillería','Artillery'],['antiaereos',['dfa'],'Defensa aérea','Air defence']];
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const V=()=>(document.querySelector('script[data-v]')||{getAttribute:()=>'1'}).getAttribute('data-v');
const P=()=>(window.MAT_DATA&&window.MAT_DATA.meta&&window.MAT_DATA.meta.paises)||{};
function pn(k){const p=P()[k]; let n=p?p.n:k; if(window.MAT_T) n=window.MAT_T(n); return String(n).split(' (')[0];}
function fl(k,c){const p=P()[k]; return p?'<img class="'+(c||'ejfl')+'" src="'+e(p.flag)+'" alt="" loading="lazy">':'';}
function nf(v,d){return Number(v).toLocaleString(EN()?'en-GB':'es-ES',{maximumFractionDigits:d==null?0:d,minimumFractionDigits:0});}
function fm(v){ // v en millones de euros
  if(v<1) return EN()?'€'+nf(v*1e6):nf(v*1e6)+' €';
  const d=v<10?2:v<100?1:0; return EN()?'€'+nf(v,d)+'M':nf(v,d)+' M€';
}
function fmr(it){const a=it.lo,b=it.hi; if(Math.abs(a-b)<1e-9) return fm(a); if(a<1&&b<1) return EN()?'€'+nf(a*1e6)+'–'+nf(b*1e6):nf(a*1e6)+'–'+nf(b*1e6)+' €'; const d=b<10?2:b<100?1:0; return EN()?'€'+nf(a,d)+'–'+nf(b,d)+'M':nf(a,d)+'–'+nf(b,d)+' M€';}
const BY=()=>{const o={}; D.items.forEach(i=>o[i.id]=i); return o;};
let IB={};
const nm=it=>EN()&&it.ne?it.ne:it.n;
function price(it){return ST.pm===0?it.lo:ST.pm===2?it.hi:(it.lo+it.hi)/2;}
function budgetFull(){ if(ST.b==='custom') return ST.cu; if(ST.b==='otan') return 33123; const p=G&&G.p[ST.b]; return p?p.e:0; }
function budget(){ return budgetFull()*(ST.real?0.2:1); }
function spent(){ let t=0; for(const k in ST.cart){const it=IB[k]; if(it) t+=price(it)*ST.cart[k];} return t; }
function units(){ let n=0; for(const k in ST.cart){ if(IB[k]&&IB[k].c!=='sol') n+=ST.cart[k]; } return n; }
function css(){ if(document.getElementById('ej-css')) return; const s=document.createElement('style'); s.id='ej-css';
 s.textContent='.ejw{padding-bottom:30px}.ejlead{color:#cfd1cd;margin:6px 0 12px;font-size:15px}'+
 '.ejbox{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px 12px 12px;margin:12px 0}'+
 '.ejbox h3{margin:0 0 8px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);font-weight:600}'+
 '.ejbud{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}.ejbud b{font-size:24px;color:#d6b25e;font-variant-numeric:tabular-nums}.ejbud span{font-size:12px;color:var(--mu)}'+
 '.ejnote{font-size:12px;color:var(--mu);line-height:1.45;margin:6px 0 0}.ejnote a{color:var(--ac2)}'+
 '.ejrow{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}.ejrow label{font-size:13px;color:var(--mu)}'+
 '.ejrange{width:100%;accent-color:#d6b25e;margin:8px 0 2px}'+
 '.ejsticky{position:sticky;top:0;z-index:9;background:rgba(11,12,13,.97);border-bottom:1px solid var(--line);margin:0 -16px;padding:8px 16px 9px;backdrop-filter:blur(4px)}'+
 '.ejst{display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:13px;color:var(--mu);font-variant-numeric:tabular-nums}.ejst b{color:var(--tx);font-size:15px}.ejst .ok{color:#b3bd8c}.ejst .ko{color:#e06c5a}'+
 '.ejbar{height:12px;border-radius:999px;background:var(--s2);overflow:hidden;margin-top:6px;display:flex;border:1px solid var(--line)}.ejbar i{display:block;height:100%;transition:width .25s}'+
 '.ejbar.over{border-color:#e06c5a;box-shadow:0 0 0 1px #e06c5a inset}'+
 '.ejmsg{font-size:12px;color:#e06c5a;min-height:0;margin-top:4px}.ejmsg:empty{display:none}'+
 '.ejtabs{margin:10px 0 2px}.ejtabs .chip{display:inline-flex;align-items:center;gap:6px}.ejtabs .chip em{font-style:normal;font-size:11px;background:#d6b25e;color:#0b0c0d;border-radius:999px;padding:0 6px;min-width:18px;text-align:center}'+
 '.ejlist{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px}@media(min-width:900px){.ejlist{grid-template-columns:1fr 1fr}}'+
 '.ejit{display:flex;gap:10px;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:9px;align-items:flex-start;min-width:0}.ejit.has{border-color:#6f6236;background:linear-gradient(90deg,#1b1a12,#131517 60%)}'+
 '.ejth{flex:0 0 76px;width:76px;height:54px;border-radius:4px;overflow:hidden;background:#0d1013;display:flex;align-items:center;justify-content:center}.ejth img{width:100%;height:100%;object-fit:cover;display:block}.ejth svg{width:34px;height:34px}'+
 '.ejm{flex:1 1 auto;min-width:0}.ejn{font-weight:650;font-size:15px;line-height:1.25;overflow-wrap:anywhere}.ejn .ejfl{width:18px;height:12px;object-fit:cover;border-radius:2px;margin-left:5px;vertical-align:-1px}'+
 '.ejp{margin-top:3px;font-size:13px;color:var(--mu);display:flex;flex-wrap:wrap;gap:4px 8px;align-items:center}.ejp b{color:#d6b25e;font-variant-numeric:tabular-nums;font-size:14px}.ejb{font-size:11px;border:1px solid var(--line);border-radius:3px;padding:1px 6px;color:var(--mu)}.ejb.est{border-color:#6b4b3a;color:#d6a08a}.ejsrch{margin:12px 0 4px}.ejsrch input{width:100%;box-sizing:border-box;padding:10px 12px;border-radius:8px;border:1px solid var(--line);background:var(--s1);color:var(--tx);font-size:16px;font-family:inherit}.ejsrch input:focus{outline:none;border-color:#d6b25e}'+
 '.ejm details{margin-top:4px;font-size:12.5px;color:var(--mu);line-height:1.45}.ejm summary{cursor:pointer;color:var(--ac2);list-style:none}.ejm summary::-webkit-details-marker{display:none}.ejm details a{color:var(--ac2);overflow-wrap:anywhere}.ejm details p{margin:4px 0}'+
 '.ejq{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-end;gap:5px}.ejqq{display:flex;align-items:center;border:1px solid var(--line);border-radius:999px;overflow:hidden}'+
 '.ejqq button{width:38px;height:38px;border:0;background:var(--s2);color:var(--tx);font-size:20px;line-height:1;cursor:pointer;font-family:inherit}.ejqq button:disabled{opacity:.3;cursor:default}.ejqq button.pl{background:#2b2f22;color:#d6e09c}'+
 '.ejqq span{min-width:34px;text-align:center;font-variant-numeric:tabular-nums;font-weight:650}'+
 '.ejx{display:flex;gap:4px}.ejx button{border:1px solid var(--line);background:transparent;color:var(--mu);border-radius:999px;font-size:11px;padding:3px 8px;cursor:pointer;font-family:inherit}.ejx button:disabled{opacity:.3;cursor:default}'+
 '.ejgo{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}.ejgo .btn{flex:1 1 auto}'+
 '.ejcard{border:1px solid #6f6236;border-radius:10px;background:radial-gradient(140% 120% at 0% 0%,#1f2328 0%,#0d1013 70%);padding:14px;margin:16px 0;position:relative;overflow:hidden}'+
 '.ejcard .k{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#d6b25e}.ejcard h2.ejt{border:0;margin:4px 0 2px;padding:0;font-size:24px;letter-spacing:0;text-transform:none;color:var(--tx);font-weight:700}'+
 '.ejstars{color:#d6b25e;font-size:22px;letter-spacing:3px}.ejstars s{color:#3a3f44;text-decoration:none}.ejdesc{color:#cfd1cd;font-size:14px;margin:6px 0 10px}'+
 '.ejkp{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}@media(min-width:700px){.ejkp{grid-template-columns:repeat(4,1fr)}}.ejkp div{background:var(--s2);border-radius:5px;padding:8px}.ejkp span{display:block;font-size:11px;color:var(--mu);text-transform:uppercase;letter-spacing:.06em}.ejkp b{display:block;font-size:17px;color:#d6b25e;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}'+
 '.ejdom{margin:8px 0}.ejdr{display:flex;align-items:center;gap:8px;font-size:13px;margin:5px 0}.ejdr span{flex:0 0 108px;color:var(--mu)}.ejdr i{display:block;height:9px;border-radius:999px}.ejdr em{font-style:normal;color:var(--mu);font-variant-numeric:tabular-nums;margin-left:auto;padding-left:6px;white-space:nowrap}.ejdr .tr{flex:1 1 auto;background:var(--s2);border-radius:999px;overflow:hidden;display:flex}'+
 '.ejbuy{list-style:none;padding:0;margin:8px 0;font-size:14px;columns:1}@media(min-width:700px){.ejbuy{columns:2}}.ejbuy li{padding:3px 0;break-inside:avoid}.ejbuy b{color:#d6b25e;font-variant-numeric:tabular-nums}'+
 '.ejfun{margin:10px 0 0;padding:0;list-style:none}.ejfun li{font-size:13.5px;line-height:1.45;padding:6px 0 6px 18px;position:relative;border-top:1px solid var(--line)}.ejfun li:before{content:"›";position:absolute;left:4px;color:#d6b25e}'+
 '.ejtbl{width:100%;border-collapse:collapse;font-size:13.5px;margin-top:8px}.ejtbl th,.ejtbl td{padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums}.ejtbl th:first-child,.ejtbl td:first-child{text-align:left;color:var(--tx)}.ejtbl th{font-size:11px;color:var(--mu);text-transform:uppercase;letter-spacing:.05em;font-weight:600}.ejtbl td.y{color:#d6b25e;font-weight:650}'+
 '.ejsel{background:var(--s2);color:var(--tx);border:1px solid var(--line);border-radius:6px;padding:8px;font:inherit;font-size:14px;max-width:100%}'+
 '.ejshare{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.ejshare .btn{flex:1 1 140px}'+
 '.ejsrc{font-size:12.5px;color:var(--mu);line-height:1.5}.ejsrc ol{padding-left:20px;margin:6px 0}.ejsrc a{color:var(--ac2);overflow-wrap:anywhere}.ejsrc summary{cursor:pointer;color:var(--ac2);font-size:14px}'+
 '.ejwarn{border-left:3px solid #d6b25e;background:var(--s2);padding:8px 10px;border-radius:0 5px 5px 0;font-size:13px;line-height:1.45;margin:10px 0;color:#cfd1cd}'+
 '.ejtoast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:#d6b25e;color:#0b0c0d;padding:9px 14px;border-radius:999px;font-size:14px;z-index:99;box-shadow:0 4px 16px rgba(0,0,0,.5);max-width:90vw;text-align:center}'+
 '.ejsim{font-size:13.5px;margin-top:10px;color:#cfd1cd}.ejsim b{color:#d6b25e}'+
 '.ejw img.ejfl{width:20px!important;height:14px!important;max-width:20px!important;object-fit:cover;border-radius:2px;vertical-align:-2px;display:inline-block;margin:0;flex:0 0 auto}.ejn img.ejfl{width:18px!important;height:12px!important;margin-left:5px}'+
 '#ejsum,#ejcard{scroll-margin-top:150px}.ejbuy a{text-decoration:none;border-bottom:1px dotted #555}';
 document.head.appendChild(s); }
// iconos simples por categoría (sin imágenes externas)
const IC={caz:'<path d="M24 5l3 12 13 7v3l-13-3-1 9 5 4v2l-7-2-7 2v-2l5-4-1-9-13 3v-3l13-7z"/>',hel:'<path d="M6 12h36M24 12v5M10 22h20a8 8 0 0 1 0 12H18l-8-6z M30 34l2 6M18 34l-2 6M38 26h6"/>',apo:'<path d="M4 24h40M22 10l5 14-5 14M10 20l2 4-2 4M34 22l8-2v8l-8-2"/>',dro:'<path d="M8 24h32M24 14v20M14 18l20 12M34 18L14 30"/><circle cx="24" cy="24" r="4"/>',buq:'<path d="M4 30h40l-5 8H9zM12 30v-6h20v6M20 24v-6h6v6M24 18v-6"/>',sub:'<path d="M6 28c0-5 6-8 18-8s18 3 18 8-6 6-18 6S6 33 6 28zM20 20v-6h7v6M42 28h4"/>',por:'<path d="M3 26h42l-6 10H9zM30 26v-7h6v7M8 22h28"/>',car:'<path d="M6 30h34l-3 8H9zM12 30v-6h18v6M30 26h14"/><circle cx="13" cy="34" r="2"/><circle cx="33" cy="34" r="2"/>',vci:'<path d="M5 32h38l-2-10H9zM12 22l3-6h14l3 6"/><circle cx="12" cy="34" r="3"/><circle cx="24" cy="34" r="3"/><circle cx="36" cy="34" r="3"/>',art:'<path d="M6 36h26M10 36l6-10h10l4 10M22 26l18-14"/><circle cx="12" cy="38" r="3"/><circle cx="28" cy="38" r="3"/>',dfa:'<path d="M8 38h32M14 38l4-10h12l4 10M24 28l10-18M24 28l-2-18"/><path d="M34 10l3-3M22 10l-1-4"/>',mis:'<path d="M24 4l5 8v22h-10V12zM19 30l-5 8h5M29 30l5 8h-5M22 34l2 8 2-8"/>',sol:'<circle cx="24" cy="12" r="5"/><path d="M14 42V26a10 10 0 0 1 20 0v16M18 18h12"/>'};
function ico(c){return '<svg viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="#d6b25e" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">'+(IC[c]||IC.caz)+'</svg>';}
function thumb(it){ const BYa=(window.MAT_DATA&&window.MAT_DATA.items)||[]; let a=null; if(it.f){ a=FICHA[it.f]; } const t=a&&a.img&&(a.img.th||a.img.src); return t?'<img src="'+e(t)+'" alt="" loading="lazy" data-ejc="'+it.c+'">':ico(it.c); }
let FICHA={};
// ---------- estado <-> URL ----------
function readURL(){ const h=location.hash,i=h.indexOf('?'); const q={}; if(i>=0) h.slice(i+1).split('&').forEach(p=>{const kv=p.split('='); if(kv[0]) q[kv[0]]=decodeURIComponent(kv[1]||'');});
  let any=false;
  if(q.b){ any=true; if(/^c\d+$/.test(q.b)){ST.b='custom';ST.cu=Math.max(100,Math.min(1e6,+q.b.slice(1)));} else if(PRE.indexOf(q.b)>=0||q.b==='otan') ST.b=q.b; }
  if(q.p!=null&&/^[012]$/.test(q.p)) ST.pm=+q.p;
  if(q.r) ST.real=q.r==='1'?1:0;
  if(q.c!=null){ any=true; ST.cart={}; q.c.split(',').forEach(x=>{const m=x.match(/^([a-z0-9]+)\.(\d+)$/); if(m&&IB[m[1]]) ST.cart[m[1]]=Math.min(+m[2],9999999);}); }
  if(q.vs&&(P()[q.vs]||q.vs)) ST.cmp=q.vs;
  if(q.ver==='1') ST.open=1;
  return any; }
function qstr(withCmp){ const c=Object.keys(ST.cart).filter(k=>ST.cart[k]>0).map(k=>k+'.'+ST.cart[k]).join(',');
  return 'b='+(ST.b==='custom'?'c'+Math.round(ST.cu):ST.b)+'&p='+ST.pm+(ST.real?'&r=1':'')+(c?'&c='+c:'')+(withCmp&&ST.cmp?'&vs='+ST.cmp:''); }
function save(){ try{ localStorage.setItem('mat_ejercito',JSON.stringify({b:ST.b,cu:ST.cu,pm:ST.pm,real:ST.real,cart:ST.cart})); }catch(_){}
  try{ history.replaceState(null,'','#/ejercito?'+qstr(false)); }catch(_){} }
function load(){ try{ const o=JSON.parse(localStorage.getItem('mat_ejercito')||'null'); if(o){ ST.b=o.b||'espana'; ST.cu=o.cu||0; ST.pm=o.pm==null?1:o.pm; ST.real=o.real?1:0; ST.cart={}; for(const k in (o.cart||{})) if(IB[k]&&o.cart[k]>0) ST.cart[k]=o.cart[k]; } }catch(_){} }
// ---------- carga ----------
function get(f){ return window.MAT_GET?window.MAT_GET(f):fetch(f+'?v='+V()).then(r=>r.json()); }
let PR=null;
function ensure(){ if(!PR) PR=Promise.all([get('ejercito.json.gz'),get('gasto.json.gz')]).then(z=>{D=z[0];G=z[1]; IB=BY(); const all=(window.MAT_DATA&&window.MAT_DATA.items)||[]; const need={}; D.items.forEach(i=>{if(i.f) need[i.f]=1;}); all.forEach(a=>{ if(need[a.id]) FICHA[a.id]=a; });}); return PR; }
let PF=null;
function ensureFz(){ if(!PF) PF=Promise.all([get('fuerzas.json.gz').catch(()=>null),fetch('factbook.json?v='+V()).then(r=>r.json()).catch(()=>null)]).then(z=>{FZ=z[0];FB=z[1];}); return PF; }
// ---------- render ----------
export function route(app,XX){ X=XX; APP=app; css();
  X.set('<div class="ejw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],[L('Crea tu ejército','Build your army')]])+'<h1>'+L('Crea tu ejército','Build your army')+'</h1><p class="sub">'+L('Cargando precios…','Loading prices…')+'</p></div>',L('Crea tu ejército','Build your army'));
  ensure().then(()=>{ if(!/^#\/ejercito/.test(location.hash)) return; load(); readURL(); if(!ST.cmp) ST.cmp=(ST.b==='custom'||ST.b==='otan')?'espana':ST.b; page(); if(ST.open) openSum(true); }).catch(err=>{ console.warn('ejercito',err); const w=app.querySelector('.ejw .sub'); if(w) w.textContent=L('No se pudieron cargar los datos. Actualiza la página.','Could not load the data. Please reload.'); });
}
function bdesc(){ if(ST.b==='custom') return L('Presupuesto personalizado','Custom budget');
  if(ST.b==='otan') return L('España · cifra de la OTAN 2025 (estimación, sin pensiones)','Spain · NATO 2025 figure (estimate, excl. pensions)');
  const p=G.p[ST.b]; return pn(ST.b)+' · '+L('gasto militar ','military spending ')+p.y+' (SIPRI)'; }
function page(){
  const h=[]; h.push('<div class="ejw" data-noi18n>');
  h.push(X.crumbs([[L('Inicio','Home'),'#/'],[L('Crea tu ejército','Build your army')]]));
  h.push('<h1>'+L('Crea tu ejército','Build your army')+'</h1>');
  h.push('<p class="ejlead">'+L('Tienes el presupuesto de defensa de un país real. Gástalo en cazas, fragatas, carros de combate, drones, defensa aérea y soldados con precios reales sacados de contratos y presupuestos públicos, y al final compara tu ejército con el de verdad.','You get a real country\'s defence budget. Spend it on fighters, frigates, tanks, drones, air defence and soldiers at real prices taken from public contracts and budgets, then compare your army with the real one.')+'</p>');
  // presupuesto
  h.push('<div class="ejbox"><h3>'+L('1 · Elige el presupuesto','1 · Pick the budget')+'</h3><div class="chips ejpre" role="group">');
  PRE.forEach(k=>{ if(!G.p[k]) return; h.push('<button type="button" class="chip" data-b="'+k+'" aria-pressed="'+(ST.b===k)+'">'+fl(k,'ejfl')+' '+e(pn(k))+'</button>'); });
  h.push('<button type="button" class="chip" data-b="otan" aria-pressed="'+(ST.b==='otan')+'">'+fl('espana','ejfl')+' '+L('España (OTAN)','Spain (NATO)')+'</button>');
  h.push('<button type="button" class="chip" data-b="custom" aria-pressed="'+(ST.b==='custom')+'">'+L('Personalizado','Custom')+'</button></div>');
  h.push('<div class="ejbud" style="margin-top:10px"><b id="ejbudv"></b><span id="ejbudd"></span></div>');
  h.push('<div id="ejcust"'+(ST.b==='custom'?'':' hidden')+'><input class="ejrange" type="range" min="0" max="1000" step="1" id="ejsl" aria-label="'+L('Presupuesto personalizado','Custom budget')+'"><div class="ejnote">'+L('De 100 M€ a 1 billón de euros (escala logarítmica).','From €100M to €1 trillion (log scale).')+'</div></div>');
  h.push('<details class="ejnote"><summary style="cursor:pointer;color:var(--ac2)">'+L('Sobre esta cifra','About this figure')+'</summary><span id="ejbnote"></span></details>');
  h.push('<div class="ejrow"><label>'+L('Precio:','Price:')+'</label><div class="chips" role="group" id="ejpm">'+[[0,L('Mínimo','Lowest')],[1,L('Medio','Middle')],[2,L('Máximo','Highest')]].map(x=>'<button type="button" class="chip" data-pm="'+x[0]+'" aria-pressed="'+(ST.pm===x[0])+'">'+x[1]+'</button>').join('')+'</div></div>');
  h.push('<div class="ejrow"><button type="button" class="chip" id="ejreal" aria-pressed="'+(!!ST.real)+'">'+L('Modo realista: solo el 20 % para compras','Realistic mode: only 20% for purchases')+'</button></div>');
  h.push('<p class="ejnote">'+e(D.nato20[EN()?'en':'es'])+' <a href="'+e(D.nato20.src[1])+'" target="_blank" rel="noopener">'+L('Fuente','Source')+'</a></p></div>');
  // barra fija
  h.push('<div class="ejsticky" id="ejstk"><div class="ejst"><span>'+L('Gastado','Spent')+' <b id="ejsp"></b></span><span id="ejrem"></span></div><div class="ejbar" id="ejbar"></div><div class="ejmsg" id="ejmsg"></div></div>');
  // pestañas
  h.push('<div class="ejsrch"><input type="search" id="ejq" autocomplete="off" enterkeyhint="search" aria-label="'+L('Buscar equipo','Search equipment')+'" placeholder="'+L('Buscar: F-35, Leopard, Rusia… ('+D.items.length+' equipos)','Search: F-35, Leopard, Russia… ('+D.items.length+' items)')+'"></div>');
  h.push('<div class="chips ejtabs" role="tablist" id="ejtabs">'+D.cats.map(c=>'<button type="button" class="chip" role="tab" data-cat="'+c[0]+'" aria-pressed="'+(ST.cat===c[0])+'">'+e(EN()?c[2]:c[1])+'<em hidden></em></button>').join('')+'</div>');
  h.push('<div class="ejlist" id="ejlist"></div>');
  h.push('<div class="ejgo"><button type="button" class="btn pri" id="ejver">'+L('Ver mi ejército','See my army')+' ›</button><button type="button" class="btn" id="ejclr">'+L('Vaciar','Clear')+'</button></div>');
  h.push('<div id="ejsum"></div>');
  h.push('<div class="ejwarn">'+L('Precios aproximados. Cada precio es una cifra pública (contrato, presupuesto oficial o estimación de prensa o analistas) dividida entre las unidades; muchos contratos incluyen armas, repuestos, formación o desarrollo, y por eso hay rangos. Salvo que se indique, no incluyen el mantenimiento ni el coste de operar durante décadas, que suele superar el de compra. Los soldados sí son un coste anual.','Approximate prices. Each price is a public figure (contract, official budget or press/analyst estimate) divided by the number of units; many contracts include weapons, spares, training or development, hence the ranges. Unless stated, they exclude maintenance and the cost of operating for decades, which usually exceeds the purchase price. Soldiers are a yearly cost.')+'</div>');
  h.push(srcHTML());
  h.push('</div>');
  X.set(h.join(''),L('Crea tu ejército','Build your army'));
  bind(); refreshBudget(); list(); bar(); stickTop();
}
function stickTop(){ const tp=document.querySelector('.top'), st=document.getElementById('ejstk'); if(!tp||!st) return; const cs=getComputedStyle(tp); st.style.top=(/sticky|fixed/.test(cs.position)?tp.offsetHeight:0)+'px'; }
function srcHTML(){ const keys=Object.keys(D.src); const used={}; D.items.forEach(i=>i.s.forEach(k=>used[k]=1));
  let h='<details class="ejsrc ejbox"><summary>'+L('Fuentes','Sources')+' ('+(Object.keys(used).length+3)+')</summary><p>'+e(D.fx[EN()?'en':'es'])+' <a href="'+e(D.fx.src[1])+'" target="_blank" rel="noopener">'+e(D.fx.src[0])+'</a></p><ol>';
  keys.forEach(k=>{ if(!used[k]) return; const s=D.src[k]; h+='<li><a href="'+e(s[1])+'" target="_blank" rel="noopener nofollow">'+e(s[0])+'</a></li>'; });
  h+='<li><a href="'+e(G.src.sipri.url)+'" target="_blank" rel="noopener">'+e(G.src.sipri.t)+'</a> — '+L('presupuestos (euros: moneda local o dólares al tipo medio del BCE, como en','budgets (euros: local currency or dollars at the ECB average rate, as in')+' <a href="#/gasto">'+L('Gasto militar','Military spending')+'</a>)</li>';
  h+='<li><a href="'+e(G.src.nato.url)+'" target="_blank" rel="noopener">'+e(G.src.nato.t)+'</a></li>';
  h+='<li>'+L('Inventario real: datos de M.A.T','Real inventory: M.A.T data')+' (<a href="#/fuerzas">'+L('Fuerzas armadas por país','Armed forces by country')+'</a>, Wikipedia) · '+L('militares en activo: CIA World Factbook (archivo)','active personnel: CIA World Factbook (archive)')+'</li></ol></details>';
  return h; }
function refreshBudget(){ const b=budgetFull(); const v=document.getElementById('ejbudv'); if(!v) return;
  v.textContent=fm(b); document.getElementById('ejbudd').textContent=bdesc()+(ST.real?' · '+L('para compras: ','for purchases: ')+fm(budget()):'');
  let n=''; if(ST.b==='espana'||ST.b==='otan'){ const t=G.nota&&G.nota.espana; if(t) n=t[EN()?1:0]; }
  else if(ST.b!=='custom'){ const p=G.p[ST.b]; n=L('Cifra de SIPRI para ','SIPRI figure for ')+pn(ST.b)+' ('+p.y+'): '+fm(p.e)+(p.nato?L(' · OTAN ',' · NATO ')+p.nato.y+': '+(p.nato.eur?fm(p.nato.eur):p.nato.ec?fm(p.nato.ec):'—'):'')+'. '+L('SIPRI incluye pensiones militares y otras partidas que no siempre están en el presupuesto del Ministerio de Defensa.','SIPRI includes military pensions and other items not always in the defence ministry budget.'); }
  else n=L('Mueve la barra para elegir cualquier cifra.','Move the slider to pick any amount.');
  document.getElementById('ejbnote').textContent=n;
  const sl=document.getElementById('ejsl'); if(sl&&ST.b==='custom') sl.value=Math.round((Math.log10(ST.cu)-2)/4*1000);
}
const nrm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
function list(){ const el=document.getElementById('ejlist'); if(!el) return; const qv=nrm(ST.q); const its=qv?D.items.filter(i=>nrm(i.n+' '+(i.ne||'')+' '+(i.o||[]).map(k=>pn(k)+' '+((P()[k]||{}).n||'')).join(' ')).indexOf(qv)>=0):D.items.filter(i=>i.c===ST.cat);
  el.innerHTML=its.length?its.map(card).join(''):'<p class="ejnote">'+L('No hay ningún equipo con ese nombre.','No equipment matches that name.')+'</p>'; upd(); }
function card(it){ const q=ST.cart[it.id]||0; const B=D.basis[it.b]||['','']; const est=it.b==='est';
  const src=it.s.map(k=>{const s=D.src[k]; return s?'<a href="'+e(s[1])+'" target="_blank" rel="noopener nofollow">'+e(s[0])+'</a>':'';}).join('<br>');
  const fich=it.f&&FICHA[it.f]?' · <a href="#/a/'+e(it.f)+'">'+L('Ver ficha','View entry')+' ›</a>':'';
  const per=it.u?' '+(EN()?it.u[1]:it.u[0]):it.c==='sol'?L(' /año',' /year'):it.c==='mis'?L(' /misil',' /missile'):it.c==='dfa'?L(' /sistema',' /system'):'';
  const th=it.f&&FICHA[it.f]?'<a class="ejth" href="#/a/'+e(it.f)+'" aria-label="'+e(nm(it))+'">'+thumb(it)+'</a>':'<div class="ejth">'+ico(it.c)+'</div>';
  const ex=it.c==='sol'?[100,1000,10000]:(price(it)<60?[10]:[]);
  return '<div class="ejit'+(q?' has':'')+'" data-id="'+it.id+'">'+th+'<div class="ejm"><div class="ejn">'+e(nm(it))+(it.o||[]).slice(0,4).map(k=>fl(k)).join('')+'</div>'+
   '<div class="ejp"><b>'+fmr(it)+per+'</b><span class="ejb'+(est?' est':'')+'">'+e(EN()?B[1]:B[0])+'</span>'+(it.x&&!est?'<span class="ejb est">'+L('Estimación','Estimate')+'</span>':'')+'</div>'+
   '<details><summary>'+L('De dónde sale el precio','Where the price comes from')+'</summary><p>'+e(EN()?it.en:it.es)+'</p><p>'+src+fich+'</p></details></div>'+
   '<div class="ejq"><div class="ejqq"><button type="button" data-a="-1" aria-label="'+L('Quitar','Remove')+'">−</button><span class="ejqn">'+nf(q)+'</span><button type="button" class="pl" data-a="1" aria-label="'+L('Añadir','Add')+'">+</button></div><div class="ejx">'+ex.map(n=>'<button type="button" data-a="'+n+'">+'+nf(n)+'</button>').join('')+'<button type="button" data-a="max">'+L('Máx','Max')+'</button></div></div></div>'; }
function toast(t){ let x=document.querySelector('.ejtoast'); if(!x){x=document.createElement('div');x.className='ejtoast';document.body.appendChild(x);} x.textContent=t; clearTimeout(x._t); x.style.display='block'; x._t=setTimeout(()=>{x.style.display='none';},1900); }
function add(id,a){ const it=IB[id]; if(!it) return; const pr=price(it); const left=budget()-spent(); let q=ST.cart[id]||0;
  if(a==='max'){ const n=Math.floor((left+1e-9)/pr); if(n<1){ msg(it,pr-left); return; } q+=n; }
  else { a=+a; if(a<0){ q=Math.max(0,q+a); } else { const n=Math.min(a,Math.floor((left+1e-9)/pr)); if(n<1){ msg(it,pr-left); return; } q+=n; if(n<a) toast(L('Solo te llegaba para ','You could only afford ')+nf(n)); } }
  if(q>0) ST.cart[id]=q; else delete ST.cart[id]; document.getElementById('ejmsg').textContent=''; save(); upd(); bar(); const s=document.getElementById('ejsum'); if(s&&s.innerHTML) openSum(false,true); }
function msg(it,miss){ const m=document.getElementById('ejmsg'); if(m) m.textContent=L('No te llega para ','Not enough for ')+nm(it)+': '+L('te faltan ','you are short by ')+fm(miss); toast(L('Presupuesto insuficiente','Not enough budget')); }
function upd(){ const left=budget()-spent();
  document.querySelectorAll('#ejlist .ejit').forEach(c=>{ const it=IB[c.dataset.id]; const q=ST.cart[it.id]||0; const pr=price(it);
    c.classList.toggle('has',q>0); c.querySelector('.ejqn').textContent=nf(q); c.querySelector('[data-a="-1"]').disabled=!q;
    c.querySelectorAll('[data-a]').forEach(b=>{ const a=b.dataset.a; if(a==='-1') return; const n=a==='max'?1:+a; b.disabled=pr*Math.min(n,1)>left+1e-9; }); });
  const cnt={}; for(const k in ST.cart){ const it=IB[k]; if(it) cnt[it.c]=(cnt[it.c]||0)+ST.cart[k]; }
  document.querySelectorAll('#ejtabs .chip').forEach(b=>{ const em=b.querySelector('em'); const n=cnt[b.dataset.cat]||0; em.hidden=!n; em.textContent=n>999?nf(n/1000,0)+'k':nf(n); }); }
function bar(){ const b=budget(), s=spent(); const sp=document.getElementById('ejsp'); if(!sp) return;
  sp.textContent=fm(s); const r=document.getElementById('ejrem'); const left=b-s;
  r.innerHTML=left>=-1e-9?'<span class="ok">'+L('Te quedan ','Left: ')+fm(Math.max(0,left))+'</span> · '+nf(b?Math.min(100,s/b*100):0,1)+' %':'<span class="ko">'+L('Te pasas en ','Over by ')+fm(-left)+'</span>';
  const ds={}; for(const k in ST.cart){ const it=IB[k]; if(!it) continue; for(const d in DOM) if(DOM[d].indexOf(it.c)>=0) ds[d]=(ds[d]||0)+price(it)*ST.cart[k]; }
  const tot=Math.max(b,s)||1; const br=document.getElementById('ejbar'); br.classList.toggle('over',left<-1e-9);
  br.innerHTML=Object.keys(DOM).map(d=>ds[d]?'<i style="width:'+(ds[d]/tot*100)+'%;background:'+DOMC[d]+'" title="'+e(DOMN[d][EN()?1:0])+'"></i>':'').join('');
  const m=document.getElementById('ejmsg'); const OM=L('El nuevo presupuesto no da para todo: quita unidades.','The new budget does not cover everything: remove some units.'); if(m){ if(left<-1e-9) m.textContent=OM; else if(m.textContent===OM) m.textContent=''; } }
function bind(){ const w=APP.querySelector('.ejw');
  w.addEventListener('click',ev=>{ const t=ev.target.closest('button'); if(!t) return;
    if(t.dataset.b){ ST.b=t.dataset.b; if(ST.b==='custom'&&!ST.cu) ST.cu=Math.round(budgetFullFor('espana')); if(PRE.indexOf(ST.b)>=0) ST.cmp=ST.b; if(ST.b==='otan') ST.cmp='espana';
      w.querySelectorAll('.ejpre .chip').forEach(c=>c.setAttribute('aria-pressed',c===t)); document.getElementById('ejcust').hidden=ST.b!=='custom'; refreshBudget(); save(); upd(); bar(); resum(); return; }
    if(t.dataset.pm!=null){ ST.pm=+t.dataset.pm; w.querySelectorAll('#ejpm .chip').forEach(c=>c.setAttribute('aria-pressed',c===t)); list(); bar(); save(); resum(); return; }
    if(t.id==='ejreal'){ ST.real=ST.real?0:1; t.setAttribute('aria-pressed',!!ST.real); refreshBudget(); upd(); bar(); save(); resum(); return; }
    if(t.dataset.cat){ ST.cat=t.dataset.cat; ST.q=''; const qi=document.getElementById('ejq'); if(qi) qi.value=''; w.querySelectorAll('#ejtabs .chip').forEach(c=>c.setAttribute('aria-pressed',c===t)); list(); return; }
    if(t.dataset.a){ const c=t.closest('.ejit'); if(c) add(c.dataset.id,t.dataset.a); return; }
    if(t.id==='ejver'){ openSum(true); return; }
    if(t.id==='ejclr'){ if(!Object.keys(ST.cart).length) return; ST.cart={}; save(); upd(); bar(); document.getElementById('ejsum').innerHTML=''; document.getElementById('ejmsg').textContent=''; toast(L('Ejército vaciado','Army cleared')); return; }
    if(t.id==='ejcopy'){ copy(shareText(),L('Texto copiado','Text copied')); return; }
    if(t.id==='ejlink'){ copy(shareURL(),L('Enlace copiado','Link copied')); return; }
    if(t.id==='ejnative'){ const d={title:L('Mi ejército en M.A.T','My army on M.A.T'),text:shareText(true),url:shareURL()}; if(navigator.share) navigator.share(d).catch(()=>{}); else copy(shareText(),L('Texto copiado','Text copied')); return; }
    if(t.dataset.vs){ ST.cmp=t.dataset.vs; openSum(false,true); return; }
  });
  const sl=document.getElementById('ejsl'); if(sl) sl.addEventListener('input',()=>{ const v=Math.pow(10,2+4*(+sl.value)/1000); const r=v<1000?10:v<10000?50:v<100000?500:5000; ST.cu=Math.max(100,Math.round(v/r)*r); refreshBudget(); upd(); bar(); save(); });
  w.addEventListener('input',ev=>{ if(ev.target.id==='ejq'){ ST.q=ev.target.value; list(); } });
  w.addEventListener('change',ev=>{ if(ev.target.id==='ejcsel'){ ST.cmp=ev.target.value; openSum(false,true); } });
  w.addEventListener('error',ev=>{ const t=ev.target; if(t&&t.tagName==='IMG'&&t.dataset.ejc){ const p=t.parentNode; p.innerHTML=ico(t.dataset.ejc); } },true);
}
function budgetFullFor(k){ const p=G.p[k]; return p?p.e:30000; }
function resum(){ const s=document.getElementById('ejsum'); if(s&&s.innerHTML) openSum(false,true); }
function copy(t,ok){ const done=()=>toast(ok); if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done,()=>fallback(t,done)); else fallback(t,done); }
function fallback(t,done){ const a=document.createElement('textarea'); a.value=t; a.style.position='fixed'; a.style.opacity='0'; document.body.appendChild(a); a.select(); try{document.execCommand('copy');}catch(_){} a.remove(); done(); }
function shareURL(){ return 'https://matmilitar.es/#/ejercito?'+qstr(true)+'&ver=1'; }
// ---------- resumen ----------
function stats(){ const ds={}; let s=0; for(const k in ST.cart){ const it=IB[k]; if(!it) continue; const v=price(it)*ST.cart[k]; s+=v; for(const d in DOM) if(DOM[d].indexOf(it.c)>=0) ds[d]=(ds[d]||0)+v; }
  const sh={}; for(const d in DOM) sh[d]=s?(ds[d]||0)/s:0; return {ds:ds,s:s,sh:sh,sol:ST.cart.sold||0}; }
function cnt(c,inv){ let n=0; for(const k in ST.cart){ const it=IB[k]; if(!it) continue; const cc=inv?(it.nc?null:(it.cm||it.c)):it.c; if(cc===c) n+=ST.cart[k]; } return n; }
function rating(S){ const b=budget(); const f=b?Math.min(1,S.s/b):0; let sc=f*25; ['aire','mar','tierra'].forEach(d=>{ if(S.sh[d]>=0.1) sc+=15; }); if(cnt('dfa')) sc+=10; if(S.sol>=1000) sc+=10; if(cnt('mis')) sc+=10;
  const stars=Math.max(S.s?1:0,Math.min(5,Math.round(sc/20)));
  let t,d; const has=k=>!!ST.cart[k];
  if(!S.s){ t=L('Ejército vacío','Empty army'); d=L('Todavía no has comprado nada.','You have not bought anything yet.'); }
  else if(!S.sol&&units()>0){ t=L('Ejército fantasma','Ghost army'); d=L('Mucho material y nadie que lo maneje: añade soldados para tripular tus aviones, buques y blindados.','Lots of hardware and nobody to operate it: add soldiers to crew your aircraft, ships and vehicles.'); }
  else if(cnt('por')&&!cnt('buq')&&!cnt('sub')){ t=L('Portaaviones en solitario','Lonely carrier'); d=L('Un portaaviones nunca navega solo: le faltan fragatas, destructores o submarinos de escolta.','A carrier never sails alone: it lacks escorting frigates, destroyers or submarines.'); }
  else if(S.sh.aire>0.6){ t=L('Dueño del cielo','Master of the skies'); d=L('Casi todo tu dinero vuela. Dominarás el aire, pero en tierra y mar vas justo.','Almost all your money flies. You will rule the air, but you are thin on land and at sea.'); }
  else if(S.sh.mar>0.6){ t=L('Gran Armada','Grand Fleet'); d=L('Tu fuerza está en el mar. Ideal para un país con mucha costa… y poco más.','Your strength is at sea. Ideal for a country with a long coastline… and not much else.'); }
  else if(S.sh.tierra>0.6){ t=L('Muro de acero','Wall of steel'); d=L('Carros, blindados y cañones a lo grande. Sin cobertura aérea, ojo con los drones.','Tanks, armour and guns galore. Without air cover, watch out for drones.'); }
  else if(S.sh.dfa>0.4){ t=L('Escudo antiaéreo','Air-defence shield'); d=L('Pocas cosas pasarán por encima de tu territorio, pero te cuesta llevar la iniciativa.','Little will get through your skies, but you will struggle to take the initiative.'); }
  else if(S.sh.mis>0.4){ t=L('Arsenal de misiles','Missile arsenal'); d=L('Muchos misiles y pocas plataformas para lanzarlos.','Plenty of missiles and few platforms to launch them.'); }
  else if(S.sh.sol>0.6){ t=L('Ejército de infantería','Infantry army'); d=L('Mucha gente y poco material: un ejército del siglo XX.','Lots of people and little hardware: a 20th-century army.'); }
  else if(S.sh.aire>=0.15&&S.sh.mar>=0.15&&S.sh.tierra>=0.15&&S.sol){ t=L('Fuerza equilibrada','Balanced force'); d=L('Tierra, mar y aire bien repartidos y con gente para manejarlo todo.','Land, sea and air well spread and with people to run it all.'); }
  else { t=L('Fuerza en construcción','Force in the making'); d=L('Buen comienzo, pero te faltan piezas para cubrir tierra, mar y aire.','A good start, but you are missing pieces to cover land, sea and air.'); }
  return {stars:stars,t:t,d:d,sc:Math.round(sc)}; }
function invCount(c,cats){ const rows=FZ&&FZ.inv&&FZ.inv[c]; if(!rows) return null; let n=0; const cs=cats.split(',');
  rows.forEach(r=>{ if(cs.indexOf(r[2])<0) return; let v=r[3]; if(typeof v!=='number'){ const t=String(r[4]||''); if(/on order|planned|unknown|pedido/i.test(t)&&!/\//.test(t)) v=0; else if(/\//.test(t)) v=+(t.match(/\d+/)||[0])[0]; else { v=0; (t.split('(')[0].match(/\d+/g)||[]).forEach(x=>v+= +x); } } n+=v||0; });
  return n; }
function persons(c){ const x=FB&&FB.c&&FB.c[c]; if(!x||!x.pers) return null; const t=x.pers[0]; const m=t.match(/≈?\s*([\d.,]+)\s*(millones|millón)?/i); if(!m) return null; let v=parseFloat(m[1].replace(/\./g,'').replace(',','.')); if(m[2]) v*=1e6; return v>=100?Math.round(v):null; }
function similar(){ if(!FZ||!FZ.inv) return null; const mine=CMP.map(r=>r[1].reduce((a,c)=>a+cnt(c,1),0)); const tm=mine.reduce((a,b)=>a+b,0); if(!tm) return null; const lm=mine.map(x=>Math.log1p(x)); const nm=Math.hypot(...lm); let best=null;
  for(const c in FZ.inv){ if(!P()[c]) continue; const v=CMP.map(r=>invCount(c,r[0])||0); const tot=v.reduce((a,b)=>a+b,0); if(tot<50) continue; const lv=v.map(x=>Math.log1p(x)); const nv=Math.hypot(...lv); if(!nv) continue;
    const cos=lm.reduce((a,x,i)=>a+x*lv[i],0)/(nm*nv); const sc=cos-0.12*Math.abs(Math.log10(tot/tm));
    if(!best||sc>best.sc) best={c:c,sc:sc}; }
  return best; }
function openSum(scroll,quiet){ const el=document.getElementById('ejsum'); if(!el) return; const S=stats(); const R=rating(S);
  el.innerHTML=sumHTML(S,R,true); if(scroll) el.scrollIntoView({behavior:'smooth',block:'start'});
  ensureFz().then(()=>{ if(!document.getElementById('ejsum')) return; const S2=stats(), R2=rating(S2); el.innerHTML=sumHTML(S2,R2,false); }); }
function sumHTML(S,R,loading){ const b=budget(); const h=[]; const bought=D.items.filter(i=>ST.cart[i.id]);
  h.push('<div class="ejcard" id="ejcard"><div class="k">M.A.T · '+L('Tu ejército','Your army')+'</div><h2 class="ejt">'+e(R.t)+'</h2><div class="ejstars" aria-label="'+R.stars+'/5">'+'★'.repeat(R.stars)+'<s>'+'★'.repeat(5-R.stars)+'</s></div><p class="ejdesc">'+e(R.d)+'</p>');
  h.push('<div class="ejkp"><div><span>'+L('Presupuesto','Budget')+'</span><b>'+fm(b)+'</b></div><div><span>'+L('Gastado','Spent')+'</span><b>'+fm(S.s)+'</b></div><div><span>'+L('Unidades','Units')+'</span><b>'+nf(units())+'</b></div><div><span>'+L('Soldados','Soldiers')+'</span><b>'+nf(S.sol)+'</b></div></div>');
  h.push('<div class="ejdom">'+Object.keys(DOM).map(d=>'<div class="ejdr"><span>'+e(DOMN[d][EN()?1:0])+'</span><div class="tr"><i style="width:'+(S.sh[d]*100)+'%;background:'+DOMC[d]+'"></i></div><em>'+nf(S.sh[d]*100,0)+' %</em></div>').join('')+'</div>');
  if(bought.length) h.push('<ul class="ejbuy">'+bought.map(i=>'<li><b>'+nf(ST.cart[i.id])+' ×</b> '+(i.f&&FICHA[i.f]?'<a href="#/a/'+e(i.f)+'" style="color:var(--tx)">'+e(nm(i))+'</a>':e(nm(i)))+'</li>').join('')+'</ul>');
  // datos curiosos
  const fun=[]; const left=b-S.s;
  if(S.s) fun.push(L('Has gastado el ','You have spent ')+nf(b?S.s/b*100:0,1)+' % '+L('del presupuesto','of the budget')+(left>0.5?'; '+L('te sobran ','you have ')+fm(left)+(EN()?' left':''):'')+'.');
  const sold=IB.sold; if(sold&&S.s){ const big=bought.filter(i=>i.c!=='sol').sort((a,c)=>price(c)-price(a))[0]; if(big){ fun.push(L('Con lo que cuesta un ','What one ')+nm(big)+L(' podrías pagar a ',' costs would pay ')+nf(Math.floor(price(big)/price(sold)))+L(' soldados durante un año.',' soldiers for a year.')); } }
  if(cnt('caz')&&!cnt('mis')) fun.push(L('Tienes cazas pero ningún misil: en la vida real se compran a la vez.','You have fighters but no missiles: in real life they are bought together.'));
  if(ST.real) fun.push(L('Modo realista activado: solo has usado el 20 % del presupuesto total, como pide la OTAN para equipamiento.','Realistic mode on: you only used 20% of the total budget, as NATO asks for equipment.'));
  const sim=!loading&&similar(); if(sim) fun.push(L('Por su composición, tu ejército se parece al de ','By its make-up, your army looks most like that of ')+'<a href="#/fuerzas?a='+e(sim.c)+'">'+e(pn(sim.c))+'</a>.');
  if(fun.length) h.push('<ul class="ejfun">'+fun.map(x=>'<li>'+(x.indexOf('<a ')>=0?x:e(x))+'</li>').join('')+'</ul>');
  // comparación
  h.push('<h3 style="margin:16px 0 6px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu)">'+L('Compáralo con un ejército real','Compare it with a real army')+'</h3>');
  h.push('<div class="chips" role="group">'+PRE.map(k=>'<button type="button" class="chip" data-vs="'+k+'" aria-pressed="'+(ST.cmp===k)+'">'+fl(k,'ejfl')+' '+e(pn(k))+'</button>').join('')+'</div>');
  if(loading){ h.push('<p class="ejnote">'+L('Cargando el inventario real…','Loading the real inventory…')+'</p>'); }
  else if(FZ&&FZ.inv){ const opts=Object.keys(FZ.inv).filter(c=>P()[c]).sort((a,c)=>pn(a).localeCompare(pn(c),EN()?'en':'es'));
    h.push('<div class="ejrow"><label for="ejcsel">'+L('Otro país:','Another country:')+'</label><select class="ejsel" id="ejcsel">'+opts.map(c=>'<option value="'+c+'"'+(c===ST.cmp?' selected':'')+'>'+e(pn(c))+'</option>').join('')+'</select></div>');
    const c=ST.cmp; h.push('<table class="ejtbl"><thead><tr><th>'+L('Categoría','Category')+'</th><th>'+L('Tú','You')+'</th><th>'+fl(c,'ejfl')+' '+e(pn(c))+'</th></tr></thead><tbody>');
    CMP.forEach(r=>{ const m=r[1].reduce((a,x)=>a+cnt(x,1),0); const v=invCount(c,r[0]); h.push('<tr><td>'+e(EN()?r[3]:r[2])+'</td><td class="'+(m>(v||0)?'y':'')+'">'+nf(m)+'</td><td>'+(v==null?'—':nf(v))+'</td></tr>'); });
    const pp=persons(c); h.push('<tr><td>'+L('Militares en activo','Active personnel')+'</td><td class="'+(S.sol>(pp||0)?'y':'')+'">'+nf(S.sol)+'</td><td>'+(pp?'≈'+nf(pp):'—')+'</td></tr></tbody></table>');
    const cp=G.p[c]; h.push('<p class="ejnote">'+L('Inventario real según la sección','Real inventory from the section')+' <a href="#/fuerzas?a='+e(c)+'">'+L('Fuerzas armadas','Armed forces')+' · '+e(pn(c))+'</a> (Wikipedia'+(FZ.revisado?', '+L('revisado ','checked ')+e(FZ.revisado):'')+'): '+L('suma las unidades en servicio de cada categoría (en blindados entran todos los vehículos acorazados; en defensa aérea, lanzadores y sistemas tal como se declaran). Militares en activo: CIA World Factbook (archivo).','adds up the units in service in each category (armoured vehicles include every armoured vehicle; air defence counts launchers and systems as declared). Active personnel: CIA World Factbook (archive).')+(cp?' '+L('Gasto militar de ','Military spending of ')+e(pn(c))+' ('+cp.y+', SIPRI): '+fm(cp.e)+'.':'')+'</p>'); }
  h.push('<div class="ejshare"><button type="button" class="btn pri" id="ejnative">'+L('Compartir','Share')+'</button><button type="button" class="btn" id="ejcopy">'+L('Copiar texto','Copy text')+'</button><button type="button" class="btn" id="ejlink">'+L('Copiar enlace','Copy link')+'</button></div>');
  h.push('</div>'); return h.join(''); }
function shareText(noUrl){ const S=stats(), R=rating(S); const bought=D.items.filter(i=>ST.cart[i.id]);
  let t=L('Mi ejército en M.A.T','My army on M.A.T')+' — '+R.t+' '+'★'.repeat(R.stars)+'☆'.repeat(5-R.stars)+'\n'+L('Presupuesto: ','Budget: ')+fm(budget())+' ('+bdesc()+')\n'+L('Gastado: ','Spent: ')+fm(S.s)+'\n';
  t+=bought.map(i=>'• '+nf(ST.cart[i.id])+' × '+nm(i)).join('\n'); if(!noUrl) t+='\n'+shareURL(); return t; }
