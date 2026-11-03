
// M.A.T · Duelo 3D (three.js). Figuras: modelo 3D real cuando existe (F-14: FlightGear, GPL v2; Leopard 2: dannzjs; Su-27, Su-35, MiG-29, Tigre, T-72, T-90, M1 Abrams, Arleigh Burke: autores de Sketchfab, CC BY 4.0 — ver #/license);
// si no, recorte de la foto real de cada ficha sobre una silueta extruida.
import * as THREE from './three.module.min.js';
import {GLTFLoader,MeshoptDecoder} from './gltf.min.js';
const VER=(document.querySelector('script[data-v]')||{getAttribute(){return '1';}}).getAttribute('data-v');
// modelos 3D reales disponibles (solo para el modelo exacto o su familia directa)
const LEO={files:['m3d/duelo/leopard2.glb'],kind:'tank'};
// modelos CC BY 4.0 (Sketchfab, ver #/license): solo para su modelo exacto
const MODELS={'grumman-f-14-tomcat':{files:['m3d/f14.glb'],kind:'jet',hide:/^P_(gearR|gearL|ngear)$/},'t-leopard-2':LEO,'t-leopard-2e':LEO,
  'sukhoi-su-27':{files:['m3d/duelo/su27.glb'],kind:'jet',muz:[0.2,0.4]},'sukhoi-su-35':{files:['m3d/duelo/su35.glb'],kind:'jet',muz:[0.2,0.4]},'mikoyan-mig-29':{files:['m3d/duelo/mig29.glb'],kind:'jet',muz:[0.2,0.4]},
  't-t-72':{files:['m3d/duelo/t72.glb'],kind:'tank'},'t-t-90':{files:['m3d/duelo/t90.glb'],kind:'tank'},'t-m1-abrams':{files:['m3d/duelo/m1.glb'],kind:'tank'},
  'eurocopter-tiger':{files:['m3d/duelo/tigre.glb'],kind:'jet',muz:[0.07,0.2]},
  's-arleigh-burke-class-destroyer':{files:['m3d/duelo/ddg51.glb'],kind:'ship',wl:0,muz:[0.2,0.33],lum:1.7}};
const GLB={};
function loadGLB(f){if(!GLB[f]){const l=new GLTFLoader();l.setMeshoptDecoder(MeshoptDecoder);GLB[f]=l.loadAsync(f+'?v='+VER).then(g=>g.scene);}return GLB[f].then(s=>s.clone(true));}
const TAU=Math.PI*2;
function rnd(a,b){return a+Math.random()*(b-a);}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
// ---------- noise ----------
function mkNoise(seed){const p=new Uint8Array(512);let s=seed||1;for(let i=0;i<256;i++)p[i]=i;for(let i=255;i>0;i--){s=(s*16807)%2147483647;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]];}for(let i=0;i<256;i++)p[i+256]=p[i];
  const g=(i,j)=>p[(p[i&255]+j)&255]/255;
  const f=t=>t*t*(3-2*t);
  function n2(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=f(xf),v=f(yf);const a=g(xi,yi),b=g(xi+1,yi),c=g(xi,yi+1),d=g(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;}
  return function fbm(x,y,o){let t=0,a=0.5,fr=1;for(let i=0;i<(o||5);i++){t+=a*n2(x*fr,y*fr);fr*=2.03;a*=0.5;}return t;};}
// ---------- textures ----------
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
function cloudTex(){return canvasTex(128,128,(c,w,h)=>{for(let i=0;i<22;i++){const x=rnd(30,98),y=rnd(40,88),r=rnd(14,34);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}});}
function shaftTex(){return canvasTex(64,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(200,235,255,.55)');g.addColorStop(1,'rgba(200,235,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);const g2=c.createLinearGradient(0,0,w,0);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(.5,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,1)');c.globalCompositeOperation='destination-out';c.fillStyle=g2;c.fillRect(0,0,w,h);});}
function detailTex(){const t=canvasTex(256,256,(c,w,h)=>{const n=mkNoise(31);const id=c.createImageData(w,h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=n(x/18,y/18,4)*0.6+n(x/3.1,y/3.1,2)*0.4;const k=(y*w+x)*4;const g=150+v*105+(Math.random()-0.5)*26;id.data[k]=id.data[k+1]=id.data[k+2]=Math.max(0,Math.min(255,g));id.data[k+3]=255;}c.putImageData(id,0,0);});t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;return t;}
function fieldsTex(){const t=canvasTex(1024,1024,(c,w,h)=>{const P=[[0.30,0.42,0.20],[0.38,0.48,0.22],[0.55,0.52,0.30],[0.62,0.56,0.34],[0.27,0.36,0.18],[0.45,0.40,0.26],[0.50,0.55,0.28],[0.34,0.30,0.20]];
  c.fillStyle='rgb(80,100,55)';c.fillRect(0,0,w,h);const cell=64;
  for(let gy=-1;gy<h/cell+1;gy++)for(let gx=-1;gx<w/cell+1;gx++){const p=P[Math.floor(Math.random()*P.length)];const v=0.85+Math.random()*0.3;c.fillStyle='rgb('+Math.round(p[0]*255*v)+','+Math.round(p[1]*255*v)+','+Math.round(p[2]*255*v)+')';
    const x=gx*cell+rnd(-8,8),y=gy*cell+rnd(-8,8),ww=cell*rnd(0.8,1.6),hh=cell*rnd(0.6,1.3);c.save();c.translate(x,y);c.rotate(rnd(-0.12,0.12));c.fillRect(0,0,ww,hh);
    if(Math.random()<0.5){c.strokeStyle='rgba(0,0,0,0.06)';c.lineWidth=1;for(let k=4;k<hh;k+=4){c.beginPath();c.moveTo(0,k);c.lineTo(ww,k);c.stroke();}}
    c.strokeStyle='rgba(40,60,25,0.55)';c.lineWidth=2;c.strokeRect(0,0,ww,hh);c.restore();}
  for(let k=0;k<22;k++){const fx=rnd(0,w),fy=rnd(0,h),n=4+Math.floor(rnd(0,10));for(let q=0;q<n;q++){c.fillStyle='rgba(40,62,28,'+rnd(0.45,0.75)+')';c.beginPath();c.ellipse(fx+rnd(-40,40),fy+rnd(-26,26),rnd(5,18),rnd(4,12),rnd(0,3),0,TAU);c.fill();}}
  c.strokeStyle='rgba(205,200,185,0.85)';c.lineWidth=2.2;for(let k=0;k<4;k++){c.beginPath();let x=rnd(0,w),y=0;c.moveTo(x,y);while(y<h){x+=rnd(-30,30);y+=rnd(40,90);c.lineTo(x,y);}c.stroke();}
  c.strokeStyle='rgba(70,110,140,0.9)';c.lineWidth=3;c.beginPath();let x=0,y=rnd(200,800);c.moveTo(x,y);while(x<w){x+=rnd(30,70);y+=rnd(-40,40);c.lineTo(x,y);}c.stroke();
  for(let k=0;k<7;k++){const vx=rnd(60,w-60),vy=rnd(60,h-60);for(let q=0;q<26;q++){c.fillStyle=Math.random()<0.6?'rgba(170,90,70,0.9)':'rgba(215,210,200,0.9)';c.fillRect(vx+rnd(-22,22),vy+rnd(-22,22),3,3);}}});
  t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
function starTex(){return canvasTex(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,250,230,1)');g.addColorStop(0.18,'rgba(255,210,120,0.9)');g.addColorStop(0.5,'rgba(255,140,40,0.25)');g.addColorStop(1,'rgba(255,100,20,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
  c.globalCompositeOperation='lighter';for(let k=0;k<6;k++){c.save();c.translate(64,64);c.rotate(k*TAU/6+0.2);const g2=c.createLinearGradient(0,0,60,0);g2.addColorStop(0,'rgba(255,230,160,0.9)');g2.addColorStop(1,'rgba(255,160,60,0)');c.fillStyle=g2;c.beginPath();c.moveTo(0,-5);c.lineTo(60,0);c.lineTo(0,5);c.fill();c.restore();}});}
function ringTex(){return canvasTex(128,128,(c,w,h)=>{const g=c.createRadialGradient(64,64,30,64,64,64);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(0.75,'rgba(255,240,220,0.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});}
function cloudTex2(){return canvasTex(256,160,(c,w,h)=>{for(let i=0;i<34;i++){const x=rnd(56,200),y=rnd(70,104)-Math.max(0,34-Math.abs(x-128)*0.4)*rnd(0,1),r=rnd(16,40);const g=c.createRadialGradient(x,y-r*0.3,0,x,y,r);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(0.6,'rgba(238,242,248,.45)');g.addColorStop(1,'rgba(200,210,225,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
  const s=c.createLinearGradient(0,0,0,h);s.addColorStop(0,'rgba(0,0,0,0)');s.addColorStop(0.7,'rgba(0,0,0,0)');s.addColorStop(1,'rgba(90,100,120,0.35)');c.globalCompositeOperation='source-atop';c.fillStyle=s;c.fillRect(0,0,w,h);});}
// ---------- particles ----------
class Particles{
  constructor(n,additive){this.n=n;this.pos=new Float32Array(n*3);this.col=new Float32Array(n*4);this.size=new Float32Array(n);this.vel=new Float32Array(n*3);this.life=new Float32Array(n);this.max=new Float32Array(n);this.grow=new Float32Array(n);this.grav=new Float32Array(n);this.drag=new Float32Array(n);this.base=new Float32Array(n*4);this.s0=new Float32Array(n);this.cursor=0;
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(this.pos,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('col',new THREE.BufferAttribute(this.col,4).setUsage(THREE.DynamicDrawUsage));g.setAttribute('size',new THREE.BufferAttribute(this.size,1).setUsage(THREE.DynamicDrawUsage));
    this.mat=new THREE.ShaderMaterial({uniforms:{uScale:{value:400}},transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,
      vertexShader:'attribute vec4 col;attribute float size;uniform float uScale;varying vec4 vC;void main(){vC=col;vec4 mv=modelViewMatrix*vec4(position,1.0);float ps=size*uScale/max(0.1,-mv.z);float mx=uScale*0.22;if(ps>mx){vC.a*=mx/ps;ps=mx;}gl_PointSize=ps;gl_Position=projectionMatrix*mv;}',
      fragmentShader:'varying vec4 vC;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d);if(r>0.5)discard;float a=smoothstep(0.5,0.0,r);a*=a;gl_FragColor=vec4(vC.rgb,vC.a*a);}'});
    this.obj=new THREE.Points(g,this.mat);this.obj.frustumCulled=false;this.g=g;}
  spawn(x,y,z,vx,vy,vz,life,size,grow,r,gg,b,a,grav,drag){let i=this.cursor;for(let k=0;k<this.n;k++){const j=(this.cursor+k)%this.n;if(this.life[j]<=0){i=j;break;}}this.cursor=(i+1)%this.n;
    this.pos[i*3]=x;this.pos[i*3+1]=y;this.pos[i*3+2]=z;this.vel[i*3]=vx;this.vel[i*3+1]=vy;this.vel[i*3+2]=vz;this.life[i]=life;this.max[i]=life;this.s0[i]=size;this.grow[i]=grow;this.base[i*4]=r;this.base[i*4+1]=gg;this.base[i*4+2]=b;this.base[i*4+3]=a;this.grav[i]=grav||0;this.drag[i]=drag||0;}
  update(dt){for(let i=0;i<this.n;i++){if(this.life[i]<=0){this.size[i]=0;continue;}this.life[i]-=dt;const t=1-this.life[i]/this.max[i];const dr=Math.max(0,1-this.drag[i]*dt);this.vel[i*3]*=dr;this.vel[i*3+1]=this.vel[i*3+1]*dr-this.grav[i]*dt;this.vel[i*3+2]*=dr;
      this.pos[i*3]+=this.vel[i*3]*dt;this.pos[i*3+1]+=this.vel[i*3+1]*dt;this.pos[i*3+2]+=this.vel[i*3+2]*dt;this.size[i]=this.s0[i]*(1+this.grow[i]*t);
      this.col[i*4]=this.base[i*4];this.col[i*4+1]=this.base[i*4+1];this.col[i*4+2]=this.base[i*4+2];this.col[i*4+3]=this.base[i*4+3]*(t<0.1?t/0.1:1-(t-0.1)/0.9);if(this.life[i]<=0)this.size[i]=0;}
    this.g.attributes.position.needsUpdate=true;this.g.attributes.col.needsUpdate=true;this.g.attributes.size.needsUpdate=true;}
}
// ---------- sound (procedural, off by default) ----------
class Sound{constructor(){this.on=false;this.ctx=null;}
  ensure(){if(!this.ctx){try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){this.ctx=null;}}if(this.ctx&&this.ctx.state==='suspended')this.ctx.resume();return this.ctx;}
  noise(dur){const c=this.ctx,b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=b;return s;}
  play(kind,big){if(!this.on||!this.ensure())return;const c=this.ctx,t=c.currentTime,o=c.createGain();o.connect(c.destination);
    if(kind==='boom'){const s=this.noise(big?2.2:1.2),f=c.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(big?900:1400,t);f.frequency.exponentialRampToValueAtTime(60,t+(big?2:1));s.connect(f);f.connect(o);o.gain.setValueAtTime(big?0.9:0.5,t);o.gain.exponentialRampToValueAtTime(0.001,t+(big?2.1:1.1));s.start(t);
      const osc=c.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(big?70:90,t);osc.frequency.exponentialRampToValueAtTime(30,t+0.6);const g2=c.createGain();g2.gain.setValueAtTime(big?0.8:0.4,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.7);osc.connect(g2);g2.connect(c.destination);osc.start(t);osc.stop(t+0.8);}
    else if(kind==='gun'){const s=this.noise(0.25),f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=big?300:1200;s.connect(f);f.connect(o);o.gain.setValueAtTime(big?0.8:0.35,t);o.gain.exponentialRampToValueAtTime(0.001,t+(big?0.4:0.12));s.start(t);}
    else if(kind==='missile'){const s=this.noise(1.6),f=c.createBiquadFilter();f.type='bandpass';f.Q.value=2;f.frequency.setValueAtTime(400,t);f.frequency.exponentialRampToValueAtTime(2400,t+1.4);s.connect(f);f.connect(o);o.gain.setValueAtTime(0.001,t);o.gain.linearRampToValueAtTime(0.35,t+0.15);o.gain.exponentialRampToValueAtTime(0.001,t+1.5);s.start(t);}
    else if(kind==='splash'){const s=this.noise(0.9),f=c.createBiquadFilter();f.type='highpass';f.frequency.value=800;s.connect(f);f.connect(o);o.gain.setValueAtTime(0.4,t);o.gain.exponentialRampToValueAtTime(0.001,t+0.9);s.start(t);}
  }}
export const sound=new Sound();
export function webglOK(){try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl2')||c.getContext('webgl')));}catch(e){return false;}}
// ---------- main ----------
function visBox(obj,ref){ref=ref||obj;const b=new THREE.Box3(),tb=new THREE.Box3();ref.updateMatrixWorld(true);obj.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(ref.matrixWorld).invert();
  obj.traverse(o=>{if(!o.isMesh)return;let p=o,vis=true;while(p&&p!==obj){if(!p.visible){vis=false;break;}p=p.parent;}if(!vis)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();tb.copy(o.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));b.union(tb);});return b;}
export function create(el,o){
  const mode=o.mode, L={cielo:10,suelo:10,mar:14,sub:13}[o.mode]||10;
  const W0=()=>Math.max(200,el.clientWidth), H0=()=>Math.round(W0()*(W0()<600?0.75:0.5625));
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:window.devicePixelRatio<2,powerPreference:'high-performance'});}catch(e){return null;}
  const OPT=window.MAT_D3OPT||{};const RM=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches), PHONE=W0()<600;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,PHONE?1.35:1.5));renderer.setSize(W0(),H0());renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  el.appendChild(renderer.domElement);renderer.domElement.style.display='block';renderer.domElement.style.width='100%';renderer.domElement.style.height='auto';renderer.domElement.style.touchAction='none';
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(48,W0()/H0(),0.5,6000);
  const noise=mkNoise(7+Math.floor(Math.random()*90));
  const fire=new Particles(PHONE?600:800,true), smoke=new Particles(PHONE?900:1200,false);
  scene.add(smoke.obj);scene.add(fire.obj);
  const sunDir=new THREE.Vector3(0.45,0.65,0.6).normalize();
  const hemi=new THREE.HemisphereLight(0xcfe3ff,0x4a4030,1.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff1d6,2.0);sun.position.copy(sunDir).multiplyScalar(100);scene.add(sun);
  const flash=new THREE.PointLight(0xffaa55,0,120,1.6);scene.add(flash);scene.add(sun.target);
  if(mode==='suelo'&&!OPT.noshadow&&!PHONE){renderer.shadowMap.enabled=true;renderer.shadowMap.type=PHONE?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;sun.castShadow=true;const sc=sun.shadow.camera;sc.left=-46;sc.right=46;sc.top=30;sc.bottom=-30;sc.near=10;sc.far=260;sun.shadow.mapSize.set(PHONE?1024:2048,PHONE?1024:2048);sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.04;sun.shadow.radius=3;}
  let ENV=null;const S={el0:mode==='cielo'?0.26:0.12,rm:RM,camT2:0,intro:RM?0:2.6,res:-1,resA:0,t:0,ts:1,shake:0,units:[],proj:[],camMode:'wide',camT:0,camTarget:new THREE.Vector3(),userUntil:0,az:0,el:mode==='cielo'?0.26:0.12,dist:1,slow:0,dead:[false,false]};
  // sky dome
  function sky(top,bot,sunc){const g=new THREE.SphereGeometry(3000,32,16);const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(top)},bot:{value:new THREE.Color(bot)},sd:{value:sunDir},sc:{value:new THREE.Color(sunc||0xfff2c4)}},
      vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform vec3 top,bot,sc,sd;varying vec3 vP;void main(){float h=clamp(vP.y*1.6+0.12,0.0,1.0);vec3 c=mix(bot,top,pow(h,0.8));float s=max(dot(vP,normalize(sd)),0.0);c+=sc*(pow(s,600.0)*2.5+pow(s,12.0)*0.35);gl_FragColor=vec4(c,1.0);}'});
    const s=new THREE.Mesh(g,m);s.renderOrder=-1;scene.add(s);
    if(!OPT.noenv)try{const pm=new THREE.PMREMGenerator(renderer);const es=new THREE.Scene();es.add(new THREE.Mesh(g,m));es.add(new THREE.HemisphereLight(top,0x5a5040,0.6));ENV=pm.fromScene(es,0.03).texture;pm.dispose();}catch(e){}
    return s;}
  function terrainMesh(size,seg,hfun,colfun,op){op=op||{};const g=new THREE.PlaneGeometry(size,size,seg,seg);g.rotateX(-Math.PI/2);const p=g.attributes.position,uv=g.attributes.uv,cols=new Float32Array(p.count*4),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=hfun(x,z);p.setY(i,y);const a=colfun(c,y,x,z);cols[i*4]=c.r;cols[i*4+1]=c.g;cols[i*4+2]=c.b;cols[i*4+3]=a==null?1:a;if(op.rep)uv.setXY(i,uv.getX(i)*op.rep,uv.getY(i)*op.rep);}
    g.setAttribute('color',new THREE.BufferAttribute(cols,4));g.computeVertexNormals();
    const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:op.map||null});
    if(op.blend){mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#ifdef USE_COLOR_ALPHA\n diffuseColor.rgb=mix(diffuseColor.rgb,vColor.rgb,vColor.a);\n#endif');};}
    return new THREE.Mesh(g,mat);}
  let groundH=()=>-1e9, water=null, waveH=null, terrain=null, clouds=[], shafts=[], bubbles=null, trees=null, bedH=null;
  const SEP={cielo:58,suelo:38,mar:56,sub:50}[mode];
  // ===== scenes =====
  if(mode==='cielo'){
    sky(0x2a68b8,0xcfe4f6);scene.fog=new THREE.Fog(0xb8d3ea,500,3400);
    const base=-160;const hf=(x,z)=>{const y=base+Math.pow(noise(x*0.0016+3,z*0.0016+5,6),1.8)*420-60;const r=Math.abs(z+150);return Math.min(y,-70+Math.max(0,r-250)*0.35);};
    terrain=terrainMesh(8400,PHONE?150:200,hf,(c,y,x,z)=>{const t=(y-base+60)/420;if(t>0.66){c.setRGB(0.47,0.46,0.42);return 1;}if(t>0.52){const k=(t-0.52)/0.14;c.setRGB(0.36+0.1*k,0.35+0.1*k,0.32+0.1*k);return 1;}if(t>0.3){const k=(t-0.3)/0.22;c.setRGB(0.12+0.22*k,0.19+0.15*k,0.10+0.2*k);return Math.min(0.9,0.35+k*1.2);}c.setRGB(1,1,1);return 0;},{map:fieldsTex(),rep:8.4,blend:true});
    scene.add(terrain);groundH=hf;
    const ct=cloudTex2(),cflat=new THREE.PlaneGeometry(1,1);cflat.rotateX(-Math.PI/2);
    for(let i=0;i<(PHONE?16:34);i++){const m=new THREE.Mesh(cflat,new THREE.MeshBasicMaterial({map:ct,transparent:true,depthWrite:false,opacity:rnd(0.55,0.85),fog:true}));const s=rnd(160,420);m.scale.set(s*1.6,1,s);m.position.set(rnd(-2200,2200),rnd(-112,-96),rnd(-2200,300));m.rotation.y=rnd(-0.3,0.3);scene.add(m);clouds.push(m);}
    for(let i=0;i<20;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,depthWrite:false,opacity:rnd(0.55,0.9),fog:true}));const s=rnd(60,180);sp.scale.set(s*1.6,s,1);sp.position.set(rnd(-1500,1500),rnd(-120,90),rnd(-1300,250));if(sp.position.z>-150&&sp.position.y>-70&&sp.position.y<70)sp.position.z-=rnd(300,900);scene.add(sp);clouds.push(sp);}
  } else if(mode==='suelo'){
    sky(0x4f86c2,0xd6e2e6);scene.fog=new THREE.Fog(0xc4d2d6,160,1500);
    const hf=(x,z)=>{let y=(noise(x*0.006+1,z*0.006+2,5)-0.45)*38+(noise(x*0.0015,z*0.0015,3)-0.5)*120*Math.min(1,Math.max(0,(-z-150)/400));const lane=Math.exp(-(z*z)/(2*22*22));let bm=0;for(const sd of [-1,1]){const bx=sd*(SEP/2-L/2-3.4);bm+=1.5*Math.exp(-Math.pow((x-bx)/2.2,2)-Math.pow((z+1)/7,2));}return y*(1-0.85*lane)+bm;};
    terrain=terrainMesh(2400,200,hf,(c,y,x,z)=>{const n=noise(x*0.03,z*0.03,2),m=noise(x*0.004+7,z*0.004,2);c.setRGB(0.27+0.16*n+0.12*m,0.35+0.13*n+0.04*m,0.15+0.05*n);let bm=0;for(const sd of [-1,1]){const bx=sd*(SEP/2-L/2-3.4);bm+=Math.exp(-Math.pow((x-bx)/2.4,2)-Math.pow((z+1)/7.5,2));}if(bm>0.15)c.lerp(new THREE.Color(0.42,0.35,0.25),Math.min(1,bm*1.2));
      const tr=Math.abs(Math.abs(z)-2.2);if(tr<1.4&&Math.abs(x)<420)c.lerp(new THREE.Color(0.50,0.42,0.30),0.75*(1-tr/1.4));if(Math.abs(z)<5&&noise(x*0.05,z*0.2,2)>0.5)c.setRGB(0.52,0.45,0.33);if(y>45)c.setRGB(0.6,0.58,0.54);},{map:OPT.nomap?null:detailTex(),rep:110});
    terrain.receiveShadow=true;scene.add(terrain);groundH=hf;
    // árboles (instanciados): coníferas de 3 pisos y frondosos
    const N=PHONE?260:380,m4=new THREE.Matrix4(),q=new THREE.Quaternion(),v=new THREE.Vector3(),sv=new THREE.Vector3();
    const cg=[0,1,2].map(k=>{const g=new THREE.ConeGeometry(2.4-k*0.55,3.6-k*0.4,8);g.translate(0,2.6+k*1.7,0);return g;});
    const conMat=new THREE.MeshLambertMaterial({color:0x2c4426}),blobMat=new THREE.MeshLambertMaterial({color:0x3d5a2b,flatShading:true}),trunkMat=new THREE.MeshLambertMaterial({color:0x4a3a28});
    const tk=new THREE.CylinderGeometry(0.28,0.42,3,6);tk.translate(0,1.5,0);const bg=new THREE.IcosahedronGeometry(2.6,1);bg.translate(0,4.6,0);
    const cones=cg.map(g=>new THREE.InstancedMesh(g,conMat,N)),blobs=new THREE.InstancedMesh(bg,blobMat,N),trunks=new THREE.InstancedMesh(tk,trunkMat,N*2);let kc=0,kb=0,kt=0;const col=new THREE.Color();
    for(let i=0;i<N*4&&(kc<N||kb<N);i++){const x=rnd(-700,700),z=rnd(-700,160);if(z>-24&&Math.abs(x)<260)continue;if(Math.abs(z)<14)continue;if(noise(x*0.01+9,z*0.01,2)<0.48)continue;const s=rnd(0.7,1.5),y=hf(x,z)-0.3;
      q.setFromEuler(new THREE.Euler(0,rnd(0,TAU),0));m4.compose(v.set(x,y,z),q,sv.set(s,s*rnd(0.85,1.3),s));
      if(Math.random()<0.55&&kc<N){cones.forEach(c=>c.setMatrixAt(kc,m4));col.setHSL(0.27+rnd(-0.03,0.03),0.35,0.2+rnd(-0.04,0.05));cones.forEach(c=>c.setColorAt(kc,col));kc++;}else if(kb<N){blobs.setMatrixAt(kb,m4);col.setHSL(0.24+rnd(-0.04,0.05),0.4,0.26+rnd(-0.05,0.06));blobs.setColorAt(kb,col);kb++;}else continue;
      if(kt<N*2){trunks.setMatrixAt(kt,m4);kt++;}}
    cones.forEach(c=>{c.count=kc;scene.add(c);});blobs.count=kb;trunks.count=kt;scene.add(blobs);scene.add(trunks);trees=blobs;
    // cobertura: parapetos de tierra delante de cada carro, rocas y ruinas al fondo
        const rg=new THREE.DodecahedronGeometry(1,1);const rocks=new THREE.InstancedMesh(rg,new THREE.MeshLambertMaterial({color:0x77706a,flatShading:true}),110);let kr=0;
    for(let i=0;i<400&&kr<110;i++){const x=rnd(-260,260),z=rnd(-260,60);if(Math.abs(z)<7)continue;if(z>6&&Math.abs(x)<200)continue;const s=rnd(0.4,2.4);q.setFromEuler(new THREE.Euler(rnd(0,3),rnd(0,3),rnd(0,3)));m4.compose(v.set(x,hf(x,z)-s*0.3,z),q,sv.set(s*rnd(0.8,1.5),s*rnd(0.5,0.9),s));rocks.setMatrixAt(kr++,m4);}
    rocks.count=kr;rocks.receiveShadow=true;scene.add(rocks);

  } else if(mode==='mar'){
    sky(0x3f78b4,0xd9e6ef);scene.fog=new THREE.Fog(0xc8d8e4,200,2600);
    const WV=[[0.07,0.9,1.0,0.6],[0.11,0.55,-0.35,0.9],[0.19,0.28,0.8,-0.5],[0.31,0.14,-0.6,-0.8]];
    waveH=(x,z,t)=>{let y=0;for(const w of WV){const d=(x*w[2]+z*w[3]);y+=Math.sin(d*w[0]+t*(0.9+w[0]*4))*w[1];}return y;};
    const g=new THREE.PlaneGeometry(5000,5000,220,220);g.rotateX(-Math.PI/2);
    const vs='uniform float t;varying vec3 vW;varying vec3 vN;varying float vH;'+
      'float h(vec2 p){float y=0.0;'+WV.map(w=>'y+=sin(('+'p.x*'+w[2].toFixed(3)+'+p.y*'+w[3].toFixed(3)+')*'+w[0].toFixed(3)+'+t*'+(0.9+w[0]*4).toFixed(3)+')*'+w[1].toFixed(3)+';').join('')+'return y;}'+
      'void main(){vec4 wp=modelMatrix*vec4(position,1.0);float y=h(wp.xz);float e=0.6;vN=normalize(vec3(h(wp.xz-vec2(e,0.0))-h(wp.xz+vec2(e,0.0)),2.0*e,h(wp.xz-vec2(0.0,e))-h(wp.xz+vec2(0.0,e))));wp.y+=y;vH=y;vW=wp.xyz;gl_Position=projectionMatrix*viewMatrix*wp;}';
    const fs='uniform vec3 deep,shal,skyc,sd,fogc;uniform float fn,ff;varying vec3 vW;varying vec3 vN;varying float vH;void main(){vec3 v=normalize(cameraPosition-vW);vec3 n=normalize(vN+vec3(0.0,0.0,0.0));float fr=pow(1.0-max(dot(n,v),0.0),3.0);vec3 c=mix(deep,shal,clamp(vH*0.25+0.45,0.0,1.0));c=mix(c,skyc,fr*0.75);vec3 r=reflect(-normalize(sd),n);c+=vec3(1.0,0.95,0.8)*pow(max(dot(r,v),0.0),120.0)*1.4;c+=vec3(0.9)*smoothstep(1.3,1.9,vH)*0.35;float d=length(cameraPosition-vW);c=mix(c,fogc,smoothstep(fn,ff,d));gl_FragColor=vec4(c,1.0);}';
    water=new THREE.Mesh(g,new THREE.ShaderMaterial({uniforms:{t:{value:0},deep:{value:new THREE.Color(0x0b3a5c)},shal:{value:new THREE.Color(0x2c7da0)},skyc:{value:new THREE.Color(0xbcd4e6)},sd:{value:sunDir},fogc:{value:new THREE.Color(0xc8d8e4)},fn:{value:200},ff:{value:2600}},vertexShader:vs,fragmentShader:fs}));
    scene.add(water);
    // distant coast
    const coast=terrainMesh(900,60,(x,z)=>Math.max(-8,(noise(x*0.01,z*0.01,4)-0.35)*120-Math.hypot(x,z)*0.12),(c,y)=>{if(y>30)c.setRGB(0.45,0.45,0.42);else c.setRGB(0.3,0.38,0.27);});
    coast.position.set(-900,-6,-1500);scene.add(coast);
    const ct=cloudTex();for(let i=0;i<24;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,depthWrite:false,opacity:0.8}));const s=rnd(120,300);sp.scale.set(s*1.8,s,1);sp.position.set(rnd(-2200,2200),rnd(160,420),rnd(-2400,-600));scene.add(sp);clouds.push(sp);}
  } else {
    scene.background=new THREE.Color(0x0a3352);scene.fog=new THREE.FogExp2(0x0a3352,0.0085);hemi.color.set(0x7fb8e0);hemi.groundColor.set(0x0a1a22);hemi.intensity=1.0;sun.intensity=0.9;sun.color.set(0x9fd0ff);
    bedH=(x,z)=>-34+(noise(x*0.02+4,z*0.02+1,5)-0.5)*14+(noise(x*0.004,z*0.004,3)-0.5)*30;
    terrain=terrainMesh(1400,140,bedH,(c,y,x,z)=>{const n=noise(x*0.08,z*0.08,2);c.setRGB(0.42+0.15*n,0.38+0.12*n,0.27+0.08*n);});scene.add(terrain);groundH=bedH;
    const rg=new THREE.DodecahedronGeometry(1,0);const rocks=new THREE.InstancedMesh(rg,new THREE.MeshStandardMaterial({color:0x3e4a44,roughness:1,flatShading:true}),160);const m4=new THREE.Matrix4();
    for(let i=0;i<160;i++){const x=rnd(-400,400),z=rnd(-400,120),s=rnd(0.8,4.5);m4.compose(new THREE.Vector3(x,bedH(x,z),z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(0,3),rnd(0,3),0)),new THREE.Vector3(s,s*rnd(0.5,1),s*rnd(0.7,1.3)));rocks.setMatrixAt(i,m4);}scene.add(rocks);
    const st=shaftTex();for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(rnd(10,26),140),new THREE.MeshBasicMaterial({map:st,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:rnd(0.18,0.4),side:THREE.DoubleSide,fog:false}));m.position.set(rnd(-160,160),40,rnd(-200,20));m.rotation.z=rnd(-0.35,-0.15);m.rotation.y=rnd(-0.5,0.5);scene.add(m);shafts.push(m);}
    const surf=new THREE.Mesh(new THREE.PlaneGeometry(3000,3000),new THREE.MeshBasicMaterial({color:0x4fa3d8,transparent:true,opacity:0.5,side:THREE.DoubleSide,fog:true}));surf.rotation.x=Math.PI/2;surf.position.y=60;scene.add(surf);
    // ambient bubbles/plankton
    for(let i=0;i<160;i++) smoke.spawn(rnd(-120,120),rnd(-30,50),rnd(-120,40),0,rnd(0.5,2),0,rnd(6,18),rnd(0.3,0.8),0,0.75,0.9,1,0.35,-0.05,0);
  }
  // ===== units =====
  const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
  function genericShape(){const s=new THREE.Shape();if(mode==='cielo'){s.moveTo(-0.5,0);s.lineTo(0.5,0.02);s.lineTo(0.35,0.06);s.lineTo(-0.35,0.08);s.lineTo(-0.48,0.3);s.lineTo(-0.5,0.08);}else if(mode==='suelo'){s.moveTo(-0.5,-0.12);s.lineTo(0.5,-0.12);s.lineTo(0.5,0.02);s.lineTo(0.2,0.04);s.lineTo(0.15,0.12);s.lineTo(0.62,0.12);s.lineTo(0.62,0.15);s.lineTo(0.1,0.17);s.lineTo(-0.2,0.17);s.lineTo(-0.25,0.04);s.lineTo(-0.5,0.02);}else if(mode==='mar'){s.moveTo(-0.5,-0.06);s.lineTo(0.42,-0.06);s.lineTo(0.5,0.05);s.lineTo(0.15,0.05);s.lineTo(0.1,0.16);s.lineTo(-0.15,0.16);s.lineTo(-0.2,0.05);s.lineTo(-0.5,0.05);}else{s.absellipse(0,0,0.5,0.08,0,TAU);}return {shape:s,h:0.3};}
  function buildUnit(i,u){
    const grp=new THREE.Group(),inner=new THREE.Group();grp.add(inner);scene.add(grp);
    const sil=u.sil;let w=L,h,mesh;
    if(sil){const bw=sil[4],bh=sil[5];h=w*bh/bw;if(h>w*0.75){h=w*0.75;w=h*bw/bh;}
      // contorno suavizado (Chaikin x2): la silueta viene en una rejilla de 200 pasos y se veía escalonada
      let sp=[];for(let k=7;k<sil.length;k+=2) sp.push([sil[k],sil[k+1]]);
      for(let it=0;it<2&&sp.length>2;it++){const q=[];for(let k=0;k<sp.length;k++){const a=sp[k],b=sp[(k+1)%sp.length];q.push([a[0]*0.75+b[0]*0.25,a[1]*0.75+b[1]*0.25],[a[0]*0.25+b[0]*0.75,a[1]*0.25+b[1]*0.75]);}sp=q;}
      const pts=sp.map(s=>new THREE.Vector2(-w/2+s[0]/200*w, h/2-s[1]/200*h));
      const shape=new THREE.Shape(pts);const depth=mode==='cielo'?w*0.03:mode==='suelo'?w*0.045:w*0.035;
      const geo=new THREE.ExtrudeGeometry(shape,{depth:depth,bevelEnabled:false,curveSegments:1});geo.translate(0,0,-depth/2);
      const uv=geo.attributes.uv,p=geo.attributes.position,iw=sil[0],ih=sil[1];
      for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k);const px=sil[2]+((x+w/2)/w)*bw,py=sil[3]+((h/2-y)/h)*bh;uv.setXY(k,px/iw,1-py/ih);}
      const mat=new THREE.MeshStandardMaterial({color:0x777777,roughness:0.7,metalness:0.1,emissive:0x000000});mat.envMapIntensity=0.4;
      // paredes laterales del recorte: color liso (media de la foto) en vez de píxeles estirados
      const side=new THREE.MeshStandardMaterial({color:{cielo:0x5d646c,suelo:0x4d4f3f,mar:0x6b7178,sub:0x2c3136}[mode],roughness:0.75,metalness:0.15});
      mesh=new THREE.Mesh(geo,[mat,side]);mesh.castShadow=true;mesh.visible=false;const mshow=()=>{mesh.visible=true;};setTimeout(mshow,9000);
      loader.load(u.img,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;mat.map=t;mat.emissiveMap=t;mat.emissive.setRGB(0.42,0.42,0.42);mat.userData.em=0.42;mat.color.set(0xffffff);
        // borde difuminado: máscara alfa con la silueta suavizada y un desenfoque de ~1,5 px (sin dientes de sierra ni restos del fondo)
        try{const im=t.image,cw=Math.min(1024,im.width||iw),chh=Math.max(8,Math.round(cw*ih/iw)),ac=document.createElement('canvas');ac.width=cw;ac.height=chh;const ax=ac.getContext('2d');ax.fillStyle='#000';ax.fillRect(0,0,cw,chh);const kx=cw/iw,ky=chh/ih,fb=Math.max(1,cw/700);
          const path=()=>{ax.beginPath();sp.forEach((s,k)=>{const X=(sil[2]+s[0]/200*bw)*kx,Y=(sil[3]+s[1]/200*bh)*ky;if(k)ax.lineTo(X,Y);else ax.moveTo(X,Y);});ax.closePath();};
          if('filter' in ax){ax.filter='blur('+(1.6*fb).toFixed(2)+'px)';}ax.fillStyle='#fff';path();ax.fill();ax.filter='none';ax.strokeStyle='#000';ax.lineWidth=1.2*fb;ax.globalAlpha=0.55;path();ax.stroke();ax.globalAlpha=1;
          const at=new THREE.CanvasTexture(ac);at.colorSpace=THREE.NoColorSpace;at.anisotropy=4;mat.alphaMap=at;mat.transparent=true;mat.alphaTest=0.02;}catch(e){}
        mat.needsUpdate=true;mshow();
        try{const im=t.image,c=document.createElement('canvas');c.width=c.height=16;const cx=c.getContext('2d');cx.drawImage(im,sil[2],sil[3],bw,bh,0,0,16,16);const d=cx.getImageData(0,0,16,16).data;let r=0,g=0,b=0,n=0;for(let k=0;k<d.length;k+=4){const l=d[k]+d[k+1]+d[k+2];if(l>60&&l<690){r+=d[k];g+=d[k+1];b+=d[k+2];n++;}}if(n>10){side.color.setRGB(r/n/255*0.8,g/n/255*0.8,b/n/255*0.8,THREE.SRGBColorSpace);}}catch(e){}},undefined,mshow);
    } else {const g=genericShape();h=w*g.h;const geo=new THREE.ExtrudeGeometry(g.shape,{depth:0.12,bevelEnabled:false});geo.scale(w,w,1);geo.translate(0,0,-0.06*w);geo.computeBoundingBox();const bb=geo.boundingBox;geo.translate(0,-(bb.max.y+bb.min.y)/2,0);h=(bb.max.y-bb.min.y)*1;mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x4a5058,roughness:0.6,metalness:0.4}));}
    const flip=(u.face===-1?-1:1)*u.dir; if(flip<0){mesh.scale.x=-1;mesh.material.side=THREE.DoubleSide;}
    inner.add(mesh);
    const x=u.dir>0?-SEP/2:SEP/2;
    const U={i,g:grp,inner,mesh,w,h,x,z:0,dir:u.dir,hp:1,dead:false,phase:rnd(0,6),vy:0,fall:0,rec:0,burn:0,yk:0.46,model:null};
    const MD=!OPT.nomodel&&u.id&&MODELS[u.id];
    if(MD){Promise.all(MD.files.map(loadGLB)).then(roots=>{if(!alive)return;const root=new THREE.Group();roots.forEach(r=>root.add(r));
      const mats=[];root.traverse(o=>{if(MD.hide&&MD.hide.test(o.name))o.visible=false;if(o.isMesh){o.castShadow=true;o.receiveShadow=mode==='suelo';const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach((m,k)=>{const c=m.clone();if(MD.lum&&c.color)c.color.multiplyScalar(MD.lum);c.userData.c0=c.color?c.color.clone():null;if(ENV&&'envMap' in c){c.envMap=ENV;c.envMapIntensity=1.0;}if(Array.isArray(o.material))o.material[k]=c;else o.material=c;mats.push(c);});}});
      const bb=visBox(root),len=bb.max.x-bb.min.x,sc=L*(MD.kind==='tank'?1.05:1.0)/len;root.scale.setScalar(sc);
      const holder=new THREE.Group();holder.add(root);holder.rotation.y=u.dir>0?Math.PI:0;
      root.position.set(-(bb.min.x+bb.max.x)/2*sc,-(bb.min.y+bb.max.y)/2*sc,-(bb.min.z+bb.max.z)/2*sc);
      U.h=(bb.max.y-bb.min.y)*sc;U.yk=0.5;U.model={root,holder,mats,sc,kind:MD.kind,k:len/12.74,wl:MD.wl!=null?(MD.wl-(bb.min.y+bb.max.y)/2)*sc:null};
      if(MD.kind==='tank'){const gun=root.getObjectByName('gun');if(gun){const gb=visBox(gun,root);U.model.gun=gun;U.model.gun0=gun.position.clone();U.model.muz=new THREE.Vector3(gb.min.x,(gb.min.y+gb.max.y)/2,(gb.min.z+gb.max.z)/2);}
        if(root.getObjectByName('turret_body')){const tur=new THREE.Group();['turret_body','turret_kit','gun'].forEach(n=>{const o=root.getObjectByName(n);if(o)tur.add(o);});root.add(tur);U.model.tur=tur;}}
      else if(MD.muz) U.model.muz=new THREE.Vector3(bb.min.x+len*MD.muz[0],bb.min.y+(bb.max.y-bb.min.y)*MD.muz[1],(bb.min.z+bb.max.z)/2);
      else U.model.muz=new THREE.Vector3(bb.min.x+3.2,(bb.min.y+bb.max.y)/2-0.6,0);
      inner.remove(mesh);inner.add(holder);U.mesh.visible=false;if(U.dead)kill(U.i);}).catch(()=>{});}
    if(mode==='cielo'){U.y0=i?10:-4;U.z=i?-10:8;}
    else if(mode==='sub'){U.y0=i?6:-2;U.z=i?-8:6;}
    else U.z=0;
    if(mode==='suelo'){const bt=canvasTex(64,64,(c,w,h)=>{const g=c.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(0,0,0,0.85)');g.addColorStop(0.55,'rgba(0,0,0,0.45)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
      const bl=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:bt,transparent:true,depthWrite:false,opacity:renderer.shadowMap.enabled?0.35:0.6,polygonOffset:true,polygonOffsetFactor:-2}));bl.rotation.x=-Math.PI/2;bl.scale.set(w*1.15,w*0.62,1);scene.add(bl);U.blob=bl;}
    S.units.push(U);return U;}
  o.units.forEach((u,i)=>buildUnit(i,u));
  function muzzle(U){if(U.model&&U.model.muz){U.g.updateMatrixWorld(true);return U.model.root.localToWorld(U.model.muz.clone());}return new THREE.Vector3(U.x+U.dir*U.w*0.45,U.g.position.y+(mode==='suelo'?U.h*0.15:0),U.z);}
  function center(U){return new THREE.Vector3(U.x,U.g.position.y,U.z);}
  // ===== effects =====
  function boom(p,big,kind){const n=big?90:45;for(let k=0;k<n;k++){const a=rnd(0,TAU),b=rnd(-0.4,1),sp=rnd(4,big?26:16);fire.spawn(p.x,p.y,p.z,Math.cos(a)*sp*Math.cos(b),Math.sin(b)*sp+3,Math.sin(a)*sp*Math.cos(b),rnd(0.3,big?1.1:0.7),rnd(0.9,big?2.6:1.8),1.4,1,rnd(0.4,0.75),rnd(0.08,0.25),0.85,mode==='sub'?-2:2,2.5);}
    for(let k=0;k<(big?60:26);k++){const a=rnd(0,TAU);smoke.spawn(p.x+rnd(-1,1),p.y+rnd(-1,1),p.z+rnd(-1,1),Math.cos(a)*rnd(2,8),rnd(2,7),Math.sin(a)*rnd(2,8),rnd(1.5,big?4.5:3),rnd(1.2,2.5),big?3:2.2,0.16,0.15,0.14,0.5,-0.6,0.8);}
    for(let k=0;k<(big?30:12);k++) fire.spawn(p.x,p.y,p.z,rnd(-20,20),rnd(5,25),rnd(-20,20),rnd(0.6,1.4),0.35,0,1,0.85,0.4,1,mode==='sub'?3:18,0.3);
    if(mode!=='sub'){debris(p,big?(PHONE?22:32):8,big?20:11);mflash(p,big?22:11,big?0.22:0.14);if(big)for(let k=0;k<3;k++)setTimeout(()=>{if(alive){const q=p.clone().add(new THREE.Vector3(rnd(-2.5,2.5),rnd(0,2),rnd(-1.5,1.5)));mflash(q,rnd(7,12),0.16);for(let j=0;j<20;j++)fire.spawn(q.x,q.y,q.z,rnd(-6,6),rnd(1,9),rnd(-6,6),rnd(0.4,0.9),rnd(1,2),1.2,1,rnd(0.4,0.7),0.12,0.9,-2,1.5);}},260+k*rnd(180,320));}
    
    flash.position.copy(p);flash.intensity=big?900:300;S.shake=Math.max(S.shake,S.rm?0:(big?1.4:0.6));sound.play('boom',big);}
  function sparks(p){for(let k=0;k<40;k++) fire.spawn(p.x,p.y,p.z,rnd(-16,16),rnd(2,16),rnd(-16,16),rnd(0.2,0.6),rnd(0.2,0.4),0,1,0.9,0.5,1,25,0.5);mflash(p,5,0.08);for(let k=0;k<8;k++)smoke.spawn(p.x,p.y,p.z,rnd(-2,2),rnd(0,2),rnd(-2,2),rnd(0.8,1.6),rnd(0.6,1.1),2,0.45,0.43,0.4,0.5,-0.3,0.8);flash.position.copy(p);flash.intensity=120;sound.play('gun',false);}
  function splash(p,big){for(let k=0;k<(big?120:60);k++){const a=rnd(0,TAU),r=rnd(0,1.6);smoke.spawn(p.x+Math.cos(a)*r,p.y,p.z+Math.sin(a)*r,Math.cos(a)*rnd(0.5,3),rnd(8,big?30:20),Math.sin(a)*rnd(0.5,3),rnd(0.8,1.8),rnd(0.8,1.8),1.5,0.92,0.96,1,0.85,22,0.2);}sound.play('splash');}
  function dirt(p){for(let k=0;k<50;k++){const a=rnd(0,TAU);smoke.spawn(p.x,p.y,p.z,Math.cos(a)*rnd(1,6),rnd(6,18),Math.sin(a)*rnd(1,6),rnd(0.8,1.6),rnd(1,2),1.5,0.36,0.3,0.22,0.9,16,0.3);}}
  function puff(p){for(let k=0;k<20;k++) smoke.spawn(p.x+rnd(-2,2),p.y+rnd(-2,2),p.z+rnd(-2,2),rnd(-1,1),rnd(-1,1),rnd(-1,1),rnd(1.5,3),rnd(2,3.5),1.5,0.2,0.2,0.22,0.7,0,0.5);fire.spawn(p.x,p.y,p.z,0,0,0,0.25,4,0.5,1,0.7,0.3,1,0,0);}
  // misil: cuerpo, ojiva y aletas (a lo largo de +x)
  const projGeo=new THREE.CylinderGeometry(0.11,0.11,2.0,10);projGeo.rotateZ(Math.PI/2);const projMat=new THREE.MeshLambertMaterial({color:0xe2e2dc});
  function missileMesh(){const g=new THREE.Group();g.add(new THREE.Mesh(projGeo,projMat));const nose=new THREE.Mesh(new THREE.ConeGeometry(0.11,0.42,10),new THREE.MeshStandardMaterial({color:0x8d9097,metalness:0.3,roughness:0.5}));nose.rotation.z=-Math.PI/2;nose.position.x=1.2;g.add(nose);
    const fm=new THREE.MeshStandardMaterial({color:0xc9c9c2,metalness:0.3,roughness:0.5});for(let k=0;k<4;k++){const f=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.42,0.025),fm);f.position.set(-0.8,0,0);f.rotation.x=k*Math.PI/2;f.translateY(0.2);g.add(f);const c=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.2,0.02),fm);c.position.set(0.55,0,0);c.rotation.x=k*Math.PI/2+Math.PI/4;c.translateY(0.14);g.add(c);}
    const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:STAR,color:0xffc070,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));gl.scale.set(1.6,1.6,1);gl.position.x=-1.15;g.add(gl);return g;}
  // fogonazos, onda expansiva, trazadoras y restos
  const STAR=starTex(),RING=ringTex();
  const flashes=[];for(let k=0;k<8;k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:STAR,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.visible=false;scene.add(sp);flashes.push({sp,t:0,d:0.1,s:1});}
  function mflash(p,s,d){const f=flashes.find(f=>f.t<=0)||flashes[0];f.sp.position.copy(p);f.s=s;f.d=d||0.09;f.t=f.d;f.sp.material.rotation=rnd(0,TAU);f.sp.visible=true;}
  const rings=[];for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:RING,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));m.visible=false;scene.add(m);rings.push({m,t:0,s:1,flat:false});}
  function shock(p,s,flat){if(S.rm)return;const r=rings.find(r=>r.t<=0)||rings[0];r.m.position.copy(p);r.t=0.55;r.s=s;r.flat=flat;r.m.visible=true;if(flat){r.m.rotation.set(-Math.PI/2,0,0);r.m.position.y+=0.3;}}
  const trGeo=new THREE.CylinderGeometry(0.06,0.06,1,5);trGeo.rotateZ(Math.PI/2);trGeo.translate(-0.5,0,0);
  const DN=PHONE?70:110,deb=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.3,0),new THREE.MeshStandardMaterial({color:0x3a352e,roughness:0.9,metalness:0.2}),DN);deb.frustumCulled=false;deb.castShadow=true;scene.add(deb);
  const DB={p:new Float32Array(DN*3),v:new Float32Array(DN*3),r:new Float32Array(DN*3),w:new Float32Array(DN*3),l:new Float32Array(DN),s:new Float32Array(DN),k:0};
  const dm4=new THREE.Matrix4(),dq=new THREE.Quaternion(),de=new THREE.Euler(),dv=new THREE.Vector3(),ds=new THREE.Vector3();
  function debris(p,n,sp){for(let j=0;j<n;j++){const i=DB.k++%DN;const a=rnd(0,TAU),b=rnd(0.2,1.3),v=rnd(sp*0.4,sp);DB.p[i*3]=p.x;DB.p[i*3+1]=p.y;DB.p[i*3+2]=p.z;DB.v[i*3]=Math.cos(a)*Math.cos(b)*v;DB.v[i*3+1]=Math.sin(b)*v;DB.v[i*3+2]=Math.sin(a)*Math.cos(b)*v;for(let q=0;q<3;q++){DB.r[i*3+q]=rnd(0,6);DB.w[i*3+q]=rnd(-9,9);}DB.l[i]=rnd(2.5,4);DB.s[i]=rnd(0.25,0.85);}}
  function updDebris(dt){for(let i=0;i<DN;i++){if(DB.l[i]<=0){dm4.makeScale(0,0,0);deb.setMatrixAt(i,dm4);continue;}DB.l[i]-=dt;DB.v[i*3+1]-=dt*16;for(let q=0;q<3;q++){DB.p[i*3+q]+=DB.v[i*3+q]*dt;DB.r[i*3+q]+=DB.w[i*3+q]*dt;}
      const gy=mode==='mar'?-1:mode==='cielo'?-1e9:groundH(DB.p[i*3],DB.p[i*3+2])+0.15;if(DB.p[i*3+1]<gy){DB.p[i*3+1]=gy;DB.v[i*3+1]*=-0.25;DB.v[i*3]*=0.5;DB.v[i*3+2]*=0.5;for(let q=0;q<3;q++)DB.w[i*3+q]*=0.5;if(mode==='mar')DB.l[i]=Math.min(DB.l[i],0.2);}
      if(mode!=='cielo'&&mode!=='mar'&&mode!=='sub'&&DB.l[i]>0.3&&Math.random()<0.04)smoke.spawn(DB.p[i*3],DB.p[i*3+1],DB.p[i*3+2],0,rnd(0.5,1.5),0,rnd(0.8,1.6),rnd(0.3,0.6),2,0.12,0.12,0.12,0.5,-0.3,0.2);
      const sc=DB.s[i]*Math.min(1,DB.l[i]*2);de.set(DB.r[i*3],DB.r[i*3+1],DB.r[i*3+2]);dq.setFromEuler(de);dm4.compose(dv.set(DB.p[i*3],DB.p[i*3+1],DB.p[i*3+2]),dq,ds.set(sc,sc*0.4,sc*0.75));deb.setMatrixAt(i,dm4);}
    deb.instanceMatrix.needsUpdate=true;
    flashes.forEach(f=>{if(f.t>0){f.t-=dt;const k=Math.max(0,f.t/f.d);f.sp.scale.setScalar(f.s*(0.6+0.6*(1-k)));f.sp.material.opacity=k;if(f.t<=0)f.sp.visible=false;}});
    rings.forEach(r=>{if(r.t>0){r.t-=dt;const k=1-r.t/0.55;r.m.scale.setScalar(r.s*(0.2+k*1.8));r.m.material.opacity=(1-k)*0.55;if(!r.flat)r.m.quaternion.copy(cam.quaternion);if(r.t<=0)r.m.visible=false;}});}
  const KIND=k=>({bvr:'missile',wvr:'missile',ashm:'missile',sub_ashm:'missile',ashm_weak:'missile',atgm:'missile',atgm_air:'missile',rk:'rocket',rk_air:'rocket',torp:'torp',art:'arc',mg:'burst',ac:'burst',gun_air:'burst'}[k]||'shell');
  function fireShot(ev,cb){
    const sU=S.units[ev.s],tU=S.units[1-ev.s];const kind=KIND(ev.k);
    const from=muzzle(sU),tc=center(tU);
    const to=ev.hit?tc.clone().add(new THREE.Vector3(rnd(-0.2,0.2)*tU.w,rnd(-0.15,0.15)*tU.h,0)):tc.clone().add(new THREE.Vector3(-tU.dir*rnd(4,10),mode==='mar'?-tU.g.position.y:(mode==='suelo'?-tU.h*0.4:rnd(5,12)),rnd(-6,6)));
    if(!ev.hit&&mode==='suelo'){to.y=groundH(to.x,to.z);} if(!ev.hit&&mode==='mar'){to.y=0;}
    if(kind==='torp'){from.y=mode==='mar'?-0.6:from.y-1;to.y=mode==='mar'?(ev.hit?tU.g.position.y-tU.h*0.25:-0.6):to.y;}
    const dist=from.distanceTo(to);
    const dur={missile:clamp(dist/26,1.6,3.2),rocket:1.1,torp:clamp(dist/16,2.2,4),arc:2.2,burst:0.35,shell:0.45}[kind];
    const n=kind==='burst'?7:kind==='rocket'?4:1;let left=n;
    // muzzle flash
    fire.spawn(from.x,from.y,from.z,sU.dir*6,1,0,0.15,kind==='shell'||kind==='arc'?5:2.5,1,1,0.85,0.5,1,0,0);
    for(let k=0;k<(kind==='shell'||kind==='arc'?18:6);k++) smoke.spawn(from.x,from.y,from.z,sU.dir*rnd(2,8),rnd(0,3),rnd(-2,2),rnd(1,2.2),rnd(0.8,1.6),2,0.7,0.7,0.68,0.5,-0.4,1.2);
    const big=kind==='shell'||kind==='arc';mflash(from,big?9:kind==='burst'?3.5:4.5,big?0.12:0.07);
    if(big&&mode==='suelo'){const gy=groundH(from.x,from.z);for(let k=0;k<36;k++){const a=rnd(0,TAU);smoke.spawn(from.x-sU.dir*rnd(0,4),gy+0.4,from.z+rnd(-2,2),Math.cos(a)*rnd(4,11),rnd(0.3,2.2),Math.sin(a)*rnd(4,11),rnd(1.4,2.8),rnd(1.2,2.2),2.6,0.62,0.55,0.44,0.45,-0.2,1.6);}}
    if(big&&mode==='mar'){for(let k=0;k<24;k++)smoke.spawn(from.x,from.y,from.z,sU.dir*rnd(3,10),rnd(0,3),rnd(-3,3),rnd(1.2,2.5),rnd(1,2),2.5,0.75,0.75,0.73,0.5,-0.2,1.2);}
    flash.position.copy(from);flash.intensity=big?300:90;if(big){sU.rec=1;S.shake=Math.max(S.shake,S.rm?0:0.35);}
    if(!S.userCam()&&!S.rm&&sU.model&&tU.model&&S.camMode!=='result'&&(kind==='shell'||kind==='burst'||kind==='rocket'||kind==='arc')){S.camMode='shooter';S.camT=0;S.shooter=sU;S.shTarget=tU;}
    sound.play(kind==='missile'||kind==='rocket'||kind==='torp'?'missile':'gun',kind==='shell'||kind==='arc');
    for(let j=0;j<n;j++){
      const P={kind,from:from.clone(),to:to.clone().add(j?new THREE.Vector3(rnd(-1.5,1.5),rnd(-1,1),rnd(-1.5,1.5)):new THREE.Vector3()),t:-j*(kind==='burst'?0.07:0.18),dur,ev,
        arcH:kind==='arc'?dist*0.35:kind==='missile'?(mode==='mar'||mode==='suelo'?dist*0.12:dist*0.06):kind==='rocket'?dist*0.05:0,obj:null,last:from.clone(),wob:rnd(0,6)};
      if(kind==='missile'||kind==='rocket'||kind==='torp'){P.obj=missileMesh();if(kind==='torp'){P.obj.children.forEach(c=>{if(c.isSprite)c.visible=false;});}P.obj.scale.setScalar(kind==='rocket'?0.6:kind==='torp'?1.3:1);scene.add(P.obj);}
      else {P.obj=new THREE.Mesh(trGeo,new THREE.MeshBasicMaterial({color:kind==='burst'?0xffc060:0xfff0c0,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false}));P.obj.userData.tr=true;P.obj.scale.set(1,kind==='burst'?1.2:1.8,kind==='burst'?1.2:1.8);scene.add(P.obj);}
      P.done=()=>{left--;scene.remove(P.obj);if(left===0) impact(ev,P.to,cb);};
      S.proj.push(P);}
    if((kind==='missile'||kind==='torp'||kind==='arc')&&!S.userCam()&&S.camMode!=='result'&&sU.model&&tU.model) {S.camMode='follow';S.follow=S.proj[S.proj.length-1];}
    if(ev.kill){S.slowPending=true;}
  }
  function posAt(P,u){const p=P.from.clone().lerp(P.to,u);p.y+=Math.sin(Math.PI*u)*P.arcH;if(P.kind==='missile'){p.z+=Math.sin(u*9+P.wob)*0.6*(1-u);}return p;}
  function impact(ev,p,cb){const tU=S.units[1-ev.s];
    if(ev.hit){ if(ev.pen){boom(p,ev.kill);tU.flash=0.4;} else sparks(p); if(mode==='mar'&&!ev.pen){} if(mode==='mar'&&ev.k==='torp') splash(new THREE.Vector3(p.x,0,p.z),true);}
    else { if(mode==='mar') splash(new THREE.Vector3(p.x,0,p.z),false); else if(mode==='suelo') {dirt(p);boom(p,false);} else if(mode==='cielo') puff(p); else {for(let k=0;k<40;k++) smoke.spawn(p.x,p.y,p.z,rnd(-3,3),rnd(1,5),rnd(-3,3),rnd(1,3),rnd(0.4,0.9),0,0.8,0.9,1,0.6,-3,0.3);} }
    if(!S.userCam()&&S.camMode!=='result'){S.camMode='impact';S.camT=0;S.camTarget.copy(p);}
    if(ev.kill){S.slow=1.6;}
    setTimeout(()=>{if(!ev.kill&&!S.userCam()&&S.camMode!=='result') S.camMode='wide'; cb&&cb();},ev.kill?900:450);}
  function kill(i){const U=S.units[i];U.dead=true;U.burn=1;const m0=Array.isArray(U.mesh.material)?U.mesh.material[0]:U.mesh.material;if(!U.darkened){m0.color&&m0.color.multiplyScalar(0.55);U.darkened=true;}
    if(U.model&&!U.model.dark){U.model.dark=true;U.model.mats.forEach(m=>{if(m.color)m.color.multiplyScalar(0.3);if('roughness' in m)m.roughness=Math.min(1,m.roughness+0.3);});
      if(U.model.tur&&!S.rm){const tr=U.model.tur;U.model.toss={t:0,T:1.5,p0:tr.position.clone(),p1:new THREE.Vector3(rnd(-0.5,1.5),-1.75,(U.dir>0?1:-1)*rnd(4.2,5.2)).multiplyScalar(U.model.k),r1:new THREE.Euler(rnd(0.25,0.45)*(U.dir>0?1:-1),rnd(0.6,1.2),rnd(-0.15,0.15))};}}}
  // ===== camera / input =====
  S.userCam=()=>performance.now()<S.userUntil;
  let drag=null,pinch=null;const cv=renderer.domElement;
  cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,az:S.az,el:S.el};cv.setPointerCapture(e.pointerId);S.userUntil=performance.now()+5000;});
  cv.addEventListener('pointermove',e=>{if(!drag)return;S.az=clamp(drag.az-(e.clientX-drag.x)*0.006,-1.25,1.25);S.el=clamp(drag.el+(e.clientY-drag.y)*0.004,-0.15,0.9);S.userUntil=performance.now()+5000;S.camMode='wide';});
  cv.addEventListener('pointerup',()=>{drag=null;});cv.addEventListener('pointercancel',()=>{drag=null;});
  cv.addEventListener('wheel',e=>{e.preventDefault();S.dist=clamp(S.dist*(1+e.deltaY*0.001),0.55,1.6);S.userUntil=performance.now()+5000;},{passive:false});
  cv.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch={d:Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),s:S.dist};}},{passive:true});
  cv.addEventListener('touchmove',e=>{if(pinch&&e.touches.length===2){const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);S.dist=clamp(pinch.s*pinch.d/d,0.55,1.6);}},{passive:true});
  cv.addEventListener('touchend',()=>{pinch=null;},{passive:true});
  const camPos=new THREE.Vector3(),camLook=new THREE.Vector3(),tmp=new THREE.Vector3();
  function baseDist(){const asp=W0()/H0();return (SEP+L*(mode==='cielo'?2.3:1.7))/(2*Math.tan(THREE.MathUtils.degToRad(24))*asp);}
  function updateCam(dt){
    const uy=U=>U.dead&&mode!=='suelo'?Math.max(U.g.position.y,(U.y0||0)-12):U.g.position.y;const mid=new THREE.Vector3((S.units[0].x+S.units[1].x)/2,(uy(S.units[0])+uy(S.units[1]))/2,(S.units[0].z+S.units[1].z)/2);
    let tp,tl,kf=1;
    if(S.rm&&S.camMode!=='result') S.camMode='wide';
    if(S.intro>0&&!S.userCam()&&S.camMode==='wide'){S.intro-=dt;const A=S.units[0],u=clamp(1-S.intro/2.6,0,1),e=u*u*(3-2*u);const d=baseDist()*S.dist;
      const p0=A.model?new THREE.Vector3(A.x-A.w*0.9,A.g.position.y+A.h*0.9+(mode==='suelo'?1.5:1),A.z+A.w*1.1):new THREE.Vector3(A.x-A.w*0.25,A.g.position.y+A.h*0.6+(mode==='suelo'?1.5:1),A.z+A.w*1.7),p1=mid.clone().add(new THREE.Vector3(Math.sin(S.az)*d*Math.cos(S.el),Math.sin(S.el)*d+(mode==='suelo'?6:2),Math.cos(S.az)*d*Math.cos(S.el)));
      tp=p0.lerp(p1,e);tl=new THREE.Vector3(A.x+A.w*0.6,A.g.position.y,A.z).lerp(mid,e);kf=3;}
    else if(S.camMode==='follow'&&S.follow&&S.follow.cur){const p=S.follow.cur,dir=S.follow.to.clone().sub(S.follow.from).normalize();const cut=!S.units[0].model||!S.units[1].model;tp=p.clone().add(dir.clone().multiplyScalar(cut?-3:-7)).add(new THREE.Vector3(0,mode==='suelo'?5:3.5,cut?25:17));tl=p.clone().add(dir.multiplyScalar(12));}
    else if(S.camMode==='shooter'&&S.shooter){S.camT+=dt;const U=S.shooter,T=S.shTarget,dx=U.dir;
      tp=U.model?new THREE.Vector3(U.x-dx*U.w*0.85,U.g.position.y+U.h*0.7+(mode==='suelo'?1.2:0.6),U.z+U.w*1.25):new THREE.Vector3(U.x-dx*U.w*0.35,U.g.position.y+U.h*0.5+(mode==='suelo'?1.5:0.6),U.z+U.w*1.9);tl=new THREE.Vector3(U.x+dx*(SEP*0.55),(U.g.position.y+uy(T))/2,(U.z+T.z)/2);kf=1.6;if(S.camT>1.3) S.camMode='wide';}
    else if(S.camMode==='impact'){S.camT+=dt;const sw=(S.units[0].model&&S.units[1].model)?14:5;tp=S.camTarget.clone().add(new THREE.Vector3(Math.sin(S.camT*0.4)*sw,5,20));tl=S.camTarget.clone();if(S.camT>4) S.camMode='wide';}
    else if(S.camMode==='result'&&S.res>=0){const W=S.units[S.res],Lo=S.units[1-S.res];S.resA+=dt*(S.rm?0:0.16);const full=!!W.model;const a=full?S.resA:Math.sin(S.resA*1.4)*0.1;const R=Math.max(W.w*1.9,baseDist()*0.5)*S.dist;
      const c=new THREE.Vector3(W.x,W.g.position.y,W.z);const R2=full?R:R*1.25;tp=c.clone().add(new THREE.Vector3(Math.sin(a)*R2-(full?W.dir*R2*0.2:0),R2*(full?0.3:0.16)+(mode==='suelo'?1.5:0),Math.cos(a)*R2));tl=full?c.clone().lerp(new THREE.Vector3(Lo.x,uy(Lo),Lo.z),0.15):c.clone();tl.y-=R2*(full?0.16:0.08);kf=0.8;}
    else {if(!S.userCam()&&!drag&&!S.rm) S.az+=(((S.units[0].model&&S.units[1].model)?0.42:0.13)*Math.sin(S.t*0.07)-S.az)*Math.min(1,dt*0.6);
      const d=baseDist()*S.dist;tp=mid.clone().add(new THREE.Vector3(Math.sin(S.az)*d*Math.cos(S.el),Math.sin(S.el)*d+(mode==='suelo'?6:2),Math.cos(S.az)*d*Math.cos(S.el)));tl=mid.clone();}
    if(mode==='suelo'){const gy=groundH(tp.x,tp.z)+2.5;if(tp.y<gy)tp.y=gy;}
    if(mode==='mar'&&tp.y<3)tp.y=3; if(mode==='sub'&&tp.y>55) tp.y=55;
    const k=1-Math.pow(0.02,dt*kf);camPos.lerp(tp,S.camMode==='follow'?Math.min(1,k*2.2):k);camLook.lerp(tl,S.camMode==='follow'?Math.min(1,k*2.5):k);
    if(mode==='suelo'){const gy=groundH(camPos.x,camPos.z)+2;if(camPos.y<gy)camPos.y=gy;}
    cam.position.copy(camPos);if(S.shake>0&&!S.rm){cam.position.add(tmp.set(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(S.shake*0.8));S.shake=Math.max(0,S.shake-dt*2.2);}cam.lookAt(camLook);}
  // init camera
  {const d=baseDist();camPos.set(0,8,d*1.3);camLook.set(0,0,0);
    if(S.intro>0){const A=S.units[0],gy=mode==='suelo'?groundH(A.x,A.z)+A.h*0.5:(A.y0||0);camPos.set(A.x-A.w*0.25,gy+A.h*0.6+(mode==='suelo'?1.5:1),A.z+A.w*1.7);camLook.set(A.x+A.w*0.6,gy,A.z);}
    if(mode==='suelo')camPos.y=Math.max(camPos.y,groundH(camPos.x,camPos.z)+3);}
  // ===== loop =====
  let last=performance.now(),raf=0,frames=[],alive=true,visible=true;
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting;}):null; if(io) io.observe(el);
  function frame(now){if(!alive)return;raf=requestAnimationFrame(frame);if(!visible){last=now;return;}
    let rdt=clamp((now-last)/1000,0,0.05);last=now;if(rdt<=0){updateCam(0);renderer.render(scene,cam);return;}frames.push(rdt);if(frames.length>90)frames.shift();
    if(S.slow>0){S.slow-=rdt;S.ts=0.3;}else S.ts+=(1-S.ts)*Math.min(1,rdt*4);
    const dt=rdt*S.ts;S.t+=dt;
    // units motion
    S.units.forEach((U,i)=>{const t=S.t+U.phase;let y=0,rx=0,rz=0;
      if(mode==='cielo'){ if(U.dead){U.vy+=dt*9;U.fall+=U.vy*dt;if(U.model){U.inner.rotation.z+=dt*U.dir*-0.9;U.inner.rotation.x+=dt*2.2;}else{U.inner.rotation.z=clamp(U.inner.rotation.z+dt*U.dir*-0.45,-0.55,0.55);}U.x+=U.dir*dt*6; if(Math.random()<0.8) {fire.spawn(U.x,U.y0-U.fall,U.z,0,0,0,0.4,1.6,1,1,0.55,0.15,0.9,0,0);smoke.spawn(U.x,U.y0-U.fall,U.z,rnd(-1,1),rnd(0,2),rnd(-1,1),rnd(2,4),rnd(1.5,2.5),2.5,0.1,0.1,0.1,0.7,-0.3,0.3);} }
        y=U.y0+Math.sin(t*0.9)*1.6-U.fall; if(!U.dead){rx=Math.sin(t*0.7)*0.28;rz=Math.sin(t*0.9+1)*0.06;U.x+=Math.sin(t*0.35)*0.02;}
        // contrails
        if(!U.dead&&Math.random()<0.5) smoke.spawn(U.x-U.dir*U.w*0.5,y,U.z,-U.dir*2,0,0,1.2,0.5,3,0.95,0.95,0.97,0.25,0,0);
      } else if(mode==='suelo'){const gx=groundH(U.x,U.z),gx2=groundH(U.x+2,U.z),gx1=groundH(U.x-2,U.z);y=gx+U.h*(U.model?0.46:0.4);rz=Math.atan2(gx2-gx1,4)*U.dir;
        if(!U.dead){y+=Math.sin(t*8)*0.03;}
        U.rec=Math.max(0,U.rec-dt*4);if(U.model&&U.model.gun){U.model.gun.position.x=U.model.gun0.x+U.rec*0.55*U.model.k;U.inner.position.x=-U.dir*U.rec*0.12;}else U.inner.position.x=-U.dir*U.rec*0.5;
        if(U.model&&U.model.toss){const Z=U.model.toss;if(Z.t<Z.T){Z.t=Math.min(Z.T,Z.t+dt);const s=Z.t/Z.T,tr=U.model.tur;tr.position.copy(Z.p0).lerp(Z.p1,s);tr.position.y+=Math.sin(Math.PI*s)*7*U.model.k;tr.rotation.set(Z.r1.x*s+Math.sin(Math.PI*s)*0.9*(U.dir>0?1:-1),Z.r1.y*s,Z.r1.z*s);if(Z.t>=Z.T){const w=new THREE.Vector3();tr.getWorldPosition(w);dirt(w);}}}
        if(Math.random()<0.15&&!U.dead) smoke.spawn(U.x-U.dir*U.w*0.45,gx+0.5,U.z+rnd(-1,1),-U.dir*rnd(0.5,2),rnd(0.3,1),0,rnd(1,2),rnd(0.8,1.4),2,0.55,0.5,0.42,0.25,-0.2,0.5);
      } else if(mode==='mar'){const t2=S.t;const hh=waveH(U.x,U.z,t2),hf=waveH(U.x+U.w*0.4,U.z,t2),hb=waveH(U.x-U.w*0.4,U.z,t2),hl=waveH(U.x,U.z+2,t2),hr=waveH(U.x,U.z-2,t2);
        y=hh*0.6+(U.model&&U.model.wl!=null?-U.model.wl:U.h*0.32)-U.fall;rz=Math.atan2(hf-hb,U.w*0.8)*0.5*U.dir;rx=Math.atan2(hl-hr,4)*0.4;
        if(U.dead){U.fall+=dt*0.9;rz+=U.fall*0.03*U.dir;rx+=U.fall*0.04;if(Math.random()<0.5){fire.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.1,U.z,0,rnd(2,5),0,rnd(0.4,0.9),rnd(1.5,3),1,1,0.5,0.15,0.9,-2,0);smoke.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.3,U.z,rnd(0,2),rnd(3,6),rnd(-1,1),rnd(3,6),rnd(2,4),3,0.08,0.08,0.08,0.7,-0.2,0.2);}}
        else if(Math.random()<0.6) smoke.spawn(U.x+U.dir*U.w*0.45,0.2,U.z+rnd(-1.2,1.2),U.dir*rnd(0,1),rnd(0.5,2),rnd(-1.5,1.5),rnd(0.6,1.2),rnd(0.6,1.2),1,0.95,0.97,1,0.6,3,0.5);
      } else {y=U.y0+Math.sin(t*0.5)*0.8-U.fall;rz=Math.sin(t*0.4)*0.03;
        if(U.dead){U.fall+=dt*(1.5+U.fall*0.15);rz+=Math.min(0.5,U.fall*0.03)*U.dir;if(Math.random()<0.6) smoke.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.2,U.z,rnd(-0.5,0.5),rnd(2,5),rnd(-0.5,0.5),rnd(2,4),rnd(0.3,0.8),0,0.8,0.9,1,0.6,-3,0.2);const by=groundH(U.x,U.z)+U.h*0.3;if(y<by){y=by;}}
        else if(Math.random()<0.3) smoke.spawn(U.x-U.dir*U.w*0.5,y,U.z,-U.dir,rnd(0.5,1.5),0,rnd(1.5,3),rnd(0.3,0.6),0,0.8,0.9,1,0.45,-2,0.2);}
      if(U.dead&&mode==='suelo'){U.burn+=dt;if(Math.random()<0.9){fire.spawn(U.x+rnd(-U.w*0.25,U.w*0.25),y+U.h*0.2,U.z+rnd(-1,1),rnd(-0.5,0.5),rnd(2,5),rnd(-0.5,0.5),rnd(0.4,0.9),rnd(1,2.2),1,1,rnd(0.4,0.6),0.12,0.9,-3,0);smoke.spawn(U.x+rnd(-1,1),y+U.h*0.5,U.z,rnd(0,1.5),rnd(3,6),rnd(-0.5,0.5),rnd(3,6),rnd(1.5,3),3.5,0.07,0.07,0.07,0.75,-0.3,0.1);}}
      if(mode==='suelo'&&U.model)y+=U.h*(U.yk-0.46);
      if(!U.dead&&U.hpv!=null&&U.hpv<0.6&&Math.random()<(U.hpv<0.3?0.5:0.22)){const sx=U.x+rnd(-0.2,0.2)*U.w,sy=y+U.h*0.3;smoke.spawn(sx,sy,U.z,rnd(-0.3,0.3)-U.dir*(mode==='cielo'?2:0),rnd(1,2.5),rnd(-0.3,0.3),rnd(1.5,3),rnd(0.6,1.2),2.5,0.15,0.15,0.15,0.6,-0.3,0.3);if(U.hpv<0.3&&Math.random()<0.4)fire.spawn(sx,sy,U.z,0,rnd(0.5,2),0,rnd(0.2,0.5),rnd(0.5,1),0.6,1,0.6,0.2,0.9,-1,0);}
      U.g.position.set(U.x,y,U.z);if(U.blob){U.blob.position.set(U.x,groundH(U.x,U.z)+0.08,U.z);}U.inner.rotation.z=U.dead&&mode==='cielo'?U.inner.rotation.z:rz;if(!(U.dead&&mode==='cielo'))U.inner.rotation.x=rx;
      const MM=Array.isArray(U.mesh.material)?U.mesh.material[0]:U.mesh.material;const em=(MM.userData.em||0)*(U.dead?0.35:1);if(U.flash>0){U.flash-=rdt;MM.emissive&&MM.emissive.setRGB(em+U.flash*2,em+U.flash*1.2,em+U.flash*0.4);} else if(MM.emissive) MM.emissive.setRGB(em,em,em);
      if(U.model){const f=Math.max(0,U.flash||0);if(f>0||U.model.fl){U.model.fl=f>0;U.model.mats.forEach(m=>{if(m.emissive)m.emissive.setRGB(f*1.6,f*0.9,f*0.3);});}}
    });
    // scenery motion
    if(mode==='cielo'){terrain.position.x-=dt*20;if(terrain.position.x<-1400)terrain.position.x=0;clouds.forEach(c=>{c.position.x-=dt*(16+c.scale.y*0.03);if(c.position.x<-2100)c.position.x+=4200;if(c.userData.o==null)c.userData.o=c.material.opacity;const dd=c.position.distanceTo(cam.position)-Math.max(c.scale.x,c.scale.z||0)*0.5;c.material.opacity=c.userData.o*clamp((dd-140)/320,0,1);});}
    if(mode==='mar'){water.material.uniforms.t.value=S.t;clouds.forEach(c=>{c.position.x-=dt*3;if(c.position.x<-2300)c.position.x+=4600;});}
    if(mode==='sub'){shafts.forEach((m,i)=>{m.material.opacity=0.18+0.14*Math.sin(S.t*0.6+i);});if(Math.random()<0.3) smoke.spawn(rnd(-80,80),groundH(0,0)+2,rnd(-60,20),0,rnd(1,3),0,rnd(6,12),rnd(0.3,0.6),0,0.8,0.9,1,0.3,-0.3,0);}
    // projectiles
    for(let k=S.proj.length-1;k>=0;k--){const P=S.proj[k];P.t+=dt;if(P.t<0){P.obj.visible=false;continue;}P.obj.visible=true;const u=clamp(P.t/P.dur,0,1);const p=posAt(P,u),pn=posAt(P,Math.min(1,u+0.02));P.cur=p;
      if(P.obj.userData.tr){const seg=P.kind==='burst'?4:7;P.obj.position.copy(p);P.obj.lookAt(pn);P.obj.rotateY(-Math.PI/2);P.obj.scale.x=seg;}
      else {P.obj.position.copy(p);P.obj.lookAt(pn);P.obj.rotateY(-Math.PI/2);}
      if(P.kind==='missile'||P.kind==='rocket'){fire.spawn(p.x,p.y,p.z,0,0,0,0.12,P.kind==='rocket'?0.9:1.4,0,1,0.8,0.4,1,0,0);const st=P.last.distanceTo(p);const nn=Math.ceil(st/0.5);for(let q=0;q<nn;q++){const qq=P.last.clone().lerp(p,q/nn);smoke.spawn(qq.x,qq.y,qq.z,rnd(-0.3,0.3),rnd(0,0.4),rnd(-0.3,0.3),rnd(1.6,3),rnd(0.5,0.8),3.5,0.86,0.86,0.86,0.45,-0.1,0.4);}}
      if(P.kind==='torp'){if(mode==='mar') smoke.spawn(p.x,0.15,p.z+rnd(-0.6,0.6),0,rnd(0.2,0.6),rnd(-0.5,0.5),rnd(1.5,3),rnd(0.6,1.2),2,0.95,0.98,1,0.6,0,0.5); else for(let q=0;q<3;q++) smoke.spawn(p.x,p.y,p.z,rnd(-0.5,0.5),rnd(1,3),rnd(-0.5,0.5),rnd(1,2.5),rnd(0.2,0.5),0,0.85,0.95,1,0.6,-3,0.2);}
      if(P.kind==='arc'&&Math.random()<0.6) smoke.spawn(p.x,p.y,p.z,0,0,0,0.6,0.5,1,0.9,0.85,0.7,0.4,0,0);
      if(S.slowPending&&P.ev.kill&&u>0.7){S.slowPending=false;S.slow=1.4;}
      P.last.copy(p);if(u>=1){S.proj.splice(k,1);P.done();}}
    fire.update(dt);smoke.update(dt);updDebris(dt);flash.intensity*=Math.pow(0.02,rdt);
    fire.mat.uniforms.uScale.value=smoke.mat.uniforms.uScale.value=renderer.domElement.height/ (2*Math.tan(THREE.MathUtils.degToRad(24)));
    updateCam(rdt);renderer.render(scene,cam);}
  raf=requestAnimationFrame(frame);
  function goLite(){if(S.lite)return false;S.lite=1;renderer.shadowMap.enabled=false;scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{if(m.envMap)m.envMap=null;m.needsUpdate=true;});});frames.length=0;return true;}
  function resize(){renderer.setSize(W0(),H0());cam.aspect=W0()/H0();cam.updateProjectionMatrix();}
  window.addEventListener('resize',resize);
  return {
    ok:true,
    fps(){if(frames.length<20)return null;const a=frames.reduce((x,y)=>x+y,0)/frames.length;return 1/a;},
    lite(){return goLite();},
    shot(ev,cb){fireShot(ev,cb);},
    kill(i){kill(i);},
    reset(){S.units.forEach(U=>{U.hpv=1;if(U.dead){U.dead=false;U.fall=0;U.vy=0;U.inner.rotation.set(0,0,0);U.x=U.dir>0?-SEP/2:SEP/2;const m0=Array.isArray(U.mesh.material)?U.mesh.material[0]:U.mesh.material;if(m0.color)m0.color.set(m0.map?0xffffff:0x4a5058);U.darkened=false;}
      if(U.model){if(U.model.dark){U.model.mats.forEach(m=>{if(m.userData.c0)m.color.copy(m.userData.c0);});U.model.dark=false;}if(U.model.tur){U.model.toss=null;U.model.tur.position.set(0,0,0);U.model.tur.rotation.set(0,0,0);}}});
      S.res=-1;S.camMode='wide';S.intro=S.rm?0:2.2;S.userUntil=0;if(mode==='cielo')terrain.position.x=0;},
    hp(i,v){const U=S.units[i];if(U)U.hpv=v;},
    result(w){if(w!==0&&w!==1)return;S.res=w;S.resA=0;S.camMode='result';S.userUntil=0;},
    _:(window.MAT_DEV?(window.MAT_D3LITE=goLite,window.MAT_D3DBG=()=>({cam:cam.position.toArray(),mode:S.camMode,lite:S.lite||0,units:S.units.map(U=>[U.x,U.g.position.y,U.z,!!U.model,U.h,U.w]),u2:S.units.map(U=>{const bb=new THREE.Box3().setFromObject(U.inner);const gs=[];for(let k=-4;k<=4;k++)gs.push(+groundH(U.x+k*U.w/8,U.z).toFixed(2));return {bmin:bb.min.y,g0:groundH(U.x,U.z),gs};}),intro:S.intro,look:camLook.toArray(),t:S.t,vis:visible})):0),
    dbg(){return {cam:cam.position.toArray(),look:camLook.toArray(),mode:S.camMode,g:groundH(cam.position.x,cam.position.z),units:S.units.map(U=>{const bb=new THREE.Box3().setFromObject(U.inner);let gm=-1e9,gn=1e9;for(let k=-4;k<=4;k++){const gg=groundH(U.x+k*U.w/8,U.z);gm=Math.max(gm,gg);gn=Math.min(gn,gg);}return {x:U.x,z:U.z,y:U.g.position.y,h:U.h,w:U.w,model:!!U.model,dead:U.dead,bmin:bb.min.y,bmax:bb.max.y,g0:groundH(U.x,U.z),gmax:gm,gmin:gn};})};},
    dispose(){alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);if(io)io.disconnect();renderer.dispose();try{renderer.forceContextLoss();}catch(e){}scene.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}
  };
}
