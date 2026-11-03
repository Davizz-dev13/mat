/* M.A.T — visor 3D de «Crea tu soldado».
   Figura: «Soldier Full Tactical Gear (LowPolyGameReady)» de DanlyVostok (Sketchfab), CC BY 4.0 — optimizada por M.A.T (texturas reducidas, meshopt).
   Visor nocturno: «AN/PVS-14 NVD» de knolp (Sketchfab), CC BY 4.0, a escala con la longitud oficial.
   Mochilas, cantimploras y similares: modelos aproximados hechos por M.A.T en código; el arma es el modelo del Armero 3D a escala real.
   Pose: M.A.T recoloca los brazos con cinemática inversa para que las manos sujeten el arma elegida. */
import * as THREE from './three.module.min.js';
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const BASE_H=1.809, U2M=1/1.18, PVS_LEN=0.114;
const GRIP={'m4a1':[-0.03,-0.02],'scar-l':[-0.03,-0.01],'scar-h':[-0.03,-0.01],'mp7a1':[-0.02,-0.05],'sr-25':[-0.02,0.0],'m82a1':[-0.03,0.0],'p90':[-0.03,0.02],'aug':[0.05,-0.05],'l85a2':[0.02,-0.05],'m16a4':[-0.065,0.01],'m24':[-0.10,0.0],'awm':[-0.07,0.04],'hk416':[-0.13,-0.04],'hk417':[-0.28,-0.05],'g36':[-0.25,-0.03],'ak74':[-0.21,-0.04],'ak12':[-0.25,-0.06],'famas':[-0.03,-0.05],'tavor':[0.04,-0.05],'mp5':[-0.08,-0.06],'m249':[-0.27,-0.05],'m240':[-0.36,-0.07],'pkm':[-0.33,-0.04]};
const GRIP_PISTOL=[-0.045,-0.035];
/* armas con empuñadura delantera fija: punto de la mano de apoyo [z,y] en unidades del modelo (se ajusta tras revisar la hoja de contactos) */
const LH={};
/* camuflaje sobre tela con textura: conserva el relieve de la tela (luminancia) y cambia el color */
const CAMV=`varying vec3 vCP; uniform mat4 uInv;`;
function camoTex(m,U,M){ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
  sh.vertexShader=CAMV+'\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=position*1.6;');
  sh.fragmentShader=M.GHEAD+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(uMode>0){ float lum=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114)); vec3 base=diffuseColor.rgb; '+M.GCOL+' diffuseColor.rgb*=clamp(lum/0.16,0.5,1.5); }'); };
  m.customProgramCacheKey=()=>'matsoldtex1'; }
let SOLP=null, PVSP=null, GL=null;
function loader(){ return GL?Promise.resolve(GL):import('./gltf.min.js').then(G=>{ const l=new G.GLTFLoader(); l.setMeshoptDecoder(G.MeshoptDecoder); GL=l; return l; }); }
function load(u){ return loader().then(l=>new Promise((res,rej)=>l.load(u+'?v='+VER,res,undefined,rej))); }
function rbox(w,h,d,m){ const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m); o.castShadow=true; return o; }
function cyl(r,h,m,n){ const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,n||14),m); o.castShadow=true; return o; }
export async function mount(stage,st,D,M,opt){
  const V=M.viewer(stage,{yaw:0.5,pitch:0.05,zoom:0.6}); if(!V) throw new Error('webgl');
  if(!SOLP) SOLP=load('m3d/soldado/soldado_r.glb').catch(e=>{ SOLP=null; throw e; });
  { const rim=new THREE.DirectionalLight(0xdde6ff,0.45); rim.position.set(2.5,3,-4); V.scene.add(rim); const fill=new THREE.DirectionalLight(0xfff2e2,0.4); fill.position.set(3,1.2,3.5); V.scene.add(fill); }
  const g=await SOLP; const body=g.scene; const holder=new THREE.Group(); holder.add(body); V.holder.add(holder); body.position.set(0,0,0);
  const UF=M.mkU(), UG=M.mkU(), UW=M.mkU(), UA=M.mkU(); [UF,UG,UW,UA].forEach(u=>V.track(u.uInv));
  const bones={}, mesh={};
  body.traverse(o=>{ if(o.isBone) bones[o.name]=o; if(o.isMesh){ mesh[o.name]=o; o.castShadow=true; o.receiveShadow=true; o.frustumCulled=false;
    if(!o.userData.orig) o.userData.orig=o.material; o.material=o.userData.orig.clone();
    if(/^(kitel|pants)/.test(o.name)) camoTex(o.material,UF,M); else if(/^(plate|pouches|helmet)/.test(o.name)) camoTex(o.material,UG,M); } });
  if(!body.userData.rest){ body.userData.rest={}; Object.values(bones).forEach(b=>body.userData.rest[b.name]=b.quaternion.clone()); }
  Object.values(bones).forEach(b=>{ const q=body.userData.rest[b.name]; if(q) b.quaternion.copy(q); });
  body.updateMatrixWorld(true);
  const B=n=>bones['CC_Base_'+n];
  const gearG=new THREE.Group(); body.add(gearG);
  const gm={ k:new THREE.MeshStandardMaterial({color:0x26282a,roughness:0.6,metalness:0.1}), p:new THREE.MeshStandardMaterial({color:0x4a4d3b,roughness:0.95}), d:new THREE.MeshStandardMaterial({color:0x3b3d30,roughness:0.95}) };
  [gm.p,gm.d].forEach(m=>M.camoPatch(m,UG));
  let wpn=null, wkey='', wi=null, pvs=null, bc=null; const DBGH={};
  /* ---- cinemática inversa de dos huesos ---- */
  const wp=o=>o.getWorldPosition(new THREE.Vector3());
  function aim(bone,childPos,newPos){ const p=wp(bone); const v1=childPos.clone().sub(p).normalize(), v2=newPos.clone().sub(p).normalize(); if(v1.lengthSq()<1e-8||v2.lengthSq()<1e-8) return;
    const qw=new THREE.Quaternion().setFromUnitVectors(v1,v2); const bw=bone.getWorldQuaternion(new THREE.Quaternion()); const pw=bone.parent.getWorldQuaternion(new THREE.Quaternion());
    bone.quaternion.copy(pw.invert().multiply(qw.multiply(bw))); bone.updateMatrixWorld(true); }
  function ik(side,tgtL,poleL){ const U=B(side+'_Upperarm'), F=B(side+'_Forearm'), H=B(side+'_Hand'); if(!U||!F||!H) return;
    const t=body.localToWorld(tgtL.clone()); const pU=wp(U), a=wp(F).distanceTo(pU), b=wp(H).distanceTo(wp(F)); const d=t.clone().sub(pU); const dist=Math.min(Math.max(d.length(),0.05),a+b-1e-3); const dir=d.normalize();
    const ca=(a*a+dist*dist-b*b)/(2*a*dist), sa=Math.sqrt(Math.max(0,1-ca*ca)); const pole=body.localToWorld(poleL.clone()).sub(body.localToWorld(new THREE.Vector3())).normalize(); const pp=pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    const E=pU.clone().addScaledVector(dir,a*ca).addScaledVector(pp,a*sa); aim(U,wp(F),E); aim(F,wp(H),pU.clone().addScaledVector(dir,dist)); }
  function handTo(side,dirL){ const H=B(side+'_Hand'); const m=B(side+'_Mid1')||(H&&H.children[0]); if(!H||!m) return; const t=wp(H).add(body.localToWorld(dirL.clone()).sub(body.localToWorld(new THREE.Vector3())).normalize().multiplyScalar(0.08)); aim(H,wp(m),t); }
  /* pose de «preparado bajo»: arma delante del pecho, boca hacia delante y abajo */
  const AXD=new THREE.Vector3(0.16,-0.5,0.85).normalize(), AXDP=new THREE.Vector3(0.06,-0.62,0.78).normalize(); /* pistola: «preparado bajo» con los brazos extendidos, boca hacia el suelo delante del cuerpo */
  function basis(ax){ const z=(ax||AXD).clone(), up=new THREE.Vector3(0,1,0), y=up.sub(z.clone().multiplyScalar(up.dot(z))).normalize(), x=new THREE.Vector3().crossVectors(y,z); return new THREE.Matrix4().makeBasis(x,y,z); }
  function pose(){ Object.values(bones).forEach(b=>{ const q=body.userData.rest[b.name]; if(q) b.quaternion.copy(q); }); body.updateMatrixWorld(true);
    if(!wpn){ ik('R',new THREE.Vector3(-0.21,0.93,0.02),new THREE.Vector3(-0.3,0,-1)); ik('L',new THREE.Vector3(0.2,0.93,0.02),new THREE.Vector3(0.3,0,-1)); return; }
    const pist=wi&&wi.w.cat==='pistol'; const s=holder.scale.x||1, R=basis(pist?AXDP:AXD), q=new THREE.Quaternion().setFromRotationMatrix(R);
    const gp=wpn.userData.gp; wpn.quaternion.copy(q); wpn.scale.setScalar(U2M/s); const k=U2M/s;
    let G;
    if(pist){ G=new THREE.Vector3(-0.03,1.16,0.45); wpn.position.copy(G).sub(new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q)); }
    else { /* culata apoyada en el hombro derecho (bolsillo del hombro) */ const sb=wpn.userData.stock; const SH=new THREE.Vector3(-0.12,1.37,0.11);
      wpn.position.copy(SH).sub(new THREE.Vector3(0,sb[1],sb[0]).multiplyScalar(k).applyQuaternion(q));
      G=new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q).add(wpn.position); }
    const back=(pist?AXDP:AXD).clone().multiplyScalar(-1);
    ik('R',G.clone().addScaledVector(back,0.045).add(new THREE.Vector3(-0.025,0.035,0)),new THREE.Vector3(-0.6,-0.7,-0.3)); handTo('R',new THREE.Vector3(0,-0.6,0.3));
    const ex=new THREE.Vector3().setFromMatrixColumn(R,0), ey=new THREE.Vector3().setFromMatrixColumn(R,1), ez=new THREE.Vector3().setFromMatrixColumn(R,2);
    let Hl; if(pist){ /* agarre a dos manos: la mano de apoyo envuelve la mano del tirador por la izquierda, pulgares hacia delante */ Hl=G.clone().addScaledVector(ex,0.022).addScaledVector(ey,-0.058).addScaledVector(ez,0.0); } else { /* mano de apoyo: se busca en la propia geometría del arma (rayo desde abajo) el guardamanos/brocal más adelantado que el brazo alcanza —adelantando un poco el hombro, como al encarar—; nunca en el aire ni atravesando el arma. LH: punto fijo [z,y] para armas con empuñadura delantera. */
      const m=M.mt(wi.v)||{}; const MW=new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale); const OFF=new THREE.Vector3(0.035,-0.045,-0.04);
      const bore=m.bore!=null?m.bore:(gp[1]+0.08), yLow=(wpn.userData.bmin!=null?wpn.userData.bmin:-0.3)-0.05, lh=LH[wi.v.id]||LH[wi.w.id];
      const zMax=lh?lh[0]:Math.min(m.uz!=null?m.uz:gp[0]+0.3,gp[0]+0.42), zMin=gp[0]+0.1; const up=ey.clone();
      const contact=s=>{ if(lh&&Math.abs(s-lh[0])<1e-6) return new THREE.Vector3(0,lh[1],s).applyMatrix4(MW); const o=new THREE.Vector3(0,yLow,s).applyMatrix4(MW); ray.set(o,up); ray.far=2;
        const hs=ray.intersectObject(wpn,true).filter(h=>{ let p=h.object; while(p){ if(p.name==='mat_beams') return false; p=p.parent; } return h.object.visible; }); if(!hs.length) return null;
        const yl=wpn.worldToLocal(hs[0].point.clone()).y; if(!lh&&(yl<bore-0.095||yl>bore)) return null; return body.worldToLocal(hs[0].point.clone()); };
      const U=B('L_Upperarm'), F=B('L_Forearm'), H=B('L_Hand'), C=B('L_Clavicle'); const reach=()=>wp(F).distanceTo(wp(U))+wp(H).distanceTo(wp(F));
      body.updateMatrixWorld(true); let c0=contact(zMax)||new THREE.Vector3(0,bore-0.04,zMax).applyMatrix4(MW);
      if(C&&U){ const tW=body.localToWorld(c0.clone().add(OFF)); if(tW.distanceTo(wp(U))>reach()*0.96){ const pc=wp(C), pu=wp(U), L0=pu.distanceTo(pc); const a1=pu.clone().sub(pc).normalize(), a2=tW.clone().sub(pc).normalize(); aim(C,pu,pc.clone().add(a1.multiplyScalar(0.6).add(a2.multiplyScalar(0.4)).normalize().multiplyScalar(L0))); } }
      Hl=null; const R0=(U&&F&&H)?reach()*0.985:9;
      for(let s=zMax; s>=zMin-1e-6; s-=0.01){ const c=contact(s); if(!c) continue; if(!U||body.localToWorld(c.clone().add(OFF)).distanceTo(wp(U))<=R0){ Hl=c; break; } }
      if(!Hl) Hl=new THREE.Vector3(0,bore-0.05,zMin).applyMatrix4(MW); }
    DBGH.t=Hl.clone(); DBGH.g=G.clone();
    if(pist){ ik('L',Hl,new THREE.Vector3(0.8,-0.6,-0.1)); handTo('L',ex.clone().multiplyScalar(-0.55).addScaledVector(ez,0.75).addScaledVector(ey,-0.15)); }
    else { ik('L',Hl.clone().add(new THREE.Vector3(0.035,-0.045,-0.04)),new THREE.Vector3(0.7,-0.7,-0.1)); handTo('L',new THREE.Vector3(-0.4,0.6,0.5)); }
  }
  async function setWeapon(){ const b=st.arma; const key=b?JSON.stringify([b.id,b.v||0,b.on||{}]):''; if(key===wkey) return; wkey=key;
    if(wpn){ body.remove(wpn); wpn=null; wi=null; } if(bc){ bc.dispose(); bc=null; } beamUI(); if(!b){ pose(); rebuildGear(); V.recenter(); return; }
    try{ const r=await M.buildWeapon(b,UW,UA); if(key!==wkey) return; const o=r.o; o.userData.gp=GRIP[r.v.id]||GRIP[r.w.id]||(r.w.cat==='pistol'?GRIP_PISTOL:[0,0]); { const bb=new THREE.Box3().setFromObject(o); const m=M.mt(r.v)||{}; o.userData.bmin=bb.min.y; o.userData.stock=[bb.min.z+0.01,(m.sty!=null?m.sty:(m.bore!=null?m.bore-0.02:(bb.min.y+bb.max.y)/2))]; } o.traverse(q=>{ if(q.isMesh) q.castShadow=true; });
      wpn=o; wi=r; body.add(o); pose(); rebuildGear(); V.recenter(); credits(r);
      if(M.beamCtl){ bc=M.beamCtl(o,o.children.filter(c=>c.userData&&c.userData.acc).map(c=>({a:c.userData.acc,o:c}))); if(!bc.has()) bc=null; } beamUI(); }catch(e){ console.warn('soldado arma',e); }
  }
  function credits(r){ if(!opt.cred) return; const w=r?r.w:null; opt.cred.innerHTML=L('Figura: «','Figure: “')+'<a href="https://sketchfab.com/3d-models/soldier-full-tactical-gear-lowpolygameready-850593a8c7114c188395ba1849a66eb9" target="_blank" rel="noopener">Soldier Full Tactical Gear</a>'+L('» de ','” by ')+'<a href="https://sketchfab.com/1799danly" target="_blank" rel="noopener">DanlyVostok</a> (Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>); '+L('visor nocturno «','night vision “')+'<a href="https://sketchfab.com/3d-models/anpvs-14-nvd-ed14bb49bdf94cd7b572daf206f1ccfb" target="_blank" rel="noopener">AN/PVS-14 NVD</a>'+L('» de knolp (CC BY 4.0). M.A.T ha optimizado los modelos, recolocado los brazos para sujetar el arma y añadido los camuflajes.','” by knolp (CC BY 4.0). M.A.T optimized the models, re-posed the arms to hold the weapon and added the camouflages.')+' <b>'+L('Mochilas, cantimploras, pala y lanzador: modelo aproximado hecho por MAT a partir de medidas oficiales','Packs, canteens, shovel and launcher: approximate model made by MAT from official dimensions')+'</b>.'+(w?' '+L('Arma: modelo del Armero 3D','Weapon: 3D Gunsmith model')+' (<a href="#/armero/'+w.id+'">'+w.n+'</a>), '+L('a escala real','at real scale')+'.':'')+' <a href="#/license">'+L('Licencias','Licences')+'</a>'; }
  const has=id=>(st.q[id]||0)>0, anyOf=c=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].c===c), visTag=t=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].vis===t);
  const ray=new THREE.Raycaster();
  function hit(objs,o,d){ body.updateMatrixWorld(true); ray.set(body.localToWorld(o.clone()),d.clone().normalize()); ray.far=3; const h=ray.intersectObjects(objs.filter(Boolean),false)[0]; return h?body.worldToLocal(h.point.clone()):null; }
  const vestMeshes=Object.values(mesh).filter(m=>m.name==='plate_1'||(/^pouches/.test(m.name)&&(()=>{ const bb=new THREE.Box3().setFromObject(m); const c=(bb.min.y+bb.max.y)/2; return c>1.05&&c<1.56; })()));

  /* mochilas: bloques redondeados con tela y cinchas MOLLE generadas en código (modelo aproximado de M.A.T) */
  /* mochilas: formas blandas redondeadas (cuerpo abombado, tapa, bolsillos laterales, cinchas y hombreras sobre los hombros), tela y MOLLE generadas en código — modelo aproximado de M.A.T */
  function canvasTex(draw,rep){ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); draw(x); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rep,rep); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
  function noise(x,n,a){ for(let k=0;k<n;k++){ x.fillStyle='rgba(0,0,0,'+(Math.random()*a)+')'; x.fillRect(Math.random()*128,Math.random()*128,1+Math.random()*1.5,1); x.fillStyle='rgba(255,255,255,'+(Math.random()*a*0.6)+')'; x.fillRect(Math.random()*128,Math.random()*128,1,1); } }
  const CORD=canvasTex(x=>{ x.fillStyle='#c4c4c4'; x.fillRect(0,0,128,128); for(let y=0;y<128;y+=2){ x.fillStyle='rgba(0,0,0,0.05)'; x.fillRect(0,y,128,1); } for(let s=0;s<128;s+=2){ x.fillStyle='rgba(0,0,0,0.03)'; x.fillRect(s,0,1,128); } noise(x,1800,0.07); },1);
  const MOLLE=canvasTex(x=>{ x.fillStyle='#c4c4c4'; x.fillRect(0,0,128,128); noise(x,900,0.06); for(let i=0;i<4;i++){ const y=i*32+6; x.fillStyle='#b2b2b2'; x.fillRect(0,y,128,16); x.fillStyle='rgba(0,0,0,0.22)'; x.fillRect(0,y+16,128,2); x.fillStyle='rgba(255,255,255,0.10)'; x.fillRect(0,y,128,1.2); for(let s=0;s<128;s+=36){ x.fillStyle='rgba(0,0,0,0.25)'; x.fillRect(s,y,2,16); } } },1);
  const gmP=new THREE.MeshStandardMaterial({color:0x5c5f49,map:CORD,bumpMap:CORD,bumpScale:0.6,roughness:0.95}), gmM=new THREE.MeshStandardMaterial({color:0x5c5f49,map:MOLLE,bumpMap:MOLLE,bumpScale:1.2,roughness:0.95}), gmS=new THREE.MeshStandardMaterial({color:0x3f4234,roughness:0.85}), gmB=new THREE.MeshStandardMaterial({color:0x1d1e1c,roughness:0.5,metalness:0.2}), gmT=new THREE.MeshStandardMaterial({color:0x44473a,map:CORD,roughness:0.9,side:THREE.DoubleSide});
  M.camoPatch(gmP,UG); M.camoPatch(gmM,UG);
  /* caja blanda: caja subdividida con esquinas de radio r, normales analíticas (sin costuras) y UV en metros (una tesela cada 10 cm) */
  function softGeo(w,h,d,r,o){ o=o||{}; r=Math.min(r,w/2-1e-3,h/2-1e-3,d/2-1e-3); const g=new THREE.BoxGeometry(w,h,d,Math.max(3,Math.round(w/0.025)),Math.max(3,Math.round(h/0.025)),Math.max(3,Math.round(d/0.025)));
    const p=g.attributes.position, nA=g.attributes.normal, uv=g.attributes.uv, v=new THREE.Vector3(), c=new THREE.Vector3(), n=new THREE.Vector3(), hx=w/2-r, hy=h/2-r, hz=d/2-r, T=o.tile||0.1;
    for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); c.set(Math.max(-hx,Math.min(hx,v.x)),Math.max(-hy,Math.min(hy,v.y)),Math.max(-hz,Math.min(hz,v.z))); n.copy(v).sub(c); if(n.lengthSq()<1e-12) n.fromBufferAttribute(nA,i); n.normalize(); v.copy(c).addScaledVector(n,r);
      const ex=Math.max(0,1-Math.pow(v.x/(w/2),2)), ey=Math.max(0,1-Math.pow(v.y/(h/2),2));
      if(o.bulge&&v.z<0) v.z-=o.bulge*ex*ey*Math.min(1,-v.z/(d/2));                                  // cara exterior abombada (carga dentro)
      if(o.taper) v.x*=1-o.taper*(v.y/h+0.5);                                                             // algo más estrecha arriba
      if(o.dome&&v.y>0) v.y+=o.dome*ex*Math.max(0,1-Math.pow(v.z/(d/2),2));                              // tapa redondeada
      p.setXYZ(i,v.x,v.y,v.z); nA.setXYZ(i,n.x,n.y,n.z);
      const ax=Math.abs(n.x), ay=Math.abs(n.y), az=Math.abs(n.z); if(az>=ax&&az>=ay) uv.setXY(i,v.x/T,v.y/T); else if(ax>=ay) uv.setXY(i,v.z/T,v.y/T); else uv.setXY(i,v.x/T,v.z/T); }
    if(o.bulge||o.taper||o.dome) g.computeVertexNormals(); return g; }
  function soft(w,h,d,r,m,o){ const s=new THREE.Mesh(softGeo(w,h,d,r,o),m); s.castShadow=true; s.receiveShadow=true; return s; }
  /* cincha plana a lo largo de una curva (sección w×t), orientada contra la superficie del cuerpo */
  function strap(pts,w,t,m,ctr){ const cv=new THREE.CatmullRomCurve3(pts,false,'centripetal'); const N=Math.max(12,pts.length*8), P=[], I=[]; const up=new THREE.Vector3();
    for(let i=0;i<=N;i++){ const u=i/N, q=cv.getPointAt(u), tg=cv.getTangentAt(u); const out=q.clone().sub(ctr(q)); out.sub(tg.clone().multiplyScalar(out.dot(tg))).normalize(); const sd=new THREE.Vector3().crossVectors(tg,out).normalize().multiplyScalar(w/2); const o2=out.clone().multiplyScalar(t);
      P.push(q.x-sd.x,q.y-sd.y,q.z-sd.z, q.x+sd.x,q.y+sd.y,q.z+sd.z, q.x+sd.x+o2.x,q.y+sd.y+o2.y,q.z+sd.z+o2.z, q.x-sd.x+o2.x,q.y-sd.y+o2.y,q.z-sd.z+o2.z);
      if(i<N){ const a=i*4, b=a+4; for(let k=0;k<4;k++){ const k2=(k+1)%4; I.push(a+k,b+k,a+k2, a+k2,b+k,b+k2); } } }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I); g.computeVertexNormals(); const s=new THREE.Mesh(g,m); s.castShadow=true; return s; }
  function buckle(x,y,z){ const b=rbox(0.045,0.022,0.012,gmB); b.position.set(x,y,z); return b; }
  /* mochila principal MOLLE: cuerpo, armazón, tapa, bolsillos laterales de sostenimiento, bolsillo frontal, cinchas de compresión y saco de dormir debajo */
  function ruckMesh(noFP){ const G=new THREE.Group(), W=0.34, Hh=0.52, Dd=0.22;
    const body=soft(W,Hh,Dd,0.055,gmP,{bulge:0.035,taper:0.06}); body.position.set(0,0,-Dd/2); G.add(body);
    const frame=soft(W-0.03,Hh-0.03,0.045,0.015,gmS); frame.position.set(0,0,-0.01); G.add(frame);
    const lid=soft(W*0.96,0.1,Dd+0.04,0.045,gmP,{dome:0.02,bulge:0.015}); lid.position.set(0,Hh/2+0.02,-Dd/2-0.025); lid.rotation.x=-0.1; G.add(lid);
    [-1,1].forEach(s=>{ const pk=soft(0.085,0.27,0.14,0.035,gmM,{bulge:0.012}); pk.rotation.y=s*Math.PI/2; pk.position.set(s*(W/2+0.032),-0.07,-Dd/2-0.005); G.add(pk);
      const cs=rbox(0.008,0.024,0.15,gmS); cs.position.set(s*(W/2+0.076),0.02,-Dd/2-0.005); G.add(cs); G.add(buckle(s*(W/2+0.079),0.02,-Dd/2-0.06)); });
    if(!noFP){ const fp=soft(0.24,0.22,0.07,0.03,gmM,{bulge:0.01}); fp.position.set(0,-0.09,-Dd-0.055); G.add(fp); }
    if(!noFP) [-1,1].forEach(s=>{ const vs=rbox(0.025,0.25,0.006,gmS); vs.position.set(s*0.075,-0.09,-Dd-0.097); G.add(vs); G.add(buckle(s*0.075,0.0,-Dd-0.101)); });
    return G; }
  /* mochila de asalto: cuerpo de tapa redondeada, panel MOLLE frontal y asa */
  function apMesh(){ const G=new THREE.Group(), W=0.3, Hh=0.42, Dd=0.15;
    const body=soft(W,Hh,Dd,0.05,gmP,{bulge:0.025,dome:0.035,taper:0.05}); body.position.set(0,0,-Dd/2); G.add(body);
    const frame=soft(W-0.03,Hh-0.04,0.04,0.012,gmS); frame.position.set(0,-0.01,-0.008); G.add(frame);
    const pan=soft(0.22,0.25,0.035,0.015,gmM,{bulge:0.006}); pan.position.set(0,-0.04,-Dd-0.035); G.add(pan);
    const h=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.007,6,12,Math.PI),gmS); h.position.set(0,Hh/2+0.03,-0.03); G.add(h);
    [-1,1].forEach(s=>{ const z=rbox(0.006,Hh*0.7,0.02,gmS); z.position.set(s*(W/2-0.008),0.0,-Dd*0.55); G.add(z); });
    return G; }
  function rebuildGear(){ gearG.clear();
    const vest=anyOf('vest')||Object.keys(st.q).some(k=>D.items[k]&&D.items[k].c==='plate'&&st.q[k]>0);
    vestMeshes.forEach(m=>m.visible=vest);
    const hel=anyOf('helmet'); ['helmet1','helmet1_2'].forEach(n=>{ if(mesh[n]) mesh[n].visible=hel; });
    if(mesh.sunglusses_glus) mesh.sunglusses_glus.visible=true; /* gafas balísticas siempre: con el visor nocturno levantado se siguen llevando */
    const torso=[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1];
    const backZ=y=>{ const p=hit(torso,new THREE.Vector3(0,y,-1),new THREE.Vector3(0,0,1)); return p?p.z:-0.24; };
    const ruck=has('ruck'), ap=has('apack');
    const tor=()=>[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1].concat(vestMeshes.filter(m=>m.visible));
    function straps(top,bot,zb,w,t){ const T=tor(), V3=THREE.Vector3, ctr=q=>new V3(0,Math.min(q.y,1.36),-0.04);
      [-1,1].forEach(s=>{ const tp=hit(T,new V3(s*0.1,2.2,-0.04),new V3(0,-1,0)); const sy=tp?tp.y:1.46;
        const fz=y=>{ const p=hit(T,new V3(s*0.11,y,1),new V3(0,0,-1)); return p?p.z:0.13; }, bz=y=>{ const p=hit(T,new V3(s*0.1,y,-1),new V3(0,0,1)); return p?p.z:-0.15; }, sx=y=>{ const p=hit(T,new V3(s,y,-0.04),new V3(-s,0,0)); return p?p.x:s*0.19; };
        const pts=[new V3(s*0.085,top-0.05,zb-0.012), new V3(s*0.095,sy-0.035,bz(sy-0.035)-t), new V3(s*0.1,sy+t*0.6,-0.035), new V3(s*0.105,sy-0.07,fz(sy-0.07)+t), new V3(s*0.11,1.30,fz(1.30)+t), new V3(s*0.125,1.17,fz(1.17)+t*0.8),
          new V3(sx(1.08)+s*0.012,1.08,-0.03), new V3(s*0.15,bot+0.07,zb-0.012)];
        gearG.add(strap(pts.slice(0,6),w,t,gmT,ctr)); gearG.add(strap(pts.slice(5),w*0.45,t*0.6,gmT,ctr)); const b=buckle(0,0,0); b.position.copy(pts[5]); b.lookAt(pts[5].clone().add(new V3(0,0,1))); gearG.add(b); }); }
    if(ruck){ const zb=backZ(1.22); const r=ruckMesh(ap); r.position.set(-0.01,1.17,zb+0.012); gearG.add(r); straps(1.43,0.91,zb,0.062,0.013);
      if(has('sbag')||has('pad')){ const sb=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.36,20,1),gmP); sb.castShadow=true; sb.rotation.z=Math.PI/2; sb.position.set(-0.01,0.84,zb-0.12); gearG.add(sb);
        [-1,1].forEach(s=>{ const rg=new THREE.Mesh(new THREE.TorusGeometry(0.083,0.006,6,24),gmS); rg.rotation.y=Math.PI/2; rg.position.set(-0.01+s*0.1,0.84,zb-0.12); gearG.add(rg); }); } }
    if(ap){ const zb=backZ(1.25); const a=apMesh(); a.position.set(-0.01,ruck?1.18:1.22,ruck?zb-0.235:zb+0.01); gearG.add(a); if(!ruck) straps(1.41,1.03,zb,0.05,0.011); }
    if(has('medbag')){ const zb=backZ(1.0); const mb=soft(0.36,0.26,0.18,0.05,gmP,{bulge:0.02}); mb.position.set(-0.01,ruck?0.8:1.0,zb-0.09-(ruck?0.13:0)); gearG.add(mb); }
    if(visTag('at4')){ const zb=backZ(1.25); const t=cyl(0.042,1.0,gm.d,14); t.position.set(0.04,1.28,zb-(ruck?0.27:0.06)); t.rotation.z=0.45; gearG.add(t); }
    if(has('cant')&&!ruck){ /* el cinturón del modelo ya lleva bolsas; las cantimploras van detrás, en la cadera */ for(let i=0;i<Math.min(2,st.q.cant);i++){ const s=i?1:-1; const p=hit([mesh.pants_1,mesh.pouches_1],new THREE.Vector3(s*0.12,0.97,-0.8),new THREE.Vector3(0,0,1)); if(!p) continue; const c=cyl(0.042,0.17,gm.d,14); c.position.set(s*0.12,0.95,p.z-0.04); gearG.add(c); } }
    if(has('etool')&&!ruck&&!ap){ const p=hit([mesh.pants_1,mesh.pouches_1],new THREE.Vector3(0,0.95,-0.8),new THREE.Vector3(0,0,1)); if(p){ const e=rbox(0.15,0.21,0.05,gm.d); e.position.set(0,0.93,p.z-0.03); gearG.add(e); } }
    gearG.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    nvg(hel&&(visTag('nvg')||visTag('nvg2')),visTag('nvg2')); }
  async function nvg(on,two){ if(pvs){ body.remove(pvs); pvs=null; } if(!on) return;
    try{ if(!PVSP) PVSP=load('m3d/soldado/pvs14.glb'); const g2=await PVSP; const one=()=>{ const o=g2.scene.clone(true); const bb=new THREE.Box3().setFromObject(o); const sz=bb.getSize(new THREE.Vector3()); const k=PVS_LEN/Math.max(sz.x,sz.y,sz.z); o.scale.setScalar(k); const c=bb.getCenter(new THREE.Vector3()).multiplyScalar(k); o.position.sub(c); const w=new THREE.Group(); w.add(o); return w; };
      const f=hit([mesh.helmet1_2],new THREE.Vector3(-0.02,1.74,1),new THREE.Vector3(0,0,-1))||new THREE.Vector3(-0.02,1.74,0.16);
      const grp=new THREE.Group(); const n=two?2:1; for(let i=0;i<n;i++){ const w=one(); w.position.set(two?(i?0.034:-0.034):0.0,0,0); grp.add(w); }
      const mnt=rbox(0.05,0.03,0.025,gm.k); mnt.position.set(0,-0.005,-0.06); grp.add(mnt);
      grp.position.set(f.x-0.01,f.y+0.005,f.z+0.065); body.add(grp); pvs=grp; grp.traverse(q=>{ if(q.isMesh) q.castShadow=true; }); V.recenter(); }catch(e){ console.warn('pvs',e); } }
  function camos(){ M.setU(UF,st.ucamo||'orig'); M.setU(UG,st.gcamo||'orig'); M.setU(UW,(st.arma&&st.arma.camo)||'orig'); M.setU(UA,(st.arma&&st.arma.ca)?(st.arma.camo||'orig'):'orig'); V.redraw(); }
  function scale(){ const s=Math.max(140,Math.min(215,+st.h||175))/100/BASE_H; holder.scale.setScalar(s); body.updateMatrixWorld(true); pose(); V.recenter(); }
  function camUI(){ if(!opt.cam) return; const C=M.CAMO; const row=(id,lab,cur)=>'<div class="sd-src" style="margin-top:6px"><b>'+lab+'</b></div><div class="sd-cam" data-k="'+id+'">'+C.map(c=>'<button type="button" title="'+LL(c[1])+'" aria-label="'+LL(c[1])+'" data-c="'+c[0]+'" class="'+(c[0]===(cur||'orig')?'on':'')+'" style="background:'+(c[0]==='orig'?(id==='ucamo'?'#6d6a55':'#4d5240'):M.sw(c[2]))+'"></button>').join('')+'</div>';
    opt.cam.innerHTML=row('ucamo',L('Camuflaje del uniforme','Uniform camouflage'),st.ucamo)+row('gcamo',L('Camuflaje del equipo','Gear camouflage'),st.gcamo)+'<div class="sd-src">'+L('Patrones genéricos generados por M.A.T (sin archivos de patrones con marca). El camuflaje del arma se elige en el Armero.','Generic patterns generated by M.A.T (no trademarked pattern files). The weapon camouflage is chosen in the Gunsmith.')+'</div>'; }
  if(opt.cam) opt.cam.addEventListener('click',e=>{ const b=e.target.closest('button[data-c]'); if(!b) return; st[b.parentNode.dataset.k]=b.dataset.c; camUI(); camos(); opt.save&&opt.save(); });
  const ld=stage.querySelector('.sd-load'); if(ld) ld.remove();
  const bt=document.createElement('div'); bt.className='arm-btns'; bt.innerHTML='<button type="button" data-x="rot">'+L('Pausar giro','Pause spin')+'</button><button type="button" data-x="rs">'+L('Vista inicial','Reset view')+'</button>'; stage.appendChild(bt);
  let spin=true; bt.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return; e.stopPropagation(); if(b.dataset.x==='rot'){ spin=!spin; V.setAuto(spin); b.textContent=spin?L('Pausar giro','Pause spin'):L('Girar','Spin'); } else V.reset(); });
  bt.addEventListener('pointerdown',e=>e.stopPropagation());
  /* linterna / láser del arma: Encender-Apagar (y vista IR si el láser es infrarrojo) */
  const lb=document.createElement('div'); lb.className='arm-btns sd-lb'; lb.style.cssText='left:8px;right:auto;flex-direction:column;align-items:flex-start'; lb.innerHTML='<button type="button" data-b="on"></button><button type="button" data-b="ir"></button>'; stage.appendChild(lb);
  const bn=document.createElement('div'); bn.style.cssText='position:absolute;left:8px;right:8px;bottom:8px;font-size:11px;line-height:1.3;color:#d8dde2;background:rgba(10,12,14,.55);padding:4px 7px;border-radius:6px;pointer-events:none'; stage.appendChild(bn);
  lb.addEventListener('pointerdown',e=>e.stopPropagation());
  lb.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b||!bc) return; e.stopPropagation(); if(b.dataset.b==='on'){ const v=!bc.on(); bc.set(v,v?bc.ir():false); } else bc.set(true,!bc.ir()); beamUI(); V.redraw(); });
  function beamUI(){ const has=!!bc; lb.style.display=has?'flex':'none'; bn.style.display=has&&bc.on()?'block':'none'; if(!has){ const cv=stage.querySelector('canvas'); if(cv) cv.style.filter=''; return; }
    const what=bc.hasLight()&&bc.hasLaser()?L('luz y láser','light and laser'):bc.hasLaser()?L('láser','laser'):L('linterna','light');
    const [b1,b2]=lb.querySelectorAll('button'); b1.textContent=(bc.on()?L('Apagar ','Turn off '):L('Encender ','Turn on '))+what; b1.style.background=bc.on()?'#c9a227':''; b1.style.color=bc.on()?'#15181a':'';
    b2.style.display=bc.on()&&bc.hasIR()?'':'none'; b2.textContent=bc.ir()?L('Ver láser visible','Show visible laser'):L('Ver en IR (visor nocturno)','View in IR (night vision)');
    const cv=stage.querySelector('canvas'); if(cv) cv.style.filter=bc.on()&&bc.ir()?M.NVG_FILTER:''; bn.textContent=bc.on()?bc.note(EN()):''; }
  camUI(); camos(); scale(); rebuildGear(); V.fit(holder); credits(null); beamUI(); await setWeapon();
  window.MAT_SOLDADO_DBG={ w:()=>wpn&&[wpn.position.toArray(),wpn.userData.stock,wpn.userData.gp,wpn.scale.x,new THREE.Box3().setFromObject(wpn).min.toArray(),wp(B('R_Hand')).toArray(),wp(B('R_Upperarm')).toArray()], still:(y)=>{ V.setAuto(false); V.reset(); if(y!=null) V.look(y); }, gear:()=>gearG.children.length, weapon:()=>!!wpn, helmet:()=>!!(mesh.helmet1_2&&mesh.helmet1_2.visible), scale:()=>holder.scale.x, hands:()=>{ body.updateMatrixWorld(true); const l=body.worldToLocal(wp(B('L_Hand'))), r=body.worldToLocal(wp(B('R_Hand'))); return {t:DBGH.t&&DBGH.t.toArray(),g:DBGH.g&&DBGH.g.toArray(),L:l.toArray(),R:r.toArray(),Lu:body.worldToLocal(wp(B('L_Upperarm'))).toArray(), mt:wi&&M.mt(wi.v), gp:wpn&&wpn.userData.gp}; } };
  return { update(s){ scale(); rebuildGear(); camos(); setWeapon(); }, destroy(){ try{ if(bc) bc.dispose(); body.remove(gearG); if(wpn) body.remove(wpn); if(pvs) body.remove(pvs); holder.remove(body); V.holder.remove(holder); }catch(e){} V.destroy(); } };
}
