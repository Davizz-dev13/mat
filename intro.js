/* M.A.T · pantalla de entrada (rediseño nov. 2026, v3): M · A · T gigantes en verde lima sobre una foto real; una «burbuja» líquida que
   sigue al cursor (o al dedo) borra las letras y deja ver la MISMA foto en visión nocturna, como el casco/cara de landonorris.com.
   Foto: oficial de rescate de combate de la USAF con gafas de visión nocturna, Bagram (Afganistán), 28 feb. 2018, Tech. Sgt. Gregory Brook,
   U.S. Air Forces Central Command Public Affairs (dominio público, DoD). Graduada en oliva y en fósforo verde por M.A.T. Créditos en #/license.
   Solo en la portada (sin #/ruta), una vez por sesión (sessionStorage mat_in), como la intro anterior. Sin WebGL: canvas 2D + metabolas. */
(function(){
"use strict";
var hp=location.hash.replace(/^#\/?/,'').split('?')[0];
var seen=false; try{seen=sessionStorage.getItem('mat_in')==='1';}catch(e){seen=true;}
if(seen) return;
try{sessionStorage.setItem('mat_in','1');}catch(e){}
if(hp) return; /* enlace directo a una sección: sin intro */
var lm=(location.search+location.hash).match(/[?&]lang=(en|es)\b/), L=lm?lm[1]:null;
if(!L){ try{L=localStorage.getItem('mat_lang');}catch(e){} }
var EN=L==='en';
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var TOUCH=false; try{TOUCH=matchMedia('(hover: none)').matches;}catch(e){}
var DE=document.documentElement; DE.classList.add('mi-on');
var V=((document.currentScript&&document.currentScript.src)||'').match(/[?&]v=(\d+)/); V=V?V[1]:'1';
var E='cubic-bezier(.65,.05,0,1)';
var IW=3840, IH=2766, FX=.43, FY=.36; /* tamaño de la foto y punto focal (cara y gafas) */
var css='@font-face{font-family:"Anton";src:url(fonts/anton.woff2) format("woff2");font-display:swap}'+
'@font-face{font-family:"Mona Sans";src:url(fonts/monasans.woff2) format("woff2");font-weight:200 900;font-display:swap}'+
'html.mi-on,html.mi-on body{overflow:hidden!important}html.mi-on body>*:not(#mi){visibility:hidden}'+
'#mi{position:fixed;inset:0;z-index:1000;overflow:hidden;color:#efeee6;font:15px/1.4 "Mona Sans",system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;-webkit-tap-highlight-color:transparent;'+
 'background:#0b0c09;transition:opacity .75s '+E+',transform .75s '+E+';display:flex;flex-direction:column;touch-action:none}'+
'#mi.out{opacity:0;transform:translateY(-3%);pointer-events:none}#mi.out.rm{transform:none}'+
'#mi .mph{position:absolute;max-width:none;z-index:0;pointer-events:none;user-select:none;opacity:0;transition:opacity 1.2s '+E+'}#mi .mph.ok{opacity:1}'+
'#mi .msh{position:absolute;inset:0;z-index:1;pointer-events:none;background:radial-gradient(120% 90% at 50% 45%,rgba(11,12,9,.25) 0%,rgba(11,12,9,.55) 60%,rgba(8,9,7,.9) 100%),linear-gradient(180deg,rgba(8,9,7,.75) 0%,transparent 22%,transparent 70%,rgba(8,9,7,.9) 100%)}'+
'#mi .mcv{position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none}'+
'#mi .mtop{position:relative;z-index:6;display:flex;justify-content:space-between;align-items:center;padding:max(16px,env(safe-area-inset-top)) 36px 0}'+
'#mi .mk{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#b9bdab;font-weight:600}#mi .mk b{color:#efeee6;font-weight:700;margin-right:10px}'+
'#mi .misk{min-height:44px;min-width:44px;padding:0 18px;background:rgba(11,12,9,.35);border:1px solid rgba(255,255,255,.2);border-radius:999px;color:#d6d9ca;font:600 12px/1 "Mona Sans",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:all .45s '+E+';-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}'+
'#mi .misk:hover,#mi .misk:focus-visible{background:#c8f03c;border-color:#c8f03c;color:#11130c;outline:none}'+
'#mi .mstage{position:relative;z-index:2;flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center;cursor:none}'+
'#mi .mword{position:relative;display:flex;align-items:baseline;justify-content:center;font-family:"Anton",Impact,"Arial Narrow",sans-serif;font-weight:400;font-size:clamp(150px,30vw,440px);line-height:.86;letter-spacing:.01em;user-select:none;-webkit-user-select:none;margin:0;color:#c8f03c;text-shadow:0 10px 60px rgba(0,0,0,.35)}'+
'#mi .ml{display:inline-block;padding:0 .02em;transform:translateY(110%);opacity:0;transition:opacity .75s '+E+',transform .75s '+E+'}'+
'#mi .mdot{color:#efeee6;opacity:0;transition:opacity .75s '+E+' .2s}'+
'#mi.in .ml{transform:none;opacity:1}#mi.in .ml:nth-of-type(3){transition-delay:.06s}#mi.in .ml:nth-of-type(5){transition-delay:.12s}#mi.in .mdot{opacity:.9}'+
'#mi .mhint{position:relative;z-index:6;text-align:center;font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#c3c7b6;height:20px;transition:opacity .6s '+E+'}#mi.used .mhint{opacity:0}'+
'#mi .mhint:before{content:"";display:inline-block;width:8px;height:8px;border-radius:50%;background:#c8f03c;margin-right:10px;vertical-align:1px;animation:mipulse 2s infinite}'+
'@keyframes mipulse{0%{box-shadow:0 0 0 0 rgba(200,240,60,.55)}70%{box-shadow:0 0 0 12px rgba(200,240,60,0)}100%{box-shadow:0 0 0 0 rgba(200,240,60,0)}}'+
'#mi .mbot{position:relative;z-index:6;display:flex;flex-direction:column;align-items:center;gap:14px;padding:14px 24px max(18px,calc(env(safe-area-inset-bottom) + 12px))}'+
'#mi .migo{min-width:210px;min-height:52px;padding:0 28px;border-radius:999px;border:1px solid #c8f03c;background:#c8f03c;color:#11130c;font:700 13px/1 "Mona Sans",system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;opacity:0;transform:translateY(10px);transition:opacity .75s '+E+' .35s,transform .75s '+E+' .35s,background .45s '+E+',color .45s '+E+'}'+
'#mi.in .migo{opacity:1;transform:none}#mi .migo:hover{background:transparent;color:#c8f03c}#mi .migo:focus-visible{outline:2px solid rgba(200,240,60,.6);outline-offset:4px}'+
'#mi .mcred{font-size:10px;line-height:1.4;color:#8a8f7f;text-align:center;max-width:760px}#mi .mcred a{color:#a4a996}'+
'@media (max-width:700px){#mi .mtop{padding:max(12px,env(safe-area-inset-top)) 16px 0}#mi .mk b{display:block;margin:0 0 2px}#mi .mword{font-size:37vw}#mi .mcred{font-size:9px}#mi .mhint{font-size:11px;letter-spacing:.14em}}'+
'@media (prefers-reduced-motion:reduce){#mi,#mi *{transition-duration:.01s!important;transition-delay:0s!important;animation:none!important}}';
var st=document.createElement('style'); st.textContent=css; (document.head||DE).appendChild(st);

var ov,stg,word,cv,ctx,img,imgNV=null,nvOK=false,done=false,inter=false,tAuto=null,raf=0,last=0,t0=0,running=false;
var W=1,H=1,DPR=1,ph={x:0,y:0,w:1,h:1};
var mk,mctx,mdat,GW=0,GH=0,CELL=6;          /* rejilla del campo de metabolas */
var gr,grc,vg=null;                                  /* grano y líneas de barrido del fósforo */
var N=7, B=[], tx=0, ty=0, R0=150, rT=0, rCur=0, spd=0, wander=!RM, pinned=false, lastPX=null, lastPY=null;
function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function pick(w){ return (w*Math.min(window.devicePixelRatio||1,1.5)>1300)?1920:1000; }
function build(){
 if(done) return;
 ov=el('div'); ov.id='mi'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label',EN?'M.A.T, military encyclopedia':'M.A.T, enciclopedia militar'); ov.setAttribute('data-noi18n','');
 var sz=pick(Math.max(innerWidth,innerHeight*IW/IH));
 img=new Image(); img.className='mph'; img.alt=''; img.decoding='async'; img.draggable=false; img.onload=function(){ img.classList.add('ok'); };
 img.src='img/intro_nv/dia_'+sz+'.webp?v='+V; ov.appendChild(img);
 ov.appendChild(el('div','msh'));
 cv=el('canvas','mcv'); cv.setAttribute('aria-hidden','true'); ov.appendChild(cv);
 var top=el('div','mtop','<div class="mk"><b>M.A.T</b>'+(EN?'Military encyclopedia':'Enciclopedia militar')+'</div>');
 ov.appendChild(top);
 stg=el('div','mstage'); word=el('div','mword'); word.setAttribute('aria-hidden','true');
 ['M','A','T'].forEach(function(l,i){ if(i) word.appendChild(el('span','mdot','.')); word.appendChild(el('span','ml',l)); });
 stg.appendChild(word); ov.appendChild(stg);
 ov.appendChild(el('div','mhint',TOUCH?(EN?'Drag your finger · night vision':'Desliza el dedo · visión nocturna'):(EN?'Move the mouse · night vision':'Mueve el ratón · visión nocturna')));
 var bot=el('div','mbot'); var go=el('button','migo',EN?'Enter':'Entrar'); go.type='button'; go.onclick=exit; bot.appendChild(go);
 bot.appendChild(el('div','mcred',(EN?'Photo: U.S. Air Force combat rescue officer with night vision goggles, Bagram (Afghanistan), 2018, Tech. Sgt. Gregory Brook, U.S. Air Forces Central Command (public domain) · ':'Foto: oficial de rescate de combate de la USAF con gafas de visión nocturna, Bagram (Afganistán), 2018, Tech. Sgt. Gregory Brook, U.S. Air Forces Central Command (dominio público) · ')+'<a href="#/license">'+(EN?'Credits':'Créditos')+'</a>'));
 ov.appendChild(bot);
 document.body.appendChild(ov);
 ov.querySelector('.mcred a').addEventListener('click',function(){ exit(); });
 document.addEventListener('keydown',onKey);
 ov.addEventListener('pointermove',pmove); ov.addEventListener('pointerdown',pdown);
 ov.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse'){ rT=0; pinned=false; } });
 window.addEventListener('pointerup',pup); window.addEventListener('pointercancel',pup);
 window.addEventListener('resize',measure); document.addEventListener('visibilitychange',onVis);
 ctx=cv.getContext('2d');
 mk=document.createElement('canvas'); mctx=mk.getContext('2d');
 gr=document.createElement('canvas'); gr.width=gr.height=160; grc=gr.getContext('2d'); noise();
 measure();
 requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('in'); }); });
 try{ go.focus({preventScroll:true,focusVisible:false}); }catch(e){}
 imgNV=new Image(); imgNV.decoding='async'; imgNV.onload=function(){ nvOK=true; kick(); }; imgNV.src='img/intro_nv/nv_'+sz+'.webp?v='+V;
 t0=performance.now(); last=t0;
 for(var i=0;i<N;i++) B.push({x:W*.5,y:H*.5,vx:0,vy:0,r:0});
 kick();
 tAuto=setTimeout(function(){ if(!inter) exit(); },RM?12000:18000);
}
function noise(){ var d=grc.createImageData(160,160), a=d.data; for(var i=0;i<a.length;i+=4){ var v=Math.random()*255|0; a[i]=a[i+1]=a[i+2]=v; a[i+3]=255; } grc.putImageData(d,0,0); }
function measure(){ if(done||!ov) return;
 W=Math.max(1,ov.clientWidth); H=Math.max(1,ov.clientHeight); DPR=Math.min(window.devicePixelRatio||1,1.5);
 cv.width=Math.round(W*DPR); cv.height=Math.round(H*DPR);
 var s=Math.max(W/IW,H/IH), w=IW*s, h=IH*s, x=W*.5-FX*w, y=H*.47-FY*h;
 x=Math.min(0,Math.max(W-w,x)); y=Math.min(0,Math.max(H-h,y));
 ph={x:x,y:y,w:w,h:h}; img.style.left=x+'px'; img.style.top=y+'px'; img.style.width=w+'px'; img.style.height=h+'px';
 var m=TOUCH||W<700; CELL=m?5:6; R0=m?Math.min(W*.3,125):Math.min(H*.25,190);
 GW=Math.ceil(W/CELL)+1; GH=Math.ceil(H/CELL)+1; mk.width=GW; mk.height=GH; mdat=mctx.createImageData(GW,GH);
 if(!inter&&!rT){ tx=W*.5; ty=H*.47; }
 kick(); }
function onVis(){ if(!document.hidden) kick(); }
function kick(){ if(done||running||document.hidden) return; running=true; last=performance.now(); raf=requestAnimationFrame(loop); }
function wword(){ var r=word.getBoundingClientRect(); return {l:r.left,r:r.right,t:r.top,b:r.bottom}; }
function loop(now){
 if(done){ running=false; return; }
 var dt=Math.min(.05,(now-last)/1000); last=now; var t=(now-t0)/1000;
 if(RM){ var q=wword(); tx=(q.l+q.r)/2; ty=(q.t+q.b)/2; rT=R0*1.1; B.forEach(function(b){ b.x=tx; b.y=ty; }); rCur=rT; draw(t); running=false; return; }
 if(wander){ var q2=wword(); var cxw=(q2.l+q2.r)/2, hw=(q2.r-q2.l)/2; tx=cxw+hw*.82*Math.sin(t*.5-1.3); ty=(q2.t+q2.b)/2+(q2.b-q2.t)*.16*Math.sin(t*1.05); rT=t>.6?R0:0; }
 /* cabeza con muelle hacia el objetivo; cada bola sigue a la anterior con más retraso: se estira al moverse y se cierra detrás */
 var h=B[0], k1=1-Math.exp(-dt*(pinned?18:10));
 var ox=h.x, oy=h.y; h.x+=(tx-h.x)*k1; h.y+=(ty-h.y)*k1;
 var v=Math.hypot(h.x-ox,h.y-oy)/Math.max(dt,1e-3); spd+=(Math.min(v,2600)-spd)*(1-Math.exp(-dt*5));
 for(var i=1;i<N;i++){ var b=B[i], p=B[i-1], ks=95-i*9, damp=Math.exp(-dt*(5.5+i*.6));
  b.vx=(b.vx+(p.x-b.x)*ks*dt)*damp; b.vy=(b.vy+(p.y-b.y)*ks*dt)*damp; b.x+=b.vx*dt; b.y+=b.vy*dt;
  var ddx=b.x-p.x, ddy=b.y-p.y, dd=Math.hypot(ddx,ddy), mx=Math.max(8,rCur*.55); if(dd>mx){ b.x=p.x+ddx*mx/dd; b.y=p.y+ddy*mx/dd; b.vx*=.6; b.vy*=.6; } } /* la cola no se separa: sigue unida como una gota */
 var grow=1+.22*Math.min(1,spd/1600); rCur+=(rT*grow-rCur)*(1-Math.exp(-dt*(rT?5:7))); if(rT===0&&rCur<1) rCur=0;
 if(rCur>.5&&!ov.classList.contains('used')&&inter) ov.classList.add('used');
 draw(t);
 if(!document.hidden&&!done) raf=requestAnimationFrame(loop); else running=false;
}
var WS=[1,.86,.74,.64,.55,.47,.4], WN=Math.sqrt(WS.reduce(function(a,w){return a+w*w;},0));
function draw(t){
 ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
 if(rCur<1||!nvOK) return;
 /* campo de metabolas en rejilla baja; borde suave con smoothstep; luego se escala (suavizado bilineal) */
 var bx=[],by=[],br=[],i,j,n;
 for(n=0;n<N;n++){ var wob=1+.07*Math.sin(t*2.3+n*1.7)+.05*Math.sin(t*3.7+n); var rr=rCur*WS[n]/WN*wob; bx.push(B[n].x/CELL+Math.sin(t*1.3+n*2.1)*rCur*.03/CELL); by.push(B[n].y/CELL+Math.cos(t*1.1+n*1.3)*rCur*.03/CELL); br.push(rr*rr/(CELL*CELL)); }
 var minx=GW,maxx=0,miny=GH,maxy=0;
 for(n=0;n<N;n++){ var rg=Math.sqrt(br[n])*2.6; minx=Math.min(minx,bx[n]-rg); maxx=Math.max(maxx,bx[n]+rg); miny=Math.min(miny,by[n]-rg); maxy=Math.max(maxy,by[n]+rg); }
 minx=Math.max(0,minx|0); miny=Math.max(0,miny|0); maxx=Math.min(GW-1,Math.ceil(maxx)); maxy=Math.min(GH-1,Math.ceil(maxy));
 var a=mdat.data; a.fill(0);
 for(j=miny;j<=maxy;j++){ for(i=minx;i<=maxx;i++){ var f=0; for(n=0;n<N;n++){ var dx=i-bx[n], dy=j-by[n]; f+=br[n]/(dx*dx+dy*dy+.6); }
   var u=(f-.82)/.36; if(u<=0) continue; if(u>1) u=1; var o=(j*GW+i)*4; a[o]=a[o+1]=a[o+2]=255; a[o+3]=(u*u*(3-2*u))*255|0; } }
 mctx.putImageData(mdat,0,0);
 ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1;
 ctx.drawImage(imgNV,ph.x,ph.y,ph.w,ph.h);
 /* mismo viñeteado que la foto de día, para que el fondo no quede verde plano */
 if(!vg||vg.w!==W||vg.h!==H){ vg={w:W,h:H,g:ctx.createRadialGradient(W*.5,H*.42,0,W*.5,H*.42,Math.hypot(W,H)*.62)}; vg.g.addColorStop(0,'rgba(4,8,3,0)'); vg.g.addColorStop(.42,'rgba(4,8,3,.25)'); vg.g.addColorStop(.8,'rgba(4,8,3,.7)'); vg.g.addColorStop(1,'rgba(4,8,3,.88)'); }
 ctx.fillStyle=vg.g; ctx.fillRect(minx*CELL,miny*CELL,(maxx-minx)*CELL,(maxy-miny)*CELL);
 /* fósforo: grano animado y líneas de barrido */
 ctx.globalAlpha=.16; ctx.globalCompositeOperation='overlay'; var gx=(Math.random()*160)|0, gy=(Math.random()*160)|0;
 ctx.save(); ctx.translate(-gx,-gy); ctx.fillStyle=ctx.createPattern(gr,'repeat'); ctx.fillRect(minx*CELL,miny*CELL,(maxx-minx)*CELL+gx+160,(maxy-miny)*CELL+gy+160); ctx.restore();
 ctx.globalAlpha=.22; ctx.globalCompositeOperation='multiply'; ctx.fillStyle='#000';
 for(var y=(miny*CELL)|0; y<maxy*CELL; y+=3) ctx.fillRect(minx*CELL,y,(maxx-minx)*CELL,1);
 ctx.globalAlpha=1; ctx.globalCompositeOperation='destination-in'; ctx.imageSmoothingEnabled=true;
 ctx.drawImage(mk,0,0,GW,GH,0,0,GW*CELL,GH*CELL);
 ctx.globalCompositeOperation='source-over';
}
function loc(e){ return [e.clientX,e.clientY]; }
function onUI(e){ return e.target&&e.target.closest&&e.target.closest('button,a'); }
function pmove(e){ var p=loc(e);
 if(e.pointerType==='mouse'||e.buttons||e.pressure>0){ if(onUI(e)&&e.pointerType==='mouse'){ rT=0; return; } user(); wander=false; tx=p[0]; ty=p[1]; rT=R0; kick(); } }
function pdown(e){ if(onUI(e)) return; var p=loc(e); user(); wander=false; pinned=true; tx=p[0]; ty=p[1]; rT=R0;
 if(e.pointerType!=='mouse'&&rCur<2){ B.forEach(function(b){ b.x=tx; b.y=ty; b.vx=b.vy=0; }); }
 kick(); }
function pup(){ pinned=false; }
function user(){ if(!inter){ inter=true; clearTimeout(tAuto); } }
function onKey(e){ if(e.key==='Escape') exit(); else if(e.key==='ArrowDown'||e.key==='PageDown'){ e.preventDefault(); exit(); } }
function exit(){
 if(done) return; done=true; cancelAnimationFrame(raf); running=false; clearTimeout(tAuto); document.removeEventListener('keydown',onKey);
 window.removeEventListener('pointerup',pup); window.removeEventListener('pointercancel',pup); window.removeEventListener('resize',measure); document.removeEventListener('visibilitychange',onVis);
 if(!ov){ DE.classList.remove('mi-on'); return; }
 if(RM) ov.classList.add('rm'); ov.classList.add('out'); DE.classList.remove('mi-on');
 var a=document.getElementById('app'); if(a) try{a.focus({preventScroll:true});}catch(e){}
 setTimeout(function(){ if(ov&&ov.parentNode) ov.parentNode.removeChild(ov); },800);
}
window.MAT_INTRO_EXIT=exit;
if(document.body) build(); else document.addEventListener('DOMContentLoaded',build);
})();
