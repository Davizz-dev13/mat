(function(){
"use strict";
// M.A.T · Ceuta y Melilla en 3D (#/ceuta-melilla, #/ceuta-melilla/melilla). Datos: cym.json (eventos con fecha, texto propio neutral y fuente),
// relieve cym_<ciudad>.bin.gz (DEM libre) + textura cym_<ciudad>.jpg. El motor 3D (cym3d.js + three.js) solo se carga en esta ruta; si no hay WebGL, vista 2D.
var DP=null, D=null, V3=null, CUR=null, HM={};
function V(){ var s=document.querySelector('script[data-v]'); return (s&&s.getAttribute('data-v'))||'1'; }
function EN(){ return window.MAT_LANG==='en'; }
function T(a){ return Array.isArray(a)?(EN()?(a[1]!=null?a[1]:a[0]):a[0]):(a==null?'':a); }
function e(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function load(){ if(DP) return DP; DP=fetch('cym.json?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }).then(function(d){ D=d; return d; }); DP.catch(function(){ DP=null; }); return DP; }
function hmap(k){ if(HM[k]) return HM[k]; HM[k]=fetch('cym_'+k+'.bin.gz?v='+V()).then(function(r){ if(!r.ok) throw new Error(r.status); return new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer(); }).then(function(b){ return new Uint16Array(b); }); HM[k].catch(function(){ HM[k]=null; }); return HM[k]; }
function webgl(){ try{ var c=document.createElement('canvas'); return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl'))); }catch(x){ return false; } }
function kill(){ if(CUR){ try{ CUR.dispose(); }catch(x){} CUR=null; } }
window.addEventListener('hashchange',function(){ if(!/^#\/ceuta-melilla/.test(location.hash)) kill(); });
var ICON='<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" style="flex:0 0 48px"><path d="M4 36l9-12 7 6 8-14 8 9 8-7v18z" fill="none" stroke="#b3bd8c" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 30l8-14" stroke="#ff6a55" stroke-width="2.2"/><circle cx="28" cy="16" r="2.4" fill="#d6b25e"/><path d="M4 40h40" stroke="#6b7177" stroke-width="1.4"/></svg>';
window.MAT_CYM_ICON=ICON;
var MES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
window.MAT_CYM=function(app,X){
  var p=X.p||[], city=(p[1]==='melilla')?'melilla':'ceuta', en=EN();
  var L=en?{h:'Ceuta and Melilla in 3D',home:'Home',sub:'The real terrain of both cities with the border with Morocco (in red), the border crossings and the most important events, past and present. Rotate with one finger, zoom and move with two.',
      rot:'Drag to rotate · pinch to zoom',reset:'Reset view',ex:'Relief',v3:'3D',v2:'2D',ev:'Key events',pasos:'Border crossings',src:'Sources',cred:'Credits',load:'Loading 3D terrain…',err:'Could not load the data. Check your connection and try again.',
      no3d:'3D is not available on this device, showing the 2D map.',leg:[['es','Spanish territory'],['ma','Morocco'],['b','Border fence'],['ev','Event'],['ps','Crossing']],intro:'Ceuta and Melilla are Spanish autonomous cities in North Africa; Morocco claims sovereignty over them.',rev:'Reviewed',see:'See on the map',ap:'approx. position'}
    :{h:'Ceuta y Melilla en 3D',home:'Inicio',sub:'El relieve real de las dos ciudades con la frontera con Marruecos (en rojo), los pasos fronterizos y los sucesos más importantes que han pasado y están pasando. Gira con un dedo, acerca y mueve con dos.',
      rot:'Arrastra para girar · pellizca para acercar',reset:'Vista inicial',ex:'Relieve',v3:'3D',v2:'2D',ev:'Sucesos clave',pasos:'Pasos fronterizos',src:'Fuentes',cred:'Créditos',load:'Cargando el relieve 3D…',err:'No se pudieron cargar los datos. Comprueba la conexión y vuelve a intentarlo.',
      no3d:'El 3D no está disponible en este dispositivo; se muestra el mapa 2D.',leg:[['es','Territorio español'],['ma','Marruecos'],['b','Valla fronteriza'],['ev','Suceso'],['ps','Paso']],intro:'Ceuta y Melilla son ciudades autónomas españolas en el norte de África; Marruecos reivindica su soberanía.',rev:'Revisado',see:'Ver en el mapa',ap:'posición aproximada'};
  kill();
  X.set(X.crumbs([[L.home,'#/'],[L.h]])+'<div data-nofold data-noi18n class="cym"><h1>'+L.h+'</h1><p class="sub">'+L.sub+'</p><p class="sub">'+L.load+'</p></div>',L.h);
  load().then(function(DD){
    var C=DD.city[city], evs=DD.ev.filter(function(x){ return x.c===city; }).sort(function(a,b){ return a.s<b.s?-1:1; }), ps=DD.pasos.filter(function(x){ return x.c===city; });
    evs.forEach(function(x,i){ x.id='e'+i; x.num=i+1; }); ps.forEach(function(x,i){ x.id='p'+i; });
    var h=X.crumbs([[L.home,'#/'],[L.h]])+'<div data-nofold data-noi18n class="cym"><h1>'+L.h+'</h1><p class="sub">'+L.sub+'</p>'+
      '<div class="cym-tabs" role="tablist">'+['ceuta','melilla'].map(function(k){ return '<a role="tab" href="#/ceuta-melilla'+(k==='melilla'?'/melilla':'')+'" class="cym-tab'+(k===city?' on':'')+'">'+T(DD.city[k].n)+'</a>'; }).join('')+'</div>'+
      '<p class="cym-f">'+e(T(C.f))+'</p>'+
      '<div class="cym-view" id="cymv"><div class="cym-msg" id="cymmsg">'+L.load+'</div></div>'+
      '<div class="cym-ctl"><button type="button" class="cym-b" id="cymreset">⟲ '+L.reset+'</button><label class="cym-ex">'+L.ex+' <input type="range" id="cymex" min="1" max="3" step="0.1" value="1.6"></label><button type="button" class="cym-b" id="cym2d">'+L.v2+'</button></div>'+
      '<p class="cym-hint">'+L.rot+'</p>'+
      '<div class="cym-leg">'+L.leg.map(function(l){ return '<span><i class="cym-k '+l[0]+'"></i>'+l[1]+'</span>'; }).join('')+'</div>'+
      '<div class="cym-card" id="cymcard" hidden></div>'+
      '<h2>'+L.ev+'</h2><div class="cym-evs">'+evs.map(function(x){ return '<div class="cym-ev" id="cym-'+x.id+'"><button type="button" class="cym-n k-'+x.k+'" data-id="'+x.id+'" aria-label="'+L.see+'">'+x.num+'</button><div class="cym-eb"><div class="cym-d">'+e(T(x.d))+'</div><div class="cym-t">'+e(T(x.n))+'</div><div class="cym-x">'+e(T(x.t))+'</div><div class="cym-s">'+L.src+': '+x.src.map(function(s){ return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>'; }).join(' · ')+'</div></div></div>'; }).join('')+'</div>'+
      '<h2>'+L.pasos+'</h2><div class="cym-evs">'+ps.map(function(x){ return '<div class="cym-ev"><button type="button" class="cym-n ps" data-id="'+x.id+'" aria-label="'+L.see+'">◆</button><div class="cym-eb"><div class="cym-t">'+e(T(x.n))+'</div><div class="cym-x">'+e(T(x.t))+'</div></div></div>'; }).join('')+'</div>'+
      '<p class="cym-intro">'+L.intro+' '+L.src+': '+C.src.map(function(s){ return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>'; }).join(' · ')+'</p>'+
      '<div class="cym-cred"><b>'+L.cred+'</b><br>'+DD.cred[en?'en':'es'].map(e).join('<br>')+'</div><p class="cym-rev">'+L.rev+': '+e(DD.rev)+'</p></div>';
    X.set(h,L.h+' · '+T(C.n));
    var view=document.getElementById('cymv'), msg=document.getElementById('cymmsg'), card=document.getElementById('cymcard'), mode='3d';
    var ALL={}; evs.forEach(function(x){ ALL[x.id]=x; }); ps.forEach(function(x){ ALL[x.id]=x; });
    function show(id,fly){ var x=ALL[id]; if(!x) return; card.hidden=false;
      card.innerHTML='<button type="button" class="cym-close" aria-label="×">×</button>'+(x.d?'<div class="cym-d">'+e(T(x.d))+'</div>':'')+'<div class="cym-t">'+(x.num?x.num+'. ':'')+e(T(x.n))+'</div><div class="cym-x">'+e(T(x.t))+'</div>'+(x.src?'<div class="cym-s">'+L.src+': '+x.src.map(function(s){ return '<a href="'+e(s[1])+'" target="_blank" rel="noopener">'+e(s[0])+'</a>'; }).join(' · ')+'</div>':'')+(x.num?'<div class="cym-s">'+L.ap+'</div>':'');
      card.querySelector('.cym-close').onclick=function(){ card.hidden=true; if(CUR&&CUR.select) CUR.select(null); [].forEach.call(view.querySelectorAll('.cym-pin2'),function(q){ q.classList.remove('on'); }); };
      if(CUR&&CUR.select) CUR.select(id); [].forEach.call(view.querySelectorAll('.cym-pin2'),function(q){ q.classList.toggle('on',q.getAttribute('data-id')===id); });
      if(fly&&CUR&&CUR.focus) CUR.focus(x.ll); }
    [].forEach.call(app.querySelectorAll('.cym-n'),function(bn){ bn.onclick=function(){ var id=bn.getAttribute('data-id'); show(id,true); view.scrollIntoView({behavior:'smooth',block:'center'}); }; });
    var pins=evs.map(function(x){ return {id:x.id,ll:x.ll,cls:'k-'+x.k,html:String(x.num),label:T(x.n)}; }).concat(ps.map(function(x){ return {id:x.id,ll:x.ll,cls:'ps',html:'◆',label:T(x.n),up:40}; }));
    function two(){ kill(); mode='2d'; var b=C.b, mn=Math.log(Math.tan(Math.PI/4+b.n*Math.PI/360)), ms=Math.log(Math.tan(Math.PI/4+b.s*Math.PI/360));
      view.classList.add('d2'); view.innerHTML='<div class="cym-2d" style="aspect-ratio:'+C.tw+'/'+C.th+'"><img src="cym_'+city+'.jpg?v='+V()+'" alt="'+e(T(C.n))+'">'+pins.map(function(q){ var x=(q.ll[1]-b.w)/(b.e-b.w)*100, y=(mn-Math.log(Math.tan(Math.PI/4+q.ll[0]*Math.PI/360)))/(mn-ms)*100; return '<button type="button" class="cym-pin cym-pin2 '+q.cls+'" data-id="'+q.id+'" style="left:'+x.toFixed(2)+'%;top:'+y.toFixed(2)+'%" aria-label="'+e(q.label)+'">'+q.html+'</button>'; }).join('')+'</div>';
      [].forEach.call(view.querySelectorAll('.cym-pin2'),function(q){ q.onclick=function(){ show(q.getAttribute('data-id'),false); }; });
      var b2=document.getElementById('cym2d'); b2.textContent=L.v3; b2.disabled=!webgl(); document.getElementById('cymreset').disabled=true; document.getElementById('cymex').disabled=true; }
    function three(){ mode='3d'; view.classList.remove('d2'); view.innerHTML='<div class="cym-msg" id="cymmsg">'+L.load+'</div>'; msg=document.getElementById('cymmsg');
      var b2=document.getElementById('cym2d'); b2.textContent=L.v2; document.getElementById('cymreset').disabled=false; document.getElementById('cymex').disabled=false;
      Promise.all([V3||(V3=import('./cym3d.js?v='+V())), hmap(city)]).then(function(z){ if(!document.body.contains(view)||mode!=='3d') return; kill();
        CUR=z[0].mount(view,C,z[1],'cym_'+city+'.jpg?v='+V(),pins,{ex:+document.getElementById('cymex').value,onPin:function(q){ show(q.id,false); },onReady:function(){ if(msg&&msg.parentNode) msg.parentNode.removeChild(msg); },onError:function(){ two(); }});
      }).catch(function(){ V3=null; var m=document.createElement('p'); m.className='cym-hint'; m.textContent=L.no3d; view.parentNode.insertBefore(m,view.nextSibling); two(); }); }
    document.getElementById('cymreset').onclick=function(){ if(CUR) CUR.reset(); };
    document.getElementById('cymex').oninput=function(ev){ if(CUR&&CUR.exag) CUR.exag(+ev.target.value); };
    document.getElementById('cym2d').onclick=function(){ if(mode==='3d') two(); else three(); };
    if(webgl()) three(); else { var m=document.createElement('p'); m.className='cym-hint'; m.textContent=L.no3d; view.parentNode.insertBefore(m,view.nextSibling); two(); }
  }).catch(function(){ X.set(X.crumbs([[L.home,'#/'],[L.h]])+'<p class="sub" style="padding:20px 0">'+L.err+'</p>',L.h); });
};
})();
