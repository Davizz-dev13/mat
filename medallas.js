/* M.A.T · Medallas y rangos (Jose, 9 nov 2026: «tipo Call of Duty», sin servidor ni cuentas).
   Todo se guarda en este dispositivo (localStorage «mat_med» y «mat_med_s»). El «código de progreso» lo pasa a otro dispositivo.
   Los juegos solo avisan al terminar con una línea:  window.MAT_MED&&MAT_MED.event('nombre',{datos})  — este archivo no cambia
   ninguna regla, tiempo, dificultad ni azar de ningún juego. Las secciones se observan por la ruta (#/…), sin tocar su código.
   Rangos: empleos del Ejército de Tierra, de Soldado a General de Ejército (es.wikipedia «Escalafón militar de España»).
   Divisas y medallas: dibujos SVG genéricos (barras, galones, estrellas), no copias de condecoraciones reales. */
(function(){
"use strict";
if(window.MAT_MED) return;
var KEY='mat_med', SKEY='mat_med_s', VER=1;
function EN(){ return window.MAT_LANG==='en'; }
function L(es,en){ return EN()?en:es; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function nf(n){ try{ return Math.round(n).toLocaleString(EN()?'en-GB':'es-ES'); }catch(e){ return String(Math.round(n)); } }
function today(d){ d=d||new Date(); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2); }
function dayN(s){ var p=String(s).split('-'); return Math.round(Date.UTC(+p[0],+p[1]-1,+p[2])/864e5); }

/* ---------- Rangos (orden de es.wikipedia «Escalafón militar de España», Ejército de Tierra) ---------- */
var RANKS=[['Soldado','Private',0],['Soldado de primera','Private First Class',40],['Cabo','Corporal',120],['Cabo primero','Senior Corporal',250],['Cabo mayor','Master Corporal',450],
 ['Sargento','Sergeant',750],['Sargento primero','Staff Sergeant',1150],['Brigada','Sergeant First Class',1700],['Subteniente','Warrant Officer',2400],['Suboficial mayor','Chief Warrant Officer',3300],
 ['Alférez','Second Lieutenant',4500],['Teniente','Lieutenant',6000],['Capitán','Captain',8000],['Comandante','Major',10500],['Teniente coronel','Lieutenant Colonel',13500],['Coronel','Colonel',17500],
 ['General de brigada','Brigadier General',22500],['General de división','Major General',29000],['Teniente general','Lieutenant General',37000],['General de Ejército','General',47000]];
function rankOf(xp){ var i=0; while(i+1<RANKS.length&&xp>=RANKS[i+1][2]) i++; return i; }
function rname(i){ return EN()?RANKS[i][1]:RANKS[i][0]; }
function star(cx,cy,r,fill){ var p=[]; for(var k=0;k<10;k++){ var a=-Math.PI/2+k*Math.PI/5, rr=k%2?r*0.42:r; p.push((cx+rr*Math.cos(a)).toFixed(2)+','+(cy+rr*Math.sin(a)).toFixed(2)); } return '<polygon points="'+p.join(' ')+'" fill="'+fill+'"/>'; }
/* Divisa genérica: tropa = galones rojos; suboficiales = barras doradas; oficiales = estrellas; jefes = estrellas y barra; generales = estrellas sobre rojo. */
function insignia(i,sz){ sz=sz||28; var G='#e3b648', R='#c8452e', bg='#1c2117', bd='#5d6648', h='';
 var gen=i>=16; if(gen){ bg='#5a1a14'; bd=G; }
 h+='<path d="M6 4h28v20c0 7-6.5 11.5-14 14C12.5 35.5 6 31 6 24z" fill="'+bg+'" stroke="'+bd+'" stroke-width="2"/>';
 function chev(n,col){ var s=''; for(var k=0;k<n;k++){ var y=11+k*6; s+='<path d="M11 '+(y+5)+'L20 '+y+'L29 '+(y+5)+'" fill="none" stroke="'+col+'" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>'; } return s; }
 function bars(n,y0){ var s=''; for(var k=0;k<n;k++){ s+='<rect x="11" y="'+(y0+k*6)+'" width="18" height="3.6" rx="1" fill="'+G+'"/>'; } return s; }
 function stars(n,y,r,col){ var s='', w=n>3?7.4:8.6, x0=20-(n-1)*w/2; for(var k=0;k<n;k++) s+=star(x0+k*w,y,r,col||G); return s; }
 if(i===0) h+='<circle cx="20" cy="18" r="3" fill="none" stroke="#9aa384" stroke-width="2"/>';
 else if(i<=3) h+=chev(i,R);
 else if(i===4) h+='<rect x="11" y="9" width="18" height="3" rx="1" fill="'+G+'"/>'+chev(3,R).replace(/ (\d+)L20 (\d+)L29 (\d+)"/g,function(m,a,b,c){ return ' '+(+a+4)+'L20 '+(+b+4)+'L29 '+(+c+4)+'"'; });
 else if(i<=7) h+=bars(i-4,i===5?16:i===6?13:10);
 else if(i===8) h+=star(20,12,4.6,G)+bars(1,20);
 else if(i===9) h+=star(20,11,4.6,G)+bars(2,18);
 else if(i<=12) h+=stars(i-9,18,4.4);
 else if(i<=15) h+=stars(i-12,15,4.2)+'<rect x="10" y="24" width="20" height="3.4" rx="1" fill="'+G+'"/>';
 else h+=stars(i-15,18,i>=19?3.6:4.2,G);
 return '<svg class="mmins" viewBox="0 0 40 40" width="'+sz+'" height="'+sz+'" aria-hidden="true">'+h+'</svg>'; }

/* ---------- Secciones y medallas ---------- */
/* glifos sencillos (24×24) */
var GL={
 cb:'<path d="M4 18l6-6 3 3 7-9" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 6h5v5" fill="none" stroke-width="2.4" stroke-linecap="round"/>',
 ad:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" fill="none" stroke-width="2.2" stroke-linejoin="round"/><path d="M8.5 12h7" stroke-width="2.2"/>',
 du:'<path d="M3 8h12M11 4l4 4-4 4M21 16H9M13 12l-4 4 4 4" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
 ng:'<path d="M4 5h16v10H10l-5 4v-4H4z" fill="none" stroke-width="2.2" stroke-linejoin="round"/>',
 fr:'<circle cx="12" cy="12" r="7.5" fill="none" stroke-width="2"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6" stroke-width="2"/>',
 sb:'<path d="M3 14c0-2.5 4-4 9-4s9 1.5 9 4-4 4-9 4-9-1.5-9-4z" fill="none" stroke-width="2"/><path d="M10 10V7h4v3" fill="none" stroke-width="2"/>',
 nu:'<circle cx="12" cy="12" r="3" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="8" fill="none" stroke-width="1.6" stroke-dasharray="3 2.4"/>',
 md:'<path d="M2 13h5l2-5 3 10 3-7 2 2h5" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
 rt:'<circle cx="12" cy="12" r="8" fill="none" stroke-width="2"/><circle cx="12" cy="12" r="3.5" fill="none" stroke-width="2"/>',
 sa:'<path d="M5 14c0-4.5 3-8 7-8s7 3.5 7 8H5zM3 14h18" fill="none" stroke-width="2.2" stroke-linejoin="round"/>',
 fi:'<path d="M6 3h9l4 4v14H6z" fill="none" stroke-width="2" stroke-linejoin="round"/><path d="M9 11h7M9 15h7" stroke-width="2"/>',
 pa:'<circle cx="12" cy="12" r="8.5" fill="none" stroke-width="2"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" fill="none" stroke-width="1.6"/>',
 nw:'<path d="M4 5h13v14H6a2 2 0 0 1-2-2zM17 9h3v8a2 2 0 0 1-2 2" fill="none" stroke-width="2" stroke-linejoin="round"/><path d="M7 9h7M7 13h7" stroke-width="1.8"/>',
 ra:'<path d="M12 3l1.6 6.5L21 12l-7.4 1.3L12 21l-1.6-7.7L3 12l7.4-2.5z" fill="none" stroke-width="1.8" stroke-linejoin="round"/>',
 hi:'<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" fill="none" stroke-width="2" stroke-linejoin="round"/><path d="M12 6v14" stroke-width="1.8"/>',
 co:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="none" stroke-width="2" stroke-linejoin="round"/>'};
/* [id, ES, EN, cinta (3 colores genéricos), forma] */
var SEC=[['cb','Combate','Fight',['#3d4a2c','#9a3b2a','#3d4a2c'],'c'],['ad','Antidisturbios','Riot control',['#1f3a5f','#d7d2c4','#1f3a5f'],'c'],['du','Duelo','Duel',['#5a5f66','#c79a3a','#5a5f66'],'c'],
 ['ng','Negociador','Negotiator',['#2c4f63','#e3e0d6','#2c4f63'],'c'],['fr','Francotirador','Sniper',['#4a5233','#1d1f17','#4a5233'],'c'],['sb','Submarino','Submarine',['#13304a','#6a8fae','#13304a'],'c'],
 ['nu','Guerra nuclear','Nuclear war',['#3b3b3b','#e0b73c','#3b3b3b'],'c'],['md','Médico de Combate','Combat Medic',['#2f5d3a','#e6e6e6','#2f5d3a'],'c'],['rt','Reto M.A.T','M.A.T Challenge',['#5b4320','#d6b25e','#5b4320'],'c'],
 ['sa','Crea tu soldado y Armero','Soldier and Gunsmith',['#4b3a2a','#8e7d5c','#4b3a2a'],'c'],['fi','Fichas y modelos 3D','Data sheets and 3D models',['#2b3340','#b3bd8c','#2b3340'],'h'],['pa','Países, mapa y geopolítica','Countries, map and geopolitics',['#24402f','#c8c38e','#24402f'],'h'],
 ['nw','Noticias','News',['#40302a','#d0c9b8','#40302a'],'h'],['ra','Radar aéreo','Air radar',['#1d3a52','#c8f03c','#1d3a52'],'h'],['hi','Historia: batallas y operaciones','History: battles and operations',['#4d2b25','#c9a25a','#4d2b25'],'h'],
 ['co','Conmemorativas','Commemorative',['#6b1f1a','#e3b648','#6b1f1a'],'s']];
var TIER={b:['Bronce','Bronze',30,'#b5793f','#7a4a22'],p:['Plata','Silver',75,'#cfd5dc','#7c858f'],o:['Oro','Gold',200,'#ecc256','#9c7417']};
/* familias: [sección, id, nombre ES, nombre EN, cómo ES ({n}), cómo EN, contador, umbrales, tier fijo para medallas de un solo nivel] */
var FAM=[
 ["cb", "cbw", "Infante de combate", "Combat infantryman", "Gana {n} combates", "Win {n} fights", "cb_win", [10, 50, 150]],
 ["cb", "cbn", "Visión nocturna", "Night vision", "Gana {n} combate{s} de noche", "Win {n} night fight{s}", "cb_nt", [3, 15, 40]],
 ["cb", "cbe", "Fuerzas especiales", "Special forces", "Gana {n} combate{s} en dificultad Élite", "Win {n} fight{s} on Elite", "cb_eli", [3, 15, 40]],
 ["cb", "cbm", "Todas las misiones", "Every mission", "Gana las {n} misiones distintas en dificultad Élite: despejar, rehén, trinchera, carro de combate y helicóptero", "Win all {n} different missions on Elite: clear, hostage, trench, tank and helicopter", "cb_mise", [5], "o"],
 ["ad", "ado", "Orden público", "Public order", "Termina {n} operaciones", "Finish {n} operations", "ad_ops", [10, 50, 150]],
 ["ad", "ad8", "Proporcionalidad", "Proportionality", "Saca 80 o más de 100 en {n} operaci{on}", "Score 80 or more out of 100 in {n} operation{s}", "ad_80", [3, 20, 50]],
 ["ad", "adr", "Unidad de intervención", "Intervention unit", "Saca 70 o más en nivel Realista {n} {vez}", "Score 70 or more on Realistic {n} time{s}", "ad_r70", [3, 15, 40]],
 ["ad", "adm", "Calles de Madrid", "Streets of Madrid", "Saca 70 o más en {n} escenarios distintos", "Score 70 or more on {n} different maps", "ad_m70", [7], "p"],
 ["du", "dua", "As del aire", "Air ace", "Gana {n} duelos aéreos", "Win {n} air duels", "du_air", [5, 25, 75]],
 ["du", "dug", "Carrista", "Tank ace", "Gana {n} duelos en tierra", "Win {n} ground duels", "du_gnd", [5, 25, 75]],
 ["du", "dus", "Lobo de mar", "Sea wolf", "Gana {n} duelos navales", "Win {n} naval duels", "du_sea", [5, 25, 75]],
 ["du", "du3", "Tres ejércitos", "Three services", "Gana un duelo en aire, en tierra y en el mar, y también uno de noche en tierra y otro de noche en el mar", "Win a duel in the air, on land and at sea, plus a night duel on land and another at sea", "du_m5", [5], "p"],
 ["ng", "ngo", "Negociador de crisis", "Crisis negotiator", "Resuelve {n} casos hablando (rendición o rehenes liberados)", "Resolve {n} cases by talking (surrender or hostages freed)", "ng_ok", [5, 25, 75]],
 ["ng", "ngr", "Sin un disparo", "Not a shot fired", "Consigue {n} rendici{on}", "Get {n} surrender{s}", "ng_ren", [3, 15, 40]],
 ["ng", "ngj", "Negociador jefe", "Lead negotiator", "Saca 85 o más en {n} caso{s}", "Score 85 or more in {n} case{s}", "ng_85", [3, 10, 30]],
 ["ng", "ngc", "Curso de negociación", "Negotiation course", "Termina tu primer caso", "Finish your first case", "ng_n", [1], "b"],
 ["fr", "frc", "Curso de tirador de precisión", "Precision marksman course", "Supera «Aprende a disparar» hasta tocar la placa", "Pass “Learn to shoot” by hitting the plate", "fr_apr", [1], "p"],
 ["fr", "frh", "Tirador selecto", "Designated marksman", "Toca {n} placas", "Hit {n} plates", "fr_hit", [50, 250, 1000]],
 ["fr", "frl", "Larga distancia", "Long range", "Toca una placa a {n} m o más en Veterano o Desafío (sin computadora balística)", "Hit a plate at {n} m or more in Veteran or Challenge (no ballistic computer)", "fr_farv", [1000, 1500, 1900]],
 ["fr", "frm", "Blancos en movimiento", "Moving targets", "Toca {n} placas en movimiento", "Hit {n} moving plates", "fr_mv", [10, 50, 150]],
 ["fr", "frn", "Tirador nocturno", "Night marksman", "Toca {n} placas en el campo de tiro nocturno", "Hit {n} plates on the night range", "fr_nt", [25], "p"],
 ["fr", "frs", "Serie perfecta", "Perfect string", "Toca todas las placas de una serie en Veterano o Desafío", "Hit every plate of a string on Veteran or Challenge", "fr_ser", [1], "o"],
 ["sb", "sbc", "Curso de submarinista", "Submariner course", "Termina «Aprende» escapando de la escolta", "Finish “Learn” by escaping the escort", "sb_apr", [1], "b"],
 ["sb", "sbh", "Cazador de superficie", "Surface hunter", "Alcanza {n} blancos designados", "Hit {n} designated targets", "sb_hit", [5, 30, 100]],
 ["sb", "sbe", "Servicio silencioso", "Silent service", "Cumple {n} misi{on} (blanco alcanzado y escapas)", "Complete {n} mission{s} (target hit and you escape)", "sb_esc", [3, 15, 40]],
 ["sb", "sbv", "Comandante de submarino", "Submarine commander", "Cumple {n} misi{on} en Veterano", "Complete {n} mission{s} on Veteran", "sb_vet", [1, 10, 25]],
 ["nu", "num", "Analista de alcances", "Range analyst", "Mira el alcance de {n} misiles distintos", "Check the range of {n} different missiles", "nu_mis", [10, 30, 60]],
 ["nu", "nuc", "Efectos de las armas nucleares", "Nuclear weapon effects", "Simula una detonación en {n} ciudades distintas", "Simulate a detonation over {n} different cities", "nu_city", [5, 20, 50]],
 ["nu", "nud", "Defensa antimisil", "Missile defence", "Simula {n} ataques en «Defensa»", "Simulate {n} attacks in “Defence”", "nu_def", [5, 25, 75]],
 ["nu", "nus", "Escudo", "Shield", "Intercepta el 90 % o más de un ataque de 10 o más misiles o drones", "Intercept 90% or more of an attack of 10 or more missiles or drones", "nu_shield", [1], "p"],
 ["md", "mdo", "Médico de combate", "Combat medic", "Salva a {n} heridos", "Save {n} casualties", "md_ok", [25, 100, 250]],
 ["md", "mdr", "Sanitario veterano", "Veteran medic", "Salva a {n} heridos en Realista", "Save {n} casualties on Realistic", "md_r", [10, 50, 150]],
 ["md", "mdp", "Hora de oro", "Golden hour", "Termina {n} partida{s} sin un solo fallo y con todos estabilizados", "Finish {n} game{s} without a single mistake and everyone stabilised", "md_perf", [3, 15, 40]],
 ["md", "mdc", "Curso de primeros auxilios en combate", "Combat first-aid course", "Termina «Aprende» con el herido a salvo", "Finish “Learn” with the casualty alive", "md_apr", [1], "b"],
 ["rt", "rtw", "Analista de inteligencia", "Intelligence analyst", "Resuelve {n} reto{s}", "Solve {n} challenge{s}", "rt_win", [3, 15, 50]],
 ["rt", "rt1", "Ojo de halcón", "Hawk eye", "Resuelve {n} reto{s} en 10 intentos o menos", "Solve {n} challenge{s} in 10 guesses or fewer", "rt_10", [3, 10, 25]],
 ["rt", "rts", "Racha del reto", "Challenge streak", "Resuelve el reto {n} días seguidos", "Solve the challenge {n} days in a row", "rt_str", [3, 7, 30]],
 ["rt", "rtn", "Sin pistas", "No hints", "Resuelve un reto sin pedir ninguna pista", "Solve a challenge without asking for a hint", "rt_nh", [1], "p"],
 ["sa", "sas", "Equipo de combate", "Combat kit", "Equipa a tu soldado con un puesto y un arma", "Kit out your soldier with a role and a weapon", "sd_save", [1], "b"],
 ["sa", "sar", "Polivalente", "All-rounder", "Equipa a tu soldado en {n} puestos distintos", "Kit out your soldier in {n} different roles", "sd_role", [2, 4, 7]],
 ["sa", "saw", "Armero", "Gunsmith", "Configura {n} armas distintas en el Armero", "Configure {n} different weapons in the Gunsmith", "ar_w", [2, 4, 6]],
 ["sa", "saa", "Maestro armero", "Master gunsmith", "Monta {n} accesorios en una misma arma", "Mount {n} accessories on one weapon", "ar_acc", [2, 4, 6]],
 ["fi", "fia", "Enciclopedista", "Encyclopaedist", "Consulta {n} fichas distintas", "Open {n} different data sheets", "f_all", [100, 500, 2000]],
 ["fi", "fav", "Experto en aviones", "Aircraft expert", "Consulta {n} fichas de aviones", "Open {n} aircraft data sheets", "f_av", [50, 150]],
 ["fi", "fhe", "Experto en helicópteros", "Helicopter expert", "Consulta {n} fichas de helicópteros", "Open {n} helicopter data sheets", "f_he", [40, 120]],
 ["fi", "fta", "Experto en carros de combate", "Tank expert", "Consulta {n} fichas de carros de combate", "Open {n} tank data sheets", "f_ta", [50, 150]],
 ["fi", "fbl", "Experto en blindados", "Armoured vehicle expert", "Consulta {n} fichas de vehículos blindados", "Open {n} armoured vehicle data sheets", "f_bl", [50, 150]],
 ["fi", "fbu", "Experto en buques", "Warship expert", "Consulta {n} fichas de buques", "Open {n} ship data sheets", "f_bu", [50, 150]],
 ["fi", "fsu", "Experto en submarinos", "Submarine expert", "Consulta {n} fichas de submarinos", "Open {n} submarine data sheets", "f_su", [50, 150]],
 ["fi", "flo", "Experto en logística y sanidad", "Logistics and medical expert", "Consulta {n} fichas de logística y sanidad", "Open {n} logistics and medical data sheets", "f_lo", [50, 150]],
 ["fi", "far", "Experto en armamento", "Weapons systems expert", "Consulta {n} fichas de misiles, bombas y armamento", "Open {n} missile, bomb and weapon data sheets", "f_ar", [50, 150]],
 ["fi", "fes", "Experto en la carrera espacial", "Space race expert", "Consulta {n} fichas de la carrera espacial", "Open {n} space race data sheets", "f_es", [50, 150]],
 ["fi", "faw", "Experto en armas de fuego", "Firearms expert", "Consulta {n} fichas de armas de fuego", "Open {n} firearm data sheets", "f_aw", [50, 150]],
 ["fi", "f3d", "Visor 3D", "3D viewer", "Abre los {n} modelos 3D", "Open all {n} 3D models", "m3_n", [2], "b"],
 ["pa", "pan", "Agregado militar", "Military attaché", "Consulta el inventario de {n} países o facciones", "Open the inventory of {n} countries or factions", "pa_n", [20, 75, 150]],
 ["pa", "pam", "Cartógrafo", "Cartographer", "Abre el mapa del mundo {n} días distintos", "Open the world map on {n} different days", "mp_d", [5, 15, 40]],
 ["pa", "pag", "Analista de geopolítica", "Geopolitics analyst", "Visita {n} secciones: ONU, gasto militar, inteligencia, España en el exterior, Ceuta y Melilla, Policía y Guardia Civil, guerras", "Visit {n} sections: UN, military spending, intelligence, Spain abroad, Ceuta and Melilla, Police and Civil Guard, wars", "pa_sec", [4, 7]],
 ["nw", "nwd", "Corresponsal", "Correspondent", "Lee las noticias {n} días distintos", "Read the news on {n} different days", "nw_d", [5, 15, 40]],
 ["ra", "ran", "Vigía del radar", "Radar spotter", "Identifica en directo {n} tipos distintos de avión militar en el radar", "Identify {n} different military aircraft types live on the radar", "ra_ty", [10, 25, 50]],
 ["ra", "rac", "Inteligencia aérea", "Air intelligence", "Encuentra en directo {n} de estos tipos de avión espía y de patrulla: RC-135, P-8 Poseidon y RQ-4 Global Hawk", "Find {n} of these spy and patrol aircraft types live: RC-135, P-8 Poseidon and RQ-4 Global Hawk", "ra_isr", [1, 2, 3]],
 ["ra", "ram", "MRTT a la vista", "MRTT spotted", "Encuentra en directo {n} A330 MRTT distintos (KC-30, Voyager, Phénix…)", "Find {n} different A330 MRTTs live (KC-30, Voyager, Phénix…)", "ra_mr", [5, 15, 30]],
 ["ra", "rat", "Reabastecimiento en vuelo", "Air-to-air refuelling", "Encuentra en directo {n} aviones cisterna distintos (KC-135, KC-46, A330 MRTT)", "Find {n} different tankers live (KC-135, KC-46, A330 MRTT)", "ra_tk", [5, 20, 50]],
 ["ra", "raw", "Alerta temprana", "Early warning", "Encuentra en directo {n} aviones AWACS distintos (E-3 Sentry, E-7 Wedgetail)", "Find {n} different AWACS aircraft live (E-3 Sentry, E-7 Wedgetail)", "ra_aw", [2, 6, 12]],
 ["ra", "raf", "Transporte pesado", "Heavy airlift", "Encuentra en directo {n} transportes pesados distintos (C-17, C-5, A400M)", "Find {n} different heavy transports live (C-17, C-5, A400M)", "ra_hv", [3, 15, 40]],
 ["hi", "hib", "Cronista de batallas", "Battle chronicler", "Abre {n} batallas históricas", "Open {n} historic battles", "hb_v", [3, 6, 12]],
 ["hi", "hio", "Operaciones especiales", "Special operations", "Abre las {n} operaciones especiales", "Open all {n} special operations", "ho_v", [5], "p"],
 ["hi", "hih", "Historiador", "Historian", "Llega al último paso de {n} historias (batallas u operaciones)", "Reach the last step of {n} stories (battles or operations)", "hs_c", [3, 8, 17]],
 ["hi", "hid", "Día D", "D-Day", "Recorre la batalla del Día D hasta el último paso", "Follow the D-Day battle to the last step", "hs_dd", [1], "p"],
 ["hi", "hig", "Analista de conflictos", "Conflict analyst", "Abre {n} guerras en «Guerras en la actualidad»", "Open {n} wars in “Wars today”", "gw_n", [3], "b"],
 ["co", "cod", "Días de servicio", "Days of service", "Entra en M.A.T {n} días distintos", "Visit M.A.T on {n} different days", "days", [7, 30, 100]],
 ["co", "cor", "Racha", "Streak", "Entra en M.A.T {n} días seguidos", "Visit M.A.T {n} days in a row", "str", [7, 30, 100]]];
/* FAM2: familias nuevas de la v2 (van detrás de COM en la lista de medallas) */
var FAM2=[
 ["ra", "rax", "Controlador aéreo", "Air traffic controller", "Encuentra en directo {n} tipos raros distintos: cisternas, AWACS, transportes pesados, aviones espía y de patrulla, Hércules, Chinook y aviones de Estado", "Find {n} different rare types live: tankers, AWACS, heavy transports, spy and patrol aircraft, Hercules, Chinook and state aircraft", "ra_rare", [3, 8, 14]],
 ["md", "mdz", "Sin un fallo en Realista", "Flawless on Realistic", "Termina {n} partida{s} en Realista sin un solo fallo y con todos estabilizados", "Finish {n} Realistic game{s} with no mistakes and everyone stabilised", "md_rp", [1, 5, 15]],
 ["ng", "ngx", "Negociación perfecta", "Perfect negotiation", "Consigue la rendición con 95 o más en {n} caso{s}", "Get a surrender with 95 or more in {n} case{s}", "ng_95", [1, 5, 15]],
 ["fr", "frr", "Distancias récord", "Record distances", "Toca la placa en {n} de las 4 distancias récord históricas (modo «Distancias récord»)", "Hit the plate at {n} of the 4 historic record distances («Record distances» mode)", "fr_rec", [1, 2, 4]],
 ["cb", "cbx", "Élite nocturna", "Night elite", "Gana {n} combate{s} de noche en dificultad Élite", "Win {n} night fight{s} on Elite", "cb_en", [1, 5, 15]]];
var COM=[
 ['csa','Sanidad Militar','Military Medical Corps','p',[['md_ok',100,'Heridos salvados','Casualties saved'],['f_lo',25,'Fichas de logística y sanidad','Logistics and medical sheets']]],
 ['cet','Ejército de Tierra','Army','p',[['cb_win',25,'Combates ganados','Fights won'],['du_gnd',15,'Duelos en tierra ganados','Ground duels won'],['f_ta+f_bl',100,'Fichas de carros y blindados','Tank and armour sheets']]],
 ['car','Armada','Navy','p',[['sb_hit',25,'Blancos alcanzados con el submarino','Submarine target hits'],['du_sea',15,'Duelos navales ganados','Naval duels won'],['f_bu+f_su',100,'Fichas de buques y submarinos','Ship and submarine sheets']]],
 ['cea','Ejército del Aire y del Espacio','Air and Space Force','p',[['ra_ty',20,'Tipos de avión identificados en el radar','Aircraft types identified on radar'],['du_air',15,'Duelos aéreos ganados','Air duels won'],['f_av+f_he',100,'Fichas de aviones y helicópteros','Aircraft and helicopter sheets']]],
 ['cvt','Veterano de M.A.T','M.A.T veteran','o',[['g_all',10,'Juegos con al menos una medalla','Games with at least one medal']]]];
/* lista ordenada de medallas (¡no reordenar: el código de progreso usa este orden!) */
var MED=[], MBY={}, TK=['b','p','o'];
FAM.forEach(function(f){ f[7].forEach(function(n,i){ var tr=f[8]||TK[f[7].length===2?(i?1:0):i]; var m={id:f[1]+i,f:f[1],sec:f[0],n:[f[2],f[3]],d:[f[4],f[5]],k:f[6],t:n,tr:tr,lv:f[7].length>1?i+1:0}; MED.push(m); MBY[m.id]=m; }); });
COM.forEach(function(c){ var m={id:c[0],f:c[0],sec:'co',n:[c[1],c[2]],tr:c[3],req:c[4],lv:0}; MED.push(m); MBY[m.id]=m; });
/* v2 (añadidas al FINAL: el código de progreso depende del orden) */
FAM2.forEach(function(f){ f[7].forEach(function(n,i){ var tr=f[8]||TK[f[7].length===2?(i?1:0):i]; var m={id:f[1]+i,f:f[1],sec:f[0],n:[f[2],f[3]],d:[f[4],f[5]],k:f[6],t:n,tr:tr,lv:f[7].length>1?i+1:0}; MED.push(m); MBY[m.id]=m; }); });
/* medalla secreta «Ghost»: la última de la lista para el código; en el panel sale la primera */
var GHO={id:'gho',f:'gho',sec:'gh',n:['Ghost','Ghost'],d:['Medalla secreta','Secret medal'],k:'gh',t:1,tr:'o',lv:0,secret:1,xp:500}; MED.push(GHO); MBY.gho=GHO;
/* contadores (orden fijo para el código) */
var CK=['cb_win','cb_nt','cb_eli','cb_mis','ad_ops','ad_80','ad_r70','ad_map','du_air','du_gnd','du_sea','du_m','ng_ok','ng_ren','ng_85','ng_n','fr_apr','fr_hit','fr_far','fr_mv','fr_nt','fr_ser',
 'sb_apr','sb_hit','sb_esc','sb_vet','nu_mis','nu_city','nu_def','nu_shield','md_ok','md_r','md_perf','md_apr','rt_win','rt_10','rt_str','rt_nh','sd_save','sd_role','ar_w','ar_acc',
 'f_all','f_av','f_he','f_ta','f_bl','f_bu','f_su','f_lo','f_ar','f_es','f_aw','m3_n','pa_n','mp_d','pa_sec','nw_d','ra_n','ra_ac','ra_mr','ra_tk','ra_aw','ra_fi','hb_v','ho_v','hs_c','hs_dd','gw_n','days','str','games',
 'gh','cb_mise','ad_m70','du_m5','fr_farv','fr_rec','ra_ty','ra_isr','ra_hv','ra_rare','md_rp','ng_95','cb_en'];
var GAMESEC=['cb','ad','du','ng','fr','sb','nu','md','rt','sa'];

/* ---------- Estado ---------- */
var ST=null, SS=null, mem=false;
function blank(){ return {v:VER,a:0,c:{},m:{},d:{l:'',s:0},g:{d:'',gx:0,ex:0},rt:{l:0,s:0}}; }
function load(){ if(ST) return; try{ ST=JSON.parse(localStorage.getItem(KEY)||'null'); SS=JSON.parse(localStorage.getItem(SKEY)||'null'); }catch(e){ mem=true; }
 if(!ST||typeof ST!=='object') ST=blank(); if(!SS||typeof SS!=='object') SS={};
 var b=blank(); Object.keys(b).forEach(function(k){ if(ST[k]==null) ST[k]=b[k]; }); if(ST.rk==null) ST.rk=rankOf(xp()); }
var saveT=0;
function save(){ clearTimeout(saveT); saveT=setTimeout(saveNow,250); }
function saveNow(){ clearTimeout(saveT); if(mem) return; try{ localStorage.setItem(KEY,JSON.stringify(ST)); localStorage.setItem(SKEY,JSON.stringify(SS)); }catch(e){} }
addEventListener('pagehide',function(){ saveNow(); });
addEventListener('storage',function(e){ if(e.key===KEY||e.key===SKEY||e.key===null){ ST=null; SS=null; try{ btn(); }catch(_){} } });
function val(k){ if(k.indexOf('+')>0){ return k.split('+').reduce(function(s,x){ return s+val(x); },0); }
 if(k==='g_all') return GAMESEC.filter(function(s){ return MED.some(function(m){ return m.sec===s&&ST.m[m.id]; }); }).length;
 var c=+ST.c[k]||0, s=SS[k]; return s&&s.length>c?s.length:c; }
function inc(k,n){ ST.c[k]=(+ST.c[k]||0)+(n==null?1:n); }
function setMax(k,v){ if(v>(+ST.c[k]||0)) ST.c[k]=v; }
function addSet(k,id){ id=String(id); var s=SS[k]||(SS[k]=[]); if(s.indexOf(id)>=0) return false; s.push(id); if(s.length>(+ST.c[k]||0)) ST.c[k]=s.length; return true; }
function medXP(){ var x=0; Object.keys(ST.m).forEach(function(id){ var m=MBY[id]; if(m) x+=m.xp||TIER[m.tr][2]; }); return x; }
function xp(){ return (+ST.a||0)+medXP(); }
function gday(){ var t=today(); if(ST.g.d!==t) ST.g={d:t,gx:0,ex:0}; return ST.g; }
function addXP(kind,n){ var g=gday(); if(kind==='game'){ n=Math.max(0,Math.min(n,400-g.gx)); g.gx+=n; } else if(kind==='ex'){ n=Math.max(0,Math.min(n,60-g.ex)); g.ex+=n; } ST.a=(+ST.a||0)+n; }
function touchDay(){ var t=today(), d=ST.d; if(d.l===t) return; var p=d.l?dayN(d.l):null, n=dayN(t); d.s=(p!=null&&n-p===1)?(d.s||0)+1:1; d.l=t; addSet('days',t); setMax('str',d.s); ST.a=(+ST.a||0)+20+5*Math.min(6,d.s-1); }
function prog(m){ if(m.req) return m.req.map(function(r){ return [val(r[0]),r[1],r[2],r[3]]; }); return [[val(m.k),m.t]]; }
function done(m){ return prog(m).every(function(p){ return p[0]>=p[1]; }); }

/* ---------- Comprobación y avisos ---------- */
var QUIET=false;
function check(){ var got=[]; if(ST.rk==null) ST.rk=rankOf(xp()); var r0=ST.rk;
 for(var pass=0;pass<2;pass++) MED.forEach(function(m){ if(!ST.m[m.id]&&done(m)){ ST.m[m.id]=Date.now(); got.push(m); } });
 var r1=rankOf(xp()); if(r1>r0||QUIET) ST.rk=Math.max(r1,QUIET?r1:r0); save(); btn();
 if(!QUIET){ var sec=got.filter(function(m){ return m.secret; }); got=got.filter(function(m){ return !m.secret; }); var tq=function(){ got.slice(0,3).forEach(function(m){ toast('m',m); }); if(got.length>3) toast('x',got.length-3); if(r1>r0) toast('r',r1); }; if(sec.length){ ghostShow(); setTimeout(tq,4500); } else tq(); }
 if(OV&&OV.parentNode) openPanel(true); return got; }
var TQ=[], TB=null;
function toast(k,x){ TQ.push([k,x]); if(!TB) nextToast(); }
function nextToast(){ var it=TQ.shift(); if(!it){ TB=null; return; } css(); var k=it[0], x=it[1], h='';
 if(k==='m'){ var m=x; h=medSvg(m,true,40)+'<div><b>'+L('¡Medalla!','Medal!')+'</b><span>'+esc(mname(m))+'</span><small>'+esc(L(TIER[m.tr][0],TIER[m.tr][1]))+' · +'+TIER[m.tr][2]+' XP</small></div>'; }
 else if(k==='r') h=insignia(x,40)+'<div><b>'+L('¡Ascenso!','Promoted!')+'</b><span>'+esc(rname(x))+'</span><small>'+L('Nuevo empleo','New rank')+'</small></div>';
 else h='<div><b>+'+x+'</b><span>'+L('medallas más','more medals')+'</span></div>';
 TB=document.createElement('button'); TB.type='button'; TB.className='mmtoast'+(k==='r'?' up':''); TB.setAttribute('data-noi18n',''); TB.setAttribute('aria-live','polite'); TB.innerHTML=h;
 TB.onclick=function(){ openPanel(); }; document.body.appendChild(TB);
 var t=TB; requestAnimationFrame(function(){ t.classList.add('in'); });
 setTimeout(function(){ t.classList.remove('in'); setTimeout(function(){ if(t.parentNode) t.parentNode.removeChild(t); nextToast(); },350); },k==='r'?3800:3000); }

/* ---------- Eventos de los juegos ---------- */
var LAST={};
function ev(name,o){ o=o||{}; load(); touchDay(); var gx=0;
 switch(name){
 case 'medico.fin': { var sv=+o.ok||0; inc('md_ok',sv); if(o.mode==='r') inc('md_r',sv); if(o.perf) inc('md_perf'); if(o.perf&&o.mode==='r') inc('md_rp'); if(o.mode==='a'&&sv>0) setMax('md_apr',1); gx=10+Math.min(15,5*sv)+(o.perf?5:0); break; }
 case 'fr.disparo': { if(o.hit){ inc('fr_hit'); setMax('fr_far',Math.round(+o.R||0)); if(o.mode==='veterano'||o.mode==='desafio') setMax('fr_farv',Math.round(+o.R||0)); if(o.mode==='record') addSet('fr_rec',Math.round(+o.R||0)); if(o.mv) inc('fr_mv'); if(o.nt) inc('fr_nt'); if(o.tut) setMax('fr_apr',1); gx=3+((+o.R||0)>=1500?2:0); } break; }
 case 'fr.serie': { if((o.mode==='veterano'||o.mode==='desafio')&&o.n>0&&o.hits>=o.n) setMax('fr_ser',1); gx=10; break; }
 case 'combate.fin': { if(o.win){ inc('cb_win'); if(o.night) inc('cb_nt'); if(o.dif==='eli') inc('cb_eli'); if(o.mi) addSet('cb_mis',o.mi); if(o.dif==='eli'&&o.mi) addSet('cb_mise',o.mi); if(o.dif==='eli'&&o.night) inc('cb_en'); } gx=10+(o.win?15:0); break; }
 case 'ad.fin': { var sc=+o.sc||0; inc('ad_ops'); if(sc>=80) inc('ad_80'); if(o.d==='r'&&sc>=70) inc('ad_r70'); if(o.m) addSet('ad_map',o.m); if(o.m&&sc>=70) addSet('ad_m70',o.m); gx=10+Math.round(sc/10); break; }
 case 'duelo.fin': { if(o.win){ var mk=o.m==='cielo'?'du_air':o.m==='suelo'?'du_gnd':o.m==='mar'?'du_sea':''; if(mk){ inc(mk); addSet('du_m',o.m); addSet('du_m5',o.m); if(o.night&&o.m!=='cielo') addSet('du_m5',o.m+'_n'); } } gx=8+(o.win?10:0); break; }
 case 'neg.fin': { inc('ng_n'); var ok=o.end==='rendicion'||o.end==='liberados'; if(ok) inc('ng_ok'); if(o.end==='rendicion') inc('ng_ren'); if((+o.sc||0)>=85) inc('ng_85'); if(o.end==='rendicion'&&(+o.sc||0)>=95) inc('ng_95'); gx=10+(ok?10:0); break; }
 case 'sub.fin': { inc('sb_hit',+o.hits||0); var es=o.why==='escaped'; if(es&&o.mode==='aprende') setMax('sb_apr',1); if(es&&o.mode!=='aprende') inc('sb_esc'); if(es&&o.mode==='veterano') inc('sb_vet'); gx=10+Math.min(30,10*(+o.hits||0)); break; }
 case 'alc.ver': { (o.m||[]).forEach(function(id){ if(addSet('nu_mis',id)) addXP('ex',2); }); break; }
 case 'nuc.det': { if(o.c&&addSet('nu_city',o.c)) addXP('ex',3); break; }
 case 'def.sim': { inc('nu_def'); if((+o.n||0)>=10&&(+o.k||0)>=0.9*((+o.n||0)-(+o.f||0))) setMax('nu_shield',1); gx=5; break; }
 case 'reto.fin': { var num=+o.num||0; if(num&&!addSet('rt_days',num)) break; if(o.w){ inc('rt_win'); if((+o.n||99)<=10) inc('rt_10'); if(!(+o.h)) setMax('rt_nh',1); ST.rt.s=(ST.rt.l&&num===ST.rt.l+1)?ST.rt.s+1:1; ST.rt.l=num; setMax('rt_str',ST.rt.s); } gx=10+(o.w?20:0); break; }
 case 'soldado.equipo': { if(o.role&&o.arma){ setMax('sd_save',1); addSet('sd_role',o.role); } break; }
 case 'armero.arma': { if(o.id){ if(addSet('ar_w',o.id)) addXP('ex',3); setMax('ar_acc',+o.on||0); } break; }
 default: return; }
 if(gx){ inc('games'); addXP('game',gx); }
 check(); }

/* ---------- Secciones: se observan por la ruta ---------- */
var CATS={aviones:'f_av',helicopteros:'f_he',tanques:'f_ta',blindados:'f_bl',buques:'f_bu',submarinos:'f_su',logistica:'f_lo',armamento:'f_ar',espacio:'f_es',armas:'f_aw'};
var GEO={onu:1,gasto:1,inteligencia:1,exterior:1,'ceuta-melilla':1,fyse:1,guerras:1};
var RAG={ra_mr:['airbus-a330-mrtt'],ra_tk:['boeing-kc-135-stratotanker','boeing-kc-46-pegasus','airbus-a330-mrtt'],ra_aw:['boeing-e-3-sentry','boeing-e-7-wedgetail'],
 ra_hv:['boeing-c-17-globemaster-iii','lockheed-c-5-galaxy','airbus-a400m-atlas']};
/* tipos raros que sí aparecen con transpondedor sobre Europa (nada furtivo ni estratégico): cuentan por TIPO distinto */
var RARE=['boeing-kc-135-stratotanker','boeing-kc-46-pegasus','airbus-a330-mrtt','boeing-e-3-sentry','boeing-e-7-wedgetail','boeing-c-17-globemaster-iii','lockheed-c-5-galaxy','airbus-a400m-atlas',
 'boeing-rc-135','boeing-p-8-poseidon','northrop-grumman-rq-4-global-hawk','lockheed-c-130-hercules','lockheed-martin-c-130j-super-hercules','boeing-ch-47-chinook','boeing-c-32','boeing-c-40','dassault-falcon-900','dassault-falcon-7x'];
var ISR=['boeing-rc-135','boeing-p-8-poseidon','northrop-grumman-rq-4-global-hawk'];
var STEPS={}, lastH=null, rtm=0;
function qp(h,k){ var m=h.match(new RegExp('[?&]'+k+'=([^&]*)')); return m?decodeURIComponent(m[1]):null; }
function story(base,id,paso){ var key=base+'/'+id; var go=function(n){ if(n&&paso>=n){ var nw=addSet('hs_c',key); if(nw){ addXP('game',25); inc('games'); } if(key==='batallas/dia-d') setMax('hs_dd',1); check(); } };
 if(STEPS[key]!=null) return go(STEPS[key]);
 try{ fetch(base+'/'+id+'.json',{cache:'force-cache'}).then(function(r){ return r.ok?r.json():null; }).then(function(d){ STEPS[key]=d&&d.steps?d.steps.length:0; go(STEPS[key]); }).catch(function(){}); }catch(e){} }
function onRoute(){ var h=location.hash; if(h===lastH) return; lastH=h; load(); touchDay(); btn();
 var path=h.replace(/^#\/?/,'').split('?')[0], p=path.split('/').filter(Boolean), s=p[0]||'', ch=false;
 if(GEO[s]) ch=addSet('pa_sec',s)||ch;
 if(s==='a'&&p[1]){ var id=p[1]; setTimeout(function(){ if(location.hash!==h) return; var c=null, cr=document.querySelectorAll('#app .crumbs a[href^="#/"]');
   for(var i=0;i<cr.length&&!c;i++){ var seg=(cr[i].getAttribute('href').replace(/^#\/?/,'').split(/[\/?]/)[0]); if(CATS[seg]) c=CATS[seg]; }
   var nw=addSet('f_all',id); if(c) addSet(c,id); if(nw){ addXP('ex',2); check(); } },700); }
 else if(s==='fuerzas'){ var a=qp(h,'a'); if(a&&/^p:/.test(a)&&addSet('pa_n',a.slice(2))){ addXP('ex',3); ch=true; } }
 else if(s==='mapa') ch=addSet('mp_d',today())||ch;
 else if(s==='noticias'){ if(addSet('nw_d',today())){ addXP('ex',5); ch=true; } }
 else if(s==='modelos-3d'&&p[1]){ if(addSet('m3_n',p[1])){ addXP('ex',5); ch=true; } }
 else if(s==='guerras'&&p[1]){ if(addSet('gw_n',p[1])){ addXP('ex',5); ch=true; } }
 else if((s==='batallas'||s==='operaciones')&&p[1]&&p[1]!=='historicas'){ var k2=s==='batallas'?'hb_v':'ho_v'; if(addSet(k2,p[1])){ addXP('ex',10); ch=true; } story(s,p[1],+(qp(h,'paso')||1)); }
 if(s==='radar'){ var hx=qp(h,'h'); if(hx){ clearTimeout(rtm); rtm=setTimeout(function(){ radarSeen(hx); },900); } }
 save(); if(ch) check(); if(s==='a'&&p[1]===GHID){ setTimeout(ghostMount,400); setTimeout(ghostMount,1200); } }
function radarSeen(hx){ if(location.hash.indexOf('h='+hx)<0) return; var pan=document.getElementById('rd-pan'); if(!pan) return;
 if(!pan.querySelector('#rd-kp')) return; /* solo cuenta si el avión está emitiendo ahora (no un enlace a uno que ya no está) */
 var a=pan.querySelector('a.rd-fi[href^="#/a/"]'), fid=a?a.getAttribute('href').slice(4):'', ct=pan.querySelector('.rd-cat'), tk=ct&&/^(Cisternas|Tankers)$/.test(ct.textContent.trim());
 if(fid==='airbus-a330'&&tk) fid='airbus-a330-mrtt'; /* A330-200 militar clasificado como cisterna = MRTT/KC-30/Voyager */
 var nw=addSet('ra_n',hx); if(fid){ addSet('ra_ty',fid); Object.keys(RAG).forEach(function(k){ if(RAG[k].indexOf(fid)>=0) addSet(k,hx); }); if(RARE.indexOf(fid)>=0) addSet('ra_rare',fid); if(ISR.indexOf(fid)>=0) addSet('ra_isr',fid); }
 if(nw){ addXP('ex',2); } check(); }


/* ---------- Medalla secreta «Ghost» (ficha del MQ-9 Reaper) ---------- */
var GHID='general-atomics-mq-9-reaper';
/* calavera genérica de dibujo propio (pasamontañas con calavera), monocroma */
function skull(sz,fg,bg){ fg=fg||'#f2f2ee'; bg=bg||'#111'; return '<svg class="mmsk" viewBox="0 0 24 24" width="'+sz+'" height="'+sz+'" aria-hidden="true">'+
 '<path d="M12 2.4c-4.9 0-8.3 3.3-8.3 7.9 0 2.7 1.2 4.6 2.9 5.8v2.3c0 .9.7 1.6 1.6 1.6h7.6c.9 0 1.6-.7 1.6-1.6v-2.3c1.7-1.2 2.9-3.1 2.9-5.8 0-4.6-3.4-7.9-8.3-7.9z" fill="'+fg+'"/>'+
 '<path d="M4.3 8.6c2.3-1 4.9-1.4 7.7-1.4s5.4.4 7.7 1.4" fill="none" stroke="'+bg+'" stroke-width="1.1" opacity=".55"/>'+
 '<path d="M6.2 10.4c.3-1.3 1.5-2 2.9-1.8 1.3.2 2 1.2 1.8 2.5-.2 1.4-1.3 2.2-2.6 2.1-1.4-.2-2.4-1.4-2.1-2.8zM17.8 10.4c-.3-1.3-1.5-2-2.9-1.8-1.3.2-2 1.2-1.8 2.5.2 1.4 1.3 2.2 2.6 2.1 1.4-.2 2.4-1.4 2.1-2.8z" fill="'+bg+'"/>'+
 '<path d="M12 13.4l-1.3 2.4h2.6z" fill="'+bg+'"/>'+
 '<path d="M9.6 17.3v2.4M12 17.3v2.6M14.4 17.3v2.4" stroke="'+bg+'" stroke-width="1.2" stroke-linecap="round"/></svg>'; }
function ghostMount(){ var h=location.hash.replace(/^#\/?/,'').split('?')[0]; if(h!=='a/'+GHID) return;
 var app=document.getElementById('app'); if(!app||app.querySelector('.mmgh')) return; var h1=app.querySelector('.dwrap h1'); if(!h1) return;
 css(); var b=document.createElement('button'); b.type='button'; b.className='mmgh'; b.setAttribute('data-noi18n',''); b.setAttribute('aria-label','Ghost'); b.innerHTML=skull(24);
 b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); ghostGet(); }); h1.appendChild(b); }
function ghostGet(){ load(); touchDay(); if(ST.m.gho){ openPanel(); return; } setMax('gh',1); check(); }
var GOV=null;
function ghostShow(){ css(); if(GOV&&GOV.parentNode) GOV.parentNode.removeChild(GOV); var o=document.createElement('div'); o.className='mmgo'; o.setAttribute('data-noi18n',''); o.setAttribute('role','alert');
 o.innerHTML='<div class="mmgb">'+skull(72,'#d8ffd0','#06110a')+'<p class="l1">'+L('📡 ¡UAV ENEMIGO EN CAMINO!','📡 ENEMY UAV INBOUND!')+'</p><p class="l2">'+L('Has encontrado al fantasma. Enhorabuena, soldado.','You found the ghost. Well done, soldier.')+'</p><p class="l3">'+L('🎖️ Medalla secreta desbloqueada: GHOST','🎖️ Secret medal unlocked: GHOST')+'</p><p class="l4">+'+GHO.xp+' XP</p></div>';
 var gone=false, kill=function(){ if(gone) return; gone=true; o.classList.remove('in'); setTimeout(function(){ if(o.parentNode) o.parentNode.removeChild(o); if(GOV===o) GOV=null; },300); };
 o.addEventListener('click',kill); document.body.appendChild(o); GOV=o; requestAnimationFrame(function(){ o.classList.add('in'); }); setTimeout(kill,4200); }
function ghostCard(){ var on=!!ST.m.gho; return '<div class="mmghc'+(on?' on':'')+'"><span class="mmghi">'+(on?skull(46):'<b>?</b>')+'</span><div><span class="mmghs">'+L('SECRETA','SECRET')+'</span><b>'+(on?'GHOST':'???')+'</b><p>'+(on?L('Has encontrado al fantasma. UAV enemigo en camino.','You found the ghost. Enemy UAV inbound.')+' · +'+GHO.xp+' XP':L('Se encuentra en las fichas.','Hidden somewhere in the data sheets.'))+'</p></div></div>'; }

/* ---------- Código de progreso: Base32 (Crockford) + CRC-16 ---------- */
var B32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function crc16(b){ var c=0xFFFF; for(var i=0;i<b.length;i++){ c^=b[i]<<8; for(var j=0;j<8;j++) c=(c&0x8000)?((c<<1)^0x1021)&0xFFFF:(c<<1)&0xFFFF; } return c; }
function vput(a,n){ n=Math.max(0,Math.floor(+n||0)); do{ var b=n%128; n=Math.floor(n/128); a.push(n?b|128:b); }while(n); }
function vget(b,o){ var n=0, m=1, x; do{ if(o.i>=b.length) throw new Error('short'); x=b[o.i++]; n+=(x&127)*m; m*=128; }while(x&128); return n; }
function b32(b){ var s='', v=0, bits=0; for(var i=0;i<b.length;i++){ v=(v<<8)|b[i]; bits+=8; while(bits>=5){ s+=B32[(v>>(bits-5))&31]; bits-=5; } v&=255; } if(bits) s+=B32[(v<<(5-bits))&31]; return s; }
function unb32(s){ var out=[], v=0, bits=0; for(var i=0;i<s.length;i++){ var k=B32.indexOf(s[i]); if(k<0) throw new Error('char'); v=(v<<5)|k; bits+=5; if(bits>=8){ out.push((v>>(bits-8))&255); bits-=8; } v&=255; } return out; }
function makeCode(){ load(); var b=[VER]; vput(b,ST.a); var nm=MED.length, bs=[], ls=[], idx=[], i, j, x; for(i=0;i<nm;i+=8){ x=0; for(j=0;j<8&&i+j<nm;j++) if(ST.m[MED[i+j].id]){ x|=1<<j; idx.push(i+j); } bs.push(x); }
 vput(ls,idx.length); idx.forEach(function(v,k){ vput(ls,k?v-idx[k-1]:v); }); if(ls.length<bs.length){ vput(b,nm*2+1); b=b.concat(ls); } else { vput(b,nm*2); b=b.concat(bs); }
 vput(b,CK.length); var nz=[]; for(i=0;i<CK.length;i+=8){ x=0; for(j=0;j<8&&i+j<CK.length;j++) if(val(CK[i+j])>0) x|=1<<j; nz.push(x); } b=b.concat(nz); CK.forEach(function(k){ var v=val(k); if(v>0) vput(b,v); });
 var c=crc16(b); b.push(c>>8,c&255); return 'MAT-'+b32(b); }
function parseCode(s){ s=String(s||'').toUpperCase(); var at=s.lastIndexOf('MAT'); if(at>=0) s=s.slice(at+3); s=(s.match(/^[\s:\-]*([0-9A-Z][0-9A-Z\s\-]*)/)||[0,''])[1]; s=s.replace(/[\s\-–—.]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1');
 if(s.length<6) throw new Error('short'); var b=unb32(s); var nb=Math.floor(s.length*5/8); b=b.slice(0,nb);
 if(b.length<4) throw new Error('short'); var c=(b[b.length-2]<<8)|b[b.length-1], body=b.slice(0,b.length-2); if(crc16(body)!==c) throw new Error('crc');
 var o={i:0}, ver=body[o.i++]; if(ver!==1) throw new Error('ver'); var r={a:vget(body,o),m:{},c:{}}; var nm2=vget(body,o), nm=nm2>>1, i, j, x;
 if(nm2&1){ var k=vget(body,o), p=0; for(i=0;i<k;i++){ p=i?p+vget(body,o):vget(body,o); if(MED[p]) r.m[MED[p].id]=1; } }
 else for(i=0;i<nm;i+=8){ x=body[o.i++]; for(j=0;j<8&&i+j<nm;j++) if(x&(1<<j)&&MED[i+j]) r.m[MED[i+j].id]=1; }
 var nc=vget(body,o), nz=[]; for(i=0;i<nc;i+=8) nz.push(body[o.i++]); for(i=0;i<nc;i++) if(nz[i>>3]&(1<<(i&7))){ var v=vget(body,o); if(CK[i]) r.c[CK[i]]=v; } return r; }
function loadCode(s){ var r=parseCode(s); load(); var before=Object.keys(ST.m).length, now=Date.now();
 ST.a=Math.max(+ST.a||0,r.a); Object.keys(r.m).forEach(function(id){ if(!ST.m[id]) ST.m[id]=now; });
 Object.keys(r.c).forEach(function(k){ if(r.c[k]>(+ST.c[k]||0)) ST.c[k]=r.c[k]; });
 QUIET=true; check(); QUIET=false; saveNow(); return {rank:rankOf(xp()),med:Object.keys(ST.m).length,added:Object.keys(ST.m).length-before}; }

/* ---------- Dibujo de medallas ---------- */
function mname(m){ return EN()?m.n[1]:m.n[0]; }
function mdesc(m){ if(m.req) return L('Consigue todo esto:','Get all of these:'); var one=m.t===1; return (EN()?m.d[1]:m.d[0]).replace('{n}',nf(m.t)).replace(/\{s\}/g,one?'':'s').replace(/\{on\}/g,one?'ón':'ones').replace(/\{vez\}/g,one?'vez':'veces'); }
var SB={}; SEC.forEach(function(s){ SB[s[0]]=s; });
function medSvg(m,on,sz){ var s=SB[m.sec], c=s[3], t=TIER[m.tr], uid='g'+m.id;
 var shp=s[4]==='h'?'<polygon points="24,22 38,30 38,46 24,54 10,46 10,30" fill="url(#'+uid+')" stroke="'+t[4]+'" stroke-width="2"/>'
   :s[4]==='s'?star(24,38,17,'url(#'+uid+')').replace('/>',' stroke="'+t[4]+'" stroke-width="2" stroke-linejoin="round"/>')
   :'<circle cx="24" cy="38" r="15" fill="url(#'+uid+')" stroke="'+t[4]+'" stroke-width="2"/>';
 var lv=m.lv?'<g fill="#11130c">'+[0,1,2].slice(0,m.lv).map(function(i){ return '<rect x="'+(17.5+i*5)+'" y="5" width="3" height="11" rx="1" fill="'+t[3]+'"/>'; }).join('')+'</g>':'';
 return '<svg class="mmmed'+(on?'':' off')+'" viewBox="0 0 48 56" width="'+(sz||44)+'" height="'+Math.round((sz||44)*56/48)+'" aria-hidden="true"><defs><radialGradient id="'+uid+'" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="'+t[3]+'"/><stop offset="1" stop-color="'+t[4]+'"/></radialGradient></defs>'+
  '<path d="M12 0h24l-4 24H16z" fill="'+c[0]+'"/><path d="M20 0h8l-1.3 24h-5.4z" fill="'+c[1]+'"/><path d="M23 0h2l-.3 24h-1.4z" fill="'+c[2]+'"/>'+lv+shp+
  '<g transform="translate(14 28) scale(.84)" stroke="#15170f" fill="none">'+(GL[m.sec]||'')+'</g></svg>'; }

/* ---------- Botón de la cabecera ---------- */
var BTN=null;
function btn(){ var nav=document.querySelector('header.top .topnav'); if(!nav||!ST) return; var r=rankOf(xp());
 if(!BTN||!BTN.isConnected){ BTN=nav.querySelector('.mmbtn'); if(!BTN){ css(); BTN=document.createElement('button'); BTN.type='button'; BTN.className='ddb mmbtn'; BTN.setAttribute('data-noi18n','');
   BTN.onclick=function(e){ e.preventDefault(); if(window.MAT_NAV&&MAT_NAV.close) MAT_NAV.close(); openPanel(); }; var ls=nav.querySelector('.langsw'); if(ls) nav.insertBefore(BTN,ls); else nav.appendChild(BTN); } BTN._l=''; }
 var t=L('Medallas','Medals'); if(BTN._l!==t){ BTN._l=t; BTN.textContent=t; }
 var lab=L('Medallas y rango: ','Medals and rank: ')+rname(r); if(BTN.getAttribute('aria-label')!==lab){ BTN.setAttribute('aria-label',lab); BTN.title=lab; } }

/* ---------- Panel «Medallas y rango» ---------- */
var OV=null, OPEN_SEC={};
function closePanel(){ if(!OV) return; if(OV.parentNode) OV.parentNode.removeChild(OV); OV=null; document.documentElement.classList.remove('mmlock'); removeEventListener('keydown',onKey); if(BTN) try{ BTN.focus({preventScroll:true}); }catch(e){} }
function onKey(e){ if(e.key==='Escape') closePanel(); }
function famHTML(F){ var nx=null, any=false; F.forEach(function(m){ if(ST.m[m.id]) any=true; else if(!nx) nx=m; });
 var md=F.map(function(m){ var on=!!ST.m[m.id]; return '<span class="mmt'+(on?' on':'')+'" title="'+esc(L(TIER[m.tr][0],TIER[m.tr][1]))+'">'+medSvg(m,on,F.length>1?34:40)+'<i class="t'+m.tr+'">'+(m.req?esc(L(TIER[m.tr][0],TIER[m.tr][1])):F.length>1||m.t>1?nf(m.t):esc(L(TIER[m.tr][0],TIER[m.tr][1])))+'</i></span>'; }).join('');
 var tx;
 if(!nx){ var last=F[F.length-1]; tx='<p>'+esc(mdesc(last))+'</p><span class="mmok">'+(F.length>1?L('¡Completa! ','Complete! '):L('Conseguida · ','Earned · '))+new Date(ST.m[last.id]).toLocaleDateString(EN()?'en-GB':'es-ES',{day:'numeric',month:'short'})+'</span>'; }
 else { var pr=prog(nx); tx='<p>'+(any?'<em class="mmnx">'+L('Siguiente','Next')+' · '+esc(L(TIER[nx.tr][0],TIER[nx.tr][1]))+':</em> ':'')+esc(mdesc(nx))+'</p>'+pr.map(function(p){ var a=Math.min(p[0],p[1]); return (p[2]?'<span class="mmrq">'+esc(EN()?p[3]:p[2])+'</span>':'')+'<span class="mmpg"><span class="mmbar sm"><i style="width:'+(a/p[1]*100).toFixed(1)+'%"></i></span><b>'+nf(a)+'/'+nf(p[1])+'</b></span>'; }).join(''); }
 return '<div class="mmc'+(any?' on':'')+(nx?'':' full')+'"><div class="mmts">'+md+'</div><div class="mmct"><b>'+esc(mname(F[0]))+'</b>'+tx+'</div></div>'; }
function openPanel(re){ load(); css(); var x=xp(), r=rankOf(x), nx=RANKS[r+1], cur=RANKS[r][2], pct=nx?Math.max(0,Math.min(100,(x-cur)/(nx[2]-cur)*100)):100;
 var got=Object.keys(ST.m).filter(function(id){ return MBY[id]; }).length, sc=OV?OV.querySelector('.mmbox').scrollTop:0;
 var h='<div class="mmbox" role="dialog" aria-modal="true" aria-labelledby="mmttl"><button type="button" class="mmx" aria-label="'+L('Cerrar','Close')+'">✕</button>'+
  '<h2 id="mmttl">'+L('Medallas y rango','Medals and rank')+'</h2>'+
  '<div class="mmrk">'+insignia(r,74)+'<div class="mmrt"><span class="k">'+L('Tu empleo','Your rank')+'</span><b>'+esc(rname(r))+'</b>'+(EN()?'<small>'+esc(RANKS[r][0])+'</small>':'')+
  '<div class="mmbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct)+'"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+
  '<span class="mmxp">'+nf(x)+' XP'+(nx?' · '+L('siguiente rango','next rank')+': <b>'+esc(EN()?nx[1]:nx[0])+'</b> ('+L('faltan ','')+nf(nx[2]-x)+L(' XP',' XP to go')+')':' · '+L('empleo máximo','top rank'))+'</span></div></div>'+
  '<div class="mmst"><div><b>'+got+'</b><span>/'+MED.length+' '+L('medallas','medals')+'</span></div><div><b>'+val('days')+'</b><span>'+(val('days')===1?L('día de servicio','day of service'):L('días de servicio','days of service'))+'</span></div><div><b>'+(ST.d.s||0)+'</b><span>'+((ST.d.s||0)===1?L('día seguido','day streak'):L('días seguidos','day streak'))+'</span></div></div>'+
  '<details class="mmlad"><summary>'+L('Todos los empleos y cómo se gana XP','All ranks and how to earn XP')+'</summary><ol>'+RANKS.map(function(k,i){ return '<li class="'+(i===r?'on':i<r?'ok':'')+'">'+insignia(i,26)+'<span>'+esc(EN()?k[1]:k[0])+(EN()?' <small>('+esc(k[0])+')</small>':'')+'</span><i>'+nf(k[2])+' XP</i></li>'; }).join('')+'</ol>'+
  '<p class="mmn">'+L('XP: cada partida terminada (10–40, más si ganas; hasta 400 al día), cada medalla (bronce 30, plata 75, oro 200), cada día que entras (20 + 5 por día seguido, hasta 50) y explorar fichas, países, historias y secciones (hasta 60 al día). Los empleos son los del Ejército de Tierra, de Soldado a General de Ejército (Wikipedia, «Escalafón militar de España»). Las divisas son dibujos genéricos.','XP: every finished game (10–40, more if you win; up to 400 a day), every medal (bronze 30, silver 75, gold 200), every day you visit (20 + 5 per day in a row, up to 50) and exploring data sheets, countries, stories and sections (up to 60 a day). Ranks follow the Spanish Army, from Private (Soldado) to General (General de Ejército) (Wikipedia, “Escalafón militar de España”). The insignia are generic drawings.')+'</p></details>';
 h+=ghostCard();
 SEC.forEach(function(s){ var ms=MED.filter(function(m){ return m.sec===s[0]; }), g=ms.filter(function(m){ return ST.m[m.id]; }).length, fams=[];
  ms.forEach(function(m){ var F=fams.length?fams[fams.length-1]:null; if(F&&F[0].f===m.f) F.push(m); else fams.push([m]); });
  h+='<details class="mmsec" data-s="'+s[0]+'"'+(OPEN_SEC[s[0]]===false?'':' open')+'><summary><span class="mmsi">'+medSvg(ms[0],g>0,22)+'</span><b>'+esc(EN()?s[2]:s[1])+'</b><i>'+g+'/'+ms.length+'</i></summary><div class="mmgr">'+fams.map(famHTML).join('')+'</div></details>'; });
 h+='<section class="mmcode"><h3>'+L('Código de progreso','Progress code')+'</h3><p>'+L('Tu progreso está guardado solo en este dispositivo. Para llevarlo a otro (del ordenador al móvil o al revés): copia tu código aquí y pégalo allí con «Pegar código». Se juntan los dos: se queda la XP más alta y todas las medallas de los dos.','Your progress is saved on this device only. To take it to another one (computer to phone or the other way round): copy your code here and paste it there with “Paste code”. Both are merged: the higher XP and every medal from both are kept.')+'</p>'+
  '<div class="mmrow"><button type="button" class="mmb" id="mmcopy">'+L('Copiar mi código','Copy my code')+'</button><button type="button" class="mmb sec" id="mmpaste">'+L('Pegar código','Paste code')+'</button></div>'+
  '<div id="mmout" hidden><input type="text" readonly id="mmcv" aria-label="'+L('Tu código','Your code')+'"><p class="mmn" id="mmcm"></p></div>'+
  '<div id="mmin" hidden><textarea id="mmta" rows="3" placeholder="MAT-…" aria-label="'+L('Pega aquí el código','Paste the code here')+'"></textarea><div class="mmrow"><button type="button" class="mmb" id="mmload">'+L('Cargar progreso','Load progress')+'</button></div><p class="mmn" id="mmim"></p></div></section>'+
  '<p class="mmn">'+L('Sin cuentas ni servidor: nada sale de tu dispositivo. Si borras los datos del navegador se pierde, salvo que tengas tu código.','No accounts and no server: nothing leaves your device. Clearing your browser data erases it, unless you keep your code.')+'</p></div>';
 if(!OV){ OV=document.createElement('div'); OV.className='mmov'; OV.setAttribute('data-noi18n',''); document.body.appendChild(OV); document.documentElement.classList.add('mmlock'); addEventListener('keydown',onKey);
  OV.addEventListener('click',function(e){ if(e.target===OV) closePanel(); }); }
 OV.innerHTML=h; var bx=OV.querySelector('.mmbox'); if(re) bx.scrollTop=sc; else { try{ OV.querySelector('.mmx').focus({preventScroll:true}); }catch(e){} }
 OV.querySelector('.mmx').onclick=closePanel;
 [].forEach.call(OV.querySelectorAll('details.mmsec'),function(d){ d.addEventListener('toggle',function(){ OPEN_SEC[d.getAttribute('data-s')]=d.open; }); });
 OV.querySelector('#mmcopy').onclick=function(){ var c=makeCode(), o=OV.querySelector('#mmout'), v=OV.querySelector('#mmcv'), m=OV.querySelector('#mmcm'); o.hidden=false; v.value=c;
  var ok=function(){ m.textContent=L('Copiado. Pégalo en tu otro dispositivo (por ejemplo, mándatelo por WhatsApp).','Copied. Paste it on your other device (for example, send it to yourself on WhatsApp).'); };
  var no=function(){ try{ v.focus(); v.select(); document.execCommand('copy'); ok(); }catch(e){ m.textContent=L('Mantén pulsado el código para copiarlo.','Press and hold the code to copy it.'); } };
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(ok,no); else no(); };
 OV.querySelector('#mmpaste').onclick=function(){ var i=OV.querySelector('#mmin'); i.hidden=false; var t=OV.querySelector('#mmta'); try{ t.focus(); }catch(e){}
  if(navigator.clipboard&&navigator.clipboard.readText) navigator.clipboard.readText().then(function(s){ if(s&&/MAT/i.test(s)&&!t.value) t.value=s.trim(); },function(){}); };
 OV.querySelector('#mmload').onclick=function(){ var t=OV.querySelector('#mmta'), m=OV.querySelector('#mmim'); try{ var r2=loadCode(t.value); openPanel(true);
   var m2=OV.querySelector('#mmim'), i2=OV.querySelector('#mmin'); if(i2) i2.hidden=false; var ta2=OV.querySelector('#mmta'); if(ta2){ ta2.style.display='none'; if(ta2.nextElementSibling) ta2.nextElementSibling.style.display='none'; } if(m2){ m2.className='mmn ok'; try{ setTimeout(function(){ m2.scrollIntoView({block:'center',behavior:'smooth'}); },30); }catch(_){} m2.textContent=L('Progreso cargado: ','Progress loaded: ')+rname(r2.rank)+' · '+r2.med+' '+(r2.med===1?L('medalla','medal'):L('medallas','medals'))+(r2.added?' ('+r2.added+(r2.added===1?L(' nueva)',' new)'):L(' nuevas)',' new)')):''); } }
  catch(e){ m.className='mmn ko'; m.textContent=e.message==='crc'?L('El código no cuadra: revisa que esté completo y sin cambios.','The code does not check out: make sure it is complete and unchanged.'):e.message==='ver'?L('Ese código es de una versión más nueva de M.A.T. Recarga la página.','That code comes from a newer version of M.A.T. Reload the page.'):L('Eso no parece un código de progreso de M.A.T.','That does not look like an M.A.T progress code.'); } };
}
addEventListener('hashchange',function(){ if(OV) closePanel(); });

/* ---------- Estilos ---------- */
function css(){ if(document.getElementById('mmcss')) return; var s=document.createElement('style'); s.id='mmcss'; s.textContent=
 '.topnav .ddb.mmbtn{font-size:11px;flex:0 0 auto;margin:0}.topnav .ddb.mmbtn .mml{display:inline}'+
 '@media (max-width:520px){.topnav .ddb{padding:0 5px;gap:2px}.topnav .ddb svg{width:8px;height:8px}.topnav .ddb.mmbtn{font-size:10.5px;letter-spacing:0}.topnav > a{min-width:32px;padding:0 4px}}@media (max-width:440px){.topnav{gap:1px}.topnav .ddb{padding:0 4px}.topnav > a{min-width:30px;padding:0 3px}.topnav .langsw{min-width:32px;padding:0 5px}}@media (max-width:420px){.topnav{gap:0}.topnav .ddb{padding:0 3px}.topnav > a{min-width:28px;padding:0 2px}.topnav .langsw{min-width:30px;padding:0 4px}}@media (max-width:389px){.topnav .ddb{padding:0 3px;font-size:12.5px;letter-spacing:0}.topnav .ddb.mmbtn{font-size:10px;padding:0 2px}.topnav > a{min-width:25px;padding:0 2px}.topnav > a svg{width:18px;height:18px}.topnav .langsw{min-width:28px;padding:0 3px}header.top .brand{font-size:16px}}@media (max-width:359px){.topnav .ddb{padding:0 2px;font-size:12px}.topnav .ddb.mmbtn{font-size:9.5px;padding:0 1px}.topnav .ddb svg{width:7px;height:7px}.topnav > a{min-width:23px;padding:0 1px}.topnav .langsw{min-width:25px;padding:0 2px;font-size:11px}header.top .brand{font-size:14.5px;letter-spacing:.02em}}'+
'.mmgh{display:inline-flex;vertical-align:middle;margin:0 0 0 8px;padding:0;width:34px;height:34px;border-radius:8px;background:#111;border:1px solid rgba(255,255,255,.4);align-items:center;justify-content:center;position:relative;top:-3px;cursor:pointer;line-height:0;-webkit-tap-highlight-color:transparent}.mmgh svg{display:block}'+
 '.mmgo{position:fixed;inset:0;z-index:9600;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(2,8,4,.92);opacity:0;transition:opacity .25s;cursor:pointer}.mmgo.in{opacity:1}'+
 '.mmgb{max-width:420px;width:100%;text-align:center;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#7dff8a;border:1px solid rgba(125,255,138,.45);border-radius:12px;padding:22px 18px;background:repeating-linear-gradient(0deg,rgba(125,255,138,.04) 0 2px,transparent 2px 4px),#04110a;box-shadow:0 0 30px rgba(60,255,90,.18);transform:scale(.96);transition:transform .25s}.mmgo.in .mmgb{transform:none}'+
 '.mmgb .mmsk{display:block;margin:0 auto 10px;filter:drop-shadow(0 0 8px rgba(125,255,138,.5))}.mmgb p{margin:8px 0}.mmgb .l1{font-size:20px;font-weight:800;letter-spacing:.06em;color:#a8ffb0}.mmgb .l2{font-size:14.5px;color:#cfe9d0}.mmgb .l3{font-size:15px;font-weight:700}.mmgb .l4{font-size:13px;opacity:.8}'+
 '.mmghc{display:flex;gap:14px;align-items:center;margin:14px 0 6px;padding:12px 14px;border-radius:12px;background:#0d0d0d;border:1px solid #3a3a3a;color:#8a8a8a}.mmghc.on{background:linear-gradient(135deg,#050505,#1c1c1c);border-color:#e9e9e9;color:#f2f2f2;box-shadow:0 0 0 1px #000,0 0 18px rgba(255,255,255,.08)}'+
 '.mmghi{flex:0 0 58px;height:58px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1a1a1a;border:2px solid #444}.mmghc.on .mmghi{background:#000;border-color:#fff}.mmghi b{font-size:26px;color:#666}'+
 '.mmghc .mmghs{display:inline-block;font-size:10.5px;letter-spacing:.14em;font-weight:800;padding:2px 6px;border-radius:4px;background:#2a2a2a;color:#bbb;margin-bottom:3px}.mmghc.on .mmghs{background:#fff;color:#000}.mmghc>div>b{display:block;font-size:17px;letter-spacing:.08em}.mmghc p{margin:2px 0 0;font-size:13px;line-height:1.35}'+
  'html.mmlock,html.mmlock body{overflow:hidden}'+
 '.mmov{position:fixed;inset:0;z-index:9000;background:rgba(5,6,4,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);display:flex;justify-content:center;align-items:flex-start;padding:max(10px,env(safe-area-inset-top)) 10px 10px}'+
 '.mmbox{position:relative;width:100%;max-width:880px;max-height:calc(100vh - 20px);max-height:calc(100dvh - 20px);overflow:auto;overscroll-behavior:contain;background:#0f110d;border:1px solid #2a2e24;border-radius:16px;padding:18px 16px 22px;color:var(--tx,#ecebe4);font-size:14px;line-height:1.45;box-sizing:border-box}'+
 '.mmbox h2{font-family:Anton,Impact,sans-serif;font-weight:400;letter-spacing:.03em;font-size:26px;margin:0 44px 12px 0}.mmbox h3{font-family:Anton,Impact,sans-serif;font-weight:400;letter-spacing:.03em;font-size:20px;margin:0 0 6px}'+
 '.mmx{position:absolute;top:10px;right:10px;width:40px;height:40px;border-radius:50%;border:1px solid #2f3428;background:#171a13;color:#ecebe4;font-size:18px;cursor:pointer}'+
 '.mmrk{display:flex;gap:14px;align-items:center;background:#151810;border:1px solid #262a1f;border-radius:12px;padding:12px}.mmrk>svg{flex:0 0 auto}.mmrt{flex:1;min-width:0}.mmrt .k{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9aa384}'+
 '.mmrt>b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:24px;letter-spacing:.02em;line-height:1.1}.mmrt small{display:block;color:#9aa384;font-size:12px}'+
 '.mmbar{position:relative;height:10px;border-radius:6px;background:#262a1f;overflow:hidden;margin:8px 0 6px}.mmbar i{position:absolute;left:0;top:0;bottom:0;border-radius:6px;background:linear-gradient(90deg,#8fa33a,var(--lime,#c8f03c))}.mmbar.sm{height:6px;margin:3px 0}'+
 '.mmxp{font-size:12.5px;color:#c9cbbd}.mmst{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.mmst>div{background:#151810;border:1px solid #262a1f;border-radius:10px;padding:8px 10px;text-align:center}.mmst b{display:block;font-size:20px}.mmst span{font-size:11.5px;color:#9aa384}'+
 '.mmlad{margin:4px 0 10px;border:1px solid #262a1f;border-radius:10px;padding:8px 10px}.mmlad summary,.mmsec summary{cursor:pointer;font-weight:600}.mmlad ol{list-style:none;margin:8px 0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px 12px}'+
 '.mmlad li{display:flex;align-items:center;gap:8px;font-size:13px;color:#8d917f}.mmlad li.ok{color:#c9cbbd}.mmlad li.on{color:var(--lime,#c8f03c);font-weight:700}.mmlad li span{flex:1;min-width:0}.mmlad li i{font-style:normal;font-size:11.5px;color:#8d917f}'+
 '.mmsec{border-top:1px solid #22261d;padding:8px 0}.mmsec summary{display:flex;align-items:center;gap:8px;list-style:none;padding:4px 0}.mmsec summary::-webkit-details-marker{display:none}.mmsec summary b{flex:1;min-width:0;font-size:15px}.mmsec summary i{font-style:normal;color:#9aa384;font-size:13px}'+
 '.mmsec summary:after{content:"▾";color:#9aa384;transition:transform .15s}.mmsec:not([open]) summary:after{transform:rotate(-90deg)}.mmsi{display:flex}'+
 '.mmgr{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:8px;margin-top:6px}.mmc{display:flex;gap:10px;align-items:center;background:#13150f;border:1px solid #22261d;border-radius:10px;padding:9px 10px;min-width:0}.mmts{display:flex;gap:2px;flex:0 0 auto}.mmt{display:flex;flex-direction:column;align-items:center;width:36px}.mmt i{font-style:normal;font-size:10.5px;font-weight:700;color:#80837a;white-space:nowrap}.mmt.on i.tb{color:#c98b4f}.mmt.on i.tp{color:#c4ccd4}.mmt.on i.to{color:#e6be55}.mmc.full{border-color:#6a5a26}.mmnx{font-style:normal;color:#c9cbbd;font-weight:600}.mmrq{display:block;font-size:11px;color:#8d917f;margin-top:3px}'+
 '.mmc.on{background:#181c11;border-color:#3b4426}.mmc>svg{flex:0 0 auto}.mmct{flex:1;min-width:0}.mmct>b{display:block;font-size:13.5px;line-height:1.25}.mmct p{margin:2px 0 3px;font-size:12px;color:#a9ac9c;line-height:1.35}.mmc:not(.on) .mmct>b{color:#b9bbb0}'+
 '.mmtr{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;font-weight:700}.mmtr.tb{color:#c98b4f}.mmtr.tp{color:#c4ccd4}.mmtr.to{color:#e6be55}.mmc:not(.on) .mmtr{color:#80837a}'+
 '.mmpg{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#c9cbbd}.mmpg .mmbar{flex:1;min-width:30px}.mmpg b{font-weight:600;white-space:nowrap}.mmok{font-size:11.5px;color:var(--lime,#c8f03c)}'+
 'svg.mmmed.off{filter:grayscale(1);opacity:.42}'+
 '.mmcode{margin-top:12px;border:1px solid #2f3428;border-radius:12px;padding:12px;background:#13160f}.mmcode p{margin:0 0 8px;font-size:13px;color:#c9cbbd}.mmrow{display:flex;gap:8px;flex-wrap:wrap}'+
 '.mmb{min-height:42px;padding:0 16px;border-radius:999px;border:1px solid var(--lime,#c8f03c);background:var(--lime,#c8f03c);color:#11130c;font:inherit;font-weight:700;font-size:14px;cursor:pointer}.mmb.sec{background:none;color:var(--lime,#c8f03c)}'+
 '#mmout,#mmin{margin-top:10px}#mmcv,#mmta{width:100%;box-sizing:border-box;background:#0b0c0a;color:#ecebe4;border:1px solid #3a3f31;border-radius:8px;padding:10px;font:13px ui-monospace,Menlo,Consolas,monospace;word-break:break-all}#mmta{resize:vertical;margin-bottom:8px}'+
 '.mmn{font-size:12px;color:#8d917f;margin:8px 0 0}.mmn.ok{color:var(--lime,#c8f03c)}.mmn.ko{color:#ff8a6b}'+
 '.mmtoast{position:fixed;left:50%;top:max(64px,calc(env(safe-area-inset-top) + 58px));z-index:9001;transform:translate(-50%,-14px);opacity:0;display:flex;align-items:center;gap:10px;max-width:min(92vw,380px);padding:9px 16px 9px 10px;border-radius:14px;border:1px solid #6a5a26;background:rgba(18,20,14,.96);color:#ecebe4;box-shadow:0 10px 30px rgba(0,0,0,.5);font:inherit;text-align:left;cursor:pointer;transition:opacity .3s,transform .3s}'+
 '.mmtoast.in{opacity:1;transform:translate(-50%,0)}.mmtoast.up{border-color:var(--lime,#c8f03c)}.mmtoast>svg{flex:0 0 auto}.mmtoast div{min-width:0}.mmtoast b{display:block;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:19px;letter-spacing:.04em;color:#e6be55}.mmtoast.up b{color:var(--lime,#c8f03c)}'+
 '.mmtoast span{display:block;font-weight:700;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mmtoast small{display:block;font-size:11.5px;color:#9aa384}'+
 '@media (prefers-reduced-motion:reduce){.mmtoast{transition:none}}'+
 '@media (max-width:520px){.mmbox{padding:16px 12px 20px}.mmbox h2{font-size:23px}.mmgr{grid-template-columns:1fr}.mmt{width:33px}.mmrk{padding:10px}.mmrt>b{font-size:21px}.mmlad ol{grid-template-columns:1fr}}';
 document.head.appendChild(s); }

/* ---------- Arranque ---------- */
var LOG=[];
window.MAT_MED={event:function(n,o){ try{ LOG.push(n); if(LOG.length>40) LOG.shift(); ev(n,o); }catch(e){ try{ console.warn('MAT_MED',e); }catch(_){} } },open:function(){ openPanel(); },code:makeCode,load:loadCode,state:function(){ load(); return {xp:xp(),rank:rankOf(xp()),medals:Object.keys(ST.m).length,total:MED.length,c:JSON.parse(JSON.stringify(ST.c))}; },list:function(){ return MED.map(function(m){ return m.id; }); },log:function(){ return LOG.slice(); },cat:function(){ return JSON.parse(JSON.stringify({MED:MED,SEC:SEC,RANKS:RANKS,TIER:TIER,COM:typeof COM!=='undefined'?COM:null})); }};
function boot(){ try{ load(); onRoute(); btn(); }catch(e){} }
addEventListener('hashchange',function(){ try{ onRoute(); }catch(e){} });
setInterval(function(){ try{ if(location.hash!==lastH) onRoute(); if(!BTN||!BTN.isConnected) btn(); ghostMount(); }catch(e){} },1000);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
