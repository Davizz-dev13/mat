// M.A.T · Ceuta y Melilla 3D (three.js r169). Relieve real (DEM libre) con la frontera en rojo y marcadores HTML.
import * as THREE from './three.module.min.js';
function merc(l){ return Math.log(Math.tan(Math.PI/4+l*Math.PI/360)); }
export function mount(el, C, H, texUrl, pins, opt){
  opt=opt||{}; var EX=opt.ex||1.6;
  var W=C.wm, D=C.hm, gw=C.gw, gh=C.gh, b=C.b, mn=merc(b.n), ms=merc(b.s);
  function hAt(u,v){ // u,v en 0..1 (v=0 norte)
    var x=Math.max(0,Math.min(gw-1,u*(gw-1))), y=Math.max(0,Math.min(gh-1,v*(gh-1))); var x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(gw-1,x0+1),y1=Math.min(gh-1,y0+1),fx=x-x0,fy=y-y0;
    var a=H[y0*gw+x0],c=H[y0*gw+x1],d=H[y1*gw+x0],e=H[y1*gw+x1]; return ((a*(1-fx)+c*fx)*(1-fy)+(d*(1-fx)+e*fx)*fy)/10; }
  function uv(ll){ return [(ll[1]-b.w)/(b.e-b.w),(mn-merc(ll[0]))/(mn-ms)]; }
  function P(ll,up){ var q=uv(ll); return new THREE.Vector3(q[0]*W-W/2, hAt(q[0],q[1])*EX+(up||0), q[1]*D-D/2); }
  var renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1)); renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x0b0d0f,1); el.appendChild(renderer.domElement); renderer.domElement.style.display='block'; renderer.domElement.style.touchAction='none';
  var scene=new THREE.Scene(); scene.fog=new THREE.Fog(0x0b0d0f,W*2.2,W*4.5);
  var cam=new THREE.PerspectiveCamera(42,1,60,W*8);
  scene.add(new THREE.AmbientLight(0xffffff,1.9)); var sun=new THREE.DirectionalLight(0xffffff,1.1); sun.position.set(-W,W*0.9,-W*0.6); scene.add(sun);
  // malla del terreno
  var pos=new Float32Array(gw*gh*3), uvs=new Float32Array(gw*gh*2), i,j,k=0,m=0;
  for(j=0;j<gh;j++) for(i=0;i<gw;i++){ pos[k++]=i/(gw-1)*W-W/2; pos[k++]=H[j*gw+i]/10*EX; pos[k++]=j/(gh-1)*D-D/2; uvs[m++]=i/(gw-1); uvs[m++]=1-j/(gh-1); }
  var idx=new Uint32Array((gw-1)*(gh-1)*6); k=0;
  for(j=0;j<gh-1;j++) for(i=0;i<gw-1;i++){ var a=j*gw+i,c=a+1,d=a+gw,e=d+1; idx[k++]=a; idx[k++]=d; idx[k++]=c; idx[k++]=c; idx[k++]=d; idx[k++]=e; }
  var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.BufferAttribute(uvs,2)); g.setIndex(new THREE.BufferAttribute(idx,1)); g.computeVertexNormals();
  var mat=new THREE.MeshLambertMaterial({color:0xffffff});
  var mesh=new THREE.Mesh(g,mat); scene.add(mesh);
  // zócalo (bloque) para que parezca una maqueta
  var sk=new THREE.Mesh(new THREE.BoxGeometry(W,120,D),new THREE.MeshLambertMaterial({color:0x1a1f24})); sk.position.y=-78; scene.add(sk);
  var dirty=true, alive=true;
  new THREE.TextureLoader().load(texUrl,function(t){ t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); mat.map=t; mat.needsUpdate=true; dirty=true; if(opt.onReady) opt.onReady(); },undefined,function(){ if(opt.onError) opt.onError(); });
  // valla: cinta vertical roja sobre la frontera
  (C.border||[]).forEach(function(seg){ var vs=[],ix=[],n=0;
    for(var s=0;s<seg.length;s++){ var p=P(seg[s],0); vs.push(p.x,p.y-5,p.z, p.x,p.y+45*EX,p.z); if(s>0){ var o=(s-1)*2; ix.push(o,o+1,o+2, o+1,o+3,o+2); } }
    var fg=new THREE.BufferGeometry(); fg.setAttribute('position',new THREE.Float32BufferAttribute(vs,3)); fg.setIndex(ix);
    scene.add(new THREE.Mesh(fg,new THREE.MeshBasicMaterial({color:0xff5a36,transparent:true,opacity:.72,side:THREE.DoubleSide,depthWrite:false}))); });
  // cámara orbital propia (1 dedo gira, 2 dedos zoom/desplaza; ratón: arrastrar gira, rueda zoom, botón derecho desplaza)
  var tgt=new THREE.Vector3(0,0,0), R0=Math.max(W/Math.max(.6,(el.clientWidth||1)/(el.clientHeight||1)),D)*0.86, R=R0, th=0.0, ph=0.92, home={th:th,ph:ph,R:R0,t:tgt.clone()};
  function place(){ ph=Math.max(0.12,Math.min(1.45,ph)); R=Math.max(R0*0.12,Math.min(R0*2.2,R)); var lim=W*0.6; tgt.x=Math.max(-lim,Math.min(lim,tgt.x)); tgt.z=Math.max(-lim,Math.min(lim,tgt.z));
    cam.position.set(tgt.x+R*Math.sin(ph)*Math.sin(th), tgt.y+R*Math.cos(ph), tgt.z+R*Math.sin(ph)*Math.cos(th)); cam.lookAt(tgt); dirty=true; }
  place();
  var cv=renderer.domElement, ptrs={}, last=null;
  function pan(dx,dy){ var s=R/el.clientHeight*1.1, cx=Math.cos(th), sx=Math.sin(th); tgt.x-= (dx*cx + dy*sx)*s; tgt.z-= (-dx*sx + dy*cx)*s; place(); }
  function st(){ var ks=Object.keys(ptrs); if(ks.length===1){ var p=ptrs[ks[0]]; return {n:1,x:p.x,y:p.y}; } if(ks.length>=2){ var a=ptrs[ks[0]],c=ptrs[ks[1]]; return {n:2,x:(a.x+c.x)/2,y:(a.y+c.y)/2,d:Math.hypot(a.x-c.x,a.y-c.y)}; } return null; }
  cv.addEventListener('pointerdown',function(e){ cv.setPointerCapture(e.pointerId); ptrs[e.pointerId]={x:e.clientX,y:e.clientY,b:e.button}; last=st(); if(opt.onTouch) opt.onTouch(); });
  cv.addEventListener('pointermove',function(e){ if(!ptrs[e.pointerId]) return; ptrs[e.pointerId].x=e.clientX; ptrs[e.pointerId].y=e.clientY; var s=st(); if(!s||!last||s.n!==last.n){ last=s; return; }
    if(s.n===1){ var dx=s.x-last.x, dy=s.y-last.y; if(ptrs[e.pointerId].b===2||e.shiftKey) pan(dx,dy); else { th-=dx*0.0075; ph-=dy*0.006; place(); } }
    else { if(last.d>0) R*=last.d/s.d; pan(s.x-last.x,s.y-last.y); }
    last=s; });
  function up(e){ delete ptrs[e.pointerId]; last=st(); }
  cv.addEventListener('pointerup',up); cv.addEventListener('pointercancel',up); cv.addEventListener('contextmenu',function(e){ e.preventDefault(); });
  cv.addEventListener('wheel',function(e){ e.preventDefault(); R*=Math.exp(e.deltaY*0.0012); place(); },{passive:false});
  // marcadores HTML
  var lay=document.createElement('div'); lay.className='cym-lay'; el.appendChild(lay);
  var P3=pins.map(function(p){ var d=document.createElement('button'); d.type='button'; d.className='cym-pin '+(p.cls||''); d.innerHTML=p.html; d.setAttribute('aria-label',p.label||''); d.onclick=function(ev){ ev.stopPropagation(); if(opt.onPin) opt.onPin(p); }; lay.appendChild(d); return {p:p,el:d,v:P(p.ll,p.up||60)}; });
  var tmp=new THREE.Vector3();
  function size(){ var w=el.clientWidth||300, h=el.clientHeight||300; renderer.setSize(w,h,false); cv.style.width=w+'px'; cv.style.height=h+'px'; cam.aspect=w/h; cam.updateProjectionMatrix(); dirty=true; }
  size(); var ro=window.ResizeObserver?new ResizeObserver(size):null; if(ro) ro.observe(el); else window.addEventListener('resize',size);
  var fly=null;
  function loop(){ if(!alive) return; requestAnimationFrame(loop);
    if(fly){ var f=Math.min(1,(performance.now()-fly.t0)/700), q=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2; tgt.lerpVectors(fly.a,fly.b,q); R=fly.ra+(fly.rb-fly.ra)*q; ph=fly.pa+(fly.pb-fly.pa)*q; place(); if(f>=1) fly=null; }
    if(!dirty) return; dirty=false; renderer.render(scene,cam);
    var w=el.clientWidth, h=el.clientHeight;
    for(var n=0;n<P3.length;n++){ var o=P3[n]; tmp.copy(o.v).project(cam); var vis=tmp.z<1&&tmp.x>-1.1&&tmp.x<1.1&&tmp.y>-1.1&&tmp.y<1.1;
      o.el.style.display=vis?'':'none'; if(vis){ o.el.style.transform='translate('+((tmp.x+1)/2*w).toFixed(1)+'px,'+((1-tmp.y)/2*h).toFixed(1)+'px) translate(-50%,-100%)'; o.el.style.zIndex=String(1000-Math.round(tmp.z*500)); } } }
  loop();
  return {
    reset:function(){ fly={t0:performance.now(),a:tgt.clone(),b:home.t.clone(),ra:R,rb:home.R,pa:ph,pb:home.ph}; th=home.th; },
    focus:function(ll){ var v=P(ll,0); fly={t0:performance.now(),a:tgt.clone(),b:new THREE.Vector3(v.x,v.y,v.z),ra:R,rb:R0*0.38,pa:ph,pb:0.85}; },
    exag:function(x){ var s=x/EX; EX=x; var a=g.attributes.position.array; for(var q=1;q<a.length;q+=3) a[q]*=s; g.attributes.position.needsUpdate=true; g.computeVertexNormals(); scene.children.forEach(function(c){ if(c.geometry&&c!==mesh&&c!==sk&&c.material&&c.material.transparent){ var pa=c.geometry.attributes.position.array; for(var q2=1;q2<pa.length;q2+=3) pa[q2]*=s; c.geometry.attributes.position.needsUpdate=true; } }); P3.forEach(function(o){ o.v=P(o.p.ll,o.p.up||60); }); dirty=true; },
    select:function(id){ P3.forEach(function(o){ o.el.classList.toggle('on',o.p.id===id); }); dirty=true; },
    dispose:function(){ alive=false; try{ if(ro) ro.disconnect(); }catch(e){} try{ g.dispose(); mat.dispose(); if(mat.map) mat.map.dispose(); renderer.dispose(); renderer.forceContextLoss(); }catch(e){} if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement); if(lay.parentNode) lay.parentNode.removeChild(lay); }
  };
}
