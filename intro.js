/* M.A.T · intro de entrada: las letras M, A, T se transforman en portaaviones, caza y carro de combate.
   Solo en la portada (sin #/ruta), una vez por sesión (sessionStorage mat_in). Siluetas SVG dibujadas a mano para M.A.T. */
(function(){
"use strict";
var hp=location.hash.replace(/^#\/?/,'').split('?')[0];
var seen=false; try{seen=sessionStorage.getItem('mat_in')==='1';}catch(e){seen=true;}
if(seen) return;
try{sessionStorage.setItem('mat_in','1');}catch(e){}
if(hp) return; /* enlace directo a una sección: sin intro */
var lm=(location.search+location.hash).match(/[?&]lang=(en|es)\b/), L=lm?lm[1]:null;
if(!L){ try{L=localStorage.getItem('mat_lang');}catch(e){} }
var EN=L==='en';
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var DE=document.documentElement; DE.classList.add('mi-on');
var css='html.mi-on,html.mi-on body{overflow:hidden!important}html.mi-on body>*:not(#mi){visibility:hidden}'+
'#mi{position:fixed;inset:0;z-index:1000;background:radial-gradient(120% 80% at 50% 45%,#161a1c 0%,#0b0c0d 55%,#040505 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;transition:opacity .6s ease,transform .6s ease;color:#e9e9e6;font:16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-tap-highlight-color:transparent}'+
'#mi.out{opacity:0;transform:scale(1.04);pointer-events:none}#mi.out.rm{transform:none}'+
'#mi:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.018) 0 1px,transparent 1px 4px);pointer-events:none}'+
'#mi svg{display:block;width:100%;flex:1 1 auto;min-height:0;max-width:1400px}'+
'#mi .mib{flex:0 0 auto;width:100%;display:flex;justify-content:center;padding:6px 24px max(28px,calc(env(safe-area-inset-bottom) + 18px))}'+
'#mi .migo{min-width:220px;min-height:52px;background:rgba(143,154,106,.18);border:1px solid #b3bd8c;color:#f1f1ee;font:600 15px/1 inherit;font-family:inherit;letter-spacing:.24em;text-transform:uppercase;border-radius:4px;cursor:pointer;padding:0 22px;opacity:0;transform:translateY(8px);transition:opacity .5s,transform .5s,background .2s}'+
'#mi .migo.on{opacity:1;transform:none}#mi .migo:hover,#mi .migo:focus-visible{background:rgba(143,154,106,.34)}'+
'#mi .misk{position:absolute;top:max(12px,env(safe-area-inset-top));right:12px;min-height:44px;min-width:44px;padding:0 14px;background:transparent;border:0;color:#9aa0a6;font:500 14px/1 inherit;font-family:inherit;letter-spacing:.12em;cursor:pointer;border-radius:4px;z-index:2}'+
'#mi .misk:hover,#mi .misk:focus-visible{color:#f1f1ee;background:rgba(255,255,255,.06)}';
var st=document.createElement('style'); st.textContent=css; (document.head||DE).appendChild(st);

/* ---------- geometría ---------- */
var LET={
 M:'M-50 65V-65H-24L0-10 24-65H50V65H26V-12L6 34H-6L-26-12V65Z',
 A:'M-52 65L-14-65H14L52 65H26L18 36H-18L-26 65ZM-11 14H11L0-28Z',
 T:'M-50-65H50V-40H13V65H-13V-40H-50Z'
};
function mirr(pts){ var a=pts.map(function(p){return p[0]+' '+p[1];}), b=pts.slice().reverse().map(function(p){return (-p[0])+' '+p[1];}); return 'M'+a.concat(b).join('L')+'Z'; }
/* portaaviones (tipo LHD Juan Carlos I, perfil, proa a la derecha), caja local 0..400 x 0..100, flotación y=80 */
var CAR={
 hull:'M6 42H328C350 42 370 38 391 27L397 29L395 36C389 52 379 67 371 80H15L11 63L4 61V46Z',
 isl:'M170 42V27H178V19H186V12H192V7H232L237 13H247V24H255L259 42Z',
 mast:'M213 7L216-16H219L222 7ZM203-7H232V-5H203ZM208-21H227V-17H208ZM196 1A4 4 0 1 0 204 1A4 4 0 1 0 196 1ZM179 19V9H187V19Z',
 det:'M8 45H328C346 45 364 42 382 34L383 36C365 44 347 48 328 48H8ZM40 53h14v5H40ZM70 53h14v5H70ZM100 53h9v5h-9ZM230 54h22v6h-22ZM272 54h12v5h-12ZM300 54h8v4h-8ZM12 66H368L366 69H13Z',
 win:'M193 9H231V12H193ZM248 16H254V19H248Z',
 ac:[[46,0],[86,0],[128,1],[292,0]]
};
var HAR='M0 0l2-3 9-1 3-3h4l2 2 6 1 4-6h2l-1 7-2 2H0Z';
var HEL='M0 0l1-4h10l3-3h4l3 3h6l1 2-6 1v1H0ZM-6-9h40v1H-6Z';
/* caza Eurofighter (planta), morro hacia arriba, caja local x ±116, y -160..160 */
var JET={
 body:mirr([[0,-160],[5,-146],[9,-128],[12,-108],[13,-97],[15,-80],[18,-60],[20,-30],[21,-18],[108,95],[113,99],[113,119],[108,124],[25,126],[22,140],[20,152],[19,160],[5,160],[3,152],[0,149]]),
 can:'M12-98L46-76V-70L13-71ZM-12-98L-46-76V-70L-13-71Z',
 pods:'M107 90h8v44h-8ZM-115 90h8v44h-8Z',
 cnp:'M0-134C5-134 7-120 7-108C7-96 5-90 0-88C-5-90-7-96-7-108C-7-120-5-134 0-134Z',
 fin:'M-1.6 62L0 54L1.6 62L2.2 150H-2.2Z',
 det:'M30 112L104 109M-30 112L-104 109M26-6L104 92M-26-6L-104 92M8-60L10 90M-8-60L-10 90M3 152V160M-3 152V160'
};
/* carro de combate Leopard 2E (perfil, cañón a la derecha), caja local 0..380 x 0..100, suelo y=100 */
var TNK={
 trk:'M26 100H224Q246 99 247 80Q246 67 232 66H20Q4 68 4 80Q6 96 26 100Z',
 hull:'M8 50H200L250 60L247 65L238 81L230 66H9L4 58Z',
 skt:'M18 52H230L241 58L237 85H178V79H20Z',
 tur:'M44 33L64 27H168L227 43L223 46L180 49L173 53H60L50 49L42 40Z',
 gun:'M196 41.6L370 42.4V45.6L196 46.4ZM248 39.4H266Q268 44 266 48.6H248Q246 44 248 39.4ZM367 41H375V47H367ZM362 38.5h6v3h-6Z',
 roof:'M96 30L98 18H94V12H116V18H110L112 30ZM150 30V22H168L172 30ZM122 27H140V30H122ZM74 34h16v2.4H74ZM74 37.6h16V40H74ZM76 41.2h14v2.4H76Z',
 bsk:'M28 33L46 31V49H30Z',
 det:'M60 52V79M100 52V79M140 52V79M178 52V79M208 52V84M168 27L227 43M120 27V53M10 55H40M10 58H40'
};
var WH=[]; for(var i=0;i<7;i++) WH.push(38+i*29);

var NS='http://www.w3.org/2000/svg';
function E2(tag,at,par){ var e=document.createElementNS(NS,tag); for(var k in at) e.setAttribute(k,at[k]); if(par) par.appendChild(e); return e; }

var POR=(window.innerWidth||400)/(window.innerHeight||700)<0.95;
var VB=POR?[400,800]:[1200,560];
var LAY=POR?{
 mark:[200,62,24], let:[[88,400],[200,400],[312,400]], ls:.95,
 sl:[{x:200,y:180,s:.9,r:0},{x:200,y:405,s:.58,r:38},{x:200,y:652,s:.95,r:0}],
 cap:[262,542,738], f1:21, f2:12.5
}:{
 mark:[600,64,30], let:[[300,270],[600,270],[900,270]], ls:1.7,
 sl:[{x:300,y:285,s:.78,r:0},{x:600,y:262,s:.62,r:38},{x:900,y:282,s:.8,r:0}],
 cap:[430,430,430], f1:24, f2:15
};
/* centros locales de cada silueta */
var OFF=[[-200,-58],[0,0],[-190,-62]];

var CAPS=EN?[['MAR · SEA','Aircraft carrier · Juan Carlos I'],['AIRE · AIR','Fighter · Eurofighter Typhoon'],['TIERRA · LAND','Main battle tank · Leopard 2E']]
           :[['MAR','Portaaviones · Juan Carlos I'],['AIRE','Caza · Eurofighter Typhoon'],['TIERRA','Carro de combate · Leopard 2E']];

var ov,svg,G={},T0=0,raf=0,done=false,tEnd=RM?0:5500,tAuto=RM?3200:10000,seekT=null,pts=[];

function build(){
 if(done) return;
 ov=document.createElement('div'); ov.id='mi'; ov.setAttribute('data-noi18n',''); ov.setAttribute('role','dialog'); ov.setAttribute('aria-label',EN?'M.A.T intro':'M.A.T, entrada');
 svg=E2('svg',{viewBox:'0 0 '+VB[0]+' '+VB[1],preserveAspectRatio:'xMidYMid meet','aria-hidden':'true'},ov);
 var d=E2('defs',{},svg);
 var g1=E2('linearGradient',{id:'miM',x1:0,y1:0,x2:0,y2:1},d);
 [['0','#f2f3ee'],['.38','#b7bca9'],['.62','#6e7562'],['1','#2b2f28']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1]},g1);});
 [['miMn',['#eef2f5','#aab5bd','#5f6b73','#262d32']],['miMa',['#f4f5f7','#bcc1c7','#6f767e','#2c3136']],['miMt',['#e4e7d2','#a5ac88','#5e6547','#272b1f']]].forEach(function(q){ var g=E2('linearGradient',{id:q[0],x1:0,y1:0,x2:0,y2:1},d); ['0','.38','.62','1'].forEach(function(o,k){E2('stop',{offset:o,'stop-color':q[1][k]},g);}); });
 var g2=E2('linearGradient',{id:'miL',x1:0,y1:0,x2:0,y2:1},d);
 [['0','#ffffff'],['.45','#c9cdc3'],['.55','#8b9184'],['1','#4a4f47']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1]},g2);});
 var g3=E2('linearGradient',{id:'miS',x1:0,y1:0,x2:1,y2:0},d);
 [['0','#fff','0'],['.5','#fff','.55'],['1','#fff','0']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g3);});
 var g4=E2('linearGradient',{id:'miSea',x1:0,y1:0,x2:1,y2:0},d);
 [['0','#7f95a3','0'],['.5','#9fb6c4','.7'],['1','#7f95a3','0']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g4);});
 var g5=E2('linearGradient',{id:'miAB',x1:0,y1:0,x2:0,y2:1},d);
 [['0','#fff6d8','.95'],['.12','#ffb347','.75'],['1','#ff6a1f','0']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g5);});
 var g6=E2('radialGradient',{id:'miP'},d);
 [['0','#fbffe8','1'],['.4','#dfe8b8','.8'],['1','#b3bd8c','0']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g6);});
 var g7=E2('radialGradient',{id:'miDu'},d);
 [['0','#c8b48e','.55'],['1','#c8b48e','0']].forEach(function(s){E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]},g7);});
 var fl=E2('filter',{id:'miG',x:'-20%',y:'-20%',width:'140%',height:'140%'},d);
 E2('feGaussianBlur',{stdDeviation:'2.2',result:'b'},fl); var fm=E2('feMerge',{},fl); E2('feMergeNode',{in:'b'},fm); E2('feMergeNode',{in:'SourceGraphic'},fm);

 /* marca superior */
 G.mark=E2('text',{x:LAY.mark[0]+LAY.mark[2]*.17,y:LAY.mark[1],'text-anchor':'middle',fill:'#e9e9e6','font-size':LAY.mark[2],'font-weight':700,'letter-spacing':'.34em',opacity:0,style:'font-family:inherit'},svg); G.mark.textContent='M.A.T';

 G.sil=[];G.let=[];G.cap=[];
 for(var i=0;i<3;i++){
  var sl=LAY.sl[i], o=OFF[i];
  var outer=E2('g',{transform:'translate('+sl.x+' '+sl.y+') rotate('+sl.r+') scale('+sl.s+')'},svg);
  var inner=E2('g',{transform:'translate('+o[0]+' '+o[1]+')'},outer);
  var S={g:outer,in:inner,fx:E2('g',{},inner),body:E2('g',{opacity:0},inner),det:null,line:E2('g',{fill:'none',stroke:'#dfe6c4','stroke-width':1.4/sl.s,'stroke-linejoin':'round',filter:'url(#miG)'},inner),sw:null,main:[]};
  if(i===0) drawCarrier(S); else if(i===1) drawJet(S); else drawTank(S);
  /* barrido de luz recortado a la silueta */
  var cp=E2('clipPath',{id:'miC'+i},d);
  S.main.forEach(function(p,k){ p.id='miC'+i+'p'+k; E2('use',{href:'#'+p.id},cp); });
  var sg=E2('g',{'clip-path':'url(#miC'+i+')'},inner);
  S.sw=E2('rect',{x:-80,y:-200,width:70,height:500,fill:'url(#miS)',opacity:0,transform:'skewX(-20)'},sg);
  G.sil.push(S);
  /* letra */
  var lg=E2('g',{},svg);
  var lf=E2('path',{d:LET['MAT'[i]],fill:'url(#miL)','fill-rule':'evenodd',opacity:0},lg);
  var ll=E2('path',{d:LET['MAT'[i]],fill:'none',stroke:'#eef3da','stroke-width':1.6,'stroke-linejoin':'round',filter:'url(#miG)'},lg);
  G.let.push({g:lg,f:lf,l:ll});
  /* rótulo */
  var cx=POR?200:sl.x, cy=LAY.cap[i];
  var ct=E2('g',{opacity:0},svg);
  var t1=E2('text',{x:cx+LAY.f1*(POR?.14:.11),y:cy,'text-anchor':'middle','font-size':LAY.f1,'font-weight':700,'letter-spacing':POR?'.28em':'.22em',fill:'#e9e9e6',style:'font-family:inherit'},ct);
  var w=CAPS[i][0]; var a=E2('tspan',{fill:'#d6b25e'},t1); a.textContent=w.charAt(0); var b=E2('tspan',{},t1); b.textContent=w.slice(1);
  var t2=E2('text',{x:cx,y:cy+LAY.f2*1.6,'text-anchor':'middle','font-size':LAY.f2,'letter-spacing':'.12em',fill:'#9aa0a6',style:'font-family:inherit'},ct); t2.textContent=CAPS[i][1];
  G.cap.push(ct);
 }
 /* partículas */
 G.pt=E2('g',{opacity:0},svg);
 var sk=document.createElement('button'); sk.className='misk'; sk.type='button'; sk.textContent=EN?'Skip ›':'Saltar ›'; ov.appendChild(sk);
 var bb=document.createElement('div'); bb.className='mib'; ov.appendChild(bb);
 var go=document.createElement('button'); go.className='migo'; go.type='button'; go.textContent=EN?'Enter':'Entrar'; bb.appendChild(go);
 G.go=go;
 sk.addEventListener('click',exit); go.addEventListener('click',exit);
 document.addEventListener('keydown',onKey);
 document.body.appendChild(ov);
 /* longitudes y puntos (letra -> silueta) */
 G.let.forEach(function(o){ o.len=o.l.getTotalLength(); o.l.setAttribute('stroke-dasharray',o.len); });
 G.sil.forEach(function(S){ S.lines=[].slice.call(S.line.childNodes).map(function(p){ var n=p.getTotalLength(); p.setAttribute('stroke-dasharray',n); return {p:p,n:n}; }); });
 var N=POR?34:44;
 for(i=0;i<3;i++){
  var lo=G.let[i], so=G.sil[i].lines[0], arr=[];
  for(var k=0;k<N;k++){
   var a1=lo.l.getPointAtLength(lo.len*k/N), b1=so.p.getPointAtLength(so.n*((k*0.618+0.1)%1));
   var c=E2('circle',{r:POR?2.1:2.6,fill:'url(#miP)'},G.pt);
   arr.push({a:[a1.x,a1.y],b:place(i,b1.x,b1.y),c:c,dl:Math.random()*0.18,arc:(Math.random()-.5)*(POR?90:140)});
  }
  pts.push(arr);
 }
 try{go.focus({preventScroll:true});}catch(e){}
 window.MAT_INTRO={seek:function(t){seekT=t;frame(performance.now());},exit:exit};
 T0=performance.now(); raf=requestAnimationFrame(frame);
}
function place(i,x,y){ var sl=LAY.sl[i],o=OFF[i]; x=(x+o[0])*sl.s; y=(y+o[1])*sl.s; var r=sl.r*Math.PI/180,c=Math.cos(r),s=Math.sin(r); return [sl.x+x*c-y*s, sl.y+x*s+y*c]; }
function P(par,d,at){ at=at||{}; at.d=d; return E2('path',at,par); }
function outline(S,d){ P(S.line,d); }
function drawCarrier(S){
 var fx=S.fx;
 S.sea=E2('rect',{x:-160,y:79.5,width:720,height:1.6,fill:'url(#miSea)',opacity:0},fx);
 S.wake=E2('g',{opacity:0,stroke:'#dbe7ee','stroke-linecap':'round',fill:'none'},fx);
 [[83,2],[86,1.4],[89,1],[84.5,1.2]].forEach(function(w,k){ E2('path',{d:'M14 '+w[0]+'H'+(-120+k*30),'stroke-width':w[1],'stroke-dasharray':'18 10','stroke-opacity':.8-k*.15},S.wake); });
 E2('path',{d:'M372 80q8 3 20 3','stroke-width':1.6},S.wake);
 var b=S.body;
 S.main.push(P(b,CAR.hull,{fill:'url(#miMn)'}));
 S.main.push(P(b,CAR.isl,{fill:'url(#miMn)'}));
 P(b,CAR.mast,{fill:'#c9cfbf'});
 P(b,CAR.det,{fill:'#1f231e','fill-opacity':.55});
 P(b,CAR.win,{fill:'#0d1012'});
 CAR.ac.forEach(function(a,k){ P(b,k===2?HEL:HAR,{fill:'#d9ddd0',transform:'translate('+a[0]+' 42)'}); });
 var tx=E2('text',{x:344,y:63,'font-size':8,'font-weight':700,fill:'#e9ece2','fill-opacity':.75,'letter-spacing':'.05em',style:'font-family:inherit'},b); tx.textContent='L-61';
 outline(S,CAR.hull); outline(S,CAR.isl);
}
function drawJet(S){
 var fx=S.fx;
 S.ab=E2('g',{opacity:0},fx);
 E2('rect',{x:-19,y:156,width:14,height:POR?62:92,fill:'url(#miAB)',rx:7},S.ab);
 E2('rect',{x:5,y:156,width:14,height:POR?62:92,fill:'url(#miAB)',rx:7},S.ab);
 S.abc=[E2('ellipse',{cx:-11.5,cy:164,rx:7.5,ry:11,fill:'#fff3cf'},S.ab),E2('ellipse',{cx:11.5,cy:164,rx:7.5,ry:11,fill:'#fff3cf'},S.ab)];
 S.trail=E2('rect',{x:-3,y:170,width:6,height:POR?80:170,fill:'url(#miAB)',opacity:.2},fx);
 var b=S.body;
 S.main.push(P(b,JET.body,{fill:'url(#miMa)'}));
 S.main.push(P(b,JET.can,{fill:'url(#miMa)'}));
 P(b,JET.pods,{fill:'#4b5146'});
 P(b,JET.fin,{fill:'#e3e7da'});
 P(b,JET.det,{fill:'none',stroke:'#20241f','stroke-opacity':.6,'stroke-width':1.3});
 P(b,JET.cnp,{fill:'#16222b',stroke:'#9fb3bf','stroke-width':1});
 E2('path',{d:'M-2-128C0-130 3-126 3-116',stroke:'#e8f4ff','stroke-opacity':.7,'stroke-width':1.2,fill:'none'},b);
 outline(S,JET.body); outline(S,JET.can);
}
function drawTank(S){
 var fx=S.fx;
 S.dust=[];
 for(var k=0;k<7;k++) S.dust.push(E2('circle',{cx:0,cy:96,r:10,fill:'url(#miDu)',opacity:0},fx));
 S.gnd=E2('rect',{x:-140,y:100,width:660,height:1.4,fill:'url(#miSea)',opacity:0},fx);
 var b=S.body;
 S.main.push(P(b,TNK.trk,{fill:'#2c302a'}));
 var wg=E2('g',{},b);
 WH.forEach(function(x){ E2('circle',{cx:x,cy:88,r:11,fill:'#545b4c',stroke:'#1c1f1a','stroke-width':1.4},wg); E2('circle',{cx:x,cy:88,r:3.4,fill:'#2a2e27'},wg); });
 E2('circle',{cx:14,cy:80,r:11,fill:'#4a5043',stroke:'#1c1f1a','stroke-width':1.6,'stroke-dasharray':'3 2.2'},wg);
 E2('circle',{cx:236,cy:79,r:9.5,fill:'#4a5043',stroke:'#1c1f1a','stroke-width':1.4},wg);
 S.main.push(P(b,TNK.hull,{fill:'url(#miMt)'}));
 S.main.push(P(b,TNK.skt,{fill:'url(#miMt)'}));
 S.main.push(P(b,TNK.tur,{fill:'url(#miMt)'}));
 S.main.push(P(b,TNK.gun,{fill:'url(#miMt)'}));
 P(b,TNK.roof,{fill:'#c3c9b6',transform:'translate(0 -3)'});
 P(b,TNK.bsk,{fill:'none',stroke:'#c3c9b6','stroke-width':1.4});
 P(b,'M33 36V47M38 35V48M42 34V48M29 40H46',{stroke:'#c3c9b6','stroke-width':.8,fill:'none'});
 P(b,TNK.det,{fill:'none',stroke:'#1f231e','stroke-opacity':.6,'stroke-width':1});
 P(b,'M54 33L50-16M64 31L62-6',{stroke:'#cfd5c4','stroke-width':1,fill:'none'});
 var fg=E2('g',{transform:'translate(62 -6)'},b); S.flag=fg;
 E2('rect',{x:0,y:0,width:15,height:2.5,fill:'#c8102e'},fg); E2('rect',{x:0,y:2.5,width:15,height:5,fill:'#f1bf00'},fg); E2('rect',{x:0,y:7.5,width:15,height:2.5,fill:'#c8102e'},fg);
 E2('rect',{x:240,y:57,width:5,height:4,fill:'#ffd98a',opacity:.9},b);
 outline(S,TNK.tur+'M196 41.6L370 42.4V45.6L196 46.4Z'+TNK.skt+TNK.trk); outline(S,TNK.hull);
}

function cl(x){return x<0?0:x>1?1:x;}
function seg(t,a,b){return cl((t-a)/(b-a));}
function eio(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}
function eo(x){return 1-Math.pow(1-x,3);}

function frame(now){
 if(done) return;
 var el=now-T0, t=seekT!=null?seekT:(RM?99999:el*0.66), lt=el/1000; /* 0.66: transformación lenta (termina ~5,5 s); el final queda animado hasta ~10 s */
 G.mark.setAttribute('opacity',(seg(t,2600,3300)*0.9).toFixed(3));
 for(var i=0;i<3;i++){
  var L=G.let[i], S=G.sil[i], p0=LAY.let[i], sl=LAY.sl[i];
  var a=i*130, d1=eo(seg(t,a,a+700)), f1=seg(t,a+350,a+950);
  var ms=1250+i*230, m=seg(t,ms,ms+1250);
  /* letra: se dibuja, se rellena; luego se desplaza hacia su silueta y se disuelve */
  var mv=eio(seg(t,ms,ms+900)), lx=p0[0]+(sl.x-p0[0])*mv, ly=p0[1]+(sl.y-p0[1])*mv, ls=LAY.ls*(1+0.12*Math.sin(Math.PI*mv));
  L.g.setAttribute('transform','translate('+lx.toFixed(2)+' '+ly.toFixed(2)+') scale('+ls.toFixed(3)+')');
  var fade=1-seg(t,ms+50,ms+600);
  L.f.setAttribute('opacity',(f1*fade).toFixed(3));
  var und=seg(t,ms+150,ms+750);
  L.l.setAttribute('stroke-dashoffset',(L.len*(1-d1+und)).toFixed(1));
  L.l.setAttribute('opacity',(1-seg(t,ms+600,ms+800)).toFixed(3));
  L.l.setAttribute('stroke-width',(1.6/ls).toFixed(2));
  /* silueta: contorno brillante, relleno metálico, detalles */
  var od=eo(seg(t,ms+350,ms+1150)), bf=seg(t,ms+800,ms+1350);
  S.lines.forEach(function(o){ o.p.setAttribute('stroke-dashoffset',(o.n*(1-od)).toFixed(1)); });
  S.line.setAttribute('opacity',(od>0?1-0.75*seg(t,ms+1300,ms+1900):0).toFixed(3));
  S.body.setAttribute('opacity',bf.toFixed(3));
  var sw=seg(t,ms+1150,ms+1900);
  S.sw.setAttribute('opacity',sw>0&&sw<1?'1':'0');
  S.sw.setAttribute('x',(-120+520*sw).toFixed(1));
  G.cap[i].setAttribute('opacity',seg(t,ms+1100,ms+1600).toFixed(3));
  /* partículas */
  var pp=pts[i];
  for(var k=0;k<pp.length;k++){
   var q=pp[k], u=eio(seg(t,ms+120+q.dl*900,ms+900+q.dl*900)), vis=u>0&&u<1;
   q.c.setAttribute('opacity',vis?(0.4+0.6*Math.sin(Math.PI*u)).toFixed(2):'0');
   if(vis){ var x=q.a[0]*(1)+0, y=q.a[1];
    /* punto de partida: contorno de la letra en su posición actual */
    var sx=lx+q.a[0]*ls, sy=ly+q.a[1]*ls, ex=q.b[0], ey=q.b[1], mx=(sx+ex)/2+q.arc*0.3, my=(sy+ey)/2-Math.abs(q.arc)*0.5;
    var w=1-u; q.c.setAttribute('cx',(w*w*sx+2*w*u*mx+u*u*ex).toFixed(1)); q.c.setAttribute('cy',(w*w*sy+2*w*u*my+u*u*ey).toFixed(1)); }
  }
  /* efectos vivos */
  var fxo=seg(t,ms+900,ms+1500);
  if(i===0){ S.sea.setAttribute('opacity',fxo.toFixed(3)); S.wake.setAttribute('opacity',(fxo*.85).toFixed(3));
   [].forEach.call(S.wake.childNodes,function(w,k){ w.setAttribute('stroke-dashoffset',(RM?0:(lt*(26+k*6))%28).toFixed(1)); });
   S.in.setAttribute('transform','translate('+OFF[0][0]+' '+(OFF[0][1]+(RM?0:Math.sin(lt*2.1)*0.9*fxo)).toFixed(2)+')'); }
  if(i===1){ var fl=RM?1:0.82+0.18*Math.sin(lt*47)*Math.sin(lt*13);
   S.ab.setAttribute('opacity',(fxo*fl).toFixed(3)); S.trail.setAttribute('opacity',(fxo*.2).toFixed(3));
   S.abc.forEach(function(e){e.setAttribute('ry',(9+3*fl).toFixed(2));});
   var dr=RM?0:Math.sin(lt*1.3)*3*fxo; S.in.setAttribute('transform','translate(0 '+(-dr).toFixed(2)+')'); }
  if(i===2){ S.gnd.setAttribute('opacity',fxo.toFixed(3));
   S.dust.forEach(function(c,k){ var ph=RM?0.35+k*0.08:((lt*0.55+k/7)%1), on=fxo*(RM?0.8:Math.sin(Math.PI*ph));
    c.setAttribute('cx',(POR?20-ph*16-k*1.2:14-ph*62-k*3).toFixed(1)); c.setAttribute('cy',(95-ph*(POR?22:16)-(k%3)*3).toFixed(1)); c.setAttribute('r',(POR?7+ph*9:8+ph*18).toFixed(1)); c.setAttribute('opacity',(on*0.9).toFixed(3)); });
   S.flag.setAttribute('transform','translate(62 -6) skewY('+(RM?0:Math.sin(lt*5)*6).toFixed(2)+')');
   S.in.setAttribute('transform','translate('+OFF[2][0]+' '+(OFF[2][1]+(RM?0:Math.abs(Math.sin(lt*7))*0.5*fxo)).toFixed(2)+')'); }
 }
 G.pt.setAttribute('opacity',RM?'0':'1');
 if((seekT!=null?t>=2700:el>=3400)||RM) G.go.classList.add('on');
 if(seekT==null&&el>=tAuto){ exit(); return; }
 if(seekT==null) raf=requestAnimationFrame(frame);
}
function onKey(e){ if(e.key==='Escape') exit(); }
function exit(){
 if(done) return; done=true; cancelAnimationFrame(raf); document.removeEventListener('keydown',onKey);
 if(!ov){ DE.classList.remove('mi-on'); return; }
 if(RM) ov.classList.add('rm'); ov.classList.add('out'); DE.classList.remove('mi-on');
 var a=document.getElementById('app'); if(a) try{a.focus({preventScroll:true});}catch(e){}
 setTimeout(function(){ if(ov&&ov.parentNode) ov.parentNode.removeChild(ov); },650);
}
if(document.body) build(); else document.addEventListener('DOMContentLoaded',build);
})();
