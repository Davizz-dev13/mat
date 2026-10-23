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
/* portaaviones LHD Juan Carlos I (L-61), perfil con cubierta en ligera perspectiva, proa a la derecha; caja local 0..400 x 0..100, flotación y=80 */
var CAR={
 hull:'M6 42H328C350 42 370 38 391 27L397 29L395 36C389 52 379 67 371 80H15L11 63L4 61V46Z',
 deck:'M6 42H328C350 42 370 38 391 27L396 19C375 30 355 34 334 34H12Z',
 isl:'M186 35V25H192V17H199V10H205V5H247L251 11H257V19H263V27L268 35Z',
 ac:[['h',16],['h',52],['e',96,1],['e',140,0],['e',214,0],['h',276]]
};
/* caza Eurofighter (planta), morro hacia arriba, caja local x ±116, y -160..160 */
var JP=[[0,-160],[5,-146],[9,-128],[12,-108],[13,-97],[15,-80],[18,-60],[20,-30],[21,-18]], JT=[[22,140],[20,152],[19,160],[5,160],[3,152],[0,149]];
var JET={
 body:mirr(JP.concat([[108,95],[113,99],[113,119],[108,124],[25,126]],JT)),
 fus:mirr(JP.concat([[21,126]],JT)),
 can:'M12-98L46-76V-70L13-71ZM-12-98L-46-76V-70L-13-71Z',
 pods:'M107 90h8v44h-8ZM-115 90h8v44h-8Z',
 cnp:'M0-134C5-134 7-120 7-108C7-96 5-90 0-88C-5-90-7-96-7-108C-7-120-5-134 0-134Z',
 fin:'M0 60L1.4 150L13.4 157L12 114Z',
 pan:'M25.3-2.3L95.3 88.7M-25.3-2.3L-95.3 88.7M26 113L106 110M-26 113L-106 110M64 111.6V125M-64 111.6V125M17-73L41-73.5M-17-73L-41-73.5M-13-97H13M-19-40H19M-20 10H20M-21 60H21M-21 100H21M-18 132H18M0-84V58M-7-80H7V-58H-7ZM21-18L21 126M-21-18L-21 126M30 124V113M-30 124V113M100 123V110M-100 123V110',
 noz:'M4 148H20V161H4ZM-4 148H-20V161H-4Z'
};
/* carro de combate Leopard 2E (perfil, cañón a la derecha), caja local 0..380 x 0..100, suelo y=100 */
var TNK={
 trk:'M26 100H224Q246 99 247 80Q246 67 232 66H20Q4 68 4 80Q6 96 26 100Z',
 hull:'M8 50H200L250 60L247 65L238 81L230 66H9L4 58Z',
 skt:'M18 52H230L241 58L237 85H178V79H20Z',
 tur:'M44 33L64 27H168L227 43L223 46L180 49L173 53H60L50 49L42 40Z',
 gun:'M196 41.6L370 42.4V45.6L196 46.4ZM248 39.4H266Q268 44 266 48.6H248Q246 44 248 39.4ZM367 41H375V47H367Z',
 wedge:'M168 27L227 43L223 46L180 49Z',
 bsk:'M28 33L46 31V49H30Z'
};
var WH=[]; for(var i=0;i<7;i++) WH.push(38+i*29);
var NS='http://www.w3.org/2000/svg';
function E2(tag,at,par){ var e=document.createElementNS(NS,tag); for(var k in at) e.setAttribute(k,at[k]); if(par) par.appendChild(e); return e; }

var POR=(window.innerWidth||400)/(window.innerHeight||700)<0.95;
var VB=POR?[400,800]:[1200,560];
var LAY=POR?{
 mark:[200,62,24], let:[[88,400],[200,400],[312,400]], ls:.95,
 sl:[{x:200,y:182,s:.94,r:0},{x:200,y:405,s:.58,r:38},{x:200,y:652,s:.95,r:0}],
 cap:[262,542,738], f1:21, f2:12.5
}:{
 mark:[600,64,30], let:[[300,270],[600,270],[900,270]], ls:1.7,
 sl:[{x:300,y:285,s:.9,r:0},{x:600,y:262,s:.68,r:38},{x:900,y:282,s:.92,r:0}],
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
 G.d=d;
 defsX(d);
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
function LG(id,st,x2,y2,ex){ var at={id:id,x1:0,y1:0,x2:x2==null?0:x2,y2:y2==null?1:y2}; if(ex) for(var k in ex) at[k]=ex[k]; var g=E2('linearGradient',at,G.d); st.forEach(function(s){ E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]==null?1:s[2]},g); }); return 'url(#'+id+')'; }
function RG(id,st,ex){ var at={id:id}; if(ex) for(var k in ex) at[k]=ex[k]; var g=E2('radialGradient',at,G.d); st.forEach(function(s){ E2('stop',{offset:s[0],'stop-color':s[1],'stop-opacity':s[2]==null?1:s[2]},g); }); return 'url(#'+id+')'; }
/* metal: brillo arriba, base, panza oscura */
function MT(id,c){ return LG(id,[[0,c[0]],[.07,c[1]],[.2,c[2]],[.55,c[3]],[.86,c[4]],[1,c[5]]]); }
/* línea de panel grabada: sombra + filo de luz */
function ENG(par,d,w,op){ w=w||.6; P(par,d,{fill:'none',stroke:'#0b0d0b','stroke-width':w,'stroke-opacity':op||.55}); P(par,d,{fill:'none',stroke:'#fff','stroke-width':w*.7,'stroke-opacity':.17,transform:'translate(.3 .6)'}); }
function RIM(par,d,w){ P(par,d,{fill:'none',stroke:'url(#miRim)','stroke-width':w||.8,'stroke-linejoin':'round'}); }
function CG(par,i){ return E2('g',{'clip-path':'url(#miC'+i+')'},par); }
function TX(par,x,y,s,txt,at){ at=at||{}; at.x=x; at.y=y; at['font-size']=s; if(!at.style) at.style='font-family:Arial,"Helvetica Neue",sans-serif'; var e=E2('text',at,par); e.textContent=txt; return e; }
function FLAG(par,x,y,w,h,arms){ var g=E2('g',{transform:'translate('+x+' '+y+')'},par); E2('rect',{x:0,y:0,width:w,height:h,fill:'#c8102e'},g); E2('rect',{x:0,y:h/4,width:w,height:h/2,fill:'#f1bf00'},g); if(arms) E2('rect',{x:w*.22,y:h*.33,width:w*.14,height:h*.34,fill:'#a5432b',opacity:.85},g); E2('rect',{x:0,y:0,width:w,height:h,fill:'url(#miFs)'},g); return g; }
function CREW(par,x,y,c){ E2('rect',{x:x-.55,y:y-3,width:1.1,height:2.1,fill:c,rx:.3},par); E2('circle',{cx:x,cy:y-3.6,r:.55,fill:c==='#f4f4f0'?'#f4f4f0':'#cdb79a'},par); E2('rect',{x:x-.45,y:y-1,width:.9,height:1,fill:'#1d2124'},par); }
function HARR(par,x,y){ var g=E2('g',{transform:'translate('+x+' '+y+') scale(.75)'},par);
 E2('ellipse',{cx:18,cy:.2,rx:16,ry:1.2,fill:'#000',opacity:.35},g);
 P(g,'M1-5L3.5-14.5H7L10-8.2H21.5L25-11.2H28.6L32.6-7.6L35.6-6.2L33.4-4.4L24-3.4H4Z',{fill:'url(#miHr)'});
 P(g,'M12-7.6H23.5L21.6-5.9H13.4Z',{fill:'#353a3f'});
 P(g,'M20.3-8.2H24V-5H20.3Z',{fill:'#1c2023'});
 P(g,'M15-4.6h3.6v2.2H15ZM19.5-4.4h3v2h-3Z',{fill:'#25292d'});
 P(g,'M23-8.3C24-11 27-11.6 29-10.9L31.6-7.9Z',{fill:'url(#miGl)'});
 P(g,'M25.5-10.4C26.6-11 27.8-11 28.6-10.7',{fill:'none',stroke:'#fff','stroke-width':.4,'stroke-opacity':.8});
 P(g,'M8-3.4V-1.2M26-3.4V-1.2M4-8H10M24-6.5H33',{stroke:'#15181a','stroke-width':.45,fill:'none'});
 E2('circle',{cx:8,cy:-1.1,r:1.1,fill:'#111'},g); E2('circle',{cx:26,cy:-1.1,r:1.1,fill:'#111'},g);
 E2('circle',{cx:11,cy:-6,r:1,fill:'#c8102e'},g); E2('circle',{cx:11,cy:-6,r:.6,fill:'#f1bf00'},g); E2('circle',{cx:11,cy:-6,r:.25,fill:'#c8102e'},g);
 P(g,'M2-5.2L3.6-13.8',{stroke:'#fff','stroke-opacity':.35,'stroke-width':.4,fill:'none'});
 return g; }
function HELO(par,x,y,spin){ var g=E2('g',{transform:'translate('+x+' '+y+') scale(.75)'},par);
 E2('ellipse',{cx:18,cy:.2,rx:15,ry:1.2,fill:'#000',opacity:.35},g);
 P(g,'M.4-9.6L-1.4-16.4H1.6L4-10.2Z',{fill:'url(#miHe)'});
 E2('circle',{cx:.1,cy:-14.2,r:3.3,fill:'#dfe6ea',opacity:.16},g);
 P(g,'M.1-17.5V-10.9',{stroke:'#22272b','stroke-width':.5});
 P(g,'M0-9.4L3-10.2L12.4-9.8L14-13.2H22.4L25.4-11.2L29.2-10.4L32.4-7.4V-4.2L29.6-2.6H13.6L10.6-6.4L3-7.6Z',{fill:'url(#miHe)'});
 P(g,'M14-13.2H22.4L25.4-11.2H14Z',{fill:'#fff',opacity:.18});
 P(g,'M27.2-10.2L29.4-10L32.2-7.2H27.2Z',{fill:'url(#miGl)'});
 P(g,'M19-9.2h3.4v2.6H19ZM14.6-9h3v2h-3Z',{fill:'#14191c'});
 P(g,'M23.6-10.6V-3M13.6-5.2H32M5-8.6H12',{stroke:'#15181a','stroke-width':.4,fill:'none','stroke-opacity':.7});
 P(g,'M16-2.6V-1.4M28.4-2.6V-1.4',{stroke:'#111','stroke-width':.6});
 E2('circle',{cx:16,cy:-1.3,r:1.3,fill:'#111'},g); E2('circle',{cx:28.4,cy:-1.3,r:1.3,fill:'#111'},g);
 P(g,'M17.6-13.2h1.2v-2.6h-1.2Z',{fill:'#2a2f33'});
 var r=null;
 if(spin){ E2('ellipse',{cx:18.2,cy:-15.9,rx:19.5,ry:1.5,fill:'#e8f0f4',opacity:.13},g);
  r=[P(g,'M-19.5 0H19.5',{stroke:'#1d2226','stroke-width':.8,transform:'translate(18.2 -15.9)'}),P(g,'M-19.5 0H19.5',{stroke:'#1d2226','stroke-width':.8,transform:'translate(18.2 -15.9)'})]; }
 else P(g,'M.5-15.1Q18-16.4 36-15.1',{stroke:'#1d2226','stroke-width':.8,fill:'none'});
 E2('circle',{cx:18.2,cy:-15.9,r:1.1,fill:'#2a2f33'},g);
 return r; }
function drawCarrier(S){
 var fx=S.fx;
 S.sea=E2('rect',{x:-160,y:79.5,width:720,height:1.6,fill:'url(#miSea)',opacity:0},fx);
 S.wake=E2('g',{opacity:0,stroke:'#dbe7ee','stroke-linecap':'round',fill:'none'},fx);
 [[83,2],[86,1.4],[89,1],[84.5,1.2]].forEach(function(w,k){ E2('path',{d:'M14 '+w[0]+'H'+(-120+k*30),'stroke-width':w[1],'stroke-dasharray':'18 10','stroke-opacity':.8-k*.15},S.wake); });
 E2('path',{d:'M372 80q8 3 20 3','stroke-width':1.6},S.wake);
 var b=S.body;
 /* reflejo en el agua */
 P(b,CAR.hull,{fill:'url(#miRef)',transform:'matrix(1 0 0 -.38 0 110.4)'});
 E2('ellipse',{cx:190,cy:81,rx:200,ry:4,fill:'url(#miAO)'},b);
 var hullF=MT('miHu',['#c4cacd','#e2e6e8','#9fa7ac','#7d868b','#575f65','#363d42']);
 S.main.push(P(b,CAR.hull,{fill:hullF}));
 var cg=CG(b,0);
 E2('rect',{x:0,y:42,width:400,height:7,fill:'url(#miUD)'},cg); /* sombra bajo el vuelo de cubierta */
 E2('rect',{x:0,y:74.5,width:400,height:6,fill:'#15191c'},cg); /* línea de flotación */
 E2('rect',{x:0,y:73.6,width:400,height:.9,fill:'#c9d0d3',opacity:.35},cg);
 E2('ellipse',{cx:250,cy:52,rx:120,ry:9,fill:'url(#miSp)',opacity:.55},cg);
 /* aperturas, portillos, compuertas */
 P(b,'M38 50h15v6H38ZM68 50h15v6H68ZM98 50h10v6H98ZM228 51h22v6H228ZM270 51h12v5H270ZM298 51h8v4h-8Z',{fill:'#14181b'});
 P(b,'M38 56h15M68 56h15M98 56h10M228 57h22M270 56h12',{stroke:'#e6ecee','stroke-opacity':.35,'stroke-width':.5});
 var pt=''; for(var x=24;x<350;x+=9) if(x<36||x>112) pt+='M'+x+' 63.2h1.4'; P(b,pt,{stroke:'#1b2023','stroke-width':1.1});
 ENG(b,'M8 46.5H328C346 46.5 364 43 382 35.5');
 ENG(b,'M12 67H368');
 ENG(b,'M6 46V60H13V46M60 47V73M120 47V73M180 47V73M215 47V73M265 47V73M320 47V73',.45,.4);
 P(b,'M360 49.5a3 1.8 0 1 0 6 0a3 1.8 0 1 0-6 0Z',{fill:'#111518'});
 P(b,'M363 51.3V57M360.6 55.4Q363 58.6 365.4 55.4',{stroke:'#2a3034','stroke-width':.8,fill:'none'});
 /* L-61 en la proa */
 TX(b,319.6,63.4,15.5,'L-61',{fill:'#000','fill-opacity':.55,'font-weight':800,'letter-spacing':'.02em'});
 TX(b,319,62.8,15.5,'L-61',{fill:'#f4f6f3','font-weight':800,'letter-spacing':'.02em'});
 TX(b,40,71,4.2,'JUAN CARLOS I',{fill:'#eef1ee','fill-opacity':.7,'font-weight':700,'letter-spacing':'.12em'});
 RIM(b,'M6 42H328C350 42 370 38 391 27',.7);
 /* cubierta de vuelo */
 S.main.push(P(b,CAR.deck,{fill:LG('miDk',[[0,'#5d6468'],[.5,'#3e4448'],[1,'#2c3135']])}));
 var dk=E2('g',{fill:'none'},b);
 P(dk,'M9 41.3H328C349 41.3 369 37.4 390 26.4',{stroke:'#f2f4f0','stroke-width':.45,'stroke-opacity':.75});
 P(dk,'M18 38H332',{stroke:'#eef0ea','stroke-width':.7,'stroke-dasharray':'6 4','stroke-opacity':.85});
 P(dk,'M15 35.4H332',{stroke:'#e2bf3f','stroke-width':.55});
 P(dk,'M340 41.5L346 33.8M355 40L361 32.6M370 36.6L376 29.2M382 32L388 24.2',{stroke:'#c9d0d3','stroke-width':.5,'stroke-opacity':.6});
 P(dk,'M334 38.2C352 37.6 368 33.4 386 25.4',{stroke:'#e2bf3f','stroke-width':.5});
 [44,82,124,168,250,296].forEach(function(x,k){ E2('ellipse',{cx:x,cy:38.3,rx:6.4,ry:1.9,stroke:'#f3f4ef','stroke-width':.55},dk); TX(dk,x-1.2,39.3,2.6,''+(k+1),{fill:'#f3f4ef','fill-opacity':.8,'font-weight':700}); E2('path',{d:'M'+(x-9)+' 40.4H'+(x+9),stroke:'#e2bf3f','stroke-width':.45},dk); });
 /* isla */
 var islF=MT('miIs',['#cfd5d8','#eceff0','#a9b1b5','#868f94','#636c72','#454d52']);
 S.main.push(P(b,CAR.isl,{fill:islF}));
 P(b,'M199 10H257V12.4H199ZM192 17H263V18.6H192Z',{fill:'#fff',opacity:.22});
 P(b,'M207 13h40v3.2h-40ZM250 21h9v2.4h-9ZM195 21h12v2h-12ZM214 28h6v7h-6ZM240 28h5v7h-5Z',{fill:'#0e1316'});
 P(b,'M208 13.6h12',{stroke:'#cfe6f2','stroke-width':.5,'stroke-opacity':.6});
 ENG(b,'M186 25H263M199 10V35M230 5V35',.45,.4);
 P(b,'M207 5V-1H217V5Z',{fill:'#2e3539'}); P(b,'M206.5-1h11v1.3h-11Z',{fill:'#111'});
 /* mástiles, radar, radomos */
 P(b,'M231 5L234-22H237L240 5Z',{fill:'url(#miMs)'});
 P(b,'M232 -4L239 2M232 2L239-4M233-12L238-8M233-8L238-12',{stroke:'#3d464b','stroke-width':.5});
 P(b,'M222-14H249V-12.6H222ZM226-20H245V-18.8H226ZM234.5-30V-22H236.5V-30Z',{fill:'#8e979c'});
 S.rad=E2('g',{transform:'translate(235.5 -24.5)'},b); E2('rect',{x:-9,y:-2.2,width:18,height:4.4,fill:'url(#miMs)',stroke:'#2c3337','stroke-width':.4},S.rad);
 E2('circle',{cx:224,cy:-15.5,r:2.8,fill:'#e9eded'},b); E2('circle',{cx:247,cy:-15.5,r:2.8,fill:'#e9eded'},b);
 P(b,'M213 5V-6H215V5ZM209-6H219V-5H209Z',{fill:'#9aa3a8'}); E2('circle',{cx:214,cy:-9,r:3,fill:'#eef1f1'},b);
 P(b,'M252 11V3H254V11Z',{fill:'#9aa3a8'}); E2('circle',{cx:253,cy:1,r:2.2,fill:'#e9eded'},b);
 /* aeronaves y personal en cubierta */
 S.rot=null;
 CAR.ac.forEach(function(a){ if(a[0]==='h') HARR(b,a[1],39.6); else { var r=HELO(b,a[1],39.6,a[2]); if(r) S.rot=r; } });
 [[70,40.4,'#f1c232'],[88,39.6,'#3d7fd1'],[133,40.6,'#d24a3a'],[186,40.2,'#f1c232'],[205,39.4,'#4e9b47'],[262,40.6,'#f4f4f0'],[318,39.8,'#3d7fd1']].forEach(function(c){ CREW(b,c[0],c[1],c[2]); });
 /* bandera en popa */
 P(b,'M8.5 42V23',{stroke:'#c9cfd2','stroke-width':.7});
 S.flag=FLAG(b,8.8,23.4,10.5,7,1);
 outline(S,CAR.hull); outline(S,CAR.isl); outline(S,CAR.deck);
}
function drawJet(S){
 var fx=S.fx;
 S.ab=E2('g',{opacity:0},fx);
 E2('rect',{x:-19,y:156,width:14,height:POR?62:92,fill:'url(#miAB)',rx:7},S.ab);
 E2('rect',{x:5,y:156,width:14,height:POR?62:92,fill:'url(#miAB)',rx:7},S.ab);
 S.abc=[E2('ellipse',{cx:-11.5,cy:164,rx:7.5,ry:11,fill:'#fff3cf'},S.ab),E2('ellipse',{cx:11.5,cy:164,rx:7.5,ry:11,fill:'#fff3cf'},S.ab)];
 S.trail=E2('rect',{x:-3,y:170,width:6,height:POR?80:170,fill:'url(#miAB)',opacity:.2},fx);
 var b=S.body;
 P(b,JET.body,{fill:'#000',opacity:.42,transform:'translate(9 13)',filter:'url(#miBl)'});
 var wf=LG('miJw',[[0,'#d9dee1'],[.35,'#b3babf'],[.7,'#949ba0'],[1,'#6c7378']],1,1);
 S.main.push(P(b,JET.body,{fill:wf}));
 S.main.push(P(b,JET.can,{fill:LG('miJc',[[0,'#d3d8db'],[1,'#7f878c']],1,1)}));
 var cg=CG(b,1);
 /* gris de dos tonos (camuflaje del Ejército del Aire) */
 P(cg,'M24-4L70 46L58 70L40 72L30 40ZM80 72L112 100V126L72 126L66 98ZM-26 0L-60 38L-82 82L-62 92L-44 60L-28 44ZM-74 104L-112 98V126H-70Z',{fill:'#5f676d',opacity:.3});
 P(cg,'M-9-60L9-60L12 20L-12 30ZM-14 70L14 60L16 120L-16 126Z',{fill:'#5f676d',opacity:.22});
 E2('ellipse',{cx:-40,cy:30,rx:70,ry:46,fill:'url(#miSp)',opacity:.45,transform:'rotate(-30 -40 30)'},cg);
 /* fuselaje: volumen cilíndrico */
 P(b,JET.fus,{fill:LG('miJf',[[0,'#000',.42],[.2,'#000',0],[.42,'#fff',.38],[.52,'#fff',.12],[.78,'#000',0],[1,'#000',.45]],1,0)});
 ENG(b,JET.pan,.55,.5);
 P(b,'M23-14L108 95M-23-14L-108 95',{stroke:'#fff','stroke-width':.8,'stroke-opacity':.4,fill:'none'});
 P(b,JET.pods,{fill:LG('miJp',[[0,'#2c3135'],[.45,'#6b7378'],[1,'#25292c']],1,0)});
 P(b,JET.noz,{fill:LG('miJn',[[0,'#25292c'],[.5,'#7a7f80'],[1,'#202326']],1,0)});
 P(b,'M7 149V160M10 149V160M13 149V160M16 149V160M-7 149V160M-10 149V160M-13 149V160M-16 149V160',{stroke:'#111','stroke-width':.5,'stroke-opacity':.7});
 /* escarapelas España (rojo/amarillo/rojo) */
 [64,-64].forEach(function(x){ E2('circle',{cx:x,cy:76,r:9.5,fill:'#c8102e'},b); E2('circle',{cx:x,cy:76,r:6.6,fill:'#f1bf00'},b); E2('circle',{cx:x,cy:76,r:3.2,fill:'#c8102e'},b); E2('circle',{cx:x,cy:76,r:9.5,fill:'url(#miSp)',opacity:.35},b); });
 /* deriva en ligera perspectiva con la bandera */
 P(b,JET.fin,{fill:LG('miJd',[[0,'#7e868b'],[.5,'#c8ced1'],[1,'#8a9297']],1,0)});
 var fg=E2('g',{transform:'matrix(0 1 1 .32 5.6 120)'},b);
 E2('rect',{x:0,y:0,width:16,height:1.3,fill:'#c8102e'},fg); E2('rect',{x:0,y:1.3,width:16,height:2.6,fill:'#f1bf00'},fg); E2('rect',{x:0,y:3.9,width:16,height:1.3,fill:'#c8102e'},fg);
 ENG(b,'M1.2 142L13 150',.4,.5);
 TX(b,0,0,9,'14-07',{fill:'#1d2226','fill-opacity':.85,'font-weight':700,transform:'translate(-6 -22) rotate(-90)'});
 TX(b,0,0,4.6,'C.16-47',{fill:'#1d2226','fill-opacity':.8,'font-weight':700,transform:'translate(-14 118) rotate(-90)'});
 TX(b,0,0,3.4,'EJÉRCITO DEL AIRE',{fill:'#1d2226','fill-opacity':.6,'font-weight':700,transform:'translate(-17 70) rotate(-90)'});
 P(b,'M30 30L36 36M-30 30L-36 36',{stroke:'#c8102e','stroke-width':.7,'stroke-opacity':.7});
 RIM(b,JET.body,.7);
 /* cabina: vidrio con reflejo */
 P(b,JET.cnp,{fill:RG('miCn',[[0,'#3c6378'],[.55,'#14242e'],[1,'#070c10']],{cx:.38,cy:.32,r:.75}),stroke:'#a8b6be','stroke-width':.9});
 P(b,'M-6.4-118Q0-122 6.4-118M-5.6-99Q0-102 5.6-99',{stroke:'#3d464b','stroke-width':1.1,fill:'none'});
 P(b,'M-3-128C-1-131 3-128 3.6-116',{stroke:'#f2f8ff','stroke-opacity':.85,'stroke-width':1.3,fill:'none','stroke-linecap':'round'});
 S.gl=E2('ellipse',{cx:-2.5,cy:-110,rx:1.6,ry:6,fill:'#fff',opacity:.35},b);
 outline(S,JET.body); outline(S,JET.can);
}
function drawTank(S){
 var fx=S.fx;
 S.dust=[];
 for(var k=0;k<7;k++) S.dust.push(E2('circle',{cx:0,cy:96,r:10,fill:'url(#miDu)',opacity:0},fx));
 S.gnd=E2('rect',{x:-140,y:100,width:660,height:1.4,fill:'url(#miSea)',opacity:0},fx);
 var b=S.body;
 E2('ellipse',{cx:128,cy:100.6,rx:138,ry:5,fill:'url(#miAO)'},b);
 S.main.push(P(b,TNK.trk,{fill:'#24271f'}));
 P(b,'M24 99.2H226',{stroke:'#0d0e0b','stroke-width':1.6,'stroke-dasharray':'1.6 1.8'});
 P(b,'M20 67.6H232',{stroke:'#4a4d40','stroke-width':1.1,'stroke-dasharray':'1.6 1.8'});
 var wg=E2('g',{},b);
 WH.forEach(function(x){ E2('circle',{cx:x,cy:88,r:11,fill:'#1b1d17'},wg); E2('circle',{cx:x,cy:88,r:9,fill:'url(#miWh)'},wg); E2('circle',{cx:x,cy:88,r:6.4,fill:'none',stroke:'#23261d','stroke-width':.6},wg); E2('circle',{cx:x,cy:88,r:4.4,fill:'none',stroke:'#1b1d17','stroke-width':.9,'stroke-dasharray':'.8 1.5'},wg); E2('circle',{cx:x,cy:88,r:2.6,fill:'url(#miWh)',stroke:'#16180f','stroke-width':.5},wg); });
 E2('circle',{cx:14,cy:80,r:11,fill:'url(#miWh)',stroke:'#16180f','stroke-width':1.8,'stroke-dasharray':'2.6 2'},wg); E2('circle',{cx:14,cy:80,r:4,fill:'#2b2e24'},wg);
 E2('circle',{cx:236,cy:79,r:9.5,fill:'url(#miWh)',stroke:'#16180f','stroke-width':1.4},wg); E2('circle',{cx:236,cy:79,r:3,fill:'#2b2e24'},wg);
 var tf=MT('miTk',['#c5c9ab','#dde0c6','#9a9f7c','#767b5b','#4f533c','#30331f']);
 S.main.push(P(b,TNK.hull,{fill:tf}));
 ENG(b,'M200 50.4L249 60.2M10 50.6H44',.5,.5);
 S.main.push(P(b,TNK.skt,{fill:tf}));
 P(b,'M178 52H230L241 58L237 85H178Z',{fill:'#000',opacity:.1});
 P(b,'M20 76.6H178V79H20ZM178 82.4H237.4L237 85H178Z',{fill:'#14160f',opacity:.85});
 ENG(b,'M40 52V76.6M62 52V76.6M84 52V76.6M106 52V76.6M128 52V76.6M150 52V76.6M178 52V85M199 52V85M220 52V85M18 55.4H230',.55,.55);
 P(b,'M24 57H175M24 73H175M182 57H234M182 80H234',{stroke:'#d9dcc6','stroke-opacity':.55,'stroke-width':1.1,'stroke-linecap':'round','stroke-dasharray':'.01 7.3'});
 RIM(b,'M18 52H230L241 58',.6);
 S.main.push(P(b,TNK.tur,{fill:tf}));
 P(b,TNK.wedge,{fill:LG('miTw',[[0,'#d6d9bf'],[.4,'#8e9372'],[1,'#585c43']])});
 ENG(b,'M168 27L180 49L173 53M60 40H168M120 27V53',.5,.5);
 P(b,'M44 33L64 27H168L227 43',{fill:'none',stroke:'#f2f3e4','stroke-opacity':.55,'stroke-width':.7});
 P(b,'M60 49H173L180 49L173 53H60Z',{fill:'#000',opacity:.28});
 /* cañón 120/L55 */
 S.main.push(P(b,TNK.gun,{fill:LG('miTg',[[0,'#3f4331'],[.25,'#bfc4a4'],[.45,'#9ca180'],[.75,'#5d6146'],[1,'#2e3122']])}));
 ENG(b,'M226 41.8V46.2M300 42.1V45.9M340 42.2V45.8M257 39.6V48.4',.5,.55);
 P(b,'M361 38.4h7v3h-7Z',{fill:'#4b4f3a'});
 /* techo: periscopio, visor, ametralladora, lanzafumígenos */
 P(b,'M96 27L98 15H94V9H116V15H110L112 27Z',{fill:MT('miTr',['#c5c9ab','#dde0c6','#9a9f7c','#767b5b','#4f533c','#30331f'])});
 P(b,'M95 9.6h20v2.4H95Z',{fill:'#1a1c14'}); P(b,'M96 10h6v1.4h-6Z',{fill:'#7fc6e6',opacity:.8});
 P(b,'M150 27V20H170L174 27Z',{fill:'url(#miTr)'}); P(b,'M170.6 21L173.4 26.4H170.6Z',{fill:'#6fc0e4'});
 P(b,'M122 27V22H136V27ZM128 21.4h14v1.1h-14Z',{fill:'#3e4232'});
 var sm=E2('g',{transform:'translate(140 28.6) rotate(-12)'},b); for(k=0;k<4;k++){ E2('rect',{x:k*3.1,y:0,width:2.4,height:6,rx:.6,fill:'url(#miTr)',stroke:'#2a2d20','stroke-width':.3},sm); E2('rect',{x:k*3.1+.4,y:-.2,width:1.6,height:1,fill:'#1a1c14'},sm); }
 P(b,TNK.bsk,{fill:'none',stroke:'#c3c9b6','stroke-width':1.4});
 P(b,'M33 36V47M38 35V48M42 34V48M29 40H46',{stroke:'#c3c9b6','stroke-width':.8,fill:'none'});
 /* caja lateral, bandera, número táctico, matrícula ET */
 P(b,'M62 35H94V47H62Z',{fill:'#000',opacity:.12}); ENG(b,'M62 35H94V47H62Z',.5,.5);
 FLAG(b,100,34.5,12,8,0);
 TX(b,126,46.6,10,'213',{fill:'#f0efe4','fill-opacity':.9,'font-weight':800,'letter-spacing':'.06em'});
 E2('rect',{x:183,y:60,width:30,height:6.4,fill:'#ecebdf',stroke:'#1d1f18','stroke-width':.4},b);
 TX(b,198,64.9,4.6,'ET-19473',{'text-anchor':'middle',fill:'#1d1f18','font-weight':700});
 TX(b,60,70,4,'LEOPARD 2E',{fill:'#e9e8d8','fill-opacity':.55,'font-weight':700,'letter-spacing':'.1em'});
 P(b,'M54 33L50-16M64 31L62-6',{stroke:'#cfd5c4','stroke-width':1,fill:'none'});
 S.flag=FLAG(b,62,-6,15,10,1);
 E2('rect',{x:240,y:57,width:5,height:4,fill:'#ffd98a',opacity:.9},b); E2('rect',{x:5,y:54,width:3,height:3,fill:'#b33a2a'},b);
 outline(S,TNK.tur+'M196 41.6L370 42.4V45.6L196 46.4Z'+TNK.skt+TNK.trk); outline(S,TNK.hull);
}

function defsX(d){
 var f=E2('filter',{id:'miBl',x:'-20%',y:'-20%',width:'140%',height:'140%'},d); E2('feGaussianBlur',{stdDeviation:'4'},f);
 LG('miRim',[[0,'#fff',.7],[.3,'#fff',0]]);
 LG('miRef',[[0,'#8fa3ae',.22],[1,'#8fa3ae',0]],0,1);
 RG('miAO',[[0,'#000',.6],[1,'#000',0]]);
 RG('miSp',[[0,'#fff',.55],[1,'#fff',0]]);
 LG('miUD',[[0,'#000',.45],[1,'#000',0]]);
 LG('miFs',[[0,'#fff',.25],[.5,'#fff',0],[1,'#000',.25]],1,0);
 LG('miMs',[[0,'#5f686d'],[.5,'#c7cdd0'],[1,'#4b5357']],1,0);
 LG('miHr',[[0,'#b9c0c5'],[.45,'#868e94'],[1,'#4a5157']]);
 LG('miHe',[[0,'#c9d0d4'],[.4,'#9aa2a7'],[1,'#575f65']]);
 LG('miGl',[[0,'#9cc4d8'],[.4,'#2f4f61'],[1,'#0b141a']]);
 RG('miWh',[[0,'#b2b79a'],[.6,'#6b7056'],[1,'#3a3d2e']],{cx:.38,cy:.32,r:.75});
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
   S.in.setAttribute('transform','translate('+OFF[0][0]+' '+(OFF[0][1]+(RM?0:Math.sin(lt*2.1)*0.9*fxo)).toFixed(2)+')');    if(S.rot){ var ra=RM?0.7:lt*4.4; S.rot[0].setAttribute('transform','translate(18.2 -15.9) scale('+Math.cos(ra).toFixed(3)+' 1)'); S.rot[1].setAttribute('transform','translate(18.2 -15.9) scale('+Math.cos(ra+1.5708).toFixed(3)+' 1)'); }
   S.rad.setAttribute('transform','translate(235.5 -24.5) scale('+(RM?1:Math.cos(lt*1.7)).toFixed(3)+' 1)');
   S.flag.setAttribute('transform','translate(8.8 23.4) skewY('+(RM?0:Math.sin(lt*4.6)*7).toFixed(2)+')'); }
  if(i===1){ var fl=RM?1:0.82+0.18*Math.sin(lt*47)*Math.sin(lt*13);
   S.ab.setAttribute('opacity',(fxo*fl).toFixed(3)); S.trail.setAttribute('opacity',(fxo*.2).toFixed(3));
   S.abc.forEach(function(e){e.setAttribute('ry',(9+3*fl).toFixed(2));});
   S.gl.setAttribute('cy',(-112+(RM?0:Math.sin(lt*.9)*6)).toFixed(2)); var dr=RM?0:Math.sin(lt*1.3)*3*fxo; S.in.setAttribute('transform','translate(0 '+(-dr).toFixed(2)+')'); }
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
