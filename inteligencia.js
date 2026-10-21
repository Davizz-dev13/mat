(function(){
"use strict";
// M.A.T · Servicios de inteligencia (#/inteligencia, #/inteligencia/<país>). Datos: inteligencia.json
// (fechas y sedes contrastadas con Wikidata/Wikipedia; descripciones propias y neutrales; emblemas solo si son libres en Wikimedia Commons).
var CACHE=null;
function load(){ if(CACHE) return Promise.resolve(CACHE); var v=(document.querySelector('script[data-v]')||{}).getAttribute?document.querySelector('script[data-v]').getAttribute('data-v'):'1'; return fetch('inteligencia.json?v='+v).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ CACHE=d; return d; }); }
var ICON='<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><path d="M24 5l15 5v11c0 10-6.5 18-15 22C15.5 39 9 31 9 21V10z" fill="none" stroke="#8f9a6a" stroke-width="1.6" stroke-linejoin="round"/><path d="M14 24c3-4.5 6.3-6.5 10-6.5S31 19.5 34 24c-3 4.5-6.3 6.5-10 6.5S17 28.5 14 24z" fill="none" stroke="#b3bd8c" stroke-width="1.5"/><circle cx="24" cy="24" r="3.2" fill="#d6b25e"/></svg>';
window.MAT_INTEL_ICON=ICON;
window.MAT_INTEL=function(app,X){
  var EN=window.MAT_LANG==='en', esc=X.esc, P=X.P, p=X.p||[];
  var T=EN?{h:'Intelligence services',home:'Home',sub:'The civilian, domestic, military and signals intelligence agencies of each country: what they do, since when, where they are based and who they report to. Neutral information from public sources.',
      types:{civil:'Civilian',interior:'Domestic & counterintelligence',militar:'Military',senales:'Signals & cyber',coord:'Coordination'},
      all:'All',search:'Search an agency or country…',fund:'Founded',hq:'HQ',par:'Reports to',src:'Sources',emb:'Emblem',agencies:'agencies',agency:'agency',none:'No agency matches.',load:'Loading…',err:'Could not load the data. Check your connection and try again.',
      es_note:'The Guardia Civil (Jefatura de Información) and the Policía Nacional (Comisaría General de Información) also have information services; they are police bodies and are not counted as intelligence agencies here.',
      fiveeyes:'The US, the UK, Canada, Australia and New Zealand share signals intelligence under the UKUSA agreement ("Five Eyes").',
      types_h:'Types',rev:'Reviewed',allc:'All countries',country:'Country'}
     :{h:'Servicios de inteligencia',home:'Inicio',sub:'Las agencias de inteligencia civil, interior, militar y de señales de cada país: qué hacen, desde cuándo, dónde tienen la sede y de quién dependen. Información neutral de fuentes públicas.',
      types:{civil:'Civil',interior:'Interior y contrainteligencia',militar:'Militar',senales:'Señales y ciber',coord:'Coordinación'},
      all:'Todas',search:'Busca una agencia o un país…',fund:'Fundación',hq:'Sede',par:'Depende de',src:'Fuentes',emb:'Emblema',agencies:'agencias',agency:'agencia',none:'Ninguna agencia coincide.',load:'Cargando…',err:'No se pudieron cargar los datos. Comprueba la conexión y vuelve a intentarlo.',
      es_note:'La Guardia Civil (Jefatura de Información) y la Policía Nacional (Comisaría General de Información) también tienen servicios de información; son cuerpos policiales y aquí no se cuentan como agencias de inteligencia.',
      fiveeyes:'EE. UU., Reino Unido, Canadá, Australia y Nueva Zelanda comparten inteligencia de señales en el acuerdo UKUSA («Cinco Ojos»).',
      types_h:'Tipos',rev:'Revisado',allc:'Todos los países',country:'País'};
  var only=p[1]||'', st={t:'',q:''};
  function cname(k){ var n=P[k]?P[k].n.split(' (')[0]:k; return EN&&window.MAT_T?window.MAT_T(n):n; }
  function nrm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
  X.set(X.crumbs([[T.home,'#/'],[T.h]])+'<p class="sub" style="padding:20px 0">'+T.load+'</p>',T.h);
  load().then(function(D){
    var A=D.agencies;
    function card(a){ var lg=a.logo; var img=lg?'<img src="'+esc(lg.th)+'" alt="'+esc(T.emb+' '+a.a)+'" loading="lazy" width="56" height="56">':ICON;
      var h='<article class="ig-card" id="ig-'+esc(a.a.replace(/[^A-Za-z0-9]+/g,'').toLowerCase())+'-'+a.k+'"><div class="ig-hd"><div class="ig-lg">'+img+'</div><div class="ig-tt"><div class="ig-acr">'+esc(a.a)+' <span class="ig-ty ig-'+a.t+'">'+esc(T.types[a.t])+'</span></div><div class="ig-nm">'+esc(EN?a.ne:a.n)+'</div>'+(a.o&&a.o!==(EN?a.ne:a.n)?'<div class="ig-or">'+esc(a.o)+'</div>':'')+'</div></div>';
      h+='<p class="ig-d">'+esc(EN?a.de:a.d)+'</p><dl class="ig-dl">'+(a.f?'<div><dt>'+T.fund+'</dt><dd>'+a.f+'</dd></div>':'')+'<div><dt>'+T.hq+'</dt><dd>'+esc(EN?a.hqe:a.hq)+'</dd></div><div><dt>'+T.par+'</dt><dd>'+esc(EN?a.pe:a.p)+'</dd></div></dl>';
      var s=[]; if(EN){ if(a.en) s.push('<a href="'+esc(a.en)+'" target="_blank" rel="noopener">Wikipedia</a>'); if(a.es) s.push('<a href="'+esc(a.es)+'" target="_blank" rel="noopener">Wikipedia (ES)</a>'); } else { if(a.es) s.push('<a href="'+esc(a.es)+'" target="_blank" rel="noopener">Wikipedia</a>'); if(a.en) s.push('<a href="'+esc(a.en)+'" target="_blank" rel="noopener">Wikipedia (EN)</a>'); }
      s.push('<a href="'+esc(a.wd)+'" target="_blank" rel="noopener">Wikidata</a>');
      h+='<div class="ig-src">'+T.src+': '+s.join(' · ')+(lg?'<br>'+T.emb+': <a href="'+esc(lg.pg)+'" target="_blank" rel="noopener">Wikimedia Commons</a>'+(lg.by?' — '+esc(lg.by):'')+' ('+esc(lg.lic||'')+')':'')+'</div></article>';
      return h; }
    function render(){
      var q=nrm(st.q), L=A.filter(function(a){ return (!only||a.k===only)&&(!st.t||a.t===st.t)&&(!q||nrm(a.a+' '+a.n+' '+a.ne+' '+a.o+' '+cname(a.k)).indexOf(q)>=0); });
      var g={}; L.forEach(function(a){ (g[a.k]=g[a.k]||[]).push(a); });
      var h='';
      D.order.forEach(function(k,i){ var arr=g[k]; if(!arr) return; var open=only||q||st.t||k==='espana';
        h+='<details class="ig-c"'+(open?' open':'')+'><summary>'+X.flag(k)+'<span class="ig-cn">'+esc(cname(k))+'</span><span class="ig-cnt">'+arr.length+' '+(arr.length===1?T.agency:T.agencies)+'</span></summary><div class="ig-cards">'+arr.map(card).join('')+(k==='espana'?'<p class="ig-note">'+T.es_note+'</p>':'')+'</div></details>'; });
      var box=document.getElementById('igres'); if(box) box.innerHTML=h||'<p class="sub">'+T.none+'</p>';
    }
    var h=X.crumbs(only?[[T.home,'#/'],[T.h,'#/inteligencia'],[cname(only)]]:[[T.home,'#/'],[T.h]])+'<div class="ig" data-noi18n><h1>'+(only?esc(T.h)+' · '+esc(cname(only)):esc(T.h))+'</h1><p class="sub">'+T.sub+'</p>';
    if(!only) h+='<div class="ig-bar"><input id="igq" class="inp" type="search" placeholder="'+esc(T.search)+'" aria-label="'+esc(T.search)+'"><div class="ig-chips" role="group" aria-label="'+esc(T.types_h)+'"><button type="button" class="ig-chip on" data-t="">'+T.all+'</button>'+Object.keys(T.types).map(function(t){ return '<button type="button" class="ig-chip" data-t="'+t+'">'+esc(T.types[t])+'</button>'; }).join('')+'</div></div>';
    else h+='<p><a class="ig-all" href="#/inteligencia">‹ '+T.allc+'</a></p>';
    h+='<div id="igres"></div><p class="ig-note">'+T.fiveeyes+'</p><p class="ig-rev">'+T.rev+': '+esc(D.rev)+'</p></div>';
    X.set(h,only?T.h+' · '+cname(only):T.h); render();
    var qi=document.getElementById('igq'); if(qi) qi.oninput=function(){ st.q=qi.value; render(); };
    [].slice.call(app.querySelectorAll('.ig-chip')).forEach(function(b){ b.onclick=function(){ st.t=b.getAttribute('data-t'); [].slice.call(app.querySelectorAll('.ig-chip')).forEach(function(c){ c.classList.toggle('on',c===b); }); render(); }; });
  }).catch(function(){ X.set(X.crumbs([[T.home,'#/'],[T.h]])+'<p class="sub" style="padding:20px 0">'+T.err+'</p>',T.h); });
};
// Enlace desde la página de cada país (#/fuerzas?a=p:<clave>) cuando hay agencias de ese país.
(function(){ var KEYS=null, busy=false;
  function hook(){ if(busy) return; var m=/^#\/fuerzas\?(?:.*&)?a=p(?::|%3A)([a-z_]+)(?:&|$)/.exec(location.hash); if(!m||/(^|&)b=/.test(location.hash.split('?')[1]||'')) return; var k=m[1];
    if(!KEYS){ KEYS='loading'; load().then(function(D){ KEYS={}; D.agencies.forEach(function(a){ KEYS[a.k]=(KEYS[a.k]||0)+1; }); hook(); }).catch(function(){ KEYS=null; }); return; }
    if(KEYS==='loading'||!KEYS[k]) return; var app=document.getElementById('app'); if(!app||!app.querySelector('h1')||app.querySelector('.ig-link')) return;
    busy=true; var EN=window.MAT_LANG==='en'; var d=document.createElement('div'); d.className='list ig-link'; d.setAttribute('data-noi18n','');
    d.innerHTML='<a class="row" href="#/inteligencia/'+k+'"><div class="m"><div class="nm">'+(EN?'Intelligence services':'Servicios de inteligencia')+'</div><div class="ds">'+KEYS[k]+' '+(EN?(KEYS[k]===1?'agency':'agencies'):(KEYS[k]===1?'agencia':'agencias'))+'</div></div><div class="ch">›</div></a>';
    app.appendChild(d); busy=false; }
  var mo=new MutationObserver(function(){ hook(); }); function start(){ var a=document.getElementById('app'); if(a) mo.observe(a,{childList:true}); hook(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start(); window.addEventListener('hashchange',function(){ setTimeout(hook,50); });
})();
})();
