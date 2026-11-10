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
export const FACES=[['none',['Ninguna','None']],['gafas',['Solo gafas (balísticas)','Goggles only (ballistic)']],['braga',['Braga (cuello tubular)','Neck gaiter']],['gafasbraga',['Gafas + braga','Goggles + gaiter']],['mascarilla',['Mascarilla','Face mask']],['calavera',['Pasamontañas calavera','Skull balaclava']],['antigas',['Máscara antigás','Gas mask']]];
/* cara: P(u,v) → px, S = alto de la figura en px; cabeza centrada en (0,0.088) */
function drawFace(x,P,S,o,skin){ const f=o.face||'none', fem=o.sex==='f';
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
/* o: {gh, sex:'m'|'f', face, helmet, vest, pack:0|1|2, wkind:'long'|'sniper'|'carbine'|'mg'|'pistol'|null, scope} ; dibuja de pie, centrado en cx, de top a top+H */
export function drawSoldier(x,cx,top,H,o){ o=o||{}; const g=o.gh?ghById(o.gh):null; const S=H; const P=(u,v)=>[cx+u*S,top+v*S]; const fem=o.sex==='f';
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
export function drawPortrait(x,X,Y,r,o,bg){ x.save(); x.beginPath(); x.arc(X,Y,r,0,Math.PI*2); x.closePath(); x.fillStyle=bg||'#2a3036'; x.fill(); x.clip(); const H=r*2*3.1; drawSoldier(x,X,Y-0.115*H,H,o); x.restore(); x.save(); x.beginPath(); x.arc(X,Y,r,0,Math.PI*2); x.lineWidth=Math.max(2,r*0.05); x.strokeStyle='rgba(255,255,255,.55)'; x.stroke(); x.restore(); }
function rr(x,X,Y,w,h,r){ x.beginPath(); x.moveTo(X+r,Y); x.arcTo(X+w,Y,X+w,Y+h,r); x.arcTo(X+w,Y+h,X,Y+h,r); x.arcTo(X,Y+h,X,Y,r); x.arcTo(X,Y,X+w,Y,r); x.closePath(); }
function wrap(x,t,maxW){ const ws=String(t).split(' '); const out=[]; let ln=''; ws.forEach(w=>{ const tt=ln?ln+' '+w:w; if(x.measureText(tt).width>maxW&&ln){ out.push(ln); ln=w; } else ln=tt; }); if(ln) out.push(ln); return out; }
function fit(x,t,maxW,size,weight,fam){ let s=size; do{ x.font=weight+' '+s+'px '+fam; if(x.measureText(t).width<=maxW) break; s-=2; }while(s>18); return s; }
function img(src){ return new Promise(res=>{ if(!src) return res(null); const i=new Image(); i.onload=()=>res(i); i.onerror=()=>res(null); i.src=src; setTimeout(()=>res(null),6000); }); }
/* c: {role, lvl, gh, wName, wKg, wImg, tot, pct, band:{n,c}, bands:[{max,c}], items:[[name,kg]], mob:[[label,value]], hw:{h,kg}|null, fig:{…}} */
export async function renderCard(c){ const W=1080, H=1350; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const x=cv.getContext('2d'); const F='system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
  const [wim,logo]=await Promise.all([img(c.wImg),img('favicon-192.png')]);
  const g=c.gh?ghById(c.gh):null;
  /* fondo */ let bg=x.createLinearGradient(0,0,W,H); bg.addColorStop(0,'#14181b'); bg.addColorStop(1,'#1d2418'); x.fillStyle=bg; x.fillRect(0,0,W,H);
  x.save(); x.globalAlpha=0.06; x.strokeStyle='#cfd8c0'; x.lineWidth=2; for(let k=-H;k<W;k+=46){ x.beginPath(); x.moveTo(k,0); x.lineTo(k+H,H); x.stroke(); } x.restore();
  /* cabecera */ x.fillStyle='#4f6a36'; x.fillRect(0,0,W,10);
  if(logo){ x.save(); rr(x,52,34,84,84,18); x.clip(); x.drawImage(logo,52,34,84,84); x.restore(); }
  x.fillStyle='#f1f3ee'; x.font='800 58px '+F; x.textBaseline='alphabetic'; x.fillText('M.A.T',logo?156:56,94); x.fillStyle='#b9c4a8'; x.font='600 27px '+F; x.fillText(L('CREA TU SOLDADO','BUILD YOUR SOLDIER'),logo?158:58,124);
  x.textAlign='right'; x.fillStyle='#e6eadf'; x.font='700 34px '+F; x.fillText('matmilitar.es',W-52,94); x.textAlign='left';
  /* panel de la figura */ const fx=40, fy=160, fw=470, fh=670; rr(x,fx,fy,fw,fh,28); const pg=x.createLinearGradient(0,fy,0,fy+fh);
  if(g){ const bgs={bosque:['#33402a','#1e261a'],montana:['#5a564b','#2e2b25'],nieve:['#c9d3d8','#7e8a90'],desierto:['#a88c62','#5c4a31']}[g[0]]; pg.addColorStop(0,bgs[0]); pg.addColorStop(1,bgs[1]); } else { pg.addColorStop(0,'#323a40'); pg.addColorStop(1,'#1a1f23'); }
  x.fillStyle=pg; x.fill(); x.save(); rr(x,fx,fy,fw,fh,28); x.clip(); drawSoldier(x,fx+fw/2-30,fy+46,fh-80,c.fig||{}); x.restore(); drawPortrait(x,fx+fw-92,fy+fh-96,74,c.fig||{},'rgba(20,24,28,.85)');
  x.strokeStyle='rgba(255,255,255,.12)'; x.lineWidth=2; rr(x,fx,fy,fw,fh,28); x.stroke();
  /* columna derecha */ const rx=550, rw=W-rx-52; let y=200;
  x.fillStyle='#9fae8c'; x.font='700 26px '+F; x.fillText(L('ROL','ROLE'),rx,y); y+=12;
  let s=fit(x,c.role.toUpperCase(),rw,66,'800',F); x.fillStyle='#ffffff'; const rl=wrap(x,c.role.toUpperCase(),rw).slice(0,2); rl.forEach(t=>{ y+=s+4; x.fillText(t,rx,y); });
  y+=46; x.font='600 30px '+F; x.fillStyle='#d5dccb'; x.fillText(c.lvl||'',rx,y);
  if(g){ y+=50; x.fillStyle=g[2]; rr(x,rx,y-28,34,34,8); x.fill(); x.strokeStyle='rgba(255,255,255,.4)'; x.stroke(); x.fillStyle='#eef1ea'; x.font='600 30px '+F; x.fillText(L('Ghillie: ','Ghillie: ')+LL(g[1]),rx+48,y); }
  /* arma */ y+=44; const by=y, bh=300; rr(x,rx,by,rw,bh,22); x.fillStyle='rgba(255,255,255,.05)'; x.fill(); x.strokeStyle='rgba(255,255,255,.12)'; x.stroke();
  x.fillStyle='#9fae8c'; x.font='700 24px '+F; x.fillText(L('ARMA PRINCIPAL','PRIMARY WEAPON'),rx+22,by+42);
  if(wim){ const iw=rw-44, ih=140, k=Math.min(iw/wim.width,ih/wim.height); const dw=wim.width*k, dh=wim.height*k; x.save(); rr(x,rx+22,by+58,iw,ih,14); x.clip(); x.fillStyle='#20252b'; x.fillRect(rx+22,by+58,iw,ih); x.drawImage(wim,rx+22+(iw-dw)/2,by+58+(ih-dh)/2,dw,dh); x.restore(); }
  const ny=wim?by+240:by+110; x.fillStyle='#fff'; fit(x,c.wName||L('Sin arma principal','No primary weapon'),rw-44,38,'700',F); x.fillText(c.wName||L('Sin arma principal','No primary weapon'),rx+22,ny);
  x.fillStyle='#cfd6c4'; x.font='500 28px '+F; x.fillText(c.wName?(c.wKg!=null?nf(c.wKg,1)+' kg':L('peso no publicado','no published weight')):'',rx+22,ny+40);
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
