/* M.A.T — Armero 3D: accesorios modelados por M.A.T (geometría procedimental, low-poly)
   Cada pieza se construye en código a partir de las MEDIDAS OFICIALES del fabricante (largo, diámetro, alto, ancho)
   que figuran en ACC (armero.js) con su fuente. La forma de detalle es aproximada. Nada generado por IA ni extraído de juegos.
   Unidades internas: milímetros. Escala final K = 0,00118 (la misma que la serie Low-Poly de GoldbergR). */
import * as THREE from './three.module.min.js';
export const K=0.00118;
const D2R=Math.PI/180;
function M(c,met,rough,o){ return Object.assign(new THREE.MeshStandardMaterial({color:c,metalness:met,roughness:rough}),o||{}); }
export function mats(fde){
  const base=fde?0x8a7556:0x1d1e20;
  return {
    body:M(base,fde?0.08:0.45,fde?0.62:0.42), poly:M(fde?0x86714f:0x17181a,0.02,0.78), steel:M(0x45484c,0.9,0.33),
    dark:M(0x0e0f10,0.3,0.55), rubber:M(0x101112,0,0.92),
    glass:M(0x5a86a8,0.2,0.04,{transparent:true,opacity:0.32,depthWrite:false}), glassA:M(0xd08a30,0.3,0.05,{transparent:true,opacity:0.45,depthWrite:false}),
    lens:M(0x1a2c3c,0.6,0.08), lensA:M(0x4a3a20,0.6,0.08), red:M(0xff2a20,0,0.4,{emissive:new THREE.Color(0xff2010),emissiveIntensity:1.4}),
    fiber:M(0x9a3a16,0.1,0.5,{emissive:new THREE.Color(0x5a1a06),emissiveIntensity:0.6}),
    lightlens:M(0xd8e2ea,0.4,0.05,{emissive:new THREE.Color(0x30383e),emissiveIntensity:0.4}),
    brass:M(0xb08a3c,1,0.3)
  };
}
function marks(P){ for(const k of ['glass','glassA','lens','lensA','red','fiber','lightlens','brass','steel','rubber']) P[k].userData.nocamo=1; for(const k in P) P[k].userData.kit=1; return P; }

function add(G,geo,m,x=0,y=0,z=0,o){ const me=new THREE.Mesh(geo,m); me.position.set(x,y,z); if(o&&o.rx) me.rotation.x=o.rx; if(o&&o.ry) me.rotation.y=o.ry; if(o&&o.rz) me.rotation.z=o.rz; me.castShadow=true; me.receiveShadow=true; G.add(me); return me; }
// cilindro a lo largo de +Z desde z0, radios trasero r1 y delantero r2
function cyl(G,m,r1,r2,len,z0,y=0,x=0,seg=16){ const g=new THREE.CylinderGeometry(r2,r1,len,seg,1); g.rotateX(Math.PI/2); return add(G,g,m,x,y,z0+len/2); }
// cilindro vertical (eje Y) centrado
function vcyl(G,m,r,h,x,y,z,seg=12){ return add(G,new THREE.CylinderGeometry(r,r,h,seg),m,x,y,z); }
// cilindro lateral (eje X)
function xcyl(G,m,r,len,x,y,z,seg=12){ const g=new THREE.CylinderGeometry(r,r,len,seg); g.rotateZ(Math.PI/2); return add(G,g,m,x,y,z); }
// caja achaflanada: sección w×h (x,y) con chaflán ch, extruida a lo largo de Z (largo l), centrada
function bx(G,m,w,h,l,x,y,z,ch=0){
  if(!ch){ return add(G,new THREE.BoxGeometry(w,h,l),m,x,y,z); }
  const s=new THREE.Shape(), a=w/2, b=h/2, c=Math.min(ch,a*0.9,b*0.9);
  s.moveTo(-a+c,-b); s.lineTo(a-c,-b); s.lineTo(a,-b+c); s.lineTo(a,b-c); s.lineTo(a-c,b); s.lineTo(-a+c,b); s.lineTo(-a,b-c); s.lineTo(-a,-b+c); s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:l,bevelEnabled:false}); g.translate(0,0,-l/2); return add(G,g,m,x,y,z);
}
// perfil de torno: pts=[[r,z],...] alrededor del eje Z
function lathe(G,m,pts,seg=18,y=0,x=0){ const g=new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(Math.max(0.01,p[0]),p[1])),seg); g.rotateX(Math.PI/2); return add(G,g,m,x,y,0); }
// perfil lateral: pts=[[z,y],...] extruido en X con anchura w (centrado en x)
function side(G,m,pts,w,x=0,bev=0){
  const s=new THREE.Shape(); pts.forEach((p,i)=>i?s.lineTo(p[0],p[1]):s.moveTo(p[0],p[1])); s.closePath();
  const bv=Math.min(bev,w*0.3); const g=new THREE.ExtrudeGeometry(s,{depth:w-2*bv,bevelEnabled:bv>0,bevelThickness:bv,bevelSize:bv,bevelSegments:1,curveSegments:6});
  g.rotateY(-Math.PI/2); g.translate(x+(w-2*bv)/2,0,0); return add(G,g,m,0,0,0);
}
// abrazadera Picatinny: base sobre el raíl (y=0 en la cara superior del raíl)
function clamp(G,m,len,w,h,z=0,lever){ bx(G,m,w,h,len,0,h/2,z,1.2); bx(G,m,w+4,3,len*0.9,0,1.5,z,0.8); if(lever){ bx(G,m,3,h*0.7,len*0.5,(w/2+3)*lever,h*0.45,z,0.8); } }
// anillas de visor (y del eje óptico = ay, radio tubo = tr)
function rings(G,m,ay,tr,zs,w=14){ for(const z of zs){ bx(G,m,tr*2+6,ay*0.55,w,0,ay*0.28,z,1.5); const g=new THREE.TorusGeometry(tr+2.2,2.6,6,16); add(G,g,m,0,ay,z); } }


/* ===== Miras (origen: centro de la base, sobre la cara superior del raíl; eje óptico a la altura ay) ===== */
// tapa de lente con anillo: disco de vidrio + aro
function lens(G,P,r,z,ay,back,mat){ add(G,new THREE.CircleGeometry(r,18),mat||P.lens,0,ay,z+(back?-0.3:0.3),back?{ry:Math.PI}:null); }
// Aimpoint CompM4 / M68 CCO con espaciador y montura QRP2. d={len,w,h,ay}
function aimpoint(d,P){ const G=new THREE.Group(); const L=d.len, ay=d.ay, R=19, z0=-L/2;
  bx(G,P.body,24,8,40,0,4,0,1.5); bx(G,P.body,30,3,36,0,1.5,0,0.6);                 // QRP2: abrazadera
  xcyl(G,P.dark,9,10,-19,5,0,10); bx(G,P.dark,6,4,12,-22,4,0,1);                       // pomo de apriete (izquierda)
  bx(G,P.body,22,ay-R-6,30,0,8+(ay-R-6)/2-1,0,2);                                       // espaciador
  const ring=new THREE.TorusGeometry(R+1.5,3.5,6,20); add(G,ring,P.body,0,ay,0);
  lathe(G,P.body,[[0,z0],[R+2.5,z0],[R+3,z0+3],[R+3,z0+19],[R,z0+23],[R-1,z0+L*0.4],[R,z0+L*0.62],[R+3.5,z0+L-26],[R+4,z0+L-3],[R+3,z0+L],[0,z0+L]],20,ay);
  lens(G,P,R+0.5,z0+L,ay,false); lens(G,P,R,z0,ay,true);
  vcyl(G,P.body,7,7,0,ay+R+3,z0+L*0.42,12); xcyl(G,P.body,7,7,R+3,ay,z0+L*0.42,12);     // tapas de reglaje (arriba y derecha)
  vcyl(G,P.body,9.5,d.h-ay-R+2,R*0.55,ay+R*0.7+(d.h-ay-R)/2,z0+L*0.7,14);                // compartimento de pila AA vertical
  vcyl(G,P.dark,10.5,5,R*0.55,d.h-3,z0+L*0.7,14);                                        // tapa de pila
  xcyl(G,P.dark,6,8,-(R+3),ay,z0+L*0.7,12);                                               // mando de intensidad
  return G; }
// Aimpoint Micro T-2 en montura LRP con espaciador de 39 mm. d={len,w,h,ay,sl(longitud del visor)}
function micro(d,P){ const G=new THREE.Group(); const L=d.sl||68, ay=d.ay, R=15.5;
  bx(G,P.body,22,7,40,0,3.5,0,1.5); bx(G,P.body,28,3,36,0,1.5,0,0.6); bx(G,P.steel,5,5,26,15,5,-2,1);   // LRP + palanca
  if(ay-R-6>1) bx(G,P.body,20,ay-R-5,34,0,7+(ay-R-5)/2-1,0,2);
  bx(G,P.body,30,R*1.2,L*0.78,0,ay-R*0.35,0,5);                                                        // cuerpo cuadrado
  lathe(G,P.body,[[0,-L/2],[R,-L/2],[R+1,-L/2+3],[R+1,L/2-4],[R+2,L/2-2],[R+1,L/2],[0,L/2]],18,ay);
  lens(G,P,R-1,L/2,ay,false); lens(G,P,R-1,-L/2,ay,true);
  bx(G,P.body,10,8,14,0,ay+R+3,-2,2); vcyl(G,P.dark,5,5,0,ay+R+7,-2,10);                               // torreta de elevación
  xcyl(G,P.body,8,7,R+3.5,ay+2,-4,12); xcyl(G,P.dark,6,6,-(R+3),ay,-4,10);                             // mando/pila a la derecha, deriva a la izquierda
  return G; }
// Holosun HS510C: reflex abierto, capucha delantera con ventana, base QD. d={len,w,h}
function hs510(d,P){ const G=new THREE.Group(); const L=d.len, W=d.w, H=d.h;
  bx(G,P.body,W*0.72,9,L*0.9,0,4.5,0,2);                                            // base con abrazadera integrada
  bx(G,P.dark,5,6,L*0.38,-(W*0.36+2),5,-L*0.12,1);                                  // palanca QD (izquierda)
  bx(G,P.body,W*0.62,13,L*0.5,0,15,-L*0.22,3);                                      // emisor trasero
  bx(G,P.dark,W*0.3,1.5,L*0.14,0,21.8,-L*0.3,0);                                    // célula solar
  const z1=-L*0.02, z2=L/2, hz=(z2-z1);                                              // capucha (delantera)
  bx(G,P.body,4,H-9,hz,W/2-2,9+(H-9)/2,(z1+z2)/2,1.2); bx(G,P.body,4,H-9,hz,-W/2+2,9+(H-9)/2,(z1+z2)/2,1.2);
  bx(G,P.body,W,5,hz,0,H-2.5,(z1+z2)/2,2); bx(G,P.body,W,8,hz,0,13,(z1+z2)/2,2);
  bx(G,P.body,W,H-9,3,0,9+(H-9)/2,z2-1.5,0);  // marco frontal (se recorta con la ventana)
  bx(G,P.glassA||P.glass,W-9,H-24,1,0,9+(H-9)/2+2,z2-3.2,0);
  return G; }
// EOTech EXPS3: base QD elevada, cuerpo bajo, capucha en «U», pila transversal delante. d={len,w,h}
function eotech(d,P){ const G=new THREE.Group(); const L=d.len, W=d.w, H=d.h, zf=L/2, zr=-L/2;
  bx(G,P.body,30,12,L*0.82,0,6,-L*0.03,1.5); bx(G,P.body,36,3,L*0.72,0,1.5,-L*0.03,0.6);   // base QD elevada (7 mm)
  bx(G,P.dark,5,9,L*0.3,W*0.31+3,7,L*0.06,1);                                               // palanca QD (derecha)
  bx(G,P.body,W*0.84,22,L*0.95,0,12+11,0,3);                                                // cuerpo inferior
  bx(G,P.body,W*0.86,26,L*0.34,0,34+13-3,zr+L*0.17,4);                                      // bloque trasero (botones)
  for(const [z,y] of [[zr+10,32],[zr+22,32]]) bx(G,P.dark,1.6,8,9,-W*0.43-0.8,y,z,0.5);    // botones (izquierda)
  xcyl(G,P.dark,5.5,2,-W*0.43-1,48,zr+17,10);                                               // botón NV
  xcyl(G,P.body,12.5,W*0.95,0,22,zf-8,16); xcyl(G,P.dark,13,3,W*0.47,22,zf-8,16);           // pila CR123 transversal delante
  const wz0=zr+L*0.3, wz1=zf-2, wl=wz1-wz0, wc=(wz0+wz1)/2;                                  // capucha en U
  bx(G,P.body,4.5,H-34,wl,W/2-2.25,34+(H-34)/2,wc,1.5); bx(G,P.body,4.5,H-34,wl,-W/2+2.25,34+(H-34)/2,wc,1.5);
  bx(G,P.body,W,5.5,wl,0,H-2.75,wc,2);
  bx(G,P.glass,W-9,H-42,1.2,0,34+(H-42)/2+2,wz1-3,0); bx(G,P.glass,W-9,H-42,1.2,0,34+(H-42)/2+2,wz0+3,0);
  return G; }
// Trijicon ACOG TA31 (4×32) en montura TA51. d={len,w,h,ay,rmr}
function acog(d,P){ const G=new THREE.Group(); const L=d.len, ay=d.ay, z0=-L/2, ro=19;
  bx(G,P.body,26,8,L*0.48,0,4,L*0.05,1.5); bx(G,P.body,32,3,L*0.42,0,1.5,L*0.05,0.6);                    // TA51
  for(const z of [-L*0.1,L*0.2]){ xcyl(G,P.dark,6,6,-19,5,z,10); }                                       // tornillos de mano (izquierda)
  side(G,P.body,[[-L*0.25,8],[L*0.32,8],[L*0.32,ay-6],[-L*0.25,ay-6]],22,0,2);                           // pie del cuerpo
  lathe(G,P.body,[[0,z0],[13,z0],[14,z0+3],[14,z0+L*0.15],[12.5,z0+L*0.18],[12.5,z0+L*0.24],[15,z0+L*0.27],[17,z0+L*0.4],[17,z0+L*0.55],[ro,z0+L*0.7],[ro+1.5,z0+L-4],[ro,z0+L],[0,z0+L]],18,ay);
  bx(G,P.body,30,32,L*0.36,0,ay+1,-L*0.04,7);                                                            // carcasa central «cuadrada»
  side(G,P.body,[[-L*0.12,ay+14],[L*0.46,ay+ro-2],[L*0.5,ay+ro+4],[L*0.47,d.h-ay>0?d.h:ay+27],[-L*0.08,ay+17]],16,0,1.5); // carenado de la fibra
  bx(G,P.fiber,4,1.6,L*0.5,0,ay+20.5+L*0.0,L*0.2,0.3);
  vcyl(G,P.body,7,8,0,ay+18,-L*0.14,12); xcyl(G,P.body,7,8,17,ay,-L*0.14,12);                           // reglajes (arriba, derecha)
  lens(G,P,ro-2,z0+L,ay,false,P.lensA); lens(G,P,11,z0,ay,true);
  if(d.rmr){ const r=rmr(d.rmr,P); r.position.set(0,ay+17,-L*0.3); G.add(r); }
  return G; }
// Trijicon RMR Type 2. d={len,w,h}
function rmr(d,P){ const G=new THREE.Group(); const L=d.len, W=d.w, H=d.h;
  bx(G,P.body,W,H*0.36,L,0,H*0.18,0,2);
  side(G,P.body,[[-L*0.5,H*0.3],[L*0.12,H*0.3],[L*0.42,H],[L*0.5,H*0.95],[L*0.5,H*0.3],[L*0.5,H*0.3]],3,W/2-1.5,0.5);
  side(G,P.body,[[-L*0.5,H*0.3],[L*0.12,H*0.3],[L*0.42,H],[L*0.5,H*0.95],[L*0.5,H*0.3]],3,-W/2+1.5,0.5);
  bx(G,P.body,W,2.5,L*0.25,0,H-1.5,L*0.36,0.6);
  const g=new THREE.PlaneGeometry(W-6,H*0.6); const m=add(G,g,P.glass,0,H*0.62,L*0.3); m.rotation.x=-0.35;
  return G; }
// ELCAN SpecterDR 1×/4× con montura integrada. d={len,w,h,ay}
function elcan(d,P){ const G=new THREE.Group(); const L=d.len, W=d.w, H=d.h, ay=d.ay, z0=-L/2;
  bx(G,P.body,30,10,L*0.5,0,5,-L*0.04,2); bx(G,P.body,36,3,L*0.44,0,1.5,-L*0.04,0.6);
  for(const z of [-L*0.2,L*0.1]){ bx(G,P.dark,8,8,10,20,6,z,1.5); }                                       // palancas de la montura (derecha)
  side(G,P.body,[[-L*0.32,9],[L*0.24,9],[L*0.24,ay-14],[-L*0.32,ay-14]],30,0,3);
  bx(G,P.body,W*0.7,H*0.62,L*0.6,0,ay+2,-L*0.06,9);                                                       // cuerpo prismático
  lathe(G,P.body,[[0,z0],[16,z0],[17,z0+3],[17,z0+L*0.18],[15,z0+L*0.22],[16,z0+L*0.6],[21,z0+L*0.72],[22.5,z0+L-3],[21.5,z0+L],[0,z0+L]],18,ay);
  bx(G,P.dark,W*0.82,7,7,0,ay+H*0.27,-L*0.06,1.5);                                                        // eje de la palanca
  bx(G,P.dark,7,7,28,-W*0.41,ay+H*0.27,-L*0.06+12,1.5);                                                   // palanca de cambio 1×/4× (izquierda)
  vcyl(G,P.body,7,6,0,ay+H*0.35,L*0.06,12); xcyl(G,P.body,7,6,W*0.36,ay+4,L*0.06,12);
  lens(G,P,19.5,z0+L,ay,false); lens(G,P,14,z0,ay,true);
  return G; }
// Visor de aumento variable (Nightforce NX8 1-8×24) en montura voladiza genérica. d={len,tube,ay,ml}
function lpvo(d,P){ const G=new THREE.Group(); const L=d.len, r=d.tube/2, ay=d.ay, z0=-L/2, ro=16, re=20;
  bx(G,P.body,24,8,L*0.5,0,4,L*0.1,1.5); bx(G,P.body,30,3,L*0.45,0,1.5,L*0.1,0.6);
  side(G,P.body,[[-L*0.05,8],[L*0.32,8],[L*0.32,ay-r-1],[L*0.12,ay-r-1],[-L*0.2,ay-r-1],[-L*0.2,ay-r-8],[-L*0.05,ay-r-8]],18,0,2); // brazo voladizo
  for(const z of [-L*0.2+8,L*0.24]){ const t=new THREE.TorusGeometry(r+2.5,3,6,18); add(G,t,P.body,0,ay,z); }
  lathe(G,P.body,[[0,z0],[re-1,z0],[re,z0+3],[re,z0+L*0.2],[re-2,z0+L*0.23],[re-2,z0+L*0.27],[r+1,z0+L*0.3],[r,z0+L*0.33],[r,z0+L*0.78],[ro-1,z0+L*0.86],[ro,z0+L-3],[ro-1,z0+L],[0,z0+L]],20,ay);
  bx(G,P.dark,4,9,6,re+2,ay+4,z0+L*0.21,1);                                                               // palanca de aumentos
  bx(G,P.body,r*2+6,r*2+4,L*0.13,0,ay,-L*0.02,4);                                                        // silla de torretas
  vcyl(G,P.body,11,11,0,ay+r+7,-L*0.02,16); xcyl(G,P.body,11,11,r+7,ay,-L*0.02,16); xcyl(G,P.body,10,9,-(r+6),ay,-L*0.02,16);
  lens(G,P,ro-2,z0+L,ay,false); lens(G,P,re-2,z0,ay,true);
  return G; }
// Magnificador 3× EOTech G33 en montura abatible STS. d={len,w,h,ay}
function magnifier(d,P){ const G=new THREE.Group(); const L=d.len, ay=d.ay, r=19, z0=-L/2;
  bx(G,P.body,24,8,34,0,4,-L*0.18,1.5); bx(G,P.body,30,3,30,0,1.5,-L*0.18,0.6); bx(G,P.dark,6,9,26,17,6,-L*0.18,1);   // base QD + palanca
  side(G,P.body,[[-L*0.34,8],[-L*0.02,8],[-L*0.02,ay-r+2],[-L*0.34,ay-r+2]],20,-4,2); xcyl(G,P.dark,5,10,-14,ay-r-3,-L*0.18,10); // brazo con bisagra (izquierda)
  lathe(G,P.body,[[0,z0+6],[r-2,z0+6],[r-1,z0+L*0.32],[r+1,z0+L*0.36],[r+1,z0+L-12],[r-1,z0+L-10],[r-1,z0+L],[0,z0+L]],18,ay);
  bx(G,P.body,r*2+3,r*2+3,L*0.5,0,ay,L*0.05,8);                                                          // cuerpo
  lathe(G,P.rubber,[[r-3,z0],[r+0.5,z0],[r+0.5,z0+8],[r-2,z0+8]],16,ay);                                  // ocular de goma
  vcyl(G,P.dark,6,6,0,ay+r+4,-L*0.12,10);
  lens(G,P,r-3,z0+L,ay,false); lens(G,P,r-4,z0,ay,true);
  return G; }


/* ===== utilidades ===== */
// une geometrías (no indexadas) en una sola para ahorrar llamadas de dibujo
function merge(geos){ let n=0; const gs=geos.map(g=>{ const q=g.index?g.toNonIndexed():g; n+=q.attributes.position.count; return q; });
  const pos=new Float32Array(n*3), nor=new Float32Array(n*3); let o=0; for(const q of gs){ pos.set(q.attributes.position.array,o*3); nor.set(q.attributes.normal.array,o*3); o+=q.attributes.position.count; q.dispose(); }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); return g; }
// hoyuelos (discos oscuros) en filas sobre un cilindro de radio R a lo largo de Z
function dimples(G,m,R,z0,z1,rows,around,rr){ const gs=[]; for(let i=0;i<rows;i++){ const z=z0+(z1-z0)*(i+0.5)/rows, off=(i%2)*Math.PI/around;
  for(let j=0;j<around;j++){ const a=off+j/around*Math.PI*2; const g=new THREE.CircleGeometry(rr,8); g.lookAt(new THREE.Vector3(Math.cos(a),Math.sin(a),0)); g.translate(Math.cos(a)*(R+0.25),Math.sin(a)*(R+0.25),z); gs.push(g); } }
  add(G,merge(gs),m); }

/* ===== Silenciadores (origen: centro trasero sobre el eje del ánima, avanza en +Z). d={len,dia,style} ===== */
function can(d,P){ const G=new THREE.Group(); const L=d.len, R=d.dia/2, st=d.style||'sf', mb=d.fde?P.body:P.body;
  if(st==='sf'){ // SureFire SOCOM-RC2: tubo recto, collarín trasero estriado algo mayor, tapa frontal plana con muescas
    lathe(G,P.body,[[R*0.62,0],[R+0.8,0],[R+0.8,L*0.12],[R,L*0.13],[R,L-3],[R-1.5,L],[R*0.3,L],[R*0.28,L-2]],22);
    const gs=[]; for(let i=0;i<14;i++){ const a=i/14*Math.PI*2; const g=new THREE.BoxGeometry(2,1.6,L*0.1); g.translate(Math.cos(a)*(R+1),Math.sin(a)*(R+1),L*0.06); gs.push(g);} add(G,merge(gs),P.dark);
    for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; bx(G,P.dark,2.5,1.2,2,Math.cos(a)*R*0.75,Math.sin(a)*R*0.75,L-0.2,0); }
  } else if(st==='osprey'){ // SilencerCo Osprey: sección ovalada excéntrica (la mayor parte por debajo del ánima). d.dia = ancho, d.hgt = alto
    const Hh=d.hgt||d.dia, dy=-(Hh-d.dia)/2-1; const g=new THREE.CylinderGeometry(1,1,L,24,1); g.rotateX(Math.PI/2); g.scale(R,Hh/2,1); add(G,g,P.body,0,dy,L/2);
    const c=new THREE.CircleGeometry(1,24); c.scale(R*0.85,Hh/2*0.85,1); add(G,c,P.dark,0,dy,L+0.2); xcyl(G,P.dark,1.6,4,R,dy+Hh*0.2,L*0.12,8);
  } else if(st==='nt4'){ // KAC NT4: manguito perforado con hoyuelos en casi toda su longitud, anillo trasero con pestillo
    lathe(G,P.body,[[R*0.6,0],[R*0.95,0],[R*0.95,L*0.14],[R,L*0.16],[R,L-2.5],[R-1.5,L],[R*0.28,L],[R*0.26,L-2]],22);
    dimples(G,P.dark,R,L*0.2,L*0.96,11,10,2.2); bx(G,P.dark,4,4,12,0,-R-1,L*0.07,1);
  } else if(st==='bt'){ // B&T Rotex / LMX / SMG: tubo liso con sección trasera más estrecha y oscura (anillo QD)
    lathe(G,P.body,[[R*0.8,L*0.17],[R,L*0.2],[R,L-2.5],[R-1.5,L],[R*0.3,L],[R*0.28,L-2]],22);
    lathe(G,P.dark,[[R*0.55,0],[R*0.86,0],[R*0.86,L*0.06],[R*0.8,L*0.07],[R*0.8,L*0.2],[R*0.6,L*0.2]],18);
    bx(G,P.dark,3,4,10,R*0.86+1.5,0,L*0.1,1);
  } else if(st==='kac'){ // KAC M110: tubo largo y fino que cubre el cañón; anillo trasero con pestillo y banda de hoyuelos delante
    lathe(G,P.body,[[R*0.6,0],[R+1,0],[R+1,L*0.08],[R,L*0.1],[R,L-3],[R-1.5,L],[R*0.3,L],[R*0.28,L-2]],22);
    dimples(G,P.dark,R,L*0.7,L*0.95,5,10,2.2); bx(G,P.dark,4,4,14,0,-R-1.5,L*0.05,1);
  } else { lathe(G,P.body,[[R*0.5,0],[R,0],[R,L-2],[R*0.85,L],[R*0.3,L],[R*0.28,L-2]],18); }
  return G; }

/* ===== Culatas de tubo (AR-15/M4). Origen: frente de la culata sobre el eje del tubo; se extiende hacia -Z. d={len,h,w,style} ===== */
function stock(d,P){ const G=new THREE.Group(); const L=d.len, H=d.h, Wd=d.w, st=d.style, top=22, bot=top-H, hb=-24; // hb: parte baja del alojamiento del tubo
  const B=P.poly;
  if(st==='ctr'||st==='moe'){
    side(G,B,[[0,top-4],[-L*0.15,top],[-L+6,top+3],[-L,top+1],[-L,hb+6],[-L*0.42,hb],[0,hb+4]],Wd,0,2);                  // alojamiento del tubo con apoyo de mejilla
    side(G,B,[[-L,top],[-L+15,top],[-L+15,bot+4],[-L+20,bot],[-L,bot]],Wd*0.82,0,2);                                       // cantonera vertical
    side(G,B,[[-L+12,bot+10],[-L+22,bot+6],[-L*0.4,hb-1],[-L*0.32,hb],[-L*0.38,hb+2],[-L+15,bot+22]],Wd*0.62,0,1.5);      // brazo en «A»
    side(G,B,[[-L*0.5,hb-1],[-L*0.18,hb-1],[-L*0.22,hb-9],[-L*0.46,hb-9]],Wd*0.5,0,1.2);                                  // palanca de liberación
    if(st==='ctr') side(G,P.dark,[[-L*0.2,hb-2],[-L*0.02,hb],[-L*0.04,hb-8],[-L*0.2,hb-9]],Wd*0.42,0,1);                  // bloqueo por fricción (CTR)
  } else if(st==='slk'){
    side(G,B,[[0,top-4],[-L*0.2,top],[-L+5,top+2],[-L,top],[-L,bot+6],[-L+8,bot],[-L+22,bot],[-L*0.45,hb-6],[-L*0.15,hb-2],[0,hb+3]],Wd,0,2.5);
    bx(G,P.dark,Wd+0.6,4,L*0.28,0,hb-4,-L*0.45,1);                                                                          // ranura lateral
  } else if(st==='bravo'||st==='sopmod'){
    side(G,B,[[0,top-3],[-L*0.1,top],[-L+5,top],[-L,top-2],[-L,bot+4],[-L+5,bot],[-L+18,bot],[-L*0.48,hb-2],[0,hb+4]],Wd*(st==='sopmod'?0.72:1),0,2.5);
    side(G,B,[[-L*0.42,hb-2],[-L*0.15,hb-1],[-L*0.2,hb-14],[-L*0.38,hb-12]],Wd*0.5,0,1.2);                                 // palanca
    if(st==='sopmod'){ for(const s of [-1,1]){ cyl(G,B,13,13,L*0.7,-L+8,top-12,s*(Wd/2-13),14); lathe(G,P.dark,[[0.1,0],[12,0]],12,top-12,s*(Wd/2-13)).position.z=-L+8; } } // tubos portapilas laterales
  }
  bx(G,P.rubber,Wd*0.92,top-bot,6,0,(top+bot)/2,-L+3,2);                                                                    // cantonera de goma
  return G; }


/* ===== Empuñaduras (origen: centro de la cara superior, contra el raíl inferior; cuelgan hacia -Y) ===== */
function grip(d,P){ const G=new THREE.Group(); const H=d.h, st=d.style;
  if(st==='rvg'){ // Magpul RVG: poste estrecho algo cónico bajo una abrazadera corta, cresta para el dedo delante
    bx(G,P.poly,22,9,40,0,-4.5,0,2); xcyl(G,P.dark,3,26,0,-5,0,8);
    side(G,P.poly,[[-14,-8],[15,-8],[16,-18],[13,-22],[13,-H*0.55],[12,-H+6],[8,-H],[-10,-H],[-13,-H+6],[-14,-H*0.5]],26,0,2.5);
    for(let i=0;i<5;i++) bx(G,P.dark,27,1.2,10,0,-28-i*10,-4,0);
  } else { // Grip Pod GPS-02 cerrado: cilindro (patas recogidas dentro) con abrazadera y botón
    bx(G,P.poly,24,10,52,0,-5,0,2); xcyl(G,P.dark,3,28,0,-6,8,8);
    const r=d.dia/2, L=d.len; const g=new THREE.CylinderGeometry(r*0.92,r,L-14,16); add(G,g,P.poly,0,-12-(L-14)/2,0);
    vcyl(G,P.dark,r*0.98,8,0,-L+2,0,16); for(const s of [-1,1]) bx(G,P.steel,4,6,6,s*r*0.45,-L-1,0,0.8); // tapa y patas recogidas
    xcyl(G,P.dark,5,8,r*0.95,-24,6,10);
    for(let i=0;i<6;i++) vcyl(G,P.dark,r*0.94,1.2,0,-30-i*16,0,16);
  }
  return G; }

/* ===== Linternas (raíl lateral derecho; origen: cara del raíl, se extiende hacia +X). d={len,bez} ===== */
function light(d,P){ const G=new THREE.Group(); const L=d.len, rb=d.bez/2, r=rb*0.86, off=rb+9;
  bx(G,P.body,9,16,24,4.5,0,0,1.5); bx(G,P.body,off-rb+4,13,22,9+(off-rb)/2,0,0,1.5); xcyl(G,P.dark,5,4,1,0,9,10);   // abrazadera con tornillo de mano
  lathe(G,P.body,[[0,-L/2],[r-2,-L/2],[r,-L/2+4],[r,L/2-L*0.3],[rb,L/2-L*0.22],[rb,L/2],[0,L/2]],18,0,off);
  const gs=[]; for(let i=0;i<5;i++){ const g=new THREE.TorusGeometry(rb+0.2,0.9,4,18); g.translate(0,0,L/2-L*0.2+i*4.2); gs.push(g); } const fins=add(G,merge(gs),P.dark,off,0,0);
  add(G,new THREE.CircleGeometry(rb-2,18),P.lightlens,off,0,L/2+0.3);
  lathe(G,P.rubber,[[0,-L/2-6],[r*0.7,-L/2-6],[r*0.8,-L/2]],14,0,off);                                       // pulsador trasero
  return G; }

/* ===== Láseres en el raíl superior (origen: base). d={len,w,h,style} ===== */
function laser(d,P){ const G=new THREE.Group(); const L=d.len, W=d.w, H=d.h, st=d.style;
  bx(G,P.body,24,6,L*0.55,0,3,-L*0.05,1); xcyl(G,P.dark,5,8,W*0.32,4,-L*0.05,10);
  if(st==='peq16'){ const bw=W*0.62;
    bx(G,P.body,bw,H-6,L,-W/2+bw/2,6+(H-6)/2,0,4);                                                            // caja de láseres
    lathe(G,P.body,[[0,-L/2],[15,-L/2],[16,-L/2+8],[16,L/2-12],[19,L/2-6],[19,L/2],[0,L/2]],16,6+(H-6)/2,W/2-19); // linterna blanca (derecha)
    add(G,new THREE.CircleGeometry(17,16),P.lightlens,W/2-19,6+(H-6)/2,L/2+0.3);
    for(const [x,y,r] of [[-W*0.32,H*0.62,7],[-W*0.14,H*0.62,4.5],[-W*0.14,H*0.35,3.5]]) add(G,new THREE.CircleGeometry(r,12),r>5?P.lens:P.lensA,x,y,L/2+0.3);
    vcyl(G,P.dark,9,5,-W*0.2,H+2,-L*0.15,12); vcyl(G,P.dark,5,4,-W*0.38,H+1,L*0.2,10);
  } else { // DBAL-A3: caja plana con tres emisores redondos delante
    bx(G,P.body,W,H-6,L,0,6+(H-6)/2,0,5);
    for(const [x,y,r] of [[-W*0.25,H*0.58,11],[W*0.1,H*0.62,5],[W*0.3,H*0.62,5]]){ add(G,new THREE.CircleGeometry(r,14),r>6?P.lens:P.lensA,x,y,L/2+0.3); if(r>6) lathe(G,P.dark,[[r,L/2-6],[r+2,L/2-6],[r+2,L/2+1],[r,L/2+1]],14,y,x); }
    vcyl(G,P.dark,7,5,W*0.2,H+2,-L*0.2,12); vcyl(G,P.dark,6,4,-W*0.25,H+1.5,-L*0.2,10); vcyl(G,P.dark,5,4,0,H+1.5,L*0.15,10);
  }
  return G; }

/* ===== Bípode Atlas BT10 (origen: abrazadera bajo el raíl inferior; cuelga en -Y). d={hmin} ===== */
function atlas(d,P){ const G=new THREE.Group(); const Hh=d.hmin||122;
  bx(G,P.body,26,10,42,0,-5,0,2); for(const s of [-1,1]) xcyl(G,P.dark,4,4,s*15,-6,s*10,8);                // abrazadera de dos tornillos
  bx(G,P.body,40,14,30,0,-17,0,5);                                                                           // cuerpo
  for(const s of [-1,1]){ const leg=new THREE.Group(); leg.position.set(s*17,-20,0); leg.rotation.set(0,0,s*0.2);
    const len=Hh-18; const parts=[[P.body,6.5,len*0.55,-len*0.27],[P.dark,7.5,10,-len*0.55],[P.steel,4.8,len*0.42,-len*0.77],[P.rubber,7,8,-len]];
    for(const [m,r,h,y] of parts){ const me=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,10),m); me.position.y=y; me.castShadow=true; leg.add(me); }
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(8,8,10,10),P.dark); hub.rotation.z=Math.PI/2; leg.add(hub); G.add(leg); }
  return G; }

/* ===== Linternas de pistola bajo el raíl del armazón (origen: cara inferior del raíl, centro; cuelga en -Y, lente en +Z). d={len,bez,w,h,style}
   Medidas oficiales: largo y bisel (SureFire) o largo × ancho × alto (Streamlight); el resto de la forma es aproximada. */
function plight(d,P){ const G=new THREE.Group(); const L=d.len, st=d.style||'x300';
  const W=d.w||(d.bez+4), H=d.h||(d.bez+7), rb=(d.bez||Math.min(W,H)-4)/2, cy=-H+rb+1;
  bx(G,P.dark,W*0.62,5,L*0.42,0,-2.5,-L*0.12,1);                                                              // garra del raíl
  if(st==='tlr1'){ bx(G,P.body,W,H-5,L*0.7,0,-5-(H-5)/2,-L*0.15,4);                                           // cuerpo cuadrado de aluminio
    lathe(G,P.body,[[0,L*0.2],[rb+1,L*0.2],[rb+2,L*0.32],[rb+2,L/2],[0,L/2]],18,cy);
    add(G,new THREE.CircleGeometry(rb+0.5,18),P.lightlens,0,cy,L/2+0.3);
  } else { bx(G,P.body,W,H*0.55,L*0.62,0,-H*0.3,-L*0.18,3);                                                   // cuerpo (X300)
    lathe(G,P.body,[[0,-L/2],[rb-1.5,-L/2],[rb-1,-L*0.15],[rb,L*0.08],[rb,L/2],[0,L/2]],18,cy);              // tubo y bisel
    const gs=[]; for(let i=0;i<4;i++){ const g=new THREE.TorusGeometry(rb+0.2,0.8,4,18); g.translate(0,0,L/2-6-i*4); gs.push(g); } add(G,merge(gs),P.dark,0,cy,0);
    add(G,new THREE.CircleGeometry(rb-2,18),P.lightlens,0,cy,L/2+0.3); }
  for(const s of [-1,1]) bx(G,P.dark,3,9,14,s*(W/2+1),-H*0.45,-L/2+9,1);                                    // interruptores ambidiestros
  return G; }

/* ===== Tanda 3 (MAT): accesorios del Pacto de Varsovia, lanzagranadas, bayoneta y montura MP5 =====
   Medidas oficiales en ACC (armero.js) con su fuente. Forma de detalle aproximada.
   Añadir a B: wpscope, wpref, p87, gpl, bayo, btnar, ag36 */

// Montura lateral «cola de milano» del Pacto de Varsovia. Origen = centro del raíl lateral IZQUIERDO del cajón (cara exterior),
// +X hacia fuera (izquierda del tirador). La óptica queda sobre el cajón, en x = xa (negativo = hacia el eje del arma).
function wpmount(G,P,len,bot,top,xa,lever){   // lever = alcance exterior (mm) del tornillo de apriete
  bx(G,P.dark,9,22,len,4.5,0,0,1.5);                                   // mordaza sobre la cola de milano
  bx(G,P.dark,7,top-bot,len*0.8,9.5,(top+bot)/2,0,1.5);                 // placa vertical del soporte
  bx(G,P.dark,9.5-xa+8,8,len*0.7,(9.5+xa-8)/2+2,top-4,0,1.5);           // brazo superior hacia el eje
  if(lever){ const lx=Math.max(18,lever); bx(G,P.dark,5,8,len*0.55,11.5,-6,-len*0.1,1); xcyl(G,P.dark,4.5,lx-9,(lx+9)/2,-6,len*0.32,10); bx(G,P.dark,4,-bot,10,11.5,bot/2,len*0.3,1); }  // palanca y tornillo de apriete
  return G; }

// Visores ópticos rusos con montura lateral (ПСО-1, 1П29 «Тюльпан», 1П78 «Каштан»).
// d={L (largo total), L0 (largo sin parasol/ocular de goma), H (alto total), W (ancho total), ay (eje óptico sobre el raíl), xa, ro (radio objetivo), rb (radio cuerpo), style}
function wpscope(d,P){ const G=new THREE.Group(); const L=d.L, ay=d.ay, xa=d.xa, rb=d.rb, ro=d.ro, z0=-L/2;
  const bot=d.H>0? (ay+(d.top||rb+18))-d.H : -30;
  const re=xa-(d.style==='pso'?18:rb)-(d.kl||0);                         // borde derecho
  wpmount(G,P,d.ml||100,bot,ay-rb+2,xa,d.W?d.W+re:18);
  const O=new THREE.Group(); O.position.x=xa; G.add(O);
  if(d.style==='pso'){                                                   // ПСО-1: tubo largo, tambores arriba e izquierda, parasol y ocular de goma
    lathe(O,P.rubber,[[0.01,z0],[19,z0],[19,z0+8],[17,z0+30],[15,z0+38],[0.01,z0+38]],16,ay);
    lathe(O,P.body,[[0.01,z0+38],[15,z0+38],[15,z0+70],[12.5,z0+92],[12.5,z0+L-112],[16,z0+L-80],[17,z0+L-40],[0.01,z0+L-40]],18,ay);
    cyl(O,P.body,17.5,18.5,40,z0+L-40,ay);                               // parasol
    add(O,new THREE.CircleGeometry(12,16),P.lens,0,ay,z0+L-28);
    bx(O,P.body,36,32,92,0,ay+2,-12,4);                                   // cuerpo central con el soporte
    vcyl(O,P.body,13,20,0,ay+18+10,-14,16); vcyl(O,P.dark,13.5,4,0,ay+18+18,-14,16);   // tambor de alzas (arriba)
    xcyl(O,P.body,12,18,24,ay,-14,16); xcyl(O,P.dark,12.5,4,31,ay,-14,16);              // tambor de derivas (izquierda)
    xcyl(O,P.dark,6,10,20,ay+6,30,10);                                    // portapilas de la iluminación
  } else {                                                               // 1П29 / 1П78: cuerpo de prismas alto, objetivo grande y ocular de goma
    const bl=d.L0||L*0.7;
    lathe(O,P.rubber,[[0.01,z0],[d.re||22,z0],[d.re||22,z0+10],[(d.re||22)-3,z0+(L-bl)],[0.01,z0+(L-bl)]],16,ay);
    bx(O,P.body,rb*2,rb*2+10,bl*0.62,0,ay+3,z0+(L-bl)+bl*0.31,5);          // cuerpo
    lathe(O,P.body,[[0.01,z0+(L-bl)+bl*0.55],[rb*0.9,z0+(L-bl)+bl*0.55],[ro,z0+L-14],[ro+1.5,z0+L],[0.01,z0+L]],18,ay);   // tubo del objetivo
    add(O,new THREE.CircleGeometry(ro-2,18),P.lens,0,ay,z0+L+0.3);
    vcyl(O,P.dark,11,12,0,ay+rb+10,z0+(L-bl)+bl*0.3,14);                  // mando de distancias
    if(d.kl) xcyl(O,P.dark,9,d.kl,-rb-d.kl/2,ay,z0+(L-bl)+bl*0.3,12);   // mando lateral (derecha)
  }
  return G; }

// Visores colimadores rusos (Кобра ЭКП-1С-03, 1П63 «Обзор»): cuerpo con ventana rectangular sobre montura lateral.
// d={L,W,H,ay (centro de ventana sobre el raíl), xa, ww/wh (ventana exterior), style}
function wpref(d,P){ const G=new THREE.Group(); const L=d.L, ay=d.ay, xa=d.xa, ww=d.ww, wh=d.wh, bot=ay+wh/2+4-d.H;
  const by=ay-wh/2-8;                                                    // cara inferior del cuerpo
  wpmount(G,P,d.ml||70,bot,by+2,xa,d.W?d.W+xa-ww/2-12:18);
  const O=new THREE.Group(); O.position.x=xa; G.add(O);
  bx(O,P.body,ww,10,L,0,by+5,0,2);                                       // base del cuerpo
  const f=4, zf=L/2-(d.fl||L*0.38);                                      // marco de la ventana (delante)
  bx(O,P.body,ww,f,d.fl||L*0.38,0,ay+wh/2-f/2,zf+(d.fl||L*0.38)/2,1); bx(O,P.body,f,wh,d.fl||L*0.38,ww/2-f/2,ay,zf+(d.fl||L*0.38)/2,1); bx(O,P.body,f,wh,d.fl||L*0.38,-ww/2+f/2,ay,zf+(d.fl||L*0.38)/2,1);
  bx(O,P.glassA||P.glass,ww-2*f,wh-f,1.5,0,ay-f/2,L/2-3);                // cristal semirreflectante
  bx(O,P.red,1.6,1.6,1,0,ay,zf+2);
  bx(O,P.body,ww*0.8,wh*0.55,L-(d.fl||L*0.38),0,by+10+wh*0.27,-(d.fl||L*0.38)/2,3);   // cuerpo trasero (electrónica / emisor)
  vcyl(O,P.dark,8,8,0,by+10+wh*0.55+4,-L*0.25,12);                       // selector de retícula / brillo
  if(d.style==='obzor'){ bx(O,P.body,ww,wh*0.35,L*0.45,0,ay+wh/2+wh*0.12,-L*0.2,3); }  // capota alta del 1П63
  else xcyl(O,P.dark,7,12,-ww/2-6,by+16,-L*0.3,12);                      // portapilas lateral (Kobra)
  return G; }

// 1П87 (raíl Picatinny superior del AK-12). Origen = cara superior del raíl. d={L,W,H,ay}
function p87(d,P){ const G=new THREE.Group(); const L=d.L, W=d.W, H=d.H, ay=d.ay;
  clamp(G,P.dark,L*0.5,W*0.5,8,0,-1);
  bx(G,P.body,W*0.62,10,L,0,13,0,2);                                     // base
  const f=4, fl=L*0.42, wh=H-22;                                         // ventana delantera
  bx(G,P.body,W*0.62,f,fl,0,H-f/2,L/2-fl/2,1); bx(G,P.body,f,wh,fl,W*0.31-f/2,18+wh/2,L/2-fl/2,1); bx(G,P.body,f,wh,fl,-W*0.31+f/2,18+wh/2,L/2-fl/2,1);
  bx(G,P.glassA||P.glass,W*0.62-2*f,wh-f,1.5,0,18+wh/2-f/2,L/2-3); bx(G,P.red,1.5,1.5,1,0,ay,L/2-fl+3);
  bx(G,P.body,W*0.55,H*0.55,L-fl,0,18+H*0.2,-fl/2,4);                     // cuerpo trasero
  xcyl(G,P.dark,9,W*0.19,-(W*0.31+W*0.095),24,-L*0.18,14);               // portapilas lateral (derecha)
  bx(G,P.dark,8,6,14,0,18+H*0.48,-L*0.3,1.5);                             // botones de brillo
  return G; }

// Lanzagranadas bajo el cañón de 40 mm (ГП-25 «Костёр», ГП-34). Origen = eje del ánima del fusil, z=0 en la boca del lanzagranadas.
// d={L (largo total), bl (cañón), gy (eje del lanzagranadas bajo el ánima), r (radio exterior del cañón)}
function gpl(d,P){ const G=new THREE.Group(); const L=d.L, bl=d.bl, gy=-d.gy, r=d.r||25;
  cyl(G,P.body,r,r,bl,-bl,gy,0,20);                                      // cañón
  add(G,new THREE.RingGeometry(18,r-1,20),P.dark,0,gy,0.3);  add(G,new THREE.CircleGeometry(18,20),P.dark,0,gy,-6);
  bx(G,P.body,26,-gy+8-r+6,bl*0.42,0,(gy+r-6+8)/2,-bl*0.28,3);        // bloque de anclaje sobre el cañón del fusil
  xcyl(G,P.steel,4,40,0,4,-bl*0.2,10);                                   // pasador de anclaje
  side(G,P.body,[[-bl,gy+r-4],[-bl,gy-r+2],[-L+70,gy-r+2],[-L+30,gy-r+12],[-L,gy-r+18],[-L,gy+r-10],[-L+40,gy+r-6]],40,0,2);   // cajón y recámara
  side(G,P.poly,[[-L+150,gy-r+4],[-L+124,gy-r-74],[-L+92,gy-r-78],[-L+108,gy-r+4]],26,0,3);   // empuñadura
  side(G,P.dark,[[-L+190,gy-r+4],[-L+190,gy-r-20],[-L+170,gy-r-36],[-L+146,gy-r-36],[-L+150,gy-r-26],[-L+174,gy-r-24],[-L+178,gy-r+4]],8,0,0);   // guardamonte
  bx(G,P.steel,4,14,4,0,gy-r-10,-L+164,1);                               // disparador
  bx(G,P.dark,6,30,40,25,gy+8,-bl+6,1.5); bx(G,P.dark,4,26,6,28,gy+22,-bl+20,1);   // alza de cuadrante (izquierda)
  if(d.style==='gp34') bx(G,P.dark,6,16,50,-24,gy,-L+70,1.5);            // seguro ambidiestro del ГП-34
  return G; }

// Bayoneta 6Х5. Origen = centro de la anilla (sobre el eje del ánima). Hoja hacia +Z bajo el cañón; mango hacia -Z.
// d={L (total), bl (hoja), bw (ancho de hoja), ri (diámetro interior de la anilla)}
function bayo(d,P){ const G=new THREE.Group(); const L=d.L, bl=d.bl, bw=d.bw, ri=d.ri/2, hl=L-bl;
  const ty=-(ri+3);                                                      // canto superior (lomo) de la hoja
  add(G,new THREE.TorusGeometry(ri+2,2.2,6,18),P.steel,0,0,0);
  bx(G,P.steel,8,-ty+bw+6,6,0,(ty-bw-6)/2,0,1);                           // guarda
  side(G,P.steel,[[3,ty],[bl*0.72,ty],[bl,ty-bw*0.62],[bl*0.86,ty-bw],[3,ty-bw]],3.6,0,0.6);   // hoja (punta de recazo)
  for(let i=0;i<8;i++) bx(G,P.steel,3.6,2,3,0,ty+0.6,bl*0.2+i*6,0);      // dientes de sierra en el lomo
  side(G,P.poly,[[-3,ty-1],[-hl+18,ty-1],[-hl+18,ty-bw-8],[-3,ty-bw-4]],22,0,4);   // mango
  side(G,P.steel,[[-hl+18,ty+1],[-hl,ty+1],[-hl,ty-bw-9],[-hl+18,ty-bw-9]],22,0,2);  // pomo con la ranura del tetón
  bx(G,P.dark,6,3,18,0,ty+2,-hl+9,0);
  return G; }

// Montura B&T NAR de perfil bajo (garras HK del MP5) + óptica encima. Origen = parte alta del cajón del MP5.
// d={L,W,H,opt:'micro'|'aimpoint',od:{datos del visor}}
function btnar(d,P){ const G=new THREE.Group(); const L=d.L, W=d.W, H=d.H;
  bx(G,P.body,W*0.62,H-6,L,0,(H-6)/2,0,2);                                // cuerpo
  for(const s of [-1,1]) for(const z of [-L*0.32,L*0.32]) side(G,P.steel,[[z-7,2],[z+7,2],[z+7,-7],[z-7,-7]],4,s*(W*0.31-1),0);   // garras
  bx(G,P.dark,6,10,30,W*0.5,H*0.35,0,1.5); xcyl(G,P.dark,4,10,W*0.55,H*0.35,L*0.3,10);   // palanca de cierre
  bx(G,P.body,21,3,L,0,H-4.5,0,0.8); for(let i=0;i<Math.floor(L/10);i++) bx(G,P.body,21,3,5.2,0,H-1.5,-L/2+5+i*10,0.4);   // raíl Picatinny
  const o=(d.opt==='aimpoint'?aimpoint:micro)(d.od,P); o.position.y=H; G.add(o);
  return G; }

// HK AG36 (sustituye al guardamanos del G36). Origen = eje del ánima del fusil, z=0 en la boca del lanzagranadas.
// d={L,bl,W,H,gy (eje del cañón de 40 mm bajo el ánima), st (techo de la carcasa sobre el ánima)}
function ag36(d,P){ const G=new THREE.Group(); const L=d.L, bl=d.bl, W=d.W, gy=-d.gy, st=d.st, r=24;
  const hz=d.hz||L*0.72;                                                  // largo de la carcasa-guardamanos
  side(G,P.poly,[[-L+30,st],[-L+hz+30,st],[-L+hz+30,gy+r-2],[-L+30,gy+r-8]],d.sw*2,0,4);   // carcasa = nuevo guardamanos
  for(let i=0;i<6;i++) bx(G,P.dark,d.sw*2+0.6,4,10,0,st-14,-L+60+i*hz/7,0); // ranuras de ventilación
  cyl(G,P.body,r,r,bl,-bl,gy,0,20); add(G,new THREE.RingGeometry(20,r-1,20),P.dark,0,gy,0.3); add(G,new THREE.CircleGeometry(20,20),P.dark,0,gy,-6);
  side(G,P.poly,[[-L,gy+r],[-L+40,gy+r],[-L+40,gy-r-6],[-L,gy-r+4]],W*0.5,0,3);          // recámara trasera
  const gb=st-d.H; side(G,P.poly,[[-L+72,gy-r-2],[-L+44,gb],[-L+10,gb+4],[-L+38,gy-r-2]],30,0,4);   // empuñadura (alto total = H)
  side(G,P.poly,[[-L+130,gy-r-2],[-L+130,gy-r-22],[-L+104,gy-r-38],[-L+62,gy-r-38],[-L+66,gy-r-28],[-L+100,gy-r-26],[-L+118,gy-r-2]],10,0,1);  // guardamonte
  bx(G,P.steel,4,14,4,0,gy-r-10,-L+92,1);   // disparador
  bx(G,P.dark,6,22,60,W/2-3,gy+r-2,-bl*0.5,1.5); bx(G,P.dark,4,24,4,W/2-2,gy+r+12,-bl*0.35,1);   // alza escalonada (izquierda)
  return G; }

// Add to B:  wpscope, wpref, p87, gpl, bayo, btnar, ag36
// e.g. const B={wpscope,wpref,p87,gpl,bayo,btnar,ag36,aimpoint,micro,...};  (btnar calls the existing micro()/aimpoint() builders)

/* ===== Tanda 4d (MAT): bípode del FAMAS F1, bayonetas KCB-77 M1 (AUG) y L3A1 (L85A2), SUSAT L9A1 (L85A2), Mepro 21 y MOR PRO (Tavor), ELCAN M145 (M249/M240) =====
   Medidas oficiales en ACC (armero.js) con su fuente. Forma de detalle aproximada.
   Añadir a B: famasbip, sockbayo, susat, mepro, m145
   (la KCB-77 M1 usa el builder bayo ya existente; el Gemtech SP90 usa can) */

// varilla cilíndrica de a hasta b (mm)
function rod4(G,m,r,a,b,seg=8){ const v=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]); const L=v.length(); const g=new THREE.CylinderGeometry(r,r,L,seg,1); g.translate(0,L/2,0);
  const me=add(G,g,m,a[0],a[1],a[2]); me.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()); return me; }

// Bípode integrado del FAMAS F1: dos patas independientes con base de plástico, articuladas a ambos lados bajo la poignée garde-main.
// Origen = punto medio entre las dos articulaciones. d={L (largo de pata), sp (semiseparación de las articulaciones), r (radio varilla), dr (radio tambor), fa (º hacia delante), sa (º de apertura), fold (1 = posición de transporte, patas hacia atrás)}
function famasbip(d,P){ const G=new THREE.Group(); const L=d.L, sp=d.sp, r=d.r||3.5, dr=d.dr||11, fa=(d.fa||15)*D2R, sa=(d.sa||14)*D2R;
  for(const s of [-1,1]){
    xcyl(G,P.body,dr,8,s*(sp+4),0,0,14); xcyl(G,P.dark,dr*0.42,10,s*(sp+5),0,0,8);                  // tambor de articulación y eje
    const a=[s*(sp+8),0,0], k=[s*(sp+11),-9,0]; rod4(G,P.steel,r+0.8,a,k);                           // codo de salida
    const l=L-dr-14; let e, fd;
    if(d.fold){ e=[k[0],k[1]+1,-l]; fd=[0,0,-1]; }
    else { e=[k[0]+s*Math.sin(sa)*l, k[1]-Math.cos(sa)*Math.cos(fa)*l, k[2]+Math.cos(sa)*Math.sin(fa)*l]; fd=[0,-1,0]; }
    rod4(G,P.steel,r,k,e);
    const f=d.fold? [e[0],e[1],e[2]-7] : [e[0],e[1]-5,e[2]];                                            // base de plástico
    if(d.fold) bx(G,P.poly,9,12,20,f[0],f[1],f[2],2); else bx(G,P.poly,13,9,24,f[0],f[1],f[2],2);
  }
  return G; }

// Bayoneta de manguito L3A1 (SA80): la empuñadura es un tubo hueco que entra por el apagallamas; la hoja va desplazada por debajo del ánima.
// Origen = boca del arma (eje del ánima). d={L (total), bl (hoja), bw (ancho hoja), sr (radio exterior del manguito)}
function sockbayo(d,P){ const G=new THREE.Group(); const L=d.L, bl=d.bl, hl=L-bl, R=d.sr||15, bw=d.bw||25, ty=-6;
  cyl(G,P.poly,R-1,R,hl-14,-hl+4,0,0,16);                                                            // empuñadura-manguito
  cyl(G,P.steel,R-2,R-2,4,-hl,0,0,16);                                                               // casquillo trasero
  for(let i=0;i<5;i++) cyl(G,P.dark,R+0.6,R+0.6,3,-hl+18+i*12,0,0,16);                                // anillos de agarre
  cyl(G,P.steel,R,R+1,10,-10,0,0,16);                                                                // casquillo delantero
  add(G,new THREE.CircleGeometry(R*0.5,14),P.dark,0,0,0.3);                                          // boca (el disparo sale por el manguito)
  bx(G,P.steel,6,bw*0.6,8,0,ty-bw*0.3,4,1);                                                          // unión hoja-manguito
  side(G,P.steel,[[2,ty],[bl*0.72,ty],[bl,ty-bw*0.6],[bl*0.86,ty-bw],[2,ty-bw]],3.6,0,0.6);           // hoja
  bx(G,P.dark,5,8,16,0,-R-2,-hl+30,1);                                                               // pestillo al tetón
  return G; }

// SUSAT L9A1 (4×) con su montura. Origen = cara superior del raíl/base del cajón. d={L,W,H (del visor), ml (largo montura), mh (alto montura), ro (radio objetivo)}
function susat(d,P){ const G=new THREE.Group(); const L=d.L, W=d.W, H=d.H, ml=d.ml, mh=d.mh||20, ro=d.ro||14, ay=mh+H*0.42, z0=-L/2;
  bx(G,P.dark,32,7,ml,0,3.5,0,1.5); bx(G,P.dark,22,mh-4,ml*0.55,0,(mh+3)/2,0,2);                     // montura (base y pie)
  xcyl(G,P.dark,5,14,-22,6,ml*0.18,10); bx(G,P.dark,5,20,8,-23,8,-ml*0.15,1);                        // palanca de la montura (derecha)
  bx(G,P.body,W-18,H*0.62,L*0.6,0,mh+H*0.31,-L*0.06,5);                                              // carcasa central
  lathe(G,P.body,[[0.01,L*0.12],[ro+3,L*0.12],[ro+5,L*0.3],[ro+6,L/2],[0.01,L/2]],18,ay);             // tubo del objetivo
  add(G,new THREE.CircleGeometry(ro,16),P.lens,0,ay,L/2-2.5);
  lathe(G,P.rubber,[[0.01,z0],[19,z0],[20,z0+6],[16,z0+26],[0.01,z0+26]],16,ay);                       // ocular de goma
  add(G,new THREE.CircleGeometry(11,14),P.lens,0,ay,z0+3,{ry:Math.PI});
  xcyl(G,P.body,9,9,W/2-4.5,ay-2,-L*0.05,12);                                                        // mando de la iluminación Trilux (izquierda)
  bx(G,P.body,8,7,6,0,mh+H*0.62+3.5,L*0.3,1); bx(G,P.body,12,6,6,0,mh+H*0.62+3,-L*0.3,1);            // alza y punto de mira de emergencia (arriba)
  bx(G,P.dark,2.5,6,3,0,mh+H*0.62+9,L*0.3,0);
  return G; }

// Meprolight Mepro 21 / MOR PRO (visores réflex del Tavor). Origen = cara superior del raíl. d={L,W,H,style:'m21'|'mor'}
function mepro(d,P){ const G=new THREE.Group(); const L=d.L, W=d.W, H=d.H, mor=d.style==='mor';
  clamp4(G,P,L*0.55,W*0.62);
  const b0=10, b1=mor?36:24, fw=W*(mor?0.86:0.78);
  bx(G,P.body,fw,b1-b0,L*(mor?0.97:0.88),0,(b0+b1)/2,0,3);                                          // cuerpo inferior (MOR: láseres y pilas)
  for(const s of [-1,1]) side(G,P.body,[[-L*0.44,b1-1],[L*0.4,b1-1],[L*0.34,H-6],[L*0.2,H],[-L*0.36,H],[-L*0.44,H-8]],5,s*(fw/2-2.5),1);   // laterales de la ventana
  bx(G,P.body,fw,6,L*0.62,0,H-3,-L*0.05,2);                                                          // techo
  const g=new THREE.PlaneGeometry(fw-10,H-b1-8); const m=add(G,g,mor?P.glass:P.glassA,0,(H+b1)/2,L*0.12); m.rotation.x=-0.18;   // ventana
  if(mor){ for(const [x,y,r] of [[-10,23,5],[6,23,5],[18,17,3.5]]) add(G,new THREE.CircleGeometry(r,12),P.lens,x,y,L*0.485+0.3);   // láser visible, IR e iluminador
           xcyl(G,P.dark,9,10,fw/2+5,22,-L*0.2,12); }                                                // tapa de pilas
  else { bx(G,P.fiber,8,3,L*0.42,0,H+1.5,-L*0.05,0.5); xcyl(G,P.dark,6,8,fw/2+4,b0+8,-L*0.2,10); }  // colector de fibra óptica (arriba) y mando lateral
  return G; }
function clamp4(G,P,len,w){ bx(G,P.dark,w,7,len,0,3.5,0,1.5); bx(G,P.dark,6,10,len*0.5,w/2+2,2,0,1.5); xcyl(G,P.steel,4,10,w/2+5,3,len*0.18,10); }

// ELCAN M145 Machine Gun Optic (3,4×28) con montura de palancas. Origen = cara superior del raíl. d={L,W,H,ay}
function m145(d,P){ const G=new THREE.Group(); const L=d.L, W=d.W, H=d.H, ay=d.ay, z0=-L/2;
  bx(G,P.body,32,9,L*0.55,0,4.5,0,1.5); bx(G,P.body,38,3,L*0.5,0,1.5,0,0.6);                         // base y abrazadera
  for(const z of [-L*0.17,L*0.17]){ bx(G,P.dark,7,9,12,22,6,z,1.5); xcyl(G,P.dark,3,12,28,9,z,8); }  // palancas de apriete (derecha)
  side(G,P.body,[[-L*0.3,9],[L*0.28,9],[L*0.22,ay-12],[-L*0.26,ay-12]],34,0,3);                      // pie
  bx(G,P.body,44,40,L*0.5,0,ay+2,-L*0.04,8);                                                         // carcasa de prismas
  lathe(G,P.body,[[0.01,z0],[17,z0],[18,z0+4],[16,z0+L*0.25],[16,z0+L*0.68],[20,z0+L*0.8],[21,z0+L-2],[20,z0+L],[0.01,z0+L]],18,ay);
  vcyl(G,P.body,13,12,0,ay+(H-ay)-10,-L*0.02,14); vcyl(G,P.dark,13.5,4,0,ay+(H-ay)-3,-L*0.02,14);   // tambor de alcances (arriba)
  xcyl(G,P.body,10,10,W/2-5,ay+4,-L*0.02,12);                                                        // mando de iluminación (izquierda)
  lens(G,P,17,z0+L,ay,false); lens(G,P,12,z0,ay,true);
  return G; }

const B={aimpoint,micro,hs510,eotech,acog,rmr,elcan,lpvo,magnifier,can,stock,grip,light,laser,atlas,plight,wpscope,wpref,p87,gpl,bayo,btnar,ag36,famasbip,sockbayo,susat,mepro,m145};
// Raíl Picatinny (MIL-STD-1913) para versiones con raíl sobre el asa (G36E, FAMAS «Infanterie»). Ranura 5,23 mm, paso 10,01 mm, fondo 3,00 mm (Wikipedia).
// Origen = cara inferior, centro. d={L,H,W}. Largo y altura ajustados al asa del modelo 3D.
function prail(d,P){ const G=new THREE.Group(); const L=d.L, H=d.H||8, Wd=d.W||21, sp=10.01, sw=5.23, dp=3;
  bx(G,P.body,Wd*0.72,H-dp,L,0,(H-dp)/2,0,0.8);                          // cuerpo
  bx(G,P.body,Wd,1.8,L,0,H-dp-0.9,0,0.5);                                // alas del perfil
  const n=Math.floor((L-sp*0.5)/sp), z0=-(n-1)*sp/2;
  for(let i=0;i<n;i++) bx(G,P.body,Wd,dp,sp-sw,0,H-dp/2,z0+i*sp,0.5);    // dientes entre ranuras
  return G; }
B.prail=prail;
export function build(kind,dims,fde){ const P=marks(mats(fde)); const g=B[kind](dims,P); const root=new THREE.Group(); g.scale.setScalar(K); root.add(g);
  root.traverse(o=>{ if(o.isMesh){ o.castShadow=true; } }); root.userData.kit=kind; return root; }
