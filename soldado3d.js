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
/* empuñaduras delanteras (la mano agarra la empuñadura) y lanzagranadas bajo el cañón (la mano agarra el lanzagranadas) */
const GRIPS={'afg':1,'rvg':1,'grippod':1}, UGLS={'m203':1,'gp25':1,'gp34':1,'ag36':1};
const HIP={}; /* «al asalto» retirado (3 nov): con este modelo la culata se hundía en el torso; las ametralladoras y el M82 van al hombro como los fusiles */
/* fracción grip→boca donde va la mano de apoyo (mitad/delante del guardamanos; en armas largas, el guardamanos justo delante del brocal) */
const HF={'m24':0.3,'awm':0.3,'m82':0.32,'m82a1':0.32,'sr-25':0.36,'m240':0.36,'pkm':0.33,'m249':0.36,'aug':0.4,'l85a2':0.45,'famas':0.5,'tavor':0.45,'p90':0.42,'mp7':0.55,'mp7a1':0.55,'mp5':0.62};
/* camuflaje sobre tela con textura: conserva el relieve de la tela (luminancia) y cambia el color */
const CAMV=`varying vec3 vCP; uniform mat4 uInv;`;
/* casco: el auricular (cascos de comunicación), sus almohadillas y el micro no llevan funda — zonas UV del auricular en la textura del modelo */
const HSET='float hl0=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114)); bool hsx=(vMapUv.x>0.74&&vMapUv.y<0.60)||(vMapUv.x>0.30&&vMapUv.x<0.53&&vMapUv.y>0.74&&vMapUv.y<0.96)||hl0<HLT;'; /* y lo que en la textura original es plástico negro/gris oscuro (micro, cable, montura) */
function camoTex(m,U,M,helm){ m.onBeforeCompile=sh=>{ Object.assign(sh.uniforms,U);
  sh.vertexShader=CAMV+'\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCP=position*1.6;');
  sh.fragmentShader=M.GHEAD+(helm?'uniform float uHL;\n':'')+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+(helm?HSET.replace('HLT','uHL'):'bool hsx=false;')+'\nif(uMode>0&&!hsx){ float lum=dot(diffuseColor.rgb,vec3(0.299,0.587,0.114)); vec3 base=diffuseColor.rgb; '+M.GCOL+' diffuseColor.rgb*=clamp(lum/0.16,0.5,1.5); }').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=max(roughnessFactor,0.72);').replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=min(metalnessFactor,0.2);'); }; /* tela mate: sin zonas satinadas ni «metálicas» en nailon y algodón */
  m.customProgramCacheKey=()=>'matsoldtex3'+(helm?'h':''); }
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
  const UF=M.mkU(), UG=M.mkU(), UW=M.mkU(), UA=M.mkU(), UH=Object.assign(M.mkU(),{uHL:{value:0.03}}), UGL=M.mkU(); [UF,UG,UW,UA,UH,UGL].forEach(u=>V.track(u.uInv));
  const bones={}, mesh={};
  body.traverse(o=>{ if(o.isBone) bones[o.name]=o; if(o.isMesh){ mesh[o.name]=o; o.castShadow=true; o.receiveShadow=true; o.frustumCulled=false;
    if(!o.userData.orig) o.userData.orig=o.material; o.material=o.userData.orig.clone();
    /* tela: mate (sin brillo satinado); el relieve de la tela viene del mapa normal del modelo — ver camoTex */
    if(/^(kitel|pants)/.test(o.name)) camoTex(o.material,UF,M); else if(/^helmet/.test(o.name)) camoTex(o.material,UH,M,true); else if(/^(plate|pouches)/.test(o.name)) camoTex(o.material,UG,M); else if(/^gloves/.test(o.name)) camoTex(o.material,UGL,M); } });
  if(!body.userData.rest){ body.userData.rest={}; Object.values(bones).forEach(b=>body.userData.rest[b.name]=b.quaternion.clone()); }
  Object.values(bones).forEach(b=>{ const q=body.userData.rest[b.name]; if(q) b.quaternion.copy(q); });
  body.updateMatrixWorld(true);
  const B=n=>bones['CC_Base_'+n];
  const gearG=new THREE.Group(); body.add(gearG); const gearH=new THREE.Group(); body.add(gearH); const gearC=new THREE.Group(); body.add(gearC); /* gearC: hombreras, siguen al pecho al 100 % */
  const gm={ k:new THREE.MeshStandardMaterial({color:0x26282a,roughness:0.6,metalness:0.1}), p:new THREE.MeshStandardMaterial({color:0x4a4d3b,roughness:0.95}), d:new THREE.MeshStandardMaterial({color:0x3b3d30,roughness:0.95}) };
  [gm.p,gm.d].forEach(m=>M.camoPatch(m,UG));
  let wpn=null, wkey='', wi=null, pvs=null, bc=null, gmRE=null; const GLC={tan:'fde',negro:'negro',od:'od'}; const DBGH={};
  /* sombra de contacto suave bajo el soldado (de pie, rodilla y tumbado): se pinta la cercanía al suelo vista desde abajo y se desenfoca */
  const CS=(()=>{ if(!V.pre||!V.R||!V.ground) return null; const N=256, R=V.R, gr=V.ground;
    const mk=()=>{ const t=new THREE.WebGLRenderTarget(N,N,{depthBuffer:false}); t.texture.generateMipmaps=false; return t; }; const rtA=mk(), rtB=mk(), rtD=new THREE.WebGLRenderTarget(N,N); rtD.texture.generateMipmaps=false;
    const dm=new THREE.MeshDepthMaterial(); dm.depthTest=false; dm.depthWrite=false; dm.side=THREE.DoubleSide;
    dm.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );','float k=1.0-fragCoordZ; gl_FragColor = vec4( vec3( 0.0 ), k*k*0.55 );'); };
    const camC=new THREE.OrthographicCamera(-1,1,1,-1,0,1); camC.rotation.x=Math.PI/2;
    const bs=new THREE.ShaderMaterial({uniforms:{t:{value:null},d:{value:new THREE.Vector2()}},depthTest:false,depthWrite:false,
      vertexShader:'varying vec2 u; void main(){ u=uv; gl_Position=vec4(position.xy,0.0,1.0); }',
      fragmentShader:'uniform sampler2D t; uniform vec2 d; varying vec2 u; void main(){ vec4 s=texture2D(t,u)*0.2270270270; s+=(texture2D(t,u+d*1.3846153846)+texture2D(t,u-d*1.3846153846))*0.3162162162; s+=(texture2D(t,u+d*3.2307692308)+texture2D(t,u-d*3.2307692308))*0.0702702703; gl_FragColor=s; }'});
    const qs=new THREE.Scene(), qc=new THREE.OrthographicCamera(-1,1,1,-1,0,1); qs.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),bs));
    const pm=new THREE.MeshBasicMaterial({map:rtA.texture,transparent:true,opacity:0.85,depthWrite:false,toneMapped:false,side:THREE.DoubleSide,color:0x000000});
    pm.onBeforeCompile=sh=>{ sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','vec4 sm=texture2D(map,vMapUv); diffuseColor=vec4(0.0,0.0,0.0,sm.a*opacity);'); };
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(1,1),pm); plane.rotation.x=Math.PI/2; plane.renderOrder=-1; plane.frustumCulled=false; V.scene.add(plane);
    let key='', on=true; const kv=new THREE.Vector3();
    function sig(){ let s=gr.position.x.toFixed(3)+gr.position.y.toFixed(3)+gr.position.z.toFixed(3)+gr.scale.x.toFixed(3); ['Hip','L_Foot','R_Foot','L_Calf','R_Calf','L_Thigh','R_Thigh'].forEach(n=>{ const b=bones['CC_Base_'+n]; if(b){ b.getWorldPosition(kv); s+=kv.x.toFixed(3)+kv.y.toFixed(3)+kv.z.toFixed(3); } }); s+=gearG.children.length+'/'+gearG.visible+'/'+(wpn?wpn.uuid:'')+'/'+PO+'/'+(typeof ANIMON!=='undefined'&&ANIMON?Math.round(performance.now()/40):0); return s; } /* la respiración en reposo (BR) solo mueve el tronco: no recalcula la sombra */
    function blur(src,dst,dx,dy){ bs.uniforms.t.value=src.texture; bs.uniforms.d.value.set(dx/N,dy/N); R.setRenderTarget(dst); R.render(qs,qc); }
    V.pre((R_,scene)=>{ plane.visible=on&&gr.visible; if(!plane.visible) return; const k=sig(); if(k===key) return; key=k;
      const w=gr.scale.x*0.62, H=Math.max(0.05,gr.scale.x/2.2*0.32); plane.scale.set(w,w,1); plane.position.set(gr.position.x,gr.position.y+0.0015,gr.position.z);
      camC.left=-w/2; camC.right=w/2; camC.top=w/2; camC.bottom=-w/2; camC.near=0; camC.far=H; camC.position.set(gr.position.x,gr.position.y-0.002,gr.position.z); camC.updateProjectionMatrix(); camC.updateMatrixWorld();
      const gv=gr.visible, bg=scene.background, ov=scene.overrideMaterial, sa=R.shadowMap.autoUpdate, sn=R.shadowMap.needsUpdate, cc=R.getClearColor(new THREE.Color()), ca=R.getClearAlpha(), rt=R.getRenderTarget();
      gr.visible=false; plane.visible=false; scene.background=null; scene.overrideMaterial=dm; R.shadowMap.autoUpdate=false; R.shadowMap.needsUpdate=false; R.setClearColor(0x000000,0);
      R.setRenderTarget(rtD); R.clear(); R.render(scene,camC); scene.overrideMaterial=ov;
      blur(rtD,rtB,1.6,0); blur(rtB,rtA,0,1.6); blur(rtA,rtB,3.2,0); blur(rtB,rtA,0,3.2);
      R.setRenderTarget(rt); R.setClearColor(cc,ca); scene.background=bg; gr.visible=gv; plane.visible=true; R.shadowMap.autoUpdate=sa; R.shadowMap.needsUpdate=sn; });
    gr.material.opacity=0.2;
    return { set(v){ on=v; key=''; V.redraw(); }, dirty(){ key=''; }, dispose(){ [rtA,rtB,rtD].forEach(t=>t.dispose()); dm.dispose(); bs.dispose(); pm.dispose(); } };
  })();

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
  /* ---- postura del fusil (Fase 5): «preparado bajo» con el cuerpo perfilado ----
     Culata en el bolsillo del hombro derecho, torso girado ~20-25° (hombro de apoyo adelantado, como en la postura real perfilada),
     cabeza hacia el arma (mejilla cerca de la culata) y mano de apoyo en el guardamanos, en la empuñadura delantera o en el lanzagranadas.
     El giro del torso y el del arma se resuelven por arma con cinemática inversa de dos huesos hasta que el brazo alcanza el punto elegido. */
  const D2R=Math.PI/180, AY=new THREE.Vector3(0,1,0), AX=new THREE.Vector3(1,0,0), TWB=[['Waist',0.3],['Spine01',0.35],['Spine02',0.35]];
  const SH0=new THREE.Vector3(-0.115,1.375,0.105);
  function rotBody(bone,axL,ang){ if(!bone||!ang) return; const ax=axL.clone().applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion())).normalize(); const qa=new THREE.Quaternion().setFromAxisAngle(ax,ang);
    const bw=bone.getWorldQuaternion(new THREE.Quaternion()), pw=bone.parent.getWorldQuaternion(new THREE.Quaternion()); bone.quaternion.copy(pw.invert().multiply(qa.multiply(bw))); bone.updateMatrixWorld(true); }
  function locM(bone){ body.updateMatrixWorld(true); return new THREE.Matrix4().copy(body.matrixWorld).invert().multiply(bone.matrixWorld); }
  const REST={}; function restM(n){ return REST[n]; }
  function resetBones(){ Object.values(bones).forEach(b=>{ const q=body.userData.rest[b.name]; if(q) b.quaternion.copy(q); }); body.updateMatrixWorld(true); }
  resetBones(); ['Spine01','Spine02','Head'].forEach(n=>{ if(B(n)) REST[n]=locM(B(n)); });
  let TWS={tw:0,lean:0};
  function torso(tw,lean){ TWS={tw,lean}; TWB.forEach(([n,w])=>{ rotBody(B(n),AY,-tw*w*D2R); rotBody(B(n),AX,lean*w*D2R); }); }
  function chestM(){ const b=B('Spine02'); return (b&&REST.Spine02)?locM(b).multiply(REST.Spine02.clone().invert()):new THREE.Matrix4(); }
  function headM(){ const b=B('Head'); return (b&&REST.Head)?locM(b).multiply(REST.Head.clone().invert()):new THREE.Matrix4(); }
  /* el equipo de espalda (mochilas, correas, AT4) sigue al pecho; el visor nocturno sigue a la cabeza */
  function backM(){ /* la espalda de la malla gira algo menos que el hueso del pecho: el equipo de espalda sigue a Spine01-Spine02 a medias */ const a=chestM(), b=B('Spine01')&&REST.Spine01?locM(B('Spine01')).multiply(REST.Spine01.clone().invert()):a; const pa=new THREE.Vector3(),qa=new THREE.Quaternion(),sa=new THREE.Vector3(),pb=new THREE.Vector3(),qb=new THREE.Quaternion(),sb=new THREE.Vector3(); a.decompose(pa,qa,sa); b.decompose(pb,qb,sb); return new THREE.Matrix4().compose(pa.lerp(pb,0.5),qa.slerp(qb,0.5),sa); }
  /* marco de la espalda medido sobre la malla con piel (no sobre los huesos): centro y giro de la zona de la espalda del chaleco/chaqueta */
  let BF0=null; function backFrame(Ci){ const m=(mesh.plate_1&&mesh.plate_1.visible)?mesh.plate_1:mesh.kitel_1; if(!m||!m.geometry) return null; body.updateMatrixWorld(true); if(m.skeleton) m.skeleton.update();
    const pos=m.geometry.attributes.position, v=new THREE.Vector3(); let n=0,sx=0,sz=0,sxx=0,sxz=0,sy=0; const st_=Math.max(1,Math.floor(pos.count/4000));
    for(let i=0;i<pos.count;i+=st_){ m.getVertexPosition(i,v); m.localToWorld(v); body.worldToLocal(v); if(Ci) v.applyMatrix4(Ci); if(v.y>1.1&&v.y<1.3&&v.z<-0.1){ n++; sx+=v.x; sz+=v.z; sy+=v.y; sxx+=v.x*v.x; sxz+=v.x*v.z; } }
    if(n<8) return null; const mx=sx/n, mz=sz/n, b=(sxz/n-mx*mz)/Math.max(1e-6,(sxx/n-mx*mx));
    return {c:new THREE.Vector3(mx,sy/n,mz), a:Math.atan(b), m:m.name}; }
  function skinM(){ const C=chestM(), now=backFrame(C.clone().invert()); if(!now||!BF0||now.m!==BF0.m) return null; const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),-(now.a-BF0.a)); const p=now.c.clone().sub(BF0.c.clone().applyQuaternion(q)); p.y=now.c.y-BF0.c.y; p.x+=-0.0026*(TWS.tw||0); /* centrada entre los omóplatos visibles: con el torso girado el hombro derecho retrasado ensancha la espalda hacia ese lado */ return C.multiply(new THREE.Matrix4().compose(p,q,new THREE.Vector3(1,1,1))); /* hueso del pecho + la corrección medida en la malla */ }
  const _pc={v:new THREE.Vector3(),M:new THREE.Matrix4(),I:new THREE.Matrix4()};
  function packContact(){ const fp=gearG.userData.fp; if(!fp||!gearG.children.length) return; body.updateMatrixWorld(true); gearG.updateMatrix(); const I=_pc.I.copy(gearG.matrix).invert(), v=_pc.v, M=_pc.M; const inv=new THREE.Matrix4().copy(body.matrixWorld).invert();
    const w=fp.x1-fp.x0, h=fp.y1-fp.y0, xa=fp.x0+w*0.2, xb=fp.x1-w*0.2, ya=fp.y0+h*0.1, yb=fp.y1-h*0.12, ym=(ya+yb)/2; const Z=[9,9], Yc=[0,0], Nc=[0,0], ZA=[[],[]];
    const ms=[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1].concat(vestMeshes.filter(m=>m.visible)).filter(m=>m&&m.geometry.attributes.skinIndex); /* chaleco y chaqueta: la mochila apoya en el panel trasero del chaleco */
    ms.forEach(m=>{ m.skeleton&&m.skeleton.update(); const g=vgroups(m), n=m.geometry.attributes.position.count, st_=Math.max(1,Math.floor(n/1500)); M.multiplyMatrices(I,inv).multiply(m.matrixWorld);
      for(let i=0;i<n;i+=st_){ if(g[i]!==0) continue; m.getVertexPosition(i,v); v.applyMatrix4(M); if(v.x>xa&&v.x<xb&&v.y>ya&&v.y<yb&&v.z>fp.zf-0.2&&v.z<fp.zf+0.2){ const k=v.y>ym?0:1; ZA[k].push(v.z); Yc[k]+=v.y; Nc[k]++; } } });
    [0,1].forEach(k=>{ if(ZA[k].length>4){ ZA[k].sort((a,b)=>a-b); Z[k]=ZA[k][Math.floor(ZA[k].length*PR.pq)]; } }); /* superficie general de la espalda (no los picos: hombreras arrugadas, hebillas), que se hunden en el acolchado */
    if(Z[0]>8||Z[1]>8) return; const yT=Yc[0]/Nc[0], yB=Yc[1]/Nc[1]; const al=Math.max(-0.2,Math.min(0.2,Math.atan2(Z[0]-Z[1],yT-yB))); /* inclinación: la cara de la mochila apoya arriba y abajo a la vez */
    const yc=(yT+yB)/2, zm=(Z[0]+Z[1])/2-0.003; const q0=gearG.quaternion.clone(), qa=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-al), q1=q0.clone().multiply(qa);
    const Pv=new THREE.Vector3(0,yc,fp.zf); const shift=Pv.clone().applyQuaternion(q0).sub(Pv.clone().applyQuaternion(q1)); const dz=Math.max(-0.12,Math.min(0.15,zm-fp.zf));
    gearG.quaternion.copy(q1); gearG.position.add(shift).add(new THREE.Vector3(0,0,dz).applyQuaternion(q1));
    if((PO==='tumbado'||(ANIMON&&FROMP))&&PR.pmax!=null){ /* tumbado: la mochila queda casi horizontal (pegada y baja); gira sobre su borde inferior. Durante la animación, en proporción a lo tumbado que está el torso */ let wf=1; if(ANIMON){ const s0=lp('Spine01'), s1=lp('NeckTwist01'); const up=s1.sub(s0).normalize().y; wf=THREE.MathUtils.smoothstep(1-Math.abs(up),0.55,0.95); } const ax=new THREE.Vector3(0,1,0).applyQuaternion(gearG.quaternion); const el=Math.asin(Math.max(-1,Math.min(1,ax.y))); const ex_=(el-PR.pmax*D2R)*wf;
      if(ex_>0){ const piv=new THREE.Vector3(0,fp.y0,fp.zf).applyMatrix4(gearG.matrix.compose(gearG.position,gearG.quaternion,gearG.scale)); const side=new THREE.Vector3(1,0,0).applyQuaternion(gearG.quaternion); const qr=new THREE.Quaternion().setFromAxisAngle(side,ex_);
        gearG.position.sub(piv).applyQuaternion(qr).add(piv); gearG.quaternion.premultiply(qr); } if(window.MAT_DEV) window.MAT_PCEL=+(el/D2R).toFixed(1); }
    if(window.MAT_DEV) window.MAT_PC={Z,yT,yB,al:+(al/D2R).toFixed(1),dz:+dz.toFixed(3),el:window.MAT_PCEL}; }
  /* cambio de equipo durante la animación: el juego anterior (p. ej. la mochila grande) se desvanece pegado a la espalda, nunca en el aire */
  let GH=null, ATIME=0;
  function ghostStart(dur){ ghostEnd(); const G=new THREE.Group(); G.name='mat_ghost'; const mk=src=>{ const g=new THREE.Group(); g.matrixAutoUpdate=false; g.matrix.compose(src.position,src.quaternion,src.scale); [...src.children].forEach(c=>g.add(c)); return g; };
    const gG=mk(gearG), gC=mk(gearC); gC.visible=gearC.visible; G.add(gG); G.add(gC); const mats=[]; G.traverse(o=>{ if(o.isMesh&&o.material){ const m=o.material.clone(); m.transparent=true; m.opacity=1; o.material=m; mats.push(m); o.castShadow=false; } });
    body.add(G); GH={G,gG,gC,mats,t0:ATIME,dur}; }
  function ghostEnd(){ if(!GH) return; body.remove(GH.G); GH.G.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); GH.mats.forEach(m=>m.dispose()); GH=null; }
  function ghostTick(){ if(!GH) return; const a=1-Math.min(1,Math.max(0,(ATIME-GH.t0)/GH.dur)); if(a<=0){ ghostEnd(); return; } GH.mats.forEach(m=>m.opacity=a); GH.gG.matrix.compose(gearG.position,gearG.quaternion,gearG.scale); GH.gC.matrix.compose(gearC.position,gearC.quaternion,gearC.scale); GH.G.updateMatrixWorld(true); }
  function follow(){ /* mochilas y hombreras siguen la espalda medida sobre la malla; si no se puede medir, el hueso del pecho */
    const S_=skinM()||backM(); S_.decompose(gearC.position,gearC.quaternion,gearC.scale); S_.decompose(gearG.position,gearG.quaternion,gearG.scale);
    /* mochilas: el punto de apoyo en la espalda sigue exactamente al torso, pero solo el 60 % del giro horizontal del pecho, para que una mochila profunda no se vaya hacia un lado */
    if(BF0){ const q=gearG.quaternion.clone(), f=new THREE.Vector3(0,0,1).applyQuaternion(q); const psi=Math.atan2(f.x,f.z); const qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),psi), qr=qy.clone().invert().multiply(q);
      const upY=new THREE.Vector3(0,1,0).applyQuaternion(q).y, kY=0.6+0.4*(1-THREE.MathUtils.smoothstep(upY,0.35,0.85)); /* de pie: 60 % del giro; inclinado o tumbado el giro horizontal deja de tener sentido y la mochila sigue al torso entero */ const q2=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),psi*kY).multiply(qr); const A0=BF0.c.clone(), A1=A0.clone().applyMatrix4(S_); gearG.quaternion.copy(q2); gearG.position.copy(A1.sub(A0.applyQuaternion(q2))); } hipM().decompose(gearH.position,gearH.quaternion,gearH.scale);
    gearC.visible=ANIMON?!((PO==='tumbado'&&GD)||(FROMP&&!GD)):PO!=='tumbado'; /* tumbado: las hombreras quedan bajo los brazos levantados; dibujadas rígidas cruzarían por delante del brazo */
    if(PO==='tumbado'||ANIMON){ /* tumbado y durante la animación: las mochilas se apoyan sobre la espalda real (malla con piel) en cada fotograma, sin hueco ni hundidas */
      let pw=1; if(ANIMON){ const s0=lp('Spine01'), s1=lp('NeckTwist01'); const up=s1.sub(s0).normalize().y; pw=THREE.MathUtils.smoothstep(1-Math.abs(up),0.55,0.95); }
      if(PO==='tumbado'||FROMP){ const d=PRF().multiplyScalar(-PR.packBack*pw); gearG.position.add(d); } /* tumbado: más abajo en la espalda, lejos de la nuca */
      if(mesh.pouches_1_4) mesh.pouches_1_4.visible=pw<0.5; /* la bolsa trasera del cinturón va rígida a la cadera: tumbado quedaría de pie sobre los riñones; se oculta bajo la mochila */
      packContact(); } else if(mesh.pouches_1_4) mesh.pouches_1_4.visible=true;
    ghostTick();
    if(pvs&&pvs.userData.hm){ const m=headM().multiply(pvs.userData.hm); m.decompose(pvs.position,pvs.quaternion,pvs.scale); } }
  function handRoll(side,palmL){ /* gira la mano sobre el eje de los dedos para que la palma mire hacia palmL (cuerpo) */
    const H=B(side+'_Hand'), m=B(side+'_Mid1'), i1=B(side+'_Index1'), p1=B(side+'_Pinky1'); if(!H||!m||!i1||!p1) return;
    const f=wp(m).sub(wp(H)).normalize(), lat=wp(i1).sub(wp(p1)); let n=new THREE.Vector3().crossVectors(f,lat).normalize(); if(side==='R') n.negate();
    const want=palmL.clone().applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion())); want.sub(f.clone().multiplyScalar(want.dot(f))); if(want.lengthSq()<1e-8) return; want.normalize();
    let ang=Math.acos(Math.max(-1,Math.min(1,n.dot(want)))); if(new THREE.Vector3().crossVectors(n,want).dot(f)<0) ang=-ang;
    const qa=new THREE.Quaternion().setFromAxisAngle(f,ang); const bw=H.getWorldQuaternion(new THREE.Quaternion()), pw=H.parent.getWorldQuaternion(new THREE.Quaternion()); H.quaternion.copy(pw.invert().multiply(qa.multiply(bw))); H.updateMatrixWorld(true); }
/* ---- posturas (Fase 5b): «pie» (preparado bajo), «apunta» (apuntando de pie), «rodilla» (rodilla derecha en tierra, apuntando), «tumbado» (cuerpo a tierra, apuntando) ---- */
  const PKEY='mat_soldado_pose', POSES_ON=true; let PO='pie', PRR=30; try{ PO=localStorage.getItem(PKEY)||'pie'; }catch(e){} if(!POSES_ON||!['pie','apunta','rodilla','tumbado'].includes(PO)) PO='pie';
  const HB=B('Hip'), HIP0=HB?HB.position.clone():null; if(HB) REST.Hip=locM(HB);
  const toW=v=>body.localToWorld(v.clone()).sub(body.localToWorld(new THREE.Vector3()));
  function moveHip(dL){ if(!HB) return; HB.position.copy(HB.parent.worldToLocal(wp(HB).add(toW(dL)))); HB.updateMatrixWorld(true); }
  function hipM(){ return (HB&&REST.Hip)?locM(HB).multiply(REST.Hip.clone().invert()):new THREE.Matrix4(); }
  function ikB(U,F,H,tgtL,poleL){ if(!U||!F||!H) return; const t=body.localToWorld(tgtL.clone()); const pU=wp(U), a=wp(F).distanceTo(pU), b=wp(H).distanceTo(wp(F)); const d=t.clone().sub(pU); const dist=Math.min(Math.max(d.length(),0.05),a+b-1e-3); const dir=d.normalize();
    const ca=(a*a+dist*dist-b*b)/(2*a*dist), sa=Math.sqrt(Math.max(0,1-ca*ca)); const pole=toW(poleL).normalize(); const pp=pole.sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
    const E=pU.clone().addScaledVector(dir,a*ca).addScaledVector(pp,a*sa); aim(U,wp(F),E); aim(F,wp(H),pU.clone().addScaledVector(dir,dist)); }
  const lp=n=>body.worldToLocal(wp(B(n)));
  function footTo(side,toeL){ const Fo=B(side+'_Foot'), Tb=B(side+'_ToeBase'); if(Fo&&Tb) aim(Fo,wp(Tb),body.localToWorld(toeL)); }
  function kneel(){ moveHip(new THREE.Vector3(0,-0.43,-0.06));
    { const T=lp('R_Thigh'), Lt=lp('R_Calf').distanceTo(T), Lc=lp('R_Foot').distanceTo(lp('R_Calf')); const ky=0.075, dy=T.y-ky; const K=new THREE.Vector3(T.x-0.015,ky,T.z+Math.sqrt(Math.max(0.0004,Lt*Lt-dy*dy-0.0002)));
      const A=new THREE.Vector3(K.x-0.01,0.115,K.z-Math.sqrt(Math.max(0.01,Lc*Lc-0.0016))); ikB(B('R_Thigh'),B('R_Calf'),B('R_Foot'),A,K.clone().sub(T.clone().add(A).multiplyScalar(0.5))); footTo('R',A.clone().add(new THREE.Vector3(0,-0.08,0.12))); } /* pie derecho apoyado en la punta, sin hundirse en el suelo */
    { const T=lp('L_Thigh'); const A=new THREE.Vector3(T.x+0.05,0.125,T.z+0.43); ikB(B('L_Thigh'),B('L_Calf'),B('L_Foot'),A,new THREE.Vector3(0.1,0.8,1)); footTo('L',A.clone().add(new THREE.Vector3(0.02,-0.08,0.15))); } }
  /* ---- cuerpo a tierra v2 (Fase 6): cuerpo plano y en ángulo de 12° con la línea de tiro (piernas hacia la izquierda), pierna izquierda estirada,
     rodilla derecha flexionada hacia fuera («pierna de rana»), pies apoyados por su cara interior, pecho levantado sobre los dos codos apoyados en el suelo ---- */
  let PACKDY=null, PACKF=0, ANIMON=false, GD=false, FROMP=false; const PR={hdLean:70,hdDrop:0.16,pq:0.75,pmax:6,packBack:0.08,prr:19,prrP:8,ang:12,spread:12,frogAb:80,frogCalf:4,ky:0.075,ay:0.07,hx:0.13,hz:-0.42,ey:0.056,clear:0.025}; let PHY=0.16;
  const RQ={}; { resetBones(); const bq0=body.getWorldQuaternion(new THREE.Quaternion()).invert(); Object.values(bones).forEach(b=>RQ[b.name]=bq0.clone().multiply(b.getWorldQuaternion(new THREE.Quaternion()))); }
  const relQ=b=>body.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(b.getWorldQuaternion(new THREE.Quaternion()));
  const PRF=()=>new THREE.Vector3(-Math.sin(PR.ang*D2R),0,Math.cos(PR.ang*D2R)), PRL=()=>new THREE.Vector3(Math.cos(PR.ang*D2R),0,Math.sin(PR.ang*D2R));
  function rollTo(bone,axL,restL,wantL){ if(!bone||!RQ[bone.name]) return; const ax=axL.clone().normalize(); const n=restL.clone().applyQuaternion(relQ(bone).multiply(RQ[bone.name].clone().invert()));
    n.sub(ax.clone().multiplyScalar(n.dot(ax))); const w=wantL.clone(); w.sub(ax.clone().multiplyScalar(w.dot(ax))); if(n.lengthSq()<1e-8||w.lengthSq()<1e-8) return; n.normalize(); w.normalize();
    let a=Math.acos(Math.max(-1,Math.min(1,n.dot(w)))); if(new THREE.Vector3().crossVectors(n,w).dot(ax)<0) a=-a; rotBody(bone,ax,a); }
  function footFlat(sd,toeDir,soleWant){ const Fo=B(sd+'_Foot'), Tb=B(sd+'_ToeBase'); if(!Fo||!Tb) return; const p=lp(sd+'_Foot'); footTo(sd,p.clone().addScaledVector(toeDir.clone().normalize(),0.16)); body.updateMatrixWorld(true);
    rollTo(Fo,lp(sd+'_ToeBase').sub(lp(sd+'_Foot')),new THREE.Vector3(0,-1,0),soleWant); }
  function proneLegs(){ const F=PRF(), Lx=PRL(), U=AY, V3=THREE.Vector3;
    /* rodilla y tobillo en el plano del suelo: posiciones exactas con la longitud real de muslo y pierna, y el polo hacia la rodilla elegida */
    const onGround=(P,dirH,len,y)=>{ const dy=P.y-y, h=Math.sqrt(Math.max(1e-4,len*len-dy*dy)); return P.clone().addScaledVector(dirH,h).setY(y); };
    { const T=lp('L_Thigh'), Lt=lp('L_Calf').distanceTo(T), Lc=lp('L_Foot').distanceTo(lp('L_Calf')); const s=PR.spread*D2R; const d=F.clone().multiplyScalar(-Math.cos(s)).addScaledVector(Lx,Math.sin(s));
      const K=onGround(T,d,Lt,PR.ky+LOF[0]), A=onGround(K,d,Lc*0.995,PR.ay+LOF[0]); ikB(B('L_Thigh'),B('L_Calf'),B('L_Foot'),A,K.clone().sub(T.clone().add(A).multiplyScalar(0.5)).addScaledVector(Lx,0.04).addScaledVector(U,-0.04)); body.updateMatrixWorld(true);
      footFlat('L',Lx.clone().multiplyScalar(0.85).addScaledVector(F,-0.35).addScaledVector(U,-0.12),F.clone().multiplyScalar(-0.95).addScaledVector(Lx,-0.2).addScaledVector(U,0.1)); }
    { const T=lp('R_Thigh'), Lt=lp('R_Calf').distanceTo(T), Lc=lp('R_Foot').distanceTo(lp('R_Calf')); const ab=PR.frogAb*D2R; const kd=F.clone().multiplyScalar(-Math.cos(ab)).addScaledVector(Lx,-Math.sin(ab));
      const K=onGround(T,kd,Lt,PR.ky+LOF[1]); const c=PR.frogCalf*D2R; const cd=F.clone().multiplyScalar(-Math.cos(c)).addScaledVector(Lx,Math.sin(c)); const A=onGround(K,cd,Lc*0.995,PR.ay+LOF[1]);
      ikB(B('R_Thigh'),B('R_Calf'),B('R_Foot'),A,K.clone().sub(T.clone().add(A).multiplyScalar(0.5))); body.updateMatrixWorld(true);
      footFlat('R',Lx.clone().multiplyScalar(-0.6).addScaledVector(F,-0.75).addScaledVector(U,-0.1),F.clone().multiplyScalar(-0.6).addScaledVector(Lx,0.75).addScaledVector(U,-0.12)); /* pie derecho sobre su borde interno, suela hacia la otra pierna */ } }
  let LOF=[0,0];
  function prone(){ if(!HB) return; rotBody(HB,AX,90*D2R); rotBody(HB,AY,-PR.ang*D2R); const c=lp('Hip'); moveHip(new THREE.Vector3(PR.hx-c.x,PHY-c.y,PR.hz-c.z));
    const lat=PRL(); TWB.forEach(([n,w])=>rotBody(B(n),lat,-PRR*w*D2R)); body.updateMatrixWorld(true); proneLegs(); body.updateMatrixWorld(true); }
  /* suelo: altura mínima de los vértices con piel, por grupos (0 tronco y piernas, 1 brazo izq., 2 brazo dcho., 3 cabeza), en unidades del cuerpo */
  const GRP=new Map();
  function vgroups(m){ let g=GRP.get(m); if(g) return g; const si=m.geometry.attributes.skinIndex, sw=m.geometry.attributes.skinWeight, n=m.geometry.attributes.position.count; g=new Uint8Array(n); const bs=m.skeleton.bones;
    for(let i=0;i<n;i++){ let bi=0,bw=-1; for(let k=0;k<4;k++){ const w=sw.getComponent(i,k); if(w>bw){ bw=w; bi=si.getComponent(i,k); } } const nm=(bs[bi]&&bs[bi].name)||'';
      g[i]=/L_(Clavicle|Upperarm|Forearm|Elbow|Hand|Index|Mid|Ring|Pinky|Thumb)/.test(nm)?1:/R_(Clavicle|Upperarm|Forearm|Elbow|Hand|Index|Mid|Ring|Pinky|Thumb)/.test(nm)?2:/Neck|Head|Facial|Jaw|Eye|Teeth|Tongue/.test(nm)?3:/^CC_Base_L_(Thigh|Calf|Foot|Toe|Knee)/.test(nm)?4:/^CC_Base_R_(Thigh|Calf|Foot|Toe|Knee)/.test(nm)?5:0; } GRP.set(m,g); return g; }
  function lowY(step){ body.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(), r=[9,9,9,9,9,9], v=new THREE.Vector3(), M=new THREE.Matrix4();
    body.traverse(m=>{ if(!m.isSkinnedMesh||!m.visible||!m.geometry.attributes.skinIndex) return; m.skeleton.update(); const g=vgroups(m), n=m.geometry.attributes.position.count; M.multiplyMatrices(inv,m.matrixWorld);
      for(let i=0;i<n;i+=step){ m.getVertexPosition(i,v); v.applyMatrix4(M); if(v.y<r[g[i]]) r[g[i]]=v.y; } }); return r; }
  function objLow(o){ if(!o) return 9; body.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(), v=new THREE.Vector3(), M=new THREE.Matrix4(); let y=9;
    o.traverse(m=>{ if(!m.isMesh||m.isSkinnedMesh) return; let p=m, vis=true; while(p&&p!==body){ if(!p.visible){ vis=false; break; } p=p.parent; } if(!vis) return; if(m.name==='mat_beams'||(m.parent&&m.parent.name==='mat_beams')) return; { let q=m, bip=false; while(q&&q!==o){ if(q.name==='mat_bipod'){ bip=true; break; } q=q.parent; } if(bip) return; }
      const P=m.geometry.attributes.position; M.multiplyMatrices(inv,m.matrixWorld); const st_=Math.max(1,Math.floor(P.count/600)); for(let i=0;i<P.count;i+=st_){ v.fromBufferAttribute(P,i).applyMatrix4(M); if(v.y<y) y=v.y; } }); return y; }
  /* brazo con el codo en el suelo: de las posiciones posibles del codo (un círculo) elige la que queda a la altura ey, hacia el lado indicado; si no llega, la más baja */
  function elbowMin(sd,tgtL){ const pU=lp(sd+'_Upperarm'), a=lp(sd+'_Forearm').distanceTo(pU), b=lp(sd+'_Hand').distanceTo(lp(sd+'_Forearm')); const d=tgtL.clone().sub(pU), dist=Math.min(Math.max(d.length(),0.05),a+b-1e-3), dir=d.normalize();
    const ca=(a*a+dist*dist-b*b)/(2*a*dist), sa=Math.sqrt(Math.max(0,1-ca*ca)); return pU.y+dir.y*a*ca-a*sa*Math.sqrt(Math.max(0,1-dir.y*dir.y)); }
  function ikG(sd,tgtL,ey,side){ const U=B(sd+'_Upperarm'),Fa=B(sd+'_Forearm'),H=B(sd+'_Hand'); if(!U||!Fa||!H) return 0; const pU=lp(sd+'_Upperarm'), a=lp(sd+'_Forearm').distanceTo(pU), b=lp(sd+'_Hand').distanceTo(lp(sd+'_Forearm'));
    const d=tgtL.clone().sub(pU), dist=Math.min(Math.max(d.length(),0.05),a+b-1e-3), dir=d.normalize(); const ca=(a*a+dist*dist-b*b)/(2*a*dist), sa=Math.sqrt(Math.max(0,1-ca*ca)); const c=pU.clone().addScaledVector(dir,a*ca), r=a*sa;
    const e1=new THREE.Vector3(0,-1,0).addScaledVector(dir,dir.y).normalize(), e2=new THREE.Vector3().crossVectors(dir,e1).normalize(); const ymin=c.y+r*e1.y; let pole=e1.clone();
    if(ymin<ey&&r>1e-4){ const t=Math.acos(Math.max(-1,Math.min(1,(ey-c.y)/(r*e1.y)))); const s=e2.dot(side)>=0?1:-1; pole=e1.clone().multiplyScalar(Math.cos(t)).addScaledVector(e2,s*Math.sin(t)); }
    ikB(U,Fa,H,tgtL,pole); return ymin-ey; }
  /* ---- bípode de las ametralladoras (Fase 6) — modelo aproximado hecho por MAT a partir de medidas oficiales: los modelos 3D de M249, M240 y PKM no traen bípode.
     Datos oficiales usados: M249 — las patas se bajan desde el guardamanos y quedan verticales; patas telescópicas de tres longitudes (TM 9-1005-201-10; TC 3-22.249).
     M240/FN MAG — anchura sobre el bípode 408 mm y plegado 160 mm (FN Herstal, ficha del FN MAG). PKM — bípode sujeto al cilindro de gases bajo el cañón.
     Punto de giro en el cilindro de gases de cada modelo (unidades del modelo); la longitud de las patas se ajusta al suelo (son telescópicas). */
  const BIPS={ m249:{z:0.19,y:-0.035,fold:0.21,sp:null}, m240:{z:0.43,y:-0.052,fold:0.27,sp:0.408,pitch:-4.5}, pkm:{z:0.40,y:0.022,fold:0.24,sp:null} };
  let bip=null, BT=0;
  const gmBip=new THREE.MeshStandardMaterial({color:0x2a2c2d,roughness:0.55,metalness:0.55});
  function bipodBuild(){ if(bip&&bip.parent) bip.parent.remove(bip); bip=null; if(!wpn||!wi) return; const c=BIPS[wi.v.id]||BIPS[wi.w.id]; if(!c) return;
    const g=new THREE.Group(); g.name='mat_bipod'; g.userData.c=c; const yoke=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.03,0.035),gmBip); yoke.position.set(0,c.y-0.012,c.z); g.add(yoke);
    const legs=[]; [-1,1].forEach(s=>{ const pv=new THREE.Group(); pv.position.set(s*0.017,c.y-0.02,c.z); const up=new THREE.Mesh(new THREE.CylinderGeometry(0.0085,0.0085,1,10),gmBip); up.castShadow=true; pv.add(up);
      const lo=new THREE.Mesh(new THREE.CylinderGeometry(0.0065,0.0065,1,10),gmBip); lo.castShadow=true; pv.add(lo); const ft=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.008,0.022),gmBip); ft.castShadow=true; pv.add(ft);
      const lt=new THREE.Mesh(new THREE.BoxGeometry(0.012,0.022,0.012),gmBip); lt.position.set(0,-0.04,0); pv.add(lt); /* pestillo de la extensión */
      pv.userData={s,up,lo,ft}; g.add(pv); legs.push(pv); }); g.userData.legs=legs; wpn.add(g); bip=g; bipodSet(BT,null); }
  /* t: 0 plegado (patas hacia atrás bajo el guardamanos), 1 desplegado (verticales y abiertas); L: largo de la pata en unidades del modelo */
  function bipodSet(t,L){ if(!bip) return; const c=bip.userData.c; BT=t; if(L) bip.userData.L=L; const Lf=c.fold, Ld=L||Lf; const len=Lf+(Ld-Lf)*Math.max(0,(t-0.6)/0.4);
    const half=c.sp?c.sp/2/0.847:null; const spr=bip.userData.spr!=null?bip.userData.spr:(half&&Ld>half?Math.asin(Math.min(0.8,half/Ld)):0.42);
    bip.userData.legs.forEach(pv=>{ const s=pv.userData.s, u=THREE.MathUtils.smoothstep(t,0,0.6), w=THREE.MathUtils.smoothstep(t,0.45,1);
      pv.rotation.set((1-u)*Math.PI/2,0,s*spr*w); pv.rotation.order='ZXY';
      const lu=Math.min(len,Lf*0.62); pv.userData.up.scale.set(1,lu,1); pv.userData.up.position.set(0,-lu/2,0); pv.userData.lo.scale.set(1,len,1); pv.userData.lo.position.set(0,-len/2,0);
      pv.userData.ft.position.set(0,-len-0.004,0); pv.userData.ft.visible=t>0.5; }); }
  /* largo de pata para que el pie toque el suelo con el arma en su sitio */
  function bipodGround(){ if(!bip) return; const c=bip.userData.c; body.updateMatrixWorld(true); wpn.updateMatrixWorld(true); const hw=body.worldToLocal(wpn.localToWorld(new THREE.Vector3(0,c.y-0.02,c.z))); const k=wpn.scale.x;
    const half=c.sp?c.sp/2/0.847:null; let spr=0.42, L; const h=(hw.y-0.006)/k; if(half){ L=Math.sqrt(h*h+half*half); spr=Math.atan2(half,h); } else L=h/Math.cos(spr); bip.userData.spr=spr; bipodSet(1,L); return {h:+(hw.y).toFixed(3),L:+L.toFixed(3),spr:+(spr/D2R).toFixed(1)}; }
  /* ---- transiciones animadas entre posturas (Fase 6): interpolación suave de los huesos (~1,2 s); las manos siguen sujetando el arma (cinemática inversa en cada fotograma).
     A tumbado: rodilla en tierra → manos al suelo (se despliega el bípode, si lo hay) → cuerpo a tierra → arma arriba. Con «reducir movimiento» del sistema, cambio directo. ---- */
  const BL=Object.values(bones), V3=THREE.Vector3; let ANIM=null;
  function handLoc(sd){ if(!wpn) return null; const H_=B(sd+'_Hand'); if(!H_) return null; const Mw=new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale); const p=lp(sd+'_Hand').applyMatrix4(Mw.clone().invert());
    if(p.length()>2.5/wpn.scale.x) return null; return {p, q:wpn.quaternion.clone().invert().multiply(relQ(H_))}; }
  function snap(free){ body.updateMatrixWorld(true); return { q:BL.map(b=>b.quaternion.clone()), hip:HB?HB.position.clone():null, ry:body.rotation.y, wp:wpn?wpn.position.clone():null, wq:wpn?wpn.quaternion.clone():null,
    bt:BT, bl:bip?bip.userData.L||null:null, spr:bip?bip.userData.spr:null, hR:(free&&free.R)?null:handLoc('R'), hL:(free&&free.L)?null:handLoc('L'), gL:(free&&free.L)?holder.worldToLocal(wp(B('L_Hand'))):null, gq:(free&&free.L)?body.quaternion.clone().multiply(relQ(B('L_Hand'))):null }; }
  function restore(S0){ BL.forEach((b,i)=>b.quaternion.copy(S0.q[i])); if(HB&&S0.hip) HB.position.copy(S0.hip); body.rotation.y=S0.ry; if(wpn&&S0.wp){ wpn.position.copy(S0.wp); wpn.quaternion.copy(S0.wq); } if(bip){ if(S0.spr!=null) bip.userData.spr=S0.spr; bipodSet(S0.bt,S0.bl); } body.updateMatrixWorld(true); }
  const JR=[['L_Calf',0.065],['R_Calf',0.065],['L_ToeBase',0.035],['R_ToeBase',0.035],['L_Foot',0.05],['R_Foot',0.05],['L_Hand',0.03],['R_Hand',0.03],['L_Forearm',0.05],['R_Forearm',0.05],['Head',0.13],['Spine02',0.16],['Hip',0.14]];
  const LEGB=BL.map(b=>/_(Thigh|Calf|Foot|Toe|Knee)/.test(b.name));
  function blendTo(SA,SB,t,lt){ const tl=lt!=null?lt:t; BL.forEach((b,i)=>b.quaternion.slerpQuaternions(SA.q[i],SB.q[i],LEGB[i]?tl:t)); if(HB&&SA.hip&&SB.hip) HB.position.lerpVectors(SA.hip,SB.hip,t); body.rotation.y=SA.ry+(SB.ry-SA.ry)*t; body.updateMatrixWorld(true);
    ['L','R'].forEach(sd=>{ const K_=lp(sd+'_Calf'); if(K_.y<0.065){ const T_=lp(sd+'_Thigh'), Lt=K_.distanceTo(T_), dyk=T_.y-0.065; if(Math.abs(dyk)<Lt){ const hd=K_.clone().sub(T_).setY(0); if(hd.lengthSq()<1e-6) hd.set(0,0,-1); hd.normalize(); const K2=T_.clone().addScaledVector(hd,Math.sqrt(Lt*Lt-dyk*dyk)); K2.y=0.065; aim(B(sd+'_Thigh'),wp(B(sd+'_Calf')),body.localToWorld(K2)); body.updateMatrixWorld(true); } } }); /* la rodilla apoya y pivota en el suelo, no lo atraviesa */
    ['L','R'].forEach(sd=>{ const A=lp(sd+'_Foot'), Tb=lp(sd+'_ToeBase'); const lo=Math.min(A.y-0.05,Tb.y-0.035); if(lo<0){ const tg=A.clone(); tg.y-=lo; const K_=lp(sd+'_Calf'), T_=lp(sd+'_Thigh'); ikB(B(sd+'_Thigh'),B(sd+'_Calf'),B(sd+'_Foot'),tg,K_.clone().sub(T_.clone().add(tg).multiplyScalar(0.5))); body.updateMatrixWorld(true);
      const t2=lp(sd+'_ToeBase'); if(t2.y<0.035){ t2.y=0.035; footTo(sd,t2); body.updateMatrixWorld(true); } } }); /* un pie que pasaría por debajo del suelo se levanta solo él (la pierna), no todo el cuerpo */
    let dy=0; JR.forEach(([n,r])=>{ if(/Foot|ToeBase/.test(n)) return; const b=B(n); if(b){ const y=lp(n).y-r; if(y<-dy) dy=-y; } }); window.MAT_DY=[dy,JR.map(([n,r])=>{ const b=B(n); return b?n+':'+(lp(n).y-r).toFixed(2):''; }).join(' ')]; if(dy>0) moveHip(new V3(0,dy,0)); /* nada atraviesa el suelo durante el movimiento */
    if(wpn&&SA.wp&&SB.wp){ wpn.position.lerpVectors(SA.wp,SB.wp,t); wpn.position.y+=dy; wpn.quaternion.slerpQuaternions(SA.wq,SB.wq,t); wpn.updateMatrixWorld(true); body.updateMatrixWorld(true);
      const Mw=new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale);
      if(SA.gL||SB.gL){ /* mano izquierda apoyada en el suelo: se queda clavada en su sitio mientras el cuerpo baja y solo al final sube al arma */
        const H_=B('L_Hand'); const gB=g=>body.worldToLocal(holder.localToWorld(g.clone())); const qB=q=>body.quaternion.clone().invert().multiply(q);
        let tg=null, qw=null; const wq_=h=>wpn.quaternion.clone().multiply(h.q);
        if(SA.gL&&SB.gL){ tg=gB(SA.gL); qw=qB(SA.gq); }
        else if(SA.gL&&SB.hL){ const k=THREE.MathUtils.smoothstep(t,0.4,0.92); tg=gB(SA.gL).lerp(SB.hL.p.clone().applyMatrix4(Mw),k); qw=qB(SA.gq).slerp(wq_(SB.hL),k); }
        else if(SB.gL&&SA.hL){ const k=THREE.MathUtils.smoothstep(t,0.08,0.7); tg=SA.hL.p.clone().applyMatrix4(Mw).lerp(gB(SB.gL),k); qw=wq_(SA.hL).slerp(qB(SB.gq),k); }
        if(tg){ const pu=lp('L_Upperarm'), pe=lp('L_Forearm'); ikB(B('L_Upperarm'),B('L_Forearm'),H_,tg,pe.sub(pu.clone().add(tg).multiplyScalar(0.5)).add(new V3(0.15,0,0))); H_.quaternion.copy(relQ(H_.parent).invert().multiply(qw)); H_.updateMatrixWorld(true); } }
      ['R','L'].forEach(sd=>{ const a=SA['h'+sd], b=SB['h'+sd]; if(!a||!b) return; const tg=a.p.clone().lerp(b.p,t).applyMatrix4(Mw); const U=B(sd+'_Upperarm'),F=B(sd+'_Forearm'),H_=B(sd+'_Hand');
        const pu=lp(sd+'_Upperarm'), pe=lp(sd+'_Forearm'); const pole=pe.sub(pu.clone().add(tg).multiplyScalar(0.5)); ikB(U,F,H_,tg,pole);
        const want=wpn.quaternion.clone().multiply(a.q.clone().slerp(b.q,t)); H_.quaternion.copy(relQ(H_.parent).invert().multiply(want)); H_.updateMatrixWorld(true); }); }
    if(bip){ const sp=SB.spr!=null?SB.spr:SA.spr; if(sp!=null) bip.userData.spr=sp; bipodSet(SA.bt+(SB.bt-SA.bt)*t,SB.bl||SA.bl); }
    follow(); }
  /* manos al suelo: desde la rodilla, el torso se inclina, la mano izquierda apoya en el suelo y el arma baja en la mano derecha, boca al frente */
  function handsDown(){ moveHip(new V3(0,-PR.hdDrop,0.0)); body.updateMatrixWorld(true); bothKnees(); TWB.forEach(([n,w])=>rotBody(B(n),AX,PR.hdLean*w*D2R)); body.updateMatrixWorld(true); /* de rodillas con las dos piernas, inclinado hacia delante: la mano izquierda llega al suelo */
    const LK=lp('L_Calf'); BL.forEach(b=>{ if(/^CC_Base_L_(Thumb|Index|Mid|Ring|Pinky)/.test(b.name)&&body.userData.rest[b.name]) b.quaternion.copy(body.userData.rest[b.name]); }); body.updateMatrixWorld(true);
    const SL=lp('L_Upperarm'); const gp_=new V3(SL.x+0.03,0.045,SL.z+0.1); ik('L',gp_,new V3(0.7,0.1,-0.5)); handTo('L',new V3(0.12,-0.06,1)); handRoll('L',new V3(0,-1,0)); body.updateMatrixWorld(true);
    flatHand('L'); { const lo=lowY(2)[1]; if(lo<8){ gp_.y+=0.004-lo; ik('L',gp_,new V3(0.7,0.1,-0.5)); handTo('L',new V3(0.12,-0.06,1)); handRoll('L',new V3(0,-1,0)); body.updateMatrixWorld(true); flatHand('L'); } } /* palma apoyada en el suelo: lo más bajo de la mano a ras de suelo */
    if(!wpn) return; const pist=wi&&wi.w.cat==='pistol'; const k=wpn.scale.x, gp=wpn.userData.gp; const q=new THREE.Quaternion().setFromRotationMatrix(basis(axis(0,pist?40:16))); wpn.quaternion.copy(q);
    const RS=lp('R_Upperarm'); const G=new V3(RS.x-0.02,Math.max(0.36,RS.y-0.3),RS.z+0.26); wpn.position.copy(G).sub(new V3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q)); wpn.updateMatrixWorld(true);
    const bb=new THREE.Box3().setFromObject(wpn); const by=body.worldToLocal(bb.min.clone()).y; if(by<0.03){ wpn.position.y+=0.03-by; G.y+=0.03-by; }
    const R_=new THREE.Matrix4().makeRotationFromQuaternion(q), ex=new V3().setFromMatrixColumn(R_,0), ey=new V3().setFromMatrixColumn(R_,1), ez=new V3().setFromMatrixColumn(R_,2);
    ik('R',G.clone().addScaledVector(ez,-0.045).addScaledVector(ey,0.035).addScaledVector(ex,-0.02),new V3(-1,-0.4,-0.3)); handTo('R',ey.clone().multiplyScalar(-0.6).addScaledVector(ez,0.3)); handRoll('R',ex.clone()); body.updateMatrixWorld(true); }
  function kneelLeg(sd,dx){ /* rodilla en el suelo delante de la cadera, pie detrás apoyado en la punta */
    const T=lp(sd+'_Thigh'), Lt=lp(sd+'_Calf').distanceTo(T), Lc=lp(sd+'_Foot').distanceTo(lp(sd+'_Calf')); const ky=0.075, dy=T.y-ky; const hz=Math.sqrt(Math.max(0.0004,Lt*Lt-dy*dy-0.0002)); const K=new V3(T.x+dx,ky,T.z+hz); const A=new V3(K.x+dx*0.5,0.115,K.z-Math.sqrt(Math.max(0.01,Lc*Lc-0.0016)));
    ikB(B(sd+'_Thigh'),B(sd+'_Calf'),B(sd+'_Foot'),A,K.clone().sub(T.clone().add(A).multiplyScalar(0.5))); footTo(sd,new V3(A.x,0.04,A.z-0.13)); body.updateMatrixWorld(true); }
  function bothKnees(){ kneelLeg('L',0.02); kneelLeg('R',-0.015); }
  function flatHand(sd){ /* dedos estirados: cada falange sigue la dirección de la anterior (mano abierta apoyada, no en puño) */
    ['Index','Mid','Ring','Pinky'].forEach(f=>{ let prev=B(sd+'_Hand'); for(let i=1;i<=3;i++){ const b=B(sd+'_'+f+i), c=B(sd+'_'+f+(i+1))||(b&&b.children[0]); if(!b||!c||!prev) break; const d=wp(b).sub(wp(prev)).normalize(); const L_=wp(c).distanceTo(wp(b)); aim(b,wp(c),wp(b).addScaledVector(d,L_)); prev=b; } }); body.updateMatrixWorld(true); }
  function kneesUp(){ const F=PRF(); ['L','R'].forEach(sd=>{ const T_=lp(sd+'_Thigh'), K=lp(sd+'_Calf'), A=lp(sd+'_Foot'); const Lc=A.distanceTo(K); const dir=K.clone().sub(T_).setY(0).normalize();
      const tgt=K.clone().addScaledVector(dir,Lc*1.0).add(new V3(0,Lc*0.12,0)); ikB(B(sd+'_Thigh'),B(sd+'_Calf'),B(sd+'_Foot'),tgt,dir.clone().add(new V3(0,-0.3,0))); }); body.updateMatrixWorld(true); }
  function fitPose(){ if(V.fitAll) V.fitAll(PO==='tumbado'?0.92:0, 0.3); else if(V.fitK) V.fitK(PO==='tumbado'?1.3:1); } /* tumbado: la figura y el arma caben enteras con la cámara en cualquier giro, vista algo desde arriba */
  function ease(t){ return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2; }
  function poseKey(po){ PO=po; pose(); return snap(); }
  function transition(to){ if(BR) BR.pause(400); const from=PO; const red=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(FK){ FK.settle(); } FKHOLD=false; if(ANIM){ cancelAnimationFrame(ANIM.raf); ANIM=null; } ghostEnd(); ANIMON=false; GD=false; FROMP=from==='tumbado';
    const S0=snap(); const keys=[]; let gearAt=-1;
    if(red){ PO=to; fitPose(); pose(); rebuildGear(); skinBounds(); V.recenter(); V.redraw(); return; }
    if(to==='tumbado'||from==='tumbado'){ const Kp=poseKey('tumbado'); PO='rodilla'; pose(); const Kk=snap(); handsDown(); if(bip){ bip.userData.spr=Kp.spr; bipodSet(1,Kp.bl); } const Kh=snap({L:1});
      restore(Kp); kneesUp(); const K3=snap();
      if(to==='tumbado'){ if(from!=='rodilla') keys.push([Kk,0.38]); keys.push([Kh,0.42]); keys.push([K3,0.42]); keys.push([Kp,0.32]); gearAt=-2; }
      else { const Kt=poseKey(to); keys.push([K3,0.32]); keys.push([Kh,0.42]); keys.push([Kk,0.38]); if(to!=='rodilla') keys.push([Kt,0.38]); gearAt=1; } }
    else keys.push([poseKey(to),0.8]);
    PO=to; fitPose(); /* tumbado: encuadre que cabe entero girando la cámara */ const fin=keys[keys.length-1][0]; const late=to==='rodilla'&&from!=='tumbado'; /* a rodilla desde de pie: se encuadra al final, para no cortar la cabeza al empezar */ if(!late){ restore(fin); skinBounds(); V.recenter(); } restore(S0);
    ATIME=0; if(gearAt===-2){ GD=true; ghostStart(0.35); rebuildGear(); gearAt=-1; } /* hacia tumbado: el equipo de tumbado desde el principio; la mochila grande se desvanece en la espalda mientras se arrodilla */
    follow();
    const tot=keys.reduce((s_,k)=>s_+k[1],0); let tS=performance.now();
    const fin_=()=>{ ANIM=null; ANIMON=false; ghostEnd(); pose(); rebuildGear(); skinBounds(); if(late) V.recenter(); V.redraw(); };
    const step=now=>{ const T=(now-tS)/1000; animAt(T); V.redraw(); if(T>=tot){ fin_(); return; } ANIM.raf=requestAnimationFrame(step); };
    ANIMON=true; ANIM={raf:0, keys, S0, gearAt, tot, gd:0}; if(!window.MAT_ANIM_MANUAL) ANIM.raf=requestAnimationFrame(step); }
  /* reloj de la animación: suavizado global (arranca y termina despacio, sin frenazos entre fases) y cada fase con las esquinas redondeadas */
  function animAt(T){ if(!ANIM) return null; const tot=ANIM.tot, u=Math.min(1,Math.max(0,T/tot)); const Tw=(0.5-0.5*Math.cos(Math.PI*u))*tot; ATIME=T;
    let acc=0, i=0; for(;i<ANIM.keys.length-1;i++){ if(Tw<=acc+ANIM.keys[i][1]) break; acc+=ANIM.keys[i][1]; }
    if(ANIM.gearAt>=0&&i>ANIM.gearAt&&!ANIM.gd){ ANIM.gd=1; GD=true; ghostStart(0.35); rebuildGear(); }
    const d=ANIM.keys[i][1], t=Math.min(1,Math.max(0,(Tw-acc)/d)), tl=0.45*t+0.55*t*t*(3-2*t); blendTo(i?ANIM.keys[i-1][0]:ANIM.S0,ANIM.keys[i][0],tl); return {seg:i,total:tot}; }
  function animSeek(T){ if(!ANIM) return null; const r=animAt(T); V.redraw(); return r; }
  function stopAnim(){ ANIMON=false; if(ANIM){ cancelAnimationFrame(ANIM.raf); ANIM=null; } ghostEnd(); }
  const wpnBody=()=>wpn;
  function proneHip(){ for(let k=0;k<4;k++){ base(); const lo=lowY(3); let ok=Math.abs(lo[0]-0.002)<0.003; PHY-=lo[0]-0.002; [4,5].forEach((g,i)=>{ if(Math.abs(lo[g]-0.003)>0.003){ LOF[i]-=lo[g]-0.003; ok=false; } }); if(ok) break; } base(); }
  function stance(){ if(PO==='rodilla') kneel(); else if(PO==='tumbado') prone(); }
  /* apuntar: cabeza sobre la culata. Busca inclinación, giro y ladeo de cuello/cabeza que llevan el ojo derecho a la línea de mira */
  const EYE=B('R_Eye'), NK=[B('NeckTwist01'),B('NeckTwist02'),B('Head')].filter(Boolean);
  let EL0r=null; if(EYE&&B('Head')){ body.updateMatrixWorld(true); const v=body.worldToLocal(wp(EYE)).sub(body.worldToLocal(wp(B('Head')))); EL0r=Math.atan2(v.y,Math.hypot(v.x,v.z)); }
  function lineDist(p,a,d){ const v=p.clone().sub(a); return v.sub(d.clone().multiplyScalar(v.dot(d))).length(); }
  let HPX=12; function headSolve(a0,dW,yawB,c0){ c0=c0||0; if(!EYE||NK.length<2) return 9; const sv=NK.map(b=>b.quaternion.clone()), fw=new THREE.Vector3(Math.sin(yawB),0,Math.cos(yawB)), lat=new THREE.Vector3(Math.cos(yawB),0,-Math.sin(yawB)), Hd=B('Head'), N1=NK[0];
    const app=(a,b,c)=>{ NK.forEach((bn,i)=>bn.quaternion.copy(sv[i])); body.updateMatrixWorld(true); rotBody(N1,AY,c*0.5*D2R); rotBody(Hd,AY,c*0.5*D2R); rotBody(N1,lat,a*0.5*D2R); rotBody(Hd,lat,a*0.5*D2R); rotBody(Hd,fw,b*D2R); body.updateMatrixWorld(true); };
    const cost=(a,b,c)=>{ app(a,b,c); return lineDist(wp(EYE),a0,dW)+0.0004*(Math.abs(a)+Math.abs(b)+Math.abs(c)); };
    let bb=[0,0,0], bc=cost(0,0,0);
    for(let a=(PO==='tumbado'?-8:-12);a<=(PO==='tumbado'?HPX:32);a+=4) for(let b=-6;b<=24;b+=6) for(let c=c0-30;c<=c0+30;c+=10){ const v=cost(a,b,c); if(v<bc){ bc=v; bb=[a,b,c]; } }
    const AMN=PO==='tumbado'?-8:-12, AMX=PO==='tumbado'?HPX:32; /* tumbado: la cabeza no se hunde sobre el arma (cara visible, casco sin tocar la mira) */
    for(let st_=3; st_>=1; st_-=1){ const [a1,b1,c1]=bb; for(let a=Math.max(AMN,a1-2*st_);a<=Math.min(AMX,a1+2*st_);a+=st_) for(let b=b1-2*st_;b<=b1+2*st_;b+=st_) for(let c=c1-2*st_;c<=c1+2*st_;c+=st_){ const v=cost(a,b,c); if(v<bc){ bc=v; bb=[a,b,c]; } } }
    app(bb[0],bb[1],bb[2]); DBGH.hs=bb.slice(); return lineDist(wp(EYE),a0,dW); }
  /* mirar al frente (pistola, y tumbado): gira cuello y cabeza hasta que la cara mira hacia fw (marco del cuerpo) */
  let EL0=null; function headLook(fwL){ if(!EYE||NK.length<2) return; const Hd=B('Head'); if(EL0==null){ EL0=EL0r!=null?EL0r:0.6; } for(let it=0;it<3;it++){ const hp=wp(Hd), f=wp(EYE).sub(hp).normalize(); const t=body.localToWorld(fwL.clone().setY(0).normalize().multiplyScalar(Math.cos(EL0)).add(new THREE.Vector3(0,Math.sin(EL0),0))).sub(body.localToWorld(new THREE.Vector3())).normalize();
      const q=new THREE.Quaternion().setFromUnitVectors(f,t); const ang=2*Math.acos(Math.min(1,Math.abs(q.w))); if(ang<0.01) break; const ax=new THREE.Vector3(q.x,q.y,q.z).normalize(); const axL=ax.clone().applyQuaternion(body.getWorldQuaternion(new THREE.Quaternion()).invert());
      rotBody(NK[0],axL,ang*0.5); rotBody(Hd,axL,ang*0.5); body.updateMatrixWorld(true); } }
  function axis(yaw,pitch){ return new THREE.Vector3(Math.sin(yaw*D2R)*Math.cos(pitch*D2R),-Math.sin(pitch*D2R),Math.cos(yaw*D2R)*Math.cos(pitch*D2R)).normalize(); }
  const RP={ pitch:22, lean:5, hipPitch:3, hipLean:3, twMax:24, relMin:24, relMax:60 };
  const SHH0=new THREE.Vector3(-0.17,1.12,0.02);
  function base(){ resetBones(); if(HB&&HIP0){ HB.position.copy(HIP0); } body.updateMatrixWorld(true); stance(); body.updateMatrixWorld(true); }
  const AIM=()=>PO!=='pie';
  function skinBounds(){ body.updateMatrixWorld(true); body.traverse(m=>{ if(m.isSkinnedMesh){ m.skeleton&&m.skeleton.update(); m.boundingBox=null; m.boundingSphere=null; } }); } /* la caja y la esfera de las mallas con piel siguen a la postura (encuadre de la cámara y recorte) */
  function pose(){ if(FK) FK.settle(); PACKDY=null; body.rotation.y=0; body.updateMatrixWorld(true); const PRN=PO==='tumbado'; if(PRN){ PRR=(wi&&wi.w.cat==='pistol')?PR.prrP:PR.prr; proneHip(); } base(); TWS={tw:0,lean:0};
    if(!wpn){ const C=chestM(); ik('R',new THREE.Vector3(-0.21,0.93,0.02).applyMatrix4(C),new THREE.Vector3(-0.3,0,-1)); ik('L',new THREE.Vector3(0.2,0.93,0.02).applyMatrix4(C),new THREE.Vector3(0.3,0,-1)); if(PO==='tumbado') headLook(new THREE.Vector3(0,0,1)); follow(); return; }
    const pist=wi&&wi.w.cat==='pistol'; const s=holder.scale.x||1, k=U2M/s; const gp=wpn.userData.gp; wpn.scale.setScalar(k);
    if(pist){ let R,q,G; wpn.updateMatrixWorld(true); let ytop=-1e9; { const inv=new THREE.Matrix4().copy(wpn.matrixWorld).invert(); wpn.traverse(z=>{ if(z.isMesh&&z.visible){ z.geometry.computeBoundingBox(); const bb=z.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,z.matrixWorld)); ytop=Math.max(ytop,bb.max.y); } }); }
      if(AIM()||PO==='tumbado'){ /* pistola apuntada (también tumbado, con los brazos extendidos al frente): brazos extendidos, alza y punto en línea con el ojo derecho */
        headLook(new THREE.Vector3(0,0,1)); const E=body.worldToLocal(wp(EYE)); const dir=new THREE.Vector3(0,0,1); R=basis(dir); q=new THREE.Quaternion().setFromRotationMatrix(R); wpn.quaternion.copy(q);
        ['R','L'].forEach(sd=>{ const C=B(sd+'_Clavicle'), U=B(sd+'_Upperarm'); if(!C||!U) return; const pc=wp(C), pu=wp(U), L0=pu.distanceTo(pc); const tW=body.localToWorld(E.clone().add(new THREE.Vector3(0,-0.1,0.6))); const a1=pu.clone().sub(pc).normalize(), a2=tW.sub(pc).normalize(); aim(C,pu,pc.clone().add(a1.multiplyScalar(0.6).add(a2.multiplyScalar(0.4)).normalize().multiplyScalar(L0))); }); body.updateMatrixWorld(true); /* hombros adelantados, como al extender los brazos */
        const sh=body.worldToLocal(wp(B('R_Upperarm'))), rr=wp(B('R_Forearm')).distanceTo(wp(B('R_Upperarm')))+wp(B('R_Hand')).distanceTo(wp(B('R_Forearm'))); let dz=0.5; for(;dz>0.25;dz-=0.01){ const g=E.clone().add(new THREE.Vector3(0,-0.07,dz)); if(g.distanceTo(sh)<rr*0.93) break; } const S_=E.clone().add(new THREE.Vector3(0,0,dz)); /* tan lejos del ojo como lleguen los brazos casi extendidos */ wpn.position.copy(S_).sub(new THREE.Vector3(0,ytop-0.004/k,gp[0]).multiplyScalar(k).applyQuaternion(q)); wpn.updateMatrixWorld(true);
        G=new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q).add(wpn.position); }
      else { R=basis(AXDP); q=new THREE.Quaternion().setFromRotationMatrix(R); wpn.quaternion.copy(q); G=new THREE.Vector3(-0.03,1.16,0.45).applyMatrix4(chestM()); wpn.position.copy(G).sub(new THREE.Vector3(0,gp[1],gp[0]).multiplyScalar(k).applyQuaternion(q)); }
      const ax=new THREE.Vector3().setFromMatrixColumn(R,2), back=ax.clone().multiplyScalar(-1);
      ik('R',G.clone().addScaledVector(back,0.045).add(new THREE.Vector3(-0.025,0.035,0)),new THREE.Vector3(-0.6,-0.7,-0.3)); handTo('R',new THREE.Vector3(0,-0.6,0.3));
      const ex=new THREE.Vector3().setFromMatrixColumn(R,0), ey=new THREE.Vector3().setFromMatrixColumn(R,1), ez=new THREE.Vector3().setFromMatrixColumn(R,2);
      DBGH.p={pist:1,po:PO}; const Hl=G.clone().addScaledVector(ex,0.022).addScaledVector(ey,-0.058).addScaledVector(ez,0.0); DBGH.t=Hl.clone(); DBGH.g=G.clone();
      ik('L',Hl,new THREE.Vector3(0.8,-0.6,-0.1)); handTo('L',ex.clone().multiplyScalar(-0.55).addScaledVector(ez,0.75).addScaledVector(ey,-0.15)); follow(); return; }
    /* ---- fusiles, carabinas, subfusiles, ametralladoras ---- */
    const m=M.mt(wi.v)||{}, sb=wpn.userData.stock, bore=m.bore!=null?m.bore:(gp[1]+0.08), yLow=(wpn.userData.bmin!=null?wpn.userData.bmin:-0.3)-0.05;
    const hip=!!(HIP[wi.v.id]||HIP[wi.w.id]); /* ametralladoras con bípode (y el M82): «al asalto», culata bajo el brazo y mano de apoyo por encima */
    const ua=st.arma&&st.arma.on&&st.arma.on.under; let uo=null; if(ua&&!hip&&(GRIPS[ua]||UGLS[ua])) wpn.children.forEach(c=>{ if(c.userData&&c.userData.acc===ua) uo=c; });
    const lbox=o=>{ wpn.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(wpn.matrixWorld).invert(), bb=new THREE.Box3(); o.traverse(z=>{ if(z.isMesh&&z.visible){ z.geometry.computeBoundingBox(); bb.union(z.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,z.matrixWorld))); } }); return bb.isEmpty()?null:bb; };
    const ub=uo?lbox(uo):null; if(!ub) uo=null;
    const lh=LH[wi.v.id]||LH[wi.w.id], grip=!!(uo&&GRIPS[ua]);
    let mz=m.muz; if(mz==null){ const bb=lbox(wpn.children[0]); mz=bb?bb.max.z:gp[0]+0.5; }
    /* punto de apoyo deseado (unidades del modelo, z hacia la boca): AFG = la empuñadura; lanzagranadas = su cuerpo; si no, guardamanos */
    let zT; if(uo) zT=grip?(ub.min.z+ub.max.z)/2:(ub.min.z*0.4+ub.max.z*0.6); else if(lh) zT=lh[0]; else zT=gp[0]+(HF[wi.v.id]||HF[wi.w.id]||0.42)*(mz-gp[0]);
    const zMin=gp[0]+0.1, BAND=0.145;
    const U=B('L_Upperarm'), F=B('L_Forearm'), H=B('L_Hand'), C=B('L_Clavicle'); const reach=()=>wp(F).distanceTo(wp(U))+wp(H).distanceTo(wp(F));
    let R=null, MW=null, ex=null, ey=null, ez=null; const bq=()=>body.getWorldQuaternion(new THREE.Quaternion());
    const bpc=bip&&bip.userData.c; const place=(yaw)=>{ R=basis(axis(yaw,AIM()?((PRN&&bpc&&bpc.pitch)||-1):(hip?RP.hipPitch:RP.pitch))); const q=new THREE.Quaternion().setFromRotationMatrix(R); wpn.quaternion.copy(q);
      ex=new THREE.Vector3().setFromMatrixColumn(R,0); ey=new THREE.Vector3().setFromMatrixColumn(R,1); ez=new THREE.Vector3().setFromMatrixColumn(R,2);
      const SH=(hip?SHH0:SH0).clone().add(AIM()?new THREE.Vector3(0.01,0.035,0):new THREE.Vector3()).applyMatrix4(chestM()); wpn.position.copy(SH).sub(new THREE.Vector3(0,sb[1],sb[0]).multiplyScalar(k).applyQuaternion(q)); wpn.updateMatrixWorld(true); body.updateMatrixWorld(true);
      if(AIM()&&EYE){ /* apuntando: el arma sube hasta que la línea de mira pasa 2 cm bajo el ojo y se acerca a él de lado (culata más alta en el hombro, hacia dentro) */
        const oid=st.arma&&st.arma.on&&st.arma.on.optic; let oo=null; if(oid) wpn.children.forEach(c=>{ if(c.userData&&c.userData.acc===oid) oo=c; }); const ob=oo?lbox(oo):null; const sy=ob?(ob.min.y+ob.max.y)/2:bore+0.062/k;
        const E=body.worldToLocal(wp(EYE)), a=new THREE.Vector3(0,sy,gp[0]).multiplyScalar(k).applyQuaternion(q).add(wpn.position), d=new THREE.Vector3(0,0,1).applyQuaternion(q); const cp=a.clone().addScaledVector(d,E.clone().sub(a).dot(d));
        const dy=THREE.MathUtils.clamp(E.y-0.02-cp.y,0,PRN?0.07:0.1), dx=THREE.MathUtils.clamp((E.x-cp.x)*0.6,-0.05,0.05); wpn.position.add(new THREE.Vector3(dx,dy,0)); wpn.updateMatrixWorld(true); body.updateMatrixWorld(true); }
      MW=new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale); };
    /* muñeca respecto al punto de contacto: por debajo (guardamanos), detrás (AFG) o por encima (al asalto) */
    const OFFW=()=>hip?ex.clone().multiplyScalar(0.035).addScaledVector(ey,0.05).addScaledVector(ez,-0.035):grip?ex.clone().multiplyScalar(0.03).addScaledVector(ey,-0.01).addScaledVector(ez,-0.055):ex.clone().multiplyScalar(0.03).addScaledVector(ey,-0.05).addScaledVector(ez,-0.035);
    const skipB=h=>{ let p=h.object; while(p){ if(p.name==='mat_beams') return false; p=p.parent; } return h.object.visible; };
    const contact=s=>{ if(grip) return new THREE.Vector3(0,(ub.min.y+ub.max.y)/2,s).applyMatrix4(MW);
      if(lh&&!uo&&!hip&&Math.abs(s-lh[0])<1e-6) return new THREE.Vector3(0,lh[1],s).applyMatrix4(MW);
      const o=new THREE.Vector3(0,hip?bore+0.6:yLow-(uo?0.2:0),s).applyMatrix4(MW); ray.set(body.localToWorld(o.clone()),(hip?ey.clone().negate():ey.clone()).applyQuaternion(bq())); ray.far=2;
      const hs=ray.intersectObject(uo||wpn,true).filter(skipB); if(!hs.length) return null;
      const yl=wpn.worldToLocal(hs[0].point.clone()).y; if(!uo&&(hip?(yl<bore-0.03||yl>bore+0.16):(yl<bore-BAND||yl>bore+0.01))) return null; return body.worldToLocal(hs[0].point.clone()); };
    const dist=c=>body.localToWorld(c.clone().add(OFFW())).distanceTo(wp(U));
    const protract=c=>{ if(!C||!U||!c) return; const tW=body.localToWorld(c.clone().add(OFFW())); if(tW.distanceTo(wp(U))>reach()*0.9){ const pc=wp(C), pu=wp(U), L0=pu.distanceTo(pc); const a1=pu.clone().sub(pc).normalize(), a2=tW.clone().sub(pc).normalize(); aim(C,pu,pc.clone().add(a1.multiplyScalar(0.45).add(a2.multiplyScalar(0.55)).normalize().multiplyScalar(L0))); } };
    const setup=(tw,yaw)=>{ base(); torso(tw,PRN?0:(hip?RP.hipLean:RP.lean)); if(PRN) headLook(new THREE.Vector3(0,-0.12,1)); place(yaw); protract(contact(zT)); };
    const search=(z0,z1)=>{ const rr=reach()*0.985; for(let z=z0; z>=z1-1e-6; z-=0.01){ const c=contact(z); if(c&&dist(c)<=rr) return {z,c}; } return null; };
    let best=null, bestD=9;
    if(PRN){ /* tumbado: el arma apunta al frente; el pecho sube lo justo para que el arma (cargador incluido) quede a unos cm del suelo */
      const s=holder.scale.x||1; for(let it=0;it<10;it++){ setup(0,0); const wy=objLow(wpnBody()); const need=PR.clear/s-wy;
        const Gp=new THREE.Vector3(0,gp[1],gp[0]).applyMatrix4(MW), tR=Gp.addScaledVector(ez,-0.045).addScaledVector(ey,0.035).addScaledVector(ex,-0.02), eR=elbowMin('R',tR);
        if(need>0.004&&PRR<44){ PRR=Math.min(44,PRR+need*120); proneHip(); continue; }
        if(eR>PR.ey+0.06&&PRR>13&&need<-0.01){ PRR=Math.max(13,PRR-Math.min(4,(eR-PR.ey-0.055)*60)); proneHip(); continue; } break; } /* y bajo lo justo para que el codo derecho apoye en el suelo */
      best={tw:0,yaw:0,z:null}; }
    for(let rel=RP.relMin; !PRN&&rel<=RP.relMax; rel+=2){ const tw=Math.min(rel*0.5,RP.twMax), yaw=rel-tw; setup(tw,yaw);
      const f=search(zT,Math.max(zMin,zT-0.16)); let d0=9; if(!f&&(!best||best.z==null)){ const c0=contact(zT); if(c0) d0=dist(c0); }
      if(f&&(!best||best.z==null||f.z>best.z+0.005)) best={tw,yaw,z:f.z}; if(!best||best.z==null){ if(d0<bestD){ bestD=d0; best={tw,yaw,z:null}; } }
      if(f&&f.z>=zT-(grip?0.012:0.04)) break; }
    setup(best.tw,best.yaw);
    /* cabeza: mira hacia donde apunta el arma; al hombro, algo inclinada hacia la culata (mejilla cerca del guardamanos de culata) */
    const hy=(best.tw+best.yaw)*D2R; rotBody(B('NeckTwist01'),AY,hy*0.45); rotBody(B('Head'),AY,hy*0.55);
    const hd=new THREE.Vector3(Math.sin(best.yaw*D2R),0,Math.cos(best.yaw*D2R)), lat=new THREE.Vector3(Math.cos(best.yaw*D2R),0,-Math.sin(best.yaw*D2R));
    if(AIM()){ /* apuntando: mejilla en la culata; el ojo derecho busca la línea de mira (óptica montada o alza de hierro) */
      if(!PRN){ NK.forEach(b=>b.quaternion.copy(body.userData.rest[b.name])); body.updateMatrixWorld(true); }
      const oid=st.arma&&st.arma.on&&st.arma.on.optic; let oo=null; if(oid) wpn.children.forEach(c=>{ if(c.userData&&c.userData.acc===oid) oo=c; });
      const obb=oo?lbox(oo):null; const sy=obb?(obb.min.y+obb.max.y)/2:bore+0.062/k;
      const a0=body.localToWorld(new THREE.Vector3(0,sy,gp[0]).applyMatrix4(MW)), dW=body.localToWorld(new THREE.Vector3(0,sy,gp[0]+1).applyMatrix4(MW)).sub(a0).normalize();
      const res=headSolve(a0,dW,best.yaw*D2R,best.tw+best.yaw);
      /* lo que quede (≤ 4 cm) se corrige moviendo el arma hasta el ojo */
      const e=wp(EYE), v=e.clone().sub(a0); const cp=a0.clone().addScaledVector(dW,v.dot(dW)); const dl=body.worldToLocal(e.clone()).sub(body.worldToLocal(cp)); if(dl.length()>0.04) dl.setLength(0.04);
      wpn.position.add(dl); wpn.updateMatrixWorld(true); MW=new THREE.Matrix4().compose(wpn.position,wpn.quaternion,wpn.scale); DBGH.eye=+res.toFixed(3); }
    else if(!hip){ rotBody(B('Head'),lat,11*D2R); rotBody(B('Head'),hd,9*D2R); } else rotBody(B('Head'),lat,6*D2R);
    const G=new THREE.Vector3(0,gp[1],gp[0]).applyMatrix4(MW);
    { const tR=G.clone().addScaledVector(ez,-0.045).addScaledVector(ey,0.035).addScaledVector(ex,-0.02); if(PRN){ const Cl=B('R_Clavicle'); for(let k=0;k<10&&Cl&&elbowMin('R',tR)>PR.ey;k++){ rotBody(Cl,PRF(),2.5*D2R); body.updateMatrixWorld(true); } ikG('R',tR,PR.ey,PRL().negate()); } else ik('R',tR,hip?new THREE.Vector3(-0.6,-0.2,-1):new THREE.Vector3(-1,-0.35,-0.25)); } handTo('R',ey.clone().multiplyScalar(-0.6).addScaledVector(ez,0.3)); handRoll('R',ex.clone());
    let fz=search(zT,grip?Math.max(zMin,ub.min.z+0.025):zMin); let Hl=fz?fz.c:null;
    if(!Hl&&grip) Hl=contact(Math.max(ub.min.z+0.012,Math.min(zT,best.z!=null?best.z:zT))); /* empuñadura: la mano en su parte trasera si el brazo no da para más */
    if(!Hl){ for(let z=zT; z>=zMin-1e-6; z-=0.01){ const c=contact(z); if(c){ Hl=c; break; } } }
    if(!Hl) Hl=new THREE.Vector3(0,bore-0.05,zMin).applyMatrix4(MW);
    let stH=false; if(PRN&&bip){ const zS=sb[0]+0.16; ray.set(body.localToWorld(new THREE.Vector3(0,bore-0.6,zS).applyMatrix4(MW)),ey.clone().applyQuaternion(bq())); ray.far=2; /* por debajo de la culata */ const hs=ray.intersectObject(wpn,true).filter(h=>{ let p=h.object; while(p){ if(p.name==='mat_bipod'||p.name==='mat_beams') return false; p=p.parent; } return true; }); if(hs.length){ Hl=body.worldToLocal(hs[0].point.clone()); stH=true; } } /* ametralladora sobre bípode: la mano izquierda bajo la culata, apretándola contra el hombro, con el codo en el suelo */
    if(PRN&&Hl&&!grip&&!stH){ const z0=wpn.worldToLocal(body.localToWorld(Hl.clone())).z; for(let z=z0; z>=zMin-1e-6; z-=0.01){ const c=contact(z); if(!c) continue; Hl=c; if(elbowMin('L',c.clone().add(OFFW()))<=PR.ey+0.045) break; } } /* tumbado: la mano de apoyo retrocede por el guardamanos hasta que el codo izquierdo apoya en el suelo */
    DBGH.t=Hl.clone(); DBGH.g=G.clone(); DBGH.p={po:PO,bip:DBGH.bip,eye:DBGH.eye,tw:best.tw,yaw:best.yaw,zT:+zT.toFixed(3),z:+wpn.worldToLocal(body.localToWorld(Hl.clone())).z.toFixed(3),ua:uo?ua:null,hip,ok:!!fz};
    const OFFS=()=>ex.clone().multiplyScalar(0.02).addScaledVector(ey,-0.042).addScaledVector(ez,-0.02);
    if(PRN){ const tL=Hl.clone().add(stH?OFFS():OFFW()), Cl=B('L_Clavicle'); for(let k=0;k<6&&Cl&&elbowMin('L',tL)>PR.ey;k++){ rotBody(Cl,PRF(),-2.5*D2R); body.updateMatrixWorld(true); } ikG('L',tL,PR.ey,PRL().negate()); } else ik('L',Hl.clone().add(OFFW()),hip?new THREE.Vector3(0.6,-0.3,-0.6):grip?new THREE.Vector3(0.5,-0.85,-0.1):new THREE.Vector3(0.55,-0.8,-0.15));
    if(stH){ handTo('L',ex.clone().multiplyScalar(-0.75).addScaledVector(ey,0.25).addScaledVector(ez,0.35)); handRoll('L',ey.clone()); } /* palma hacia arriba, sujetando la culata por debajo */
    else if(hip){ handTo('L',ex.clone().multiplyScalar(-0.6).addScaledVector(ey,-0.5).addScaledVector(ez,0.45)); handRoll('L',ey.clone().negate()); }
    else if(grip){ handTo('L',ex.clone().multiplyScalar(-0.85).addScaledVector(ez,0.35).addScaledVector(ey,0.1)); handRoll('L',ez.clone()); }
    else { handTo('L',ex.clone().multiplyScalar(-0.55).addScaledVector(ey,0.55).addScaledVector(ez,0.45)); handRoll('L',ey.clone().addScaledVector(ex,-0.3)); }
    if(bip){ if(PRN) DBGH.p.bip=bipodGround(); else bipodSet(0,null); }
    if(PRN){ const s_=lowY(2); [['R',2],['L',1]].forEach(([sd,gi])=>{ if(s_[gi]<-0.006){ const H_=B(sd+'_Hand'), F_=B(sd+'_Forearm'), U_=B(sd+'_Upperarm'); const sv=[U_,F_,H_].map(b=>b.quaternion.clone()); const t=lp(sd+'_Hand');
      const hq=relQ(H_); ikG(sd,t,PR.ey-s_[gi]+0.002,PRL().negate()); H_.quaternion.copy(relQ(H_.parent).invert().multiply(hq)); H_.updateMatrixWorld(true); /* la mano conserva su orientación */ } }); }
    if(PRN){ /* codos apoyados: si un brazo queda en el aire (ametralladoras, AK), baja el codo y, si hace falta, el hombro, sin mover la mano */
      [['R',2],['L',1]].forEach(([sd,gi])=>{ const H_=B(sd+'_Hand'), Cl=B(sd+'_Clavicle'); const t=lp(sd+'_Hand'), hq=relQ(H_); let lo=lowY(3)[gi]; window.MAT_EL=window.MAT_EL||{}; window.MAT_EL[sd]=[+lo.toFixed(3)];
        for(let k=0;k<16&&lo>0.012;k++){ const e0=lp(sd+'_Forearm').y; ikG(sd,t,e0-(lo-0.006),PRL().negate()); H_.quaternion.copy(relQ(H_.parent).invert().multiply(hq)); H_.updateMatrixWorld(true); body.updateMatrixWorld(true); const l2=lowY(3)[gi];
          if(l2>lo-0.003&&Cl){ /* el brazo no baja más: prueba a bajar o adelantar el hombro y se queda con lo que más acerque el codo al suelo */
            const arm=[Cl,B(sd+'_Upperarm'),B(sd+'_Forearm'),H_], sv=arm.map(b=>b.quaternion.clone()); let bestL=l2, bestQ=sv; const sg=sd==='L'?-1:1;
            [[PRF(),sg*4],[PRL(),3],[PRL(),-3]].forEach(([ax,a])=>{ arm.forEach((b,i)=>b.quaternion.copy(sv[i])); body.updateMatrixWorld(true); rotBody(Cl,ax,a*D2R); body.updateMatrixWorld(true); ikG(sd,t,lp(sd+'_Forearm').y-0.02,PRL().negate()); H_.quaternion.copy(relQ(H_.parent).invert().multiply(hq)); H_.updateMatrixWorld(true); body.updateMatrixWorld(true); const l3=lowY(3)[gi]; if(l3<bestL-0.001&&l3>-0.006){ bestL=l3; bestQ=arm.map(b=>b.quaternion.clone()); } });
            arm.forEach((b,i)=>b.quaternion.copy(bestQ[i])); body.updateMatrixWorld(true); if(bestL>=l2-0.001){ lo=l2; break; } lo=bestL; } else lo=l2; window.MAT_EL[sd].push(+lo.toFixed(3)); }
        if(lo<-0.006){ ikG(sd,t,lp(sd+'_Forearm').y-lo+0.004,PRL().negate()); H_.quaternion.copy(relQ(H_.parent).invert().multiply(hq)); H_.updateMatrixWorld(true); } }); }
    follow(); /* postura perfilada: los pies giran con el cuerpo para que el arma apunte al frente (apuntando: exactamente al frente) */ body.rotation.y=-best.yaw*(AIM()?1:0.75)*D2R; body.updateMatrixWorld(true); }
  async function setWeapon(){ stopAnim(); const b=st.arma; const key=b?JSON.stringify([b.id,b.v||0,b.on||{}]):''; if(key===wkey) return; wkey=key;
    if(wpn){ body.remove(wpn); wpn=null; wi=null; } if(bc){ bc.dispose(); bc=null; } beamUI(); if(FK){ FK.dispose(); FK=null; } fireUI(); if(!b){ pose(); rebuildGear(); skinBounds(); V.recenter(); return; }
    try{ const r=await M.buildWeapon(b,UW,UA); if(key!==wkey) return; const o=r.o; o.userData.gp=GRIP[r.v.id]||GRIP[r.w.id]||(r.w.cat==='pistol'?GRIP_PISTOL:[0,0]); { const bb=new THREE.Box3().setFromObject(o); const m=M.mt(r.v)||{}; o.userData.bmin=bb.min.y; o.userData.stock=[bb.min.z+0.01,(m.sty!=null?m.sty:(m.bore!=null?m.bore-0.02:(bb.min.y+bb.max.y)/2))]; } o.traverse(q=>{ if(q.isMesh) q.castShadow=true; });
      wpn=o; wi=r; body.add(o); BT=PO==='tumbado'?1:0; bipodBuild(); pose(); rebuildGear(); skinBounds(); V.recenter(); credits(r); fireSetup(r);
      if(M.beamCtl){ bc=M.beamCtl(o,o.children.filter(c=>c.userData&&c.userData.acc).map(c=>({a:c.userData.acc,o:c}))); if(!bc.has()) bc=null; } beamUI(); }catch(e){ console.warn('soldado arma',e); }
  }
  function credits(r){ if(!opt.cred) return; const w=r?r.w:null; opt.cred.innerHTML=L('Figura: «','Figure: “')+'<a href="https://sketchfab.com/3d-models/soldier-full-tactical-gear-lowpolygameready-850593a8c7114c188395ba1849a66eb9" target="_blank" rel="noopener">Soldier Full Tactical Gear</a>'+L('» de ','” by ')+'<a href="https://sketchfab.com/1799danly" target="_blank" rel="noopener">DanlyVostok</a> (Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>); '+L('visor nocturno «','night vision “')+'<a href="https://sketchfab.com/3d-models/anpvs-14-nvd-ed14bb49bdf94cd7b572daf206f1ccfb" target="_blank" rel="noopener">AN/PVS-14 NVD</a>'+L('» de knolp (CC BY 4.0). M.A.T ha optimizado los modelos, recolocado los brazos para sujetar el arma y añadido los camuflajes.','” by knolp (CC BY 4.0). M.A.T optimized the models, re-posed the arms to hold the weapon and added the camouflages.')+' <b>'+L('Mochilas, cantimploras, pala y lanzador: modelo aproximado hecho por MAT a partir de medidas oficiales','Packs, canteens, shovel and launcher: approximate model made by MAT from official dimensions')+'</b>.'+(w?' '+L('Arma: modelo del Armero 3D','Weapon: 3D Gunsmith model')+' (<a href="#/armero/'+w.id+'">'+w.n+'</a>), '+L('a escala real','at real scale')+'.':'')+(bip?' <b>'+L('Bípode: modelo aproximado hecho por MAT a partir de medidas oficiales','Bipod: approximate model made by MAT from official dimensions')+'</b> '+L('(el modelo 3D del arma no lo trae; patas telescópicas que bajan hasta quedar verticales según el manual del M249 TM 9-1005-201-10; anchura sobre bípode del FN MAG/M240: 408 mm según FN Herstal; la longitud de las patas se ajusta al suelo).','(the weapon’s 3D model has none; telescopic legs that swing down to vertical per the M249 manual TM 9-1005-201-10; FN MAG/M240 width on bipod: 408 mm per FN Herstal; leg length is adjusted to the ground).'):'')+' <a href="#/license">'+L('Licencias','Licences')+'</a>'; }
  const has=id=>(st.q[id]||0)>0, anyOf=c=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].c===c), visTag=t=>Object.keys(st.q).some(k=>st.q[k]>0&&D.items[k]&&D.items[k].vis===t);
  const ray=new THREE.Raycaster();
  function hitF(objs,o,d,ok){ body.updateMatrixWorld(true); objs.forEach(m=>{ if(m&&m.isSkinnedMesh&&m.skeleton) m.skeleton.update(); }); ray.set(body.localToWorld(o.clone()),d.clone().transformDirection(body.matrixWorld)); ray.far=3; for(const h of ray.intersectObjects(objs.filter(Boolean),false)){ const p=body.worldToLocal(h.point.clone()); if(ok(p)) return p; } return null; }
  function hit(objs,o,d){ body.updateMatrixWorld(true); objs.forEach(m=>{ if(m&&m.isSkinnedMesh&&m.skeleton) m.skeleton.update(); }); /* las mallas con piel se prueban con la postura actual de los huesos, no con la del último fotograma */ ray.set(body.localToWorld(o.clone()),d.clone().transformDirection(body.matrixWorld)); /* la dirección también en el marco del cuerpo (gira en la postura perfilada) */ ray.far=3; const h=ray.intersectObjects(objs.filter(Boolean),false)[0]; return h?body.worldToLocal(h.point.clone()):null; }
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
  function ruckMesh(noFP){ /* mochila grande (~80-100 L): cuerpo acolchado, tapa con cremallera, bolsillo frontal con cremallera en U, bolsillos laterales MOLLE, ribetes en las aristas, cinchas de compresión con hebillas y asa — forma aproximada de M.A.T */
    const G=new THREE.Group(), W=0.38, Hh=0.58, Dd=0.27, V3=THREE.Vector3;
    const body=soft(W,Hh,Dd,0.06,gmM,{bulge:0.04,taper:0.05}); body.position.set(0,0,-Dd/2); G.add(body); /* cuerpo con cintas MOLLE en frente y lados, como las mochilas MOLLE reales */
    [0.12,-0.13].forEach(y=>{ const sm=rbox(W+0.004,0.006,Dd-0.02,gmS); sm.position.set(0,y,-Dd/2); G.add(sm); }); /* costuras horizontales */
    const pad=soft(W-0.04,Hh-0.05,0.05,0.022,gmS,{bulge:0.01}); pad.position.set(0,-0.005,-0.012); G.add(pad);
    for(let k=0;k<4;k++){ const q=rbox(W-0.08,0.008,0.012,gmB); q.position.set(0,-0.2+k*0.12,0.012); G.add(q); } /* acolchado del panel de espalda */
    const zip=(x0,y0,x1,y1,z,G2)=>{ const L=Math.hypot(x1-x0,y1-y0), t=rbox(L,0.007,0.005,gmB); t.position.set((x0+x1)/2,(y0+y1)/2,z); t.rotation.z=Math.atan2(y1-y0,x1-x0); (G2||G).add(t); };
    const pull=(x,y,z)=>{ const p=rbox(0.011,0.03,0.004,gmB); p.position.set(x,y-0.016,z-0.002); G.add(p); const rg=new THREE.Mesh(new THREE.TorusGeometry(0.006,0.0016,5,10),gmB); rg.position.set(x,y-0.035,z-0.002); G.add(rg); };
    /* ribetes: cordón oscuro en las cuatro aristas verticales */
    [-1,1].forEach(s=>[-0.03,-Dd+0.03].forEach(z=>{ const c=cyl(0.0055,Hh-0.1,gmS,8); c.position.set(s*(W/2-0.012),0,z); G.add(c); }));
    /* tapa abombada con cremallera perimetral y tirador */
    const lid=soft(W*0.98,0.12,Dd+0.05,0.05,gmP,{dome:0.03,bulge:0.02}); lid.position.set(0,Hh/2+0.03,-Dd/2-0.022); lid.rotation.x=-0.08; G.add(lid);
    { const zl=rbox(W*0.86,0.009,0.008,gmB); zl.position.set(0,Hh/2+0.005,-Dd-0.064); zl.rotation.x=-0.08; G.add(zl); pull(W*0.3,Hh/2+0.005,-Dd-0.066); }
    const h=new THREE.Mesh(new THREE.TorusGeometry(0.035,0.008,6,14,Math.PI),gmS); h.position.set(0,Hh/2+0.09,-0.03); G.add(h);
    /* cinchas de la tapa (verticales) con hebilla */
    [-1,1].forEach(s=>{ const v=rbox(0.026,0.22,0.006,gmS); v.position.set(s*0.1,Hh/2-0.08,-Dd-0.046); v.rotation.x=0.12; G.add(v); G.add(buckle(s*0.1,Hh/2-0.17,-Dd-0.058)); });
    /* bolsillos laterales de sostenimiento (MOLLE) con cremallera arriba y cincha de compresión */
    [-1,1].forEach(s=>{ const pk=soft(0.1,0.32,0.17,0.04,gmM,{bulge:0.014}); pk.rotation.y=s*Math.PI/2; pk.position.set(s*(W/2+0.04),-0.08,-Dd/2-0.005); G.add(pk);
      const zt=rbox(0.006,0.007,0.13,gmB); zt.position.set(s*(W/2+0.04),0.085,-Dd/2-0.005); G.add(zt);
      const cs=rbox(0.008,0.026,0.19,gmS); cs.position.set(s*(W/2+0.092),0.0,-Dd/2-0.005); G.add(cs); G.add(buckle(s*(W/2+0.096),0.0,-Dd/2-0.07)); });
    /* cintas «daisy chain» verticales en el frente, con presillas */
    [-1,1].forEach(s=>{ const dz=rbox(0.022,Hh-0.14,0.005,gmS); dz.position.set(s*0.145,0.0,-Dd-0.012); G.add(dz); for(let k=0;k<6;k++){ const t=rbox(0.026,0.006,0.008,gmB); t.position.set(s*0.145,-0.2+k*0.08,-Dd-0.016); G.add(t); } });
    if(!noFP){ const fp=soft(0.27,0.27,0.08,0.035,gmM,{bulge:0.012}); fp.position.set(0,-0.1,-Dd-0.04); G.add(fp);
      const zf=-Dd-0.082; zip(-0.115,-0.21,-0.115,0.02,zf); zip(0.115,-0.21,0.115,0.02,zf); zip(-0.115,0.02,0.115,0.02,zf); pull(0.06,0.02,zf);
      /* cinchas de compresión horizontales sobre el frente, con hebilla */
      [[0.19,-Dd-0.006,W+0.012],[-0.12,-Dd-0.086,0.29]].forEach(([y,z,w])=>{ const c=rbox(w,0.025,0.006,gmS); c.position.set(0,y,z); G.add(c); G.add(buckle(0.05,y,z-0.009)); }); }
    G.userData.depth=Dd+(noFP?0.02:0.085); G.userData.h=Hh; return G; }
  /* mochila de asalto: cuerpo de tapa redondeada, panel MOLLE frontal y asa */
  function apMesh(thin){ /* mochila de asalto (~30-35 L): cuerpo acolchado con tapa redondeada, cremallera en arco con tiradores, panel frontal MOLLE, ribetes, cinchas laterales con hebilla, asa y panel de espalda acolchado — forma aproximada de M.A.T */
    const G=new THREE.Group(), W=0.32, Hh=0.46, Dd=typeof thin==='number'?thin:(thin?0.15:0.2); /* tumbado: comprimida y plana (12 cm) */
    const body=soft(W,Hh,Dd,0.055,gmP,{bulge:0.03,dome:0.04,taper:0.05}); body.position.set(0,0,-Dd/2); G.add(body);
    const pad=soft(W-0.04,Hh-0.06,0.04,0.016,gmS,{bulge:0.008}); pad.position.set(0,-0.01,-0.008); G.add(pad);
    for(let k=0;k<3;k++){ const q=rbox(W-0.08,0.008,0.01,gmB); q.position.set(0,-0.13+k*0.12,0.013); G.add(q); }
    [-1,1].forEach(s=>[-0.03,-Dd+0.03].forEach(z=>{ const c=cyl(0.005,Hh-0.12,gmS,8); c.position.set(s*(W/2-0.012),-0.02,z); G.add(c); }));
    const pan=soft(0.24,0.26,0.035,0.015,gmM,{bulge:0.006}); pan.position.set(0,-0.06,-Dd-0.015); G.add(pan);
    /* cremallera en arco de la tapa (dos tramos y la curva superior) con dos tiradores */
    const zz=-Dd-0.004; const arc=[]; for(let k=0;k<=10;k++){ const t=Math.PI*k/10; arc.push(new THREE.Vector3(Math.cos(t)*(W/2-0.035),Hh/2-0.075+Math.sin(t)*0.055,zz)); }
    const zl=strap([new THREE.Vector3(W/2-0.035,-0.02,zz)].concat(arc).concat([new THREE.Vector3(-(W/2-0.035),-0.02,zz)]),0.009,0.004,gmB,q=>new THREE.Vector3(q.x,q.y,q.z+1)); G.add(zl);
    [[-1,0.12],[1,0.12]].forEach(([s,y])=>{ const p=rbox(0.011,0.03,0.004,gmB); p.position.set(s*(W/2-0.035),y,zz-0.006); G.add(p); const rg=new THREE.Mesh(new THREE.TorusGeometry(0.006,0.0016,5,10),gmB); rg.position.set(s*(W/2-0.035),y-0.02,zz-0.006); G.add(rg); });
    const h=new THREE.Mesh(new THREE.TorusGeometry(0.032,0.008,6,12,Math.PI),gmS); h.position.set(0,Hh/2+0.035,-0.03); G.add(h);
    [-1,1].forEach(s=>[0.08,-0.12].forEach(y=>{ const cs=rbox(0.008,0.024,Dd*0.85,gmS); cs.position.set(s*(W/2+0.003),y,-Dd/2); G.add(cs); G.add(buckle(s*(W/2+0.006),y,-Dd*0.75)); }));
    G.userData.depth=Dd+0.03; G.userData.h=Hh; return G; }
  function rebuildGear(){ PACKDY=null; gearG.clear(); gearH.clear(); gearC.clear();
    /* el equipo se construye con el torso en reposo y después sigue al pecho (follow) */
    const svq={}; Object.values(bones).forEach(b=>{ svq[b.name]=b.quaternion.clone(); const r=body.userData.rest[b.name]; if(r) b.quaternion.copy(r); }); const svh=HB?HB.position.clone():null; if(HB&&HIP0) HB.position.copy(HIP0); body.updateMatrixWorld(true); /* todo el esqueleto en reposo (también cadera y piernas: rodilla y tumbado) */
    gearG.position.set(0,0,0); gearG.quaternion.identity(); gearG.scale.set(1,1,1); gearC.position.set(0,0,0); gearC.quaternion.identity(); gearC.scale.set(1,1,1); body.updateMatrixWorld(true);
    const vest=anyOf('vest')||Object.keys(st.q).some(k=>D.items[k]&&D.items[k].c==='plate'&&st.q[k]>0);
    vestMeshes.forEach(m=>m.visible=vest&&(st.pc!=='slick'||m.name==='plate_1')); /* portaplacas ligero tipo JPC: sin las bolsas del pecho */ BF0=backFrame();
    const hel=anyOf('helmet'); ['helmet1','helmet1_2'].forEach(n=>{ if(mesh[n]) mesh[n].visible=hel; });
    if(mesh.sunglusses_glus) mesh.sunglusses_glus.visible=true; /* gafas balísticas siempre: con el visor nocturno levantado se siguen llevando */
    const torso=[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1];
    const backZ=y=>{ const p=hit(torso,new THREE.Vector3(0,y,-1),new THREE.Vector3(0,0,1)); return p?p.z:-0.24; };
    const ruck=has('ruck')&&PO!=='tumbado', ap=has('apack'); /* tumbado: la mochila grande se deja en el suelo (no se lleva puesta); la de asalto sí */
    const tor=()=>[mesh.plate_1&&mesh.plate_1.visible?mesh.plate_1:null,mesh.kitel_1].concat(vestMeshes.filter(m=>m.visible));
    function straps(top,bot,zb,w,t){ const T=tor(), V3=THREE.Vector3, ctr=q=>new V3(0,Math.min(q.y,1.36),-0.04);
      [-1,1].forEach(s=>{ const tp=hit(T,new V3(s*0.1,2.2,-0.04),new V3(0,-1,0)); const sy=tp?tp.y:1.46;
        const fz=y=>{ const p=hitF(T,new V3(s*0.11,y,1),new V3(0,0,-1),q=>q.z<0.2); return p?p.z:0.13; }, bz=y=>{ const p=hit(T,new V3(s*0.1,y,-1),new V3(0,0,1)); return p?p.z:-0.15; }, sx=y=>{ const p=hitF(T,new V3(s,y,-0.04),new V3(-s,0,0),q=>Math.abs(q.x)<0.24); return p?p.x:s*0.19; }; /* hitF ignora el brazo que cruza por delante del pecho */
        const pts=[new V3(s*0.085,top-0.05,zb-0.012), new V3(s*0.095,sy-0.035,bz(sy-0.035)-t), new V3(s*0.1,sy+t*0.6,-0.035), new V3(s*0.105,sy-0.07,fz(sy-0.07)+t), new V3(s*0.11,1.30,fz(1.30)+t), new V3(s*0.125,1.17,fz(1.17)+t*0.8),
          new V3(sx(1.08)+s*0.012,1.08,-0.03), new V3(s*0.15,bot+0.07,zb-0.012)];
        gearC.add(strap(pts.slice(0,6),w,t,gmT,ctr)); gearC.add(strap(pts.slice(5),w*0.45,t*0.6,gmT,ctr)); const b=buckle(0,0,0); b.position.copy(pts[5]); b.lookAt(pts[5].clone().add(new V3(0,0,1))); gearC.add(b); }); }
    let rD=0.22; if(ruck){ const zb=backZ(1.22); const rp=null, r=ruckMesh(ap); rD=r.userData.depth; const ry=1.41-r.userData.h/2; r.position.set(-0.01,ry,zb+0.014); r.rotation.x=0.07; /* la parte alta se apoya en los omóplatos, como con los tensores de carga */ gearG.add(r); straps(1.43,0.91,zb,0.062,0.013);
      if(has('sbag')||has('pad')){ /* esterilla/saco enrollado: hijo de la mochila (sigue su inclinación), metido contra la base y sujeto con dos cinchas de compresión con hebilla — mismo tono que la mochila */
        if(!gmRE){ const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d'); x.strokeStyle='rgba(12,13,9,.6)'; x.lineWidth=2.2; x.beginPath(); for(let t=0;t<7.5*Math.PI*2;t+=0.08){ const rr_=4+t*2.6; x.lineTo(64+Math.cos(t)*rr_,64+Math.sin(t)*rr_); } x.stroke(); /* espiral del rollo */
          const tx=new THREE.CanvasTexture(c); tx.colorSpace=THREE.SRGBColorSpace; gmRE=new THREE.MeshStandardMaterial({map:tx,roughness:0.95,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}); }
        const Hh=r.userData.h, Dd=0.27, rr=0.075, yb=-Hh/2-rr+0.032, zc=-Dd/2+0.006;
        const sb=new THREE.Mesh(new THREE.CylinderGeometry(rr,rr,0.42,22,1),gmP); sb.castShadow=true; sb.receiveShadow=true; sb.rotation.z=Math.PI/2; sb.position.set(0,yb,zc); r.add(sb);
        [-1,1].forEach(s=>{ const ec=new THREE.Mesh(new THREE.CircleGeometry(rr*0.99,22),gmP); ec.rotation.y=s*Math.PI/2; ec.position.set(s*0.2102,yb,zc); r.add(ec); const sp=new THREE.Mesh(new THREE.CircleGeometry(rr*0.97,22),gmRE); sp.rotation.y=s*Math.PI/2; sp.position.set(s*0.2112,yb,zc); r.add(sp); /* tapas del rollo */
          const band=new THREE.Mesh(new THREE.CylinderGeometry(rr+0.004,rr+0.004,0.024,24,1,true),gmB); band.rotation.z=Math.PI/2; band.position.set(s*0.125,yb,zc); r.add(band);
          const up=rbox(0.024,0.06,0.005,gmB); up.position.set(s*0.125,yb+rr*0.55,zc-rr-0.002); up.rotation.x=-0.5; r.add(up); /* la cincha sube a la base de la mochila */
          const bk=buckle(s*0.125,yb-rr*0.2,zc-rr-0.006); bk.rotation.z=Math.PI/2; r.add(bk); }); } }
    if(ap){ const zb=backZ(1.25); const apo=null, a=apMesh(ruck?true:(PO==='tumbado'?0.12:false)); a.position.set(-0.01,ruck?1.2:1.2,ruck?zb+0.01-rD+0.004:zb+0.012); gearG.add(a); if(!ruck) straps(1.41,1.03,zb,0.05,0.011); }
    if(has('medbag')){ const zb=backZ(1.0); const mb=soft(0.36,0.26,0.18,0.05,gmP,{bulge:0.02}); mb.position.set(-0.01,ruck?0.8:1.0,zb-0.09-(ruck?0.13:0)); gearG.add(mb); }
    if(visTag('at4')){ const zb=backZ(1.25); const t=cyl(0.042,1.0,gm.d,14); t.position.set(0.04,1.28,zb-(ruck?0.27:0.06)); t.rotation.z=0.45; gearG.add(t); }
    if(has('cant')&&!ruck){ /* el cinturón del modelo ya lleva bolsas; las cantimploras van detrás, en la cadera */ for(let i=0;i<Math.min(2,st.q.cant);i++){ const s=i?1:-1; const p=hit([mesh.pants_1,mesh.pouches_1],new THREE.Vector3(s*0.12,0.97,-0.8),new THREE.Vector3(0,0,1)); if(!p) continue; const c=cyl(0.042,0.17,gm.d,14); c.position.set(s*0.12,0.95,p.z-0.04); gearH.add(c); } }
    if(has('etool')&&!ruck&&!ap){ const p=hit([mesh.pants_1,mesh.pouches_1],new THREE.Vector3(0,0.95,-0.8),new THREE.Vector3(0,0,1)); if(p){ const e=rbox(0.15,0.21,0.05,gm.d); e.position.set(0,0.93,p.z-0.03); gearH.add(e); } }
    { const bx=new THREE.Box3(); gearG.updateMatrixWorld(true); const inv=new THREE.Matrix4().copy(gearG.matrixWorld).invert(); gearG.traverse(m=>{ if(m.isMesh){ m.geometry.computeBoundingBox(); bx.union(m.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld))); } }); gearG.userData.fp=bx.isEmpty()?null:{x0:bx.min.x,x1:bx.max.x,y0:bx.min.y,y1:bx.max.y,zf:bx.max.z}; } /* huella de las mochilas en reposo: sirve para apoyarlas sobre la espalda real en cada fotograma */
    gearG.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } }); gearH.traverse(o=>{ if(o.isMesh){ o.castShadow=true; o.receiveShadow=true; } });
    Object.values(bones).forEach(b=>{ if(svq[b.name]) b.quaternion.copy(svq[b.name]); }); if(HB&&svh) HB.position.copy(svh); body.updateMatrixWorld(true); follow();
    nvg(hel&&(visTag('nvg')||visTag('nvg2')),visTag('nvg2')); }
  let NVT=0; async function nvg(on,two){ const tok=++NVT; if(pvs){ body.remove(pvs); pvs=null; } if(!on) return;
    try{ if(!PVSP) PVSP=load('m3d/soldado/pvs14.glb'); const g2=await PVSP; if(tok!==NVT) return; if(pvs){ body.remove(pvs); pvs=null; } /* una sola copia aunque se pida dos veces seguidas */ const one=()=>{ const o=g2.scene.clone(true); const bb=new THREE.Box3().setFromObject(o); const sz=bb.getSize(new THREE.Vector3()); const k=PVS_LEN/Math.max(sz.x,sz.y,sz.z); o.scale.setScalar(k); const c=bb.getCenter(new THREE.Vector3()).multiplyScalar(k); o.position.sub(c); const w=new THREE.Group(); w.add(o); return w; };
      const HMc=headM(), HMi=HMc.clone().invert(); /* el visor se coloca en el marco de la cabeza en reposo (sirve de pie, de rodillas y tumbado) */
      const fc=hit([mesh.helmet1_2],new THREE.Vector3(-0.02,1.74,1).applyMatrix4(HMc),new THREE.Vector3(0,0,-1).transformDirection(HMc)); const f=fc?fc.applyMatrix4(HMi):new THREE.Vector3(-0.02,1.74,0.16);
      const grp=new THREE.Group(); const n=two?2:1; for(let i=0;i<n;i++){ const w=one(); w.position.set(two?(i?0.034:-0.034):0.0,0,0); grp.add(w); }
      const mnt=rbox(0.05,0.03,0.025,gm.k); mnt.position.set(0,-0.005,-0.06); grp.add(mnt);
      grp.position.set(f.x-0.01,f.y+0.005,f.z+0.065); body.add(grp); pvs=grp; grp.updateMatrix(); grp.userData.hm=grp.matrix.clone(); headM().multiply(grp.userData.hm).decompose(grp.position,grp.quaternion,grp.scale); grp.traverse(q=>{ if(q.isMesh) q.castShadow=true; }); if(!ANIMON){ skinBounds(); V.recenter(); } /* durante la animación el encuadre ya está calculado para la postura final */ }catch(e){ console.warn('pvs',e); } }
  function camos(){ M.setU(UF,st.ucamo||'orig'); M.setU(UG,st.gcamo||'orig'); M.setU(UH,st.hcamo||st.gcamo||'orig'); M.setU(UGL,GLC[st.gl]||'orig'); M.setU(UW,(st.arma&&st.arma.camo)||'orig'); M.setU(UA,(st.arma&&st.arma.ca)?(st.arma.camo||'orig'):'orig'); V.redraw(); }
  function scale(){ const s=Math.max(140,Math.min(215,+st.h||175))/100/BASE_H; holder.scale.setScalar(s); body.updateMatrixWorld(true); pose(); skinBounds(); V.recenter(); }
  function camUI(){ if(!opt.cam) return; const C=M.CAMO; const row=(id,lab,cur)=>'<div class="sd-src" style="margin-top:6px"><b>'+lab+'</b></div><div class="sd-cam" data-k="'+id+'">'+C.map(c=>'<button type="button" title="'+LL(c[1])+'" aria-label="'+LL(c[1])+'" data-c="'+c[0]+'" class="'+(c[0]===(cur||'orig')?'on':'')+'" style="background:'+(c[0]==='orig'?(id==='ucamo'?'#6d6a55':'#4d5240'):M.sw(c[2]))+'"></button>').join('')+'</div>';
    const chip=(k,cur,opts)=>'<div class="sd-chips sd-cam2" data-k="'+k+'" style="margin:4px 0 2px">'+opts.map(([v,es,en,swc])=>'<button type="button" class="sd-chip'+(v===cur?' on':'')+'" data-c="'+v+'" aria-pressed="'+(v===cur)+'">'+(swc?'<i style="display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:-1px;margin-right:5px;background:'+swc+'"></i>':'')+L(es,en)+'</button>').join('')+'</div>';
    const a_=(t,u)=>'<a href="'+u+'" target="_blank" rel="noopener">'+t+'</a>';
    opt.cam.innerHTML=row('ucamo',L('Camuflaje del uniforme','Uniform camouflage'),st.ucamo)+row('gcamo',L('Camuflaje del equipo','Gear camouflage'),st.gcamo)+
      row('hcamo',L('Funda del casco','Helmet cover'),st.hcamo||st.gcamo)+'<div class="sd-src">'+L('Funda de tela sobre el casco, como las reales: la del casco ACH del Ejército de EE. UU. en camuflaje ('+a_('Wikipedia','https://en.wikipedia.org/wiki/Advanced_Combat_Helmet')+') o la Ops-Core Mesh Helmet Cover del casco FAST ('+a_('Gentex','https://shop.gentexcorp.com/ops-core-mesh-helmet-cover-fast/')+'). Los cascos auriculares no llevan funda.','Cloth cover over the helmet, like the real ones: the US Army ACH helmet cover in camouflage ('+a_('Wikipedia','https://en.wikipedia.org/wiki/Advanced_Combat_Helmet')+') or the Ops-Core Mesh Helmet Cover for the FAST helmet ('+a_('Gentex','https://shop.gentexcorp.com/ops-core-mesh-helmet-cover-fast/')+'). The headset is not covered.')+'</div>'+
      '<div class="sd-src" style="margin-top:6px"><b>'+L('Guantes','Gloves')+'</b></div>'+chip('gl',st.gl||'orig',[['orig','De serie','Stock',null],['tan','Coyote (tan)','Coyote (tan)','#7a6649'],['negro','Negro','Black','#1d1e20'],['od','Verde oliva','OD green','#485033']])+
      '<div class="sd-src">'+L('Colores reales de guantes de combate: Coyote, Black y Ranger Green del Outdoor Research Ironsight II ('+a_('fabricante','https://www.outdoorresearch.com/products/ironsight-ii-glove-322658')+').','Real combat-glove colours: Coyote, Black and Ranger Green of the Outdoor Research Ironsight II ('+a_('maker','https://www.outdoorresearch.com/products/ironsight-ii-glove-322658')+').')+'</div>'+
      '<div class="sd-src" style="margin-top:6px"><b>'+L('Portaplacas','Plate carrier')+'</b></div>'+chip('pc',st.pc||'molle',[['molle','MOLLE completo con bolsas','Full MOLLE with pouches'],['slick','Ligero tipo JPC (sin bolsas)','Light JPC-style (slick)']])+
      '<div class="sd-src">'+L('Configuraciones reales: portaplacas con MOLLE y bolsas, como el Crye AVS ('+a_('manual','https://www.cryeprecision.com/Resources/en/Manuals/CryePrecision-AVS_Manual(Web).pdf')+'), o mínimo y ligero, como el Crye JPC 2.0 ('+a_('fabricante','https://www.cryeprecision.com/JPC-2-0')+'). Modelo aproximado hecho por MAT a partir del chaleco del modelo 3D.','Real configurations: a MOLLE carrier with pouches, like the Crye AVS ('+a_('manual','https://www.cryeprecision.com/Resources/en/Manuals/CryePrecision-AVS_Manual(Web).pdf')+'), or minimal and light, like the Crye JPC 2.0 ('+a_('maker','https://www.cryeprecision.com/JPC-2-0')+'). Approximate model built by MAT from the 3D model\'s own vest.')+'</div>'+'<div class="sd-src">'+L('Patrones genéricos generados por M.A.T (sin archivos de patrones con marca). El camuflaje del arma se elige en el Armero.','Generic patterns generated by M.A.T (no trademarked pattern files). The weapon camouflage is chosen in the Gunsmith.')+'</div>'; }
  if(opt.cam) opt.cam.addEventListener('click',e=>{ const b=e.target.closest('button[data-c]'); if(!b) return; const k=b.parentNode.dataset.k; if(!k) return; st[k]=b.dataset.c; camUI(); camos(); if(k==='pc'&&!ANIMON){ rebuildGear(); if(CS) CS.dirty(); V.redraw(); } opt.save&&opt.save(); });
  const ld=stage.querySelector('.sd-load'); if(ld) ld.remove();
  /* disparo animado en el soldado (Fase 6): mismo fogonazo, retroceso y vainas que el Armero; sonido solo con grabación real del arma */
  let FK=null, FKO=null, FKM=null, FKMODE=null, FKHOLD=false, FKUP=false; const fr=document.createElement('div'); fr.className='sd-fire'; fr.style.margin='4px 0 2px';
  const FMN={semi:['Tiro a tiro','Semi'],burst:['Ráfaga','Burst'],auto:['Automático','Auto']};
  function fireUI(){ if(!fr) return; const ok=!!(FK&&wpn&&PO!=='pie'); fr.hidden=!ok; if(!ok){ fr.innerHTML=''; return; } const s=FKO.snd, md=FKM;
    const LLs=a=>Array.isArray(a)?L(a[0],a[1]||a[0]):(a||'');
    fr.innerHTML='<div class="sd-chips"><button type="button" class="sd-chip sd-firebtn" data-fire="1">'+L('Disparar','Fire')+'</button>'+md.modes.map(x=>'<button type="button" class="sd-chip'+(x===FKMODE?' on':'')+'" data-fm="'+x+'" aria-pressed="'+(x===FKMODE)+'">'+L(FMN[x][0],FMN[x][1])+(x==='burst'?' ('+md.burst+')':'')+'</button>').join('')+'</div>'+
      '<div class="sd-firenote" style="font-size:12px;opacity:.75;margin-top:4px">'+(s?L('Sonido: grabación real (','Sound: real recording (')+LLs(s.t)+' — '+LLs(s.a)+', '+(s.lu?'<a href="'+s.lu+'" target="_blank" rel="noopener">'+LLs(s.lic)+'</a>':LLs(s.lic))+').':L('Sin grabación real de esta arma en M.A.T: el disparo es solo visual.','No real recording of this weapon in M.A.T: firing is visual only.'))+'</div>'; }
  function fireSetup(r){ if(FK){ FK.dispose(); FK=null; } if(!M.fireKit||!wpn||!r) return; const m=M.mt(r.v)||{}, pist=r.w.cat==='pistol', mg=r.w.cat==='mg', bb=M.visBox(wpn);
    const md=M.fireModes(r.w,r.v); FKM=md; FKMODE=md.modes[0]; const EJ={m249:[-0.35,-1,0.1],m240:[0,-1,0.1],pkm:[1,0.25,0.1]};
    const muzAcc=()=>wpn.children.find(c=>c.userData&&c.userData.acc&&M.ACC[c.userData.acc]&&M.ACC[c.userData.acc].slot==='muzzle');
    FKO={holder, root:()=>wpn, recoil:()=>[wpn], cal:r.v.st&&r.v.st.cal?r.v.st.cal[0]:'', pist, mg,
      muz:()=>{ const a=muzAcc(); if(a){ const b=M.visBox(a).applyMatrix4(a.matrix); return [m.bore!=null?m.bore:(b.min.y+b.max.y)/2,b.max.z]; } return [m.bore!=null?m.bore:(pist?bb.max.y-(bb.max.y-bb.min.y)*0.18:(bb.min.y+bb.max.y)/2), m.muz!=null?m.muz:bb.max.z]; },
      port:()=>pist?[-0.012,bb.max.y-(bb.max.y-bb.min.y)*0.12,bb.min.z+(bb.max.z-bb.min.z)*0.55]:[-0.02,m.bore!=null?m.bore:(bb.min.y+bb.max.y)/2,m.oz!=null?m.oz:(bb.min.z+bb.max.z)/2],
      ej:EJ[r.w.id]||[-1,0.45,-0.15], pivot:()=>pist?[bb.min.y,bb.min.z+(bb.max.z-bb.min.z)*0.25]:[m.sty!=null?m.sty:(m.bore!=null?m.bore:(bb.min.y+bb.max.y)/2),m.stz!=null?m.stz:bb.min.z],
      sup:()=>{ const a=muzAcc(); return !!(a&&M.ACC[a.userData.acc].b==='can'); }, slides:()=>{ const out=[]; wpn.traverse(n=>{ if(n!==wpn&&n.name&&/bolt[ _]?carrier|(^|_)bolt(?![ _]?(catch|release))|slide(?![ _]?(lock|stop))/i.test(n.name)&&!out.some(p=>{ let q=n.parent; while(q){ if(q===p) return true; q=q.parent; } return false; })) out.push(n); }); return out.slice(0,2); },
      ground:()=>{ holder.updateMatrixWorld(true); return holder.worldToLocal(body.localToWorld(new THREE.Vector3(0,0,0))).y; }, redraw:()=>V.redraw&&V.redraw(), snd:null, buf:null};
    FK=M.fireKit(FKO); const my=FK; M.fireSnd(r.w,r.v).then(s=>{ if(FK!==my) return; FKO.snd=s; fireUI(); }); fireUI(); }
  function fireGo(){ if(!FK) return; const iv=FKM.rate?60/FKM.rate:0.16; if(BR) BR.pause(FKMODE==='semi'?900:FKMODE==='burst'?(FKM.burst*iv*1000+900):(3*iv*1000+900)); if(FKMODE==='semi') FK.fire(1,0.12); else if(FKMODE==='burst') FK.fire(FKM.burst,iv); else if(FKUP) FK.fire(3,iv); else { FKHOLD=true; FK.fire(400,iv); } }
  function fireStart(){ if(!FK||ANIMON) return; FKUP=false; const C=M.audioOn&&M.audioOn(); if(C&&FKO.snd&&!FKO.buf){ const k=FK; let done=false; const go=()=>{ if(done||FK!==k) return; done=true; fireGo(); }; M.shotBuf(FKO.snd.f).then(b=>{ FKO.buf=b; go(); }); setTimeout(go,450); return; } fireGo(); }
  function fireEnd(){ FKUP=true; if(FKHOLD){ FKHOLD=false; FK&&FK.stop(3); } }
  fr.addEventListener('pointerdown',e=>{ const b=e.target.closest('button[data-fire]'); if(!b) return; e.preventDefault(); b.setPointerCapture&&b.setPointerCapture(e.pointerId); fireStart(); });
  ['pointerup','pointercancel'].forEach(t=>fr.addEventListener(t,fireEnd)); fr.addEventListener('lostpointercapture',fireEnd,true);
  fr.addEventListener('click',e=>{ const b=e.target.closest('button[data-fm]'); if(b){ FKMODE=b.dataset.fm; fireUI(); return; } const f=e.target.closest('button[data-fire]'); if(f&&e.detail===0){ fireStart(); FKUP=true; if(FKHOLD){ FKHOLD=false; FK.stop(5); } } });
  /* selector de postura bajo el visor */
  const POS=[['pie','De pie','Standing'],['apunta','Apuntando','Aiming'],['rodilla','Rodilla en tierra','Kneeling'],['tumbado','Tumbado','Prone']];
  const pr=document.createElement('div'); pr.className='sd-chips sd-pose'; pr.style.margin='8px 0 2px';

  /* respiración en reposo y ligero balanceo del peso (Fase 7): giro rígido mínimo del tronco desde Spine01; el arma, las mochilas, las hombreras y el visor nocturno giran con él, así que las manos no se separan del arma. Se pausa en transiciones y al disparar; tumbado, sin movimiento; con «reducir movimiento», nada. Frecuencia: 15 respiraciones/min (adulto en reposo: 12–20/min). */
  const BR=(()=>{ const P=B('Spine01'); if(!P||!V.pre) return null; const red=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches; if(red) return null;
    const V3=THREE.Vector3, Q=THREE.Quaternion, AXL=new V3(1,0,0), AXF=new V3(0,0,1); let base=null, last=null, t0=performance.now(), on=true, raf=0, lt=0, vis=true, pauseTo=0;
    const objs=()=>[wpn,gearG,gearC,pvs].filter(Boolean);
    const snap=()=>({q:P.quaternion.clone(), o:objs().map(o=>({o,p:o.position.clone(),q:o.quaternion.clone()}))});
    const same=(a,b)=>{ if(!a||!b) return false; if(a.q.angleTo(b.q)>1e-7||a.o.length!==b.o.length) return false; for(let i=0;i<a.o.length;i++){ const x=a.o[i], y=b.o[i]; if(x.o!==y.o||x.p.distanceToSquared(y.p)>1e-12||x.q.angleTo(y.q)>1e-7) return false; } return true; };
    const restore=()=>{ if(!base) return; P.quaternion.copy(base.q); base.o.forEach(e=>{ e.o.position.copy(e.p); e.o.quaternion.copy(e.q); }); body.updateMatrixWorld(true); base=null; last=null; };
    const active=()=>on&&!ANIMON&&!FKHOLD&&performance.now()>pauseTo&&PO!=='tumbado';
    V.pre(()=>{ const cur=snap(); if(!same(cur,last)){ base=cur; } if(!base) base=cur;
      if(!active()){ if(last){ if(same(cur,last)) restore(); else { base=null; last=null; } } return; }
      const t=(window.MAT_BR_T!=null?window.MAT_BR_T:(performance.now()-t0)/1000), br=Math.sin(t*2*Math.PI/4.0), sw=PO==='rodilla'?0:Math.sin(t*2*Math.PI/9.0+1.3);
      const a=(0.7*br)*D2R, b=(0.5*sw)*D2R; const Rq=new Q().setFromAxisAngle(AXL,-a).multiply(new Q().setFromAxisAngle(AXF,b));
      body.updateMatrixWorld(true); const piv=body.worldToLocal(P.getWorldPosition(new V3()));
      const pq=body.getWorldQuaternion(new Q()).invert().multiply(P.parent.getWorldQuaternion(new Q()));
      P.quaternion.copy(pq.clone().invert().multiply(Rq).multiply(pq).multiply(base.q));
      base.o.forEach(e=>{ e.o.position.copy(e.p).sub(piv).applyQuaternion(Rq).add(piv); e.o.quaternion.copy(Rq).multiply(e.q); });
      body.updateMatrixWorld(true); last=snap(); });
    const io=new IntersectionObserver(es=>{ vis=es[0].isIntersecting; },{threshold:0.01}); io.observe(stage);
    const loop=tt=>{ raf=requestAnimationFrame(loop); if(document.hidden||!vis||!active()) return; if(tt-lt<33) return; lt=tt; V.redraw(); }; raf=requestAnimationFrame(loop);
    return { pause(ms){ pauseTo=Math.max(pauseTo,performance.now()+ms); }, set(v){ on=v; V.redraw(); }, stop(){ cancelAnimationFrame(raf); io.disconnect(); restore(); } };
  })();
  function poseUI(){ if(typeof fireUI==='function') try{ fireUI(); }catch(_){} pr.innerHTML=POS.map(p=>'<button type="button" class="sd-chip'+(PO===p[0]?' on':'')+'" data-po="'+p[0]+'" aria-pressed="'+(PO===p[0])+'">'+L(p[1],p[2])+'</button>').join(''); }
  fitPose(); poseUI(); if(POSES_ON&&stage.parentNode){ stage.parentNode.insertBefore(pr,stage.nextSibling); pr.parentNode.insertBefore(fr,pr.nextSibling); } fireUI();
  pr.addEventListener('click',e=>{ const b=e.target.closest('button[data-po]'); if(!b||b.dataset.po===PO) return; const to=b.dataset.po; try{ localStorage.setItem(PKEY,to); }catch(_){} const was=PO; PO=to; poseUI(); PO=was; transition(to); { const d=V.dbg(); V.look(d.yaw,PO==='tumbado'?0.3:0.05); } V.redraw&&V.redraw(); });
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
  if(window.MAT_DEV) window.MAT_DEV_K={hd:()=>{ PO='rodilla'; pose(); const a=lp('L_Upperarm').y, hy=lp('Hip').y; handsDown(); return [a,hy,lp('L_Upperarm').y,lp('Hip').y,lp('Spine02').y,lp('L_Hand').y,lp('L_Calf').y]; },lowY,THREE,body,B,bones,mesh,wpn:()=>wpn,wi:()=>wi,pose,V,lp,st,holder,gearG,gearH,gearC,UH,skinBounds,setPO:v=>{PO=v;}, PR, transition, animSeek, stopAnim, fk:()=>FK, br:()=>BR, zoom:(f,dx,dy,dz)=>{ const p=V.holder.parent; p.scale.setScalar(f); p.position.set(dx||0,dy||0,dz||0); V.redraw(); }};
  window.MAT_SOLDADO_DBG={ w:()=>wpn&&[wpn.position.toArray(),wpn.userData.stock,wpn.userData.gp,wpn.scale.x,new THREE.Box3().setFromObject(wpn).min.toArray(),wp(B('R_Hand')).toArray(),wp(B('R_Upperarm')).toArray()], still:(y,p)=>{ V.setAuto(false); V.reset(); if(y!=null) V.look(y,p==null?undefined:p); }, gear:()=>gearG.children.length,    weapon:()=>!!wpn, ground:()=>{ const s=holder.scale.x||1, g=lowY(1); return {legL:+(g[4]*s).toFixed(3),legR:+(g[5]*s).toFixed(3),lof:LOF.map(x=>+x.toFixed(3)),torso:+(g[0]*s).toFixed(3),armL:+(g[1]*s).toFixed(3),armR:+(g[2]*s).toFixed(3),head:+(g[3]*s).toFixed(3),gearG:+(objLow(gearG)*s).toFixed(3),gearH:+(objLow(gearH)*s).toFixed(3),gearC:+(objLow(gearC)*s).toFixed(3),wpn:+(objLow(wpn)*s).toFixed(3),prr:+PRR.toFixed(1),phy:+PHY.toFixed(3)}; }, helmet:()=>!!(mesh.helmet1_2&&mesh.helmet1_2.visible), scale:()=>holder.scale.x, hands:()=>{ body.updateMatrixWorld(true); const l=body.worldToLocal(wp(B('L_Hand'))), r=body.worldToLocal(wp(B('R_Hand'))); return {t:DBGH.t&&DBGH.t.toArray(),g:DBGH.g&&DBGH.g.toArray(),L:l.toArray(),R:r.toArray(),Lu:body.worldToLocal(wp(B('L_Upperarm'))).toArray(), mt:wi&&M.mt(wi.v), gp:wpn&&wpn.userData.gp, p:DBGH.p, hs:DBGH.hs}; } };
  return { update(s){ stopAnim(); scale(); rebuildGear(); camos(); setWeapon(); }, destroy(){ try{ if(BR) BR.stop(); }catch(e){} try{ if(CS) CS.dispose(); }catch(e){} try{ if(FK){ FK.dispose(); FK=null; } stopAnim(); if(bc) bc.dispose(); body.remove(gearG); body.remove(gearH); body.remove(gearC); pr.remove(); if(wpn) body.remove(wpn); if(pvs) body.remove(pvs); holder.remove(body); V.holder.remove(holder); }catch(e){} V.destroy(); } };
}
