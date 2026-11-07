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
function maxN(it){ return Math.max(0,Math.floor((budget()-spent()+1e-9)/price(it))); }
function stp(it){ return it.c==='sol'?[100,1000]:[1,10]; }
function cpt(v){ return v>=10000?(EN()?nf(v/1000,0)+'k':nf(v/1000,0)+' mil'):nf(v); }
// plantillas: reparto del presupuesto (cuota de cada equipo); las cantidades salen de los precios de siempre
const PRESETS=[['eq','Equilibrado','Balanced',[['ef',.18],['nh90',.06],['mq9b',.03],['a400m',.05],['f110',.15],['s80',.08],['leo2a8',.08],['dragon',.08],['caesar',.04],['nasams',.05],['meteor',.04],['sold',.15]]],
 ['air','Dominio aéreo','Air power',[['ef',.30],['f35a',.22],['a400m',.06],['mrtt',.06],['mq9b',.05],['nh90',.04],['meteor',.08],['irist',.05],['sold',.12]]],
 ['sea','Gran armada','Big navy',[['f110',.28],['s80',.17],['jci',.12],['nh90',.07],['f35b',.07],['nsm',.06],['mq9b',.04],['sold',.16]]],
 ['land','Fuerza terrestre','Land force',[['leo2a8',.20],['dragon',.15],['ascod',.12],['caesar',.08],['himars',.06],['skyr',.06],['tiger3',.07],['jav',.04],['sold',.19]]]];
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
 '.ejit{flex-wrap:wrap}.ejq{flex:1 1 100%;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px 8px;margin-top:2px}'+
 '.ejqq{display:flex;align-items:stretch;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--s2);flex:0 0 auto}'+
 '.ejqq button{min-width:42px;height:44px;padding:0 6px;border:0;background:var(--s2);color:var(--tx);font-size:15px;font-weight:650;line-height:1;cursor:pointer;font-family:inherit;font-variant-numeric:tabular-nums;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}'+
 '.ejqq button.b1{font-size:22px}.ejqq button.pl{background:#2b2f22;color:#d6e09c}.ejqq button:disabled{opacity:.3;cursor:default}.ejqq button:active:not(:disabled){filter:brightness(1.5)}'+
 '.ejqn{width:72px;height:44px;box-sizing:border-box;border:0;border-left:1px solid var(--line);border-right:1px solid var(--line);border-radius:0;background:#0d1013;color:var(--tx);text-align:center;font:inherit;font-size:16px;font-weight:700;font-variant-numeric:tabular-nums;padding:0 2px;margin:0;-webkit-appearance:none;appearance:none}.ejqn:focus{outline:2px solid #d6b25e;outline-offset:-2px}'+
 '.ejx{display:flex;gap:6px;margin-left:auto}.ejx button{height:40px;border:1px solid var(--line);background:transparent;color:var(--tx);border-radius:10px;font-size:13px;padding:0 10px;cursor:pointer;font-family:inherit;white-space:nowrap}.ejx button:disabled{opacity:.35;cursor:default}.ejx button.del{color:#ec9a8a;border-color:#5a3a33}'+
 '.ejlt{font-size:12.5px;color:#d6b25e;margin-top:4px;font-variant-numeric:tabular-nums}.ejlt:empty{display:none}'+
 '.ejit.ko{animation:ejko .7s}@keyframes ejko{0%,100%{box-shadow:none}25%,60%{box-shadow:0 0 0 2px #e06c5a}}.ejit.hi{animation:ejhi 1.6s}@keyframes ejhi{0%,100%{box-shadow:none}20%,70%{box-shadow:0 0 0 2px #d6b25e}}'+
 '.ejarm{display:flex;align-items:center;gap:6px;width:100%;margin-top:7px;min-height:40px;box-sizing:border-box;border:1px solid #6f6236;border-radius:10px;background:#1b1a12;color:var(--tx);font:inherit;font-size:14px;padding:6px 12px;cursor:pointer;text-align:left;line-height:1.25}.ejarm b{color:#d6b25e;font-variant-numeric:tabular-nums}.ejarm .t{font-weight:650;white-space:nowrap}.ejarm .lb{color:var(--mu);min-width:0}.ejarm .ar{margin-left:auto;color:#d6b25e;transition:transform .2s;flex:0 0 auto}.ejarm[aria-expanded=true] .ar{transform:rotate(180deg)}'+
 '.ejpan{max-height:min(62vh,480px);overflow:auto;margin-top:6px;overscroll-behavior:contain}.ejpan[hidden]{display:none}'+
 '.ejr{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid var(--line)}.ejr .nmw{flex:1 1 auto;min-width:0}.ejr .rn{display:block;background:none;border:0;color:var(--tx);font:inherit;font-size:14px;font-weight:600;text-align:left;padding:0;cursor:pointer;overflow-wrap:anywhere;line-height:1.25}.ejr .rc{display:block;font-size:12.5px;color:#d6b25e;font-variant-numeric:tabular-nums;margin-top:2px}'+
 '.ejr .ejqq button{min-width:40px;height:40px}.ejr .ejqn{width:76px;height:40px}.ejr .rx{flex:0 0 auto;width:40px;height:40px;border:1px solid #5a3a33;background:transparent;color:#ec9a8a;border-radius:10px;font-size:17px;cursor:pointer;font-family:inherit}'+
 '.ejtot{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:8px 0;border-top:1px solid var(--line);font-size:14px;font-variant-numeric:tabular-nums}.ejtot b{color:#d6b25e}.ejtot .ko{color:#e06c5a}.ejpf{display:flex;gap:8px;flex-wrap:wrap;padding:2px 0 4px}.ejpf .btn{flex:1 1 140px;min-height:44px}'+
 '.ejcf{border:1px solid #e06c5a;background:#2a1714;border-radius:10px;padding:10px 12px;margin:8px 0;font-size:14px;line-height:1.4}.ejcf div{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}.ejcf .btn{flex:1 1 120px;min-height:44px}.ejcf .btn.dg{background:#e06c5a;border-color:#e06c5a;color:#0b0c0d;font-weight:650}'+
 '.ejtip{font-size:13.5px;line-height:1.45;color:#cfd1cd;background:var(--s2);border-left:3px solid #d6b25e;border-radius:0 6px 6px 0;padding:8px 10px;margin:0 0 10px}.ejtip b{color:#d6b25e}'+
 '.ejh2{margin:16px 0 4px;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu);font-weight:600}.ejpst{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0 2px}.ejpst>span{font-size:13px;color:var(--mu);margin-right:2px}.ejpst .chip{min-height:38px}'+
 '.ejcu{width:110px;height:40px;box-sizing:border-box;border:1px solid var(--line);border-radius:8px;background:var(--s1);color:var(--tx);font:inherit;font-size:16px;padding:0 10px;font-variant-numeric:tabular-nums}.ejcu:focus{outline:none;border-color:#d6b25e}'+
 '.ejtoast button{margin-left:10px;background:#0b0c0d;color:#d6b25e;border:0;border-radius:999px;padding:5px 12px;font:inherit;font-size:13px;font-weight:650;cursor:pointer}.ejbuy .c{color:var(--mu);font-size:12.5px;font-variant-numeric:tabular-nums}'+
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
  if(q.b){ any=true; if(/^c\d+$/.test(q.b)){ST.b='custom';ST.cu=Math.max(100,Math.min(1e6,+q.b.slice(1)));} else if(PRE.indexOf(q.b)>=0||q.b==='otan'||(G&&G.p[q.b]&&G.p[q.b].e)) ST.b=q.b; }
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
  ensure().then(()=>{ if(!/^#\/ejercito/.test(location.hash)) return; css2(); const md=mode();
    if(md==='renovacion') return ensureEs().then(()=>{ if(mode()==='renovacion') renov(); });
    if(md==='asistente') return asis();
    if(md!=='libre') return entry();
    load(); readURL(); if(!ST.cmp) ST.cmp=(ST.b==='custom'||ST.b==='otan')?'espana':ST.b; page(); if(ST.open) openSum(true); try{ if(sessionStorage.getItem('ej_asis')){ sessionStorage.removeItem('ej_asis'); toast(L('Propuesta del asistente cargada: cámbiala a tu gusto','Assistant suggestion loaded: change it as you like')); } }catch(_){} }).catch(err=>{ console.warn('ejercito',err); const w=app.querySelector('.ejw .sub'); if(w) w.textContent=L('No se pudieron cargar los datos. Actualiza la página.','Could not load the data. Please reload.'); });
}
function bdesc(){ if(ST.b==='custom') return L('Presupuesto personalizado','Custom budget');
  if(ST.b==='otan') return L('España · cifra de la OTAN 2025 (estimación, sin pensiones)','Spain · NATO 2025 figure (estimate, excl. pensions)');
  const p=G.p[ST.b]; return pn(ST.b)+' · '+L('gasto militar ','military spending ')+p.y+' (SIPRI)'; }
function page(){
  const h=[]; h.push('<div class="ejw" data-noi18n>');
  h.push(X.crumbs([[L('Inicio','Home'),'#/'],[L('Crea tu ejército','Build your army'),'#/ejercito'],[L('Modo libre','Free mode')]])+'<a class="ejback" href="#/ejercito">← '+L('Otros modos','Other modes')+'</a>');
  h.push('<h1>'+L('Crea tu ejército','Build your army')+'</h1>');
  h.push('<p class="ejlead">'+L('Tienes el presupuesto de defensa de un país real. Gástalo en cazas, fragatas, carros de combate, drones, defensa aérea y soldados con precios reales sacados de contratos y presupuestos públicos, y al final compara tu ejército con el de verdad.','You get a real country\'s defence budget. Spend it on fighters, frigates, tanks, drones, air defence and soldiers at real prices taken from public contracts and budgets, then compare your army with the real one.')+'</p>');
  h.push('<p class="ejtip"><b>'+L('Cómo se juega:','How to play:')+'</b> '+L('toca + o −, o escribe la cantidad (mantén pulsado para ir rápido). Arriba, «Tu ejército» muestra lo que llevas, cuánto cuesta y te deja quitarlo todo de un toque.','tap + or −, or type the number (press and hold to go faster). Up top, «Your army» shows what you have, what it costs, and lets you remove anything in one tap.')+'</p>');
  // presupuesto
  h.push('<div class="ejbox"><h3>'+L('1 · Elige el presupuesto','1 · Pick the budget')+'</h3><div class="chips ejpre" role="group">');
  PRE.forEach(k=>{ if(!G.p[k]) return; h.push('<button type="button" class="chip" data-b="'+k+'" aria-pressed="'+(ST.b===k)+'">'+fl(k,'ejfl')+' '+e(pn(k))+'</button>'); });
  h.push('<button type="button" class="chip" data-b="otan" aria-pressed="'+(ST.b==='otan')+'">'+fl('espana','ejfl')+' '+L('España (OTAN)','Spain (NATO)')+'</button>');
  h.push('<button type="button" class="chip" data-b="custom" aria-pressed="'+(ST.b==='custom')+'">'+L('Personalizado','Custom')+'</button></div>');
  h.push('<div class="ejbud" style="margin-top:10px"><b id="ejbudv"></b><span id="ejbudd"></span></div>');
  h.push('<div id="ejcust"'+(ST.b==='custom'?'':' hidden')+'><div class="ejrow"><label for="ejcu">'+L('Cifra (M€):','Amount (€M):')+'</label><input class="ejcu" id="ejcu" type="text" inputmode="numeric" autocomplete="off"></div><input class="ejrange" type="range" min="0" max="1000" step="1" id="ejsl" aria-label="'+L('Presupuesto personalizado','Custom budget')+'"><div class="ejnote">'+L('De 100 M€ a 1 billón de euros (escala logarítmica).','From €100M to €1 trillion (log scale).')+'</div></div>');
  h.push('<details class="ejnote"><summary style="cursor:pointer;color:var(--ac2)">'+L('Sobre esta cifra','About this figure')+'</summary><span id="ejbnote"></span></details>');
  h.push('<div class="ejrow"><label>'+L('Precio:','Price:')+'</label><div class="chips" role="group" id="ejpm">'+[[0,L('Mínimo','Lowest')],[1,L('Medio','Middle')],[2,L('Máximo','Highest')]].map(x=>'<button type="button" class="chip" data-pm="'+x[0]+'" aria-pressed="'+(ST.pm===x[0])+'">'+x[1]+'</button>').join('')+'</div></div>');
  h.push('<div class="ejrow"><button type="button" class="chip" id="ejreal" aria-pressed="'+(!!ST.real)+'">'+L('Modo realista: solo el 20 % para compras','Realistic mode: only 20% for purchases')+'</button></div>');
  h.push('<p class="ejnote">'+e(D.nato20[EN()?'en':'es'])+' <a href="'+e(D.nato20.src[1])+'" target="_blank" rel="noopener">'+L('Fuente','Source')+'</a></p></div>');
  // barra fija
  h.push('<div class="ejsticky" id="ejstk"><div class="ejst"><span>'+L('Gastado','Spent')+' <b id="ejsp"></b></span><span id="ejrem"></span></div><div class="ejbar" id="ejbar"></div><div class="ejmsg" id="ejmsg" role="status" aria-live="polite"></div><button type="button" class="ejarm" id="ejarm" aria-expanded="false" aria-controls="ejpan"><span class="t">'+L('Tu ejército','Your army')+'</span><span class="lb"></span><span class="ar" aria-hidden="true">▾</span></button><div class="ejpan" id="ejpan" hidden></div></div>');
  h.push('<h3 class="ejh2">'+L('2 · Compra tu equipo','2 · Buy your equipment')+'</h3>'+presetHTML(L('Empieza rápido:','Quick start:')));
  // pestañas
  h.push('<div class="ejsrch"><input type="search" id="ejq" autocomplete="off" enterkeyhint="search" aria-label="'+L('Buscar equipo','Search equipment')+'" placeholder="'+L('Buscar: F-35, Leopard, Rusia… ('+D.items.length+' equipos)','Search: F-35, Leopard, Russia… ('+D.items.length+' items)')+'"></div>');
  h.push('<div class="chips ejtabs" role="tablist" id="ejtabs">'+D.cats.map(c=>'<button type="button" class="chip" role="tab" data-cat="'+c[0]+'" aria-pressed="'+(ST.cat===c[0])+'">'+e(EN()?c[2]:c[1])+'<em hidden></em></button>').join('')+'</div>');
  h.push('<div class="ejlist" id="ejlist"></div>');
  h.push('<div class="ejgo"><button type="button" class="btn pri" id="ejver">'+L('Ver mi ejército','See my army')+' ›</button><button type="button" class="btn" id="ejclr" data-clr="1">'+L('Vaciar ejército','Clear army')+'</button></div>');
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
  const ci=document.getElementById('ejcu'); if(ci&&ci!==document.activeElement) ci.value=nf(Math.round(ST.cu||0));
}
const nrm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
function list(){ const el=document.getElementById('ejlist'); if(!el) return; const qv=nrm(ST.q); const its=qv?D.items.filter(i=>nrm(i.n+' '+(i.ne||'')+' '+(i.o||[]).map(k=>pn(k)+' '+((P()[k]||{}).n||'')).join(' ')).indexOf(qv)>=0):D.items.filter(i=>i.c===ST.cat);
  el.innerHTML=its.length?its.map(card).join(''):'<p class="ejnote">'+L('No hay ningún equipo con ese nombre.','No equipment matches that name.')+'</p>'; upd(); }
function card(it){ const q=ST.cart[it.id]||0; const B=D.basis[it.b]||['','']; const est=it.b==='est';
  const src=it.s.map(k=>{const s=D.src[k]; return s?'<a href="'+e(s[1])+'" target="_blank" rel="noopener nofollow">'+e(s[0])+'</a>':'';}).join('<br>');
  const fich=it.f&&FICHA[it.f]?' · <a href="#/a/'+e(it.f)+'">'+L('Ver ficha','View entry')+' ›</a>':'';
  const per=it.u?' '+(EN()?it.u[1]:it.u[0]):it.c==='sol'?L(' /año',' /year'):it.c==='mis'?L(' /misil',' /missile'):it.c==='dfa'?L(' /sistema',' /system'):'';
  const th=it.f&&FICHA[it.f]?'<a class="ejth" href="#/a/'+e(it.f)+'" aria-label="'+e(nm(it))+'">'+thumb(it)+'</a>':'<div class="ejth">'+ico(it.c)+'</div>';
  return '<div class="ejit'+(q?' has':'')+'" data-id="'+it.id+'">'+th+'<div class="ejm"><div class="ejn">'+e(nm(it))+(it.o||[]).slice(0,4).map(k=>fl(k)).join('')+'</div>'+
   '<div class="ejp"><b>'+fmr(it)+per+'</b><span class="ejb'+(est?' est':'')+'">'+e(EN()?B[1]:B[0])+'</span>'+(it.x&&!est?'<span class="ejb est">'+L('Estimación','Estimate')+'</span>':'')+'</div>'+
   '<details><summary>'+L('De dónde sale el precio','Where the price comes from')+'</summary><p>'+e(EN()?it.en:it.es)+'</p><p>'+src+fich+'</p></details>'+
   '<div class="ejlt"></div></div><div class="ejq">'+qq(it,false)+'<div class="ejx"><button type="button" class="mx" data-a="max">'+L('Máx','Max')+'</button><button type="button" class="del" data-a="del" hidden>✕ '+L('Quitar','Remove')+'</button></div></div></div>'; }
function qq(it,small){ const sp=stp(it), q=ST.cart[it.id]||0, N=e(nm(it));
  const b=(v,c)=>'<button type="button" class="'+c+'" data-a="'+v+'" aria-label="'+(v<0?L('Quitar ','Remove ')+nf(-v):L('Añadir ','Add ')+nf(v))+' · '+N+'">'+(v<0?'−':'+')+(Math.abs(v)===1?'':nf(Math.abs(v)))+'</button>';
  return '<div class="ejqq">'+(small?'':b(-sp[1],''))+b(-sp[0],sp[0]===1?'b1':'')+'<input class="ejqn" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" value="'+nf(q)+'" aria-label="'+L('Cantidad','Quantity')+' · '+N+'">'+b(sp[0],'pl'+(sp[0]===1?' b1':''))+(small?'':b(sp[1],'pl'))+'</div>'; }
function toast(t,act){ let x=document.querySelector('.ejtoast'); if(!x){x=document.createElement('div');x.className='ejtoast';x.setAttribute('role','status');document.body.appendChild(x);} x.textContent=t;
  if(act){ const b=document.createElement('button'); b.type='button'; b.textContent=L('Deshacer','Undo'); b.addEventListener('click',()=>{ act(); x.style.display='none'; }); x.appendChild(b); }
  clearTimeout(x._t); x.style.display='block'; x._t=setTimeout(()=>{x.style.display='none';},act?5000:2000); }
let UNDO=null;
function snap(){ UNDO=Object.assign({},ST.cart); }
function undo(){ if(!UNDO) return; ST.cart=UNDO; UNDO=null; after(); toast(L('Recuperado','Restored')); }
function after(){ const m=document.getElementById('ejmsg'); if(m) m.textContent=''; save(); upd(); bar(); resum(); }
function flash(id,cl){ const c=document.querySelector('#ejlist .ejit[data-id="'+id+'"]'); if(!c) return; c.classList.remove(cl||'ko'); void c.offsetWidth; c.classList.add(cl||'ko'); }
// fija la cantidad de una línea; devuelve true si cambió sin topar con el presupuesto
function setQ(id,q,quiet){ const it=IB[id]; if(!it) return false; const pr=price(it), cur=ST.cart[id]||0; q=Math.max(0,Math.min(9999999,Math.floor(+q||0))); let capped=false;
  if(q>cur){ const can=maxN(it); if(can<1){ msg(it,pr-(budget()-spent())); flash(id); upd(); return false; } if(q-cur>can){ q=cur+can; capped=true; } }
  if(q===cur){ upd(); return false; }
  if(q>0) ST.cart[id]=q; else delete ST.cart[id];
  const m=document.getElementById('ejmsg'); if(m) m.textContent='';
  if(capped){ if(m) m.textContent=L('Tope del presupuesto: solo te llegaba para ','Budget limit: you could only afford ')+nf(q-cur)+' '+L('más','more')+' ('+nm(it)+').'; toast(L('Solo te llegaba para ','You could only afford ')+nf(q-cur)+' '+L('más','more')); flash(id); }
  upd(); bar(); if(!quiet){ save(); resum(); } return !capped; }
function add(id,a,quiet){ const it=IB[id]; if(!it) return false; const cur=ST.cart[id]||0;
  if(a==='max') return setQ(id,cur+Math.max(1,maxN(it)),quiet);
  if(a==='del'){ if(!cur) return false; snap(); setQ(id,0,quiet); toast(nm(it)+L(' quitado',' removed'),undo); return true; }
  return setQ(id,cur+(+a),quiet); }
function msg(it,miss){ const m=document.getElementById('ejmsg'); if(m) m.textContent=L('No te llega para ','Not enough for ')+nm(it)+': '+L('te faltan ','you are short by ')+fm(miss)+'. '+L('Quita algo o sube el presupuesto.','Remove something or raise the budget.'); toast(L('Presupuesto insuficiente','Not enough budget')); }
function upd(){ const left=budget()-spent();
  document.querySelectorAll('#ejlist .ejit').forEach(c=>{ const it=IB[c.dataset.id]; if(!it) return; const q=ST.cart[it.id]||0; const pr=price(it); const mx=maxN(it);
    c.classList.toggle('has',q>0); const inp=c.querySelector('.ejqn'); if(inp&&inp!==document.activeElement) inp.value=nf(q);
    c.querySelectorAll('[data-a]').forEach(b=>{ const a=b.dataset.a;
      if(a==='del'){ b.hidden=!q; return; }
      if(a==='max'){ b.disabled=mx<1; b.textContent=L('Máx','Max')+(mx>0?' +'+cpt(mx):''); b.title=mx>0?L('Añadir todo lo que te llega: ','Add as many as you can afford: ')+nf(mx):L('No te llega para ninguno más','You cannot afford any more'); return; }
      b.disabled=(+a)<0?!q:pr>left+1e-9; });
    const lt=c.querySelector('.ejlt'); if(lt) lt.textContent=q?L('En tu ejército: ','In your army: ')+nf(q)+' · '+fm(pr*q):''; });
  const cnt={}; for(const k in ST.cart){ const it=IB[k]; if(it) cnt[it.c]=(cnt[it.c]||0)+ST.cart[k]; }
  document.querySelectorAll('#ejtabs .chip').forEach(b=>{ const em=b.querySelector('em'); const n=cnt[b.dataset.cat]||0; em.hidden=!n; em.textContent=n>999?nf(n/1000,0)+'k':nf(n); });
  panel(); }
// ---------- «Tu ejército» (panel fijo) ----------
let PK='';
function presetHTML(lead){ return '<div class="ejpst" role="group">'+(lead?'<span>'+e(lead)+'</span>':'')+PRESETS.map(p=>'<button type="button" class="chip" data-pre="'+p[0]+'">'+e(EN()?p[2]:p[1])+'</button>').join('')+'</div>'; }
function prow(it){ return '<div class="ejr" data-id="'+it.id+'"><div class="nmw"><button type="button" class="rn" data-go="'+it.id+'">'+e(nm(it))+'</button><span class="rc"></span></div>'+qq(it,true)+'<button type="button" class="rx" data-a="del" aria-label="'+L('Quitar','Remove')+' · '+e(nm(it))+'" title="'+L('Quitar','Remove')+'">✕</button></div>'; }
function panel(){ const tg=document.getElementById('ejarm'), pa=document.getElementById('ejpan'); if(!tg||!pa) return;
  const its=D.items.filter(i=>ST.cart[i.id]); const u=units(), so=ST.cart.sold||0; const pl=(v,a,b)=>'<b>'+nf(v)+'</b> '+(v===1?a:b);
  const parts=[]; if(u) parts.push(pl(u,L('unidad','unit'),L('unidades','units'))); if(so) parts.push(pl(so,L('soldado','soldier'),L('soldados','soldiers')));
  tg.querySelector('.lb').innerHTML=its.length?'· '+parts.join(' · '):'· '+L('vacío','empty');
  if(pa.hidden){ PK=''; return; }
  const key=its.map(i=>i.id).join(',')+'|'+EN();
  if(key!==PK){ PK=key; pa.innerHTML=its.length?its.map(prow).join('')+'<div class="ejtot" id="ejtot"></div><div class="ejpf"><button type="button" class="btn pri" id="ejver2">'+L('Ver valoración','See rating')+' ›</button><button type="button" class="btn" data-clr="1">'+L('Vaciar ejército','Clear army')+'</button></div>'
      :'<p class="ejnote" style="font-size:13.5px">'+L('Aún no llevas nada. Toca + en cualquier equipo de la lista o empieza con una plantilla:','Nothing here yet. Tap + on any item in the list, or start from a template:')+'</p>'+presetHTML(''); }
  const left=budget()-spent();
  pa.querySelectorAll('.ejr').forEach(r=>{ const it=IB[r.dataset.id]; if(!it) return; const q=ST.cart[it.id]||0, pr=price(it); const inp=r.querySelector('.ejqn'); if(inp&&inp!==document.activeElement) inp.value=nf(q);
    r.querySelector('.rc').textContent=fm(pr*q)+(q>1?' · '+fm(pr)+' '+L('c/u','each'):'');
    r.querySelectorAll('.ejqq [data-a]').forEach(b=>{ b.disabled=(+b.dataset.a)<0?!q:pr>left+1e-9; }); });
  const tt=document.getElementById('ejtot'); if(tt) tt.innerHTML='<span>'+L('Total','Total')+' <b>'+fm(spent())+'</b> '+L('de','of')+' '+fm(budget())+'</span>'+(left>=-1e-9?'<span>'+L('Te quedan ','Left: ')+'<b>'+fm(Math.max(0,left))+'</b></span>':'<span class="ko">'+L('Te pasas en ','Over by ')+fm(-left)+'</span>'); }
function togglePanel(open){ const tg=document.getElementById('ejarm'), pa=document.getElementById('ejpan'); if(!tg||!pa) return; const o=open==null?pa.hidden:open; pa.hidden=!o; tg.setAttribute('aria-expanded',o); PK=''; panel(); }
function goTo(id){ const it=IB[id]; if(!it) return; togglePanel(false); ST.cat=it.c; ST.q=''; const qi=document.getElementById('ejq'); if(qi) qi.value='';
  document.querySelectorAll('#ejtabs .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.cat===it.c)); list();
  const c=document.querySelector('#ejlist .ejit[data-id="'+id+'"]'); if(c){ c.scrollIntoView({block:'center'}); flash(id,'hi'); } }
function applyPreset(k){ const p=PRESETS.find(x=>x[0]===k); if(!p) return; const B=budget(); if(Object.keys(ST.cart).length) snap(); else UNDO={};
  const c={}; p[3].forEach(x=>{ const it=IB[x[0]]; if(!it) return; const q=Math.round(x[1]*B/price(it)); if(q>0) c[x[0]]=q; });
  let tot=()=>{ let t=0; for(const id in c) t+=price(IB[id])*c[id]; return t; };
  if(tot()>B&&c.sold){ c.sold=Math.max(0,c.sold-Math.ceil((tot()-B)/price(IB.sold))); if(!c.sold) delete c.sold; }
  while(tot()>B){ const ids=Object.keys(c).sort((a,b)=>price(IB[b])-price(IB[a])); if(!ids.length) break; const id=ids[0]; c[id]--; if(!c[id]) delete c[id]; }
  ST.cart=c; after(); togglePanel(true); toast(L('Plantilla «','Template «')+(EN()?p[2]:p[1])+L('» cargada: cámbiala a tu gusto','» loaded: change it as you like'),undo); }
function askClear(btn){ document.querySelectorAll('.ejcf').forEach(x=>x.remove()); const its=Object.keys(ST.cart); if(!its.length){ toast(L('Tu ejército ya está vacío','Your army is already empty')); return; }
  const d=document.createElement('div'); d.className='ejcf'; d.setAttribute('role','alertdialog');
  d.innerHTML=L('¿Vaciar tu ejército? Se quitan ','Clear your army? This removes ')+nf(its.length)+' '+(its.length===1?L('línea','line'):L('líneas','lines'))+' ('+fm(spent())+').<div><button type="button" class="btn dg" data-cf="1">'+L('Sí, vaciar','Yes, clear it')+'</button><button type="button" class="btn" data-cf="0">'+L('Cancelar','Cancel')+'</button></div>';
  btn.parentNode.insertAdjacentElement('afterend',d); const y=d.querySelector('[data-cf="0"]'); if(y) y.focus({preventScroll:true}); }
function doClear(){ snap(); ST.cart={}; const s=document.getElementById('ejsum'); if(s) s.innerHTML=''; after(); toast(L('Ejército vaciado','Army cleared'),undo); }
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
    if(t.dataset.a){ if(t._held){ t._held=0; return; } const c=t.closest('[data-id]'); if(c) add(c.dataset.id,t.dataset.a); return; }
    if(t.id==='ejarm'){ togglePanel(); return; }
    if(t.dataset.go){ goTo(t.dataset.go); return; }
    if(t.dataset.pre){ applyPreset(t.dataset.pre); return; }
    if(t.dataset.clr){ askClear(t); return; }
    if(t.dataset.cf!=null){ const d=t.closest('.ejcf'); if(d) d.remove(); if(t.dataset.cf==='1') doClear(); return; }
    if(t.id==='ejver'||t.id==='ejver2'){ togglePanel(false); openSum(true); return; }
    if(t.id==='ejcopy'){ copy(shareText(),L('Texto copiado','Text copied')); return; }
    if(t.id==='ejlink'){ copy(shareURL(),L('Enlace copiado','Link copied')); return; }
    if(t.id==='ejnative'){ const d={title:L('Mi ejército en M.A.T','My army on M.A.T'),text:shareText(true),url:shareURL()}; if(navigator.share) navigator.share(d).catch(()=>{}); else copy(shareText(),L('Texto copiado','Text copied')); return; }
    if(t.dataset.vs){ ST.cmp=t.dataset.vs; openSum(false,true); return; }
  });
  const sl=document.getElementById('ejsl'); if(sl) sl.addEventListener('input',()=>{ const v=Math.pow(10,2+4*(+sl.value)/1000); const r=v<1000?10:v<10000?50:v<100000?500:5000; ST.cu=Math.max(100,Math.round(v/r)*r); refreshBudget(); upd(); bar(); save(); });
  w.addEventListener('input',ev=>{ if(ev.target.id==='ejq'){ ST.q=ev.target.value; list(); } });
  // cantidad escrita a mano (también el presupuesto personalizado)
  const num=v=>+(String(v).replace(/[^0-9]/g,'')||0);
  w.addEventListener('focusin',ev=>{ const t=ev.target; if(t.classList&&(t.classList.contains('ejqn')||t.id==='ejcu')){ const v=num(t.value); t.value=v?String(v):''; setTimeout(()=>{ if(document.activeElement===t){ try{t.select();}catch(_){} } },0); } });
  w.addEventListener('focusout',ev=>{ const t=ev.target; if(!t.classList) return; if(t.classList.contains('ejqn')){ const r=t.closest('[data-id]'); if(r) setQ(r.dataset.id,num(t.value)); t.value=nf(ST.cart[r?r.dataset.id:'']||0); }
    else if(t.id==='ejcu'){ const v=num(t.value); if(v){ ST.cu=Math.max(100,Math.min(1e6,v)); refreshBudget(); upd(); bar(); save(); resum(); } t.value=nf(Math.round(ST.cu||0)); } });
  w.addEventListener('keydown',ev=>{ const t=ev.target; if(ev.key==='Enter'&&t.classList&&(t.classList.contains('ejqn')||t.id==='ejcu')){ ev.preventDefault(); t.blur(); } });
  // mantener pulsado: repite y acelera (a los ~1,5 s salta de 10 en 10, o de 100 en 100)
  let HOLD=null; const stop=()=>{ if(!HOLD) return; clearTimeout(HOLD.t); const h=HOLD; HOLD=null; if(h.on){ save(); resum(); } };
  w.addEventListener('pointerdown',ev=>{ if(ev.button>0) return; const b=ev.target.closest('button[data-a]'); if(!b||b.disabled||!/^-?\d+$/.test(b.dataset.a)) return; const r=b.closest('[data-id]'); if(!r) return; stop(); b._held=0;
    const h=HOLD={b:b,id:r.dataset.id,st:+b.dataset.a,k:0,on:false,iv:170};
    const tick=()=>{ if(HOLD!==h) return; h.on=true; b._held=1; const ok=add(h.id,String(h.st*(h.k>=12?10:1)),true); h.k++; if(!ok||b.disabled||!b.isConnected){ stop(); return; } h.iv=Math.max(45,h.iv*0.86); h.t=setTimeout(tick,h.iv); };
    h.t=setTimeout(tick,420); });
  ['pointerup','pointercancel'].forEach(k=>w.addEventListener(k,stop)); w.addEventListener('pointerout',ev=>{ if(HOLD&&ev.target===HOLD.b&&!HOLD.b.contains(ev.relatedTarget)) stop(); });
  window.addEventListener('blur',stop); w.addEventListener('contextmenu',ev=>{ if(ev.target.closest('.ejqq')) ev.preventDefault(); });
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
  if(bought.length) h.push('<ul class="ejbuy">'+bought.map(i=>'<li><b>'+nf(ST.cart[i.id])+' ×</b> '+(i.f&&FICHA[i.f]?'<a href="#/a/'+e(i.f)+'" style="color:var(--tx)">'+e(nm(i))+'</a>':e(nm(i)))+' <span class="c">· '+fm(price(i)*ST.cart[i.id])+'</span></li>').join('')+'</ul>');
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

// ---------- v2: pantalla de entrada, Renovación España y Asistente ----------
function mode(){ const h=location.hash.replace(/^#\/?/,''), qi=h.indexOf('?'), path=(qi>=0?h.slice(0,qi):h).split('/').filter(Boolean);
  if(path[1]) return path[1]; return (qi>=0&&h.slice(qi+1).length)?'libre':''; }
function mp(it){ return (it.lo+it.hi)/2; }
function css2(){ if(document.getElementById('ej-css2')) return; const s=document.createElement('style'); s.id='ej-css2';
 s.textContent='.ejmodes{display:grid;gap:12px;margin:14px 0}@media(min-width:900px){.ejmodes{grid-template-columns:1.25fr 1fr 1fr}}'+
 '.ejmode{display:block;text-decoration:none;color:inherit;border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:16px 16px 18px;min-height:44px;position:relative}'+
 '.ejmode:hover,.ejmode:focus-visible{border-color:var(--ac2)}.ejmode h2{margin:2px 0 6px;font-size:22px;text-transform:none;letter-spacing:0;line-height:1.2}.ejmode p{margin:0;color:#cfd1cd;font-size:14.5px;line-height:1.45}'+
 '.ejmode .k{font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu)}.ejmode .go{display:inline-block;margin-top:12px;font-weight:600;color:var(--ac2);font-size:15px}'+
 '.ejmode.main{border-color:#d6b25e;background:linear-gradient(160deg,rgba(214,178,94,.13),rgba(214,178,94,0) 60%),var(--s1)}.ejmode.main .go{color:#d6b25e}'+
 '.ejmode .bdg{position:absolute;top:12px;right:12px;font-size:11px;background:#d6b25e;color:#111;border-radius:99px;padding:2px 8px;font-weight:700}'+
 '.rvw,.asw{max-width:920px}.ejback{display:inline-flex;align-items:center;min-height:40px;color:var(--ac2);text-decoration:none;font-size:14px}'+
 '.rvbud .big{font-size:22px;color:#d6b25e;font-weight:700;font-variant-numeric:tabular-nums}.rvbud .ln{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:13.5px;margin:4px 0}'+
 '.rvbar{height:14px;border-radius:7px;background:rgba(255,255,255,.08);overflow:hidden;position:relative;margin:6px 0 4px}.rvbar i{position:absolute;left:0;top:0;bottom:0;background:#d6b25e;border-radius:7px;transition:width .2s}.rvbar.over i{background:#d0563f}'+
 '.rvstk{position:sticky;top:0;z-index:5;background:var(--bg,#0f1110);padding:8px 0 6px;border-bottom:1px solid var(--line)}.rvstk .ln{display:flex;justify-content:space-between;gap:6px;font-size:13.5px;flex-wrap:wrap}.rvstk b{font-variant-numeric:tabular-nums}'+
 '.rvtabs{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:12px 0 8px}.rvtabs button{min-height:48px;font-size:13.5px;line-height:1.15;padding:6px 4px;white-space:normal}'+
 '.rvrow{border:1px solid var(--line);border-radius:var(--r);background:var(--s1);padding:10px 12px;margin:8px 0}.rvrow.chg{border-color:#d6b25e}'+
 '.rvhd{display:flex;gap:10px;align-items:flex-start}.rvth{flex:0 0 72px;width:72px;height:48px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center}.rvth img{width:100%;height:100%;object-fit:cover}.rvth svg{width:34px;height:34px}.rvhd>div{min-width:0}'+
 '.rvrow h4{margin:0;font-size:16px}.rvrow .meta{font-size:13px;color:var(--mu);margin:3px 0 0;line-height:1.4}.rvrow .meta b{color:#e8e6df;font-size:15px}.rvrow .meta a{color:var(--ac2)}'+
 '.rvseg{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:10px 0 0}.rvseg button{min-height:44px;font-size:13px;padding:4px 2px;border-radius:9px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:#e8e6df;cursor:pointer;line-height:1.1}'+
 '.rvseg button[aria-pressed=true]{background:#d6b25e;color:#111;border-color:#d6b25e;font-weight:700}.rvseg button[data-v=r][aria-pressed=true]{background:#d0563f;border-color:#d0563f;color:#fff}.rvseg button:disabled{opacity:.35;cursor:default}'+
 '@media(max-width:350px){.rvseg{grid-template-columns:repeat(2,1fr)}}'+
 '.rvdet{margin:10px 0 0;padding:8px 0 0;border-top:1px dashed var(--line)}.rvdet .ejqq{margin:0 0 6px}.rvdet .ct{font-size:13.5px;line-height:1.45}.rvdet .ct b{font-variant-numeric:tabular-nums}'+
 '.rvtag{display:inline-block;font-size:11px;border:1px solid #b9935a;color:#e0c48c;border-radius:5px;padding:0 5px;margin-left:4px;vertical-align:1px}.rvtag.ok{border-color:#5f9a6e;color:#9fd1a9}'+
 '.rvadd{width:100%;min-height:50px;font-size:15px;margin:10px 0}.rvpick{border:1px solid var(--ac2);border-radius:var(--r);padding:10px;margin:8px 0;background:var(--s1)}.rvpick input{width:100%;min-height:44px;font-size:16px;box-sizing:border-box;margin:0 0 6px}'+
 '.rvpick .lst{max-height:360px;overflow:auto}.rvpick .lst button{display:flex;justify-content:space-between;gap:8px;width:100%;text-align:left;min-height:46px;padding:6px 8px;border:0;border-bottom:1px solid var(--line);background:none;color:#e8e6df;font-size:14.5px;cursor:pointer}.rvpick .lst button span{color:var(--mu);font-size:13px;white-space:nowrap}'+
 '.rvgo{width:100%;min-height:54px;font-size:17px;margin:16px 0 6px}'+
 '.ejw .ejbox h2.rvh{margin:2px 0 10px;font-size:22px;text-transform:none;letter-spacing:0;color:#ecebe6;font-weight:700}.rvsum h3{margin:16px 0 8px}.rvsum table{width:100%;border-collapse:collapse;font-size:14px}.rvsum td,.rvsum th{padding:6px 4px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}.rvsum td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}'+
 '.rvcap{margin:8px 0 12px}.rvcap .t{display:flex;justify-content:space-between;font-size:14px;gap:6px;flex-wrap:wrap}.rvcap .rvbar{height:10px}.rvcap .rvbar i{background:#7aa7d6}.rvcap .rvbar i.b{background:rgba(122,167,214,.35)}'+
 '.rvchg li{margin:4px 0;font-size:14px;line-height:1.4}.rvbtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.rvbtns .btn{min-height:48px}'+
 '.asq h2{font-size:23px;margin:6px 0 4px;text-transform:none;letter-spacing:0;line-height:1.25}.asq .stp{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--mu)}.asopts{display:grid;gap:8px;margin:12px 0}@media(min-width:700px){.asopts{grid-template-columns:1fr 1fr}}'+
 '.asopts button{min-height:64px;text-align:left;padding:10px 14px;border-radius:var(--r);border:1px solid var(--line);background:var(--s1);color:#e8e6df;cursor:pointer;font-size:16px}.asopts button b{display:block;font-size:17px}.asopts button span{display:block;color:var(--mu);font-size:13px;margin-top:3px;line-height:1.35}'+
 '.asopts button[aria-pressed=true]{border-color:#d6b25e;background:rgba(214,178,94,.12)}.aswhy li{margin:6px 0;line-height:1.45;font-size:14.5px}.aslist td{font-size:14px}';
 document.head.appendChild(s); }
function hdr(t2){ return X.crumbs([[L('Inicio','Home'),'#/'],[L('Crea tu ejército','Build your army'),'#/ejercito'],[t2]]); }
// ---- entrada ----
function entry(){ css2();
  const h=['<div class="ejw" data-noi18n>'+X.crumbs([[L('Inicio','Home'),'#/'],[L('Crea tu ejército','Build your army')]])+'<h1>'+L('Crea tu ejército','Build your army')+'</h1>'];
  h.push('<p class="ejlead">'+L('Elige cómo quieres jugar. Todos los precios y cifras salen de fuentes públicas; lo que es cálculo nuestro va marcado como «Estimación».','Choose how you want to play. Every price and figure comes from public sources; anything that is our own calculation is marked «Estimate».')+'</p><div class="ejmodes">');
  h.push('<a class="ejmode main" href="#/ejercito/renovacion"><span class="bdg">'+L('Empieza aquí','Start here')+'</span><span class="k">'+L('Modo principal','Main mode')+'</span><h2>'+L('Renovación — España','Renewal — Spain')+'</h2><p>'+L('Empiezas con lo que España ya tiene en Tierra, Armada y Aire, y un presupuesto real. Decide qué mantienes, modernizas, retiras o compras hasta 2030.','You start with what Spain already has in its Army, Navy and Air Force, and a real budget. Decide what you keep, upgrade, retire or buy up to 2030.')+'</p><span class="go">'+L('Renovar las Fuerzas Armadas →','Renew the Armed Forces →')+'</span></a>');
  h.push('<a class="ejmode" href="#/ejercito/asistente"><span class="k">'+L('3–4 preguntas','3–4 questions')+'</span><h2>'+L('Asistente','Assistant')+'</h2><p>'+L('¿Más aviones, más mecanizado o más barcos? Responde unas preguntas y te propongo un ejército explicado, que luego cambias a tu gusto.','More aircraft, more armour or more ships? Answer a few questions and I will suggest an army, explained, that you can then change.')+'</p><span class="go">'+L('Responder →','Answer →')+'</span></a>');
  h.push('<a class="ejmode" href="#/ejercito/libre"><span class="k">'+L('Desde cero','From scratch')+'</span><h2>'+L('Modo libre','Free mode')+'</h2><p>'+L('El juego de siempre: el presupuesto de un país y '+D.items.length+' equipos con precio real para montar tu ejército desde cero.','The classic game: a country\'s budget and '+D.items.length+' items at real prices to build your army from scratch.')+'</p><span class="go">'+L('Jugar →','Play →')+'</span></a>');
  h.push('</div></div>'); X.set(h.join(''),L('Crea tu ejército','Build your army')); }
// ---- Renovación España ----
let ESD=null,PES=null; const RB={}; let RV={a:{},add:{},br:'et',sum:0};
function ensureEs(){ if(!PES) PES=get('ejercito_es.json.gz').then(z=>{ ESD=z; ESD.rows.forEach(r=>RB[r.id]=r); }); return PES; }
function rvLoad(){ try{ const o=JSON.parse(localStorage.getItem('mat_renov')||'null'); if(o){ RV.a={}; for(const k in (o.a||{})) if(RB[k]) RV.a[k]=o.a[k]; RV.add={}; for(const k in (o.add||{})){ const id=k.split(':')[1]; if(IB[id]&&o.add[k]>0) RV.add[k]=o.add[k]; } if(o.br) RV.br=o.br; } }catch(_){} }
function rvSave(){ try{ localStorage.setItem('mat_renov',JSON.stringify({a:RV.a,add:RV.add,br:RV.br})); }catch(_){} }
function sl(k){ const s=(ESD&&ESD.src[k])||(D.src[k]); return s?{t:s[0],u:s[1],d:s[2]}:null; }
function slink(keys,txt){ return (keys||[]).map(k=>{ const s=sl(k); return s?'<a href="'+e(s.u)+'" target="_blank" rel="noopener nofollow" title="'+e(s.t)+'">'+e(txt||L('Fuente','Source'))+'</a>':''; }).filter(Boolean).join(' · '); }
function rn(r){ return EN()&&r.ne?r.ne:r.n; }
function annual(){ const p=G.p.espana; return p&&p.nato?p.nato.eur:0; }
function envl(){ return annual()*0.2*ESD.yrs; }
function refP(r){ const it=IB[r.ref]; return it?mp(it):0; }
function modU(r){ if(r.mod&&r.mod.c) return r.mod.c; if(r.mod&&r.mod.cat&&IB[r.mod.cat]) return mp(IB[r.mod.cat]); return ESD.modp*refP(r); }
function modSrc(r){ return !!(r.mod&&(r.mod.c||r.mod.cat)); }
function retU(r){ return ESD.retp*refP(r); }
function buyU(r){ const it=IB[r.buy]; return it?mp(it):0; }
function mxA(r,a){ return a==='m'?Math.min(r.q,(r.mod&&r.mod.mx)||r.q):a==='r'?r.q:9999; }
function rvTot(){ let c=0,s=0; for(const id in RV.a){ const r=RB[id],x=RV.a[id]; if(!r||!x[1]) continue; if(x[0]==='m') c+=modU(r)*x[1]; else if(x[0]==='b') c+=buyU(r)*x[1]; else if(x[0]==='r') s+=retU(r)*x[1]; }
  for(const k in RV.add){ const it=IB[k.split(':')[1]]; if(it) c+=mp(it)*RV.add[k]; } return {c:c,s:s,net:c-s}; }
const BRC={et:['car','vci','art','dfa','hel','dro'],ar:['buq','sub','por','hel','dro'],ea:['caz','apo','dro','hel','dfa']};
function renov(){ css2(); rvLoad();
  const p=G.p.espana, A=annual(), E=envl(), ns=G.src.nato;
  const h=['<div class="ejw rvw" data-noi18n>'+hdr(L('Renovación — España','Renewal — Spain'))];
  h.push('<a class="ejback" href="#/ejercito">← '+L('Otros modos','Other modes')+'</a><h1>'+L('Renovación — España','Renewal — Spain')+'</h1>');
  h.push('<p class="ejlead">'+L('España no compra un ejército desde cero: ya tiene uno. Aquí empiezas con su material en servicio y decides, sistema a sistema, qué mantienes, modernizas, retiras o compras de aquí a '+ESD.y1+'.','Spain does not buy an army from scratch: it already has one. Here you start with the equipment it has in service and decide, system by system, what to keep, upgrade, retire or buy by '+ESD.y1+'.')+'</p>');
  h.push('<div class="ejbox rvbud"><h3>'+L('Presupuesto','Budget')+'</h3>');
  h.push('<div class="ln"><span>'+L('Gasto en defensa de España','Spain\'s defence spending')+' ('+(p.nato?p.nato.y:'')+')</span><b>'+fm(A)+' '+L('al año','a year')+'</b></div>');
  h.push('<p class="ejnote">'+L('Cifra de la OTAN (estimación de la propia OTAN, sin pensiones). SIPRI, que sí incluye pensiones, I+D e inteligencia, da ','NATO figure (NATO\'s own estimate, excluding pensions). SIPRI, which does include pensions, R&D and intelligence, gives ')+fm(p.e)+' ('+p.y+'). <a href="'+e(ns.url)+'" target="_blank" rel="noopener">'+e(ns.t)+'</a> · <a href="'+e(G.src.sipri.url)+'" target="_blank" rel="noopener">SIPRI</a></p>');
  h.push('<div class="ln" style="margin-top:10px"><span>'+L('Para renovar material ('+ESD.y0+'–'+ESD.y1+')','To renew equipment ('+ESD.y0+'–'+ESD.y1+')')+' <span class="rvtag">'+L('Estimación','Estimate')+'</span></span><span class="big">'+fm(E)+'</span></div>');
  h.push('<p class="ejnote">'+L('Cálculo M.A.T: el 20 % del gasto anual, que es lo que la OTAN pide dedicar a equipamiento principal ('+fm(A*0.2)+' al año), durante '+ESD.yrs+' años. El resto del dinero se va en sueldos, mantenimiento y operaciones, y aquí no se toca.','M.A.T calculation: 20% of annual spending, which is what NATO asks members to put into major equipment ('+fm(A*0.2)+' a year), over '+ESD.yrs+' years. The rest goes on pay, maintenance and operations, and is not touched here.')+' <a href="'+e(D.nato20.src[1])+'" target="_blank" rel="noopener">'+L('Directriz OTAN','NATO guideline')+'</a></p></div>');
  h.push('<div class="rvstk" id="rvstk"><div class="ln"><span>'+L('Usado','Used')+' <b id="rvu"></b> '+L('de','of')+' '+fm(E)+'</span><span id="rvr"></span></div><div class="rvbar" id="rvbar"><i></i></div><div class="ln" style="font-size:12.5px;color:var(--mu)"><span id="rvc"></span><span id="rvs"></span></div></div>');
  h.push('<p class="ejtip"><b>'+L('Cómo se juega:','How to play:')+'</b> '+L('elige una rama, toca «Modernizar», «Retirar» o «Comprar más» en cada sistema y ajusta cuántos. Retirar libera dinero. Al final, mira «Tus Fuerzas Armadas '+ESD.y1+'».','pick a branch, tap «Upgrade», «Retire» or «Buy more» on each system and set how many. Retiring frees money. At the end, see «Your Armed Forces '+ESD.y1+'».')+'</p>');
  h.push('<div class="rvtabs" role="tablist" id="rvtabs">'+ESD.br.map(b=>'<button type="button" class="chip" role="tab" data-br="'+b[0]+'" aria-pressed="'+(RV.br===b[0])+'">'+e(EN()?b[2]:b[1])+'</button>').join('')+'</div>');
  h.push('<div id="rvlist"></div>');
  h.push('<button type="button" class="btn pri rvgo" id="rvsumb">'+L('Ver «Tus Fuerzas Armadas '+ESD.y1+'»','See «Your Armed Forces '+ESD.y1+'»')+'</button>');
  h.push('<div id="rvsum"></div>');
  h.push('<details class="ejsrc ejbox"><summary>'+L('Fuentes y reglas','Sources and rules')+'</summary><p class="ejnote">'+L('Cantidades en servicio: las mismas listas de la página de España en Fuerzas armadas (Wikipedia, con fecha de consulta) y prensa especializada cuando hay entregas más recientes. Precio de compra: el de la tabla de precios del modo libre, con su fuente (valor medio entre el mínimo y el máximo).','Quantities in service: the same lists used on the Spain page in Armed forces (Wikipedia, with access date) and the defence press when there are more recent deliveries. Purchase price: the one in the free-mode price table, with its source (midpoint between lowest and highest).')+'</p><p class="ejnote"><b>'+L('Estimación M.A.T','M.A.T estimate')+'</b> — '+L('modernizar sin coste publicado: '+nf(ESD.modp*100)+' % del precio de uno nuevo equivalente por unidad. Retirar: ahorra el '+nf(ESD.retp*100)+' % del precio de uno nuevo equivalente por unidad (mantenimiento y operación que dejas de pagar hasta '+ESD.y1+'). «Moderno» = equipo de generación actual o modernizado. Son reglas sencillas para el juego, no cifras oficiales.','upgrades with no published cost: '+nf(ESD.modp*100)+'% of the price of a new equivalent per unit. Retiring saves '+nf(ESD.retp*100)+'% of the price of a new equivalent per unit (maintenance and operation you stop paying until '+ESD.y1+'). «Modern» = current-generation or upgraded equipment. These are simple game rules, not official figures.')+'</p><ol>'+Object.keys(ESD.src).map(k=>{const s=ESD.src[k]; return '<li><a href="'+e(s[1])+'" target="_blank" rel="noopener nofollow">'+e(s[0])+'</a> ('+e(s[2])+')</li>';}).join('')+'</ol></details>');
  h.push('</div>'); X.set(h.join(''),L('Renovación — España','Renewal — Spain'));
  rvList(); rvBar(); rvBind(); if(RV.sum) rvSum(); }
function stepper(key,n,mx){ return '<div class="ejqq" data-k="'+e(key)+'"><button type="button" data-d="-10" aria-label="−10">−10</button><button type="button" class="b1" data-d="-1" aria-label="−1">−</button><input class="ejqn" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="off" value="'+nf(n)+'" aria-label="'+L('Cantidad','Quantity')+'"><button type="button" class="pl b1" data-d="1" aria-label="+1">+</button><button type="button" class="pl" data-d="10" aria-label="+10">+10</button></div>'+(mx<9999?'<button type="button" class="chip" data-all="'+e(key)+'">'+L('Todos','All')+' ('+nf(mx)+')</button>':''); }
let TH=null;
function rth(r){ if(!TH){ TH={}; ((window.MAT_DATA&&window.MAT_DATA.items)||[]).forEach(a=>{ if(a.img&&(a.img.th||a.img.src)) TH[a.id]=a.img.th||a.img.src; }); }
  if(r.f&&TH[r.f]) return '<img src="'+e(TH[r.f])+'" alt="" loading="lazy">'; const it=IB[r.buy]||IB[r.ref]; return it?thumb(it):''; }
function rowHTML(r){ const x=RV.a[r.id]||['k',0], a=x[0], n=x[1];
  let h='<div class="rvrow'+(a!=='k'&&n?' chg':'')+'" data-id="'+r.id+'"><div class="rvhd"><span class="rvth">'+rth(r)+'</span><div><h4>'+e(rn(r))+'</h4><p class="meta">'+L('En servicio: ','In service: ')+'<b>'+nf(r.q)+'</b> · '+slink(r.qs)+(r.o?' · '+e(EN()?r.o[1]:r.o[0])+(r.os?' ('+slink(r.os)+')':''):'')+'</p></div></div>';
  if(r.nt) h+='<p class="meta">'+e(EN()?r.nt[1]:r.nt[0])+(r.ns?' '+slink(r.ns):'')+'</p>';
  const ob=[['k',L('Mantener','Keep'),1],['m',L('Modernizar','Upgrade'),r.q>0],['r',L('Retirar','Retire'),r.q>0],['b',L('Comprar más','Buy more'),!!r.buy]];
  h+='<div class="rvseg" role="group" aria-label="'+e(rn(r))+'">'+ob.map(o=>'<button type="button" data-v="'+o[0]+'" aria-pressed="'+(a===o[0])+'"'+(o[2]?'':' disabled')+'>'+o[1]+'</button>').join('')+'</div>';
  if(a!=='k'){ h+='<div class="rvdet">'+stepper(r.id,n,mxA(r,a))+'<p class="ct">'+costLine(r,a,n)+'</p></div>'; }
  return h+'</div>'; }
function costLine(r,a,n){ const est='<span class="rvtag">'+L('Estimación','Estimate')+'</span>';
  if(a==='m'){ const u=modU(r), src=modSrc(r); let t=L('Modernizar ','Upgrade ')+nf(n)+' × '+fm(u)+' = <b>'+fm(u*n)+'</b> '+(src?'<span class="rvtag ok">'+L('Con fuente','Sourced')+'</span>':est);
    if(r.mod&&r.mod.es) t+='<br>'+e(EN()?r.mod.en:r.mod.es)+' · '+slink(r.mod.s); else { const it=IB[r.ref]; t+='<br>'+L('Sin coste publicado: '+nf(ESD.modp*100)+' % del precio de un ','No published cost: '+nf(ESD.modp*100)+'% of the price of a new ')+e(it?nm(it):'')+L(' nuevo',''); if(r.mod&&r.mod.s) t+=' · '+L('contexto: ','context: ')+slink(r.mod.s); }
    if(r.mod&&r.mod.mx&&r.mod.mx<r.q) t+='<br>'+L('Este programa cubre como máximo ','This programme covers at most ')+nf(r.mod.mx)+'.'; return t; }
  if(a==='r'){ const u=retU(r), it=IB[r.ref]; return L('Retirar ','Retire ')+nf(n)+L(' libera ',' frees ')+'<b>'+fm(u*n)+'</b> '+est+'<br>'+L(nf(ESD.retp*100)+' % del precio de un '+(it?nm(it):'')+' nuevo por unidad, en mantenimiento que ya no pagas.',nf(ESD.retp*100)+'% of the price of a new '+(it?nm(it):'')+' per unit, in maintenance you no longer pay.'); }
  if(a==='b'){ const it=IB[r.buy]; return L('Comprar ','Buy ')+nf(n)+' × '+e(nm(it))+' ('+fm(mp(it))+') = <b>'+fm(mp(it)*n)+'</b>'+(it.b==='est'?' '+est:'')+'<br>'+L('Precio: ','Price: ')+fmr(it)+' · '+e(EN()?it.en:it.es)+' · '+slink(it.s); }
  return ''; }
function addHTML(){ const keys=Object.keys(RV.add).filter(k=>k.split(':')[0]===RV.br); if(!keys.length) return '';
  return keys.map(k=>{ const it=IB[k.split(':')[1]], n=RV.add[k]; return '<div class="rvrow chg" data-add="'+e(k)+'"><h4>'+e(nm(it))+' <span class="rvtag ok">'+L('Nuevo','New')+'</span></h4><p class="meta">'+L('No está en servicio en España. Precio: ','Not in service in Spain. Price: ')+fmr(it)+' · '+slink(it.s)+'</p><div class="rvdet">'+stepper(k,n,9999)+' <button type="button" class="chip" data-rm="'+e(k)+'">✕ '+L('Quitar','Remove')+'</button><p class="ct">'+nf(n)+' × '+fm(mp(it))+' = <b>'+fm(mp(it)*n)+'</b>'+(it.b==='est'?' <span class="rvtag">'+L('Estimación','Estimate')+'</span>':'')+'</p></div></div>'; }).join(''); }
function rvList(){ const box=document.getElementById('rvlist'); if(!box) return;
  box.innerHTML=addHTML()+ESD.rows.filter(r=>r.r===RV.br).map(rowHTML).join('')+'<button type="button" class="btn rvadd" id="rvaddb">+ '+L('Añadir sistema nuevo','Add a new system')+'</button><div id="rvpick"></div>'; }
function rvBar(){ const t=rvTot(), E=envl(), u=t.net, over=u>E+1e-6, b=document.getElementById('rvbar'); if(!b) return;
  b.classList.toggle('over',over); b.firstChild.style.width=Math.max(0,Math.min(100,u/E*100))+'%';
  document.getElementById('rvu').textContent=fm(Math.max(0,u))+(u<0?' ('+L('ahorras ','you save ')+fm(-u)+')':'');
  const rr=document.getElementById('rvr'); rr.textContent=over?L('Te pasas ','Over by ')+fm(u-E):L('Te quedan ','Left: ')+fm(E-u); rr.style.color=over?'#ff8a73':'';
  document.getElementById('rvc').textContent=L('Gastos ','Costs ')+fm(t.c); document.getElementById('rvs').textContent=L('Ahorro por retiradas ','Savings from retirements ')+fm(t.s); }
function rvRow(id){ const el=document.querySelector('.rvrow[data-id="'+id+'"]'); if(el) el.outerHTML=rowHTML(RB[id]); }
function setN(key,n){ if(key.indexOf(':')>0){ n=Math.max(0,Math.min(9999,n)); if(!n) delete RV.add[key]; else RV.add[key]=n; rvSave(); rvList(); rvBar(); rvSumR(); return; }
  const r=RB[key], x=RV.a[key]; if(!r||!x) return; x[1]=Math.max(0,Math.min(mxA(r,x[0]),n)); rvSave(); rvRow(key); rvBar(); rvSumR(); }
function rvSumR(){ if(RV.sum) rvSum(); }
function picker(){ const pk=document.getElementById('rvpick'); if(!pk) return; if(pk.innerHTML){ pk.innerHTML=''; return; }
  const cs=BRC[RV.br]; pk.innerHTML='<div class="rvpick"><input type="search" id="rvq" autocomplete="off" placeholder="'+L('Buscar en el catálogo…','Search the catalogue…')+'" aria-label="'+L('Buscar en el catálogo','Search the catalogue')+'"><div class="lst" id="rvpl"></div></div>';
  const draw=q=>{ q=(q||'').toLowerCase(); document.getElementById('rvpl').innerHTML=D.items.filter(i=>cs.indexOf(i.c)>=0&&(!q||(nm(i)+' '+i.n).toLowerCase().indexOf(q)>=0)).map(i=>'<button type="button" data-pk="'+i.id+'">'+e(nm(i))+'<span>'+fmr(i)+'</span></button>').join('')||'<p class="ejnote">'+L('Nada con ese nombre.','Nothing by that name.')+'</p>'; };
  draw(''); document.getElementById('rvq').addEventListener('input',ev=>draw(ev.target.value)); }
function rvBind(){ const w=APP.querySelector('.rvw'); let hold=null;
  w.addEventListener('click',ev=>{ const t=ev.target.closest('button'); if(!t) return;
    if(t.dataset.br){ RV.br=t.dataset.br; rvSave(); w.querySelectorAll('#rvtabs button').forEach(b=>b.setAttribute('aria-pressed',b===t)); rvList(); return; }
    if(t.dataset.v){ const id=t.closest('.rvrow').dataset.id, r=RB[id], v=t.dataset.v; if(v==='k') delete RV.a[id]; else RV.a[id]=[v,v==='b'?1:mxA(r,v)]; rvSave(); rvRow(id); rvBar(); rvSumR(); return; }
    if(t.dataset.d){ const k=t.closest('.ejqq').dataset.k, cur=k.indexOf(':')>0?(RV.add[k]||0):((RV.a[k]||[0,0])[1]); setN(k,cur+(+t.dataset.d)); return; }
    if(t.dataset.all){ const k=t.dataset.all, x=RV.a[k]; if(x) setN(k,mxA(RB[k],x[0])); return; }
    if(t.dataset.rm){ delete RV.add[t.dataset.rm]; rvSave(); rvList(); rvBar(); rvSumR(); return; }
    if(t.id==='rvaddb'){ picker(); return; }
    if(t.dataset.pk){ const k=RV.br+':'+t.dataset.pk; RV.add[k]=(RV.add[k]||0)+1; rvSave(); rvList(); rvBar(); rvSumR(); toast(L('Añadido: ','Added: ')+nm(IB[t.dataset.pk])); const el=document.querySelector('.rvrow[data-add="'+k+'"]'); if(el) el.scrollIntoView({block:'center'}); return; }
    if(t.id==='rvsumb'){ RV.sum=1; rvSum(); const s=document.getElementById('rvsum'); if(s) s.scrollIntoView({block:'start',behavior:'smooth'}); return; }
    if(t.id==='rvedit'){ RV.sum=0; document.getElementById('rvsum').innerHTML=''; document.getElementById('rvtabs').scrollIntoView({block:'start'}); return; }
    if(t.id==='rvreset'){ if(t.dataset.ok!=='1'){ t.dataset.ok='1'; t.textContent=L('¿Seguro? Toca otra vez','Sure? Tap again'); return; } RV.a={}; RV.add={}; RV.sum=0; rvSave(); renov(); window.scrollTo(0,0); toast(L('Vuelves a la España de hoy','Back to today\'s Spain')); return; }
  });
  w.addEventListener('change',ev=>{ const t=ev.target; if(!t.classList.contains('ejqn')) return; const k=t.closest('.ejqq').dataset.k; const n=parseInt(String(t.value).replace(/\D/g,''),10)||0; setN(k,n); });
  w.addEventListener('keydown',ev=>{ if(ev.key==='Enter'&&ev.target.classList.contains('ejqn')) ev.target.blur(); });
  w.addEventListener('focusin',ev=>{ if(ev.target.classList.contains('ejqn')) ev.target.select(); });
  // mantener pulsado
  const stop=()=>{ if(hold){ clearTimeout(hold.t); hold=null; } };
  w.addEventListener('pointerdown',ev=>{ let t=ev.target.closest('.ejqq button[data-d]'); if(!t) return; stop(); let k=0; const run=()=>{ if(!hold) return; k++; const q=t.closest('.ejqq'); if(!q){stop();return;} const key=q.dataset.k, cur=key.indexOf(':')>0?(RV.add[key]||0):((RV.a[key]||[0,0])[1]); setN(key,cur+(+t.dataset.d)*(k>12?10:1)); const nb=document.querySelector('.ejqq[data-k="'+key+'"] button[data-d="'+t.dataset.d+'"]'); if(nb&&nb!==t) t=nb; if(hold) hold.t=setTimeout(run,Math.max(45,170-k*12)); }; hold={t:setTimeout(run,420)}; });
  ['pointerup','pointercancel','pointerleave','scroll'].forEach(n=>w.addEventListener(n,stop,{passive:true})); window.addEventListener('scroll',stop,{passive:true});
}
function rvCap(){ const o={}; ESD.br.forEach(b=>o[b[0]]={u0:0,m0:0,u1:0,m1:0});
  ESD.rows.forEach(r=>{ const c=o[r.r], x=RV.a[r.id]||['k',0]; c.u0+=r.q; c.m0+=r.m?r.q:0; let q=r.q, m=r.m?r.q:0;
    if(x[0]==='r'){ q-=x[1]; m=r.m?q:0; } else if(x[0]==='m'){ m=r.m?q:x[1]; } else if(x[0]==='b'){ q+=x[1]; m+=x[1]; } c.u1+=q; c.m1+=m; });
  for(const k in RV.add){ const c=o[k.split(':')[0]]; if(c){ c.u1+=RV.add[k]; c.m1+=RV.add[k]; } } return o; }
function rvSum(){ const box=document.getElementById('rvsum'); if(!box) return; const t=rvTot(), E=envl(), C=rvCap(), over=t.net>E+1e-6;
  const h=['<div class="ejbox rvsum" id="rvsumx"><h2 class="rvh">'+L('Tus Fuerzas Armadas '+ESD.y1,'Your Armed Forces '+ESD.y1)+'</h2>'];
  h.push('<div class="rvbud"><div class="ln"><span>'+L('Presupuesto usado','Budget used')+'</span><b>'+fm(Math.max(0,t.net))+' / '+fm(E)+'</b></div><div class="rvbar'+(over?' over':'')+'"><i style="width:'+Math.max(0,Math.min(100,t.net/E*100))+'%"></i></div><p class="ejnote">'+L('Gastos ','Costs ')+fm(t.c)+' − '+L('ahorro por retiradas ','savings from retirements ')+fm(t.s)+' <span class="rvtag">'+L('Estimación','Estimate')+'</span>. '+(over?'<b style="color:#ff8a73">'+L('Te pasas en '+fm(t.net-E)+': retira algo o compra menos.','You are '+fm(t.net-E)+' over: retire something or buy less.')+'</b>':L('Te sobran ','Left over: ')+fm(E-t.net)+'.')+'</p></div>');
  h.push('<h3>'+L('Capacidad por rama','Capability by branch')+'</h3>');
  ESD.br.forEach(b=>{ const c=C[b[0]], p0=c.u0?c.m0/c.u0*100:0, p1=c.u1?c.m1/c.u1*100:0;
    h.push('<div class="rvcap"><div class="t"><b>'+e(EN()?b[2]:b[1])+'</b><span>'+L('Unidades: ','Units: ')+nf(c.u0)+' → <b>'+nf(c.u1)+'</b> · '+L('modernas: ','modern: ')+nf(p0)+' % → <b>'+nf(p1)+' %</b></span></div><div class="rvbar"><i class="b" style="width:'+p0+'%"></i><i style="width:'+p1+'%;opacity:.9"></i></div></div>'); });
  h.push('<p class="ejnote">'+L('Unidades = suma de los sistemas principales de esta lista. «Modernas» es una ','Units = total of the main systems in this list. «Modern» is a ')+'<span class="rvtag">'+L('Estimación','Estimate')+'</span> '+L('de M.A.T: equipo de generación actual, modernizado o recién comprado. No cuenta los pedidos ya firmados (por ejemplo, las F-110 o los Halcón), que se muestran en cada sistema.','by M.A.T: current-generation, upgraded or newly bought equipment. It does not count orders already signed (for example the F-110s or the Halcón), which are shown on each system.')+'</p>');
  h.push('<h3>'+L('Tus cambios','Your changes')+'</h3>');
  const ch=[]; ESD.br.forEach(b=>{ const li=[]; ESD.rows.filter(r=>r.r===b[0]&&RV.a[r.id]&&RV.a[r.id][1]).forEach(r=>{ const x=RV.a[r.id], n=x[1];
      if(x[0]==='m') li.push(L('Modernizar ','Upgrade ')+nf(n)+' '+e(rn(r))+' — '+fm(modU(r)*n)); if(x[0]==='r') li.push(L('Retirar ','Retire ')+nf(n)+' '+e(rn(r))+' — '+L('ahorro ','saves ')+fm(retU(r)*n)); if(x[0]==='b') li.push(L('Comprar ','Buy ')+nf(n)+' '+e(nm(IB[r.buy]))+' — '+fm(buyU(r)*n)); });
    for(const k in RV.add){ if(k.split(':')[0]!==b[0]) continue; const it=IB[k.split(':')[1]]; li.push(L('Nuevo: ','New: ')+nf(RV.add[k])+' '+e(nm(it))+' — '+fm(mp(it)*RV.add[k])); }
    if(li.length) ch.push('<li><b>'+e(EN()?b[2]:b[1])+'</b><ul>'+li.map(x=>'<li>'+x+'</li>').join('')+'</ul></li>'); });
  h.push(ch.length?'<ul class="rvchg">'+ch.join('')+'</ul>':'<p class="ejnote">'+L('Aún no has cambiado nada: así sería España en '+ESD.y1+' sin renovar (solo con lo que ya tiene).','You have not changed anything yet: this is Spain in '+ESD.y1+' with no renewal (only what it already has).')+'</p>');
  h.push('<div class="rvbtns"><button type="button" class="btn pri" id="rvedit">'+L('Seguir editando','Keep editing')+'</button><button type="button" class="btn" id="rvreset">'+L('Empezar de nuevo','Start over')+'</button></div></div>');
  box.innerHTML=h.join(''); }
// ---- Asistente ----
let AS={st:0,p:'',d:'',b:'',c:''};
const ASQ=()=>[
 ['p',L('¿Qué quieres que pese más en tu ejército?','What should weigh most in your army?'),[['aire',L('Aire','Air'),L('Cazas, aviones de transporte y drones','Fighters, transport aircraft and drones')],['tierra',L('Tierra','Land'),L('Carros de combate, blindados y artillería','Tanks, armoured vehicles and artillery')],['mar',L('Mar','Sea'),L('Fragatas, submarinos y buques anfibios','Frigates, submarines and amphibious ships')],['eq',L('Equilibrado','Balanced'),L('Un poco de todo','A bit of everything')]]],
 ['d',L('¿Para qué lo quieres?','What is it for?'),[['ter',L('Defensa del territorio','Defend the territory'),L('Proteger tus fronteras, tu espacio aéreo y tus costas','Protect your borders, airspace and coasts')],['ext',L('Misiones en el exterior','Missions abroad'),L('Llevar tropas lejos y mantenerlas allí','Send troops far away and keep them there')],['dis',L('Disuasión','Deterrence'),L('Que nadie se atreva a atacarte','Make sure nobody dares to attack you')]]],
 ['b',L('¿Cuánto dinero tienes?','How much money do you have?'),[['s',L('Pequeño','Small'),L('Como Portugal: ','Like Portugal: ')+fm(G.p.portugal.e)+' ('+G.p.portugal.y+', SIPRI)'],['m',L('Medio','Medium'),L('Como España: ','Like Spain: ')+fm(G.p.espana.e)+' ('+G.p.espana.y+', SIPRI)'],['l',L('Grande','Large'),L('Como Francia: ','Like France: ')+fm(G.p.francia.e)+' ('+G.p.francia.y+', SIPRI)']]],
 ['c',L('¿Quieres partir de un país? (opcional)','Do you want to start from a country? (optional)'),[['-',L('Ninguno','None'),L('Me quedo con el presupuesto que he elegido','Keep the budget I chose')]].concat(PRE.filter(k=>G.p[k]).map(k=>[k,pn(k),L('Su presupuesto y más peso a su material: ','Its budget, and more weight to its equipment: ')+fm(G.p[k].e)+' ('+G.p[k].y+', SIPRI)']))]];
const BKEY={s:'portugal',m:'espana',l:'francia'};
const SH={aire:{aire:.45,mar:.15,tierra:.18,dfa:.14,sol:.08},tierra:{aire:.18,mar:.10,tierra:.47,dfa:.13,sol:.12},mar:{aire:.17,mar:.48,tierra:.15,dfa:.10,sol:.10},eq:{aire:.30,mar:.25,tierra:.25,dfa:.10,sol:.10}};
const POOL={ter:{aire:[['ef',.5],['nh90',.15],['mq9b',.1],['a400m',.1],['meteor',.15]],mar:[['s80',.45],['f110',.4],['nsm',.15]],tierra:[['leo2a8',.3],['ascod',.2],['k9',.25],['dragon',.25]],dfa:[['nasams',.4],['irist',.35],['skyr',.25]]},
 ext:{aire:[['ef',.3],['a400m',.25],['mrtt',.2],['nh90',.15],['mq9b',.1]],mar:[['jci',.35],['f110',.45],['nh90',.2]],tierra:[['dragon',.45],['ch47',.2],['caesar',.15],['leo2a8',.2]],dfa:[['nasams',.6],['skyr',.4]]},
 dis:{aire:[['f35a',.4],['ef',.35],['mrtt',.1],['meteor',.15]],mar:[['s80',.4],['f110',.45],['nsm',.15]],tierra:[['leo2a8',.35],['himars',.25],['k9',.2],['dragon',.2]],dfa:[['patriot',.5],['sampt',.5]]}};
function asBud(){ return AS.c&&AS.c!=='-'?AS.c:BKEY[AS.b]; }
function propose(){ const bk=asBud(), B=G.p[bk].e*0.2, sh=Object.assign({},SH[AS.p]); const why=[];
  if(AS.d==='ter'){ sh.dfa+=.05; sh.tierra+=.03; sh.aire-=.04; sh.mar-=.04; } if(AS.d==='ext'){ sh.sol+=.03; sh.dfa-=.03; } if(AS.d==='dis'){ sh.dfa+=.04; sh.sol-=.04; }
  const tg={}; const pool=POOL[AS.d]; const cc=AS.c&&AS.c!=='-'?AS.c:'';
  ['aire','mar','tierra','dfa'].forEach(dm=>{ let ws=pool[dm].map(x=>{ let id=x[0], w=x[1]; if(dm==='mar'&&id==='f110'&&IB.f110&&mp(IB.f110)>B*sh.mar*.6&&IB.avante) id='avante'; if(cc&&IB[id]&&(IB[id].o||[]).indexOf(cc)>=0) w*=1.6; return [id,w]; });
    const s=ws.reduce((a,x)=>a+x[1],0); ws.forEach(x=>{ if(IB[x[0]]) tg[x[0]]=(tg[x[0]]||0)+B*sh[dm]*x[1]/s; }); });
  tg.sold=B*sh.sol; const c={}; let used=0;
  for(const id in tg){ const q=Math.floor(tg[id]/price(IB[id])); if(q>0){ c[id]=q; used+=q*price(IB[id]); } }
  for(let g=0;g<400;g++){ const left=B-used; const cand=Object.keys(tg).filter(id=>id!=='sold'&&price(IB[id])<=left&&((c[id]||0)+1)*price(IB[id])<=tg[id]*2).sort((a,b)=>(tg[b]-(c[b]||0)*price(IB[b]))-(tg[a]-(c[a]||0)*price(IB[a]))); if(!cand.length) break; const id=cand[0]; if(tg[id]-(c[id]||0)*price(IB[id])<price(IB[id])*-0.5) break; c[id]=(c[id]||0)+1; used+=price(IB[id]); }
  const left=B-used; if(left>price(IB.sold)){ const q=Math.floor(left/price(IB.sold)); c.sold=(c.sold||0)+q; used+=q*price(IB.sold); }
  const pct=v=>nf(Math.round(v*100))+' %'; const dn={aire:L('aire','air'),mar:L('mar','sea'),tierra:L('tierra','land'),dfa:L('defensa aérea','air defence'),sol:L('soldados','soldiers')};
  why.push(L('Has elegido prioridad ','You chose priority ')+'<b>'+e(ASQ()[0][2].find(x=>x[0]===AS.p)[1].toLowerCase())+'</b>: '+L('reparto el dinero así: ','so I split the money like this: ')+Object.keys(sh).map(k=>dn[k]+' '+pct(sh[k])).join(', ')+'.');
  why.push(AS.d==='ter'?L('Para defender el territorio pongo más defensa aérea y artillería, y submarinos y fragatas para vigilar las costas.','To defend the territory I add more air defence and artillery, plus submarines and frigates to watch the coasts.'):AS.d==='ext'?L('Para misiones lejos de casa hace falta llevar y mantener tropas: aviones de transporte y cisterna, helicópteros pesados, buque anfibio y blindados sobre ruedas.','Missions far from home need ways to move and supply troops: transport and tanker aircraft, heavy helicopters, an amphibious ship and wheeled armour.'):L('Para disuadir priorizo lo que más preocupa a un rival: cazas de quinta generación, submarinos, fuego de largo alcance y defensa antimisil.','To deter, I favour what worries a rival most: fifth-generation fighters, submarines, long-range fires and missile defence.'));
  why.push(L('Presupuesto: ','Budget: ')+e(pn(bk))+', '+fm(G.p[bk].e)+' ('+G.p[bk].y+', SIPRI). '+L('Uso el modo realista: solo el 20 % es para comprar equipo (','I use realistic mode: only 20% goes on equipment (')+fm(B)+L('), como pide la OTAN; el resto son sueldos y mantenimiento.','), as NATO asks; the rest is pay and maintenance.'));
  if(cc) why.push(L('Doy más peso al material que ya usa ','I give more weight to equipment already used by ')+e(pn(cc))+'.');
  if(c.avante) why.push(L('Con este presupuesto una fragata F-110 se come casi todo el dinero del mar, así que pongo corbetas Avante 2200.','With this budget an F-110 frigate would eat almost all the naval money, so I use Avante 2200 corvettes.'));
  const nf0=Object.keys(tg).filter(id=>id!=='sold'&&!c[id]&&IB[id]); if(nf0.length) why.push(L('No caben con este dinero: ','Too expensive for this budget: ')+nf0.map(id=>e(nm(IB[id]))+' ('+fm(price(IB[id]))+')').join(', ')+L('. Ese dinero va al resto.','. That money goes to the rest.'));
  why.push(L('Las cantidades salen de los mismos precios con fuente del modo libre, redondeadas para que quepan.','Quantities come from the same sourced prices as free mode, rounded so they fit.'));
  return {c:c,B:B,bk:bk,why:why,used:used}; }
function asis(){ css2(); const Q=ASQ(); const h=['<div class="ejw asw" data-noi18n>'+hdr(L('Asistente','Assistant'))+'<a class="ejback" href="#/ejercito">← '+L('Otros modos','Other modes')+'</a><h1>'+L('Asistente','Assistant')+'</h1>'];
  if(AS.st<Q.length){ const q=Q[AS.st];
    h.push('<div class="asq"><span class="stp">'+L('Pregunta ','Question ')+(AS.st+1)+L(' de ',' of ')+Q.length+'</span><h2>'+q[1]+'</h2><div class="asopts" role="group">'+q[2].map(o=>'<button type="button" data-o="'+o[0]+'" aria-pressed="'+(AS[q[0]]===o[0])+'"><b>'+e(o[1])+'</b><span>'+e(o[2])+'</span></button>').join('')+'</div>'+(AS.st?'<button type="button" class="btn" id="asback" style="min-height:46px">← '+L('Atrás','Back')+'</button>':'')+'</div>');
  } else { const P2=propose(); const its=D.items.filter(i=>P2.c[i.id]);
    h.push('<div class="ejbox"><h2 class="rvh">'+L('Te propongo esto porque…','I suggest this because…')+'</h2><ul class="aswhy">'+P2.why.map(x=>'<li>'+x+'</li>').join('')+'</ul></div>');
    h.push('<div class="ejbox"><h3>'+L('Tu ejército propuesto','Your suggested army')+'</h3><table class="ejtbl aslist" style="width:100%"><tbody>'+its.map(i=>'<tr><td>'+e(nm(i))+'</td><td class="n" style="text-align:right">'+nf(P2.c[i.id])+'</td><td class="n" style="text-align:right">'+fm(price(i)*P2.c[i.id])+'</td></tr>').join('')+'</tbody></table><p class="ejnote">'+L('Total: ','Total: ')+fm(P2.used)+' / '+fm(P2.B)+'</p></div>');
    h.push('<div class="rvbtns"><button type="button" class="btn pri" id="asopen">'+L('Abrir en el editor','Open in the editor')+'</button><button type="button" class="btn" id="asredo">'+L('Cambiar respuestas','Change answers')+'</button></div>');
    h.push('<p class="ejnote">'+L('En el editor puedes cambiar cualquier cosa: añadir, quitar, cambiar el presupuesto o quitar el modo realista.','In the editor you can change anything: add, remove, change the budget or turn off realistic mode.')+'</p>'); }
  h.push('</div>'); X.set(h.join(''),L('Asistente','Assistant')); window.scrollTo(0,0);
  APP.querySelector('.asw').addEventListener('click',ev=>{ const t=ev.target.closest('button'); if(!t) return;
    if(t.dataset.o){ const q=Q[AS.st]; AS[q[0]]=t.dataset.o; AS.st++; asis(); return; }
    if(t.id==='asback'){ AS.st=Math.max(0,AS.st-1); asis(); return; }
    if(t.id==='asredo'){ AS.st=0; asis(); return; }
    if(t.id==='asopen'){ const P2=propose(); ST.b=P2.bk; ST.pm=1; ST.real=1; ST.cart=P2.c; ST.cmp=P2.bk;
      try{ localStorage.setItem('mat_ejercito',JSON.stringify({b:ST.b,cu:ST.cu,pm:ST.pm,real:ST.real,cart:ST.cart})); sessionStorage.setItem('ej_asis','1'); }catch(_){}
      location.hash='#/ejercito/libre?'+qstr(false); } }); }
