/* M.A.T — Armero 3D (#/armero). Visor three.js con accesorios reales montables.
   Modelos 3D: serie «Low-Poly» de GoldbergR (Sketchfab), licencia CC BY 4.0 — optimizados (meshopt) y con el origen recolocado por M.A.T.
   Datos del arma: fichas de Armas ligeras de M.A.T (Wikipedia). Datos de accesorios: fichas técnicas de cada fabricante (enlazadas). Nada inventado: sin dato publicado, sin cifra. */
import * as THREE from './three.module.min.js';
import {GLTFLoader,MeshoptDecoder,RoomEnvironment} from './gltf.min.js';

const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const DIR='m3d/armero/';
const SF='https://sketchfab.com/GoldbergR';
const CCBY='https://creativecommons.org/licenses/by/4.0/';

/* Accesorios: datos del fabricante (o fuente indicada). g = gramos, mm = longitud. */
export const ACC={
 eotech:{f:'eotech_xps2',slot:'optic',n:'EOTech HWS XPS2',k:['Visor holográfico 1×','Holographic sight 1×'],g:255,mm:96.5,
   src:[['EOTech — HWS XPS2 (ficha técnica)','https://www.eotechinc.com/products/eotech-hws-xps2']],m:'https://sketchfab.com/3d-models/eotech-hws-xps2-sight-low-poly-5c8f29d9895e48e183a085fefabf0e14',mn:'EOTech HWS XPS2 Sight (Low-Poly)'},
 acog:{f:'acog_ta33',slot:'optic',n:'Trijicon ACOG TA33 (3×30)',k:['Mira de 3 aumentos, con montura','3× scope, with mount'],g:277.83,mm:157.48,
   src:[['Trijicon — ACOG 3x30 TA33-C-400383 (ficha técnica)','https://www.trijicon.com/products/details/TA33-C-400383']],m:'https://sketchfab.com/3d-models/ta33-acog-low-poly-6dad7e9976264d4cb8354c5cfe639a7e',mn:'TA33 ACOG (Low-Poly)'},
 lrt10:{f:'leupold_lrt10x40',slot:'optic',n:'Leupold Mark 4 LR/T M1 10×40 mm',k:['Visor de tirador de 10 aumentos','10× sniper scope'],g:595,mm:333,
   note:['Según Leupold, esta mira (10×40 LR/T) fue la del fusil M24 del Ejército de EE. UU.; el M110, derivado del SR-25, lleva la Mark 4 LR/T 3,5–10×40.','According to Leupold, this scope (10×40 LR/T) was the US Army M24\'s; the M110, derived from the SR-25, uses the Mark 4 LR/T 3.5–10×40.'],
   src:[['Leupold — Catálogo táctico 2006 (tabla de especificaciones)','https://www.acp-waffen.de/downloads/Produktinformationen/Leupold/2006/2006_Leupold_Tactical_Catalog.pdf'],['Leupold — 30 años de servicio de la Mark 4','https://www.leupold.com/blog/post/30-years-of-service']],m:'https://sketchfab.com/3d-models/leupold-mk-4-lrt-m1-1040mm-scope-low-poly-bf0e3597985940408d24669297d15509',mn:'Leupold Mk 4 LRT M1 10×40mm Scope (Low-Poly)'},
 mk4:{f:'leupold_mk4',slot:'optic',n:'Leupold Mark 4 LR/T M1 4,5–14×50 mm',k:['Visor de tirador de 4,5 a 14 aumentos','4.5–14× sniper scope'],g:624,mm:318,approx:1,
   note:['Según Leupold, es la mira del M107 (versión del Barrett M82 del Ejército de EE. UU.). El modelo 3D es una Leupold Mark 4 genérica: forma aproximada.','According to Leupold, this is the M107\'s scope (the US Army version of the Barrett M82). The 3D model is a generic Leupold Mark 4: approximate shape.'],
   src:[['Leupold — Catálogo táctico 2006 (tabla de especificaciones)','https://www.acp-waffen.de/downloads/Produktinformationen/Leupold/2006/2006_Leupold_Tactical_Catalog.pdf'],['Leupold — 30 años de servicio de la Mark 4','https://www.leupold.com/blog/post/30-years-of-service']],m:'https://sketchfab.com/3d-models/leupold-mark-4-scope-low-poly-f49c7d0b9613492ca19e327528d8fad0',mn:'Leupold Mark 4 Scope (Low-Poly)'},
 velos:{f:'velos_lbp556',slot:'muzzle',n:'SilencerCo Velos LBP 5.56',k:['Silenciador para 5,56 mm','5.56 mm suppressor'],g:430.9,mm:152,
   src:[['SilencerCo — Velos LBP (especificaciones: 556 = 15,2 oz, 5,98″)','https://silencerco.com/silencers/velos-lbp/']],m:'https://sketchfab.com/3d-models/silencerco-velos-lbp-556-suppressor-low-poly-f0eb0ba747d5448299ba6f82ceed169d',mn:'SilencerCo Velos LBP 5.56 Suppressor (Low-Poly)'},
 afg:{f:'magpul_afg',slot:'under',n:'Magpul AFG',k:['Empuñadura angulada','Angled fore grip'],g:82.8,mm:141,
   src:[['Magpul — AFG Angled Fore Grip (2,92 oz, 5,55″)','https://magpul.com/afg-angled-fore-grip.html']],m:'https://sketchfab.com/3d-models/magpul-afg-low-poly-7a617ccf7a244bf28f4c7bc3dbe44325',mn:'Magpul AFG (Low-Poly)'},
 m203:{f:'m203',slot:'under',n:'M203 (40 mm)',k:['Lanzagranadas bajo el cañón, montaje en raíl','Underbarrel grenade launcher, rail mount'],g:1400,barrel:305,
   src:[['Wikipedia — M203 (datos del manual FM 3-22.31 del Ejército de EE. UU.)','https://en.wikipedia.org/wiki/M203_grenade_launcher']],m:'https://sketchfab.com/3d-models/m203-grenade-launcher-rail-mounted-low-poly-782a36ecfe2e47c1bde4e7c72e02b610',mn:'M203 Grenade Launcher Rail Mounted (Low-Poly)'},
 peq15:{f:'peq15',slot:'laser',n:'AN/PEQ-15 ATPIAL',k:['Láser visible/infrarrojo e iluminador IR','Visible/IR laser and IR illuminator'],g:212.6,mm:117,
   src:[['L3Harris — AN/PEQ-15 ATPIAL (7,5 oz con pila; 11,7 cm)','https://www.l3harris.com/sites/default/files/2025-01/l3harris-an-peq-15-advanced-target-pointer-illuminator-aiming-laser-atpial-spec-sheet-ps-cs-ivs.pdf']],m:'https://sketchfab.com/3d-models/atpial-anpeq-15-low-poly-3758001408b0404592e7e80e7d5b3072',mn:'ATPIAL AN/PEQ-15 (Low-Poly)'},
 bipod:{f:'harris_sbrm',slot:'bipod',n:'Harris S-BRM 6–9″',k:['Bípode (patas de 15 a 23 cm)','Bipod (6–9 in legs)'],g:396.9,
   note:['Peso del bípode según Harris; el adaptador al raíl que se ve en el modelo no está incluido.','Bipod weight per Harris; the rail adapter seen on the model is not included.'],
   src:[['Harris Bipods — S-BRM (14 oz)','https://www.harrisbipods.com/product/s-brm-bipod/']],m:'https://sketchfab.com/3d-models/harris-bipod-low-poly-daa7dd1e247e453496974a5d252396f4',mn:'Harris Bipod (Low-Poly)'}
};
const SLOTS=[['optic',['Mira','Optic']],['muzzle',['Bocacha','Muzzle']],['under',['Bajo el cañón','Underbarrel']],['laser',['Láser','Laser']],['bipod',['Bípode','Bipod']]];

/* Armas. st = filas de la ficha (ES/EN) por variante; w = peso base en kg cuando la ficha da una sola cifra para esa variante. */
export const W=[
{id:'m4a1',ficha:'g-m4-carbine',n:'Colt M4A1',kind:['Carabina · EE. UU. · 5,56×45 mm OTAN','Carbine · USA · 5.56×45mm NATO'],
 hideOptic:['Carry_Handle'],
 V:[{id:'m4a1',file:'m4a1',m:'https://sketchfab.com/3d-models/colt-m4a1-low-poly-82302ecfa6c148329ffe1f488ae23f1f',mn:'Colt M4A1 (Low-Poly)',lab:['M4A1 · 5,56×45 mm','M4A1 · 5.56×45mm'],w:2.92,
  st:{cal:['5,56×45 mm OTAN','5.56×45mm NATO'],peso:['2,92 kg descargada; 3,52 kg con cargador de 30 y correa','2.92 kg empty; 3.52 kg with 30-round magazine and sling'],lon:['838 mm (culata extendida); 756 mm (retraída)','838 mm (stock extended); 756 mm (retracted)'],can:['368 mm','368 mm'],cad:['700–970 disparos/min (cíclica)','700–970 rounds/min (cyclic)'],vb:['910 m/s (M855A1); 880 m/s (M855)','910 m/s (M855A1); 880 m/s (M855)'],alc:['500 m (blancos puntuales); 600 m (de área)','500 m (point targets); 600 m (area targets)'],ali:['Cargador STANAG de 30','30-round STANAG magazine']},
  acc:{optic:['eotech','acog'],muzzle:['velos'],under:['afg','m203'],laser:['peq15']},
  pl:{eotech:[0,0.137,0.06],acog:[0,0.137,0.075],velos:[0,0.107,0.655],afg:[0,0.075,0.33],m203:{p:[0,0.075,0.30],sub:{Leaf_Sight:[0,0.02,0]}},peq15:[0,0.137,0.345]}}]},
{id:'scar',ficha:'g-fn-scar',n:'FN SCAR',kind:['Fusil de asalto / de combate · Bélgica','Assault / battle rifle · Belgium'],
 V:[{id:'scar-l',file:'scar-l',m:'https://sketchfab.com/3d-models/fn-scar-l-low-poly-3eef0e192978435ba636f3d3ae54dda5',mn:'FN SCAR-L (Low-Poly)',lab:['SCAR-L · 5,56×45 mm','SCAR-L · 5.56×45mm'],w:3.29,
  st:{cal:['5,56×45 mm OTAN','5.56×45mm NATO'],peso:['3,29 kg','3.29 kg'],lon:['889 mm (culata extendida); 635 mm (plegada)','889 mm (stock extended); 635 mm (folded)'],can:['355 mm','355 mm'],cad:['650 disparos/min','650 rounds/min'],vb:['870 m/s','870 m/s'],alc:['500 m','500 m'],ali:['Cargador STANAG de 30','30-round STANAG magazine']},
  acc:{optic:['eotech','acog'],muzzle:['velos'],under:['afg'],laser:['peq15']},
  pl:{eotech:[0,0.160,0.09],acog:[0,0.160,0.10],velos:[0,0.1125,0.585],afg:[0,0.086,0.30],peq15:[0,0.160,0.33]}},
  {id:'scar-h',file:'scar-h',m:'https://sketchfab.com/3d-models/fn-scar-h-low-poly-5429d05df204438a9761ee0931209bd9',mn:'FN SCAR-H (Low-Poly)',lab:['SCAR-H · 7,62×51 mm','SCAR-H · 7.62×51mm'],w:3.58,
  st:{cal:['7,62×51 mm OTAN','7.62×51mm NATO'],peso:['3,58 kg','3.58 kg'],lon:['965 mm (culata extendida); 711 mm (plegada)','965 mm (stock extended); 711 mm (folded)'],can:['400 mm','400 mm'],cad:['550 disparos/min','550 rounds/min'],vb:['710 m/s','710 m/s'],alc:['600 m','600 m'],ali:['Cargador de 20','20-round magazine']},
  acc:{optic:['eotech','acog'],under:['afg'],laser:['peq15']},
  pl:{eotech:[0,0.151,0.09],acog:[0,0.151,0.10],afg:[0,0.077,0.31],peq15:[0,0.151,0.335]}}],
 vnote:['El SCAR existe en dos calibres oficiales: SCAR-L (5,56 mm) y SCAR-H (7,62 mm). Cada uno es su propio modelo 3D. El silenciador Velos LBP es de 5,56 mm, así que solo se ofrece en el SCAR-L.','The SCAR comes in two official calibres: SCAR-L (5.56 mm) and SCAR-H (7.62 mm), each its own 3D model. The Velos LBP suppressor is 5.56 mm, so it is only offered on the SCAR-L.']},
{id:'mp7',ficha:'g-heckler-koch-mp7',n:'HK MP7A1',kind:['Subfusil / arma de defensa personal · Alemania · 4,6×30 mm','SMG / personal defence weapon · Germany · 4.6×30mm'],
 V:[{id:'mp7a1',file:'mp7a1',m:'https://sketchfab.com/3d-models/hk-mp7a1-low-poly-3c85ff79f3c448668fe3ab72f7e48d09',mn:'HK MP7A1 (Low-Poly)',lab:['MP7A1 · 4,6×30 mm','MP7A1 · 4.6×30mm'],w:2.10,wn:['con cargador','with magazine'],
  st:{cal:['HK 4,6×30 mm','HK 4.6×30mm'],peso:['2,10 kg con cargador (MP7A1)','2.10 kg with magazine (MP7A1)'],lon:['638 mm (culata extendida); 415 mm (plegada)','638 mm (stock extended); 415 mm (collapsed)'],can:['180 mm','180 mm'],cad:['950 disparos/min','950 rounds/min'],vb:['735 m/s','735 m/s'],alc:['200 m','200 m'],ali:['Cargador de 20, 30 o 40','20-, 30- or 40-round magazine']},
  acc:{optic:['eotech'],laser:['peq15']},
  pl:{eotech:[0,0.127,0.04],peq15:{p:[-0.022,0.076,0.17],r:[0,0,Math.PI/2]}}}],
 vnote:['No hay un modelo 3D libre de un silenciador de 4,6 mm, así que no se ofrece: mejor nada que uno inventado.','There is no free 3D model of a 4.6 mm suppressor, so none is offered: better nothing than a made-up one.']},
{id:'sr-25',ficha:'g-sr-25',n:'KAC SR-25',kind:['Fusil de tirador designado · EE. UU. · 7,62×51 mm','Designated marksman rifle · USA · 7.62×51mm'],
 V:[{id:'sr-25',file:'sr-25',m:'https://sketchfab.com/3d-models/sr-25-low-poly-e66b6868673743cfaa5ede6b31d8f0cc',mn:'SR-25 (Low-Poly)',lab:['SR-25 · 7,62×51 mm','SR-25 · 7.62×51mm'],w:null,
  st:{cal:['7,62×51 mm OTAN','7.62×51mm NATO'],peso:['Match 4,88 kg; LwMatch 4,3 kg; Carbine 3,4 kg; Sporter 3,97 kg','Match 4.88 kg; LwMatch 4.3 kg; Carbine 3.4 kg; Sporter 3.97 kg'],lon:['1.118 mm','1,118 mm'],can:['610 mm (Match); 510 mm (LwMatch/Sporter); 410 mm (Carbine)','610 mm (Match); 510 mm (LwMatch/Sporter); 410 mm (Carbine)'],cad:['Semiautomático','Semi-automatic'],ali:['Cargador de 10 o 20','10- or 20-round magazine']},
  acc:{optic:['lrt10'],bipod:['bipod']},
  pl:{lrt10:[0,0.144,0.13],bipod:[0,0.092,0.47]}}],
 vnote:['Sin silenciador: no hay un modelo 3D libre de un silenciador real de 7,62 mm.','No suppressor: there is no free 3D model of a real 7.62 mm suppressor.']},
{id:'m82',ficha:'g-barrett-m82',n:'Barrett M82',kind:['Fusil antimaterial · EE. UU. · .50 BMG','Anti-materiel rifle · USA · .50 BMG'],
 V:[{id:'m82a1',file:'m82a1',m:'https://sketchfab.com/3d-models/barrett-m82-low-poly-65b629b6e75541b9b88de571aeda24fa',mn:'Barrett M82 (Low-Poly)',lab:['M82 · 12,7×99 mm (.50 BMG)','M82 · 12.7×99mm (.50 BMG)'],w:null,
  st:{cal:['.50 BMG (12,7×99 mm); también .416 Barrett','.50 BMG (12.7×99mm); also .416 Barrett'],peso:['13,5 a 14,8 kg (según versión)','13.5 to 14.8 kg (by version)'],lon:['120 a 140 cm','120 to 140 cm'],can:['51 a 74 cm','51 to 74 cm'],vb:['853 m/s','853 m/s'],alc:['1.800 m','1,800 m'],ali:['Cargador de 5 o 10','5- or 10-round magazine']},
  acc:{optic:['mk4']},
  pl:{mk4:[0,0.165,0.30]}}],
 vnote:['El bípode es parte del arma. La mira que se ofrece es la que Leupold indica para el M107.','The bipod is part of the rifle. The scope offered is the one Leupold lists for the M107.']}
];
export const IDS={'g-m4-carbine':'m4a1','g-fn-scar':'scar','g-heckler-koch-mp7':'mp7','g-sr-25':'sr-25','g-barrett-m82':'m82'};

const CSS=`
.arm-hub{display:grid;grid-template-columns:1fr;gap:12px;margin:14px 0}
@media(min-width:760px){.arm-hub{grid-template-columns:1fr 1fr}}
.arm-card{display:block;border:1px solid var(--line,#2c3136);border-radius:10px;overflow:hidden;background:#15181b;color:inherit;text-decoration:none}
.arm-card img{display:block;width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;background:#22262a}
.arm-card .t{font-weight:700;padding:8px 12px 0}.arm-card .d{color:var(--dim,#9aa0a6);font-size:13px;padding:2px 12px 10px}
.arm-wrap{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:980px){.arm-wrap{grid-template-columns:minmax(0,1.55fr) minmax(300px,1fr);align-items:start}}
.arm-stage{position:relative;border-radius:10px;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#3a4046 0%,#1d2124 70%,#141618 100%);touch-action:none;user-select:none;-webkit-user-select:none}
.arm-stage canvas{display:block;width:100%;height:100%}
.arm-stage{aspect-ratio:16/11}@media(min-width:600px){.arm-stage{aspect-ratio:16/9}}
.arm-hint{position:absolute;left:10px;bottom:8px;font-size:11.5px;color:#c9cdd1;opacity:.75;pointer-events:none}
.arm-load{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#c9cdd1;font-size:14px}
.arm-btns{position:absolute;right:8px;top:8px;display:flex;gap:6px}
.arm-btns button{background:rgba(20,22,24,.75);color:#e8eaec;border:1px solid #444b52;border-radius:8px;padding:5px 9px;font-size:12px;cursor:pointer}
.arm-slot{margin:10px 0 0}.arm-slot .sl{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim,#9aa0a6);margin-bottom:5px}
.arm-chips{display:flex;flex-wrap:wrap;gap:6px}
.arm-chip{border:1px solid #444b52;background:#1b1f22;color:#e3e6e8;border-radius:999px;padding:6px 11px;font-size:13px;cursor:pointer;line-height:1.2;text-align:left}
.arm-chip.on{background:#d6b25e;color:#17191b;border-color:#d6b25e;font-weight:700}
.arm-chip small{display:block;font-size:10.5px;opacity:.75;font-weight:400}
.arm-stats{border:1px solid var(--line,#2c3136);border-radius:10px;padding:4px 12px;background:#15181b}
.arm-row{display:grid;grid-template-columns:118px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid #262b2f;font-size:13.5px}
.arm-row:last-child{border-bottom:0}.arm-row .k{color:var(--dim,#9aa0a6)}
.arm-d{display:inline-block;margin-left:6px;color:#7fd18b;font-weight:700;font-size:12.5px}
.arm-acc{font-size:13px;margin:8px 0 0;padding:0;list-style:none}.arm-acc li{padding:6px 0;border-bottom:1px dashed #2a2f33}
.arm-src{font-size:12px;color:var(--dim,#9aa0a6)}.arm-src a{color:inherit}
.arm-sum{margin:8px 0 0;font-size:13.5px;color:#e3e6e8}.arm-sum b{color:#d6b25e}
.arm-note{font-size:12.5px;color:var(--dim,#9aa0a6);margin:8px 0}
`;

const CACHE={};
function loader(){ const l=new GLTFLoader(); l.setMeshoptDecoder(MeshoptDecoder); return l; }
function getGLB(f){ if(!CACHE[f]) CACHE[f]=loader().loadAsync(DIR+f+'.glb?v='+VER).catch(e=>{ delete CACHE[f]; throw e; }); return CACHE[f]; }
const fmtKg=v=>(EN()?v.toFixed(2):v.toFixed(2).replace('.',','))+' kg';
const fmtG=v=>(v>=1000?fmtKg(v/1000):Math.round(v)+' g');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let ACTIVE=null;
function stop(){ if(ACTIVE){ ACTIVE.destroy(); ACTIVE=null; } }
window.addEventListener('hashchange',()=>{ if(!/^#\/armero\/./.test(location.hash)) stop(); });

function viewer(stage){
  const canvas=document.createElement('canvas'); stage.appendChild(canvas);
  let R; try{ R=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); R.setClearColor(0x000000,0); }catch(e){ return null; }
  const mob=Math.min(screen.width,screen.height)<700;
  R.setPixelRatio(Math.min(window.devicePixelRatio||1, mob?1.5:1.75));
  R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.0; R.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene();
  const pm=new THREE.PMREMGenerator(R); const envRT=pm.fromScene(new RoomEnvironment(),0.04); scene.environment=envRT.texture; scene.environmentIntensity=0.9; pm.dispose();
  const key=new THREE.DirectionalLight(0xffffff,1.6); key.position.set(-3,5,4); scene.add(key);
  scene.add(new THREE.HemisphereLight(0xe6ecf5,0x2a2c30,0.5));
  const cam=new THREE.PerspectiveCamera(28,1,0.01,50);
  const pivot=new THREE.Group(); scene.add(pivot); const holder=new THREE.Group(); pivot.add(holder);
  let yaw=-1.4, pitch=0.14, dist=2, fitD=2, auto=true, idleT=0, dirty=true, raf=0, alive=true, visible=true, last=performance.now();
  function size(){ const w=stage.clientWidth||360, h=stage.clientHeight||270; R.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); dirty=true; }
  const ro=new ResizeObserver(size); ro.observe(stage); size();
  const io=new IntersectionObserver(es=>{ visible=es[0].isIntersecting; if(visible) loop(); },{threshold:0.01}); io.observe(stage);
  function place(){ cam.position.set(Math.sin(yaw)*Math.cos(pitch)*dist, Math.sin(pitch)*dist, Math.cos(yaw)*Math.cos(pitch)*dist); cam.lookAt(0,0,0); }
  function loop(){ if(!alive||raf) return; raf=requestAnimationFrame(t=>{ raf=0; if(!alive) return; const dt=Math.min(0.05,(t-last)/1000); last=t;
      if(auto){ idleT+=dt; if(idleT>3.5){ yaw+=dt*0.35; dirty=true; } }
      if(dirty){ place(); R.render(scene,cam); dirty=false; }
      if(visible&&!document.hidden&&(auto||dirty)) loop(); }); }
  // gestos: arrastrar = girar; pellizco/rueda = zoom; doble toque = encuadre inicial
  const P=new Map(); let pd0=0, d0=0;
  stage.addEventListener('pointerdown',e=>{ stage.setPointerCapture&&stage.setPointerCapture(e.pointerId); P.set(e.pointerId,{x:e.clientX,y:e.clientY}); idleT=0; if(P.size===2){ const a=[...P.values()]; pd0=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); d0=dist; } });
  stage.addEventListener('pointermove',e=>{ const p=P.get(e.pointerId); if(!p) return; idleT=0;
     if(P.size===1){ yaw-=(e.clientX-p.x)*0.009; pitch=Math.max(-0.7,Math.min(0.9,pitch+(e.clientY-p.y)*0.006)); }
     p.x=e.clientX; p.y=e.clientY;
     if(P.size===2&&pd0){ const a=[...P.values()]; const pd=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y); dist=Math.max(fitD*0.35,Math.min(fitD*1.8,d0*pd0/pd)); }
     dirty=true; loop(); });
  const up=e=>{ P.delete(e.pointerId); if(P.size<2) pd0=0; };
  stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',up);
  stage.addEventListener('wheel',e=>{ e.preventDefault(); idleT=0; dist=Math.max(fitD*0.35,Math.min(fitD*1.8,dist*(1+Math.sign(e.deltaY)*0.1))); dirty=true; loop(); },{passive:false});
  let lastTap=0; stage.addEventListener('pointerup',e=>{ const t=performance.now(); if(t-lastTap<300){ reset(); } lastTap=t; });
  function reset(){ yaw=-1.4; pitch=0.14; dist=fitD; idleT=0; dirty=true; loop(); }
  function fit(obj){ const b=new THREE.Box3().setFromObject(obj); const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); holder.position.set(-c.x,-c.y,-c.z);
     const tv=Math.tan(THREE.MathUtils.degToRad(cam.fov/2)); const len=Math.max(s.x,s.y,s.z); fitD=Math.max(len*0.6/(tv*cam.aspect), s.y*0.8/tv)+len*0.08; dist=fitD; cam.near=fitD/50; cam.far=fitD*20; cam.updateProjectionMatrix(); dirty=true; loop(); }
  function recenter(){ holder.position.set(0,0,0); holder.updateMatrixWorld(true); const b=new THREE.Box3().setFromObject(holder); const c=b.getCenter(new THREE.Vector3()); holder.position.set(-c.x,-c.y,-c.z); dirty=true; loop(); }
  function dispose(o){ o.traverse(q=>{ if(q.geometry) q.geometry.dispose(); }); }
  return { scene, holder, fit, recenter, reset, redraw(){ dirty=true; loop(); }, setAuto(v){ auto=v; idleT=v?4:0; loop(); },
    destroy(){ alive=false; if(raf) cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); dispose(scene); envRT.dispose(); R.dispose(); try{R.forceContextLoss();}catch(e){} } };
}

function hub(app,ctx){
  const h=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[L('Armero 3D','3D Gunsmith')]])+
  '<h1>'+L('Armero 3D','3D Gunsmith')+'</h1><p class="sub">'+L('Gira el arma en 3D y monta accesorios reales que existen para ella: miras, silenciador, empuñadura, láser, bípode. Los datos cambian solo con cifras publicadas por el fabricante; si no hay dato, no se inventa.','Spin the weapon in 3D and mount real accessories that exist for it: optics, suppressor, grip, laser, bipod. Figures only change with numbers published by the maker; no data, no number.')+'</p>'+
  '<div class="arm-hub">'+W.map(w=>'<a class="arm-card" href="#/armero/'+w.id+'"><img src="'+DIR+w.id+'.jpg?v='+VER+'" alt="'+esc(w.n)+'" loading="lazy" width="800" height="320"><div class="t">'+esc(w.n)+'</div><div class="d">'+esc(LL(w.kind))+' · '+accCount(w)+' '+L('accesorios','accessories')+'</div></a>').join('')+'</div>'+
  '<p class="arm-note">'+L('Primera tanda: 5 armas modernas con modelo 3D libre de calidad. Iremos añadiendo más (HK416, G36, AK-12, FAMAS, Tavor, MP5, P90…) cuando haya modelos libres a la altura.','First batch: 5 modern weapons with a good free 3D model. More will follow (HK416, G36, AK-12, FAMAS, Tavor, MP5, P90…) as suitable free models are found.')+'</p>'+
  '<p class="arm-note">'+L('Modelos 3D: serie «Low-Poly» de GoldbergR en Sketchfab, licencia CC BY 4.0 (ver cada arma y la página de licencias). Nada sacado de videojuegos ni generado con IA.','3D models: GoldbergR\'s "Low-Poly" series on Sketchfab, CC BY 4.0 licence (see each weapon and the licences page). Nothing taken from video games or generated with AI.')+'</p>';
  ctx.set(h,L('Armero 3D','3D Gunsmith'));
}
function accCount(w){ const s=new Set(); w.V.forEach(v=>Object.values(v.acc).forEach(a=>a.forEach(x=>s.add(x)))); return s.size; }

function page(app,ctx,w){
  const st={v:0,on:{}};
  const sv=new URLSearchParams((location.hash.split('?')[1]||'')); 
  const shell=ctx.crumbs([[L('Inicio','Home'),'#/'],[L('Armas ligeras','Small arms'),'#/armas'],[L('Armero 3D','3D Gunsmith'),'#/armero'],[w.n]])+
   '<h1>'+esc(w.n)+'</h1><p class="sub">'+esc(LL(w.kind))+' · <a href="#/a/'+w.ficha+'">'+L('Ver ficha completa','Full data sheet')+'</a></p>'+
   '<div class="arm-wrap"><div><div class="arm-stage" id="armst"><div class="arm-load">'+L('Cargando modelo 3D…','Loading 3D model…')+'</div><div class="arm-btns"><button type="button" id="armrot">'+L('Pausar giro','Pause spin')+'</button><button type="button" id="armrs">'+L('Centrar','Reset')+'</button></div><div class="arm-hint">'+L('Arrastra para girar · pellizca o rueda para zoom','Drag to rotate · pinch or scroll to zoom')+'</div></div>'+
   '<div id="armsum" class="arm-sum"></div><div id="armui"></div></div><div><div class="arm-stats" id="armstats"></div><div id="armacc"></div></div></div>'+
   '<div id="armcred"></div>';
  ctx.set(shell,w.n+' · '+L('Armero 3D','3D Gunsmith'));
  const stage=document.getElementById('armst'); stop();
  const V=viewer(stage);
  if(!V){ stage.querySelector('.arm-load').textContent=L('Tu navegador no puede mostrar 3D (WebGL).','Your browser cannot show 3D (WebGL).'); }
  ACTIVE=V;
  let weapon=null, wfile=null; const mounted={}; let token=0;
  const ui=document.getElementById('armui');
  function cur(){ return w.V[st.v]; }
  function renderUI(){
    const v=cur(); let h='';
    if(w.V.length>1) h+='<div class="arm-slot"><div class="sl">'+L('Calibre (versiones oficiales)','Calibre (official versions)')+'</div><div class="arm-chips">'+w.V.map((x,i)=>'<button type="button" class="arm-chip'+(i===st.v?' on':'')+'" data-v="'+i+'">'+esc(LL(x.lab))+'</button>').join('')+'</div></div>';
    SLOTS.forEach(([sk,nm])=>{ const opts=v.acc[sk]; if(!opts||!opts.length) return;
      h+='<div class="arm-slot"><div class="sl">'+LL(nm)+'</div><div class="arm-chips"><button type="button" class="arm-chip'+(!st.on[sk]?' on':'')+'" data-s="'+sk+'" data-a="">'+L('Ninguno','None')+'</button>'+
      opts.map(a=>'<button type="button" class="arm-chip'+(st.on[sk]===a?' on':'')+'" data-s="'+sk+'" data-a="'+a+'">'+esc(ACC[a].n)+'<small>'+esc(LL(ACC[a].k))+(ACC[a].g?' · '+fmtG(ACC[a].g):'')+'</small></button>').join('')+'</div></div>'; });
    if(w.vnote) h+='<p class="arm-note">'+esc(LL(w.vnote))+'</p>';
    ui.innerHTML=h;
  }
  ui.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.v!=null){ const i=+b.dataset.v; if(i!==st.v){ st.v=i; Object.keys(st.on).forEach(s=>{ if(!(cur().acc[s]||[]).includes(st.on[s])) delete st.on[s]; }); load(); } }
    else if(b.dataset.s){ const s=b.dataset.s, a=b.dataset.a; if(a) st.on[s]=a; else delete st.on[s]; sync(); }
    renderUI(); stats(); });
  function stats(){
    const v=cur(), S=v.st, on=Object.values(st.on).map(a=>ACC[a]);
    const add=on.reduce((s,a)=>s+(a.g||0),0), sup=on.find(a=>a.slot==='muzzle');
    const row=(k,val,extra)=>val?'<div class="arm-row"><div class="k">'+k+'</div><div>'+esc(LL(val))+(extra||'')+'</div></div>':'';
    let h=row(L('Calibre','Calibre'),S.cal);
    h+=row(L('Peso del arma','Weapon weight'),S.peso);
    if(on.length){ h+='<div class="arm-row"><div class="k">'+L('Accesorios','Accessories')+'</div><div><span class="arm-d" style="margin-left:0">+'+fmtG(add)+'</span> <span class="arm-src">('+on.length+')</span></div></div>';
      if(v.w) h+='<div class="arm-row"><div class="k">'+L('Total','Total')+'</div><div><b>≈ '+fmtKg(v.w+add/1000)+'</b> <span class="arm-src">('+fmtKg(v.w)+(v.wn?' '+LL(v.wn):'')+' + '+fmtG(add)+'; '+L('suma de pesos publicados','sum of published weights')+')</span></div></div>'; }
    h+=row(L('Longitud','Length'),S.lon, sup&&sup.mm?'<span class="arm-d">+ '+L('silenciador','suppressor')+' '+Math.round(sup.mm)+' mm</span>':'');
    h+=row(L('Cañón','Barrel'),S.can)+row(L('Cadencia','Rate of fire'),S.cad)+row(L('Velocidad de boca','Muzzle velocity'),S.vb)+row(L('Alcance eficaz','Effective range'),S.alc)+row(L('Alimentación','Feed'),S.ali);
    h+='<div class="arm-row"><div class="k">'+L('Fuente','Source')+'</div><div class="arm-src">'+L('Ficha M.A.T (Wikipedia)','M.A.T data sheet (Wikipedia)')+' · <a href="#/a/'+w.ficha+'">'+L('ver ficha','open')+'</a></div></div>';
    document.getElementById('armstats').innerHTML=h;
    document.getElementById('armsum').innerHTML=on.length?(v.w?L('Peso total','Total weight')+' <b>≈ '+fmtKg(v.w+add/1000)+'</b> · ':L('Accesorios','Accessories')+' <b>+'+fmtG(add)+'</b> · ')+on.length+' '+L(on.length>1?'accesorios montados':'accesorio montado',on.length>1?'accessories mounted':'accessory mounted'):L('Sin accesorios: elige abajo qué montar','No accessories: pick below what to mount');
    let a='';
    if(on.length){ a='<ul class="arm-acc">'+on.map(x=>'<li><b>'+esc(x.n)+'</b> — '+esc(LL(x.k))+'<br>'+[x.g?L('Peso','Weight')+' '+fmtG(x.g):'',x.mm?L('Longitud','Length')+' '+Math.round(x.mm)+' mm':'',x.barrel?L('Cañón','Barrel')+' '+x.barrel+' mm':''].filter(Boolean).join(' · ')+(x.note?'<div class="arm-src">'+esc(LL(x.note))+'</div>':'')+'<div class="arm-src">'+L('Fuente','Source')+': '+x.src.map(s=>'<a href="'+s[1]+'" target="_blank" rel="noopener">'+esc(s[0])+'</a>').join(' · ')+'</div></li>').join('')+'</ul>'; }
    else a='<p class="arm-note">'+L('Elige accesorios a la izquierda (o debajo en el móvil) y se montan en el arma.','Pick accessories and they are mounted on the weapon.')+'</p>';
    a+='<p class="arm-note">'+L('El peso total es la suma del peso del arma de su ficha y los pesos publicados por cada fabricante. No hay estadísticas de juego: solo datos reales.','Total weight is the weapon\'s weight from its data sheet plus each maker\'s published weight. No game stats: real data only.')+'</p>';
    document.getElementById('armacc').innerHTML=a;
    credits();
  }
  function credits(){
    const v=cur(); const used=new Set(); w.V.forEach(x=>Object.values(x.acc).forEach(l=>l.forEach(a=>used.add(a))));
    document.getElementById('armcred').innerHTML='<h2>'+L('Créditos de los modelos 3D','3D model credits')+'</h2><p class="arm-src">'+
      w.V.map(x=>'«<a href="'+x.m+'" target="_blank" rel="noopener">'+esc(x.mn)+'</a>»').join(', ')+' '+L('y accesorios','and accessories')+' '+[...used].map(a=>'«<a href="'+ACC[a].m+'" target="_blank" rel="noopener">'+esc(ACC[a].mn)+'</a>»').join(', ')+
      ' — '+L('de','by')+' <a href="'+SF+'" target="_blank" rel="noopener">GoldbergR</a> (Sketchfab), '+L('licencia','licence')+' <a href="'+CCBY+'" target="_blank" rel="noopener">CC BY 4.0</a>. '+
      L('Cambios de M.A.T: compresión (meshopt), origen recolocado para montar los accesorios y posición de cada accesorio en el arma.','Changes by M.A.T: compression (meshopt), origin moved to mount the accessories, and each accessory\'s position on the weapon.')+' <a href="#/license">'+L('Licencias','Licences')+'</a></p>';
  }
  function setVis(){ if(!weapon) return; const v=cur(); const hasOptic=!!st.on.optic;
    (w.hideOptic||[]).forEach(n=>weapon.traverse(o=>{ if(o.name&&o.name.includes(n)) o.visible=!hasOptic; })); }
  async function sync(){
    if(!V||!weapon) return; const my=token; const v=cur();
    for(const s of Object.keys(mounted)){ if(st.on[s]!==mounted[s].a){ V.holder.remove(mounted[s].o); delete mounted[s]; } }
    for(const [s,a] of Object.entries(st.on)){ if(mounted[s]) continue; const pl=v.pl[a]; if(!pl) continue;
      try{ const g=await getGLB(ACC[a].f); if(my!==token||st.on[s]!==a||mounted[s]) continue;
        const o=g.scene.clone(true); const P=Array.isArray(pl)?{p:pl}:pl; o.position.set(...P.p); if(P.r) o.rotation.set(...P.r);
        if(P.sub){ o.updateMatrixWorld(true); for(const [nm,d] of Object.entries(P.sub)){ let hit=null; o.traverse(q=>{ if(!hit&&q.name&&q.name.includes(nm)) hit=q; }); if(hit){ const wp=hit.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(...d)); hit.parent.worldToLocal(wp); hit.position.copy(wp); } } }
        V.holder.add(o); mounted[s]={a,o}; }catch(e){ console.warn('armero acc',a,e); } }
    setVis(); V.recenter();
  }
  async function load(){
    if(!V) return; const my=++token; const v=cur();
    stage.querySelector('.arm-load')&&(stage.querySelector('.arm-load').style.display='flex');
    try{ const g=await getGLB(v.file); if(my!==token) return;
      if(weapon){ V.holder.remove(weapon); } Object.keys(mounted).forEach(s=>{ V.holder.remove(mounted[s].o); delete mounted[s]; });
      weapon=g.scene.clone(true); V.holder.add(weapon); wfile=v.file; V.fit(weapon);
      const ld=stage.querySelector('.arm-load'); if(ld) ld.style.display='none';
      await sync();
    }catch(e){ const ld=stage.querySelector('.arm-load'); if(ld) ld.textContent=L('No se pudo cargar el modelo. Comprueba la conexión.','The model could not be loaded. Check your connection.'); }
  }
  let spin=true; document.getElementById('armrot').onclick=e=>{ spin=!spin; V&&V.setAuto(spin); e.target.textContent=spin?L('Pausar giro','Pause spin'):L('Girar','Spin'); };
  document.getElementById('armrs').onclick=()=>V&&V.reset();
  // preselección por URL: #/armero/m4a1?acc=eotech,velos
  const pre=(sv.get('acc')||'').split(',').filter(a=>ACC[a]); const vi=w.V.findIndex(x=>x.id===sv.get('v')); if(vi>=0) st.v=vi;
  pre.forEach(a=>{ if((cur().acc[ACC[a].slot]||[]).includes(a)) st.on[ACC[a].slot]=a; });
  renderUI(); stats(); load();
  window.MAT_ARMERO_DBG={st,mounted:()=>Object.keys(mounted)};
}

export function route(app,ctx,p){
  stop();
  if(!document.getElementById('armcss')){ const s=document.createElement('style'); s.id='armcss'; s.textContent=CSS; document.head.appendChild(s); }
  const id=(p[1]||'').split('?')[0];
  const w=id&&W.find(x=>x.id===id||x.V.some(v=>v.id===id));
  if(id&&!w) return ctx.notfound?ctx.notfound():hub(app,ctx);
  if(w) return page(app,ctx,w);
  return hub(app,ctx);
}
