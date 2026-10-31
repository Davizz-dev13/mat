
(function(){
"use strict";
function QT(s){s=String(s);return /^\d+( \d+)+$/.test(s.trim())?s.trim().split(' ').join(' + '):s;}
// ======================= M.A.T · PAÍSES Y FACCIONES =======================
var IC=[['aviones_combate','Aviones de combate'],['aviones_otros','Otros aviones y drones'],['helicopteros','Helicópteros'],['tanques','Carros de combate'],['blindados','Blindados'],['artilleria','Artillería'],['antiaereos','Defensa antiaérea'],['armamento','Armamento aéreo'],['buques_portaaviones','Portaaviones'],['buques_destructores','Destructores'],['buques_cruceros','Cruceros'],['buques_fragatas','Fragatas'],['buques_corbetas','Corbetas'],['buques_anfibios','Anfibios'],['buques_patrulleros','Patrulleros'],['buques_minas','Guerra de minas'],['submarinos','Submarinos'],['buques_auxiliares','Auxiliares'],['buques_menores','Embarcaciones menores y de puerto']];
var ICN={}; IC.forEach(function(c){ICN[c[0]]=c[1];});
var MC=[['aviones','Aviones'],['helicopteros','Helicópteros'],['tanques','Carros de combate'],['blindados','Blindados'],['buques','Buques'],['submarinos','Submarinos'],['logistica','Logística y Sanidad'],['armamento','Armamento'],['espacio','Carrera espacial']];
var DATA=null, DP=null;
function load(){ if(DP) return DP; DP=window.MAT_GET('fuerzas.json.gz').then(function(d){DATA=d;return d;}); return DP; }
function custom(){try{return JSON.parse(localStorage.getItem('mat_fac')||'[]');}catch(e){return [];}}
function saveCustom(L){try{localStorage.setItem('mat_fac',JSON.stringify(L));}catch(e){}}
function nf(n){return n==null?'—':Math.round(n).toLocaleString('es-ES');}

function fzBar(va,vb,lab,sub){ var mx=Math.max(va||0,vb||0,1), pa=(va||0)/mx*100, pb=(vb||0)/mx*100;
    return '<div class="fzrow"><div class="fzl">'+lab+(sub?'<span class="fzs">'+sub+'</span>':'')+'</div><div class="fzb"><div class="fzv a'+((va||0)>(vb||0)?' w':'')+'"><span>'+nf(va)+'</span><i style="width:'+pa.toFixed(1)+'%"></i></div><div class="fzv b'+((vb||0)>(va||0)?' w':'')+'"><i style="width:'+pb.toFixed(1)+'%"></i><span>'+nf(vb)+'</span></div></div></div>';}
function fzInv(m){ var tot={}, rows={}, nod=[], noq={}, has=0;
    m.forEach(function(k){ var R=DATA&&DATA.inv[k]; if(!R||!R.length){nod.push(k);return;} has++;
      R.forEach(function(r){ var c=r[2]; rows[c]=rows[c]||[]; rows[c].push({n:r[0],id:r[1],q:r[3],qt:r[4],src:r[5],nota:r[6],p:k}); if(r[3]!=null) tot[c]=(tot[c]||0)+r[3]; else noq[c]=(noq[c]||0)+1;});});
    return {tot:tot,rows:rows,nod:nod,noq:noq,has:has};}

function NT(s){ if(!s||window.MAT_LANG!=='en') return s; var M={'Ejército':'Army','Ejérc':'Army','Fuerza Aérea':'Air Force','Armada':'Navy','Infantería de Marina':'Marines','en reserva':'in reserve','Guardia Costera':'Coast Guard','Guardacostas':'Coast Guard','Gendarmería/Guardia Nacional':'Gendarmerie/National Guard','uso limitado':'limited use','Defensa Aérea':'Air Defence','cifra a revisar':'figure to be checked','extinción de incendios':'firefighting','lista de 2016 del artículo':"the article's 2016 list","3.º entregado el 20 oct 2026 (Ala 45, Torrejón), dato de prensa":"3rd delivered on 20 Oct 2026 (45th Wing, Torrejón), press report","dato de prensa: programa de 6, el último entregado el 20 oct 2026":"press report: programme of 6, the last delivered on 20 Oct 2026","dado de alta el 16 oct 2026 (Karwar), dato de prensa":"commissioned on 16 Oct 2026 (Karwar), press report","−1: uno se estrelló el 20 oct 2026 (Nancy), dato de prensa":"−1: one crashed on 20 Oct 2026 (Nancy), press report","12 unidades de fuego encargadas (4 más el 22 oct 2026) — dato de prensa":"12 firing units on order (4 more on 22 Oct 2026) — press report","26 de 28 entregados (oct 2026); los 2 últimos, en 2027 — dato oficial de Defensie, 19 oct 2026":"26 of 28 delivered (Oct 2026); the last 2 in 2027 — official figure from Defensie, 19 Oct 2026","66 de 66 entregados (los 2 últimos el 24 sep 2026, Academia de la Fuerza Aérea, Gangshan), dato de prensa":"66 of 66 delivered (last 2 on 24 Sep 2026, Air Force Academy, Gangshan), press report","Ejército del Aire y del Espacio":"Air and Space Force","entregas desde 2028; se estudian 15 más (hasta 45) — dato de prensa":"deliveries from 2028; 15 more under study (up to 45) — press report","Saeta II":"Saeta II","Pedido: 12 AH-64E (acuerdo firmado el 20 oct 2026; entregas desde principios de los años 2030) — dato de prensa":"Order: 12 AH-64E (agreement signed on 20 Oct 2026; deliveries from the early 2030s) — press report","Portugal autorizó el 14 oct 2026 la compra de 3 para transferirlos a Grecia (acuerdo de Gobierno a Gobierno, ~€590 M) — dato de prensa":"Portugal authorised on 14 Oct 2026 the purchase of 3 to transfer them to Greece (government-to-government deal, ~€590 M) — press report","aceptadas en 2017, entregadas 2023 (texto del artículo)":"accepted in 2017, delivered in 2023 (article text)","el artículo de la Armada indica que el Puamau se sustituye en 2025: cifra sin confirmar":"the Navy article says the Puamau is replaced in 2025: figure unconfirmed","Challenger 3: 7 prototipos entregados para pruebas (de 148 previstos), MoD 19 oct 2026 — dato de prensa":"Challenger 3: 7 prototypes delivered for trials (of 148 planned), UK MoD 19 Oct 2026 — press report","primer lote de 2 entregado el 28 oct 2026 (un año antes de lo previsto); 12 encargados — dato de prensa":"first batch of 2 delivered on 28 Oct 2026 (a year ahead of schedule); 12 ordered — press report","6 en Rota tras la entrega de un nuevo NH90 MSPT la semana del 26 oct 2026 (33 NH90 en total en las FAS) — dato de prensa":"6 at Rota after delivery of a new NH90 MSPT in the week of 26 Oct 2026 (33 NH90 in total across the Spanish Armed Forces) — press report","HS Kimon (F-601) y HS Nearchos (F-602), entregada el 30 oct 2026; 4 previstas — dato de prensa":"HS Kimon (F-601) and HS Nearchos (F-602), delivered on 30 Oct 2026; 4 planned — press report","119 entregados (18 más el 27 oct 2026; 78 en 2026) — dato de prensa":"119 delivered (18 more on 27 Oct 2026; 78 in 2026) \u2014 press report","2 primeros entregados el 23 oct 2026 en la base de Luke (Arizona) para formación; compra de 88 en revisión (16 confirmados) — dato de prensa":"first 2 delivered on 23 Oct 2026 at Luke AFB (Arizona) for training; purchase of 88 under review (16 confirmed) — press report","+1 OPV nuevo encargado a Israel Shipyards con sistemas Rafael (acuerdo firmado el 26 oct 2026); el Ioannides se moderniza — dato de prensa":"+1 new OPV ordered from Israel Shipyards with Rafael systems (agreement signed on 26 Oct 2026); Ioannides to be upgraded — press report","primer helicóptero de la historia del Ejército, llegado el 27 oct 2026 (programa HAPE: ex-US Army reacondicionados, base de Tancos) — dato de prensa":"the Army's first helicopter ever, arrived on 27 Oct 2026 (HAPE programme: refurbished ex-US Army aircraft, Tancos base) — press report","4 ya en Finlandia (2 más llegaron a Rovaniemi el 23 oct 2026) y 8 en EE. UU. para formación — dato de prensa":"4 already in Finland (2 more arrived at Rovaniemi on 23 Oct 2026) and 8 in the US for training — press report"};
  return String(s).split(' · ').map(function(t){ var m; if(M[t]) return M[t];
    if((m=t.match(/^(\d+) buques en la lista$/))) return m[1]+(m[1]==='1'?' ship':' ships')+' on the list';
    if((m=t.match(/^\(cifra conjunta con (.+)\)$/))) return '(combined figure with '+m[1]+')';
    if((m=t.match(/^(\d+) en servicio activo según la tabla$/))) return m[1]+' in active service per the table';
    if((m=t.match(/^la tabla indica (\d+) en servicio$/))) return 'the table lists '+m[1]+' in service';
    return t; }).join(' · '); }
function chgHTML(k,cls){ var EN=window.MAT_LANG==='en', C=DATA&&DATA.cambios&&DATA.cambios[k], R=DATA&&DATA.revisado;
  function e(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function q(v,t){return v==null?(t?'«'+e(QT(t))+'»':(EN?'no figure':'sin cifra')):nf(v);}
  var h='<div class="chgbox" data-noi18n><h3 class="'+(cls||'mph3')+'">'+(EN?'Latest changes':'Últimos cambios')+'</h3>';
  if(!C||!C.length){ return R?h+'<p class="chgnone">'+(EN?'No changes in the Wikipedia tables since the last check':'Sin cambios en las tablas de Wikipedia desde la última revisión')+' ('+e(R)+').</p></div>':''; }
  C.slice(0,8).forEach(function(c){ var f=DATA.fuentes[c[1]]||['','',''], u=c[2]?'https://en.wikipedia.org/w/index.php?diff='+c[3]+'&oldid='+c[2]:'https://en.wikipedia.org/w/index.php?oldid='+c[3];
    h+='<div class="chgi"><div class="chgh"><b>'+e(c[0])+'</b> · <a href="'+u+'" target="_blank" rel="noopener">'+(EN?'according to Wikipedia':'según Wikipedia')+' (rev '+e(c[3])+')</a> · <span>'+e(f[0])+'</span></div><ul>';
    c[4].slice(0,12).forEach(function(x){ var t=x[0];
      h+='<li class="chg'+(t==='+'?'add':t==='-'?'del':'q')+'">'+(t==='+'?(EN?'New: ':'Nuevo: ')+'<b>'+e(x[1])+'</b> ('+q(x[3],x[5])+')':t==='-'?(EN?'No longer listed: ':'Ya no figura: ')+'<b>'+e(x[1])+'</b> ('+(EN?'was ':'eran ')+q(x[2],x[4])+')':'<b>'+e(x[1])+'</b>: '+q(x[2],x[4])+' → '+q(x[3],x[5]))+'</li>'; });
    if(c[4].length>12) h+='<li>+'+(c[4].length-12)+'</li>';
    h+='</ul></div>'; });
  return h+'<p class="chgnote">'+(EN?'Only what the tables say: a row that disappears may be retired, lost or just moved in the article.':'Solo lo que dicen las tablas: una fila que desaparece puede ser una baja, una retirada o un simple cambio en el artículo.')+'</p></div>'; }
function sfaHTML(k){ var EN=window.MAT_LANG==='en', s=DATA&&DATA.sfa&&DATA.sfa[k], nt=!s&&!(DATA&&DATA.inv&&DATA.inv[k])&&DATA&&DATA.nt&&DATA.nt[k]; if(nt) s=nt; if(!s) return ''; var t=Array.isArray(s)?(EN?s[1]:s[0]):(EN?s.en:s.es), src=!Array.isArray(s)&&s.src; function e(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});} return '<div class="sfa" data-noi18n><b>'+(nt?(EN?'No equipment table on Wikipedia':'Sin tabla de equipo en Wikipedia'):(EN?'No armed forces':'Sin fuerzas armadas'))+'</b><p>'+e(t)+'</p>'+(src?'<p class="sfasrc">'+(EN?'Source':'Fuente')+': <a href="'+e(src[1])+'" target="_blank" rel="noopener">Wikipedia: '+e(src[0])+'</a></p>':'')+'</div>'; }
window.MAT_FZ={chg:chgHTML,sfa:sfaHTML,load:load,data:function(){return DATA;},IC:IC,ICN:ICN,custom:custom,nf:nf,bar:fzBar,inv:fzInv};
window.MAT_FUERZAS=function(app,X){
  var P=X.P, I=X.I, BY=X.BY, esc=X.esc;
  if(!DATA){app.innerHTML='<p class="sub" style="padding:24px 0">Cargando países y facciones…</p>'; load().then(function(){window.MAT_FUERZAS(app,X);}).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">No se pudieron cargar los datos. Comprueba la conexión.</p>';}); return;}
  var FAC={}; DATA.fac.forEach(function(f){FAC[f.id]=f;});
  var o=X.qs(); var sa=o.a||'p:espana', sb=o.b||'p:francia', modeH=o.h==='1';
  function side(s){ var t=s.slice(0,2), k=s.slice(2);
    if(t==='p:'&&P[k]) return {s:s,n:P[k].n,m:[k],flag:k,kind:'País'};
    if(t==='f:'&&FAC[k]){var f=FAC[k]; return {s:s,n:f.n,m:f.m.filter(function(x){return P[x];}),fac:f,kind:f.h?'Facción histórica':'Facción'};}
    if(t==='c:'){var c=custom().filter(function(x){return x.id===k;})[0]; if(c) return {s:s,n:c.n,m:c.m.filter(function(x){return P[x];}),custom:c,kind:'Facción propia'};}
    return {s:'p:espana',n:P.espana.n,m:['espana'],flag:'espana',kind:'País'};}
  var A=side(sa), B=side(sb);
  // ---- Jose (21-10-2026): abrir un país muestra SOLO ese país; comparar solo cuando el usuario elige el segundo lado ----
  var CMP=!!o.b||o.cmp==='1'||o.bat==='1';
  if(!CMP){ if(o.a&&o.a.length>2) return solo(side(o.a)); return landing(); }
  if(!o.a||!o.b) return pickOnly(o.a?side(o.a):null,o.b?side(o.b):null);
  function L1(){return window.MAT_LANG==='en';}
  function TT1(s){return window.MAT_T?window.MAT_T(s):s;}
  function landing(){ var EN=L1();
    var PK=Object.keys(P).filter(function(k){return k!=='multi'&&DATA.inv[k];}).sort(function(x,y){return TT1(P[x].n).localeCompare(TT1(P[y].n),EN?'en':'es');});
    var h=X.crumbs([['Inicio','#/'],['Países y facciones']])+'<h1>Países y facciones</h1><p class="sub" data-noi18n>'+(EN?'Open a country or a bloc to see only its own forces. To put two side by side, use “Compare”.':'Abre un país o un bloque para ver solo sus fuerzas. Para poner dos frente a frente, usa «Comparar».')+'</p>';
    h+='<div class="btns" data-noi18n style="margin-top:8px"><button class="btn" id="fzpick1">'+(EN?'Find a country or faction':'Buscar país o facción')+'</button><a class="btn pri" href="#/fuerzas?cmp=1">'+(EN?'Compare two countries or factions':'Comparar dos países o facciones')+'</a></div>';
    h+='<h2>Facciones</h2><div class="list">'+DATA.fac.filter(function(f){return !f.h;}).map(function(f){return '<a class="row" href="#/fuerzas?a=f:'+esc(f.id)+'"><div class="m"><div class="nm">'+f.m.slice(0,4).map(function(k){return X.flag(k,'mini');}).join('')+' '+esc(f.n)+'</div><div class="ds">'+f.m.length+' países</div></div><div class="ch">›</div></a>';}).join('')+'</div>';
    h+='<h2>Países</h2><div class="list">'+PK.map(function(k){return '<a class="row" href="#/fuerzas?a=p:'+k+'"><div class="m"><div class="nm">'+X.flag(k,'mini')+esc(P[k].n)+'</div></div><div class="ch">›</div></a>';}).join('')+'</div>';
    X.set(h,'Países y facciones');
    var b=document.getElementById('fzpick1'); if(b) b.addEventListener('click',function(){picker(function(s){location.hash='#/fuerzas?a='+encodeURIComponent(s);});});
  }
  function pickOnly(SA,SB){ var EN=L1();
    function emp(k){return '<div class="pick fzpick"><button class="btn fzbtn" data-k="'+k+'"><span class="fzn">'+(EN?'Choose country or faction':'Elegir país o facción')+'</span></button><div class="note" style="margin:4px 2px 0">'+(k==='a'?(EN?'Side A':'Lado A'):(EN?'Side B':'Lado B'))+'</div></div>';}
    var h=X.crumbs([['Inicio','#/'],['Países y facciones','#/fuerzas'],['Comparar']])+'<h1>Comparar países y facciones</h1><p class="sub" data-noi18n>'+(EN?'Choose the two sides you want to compare.':'Elige los dos lados que quieres comparar.')+'</p>';
    h+='<div class="cmp fzsel" data-noi18n>'+(SA?sideBtn('a',SA):emp('a'))+'<div class="fzvs">VS</div>'+(SB?sideBtn('b',SB):emp('b'))+'</div>';
    h+='<p class="empty" data-noi18n>'+(EN?'Nothing is compared until you pick both sides.':'No se compara nada hasta que elijas los dos lados.')+'</p>';
    X.set(h,'Países y facciones');
    Array.prototype.forEach.call(document.querySelectorAll('.fzbtn'),function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-k'); picker(function(s){var oo={a:SA?SA.s:'',b:SB?SB.s:'',cmp:'1',bat:o.bat==='1'?'1':''}; oo[k]=s; location.hash=X.hashFor('#/fuerzas',oo);});});});
  }
  function solo(S){ var EN=L1(); var I1=invSum(S), M1=opsOf(S);
    function bar1(v,mx,lab,sub){ return '<div class="fzrow"><div class="fzl">'+lab+(sub?'<span class="fzs">'+sub+'</span>':'')+'</div><div class="fzb fzb1"><div class="fzv a w"><span>'+nf(v)+'</span><i style="width:'+((v||0)/(mx||1)*100).toFixed(1)+'%"></i></div></div></div>'; }
    var h=X.crumbs([['Inicio','#/'],['Países y facciones','#/fuerzas'],[S.n]])+'<h1>'+flags(S,4)+' '+esc(S.n)+'</h1><p class="sub">'+esc(S.kind)+(S.m.length>1?' · '+S.m.length+' países':'')+'</p>';
    h+='<div class="btns" style="margin-top:8px" data-noi18n><button class="btn" id="fzchg1">'+(EN?'Change':'Cambiar')+'</button><button class="btn" id="fzcmp1">'+(EN?'Compare with…':'Comparar con…')+'</button><a class="btn" href="#/mapa?a='+encodeURIComponent(S.s)+'">'+(EN?'See on the map':'Ver en el mapa')+'</a></div>';
    if(S.fac){ var f=S.fac; h+='<p class="note" style="margin:6px 0 0">'+esc(TT1(f.n))+': '+S.m.map(function(k){return esc(TT1(P[k].n));}).join(', ')+'. '+(f.nota?esc(TT1(f.nota))+' ':'')+(EN?'Members per ':'Miembros según ')+'<a href="'+esc(f.src.url)+'" target="_blank" rel="noopener">Wikipedia: '+esc(f.src.t)+'</a> ('+esc(f.src.fecha)+').</p>'; }
    h+='<h2>Unidades en servicio (según Wikipedia, '+esc(DATA.fecha)+')</h2>';
    var mx=1; IC.forEach(function(c){ mx=Math.max(mx,I1.tot[c[0]]||0); }); var any=false;
    IC.forEach(function(c){ var k=c[0], v=I1.tot[k]; if(v==null&&!I1.rows[k]) return; any=true; var n=I1.noq[k]||0; h+=bar1(v,mx,c[1],n?(EN?n+' row'+(n>1?'s':'')+' with no figure':n+' fila'+(n>1?'s':'')+' sin cifra'):''); });
    if(!any) h+='<p class="empty">'+(EN?'No equipment table loaded yet.':'Sin tabla de equipamiento cargada todavía.')+'</p>';
    if(S.m.length===1){ var sh=sfaHTML(S.m[0]); if(sh) h+=sh; }
    if(I1.nod.length&&S.m.length>1) h+='<p class="note">'+esc(TT1(S.n))+(EN?': no equipment table loaded for ':': sin tabla de equipamiento cargada para ')+I1.nod.map(function(k){return esc(TT1(P[k].n));}).join(', ')+(EN?' (shown as “—”, never an estimate).':' (se muestra «—», nunca una estimación).')+'</p>';
    h+='<p class="note">Cifras tal como aparecen en las tablas «In service / Quantity» de los artículos de equipamiento de cada país en Wikipedia; en las facciones son la suma de sus miembros. Toca un modelo para ver la fuente. Las filas sin cifra (pedidos, «100/348», reservas) no suman.</p>';
    if(S.m.length===1&&(DATA.inv[S.m[0]]||(DATA.cambios&&DATA.cambios[S.m[0]]))){ var cg=chgHTML(S.m[0],'fzchg'); if(cg) h+='<div class="fzchgw">'+cg+'</div>'; }
    if(window.MAT_GASTO){ if(S.m.length===1) h+=window.MAT_GASTO.block(S.m[0],'mph3'); else if(window.MAT_GASTO.solo) h+=window.MAT_GASTO.solo(S); }
    if(window.MAT_FB&&S.m.length===1) h+=window.MAT_FB.block(S.m[0]);
    h+='<h2>Por modelo</h2>';
    IC.forEach(function(c){ var k=c[0], ra=I1.rows[k]||[]; if(!ra.length) return;
      var m={}, L=[]; ra.forEach(function(r){var key=r.id||r.n; if(!m[key]){m[key]={n:r.id&&BY[r.id]?BY[r.id].n:r.n,id:r.id&&BY[r.id]?r.id:null,q:null,parts:[]}; L.push(m[key]);} var e=m[key]; if(r.q!=null) e.q=(e.q||0)+r.q; e.parts.push(r);}); L.sort(function(x,y){return (y.q||-1)-(x.q||-1)||x.n.localeCompare(y.n);});
      h+='<details class="fzcat"><summary><span>'+c[1]+'</span><span class="cnt">'+nf(I1.tot[k])+'</span></summary><div class="fzcols fzcols1"><div class="fzcol">'+L.map(function(e){ return '<details class="fzm"><summary><span class="fmn">'+esc(e.n)+'</span><span class="fmq">'+(e.q!=null?nf(e.q):'—')+'</span></summary><div class="fzdet">'+e.parts.map(function(r){var f=DATA.fuentes[r.src]||['','',''];return '<div>'+(S.m.length>1?X.flag(r.p,'mini')+esc(P[r.p].n)+': ':'')+'<b>'+(r.q!=null?nf(r.q):(r.qt?'«'+esc(QT(r.qt))+'»':'sin cifra'))+'</b>'+(r.nota?' · '+esc(NT(r.nota)):'')+' · <a href="'+esc(f[1])+'" target="_blank" rel="noopener">'+esc(f[0])+'</a> ('+esc(f[2])+')</div>';}).join('')+(e.id?'<div><a href="#/a/'+e.id+'">Abrir ficha en M.A.T ›</a></div>':'')+'</div></details>';}).join('')+'</div></div></details>'; });
    h+='<h2>Modelos que operan (fichas de M.A.T)</h2><div class="chips" role="group" aria-label="Estado"><button class="chip fzh" data-h="0" aria-pressed="'+(!modeH)+'">En servicio</button><button class="chip fzh" data-h="1" aria-pressed="'+modeH+'">Histórico</button></div>';
    var cnt=MC.map(function(c){return [c,M1.filter(function(a){return a.cat===c[0];}).length];}), mx2=1; cnt.forEach(function(z){mx2=Math.max(mx2,z[1]);});
    cnt.forEach(function(z){ if(z[1]) h+=bar1(z[1],mx2,z[0][1]); });
    var ts=[]; (X.TIPOS||[]).forEach(function(t){ if(t.id==='t_todos'||t.id==='t_proto') return; var v=M1.filter(function(a){return a.tipo===t.id||(a.alt||[]).indexOf(t.id)>=0;}).length; if(v) ts.push([t,v]); });
    if(ts.length){ var mx3=1; ts.forEach(function(z){mx3=Math.max(mx3,z[1]);}); h+='<details class="fzcat"><summary><span>Por tipo</span><span class="cnt">ver</span></summary>'+ts.map(function(z){return bar1(z[1],mx3,(X.CN[z[0].c]||'')+' · '+z[0].n);}).join('')+'</details>'; }
    h+='<p class="note">Número de modelos distintos, no de unidades: cuenta cada modelo cuya ficha cita al país como usuario'+(modeH?' en el pasado':' actual')+'.</p>';
    var H1=hl(M1);
    h+='<h2>Sistemas destacados</h2><div class="fzhl fzhl1">'+H1.map(function(r){return '<div class="fzhlr"><div class="fzhlt">'+r[0]+'</div><div class="fzhla">'+r[1]+'</div></div>';}).join('')+'</div>';
    h+='<p class="note">«Armas nucleares en las fichas» indica si el país aparece como usuario en la ficha de algún arma nuclear de Armamento (incluye programas de compartición), según Wikipedia.</p>';
    X.set(h,S.n);
    document.getElementById('fzchg1').addEventListener('click',function(){picker(function(s){location.hash=X.hashFor('#/fuerzas',{a:s,h:modeH?'1':''});});});
    document.getElementById('fzcmp1').addEventListener('click',function(){picker(function(s){location.hash=X.hashFor('#/fuerzas',{a:S.s,b:s,h:modeH?'1':''});});});
    Array.prototype.forEach.call(document.querySelectorAll('.fzh'),function(b){b.addEventListener('click',function(){location.hash=X.hashFor('#/fuerzas',{a:S.s,h:b.getAttribute('data-h')==='1'?'1':''});});});
  }
  function flags(sd,max){max=max||8; return sd.m.slice(0,max).map(function(k){return X.flag(k,'mini');}).join('')+(sd.m.length>max?'<span class="cnt"> +'+(sd.m.length-max)+'</span>':'');}
  function sideBtn(k,sd){return '<div class="pick fzpick"><button class="btn fzbtn" data-k="'+k+'"><span class="fzf">'+flags(sd,6)+'</span><span class="fzn">'+esc(sd.n)+'</span><span class="cnt" style="margin-left:6px">cambiar</span></button><div class="note" style="margin:4px 2px 0">'+esc(sd.kind)+(sd.m.length>1?' · '+sd.m.length+' países':'')+'</div></div>';}
  // ---------- inventory (units) ----------
  function invSum(sd){ var tot={}, rows={}, nod=[], noq={}, has=0;
    sd.m.forEach(function(k){ var R=DATA.inv[k]; if(!R||!R.length){nod.push(k);return;} has++;
      R.forEach(function(r){ var c=r[2]; rows[c]=rows[c]||[]; rows[c].push({n:r[0],id:r[1],q:r[3],qt:r[4],src:r[5],nota:r[6],p:k}); if(r[3]!=null) tot[c]=(tot[c]||0)+r[3]; else noq[c]=(noq[c]||0)+1;});});
    return {tot:tot,rows:rows,nod:nod,noq:noq,has:has};}
  var IA=invSum(A), IB=invSum(B);
  // ---------- models operated (fichas) ----------
  function opsOf(sd){ var S={}; sd.m.forEach(function(k){S[k]=1;});
    var L=I.filter(function(a){ if(!a.ops) return false; for(var k in a.ops){ if(S[k]){ var cur=a.serv&&!a.ops[k].f&&!a.proto; if(modeH?!cur:cur) return true; } } return false;});
    return L;}
  var MA=opsOf(A), MB=opsOf(B);
  function bar(va,vb,lab,sub){ var mx=Math.max(va||0,vb||0,1), pa=(va||0)/mx*100, pb=(vb||0)/mx*100;
    return '<div class="fzrow"><div class="fzl">'+lab+(sub?'<span class="fzs">'+sub+'</span>':'')+'</div><div class="fzb"><div class="fzv a'+((va||0)>(vb||0)?' w':'')+'"><span>'+nf(va)+'</span><i style="width:'+pa.toFixed(1)+'%"></i></div><div class="fzv b'+((vb||0)>(va||0)?' w':'')+'"><i style="width:'+pb.toFixed(1)+'%"></i><span>'+nf(vb)+'</span></div></div></div>';}
  function head(){return '<div class="fzhd"><div class="a">'+flags(A,4)+' '+esc(A.n)+'</div><div class="b">'+esc(B.n)+' '+flags(B,4)+'</div></div>';}
  var h=X.crumbs([['Inicio','#/'],['Países y facciones','#/fuerzas'],['Comparar']])+'<h1>Comparar países y facciones</h1><p class="sub">Compara dos países, dos bloques o tus propias facciones: unidades en servicio según las tablas de Wikipedia y modelos que operan según las fichas de M.A.T.</p>';
  h+='<div class="cmp fzsel">'+sideBtn('a',A)+'<div class="fzvs">VS</div>'+sideBtn('b',B)+'</div>';
  h+='<div class="btns" style="margin-top:8px"><button class="btn" id="fzswap">Intercambiar</button><button class="btn" id="fzbat">Batalla de facciones</button><a class="btn" href="#/mapa?a='+encodeURIComponent(A.s)+'&b='+encodeURIComponent(B.s)+'">Ver en el mapa</a></div>';
  // facts about membership
  [A,B].forEach(function(sd){ if(sd.fac){ var f=sd.fac; var TT=function(s){return window.MAT_T?window.MAT_T(s):s;}; h+='<p class="note" style="margin:6px 0 0">'+esc(TT(f.n))+': '+sd.m.map(function(k){return esc(TT(P[k].n));}).join(', ')+'. '+(f.nota?esc(TT(f.nota))+' ':'')+(window.MAT_LANG==='en'?'Members per ':'Miembros según ')+'<a href="'+esc(f.src.url)+'" target="_blank" rel="noopener">Wikipedia: '+esc(f.src.t)+'</a> ('+esc(f.src.fecha)+').</p>'; } });
  // ---- section 1: units in service
  h+='<h2>Unidades en servicio (según Wikipedia, '+esc(DATA.fecha)+')</h2>'+head();
  var anyI=false;
  IC.forEach(function(c){ var k=c[0], va=IA.tot[k], vb=IB.tot[k]; if(va==null&&vb==null&&!IA.rows[k]&&!IB.rows[k]) return; anyI=true;
    var na=IA.noq[k]||0, nb=IB.noq[k]||0, sub=(na||nb)?(na?na+' fila'+(na>1?'s':'')+' sin cifra en '+esc(A.n):'')+(na&&nb?' · ':'')+(nb?nb+' fila'+(nb>1?'s':'')+' sin cifra en '+esc(B.n):''):'';
    h+=bar(va,vb,c[1],sub); });
  if(!anyI) h+='<p class="empty">Ninguno de los dos lados tiene tablas de equipamiento cargadas todavía.</p>';
  [A,B].forEach(function(z){ if(z.m.length===1){ var sh=sfaHTML(z.m[0]); if(sh) h+='<div class="fzchgn">'+X.flag(z.m[0],'mini')+esc(z.n)+'</div>'+sh; } });
  [[A,IA],[B,IB]].forEach(function(z){ if(z[1].nod.length){ var TT=function(s){return window.MAT_T?window.MAT_T(s):s;}, EN=window.MAT_LANG==='en'; h+='<p class="note">'+esc(TT(z[0].n))+(EN?': no equipment table loaded for ':': sin tabla de equipamiento cargada para ')+z[1].nod.map(function(k){return esc(TT(P[k].n));}).join(', ')+(EN?' (shown as “—”, never an estimate).':' (se muestra «—», nunca una estimación).')+'</p>'; }});
  h+='<p class="note">Cifras tal como aparecen en las tablas «In service / Quantity» de los artículos de equipamiento de cada país en Wikipedia; en las facciones son la suma de sus miembros. Toca un modelo para ver la fuente. Las filas sin cifra (pedidos, «100/348», reservas) no suman.</p>';
  [A,B].forEach(function(z){ if(z.m.length===1&&z.m[0]!==(A===z?'':A.m[0])&&(DATA.inv[z.m[0]]||(DATA.cambios&&DATA.cambios[z.m[0]]))){ var c=chgHTML(z.m[0],'fzchg'); if(c) h+='<div class="fzchgw"><div class="fzchgn">'+X.flag(z.m[0],'mini')+esc(z.n)+'</div>'+c+'</div>'; } });
  if(window.MAT_GASTO) h+=window.MAT_GASTO.cmp(A,B);
  // ---- per-category model rows
  h+='<h2>Por modelo</h2>';
  IC.forEach(function(c){ var k=c[0], ra=IA.rows[k]||[], rb=IB.rows[k]||[]; if(!ra.length&&!rb.length) return;
    function agg(rows){ var m={}, L=[]; rows.forEach(function(r){var key=r.id||r.n; if(!m[key]){m[key]={n:r.id&&BY[r.id]?BY[r.id].n:r.n,id:r.id&&BY[r.id]?r.id:null,q:null,parts:[]}; L.push(m[key]);} var e=m[key]; if(r.q!=null) e.q=(e.q||0)+r.q; e.parts.push(r);}); L.sort(function(x,y){return (y.q||-1)-(x.q||-1)||x.n.localeCompare(y.n);}); return L;}
    var la=agg(ra), lb=agg(rb);
    function col(L,sd){ if(!L.length) return '<div class="fzcol"><p class="empty" style="margin:6px 0">—</p></div>'; return '<div class="fzcol">'+L.map(function(e){ var det=e.parts.map(function(r){var f=DATA.fuentes[r.src]||['','',''];return (sd.m.length>1?P[r.p].n+': ':'')+(r.q!=null?nf(r.q):(r.qt?'«'+QT(r.qt)+'»':'sin cifra'))+(r.nota?' ('+NT(r.nota)+')':'')+' — '+f[0]+' ('+f[2]+')';}).join('\n');
      return '<details class="fzm"><summary><span class="fmn">'+esc(e.n)+'</span><span class="fmq">'+(e.q!=null?nf(e.q):'—')+'</span></summary><div class="fzdet">'+e.parts.map(function(r){var f=DATA.fuentes[r.src]||['','',''];return '<div>'+(sd.m.length>1?X.flag(r.p,'mini')+esc(P[r.p].n)+': ':'')+'<b>'+(r.q!=null?nf(r.q):(r.qt?'«'+esc(QT(r.qt))+'»':'sin cifra'))+'</b>'+(r.nota?' · '+esc(NT(r.nota)):'')+' · <a href="'+esc(f[1])+'" target="_blank" rel="noopener">'+esc(f[0])+'</a> ('+esc(f[2])+')</div>';}).join('')+(e.id?'<div><a href="#/a/'+e.id+'">Abrir ficha en M.A.T ›</a></div>':'')+'</div></details>';}).join('')+'</div>';}
    var ta=IA.tot[k], tb=IB.tot[k];
    h+='<details class="fzcat"><summary><span>'+c[1]+'</span><span class="cnt">'+nf(ta)+' · '+nf(tb)+'</span></summary><div class="fzcols">'+col(la,A)+col(lb,B)+'</div></details>';});
  // ---- section 2: models (fichas)
  h+='<h2>Modelos que operan (fichas de M.A.T)</h2><div class="chips" role="group" aria-label="Estado"><button class="chip fzh" data-h="0" aria-pressed="'+(!modeH)+'">En servicio</button><button class="chip fzh" data-h="1" aria-pressed="'+modeH+'">Histórico</button></div>'+head();
  MC.forEach(function(c){ var va=MA.filter(function(a){return a.cat===c[0];}).length, vb=MB.filter(function(a){return a.cat===c[0];}).length; if(va||vb) h+=bar(va,vb,c[1]);});
  var types=X.TIPOS||[]; var tsub='';
  types.forEach(function(t){ if(t.id==='t_todos'||t.id==='t_proto') return; var va=MA.filter(function(a){return a.tipo===t.id||(a.alt||[]).indexOf(t.id)>=0;}).length, vb=MB.filter(function(a){return a.tipo===t.id||(a.alt||[]).indexOf(t.id)>=0;}).length; if(va||vb) tsub+=bar(va,vb,(X.CN[t.c]||'')+' · '+t.n);});
  if(tsub) h+='<details class="fzcat"><summary><span>Por tipo</span><span class="cnt">ver</span></summary>'+tsub+'</details>';
  h+='<p class="note">Número de modelos distintos, no de unidades: cuenta cada modelo cuya ficha cita al país como usuario'+(modeH?' en el pasado':' actual')+'.</p>';
  // headline systems
  function best(L,f,s){return L.filter(f).sort(s)[0];}
  function byYear(x,y){return (y.anio||0)-(x.anio||0);}
  function names(L,n){return L.slice(0,n).map(function(a){return '<a href="#/a/'+a.id+'">'+esc(a.n)+'</a>';}).join(', ')+(L.length>n?' y '+(L.length-n)+' más':'');}
  function hl(L){ var o=[];
    var cz=L.filter(function(a){return a.cat==='aviones'&&a.tipo==='caza';}).sort(function(x,y){return (parseFloat(y.gen)||0)-(parseFloat(x.gen)||0)||byYear(x,y);});
    o.push(['Caza más avanzado',cz[0]?'<a href="#/a/'+cz[0].id+'">'+esc(cz[0].n)+'</a>'+(cz[0].gen?' · gen. '+esc(String(cz[0].gen).replace('.',','))+'.ª':' · '+(cz[0].anio||''))+(cz.length>1?' <span class="cnt">('+cz.length+' modelos de caza)</span>':''):'—']);
    var mbt=L.filter(function(a){return a.cat==='tanques'&&(a.tipo==='t_principal'||(a.alt||[]).indexOf('t_principal')>=0);}).sort(byYear);
    o.push(['Carro de combate principal',mbt.length?names(mbt,3):'—']);
    var cv=L.filter(function(a){return a.cat==='buques'&&a.tipo==='portaaviones';}).sort(byYear); o.push(['Portaaviones y buques de cubierta corrida',cv.length?names(cv,4):'—']);
    var ssn=L.filter(function(a){return a.tipo==='s_nuclear';}).sort(byYear), ssbn=L.filter(function(a){return a.tipo==='s_balistico';}).sort(byYear);
    o.push(['Submarinos nucleares de ataque',ssn.length?names(ssn,3):'—']); o.push(['Submarinos balísticos (SSBN)',ssbn.length?names(ssbn,3):'—']);
    var sam=L.filter(function(a){return a.tipo==='w_sam';}).sort(byYear); o.push(['Defensa antiaérea (misiles)',sam.length?names(sam,4):'—']);
    var cm=L.filter(function(a){return a.tipo==='w_cm';}).sort(byYear); o.push(['Misiles de crucero',cm.length?names(cm,3):'—']);
    var bm=L.filter(function(a){return a.tipo==='w_bm'||a.tipo==='w_icbm';}).sort(byYear); o.push(['Misiles balísticos',bm.length?names(bm,3):'—']);
    var nu=L.filter(function(a){return a.tipo==='w_nuclear';}).sort(byYear); o.push(['Armas nucleares en las fichas',nu.length?'Sí: '+names(nu,3):'No figura como usuario']);
    return o;}
  var HA=hl(MA), HB=hl(MB);
  h+='<h2>Sistemas destacados</h2><div class="fzhl">'+HA.map(function(r,i){return '<div class="fzhlr"><div class="fzhlt">'+r[0]+'</div><div class="fzhla">'+r[1]+'</div><div class="fzhlb">'+HB[i][1]+'</div></div>';}).join('')+'</div>';
  h+='<p class="note">«Armas nucleares en las fichas» indica si el país aparece como usuario en la ficha de algún arma nuclear de Armamento (incluye programas de compartición), según Wikipedia.</p>';
  // only A / only B
  var SA={},SB={}; MA.forEach(function(a){SA[a.id]=1;}); MB.forEach(function(a){SB[a.id]=1;});
  var OA=MA.filter(function(a){return !SB[a.id]&&a.cat!=='logistica';}).sort(byYear), OB=MB.filter(function(a){return !SA[a.id]&&a.cat!=='logistica';}).sort(byYear);
  function olist(L,sd,key){ var g={}; L.forEach(function(a){(g[a.cat]=g[a.cat]||[]).push(a);});
    return '<div class="fzcol"><div class="kicker" style="margin-top:4px">Solo '+esc(sd.n)+' · '+L.length+'</div>'+MC.map(function(c){var l=g[c[0]]; if(!l) return ''; return '<div class="fzol"><b>'+c[1]+'</b> ('+l.length+'): '+l.slice(0,12).map(function(a){return '<a href="#/a/'+a.id+'">'+esc(a.n)+'</a>';}).join(', ')+(l.length>12?' <span class="cnt">y '+(l.length-12)+' más</span>':'')+'</div>';}).join('')+'</div>';}
  h+='<h2>Solo uno de los dos lo tiene</h2><div class="fzcols">'+olist(OA,A)+olist(OB,B)+'</div>';
  h+='<div id="fzbatout"></div>';
  X.set(h,'Países y facciones');
  // ---------- events ----------
  function go(oo){location.hash=X.hashFor('#/fuerzas',oo);}
  document.getElementById('fzswap').addEventListener('click',function(){go({a:B.s,b:A.s,h:modeH?'1':''});});
  Array.prototype.forEach.call(document.querySelectorAll('.fzh'),function(b){b.addEventListener('click',function(){go({a:A.s,b:B.s,h:b.getAttribute('data-h')==='1'?'1':''});});});
  Array.prototype.forEach.call(document.querySelectorAll('.fzbtn'),function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-k'); picker(function(s){var oo={a:A.s,b:B.s,h:modeH?'1':''}; oo[k]=s; go(oo);});});});
  document.getElementById('fzbat').addEventListener('click',function(){battle();});
  if(o.bat==='1') setTimeout(battle,300);
  // ---------- picker ----------
  function picker(cb){
    var ov=document.createElement('div'); ov.className='pkov'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label','Elegir país o facción');
    ov.innerHTML='<div class="pkhd"><input class="inp" id="fzq" type="search" placeholder="País o facción: España, OTAN…" autocomplete="off" spellcheck="false"><button class="btn" id="fzx">Cerrar</button></div><div class="pkbd"><div class="chips" id="fztab"><button class="chip" data-t="p" aria-pressed="true">Países</button><button class="chip" data-t="f" aria-pressed="false">Facciones</button><button class="chip" data-t="c" aria-pressed="false">Mis facciones</button></div><div id="fzl"></div></div>';
    document.body.appendChild(ov); document.body.style.overflow='hidden';
    var tab='p', qi=ov.querySelector('#fzq'), box=ov.querySelector('#fzl');
    function close(){document.body.style.overflow=''; ov.remove(); window.removeEventListener('hashchange',close);}
    window.addEventListener('hashchange',close);
    var PK=Object.keys(P).filter(function(k){return k!=='multi';}).sort(function(x,y){var dx=DATA.inv[x]?0:1, dy=DATA.inv[y]?0:1; return dx-dy||P[x].n.localeCompare(P[y].n,'es');});
    function row(s,label,sub,fl){return '<button class="row pkrow" data-s="'+esc(s)+'"><div class="m"><div class="nm">'+fl+esc(label)+'</div><div class="ds">'+sub+'</div></div></button>';}
    function draw(){ var s=X.norm(qi.value), h2='';
      if(tab==='p'||s){ var L=PK.filter(function(k){return !s||X.norm(P[k].n).indexOf(s)>=0;}); h2+=(s?'<h2>Países</h2>':'')+'<div class="list">'+L.map(function(k){return row('p:'+k,P[k].n,DATA.inv[k]?'Con unidades en servicio':(DATA.sfa&&DATA.sfa[k]?'Sin fuerzas armadas':'Solo modelos (sin tabla de unidades)'),X.flag(k,'mini'));}).join('')+'</div>'; }
      if(tab==='f'||s){ var F=DATA.fac.filter(function(f){return !s||X.norm(f.n).indexOf(s)>=0;});
        [[0,'Actuales'],[1,'Históricas']].forEach(function(g){var l=F.filter(function(f){return (f.h?1:0)===g[0];}); if(l.length) h2+='<h2>'+(s?'Facciones · ':'')+g[1]+'</h2><div class="list">'+l.map(function(f){return row('f:'+f.id,f.n,f.m.length+' países',f.m.slice(0,5).map(function(k){return X.flag(k,'mini');}).join(''));}).join('')+'</div>';}); }
      if(tab==='c'&&!s){ var C=custom(); h2+='<div class="list">'+C.map(function(c){return '<div class="fzcrow">'+row('c:'+c.id,c.n,c.m.length+' países',c.m.slice(0,5).map(function(k){return X.flag(k,'mini');}).join(''))+'<button class="btn fzdel" data-id="'+esc(c.id)+'" aria-label="Borrar '+esc(c.n)+'">Borrar</button></div>';}).join('')+'</div>'+(C.length?'':'<p class="empty">Aún no has creado ninguna facción.</p>')+'<button class="btn pri" id="fznew" style="margin-top:10px">Crear facción</button>'; }
      box.innerHTML=h2; var nb=box.querySelector('#fznew'); if(nb) nb.addEventListener('click',creator);
      Array.prototype.forEach.call(box.querySelectorAll('.fzdel'),function(b){b.addEventListener('click',function(e){e.stopPropagation(); saveCustom(custom().filter(function(c){return c.id!==b.getAttribute('data-id');})); draw();});});
    }
    function creator(){ var sel={};
      box.innerHTML='<h2>Crear facción</h2><input class="inp" id="fzcn" placeholder="Nombre de la facción" maxlength="40" style="width:100%"><p class="note" style="margin:8px 0">Elige los países:</p><div class="fzchk">'+PK.map(function(k){return '<label><input type="checkbox" value="'+k+'"> '+X.flag(k,'mini')+esc(P[k].n)+'</label>';}).join('')+'</div><div class="btns" style="position:sticky;bottom:0;background:var(--bg);padding:10px 0"><button class="btn pri" id="fzsave">Guardar y usar</button><button class="btn" id="fzcancel">Cancelar</button></div>';
      box.querySelector('#fzcancel').addEventListener('click',draw);
      box.querySelector('#fzsave').addEventListener('click',function(){ var n=box.querySelector('#fzcn').value.trim()||'Mi facción', m=Array.prototype.map.call(box.querySelectorAll('.fzchk input:checked'),function(x){return x.value;}); if(!m.length){box.querySelector('#fzcn').focus(); return;} var C=custom(), id='f'+Date.now().toString(36); C.push({id:id,n:n,m:m}); saveCustom(C); close(); cb('c:'+id);});
    }
    qi.addEventListener('input',draw);
    ov.querySelector('#fztab').addEventListener('click',function(e){var b=e.target.closest('.chip'); if(!b) return; tab=b.getAttribute('data-t'); Array.prototype.forEach.call(ov.querySelectorAll('#fztab .chip'),function(x){x.setAttribute('aria-pressed',String(x===b));}); qi.value=''; draw();});
    box.addEventListener('click',function(e){var b=e.target.closest('.pkrow'); if(b){close(); cb(b.getAttribute('data-s'));}});
    ov.querySelector('#fzx').addEventListener('click',close); ov.addEventListener('keydown',function(e){if(e.key==='Escape') close();});
    draw(); setTimeout(function(){qi.focus();},30);
  }
  // ---------- Batalla de facciones (juego) ----------
  function battle(){
    var D=window.MAT_DUELO_API, out=document.getElementById('fzbatout'); if(!D||!out) return;
    out.innerHTML='<h2>Batalla de facciones</h2><p class="sub">Preparando los duelos…</p>'; try{out.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){}
    var modes=[['cielo','Aire'],['suelo','Tierra'],['mar','Mar'],['sub','Bajo el mar']];
    function pickBest(sd,mode){ var S={}; sd.m.forEach(function(k){S[k]=1;});
      var invq={}; sd.m.forEach(function(k){(DATA.inv[k]||[]).forEach(function(r){if(r[1]&&r[3]) invq[r[1]]=(invq[r[1]]||0)+r[3];});});
      var L=I.filter(function(a){ if(!D.ok(a,mode)||a.proto) return false; if(invq[a.id]) return true; if(!a.serv||!a.ops) return false; for(var k in a.ops){ if(S[k]&&!a.ops[k].f) return true;} return false;});
      function sc(a){var s=D.score(a,mode)+(invq[a.id]?60:0); if(mode==='suelo'&&(a.tipo==='t_principal'||(a.alt||[]).indexOf('t_principal')>=0)) s+=40; if(mode==='mar'&&/destructores|cruceros|fragatas/.test(a.tipo)) s+=30; if(mode==='sub'){ if(a.tipo==='s_nuclear') s+=25; if(a.tipo==='s_balistico') s+=10;} return s;}
      L.sort(function(x,y){return sc(y)-sc(x)||(invq[y.id]||0)-(invq[x.id]||0);});
      return L[0]||null;}
    var pairs=modes.map(function(m){return {m:m,a:pickBest(A,m[0]),b:pickBest(B,m[0])};});
    var need=[]; pairs.forEach(function(p){if(p.a) need.push(p.a); if(p.b) need.push(p.b);});
    X.ensure(need,function(){ var wa=0,wb=0, rows='';
      pairs.forEach(function(p){ var mm=p.m[0];
        if(!p.a||!p.b){ rows+='<tr><th>'+p.m[1]+'</th><td>'+(p.a?esc(p.a.n):'— sin unidad')+'</td><td>'+(p.b?esc(p.b.n):'— sin unidad')+'</td><td>'+(p.a&&!p.b?esc(A.n)+' (sin rival)':p.b&&!p.a?esc(B.n)+' (sin rival)':'—')+'</td></tr>'; if(p.a&&!p.b) wa++; if(p.b&&!p.a) wb++; return;}
        var r=D.run(mm,p.a,p.b,400), pa=Math.round(r.pa*100), win=pa>=50?0:1; if(win===0) wa++; else wb++;
        rows+='<tr><th>'+p.m[1]+'</th><td class="'+(win===0?'w':'')+'"><a href="#/a/'+p.a.id+'">'+esc(p.a.n)+'</a></td><td class="'+(win===1?'w':'')+'"><a href="#/a/'+p.b.id+'">'+esc(p.b.n)+'</a></td><td>'+(win===0?esc(A.n)+' '+pa:esc(B.n)+' '+(100-pa))+' %<br><a href="#/duelo?m='+mm+'&a='+p.a.id+'&b='+p.b.id+'&go=1">'+(window.MAT_LANG==='en'?'See duel ›':'Ver duelo ›')+'</a></td></tr>';});
      var res=wa===wb?'Empate '+wa+'–'+wb:(wa>wb?esc(A.n):esc(B.n))+' gana '+Math.max(wa,wb)+'–'+Math.min(wa,wb);
      out.innerHTML='<h2>Batalla de facciones</h2><div class="result"><div class="kicker">Juego, no predicción</div><h2 style="margin-top:4px;border:0;font-size:22px;letter-spacing:0;text-transform:none;color:var(--tx)">'+res+'</h2><p class="sub">Cada lado envía su mejor unidad en servicio por terreno: se prefieren los modelos con unidades en las tablas de Wikipedia, y entre ellos el más moderno y mejor valorado por el Duelo (carros principales en tierra, destructores y fragatas en mar, nucleares de ataque bajo el mar). Se simulan 400 duelos por terreno con su primera arma.</p><table class="ctab fzbt"><tbody><tr><th>Terreno</th><th>'+esc(A.n)+'</th><th>'+esc(B.n)+'</th><th>Gana (de 400)</th></tr>'+rows+'</tbody></table><p class="note">Reglas de juego del Duelo: precisión y daño son valores de simulación; las cifras salen de las fichas. No predice una guerra real: no cuenta número de unidades, logística, doctrina ni alianzas.</p></div>';
    });
  }
};
})();
