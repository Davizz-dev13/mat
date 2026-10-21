(function(){
"use strict";
// M.A.T · orden: secciones plegables (cerradas por defecto, recuerdan su estado en la sesión) y portada compacta.
var EN=function(){return window.MAT_LANG==='en';};
var app=document.getElementById('app'); if(!app) return;
var KEY='mat_fold';
function mem(){ try{return JSON.parse(sessionStorage.getItem(KEY)||'{}');}catch(e){return {};} }
function memSet(k,v){ try{var m=mem(); m[k]=v?1:0; sessionStorage.setItem(KEY,JSON.stringify(m));}catch(e){} }
function parts(){ var h=location.hash.replace(/^#\/?/,''), path=h.split('?')[0]; return {p:path.split('/').filter(Boolean), q:h.indexOf('?')>=0?h.slice(h.indexOf('?')+1):''}; }
function norm(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
var ITEM='.row,.fzrow,.sp,li,.gwcard,.chgi,.fzhlr,details.fzcat,.gsc,.gsrow,.nw-item';
function countIn(nodes){ var n=0; nodes.forEach(function(el){ if(el.nodeType!==1) return; if(el.matches(ITEM)) { n++; return; } var all=el.querySelectorAll(ITEM); for(var i=0;i<all.length;i++){ var a=all[i], up=a.parentElement, nested=false; while(up&&up!==el){ if(up.matches(ITEM)){nested=true;break;} up=up.parentElement; } if(!nested) n++; } }); return n; }
function hasMap(nodes){ return nodes.some(function(el){ return el.nodeType===1&&(el.matches('.leaflet-container,canvas')||el.querySelector('.leaflet-container,canvas')); }); }
function mk(type,titleEl,nodes,openDefault,cls){
  var key=type+'|'+norm(titleEl.textContent).replace(/\s*\d+\s*$/,'').slice(0,80);
  var m=mem(), open=(key in m)?!!m[key]:!!openDefault;
  var d=document.createElement('details'); d.className='fold'+(cls?' '+cls:''); if(open) d.open=true; d.setAttribute('data-fk',key);
  var s=document.createElement('summary'); var t=document.createElement('span'); t.className='ft'; s.appendChild(t);
  var c=countIn(nodes); 
  var b=document.createElement('div'); b.className='fb';
  titleEl.parentNode.insertBefore(d,titleEl); t.appendChild(titleEl);
  if(c>0){ var cn=document.createElement('span'); cn.className='fc'; cn.textContent=c; s.appendChild(cn); }
  var ch=document.createElement('span'); ch.className='fch'; ch.setAttribute('aria-hidden','true'); s.appendChild(ch);
  d.appendChild(s); d.appendChild(b); nodes.forEach(function(n){ b.appendChild(n); });
  d.addEventListener('toggle',function(){ memSet(key,d.open); if(d.open) setTimeout(function(){ try{window.dispatchEvent(new Event('resize'));}catch(e){} },30); });
  return d;
}
var STOP='.btns:not(.fold .btns),footer,.fold,.fzchgw,.gsbox,.cover';
function foldH2(type,opts){
  opts=opts||{}; var hs=[].slice.call(app.querySelectorAll('h2')).filter(function(h){ return !h.closest('summary')&&!h.closest('.fold')&&!h.closest('[data-nofold]')&&!h.closest('.cover'); });
  var first=true;
  hs.forEach(function(h){ var nodes=[], n=h.nextSibling;
    while(n){ if(n.nodeType===1&&(n.tagName==='H2'||(n.matches&&n.matches(STOP)&&!(opts.keepStop&&n.matches(opts.keepStop))))) break; var nx=n.nextSibling; nodes.push(n); n=nx; }
    if(!nodes.filter(function(x){return x.nodeType===1;}).length) return;
    if(hasMap(nodes)) return;
    mk(type,h,nodes,opts.firstOpen&&first,null); first=false; });
}
function foldBoxes(type){ [].slice.call(app.querySelectorAll('.fzchgw,.gsbox')).forEach(function(bx){ if(bx.closest('.fold')||bx.closest('.fb')&&bx.closest('.fb')!==bx.parentElement) {} if(bx.parentElement&&bx.parentElement.classList.contains('fb')) return; var h=bx.querySelector('h3'); if(!h) return; var t=document.createElement('h2'); t.textContent=norm(h.textContent); h.style.display='none'; bx.parentNode.insertBefore(t,bx); mk(type,t,[bx],false,'fbox'); }); }
function closeDetails(type,sel){ [].slice.call(app.querySelectorAll(sel)).forEach(function(d){ if(d.hasAttribute('data-fk')) return; var s=d.querySelector('summary'); var key=type+'|d|'+norm(s?s.textContent:'').replace(/\d+/g,'').slice(0,60); d.setAttribute('data-fk',key); var m=mem(); d.open=(key in m)?!!m[key]:false; d.addEventListener('toggle',function(){memSet(key,d.open);}); }); }
function clampLead(){ var l=app.querySelector('p.lead'); if(!l||l.hasAttribute('data-cl')) return; l.setAttribute('data-cl','1'); if(l.scrollHeight<=l.clientHeight+4&&l.textContent.length<380) { return; } l.classList.add('clamp'); var b=document.createElement('button'); b.type='button'; b.className='more'; b.setAttribute('data-noi18n',''); b.textContent=EN()?'Read more':'Leer más'; b.onclick=function(){ var o=l.classList.toggle('clamp'); b.textContent=o?(EN()?'Read more':'Leer más'):(EN()?'Show less':'Ver menos'); }; l.parentNode.insertBefore(b,l.nextSibling); }

// ---------- portada ----------
var ICO={debate:'<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><path d="M7 10h24a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H17l-7 6v-6H7a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="none" stroke="#b3bd8c" stroke-width="1.7" stroke-linejoin="round"/><path d="M38 18h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-2v5l-6-5H22a3 3 0 0 1-3-3v-1" fill="none" stroke="#8f9a6a" stroke-width="1.5" stroke-linejoin="round"/><path d="M11 17h16M11 22h11" stroke="#d6b25e" stroke-width="1.5" stroke-linecap="round"/></svg>',
 feedback:'<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><rect x="6" y="11" width="36" height="26" rx="3" fill="none" stroke="#b3bd8c" stroke-width="1.7"/><path d="M7 13l17 13 17-13" fill="none" stroke="#d6b25e" stroke-width="1.6" stroke-linejoin="round"/></svg>'};
function tile(href,ico,t,d){ var a=document.createElement('a'); a.className='maptile dtile'; a.href=href; a.setAttribute('data-noi18n',''); a.innerHTML=ico+'<div><div class="t">'+t+'</div><div class="d">'+d+'</div></div><div class="ch" style="margin-left:auto;color:var(--dim);font-size:20px">›</div>'; return a; }
function row(href,t,d){ var a=document.createElement('a'); a.className='row'; a.href=href; a.setAttribute('data-noi18n',''); a.innerHTML='<div class="m"><div class="nm">'+t+'</div><div class="ds">'+d+'</div></div><div class="ch">›</div>'; return a; }
function home(){
  if(app.querySelector('.hgrid')) return; document.body.classList.add('r-home');
  var tiles=[].slice.call(app.children).filter(function(c){ return c.matches('a.maptile,a.newstile'); });
  if(tiles.length){ var g=document.createElement('div'); g.className='hgrid'; tiles[0].parentNode.insertBefore(g,tiles[0]); tiles.forEach(function(t){ g.appendChild(t); });
    g.appendChild(tile('#/debate',ICO.debate,EN()?'Debate':'Debate',EN()?'Posts and replies: share what you think, kindly':'Publica tu opinión y responde a otros, con respeto'));
    g.appendChild(tile('#/feedback',ICO.feedback,EN()?'Feedback':'Feedback',EN()?'Report an error or suggest an idea to the author':'Avisa de un error o propón ideas al autor'));
    var h=document.createElement('h2'); h.className='hsec'; h.textContent=EN()?'Sections':'Secciones'; g.parentNode.insertBefore(h,g); }
  var cats=app.querySelector('.cats'); if(cats){ cats.classList.add('cgrid2'); var h2=document.createElement('h2'); h2.className='hsec'; h2.textContent=EN()?'Categories':'Categorías'; cats.parentNode.insertBefore(h2,cats); }
  var lists=[].slice.call(app.querySelectorAll(':scope > .list')); var acc=lists[lists.length-1];
  if(acc){ acc.classList.add('accgrid'); var seen={}; [].slice.call(app.querySelectorAll('.hgrid a')).forEach(function(a){ seen[a.getAttribute('href')]=1; });
    [].slice.call(acc.querySelectorAll('a.row')).forEach(function(r){ if(seen[r.getAttribute('href')]) r.classList.add('dup'); }); }
}
function footLinks(){ var f=document.querySelector('footer.foot'); if(!f||f.querySelector('.footnav')) return; var d=document.createElement('div'); d.className='footnav'; d.setAttribute('data-noi18n',''); d.innerHTML='<a href="#/debate">Debate</a> · <a href="#/feedback">Feedback</a>'; f.insertBefore(d,f.firstChild); }

var busy=false, last='';
function apply(){
  busy=true; try{
  var P=parts(), p=P.p, k=p[0]||'';
  document.body.classList.toggle('r-home',!p.length);
  if(!p.length){ if(app.querySelector('.cats')) home(); return; }
  if(k==='a'){ if(!app.querySelector('h1')) return; clampLead(); foldH2('a'); }
  else if(k==='fuerzas'){ var isC=/(^|&)a=/.test(P.q); foldBoxes(isC?'fz':'fzl'); foldH2(isC?'fz':'fzl'); [].slice.call(app.querySelectorAll('.fold .fb > .list')).forEach(function(l){ if(!isC&&l.querySelectorAll('.row').length>40) l.classList.add('cgrid'); }); }
  else if(k==='gasto'&&p.length===1){ foldBoxes('gasto'); foldH2('gasto',{firstOpen:true}); }
  else if(k==='guerras'&&p.length===1){ foldH2('guerras',{firstOpen:true}); }
  else if(k==='onu'){ closeDetails('onu','details.fzcat'); }
  else if(k==='fyse'){ closeDetails('fyse','details.fzcat'); }
  } catch(e){ if(window.console) console.warn('orden',e); } finally { busy=false; }
}
var tm=null;
var mo=new MutationObserver(function(){ if(busy) return; clearTimeout(tm); tm=setTimeout(apply,40); });
mo.observe(app,{childList:true,subtree:true});
window.addEventListener('hashchange',function(){ clearTimeout(tm); tm=setTimeout(apply,40); });
footLinks(); setTimeout(apply,0);
window.MAT_ORDEN={apply:apply};
})();
