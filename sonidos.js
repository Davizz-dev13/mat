(function(){
"use strict";
// M.A.T · sonidos reales en las fichas (#/a/<id>). Datos: sonidos.json; audio en snd/ (se carga solo al tocar).
var ARM_SKIP={'g17':'g-glock'}; /* la grabación de la ficha Glock es una Glock 18 en ráfaga: solo se enlaza desde la G18C */
var DATA=null, LOADING=false, AU=null, CUR=null, EN=function(){return window.MAT_LANG==='en';};
var V=(document.currentScript&&document.currentScript.getAttribute('data-v'))||'1';
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function L2(a){if(a==null)return '';if(typeof a==='string')return a;return EN()?(a[1]||a[0]):a[0];}
function css(){ if(document.getElementById('sndcss')) return; var s=document.createElement('style'); s.id='sndcss';
 s.textContent='.sndbox{margin:12px 0 4px;display:flex;flex-direction:column;gap:8px;max-width:520px}'+
 '.sndb{position:relative;overflow:hidden;display:flex;align-items:center;gap:10px;width:100%;min-height:48px;padding:8px 14px;border:1px solid var(--ac,#8f9a6a);border-radius:999px;background:rgba(143,154,106,.14);color:var(--tx,#e9e9e6);font:inherit;font-size:15px;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
 '.sndb:hover{background:rgba(143,154,106,.24)}.sndb .ic{flex:0 0 30px;height:30px;border-radius:50%;background:var(--ac,#8f9a6a);color:#0b0c0d;display:flex;align-items:center;justify-content:center;font-size:15px}'+
 '.sndb .tx{flex:1;min-width:0;line-height:1.25}.sndb .tx b{display:block;font-weight:650}.sndb .tx small{display:block;color:var(--mu,#9aa0a6);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.sndb .du{flex:0 0 auto;color:var(--mu,#9aa0a6);font-size:12.5px;font-variant-numeric:tabular-nums}'+
 '.sndb .pg{position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--ac2,#b3bd8c);transition:width .2s linear}'+
 '.sndb.on{background:rgba(143,154,106,.28)}.sndb.ld .ic{animation:sndp 1s infinite}@keyframes sndp{50%{opacity:.45}}'+
 '.sndcr{font-size:11.5px;color:var(--dim,#6b7177);line-height:1.4;padding:0 6px}.sndcr a{color:var(--mu,#9aa0a6)}';
 document.head.appendChild(s); }
function load(cb){ if(DATA) return cb(); if(LOADING) return; LOADING=true;
 fetch('sonidos.json?v='+V).then(function(r){return r.json();}).then(function(d){DATA=d||{items:{}}; LOADING=false; cb();}).catch(function(){LOADING=false; DATA={items:{}};}); }
function stop(){ if(AU){ try{AU.pause();}catch(e){} } if(CUR){ CUR.classList.remove('on','ld'); var ic=CUR.querySelector('.ic'); if(ic) ic.textContent='\u25B6'; var pg=CUR.querySelector('.pg'); if(pg) pg.style.width='0'; } CUR=null; }
function play(btn){
 if(CUR===btn&&AU&&!AU.paused){ stop(); return; }
 stop(); if(!AU){ AU=new Audio(); AU.preload='none';
   AU.addEventListener('timeupdate',function(){ if(CUR&&AU.duration){ CUR.querySelector('.pg').style.width=(100*AU.currentTime/AU.duration)+'%'; } });
   AU.addEventListener('playing',function(){ if(CUR){ CUR.classList.remove('ld'); CUR.classList.add('on'); CUR.querySelector('.ic').textContent='\u275A\u275A'; } });
   AU.addEventListener('ended',function(){ stop(); });
   AU.addEventListener('error',function(){ if(CUR){ var s=CUR.querySelector('.tx small'); if(s) s.textContent=EN()?'Could not load the audio':'No se pudo cargar el audio'; } stop(); }); }
 CUR=btn; btn.classList.add('ld'); AU.src=btn.getAttribute('data-f')+'?v='+V; var p=AU.play(); if(p&&p.catch) p.catch(function(){ stop(); });
}
function box(id){ var S=DATA&&DATA.items&&DATA.items[id]; if(!S||!S.length) return null; css();
 var d=document.createElement('div'); d.className='sndbox'; d.setAttribute('data-noi18n',''); d.setAttribute('data-sid',id);
 var cr=[];
 d.innerHTML=S.map(function(s,i){ cr.push((S.length>1?(i+1)+'. ':'')+(EN()?'Recording':'Grabación')+': '+esc(L2(s.a))+' · '+(s.lu?'<a href="'+esc(s.lu)+'" target="_blank" rel="noopener">'+esc(L2(s.lic))+'</a>':esc(L2(s.lic)))+' · <a href="'+esc(s.src)+'" target="_blank" rel="noopener">'+(EN()?'source':'fuente')+'</a>');
   return '<button type="button" class="sndb" data-f="'+esc(s.f)+'" aria-label="'+esc((EN()?'Listen: ':'Escuchar: ')+L2(s.l))+'"><span class="ic" aria-hidden="true">\u25B6</span><span class="tx"><b>\uD83D\uDD0A '+(EN()?'Listen':'Escuchar')+'</b><small>'+esc(L2(s.l))+'</small></span>'+(s.d?'<span class="du">'+Math.round(s.d)+' s</span>':'')+'<span class="pg"></span></button>'; }).join('')+
  '<div class="sndcr">'+(EN()?'Real recording (free licence). ':'Grabación real (licencia libre). ')+cr.join(' — ')+'</div>';
 d.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.sndb'); if(b) play(b); });
 return d; }
function inject(){
 var app=document.getElementById('app'); if(!app) return; var h=location.hash||'';
 var m=h.match(/^#\/a\/([^?&#\/]+)/);
 if(m){ var id=decodeURIComponent(m[1]); if(app.querySelector('.sndbox[data-sid="'+id+'"]')) return; var old=app.querySelector('.sndbox'); if(old) old.remove();
   if(!DATA){ load(inject); return; } var h1=app.querySelector('h1'); if(!h1) return; var b=box(id); if(!b) return;
   var t=h1.nextElementSibling; var after=(t&&t.classList&&t.classList.contains('tags'))?t:h1; after.parentNode.insertBefore(b,after.nextSibling); return; }
 var ma=h.match(/^#\/armero\/([^?&#\/]+)/);
 if(ma){ /* Armero 3D: el mismo sonido real de la ficha enlazada (si lo hay), bajo el título */
   var sub=app.querySelector('p.sub'); var fa=sub&&sub.querySelector('a[href^="#/a/"]'); if(!fa) return; var fid=decodeURIComponent(fa.getAttribute('href').slice(4)); if(ARM_SKIP[ma[1]]===fid) return;
   if(app.querySelector('.sndbox[data-sid="'+fid+'"]')) return; var old2=app.querySelector('.sndbox'); if(old2) old2.remove();
   if(!DATA){ load(inject); return; } var b2=box(fid); if(!b2) return; sub.parentNode.insertBefore(b2,sub.nextSibling); return; }
 if(/^#\/license/.test(h)){ var lp=app.querySelector('.licpage'); if(!lp||lp.querySelector('.licsnd')) return; if(!DATA){ load(inject); return; }
   var ids=Object.keys(DATA.items||{}); if(!ids.length) return; var rows=[];
   ids.forEach(function(id){ DATA.items[id].forEach(function(s){ rows.push('<a href="'+esc(s.src)+'" target="_blank" rel="noopener">'+esc(s.t||L2(s.l))+'</a> ('+esc(L2(s.a))+'; '+(s.lu?'<a href="'+esc(s.lu)+'" target="_blank" rel="noopener">'+esc(L2(s.lic))+'</a>':esc(L2(s.lic)))+(s.mod?'; '+(EN()?'trimmed to an excerpt':'recortado a un fragmento'):'')+')'); }); });
   var dv=document.createElement('div'); dv.className='lictxt licthird licsnd';
   dv.innerHTML='<p><b>'+(EN()?'Sounds on the fichas':'Sonidos de las fichas')+'</b></p><p>'+(EN()?'Real recordings, public domain (U.S. Government works) or under free licences, converted to mono MP3 and trimmed: ':'Grabaciones reales, de dominio público (obras del Gobierno de EE. UU.) o con licencia libre, convertidas a MP3 mono y recortadas: ')+rows.join('; ')+'.</p>';
   lp.appendChild(dv); }
}
var t=null; function sch(){ if(t) return; t=setTimeout(function(){t=null; inject();},60); }
window.addEventListener('hashchange',function(){ stop(); sch(); });
function start(){ var app=document.getElementById('app'); if(app) new MutationObserver(sch).observe(app,{childList:true}); sch(); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
window.MAT_SND={stop:stop,data:function(){return DATA;}};
})();
