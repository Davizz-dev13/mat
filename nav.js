/* M.A.T · cabecera: desplegables «Juegos ▾» y «Secciones ▾» (aprobados por Jose, 6 nov 2026).
   Las listas salen de los datos de la web: juegos de app.js (MAT_GAMES), secciones de las tarjetas de app.js (MAT_SECTILES)
   en el orden y con las fotos de portada.js (MAT_PORTADA). Se cierran al pinchar fuera, con Esc y al cambiar de ruta. */
(function(){
"use strict";
function EN(){ return window.MAT_LANG==='en'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
var TX={es:{j:'Juegos',s:'Secciones',all:'Ver todos ›',news:'Noticias y archivo',cmp:'Comparar fichas',nw:'NUEVO',soon:'PRÓXIMAMENTE',reto:'Reto M.A.T',retod:'Adivina el sistema secreto de hoy',fz:'Países y facciones',jl:'Abrir el menú de juegos',sl:'Abrir el menú de secciones',feat:'Destacado',play:'Jugar ›',open:'Abrir ›',alls:'Ver todas ›',radd:'Aviones militares en el aire ahora mismo, en el mapa y en directo'},
        en:{j:'Games',s:'Sections',all:'All games ›',news:'News and archive',cmp:'Compare entries',nw:'NEW',soon:'COMING SOON',reto:'M.A.T Challenge',retod:'Guess today’s secret system',fz:'Countries and factions',jl:'Open the games menu',sl:'Open the sections menu',feat:'Featured',play:'Play ›',open:'Open ›',alls:'All sections ›',radd:'Military aircraft in the air right now, live on the map'}};
function t(k){ return TX[EN()?'en':'es'][k]; }
// Títulos EN de las secciones cuya tarjeta solo está en español (las demás ya traen su EN en app.js).
var SEN={'#/mapa':'World map','#/guerras':'Wars today','#/exterior':'Spain abroad','#/gasto':'Military expenditure by country','#/fyse':'National Police & Civil Guard','#/onu':'UN · United Nations','#/debate':'Debate & feedback','#/fuerzas':'Countries and factions','#/radar':'Air radar','#/modelos-3d':'3D models','#/batallas':'Battles & special operations','#/inteligencia':'Intelligence services','#/ceuta-melilla':'Ceuta and Melilla'};
var DEF_ORDER=['#/mapa','#/batallas','#/guerras','#/radar','#/modelos-3d','#/exterior','#/gasto','#/fyse','#/inteligencia','#/ceuta-melilla','#/onu','#/debate'];
var ICO_NEWS='<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><rect x="7" y="9" width="30" height="32" rx="2" fill="none" stroke="#b3bd8c" stroke-width="2.4"/><path d="M12 18h20M12 25h20M12 32h12" stroke="#8f9a6a" stroke-width="2.2"/></svg>';
var ICO_CMP='<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 7h11M11 3l4 4-4 4M20 17H9M13 13l-4 4 4 4" fill="none" stroke="#b3bd8c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var ICO_RETO='<svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="none" stroke="#d6b25e" stroke-width="2"/><circle cx="20" cy="20" r="9" fill="none" stroke="#d6b25e" stroke-width="2"/><circle cx="20" cy="20" r="3" fill="#d6b25e"/></svg>';
var FLAGS='<span class="thf" aria-hidden="true"><img src="flags/es.png" alt=""><img src="flags/us.png" alt=""><img src="flags/fr.png" alt=""><img src="flags/gb.png" alt=""></span>';

function railHTML(cards){ return '<div class="railw"><button type="button" class="rl rl-p" aria-label="‹" tabindex="-1">‹</button><div class="rail">'+cards+'</div><button type="button" class="rl rl-n" aria-label="›" tabindex="-1">›</button></div>'; }
function featHTML(h,img,k,tt,ds,go){ return '<a class="ddfe" href="'+h+'"><span class="fi"'+(img?' style="background-image:url('+img+')"':'')+'></span><span class="ft"><span class="k">'+esc(k)+'</span><b>'+esc(tt)+'</b>'+(ds?'<span class="ds">'+esc(ds)+'</span>':'')+'<span class="go">'+esc(go)+'</span></span></a>'; }
var FEAT_J='#/soldado/combate', FEAT_S='#/radar';
/* Foto de «Países y facciones» (Jose, 7 nov: fuera el collage de banderas): foto de una ficha del sitio. */
var FZ_IMG='img/sec_fuerzas.webp';
function gamesHTML(){
  var G=window.MAT_GAMES?window.MAT_GAMES():null, h='', f=null;
  var list=G?G.list:[['#/armero','armero','Armero 3D','3D Gunsmith'],['#/soldado','soldado','Crea tu soldado','Build your soldier'],['#/soldado/combate','combate','Combate','Fight'],['#/duelo','duelo','Duelo','Duel'],['#/antidisturbios','antidisturbios','Antidisturbios','Riot control'],['#/negociador','negociador','Negociador','Negotiator'],['#/guerra-nuclear','nuclear','Guerra nuclear','Nuclear war'],['#/ejercito','ejercito','Crea tu ejército','Build your army']].map(function(g){ return [g[0],g[1],EN()?g[3]:g[2],'']; });
  list.forEach(function(g){
    if(g[0]===FEAT_J&&!f){ f=g; return; }
    var th='<span class="ri" style="background-image:url(img/juegos/'+g[1]+'.webp)"></span>';
    if(G&&G.soon&&g[0]==='#/duelo') h+='<span class="rc off" aria-disabled="true">'+th+'<span class="rt">'+esc(g[2])+'</span><span class="nw sn">'+t('soon')+'</span></span>';
    else h+='<a class="rc" href="'+g[0]+'">'+th+'<span class="rt">'+esc(g[2])+'</span></a>'; });
  if(!G||G.reto) h+='<a class="rc" href="#/reto"><span class="ri thr">'+ICO_RETO+'</span><span class="rt">'+t('reto')+'</span><span class="nw">'+t('nw')+'</span></a>';
  var fe=f?featHTML(f[0],'img/juegos/'+f[1]+'.webp',t('feat'),f[2],f[3],t('play')):'';
  return '<div class="ddh"><span>'+t('j')+'</span><a href="#/juegos">'+t('all')+'</a></div><div class="mm">'+fe+'<div class="mmg">'+h+'</div></div>';
}
function secItems(){
  var by={}, DS={}, P=window.MAT_PORTADA||{}, ORDER=P.ORDER||DEF_ORDER, PH=P.PH||{}, BIG=P.BIG||{};
  if(window.MAT_SECTILES){ var d=document.createElement('div'); d.innerHTML=window.MAT_SECTILES();
    [].slice.call(d.querySelectorAll('a[href]')).forEach(function(a){ var k=a.getAttribute('href'), te=a.querySelector('.t'); if(!te||k==='#/noticias') return; by[k]=te.textContent.trim(); var de=a.querySelector('.d'); if(de) DS[k]=de.textContent.trim(); }); }
  else ORDER.forEach(function(k){ by[k]=null; });
  by['#/debate']=EN()?'Debate & feedback':'Debate y feedback';
  if(by['#/radar']==='Radar aéreo'||by['#/radar']==null) by['#/radar']=EN()?'Air radar':'Radar aéreo';
  var keys=ORDER.filter(function(k){ return k in by; }).concat(Object.keys(by).filter(function(k){ return ORDER.indexOf(k)<0; }));
  if(window.MAT_FUERZAS!==false){ keys.splice(Math.min(1,keys.length),0,'#/fuerzas'); by['#/fuerzas']=t('fz'); }
  return keys.map(function(k){ var tt=by[k]; if(EN()&&SEN[k]) tt=SEN[k]; if(!tt) tt=k.slice(2);
    return {h:k,t:tt,img:k==='#/fuerzas'?FZ_IMG:(PH[k]||BIG[k]||''),d:(EN()&&SEN[k])?'':(DS[k]||'')}; });
}
function secHTML(){
  var L=secItems(), f=null, h='';
  L.forEach(function(s){ if(s.h===FEAT_S&&!f){ f=s; return; }
    var th='<span class="ri"'+(s.img?' style="background-image:url('+s.img+')"':'')+'></span>';
    h+='<a class="rc" href="'+s.h+'">'+th+'<span class="rt">'+esc(s.t)+'</span></a>'; });
  var fe=f?featHTML(f.h,f.img,t('feat'),f.t,EN()?t('radd'):(f.d||t('radd')),t('open')):'';
  return '<div class="ddh"><span>'+t('s')+'</span><a href="#/secciones">'+t('alls')+'</a></div><div class="mm">'+fe+'<div class="mmg">'+h+'</div></div><div class="ddf"><a href="#/noticias">'+ICO_NEWS+'<span>'+t('news')+'</span></a><a href="#/comparar">'+ICO_CMP+'<span>'+t('cmp')+'</span></a></div>';
}
/* Fila deslizable: arrastrar con el ratón (PC), flechas ‹ ›, y en el móvil el dedo (scroll-snap). */
function railState(r){ var w=r.parentNode; if(!w||!w.classList||!w.classList.contains('railw')) return; var mx=r.scrollWidth-r.clientWidth-2; w.classList.toggle('at0',r.scrollLeft<=2); w.classList.toggle('atE',r.scrollLeft>=mx); }
var DRG=null;
document.addEventListener('pointerdown',function(e){ var r=e.target.closest&&e.target.closest('.rail'); if(!r||e.pointerType!=='mouse'||e.button!==0) return; DRG={r:r,x:e.clientX,s:r.scrollLeft,m:false}; },true);
document.addEventListener('pointermove',function(e){ if(!DRG) return; var dx=e.clientX-DRG.x; if(!DRG.m&&Math.abs(dx)>6){ DRG.m=true; DRG.r.classList.add('drag'); } if(DRG.m){ DRG.r.scrollLeft=DRG.s-dx; e.preventDefault(); } },true);
document.addEventListener('pointerup',function(){ if(!DRG) return; var d=DRG; DRG=null; if(d.m){ d.r.classList.remove('drag'); d.r.setAttribute('data-dragged','1'); setTimeout(function(){ d.r.removeAttribute('data-dragged'); },0); railState(d.r); } },true);
document.addEventListener('click',function(e){ var r=e.target.closest&&e.target.closest('.rail'); if(r&&r.getAttribute('data-dragged')){ e.preventDefault(); e.stopPropagation(); return; }
  var b=e.target.closest&&e.target.closest('.rl'); if(!b) return; e.preventDefault(); var rr=b.parentNode.querySelector('.rail'); if(!rr) return; var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(_){}
  rr.scrollBy({left:(b.classList.contains('rl-p')?-1:1)*Math.max(160,rr.clientWidth*.8),behavior:RM?'auto':'smooth'}); setTimeout(function(){ railState(rr); },450); },true);
document.addEventListener('scroll',function(e){ var r=e.target; if(r&&r.classList&&r.classList.contains('rail')) railState(r); },true);
document.addEventListener('dragstart',function(e){ if(e.target.closest&&e.target.closest('.rail')) e.preventDefault(); },true);
window.MAT_RAIL=railState; window.MAT_SECITEMS=function(){ return secItems(); };
var top=null, dim=null, DDS=[];
function panel(dd){ return dd.querySelector('.ddp'); }
function btn(dd){ return dd.querySelector('.ddb'); }
function links(dd){ return [].slice.call(panel(dd).querySelectorAll('a[href]')); }
function build(dd){ var p=panel(dd), k=(EN()?'en':'es')+(window.MAT_GAMES?1:0)+(window.MAT_SECTILES?1:0)+(window.MAT_PORTADA?1:0);
  if(p.getAttribute('data-k')===k) return; p.innerHTML=dd.id==='ddj'?gamesHTML():secHTML(); p.setAttribute('data-k',k); }
function place(dd){ var p=panel(dd), b=Math.max(0,top.getBoundingClientRect().bottom); p.style.top=Math.round(b)+'px'; p.style.maxHeight='calc(100vh - '+Math.round(b)+'px)'; }
function isOpen(dd){ return dd.classList.contains('open'); }
function close(dd,refocus){ if(!isOpen(dd)) return; dd.classList.remove('open'); btn(dd).setAttribute('aria-expanded','false'); panel(dd).hidden=true; if(refocus) btn(dd).focus(); if(!DDS.some(isOpen)) document.body.classList.remove('ddopen'); }
function closeAll(except){ DDS.forEach(function(d){ if(d!==except) close(d,false); }); }
function open(dd,focusFirst){ closeAll(dd); build(dd); dd.classList.add('open'); btn(dd).setAttribute('aria-expanded','true'); panel(dd).hidden=false; place(dd); [].forEach.call(panel(dd).querySelectorAll('.rail'),function(r){ r.scrollLeft=0; railState(r); }); document.body.classList.add('ddopen');
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
