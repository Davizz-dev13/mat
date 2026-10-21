(function(){
"use strict";
// ============ M.A.T · Gasto militar por país (#/gasto + bloque en cada país) ============
// Datos: gasto.json.gz (SIPRI Military Expenditure Database 2026 + tablas de la OTAN 2025). Euros: SIPRI en moneda local (países del euro) o US$/tipo medio anual del BCE (fx).
// Solo cifras publicadas por las fuentes; sin dato = «—». No se mezcla con inventario ni Duelo.
var D=null, DP=null, Q={}, QN=0;
function EN(){return window.MAT_LANG==='en';}
function e(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function TT(s){return window.MAT_T?window.MAT_T(s):s;}
function P(){return (window.MAT_DATA&&window.MAT_DATA.meta&&window.MAT_DATA.meta.paises)||{};}
function nm(k){var p=P()[k]; return p?TT(p.n).split(' (')[0]:k;}
function fl(k){var p=P()[k]; return p?'<img class="mini" src="'+e(p.flag)+'" alt="" loading="lazy">':'';}
function css(){ if(document.getElementById('gasto-css')) return; var s=document.createElement('style'); s.id='gasto-css';
 s.textContent='.gsbox{border:1px solid var(--line);border-radius:var(--r);padding:10px 12px 12px;margin:14px 0;background:var(--s1)}'+
 '.gsbox h3{margin:0 0 8px}.gsgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
 '.gsc{background:var(--s2);border-radius:4px;padding:8px 9px;min-width:0}.gsc span{display:block;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--dim)}'+
 '.gsc b{display:block;font-size:18px;font-variant-numeric:tabular-nums;color:#d6b25e;overflow-wrap:anywhere}.gsc i{display:block;font-style:normal;font-size:11px;color:var(--mu)}'+
 '.gssrc{font-size:12px;color:var(--mu);margin:8px 0 0;line-height:1.45}.gssrc a{color:var(--ac2)}'+
 '.gsnato{font-size:13px;margin:8px 0 0;padding:8px 9px;border-left:3px solid #7aa7d6;background:var(--s2);border-radius:0 4px 4px 0;line-height:1.45}'+
 '.gsnote{font-size:13px;margin:8px 0 0;line-height:1.45;color:var(--tx)}.gsfn{font-size:12px;color:var(--mu);margin-top:6px}.gsfn summary{cursor:pointer;color:var(--ac2)}'+
 '.gsrank{display:inline-block;font-size:12px;color:var(--tx);background:#2b2f22;border:1px solid #4a5236;border-radius:999px;padding:2px 9px;margin:0 0 8px}'+
 '.gsrow{display:flex;align-items:center;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line);text-decoration:none;color:var(--tx)}'+
 '.gsrow .rk{width:30px;flex:0 0 30px;text-align:right;color:var(--dim);font-variant-numeric:tabular-nums;font-size:13px}'+
 '.gsrow .flag{width:30px;height:20px;flex:0 0 30px;object-fit:cover;border:1px solid var(--line);border-radius:2px}'+
 '.gsrow .m{flex:1;min-width:0}.gsrow .n{font-weight:600;font-size:15px;line-height:1.2;overflow-wrap:anywhere}'+
 '.gsrow .br{height:5px;background:var(--s2);border-radius:3px;margin-top:5px;overflow:hidden}.gsrow .br i{display:block;height:100%;background:#6f7a4e}'+
 '.gsrow .v{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}.gsrow .v b{display:block;font-size:14px;color:#d6b25e}.gsrow .v span{font-size:11px;color:var(--mu)}'+
 '.gsrow.es{background:#1b1f15}.gsest{color:#7aa7d6;font-size:11px;margin-left:4px}.gsunc{color:#d68a7a;font-size:11px;margin-left:4px}'+
 '.gstabs{margin:10px 0 6px}.gstabs .chip{text-decoration:none}.gstabs .chip[aria-pressed="true"]{border-color:var(--ac2);color:var(--tx);background:#22261c}'+
 '.gslist2 .gsrow .v b{color:var(--tx)}.gsfx{margin:2px 0 10px}';
 document.head.appendChild(s); }
function load(){ if(DP) return DP; DP=window.MAT_GET('gasto.json.gz').then(function(d){D=d; fill(); setTimeout(fill,600); window.addEventListener('hashchange',function(){setTimeout(fill,0);}); return d;}); DP.catch(function(){}); return DP; }
// --- formato ---
function nfx(v,dec){ if(v==null||isNaN(v)) return '—'; var s=Number(v).toFixed(dec||0), p=s.split('.'), i=p[0].replace(/\B(?=(\d{3})+(?!\d))/g,EN()?',':'.'); return p[1]?i+(EN()?'.':',')+p[1]:i; }
function mill(v){ if(v==null) return '—'; return nfx(v,v<10?1:0); }
function usd(v){ return v==null?'—':(EN()?'US$ '+mill(v)+' million':mill(v)+' millones US$'); }
function eur(v){ return v==null?'—':(EN()?'€'+mill(v)+' million':mill(v)+' millones €'); }
function pct(v){ return v==null?'—':nfx(v,2)+(EN()?'%':' %'); }
function bn(v){ if(v==null) return ''; return v>=1000?(EN()?'≈ €'+nfx(v/1000,1)+' billion':'≈ '+nfx(v/1000,1)+' mil millones €'):''; }
function me(v){ return v==null?'—':(EN()?'€'+mill(v)+' M':mill(v)+' M€'); }
function mu(v){ return v==null?'—':(EN()?'US$'+mill(v)+' M':mill(v)+' M US$'); }
function rate(y){ var r=D.fx&&D.fx.r[String(y)]; return r==null?null:r; }
function rateTxt(y){ var r=rate(y); return r==null?'':(EN()?'€1 = US$'+nfx(r,4):'1 € = '+nfx(r,4)+' US$'); }
function srcFx(){ return D.fx?'<a href="'+e(D.fx.src.url)+'" target="_blank" rel="noopener">'+(EN()?'ECB':'BCE')+'</a>':''; }
function eNote(r){ return r.es==='l'?(EN()?'SIPRI figure in euros (local currency)':'cifra de SIPRI en euros (moneda local)'):r.es==='c'?(EN()?'converted from US$ at the ECB '+r.y+' annual average ('+rateTxt(r.y)+')':'convertido de US$ con el tipo medio del BCE de '+r.y+' ('+rateTxt(r.y)+')'):''; }
function fxLine(){ return D.fx?'<p class="gssrc gsfx">'+(EN()?'Euro conversion: euro-area countries use SIPRI\'s own figure in euros; all others are converted from SIPRI\'s current US$ with the ECB annual average rate of the same year ('+LY+': '+rateTxt(LY)+'). Source: ':'Conversión a euros: los países del euro usan la cifra de SIPRI en euros; el resto se convierte desde los US$ corrientes de SIPRI con el tipo medio anual del BCE del mismo año ('+LY+': '+rateTxt(LY)+'). Fuente: ')+srcFx()+'.</p>':''; }
function flg(f){ return f==='e'?'<span class="gsest" title="">'+(EN()?'SIPRI estimate':'estimación SIPRI')+'</span>':f==='u'?'<span class="gsunc">'+(EN()?'highly uncertain':'dato muy incierto')+'</span>':''; }
function srcS(){ return '<a href="'+e(D.src.sipri.url)+'" target="_blank" rel="noopener">SIPRI Military Expenditure Database</a>'; }
function srcN(){ return '<a href="'+e(D.src.nato.url)+'" target="_blank" rel="noopener">'+(EN()?'NATO, Defence Expenditure of NATO Countries (2014-2025)':'OTAN, Defence Expenditure of NATO Countries (2014-2025)')+'</a>'; }
var LY=2025;
function ranked(by){ var L=[]; for(var k in D.p){ var r=D.p[k]; if(r.y!==LY||!(r.e>0)) continue; if(by==='g'&&r.g==null) continue; if(by==='pc'&&r.pce==null) continue; L.push(k);} 
  L.sort(function(a,b){var x=D.p[a],y=D.p[b]; return (by==='g'?y.g-x.g:by==='pc'?y.pce-x.pce:y.e-x.e);}); return L; }
// --- bloque de un país ---
function blockHTML(k,cls){ var r=D.p[k], h='<div class="gsbox" data-noi18n><h3 class="'+(cls||'mph3')+'">'+(EN()?'Military expenditure':'Gasto militar')+'</h3>';
  if(!r){ return h+'<p class="gssrc">— '+(EN()?'SIPRI publishes no military-expenditure figures for this country.':'SIPRI no publica cifras de gasto militar para este país.')+' '+srcS()+'</p></div>'; }
  if(r.usd===0||r.e===0){ return h+'<p class="gsnote">'+(EN()?'0 — SIPRI records no military expenditure: the country has no armed forces.':'0 — SIPRI no registra gasto militar: el país no tiene fuerzas armadas.')+'</p>'+fnHTML(r)+'<p class="gssrc">'+srcS()+' · '+r.y+'</p></div>'; }
  if(r.y===LY){ var rk=ranked('usd').indexOf(k); if(rk>=0) h+='<span class="gsrank">'+(EN()?'No. '+(rk+1)+' of '+ranked('usd').length+' by total ('+LY+')':'N.º '+(rk+1)+' de '+ranked('usd').length+' en total ('+LY+')')+'</span>'; }
  h+='<div class="gsgrid">';
  h+='<div class="gsc"><span>'+(EN()?'Total':'Total')+'</span><b>'+me(r.e)+'</b><i>'+(EN()?'million €':'millones de €')+(bn(r.e)?' · '+bn(r.e):'')+'</i>'+flg(r.uf)+'</div>';
  h+='<div class="gsc"><span>'+(EN()?'Share of GDP':'% del PIB')+'</span><b>'+pct(r.g)+'</b>'+flg(r.gf)+'</div>';
  h+='<div class="gsc"><span>'+(EN()?'Per inhabitant':'Por habitante')+'</span><b>'+(r.pce!=null?(EN()?'€'+nfx(r.pce):nfx(r.pce)+' €'):'—')+'</b><i>'+(EN()?'euros':'euros')+'</i>'+flg(r.pcf)+'</div>';
  h+='<div class="gsc"><span>'+(EN()?'Original figure':'Cifra original')+'</span><b style="font-size:14px;color:var(--tx)">'+mu(r.usd)+'</b><i>'+(EN()?'current US$, SIPRI':'US$ corrientes, SIPRI')+(r.pc!=null?' · '+(EN()?'US$'+nfx(r.pc)+' per inh.':nfx(r.pc)+' US$/hab.'):'')+'</i></div>';
  h+='</div><p class="gssrc">'+e(eNote(r))+(r.es==='c'?' · '+srcFx():'')+'</p><p class="gssrc">'+(EN()?'Year ':'Año ')+'<b>'+r.y+'</b>'+(r.y<LY?(EN()?' (latest year SIPRI has)':' (último año con dato en SIPRI)'):'')+' · '+(EN()?'Source: ':'Fuente: ')+srcS()+' (2026)</p>';
  if(r.s&&r.s.length) h+='<p class="gssrc">'+r.s.map(function(c){var t=D.sym[c]; return t?(EN()?'SIPRI: figures '+t[1]+'.':'SIPRI: la cifra '+t[0]+'.'):'';}).join(' ')+'</p>';
  if(r.nato){ var n=r.nato; h+='<div class="gsnato"><b>'+(EN()?'NATO':'OTAN')+' '+n.y+(n.e?(EN()?' (estimate)':' (estimación)'):'')+':</b> '+eur(n.eur!=null?n.eur:n.ec)+' · '+pct(n.g)+(EN()?' of GDP':' del PIB')+'<br><span class="gssrc" style="margin:0">'+(n.eur!=null?(EN()?'NATO figure in euros (national currency)':'cifra de la OTAN en euros (moneda nacional)'):(EN()?'converted from NATO US$ '+mu(n.usd)+' at the ECB '+n.y+' average ('+rateTxt(n.y)+')':'convertido de '+mu(n.usd)+' de la OTAN con el tipo medio del BCE de '+n.y+' ('+rateTxt(n.y)+')'))+' · '+srcN()+'</span></div>'; }
  var nt=D.nota&&D.nota[k]; if(nt) h+='<p class="gsnote">'+e(EN()?nt[1]:nt[0])+'</p>';
  h+=fnHTML(r);
  h+='<div class="btns" style="margin-top:8px"><a class="btn" href="#/gasto">'+(EN()?'World ranking':'Ranking mundial')+'</a></div>';
  return h+'</div>'; }
function fnHTML(r){ if(!r.fn||!r.fn.length) return ''; return '<details class="gsfn"><summary>'+(EN()?'SIPRI note':'Nota de SIPRI (original en inglés)')+'</summary>'+r.fn.map(function(n){return '<p lang="en">'+e(D.fn[n]||'')+'</p>';}).join('')+'</details>'; }
// marcador que se rellena al cargar los datos
function ph(fn){ var id=++QN; Q[id]=fn; if(D) return fn(); load(); return '<div class="gsph" data-gid="'+id+'"><p class="note">'+(EN()?'Loading military expenditure…':'Cargando gasto militar…')+'</p></div>'; }
function fill(){ var L=document.querySelectorAll('.gsph[data-gid]'); for(var i=0;i<L.length;i++){ var el=L[i], f=Q[el.getAttribute('data-gid')]; if(f){ var d=document.createElement('div'); d.innerHTML=f(); el.replaceWith.apply(el,[].slice.call(d.childNodes)); } } }
// --- comparación en #/fuerzas (A vs B) ---
function sum(m){ var t=0,n=0; m.forEach(function(k){var r=D.p[k]; if(r&&r.y===LY&&r.e>0){t+=r.e;n++;}}); return {t:t,n:n}; }
function cmpHTML(A,B){ var h='<h2 data-noi18n>'+(EN()?'Military expenditure (SIPRI, '+LY+')':'Gasto militar (SIPRI, '+LY+')')+'</h2><div data-noi18n>';
  var sa=sum(A.m), sb=sum(B.m);
  function bar(va,vb,lab,f){ var mx=Math.max(va||0,vb||0)||1; return '<div class="fzrow"><div class="fzl">'+lab+'</div><div class="fzb"><div class="fzv a'+((va||0)>(vb||0)?' w':'')+'"><span>'+(va==null?'—':f(va))+'</span><i style="width:'+((va||0)/mx*100).toFixed(1)+'%"></i></div><div class="fzv b'+((vb||0)>(va||0)?' w':'')+'"><i style="width:'+((vb||0)/mx*100).toFixed(1)+'%"></i><span>'+(vb==null?'—':f(vb))+'</span></div></div></div>'; }
  h+=bar(sa.n?sa.t:null,sb.n?sb.t:null,EN()?'Total, million €':'Total, millones de €',mill);
  function one(sd){ return sd.m.length===1&&D.p[sd.m[0]]&&D.p[sd.m[0]].y===LY?D.p[sd.m[0]]:null; }
  var ra=one(A), rb=one(B);
  if(A.m.length===1&&B.m.length===1){ h+=bar(ra&&ra.g,rb&&rb.g,EN()?'Share of GDP':'% del PIB',function(v){return pct(v);}); h+=bar(ra&&ra.pce,rb&&rb.pce,EN()?'Per inhabitant, €':'Por habitante, €',function(v){return nfx(v);}); }
  var nn=[]; [A,B].forEach(function(sd){ if(sd.m.length>1){ var s=sum(sd.m); nn.push(e(TT(sd.n))+': '+(EN()?'sum of the '+s.n+' of '+sd.m.length+' members with a '+LY+' figure':'suma de los '+s.n+' de '+sd.m.length+' miembros con dato de '+LY)); } else if(!one(sd)) nn.push(e(TT(sd.n))+': '+(EN()?'no '+LY+' figure in SIPRI (see its block)':'sin dato de '+LY+' en SIPRI (ver su bloque)')); });
  h+='<p class="note">'+(EN()?'Euros, SIPRI Military Expenditure Database (2026); outside the euro area converted from current US$ at the ECB '+LY+' average ('+rateTxt(LY)+'). ':'Euros, SIPRI Military Expenditure Database (2026); fuera del euro, convertido desde US$ corrientes con el tipo medio del BCE de '+LY+' ('+rateTxt(LY)+'). ')+nn.join(' · ')+'</p>';
  [A,B].forEach(function(sd){ if(sd.m.length===1) h+='<details class="fzcat"><summary><span>'+fl(sd.m[0])+e(TT(sd.n))+(EN()?' · military expenditure':' · gasto militar')+'</span><span class="cnt">'+(EN()?'see':'ver')+'</span></summary>'+blockHTML(sd.m[0],'mph3')+'</details>'; });
  return h+'</div>'; }
// --- una facción sola en #/fuerzas (sin comparación) ---
function soloHTML(S){ var s=sum(S.m), h='<h2 data-noi18n>'+(EN()?'Military expenditure (SIPRI, '+LY+')':'Gasto militar (SIPRI, '+LY+')')+'</h2><div class="gsbox" data-noi18n><div class="gsgrid"><div class="gsc"><span>'+(EN()?'Total of members':'Total de los miembros')+'</span><b>'+(s.n?me(s.t):'—')+'</b><i>'+(EN()?'million €':'millones de €')+(s.n&&bn(s.t)?' · '+bn(s.t):'')+'</i></div></div>';
  h+='<p class="gssrc">'+(EN()?'Sum of the '+s.n+' of '+S.m.length+' members with a '+LY+' figure. ':'Suma de los '+s.n+' de '+S.m.length+' miembros con dato de '+LY+'. ')+e(EN()?'Euro-area members: SIPRI figure in euros; others converted from US$ at the ECB '+LY+' average ('+rateTxt(LY)+').':'Miembros del euro: cifra de SIPRI en euros; el resto, convertido de US$ con el tipo medio del BCE de '+LY+' ('+rateTxt(LY)+').')+' '+srcS()+' · '+srcFx()+'</p>';
  h+='<div class="btns" style="margin-top:8px"><a class="btn" href="#/gasto">'+(EN()?'World ranking':'Ranking mundial')+'</a></div></div>';
  return h; }
// --- ranking #/gasto ---
function route(app,X){ css(); if(!D){ X.set(X.crumbs([['Inicio','#/'],['Gasto militar']])+'<p class="sub" style="padding:24px 0">'+(EN()?'Loading…':'Cargando…')+'</p>',EN()?'Military expenditure':'Gasto militar'); load().then(function(){route(app,X);}).catch(function(){app.innerHTML='<p class="sub" style="padding:24px 0">No se pudieron cargar los datos. Comprueba la conexión.</p>';}); return; }
  var o=X.qs(), by=o.o==='g'||o.o==='pc'?o.o:'usd';
  var L=ranked(by), mx=L.length?(by==='g'?D.p[L[0]].g:by==='pc'?D.p[L[0]].pce:D.p[L[0]].e):1;
  var h=X.crumbs([['Inicio','#/'],['Gasto militar']])+'<div data-noi18n><h1>'+(EN()?'Military expenditure by country':'Gasto militar por país')+'</h1>';
  h+='<p class="sub">'+(EN()?'What each country spends on its armed forces in '+LY+', in euros, as a share of its GDP and per inhabitant. Only published figures: SIPRI for every country, and NATO for its members as a second reference. No figure = “—”.':'Lo que gasta cada país en sus fuerzas armadas en '+LY+', en euros, en % de su PIB y por habitante. Solo cifras publicadas: SIPRI para todos los países y la OTAN para sus miembros como segunda referencia. Sin dato = «—».')+'</p>';
  h+='<div class="chips gstabs" role="group" aria-label="'+(EN()?'Sort':'Ordenar')+'">'+[['usd',EN()?'Total (€)':'Total (€)'],['g',EN()?'% of GDP':'% del PIB'],['pc',EN()?'Per inhabitant':'Por habitante']].map(function(t){return '<a class="chip" href="#/gasto'+(t[0]==='usd'?'':'?o='+t[0])+'" aria-pressed="'+(by===t[0])+'">'+t[1]+'</a>';}).join('')+'</div>';
  h+='<p class="note" style="margin:4px 0 6px">'+L.length+(EN()?' countries with a '+LY+' figure · tap one to see it next to its arsenal':' países con dato de '+LY+' · toca uno para verlo junto a su arsenal')+'</p>'+fxLine()+'<div class="gslist">';
  var Pm=P();
  L.forEach(function(k,i){ var r=D.p[k], v=by==='g'?r.g:by==='pc'?r.pce:r.e, w=Math.max(1,v/mx*100);
    var main=by==='g'?pct(r.g):by==='pc'?(EN()?'€'+nfx(r.pce):nfx(r.pce)+' €'):me(r.e);
    var sec=by==='usd'?pct(r.g):me(r.e);
    var f=(by==='g'?r.gf:by==='pc'?r.pcf:r.uf);
    h+='<a class="gsrow'+(k==='espana'?' es':'')+'" href="#/fuerzas?a=p:'+k+'"><span class="rk">'+(i+1)+'</span>'+(Pm[k]?'<img class="flag" src="'+e(Pm[k].flag)+'" alt="" loading="lazy">':'')+'<div class="m"><div class="n">'+e(nm(k))+(f==='e'?'<span class="gsest">e</span>':f==='u'?'<span class="gsunc">?</span>':'')+'</div><div class="br"><i style="width:'+w.toFixed(1)+'%"></i></div></div><div class="v"><b>'+main+'</b><span>'+sec+'</span></div></a>'; });
  h+='</div><p class="note"><span class="gsest">e</span> '+(EN()?'SIPRI estimate':'estimación de SIPRI')+' · <span class="gsunc">?</span> '+(EN()?'highly uncertain figure (SIPRI)':'dato muy incierto según SIPRI')+'. '+(EN()?'Figures in millions of euros (M).':'Cifras en millones de euros (M€).')+'</p>';
  // España: nota SIPRI vs OTAN
  if(D.nota&&D.nota.espana) h+='<h2>'+fl('espana')+(EN()?'Spain: SIPRI vs NATO':'España: SIPRI frente a OTAN')+'</h2>'+blockHTML('espana','mph3');
  // sin dato del último año
  var old=[], zero=[]; for(var k in D.p){ var r=D.p[k]; if(r.usd===0) zero.push(k); else if(r.y!==LY) old.push(k); }
  old.sort(function(a,b){return D.p[b].y-D.p[a].y||nm(a).localeCompare(nm(b));});
  if(old.length){ h+='<h2>'+(EN()?'No '+LY+' figure: latest year available':'Sin dato de '+LY+': último año disponible')+'</h2><div class="gslist2">'+old.map(function(k){var r=D.p[k]; return '<a class="gsrow" href="#/fuerzas?a=p:'+k+'"><span class="rk"></span>'+(Pm[k]?'<img class="flag" src="'+e(Pm[k].flag)+'" alt="" loading="lazy">':'')+'<div class="m"><div class="n">'+e(nm(k))+(r.uf==='e'?'<span class="gsest">e</span>':r.uf==='u'?'<span class="gsunc">?</span>':'')+'</div></div><div class="v"><b>'+me(r.e)+'</b><span>'+r.y+(r.g!=null?' · '+pct(r.g):'')+'</span></div></a>';}).join('')+'</div>'; }
  if(zero.length) h+='<h2>'+(EN()?'No military expenditure (SIPRI)':'Sin gasto militar (SIPRI)')+'</h2><p class="sub">'+zero.map(function(k){return fl(k)+e(nm(k));}).join(' · ')+'. '+(EN()?'SIPRI records 0: no armed forces.':'SIPRI registra 0: no tienen fuerzas armadas.')+'</p>';
  if(D.none&&D.none.length) h+='<h2>'+(EN()?'Not covered by SIPRI':'Sin datos en SIPRI')+'</h2><p class="sub">'+D.none.filter(function(k){return Pm[k];}).map(function(k){return fl(k)+e(nm(k));}).join(' · ')+' — «—».</p>';
  h+='<h2>'+(EN()?'Sources':'Fuentes')+'</h2><p class="gssrc">'+srcS()+': '+e(D.src.sipri.t)+' · <a href="'+e(D.src.sipri.file)+'" target="_blank" rel="noopener">'+(EN()?'data file (xlsx)':'archivo de datos (xlsx)')+'</a><br>'+srcN()+(EN()?' — NATO members only; 2024 and 2025 are NATO estimates; % of GDP per NATO’s Table 3; euro members in euros as NATO publishes them (Table 1, national currency).':' — solo miembros de la OTAN; 2024 y 2025 son estimaciones de la OTAN; % del PIB según su tabla 3; los miembros del euro, en euros tal como los publica la OTAN (tabla 1, moneda nacional).')+'<br>'+(D.fx?'<a href="'+e(D.fx.src.url)+'" target="_blank" rel="noopener">'+e(EN()?D.fx.src.ten:D.fx.src.t)+'</a>: '+Object.keys(D.fx.r).map(function(y){return y+' '+nfx(D.fx.r[y],4);}).join(' · ')+(EN()?' (US$ per €)':' (US$ por €)')+'<br>':'')+(EN()?'Consulted ':'Consultado el ')+e(D.acc)+'. '+(EN()?'SIPRI and NATO use different definitions, so their figures for the same country can differ. Euro-area countries: SIPRI’s own figure in euros. Other countries: SIPRI current US$ divided by the ECB annual average rate of the same year (per-inhabitant figures likewise). The original US$ figure stays visible in each country’s block.':'SIPRI y la OTAN usan definiciones distintas, por eso sus cifras para un mismo país pueden diferir. Países del euro: cifra de SIPRI en euros. Resto de países: US$ corrientes de SIPRI divididos por el tipo medio anual del BCE del mismo año (igual el gasto por habitante). La cifra original en US$ sigue visible en el bloque de cada país.')+'</p></div>';
  X.set(h,EN()?'Military expenditure':'Gasto militar'); }
window.MAT_GASTO={load:load,route:route,block:function(k,cls){css(); return ph(function(){return blockHTML(k,cls);});},cmp:function(A,B){css(); return ph(function(){return cmpHTML(A,B);});},solo:function(S){css(); return ph(function(){return soloHTML(S);});}};
if(window.MAT_GET) load();
})();
