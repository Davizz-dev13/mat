(function(){
"use strict";
// M.A.T · Carrera espacial: cronología (#/espacio/cronologia). Datos: espacio_crono.json.gz (hitos con fecha de Wikipedia/Wikidata) + «En cifras».
var CACHE=null;
function load(){ if(CACHE) return Promise.resolve(CACHE); return window.MAT_GET('espacio_crono.json.gz').then(function(d){ CACHE=d; return d; }); }
window.MAT_ESP_CRONO=function(app,X){
  var EN=window.MAT_LANG==='en', esc=X.esc, P=X.P, Q=X.qs();
  var T=EN?{home:'Home',cat:'Space race',h:'Space race timeline',sub:'Key milestones from Sputnik to today. Dates and facts from Wikipedia; each milestone links to its source.',load:'Loading timeline…',err:'Could not load the timeline. Check your connection and try again.',all:'All',alld:'All decades',who:'Country or agency',dec:'Decade',ficha:'Open ficha ›',src:'Source',none:'No milestones with these filters.',fig:'In figures',figsrc:'Source',n:'milestones',fichas:'Space race fichas ›'}
         :{home:'Inicio',cat:'Carrera espacial',h:'Cronología de la carrera espacial',sub:'Los hitos clave, del Sputnik a hoy. Fechas y datos de Wikipedia; cada hito enlaza su fuente.',load:'Cargando cronología…',err:'No se pudo cargar la cronología. Comprueba la conexión y vuelve a intentarlo.',all:'Todos',alld:'Todas las décadas',who:'País o agencia',dec:'Década',ficha:'Ver ficha ›',src:'Fuente',none:'No hay hitos con estos filtros.',fig:'En cifras',figsrc:'Fuente',n:'hitos',fichas:'Fichas de la carrera espacial ›'};
  var AG=[['urss',EN?'USSR / Russia':'URSS / Rusia','urss'],['us',EN?'United States':'EE. UU.','us'],['china','China','china'],['europa',EN?'Europe (ESA)':'Europa (ESA)','multi'],['india','India','india'],['japon',EN?'Japan':'Japón','japon'],['espana',EN?'Spain':'España','espana'],['privada',EN?'Private companies':'Empresas privadas','']];
  var loc=EN?'en-GB':'es-ES';
  function fdate(s){ try{ var p=s.split('-'); if(p.length===1) return p[0]; var d=new Date(Date.UTC(+p[0],+p[1]-1,+(p[2]||1),12)); return d.toLocaleDateString(loc,p.length>2?{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}:{month:'long',year:'numeric',timeZone:'UTC'}); }catch(e){ return s; } }
  function agl(k){ for(var i=0;i<AG.length;i++) if(AG[i][0]===k) return AG[i]; return null; }
  function href(o){ var q=[]; if(o.f) q.push('f='+encodeURIComponent(o.f)); if(o.d) q.push('d='+encodeURIComponent(o.d)); return '#/espacio/cronologia'+(q.length?'?'+q.join('&'):''); }
  var head=X.crumbs([[T.home,'#/'],[T.cat,'#/espacio'],[EN?'Timeline':'Cronología']]);
  X.set(head+'<div data-noi18n><h1>'+T.h+'</h1><p class="sub">'+T.load+'</p></div>',T.h);
  load().then(function(D){
    if(location.hash.indexOf('#/espacio/cronologia')!==0) return;
    (function(){ var have={}; AG.forEach(function(g){ have[g[0]]=1; }); var ex=[];
      (D.items||[]).forEach(function(it){ (it.ag||[]).forEach(function(k){ if(!have[k]&&P[k]){ have[k]=1; var nm=P[k].n; if(EN&&window.MAT_T) nm=window.MAT_T(nm); ex.push([k,nm,k,1]); } }); });
      ex.sort(function(a,b){ return a[1].localeCompare(b[1],EN?'en':'es'); }); AG=AG.concat(ex); })();
    var f=Q.f||'', dsel=Q.d||'';
    var all=(D.items||[]).slice().sort(function(a,b){ return a.f<b.f?-1:a.f>b.f?1:0; });
    var decs=[]; all.forEach(function(it){ var d=it.f.slice(0,3)+'0'; if(decs.indexOf(d)<0) decs.push(d); });
    var L=all.filter(function(it){ return (!f||it.ag.indexOf(f)>=0)&&(!dsel||it.f.slice(0,3)+'0'===dsel); });
    var h=head+'<div class="cr" data-noi18n><h1>'+T.h+'</h1><p class="sub">'+T.sub+'</p>';
    if(D.cifras&&D.cifras.length){ h+='<h2>'+T.fig+'</h2><div class="cr-figs">'+D.cifras.map(function(c){ return '<div class="cr-fig"><div class="kv">'+esc(EN?c.v_en:c.v_es)+'</div><div class="kk">'+esc(EN?c.k_en:c.k_es)+'</div><div class="cr-fs">'+esc(EN?c.d_en:c.d_es)+' · <a href="'+esc(c.src)+'" target="_blank" rel="noopener">'+T.figsrc+': Wikipedia</a></div></div>'; }).join('')+'</div>'; }
    var chip=function(g){ return '<a class="chip" href="'+href({f:g[0],d:dsel})+'" aria-pressed="'+(f===g[0])+'">'+(g[2]&&P[g[2]]?'<img src="'+P[g[2]].flag+'" alt="" width="18" height="12" loading="lazy" style="margin-right:5px;vertical-align:-1px">':'')+esc(g[1])+'</a>'; };
    var AGM=AG.filter(function(g){ return !g[3]&&all.some(function(it){ return it.ag.indexOf(g[0])>=0; }); }), AGX=AG.filter(function(g){ return g[3]; });
    h+='<div class="chips" role="group" aria-label="'+T.who+'"><a class="chip" href="'+href({d:dsel})+'" aria-pressed="'+(!f)+'">'+T.all+'</a>'+AGM.map(chip).join('')+'</div>';
    if(AGX.length){ var xin=AGX.some(function(g){ return g[0]===f; }); h+='<details class="cr-more"'+(xin?' open':'')+'><summary class="chip">'+(EN?'More countries':'Más países')+' ('+AGX.length+')'+(xin?' · '+esc(agl(f)[1]):'')+'</summary><div class="chips" role="group" aria-label="'+T.who+'">'+AGX.map(chip).join('')+'</div></details>'; }
    h+='<div class="chips" role="group" aria-label="'+T.dec+'" style="margin-top:6px"><a class="chip" href="'+href({f:f})+'" aria-pressed="'+(!dsel)+'">'+T.alld+'</a>'+decs.map(function(d){ return '<a class="chip" href="'+href({f:f,d:d})+'" aria-pressed="'+(dsel===d)+'">'+d+(EN?'s':'')+'</a>'; }).join('')+'</div>';
    h+='<p class="sub cr-n">'+L.length+' '+T.n+'</p>';
    if(!L.length) h+='<p class="sub">'+T.none+'</p>';
    var cur='';
    L.forEach(function(it){ var d=it.f.slice(0,3)+'0'; if(d!==cur){ if(cur) h+='</ol>'; cur=d; h+='<h2 class="cr-dec">'+d+(EN?'s':'')+'</h2><ol class="cr-list">'; }
      var tags=it.ag.map(function(k){ var g=agl(k); if(!g) return ''; return '<span class="cr-ag">'+(g[2]&&P[g[2]]?'<img src="'+P[g[2]].flag+'" alt="" width="16" height="11" loading="lazy">':'')+esc(g[1])+'</span>'; }).join('');
      h+='<li class="cr-it"><div class="cr-th">'+(it.img?'<img src="'+esc(it.img.th)+'" data-fb="'+esc(it.img.src)+'" alt="" loading="lazy" decoding="async">':'<div class="nofoto">'+(EN?'No free photo':'Sin fotografía libre')+'</div>')+'</div><div class="cr-b"><div class="cr-d">'+esc(fdate(it.f))+'</div><h3>'+esc(EN?it.t_en:it.t_es)+'</h3><p>'+esc(EN?it.l_en:it.l_es)+'</p><div class="cr-tags">'+tags+'</div><div class="cr-lk">'+(it.id&&X.BY[it.id]?'<a class="tag on" href="#/a/'+it.id+'">'+T.ficha+'</a>':'')+'<a class="tag" href="'+esc(it.src)+'" target="_blank" rel="noopener">'+T.src+': Wikipedia</a>'+(it.img?'<a class="cr-cr" href="'+esc(it.img.credit)+'" target="_blank" rel="noopener">'+(EN?'Photo: Commons':'Foto: Commons')+'</a>':'')+'</div></div></li>';
    });
    if(cur) h+='</ol>';
    h+='<div class="btns"><a class="btn" href="#/espacio">'+T.fichas+'</a></div></div>';
    X.set(h,T.h);
  }).catch(function(){ X.set(head+'<div data-noi18n><h1>'+T.h+'</h1><p class="sub">'+T.err+'</p></div>',T.h); });
};
})();
