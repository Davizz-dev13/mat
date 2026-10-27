(function(){
"use strict";
// M.A.T · Batallas históricas (#/batallas, #/batallas/<id>). Motor genérico: cada batalla vive en batallas/<id>.json
// (pasos, vistas del mapa, unidades, flechas, defensas, playas, fuerzas y fuentes). Mapa SVG dibujado por M.A.T.
var IDX=null, CACHE={}, IDXS={}, BASE='batallas'; // BASE: 'batallas' | 'operaciones' (mismo motor)
function EN(){return window.MAT_LANG==='en';}
function T(a){ if(a==null) return ''; if(Array.isArray(a)) return EN()?(a[1]!=null?a[1]:a[0]):a[0]; a=String(a); var i=a.indexOf('|'); if(i>0) return EN()?a.slice(i+1):a.slice(0,i); return a; }
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function V(){var s=document.querySelector('script[src^="loader.js"]')||document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1';}
function get(f){ return fetch(f+'?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }); }
function RM(){ try{ return window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(x){ return false; } }
var NS='http://www.w3.org/2000/svg';
var ICON='<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><rect x="6" y="9" width="36" height="30" rx="2" fill="#e9dcb8" stroke="#8a6d3b" stroke-width="1.4"/><path d="M9 30c5-2 8 2 13 0s7-6 11-5 5 3 6 2" fill="none" stroke="#5b4526" stroke-width="1.3"/><path d="M14 20q8-7 17 1" fill="none" stroke="#1d3f8a" stroke-width="1.8" stroke-linecap="round"/><path d="M28 17.5l3.6 3.9-5.1.4z" fill="#1d3f8a"/><rect x="31" y="25" width="7" height="5" fill="none" stroke="#222" stroke-width="1.2"/></svg>';
window.MAT_BATALLAS_ICON=ICON;
var UI={es:{hub:'Batallas y operaciones especiales',hubsub:'Dos colecciones contadas paso a paso sobre el mapa: grandes batallas de la historia y operaciones especiales modernas, con fuentes en cada paso.',bh:'Batallas históricas',bhd:'Diez grandes batallas, de Verdún a Berlín, en mapas de estilo antiguo',oh:'Operaciones especiales',ohd:'Misiones de fuerzas especiales paso a paso: la primera, la operación contra Bin Laden (2011)',osub:'Misiones de fuerzas especiales contadas paso a paso sobre el mapa: antecedentes, planificación, la noche de la operación y sus consecuencias. Datos de fuentes públicas citadas en cada paso; donde las versiones difieren, se indican todas.',over:'Ver operación',onf:'Operación no encontrada',oerr:'No se pudo cargar la operación.',datos:'Datos clave',caps:'Capítulos',vers:'Versiones',nmis:'misión',nmiss:'misiones',nbat:'batallas',h:'Batallas históricas',home:'Inicio',sub:'Grandes batallas contadas paso a paso sobre mapas de estilo antiguo: dónde estaba cada fuerza, con qué carros de combate y aviones, por dónde atacaron y los pequeños detalles. Datos de fuentes públicas citadas en cada paso.',ver:'Ver batalla',soon:'Próximamente',prev:'Anterior',next:'Siguiente',paso:'Paso',det:'Detalle',src:'Fuentes de este paso',playas:'Las cinco playas',fz:'Fuerzas enfrentadas',fuentes:'Todas las fuentes',leyenda:'Leyenda del mapa',back:'Volver a los pasos',vermap:'Ver en el mapa',hora:'Hora H',sec:'Sector',uds:'Unidades',mandos:'Mandos',tropas:'Desembarcados',bajas:'Bajas aliadas (aprox.)',carros:'Carros de combate y vehículos',de:'Defensores alemanes',cur:'Curiosidad',defs:'Defensas en el mapa',cifras:'Cifras',medios:'Material (fichas M.A.T)',tap:'Toca una unidad o una defensa del mapa para ver más.',eq:'Material',aprox:'Posición aproximada',cerrar:'Cerrar',load:'Cargando…',err:'No se pudo cargar la batalla.',timeline:'Línea de tiempo',notfound:'Batalla no encontrada'},
 en:{hub:'Battles & special operations',hubsub:'Two collections told step by step on the map: great battles of history and modern special operations, with sources in every step.',bh:'Historic battles',bhd:'Ten great battles, from Verdun to Berlin, on old-style maps',oh:'Special operations',ohd:'Special-forces missions step by step: the first one, the raid on Bin Laden (2011)',osub:'Special-forces missions told step by step on the map: background, planning, the night of the operation and its aftermath. Data from public sources cited in every step; where accounts differ, all of them are shown.',over:'View operation',onf:'Operation not found',oerr:'Could not load the operation.',datos:'Key facts',caps:'Chapters',vers:'Accounts',nmis:'mission',nmiss:'missions',nbat:'battles',h:'Historic battles',home:'Home',sub:'Great battles told step by step on old-style maps: where each force was, with which tanks and aircraft, where they attacked and the small details. Data from public sources cited in every step.',ver:'View battle',soon:'Coming soon',prev:'Previous',next:'Next',paso:'Step',det:'Detail',src:'Sources for this step',playas:'The five beaches',fz:'Opposing forces',fuentes:'All sources',leyenda:'Map legend',back:'Back to the steps',vermap:'Show on the map',hora:'H-Hour',sec:'Sector',uds:'Units',mandos:'Commanders',tropas:'Landed',bajas:'Allied casualties (approx.)',carros:'Tanks and vehicles',de:'German defenders',cur:'Did you know?',defs:'Defences on the map',cifras:'Figures',medios:'Equipment (M.A.T entries)',tap:'Tap a unit or a defence on the map for more.',eq:'Equipment',aprox:'Approximate position',cerrar:'Close',load:'Loading…',err:'Could not load the battle.',timeline:'Timeline',notfound:'Battle not found'}};
function U_(k){return UI[EN()?'en':'es'][k];}
function OPS(){return BASE==='operaciones';}
function LT(){return OPS()?U_('oh'):U_('h');} function LR(){return OPS()?'#/operaciones':'#/batallas/historicas';}
var OPICON='<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><rect x="6" y="9" width="36" height="30" rx="2" fill="#1f2a33" stroke="#8fa3b3" stroke-width="1.4"/><circle cx="24" cy="24" r="9" fill="none" stroke="#d6b25e" stroke-width="1.6"/><path d="M24 11v7M24 30v7M11 24h7M30 24h7" stroke="#d6b25e" stroke-width="1.6"/><circle cx="24" cy="24" r="2" fill="#e0622b"/></svg>';
var NAT={pk:'Pakistán|Pakistan',sa:'Arabia Saudí|Saudi Arabia',af:'Afganistán|Afghanistan',none:'Al Qaeda|Al-Qaeda',jp:'Japón|Japan',us:'EE. UU.|USA',uk:'Reino Unido|UK',ca:'Canadá|Canada',fr:'Francia|France',de:'Alemania|Germany',su:'URSS|USSR',ro:'Rumanía|Romania',it:'Italia|Italy',hu:'Hungría|Hungary',hr:'Croacia|Croatia',esr:'República Española|Spanish Republic',esn:'Bando sublevado (nacional)|Nationalists',bri:'Brigadas Internacionales|International Brigades',au:'Australia|Australia',nz:'Nueva Zelanda|New Zealand',za:'Sudáfrica|South Africa',in:'India británica|British India',gr:'Grecia|Greece',ffr:'Francia Libre|Free France',itr:'Reino de Italia|Kingdom of Italy'};
var FLAG={pk:'pk',sa:'sa',sd:'sd',ye:'ye',af:'af',none:'none',jp:'jp',us:'us',uk:'gb',ca:'ca',fr:'fr',de:'de',su:'su',ro:'ro',it:'it',hu:'hu',hr:'hr',pl:'pl',dei:'de_imp',esr:'es_rep',esn:'es_nac',bri:'brig_int',cz:'cz',car:'ca_red',nz:'nz',au:'au',zao:'za_old',be:'be',ie:'ie',itr:'it_kgd',za:'za_old',in:'in_raj',gr:'gr_1822',ffr:'fr_libre'};
var THEMES={noche:'noche',nieve:'snow',mar:'mar',barro:'barro',ruinas:'ruinas',meseta:'meseta',cielo:'cielo',desierto:'desierto'}; // tema -> clase CSS
var LD=null; // bandos de la batalla actual (D.lados): colores y distintivos por bando

var CSS='.bt{--pa:#efe3c2;--pa2:#e4d3a8;--ink:#3b2b16;--ink2:#6b5433;--al:#1d3f8a;--al2:#b3261e;--ge:#2b2b2b;--ge2:#7a7a72;color:var(--tx)}'+
'.bt .bt-title{font-family:"Iowan Old Style","Palatino Linotype","Book Antiqua",Palatino,Georgia,serif;letter-spacing:.02em}'+
'.bt h1.bt-title{font-size:26px;line-height:1.15;margin:6px 0 2px}'+
'.bt .bt-meta{color:var(--mu);font-size:13px;margin:0 0 10px}'+
'.bt-list{display:grid;gap:12px;margin:12px 0 24px}'+
'.bt-card{display:flex;gap:12px;align-items:center;padding:14px;border-radius:8px;background:#e9dcb8 radial-gradient(circle at 30% 20%,#f3e8cb,#dcc89a);color:#3b2b16;text-decoration:none;border:1px solid #b89a63;box-shadow:inset 0 0 30px rgba(110,80,30,.25)}'+
'.bt-card .t{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:19px;font-weight:700}.bt-card .d{font-size:13px;color:#5b4526}.bt-card .go{margin-left:auto;font-size:22px;color:#6b5433}'+
'.bt-card.soon{opacity:.6;filter:grayscale(.4)}.bt-card .bdg{font-size:10px;letter-spacing:.12em;text-transform:uppercase;border:1px solid #8a6d3b;border-radius:3px;padding:2px 6px;margin-left:6px;vertical-align:2px}'+
'.bt-mapw{position:relative;border-radius:6px;overflow:hidden;border:1px solid #8a6d3b;background:#e7d7ad;box-shadow:inset 0 0 50px rgba(90,60,20,.45)}'+
'.bt-mapw:before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;opacity:.33;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3CfeColorMatrix values=%270 0 0 0 .45 0 0 0 0 .33 0 0 0 0 .18 0 0 0 .55 0%27/%3E%3C/filter%3E%3Crect width=%27160%27 height=%27160%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")}'+
'.bt-mapw:after{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(80,50,15,.35) 100%)}'+
'.bt-map{display:block;width:100%;aspect-ratio:4/3;touch-action:manipulation}@media(min-width:900px){.bt-map{aspect-ratio:16/10}}'+
'.bt-map .sea{fill:#bccbc6}.bt-map .wl{fill:none;stroke:#8fb0b4;stroke-opacity:.55;stroke-linejoin:round}.bt-map .grat{fill:none;stroke:#a08a5c;stroke-opacity:.35}.bt-map .land{fill:#efe3c2;fill-rule:evenodd}.bt-map .landov{fill:#efe3c2;stroke:#3b2b16;stroke-linejoin:round}'+
'.bt-map .coast{fill:none;stroke:#3b2b16;stroke-linejoin:round;stroke-linecap:round}.bt-map .riv{fill:none;stroke:#5c7794;stroke-opacity:.8}.bt-map .flood{fill:url(#btFlood);stroke:#5c7794;stroke-opacity:.5}'+
'.bt-map .area{fill:#1d3f8a;fill-opacity:.16;stroke:#1d3f8a;stroke-dasharray:4 3;fill-rule:nonzero}.bt-map .beach{fill:none;stroke-linecap:round}'+
'.bt-map text{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;fill:#3b2b16;paint-order:stroke;stroke:#efe3c2;stroke-width:3px;stroke-linejoin:round}'+
'.bt-map .sym{transition:opacity .45s}.bt-map .sym.off{opacity:0;pointer-events:none}.bt-map .hide{display:none}.bt-map .tap{cursor:pointer}'+
'.bt-map .arw{transition:opacity .5s}.bt-map .arw.draw path.ln{stroke-dasharray:1 1;stroke-dashoffset:1;animation:btdraw 1.2s ease-out forwards}@keyframes btdraw{to{stroke-dashoffset:0}}'+
'.bt-map.wide .ulab{display:none}.bt-map .ttl{font-size:12px;letter-spacing:.18em;text-transform:uppercase}'+
'@media(prefers-reduced-motion:reduce){.bt-map .sym,.bt-map .arw{transition:none}.bt-map .arw.draw path.ln{animation:none;stroke-dashoffset:0}}'+
'.bt-cap{position:absolute;left:6px;bottom:6px;z-index:3;background:rgba(239,227,194,.9);color:#3b2b16;border:1px solid #8a6d3b;border-radius:3px;padding:2px 7px;font:600 11px/1.3 "Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;letter-spacing:.03em;max-width:calc(100% - 12px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.bt-ctl{display:flex;align-items:center;gap:8px;margin:10px 0 4px}.bt-ctl .btn{flex:0 0 auto;padding:9px 12px;font-size:14px}.bt-ctl .num{flex:1;text-align:center;color:var(--mu);font-size:13px}'+
'.bt-rng{width:100%;margin:6px 0 2px;accent-color:#b08d4f}.bt-ticks{display:flex;justify-content:space-between;font-size:10px;color:var(--dim);margin:0 2px 8px}'+
'.bt-step{background:#efe3c2;color:#3b2b16;border:1px solid #b89a63;border-radius:6px;padding:14px 14px 10px;margin:8px 0 12px;box-shadow:inset 0 0 40px rgba(120,85,30,.18)}'+
'.bt-step .hh{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7a5c2e;margin:0 0 2px}.bt-step h2{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:21px;line-height:1.2;margin:0 0 8px;color:#2d2010}'+
'.bt-step p{margin:0 0 10px;font-size:15px;line-height:1.55}.bt-det{border-left:3px solid #b3261e;background:rgba(255,250,235,.7);padding:8px 10px;margin:4px 0 10px;border-radius:0 4px 4px 0}.bt-det b{display:block;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#b3261e;margin-bottom:2px}.bt-det span.tt{display:block;font-weight:700;margin-bottom:3px}'+
'.bt-step details{font-size:13px;margin-top:4px}.bt-step summary{cursor:pointer;color:#6b5433}.bt-step ol,.bt-src ol{margin:6px 0 4px 18px;padding:0}.bt-step a,.bt-src a{color:#1d3f8a}'+
'.bt-info{background:#f6eed8;color:#3b2b16;border:1px solid #b89a63;border-radius:6px;padding:10px 12px;margin:8px 0;font-size:14px;position:relative}.bt-info .x{position:absolute;right:6px;top:4px;background:none;border:0;font-size:20px;color:#6b5433;cursor:pointer}.bt-info h3{margin:0 24px 4px 0;font-size:16px}.bt-info .tags{margin-top:6px}.bt-info .tag{background:#fff8e6;color:#1d3f8a;border-color:#c9ae78}'+
'.bt-sec{margin:18px 0 6px}.bt-sec>summary{cursor:pointer;font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:19px;font-weight:700;padding:8px 0;border-bottom:1px solid var(--line);list-style:none}.bt-sec>summary::-webkit-details-marker{display:none}.bt-sec>summary:after{content:"＋";float:right;color:var(--dim)}.bt-sec[open]>summary:after{content:"－"}'+
'.bt-beach{border:1px solid var(--line);border-radius:6px;margin:10px 0;background:var(--s1)}.bt-beach>summary{cursor:pointer;padding:10px 12px;display:flex;gap:10px;align-items:center;list-style:none}.bt-beach>summary::-webkit-details-marker{display:none}.bt-beach .bn{font-family:"Iowan Old Style",Palatino,Georgia,serif;font-size:18px;font-weight:700}.bt-beach .bh{margin-left:auto;color:var(--mu);font-size:13px}.bt-beach .bb{padding:0 12px 12px;font-size:14px}.bt-beach dl{margin:0}.bt-beach dt{color:var(--mu);font-size:12px;text-transform:uppercase;letter-spacing:.08em;margin-top:8px}.bt-beach dd{margin:2px 0 0}'+
'.bt-fz{display:grid;gap:12px}@media(min-width:760px){.bt-fz{grid-template-columns:1fr 1fr}}.bt-fz>div{border:1px solid var(--line);border-radius:6px;padding:12px;background:var(--s1)}.bt-fz h3{margin:0 0 6px;font-size:18px;display:flex;gap:6px;align-items:center}.bt-fz table{width:100%;border-collapse:collapse;font-size:13px}.bt-fz td{padding:4px 0;border-bottom:1px solid var(--line);vertical-align:top}.bt-fz td:first-child{color:var(--mu);padding-right:8px;width:48%}.bt-fz .tags{margin-top:6px}.bt-fz .tag small{color:var(--mu)}'+
'.bt-leg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px 10px;font-size:12px;color:var(--mu);margin:8px 0}.bt-leg span{display:flex;gap:6px;align-items:center}.bt-leg svg{flex:0 0 34px}'+
'.bt-mapw,.bt-step,.bt-info{transition:background-color .9s,border-color .9s,color .9s}.bt-map .land,.bt-map .landov,.bt-map .sea{transition:fill .9s}'+'.bt-card.snow{background:#eef2f5 radial-gradient(circle at 30% 20%,#fbfcfd,#d6dfe6);color:#22303b;border-color:#9fb0bd;box-shadow:inset 0 0 30px rgba(60,90,120,.22)}.bt-card.snow .d,.bt-card.snow .go{color:#4f6475}'+'.bt.snow .bt-mapw{background:#eef2f5;border-color:#8a9aa8;box-shadow:inset 0 0 50px rgba(60,80,100,.35)}.bt.snow .bt-mapw:before{filter:grayscale(1);opacity:.2}.bt.snow .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(40,60,85,.3) 100%)}'+'.bt.snow .bt-map .sea{fill:#d3e1ea}.bt.snow .bt-map .wl{stroke:#b7cddb}.bt.snow .bt-map .land,.bt.snow .bt-map .landov{fill:#f7f9fb}.bt.snow .bt-map .coast{stroke:#2f3d4a}.bt.snow .bt-map .riv{stroke:#7895ab}.bt.snow .bt-map .grat{stroke:#9fb0bd}.bt.snow .bt-map text{fill:#22303b;stroke:#f7f9fb}'+'.bt.snow .bt-cap{background:rgba(246,248,250,.92);color:#22303b;border-color:#8a9aa8}.bt.snow .bt-step{background:#f3f6f8;color:#22303b;border-color:#a9b8c4;box-shadow:inset 0 0 40px rgba(70,100,130,.16)}.bt.snow .bt-step .hh{color:#4f6475}.bt.snow .bt-step h2{color:#1b2731}.bt.snow .bt-step summary{color:#4f6475}.bt.snow .bt-det{background:rgba(255,255,255,.8)}.bt.snow .bt-info{background:#f5f8fa;color:#22303b;border-color:#a9b8c4}.bt.snow .bt-info .x{color:#4f6475}'+'.bt-snowfx{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .9s;background-image:radial-gradient(circle,rgba(255,255,255,.95) 0 1.3px,transparent 1.8px),radial-gradient(circle,rgba(95,125,150,.35) 0 .9px,transparent 1.3px),radial-gradient(circle,rgba(255,255,255,.85) 0 .9px,transparent 1.4px);background-size:90px 90px,60px 60px,40px 40px;background-position:0 0,23px 37px,11px 7px}'+'.bt.snow .bt-snowfx{opacity:.9;animation:btsnow 24s linear infinite}@keyframes btsnow{to{background-position:90px 270px,-60px 180px,40px 160px}}@media(prefers-reduced-motion:reduce){.bt.snow .bt-snowfx{animation:none}.bt-mapw,.bt-step,.bt-info,.bt-map .land,.bt-map .sea{transition:none}}'+'.bt-map .stx{display:none}.bt-map .st-sunk .stx,.bt-map .st-dmg .stx{display:inline}.bt-map .st-dmg .stx-s{display:none}.bt-map .reef{fill:#d7e6e3;fill-opacity:.55;stroke:#5f8f95;stroke-opacity:.9}'+
'.bt-fig{margin:4px 0 12px}.bt-fig img{display:block;width:100%;height:auto;border-radius:4px;border:1px solid #b89a63;background:#e4d3a8;filter:sepia(.12)}.bt-fig figcaption{font-size:12.5px;line-height:1.4;color:#5b4526;margin-top:5px}.bt-fig .cr{display:block;font-size:11px;color:#7a6440}.bt-fig a{color:#1d3f8a}'+
'.bt-card.barro{background:#e6d8bd radial-gradient(circle at 30% 20%,#efe4cc,#c7ad86);color:#33240f;border-color:#8a6d45;box-shadow:inset 0 0 30px rgba(90,60,25,.25)}.bt-card.barro .d,.bt-card.barro .go{color:#6b5233}'+'.bt.barro .bt-mapw{background:#d9c7a3;border-color:#7b5f3a;box-shadow:inset 0 0 50px rgba(70,45,20,.42)}.bt.barro .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 52%,rgba(60,38,15,.38) 100%)}.bt.barro .bt-map .sea{fill:#b7c4c0}.bt.barro .bt-map .land,.bt.barro .bt-map .landov{fill:#d5bf95}.bt.barro .bt-map .riv{stroke:#46677d}.bt.barro .bt-map .coast{stroke:#4a3620}.bt.barro .bt-map .grat{stroke:#7b5f3a}'+'.bt-mudfx,.bt-smokefx{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .9s}'+'.bt-mudfx{background-image:radial-gradient(circle,rgba(74,48,20,.30) 0 1.6px,rgba(74,48,20,.13) 2.6px,transparent 4px),radial-gradient(circle,rgba(74,48,20,.22) 0 1px,rgba(74,48,20,.10) 2px,transparent 3px),radial-gradient(circle,rgba(255,250,235,.35) 0 .8px,transparent 1.6px);background-size:74px 74px,46px 46px,31px 31px;background-position:0 0,19px 27px,9px 13px}.bt.barro .bt-mudfx{opacity:.6}'+'.bt-card.ruinas{background:#dedbd4 radial-gradient(circle at 30% 20%,#ecebe7,#b7b1a6);color:#2a2622;border-color:#8d877c;box-shadow:inset 0 0 30px rgba(50,45,40,.25)}.bt-card.ruinas .d,.bt-card.ruinas .go{color:#5b554c}'+'.bt.ruinas .bt-mapw{background:#d7d3cb;border-color:#6f6a62;box-shadow:inset 0 0 50px rgba(40,35,30,.45)}.bt.ruinas .bt-mapw:before{filter:grayscale(.85);opacity:.22}.bt.ruinas .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 50%,rgba(35,30,25,.4) 100%)}.bt.ruinas .bt-map .sea{fill:#a8b0b2}.bt.ruinas .bt-map .land,.bt.ruinas .bt-map .landov{fill:#dcd8cf}.bt.ruinas .bt-map .riv{stroke:#4f6474}.bt.ruinas .bt-map .coast{stroke:#3a3631}.bt.ruinas .bt-map .grat{stroke:#8d877c}'+'.bt-smokefx{background-image:radial-gradient(ellipse at 22% 28%,rgba(55,50,45,.24),transparent 38%),radial-gradient(ellipse at 72% 58%,rgba(70,65,60,.2),transparent 42%),radial-gradient(ellipse at 46% 88%,rgba(45,40,35,.16),transparent 36%);background-repeat:no-repeat}.bt.ruinas .bt-smokefx{opacity:1;animation:btsmoke 26s ease-in-out infinite alternate}@keyframes btsmoke{to{background-position:28px -14px,-34px 10px,20px -18px}}@media(prefers-reduced-motion:reduce){.bt.ruinas .bt-smokefx{animation:none}}'+
'.bt-card.mar{background:#d9e6ee radial-gradient(circle at 30% 20%,#eef5f9,#b7cedc);color:#1f2f3c;border-color:#8ea6b4;box-shadow:inset 0 0 30px rgba(40,80,110,.22)}.bt-card.mar .d,.bt-card.mar .go{color:#425b6c}'+
'.bt.mar .bt-mapw{background:#dfe8ec;border-color:#7d97a6}.bt.mar .bt-map .sea{fill:#a9c2cf}.bt.mar .bt-map .wl{stroke:#c8dce4;stroke-opacity:.8}.bt.mar .bt-map .grat{stroke:#5f7f92;stroke-opacity:.3}.bt.mar .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(30,60,85,.32) 100%)}'+
'.bt-card.meseta{background:#ead9b5 radial-gradient(circle at 30% 20%,#f4e7c9,#d2b27a);color:#3a2610;border-color:#9a6f3a;box-shadow:inset 0 0 30px rgba(120,70,20,.22)}.bt-card.meseta .d,.bt-card.meseta .go{color:#6e4b22}'+'.bt.meseta .bt-mapw{background:#e3cc9c;border-color:#8a5f2e;box-shadow:inset 0 0 50px rgba(110,65,20,.40)}.bt.meseta .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 54%,rgba(95,55,15,.36) 100%)}.bt.meseta .bt-map .sea{fill:#b9c8c4}.bt.meseta .bt-map .land,.bt.meseta .bt-map .landov{fill:#e8d3a4}.bt.meseta .bt-map .riv{stroke:#3f6a88;stroke-opacity:.9}.bt.meseta .bt-map .coast{stroke:#4a3218}.bt.meseta .bt-map .grat{stroke:#9a7440}'+
'.bt-card.desierto{background:#f0dcae radial-gradient(circle at 70% 25%,#f7e7c0,#d9b26c);color:#3d2a0e;border-color:#a8792f;box-shadow:inset 0 0 30px rgba(150,95,20,.24)}.bt-card.desierto .d,.bt-card.desierto .go{color:#7a5218}'+'.bt.desierto .bt-mapw{background:#ecd7a6;border-color:#9c6d2a;box-shadow:inset 0 0 50px rgba(140,90,25,.42)}.bt.desierto .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 54%,rgba(120,75,15,.36) 100%)}.bt.desierto .bt-map .sea{fill:#9fc1c9}.bt.desierto .bt-map .land,.bt.desierto .bt-map .landov{fill:#efd9a3}.bt.desierto .bt-map .riv{stroke:#3f6a88;stroke-opacity:.9}.bt.desierto .bt-map .coast{stroke:#4f3410}.bt.desierto .bt-map .grat{stroke:#a87b3a}'+'.bt-map .dep{fill:url(#btDep);stroke:#7a5620;stroke-opacity:.75;fill-rule:evenodd}.bt-map .rail{fill:none;stroke:#3a3a3a;stroke-opacity:.75}'+'.bt-flag{width:20px;height:13px;border-radius:2px;vertical-align:-2px}.bt-cred{font-size:11px;color:var(--dim);margin:6px 0 0}.bt-modep{display:none;margin:8px 0}.bt-modep.on{display:block}';
CSS+='.bt-card.cielo{background:#dfe9f3 radial-gradient(circle at 30% 20%,#f3f8fc,#b9cde0);color:#1c2b3a;border-color:#8aa2b8;box-shadow:inset 0 0 30px rgba(40,70,110,.22)}.bt-card.cielo .d,.bt-card.cielo .go{color:#3f566c}.bt.cielo .bt-mapw{background:#e6eef5;border-color:#7891a8;box-shadow:inset 0 0 50px rgba(40,70,105,.35)}.bt.cielo .bt-mapw:after{background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(30,55,90,.30) 100%)}.bt.cielo .bt-map .sea{fill:#aac4d8}.bt.cielo .bt-map .wl{stroke:#d3e2ee;stroke-opacity:.75}.bt.cielo .bt-map .land,.bt.cielo .bt-map .landov{fill:#e6e9d8}.bt.cielo .bt-map .coast{stroke:#33475a}.bt.cielo .bt-map .riv{stroke:#4f7896}.bt.cielo .bt-map .grat{stroke:#6f8aa3;stroke-opacity:.35}.bt-cloudfx{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .9s;background-image:radial-gradient(ellipse 34% 14% at 18% 20%,rgba(255,255,255,.42),transparent 70%),radial-gradient(ellipse 28% 11% at 78% 66%,rgba(255,255,255,.34),transparent 70%),radial-gradient(ellipse 22% 9% at 46% 90%,rgba(255,255,255,.28),transparent 70%);background-repeat:no-repeat}.bt.cielo .bt-cloudfx{opacity:1;animation:btcloud 40s ease-in-out infinite alternate}@keyframes btcloud{to{background-position:46px -10px,-52px 8px,30px -12px}}@media(prefers-reduced-motion:reduce){.bt.cielo .bt-cloudfx{animation:none}}'; // tema cielo (batallas aéreas)
CSS+='.bt-hub{display:grid;grid-template-columns:1fr;gap:14px;margin:14px 0 26px}@media(min-width:760px){.bt-hub{grid-template-columns:1fr 1fr}}'+
'.bt-hubc{position:relative;display:flex;flex-direction:column;gap:6px;min-height:150px;padding:22px 52px 22px 22px;border-radius:12px;text-decoration:none;overflow:hidden;border:1px solid #b89a63}'+
'.bt-hubc .em{font-size:34px;line-height:1}.bt-hubc .tt{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-size:24px;font-weight:700;line-height:1.15}.bt-hubc .dd{font-size:14px;line-height:1.4}.bt-hubc .nn{font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.8;margin-top:auto}.bt-hubc .go{position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:30px}'+
'.bt-hubc.bat{background:#e9dcb8 radial-gradient(circle at 30% 20%,#f3e8cb,#dcc89a);color:#3b2b16;box-shadow:inset 0 0 40px rgba(110,80,30,.28)}.bt-hubc.bat .dd,.bt-hubc.bat .go{color:#5b4526}'+
'.bt-hubc.ops{background:#18222b radial-gradient(circle at 75% 25%,#2a3a47,#121a21);color:#e8e4d4;border-color:#4d6272;box-shadow:inset 0 0 40px rgba(0,0,0,.45)}.bt-hubc.ops .dd{color:#b9c3c9}.bt-hubc.ops .go{color:#d6b25e}'+
'.bt-hubc:hover,.bt-hubc:focus-visible{transform:translateY(-1px);box-shadow:0 6px 18px rgba(0,0,0,.25)}'+
'.bt-card.op{background:#1b252e radial-gradient(circle at 70% 20%,#2b3b48,#141c23);color:#e8e4d4;border-color:#4d6272;box-shadow:inset 0 0 30px rgba(0,0,0,.4)}.bt-card.op .d{color:#b9c3c9}.bt-card.op .go{color:#d6b25e}'+
'.bt-datos dl{display:grid;grid-template-columns:max-content 1fr;gap:6px 14px;margin:8px 0;font-size:14px}.bt-datos dt{font-weight:700;color:var(--mu)}.bt-datos dd{margin:0}@media(max-width:520px){.bt-datos dl{grid-template-columns:1fr}.bt-datos dt{margin-top:6px}}'+
'.bt-caps{display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:8px 0 4px;scrollbar-width:thin}.bt-capb{flex:0 0 auto;font:inherit;font-size:13px;padding:6px 11px;border-radius:999px;border:1px solid var(--line,#555);background:transparent;color:var(--tx);cursor:pointer;white-space:nowrap}.bt-capb.on{background:#d6b25e;color:#1b1b1b;border-color:#d6b25e;font-weight:700}'+
'.bt-capl{display:inline-block;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;background:#d6b25e;color:#1b1b1b;border-radius:3px;padding:1px 6px;margin-right:4px;vertical-align:1px}'+
'.bt-ver{margin:10px 0;padding:10px 12px;border-left:3px solid #d6b25e;background:rgba(214,178,94,.10);border-radius:4px;font-size:14px}.bt-ver>b{display:block;margin-bottom:6px}.bt-ver .vi{margin:6px 0;line-height:1.45}.bt-ver .vw{display:block;font-weight:700;font-size:12.5px;letter-spacing:.03em;color:#b38a2e}.bt-ver .vn{font-size:12.5px;opacity:.85;margin-top:6px;font-style:italic}'+
'.bt-ins{margin:8px 0 0;border:1px solid #8a6d3b;border-radius:8px;background:#efe3c2;color:#3b2b16;padding:6px 8px 8px}.bt-ins-t{font-size:11px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#6b5433}.bt-ins svg{display:block;width:100%;height:auto;max-height:230px}.bt-ins-c{font-size:12.5px;color:#5b4526;margin-top:2px}'+
'.bt-ins text{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;fill:#3b2b16}.bt-ins .fl{fill:#e4d3a8;stroke:#5b4526;stroke-width:1.2}.bt-ins .fl.on{fill:#f2c76a}.bt-ins .gt{fill:#3b2b16}.bt-ins .gt.on{fill:#e0622b}'+
'.bt-vn{position:absolute;left:8px;bottom:8px;z-index:3;font-size:11px;font-style:italic;background:rgba(239,227,194,.92);color:#3b2b16;border:1px solid #8a6d3b;border-radius:4px;padding:2px 7px;max-width:70%;pointer-events:none}'+
'.bt-map .bord{fill:none;stroke:#7a5a32;stroke-opacity:.75}.bt-map .road{fill:none;stroke:#c9b48a;stroke-linecap:round;stroke-linejoin:round}.bt-map .road2{fill:none;stroke:#cdb98f;stroke-opacity:.8;stroke-linecap:round}.bt-map .mil{fill:#5c6b3a;fill-opacity:.14;stroke:#4a5a2a}.bt-map .bld{fill:#b49a6c;stroke:#3b2b16}.bt-map .wall{fill:none;stroke:#3b2b16;stroke-linejoin:round;stroke-linecap:round}.bt-map .yard{fill:#d9c79c;stroke:#8a6d3b}'+
'.bt.noche .bt-mapw{background:#d9cba6}.bt.noche .bt-map .sea{fill:#9db7c4}.bt.noche .bt-map .land,.bt.noche .bt-map .landov{fill:#e2d3a8}.bt-nightfx{position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .9s;background:radial-gradient(ellipse at center,rgba(12,22,40,.06) 35%,rgba(12,22,40,.42) 100%)}.bt.noche .bt-nightfx{opacity:1}';
function css(){ if(document.getElementById('bt-css')) return; var s=document.createElement('style'); s.id='bt-css'; s.textContent=CSS; document.head.appendChild(s); }

// ---------- list page ----------
function hubPage(app,X){ css();
  var h=X.crumbs([[U_('home'),'#/'],[U_('hub')]])+'<div class="bt" data-noi18n><h1 class="bt-title">'+e(U_('hub'))+'</h1><p class="sub">'+e(U_('hubsub'))+'</p><div class="bt-hub">'+
    '<a class="bt-hubc bat" href="#/batallas/historicas"><span class="em" aria-hidden="true">⚔️</span><span class="tt">'+e(U_('bh'))+'</span><span class="dd">'+e(U_('bhd'))+'</span><span class="nn" id="bthubb"></span><span class="go">›</span></a>'+
    '<a class="bt-hubc ops" href="#/operaciones"><span class="em" aria-hidden="true">🎯</span><span class="tt">'+e(U_('oh'))+'</span><span class="dd">'+e(U_('ohd'))+'</span><span class="nn" id="bthubo"></span><span class="go">›</span></a></div></div>';
  X.set(h,U_('hub'));
  [['batallas','bthubb','nbat','nbat'],['operaciones','bthubo','nmis','nmiss']].forEach(function(q){ (IDXS[q[0]]?Promise.resolve(IDXS[q[0]]):get(q[0]+'/index.json').then(function(d){IDXS[q[0]]=d;return d;})).then(function(L){ var n=L.filter(function(x){return !x.soon;}).length, el2=document.getElementById(q[1]); if(el2) el2.textContent=n+' '+U_(n===1?q[2]:q[3]); }).catch(function(){}); });
}
function listPage(app,X){
  set0(X,'<p class="sub" style="padding:24px 0">'+U_('load')+'</p>',LT());
  var B0=BASE;
  (IDXS[B0]?Promise.resolve(IDXS[B0]):get(B0+'/index.json').then(function(d){IDXS[B0]=d;return d;})).then(function(L){
    if(location.hash.split('?')[0].replace(/\/$/,'')!==(B0==='operaciones'?'#/operaciones':'#/batallas/historicas')) return;
    var h=X.crumbs([[U_('home'),'#/'],[U_('hub'),'#/batallas'],[LT()]])+'<div class="bt" data-noi18n><h1 class="bt-title">'+e(LT())+'</h1><p class="sub">'+e(OPS()?U_('osub'):U_('sub'))+'</p><div class="bt-list">';
    L.forEach(function(b){
      if(b.soon) h+='<div class="bt-card soon" aria-disabled="true">'+ICON+'<div><div class="t">'+e(T(b.t))+'<span class="bdg">'+e(U_('soon'))+'</span></div><div class="d">'+e(T(b.fecha))+' · '+e(T(b.lugar))+'</div></div></div>';
      else h+='<a class="bt-card'+(B0==='operaciones'?' op':(THEMES[b.tema]?' '+THEMES[b.tema]:''))+'" href="#/'+B0+'/'+e(b.id)+'">'+(B0==='operaciones'?OPICON:ICON)+'<div><div class="t">'+e(T(b.t))+'</div><div class="d">'+e(T(b.fecha))+' · '+e(T(b.lugar))+'</div><div class="d" style="margin-top:3px">'+e(T(b.d))+'</div></div><span class="go">›</span></a>';
    });
    h+='</div></div>'; X.set(h,LT());
  }).catch(function(){ X.set(X.crumbs([[U_('home'),'#/'],[U_('hub'),'#/batallas'],[LT()]])+'<p class="sub">'+(OPS()?U_('oerr'):U_('err'))+'</p>',LT()); });
}
function set0(X,h,t){ X.set(h,t); }

// ---------- projection & helpers ----------
function mkP(pr){ return function(ll){ return [(ll[0]-pr.lon0)*pr.kx, -(ll[1]-pr.lat0)*pr.ky]; }; }
function el(tag,at,par){ var n=document.createElementNS(NS,tag); if(at) for(var k in at) n.setAttribute(k,at[k]); if(par) par.appendChild(n); return n; }
function curve(pts){ // Catmull-Rom -> Bezier
  if(pts.length<3) return 'M'+pts.map(function(p){return p[0].toFixed(2)+','+p[1].toFixed(2);}).join(' L');
  var d='M'+pts[0][0].toFixed(2)+','+pts[0][1].toFixed(2);
  for(var i=0;i<pts.length-1;i++){ var p0=pts[i-1]||pts[i],p1=pts[i],p2=pts[i+1],p3=pts[i+2]||p2;
    var c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6], c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
    d+=' C'+c1[0].toFixed(2)+','+c1[1].toFixed(2)+' '+c2[0].toFixed(2)+','+c2[1].toFixed(2)+' '+p2[0].toFixed(2)+','+p2[1].toFixed(2); }
  return d; }
function wob(pts,amp,seed){ // hand-drawn wobble: extra jittered midpoints
  var out=[pts[0]], s=seed||1; function rnd(){ s=(s*9301+49297)%233280; return s/233280-.5; }
  for(var i=0;i<pts.length-1;i++){ var a=pts[i],b=pts[i+1],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L;
    [.33,.66].forEach(function(t){ var j=rnd()*amp*L; out.push([a[0]+dx*t+nx*j,a[1]+dy*t+ny*j]); }); out.push(b); }
  return out; }

// ship silhouettes (screen px) for naval battles: cv portaaviones, bb acorazado, ca crucero, dd destructor, ss submarino, tr transporte
var SHIP={
 cv:function(g,f,k){ el('path',{d:'M-13,0 L13,0 L10,5 L-10,5 Z',fill:f,stroke:k,'stroke-width':1.5},g); el('path',{d:'M-15,-1.6 L15,-1.6',stroke:k,'stroke-width':2.4,'stroke-linecap':'round'},g); el('rect',{x:4,y:-7,width:3.4,height:5,fill:k},g); },
 bb:function(g,f,k){ el('path',{d:'M-14,0 L14,0 L10,5 L-10,5 Z',fill:f,stroke:k,'stroke-width':1.5},g); el('path',{d:'M-4,0 L-4,-5 L3,-5 L3,0 Z',fill:f,stroke:k,'stroke-width':1.3},g); el('path',{d:'M-0.5,-5 L-0.5,-10 M-11,-2.2 L-6,-2.2 M6,-2.2 L11,-2.2',stroke:k,'stroke-width':1.6},g); },
 ca:function(g,f,k){ el('path',{d:'M-12,0 L12,0 L9,4.5 L-9,4.5 Z',fill:f,stroke:k,'stroke-width':1.4},g); el('path',{d:'M-3,0 L-3,-4 L2,-4 L2,0',fill:f,stroke:k,'stroke-width':1.2},g); el('path',{d:'M-0.5,-4 L-0.5,-8 M-9,-1.8 L-5,-1.8 M5,-1.8 L9,-1.8',stroke:k,'stroke-width':1.3},g); },
 dd:function(g,f,k){ el('path',{d:'M-10,0 L11,0 L8,4 L-8,4 Z',fill:f,stroke:k,'stroke-width':1.3},g); el('path',{d:'M-2,0 L-2,-3.5 L2,-3.5 L2,0 M0,-3.5 L0,-6.5',fill:'none',stroke:k,'stroke-width':1.2},g); },
 ss:function(g,f,k){ el('path',{d:'M-12,1.5 Q0,-3 12,1.5 Q0,5 -12,1.5 Z',fill:f,stroke:k,'stroke-width':1.3},g); el('path',{d:'M-2,-0.5 L-1.5,-4 L2,-4 L2.5,-0.5',fill:f,stroke:k,'stroke-width':1.2},g); },
 tr:function(g,f,k){ el('path',{d:'M-12,0 L12,0 L10,5 L-10,5 Z',fill:f,stroke:k,'stroke-width':1.4},g); el('rect',{x:-2,y:-4,width:5,height:4,fill:f,stroke:k,'stroke-width':1.1},g); }
};
// unit symbol (NATO-like box), size in screen px (scaled by group transform)
function unitSym(u){
  var g=document.createElementNS(NS,'g'), al=u.s==='al', L=LD&&LD[u.s];
  var stroke=L?L.c:(al?'#1d3f8a':'#1f1f1f'), fill=L?L.f:(al?'rgba(214,226,246,.95)':'rgba(170,170,162,.95)');
  if(u.ty==='naval'){ el('path',{d:'M-13,-2 L13,-2 L9,5 L-9,5 Z',fill:fill,stroke:stroke,'stroke-width':1.6},g); el('path',{d:'M-4,-2 L-4,-7 L3,-7 L3,-2 M-1,-7 L-1,-10',fill:'none',stroke:stroke,'stroke-width':1.4},g); }
  else if(SHIP[u.ty]){ SHIP[u.ty](g,fill,stroke); }
  else {
    el('rect',{x:-12,y:-8,width:24,height:16,fill:fill,stroke:stroke,'stroke-width':1.6,'stroke-dasharray':u.ty==='fake'?'3 2':''},g);
    if(u.ty==='inf'||u.ty==='para'||u.ty==='glider'||u.ty==='rng'||u.ty==='fake'||u.ty==='mech') el('path',{d:'M-12,-8 L12,8 M-12,8 L12,-8',stroke:stroke,'stroke-width':1.3},g);
    if(u.ty==='arm'||u.ty==='mech') el('ellipse',{cx:0,cy:0,rx:8,ry:4.2,fill:u.ty==='mech'?fill:'none',stroke:stroke,'stroke-width':1.5},g);
    if(u.ty==='cav') el('path',{d:'M-12,8 L12,-8',stroke:stroke,'stroke-width':1.4},g);
    if(u.ty==='art') el('circle',{cx:0,cy:0,r:3.2,fill:stroke},g);
    if(u.ty==='eng') el('path',{d:'M-7,4 L-7,-3 L7,-3 L7,4 M0,-3 L0,4',fill:'none',stroke:stroke,'stroke-width':1.4},g);
    if(u.ty==='aa') el('path',{d:'M-11,7 Q0,-5 11,7',fill:'none',stroke:stroke,'stroke-width':1.4},g);
    if(u.ty==='air') el('path',{d:'M-8,0 C-6,-5 -2,-5 0,0 C2,5 6,5 8,0 C6,-5 2,-5 0,0 C-2,5 -6,5 -8,0 Z',fill:'none',stroke:stroke,'stroke-width':1.3},g);
    if(u.ty==='ftr'||u.ty==='bmb'||u.ty==='dive'||u.ty==='zer'){ var ap=u.ty==='ftr'?'M0,-6.5 L0,6.2 M-9.5,-1.2 L9.5,-1.2 M-3.6,5 L3.6,5':u.ty==='dive'?'M0,-6.5 L0,6.2 M-9.8,-3.6 L-4.2,-0.4 L0,-1.4 L4.2,-0.4 L9.8,-3.6 M-3.6,5 L3.6,5':u.ty==='zer'?'M0,-6 L0,5.2 M-9.6,-1 L9.6,-1 M-4.2,5.2 L4.2,5.2 M-4.2,3.4 L-4.2,7 M4.2,3.4 L4.2,7':'M0,-7 L0,6.4 M-10.4,-1.6 L10.4,-1.6 M-4,5.6 L4,5.6'; el('path',{d:ap,fill:'none',stroke:stroke,'stroke-width':1.7,'stroke-linecap':'round','stroke-linejoin':'round'},g); if(u.ty==='bmb'||u.ty==='zer'){ el('circle',{cx:-4.8,cy:-1.4,r:1.6,fill:fill,stroke:stroke,'stroke-width':1.1},g); el('circle',{cx:4.8,cy:-1.4,r:1.6,fill:fill,stroke:stroke,'stroke-width':1.1},g); } }
    if(u.ty==='heli'){ el('path',{d:'M-9,-5 L9,5 M-9,5 L9,-5',stroke:stroke,'stroke-width':1.6,'stroke-linecap':'round'},g); el('ellipse',{cx:0,cy:0,rx:3.2,ry:2.4,fill:stroke},g); }
    if(u.ty==='sof'){ var tsf=el('text',{x:0,y:3.4,'text-anchor':'middle','font-size':8.6,'font-weight':700,style:'stroke:none;fill:'+stroke},g); tsf.textContent='SOF'; }
    if(u.ty==='uav'){ el('path',{d:'M0,-6 L0,5 M-10,-1 L10,-1 M-3.5,5 L3.5,5',fill:'none',stroke:stroke,'stroke-width':1.5,'stroke-linecap':'round'},g); var tu2=el('text',{x:0,y:-1.5,'text-anchor':'middle','font-size':5,'font-weight':700,style:'stroke:none;fill:'+stroke},g); tu2.textContent='UAV'; }
    if(u.ty==='rdr') el('path',{d:'M-5,6 L0,-1 L5,6 M0,-1 L0,-4 M-6,-7 Q0,-2 6,-7',fill:'none',stroke:stroke,'stroke-width':1.4},g);
    if(u.ty==='hq') el('path',{d:'M-12,-8 L-12,14',stroke:stroke,'stroke-width':1.6},g);
    if(u.ty==='para') el('path',{d:'M-6,5 Q-3,1 0,5 Q3,1 6,5',fill:'none',stroke:stroke,'stroke-width':1.3},g);
    if(u.ty==='glider') el('path',{d:'M-7,4 L7,4',stroke:stroke,'stroke-width':1.6},g);
    if(u.ty==='rng'||u.ty==='cdo'){ var t=el('text',{x:0,y:4,'text-anchor':'middle','font-size':10,'font-weight':700,style:'stroke:none;fill:'+stroke},g); t.textContent=u.ty==='rng'?'R':'C'; if(u.ty==='cdo') el('path',{d:'M-12,-8 L12,8 M-12,8 L12,-8',stroke:stroke,'stroke-width':.8,'stroke-opacity':.5},g); }
    if(u.sz){ var z=el('text',{x:0,y:-10.5,'text-anchor':'middle','font-size':8,'font-weight':700,style:'stroke:none;fill:'+stroke},g); z.textContent=u.sz; }
  }
  if(al&&u.nat&&u.ty!=='fake'){ var r=el('rect',{x:9,y:-12,width:12,height:7,fill:'#b3261e',rx:1},g); var tn=el('text',{x:15,y:-6.6,'text-anchor':'middle','font-size':5.8,'font-weight':700,style:'stroke:none;fill:#fff'},g); tn.textContent=u.nat==='uk'?'GB':u.nat.toUpperCase(); }
  else if(u.b){ el('rect',{x:9,y:-12,width:12,height:7,fill:u.bc||stroke,rx:1},g); var tu=el('text',{x:15,y:-6.6,'text-anchor':'middle','font-size':5.8,'font-weight':700,style:'stroke:none;fill:#fff'},g); tu.textContent=u.b; }
  else if(L&&L.b){ el('rect',{x:9,y:-12,width:12,height:7,fill:L.bc||stroke,rx:1},g); var tb=el('text',{x:15,y:-6.6,'text-anchor':'middle','font-size':5.8,'font-weight':700,style:'stroke:none;fill:#fff'},g); tb.textContent=L.b; }
  if(SHIP[u.ty]){ var sx=el('g',{'class':'stx'},g); el('path',{d:'M-3,-4 C-6,-9 -1,-11 0,-16 C2,-12 6,-10 3,-4 Z',fill:'#e0622b',stroke:'#7a2a10','stroke-width':.8},sx); el('path',{'class':'stx-s',d:'M-11,-3 L11,7 M-11,7 L11,-3',stroke:'#8b1d1d','stroke-width':2.2,'stroke-linecap':'round'},sx); }
  var lb=el('text',{x:0,y:(u.ty==='naval'||SHIP[u.ty])?16:19,'text-anchor':'middle','font-size':9.5,'font-weight':600,'class':'ulab'},g); lb.textContent=T(u.sn||u.n);
  el('rect',{x:-16,y:-14,width:32,height:36,fill:'transparent'},g);
  return g; }
function lmIcon(ic,g){ var k='#3b2b16';
  if(ic==='hill') el('path',{d:'M-9,5 Q-4,-7 0,-7 Q4,-7 9,5 Z',fill:'rgba(120,95,60,.25)',stroke:k,'stroke-width':1.2},g);
  else if(ic==='fac') el('path',{d:'M-9,5 L-9,-2 L-5,-6 L-5,-2 L-1,-6 L-1,-2 L3,-6 L3,-2 L5,-2 L5,-9 L8,-9 L8,5 Z',fill:'rgba(60,60,60,.35)',stroke:k,'stroke-width':1.1},g);
  else if(ic==='elev') { el('rect',{x:-6,y:-9,width:12,height:14,fill:'rgba(60,60,60,.3)',stroke:k,'stroke-width':1.1},g); el('path',{d:'M-2,-9 L-2,5 M2,-9 L2,5',stroke:k,'stroke-width':.8},g); }
  else if(ic==='sta') { el('rect',{x:-8,y:-6,width:16,height:9,fill:'rgba(60,60,60,.25)',stroke:k,'stroke-width':1.1},g); el('path',{d:'M-10,6 L10,6',stroke:k,'stroke-width':1.4,'stroke-dasharray':'2 1.5'},g); }
  else if(ic==='air') { el('path',{d:'M-9,4 L9,-4 M-6,-5 L6,5',stroke:k,'stroke-width':2.2,'stroke-linecap':'round'},g); }
  else if(ic==='radar') { el('path',{d:'M-5,6 L0,-1 L5,6 M0,-1 L0,-4 M-6.5,-8.5 Q0,-3 6.5,-8.5',stroke:'#1d3f8a','stroke-width':1.6,fill:'none'},g); el('circle',{r:9.5,fill:'transparent'},g); }
  else if(ic==='ops') { el('rect',{x:-7,y:-4,width:14,height:9,fill:'rgba(29,63,138,.18)',stroke:'#1d3f8a','stroke-width':1.3},g); el('path',{d:'M-3,-4 L-3,-11 L4,-9 L-3,-7',fill:'#1d3f8a',stroke:'#1d3f8a','stroke-width':1},g); }
  else if(ic==='fort') { el('path',{d:'M0,-8 L7.6,-2.5 L4.7,6.5 L-4.7,6.5 L-7.6,-2.5 Z',fill:'rgba(60,60,60,.32)',stroke:k,'stroke-width':1.3},g); el('circle',{r:1.8,fill:k},g); }
  else if(ic==='mon') { el('path',{d:'M-2.5,6 L-2.5,-6 L0,-9 L2.5,-6 L2.5,6 Z M-6,6 L6,6',fill:'rgba(60,60,60,.3)',stroke:k,'stroke-width':1.1},g); }
  else el('rect',{x:-5.5,y:-5.5,width:11,height:11,fill:'rgba(60,60,60,.3)',stroke:k,'stroke-width':1.2},g); }
function defSym(d){
  var g=document.createElementNS(NS,'g');
  if(d.k==='lm'){ lmIcon(d.ic,g); var tl=el('text',{x:d.lx||0,y:d.ly!=null?d.ly:15,'text-anchor':d.la||'middle','font-size':8.5,'font-weight':700,'font-style':'italic'},g); tl.textContent=T(d.n); el('rect',{x:-12,y:-11,width:24,height:28,fill:'transparent'},g); return g; }
  if(d.k==='bat'){ el('circle',{cx:0,cy:0,r:5.5,fill:'#3a3a36',stroke:'#111','stroke-width':1},g); el('path',{d:'M0,0 L10,-6',stroke:'#111','stroke-width':2.2,'stroke-linecap':'round'},g); }
  else { el('path',{d:'M-6,3 A6,6 0 0 1 6,3 Z',fill:'#2b2b2b',stroke:'#111','stroke-width':.8},g); el('path',{d:'M-4,-2.5 L-6.5,-6 M0,-3.5 L0,-8 M4,-2.5 L6.5,-6',stroke:'#111','stroke-width':1.1},g); }
  var t=el('text',{x:0,y:13,'text-anchor':'middle','font-size':8.5,'font-style':'italic'},g); t.textContent=T(d.n);
  el('rect',{x:-12,y:-10,width:24,height:26,fill:'transparent'},g);
  return g; }
function mkSym(m){
  var g=document.createElementNS(NS,'g'), t;
  if(m.k==='dz'){ el('circle',{r:9,fill:'rgba(29,63,138,.10)',stroke:'#1d3f8a','stroke-width':1.2,'stroke-dasharray':'2 2'},g); t=el('text',{y:3,'text-anchor':'middle','font-size':7.5,'font-weight':700,style:'stroke:none;fill:#1d3f8a'},g); t.textContent=m.n; }
  else if(m.k==='bomb'){ el('path',{d:'M0,-9 L2.5,-3 L9,-3 L4,1 L6,8 L0,4 L-6,8 L-4,1 L-9,-3 L-2.5,-3 Z',fill:'#c0392b',stroke:'#6d1a12','stroke-width':.8,'fill-opacity':.85},g); if(m.n){ t=el('text',{x:m.lx||0,y:m.ly!=null?m.ly:-12,'text-anchor':m.la||'middle','font-size':m.fs||8.5,'font-weight':700},g); t.textContent=T(m.n); } }
  else if(m.k==='per'){ var dead=m.st==='dead', pc=m.c&&LD&&LD[m.c]?LD[m.c].c:(m.c==='us'?'#1d3f8a':'#5b4526'); el('circle',{r:4.6,fill:dead?'#8a8478':(m.st==='hurt'?'#e9a23b':'#efe3c2'),stroke:dead?'#4a453c':pc,'stroke-width':1.4},g); if(dead) el('path',{d:'M-2.6,-2.6 L2.6,2.6 M-2.6,2.6 L2.6,-2.6',stroke:'#2b2620','stroke-width':1.1},g); if(m.n){ t=el('text',{x:m.lx!=null?m.lx:7,y:m.ly!=null?m.ly:3,'text-anchor':m.la||'start','font-size':m.fs||8.5,'font-weight':700},g); t.textContent=T(m.n); } }
  else if(m.k==='heli'){ var hc=m.st==='crash'?'#7a2a10':m.st==='gone'?'#6b6b60':'#1d3f8a', hf=m.st==='crash'?'#e9a23b':m.st==='gone'?'#c9c3b2':'#d6e2f6', hg2=el('g',{transform:'rotate('+(m.rot||0)+')'},g); var hs=m.sz||1; el('path',{d:'M'+(-7*hs)+',0 C'+(-7*hs)+','+(-3.4*hs)+' '+(5*hs)+','+(-3.4*hs)+' '+(6*hs)+',0 C'+(5*hs)+','+(3.4*hs)+' '+(-7*hs)+','+(3.4*hs)+' '+(-7*hs)+',0 Z M'+(-7*hs)+',0 L'+(-17*hs)+',0',fill:hf,stroke:hc,'stroke-width':1.3,'stroke-dasharray':m.st==='gone'?'2 1.5':''},hg2); el('path',{d:'M'+(-17*hs)+','+(-3*hs)+' L'+(-17*hs)+','+(3*hs),stroke:hc,'stroke-width':1.3},hg2); if(m.st!=='crash'&&m.st!=='gone') el('circle',{r:11*hs,fill:'none',stroke:hc,'stroke-width':.8,'stroke-dasharray':'3 2','stroke-opacity':.7},hg2); if(m.st==='crash') el('path',{d:'M-2,-7 C1,-11 4,-9 3,-5 C5,-7 6,-3 3,-2 Z',fill:'#e0622b',stroke:'#7a2a10','stroke-width':.6},g); if(m.n){ t=el('text',{x:m.lx||0,y:m.ly!=null?m.ly:-14,'text-anchor':m.la||'middle','font-size':m.fs||8.5,'font-weight':700},g); t.textContent=T(m.n); } }
  else if(m.k==='gate'){ el('rect',{x:-4,y:-2,width:8,height:4,fill:m.st==='open'?'#e9a23b':'#3b2b16',stroke:'#3b2b16','stroke-width':.8},g); if(m.st==='open') el('path',{d:'M-6,-5 L-3,-2 M6,-5 L3,-2 M0,-6 L0,-3',stroke:'#c0392b','stroke-width':1},g); if(m.n){ t=el('text',{x:m.lx||0,y:m.ly!=null?m.ly:-7,'text-anchor':m.la||'middle','font-size':m.fs||7.5,'font-style':'italic'},g); t.textContent=T(m.n); } }
  else if(m.k==='plane'){ var pc2=(LD&&LD[m.c])?LD[m.c].c:'#3b2b16', pg=el('g',{transform:'rotate('+(m.rot||0)+')'},g); el('path',{d:'M7,0 L-6,0 M2,0 L-2,-6 M2,0 L-2,6 M-5,0 L-7,-2.5 M-5,0 L-7,2.5',stroke:pc2,'stroke-width':1.8,'stroke-linecap':'round',fill:'none'},pg); if(m.n){ t=el('text',{x:m.lx||0,y:m.ly!=null?m.ly:-9,'text-anchor':m.la||'middle','font-size':m.fs||8.5,'font-weight':700,style:'fill:'+pc2},g); t.textContent=T(m.n); } }
  else if(m.k==='zone'){ el('circle',{r:12,fill:'none',stroke:'#1d3f8a','stroke-width':1.4,'stroke-dasharray':'3 2'},g); t=el('text',{y:m.below?24:-15,'text-anchor':'middle','font-size':9,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='storm'){ el('path',{d:'M-10,0 a10,10 0 1 1 10,10 M10,0 a10,10 0 1 1 -10,-10',fill:'none',stroke:'#5c7794','stroke-width':1.8},g); t=el('text',{y:22,'text-anchor':'middle','font-size':9,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='bridge'){ el('path',{d:'M-7,-3 L7,-3 M-7,3 L7,3 M-9,-6 L-7,-3 M9,-6 L7,-3 M-9,6 L-7,3 M9,6 L7,3',stroke:'#3b2b16','stroke-width':1.6,fill:'none'},g); t=el('text',{y:-8,'text-anchor':'middle','font-size':8.5,'font-weight':700},g); t.textContent=T(m.n); }
  else if(m.k==='airf'){ if(m.sec) el('circle',{r:8.5,fill:'rgba(29,63,138,.08)',stroke:'#1d3f8a','stroke-width':1.3},g); lmIcon('air',g); t=el('text',{y:-9,'text-anchor':'middle','font-size':8.5,'font-weight':700,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='ship'){ var L2=LD&&LD[m.c], kc=L2?L2.c:'#1d3f8a', kf=m.st==='sunk'?'#c0392b':m.st==='cap'?'#7a2a10':m.st==='dmg'?'#e9a23b':(L2?L2.f:'#d6e2f6'), sl=m.w||16;
    var hg=el('g',{transform:'rotate('+(m.rot||0)+')'},g); el('path',{d:'M'+(-sl/2)+',-2.6 L'+(sl/2-3)+',-2.6 L'+(sl/2)+',0 L'+(sl/2-3)+',2.6 L'+(-sl/2)+',2.6 Z',fill:kf,stroke:m.st==='cap'?'#3b2b16':kc,'stroke-width':1.1,'stroke-dasharray':m.st==='cap'?'2 1.2':''},hg);
    if(m.st==='sunk'||m.st==='cap') el('path',{d:'M-3,-3 L3,3 M-3,3 L3,-3',stroke:'#3b1a10','stroke-width':1.3},hg);
    if(m.n){ t=el('text',{x:m.lx||0,y:(m.ly!=null?m.ly:-6),'text-anchor':m.la||'middle','font-size':m.fs||8.5,'font-weight':700},g); t.textContent=T(m.n); } }
  else if(m.k==='fire'){ el('path',{d:'M0,-10 C4,-5 7,-3 6,2 C5.5,6 2.5,8 0,8 C-2.5,8 -5.5,6 -6,2 C-6.5,-2 -3,-3 -2,-7 C-1,-4 0,-3 1,-2 C1.5,-5 0.5,-7 0,-10 Z',fill:'#e0622b','fill-opacity':.85,stroke:'#7a2a10','stroke-width':.8},g); el('path',{d:'M0,-1 C2,1 2.5,3 2,5 C1.5,6.5 -1.5,6.5 -2,5 C-2.5,3 -1,1.5 0,-1 Z',fill:'#f6c344'},g); if(m.n){ t=el('text',{y:-13,'text-anchor':'middle','font-size':8.5,'font-weight':700},g); t.textContent=T(m.n); } }
  else if(m.k==='radar'){ el('path',{d:'M-5,6 L0,-1 L5,6 M0,-1 L0,-4 M-6,-8 Q0,-3 6,-8',stroke:'#3b2b16','stroke-width':1.4,fill:'none'},g); t=el('text',{y:-11,'text-anchor':'middle','font-size':8.5,'font-weight':700,'font-style':'italic'},g); t.textContent=T(m.n); }
  else if(m.k==='harbour'){ el('path',{d:'M-10,4 L-10,-4 L10,-4 L10,4 M-6,-4 L-6,-9 M6,-4 L6,-9',stroke:'#1d3f8a','stroke-width':2,fill:'none'},g); t=el('text',{y:-12,'text-anchor':'middle','font-size':8.5,'font-weight':700,style:'fill:#1d3f8a'},g); t.textContent=T(m.n); }
  else { t=el('text',{y:0,'text-anchor':m.la||'middle','font-size':m.fs||11,'font-style':'italic','font-weight':700,'letter-spacing':'.08em',style:(LD&&LD[m.c])?'fill:'+LD[m.c].c:m.c==='de'?'fill:#222':m.c==='fake'?'fill:#6b6b60':m.c==='ink'?'fill:#3b2b16':'fill:#1d3f8a'},g); t.textContent=T(m.n); }
  return g; }
function placeSym(p){
  var g=document.createElementNS(NS,'g'), big=p.k==='city', port=p.k==='port';
  if(port) el('path',{d:'M0,-4 L0,4 M-3,1 Q0,6 3,1 M-2,-2 L2,-2',stroke:'#3b2b16','stroke-width':1.2,fill:'none'},g);
  else el('circle',{r:big?3.2:2.2,fill:big?'#3b2b16':'#efe3c2',stroke:'#3b2b16','stroke-width':1.1},g);
  var t=el('text',{x:p.lx!=null?p.lx:5,y:p.ly!=null?p.ly:3.5,'text-anchor':p.la||'start','font-size':big?10.5:9,'font-style':big?'normal':'italic','font-weight':big?700:400},g); t.textContent=T(p.n);
  return g; }

// ---------- battle page ----------
function battle(app,X,id){
  css();
  var B0=BASE, ck=B0+'/'+id;
  X.set('<p class="sub" style="padding:24px 0">'+U_('load')+'</p>',LT());
  (CACHE[ck]?Promise.resolve(CACHE[ck]):get(ck+'.json').then(function(d){CACHE[ck]=d;return d;})).then(function(D){
    if(location.hash.split('?')[0].replace(/\/$/,'')!=='#/'+B0+'/'+id) return;
    render(app,X,D);
  }).catch(function(err){ X.set(X.crumbs([[U_('home'),'#/'],[U_('hub'),'#/batallas'],[LT(),LR()]])+'<h1>'+(OPS()?U_('onf'):U_('notfound'))+'</h1><p class="sub">'+(OPS()?U_('oerr'):U_('err'))+'</p>',LT()); if(window.console) console.warn(err); });
}
function srcList(D,keys){ return '<ol>'+keys.map(function(k){ var s=D.src[k]; return s?'<li><a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a></li>':''; }).join('')+'</ol>'; }
function flag(n){ if(!FLAG[n]) return ''; return '<img class="bt-flag" src="flags/'+FLAG[n]+'.png" alt="" loading="lazy">'; }
function ficha(id,name,note){ return '<a class="tag" href="#/a/'+e(id)+'">'+e(T(name))+(note?' <small>· '+e(T(note))+'</small>':'')+'</a>'; }
function render(app,X,D){
  LD=D.lados||null;
  var N=D.steps.length, qm=(location.hash.match(/[?&]paso=(\d+)/)||[])[1], cur=qm?Math.max(0,Math.min(N-1,(+qm)-1)):0;
  var h=X.crumbs([[U_('home'),'#/'],[U_('hub'),'#/batallas'],[LT(),LR()],[T(D.t)]])+'<div class="bt" data-noi18n>';
  h+='<h1 class="bt-title">'+e(T(D.t))+'</h1><p class="bt-meta">'+e(T(D.fecha))+' · '+e(T(D.lugar))+' · '+e(T(D.guerra))+'</p><p class="sub" style="margin-top:0">'+e(T(D.intro))+'</p>';
  if(D.datos&&D.datos.length) h+='<details class="bt-sec bt-datos"'+(window.innerWidth>=760?' open':'')+'><summary>'+e(U_('datos'))+'</summary><dl>'+D.datos.map(function(r){return '<dt>'+e(T(r[0]))+'</dt><dd>'+e(T(r[1]))+'</dd>';}).join('')+'</dl>'+(D.datosrc?'<details style="font-size:13px"><summary>'+e(U_('src'))+'</summary>'+srcList(D,D.datosrc)+'</details>':'')+'</details>';
  function HAS(t){ return D.tema===t||D.steps.some(function(s){return s.tema===t;}); } var SNOW=HAS('nieve'), MUD=HAS('barro'), SMOKE=HAS('ruinas'); var SKY=HAS('cielo'); var NIGHT=HAS('noche');
  h+='<div class="bt-mapw">'+(SNOW?'<div class="bt-snowfx" aria-hidden="true"></div>':'')+(MUD?'<div class="bt-mudfx" aria-hidden="true"></div>':'')+(SMOKE?'<div class="bt-smokefx" aria-hidden="true"></div>':'')+(SKY?'<div class="bt-cloudfx" aria-hidden="true"></div>':'')+(NIGHT?'<div class="bt-nightfx" aria-hidden="true"></div>':'')+'<div class="bt-vn" id="btvn"></div><div class="bt-cap" id="btcap"></div><svg class="bt-map" id="btmap" role="img" aria-label="'+e(T(D.t))+'"></svg></div><div id="btins"></div>';
  if(D.caps&&D.caps.length) h+='<div class="bt-caps" role="tablist" aria-label="'+e(U_('caps'))+'">'+D.caps.map(function(c,ci){return '<button type="button" class="bt-capb" data-s="'+c.s+'">'+e(T(c.t))+'</button>';}).join('')+'</div>';
  h+='<div class="bt-modep" id="btmodep"><button type="button" class="btn" id="btback">‹ '+e(U_('back'))+'</button></div>';
  h+='<div id="btsteps"><div class="bt-ctl"><button type="button" class="btn" id="btprev" aria-label="'+e(U_('prev'))+'">‹ '+e(U_('prev'))+'</button><span class="num" id="btnum"></span><button type="button" class="btn" id="btnext" aria-label="'+e(U_('next'))+'">'+e(U_('next'))+' ›</button></div>';
  h+='<input type="range" class="bt-rng" id="btrng" min="0" max="'+(N-1)+'" step="1" value="'+cur+'" aria-label="'+e(U_('timeline'))+'"><div class="bt-ticks">'+D.steps.map(function(s,i){return '<span>'+((N<=20||i===0||i===N-1||(i+1)%5===0)?(i+1):'·')+'</span>';}).join('')+'</div></div>';
  h+='<div id="btinfo"></div><div class="bt-step" id="btstep" aria-live="polite"></div>';
  // legend
  h+='<details class="bt-sec"><summary>'+e(U_('leyenda'))+'</summary><div class="bt-leg">'+legend(D)+'</div><p class="bt-cred">'+e(T(D.credito))+'</p></details>';
  // beaches
  if(D.playas&&D.playas.length){ h+='<details class="bt-sec" open><summary>'+e(U_('playas'))+'</summary>';
    D.playas.forEach(function(p){ h+='<details class="bt-beach"><summary>'+flag(p.nat)+'<span class="bn">'+e(p.n)+'</span><span class="bh">'+e(U_('hora'))+' '+e(p.hora)+'</span></summary><div class="bb"><dl>'+
      '<dt>'+e(U_('sec'))+'</dt><dd>'+e(T(p.sec))+'</dd><dt>'+e(U_('uds'))+'</dt><dd>'+e(T(p.uds))+'</dd><dt>'+e(U_('mandos'))+'</dt><dd>'+e(T(p.mandos))+'</dd><dt>'+e(U_('tropas'))+'</dt><dd>'+e(T(p.tropas))+'</dd><dt>'+e(U_('bajas'))+'</dt><dd>'+e(T(p.bajas))+'</dd>'+
      '<dt>'+e(U_('carros'))+'</dt><dd><div class="tags">'+p.carros.map(function(c){return c[1]?ficha(c[1],T(c[0])):'<span class="tag">'+e(T(c[0]))+'</span>';}).join('')+'</div></dd>'+
      '<dt>'+e(U_('de'))+'</dt><dd>'+e(T(p.de))+'</dd><dt>'+e(U_('defs'))+'</dt><dd>'+p.wn.map(function(w){var d=byId(D.defs,w);return d?e(T(d.n)):'';}).filter(Boolean).join(' · ')+'</dd>'+
      '<dt>'+e(U_('cur'))+'</dt><dd>'+e(T(p.cur))+'</dd></dl><p style="margin:10px 0 4px"><button type="button" class="btn btbeach" data-b="'+e(p.id)+'">'+e(U_('vermap'))+' ›</button></p><details style="font-size:13px"><summary>'+e(U_('src'))+'</summary>'+srcList(D,p.src)+'</details></div></details>'; });
    h+='</details>'; }
  // forces
  if(D.fuerzas){ var F=D.fuerzas; h+='<details class="bt-sec" open><summary>'+e(U_('fz'))+'</summary><div class="bt-fz">';
    (F.lados||['al','de']).forEach(function(k){ var f=F[k]; h+='<div><h3>'+f.nat.map(flag).join('')+' '+e(T(f.t))+'</h3><table>'+f.mandos.map(function(m){return '<tr><td>'+e(T(m[0]))+'</td><td>'+e(T(m[1]))+'</td></tr>';}).join('')+'</table><p class="cnt" style="margin:10px 0 2px;text-transform:uppercase;letter-spacing:.08em">'+e(U_('cifras'))+'</p><table>'+f.cifras.map(function(m){return '<tr><td>'+e(T(m[0]))+'</td><td>'+e(T(m[1]))+'</td></tr>';}).join('')+'</table><p class="cnt" style="margin:10px 0 2px;text-transform:uppercase;letter-spacing:.08em">'+e(U_('medios'))+'</p><div class="tags">'+f.medios.map(function(m){return ficha(m[1],m[0],m[2]);}).join('')+'</div></div>'; });
    h+='</div><details style="font-size:13px;margin-top:8px"><summary>'+e(U_('src'))+'</summary>'+srcList(D,F.src)+'</details></details>'; }
  h+='<details class="bt-sec"><summary>'+e(U_('fuentes'))+'</summary><div class="bt-src">'+srcList(D,Object.keys(D.src))+'</div></details>';
  h+='</div>';
  X.set(h,T(D.t));
  var M=Map_(document.getElementById('btmap'),D);
  var mode=null;
  var ROOT=app.querySelector('.bt')||document.querySelector('.bt[data-noi18n]');
  function show(i,instant){ cur=i; var s=D.steps[i];
    if(ROOT){ var th=s.tema||D.tema||''; ROOT.classList.toggle('snow',th==='nieve'); ROOT.classList.toggle('mar',th==='mar'); ROOT.classList.toggle('barro',th==='barro'); ROOT.classList.toggle('ruinas',th==='ruinas'); ROOT.classList.toggle('meseta',th==='meseta'); ROOT.classList.toggle('desierto',th==='desierto'); ROOT.classList.toggle('cielo',th==='cielo'); ROOT.classList.toggle('noche',th==='noche'); }
    if(D.caps){ var ac=0; D.caps.forEach(function(c,ci){ if(i>=c.s) ac=ci; }); Array.prototype.forEach.call(document.querySelectorAll('.bt-capb'),function(bb,bi){ bb.classList.toggle('on',bi===ac); bb.setAttribute('aria-selected',bi===ac?'true':'false'); if(bi===ac&&bb.parentNode){ var pc=bb.parentNode; pc.scrollLeft=Math.max(0,bb.offsetLeft-pc.offsetLeft-12); } }); }
    var vn=document.getElementById('btvn'); if(vn){ var vt=D.vnote&&D.vnote[s.view]; vn.textContent=vt?T(vt):''; vn.style.display=vt?'':'none'; }
    var ins=document.getElementById('btins'); if(ins){ var I0=s.ins&&D.ins&&D.ins[s.ins.id]; if(I0){ ins.innerHTML='<div class="bt-ins"><div class="bt-ins-t">'+e(T(I0.t))+'</div><svg viewBox="'+I0.vb+'" role="img" aria-label="'+e(T(I0.t))+'">'+T(I0.svg)+(s.ins.add?T(s.ins.add):'')+'</svg>'+(s.ins.cap?'<div class="bt-ins-c">'+e(T(s.ins.cap))+'</div>':'')+'</div>'; (s.ins.hl||[]).forEach(function(k){ Array.prototype.forEach.call(ins.querySelectorAll('[data-k="'+k+'"]'),function(n){ n.classList.add('on'); }); }); } else ins.innerHTML=''; }
    document.getElementById('btnum').textContent=U_('paso')+' '+(i+1)+' / '+N+' · '+T(s.h);
    document.getElementById('btrng').value=i;
    document.getElementById('btprev').disabled=i===0; document.getElementById('btnext').disabled=i===N-1;
    var st=document.getElementById('btstep');
    st.innerHTML='<p class="hh">'+(s.cap?'<span class="bt-capl">'+e(T(s.cap))+'</span> ':'')+e(U_('paso'))+' '+(i+1)+' · '+e(T(s.h))+'</p><h2>'+e(T(s.t))+'</h2>'+T(s.txt).split('\n\n').map(function(p){return '<p>'+e(p)+'</p>';}).join('')+
      (s.foto?'<figure class="bt-fig"><img src="'+e(s.foto.f)+'" alt="'+e(T(s.foto.c))+'" loading="lazy"'+(s.foto.w?' width="'+s.foto.w+'" height="'+s.foto.h+'"':'')+'><figcaption>'+e(T(s.foto.c))+' <span class="cr">'+e(T(s.foto.a))+(s.foto.u?' · <a href="'+e(s.foto.u)+'" target="_blank" rel="noopener">'+(EN()?'Source':'Fuente')+'</a>':'')+'</span></figcaption></figure>':'')+
      (s.det?'<div class="bt-det"><b>'+e(U_('det'))+'</b><span class="tt">'+e(T(s.det.t))+'</span>'+e(T(s.det.x))+'</div>':'')+
      (s.ver?'<div class="bt-ver"><b>'+e(T(s.ver.t||U_('vers')))+'</b>'+s.ver.it.map(function(v){return '<div class="vi"><span class="vw">'+e(T(v[0]))+'</span>'+e(T(v[1]))+'</div>';}).join('')+(s.ver.n?'<div class="vn">'+e(T(s.ver.n))+'</div>':'')+'</div>':'')+
      '<p class="cnt" style="margin:0 0 4px">'+e(U_('tap'))+'</p><details><summary>'+e(U_('src'))+' ('+s.src.length+')</summary>'+srcList(D,s.src)+'</details>';
    document.getElementById('btcap').style.display='none';
    document.getElementById('btinfo').innerHTML='';
    M.go(s,instant);
    try{ history.replaceState(history.state,'',location.pathname+location.search+'#/'+BASE+'/'+D.id+(i?'?paso='+(i+1):'')); }catch(x){}
  }
  function exitMode(){ mode=null; document.getElementById('btmodep').classList.remove('on'); document.getElementById('btsteps').style.display=''; document.getElementById('btstep').style.display=''; show(cur); }
  document.getElementById('btprev').onclick=function(){ if(cur>0) show(cur-1); };
  document.getElementById('btnext').onclick=function(){ if(cur<N-1) show(cur+1); };
  document.getElementById('btrng').oninput=function(){ show(+this.value); };
  document.getElementById('btback').onclick=exitMode;
  Array.prototype.forEach.call(document.querySelectorAll('.bt-capb'),function(bb){ bb.onclick=function(){ show(+bb.getAttribute('data-s')); var w=document.getElementById('btnum'); if(w&&w.scrollIntoView){ try{ var hd=document.querySelector('header.top'), y=document.querySelector('.bt-mapw').getBoundingClientRect().top+window.scrollY-((hd&&hd.offsetHeight)||0)-8; if(window.scrollY>y) window.scrollTo(0,y); }catch(x){} } }; });
  Array.prototype.forEach.call(document.querySelectorAll('.btbeach'),function(b){ b.onclick=function(){ var p=byId(D.playas,b.getAttribute('data-b')); if(!p) return; mode=p.id;
    document.getElementById('btmodep').classList.add('on'); document.getElementById('btsteps').style.display='none'; document.getElementById('btstep').style.display='none';
    var cp=document.getElementById('btcap'); cp.style.display=''; cp.textContent=p.n+' · '+U_('hora')+' '+p.hora; document.getElementById('btinfo').innerHTML='';
    M.go({view:p.view,u:[],ar:[],mk:[],show:['defs','obs','beaches','flood'],defs:p.wn,focus:p.id},false);
    var w=document.querySelector('.bt-mapw'), hd=document.querySelector('header.top'); if(w){ var y=w.getBoundingClientRect().top+window.scrollY-((hd&&hd.offsetHeight)||0)-8; try{ window.scrollTo({top:y,behavior:RM()?'auto':'smooth'}); }catch(x){ window.scrollTo(0,y); } } }; });
  M.onTap=function(kind,o){ var box=document.getElementById('btinfo'), h2;
    if(kind==='u'){ h2='<div class="bt-info"><button class="x" type="button" aria-label="'+e(U_('cerrar'))+'">×</button><h3>'+(o.s==='al'?flag(o.nat):flag(o.nat||'de'))+' '+e(T(o.n))+'</h3><div>'+e(T(o.info))+'</div>'+(o.eq&&o.eq.length?'<div class="tags"><span class="cnt">'+e(U_('eq'))+':</span> '+o.eq.map(function(id){return ficha(id,(D.fn&&D.fn[id])||id);}).join('')+'</div>':'')+'<div class="cnt" style="margin-top:4px">'+e(U_('aprox'))+'</div></div>'; }
    else { h2='<div class="bt-info"><button class="x" type="button" aria-label="'+e(U_('cerrar'))+'">×</button><h3>'+(o.k==='lm'?'':flag(o.nat||'de')+' ')+e(T(o.n))+'</h3><div>'+(o.note?e(T(o.note)):'')+'</div><div class="cnt" style="margin-top:4px">'+e(U_('aprox'))+'</div></div>'; }
    box.innerHTML=h2; box.querySelector('.x').onclick=function(){ box.innerHTML=''; }; };
  document.addEventListener('keydown',function kd(ev){ if(!document.getElementById('btmap')){ document.removeEventListener('keydown',kd); return; } if(mode||/INPUT|TEXTAREA|SELECT/.test((ev.target||{}).tagName||'')) return; if(ev.key==='ArrowRight'&&cur<N-1) show(cur+1); if(ev.key==='ArrowLeft'&&cur>0) show(cur-1); });
  show(cur,true);
}
function byId(a,id){ for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return null; }
function legend(D){
  function sv(inner,w){ return '<svg viewBox="-17 -15 34 30" width="34" height="30" aria-hidden="true">'+inner+'</svg>'; }
  if(D&&D.leyenda) return D.leyenda.map(function(it){ return '<span>'+sv(it[0])+e(T(it[1]))+'</span>'; }).join('');
  var A='stroke="#1d3f8a" stroke-width="1.6"', G='stroke="#1f1f1f" stroke-width="1.6"';
  var items=[
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+A+'/>'),'Infantería aliada|Allied infantry'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><ellipse rx="8" ry="4.2" fill="none" '+A+'/>'),'Unidad acorazada aliada|Allied armour'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#d6e2f6" '+A+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+A+'/><path d="M-6,5 Q-3,1 0,5 Q3,1 6,5" fill="none" '+A+'/>'),'Paracaidistas|Paratroopers'],
   [sv('<rect x="-12" y="-8" width="24" height="16" fill="#aaaaa2" '+G+'/><path d="M-12,-8 L12,8 M-12,8 L12,-8" '+G+'/>'),'Unidad alemana|German unit'],
   [sv('<path d="M-13,-2 L13,-2 L9,5 L-9,5 Z" fill="#d6e2f6" '+A+'/>'),'Fuerza naval|Naval force'],
   [sv('<text x="0" y="3" text-anchor="middle" font-size="9" font-weight="700">XX</text>'),'XX división · X brigada · III regimiento · II batallón|XX division · X brigade · III regiment · II battalion'],
   [sv('<path d="M-6,3 A6,6 0 0 1 6,3 Z" fill="#2b2b2b"/><path d="M-4,-2.5 L-6.5,-6 M0,-3.5 L0,-8 M4,-2.5 L6.5,-6" stroke="#111" stroke-width="1.1"/>'),'Nido de resistencia (WN)|Resistance nest (WN)'],
   [sv('<circle r="5.5" fill="#3a3a36"/><path d="M0,0 L10,-6" stroke="#111" stroke-width="2.2"/>'),'Batería de costa|Coastal battery'],
   [sv('<path d="M-12,0 h24" stroke="#8b1d1d" stroke-width="1.2" stroke-dasharray="1 3"/><path d="M-8,-3 l4,4 m0,-4 l-4,4 M2,-3 l4,4 m0,-4 l-4,4" stroke="#222" stroke-width="1.2"/>'),'Obstáculos de playa|Beach obstacles'],
   [sv('<rect x="-12" y="-7" width="24" height="14" fill="#b9c6cf" stroke="#5c7794"/>'),'Zona inundada (aprox.)|Flooded area (approx.)'],
   [sv('<circle r="9" fill="rgba(29,63,138,.1)" stroke="#1d3f8a" stroke-dasharray="2 2"/>'),'Zona de salto (DZ)|Drop zone (DZ)'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1d3f8a" stroke-width="2.2"/><path d="M12,0 l-5,-4 l1,5 z" fill="#1d3f8a"/>'),'Avance / ruta aliada|Allied advance / route'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1d3f8a" stroke-width="1.6" stroke-dasharray="1.5 3"/>'),'Ruta aérea|Air route'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#1f1f1f" stroke-width="2.4"/><path d="M12,0 l-5,-4 l1,5 z" fill="#1f1f1f"/>'),'Contraataque alemán|German counter-attack'],
   [sv('<path d="M-14,4 L12,0" fill="none" stroke="#b3261e" stroke-width="1.3" stroke-dasharray="4 2"/>'),'Fuego naval|Naval gunfire'],
   [sv('<path d="M-14,4 C-5,-6 5,-6 12,0" fill="none" stroke="#7a7a72" stroke-width="1.6" stroke-dasharray="5 3"/>'),'Engaño / amenaza falsa|Deception / fake threat'],
   [sv('<rect x="-12" y="-7" width="24" height="14" fill="rgba(29,63,138,.16)" stroke="#1d3f8a" stroke-dasharray="4 3"/>'),'Cabeza de playa (aprox.)|Beachhead (approx.)']];
  return items.map(function(x){return '<span>'+x[0]+T(x[1])+'</span>';}).join(''); }

// ---------- the map ----------
function Map_(svg,D){
  var P=mkP(D.proj), api={}, VB=null, anim=null, curStep=null;
  var G=D.geo, defsEl=el('defs',null,svg);
  defsEl.innerHTML='<pattern id="btDep" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><rect width="7" height="7" fill="#d8bd86"/><path d="M0,3.5 h7" stroke="#9a6f32" stroke-width=".8" stroke-opacity=".55"/></pattern><pattern id="btFlood" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="6" height="6" fill="#c9d3d6"/><path d="M0,3 h6" stroke="#5c7794" stroke-width="1"/></pattern>';
  var sea=el('rect',{x:-40000,y:-40000,width:80000,height:80000,'class':'sea'},svg);
  var grat=el('path',{'class':'grat'},svg), gd='';
  var GR=D.proj.grat||[-8,4,47.5,52.5,.5];
  for(var lo=GR[0];lo<=GR[1]+1e-9;lo+=GR[4]){ var a=P([lo,GR[2]]),b=P([lo,GR[3]]); gd+='M'+a[0].toFixed(1)+','+a[1].toFixed(1)+'L'+b[0].toFixed(1)+','+b[1].toFixed(1); }
  for(var la=GR[2];la<=GR[3]+1e-9;la+=GR[4]){ var c=P([GR[0],la]),d2=P([GR[1],la]); gd+='M'+c[0].toFixed(1)+','+c[1].toFixed(1)+'L'+d2[0].toFixed(1)+','+d2[1].toFixed(1); }
  grat.setAttribute('d',gd);
  var gOvG=el('g',null,svg), gOvW=el('path',{d:G.ovc,'class':'wl'},gOvG); el('path',{d:G.ov,'class':'land'},gOvG); var gOvR=el('path',{d:G.ovriv||'','class':'riv'},gOvG), gOvRM=el('path',{d:G.ovrivM||'','class':'riv'},gOvG); var gOv=el('path',{d:G.ovc,'class':'coast'},gOvG); var gBord=G.bord?el('path',{d:G.bord,'class':'bord'},gOvG):null;
  var gDet=el('g',null,svg); var gDetW=el('path',{d:G.coast+(G.ovoutc||''),'class':'wl'},gDet); el('path',{d:G.ovout||'','class':'land'},gDet); el('path',{d:G.det,'class':'land'},gDet); var gDetC2=el('path',{d:G.ovoutc||'','class':'coast'},gDet);
  var gFlood=el('path',{d:G.flood,'class':'flood hide'},svg);
  var gArea=el('path',{d:G.areas,'class':'area hide'},svg);
  var gDep=G.dep?el('path',{d:G.dep,'class':'dep'},svg):null; // depresiones (p. ej. Qattara), visibles en ambos niveles
  var gZn=el('g',null,svg), ZN=[]; // zonas y frentes por paso (s.zn)
  var gReef=G.reef?el('path',{d:G.reef,'class':'reef'},gDet):null;
  var gMil=G.mil?el('path',{d:G.mil,'class':'mil'},gDet):null, gYard=G.yard?el('path',{d:G.yard,'class':'yard'},gDet):null, gRd2=G.road2?el('path',{d:G.road2,'class':'road2'},gDet):null, gRd=G.road?el('path',{d:G.road,'class':'road'},gDet):null, gBld=G.bld?el('path',{d:G.bld,'class':'bld'},gDet):null, gWall=G.wall?el('path',{d:G.wall,'class':'wall'},gDet):null;
  var gRiv=el('path',{d:G.riv,'class':'riv'},gDet);
  var gRail=G.rail?el('path',{d:G.rail,'class':'rail'},gDet):null; // ferrocarril fijo opcional
  var gCoast=el('path',{d:G.coast,'class':'coast'},gDet);
  var gBeach=el('g',null,svg), beachEls={};
  var BC={us:'#1d3f8a',uk:'#b3261e',ca:'#b3261e'};
  (D.playas||[]).forEach(function(p){ if(!G.beach[p.id]) return; var b=el('path',{d:G.beach[p.id],'class':'beach',stroke:BC[p.nat]||'#1d3f8a','stroke-opacity':.75},gBeach); beachEls[p.id]=b; });
  var gObs=el('g',{'class':'hide'},svg), gArr=el('g',null,svg), gPl=el('g',null,svg), gDef=el('g',null,svg), gMk=el('g',null,svg), gBl=el('g',null,svg), gU=el('g',null,svg);
  var syms=[]; // {g, x, y}
  function addSym(g,ll,par){ var xy=P(ll); var o={g:g,x:xy[0],y:xy[1]}; par.appendChild(g); syms.push(o); return o; }
  // beach labels
  var BL={}; (D.playas||[]).forEach(function(p){ var pts=G.beach[p.id]; if(!pts) return; var m=pts.match(/-?[\d.]+,-?[\d.]+/g)||[]; var mid=m[Math.floor(m.length/2)]; if(!mid) return; var xy=mid.split(',').map(Number);
    var g=document.createElementNS(NS,'g'); var t=el('text',{y:-8,'text-anchor':'middle','font-size':12.5,'font-weight':700,'class':'ttl',style:'fill:'+(BC[p.nat]||'#1d3f8a')},g); t.textContent=p.n.toUpperCase();
    gBl.appendChild(g); var o={g:g,x:xy[0],y:xy[1]-0.25}; syms.push(o); BL[p.id]=o; });
  // places
  var PLc=D.places.map(function(p){ var o=addSym(placeSym(p),p.ll,gPl); o.p=p; return o; });
  // defences
  var DFc=D.defs.map(function(d){ var g=defSym(d); g.classList.add('tap'); var o=addSym(g,d.ll,gDef); o.d=d; g.addEventListener('click',function(){ api.onTap&&api.onTap('d',d); }); return o; });
  // obstacles
  Object.keys(D.obs||{}).forEach(function(b){ D.obs[b].forEach(function(ll){ var g=document.createElementNS(NS,'g'); el('path',{d:'M-2.6,-2.6 L2.6,2.6 M-2.6,2.6 L2.6,-2.6',stroke:'#222','stroke-width':1.2},g); var o=addSym(g,ll,gObs); o.b=b; }); });
  // units (persist across steps)
  var UN={}; D.units.forEach(function(u){ var g=unitSym(u); g.classList.add('sym','off','tap'); var o=addSym(g,u.ll,gU); o.u=u; o.hx=o.x; o.hy=o.y; UN[u.id]=o; g.addEventListener('click',function(){ if(!g.classList.contains('off')) api.onTap&&api.onTap('u',u); }); });
  var MKs=[], WIDE=false;
  function pxW(){ var r=svg.getBoundingClientRect(); return r.width||360; }
  function pxH(){ var r=svg.getBoundingClientRect(); return r.height||270; }
  function fit(v){ var a=P([v[0],v[3]]),b=P([v[2],v[1]]); var w=b[0]-a[0],h=b[1]-a[1],ar=pxW()/pxH(); var cx=(a[0]+b[0])/2, cy=(a[1]+b[1])/2; if(w/h<ar) w=h*ar; else h=w/ar; return [cx-w/2,cy-h/2,w,h]; }
  function lvOK(lv,layer,close){ if(!lv) return true; if(lv==='ov') return layer==='ov'; if(lv==='ovdet') return true; if(lv==='det') return layer==='det'; if(lv==='det2') return layer==='det'&&close; return true; }
  function applyVB(vb){ VB=vb; svg.setAttribute('viewBox',vb.map(function(x){return x.toFixed(3);}).join(' ')); var s=vb[2]/pxW();
    for(var i=0;i<syms.length;i++){ var o=syms[i]; o.g.setAttribute('transform','translate('+o.x.toFixed(3)+','+o.y.toFixed(3)+') scale('+(s*(o.u&&WIDE?.8:1)).toFixed(5)+')'); }
    gOv.style.strokeWidth=(1.3*s).toFixed(4); gOvR.style.strokeWidth=(.9*s).toFixed(4); gOvRM.style.strokeWidth=(2*s).toFixed(4);
    ZN.forEach(function(z){ z.e.style.strokeWidth=((z.k==='line'?2.6:1.4)*s).toFixed(4); z.e.style.strokeDasharray=z.k==='line'?(z.dash?(6*s)+' '+(3*s):''):(5*s)+' '+(3*s); }); gDetC2.style.strokeWidth=(1.3*s).toFixed(4); gOvW.style.strokeWidth=(9*s).toFixed(4); gDetW.style.strokeWidth=(12*s).toFixed(4); gCoast.style.strokeWidth=(1.5*s).toFixed(4); gRiv.style.strokeWidth=(1.1*s).toFixed(4); if(gReef){ gReef.style.strokeWidth=(1.2*s).toFixed(4); gReef.style.strokeDasharray=(3*s)+' '+(2*s); } grat.style.strokeWidth=(.8*s).toFixed(4); gArea.style.strokeWidth=(1.2*s).toFixed(4); gFlood.style.strokeWidth=(.6*s).toFixed(4);
    gArea.style.strokeDasharray=(4*s)+' '+(3*s); if(gDep) gDep.style.strokeWidth=(1*s).toFixed(4); if(gRail){ gRail.style.strokeWidth=(1.5*s).toFixed(4); gRail.style.strokeDasharray=(5*s)+' '+(2.5*s); }
    if(gBord){ gBord.style.strokeWidth=(1.1*s).toFixed(4); gBord.style.strokeDasharray=(4*s)+' '+(2.5*s); } if(gRd) gRd.style.strokeWidth=(2.2*s).toFixed(4); if(gRd2) gRd2.style.strokeWidth=(1*s).toFixed(4); if(gMil){ gMil.style.strokeWidth=(1.2*s).toFixed(4); gMil.style.strokeDasharray=(4*s)+' '+(2*s); } if(gBld) gBld.style.strokeWidth=(1*s).toFixed(4); if(gWall) gWall.style.strokeWidth=(2.6*s).toFixed(4); if(gYard) gYard.style.strokeWidth=(.6*s).toFixed(4);
    for(var k in beachEls) beachEls[k].style.strokeWidth=(5*s).toFixed(4);
    arrowsScale(s); }
  // arrows
  var ARR=[];
  function drawArrows(list,animate){ gArr.innerHTML=''; ARR=[];
    (list||[]).forEach(function(a,i){ var pts=a.p.map(P); var col=a.s==='de'?'#1f1f1f':(a.k==='fire'?'#b3261e':(a.k==='fake'?'#7a7a72':'#1d3f8a'));
      var L=LD&&LD[a.s]; if(L) col=a.k==='fake'?'#7a7a72':L.c;
      var raw=(a.k==='land'||a.k==='sea')?wob(pts,.035,i*7+3):pts;
      var g=el('g',{'class':'arw'+(animate&&(a.k==='land'||a.k==='sea')&&!RM()?' draw':'')},gArr);
      var ln=el('path',{d:curve(raw),fill:'none',stroke:col,'stroke-linecap':'round','stroke-linejoin':'round','class':'ln'},g); if(g.classList.contains('draw')) ln.setAttribute('pathLength','1');
      var head=(a.k!=='fire')?el('path',{fill:col},g):null;
      ARR.push({a:a,pts:pts,ln:ln,head:head,col:col}); });
    if(VB) arrowsScale(VB[2]/pxW()); }
  function arrowsScale(s){ ARR.forEach(function(o){ var k=o.a.k, w=k==='land'?3.2:k==='sea'?2.4:k==='air'?1.8:k==='fire'?1.3:k==='raid'?2.6:1.7;
      o.ln.style.strokeWidth=(w*s).toFixed(4);
      if(k==='air') o.ln.style.strokeDasharray=(1.5*s)+' '+(3.5*s); else if(k==='raid') o.ln.style.strokeDasharray=(7*s)+' '+(3*s); else if(k==='fake') o.ln.style.strokeDasharray=(6*s)+' '+(4*s); else if(k==='fire') o.ln.style.strokeDasharray=(5*s)+' '+(3*s); else if(!o.ln.parentNode.classList.contains('draw')) o.ln.style.strokeDasharray='';
      if(o.head){ var p=o.pts, b=p[p.length-1], a=p[p.length-2], dx=b[0]-a[0], dy=b[1]-a[1], L=Math.sqrt(dx*dx+dy*dy)||1, ux=dx/L, uy=dy/L, hl=(k==='land'?11:9)*s, hw=(k==='land'?6.5:5)*s;
        o.head.setAttribute('d','M'+(b[0]+ux*hl*.25).toFixed(3)+','+(b[1]+uy*hl*.25).toFixed(3)+' L'+(b[0]-ux*hl-uy*hw).toFixed(3)+','+(b[1]-uy*hl+ux*hw).toFixed(3)+' L'+(b[0]-ux*hl*.62).toFixed(3)+','+(b[1]-uy*hl*.62).toFixed(3)+' L'+(b[0]-ux*hl+uy*hw).toFixed(3)+','+(b[1]-uy*hl-ux*hw).toFixed(3)+' Z'); } }); }
  function setMarks(list){ MKs.forEach(function(o){ var i=syms.indexOf(o); if(i>=0) syms.splice(i,1); if(o.g.parentNode) o.g.parentNode.removeChild(o.g); }); MKs=[];
    (list||[]).forEach(function(m){ MKs.push(addSym(mkSym(m),m.ll,gMk)); }); }
  function declutter(){ // hide labels (places, then defences) that collide with units or higher-priority labels
    var placed=[], sr=svg.getBoundingClientRect();
    function box(n){ var r=n.getBoundingClientRect(); return [r.left,r.top,r.right,r.bottom]; }
    function hit(b){ for(var i=0;i<placed.length;i++){ var c=placed[i]; if(b[0]<c[2]&&b[2]>c[0]&&b[1]<c[3]&&b[3]>c[1]) return true; } return false; }
    function vis(g){ return !g.classList.contains('hide')&&!g.classList.contains('off')&&!(g.parentNode&&g.parentNode.classList&&g.parentNode.classList.contains('hide')); }
    Object.keys(UN).forEach(function(id){ var g=UN[id].g; if(vis(g)) placed.push(box(g)); });
    MKs.forEach(function(o){ placed.push(box(o.g)); });
    function lab(list,all){ list.forEach(function(g){ var t=g.querySelector('text'); if(!t) return; t.style.display=''; if(all) g.style.display=''; if(!vis(g)) return; var b=box(t); var off=b[0]<sr.left-1||b[2]>sr.right+1||b[1]<sr.top-1||b[3]>sr.bottom+1; if(off||hit(b)){ if(all) g.style.display='none'; else t.style.display='none'; } else placed.push(b); }); }
    lab(Object.keys(BL).map(function(k){return BL[k].g;}));
    lab(DFc.filter(function(o){return o.d.k==='bat';}).map(function(o){return o.g;}));
    lab(PLc.filter(function(o){return o.p.k==='city';}).map(function(o){return o.g;}),true);
    lab(DFc.filter(function(o){return o.d.k!=='bat';}).map(function(o){return o.g;}));
    lab(PLc.filter(function(o){return o.p.k!=='city';}).map(function(o){return o.g;}),true);
  }
  api.go=function(s,instant){ curStep=s; var v=D.views[s.view]||D.views[Object.keys(D.views)[0]]; var layer=v[4], close=(v[2]-v[0])<0.45;
    var sh={}; (s.show||[]).forEach(function(k){sh[k]=1;});
    gOvG.classList.toggle('hide',layer!=='ov'); gDet.classList.toggle('hide',layer!=='det');
    gFlood.classList.toggle('hide',!(sh.flood&&layer==='det')); gArea.classList.toggle('hide',!sh.areas); gObs.classList.toggle('hide',!(sh.obs&&close));
    gBeach.classList.toggle('hide',!sh.beaches); gBl.classList.toggle('hide',!(sh.beaches&&layer==='det'));
    for(var k in beachEls) beachEls[k].setAttribute('stroke-opacity',s.focus?(k===s.focus?.95:.35):.75);
    function vwOK(x){ return !x.vw||x.vw.indexOf(s.view)>=0; }
    gZn.innerHTML=''; ZN=[]; (s.zn||[]).forEach(function(z){ var L=(LD&&LD[z.c])||{c:'#1d3f8a'}, d=z.d||('M'+z.p.map(function(ll){var q=P(ll);return q[0].toFixed(2)+','+q[1].toFixed(2);}).join('L')+(z.k==='line'?'':'Z'));
      var pe=el('path',{d:d,fill:z.k==='line'?'none':L.c,'fill-opacity':z.k==='line'?0:(z.op||.16),stroke:L.c,'stroke-opacity':.9,'stroke-linejoin':'round','fill-rule':'evenodd'},gZn); ZN.push({e:pe,k:z.k,dash:z.dash}); });
    PLc.forEach(function(o){ o.g.classList.toggle('hide',!lvOK(o.p.lv,layer,close)||!vwOK(o.p)); if(o.p.k==='port') o.g.classList.toggle('hide',!(sh.ports&&layer==='ov')); });
    var dset=null; if(s.defs){ dset={}; s.defs.forEach(function(x){dset[x]=1;}); }
    DFc.forEach(function(o){ var vis=sh.defs&&lvOK(o.d.lv,layer,close)&&vwOK(o.d)&&(!dset||dset[o.d.id]||o.d.k==='bat'); o.g.classList.toggle('hide',!vis); });
    setMarks(s.mk);
    // units: targets
    var want={}; (s.u||[]).forEach(function(id){ want[id]=1; }); WIDE=(s.u||[]).length>(D.wide||8); svg.classList.toggle('wide',WIDE);
    var from=VB?VB.slice():null, to=fit(v), moves=[];
    Object.keys(UN).forEach(function(id){ var o=UN[id], on=!!want[id]; var tgt=(s.pos&&s.pos[id])?P(s.pos[id]):[o.hx,o.hy];
      if(on){ if(o.g.classList.contains('off')){ o.x=tgt[0]; o.y=tgt[1]; o.g.classList.remove('off'); } else moves.push({o:o,x0:o.x,y0:o.y,x1:tgt[0],y1:tgt[1]}); }
      else o.g.classList.add('off');
      var st=s.st&&s.st[id]; o.g.classList.toggle('st-sunk',st==='sunk'); o.g.classList.toggle('st-dmg',st==='dmg'); });
    drawArrows(null);
    if(anim){ cancelAnimationFrame(anim); anim=null; } if(api._fb) clearTimeout(api._fb);
    var dur=(instant||!from||RM())?0:850, t0=null;
    function ease(t){ return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }
    var done=false, fb=null;
    function frame(ts){ if(done) return; if(t0==null) t0=ts; var t=dur?Math.min(1,(ts-t0)/dur):1, k=ease(t);
      moves.forEach(function(m){ m.o.x=m.x0+(m.x1-m.x0)*k; m.o.y=m.y0+(m.y1-m.y0)*k; });
      var vb=from?from.map(function(x,i){return x+(to[i]-x)*k;}):to; applyVB(vb);
      if(t<1) anim=requestAnimationFrame(frame); else { done=true; anim=null; clearTimeout(fb); drawArrows(s.ar,!instant); declutter(); } }
    if(dur){ anim=requestAnimationFrame(frame); fb=api._fb=setTimeout(function(){ if(!done){ if(anim) cancelAnimationFrame(anim); t0=-1e9; frame(0); } },dur+400); } else frame(0);
  };
  var rt=null; window.addEventListener('resize',function(){ if(!svg.isConnected) return; clearTimeout(rt); rt=setTimeout(function(){ if(curStep&&svg.isConnected){ var v=D.views[curStep.view]; applyVB(fit(v)); declutter(); } },150); });
  return api;
}

window.MAT_BATALLAS=function(app,X){
  css(); var p=X.p||[]; BASE='batallas';
  if(p.length<2) return hubPage(app,X);
  if(p[1]==='historicas') return listPage(app,X);
  return battle(app,X,p[1]);
};
window.MAT_OPERACIONES=function(app,X){
  css(); var p=X.p||[]; BASE='operaciones';
  if(p.length<2) return listPage(app,X);
  return battle(app,X,p[1]);
};
})();
