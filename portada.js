(function(){
"use strict";
// M.A.T · portada: bloque NOTICIAS bajo la frase del día (lee noticias.json) y secciones en mosaico (grandes, ancha, pequeñas).
var app=document.getElementById('app'); if(!app) return;
function EN(){ return window.MAT_LANG==='en'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var ORDER=['#/mapa','#/batallas','#/guerras','#/guerra-nuclear','#/ejercito','#/modelos-3d','#/exterior','#/gasto','#/fyse','#/inteligencia','#/ceuta-melilla','#/onu','#/debate'];
var BIG={'#/mapa':'img/portada_mapa.webp','#/batallas':'img/portada_batallas.webp'};
var PH={'#/guerras':'img/sec_guerras.webp','#/guerra-nuclear':'img/sec_nuclear.webp','#/ejercito':'img/sec_ejercito.webp','#/modelos-3d':'img/sec_m3d.webp','#/exterior':'img/sec_exterior.webp','#/gasto':'img/sec_gasto.webp','#/fyse':'img/sec_fyse.webp','#/inteligencia':'img/sec_intel.webp','#/ceuta-melilla':'img/sec_cym.webp','#/onu':'img/sec_onu.webp','#/debate':'img/sec_debate.webp'};
var css=''
+'.pn{margin:14px 0 8px;padding:2px 0 2px 12px;border-left:2px solid #c9a862;min-width:0}'
+'.pn-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:0 0 9px}'
+'.pn-h b{font-size:12.5px;font-weight:800;letter-spacing:.09em;color:#d6b25e;text-transform:uppercase}'
+'.pn-h a{color:#d6b25e;font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap;padding:4px 0}'
+'.pn-h a:hover{text-decoration:underline}'
+'.pn-cards{display:flex;gap:10px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding:0 0 6px;scrollbar-width:thin;min-width:0}'
+'.pn-card{flex:0 0 78%;max-width:300px;scroll-snap-align:start;display:flex;flex-direction:column;gap:5px;box-sizing:border-box;background:rgba(255,255,255,.035);border:1px solid rgba(214,178,94,.32);border-radius:var(--r,10px);padding:10px 12px 11px;text-decoration:none;color:inherit;min-width:0}'
+'.pn-card:hover,.pn-card:focus-visible{border-color:#d6b25e;background:rgba(214,178,94,.07)}'
+'.pn-card .n{color:#d6b25e;font-weight:800;font-size:12px;line-height:1}'
+'.pn-card h3{margin:0;font-size:14.5px;line-height:1.3;font-weight:700;color:#f1ead6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}'
+'.pn-card p{margin:0;font-size:12.5px;line-height:1.38;color:var(--mu,#aaa);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}'
+'.pn-card .mas{margin-top:auto;padding-top:3px;color:#d6b25e;font-size:12px;font-weight:700}'
+'.pn-msg{font-size:13px;color:var(--mu,#aaa);margin:0}'
+'@media (min-width:700px){.pn-card{flex-basis:40%}}'
+'@media (min-width:980px){.pn-cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));overflow:visible;padding:0}.pn-card{max-width:none}.pn-card h3{font-size:14px}}'
// mosaico de secciones
+'body.r-home .hgrid.pg{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;grid-auto-flow:row dense}'
+'body.r-home .hgrid.pg>a{min-width:0;justify-content:flex-end}'+'.hgrid.pg>a>svg,.hgrid.pg>a>img,.hgrid.pg>a>span:first-child{display:none!important}'
+'body.r-home .hgrid.pg>a.dtile:last-child:nth-child(odd){grid-column:auto}'
+'.hgrid.pg>a.pg-s .d{display:none}'+'.hgrid.pg>a.pg-s{min-height:92px}'
+'.hgrid.pg>a.pg-s .t{overflow-wrap:anywhere;padding-right:12px}'
+'body.r-home .hgrid.pg>a.pg-big,body.r-home .hgrid.pg>a.pg-wide{grid-column:1/-1}'
+'.hgrid.pg>a.pg-big{min-height:158px;justify-content:flex-end;padding:14px}'
+'.hgrid.pg>a.pg-big:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(8,10,12,.12) 0%,rgba(8,10,12,.40) 45%,rgba(8,10,12,.88) 100%),linear-gradient(90deg,rgba(8,10,12,.45) 0%,rgba(8,10,12,0) 60%)}'

+'.hgrid.pg>a.pg-big svg.hic{width:42px!important;height:42px!important;max-height:42px!important}'
+'.hgrid.pg>a.pg-big .t{font-size:21px!important;text-shadow:0 1px 3px rgba(0,0,0,.8)}'
+'.hgrid.pg>a.pg-big .d{font-size:12.5px!important;color:#e4e1d8;-webkit-line-clamp:3;text-shadow:0 1px 2px rgba(0,0,0,.8);max-width:520px}'
+'.hgrid.pg>a.pg-big .ch{color:#e4e1d8!important}'
+'.hgrid.pg>a.pg-ph{background-color:#0d1013;background-size:cover;background-position:center;background-repeat:no-repeat;overflow:hidden;isolation:isolate}'+'.hgrid.pg>a.pg-ph:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(8,10,12,.50) 0%,rgba(8,10,12,.62) 45%,rgba(8,10,12,.90) 100%)}'+'.hgrid.pg>a.pg-ph .t{color:#f4f1e8;text-shadow:0 1px 3px rgba(0,0,0,.95),0 0 8px rgba(0,0,0,.6)}'+'.hgrid.pg>a.pg-ph .d{color:#e4e1d8;text-shadow:0 1px 2px rgba(0,0,0,.9)}'+'.hgrid.pg>a.pg-ph .ch{color:#e4e1d8!important;text-shadow:0 1px 2px #000}'+'.hgrid.pg>a.pg-ph svg.hic,.hgrid.pg>a.pg-ph img{filter:drop-shadow(0 1px 3px rgba(0,0,0,.7))}'+'@media (min-width:700px){body.r-home .hgrid.pg{grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(104px,auto);gap:10px}'
+' body.r-home .hgrid.pg>a.pg-big{grid-column:span 2;grid-row:span 2;min-height:0}'
+' body.r-home .hgrid.pg>a.pg-wide{grid-column:span 2}'
+' .hgrid.pg>a.pg-big .t{font-size:26px!important}.hgrid.pg>a.pg-big .d{font-size:13.5px!important}'
+' .hgrid.pg>a.pg-big svg.hic{width:52px!important;height:52px!important;max-height:52px!important}}'
+'@media (min-width:980px){body.r-home .hgrid.pg{grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}}';
var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

var NEWS=null, NP=null;
function loadNews(){ if(NEWS) return Promise.resolve(NEWS); if(NP) return NP;
  NP=fetch('noticias.json?t='+Math.floor(Date.now()/600000)).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ NEWS=d; return d; }).catch(function(e){ NP=null; throw e; });
  return NP; }
function fshort(s){ try{ var p=String(s).split('-'); var d=new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12)); return d.toLocaleDateString(EN()?'en-GB':'es-ES',{day:'numeric',month:'short',timeZone:'UTC'}).replace('.',''); }catch(e){ return s||''; } }
function short(s,n){ s=String(s||''); if(s.length<=n) return s; var c=s.slice(0,n); var k=c.lastIndexOf(' '); return (k>n*0.6?c.slice(0,k):c).replace(/[,;:.\s]+$/,'')+'…'; }
function newsHTML(D){
  var en=EN(), it=(D&&D.items)||[];
  var h='<div class="pn-h"><b>📰 '+(en?'News':'Noticias')+(D&&D.fecha?' · '+esc(fshort(D.fecha)):'')+'</b><a href="#/noticias">'+(en?'Archive →':'Archivo →')+'</a></div>';
  if(!it.length) return h+'<p class="pn-msg">'+(en?'No news today yet.':'Aún no hay noticias hoy.')+'</p>';
  h+='<div class="pn-cards">'+it.slice(0,5).map(function(x,i){
    var t=en?(x.t_en||x.t_es):(x.t_es||x.t_en), r=en?(x.res_en||x.res_es):(x.res_es||x.res_en);
    return '<a class="pn-card" href="#/noticias?n='+(i+1)+'"><span class="n">'+(i+1)+'</span><h3>'+esc(t)+'</h3><p>'+esc(short(r,240))+'</p><span class="mas">'+(en?'Read more →':'Leer más →')+'</span></a>';
  }).join('')+'</div>';
  return h; }
function news(){
  var fr=app.querySelector(':scope > figure.frase'); if(!fr) return;
  var box=app.querySelector(':scope > .pn');
  if(box&&box.getAttribute('data-lang')===(EN()?'en':'es')) return;
  if(!box){ box=document.createElement('section'); box.className='pn'; box.setAttribute('data-noi18n',''); box.setAttribute('aria-label',EN()?'News':'Noticias'); fr.parentNode.insertBefore(box,fr.nextSibling); }
  box.setAttribute('data-lang',EN()?'en':'es');
  if(NEWS){ box.innerHTML=newsHTML(NEWS); return; }
  box.innerHTML='<div class="pn-h"><b>📰 '+(EN()?'News':'Noticias')+'</b><a href="#/noticias">'+(EN()?'Archive →':'Archivo →')+'</a></div><p class="pn-msg">'+(EN()?'Loading news…':'Cargando noticias…')+'</p>';
  loadNews().then(function(D){ if(box.isConnected) box.innerHTML=newsHTML(D); }).catch(function(){ if(box.isConnected) box.querySelector('.pn-msg').textContent=EN()?'Could not load the news.':'No se pudieron cargar las noticias.'; });
}
var IO=('IntersectionObserver' in window)?new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; var a=e.target, u=a.getAttribute('data-bg'); if(u){ a.style.backgroundImage='url('+u+')'; a.removeAttribute('data-bg'); } IO.unobserve(a); }); },{rootMargin:'300px 0px'}):null;
function lazy(a,u){ if(!IO){ a.style.backgroundImage='url('+u+')'; return; } a.setAttribute('data-bg',u); IO.observe(a); }
function grid(){
  var g=app.querySelector('.hgrid'); if(!g||g.classList.contains('pg')) return;
  var by={}; [].slice.call(g.children).forEach(function(a){ var k=a.getAttribute('href'); if(k) by[k]=a; });
  if(by['#/noticias']) g.removeChild(by['#/noticias']);
  var rest=[].slice.call(g.children).filter(function(a){ return ORDER.indexOf(a.getAttribute('href'))<0; });
  ORDER.forEach(function(k){ var a=by[k]; if(!a) return; a.classList.remove('pg-big','pg-wide','pg-s');
    if(BIG[k]){ a.classList.add('pg-big','pg-ph'); a.style.backgroundImage='url('+BIG[k]+')'; }
    else { a.classList.add(k==='#/guerras'?'pg-wide':'pg-s'); if(PH[k]){ a.classList.add('pg-ph'); lazy(a,PH[k]); } }
    g.appendChild(a); });
  rest.forEach(function(a){ a.classList.add('pg-s'); g.appendChild(a); });
  g.classList.add('pg');
}
var busy=false, tm=null;
function run(){ if(busy) return; var h=location.hash.replace(/^#\/?/,''); if(h.split('?')[0].replace(/\/+$/,'')) return;
  busy=true; try{ grid(); news(); }catch(e){ if(window.console) console.warn('portada',e); } finally{ busy=false; } }
new MutationObserver(function(){ if(busy) return; clearTimeout(tm); tm=setTimeout(run,60); }).observe(app,{childList:true,subtree:true});
window.addEventListener('hashchange',function(){ clearTimeout(tm); tm=setTimeout(run,60); });
setTimeout(run,0);
window.MAT_PORTADA={run:run,load:loadNews};
})();
