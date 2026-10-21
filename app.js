
(function(){
"use strict";
var D=window.MAT_DATA, I=D.items, P=D.meta.paises;
var BY={}; I.forEach(function(a){BY[a.id]=a;});
var LZP={};
function ensure(list,cb){var cats={}; list.forEach(function(a){if(a&&a.lz&&!a._full) cats[a.cat]=1;}); var ks=Object.keys(cats); if(!ks.length) return cb();
  Promise.all(ks.map(function(c){ if(!LZP[c]) LZP[c]=window.MAT_LAZY(c).then(function(M){Object.keys(M).forEach(function(id){var a=BY[id]; if(a){Object.assign(a,M[id]); a._full=1;}}); I.forEach(function(a){if(a.cat===c) a._full=1;});}); return LZP[c];}))
  .then(cb).catch(function(){LZP={}; app.innerHTML='<p class="sub" style="padding:24px 0">No se pudo cargar la ficha. Comprueba la conexión y vuelve a intentarlo.</p>';});}
var TIPOS=[
 {id:'caza',c:'aviones',n:'Cazas de combate',d:'Superioridad aérea, interceptores y cazas polivalentes'},
 {id:'bombardero',c:'aviones',n:'Bombarderos',d:'Bombarderos tácticos, estratégicos y de ataque profundo'},
 {id:'ataque',c:'aviones',n:'Ataque a tierra',d:'Aviones de ataque, apoyo cercano y bombarderos en picado'},
 {id:'transporte',c:'aviones',n:'Transporte y utilitarios',d:'Transporte táctico y estratégico, enlace, utilitarios y apagafuegos'},
 {id:'cisterna',c:'aviones',n:'Cisterna / reabastecimiento',d:'Reabastecimiento en vuelo'},
 {id:'awacs',c:'aviones',n:'AWACS / Alerta temprana',d:'Radar aerotransportado de alerta temprana y control (AEW&C)'},
 {id:'patrulla',c:'aviones',n:'Patrulla marítima',d:'Patrulla, guerra antisubmarina, hidroaviones y búsqueda y rescate'},
 {id:'guerra_e',c:'aviones',n:'Guerra electrónica',d:'Perturbación, ataque electrónico y supresión de defensas'},
 {id:'entrenamiento',c:'aviones',n:'Entrenamiento',d:'Escuela, entrenadores avanzados y ataque ligero'},
 {id:'reconocimiento',c:'aviones',n:'Reconocimiento',d:'Reconocimiento, observación e inteligencia'},
 {id:'dron',c:'aviones',n:'Drones',d:'Vehículos aéreos no tripulados'},
 {id:'h_ataque',c:'helicopteros',n:'Ataque',d:'Helicópteros de ataque y antitanque'},
 {id:'h_transporte',c:'helicopteros',n:'Transporte y utilitarios',d:'Transporte de tropas y carga, utilitarios'},
 {id:'h_naval',c:'helicopteros',n:'Naval y antisubmarino',d:'Embarcados, antisubmarinos y patrulla marítima'},
 {id:'h_ligero',c:'helicopteros',n:'Entrenamiento, enlace y observación',d:'Ligeros, escuela, enlace y exploración'},
 {id:'portaaviones',c:'buques',n:'Portaaviones',d:'Portaaviones, portahelicópteros y buques de asalto con cubierta corrida'},
 {id:'acorazados',c:'buques',n:'Acorazados',d:'Acorazados, cruceros de batalla y buques de línea'},
 {id:'cruceros',c:'buques',n:'Cruceros',d:'Cruceros pesados, ligeros, acorazados y lanzamisiles'},
 {id:'destructores',c:'buques',n:'Destructores',d:'Destructores y cazatorpederos'},
 {id:'fragatas',c:'buques',n:'Fragatas',d:'Fragatas y escoltas oceánicos'},
 {id:'corbetas',c:'buques',n:'Corbetas',d:'Corbetas y lanchas torpederas'},
 {id:'anfibios',c:'buques',n:'Anfibios',d:'Buques de desembarco y de asalto anfibio'},
 {id:'patrulleros',c:'buques',n:'Patrulleros',d:'Patrulleros de altura y costeros'},
 {id:'auxiliares',c:'buques',n:'Auxiliares y apoyo logístico',d:'Buques de aprovisionamiento de combate, escuela e inteligencia'},
 {id:'s_convencional',c:'submarinos',n:'Submarinos convencionales',d:'Diésel-eléctricos y AIP'},
 {id:'s_nuclear',c:'submarinos',n:'Submarinos nucleares de ataque',d:'De ataque y misiles de crucero, propulsión nuclear'},
 {id:'s_balistico',c:'submarinos',n:'Submarinos lanzamisiles balísticos',d:'Disuasión nuclear (SSBN)'},
 {id:'t_todos',c:'tanques',n:'Todos los carros de combate',d:'El archivo completo, de la Primera Guerra Mundial a hoy'},
 {id:'t_principal',c:'tanques',n:'Carros de combate principales',d:'MBT de la Guerra Fría y actuales'},
 {id:'t_pesado',c:'tanques',n:'Carros pesados',d:'Pesados y superpesados'},
 {id:'t_medio',c:'tanques',n:'Carros medios',d:'Medios y de crucero'},
 {id:'t_ligero',c:'tanques',n:'Carros ligeros y tanquetas',d:'Ligeros, tanquetas, anfibios y de reconocimiento'},
 {id:'t_caza',c:'tanques',n:'Cazacarros y cañones de asalto',d:'Cazacarros, cañones de asalto y lanzamisiles antitanque sobre cadenas o ruedas'},
 {id:'t_proto',c:'tanques',n:'Prototipos y proyectos',d:'Prototipos, carros nunca terminados y proyectos que no pasaron del papel'},
 {id:'minas',c:'buques',n:'Guerra de minas',d:'Cazaminas, dragaminas y minadores'},
 {id:'b_vci',c:'blindados',n:'VCI y transportes blindados',d:'Vehículos de combate de infantería, TOA de cadenas y de ruedas, semiorugas y MRAP'},
 {id:'b_8x8',c:'blindados',n:'Ruedas 8x8',d:'Blindados 8x8 de transporte, combate de infantería y apoyo'},
 {id:'b_recon',c:'blindados',n:'Reconocimiento',d:'Exploración, autoametralladoras y blindados ligeros de ruedas'},
 {id:'b_art',c:'blindados',n:'Artillería autopropulsada y morteros',d:'Obuses y cañones autopropulsados de cadenas y de ruedas, morteros autopropulsados'},
 {id:'b_mlr',c:'blindados',n:'Lanzacohetes múltiples',d:'Lanzacohetes y lanzadores de artillería de cohetes'},
 {id:'b_aa',c:'blindados',n:'Antiaéreos autopropulsados',d:'Cañones antiaéreos y misiles de corto alcance sobre vehículo'},
 {id:'l_camion',c:'logistica',n:'Camiones',d:'Camiones de transporte y tácticos'},
 {id:'l_ligero',c:'logistica',n:'Vehículos ligeros y tácticos',d:'Todoterrenos, vehículos de enlace y tácticos ligeros'},
 {id:'l_cisterna',c:'logistica',n:'Cisternas y reabastecimiento',d:'Camiones cisterna y vehículos de reabastecimiento de combustible'},
 {id:'l_portacarros',c:'logistica',n:'Portacarros',d:'Transportes de carros de combate y cargas pesadas'},
 {id:'l_recup',c:'logistica',n:'Recuperación e ingenieros',d:'Vehículos de recuperación, zapadores, lanzapuentes y desminado'},
 {id:'l_san_blind',c:'logistica',g:'san',n:'Ambulancias blindadas',d:'Vehículos blindados de evacuación y tratamiento médico, de ruedas y de cadenas'},
 {id:'l_san_amb',c:'logistica',g:'san',n:'Ambulancias tácticas y de campaña',d:'Ambulancias todoterreno y camiones sanitarios sin blindaje'},
 {id:'l_san_heli',c:'logistica',g:'san',n:'Helicópteros sanitarios (MEDEVAC)',d:'Versiones de evacuación médica de helicópteros militares'},
 {id:'l_san_avion',c:'logistica',g:'san',n:'Aviones de aeroevacuación médica',d:'Aviones de transporte medicalizados para evacuar heridos y enfermos'},
 {id:'l_san_buque',c:'logistica',g:'san',n:'Buques hospital y con capacidad hospitalaria',d:'Buques hospital, buques de guerra con hospital a bordo y buques hospital civiles'},
 {id:'w_aam',c:'armamento',n:'Misiles aire-aire',d:'Corto, medio y largo alcance'},
 {id:'w_asm',c:'armamento',n:'Misiles aire-superficie',d:'Ataque a tierra lanzados desde aviones y helicópteros, antirradiación'},
 {id:'w_ashm',c:'armamento',n:'Misiles antibuque',d:'Lanzados desde aire, mar y tierra'},
 {id:'w_cm',c:'armamento',n:'Misiles de crucero',d:'Ataque a tierra de largo alcance'},
 {id:'w_sam',c:'armamento',n:'Misiles superficie-aire',d:'Defensa antiaérea y antimisil, portátiles incluidos'},
 {id:'w_atgm',c:'armamento',n:'Misiles antitanque',d:'Misiles guiados contra carros'},
 {id:'w_bm',c:'armamento',n:'Misiles balísticos',d:'Tácticos y de teatro: corto, medio y alcance intermedio'},
 {id:'w_icbm',c:'armamento',n:'Misiles intercontinentales y SLBM',d:'ICBM y misiles balísticos lanzados desde submarinos'},
 {id:'w_bomba',c:'armamento',n:'Bombas',d:'Bombas de aviación convencionales y guiadas'},
 {id:'w_nuclear',c:'armamento',n:'Armas nucleares',d:'Bombas atómicas y termonucleares, cabezas y proyectiles nucleares'},
 {id:'e_lanz',c:'espacio',n:'Lanzadores',d:'Cohetes lanzadores, de la R-7 a Starship y Miura'},
 {id:'e_nave',c:'espacio',n:'Naves y estaciones',d:'Naves tripuladas y de carga, estaciones espaciales, telescopios y vehículos de exploración'},
 {id:'e_sat',c:'espacio',n:'Satélites',d:'Primeros satélites de cada país, satélites españoles, cosmódromos e instalaciones'},
 {id:'e_ag',c:'espacio',n:'Agencias',d:'Agencias y programas espaciales estatales'},
 {id:'e_emp',c:'espacio',n:'Empresas',d:'SpaceX, Starlink, Blue Origin, PLD Space, Hispasat y más'},
 {id:'e_mil',c:'espacio',n:'Espacio militar',d:'Fuerzas espaciales, pruebas antisatélite, navegación por satélite y satélites militares'},
 {id:'e_astro',c:'espacio',n:'Astronautas',d:'Pioneros y primeros astronautas de cada país'}];
var TN={}; TIPOS.forEach(function(t){TN[t.id]=t.n;});
var CN={aviones:'Aviones',helicopteros:'Helicópteros',buques:'Buques',submarinos:'Submarinos',tanques:'Carros de combate',blindados:'Vehículos blindados',logistica:'Logística y Sanidad',armamento:'Armamento',espacio:'Carrera espacial'};
var GROUND={tanques:1,blindados:1,logistica:1};
var ORDER=['us','urss','rusia','imperio_ruso','china','uk','francia','alemania','italia','espana','japon','suecia','multi']; var ORDER_ALL=ORDER.concat(Object.keys(P).filter(function(k){return ORDER.indexOf(k)<0;}));
var ERAS=[['xix','Siglo XIX'],['ww1','Primera Guerra Mundial'],['entre','Entreguerras'],['ww2','Segunda Guerra Mundial'],['fria','Guerra Fría'],['actual','Actualidad']];
var EN={}; ERAS.forEach(function(e){EN[e[0]]=e[1];});
var CATS=[{id:'aviones'},{id:'helicopteros'},{id:'buques'},{id:'submarinos'},{id:'tanques'},{id:'blindados'},{id:'logistica'},{id:'armamento'},{id:'espacio'}];
var app=document.getElementById('app');
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt(n){return n==null?null:Math.round(n).toLocaleString('es-ES');}
function spd(a){ if(a.vel) return fmt(a.vel)+' km/h'+(a.mach&&a.mach>=0.8?' · Mach '+String(a.mach).replace('.',','):''); if(a.mach) return 'Mach '+String(a.mach).replace('.',','); return '—';}
function sortSpeed(a){return a.vel||(a.mach?a.mach*1060:0);}
function crumbs(list){return '<nav class="crumbs" aria-label="Ruta">'+list.map(function(c,i){return (i?'<span class="sep">/</span>':'')+(c[1]?'<a href="'+c[1]+'">'+esc(c[0])+'</a>':'<span>'+esc(c[0])+'</span>');}).join('')+'</nav>';}
function flag(k,cls){var p=P[k];return p?'<img class="'+(cls||'flag')+'" src="'+p.flag+'" alt="" loading="lazy">':'';}
function NAT(l){return l==='Fabricación propia'||l==='Fabricado bajo licencia';}
function pname(a){if(a.orig&&a.orig.length>1&&a.pais!=='multi')return a.orig.map(function(k){return P[k]?P[k].n:k;}).join(' / ');return P[a.pais]?P[a.pais].n:a.pais;}
function stateLbl(a){return a.estado_pais||pname(a);}
function svcL(a){if(a.serv)return 'En servicio';if(a.proto)return 'No entró en servicio';if(a.dev)return 'En desarrollo';if(a.ret&&a.ret!=='—')return 'Retirado';if(a.anio&&a.anio>=new Date().getFullYear()-1)return 'En desarrollo';return 'Fuera de servicio';}
function thumb(a){return a.img?'<img src="'+a.img.th+'" data-fb="'+a.img.src+'" alt="" loading="lazy" decoding="async">':'<div class="nofoto">Sin fotografía libre</div>';}
function row(a){
  var o=CUR&&a.ops[CUR], lab='';
  if(o){ lab=o.l+(o.s?' · '+o.s:''); if(o.l!=='Fabricación propia'&&CUR!=='multi') lab='<span class="org">'+(a.orig&&a.orig.length?a.orig.filter(function(k){return k!==CUR;}).slice(0,2):[a.pais]).map(function(k){return flag(k,'mini');}).join('')+'</span>'+esc(lab); else lab=esc(lab);} else lab=esc(a.estado_pais?a.estado_pais:pname(a));
  var vt=(CURT&&(CURT==='cisterna'||CURT==='awacs'||CURT==='l_cisterna')&&a.tipo!==CURT&&a.alt&&a.alt.indexOf(CURT)>=0)?' <span class="cnt">· versión '+(CURT==='awacs'?'AEW':'cisterna')+'</span>':'';
  if((isSanT(CURT)||CURT==='l_san')&&!isSanT(a.tipo)&&a.sanv&&a.sanv.length) {var sv0=(CUR==='espana'&&a.sanv.filter(function(v){return v.es;})[0])||a.sanv[0]; vt=' <span class="cnt sanv">'+(CURT==='l_san_buque'?'· capacidad hospitalaria: ':'· versión sanitaria: ')+esc(sv0.n)+(a.sanv.length>1?' y otras':'')+'</span>';}
  return '<a class="row" href="#/a/'+a.id+'"><div class="th">'+thumb(a)+'</div><div class="m"><div class="nm">'+esc(a.n)+(isFav(a)?' <span class="favs" aria-label="favorito">★</span>':'')+vt+'</div><div class="ds">'+(a.anio||'—')+' · '+lab+((a.gen||a.dev)?' · <span class="gtag">'+(a.gen?'Gen. '+a.gen.replace('.',','):'')+(a.dev?(a.gen?' · ':'')+'En desarrollo':'')+'</span>':'')+'</div></div><div class="rt">'+((a.cat==='buques'||a.cat==='submarinos')?(a.desp?fmt(a.desp)+' t':'')+(a.kn?'<br>'+String(a.kn).replace('.',',')+' kn':''):(a.cat==='tanques'||a.cat==='blindados')?(a.cal?String(a.cal).replace('.',',')+' mm':'')+(a.peso?'<br>'+String(a.peso).replace('.',',')+' t':''):a.cat==='logistica'?(a.peso?String(a.peso).replace('.',',')+' t':'')+(a.vel?'<br>'+fmt(a.vel)+' km/h':''):a.cat==='armamento'?(a.walc?fmt(a.walc)+' km':'')+(a.wkg?'<br>'+fmt(a.wkg)+' kg':''):(a.vel?fmt(a.vel)+' km/h':(a.mach?'Mach '+String(a.mach).replace('.',','):'')))+'</div></a>';
}
function set(h,title){app.innerHTML=h;document.title=title?title+' · M.A.T':'M.A.T';window.scrollTo(0,0);try{deco();}catch(e){}}
// Favoritos (localStorage 'mat_fav': [{id,c,t}]) + enlaces de variantes con ficha propia
function favGet(){try{var v=JSON.parse(localStorage.getItem('mat_fav')||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
function favKey(a){return (a.cat||'')+':'+a.id;}
function isFav(a){var k=favKey(a);return favGet().some(function(f){return f.c+':'+f.id===k;});}
function favToggle(a){var L=favGet(),k=favKey(a),i=-1;L.forEach(function(f,j){if(f.c+':'+f.id===k)i=j;});if(i>=0)L.splice(i,1);else L.unshift({id:a.id,c:a.cat,t:Date.now()});try{localStorage.setItem('mat_fav',JSON.stringify(L));}catch(e){}return i<0;}
var VCH=null;function vch(id){if(!VCH){VCH={};I.forEach(function(x){if(x.vde){(VCH[x.vde]=VCH[x.vde]||[]).push(x);}});}return VCH[id]||[];}
function deco(){var m=location.hash.match(/^#\/a\/([^?\/]+)/);if(!m)return;var id=decodeURIComponent(m[1]);var a=BY[id]||(D.alias&&D.alias[id]?BY[D.alias[id]]:null);if(!a)return;var tg=app.querySelector('.tags');if(!tg||tg.querySelector('.favb'))return;
  var b=document.createElement('button');b.type='button';b.className='tag favb';
  var paint=function(){var on=isFav(a);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.innerHTML='<span class="st" aria-hidden="true">'+(on?'★':'☆')+'</span><span>'+(on?'En favoritos':'Añadir a favoritos')+'</span>';};
  paint();b.onclick=function(){favToggle(a);paint();};tg.insertBefore(b,tg.firstChild);
  var x='';var rl=a.rol||(a.F&&a.F.tipo);if(rl&&a.vde)x+='<div class="vrol"><span class="lbl">Función</span> <span class="tag on">'+esc(rl)+'</span></div>';
  var p=a.vde&&BY[a.vde];if(p)x+='<div class="vrol"><span class="lbl">'+(a.vdk==='d'?'Derivado de:':'Variante de:')+'</span> <a class="tag" href="#/a/'+p.id+'">'+esc(p.n)+' ›</a></div>';
  var stp=sanT(a);if(stp&&!isSanT(a.tipo)&&a.sanv&&a.sanv.length)x+='<div class="vrol vsan"><span class="lbl">'+(stp==='l_san_buque'?'✚ Capacidad hospitalaria':'✚ Versión sanitaria')+'</span><ul class="bul">'+a.sanv.map(function(v){return '<li><b>'+esc(v.n)+'</b>'+(v.d?': '+esc(v.d):'')+(v.u?' <a class="srcl" href="'+esc(v.u)+'" target="_blank" rel="noopener">Fuente ›</a>':'')+'</li>';}).join('')+'</ul><a class="tag" href="#/logistica/'+stp+'">'+esc(TN[stp])+' ›</a>'+(a.fsec?' <a class="tag" href="'+esc(a.fsec.u)+'" target="_blank" rel="noopener">Fuente ›</a>':'')+'</div>';
  if(isSanT(a.tipo)&&!a.vde)x+='<div class="vrol"><span class="lbl">Sección</span> <a class="tag" href="#/logistica/sanidad">✚ Sanidad ›</a></div>';
  var ch=vch(a.id);if(ch.length)x+='<div class="vrol vfp"><span class="lbl">Variantes con ficha propia</span><div class="tags">'+ch.map(function(c){return '<a class="tag" href="#/a/'+c.id+'">'+esc(c.n)+(c.rol?' · <span>'+esc(c.rol)+'</span>':'')+'</a>';}).join('')+'</div></div>';
  var ok_=window.MAT_ONU_IDS&&window.MAT_ONU_IDS[a.id];if(ok_)x+='<div class="vrol vonu"><span class="lbl">ONU</span> <a class="tag" href="#/onu">'+(ok_==='u'?'Material de la ONU':'En misiones de la ONU')+' ›</a></div>';
  if(x)tg.insertAdjacentHTML('afterend','<div class="vlinks">'+x+'</div>');}
function favPage(){var L=favGet(),G={},n=0;L.forEach(function(f){var a=BY[f.id];if(!a||a.cat!==f.c)return;var tc=(tipoOf(a.tipo)||{}).c||a.cat;(G[tc]=G[tc]||[]).push(a);n++;});
  var h=crumbs([['Inicio','#/'],['Favoritos']])+'<h1>Favoritos</h1>';
  if(!n){h+='<div class="favempty"><p class="st" aria-hidden="true">☆</p><p>Aún no tienes favoritos.</p><p class="sub">Abre cualquier ficha (un avión, un carro de combate, un buque…) y toca «Añadir a favoritos». Aparecerá aquí, ordenada por categoría.</p><p class="sub">Se guardan en este dispositivo.</p><p><a class="tag on" href="#/buscar">Buscar un modelo ›</a></p></div>';return set(h,'Favoritos');}
  h+='<p class="sub">'+n+' <span>'+(n===1?'ficha guardada en este dispositivo':'fichas guardadas en este dispositivo')+'</span></p>';
  Object.keys(CN).forEach(function(c){var g=G[c];if(!g||!g.length)return;h+='<h2><span>'+CN[c]+'</span> <span class="cnt">'+g.length+'</span></h2><div class="list">'+g.map(row).join('')+'</div>';});
  set(h,'Favoritos');}
function catCount(c){return I.filter(function(a){return c==='logistica'?((a.cat===c&&!isSanT(a.tipo))||!!sanT(a)):(a.cat===c&&!isSanT(a.tipo));}).length;}
function pick(c,id){return BY[id]||I.filter(function(a){return a.cat===c&&a.img;})[0];}
function home(){
  var tiles=[['aviones','lockheed-martin-f-22-raptor','cazas, bombarderos, transporte, cisternas, entrenamiento y más'],['helicopteros','boeing-ah-64-apache','ataque, transporte, navales y ligeros']];
  var h='<section class="hero"><p class="mark">M.A.T</p><p>Enciclopedia de material militar: fichas técnicas, historia y fotografía de cada modelo, ordenado por país y época.</p></section>'+(window.MAT_MAPA?'<a class="maptile" href="#/mapa"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><circle cx="24" cy="24" r="19" fill="none" stroke="#8f9a6a" stroke-width="1.6"/><ellipse cx="24" cy="24" rx="8" ry="19" fill="none" stroke="#8f9a6a" stroke-width="1.2"/><path d="M5 24h38M8 14h32M8 34h32" stroke="#8f9a6a" stroke-width="1.1" fill="none"/></svg><div><div class="t">Mapa del mundo</div><div class="d">Globo 3D: toca un país y ve su arsenal; toca dos y se comparan</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+(window.MAT_NOTICIAS?'<a class="newstile" href="#/noticias"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true"><rect x="7" y="9" width="30" height="32" rx="2" fill="none" stroke="#b3bd8c" stroke-width="1.6"/><path d="M37 17h4v20a4 4 0 0 1-4 4" fill="none" stroke="#b3bd8c" stroke-width="1.6"/><path d="M12 16h20M12 22h20M12 28h14M12 34h10" stroke="#8f9a6a" stroke-width="1.4"/></svg><div><div class="t">Geopolítica hoy</div><div class="d">Las 5 noticias de geopolítica más importantes del mundo, cada día</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+(window.MAT_ONU?'<a class="maptile onutile" href="#/onu"><img src="flags/un.png" width="48" height="32" alt="" style="flex:0 0 48px;border-radius:3px"><div><div class="t">ONU · Naciones Unidas</div><div class="d">Helicópteros, aviones y blindados de las misiones de paz, y lo que aporta cada país</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+(window.MAT_EXTERIOR?'<a class="maptile extile" href="#/exterior"><img src="flags/es.png" width="48" height="32" alt="" style="flex:0 0 48px;border-radius:3px"><div><div class="t">España en el exterior</div><div class="d">Dónde están hoy las Fuerzas Armadas fuera de España, cuántos militares y con qué material, en el mapa</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+(window.MAT_FYSE?'<a class="maptile fysetile" href="#/fyse"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><path d="M24 5l15 5v11c0 10-6.5 18-15 22C15.5 39 9 31 9 21V10z" fill="none" stroke="#b3bd8c" stroke-width="1.7" stroke-linejoin="round"/><path d="M24 14l2.6 5.3 5.9.9-4.3 4.1 1 5.8L24 27.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" fill="none" stroke="#d6b25e" stroke-width="1.4" stroke-linejoin="round"/></svg><div><div class="t">Policía Nacional y Guardia Civil</div><div class="d">Solo España: historia, todas sus unidades (UIP, UPR, GEO, GAR, UEI, SEPRONA…) y sus vehículos, helicópteros y embarcaciones</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+(window.MAT_GASTO?'<a class="maptile gastotile" href="#/gasto"><svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><path d="M8 40h32" stroke="#6b7177" stroke-width="1.6"/><rect x="11" y="26" width="6" height="14" fill="none" stroke="#b3bd8c" stroke-width="1.6"/><rect x="21" y="17" width="6" height="23" fill="none" stroke="#b3bd8c" stroke-width="1.6"/><rect x="31" y="9" width="6" height="31" fill="none" stroke="#d6b25e" stroke-width="1.6"/></svg><div><div class="t">Gasto militar por país</div><div class="d">Cuánto gasta cada país en defensa: millones de dólares (y euros), % del PIB y por habitante, según SIPRI y la OTAN</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div></a>':'')+'<div class="cats">';
  tiles.forEach(function(t,i){var f=pick(t[0],t[1]); var n=catCount(t[0]); h+='<a class="cat'+(i===0?' big':'')+'" href="#/'+t[0]+'">'+(f&&f.img?'<img src="'+f.img.src+'" alt="">':'')+'<div class="in"><div class="t">'+CN[t[0]]+'</div><div class="d">'+n+' modelos · '+t[2]+'</div></div></a>';});
  var TP={espacio:['e-saturn-v','lanzadores, naves, satélites, agencias, empresas y espacio militar'],tanques:['t-leopard-2e','de la Primera Guerra Mundial a hoy'],blindados:['b-dragon-vehiculo-blindado','VCI, 8x8, reconocimiento, artillería y lanzacohetes'],buques:['s-spanish-ship-juan-carlos-i','portaaviones, destructores, fragatas…'],submarinos:['s-s-80-plus-class-submarine','convencionales y nucleares'],logistica:['l-uro-vamtac','camiones, cisternas y recuperación · ambulancias, helicópteros sanitarios y buques hospital'],armamento:['w-meteor-missile','misiles, bombas y armas nucleares']};
  h+='<div class="soongrid">'+['tanques','blindados','buques','submarinos','logistica','armamento','espacio'].map(function(c){var n=catCount(c); if(n){var f=pick(c,TP[c][0]); return '<a class="cat" href="#/'+c+'">'+(f&&f.img?'<img src="'+f.img.th+'" alt="">':'')+'<div class="in"><div class="t">'+CN[c]+'</div><div class="d">'+n+' modelos'+(TP[c][1]?' · '+TP[c][1]:'')+'</div></div></a>';} return '<div class="cat soon" aria-disabled="true"><span class="badge">Próximamente</span><div class="in"><div class="t">'+CN[c]+'</div></div></div>';}).join('')+'</div></div>';
  h+='<h2>Accesos</h2><div class="list"><a class="row" href="#/favoritos"><div class="m"><div class="nm"><span class="favs">★</span> <span>Favoritos</span></div><div class="ds">'+(function(){var k=favGet().filter(function(f){return BY[f.id];}).length;return k?k+' <span>'+(k===1?'ficha guardada':'fichas guardadas')+'</span>':'Guarda las fichas que más te gusten';})()+'</div></div><div class="ch">›</div></a><a class="row" href="#/buscar"><div class="m"><div class="nm">Buscar por nombre</div><div class="ds">Todo el archivo</div></div><div class="ch">›</div></a><a class="row" href="#/comparar"><div class="m"><div class="nm">Comparar</div><div class="ds">Ficha técnica lado a lado</div></div><div class="ch">›</div></a>'+(window.MAT_DUELO?'<a class="row" href="#/duelo"><div class="m"><div class="nm">Duelo</div><div class="ds">Simulación lúdica entre dos modelos</div></div><div class="ch">›</div></a>':'')+(window.MAT_MAPA?'<a class="row" href="#/mapa"><div class="m"><div class="nm">Mapa del mundo</div><div class="ds">Globo 3D con países y facciones</div></div><div class="ch">›</div></a>':'')+(window.MAT_ONU?'<a class="row" href="#/onu"><div class="m"><div class="nm">ONU · Naciones Unidas</div><div class="ds">Material de la ONU y de los países en las misiones de paz</div></div><div class="ch">›</div></a>':'')+(window.MAT_FYSE?'<a class="row" href="#/fyse"><div class="m"><div class="nm">Policía Nacional y Guardia Civil</div><div class="ds">Unidades y vehículos, solo España y aparte de las Fuerzas Armadas</div></div><div class="ch">›</div></a>':'')+(window.MAT_GASTO?'<a class="row" href="#/gasto"><div class="m"><div class="nm">Gasto militar por país</div><div class="ds">Ranking por total, % del PIB y por habitante (SIPRI y OTAN)</div></div><div class="ch">›</div></a>':'')+(window.MAT_FUERZAS?'<a class="row" href="#/fuerzas"><div class="m"><div class="nm">Países y facciones</div><div class="ds">España vs Francia, OTAN vs Rusia… unidades en servicio y modelos</div></div><div class="ch">›</div></a>':'')+'</div>';
  set(h);
}
function catPage(c,grp){
  var types=TIPOS.filter(function(t){return t.c===c;});
  if(!types.length) return notfound();
  var LOG=c==='logistica'; grp=LOG?(grp||''):'';
  var h=crumbs(grp?[['Inicio','#/'],[CN[c],'#/'+c],[grp==='san'?'Sanidad':'Logística']]:[['Inicio','#/'],[CN[c]]])+'<h1>'+(grp==='san'?'Sanidad militar':grp==='log'?'Logística':CN[c])+'</h1>';
  if(LOG) h+='<div class="chips sanchips" role="group" aria-label="Grupo"><a class="chip" href="#/logistica" aria-pressed="'+(!grp)+'">Todo</a><a class="chip" href="#/logistica/log" aria-pressed="'+(grp==='log')+'">Logística</a><a class="chip" href="#/logistica/sanidad" aria-pressed="'+(grp==='san')+'">✚ Sanidad</a></div>';
  h+='<p class="sub">'+(grp==='san'?'Ambulancias blindadas y de campaña, helicópteros y aviones de evacuación médica, y buques hospital. Elige un tipo.':'Elige un tipo.')+'</p>';
  function trow(t){var L=I.filter(function(a){return inT(a,t.id);}); var n=L.length; if(!n) return '';
    var s=L.filter(function(a){return a.img;}).sort(function(a,b){return (isSanT(b.tipo)?1:0)-(isSanT(a.tipo)?1:0)||(b.anio||0)-(a.anio||0);}); var pic=s[0];
    return '<a class="row" href="#/'+c+'/'+t.id+'"><div class="th">'+(pic?thumb(pic):'')+'</div><div class="m"><div class="nm">'+t.n+'</div><div class="ds">'+t.d+'</div></div><div class="rt">'+n+'</div><div class="ch">›</div></a>';}
  var A=types.filter(function(t){return t.g!=='san';}), B=types.filter(function(t){return t.g==='san';});
  if(!LOG){h+='<div class="list">'+(c==='espacio'&&window.MAT_ESP_CRONO?'<a class="row" href="#/espacio/cronologia"><div class="th">'+(BY['e-saturn-v']&&BY['e-saturn-v'].img?thumb(BY['e-saturn-v']):'')+'</div><div class="m"><div class="nm">Cronología de la carrera espacial</div><div class="ds">Del Sputnik a hoy: hitos con fecha, filtros por país y década, y cifras</div></div><div class="ch">›</div></a>':'')+types.map(trow).join('')+'</div>'; return set(h,CN[c]);}
  if(grp!=='san') h+=(grp?'':'<h2>Logística</h2>')+'<div class="list">'+A.map(trow).join('')+'</div>';
  if(grp!=='log'&&B.length){ h+=(grp?'':'<h2 class="sanh">✚ Sanidad</h2>')+'<div class="list">'+B.map(trow).join('')+'</div>';
  }
  set(h,grp==='san'?'Sanidad militar':CN[c]);
}
function inT(a,t){return a.tipo===t||(a.alt&&a.alt.indexOf(t)>=0);}
function isSanT(t){return /^l_san_/.test(t||'');}
function opk(a,t,k){return isSanT(t)&&a.sano?a.sano.indexOf(k)>=0&&!!a.ops[k]:!!a.ops[k];}
function sanT(a){if(isSanT(a.tipo))return a.tipo;var x=(a.alt||[]).filter(isSanT);return x[0]||'';}
function sanBlk(F){var r=[['Camillas',F.camillas],['Pacientes sentados',F.pacientes],['Camas',F.camas],['Quirófanos',F.quirofanos],['Personal sanitario',F.personal_san],['Instalaciones médicas',F.instalaciones_med]].filter(function(x){return x[1];});return r.length?'<h2>Capacidad sanitaria</h2><div class="specs">'+r.map(function(x){return sp(x[0],esc(x[1]));}).join('')+'</div>':'';}
function fuenteSec(a){return a.fsec?'<p class="note">Fuente de esta versión: <a href="'+esc(a.fsec.u)+'" target="_blank" rel="noopener">'+esc(a.fsec.t)+'</a></p>':'';}
function tipoOf(id){return TIPOS.filter(function(x){return x.id===id;})[0];}
function paises(tipo){
  var t=tipoOf(tipo); if(!t) return notfound();
  var h=crumbs([['Inicio','#/'],[CN[t.c],'#/'+t.c]].concat(t.g==='san'?[['Sanidad','#/logistica/sanidad']]:[]).concat([[t.n]]))+'<h1>'+t.n+'</h1><p class="sub">Elige un país.'+(t.g==='san'?' Las versiones sanitarias de un modelo base aparecen marcadas.':'')+'</p><div class="list">';
  if(tipo==='caza'){var gN=I.filter(function(a){return inT(a,'caza')&&(a.gen||a.dev);}).length; h+='<a class="row" href="#/'+t.c+'/caza/todos"><div class="m"><div class="nm">Todos los cazas · por generación</div><div class="ds">'+I.filter(function(a){return inT(a,'caza');}).length+' modelos de todos los países · '+gN+' con generación indicada en la fuente</div></div><div class="ch">›</div></a>';}
  if(isSanT(tipo)||t.c==='espacio'){var nT=I.filter(function(a){return inT(a,tipo);}).length; h+='<a class="row" href="#/'+t.c+'/'+tipo+'/todos"><div class="m"><div class="nm">Todos los países</div><div class="ds">'+nT+' modelos</div></div><div class="ch">›</div></a>';}
  var KS=ORDER; if(true){var rest=ORDER_ALL.filter(function(k){return ORDER.indexOf(k)<0;}).map(function(k){return [k,I.filter(function(a){return inT(a,tipo)&&opk(a,tipo,k);}).length];}).filter(function(x){return x[1];}).sort(function(x,y){return y[1]-x[1];}).map(function(x){return x[0];}); KS=ORDER.concat(rest);}
  KS.forEach(function(k){var items=I.filter(function(a){return inT(a,tipo)&&opk(a,tipo,k);}); if(!items.length) return;
    var ys=items.map(function(a){return a.anio;}).filter(Boolean); var r=ys.length?Math.min.apply(null,ys)+'–'+Math.max.apply(null,ys):'';
    h+='<a class="row" href="#/'+t.c+'/'+tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm">'+esc(P[k].n)+'</div><div class="ds">'+items.length+' modelos · '+r+'</div></div><div class="ch">›</div></a>';});
  set(h+'</div>',t.n);
}
var st={era:'',sort:'crono',q:'',orig:'',gen:''}; var CUR='',CURT='';
function lista(tipo,pais){
  var t=tipoOf(tipo); if(pais==='todos'&&t) return listaTodos(t);
  if(!t||!P[pais]) return notfound();
  var all=I.filter(function(a){return inT(a,tipo)&&opk(a,tipo,pais);}); CUR=pais; CURT=tipo;
  var h=crumbs([['Inicio','#/'],[CN[t.c],'#/'+t.c],[t.n,'#/'+t.c+'/'+tipo],[P[pais].n]]);
  h+='<h1 style="display:flex;align-items:center;gap:12px">'+flag(pais)+'<span>'+esc(P[pais].n)+'</span></h1><p class="sub">'+t.n+' · '+all.length+' modelos</p>';
  var np=all.filter(function(a){return NAT(a.ops[pais].l);}).length;
  h+=controls(all)+(pais!=='multi'&&t.c!=='espacio'?'<div class="chips" role="group" aria-label="Origen" style="margin-top:6px"><button class="chip ochip" data-o="" aria-pressed="true">Todos ('+all.length+')</button><button class="chip ochip" data-o="p" aria-pressed="false">Fabricación nacional ('+np+')</button><button class="chip ochip" data-o="i" aria-pressed="false">Importados ('+(all.length-np)+')</button></div>':'')+'<div id="res"></div>';
  set(h,t.n+' · '+P[pais].n); st.orig='';
  bindControls(all,true);
}
function listaTodos(t){
  var all=I.filter(function(a){return inT(a,t.id);}); CUR=''; CURT=t.id;
  var h=crumbs([['Inicio','#/'],[CN[t.c],'#/'+t.c],[t.n,'#/'+t.c+'/'+t.id],['Todos']]);
  h+='<h1>'+t.n+'</h1><p class="sub">Todos los países · '+all.length+' modelos</p>'+controls(all)+'<div id="res"></div>';
  set(h,t.n); st.orig=''; bindControls(all,true);
}
var GENS=[['1','1.ª'],['2','2.ª'],['3','3.ª'],['4','4.ª'],['4.5','4.5'],['5','5.ª'],['6','6.ª'],['dev','En desarrollo']];
function genLbl(a){return a.gen?(a.gen==='4.5'?'Generación 4.5':(a.gen+'.ª generación'))+(a.dev?' · En desarrollo':''):(a.dev?'En desarrollo':'');}
function inEra(a,x){return a.era===x||(!!a.eras&&a.eras.indexOf(x)>=0);}
function genOk(a){return !st.gen||(st.gen==='dev'?a.dev:a.gen===st.gen);}
function controls(all){
  var eras=ERAS.filter(function(e){return all.some(function(a){return inEra(a,e[0]);});});
  var gens=GENS.filter(function(g){return all.some(function(a){return g[0]==='dev'?a.dev:a.gen===g[0];});});
  return '<div class="ctrl"><input class="inp" id="q" type="search" placeholder="Filtrar por nombre" value="'+esc(st.q)+'" autocomplete="off"><select class="sel" id="sort" aria-label="Ordenar"><option value="crono">Orden cronológico</option><option value="vel">Más rápidos primero</option><option value="new">Más recientes primero</option><option value="uni">Más fabricados primero</option></select></div><div class="chips" role="group" aria-label="Época"><button class="chip" data-era="" aria-pressed="'+(!st.era)+'">Todas</button>'+eras.map(function(e){return '<button class="chip" data-era="'+e[0]+'" aria-pressed="'+(st.era===e[0])+'">'+e[1]+'</button>';}).join('')+'</div>'+(gens.length?'<div class="chips" role="group" aria-label="Generación" style="margin-top:6px"><button class="chip gchip" data-g="" aria-pressed="'+(!st.gen)+'">Todas las generaciones</button>'+gens.map(function(g){return '<button class="chip gchip" data-g="'+g[0]+'" aria-pressed="'+(st.gen===g[0])+'">'+(g[0]==='dev'?g[1]:'Gen. '+g[1])+'</button>';}).join('')+'</div><p class="note" style="margin:4px 0 0">Generación solo cuando la fuente la indica expresamente.</p>':'');
}
function bindControls(all,group){
  var q=document.getElementById('q'),so=document.getElementById('sort'),res=document.getElementById('res');
  so.value=st.sort;
  function draw(){
    var s=st.q.trim().toLowerCase().replace(/[-\s]/g,'');
    var L=all.filter(function(a){return (!st.era||inEra(a,st.era))&&genOk(a)&&(!st.orig||!CUR||(NAT(a.ops[CUR].l)===(st.orig==='p')))&&(!s||[a.n].concat(a.k||[]).some(function(x){return String(x).toLowerCase().replace(/[-\s]/g,'').indexOf(s)>=0;}));});
    if(st.sort==='vel') L.sort(function(a,b){return sortSpeed(b)-sortSpeed(a);});
    else if(st.sort==='new') L.sort(function(a,b){return (b.anio||0)-(a.anio||0);});
    else if(st.sort==='uni') L.sort(function(a,b){return (b.uni_n||0)-(a.uni_n||0);});
    else L.sort(function(a,b){return (a.anio||9999)-(b.anio||9999);});
    if(!L.length){res.innerHTML='<p class="empty">Sin resultados.</p>';return;}
    var h='';
    if(group&&st.sort==='crono'){ERAS.concat([[null,'Sin fecha en la fuente']]).forEach(function(e){var g=L.filter(function(a){return e[0]?(st.era?e[0]===st.era:a.era===e[0]):(!st.era&&!a.era);}); if(!g.length) return; h+='<h2>'+e[1]+' <span class="cnt">· '+g.length+'</span></h2><div class="list">'+g.map(row).join('')+'</div>';});}
    else h='<div class="list" style="margin-top:12px">'+L.map(row).join('')+'</div>';
    res.innerHTML=h;
  }
  q.addEventListener('input',function(){st.q=q.value;draw();});
  so.addEventListener('change',function(){st.sort=so.value;draw();});
  Array.prototype.forEach.call(document.querySelectorAll('.chip:not(.ochip):not(.gchip)'),function(c){c.addEventListener('click',function(){st.era=c.getAttribute('data-era');Array.prototype.forEach.call(document.querySelectorAll('.chip:not(.ochip):not(.gchip)'),function(x){x.setAttribute('aria-pressed',String(x===c));});draw();});});
  Array.prototype.forEach.call(document.querySelectorAll('.gchip'),function(c){c.addEventListener('click',function(){st.gen=c.getAttribute('data-g');Array.prototype.forEach.call(document.querySelectorAll('.gchip'),function(x){x.setAttribute('aria-pressed',String(x===c));});draw();});});
  Array.prototype.forEach.call(document.querySelectorAll('.ochip'),function(c){c.addEventListener('click',function(){st.orig=c.getAttribute('data-o');Array.prototype.forEach.call(document.querySelectorAll('.ochip'),function(x){x.setAttribute('aria-pressed',String(x===c));});draw();});});
  draw();
}
function buscar(){ CUR='';
  var h=crumbs([['Inicio','#/'],['Buscar']])+'<h1>Buscar</h1><p class="sub">'+I.length+' modelos de '+Object.keys(P).length+' países y programas.</p>'+controls(I)+'<div id="onuhit"></div><div id="res"></div>';
  set(h,'Buscar'); bindControls(I,false); (function(){var oh=document.getElementById('onuhit'),qq=document.getElementById('q');if(!oh||!qq||!window.MAT_ONU)return;var K=['onu','un','unitednations','nacionesunidas','cascosazules','bluehelmets','peacekeeping','misionesdepaz','unifil','finul','undof','unficyp','minusca','monusco','unmiss','unisfa','minurso','unmik','untso','unmogip'];var f=function(){var s=norm(qq.value),hit=s.length>=2&&K.some(function(k){return k===s||k.indexOf(s)===0;});oh.innerHTML=hit?'<div class="list" style="margin-top:10px"><a class="row" href="#/onu"><div class="th"><img src="flags/un.png" alt="" style="object-fit:contain;background:#4b92db"></div><div class="m"><div class="nm">ONU · Naciones Unidas</div><div class="ds">Sección: material de la ONU y misiones de paz</div></div><div class="ch">›</div></a></div>':'';};qq.addEventListener('input',f);f();})(); var q=document.getElementById('q'); q.placeholder='Nombre, p. ej. Spitfire, MiG-29, Apache'; if(!('ontouchstart' in window)) q.focus();
}
function sp(k,v){return '<div class="sp"><span class="k">'+k+'</span><span class="v">'+(v==null||v===''?'—':v)+'</span></div>';}
function km(n,u){return n?fmt(n)+' '+(u||'km'):null;}
function bl(arr,empty){return arr&&arr.length?'<ul class="bul">'+arr.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'<p class="sub">'+(empty||'—')+'</p>';}
function detalle(id){
  var a=BY[id]||(D.alias&&D.alias[id]?BY[D.alias[id]]:null); if(!a) return notfound(); CUR=''; if(a.lz&&!a._full){app.innerHTML='<p class="sub" style="padding:24px 0">Cargando ficha…</p>'; return ensure([a],function(){if(location.hash.indexOf(id)>=0) detalle(id);});} if(GROUND[a.cat]) return detalleT(a); if(a.cat==='armamento') return detalleW(a); if(a.cat==='espacio') return detalleE(a); if(a.cat==='buques'||a.cat==='submarinos') return detalleS(a);
  var tc=(tipoOf(a.tipo)||{}).c||a.cat; var h=crumbs([['Inicio','#/'],[CN[tc],'#/'+tc],[TN[a.tipo],'#/'+tc+'/'+a.tipo],[a.n]]);
  h+='<div class="dwrap"><div>';
  if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+a.img.src+'" alt="'+esc(a.n)+'"></figure><div class="credit">Foto: <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons / Wikipedia — autor y licencia</a>'+(a.img.var?' · <span class="imgvar">'+esc(a.img.var)+'</span>':'')+'</div>';
  else h+='<figure class="dhero nofig"><div class="nofoto big">Sin fotografía libre</div></figure><div class="credit">No hay una fotografía con licencia libre de este modelo en Wikimedia Commons.</div>';
  h+='</div><div>';
  h+='<div class="kicker">'+esc(TN[a.tipo])+(a.era?' · '+EN[a.era]:'')+'</div><h1>'+esc(a.n)+'</h1>';
  h+='<div class="tags"><span class="tag on">'+flag(a.pais,'')+esc(stateLbl(a))+'</span>'+(a.estado_pais?'<span class="tag">'+esc(pname(a))+'</span>':'')+(a.tags?a.tags.map(function(x){return '<span class="tag">'+esc(x)+'</span>';}).join(''):'')+'<span class="tag">'+svcL(a)+'</span></div>';
  if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
  h+='</div></div>';
  var vel=a.vel?fmt(a.vel)+' km/h':'—'; if(a.mach) vel+=(a.vel?' · ':'')+'Mach '+String(a.mach).replace('.',',');
  if(!a.vel&&a.mach) vel='Mach '+String(a.mach).replace('.',',');
  h+='<h2>Ficha técnica</h2><div class="specs">'+
   sp('Rol',esc(a.rol))+(a.gen||a.dev?sp('Generación',esc(genLbl(a))):'')+sp('Fabricante',esc(a.fab))+sp('País de origen',esc(stateLbl(a)))+sp('Primer vuelo',esc(a.pv))+sp('Entrada en servicio',esc(a.es))+
   sp('Retirada',esc(a.ret))+sp('Unidades fabricadas',esc(a.uni))+sp('Tripulación',esc(a.trip))+sp('Velocidad máxima',vel)+(a.cru?sp('Velocidad de crucero',fmt(a.cru)+' km/h'):'')+
   sp('Alcance',km(a.alc))+sp('Alcance de combate',km(a.radio))+sp('Alcance en ferry',km(a.ferry))+sp('Techo de servicio',a.techo?fmt(a.techo)+' m':null)+
   sp('Peso máximo al despegue',a.mtow?fmt(a.mtow)+' kg':null)+sp('Planta motriz',esc(a.motor||''))+(a.tw?sp('Relación empuje/peso',String(a.tw).replace('.',',')):'')+'</div>';
  var opk=ORDER_ALL.filter(function(k){return a.ops[k]&&k!=='multi';});
  var oph=opk.length?'<div class="list">'+opk.map(function(k){var o=a.ops[k];return '<a class="row" style="min-height:48px" href="#/'+tc+'/'+a.tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm" style="font-size:15px">'+esc(P[k].n)+(o.s?' <span class="cnt">('+esc(o.s)+')</span>':'')+'</div><div class="ds">'+esc(o.l)+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>':'';
  var MS=[['avi','Radar'],['rad','Alcance de detección del radar'],['cap','Capacidad'],['pay','Carga útil'],['fuel','Combustible'],['to','Carrera de despegue'],['ld','Carrera de aterrizaje'],['end','Autonomía'],['sen','Sensores y sistemas de misión']], mi=a.mision||{};
  if(Object.keys(mi).length) h+='<h2>Datos de misión</h2><div class="specs">'+MS.filter(function(m){return mi[m[0]];}).map(function(m){return sp(m[1],esc(mi[m[0]]));}).join('')+'</div><p class="note" style="margin-top:6px">Tal como figuran en la ficha técnica de la fuente (unidades originales y métricas).</p>';
  if(a.cist){var CI=[['comb','Capacidad de combustible'],['trans','Combustible transferible / descarga'],['sis','Sistema de reabastecimiento'],['alc','Alcance'],['var','Versión cisterna']];
    h+='<h2>Datos de cisterna</h2><div class="specs">'+CI.filter(function(m){return a.cist[m[0]]||m[0]!=='var';}).map(function(m){return sp(m[1],esc(a.cist[m[0]]||'—'));}).join('')+'</div><p class="note" style="margin-top:6px">Cifras del artículo de Wikipedia enlazado y de su «List of tanker aircraft». Litros: conversión directa desde galones; desde masa, con densidad Jet A de 0,8 kg/L (aprox.).</p>';}
  h+='<div class="grid2"><div><h2>Armamento</h2>'+bl(a.arm,'Sin armamento según la fuente')+'</div><div><h2>Usuarios</h2><p class="lead" style="margin:0 0 10px">'+esc(a.usu)+'</p>'+(oph?'<div class="cnt" style="margin:8px 0 4px">Países de M.A.T que lo han operado, según la fuente:</div>'+oph:'')+'</div></div>';
  if((a.conf&&a.conf.length)||(a.mis&&a.mis.length)) h+='<div class="grid2"><div><h2>Conflictos</h2>'+bl(a.conf)+'</div><div><h2>Misiones destacadas</h2>'+bl(a.mis)+'</div></div>';
  if(a.gq) h+='<p class="note" style="margin-top:-4px">Generación según la fuente: '+(/^Categoría/.test(a.gq)?esc(a.gq):'«'+esc(a.gq)+'»')+'</p>';
  if(a.vrs&&a.vrs.length) h+='<h2>Variantes</h2><div class="list">'+a.vrs.map(function(v){var t=v.id&&BY[v.id]&&v.id!==a.id; return (t?'<a class="row" href="#/a/'+v.id+'">':'<div class="row vrow">')+(v.es?flag('espana'):'')+'<div class="m"><div class="nm" style="font-size:15px">'+esc(v.n)+(v.es?' <span class="cnt">· España</span>':'')+'</div><div class="ds" style="white-space:normal">'+esc(v.d||'')+'</div></div>'+(t?'<div class="ch">›</div></a>':'</div>');}).join('')+'</div>';
  if(a.cur&&a.cur.length) h+='<h2>Curiosidades</h2>'+bl(a.cur);
  h+='<div class="btns"><a class="btn pri" href="#/comparar?c='+a.cat+'&a='+a.id+'">Comparar con otro</a>'+(window.MAT_DUELO&&window.MAT_DUELO_OK&&['cielo','suelo','mar','sub'].some(function(m){return window.MAT_DUELO_OK(a,m);})?'<a class="btn" href="#/duelo?a='+a.id+'">Duelo</a>':'')+'<a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">'+(/wikipedia\.org/.test(a.src||'')?'Fuente: Wikipedia':'Fuente oficial')+'</a></div>';
  h+='<p class="note">Cifras tomadas del artículo de Wikipedia enlazado (ficha técnica e infobox), convertidas a unidades métricas. «—» = dato no disponible en la fuente.</p>';
  set(h,a.n);
}


function detalleS(a){
  var F=a.F||{}, tc=a.cat, tcc=(tipoOf(a.tipo)||{}).c||tc;
  var h=crumbs([['Inicio','#/'],[CN[tcc],'#/'+tcc]].concat(isSanT(a.tipo)?[['Sanidad','#/logistica/sanidad']]:[]).concat([[TN[a.tipo],'#/'+tcc+'/'+a.tipo],[a.n]]));
  h+='<div class="dwrap"><div>';
  if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+a.img.src+'" alt="'+esc(a.n)+'"></figure><div class="credit">Foto: <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons / Wikipedia — autor y licencia</a>'+(a.img.var?' · <span class="imgvar">'+esc(a.img.var)+'</span>':'')+'</div>';
  else h+='<figure class="dhero nofig"><div class="nofoto big">Sin fotografía libre</div></figure><div class="credit">No hay una fotografía con licencia libre de este modelo en Wikimedia Commons.</div>';
  h+='</div><div>';
  h+='<div class="kicker">'+esc(TN[a.tipo])+(a.era?' · '+EN[a.era]:'')+'</div><h1>'+esc(a.n)+'</h1>'+(a.en&&a.en!==a.n?'<div class="cnt">'+esc(a.en)+'</div>':'');
  h+='<div class="tags"><span class="tag on">'+flag(a.pais,'')+esc(stateLbl(a))+'</span>'+(a.estado_pais?'<span class="tag">'+esc(pname(a))+'</span>':'')+(a.tags?a.tags.map(function(x){return '<span class="tag">'+esc(x)+'</span>';}).join(''):'')+'<span class="tag">'+svcL(a)+'</span></div>';
  if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
  var q=[['Desplazamiento',a.desp?fmt(a.desp)+' t':null],['Eslora',a.eslora?String(a.eslora).replace('.',',')+' m':null],['Velocidad',a.kn?String(a.kn).replace('.',',')+(window.MAT_LANG==='en'?' knots':' nudos'):null],['Tripulación',a.trip_n?fmt(a.trip_n):null]].filter(function(x){return x[1];});
  if(q.length) h+='<div class="kpis">'+q.map(function(x){return '<div><div class="kv">'+esc(x[1])+'</div><div class="kk">'+x[0]+'</div></div>';}).join('')+'</div>';
  h+='</div></div>';
  function blk(title,rows){var r=rows.filter(function(x){return x[1]!=null;}); return '<h2>'+title+'</h2><div class="specs">'+r.map(function(x){return sp(x[0],esc(x[1]||''));}).join('')+'</div>';}
  h+='<div class="grid2"><div><h2>Armamento</h2>'+bl(a.arm,'Sin armamento en la fuente')+(F.blindaje?blk('Protección',[['Blindaje',F.blindaje]]):'')+'</div><div>'+
    blk(a.cat==='submarinos'?'Sensores':'Aeronaves y sensores',(a.cat==='submarinos'?[]:[['Aeronaves embarcadas',F.aeronaves],['Instalaciones aéreas',F.instalaciones_aereas]]).concat([['Sensores',F.sensores],['Guerra electrónica',F.guerra_electronica]]))+'</div></div>';
  h+='<div class="grid2"><div>'+blk('Características',[['Desplazamiento',F.desplazamiento],['Eslora',F.eslora],['Manga',F.manga],['Calado',F.calado],['Tripulación',F.tripulacion]].concat(a.cat==='submarinos'?[['Profundidad',F.profundidad]]:[]))+'</div><div>'+
    blk('Propulsión',[['Propulsión',F.propulsion],['Potencia',F.potencia],['Velocidad',F.velocidad],['Autonomía',F.autonomia],['Resistencia',F.resistencia]])+'</div></div>';
  h+=sanBlk(F);
  h+=blk('Historia',[['Tipo',F.tipo],['Constructores',F.constructores],['Operadores',F.operadores],['Clase anterior',F.predecesora],['Clase posterior',F.sucesora],['Construidos',F.construidos],['En servicio',F.en_servicio],['Coste',F.coste],['Servicio',F.servicio]]);
  var opk=ORDER_ALL.filter(function(k){return a.ops[k];});
  var oph=opk.length?'<div class="list">'+opk.map(function(k){var o=a.ops[k];return '<a class="row" style="min-height:48px" href="#/'+tc+'/'+a.tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm" style="font-size:15px">'+esc(P[k].n)+(o.s?' <span class="cnt">('+esc(o.s)+')</span>':'')+'</div><div class="ds">'+esc(o.l)+(o.t?' · '+esc(o.t):'')+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>':'';
  h+='<div class="grid2"><div><h2>Países que la han operado</h2>'+(oph||'<p class="sub">—</p>')+'</div><div><h2>Conflictos</h2>'+bl(a.conf,'Sin conflictos en la fuente')+'</div></div>';
  if(a.buques&&a.buques.length) h+='<h2>Buques de la clase</h2>'+bl(a.buques);
  if(a.cur&&a.cur.length) h+='<h2>Curiosidades</h2>'+bl(a.cur);
  h+=fuenteSec(a);
  var m=a.cat==='submarinos'?'sub':'mar';
  h+='<div class="btns"><a class="btn pri" href="#/comparar?c='+a.cat+'&a='+a.id+'">Comparar con otro</a>'+(window.MAT_DUELO&&a.dz?'<a class="btn" href="#/duelo?m='+m+'&a='+a.id+'">Duelo</a>':'')+'<a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">'+(/wikipedia\.org/.test(a.src||'')?'Fuente: Wikipedia':'Fuente oficial')+'</a></div>';
  h+=(/wikipedia\.org/.test(a.src||'')?'<p class="note">Datos traducidos del artículo de Wikipedia enlazado (ficha técnica y texto). Conversiones marcadas con «≈». «—» = dato no disponible en la fuente.</p>':'<p class="note">Datos tomados de las fuentes enlazadas (sitios oficiales y Wikipedia). «—» = dato no disponible en la fuente.</p>');
  set('<div class="tk">'+h+'</div>',a.n);
}
function detalleT(a){
  var F=a.F||{}, tc=a.cat, LG=tc==='logistica'||isSanT(a.tipo), tcc=(tipoOf(a.tipo)||{}).c||tc;
  var h=crumbs([['Inicio','#/'],[CN[tcc],'#/'+tcc]].concat(isSanT(a.tipo)?[['Sanidad','#/logistica/sanidad']]:[]).concat([[TN[a.tipo],'#/'+tcc+'/'+a.tipo],[a.n]]));
  h+='<div class="dwrap"><div>';
  if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+a.img.src+'" alt="'+esc(a.n)+'"></figure><div class="credit">Foto: <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons / Wikipedia — autor y licencia</a>'+(a.img.var?' · <span class="imgvar">'+esc(a.img.var)+'</span>':'')+'</div>';
  else h+='<figure class="dhero nofig"><div class="nofoto big">Sin fotografía libre</div></figure><div class="credit">No hay una fotografía con licencia libre de este modelo en Wikimedia Commons.</div>';
  h+='</div><div>';
  h+='<div class="kicker">'+esc(TN[a.tipo])+(a.era?' · '+EN[a.era]:'')+'</div><h1>'+esc(a.n)+'</h1>';
  h+='<div class="tags"><span class="tag on">'+flag(a.pais,'')+esc(stateLbl(a))+'</span>'+(a.estado_pais?'<span class="tag">'+esc(pname(a))+'</span>':'')+(a.ptag?'<span class="tag on">'+esc(a.ptag)+'</span>':'')+'<span class="tag">'+svcL(a)+'</span></div>';
  if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
  var q=[[a.tipo==='b_mlr'?'Calibre (cohete)':'Calibre',a.cal?String(a.cal).replace('.',',')+' mm':null],['Alcance de tiro',a.atir?String(a.atir).replace('.',',')+' km':null],['Peso',a.peso?String(a.peso).replace('.',',')+' t':null],['Velocidad',a.vel?fmt(a.vel)+' km/h':null],['Tripulación',a.trip],['Pasajeros',a.pas]].filter(function(x){return x[1];});
  if(q.length) h+='<div class="kpis">'+q.map(function(x){return '<div><div class="kv">'+esc(x[1])+'</div><div class="kk">'+x[0]+'</div></div>';}).join('')+'</div>';
  h+='</div></div>';
  function blk(title,rows){var r=rows.filter(function(x){return x[1]!=null;}); if(!r.length) return ''; return '<h2>'+title+'</h2><div class="specs">'+r.map(function(x){return sp(x[0],esc(x[1]||''));}).join('')+'</div>';}
  h+='<div class="grid2"><div>'+blk('Armamento',[['Armamento principal',F.arm_principal||(LG?'Sin armamento en la fuente':null)],['Armamento secundario',F.arm_secundario],['Munición',F.municion],F.alcance_tiro?['Alcance de tiro',F.alcance_tiro]:['',null],F.cadencia?['Cadencia de tiro',F.cadencia]:['',null]])+'</div><div>'+
     blk('Protección',[['Blindaje',F.blindaje||(LG?'—':null)],['Protección y supervivencia',F.proteccion]])+'</div></div>';
  h+='<div class="grid2"><div>'+blk('Movilidad',[(F.rodaje||F.configuracion)?['Tren de rodaje',[F.rodaje,F.configuracion].filter(Boolean).join(' · ')]:['',null],['Motor',F.motor],['Potencia',F.potencia],['Potencia/peso',F.potencia_peso||(a.pwc?String(a.pwc).replace('.',',')+' hp/t (calculada: potencia ÷ peso)':'')],['Transmisión',F.transmision],['Suspensión',F.suspension],['Velocidad',F.velocidad],['Autonomía',F.autonomia],['Combustible',F.combustible],['Altura libre al suelo',F.altura_libre],['Dirección',F.direccion],F.anfibio?['Capacidad anfibia',F.anfibio]:['',null]])+'</div><div>'+
     blk('Dimensiones y dotación',[['Peso',F.peso],['Longitud',F.longitud],['Anchura',F.anchura],['Altura',F.altura],['Tripulación',F.tripulacion],F.pasajeros?['Pasajeros',F.pasajeros]:['',null],F.carga_util?['Carga útil',F.carga_util]:['',null]])+
     blk('Sistemas',[['Control de tiro y miras',F.control_tiro],['Visión nocturna',F.vision_nocturna]])+'</div></div>';
  h+=sanBlk(F);
  h+=blk('Historia y producción',[['Tipo',F.tipo],['Origen',F.origen],['Diseño',F.diseno],['Fecha de diseño',F.fecha_diseno],['Fabricante',F.fabricante],['Producción',F.produccion],['Unidades fabricadas',F.unidades],['Coste unitario',F.coste],['En servicio',F.servicio]]);
  var opk=ORDER_ALL.filter(function(k){return a.ops[k];});
  var oph=opk.length?'<div class="list">'+opk.map(function(k){var o=a.ops[k];return '<a class="row" style="min-height:48px" href="#/'+tc+'/'+a.tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm" style="font-size:15px">'+esc(P[k].n)+(o.s?' <span class="cnt">('+esc(o.s)+')</span>':'')+'</div><div class="ds">'+esc(o.l)+(o.t?' · '+esc(o.t):'')+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>':'';
  h+='<div class="grid2"><div><h2>Países que lo han operado</h2>'+(oph||'<p class="sub">—</p>')+'</div><div><h2>Conflictos</h2>'+bl(a.conf,'Sin conflictos en la fuente')+'</div></div>';
  if(a.vars&&a.vars.length) h+='<h2>Variantes</h2>'+bl(a.vars);
  if(a.cur&&a.cur.length) h+='<h2>Curiosidades</h2>'+bl(a.cur);
  h+='<div class="btns"><a class="btn pri" href="#/comparar?c='+tc+'&a='+a.id+'">Comparar con otro</a>'+(window.MAT_DUELO&&(tc==='tanques'||a.dz)?'<a class="btn" href="#/duelo?m=suelo&a='+a.id+'">Duelo</a>':'')+'<a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">'+(/wikipedia\.org/.test(a.src||'')?'Fuente: Wikipedia':'Fuente oficial')+'</a></div>';
  h+=fuenteSec(a)+(/wikipedia\.org/.test(a.src||'')?'<p class="note">Datos traducidos del artículo de Wikipedia enlazado (ficha técnica y texto). Las conversiones a unidades métricas van marcadas con «≈». «—» = dato no disponible en la fuente.</p>':'<p class="note">Datos tomados de las fuentes enlazadas (sitios oficiales y Wikipedia). «—» = dato no disponible en la fuente.</p>');
  set('<div class="tk">'+h+'</div>',a.n);
}
function detalleW(a){
  var F=a.F||{}, tc='armamento';
  var h=crumbs([['Inicio','#/'],[CN[tc],'#/'+tc],[TN[a.tipo],'#/'+tc+'/'+a.tipo],[a.n]]);
  h+='<div class="dwrap"><div>';
  if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+a.img.src+'" alt="'+esc(a.n)+'"></figure><div class="credit">Foto: <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons / Wikipedia — autor y licencia</a>'+(a.img.var?' · <span class="imgvar">'+esc(a.img.var)+'</span>':'')+'</div>';
  else h+='<figure class="dhero nofig"><div class="nofoto big">Sin fotografía libre</div></figure><div class="credit">No hay una fotografía con licencia libre de este modelo en Wikimedia Commons.</div>';
  h+='</div><div>';
  h+='<div class="kicker">'+esc(TN[a.tipo])+(a.era?' · '+EN[a.era]:'')+'</div><h1>'+esc(a.n)+'</h1>';
  h+='<div class="tags"><span class="tag on">'+flag(a.pais,'')+esc(stateLbl(a))+'</span>'+(a.ptag?'<span class="tag on">'+esc(a.ptag)+'</span>':'')+'<span class="tag">'+svcL(a)+'</span></div>';
  if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
  var q=[['Alcance',a.walc?fmt(a.walc)+' km':null],['Peso',a.wkg?fmt(a.wkg)+' kg':null],['Potencia',F.potencia_explosiva&&F.potencia_explosiva.length<40?F.potencia_explosiva:null],['Año',a.anio]].filter(function(x){return x[1];});
  if(q.length) h+='<div class="kpis">'+q.map(function(x){return '<div><div class="kv">'+esc(x[1])+'</div><div class="kk">'+x[0]+'</div></div>';}).join('')+'</div>';
  h+='</div></div>';
  function blk(title,rows){var r=rows.filter(function(x){return x[1];}); if(!r.length) return ''; return '<h2>'+title+'</h2><div class="specs">'+r.map(function(x){return sp(x[0],esc(x[1]));}).join('')+'</div>';}
  h+='<div class="grid2"><div>'+blk('Cabeza de guerra',[['Cabeza',F.cabeza],['Peso de la cabeza',F.peso_cabeza],['Potencia explosiva',F.potencia_explosiva],['Espoleta',F.espoleta]])+blk('Guiado y lanzamiento',[['Guiado',F.guiado],['Plataformas de lanzamiento',F.plataformas]])+'</div><div>'+
     blk('Prestaciones',[['Alcance',F.alcance],['Techo / altitud',F.techo],['Velocidad',F.velocidad],['Propulsión',F.propulsion]])+blk('Dimensiones',[['Peso',F.peso],['Longitud',F.longitud],['Diámetro',F.diametro],['Envergadura',F.envergadura]])+'</div></div>';
  h+=sanBlk(F);
  h+=blk('Historia y producción',[['Tipo',F.tipo],['Origen',F.origen],['Diseño',F.diseno],['Fabricante',F.fabricante],['Producción',F.produccion],['Unidades fabricadas',F.unidades],['Coste unitario',F.coste],['En servicio',F.servicio]]);
  var opk=ORDER_ALL.filter(function(k){return a.ops[k];});
  var oph=opk.length?'<div class="list">'+opk.map(function(k){var o=a.ops[k];return '<a class="row" style="min-height:48px" href="#/'+tc+'/'+a.tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm" style="font-size:15px">'+esc(P[k].n)+(o.s?' <span class="cnt">('+esc(o.s)+')</span>':'')+'</div><div class="ds">'+esc(o.l)+(o.t?' · '+esc(o.t):'')+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>':'';
  h+='<div class="grid2"><div><h2>Países que lo han empleado</h2>'+(oph||'<p class="sub">—</p>')+'</div><div><h2>Conflictos y empleo</h2>'+bl(a.conf,'Sin empleo en combate en la fuente')+'</div></div>';
  if(a.vars&&a.vars.length) h+='<h2>Variantes</h2>'+bl(a.vars);
  if(a.cur&&a.cur.length) h+='<h2>Curiosidades</h2>'+bl(a.cur);
  h+='<div class="btns"><a class="btn pri" href="#/comparar?c=armamento&a='+a.id+'">Comparar con otro</a><a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">'+(/wikipedia\.org/.test(a.src||'')?'Fuente: Wikipedia':'Fuente oficial')+'</a></div>';
  h+='<p class="note">Datos traducidos del artículo de Wikipedia enlazado (ficha técnica y texto). Las conversiones a unidades métricas van marcadas con «≈». «—» = dato no disponible en la fuente. El armamento es enciclopédico: no participa en el Duelo.</p>';
  set('<div class="tk">'+h+'</div>',a.n);
}
function estE(a){if(a.tipo==='e_astro')return '';return {activo:'En servicio / activo',retirado:'Retirado',desarrollo:'En desarrollo',historico:'Hecho histórico'}[a.est]||svcL(a);}
function detalleE(a){
  var tc='espacio', S=a.sp||[], AL={e_lanz:'Primer vuelo',e_nave:'Primer lanzamiento',e_sat:'Lanzamiento',e_ag:'Fundación',e_emp:'Fundación',e_mil:'Año',e_astro:'Nacimiento'};
  var h=crumbs([['Inicio','#/'],[CN[tc],'#/'+tc],[TN[a.tipo],'#/'+tc+'/'+a.tipo],[a.n]]);
  h+='<div class="dwrap"><div>';
  if(a.img) h+='<figure class="dhero" style="margin-bottom:0"><img src="'+a.img.src+'" alt="'+esc(a.n)+'"></figure><div class="credit">Foto: <a href="'+esc(a.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons / Wikipedia — autor y licencia</a>'+(a.img.var?' · <span class="imgvar">'+esc(a.img.var)+'</span>':'')+'</div>';
  else h+='<figure class="dhero nofig"><div class="nofoto big">Sin fotografía libre</div></figure><div class="credit">No hay una fotografía con licencia libre en Wikimedia Commons.</div>';
  h+='</div><div>';
  h+='<div class="kicker">'+esc(TN[a.tipo])+(a.era?' · '+EN[a.era]:'')+'</div><h1>'+esc(a.n)+'</h1>'+(a.sub?'<p class="sub">'+esc(a.sub)+'</p>':'');
  h+='<div class="tags"><span class="tag on">'+flag(a.pais,'')+esc(stateLbl(a))+'</span>'+(estE(a)?'<span class="tag">'+esc(estE(a))+'</span>':'')+'</div>';
  if(a.res) h+='<p class="lead">'+esc(a.res)+'</p>';
  var KL={e_lanz:['Carga a LEO','Altura','Lanzamientos totales'],e_nave:['Tripulación','Masa','Estado'],e_sat:['Masa','Órbita','Estado'],e_ag:['Empleados','Sede','Siglas'],e_emp:['Empleados','Sede','Satélites en órbita'],e_mil:['Fecha','País','Efectivos'],e_astro:['Misiones','Tiempo en el espacio','Nacionalidad']}, SM={}; S.forEach(function(x){SM[x[0]]=x[1];});
  var q=[[AL[a.tipo]||'Año',a.anio]].concat((KL[a.tipo]||[]).map(function(k){var v=SM[k]; return [k,v&&v.length<=22?v:null];})).filter(function(x){return x[1];}).slice(0,4);
  if(q.length) h+='<div class="kpis">'+q.map(function(x){return '<div><div class="kv">'+esc(x[1])+'</div><div class="kk">'+esc(x[0])+'</div></div>';}).join('')+'</div>';
  h+='</div></div>';
  h+='<h2>Ficha técnica</h2>'+(S.length?'<div class="specs">'+S.map(function(x){return sp(esc(x[0]),esc(x[1]));}).join('')+'</div>':'<p class="sub">—</p>');
  if(a.mil&&a.mil.length) h+='<div class="grid2"><div><h2>Historia</h2>'+bl(a.hist)+'</div><div><h2>Uso militar y de defensa</h2>'+bl(a.mil)+'</div></div>'; else h+='<h2>Historia</h2>'+bl(a.hist);
  var opk=ORDER_ALL.filter(function(k){return a.ops[k];});
  if(opk.length) h+='<h2>Países</h2><div class="list">'+opk.map(function(k){var o=a.ops[k];return '<a class="row" style="min-height:48px" href="#/'+tc+'/'+a.tipo+'/'+k+'">'+flag(k)+'<div class="m"><div class="nm" style="font-size:15px">'+esc(P[k].n)+'</div><div class="ds">'+esc(o.l)+(o.t?' · '+esc(o.t):'')+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>';
  if(a.hitos&&a.hitos.length) h+='<h2>En la cronología</h2><div class="list">'+a.hitos.map(function(x){return '<a class="row" style="min-height:48px" href="#/espacio/cronologia?d='+x[0].slice(0,3)+'0"><div class="m"><div class="nm" style="font-size:15px">'+esc(x[1])+'</div><div class="ds">'+esc(x[0].split('-').reverse().join('/'))+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>';
  if(a.cur&&a.cur.length) h+='<h2>Curiosidades</h2>'+bl(a.cur);
  h+='<div class="btns"><a class="btn pri" href="#/espacio/cronologia">Cronología de la carrera espacial</a><a class="btn" href="'+esc(a.src)+'" target="_blank" rel="noopener">Fuente: Wikipedia</a></div>';
  h+='<p class="note">Datos traducidos del artículo de Wikipedia enlazado (ficha técnica y texto). Las cifras que cambian con el tiempo llevan la fecha que da la fuente. «—» = dato no disponible en la fuente. La carrera espacial es enciclopédica: no participa en el Duelo.</p>';
  set('<div class="tk">'+h+'</div>',a.n);
}
function licPage(){var EN=window.MAT_LANG==='en';
  var h='<div class="licpage" data-noi18n><button type="button" class="btn licback" onclick="if(history.length>1)history.back();else location.hash=\'#/\';">‹ '+(EN?'Back':'Volver')+'</button><h1>LICENSE</h1><div class="lictxt"><p>Copyright (c) 2026 José Luis Pérez Rodríguez. Todos los derechos reservados.</p><p>Queda prohibida la reproducción, distribución, comunicación pública, modificación o cualquier otro uso, total o parcial, de este software y de su documentación, por cualquier medio y con cualquier finalidad, sin el permiso previo y por escrito del titular de los derechos de autor.</p></div></div>';
  set(h,'LICENSE');}
(function(){var ll=document.getElementById('liclink'); if(ll&&window.MAT_LANG==='en') ll.textContent='See LICENSE';})();
function options(sel){
  var h='<option value="">Elegir…</option>';
  ORDER_ALL.forEach(function(k){var L=I.filter(function(a){return a.pais===k;}).sort(function(a,b){return a.n.localeCompare(b.n);}); if(!L.length) return;
    h+='<optgroup label="'+esc(P[k].n)+'">'+L.map(function(a){return '<option value="'+a.id+'"'+(a.id===sel?' selected':'')+'>'+esc(a.n)+'</option>';}).join('')+'</optgroup>';});
  return h;
}
function qs(){var h=location.hash,i=h.indexOf('?'),o={}; if(i<0) return o; h.slice(i+1).split('&').forEach(function(p){var kv=p.split('=');o[kv[0]]=decodeURIComponent(kv[1]||'');}); return o;}

function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');}
function keysOf(a){if(a._k) return a._k; var n=a.n, v=[n, n.replace(/\/[A-Z]+(?=-)/g,''), n.replace(/[A-Z]+\//g,'')].concat(a.k||[]); a._k=v.map(norm).join('|'); return a._k;}
var CATSEL=[['aviones','Aviones'],['helicopteros','Helicópteros'],['tanques','Carros de combate'],['blindados','Blindados'],['buques','Buques'],['submarinos','Submarinos'],['logistica','Logística'],['armamento','Armamento']];
function catOf(a){return a?a.cat:'';}
function recent(){try{return JSON.parse(localStorage.getItem('mat_recent')||'[]');}catch(e){return [];}}
function addRecent(id){try{var L=recent().filter(function(x){return x!==id;}); L.unshift(id); localStorage.setItem('mat_recent',JSON.stringify(L.slice(0,12)));}catch(e){}}
function openPicker(filter,title,onPick){
  var ov=document.createElement('div'); ov.className='pkov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label',title);
  ov.innerHTML='<div class="pkhd"><input class="inp" id="pkq" type="search" placeholder="Escribe: F-18, Leopard, Apache…" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn" id="pkx" aria-label="Cerrar">Cerrar</button></div><div class="pkbd" id="pkl"></div>';
  document.body.appendChild(ov); document.body.style.overflow='hidden';
  var L=I.filter(filter), qi=ov.querySelector('#pkq'), box=ov.querySelector('#pkl');
  function close(){document.body.style.overflow=''; ov.remove(); window.removeEventListener('hashchange',close);}
  window.addEventListener('hashchange',close);
  function it(a){return '<button class="row pkrow" data-id="'+a.id+'"><div class="th">'+thumb(a)+'</div><div class="m"><div class="nm">'+esc(a.n)+'</div><div class="ds">'+flag(a.pais,'mini')+esc(stateLbl(a))+' · '+(a.anio||'—')+'</div></div></button>';}
  function draw(){
    var s=norm(qi.value), R;
    if(s){R=L.filter(function(a){return keysOf(a).indexOf(s)>=0;}); R.sort(function(x,y){var px=keysOf(x).indexOf(s),py=keysOf(y).indexOf(s); return (px?1:0)-(py?1:0)||x.n.length-y.n.length;}); box.innerHTML=R.length?'<div class="cnt" style="padding:8px 4px">'+R.length+' resultados</div><div class="list">'+R.slice(0,80).map(it).join('')+'</div>':'<p class="empty">Sin resultados para «'+esc(qi.value)+'».</p>';}
    else { var h=''; var RC=recent().map(function(id){return BY[id];}).filter(function(a){return a&&filter(a);}); if(RC.length) h+='<h2 style="margin-top:12px">Recientes</h2><div class="list">'+RC.map(it).join('')+'</div>'; ORDER_ALL.forEach(function(k){var g=L.filter(function(a){return a.pais===k;}).sort(function(x,y){return x.n.localeCompare(y.n);}); if(!g.length) return; h+='<h2 style="margin-top:18px">'+flag(k,'mini')+esc(P[k].n)+' <span class="cnt">· '+g.length+'</span></h2><div class="list">'+g.map(it).join('')+'</div>';}); box.innerHTML=h; }
  }
  qi.addEventListener('input',draw);
  box.addEventListener('click',function(e){var b=e.target.closest('.pkrow'); if(b){var id=b.getAttribute('data-id'); addRecent(id); close(); onPick(id);}});
  ov.querySelector('#pkx').addEventListener('click',close);
  ov.addEventListener('keydown',function(e){if(e.key==='Escape') close();});
  draw(); setTimeout(function(){qi.focus();},30);
}
function pickBtn(k,a,label){return '<div class="pick"><button class="btn pkbtn" data-k="'+k+'">'+(a?esc(a.n):label)+'<span class="cnt" style="margin-left:6px">'+(a?'cambiar':'')+'</span></button>'+(a?'<a href="#/a/'+a.id+'">'+(a.img?'<img src="'+a.img.th+'" data-fb="'+a.img.src+'" alt="">':'')+'</a>':'')+'</div>';}
function catChips(cur,base,extra){return '<div class="chips" role="group" aria-label="Categoría">'+CATSEL.map(function(c){var n=catCount(c[0]); return '<button class="chip catc" data-c="'+c[0]+'" aria-pressed="'+(c[0]===cur)+'"'+(n?'':' disabled')+'>'+c[1]+(n?'':' · próximamente')+'</button>';}).join('')+'</div>';}
function hashFor(base,o){return base+'?'+Object.keys(o).filter(function(k){return o[k];}).map(function(k){return k+'='+encodeURIComponent(o[k]);}).join('&');}
function comparar(){
  var o=qs(),A=BY[o.a],B=BY[o.b], C=o.c||catOf(A)||catOf(B)||'';
  if(A&&A.cat!==C) A=null; if(B&&B.cat!==C) B=null;
  if((A&&A.lz&&!A._full)||(B&&B.lz&&!B._full)){app.innerHTML='<p class="sub" style="padding:24px 0">Cargando fichas…</p>'; return ensure([A,B],comparar);}
  var h=crumbs([['Inicio','#/'],['Comparar']])+'<h1>Comparar</h1><p class="sub">'+(C?'Dos modelos de '+CN[C].toLowerCase()+', ficha contra ficha.':'Primero elige la categoría.')+'</p>'+(window.MAT_FUERZAS?'<p class="note" style="margin:-4px 0 10px"><a href="#/fuerzas">¿Países o alianzas? Compara España vs Francia, OTAN vs Rusia… ›</a></p>':'')+catChips(C);
  if(C){
    h+='<div class="cmp" style="margin-top:12px">'+pickBtn('a',A,'Elegir modelo A')+pickBtn('b',B,'Elegir modelo B')+'</div>';
    if(A&&B){
      var rows;
      if(GROUND[C]){var G=function(x,k){return (x.F||{})[k]||'—';};
        rows=[['País',stateLbl(A),stateLbl(B)],['Tipo',TN[A.tipo],TN[B.tipo]],['Año',A.anio||'—',B.anio||'—',A.anio,B.anio],
         ['Calibre principal',A.cal?A.cal+' mm':'—',B.cal?B.cal+' mm':'—',A.cal,B.cal],['Armamento principal',G(A,'arm_principal'),G(B,'arm_principal')],['Armamento secundario',G(A,'arm_secundario'),G(B,'arm_secundario')],
         ['Blindaje máx. (cifra en la ficha)',A.blind?A.blind+' mm':'—',B.blind?B.blind+' mm':'—',A.blind,B.blind],['Blindaje',G(A,'blindaje'),G(B,'blindaje')],
         ['Peso',A.peso?String(A.peso).replace('.',',')+' t':'—',B.peso?String(B.peso).replace('.',',')+' t':'—'],['Potencia',A.pot?fmt(A.pot)+' hp':'—',B.pot?fmt(B.pot)+' hp':'—',A.pot,B.pot],
         ['Potencia/peso',(A.pw||A.pwc)?String(A.pw||A.pwc).replace('.',',')+' hp/t':'—',(B.pw||B.pwc)?String(B.pw||B.pwc).replace('.',',')+' hp/t':'—',A.pw||A.pwc,B.pw||B.pwc],
         ['Velocidad máx.',A.vel?fmt(A.vel)+' km/h':'—',B.vel?fmt(B.vel)+' km/h':'—',A.vel,B.vel],['Autonomía',km(A.alc)||'—',km(B.alc)||'—',A.alc,B.alc],
         ['Tripulación',A.trip||'—',B.trip||'—'],['Unidades',G(A,'unidades'),G(B,'unidades'),A.uni_n,B.uni_n],['Control de tiro',G(A,'control_tiro'),G(B,'control_tiro')]];
        if(C!=='tanques'){rows.splice(3,0,['Tren de rodaje',[(A.F||{}).rodaje,(A.F||{}).configuracion].filter(Boolean).join(' · ')||'—',[(B.F||{}).rodaje,(B.F||{}).configuracion].filter(Boolean).join(' · ')||'—']); rows.push(['Pasajeros',A.pas||'—',B.pas||'—',A.pas,B.pas],['Carga útil',G(A,'carga_util'),G(B,'carga_util')],['Alcance de tiro',A.atir?String(A.atir).replace('.',',')+' km':'—',B.atir?String(B.atir).replace('.',',')+' km':'—',A.atir,B.atir]);}
      } else if(C==='armamento'){var G=function(x,k){return (x.F||{})[k]||'—';};
        rows=[['País',stateLbl(A),stateLbl(B)],['Tipo',TN[A.tipo],TN[B.tipo]],['Año',A.anio||'—',B.anio||'—'],['Alcance máx.',A.walc?fmt(A.walc)+' km':'—',B.walc?fmt(B.walc)+' km':'—',A.walc,B.walc],['Alcance',G(A,'alcance'),G(B,'alcance')],['Velocidad',G(A,'velocidad'),G(B,'velocidad')],['Peso',A.wkg?fmt(A.wkg)+' kg':'—',B.wkg?fmt(B.wkg)+' kg':'—',A.wkg,B.wkg],['Longitud',G(A,'longitud'),G(B,'longitud')],['Cabeza de guerra',G(A,'cabeza'),G(B,'cabeza')],['Potencia explosiva',G(A,'potencia_explosiva'),G(B,'potencia_explosiva')],['Guiado',G(A,'guiado'),G(B,'guiado')],['Propulsión',G(A,'propulsion'),G(B,'propulsion')],['Plataformas',G(A,'plataformas'),G(B,'plataformas')],['Unidades',G(A,'unidades'),G(B,'unidades'),A.uni_n,B.uni_n]];
      } else if(C==='buques'||C==='submarinos'){var G=function(x,k){return (x.F||{})[k]||'—';};
        rows=[['País',stateLbl(A),stateLbl(B)],['Tipo',TN[A.tipo],TN[B.tipo]],['Año',A.anio||'—',B.anio||'—',A.anio,B.anio],
         ['Desplazamiento máx.',A.desp?fmt(A.desp)+' t':'—',B.desp?fmt(B.desp)+' t':'—',A.desp,B.desp],['Eslora',A.eslora?String(A.eslora).replace('.',',')+' m':'—',B.eslora?String(B.eslora).replace('.',',')+' m':'—',A.eslora,B.eslora],
         ['Velocidad máx.',A.kn?String(A.kn).replace('.',',')+(window.MAT_LANG==='en'?' knots':' nudos'):'—',B.kn?String(B.kn).replace('.',',')+(window.MAT_LANG==='en'?' knots':' nudos'):'—',A.kn,B.kn],['Tripulación',A.trip_n||'—',B.trip_n||'—'],
         ['Propulsión',G(A,'propulsion'),G(B,'propulsion')],['Armamento',(A.arm||[]).join(' · ')||'—',(B.arm||[]).join(' · ')||'—'],
         ['Aeronaves',G(A,'aeronaves'),G(B,'aeronaves')],['Sensores',G(A,'sensores'),G(B,'sensores')],['Construidos',G(A,'construidos'),G(B,'construidos'),A.uni_n,B.uni_n]];
      } else {
        rows=[['País',stateLbl(A),stateLbl(B)],['Época',EN[A.era]||'—',EN[B.era]||'—'],['Entrada en servicio',A.es,B.es],
        ['Velocidad máx.',spd(A),spd(B),sortSpeed(A),sortSpeed(B)],['Alcance',km(A.alc)||'—',km(B.alc)||'—',A.alc,B.alc],
        ['Techo',A.techo?fmt(A.techo)+' m':'—',B.techo?fmt(B.techo)+' m':'—',A.techo,B.techo],['Empuje/peso',A.tw||'—',B.tw||'—',A.tw,B.tw],
        ['Peso máx. despegue',A.mtow?fmt(A.mtow)+' kg':'—',B.mtow?fmt(B.mtow)+' kg':'—'],['Unidades',A.uni,B.uni,A.uni_n,B.uni_n],['Tripulación',A.trip,B.trip],['Rol',A.rol,B.rol]];
      }
      h+='<table class="ctab"><tbody>'+rows.map(function(r){var wa=r[3]!=null&&r[4]!=null&&r[3]>r[4],wb=r[3]!=null&&r[4]!=null&&r[4]>r[3];
        return '<tr><th colspan="2">'+r[0]+'</th></tr><tr><td class="'+(wa?'w':'')+'">'+esc(r[1]||'—')+'</td><td class="'+(wb?'w':'')+'">'+esc(r[2]||'—')+'</td></tr>';}).join('')+'</tbody></table>';
      h+='<p class="note">En verde el valor mayor. Datos de las fichas de Wikipedia enlazadas en cada modelo.</p>';
    }
  }
  set(h,'Comparar');
  Array.prototype.forEach.call(document.querySelectorAll('.catc'),function(b){b.addEventListener('click',function(){if(b.disabled) return; location.hash=hashFor('#/comparar',{c:b.getAttribute('data-c')});});});
  Array.prototype.forEach.call(document.querySelectorAll('.pkbtn'),function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-k');
    openPicker(function(x){return x.cat===C;},'Elegir '+CN[C].toLowerCase(),function(id){var o=qs();o.c=C;o[k]=id;location.hash=hashFor('#/comparar',o);});});});
}

function cover(){
  var f=BY['t-leopard-2e']||pick('tanques'); 
  var ov=document.createElement('div'); ov.className='cover'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','M.A.T');
  ov.innerHTML=(f&&f.img?'<img class="cvbg" src="'+f.img.src+'" alt="">':'')+'<div class="cvsh"></div><div class="cvin"><div class="cvmark">M.A.T</div><div class="cvsub">Enciclopedia de material militar</div><button class="cvbtn" id="cvgo">M.A.T</button><div class="cvfoot">Aviones · Helicópteros · Carros de combate · Blindados · Buques · Submarinos · Logística y Sanidad · Armamento · Carrera espacial · ONU · España en el exterior</div></div>';
  document.body.appendChild(ov); document.body.style.overflow='hidden';
  home();
  var b=ov.querySelector('#cvgo'); setTimeout(function(){try{b.focus({preventScroll:true});}catch(e){}},50);
  b.addEventListener('click',function(){try{sessionStorage.setItem('mat_in','1');}catch(e){} ov.classList.add('out'); document.body.style.overflow=''; setTimeout(function(){ov.remove();},650);});
}
function seen(){try{return sessionStorage.getItem('mat_in')==='1';}catch(e){return true;}}
function notfound(){set(crumbs([['Inicio','#/']])+'<h1>No encontrado</h1><p class="sub"><a href="#/">Volver al inicio</a></p>');}
var FIRST=!(location.hash&&location.hash.length>2);
function route(){
  var h=location.hash.replace(/^#\/?/,''),path=h.split('?')[0],p=path.split('/').filter(Boolean);
  if(!p.length){ if(!seen()&&!document.querySelector('.cover')&&FIRST) {FIRST=false; return cover();} return home(); }
  FIRST=false;
  if(p[0]==='aviones'&&p[1]==='vigilancia'){location.replace('#/aviones/patrulla'+(p[2]?'/'+p[2]:''));return;}
  if(p[0]==='aviones'&&p[1]==='helicoptero'){location.replace('#/helicopteros'+(p[2]?'/h_transporte/'+p[2]:''));return;}
  if(p[0]==='sanidad'){location.replace('#/logistica/sanidad');return;}
  if(p[0]==='logistica'&&p.length===2&&(p[1]==='sanidad'||p[1]==='log')){st.era='';st.q='';st.gen='';return catPage('logistica',p[1]==='sanidad'?'san':'log');}
  if(p[0]==='espacio'&&p[1]==='cronologia'&&window.MAT_ESP_CRONO) return window.MAT_ESP_CRONO(app,{P:P,BY:BY,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag});
  if(CN[p[0]]){ if(p.length===1) return catPage(p[0]); if(p.length===2){st.era='';st.q='';st.gen='';return paises(p[1]);} return lista(p[1],p[2]);}
  if(p[0]==='a') return detalle(p[1]);
  if(p[0]==='license') return licPage();
  if(p[0]==='favoritos') return favPage();
  if(p[0]==='buscar'){st.era='';return buscar();}
  if(p[0]==='comparar') return comparar();
  if(p[0]==='fuerzas'&&window.MAT_FUERZAS) return window.MAT_FUERZAS(app,{I:I,BY:BY,P:P,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag,norm:norm,hashFor:hashFor,ensure:ensure,TIPOS:TIPOS,CN:CN});
  if(p[0]==='onu'&&window.MAT_ONU) return window.MAT_ONU(app,{I:I,BY:BY,P:P,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag,thumb:thumb,isFav:isFav});
  if(p[0]==='fyse'&&window.MAT_FYSE) return window.MAT_FYSE(app,{set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag});
  if(p[0]==='gasto'&&window.MAT_GASTO) return window.MAT_GASTO.route(app,{set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag});
  if(p[0]==='exterior'&&window.MAT_EXTERIOR) return window.MAT_EXTERIOR(app,{I:I,BY:BY,P:P,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag,thumb:thumb,isFav:isFav});
  if(p[0]==='noticias'&&window.MAT_NOTICIAS) return window.MAT_NOTICIAS(app,{P:P,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag});
  if(p[0]==='mapa'&&window.MAT_MAPA) return window.MAT_MAPA(app,{I:I,BY:BY,P:P,set:set,crumbs:crumbs,qs:qs,esc:esc,flag:flag});
  if(p[0]==='duelo'&&window.MAT_DUELO) return window.MAT_DUELO(app,{I:I,BY:BY,P:P,set:set,crumbs:crumbs,options:options,qs:qs,esc:esc,fmt:fmt,EN:EN,openPicker:openPicker,pickBtn:pickBtn,hashFor:hashFor,ensure:ensure});
  notfound();
}
document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'){var fb=t.getAttribute('data-fb');if(fb&&t.src!==fb){t.removeAttribute('data-fb');t.src=fb;}else{t.style.visibility='hidden';}}},true);
window.addEventListener('hashchange',route); route();
})();
