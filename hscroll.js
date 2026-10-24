(function(){
"use strict";
// M.A.T · filas de chips desplazables con ratón (ordenador): flechas, rueda y arrastrar. En móvil (táctil) no cambia nada.
var SEL='.mpchips,.chips,.dbtabs,.gw2yrs';
var mq=window.matchMedia?window.matchMedia('(hover: hover) and (pointer: fine)'):null;
function fine(){ return !mq||mq.matches; }
function EN(){ return (window.MAT_LANG||document.documentElement.lang)==='en'; }
var st=document.createElement('style');
st.textContent='.hsw{position:relative;min-width:0;max-width:100%}'
 +'.hsw>.hsa{position:absolute;z-index:3;width:32px;height:32px;margin-top:-16px;display:flex;align-items:center;justify-content:center;padding:0;border-radius:50%;border:1px solid #d6b25e;background:rgba(17,22,27,.96);color:#d6b25e;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.55);opacity:0;pointer-events:none;transition:opacity .15s,background .15s;font:inherit}'
 +'.hsw>.hsa.on{opacity:1;pointer-events:auto}'
 +'.hsw>.hsa:hover,.hsw>.hsa:focus-visible{background:#d6b25e;color:#0b0c0d}'
 +'.hsw>.hsa svg{width:16px;height:16px;display:block}'
 +'.hsw>.hsa.l{left:0}.hsw>.hsa.r{right:0}'
 +'.hsw.fl>.hsr{-webkit-mask-image:linear-gradient(to right,transparent 0,#000 48px);mask-image:linear-gradient(to right,transparent 0,#000 48px)}'
 +'.hsw.fr>.hsr{-webkit-mask-image:linear-gradient(to left,transparent 0,#000 48px);mask-image:linear-gradient(to left,transparent 0,#000 48px)}'
 +'.hsw.fl.fr>.hsr{-webkit-mask-image:linear-gradient(to right,transparent 0,#000 48px,#000 calc(100% - 48px),transparent 100%);mask-image:linear-gradient(to right,transparent 0,#000 48px,#000 calc(100% - 48px),transparent 100%)}'
 +'.hsr.hsd{cursor:grabbing;user-select:none;-webkit-user-select:none}.hsr.hsd *{cursor:grabbing}'
 +'.cr-more>.hsw>.chips{margin-top:6px}'
 +'.hsw>.hsall{display:block;margin:-2px 0 8px auto;padding:3px 2px;background:none;border:0;color:#d6b25e;font:inherit;font-size:12px;letter-spacing:.06em;cursor:pointer}'
 +'.hsw>.hsall:hover,.hsw>.hsall:focus-visible{text-decoration:underline}'
 +'.hsw.hsx>.hsr{flex-wrap:wrap;overflow-x:hidden;overflow-y:auto;max-height:min(50vh,340px);-webkit-mask-image:none;mask-image:none;cursor:auto}'
 +'.hsw.hsx>.hsa{display:none}';
document.head.appendChild(st);
var CH='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var CR='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function upd(r){
  var w=r.__hsw; if(!w) return;
  if(!w.isConnected||!r.isConnected) return;
  var X=w.classList.contains('hsx'), max=r.scrollWidth-r.clientWidth, x=r.scrollLeft, L=!X&&max>2&&x>2, R=!X&&max>2&&x<max-2;
  if(w.__a){ var n=r.querySelectorAll('.chip:not(.mpnew)').length||r.querySelectorAll('button,a').length; w.__a.textContent=X?(EN()?'Show less \u25B4':'Ver menos \u25B4'):(EN()?'See all ('+n+') \u25BE':'Ver todas ('+n+') \u25BE'); w.__a.setAttribute('aria-expanded',X?'true':'false'); }
  w.__l.classList.toggle('on',L); w.__r.classList.toggle('on',R);
  w.classList.toggle('fl',L); w.classList.toggle('fr',R);
  var y=r.offsetTop+r.offsetHeight/2-(parseFloat(getComputedStyle(r).paddingBottom)||0)/2+(parseFloat(getComputedStyle(r).paddingTop)||0)/2;
  w.__l.style.top=w.__r.style.top=y+'px';
  w.__l.setAttribute('aria-label',EN()?'Scroll left':'Desplazar a la izquierda');
  w.__r.setAttribute('aria-label',EN()?'Scroll right':'Desplazar a la derecha');
}
function step(r,d){ var n=Math.max(120,Math.round(r.clientWidth*0.75)); try{ r.scrollBy({left:d*n,behavior:'smooth'}); }catch(e){ r.scrollLeft+=d*n; } }
function btn(cls,html,r,d){
  var b=document.createElement('button'); b.type='button'; b.className='hsa '+cls; b.innerHTML=html; b.setAttribute('data-noi18n',''); b.tabIndex=-1;
  b.addEventListener('click',function(e){ e.preventDefault(); e.stopPropagation(); step(r,d); });
  return b;
}
function enhance(r){
  if(r.__hsdone) return;
  var cs=getComputedStyle(r); if(!/auto|scroll/.test(cs.overflowX)) return;
  if(r.scrollWidth-r.clientWidth<=2) return;          // solo si de verdad se sale
  r.__hsdone=1;
  var p=r.parentNode, w=document.createElement('div'); w.className='hsw';
  var pd=p&&getComputedStyle(p).display;
  if(pd&&/flex|grid/.test(pd)){ w.style.flex=cs.flexGrow+' '+cs.flexShrink+' '+cs.flexBasis; w.style.alignSelf=cs.alignSelf; if(cs.order!=='0') w.style.order=cs.order; }
  p.insertBefore(w,r); w.appendChild(r); r.classList.add('hsr'); r.__hsw=w;
  w.__l=btn('l',CH,r,-1); w.__r=btn('r',CR,r,1); w.appendChild(w.__l); w.appendChild(w.__r);
  if(r.scrollWidth>3*r.clientWidth){   // filas muy largas (p. ej. las facciones del mapa): opción de verlas todas de golpe
    var a=document.createElement('button'); a.type='button'; a.className='hsall'; a.setAttribute('data-noi18n','');
    a.addEventListener('click',function(e){ e.preventDefault(); var X=w.classList.toggle('hsx'); r.scrollLeft=0; r.scrollTop=0; upd(r); });
    w.__a=a; w.appendChild(a);
  }
  r.addEventListener('scroll',function(){ upd(r); },{passive:true});
  // rueda vertical -> horizontal (solo mientras la fila pueda moverse en ese sentido)
  r.addEventListener('wheel',function(e){
    if(!fine()||e.ctrlKey||w.classList.contains('hsx')) return;
    var dy=e.deltaY, dx=e.deltaX; if(Math.abs(dx)>=Math.abs(dy)||!dy) return;
    if(e.deltaMode===1) dy*=16; else if(e.deltaMode===2) dy*=r.clientWidth;
    var max=r.scrollWidth-r.clientWidth;
    if((dy<0&&r.scrollLeft<=0)||(dy>0&&r.scrollLeft>=max-1)) return;
    e.preventDefault(); r.scrollLeft+=dy;
  },{passive:false});
  // arrastrar con el ratón
  var down=null, moved=false, sup=false;
  r.addEventListener('dragstart',function(e){ if(fine()) e.preventDefault(); });
  r.addEventListener('pointerdown',function(e){
    if(e.pointerType!=='mouse'||e.button!==0||w.classList.contains('hsx')) return;
    down={x:e.clientX,s:r.scrollLeft,id:e.pointerId}; moved=false;
  });
  r.addEventListener('pointermove',function(e){
    if(!down||e.pointerId!==down.id) return;
    var dx=e.clientX-down.x;
    if(!moved&&Math.abs(dx)>6){ moved=true; r.classList.add('hsd'); try{ r.setPointerCapture(down.id); }catch(_){} }
    if(moved){ r.scrollLeft=down.s-dx; e.preventDefault(); }
  });
  function end(){ if(!down) return; if(moved){ sup=true; setTimeout(function(){ sup=false; },0); } down=null; moved=false; r.classList.remove('hsd'); }
  r.addEventListener('pointerup',end); r.addEventListener('pointercancel',end); r.addEventListener('lostpointercapture',end);
  r.addEventListener('click',function(e){ if(sup){ e.preventDefault(); e.stopPropagation(); sup=false; } },true);
  if(window.ResizeObserver){ try{ new ResizeObserver(function(){ upd(r); }).observe(r); }catch(_){} }
  upd(r);
}
var pend=0;
function scan(){ pend=0; if(!fine()) return; var a=document.querySelectorAll(SEL); for(var i=0;i<a.length;i++){ var r=a[i]; if(r.__hsdone) upd(r); else enhance(r); } }
function soon(){ if(!pend) pend=setTimeout(scan,120); }
function start(){
  scan();
  try{ new MutationObserver(soon).observe(document.body,{childList:true,subtree:true}); }catch(_){}
  window.addEventListener('resize',soon); window.addEventListener('hashchange',soon); window.addEventListener('load',soon);
  if(mq&&mq.addEventListener) mq.addEventListener('change',soon);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
window.MAT_HSCROLL={scan:scan};
})();
