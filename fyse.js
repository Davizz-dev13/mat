(function(){
"use strict";
// ============ M.A.T · Policía Nacional y Guardia Civil (#/fyse) ============
// Sección propia e INDEPENDIENTE de las Fuerzas Armadas: sus datos (fyse.json.gz) no se
// mezclan con data.json.gz, inventario, totales por país, #/fuerzas, comparador ni Duelo.
var DATA=null, DP=null, BYID={};
function load(){ if(DP) return DP; DP=window.MAT_GET('fyse.json.gz').then(function(d){DATA=d; d.items.forEach(function(x){BYID[x.id]=x;}); return d;}); return DP; }
function css(){ if(document.getElementById('fyse-css')) return; var s=document.createElement('style'); s.id='fyse-css';
 s.textContent='.fyhd{display:flex;align-items:center;gap:12px}.fyhd img{width:40px;height:27px;border-radius:3px;flex:0 0 40px}'+
 '.fytabs{margin:12px 0 4px}.fytabs .chip{font-size:14px;padding:9px 14px}.fysub{margin:6px 0 10px}'+
 '.fyrow .th{background:#0d0f10}.fyrow .th img{object-fit:cover}.fyrow .th img.fysvg{object-fit:contain;padding:6px;background:#15181a}'+
 '.fyst{font-weight:600}.fyst.act{color:#8fbf7a}.fyst.his{color:#d6b25e}.fyst.prev{color:#7aa7d6}'+
 '.fytl{list-style:none;margin:6px 0 14px;padding:0;border-left:2px solid var(--line)}.fytl li{position:relative;padding:6px 0 10px 16px;font-size:14px;line-height:1.45}'+
 '.fytl li:before{content:"";position:absolute;left:-6px;top:11px;width:10px;height:10px;border-radius:50%;background:#d6b25e}.fytl b{display:block;color:#d6b25e;font-size:13px;letter-spacing:.02em}'+
 '.fynote{border:1px solid var(--line);border-radius:var(--r);padding:10px 12px;font-size:12.5px;line-height:1.45;color:var(--mu);background:var(--s1);margin:10px 0}'+
 '.fysrc{font-size:13px;line-height:1.5}.fysrc a{word-break:break-word}.fyhero img.fysvg{object-fit:contain;max-height:40vh;padding:24px;background:#111}'+
 '.fycap{color:var(--mu)}.fycnt{color:var(--dim);font-weight:400}';
 document.head.appendChild(s); }
var GU={seg:['Seguridad ciudadana y orden público','Public safety & public order'],esp:['Intervención y operaciones especiales','Intervention & special operations'],inv:['Investigación e información','Investigation & intelligence'],apo:['Medios aéreos y marítimos','Air & maritime assets'],org:['Comisarías generales, enlaces y formación','Headquarters, liaison & training']};
var GV={heli:['Helicópteros','Helicopters'],avion:['Aviones','Aircraft'],barco:['Embarcaciones','Boats & patrol ships'],tierra:['Vehículos terrestres','Land vehicles'],moto:['Motocicletas','Motorcycles']};
var BN={pn:['Policía Nacional','National Police'],gc:['Guardia Civil','Civil Guard']};
var ST={act:['En servicio','In service'],his:['Histórico','Historical'],prev:['Previsto','Planned']};
var KN={hist:['Cuerpo / etapa histórica','Historical corps / era'],unit:['Unidad','Unit'],veh:['Vehículo / medio','Vehicle / asset']};
window.MAT_FYSE_IDS=function(){return DATA?Object.keys(BYID):[];};
window.MAT_FYSE=function(app,X){
  css();
  var EN=window.MAT_LANG==='en', esc=X.esc;
  function L(es,en){return EN?en:es;} function T(p){return EN?p[1]:p[0];}
  if(!DATA){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('Cargando Policía Nacional y Guardia Civil…','Loading National Police & Civil Guard…')+'</p>'; load().then(function(){window.MAT_FYSE(app,X);}).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('No se pudieron cargar los datos. Comprueba la conexión.','Could not load the data. Check your connection.')+'</p>';}); return;}
  var TITLE=L('Policía Nacional y Guardia Civil','National Police & Civil Guard');
  var path=(location.hash.split('?')[0]||'').replace(/^#\/?/,'').split('/'), id=path[1]?decodeURIComponent(path[1]):'';
  function isSvg(u){return /\.svg/i.test(u||'');}
  function thumb(x){ return x.img?'<img'+(isSvg(x.img.src)?' class="fysvg"':'')+' src="'+esc(x.img.th)+'" data-fb="'+esc(x.img.src)+'" alt="" loading="lazy" decoding="async">':window.MAT_PH(x,(x.k==='veh'?({heli:'heli',barco:'ship',avion:'plane',moto:'moto'}[x.g]||'truck'):'emb')); }
  function stl(x){ return '<span class="fyst '+x.st+'">'+T(ST[x.st]||ST.act)+'</span>'; }
  function YY(x){ return EN&&x.yen?x.yen:x.y; }
  function row(x){ var ds=(x.sig&&x.sig!==x.n?'<b>'+esc(x.sig)+'</b> · ':'')+(x.y&&x.y!=='—'?esc(EN&&x.yen?x.yen:EN?x.y.replace(/hoy/g,'today').replace(/previsto/,'planned').replace(/años (\d0)–(\d0)/,'$1s–$2s'):x.y)+' · ':'')+stl(x)+(x.fs?' · <span class="fycap">'+L('Fuente','Source')+': '+esc(EN&&x.fsen?x.fsen:x.fs)+'</span>':'');
    return '<a class="row fyrow" href="#/fyse/'+encodeURIComponent(x.id)+'"><div class="th">'+thumb(x)+'</div><div class="m"><div class="nm">'+esc(EN&&x.nen?x.nen:x.n)+'</div><div class="ds">'+ds+'</div></div><div class="ch">›</div></a>'; }
  function src(L2){ return L2.map(function(i){var s=DATA.src[i]; return s?'<li><a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+(s[3]?esc(s[3])+': '+esc(s[0])+' ('+esc(s[4]||'')+')':'Wikipedia'+(s[2]==='en'?' (en)':' (es)')+': '+esc(s[0]))+'</a></li>':'';}).join(''); }
  // ---------------- ficha ----------------
  if(id){ var x=BYID[id]; if(!x){ X.set(X.crumbs([[L('Inicio','Home'),'#/'],[TITLE,'#/fyse']])+'<p class="empty">—</p>',TITLE); return; }
    var bt=x.k==='hist'?'his':x.k==='unit'?'uni':'veh';
    var h=X.crumbs([[L('Inicio','Home'),'#/'],[TITLE,'#/fyse'],[T(BN[x.b]),'#/fyse?t='+x.b+'&s='+bt],[x.sig||x.n]]);
    h+='<div data-noi18n class="dwrap"><div>';
    if(x.img) h+='<figure class="dhero fyhero" style="margin-bottom:0"><img'+(isSvg(x.img.src)?' class="fysvg"':'')+' src="'+esc(x.img.src)+'" alt="'+esc(x.n)+'"></figure><div class="credit"><span class="fycap">'+esc(EN?x.img.cen:x.img.ces)+'</span> · '+L('Foto','Photo')+': <a href="'+esc(x.img.credit)+'" target="_blank" rel="noopener">Wikimedia Commons'+(x.img.lic?' ('+esc(x.img.lic)+')':'')+' — '+L('autor y licencia','author and licence')+'</a></div>';
    else h+=window.MAT_PHBIG(x,(x.k==='veh'?({heli:'heli',barco:'ship',avion:'plane',moto:'moto'}[x.g]||'truck'):'emb'));
    h+='</div><div><div class="kicker">'+T(BN[x.b])+' · '+T(x.k==='unit'?(GU[x.g]||KN.unit):x.k==='veh'?(GV[x.g]||KN.veh):KN.hist)+'</div><h1>'+esc(EN&&x.nen?x.nen:x.n)+'</h1>';
    h+='<div class="tags"><span class="tag on"><img class="flag" src="flags/es.png" alt="">'+T(BN[x.b])+'</span>'+(x.sig?'<span class="tag">'+esc(x.sig)+'</span>':'')+'<span class="tag">'+T(ST[x.st]||ST.act)+'</span></div>';
    h+='<p class="lead">'+esc(EN?x.en:x.es)+'</p></div></div>';
    var sp=function(k,v){return '<div class="sp"><span class="k">'+esc(k)+'</span><span class="v">'+(v==null||v===''?'—':esc(v))+'</span></div>';};
    h+='<div data-noi18n><h2>'+L('Ficha','Profile')+'</h2><div class="specs">'+sp(L('Cuerpo','Force'),T(BN[x.b]))+sp(L('Tipo','Type'),T(KN[x.k]))+sp(x.k==='veh'?L('Periodo de uso','Period of use'):L('Fechas','Dates'),EN&&x.yen?x.yen:EN?x.y.replace(/hoy/g,'today').replace(/previsto/,'planned').replace(/años (\d0)–(\d0)/,'$1s–$2s').replace('casi de baja','nearly retired').replace('retirado','retired'):x.y)+sp(L('Estado','Status'),T(ST[x.st]||ST.act))+
      x.f.map(function(f){return sp(EN?f[1]:f[0],EN?f[3]:f[2]);}).join('')+'</div>';
    h+='<h2>'+L('Fuentes','Sources')+'</h2><ul class="bul fysrc">'+src(x.s)+'</ul>';
    var PR=x.s.some(function(i){return DATA.src[i]&&DATA.src[i][3];});
    h+='<p class="note">'+(PR?L('Texto propio a partir de las fuentes enlazadas (organismos oficiales, fabricantes y prensa), con su fecha; cifras tal como figuran en ellas («No publicado» o «—» si no constan). ','Own wording based on the linked sources (official bodies, manufacturers and press), with their dates; figures as they appear there ("Not published" or "—" if not stated). '):L('Texto propio a partir de los artículos de Wikipedia enlazados; cifras tal como figuran en ellos («—» si no constan). ','Own wording based on the linked Wikipedia articles; figures as they appear there ("—" if not stated). '))+L('Esta sección no se suma a los datos de las Fuerzas Armadas.','This section is not added to the Armed Forces data.')+'</p>';
    h+='<div class="btns"><a class="btn pri" href="#/fyse?t='+x.b+'&s='+bt+'">'+L('Volver','Back')+'</a></div></div>';
    X.set(h,x.n); return; }
  // ---------------- portada de la sección ----------------
  var o=X.qs(), B=o.t==='gc'?'gc':'pn', S=o.s==='his'?'his':o.s==='veh'?'veh':'uni';
  var mine=DATA.items.filter(function(x){return x.b===B;});
  var nU=mine.filter(function(x){return x.k==='unit';}).length, nV=mine.filter(function(x){return x.k==='veh';}).length, nH=mine.filter(function(x){return x.k==='hist';}).length;
  var h=X.crumbs([[L('Inicio','Home'),'#/'],[TITLE]]);
  h+='<div data-noi18n><h1 class="fyhd"><img src="flags/es.png" alt=""><span>'+TITLE+'</span></h1>';
  h+='<p class="sub">'+esc(EN?DATA.intro.en:DATA.intro.es)+'</p>';
  h+='<div class="chips fytabs" role="tablist" aria-label="'+L('Cuerpo','Force')+'"><a class="chip" role="tab" href="#/fyse?t=pn&s='+S+'" aria-pressed="'+(B==='pn')+'">'+L('Policía Nacional','National Police')+'</a><a class="chip" role="tab" href="#/fyse?t=gc&s='+S+'" aria-pressed="'+(B==='gc')+'">'+L('Guardia Civil','Civil Guard')+'</a></div>';
  h+='<div class="chips fysub" role="group"><a class="chip" href="#/fyse?t='+B+'&s=uni" aria-pressed="'+(S==='uni')+'">'+L('Unidades','Units')+' <span class="fycnt">'+nU+'</span></a><a class="chip" href="#/fyse?t='+B+'&s=veh" aria-pressed="'+(S==='veh')+'">'+L('Vehículos y medios','Vehicles & assets')+' <span class="fycnt">'+nV+'</span></a><a class="chip" href="#/fyse?t='+B+'&s=his" aria-pressed="'+(S==='his')+'">'+L('Historia','History')+' <span class="fycnt">'+nH+'</span></a></div>';
  if(S==='his'){
    h+='<h2>'+L('Cronología','Timeline')+'</h2><ul class="fytl">'+DATA.hist[B].map(function(e){return '<li><b>'+esc(e[0])+'</b>'+esc(EN?e[2]:e[1])+'</li>';}).join('')+'</ul>';
    var hs=mine.filter(function(x){return x.k==='hist';});
    h+='<h2>'+L('Cuerpos y etapas','Corps and eras')+' <span class="cnt">'+hs.length+'</span></h2><div class="list">'+hs.map(row).join('')+'</div>';
  } else if(S==='uni'){
    ['esp','seg','inv','apo','org'].forEach(function(g){ var l=mine.filter(function(x){return x.k==='unit'&&x.g===g;}); if(!l.length) return;
      h+='<details class="fzcat" open><summary><span>'+T(GU[g])+'</span><span class="cnt">'+l.length+'</span></summary><div class="list">'+l.map(row).join('')+'</div></details>'; });
  } else {
    ['heli','avion','barco','moto','tierra'].forEach(function(g){ var l=mine.filter(function(x){return x.k==='veh'&&x.g===g;}); if(!l.length) return;
      l.sort(function(a,b){var r={act:0,prev:1,his:2}; return (r[a.st]-r[b.st]);});
      h+='<details class="fzcat" open><summary><span>'+T(GV[g])+'</span><span class="cnt">'+l.length+'</span></summary><div class="list">'+l.map(row).join('')+'</div></details>'; });
  }
  h+='<div class="fynote">'+esc(EN?DATA.note.en:DATA.note.es)+'</div>';
  h+='<p class="note">'+L('Datos y fotos de Wikipedia (es/en) y Wikimedia Commons, revisados el ','Data and photos from Wikipedia (es/en) and Wikimedia Commons, checked on ')+esc(DATA.fecha)+'. '+L('Motocicletas: fuentes oficiales, fabricantes y prensa, con la fecha en cada ficha.','Motorcycles: official sources, manufacturers and press, with the date on each entry.')+'</p></div>';
  X.set(h,TITLE);
};
})();
