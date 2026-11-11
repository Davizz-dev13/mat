/* M.A.T — «Crea tu soldado»: figura 2D (con traje ghillie para el francotirador) y tarjeta para compartir (PNG 1080×1350 hecho en el navegador, sin servidor).
   Figura y tiras del ghillie: dibujo genérico hecho por M.A.T en código, sin insignias ni banderas. Las cifras de la tarjeta son las de la página (pesos con fuente). */
const EN=()=>window.MAT_LANG==='en';
const L=(es,en)=>EN()?en:es;
const LL=a=>Array.isArray(a)?(EN()?a[1]:a[0]):a;
const nf=(x,d)=>Number(x).toLocaleString(EN()?'en-GB':'es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
export const GHO=[['bosque',['Bosque','Woodland'],'#4a5a30',['#3a4626','#52602f','#67583a','#2c3420','#77753f','#4a3b27','#5d6b3a'],'#2c3a22'],
 ['montana',['Montaña / árido','Mountain / arid'],'#8c8068',['#8c8068','#6e695b','#a59679','#5d584e','#b3a78b','#7b6e58','#928a7a'],'#4f4a40'],
 ['nieve',['Nieve','Snow'],'#e3e7e6',['#f4f5f2','#e2e6e5','#ccd2d3','#eceee9','#b9c1c3','#ffffff','#d8dcda'],'#9aa3a8'],
 ['desierto',['Desierto','Desert'],'#c9aa79',['#c9aa79','#b79560','#dac29c','#a88654','#e2d0aa','#9c7c4e','#c4a46f'],'#7d6340']];
export const ghById=id=>GHO.find(g=>g[0]===id)||null;
function rng(seed){ let s=(seed|0)||1; return ()=>{ s=(s*16807)%2147483647; if(s<=0) s+=2147483646; return s/2147483647; }; }

/* cara: P(u,v) → px, S = alto de la figura en px; cabeza centrada en (0,0.088) */
function drawFace(x,P,S,o,skin){ const f='none', fem=false;
  const ell=(u,v,rx,ry,col)=>{ const q=P(u,v); x.beginPath(); x.ellipse(q[0],q[1],rx*S,ry*S,0,0,Math.PI*2); x.fillStyle=col; x.fill(); };
  const rect=(u,v,w,h,col,r)=>{ const q=P(u,v); x.beginPath(); if(x.roundRect) x.roundRect(q[0],q[1],w*S,h*S,(r||0)*S); else x.rect(q[0],q[1],w*S,h*S); x.fillStyle=col; x.fill(); };
  const hw=fem?0.046:0.05, hh=fem?0.054:0.058;
  ell(0,0.088,hw,hh,skin);
  if(fem&&!o.gh){ /* pelo recogido, se ve bajo el casco a los lados de la cara */ ['-1','1'].forEach(k=>{ const sg=+k; x.beginPath(); x.moveTo(...P(sg*(hw-0.004),0.07)); x.quadraticCurveTo(...P(sg*(hw+0.012),0.1),...P(sg*(hw+0.002),0.13)); x.lineTo(...P(sg*(hw-0.008),0.118)); x.quadraticCurveTo(...P(sg*(hw-0.002),0.095),...P(sg*(hw-0.012),0.074)); x.closePath(); x.fillStyle='#3b2a1e'; x.fill(); }); }
  if(f==='calavera'||f==='antigas'){ /* cubre toda la cara */ } else { ell(-0.018,0.098,0.0065,0.0045,'#1c1c1c'); ell(0.018,0.098,0.0065,0.0045,'#1c1c1c'); x.strokeStyle='rgba(60,35,25,.55)'; x.lineWidth=0.004*S; const q1=P(-0.026,0.088), q2=P(-0.01,0.087), q3=P(0.01,0.087), q4=P(0.026,0.088); x.beginPath(); x.moveTo(...q1); x.lineTo(...q2); x.moveTo(...q3); x.lineTo(...q4); x.stroke();
    const m1=P(-0.012,0.128), m2=P(0.012,0.128); x.strokeStyle='rgba(90,45,35,.6)'; x.lineWidth=0.003*S; x.beginPath(); x.moveTo(...m1); x.lineTo(...m2); x.stroke(); }
  if(f==='braga'||f==='gafasbraga'){ const col=o.gh?'#5d5a48':'#6b6249'; x.beginPath(); const a=P(-hw-0.004,0.104), b=P(hw+0.004,0.104), c=P(0.04,0.165), d=P(-0.04,0.165); x.moveTo(...a); x.quadraticCurveTo(...P(0,0.096),...b); x.lineTo(...c); x.lineTo(...d); x.closePath(); x.fillStyle=col; x.fill();
    x.strokeStyle='rgba(0,0,0,.22)'; x.lineWidth=0.0035*S; for(let k=0;k<3;k++){ const y=0.12+k*0.014; x.beginPath(); x.moveTo(...P(-0.042,y)); x.quadraticCurveTo(...P(0,y+0.006),...P(0.042,y)); x.stroke(); } }
  if(f==='mascarilla'){ x.beginPath(); const a=P(-hw+0.004,0.106), b=P(hw-0.004,0.106); x.moveTo(...a); x.quadraticCurveTo(...P(0,0.098),...b); x.quadraticCurveTo(...P(0.04,0.14),...P(0,0.145)); x.quadraticCurveTo(...P(-0.04,0.14),...a); x.fillStyle='#26282a'; x.fill();
    for(let r_=0;r_<3;r_++) for(let k=-3;k<=3;k++) ell(k*0.008+(r_%2)*0.004,0.114+r_*0.009,0.0022,0.0022,'rgba(255,255,255,.18)');
    x.strokeStyle='#26282a'; x.lineWidth=0.003*S; x.beginPath(); x.moveTo(...P(-hw+0.004,0.106)); x.lineTo(...P(-hw-0.002,0.09)); x.moveTo(...P(hw-0.004,0.106)); x.lineTo(...P(hw+0.002,0.09)); x.stroke(); }
  if(f==='calavera'){ x.beginPath(); const q=P(0,0.088); x.ellipse(q[0],q[1],(hw+0.003)*S,(hh+0.003)*S,0,0,Math.PI*2); x.fillStyle='#151617'; x.fill(); rect(-0.032,0.142,0.064,0.03,'#151617',0.01);
    const bone='#d9d6cc'; /* calavera estampada genérica */
    x.beginPath(); x.moveTo(...P(-0.04,0.078)); x.quadraticCurveTo(...P(0,0.06),...P(0.04,0.078)); x.lineTo(...P(0.038,0.11)); x.quadraticCurveTo(...P(0.03,0.142),...P(0,0.146)); x.quadraticCurveTo(...P(-0.03,0.142),...P(-0.038,0.11)); x.closePath(); x.fillStyle=bone; x.fill();
    ell(-0.018,0.098,0.013,0.011,'#151617'); ell(0.018,0.098,0.013,0.011,'#151617'); ell(-0.018,0.098,0.006,0.0045,'#3a3020'); ell(0.018,0.098,0.006,0.0045,'#3a3020');
    x.beginPath(); x.moveTo(...P(0,0.106)); x.lineTo(...P(-0.006,0.117)); x.lineTo(...P(0.006,0.117)); x.closePath(); x.fillStyle='#151617'; x.fill();
    x.strokeStyle='#151617'; x.lineWidth=0.0028*S; x.beginPath(); x.moveTo(...P(-0.022,0.128)); x.lineTo(...P(0.022,0.128)); x.stroke(); for(let k=-4;k<=4;k++){ x.beginPath(); x.moveTo(...P(k*0.0052,0.122)); x.lineTo(...P(k*0.0052,0.136)); x.stroke(); } }
  if(f==='antigas'){ x.beginPath(); const a=P(-hw-0.002,0.072); x.moveTo(...a); x.quadraticCurveTo(...P(0,0.058),...P(hw+0.002,0.072)); x.quadraticCurveTo(...P(hw+0.006,0.13),...P(0.012,0.152)); x.lineTo(...P(-0.012,0.152)); x.quadraticCurveTo(...P(-hw-0.006,0.13),...a); x.fillStyle='#2b2d2e'; x.fill();
    [-0.019,0.019].forEach(u=>{ ell(u,0.095,0.0145,0.0125,'#5d6366'); ell(u,0.095,0.011,0.0095,'#1d3138'); ell(u-0.004,0.091,0.004,0.003,'rgba(255,255,255,.35)'); });
    ell(0,0.128,0.013,0.012,'#3b3e40'); ell(0,0.128,0.008,0.0075,'#232526'); /* membrana fónica */
    const fq=P(-0.04,0.13); x.save(); x.translate(fq[0],fq[1]); x.rotate(-0.5); x.beginPath(); if(x.roundRect) x.roundRect(-0.016*S,-0.014*S,0.03*S,0.028*S,0.006*S); else x.rect(-0.016*S,-0.014*S,0.03*S,0.028*S); x.fillStyle='#3e4142'; x.fill(); x.fillStyle='rgba(0,0,0,.35)'; for(let k=-1;k<=1;k++) x.fillRect(-0.012*S,k*0.007*S-0.001*S,0.022*S,0.002*S); x.restore(); /* filtro lateral */ }
  if(f==='gafas'||f==='gafasbraga'){ x.beginPath(); const a=P(-hw-0.004,0.09), b=P(hw+0.004,0.09); x.moveTo(...a); x.lineTo(...b); x.lineTo(...P(hw+0.002,0.106)); x.quadraticCurveTo(...P(0.01,0.107),...P(0,0.103)); x.quadraticCurveTo(...P(-0.01,0.107),...P(-hw-0.002,0.106)); x.closePath(); x.fillStyle='#1b1d1f'; x.fill();
    x.fillStyle='rgba(120,150,170,.55)'; x.beginPath(); x.moveTo(...P(-0.04,0.092)); x.lineTo(...P(0.04,0.092)); x.lineTo(...P(0.038,0.1)); x.lineTo(...P(-0.038,0.1)); x.closePath(); x.fill(); x.fillStyle='rgba(255,255,255,.4)'; x.fillRect(...P(-0.03,0.0925),0.02*S,0.0025*S); }
}
/* o: {gh, helmet, vest, pack:0|1|2, wkind:'long'|'sniper'|'carbine'|'mg'|'pistol'|null, scope} ; dibuja de pie, centrado en cx, de top a top+H */
export function drawSoldier(x,cx,top,H,o){ o=o||{}; const g=o.gh?ghById(o.gh):null; const S=H; const P=(u,v)=>[cx+u*S,top+v*S]; const fem=false;
  const uni=g?g[4]:'#565a42', uniD=g?g[4]:'#43462f', vestC=g?g[4]:'#3d4030', skin='#b48a6c', boot='#2a2620', helmC=g?g[4]:'#4b4e3b';
  const sh=fem?0.118:0.135, wa=fem?0.092:0.10, hp=fem?0.112:0.105;
  const poly=(pts,fill)=>{ x.beginPath(); pts.forEach((p,i)=>{ const q=P(p[0],p[1]); i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]); }); x.closePath(); x.fillStyle=fill; x.fill(); };
  const limb=(pts,w,col)=>{ x.strokeStyle=col; x.lineWidth=w*S; x.lineCap='round'; x.lineJoin='round'; x.beginPath(); pts.forEach((p,i)=>{ const q=P(p[0],p[1]); i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]); }); x.stroke(); };
  const ell=(u,v,rx,ry,col)=>{ const q=P(u,v); x.beginPath(); x.ellipse(q[0],q[1],rx*S,ry*S,0,0,Math.PI*2); x.fillStyle=col; x.fill(); };
  x.save();
  /* sombra en el suelo */ { const q=P(0,0.995); const gr=x.createRadialGradient(q[0],q[1],0,q[0],q[1],0.2*S); gr.addColorStop(0,'rgba(0,0,0,.45)'); gr.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=gr; x.beginPath(); x.ellipse(q[0],q[1],0.2*S,0.035*S,0,0,Math.PI*2); x.fill(); }
  /* mochila (detrás) */
  if(o.pack){ const t=o.pack>1?0.075:0.16, b=o.pack>1?0.50:0.42, w=o.pack>1?0.16:0.135; poly([[-w,t+0.03],[-w+0.02,t],[w-0.02,t],[w,t+0.03],[w+0.01,b],[-w-0.01,b]],g?g[4]:'#4a4c38'); if(o.pack>1){ poly([[-w+0.02,t-0.035],[w-0.02,t-0.035],[w-0.03,t+0.005],[-w+0.03,t+0.005]],'#3a3c2c'); } }
  /* pelo recogido bajo el casco (figura femenina) */
  if(fem&&!g){ /* moño bajo bajo el casco, asoma por detrás */ ell(0.046,0.128,0.024,0.021,'#3b2a1e'); ell(0.05,0.124,0.012,0.009,'rgba(255,255,255,.08)'); }
  /* piernas */
  poly([[-hp,0.455],[-0.005,0.455],[-0.022,0.70],[-0.035,0.93],[-0.092,0.93],[-hp+0.005,0.70]],uni);
  poly([[0.005,0.455],[hp,0.455],[hp+0.007,0.70],[0.098,0.93],[0.04,0.93],[0.028,0.70]],uniD);
  ell(-0.06,0.69,0.042,0.03,'#3a3c2e'); ell(0.07,0.69,0.042,0.03,'#3a3c2e'); /* rodilleras */
  poly([[-0.098,0.925],[-0.03,0.925],[-0.025,0.985],[-0.112,0.985],[-0.112,0.965]],boot); poly([[0.035,0.925],[0.103,0.925],[0.118,0.965],[0.118,0.985],[0.03,0.985]],boot);
  /* torso */
  poly([[-sh,0.175],[-0.055,0.15],[0.055,0.15],[sh,0.175],[wa+0.012,0.36],[hp+0.005,0.46],[-hp-0.005,0.46],[-wa-0.012,0.36]],uni);
  poly([[-hp+0.002,0.44],[hp-0.002,0.44],[hp,0.475],[-hp,0.475]],'#2f3126'); /* cinto */
  if(o.vest){ const vw=sh-0.017; poly([[-vw,0.2],[-0.05,0.18],[0.05,0.18],[vw,0.2],[vw-0.006,0.43],[-vw+0.006,0.43]],vestC); if(!g){ for(let i=0;i<3;i++){ const u=-0.09+i*0.06; poly([[u,0.33],[u+0.05,0.33],[u+0.05,0.415],[u,0.415]],'#33362a'); poly([[u,0.33],[u+0.05,0.33],[u+0.05,0.345],[u,0.345]],'#2a2c22'); } } }
  /* cuello y cabeza */
  poly([[-0.028,0.13],[0.028,0.13],[0.033,0.165],[-0.033,0.165]],skin);
  drawFace(x,P,S,o,skin);
  if(o.helmet||g){ x.beginPath(); const q=P(0,0.085), hr=fem?0.062:0.066; x.ellipse(q[0],q[1],hr*S,0.06*S,0,Math.PI,0); x.lineTo(q[0]+hr*S,q[1]+0.012*S); x.lineTo(q[0]-hr*S,q[1]+0.012*S); x.closePath(); x.fillStyle=helmC; x.fill(); }
  /* arma (en diagonal delante del pecho) */
  const wk=o.wkind; const lg=wk==='sniper'?0.62:wk==='long'?0.5:wk==='mg'?0.52:(wk&&wk!=='pistol')?0.42:0;
  if(lg){ const A=[0.12,0.50], Bm=[-0.17,0.06], pt=t=>[A[0]+(Bm[0]-A[0])*t*(lg/0.62), A[1]+(Bm[1]-A[1])*t*(lg/0.62)];
    limb([pt(0),pt(0.28)],0.05,'#2a2b26'); limb([pt(0.2),pt(1)],0.022,'#1f201c'); limb([pt(0.22),pt(0.55)],0.035,'#2a2b26');
    if(wk==='sniper'||o.scope){ limb([pt(0.3),pt(0.52)],0.03,'#141512'); limb([pt(0.5),pt(0.55)],0.04,'#141512'); }
    if(wk==='mg'){ limb([pt(0.32),pt(0.4)],0.05,'#26271f'); }
    if(g){ const R=rng(77); for(let i=0;i<46;i++){ const t=0.25+R()*0.6, q=P(...pt(t)); x.strokeStyle=g[3][(R()*g[3].length)|0]; x.lineWidth=(0.004+R()*0.006)*S; x.beginPath(); x.moveTo(q[0],q[1]); x.quadraticCurveTo(q[0]+(R()-0.5)*0.03*S,q[1]+0.02*S,q[0]+(R()-0.5)*0.035*S,q[1]+(0.025+R()*0.04)*S); x.stroke(); } } }
  /* brazos y manos */
  limb([[-sh+0.005,0.19],[-sh-0.03,0.33],[-0.07,0.44]],fem?0.052:0.058,uni); limb([[sh-0.005,0.19],[sh+0.02,0.30],[0.02,0.30]],fem?0.05:0.055,uniD);
  ell(-0.065,0.44,0.026,0.024,'#2b2a24'); ell(0.02,0.30,0.026,0.024,'#2b2a24');
  /* traje ghillie: tiras de yute sobre todo el contorno (capucha, hombros, torso, brazos y muslos) */
  if(g){ const R=rng(g[0].charCodeAt(0)*97+13), pal=g[3];
    const zones=[[0,0.07,0.085,0.07,260],[0,0.3,0.15,0.17,900],[-0.15,0.3,0.05,0.14,240],[0.14,0.25,0.05,0.09,170],[-0.06,0.57,0.06,0.13,320],[0.07,0.57,0.06,0.13,320],[-0.06,0.76,0.05,0.06,90],[0.07,0.76,0.05,0.06,90]];
    for(let pass=0;pass<2;pass++) zones.forEach(([zu,zv,ru,rv,n])=>{ const N=pass?n*0.55:n; for(let i=0;i<N;i++){ const a=R()*Math.PI*2, r=Math.sqrt(R()); const u=zu+Math.cos(a)*ru*r*1.08, v=zv+Math.sin(a)*rv*r*1.05; if(zv<0.1&&v>0.07&&v<0.15&&Math.abs(u)<0.034) continue;
      const q=P(u,v), len=(pass?0.018+R()*0.03:0.03+R()*0.05)*S, out=(u-zu)/(ru||1), dx=(out*0.5+(R()-0.5)*0.6)*len*0.5, col=pal[(R()*pal.length)|0];
      x.strokeStyle=col; x.globalAlpha=pass?0.95:0.9; x.lineWidth=(pass?0.003+R()*0.004:0.004+R()*0.006)*S; x.lineCap='round';
      x.beginPath(); x.moveTo(q[0],q[1]); x.quadraticCurveTo(q[0]+dx*0.6+(R()-0.5)*len*0.3,q[1]+len*0.5,q[0]+dx,q[1]+len); x.stroke(); } });
    x.globalAlpha=1; /* abertura de la capucha: se ve la cara (o la máscara) en sombra */ x.save(); const fq=P(0,0.108); x.beginPath(); x.ellipse(fq[0],fq[1],0.036*S,0.038*S,0,0,Math.PI*2); x.clip(); drawFace(x,P,S,o,'#8d6b54'); const vg=x.createRadialGradient(fq[0],fq[1],0.01*S,fq[0],fq[1],0.04*S); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,.55)'); x.fillStyle=vg; x.fillRect(fq[0]-0.05*S,fq[1]-0.05*S,0.1*S,0.1*S); x.restore();
    for(let i=0;i<40;i++){ const a=R()*Math.PI*2, q=P(Math.cos(a)*0.04,0.108+Math.sin(a)*0.042); const len=(0.015+R()*0.02)*S; x.strokeStyle=pal[(R()*pal.length)|0]; x.lineWidth=(0.003+R()*0.004)*S; x.beginPath(); x.moveTo(q[0],q[1]); x.quadraticCurveTo(q[0]+(R()-0.5)*len*0.4,q[1]+len*0.5,q[0]+(R()-0.5)*len*0.5,q[1]+len); x.stroke(); } }
  x.restore(); }
/* retrato: la cabeza de cerca (para ver la máscara) en un círculo de radio r centrado en (X,Y) */
function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
function wrap(x,t,maxW){ const ws=String(t).split(' '); const out=[]; let ln=''; ws.forEach(w=>{ const tt=ln?ln+' '+w:w; if(x.measureText(tt).width>maxW&&ln){ out.push(ln); ln=w; } else ln=tt; }); if(ln) out.push(ln); return out; }
function fit(x,t,maxW,size,weight,fam){ let s=size; do{ x.font=weight+' '+s+'px '+fam; if(x.measureText(t).width<=maxW) break; s-=2; }while(s>18); return s; }
function img(src){ return new Promise(res=>{ if(!src) return res(null); const i=new Image(); i.onload=()=>res(i); i.onerror=()=>res(null); i.src=src; setTimeout(()=>res(null),6000); }); }
/* c: {role, lvl, gh, wName, wKg, wImg, tot, pct, band:{n,c}, bands:[{max,c}], items:[[name,kg]], mob:[[label,value]], hw:{h,kg}|null, fig:{…}} */
/* paisaje de fondo de la foto 3D según el terreno del ghillie (dibujado en código, sin imágenes) */
function hillPath(x,X,W,base,amp,rnd,n,sharp){ x.beginPath(); x.moveTo(X-4,base+400); let px=X-4; x.lineTo(px,base); const pts=[]; for(let i=0;i<=n;i++){ const u=i/n; pts.push([X+u*W, base-amp*(sharp?(i%2?0.25+0.75*rnd():0.85+0.15*rnd()):(0.45+0.55*rnd()))]); }
  if(sharp){ pts.forEach(p=>x.lineTo(p[0],p[1])); } else { for(let i=0;i<pts.length-1;i++){ const a=pts[i], b=pts[i+1]; x.quadraticCurveTo(a[0],a[1],(a[0]+b[0])/2,(a[1]+b[1])/2); } x.lineTo(X+W+4,pts[pts.length-1][1]); }
  x.lineTo(X+W+4,base+400); x.closePath(); return pts; }
function pine(x,cx,by,h,col){ const w=h*0.36; x.fillStyle=col; x.beginPath(); for(let k=0;k<4;k++){ const t=by-h*(k*0.22), ww=w*(1-k*0.2); x.moveTo(cx-ww/2,t); x.lineTo(cx,t-h*0.42); x.lineTo(cx+ww/2,t); } x.fill(); x.fillRect(cx-h*0.02,by-h*0.02,h*0.04,h*0.08); }
export function scenery(x,X,Y,W,H,id){ const r=rng(id==='nieve'?11:id==='montana'?23:id==='desierto'?37:id==='bosque'?51:7); x.save(); x.beginPath(); x.rect(X,Y,W,H); x.clip();
  const hz=Y+H*0.6, gnd=Y+H*0.86;
  const P={bosque:{sky:['#9fb3a9','#d9dfc9'],far:'#7d9183',mid:'#4f6448',near:'#2f3f2b',gr:['#4a5a32','#2b3520'],fog:'rgba(225,232,215,.35)'},
    montana:{sky:['#8fa6bb','#d7dde0'],far:'#9aa6b1',mid:'#6f7276',near:'#4d4b47',gr:['#76705f','#4a463c'],fog:'rgba(230,234,238,.3)'},
    nieve:{sky:['#a9bfd3','#eef3f7'],far:'#d5e0ea',mid:'#c3d1de',near:'#e9eff4',gr:['#f2f6f9','#cbd7e2'],fog:'rgba(255,255,255,.4)'},
    desierto:{sky:['#d99a5e','#f3dcae'],far:'#c99a6c',mid:'#d4a56c',near:'#c08d55',gr:['#d9b07a','#ad7f4b'],fog:'rgba(255,235,200,.3)'},
    none:{sky:['#8ea1b0','#d3d9d6'],far:'#8c9a95',mid:'#6f7f69',near:'#56664b',gr:['#6b7650','#3e4630'],fog:'rgba(230,234,226,.3)'}}[id]||null;
  const p=P||{}; const pp=P?p:{sky:['#8ea1b0','#d3d9d6'],far:'#8c9a95',mid:'#6f7f69',near:'#56664b',gr:['#6b7650','#3e4630'],fog:'rgba(230,234,226,.3)'};
  let g=x.createLinearGradient(0,Y,0,hz); g.addColorStop(0,pp.sky[0]); g.addColorStop(1,pp.sky[1]); x.fillStyle=g; x.fillRect(X,Y,W,H);
  /* sol suave */ const sx=X+W*0.74, sy=Y+H*0.2; g=x.createRadialGradient(sx,sy,0,sx,sy,W*0.5); g.addColorStop(0,id==='desierto'?'rgba(255,240,200,.75)':'rgba(255,255,245,.55)'); g.addColorStop(1,'rgba(255,255,245,0)'); x.fillStyle=g; x.fillRect(X,Y,W,H);
  if(id==='montana'||id==='nieve'){ /* cordillera lejana con nieve en las cumbres */ const pts=hillPath(x,X,W,hz-H*0.04,H*(id==='nieve'?0.2:0.26),r,9,true); x.fillStyle=pp.far; x.fill();
    x.save(); x.clip(); const bse=hz+H*0.02, lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
    /* ladera en sombra (luz desde la derecha, el sol) */ x.fillStyle='rgba(20,28,40,.16)'; for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i]; if(a[1]<b[1]){ x.beginPath(); x.moveTo(a[0],a[1]); x.lineTo(b[0],b[1]); x.lineTo(b[0],bse); x.lineTo(a[0]+(b[0]-a[0])*0.35,bse); x.closePath(); x.fill(); } else { x.beginPath(); x.moveTo(b[0],b[1]); x.lineTo(a[0],a[1]); x.lineTo(a[0],bse); x.lineTo(b[0]-(b[0]-a[0])*0.15,bse); x.closePath(); x.globalAlpha=0.0; x.fill(); x.globalAlpha=1; } }
    /* nieve en las cumbres, con borde irregular */ pts.forEach((q,i)=>{ if(i===0||i===pts.length-1||q[1]>hz-H*0.1) return; const Lp=lerp(q,pts[i-1],0.34), Rp=lerp(q,pts[i+1],0.3); x.beginPath(); x.moveTo(q[0],q[1]); x.lineTo(Rp[0],Rp[1]); const n=5; for(let k=1;k<n;k++){ const t=k/n, m=lerp(Rp,Lp,t); x.lineTo(m[0],m[1]+(k%2?-H*0.012:H*0.01)*(0.6+r()*0.8)); } x.lineTo(Lp[0],Lp[1]); x.closePath();
      x.fillStyle=id==='nieve'?'rgba(255,255,255,.92)':'rgba(240,244,248,.82)'; x.fill(); x.fillStyle='rgba(120,140,165,.28)'; x.beginPath(); x.moveTo(q[0],q[1]); x.lineTo(Lp[0],Lp[1]); x.lineTo(lerp(Lp,Rp,0.4)[0],lerp(Lp,Rp,0.4)[1]+H*0.01); x.closePath(); x.fill(); }); x.restore();
    hillPath(x,X,W,hz+H*0.03,H*0.12,r,6,id==='montana'); x.fillStyle=pp.mid; x.fill(); }
  else if(id==='desierto'){ hillPath(x,X,W,hz-H*0.02,H*0.05,r,3,false); x.fillStyle=pp.far; x.fill();
    hillPath(x,X,W,hz+H*0.02,H*0.06,r,3,false); x.fillStyle='#cf9f68'; x.fill();
    hillPath(x,X,W,hz+H*0.06,H*0.07,r,4,false); x.fillStyle=pp.mid; x.fill(); }
  else { hillPath(x,X,W,hz-H*0.02,H*0.08,r,5,false); x.fillStyle=pp.far; x.fill();
    if(id==='bosque'){ for(let i=0;i<40;i++){ const cx=X+r()*W, h=H*(0.07+r()*0.06); pine(x,cx,hz+H*0.02+r()*H*0.02,h,'#5d7262'); } x.fillStyle=pp.fog; x.fillRect(X,hz-H*0.03,W,H*0.08);
      for(let i=0;i<26;i++){ const cx=X+r()*W, h=H*(0.13+r()*0.09); pine(x,cx,hz+H*0.1+r()*H*0.03,h,pp.mid); } }
    else { hillPath(x,X,W,hz+H*0.06,H*0.06,r,5,false); x.fillStyle=pp.mid; x.fill(); } }
  if(id==='nieve'){ for(let i=0;i<14;i++){ const cx=X+r()*W, h=H*(0.07+r()*0.06); pine(x,cx,hz+H*0.08+r()*H*0.02,h,'#5b6b6a'); } }
  /* neblina en el horizonte */ g=x.createLinearGradient(0,hz-H*0.1,0,hz+H*0.12); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(0.5,pp.fog); g.addColorStop(1,'rgba(255,255,255,0)'); x.fillStyle=g; x.fillRect(X,hz-H*0.1,W,H*0.22);
  /* suelo cercano */ const gy=Y+H*0.72; hillPath(x,X,W,gy,H*0.03,r,4,false); g=x.createLinearGradient(0,gy-H*0.03,0,Y+H); g.addColorStop(0,pp.gr[0]); g.addColorStop(1,pp.gr[1]); x.fillStyle=g; x.fill();
  /* textura del suelo */ for(let i=0;i<(id==='nieve'?60:160);i++){ const u=r(), v=r(); const yy=gy+(Y+H-gy)*v*v+4, xx=X+u*W, s=1+v*4;
    if(id==='bosque'||id==='none'){ x.strokeStyle=r()<0.5?'rgba(30,40,20,.35)':'rgba(140,150,90,.3)'; x.lineWidth=1+v; x.beginPath(); x.moveTo(xx,yy); x.lineTo(xx+(r()-0.5)*4,yy-s*3); x.stroke(); }
    else if(id==='montana'){ x.fillStyle=r()<0.5?'rgba(60,58,52,.45)':'rgba(160,155,140,.4)'; x.beginPath(); x.ellipse(xx,yy,s*1.6,s*0.8,0,0,Math.PI*2); x.fill(); }
    else if(id==='desierto'){ x.strokeStyle='rgba(150,105,60,.25)'; x.lineWidth=1; x.beginPath(); x.moveTo(xx-s*5,yy); x.quadraticCurveTo(xx,yy-s*0.8,xx+s*5,yy); x.stroke(); }
    else { x.fillStyle='rgba(170,190,210,.35)'; x.beginPath(); x.ellipse(xx,yy,s*3,s*0.6,0,0,Math.PI*2); x.fill(); } }
  if(id==='nieve'){ x.fillStyle='rgba(255,255,255,.8)'; for(let i=0;i<70;i++){ x.beginPath(); x.arc(X+r()*W,Y+r()*H*0.9,0.8+r()*1.8,0,Math.PI*2); x.fill(); } }
  /* viñeta */ g=x.createRadialGradient(X+W/2,Y+H*0.55,H*0.25,X+W/2,Y+H*0.55,H*0.8); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.35)'); x.fillStyle=g; x.fillRect(X,Y,W,H);
  x.restore(); return Y+H*0.93; }
function svgImg(s){ if(!s) return Promise.resolve(null); s=String(s).replace(/<svg /,'<svg xmlns="http://www.w3.org/2000/svg" '); return img('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s)); }
export async function renderCard(c){ const W=1080, H=1350; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d'); const F='system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const [wim,logo]=await Promise.all([img(c.wImg),img('favicon-192.png')]);
  const g=c.gh?ghById(c.gh):null;
  /* fondo */ let bg=x.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#14181b'); bg.addColorStop(1,'#1d2418'); x.fillStyle=bg; x.fillRect(0,0,W,H);
  x.save(); x.globalAlpha=0.06; x.strokeStyle='#cfd8c0'; x.lineWidth=2; for(let k=-H;k<W;k+=46){ x.beginPath(); x.moveTo(k,0); x.lineTo(k+H,H); x.stroke(); } x.restore();
  /* cabecera */ x.fillStyle='#4f6a36'; x.fillRect(0,0,W,10);
  if(logo){ x.save(); rr(x,52,34,84,84,18); x.clip(); x.drawImage(logo,52,34,84,84); x.restore(); }
  x.fillStyle='#f1f3ee'; x.font='800 58px '+F; x.textBaseline='alphabetic'; x.fillText('M.A.T',logo?156:56,94); x.fillStyle='#b9c4a8'; x.font='600 27px '+F; x.fillText(L('CREA TU SOLDADO','BUILD YOUR SOLDIER'),logo?158:58,124);
  x.textAlign='right'; x.fillStyle='#e6eadf'; x.font='700 34px '+F; x.fillText('matmilitar.es',W-52,94); x.textAlign='left';
  /* panel de la figura: foto del soldado 3D sobre un paisaje del terreno; dibujo 2D solo si no hay 3D (WebGL) */ const fx=40, fy=160, fw=470, fh=680; const sn=c.snap||null;
  x.save(); rr(x,fx,fy,fw,fh,28); x.clip(); const foot=scenery(x,fx,fy,fw,fh,g?g[0]:'none');
  if(sn&&sn.width){ const pad=22, aw=fw-pad*2, ah=(foot-fy)*0.86, k=Math.min(aw/sn.width,ah/sn.height), dw=sn.width*k, dh=sn.height*k, dx=fx+(fw-dw)/2, dy=foot-dh;
    const sg=x.createRadialGradient(fx+fw/2,foot-6,4,fx+fw/2,foot-6,dw*0.42); sg.addColorStop(0,'rgba(0,0,0,.45)'); sg.addColorStop(1,'rgba(0,0,0,0)'); x.save(); x.translate(0,(foot-6)*(1-0.22)); x.scale(1,0.22); x.fillStyle=sg; x.fillRect(fx,foot-6-dw*0.42,fw,dw*0.84); x.restore();
    x.drawImage(sn,dx,dy,dw,dh); }
  else drawSoldier(x,fx+fw/2-30,fy+46,fh-80,c.fig||{});
  x.restore(); x.strokeStyle='rgba(255,255,255,.14)'; x.lineWidth=2; rr(x,fx,fy,fw,fh,28); x.stroke();
  /* columna derecha */ const rx=550, rw=W-rx-52; let y=172; const md=c.med||null; const [ins,...mim]=await Promise.all([svgImg(md&&md.insignia)].concat(((md&&md.top)||[]).map(m=>svgImg(m.svg))));
  if(c.nick){ const ns=fit(x,c.nick,rw,c.nick.length>12?56:66,'800',F); x.fillStyle='#ffffff'; y+=ns; x.fillText(c.nick,rx,y); y+=18; }
  /* empleo (medallas de la web) */ { const rn=md?LL(md.name):L('Soldado','Private'); const iy=y+2; if(ins){ x.drawImage(ins,rx-4,iy,58,58); } x.fillStyle='#9fae8c'; x.font='700 21px '+F; x.fillText(L('EMPLEO','RANK'),rx+(ins?64:0),iy+22); x.fillStyle='#f1d77a'; fit(x,rn,rw-(ins?64:0),32,'700',F); x.fillText(rn,rx+(ins?64:0),iy+54); y=iy+62; }
  x.fillStyle='#9fae8c'; x.font='700 21px '+F; y+=16; x.fillText(L('ROL','ROLE'),rx,y);
  let s=fit(x,c.role.toUpperCase(),rw,c.nick?50:60,'800',F); x.fillStyle='#ffffff'; const rl=wrap(x,c.role.toUpperCase(),rw).slice(0,c.nick?1:2); rl.forEach(t=>{ y+=s+2; x.fillText(t,rx,y); });
  y+=36; x.font='600 26px '+F; x.fillStyle='#d5dccb'; const lv=c.lvl||''; x.fillText(lv,rx,y); let gx=rx+x.measureText(lv).width+(lv?22:0);
  if(g){ const gt=LL(g[1]); x.font='600 26px '+F; if(gx+40+x.measureText(L('Ghillie: ','Ghillie: ')+gt).width>rx+rw){ y+=38; gx=rx; } x.fillStyle=g[2]; rr(x,gx,y-24,28,28,7); x.fill(); x.strokeStyle='rgba(255,255,255,.4)'; x.stroke(); x.fillStyle='#eef1ea'; x.fillText(L('Ghillie: ','Ghillie: ')+gt,gx+38,y); }
  /* medallas */ const MT=(md&&md.top)||[]; const mh=MT.length?116:0;
  /* arma */ y+=26; const by=y, bh=Math.max(170,Math.min(270,fy+fh-mh-by-8)); rr(x,rx,by,rw,bh,22); x.fillStyle='rgba(255,255,255,.05)'; x.fill(); x.strokeStyle='rgba(255,255,255,.12)'; x.stroke();
  x.fillStyle='#9fae8c'; x.font='700 22px '+F; x.fillText(L('ARMA PRINCIPAL','PRIMARY WEAPON'),rx+22,by+36);
  const ih=Math.max(60,bh-136); if(wim){ const iw=rw-44, k=Math.min(iw/wim.width,ih/wim.height); const dw=wim.width*k, dh=wim.height*k; x.save(); rr(x,rx+22,by+50,iw,ih,14); x.clip(); x.fillStyle='#20252b'; x.fillRect(rx+22,by+50,iw,ih); x.drawImage(wim,rx+22+(iw-dw)/2,by+50+(ih-dh)/2,dw,dh); x.restore(); }
  const ny=wim?by+50+ih+40:by+90; x.fillStyle='#fff'; fit(x,c.wName||L('Sin arma principal','No primary weapon'),rw-44,34,'700',F); x.fillText(c.wName||L('Sin arma principal','No primary weapon'),rx+22,ny);
  x.fillStyle='#cfd6c4'; x.font='500 26px '+F; x.fillText(c.wName?(c.wKg!=null?nf(c.wKg,1)+' kg':L('peso no publicado','no published weight')):'',rx+22,ny+34);
  if(MT.length){ const my=fy+fh-mh+16; x.fillStyle='#9fae8c'; x.font='700 22px '+F; x.fillText(L('MEDALLAS','MEDALS'),rx,my+6); const cw=rw/3;
    MT.forEach((m,i)=>{ const cx=rx+i*cw; const im=mim[i]; if(im) x.drawImage(im,cx,my+18,46,54); x.font='600 19px '+F; x.fillStyle={o:'#ecc256',p:'#dfe4ea',b:'#d79a5e'}[m.tr]||'#fff'; const ln=wrap(x,LL(m.n)+(m.lv?' '+['','I','II','III'][m.lv]:''),cw-56).slice(0,3); ln.forEach((t,j)=>x.fillText(t,cx+52,my+36+j*21)); }); }
  /* carga total */ y=880; x.fillStyle='#9fae8c'; x.font='700 26px '+F; x.fillText(L('CARGA TOTAL','TOTAL LOAD'),56,y);
  x.fillStyle='#fff'; x.font='800 92px '+F; const tt=nf(c.tot,1)+' kg'; x.fillText(tt,52,y+92); const tw=x.measureText(tt).width;
  if(c.pct!=null){ x.font='700 46px '+F; x.fillStyle=c.band?c.band.c:'#fff'; x.fillText(nf(c.pct,0)+' %',72+tw,y+78); x.font='500 26px '+F; x.fillStyle='#d5dccb'; x.fillText(L('de su peso corporal','of body weight'),74+tw,y+108);
    const bx=56, bw=W-112, bY=y+136, bH=26, max=90; let prev=0; x.save(); rr(x,bx,bY,bw,bH,13); x.clip(); (c.bands||[]).forEach(b=>{ const to=b.max==null?max:b.max; x.fillStyle=b.c; x.fillRect(bx+prev/max*bw,bY,(to-prev)/max*bw+1,bH); prev=to; }); x.restore();
    const mx=bx+Math.min(0.995,c.pct/max)*bw; x.fillStyle='#fff'; x.fillRect(mx-3,bY-10,6,bH+20); x.strokeStyle='#000'; x.lineWidth=1.5; x.strokeRect(mx-3,bY-10,6,bH+20);
    x.font='500 22px '+F; x.fillStyle='rgba(255,255,255,.7)'; [0,30,45,70,90].forEach(p=>{ const px=bx+p/max*bw; x.textAlign=p===0?'left':p===90?'right':'center'; x.fillText(p+' %',px,bY+bH+30); }); x.textAlign='left';
    if(c.band){ x.font='700 30px '+F; x.fillStyle=c.band.c; x.fillText(c.band.n,56,bY+bH+76); }
    if(c.hw){ x.font='600 26px '+F; x.fillStyle='#d5dccb'; x.textAlign='right'; x.fillText(L('Altura ','Height ')+c.hw.h+' cm · '+L('peso ','weight ')+nf(c.hw.kg,0)+' kg',W-56,bY+bH+76); x.textAlign='left'; } }
  else { x.font='500 28px '+F; x.fillStyle='#d5dccb'; x.fillText(L('Pon tu peso en la web para ver el % de tu peso corporal','Enter your weight on the site to see the % of body weight'),56,y+140); }
  /* equipo clave y movilidad */ y=1150; x.fillStyle='#9fae8c'; x.font='700 24px '+F; x.fillText(L('EQUIPO CLAVE','KEY GEAR'),56,y); x.fillText(L('MOVILIDAD (ESTIMACIÓN)','MOBILITY (ESTIMATE)'),600,y);
  x.font='500 25px '+F; (c.items||[]).slice(0,4).forEach((it,i)=>{ const yy=y+34+i*30; x.fillStyle='#eef1ea'; let n=it[0]; while(x.measureText(n).width>380&&n.length>4) n=n.slice(0,-2); if(n!==it[0]) n=n.replace(/\s*\S?$/,'')+'…'; x.fillText(n,56,yy); x.textAlign='right'; x.fillStyle='#cfd6c4'; x.fillText(nf(it[1],1)+' kg',540,yy); x.textAlign='left'; });
  (c.mob||[]).slice(0,4).forEach((m,i)=>{ const yy=y+34+i*30; x.fillStyle='#eef1ea'; x.fillText(m[0],600,yy); x.textAlign='right'; x.fillStyle='#fff'; x.font='700 25px '+F; x.fillText(m[1],W-52,yy); x.font='500 25px '+F; x.textAlign='left'; });
  /* pie */ x.fillStyle='rgba(255,255,255,.08)'; x.fillRect(0,H-62,W,62); x.fillStyle='#c9d1bd'; x.font='500 22px '+F;
  x.fillText(L('Pesos con fuente publicada · estimación educativa','Weights with published sources · educational estimate'),40,H-23);
  x.textAlign='right'; x.fillStyle='#fff'; x.font='700 26px '+F; x.fillText('matmilitar.es',W-40,H-22); x.textAlign='left';
  return cv; }
