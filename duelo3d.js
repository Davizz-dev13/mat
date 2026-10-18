
// M.A.T · Duelo 3D (three.js). Figuras: recortes de la foto real de cada ficha sobre una silueta extruida.
import * as THREE from './three.module.min.js';
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
export function create(el,o){
  const mode=o.mode, L={cielo:10,suelo:10,mar:14,sub:13}[o.mode]||10;
  const W0=()=>Math.max(200,el.clientWidth), H0=()=>Math.round(W0()*(W0()<600?0.75:0.5625));
  let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:window.devicePixelRatio<2,powerPreference:'high-performance'});}catch(e){return null;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(W0(),H0());renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  el.appendChild(renderer.domElement);renderer.domElement.style.display='block';renderer.domElement.style.width='100%';renderer.domElement.style.height='auto';renderer.domElement.style.touchAction='none';
  const scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(48,W0()/H0(),0.5,6000);
  const noise=mkNoise(7+Math.floor(Math.random()*90));
  const fire=new Particles(700,true), smoke=new Particles(900,false);
  scene.add(smoke.obj);scene.add(fire.obj);
  const sunDir=new THREE.Vector3(0.45,0.65,0.6).normalize();
  const hemi=new THREE.HemisphereLight(0xcfe3ff,0x4a4030,1.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xfff1d6,2.0);sun.position.copy(sunDir).multiplyScalar(100);scene.add(sun);
  const flash=new THREE.PointLight(0xffaa55,0,120,1.6);scene.add(flash);
  const S={t:0,ts:1,shake:0,units:[],proj:[],camMode:'wide',camT:0,camTarget:new THREE.Vector3(),userUntil:0,az:0,el:0.12,dist:1,slow:0,dead:[false,false]};
  // sky dome
  function sky(top,bot,sunc){const g=new THREE.SphereGeometry(3000,32,16);const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new THREE.Color(top)},bot:{value:new THREE.Color(bot)},sd:{value:sunDir},sc:{value:new THREE.Color(sunc||0xfff2c4)}},
      vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform vec3 top,bot,sc,sd;varying vec3 vP;void main(){float h=clamp(vP.y*1.6+0.12,0.0,1.0);vec3 c=mix(bot,top,pow(h,0.8));float s=max(dot(vP,normalize(sd)),0.0);c+=sc*(pow(s,600.0)*2.5+pow(s,12.0)*0.35);gl_FragColor=vec4(c,1.0);}'});
    const s=new THREE.Mesh(g,m);s.renderOrder=-1;scene.add(s);return s;}
  function terrainMesh(size,seg,hfun,colfun){const g=new THREE.PlaneGeometry(size,size,seg,seg);g.rotateX(-Math.PI/2);const p=g.attributes.position,cols=new Float32Array(p.count*3),c=new THREE.Color();
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=hfun(x,z);p.setY(i,y);colfun(c,y,x,z);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();return new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95,metalness:0,flatShading:false}));}
  let groundH=()=>-1e9, water=null, waveH=null, terrain=null, clouds=[], shafts=[], bubbles=null, trees=null, bedH=null;
  const SEP={cielo:58,suelo:38,mar:56,sub:50}[mode];
  // ===== scenes =====
  if(mode==='cielo'){
    sky(0x2a68b8,0xcfe4f6);scene.fog=new THREE.Fog(0xb8d3ea,300,2200);
    const base=-160;const hf=(x,z)=>{const y=base+Math.pow(noise(x*0.0016+3,z*0.0016+5,6),1.8)*420-60;const r=Math.hypot(x,z+150);return Math.min(y,-70+Math.max(0,r-250)*0.35);};
    terrain=terrainMesh(4200,170,hf,(c,y)=>{const t=(y-base+60)/420;if(t>0.62)c.setRGB(0.93,0.95,0.98);else if(t>0.42)c.setRGB(0.45,0.43,0.41);else if(t>0.2)c.setRGB(0.29,0.37,0.24);else c.setRGB(0.22,0.31,0.19);});
    scene.add(terrain);groundH=hf;
    const ct=cloudTex();for(let i=0;i<46;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:ct,transparent:true,depthWrite:false,opacity:rnd(0.55,0.9),fog:true}));const s=rnd(60,180);sp.scale.set(s*1.6,s,1);sp.position.set(rnd(-1500,1500),rnd(-120,90),rnd(-1300,250));if(Math.abs(sp.position.z)<60&&Math.abs(sp.position.y)<40)sp.position.z-=200;scene.add(sp);clouds.push(sp);}
  } else if(mode==='suelo'){
    sky(0x4f86c2,0xd6e2e6);scene.fog=new THREE.Fog(0xc4d2d6,160,1500);
    const hf=(x,z)=>{let y=(noise(x*0.006+1,z*0.006+2,5)-0.45)*38+(noise(x*0.0015,z*0.0015,3)-0.5)*120*Math.min(1,Math.max(0,(-z-150)/400));const lane=Math.exp(-(z*z)/(2*22*22));return y*(1-0.85*lane);};
    terrain=terrainMesh(2400,180,hf,(c,y,x,z)=>{const n=noise(x*0.03,z*0.03,2),m=noise(x*0.004+7,z*0.004,2);c.setRGB(0.20+0.14*n+0.1*m,0.30+0.12*n,0.12+0.05*n);if(Math.abs(z)<9&&noise(x*0.05,z*0.2,2)>0.45)c.setRGB(0.38,0.32,0.22);if(y>45)c.setRGB(0.5,0.48,0.44);});
    scene.add(terrain);groundH=hf;
    // trees (instanced)
    const tg=new THREE.ConeGeometry(2.2,7,7);tg.translate(0,5,0);const tk=new THREE.CylinderGeometry(0.35,0.45,2,5);tk.translate(0,1,0);
    const N=420,im=new THREE.InstancedMesh(tg,new THREE.MeshStandardMaterial({color:0x2d4a26,roughness:1}),N),it=new THREE.InstancedMesh(tk,new THREE.MeshStandardMaterial({color:0x4a3a28}),N);const m4=new THREE.Matrix4();let k=0;
    for(let i=0;i<N*3&&k<N;i++){const x=rnd(-700,700),z=rnd(-700,200);if(Math.abs(z)<30)continue;if(noise(x*0.01+9,z*0.01,2)<0.5)continue;const s=rnd(0.7,1.5);m4.compose(new THREE.Vector3(x,hf(x,z)-0.3,z),new THREE.Quaternion(),new THREE.Vector3(s,s*rnd(0.8,1.3),s));im.setMatrixAt(k,m4);it.setMatrixAt(k,m4);k++;}
    im.count=k;it.count=k;scene.add(im);scene.add(it);trees=im;
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
      const pts=[];for(let k=7;k<sil.length;k+=2) pts.push(new THREE.Vector2(-w/2+sil[k]/200*w, h/2-sil[k+1]/200*h));
      const shape=new THREE.Shape(pts);const depth=mode==='cielo'?w*0.06:mode==='suelo'?w*0.16:w*0.09;
      const geo=new THREE.ExtrudeGeometry(shape,{depth:depth,bevelEnabled:true,bevelThickness:depth*0.25,bevelSize:Math.min(w,h)*0.012,bevelSegments:2,curveSegments:1});geo.translate(0,0,-depth/2);
      const uv=geo.attributes.uv,p=geo.attributes.position,iw=sil[0],ih=sil[1];
      for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k);const px=sil[2]+((x+w/2)/w)*bw,py=sil[3]+((h/2-y)/h)*bh;uv.setXY(k,px/iw,1-py/ih);}
      const mat=new THREE.MeshStandardMaterial({color:0x777777,roughness:0.7,metalness:0.1,emissive:0x000000});
      mesh=new THREE.Mesh(geo,mat);
      loader.load(u.img,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;mat.map=t;mat.emissiveMap=t;mat.emissive.setRGB(0.42,0.42,0.42);mat.userData.em=0.42;mat.color.set(0xffffff);mat.needsUpdate=true;},undefined,()=>{});
    } else {const g=genericShape();h=w*g.h;const geo=new THREE.ExtrudeGeometry(g.shape,{depth:0.12,bevelEnabled:false});geo.scale(w,w,1);geo.translate(0,0,-0.06*w);geo.computeBoundingBox();const bb=geo.boundingBox;geo.translate(0,-(bb.max.y+bb.min.y)/2,0);h=(bb.max.y-bb.min.y)*1;mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0x4a5058,roughness:0.6,metalness:0.4}));}
    const flip=(u.face===-1?-1:1)*u.dir; if(flip<0){mesh.scale.x=-1;mesh.material.side=THREE.DoubleSide;}
    inner.add(mesh);
    const x=u.dir>0?-SEP/2:SEP/2;
    const U={i,g:grp,inner,mesh,w,h,x,z:0,dir:u.dir,hp:1,dead:false,phase:rnd(0,6),vy:0,fall:0,rec:0,burn:0};
    if(mode==='cielo'){U.y0=i?10:-4;U.z=i?-10:8;}
    else if(mode==='sub'){U.y0=i?6:-2;U.z=i?-8:6;}
    else U.z=0;
    S.units.push(U);return U;}
  o.units.forEach((u,i)=>buildUnit(i,u));
  function muzzle(U){return new THREE.Vector3(U.x+U.dir*U.w*0.45,U.g.position.y+(mode==='suelo'?U.h*0.15:0),U.z);}
  function center(U){return new THREE.Vector3(U.x,U.g.position.y,U.z);}
  // ===== effects =====
  function boom(p,big,kind){const n=big?90:45;for(let k=0;k<n;k++){const a=rnd(0,TAU),b=rnd(-0.4,1),sp=rnd(4,big?26:16);fire.spawn(p.x,p.y,p.z,Math.cos(a)*sp*Math.cos(b),Math.sin(b)*sp+3,Math.sin(a)*sp*Math.cos(b),rnd(0.3,big?1.1:0.7),rnd(0.9,big?2.6:1.8),1.4,1,rnd(0.4,0.75),rnd(0.08,0.25),0.85,mode==='sub'?-2:2,2.5);}
    for(let k=0;k<(big?60:26);k++){const a=rnd(0,TAU);smoke.spawn(p.x+rnd(-1,1),p.y+rnd(-1,1),p.z+rnd(-1,1),Math.cos(a)*rnd(2,8),rnd(2,7),Math.sin(a)*rnd(2,8),rnd(1.5,big?4.5:3),rnd(1.2,2.5),big?3:2.2,0.16,0.15,0.14,0.5,-0.6,0.8);}
    for(let k=0;k<(big?30:12);k++) fire.spawn(p.x,p.y,p.z,rnd(-20,20),rnd(5,25),rnd(-20,20),rnd(0.6,1.4),0.35,0,1,0.85,0.4,1,mode==='sub'?3:18,0.3);
    flash.position.copy(p);flash.intensity=big?600:250;S.shake=Math.max(S.shake,big?1.2:0.6);sound.play('boom',big);}
  function sparks(p){for(let k=0;k<26;k++) fire.spawn(p.x,p.y,p.z,rnd(-14,14),rnd(2,14),rnd(-14,14),rnd(0.2,0.5),0.3,0,1,0.9,0.5,1,25,0.5);flash.position.copy(p);flash.intensity=120;sound.play('gun',false);}
  function splash(p,big){for(let k=0;k<(big?120:60);k++){const a=rnd(0,TAU),r=rnd(0,1.6);smoke.spawn(p.x+Math.cos(a)*r,p.y,p.z+Math.sin(a)*r,Math.cos(a)*rnd(0.5,3),rnd(8,big?30:20),Math.sin(a)*rnd(0.5,3),rnd(0.8,1.8),rnd(0.8,1.8),1.5,0.92,0.96,1,0.85,22,0.2);}sound.play('splash');}
  function dirt(p){for(let k=0;k<50;k++){const a=rnd(0,TAU);smoke.spawn(p.x,p.y,p.z,Math.cos(a)*rnd(1,6),rnd(6,18),Math.sin(a)*rnd(1,6),rnd(0.8,1.6),rnd(1,2),1.5,0.36,0.3,0.22,0.9,16,0.3);}}
  function puff(p){for(let k=0;k<20;k++) smoke.spawn(p.x+rnd(-2,2),p.y+rnd(-2,2),p.z+rnd(-2,2),rnd(-1,1),rnd(-1,1),rnd(-1,1),rnd(1.5,3),rnd(2,3.5),1.5,0.2,0.2,0.22,0.7,0,0.5);fire.spawn(p.x,p.y,p.z,0,0,0,0.25,4,0.5,1,0.7,0.3,1,0,0);}
  const projGeo=new THREE.CylinderGeometry(0.12,0.16,1.6,6);projGeo.rotateZ(Math.PI/2);const projMat=new THREE.MeshStandardMaterial({color:0xd8d8d0,metalness:0.5,roughness:0.4});
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
    flash.position.copy(from);flash.intensity=kind==='shell'||kind==='arc'?200:80;if(kind==='shell'||kind==='arc'){sU.rec=1;S.shake=Math.max(S.shake,0.25);}
    sound.play(kind==='missile'||kind==='rocket'||kind==='torp'?'missile':'gun',kind==='shell'||kind==='arc');
    for(let j=0;j<n;j++){
      const P={kind,from:from.clone(),to:to.clone().add(j?new THREE.Vector3(rnd(-1.5,1.5),rnd(-1,1),rnd(-1.5,1.5)):new THREE.Vector3()),t:-j*(kind==='burst'?0.07:0.18),dur,ev,
        arcH:kind==='arc'?dist*0.35:kind==='missile'?(mode==='mar'||mode==='suelo'?dist*0.12:dist*0.06):kind==='rocket'?dist*0.05:0,obj:null,last:from.clone(),wob:rnd(0,6)};
      if(kind==='missile'||kind==='rocket'||kind==='torp'){P.obj=new THREE.Mesh(projGeo,projMat);P.obj.scale.setScalar(kind==='rocket'?0.6:kind==='torp'?1.2:1);scene.add(P.obj);}
      else {const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3(1,0,0)]);P.obj=new THREE.Line(g,new THREE.LineBasicMaterial({color:kind==='burst'?0xffd27a:0xfff0b0,transparent:true,blending:THREE.AdditiveBlending}));scene.add(P.obj);}
      P.done=()=>{left--;scene.remove(P.obj);if(left===0) impact(ev,P.to,cb);};
      S.proj.push(P);}
    if((kind==='missile'||kind==='torp'||kind==='arc')&&!S.userCam()) {S.camMode='follow';S.follow=S.proj[S.proj.length-1];}
    if(ev.kill){S.slowPending=true;}
  }
  function posAt(P,u){const p=P.from.clone().lerp(P.to,u);p.y+=Math.sin(Math.PI*u)*P.arcH;if(P.kind==='missile'){p.z+=Math.sin(u*9+P.wob)*0.6*(1-u);}return p;}
  function impact(ev,p,cb){const tU=S.units[1-ev.s];
    if(ev.hit){ if(ev.pen){boom(p,ev.kill);tU.flash=0.4;} else sparks(p); if(mode==='mar'&&!ev.pen){} if(mode==='mar'&&ev.k==='torp') splash(new THREE.Vector3(p.x,0,p.z),true);}
    else { if(mode==='mar') splash(new THREE.Vector3(p.x,0,p.z),false); else if(mode==='suelo') {dirt(p);boom(p,false);} else if(mode==='cielo') puff(p); else {for(let k=0;k<40;k++) smoke.spawn(p.x,p.y,p.z,rnd(-3,3),rnd(1,5),rnd(-3,3),rnd(1,3),rnd(0.4,0.9),0,0.8,0.9,1,0.6,-3,0.3);} }
    if(!S.userCam()){S.camMode='impact';S.camT=0;S.camTarget.copy(p);}
    if(ev.kill){S.slow=1.6;}
    setTimeout(()=>{if(!ev.kill&&!S.userCam()) S.camMode='wide'; cb&&cb();},ev.kill?900:450);}
  function kill(i){const U=S.units[i];U.dead=true;U.burn=1;U.mesh.material.color&&U.mesh.material.color.multiplyScalar(0.55);}
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
  function baseDist(){const asp=W0()/H0();return (SEP+L*1.25)/(2*Math.tan(THREE.MathUtils.degToRad(24))*asp)*0.98;}
  function updateCam(dt){
    const mid=new THREE.Vector3((S.units[0].x+S.units[1].x)/2,(S.units[0].g.position.y+S.units[1].g.position.y)/2,(S.units[0].z+S.units[1].z)/2);
    let tp,tl;
    if(S.camMode==='follow'&&S.follow&&S.follow.cur){const p=S.follow.cur,dir=S.follow.to.clone().sub(S.follow.from).normalize();tp=p.clone().add(dir.clone().multiplyScalar(-7)).add(new THREE.Vector3(0,mode==='suelo'?5:3.5,17));tl=p.clone().add(dir.multiplyScalar(12));}
    else if(S.camMode==='impact'){S.camT+=dt;tp=S.camTarget.clone().add(new THREE.Vector3(Math.sin(S.camT*0.4)*14,5,18));tl=S.camTarget.clone();if(S.camT>4) S.camMode='wide';}
    else {if(!S.userCam()&&!drag) S.az+=(0.42*Math.sin(S.t*0.07)-S.az)*Math.min(1,dt*0.6);
      const d=baseDist()*S.dist;tp=mid.clone().add(new THREE.Vector3(Math.sin(S.az)*d*Math.cos(S.el),Math.sin(S.el)*d+(mode==='suelo'?6:2),Math.cos(S.az)*d*Math.cos(S.el)));tl=mid.clone();}
    if(mode==='suelo'){const gy=groundH(tp.x,tp.z)+3;if(tp.y<gy)tp.y=gy;}
    if(mode==='mar'&&tp.y<3)tp.y=3; if(mode==='sub'&&tp.y>55) tp.y=55;
    const k=1-Math.pow(0.02,dt);camPos.lerp(tp,S.camMode==='follow'?Math.min(1,k*2.2):k);camLook.lerp(tl,S.camMode==='follow'?Math.min(1,k*2.5):k);
    cam.position.copy(camPos);if(S.shake>0){cam.position.add(tmp.set(rnd(-1,1),rnd(-1,1),rnd(-1,1)).multiplyScalar(S.shake*0.8));S.shake=Math.max(0,S.shake-dt*2.2);}cam.lookAt(camLook);}
  // init camera
  {const d=baseDist();camPos.set(0,8,d*1.3);camLook.set(0,0,0);}
  // ===== loop =====
  let last=performance.now(),raf=0,frames=[],alive=true,visible=true;
  const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{visible=es[0].isIntersecting;}):null; if(io) io.observe(el);
  function frame(now){if(!alive)return;raf=requestAnimationFrame(frame);if(!visible){last=now;return;}
    let rdt=Math.min(0.05,(now-last)/1000);last=now;frames.push(rdt);if(frames.length>90)frames.shift();
    if(S.slow>0){S.slow-=rdt;S.ts=0.3;}else S.ts+=(1-S.ts)*Math.min(1,rdt*4);
    const dt=rdt*S.ts;S.t+=dt;
    // units motion
    S.units.forEach((U,i)=>{const t=S.t+U.phase;let y=0,rx=0,rz=0;
      if(mode==='cielo'){ if(U.dead){U.vy+=dt*9;U.fall+=U.vy*dt;U.inner.rotation.z+=dt*U.dir*-0.9;U.inner.rotation.x+=dt*2.2;U.x+=U.dir*dt*6; if(Math.random()<0.8) {fire.spawn(U.x,U.y0-U.fall,U.z,0,0,0,0.4,1.6,1,1,0.55,0.15,0.9,0,0);smoke.spawn(U.x,U.y0-U.fall,U.z,rnd(-1,1),rnd(0,2),rnd(-1,1),rnd(2,4),rnd(1.5,2.5),2.5,0.1,0.1,0.1,0.7,-0.3,0.3);} }
        y=U.y0+Math.sin(t*0.9)*1.6-U.fall; if(!U.dead){rx=Math.sin(t*0.7)*0.28;rz=Math.sin(t*0.9+1)*0.06;U.x+=Math.sin(t*0.35)*0.02;}
        // contrails
        if(!U.dead&&Math.random()<0.5) smoke.spawn(U.x-U.dir*U.w*0.5,y,U.z,-U.dir*2,0,0,1.2,0.5,3,0.95,0.95,0.97,0.25,0,0);
      } else if(mode==='suelo'){const gx=groundH(U.x,U.z),gx2=groundH(U.x+2,U.z),gx1=groundH(U.x-2,U.z);y=gx+U.h*0.46;rz=Math.atan2(gx2-gx1,4)*U.dir;
        if(!U.dead){y+=Math.sin(t*8)*0.03;}
        U.rec=Math.max(0,U.rec-dt*4);U.inner.position.x=-U.dir*U.rec*0.5;
        if(Math.random()<0.15&&!U.dead) smoke.spawn(U.x-U.dir*U.w*0.45,gx+0.5,U.z+rnd(-1,1),-U.dir*rnd(0.5,2),rnd(0.3,1),0,rnd(1,2),rnd(0.8,1.4),2,0.55,0.5,0.42,0.25,-0.2,0.5);
      } else if(mode==='mar'){const t2=S.t;const hh=waveH(U.x,U.z,t2),hf=waveH(U.x+U.w*0.4,U.z,t2),hb=waveH(U.x-U.w*0.4,U.z,t2),hl=waveH(U.x,U.z+2,t2),hr=waveH(U.x,U.z-2,t2);
        y=hh*0.6+U.h*0.32-U.fall;rz=Math.atan2(hf-hb,U.w*0.8)*0.5*U.dir;rx=Math.atan2(hl-hr,4)*0.4;
        if(U.dead){U.fall+=dt*0.9;rz+=U.fall*0.03*U.dir;rx+=U.fall*0.04;if(Math.random()<0.5){fire.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.1,U.z,0,rnd(2,5),0,rnd(0.4,0.9),rnd(1.5,3),1,1,0.5,0.15,0.9,-2,0);smoke.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.3,U.z,rnd(0,2),rnd(3,6),rnd(-1,1),rnd(3,6),rnd(2,4),3,0.08,0.08,0.08,0.7,-0.2,0.2);}}
        else if(Math.random()<0.6) smoke.spawn(U.x+U.dir*U.w*0.45,0.2,U.z+rnd(-1.2,1.2),U.dir*rnd(0,1),rnd(0.5,2),rnd(-1.5,1.5),rnd(0.6,1.2),rnd(0.6,1.2),1,0.95,0.97,1,0.6,3,0.5);
      } else {y=U.y0+Math.sin(t*0.5)*0.8-U.fall;rz=Math.sin(t*0.4)*0.03;
        if(U.dead){U.fall+=dt*(1.5+U.fall*0.15);rz+=Math.min(0.5,U.fall*0.03)*U.dir;if(Math.random()<0.6) smoke.spawn(U.x+rnd(-U.w*0.3,U.w*0.3),y+U.h*0.2,U.z,rnd(-0.5,0.5),rnd(2,5),rnd(-0.5,0.5),rnd(2,4),rnd(0.3,0.8),0,0.8,0.9,1,0.6,-3,0.2);const by=groundH(U.x,U.z)+U.h*0.3;if(y<by){y=by;}}
        else if(Math.random()<0.3) smoke.spawn(U.x-U.dir*U.w*0.5,y,U.z,-U.dir,rnd(0.5,1.5),0,rnd(1.5,3),rnd(0.3,0.6),0,0.8,0.9,1,0.45,-2,0.2);}
      if(U.dead&&mode==='suelo'){U.burn+=dt;if(Math.random()<0.9){fire.spawn(U.x+rnd(-U.w*0.25,U.w*0.25),y+U.h*0.2,U.z+rnd(-1,1),rnd(-0.5,0.5),rnd(2,5),rnd(-0.5,0.5),rnd(0.4,0.9),rnd(1,2.2),1,1,rnd(0.4,0.6),0.12,0.9,-3,0);smoke.spawn(U.x+rnd(-1,1),y+U.h*0.5,U.z,rnd(0,1.5),rnd(3,6),rnd(-0.5,0.5),rnd(3,6),rnd(1.5,3),3.5,0.07,0.07,0.07,0.75,-0.3,0.1);}}
      U.g.position.set(U.x,y,U.z);U.inner.rotation.z=U.dead&&mode==='cielo'?U.inner.rotation.z:rz;if(!(U.dead&&mode==='cielo'))U.inner.rotation.x=rx;
      const em=(U.mesh.material.userData.em||0)*(U.dead?0.35:1);if(U.flash>0){U.flash-=rdt;U.mesh.material.emissive&&U.mesh.material.emissive.setRGB(em+U.flash*2,em+U.flash*1.2,em+U.flash*0.4);} else if(U.mesh.material.emissive) U.mesh.material.emissive.setRGB(em,em,em);
    });
    // scenery motion
    if(mode==='cielo'){terrain.position.x-=dt*30;if(terrain.position.x<-1000)terrain.position.x+=1000;clouds.forEach(c=>{c.position.x-=dt*(22+c.scale.y*0.05);if(c.position.x<-1600)c.position.x+=3200;});}
    if(mode==='mar'){water.material.uniforms.t.value=S.t;clouds.forEach(c=>{c.position.x-=dt*3;if(c.position.x<-2300)c.position.x+=4600;});}
    if(mode==='sub'){shafts.forEach((m,i)=>{m.material.opacity=0.18+0.14*Math.sin(S.t*0.6+i);});if(Math.random()<0.3) smoke.spawn(rnd(-80,80),groundH(0,0)+2,rnd(-60,20),0,rnd(1,3),0,rnd(6,12),rnd(0.3,0.6),0,0.8,0.9,1,0.3,-0.3,0);}
    // projectiles
    for(let k=S.proj.length-1;k>=0;k--){const P=S.proj[k];P.t+=dt;if(P.t<0){P.obj.visible=false;continue;}P.obj.visible=true;const u=clamp(P.t/P.dur,0,1);const p=posAt(P,u),pn=posAt(P,Math.min(1,u+0.02));P.cur=p;
      if(P.obj.isLine){const seg=P.kind==='burst'?3:5;const a=p.clone().sub(pn.clone().sub(p).normalize().multiplyScalar(seg));P.obj.geometry.setFromPoints([a,p]);}
      else {P.obj.position.copy(p);P.obj.lookAt(pn);P.obj.rotateY(-Math.PI/2);}
      if(P.kind==='missile'||P.kind==='rocket'){fire.spawn(p.x,p.y,p.z,0,0,0,0.12,P.kind==='rocket'?0.9:1.4,0,1,0.8,0.4,1,0,0);const st=P.last.distanceTo(p);const nn=Math.ceil(st/0.5);for(let q=0;q<nn;q++){const qq=P.last.clone().lerp(p,q/nn);smoke.spawn(qq.x,qq.y,qq.z,rnd(-0.3,0.3),rnd(0,0.4),rnd(-0.3,0.3),rnd(1.6,3),rnd(0.5,0.8),3.5,0.86,0.86,0.86,0.45,-0.1,0.4);}}
      if(P.kind==='torp'){if(mode==='mar') smoke.spawn(p.x,0.15,p.z+rnd(-0.6,0.6),0,rnd(0.2,0.6),rnd(-0.5,0.5),rnd(1.5,3),rnd(0.6,1.2),2,0.95,0.98,1,0.6,0,0.5); else for(let q=0;q<3;q++) smoke.spawn(p.x,p.y,p.z,rnd(-0.5,0.5),rnd(1,3),rnd(-0.5,0.5),rnd(1,2.5),rnd(0.2,0.5),0,0.85,0.95,1,0.6,-3,0.2);}
      if(P.kind==='arc'&&Math.random()<0.6) smoke.spawn(p.x,p.y,p.z,0,0,0,0.6,0.5,1,0.9,0.85,0.7,0.4,0,0);
      if(S.slowPending&&P.ev.kill&&u>0.7){S.slowPending=false;S.slow=1.4;}
      P.last.copy(p);if(u>=1){S.proj.splice(k,1);P.done();}}
    fire.update(dt);smoke.update(dt);flash.intensity*=Math.pow(0.02,rdt);
    fire.mat.uniforms.uScale.value=smoke.mat.uniforms.uScale.value=renderer.domElement.height/ (2*Math.tan(THREE.MathUtils.degToRad(24)));
    updateCam(rdt);renderer.render(scene,cam);}
  raf=requestAnimationFrame(frame);
  function resize(){renderer.setSize(W0(),H0());cam.aspect=W0()/H0();cam.updateProjectionMatrix();}
  window.addEventListener('resize',resize);
  return {
    ok:true,
    fps(){if(frames.length<20)return null;const a=frames.reduce((x,y)=>x+y,0)/frames.length;return 1/a;},
    shot(ev,cb){fireShot(ev,cb);},
    kill(i){kill(i);},
    reset(){S.units.forEach(U=>{if(U.dead){U.dead=false;U.fall=0;U.vy=0;U.inner.rotation.set(0,0,0);U.x=U.dir>0?-SEP/2:SEP/2;if(U.mesh.material.color)U.mesh.material.color.set(U.mesh.material.map?0xffffff:0x4a5058);}});S.camMode='wide';},
    dispose(){alive=false;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);if(io)io.disconnect();renderer.dispose();try{renderer.forceContextLoss();}catch(e){}scene.traverse(x=>{if(x.geometry)x.geometry.dispose();if(x.material){(Array.isArray(x.material)?x.material:[x.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});if(renderer.domElement.parentNode)renderer.domElement.parentNode.removeChild(renderer.domElement);}
  };
}
