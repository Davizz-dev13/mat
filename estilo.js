/* M.A.T · rediseño (nov. 2026): cabecera que se oscurece al bajar, portada (titular, frase, 01 Noticias, 02 Categorías) con revelados
   al hacer scroll en la curva cubic-bezier(.65,.05,0,1) y transición suave entre páginas. Respeta prefers-reduced-motion.
   No toca las fichas ni las tarjetas de Categorías. */
(function(){
"use strict";
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
function EN(){ return window.MAT_LANG==='en'; }
function isHome(){ var h=location.hash.replace(/^#\/?/,'').split('?')[0]; return !h; }
var io=('IntersectionObserver' in window)&&!RM?new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -6% 0px'}):null;
if(!io) document.documentElement.classList.add('px-norv');
function rv(el,d){ if(!el||el.classList.contains('rv')) return; el.classList.add('rv'); if(d) el.style.transitionDelay=d+'s'; if(io) io.observe(el); else el.classList.add('in'); }
function head(txt,num,link){ var h=document.createElement('div'); h.className='xsh'; h.setAttribute('data-noi18n','');
  h.innerHTML='<h2>'+txt+'</h2><span class="n">'+num+(link?' · <a href="'+link[0]+'">'+link[1]+'</a>':'')+'</span>'; return h; }
var lastH=null;
function decorate(){
  var app=document.getElementById('app'); if(!app) return;
  if(lastH!==location.hash){ var first=lastH===null; lastH=location.hash; if(!RM&&!first){ app.classList.remove('px-enter'); void app.offsetWidth; app.classList.add('px-enter'); } }
  var home=isHome(); document.body.classList.toggle('px-home',home);
  if(!home) return;
  var en=EN();
  if(!app.querySelector('#xhome')){
    var x=document.createElement('section'); x.id='xhome'; x.setAttribute('data-noi18n',''); x.setAttribute('aria-label',en?'Military encyclopedia':'Enciclopedia militar');
    x.innerHTML='<div class="xk"><span><b>M.A.T</b> · '+(en?'Military encyclopedia':'Enciclopedia militar')+'</span><span>'+(en?'Weapons · Inventories · Geopolitics':'Armamento · Inventario · Geopolítica')+'</span></div>'+
      '<h1><span><i>'+(en?'Every army<em>.</em>':'Todos los ejércitos<em>.</em>')+'</i></span><span><i>'+(en?'Every system<em>.</em>':'Todos los sistemas<em>.</em>')+'</i></span></h1>'+
      '<div class="xb"><p class="xl">'+(en?'Aircraft, ships, armour and weapons of every country, with sources, maps and games.':'Aviones, buques, blindados y armamento de todos los países, con fuentes, mapas y juegos.')+'</p><a class="xs" href="#xcat">'+(en?'Scroll':'Desliza')+'</a></div>';
    app.insertBefore(x,app.firstChild);
    x.querySelector('.xs').addEventListener('click',function(e){ e.preventDefault(); var t=document.querySelector('.frase')||document.querySelector('.cats'); if(t) t.scrollIntoView({behavior:RM?'auto':'smooth',block:'start'}); });
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ x.classList.add('in'); }); });
  }
  var pn=app.querySelector('.pn');
  if(pn&&!(pn.previousElementSibling&&pn.previousElementSibling.classList.contains('xsh'))) pn.parentNode.insertBefore(head(en?'News':'Noticias','01 · '+(en?'Today':'Hoy'),['#/noticias',en?'Archive →':'Archivo →']),pn);
  var cats=app.querySelector('.cats');
  if(cats&&!app.querySelector('#xcat')){ var hs=cats.previousElementSibling; if(hs&&hs.matches&&hs.matches('h2.hsec')) cats=hs; var hc=head(en?'Categories':'Categorías',(pn?'02':'01')+' · '+(en?'Encyclopedia':'Enciclopedia')); hc.id='xcat'; cats.parentNode.insertBefore(hc,cats); }
  [].forEach.call(app.querySelectorAll('.frase,.xsh,.pn,.cats'),function(el){ rv(el,0); });
}
function onScroll(){ document.body.classList.toggle('px-scrolled',(window.scrollY||0)>30); }
addEventListener('scroll',onScroll,{passive:true});
function boot(){ var app=document.getElementById('app'); if(!app) return setTimeout(boot,50);
  var t=0; new MutationObserver(function(){ clearTimeout(t); t=setTimeout(decorate,20); }).observe(app,{childList:true});
  addEventListener('hashchange',function(){ setTimeout(decorate,0); });
  decorate(); onScroll(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
