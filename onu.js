(function(){
"use strict";
// ======================= M.A.T · ONU (Naciones Unidas) =======================
// Sección propia (#/onu). Datos: onu.json.gz (Wikipedia, cada fila con su fuente).
window.MAT_ONU_IDS={"b-rg-31-nyala":"u","b-patria-pasi":"u","b-rg-32-scout":"u","b-m113-armored-personnel-carrier":"u","b-buffel":"u","b-otokar-cobra":"u","b-mahindra-armored-light-specialist-vehicle":"u","l-commercial-utility-cargo-vehicle":"u","mil-mi-8":"u","ilyushin-il-76":"u","selex-es-falco":"u","antonov-an-74":"u","bombardier-crj100-200":"u","b-unibuffel":"u","b-ot-64-skot":"u","b-btr-70":"u","b-gila-apc":"u","b-terrangbil-m-42-kp":"u","b-m3-scout-car":"u","b-m8-greyhound":"u","saab-29-tunnan":"u","north-american-f-86-sabre":"u","b-bmr":"c","l-uro-vamtac":"c","b-iveco-lmv":"c","t-centauro-tank-destroyer":"c","b-vec-m1":"c","t-leclerc":"c","l-char-de-depannage-dng-dcl":"c","b-vehicule-blinde-leger":"c","b-caesar-self-propelled-howitzer":"c","b-dardo-infantry-fighting-vehicle":"c","b-vehicule-de-l-avant-blinde":"c","b-pandur-ii-88":"c","s-sigma-class-design":"c","b-nurol-ejder":"c","b-iag-guardian":"c","b-panhard-aml":"c","l-jcb-hmee":"c","l-sisu-e13tp":"c","b-tm-170":"c","s-type-056-corvette":"c","s-niteroi-class-frigate":"c","b-bushmaster-protected-mobility-vehicle":"c","b-katmerciler-hzr":"c","b-alvis-tactica":"c","bell-212":"c","md-helicopters-md-500":"c","mil-mi-17":"c","b-type-07p":"c","b-first-win":"c","mil-mi-24":"c","b-pindad-komodo":"c","b-ratel-ifv":"c","b-avgp":"c","b-condor-apc":"c","b-vn4":"c","b-ordnance-factory-board-mine-protected-vehicle":"c","b-btr-80":"c","b-wz-551":"c","b-kalyani-m4":"c","alenia-c-27j-spartan":"c"};
var DATA=null, DP=null;
function load(){ if(DP) return DP; DP=window.MAT_GET('onu.json.gz').then(function(d){DATA=d;return d;}); return DP; }
var CATS=[['heli','Helicópteros','Helicopters'],['avion','Aviones y drones','Aircraft & drones'],['carro','Carros de combate','Tanks'],['blind','Blindados','Armoured vehicles'],['art','Artillería','Artillery'],['veh','Vehículos','Vehicles'],['buque','Buques','Ships']];
var MORD=['UNIFIL','UNDOF','UNFICYP','MINUSCA','MONUSCO','UNMISS','UNISFA','MINURSO','UNMIK','UNTSO','UNMOGIP'];
function catOf(a,x){ var c=a?a.cat:x.cat, t=a?a.tipo:'';
  if(c==='helicopteros') return 'heli'; if(c==='aviones') return 'avion'; if(c==='tanques') return 'carro';
  if(c==='blindados') return (t==='b_art'||t==='b_mlr'||t==='b_aa')?'art':'blind';
  if(c==='logistica') return 'veh'; if(c==='buques'||c==='submarinos') return 'buque'; return 'blind'; }
window.MAT_ONU=function(app,X){
  var EN=window.MAT_LANG==='en', P=X.P, BY=X.BY, esc=X.esc;
  function L(es,en){return EN?en:es;}
  if(!DATA){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('Cargando ONU…','Loading UN…')+'</p>'; load().then(function(){window.MAT_ONU(app,X);}).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('No se pudieron cargar los datos. Comprueba la conexión.','Could not load the data. Check your connection.')+'</p>';}); return;}
  var o=X.qs(), F=o.f==='act'?'act':o.f==='his'?'his':'';
  function nf(n){return n==null?'—':Math.round(n).toLocaleString(EN?'en-GB':'es-ES');}
  function pn(k){var p=P[k]; if(!p) return k; return EN&&window.MAT_T?window.MAT_T(p.n):p.n;}
  function src(L2){ return L2.map(function(i){var s=DATA.src[i]; return s?'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">Wikipedia'+(s[2]==='es'?' (es)':'')+': '+esc(s[0])+'</a>':'';}).filter(Boolean).join(' · '); }
  function keep(x){ return !F||(F==='act'?!x.h:!!x.h); }
  function item(x,withP){ var a=x.id&&BY[x.id], nm=x.n||(a?a.n:x.id), fav=a&&X.isFav&&X.isFav(a);
    var mis=x.mis?'<span class="onumis">'+esc(x.mis)+'</span>':'';
    var ds=(withP?X.flag(x.p,'mini')+esc(pn(x.p))+' · ':'')+(x.mis&&!withP?mis+' · ':'')+(x.h?'<span class="gtag">'+L('Histórico','Historical')+'</span>':'<span class="gtag onuact">'+L('Actual','Current')+'</span>');
    var inner='<div class="th">'+(a?X.thumb(a):'<div class="nofoto">'+L('Sin ficha en M.A.T','No M.A.T profile')+'</div>')+'</div><div class="m"><div class="nm">'+esc(nm)+(fav?' <span class="favs" aria-label="favorito">★</span>':'')+'</div><div class="ds">'+ds+'</div></div><div class="rt">'+nf(x.q)+'</div>';
    return '<div class="onuit">'+(a?'<a class="row" href="#/a/'+a.id+'">'+inner+'</a>':'<div class="row onunolink">'+inner+'</div>')+'<p class="onunote">'+esc(EN?x.en:x.es)+' <span class="onusrc">'+L('Fuente','Source')+': '+src(x.s)+'</span></p></div>'; }
  function group(list,withP){ var g={}; list.forEach(function(x){var k=catOf(x.id&&BY[x.id],x); (g[k]=g[k]||[]).push(x);});
    return g; }
  var h=X.crumbs([[L('Inicio','Home'),'#/'],['ONU']]);
  h+='<div data-noi18n class="onupg"><h1 style="display:flex;align-items:center;gap:12px"><img class="flag" src="flags/un.png" alt=""><span>'+L('ONU · Naciones Unidas','UN · United Nations')+'</span></h1>';
  h+='<p class="sub">'+esc(EN?DATA.intro.en:DATA.intro.es)+' <span class="onusrc">'+L('Fuente','Source')+': '+src(DATA.intro.s)+'</span></p>';
  var U=DATA.u.filter(keep), C=DATA.c.filter(keep);
  h+='<div class="chips" role="group" aria-label="'+L('Periodo','Period')+'"><a class="chip" href="#/onu" aria-pressed="'+(!F)+'">'+L('Todo','All')+'</a><a class="chip" href="#/onu?f=act" aria-pressed="'+(F==='act')+'">'+L('Actual','Current')+'</a><a class="chip" href="#/onu?f=his" aria-pressed="'+(F==='his')+'">'+L('Histórico','Historical')+'</a></div>';
  // ---- missions
  var M=DATA.mis.slice().sort(function(a,b){return MORD.indexOf(a.a)-MORD.indexOf(b.a);});
  h+='<details class="fzcat onumisd"><summary><span>'+L('Misiones de paz activas','Current peacekeeping missions')+'</span><span class="cnt">'+M.length+'</span></summary><div class="list">'+M.map(function(m){
    return '<div class="row onumrow"><div class="m"><div class="nm"><b>'+esc(m.a)+'</b> · '+esc(EN?m.pen:m.pes)+'</div><div class="ds">'+esc(EN?m.en:m.es)+'</div><div class="ds">'+L('Desde','Since')+' '+m.y+' · '+L('Efectivos','Personnel')+': '+esc((EN?m.pn:m.pe)||'—')+'</div>'+(m.nes?'<div class="ds onumn">'+esc(EN?m.nen:m.nes)+'</div>':'')+'<div class="ds onusrc">'+src(m.s)+'</div></div></div>';}).join('')+'</div></details>';
  h+='<p class="note">'+M.map(function(m){return esc(m.a);}).join(' · ')+'</p>';
  // ---- block A: UN-owned / UN-operated
  var GA=group(U);
  h+='<h2>'+L('Material de la ONU','UN equipment')+' <span class="cnt">'+U.length+'</span></h2><p class="note">'+L('Material que Wikipedia atribuye a la ONU o a una misión suya: vehículos del equipo de la misión, aviones fletados con librea de la ONU, drones propios y, en histórico, el material de las primeras misiones.','Equipment Wikipedia credits to the UN or one of its missions: mission-owned vehicles, chartered aircraft in UN livery, its own drones and, as historical, the equipment of the early missions.')+'</p>';
  if(!U.length) h+='<p class="empty">—</p>';
  CATS.forEach(function(c){ var l=GA[c[0]]; if(!l) return; h+='<details class="fzcat onucat" open><summary><span>'+(EN?c[2]:c[1])+'</span><span class="cnt">'+l.length+'</span></summary><div class="list">'+l.map(function(x){return item(x,false);}).join('')+'</div></details>'; });
  // ---- block B: contributed by countries, per mission
  h+='<h2>'+L('Equipo aportado por países en misiones de la ONU','Equipment contributed by countries to UN missions')+' <span class="cnt">'+C.length+'</span></h2><p class="note">'+L('Cada fila: país que lo lleva y misión activa. Solo lo que dice Wikipedia; la cifra es la del artículo o «—».','Each row: contributing country and current mission. Only what Wikipedia says; the figure is the article\'s or "—".')+'</p>';
  var byM={}; C.forEach(function(x){(byM[x.mis]=byM[x.mis]||[]).push(x);});
  MORD.forEach(function(a){ var l=byM[a]; if(!l) return; var m=DATA.mis.filter(function(z){return z.a===a;})[0]; var gB=group(l);
    var ps={}; l.forEach(function(x){ps[x.p]=1;});
    h+='<details class="fzcat onucat onumc"><summary><span>'+esc(a)+(m?' · '+esc(EN?m.pen:m.pes):'')+'</span><span class="cnt">'+l.length+'</span></summary><div class="onuflags">'+Object.keys(ps).map(function(k){return X.flag(k,'mini');}).join('')+'</div>';
    CATS.forEach(function(c){ var g=gB[c[0]]; if(!g) return; h+='<div class="kicker onuk">'+(EN?c[2]:c[1])+'</div><div class="list">'+g.map(function(x){return item(x,true);}).join('')+'</div>'; });
    h+='</details>'; });
  h+='<p class="note">'+L('Datos de Wikipedia (inglés y español), revisados el ','Data from Wikipedia (English and Spanish), checked on ')+esc(DATA.fecha)+L('. Toca un modelo para abrir su ficha y guardarlo en favoritos.','. Tap a model to open its profile and save it to favourites.')+'</p></div>';
  X.set(h,'ONU');
};
})();
