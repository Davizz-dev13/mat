/* M.A.T — visor 3D de «Crea tu soldado».
   Figura base: «Low Poly Soldiers Rigged Free» de madtrollstudio (Sketchfab), licencia CC BY 4.0 — reducida por M.A.T (una figura, colores de textura pasados a vértices, compresión meshopt).
   Chaleco, placas, mochilas y bolsas: modelos aproximados hechos por M.A.T en código a partir de medidas oficiales cuando existen (placas SAPI/ESAPI: BAE Systems); el resto, forma orientativa.
   Arma: el modelo del Armero 3D (con sus accesorios) a escala real. */
import * as THREE from './three.module.min.js';
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const BASE_H=1.774;              // altura de la figura sin casco (m)
const U2M=1/1.18;                // unidades del Armero -> metros (0,00118 unidades por mm)
const CX=-0.5405;                // eje central de la figura en el archivo
/* empuñadura (unidades del Armero) medida por M.A.T sobre cada modelo */
const GRIP={'m4a1':[-0.03,-0.02],'scar-l':[-0.03,-0.01],'scar-h':[-0.03,-0.01],'mp7a1':[-0.02,-0.05],'sr-25':[-0.02,0.0],'m82a1':[-0.03,0.0],'p90':[-0.03,0.02],'aug':[0.05,-0.05],'l85a2':[0.02,-0.05],'m16a4':[-0.065,0.01],'g18c':[0.02,0.01],'m9':[0.015,0.02],'m24':[-0.10,0.0],'awm':[-0.07,0.04],'hk416':[-0.13,-0.04],'hk417':[-0.28,-0.05],'g36':[-0.25,-0.03],'ak74':[-0.21,-0.04],'ak12':[-0.25,-0.06],'famas':[-0.03,-0.05],'tavor':[0.04,-0.05],'mp5':[-0.08,-0.06],'m249':[-0.27,-0.05],'m240':[-0.36,-0.07],'pkm':[-0.33,-0.04]};
const GRIP_PISTOL=[-0.045,-0.035];   // pistolas: empuñadura aproximada respecto al centro del modelo
/* dirección del arma en la pose (eje del FN SCAR original del modelo base) */
const AX=new THREE.Vector3(0.9176,-0.3595,-0.1695).normalize(), UPV=new THREE.Vector3(0.3384,0.9303,-0.1413);
const FABV=`attribute float _fab; varying float vFab; varying vec3 vCP;`;
let SOLP=null; function soldier(M){ if(!SOLP){ SOLP=new Promise((res,rej)=>{ import('./gltf.min.js').then(G=>{ const l=new G.GLTFLoader(); l.setMeshoptDecoder(G.MeshoptDecoder); l.load('m3d/soldado/soldado.glb?v='+VER,res,undefined,rej); }).catch(rej); }).catch(e=>{ SOLP=null; throw e; }); } return SOLP; }
function uniPatch(m,U,M){ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
   sh.vertexShader=FABV+'\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvFab=_fab; vCP=position*1.7;');
   sh.fragmentShader='varying float vFab;\n'+M.GHEAD+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(vFab>0.5){ if(uMode==0){ diffuseColor.rgb=vec3(0.279,0.246,0.188); } '+M.GCOL+' }'); };
  m.customProgramCacheKey=()=>'matsoldfab2'; }
function mat(col,r){ return new THREE.MeshStandardMaterial({color:col,roughness:r==null?0.85:r,metalness:0.02}); }
function rbox(w,h,d,m){ const g=new THREE.BoxGeometry(w,h,d,1,1,1); const o=new THREE.Mesh(g,m); o.castShadow=true; return o; }
function cyl(r,h,m,n){ const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n||12),m); o.castShadow=true; return o; }
export async function mount(stage,st,D,M,opt){
  const V=M.viewer(stage,{yaw:0.5,pitch:0.05,zoom:0.6}); if(!V) throw new Error('webgl');
  const g=await soldier(M);
  /* un solo esqueleto: se reutiliza la misma escena (sin SkeletonUtils); al cerrar se le quita todo lo añadido */
  const body=g.scene; const holder=new THREE.Group(); holder.add(body); V.holder.add(holder);
  body.position.set(-CX,0,0);
  const UF=M.mkU(), UG=M.mkU(), UW=M.mkU(), UA=M.mkU(); [UF,UG,UW,UA].forEach(u=>V.track(u.uInv));
  const bones={}; let helmet=null, beard=null;
  body.traverse(o=>{ if(o.isBone) bones[o.name.replace(/[_\d]+$/,'').replace(/\./g,'')]=o; if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; if(!o.userData.orig) o.userData.orig=o.material; o.material=o.userData.orig.clone(); o.material.roughness=0.88; o.material.metalness=0; if(o.geometry.attributes._fab) uniPatch(o.material,UF,M); if(o.name==='Helmet') helmet=o; if(o.name==='Beard') beard=o; } });
  body.updateMatrixWorld(true);
  const bone=n=>bones[n]||Object.values(bones)[0];
  const gearG=new THREE.Group(); body.add(gearG);       // equipo en coordenadas del archivo (metros)
  const gm={ c:mat(0x7c6a4e), d:mat(0x5d5040), k:mat(0x2a2b2c,0.6), p:mat(0x3b3f36,0.7) };
  Object.values(gm).forEach(m=>M.camoPatch(m,UG));
  let wpn=null, wkey='', hol=null;
  function palm(){ const h=bone('DEF-handR'); const p=h.getWorldPosition(new THREE.Vector3()); const a=h.localToWorld(new THREE.Vector3(0,1,0)).sub(p).normalize(); return body.worldToLocal(p.add(a.multiplyScalar(0.075))); }
  async function setWeapon(){ const b=st.arma; const key=b?JSON.stringify([b.id,b.v||0,b.on||{}]):''; if(key===wkey) return; wkey=key;
    if(wpn){ body.remove(wpn); wpn=null; } if(!b) { V.recenter(); return; }
    try{ const r=await M.buildWeapon(b,UW,UA); if(key!==wkey) return; const o=r.o; const vid=r.v.id; const gp=GRIP[vid]||GRIP[r.w.id]||(r.w.cat==='pistol'?GRIP_PISTOL:[0,0]);
      const z=AX.clone(), y=UPV.clone().sub(z.clone().multiplyScalar(UPV.dot(z))).normalize(), x=new THREE.Vector3().crossVectors(y,z);
      const R=new THREE.Matrix4().makeBasis(x,y,z); o.quaternion.setFromRotationMatrix(R);
      body.updateMatrixWorld(true); o.userData.gp=gp; o.userData.P=palm(); body.add(o); wpn=o; placeW(); o.traverse(q=>{ if(q.isMesh) q.castShadow=true; }); V.recenter(); credits(r); }catch(e){ console.warn('soldado arma',e); }
  }
  function placeW(){ if(!wpn) return; const s=holder.scale.x||1, gp=wpn.userData.gp; wpn.scale.setScalar(U2M/s); const off=new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(U2M/s).applyQuaternion(wpn.quaternion); wpn.position.copy(wpn.userData.P).sub(off); }
  function credits(r){ if(!opt.cred) return; const w=r?r.w:null; opt.cred.innerHTML=L('Figura base: «','Base figure: “')+'<a href="https://sketchfab.com/3d-models/low-poly-soldiers-rigged-free-8474871344b041b690d9c91d983cc214" target="_blank" rel="noopener">Low Poly Soldiers Rigged Free</a>'+L('» de ','” by ')+'<a href="https://sketchfab.com/madtrollstudio" target="_blank" rel="noopener">madtrollstudio</a> (Sketchfab), '+L('licencia','licence')+' <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>; '+L('M.A.T la ha reducido a una figura, recolocado el torso y añadido camuflajes.','M.A.T reduced it to one figure, swapped the torso and added camouflages.')+' <b>'+L('Chaleco, placas, mochilas y bolsas: modelo aproximado hecho por MAT a partir de medidas oficiales','Vest, plates, packs and pouches: approximate model built by MAT from official dimensions')+'</b> '+L('(placas SAPI/ESAPI con las medidas de BAE Systems; donde no hay medida publicada, forma orientativa).','(SAPI/ESAPI plates with BAE Systems dimensions; where no dimension is published, the shape is indicative).')+(w?' '+L('Arma: modelo del Armero 3D','Weapon: 3D Gunsmith model')+' (<a href="#/armero/'+w.id+'">'+w.n+'</a>), '+L('a escala real','at real scale')+'.':'')+' <a href="#/license">'+L('Licencias','Licences')+'</a>'; }
  function plateDims(){ const q=st.q, D2=D.items; for(const k of Object.keys(q)){ const it=D2[k]; if(it&&it.c==='plate'&&k!=='side'&&it.dims){ const d=Array.isArray(it.dims)?it.dims:(it.dims.M||null); if(Array.isArray(d)) return [d[0]/1000,d[1]/1000]; } } return [0.241,0.318]; }
  function has(id){ return (st.q[id]||0)>0; }
  function anyOf(c){ return Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].c===c); }
  function visTag(t){ return Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].vis===t); }
  /* ---- superficie real del cuerpo (posada): el equipo se construye pegado a ella ---- */
  const torsoM=(()=>{ let t=null; body.traverse(o=>{ if(o.isSkinnedMesh&&o.name==='Torso') t=o; }); return t; })();
  const legsM=(()=>{ let t=null; body.traverse(o=>{ if(o.isSkinnedMesh&&o.name==='Legs') t=o; }); return t; })();
  function posed(mesh,filter){ const pos=mesh.geometry.attributes.position, idx=mesh.geometry.index, si=mesh.geometry.attributes.skinIndex, sw=mesh.geometry.attributes.skinWeight; const bn=mesh.skeleton.bones.map(b=>b.name);
    const v=new THREE.Vector3(), inv=new THREE.Matrix4().copy(body.matrixWorld).invert(), M2=new THREE.Matrix4().multiplyMatrices(inv,mesh.matrixWorld); const P=new Float32Array(pos.count*3), keep=new Uint8Array(pos.count);
    for(let i=0;i<pos.count;i++){ mesh.getVertexPosition(i,v); v.applyMatrix4(M2); P[i*3]=v.x; P[i*3+1]=v.y; P[i*3+2]=v.z; let best=0,bi=0; for(let k=0;k<4;k++){ const w=sw.getComponent(i,k); if(w>best){ best=w; bi=si.getComponent(i,k); } } keep[i]=filter(v,bn[bi])?1:0; }
    const tri=[]; const n=idx?idx.count:pos.count; for(let t=0;t<n;t+=3){ const a=idx?idx.getX(t):t, b=idx?idx.getX(t+1):t+1, c=idx?idx.getX(t+2):t+2; if(keep[a]&&keep[b]&&keep[c]) tri.push(a,b,c); }
    return {P,tri}; }
  /* cáscara: triángulos del cuerpo desplazados hacia fuera por su normal suavizada (t en metros; extra(x,y,z) añade grosor por zonas) */
  function shell(src,t,extra){ const {P,tri}=src; const key=i=>Math.round(P[i*3]*500)+'_'+Math.round(P[i*3+1]*500)+'_'+Math.round(P[i*3+2]*500);
    const acc=new Map(), a=new THREE.Vector3(), b=new THREE.Vector3(), c=new THREE.Vector3(), nrm=new THREE.Vector3();
    for(let k=0;k<tri.length;k+=3){ a.fromArray(P,tri[k]*3); b.fromArray(P,tri[k+1]*3); c.fromArray(P,tri[k+2]*3); nrm.subVectors(c,b).cross(a.clone().sub(b)); for(const i of [tri[k],tri[k+1],tri[k+2]]){ const kk=key(i); const s=acc.get(kk)||new THREE.Vector3(); s.add(nrm); acc.set(kk,s); } }
    const out=new Float32Array(tri.length*3), uv=new Float32Array(tri.length*2); const p=new THREE.Vector3();
    for(let k=0;k<tri.length;k++){ const i=tri[k]; p.fromArray(P,i*3); const n2=acc.get(key(i)).clone().normalize(); const tt=t+(extra?extra(p.x,p.y,p.z):0); p.addScaledVector(n2,tt); out.set([p.x,p.y,p.z],k*3);
      const ang=Math.atan2(p.x-CX,p.z+0.02); uv[k*2]=ang*0.17/0.1; uv[k*2+1]=p.y/0.1; }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(out,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.computeVertexNormals(); return g; }
  /* textura de tela con hileras MOLLE (cinta de 25 mm cada 25 mm, costuras cada 38 mm), generada en código */
  function molleTex(){ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.fillStyle='#cfcfcf'; x.fillRect(0,0,128,128);
    for(let i=0;i<4;i++){ const y=i*32; x.fillStyle='#a9a9a9'; x.fillRect(0,y+4,128,14); x.fillStyle='#8e8e8e'; x.fillRect(0,y+4,128,2); x.fillRect(0,y+16,128,2); for(let s=0;s<128;s+=24){ x.fillStyle='#7a7a7a'; x.fillRect(s,y+4,3,14); } }
    for(let k=0;k<900;k++){ x.fillStyle='rgba(0,0,0,'+(Math.random()*0.06)+')'; x.fillRect(Math.random()*128,Math.random()*128,1,1); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
  const MT_=molleTex(); const gm2={ v:new THREE.MeshStandardMaterial({color:0x8a7656,map:MT_,roughness:0.95,metalness:0}), p:new THREE.MeshStandardMaterial({color:0x7a684c,roughness:0.97,metalness:0}) };
  [gm2.v,gm2.p].forEach(m=>{ m.side=THREE.DoubleSide; M.camoPatch(m,UG); });
  body.updateMatrixWorld(true);
  const TORSO=torsoM?posed(torsoM,(v,b)=>/spine|Chest|neck|pelvis/.test(b)&&v.y>1.0&&v.y<1.47):null;
  const ray=new THREE.Raycaster();
  function hit(mesh,o,d){ if(!mesh) return null; body.updateMatrixWorld(true); const s=holder.scale.x||1; ray.set(body.localToWorld(o.clone()),d.clone().normalize()); ray.far=2*s; const h=ray.intersectObject(mesh,false)[0]; return h?body.worldToLocal(h.point.clone()):null; }
  function onShell(sh,x,y,front){ const o=new THREE.Vector3(x,y,front?0.6:-0.8), d=new THREE.Vector3(0,0,front?-1:1); return hit(sh,o,d); }
  function rebuildGear(){ gearG.clear(); if(!TORSO) return;
    const vest=anyOf('vest'), plateSel=Object.keys(st.q).find(k=>D.items[k]&&D.items[k].c==='plate'&&k!=='side'&&st.q[k]>0), iba=has('iba');
    let sh=null;
    if(vest||plateSel){ const [pw,ph]=plateDims(); const y0=1.235, T=vest?0.012:0.008, PT=(plateSel||iba)?0.016:0;
      const extra=(x,y,z)=>(Math.abs(x-CX)<pw/2+0.01&&Math.abs(y-y0)<ph/2+0.01)?PT:0;          // grosor extra donde van las placas (medidas oficiales)
      const src=iba?TORSO:{P:TORSO.P,tri:TORSO.tri.filter((_,k,arr)=>true)};
      sh=new THREE.Mesh(shell(iba?TORSO:clip(TORSO,iba),T,extra),gm2.v); sh.castShadow=true; sh.receiveShadow=true; gearG.add(sh); sh.updateMatrixWorld(true);
      if(has('side')) [-1,1].forEach(s=>{ const p=hit(sh,new THREE.Vector3(CX+s*0.4,y0-0.07,-0.02),new THREE.Vector3(-s,0,0)); if(p){ const sp=rbox(0.022,0.203,0.152,gm2.p); sp.position.copy(p).add(new THREE.Vector3(s*0.011,0,0)); gearG.add(sp); } });
      /* bolsas portacargadores (medidas de un cargador STANAG de 30: 70 × 190 mm; la bolsa tapa unos 2/3) pegadas al panel delantero */
      const nm=Math.min(3,Math.ceil(((st.q.mag556||0)+(st.q.saw100||0))/2)); for(let i=0;i<nm;i++){ const x=CX+(i-(nm-1)/2)*0.078, p=onShell(sh,x,y0-0.1,true); if(!p) continue; const pu=rbox(0.072,0.125,0.04,gm2.p); pu.position.set(x,p.y,p.z+0.018); gearG.add(pu); const fl=rbox(0.074,0.02,0.044,gm2.v); fl.position.set(x,p.y+0.065,p.z+0.02); gearG.add(fl); }
      if(visTag('radio')){ const x=CX+0.11, p=onShell(sh,x,y0+0.11,true); if(p){ const pu=rbox(0.07,0.13,0.045,gm2.p); pu.position.set(x,p.y,p.z+0.02); gearG.add(pu); const ra=rbox(0.06,0.04,0.038,gm.k); ra.position.set(x,p.y+0.08,p.z+0.02); gearG.add(ra); const an=cyl(0.005,0.12,gm.k,6); an.position.set(x+0.02,p.y+0.16,p.z+0.02); gearG.add(an); } }
      const ng=Math.min(2,(st.q.frag||0)+(st.q.smoke||0)); for(let i=0;i<ng;i++){ const x=CX-0.11-i*0.06, p=onShell(sh,x,y0+0.05,true); if(!p) continue; const gp=rbox(0.06,0.09,0.06,gm2.p); gp.position.set(x,p.y,p.z+0.028); gearG.add(gp); }
    }
    if(helmet) helmet.visible=anyOf('helmet');
    if(anyOf('helmet')&&(visTag('nvg')||visTag('nvg2'))){ const two=visTag('nvg2'); const f=hit(helmet,new THREE.Vector3(CX,1.70,0.6),new THREE.Vector3(0,0,-1))||new THREE.Vector3(CX,1.70,0.11);
      const mnt=rbox(0.045,0.035,0.022,gm.k); mnt.position.set(CX,f.y,f.z+0.01); gearG.add(mnt); 
      const z1=f.z+0.05; /* visor abatido hacia arriba (posición de transporte), pegado al frontal del casco */
      if(two){ [-1,1].forEach(s=>{ const t=cyl(0.021,0.119,gm.k,14); t.rotation.x=Math.PI/2; t.position.set(CX+s*0.032,f.y+0.015,z1); gearG.add(t); }); }
      else { const t=cyl(0.0255,0.114,gm.k,14); t.rotation.x=Math.PI/2; t.position.set(CX-0.03,f.y+0.015,z1); gearG.add(t); } }
    /* mochilas: apoyadas en la espalda (superficie real) */
    const ruck=has('ruck'), ap=has('apack'); const back=y=>{ const p=sh?onShell(sh,CX,y,false):hit(torsoM?torsoProxy():null,new THREE.Vector3(CX,y,-0.8),new THREE.Vector3(0,0,1)); return p?p.z:-0.19; };
    if(ruck){ const zb=back(1.2); const r=rbox(0.36,0.52,0.22,gm2.v); r.position.set(CX,1.13,zb-0.11-0.005); gearG.add(r); const lid=rbox(0.34,0.09,0.21,gm2.p); lid.position.set(CX,1.43,zb-0.11); gearG.add(lid);
      [-1,1].forEach(s=>{ const pk=rbox(0.08,0.22,0.08,gm2.p); pk.position.set(CX+s*0.22,1.05,zb-0.13); gearG.add(pk); });
      if(has('sbag')||has('pad')){ const sb=cyl(0.08,0.36,gm.p,16); sb.rotation.z=Math.PI/2; sb.position.set(CX,0.82,zb-0.13); gearG.add(sb); } }
    if(ap){ const zb=back(1.25); const a=rbox(0.3,0.42,0.15,gm2.p); a.position.set(CX,ruck?1.16:1.22,(ruck?zb-0.225:zb)-0.075-0.004); gearG.add(a); }
    if(has('medbag')){ const zb=back(1.0); const mb=rbox(0.36,0.26,0.18,gm2.p); mb.position.set(CX,ruck?0.78:0.98,zb-0.09-(ruck?0.12:0)); gearG.add(mb); }
    if(visTag('at4')){ const zb=back(1.25); const t=cyl(0.042,1.0,gm.p,14); t.position.set(CX+0.05,1.25,zb-(ruck?0.26:0.06)); t.rotation.z=0.45; gearG.add(t); }
    /* cinturón: cantimploras y pala pegadas a la cadera */
    const hip=(x,z)=>{ const o=new THREE.Vector3(x,0.99,z*0.9), d=new THREE.Vector3(CX-x,0,-z*0.2).normalize(); return hit(legsM,new THREE.Vector3(x+(x-CX)*2,0.99,z),new THREE.Vector3(-(x-CX),0,0).normalize()); };
    if(has('cant')){ const n=Math.min(2,st.q.cant); for(let i=0;i<n;i++){ const s=i?1:-1; const p=hit(legsM,new THREE.Vector3(CX+s*0.5,0.99,-0.06),new THREE.Vector3(-s,0,0)); if(!p) continue; const c=cyl(0.042,0.17,gm.p,14); c.position.set(p.x+s*0.045,0.99,-0.06); gearG.add(c); } }
    if(has('etool')){ const p=hit(legsM,new THREE.Vector3(CX+0.12,0.99,-0.6),new THREE.Vector3(0,0,1)); if(p){ const e=rbox(0.15,0.21,0.05,gm2.p); e.position.set(CX+0.12,0.97,p.z-0.028); gearG.add(e); } }
    gearG.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    holster(); }
  function clip(src){ return src; }
  function torsoProxy(){ return torsoM; }
  async function holster(){ const on=visTag('holster'); if(!on){ if(hol){ body.remove(hol); hol=null; } return; } if(hol) return;
    try{ const r=await M.buildWeapon({id:'m9',v:0,on:{}},UW,UA); if(!visTag('holster')) return; const o=r.o; o.scale.setScalar(U2M); const tp=hit(legsM,new THREE.Vector3(CX-0.6,0.8,0.0),new THREE.Vector3(1,0,0)); const hx=tp?tp.x-0.026:CX-0.205; o.rotation.set(Math.PI/2+0.05,0,0); o.position.set(hx,0.86,0.0);
      const h=rbox(0.045,0.2,0.09,gm.k); h.position.set(hx,0.78,0.0); const g2=new THREE.Group(); g2.add(o); g2.add(h); body.add(g2); hol=g2; V.recenter(); }catch(e){ console.warn(e); } }
  function camos(){ M.setU(UF,st.ucamo||'orig'); M.setU(UG,st.gcamo||'orig'); M.setU(UW,(st.arma&&st.arma.camo)||'orig'); M.setU(UA,(st.arma&&st.arma.ca)?(st.arma.camo||'orig'):'orig'); V.redraw(); }
  function scale(){ const s=Math.max(140,Math.min(215,+st.h||175))/100/BASE_H; holder.scale.setScalar(s); placeW(); V.recenter(); }
  function camUI(){ if(!opt.cam) return; const C=M.CAMO; const row=(id,lab,cur)=>'<div class="sd-src" style="margin-top:6px"><b>'+lab+'</b></div><div class="sd-cam" data-k="'+id+'">'+C.map(c=>'<button type="button" title="'+LL(c[1])+'" aria-label="'+LL(c[1])+'" data-c="'+c[0]+'" class="'+(c[0]===(cur||'orig')?'on':'')+'" style="background:'+(c[0]==='orig'?(id==='ucamo'?'#908878':'#7c6a4e'):M.sw(c[2]))+'"></button>').join('')+'</div>';
    opt.cam.innerHTML=row('ucamo',L('Camuflaje del uniforme','Uniform camouflage'),st.ucamo)+row('gcamo',L('Camuflaje del equipo','Gear camouflage'),st.gcamo)+'<div class="sd-src">'+L('Patrones genéricos generados por M.A.T (sin archivos de patrones con marca). El camuflaje del arma se elige en el Armero.','Generic patterns generated by M.A.T (no trademarked pattern files). The weapon camouflage is chosen in the Gunsmith.')+'</div>'; }
  if(opt.cam) opt.cam.addEventListener('click',e=>{ const b=e.target.closest('button[data-c]'); if(!b) return; const k=b.parentNode.dataset.k; st[k]=b.dataset.c; camUI(); camos(); opt.save&&opt.save(); });
  const ld=stage.querySelector('.sd-load'); if(ld) ld.remove();
  const bt=document.createElement('div'); bt.className='arm-btns'; bt.innerHTML='<button type="button" class="arm-btn" data-x="rot">'+L('Pausar giro','Pause spin')+'</button><button type="button" class="arm-btn" data-x="rs">'+L('Vista inicial','Reset view')+'</button>'; stage.appendChild(bt);
  let spin=true; bt.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); if(b.dataset.x==='rot'){ spin=!spin; V.setAuto(spin); b.textContent=spin?L('Pausar giro','Pause spin'):L('Girar','Spin'); } else V.reset(); });
  bt.addEventListener('pointerdown',e=>e.stopPropagation());
  camUI(); camos(); rebuildGear(); scale(); V.fit(holder); credits(null); await setWeapon();
  window.MAT_SOLDADO_DBG={ hit:(x,y,f)=>{ const sh=gearG.children[0]; const p=sh?onShell(sh,x,y,f):null; return [gearG.children.length, sh&&sh.geometry.attributes.position.count, p&&p.toArray(), body.position.toArray(), holder.scale.x]; }, still:(y)=>{ V.setAuto(false); V.reset(); if(y!=null) V.look(y); },  gear:()=>gearG.children.length, weapon:()=>!!wpn, helmet:()=>helmet&&helmet.visible, scale:()=>holder.scale.x };
  return { update(s){ rebuildGear(); scale(); camos(); setWeapon(); }, destroy(){ try{ body.remove(gearG); if(wpn) body.remove(wpn); if(hol) body.remove(hol); holder.remove(body); body.position.set(0,0,0); V.holder.remove(holder); }catch(e){} V.destroy(); } };
}
