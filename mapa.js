
(function(){
"use strict";
// ======================= M.A.T · MAPA DEL MUNDO (globo 3D) =======================
var COL={a:'#d4ae4c',b:'#6fa3d6',ab:'#b58ad6'};
var HIST={urss:['ru','ua','by','kz','uz','tm','kg','tj','ge','am','az','md','ee','lv','lt'],checoslovaquia:['cz','sk'],yugoslavia:['si','hr','ba','rs','me','mk','xk'],imperio_ruso:['ru'],rodesia:['zw']};
var WORLD=null, WP=null, CUR=null, T3P=null, BD=null, BDP=null;
function loadBases(){ if(BDP) return BDP; BDP=window.MAT_GET('bases.json.gz').then(function(d){ var c=d.cols.split(','), L=d.b.map(function(r,i){ var o={i:i}; c.forEach(function(k,j){o[k]=r[j];}); return o; });
  var ord=L.slice().sort(function(a,b){return b.r-a.r;}); ord.forEach(function(b,j){ b.rk=j/Math.max(1,ord.length-1); });
  var byH={}, byF={}; L.forEach(function(b){ (byH[b.h]=byH[b.h]||[]).push(b); if(b.f) b.f.forEach(function(k){ (byF[k]=byF[k]||[]).push(b); }); });
  d.L=L; d.byH=byH; d.byF=byF; delete d.b; BD=d; return d; }).catch(function(e){ BDP=null; throw e; }); return BDP; }
function loadWorld(){ if(WP) return WP; WP=window.MAT_GET('world.json.gz').then(function(w){prep(w);WORLD=w;return w;}); return WP; }
function prep(w){ w.byIso={}; w.byKey={};
  w.c.forEach(function(c,ix){ c.ix=ix; var x0=999,y0=999,x1=-999,y1=-999;
    c.R=c.r.map(function(a){ var o=new Float32Array(a.length), x=0,y=0; for(var i=0;i<a.length;i+=2){x+=a[i];y+=a[i+1];o[i]=x/100;o[i+1]=y/100; if(o[i]<x0)x0=o[i]; if(o[i]>x1)x1=o[i]; if(o[i+1]<y0)y0=o[i+1]; if(o[i+1]>y1)y1=o[i+1];} return o;});
    c.bb=[x0,y0,x1,y1]; delete c.r; w.byIso[c.i]=c; if(c.k){ (w.byKey[c.k]=w.byKey[c.k]||[]).push(c); } });
  w.pk=w.c.filter(function(c){return c.e;}).concat(w.c.filter(function(c){return !c.e;}));
}
function isosOf(k){ if(HIST[k]) return HIST[k]; return (WORLD.byKey[k]||[]).map(function(c){return c.i;}); }
function inRings(c,x,y){ var ins=false; for(var r=0;r<c.R.length;r++){ var a=c.R[r], n=a.length; for(var i=0,j=n-2;i<n;j=i,i+=2){ var yi=a[i+1], yj=a[j+1]; if((yi>y)!==(yj>y)){ var xi=a[i], xj=a[j]; if(x<(xj-xi)*(y-yi)/(yj-yi)+xi) ins=!ins; } } } return ins; }
function pickLL(lon,lat,tol){ var C=WORLD.pk||WORLD.c, best=null, bd=1e9, cl=Math.cos(lat*Math.PI/180);
  var mr=Math.min(tol*.5,.1); for(var q0=0;q0<C.length;q0++){ var cm=C[q0]; if(!cm.m) continue; for(var q1=0;q1<cm.m.length;q1++){ var mx=(cm.m[q1][0]-lon)*cl, my=cm.m[q1][1]-lat; if(mx*mx+my*my<mr*mr) return cm; } }
  for(var i=0;i<C.length;i++){ var c=C[i], b=c.bb; if(lon<b[0]-tol/Math.max(cl,.2)||lon>b[2]+tol/Math.max(cl,.2)||lat<b[1]-tol||lat>b[3]+tol) continue;
    if(lon>=b[0]&&lon<=b[2]&&lat>=b[1]&&lat<=b[3]&&inRings(c,lon,lat)) return c; }
  for(i=0;i<C.length;i++){ c=C[i]; b=c.bb; if(lon<b[0]-tol*3||lon>b[2]+tol*3||lat<b[1]-tol||lat>b[3]+tol) continue;
    for(var r=0;r<c.R.length;r++){ var a=c.R[r]; for(var k=0;k<a.length;k+=2){ var dx=(a[k]-lon)*cl, dy=a[k+1]-lat, d=dx*dx+dy*dy; if(d<bd){bd=d;best=c;} } } }
  return bd<=tol*tol?best:null; }
function nrm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function hex2rgb(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];}
function mix(a,b,t){var A=hex2rgb(a),B=hex2rgb(b);return 'rgb('+[0,1,2].map(function(i){return Math.round(A[i]+(B[i]-A[i])*t);}).join(',')+')';}
function mixH(a,b,t){var A=hex2rgb(a),B=hex2rgb(b);return '#'+[0,1,2].map(function(i){return ('0'+Math.round(A[i]+(B[i]-A[i])*t).toString(16)).slice(-2);}).join('');}
function ramp(t){ return t<.5?mixH('#1f272b','#4d5a37',t*2):mixH('#4d5a37','#a0ad70',(t-.5)*2); }
function ll2v(T,lon,lat,r){ var ph=(lon+180)*Math.PI/180, th=(90-lat)*Math.PI/180; return new T.Vector3(-Math.cos(ph)*Math.sin(th)*r, Math.cos(th)*r, Math.sin(ph)*Math.sin(th)*r); }
function v2ll(v){ var r=v.length(), th=Math.acos(Math.max(-1,Math.min(1,v.y/r))), ph=Math.atan2(v.z,-v.x); if(ph<0) ph+=Math.PI*2; return [ph*180/Math.PI-180, 90-th*180/Math.PI]; }

window.MAT_MAPA=function(app,X){
  if(CUR){CUR.dispose();CUR=null;}
  var P=X.P, esc=X.esc, FZ=window.MAT_FZ;
  if(!FZ){app.innerHTML='<p class="sub" style="padding:24px 0">No se pudo cargar el mapa.</p>';return;}
  if(!WORLD||!FZ.data()){ app.innerHTML=X.crumbs([['Inicio','#/'],['Mapa del mundo']])+'<h1>Mapa del mundo</h1><p class="sub" style="padding:24px 0">Cargando el globo…</p>';
    Promise.all([loadWorld(),FZ.load()]).then(function(){ if(/^#\/mapa/.test(location.hash)) window.MAT_MAPA(app,X); }).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">No se pudieron cargar los datos del mapa. Comprueba la conexión.</p>';}); return; }
  var DATA=FZ.data(), nf=FZ.nf, IC=FZ.IC, ICN=FZ.ICN;
  var FAC={}; DATA.fac.forEach(function(f){FAC[f.id]=f;});
  var o=X.qs(), sel=[];
  [o.a,o.b].forEach(function(s){ if(s&&sideOf(s)) sel.push(s); });
  var force2d=o.v==='2d';
  // ---- data helpers
  var TOT={}, MAXT=1;
  Object.keys(DATA.inv).forEach(function(k){ var t=0; DATA.inv[k].forEach(function(r){ if(r[3]!=null&&r[2]!=='buques_menores') t+=r[3]; }); TOT[k]=t; if(t>MAXT) MAXT=t; });
  function sideOf(s){ if(!s) return null; var t=s.slice(0,2), k=s.slice(2);
    if(t==='p:'&&P[k]) return {s:s,n:P[k].n.split(' (')[0],m:[k],k:k,kind:'País'};
    if(t==='f:'&&FAC[k]){var f=FAC[k]; return {s:s,n:f.n,m:f.m.filter(function(x){return P[x];}),fac:f,kind:f.h?'Facción histórica':'Facción'};}
    if(t==='c:'){var c=FZ.custom().filter(function(x){return x.id===k;})[0]; if(c) return {s:s,n:c.n,m:c.m.filter(function(x){return P[x];}),kind:'Facción propia'};}
    return null; }
  function facsOf(k){ return DATA.fac.filter(function(f){return f.m.indexOf(k)>=0;}); }
  function flagImg(k){ return P[k]&&P[k].flag?'<img class="mini" src="'+P[k].flag+'" alt="" loading="lazy">':''; }
  // ---- page skeleton
  var facChips=DATA.fac.filter(function(f){return !f.h;}).concat(DATA.fac.filter(function(f){return f.h;})).map(function(f){return '<button class="chip mpchip" data-s="f:'+f.id+'" aria-pressed="false">'+esc(f.n.replace(/ \(.*\)$/,''))+(f.h?' <span class="mph">hist.</span>':'')+'</button>';}).join('')
    +FZ.custom().map(function(c){return '<button class="chip mpchip" data-s="c:'+esc(c.id)+'" aria-pressed="false">'+esc(c.n)+' <span class="mph">tuya</span></button>';}).join('')
    +'<a class="chip mpchip mpnew" href="#/fuerzas">+ Crear facción</a>';
  var h=X.crumbs([['Inicio','#/'],['Mapa del mundo']])+'<div class="mptop"><h1>Mapa del mundo</h1><p class="sub">Toca un país para ver su arsenal. Toca otro y se comparan. Arrastra para girar, pellizca para acercar.</p></div>'
    +'<div class="mpbar"><div class="mpsearch"><input id="mpq" type="search" placeholder="Buscar país" autocomplete="off" aria-label="Buscar país"><div id="mpres" class="mpres" hidden></div></div><button class="btn mpbtog" id="mpbt" aria-pressed="false" data-noi18n><i></i><span></span></button><button class="btn mpreset" id="mpreset" hidden>Reiniciar</button></div>'
    +'<div class="mpbrow" id="mpbrow" hidden data-noi18n></div>'
    +'<div class="mpchips" role="group" aria-label="Facciones"><span class="mpcl">Facciones</span>'+facChips+'</div>'
    +'<div class="mpwrap"><div class="mpglobe" id="mpg"><canvas id="mpc" aria-label="Globo terráqueo interactivo"></canvas><div class="mptip" id="mptip" hidden></div><div class="mpbcard" id="mpbcard" hidden data-noi18n></div><div class="mplab" id="mplab0" hidden></div><div class="mplab b" id="mplab1" hidden></div><div class="mphint" id="mphint">Toca un país · toca dos para compararlos</div><div class="mpleg" id="mpleg"></div><div class="mpload" id="mpload">Cargando globo 3D…</div></div>'
    +'<aside class="mppanel" id="mpp" aria-live="polite"></aside></div>'
    +'<p class="note">Mapa: Natural Earth 1:50m (dominio público), simplificado. Intensidad del color = unidades en servicio con cifra en las tablas de equipamiento de Wikipedia ('+esc(DATA.fecha)+'); gris = sin tabla cargada todavía. Las fronteras son ilustrativas.</p>';
  X.set(h);
  var gEl=app.querySelector('#mpg'), cv=app.querySelector('#mpc'), pEl=app.querySelector('#mpp'), tip=app.querySelector('#mptip'), hint=app.querySelector('#mphint'), leg=app.querySelector('#mpleg'), ld=app.querySelector('#mpload');
  var qEl=app.querySelector('#mpq'), resEl=app.querySelector('#mpres'), rsBtn=app.querySelector('#mpreset');
  var dead=false, R=null, sheetOpen=false, IS3D=false;
  var isPhone=function(){return window.innerWidth<900;};
  // ---- capa BASES MILITARES (Wikidata; carga perezosa al activarla)
  var EN=window.MAT_LANG==='en'; function LG(es,en){return EN?en:es;}
  var BCOL={a:'#5aa9f0',n:'#2fc2b4',t:'#9bc45a',o:'#aab2b8'}, BTN={a:['Aérea','Air'],n:['Naval','Naval'],t:['Terrestre','Land'],o:['Otra / sin clasificar','Other / unclassified']}, BTP={a:['Aéreas','Air'],n:['Navales','Naval'],t:['Terrestres','Land'],o:['Otras','Other']};
  var B={on:false,cl:false,cur:null,more:{}}, BR=null;
  try{ B.on=o.capa==='bases'||(o.capa==null&&localStorage.getItem('mat_bases')==='1'); }catch(e){ B.on=o.capa==='bases'; }
  var btEl=app.querySelector('#mpbt'), brEl=app.querySelector('#mpbrow'), bcEl=app.querySelector('#mpbcard');
  function bvf(b){ return B.cl||b.st!==2; }
  function bname(b){ return EN?(b.ne||b.n):b.n; }
  function cname(k){ if(!k) return '—'; if(k.charAt(0)==='#'){ var hh=BD&&BD.H[k]; return hh?(EN?hh[1]:hh[0]):k.slice(1).toUpperCase(); } var n=P[k]?P[k].n.split(' (')[0]:k; return EN&&window.MAT_T?window.MAT_T(n):n; }
  function bwiki(b){ var es=b.es===1?b.n:b.es, en=b.en===1?(b.ne||b.n):b.en;
    if(EN&&en) return ['https://en.wikipedia.org/wiki/'+encodeURIComponent(en.replace(/ /g,'_')),'Wikipedia'];
    if(!EN&&es) return ['https://es.wikipedia.org/wiki/'+encodeURIComponent(es.replace(/ /g,'_')),'Wikipedia'];
    if(en) return ['https://en.wikipedia.org/wiki/'+encodeURIComponent(en.replace(/ /g,'_')),EN?'Wikipedia':'Wikipedia (inglés)'];
    if(es) return ['https://es.wikipedia.org/wiki/'+encodeURIComponent(es.replace(/ /g,'_')),EN?'Wikipedia (Spanish)':'Wikipedia'];
    return ['https://www.wikidata.org/wiki/Q'+b.q,'Wikidata']; }
  function bstat(b){ return b.st===2?LG('Cerrada','Closed')+(b.y?' · '+b.y:''):b.st===1?LG('En uso','In use'):'—'; }
  function bHiKeys(){ var H={}; sel.map(sideOf).filter(Boolean).forEach(function(sd){ sd.m.forEach(function(k){H[k]=1;}); }); if(ndC) H['#'+ndC.i]=1; return H; }
  function bRow(){ if(!B.on){ brEl.hidden=true; return; } brEl.hidden=false;
    if(!BD){ brEl.innerHTML='<span class="mpsrc">'+LG('Cargando bases militares…','Loading military bases…')+'</span>'; return; }
    var cnt={a:0,n:0,t:0,o:0}, nf0=0, ncl=0; BD.L.forEach(function(b){ if(b.st===2) ncl++; if(!bvf(b)) return; cnt[b.t]++; if(b.f) nf0++; });
    brEl.innerHTML='<div class="mpbleg">'+['a','n','t','o'].map(function(t){ return '<span><i style="background:'+BCOL[t]+'"></i>'+(EN?BTP[t][1]:BTP[t][0])+' <em>'+nf(cnt[t])+'</em></span>'; }).join('')
      +'<span><i class="fr"></i>'+LG('Extranjera','Foreign')+' <em>'+nf(nf0)+'</em></span></div>'
      +'<button class="chip mpbcl" id="mpbcl" aria-pressed="'+B.cl+'">'+LG('Mostrar cerradas','Show closed')+' ('+nf(ncl)+')</button>'
      +'<p class="mpsrc mpbsrc">'+LG('Fuente','Source')+': <a href="https://www.wikidata.org/" target="_blank" rel="noopener">Wikidata</a> · '+esc(BD.fecha)+'<span class="mpbx">. '+LG('Extranjera = operada por otro país según Wikidata o','Foreign = run by another country per Wikidata or')+' <a href="'+esc(BD.src.wp[0][1])+'" target="_blank" rel="noopener">Wikipedia</a>. '+LG('Alejado se ven las más conocidas; acerca para ver todas.','Zoomed out, only the best-known show; zoom in for all.')+'</span></p>'; }
  function bBtn(){ btEl.setAttribute('aria-pressed',B.on); btEl.querySelector('span').textContent=LG('Bases militares','Military bases'); }
  function bSet(on){ B.on=on; try{localStorage.setItem('mat_bases',on?'1':'0');}catch(e){} if(!on) bHide(); bBtn(); bRow();
    if(on&&!BD) bLoad0();
    update(false); }
  btEl.addEventListener('click',function(){ bSet(!B.on); });
  brEl.addEventListener('click',function(e){ if(e.target.closest('#mpbcl')){ B.cl=!B.cl; bRow(); if(B.cur!=null&&!bvf(BD.L[B.cur])) bHide(); if(BR) BR.refresh(); renderPanel(); } });
  function bHide(){ B.cur=null; bcEl.hidden=true; if(BR) BR.refresh(); }
  function bShow(i){ var b=BD&&BD.L[i]; if(!b) return; B.cur=i; var w=bwiki(b);
    var ops=(b.o||[]).map(function(j){ var x=BD.O[j]; return EN?(x[1]||x[0]):x[0]; });
    var h='<button class="mpx" data-bc="x" aria-label="'+LG('Cerrar','Close')+'">×</button>'
      +'<div class="bct"><i style="background:'+BCOL[b.t]+'"></i>'+esc(EN?BTN[b.t][1]:BTN[b.t][0])+' · '+esc(bstat(b))+'</div>'
      +'<b class="bcn">'+esc(bname(b))+'</b>'
      +'<div class="bcr">'+LG('País','Country')+': '+(P[b.h]?'<button class="bclk" data-bs="'+esc(b.h)+'">'+flagImg(b.h)+esc(cname(b.h))+'</button>':esc(cname(b.h)))+'</div>'
      +(b.f?'<div class="bcr bcf"><span class="btag f">'+LG('Extranjera','Foreign')+'</span> '+LG('Presencia de','Presence of')+' '+b.f.map(function(k){ return (P[k]?flagImg(k):'')+esc(cname(k)); }).join(', ')+(b.fw?' <span class="bcop">('+LG('según','per')+' <a href="'+esc(BD.src.wp[0][1])+'" target="_blank" rel="noopener">Wikipedia</a>)</span>':'')+'</div>'+(ops.length?'<div class="bcr"><span class="bcop">'+LG('Operador en Wikidata','Operator on Wikidata')+': '+esc(ops.join(', '))+'</span></div>':''):'')
      +'<div class="bcl"><a href="'+esc(w[0])+'" target="_blank" rel="noopener">'+esc(w[1])+' ›</a>'+(w[1]!=='Wikidata'?' <a class="bwd" href="https://www.wikidata.org/wiki/Q'+b.q+'" target="_blank" rel="noopener">Wikidata</a>':'')+'</div>';
    bcEl.innerHTML=h; bcEl.hidden=false; if(BR) BR.refresh(); }
  bcEl.addEventListener('click',function(e){ var t=e.target.closest('button'); if(!t) return; if(t.dataset.bc){ bHide(); return; } if(t.dataset.bs){ bHide(); choose('p:'+t.dataset.bs); } });
  function bLi(b,showHost){ var w=bwiki(b);
    return '<li><i class="bd" style="background:'+BCOL[b.t]+'"'+(b.f&&!showHost?' data-f="1"':'')+'></i><div class="bli"><button class="bnm" data-bq="'+b.i+'">'+esc(bname(b))+'</button>'
      +'<span class="bmeta">'+esc(EN?BTN[b.t][1]:BTN[b.t][0])+(showHost?' · '+esc(cname(b.h)):'')+(b.st===2?' · '+esc(bstat(b)):'')+'</span>'
      +(b.f&&!showHost?' <span class="btag f">'+esc(b.f.map(cname).join(', '))+'</span>':'')+'</div><a class="bwk" href="'+esc(w[0])+'" target="_blank" rel="noopener" aria-label="'+esc(w[1])+'">'+(w[1]==='Wikidata'?'WD':'W')+'</a></li>'; }
  function bList(key,L,showHost){ var lim=B.more[key]?L.length:15;
    return '<ul class="mpbl">'+L.slice(0,lim).map(function(b){return bLi(b,showHost);}).join('')+'</ul>'+(L.length>lim?'<button class="btn mpbmore" data-bmore="'+esc(key)+'">'+LG('Ver las ','Show all ')+nf(L.length)+'</button>':''); }
  function bSec(keys){ if(!B.on) return ''; var h='<div class="mpbsec" data-noi18n>';
    if(!BD) return h+'<h3 class="mph3">'+LG('Bases militares','Military bases')+'</h3><p class="mpsrc">'+LG('Cargando…','Loading…')+'</p></div>';
    var TO={a:0,n:1,t:2,o:3}, srt=function(a,b){ return (b.f?1:0)-(a.f?1:0)||TO[a.t]-TO[b.t]||(a.st===2)-(b.st===2)||b.r-a.r||a.n.localeCompare(b.n); };
    var L=[], A=[]; keys.forEach(function(k){ (BD.byH[k]||[]).forEach(function(b){ if(bvf(b)) L.push(b); }); (BD.byF[k]||[]).forEach(function(b){ if(bvf(b)&&keys.indexOf(b.h)<0&&A.indexOf(b)<0) A.push(b); }); });
    L.sort(srt); A.sort(function(a,b){ return cname(a.h).localeCompare(cname(b.h))||b.r-a.r; });
    var cnt={a:0,n:0,t:0,o:0}, nfor=0; L.forEach(function(b){ cnt[b.t]++; if(b.f) nfor++; });
    h+='<h3 class="mph3">'+LG('Bases','Bases')+' ('+nf(L.length)+')</h3>';
    if(!L.length) h+='<p class="mpempty">— '+LG('Wikidata no tiene bases con coordenadas aquí.','Wikidata has no bases with coordinates here.')+'</p>';
    else { h+='<div class="mpbcnt">'+['a','n','t','o'].filter(function(t){return cnt[t];}).map(function(t){ return '<span><i style="background:'+BCOL[t]+'"></i>'+(EN?BTP[t][1]:BTP[t][0])+' <b>'+nf(cnt[t])+'</b></span>'; }).join('')+(nfor?'<span><i class="fr"></i>'+LG('Extranjeras','Foreign')+' <b>'+nf(nfor)+'</b></span>':'')+'</div>'+bList('h:'+keys.join(','),L,false); }
    if(A.length) h+='<h3 class="mph3">'+LG('Bases en el extranjero','Bases abroad')+' ('+nf(A.length)+')</h3>'+bList('f:'+keys.join(','),A,true);
    h+='<p class="mpsrc">'+LG('Fuente: Wikidata','Source: Wikidata')+(A.length||nfor?LG(' y Wikipedia',' and Wikipedia'):'')+' · '+esc(BD.fecha)+(B.cl?'':' · '+LG('sin las cerradas','closed ones hidden'))+'</p>';
    return h+'</div>'; }
  pEl.addEventListener('click',function(e){ var t=e.target.closest('[data-bq],[data-bmore]'); if(!t) return;
    if(t.dataset.bmore){ B.more[t.dataset.bmore]=1; renderPanel(); return; }
    var b=BD&&BD.L[+t.dataset.bq]; if(!b) return; if(isPhone()){ sheetOpen=false; pEl.classList.remove('big'); } bShow(b.i); if(R&&R.focusLL) R.focusLL(b.lon,b.lat,1.75); if(isPhone()) phoneScroll(); });
  bBtn(); bRow(); if(B.on) bLoad0();
  function bLoad0(){ loadBases().then(function(){ if(dead) return; bRow(); if(BR) BR.refresh(); renderPanel(); }).catch(function(){ if(!dead) brEl.innerHTML='<span class="mpsrc">'+LG('No se pudieron cargar las bases. Comprueba la conexión.','Could not load the bases. Check your connection.')+'</span>'; }); }

  // ---- texture (equirectangular) shared by 3D and 2D
  var TW=(Math.min(screen.width,screen.height)<700?2048:4096), TH=TW/2;
  var tcv=document.createElement('canvas'); tcv.width=TW; tcv.height=TH; var tctx=tcv.getContext('2d');
  WORLD.c.forEach(function(c){ var p=new Path2D(); c.R.forEach(function(a){ for(var i=0;i<a.length;i+=2){ var x=(a[i]+180)/360*TW, y=(90-a[i+1])/180*TH; if(i) p.lineTo(x,y); else p.moveTo(x,y);} p.closePath(); }); c.P2=p; });
  function memberSets(){ var S=[{},{}]; sel.forEach(function(s,i){ var sd=sideOf(s); if(!sd) return; sd.m.forEach(function(k){ isosOf(k).forEach(function(iso){S[i][iso]=1;}); }); }); return S; }
  function fillOf(c,S){ var inA=S[0][c.i], inB=S[1][c.i];
    if(inA&&inB) return COL.ab; if(inA) return COL.a; if(inB) return COL.b;
    var base; if(c.k&&TOT[c.k]!=null) base=ramp(Math.log(1+TOT[c.k])/Math.log(1+MAXT)); else if(c.k) base='#22272b'; else base='#15181b';
    return sel.length?mixH(base,'#0b0d0f',.45):base; }
  function drawTex(){ var g=tctx; var gr=g.createLinearGradient(0,0,0,TH); gr.addColorStop(0,'#070a0d'); gr.addColorStop(.5,'#0a0f14'); gr.addColorStop(1,'#070a0d'); g.fillStyle=gr; g.fillRect(0,0,TW,TH);
    g.strokeStyle='rgba(120,140,160,.10)'; g.lineWidth=TW/4096; g.beginPath(); for(var lo=-180;lo<=180;lo+=30){var x=(lo+180)/360*TW; g.moveTo(x,0); g.lineTo(x,TH);} for(var la=-60;la<=60;la+=30){var y=(90-la)/180*TH; g.moveTo(0,y); g.lineTo(TW,y);} g.stroke();
    var S=memberSets();
    WORLD.c.forEach(function(c){ g.fillStyle=fillOf(c,S); g.fill(c.P2,'evenodd'); });
    if(!IS3D){ g.strokeStyle='rgba(190,200,205,.45)'; g.lineWidth=TW/4096; WORLD.c.forEach(function(c){ g.stroke(c.P2); }); }
  }
  // ---- side panel / sheet
  function invRowsTop(k){ var R0=DATA.inv[k]||[], best={}; R0.forEach(function(r){ if(r[3]==null) return; var c=r[2]; if(!best[c]||r[3]>best[c][3]) best[c]=r; }); return best; }
  function srcList(m){ var S={}; m.forEach(function(k){ (DATA.inv[k]||[]).forEach(function(r){S[r[5]]=1;}); }); return Object.keys(S).map(Number).sort(function(a,b){return a-b;}).map(function(i){var f=DATA.fuentes[i]; return f?'<a href="'+esc(f[1])+'" target="_blank" rel="noopener">'+esc(f[0])+'</a>':'';}).filter(Boolean); }
  function fzLink(a,b){ return '#/fuerzas?a='+encodeURIComponent(a)+'&b='+encodeURIComponent(b); }
  function oneSide(sd,slot){ var I=FZ.inv(sd.m), h='';
    h+='<div class="mphd"><span class="mpdot" style="background:'+COL[slot]+'"></span><div class="mphn">'+(sd.k?flagImg(sd.k):'')+'<b>'+esc(sd.n)+'</b><span class="mpk">'+esc(sd.kind)+(sd.m.length>1?' · '+sd.m.length+' países':'')+'</span></div><button class="mpx" aria-label="Quitar" data-x="'+esc(sd.s)+'">×</button></div>';
    if(sd.k){ var F=facsOf(sd.k); if(F.length) h+='<div class="mptags">'+F.map(function(f){return '<button class="mptag'+(f.h?' h':'')+'" data-s="f:'+f.id+'">'+esc(f.n.replace(/ \(.*\)$/,''))+'</button>';}).join('')+'</div>'; }
    else { h+='<div class="mpflags">'+sd.m.slice(0,40).map(flagImg).join('')+(sd.m.length>40?' +'+(sd.m.length-40):'')+'</div>'; if(sd.fac) h+='<p class="mpsrc">'+(window.MAT_LANG==='en'?'Members per ':'Miembros según ')+'<a href="'+esc(sd.fac.src.url)+'" target="_blank" rel="noopener">Wikipedia: '+esc(sd.fac.src.t)+'</a> ('+esc(sd.fac.src.fecha)+')'+(sd.fac.nota?'. '+esc(window.MAT_T?window.MAT_T(sd.fac.nota):sd.fac.nota):'')+'</p>'; }
    if(B.on&&BD&&sd.m.length===1) h+=bSec(sd.m);
    h+='<h3 class="mph3">Unidades en servicio</h3><p class="mpsrc">Según Wikipedia · '+esc(DATA.fecha)+(sd.m.length>1?' · suma de sus miembros':'')+'</p>'+(sd.fac&&sd.fac.h?'<p class="mpsrc">Facción histórica: son las unidades de hoy de esos países, no las de su época.</p>':'');
    if(sd.m.length===1&&window.MAT_FZ.sfa(sd.m[0])) h+=window.MAT_FZ.sfa(sd.m[0]);
    if(!I.has&&sd.m.length===1&&window.MAT_FZ.sfa(sd.m[0])){ } else if(!I.has){ h+='<p class="mpempty">— Sin tabla de equipamiento cargada todavía para '+(sd.m.length>1?'ningún miembro':esc(sd.n))+'. Se mostrará cuando esté verificada, nunca una estimación.</p>'; }
    else { h+='<div class="mpgrid">'+IC.map(function(c){ var t=I.tot[c[0]], nq=I.noq[c[0]]||0; if(t==null&&!nq) return ''; return '<div class="mpc"><span>'+c[1]+'</span><b>'+nf(t)+'</b>'+(nq?'<i>+'+nq+' sin cifra</i>':'')+'</div>'; }).join('')+'</div>';
      if(sd.k){ var best=invRowsTop(sd.k), keys=['aviones_combate','helicopteros','tanques','blindados','artilleria','antiaereos','buques_portaaviones','buques_destructores','buques_fragatas','submarinos'].filter(function(c){return best[c];});
        if(keys.length) h+='<h3 class="mph3">Lo más numeroso por categoría</h3><div class="mptop5">'+keys.map(function(c){var r=best[c], nm=r[1]&&X.BY[r[1]]?X.BY[r[1]].n:r[0]; return '<div class="mpt"><span class="mptc">'+ICN[c]+'</span>'+(r[1]&&X.BY[r[1]]?'<a href="#/a/'+r[1]+'">'+esc(nm)+'</a>':'<span>'+esc(nm)+'</span>')+'<b>'+nf(r[3])+'</b></div>';}).join('')+'</div>'; }
      if(I.nod.length&&sd.m.length>1) h+='<p class="mpsrc">Sin tabla cargada: '+I.nod.map(function(k){return esc(P[k].n.split(' (')[0]);}).join(', ')+' (no suman).</p>';
      var SL=srcList(sd.m); if(SL.length) h+='<details class="mpsrcs"><summary>Fuentes ('+SL.length+')</summary><div>'+SL.join('<br>')+'</div></details>'; }
    if(sd.m.length===1&&window.MAT_GASTO) h+=window.MAT_GASTO.block(sd.m[0],'mph3');
    if(sd.m.length===1) h+=window.MAT_FZ.chg(sd.m[0],'mph3');
    if(!B.on||!BD||sd.m.length>1) h+=bSec(sd.m);
    var other=sd.s==='p:espana'?'p:francia':'p:espana';
    h+='<div class="btns mpbtns"><a class="btn pri" href="'+fzLink(sd.s,other)+'">Ver arsenal completo</a><button class="btn" id="mpcmp">Comparar</button></div>';
    return h; }
  function twoSides(A,B){ var IA=FZ.inv(A.m), IB=FZ.inv(B.m), h='';
    h+='<div class="mpvs"><div class="mpvsa"><span class="mpdot" style="background:'+COL.a+'"></span>'+(A.k?flagImg(A.k):'')+'<b>'+esc(A.n)+'</b><button class="mpx" aria-label="Quitar" data-x="'+esc(A.s)+'">×</button></div><div class="mpvsv">VS</div><div class="mpvsb"><button class="mpx" aria-label="Quitar" data-x="'+esc(B.s)+'">×</button><b>'+esc(B.n)+'</b>'+(B.k?flagImg(B.k):'')+'<span class="mpdot" style="background:'+COL.b+'"></span></div></div>';
    h+='<p class="mpsrc">Unidades en servicio según las tablas de Wikipedia ('+esc(DATA.fecha)+')'+((A.m.length>1||B.m.length>1)?'; en las facciones, suma de sus miembros':'')+'.'+((A.fac&&A.fac.h)||(B.fac&&B.fac.h)?' En las facciones históricas son las unidades de hoy de esos países, no las de su época.':'')+'</p>';
    var any=false, rows='';
    IC.forEach(function(c){ var k=c[0], va=IA.tot[k], vb=IB.tot[k]; if(va==null&&vb==null) return; any=true; rows+=FZ.bar(va,vb,c[1]); });
    h+=any?'<div class="mpbars">'+rows+'</div>':'<p class="mpempty">Ninguno de los dos lados tiene tablas de equipamiento cargadas todavía («—»).</p>';
    [[A,IA],[B,IB]].forEach(function(z){ if(z[1].nod.length) h+='<p class="mpsrc">'+esc(z[0].n)+': sin tabla cargada para '+(z[0].m.length>1?z[1].nod.map(function(k){return esc(P[k].n.split(' (')[0]);}).join(', '):'este país')+' («—», nunca una estimación).</p>'; });
    h+='<div class="btns mpbtns"><a class="btn pri" href="'+fzLink(A.s,B.s)+'">Comparación completa ›</a><button class="btn" id="mpreset2">Reiniciar</button></div><p class="mpsrc">La comparación completa incluye cada modelo con su fuente, los modelos que operan, los sistemas punteros y la Batalla de facciones.</p>';
    return h; }
  function nodata(c){ return '<div class="mphd"><span class="mpdot" style="background:#555"></span><div class="mphn"><b>'+esc(c.n)+'</b><span class="mpk">País</span></div><button class="mpx" aria-label="Cerrar" data-x="__nd">×</button></div><p class="mpempty">Todavía no hay fichas ni tabla de equipamiento de este país en M.A.T.</p>'+bSec(['#'+c.i]); }
  function defaultPanel(){ var withInv=Object.keys(DATA.inv).length, withKey=WORLD.c.filter(function(c){return c.k&&!c.t;}).length;
    return '<h3 class="mph3" style="margin-top:0">Cómo funciona</h3><p class="mpsrc" style="font-size:13px">Toca un país para ver sus unidades en servicio, sus facciones y lo más numeroso de su arsenal. Toca un segundo país, o una facción, y aparece la comparación con un arco entre los dos.</p><p class="mpsrc" style="font-size:13px">'+withInv+' países con tabla de equipamiento cargada · '+withKey+' con fichas en M.A.T.</p><div class="mpgrad"><span>Menos</span><i></i><span>Más unidades</span></div>'; }
  var ndC=null;
  function renderPanel(){ var h='';
    var sds=sel.map(sideOf).filter(Boolean);
    if(sds.length===2) h=twoSides(sds[0],sds[1]); else if(sds.length===1) h=oneSide(sds[0],'a'); else if(ndC) h=nodata(ndC); else h=isPhone()?'':defaultPanel();
    pEl.innerHTML=(isPhone()&&h?'<button class="mpgrab" aria-label="Ampliar o reducir"><i></i></button>':'')+h;
    pEl.classList.toggle('on',!!h); pEl.classList.toggle('big',sheetOpen);
    hint.hidden=sel.length>0||!!ndC; if(sel.length===1&&!ndC){hint.hidden=false; hint.textContent='Toca otro país o una facción para comparar';} else hint.textContent='Toca un país · toca dos para compararlos';
    rsBtn.hidden=!sel.length&&!ndC;
    app.querySelectorAll('.mpchip[data-s]').forEach(function(b){ var i=sel.indexOf(b.getAttribute('data-s')); b.setAttribute('aria-pressed',i>=0); b.style.borderColor=i===0?COL.a:i===1?COL.b:''; });
    leg.innerHTML=sds.length?sds.map(function(sd,i){return '<span><i style="background:'+(i?COL.b:COL.a)+'"></i>'+esc(sd.n)+'</span>';}).join('')+(sds.length===2&&overlap()?'<span><i style="background:'+COL.ab+'"></i>Ambos</span>':''):'<span class="mpg2"><em>Menos</em><b></b><em>Más unidades</em></span><span><i style="background:#22272b"></i>Sin tabla</span>';
  }
  function overlap(){ var S=memberSets(); for(var k in S[0]) if(S[1][k]) return true; return false; }
  pEl.addEventListener('click',function(e){ var t=e.target.closest('button,a'); if(!t) return;
    if(t.classList.contains('mpgrab')){ sheetOpen=!sheetOpen; pEl.classList.toggle('big',sheetOpen); return; }
    if(t.dataset.x){ if(t.dataset.x==='__nd'){ndC=null;} else { sel=sel.filter(function(s){return s!==t.dataset.x;}); } update(); return; }
    if(t.dataset.s){ choose(t.dataset.s); return; }
    if(t.id==='mpcmp'){ sheetOpen=false; hint.hidden=false; hint.textContent='Toca otro país o una facción para comparar'; pEl.classList.remove('big'); if(isPhone()) gEl.scrollIntoView({behavior:'smooth',block:'start'}); flash(hint); return; }
    if(t.id==='mpreset2'){ reset(); return; }
  });
  function flash(el){ el.classList.remove('fl'); void el.offsetWidth; el.classList.add('fl'); }
  function choose(s){ ndC=null; var i=sel.indexOf(s); if(i>=0) sel.splice(i,1); else if(sel.length<2) sel.push(s); else sel[1]=s; update(true); phoneScroll(); }
  function phoneScroll(){ if(!isPhone()||!sel.length) return; var hd=document.querySelector('.top'), hh=hd?hd.getBoundingClientRect().height:0, r=gEl.getBoundingClientRect(); if(Math.abs(r.top-hh)>4) window.scrollTo({top:Math.max(0,r.top+window.scrollY-hh),behavior:'smooth'}); }
  function reset(){ sel=[]; ndC=null; sheetOpen=false; update(); }
  rsBtn.addEventListener('click',reset);
  app.querySelectorAll('.mpchip[data-s]').forEach(function(b){ b.addEventListener('click',function(){ choose(b.getAttribute('data-s')); }); });
  // ---- search
  var TT=window.MAT_T||function(s){return s;}; var SL=WORLD.c.map(function(c){return {c:c,n:c.n,q:nrm(c.n)+' '+(c.k?nrm(P[c.k].n):'')+' '+nrm(TT(c.n))};});
  qEl.addEventListener('input',function(){ var q=nrm(qEl.value.trim()); if(!q){resEl.hidden=true;return;} var L=SL.filter(function(x){return x.q.indexOf(q)>=0;}).sort(function(a,b){return (a.q.indexOf(q)===0?0:1)-(b.q.indexOf(q)===0?0:1)||(b.c.k?1:0)-(a.c.k?1:0)||a.n.localeCompare(b.n);}).slice(0,8);
    resEl.innerHTML=L.length?L.map(function(x){return '<button class="mpri" data-i="'+x.c.i+'">'+(x.c.k?flagImg(x.c.k):'<span class="mpnf"></span>')+esc(x.n)+(x.c.k&&DATA.inv[x.c.k]?'':'<span class="mpk"> · '+(x.c.k?'sin tabla':'sin datos')+'</span>')+'</button>';}).join(''):'<p class="mpsrc" style="padding:8px">Sin resultados</p>'; resEl.hidden=false; });
  resEl.addEventListener('click',function(e){ var b=e.target.closest('.mpri'); if(!b) return; var c=WORLD.byIso[b.dataset.i]; qEl.value=''; resEl.hidden=true; qEl.blur(); tapCountry(c,true); });
  document.addEventListener('click',function oc(e){ if(dead){document.removeEventListener('click',oc);return;} if(!e.target.closest('.mpsearch')) resEl.hidden=true; });
  function tapCountry(c,focus){ if(!c) return; if(!c.k){ if(sel.length){ toast('Sin datos de '+c.n+' en M.A.T todavía'); return; } ndC=c; update(); phoneScroll(); if(focus&&R) R.focusLL(c.l[0],c.l[1]); return; } choose('p:'+c.k); }
  var toastEl=null; function toast(t){ if(!toastEl){toastEl=document.createElement('div'); toastEl.className='mptoast'; gEl.appendChild(toastEl);} toastEl.textContent=t; flash(toastEl); }
  function center(sd){ var v=[0,0,0], n=0; sd.m.forEach(function(k){ isosOf(k).forEach(function(iso){ var c=WORLD.byIso[iso]; if(!c||c.t) return; var la=c.l[1]*Math.PI/180, lo=c.l[0]*Math.PI/180; v[0]+=Math.cos(la)*Math.cos(lo); v[1]+=Math.cos(la)*Math.sin(lo); v[2]+=Math.sin(la); n++; }); });
    if(!n) return null; var L=Math.hypot(v[0],v[1],v[2]); if(L<1e-3){ var c0=WORLD.byIso[isosOf(sd.m[0])[0]]; return c0?c0.l:null; } return [Math.atan2(v[1],v[0])*180/Math.PI, Math.asin(v[2]/L)*180/Math.PI]; }
  function update(focus){ drawTex(); if(R) R.refresh(focus); if(BR) BR.refresh(); renderPanel();
    var qa=sel.map(function(s,i){return (i?'b':'a')+'='+encodeURIComponent(s);}); if(force2d) qa.push('v=2d'); if(B.on) qa.push('capa=bases'); var q=qa.length?'?'+qa.join('&'):''; try{history.replaceState(null,'','#/mapa'+q);}catch(e){} }
  // ---- renderers
  function start2d(why){ ld.hidden=true; gEl.classList.add('flat'); var ctx=cv.getContext('2d'); var vw=0,vh=0;
    R={is2d:true, refresh:function(){draw();}, focusLL:function(){}, dispose:function(){ window.removeEventListener('resize',draw); BR=null; }};
    function draw(){ var w=gEl.clientWidth, hh=Math.round(w/2), dpr=Math.min(window.devicePixelRatio||1,2); cv.style.height=hh+'px'; cv.width=w*dpr; cv.height=hh*dpr; vw=w; vh=hh; ctx.drawImage(tcv,0,0,cv.width,cv.height);
      var S=memberSets(); ctx.save(); ctx.scale(cv.width/TW,cv.height/TH); ctx.lineWidth=2.5*TW/cv.width; WORLD.c.forEach(function(c){ if(S[0][c.i]||S[1][c.i]){ ctx.strokeStyle='#fff'; ctx.stroke(c.P2);} }); ctx.restore(); WORLD.c.forEach(function(c){ if(c.m&&(S[0][c.i]||S[1][c.i])) c.m.forEach(function(p){ ctx.beginPath(); ctx.arc((p[0]+180)/360*cv.width,(90-p[1])/180*cv.height,2.6*dpr,0,7); ctx.fillStyle=S[0][c.i]?COL.a:COL.b; ctx.fill(); ctx.lineWidth=1*dpr; ctx.strokeStyle='#fff'; ctx.stroke(); }); }); 
      if(B.on&&BD){ var HK=bHiKeys(); BD.L.forEach(function(b){ if(!bvf(b)) return; var x=(b.lon+180)/360*cv.width, y=(90-b.lat)/180*cv.height, hi=HK[b.h]||b.i===B.cur; ctx.beginPath(); ctx.arc(x,y,(b.i===B.cur?4.5:hi?2.2:1.15)*dpr,0,7); ctx.globalAlpha=b.st===2?.5:1; ctx.fillStyle=BCOL[b.t]; ctx.fill(); if(b.f||hi){ ctx.lineWidth=1.1*dpr; ctx.strokeStyle=b.i===B.cur?'#fff':b.f?'#ee484d':'#f2f2f2'; ctx.stroke(); } ctx.globalAlpha=1; }); } }
    drawTex(); draw(); window.addEventListener('resize',draw);
    cv.addEventListener('click',function(e){ var r=cv.getBoundingClientRect(); if(B.on&&BD){ var best=-1, bd=144; BD.L.forEach(function(b){ if(!bvf(b)) return; var x=r.left+(b.lon+180)/360*r.width, y=r.top+(90-b.lat)/180*r.height, d=(x-e.clientX)*(x-e.clientX)+(y-e.clientY)*(y-e.clientY); if(d<bd){bd=d;best=b.i;} }); if(best>=0){ bShow(best); return; } if(B.cur!=null) bHide(); } var lon=(e.clientX-r.left)/r.width*360-180, lat=90-(e.clientY-r.top)/r.height*180; tapCountry(pickLL(lon,lat,360/r.width*14)); });
    BR={refresh:draw};
    if(why) leg.insertAdjacentHTML('beforebegin','');
    var n=document.createElement('p'); n.className='mpsrc mp2dnote'; n.textContent=why||'Vista plana.'; gEl.appendChild(n);
  }
  function hasGL(){ try{ var c=document.createElement('canvas'); return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl'))); }catch(e){return false;} }
  CUR={dispose:function(){ dead=true; if(R) R.dispose(); R=null; window.removeEventListener('hashchange',onHash); }};
  function onHash(){ if(!/^#\/mapa/.test(location.hash)&&CUR){ CUR.dispose(); CUR=null; } }
  window.addEventListener('hashchange',onHash);
  renderPanel();
  if(force2d||!hasGL()){ start2d(force2d?'Vista plana (2D).':'Tu navegador no tiene WebGL: vista plana del mapa.'); renderPanel(); return; }
  if(!T3P) T3P=import('./three.module.min.js');
  T3P.then(function(T){ if(dead) return; try{ start3d(T); }catch(err){ console.warn(err); R=null; IS3D=false; start2d('No se pudo iniciar el globo 3D: vista plana.'); } renderPanel(); }).catch(function(){ if(!dead){ start2d('No se pudo cargar el globo 3D: vista plana.'); renderPanel(); } });

  function start3d(T){
    IS3D=true;
    var renderer=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)); renderer.setClearColor(0x000000,1);
    if(renderer.capabilities.maxTextureSize<TW){ TW=2048; TH=1024; }
    var scene=new T.Scene(), cam=new T.PerspectiveCamera(38,1,0.05,200); scene.add(cam);
    var globe=new T.Group(); scene.add(globe);
    var tex=new T.CanvasTexture(tcv); tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
    drawTex(); tex.needsUpdate=true;
    var sph=new T.Mesh(new T.SphereGeometry(1,128,96), new T.MeshPhongMaterial({map:tex,shininess:8,specular:0x151a1f}));
    globe.add(sph);
    scene.add(new T.AmbientLight(0xffffff,1.15)); var dl=new T.DirectionalLight(0xffffff,1.5); dl.position.set(-3,2.2,4); cam.add(dl);
    // borders
    var bp=[]; WORLD.c.forEach(function(c){ c.R.forEach(function(a){ var n=a.length; for(var i=0;i<n;i+=2){ var j=(i+2)%n, x0=a[i],y0=a[i+1],x1=a[j],y1=a[j+1], d=Math.max(Math.abs(x1-x0),Math.abs(y1-y0)), s=Math.max(1,Math.ceil(d/2)); if(Math.abs(x1-x0)>180) continue; for(var k=0;k<s;k++){ var t0=k/s,t1=(k+1)/s, p0=ll2v(T,x0+(x1-x0)*t0,y0+(y1-y0)*t0,1.0015), p1=ll2v(T,x0+(x1-x0)*t1,y0+(y1-y0)*t1,1.0015); bp.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z);} } }); });
    var bg=new T.BufferGeometry(); bg.setAttribute('position',new T.Float32BufferAttribute(bp,3));
    var borders=new T.LineSegments(bg,new T.LineBasicMaterial({color:0xaab4bb,transparent:true,opacity:.42,depthWrite:false})); globe.add(borders);
    // atmosphere + rim
    var atm=new T.Mesh(new T.SphereGeometry(1,64,48),new T.ShaderMaterial({side:T.BackSide,blending:T.AdditiveBlending,transparent:true,depthWrite:false,
      vertexShader:'varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'varying vec3 vN;void main(){float i=pow(max(0.0,0.62-dot(vN,vec3(0.0,0.0,1.0))),3.0);gl_FragColor=vec4(0.36,0.52,0.72,1.0)*i*1.05;}'}));
    atm.scale.setScalar(1.16); scene.add(atm);
    var rim=new T.Mesh(new T.SphereGeometry(1.002,96,64),new T.ShaderMaterial({blending:T.AdditiveBlending,transparent:true,depthWrite:false,
      vertexShader:'varying vec3 vN;varying vec3 vV;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
      fragmentShader:'varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.0-max(0.0,dot(vN,vV)),3.0);gl_FragColor=vec4(0.40,0.58,0.80,1.0)*f*0.38;}'}));
    globe.add(rim);
    // stars
    var sp=[], sc=[]; for(var i=0;i<2600;i++){ var u=Math.random()*2-1, th=Math.random()*Math.PI*2, r=60+Math.random()*30, s=Math.sqrt(1-u*u); sp.push(r*s*Math.cos(th),r*u,r*s*Math.sin(th)); var b=.35+Math.pow(Math.random(),3)*.65; sc.push(b,b,b*1.08); }
    var sg=new T.BufferGeometry(); sg.setAttribute('position',new T.Float32BufferAttribute(sp,3)); sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));
    var stars=new T.Points(sg,new T.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.85,depthWrite:false})); scene.add(stars);
    // bases layer (points, shader)
    var bObj=null, bSel=null, bMat=null, bCutV=1;
    function bGeo(arr,col,fl){ var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(arr,3)); g.setAttribute('aC',new T.Float32BufferAttribute(col,3)); g.setAttribute('aF',new T.Float32BufferAttribute(fl,4)); return g; }
    function bClear(){ [bObj,bSel].forEach(function(x){ if(x){ globe.remove(x); x.geometry.dispose(); } }); bObj=bSel=null; }
    var BCV={}; Object.keys(BCOL).forEach(function(k){ var c=new T.Color(BCOL[k]); BCV[k]=[c.r,c.g,c.b]; });
    function bBuild(){ bClear(); if(!B.on||!BD) return;
      if(!bMat) bMat=new T.ShaderMaterial({uniforms:{uS:{value:1},uCut:{value:1}},transparent:true,depthTest:false,depthWrite:false,
        vertexShader:'attribute vec3 aC;attribute vec4 aF;uniform float uS;uniform float uCut;varying vec3 vC;varying vec4 vF;void main(){vC=aC;vF=aF;vec4 mv=modelViewMatrix*vec4(position,1.0);vec3 n=normalize(normalMatrix*position);float fc=dot(n,normalize(-mv.xyz));gl_Position=projectionMatrix*mv;float s=aF.y>1.5?17.0:(aF.y>0.5?9.5:(aF.x>0.5?8.0:5.5));if(aF.w>0.5)s*=0.8;bool sh=fc>0.06&&(aF.z<=uCut||aF.y>0.5||aF.x>0.5);gl_PointSize=sh?s*uS:0.0;if(!sh)gl_Position=vec4(2.0,2.0,2.0,1.0);}',
        fragmentShader:'varying vec3 vC;varying vec4 vF;void main(){vec2 p=gl_PointCoord*2.0-1.0;float d=length(p);if(d>1.0)discard;vec3 c=vC;float a=1.0;if(vF.y>1.5){if(d<0.62)discard;gl_FragColor=vec4(1.0,1.0,1.0,0.95);return;}if(vF.x>0.5){if(d>0.74)c=vec3(0.93,0.28,0.30);else if(d>0.56)c=vec3(0.02);}else if(d>0.74){c=vF.y>0.5?vec3(0.96):vec3(0.02);}if(vF.w>0.5)a=0.5;gl_FragColor=vec4(c,a);}'});
      var HK=bHiKeys(), pos=[], col=[], fl=[], idx=[];
      BD.L.forEach(function(b){ if(!bvf(b)) return; var hi=HK[b.h]?1:0, v=ll2v(T,b.lon,b.lat,hi?1.036:1.004); pos.push(v.x,v.y,v.z); var c=BCV[b.t]; col.push(c[0],c[1],c[2]); fl.push(b.f?1:0,hi,b.rk,b.st===2?1:0); idx.push(b.i); });
      bObj=new T.Points(bGeo(pos,col,fl),bMat); bObj.renderOrder=7; bObj.frustumCulled=false; bObj.userData={pos:pos,fl:fl,idx:idx}; globe.add(bObj);
      if(B.cur!=null&&BD.L[B.cur]){ var b=BD.L[B.cur], v=ll2v(T,b.lon,b.lat,HK[b.h]?1.036:1.004); bSel=new T.Points(bGeo([v.x,v.y,v.z],[1,1,1],[0,2,0,0]),bMat); bSel.renderOrder=8; bSel.frustumCulled=false; globe.add(bSel); } }
    function bCut(){ var f=resize.fd||3, t=Math.max(0,Math.min(1,(dist-1.7)/Math.max(.1,f-1.7))); return 1-0.55*t; }
    var _bv=new T.Vector3();
    function bPick(x,y,rad){ if(!bObj) return -1; var r=cv.getBoundingClientRect(), U=bObj.userData, P3=U.pos, F=U.fl, best=-1, bd=rad*rad, cut=bCut(), cp=cam.position; globe.updateMatrixWorld();
      var far=dist>2.35&&!sel.length&&!ndC;
      for(var i=0;i<U.idx.length;i++){ if(!(F[i*4+2]<=cut||F[i*4+1]>0.5||F[i*4]>0.5)) continue; if(far&&F[i*4+1]<0.5) continue; if(sel.length&&dist>2.35&&F[i*4+1]<0.5) continue; _bv.set(P3[i*3],P3[i*3+1],P3[i*3+2]).applyMatrix4(globe.matrixWorld);
        var L=_bv.length(), dx=cp.x-_bv.x, dy=cp.y-_bv.y, dz=cp.z-_bv.z, dl=Math.hypot(dx,dy,dz); if((_bv.x*dx+_bv.y*dy+_bv.z*dz)/(L*dl)<0.06) continue;
        _bv.project(cam); var sx=r.left+(_bv.x+1)/2*r.width, sy=r.top+(1-_bv.y)/2*r.height, d2=(sx-x)*(sx-x)+(sy-y)*(sy-y); if(d2<bd){ bd=d2; best=U.idx[i]; } }
      return best; }
    BR={refresh:bBuild};
    bBuild();

    // overlays
    var ov=new T.Group(); globe.add(ov); var anim=[];
    function clearOv(){ while(ov.children.length){ var c=ov.children.pop(); c.geometry&&c.geometry.dispose(); c.material&&c.material.dispose(); } anim=[]; }
    function capGeom(c,r){ var pos=[]; var MAXE=2.5;
      function emit(a,b,d){ var A=ll2v(T,a[0],a[1],r),B=ll2v(T,b[0],b[1],r),D=ll2v(T,d[0],d[1],r); pos.push(A.x,A.y,A.z,B.x,B.y,B.z,D.x,D.y,D.z); }
      function tri(a,b,d,dep){ var e1=Math.hypot(a[0]-b[0],a[1]-b[1]), e2=Math.hypot(b[0]-d[0],b[1]-d[1]), e3=Math.hypot(d[0]-a[0],d[1]-a[1]), m=Math.max(e1,e2,e3);
        if(m<MAXE||dep>14){ emit(a,b,d); return; }
        if(m===e1){ var p=[(a[0]+b[0])/2,(a[1]+b[1])/2]; tri(a,p,d,dep+1); tri(p,b,d,dep+1); }
        else if(m===e2){ p=[(b[0]+d[0])/2,(b[1]+d[1])/2]; tri(a,b,p,dep+1); tri(a,p,d,dep+1); }
        else { p=[(d[0]+a[0])/2,(d[1]+a[1])/2]; tri(a,b,p,dep+1); tri(p,b,d,dep+1); } }
      c.R.forEach(function(a){ if(a.length<6) return; var pts=[]; for(var i=0;i<a.length;i+=2) pts.push(new T.Vector2(a[i],a[i+1]));
        if(T.ShapeUtils.isClockWise(pts)) pts.reverse();
        var tris=T.ShapeUtils.triangulateShape(pts,[]); tris.forEach(function(t){ var A=pts[t[0]],B=pts[t[1]],D=pts[t[2]]; tri([A.x,A.y],[B.x,B.y],[D.x,D.y],0); }); });
      var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(pos,3)); return g; }
    function outline(c,r,col,op){ var p=[]; c.R.forEach(function(a){ var n=a.length; for(var i=0;i<n;i+=2){ var j=(i+2)%n, x0=a[i],y0=a[i+1],x1=a[j],y1=a[j+1]; if(Math.abs(x1-x0)>180) continue; var s=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))/2)); for(var k=0;k<s;k++){ var p0=ll2v(T,x0+(x1-x0)*k/s,y0+(y1-y0)*k/s,r),p1=ll2v(T,x0+(x1-x0)*(k+1)/s,y0+(y1-y0)*(k+1)/s,r); p.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z);} } });
      var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(p,3)); return new T.LineSegments(g,new T.LineBasicMaterial({color:col,transparent:true,opacity:op,depthWrite:false})); }
    function wall(c,r0,r1,col){ var p=[]; c.R.forEach(function(a){ var n=a.length; for(var i=0;i<n;i+=2){ var j=(i+2)%n; if(Math.abs(a[j]-a[i])>180) continue; var A0=ll2v(T,a[i],a[i+1],r0),A1=ll2v(T,a[i],a[i+1],r1),B0=ll2v(T,a[j],a[j+1],r0),B1=ll2v(T,a[j],a[j+1],r1); p.push(A0.x,A0.y,A0.z,B0.x,B0.y,B0.z,B1.x,B1.y,B1.z, A0.x,A0.y,A0.z,B1.x,B1.y,B1.z,A1.x,A1.y,A1.z); } });
      var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(p,3)); return new T.Mesh(g,new T.MeshBasicMaterial({color:col,transparent:true,opacity:.35,side:T.DoubleSide,depthWrite:false})); }
    var labs=[app.querySelector('#mplab0'),app.querySelector('#mplab1')], labV=[null,null];
    function build(){ clearOv(); var sds=sel.map(sideOf).filter(Boolean), cen=[]; labV=[null,null]; labs.forEach(function(l,i){ var sd=sds[i]; l.hidden=!sd; if(sd) l.textContent=(window.MAT_T||String)(sd.n); });
      sds.forEach(function(sd,si){ var col=new T.Color(si?COL.b:COL.a), cs=[]; sd.m.forEach(function(k){ isosOf(k).forEach(function(iso){ var c=WORLD.byIso[iso]; if(c&&cs.indexOf(c)<0) cs.push(c); }); });
        var lift=sd.m.length===1;
        cs.forEach(function(c){
          if(lift&&!c.t){ var LR=1.03; var cap=new T.Mesh(capGeom(c,LR),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.62,side:T.DoubleSide,depthWrite:false})); cap.renderOrder=3; var w=wall(c,1.0,LR,col); var ol=outline(c,LR+0.0008,0xffffff,.9); ol.renderOrder=4;
            [cap,w,ol].forEach(function(m){ m.scale.setScalar(.97); ov.add(m); anim.push({m:m,t0:performance.now(),k:'lift'}); }); }
          else { var ol2=outline(c,1.004,col,.95); ov.add(ol2); }
          if(c.m) c.m.forEach(function(p){ [[0.0062,0xffffff,.55],[0.0042,col,1]].forEach(function(s){ var dm=new T.Mesh(new T.SphereGeometry(s[0],10,8),new T.MeshBasicMaterial({color:s[1],transparent:true,opacity:s[2],depthWrite:false})); dm.position.copy(ll2v(T,p[0],p[1],1.006)); dm.renderOrder=6; ov.add(dm); }); });
        });
        var ce=center(sd); if(ce){ cen.push(ce); labV[si]=ll2v(T,ce[0],ce[1],1.04); } });
      if(cen.length===2){ var a=ll2v(T,cen[0][0],cen[0][1],1).normalize(), b=ll2v(T,cen[1][0],cen[1][1],1).normalize(), ang=a.angleTo(b), pts=[];
        for(var i=0;i<=80;i++){ var t=i/80, v=new T.Vector3(); if(ang<1e-4) v.copy(a); else { var s0=Math.sin((1-t)*ang)/Math.sin(ang), s1=Math.sin(t*ang)/Math.sin(ang); v.copy(a).multiplyScalar(s0).add(b.clone().multiplyScalar(s1)).normalize(); } v.multiplyScalar(1.035+(0.06+0.42*ang/Math.PI)*Math.sin(Math.PI*t)); pts.push(v); }
        var curve=new T.CatmullRomCurve3(pts), tg=new T.TubeGeometry(curve,160,0.0045,6,false);
        var arc=new T.Mesh(tg,new T.MeshBasicMaterial({color:0xf3ead2,transparent:true,opacity:.95,depthWrite:false})); arc.renderOrder=5; tg.setDrawRange(0,0); ov.add(arc); anim.push({m:arc,t0:performance.now(),k:'arc',n:tg.index.count});
        var dot=new T.Mesh(new T.SphereGeometry(0.011,12,8),new T.MeshBasicMaterial({color:0xffffff})); ov.add(dot); anim.push({m:dot,t0:performance.now(),k:'dot',c:curve});
        [a,b].forEach(function(v,i){ var ring=new T.Mesh(new T.RingGeometry(0.012,0.02,32),new T.MeshBasicMaterial({color:i?COL.b:COL.a,transparent:true,side:T.DoubleSide,depthWrite:false})); ring.position.copy(v.clone().multiplyScalar(1.036)); ring.lookAt(v.clone().multiplyScalar(2)); ov.add(ring); anim.push({m:ring,t0:performance.now()+i*400,k:'ping'}); }); }
      return cen; }
    // camera / controls
    var rx=0.35, ry=0, dist=3, tdist=3, vx=0, vy=0, tw=null, lastAct=performance.now(), auto=true;
    function fitDist(){ var a=cam.aspect, vf=cam.fov*Math.PI/180, hf=2*Math.atan(Math.tan(vf/2)*a), f=Math.min(vf,hf); return 1.08/Math.sin(f/2); }
    function target(lon,lat){ var ph=(lon+180)*Math.PI/180; return {ry:-Math.atan2(-Math.cos(ph),Math.sin(ph)), rx:lat*Math.PI/180}; }
    function focusLL(lon,lat,d){ var t=target(lon,lat); var dy=t.ry-ry; dy=Math.atan2(Math.sin(dy),Math.cos(dy)); tw={rx0:rx,ry0:ry,rx1:Math.max(-1.2,Math.min(1.2,t.rx)),ry1:ry+dy,t0:performance.now(),d0:dist,d1:d||dist}; vx=vy=0; }
    var es=target(-4,40); ry=es.ry-1.1; rx=es.rx*.7;
    function resize(){ var w=gEl.clientWidth, h=gEl.clientHeight; renderer.setSize(w,h,false); cam.aspect=w/h; cam.updateProjectionMatrix(); var f=fitDist(); if(!resize.done){ dist=tdist=f*1.02; resize.done=1; } resize.fd=f; }
    var ro=new ResizeObserver(resize); ro.observe(gEl); resize();
    var ptrs={}, down=null, pinch0=0, pd0=0;
    function onDown(e){ cv.setPointerCapture&&cv.setPointerCapture(e.pointerId); ptrs[e.pointerId]={x:e.clientX,y:e.clientY}; var ids=Object.keys(ptrs); tw=null; auto=false; lastAct=performance.now();
      if(ids.length===1){ down={x:e.clientX,y:e.clientY,t:performance.now(),moved:0}; vx=vy=0; } else if(ids.length===2){ var a=ptrs[ids[0]],b=ptrs[ids[1]]; pinch0=Math.hypot(a.x-b.x,a.y-b.y); pd0=tdist; if(down) down.moved=99; } }
    function onMove(e){ if(e.pointerType==='mouse'&&!ptrs[e.pointerId]){ hover(e); return; } var p=ptrs[e.pointerId]; if(!p) return; var dx=e.clientX-p.x, dy=e.clientY-p.y; p.x=e.clientX; p.y=e.clientY; lastAct=performance.now(); var ids=Object.keys(ptrs);
      if(ids.length===1){ var k=0.0042*(dist-1)/1.9; ry+=dx*k; rx=Math.max(-1.25,Math.min(1.25,rx+dy*k)); vx=dx*k; vy=dy*k; if(down) down.moved+=Math.abs(dx)+Math.abs(dy); }
      else if(ids.length===2){ var a=ptrs[ids[0]],b=ptrs[ids[1]], d=Math.hypot(a.x-b.x,a.y-b.y); if(pinch0>0) tdist=Math.max(1.28,Math.min(resize.fd*1.6,pd0*pinch0/d)); }
      tip.hidden=true; }
    function onUp(e){ var wasOne=Object.keys(ptrs).length===1; delete ptrs[e.pointerId]; if(wasOne&&down&&down.moved<8&&performance.now()-down.t<600) tap(e.clientX,e.clientY); if(!Object.keys(ptrs).length) down=null; }
    var ray=new T.Raycaster(), ndc=new T.Vector2();
    function llAt(x,y){ var r=cv.getBoundingClientRect(); ndc.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1); ray.setFromCamera(ndc,cam); var hit=ray.intersectObject(sph,false)[0]; if(!hit) return null; var lp=globe.worldToLocal(hit.point.clone()); return v2ll(lp); }
    function tolDeg(){ var r=cv.getBoundingClientRect(), vf=cam.fov*Math.PI/180, rpx=(r.height/2)/Math.tan(vf/2)/Math.sqrt(Math.max(.01,dist*dist-1)); return Math.min(6,16*57.3/Math.max(rpx,1)); }
    function tap(x,y){ if(B.on){ var bi=bPick(x,y,isPhone()?12:9); if(bi>=0){ bShow(bi); return; } if(B.cur!=null) bHide(); } var ll=llAt(x,y); if(!ll) return; var c=pickLL(ll[0],ll[1],tolDeg()); if(c) tapCountry(c,false); }
    var hvT=0; function hover(e){ var now=performance.now(); if(now-hvT<60) return; hvT=now; if(B.on){ var bi=bPick(e.clientX,e.clientY,9); if(bi>=0){ var bb=BD.L[bi], rr=gEl.getBoundingClientRect(); tip.textContent=bname(bb)+' · '+(EN?BTN[bb.t][1]:BTN[bb.t][0])+(bb.f?' · '+LG('extranjera','foreign'):''); tip.style.left=(e.clientX-rr.left+14)+'px'; tip.style.top=(e.clientY-rr.top+10)+'px'; tip.hidden=false; cv.style.cursor='pointer'; return; } } var ll=llAt(e.clientX,e.clientY), c=ll&&pickLL(ll[0],ll[1],tolDeg()*.6); if(!c){tip.hidden=true; cv.style.cursor='grab'; return;} var r=gEl.getBoundingClientRect(); tip.textContent=c.n+(c.k&&TOT[c.k]!=null?' · '+nf(TOT[c.k])+' unidades':(c.k?' · sin tabla':' · sin datos')); tip.style.left=(e.clientX-r.left+14)+'px'; tip.style.top=(e.clientY-r.top+10)+'px'; tip.hidden=false; cv.style.cursor='pointer'; }
    function onWheel(e){ e.preventDefault(); tdist=Math.max(1.28,Math.min(resize.fd*1.6,tdist*Math.exp(e.deltaY*0.0012))); lastAct=performance.now(); }
    cv.addEventListener('pointerdown',onDown); cv.addEventListener('pointermove',onMove); cv.addEventListener('pointerup',onUp); cv.addEventListener('pointercancel',onUp); cv.addEventListener('pointerleave',function(){tip.hidden=true;}); cv.addEventListener('wheel',onWheel,{passive:false});
    var offY=0;
    function viewOff(){ if(!isPhone()||!pEl.classList.contains('on')) return 0; var r=cv.getBoundingClientRect(), hd=document.querySelector('.top'), top=Math.max(r.top,hd?hd.getBoundingClientRect().bottom:0), pr=pEl.getBoundingClientRect(), bot=Math.min(r.bottom,pr.top); if(bot-top<80) return 0; var c=(top+bot)/2-r.top; return Math.max(0,r.height/2-c); }
    var raf=0, last=performance.now(), slow=0, frames=0, fpsT=performance.now();
    function loop(now){ raf=requestAnimationFrame(loop); var dt=Math.min(.05,(now-last)/1000); last=now; if(document.hidden) return;
      if(tw){ var t=Math.min(1,(now-tw.t0)/900), e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; rx=tw.rx0+(tw.rx1-tw.rx0)*e; ry=tw.ry0+(tw.ry1-tw.ry0)*e; tdist=dist=tw.d0+(tw.d1-tw.d0)*e; if(t>=1) tw=null; }
      else if(!Object.keys(ptrs).length){ ry+=vx; rx=Math.max(-1.25,Math.min(1.25,rx+vy)); vx*=.92; vy*=.92; if(Math.abs(vx)<1e-5) vx=0; if(Math.abs(vy)<1e-5) vy=0;
        if(!sel.length&&now-lastAct>3500){ ry+=dt*0.06; } }
      dist+=(tdist-dist)*Math.min(1,dt*10);
      globe.rotation.set(rx,ry,0,'XYZ'); cam.position.set(0,0,dist); cam.lookAt(0,0,0); stars.rotation.y=ry*.15; stars.rotation.x=rx*.15;
      for(var i=0;i<anim.length;i++){ var A=anim[i], et=(now-A.t0)/1000;
        if(A.k==='lift'){ var s=Math.min(1,et/0.45), ee=1-Math.pow(1-s,3); A.m.scale.setScalar(.97+.03*ee); }
        else if(A.k==='arc'){ var p=Math.min(1,Math.max(0,et-0.25)/0.9); A.m.geometry.setDrawRange(0,Math.floor(A.n*p/3)*3); }
        else if(A.k==='dot'){ var q=((et-1.1)%2.2+2.2)%2.2/2.2; A.m.visible=et>1.1; A.m.position.copy(A.c.getPointAt(q)); }
        else if(A.k==='ping'){ var z=((et%1.6)+1.6)%1.6/1.6; A.m.scale.setScalar(1+z*2.2); A.m.material.opacity=et<0?0:1-z; } }
      var vo=viewOff(); offY+=(vo-offY)*Math.min(1,dt*8); if(Math.abs(offY)>0.5){ var cw=renderer.domElement.clientWidth, chh=renderer.domElement.clientHeight; cam.setViewOffset(cw,chh,0,offY,cw,chh); } else if(cam.view&&cam.view.enabled){ cam.clearViewOffset(); }
      for(var li=0;li<2;li++){ var lv=labV[li], le=labs[li]; if(!lv){ le.hidden=true; continue; } globe.updateMatrixWorld(); var wv=globe.localToWorld(lv.clone()), vis=wv.clone().normalize().dot(cam.position.clone().sub(wv).normalize())>0.05; if(!vis){ le.hidden=true; continue; } var pr=wv.clone().project(cam); le.hidden=false; le.style.transform='translate('+((pr.x+1)/2*cv.clientWidth).toFixed(1)+'px,'+((1-pr.y)/2*cv.clientHeight).toFixed(1)+'px) translate(-50%,-140%)'; }
      if(bObj){ bMat.uniforms.uS.value=renderer.getPixelRatio()*Math.max(.85,Math.min(2.0,2.9/dist)); bMat.uniforms.uCut.value=bCut(); }
      renderer.render(scene,cam);
      frames++; if(now-fpsT>2000){ frames=0; fpsT=now; }
    }
    raf=requestAnimationFrame(loop);
    ld.hidden=true;
    window.MAT_MAPA_DBG={xy:function(lo,la){ globe.updateMatrixWorld(); var v=globe.localToWorld(ll2v(T,lo,la,1)); var w=v.clone().project(cam); var r=cv.getBoundingClientRect(); var front=v.clone().sub(cam.position).dot(v)<0; return {x:r.left+(w.x+1)/2*r.width,y:r.top+(1-w.y)/2*r.height,front:front}; }, busy:function(){return !!tw;}, focus:function(lo,la,d){ focusLL(lo,la,d); }};
    R={is2d:false, focusLL:function(lo,la,d){focusLL(lo,la,d);},
      refresh:function(focus){ tex.needsUpdate=true; var cen=build(); if(focus!==false){ if(cen.length===2){ var a=ll2v(T,cen[0][0],cen[0][1],1).normalize(), b=ll2v(T,cen[1][0],cen[1][1],1).normalize(), m=a.clone().add(b); var ang=a.angleTo(b); if(m.length()<1e-3) m=a; var ll=v2ll(m.normalize()); focusLL(ll[0],ll[1], Math.max(resize.fd*(ang>1.2?1.15:ang>0.6?1.0:0.85),1.6)); } else if(cen.length===1){ var sd=sideOf(sel[0]); focusLL(cen[0][0],cen[0][1], sd&&sd.m.length>1?resize.fd:Math.max(1.75,resize.fd*.8)); } } },
      dispose:function(){ cancelAnimationFrame(raf); ro.disconnect(); clearOv(); bClear(); BR=null; try{ renderer.dispose(); renderer.forceContextLoss(); }catch(e){} }};
    R.refresh(sel.length?true:false); if(sel.length) setTimeout(phoneScroll,400);
  }
};
})();
