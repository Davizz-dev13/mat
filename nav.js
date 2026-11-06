/* M.A.T · cabecera: desplegables «Juegos ▾» y «Secciones ▾» (aprobados por Jose, 6 nov 2026).
   Las listas salen de los datos de la web: juegos de app.js (MAT_GAMES), secciones de las tarjetas de app.js (MAT_SECTILES)
   en el orden y con las fotos de portada.js (MAT_PORTADA). Se cierran al pinchar fuera, con Esc y al cambiar de ruta. */
(function(){
"use strict";
function EN(){ return window.MAT_LANG==='en'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var TX={es:{j:'Juegos',s:'Secciones',all:'Ver todos ›',news:'Noticias y archivo',cmp:'Comparar fichas',nw:'NUEVO',soon:'PRÓXIMAMENTE',reto:'Reto M.A.T',retod:'Adivina el sistema secreto de hoy',fz:'Países y facciones',jl:'Abrir el menú de juegos',sl:'Abrir el menú de secciones'},
        en:{j:'Games',s:'Sections',all:'All games ›',news:'News and archive',cmp:'Compare entries',nw:'NEW',soon:'COMING SOON',reto:'M.A.T Challenge',retod:'Guess today’s secret system',fz:'Countries and factions',jl:'Open the games menu',sl:'Open the sections menu'}};
function t(k){ return TX[EN()?'en':'es'][k]; }
// Títulos EN de las secciones cuya tarjeta solo está en español (las demás ya traen su EN en app.js).
var SEN={'#/mapa':'World map','#/guerras':'Wars today','#/exterior':'Spain abroad','#/gasto':'Military expenditure by country','#/fyse':'National Police & Civil Guard','#/onu':'UN · United Nations','#/debate':'Debate & feedback','#/fuerzas':'Countries and factions','#/radar':'Air radar','#/modelos-3d':'3D models','#/batallas':'Battles & special operations','#/inteligencia':'Intelligence services','#/ceuta-melilla':'Ceuta and Melilla'};
var DEF_ORDER=['#/mapa','#/batallas','#/guerras','#/radar','#/modelos-3d','#/exterior','#/gasto','#/fyse','#/inteligencia','#/ceuta-melilla','#/onu','#/debate'];
var ICO_NEWS='<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><rect x="7" y="9" width="30" height="32" rx="2" fill="none" stroke="#b3bd8c" stroke-width="2.4"/><path d="M12 18h20M12 25h20M12 32h12" stroke="#8f9a6a" stroke-width="2.2"/></svg>';
var ICO_CMP='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4" fill="none" stroke="#b3bd8c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICO_RETO='<svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="#d6b25e" stroke-width="2"/><circle cx="20" cy="20" r="9" fill="none" stroke="#d6b25e" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="#d6b25e"/></svg>';
var FLAGS='<span class="thf" aria-hidden="true"><img src="flags/es.png" alt=""><img src="flags/us.png" alt=""><img src="flags/fr.png" alt=""><img src="flags/gb.png" alt=""></span>';

function gamesHTML(){
  var G=window.MAT_GAMES?window.MAT_GAMES():null, h='';
  var list=G?G.list:[['#/armero','armero','Armero 3D','3D Gunsmith'],['#/soldado','soldado','Crea tu soldado','Build your soldier'],['#/soldado/combate','combate','Combate','Fight'],['#/duelo','duelo','Duelo','Duel'],['#/antidisturbios','antidisturbios','Antidisturbios','Riot control'],['#/guerra-nuclear','nuclear','Guerra nuclear','Nuclear war'],['#/ejercito','ejercito','Crea tu ejército','Build your army']].map(function(g){ return [g[0],g[1],EN()?g[3]:g[2],'']; });
  list.forEach(function(g){
    var th='<span class="th" style="background-image:url(img/juegos/'+g[1]+'.webp)"></span>';
    var body='<span class="tx"><span class="tt">'+esc(g[2])+'</span>'+(g[3]?'<span class="ds">'+esc(g[3])+'</span>':'')+'</span>';
    if(G&&G.soon&&g[0]==='#/duelo') h+='<span class="ddi off" aria-disabled="true">'+th+'<span class="tx"><span class="tt">'+esc(g[2])+'<span class="nw sn">'+t('soon')+'</span></span></span></span>';
    else h+='<a class="ddi" href="'+g[0]+'">'+th+body+'</a>'; });
  if(!G||G.reto) h+='<a class="ddi" href="#/reto"><span class="th thr">'+ICO_RETO+'</span><span class="tx"><span class="tt">'+t('reto')+'<span class="nw">'+t('nw')+'</span></span><span class="ds">'+t('retod')+'</span></span></a>';
  return '<div class="ddh"><span>'+t('j')+'</span><a href="#/juegos">'+t('all')+'</a></div><div class="ddg">'+h+'</div>';
}
function secItems(){
  var by={}, P=window.MAT_PORTADA||{}, ORDER=P.ORDER||DEF_ORDER, PH=P.PH||{}, BIG=P.BIG||{};
  if(window.MAT_SECTILES){ var d=document.createElement('div'); d.innerHTML=window.MAT_SECTILES();
    [].slice.call(d.querySelectorAll('a[href]')).forEach(function(a){ var k=a.getAttribute('href'), te=a.querySelector('.t'); if(!te||k==='#/noticias') return; by[k]=te.textContent.trim(); }); }
  else ORDER.forEach(function(k){ by[k]=null; });
  by['#/debate']=EN()?'Debate & feedback':'Debate y feedback';
  if(by['#/radar']==='Radar aéreo'||by['#/radar']==null) by['#/radar']=EN()?'Air radar':'Radar aéreo';
  var keys=ORDER.filter(function(k){ return k in by; }).concat(Object.keys(by).filter(function(k){ return ORDER.indexOf(k)<0; }));
  if(window.MAT_FUERZAS!==false){ keys.splice(Math.min(1,keys.length),0,'#/fuerzas'); by['#/fuerzas']=t('fz'); }
  return keys.map(function(k){ var tt=by[k]; if(EN()&&SEN[k]) tt=SEN[k]; if(!tt) tt=k.slice(2);
    return {h:k,t:tt,img:BIG[k]||PH[k]||''}; });
}
function secHTML(){
  var h=secItems().map(function(s){ var th=s.h==='#/fuerzas'?'<span class="th">'+FLAGS+'</span>':'<span class="th"'+(s.img?' style="background-image:url('+s.img+')"':'')+'></span>';
    return '<a class="ddi" href="'+s.h+'">'+th+'<span class="tx"><span class="tt">'+esc(s.t)+'</span></span></a>'; }).join('');
  return '<div class="ddh"><span>'+t('s')+'</span></div><div class="ddg">'+h+'</div><div class="ddf"><a href="#/noticias">'+ICO_NEWS+'<span>'+t('news')+'</span></a><a href="#/comparar">'+ICO_CMP+'<span>'+t('cmp')+'</span></a></div>';
}
var top=null, dim=null, DDS=[];
function panel(dd){ return dd.querySelector('.ddp'); }
function btn(dd){ return dd.querySelector('.ddb'); }
function links(dd){ return [].slice.call(panel(dd).querySelectorAll('a[href]')); }
function build(dd){ var p=panel(dd), k=(EN()?'en':'es')+(window.MAT_GAMES?1:0)+(window.MAT_SECTILES?1:0)+(window.MAT_PORTADA?1:0);
  if(p.getAttribute('data-k')===k) return; p.innerHTML=dd.id==='ddj'?gamesHTML():secHTML(); p.setAttribute('data-k',k); }
function place(dd){ var p=panel(dd); if(window.innerWidth<700){ var b=top.getBoundingClientRect().bottom; p.style.top=Math.round(b)+'px'; p.style.maxHeight='calc(100vh - '+Math.round(b)+'px)'; } else { p.style.top=''; p.style.maxHeight=''; } }
function isOpen(dd){ return dd.classList.contains('open'); }
function close(dd,refocus){ if(!isOpen(dd)) return; dd.classList.remove('open'); btn(dd).setAttribute('aria-expanded','false'); panel(dd).hidden=true; if(refocus) btn(dd).focus(); if(!DDS.some(isOpen)) document.body.classList.remove('ddopen'); }
function closeAll(except){ DDS.forEach(function(d){ if(d!==except) close(d,false); }); }
function open(dd,focusFirst){ closeAll(dd); build(dd); dd.classList.add('open'); btn(dd).setAttribute('aria-expanded','true'); panel(dd).hidden=false; place(dd); document.body.classList.add('ddopen');
  if(focusFirst){ var l=links(dd)[0]; if(l) l.focus(); } }
function move(dd,dir){ var ls=links(dd), i=ls.indexOf(document.activeElement); var n=dir==='home'?0:dir==='end'?ls.length-1:(i<0?0:(i+dir+ls.length)%ls.length); if(ls[n]) ls[n].focus(); }
function init(){
  top=document.querySelector('header.top'); if(!top) return;
  DDS=[].slice.call(top.querySelectorAll('.dd')); if(!DDS.length) return;
  dim=document.createElement('div'); dim.className='navdim'; dim.setAttribute('aria-hidden','true'); document.body.appendChild(dim);
  DDS.forEach(function(dd){ var b=btn(dd), p=panel(dd), l=b.querySelector('.ddl');
    if(l) l.textContent=dd.id==='ddj'?t('j'):t('s'); b.setAttribute('aria-label',dd.id==='ddj'?t('jl'):t('sl'));
    b.addEventListener('click',function(e){ if(isOpen(dd)) close(dd,false); else open(dd,e.detail===0); });
    b.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'){ e.preventDefault(); open(dd,true); } });
    p.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'||e.key==='ArrowRight'){ e.preventDefault(); move(dd,1); } else if(e.key==='ArrowUp'||e.key==='ArrowLeft'){ e.preventDefault(); move(dd,-1); } else if(e.key==='Home'){ e.preventDefault(); move(dd,'home'); } else if(e.key==='End'){ e.preventDefault(); move(dd,'end'); } });
    p.addEventListener('click',function(e){ var a=e.target.closest&&e.target.closest('a[href]'); if(a) setTimeout(function(){ close(dd,false); },0); });
    dd.addEventListener('focusout',function(e){ var r=e.relatedTarget; if(r&&!dd.contains(r)) close(dd,false); });
  });
  document.addEventListener('click',function(e){ if(!DDS.some(isOpen)) return; if(e.target.closest&&e.target.closest('header.top .dd')) return; closeAll(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'||e.key==='Esc'){ var o=DDS.filter(isOpen)[0]; if(o){ e.preventDefault(); close(o,true); } } });
  window.addEventListener('hashchange',function(){ closeAll(); });
  window.addEventListener('resize',function(){ DDS.filter(isOpen).forEach(place); });
  window.MAT_NAV={open:function(id){ var d=document.getElementById(id); if(d) open(d,false); },close:function(){ closeAll(); }};
}
try{ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init(); }catch(e){ if(window.console) console.warn('nav',e); }
})();
