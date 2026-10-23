// M.A.T · portada: F-14 que se desmonta en piezas al hacer scroll.
// three.js (MIT) + anime.js v4 (MIT, createTimeline recorrida con seek() según el scroll). Silueta a partir del
// dibujo de 3 vistas del F-14 del US Army FM 44-80 (dominio público, Wikimedia Commons).
import * as THREE from './three.module.min.js';
import { createTimeline } from './anime.min.js';

const EN = (window.MAT_LANG === 'en');
const cl = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const seg = (p, a, b) => cl((p - a) / (b - a));
const eio = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // inOutCubic
const eo = t => 1 - Math.pow(1 - t, 4);                                      // outQuart
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;

// ---------- coordenadas: x desde el morro (m), y a la derecha, z arriba -> three (X morro, Y arriba, Z lado)
const OX = 9.5;
const V3 = (x, y, z) => new THREE.Vector3(OX - x, z, y);

// ---------- geometría
function loft(st, n = 22, caps = true) {
  const pos = [], idx = [];
  st.forEach(s => {
    const [x, hw, zb, zt, e = 2.4, yc = 0] = s, zc = (zb + zt) / 2, hh = (zt - zb) / 2;
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, c = Math.cos(a), si = Math.sin(a);
      const y = yc + hw * Math.sign(c) * Math.pow(Math.abs(c), 2 / e), z = zc + hh * Math.sign(si) * Math.pow(Math.abs(si), 2 / e);
      pos.push(OX - x, z, y);
    }
  });
  for (let j = 0; j < st.length - 1; j++) for (let i = 0; i < n; i++) {
    const a = j * n + i, b = j * n + (i + 1) % n, c = a + n, d = b + n; idx.push(a, b, c, b, d, c);
  }
  if (caps) {
    [0, st.length - 1].forEach((j, k) => {
      const s = st[j], c = pos.length / 3; pos.push(OX - s[0], (s[2] + s[3]) / 2, s[5] || 0);
      for (let i = 0; i < n; i++) { const a = j * n + i, b = j * n + (i + 1) % n; k ? idx.push(c, a, b) : idx.push(c, b, a); }
    });
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// cuerpo de revolución a lo largo de x: prof = [[x, r], ...], centro (yc, zc)
function lathe(prof, yc = 0, zc = 0, n = 22, a0 = 0, a1 = Math.PI * 2) {
  const full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6;
  const pts = prof.map(([x, r]) => new THREE.Vector2(Math.max(r, 1e-4), x));
  const g = new THREE.LatheGeometry(pts, n, a0, a1 - a0);
  // Lathe gira alrededor de Y: (r cos, x, r sin) -> pasamos a eje X del avión
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const rx = p.getX(i), x = p.getY(i), rz = p.getZ(i);
    p.setXYZ(i, OX - x, zc + rx, yc + rz);
  }
  g.computeVertexNormals();
  if (full) { const m = mergeV(g); return m; }
  return g;
}
function mergeV(g) { try { g.deleteAttribute('uv'); g.deleteAttribute('normal'); } catch (e) { }
  // soldar costura para que las normales salgan suaves
  const p = g.attributes.position, map = new Map(), np = [], remap = [];
  for (let i = 0; i < p.count; i++) {
    const k = Math.round(p.getX(i) * 1e4) + '_' + Math.round(p.getY(i) * 1e4) + '_' + Math.round(p.getZ(i) * 1e4);
    let j = map.get(k); if (j === undefined) { j = np.length / 3; map.set(k, j); np.push(p.getX(i), p.getY(i), p.getZ(i)); } remap.push(j);
  }
  const idx = g.index ? Array.from(g.index.array).map(i => remap[i]) : remap;
  const o = new THREE.BufferGeometry(); o.setAttribute('position', new THREE.Float32BufferAttribute(np, 3)); o.setIndex(idx); o.computeVertexNormals(); return o;
}
// placa: polígono en planta [[x,y],...], espesor t, a la altura z (horizontal)
function plate(poly, t, z, bev = .35) {
  const s = new THREE.Shape(poly.map(([x, y]) => new THREE.Vector2(OX - x, y)));
  const g = new THREE.ExtrudeGeometry(s, { depth: t * (1 - bev), bevelEnabled: bev > 0, bevelThickness: t * bev / 2, bevelSize: t * .45, bevelSegments: 1, curveSegments: 4 });
  g.rotateX(Math.PI / 2); // (X, Y=y, Z=depth) -> (X, -depth, y)
  g.translate(0, z + t / 2 - t * bev / 2, 0);
  // rotateX(+90): (x,y,z)->(x,-z,y)  => lateral queda en Z, profundidad hacia -Y
  return g;
}
// placa vertical: polígono en alzado [[x,z],...], espesor t, en y
function fin(poly, t, y) {
  const s = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(OX - x, z)));
  const g = new THREE.ExtrudeGeometry(s, { depth: t * .6, bevelEnabled: true, bevelThickness: t * .2, bevelSize: t * .4, bevelSegments: 1, curveSegments: 4 });
  g.translate(0, 0, y - t * .3);
  return g;
}
function vcyl(x, y, z0, z1, r) { const g = new THREE.CylinderGeometry(r, r, Math.abs(z1 - z0), 10); g.translate(OX - x, (z0 + z1) / 2, y); return g; }
function wheel(x, y, z, r, w) { const g = new THREE.CylinderGeometry(r, r, w, 20); g.rotateX(Math.PI / 2); g.translate(OX - x, z, y); return g; }
function cyl(x0, x1, r0, r1, yc, zc, n = 20) { return lathe([[x0, 0], [x0, r0], [x1, r1], [x1, 0]], yc, zc, n); }

// ---------- materiales
const PAPER = new THREE.Color(0xe9e5da), INK = new THREE.Color(0x15171a);
function mats() {
  const m = (c, mt, r) => new THREE.MeshStandardMaterial({ color: c, metalness: mt, roughness: r, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, side: THREE.DoubleSide });
  const M = {
    body: m(0x5d646a, .75, .32), dark: m(0x2a2f33, .7, .4), eng: m(0x7a7d80, .9, .28), hot: m(0x6e5d48, .8, .35),
    glass: m(0x0b1513, .6, .06), mis: m(0xc4c7c2, .35, .45), acc: m(0x50565b, .75, .36)
  };
  for (const k in M) { M[k].userData.c0 = M[k].color.clone(); M[k].userData.mt = M[k].metalness; M[k].emissive = new THREE.Color(0); }
  M.hot.userData.e0 = new THREE.Color(0x5a2a08);
  return M;
}
const LINE_V = `attribute vec3 iA; attribute vec3 iB; uniform vec2 uRes; uniform float uW;
void main(){ vec4 va=modelViewMatrix*vec4(iA,1.), vb=modelViewMatrix*vec4(iB,1.); va.xyz*=.9988; vb.xyz*=.9988; vec4 a=projectionMatrix*va; vec4 b=projectionMatrix*vb;
 vec2 sa=a.xy/a.w*uRes*.5, sb=b.xy/b.w*uRes*.5; vec2 d=sb-sa; float L=length(d); d = L>1e-5 ? d/L : vec2(1.,0.);
 vec2 nn=vec2(-d.y,d.x); vec4 p = position.x<.5 ? a : b;
 vec2 off = nn*position.y*uW*.5 + d*uW*.5*(position.x<.5?-1.:1.);
 p.xy += off/(uRes*.5)*p.w; gl_Position=p; }`;
const HULL_V = `uniform vec2 uRes; uniform float uW;
void main(){ vec4 c=projectionMatrix*modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal);
 vec2 o=(projectionMatrix*vec4(n,0.)).xy; float L=length(o); o = L>1e-5? o/L : vec2(0.);
 c.xy += o*uW/(uRes*.5)*c.w; gl_Position=c; }`;
const LINE_F = `uniform vec3 uC; uniform float uA; void main(){ gl_FragColor=vec4(uC,uA); }`;

export function mount(sec) {
  if (!sec || sec.__f14) return; sec.__f14 = 1;
  const RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cv = sec.querySelector('canvas.f14c'), stage = sec.querySelector('.f14s');
  let R;
  try { R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { sec.classList.add('f14off'); return; }
  if (!R.getContext()) { sec.classList.add('f14off'); return; }
  sec.classList.add(RM ? 'f14rm' : 'f14on');
  sec.querySelectorAll('[hidden]').forEach(e => { e.hidden = false; });
  R.setClearColor(0x000000, 0);
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  R.setPixelRatio(DPR);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(28, 1, .5, 400);
  scene.add(new THREE.HemisphereLight(0xc6cbd0, 0x0a0b0c, .7));
  const key = new THREE.DirectionalLight(0xfff4e6, 2.4); key.position.set(-4, 12, 9); scene.add(key);
  const rim = new THREE.DirectionalLight(0xe6ecf2, 2.6); rim.position.set(9, 4, -10); scene.add(rim);
  const fillL = new THREE.DirectionalLight(0x8aa0b8, .7); fillL.position.set(6, -4, 6); scene.add(fillL);
  const M = mats();
  // entorno procedural (cajas de luz) para reflejos metálicos, sin texturas externas
  try {
    const es = new THREE.Scene(); es.background = new THREE.Color(0x07080a);
    const bx = (w, h, x, y, z, c, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c), side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); es.add(m); return m; };
    bx(14, 6, 0, 9, 0, 0xffffff, 0, Math.PI / 2).material.color.multiplyScalar(2.2);
    bx(3, 10, -9, 2, 2, 0xdfe6ff, Math.PI / 2).material.color.multiplyScalar(1.6);
    bx(3, 10, 9, 1, -3, 0xfff0d8, -Math.PI / 2).material.color.multiplyScalar(1.4);
    bx(20, 1.2, 0, -1, -9, 0xb3bd8c).material.color.multiplyScalar(.9);
    bx(30, 30, 0, -8, 0, 0x15181a, 0, Math.PI / 2);
    const pm = new THREE.PMREMGenerator(R); const rt = pm.fromScene(es, .03); scene.environment = rt.texture; disposables.push(rt, pm);
    es.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  } catch (e) { }
  const LU = { uRes: { value: new THREE.Vector2(1, 1) }, uW: { value: 1.35 * DPR }, uC: { value: new THREE.Color(0x9aa3a6) }, uA: { value: .12 } };
  const HU = { uRes: LU.uRes, uW: { value: 1.6 * DPR }, uC: LU.uC, uA: { value: 0 } };
  const lineMat = new THREE.ShaderMaterial({ uniforms: LU, vertexShader: LINE_V, fragmentShader: LINE_F, transparent: true, depthWrite: false });
  const hullMat = new THREE.ShaderMaterial({ uniforms: HU, vertexShader: HULL_V, fragmentShader: LINE_F, side: THREE.BackSide, transparent: true });
  const QUAD = new THREE.BufferGeometry(); QUAD.setAttribute('position', new THREE.Float32BufferAttribute([0, -1, 0, 1, -1, 0, 1, 1, 0, 0, 1, 0], 3)); QUAD.setIndex([0, 1, 2, 0, 2, 3]);
  const disposables = [QUAD, lineMat, hullMat];
  function edges(g, th) {
    const e = new THREE.EdgesGeometry(g, th), p = e.attributes.position.array, n = p.length / 6;
    const A = new Float32Array(n * 3), B = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { for (let k = 0; k < 3; k++) { A[i * 3 + k] = p[i * 6 + k]; B[i * 3 + k] = p[i * 6 + 3 + k]; } }
    e.dispose();
    const ig = new THREE.InstancedBufferGeometry(); ig.index = QUAD.index; ig.setAttribute('position', QUAD.attributes.position);
    ig.setAttribute('iA', new THREE.InstancedBufferAttribute(A, 3)); ig.setAttribute('iB', new THREE.InstancedBufferAttribute(B, 3)); ig.instanceCount = n;
    disposables.push(ig); return new THREE.Mesh(ig, lineMat);
  }
  const hulls = [], allP = [], glows = [];
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff8a3c, transparent: true, opacity: .0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); disposables.push(glowMat);
  // pieza (nivel 2): malla + aristas (+ contorno para superficies suaves)
  function piece(g, mat, o = {}) {
    const grp = new THREE.Group(), me = new THREE.Mesh(g, mat); grp.add(me); disposables.push(g);
    const ed = edges(g, o.th || 28); ed.frustumCulled = false; grp.add(ed);
    if (o.hull) { const h = new THREE.Mesh(g, hullMat); h.frustumCulled = false; grp.add(h); hulls.push(h); }
    g.computeBoundingSphere(); grp.userData = { e: o.e || new THREE.Vector3(), r: o.r || new THREE.Euler(), d: o.d || 0, home: new THREE.Vector3(), bs: g.boundingSphere };
    allP.push(grp); return grp;
  }
  // parte (nivel 1): grupo de piezas, desplazamiento de explosión en ejes del avión
  const parts = [], model = new THREE.Group(), holder = new THREE.Group(); holder.add(model); scene.add(holder);
  function part(name, pieces, ex, o = {}) {
    const g = new THREE.Group(); g.name = name; pieces.forEach(p => g.add(p));
    if (o.pivot) { g.position.copy(o.pivot); pieces.forEach(p => p.position.sub(o.pivot)); pieces.forEach(p => p.userData.home.copy(p.position)); }
    g.userData = { e: V3(0, 0, 0).sub(V3(ex[0], ex[1], ex[2])).negate(), r: o.r || new THREE.Euler(), d: o.d || 0, home: g.position.clone(), anchor: o.anchor || null, sweep: !!o.sweep, side: o.side || 0 };
    model.add(g); parts.push(g); return g;
  }
  // vectores de explosión de pieza (en metros, ejes avión)
  const ev = (x, y, z) => new THREE.Vector3(-x, z, y);

  // ====== F-14 ======
  // Radomo + antena AWG-9
  const radProf = [[0, 0], [.12, .1], [.4, .22], [.9, .36], [1.5, .47], [2.1, .55], [2.6, .6], [2.95, .63]];
  part('radome', [
    piece(lathe(radProf, 0, .02, 24), M.body, { hull: 1, th: 40 }),
    piece(cyl(2.55, 2.62, .5, .5, 0, .02, 28), M.acc, { e: ev(-.2, 0, 1.25), r: new THREE.Euler(0, 0, -.5), d: .1 }),
    piece(cyl(2.62, 2.95, .14, .2, 0, .02, 14), M.dark, { e: ev(.3, 0, .55), d: .25 })
  ], [-4.6, 0, .9], { d: 0, anchor: V3(1.2, 0, .3) });
  // Sección delantera + cabina
  const fwd = loft([[2.95, .64, -.61, .66, 2.3], [3.6, .73, -.69, .71, 2.5], [4.4, .79, -.76, .74, 2.7], [5.5, .83, -.8, .76, 2.9], [6.4, .86, -.82, .76, 3.1], [7.05, .88, -.83, .76, 3.2]], 24);
  const seat = (x) => loft([[x - .35, .26, .3, .95, 5], [x + .25, .26, .3, 1.15, 5]], 8);
  part('fwd', [
    piece(fwd, M.body, { hull: 1, th: 35 }),
    piece(seat(4.95), M.dark, { e: ev(0, 0, 2.2), d: .35 }),
    piece(seat(6.15), M.dark, { e: ev(0, 0, 2.9), d: .5 })
  ], [-2.2, 0, .5], { d: .05 });
  part('canopy', [
    piece(loft([[3.75, .06, .62, .66, 2], [4.0, .32, .62, .9, 2], [4.32, .5, .62, 1.06, 2.2]], 20), M.glass, { hull: 1, th: 35, e: ev(-.6, 0, .3), d: .3 }),
    piece(loft([[4.32, .5, .62, 1.06, 2.2], [4.42, .54, .62, 1.13, 2.2]], 20), M.dark, { th: 35 }),
    piece(loft([[4.42, .54, .62, 1.13, 2.2], [5.1, .57, .62, 1.26, 2.1], [5.8, .58, .62, 1.3, 2.1], [6.6, .53, .62, 1.22, 2.1], [7.3, .36, .62, .98, 2.1], [7.75, .08, .62, .74, 2]], 20), M.glass, { hull: 1, th: 35, e: ev(.7, 0, .9), r: new THREE.Euler(0, 0, .25), d: .45 })
  ], [-1.6, 0, 3.4], { d: .12, anchor: V3(5.6, 0, 1.25) });
  // Cañón M61 Vulcan (costado izquierdo)
  const vul = [piece(cyl(4.5, 6.6, .17, .17, -.74, -.4, 12), M.dark, { th: 40 })];
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; vul.push(piece(cyl(3.95, 4.6, .035, .035, -.74 + Math.cos(a) * .09, -.4 + Math.sin(a) * .09, 6), M.eng, { th: 50, e: ev(-.5 - i * .12, Math.cos(a) * .35, Math.sin(a) * .35), d: .2 + i * .06 })); }
  part('vulcan', vul, [-1.4, -2.4, -1.0], { d: .15 });
  // Tubo central + lomo + cubierta + cola de castor
  part('tunnel', [piece(loft([[6.9, .9, -.62, .52, 4], [9, .95, -.6, .5, 5], [13, .95, -.58, .48, 5], [16.5, .9, -.55, .42, 5], [17.6, .75, -.45, .35, 4]], 24), M.dark, { th: 35 })], [0, 0, 0], { d: .5 });
  part('spine', [piece(loft([[7.0, .52, .45, .98, 2.4], [8.5, .5, .42, .93, 2.4], [11, .46, .42, .8, 2.4], [14, .4, .4, .64, 2.4], [16.4, .3, .38, .5, 2.4], [17.2, .1, .38, .42, 2.4]], 20), M.body, { hull: 1, th: 35 })], [.4, 0, 2.3], { d: .3 });
  part('deck', [piece(plate([[9.6, -1.0], [11.4, -2.25], [16.6, -2.3], [17.6, -1.6], [17.6, 1.6], [16.6, 2.3], [11.4, 2.25], [9.6, 1.0]], .14, .36), M.body, { th: 25 })], [.4, 0, 1.25], { d: .4 });
  part('beaver', [
    piece(plate([[17.1, -.95], [19.05, -.62], [19.05, .62], [17.1, .95]], .16, -.05), M.body, { th: 25 }),
    piece(plate([[17.5, -.6], [18.75, -.5], [18.75, .5], [17.5, .6]], .06, .14), M.acc, { th: 25, e: ev(.3, 0, 1.0), r: new THREE.Euler(0, 0, .5), d: .3 })
  ], [4.4, 0, .5], { d: .75 });
  // Guantes
  [-1, 1].forEach(s => part('glove' + s, [piece(plate([[6.7, 1.0 * s], [11.05, 3.3 * s], [13.4, 3.05 * s], [14.6, 2.25 * s], [14.6, 1.0 * s]], .22, .2), M.body, { th: 25 })], [0, 1.7 * s, 1.35], { d: .35 }));
  // Alas de geometría variable (pivote en x 11.9, y ±2.75)
  [-1, 1].forEach(s => {
    const pv = V3(11.9, 2.75 * s, .3);
    const W = [[10.85, 3.1], [13.45, 9.45], [14.15, 9.4], [13.75, 6.0], [14.15, 3.1]];
    const pc = [];
    pc.push(piece(plate([[11.05, 3.3 * s], [13.3, 8.9 * s], [13.8, 8.9 * s], [13.3, 5.2 * s], [13.35, 3.3 * s]], .16, .23), M.body, { th: 25 }));
    pc.push(piece(plate([[10.8, 3.15 * s], [13.25, 9.25 * s], [13.42, 9.42 * s], [13.1, 8.9 * s], [11.05, 3.3 * s]], .1, .26), M.acc, { th: 25, e: ev(-.9, .3 * s, .1), d: .2 }));          // slats
    pc.push(piece(plate([[13.35, 3.3 * s], [13.3, 5.2 * s], [14.05, 5.25 * s], [14.15, 3.3 * s]], .09, .25), M.acc, { th: 25, e: ev(1.0, 0, -.45), r: new THREE.Euler(.0, 0, -.25), d: .35 })); // flap int.
    pc.push(piece(plate([[13.3, 5.2 * s], [13.8, 8.9 * s], [14.1, 8.95 * s], [14.05, 5.25 * s]], .09, .25), M.acc, { th: 25, e: ev(1.1, .2 * s, -.5), d: .45 }));                                     // flap ext.
    pc.push(piece(plate([[13.45, 9.0 * s], [13.75, 9.42 * s], [14.15, 9.4 * s], [14.05, 9.0 * s]], .1, .25), M.body, { th: 25, e: ev(.3, .9 * s, 0), d: .55 }));                                        // punta
    for (let k = 0; k < 3; k++) { const y0 = 3.8 + k * 1.15; pc.push(piece(plate([[12.75, y0 * s], [12.95, (y0 + .9) * s], [13.25, (y0 + .9) * s], [13.15, y0 * s]], .05, .4), M.dark, { th: 25, e: ev(0, 0, .9 + k * .2), d: .25 + k * .1 })); }
    part('wing' + s, pc, [.6, 4.6 * s, 2.6], { pivot: pv, sweep: true, side: s, r: new THREE.Euler(.28 * s, 0, 0), d: .3, anchor: s > 0 ? V3(13.2, 7.6 * s, .3) : null });
  });
  // Tomas de aire + góndolas + motores + toberas
  [-1, 1].forEach(s => {
    const yc = 1.42 * s;
    part('intake' + s, [
      piece(loft([[5.95, .42, .22, .4, 8, yc], [6.45, .42, -.42, .4, 8, yc], [6.95, .43, -.95, .4, 8, yc], [9.9, .46, -.9, .32, 6, yc]], 20, false), M.body, { th: 30 }),
      piece(plate([[6.3, (1.08) * s], [8.6, 1.08 * s], [8.6, 1.76 * s], [6.3, 1.76 * s]], .05, .22), M.acc, { th: 25, e: ev(0, 0, 1.0), r: new THREE.Euler(0, 0, -.12), d: .3 }),
      piece(plate([[8.6, 1.1 * s], [9.8, 1.1 * s], [9.8, 1.74 * s], [8.6, 1.74 * s]], .05, .12), M.acc, { th: 25, e: ev(.4, 0, 1.3), d: .45 })
    ], [-2.2, 2.3 * s, -.7], { d: .2 });
    part('nac' + s, [piece(loft([[9.9, .46, -.9, .32, 6, yc], [11, .52, -.88, .28, 4, yc], [13, .56, -.86, .25, 2.7, 1.4 * s], [15.5, .56, -.83, .22, 2.3, 1.37 * s], [17.25, .52, -.79, .19, 2.2, 1.35 * s]], 22, false), M.body, { hull: 1, th: 30 })], [.4, 2.9 * s, -1.9], { d: .45 });
    // motor F110: fan, 5 etapas de compresor, cámara, 2 turbinas, postcombustor
    const ey = 1.38 * s, ez = -.32, ep = [];
    const fan = new THREE.Group();
    ep.push(piece(cyl(10.25, 10.5, .44, .44, ey, ez, 24), M.eng, { th: 20, e: ev(-2.6, 0, 0), d: 0 }));
    for (let k = 0; k < 5; k++) ep.push(piece(cyl(10.75 + k * .34, 10.98 + k * .34, .4 - k * .03, .39 - k * .03, ey, ez, 22), M.eng, { th: 20, e: ev(-2.0 + k * .45, 0, 0), d: .05 + k * .05 }));
    ep.push(piece(cyl(12.6, 13.5, .33, .36, ey, ez, 20), M.hot, { th: 20, e: ev(.2, 0, 0), d: .3 }));
    for (let k = 0; k < 2; k++) ep.push(piece(cyl(13.65 + k * .32, 13.88 + k * .32, .38, .4, ey, ez, 22), M.eng, { th: 20, e: ev(.8 + k * .55, 0, 0), d: .35 + k * .05 }));
    ep.push(piece(cyl(14.4, 17.1, .42, .44, ey, ez, 22), M.hot, { th: 20, e: ev(2.3, 0, 0), d: .5 }));
    part('eng' + s, ep, [1.6, 1.3 * s, -.15], { d: .5, anchor: s > 0 ? V3(13.4, 1.38 * s, -.3) : null });
    // tobera: 12 pétalos
    const tp = [];
    for (let k = 0; k < 12; k++) { const a0 = k / 12 * Math.PI * 2, a1 = a0 + Math.PI * 2 / 12 * .92, am = (a0 + a1) / 2;
      tp.push(piece(lathe([[17.25, .5], [18.0, .47], [18.55, .42]], 1.35 * s, -.31, 3, a0, a1), M.dark, { th: 20, e: ev(.4, Math.sin(am) * .55, Math.cos(am) * .55), d: k * .03 })); }
    const gl = new THREE.Mesh(lathe([[18.45, .34], [18.9, .22], [19.25, 0]], 1.35 * s, -.31, 16), glowMat); gl.frustumCulled = false; disposables.push(gl.geometry);
    const NZ = part('noz' + s, tp, [5.2, 1.2 * s, -.3], { d: .7 }); NZ.add(gl); glows.push(gl);
    // derivas (ligeramente abiertas) + timón
    const fr = [], cant = 5 * D2R * s;
    fr.push(piece(fin([[14.45, .25], [16.85, 2.55], [17.45, 2.58], [17.35, .62], [18.25, .55], [18.3, .25]], .12, 1.62 * s), M.body, { th: 25 }));
    fr.push(piece(fin([[17.35, .62], [17.45, 2.45], [17.95, 2.45], [18.25, .55]], .1, 1.62 * s), M.acc, { th: 25, e: ev(.9, .15 * s, 0), d: .3 }));
    const F = part('fin' + s, fr, [2.6, 1.9 * s, 3.4], { r: new THREE.Euler(.3 * s, 0, 0), d: .55, anchor: s > 0 ? V3(16.9, 1.7 * s, 1.9) : null });
    F.rotation.x = -cant; F.userData.r0 = -cant;
    // estabilizadores
    part('stab' + s, [piece(plate([[15.45, 2.05 * s], [17.55, 5.0 * s], [18.2, 5.0 * s], [18.95, 2.6 * s], [18.6, 2.05 * s]], .11, -.3), M.body, { th: 25 })], [3.6, 3.6 * s, -.6], { d: .65 });
    // aleta ventral
    const vf = part('vent' + s, [piece(fin([[16.2, -.6], [16.9, -1.25], [17.6, -1.25], [17.5, -.6]], .07, 1.55 * s), M.body, { th: 25 })], [2.2, 2.1 * s, -2.6], { d: .6 });
    vf.rotation.x = 28 * D2R * s; vf.userData.r0 = 28 * D2R * s;
    // tren principal
    part('gear' + s, [
      piece(vcyl(12.15, 2.45 * s, -.75, -1.95, .08), M.dark, { th: 40 }),
      piece(wheel(12.15, 2.62 * s, -1.95, .45, .28), M.dark, { th: 40, e: ev(0, .7 * s, -.4), d: .3 })
    ], [0, 1.2 * s, -2.8], { d: .45 });
  });
  // Tren delantero
  part('ngear', [piece(vcyl(4.95, 0, -.8, -2.05, .07), M.dark, { th: 40 }),
    piece(wheel(4.95, -.2, -2.05, .28, .17), M.dark, { th: 40, e: ev(0, -.5, -.3), d: .3 }), piece(wheel(4.95, .2, -2.05, .28, .17), M.dark, { th: 40, e: ev(0, .5, -.3), d: .35 })], [-1.0, 0, -2.6], { d: .2 });
  // AIM-54 Phoenix x6
  const phx = (x0, y, z, k) => {
    const L = 3.96, r = .19, pr = [[x0, 0], [x0 + .25, .08], [x0 + .6, .15], [x0 + 1.0, r], [x0 + L - .15, r], [x0 + L, .15]];
    const pc = [piece(lathe(pr.slice(0, 4).concat([[x0 + 1.0, 0]]), y, z, 16), M.mis, { th: 35, hull: 1, e: ev(-.8, 0, 0), d: .2 }),
      piece(lathe([[x0 + 1.0, 0], [x0 + 1.0, r], [x0 + L - .15, r], [x0 + L, .15], [x0 + L, 0]], y, z, 16), M.mis, { th: 35, hull: 1 })];
    for (let f = 0; f < 4; f++) { const a = Math.PI / 4 + f * Math.PI / 2;
      const g = fin([[x0 + L - 1.05, 0], [x0 + L - .25, .52], [x0 + L - .05, .52], [x0 + L - .05, 0]], .04, 0);
      g.translate(0, 0, 0); g.rotateX(a); g.translate(0, z, y);
      pc.push(piece(g, M.mis, { th: 25, e: ev(.2, Math.sin(a) * .5, Math.cos(a) * .5), d: .3 + f * .05 })); }
    return part('phx' + k, pc, [x0 > 10 ? 1.2 : -1.2, y * 2.6, -3.2 - (Math.abs(y) > 1 ? 1.2 : 0)], { d: .25 + k * .06, anchor: k === 1 ? V3(x0 + 2, y, z) : null });
  };
  phx(6.95, -.45, -.82, 0); phx(6.95, .45, -.82, 1); phx(11.5, -.45, -.82, 2); phx(11.5, .45, -.82, 3);
  phx(9.3, -2.45, -.6, 4); phx(9.3, 2.45, -.6, 5);
  // gancho
  part('hook', [piece(loft([[15.6, .05, -.66, -.56, 2], [18.4, .05, -.98, -.88, 2]], 6), M.dark, { th: 40 })], [2.2, 0, -2.9], { d: .7 });

  // ====== etiquetas
  const LBL = [
    ['radome', EN ? 'Radome · AWG-9 radar' : 'Radomo · radar AWG-9', 1],
    ['canopy', EN ? 'Cockpit · pilot + RIO' : 'Cabina · piloto + RIO', 0],
    ['wing1', EN ? 'Variable-sweep wings' : 'Alas de geometría variable', 1],
    ['eng1', EN ? 'F110 engines' : 'Motores F110', 1],
    ['fin1', EN ? 'Twin tails' : 'Derivas dobles', 0],
    ['phx1', 'AIM-54 Phoenix', 1]
  ];
  const labWrap = sec.querySelector('.f14lab'), svg = sec.querySelector('.f14ln');
  const labs = LBL.map(([n, t, mob]) => {
    const g = parts.find(p => p.name === n); const el = document.createElement('a'); el.href = '#/a/grumman-f-14-tomcat'; el.className = 'f14l' + (mob ? '' : ' f14lx'); el.textContent = t; labWrap.appendChild(el);
    const ln = document.createElementNS('http://www.w3.org/2000/svg', 'path'); ln.setAttribute('class', 'f14lp' + (mob ? '' : ' f14lx')); svg.appendChild(ln);
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); dot.setAttribute('r', '2.6'); dot.setAttribute('class', 'f14ld' + (mob ? '' : ' f14lx')); svg.appendChild(dot);
    return { g, el, ln, dot, mob, local: g.userData.anchor ? g.worldToLocal(model.localToWorld(g.userData.anchor.clone())) : new THREE.Vector3() };
  });

  // ====== estado y animación
  const S = { p: RM ? .9 : 0, st: 0, inv: 0, e1: 0, e2: 0, la: 0, sw: 0, yaw: -52, pit: 15, pm: 0 }, FIT = { d: 0, x: null, y: null, k: 1 };
  // línea de tiempo de anime.js: cada canal con su tramo y su curva; el scroll la recorre con seek()
  let tl = null;
  function chan(p) { S.st = eio(seg(p, .2, .42)); S.inv = eio(seg(p, .9, .975)); S.e1 = seg(p, .34, .8); S.e2 = seg(p, .52, .95); S.la = eo(seg(p, .78, .88));
    S.sw = eio(seg(p, .02, .16)) * (1 - eio(seg(p, .2, .34))); S.yaw = lerp(-52, -122, eio(seg(p, 0, .45))) + lerp(0, -24, eio(seg(p, .45, 1))); S.pit = lerp(15, 26, eio(seg(p, 0, .5))) + lerp(0, 7, seg(p, .5, 1)); S.pm = 7 * seg(p, .5, 1); }
  try {
    tl = createTimeline({ autoplay: false, defaults: { ease: 'linear' } })
      .add(S, { st: [0, 1], ease: 'inOutCubic', duration: 220 }, 200)
      .add(S, { e1: [0, 1], duration: 460 }, 340)
      .add(S, { e2: [0, 1], duration: 430 }, 520)
      .add(S, { la: [0, 1], ease: 'outQuart', duration: 100 }, 780)
      .add(S, { inv: [0, 1], ease: 'inOutCubic', duration: 75 }, 900)
      .add(S, { sw: [0, 1], ease: 'inOutCubic', duration: 140 }, 20)
      .add(S, { sw: [1, 0], ease: 'inOutCubic', duration: 140 }, 200)
      .add(S, { yaw: [-52, -122], ease: 'inOutCubic', duration: 450 }, 0)
      .add(S, { yaw: [-122, -146], ease: 'inOutCubic', duration: 550 }, 450)
      .add(S, { pit: [15, 26], ease: 'inOutCubic', duration: 500 }, 0)
      .add(S, { pit: [26, 33], duration: 500 }, 500)
      .add(S, { pm: [0, 7], duration: 500 }, 500);
    tl.seek(0);
  } catch (e) { tl = null; }
  let W = 1, Hh = 1, mobile = false;
  function size() {
    const r = stage.getBoundingClientRect(); W = Math.max(1, r.width); Hh = Math.max(1, r.height); mobile = W < 640;
    R.setSize(W, Hh, false); cam.aspect = W / Hh; cam.updateProjectionMatrix();
    LU.uRes.value.set(W * DPR, Hh * DPR);
    sec.classList.toggle('f14mob', mobile);
  }
  const tmp = new THREE.Vector3(), cA = new THREE.Color(), BG0 = new THREE.Color(0x0b0c0d), PT = new THREE.Color(), IT = new THREE.Color(), LIGHT = new THREE.Color(0xc9cec4), BLACK = new THREE.Color(0);
  let Pd = S.p, lastT = 0;
  function apply(t) {
    const dt = lastT ? Math.min(250, t - lastT) : 16; lastT = t;
    Pd += (S.p - Pd) * (1 - Math.exp(-dt / 130)); if (Math.abs(S.p - Pd) < 1e-4 || RM) Pd = S.p;
    const p = Pd;
    // estilo: metal oscuro -> dibujo de líneas
    if (tl) tl.seek(p * 1000); else chan(p);
    const st = S.st, inv = RM ? 0 : S.inv;
    PT.copy(PAPER).lerp(BG0, inv); IT.copy(INK).lerp(LIGHT, inv);
    for (const k in M) { const m = M[k]; m.color.copy(m.userData.c0).lerp(PT, st); m.emissive.copy(m.userData.e0 || BLACK).lerp(PT, st * (.82 + .1 * inv)); m.envMapIntensity = 1 - st; m.metalness = m.userData.mt * (1 - st); }
    LU.uC.value.set(0x9aa3a6).lerp(IT, st); LU.uA.value = lerp(.13, .95 - .25 * inv, st); HU.uA.value = st * (1 - .3 * inv);
    hulls.forEach(h => h.visible = st > .02);
    glowMat.opacity = (1 - st) * (.2 + .07 * Math.sin(t * .006) + .04 * Math.sin(t * .021)); glows.forEach(g => g.visible = st < .98);
    cA.copy(BG0).lerp(PT, st); stage.style.backgroundColor = '#' + cA.getHexString();
    sec.style.setProperty('--f14ink', '#' + IT.getHexString()); sec.style.setProperty('--f14pap', '#' + PT.getHexString());
    // alas: 20° -> 68° -> 20°
    const sw = S.sw * 48 * D2R;
    // explosión
    const e1 = S.e1, e2 = S.e2, LS = mobile ? .6 : 1;
    parts.forEach(g => {
      const u = g.userData, k = eio(cl((e1 - u.d * .45) / .55));
      g.position.set(u.home.x + u.e.x * k, u.home.y + u.e.y * k, u.home.z + u.e.z * k * LS);
      g.rotation.set((u.r0 || 0) + u.r.x * k, (u.sweep ? -u.side * sw : 0) + u.r.y * k, u.r.z * k);
      g.children.forEach(pc => { const v = pc.userData; if (!v.e) return; const k2 = eo(cl((e2 - v.d * .4) / .6));
        pc.position.copy(v.home).addScaledVector(v.e, k2); pc.rotation.set(v.r.x * k2, v.r.y * k2, v.r.z * k2); });
    });
    // giro del conjunto (anime.js lleva p; aquí solo se mapea) + leve flotación
    const mk = mobile ? eio(seg(p, .4, .85)) : 0; // en móvil (vertical) el despiece se gira hacia el morro para usar la altura
    const yaw = S.yaw + mk * 45, pit = S.pit + (mobile ? S.pm : 0) + mk * 10;
    holder.rotation.set(0, 0, 0); model.rotation.set(0, yaw * D2R, 0);
    model.rotation.x = Math.sin(t * .0007) * .012;
    // cámara: encuadre automático (todas las piezas dentro del recuadro libre)
    const el = pit * D2R, ce = Math.cos(el), se = Math.sin(el);
    model.position.y = 0; model.updateMatrixWorld(true);
    const vf = cam.fov * D2R, tV = Math.tan(vf / 2), tH = tV * cam.aspect;
    const lb = eo(seg(p, .7, .86));
    const iT = mobile ? lerp(.30, .10, eio(seg(p, .02, .3))) : lerp(.2, .06, eio(seg(p, .02, .3))), iB = mobile ? .09 : .07;
    const iS = mobile ? .02 : lerp(.03, .17, lb);
    const aH = tH * (1 - 2 * iS), aV = tV * (1 - iT - iB);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    const pts = [];
    allP.forEach(pc => { const b = pc.userData.bs; tmp.copy(b.center).applyMatrix4(pc.matrixWorld); const rr = b.radius * .8;
      const xs = tmp.x, ys = tmp.y * ce - tmp.z * se, zs = -tmp.y * se - tmp.z * ce; pts.push(xs, ys, zs, rr);
      if (xs - rr < x0) x0 = xs - rr; if (xs + rr > x1) x1 = xs + rr; if (ys - rr < y0) y0 = ys - rr; if (ys + rr > y1) y1 = ys + rr; });
    const tx = (x0 + x1) / 2, ty = (y0 + y1) / 2; let need = 0;
    for (let i = 0; i < pts.length; i += 4) { const d = Math.max((Math.abs(pts[i] - tx) + pts[i + 3]) / aH, (Math.abs(pts[i + 1] - ty) + pts[i + 3]) / aV) - pts[i + 2]; if (d > need) need = d; }
    FIT.d = FIT.d ? lerp(FIT.d, need, FIT.k) : need; FIT.x = FIT.x == null ? tx : lerp(FIT.x, tx, FIT.k); FIT.y = FIT.y == null ? ty : lerp(FIT.y, ty, FIT.k);
    const dist = FIT.d * 1.04;
    // objetivo en el mundo: tx a lo largo de X, ty a lo largo de 'up' de cámara
    const tgx = FIT.x, tgy = FIT.y * ce, tgz = -FIT.y * se;
    cam.position.set(tgx, tgy + se * dist, tgz + ce * dist); cam.lookAt(tgx, tgy, tgz);
    cam.near = Math.max(.5, dist * .35); cam.far = dist * 2.5 + 60; cam.updateProjectionMatrix();
    cam.setViewOffset(W, Hh, 0, -((iT - iB) / 2) * Hh, W, Hh);
    model.position.y = Math.sin(t * .0011) * .12 * (1 - st * .6);
    // título
    const ct = seg(p, .0, .16);
    sec.style.setProperty('--f14c', (1 - ct).toFixed(3)); sec.style.setProperty('--f14cy', (-ct * 40).toFixed(1) + 'px');
    // etiquetas: solo cerca de la explosión completa
    const la = RM ? 1 : S.la;
    sec.style.setProperty('--f14la', la.toFixed(3));
    return la;
  }
  function placeLabels(la) {
    if (la <= 0.001) return;
    model.updateMatrixWorld(true);
    const items = labs.filter(l => !mobile || l.mob).map(l => {
      tmp.copy(l.local); l.g.localToWorld(tmp); tmp.project(cam);
      return { l, x: (tmp.x * .5 + .5) * W, y: (-tmp.y * .5 + .5) * Hh };
    });
    const L = items.filter(i => i.x < W / 2).sort((a, b) => a.y - b.y), Rr = items.filter(i => i.x >= W / 2).sort((a, b) => a.y - b.y);
    const gap = mobile ? 30 : 36, pad = mobile ? 10 : 22;
    [[L, 0], [Rr, 1]].forEach(([arr, side]) => {
      let last = -1e9;
      arr.forEach(i => {
        const ly = Math.min(Hh - 24, Math.max(last + gap, i.y, 70)); last = ly;
        const el = i.l.el; el.style.transform = 'translate(' + (side ? (W - pad) + 'px' : pad + 'px') + ',' + ly + 'px) translate(' + (side ? '-100%' : '0') + ',-50%)';
        const ew = el.offsetWidth || 120, lx = side ? W - pad - ew - 8 : pad + ew + 8;
        i.l.ln.setAttribute('d', 'M' + i.x.toFixed(1) + ' ' + i.y.toFixed(1) + 'L' + (side ? lx + 10 : lx - 10).toFixed(1) + ' ' + ly.toFixed(1) + 'L' + lx.toFixed(1) + ' ' + ly.toFixed(1));
        i.l.dot.setAttribute('cx', i.x.toFixed(1)); i.l.dot.setAttribute('cy', i.y.toFixed(1));
      });
    });
  }
  let raf = 0, vis = true, dead = false, so = null, ro = null, io = null, upd = null;
  function frame(t) {
    raf = 0; if (dead) return;
    if (!document.body.contains(sec)) { kill(); return; }
    const cover = document.querySelector('.cover:not(.out)');
    if (!cover) { const la = apply(t || 0); R.render(scene, cam); placeLabels(la); }
    if (!RM && vis) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !dead) raf = requestAnimationFrame(frame); }
  function kill() {
    if (dead) return; dead = true; if (raf) cancelAnimationFrame(raf);
    try { tl && tl.revert(); } catch (e) { } try { so && so.revert(); } catch (e) { }
    ro && ro.disconnect(); io && io.disconnect(); window.removeEventListener('resize', onR); window.removeEventListener('scroll', upd);
    disposables.forEach(d => { try { d.dispose(); } catch (e) { } }); for (const k in M) M[k].dispose();
    try { R.dispose(); R.forceContextLoss(); } catch (e) { }
  }
  function onR() { size(); kick(); }
  const hd = document.querySelector('header.top'); if (hd) sec.style.setProperty('--f14top', hd.offsetHeight + 'px');
  size();
  window.addEventListener('resize', onR);
  if ('ResizeObserver' in window) { ro = new ResizeObserver(onR); ro.observe(stage); }
  if (RM) { frame(0); setTimeout(() => { size(); frame(0); }, 400); return { kill }; }
  if ('IntersectionObserver' in window) { io = new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) kick(); }); io.observe(sec); }
  upd = () => { const r = sec.getBoundingClientRect(); S.p = cl(-r.top / Math.max(1, r.height - stage.offsetHeight)); kick(); };
  window.addEventListener('scroll', upd, { passive: true }); upd();
  kick();
  window.MAT_F14_DBG = { S, parts, R, kill, info: () => R.info.render, pd: () => Pd };
  return { kill };
}

export const CSS = `
body .f14h.f14on,body .f14h.f14rm{padding:0;position:relative;width:100vw;margin-left:calc(50% - 50vw)}
.f14h.f14on{height:290vh;height:290svh}
.f14h .f14s{position:relative}
.f14h.f14on .f14s,.f14h.f14rm .f14s{position:sticky;top:var(--f14top,52px);height:calc(100vh - var(--f14top,52px));height:calc(100svh - var(--f14top,52px));overflow:hidden;background:#0b0c0d}
.f14h.f14rm .f14s{position:relative;top:0;height:min(78vh,640px)}
.f14h .f14c{display:none}
.f14h.f14on .f14c,.f14h.f14rm .f14c{display:block;position:absolute;inset:0;width:100%;height:100%}
.f14h.f14on .f14copy,.f14h.f14rm .f14copy{position:absolute;left:0;right:0;top:0;max-width:1100px;margin:0 auto;padding:28px 16px 0;opacity:var(--f14c,1);transform:translateY(var(--f14cy,0));pointer-events:none;z-index:2}
.f14h.f14rm .f14copy{opacity:1;transform:none}
.f14h.f14on .f14copy p,.f14h.f14rm .f14copy p{max-width:520px;color:#c9ccc6}
.f14h.f14rm .f14copy p{color:#3a3d40}.f14h.f14rm .mark{color:#15171a}
.f14h .f14ln,.f14h .f14lab,.f14h .f14hint{display:none}
.f14h.f14on .f14ln,.f14h.f14rm .f14ln{display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:var(--f14la,0);z-index:2}
.f14h .f14lp{fill:none;stroke:var(--f14ink,#15171a);stroke-width:1}.f14h .f14ld{fill:var(--f14ink,#15171a)}
.f14h.f14on .f14lab,.f14h.f14rm .f14lab{display:block;position:absolute;inset:0;pointer-events:none;opacity:var(--f14la,0);z-index:3}
.f14h .f14l{position:absolute;left:0;top:0;white-space:nowrap;font:600 11px/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--f14ink,#15171a);text-decoration:none;padding:4px 6px;background:var(--f14pap,#e9e5da);border:1px solid var(--f14ink,#15171a);border-radius:3px;pointer-events:auto;will-change:transform}
.f14h.f14mob .f14lx{display:none}
.f14h.f14mob .f14l{font-size:10px;padding:3px 5px}
.f14h.f14on .f14hint{display:block;position:absolute;left:0;right:0;bottom:18px;text-align:center;font:500 12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.12em;text-transform:uppercase;color:#9aa0a6;opacity:var(--f14c,1);pointer-events:none;z-index:2}
.f14h .f14end{display:none}
.f14h.f14on .f14end,.f14h.f14rm .f14end{display:block;position:absolute;left:0;right:0;bottom:16px;text-align:center;opacity:var(--f14la,0);z-index:3;pointer-events:none}
.f14h .f14end a{pointer-events:auto;font:600 12px/1.3 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--f14ink,#15171a);text-decoration:none;border-bottom:1px solid var(--f14ink,#15171a)}
`;
