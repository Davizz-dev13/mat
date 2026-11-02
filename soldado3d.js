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
  function rebuildGear(){ gearG.clear();
    const vest=anyOf('vest'), plates=anyOf('plate')&&Object.keys(st.q).some(k=>D.items[k]&&D.items[k].c==='plate'&&k!=='side'&&st.q[k]>0);
    const iba=has('iba');
    if(vest||plates){ const [pw,ph]=plateDims(); const W=pw+0.03, H=ph+0.03, T=plates||iba?0.035:0.016; const y0=1.235, zf=0.152, zb=-0.19;
      const fr=rbox(W,H,T,gm.c); fr.position.set(CX,y0,zf+T/2); gearG.add(fr);
      const bk=rbox(W,H+0.02,T,gm.c); bk.position.set(CX,y0+0.01,zb-T/2); gearG.add(bk);
      const cb=new THREE.Mesh(new THREE.CylinderGeometry(0.205,0.2,0.14,20,1,true),gm.c); cb.scale.set(1,1,0.86); cb.position.set(CX,y0-0.07,-0.02); cb.castShadow=true; gm.c.side=THREE.DoubleSide; gearG.add(cb);
      [-1,1].forEach(s=>{ const st2=rbox(0.055,0.012,0.36,gm.d); st2.position.set(CX+s*0.085,1.455,-0.02); st2.rotation.x=-0.12; gearG.add(st2); });
      if(iba){ const col=new THREE.Mesh(new THREE.TorusGeometry(0.1,0.03,8,20,Math.PI*1.3),gm.c); col.rotation.set(Math.PI/2,0,Math.PI*0.85); col.position.set(CX,1.47,-0.03); gearG.add(col); }
      if(has('side')) [-1,1].forEach(s=>{ const sp=rbox(0.02,0.203,0.152,gm.d); sp.position.set(CX+s*0.2,y0-0.06,-0.02); gearG.add(sp); });
      const nm=Math.min(3,Math.ceil(((st.q.mag556||0)+(st.q.saw100||0))/2)); for(let i=0;i<nm;i++){ const pu=rbox(0.07,0.11,0.045,gm.d); pu.position.set(CX+(i-(nm-1)/2)*0.078,y0-0.09,zf+T+0.022); gearG.add(pu); }
      if(visTag('radio')){ const ra=rbox(0.06,0.13,0.04,gm.k); ra.position.set(CX+0.1,y0+0.1,zf+T+0.02); gearG.add(ra); const an=cyl(0.004,0.22,gm.k,6); an.position.set(CX+0.12,y0+0.26,zf+T+0.02); gearG.add(an); }
      if(has('frag')||has('smoke')){ const n=(st.q.frag||0)+(st.q.smoke||0); for(let i=0;i<Math.min(2,n);i++){ const gr=cyl(0.03,0.09,gm.p,10); gr.position.set(CX-0.1-i*0.065,y0+0.02,zf+T+0.03); gearG.add(gr); } }
    }
    if(helmet) helmet.visible=anyOf('helmet');
    if(beard) beard.visible=true;
    if(anyOf('helmet')&&(visTag('nvg')||visTag('nvg2'))){ const two=visTag('nvg2'); const hb=bone('DEF-head'); const p=new THREE.Vector3(CX,1.70,0.125);
      const mnt=rbox(0.05,0.04,0.03,gm.k); mnt.position.copy(p); gearG.add(mnt);
      if(two){ [-1,1].forEach(s=>{ const t=cyl(0.022,0.119,gm.k,12); t.rotation.x=Math.PI/2; t.position.set(CX+s*0.034,1.665,0.17); gearG.add(t); }); }
      else { const t=cyl(0.0255,0.114,gm.k,12); t.rotation.x=Math.PI/2; t.position.set(CX-0.032,1.665,0.17); gearG.add(t); } }
    const ruck=has('ruck'), ap=has('apack');
    if(ruck){ const r=rbox(0.36,0.52,0.22,gm.c); r.position.set(CX,1.12,-0.36); gearG.add(r); const lid=rbox(0.34,0.08,0.2,gm.d); lid.position.set(CX,1.41,-0.36); gearG.add(lid);
      if(has('sbag')||has('pad')){ const sb=cyl(0.09,0.34,gm.p,14); sb.rotation.z=Math.PI/2; sb.position.set(CX,0.82,-0.34); gearG.add(sb); } }
    if(ap){ const a=rbox(0.3,0.42,0.15,gm.d); if(ruck){ a.position.set(CX,1.15,-0.53); } else a.position.set(CX,1.2,-0.3); gearG.add(a); }
    if(has('medbag')){ const mb=rbox(0.4,0.28,0.2,mat(0x5d5040)); mb.position.set(CX,ruck?0.8:1.0,-0.33); gearG.add(mb); }
    if(visTag('at4')){ const t=cyl(0.042,1.0,gm.p,12); t.position.set(CX+0.05,1.25,-0.36-(ruck?0.15:0)); t.rotation.z=0.45; gearG.add(t); }
    if(has('cant')){ const n=Math.min(2,st.q.cant); for(let i=0;i<n;i++){ const c=cyl(0.045,0.17,gm.p,12); c.position.set(CX+(i?0.17:-0.17),0.99,-0.1); gearG.add(c); } }
    if(has('etool')){ const e=rbox(0.16,0.22,0.06,gm.p); e.position.set(CX+0.12,0.98,-0.2); gearG.add(e); }
    gearG.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    holster(); }
  async function holster(){ const on=visTag('holster'); if(!on){ if(hol){ body.remove(hol); hol=null; } return; } if(hol) return;
    try{ const r=await M.buildWeapon({id:'m9',v:0,on:{}},UW,UA); if(!visTag('holster')) return; const o=r.o; o.scale.setScalar(U2M); o.rotation.set(Math.PI/2+0.05,0,0); o.position.set(CX-0.205,0.86,0.0);
      const h=rbox(0.045,0.2,0.09,gm.k); h.position.set(CX-0.205,0.78,0.0); const g2=new THREE.Group(); g2.add(o); g2.add(h); body.add(g2); hol=g2; V.recenter(); }catch(e){ console.warn(e); } }
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
  window.MAT_SOLDADO_DBG={ still:(y)=>{ V.setAuto(false); V.reset(); },  gear:()=>gearG.children.length, weapon:()=>!!wpn, helmet:()=>helmet&&helmet.visible, scale:()=>holder.scale.x };
  return { update(s){ rebuildGear(); scale(); camos(); setWeapon(); }, destroy(){ try{ body.remove(gearG); if(wpn) body.remove(wpn); if(hol) body.remove(hol); holder.remove(body); body.position.set(0,0,0); V.holder.remove(holder); }catch(e){} V.destroy(); } };
}
