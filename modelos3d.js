/* M.A.T — Modelos 3D (#/modelos-3d). Visor three.js con despiece ligado al scroll.
   Modelo F-14: F-14B de FlightGear (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.), FGAddon, GPL v2, convertido y dividido por M.A.T. */
import * as THREE from './three.module.min.js';
import {GLTFLoader,MeshoptDecoder,RoomEnvironment} from './gltf.min.js';

const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const isEN=()=>window.MAT_LANG==='en';
const T=(es,en)=>isEN()?en:es;

export const MODELS=[{
  id:'f-14', file:'m3d/f14.glb', poster:'m3d/f14.jpg', ficha:'#/a/grumman-f-14-tomcat', size:'0,9 MB',
  name:'Grumman F-14 Tomcat',
  kind:['Caza embarcado · EE. UU. · 1974–2006','Carrier-based fighter · USA · 1974–2006'],
  desc:['Ala de geometría variable, dos tripulantes (piloto y RIO) y misiles AIM-54 Phoenix. Desliza: el avión gira, pasa a dibujo técnico y se desmonta pieza a pieza; al subir se vuelve a montar.',
        'Variable-sweep wings, two crew (pilot and RIO) and AIM-54 Phoenix missiles. Scroll: the jet turns, becomes a line drawing and comes apart piece by piece; scroll up and it goes back together.'],
  credit:['Modelo 3D: F-14B del simulador FlightGear (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.; repositorio FGAddon, licencia GNU GPL v2), convertido, optimizado y dividido en piezas por M.A.T. Decoración VF-211 del propio modelo.',
          '3D model: F-14B from the FlightGear flight simulator (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.; FGAddon repository, GNU GPL v2 licence), converted, optimised and split into parts by M.A.T. VF-211 livery from the model itself.']
}];

export const CSS=`
.m3hd{margin:6px 0 4px}.m3hd h1{margin:.15em 0 .1em}.m3hd .sub{color:var(--mu);margin:0 0 6px}
.m3grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin:16px 0 28px}
.m3card{display:block;background:var(--s1);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;text-decoration:none;color:inherit}
.m3card .im{aspect-ratio:16/9;background:#0b0c0d center/cover no-repeat}
.m3card .b{padding:10px 12px 12px}.m3card .t{font-weight:650}.m3card .k{color:var(--mu);font-size:13px}.m3card .go{color:var(--ac2);font-size:14px;margin-top:6px}
.m3soon{border:1px dashed var(--line);border-radius:var(--r);padding:16px 14px;color:var(--mu);display:flex;align-items:center;gap:12px;min-height:90px}
.m3sec{position:relative;width:100vw;margin-left:calc(50% - 50vw);height:430vh}
.m3sec.rm{height:auto}
.m3stage{position:sticky;top:0;height:100vh;overflow:hidden;background:#0b0c0d;contain:strict}
.m3sec.rm .m3stage{position:relative;height:72vh;min-height:360px}
.m3stage canvas{position:absolute;left:0;top:0;width:100%;height:100%;display:block;touch-action:pan-y}
.m3ttl{position:absolute;left:16px;right:16px;top:68px;pointer-events:none;color:#e9e9e6;will-change:opacity}
.m3ttl h1{font-size:26px;line-height:1.15;margin:0}.m3ttl p{margin:.35em 0 0;color:#9aa0a6;font-size:14px;max-width:520px}
.m3hint{position:absolute;left:0;right:0;bottom:22px;text-align:center;color:#9aa0a6;font-size:13px;pointer-events:none;will-change:opacity}
.m3load{position:absolute;left:0;right:0;top:50%;text-align:center;color:#9aa0a6;font-size:13px}
.m3lab{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;will-change:opacity}
.m3lab svg{position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible}
.m3l{position:absolute;left:0;top:0;font:10.5px/1.25 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.05em;text-transform:uppercase;color:#1d1f21;white-space:nowrap;pointer-events:auto;text-decoration:none;padding:2px 0;will-change:transform}
.m3l b{display:block;font-weight:700}
.m3bar{position:absolute;left:0;bottom:0;height:2px;width:100%;background:#8f9a6a;transform-origin:0 0;transform:scaleX(0);will-change:transform}
.m3rmb{position:absolute;right:12px;bottom:12px}
.m3info{max-width:760px;margin:20px auto 34px}.m3info .cr{color:var(--dim);font-size:13px;margin-top:12px}
.m3info .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
`;

function ss(a,b,x){const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
function ramp(a,b,x){return Math.min(1,Math.max(0,(x-a)/(b-a)));}
function lerp(a,b,t){return a+(b-a)*t;}
function keyed(keys,p){ // keys [[p,v],...] smooth piecewise
  if(p<=keys[0][0]) return keys[0][1];
  for(let i=1;i<keys.length;i++){ if(p<=keys[i][0]){const a=keys[i-1],b=keys[i];return lerp(a[1],b[1],ss(a[0],b[0],p));}}
  return keys[keys.length-1][1];
}

/* ---------- F-14 despiece ---------- */
// model space (FlightGear .ac): x hacia popa, y arriba, z hacia la izquierda
const PART={radome:[-7.5,0.7,0],nose:[-3.8,1.0,0],canopy:[-1.6,4.4,0],mid:[0,0,0],aft:[3.6,0.4,0],
  engL:[1.8,-1.3,3.4],engR:[1.8,-1.3,-3.4],wingL:[0.4,1.0,4.8],wingR:[0.4,1.0,-4.8],
  finL:[3.4,3.6,2.2],finR:[3.4,3.6,-2.2],stabL:[5.0,-0.4,3.6],stabR:[5.0,-0.4,-3.6],
  gearL:[-0.3,-3.4,2.6],gearR:[-0.3,-3.4,-2.6],ngear:[-1.8,-3.6,0],missiles:[0,-5.6,0]};
const PIECE={windshield:[-1.3,0.2,0],canopy:[0.9,1.0,0],gun:[-0.6,-0.9,1.7],probe:[-0.8,1.0,-1.6],chin:[-1.4,-1.5,0],nose_misc:[0,-0.7,0.9],
  rampL:[-0.9,0.5,1.3],rampR:[-0.9,0.5,-1.3],pylons:[0,-1.5,0],speedbrake:[0.7,1.8,0],hook:[1.8,-1.7,0],ventralL:[0.4,-1.5,1.1],ventralR:[0.4,-1.5,-1.1],sealL:[0,0.7,1.2],sealR:[0,0.7,-1.2],
  fanL:[-2.8,0,0],fanR:[-2.8,0,0],igvL:[-3.9,0,0],igvR:[-3.9,0,0],reheatL:[1.5,0,0],reheatR:[1.5,0,0],nozzleL:[2.7,0,0],nozzleR:[2.7,0,0],
  slatL:[-1.4,0.35,0.25],slatR:[-1.4,0.35,-0.25],flapL:[1.5,-0.25,0.25],flapR:[1.5,-0.25,-0.25],spoilerL:[0.4,1.0,0],spoilerR:[0.4,1.0,0],
  rudderL:[1.5,0.4,0.5],rudderR:[1.5,0.4,-0.5],wheelL:[0,-1.5,0.7],wheelR:[0,-1.5,-0.7],doorL:[0,-0.3,1.5],doorR:[0,-0.3,-1.5],
  nwheel:[0,-1.5,0],ndoors:[-0.7,0.8,0]};
const PIVOT={wingL:[1.247,-0.636,2.615],wingR:[1.247,-0.636,-2.615]};
const GEARHIDE=/^(strut|wheel)[LR]$|^nstrut$|^nwheel$/;
const LABELS=[ // [piece, ES, EN, mobile]
  ['radome','Radomo|radar AWG-9','Radome|AWG-9 radar',1],
  ['canopy','Cabina|piloto + RIO','Cockpit|pilot + RIO',0],
  ['wingL','Alas de|geometría variable','Variable-sweep|wings',1],
  ['nozzleL','Motores|F110-GE-400','Engines|F110-GE-400',1],
  ['finL','Derivas|dobles','Twin|tails',0],
  ['aim54_1','Misiles|AIM-54 Phoenix','Missiles|AIM-54 Phoenix',1]];

const DARK=new THREE.Color(0x0b0c0d), PAPER=new THREE.Color(0xefebe2), FIT=new Float32Array(17*8*3+48);

function viewer(sec,stage,model,opts){
  const reduced=!!opts.reduced, mob=Math.min(innerWidth,innerHeight)<600;
  const canvas=stage.querySelector('canvas'), ttl=stage.querySelector('.m3ttl'), hint=stage.querySelector('.m3hint'), lab=stage.querySelector('.m3lab'), bar=stage.querySelector('.m3bar'), load=stage.querySelector('.m3load');
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'}); }catch(e){ opts.fail&&opts.fail(); return {destroy(){}}; }
  const DPR=Math.min(window.devicePixelRatio||1, mob?1.5:1.75);
  renderer.setPixelRatio(DPR);
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=0.86; renderer.outputColorSpace=THREE.SRGBColorSpace;
  const scene=new THREE.Scene(); scene.background=DARK.clone();
  const pm=new THREE.PMREMGenerator(renderer); const envRT=pm.fromScene(new RoomEnvironment(),0.04); scene.environment=envRT.texture; scene.environmentIntensity=0.75; pm.dispose();
  const hemi=new THREE.HemisphereLight(0xdde6f5,0x24262a,0.55); scene.add(hemi);
  const key=new THREE.DirectionalLight(0xfff6ea,1.9); key.position.set(-6,12,9); scene.add(key);
  const rim=new THREE.DirectionalLight(0xbcd0ff,0.9); rim.position.set(9,5,-10); scene.add(rim);
  const cam=new THREE.PerspectiveCamera(30,1,0.5,400);
  const plane=new THREE.Group(); scene.add(plane);
  const U={uMix:{value:0},uPaper:{value:new THREE.Vector3(0.937,0.922,0.886)}};
  const lineMat=new THREE.LineBasicMaterial({color:0x1b1d1f,transparent:true,opacity:0,depthWrite:false});
  let W=0,H=0,ready=false,cur=0,target=0,drawn=-1,raf=0,last=0,visible=true,dead=false,secTop=0,secRange=1,expl=0;
  const parts=[], pieces={}, gearPieces=[], lines=[]; let labs=[];

  function size(force){
    const w=stage.clientWidth,h=stage.clientHeight; if(!w||!h) return;
    if(!force && w===W && Math.abs(h-H)<140) return; // la barra del navegador móvil no provoca saltos
    W=w;H=h; renderer.setSize(W,H,false); cam.aspect=W/H; cam.updateProjectionMatrix(); drawn=-1;
  }
  function measure(){ const r=sec.getBoundingClientRect(); secTop=r.top+window.scrollY; secRange=Math.max(1,sec.offsetHeight-stage.clientHeight); onScroll(); }
  function onScroll(){ if(reduced) return; target=Math.min(1,Math.max(0,(window.scrollY-secTop)/secRange)); }
  function onResize(){ size(false); measure(); }

  // ---- carga ----
  const loader=new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(model.file+'?v='+VER, g=>{ if(dead) return; setup(g.scene); ready=true; if(load) load.remove(); drawn=-1; if(reduced){pose(0);render();} },
    ev=>{ if(load&&ev.total) load.textContent=T('Cargando modelo 3D… ','Loading 3D model… ')+Math.round(ev.loaded/ev.total*100)+' %'; },
    ()=>{ if(load) load.textContent=T('No se pudo cargar el modelo 3D.','The 3D model could not be loaded.'); });

  function patchMat(m){
    if(m.userData.m3p) return; m.userData.m3p=1; if(m.map&&/^base_t/.test(m.name||'')) m.color.setRGB(0.8,0.8,0.82); m.polygonOffset=true; m.polygonOffsetFactor=1; m.polygonOffsetUnits=1;
    const tr=m.transparent;
    m.onBeforeCompile=sh=>{ sh.uniforms.uMix=U.uMix; sh.uniforms.uPaper=U.uPaper;
      sh.fragmentShader='uniform float uMix;\nuniform vec3 uPaper;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n\tgl_FragColor.rgb=mix(gl_FragColor.rgb,uPaper,uMix);'+(tr?'\n\tgl_FragColor.a*=1.0-0.8*uMix;':'')); };
    m.customProgramCacheKey=()=>'m3p'+(tr?'t':'o');
  }
  function setup(root){
    root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root), c=box.getCenter(new THREE.Vector3());
    const tmp=new THREE.Box3(), v=new THREE.Vector3();
    root.children.slice().forEach(p=>{
      const pn=p.name.replace(/^P_/,'');
      const P={name:pn,obj:p,dir:new THREE.Vector3().fromArray(PART[pn]||[0,0,0]),pcs:[],d:0};
      tmp.setFromObject(p); P.c=tmp.getCenter(new THREE.Vector3()); P.gear=/^(gear[LR]|ngear)$/.test(pn);
      P.corners=[0,1,2,3,4,5,6,7].map(i=>new THREE.Vector3(i&1?tmp.max.x:tmp.min.x,i&2?tmp.max.y:tmp.min.y,i&4?tmp.max.z:tmp.min.z).sub(c));
      p.children.slice().forEach(n=>{ tmp.setFromObject(n); const pc=tmp.getCenter(new THREE.Vector3());
        const pc2={name:n.name,obj:n,c:pc,base:n.position.clone(),bs:n.scale.clone(),off:new THREE.Vector3().fromArray(PIECE[n.name]||[0,0,0]),gear:GEARHIDE.test(n.name)};
        P.pcs.push(pc2); pieces[n.name]=pc2; if(pc2.gear) gearPieces.push(pc2); });
      if(PIVOT[pn]){ const pv=new THREE.Group(); pv.position.fromArray(PIVOT[pn]); p.add(pv); p.updateMatrixWorld(true); P.pcs.forEach(q=>{pv.attach(q.obj); q.base.copy(q.obj.position); q.bs.copy(q.obj.scale);}); P.pivot=pv; P.sgn=pn==='wingL'?1:-1; P.pv=new THREE.Vector3().fromArray(PIVOT[pn]).sub(c); }
      parts.push(P);
    });
    // pétalos de tobera: salen en abanico desde el eje
    ['L','R'].forEach(s=>{ const nz=pieces['nozzle'+s]; if(!nz) return; Object.values(pieces).forEach(q=>{ if(q.name.indexOf('petal'+s)===0){ const r=new THREE.Vector3(0,q.c.y-nz.c.y,q.c.z-nz.c.z).normalize(); q.off.set(3.6,r.y*1.25,r.z*1.25);} }); });
    // misiles: se separan hacia su lado
    Object.values(pieces).forEach(q=>{ if(q.name.indexOf('aim54_')===0){ const sz=Math.sign(q.c.z)||1, out=Math.abs(q.c.z)>2?1.5:0.9; q.off.set(0,-0.5*(Math.abs(q.c.z)>2?0:1),sz*out);} });
    // retardo escalonado por distancia al centro
    const maxd=Math.max(...parts.map(P=>P.c.distanceTo(c)))||1; parts.forEach(P=>{P.d=0.32*P.c.distanceTo(c)/maxd;});
    // materiales + aristas (dibujo técnico)
    root.traverse(o=>{ if(o.isMesh){ (Array.isArray(o.material)?o.material:[o.material]).forEach(patchMat); o.frustumCulled=false;
      const eg=new THREE.EdgesGeometry(o.geometry,32); const ls=new THREE.LineSegments(eg,lineMat); ls.frustumCulled=false; ls.visible=false; ls.renderOrder=2; o.add(ls); lines.push(ls);} });
    root.position.copy(c).multiplyScalar(-1); plane.add(root);
    // rótulos
    const svgNS='http://www.w3.org/2000/svg'; const svg=document.createElementNS(svgNS,'svg'); lab.appendChild(svg);
    labs=LABELS.filter(L=>!mob||L[3]).filter(L=>pieces[L[0]]).map(L=>{ const a=document.createElement('a'); a.className='m3l'; a.href=model.ficha; const tx=(isEN()?L[2]:L[1]).split('|'); a.innerHTML='<b>'+tx[0]+'</b>'+tx[1]; a.setAttribute('data-noi18n',''); lab.appendChild(a);
      const ln=document.createElementNS(svgNS,'polyline'); ln.setAttribute('fill','none'); ln.setAttribute('stroke','#1d1f21'); ln.setAttribute('stroke-width','0.8'); svg.appendChild(ln);
      const dot=document.createElementNS(svgNS,'circle'); dot.setAttribute('r','2.2'); dot.setAttribute('fill','#1d1f21'); svg.appendChild(dot);
      return {p:pieces[L[0]],a,ln,dot,w:0,h:0}; });
    labs.forEach(l=>{ l.w=l.a.offsetWidth; l.h=l.a.offsetHeight; });
  }

  const wp=new THREE.Vector3();
  function pose(p){
    // fases
    const mix=ss(0.20,0.31,p)*(1-ss(0.83,0.93,p));
    const E=p<0.72?ramp(0.29,0.56,p):1-ramp(0.79,0.93,p);
    const E2=p<0.72?ss(0.46,0.66,p):1-ss(0.76,0.89,p);
    const G=ss(0.31,0.42,p)*(1-ss(0.86,0.93,p));
    const sweep=(ss(0.03,0.13,p)-ss(0.16,0.25,p))*0.84; // 20°→68°→20°
    expl=E;
    U.uMix.value=mix*0.93; lineMat.opacity=mix; const lv=mix>0.01; if(lines.length&&lines[0].visible!==lv) lines.forEach(l=>l.visible=lv);
    scene.background.copy(DARK).lerp(PAPER,mix);
    parts.forEach(P=>{ const e=ss(0,1,(E-P.d)/(1-P.d)); P.obj.position.copy(P.dir).multiplyScalar(e); if(P.pivot) P.pivot.rotation.y=P.sgn*sweep;
      P.pcs.forEach(q=>{ q.obj.position.copy(q.base).addScaledVector(q.off,E2); });
    });
    gearPieces.forEach(q=>{ const s=Math.max(G,0.001); q.obj.scale.copy(q.bs).multiplyScalar(s); q.obj.visible=G>0.004; });
    // cámara: encuadre calculado con las cajas de las piezas (sin saltos)
    const port=W<H;
    const yaw=keyed([[0,0.62],[0.2,-0.2],[0.45,-0.7],[0.75,-1.15],[1,-2.45]],p);
    const el=keyed([[0,0.2],[0.2,0.26],[0.45,0.55],[0.75,0.62],[1,0.24]],p)+(port?0.1:0);
    plane.rotation.y=yaw;
    const cy=Math.cos(yaw), sy=Math.sin(yaw), se=Math.sin(el), ce=Math.cos(el);
    const tV=Math.tan(THREE.MathUtils.degToRad(cam.fov)/2), tH=tV*cam.aspect;
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; const pts=FIT;
    let n=0;
    parts.forEach(P=>{ const e=ss(0,1,(E-P.d)/(1-P.d)); if(P.gear&&G<0.01) return; const sw=P.pivot?P.sgn*sweep:0, sc=Math.cos(sw), sn=Math.sin(sw);
      P.corners.forEach(q=>{ let qx=q.x, qz=q.z; if(sw){ const ax=qx-P.pv.x, az=qz-P.pv.z; qx=P.pv.x+ax*sc+az*sn; qz=P.pv.z-ax*sn+az*sc; }
      const mx=qx+P.dir.x*e, my=q.y+P.dir.y*e, mz=qz+P.dir.z*e;
      const wx=mx*cy+mz*sy, wz=-mx*sy+mz*cy, wy=my; // rotación del avión
      const X=wx, Y=wy*ce-wz*se, Z=wy*se+wz*ce; pts[n++]=X;pts[n++]=Y;pts[n++]=Z;
      if(X<x0)x0=X; if(X>x1)x1=X; if(Y<y0)y0=Y; if(Y>y1)y1=Y; }); });
    const cx=(x0+x1)/2, cyy=(y0+y1)/2; let d=0;
    for(let i=0;i<n;i+=3){ const dx=Math.abs(pts[i]-cx)/tH+pts[i+2], dy=Math.abs(pts[i+1]-cyy)/tV+pts[i+2]; if(dx>d)d=dx; if(dy>d)d=dy; }
    d*=port?1.04:1.1;
    const tx=cx, ty=cyy*ce, tz=-cyy*se; // centro en coordenadas de mundo
    cam.position.set(tx,ty+se*d,tz+ce*d); cam.lookAt(tx,ty,tz);
    // textos
    const tO=1-ss(0.025,0.08,p); ttl.style.opacity=tO; if(hint) hint.style.opacity=tO; if(bar) bar.style.transform='scaleX('+p.toFixed(4)+')';
    const lo=ss(0.6,0.66,p)*(1-ss(0.77,0.81,p)); lab.style.opacity=lo; lab.style.visibility=lo>0.01?'visible':'hidden';
    if(lo>0.01) placeLabels();
  }
  function placeLabels(){
    plane.updateMatrixWorld(true); cam.updateMatrixWorld();
    labs.forEach(l=>{ l.p.obj.getWorldPosition(wp); wp.project(cam); l.x=(wp.x*0.5+0.5)*W; l.y=(-wp.y*0.5+0.5)*H; });
    const put=(l,lx,ly,ex,ey)=>{ l.a.style.transform='translate('+lx.toFixed(1)+'px,'+ly.toFixed(1)+'px)';
      l.ln.setAttribute('points',ex.toFixed(1)+','+ey.toFixed(1)+' '+l.x.toFixed(1)+','+l.y.toFixed(1)); l.dot.setAttribute('cx',l.x.toFixed(1)); l.dot.setAttribute('cy',l.y.toFixed(1)); };
    if(W<H){ // móvil vertical: rótulos en una banda arriba y otra abajo
      const mid=H*0.5, top=labs.filter(l=>l.y<mid).sort((a,b)=>a.x-b.x), bot=labs.filter(l=>l.y>=mid).sort((a,b)=>a.x-b.x);
      [[top,Math.max(76,H*0.17),1],[bot,H*0.8,-1]].forEach(([arr,by,dir])=>{ let x=12;
        const tot=arr.reduce((s,l)=>s+l.w,0)+(arr.length-1)*14; if(tot>W-24){ x=12; }
        arr.forEach((l,i)=>{ let lx=Math.max(x,Math.min(l.x-l.w/2,W-12-l.w-(arr.slice(i+1).reduce((s,k)=>s+k.w+14,0)))); const ly=by-(dir>0?0:l.h);
          put(l,lx,ly,lx+l.w/2,dir>0?ly+l.h+3:ly-3); x=lx+l.w+14; }); });
      return;
    }
    const L=labs.filter(l=>l.x<W/2).sort((a,b)=>a.y-b.y), R=labs.filter(l=>l.x>=W/2).sort((a,b)=>a.y-b.y);
    [[L,1],[R,-1]].forEach(([arr,side])=>{ const ys=[]; let prev=70;
      arr.forEach(l=>{ const y=Math.max(prev,l.y-l.h/2); ys.push(y); prev=y+l.h+12; });
      let over=prev-12-(H-40); for(let i=arr.length-1;i>=0&&over>0;i--){ const lim=i?ys[i-1]+arr[i-1].h+12:70; const mv=Math.min(over,ys[i]-lim); ys[i]-=over; over=Math.max(0,over-mv); }
      arr.forEach((l,i)=>{ const lx=side>0?Math.max(16,W*0.06):Math.min(W-16,W*0.94)-l.w; const ex=side>0?lx+l.w+6:lx-6; put(l,lx,ys[i],ex,ys[i]+l.h/2); }); });
  }
  function render(){ renderer.render(scene,cam); }
  function loop(t){
    raf=requestAnimationFrame(loop);
    const dt=Math.min(0.05,last?(t-last)/1000:0.016); last=t;
    if(!ready||!visible||reduced) return;
    const k=1-Math.exp(-dt/0.11); cur+=(target-cur)*k; if(Math.abs(target-cur)<0.0004) cur=target;
    if(cur!==drawn){ pose(cur); render(); drawn=cur; }
  }
  size(true); measure();
  window.addEventListener('scroll',onScroll,{passive:true}); window.addEventListener('resize',onResize);
  const ro=('ResizeObserver' in window)?new ResizeObserver(()=>measure()):null; if(ro) ro.observe(document.body);
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting; if(visible){last=0;drawn=-1;}}):null; if(io) io.observe(stage);
  const vis=()=>{ if(!document.hidden){last=0;drawn=-1;} }; document.addEventListener('visibilitychange',vis);
  cur=target; raf=requestAnimationFrame(loop);
  window.MAT_M3D_DBG={get p(){return cur;},get t(){return target;},get ready(){return ready;},set:(p)=>{cur=target=p;pose(p);render();drawn=p;},calls:()=>renderer.info.render.calls};
  return {
    toggle(on){ if(!ready) return; pose(on?0.66:0); render(); },
    destroy(){ dead=true; cancelAnimationFrame(raf); window.removeEventListener('scroll',onScroll); window.removeEventListener('resize',onResize); document.removeEventListener('visibilitychange',vis); if(ro) ro.disconnect(); if(io) io.disconnect();
      scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); if(o.material){ (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{ for(const k in m){ const v=m[k]; if(v&&v.isTexture) v.dispose(); } m.dispose(); }); } });
      envRT.dispose(); renderer.dispose(); try{renderer.forceContextLoss();}catch(e){} if(window.MAT_M3D_DBG) delete window.MAT_M3D_DBG; }
  };
}

let ACTIVE=null;
function stop(){ if(ACTIVE){ ACTIVE.destroy(); ACTIVE=null; } }
window.addEventListener('hashchange',()=>{ if(!/^#\/modelos-3d\/./.test(location.hash)) stop(); });

function listPage(app,ctx){
  const en=isEN();
  let h=ctx.crumbs([[en?'Home':'Inicio','#/'],[en?'3D models':'Modelos 3D']])+'<div class="m3hd" data-noi18n><h1>'+(en?'3D models':'Modelos 3D')+'</h1><p class="sub">'+(en?'Realistic 3D models that come apart piece by piece as you scroll. One viewer per model.':'Modelos 3D realistas que se desmontan pieza a pieza al deslizar. Un visor por modelo.')+'</p></div><div class="m3grid" data-noi18n>';
  MODELS.forEach(m=>{ h+='<a class="m3card" href="#/modelos-3d/'+m.id+'"><div class="im" style="background-image:url('+m.poster+'?v='+VER+')" role="img" aria-label="'+ctx.esc(m.name)+'"></div><div class="b"><div class="t">'+ctx.esc(m.name)+'</div><div class="k">'+ctx.esc(m.kind[en?1:0])+'</div><div class="go">'+(en?'Open in 3D ›':'Ver en 3D ›')+'</div></div></a>'; });
  h+='<div class="m3soon"><svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><rect x="8" y="24" width="32" height="10" rx="3" fill="none" stroke="#6b7177" stroke-width="1.6"/><path d="M16 24v-5h12l4 5M28 21h14" fill="none" stroke="#6b7177" stroke-width="1.6"/><circle cx="14" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/><circle cx="24" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/><circle cx="34" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/></svg><div>'+(en?'Coming soon: main battle tanks and more models.':'Próximamente: carros de combate y más modelos.')+'</div></div></div>';
  ctx.set(h,en?'3D models':'Modelos 3D');
}
function viewPage(app,ctx,m){
  const en=isEN(); const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  let h=ctx.crumbs([[en?'Home':'Inicio','#/'],[en?'3D models':'Modelos 3D','#/modelos-3d'],[m.name]])+
   '<section class="m3sec'+(rm?' rm':'')+'" data-noi18n><div class="m3stage"><canvas aria-label="'+ctx.esc(m.name)+' 3D"></canvas>'+
   '<div class="m3ttl"><h1>'+ctx.esc(m.name)+'</h1><p>'+ctx.esc(m.kind[en?1:0])+'</p></div>'+
   '<div class="m3load">'+(en?'Loading 3D model…':'Cargando modelo 3D…')+'</div><div class="m3lab" style="opacity:0;visibility:hidden"></div>'+
   (rm?'<button type="button" class="btn m3rmb">'+(en?'Show parts':'Ver despiece')+'</button>':'<div class="m3hint">'+(en?'Scroll · it comes apart ↓':'Desliza · se desmonta ↓')+'</div><div class="m3bar"></div>')+
   '</div></section><div class="m3info" data-noi18n><p>'+ctx.esc(m.desc[en?1:0])+'</p><div class="row"><a class="btn" href="'+m.ficha+'">'+(en?'See entry ›':'Ver ficha ›')+'</a><a class="btn" href="#/modelos-3d">'+(en?'‹ All 3D models':'‹ Todos los modelos 3D')+'</a></div><p class="cr">'+ctx.esc(m.credit[en?1:0])+' <a href="#/license">LICENSE</a></p></div>';
  ctx.set(h,m.name+' · '+(en?'3D models':'Modelos 3D'));
  const sec=app.querySelector('.m3sec'), stage=sec.querySelector('.m3stage');
  const fail=()=>{ stage.innerHTML='<div class="m3card" style="position:absolute;inset:0;border:0"><div class="im" style="height:100%;aspect-ratio:auto;background-image:url('+m.poster+'?v='+VER+')"></div></div>'; sec.classList.add('rm'); };
  ACTIVE=viewer(sec,stage,m,{reduced:rm,fail});
  if(rm){ const b=stage.querySelector('.m3rmb'); let on=false; b.onclick=()=>{ on=!on; ACTIVE&&ACTIVE.toggle(on); b.textContent=on?(en?'Assemble':'Montar'):(en?'Show parts':'Ver despiece'); }; }
}
export function route(app,ctx,p){
  stop();
  if(!document.getElementById('m3dcss')){ const s=document.createElement('style'); s.id='m3dcss'; s.textContent=CSS; document.head.appendChild(s); }
  const m=p[1]&&MODELS.find(x=>x.id===p[1]);
  if(m) return viewPage(app,ctx,m);
  return listPage(app,ctx);
}
