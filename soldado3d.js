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
  let wpn=null, wkey='', wi=null, pvs=null;
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
  const AXD=new THREE.Vector3(0.16,-0.5,0.85).normalize();
  function basis(){ const z=AXD.clone(), up=new THREE.Vector3(0,1,0), y=up.sub(z.clone().multiplyScalar(up.dot(z))).normalize(), x=new THREE.Vector3().crossVectors(y,z); return new THREE.Matrix4().makeBasis(x,y,z); }
  function pose(){ Object.values(bones).forEach(b=>{ const q=body.userData.rest[b.name]; if(q) b.quaternion.copy(q); }); body.updateMatrixWorld(true);
    if(!wpn){ ik('R',new THREE.Vector3(-0.21,0.93,0.02),new THREE.Vector3(-0.3,0,-1)); ik('L',new THREE.Vector3(0.2,0.93,0.02),new THREE.Vector3(0.3,0,-1)); return; }
    const s=holder.scale.x||1, R=basis(), q=new THREE.Quaternion().setFromRotationMatrix(R); const pist=wi&&wi.w.cat==='pistol';
    const gp=wpn.userData.gp; wpn.quaternion.copy(q); wpn.scale.setScalar(U2M/s); const k=U2M/s;
    let G;
    if(pist){ G=new THREE.Vector3(-0.04,1.2,0.33); wpn.position.copy(G).sub(new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q)); }
    else { /* culata apoyada en el hombro derecho (bolsillo del hombro) */ const sb=wpn.userData.stock; const SH=new THREE.Vector3(-0.12,1.37,0.11);
      wpn.position.copy(SH).sub(new THREE.Vector3(0,sb[1],sb[0]).multiplyScalar(k).applyQuaternion(q));
      G=new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q).add(wpn.position); }
    const back=AXD.clone().multiplyScalar(-1);
    ik('R',G.clone().addScaledVector(back,0.045).add(new THREE.Vector3(-0.025,0.035,0)),new THREE.Vector3(-0.6,-0.7,-0.3)); handTo('R',new THREE.Vector3(0,-0.6,0.3));
    let Hl; if(pist){ Hl=G.clone().add(new THREE.Vector3(0.05,-0.02,0.0)); } else { const m=M.mt(wi.v)||{}; const uz=(m.uz!=null?m.uz:(gp[0]+0.3)), uy=(m.uy!=null?m.uy:gp[1]); const lp=new THREE.Vector3(0,uy-0.012,Math.min(uz,gp[0]+0.4)); lp.applyMatrix4(new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale)); Hl=lp; }
    ik('L',Hl.clone().add(new THREE.Vector3(0.035,-0.045,-0.04)),new THREE.Vector3(0.7,-0.7,-0.1)); handTo('L',new THREE.Vector3(-0.4,0.6,0.5));
  }
  async function setWeapon(){ const b=st.arma; const key=b?JSON.stringify([b.id,b.v||0,b.on||{}]):''; if(key===wkey) return; wkey=key;
    if(wpn){ body.remove(wpn); wpn=null; wi=null; } if(!b){ pose(); rebuildGear(); V.recenter(); return; }
    try{ const r=await M.buildWeapon(b,UW,UA); if(key!==wkey) return; const o=r.o; o.userData.gp=GRIP[r.v.id]||GRIP[r.w.id]||(r.w.cat==='pistol'?GRIP_PISTOL:[0,0]); { const bb=new THREE.Box3().setFromObject(o); const m=M.mt(r.v)||{}; o.userData.stock=[bb.min.z+0.01,(m.sty!=null?m.sty:(m.bore!=null?m.bore-0.02:(bb.min.y+bb.max.y)/2))]; } o.traverse(q=>{ if(q.isMesh) q.castShadow=true; });
      wpn=o; wi=r; body.add(o); pose(); rebuildGear(); V.recenter(); credits(r); }catch(e){ console.warn('soldado arma',e); }
  }
  function credits(r){ if(!opt.cred) return; const w=r?r.w:null; opt.cred.innerHTML=L('Figura: «','Figure: “')+'<a href="https://sketchfab.com/3d-models/soldier-full-tactical-gear-lowpolygameready-850593a8c7114c188395ba1849a66eb9" target="_blank" rel="noopener">Soldier Full Tactical Gear</a>'+L('» de ','” by ')+'<a href="https://sketchfab.com/1799danly" target="_blank" rel="noopener">DanlyVostok</a> (Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>); '+L('visor nocturno «','night vision “')+'<a href="https://sketchfab.com/3d-models/anpvs-14-nvd-ed14bb49bdf94cd7b572daf206f1ccfb" target="_blank" rel="noopener">AN/PVS-14 NVD</a>'+L('» de knolp (CC BY 4.0). M.A.T ha optimizado los modelos, recolocado los brazos para sujetar el arma y añadido los camuflajes.','” by knolp (CC BY 4.0). M.A.T optimized the models, re-posed the arms to hold the weapon and added the camouflages.')+' <b>'+L('Mochilas, cantimploras, pala y lanzador: modelo aproximado hecho por MAT a partir de medidas oficiales','Packs, canteens, shovel and launcher: approximate model made by MAT from official dimensions')+'</b>.'+(w?' '+L('Arma: modelo del Armero 3D','Weapon: 3D Gunsmith model')+' (<a href="#/armero/'+w.id+'">'+w.n+'</a>), '+L('a escala real','at real scale')+'.':'')+' <a href="#/license">'+L('Licencias','Licences')+'</a>'; }
  const has=id=>(st.q[id]||0)>0, anyOf=c=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].c===c), visTag=t=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].vis===t);
  const ray=new THREE.Raycaster();
  function hit(objs,o,d){ body.updateMatrixWorld(true); ray.set(body.localToWorld(o.clone()),d.clone().normalize()); ray.far=3; const h=ray.intersectObjects(objs.filter(Boolean),false)[0]; return h?body.worldToLocal(h.point.clone()):null; }
  const vestMeshes=Object.values(mesh).filter(m=>m.name==='plate_1'||(/^pouches/.test(m.name)&&(()=>{ const bb=new THREE.Box3().setFromObject(m); const c=(bb.min.y+bb.max.y)/2; return c>1.05&&c<1.56; })()));

  /* mochilas: bloques redondeados con tela y cinchas MOLLE generadas en código (modelo aproximado de M.A.T) */
  function fabricTex(){ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.fillStyle='#bdbdbd'; x.fillRect(0,0,128,128);
    for(let i=0;i<4;i++){ const y=i*32; x.fillStyle='#9c9c9c'; x.fillRect(0,y+4,128,14); x.fillStyle='#7f7f7f'; x.fillRect(0,y+4,128,1.5); x.fillRect(0,y+16.5,128,1.5); for(let s=0;s<128;s+=24){ x.fillStyle='#6f6f6f'; x.fillRect(s,y+4,2.5,14); } }
    for(let k=0;k<1400;k++){ x.fillStyle='rgba(0,0,0,'+(Math.random()*0.08)+')'; x.fillRect(Math.random()*128,Math.random()*128,1,1); }
    const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(10,10); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
  const FT=fabricTex(); const gmP=new THREE.MeshStandardMaterial({color:0x5a5e47,map:FT,roughness:0.96}), gmS=new THREE.MeshStandardMaterial({color:0x3e4133,roughness:0.9});
  M.camoPatch(gmP,UG);
  function pack(w,h,d){ const G=new THREE.Group(); const r=Math.min(0.03,w*0.15,h*0.15); const s=new THREE.Shape(); const a=w/2,b=h/2;
    s.moveTo(-a+r,-b); s.lineTo(a-r,-b); s.quadraticCurveTo(a,-b,a,-b+r); s.lineTo(a,b-r); s.quadraticCurveTo(a,b,a-r,b); s.lineTo(-a+r,b); s.quadraticCurveTo(-a,b,-a,b-r); s.lineTo(-a,-b+r); s.quadraticCurveTo(-a,-b,-a+r,-b);
    const bev=Math.min(0.018,d*0.2); const g=new THREE.ExtrudeGeometry(s,{depth:d-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev*0.8,bevelSegments:3,curveSegments:6}); g.translate(0,0,-(d-2*bev)/2);
    const m=new THREE.Mesh(g,gmP); m.castShadow=true; m.receiveShadow=true; G.add(m);
    [-1,1].forEach(k=>{ const st=rbox(0.025,h*0.96,0.006,gmS); st.position.set(k*w*0.28,0,-d/2-0.003); G.add(st); });                 // cinchas de compresión
    const lid=rbox(w*0.9,0.012,d*0.9,gmS); lid.position.set(0,h/2-0.04,0); G.add(lid); return G; }
  function rebuildGear(){ gearG.clear();
    const vest=anyOf('vest')||Object.keys(st.q).some(k=>D.items[k]&&D.items[k].c==='plate'&&st.q[k]>0);
    vestMeshes.forEach(m=>m.visible=vest);
    const hel=anyOf('helmet'); ['helmet1','helmet1_2'].forEach(n=>{ if(mesh[n]) mesh[n].visible=hel; });
    if(mesh.sunglusses_glus) mesh.sunglusses_glus.visible=!(hel&&(visTag('nvg')||visTag('nvg2')));
    const torso=[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1];
    const backZ=y=>{ const p=hit(torso,new THREE.Vector3(0,y,-1),new THREE.Vector3(0,0,1)); return p?p.z:-0.24; };
    const ruck=has('ruck'), ap=has('apack');
    if(ruck){ const zb=backZ(1.22); const r=pack(0.36,0.56,0.22); r.position.set(-0.01,1.17,zb-0.1); gearG.add(r); const lid=pack(0.33,0.1,0.2); lid.position.set(-0.01,1.47,zb-0.105); gearG.add(lid);
      [-1,1].forEach(s=>{ const pk=pack(0.08,0.22,0.08); pk.position.set(-0.01+s*0.22,1.08,zb-0.13); gearG.add(pk); });
      if(has('sbag')||has('pad')){ const sb=cyl(0.08,0.36,gm.d,16); sb.rotation.z=Math.PI/2; sb.position.set(-0.01,0.84,zb-0.13); gearG.add(sb); } }
    if(ap){ const zb=backZ(1.25); const a=pack(0.3,0.42,0.15); a.position.set(-0.01,ruck?1.19:1.24,(ruck?zb-0.216:zb+0.01)-0.077); gearG.add(a); }
    if(has('medbag')){ const zb=backZ(1.0); const mb=pack(0.36,0.26,0.18); mb.position.set(-0.01,ruck?0.8:1.0,zb-0.09-(ruck?0.13:0)); gearG.add(mb); }
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
  camUI(); camos(); scale(); rebuildGear(); V.fit(holder); credits(null); await setWeapon();
  window.MAT_SOLDADO_DBG={ w:()=>wpn&&[wpn.position.toArray(),wpn.userData.stock,wpn.userData.gp,wpn.scale.x,new THREE.Box3().setFromObject(wpn).min.toArray(),wp(B('R_Hand')).toArray(),wp(B('R_Upperarm')).toArray()], still:(y)=>{ V.setAuto(false); V.reset(); if(y!=null) V.look(y); }, gear:()=>gearG.children.length, weapon:()=>!!wpn, helmet:()=>!!(mesh.helmet1_2&&mesh.helmet1_2.visible), scale:()=>holder.scale.x };
  return { update(s){ scale(); rebuildGear(); camos(); setWeapon(); }, destroy(){ try{ body.remove(gearG); if(wpn) body.remove(wpn); if(pvs) body.remove(pvs); holder.remove(body); V.holder.remove(holder); }catch(e){} V.destroy(); } };
}
