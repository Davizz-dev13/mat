/* M.A.T — Modelos 3D (#/modelos-3d). Visor three.js con despiece ligado al scroll.
   Modelo F-14: F-14B de FlightGear (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.), FGAddon, GPL v2, convertido y dividido por M.A.T.
   Modelo Leopard 2: basado en «Abrams M1A2 SEPv3» de dannzjs (Sketchfab), CC BY 4.0 — geometría de Leopard 2 (2A5/2A6), reetiquetado y dividido por M.A.T. */
import * as THREE from './three.module.min.js';
import {GLTFLoader,MeshoptDecoder,RoomEnvironment} from './gltf.min.js';

const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const isEN=()=>window.MAT_LANG==='en';
const T=(es,en)=>isEN()?en:es;

export const MODELS=[{
  id:'f-14', file:'m3d/f14.glb', poster:'m3d/f14.jpg', ficha:'#/a/grumman-f-14-tomcat', size:'0,9 MB',
  name:'Grumman F-14 Tomcat',
  kind:['Caza embarcado · EE. UU. · 1974–2006','Carrier-based fighter · USA · 1974–2006'],
  desc:['Ala de geometría variable, dos tripulantes (piloto y RIO) y misiles AIM-54 Phoenix. Desliza: el avión gira, pasa a dibujo técnico y se desmonta pieza a pieza; al subir se vuelve a montar. Con el avión montado, prueba la ametralladora y el misil.',
        'Variable-sweep wings, two crew (pilot and RIO) and AIM-54 Phoenix missiles. Scroll: the jet turns, becomes a line drawing and comes apart piece by piece; scroll up and it goes back together. With the jet assembled, try the cannon and the missile.'],
  shots:[['gun','Ametralladora','Cannon'],['missile','Misil','Missile']],
  credit:['Modelo 3D: F-14B del simulador FlightGear (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.; repositorio FGAddon, licencia GNU GPL v2), convertido, optimizado y dividido en piezas por M.A.T. Decoración VF-211 del propio modelo.',
          '3D model: F-14B from the FlightGear flight simulator (Richard Harrison, Enrique Laso, Alexis Bory, Nikolai V. Chr.; FGAddon repository, GNU GPL v2 licence), converted, optimised and split into parts by M.A.T. VF-211 livery from the model itself.']
},{
  id:'leopard-2', file:['m3d/leopard2.glb','m3d/leopard2_tren.glb'], poster:'m3d/leopard2.jpg', ficha:'#/a/t-leopard-2', ficha2:['#/a/t-leopard-2e','Leopardo 2E'], size:'2,0 MB', cfg:'leo',
  name:'Leopard 2 (2A5/2A6)',
  kind:['Carro de combate · Alemania · 1979–hoy','Main battle tank · Germany · 1979–present'],
  desc:['Carro de combate alemán de Krauss-Maffei; con torre en cuña (2A5/2A6) es la base del Leopardo 2E del Ejército de Tierra. Desliza: la torre gira, pasa a dibujo técnico y se desmonta en torre, cañón, casco, motor, cadenas y estiba; al subir se vuelve a montar. Con el carro montado, pulsa «Disparar».',
        'German main battle tank by Krauss-Maffei; with the wedge turret (2A5/2A6) it is the basis of the Spanish Army\'s Leopardo 2E. Scroll: the turret turns, becomes a line drawing and comes apart into turret, gun, hull, engine, tracks and stowage; scroll up and it goes back together. With the tank assembled, tap "Fire".'],
  credit:['Modelo 3D: basado en «Abrams M1A2 SEPv3» de dannzjs (sketchfab.com/dannzjs), licencia CC BY 4.0. Pese a su título original, la geometría corresponde a un Leopard 2 de la familia 2A5/2A6; M.A.T lo ha reetiquetado, optimizado y dividido en piezas (y le ha quitado la estación de armas remota y otros restos del techo). Textura modificada: repintado por M.A.T en verde OTAN satinado con polvo. Detalles de estiba añadidos por M.A.T (bidones, cestón, cables, eslabones de repuesto, antenas con bandera y banderín OTAN, periscopio, faros y disco «70»).',
          '3D model: based on "Abrams M1A2 SEPv3" by dannzjs (sketchfab.com/dannzjs), CC BY 4.0 licence. Despite its original title, the geometry is a Leopard 2 of the 2A5/2A6 family; M.A.T relabelled, optimised and split it into parts (and removed the remote weapon station and other roof leftovers). Modified texture: repainted by M.A.T in satin NATO green with dust. Stowage details added by M.A.T (jerrycans, basket, tow cables, spare track links, antennas with flag and NATO pennant, periscope, headlights and "70" disc).'],
  caption:['Verde OTAN del Ejército de Tierra, como el Leopardo 2E','Spanish Army NATO green, like the Leopardo 2E'],
  shots:[['main','🔥 Disparar','🔥 Fire']]
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
.m3fx{position:absolute;left:12px;bottom:52px;display:flex;gap:8px;opacity:0;pointer-events:none;transition:opacity .25s}
.m3fx.on{opacity:1;pointer-events:auto}
.m3fx .btn{background:rgba(18,20,18,.72);color:#f1eee6;border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.m3sec.rm .m3fx{bottom:12px}
.m3info{max-width:760px;margin:20px auto 34px}.m3info .cr{color:var(--dim);font-size:13px;margin-top:12px}
.m3info .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}
.m3info .m3cap{color:var(--mu);font-size:13px;letter-spacing:.02em;margin:0 0 8px}
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



/* ---------- Leopard 2: pintura verde OTAN, polvo, estiba y efectos (M.A.T) ---------- */
const f3=x=>(+x).toFixed(3);
const NOISE=`float m3h(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float m3n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);return mix(mix(mix(m3h(i),m3h(i+vec3(1,0,0)),f.x),mix(m3h(i+vec3(0,1,0)),m3h(i+vec3(1,1,0)),f.x),f.y),mix(mix(m3h(i+vec3(0,0,1)),m3h(i+vec3(1,0,1)),f.x),mix(m3h(i+vec3(0,1,1)),m3h(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
// pintura satinada con oclusión (canal R del color de vértice), moteado y polvo por altura en espacio del modelo
function wearMat(o){
  const ao=!!o.ao, cc=o.cc||0, dust=o.dust||0, top=o.dustTop||0, mott=o.mott==null?0.2:o.mott;
  const m=new THREE.MeshPhysicalMaterial({color:new THREE.Color(o.color),roughness:o.rough,metalness:o.metal,clearcoat:cc,clearcoatRoughness:0.4,map:o.map||null,vertexColors:ao,side:o.side||THREE.FrontSide,emissive:new THREE.Color(o.emissive||0),transparent:!!o.transparent,alphaTest:o.alphaTest||0});
  m.name=o.name||'wear'; m.userData.tag='w'+(ao?'a':'')+(o.map?'m':'')+(cc?'c':'')+[dust,top,mott].map(f3).join('_');
  m.userData.pre=sh=>{
    sh.vertexShader='varying vec3 vMP;\nvarying vec3 vMN;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n\tvMP=position; vMN=normal;');
    let fs='varying vec3 vMP;\nvarying vec3 vMN;\n'+NOISE+sh.fragmentShader
     .replace('#include <color_fragment>',`
	float mN=m3n(vMP*1.7)*0.55+m3n(vMP*6.3)*0.3+m3n(vMP*21.0)*0.15;
	float mOcc=${ao?'mix(0.2,1.0,smoothstep(0.0,0.6,vColor.r))':'1.0'};
	float mD=smoothstep(1.8,0.45,vMP.y+(mN-0.5)*0.9)*${f3(dust)};
	mD+=smoothstep(0.6,0.95,vMN.y)*smoothstep(0.45,0.8,m3n(vMP*2.7+7.0))*${f3(top)};
	mD=clamp(mD,0.0,0.9);
	diffuseColor.rgb*=1.0-${f3(mott)}*0.5+${f3(mott)}*mN;
	diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.30,0.25,0.175)*(0.82+0.36*mN),mD);
	diffuseColor.rgb*=mix(1.0,mOcc,0.72);`)
     .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n\troughnessFactor=mix(roughnessFactor,0.96,mD);')
     .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n\treflectedLight.indirectDiffuse*=mOcc; reflectedLight.indirectSpecular*=mOcc*mOcc;');
    if(cc) fs=fs.replace('#include <lights_physical_fragment>','#include <lights_physical_fragment>\n\tmaterial.clearcoat*=1.0-mD;');
    sh.fragmentShader=fs;
  };
  return m;
}
function cvTex(w,h,draw){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function rbox(w,h,d,r,s){ s=s||3; const g=new THREE.BoxGeometry(w,h,d,s,s,s), p=g.attributes.position, v=new THREE.Vector3(), c=new THREE.Vector3(), hw=w/2-r, hh=h/2-r, hd=d/2-r;
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(Math.max(-hw,Math.min(hw,v.x)),Math.max(-hh,Math.min(hh,v.y)),Math.max(-hd,Math.min(hd,v.z))); v.sub(c); if(v.lengthSq()>1e-12) v.setLength(r); v.add(c); p.setXYZ(i,v.x,v.y,v.z); }
  g.computeVertexNormals(); return g; }
function rod(a,b,r,mat,seg){ const d=new THREE.Vector3().subVectors(b,a), L=d.length(); const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,L,seg||8,1),mat); m.position.copy(a).addScaledVector(d,0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m; }
function at(m,x,y,z){ m.position.set(x,y,z); return m; }

const LEO_OLIVE='#656a56';
function leoPrep(root,ctx){
  // 1) geometría en coordenadas del modelo: se hornea la transformación (cuantización incluida) de cada malla respecto a su grupo P_
  root.updateMatrixWorld(true);
  const v=new THREE.Vector3(), meshes=[], nm=new THREE.Matrix3();
  root.children.forEach(P=>{ const inv=P.matrixWorld.clone().invert(), list=[];
    P.traverse(o=>{ if(o.isMesh) list.push([o,inv.clone().multiply(o.matrixWorld)]); });
    list.forEach(([o,mx])=>{ meshes.push(o); const g=o.geometry; nm.getNormalMatrix(mx);
      ['position','normal'].forEach(k=>{ const a=g.attributes[k]; if(!a) return; const arr=new Float32Array(a.count*3);
        for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i); if(k==='position') v.applyMatrix4(mx); else v.applyMatrix3(nm).normalize(); arr[i*3]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z; }
        g.setAttribute(k,new THREE.BufferAttribute(arr,3)); });
      g.computeBoundingBox(); g.computeBoundingSphere(); });
    P.traverse(o=>{ if(o!==P){ o.position.set(0,0,0); o.scale.set(1,1,1); o.quaternion.identity(); o.updateMatrix(); } }); });
  root.updateMatrixWorld(true);
  // 2) materiales: pintura verde OTAN satinada (como el Leopardo 2E), acero de cadenas, caucho
  const paint=wearMat({name:'paint',color:LEO_OLIVE,rough:0.6,metal:0.2,cc:0.15,ao:true,dust:0.85,dustTop:0.14,mott:0.08});
  const bolts=wearMat({name:'bolts',color:'#575b4c',rough:0.6,metal:0.25,ao:true,dust:0.9,dustTop:0.2,mott:0.1});
  const rubberK=wearMat({name:'rubberK',color:'#30322d',rough:0.9,metal:0,ao:true,dust:0.6,dustTop:0.25,mott:0.25});
  const wheelP=wearMat({name:'wheelP',color:LEO_OLIVE,rough:0.62,metal:0.2,cc:0.1,dust:1.0,dustTop:0.35,mott:0.15});
  const tyre=wearMat({name:'tyre',color:'#262724',rough:0.92,metal:0,dust:0.95,dustTop:0.3,mott:0.2});
  const MAP={MainMetal:paint,MainMetal_LH_NONE:paint,MainMetal_Props_NONE:paint,MainMetal_Armor:paint,MainMetal_LH:paint,DMainMetal_Guns:paint,MainMetal_Guns:paint,MainMetal_ROT:paint,
    DMainMetal_Props:paint,MainMetal_Props:paint,DMainMetal_Shield:paint,MainMetal_Shield:paint,Screw:bolts,Screw_Props:bolts,Screw_Shield:bolts,Rubber_Props:rubberK,
    Metal_Wheels:wheelP,MetalWheels_Gear:wheelP,Screw_Gear:wheelP,Screw_W:wheelP,Rubber_W:tyre,Rubber_Wheels:tyre};
  const steel={};
  meshes.forEach(o=>{ o.material=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{ const n=m.name||'';
      if(MAP[n]) return MAP[n];
      if(/MachWheels/.test(n)){ return steel[n]||(steel[n]=wearMat({name:n,color:'#7d7d78',map:m.map,rough:0.62,metal:0.55,dust:1.0,dustTop:0.45,mott:0.12})); }
      return m; });
    if(o.material.length===1) o.material=o.material[0]; });
  // 3) estiba y detalles (piezas nuevas, construidas aquí)
  const P=n=>root.getObjectByName('P_'+n), N=n=>root.getObjectByName(n);
  const turret=P('turret'), hullBody=N('hull_body'), tBody=N('turret_body'), tKit=N('turret_kit');
  const st=new THREE.Group(); st.name='stowage'; turret.add(st);
  const od=wearMat({name:'od',color:'#4f5631',rough:0.55,metal:0.15,cc:0.15,dust:0.3,dustTop:0.3,mott:0.12});
  const steelD=new THREE.MeshStandardMaterial({color:0x34362f,roughness:0.5,metalness:0.6});
  const canFace=cvTex(128,176,(g,w,h)=>{ g.fillStyle='#4f5631'; g.fillRect(0,0,w,h);
      const ln=(c,wd,dx,dy)=>{ g.strokeStyle=c; g.lineWidth=wd; g.beginPath(); g.moveTo(14+dx,16+dy); g.lineTo(w-14+dx,h-16+dy); g.moveTo(w-14+dx,16+dy); g.lineTo(14+dx,h-16+dy); g.stroke(); g.strokeRect(9+dx,10+dy,w-18,h-20); };
      ln('rgba(0,0,0,0.42)',7,2,2); ln('rgba(210,220,170,0.22)',5,-1,-1); ln('#4a512d',5,0,0);
      g.fillStyle='rgba(225,225,200,0.55)'; g.font='bold 15px sans-serif'; g.textAlign='center'; g.fillText('20L',w/2,34); });
  const canFaceM=wearMat({name:'canF',color:'#ffffff',map:canFace,rough:0.55,metal:0.15,cc:0.15,dust:0.3,dustTop:0.3,mott:0.12});
  function can(){ const g=new THREE.Group(); const b=new THREE.Mesh(rbox(0.345,0.47,0.165,0.022,3),[od,od,od,od,canFaceM,canFaceM]); g.add(b);
    [-0.09,0,0.09].forEach(x=>g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.022,0.05,0.03),od),x,0.255,0)));
    g.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.22,0.02,0.03),od),0,0.285,0));
    const sp=at(new THREE.Mesh(new THREE.CylinderGeometry(0.026,0.026,0.05,10),steelD),0.13,0.25,0); sp.rotation.z=0.5; g.add(sp); return g; }
  // cestón trasero (rejilla + tubos), lona enrollada y petates
  const bx0=4.88,bx1=5.6,by0=2.56,by1=2.96,bz=1.26, tr=0.017;
  const rail=new THREE.MeshStandardMaterial({color:0x50553f,roughness:0.6,metalness:0.35});
  const C=[[bx0,by0,-bz],[bx1,by0,-bz],[bx1,by0,bz],[bx0,by0,bz]].map(a=>new THREE.Vector3(...a));
  const Ct=C.map(p=>p.clone().setY(by1));
  for(let i=0;i<4;i++){ st.add(rod(C[i],C[(i+1)%4],tr,rail)); if(i===1||i===2) continue; }
  [[1,2]].forEach(([a,b])=>st.add(rod(Ct[a],Ct[b],tr,rail))); st.add(rod(Ct[0],Ct[1],tr,rail)); st.add(rod(Ct[2],Ct[3],tr,rail));
  for(let z=-bz;z<=bz+1e-6;z+=bz/3) st.add(rod(new THREE.Vector3(bx1,by0,z),new THREE.Vector3(bx1,by1,z),tr*0.8,rail));
  [0,1,2,3].forEach(i=>st.add(rod(C[i],Ct[i],tr,rail)));
  const grid=cvTex(128,128,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='#3c4030'; g.lineWidth=5; for(let i=0;i<=w;i+=21){ g.beginPath(); g.moveTo(i,0); g.lineTo(i,h); g.stroke(); g.beginPath(); g.moveTo(0,i); g.lineTo(w,i); g.stroke(); } });
  grid.wrapS=grid.wrapT=THREE.RepeatWrapping;
  const gm=(rx,ry)=>{ const t=grid.clone(); t.repeat.set(rx,ry); t.needsUpdate=true; return new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:0.4,side:THREE.DoubleSide,roughness:0.7,metalness:0.3}); };
  const back=new THREE.Mesh(new THREE.PlaneGeometry(2*bz,by1-by0),gm(9,1.6)); back.rotation.y=Math.PI/2; at(back,bx1,(by0+by1)/2,0); st.add(back);
  const bot=new THREE.Mesh(new THREE.PlaneGeometry(bx1-bx0,2*bz),gm(2.6,9)); bot.rotation.x=-Math.PI/2; at(bot,(bx0+bx1)/2,by0,0); st.add(bot);
  [-bz,bz].forEach(z=>{ const s=new THREE.Mesh(new THREE.PlaneGeometry(bx1-bx0,by1-by0),gm(2.6,1.6)); at(s,(bx0+bx1)/2,(by0+by1)/2,z); st.add(s); });
  const canvasM=c=>wearMat({name:'cv'+c,color:c,rough:0.95,metal:0,dust:0.2,dustTop:0.35,mott:0.4});
  const bagA=at(new THREE.Mesh(rbox(0.58,0.34,0.8,0.1,4),canvasM('#5a5d3e')),5.24,by0+0.18,0.78); bagA.rotation.y=0.06; st.add(bagA);
  const bagB=at(new THREE.Mesh(rbox(0.56,0.32,0.74,0.1,4),canvasM('#4c5236')),5.22,by0+0.17,-0.8); bagB.rotation.y=-0.05; st.add(bagB);
  const duf=at(new THREE.Mesh(new THREE.CapsuleGeometry(0.17,0.42,4,12),canvasM('#625c42')),5.25,by0+0.18,0); duf.rotation.x=Math.PI/2; st.add(duf);
  const tarpM=canvasM('#6f6b4c'), strapM=new THREE.MeshStandardMaterial({color:0x2b2a22,roughness:0.9});
  const tarp=at(new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,2.36,20),tarpM),5.18,by1+0.12,0); tarp.rotation.x=Math.PI/2; st.add(tarp);
  [-0.8,0,0.8].forEach(z=>{ const s=at(new THREE.Mesh(new THREE.TorusGeometry(0.163,0.012,6,22),strapM),5.18,by1+0.12,z); st.add(s); });
  // bidones: dos a cada lado del cestón
  [[-1,0],[-1,1],[1,0],[1,1]].forEach(([s,k])=>{ const c=can(); at(c,bx0+0.2+k*0.36,by0+0.24,s*(bz+0.1)); st.add(c); });
  // antenas con banderín OTAN (izq.) y bandera de España (dcha., la trasera derecha)
  const whipM=new THREE.MeshStandardMaterial({color:0x262823,roughness:0.5,metalness:0.5});
  const flagT=cvTex(96,64,(g,w,h)=>{ g.fillStyle='#AA151B'; g.fillRect(0,0,w,h); g.fillStyle='#F1BF00'; g.fillRect(0,h/4,w,h/2); });
  const natoT=cvTex(128,64,(g,w,h)=>{ g.clearRect(0,0,w,h); g.fillStyle='#0b2a5c'; g.beginPath(); g.moveTo(0,0); g.lineTo(w,h/2); g.lineTo(0,h); g.closePath(); g.fill();
      g.strokeStyle='#fff'; g.lineWidth=3; g.beginPath(); g.arc(32,32,13,0,7); g.stroke(); g.fillStyle='#fff'; g.beginPath(); g.moveTo(32,8); g.lineTo(36,32); g.lineTo(32,56); g.lineTo(28,32); g.closePath(); g.fill(); g.beginPath(); g.moveTo(8,32); g.lineTo(32,28); g.lineTo(56,32); g.lineTo(32,36); g.closePath(); g.fill(); });
  const wave=(w,h,amp)=>{ const g=new THREE.PlaneGeometry(w,h,14,3); g.translate(w/2,-h/2,0); const p=g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i); p.setZ(i,Math.sin(x/w*7.5)*amp*(x/w)); } g.computeVertexNormals(); return g; };
  ctx.flags=[];
  [[3.578,3.84,-1.695,1],[3.585,3.84,1.595,0]].forEach(([x,y,z,es])=>{ const H=2.0; st.add(rod(new THREE.Vector3(x,y,z),new THREE.Vector3(x+0.03,y+H,z),0.017,whipM,6));
    st.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.028,8,6),whipM),x+0.03,y+H,z));
    const fw=es?0.8:0.74, fh=es?0.53:0.36, g=wave(fw,fh,0.05);
    const fl=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:es?flagT:natoT,side:THREE.DoubleSide,roughness:0.85,transparent:!es,alphaTest:es?0:0.5}));
    fl.rotation.y=es?-0.75:-0.9; at(fl,x+0.03,y+H-0.06,z); st.add(fl); ctx.flags.push({g,w:fw,ph:es?0:1.7}); });
  ctx.wave=t=>{ ctx.flags.forEach(f=>{ const p=f.g.attributes.position; for(let i=0;i<p.count;i++){ const x=p.getX(i), u=x/f.w; p.setZ(i,(Math.sin(u*6.5-t*3.2+f.ph)*0.06+Math.sin(u*11-t*5.1+f.ph)*0.015)*u); } p.needsUpdate=true; f.g.computeVertexNormals(); }); };
  ctx.wave(0);
  // periscopio del jefe de carro (PERI R17)
  const paintN=wearMat({name:'paintN',color:LEO_OLIVE,rough:0.58,metal:0.2,cc:0.22,dust:0,dustTop:0.15,mott:0.08});
  const peri=new THREE.Group(); tKit.add(peri);
  peri.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.12,0.24,16),paintN),0,0.12,0));
  peri.add(at(new THREE.Mesh(rbox(0.3,0.22,0.27,0.035,3),paintN),0,0.34,0));
  peri.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.02,0.11,0.19),new THREE.MeshStandardMaterial({color:0x0c1418,roughness:0.08,metalness:0.9})),-0.15,0.35,0));
  at(peri,ctx.peri[0],ctx.peri[1],ctx.peri[2]);
  // cables de remolque sobre los guardabarros
  const braid=cvTex(64,16,(g,w,h)=>{ g.fillStyle='#3a3a35'; g.fillRect(0,0,w,h); g.strokeStyle='#5e5d55'; g.lineWidth=3; for(let i=-16;i<w+16;i+=8){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+10,h); g.stroke(); } });
  braid.wrapS=braid.wrapT=THREE.RepeatWrapping; braid.repeat.set(60,1);
  const cabM=wearMat({name:'cable',color:'#ffffff',map:braid,rough:0.55,metal:0.5,dust:0.7,dustTop:0.3,mott:0.1});
  ctx.cables.forEach(([x0,x1,y,z])=>{ const pts=[]; for(let i=0;i<=10;i++){ const t=i/10; pts.push(new THREE.Vector3(x0+(x1-x0)*t,y+Math.sin(t*Math.PI)*0.012,z+Math.sin(t*9)*0.01)); }
    hullBody.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,0.028,8,false),cabM));
    [x0,x1].forEach((xe,k)=>{ const t=at(new THREE.Mesh(new THREE.TorusGeometry(0.075,0.026,8,18),cabM),xe+(k?0.07:-0.07),y,z); t.rotation.x=Math.PI/2; hullBody.add(t); }); });
  // eslabones de repuesto en los costados de la torre
  const linkM=wearMat({name:'link',color:'#3f403b',rough:0.6,metal:0.55,dust:0.5,dustTop:0.4,mott:0.15});
  const linkG=new THREE.BoxGeometry(0.15,0.035,0.62), padG=new THREE.BoxGeometry(0.1,0.04,0.2);
  const ray0=new THREE.Raycaster(), tm=meshes.filter(o=>{let q=o;while(q){if(q===tBody)return true;q=q.parent;}return false;});
  ctx.links.forEach(([x,y,sg])=>{ ray0.set(new THREE.Vector3(x+0.25,y,sg*6),new THREE.Vector3(0,0,-sg)); const h=ray0.intersectObjects(tm,false)[0]; if(!h) return;
    const g=new THREE.Group(); for(let i=0;i<4;i++){ const l=at(new THREE.Mesh(linkG,linkM),i*0.165-0.25,0,0); g.add(l); [-0.18,0.18].forEach(dz=>g.add(at(new THREE.Mesh(padG,tyre),i*0.165-0.25,-0.03,dz))); }
    g.rotation.x=sg*Math.PI/2; at(g,x+0.25,y,h.point.z+sg*0.045); tBody.add(g); });
  // disco amarillo de clase de puente «70» y faros delanteros con su caja blindada
  const ray=new THREE.Raycaster();
  const hit=(o,d)=>{ ray.set(new THREE.Vector3(...o),new THREE.Vector3(...d).normalize()); const hm=meshes.filter(o=>{let q=o;while(q){if(q===hullBody)return true;q=q.parent;}return false;}); const h=ray.intersectObjects(hm,false)[0]; return h&&{p:h.point.clone(),n:h.face.normal.clone()}; };
  const disc=cvTex(128,128,(g,w,h)=>{ g.fillStyle='#e8b90f'; g.beginPath(); g.arc(64,64,62,0,7); g.fill(); g.strokeStyle='#111'; g.lineWidth=4; g.beginPath(); g.arc(64,64,57,0,7); g.stroke(); g.fillStyle='#111'; g.font='bold 62px Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('70',64,68); });
  const h70=hit([-6,ctx.disc[0],ctx.disc[1]],[1,0,0]);
  if(h70){ const d=new THREE.Mesh(new THREE.CircleGeometry(0.21,32),new THREE.MeshStandardMaterial({map:disc,roughness:0.6,metalness:0.05,polygonOffset:true,polygonOffsetFactor:-2})); d.position.copy(h70.p).addScaledVector(h70.n,0.012); { const zA=h70.n.clone().normalize(), xA=new THREE.Vector3(0,1,0).cross(zA).normalize(), yA=zA.clone().cross(xA); d.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xA,yA,zA)); } hullBody.add(d); }
  const glowT=cvTex(64,64,(g)=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,236,190,1)'); r.addColorStop(0.25,'rgba(255,200,120,0.55)'); r.addColorStop(1,'rgba(255,170,80,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); });
  const lensM=new THREE.MeshBasicMaterial({color:0xffe3b0});
  ctx.glows=[];
  ctx.lights.forEach(([y,z])=>{ const h=hit([-6,y,z],[1,0,0]); if(!h) return; const n=new THREE.Vector3(-1,0,0);
    const box=new THREE.Mesh(rbox(0.17,0.16,0.2,0.02,2),paint); box.position.copy(h.p).addScaledVector(n,0.07).setY(h.p.y+0.07); hullBody.add(box);
    const lens=new THREE.Mesh(new THREE.CircleGeometry(0.05,20),lensM); lens.position.copy(box.position).add(new THREE.Vector3(-0.086,0,0)); lens.rotation.y=-Math.PI/2; hullBody.add(lens);
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:0xffd090,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0.85})); gl.scale.set(0.5,0.5,1); gl.position.copy(lens.position).add(new THREE.Vector3(-0.03,0,0)); hullBody.add(gl); ctx.glows.push(gl); });
}

/* ---------- efectos reutilizables: fogonazo, humo, polvo, trazadoras, misil ---------- */
function makeFX(scene,maxP){
  const tex=cvTex(64,64,g=>{ const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.4,'rgba(255,255,255,0.6)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64); });
  const smk=cvTex(128,128,g=>{ for(let k=0;k<26;k++){ const a=Math.random()*6.283, d=Math.random()*30, x=64+Math.cos(a)*d, y=64+Math.sin(a)*d, rr=16+Math.random()*22;
      const r=g.createRadialGradient(x,y,0,x,y,rr); r.addColorStop(0,'rgba(255,255,255,0.5)'); r.addColorStop(0.55,'rgba(240,240,240,0.26)'); r.addColorStop(1,'rgba(220,220,220,0)'); g.fillStyle=r; g.fillRect(0,0,128,128); } });
  const P=[];
  for(let i=0;i<maxP;i++){ const s=new THREE.Sprite(new THREE.SpriteMaterial({map:smk,transparent:true,depthWrite:false,opacity:0})); s.visible=false; s.renderOrder=6; scene.add(s); P.push({s,life:0,max:1,v:new THREE.Vector3(),g0:1,g1:1,c0:new THREE.Color(),c1:new THREE.Color(),drag:2,o:1,up:0,add:false}); }
  const light=new THREE.PointLight(0xffb060,0,0,2); scene.add(light);
  let lt=0,lmax=1,lpk=0,sk=0; const items=[];
  function spawn(pos,vel,o){ const p=P.find(q=>q.life<=0)||P.reduce((a,b)=>a.life<b.life?a:b);
    p.s.position.copy(pos); p.v.copy(vel); p.max=p.life=o.life; p.g0=o.g0; p.g1=o.g1; p.c0.set(o.c0); p.c1.set(o.c1==null?o.c0:o.c1); p.drag=o.drag==null?2:o.drag; p.o=o.o==null?0.85:o.o; p.up=o.up||0;
    const add=!!o.add; if(p.add!==add){ p.add=add; p.s.material.blending=add?THREE.AdditiveBlending:THREE.NormalBlending; p.s.material.map=add?tex:smk; p.s.material.needsUpdate=true; }
    p.s.material.rotation=Math.random()*6.283; p.s.scale.set(o.g0,o.g0,1); p.s.visible=true; return p; }
  return {
    spawn, items,
    flash(pos,size,ms,peak){ spawn(pos,new THREE.Vector3(),{life:(ms||120)/1000,g0:size,g1:size*1.25,c0:0xfff4d0,c1:0xff9a30,o:1,add:true,drag:0}); light.position.copy(pos); lt=lmax=(ms||120)/1000+0.03; lpk=peak==null?160:peak; },
    shake(a){ sk=Math.max(sk,a); },
    active(){ return lt>0||sk>0.001||items.length>0||P.some(p=>p.life>0); },
    update(dt,cam){
      P.forEach(p=>{ if(p.life<=0) return; p.life-=dt; if(p.life<=0){ p.s.visible=false; p.s.material.opacity=0; return; }
        const t=1-p.life/p.max; p.v.multiplyScalar(Math.exp(-p.drag*dt)); p.v.y+=p.up*dt; p.s.position.addScaledVector(p.v,dt);
        const sc=p.g0+(p.g1-p.g0)*(1-(1-t)*(1-t)); p.s.scale.set(sc,sc,1); p.s.material.color.copy(p.c0).lerp(p.c1,Math.min(1,t*2.2));
        p.s.material.opacity=p.o*Math.min(1,t/0.06)*(p.add?Math.pow(1-t,1.4):Math.pow(1-t,0.9)); });
      if(lt>0){ lt-=dt; light.intensity=Math.max(0,lt/lmax)*lpk; } else light.intensity=0;
      for(let i=items.length-1;i>=0;i--){ if(!items[i](dt)) items.splice(i,1); }
      if(sk>0.001&&cam){ cam.position.x+=(Math.random()-0.5)*sk; cam.position.y+=(Math.random()-0.5)*sk; sk*=Math.exp(-dt*8); } else sk=0;
    },
    clear(){ P.forEach(p=>{p.life=0;p.s.visible=false;}); items.length=0; lt=0; light.intensity=0; sk=0; }
  };
}

/* ---------- Leopard 2 despiece ---------- */
// espacio del modelo: x hacia atrás, y arriba, z hacia la izquierda (cañón hacia -x)
const LEO={
  PART:{hull:[0,0,0],turret:[0,3.1,0],tracksL:[0,-0.7,2.7],tracksR:[0,-0.7,-2.7],skirtL:[0,0.5,4.6],skirtR:[0,0.5,-4.6]},
  PIECE:{gun:[-3.3,0.25,0],turret_kit:[0.3,1.3,0],stowage:[1.9,0.8,0],deck:[0.9,1.7,0],trackL:[0,-0.55,1.1],trackR:[0,-0.55,-1.1],driveL:[0,0.15,0.55],driveR:[0,0.15,-0.55]},
  PIVOT:{turret:[0.95,2.6,-0.04]}, sgn:()=>1,
  sweep:p=>(ss(0.03,0.13,p)-ss(0.16,0.25,p))*0.6, // la torre gira ~35° y vuelve
  gearHide:/(?!)/,
  yaw:[[0,1.12],[0.2,-0.2],[0.45,-0.7],[0.75,-1.15],[1,-2.45]],
  el:[[0,0.2],[0.2,0.26],[0.45,0.55],[0.75,0.62],[1,0.24]],
  LABELS:[
    ['gun','Cañón|Rheinmetall 120 mm','Gun|Rheinmetall 120 mm',1],
    ['turret_body','Torre|blindaje en cuña','Turret|wedge armour',1],
    ['deck','Motor|MTU MB 873 · 1.500 CV','Engine|MTU MB 873 · 1,500 hp',0],
    ['trackL','Cadenas y|tren de rodaje','Tracks and|running gear',1],
    ['stowage','Estiba|bidones y cestón','Stowage|jerrycans & basket',1],
    ['turret_kit','Visores y|lanzafumígenos','Sights and|smoke dischargers',0]],
  anchorC:true, fitA:[0.8,0.92], fitP:[0.02,0.1],
  look:{exp:0.84,env:0.55,key:1.75,rim:0.7,hemi:0.35,keyPos:[-7,13,8]},
  prep:leoPrep,
  ctx:{peri:[0.62,3.17,-0.98], cables:[[0.6,4.9,2.27,2.33],[0.6,4.9,2.27,-1.99]], links:[[0.55,2.62,1],[0.55,2.62,-1]], disc:[1.4,1.72], lights:[[1.52,2.12],[1.52,-1.72]]},
  maxP:40, cool:1600,
  shots:{ main(V){ const tip=V.pw('gun',[-7.0,2.515,-0.03]), dir=V.pd('gun',[-1,0,0]);
      V.fx.flash(tip.clone().addScaledVector(dir,0.7),3.4,130,240);
      if(V.reduced) return;
      V.kick('gun',[1,0,0],0.42,0.05,0.55); V.fx.shake(0.24);
      for(let i=0;i<4;i++) V.fx.spawn(tip.clone().addScaledVector(dir,0.5+i*0.55),dir.clone().multiplyScalar(6+i*3),{life:0.2+i*0.05,g0:1.1+i*0.3,g1:2.6+i*0.4,c0:0xffd98a,c1:0xff6a1a,o:0.95,add:true,drag:4});
      for(let i=0;i<24;i++){ const sp=new THREE.Vector3(Math.random()-0.5,(Math.random()-0.3)*0.6,Math.random()-0.5).multiplyScalar(2.6);
        V.fx.spawn(tip.clone().addScaledVector(dir,0.6+Math.random()*1.2),dir.clone().multiplyScalar(0.8+Math.random()*3.2).add(sp),{life:1.7+Math.random()*0.6,g0:0.9+Math.random()*0.4,g1:4.2+Math.random()*2.4,c0:i%3?0xe2a466:0xf0b878,c1:0xa59a86,o:0.9,drag:1.7,up:0.35}); }
      for(let i=0;i<6;i++){ const a=i*1.047+Math.random()*0.5, g=V.model([-5.4+Math.cos(a)*1.0,0.35,0.1+Math.sin(a)*1.4]);
        V.fx.spawn(g,new THREE.Vector3(Math.cos(a)*(2+Math.random()*3),0.4+Math.random()*0.8,Math.sin(a)*(2+Math.random()*3)),{life:1.8+Math.random()*0.5,g0:1.6,g1:4.6,c0:0xc9b28a,c1:0xb3a690,o:0.4,drag:1.6,up:0.25}); } } }
};
const F14C={PART,PIECE,PIVOT,sgn:pn=>pn==='wingL'?1:-1,sweep:p=>(ss(0.03,0.13,p)-ss(0.16,0.25,p))*0.84,gearHide:GEARHIDE,yaw:[[0,0.62],[0.2,-0.2],[0.45,-0.7],[0.75,-1.15],[1,-2.45]],el:[[0,0.2],[0.2,0.26],[0.45,0.55],[0.75,0.62],[1,0.24]],LABELS};

// F-14: ráfaga del M61 Vulcan (izquierda del morro) y lanzamiento de misil — solo efectos añadidos, el modelo no cambia
const TRG=new THREE.CylinderGeometry(0.035,0.035,1.8,5,1); TRG.rotateZ(Math.PI/2);
const TRM=new THREE.MeshBasicMaterial({color:0xffc060,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
function tracer(V,p,dir){ const m=new THREE.Mesh(TRG,TRM); m.position.copy(p); m.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),dir); m.renderOrder=6; V.scene.add(m);
  const v=dir.clone().multiplyScalar(85+Math.random()*10).add(new THREE.Vector3((Math.random()-0.5)*1.5,(Math.random()-0.5)*1.5,(Math.random()-0.5)*1.5)); let t=0;
  V.fx.items.push(dt=>{ t+=dt; m.position.addScaledVector(v,dt); if(t>0.42){ V.scene.remove(m); return false; } return true; }); }
function missileMesh(){ const g=new THREE.Group(), w=new THREE.MeshStandardMaterial({color:0xeeeeea,roughness:0.45,metalness:0.1}), d=new THREE.MeshStandardMaterial({color:0x50545a,roughness:0.5,metalness:0.3});
  const b=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,2.9,14),w); b.rotation.z=Math.PI/2; g.add(b);
  const n=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.42,14),w); n.rotation.z=Math.PI/2; n.position.x=-1.66; g.add(n);
  const fin=(x,s,c)=>{ for(let i=0;i<4;i++){ const f=new THREE.Mesh(new THREE.BoxGeometry(c,0.012,s),i%2?w:d); f.position.x=x; const a=i*Math.PI/2; f.position.y=Math.sin(a)*(0.1+s/2); f.position.z=Math.cos(a)*(0.1+s/2); f.rotation.x=a; g.add(f); } };
  fin(1.25,0.22,0.36); fin(-0.7,0.14,0.26); return g; }
F14C.maxP=56; F14C.cool=900;
F14C.shots={
  gun(V){ const q=V.pieces.gun||V.pieces.nose_misc; if(!q) return; const mp=[q.bmin.x-0.05,q.c.y,q.c.z]; const dir=V.pd(q.name,[-1,0,0]); let t=0,n=0;
    V.fx.items.push(dt=>{ t+=dt; while(n<16&&t>n*0.05){ const p=V.pw(q.name,mp); V.fx.flash(p,0.7+Math.random()*0.35,45,V.reduced?25:45); if(!V.reduced){ tracer(V,p,dir); if(n%3===0) V.fx.spawn(p,dir.clone().multiplyScalar(4),{life:0.9,g0:0.25,g1:1.0,c0:0x9a9a96,o:0.35,drag:2,up:0.3}); } n++; } return n<16; }); },
  missile(V){ const q=V.pieces.aim54_1||V.pieces.aim54_2||V.pieces.pylons; if(!q) return; const p0=V.pw(q.name,[q.c.x,q.bmin.y-0.3,q.c.z]); const fwd=V.pd(q.name,[-1,0,0]), down=V.pd(q.name,[0,-1,0]);
    if(V.reduced){ V.fx.flash(p0,1.4,160,80); return; }
    const m=missileMesh(); m.position.copy(p0); m.quaternion.setFromUnitVectors(new THREE.Vector3(-1,0,0),fwd); V.scene.add(m);
    const vel=down.clone().multiplyScalar(1.5); let t=0,lit=false,acc=0;
    V.fx.items.push(dt=>{ t+=dt; if(t<0.38){ vel.addScaledVector(down,9.8*dt); } else { if(!lit){ lit=true; V.fx.flash(m.position.clone().addScaledVector(fwd,-1.5),1.6,120,90); } vel.addScaledVector(fwd,75*dt); vel.multiplyScalar(Math.exp(-0.6*dt));
        const tail=m.position.clone().addScaledVector(fwd,-1.55); V.fx.spawn(tail,fwd.clone().multiplyScalar(-6),{life:0.09,g0:0.9,g1:0.5,c0:0xfff2c0,c1:0xff8020,o:1,add:true,drag:0});
        acc+=dt; while(acc>0.035){ acc-=0.035; V.fx.spawn(tail.clone(),new THREE.Vector3((Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6,(Math.random()-0.5)*0.6),{life:1.5,g0:0.4,g1:2.0,c0:0xffffff,c1:0xd9d9d6,o:0.55,drag:1.2,up:0.35}); } }
      m.position.addScaledVector(vel,dt); if(t>2.3){ V.scene.remove(m); m.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); return false; } return true; }); }
};
const CFGS={leo:LEO};
const DARK=new THREE.Color(0x0b0c0d), PAPER=new THREE.Color(0xefebe2), FIT=new Float32Array(17*8*3+48);

function viewer(sec,stage,model,opts){
  const C=(model.cfg&&CFGS[model.cfg])||F14C;
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
  if(C.look){ const L=C.look; renderer.toneMappingExposure=L.exp; scene.environmentIntensity=L.env; key.intensity=L.key; rim.intensity=L.rim; hemi.intensity=L.hemi; if(L.keyPos) key.position.fromArray(L.keyPos); }
  const cam=new THREE.PerspectiveCamera(30,1,0.5,400);
  const plane=new THREE.Group(); scene.add(plane);
  const U={uMix:{value:0},uPaper:{value:new THREE.Vector3(0.937,0.922,0.886)}};
  const lineMat=new THREE.LineBasicMaterial({color:0x1b1d1f,transparent:true,opacity:0,depthWrite:false});
  let idleT=0,W=0,H=0,ready=false,cur=0,target=0,drawn=-1,raf=0,last=0,visible=true,dead=false,secTop=0,secRange=1,expl=0;
  const parts=[], pieces={}, gearPieces=[], lines=[]; let labs=[];
  const fxbar=stage.querySelector('.m3fx'); let fx=null, V=null, fxOn=null, autoDone=false, cool=0, rp=0; const kicks=[];

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
  const files=[].concat(model.file), got=[], prog=files.map(()=>[0,0]); let left=files.length, bad=false;
  files.forEach((f,i)=>loader.load(f+'?v='+VER, g=>{ if(dead||bad) return; got[i]=g.scene; if(--left) return;
      const root=got[0]; for(let k=1;k<got.length;k++) got[k].children.slice().forEach(ch=>root.add(ch));
      if(C.prep) C.prep(root,C.ctx||{}); setup(root); ready=true; if(load) load.remove(); drawn=-1; if(reduced){pose(0);render();} },
    ev=>{ prog[i]=[ev.loaded,ev.total||0]; const L=prog.reduce((a,b)=>a+b[0],0), Tt=prog.reduce((a,b)=>a+b[1],0); if(load&&Tt&&prog.every(x=>x[1])) load.textContent=T('Cargando modelo 3D… ','Loading 3D model… ')+Math.round(L/Tt*100)+' %'; },
    ()=>{ bad=true; if(load) load.textContent=T('No se pudo cargar el modelo 3D.','The 3D model could not be loaded.'); }));

  function patchMat(m){
    if(m.userData.m3p) return; m.userData.m3p=1; if(m.map&&/^base_t/.test(m.name||'')) m.color.setRGB(0.8,0.8,0.82); m.polygonOffset=true; m.polygonOffsetFactor=1; m.polygonOffsetUnits=1;
    const tr=m.transparent;
    const pre=m.userData.pre, tag=m.userData.tag||'';
    m.onBeforeCompile=sh=>{ if(pre) pre(sh); sh.uniforms.uMix=U.uMix; sh.uniforms.uPaper=U.uPaper;
      sh.fragmentShader='uniform float uMix;\nuniform vec3 uPaper;\n'+sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n\tgl_FragColor.rgb=mix(gl_FragColor.rgb,uPaper,uMix);'+(tr?'\n\tgl_FragColor.a*=1.0-0.8*uMix;':'')); };
    m.customProgramCacheKey=()=>'m3p'+tag+(tr?'t':'o');
  }
  function setup(root){
    root.updateMatrixWorld(true);
    const box=new THREE.Box3().setFromObject(root), c=box.getCenter(new THREE.Vector3());
    const tmp=new THREE.Box3(), v=new THREE.Vector3();
    root.children.slice().forEach(p=>{
      const pn=p.name.replace(/^P_/,'');
      const P={name:pn,obj:p,dir:new THREE.Vector3().fromArray(C.PART[pn]||[0,0,0]),pcs:[],d:0};
      tmp.setFromObject(p); P.c=tmp.getCenter(new THREE.Vector3()); P.gear=/^(gear[LR]|ngear)$/.test(pn);
      P.corners=[0,1,2,3,4,5,6,7].map(i=>new THREE.Vector3(i&1?tmp.max.x:tmp.min.x,i&2?tmp.max.y:tmp.min.y,i&4?tmp.max.z:tmp.min.z).sub(c));
      p.children.slice().forEach(n=>{ tmp.setFromObject(n); const pc=tmp.getCenter(new THREE.Vector3());
        const pc2={name:n.name,obj:n,c:pc,base:n.position.clone(),bs:n.scale.clone(),off:new THREE.Vector3().fromArray(C.PIECE[n.name]||[0,0,0]),gear:C.gearHide.test(n.name)};
        pc2.bmin=tmp.min.clone(); pc2.bmax=tmp.max.clone(); pc2.inv0=n.matrixWorld.clone().invert(); if(C.anchorC) pc2.lc=n.worldToLocal(pc.clone());
        P.pcs.push(pc2); pieces[n.name]=pc2; if(pc2.gear) gearPieces.push(pc2); });
      if(C.PIVOT[pn]){ const pv=new THREE.Group(); pv.position.fromArray(C.PIVOT[pn]); p.add(pv); p.updateMatrixWorld(true); P.pcs.forEach(q=>{pv.attach(q.obj); q.base.copy(q.obj.position); q.bs.copy(q.obj.scale);}); P.pivot=pv; P.sgn=C.sgn(pn); P.pv=new THREE.Vector3().fromArray(C.PIVOT[pn]).sub(c); }
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
    labs=C.LABELS.filter(L=>!mob||L[3]).filter(L=>pieces[L[0]]).map(L=>{ const a=document.createElement('a'); a.className='m3l'; a.href=model.ficha; const tx=(isEN()?L[2]:L[1]).split('|'); a.innerHTML='<b>'+tx[0]+'</b>'+tx[1]; a.setAttribute('data-noi18n',''); lab.appendChild(a);
      const ln=document.createElementNS(svgNS,'polyline'); ln.setAttribute('fill','none'); ln.setAttribute('stroke','#1d1f21'); ln.setAttribute('stroke-width','0.8'); svg.appendChild(ln);
      const dot=document.createElementNS(svgNS,'circle'); dot.setAttribute('r','2.2'); dot.setAttribute('fill','#1d1f21'); svg.appendChild(dot);
      return {p:pieces[L[0]],a,ln,dot,w:0,h:0}; });
    labs.forEach(l=>{ l.w=l.a.offsetWidth; l.h=l.a.offsetHeight; });
    if(C.shots){ fx=makeFX(scene,C.maxP||40);
      V={fx,scene,cam,pieces,get reduced(){return reduced;},
        pw:(n,a)=>{ const q=pieces[n]; return new THREE.Vector3().fromArray(a).applyMatrix4(q.inv0).applyMatrix4(q.obj.matrixWorld); },
        pd:(n,a)=>{ const q=pieces[n], m=new THREE.Matrix4().multiplyMatrices(q.obj.matrixWorld,q.inv0); return new THREE.Vector3().fromArray(a).transformDirection(m); },
        model:a=>root.localToWorld(new THREE.Vector3().fromArray(a)),
        kick:(n,ax,dist,up,back)=>kicks.push({n,ax:new THREE.Vector3().fromArray(ax),dist,up,back,t:0,d:0})};
      if(fxbar) fxbar.querySelectorAll('button').forEach(b=>b.onclick=()=>shoot(b.getAttribute('data-shot')));
    }
  }
  function shoot(id){ if(!ready||!V||!C.shots[id]) return; const now=performance.now(); if(now<cool) return; cool=now+(C.cool||1500); plane.updateMatrixWorld(true); C.shots[id](V); last=0; }
  function tickFX(dt){ for(let i=kicks.length-1;i>=0;i--){ const k=kicks[i]; k.t+=dt; k.d=k.t<k.up?k.dist*k.t/k.up:k.dist*(1-ss(k.up,k.up+k.back,k.t)); if(k.t>k.up+k.back) kicks.splice(i,1); } }

  const wp=new THREE.Vector3();
  function pose(p){
    // fases
    const mix=ss(0.20,0.31,p)*(1-ss(0.83,0.93,p));
    const E=p<0.72?ramp(0.29,0.56,p):1-ramp(0.79,0.93,p);
    const E2=p<0.72?ss(0.46,0.66,p):1-ss(0.76,0.89,p);
    const G=ss(0.31,0.42,p)*(1-ss(0.86,0.93,p));
    const sweep=C.sweep(p); // F-14: 20°→68°→20° · Leopard: giro de torre
    expl=E;
    U.uMix.value=mix*0.93; lineMat.opacity=mix; const lv=mix>0.01; if(lines.length&&lines[0].visible!==lv) lines.forEach(l=>l.visible=lv);
    scene.background.copy(DARK).lerp(PAPER,mix);
    parts.forEach(P=>{ const e=ss(0,1,(E-P.d)/(1-P.d)); P.obj.position.copy(P.dir).multiplyScalar(e); if(P.pivot) P.pivot.rotation.y=P.sgn*sweep;
      P.pcs.forEach(q=>{ q.obj.position.copy(q.base).addScaledVector(q.off,E2); });
    });
    kicks.forEach(k=>{ const q=pieces[k.n]; if(q) q.obj.position.addScaledVector(k.ax,k.d); });
    if(C.ctx&&C.ctx.glows){ const gv=mix<0.01; C.ctx.glows.forEach(g=>g.visible=gv); }
    if(fxbar){ const on=ready&&(reduced?p<0.3:(p<0.035||p>0.955)); if(on!==fxOn){ fxOn=on; fxbar.classList.toggle('on',on); } }
    if(C.auto&&fx&&!autoDone&&!reduced&&p>0.975){ autoDone=true; setTimeout(()=>{ if(!dead&&cur>0.95) shoot(C.auto); },450); }
    gearPieces.forEach(q=>{ const s=Math.max(G,0.001); q.obj.scale.copy(q.bs).multiplyScalar(s); q.obj.visible=G>0.004; });
    // cámara: encuadre calculado con las cajas de las piezas (sin saltos)
    const port=W<H;
    const yaw=keyed(C.yaw,p);
    const el=keyed(C.el,p)+(port?0.1:0);
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
    d*=(port?1.04:1.1)*(C.fitA?lerp(C.fitA[port?0:1],1,Math.max(E,mix,C.fitP?ss(C.fitP[0],C.fitP[1],p):0)):1);
    const tx=cx, ty=cyy*ce, tz=-cyy*se; // centro en coordenadas de mundo
    cam.position.set(tx,ty+se*d,tz+ce*d); cam.lookAt(tx,ty,tz);
    // textos
    const tO=1-ss(0.025,0.08,p); ttl.style.opacity=tO; if(hint) hint.style.opacity=tO; if(bar) bar.style.transform='scaleX('+p.toFixed(4)+')';
    const lo=ss(0.6,0.66,p)*(1-ss(0.77,0.81,p)); lab.style.opacity=lo; lab.style.visibility=lo>0.01?'visible':'hidden';
    if(lo>0.01) placeLabels();
  }
  function placeLabels(){
    plane.updateMatrixWorld(true); cam.updateMatrixWorld();
    labs.forEach(l=>{ if(l.p.lc) wp.copy(l.p.lc).applyMatrix4(l.p.obj.matrixWorld); else l.p.obj.getWorldPosition(wp); wp.project(cam); l.x=(wp.x*0.5+0.5)*W; l.y=(-wp.y*0.5+0.5)*H; });
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
    if(!ready||!visible) return;
    if(!reduced){ const k=1-Math.exp(-dt/0.11); cur+=(target-cur)*k; if(Math.abs(target-cur)<0.0004) cur=target; }
    const fa=!!fx&&(fx.active()||kicks.length>0);
    const cw=C.ctx&&C.ctx.wave;
    if(fa||(!reduced&&cur!==drawn)){ tickFX(dt); pose(reduced?rp:cur); if(fx) fx.update(dt,cam); if(cw&&!reduced) cw(t/1000); render(); drawn=cur; }
    else if(cw&&!reduced&&t-idleT>70){ idleT=t; cw(t/1000); render(); }
  }
  size(true); measure();
  window.addEventListener('scroll',onScroll,{passive:true}); window.addEventListener('resize',onResize);
  const ro=('ResizeObserver' in window)?new ResizeObserver(()=>measure()):null; if(ro) ro.observe(document.body);
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting; if(visible){last=0;drawn=-1;}}):null; if(io) io.observe(stage);
  const vis=()=>{ if(!document.hidden){last=0;drawn=-1;} }; document.addEventListener('visibilitychange',vis);
  cur=target; raf=requestAnimationFrame(loop);
  window.MAT_M3D_DBG={get p(){return cur;},get t(){return target;},get ready(){return ready;},set:(p)=>{cur=target=p;pose(p);render();drawn=p;},calls:()=>renderer.info.render.calls,shoot:id=>shoot(id),get scene(){return scene;}};
  return {
    toggle(on){ if(!ready) return; rp=on?0.66:0; if(fx) fx.clear(); kicks.length=0; pose(rp); render(); },
    shoot,
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
  h+='<div class="m3soon"><svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><rect x="8" y="24" width="32" height="10" rx="3" fill="none" stroke="#6b7177" stroke-width="1.6"/><path d="M16 24v-5h12l4 5M28 21h14" fill="none" stroke="#6b7177" stroke-width="1.6"/><circle cx="14" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/><circle cx="24" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/><circle cx="34" cy="34" r="3" fill="none" stroke="#6b7177" stroke-width="1.4"/></svg><div>'+(en?'Coming soon: more models.':'Próximamente: más modelos.')+'</div></div></div>';
  ctx.set(h,en?'3D models':'Modelos 3D');
}
function viewPage(app,ctx,m){
  const en=isEN(); const rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  let h=ctx.crumbs([[en?'Home':'Inicio','#/'],[en?'3D models':'Modelos 3D','#/modelos-3d'],[m.name]])+
   '<section class="m3sec'+(rm?' rm':'')+'" data-noi18n><div class="m3stage"><canvas aria-label="'+ctx.esc(m.name)+' 3D"></canvas>'+
   '<div class="m3ttl"><h1>'+ctx.esc(m.name)+'</h1><p>'+ctx.esc(m.kind[en?1:0])+'</p></div>'+
   '<div class="m3load">'+(en?'Loading 3D model…':'Cargando modelo 3D…')+'</div><div class="m3lab" style="opacity:0;visibility:hidden"></div>'+
   (m.shots?'<div class="m3fx">'+m.shots.map(b=>'<button type="button" class="btn" data-shot="'+b[0]+'">'+ctx.esc(b[en?2:1])+'</button>').join('')+'</div>':'')+
   (rm?'<button type="button" class="btn m3rmb">'+(en?'Show parts':'Ver despiece')+'</button>':'<div class="m3hint">'+(en?'Scroll · it comes apart ↓':'Desliza · se desmonta ↓')+'</div><div class="m3bar"></div>')+
   '</div></section><div class="m3info" data-noi18n>'+(m.caption?'<p class="m3cap">'+ctx.esc(m.caption[en?1:0])+'</p>':'')+'<p>'+ctx.esc(m.desc[en?1:0])+'</p><div class="row"><a class="btn" href="'+m.ficha+'">'+(en?'See entry ›':'Ver ficha ›')+'</a>'+(m.ficha2?'<a class="btn" href="'+m.ficha2[0]+'">'+(en?'See ':'Ver ')+ctx.esc(m.ficha2[1])+' ›</a>':'')+'<a class="btn" href="#/modelos-3d">'+(en?'‹ All 3D models':'‹ Todos los modelos 3D')+'</a></div><p class="cr">'+ctx.esc(m.credit[en?1:0])+' <a href="#/license">LICENSE</a></p></div>';
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
