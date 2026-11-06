/* M.A.T — «Combate»: tu soldado contra un soldado IA, en 3D.
   Escena (terreno, trincheras, sacos terreros, ruinas, árboles y rocas) hecha por M.A.T en código.
   Los dos soldados son la misma figura 3D de «Crea tu soldado» (soldado3d.js, sin modificar): cada uno se monta
   en su propia instancia del módulo con un visor «prestado» que vive dentro de esta escena. */
import * as THREE from './three.module.min.js';
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
const V3=THREE.Vector3;
/* ---------- terreno ---------- */
export const TR={x0:8.95,w:1.25,d:1.0,par:0.24}; /* trincheras en x=±8,95 m: 1,25 m de ancho, 1 m de hondo, parapeto de 24 cm */
function trenchDepth(x,z){ const ax=Math.abs(x), dx=Math.abs(ax-TR.x0); if(Math.abs(z)>9.5) return 0; const ez=Math.min(1,(9.5-Math.abs(z))/0.6);
  const hw=TR.w/2; if(dx>hw+0.18) return 0; const k=dx<=hw-0.05?1:Math.max(0,1-(dx-(hw-0.05))/0.23); return TR.d*k*ez; }
export function heightAt(x,z){ let h=0; const fl=Math.min(1,Math.max(0,(Math.abs(z)-8)/6))+Math.min(1,Math.max(0,(Math.abs(x)-31)/6));
  if(fl>0) h+=Math.min(1,fl)*(Math.sin(x*0.21+1.3)*0.35+Math.cos(z*0.27)*0.3+Math.sin((x+z)*0.11)*0.4);
  return h-trenchDepth(x,z); }
function noiseTex(N,base,vars,seed){ const c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d'); g.fillStyle=base; g.fillRect(0,0,N,N);
  let s=seed||7; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  for(let i=0;i<N*N/6;i++){ const v=vars[(r()*vars.length)|0]; g.fillStyle=v; g.globalAlpha=0.18+r()*0.35; const z=1+r()*2.5; g.fillRect(r()*N,r()*N,z,z); }
  g.globalAlpha=1; const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=4; return t; }
function buildTerrain(scene,low){ const W=84,H=56, sx=low?150:210, sz=low?100:140; const g=new THREE.PlaneGeometry(W,H,sx,sz); g.rotateX(-Math.PI/2);
  const p=g.attributes.position, col=new Float32Array(p.count*3), c=new THREE.Color();
  const grass=new THREE.Color(0x6f7f45), dry=new THREE.Color(0x938d5a), dirt=new THREE.Color(0x7d6a4c), wall=new THREE.Color(0x4a3c2b);
  for(let i=0;i<p.count;i++){ const x=p.getX(i), z=p.getZ(i); const td=trenchDepth(x,z); p.setY(i,heightAt(x,z));
    const n=0.5+0.5*Math.sin(x*0.37+Math.cos(z*0.41)*2.1)*Math.cos(z*0.23-x*0.07); c.copy(grass).lerp(dry,n*0.75);
    const lane=Math.max(0,1-Math.abs(z)/5.5)*0.35; c.lerp(dirt,lane);
    const near=Math.max(0,1-Math.abs(Math.abs(x)-TR.x0)/2.2); c.lerp(dirt,near*0.55*(Math.abs(z)<10?1:0));
    if(td>0.05) c.copy(wall).lerp(dirt,1-td/TR.d);
    col[i*3]=c.r; col[i*3+1]=c.g; col[i*3+2]=c.b; }
  g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.computeVertexNormals();
  const tex=noiseTex(256,'#8a8a8a',['#5f5f5f','#b5b5b5','#777','#9d9d9d','#4c4c4c'],11); tex.repeat.set(26,18);
  const m=new THREE.MeshStandardMaterial({vertexColors:true,map:tex,roughness:0.97,metalness:0}); const mesh=new THREE.Mesh(g,m); mesh.receiveShadow=true; scene.add(mesh);
  /* fondo de la trinchera: tablas (duckboards) */
  const pl=new THREE.MeshStandardMaterial({color:0x5a4430,roughness:0.9}); const pg=new THREE.BoxGeometry(0.9,0.04,0.14);
  const n=2*Math.floor(18/0.32); const ib=new THREE.InstancedMesh(pg,pl,n); let k=0; const o=new THREE.Object3D();
  [-1,1].forEach(s=>{ for(let z=-9;z<9;z+=0.32){ o.position.set(s*TR.x0,-TR.d+0.02,z+0.16); o.rotation.set(0,(Math.sin(z*7)*0.04),0); o.updateMatrix(); ib.setMatrixAt(k++,o.matrix); } });
  ib.count=k; ib.receiveShadow=true; scene.add(ib);
  /* revestimiento de madera en las paredes (postes) */
  const pg2=new THREE.CylinderGeometry(0.05,0.05,TR.d+0.1,6); const ip=new THREE.InstancedMesh(pg2,pl,4*Math.floor(18/1.5)+8); k=0;
  [-1,1].forEach(s=>[-1,1].forEach(e=>{ for(let z=-8.6;z<=8.6;z+=1.5){ o.position.set(s*TR.x0+e*(TR.w/2-0.06),-TR.d/2+0.02,z); o.rotation.set(0,0,0); o.updateMatrix(); ip.setMatrixAt(k++,o.matrix); } }));
  ip.count=k; ip.castShadow=true; scene.add(ip);
  return mesh; }
/* sacos terreros (instanciados) */
function sandbagGeo(){ const g=new THREE.BoxGeometry(0.5,0.15,0.3,4,2,3); const p=g.attributes.position;
  for(let i=0;i<p.count;i++){ const x=p.getX(i)/0.25, y=p.getY(i)/0.075, z=p.getZ(i)/0.15; const r=1-0.22*(x*x*x*x)-0.1*z*z*z*z; p.setY(i,p.getY(i)*Math.max(0.55,r)); p.setZ(i,p.getZ(i)*(1-0.12*x*x*x*x)); p.setX(i,p.getX(i)*(1-0.06*y*y)); }
  g.computeVertexNormals(); return g; }
export function buildMap(scene,low,seed){ const ground=buildTerrain(scene,low); const o=new THREE.Object3D(); let s=seed||3; const rnd=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
  const bagM=new THREE.MeshStandardMaterial({color:0x8d7b57,roughness:0.95,map:noiseTex(64,'#9a9a9a',['#7a7a7a','#b0b0b0'],5)}); const bags=[];
  const wallOf=(cx,cz,len,rows,rot)=>{ for(let r=0;r<rows;r++){ const n=Math.round(len/0.48); for(let i=0;i<n;i++){ const t=(i-(n-1)/2)*0.48+(r%2?0.24:0); if(Math.abs(t)>len/2) continue; const lx=Math.cos(rot)*0, lz=t;
        const x=cx+Math.sin(rot)*0+lx, z=cz+lz; bags.push([x+(rnd()-0.5)*0.03,heightAt(x,z)+0.075+r*0.135,z,(rnd()-0.5)*0.12+Math.PI/2]); } } };
  /* parapeto de las trincheras (lado enemigo) y sacos de cubierta P2 */
  [-1,1].forEach(sd=>{ for(let z=-9.2;z<9.2;z+=0.48){ const x=sd*(TR.x0-TR.w/2-0.32); bags.push([x,0.075,z+(rnd()-0.5)*0.05,Math.PI/2+(rnd()-0.5)*0.1]); if(Math.abs(z)>1.4) bags.push([x+sd*0.02,0.21,z+0.24,Math.PI/2+(rnd()-0.5)*0.1]); } });
  [-1,1].forEach(sd=>wallOf(sd*14.15,-sd*3,2.9,5,0));
  const ib=new THREE.InstancedMesh(sandbagGeo(),bagM,bags.length); bags.forEach((b,i)=>{ o.position.set(b[0],b[1],b[2]); o.rotation.set((rnd()-0.5)*0.05,b[3],(rnd()-0.5)*0.05); o.scale.set(1,1,1); o.updateMatrix(); ib.setMatrixAt(i,o.matrix); });
  ib.castShadow=true; ib.receiveShadow=true; scene.add(ib);
  /* ruinas: muro de bloques con el borde roto (P1) */
  const wm=new THREE.MeshStandardMaterial({color:0xc9bfae,roughness:0.92,map:noiseTex(128,'#a8a8a8',['#7d7d7d','#cfcfcf','#959595','#6a6a6a'],9)}); const blocks=[];
  [-1,1].forEach(sd=>{ const x=sd*20, z0=sd*-0.65; for(let r=0;r<11;r++){ for(let i=0;i<7;i++){ const z=z0-sd*(i*0.4+(r%2?0.2:0)); const top=2.3-(i*0.18+Math.sin(i*2.7+sd)*0.35); if(r*0.2>top) continue; if(r===0&&i===6) continue; blocks.push([x,0.1+r*0.2,z]); } } for(let r=0;r<7;r++){ for(let i=1;i<4;i++){ if(r*0.2>1.5-i*0.3) continue; blocks.push([x-sd*-1*(i*0.4)*-1,0.1+r*0.2,z0-sd*2.6]); } } });
  const ibw=new THREE.InstancedMesh(new THREE.BoxGeometry(0.34,0.19,0.39),wm,blocks.length); blocks.forEach((b,i)=>{ o.position.set(b[0],b[1],b[2]); o.rotation.set(0,(rnd()-0.5)*0.04,0); o.updateMatrix(); ibw.setMatrixAt(i,o.matrix); }); ibw.castShadow=true; ibw.receiveShadow=true; scene.add(ibw);
  /* cascotes al pie del muro */
  const deb=[]; [-1,1].forEach(sd=>{ for(let i=0;i<16;i++) deb.push([sd*(20+(rnd()-0.2)*1.2*sd),sd*(-1.4-rnd()*2.2)]); });
  /* rocas (P0 y sueltas) */
  const rg=new THREE.DodecahedronGeometry(1,1); { const p=rg.attributes.position; for(let i=0;i<p.count;i++){ const f=0.82+0.22*Math.sin(p.getX(i)*5.1+p.getZ(i)*3.3)+0.08*Math.cos(p.getY(i)*7.3); p.setXYZ(i,p.getX(i)*f,p.getY(i)*f*0.7,p.getZ(i)*f); } rg.computeVertexNormals(); }
  const rm=new THREE.MeshStandardMaterial({color:0x6c685f,roughness:0.96,map:noiseTex(128,'#9a9a9a',['#6e6e6e','#b8b8b8','#858585','#5a5a5a'],13)}); const rocks=[];
  [-1,1].forEach(sd=>{ rocks.push([sd*26.0,-sd*6.35,0.85,0.4]); rocks.push([sd*27.7,-sd*7.1,0.55,1.4]); rocks.push([sd*25.3,-sd*7.3,0.4,2.2]); });
  for(let i=0;i<26;i++){ const x=(rnd()-0.5)*76, z=(rnd()<0.5?-1:1)*(7+rnd()*18); rocks.push([x,z,0.2+rnd()*0.5,rnd()*6]); }
  deb.forEach(d=>rocks.push([d[0],d[1],0.08+rnd()*0.12,rnd()*6]));
  const irk=new THREE.InstancedMesh(rg,rm,rocks.length); rocks.forEach((r,i)=>{ o.position.set(r[0],heightAt(r[0],r[1])+r[2]*0.25,r[1]); o.rotation.set(0,r[3],0); o.scale.setScalar(r[2]); o.updateMatrix(); irk.setMatrixAt(i,o.matrix); }); irk.castShadow=true; irk.receiveShadow=true; scene.add(irk);
  /* árboles: tronco + copa (pinos y frondosos) */
  const trunkG=new THREE.CylinderGeometry(0.09,0.16,1,6); trunkG.translate(0,0.5,0); const crownG=new THREE.IcosahedronGeometry(1,1); const coneG=new THREE.ConeGeometry(1,2.2,8); coneG.translate(0,1.1,0);
  const tm=new THREE.MeshStandardMaterial({color:0x4b3a2a,roughness:0.95}), cm=new THREE.MeshStandardMaterial({color:0x3f5a2c,roughness:0.9,flatShading:true}), pm=new THREE.MeshStandardMaterial({color:0x2f4a2a,roughness:0.9,flatShading:true});
  const trees=[]; for(let i=0;i<34;i++){ const sdz=rnd()<0.5?-1:1; const x=(rnd()-0.5)*80, z=sdz*(11+rnd()*15); trees.push([x,z,0.8+rnd()*0.6,rnd()<0.45]); }
  [[-33,-2],[-35,4],[34,1],[36,-5],[-38,9],[38,8]].forEach(t=>trees.push([t[0],t[1],1+rnd()*0.4,rnd()<0.5]));
  const it=new THREE.InstancedMesh(trunkG,tm,trees.length), ic=new THREE.InstancedMesh(crownG,cm,trees.length), ipn=new THREE.InstancedMesh(coneG,pm,trees.length); let nc=0,np=0;
  trees.forEach((t,i)=>{ const y=heightAt(t[0],t[1]); const H=(t[3]?5.5:4.2)*t[2]; o.position.set(t[0],y-0.05,t[1]); o.rotation.set(0,i,0); o.scale.set(t[2],H*0.55,t[2]); o.updateMatrix(); it.setMatrixAt(i,o.matrix);
    if(t[3]){ o.position.set(t[0],y+H*0.3,t[1]); o.scale.set(1.3*t[2],H*0.33,1.3*t[2]); o.updateMatrix(); ipn.setMatrixAt(np++,o.matrix); } else { o.position.set(t[0],y+H*0.62,t[1]); o.scale.set(1.7*t[2],1.45*t[2],1.7*t[2]); o.updateMatrix(); ic.setMatrixAt(nc++,o.matrix); } });
  ic.count=nc; ipn.count=np; [it,ic,ipn].forEach(m=>{ m.castShadow=true; m.receiveShadow=true; scene.add(m); });
  /* matas de hierba (planos cruzados) */
  if(!low){ const gc=document.createElement('canvas'); gc.width=64; gc.height=64; const gg=gc.getContext('2d'); for(let i=0;i<22;i++){ gg.strokeStyle=['#6c7a3f','#82854f','#55663a'][i%3]; gg.lineWidth=2; gg.beginPath(); const x=6+Math.random()*52; gg.moveTo(32+(x-32)*0.3,64); gg.quadraticCurveTo(x,40,x+(Math.random()-0.5)*14,10+Math.random()*24); gg.stroke(); }
    const gt=new THREE.CanvasTexture(gc); gt.colorSpace=THREE.SRGBColorSpace; const gmt=new THREE.MeshStandardMaterial({map:gt,alphaTest:0.5,side:THREE.DoubleSide,roughness:1});
    const pg=new THREE.PlaneGeometry(0.6,0.45); pg.translate(0,0.22,0); const pg2=pg.clone(); pg2.rotateY(Math.PI/2); const tuft=mergeGeo([pg,pg2]);
    const tufts=[]; for(let i=0;i<260;i++){ const x=(rnd()-0.5)*78, z=(rnd()-0.5)*50; if(Math.abs(Math.abs(x)-TR.x0)<1.4&&Math.abs(z)<10.5) continue; if(Math.abs(z)<1.8&&Math.abs(x)<30) continue; tufts.push([x,z]); }
    const ig=new THREE.InstancedMesh(tuft,gmt,tufts.length); tufts.forEach((t,i)=>{ o.position.set(t[0],heightAt(t[0],t[1]),t[1]); o.rotation.set(0,rnd()*3,0); const sc=0.6+rnd()*0.8; o.scale.set(sc,sc,sc); o.updateMatrix(); ig.setMatrixAt(i,o.matrix); }); ig.receiveShadow=true; scene.add(ig); }
  /* cráteres (manchas oscuras) */
  const cc=document.createElement('canvas'); cc.width=cc.height=64; const cg=cc.getContext('2d'); const rg2=cg.createRadialGradient(32,32,4,32,32,31); rg2.addColorStop(0,'rgba(28,22,16,0.9)'); rg2.addColorStop(0.55,'rgba(52,42,30,0.6)'); rg2.addColorStop(1,'rgba(60,50,36,0)'); cg.fillStyle=rg2; cg.fillRect(0,0,64,64);
  const ct=new THREE.CanvasTexture(cc); const cmat=new THREE.MeshLambertMaterial({map:ct,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
  [[-4,2.5,1.6],[3,-3.5,1.3],[0.5,5.2,1.1],[-17,-5,1.2],[16.5,6,1.4],[-23,1.5,0.9],[24,-2,1.0]].forEach(c=>{ const m=new THREE.Mesh(new THREE.CircleGeometry(c[2],20),cmat); m.rotation.x=-Math.PI/2; m.position.set(c[0],heightAt(c[0],c[1])+0.01,c[1]); scene.add(m); });
  return {ground}; }
function mergeGeo(gs){ let n=0; gs.forEach(g=>n+=g.attributes.position.count); const P=new Float32Array(n*3), N=new Float32Array(n*3), U=new Float32Array(n*2); const I=[]; let o=0;
  gs.forEach(g=>{ const g2=g.index?g.toNonIndexed():g; const c=g2.attributes.position.count; P.set(g2.attributes.position.array,o*3); N.set(g2.attributes.normal.array,o*3); U.set(g2.attributes.uv.array,o*2); o+=c; });
  const m=new THREE.BufferGeometry(); m.setAttribute('position',new THREE.BufferAttribute(P,3)); m.setAttribute('normal',new THREE.BufferAttribute(N,3)); m.setAttribute('uv',new THREE.BufferAttribute(U,2)); return m; }
/* ---------- posiciones de cobertura (lado del jugador; la IA, en espejo) ---------- */
export const COVER=[
  {k:'rocas', p:[-27.1,0,5.25], pose:'tumbado', exp:0.6},
  {k:'ruinas', p:[-20.75,0,0.05], pose:'apunta', exp:0.5},
  {k:'sacos', p:[-15.0,0,3.0], pose:'rodilla', exp:0.45},
  {k:'trinchera', p:[-TR.x0,-TR.d,-0.6], pose:'apunta', exp:0.35, duck:'rodilla'}];
export function coverPos(i,side){ const c=COVER[i]; return new V3(-side*c.p[0],c.p[1],-side*c.p[2]); }
/* ---------- partículas (chispas, polvo, humo) ---------- */
class Puffs{ constructor(scene,n,add){ this.n=n; this.i=0; const g=new THREE.BufferGeometry(); this.P=new Float32Array(n*3); this.C=new Float32Array(n*4); this.S=new Float32Array(n); this.v=new Float32Array(n*3); this.life=new Float32Array(n); this.age=new Float32Array(n); this.grow=new Float32Array(n); this.grav=new Float32Array(n);
    g.setAttribute('position',new THREE.BufferAttribute(this.P,3)); g.setAttribute('col',new THREE.BufferAttribute(this.C,4)); g.setAttribute('sz',new THREE.BufferAttribute(this.S,1));
    const c=document.createElement('canvas'); c.width=c.height=32; const x=c.getContext('2d'); const gr=x.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.5,'rgba(255,255,255,0.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=gr; x.fillRect(0,0,32,32);
    this.mat=new THREE.ShaderMaterial({uniforms:{map:{value:new THREE.CanvasTexture(c)},k:{value:300}},transparent:true,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,
      vertexShader:'attribute vec4 col; attribute float sz; varying vec4 vC; uniform float k; void main(){ vC=col; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_PointSize=sz*k/max(0.1,-mv.z); gl_Position=projectionMatrix*mv; }',
      fragmentShader:'uniform sampler2D map; varying vec4 vC; void main(){ vec4 t=texture2D(map,gl_PointCoord); gl_FragColor=vec4(vC.rgb,vC.a*t.a); if(gl_FragColor.a<0.01) discard; }'});
    this.pts=new THREE.Points(g,this.mat); this.pts.frustumCulled=false; scene.add(this.pts); this.g=g; this.col=[]; for(let i=0;i<n;i++){ this.life[i]=0; this.C[i*4+3]=0; } }
  emit(p,v,life,size,grow,rgb,a,grav){ const i=this.i; this.i=(this.i+1)%this.n; this.P.set([p.x,p.y,p.z],i*3); this.v.set([v.x,v.y,v.z],i*3); this.life[i]=life; this.age[i]=0; this.S[i]=size; this.grow[i]=grow; this.grav[i]=grav||0; this.C.set([rgb[0],rgb[1],rgb[2],a],i*4); this.col[i]=a; }
  update(dt){ for(let i=0;i<this.n;i++){ if(this.life[i]<=0) continue; this.age[i]+=dt; const f=this.age[i]/this.life[i]; if(f>=1){ this.life[i]=0; this.C[i*4+3]=0; continue; }
      this.v[i*3+1]-=this.grav[i]*dt; for(let k=0;k<3;k++){ this.P[i*3+k]+=this.v[i*3+k]*dt; this.v[i*3+k]*=(1-0.9*dt); } this.S[i]+=this.grow[i]*dt; this.C[i*4+3]=this.col[i]*(1-f)*(f<0.1?f*10:1); }
    this.g.attributes.position.needsUpdate=true; this.g.attributes.col.needsUpdate=true; this.g.attributes.sz.needsUpdate=true; } }
/* ---------- visor «prestado» para soldado3d.js ---------- */
function fakeViewer(holder){ const inv=[]; const noop=()=>{}; return { scene:{add:noop,remove:noop}, holder, track(u){ inv.push(u); }, redraw:noop, recenter:noop, reset:noop, fit:noop, fitK:noop, fitAll:noop, setAuto:noop, look:noop,
  dbg(){ return {yaw:0,pitch:0,dist:2,fitD:2}; }, destroy:noop, _sync(){ holder.updateMatrixWorld(true); const im=holder.matrixWorld.clone().invert(); inv.forEach(u=>u.value.copy(im)); } }; }
let NINST=0;
async function mkSoldier(world,M,st,D,side,pose0,host){
  NINST++; const S3=await import('./soldado3d.js?v='+VER+'&cb='+NINST);
  const grp=new THREE.Group(); world.add(grp); const inner=new THREE.Group(); grp.add(inner); const V=fakeViewer(inner);
  const box=document.createElement('div'); box.setAttribute('aria-hidden','true'); box.style.cssText='position:absolute;left:-9999px;top:0;width:200px;height:200px;overflow:hidden;visibility:hidden;pointer-events:none'; const stg=document.createElement('div'); stg.style.cssText='position:relative;width:200px;height:200px'; box.appendChild(stg); host.appendChild(box);
  const S={grp,inner,V,FK:null,FKO:null,box,side};
  const M2=Object.assign({},M,{viewer:()=>V, fireKit:o=>{ S.FKO=o; S.FK=M.fireKit(o); return S.FK; }});
  let prev=null; try{ prev=localStorage.getItem('mat_soldado_pose'); localStorage.setItem('mat_soldado_pose',pose0); }catch(e){}
  try{ S.api=await S3.mount(stg,st,D,M2,{}); } finally { try{ if(prev==null) localStorage.removeItem('mat_soldado_pose'); else localStorage.setItem('mat_soldado_pose',prev); }catch(e){} }
  S.pose=pose0; S.body=inner.children[0]&&inner.children[0].children[0];
  S.bones={}; inner.traverse(o=>{ if(o.isBone) S.bones[o.name.replace('CC_Base_','')]=o; });
  if(st&&st.ins){ try{ insLook(S); }catch(e){ console.warn('ins look',e); } }
  inner.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } });
  return S; }
function wpnOf(S){ return S.FKO&&S.FKO.root?S.FKO.root():null; }
export function muzzle(S){ const w=wpnOf(S); if(!w) return null; w.updateMatrixWorld(true); const mz=S.FKO.muz(); return w.localToWorld(new V3(0,mz[0],mz[1])); }
function wpnDir(S){ const w=wpnOf(S); if(!w) return null; w.updateMatrixWorld(true); const q=new THREE.Quaternion(); w.getWorldQuaternion(q); return new V3(0,0,1).applyQuaternion(q).normalize(); }
function headPos(S){ const h=S.bones.Head; if(!h) return S.grp.position.clone().add(new V3(0,1.6,0)); return h.getWorldPosition(new V3()); }
function chestPos(S){ const h=S.bones.Spine02; if(!h) return S.grp.position.clone().add(new V3(0,1.2,0)); return h.getWorldPosition(new V3()); }

/* ---------- insurgente: pañuelo (shemagh) a cuadros en la cabeza y al cuello, camisa de paisano, chaleco portacargadores sin placa (modelo aproximado de M.A.T en código) ---------- */
function checkTex(){ const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d'); g.fillStyle='#d8cfba'; g.fillRect(0,0,64,64); g.strokeStyle='rgba(70,60,48,0.55)'; g.lineWidth=2; for(let i=0;i<64;i+=8){ g.beginPath(); g.moveTo(i+2,0); g.lineTo(i+2,64); g.stroke(); g.beginPath(); g.moveTo(0,i+2); g.lineTo(64,i+2); g.stroke(); } g.fillStyle='rgba(70,60,48,0.35)'; for(let i=0;i<64;i+=8) for(let j=0;j<64;j+=8) g.fillRect(i+1,j+1,3,3); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(3,3); t.colorSpace=THREE.SRGBColorSpace; return t; }
function insLook(S){ const inner=S.inner; const shirt=new THREE.MeshStandardMaterial({color:0x7d6a52,roughness:0.95});
  inner.traverse(o=>{ if(!o.isMesh) return; if(o.name==='plate_1'||/^helmet/.test(o.name)){ Object.defineProperty(o,'visible',{get(){ return false; },set(){},configurable:true}); }
    if(/^kitel/.test(o.name)){ const m0=o.material; const m=shirt.clone(); if(m0&&m0.normalMap){ m.normalMap=m0.normalMap; } o.material=m; o.userData.orig=m; } });
  const head=S.bones.Head; if(!head) return; inner.updateMatrixWorld(true); const cloth=new THREE.MeshStandardMaterial({map:checkTex(),roughness:0.97,side:THREE.DoubleSide});
  const wq=new THREE.Quaternion(), ws=new V3(); head.getWorldQuaternion(wq); head.getWorldScale(ws); const hp=head.getWorldPosition(new V3());
  const add=(geo,wpos,rot)=>{ const m=new THREE.Mesh(geo,cloth); m.castShadow=true; head.add(m); m.position.copy(head.worldToLocal(wpos.clone())); m.quaternion.copy(wq.clone().invert()); if(rot) m.quaternion.multiply(new THREE.Quaternion().setFromEuler(rot)); m.scale.set(1/ws.x,1/ws.y,1/ws.z); return m; };
  const cap=new THREE.SphereGeometry(0.118,18,12,0,Math.PI*2,0,Math.PI*0.6); cap.scale(1,1.05,1.12); add(cap,hp.clone().add(new V3(0,0.085,0)));
  const tail=new THREE.ConeGeometry(0.07,0.26,10,1,true); add(tail,hp.clone().add(new V3(0,0.0,-0.13)),new THREE.Euler(-2.6,0,0));
  const neck=new THREE.TorusGeometry(0.075,0.032,8,18); add(neck,hp.clone().add(new V3(0,-0.1,0.01)),new THREE.Euler(Math.PI/2,0,0)); }
/* ---------- técnica: pickup civil con una ametralladora sobre un soporte en la caja (modelo propio de M.A.T en código; medidas de un pickup mediano, estimación) ---------- */
function buildTec(scene){ const G=new THREE.Group(); const paint=new THREE.MeshStandardMaterial({color:0xd8d1bf,roughness:0.75,metalness:0.15,map:noiseTex(64,'#bcbcbc',['#8f8a80','#d6d6d6','#7a5a3c'],11)});
  const dark=new THREE.MeshStandardMaterial({color:0x2a2a2a,roughness:0.6,metalness:0.3}), glass=new THREE.MeshStandardMaterial({color:0x26323a,roughness:0.15,metalness:0.6}), tire=new THREE.MeshStandardMaterial({color:0x1b1b1b,roughness:0.9}), steel=new THREE.MeshStandardMaterial({color:0x2c2f2a,roughness:0.45,metalness:0.7}), rust=new THREE.MeshStandardMaterial({color:0x6e4a30,roughness:0.95});
  const box=(w,h,d,mat,x,y,z)=>{ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; G.add(m); return m; };
  /* largo en z (5,3 m), ancho en x (1,85 m); la cabina hacia z+ */ box(1.8,0.42,5.2,paint,0,0.68,0); box(1.82,0.36,1.25,paint,0,0.98,1.95); box(1.72,0.62,1.6,paint,0,1.2,0.55); box(1.6,0.5,0.06,glass,0,1.22,1.36).rotation.x=-0.5; box(1.74,0.42,0.04,glass,0,1.22,-0.26); box(0.04,0.38,1.2,glass,0.87,1.24,0.6); box(0.04,0.38,1.2,glass,-0.87,1.24,0.6);
  box(1.84,0.1,0.18,dark,0,0.62,2.62); box(1.84,0.1,0.18,dark,0,0.62,-2.62); box(1.7,0.04,2.25,rust,0,0.9,-1.35); box(0.07,0.42,2.3,paint,0.88,1.1,-1.35); box(0.07,0.42,2.3,paint,-0.88,1.1,-1.35); box(1.8,0.42,0.07,paint,0,1.1,-2.5); box(1.8,0.5,0.07,dark,0,1.15,-0.22);
  [[0.86,1.6],[-0.86,1.6],[0.86,-1.6],[-0.86,-1.6]].forEach(([x,z])=>{ const w=new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.27,18),tire); w.rotation.z=Math.PI/2; w.position.set(x,0.38,z); w.castShadow=true; G.add(w); const h=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.29,12),steel); h.rotation.z=Math.PI/2; h.position.set(x,0.38,z); G.add(h); });
  /* soporte y ametralladora tipo PK */ const post=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,1.0,10),steel); post.position.set(0,1.4,-1.15); G.add(post); const gun=new THREE.Group(); gun.position.set(0,1.95,-1.15); G.add(gun);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.028,0.028,1.05,10),steel); bar.rotation.x=Math.PI/2; bar.position.set(0,0,0.42); gun.add(bar); const rec=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.13,0.55),steel); rec.position.set(0,0,0.02); gun.add(rec); const stock=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.12,0.3),rust); stock.position.set(0,-0.03,-0.38); gun.add(stock); const can=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.16,0.2),new THREE.MeshStandardMaterial({color:0x4b5232,roughness:0.8})); can.position.set(0.11,-0.08,0.05); gun.add(can);
  const shield=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.32,0.02),steel); shield.position.set(0,0.02,0.32); gun.add(shield);
  G.userData.gun=gun; scene.add(G); return G; }
/* ---------- la escena ---------- */
export async function create(host,cfg){
  const red=!!cfg.red, low=!!cfg.low; const R=new THREE.WebGLRenderer({antialias:!low,powerPreference:'high-performance'}); const DPR0=Math.min(window.devicePixelRatio||1,low?1.5:2); let dpr=DPR0; R.setPixelRatio(dpr);
  R.outputColorSpace=THREE.SRGBColorSpace; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.22; R.shadowMap.enabled=true; R.shadowMap.type=THREE.PCFSoftShadowMap;
  host.appendChild(R.domElement); R.domElement.style.cssText='display:block;width:100%;height:100%;touch-action:pan-y';
  const scene=new THREE.Scene(); const sky=new THREE.Color(0xb9c7d3); scene.background=sky; scene.fog=new THREE.Fog(0xb9c7d3,38,95);
  { const c=document.createElement('canvas'); c.width=2; c.height=128; const g=c.getContext('2d'); const gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,'#6f93b8'); gr.addColorStop(0.55,'#a9bccd'); gr.addColorStop(1,'#c9d2d6'); g.fillStyle=gr; g.fillRect(0,0,2,128); const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
    const sg=new THREE.SphereGeometry(140,24,12); const sm=new THREE.MeshBasicMaterial({map:t,side:THREE.BackSide,fog:false,depthWrite:false}); const sk=new THREE.Mesh(sg,sm); sk.renderOrder=-10; scene.add(sk);
    /* uv de la esfera: v=0 abajo; el degradado va de arriba (0) a abajo — se invierte */ t.flipY=true; }
  const hemi=new THREE.HemisphereLight(0xd6e2ee,0x6a6350,1.15); scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff1dc,2.3); sun.position.set(-18,30,14); sun.castShadow=true; const SS=low?1024:2048; sun.shadow.mapSize.set(SS,SS); const sc=sun.shadow.camera; sc.left=-34; sc.right=34; sc.top=22; sc.bottom=-22; sc.near=5; sc.far=90; sun.shadow.bias=-0.0005; sun.shadow.normalBias=0.03; scene.add(sun); scene.add(sun.target);
  const map=buildMap(scene,low,cfg.seed||7);
  const cam=new THREE.PerspectiveCamera(42,1,0.08,220); cam.position.set(-34,9,16); cam.lookAt(0,0,0);
  const sparks=new Puffs(scene,160,true), dust=new Puffs(scene,140,false);
  /* trazadoras: segmentos brillantes que vuelan */
  const trG=new THREE.CylinderGeometry(0.012,0.012,1,5,1,true); trG.rotateX(Math.PI/2); trG.translate(0,0,-0.5);
  const tracers=[];
  function tracer(a,b,color,speed){ const m=new THREE.Mesh(trG,new THREE.MeshBasicMaterial({color,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,fog:false}));
    m.scale.set(1,1,2.6); m.position.copy(a); m.lookAt(b); scene.add(m); const L=a.distanceTo(b); tracers.push({m,a:a.clone(),b:b.clone(),L,t:0,sp:speed||220}); }
  function stepTracers(dt){ for(let i=tracers.length-1;i>=0;i--){ const T=tracers[i]; T.t+=dt*T.sp; const f=Math.min(1,T.t/T.L); T.m.position.lerpVectors(T.a,T.b,f); if(f>=1){ scene.remove(T.m); T.m.material.dispose(); tracers.splice(i,1); } } }
  function spark(p,n){ for(let i=0;i<(n||14);i++){ const v=new V3((Math.random()-0.5)*5,Math.random()*3.5,(Math.random()-0.5)*5); sparks.emit(p,v,0.25+Math.random()*0.3,0.07,0,[1,0.78,0.4],1,9); } sparks.emit(p,new V3(),0.12,0.6,2,[1,0.85,0.55],0.9,0); }
  function puff(p,col,n,big){ for(let i=0;i<(n||7);i++){ const v=new V3((Math.random()-0.5)*1.4,0.6+Math.random()*1.4,(Math.random()-0.5)*1.4); dust.emit(p.clone().add(new V3((Math.random()-0.5)*0.15,0,(Math.random()-0.5)*0.15)),v,0.9+Math.random()*0.8,(big?0.5:0.25)+Math.random()*0.2,big?1.2:0.6,col||[0.55,0.47,0.36],0.55,0.6); } }
  /* soldados */
  const sA=await mkSoldier(scene,cfg.M,cfg.A.st,cfg.A.D,-1,COVER[0].pose,host); const sB=await mkSoldier(scene,cfg.M,cfg.B.st,cfg.B.D,1,COVER[0].pose,host); const SOL=[sA,sB];
  SOL.forEach(S=>{ const p=coverPos(0,S.side); S.grp.position.copy(p); S.at=0; S.walk=null; S.fall=null; S.yawT=null; S.alive=true; S.tr=cfg[S.side<0?'A':'B'].tracer||0xff5a3a; });
  const other=S=>S===sA?sB:sA;
  function aimYaw(S,target){ /* gira el soldado para que el cañón apunte al enemigo */ const d=wpnDir(S); const to=(target||chestPos(other(S))).clone().sub(S.grp.position); if(!d) return Math.atan2(to.x,to.z);
    const cur=Math.atan2(d.x,d.z), want=Math.atan2(to.x,to.z); return S.grp.rotation.y+angDiff(want,cur); }
  function angDiff(a,b){ let d=a-b; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI; return d; }
  function face(S,instant){ const y=aimYaw(S); if(instant||red){ S.grp.rotation.y=y; S.yawT=null; } else S.yawT=y; }
  SOL.forEach(S=>{ S.grp.updateMatrixWorld(true); }); SOL.forEach(S=>face(S,true)); SOL.forEach(S=>face(S,true));
  /* pose: pulsa el selector (oculto) de soldado3d, que anima la transición; espera a que el esqueleto se quede quieto */
  function sig(S){ const b=S.bones; let s=0; ['Head','L_Hand','R_Hand','L_Foot','R_Foot','Hip'].forEach(n=>{ const o=b[n]; if(o){ const p=o.getWorldPosition(new V3()); s+=p.x*1.3+p.y*2.1+p.z*0.7; } }); return s; }
  function setPose(S,to){ return new Promise(res=>{ if(S.pose===to||!S.alive){ res(); return; } const btn=S.box.querySelector('.sd-pose button[data-po="'+to+'"]'); S.pose=to; if(!btn){ res(); return; } btn.click();
      const t0=performance.now(); let last=sig(S), still=0, lt=t0; const tick=()=>{ const now=performance.now(); const s=sig(S); if(Math.abs(s-last)<1e-4) still+=now-lt; else still=0; last=s; lt=now;
        if((now-t0>350&&still>260)||now-t0>6000){ face(S); res(); return; } requestAnimationFrame(tick); }; requestAnimationFrame(tick); }); }
  /* paso: piernas animadas en código mientras se desplaza (el resto de la pose no cambia) */
  const LEGS=['L_Thigh','R_Thigh','L_Calf','R_Calf','L_Foot','R_Foot'];
  function walkStart(S){ S.walkQ={}; LEGS.forEach(n=>{ const b=S.bones[n]; if(b) S.walkQ[n]=b.quaternion.clone(); }); }
  function walkEnd(S){ if(!S.walkQ) return; LEGS.forEach(n=>{ const b=S.bones[n]; if(b&&S.walkQ[n]) b.quaternion.copy(S.walkQ[n]); }); S.walkQ=null; S.inner.position.y=0; }
  const _q=new THREE.Quaternion(), _pq=new THREE.Quaternion(), _ax=new V3();
  function rotBone(b,axW,ang){ b.parent.getWorldQuaternion(_pq); const l=axW.clone().applyQuaternion(_pq.clone().invert()); _q.setFromAxisAngle(l.normalize(),ang); b.quaternion.premultiply(_q); b.updateMatrixWorld(true); }
  function walkPose(S,ph,amp){ if(!S.walkQ) return; LEGS.forEach(n=>{ const b=S.bones[n]; if(b) b.quaternion.copy(S.walkQ[n]); }); S.inner.updateMatrixWorld(true);
    const lat=new V3(1,0,0).applyQuaternion(S.grp.quaternion); /* eje lateral del soldado */
    [['L',0],['R',Math.PI]].forEach(([s,o])=>{ const th=S.bones[s+'_Thigh'], ca=S.bones[s+'_Calf'], ft=S.bones[s+'_Foot']; if(!th||!ca) return; const sw=Math.sin(ph+o);
      rotBone(th,lat,-sw*0.42*amp); const k=Math.max(0,Math.sin(ph+o+1.9))*0.75*amp; rotBone(ca,lat,k); if(ft) rotBone(ft,lat,-k*0.35); });
    S.inner.position.y=Math.abs(Math.cos(ph))*0.025*amp; }
  function moveTo(S,i,dur){ return new Promise(res=>{ const to=coverPos(i,S.side); const from=S.grp.position.clone(); const pts=[from];
      if(i===3){ /* entra en la trinchera: hasta el borde y salta dentro */ const edge=new V3(S.side*(TR.x0+TR.w/2+0.45),0,to.z); pts.push(edge); }
      pts.push(to); S.walk={pts,t:0,dur:dur||3,res,i}; walkStart(S); }); }
  function stepWalk(S,dt){ const W=S.walk; if(!W) return; W.t+=dt; const n=W.pts.length; let f=Math.min(1,W.t/W.dur);
    const ground=W.pts.length===3?0.82:1; let p;
    if(n===3&&f>ground){ /* salto */ const g=(f-ground)/(1-ground); p=W.pts[1].clone().lerp(W.pts[2],g); p.y=W.pts[2].y*(g*g)+Math.sin(g*Math.PI)*0.18; }
    else { const g=f/ground; p=W.pts[0].clone().lerp(W.pts[n===3?1:1],Math.min(1,g)); p.y=0; }
    S.grp.position.copy(p); const dir=W.pts[n-1].clone().sub(W.pts[0]); if(dir.lengthSq()>0.01){ /* mira hacia el enemigo pero inclinado a la marcha: el cuerpo no gira de espaldas */ }
    walkPose(S,W.t*7.5,(n===3&&f>ground)?0.2:1);
    if(f>=1){ walkEnd(S); S.grp.position.copy(W.pts[n-1]); S.walk=null; S.at=W.i; face(S); W.res(); } }
  /* disparo: fogonazo/retroceso/vainas de soldado3d + trazadoras e impactos de la escena */
  function shots(S,list,iv){ const T=other(S); const st=S.FK?S.FK:null; const n=list.length; if(st) st.fire(n,iv);
    const TS_=window.MAT_CB_TS||1; list.forEach((h,i)=>setTimeout(()=>{ if(!SOL.includes(S)) return; const m=muzzle(S)||chestPos(S); const tgt=h.loc==='head'?headPos(T):chestPos(T);
        let end; if(h.hit){ end=tgt.clone().add(new V3((Math.random()-0.5)*0.12,(h.loc==='limb'?-0.45:0)+(Math.random()-0.5)*0.1,(Math.random()-0.5)*0.12)); }
        else { const miss=new V3((Math.random()-0.5)*1.4,(Math.random()-0.35)*1.2,(Math.random()-0.5)*1.6); end=tgt.clone().add(miss); const dir=end.clone().sub(m).normalize(); end=m.clone().add(dir.multiplyScalar(m.distanceTo(tgt)+2+Math.random()*10)); const gy=heightAt(end.x,end.z); if(end.y<gy){ end.y=gy+0.02; } }
        tracer(m,end,S.tr,red?400:230); const fl=m.distanceTo(end)/(red?400:230)/TS_;
        setTimeout(()=>{ if(h.hit){ if(h.stop){ spark(end,18); } else { puff(end,[0.45,0.12,0.1],4); spark(end,5); } if(T.alive&&!red) kick(T,h.stop?0.04:0.07); }
          else { const gy=heightAt(end.x,end.z); puff(new V3(end.x,Math.max(gy,end.y-0.05),end.z),null,6); } },fl*1000); },i*iv*1000/TS_)); return n*iv*1000+300; }
  function kick(S,a){ S.kick={t:0,a}; }
  function stepKick(S,dt){ if(!S.kick) return; S.kick.t+=dt; const f=S.kick.t/0.25; S.inner.rotation.z=(f<1?Math.sin(f*Math.PI)*S.kick.a:0)*-S.side; if(f>=1){ S.inner.rotation.z=0; S.kick=null; } }
  /* fuera de combate: las rodillas ceden, el torso cae hacia delante y el cuerpo queda boca abajo, apoyado en el suelo (posturas clave de soldado3d.js, medidas por vértices);
     el arma se suelta de las manos, cae y queda tumbada en el suelo al lado del cuerpo */
  function fall(S,o){ return new Promise(res=>{ S.alive=false; S.kick=null; S.inner.rotation.set(0,0,0); S.inner.position.set(0,0,0); S.inner.updateMatrixWorld(true);
      const D=S.api&&S.api.death; if(!D){ S.alive=false; res(); return; }
      const K=D.keys({side:(o&&o.side)||1,ang:o&&o.ang}); S.inner.updateMatrixWorld(true); const HD=S.body.parent; HD.updateMatrixWorld(true); const bw=v=>HD.localToWorld(v.clone());
      const qb=HD.getWorldQuaternion(new THREE.Quaternion()); const Fw=K.pts.F.clone().applyQuaternion(qb).setY(0).normalize(), Lw=K.pts.Lx.clone().applyQuaternion(qb).setY(0).normalize();
      S.deadC=bw(K.pts.chest).lerp(bw(K.pts.hip),0.35); S.deadC.y=heightAt(S.deadC.x,S.deadC.z);
      S.fall={t:0,K,D,res,drop:null,hand:bw(K.pts.su<0?K.pts.hL:K.pts.hR),Fw,Lw,su:K.pts.su,cloud:K.pts.cloud}; }); }
  function dropStart(S){ const w=wpnOf(S); if(!w) return null; w.updateMatrixWorld(true); const c=w.clone(true); const rm=[]; c.traverse(o=>{ if(o.name==='mat_beams'||o.name==='mat_bipod') rm.push(o); }); rm.forEach(o=>o.parent&&o.parent.remove(o));
    scene.add(c); w.matrixWorld.decompose(c.position,c.quaternion,c.scale); c.traverse(o=>{ if(o.isMesh) o.castShadow=true; }); w.visible=false;
    const F=S.fall; const sgn=F.su>0?-1:1, side=F.Lw.clone().multiplyScalar(sgn); /* lado del brazo que queda a lo largo del cuerpo */
    const zb=F.Fw.clone().applyAxisAngle(new V3(0,1,0),sgn*0.42).normalize(); const xb=new V3(0,F.su>0?1:-1,0); const yb=new V3().crossVectors(zb,xb).normalize();
    const qF=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xb,yb,zb)); const p0=c.position.clone(), q0=c.quaternion.clone();
    c.quaternion.copy(qF); c.position.set(0,0,0); c.updateMatrixWorld(true); const inv0=c.matrixWorld.clone().invert(); const bl=new THREE.Box3(); c.traverse(o=>{ if(o.isMesh){ if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bl.union(o.geometry.boundingBox.clone().applyMatrix4(inv0.clone().multiply(o.matrixWorld))); } }); bl.expandByScalar(0.015);
    const cloud=F.cloud, Mb=S.body.parent.matrixWorld, v=new V3();
    const place=(lat,fw)=>{ const tgt=F.hand.clone().addScaledVector(side,lat).addScaledVector(F.Fw,fw); c.position.copy(tgt); c.updateMatrixWorld(true); let bb=new THREE.Box3().setFromObject(c,true);
      c.position.x+=tgt.x-(bb.min.x+bb.max.x)/2; c.position.z+=tgt.z-(bb.min.z+bb.max.z)/2; c.updateMatrixWorld(true); bb=new THREE.Box3().setFromObject(c,true);
      const gy=Math.max(heightAt(bb.min.x,bb.min.z),heightAt(bb.max.x,bb.max.z),heightAt(bb.min.x,bb.max.z),heightAt(bb.max.x,bb.min.z)); c.position.y+=gy+0.001-bb.min.y; c.updateMatrixWorld(true);
      if(!cloud) return 0; const inv=c.matrixWorld.clone().invert(); let n=0; for(let i=0;i<cloud.length;i+=3){ v.set(cloud[i],cloud[i+1],cloud[i+2]).applyMatrix4(Mb).applyMatrix4(inv); if(bl.containsPoint(v)) n++; } return n; };
    let best=null; for(const fw of [0.3,0.1,0.5]){ for(let lat=0.22;lat<=0.9;lat+=0.06){ const n=place(lat,fw); if(n===0){ best=[lat,fw]; break; } } if(best) break; } if(!best) best=[0.9,0.3]; const nb=place(best[0],best[1]); S.dropDbg={best,n:nb,cloud:cloud?cloud.length/3:0};
    const pF=c.position.clone(); c.position.copy(p0); c.quaternion.copy(q0); return {c,p0,q0,pF,qF,t:0}; }
  function stepFall(S,dt){ const F=S.fall; if(!F) return; F.t+=dt; const t=F.t, T1=0.36, T2=0.66;
    if(t<T1){ const u=t/T1; F.D.blend(F.K.K0,F.K.K1,u*u*(3-2*u),Math.min(1,u*1.3)); }
    else if(t<T1+T2){ const u=(t-T1)/T2, e=Math.pow(u,1.6); F.D.blend(F.K.K1,F.K.K2,e,Math.min(1,e*1.2)); }
    else if(!F.done){ F.done=true; F.D.end(F.K.K2); if(!red){ puff(S.deadC.clone().addScaledVector(F.Fw,0.3),[0.55,0.48,0.38],9,true); CAM.shake=Math.max(CAM.shake,0.02); } }
    if(!F.drop&&t>0.05) F.drop=dropStart(S)||{none:1};
    const d=F.drop; if(d&&d.c&&d.t<1){ d.t=Math.min(1,d.t+dt/0.5); const u=d.t; d.c.position.set(d.p0.x+(d.pF.x-d.p0.x)*(1-(1-u)*(1-u)),d.p0.y+(d.pF.y-d.p0.y)*(0.3*u+0.7*u*u),d.p0.z+(d.pF.z-d.p0.z)*(1-(1-u)*(1-u))); d.c.quaternion.slerpQuaternions(d.q0,d.qF,u*u*(3-2*u));
      if(u>=1&&!red) puff(d.pF.clone(),[0.55,0.48,0.38],4); }
    if(F.done&&(!d||!d.c||d.t>=1)){ S.fall=null; S.dropped=d&&d.c; F.res(); } }
  /* cámara */
  const CAM={mode:'intro',t:0,from:null,to:null,look:new V3(),pos:new V3(),shake:0}; let camP=new V3(-34,9,16), camL=new V3(0,0.8,0);
  function shotOf(kind,S){ const T=S?other(S):null; const P=S?S.grp.position.clone():new V3(); const sd=S?S.side:-1;
    if(red||kind==='wide'){ return {p:new V3(0,15,26),l:new V3(0,0,0)}; }
    const to=T?T.grp.position.clone().sub(P).setY(0).normalize():new V3(1,0,0); const right=new V3(-to.z,0,to.x);
    const zc=new V3(0,0,Math.abs(P.z)<0.3?sd:-Math.sign(P.z)); /* lado del plano: hacia el centro del mapa, donde no hay coberturas entre la cámara y el soldado */
    const h=S?(S.pose==='tumbado'?0.45:S.pose==='rodilla'?1.0:1.45)+P.y:1;
    if(kind==='intro'){ const k=Math.min(1,CAM.t/5.5), e=k*k*(3-2*k); const A=sA.grp.position; const a=A.clone().add(new V3(-2.6,1.1,-2.4)), b=new V3(-40,11,-8); return {p:a.lerp(b,e),l:A.clone().add(new V3(0.5,0.3,0)).lerp(new V3(4,0,1),e)}; }
    if(kind==='shoulder'){ const rs=right.dot(zc)>0?1:-1; return {p:P.clone().addScaledVector(to,-2.3).addScaledVector(right,0.55*rs).add(new V3(0,h+0.45,0)),l:T.grp.position.clone().add(new V3(0,0.6,0)).addScaledVector(right,-6*rs)}; }
    if(kind==='side'){ return {p:P.clone().addScaledVector(zc,3.3).addScaledVector(to,1.6).add(new V3(0,h+0.25,0)),l:P.clone().addScaledVector(to,0.6).add(new V3(0,h-0.15,0))}; }
    if(kind==='track'){ return {p:P.clone().addScaledVector(zc,6.2).addScaledVector(to,-1.2).add(new V3(0,2.2,0)),l:P.clone().add(new V3(0,0.9,0)).addScaledVector(to,1.5)}; }
    if((kind==='two'||kind==='behind')&&cam.aspect<0.9){ /* móvil en vertical: por detrás del hombro del tirador con óptica larga, el blanco grande al fondo */ const Q=T.grp.position.clone(); const k2=kind==='two'; return {p:P.clone().addScaledVector(to,k2?-3.2:-2.2).addScaledVector(right,k2?-0.95:-0.6).add(new V3(0,h+(k2?0.45:0.3),0)),l:Q.clone().add(new V3(0,0.85,0)),fov:k2?34:26}; }
    if(kind==='victim'){ /* plano medio lateral del que cae (mismo lado que el plano general: no se cruza el eje) */ const dv=cam.aspect<0.9?4.8:3.7; return {p:P.clone().addScaledVector(right,dv).addScaledVector(to,0.55).add(new V3(0,1.35,0)),l:P.clone().addScaledVector(to,0.5).add(new V3(0,0.5,0))}; }
    if(kind==='two'){ const Q=T.grp.position.clone(); const M_=P.clone().add(Q).multiplyScalar(0.5); const D_=P.distanceTo(Q); const k=Math.min(1,CAM.t/4); const hf=2*Math.atan(Math.tan(cam.fov*Math.PI/360)*cam.aspect); const ds=Math.max(5,(D_/2+1.6)/Math.tan(hf/2)); return {p:M_.clone().addScaledVector(right,-ds).addScaledVector(to,-0.8+k*1.0).add(new V3(0,1.6+k*0.3,0)),l:M_.clone().add(new V3(0,0.85,0))}; }
    if(kind==='behind'){ return {p:P.clone().addScaledVector(to,-1.9).addScaledVector(right,-0.62).add(new V3(0,h+0.32,0)),l:T.grp.position.clone().add(new V3(0,1.0,0))}; }
    if(kind==='orbit'){ const C=S&&S.deadC?S.deadC:P; const a=CAM.t*0.3+(sd<0?0:Math.PI); return {p:C.clone().add(new V3(Math.cos(a)*3.4,1.9,Math.sin(a)*3.4)),l:C.clone().add(new V3(0,0.2,0))}; }
    if(kind==='fixed'){ return {p:CAM.fp.clone(),l:CAM.fl.clone()}; }
    return {p:new V3(0,15,26),l:new V3()}; }
  let camShot={kind:'intro',S:null}, camBlend=1;
  function camera(kind,S,cut){ if(window.MAT_CB_CAMLOCK&&kind!=='fixed') return; if(kind==='intro') CAM.t=0; camShot={kind,S}; camBlend=cut||red?1:0; }
  function stepCam(dt){ CAM.t+=dt; const s=shotOf(camShot.kind,camShot.S);
    if(camBlend>=1){ camP.copy(s.p); camL.copy(s.l); } else { camBlend=Math.min(1,camBlend+dt*1.6); const k=1-Math.pow(0.02,dt); camP.lerp(s.p,k*1.4>1?1:k*1.4); camL.lerp(s.l,k*1.6>1?1:k*1.6); }
    /* el plano no atraviesa el terreno ni los muros bajos */ const gy=heightAt(camP.x,camP.z); if(camP.y<gy+0.35) camP.y=gy+0.35;
    { const fv=s.fov||(cam.aspect<0.9?52:42); if(Math.abs(cam.fov-fv)>0.01){ cam.fov=fv; cam.updateProjectionMatrix(); } } cam.position.copy(camP); if(CAM.shake>0&&!red){ cam.position.x+=(Math.random()-0.5)*CAM.shake; cam.position.y+=(Math.random()-0.5)*CAM.shake; CAM.shake*=Math.pow(0.02,dt); } cam.lookAt(camL); }
  /* bucle */
  let alive=true, last=performance.now(), raf=0, fpsT=0, fpsN=0, fpsLow=0, vis=true; const io=new IntersectionObserver(e=>{ vis=e[0].isIntersecting; }); io.observe(host);
  function resize(){ const w=host.clientWidth||300, h=host.clientHeight||300; R.setSize(w,h,false); cam.aspect=w/h; cam.fov=w/h<0.9?52:42; cam.updateProjectionMatrix(); }
  const ro=new ResizeObserver(resize); ro.observe(host); resize();
  function loop(now){ if(!alive) return; raf=requestAnimationFrame(loop); const dt=Math.min(0.05,(now-last)/1000)*(window.MAT_CB_TS||1); last=now; if(!vis||document.hidden) return;
    SOL.forEach(S=>{ stepWalk(S,dt); stepKick(S,dt); stepFall(S,dt); if(S.yawT!=null){ const d=angDiff(S.yawT,S.grp.rotation.y); S.grp.rotation.y+=d*Math.min(1,dt*6); if(Math.abs(d)<0.002) S.yawT=null; } S.V._sync(); });
    stepTracers(dt); sparks.update(dt); dust.update(dt); stepCam(dt); R.render(scene,cam);
    /* resolución adaptable: si va lento, baja la nitidez (como el soldado) */ fpsT+=dt; fpsN++; if(fpsT>2){ const f=fpsN/fpsT; fpsT=0; fpsN=0; if(f<26&&dpr>1){ dpr=Math.max(1,dpr-0.25); R.setPixelRatio(dpr); resize(); } if(f<14) fpsLow++; else fpsLow=0; if(cfg.onSlow&&fpsLow>=2){ cfg.onSlow(f); fpsLow=-999; } } }
  raf=requestAnimationFrame(loop);
  /* listo: los dos soldados con su arma ya cargada en las manos (la carga del arma es asíncrona) */
  function ready(ms){ const t0=performance.now(); return new Promise(res=>{ const ck=()=>{ if(!alive){ res(false); return; } if(SOL.every(S=>S.FK&&wpnOf(S))||performance.now()-t0>(ms||15000)){ SOL.forEach(S=>{ S.grp.updateMatrixWorld(true); face(S,true); }); res(SOL.every(S=>S.FK&&wpnOf(S))); return; } setTimeout(ck,120); }; ck(); }); }
  const tecG=cfg.tec?buildTec(scene):null; if(tecG) tecG.visible=false;
  const api={ R,scene,cam,SOL,A:sA,B:sB,tec:tecG,
    placeTec(S,dead){ if(!tecG) return; const p=S.grp.position; const sx=Math.sign(p.x)||1; const tx=p.x+sx*0.6, tz=p.z+3.6; tecG.position.set(tx,Math.max(0,heightAt(tx,tz)),tz); tecG.rotation.y=sx>0?-Math.PI/2+0.35:Math.PI/2-0.35; const gn=tecG.userData.gun; gn.rotation.y=sx>0?-0.9:0.9; if(dead){ tecG.traverse(o=>{ if(o.isMesh){ o.material=o.material.clone(); o.material.color&&o.material.color.multiplyScalar(0.42); } }); } tecG.visible=true; },setPose,moveTo,shots,fall,camera,face,spark,puff,muzzle,ready,
    fixedCam(p,l){ CAM.fp=new V3().fromArray(p); CAM.fl=new V3().fromArray(l); camera('fixed',null,true); },
    shake(a){ CAM.shake=Math.max(CAM.shake,a); },
    dbg(){ return {dpr,fps:fpsN/Math.max(0.001,fpsT)}; },
    renderNow(){ SOL.forEach(S=>S.V._sync()); stepCam(0); R.render(scene,cam); },
    destroy(){ alive=false; cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); SOL.forEach(S=>{ try{ S.api&&S.api.destroy(); }catch(e){} S.box.remove(); }); scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); }); R.dispose(); try{ R.forceContextLoss(); }catch(e){} R.domElement.remove(); } };
  window.MAT_COMBATE_DBG=api; return api; }
