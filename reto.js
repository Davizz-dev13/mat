(function(){
"use strict";
// M.A.T · Reto M.A.T (#/reto) — juego diario de adivinar la ficha secreta por posiciones. Código propio de M.A.T.
// Cada día (fecha de Madrid) hay una ficha secreta, la misma para todos. Cada intento recibe una POSICIÓN
// (1 = la secreta) según lo parecido que es: categoría y tipo, familia/variantes, países y operadores, año, tamaño y prestaciones.
var SECRETS=["eurofighter-typhoon", "t-leopard-2e", "s-spanish-aircraft-carrier-principe-de-asturias", "t-merkava", "grumman-f-14-tomcat", "t-chieftain", "s-borei-class-submarine", "w-aim-120-amraam", "s-yasen-class-submarine", "b-bmp-2", "b-flakpanzer-gepard", "lockheed-martin-f-35-lightning-ii", "eurocopter-ec135", "s-queen-elizabeth-class-aircraft-carrier", "s-slava-class-cruiser", "s-scorpene-class-submarine", "b-ascod", "t-k2-black-panther", "t-leopard-2", "mikoyan-gurevich-mig-15", "t-is-2", "w-kalibr-missile-family", "t-t-34", "w-tomahawk-missile", "general-atomics-mq-9-reaper", "w-iris-t", "t-leclerc", "mil-mi-8", "t-t-72", "saab-jas-39-gripen", "agustawestland-aw159-wildcat", "b-panzerhaubitze-2000", "sikorsky-sh-60-seahawk", "b-zsu-23-4-shilka", "mil-mi-24", "w-fim-92-stinger", "s-zumwalt-class-destroyer", "s-ticonderoga-class-cruiser", "messerschmitt-bf-109", "l-uro-vamtac", "baykar-bayraktar-tb2", "s-spanish-ship-juan-carlos-i", "lockheed-c-130-hercules", "northrop-f-5", "w-rt-2pm-topol", "focke-wulf-fw-190", "sukhoi-su-35", "sikorsky-uh-60-black-hawk", "w-nlaw", "vought-f4u-corsair", "northrop-grumman-rq-4-global-hawk", "w-buk-missile-system", "w-harpoon-missile", "casa-c-101-aviojet", "hawker-hurricane", "b-m142-himars", "w-9k720-iskander", "s-galicia-class-landing-platform-dock", "t-amx-30", "bell-oh-58-kiowa", "w-nasams", "airbus-c-295", "mikoyan-gurevich-mig-25", "b-caesar-self-propelled-howitzer", "b-m270-multiple-launch-rocket-system", "w-taurus-kepd-350", "l-humvee", "sikorsky-ch-53e-super-stallion", "t-challenger-2", "w-lgm-30-minuteman", "mcdonnell-douglas-f-a-18-hornet", "lockheed-f-117-nighthawk", "b-tos-1", "antonov-an-2", "kamov-ka-50", "boeing-b-17-flying-fortress", "t-t-14-armata", "w-fgm-148-javelin", "t-m4-sherman", "nhindustries-nh90", "w-aim-9-sidewinder", "boeing-ch-47-chinook", "boeing-c-17-globemaster-iii", "tupolev-tu-95", "general-atomics-mq-1-predator", "mil-mi-26", "b-patria-amv", "avro-lancaster", "w-iron-dome", "casa-c-212-aviocar", "t-leopard-1", "w-exocet", "rockwell-b-1-lancer", "s-gerald-r-ford-class-aircraft-carrier", "s-iowa-class-battleship", "b-bm-21-grad", "sukhoi-su-25", "bell-ah-1-cobra", "b-bmp-3", "junkers-ju-87", "w-9m133-kornet", "w-s-300-missile-system", "mikoyan-mig-31", "sukhoi-su-30", "s-hms-dreadnought-1906", "b-m109-howitzer", "bell-uh-1-iroquois", "mcdonnell-douglas-f-4-phantom-ii", "westland-lynx", "eurocopter-as332-super-puma", "s-bismarck-class-battleship", "s-yamato-class-battleship", "gloster-meteor", "t-panther-tank", "s-seawolf-class-submarine", "s-chinese-aircraft-carrier-liaoning", "s-arleigh-burke-class-destroyer", "s-kirov-class-battlecruiser", "s-alvaro-de-bazan-class-frigate", "dassault-rafale", "t-centauro-tank-destroyer", "eurocopter-as532-cougar", "s-agosta-class-submarine", "dassault-mirage-2000", "tupolev-tu-22m", "w-mim-104-patriot", "airbus-a400m-atlas", "w-storm-shadow", "dassault-mirage-iii", "s-los-angeles-class-submarine", "b-brdm-2", "northrop-grumman-e-2-hawkeye", "t-tiger-i", "messerschmitt-me-262", "canadair-cl-415", "sukhoi-su-27", "boeing-f-a-18e-f-super-hornet", "pilatus-pc-21", "t-tiger-ii", "eurocopter-tiger", "aerospatiale-alouette-iii", "supermarine-spitfire", "b-joint-light-tactical-vehicle", "north-american-f-86-sabre", "chengdu-j-20", "b-btr-80", "north-american-p-51-mustang", "s-nimitz-class-aircraft-carrier", "chengdu-j-10", "sukhoi-su-57", "s-uss-enterprise-cvn-65", "t-m1-abrams", "fairchild-republic-a-10-thunderbolt-ii", "s-akula-class-submarine", "s-kilo-class-submarine", "w-meteor-missile", "lockheed-f-104-starfighter", "t-m60-tank", "w-ugm-133-trident-ii", "mil-mi-17", "lockheed-martin-f-22-raptor", "t-ariete", "mil-mi-28", "boeing-e-3-sentry", "hawker-siddeley-harrier", "lockheed-sr-71-blackbird", "mikoyan-mig-29", "s-spanish-oiler-cantabria", "boeing-ah-64-apache", "lockheed-c-5-galaxy", "bell-boeing-v-22-osprey", "boeing-p-8-poseidon", "t-t-90", "boeing-b-52-stratofortress", "sukhoi-su-34", "b-combat-vehicle-90", "w-s-400-missile-system", "tupolev-tu-160", "mikoyan-gurevich-mig-21", "s-moskva-class-helicopter-carrier", "s-kuznetsov-class-aircraft-carrier", "s-mistral-class-landing-helicopter-dock", "s-hms-hood", "mcdonnell-douglas-av-8b-harrier-ii", "mcdonnell-douglas-f-15-eagle", "mitsubishi-a6m-zero", "general-dynamics-f-16-fighting-falcon", "b-mt-lb", "b-stryker", "b-pantsir-missile-system", "boeing-b-29-superfortress", "s-ohio-class-submarine", "s-virginia-class-submarine", "t-t-80", "b-boxer-armoured-fighting-vehicle", "t-m48-patton", "s-french-aircraft-carrier-charles-de-gaulle", "b-m2-bradley", "w-kh-47m2-kinzhal"];
var START=Date.UTC(2026,9,21); // Reto #1 = 21 oct 2026
var GREEN=150, YELLOW=900;
function madridDay(){ try{ var s=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); var p=s.split('-'); return Date.UTC(+p[0],+p[1]-1,+p[2]); }catch(e){ var d=new Date(); return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()); } }
function todayNum(){ return Math.floor((madridDay()-START)/864e5)+1; }
function nrm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim(); }
var STOP={clase:1,class:1,type:1,tipo:1,de:1,the:1,uss:1,hms:1,buque:1,spanish:1,ship:1,mk:1,model:1,modelo:1,del:1,la:1,el:1,serie:1,series:1,general:1,dynamics:1,lockheed:1,martin:1,boeing:1,mcdonnell:1,douglas:1,north:1,american:1,mil:1,sukhoi:1,mikoyan:1,gurevich:1,dassault:1,northrop:1,grumman:1,bell:1,sikorsky:1,eurocopter:1,airbus:1,aerospatiale:1,agustawestland:1,de2:1};
function desig(n){ var t=nrm(n).split(' '); for(var i=0;i<t.length;i++){ var m=/^([a-z]{1,4})(\d{1,4})/.exec(t[i]); if(m) return m[1]+m[2]; if(/^[a-z]{1,8}$/.test(t[i])&&!STOP[t[i]]&&t[i+1]&&/^\d/.test(t[i+1])) return t[i]+(/^\d+/.exec(t[i+1])[0]); } return ''; }
function word1(n){ var t=nrm(n).split(' '); for(var i=0;i<t.length;i++){ if(t[i].length>2&&!STOP[t[i]]&&!/\d/.test(t[i])) return t[i]; } return ''; }
function fabk(f){ return f?nrm(f).split(' ')[0]:''; }
function lg(a,b){ if(!(a>0&&b>0)) return null; var r=Math.abs(Math.log(a/b))/Math.log(3); return Math.max(0,1-r); }
var NUM=['peso','vel','alc','cal','desp','eslora','trip_n','pot'];
var PREP=null;
function prep(I){ if(PREP) return PREP; PREP=I.map(function(a){ var ops=a.ops?Object.keys(a.ops):[]; return {a:a,d:desig(a.n),w:word1(a.n),f:fabk(a.fab),ops:ops,root:a.vde||a.id}; }); return PREP; }
function sim(s,x){
  var a=s.a,b=x.a,v=0;
  if(a.cat===b.cat) v+=300;
  if(a.tipo===b.tipo) v+=260; else if(a.alt&&b.alt){ var c=0; for(var i=0;i<a.alt.length;i++) if(b.alt.indexOf(a.alt[i])>=0||b.tipo===a.alt[i]) c++; v+=Math.min(2,c)*55; }
  if(s.root===x.root||a.vde===b.id||b.vde===a.id) v+=240;
  if(s.d&&s.d===x.d) v+=200; else if(s.w&&s.w===x.w) v+=90;
  if(s.f&&s.f===x.f) v+=80;
  if(a.pais===b.pais) v+=110; else if(a.orig&&b.orig){ for(var j=0;j<a.orig.length;j++) if(b.orig.indexOf(a.orig[j])>=0){ v+=45; break; } }
  if(s.ops.length&&x.ops.length){ var inter=0,set={}; s.ops.forEach(function(k){set[k]=1;}); x.ops.forEach(function(k){ if(set[k]) inter++; }); v+=150*inter/(s.ops.length+x.ops.length-inter); }
  if(a.anio&&b.anio) v+=80*Math.max(0,1-Math.abs(a.anio-b.anio)/30);
  if(a.era&&a.era===b.era) v+=30;
  if(a.serv===b.serv) v+=20;
  for(var k=0;k<NUM.length;k++){ var q=lg(a[NUM[k]],b[NUM[k]]); if(q!==null) v+=45*q; }
  return v;
}
var RANK={};
function ranking(I,sid){ if(RANK[sid]) return RANK[sid]; var L=prep(I), s=null; for(var i=0;i<L.length;i++) if(L[i].a.id===sid){ s=L[i]; break; } if(!s) return null;
  var arr=L.map(function(x){ return {id:x.a.id, v:x.a.id===sid?1e9:sim(s,x)}; }); arr.sort(function(p,q){ return q.v-p.v||(p.id<q.id?-1:1); });
  var pos={}, ord=[]; arr.forEach(function(r,i){ pos[r.id]=i+1; ord.push(r.id); }); RANK[sid]={pos:pos,ord:ord}; return RANK[sid]; }
function secretFor(num,BY){ if(num<1) return null; var n=SECRETS.length; for(var k=0;k<n;k++){ var id=SECRETS[(num-1+k)%n]; if(BY[id]) return id; } return null; }
function store(){ try{ var v=JSON.parse(localStorage.getItem('mat_reto')||'{}'); return v&&typeof v==='object'?v:{}; }catch(e){ return {}; } }
function save(S){ try{ localStorage.setItem('mat_reto',JSON.stringify(S)); }catch(e){} }
function streak(S,today){ var st=0, d=today; if(!(S[d]&&S[d].w&&S[d].live)) d=today-1; while(S[d]&&S[d].w&&S[d].live){ st++; d--; } return st; }
function best(S){ var b=0, cur=0, ks=Object.keys(S).map(Number).filter(function(x){return x>0;}).sort(function(a,b){return a-b;}), prev=-9; ks.forEach(function(k){ var g=S[k]; if(g.w&&g.live){ cur=(k===prev+1)?cur+1:1; prev=k; if(cur>b) b=cur; } }); return b; }
window.MAT_RETO=function(app,X){
  var EN=window.MAT_LANG==='en', esc=X.esc, I=X.I, BY=X.BY, P=X.P, CN=X.CN||{}, TIPOS=X.TIPOS||[];
  var T=EN?{h:'M.A.T Daily Challenge',home:'Home',sub:'Guess today\'s secret system. Every guess gets a position: 1 is the secret. The lower the number, the closer you are (same category and type, family, countries, year, size…).',ph:'Type a system: F-16, Leopard…',g:'Guess',hint:'Hint',give:'Give up',n:'Challenge',cred:'Mechanic inspired by the game Contexto (<a href="https://contexto.me/es/" target="_blank" rel="noopener">contexto.me</a>). M.A.T Daily Challenge is not affiliated with or endorsed by Contexto; code, texts and data are M.A.T\'s own.',att:'guesses',hints:'hints',won:'You got it!',lost:'The answer was',in:'in',share:'Share',copied:'Copied! Paste it in WhatsApp',streak:'Streak',bstreak:'Best streak',played:'Played',wins:'Wins',next:'New challenge in',prev:'Previous games',ficha:'See full entry',credit:'Photo',dup:'You already tried it',notf:'Pick a system from the list',how:'How to play',howt:'Type any system that is in M.A.T and pick it from the list. You have unlimited guesses. The position tells you how close it is to the secret: green = very close, yellow = getting there, red = far. "Hint" reveals a closer one. A new secret every day at midnight (Madrid time), the same for everyone.',last:'Last guess',today:'today',play:'Play',cont:'Continue',done:'Solved',gu:'Revealed',none:'Not played',sure:'Give up and see the answer?',past:'Playing a previous game (does not count for the streak).',back:'Back to today',of:'of',pos:'position',solvers:'people have solved it today',solver1:'person has solved it today'}
         :{h:'Reto M.A.T',home:'Inicio',sub:'Adivina el sistema secreto de hoy. Cada intento recibe una posición: el 1 es el secreto. Cuanto más bajo el número, más cerca estás (misma categoría y tipo, familia, países, año, tamaño…).',ph:'Escribe un sistema: F-16, Leopard…',g:'Probar',hint:'Pista',give:'Rendirse',n:'Reto',cred:'Mecánica inspirada en el juego Contexto (<a href="https://contexto.me/es/" target="_blank" rel="noopener">contexto.me</a>). Reto M.A.T no está afiliado ni respaldado por Contexto; código, textos y datos propios de M.A.T.',att:'intentos',hints:'pistas',won:'¡Lo has adivinado!',lost:'La respuesta era',in:'en',share:'Compartir',copied:'¡Copiado! Pégalo en WhatsApp',streak:'Racha',bstreak:'Mejor racha',played:'Jugados',wins:'Acertados',next:'Nuevo reto en',prev:'Juegos anteriores',ficha:'Ver la ficha',credit:'Foto',dup:'Ya lo has probado',notf:'Elige un sistema de la lista',how:'Cómo se juega',howt:'Escribe cualquier sistema que esté en M.A.T y elígelo de la lista. Tienes intentos ilimitados. La posición te dice lo cerca que está del secreto: verde = muy cerca, amarillo = te acercas, rojo = lejos. «Pista» te descubre uno más cercano. Cada día a medianoche (hora de Madrid) hay un secreto nuevo, el mismo para todos.',last:'Último intento',today:'hoy',play:'Jugar',cont:'Seguir',done:'Resuelto',gu:'Descubierto',none:'Sin jugar',sure:'¿Rendirte y ver la respuesta?',past:'Estás jugando un reto anterior (no cuenta para la racha).',back:'Volver al de hoy',of:'de',pos:'posición',solvers:'personas lo han resuelto hoy',solver1:'persona lo ha resuelto hoy'};
  var p=(X.p||[]), today=todayNum(), num=today;
  if(p[1]&&/^\d+$/.test(p[1])){ var q=+p[1]; if(q>=1&&q<=today) num=q; }
  var sid=secretFor(num,BY), R=sid?ranking(I,sid):null, S=store(), G=S[num]||{g:[],h:0};
  if(!R){ X.set('<p class="sub" style="padding:24px 0">'+(EN?'The challenge could not be loaded.':'No se pudo cargar el reto.')+'</p>',T.h); return; }
  var TOT=R.ord.length;
  function tipoName(a){ for(var i=0;i<TIPOS.length;i++) if(TIPOS[i].id===a.tipo&&TIPOS[i].c===a.cat) return TIPOS[i].n; return ''; }
  function catLbl(a){ var c=CN[a.cat]||a.cat; return EN&&window.MAT_T?window.MAT_T(c):c; }
  function color(pos){ return pos===1?'win':pos<=GREEN?'g':pos<=YELLOW?'y':'r'; }
  function width(pos){ if(pos===1) return 100; var w=100*Math.pow(1-Math.log(pos)/Math.log(TOT+1),1.6); return Math.max(3,Math.min(98,w)); }
  function rowH(id,last,isHint){ var a=BY[id], pos=R.pos[id]; if(!a) return ''; var c=color(pos);
    return '<div class="rt-row rt-'+c+(last?' rt-last':'')+'"><div class="rt-bar" style="width:'+width(pos).toFixed(1)+'%"></div><div class="rt-in"><span class="rt-nm">'+(isHint?'💡 ':'')+esc(a.n)+'<small>'+esc(catLbl(a))+'</small></span><span class="rt-pos">'+pos+'</span></div></div>'; }
  function finished(){ return G.w||G.gu; }
  function save1(){ S=store(); if(G.w&&num===today&&!G.gu) G.live=1; S[num]=G; save(S); }
  function counts(){ var c={g:0,y:0,r:0}; G.g.forEach(function(x){ var pos=R.pos[x.id||x]; if(pos===1) return; c[color(pos)==='g'?'g':color(pos)==='y'?'y':'r']++; }); return c; }
  function shareText(){ var c=counts(), n=G.g.length, url='https://matmilitar.es/#/reto';
    var head=G.w?(EN?'I solved M.A.T Daily Challenge #'+num+' in '+n+' '+(n===1?'guess':'guesses'):'Resolví el Reto M.A.T #'+num+' en '+n+' '+(n===1?'intento':'intentos')):(EN?'M.A.T Daily Challenge #'+num+': I gave up after '+n+' guesses':'Reto M.A.T #'+num+': me rendí tras '+n+' intentos');
    if(G.h) head+=EN?' ('+G.h+' '+(G.h===1?'hint':'hints')+')':' ('+G.h+' '+(G.h===1?'pista':'pistas')+')';
    return head+(G.w?' 🎯':' 🏳️')+'\n🟩 '+c.g+'  🟨 '+c.y+'  🟥 '+c.r+'\n'+url; }
  function doShare(btn){ var t=shareText(); function cp(){ var ok=function(){ btn.textContent=T.copied; setTimeout(function(){ btn.textContent=T.share; },2500); };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok,function(){ fb(); ok(); }); else { fb(); ok(); } }
    function fb(){ var ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{document.execCommand('copy');}catch(e){} document.body.removeChild(ta); }
    if(navigator.share){ navigator.share({text:t}).catch(function(e){ if(!e||e.name!=='AbortError') cp(); }); } else cp(); }
  function countdown(){ var now=new Date(); var ms; try{ var hm=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now).split(':').map(Number); ms=((23-hm[0])*3600+(59-hm[1])*60+(60-hm[2]))*1000; }catch(e){ ms=0; } var s=Math.max(0,Math.floor(ms/1000)); function z(n){return (n<10?'0':'')+n;} return z(Math.floor(s/3600)%24)+':'+z(Math.floor(s/60)%60)+':'+z(s%60); }
  function stats(){ var S2=store(), ks=Object.keys(S2).filter(function(k){ return S2[k]&&(S2[k].w||S2[k].gu); }); var w=ks.filter(function(k){ return S2[k].w; }).length;
    return '<div class="rt-stats"><div><b>'+ks.length+'</b><span>'+T.played+'</span></div><div><b>'+w+'</b><span>'+T.wins+'</span></div><div><b>'+streak(S2,today)+'</b><span>'+T.streak+'</span></div><div><b>'+best(S2)+'</b><span>'+T.bstreak+'</span></div></div>'; }
  function endBox(){ var a=BY[sid], im=a.img||{}, cr=EN?(im.cs_en||im.cs):im.cs; var n=G.g.length;
    var h='<section class="rt-end '+(G.w?'rt-ok':'rt-ko')+'"><div class="rt-endh">'+(G.w?T.won+' 🎯':T.lost)+'</div>';
    h+='<a class="rt-ph" href="#/a/'+encodeURIComponent(a.id)+'"><img src="'+esc(im.src||'')+'" alt="'+esc(a.n)+'"'+(im.th?' data-fb="'+esc(im.th)+'"':'')+'></a>';
    h+='<div class="rt-sn">'+X.flag(a.pais)+'<b>'+esc(a.n)+'</b></div><div class="rt-sd">'+esc(catLbl(a))+(tipoName(a)?' · '+esc(EN&&window.MAT_T?window.MAT_T(tipoName(a)):tipoName(a)):'')+(a.anio?' · '+a.anio:'')+'</div>';
    h+='<p class="rt-res">'+(G.w?(EN?'Solved in ':'Resuelto en ')+n+' '+T.att+(G.h?' · '+G.h+' '+T.hints:''):'')+'</p>';
    h+='<div class="rt-btns"><button type="button" class="rt-btn rt-pri" id="rtshare">'+T.share+'</button><a class="rt-btn" href="#/a/'+encodeURIComponent(a.id)+'">'+T.ficha+'</a></div>';
    if(im.credit) h+='<p class="rt-cr">'+T.credit+': <a href="'+esc(im.credit)+'" target="_blank" rel="noopener">'+esc(cr||(EN?'Wikimedia Commons (author and licence)':'Wikimedia Commons (autor y licencia)'))+'</a></p>';
    h+='<div id="rtsolv" class="rt-solv"></div>';
    h+=stats();
    if(num===today) h+='<p class="rt-next">'+T.next+' <b id="rtcd">'+countdown()+'</b></p>';
    return h+'</section>'; }
  function prevList(){ var h='<details class="rt-prev"><summary>'+T.prev+'</summary><div class="list">'; var S2=store();
    for(var k=today;k>=Math.max(1,today-59);k--){ var g=S2[k], st=g?(g.w?'✅ '+T.done+' · '+g.g.length+' '+T.att:g.gu?'🏳️ '+T.gu:'… '+g.g.length+' '+T.att):T.none;
      h+='<a class="row" href="#/reto/'+k+'"><div class="m"><div class="nm">'+T.n+' #'+k+(k===today?' · '+T.today:'')+'</div><div class="ds">'+st+'</div></div><div class="ch">›</div></a>'; }
    return h+'</div></details>'; }
  function render(){
    var sorted=G.g.slice().sort(function(x,y){ return R.pos[x.id]-R.pos[y.id]; }); var last=G.g[G.g.length-1];
    var h=X.crumbs([[T.home,'#/'],[T.h]])+'<div class="rt" data-noi18n><h1>'+T.h+' <span class="rt-num">#'+num+'</span></h1><p class="sub">'+T.sub+'</p>';
    if(num!==today) h+='<p class="rt-note">'+T.past+' <a href="#/reto">'+T.back+'</a></p>';
    if(finished()) h+=endBox();
    else h+='<div class="rt-play"><div class="rt-inp"><input id="rtq" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+esc(T.ph)+'" aria-label="'+esc(T.ph)+'"><div id="rtsug" class="rt-sug" role="listbox"></div></div><div id="rtmsg" class="rt-msg" aria-live="polite"></div><div class="rt-meta"><span>'+T.att+': <b>'+G.g.length+'</b></span><span>'+T.hints+': <b>'+(G.h||0)+'</b></span><span class="rt-acts"><button type="button" class="rt-btn rt-sm" id="rthint">💡 '+T.hint+'</button><button type="button" class="rt-btn rt-sm rt-ghost" id="rtgive">'+T.give+'</button></span></div></div>';
    if(last&&!finished()){ h+='<div class="rt-lastlbl">'+T.last+'</div>'+rowH(last.id,true,last.h); }
    var rest=sorted.filter(function(x){ return finished()||!last||x.id!==last.id; }); if(rest.length) h+='<div class="rt-list">'+rest.map(function(x){ return rowH(x.id,false,x.h); }).join('')+'</div>';
    h+='<details class="rt-how"'+(G.g.length?'':' open')+'><summary>'+T.how+'</summary><p>'+T.howt+'</p><div class="rt-leg"><span class="rt-dot rt-g"></span> 2–'+GREEN+' <span class="rt-dot rt-y"></span> '+(GREEN+1)+'–'+YELLOW+' <span class="rt-dot rt-r"></span> '+(YELLOW+1)+'–'+TOT+'</div></details>';
    h+=prevList()+'<p class="rt-credit">'+T.cred+'</p></div>';
    X.set(h,T.h+' #'+num); wire(); }
  function guess(id,isHint){ if(finished()||!BY[id]) return; if(G.g.some(function(x){return x.id===id;})){ msg(T.dup+': '+BY[id].n+' ('+R.pos[id]+')'); return; }
    G.g.push(isHint?{id:id,h:1}:{id:id}); if(isHint) G.h=(G.h||0)+1; if(id===sid){ G.w=1; G.t=Date.now(); if(num===today) solved(); } save1(); render(); }
  function msg(t){ var m=document.getElementById('rtmsg'); if(m){ m.textContent=t; } }
  var INDEX=null;
  function index(){ if(INDEX) return INDEX; INDEX=I.map(function(a){ return {a:a,s:nrm(a.n+' '+(a.k||[]).join(' ')),n:nrm(a.n)}; }); return INDEX; }
  function suggest(q){ q=nrm(q); if(q.length<1) return []; var ix=index(), A=[], B=[], q2=q.replace(/ /g,'');
    for(var i=0;i<ix.length;i++){ var e=ix[i]; if(e.n.indexOf(q)===0||e.n.replace(/ /g,'').indexOf(q2)===0) A.push(e.a); else if(e.s.indexOf(q)>=0||e.s.replace(/ /g,'').indexOf(q2)>=0) B.push(e.a); if(A.length>=8) break; }
    return A.concat(B).slice(0,8); }
  function wire(){
    var sb=document.getElementById('rtshare'); if(sb) sb.onclick=function(){ doShare(sb); };
    var cd=document.getElementById('rtcd'); if(cd){ var tm=setInterval(function(){ if(!document.body.contains(cd)){ clearInterval(tm); return; } cd.textContent=countdown(); if(todayNum()!==today){ clearInterval(tm); } },1000); }
    if(finished()) loadSolvers();
    var inp=document.getElementById('rtq'), box=document.getElementById('rtsug'); if(!inp) return; var cur=[], sel=-1;
    function draw(){ box.innerHTML=cur.map(function(a,i){ return '<button type="button" role="option" class="rt-opt'+(i===sel?' on':'')+'" data-i="'+i+'">'+X.flag(a.pais)+'<span>'+esc(a.n)+'</span><small>'+esc(catLbl(a))+(a.anio?' · '+a.anio:'')+'</small></button>'; }).join(''); box.style.display=cur.length?'block':'none'; }
    inp.oninput=function(){ cur=suggest(inp.value); sel=cur.length?0:-1; draw(); msg(''); };
    inp.onkeydown=function(e){ if(e.key==='ArrowDown'){ sel=Math.min(cur.length-1,sel+1); draw(); e.preventDefault(); } else if(e.key==='ArrowUp'){ sel=Math.max(0,sel-1); draw(); e.preventDefault(); } else if(e.key==='Enter'){ e.preventDefault(); if(sel>=0&&cur[sel]) guess(cur[sel].id); else msg(T.notf); } else if(e.key==='Escape'){ cur=[]; draw(); } };
    box.onclick=function(e){ var b=e.target.closest('.rt-opt'); if(!b) return; var a=cur[+b.getAttribute('data-i')]; if(a) guess(a.id); };
    document.getElementById('rthint').onclick=function(){ var bp=G.g.length?Math.min.apply(null,G.g.map(function(x){return R.pos[x.id];})):TOT; var target=bp<=2?2:(G.g.length?Math.max(2,Math.floor(bp/2)):Math.min(400,TOT));
      var used={}; G.g.forEach(function(x){used[x.id]=1;}); var id=null; for(var k=target-1;k>=1;k--){ var c=R.ord[k]; if(!used[c]&&c!==sid){ id=c; break; } } if(!id){ for(var k2=target;k2<TOT;k2++){ var c2=R.ord[k2]; if(!used[c2]&&c2!==sid){ id=c2; break; } } } if(id) guess(id,true); };
    document.getElementById('rtgive').onclick=function(){ if(!confirm(T.sure)) return; G.gu=1; save1(); render(); };
    if(!('ontouchstart' in window)) setTimeout(function(){ try{ inp.focus(); }catch(e){} },50);
  }
  var SB_REST=window.MAT_SB_REST||((window.MAT_SB_URL||'https://kmfcejpvetjnacuqfyrs.supabase.co').replace(/\/+$/,'')+'/rest/v1'), SB_KEY='sb_publishable_nP2jUAFPXocNUViIsCVaaA_Tn17813h';
  function sbrpc(fn,args){ return fetch(SB_REST+'/rpc/'+fn,{method:'POST',headers:{'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY,'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store'}); }
  function rcid(){ try{ var c=localStorage.getItem('mat_cid'); if(!c||!/^[A-Za-z0-9_-]{16,64}$/.test(c)){ var a=new Uint8Array(16); crypto.getRandomValues(a); c=Array.prototype.map.call(a,function(b){return ('0'+b.toString(16)).slice(-2);}).join(''); localStorage.setItem('mat_cid',c); } return c; }catch(e){ return null; } }
  function solved(){ try{ if(localStorage.getItem('mat_reto_sent_'+num)) return; localStorage.setItem('mat_reto_sent_'+num,'1'); sbrpc('reto_solve',{p_n:num,p_g:G.g.length,p_client:rcid()}).catch(function(){}); }catch(e){} }
  function loadSolvers(){ if(num!==today) return; var el=document.getElementById('rtsolv'); if(!el) return; sbrpc('reto_get',{p_n:num}).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(d){ if(d&&d.solved>0&&document.body.contains(el)) el.textContent='👥 '+d.solved+' '+(d.solved===1?T.solver1:T.solvers); }).catch(function(){}); }
  if(!G.g) G={g:[],h:0};
  render();
};
})();
