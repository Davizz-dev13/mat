(function(){
"use strict";
// M.A.T · Geopolítica hoy (#/noticias). Datos: noticias.json (lo actualiza el trabajo diario de las 08:00 Madrid).
var CACHE=null;
function load(){ if(CACHE) return Promise.resolve(CACHE); return fetch('noticias.json?t='+Math.floor(Date.now()/600000)).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ CACHE=d; return d; }); }
window.MAT_NOTICIAS=function(app,X){
  var EN=window.MAT_LANG==='en', esc=X.esc, P=X.P;
  var T=EN?{h:'Geopolitics today',sub:"The world's 5 most important geopolitical stories, ranked by global importance.",upd:'Updated',why:'Why it matters',src:'Sources',arch:'Archive',archsub:'Previous days (last 14).',none:'No previous days yet.',load:'Loading news…',err:'Could not load the news. Check your connection and try again.',home:'Home',map:'View on map',stories:'stories'}
          :{h:'Geopolítica hoy',sub:'Las 5 noticias de geopolítica más importantes del mundo, ordenadas por importancia global.',upd:'Actualizado',why:'Por qué importa',src:'Fuentes',arch:'Archivo',archsub:'Días anteriores (últimos 14).',none:'Aún no hay días anteriores.',load:'Cargando noticias…',err:'No se pudieron cargar las noticias. Comprueba la conexión y vuelve a intentarlo.',home:'Inicio',map:'Ver en el mapa',stories:'noticias'};
  var loc=EN?'en-GB':'es-ES';
  function fday(s){ try{ var p=s.split('-'); var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12)); var t=d.toLocaleDateString(loc,{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}); return t.charAt(0).toUpperCase()+t.slice(1);}catch(e){return s;} }
  function fshort(s){ try{ var p=s.split('-'); var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12)); return d.toLocaleDateString(loc,{day:'numeric',month:'short',timeZone:'UTC'}); }catch(e){return s;} }
  function fupd(s){ try{ var d=new Date(s); return d.toLocaleString(loc,{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Madrid'})+(EN?' (Madrid time)':' (hora de Madrid)'); }catch(e){return s;} }
  function cname(k){ var n=P[k]?P[k].n.split(' (')[0]:k; return EN&&window.MAT_T?window.MAT_T(n):n; }
  function tags(it){ var h='<div class="nw-tags">'; var r=EN?it.reg_en:it.reg_es; if(r) h+='<span class="nw-reg">'+esc(r)+'</span>';
    (it.paises||[]).forEach(function(k){ if(!P[k]) return; h+='<a class="nw-tag" href="#/mapa?a=p:'+encodeURIComponent(k)+'" aria-label="'+esc(T.map+': '+cname(k))+'">'+(P[k].flag?'<img src="'+P[k].flag+'" alt="" width="18" height="12" loading="lazy">':'')+esc(cname(k))+'</a>'; });
    return h+'</div>'; }
  function srcs(it){ return '<div class="nw-src"><span class="nw-lbl">'+T.src+':</span> '+(it.fuentes||[]).map(function(f){ return '<a href="'+esc(f.url)+'" target="_blank" rel="noopener">'+esc(f.n)+(f.d?' <span class="nw-d">· '+esc(fshort(f.d))+'</span>':'')+'</a>'; }).join('')+'</div>'; }
  function card(it,i){ return '<article class="nw-it"><div class="nw-n">'+(i+1)+'</div><div class="nw-b"><h3>'+esc(EN?it.t_en:it.t_es)+'</h3><p class="nw-res">'+esc(EN?it.res_en:it.res_es)+'</p><p class="nw-why"><span class="nw-lbl">'+T.why+':</span> '+esc(EN?it.por_que_en:it.por_que_es)+'</p>'+tags(it)+srcs(it)+'</div></article>'; }
  var head=X.crumbs([[T.home,'#/'],[T.h]]);
  X.set(head+'<div data-noi18n><h1>'+T.h+'</h1><p class="sub">'+T.load+'</p></div>',T.h);
  load().then(function(D){
    if(location.hash.indexOf('#/noticias')!==0) return;
    var h=head+'<div class="nw" data-noi18n><h1>'+T.h+'</h1><p class="nw-date">'+esc(fday(D.fecha))+'</p><p class="nw-upd">'+T.upd+': '+esc(fupd(D.actualizado))+'</p><p class="sub">'+T.sub+'</p>';
    h+='<div class="nw-list">'+(D.items||[]).map(card).join('')+'</div>';
    h+='<h2>'+T.arch+'</h2><p class="sub">'+T.archsub+'</p>';
    var A=(D.archivo||[]).slice(0,14);
    if(!A.length) h+='<p class="nw-none">'+T.none+'</p>';
    else h+=A.map(function(day){ return '<details class="nw-day"><summary><span>'+esc(fday(day.fecha))+'</span><span class="nw-cnt">'+(day.items||[]).length+' '+T.stories+'</span></summary><div class="nw-list">'+(day.items||[]).map(card).join('')+'</div></details>'; }).join('');
    h+='</div>';
    X.set(h,T.h);
  }).catch(function(){ X.set(head+'<div data-noi18n><h1>'+T.h+'</h1><p class="sub">'+T.err+'</p></div>',T.h); });
};
})();
