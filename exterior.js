(function(){
"use strict";
// ======================= M.A.T · ESPAÑA EN EL EXTERIOR (#/exterior) =======================
// Despliegues actuales de las FF. AA. españolas fuera de España. Datos: exterior.json.gz
// (EMAD / Ministerio de Defensa y prensa; cada cifra con su fuente y fecha; «—» si no se publica).
var DATA=null, DP=null, WORLD=null, WP=null;
function load(){ if(DP) return DP; DP=Promise.all([window.MAT_GET('exterior.json.gz'),loadW()]).then(function(z){DATA=z[0];return DATA;}).catch(function(e){DP=null;throw e;}); return DP; }
function loadW(){ if(WP) return WP; WP=window.MAT_GET('world.json.gz').then(function(w){ w.c.forEach(function(c){ var x0=999,y0=999,x1=-999,y1=-999; c.R=c.r.map(function(a){ var o=[],x=0,y=0; for(var i=0;i<a.length;i+=2){x+=a[i];y+=a[i+1];var X=x/100,Y=y/100;o.push(X,Y); if(X<x0)x0=X; if(X>x1)x1=X; if(Y<y0)y0=Y; if(Y>y1)y1=Y;} return o;}); c.bb=[x0,y0,x1,y1]; }); WORLD=w; return w; }).catch(function(e){WP=null;throw e;}); return WP; }
var FW={otan:['OTAN','NATO','#6fa3d6'],ue:['UE','EU','#d4ae4c'],onu:['ONU','UN','#7fc8e8'],coal:['Coalición','Coalition','#c98a6b'],bil:['Bilateral','Bilateral','#9fb070']};
var REG={todo:{b:[-84,62,-32,64],es:'Todo',en:'All'},europa:{b:[4,40,35,60],es:'Europa del Este',en:'Eastern Europe'},med:{b:[-8,54,0,47],es:'Mediterráneo y O. Medio',en:'Med & Middle East'},africa:{b:[-24,56,-30,22],es:'África e Índico',en:'Africa & Indian Ocean'}};
var TY=[['caza','Cazas','Fighters'],['heli','Helicópteros','Helicopters'],['avpat','Aviones de patrulla','Patrol aircraft'],['dron','Drones','Drones'],['fragata','Fragatas','Frigates'],['buque','Otros buques','Other ships'],['sub','Submarinos','Submarines'],['aa','Unidades antiaéreas','Air-defence units'],['radar','Radares','Radars'],['veh','Vehículos','Vehicles'],['carro','Carros de combate','Tanks'],['blind','Blindados','Armoured vehicles'],['art','Artillería y morteros','Artillery & mortars'],['misil','Misiles contracarro','Anti-tank missiles']];
var ST={r:'todo',f:'',sel:''};
window.MAT_EXTERIOR=function(app,X){
  var EN=window.MAT_LANG==='en', P=X.P, BY=X.BY, esc=X.esc;
  function L(es,en){return EN?en:es;}
  if(!DATA||!WORLD){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('Cargando despliegues…','Loading deployments…')+'</p>'; load().then(function(){window.MAT_EXTERIOR(app,X);}).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">'+L('No se pudieron cargar los datos. Comprueba la conexión.','Could not load the data. Check your connection.')+'</p>';}); return;}
  var o=X.qs(); if(o.d&&DATA.dep.some(function(d){return d.k===o.d;})) ST.sel=o.d;
  function nf(n){if(n==null) return '—'; var s=String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,EN?',':'.'); return s;}
  function pn(k){var p=P[k]; if(!p) return k; return EN&&window.MAT_T?window.MAT_T(p.n):p.n;}
  function sl(i){var s=DATA.src[i]; return s?'<a href="'+esc(s[1])+'" target="_blank" rel="noopener">'+esc(s[0])+'</a> ('+esc(s[2])+')':'';}
  function vis(d){return !ST.f||(ST.f==='otros'?(d.fw==='coal'||d.fw==='bil'):d.fw===ST.f);}
  var DEP=DATA.dep;
  // totals
  var TT=0,NQ=0,TE={}; DEP.forEach(function(d){ if(d.q!=null) TT+=d.q; else NQ++; d.eq.forEach(function(e){ if(e.c&&e.q!=null) TE[e.t]=(TE[e.t]||0)+e.q; }); });
  var h=X.crumbs([[L('Inicio','Home'),'#/'],[L('España en el exterior','Spain abroad')]]);
  h+='<div data-noi18n class="expg"><h1 style="display:flex;align-items:center;gap:12px"><img class="flag" src="'+(P.espana?P.espana.flag:'flags/es.png')+'" alt=""><span>'+L('España en el exterior','Spain abroad')+'</span></h1>';
  h+='<p class="sub">'+L('Dónde están hoy las Fuerzas Armadas españolas fuera de España, cuántos militares hay y con qué material. Toca un punto del mapa.','Where the Spanish Armed Forces are deployed outside Spain today, how many troops and what equipment. Tap a point on the map.')+'</p>';
  h+='<div class="exsum"><div class="exbig"><b>≈ '+nf(TT)+'</b><span>'+L('militares desplegados con cifra publicada','troops deployed with a published figure')+'</span></div><div class="exbig"><b>'+DEP.length+'</b><span>'+L('despliegues en el mapa','deployments on the map')+'</span></div></div>';
  h+='<div class="exeq">'+TY.filter(function(t){return TE[t[0]];}).map(function(t){ return '<div><b>'+(t[0]==='veh'?'+':'')+nf(TE[t[0]])+'</b><span>'+(EN?t[2]:t[1])+'</span></div>'; }).join('')+'</div>';
  h+='<p class="note exnote">'+L('Suma de las cifras publicadas; '+NQ+' despliegues no tienen cifra de militares («—»). Material: solo unidades contadas por la fuente; los carros Leopardo 2E, los VCI Pizarro o los Centauro no tienen cifra publicada. ','Sum of published figures; '+NQ+' deployments have no troop figure ("—"). Equipment: only units the source counts; Leopard 2E tanks, Pizarro IFVs or Centauros have no published figure. ')+esc(EN?DATA.plan.en:DATA.plan.es)+' <span class="onusrc">'+L('Fuente','Source')+': '+sl(DATA.plan.s)+'</span></p>';
  h+='<div class="chips exreg" role="group">'+Object.keys(REG).map(function(k){return '<button class="chip" data-r="'+k+'" aria-pressed="'+(ST.r===k)+'">'+(EN?REG[k].en:REG[k].es)+'</button>';}).join('')+'</div>';
  h+='<div class="exmapw"><svg id="exmap" viewBox="0 0 1000 700" role="img" aria-label="'+L('Mapa de despliegues','Deployments map')+'"></svg></div>';
  h+='<div class="chips exfw" role="group"><button class="chip" data-f="" aria-pressed="'+(!ST.f)+'">'+L('Todos','All')+'</button>'+['otan','ue','onu','otros'].map(function(k){ var c=k==='otros'?['Otros','Other','#9fb070']:FW[k]; return '<button class="chip" data-f="'+k+'" aria-pressed="'+(ST.f===k)+'"><i class="exdot" style="background:'+c[2]+'"></i>'+(EN?c[1]:c[0])+'</button>';}).join('')+'</div>';
  h+='<div id="excard"></div>';
  h+='<h2>'+L('Todos los despliegues','All deployments')+'</h2><div class="list" id="exlist"></div>';
  h+='<details class="fzcat"><summary><span>'+L('Terminados hace poco','Recently ended')+'</span><span class="cnt">'+DATA.fin.length+'</span></summary><div class="exfin">'+DATA.fin.map(function(f){return '<p>'+esc(EN?f.en:f.es)+' <span class="onusrc">'+L('Fuente','Source')+': '+sl(f.s)+'</span></p>';}).join('')+'</div></details>';
  h+='<p class="note">'+L('Datos a '+esc(DATA.fecha)+'. Fuentes: Estado Mayor de la Defensa (EMAD) y Ministerio de Defensa; la prensa solo para confirmar material. Los despliegues rotan: cada cifra lleva la fecha de su fuente. Cifra no publicada: «—».','Data as of '+esc(DATA.fecha)+'. Sources: Spanish Defence Staff (EMAD) and Ministry of Defence; press only to confirm equipment. Deployments rotate: each figure carries its source date. Unpublished figure: "—".')+'</p></div>';
  X.set(h,L('España en el exterior','Spain abroad'));
  var svg=document.getElementById('exmap'), card=document.getElementById('excard'), list=document.getElementById('exlist');
  var HOST={}; DEP.forEach(function(d){ if(d.p) HOST[d.p]=1; });
  function rad(d){ return d.q!=null?Math.max(7,Math.min(22,4+Math.sqrt(d.q)*0.62)):6; }
  function draw(){
    var b=REG[ST.r].b, mid=(b[2]+b[3])/2, cl=Math.cos(mid*Math.PI/180), dx=(b[1]-b[0])*cl, dy=b[3]-b[2], k=Math.min(1000/dx,700/dy), ox=(1000-dx*k)/2, oy=(700-dy*k)/2;
    function px(lon,lat){ return [ox+(lon-b[0])*cl*k, oy+(b[3]-lat)*k]; }
    var cw=svg.getBoundingClientRect().width||360, u=1000/cw;
    var m=4, s='<rect x="0" y="0" width="1000" height="700" fill="#0d1114"/>';
    WORLD.c.forEach(function(c){ var bb=c.bb; if(bb[2]<b[0]-m||bb[0]>b[1]+m||bb[3]<b[2]-m||bb[1]>b[3]+m) return;
      var d='', tol=0.9*u*0.6; c.R.forEach(function(a){ var lx=-1e9,ly=-1e9,seg='',n=0; for(var i=0;i<a.length;i+=2){ var p=px(a[i],a[i+1]); if(Math.abs(p[0]-lx)+Math.abs(p[1]-ly)<tol&&i<a.length-2) continue; seg+=(n?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1); lx=p[0]; ly=p[1]; n++; } if(n>2) d+=seg+'Z'; });
      if(!d) return; var f=c.k==='espana'?'#4a4122':(HOST[c.k]?'#283126':'#1a1e21'), st=c.k==='espana'?'#b39a4c':(HOST[c.k]?'#55634a':'#30363b');
      s+='<path d="'+d+'" fill="'+f+'" stroke="'+st+'" stroke-width="'+(0.8*u).toFixed(2)+'" stroke-linejoin="round"/>'; });
    var sel=null, PL=[];
    DEP.forEach(function(d){ if(!vis(d)) return; var p=px(d.ll[1],d.ll[0]); if(p[0]<-20||p[0]>1020||p[1]<-20||p[1]>720) return; PL.push({d:d,p:p,q:p.slice()}); });
    var md=20*u, used={}; PL.forEach(function(a,i){ if(used[i]) return; var cl_=[i]; PL.forEach(function(b2,j){ if(j>i&&!used[j]&&Math.abs(b2.p[0]-a.p[0])<md&&Math.abs(b2.p[1]-a.p[1])<md) cl_.push(j); }); if(cl_.length<2) return;
      var cx=0,cy=0; cl_.forEach(function(j){used[j]=1;cx+=PL[j].p[0];cy+=PL[j].p[1];}); cx/=cl_.length; cy/=cl_.length; var R=(13+3*cl_.length)*u;
      cl_.forEach(function(j,n){ var an=-Math.PI/2+2*Math.PI*n/cl_.length; PL[j].q=[cx+R*Math.cos(an),cy+R*Math.sin(an)]; PL[j].moved=1; }); });
    PL.forEach(function(z){ if(z.moved) s+='<line x1="'+z.p[0].toFixed(1)+'" y1="'+z.p[1].toFixed(1)+'" x2="'+z.q[0].toFixed(1)+'" y2="'+z.q[1].toFixed(1)+'" stroke="#9aa0a6" stroke-opacity=".7" stroke-width="'+u.toFixed(2)+'"/><circle cx="'+z.p[0].toFixed(1)+'" cy="'+z.p[1].toFixed(1)+'" r="'+(1.8*u).toFixed(1)+'" fill="#e9e9e6"/>'; });
    PL.forEach(function(z){ var d=z.d, p=z.q; var r=rad(d)*u*0.55, col=FW[d.fw][2], on=ST.sel===d.k;
      var g='<g class="expin" data-k="'+d.k+'" tabindex="0" role="button" aria-label="'+esc(EN?d.mise:d.mis)+'"><circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(Math.max(r,7*u)+8*u).toFixed(1)+'" fill="transparent"/><circle cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+r.toFixed(1)+'" fill="'+col+'" fill-opacity="'+(on?0.95:0.72)+'" stroke="'+(on?'#fff':'#0b0c0d')+'" stroke-width="'+((on?2.2:1.2)*u).toFixed(2)+'"'+(d.est==='susp'?' stroke-dasharray="'+(3*u).toFixed(1)+' '+(2*u).toFixed(1)+'"':'')+'/></g>';
      if(on) sel=[g,p,d]; else s+=g; });
    if(sel){ s+=sel[0]; var lb=(EN?sel[2].ple:sel[2].pl).split(' (')[0], fs=12*u, tw=lb.length*fs*0.56+10*u, lx=Math.min(Math.max(sel[1][0]-tw/2,4),996-tw), ly=sel[1][1]-rad(sel[2])*u*0.55-10*u-fs; if(ly<4) ly=sel[1][1]+rad(sel[2])*u*0.55+8*u;
      s+='<g pointer-events="none"><rect x="'+lx.toFixed(1)+'" y="'+ly.toFixed(1)+'" width="'+tw.toFixed(1)+'" height="'+(fs+8*u).toFixed(1)+'" rx="'+(4*u).toFixed(1)+'" fill="#0b0c0d" fill-opacity=".88" stroke="#55634a" stroke-width="'+u.toFixed(2)+'"/><text x="'+(lx+5*u).toFixed(1)+'" y="'+(ly+fs+2*u).toFixed(1)+'" fill="#e9e9e6" font-size="'+fs.toFixed(1)+'" font-family="-apple-system,Segoe UI,Roboto,Arial,sans-serif">'+esc(lb)+'</text></g>'; }
    svg.innerHTML=s;
  }
  function eqRow(e){ var a=e.id&&BY[e.id];
    var inner='<div class="th">'+(a?X.thumb(a):'<div class="nofoto">'+L('Sin ficha en M.A.T','No M.A.T profile')+'</div>')+'</div><div class="m"><div class="nm">'+esc(EN?e.en:e.es)+'</div><div class="ds">'+(a?esc(a.n)+' · ':'')+L('Fuente','Source')+': '+esc(DATA.src[e.s]?DATA.src[e.s][0].split(' · ')[0]:'')+' ('+esc(e.f||'')+')'+(e.c?'':' · <span class="exnc">'+L('no sumado al total','not in totals')+'</span>')+'</div></div><div class="rt">'+(e.qt?esc(EN?e.qt.replace('hasta','up to').replace('más de','over').replace('cerca de','about'):e.qt):nf(e.q))+'</div>';
    return a?'<a class="row exeqr" href="#/a/'+a.id+'">'+inner+'</a>':'<div class="row exeqr onunolink">'+inner+'</div>'; }
  function showCard(k,scroll){ var d=DEP.filter(function(x){return x.k===k;})[0]; if(!d){card.innerHTML='';return;}
    var fw=FW[d.fw], c='<article class="excard" aria-live="polite"><div class="exch">'+(d.p?X.flag(d.p,'flag'):'<span class="exsea">⚓</span>')+'<div><div class="exk" style="color:'+fw[2]+'">'+esc(EN?d.fwne:d.fwn)+'</div><h3>'+esc(EN?d.mise:d.mis)+'</h3><div class="ds">'+esc((d.p?pn(d.p)+' · ':'')+(EN?d.ple:d.pl))+' · '+L('desde ','since ')+esc(d.ini)+(d.est==='susp'?' · <b class="exsusp">'+L('en suspenso','on hold')+'</b>':'')+'</div></div><button class="exx" aria-label="'+L('Cerrar','Close')+'">×</button></div>';
    c+='<div class="extro"><b>'+(d.q!=null?esc(EN?(d.qt||'').replace('más de','over').replace('hasta','up to').replace(' observadores',' observers'):d.qt||nf(d.q)):'—')+'</b><span>'+L('militares','troops')+(d.q!=null?' · '+esc(EN?d.qfe:d.qf):' · '+L('cifra no publicada','figure not published'))+'</span></div>';
    c+='<div class="kicker">'+L('Material desplegado','Equipment deployed')+'</div>'+(d.eq.length?'<div class="list">'+d.eq.map(eqRow).join('')+'</div>':'<p class="sub" style="margin:6px 0">— '+L('(la fuente no publica el material)','(the source does not publish the equipment)')+'</p>');
    c+='<p class="exn">'+esc(EN?d.ne:d.n)+'</p>'+(d.onu?'<p class="exn"><a class="tag" href="#/onu">'+L('Material de UNIFIL en la sección ONU ›','UNIFIL equipment in the UN section ›')+'</a></p>':'');
    c+='<p class="exsrc">'+L('Fuente','Source')+': '+d.src.map(sl).join(' · ')+'</p><p class="exsrc">'+L('Datos a ','Data as of ')+esc(d.d)+'</p></article>';
    card.innerHTML=c; card.querySelector('.exx').onclick=function(){ ST.sel=''; card.innerHTML=''; draw(); };
    if(scroll){ var r=card.getBoundingClientRect(); if(r.top>window.innerHeight-120||r.top<0) window.scrollTo({top:window.scrollY+r.top-70,behavior:'smooth'}); } }
  function inReg(d,r){ var b=REG[r].b; return d.ll[1]>=b[0]&&d.ll[1]<=b[1]&&d.ll[0]>=b[2]&&d.ll[0]<=b[3]; }
  function pick(k,scroll,fromList){ ST.sel=k; var d=DEP.filter(function(x){return x.k===k;})[0]; if(fromList&&d&&!inReg(d,ST.r)){ ST.r=['europa','med','africa','todo'].filter(function(r){return inReg(d,r);})[0]||'todo'; syncChips(); }
    draw(); showCard(k,scroll); try{history.replaceState(null,'','#/exterior?d='+k);}catch(e){} }
  function syncChips(){ app.querySelectorAll('.exreg .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-r')===ST.r));}); app.querySelectorAll('.exfw .chip').forEach(function(b){b.setAttribute('aria-pressed',String(b.getAttribute('data-f')===ST.f));}); }
  function drawList(){ var L2=DEP.filter(vis).slice().sort(function(a,b){return (b.q==null?-1:b.q)-(a.q==null?-1:a.q);});
    list.innerHTML=L2.map(function(d){ var fw=FW[d.fw]; return '<button class="row exrow" data-k="'+d.k+'">'+(d.p?X.flag(d.p,'flag'):'<span class="exsea">⚓</span>')+'<div class="m"><div class="nm">'+esc(EN?d.mise:d.mis)+'</div><div class="ds"><i class="exdot" style="background:'+fw[2]+'"></i>'+esc(EN?fw[1]:fw[0])+' · '+esc((d.p?pn(d.p)+' · ':'')+(EN?d.ple:d.pl).split(' (')[0])+(d.eq.length?' · '+d.eq.length+' '+L(d.eq.length>1?'medios':'medio',d.eq.length>1?'items':'item'):'')+'</div></div><div class="rt">'+(d.q!=null?nf(d.q):'—')+'</div></button>'; }).join(''); }
  svg.addEventListener('click',function(ev){ var g=ev.target.closest&&ev.target.closest('.expin'); if(g) pick(g.getAttribute('data-k'),true,false); });
  svg.addEventListener('keydown',function(ev){ if(ev.key!=='Enter'&&ev.key!==' ') return; var g=ev.target.closest&&ev.target.closest('.expin'); if(g){ev.preventDefault(); pick(g.getAttribute('data-k'),true,false);} });
  list.addEventListener('click',function(ev){ var b=ev.target.closest('.exrow'); if(b){ pick(b.getAttribute('data-k'),false,true); window.scrollTo({top:Math.max(0,window.scrollY+svg.getBoundingClientRect().top-70),behavior:'smooth'}); } });
  app.querySelectorAll('.exreg .chip').forEach(function(b){ b.onclick=function(){ ST.r=b.getAttribute('data-r'); syncChips(); draw(); }; });
  app.querySelectorAll('.exfw .chip').forEach(function(b){ b.onclick=function(){ ST.f=b.getAttribute('data-f'); syncChips(); draw(); drawList(); }; });
  draw(); drawList(); if(ST.sel) showCard(ST.sel,false);
};
})();
