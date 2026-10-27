(function(){
"use strict";
// ======================= M.A.T · CAPA SATÉLITES (datos públicos) =======================
// Posiciones: SGP4 (satellite.js, MIT) con elementos orbitales públicos (TLE) de CelesTrak.
var SJP=null, DP=null; function MV(){ var s=document.querySelector('script[data-v]'); return s?s.getAttribute('data-v'):''; }
function loadLib(){ if(window.satellite) return Promise.resolve(window.satellite); if(SJP) return SJP;
  SJP=new Promise(function(ok,ko){ var s=document.createElement('script'); s.src='satellite.min.js?v='+MV(); s.onload=function(){ window.satellite?ok(window.satellite):ko(new Error('sat')); }; s.onerror=function(){ SJP=null; ko(new Error('sat')); }; document.head.appendChild(s); }); return SJP; }
function loadData(){ if(DP) return DP; DP=window.MAT_GET('sat_tle.json.gz').catch(function(e){ DP=null; throw e; }); return DP; }
var TY={nav:['#e9c46a','Navegación','Navigation'],com:['#4cc9f0','Comunicaciones militares','Military communications'],ew:['#ff6b6b','Alerta temprana de misiles','Missile early warning'],
  opt:['#90be6d','Reconocimiento óptico','Optical reconnaissance'],sar:['#c39bff','Radar SAR','SAR radar'],sig:['#f4a261','Inteligencia de señales','Signals intelligence'],
  met:['#a0c4ff','Meteorología militar','Military weather'],esp:['#f78fb3','Vigilancia del espacio','Space surveillance']};
var TYO=['nav','com','ew','opt','sar','sig','met','esp'];
var STN=[['En servicio','Operational'],['Parcialmente operativo','Partially operational'],['En reserva','Standby'],['De repuesto en órbita','On-orbit spare'],['Fuera de servicio','Non-operational'],['Misión extendida','Extended mission']];
var RE=6378.137, MU=398600.4418;
function rDisp(h){ h=Math.max(0,h); return 1+0.38*Math.log(1+h/1500)/Math.log(1+35786/1500); }
window.MAT_SATL=function(cx){
  var EN=cx.EN, LG=cx.LG, esc=cx.esc, P=cx.P;
  var S={on:false,ready:false,ft:'',fc:'',es:false,cur:-1,info:false,err:false,list:[]}, D=null, SJ=null, L=[], VIS=[], timer=0, trT=0, G3=null, req2d=null, dead=false;
  var rowEl=cx.rowEl, cardEl=cx.cardEl, btnEl=cx.btnEl;
  try{ S.on=cx.initOn; }catch(e){}
  function cnm(k){ return cx.cname(k); }
  function nf(n){ return Number(n).toLocaleString(EN?'en-US':'es-ES'); }
  function dec(x,d){ var s=x.toFixed(d); return EN?s:s.replace('.',','); }
  function fam(s){ return D.F[s.f]; }
  function tyOf(s){ return fam(s).t; }
  function ccOf(s){ return fam(s).c; }
  function isES(s){ return ccOf(s)==='espana'; }
  function passes(s){ var f=fam(s); if(S.es&&f.c!=='espana') return false; if(S.ft&&f.t!==S.ft) return false; if(S.fc&&f.c!==S.fc&&f.c2!==S.fc) return false; return true; }
  function refilter(){ VIS=L.filter(passes); if(S.cur>=0&&!passes(L[S.cur])) hide(); }
  // ---------- toggle / row ----------
  function btn(){ btnEl.setAttribute('aria-pressed',S.on); btnEl.querySelector('span').innerHTML=LG('🛰️ Satélites <small>(datos públicos)</small>','🛰️ Satellites <small>(public data)</small>'); }
  var NOTE_ES='Solo aparecen satélites con datos públicos. Los satélites militares clasificados y otros de carácter reservado no se muestran.', NOTE_EN='Only satellites with public data are shown. Classified military satellites and other restricted satellites are not shown.';
  function fdate(iso){ var d=new Date(iso); if(isNaN(d)) return iso; return d.toLocaleDateString(EN?'en-GB':'es-ES',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'})+' '+('0'+d.getUTCHours()).slice(-2)+':'+('0'+d.getUTCMinutes()).slice(-2)+' UTC'; }
  function row(){ if(!S.on){ rowEl.hidden=true; return; } rowEl.hidden=false;
    if(S.err){ rowEl.innerHTML='<span class="mpsrc">'+LG('No se pudieron cargar los satélites. Comprueba la conexión.','Could not load the satellites. Check your connection.')+'</span>'; return; }
    if(!S.ready){ rowEl.innerHTML='<span class="mpsrc">'+LG('Cargando satélites…','Loading satellites…')+'</span>'; return; }
    var base=L.filter(function(s){ var f=fam(s); return (!S.es||f.c==='espana')&&(!S.fc||f.c===S.fc||f.c2===S.fc); }), cnt={};
    base.forEach(function(s){ var t=tyOf(s); cnt[t]=(cnt[t]||0)+1; });
    var cc={}; L.forEach(function(s){ var f=fam(s); cc[f.c]=(cc[f.c]||0)+1; if(f.c2) cc[f.c2]=(cc[f.c2]||0)+1; });
    var opts=Object.keys(cc).sort(function(a,b){ return cc[b]-cc[a]||cnm(a).localeCompare(cnm(b)); });
    var h='<div class="mpsnote">'+esc(LG(NOTE_ES,NOTE_EN))+'</div>'
      +'<div class="mpscnt"><b>'+nf(VIS.length)+'</b> '+(VIS.length===1?LG('satélite','satellite'):LG('satélites','satellites'))+(VIS.length!==L.length?' <span class="mpk">'+LG('de','of')+' '+nf(L.length)+'</span>':'')+'</div>'
      +'<button class="chip mpses" data-ses="1" aria-pressed="'+S.es+'"><img class="mini" src="flags/es.png" alt=""> '+LG('España','Spain')+'</button>'
      +'<select class="mpssel" aria-label="'+LG('País','Country')+'"><option value="">'+LG('Todos los países','All countries')+'</option>'+opts.map(function(k){ return '<option value="'+esc(k)+'"'+(S.fc===k?' selected':'')+'>'+esc(k==='multi'?LG('Unión Europea','European Union'):cnm(k))+' ('+cc[k]+')</option>'; }).join('')+'</select>'
      +'<div class="mpsty">'+TYO.filter(function(t){ return cnt[t]||S.ft===t; }).map(function(t){ return '<button class="chip mpst" data-st="'+t+'" aria-pressed="'+(S.ft===t)+'"><i style="background:'+TY[t][0]+'"></i>'+esc(EN?TY[t][2]:TY[t][1])+' <em>'+nf(cnt[t]||0)+'</em></button>'; }).join('')+'</div>'
      +'<button class="mpsinfo" data-sinfo="1" aria-expanded="'+S.info+'">ℹ️ '+LG('Cómo funciona','How it works')+'</button>'
      +(S.info?'<div class="mpsinf">'+info()+'</div>':'');
    rowEl.innerHTML=h; }
  function info(){ return EN?'<p>Positions are computed in your browser with the <b>SGP4</b> model from public orbital elements (<b>TLE</b>) in the <a href="https://celestrak.org/" target="_blank" rel="noopener">CelesTrak</a> catalogue, which republishes the US Space Force\'s public data. They are <b>approximate</b>: from a few km to tens of km depending on how old the data are. Orbital data from '+esc(fdate(D.fecha))+'; when you open a satellite, its orbit is refreshed from CelesTrak if possible.</p>'
      +'<p><b>Orbits</b>: <b>LEO</b>, low (under 2,000 km, one lap every ~90–120 min); <b>MEO</b>, medium (~20,000 km, navigation); <b>GEO</b>, geostationary (35,786 km above the equator: it seems fixed over one point); <b>HEO</b>, highly elliptical. Heights on the globe are <b>not to scale</b>.</p>'
      +'<p>Many military satellites are not in public catalogues (for example France\'s CSO and CERES, Israel\'s Ofek, Japan\'s IGS or Germany\'s SARah have no public orbit), so they do not appear. Types, operators and descriptions come from operators\' official information and Wikipedia; launch date and status from CelesTrak\'s SATCAT.</p>'
      :'<p>Las posiciones se calculan en tu navegador con el modelo <b>SGP4</b> a partir de elementos orbitales públicos (<b>TLE</b>) del catálogo de <a href="https://celestrak.org/" target="_blank" rel="noopener">CelesTrak</a>, que publica los datos públicos de la Fuerza Espacial de EE. UU. Son <b>aproximadas</b>: de unos pocos km a decenas de km según lo antiguos que sean los datos. Datos orbitales del '+esc(fdate(D.fecha))+'; al abrir un satélite se intenta actualizar su órbita desde CelesTrak.</p>'
      +'<p><b>Órbitas</b>: <b>LEO</b>, baja (menos de 2.000 km, una vuelta cada ~90-120 min); <b>MEO</b>, media (~20.000 km, navegación); <b>GEO</b>, geoestacionaria (35.786 km sobre el ecuador: parece quieta sobre un punto); <b>HEO</b>, muy elíptica. La altura en el globo <b>no está a escala</b>.</p>'
      +'<p>Muchos satélites militares no están en los catálogos públicos (por ejemplo, los CSO y CERES franceses, los Ofek israelíes, los IGS japoneses o los SARah alemanes no tienen órbita pública), así que no aparecen. Tipos, operadores y descripciones salen de la información oficial de los operadores y de Wikipedia; fecha de lanzamiento y estado, del SATCAT de CelesTrak.</p>'; }
  rowEl.addEventListener('click',function(e){ var t=e.target.closest('button'); if(!t) return;
    if(t.dataset.st){ S.ft=S.ft===t.dataset.st?'':t.dataset.st; changed(); return; }
    if(t.dataset.ses){ S.es=!S.es; if(S.es) S.fc=''; changed(); if(S.es&&cx.focusLL) cx.focusLL(-20,36,null); return; }
    if(t.dataset.sinfo){ S.info=!S.info; row(); return; } });
  rowEl.addEventListener('change',function(e){ if(e.target.classList.contains('mpssel')){ S.fc=e.target.value; if(S.fc) S.es=false; changed(); } });
  function changed(){ refilter(); row(); tick(true); if(G3) G3.build(); trails(); cx.panel(); }
  // ---------- data ----------
  function prep(d){ D=d; var c=d.cols.split(','); L=d.s.map(function(r,i){ var o={i:i}; c.forEach(function(k,j){ o[k]=r[j]; }); o.rec=SJ.twoline2satrec(o.l1,o.l2); o.src=0; o.ep=epoch(o.l1); return o; });
    var cache=null; L.forEach(function(s){ try{ var x=JSON.parse(localStorage.getItem('mat_sat_'+s.id)||'null'); if(x&&x.l1&&x.e>s.ep&&Date.now()-x.t<3*86400e3){ s.l1=x.l1; s.l2=x.l2; s.rec=SJ.twoline2satrec(x.l1,x.l2); s.ep=x.e; s.src=1; s.ft=x.t; } }catch(e){} });
    S.ready=true; refilter(); }
  function epoch(l1){ var y=+l1.substr(18,2), dd=+l1.substr(20,12); y+=y<57?2000:1900; return Date.UTC(y,0,1)+(dd-1)*86400e3; }
  function start(){ if(S.ready){ go(); return; } row(); Promise.all([loadLib(),loadData()]).then(function(z){ if(dead) return; SJ=z[0]; prep(z[1]); go(); }).catch(function(){ if(dead) return; S.err=true; row(); }); }
  function go(){ if(!S.on) return; row(); tick(true); trails(); if(G3) G3.build(); cx.panel(); loop(); }
  function loop(){ clearInterval(timer); timer=setInterval(function(){ if(document.hidden||!S.on) return; tick(false); if(++trT%15===0) trails(); },1000); }
  // ---------- SGP4 ----------
  function prop(s,date){ var pv=SJ.propagate(s.rec,date); if(!pv||!pv.position||isNaN(pv.position.x)) return null; var g=SJ.gstime(date), gd=SJ.eciToGeodetic(pv.position,g), v=pv.velocity;
    return {lat:gd.latitude*180/Math.PI, lon:((gd.longitude*180/Math.PI)+540)%360-180, h:gd.height, v:v?Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z):0}; }
  function tick(force){ if(!S.ready||!S.on) return; var now=new Date(); VIS.forEach(function(s){ s.p=prop(s,now); }); if(G3) G3.pos(); if(req2d) req2d(); if(S.cur>=0) live(); }
  function period(s){ return 2*Math.PI/s.rec.no; } // minutes
  function trails(){ if(!S.ready||!S.on) return; var now=Date.now();
    VIS.forEach(function(s){ var P0=period(s), span=Math.min(P0*0.14,40), n=8, a=[]; for(var k=n;k>=1;k--){ var q=prop(s,new Date(now-k*span/n*60e3)); if(q) a.push(q); } s.tr=a; });
    if(S.cur>=0) orbit(L[S.cur]); if(G3) G3.trails(); if(req2d) req2d(); }
  function orbit(s){ var P0=period(s), now=Date.now(), n=180, a=[]; for(var k=0;k<=n;k++){ var q=prop(s,new Date(now+(k/n-0.5)*P0*60e3)); if(q) a.push(q); } s.orb=a; }
  function orbitInfo(s){ var r=s.rec, nmin=r.no, nr=nmin/60, a=Math.pow(MU/(nr*nr),1/3), e=r.ecco, per=a*(1-e)-RE, apo=a*(1+e)-RE, P0=2*Math.PI/nmin, inc=r.inclo*180/Math.PI, cls;
    if(e>0.25) cls='HEO'; else if(P0>1300&&P0<1600) cls=inc>10?'GSO':'GEO'; else if(P0<128) cls='LEO'; else cls='MEO';
    return {per:per,apo:apo,P:P0,inc:inc,e:e,cls:cls}; }
  var CLS={LEO:['LEO · órbita baja','LEO · low orbit'],MEO:['MEO · órbita media','MEO · medium orbit'],GEO:['GEO · geoestacionaria','GEO · geostationary'],GSO:['GEO · geosíncrona inclinada','GSO · inclined geosynchronous'],HEO:['HEO · muy elíptica','HEO · highly elliptical']};
  function km(x){ return nf(Math.round(x))+' km'; }
  // ---------- card ----------
  function nm(s){ return s.n; }
  function wl(f){ var w=f.w; if(EN&&w[1]) return ['https://en.wikipedia.org/wiki/'+encodeURIComponent(w[1]),'Wikipedia']; if(!EN&&w[0]) return ['https://es.wikipedia.org/wiki/'+encodeURIComponent(w[0]),'Wikipedia']; if(w[1]) return ['https://en.wikipedia.org/wiki/'+encodeURIComponent(w[1]),EN?'Wikipedia':'Wikipedia (inglés)']; return null; }
  function show(i,focus){ var s=L[i]; if(!s) return; S.cur=i; var f=fam(s), oi=orbitInfo(s), w=wl(f), stx=D.nota[s.id];
    var flag=function(k){ return k==='multi'?'<img class="mini" src="flags/eu.png" alt="">':cx.flagImg(k); };
    var cn=function(k){ return k==='multi'?LG('Unión Europea','European Union'):cnm(k); };
    var h='<button class="mpx" data-sc="x" aria-label="'+LG('Cerrar','Close')+'">×</button>'
      +'<div class="bct"><i class="sdm" style="background:'+TY[f.t][0]+'"></i>'+esc(EN?TY[f.t][2]:TY[f.t][1])+'</div>'
      +'<b class="bcn">'+esc(nm(s))+'</b>'
      +'<div class="bcr">'+flag(f.c)+esc(cn(f.c))+(f.c2?' · '+flag(f.c2)+esc(cn(f.c2)):'')+' · <span class="bcop">'+esc(f.o[EN?1:0])+'</span></div>'
      +'<div class="bcr sst'+(s.st===4?' off':'')+'">'+LG('Estado','Status')+': <b>'+esc(stx?stx[EN?1:0]:STN[s.st][EN?1:0])+'</b></div>'
      +(f.p?'<figure class="scph"><img src="'+esc(f.p.f)+'" width="'+f.p.w+'" height="'+f.p.h+'" alt="'+esc(f.p.c[EN?1:0])+'" loading="lazy"><figcaption>'+esc(f.p.c[EN?1:0])+' · <a href="'+esc(f.p.u)+'" target="_blank" rel="noopener">'+esc(f.p.by)+', '+esc(f.p.l)+'</a></figcaption></figure>':'')
      +'<p class="scd"><b>'+esc(f.n[EN?1:0])+'.</b> '+esc(f.d[EN?1:0])+'</p>'
      +'<dl class="scg"><dt>'+LG('Lanzamiento','Launch')+'</dt><dd>'+esc(fd(s.ld))+'</dd>'
      +'<dt>'+LG('Órbita','Orbit')+'</dt><dd>'+esc(CLS[oi.cls][EN?1:0])+'</dd>'
      +'<dt>'+LG('Altura','Altitude')+'</dt><dd>'+(Math.abs(oi.apo-oi.per)<60?'≈ '+km((oi.apo+oi.per)/2):km(oi.per)+' – '+km(oi.apo))+'</dd>'
      +'<dt>'+LG('Inclinación','Inclination')+'</dt><dd>'+dec(oi.inc,1)+'°</dd>'
      +'<dt>'+LG('Periodo','Period')+'</dt><dd>'+(oi.P<180?nf(Math.round(oi.P))+' min':dec(oi.P/60,1)+' h')+'</dd></dl>'
      +'<div class="sclive" id="mpslive"></div>'
      +'<div class="bcl">'+(f.a?'<a href="#/a/'+esc(f.a)+'">'+LG('Ficha M.A.T','M.A.T page')+' ›</a>':'')+(w?'<a href="'+esc(w[0])+'" target="_blank" rel="noopener">'+esc(w[1])+' ›</a>':'')+'<a class="bwd" href="https://celestrak.org/satcat/records.php?CATNR='+s.id+'" target="_blank" rel="noopener">CelesTrak</a></div>'
      +'<p class="scsrc" id="mpssrc"></p>'
      +'<p class="scnote">'+esc(LG(NOTE_ES,NOTE_EN))+'</p>';
    cardEl.innerHTML=h; cardEl.hidden=false; cardEl.scrollTop=0; orbit(s); if(!s.p) s.p=prop(s,new Date()); live(); srcLine(s); if(G3) G3.sel(); if(req2d) req2d();
    if(focus&&s.p&&cx.focusLL) cx.focusLL(s.p.lon,s.p.lat,null);
    refresh(s); }
  function fd(iso){ var d=new Date(iso+'T00:00:00Z'); return isNaN(d)?iso:d.toLocaleDateString(EN?'en-GB':'es-ES',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}); }
  function live(){ var el=cardEl.querySelector('#mpslive'), s=L[S.cur]; if(!el||!s) return; var p=s.p; if(!p){ el.textContent=''; return; }
    var ov=cx.over(p.lon,p.lat);
    el.innerHTML='<b>'+LG('Ahora','Now')+'</b> · '+LG('altura','altitude')+' '+km(p.h)+' · '+nf(Math.round(p.v*3600))+' km/h · '+LG('sobre','over')+' '+esc(ov)
      +' <span class="mpk">('+dec(Math.abs(p.lat),1)+'°'+(p.lat>=0?'N':'S')+' '+dec(Math.abs(p.lon),1)+'°'+(p.lon>=0?'E':(EN?'W':'O'))+')</span>'; }
  function srcLine(s){ var el=cardEl.querySelector('#mpssrc'); if(!el) return; var age=(Date.now()-s.ep)/86400e3;
    el.textContent=LG('Datos orbitales del ','Orbital data from ')+fdate(new Date(s.ep).toISOString())+' ('+(s.src?LG('actualizados desde CelesTrak','refreshed from CelesTrak'):LG('copia guardada en M.A.T','copy stored in M.A.T'))+')'+(age>7?LG(' · posición menos precisa por la antigüedad de los datos',' · position less accurate because the data are old'):'')+' · SGP4 · NORAD '+s.id+' · COSPAR '+s.cos; }
  // CelesTrak runtime refresh (by NORAD id), 2 h cache as CelesTrak asks; on failure the stored copy is used
  function refresh(s){ if(s.src&&Date.now()-s.ft<2*3600e3) return; var ac=window.AbortController?new AbortController():null, to=setTimeout(function(){ if(ac) ac.abort(); },5000);
    fetch('https://celestrak.org/NORAD/elements/gp.php?CATNR='+s.id+'&FORMAT=tle',ac?{signal:ac.signal}:{}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); }).then(function(t){ clearTimeout(to);
      var ln=t.split(/\r?\n/).filter(function(x){ return /^[12] /.test(x); }); if(ln.length<2||+ln[0].substr(2,5)!==s.id) return; var e=epoch(ln[0]);
      try{ localStorage.setItem('mat_sat_'+s.id,JSON.stringify({l1:ln[0],l2:ln[1],e:e,t:Date.now()})); }catch(_){}
      if(e<s.ep) return; var rec=SJ.twoline2satrec(ln[0],ln[1]); if(rec.error) return; s.l1=ln[0]; s.l2=ln[1]; s.rec=rec; s.ep=e; s.src=1; s.ft=Date.now();
      if(S.cur===s.i){ s.p=prop(s,new Date()); orbit(s); live(); srcLine(s); if(G3){ G3.pos(); G3.sel(); } if(req2d) req2d(); } })
    .catch(function(){ clearTimeout(to); }); }
  function hide(){ S.cur=-1; cardEl.hidden=true; if(G3) G3.sel(); if(req2d) req2d(); }
  cardEl.addEventListener('click',function(e){ var t=e.target.closest('button'); if(t&&t.dataset.sc) hide(); });
  // ---------- panel section (country selected) ----------
  function sec(keys){ if(!S.on||!S.ready) return ''; var A=L.filter(function(s){ var f=fam(s); return keys.indexOf(f.c)>=0||keys.indexOf(f.c2)>=0; });
    var h='<div class="mpbsec mpssec" data-noi18n><h3 class="mph3">🛰️ '+LG('Satélites','Satellites')+' ('+nf(A.length)+')</h3>';
    if(!A.length) return h+'<p class="mpempty">— '+LG('No hay satélites militares con datos públicos de este país en la capa.','No military satellites with public data from this country in the layer.')+'</p></div>';
    A.sort(function(a,b){ return TYO.indexOf(tyOf(a))-TYO.indexOf(tyOf(b))||a.n.localeCompare(b.n); });
    return h+'<ul class="mpbl">'+A.map(function(s){ return '<li><i class="bd sdm" style="background:'+TY[tyOf(s)][0]+'"></i><div class="bli"><button class="bnm" data-sq="'+s.i+'">'+esc(s.n)+'</button><span class="bmeta">'+esc(EN?TY[tyOf(s)][2]:TY[tyOf(s)][1])+(s.st===4?' · '+esc(STN[4][EN?1:0]):'')+'</span></div></li>'; }).join('')+'</ul><p class="mpsrc">'+esc(LG(NOTE_ES,NOTE_EN))+'</p></div>'; }
  if(cx.pEl) cx.pEl.addEventListener('click',function(e){ var t=e.target.closest('[data-sq]'); if(!t) return; var s=L[+t.dataset.sq]; if(!s) return; if(!passes(s)){ S.ft='';S.fc='';S.es=false; refilter(); row(); tick(true); trails(); } show(s.i,true); if(cx.afterPick) cx.afterPick(); });
  // ---------- 3D (three.js) ----------
  function attach3d(T,globe,cam,cv,renderer,ll2v,getDist){
    var pts=null, trl=null, orb=null, gtr=null, mk=null, mat=null, lmat=null, CV={};
    TYO.forEach(function(t){ var c=new T.Color(TY[t][0]); CV[t]=[c.r,c.g,c.b]; });
    function v3(p,r){ return ll2v(T,p.lon,p.lat,r==null?rDisp(p.h):r); }
    function clear(o){ if(o){ globe.remove(o); o.geometry.dispose(); } return null; }
    function build(){ pts=clear(pts); if(!S.on||!S.ready) return;
      if(!mat) mat=new T.ShaderMaterial({uniforms:{uS:{value:1}},transparent:true,depthWrite:false,
        vertexShader:'attribute vec3 aC;attribute vec2 aF;uniform float uS;varying vec3 vC;varying vec2 vF;void main(){vC=aC;vF=aF;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=(aF.x>0.5?16.0:9.0)*uS;}',
        fragmentShader:'varying vec3 vC;varying vec2 vF;void main(){vec2 p=abs(gl_PointCoord*2.0-1.0);float d=p.x+p.y;if(d>1.0)discard;vec3 c=vC;float a=vF.y>1.5?0.55:1.0;if(vF.x>0.5){if(d>0.62)c=vec3(1.0);else if(d>0.45)c=vec3(0.0);}else if(d>0.68)c=vF.y>0.5&&vF.y<1.5?vec3(0.98,0.80,0.25):vec3(0.02);gl_FragColor=vec4(c,a);}'});
      var n=VIS.length, g=new T.BufferGeometry(); g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3)); var col=new Float32Array(n*3), fl=new Float32Array(n*2);
      VIS.forEach(function(s,i){ var c=CV[tyOf(s)]; col.set(c,i*3); fl[i*2]=s.i===S.cur?1:0; fl[i*2+1]=s.st===4?2:(isES(s)?1:0); });
      g.setAttribute('aC',new T.BufferAttribute(col,3)); g.setAttribute('aF',new T.BufferAttribute(fl,2));
      pts=new T.Points(g,mat); pts.renderOrder=9; pts.frustumCulled=false; globe.add(pts); pos(); trails3(); sel3(); }
    function pos(){ if(!pts) return; if(pts.geometry.attributes.position.count!==VIS.length){ build(); return; } var a=pts.geometry.attributes.position, fl=pts.geometry.attributes.aF;
      VIS.forEach(function(s,i){ if(!s.p){ a.setXYZ(i,0,0,0); return; } var v=v3(s.p); a.setXYZ(i,v.x,v.y,v.z); fl.setX(i,s.i===S.cur?1:0); }); a.needsUpdate=true; fl.needsUpdate=true;
      if(mk&&S.cur>=0){ var s=L[S.cur]; if(s.p){ var v=v3(s.p), g0=v3(s.p,1.002); var la=mk.geometry.attributes.position; la.setXYZ(0,v.x,v.y,v.z); la.setXYZ(1,g0.x,g0.y,g0.z); la.needsUpdate=true; } } }
    function lineGeo(segs,cols){ var g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(segs,3)); g.setAttribute('color',new T.Float32BufferAttribute(cols,4)); return g; }
    function trails3(){ trl=clear(trl); if(!S.on||!S.ready) return; var P=[],C=[];
      VIS.forEach(function(s){ var a=s.tr; if(!a||!a.length||!s.p) return; var c=CV[tyOf(s)], pts2=a.concat([s.p]);
        for(var k=0;k<pts2.length-1;k++){ var p0=v3(pts2[k]), p1=v3(pts2[k+1]), a0=0.05+0.5*k/pts2.length, a1=0.05+0.5*(k+1)/pts2.length; P.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z); C.push(c[0],c[1],c[2],a0,c[0],c[1],c[2],a1); } });
      if(!lmat) lmat=new T.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false});
      trl=new T.LineSegments(lineGeo(P,C),lmat); trl.renderOrder=8; trl.frustumCulled=false; globe.add(trl); }
    function sel3(){ orb=clear(orb); gtr=clear(gtr); mk=clear(mk); if(S.cur<0||!S.on) { if(pts) pos(); return; } var s=L[S.cur], a=s.orb; if(!a||!a.length) return; var c=CV[tyOf(s)];
      var P=[],C=[],G=[],GC=[]; for(var k=0;k<a.length-1;k++){ var p0=v3(a[k]),p1=v3(a[k+1]); P.push(p0.x,p0.y,p0.z,p1.x,p1.y,p1.z); var al=0.25+0.6*Math.sin(Math.PI*k/a.length); C.push(c[0],c[1],c[2],al,c[0],c[1],c[2],al);
        if(Math.abs(a[k].lon-a[k+1].lon)<180){ var g0=v3(a[k],1.003),g1=v3(a[k+1],1.003); G.push(g0.x,g0.y,g0.z,g1.x,g1.y,g1.z); GC.push(1,1,1,0.55,1,1,1,0.55); } }
      orb=new T.LineSegments(lineGeo(P,C),lmat||new T.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false})); orb.renderOrder=8; orb.frustumCulled=false; globe.add(orb);
      gtr=new T.LineSegments(lineGeo(G,GC),new T.LineDashedMaterial({vertexColors:true,transparent:true,depthWrite:false,dashSize:.012,gapSize:.008})); gtr.computeLineDistances(); gtr.renderOrder=7; gtr.frustumCulled=false; globe.add(gtr);
      mk=new T.LineSegments(lineGeo([0,0,0,0,0,0],[1,1,1,.8,1,1,1,.15]),new T.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false})); mk.frustumCulled=false; globe.add(mk); pos(); }
    var _v=new T.Vector3();
    function pick(x,y,rad){ if(!pts) return -1; var r=cv.getBoundingClientRect(), a=pts.geometry.attributes.position, best=-1, bd=rad*rad, cp=cam.position; globe.updateMatrixWorld();
      for(var i=0;i<VIS.length;i++){ if(!VIS[i].p) continue; _v.set(a.getX(i),a.getY(i),a.getZ(i)).applyMatrix4(globe.matrixWorld);
        var dx=_v.x-cp.x, dy=_v.y-cp.y, dz=_v.z-cp.z, A2=dx*dx+dy*dy+dz*dz, B2=2*(cp.x*dx+cp.y*dy+cp.z*dz), C2=cp.x*cp.x+cp.y*cp.y+cp.z*cp.z-1, disc=B2*B2-4*A2*C2;
        if(disc>0){ var t1=(-B2-Math.sqrt(disc))/(2*A2); if(t1>0&&t1<0.999) continue; }
        _v.project(cam); var sx=r.left+(_v.x+1)/2*r.width, sy=r.top+(1-_v.y)/2*r.height, d2=(sx-x)*(sx-x)+(sy-y)*(sy-y); if(d2<bd){ bd=d2; best=VIS[i].i; } }
      return best; }
    function scr(i){ if(!pts) return null; var k=-1; for(var j=0;j<VIS.length;j++) if(VIS[j].i===i){ k=j; break; } if(k<0) return null; var a=pts.geometry.attributes.position, r=cv.getBoundingClientRect(); globe.updateMatrixWorld(); _v.set(a.getX(k),a.getY(k),a.getZ(k)).applyMatrix4(globe.matrixWorld); var cp=cam.position, dx=_v.x-cp.x, dy=_v.y-cp.y, dz=_v.z-cp.z, A2=dx*dx+dy*dy+dz*dz, B2=2*(cp.x*dx+cp.y*dy+cp.z*dz), C2=cp.x*cp.x+cp.y*cp.y+cp.z*cp.z-1, disc=B2*B2-4*A2*C2, occ=false; if(disc>0){ var t1=(-B2-Math.sqrt(disc))/(2*A2); occ=t1>0&&t1<0.999; } _v.project(cam); return {x:r.left+(_v.x+1)/2*r.width, y:r.top+(1-_v.y)/2*r.height, occ:occ}; }
    function frame(){ if(mat) mat.uniforms.uS.value=renderer.getPixelRatio()*Math.max(.8,Math.min(1.6,2.9/getDist())); }
    G3={scr:scr,build:build,pos:pos,trails:trails3,sel:sel3,pick:pick,frame:frame,clear:function(){ pts=clear(pts); trl=clear(trl); orb=clear(orb); gtr=clear(gtr); mk=clear(mk); }};
    if(S.on&&S.ready) build();
    return G3; }
  // ---------- 2D (canvas) ----------
  function draw2d(ctx,w,h,dpr){ if(!S.on||!S.ready) return; var X=function(p){ return (p.lon+180)/360*w; }, Y=function(p){ return (90-p.lat)/180*h; };
    ctx.save(); ctx.lineWidth=1.2*dpr;
    VIS.forEach(function(s){ if(!s.tr||!s.p) return; var a=s.tr.concat([s.p]); ctx.strokeStyle=TY[tyOf(s)][0]; ctx.globalAlpha=.45; ctx.beginPath(); for(var k=0;k<a.length;k++){ var x=X(a[k]), y=Y(a[k]); if(k&&Math.abs(a[k].lon-a[k-1].lon)>180) ctx.moveTo(x,y); else if(k) ctx.lineTo(x,y); else ctx.moveTo(x,y); } ctx.stroke(); });
    if(S.cur>=0&&L[S.cur].orb){ var o=L[S.cur].orb; ctx.globalAlpha=.8; ctx.strokeStyle='#fff'; ctx.setLineDash([4*dpr,3*dpr]); ctx.beginPath(); for(var k=0;k<o.length;k++){ var x=X(o[k]), y=Y(o[k]); if(!k||Math.abs(o[k].lon-o[k-1].lon)>180) ctx.moveTo(x,y); else ctx.lineTo(x,y); } ctx.stroke(); ctx.setLineDash([]); }
    ctx.globalAlpha=1;
    VIS.forEach(function(s){ if(!s.p) return; var x=X(s.p), y=Y(s.p), sz=(s.i===S.cur?6:3.6)*dpr; ctx.beginPath(); ctx.moveTo(x,y-sz); ctx.lineTo(x+sz,y); ctx.lineTo(x,y+sz); ctx.lineTo(x-sz,y); ctx.closePath(); ctx.globalAlpha=s.st===4?.55:1; ctx.fillStyle=TY[tyOf(s)][0]; ctx.fill(); ctx.lineWidth=(s.i===S.cur?2:1)*dpr; ctx.strokeStyle=s.i===S.cur?'#fff':isES(s)?'#f9c74f':'#111'; ctx.stroke(); });
    ctx.restore(); }
  function pick2d(px,py,w,h,rad){ var best=-1, bd=rad*rad; VIS.forEach(function(s){ if(!s.p) return; var x=(s.p.lon+180)/360*w, y=(90-s.p.lat)/180*h, d=(x-px)*(x-px)+(y-py)*(y-py); if(d<bd){ bd=d; best=s.i; } }); return best; }
  function tip(i){ var s=L[i]; return s?s.n+' · '+(EN?TY[tyOf(s)][2]:TY[tyOf(s)][1]):''; }
  function set(on){ S.on=on; try{ localStorage.setItem('mat_sat',on?'1':'0'); }catch(e){} btn(); if(!on){ clearInterval(timer); hide(); if(G3) G3.clear(); if(req2d) req2d(); row(); cx.panel(); return; } start(); }
  btnEl.addEventListener('click',function(){ set(!S.on); cx.urlSync(); });
  window.MAT_SAT_DBG={find:function(q){ q=q.toLowerCase(); for(var i=0;i<L.length;i++) if(L[i].n.toLowerCase().indexOf(q)>=0) return i; return -1; }, show:function(i){ show(i,true); }, scr:function(i){ return G3?G3.scr(i):null; }, n:function(){ return VIS.length; }, cur:function(){ return S.cur; }, p:function(i){ return L[i]&&L[i].p; }, ready:function(){ return S.ready; }};
  btn(); row(); if(S.on) start();
  return {get on(){ return S.on; }, get cur(){ return S.cur; }, attach3d:attach3d, draw2d:draw2d, pick2d:pick2d, set2d:function(f){ req2d=f; }, show:show, hide:hide, tip:tip, sec:sec, pick:function(x,y,r){ return G3?G3.pick(x,y,r):-1; }, frame:function(){ if(G3) G3.frame(); },
    detach3d:function(){ if(G3) G3.clear(); G3=null; }, dispose:function(){ dead=true; clearInterval(timer); G3=null; req2d=null; }};
};
})();
